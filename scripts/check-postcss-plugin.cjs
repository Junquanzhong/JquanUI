#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const postcssPlugin = require('../dist/cli/jquan-postcss-plugin.cjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jquan-postcss-templates-'));
try {
  fs.mkdirSync(path.join(fixture, 'templates', 'shared'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'templates', 'shared', 'header.html'), '<header>{{ title }}</header>', 'utf8');
  fs.writeFileSync(path.join(fixture, 'index.html'), '<main class="p-4"></main>', 'utf8');
  const messages = [];
  const replacements = [];
  const root = {
    result: { messages },
    walkAtRules(name, callback) {
      assert(name === 'jquanui', 'PostCSS should inspect the jquanui at-rule');
      callback({ params: 'utilities', replaceWith(value) { replacements.push(value); } });
    },
    append(value) { replacements.push(value); }
  };
  const plugin = postcssPlugin({
    root: fixture,
    input: ['index.html'],
    config: { content: ['index.html'] },
    templateInput: 'templates',
    templateRoot: 'templates',
    templateBundle: 'public/jquan.templates.js',
    templateBundleReport: 'public/jquan.templates.json'
  });
  plugin.Once(root, { postcss: { parse(value) { return value; } } });
  const output = path.join(fixture, 'public', 'jquan.templates.js');
  assert(fs.existsSync(output), 'PostCSS should emit the configured template bundle');
  assert(fs.readFileSync(output, 'utf8').includes('shared/header.html'), 'PostCSS bundle should preserve template names');
  assert(JSON.parse(fs.readFileSync(path.join(fixture, 'public', 'jquan.templates.json'), 'utf8')).count === 1, 'PostCSS should write the template dependency report');
  assert(messages.some(message => message.templateCount === 1 && message.file === 'public/jquan.templates.js'), 'PostCSS should report the template bundle asset');
  assert(replacements.length === 1, 'PostCSS should still replace the utilities directive');

  const splitReplacements = [];
  const splitRoot = {
    result: { messages: [] },
    walkAtRules(name, callback) {
      assert(name === 'jquanui', 'PostCSS split should inspect jquanui at-rules');
      callback({ params: 'baseline', replaceWith(value) { splitReplacements.push({ part: 'baseline', value }); } });
      callback({ params: 'utilities', replaceWith(value) { splitReplacements.push({ part: 'utilities', value }); } });
    },
    append() { throw new Error('split directives should replace in place'); }
  };
  const split = postcssPlugin({
    root: fixture,
    input: ['index.html'],
    config: { content: ['index.html'] },
    split: true,
    baselineOutput: 'public/jquan.base.css',
    utilitiesOutput: 'public/jquan.utilities.css'
  });
  split.Once(splitRoot, { postcss: { parse(value) { return value; } } });
  assert(splitReplacements.length === 2, 'PostCSS split should replace both CSS directives');
  assert(splitReplacements[0].value.includes('box-sizing'), 'PostCSS baseline directive should receive baseline CSS');
  assert(splitReplacements[1].value.includes('padding'), 'PostCSS utilities directive should receive utility CSS');
  assert(fs.existsSync(path.join(fixture, 'public/jquan.base.css')) && fs.existsSync(path.join(fixture, 'public/jquan.utilities.css')), 'PostCSS should write split CSS assets');
  assert(!splitReplacements[1].value.includes('--jquan-translate-x'), 'PostCSS utility directive should not duplicate baseline variables');

  const disabled = postcssPlugin({ root: fixture, input: ['index.html'], config: { content: ['index.html'] } });
  disabled.Once(root, { postcss: { parse(value) { return value; } } });
  assert(messages.filter(message => message.templateCount).length === 1, 'PostCSS should not scan templates when bundle is disabled');
  console.log('[JquanUI] PostCSS template bundle check ok');
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
