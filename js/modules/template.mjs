// =========================================================
// jquan.mjs  ——  终极常用合集（单文件／零依赖）
// =========================================================
import { readFileSync } from 'node:fs'
import { resolve, dirname, isAbsolute } from 'node:path'

/* --------------- 0. 过滤器大全 --------------- */
const filters = {
  upper:    s => String(s).toUpperCase(),
  lower:    s => String(s).toLowerCase(),
  truncate: (s, n = 30) => String(s).length > n ? String(s).slice(0, n) + '…' : s,
  date:     (s, fmt = 'yyyy-MM-dd') => {
    const d = new Date(s)
    const obj = { yyyy: d.getFullYear(), MM: String(d.getMonth()+1).padStart(2,0), dd: String(d.getDate()).padStart(2,0) }
    return fmt.replace(/yyyy|MM|dd/g, m => obj[m])
  },
  json:     s => JSON.stringify(s),
  raw:      s => String(s),               // 关闭转义
  escape:   s => String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;'),
  repeat:   (s, n = 1) => String(s).repeat(n),
  default:  (s, alt = '') => s || alt
}

/* --------------- 1. 词法 新增 8 种标签 --------------- */
const RE = /\{jquan:(\w+)(?:\s+([^}]*))?\}|\{\/jquan:(\w+)\}|\{jquan:([\w./]+(?:\|[\w,:]+)?)\}/gs
function tokenize(t) {
  const tok = []; let last = 0, m
  while ((m = RE.exec(t)) !== null) {
    if (m.index > last) tok.push({ type:'text', val: t.slice(last, m.index) })
    if (m[1])       tok.push({ type:'open',  name: m[1], raw: m[2]||'' })
    else if (m[3])  tok.push({ type:'close', name: m[3] })
    else if (m[4])  tok.push({ type:'var',   expr: m[4] })
    last = RE.lastIndex
  }
  if (last < t.length) tok.push({ type:'text', val: t.slice(last) })
  return tok
}

/* --------------- 2. AST --------------- */
function buildAST(tokens) {
  const stack = [{ type:'root', kids:[] }]
  for (const t of tokens) {
    const top = stack[stack.length-1]
    if (t.type === 'text' || t.type === 'var') { top.kids.push(t); continue }
    if (t.type === 'open') {
      const nd = { type:'tag', name:t.name, raw:t.raw, kids:[], elseKids:[] }
      top.kids.push(nd); stack.push(nd); continue
    }
    /* close */
    const pop = stack.pop()
    if (!pop || pop.name !== t.name) throw Error(`Unexpected /jquan:${t.name}`)
  }
  if (stack.length !== 1) throw Error('Unclosed tag')
  return stack[0]
}

/* --------------- 3. 变量 & 过滤器 --------------- */
function get(path, ctx) {
  return path.split('.').reduce((o,k)=> o?.[k]??'', ctx)
}
function applyF(val, chain) {
  return chain.reduce((v, f) => {
    const [name, ...args] = f.split(':')
    const fn = filters[name] || (x=>x)
    return fn(v, ...args)
  }, val)
}

/* --------------- 4. include 防环 --------------- */
const INC_SET = new Set()

