#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const componentPath = path.join(root, 'dist/components/template.js');
const source = fs.readFileSync(componentPath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(source.includes('patchDomChildren'), 'DOM patch implementation should remain present');
assert(source.includes('if (record.options.patch && patchDomChildren(record.element, html))'), 'DOM patch must remain opt-in');
assert(source.includes('record.element.innerHTML = html'), 'innerHTML fallback should remain available');

const context = {
  window: {},
  document: { querySelector() { return null; }, getElementById() { return null; } },
  HTMLElement: class HTMLElement {},
  Intl,
  Date,
  Promise,
  setTimeout,
  clearTimeout,
  console
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: componentPath });
const api = context.JquanUIComponents.templateApi;
assert(api && typeof api.renderToString === 'function', 'template API should expose renderToString');

const template = '<article><h2>{{ title }}</h2><p>{{ body }}</p></article>';
const startedAt = Date.now();
for (let index = 0; index < 1000; index += 1) {
  const html = api.renderToString(template, { title: `Title ${index}`, body: 'JquanUI' });
  assert(html.includes(`Title ${index}`), 'template benchmark should preserve interpolated data');
}
const elapsedMs = Date.now() - startedAt;
assert(elapsedMs < 5000, `template render benchmark exceeded budget: ${elapsedMs}ms`);

console.log(`[JquanUI] template performance check ok (1000 renders, ${elapsedMs}ms; DOM patch remains opt-in)`);
