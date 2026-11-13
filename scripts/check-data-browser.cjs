'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const root = path.resolve(__dirname, '..');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
if (!fs.existsSync(edge)) throw new Error('Microsoft Edge is required for the Data browser check.');
function startServer() {
  const server = http.createServer((request, response) => {
    const relative = request.url === '/' ? 'scripts/data-browser-fixture.html' : request.url.slice(1);
    const file = path.resolve(root, relative);
    if (!file.startsWith(root) || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'text/html' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}
async function waitForJson(url, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { const response = await fetch(url); if (response.ok) return response.json(); } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
async function main() {
  const server = await startServer();
  const port = server.address().port;
  const debugPort = 9300 + Math.floor(Math.random() * 500);
  const profile = path.join(root, '.tmp', `edge-data-check-${Date.now()}`);
  const browser = spawn(edge, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  try {
    const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
    const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page = pages.find(item => item.type === 'page' && !String(item.url).startsWith('chrome-extension:')) || pages.find(item => item.type === 'page');
    const socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    socket.onmessage = event => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); } };
    const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (pending.delete(id)) reject(new Error(`CDP timeout: ${method}`)); }, 10000); });
    await command('Runtime.enable');
    await command('Page.enable');
    await command('Page.navigate', { url: `http://127.0.0.1:${port}/` });
    let status = '';
    for (let attempt = 0; attempt < 50 && status !== 'ok'; attempt += 1) {
      await sleep(100);
      const result = await command('Runtime.evaluate', { expression: 'document.body && document.body.dataset.status', returnByValue: true });
      status = result.result?.result?.value || '';
    }
    if (status !== 'ok') {
      const body = await command('Runtime.evaluate', { expression: 'JSON.stringify({ url: location.href, body: document.body && document.body.textContent })', returnByValue: true });
      throw new Error(`Browser Data fixture status: ${status || 'timeout'}: ${body.result?.result?.value || ''}`);
    }
    socket.close();
    console.log(`[JquanUI] Data browser check ok (${version.Browser || 'Edge'})`);
  } finally { server.close(); browser.kill(); }
}
main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