/* --------------- 5. 渲染核心 —— 8 条常用语法 --------------- */
async function walk(n, ctx, opts) {
  if (n.type === 'text') return n.val
  if (n.type === 'var') {
    const [path, ...chain] = n.expr.split('|')
    let v = get(path, ctx)
    if (opts.scope && path in opts.scope) v = opts.scope[path]
    return applyF(v, chain)
  }
  if (n.type === 'tag') {
    const { name, raw, kids } = n

    /* 5.1 list 循环 */
    if (name === 'list') {
      const arr = get('list', ctx) || []
      const arr2 = await (arr[Symbol.asyncIterator] ? Array.fromAsync(arr) : arr)
      return (await Promise.all(
        arr2.map(async (it, idx) => {
          const sub = { ...ctx, ...it, '@index': idx, '@odd': idx & 1, '@even': !(idx & 1), '@first': idx === 0, '@last': idx === arr2.length - 1 }
          return (await Promise.all(kids.map(c => walk(c, sub, opts)))).join('')
        })
      )).join('')
    }

    /* 5.2 content 单条 */
    if (name === 'content') {
      const f = (raw.match(/field="([^"]+)"/) || [])[1] || '*'
      const src = get('content', ctx) || {}
      const out = {}
      f.split(',').forEach(k => { out[k.trim()] = src[k.trim()] || '' })
      opts.scope = { ...opts.scope, ...out }
      return out[f.split(',')[0].trim()] || ''
    }

    /* 5.3 if/elseif/else 链 */
    if (name === 'if') {
      const branch = pickBranch(n, ctx)
      return (await Promise.all(branch.map(c => walk(c, ctx, opts)))).join('')
    }

    /* 5.4 include 文件 */
    if (name === 'include') {
      const m = raw.match(/file=["']([^"']+)["']/)
      if (!m) throw Error('include 缺少 file')
      let f = m[1]
      const base = opts.__file ? dirname(opts.__file) : process.cwd()
      const abs = isAbsolute(f) ? f : resolve(base, f)
      if (INC_SET.has(abs)) throw Error(`Include 循环：${[...INC_SET, abs].join(' → ')}`)
      INC_SET.add(abs)
      const tpl = readFileSync(abs, 'utf-8')
      const sc = (raw.match(/scope=["']([^"']+)["']/) || [])[1]
      const scope = sc ? Object.fromEntries(sc.split(',').map(p => {
        const [k, v] = p.split('=').map(i => i.trim()); return [k, v || '']
      })) : {}
      const ast = buildAST(tokenize(tpl))
      const html = await walk(ast, { ...ctx, ...scope }, { ...opts, __file: abs })
      INC_SET.delete(abs)
      return html
    }

    /* 5.5 set 变量赋值 */
    if (name === 'set') {
      const m = raw.match(/var="([^"]+)"\s*value="([^"]*)"/) || raw.match(/var="([^"]+)"\s*value='([^']*)'/)
      if (m) ctx[m[1]] = m[2]
      return ''
    }

    /* 5.6 macro 定义 */
    if (name === 'macro') {
      const m = raw.match(/name="([^"]+)"/)
      if (!m) throw Error('macro 缺少 name')
      const macName = m[1]
      ctx.__macros = ctx.__macros || {}
      ctx.__macros[macName] = kids
      return ''
    }

    /* 5.7 call 调用宏 */
    if (name === 'call') {
      const m = raw.match(/name="([^"]+)"/)
      if (!m) throw Error('call 缺少 name')
      const mac = (ctx.__macros || {})[m[1]]
      if (!mac) throw Error(`未定义宏：${m[1]}`)
      const sc = (raw.match(/with=["']([^"']+)["']/) || [])[1]
      const scope = sc ? Object.fromEntries(sc.split(',').map(p => {
        const [k, v] = p.split('=').map(i => i.trim()); return [k, v || '']
      })) : {}
      return (await Promise.all(mac.map(c => walk(c, { ...ctx, ...scope }, opts)))).join('')
    }

    /* 5.8 range 数字循环 */
    if (name === 'range') {
      const m = raw.match(/start=(\d+)\s*end=(\d+)/)
      if (!m) throw Error('range 需 start/end')
      const [_, a, b] = m, start = +a, end = +b
      const arr = Array.from({ length: end - start + 1 }, (_, i) => i + start)
      return (await Promise.all(
        arr.map(async v => {
          const sub = { ...ctx, '@value': v }
          return (await Promise.all(kids.map(c => walk(c, sub, opts)))).join('')
        })
      )).join('')
    }
  }

  if (n.type === 'root') {
    return (await Promise.all(n.kids.map(c => walk(c, ctx, opts)))).join('')
  }
  return ''
}

/* --------------- 6. 分支选择：if / elseif / else --------------- */
function pickBranch(node, ctx) {
  const cond = raw => new Function('ctx', 'with(ctx){return (' + raw + ')}')(ctx)
  const rawIf = node.raw.match(/cond="([^"]+)"/)?.[1] ?? 'false'
  if (cond(rawIf)) return node.kids
  /* 找找 elseif / else */
  let ptr = node, kids = ptr.elseKids
  while (kids.length === 1 && kids[0].type === 'tag' && kids[0].name === 'elseif') {
    const rawElif = kids[0].raw.match(/cond="([^"]+)"/)?.[1] ?? 'false'
    if (cond(rawElif)) return kids[0].kids
    ptr = kids[0]; kids = ptr.elseKids
  }
  const last = kids[0]
  if (last && last.type === 'tag' && last.name === 'else') return last.kids
  return []
}

/* --------------- 7. 对外 API --------------- */
export async function render(tpl, data = {}, opts = {}) {
  return walk(buildAST(tokenize(tpl)), data, opts)
}
export async function renderFile(file, data = {}, opts = {}) {
  const tpl = readFileSync(file, 'utf-8')
  return render(tpl, data, { ...opts, __file: file })
}
export function addFilter(name, fn) {
  filters[name] = fn
}
