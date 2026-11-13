#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/manifest.json'), 'utf8'));
const cacheDir = path.join(root, '.tmp', 'npm-cache');
const MAX_PACKED_BYTES = 840 * 1024;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runNpm(args) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const finalArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm.cmd'].concat(args)
    : args;

  return execFileSync(command, finalArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });

let packument;
try {
  const output = runNpm(['pack', '--dry-run', '--json', '--ignore-scripts', '--cache', cacheDir]);
  const packuments = JSON.parse(output);
  packument = Array.isArray(packuments) ? packuments[0] : packuments;
} finally {
  if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
}

const files = Array.isArray(packument.files) ? packument.files : [];
const unpackedSize = Number(packument.unpackedSize || 0);
const packedSize = Number(packument.size || 0);
const fileCount = Number(packument.entryCount || files.length);

assert(fileCount === manifest.budgets.fileCount, `pack file count mismatch: ${fileCount} !== ${manifest.budgets.fileCount}`);
assert(unpackedSize === manifest.budgets.unpackedBytes, `pack unpacked size mismatch: ${unpackedSize} !== ${manifest.budgets.unpackedBytes}`);
assert(packedSize > 0 && packedSize <= MAX_PACKED_BYTES, `packed size budget exceeded: ${packedSize} > ${MAX_PACKED_BYTES}`);

for (const required of Object.keys(manifest.hashes || {})) {
  assert(files.some(file => file.path === required), `pack missing manifest hash target: ${required}`);
}

console.log(`[JquanUI] pack list check ok (${fileCount} files, ${unpackedSize} unpacked bytes, ${packedSize} packed bytes)`);
