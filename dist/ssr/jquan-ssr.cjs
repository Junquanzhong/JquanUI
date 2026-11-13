'use strict';

// JquanUI SSR bridge: framework-neutral by design, with no React/Vue/Svelte dependency.
const extractor = require('../cli/jquan-extract.cjs');

function isPromise(value) {
  return !!value && typeof value.then === 'function';
}

function normalizeRenderedOutput(value) {
  if (typeof value === 'string') return { html: value, head: '', css: '', output: value };
  if (!value || typeof value !== 'object' || typeof value.html !== 'string') {
    throw new TypeError('[JquanUI SSR] A renderer must return an HTML string or an object with an html string.');
  }
  return {
    html: value.html,
    head: typeof value.head === 'string' ? value.head : '',
    css: value.css && typeof value.css.code === 'string' ? value.css.code : (typeof value.css === 'string' ? value.css : ''),
    output: value
  };
}

function createHtmlDocument(rendered, options = {}) {
  const data = normalizeRenderedOutput(rendered);
  const lang = typeof options.lang === 'string' && options.lang.trim() ? ` lang="${extractor.escapeHtmlAttribute(options.lang.trim())}"` : '';
  const head = `${data.head}${data.css ? `<style data-jquanui-framework>${data.css}</style>` : ''}`;
  return `<!doctype html><html${lang}><head>${head}</head><body>${data.html}</body></html>`;
}

function createSSRAdapter(options = {}) {
  const name = typeof options.name === 'string' && options.name.trim() ? options.name.trim() : 'generic';
  const renderer = typeof options.render === 'function' ? options.render : null;
  const documentFactory = typeof options.document === 'function' ? options.document : null;
  const critical = Object.assign({}, options.critical || {});

  function inject(rendered, renderOptions = {}) {
    const normalized = normalizeRenderedOutput(rendered);
    const documentOptions = renderOptions.document;
    const source = typeof documentOptions === 'function'
      ? documentOptions(normalized, renderOptions)
      : (documentOptions === true || documentFactory ? (documentFactory || createHtmlDocument)(normalized, renderOptions) : normalized.html);
    if (typeof source !== 'string') throw new TypeError('[JquanUI SSR] document() must return an HTML string.');
    const result = extractor.injectCriticalCss(source, Object.assign({}, critical, renderOptions.critical || {}));
    return Object.assign(result, {
      framework: name,
      rendered: normalized.output,
      frameworkHead: normalized.head,
      frameworkCss: normalized.css
    });
  }

  function renderPage(input, context, renderOptions = {}) {
    const value = renderer ? renderer(input, context) : input;
    return isPromise(value) ? value.then(output => inject(output, renderOptions)) : inject(value, renderOptions);
  }

  return Object.freeze({
    name,
    inject,
    renderPage,
    createDocument(rendered, documentOptions = {}) {
      const normalized = normalizeRenderedOutput(rendered);
      return (documentFactory || createHtmlDocument)(normalized, documentOptions);
    }
  });
}

function resolveRenderer(renderer, method, label) {
  if (typeof renderer === 'function') return renderer;
  if (renderer && typeof renderer[method] === 'function') return renderer[method].bind(renderer);
  throw new TypeError(`[JquanUI SSR] ${label} needs a ${method} renderer function.`);
}

function createReactSSRAdapter(renderer, options = {}) {
  const render = resolveRenderer(renderer, 'renderToString', 'React adapter');
  return createSSRAdapter(Object.assign({}, options, { name: options.name || 'react', render: (element, context) => render(element, context) }));
}

function createVueSSRAdapter(renderer, options = {}) {
  const render = resolveRenderer(renderer, 'renderToString', 'Vue adapter');
  return createSSRAdapter(Object.assign({}, options, { name: options.name || 'vue', render: (app, context) => render(app, context) }));
}

function createSvelteSSRAdapter(renderer, options = {}) {
  const render = resolveRenderer(renderer, 'render', 'Svelte adapter');
  return createSSRAdapter(Object.assign({}, options, { name: options.name || 'svelte', render: (component, props) => render(component, props || {}) }));
}

function createNextSSRAdapter(options = {}) {
  return createSSRAdapter(Object.assign({}, options, { name: options.name || 'next' }));
}

function createNuxtSSRAdapter(options = {}) {
  return createSSRAdapter(Object.assign({}, options, { name: options.name || 'nuxt' }));
}

module.exports = {
  createHtmlDocument,
  createSSRAdapter,
  createReactSSRAdapter,
  createVueSSRAdapter,
  createSvelteSSRAdapter,
  createNextSSRAdapter,
  createNuxtSSRAdapter,
  normalizeRenderedOutput
};
