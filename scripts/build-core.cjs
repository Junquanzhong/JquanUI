#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'dist/core/JquanUI@Core.js');
const output = path.join(root, 'js/JquanUI@core.min.js');

if (!fs.existsSync(source)) {
  throw new Error(`Core source not found: ${source}`);
}

const terserArgs = [
  '--yes',
  'terser',
  'dist/core/JquanUI@Core.js',
  '--compress',
  '--mangle',
  '--comments',
  '/^!/',
  '--output',
  'js/JquanUI@core.min.js'
];
const command = process.platform === 'win32' ? process.env.ComSpec : 'npx';
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npx --yes terser dist/core/JquanUI@Core.js --compress --mangle --comments /^!/ --output js/JquanUI@core.min.js']
  : terserArgs;
const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

const sourceBytes = fs.statSync(source).size;
const outputBytes = fs.statSync(output).size;
const reduction = sourceBytes === 0 ? 0 : ((1 - outputBytes / sourceBytes) * 100).toFixed(1);

console.log(`[JquanUI] Core minified: ${outputBytes} bytes (${reduction}% smaller)`);
