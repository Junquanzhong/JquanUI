'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const browserPath = process.env.JQUAN_BROWSER || [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'
].find(file => fs.existsSync(file));
if (!browserPath) throw new Error('Set JQUAN_BROWSER to a Chromium browser.');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const entries = { core: '/dist/core/JquanUI@Core.js', min: '/js/JquanUI@core.min.js', full: '/dist/full/JquanUI@full.js' };
const template = fs.readFileSync(path.join(root, 'scripts/component-import-fixture.html'), 'utf8');
const requests = [];
const retries = new Map();

async function main() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        requests.push(url.pathname);
        response.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/nested/page.html') {
            const entry = url.searchParams.get('entry');
            if (!entries[entry]) { response.writeHead(400); response.end(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.setHeader('Content-Security-Policy', "script-src 'nonce-component-import-test'; style-src 'unsafe-inline'");
            response.end(template.replace('<!-- CORE_ENTRY -->', `<script nonce="component-import-test" src="${entries[entry]}"></script>`));
            return;
        }
        let relative = decodeURIComponent(url.pathname).slice(1);
        if (/^retry-(core|min|full)\/watermark\.js$/.test(relative)) {
            const count = (retries.get(relative) || 0) + 1;
            retries.set(relative, count);
            if (count === 1) { response.writeHead(404); response.end('retry fixture'); return; }
            relative = 'dist/components/watermark.js';
        }
        const file = path.resolve(root, relative);
        const inRoot = path.relative(root, file);
        if (inRoot.startsWith('..') || path.isAbsolute(inRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
        response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/plain');
        fs.createReadStream(file).pipe(response);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const debugPort = 9900 + Math.floor(Math.random() * 300);
    const profile = path.join(root, '.tmp', `edge-component-import-${Date.now()}`);
    const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let socket;
    const pending = new Map();
    try {
        let pages;
        for (let i = 0; i < 100 && !pages; i++) {
            try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`); if (response.ok) pages = await response.json(); } catch {}
            if (!pages) await delay(100);
        }
        assert(pages, 'Browser debugging endpoint timed out');
        const page = pages.find(item => item.type === 'page');
        socket = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
        let sequence = 0;
        socket.onmessage = event => {
            const message = JSON.parse(event.data);
            const entry = pending.get(message.id);
            if (!entry) return;
            clearTimeout(entry.timer);
            pending.delete(message.id);
            if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
            else entry.resolve(message.result);
        };
        function command(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = ++sequence;
                const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
                pending.set(id, { resolve, reject, timer });
                socket.send(JSON.stringify({ id, method, params }));
            });
        }
        await command('Runtime.enable');
        for (const entry of Object.keys(entries)) {
            const offset = requests.length;
            await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/nested/page.html?entry=${entry}` });
            let ready = false;
            for (let i = 0; i < 100 && !ready; i++) {
                const evaluated = await command('Runtime.evaluate', { expression: `location.search === '?entry=${entry}' && typeof window.importCheck !== 'undefined'`, returnByValue: true });
                ready = evaluated.result?.value === true;
                if (!ready) await delay(100);
            }
            assert(ready, `Import fixture did not initialize: ${entry}`);
            const evaluated = await command('Runtime.evaluate', { expression: 'window.importCheck', awaitPromise: true, returnByValue: true });
            assert(!evaluated.exceptionDetails, JSON.stringify(evaluated.exceptionDetails));
            const result = evaluated.result.value;
            assert(result.ok, `${entry}: ${result.error}`);
            const current = requests.slice(offset);
            assert.equal(current.filter(url => url === '/dist/components/dom.js').length, 1, `${entry}: DOM downloaded more than once`);
            assert.equal(current.filter(url => url === `/retry-${entry}/watermark.js`).length, 2, `${entry}: retry did not request again`);
            if (entry === 'full') assert.equal(current.filter(url => url === '/dist/components/table.js').length, 0, 'Full should reuse registered Table');
            console.log(`[JquanUI] component import browser ${entry} ok (${result.installed} installed, ${result.scripts} scripts)`);
        }
        console.log('[JquanUI] component import browser check ok (Core, minified, Full; CSP, dependencies, DOM/Table, dedupe, retry)');
    } finally {
        for (const value of pending.values()) clearTimeout(value.timer);
        socket?.close();
        browser.kill();
        server.close();
    }
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
