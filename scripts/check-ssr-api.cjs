#!/usr/bin/env node
'use strict';

const jquan = require('../dist/index.cjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = '<html><head><style id="jquan-critical">old</style></head><body><main class="container dark:bg-slate-900"></main></body></html>';
const injected = jquan.injectCriticalCss(html, {
  id: 'jquan-critical',
  nonce: 'a&b',
  attributes: { 'data-route': '/dashboard' },
  minify: true
});

assert(injected.html.includes('id="jquan-critical"'), 'critical style id missing');
assert(injected.html.includes('nonce="a&amp;b"'), 'critical style nonce not escaped');
assert(injected.html.includes('data-route="/dashboard"'), 'custom critical style attribute missing');
assert(!injected.html.includes('old</style>'), 'existing critical style was not replaced');
assert(injected.css.includes('.container'), 'critical CSS did not include container rule');
assert(injected.attributes.id === 'jquan-critical', 'returned attributes missing id');

const styleTag = jquan.createCriticalStyleTag('.x{}', {
  id: 'plain',
  nonce: 'nonce-1',
  attribute: false
});
assert(styleTag === '<style id="plain" nonce="nonce-1">.x{}</style>', 'style tag rendering mismatch');

const noMarker = jquan.injectCriticalCss('<div class="p-4"></div>', { attribute: false });
assert(!noMarker.styleTag.includes('data-jquanui-critical'), 'attribute:false should disable default marker');

const singleQuoted = jquan.injectCriticalCss("<html><head><style id='jquan-critical'>old</style></head><body><div class='p-4'></div></body></html>", {
  id: 'jquan-critical'
});
assert(!singleQuoted.html.includes('old</style>'), 'single-quoted existing critical style was not replaced');

const ssr = require('../dist/ssr/jquan-ssr.cjs');
assert(jquan.ssr && jquan.createSSRAdapter === ssr.createSSRAdapter, 'root SSR adapter exports are not aligned');
const generic = ssr.createSSRAdapter({
  name: 'fixture',
  critical: { id: 'fixture-critical', nonce: 'fixed-nonce' },
  render(value) { return `<main class="p-4 text-primary">${value}</main>`; }
});
const genericPage = generic.renderPage('Hello', null, { document: true });
  assert(genericPage.framework === 'fixture', 'generic adapter did not preserve its framework name');
  assert(genericPage.html.includes('<!doctype html>') && genericPage.html.includes('fixture-critical'), 'generic adapter did not create a critical HTML document');
  assert(genericPage.css.includes('.p-4') && genericPage.classes.includes('text-primary'), 'generic adapter did not reuse critical CSS extraction');
  assert(generic.createDocument('<section class="grid"></section>', { lang: 'zh-CN' }).includes('<html lang="zh-CN">'), 'SSR document helper did not escape/apply document language');

const customDocument = ssr.createSSRAdapter({
  name: 'custom-document',
  document(rendered) { return `<html><head>${rendered.head}</head><body data-custom="true">${rendered.html}</body></html>`; }
});
assert(customDocument.createDocument({ html: '<main class="p-4"></main>', head: '<meta charset="utf-8">' }).includes('data-custom="true"'), 'custom document factory was not reused by createDocument');

const react = ssr.createReactSSRAdapter({ renderToString: element => `<div class="rounded-lg">${element}</div>` });
const reactPage = react.renderPage('React', undefined, { document: true });
assert(reactPage.framework === 'react' && reactPage.css.includes('.rounded-lg'), 'React adapter did not use renderToString');

(async () => {
  const vue = ssr.createVueSSRAdapter({ renderToString: async app => `<article class="grid gap-4">${app}</article>` });
  const vuePage = await vue.renderPage('Vue', undefined, { document: true });
  assert(vuePage.framework === 'vue' && vuePage.css.includes('.gap-4'), 'Vue adapter did not await renderToString');

  const svelte = ssr.createSvelteSSRAdapter({
    render(component, props) {
      return { html: `<section class="p-4">${component}:${props.name}</section>`, head: '<meta name="fixture" content="svelte">', css: { code: '.fixture { color: rebeccapurple; }' } };
    }
  });
  const sveltePage = svelte.renderPage('Card', { name: 'Ada' }, { document: true });
  assert(sveltePage.framework === 'svelte' && sveltePage.html.includes('data-jquanui-framework') && sveltePage.html.includes('name="fixture"'), 'Svelte adapter did not preserve framework head/css');
  assert(sveltePage.css.includes('.p-4') && sveltePage.frameworkCss.includes('rebeccapurple'), 'Svelte adapter did not extract component classes');

  const next = ssr.createNextSSRAdapter({ critical: { attribute: 'data-next-critical' } });
  const nextPage = next.inject('<html><head></head><body><div class="container"></div></body></html>');
  assert(nextPage.framework === 'next' && nextPage.styleTag.includes('data-next-critical'), 'Next adapter did not transform a rendered response');
  const nuxt = ssr.createNuxtSSRAdapter();
  assert(nuxt.inject('<div class="flex"></div>').framework === 'nuxt', 'Nuxt adapter did not expose the response transformer');
  let invalidOutputRejected = false;
  try { ssr.normalizeRenderedOutput({}); } catch (error) { invalidOutputRejected = /HTML string/.test(error.message); }
  assert(invalidOutputRejected, 'invalid framework output should be rejected');
  console.log('[JquanUI] ssr api check ok');
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
