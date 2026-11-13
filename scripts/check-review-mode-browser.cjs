'use strict';
const assert = require('assert/strict'), fs = require('fs'), http = require('http'), path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
assert(browserPath, 'Set JQUAN_BROWSER to Chromium.');
const argument = key => process.argv.includes(key) ? process.argv[process.argv.indexOf(key) + 1] : null;
const snapshot = argument('--snapshot'), onlyEntry = argument('--entry');
if (snapshot && !['baseline', 'modified', 'rollback-copy'].includes(snapshot)) throw Error('Invalid snapshot');
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js', components: '/dist/core/JquanUI@Core.js' };
if (onlyEntry && !entries[onlyEntry]) throw Error('Invalid entry');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const template = fs.readFileSync(path.join(root, 'scripts/review-mode-browser-fixture.html'), 'utf8');
async function main() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost'); response.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/') {
      const entry = url.searchParams.get('entry');
      if (!entries[entry]) { response.writeHead(400); response.end(); return; }
      response.setHeader('Content-Type', 'text/html;charset=utf-8');
      const extra = entry === 'components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : '';
      const head = url.searchParams.get('head') === '1' ? `${entry !== 'components' ? '<script src="/dist/components/copy.js"></script><script src="/dist/components/reviewMode.js"></script>' : '<script src="/dist/components/reviewMode.js"></script>'}<script>JquanUI.use(JquanUIComponents.copy);JquanUI.use(JquanUIComponents.reviewMode);${url.searchParams.get('cancel') === '1' ? 'JquanUIComponents.reviewModeApi.destroy();' : ''}</script>` : '';
      response.end(template.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>`).replace('<!-- COMPONENT_ENTRY -->', extra + head)); return;
    }
    let relative = decodeURIComponent(url.pathname).slice(1);
    if (snapshot && ['dist/core/JquanUI@Core.js', 'dist/components/reviewMode.js'].includes(relative)) relative = `verification/review-mode-stage-a/${snapshot}/${relative}`;
    const file = path.resolve(root, relative), fromRoot = path.relative(root, file);
    if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html;charset=utf-8' : 'text/plain'); fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 14300 + Math.floor(Math.random() * 200);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'review-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket; const pending = new Map();
  try {
    let pages; for (let i = 0; i < 100 && !pages; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch {} if (!pages) await delay(100); }
    assert(pages, 'Browser start timed out'); socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; }); let sequence = 0;
    socket.onmessage = event => { const message = JSON.parse(event.data), item = pending.get(message.id); if (!item) return; clearTimeout(item.timer); pending.delete(message.id); message.error ? item.reject(Error(JSON.stringify(message.error))) : item.resolve(message.result); };
    const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error(method + ' timeout')); }, 20000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => { const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value; };
    await command('Runtime.enable'); await command('Emulation.setFocusEmulationEnabled', { enabled: true });
    for (const entry of snapshot ? ['core'] : onlyEntry ? [onlyEntry] : Object.keys(entries)) {
      const baseline = snapshot && snapshot !== 'modified';
      const query = `?entry=${entry}&jqui-review=1${baseline ? '&baseline=1' : ''}`;
      await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/${query}` });
      let ready = false; for (let i = 0; i < 100 && !ready; i++) { ready = await evaluate(`location.search===${JSON.stringify(query)}&&typeof reviewReady!=='undefined'`); if (!ready) await delay(100); }
      assert(ready, 'Fixture timed out'); await evaluate('reviewReady');
      if (baseline) {
        assert.equal(await evaluate('reviewReady'), 'COMPONENT_UNKNOWN');
        assert.equal(await evaluate(`!!document.querySelector('[data-jq-review-ui]')`), false);
        console.log(`${snapshot === 'baseline' ? 'BASELINE' : 'ROLLBACK'} reviewMode import=COMPONENT_UNKNOWN; inspector=absent`);
      } else {
        const result = await evaluate('runReviewChecks()');
        const failures = Object.entries(result.results).filter(([, value]) => !value).map(([key]) => key);
        assert.equal(failures.length, 0, JSON.stringify({ failures, errors: result.errors }));
        await evaluate(`window.review = JquanUIComponents.reviewModeApi; review.configure({enabled:true, root:'#review-root',allowURL:false});document.getElementById('entry').focus();review.open();document.getElementById('action').focus()`);
        const clickTarget = await evaluate(`(() => {const r=document.getElementById('action').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,clicks:pageClicks}})()`);
        for (const type of ['mousePressed', 'mouseReleased']) await command('Input.dispatchMouseEvent', {type,x:clickTarget.x,y:clickTarget.y,button:'left',clickCount:1});
        assert.equal(await evaluate('review.state().selection.tag+":"+pageClicks'), 'button:'+clickTarget.clicks, 'Native pointer must select without running the page action');
        await evaluate(`document.getElementById('action').focus()`);
        for (const type of ['keyDown', 'keyUp']) await command('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        assert.equal(await evaluate('review.state().selection.tag'), 'button');
        await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        assert.equal(await evaluate('review.state().active'), false);
        await evaluate(`review.open()`);
        await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
        await delay(150);
        const layout = await evaluate(`(() => { const r = document.querySelector('[aria-label="审查元素信息"]').getBoundingClientRect(); const b=document.querySelector('[aria-label="页面审查"]').getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,barTop:b.top,width:innerWidth,position:getComputedStyle(document.querySelector('[aria-label="页面审查"]')).position};})()`);
        assert(layout.left >= 0 && layout.right <= layout.width && layout.position === 'fixed' && layout.bottom <= layout.barTop - 4, JSON.stringify(layout));
        await evaluate(`review.select('#title')`);
        await delay(150);
        const screenshot = await command('Page.captureScreenshot', { format: 'png' });
        const output = path.join(root, 'verification/review-mode-workflow'); fs.mkdirSync(output, {recursive:true});
        fs.writeFileSync(path.join(output, `review-${entry}-390.png`), Buffer.from(screenshot.data, 'base64'));
        await evaluate('review.destroy()');
        await command('Emulation.clearDeviceMetricsOverride');
        // Configuration before Core is supported, including scripts in <head> before body exists.
        await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/?entry=${entry}&jqui-review=1&config=1&head=1` });
        let auto = false;
        for (let i = 0; i < 100 && !auto; i++) { auto = await evaluate(`!!(window.JquanUIComponents?.reviewModeApi?.state().active && document.querySelector('[data-jq-review-ui]'))`); if (!auto) await delay(100); }
        assert(auto, 'Configured URL did not open');
        await evaluate('JquanUI.destroy()');
        const teardownState = await evaluate(`({ui:!!document.querySelector('[data-jq-review-ui]'),api:window.JquanUIComponents.reviewModeApi?.state(),plugins:typeof JquanUI.getInstalledPlugins==='function'?JquanUI.getInstalledPlugins():null})`);
        assert.equal(teardownState.ui, false, 'Core teardown must dispose plugin: ' + JSON.stringify(teardownState));
        await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/?entry=${entry}&jqui-review=1&config=1&head=1&cancel=1` });
        let cancelled = false;
        for (let i=0;i<100&&!cancelled;i++) {cancelled=await evaluate(`location.search.includes('cancel=1')&&document.readyState==='complete'&&typeof reviewReady!=='undefined'`); if(!cancelled)await delay(100);}
        assert(cancelled,'Cancelled readiness fixture timed out');
        await evaluate('reviewReady');
        assert.equal(await evaluate('JquanUIComponents.reviewModeApi.state().enabled'),false,'Destroy before DOM ready must retire scheduled configure');
        console.log(`[JquanUI] review mode ${entry} ok (${result.assertions + 7} assertions; opt-in, selection, native pointer/keyboard, mobile layout, teardown)`);
      }
    }
    if (!snapshot || snapshot === 'modified') {
      await command('Emulation.setDeviceMetricsOverride', {width:1280,height:850,deviceScaleFactor:1,mobile:false});
      await command('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/examples/review-mode.html?jqui-review=1`});
      let demo = false;
      for(let i=0;i<100&&!demo;i++){ demo=await evaluate(`location.pathname==='/examples/review-mode.html'&&!!window.JquanUIComponents?.reviewModeApi?.state().active`);if(!demo)await delay(100); }
      assert(demo,'Runnable sample did not open review mode');
      assert.equal(await evaluate(`JquanUIComponents.reviewModeApi.select('#hero-title')&&JquanUIComponents.reviewModeApi.state().selection.computed.fontSize`),'30px');
      await delay(150);
      const screenshot=await command('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(root,'verification/review-mode-workflow/review-readonly-demo-1280.png'),Buffer.from(screenshot.data,'base64'));
      await evaluate('JquanUIComponents.reviewModeApi.destroy()');
      console.log('[JquanUI] review mode runnable sample ok (URL entry, Core styles, selection)');
    }
  } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
