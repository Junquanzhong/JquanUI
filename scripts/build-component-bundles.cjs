#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const root = path.resolve(__dirname, '..');
const componentDir = path.join(root, 'dist/components');
const manifestPath = path.join(componentDir, 'components.manifest.json');
const aggregatePath = path.join(componentDir, 'JquanUI@components.js');
const fullPath = path.join(root, 'dist/full/JquanUI@full.js');
const corePath = path.join(root, 'dist/core/JquanUI@Core.js');
const checkOnly = process.argv.includes('--check');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(items, label) {
  assert(Array.isArray(items) && items.length > 0, `${label} must be a non-empty array`);
  const seen = new Set();
  for (const item of items) {
    assert(typeof item === 'string' && /^[A-Za-z0-9@._-]+\.js$/.test(item), `Invalid ${label} entry: ${item}`);
    assert(!seen.has(item), `Duplicate ${label} entry: ${item}`);
    seen.add(item);
  }
  return seen;
}

function pluginNames(source) {
  return Array.from(source.matchAll(/name:\s*'([^']+)'/g), match => match[1])
    .filter(name => name.startsWith('jquanui-'));
}

function readComponent(file) {
  const target = path.join(componentDir, file);
  assert(fs.existsSync(target), `Missing component source: ${file}`);
  return fs.readFileSync(target, 'utf8').trim();
}

async function build(files) {
  const names = new Set();
  const sources = files.map(file => {
    const source = readComponent(file);
    for (const name of pluginNames(source)) {
      assert(!names.has(name), `Duplicate component plugin name: ${name}`);
      names.add(name);
    }
    return source;
  });
  const output = await minify(sources.join('\n\n'), {
    compress: false, mangle: false, format: { comments: /^!/ }
  });
  return { source: `${output.code}\n`, pluginCount: names.size };
}

function writeOrCheck(target, expected, label) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current === expected) return;
  if (checkOnly) throw new Error(`${label} is stale`);
  fs.writeFileSync(target, expected, 'utf8');
  console.log(`[JquanUI] ${label} built`);
}

assert(manifest.schemaVersion === 1, 'Unsupported component manifest schema');
const allFiles = manifest.components;
const allSet = unique(allFiles, 'components');
const fullFiles = manifest.profiles && manifest.profiles.full && manifest.profiles.full.files;
const fullSet = unique(fullFiles, 'full profile');
assert(manifest.profiles.full.kind === 'curated', 'Full profile must declare kind=curated');
for (const file of fullSet) assert(allSet.has(file), `Full profile references an unknown component: ${file}`);
// Keep the complete catalog for JquanUI.import while leaving optional tools out of bundles.
const onDemandFiles = manifest.onDemandOnly === undefined ? [] : manifest.onDemandOnly;
assert(Array.isArray(onDemandFiles), 'onDemandOnly must be an array');
const onDemandSet = onDemandFiles.length ? unique(onDemandFiles, 'onDemandOnly') : new Set();
for (const file of onDemandSet) {
  assert(allSet.has(file), `Unknown on-demand component: ${file}`);
  assert(!fullSet.has(file), `Full profile must not embed on-demand component: ${file}`);
}
const bundledFiles = allFiles.filter(file => !onDemandSet.has(file));

const standaloneFiles = fs.readdirSync(componentDir)
  .filter(file => file.endsWith('.js') && file !== path.basename(aggregatePath) && !/-DESKTOP-[^/]+\.js$/.test(file))
  .sort();
const declaredFiles = Array.from(allSet).sort();
assert(
  JSON.stringify(standaloneFiles) === JSON.stringify(declaredFiles),
  `Component manifest drift: declared=${declaredFiles.length}, files=${standaloneFiles.length}`
);

async function main() {
  const aggregate = await build(bundledFiles);
  const fullComponents = await build(fullFiles);
  const core = await minify(fs.readFileSync(corePath, 'utf8'), {
    compress: false, mangle: false, format: { comments: /^!/ }
  });
  const fullSource = `${core.code}\n\n${fullComponents.source}`;

  writeOrCheck(aggregatePath, aggregate.source, 'Components bundle');
  writeOrCheck(fullPath, fullSource, 'Full bundle');

  if (checkOnly) {
    console.log(`[JquanUI] component bundle check ok (${aggregate.pluginCount} bundled, ${fullComponents.pluginCount} full, ${onDemandSet.size} on-demand)`);
  }
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
