#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const value = name => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const sourceRoot = path.resolve(value('--root') || root);
const legacy = process.argv.includes('--legacy');
const probe = process.argv.includes('--probe');
const pkg = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'package.json')));
const entries = { core: 'dist/core/JquanUI@Core.js', min: 'js/JquanUI@core.min.js', full: 'dist/full/JquanUI@full.js' };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const browserPath = process.env.JQUAN_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
  assert(browserPath, 'Set JQUAN_BROWSER to Chromium');
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/fixture') {
      const mode = url.searchParams.get('mode');
      let src = '/' + entries[url.searchParams.get('entry') || 'core'];
      if (mode === 'dist-only') src = '/deploy/dist/core/JquanUI@Core.js';
      if (mode === 'bundled') src = '/assets/app.js';
      const config = mode === 'bundled' ? 'window.JQUAN_CONFIG={componentLoader:{baseURL:"/assets/jquan-components/"}};' : '';
      res.setHeader('Content-Type', 'text/html;charset=utf-8');
      res.end(`<!doctype html><html><head><script>localStorage.clear();window.readyDetail=null;document.addEventListener('jquan:ready',e=>readyDetail=e.detail);${config}</script><script src="${src}"></script></head><body><main class="grid gap-4" id="target">entry check</main></body></html>`);
      return;
    }
    let relative = decodeURIComponent(url.pathname).slice(1);
    // These virtual mounts expose only the copied deployment tree, never /js.
    if (relative.startsWith('deploy/')) relative = relative.slice(7);
    if (relative === 'assets/app.js') relative = entries.core;
    if (relative.startsWith('assets/jquan-components/')) relative = 'dist/components/' + relative.slice(24);
    const file = path.resolve(sourceRoot, relative);
    if (!file.startsWith(sourceRoot + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', 'text/javascript;charset=utf-8');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = 16000 + Math.floor(Math.random() * 1000);
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(root, '.tmp', 'distribution-' + Date.now())}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket, seq = 0;
  const pending = new Map();
  try {
    let pages;
    for (let i = 0; i < 100 && !pages; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch {} if (!pages) await delay(100); }
    assert(pages, 'Browser launch timeout');
    socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = event => {
      const message = JSON.parse(event.data), task = pending.get(message.id);
      if (!task) return;
      clearTimeout(task.timer); pending.delete(message.id);
      message.error ? task.reject(Error(JSON.stringify(message.error))) : task.resolve(message.result);
    };
    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++seq, timer = setTimeout(() => { pending.delete(id); reject(Error(method + ' timeout')); }, 20000);
      pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await command('Page.enable');
    async function navigate(query) {
      await evaluate('window.previousDistributionPage=true');
      await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/fixture?${query}` });
      for (let i = 0; i < 120; i++) {
        if (await evaluate('!window.previousDistributionPage&&document.readyState==="complete"&&!!window.JquanUI&&JquanUI.isReady()')) return;
        await delay(30);
      }
      throw Error('Navigation timeout: ' + query);
    }
    for (const entry of Object.keys(entries)) {
      await navigate('entry=' + entry);
      const result = await evaluate(`(()=>({version:JquanUI.version,engineVersion:typeof JquanUI.engineVersion==='string'?JquanUI.engineVersion:null,versionLabel:typeof JquanUI.versionLabel==='string'?JquanUI.versionLabel:null,debug:JquanUI.debug().version,metrics:JquanUI.getMetrics().version,ready:readyDetail.version,grid:getComputedStyle(document.getElementById('target')).display,checkClasses:typeof JquanUI.checkClasses,review:!!window.JquanUIComponents?.reviewMode}))()`);
      assert.equal(result.version, pkg.version + ' (Enterprise Plugin Lifecycle)');
      assert.equal(result.engineVersion, legacy ? null : pkg.version);
      assert.equal(result.versionLabel, legacy ? null : 'Enterprise Plugin Lifecycle');
      for (const field of ['debug', 'metrics', 'ready']) assert.equal(result[field], pkg.version);
      assert.equal(result.grid, 'grid'); assert.equal(result.checkClasses, 'function'); assert.equal(result.review, false);
      console.log(`${legacy ? 'LEGACY' : 'CURRENT'} ${entry} ${JSON.stringify(result)}`);
    }
    if (!probe) {
      for (const mode of ['repository', 'dist-only', 'bundled']) {
        await navigate('entry=' + (mode === 'repository' ? 'min' : 'core') + '&mode=' + mode);
        const result = await evaluate(`(async()=>{const dom=await JquanUI.import('dom');return {loaded:dom===JquanUIComponents.domApi,script:Array.from(document.scripts).find(s=>s.src.endsWith('/dom.js'))?.getAttribute('src'),grid:getComputedStyle(document.getElementById('target')).display}})()`);
        assert.equal(result.loaded, true); assert.equal(result.grid, 'grid');
        const expected = mode === 'repository' ? '/dist/components/dom.js' : mode === 'dist-only' ? '/deploy/dist/components/dom.js' : '/assets/jquan-components/dom.js';
        assert.equal(new URL(result.script).pathname, expected);
        console.log('IMPORT ' + mode + ' ' + JSON.stringify({ loaded: result.loaded, path: expected, grid: result.grid }));
      }
      // Exercise actual npm exports in Node: browser subpaths are intentional no-ops.
      const node = spawnSync(process.execPath, ['-e', `const assert=require('node:assert/strict');for(const p of ['jquanui/core','jquanui/full','jquanui/components/dom'])require(p);assert.equal(global.JquanUI,undefined);assert.equal(typeof require('jquanui').extractFromSource,'function');console.log('NODE exports: browser no-op; root extraction available');`], { cwd: root, encoding: 'utf8', windowsHide: true });
      assert.equal(node.status, 0, node.stderr); process.stdout.write(node.stdout);
      const esm = spawnSync(process.execPath, ['--input-type=module', '-e', `import 'jquanui/core';import {extractFromSource} from 'jquanui';if(globalThis.JquanUI!==undefined||typeof extractFromSource!=='function')throw Error('ESM export mismatch');console.log('NODE ESM: browser no-op; root extraction available');`], { cwd: root, encoding: 'utf8', windowsHide: true });
      assert.equal(esm.status, 0, esm.stderr); process.stdout.write(esm.stdout);
    }
  } finally {
    for (const task of pending.values()) clearTimeout(task.timer);
    socket?.close(); browser.kill(); await new Promise(resolve => server.close(resolve));
  }
  console.log('[JquanUI] distribution contract ok');
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
