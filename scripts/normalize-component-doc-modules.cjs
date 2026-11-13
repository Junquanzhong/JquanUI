#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'content/components');
const checkOnly = process.argv.includes('--check');
const uiCategories = new Set(['基础交互', '表单输入', '反馈与浮层', '数据展示', '页面结构', '内容与媒体']);

function readDocument(file) {
  const source = fs.readFileSync(file, 'utf8');
  const expression = source.replace(/^\/\/[^\n]*\nexport default /, '').replace(/;\s*$/, '');
  return vm.runInNewContext(`(${expression})`, Object.create(null), { filename: file });
}

function documentSource(doc) {
  return `// JquanUI component documentation: ${doc.id}\nexport default ${JSON.stringify(doc, null, 2)};\n`;
}

const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.js') && file !== 'index.js').sort();
for (const file of files) {
  const target = path.join(docsDir, file);
  const doc = readDocument(target);
  const normalized = Object.assign({}, doc, {
    kind: uiCategories.has(doc.category) ? 'ui' : 'service',
    examples: [
      { id: 'declarative', title: '声明式用法', language: 'html', code: String(doc.declarative || ''), preview: true },
      { id: 'imperative', title: '命令式 / API 用法', language: 'javascript', code: String(doc.imperative || ''), preview: false }
    ]
  });
  const next = documentSource(normalized);
  const current = fs.readFileSync(target, 'utf8');
  if (current !== next) {
    if (checkOnly) throw new Error(`Component documentation contract is stale: ${path.relative(root, target)}`);
    fs.writeFileSync(target, next, 'utf8');
  }
}

console.log(`[JquanUI] component documentation contract ${checkOnly ? 'check' : 'normalized'} (${files.length} modules)`);
