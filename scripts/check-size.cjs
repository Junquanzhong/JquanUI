#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
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

function isReleaseExcluded(file) {
  const normalized = file.replace(/\\/g, '/');
  return /(?:^|\/)[^/]*DESKTOP[^/]*$/.test(normalized)
    || /\/dist\/(?:demo\.html|manifest\.json|release-summary\.md)$/.test(normalized)
    || normalized.endsWith('/dist/cli/README.md')
    || normalized.endsWith('/dist/core/jquanui-core-4.5.3.min.js')
    || normalized.endsWith('/dist/data/data-api-surface.json')
    || normalized.endsWith('/dist/components/components.manifest.json');
}

function fileSize(file) {
  return fs.statSync(file).size;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const packageFiles = [
  path.join(root, 'README.md'),
  path.join(root, 'CHANGELOG.md'),
  path.join(root, 'LICENSE'),
  path.join(root, 'package.json'),
  ...walk(path.join(root, 'dist')).filter(file => !isReleaseExcluded(file)),
  ...walk(path.join(root, 'skills')).filter(file => !isReleaseExcluded(file))
];

const unpackedBytes = packageFiles.reduce((sum, file) => sum + fileSize(file), 0);
const projectedTarballBytes = Math.round(unpackedBytes * 0.18);

assert(packageFiles.length <= MAX_FILE_COUNT, `Package file count budget exceeded: ${packageFiles.length} > ${MAX_FILE_COUNT}`);
assert(unpackedBytes <= MAX_UNPACKED_BYTES, `Unpacked size budget exceeded: ${unpackedBytes} > ${MAX_UNPACKED_BYTES}`);
assert(projectedTarballBytes <= MAX_PROJECTED_TARBALL_BYTES, `Projected tarball budget exceeded: ${projectedTarballBytes} > ${MAX_PROJECTED_TARBALL_BYTES}`);

console.log(`[JquanUI] size check ok (${packageFiles.length} files, ${unpackedBytes} unpacked bytes, ~${projectedTarballBytes} tarball bytes)`);
