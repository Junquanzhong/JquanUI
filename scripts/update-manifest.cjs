#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifestPath = path.join(root, 'dist/manifest.json');
const MAX_UNPACKED_BYTES = 4.25 * 1024 * 1024;
const MAX_PROJECTED_TARBALL_BYTES = 780 * 1024;
const MAX_FILE_COUNT = 130;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function isReleaseExcluded(file) {
  const normalized = file.replace(/\\/g, '/');
  return /(?:^|\/)[^/]*DESKTOP[^/]*$/.test(normalized)
    || /\/dist\/(?:demo\.html|manifest\.json|release-summary\.md)$/.test(normalized)
    || normalized.endsWith('/dist/cli/README.md')
    || normalized.endsWith('/dist/core/jquanui-core-4.5.3.min.js')
    || normalized.endsWith('/dist/data/data-api-surface.json')
    || normalized.endsWith('/dist/components/components.manifest.json');
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function pickExisting(files) {
  const output = {};
  for (const file of files) {
    const absolute = path.join(root, file);
    if (fs.existsSync(absolute)) output[file] = sha256(absolute);
  }
  return output;
}

function getPackageFiles() {
  return [
    path.join(root, 'README.md'),
    path.join(root, 'CHANGELOG.md'),
    path.join(root, 'LICENSE'),
    path.join(root, 'package.json'),
    ...walk(path.join(root, 'dist')).filter(file => !isReleaseExcluded(file)),
    ...walk(path.join(root, 'skills')).filter(file => !isReleaseExcluded(file))
  ];
}

function getBudgetSnapshot() {
  const packageFiles = getPackageFiles();
  const unpackedBytes = packageFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);

  return {
    maxFiles: MAX_FILE_COUNT,
    maxUnpackedBytes: MAX_UNPACKED_BYTES,
    maxProjectedTarballBytes: MAX_PROJECTED_TARBALL_BYTES,
    fileCount: packageFiles.length,
    unpackedBytes,
    projectedTarballBytes: Math.round(unpackedBytes * 0.18)
  };
}

function createManifest(budgets) {
  return {
    name: pkg.name,
    version: pkg.version,
    generatedAt: new Date().toISOString().slice(0, 10),
    entries: {
      main: pkg.main,
      module: pkg.module,
      types: pkg.types,
      browser: pkg.browser,
      unpkg: pkg.unpkg,
      jsdelivr: pkg.jsdelivr
    },
    bin: pkg.bin,
    exports: pkg.exports,
    budgets,
    hashes: pickExisting([
      'package.json',
      'README.md',
      'CHANGELOG.md',
      'LICENSE',
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.ts',
      'dist/core/JquanUI@Core.js',
      'dist/core/JquanUI@Core v4.5.js',
      'dist/full/JquanUI@full.js',
      'dist/components/JquanUI@components.js',
      'dist/cli/jquan-extract.cjs',
      'dist/cli/jquan-vite-plugin.cjs',
      'dist/cli/jquan-postcss-plugin.cjs',
      'dist/cli/jquan-tokens.cjs',
      'dist/cli/jquan-migrate.cjs',
      'skills/jquanui/SKILL.md',
      'skills/jquanui/agents/openai.yaml'
    ])
  };
}

function writeManifest(budgets) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(createManifest(budgets), null, 2)}\n`, 'utf8');
}

let budgets = getBudgetSnapshot();
for (let index = 0; index < 3; index += 1) {
  writeManifest(budgets);
  const nextBudgets = getBudgetSnapshot();
  if (JSON.stringify(nextBudgets) === JSON.stringify(budgets)) break;
  budgets = nextBudgets;
}

console.log(`[JquanUI] manifest updated (${pkg.version})`);
