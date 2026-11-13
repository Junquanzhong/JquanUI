#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vitePlugin = require('../dist/cli/jquan-vite-plugin.cjs');

const root = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(vitePlugin.TEMPLATE_HMR_EVENT === 'jquanui:template-update', 'Vite subpath should expose the template HMR event');

const plugin = vitePlugin({ input: ['dist/demo.html'], inject: false, emit: false, warmup: false });
plugin.configResolved({ root, command: 'serve' });
const tags = plugin.transformIndexHtml();
const client = tags && tags.find(tag => tag.tag === 'script');
assert(client && client.attrs.type === 'module', 'serve mode should inject the template HMR module client');
assert(client.children.includes(vitePlugin.TEMPLATE_HMR_EVENT), 'template HMR client should subscribe to the exported event');
assert(client.children.includes('jquan:template:update'), 'template HMR client should bridge updates to the runtime event');

const messages = [];
plugin.handleHotUpdate({
  file: path.join(root, 'templates', 'header.html'),
  server: { ws: { send(message) { messages.push(message); } } }
});
assert(messages.length === 1, 'template changes should emit one custom HMR message');
assert(messages[0].type === 'custom' && messages[0].event === vitePlugin.TEMPLATE_HMR_EVENT, 'template HMR message shape mismatch');
assert(messages[0].data.relative === 'templates/header.html' && messages[0].data.name === 'header.html', 'template HMR message should expose relative path and basename');

plugin.handleHotUpdate({
  file: path.join(root, 'styles', 'app.css'),
  server: { ws: { send(message) { messages.push(message); } } }
});
assert(messages.length === 1, 'non-template changes should not emit template HMR messages');

const disabled = vitePlugin({ input: ['dist/demo.html'], inject: false, emit: false, warmup: false, templateHmr: false });
disabled.configResolved({ root, command: 'serve' });
assert(disabled.transformIndexHtml() === undefined, 'templateHmr=false should not inject the HMR client');
disabled.handleHotUpdate({
  file: path.join(root, 'templates', 'footer.html'),
  server: { ws: { send() { throw new Error('disabled HMR should not send'); } } }
});

const production = vitePlugin({ input: ['dist/demo.html'], inject: false, emit: false, warmup: false });
production.configResolved({ root, command: 'build' });
assert(production.transformIndexHtml() === undefined, 'production builds should not inject the HMR client');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jquan-vite-templates-'));
try {
  fs.mkdirSync(path.join(fixture, 'templates', 'shared'), { recursive: true });
  fs.writeFileSync(path.join(fixture, 'index.html'), '<main class="p-4"></main>', 'utf8');
  fs.writeFileSync(path.join(fixture, 'templates', 'header.html'), '<header>{{ title }}</header>', 'utf8');
  fs.writeFileSync(path.join(fixture, 'templates', 'shared', 'footer.html'), '<footer>Footer</footer>', 'utf8');

  const bundled = vitePlugin({
    input: ['index.html'],
    core: path.join(root, 'dist/core/JquanUI@Core.js'),
    inject: false,
    emit: false,
    warmup: false,
    templateInput: 'templates',
    templateRoot: 'templates',
    templateBundle: 'assets/jquan.templates.js',
    templateBundleReport: 'assets/jquan.templates.json'
  });
  bundled.configResolved({ root: fixture, command: 'build', base: '/demo/' });
  const bundleTags = bundled.transformIndexHtml();
  const bundleScript = bundleTags && bundleTags.find(tag => tag.attrs && Object.prototype.hasOwnProperty.call(tag.attrs, 'data-jquanui-templates'));
  assert(bundleScript && bundleScript.attrs.src === '/demo/assets/jquan.templates.js', 'production HTML should inject the configured template bundle with the Vite base');

  const watched = [];
  bundled.buildStart.call({ addWatchFile(file) { watched.push(file); } });
  assert(watched.some(file => file.endsWith('header.html')) && watched.some(file => file.endsWith('footer.html')), 'template bundle files should join the Vite watch graph');

  const emitted = [];
  bundled.generateBundle.call({ emitFile(asset) { emitted.push(asset); } });
  const templateAsset = emitted.find(asset => asset.fileName === 'assets/jquan.templates.js');
  const templateReport = emitted.find(asset => asset.fileName === 'assets/jquan.templates.json');
  assert(templateAsset && templateAsset.type === 'asset', 'Vite should emit the configured template bundle asset');
  assert(templateAsset.source.includes('shared/footer.html') && templateAsset.source.includes('registerTemplates'), 'Vite template bundle should preserve relative names and runtime registration');
  assert(templateReport && JSON.parse(templateReport.source).count === 2, 'Vite should emit the template dependency report');

  const noInject = vitePlugin({
    input: ['index.html'],
    core: path.join(root, 'dist/core/JquanUI@Core.js'),
    inject: false,
    emit: false,
    warmup: false,
    templateBundle: 'assets/templates.js',
    templateBundleInject: false
  });
  noInject.configResolved({ root: fixture, command: 'build' });
  assert(noInject.transformIndexHtml() === undefined, 'templateBundleInject=false should leave production HTML unchanged');

  const split = vitePlugin({
    input: ['index.html'],
    core: path.join(root, 'dist/core/JquanUI@Core.js'),
    split: true,
    inject: 'link',
    baselineOutput: 'assets/jquan.base.css',
    utilitiesOutput: 'assets/jquan.utilities.css',
    warmup: false
  });
  split.configResolved({ root: fixture, command: 'build' });
  const splitTags = split.transformIndexHtml();
  const splitLinks = splitTags.filter(tag => tag.tag === 'link');
  assert(splitLinks.length === 2, 'Vite split mode should inject baseline and utility links');
  assert(splitLinks[0].attrs.href.endsWith('/assets/jquan.base.css') && splitLinks[1].attrs.href.endsWith('/assets/jquan.utilities.css'), 'Vite split links should preserve baseline order');
  const splitEmitted = [];
  split.generateBundle.call({ emitFile(asset) { splitEmitted.push(asset); } });
  assert(splitEmitted.some(asset => asset.fileName === 'assets/jquan.base.css' && asset.source.includes('box-sizing')), 'Vite should emit baseline CSS');
  assert(splitEmitted.some(asset => asset.fileName === 'assets/jquan.utilities.css' && asset.source.includes('padding')), 'Vite should emit utility CSS');
  assert(!splitEmitted.some(asset => asset.fileName === 'assets/jquan.css'), 'Vite split mode should not emit a duplicate combined asset by default');
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log('[JquanUI] Vite template HMR and bundle check ok');
