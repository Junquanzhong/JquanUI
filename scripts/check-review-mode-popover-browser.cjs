'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const browserPath = process.env.JQUAN_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
].find(fs.existsSync);
assert(browserPath, 'Set JQUAN_BROWSER to Chromium.');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const argument = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const snapshot = argument('--snapshot');
const onlyEntry = argument('--entry');
const probe = process.argv.includes('--probe');
assert(!snapshot || ['baseline', 'modified', 'rollback-copy'].includes(snapshot));
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js', components: '/dist/core/JquanUI@Core.js' };
assert(!onlyEntry || entries[onlyEntry]);

async function main() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/lifecycle') {
      const entry = url.searchParams.get('entry');
      if (!entries[entry]) { response.writeHead(400); response.end(); return; }
      response.setHeader('Content-Type', 'text/html;charset=utf-8');
      response.end(`<!doctype html><html><head><script>localStorage.clear();window.lifecycleErrors=[];addEventListener('error',e=>lifecycleErrors.push(e.message));addEventListener('unhandledrejection',e=>lifecycleErrors.push(String(e.reason)));</script><script src="${entries[entry]}"></script>${entry === 'components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : ''}</head><body><main id="fixture"></main><script>window.lifecycleReady=(async()=>{await JquanUI.import('popover',{install:false});window.review=await JquanUI.import('reviewMode');})();</script></body></html>`);
      return;
    }
    let relative = decodeURIComponent(url.pathname).slice(1);
    if (snapshot) {
      const copy = `verification/review-mode-popover-lifecycle/${snapshot}/${relative}`;
      if (fs.existsSync(path.join(root, copy))) relative = copy;
    }
    const file = path.resolve(root, relative || 'examples/review-mode-popover.html');
    const fromRoot = path.relative(root, file);
    if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html;charset=utf-8');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 14500 + Math.floor(Math.random() * 200);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'review-popover-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket;
  const pending = new Map();
  try {
    let pages;
    for (let i = 0; i < 100 && !pages; i++) {
      try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch {}
      if (!pages) await delay(100);
    }
    assert(pages, 'Browser start timed out');
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
      assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await command('Runtime.enable');
    for (const entry of onlyEntry ? [onlyEntry] : Object.keys(entries)) {
      const query = '/lifecycle?entry=' + entry;
      await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}${query}` });
      let loaded = false;
      for (let i = 0; i < 100 && !loaded; i++) {
        loaded = await evaluate(`location.pathname+location.search===${JSON.stringify(query)}&&typeof lifecycleReady!=='undefined'`);
        if (!loaded) await delay(50);
      }
      assert(loaded, 'Lifecycle fixture did not load'); await evaluate('lifecycleReady');
      if (probe) {
        const observed = await evaluate(`(()=>{
          const api=JquanUIComponents.popoverApi,root=document.getElementById('fixture');
          root.innerHTML='<div id="sample" data-popover-open="false"><button jq-popover-trigger>Open</button><section jq-popover-panel>Panel</section></div>';
          review.configure({enabled:true,root});review.open();review.select('#sample');
          const unmountedFields=review.componentOptions().length;
          const node=document.getElementById('sample'),handle=api.mount(node,{autoFocus:false,trapFocus:false});
          handle.open();review.setComponentOption('popover','open',false);handle.destroy();
          const destroyedFields=review.componentOptions().length,replacement=api.mount(node,{autoFocus:false,trapFocus:false});
          const remountStatus=review.changes()[0].status,undo=review.undo(),replacementOpen=replacement.state();
          review.destroy();replacement.destroy();return {unmountedFields,destroyedFields,remountStatus,undo,replacementOpen};
        })()`);
        const old = snapshot === 'baseline' || snapshot === 'rollback-copy';
        assert.deepEqual(observed, old ? {unmountedFields:1,destroyedFields:1,remountStatus:'ready',undo:true,replacementOpen:true} : {unmountedFields:0,destroyedFields:0,remountStatus:'conflict',undo:false,replacementOpen:false});
        console.log(`${old ? snapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK' : 'MODIFIED'} ${entry} ${JSON.stringify(observed)}`);
      } else {
        const result = await evaluate(fs.readFileSync(path.join(root, 'scripts/review-mode-popover-checks.js'), 'utf8'));
        assert.deepEqual(result.failures, [], JSON.stringify(result));
        assert.deepEqual(await evaluate('lifecycleErrors'), []);
        console.log(`[JquanUI] review popover lifecycle ${entry} ok (${result.assertions} assertions; identity, drafts, apply, callbacks)`);
      }
    }
    if (probe) return;
    await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/examples/review-mode-popover.html` });
    for (let i = 0; i < 100; i++) {
      if (await evaluate('!!window.JquanUIComponents?.popoverApi?.getHandle?.("#sample-popover")')) break;
      await delay(100);
    }
    assert.equal(await evaluate('!!window.JquanUIComponents?.popoverApi?.getHandle?.("#sample-popover")'), true, 'Popover did not mount');
    assert.equal(await evaluate('!!window.JquanUIComponents?.reviewModeApi'), false, 'Demo keeps Review lazy');
    const point = await evaluate(`(()=>{const r=document.getElementById('start-review').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    for (const type of ['mousePressed','mouseReleased']) await command('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
    for (let i = 0; i < 100; i++) {
      if (await evaluate('!!window.JquanUIComponents?.reviewModeApi?.state().active')) break;
      await delay(100);
    }
    const result = await evaluate(`(() => {
      const review = JquanUIComponents.reviewModeApi, popover = JquanUIComponents.popoverApi;
      if (!review.state().active) return {initial:false};
      popover.open('#sample-popover');
      const options = review.componentOptions();
      const initial = options.length === 1 && options[0].component === 'popover' && options[0].option === 'open' && options[0].value === true;
      const edited = review.setComponentOption('popover', 'open', false);
      const closed = popover.getState('#sample-popover') === false;
      const changed = review.changes();
      const deduped = changed.length === 1 && changed[0].field === 'component:popover.open' && changed[0].before === true && changed[0].after === false;
      const reopened = review.setComponentOption('popover', 'open', true) && popover.getState('#sample-popover') === true;
      const finalChange = review.changes().length === 0;
      const undone = review.undo() && popover.getState('#sample-popover') === false;
      const redone = review.redo() && popover.getState('#sample-popover') === true;
      review.setComponentOption('popover', 'open', false);
      popover.open('#sample-popover');
      const conflict = review.changes()[0]?.status === 'conflict';
      return { initial, edited, closed, deduped, reopened, finalChange, undone, redone, conflict };
    })()`);
    for (const key of ['initial', 'edited', 'closed', 'deduped', 'reopened', 'finalChange', 'undone', 'redone', 'conflict']) assert.equal(result[key], true, key);
    assert.equal(await evaluate('JquanUIComponents.reviewMode.version'), '0.18.1');
    console.log('[JquanUI] review popover adapter ok (mounted-only, open state, dedupe, undo/redo, external conflict)');
  } finally {
    for (const item of pending.values()) clearTimeout(item.timer);
    socket?.close(); browser.kill(); server.close();
  }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });

