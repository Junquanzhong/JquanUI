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
const probeFile = process.argv.includes('--probe') ? process.argv[process.argv.indexOf('--probe') + 1] : null;
const expectedProbe = probeFile ? process.argv[process.argv.indexOf('--probe') + 2] : null;
const onlyEntry = process.argv.includes('--entry') ? process.argv[process.argv.indexOf('--entry') + 1] : null;
if (onlyEntry && !entries[onlyEntry]) throw new Error('Invalid entry');
if (probeFile && !/^[A-Za-z0-9_.-]+\.js$/.test(probeFile)) throw new Error('Invalid probe file');
const template = fs.readFileSync(path.join(root, 'scripts/modal-browser-fixture.html'), 'utf8');

async function main() {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        response.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/') {
            const entry = url.searchParams.get('entry');
            if (!entries[entry]) { response.writeHead(400); response.end(); return; }
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            const probeScripts = probeFile ? `<script>window.modalProbe=true;</script><script src="/dist/components/overlayPreset.js"></script><script src="/verification/modal-overlay/${probeFile}"></script>` : '';
            response.end(template.replace('<!-- CORE_ENTRY -->', `<script src="${entries[entry]}"></script>`).replace('<!-- PROBE_SCRIPTS -->', probeScripts)); return;
        }
        const file = path.resolve(root, decodeURIComponent(url.pathname).slice(1));
        const relative = path.relative(root, file);
        if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
        response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/plain');
        fs.createReadStream(file).pipe(response);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const debugPort = 10200 + Math.floor(Math.random() * 300);
    const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${path.join(root, '.tmp', `edge-modal-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let socket; const pending = new Map();
    try {
        let pages;
        for (let i = 0; i < 100 && !pages; i++) { try { const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`); if (response.ok) pages = await response.json(); } catch {} if (!pages) await delay(100); }
        assert(pages, 'Browser start timed out');
        socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
        let sequence = 0; let checkpoint = "boot";
        socket.onmessage = event => { const message = JSON.parse(event.data); if (message.method === "Runtime.consoleAPICalled" && message.params.args[0]?.value === "modal-check") checkpoint = message.params.args[1]?.value; const item = pending.get(message.id); if (!item) return; clearTimeout(item.timer); pending.delete(message.id); if (message.error) item.reject(new Error(item.label + " after " + checkpoint + ": " + JSON.stringify(message.error))); else item.resolve(message.result); };
        const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000); pending.set(id, { resolve, reject, timer, label: method + " " + (params.expression || "") }); socket.send(JSON.stringify({ id, method, params })); });
        const evaluate = async expression => { const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value; };
        await command('Runtime.enable');
        await command('Emulation.setFocusEmulationEnabled', { enabled: true });
        for (const entry of (probeFile ? ['core'] : onlyEntry ? [onlyEntry] : Object.keys(entries))) {
            await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/?entry=${entry}` });
            let ready = false;
            for (let i = 0; i < 100 && !ready; i++) { ready = await evaluate(`location.search === '?entry=${entry}' && typeof window.modalReady !== 'undefined'`); if (!ready) await delay(100); }
            assert(ready, `${entry} fixture initialization timed out`);
            await evaluate('modalReady');
            let fixtureResult;
            if (!probeFile) fixtureResult = await evaluate('runModalChecks()');
            await evaluate('prepareModalKeyboard()');
            if (!probeFile) {
                await evaluate("document.getElementById('modal-last').focus()");
                for (const modifiers of [0, 8]) {
                    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers });
                    await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers });
                    const wrapped = await evaluate(modifiers ? "document.activeElement.id === 'modal-last'" : "document.activeElement === keyboardModal.element().querySelector('.jq-modal-close')");
                    assert(wrapped, entry + ' native Modal Tab wrap');
                }
            }
            await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
            await delay(260);
            const state = await evaluate('modalKeyboardState()');
            const output = 'dialog=' + state.dialog + ' modal=' + state.modal + ' overflow=' + state.overflow;
            const expected = probeFile && expectedProbe === 'old' ? 'dialog=closed modal=closed overflow=hidden' : 'dialog=open modal=closed overflow=hidden';
            assert.equal(output, expected, entry + ' Escape stacking regression');
            if (probeFile) console.log(output);
            else {
                assert.equal(state.focus, 'dialog-launch-modal', entry + ' native Escape focus restoration');
                await evaluate("document.getElementById('dialog-close').focus()");
                for (const modifiers of [0, 8]) {
                    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers });
                    await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers });
                    assert.equal(await evaluate('document.activeElement.id'), modifiers ? 'dialog-close' : 'dialog-first', entry + ' native Tab wrap');
                }
                await evaluate('JquanUIComponents.overlayManagerApi.destroy()');
                assert.equal(await evaluate('document.body.style.overflow'), 'scroll');
                console.log('[JquanUI] modal browser ' + entry + ' ok (' + fixtureResult.assertions + ' fixture assertions; native Escape/Tab, focus, scroll)');
            }
        }
        if (!probeFile) console.log('[JquanUI] modal browser check ok (' + (onlyEntry || 'Core, minified, Full') + ')');
    } finally { for (const item of pending.values()) clearTimeout(item.timer); socket?.close(); browser.kill(); server.close(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
