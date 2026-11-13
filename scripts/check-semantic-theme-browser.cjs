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
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js' };
const baseline = process.argv.includes('--baseline');
const docSource = fs.readFileSync(path.join(root, 'content/components/uiPreset.js'), 'utf8');
const doc = require('vm').runInNewContext('(' + docSource.replace(/^\/\/[^\n]*\nexport default /, '').replace(/;\s*$/, '') + ')');
const probes = '<div id="scope"><div id="local" class="bg-surface text-text border border-border">局部主题</div></div><div id="alpha" class="bg-surface/90">透明度</div><div id="legacy" class="bg-white/90 text-slate-700">旧类</div><button id="accent" class="bg-accent">品牌色</button>';
const template = baseline ? fs.readFileSync(path.join(root, 'scripts/semantic-theme-browser-fixture.html'), 'utf8') : doc.examples.find(example => example.id === 'semantic-minimum').code
    .replace('<script src="./dist/core/JquanUI@Core.js"></script>', '<!-- CORE_ENTRY -->')
    .replace("ui: 'semantic'", "ui: new URLSearchParams(location.search).get('mode')")
    .replace('<div id="table"></div>', '<div id="table"></div>' + probes);

async function main() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        response.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/') {
            const entry = url.searchParams.get('entry');
            if (!entries[entry]) { response.writeHead(400); response.end(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(template.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>`)); return;
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
        for (const entry of Object.keys(entries)) {
          for (const mode of ['legacy', 'semantic']) {
            const query = `?entry=${entry}&mode=${mode}`;
            await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
            await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/${query}` });
            let ready = false;
            for (let i = 0; i < 100 && !ready; i++) {
              ready = await evaluate(`location.search === '${query}' && typeof window.themeReady !== 'undefined'`);
              if (!ready) await delay(100);
            }
            assert(ready, `${entry}/${mode} fixture timed out`);
            const result = await evaluate('themeReady');
            assert(result.ok, `${entry}/${mode}: ${result.error}`);
            const semantic = mode === 'semantic' && !baseline;
            const sample = async () => { await delay(250); return evaluate(`(() => {
              const css = selector => getComputedStyle(document.querySelector(selector));
              return { bg: css('.jq-table-scroll').backgroundColor, text: css('.jq-table').color,
                border: css('.jq-table-scroll').borderTopColor, muted: css('.jq-table-toolbar').color,
                head: css('.jq-table thead tr').backgroundColor, cell: css('.jq-table th').color,
                button: css('#table [data-action=refresh]').backgroundColor,
                local: css('#local').backgroundColor, alpha: css('#alpha').backgroundColor,
                legacy: css('#legacy').backgroundColor, accent: css('#accent').backgroundColor };
            })()`); };
            let light = await sample();
            assert.equal(light.bg, 'rgb(255, 255, 255)');
            assert.equal(light.text, 'rgb(51, 65, 85)');
            assert.equal(light.head, 'rgb(248, 250, 252)');
            await evaluate(`window.preservedTable = document.querySelector('.jq-table'); window.preservedButton = document.querySelector('#table [data-action=refresh]'); preservedButton.focus(); document.documentElement.className = 'dark'`);
            let dark = await sample();
            assert.equal(dark.bg, semantic ? 'rgb(15, 23, 42)' : light.bg, JSON.stringify(await evaluate(`({mode: JquanUIComponents.uiPreset.mode, config: JQUAN_CONFIG.componentPresets, cls: document.querySelector('.jq-table-scroll').className})`)));
            assert.equal(dark.text, semantic ? 'rgb(241, 245, 249)' : light.text);
            assert.equal(dark.cell, semantic ? 'rgb(241, 245, 249)' : light.cell);
            assert.equal(dark.head, semantic ? 'rgb(30, 41, 59)' : light.head);
            assert.equal(dark.button, semantic ? 'rgb(15, 23, 42)' : light.button, JSON.stringify(await evaluate(`({cls: document.querySelector('#table [data-action=refresh]').className, mode: JquanUIComponents.uiPreset.mode, parent: document.querySelector('.jq-table-toolbar').outerHTML})`)));
            assert.equal(dark.border, semantic ? 'rgb(51, 65, 85)' : light.border);
            if (semantic) {
              const states = await evaluate(`(async () => {
                const host = document.createElement('div'); document.body.appendChild(host);
                const handle = await JquanUIComponents.tableApi.mount(host, { columns: [{ key: 'name', title: '名称' }], data: [] });
                JquanUI.scan();
                const empty = getComputedStyle(host.querySelector('.jq-table-empty')).color;
                handle.destroy(); host.remove();
                return { empty, focus: getComputedStyle(preservedButton).boxShadow, description: getComputedStyle(document.querySelector('.jq-table-toolbar-main > div')).color };
              })()`);
              assert.equal(states.empty, 'rgb(148, 163, 184)');
              assert.equal(states.description, 'rgb(148, 163, 184)');
              assert(states.focus.includes('59, 130, 246') || states.focus.includes('0.231373 0.509804 0.964706'), `Semantic focus ring missing: ${states.focus}`);
            }
            assert.equal(dark.legacy, light.legacy, 'Historical bg-white/90 changed');
            assert.equal(dark.alpha, 'color(srgb 0.0588235 0.0901961 0.164706 / 0.9)');
            assert(await evaluate(`document.querySelector('.jq-table') === preservedTable && document.activeElement === preservedButton`), 'Theme switching replaced DOM or lost focus');
            await evaluate(`document.documentElement.className = 'light'; document.querySelector('#scope').className = 'dark'`);
            assert.equal((await sample()).local, 'rgb(15, 23, 42)', 'Local dark scope did not inherit role values');
            assert.equal((await sample()).bg, light.bg, 'Local dark leaked into Table');
            await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
            assert.equal((await sample()).bg, light.bg, 'Explicit light did not override system dark');
            await evaluate(`document.documentElement.className = ''`);
            assert.equal((await sample()).bg, dark.bg, 'System dark did not activate');
            await evaluate(`
              JQUAN_CONFIG.themes = { forest: { semantic: Object.assign({}, JQUAN_CONFIG.theme.semantic, {
                accent: { light: '#059669', dark: '#10b981' }
              }) } };
              JquanUI.setTheme('forest');
            `);
            assert.equal((await sample()).accent, 'rgb(16, 185, 129)');
            await evaluate(`JquanUI.setTheme('default')`);
            assert.equal((await sample()).accent, 'rgb(96, 165, 250)');
            if (semantic) {
              await evaluate(`(async () => { document.documentElement.className = 'light'; themeTable.destroy(); window.themeTable = await JquanUIComponents.tableApi.mount('#table', { columns: [{key:'name',title:'名称'}], data: [], classes: { scroll: 'jq-table-scroll bg-red-100', table: 'jq-table text-red-700' } }); JquanUI.scan(); })()`);
              assert.equal((await evaluate(`getComputedStyle(document.querySelector('.jq-table-scroll')).backgroundColor`)), 'rgb(254, 226, 226)', 'classes override lost');
            }
            await evaluate('themeTable.destroy()');
            console.log(`[JquanUI] semantic theme ${entry}/${mode} ok (${baseline ? 'baseline: opt-in inactive' : 'light/dark/system/local, theme reset, DOM/focus, alpha, legacy compatibility'})`);
          }
        }
        console.log(`[JquanUI] semantic theme browser ${process.argv.includes('--baseline') ? 'baseline' : 'check'} ok (6 scenarios; Core, minified, Full)`);

    } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
