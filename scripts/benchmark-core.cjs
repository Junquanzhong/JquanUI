#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { performance } = require('perf_hooks');
const { spawn, spawnSync } = require('child_process');
const extractor = require('../dist/cli/jquan-extract.cjs');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const args = process.argv.slice(2);
const checkBudgets = args.includes('--check');
const valueAfter = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const samples = Math.max(1, Math.min(10, Number(valueAfter('--samples')) || 3));
const outputPath = path.resolve(root, valueAfter('--output') || 'reports/core-performance.json');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const budgets = {
  smallColdMs: 750,
  largeColdMs: 2000,
  warmStartMs: 750,
  mutationBatchMs: 1000,
  shadowAdoptMs: 750,
  buildExtractionMs: 2000
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function resolveBrowserExecutable() {
  const candidates = [
    process.env.JQUAN_BROWSER,
    process.platform === 'win32' && 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    process.platform === 'win32' && 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.platform === 'win32' && 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    process.platform === 'darwin' && '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    process.platform === 'darwin' && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    process.platform === 'linux' && 'microsoft-edge',
    process.platform === 'linux' && 'google-chrome',
    process.platform === 'linux' && 'chromium'
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (path.isAbsolute(candidate) && fs.existsSync(candidate)) return candidate;
    if (!path.isAbsolute(candidate)) {
      const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [candidate], { encoding: 'utf8' });
      const resolved = probe.status === 0 && String(probe.stdout).split(/\r?\n/).find(Boolean);
      if (resolved) return resolved.trim();
    }
  }
  throw new Error('Chromium browser not found. Set JQUAN_BROWSER to an Edge, Chrome, or Chromium executable.');
}

function contentType(file) {
  if (file.endsWith('.js') || file.endsWith('.mjs')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  return 'application/octet-stream';
}

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    const relative = pathname === '/' ? 'scripts/core-performance-fixture.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, { 'Content-Type': contentType(file), 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function waitForJson(url, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function connectCdp(browserExecutable, serverPort) {
  const debugPort = 10000 + Math.floor(Math.random() * 2000);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jquan-core-benchmark-'));
  const browser = spawn(browserExecutable, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { windowsHide: true, stdio: 'ignore' });
  const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
  const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
  const page = pages.find(item => item.type === 'page' && !String(item.url).startsWith('chrome-extension:')) || pages[0];
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const entry = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error) entry.reject(new Error(message.error.message));
    else entry.resolve(message.result);
  };
  const command = (method, params = {}, timeoutMs = 15000) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await command('Runtime.enable');
  await command('Page.enable');

  async function runScenario(scenario, options = {}) {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const query = new URLSearchParams({
      scenario,
      clear: options.clear ? '1' : '0',
      persist: options.persist ? '1' : '0',
      nonce
    });
    const url = `http://127.0.0.1:${serverPort}/?${query}`;
    await command('Page.navigate', { url });
    const startedAt = Date.now();
    while (Date.now() - startedAt < 20000) {
      await sleep(25);
      try {
        const evaluated = await command('Runtime.evaluate', {
          expression: `JSON.stringify({ nonce: new URLSearchParams(location.search).get('nonce'), status: document.body && document.body.dataset.status, result: window.__JQUAN_BENCHMARK__, error: window.__JQUAN_BENCHMARK_ERROR__ })`,
          returnByValue: true
        });
        const value = evaluated.result && evaluated.result.value ? JSON.parse(evaluated.result.value) : null;
        if (!value || value.nonce !== nonce) continue;
        if (value.status === 'error') throw new Error(value.error || `${scenario} fixture failed`);
        if (value.status === 'ok') return value.result;
      } catch (error) {
        if (/fixture failed|benchmark|ShadowRoot/.test(error.message)) throw error;
      }
    }
    throw new Error(`${scenario} browser benchmark timed out`);
  }

  return {
    version: version.Browser || 'Chromium',
    runScenario,
    async close() {
      socket.close();
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(browser.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        const escapedProfile = profile.replace(/'/g, "''");
        spawnSync('powershell.exe', [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -like '*${escapedProfile}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`
        ], { windowsHide: true, stdio: 'ignore' });
      } else {
        browser.kill();
      }
      if (browser.exitCode === null) {
        await Promise.race([
          new Promise(resolve => browser.once('exit', resolve)),
          sleep(2000)
        ]);
      }
      await sleep(250);
      try {
        fs.rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
      } catch (error) {
        console.warn(`[JquanUI] Temporary browser profile cleanup deferred: ${error.message}`);
      }
    }
  };
}

function summarize(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return {
    samples: values.map(value => Number(value.toFixed(2))),
    minMs: Number(sorted[0].toFixed(2)),
    medianMs: Number(median.toFixed(2)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(2))
  };
}

