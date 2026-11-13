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
const template = fs.readFileSync(path.join(root, 'scripts/table-browser-fixture.html'), 'utf8');

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
    const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${path.join(root, '.tmp', `edge-table-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
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
            await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/?entry=${entry}` });
            let ready = false;
            for (let i = 0; i < 100 && !ready; i++) { ready = await evaluate(`location.search === '?entry=${entry}' && typeof window.tableCheck !== 'undefined'`); if (!ready) await delay(100); }
            assert(ready, `${entry} fixture initialization timed out`);
            const result = await evaluate('window.tableCheck'); assert(result.ok, `${entry}: ${result.error}`);
            for (const [key, code, virtualKey, expected] of [['Enter', 'Enter', 13, 'asc'], [' ', 'Space', 32, 'desc'], ['Enter', 'Enter', 13, '']]) {
                await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text: key === 'Enter' ? '\r' : ' ', unmodifiedText: key === 'Enter' ? '\r' : ' ', windowsVirtualKeyCode: virtualKey });
                await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKey });
                const keyboard = await evaluate(`({order: keyboardTable.state().sort.order, aria: document.querySelector('#local th').getAttribute('aria-sort'), focused: document.activeElement === document.querySelector('#local [data-sort-key]'), submits: tableSubmits()})`);
                assert.equal(keyboard.order, expected, `${entry} native ${code} sorting failed`);
                assert.equal(keyboard.aria, expected === 'asc' ? 'ascending' : expected === 'desc' ? 'descending' : 'none');
                assert(keyboard.focused && keyboard.submits === 0, `${entry} focus/submission regression`);
            }
            await evaluate('keyboardTable.destroy()');
            console.log(`[JquanUI] table browser ${entry} ok (${result.assertions} fixture assertions; native Enter/Space, focus, aria-sort)`);
        }
        console.log('[JquanUI] table browser check ok (Core, minified, Full)');
    } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
