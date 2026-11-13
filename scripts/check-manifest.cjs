#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'dist/manifest.json');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(relPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relPath))).digest('hex');
}

assert(manifest.name === pkg.name, 'manifest name mismatch');
assert(manifest.version === pkg.version, 'manifest version mismatch');
assert(manifest.entries.main === pkg.main, 'manifest main mismatch');
assert(manifest.entries.module === pkg.module, 'manifest module mismatch');
assert(manifest.entries.types === pkg.types, 'manifest types mismatch');

for (const [file, hash] of Object.entries(manifest.hashes || {})) {
  assert(fs.existsSync(path.join(root, file)), `manifest hash target missing: ${file}`);
  assert(sha256(file) === hash, `manifest hash mismatch: ${file}`);
}

console.log(`[JquanUI] manifest check ok (${manifest.version})`);
