#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const core = fs.readFileSync(path.join(root, 'dist/core/JquanUI@Core.js'), 'utf8');
const full = fs.readFileSync(path.join(root, 'dist/full/JquanUI@full.js'), 'utf8');
const migrate = fs.readFileSync(path.join(root, 'dist/cli/jquan-migrate.cjs'), 'utf8');
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const version = pkg.version;
assert(/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version), `Invalid package version: ${version}`);

const coreMatch = core.match(/const\s+ENGINE_VERSION\s*=\s*['"]([^'"]+)['"]/);
assert(coreMatch, 'Missing ENGINE_VERSION in dist/core/JquanUI@Core.js');
assert(coreMatch[1] === version, `Version mismatch: package.json=${version}, ENGINE_VERSION=${coreMatch[1]}`);
assert(/const\s+ENGINE_LABEL\s*=\s*'Enterprise Plugin Lifecycle'/.test(core), 'Missing descriptive engine label');
assert(/engineVersion:\s*ENGINE_VERSION/.test(core), 'Missing pure engineVersion');
assert(/versionLabel:\s*ENGINE_LABEL/.test(core), 'Missing versionLabel');

const fullMatch = full.match(/const\s+ENGINE_VERSION\s*=\s*['"]([^'"]+)['"]/);
assert(fullMatch, 'Missing ENGINE_VERSION in dist/full/JquanUI@full.js');
assert(fullMatch[1] === version, `Version mismatch: package.json=${version}, Full ENGINE_VERSION=${fullMatch[1]}`);

const migrateMatch = migrate.match(/const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
assert(migrateMatch, 'Missing VERSION in dist/cli/jquan-migrate.cjs');
assert(migrateMatch[1] === version, `Version mismatch: package.json=${version}, migrate VERSION=${migrateMatch[1]}`);

assert(changelog.includes(`## ${version} - `), `CHANGELOG.md missing section for ${version}`);

const archivePath = path.join(root, 'dist/core/JquanUI@Core v4.5.js');
assert(fs.existsSync(archivePath), 'Missing formal v4.5 runtime archive');

console.log(`[JquanUI] version check ok (${version})`);
