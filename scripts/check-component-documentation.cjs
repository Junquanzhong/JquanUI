#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'content/components');
const indexPath = path.join(docsDir, 'index.js');
const controllerPath = path.join(root, 'js/components-docs.js');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/components/components.manifest.json'), 'utf8'));
const expectedCategories = ['基础交互', '表单输入', '反馈与浮层', '数据展示', '页面结构', '内容与媒体', '数据与状态', '网络与集成', '浏览器工具', '设计预设'];
const uiCategories = new Set(['基础交互', '表单输入', '反馈与浮层', '数据展示', '页面结构', '内容与媒体']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readDocument(file) {
  const source = fs.readFileSync(file, 'utf8');
  const expression = source.replace(/^\/\/[^\n]*\nexport default /, '').replace(/;\s*$/, '');
  return vm.runInNewContext(`(${expression})`, Object.create(null), { filename: file });
}

const imports = Array.from(fs.readFileSync(indexPath, 'utf8').matchAll(/import\s+doc\d+\s+from\s+'\.\/([^']+\.js)'/g), match => match[1]);
const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.js') && file !== 'index.js').sort();
assert(imports.length === files.length && new Set(imports).size === files.length, 'Component documentation index has missing or duplicate modules');
assert(JSON.stringify(imports.slice().sort()) === JSON.stringify(files), 'Component documentation index is out of sync with module files');

const docs = files.map(file => {
  const doc = readDocument(path.join(docsDir, file));
  assert(doc.id === path.basename(file, '.js'), `Documentation id/file mismatch: ${file}`);
  assert(doc.title && doc.chinese && doc.category && doc.version, `Documentation identity is incomplete: ${file}`);
  assert(expectedCategories.includes(doc.category), `Unknown documentation category: ${doc.category}`);
  assert(['ui', 'service'].includes(doc.kind), `Documentation kind is invalid: ${file}`);
  assert((doc.kind === 'ui') === uiCategories.has(doc.category), `Documentation kind/category mismatch: ${file}`);
  assert(typeof doc.install === 'string' && typeof doc.declarative === 'string' && typeof doc.imperative === 'string', `Usage sections are incomplete: ${file}`);
  assert(Array.isArray(doc.attrs) && Array.isArray(doc.methods) && Array.isArray(doc.notes), `API sections are incomplete: ${file}`);
  assert(Array.isArray(doc.examples) && doc.examples.length >= 2, `Examples are incomplete: ${file}`);
  if (doc.api) assert(doc.methods.length > 0, `API documentation has no methods: ${file}`);
  assert(fs.existsSync(path.join(root, doc.file)), `Documented component source is missing: ${file}`);
  assert(doc.examples[0].code === doc.declarative && doc.examples[1].code === doc.imperative, `Example/code source drift: ${file}`);
  assert(!/^\/\//.test(doc.declarative.trim()), `Usage example is only a placeholder comment: ${file}`);
  return doc;
});

const controllerSource = fs.readFileSync(controllerPath, 'utf8');
assert(/const componentDocsIndexUrl = \(\(\) => \{[\s\S]*new URL\('\.\.\/content\/components\/index\.js', script\?\.src \|\| document\.baseURI\)/.test(controllerSource), 'Component documentation index must resolve relative to components-docs.js');
assert(/function renderComponentExtras\(item\) \{\s*if \(!item\) return ''/.test(controllerSource), 'Component extras must allow non-template documentation sections');
assert(/docs = loaded(?:\.filter\(item => item\.kind === 'service'\))?/.test(controllerSource), 'Component documentation loader must retain the documented component collection');
assert(/if \(item\.id === 'select'\)[\s\S]*if \(item\.id === 'tagInput'\)[\s\S]*if \(item\.id !== 'template'\) return ''/.test(controllerSource), 'Select and tagInput extras must render before template-only extras');
const demoIds = new Set(Array.from(controllerSource.matchAll(/^\s{12}([A-Za-z0-9]+): `/gm), match => match[1]));
const mountIds = new Set(Array.from(controllerSource.matchAll(/id === '([^']+)'/g), match => match[1]));
const genericInitializerIds = new Set(['button', 'uiPreset', 'overlayPreset']);
docs.filter(doc => doc.examples.some(example => example.preview)).forEach(doc => {
  assert(demoIds.has(doc.id), `Preview-enabled documentation has no demo markup: ${doc.id}`);
  assert(mountIds.has(doc.id) || genericInitializerIds.has(doc.id), `Preview-enabled documentation has no demo initializer: ${doc.id}`);
});

const manifestComponents = new Set(manifest.components);
for (const doc of docs) {
  if (!doc.file.startsWith('dist/components/')) continue;
  const sourceName = path.basename(doc.file);
  assert(manifestComponents.has(sourceName), `Documented component is missing from manifest: ${sourceName}`);
}

console.log(`[JquanUI] component documentation check ok (${docs.length} modules, ${expectedCategories.length} categories)`);
