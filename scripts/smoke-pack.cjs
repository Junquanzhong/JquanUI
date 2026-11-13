#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const tmpRoot = path.join(root, '.tmp');
const cacheDir = path.join(tmpRoot, 'npm-cache');
const consumerDir = path.join(tmpRoot, 'consumer-pack-smoke');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const tarball = path.join(root, `${pkg.name}-${pkg.version}.tgz`);

function run(command, args, options = {}) {
  execFileSync(command, args, Object.assign({
    cwd: root,
    stdio: 'inherit',
    shell: false
  }, options));
}

function runNpm(args, options = {}) {
  if (process.platform === 'win32') {
    return run('cmd.exe', ['/d', '/s', '/c', 'npm.cmd'].concat(args), options);
  }
  return run('npm', args, options);
}

function runBin(binPath, args, options = {}) {
  if (process.platform === 'win32' && binPath.endsWith('.cmd')) {
    return run('cmd.exe', ['/d', '/s', '/c', 'call', binPath].concat(args), options);
  }
  return run(binPath, args, options);
}

function cleanup() {
  for (const target of [consumerDir, cacheDir, tarball]) {
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  }
}

cleanup();
fs.mkdirSync(tmpRoot, { recursive: true });

try {
  runNpm(['pack', '--cache', cacheDir]);
  fs.mkdirSync(consumerDir, { recursive: true });
  fs.writeFileSync(path.join(consumerDir, 'package.json'), JSON.stringify({
    name: 'jquanui-pack-smoke',
    version: '0.0.0',
    private: true
  }, null, 2), 'utf8');
  fs.writeFileSync(path.join(consumerDir, 'fixture.html'), '<main class="container p-4 text-center"></main>', 'utf8');
  fs.writeFileSync(path.join(consumerDir, 'fixture.css'), '.card { display: flex; padding: 16px; }', 'utf8');
  fs.mkdirSync(path.join(consumerDir, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(consumerDir, 'templates', 'header.html'), '<header>{{ title }}</header>', 'utf8');
  runNpm(['install', tarball, '--prefix', consumerDir, '--cache', cacheDir]);

  run('node', ['-e', `
    const j = require('jquanui');
    const vite = require('jquanui/vite');
    const postcss = require('jquanui/postcss');
    const tokens = require('jquanui/tokens');
    const migrate = require('jquanui/migrate');
    const extract = require('jquanui/extract');
    const data = require('jquanui/data');
    if (!j.extractFromFiles || !j.createTemplateBundle || !extract.writeTemplateBundle || typeof vite !== 'function' || typeof postcss !== 'function' || !tokens.importTokens || !migrate.auditCss || !j.migrate || data.version !== '0.2.0' || typeof data.createCollection !== 'function' || typeof data.liveQuery !== 'function') throw new Error('bad installed cjs');
    const bundle = j.createTemplateBundle('templates', { templates: 'templates' });
    if (bundle.count !== 1 || !bundle.code.includes('header.html')) throw new Error('bad installed cjs template bundle');
    const page = j.injectCriticalCss('<html><head><style id="jquan-critical">old</style></head><body><div class="container"></div></body></html>', { id: 'jquan-critical', nonce: 'abc&123', attributes: { 'data-route': '/home' } });
    if (!page.html.includes('nonce="abc&amp;123"') || !page.html.includes('data-route="/home"') || page.html.includes('old</style>')) throw new Error('bad installed cjs ssr');
    const doctor = j.diagnoseProject({ inputs: ['fixture.html'] });
    if (!doctor || typeof doctor.ok !== 'boolean' || !Array.isArray(doctor.warnings)) throw new Error('bad installed cjs doctor');
    const contacts = data.createCollection('pack-contacts');
    const adapter = data.createMemoryAdapter();
    Promise.resolve(contacts.persist(adapter, { debounce: 100 })).then(persistence => {
      contacts.insert({ name: 'Ada' });
      return persistence.flush().then(async () => {
        const state = await adapter.load();
        await persistence.close();
        if (state.format !== 'jquanui-data-state' || state.records.length !== 1 || persistence.status().state !== 'closed') throw new Error('bad installed cjs data persistence');
      });
    }).catch(error => { console.error(error); process.exitCode = 1; });
  `], { cwd: consumerDir });

  run('node', ['--input-type=module', '-e', `
    import { extractFromFiles, createCriticalStyleTag, createTemplateBundle, diagnoseProject } from 'jquanui';
    import { writeTemplateBundle } from 'jquanui/extract';
    import vite from 'jquanui/vite';
    import postcss from 'jquanui/postcss';
    import { importTokens } from 'jquanui/tokens';
    import { auditCss } from 'jquanui/migrate';
    import { createCollection, liveQuery } from 'jquanui/data';
    import core from 'jquanui/core';
    if (!extractFromFiles || !createTemplateBundle || !writeTemplateBundle || typeof vite !== 'function' || typeof postcss !== 'function' || !importTokens || !auditCss || typeof core !== 'object' || typeof createCollection !== 'function' || typeof liveQuery !== 'function') throw new Error('bad installed esm');
    if (!createCriticalStyleTag('.x{}', { id: 'jquan-critical', nonce: 'n' }).includes('nonce="n"')) throw new Error('bad installed esm ssr');
    if (typeof diagnoseProject !== 'function') throw new Error('bad installed esm doctor');
    const rows = createCollection('pack-esm');
    const observed = [];
    const stopLive = liveQuery(rows, undefined, next => observed.push(next.length), { debounce: 1, cache: true });
    rows.insert({ id: 1 });
    await new Promise(resolve => setTimeout(resolve, 5));
    stopLive();
    if (observed.join(',') !== '0,1') throw new Error('bad installed esm liveQuery');
  `], { cwd: consumerDir });

  run('node', ['-e', `
    const fs = require('fs');
    const types = fs.readFileSync('node_modules/jquanui/dist/data/jquan-data.d.ts', 'utf8');
    if (!/interface LiveQueryOptions<T>[^}]*debounce\\?: number[^}]*cache\\?: boolean/.test(types) || !/export function liveQuery[^;]*LiveQueryOptions<T>/.test(types) || !/interface PersistenceHandle[^}]*flush\\(\\): Promise<boolean>[^}]*close\\(\\): Promise<boolean>/.test(types)) throw new Error('bad installed data types');
  `], { cwd: consumerDir });

  run('node', ['-e', `
    require('jquanui/core');
    require('jquanui/full');
    require('jquanui/components');
    require('jquanui/components/button');
    const fs = require('fs');
    if (!fs.existsSync('node_modules/jquanui/dist/components/iframeBridge.js') || !fs.existsSync('node_modules/jquanui/dist/components/favicon.js')) throw new Error('installed package missing communication or favicon component');
  `], { cwd: consumerDir });

  const binExt = process.platform === 'win32' ? '.cmd' : '';
  runBin(path.join(consumerDir, 'node_modules', '.bin', `jquan-extract${binExt}`), ['--help'], { cwd: consumerDir });
  runBin(path.join(consumerDir, 'node_modules', '.bin', `jquan-extract${binExt}`), ['--doctor', '--input', 'fixture.html', '--json'], { cwd: consumerDir });
  runBin(path.join(consumerDir, 'node_modules', '.bin', `jquan-extract${binExt}`), ['--bundle-templates', 'templates', '--template-bundle-output', 'jquan.templates.js', '--templates', 'templates'], { cwd: consumerDir });
  if (!fs.existsSync(path.join(consumerDir, 'jquan.templates.js'))) throw new Error('installed CLI did not emit template bundle');
  runBin(path.join(consumerDir, 'node_modules', '.bin', `jquan-tokens${binExt}`), ['--help'], { cwd: consumerDir });
  runBin(path.join(consumerDir, 'node_modules', '.bin', `jquan-migrate${binExt}`), ['--input', 'fixture.css', '--semantic-only'], { cwd: consumerDir });

  console.log('[JquanUI] pack smoke ok');
} finally {
  cleanup();
}
