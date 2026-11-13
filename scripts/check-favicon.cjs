'use strict';

const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('dist/components/favicon.js', 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function createDocument() {
  const links = [];
  const head = {
    appendChild(node) { node.isConnected = true; links.push(node); return node; },
    querySelector(selector) { return selector.includes('icon') ? links.find(node => node.isConnected !== false) || null : null; }
  };
  return {
    head,
    querySelector: selector => head.querySelector(selector),
    seedIcon(href) {
      const link = this.createElement('link');
      link.setAttribute('rel', 'icon');
      link.setAttribute('href', href);
      head.appendChild(link);
      return link;
    },
    createElement() {
      const attributes = new Map();
      return {
        isConnected: false,
        attributes: [],
        setAttribute(name, value) { attributes.set(name, String(value)); this.attributes = Array.from(attributes, ([key, item]) => ({ name: key, value: item })); },
        getAttribute(name) { return attributes.get(name) || null; },
        removeAttribute(name) { attributes.delete(name); this.attributes = Array.from(attributes, ([key, item]) => ({ name: key, value: item })); },
        remove() { this.isConnected = false; },
      };
    }
  };
}

const document = createDocument();
document.seedIcon('/brand.ico');
const window = {
  document,
  JquanUIComponents: {},
  clearInterval,
  setInterval,
  matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; }
};
window.window = window;
vm.runInNewContext(source, window);
const api = window.JquanUIComponents.faviconApi;
assert(api && typeof api.set === 'function' && typeof api.badge === 'function', 'favicon API missing');

const base = { svg: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#2563eb"/></svg>' };
api.set(base);
const link = document.head.querySelector('link[rel~="icon"]');
assert(link && link.getAttribute('type') === 'image/svg+xml', 'SVG favicon was not installed');
api.badge(1200);
assert(link.getAttribute('href').includes('999%2B') || link.getAttribute('href').includes('999%252B'), 'badge boundary was not normalized');
api.status('success');
assert(link.getAttribute('href').startsWith('data:image/svg+xml'), 'status favicon was not rendered');
api.clear();
assert(link.getAttribute('href').includes('%3Csvg') || link.getAttribute('href').includes('%3Csvg'), 'clear did not restore base icon');
const other = api.create();
other.status('error');
other.destroy();
assert(link.isConnected !== false && link.getAttribute('href') === '/brand.ico', 'destroy did not restore original favicon');
api.set(base);
api.restore();
assert(link.isConnected !== false && link.getAttribute('href') === '/brand.ico', 'restore did not preserve original favicon');
let unsafeRejected = false;
try { api.set({ svg: '<svg><script>alert(1)</script></svg>' }); } catch (error) { unsafeRejected = error?.name === 'TypeError'; }
assert(unsafeRejected, 'unsafe SVG source was not rejected');
console.log('[JquanUI] favicon check ok');
