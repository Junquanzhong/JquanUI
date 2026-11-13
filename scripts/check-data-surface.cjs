'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const cjs = require('../dist/data/jquan-data.cjs');
const types = fs.readFileSync(path.join(__dirname, '../dist/data/jquan-data.d.ts'), 'utf8');
const browser = fs.readFileSync(path.join(__dirname, '../dist/data/JquanUI@Data.js'), 'utf8');
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/data/data-api-surface.json'), 'utf8'));
  if (manifest.version !== cjs.version) throw new Error(`Data API manifest version mismatch: ${manifest.version} !== ${cjs.version}`);
  const esm = await import(pathToFileURL(path.join(__dirname, '../dist/data/jquan-data.mjs')).href);
  const names = manifest.exports;
  for (const name of names) {
    if (typeof cjs[name] === 'undefined') throw new Error(`CJS Data export missing: ${name}`);
    if (typeof esm[name] === 'undefined') throw new Error(`ESM Data export missing: ${name}`);
    if (!types.includes(name)) throw new Error(`Data type surface missing: ${name}`);
    if (!browser.includes(name)) throw new Error(`Browser Data export missing: ${name}`);
  }
  const liveQueryDeclaration = types.match(/export function liveQuery[^;]+;/)?.[0] || '';
  if (!/LiveQueryOptions<T>/.test(liveQueryDeclaration) || !/interface LiveQueryOptions<T>[^}]*debounce\?: number[^}]*cache\?: boolean/.test(types)) {
    throw new Error('Top-level liveQuery type options are missing debounce/cache support.');
  }
  if (cjs.version !== '0.2.0' || !/interface PersistenceHandle[^}]*flush\(\): Promise<boolean>[^}]*close\(\): Promise<boolean>/.test(types) || !/onCorrupt\?:/.test(types)) {
    throw new Error('Data 0.2 persistence lifecycle type surface is incomplete.');
  }
  console.log(`[JquanUI] Data CJS/ESM/browser/type surface check ok (${names.length} exports)`);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
