#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexTypes = fs.readFileSync(path.join(root, 'dist/index.d.ts'), 'utf8');
for (const field of ['version', 'engineVersion', 'versionLabel']) {
  if (!new RegExp('\\b' + field + ': string;').test(indexTypes)) throw new Error('Missing runtime version field: ' + field);
}
const extractTypes = fs.readFileSync(path.join(root, 'dist/cli/jquan-extract.d.ts'), 'utf8');
const viteTypes = fs.readFileSync(path.join(root, 'dist/cli/jquan-vite-plugin.d.ts'), 'utf8');
const postcssTypes = fs.readFileSync(path.join(root, 'dist/cli/jquan-postcss-plugin.d.ts'), 'utf8');
const migrateTypes = fs.readFileSync(path.join(root, 'dist/cli/jquan-migrate.d.ts'), 'utf8');
const ssrTypes = fs.readFileSync(path.join(root, 'dist/ssr/jquan-ssr.d.ts'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(/export const DEFAULT_EXTENSIONS/.test(indexTypes), 'root types missing DEFAULT_EXTENSIONS');
assert(/export const DEFAULT_CONFIG_FILES/.test(indexTypes), 'root types missing DEFAULT_CONFIG_FILES');

assert(!/vitePlugin/.test(extractTypes), 'extract subpath types must not expose vitePlugin');
assert(!/postcssPlugin/.test(extractTypes), 'extract subpath types must not expose postcssPlugin');
assert(!/\btokens\b/.test(extractTypes), 'extract subpath types must not expose tokens');
assert(/DEFAULT_EXTENSIONS/.test(extractTypes), 'extract subpath types missing DEFAULT_EXTENSIONS');
assert(/DEFAULT_CONFIG_FILES/.test(extractTypes), 'extract subpath types missing DEFAULT_CONFIG_FILES');
assert(/diagnoseProject/.test(extractTypes), 'extract subpath types missing diagnoseProject');
assert(/buildTemplatePages/.test(extractTypes), 'extract subpath types missing buildTemplatePages');
assert(/renderTemplateFile/.test(extractTypes), 'extract subpath types missing renderTemplateFile');
assert(/export function buildTemplatePages/.test(indexTypes), 'root types missing buildTemplatePages');
assert(/export function createNodeTemplateRuntime/.test(indexTypes), 'root types missing createNodeTemplateRuntime');
assert(/createTemplateBundle/.test(extractTypes), 'extract subpath types missing createTemplateBundle');
assert(/export function writeTemplateBundle/.test(indexTypes), 'root types missing writeTemplateBundle');
assert(/templateBundle\?: string \| false/.test(indexTypes), 'root VitePluginOptions missing templateBundle');
assert((indexTypes.match(/templateBundle\?: string \| false/g) || []).length >= 2, 'root PostCSSPluginOptions missing templateBundle');

assert(/export declare const VIRTUAL_ID/.test(viteTypes), 'vite types missing VIRTUAL_ID');
assert(/export declare const TEMPLATE_HMR_EVENT/.test(viteTypes), 'vite types missing TEMPLATE_HMR_EVENT');
assert(/export declare function jquanUIVitePlugin/.test(viteTypes), 'vite types missing named jquanUIVitePlugin');
assert(/export default jquanUIVitePlugin/.test(viteTypes), 'vite types missing default export');
assert(/templateHmr\?: boolean/.test(indexTypes), 'root VitePluginOptions missing templateHmr');
assert(/baselineCss: string/.test(indexTypes) && /utilityCss: string/.test(indexTypes), 'root extraction types missing split CSS fields');
assert(/split\?: boolean/.test(indexTypes), 'root extraction types missing split option');
assert(/baselineOutput\?: string \| false/.test(indexTypes), 'root plugin types missing baselineOutput');
assert(/utilitiesOutput\?: string \| false/.test(indexTypes), 'root plugin types missing utilitiesOutput');
assert(/prefetch\?\(classNames: Iterable<string> \| string, options\?: PrefetchOptions\): PrefetchResult/.test(indexTypes), 'root runtime types missing prefetch API');
assert(/export interface PrefetchOptions/.test(indexTypes) && /export interface PrefetchResult/.test(indexTypes), 'root types missing prefetch contracts');
assert(/checkClasses\(classNames: Iterable<string> \| string, options\?: ClassCheckOptions\): ClassCheckReport/.test(indexTypes), 'root runtime types missing class diagnostics');
for (const name of ['ClassCheckOptions', 'ClassCheckItem', 'ClassCheckReport', 'DebugOptions', 'UtilityResolution']) {
  assert(indexTypes.includes('export interface ' + name) && extractTypes.includes('type ' + name), `Missing root/extract diagnostic type: ${name}`);
}
assert(indexTypes.includes('resolve-error') && indexTypes.includes('insert-error'), 'runtime failure phase types missing');
assert(/export interface AdoptionOptions/.test(indexTypes) && /scan\?: boolean/.test(indexTypes) && /observe\?: boolean/.test(indexTypes), 'root types missing ShadowRoot adoption options');
assert(/getAdoptionStatus\?\(root\?: Document \| ShadowRoot\): AdoptionStatus/.test(indexTypes), 'root runtime types missing adoption status API');
assert(/createReactSSRAdapter/.test(indexTypes) && /export \* as ssr/.test(indexTypes), 'root types missing SSR adapter exports');
assert(/export interface SSRAdapter/.test(ssrTypes) && /createVueSSRAdapter/.test(ssrTypes) && /createSvelteSSRAdapter/.test(ssrTypes), 'SSR subpath types missing framework adapters');

assert(/export declare function buildExtraction/.test(postcssTypes), 'postcss types missing buildExtraction');
assert(/export declare function jquanUIPostCSSPlugin/.test(postcssTypes), 'postcss types missing named jquanUIPostCSSPlugin');
assert(/export default jquanUIPostCSSPlugin/.test(postcssTypes), 'postcss types missing default export');

assert(/export declare function auditCss\(/.test(migrateTypes), 'migrate types missing auditCss');
assert(/export declare function auditCssFiles\(/.test(migrateTypes), 'migrate types missing auditCssFiles');
assert(/export declare function auditClassFiles\(/.test(migrateTypes), 'migrate types missing auditClassFiles');
assert(/export declare function auditDarkSource\(/.test(migrateTypes) && /export declare function auditDarkFiles\(/.test(migrateTypes), 'migrate subpath types missing dark audit');
assert(/export function auditDarkSource\(/.test(indexTypes) && /export function auditDarkFiles\(/.test(indexTypes), 'root migrate types missing dark audit');
assert(/export declare function sortClassTokens\(/.test(migrateTypes), 'migrate types missing sortClassTokens');
assert(/export default migrate/.test(migrateTypes), 'migrate types missing default export');
assert(/export namespace migrate/.test(indexTypes), 'root types missing migrate namespace');
assert(/export function auditClassFiles\(/.test(indexTypes), 'root types missing migrate.auditClassFiles');
assert(/export function sortClassTokens\(/.test(indexTypes), 'root types missing migrate.sortClassTokens');
const browserGlobals = fs.readFileSync(path.join(root, 'dist/browser-globals.d.ts'), 'utf8');
assert(/import type \{ JquanRuntimeApi \}/.test(browserGlobals) && /const JquanUI: JquanRuntimeApi/.test(browserGlobals), 'browser globals missing typed Core runtime');
assert(/interface IframeBridgeApi/.test(browserGlobals), 'browser globals missing iframe bridge API');
assert(/createParent\(options: IframeBridgeOptions/.test(browserGlobals), 'browser globals missing iframe bridge parent type');
assert(/request<T = unknown>/.test(browserGlobals), 'browser globals missing iframe bridge request type');
assert(/interface FaviconApi/.test(browserGlobals), 'browser globals missing favicon API');
assert(/status\(state: 'idle' \| 'loading' \| 'success'/.test(browserGlobals), 'browser globals missing favicon status type');
assert(/watch\(options: FaviconWatchOptions/.test(browserGlobals), 'browser globals missing favicon watch type');

console.log('[JquanUI] types surface check ok');
