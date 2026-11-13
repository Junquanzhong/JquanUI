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
const template = fs.readFileSync(path.join(root, 'scripts/highfreq-lifecycle-browser-fixture.html'), 'utf8');
async function main() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost'); response.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/') {
      const entry = url.searchParams.get('entry');
      if (!entries[entry]) { response.writeHead(400); response.end(); return; }
      response.setHeader('Content-Type', 'text/html;charset=utf-8');
      const extra = entry === 'components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : '';
      response.end(template.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>`).replace('<!-- COMPONENT_ENTRY -->', extra)); return;
    }
    let relative = decodeURIComponent(url.pathname).slice(1);
    if (snapshot && ['dist/components/carousel.js', 'dist/components/tabs.js'].includes(relative)) relative = `verification/highfreq-lifecycle/${snapshot}/${relative}`;
    const file = path.resolve(root, relative), fromRoot = path.relative(root, file);
    if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/plain'); fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 13300 + Math.floor(Math.random() * 200);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'highfreq-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
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
      const query = `?entry=${entry}`;
      await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/${query}` });
      let ready = false; for (let i = 0; i < 100 && !ready; i++) { ready = await evaluate(`location.search===${JSON.stringify(query)}&&typeof highfreqReady!=='undefined'`); if (!ready) await delay(100); }
      assert(ready, 'Fixture timed out'); await evaluate('highfreqReady');
      const result = await evaluate('runHighfreqChecks()');
      if (snapshot && snapshot !== 'modified') {
        assert.equal(result.results.tabsDurationZeroImmediate, false, 'Baseline must reproduce zero-duration normalization');
        assert.equal(result.results.carouselUpdateKeepsOriginalSlides, false, 'Baseline must reproduce cloned-slide accumulation');
        console.log('PROBE=' + JSON.stringify(result));
      } else {
        const failures = Object.entries(result.results).filter(([, value]) => !value).map(([key]) => key);
        assert.equal(failures.length, 0, JSON.stringify({ failures, details: result.details }));
        await evaluate('prepareNativeTabs()');
        for (const type of ['keyDown', 'keyUp']) await command('Input.dispatchKeyEvent', { type, key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
        assert.equal(await evaluate(`nativeTabs.state().currentIndex + ':' + document.activeElement.id`), '1:native-second', 'Native ArrowRight updates Tabs index and focuses the active tab');
        await evaluate(`nativeTabs.destroy();document.getElementById('native-tabs').remove()`);
        console.log(`[JquanUI] highfreq lifecycle ${entry} ok (${result.assertions + 1} assertions; real defaults, swipe, native keyboard, transitions, stable handles, RAF, cleanup)`);
      }
    }
  } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