function benchmarkExtraction() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jquan-core-extraction-'));
  try {
    const input = path.join(fixture, 'index.html');
    const rows = Array.from({ length: 2500 }, (_, index) => `<article class="flex items-center gap-2 rounded-lg border border-slate-200 p-4 text-sm mt-[${index % 180}px]"></article>`).join('');
    fs.writeFileSync(input, `<main>${rows}</main>`, 'utf8');
    const durations = [];
    let lastResult = null;
    for (let index = 0; index < samples; index++) {
      const startedAt = performance.now();
      lastResult = extractor.extractFromFiles([input], {
        core: path.join(root, 'dist/core/JquanUI@Core.js'),
        root: fixture,
        minify: true
      });
      durations.push(performance.now() - startedAt);
    }
    assert(lastResult.report.classCount >= 180, 'build extraction did not discover the large fixture class set');
    assert(lastResult.report.ruleCount >= 180, 'build extraction did not emit the expected utility rules');
    return Object.assign(summarize(durations), {
      fileCount: lastResult.files.length,
      classCount: lastResult.report.classCount,
      ruleCount: lastResult.report.ruleCount,
      cssBytes: lastResult.report.cssBytes
    });
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

async function main() {
  const server = await startServer();
  const browserExecutable = resolveBrowserExecutable();
  const cdp = await connectCdp(browserExecutable, server.address().port);
  try {
    const small = [];
    const large = [];
    const warm = [];
    const mutation = [];
    const shadow = [];
    let lastLarge = null;
    let lastWarm = null;
    let lastMutation = null;
    let lastShadow = null;

    for (let index = 0; index < samples; index++) {
      small.push((await cdp.runScenario('small', { clear: true })).durationMs);
      lastLarge = await cdp.runScenario('large', { clear: true, persist: true });
      large.push(lastLarge.durationMs);
      assert(lastLarge.cacheStored, 'cold large benchmark did not persist a warm-start cache');
      lastWarm = await cdp.runScenario('warm');
      warm.push(lastWarm.durationMs);
      assert(lastWarm.metrics.cacheHydrate === 'hit', 'warm benchmark did not hydrate the runtime cache');
      lastMutation = await cdp.runScenario('mutation', { clear: true });
      mutation.push(lastMutation.durationMs);
      assert(lastMutation.metrics.failedRuleCount === 0, 'mutation benchmark produced failed rules');
      lastShadow = await cdp.runScenario('shadow', { clear: true });
      shadow.push(lastShadow.durationMs);
      assert(lastShadow.styleMode === 'constructable', 'ShadowRoot benchmark did not use Constructable Stylesheets');
      assert(lastShadow.engineSheetCount === lastShadow.shadowRootCount * 2, 'ShadowRoot benchmark did not adopt both theme and runtime sheets');
      assert(lastShadow.adoptedSheetCount === lastShadow.engineSheetCount + 1, 'ShadowRoot benchmark did not preserve the third-party sheet');
      assert(lastShadow.lifecycleSetups === 1, 'ShadowRoot benchmark did not initialize plugin behavior exactly once');
      assert(lastShadow.themeInheritance && lastShadow.themeInheritance.lightColor !== lastShadow.themeInheritance.darkColor, 'ShadowRoot benchmark did not verify local theme inheritance');
    }

    const extraction = benchmarkExtraction();
    const coreSource = fs.readFileSync(path.join(root, 'dist/core/JquanUI@Core.js'));
    const coreMinified = fs.readFileSync(path.join(root, 'js/JquanUI@core.min.js'));
    const scenarios = {
      smallCold: Object.assign(summarize(small), { nodeCount: 32 }),
      largeCold: Object.assign(summarize(large), { nodeCount: 2500, processedClassCount: lastLarge.metrics.processedClassCount }),
      warmStart: Object.assign(summarize(warm), { cacheHydrate: lastWarm.metrics.cacheHydrate, cacheBytes: lastWarm.metrics.cacheBytes }),
      mutationBatch: Object.assign(summarize(mutation), { mutationCount: lastMutation.mutationCount }),
      shadowAdopt: Object.assign(summarize(shadow), { shadowRootCount: lastShadow.shadowRootCount, styleMode: lastShadow.styleMode }),
      buildExtraction: extraction
    };
    const budgetResults = {
      smallCold: scenarios.smallCold.medianMs <= budgets.smallColdMs,
      largeCold: scenarios.largeCold.medianMs <= budgets.largeColdMs,
      warmStart: scenarios.warmStart.medianMs <= budgets.warmStartMs,
      mutationBatch: scenarios.mutationBatch.medianMs <= budgets.mutationBatchMs,
      shadowAdopt: scenarios.shadowAdopt.medianMs <= budgets.shadowAdoptMs,
      buildExtraction: scenarios.buildExtraction.medianMs <= budgets.buildExtractionMs
    };
    const report = {
      version: pkg.version,
      generatedAt: new Date().toISOString(),
      samples,
      browser: cdp.version,
      environment: {
        platform: process.platform,
        arch: process.arch,
        node: process.version,
        cpu: os.cpus()[0] && os.cpus()[0].model,
        cpuCount: os.cpus().length,
        memoryBytes: os.totalmem()
      },
      budgets,
      budgetResults,
      passed: Object.values(budgetResults).every(Boolean),
      coreBytes: {
        source: coreSource.length,
        minified: coreMinified.length,
        minifiedGzip: zlib.gzipSync(coreMinified).length
      },
      scenarios
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    console.log(`[JquanUI] Core performance benchmark (${samples} sample${samples === 1 ? '' : 's'}, ${cdp.version})`);
    for (const [name, result] of Object.entries(scenarios)) {
      const budgetKey = `${name}Ms`;
      console.log(`[JquanUI] ${name}: median ${result.medianMs}ms, max ${result.maxMs}ms, budget ${budgets[budgetKey]}ms`);
    }
    console.log(`[JquanUI] Core bytes: source ${report.coreBytes.source}, minified ${report.coreBytes.minified}, gzip ${report.coreBytes.minifiedGzip}`);
    console.log(`[JquanUI] Core performance report: ${path.relative(root, outputPath)}`);
    if (checkBudgets && !report.passed) {
      const failed = Object.entries(budgetResults).filter(([, passed]) => !passed).map(([name]) => name);
      throw new Error(`Core performance budget exceeded: ${failed.join(', ')}`);
    }
  } finally {
    await cdp.close();
    server.close();
  }
}

main().catch(error => {
  console.error(`[JquanUI] Core performance benchmark failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
