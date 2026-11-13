#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const cliReadme = fs.readFileSync(path.join(root, 'dist/cli/README.md'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath.replace(/^\.\//, '')));
}

function assertFile(relPath, label = relPath) {
  assert(exists(relPath), `Missing ${label}: ${relPath}`);
}

function expandPattern(relPath) {
  return relPath.includes('*') ? relPath.replace('*', 'button') : relPath;
}

assert(pkg.name === 'jquanui', 'Unexpected package name');
assert(pkg.main === './dist/index.cjs', 'Unexpected main entry');
assert(pkg.module === './dist/index.mjs', 'Unexpected module entry');
assert(pkg.types === './dist/index.d.ts', 'Unexpected types entry');

for (const file of pkg.files || []) {
  if (typeof file === 'string' && file.startsWith('!')) continue;
  assertFile(file, `files[] entry`);
}
for (const [name, target] of Object.entries(pkg.bin || {})) assertFile(target, `bin ${name}`);
for (const field of ['browser', 'unpkg', 'jsdelivr']) assertFile(pkg[field], field);

for (const pattern of pkg.sideEffects || []) {
  const normalized = pattern.replace(/^\.\//, '');
  const directory = path.dirname(normalized);
  assert(fs.existsSync(path.join(root, directory)), `Missing sideEffects directory: ${directory}`);
}

for (const [subpath, value] of Object.entries(pkg.exports || {})) {
  if (typeof value === 'string') {
    if (subpath !== './package.json') assertFile(expandPattern(value), `export ${subpath}`);
    continue;
  }
  for (const [condition, target] of Object.entries(value)) {
    assertFile(expandPattern(target), `export ${subpath}.${condition}`);
  }
}

for (const section of ['## Runtime', '## CLI', '## CSS Migration Audit', '## Node API', '## SSR Framework Adapters', '## Vite', '## PostCSS', '## Config', '## Design Tokens']) {
  assert(readme.includes(section), `README.md missing ${section}`);
}
for (const section of ['## Vite Plugin', '## PostCSS Plugin', '## Runtime Diagnostics', '## CSS Migration Audit', '## Design Tokens Bridge']) {
  assert(cliReadme.includes(section), `dist/cli/README.md missing ${section}`);
}

console.log('[JquanUI] package metadata check ok');
