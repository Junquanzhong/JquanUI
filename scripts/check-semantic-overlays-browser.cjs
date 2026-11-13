'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(file => fs.existsSync(file));
if (!browserPath) throw new Error('Set JQUAN_BROWSER to Chromium.');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js', components: '/dist/core/JquanUI@Core.js' };
const probe = process.argv.includes('--probe') ? process.argv[process.argv.indexOf('--probe') + 1] : null;
const expected = process.argv[process.argv.indexOf('--probe') + 2];
if (probe && !['baseline', 'modified', 'rollback-copy'].includes(probe)) throw new Error('Invalid probe');
const doc = require('vm').runInNewContext('(' + fs.readFileSync(path.join(root, 'content/components/overlayPreset.js'), 'utf8').split('export default ')[1].replace(/;\s*$/, '') + ')');
const template = doc.examples.find(example => example.id === 'semantic-minimum').code
  .replace('<script src="./dist/core/JquanUI@Core.js"></script>', '<!-- CORE_ENTRY -->')
  .replace(/<script src="\.\/dist\/components\/[^"]+"><\/script>\n?/g, '')
  .replace("{ ui: 'semantic', overlay: 'semantic' }", "JSON.parse(new URLSearchParams(location.search).get('presets'))");
async function main() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        response.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/') {
            const entry = url.searchParams.get('entry');
            if (!entries[entry]) { response.writeHead(400); response.end(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            const probes = probe ? ['overlayPreset', 'pagination'].map(name => `<script src="/verification/semantic-overlays/${probe}/dist/components/${name}.js"></script>`).join('') : '';
            const aggregate = entry === 'components' ? '<script src="/dist/components/JquanUI@components.js"></script>' : entry === 'full' ? '' : ['overlayManager','overlayPreset','msg','pagination','toast','popover','tooltip'].filter(name => !probe || !['overlayPreset','pagination'].includes(name)).map(name => `<script src="/dist/components/${name}.js"></script>`).join('');
            response.end(template.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>${probes}${aggregate}`)); return;
        }
        const file = path.resolve(root, decodeURIComponent(url.pathname).slice(1));
        const relative = path.relative(root, file);
        if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
        response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/plain');
        fs.createReadStream(file).pipe(response);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const debugPort = 10200 + Math.floor(Math.random() * 300);
    const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${path.join(root, '.tmp', `edge-semantic-theme-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let socket; const pending = new Map();
    try {
        let pages;
        for (let i = 0; i < 100 && !pages; i++) { try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`); if (response.ok) pages = await response.json(); } catch {} if (!pages) await delay(100); }
        assert(pages, 'Browser start timed out');
        socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
        let sequence = 0;
        socket.onmessage = event => { const message = JSON.parse(event.data); const item = pending.get(message.id); if (!item) return; clearTimeout(item.timer); pending.delete(message.id); if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result); };
        const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params })); });
        const evaluate = async expression => { const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value; };
        await command('Runtime.enable');
        await command('Emulation.setFocusEmulationEnabled', { enabled: true });
        const cases = probe ? [{ ui: 'semantic' }] : [{}, { ui: 'semantic' }, { ui: 'legacy', overlay: 'semantic' }, { ui: 'semantic', overlay: 'legacy' }];
        for (const entry of (probe ? ['core'] : Object.keys(entries))) {
          for (const presets of cases) {
            const query = '?entry=' + entry + '&presets=' + encodeURIComponent(JSON.stringify(presets));
            await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
            await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/${query}` });
            let ready = false;
            for (let i = 0; i < 100 && !ready; i++) {
              ready = await evaluate(`location.search === ${JSON.stringify(query)} && typeof semanticReady !== 'undefined'`);
              if (!ready) await delay(100);
            }
            assert(ready, 'Documentation example timed out');
            const result = await evaluate('semanticReady');
            assert(result.ok, result.error);
            // Measure settled colors independently of transition timing on busy CI hosts.
            await evaluate(`(() => { const style=document.createElement('style'); style.textContent='*,::before,::after{transition:none!important;animation:none!important}'; document.head.appendChild(style); })()`);
            const migrated = !probe || expected === 'new';
            const overlaySemantic = migrated && (presets.overlay ?? presets.ui) === 'semantic';
            const uiSemantic = migrated && presets.ui === 'semantic';
            const css = selector => evaluate(`(() => { const s = getComputedStyle(document.querySelector(${JSON.stringify(selector)})); return { bg:s.backgroundColor, text:s.color, border:s.borderTopColor, shadow:s.boxShadow }; })()`);
            const sample = async () => { await delay(250); return { msg:await css('.jq-msg'), button:await css('#pager [data-page="3"]'), active:await css('#pager [aria-current=page]'), muted:await css('.jq-pagination-total'), description:await css('[data-msg-description]') }; };
            const light = await sample();
            assert.equal(light.msg.bg, 'rgb(255, 255, 255)');
            assert.equal(light.button.bg, 'rgb(255, 255, 255)');
            await evaluate(`window.savedMsg=document.querySelector('.jq-msg'); window.savedButton=document.querySelector('#pager [data-page="3"]'); savedButton.focus(); document.documentElement.className='dark'; JquanUI.scan()`);
            const dark = await sample();
            assert.equal(dark.msg.bg, overlaySemantic ? 'rgb(15, 23, 42)' : light.msg.bg);
            assert.equal(dark.button.bg, uiSemantic ? 'rgb(15, 23, 42)' : light.button.bg);
            assert.equal(dark.msg.text, overlaySemantic ? 'rgb(241, 245, 249)' : light.msg.text);
            assert.equal(dark.description.text, overlaySemantic ? 'rgb(148, 163, 184)' : light.description.text);
            assert.equal(dark.muted.text, uiSemantic ? 'rgb(148, 163, 184)' : light.muted.text);
            assert.equal(dark.button.border, uiSemantic ? 'rgb(51, 65, 85)' : light.button.border);
            assert.equal(dark.active.text, uiSemantic ? 'rgb(96, 165, 250)' : light.active.text);
            assert(await evaluate(`document.querySelector('.jq-msg')===savedMsg && document.querySelector('#pager [data-page="3"]')===savedButton && document.activeElement===savedButton && semanticDemo.pager.state().page===2`), 'Theme switch replaced nodes/focus/page');
            if (probe) {
              console.log(`message=${dark.msg.bg}; pagination=${dark.button.bg}; page=2; preserved=true`);
              continue;
            }
            if (uiSemantic) assert(dark.button.shadow.includes('59, 130, 246') || dark.button.shadow.includes('0.231373 0.509804 0.964706'), dark.button.shadow);
            await evaluate(`document.querySelector('#mode').click()`);
            assert.equal((await sample()).msg.bg, light.msg.bg, 'Published toggle failed');
            await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
            assert.equal((await sample()).msg.bg, light.msg.bg, 'Explicit light lost');
            await evaluate(`document.documentElement.className=''`);
            assert.equal((await sample()).msg.bg, dark.msg.bg, 'System dark failed');
            await evaluate(`document.documentElement.className='light'; document.querySelector('#pager').className='dark'`);
            assert.equal((await sample()).button.bg, dark.button.bg, 'Local theme failed');
            assert.equal((await sample()).msg.bg, light.msg.bg, 'Body message inherited trigger scope');
            await evaluate(`document.querySelector('#pager').className=''; document.documentElement.className='dark'; JQUAN_CONFIG.themes={forest:{semantic:Object.assign({},JQUAN_CONFIG.theme.semantic,{surface:{light:'#ecfdf5',dark:'#064e3b'}})}}; JquanUI.setTheme('forest')`);
            assert.equal((await sample()).msg.bg, overlaySemantic ? 'rgb(6, 78, 59)' : light.msg.bg);
            assert.equal((await sample()).button.bg, uiSemantic ? 'rgb(6, 78, 59)' : light.button.bg);
            await evaluate(`JquanUI.setTheme('default'); savedButton.click()`);
            assert.equal(await evaluate('semanticDemo.pager.state().page'), 3, 'Pagination click failed');
            await evaluate(`semanticDemo.pager.update({classes:{buttonDefault:'bg-red-100 text-red-700'}}); JquanUI.scan()`);
            await delay(250);
            assert.equal((await css('#pager [data-page="4"]')).bg, 'rgb(254, 226, 226)', 'Class override lost');
            await evaluate(`(async () => {
              const toastApi=JquanUIComponents.toastApi;
              window.themeToast=toastApi.show({title:'Toast',description:'description',type:'success',duration:0});
              const popoverApi=JquanUIComponents.popoverApi;
              const node=document.createElement('div'); node.id='pop'; node.innerHTML='<button jq-popover-trigger>Open</button><div jq-popover-panel><button>Content</button></div>'; document.body.appendChild(node);
              window.themePopover=popoverApi.mount(node); popoverApi.open(node);
              JquanUI.use(JquanUIComponents.tooltip);
              const tip=document.createElement('button'); tip.id='tip'; tip.setAttribute('data-tips','Hint'); document.body.appendChild(tip);
              JquanUI.scan();
            })()`);
            await delay(250);
            assert.equal((await css('.jq-toast')).bg, dark.msg.bg);
            assert.equal((await css('.jq-popover-panel')).bg, dark.msg.bg);
            assert.equal((await css('[data-popover-arrow]')).bg, dark.msg.bg);
            await evaluate(`document.querySelector('#tip').focus()`);
            await delay(250);
            assert.equal((await css('.jq-tooltip')).text, 'rgb(255, 255, 255)', 'Tooltip inverse contrast lost');
            if (overlaySemantic) assert.equal((await css('.jq-msg > span')).bg, 'rgb(20, 83, 45)', 'Success dark tone missing');
            await evaluate(`themePopover.destroy(); themeToast.close(); window.dispose()`);
            await delay(250);
            assert(await evaluate(`!document.querySelector('.jq-msg') && !document.querySelector('.jq-toast') && !document.querySelector('#pager').children.length`), 'Example teardown failed');
            console.log(`[JquanUI] semantic overlays ${entry}/${JSON.stringify(presets)} ok (colors, system/local/theme, nodes/focus/page, overrides, tooltip, teardown)`);
          }
        }
        if (!probe) console.log('[JquanUI] semantic overlays browser check ok (16 scenarios; Core, minified, Full, Components)');
    } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
