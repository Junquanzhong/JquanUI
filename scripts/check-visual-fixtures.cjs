#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const fixtures = ['qa-smoke.html', 'qa-regression-4.html'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const file of fixtures) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert(/<meta[^>]+name=["']viewport["']/i.test(source), `${file} must define a responsive viewport`);
  assert(/dist\/core\/JquanUI@Core\.js/i.test(source), `${file} must load the current unminified Core runtime`);
  assert(/class=["'][^"']+/.test(source) || /className\s*=|classList\.(?:add|toggle)\(/.test(source), `${file} must contain static or dynamic class output`);
}

const core = fs.readFileSync(path.join(root, 'dist/core/JquanUI@Core.js'), 'utf8');
const match = core.match(/const\s+ENGINE_VERSION\s*=\s*['"]([^'"]+)['"]/);
assert(match && match[1] === version, 'visual fixtures and Core must use the current package version');
for (const file of ['index.html', 'components.html', 'admin-blocks.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert(/<meta[^>]+name=["']viewport["']/i.test(source), `${file} must define a responsive viewport`);
}

console.log(`[JquanUI] visual fixture structure check ok (${fixtures.length} QA fixtures, package ${version})`);
