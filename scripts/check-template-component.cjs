#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const componentPath = path.join(root, 'dist/components/template.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class HTMLElement {}

const eventListeners = new Map();

const context = {
  window: {},
  console,
  HTMLElement,
  document: {
    querySelector() { return null; },
    getElementById() { return null; }
  },
  Intl,
  Date,
  Promise,
  setTimeout,
  clearTimeout,
  JQUAN_TEMPLATES: {
    'prebuilt.html': '<strong>{{ label }}</strong>'
  },
  addEventListener(type, handler) {
    if (!eventListeners.has(type)) eventListeners.set(type, new Set());
    eventListeners.get(type).add(handler);
  },
  removeEventListener(type, handler) {
    if (eventListeners.has(type)) eventListeners.get(type).delete(handler);
  },
  dispatchEvent(event) {
    const handlers = eventListeners.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(componentPath, 'utf8'), context, { filename: componentPath });

const api = context.JquanUIComponents.templateApi;
assert(api && typeof api.useLoader === 'function', 'templateApi.useLoader should be available');
assert(context.JquanUIComponents.template.version === '1.5.0', 'template component version should be 1.5.0');
assert(fs.readFileSync(componentPath, 'utf8').includes('patchDomChildren'), 'template component should contain the opt-in DOM patch path');
  assert(api.render("{% include 'prebuilt.html' %}", { label: 'Bundled' }) === '<strong>Bundled</strong>', 'global prebuilt templates should register before the component installs');
  assert(api.renderToString('<p>{{ value }}</p>', { value: 'SSR' }) === '<p>SSR</p>', 'renderToString should alias synchronous string rendering');
  assert(typeof api.renderToStringAsync === 'function', 'renderToStringAsync should expose the async SSR string API');
  assert(api.render('<img src="javascript:alert(1)" onerror="alert(2)"><script>alert(3)</script>', {}, { safe: true }) === '<img>', 'safe preset should sanitize HTML and unsafe resources');
  assert(api.render('<img src="custom://asset"><a href="custom://page">x</a>', {}, { safe: true, safeResourceProtocols: ['custom'] }).includes('custom://asset'), 'safe preset should support explicitly configured resource protocols');
  assert(api.render('<img src="data:image/png;base64,abc">', {}, { safe: true, safeDataImages: false }) === '<img>', 'safe preset should disable data images when configured');
  assert(api.render('<p>safe</p>', {}, { safe: true, safeSanitizer(html) { return html.replace('safe', 'post-processed'); } }) === '<p>post-processed</p>', 'safe preset should apply a post-sanitization hook');
  let blockedFilter = null;
  try {
    api.render('{{ value | upper }}', { value: 'ok' }, { safe: true, safeFilters: ['lower'] });
  } catch (error) {
    blockedFilter = error;
  }
  assert(blockedFilter && /Filter blocked by safe preset/.test(blockedFilter.message), 'safe preset should enforce filter allowlists');
  let blockedExpression = null;
  try {
    api.render('{{ constructor.constructor("return 1")() }}', {}, { safe: true });
  } catch (error) {
    blockedExpression = error;
  }
  assert(blockedExpression && /Unsafe expression blocked/.test(blockedExpression.message), 'safe preset should block unsafe expressions');
api.registerTemplates({ 'batch-a': 'A', 'batch-b': 'B' });
assert(api.render("{% include 'batch-a' %}{% include 'batch-b' %}") === 'AB', 'registerTemplates should add a template map in one call');

const files = {
  'header.html': '<header><h1>{{ title }}</h1></header>',
  'footer.html': '<footer>{{ year }}</footer>',
  'nav.html': '<nav>Navigation</nav>',
  'graph-root.html': "{% include 'graph-child.html' %}{% include dynamicPartial %}",
  'graph-child.html': "{% include 'nav.html' %}",
  'nested-error.html': "{% include 'broken.html' %}",
  'broken.html': '{% unknown %}',
  'cycle-a.html': "{% include 'cycle-b.html' %}",
  'cycle-b.html': "{% include 'cycle-a.html' %}"
};
const calls = new Map();

api.useLoader({
  name: 'JQTestLoader',
  base: '/templates/',
  extensions: ['.html'],
  async load(name, loaderContext) {
    calls.set(name, (calls.get(name) || 0) + 1);
    await Promise.resolve();
    assert(loaderContext.url === `/templates/${name}`, `unexpected loader URL: ${loaderContext.url}`);
    if (!Object.prototype.hasOwnProperty.call(files, name)) throw new Error(`Missing fixture: ${name}`);
    return files[name];
  }
});

(async () => {
  const page = "{% include 'header' %}<main>Body</main>{% include 'footer.html' %}";
  const first = await api.renderAsync(page, { title: 'JquanUI', year: 2026 });
  assert(first.includes('<h1>JquanUI</h1>'), 'external header should render with page data');
  assert(first.includes('<footer>2026</footer>'), 'external footer should render with page data');
  assert(calls.get('header.html') === 1 && calls.get('footer.html') === 1, 'each external template should load once');

  await api.renderAsync(page, { title: 'Cached', year: 2027 });
  assert(calls.get('header.html') === 1 && calls.get('footer.html') === 1, 'cached templates should not reload');
  assert(api.templateCacheSize() === 2, 'template cache should contain header and footer');

  await api.preload(['nav']);
  assert(calls.get('nav.html') === 1, 'preload should resolve extension and load the template');
  const navMeta = api.inspectTemplate('nav');
  assert(navMeta && navMeta.cached === true && navMeta.url === '/templates/nav.html', 'inspectTemplate should report cache metadata');
  assert(api.inspect('nav').url === navMeta.url, 'inspect should alias inspectTemplate');

  api.clearTemplateCache('nav');
  await Promise.all([api.preload('nav'), api.preload('nav')]);
  assert(calls.get('nav.html') === 2, 'concurrent loads should share one pending request');

  let syncError = null;
  try {
    api.render("{% include 'header.html' %}", {});
  } catch (error) {
    syncError = error;
  }
  assert(syncError && /Template not found/.test(syncError.message), 'sync render should not hide external async loading');

  let cycleError = null;
  try {
    await api.renderAsync("{% include 'cycle-a.html' %}", {});
  } catch (error) {
    cycleError = error;
  }
  assert(cycleError && /Include cycle detected/.test(cycleError.message), 'external include cycles should be rejected');
  assert(Array.isArray(cycleError.includeChain) && cycleError.includeChain.join(' -> ') === 'cycle-a.html -> cycle-b.html -> cycle-a.html', 'cycle errors should expose the complete include chain');

  const graph = await api.dependencyGraph('graph-root');
  assert(graph.entry === 'graph-root.html', 'dependencyGraph should normalize the entry name');
  assert(graph.order.join(',') === 'graph-root.html,graph-child.html,nav.html', 'dependencyGraph should traverse static dependencies in source order');
  assert(graph.nodes['graph-root.html'].dynamicDependencies[0] === 'dynamicPartial', 'dependencyGraph should report dynamic dependencies without requesting them');
  const cycleGraph = await api.dependencyGraph('cycle-a');
  assert(cycleGraph.cycles.length === 1 && cycleGraph.cycles[0].join(' -> ') === 'cycle-a.html -> cycle-b.html -> cycle-a.html', 'dependencyGraph should report include cycles without recursing forever');

  let nestedError = null;
  try {
    await api.renderAsync("{% include 'nested-error.html' %}", {});
  } catch (error) {
    nestedError = error;
  }
  assert(nestedError && nestedError.templateName === 'broken.html', 'nested template errors should identify the failing file');
  assert(nestedError.includeChain.join(' -> ') === 'nested-error.html -> broken.html', 'nested template errors should expose the complete include chain');
  assert(nestedError.position && nestedError.position.line === 1 && nestedError.snippet.length > 0, 'nested template errors should preserve file-local position and source context');

  api.clearCache();
  const firstAst = api.compile('<p>first</p>', { cacheLimit: 2 });
  api.compile('<p>second</p>', { cacheLimit: 2 });
  api.compile('<p>third</p>', { cacheLimit: 2 });
  assert(api.cacheSize() === 2, 'compiled template cache should respect cacheLimit');
  assert(api.compile('<p>first</p>', { cacheLimit: 2 }) !== firstAst, 'compiled template cache should evict the least recently used AST');
  api.clearCache();
  api.compile('<p>uncached</p>', { cacheLimit: 0 });
  assert(api.cacheSize() === 0, 'cacheLimit=0 should disable compiled template caching');

  const boundedCalls = new Map();
  api.useLoader({
    name: 'JQBoundedLoader',
    base: '/templates/',
    extensions: ['.html'],
    cache: { maxEntries: 2, ttl: 8, version: 'fixture-v1' },
    async load(name) {
      boundedCalls.set(name, (boundedCalls.get(name) || 0) + 1);
      return files[name];
    }
  });
  await api.preload(['header', 'footer']);
  await api.renderAsync("{% include 'header' %}", { title: 'LRU' });
  await api.preload('nav');
  assert(api.templateCacheSize() === 2, 'external template cache should respect maxEntries');
  assert(api.inspectTemplate('footer') === null, 'external template cache should evict the least recently used entry');
  const boundedHeader = api.inspectTemplate('header');
  assert(boundedHeader && boundedHeader.version === 'fixture-v1' && boundedHeader.hits === 1, 'template metadata should report version and cache hits');

  await new Promise(resolve => setTimeout(resolve, 12));
  await api.preload('header');
  assert(boundedCalls.get('header.html') === 2, 'expired external templates should reload after ttl');

  let releaseSlowLoad;
  api.useLoader({
    name: 'JQSlowLoader',
    base: '/templates/',
    load: async name => await new Promise(resolve => {
      releaseSlowLoad = () => resolve(files[name]);
    })
  });
  const staleLoad = api.preload('nav');
  await Promise.resolve();
  api.useLoader({
    name: 'JQReplacementLoader',
    base: '/templates/',
    load: async name => files[name]
  });
  releaseSlowLoad();
  await staleLoad;
  assert(api.templateCacheSize() === 0, 'a superseded loader request should not populate the replacement loader cache');

  await api.preload('nav');
  context.JquanUIComponents.template.install({ addBehaviors() {} });
  context.dispatchEvent({ type: 'jquan:template:update', detail: { name: 'nav.html' } });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert(api.templateCacheSize() === 0, 'template HMR events should invalidate matching external cache entries');

  await api.preload('nav');
  const refreshReport = await api.refresh('nav.html');
  assert(refreshReport.invalidated === 1 && refreshReport.rendered === 0 && refreshReport.failed === 0, 'refresh should report invalidation and rerender counts');
  context.JquanUIComponents.template.teardown();
  await api.preload('nav');
  context.dispatchEvent({ type: 'jquan:template:update', detail: { name: 'nav.html' } });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert(api.templateCacheSize() === 1, 'template teardown should remove the HMR event listener');

  api.clearTemplateCache();
  assert(api.templateCacheSize() === 0, 'clearTemplateCache should clear all external templates');
  api.clearLoader();
  assert(api.inspectTemplate('header.html') === null, 'clearLoader should remove loader state');

  console.log('[JquanUI] template component check ok');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
