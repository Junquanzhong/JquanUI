'use strict';
const assert = require('assert/strict'), fs = require('fs'), http = require('http'), path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..'), evidence = path.join(root, 'verification/review-mode-workflow');
const arg = key => process.argv.includes(key) ? process.argv[process.argv.indexOf(key) + 1] : null;
const snapshot = arg('--snapshot');
assert(!snapshot || ['baseline', 'modified', 'rollback-copy'].includes(snapshot));
const legacy = snapshot === 'baseline' || snapshot === 'rollback-copy';
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert(browserPath, 'Set JQUAN_BROWSER to Chromium.');
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js', components: '/dist/core/JquanUI@Core.js' };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  let rejectReview = 0;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    response.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/fixture') {
      const entry = url.searchParams.get('entry');
      assert(entries[entry]);
      response.setHeader('Content-Type', 'text/html;charset=utf-8');
      response.end(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><script>window.errors=[];addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));window.JQUAN_CONFIG={reviewMode:{enabled:true,root:'#preview'}};</script><script src="${entries[entry]}"></script>${entry === 'components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : ''}</head><body><main id="preview"><h1 id="title" class="text-2xl">按需审查标题</h1></main><script>window.ready=true;</script></body></html>`);
      return;
    }
    const relative = decodeURIComponent(url.pathname).slice(1);
    if (relative === 'dist/components/reviewMode.js' && rejectReview > 0) {
      rejectReview--; response.writeHead(503); response.end('test component load failure'); return;
    }
    let file = path.resolve(root, relative);
    const fromRoot = path.relative(root, file);
    if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) { response.writeHead(403); response.end(); return; }
    if (snapshot && fs.existsSync(path.join(evidence, snapshot, relative))) file = path.join(evidence, snapshot, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html;charset=utf-8' : 'text/plain');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 14600 + Math.floor(Math.random() * 200);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'review-lazy-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket; const pending = new Map(); let count = 0;
  const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); count++; };
  try {
    let pages;
    for (let i = 0; i < 100 && !pages; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch {} if (!pages) await delay(100); }
    assert(pages, 'Browser startup timed out');
    socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    socket.onmessage = event => {
      const message = JSON.parse(event.data), item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer); pending.delete(message.id);
      message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result);
    };
    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error(method + ' timeout')); }, 20000);
      pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value;
    };
    const waitFor = async expression => {
      for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(100); }
      throw Error('Timed out: ' + expression);
    };
    const navigate = async target => {
      const url = `http://127.0.0.1:${server.address().port}${target}`;
      await command('Page.navigate', { url });
      await waitFor(`location.href===${JSON.stringify(url)}&&document.readyState==='complete'`);
    };
    const resources = name => evaluate(`performance.getEntriesByType('resource').filter(r=>new URL(r.name).pathname==='/dist/components/${name}.js').length`);
    const click = async selector => {
      const point = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
      for (const type of ['mousePressed', 'mouseReleased']) await command('Input.dispatchMouseEvent', { type, ...point, button: 'left', clickCount: 1 });
    };
    await command('Runtime.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 850, deviceScaleFactor: 1, mobile: false });
    if (legacy) {
      await navigate('/fixture?entry=components');
      check(await evaluate('!!window.JquanUIComponents?.reviewModeApi'), true, 'Original Components embeds reviewMode');
      check(await evaluate('JquanUIComponents.reviewMode.version'), '0.2.0');
      await navigate('/examples/review-mode.html');
      check(await evaluate('!!window.JquanUIComponents?.reviewModeApi'), true, 'Original example loads reviewMode before click');
      check(await resources('reviewMode'), 1);
      console.log(`${snapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK'} components=embedded; demo=static; reviewMode=0.2.0`);
      return;
    }
    for (const entry of Object.keys(entries)) {
      const start = count;
      await navigate('/fixture?entry=' + entry);
      check(await evaluate('!!window.JquanUIComponents?.reviewModeApi'), false, entry + ': no review registration');
      check(await resources('reviewMode'), 0);
      check(await resources('copy'), 0);
      check(await evaluate('document.querySelectorAll("[data-jq-review-ui]").length'), 0);
      const imported = await evaluate(`(async()=>{const pair=await Promise.all([JquanUI.import('reviewMode'),JquanUI.import('reviewMode')]);return pair[0]===pair[1]&&pair[0]===JquanUIComponents.reviewModeApi&&!!JquanUIComponents.copyApi;})()`);
      check(imported, true, entry + ': concurrent imports share API and dependency');
      check(await resources('reviewMode'), 1);
      check(await resources('copy'), ['core', 'min'].includes(entry) ? 1 : 0);
      check(await evaluate('JquanUIComponents.reviewModeApi.state().active'), false, 'Import does not open without URL or open');
      check(await evaluate(`(()=>{const r=JquanUIComponents.reviewModeApi;return r.open()&&r.select('#title')&&r.setUtility('font-size','text-lg');})()`), true);
      check(await evaluate('JquanUIComponents.reviewModeApi.changes().length'), 1);
      check(await evaluate('JquanUIComponents.reviewModeApi.destroy();!!document.querySelector("[data-jq-review-ui]")'), false);
      check(await evaluate(`(async()=>{const r=await JquanUI.import('reviewMode');r.configure({enabled:true,root:'#preview'});return r.open();})()`), true, 'Destroy followed by cached reimport can reconfigure');
      check(await resources('reviewMode'), 1);
      check(await evaluate('errors'), []);
      console.log(`[JquanUI] review lazy ${entry} ok (${count - start} assertions; initial absent, one import, dependency reuse, cached reopen)`);
    }
    await navigate('/examples/review-mode.html');
    check(await evaluate('!!window.JquanUIComponents?.reviewModeApi'), false);
    check(await resources('reviewMode'), 0); check(await resources('copy'), 0);
    await click('[data-jq-review-open]');
    await waitFor('!!window.JquanUIComponents?.reviewModeApi?.state().active');
    check(await resources('reviewMode'), 1); check(await resources('copy'), 1);
    await evaluate('JquanUIComponents.reviewModeApi.close()');
    await click('[data-jq-review-open]');
    check(await evaluate('JquanUIComponents.reviewModeApi.state().active'), true);
    check(await resources('reviewMode'), 1);
    await navigate('/examples/review-mode.html?jqui-review=1');
    await waitFor('!!window.JquanUIComponents?.reviewModeApi?.state().active');
    check(await resources('reviewMode'), 1);
    check(await evaluate(`JquanUIComponents.reviewModeApi.select('#hero-title')&&JquanUIComponents.reviewModeApi.setText('按需加载后修改')`), true);
    check(await evaluate(`JSON.parse(JquanUIComponents.reviewModeApi.exportPlan('json')).changes.length`), 1);
    // Real failure followed by a native retry must not leave the button stuck.
    rejectReview = 1;
    await navigate('/examples/review-mode.html');
    await click('[data-jq-review-open]');
    await waitFor(`!document.querySelector('[data-jq-review-open]').disabled&&!!document.querySelector('#review-load-status').textContent`);
    check(await evaluate('!!window.JquanUIComponents?.reviewModeApi'), false);
    await click('[data-jq-review-open]');
    await waitFor('!!window.JquanUIComponents?.reviewModeApi?.state().active');
    check(await resources('reviewMode'), 2);
    check(await resources('copy'), 1);
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    fs.mkdirSync(evidence, { recursive: true });
    const screenshot = await command('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(evidence, 'lazy-example-1280.png'), Buffer.from(screenshot.data, 'base64'));
    console.log(`[JquanUI] review lazy example ok (click, URL, retry; ${count} total assertions)`);
    console.log('MODIFIED components=on-demand; demo=on-demand; review requests before import=0');
  } finally {
    for (const item of pending.values()) clearTimeout(item.timer);
    socket?.close(); browser.kill(); server.close();
  }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
