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

class ClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach(value => this.values.add(value)); }
  remove(...values) { values.forEach(value => this.values.delete(value)); }
  contains(value) { return this.values.has(value); }
}

class Element {
  constructor(tagName = 'div') {
    this.tagName = String(tagName).toUpperCase();
    this.id = '';
    this.innerHTML = '';
    this.attributes = new Map();
    this.classList = new ClassList();
    this.events = new Map();
    this.children = [];
  }
  setAttribute(name, value) {
    const normalized = String(value);
    this.attributes.set(String(name), normalized);
    if (name === 'id') this.id = normalized;
  }
  getAttribute(name) { return this.attributes.has(String(name)) ? this.attributes.get(String(name)) : null; }
  removeAttribute(name) { this.attributes.delete(String(name)); }
  addEventListener(type, handler) {
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(handler);
  }
  dispatchEvent(event) {
    (this.events.get(event.type) || []).forEach(handler => handler(event));
    return true;
  }
  insertAdjacentHTML(position, html) {
    if (position === 'beforeend') this.innerHTML += String(html);
  }
  appendChild(child) { this.children.push(child); return child; }
}

function createRuntime() {
  const elements = new Map();
  const head = new Element('head');
  const document = {
    head,
    createElement(tagName) { return new Element(tagName); },
    querySelector(selector) {
      if (selector.startsWith('#')) return elements.get(selector.slice(1)) || null;
      return null;
    },
    getElementById(id) { return elements.get(id) || null; }
  };
  const context = {
    window: null,
    document,
    HTMLElement: Element,
    console,
    Intl,
    Date,
    Promise,
    setTimeout,
    clearTimeout,
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) { this.type = type; this.detail = init.detail; this.bubbles = !!init.bubbles; }
    },
    JQUAN_TEMPLATES: {}
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(componentPath, 'utf8'), context, { filename: componentPath });
  return { context, document, elements };
}

async function main() {
  const { context, document, elements } = createRuntime();
  const api = context.JquanUIComponents.templateApi;
  assert(api, 'templateApi should be installed');

  const loop = api.render(
    '{% for item in items %}<b>{{ item.name | upper }}</b>{% endfor %}{% if ready %}!{% endif %}',
    { items: [{ name: 'ada' }, { name: 'lin' }], ready: true }
  );
  assert(loop === '<b>ADA</b><b>LIN</b>!', 'syntax, loop, condition, and filter rendering failed');

  api.clearCache();
  const firstAst = api.compile('<p>{{ value }}</p>', { cacheLimit: 2 });
  assert(api.compile('<p>{{ value }}</p>', { cacheLimit: 2 }) === firstAst, 'compiled template cache should reuse ASTs');
  api.compile('<p>second</p>', { cacheLimit: 2 });
  api.compile('<p>third</p>', { cacheLimit: 2 });
  assert(api.cacheSize() === 2, 'compiled template cache should obey its limit');

  const files = {
    'header.html': '<header>{{ title }}</header>',
    'cycle-a.html': "{% include 'cycle-b.html' %}",
    'cycle-b.html': "{% include 'cycle-a.html' %}"
  };
  const loads = new Map();
  api.useLoader({
    name: 'JQRuntimeLoader',
    base: '/templates/',
    extensions: ['.html'],
    async load(name, loaderContext) {
      loads.set(name, (loads.get(name) || 0) + 1);
      assert(loaderContext.url === `/templates/${name}`, 'loader context URL should be normalized');
      if (!files[name]) throw new Error(`Missing fixture: ${name}`);
      await Promise.resolve();
      return files[name];
    }
  });
  const asyncHtml = await api.renderAsync("{% include 'header' %}", { title: 'JquanUI' });
  assert(asyncHtml === '<header>JquanUI</header>' && loads.get('header.html') === 1, 'async external include failed');
  await Promise.all([api.preload('header'), api.preload('header.html')]);
  assert(loads.get('header.html') === 1 && api.templateCacheSize() === 1, 'external template cache or pending-load dedupe failed');

  let cycleError = null;
  try { await api.renderAsync("{% include 'cycle-a' %}", {}); } catch (error) { cycleError = error; }
  assert(cycleError && /Include cycle detected/.test(cycleError.message), 'include cycle should be rejected');
  assert(Array.isArray(cycleError.includeChain) && cycleError.includeChain.length >= 3, `cycle error should expose the complete chain: ${JSON.stringify(cycleError.includeChain)}`);

  const createElement = document.createElement;
  document.createElement = undefined;
  const unsafe = api.render('<img src="javascript:alert(1)" onerror="alert(2)"><script>alert(3)</script>', {}, { safe: true });
  document.createElement = createElement;
  assert(unsafe === '<img>', 'safe preset should sanitize unsafe HTML');
  let blocked = null;
  try { api.render('{{ constructor.constructor("return 1")() }}', {}, { safe: true }); } catch (error) { blocked = error; }
  assert(blocked && /Unsafe expression blocked/.test(blocked.message), 'safe preset should block unsafe expressions');

  const element = new Element('main');
  element.id = 'runtime-mount';
  element.innerHTML = '<!-- original -->';
  elements.set(element.id, element);
  const handle = api.mount(element, { template: '<h1>{{ title }}</h1>', data: { title: 'First' } });
  assert(element.innerHTML === '<h1>First</h1>' && handle.html() === element.innerHTML, 'DOM mount should render initial data');
  handle.patch({ title: 'Second' });
  assert(element.innerHTML === '<h1>Second</h1>' && handle.state().data.title === 'Second', 'mounted handle patch should rerender data');
  handle.setData({ title: 'Third' });
  assert(element.innerHTML === '<h1>Third</h1>' && handle.state().rendered === element.innerHTML, 'mounted handle setData should replace data');
  assert(handle.destroy() === true && element.innerHTML === '<!-- original -->' && api.get(element) === null, 'DOM destroy should restore the original node');

  api.clearLoader();
  console.log('[JquanUI] template runtime check ok (syntax/cache/async/loop/safe/mount)');
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
