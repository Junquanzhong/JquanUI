'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const arg = key => process.argv.includes(key) ? process.argv[process.argv.indexOf(key) + 1] : null;
const snapshot = arg('--snapshot');
assert(!snapshot || ['baseline', 'modified', 'rollback-copy'].includes(snapshot));
const fixture = path.join(root, 'verification/core-config-tokens-2026-11-08');
const sourceRoot = snapshot ? path.join(fixture, snapshot) : root;
const extractor = require(path.join(sourceRoot, 'dist/cli/jquan-extract.cjs'));
const entries = { core: 'dist/core/JquanUI@Core.js', min: 'js/JquanUI@core.min.js', full: 'dist/full/JquanUI@full.js' };
const probe = process.argv.includes('--probe');
const old = snapshot === 'baseline' || snapshot === 'rollback-copy';
const label = old ? snapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK' : 'MODIFIED';
const valid = {
  theme: {
    colors: { primary: '#112233' }, radius: { legacy: '7px' }, borderRadius: { card: '10px' },
    boxShadow: { soft: '0 1px 2px #123456' }, fontSize: { headline: ['30px', '1.2'] },
    extend: {
      colors: { primary: { 500: '#abcdef' } }, spacing: { '4.5': '18px' }, radius: { card: '12px' },
      borderRadius: { DEFAULT: '9px', card: '18px' }, boxShadow: { DEFAULT: '0 2px 3px #112233', soft: '0 16px 40px rgba(86,103,214,0.12)' },
      fontSize: { headline: ['37px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: 650 }], lg: '19px', explicit: '15px' }
    }
  },
  customUtilities: { 'text-explicit': { css: 'font-size', val: '21px' } }
};
const invalid = { theme: { extend: {
  colors: { bad: null, array: ['red'], hex: '#ggg', nested: { DEFAULT: null, 500: '#ff0000' } },
  fontFamily: { bad: [42], good: ['Inter UI', 'sans-serif'] }, containers: { bad: 42 },
  borderRadius: { bad: 42, t: '9px', good: '11px' }, boxShadow: { bad: [], color: 'red' },
  fontSize: { bad: ['20px'], zero: 23, DEFAULT: '18px', 'fluid-reserved': '3rem', partial: ['20px', { lineHeight: null, typo: 'x', letterSpacing: '1px' }] },
  spacing: { bad: null, good: '12px' }, shadows: { typo: '0 0 2px red' }
} } };
const classes = ['rounded-card', 'rounded-t-card', 'rounded-ss-card', 'rounded', 'rounded-legacy', 'shadow-soft', 'shadow', 'text-headline', 'hover:text-headline', 'md:rounded-card', 'text-lg', 'text-explicit', 'text-red-500', 'ring-2', 'p-4.5'];
const clone = value => JSON.parse(JSON.stringify(value));
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function nodeChecks() {
  if (probe || old) return;
  let count = 0;
  const check = (condition, message) => { count++; assert(condition, message); };
  for (const entry of ['core', 'min']) {
    const core = path.join(sourceRoot, entries[entry]);
    const config = freeze(clone(valid)), before = JSON.stringify(config);
    const runtime = extractor.createRuntime(core, { config });
    const output = extractor.extractFromSource(`<div class="${classes.join(' ')}"></div>`, { core, config });
    for (const name of classes) {
      const rule = runtime.api.resolve(name);
      check(rule && output.utilityCss.includes(rule.css), `${entry} extraction matches runtime ${name}`);
    }
    check(JSON.stringify(config) === before, 'caller config stays unchanged');
    check(output.report.configWarnings.length === 0 && output.report.warnings === 0, 'valid config has no warnings');
    check(runtime.api.resolve('rounded-card').css.includes('18px'), 'extend borderRadius overrides base and radius alias');
    check(runtime.api.resolve('text-headline').css.includes('font-weight: 650'), 'font options serialize');
    check(runtime.api.resolve('text-explicit').css.includes('21px'), 'explicit utilities win');
    check(!runtime.api.resolve('text-lg').css.includes('line-height'), 'string size has no implicit line height');
    check(runtime.api.resolve('p-4.5').css.includes('18px'), 'fractional spacing names stay supported');
    const bad = extractor.extractFromSource('<div class="rounded-good font-good text-partial p-good"></div>', { core, config: clone(invalid) });
    check(bad.report.configWarnings.some(item => item.path === 'theme.extend.shadows' && item.code === 'unknown-key'), 'unknown key has path');
    check(bad.report.configWarnings.some(item => item.path === 'theme.extend.colors.bad'), 'null color warning');
    check(bad.report.configWarnings.some(item => item.path === 'theme.extend.fontFamily.bad'), 'font array warning');
    check(bad.report.warnings === bad.report.configWarnings.length && bad.report.unresolvedClassCount === 0, 'report counts config diagnostics');
    const first = bad.runtime.api.debug().configWarnings; first[0].path = 'mutated'; first.length = 0;
    check(bad.runtime.api.diagnose().configWarnings[0].path !== 'mutated', 'diagnostics detached');
    const colorCollision = extractor.createRuntime(core, { config: { theme: { colors: { white: '#ffffff' }, extend: { colors: { white: { 500: '#ff0000' } } } } } });
    check(colorCollision.api.resolve('bg-white-500').css.includes('255 0 0'), 'palette can replace scalar color');
    for (const config of [{ theme: null }, { theme: { extend: [] } }, { theme: { extend: { colors: [] } } }, { customUtilities: 42 }, { theme: { extend: { fontFamily: { bad: null } } } }, { theme: { semantic: { bad: null, surface: { light: 'white', dark: 'black' } } } }]) {
      const isolated = extractor.createRuntime(core, { config });
      check(isolated.api.resolve('p-4') && isolated.api.debug().configWarnings.length > 0, 'malformed shape isolated');
    }
    const ignored = extractor.createRuntime(core, { config: { theme: { extend: { colors: { white: { 500: null } } } } } });
    check(ignored.api.resolve('bg-white').css.includes('255 255 255'), 'invalid empty palette keeps built-in color');
  }
  const tokenTool = require('../dist/cli/jquan-tokens.cjs');
  const imported = tokenTool.importTokens({ radius: { card: { $type: 'dimension', $value: '18px' } } });
  const tokenRuntime = extractor.createRuntime(path.join(sourceRoot, entries.core), { config: imported });
  check(tokenRuntime.api.resolve('rounded-card').css.includes('18px'), 'existing token import radius alias works');
  const migrated = require('../dist/cli/jquan-migrate.cjs').normalizeMigrationConfig({ theme: { extend: { borderRadius: { card: '18px' }, fontSize: { headline: ['37px', '1.25'] } } } });
  const migratedCss = extractor.extractFromSource('<h1 class="rounded-card text-headline">Title</h1>', { config: migrated.config });
  check(migratedCss.report.unresolvedClassCount === 0 && migratedCss.css.includes('37px') && migratedCss.css.includes('18px'), 'migration token config resolves in extraction');
  const buildFixture = path.join(fixture, 'build-fixture'); fs.mkdirSync(buildFixture, { recursive: true });
  const input = path.join(buildFixture, 'input.html'), configFile = path.join(buildFixture, 'jquan.config.json');
  fs.writeFileSync(input, '<main class="p-4"></main>'); fs.writeFileSync(configFile, JSON.stringify(invalid));
  const doctor = extractor.diagnoseProject({ inputs: [input], core: path.join(sourceRoot, entries.core), config: clone(invalid) });
  check(!doctor.ok && doctor.warnings.some(item => item.includes('theme.extend.colors.bad')), 'doctor exposes path diagnostics');
  const cli = spawnSync(process.execPath, [path.join(sourceRoot, 'dist/cli/jquan-extract.cjs'), '--input', input, '--config', configFile, '--output', path.join(buildFixture, 'output.css'), '--report', path.join(buildFixture, 'report.json'), '--fail-on-warn'], {cwd:root,encoding:'utf8',windowsHide:true});
  check(cli.status === 1 && JSON.parse(fs.readFileSync(path.join(buildFixture, 'report.json'), 'utf8')).configWarnings.length > 0, 'CLI fail-on-warn includes config diagnostics');
  const vite = require('../dist/cli/jquan-vite-plugin.cjs')({ input: [input], config: clone(invalid), failOnWarn: true });
  check((()=>{try{vite.generateBundle.call({emitFile(){}},{});return false;}catch(error){return error.message.includes('warning(s)');}})(), 'Vite failOnWarn includes config diagnostics');
  const postcss = require('../dist/cli/jquan-postcss-plugin.cjs')({ input: [input], config: clone(invalid), failOnWarn: true });
  check((()=>{try{postcss.Once({walkAtRules(){},append(){},result:{messages:[]}}, {postcss:{parse:css=>css},result:{messages:[]}});return false;}catch(error){return error.message.includes('warning(s)');}})(), 'PostCSS failOnWarn includes config diagnostics');
  console.log(`[JquanUI] config tokens extraction ok (${count} assertions; frozen config, precedence, invalid isolation, diagnostics, token import)`);
}
async function browserChecks() {
  const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
  assert(browserPath, 'Set JQUAN_BROWSER to Chromium');
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');res.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/fixture') {
      const entry = entries[url.searchParams.get('entry')], test = url.searchParams.get('test');
      assert(entry);res.setHeader('Content-Type', 'text/html;charset=utf-8');
      const config = test === 'invalid' ? invalid : valid;
      res.end(`<!doctype html><html><head><script>${url.searchParams.has('keepCache') ? '' : 'localStorage.clear();'}window.testErrors=[];addEventListener('error',e=>testErrors.push(e.message));${test === 'late' ? '' : `window.JQUAN_CONFIG=${JSON.stringify(config)};`}</script><script src="/${entry}"></script></head><body><div id="target" class="rounded-card shadow-soft text-headline">Design tokens</div></body></html>`);return;
    }
    const relative = decodeURIComponent(url.pathname).slice(1), file = path.resolve(sourceRoot, relative);
    if (!file.startsWith(sourceRoot + path.sep) || !fs.existsSync(file)) { res.writeHead(404);res.end();return; }
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html;charset=utf-8' : 'text/javascript;charset=utf-8');fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 15500 + Math.floor(Math.random() * 700);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'config-tokens-' + Date.now())}`, 'about:blank'], {windowsHide:true,stdio:'ignore'});
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  let socket, sequence = 0;const pending = new Map();
  try {
    let pages;for(let i=0;i<100&&!pages;i++){try{pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();}catch{}if(!pages)await delay(100);}
    assert(pages, 'browser ready');socket=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
    socket.onmessage=event=>{const result=JSON.parse(event.data),item=pending.get(result.id);if(!item)return;clearTimeout(item.timer);pending.delete(result.id);result.error?item.reject(Error(JSON.stringify(result.error))):item.resolve(result.result);};
    const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'));},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const navigate=async(entry,test,keepCache=false)=>{
      const query=`?entry=${entry}&test=${test}${keepCache?'&keepCache=1':''}`;
      await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/fixture${query}`});
      for(let i=0;i<100;i++){if(await evaluate(`document.readyState==='complete'&&location.search===${JSON.stringify(query)}&&!!document.getElementById('target')`))return;await delay(50);}throw Error('fixture ready');
    };
    for (const entry of Object.keys(entries)) {
      await navigate(entry,'valid');
      const tokens = await evaluate(`!!(window.JquanUI?.resolve('rounded-card')&&JquanUI.resolve('shadow-soft')&&JquanUI.resolve('text-headline'))`);
      if (!old) {
        assert(tokens);assert.equal(await evaluate(`(()=>{const s=getComputedStyle(document.getElementById('target'));return [s.borderRadius,s.fontSize,s.lineHeight,s.fontWeight,s.boxShadow.includes('40px')].join('|')})()`),'18px|37px|46.25px|650|true');
        assert.deepEqual(await evaluate('testErrors'),[]);
        await evaluate(`(()=>{const target=document.getElementById('target');target.classList.add('ring-2','shadow-red-500');JquanUI.enhance(target);})()`);
        assert.equal(await evaluate(`(()=>{const shadow=getComputedStyle(document.getElementById('target')).boxShadow;return shadow.includes('0px 0px 0px 2px')&&shadow.includes('rgba(86, 103, 214, 0.12)')&&shadow.includes('40px')})()`),true);
        await evaluate(`localStorage.setItem(JquanUI.debug().cache.key, JSON.stringify({v:JquanUI.debug().version,format:2,hash:JquanUI.debug().configHash,classes:['rounded-card','shadow-soft','text-headline'],rules:[]}))`);
        await navigate(entry,'valid',true);
        assert.equal(await evaluate('JquanUI.debug().cache.hydrate'),'invalid');
        assert.equal(await evaluate('getComputedStyle(document.getElementById("target")).fontSize'),'37px');
        await evaluate(`localStorage.setItem(JquanUI.debug().cache.key, JSON.stringify({v:JquanUI.debug().version,format:5,hash:JquanUI.debug().configHash,classes:['rounded-card','shadow-soft','text-headline'],rules:['rounded-card','shadow-soft','text-headline'].map(name=>JquanUI.resolve(name).css),outcomes:[]}))`);
        await evaluate('window.previousConfigDocument=true');await command('Page.reload');
        for(let i=0;i<100;i++){if(await evaluate('!window.previousConfigDocument&&document.readyState==="complete"&&!!window.JquanUI?.isReady?.()'))break;await delay(50);}
        assert.equal(await evaluate('JquanUI.debug().cache.hydrate'),'hit');
        assert.equal(await evaluate('getComputedStyle(document.getElementById("target")).fontSize'),'37px');
        assert.deepEqual(await evaluate('testErrors'),[]);
      }
      await navigate(entry,'invalid');
      const invalidReady=await evaluate('!!window.JquanUI?.isReady?.()');
      const warnings=await evaluate('!!window.JquanUI?.debug?.().configWarnings?.length');
      console.log(`${label} ${entry} ${JSON.stringify({tokens,invalidReady,warnings})}`);
      assert.deepEqual({tokens,invalidReady,warnings},old?{tokens:false,invalidReady:false,warnings:false}:{tokens:true,invalidReady:true,warnings:true});
      if (!old && !probe) {
        assert.deepEqual(await evaluate('testErrors'),[]);
        assert.equal(await evaluate('JquanUI.resolve("font-good").css.includes("Inter UI")'),true);
        await navigate(entry,'late');
        assert.equal(await evaluate(`JquanUI.resolve('rounded-card')`),null);
        await evaluate(`window.JQUAN_CONFIG=${JSON.stringify(valid)}`);
        assert.equal(await evaluate('getComputedStyle(document.getElementById("target")).borderRadius'),'18px');
        assert.equal(await evaluate('getComputedStyle(document.getElementById("target")).fontSize'),'37px');
        assert.deepEqual(await evaluate('testErrors'),[]);
      }
    }
    if (!probe && !snapshot) {
      await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
      await command('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/examples/core-config-tokens.html`});
      for(let i=0;i<100;i++){if(await evaluate(`location.pathname==='/examples/core-config-tokens.html'&&!!document.getElementById('diagnostics')?.textContent`))break;await delay(50);}
      assert.equal(await evaluate('getComputedStyle(document.getElementById("token-card")).borderRadius'),'18px');
      assert.equal(await evaluate('getComputedStyle(document.getElementById("token-title")).fontSize'),'37px');
      assert.equal(await evaluate('document.getElementById("diagnostics").textContent'),'配置校验通过，三个设计令牌已生效。');
      assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
      fs.writeFileSync(path.join(fixture,'example-390.png'),Buffer.from((await command('Page.captureScreenshot',{format:'png'})).data,'base64'));
      console.log('[JquanUI] config tokens example ok (mobile, actual CSS, ready event, no overflow)');
    }
  } finally { for(const item of pending.values())clearTimeout(item.timer);socket?.close();browser.kill();server.close(); }
}
(async()=>{nodeChecks();await browserChecks();})().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
