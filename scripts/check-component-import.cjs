'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const core = fs.readFileSync(path.join(root, 'dist/core/JquanUI@Core.js'), 'utf8');
const start = '/*! JquanUI component importer: generated start */';
const end = '/*! JquanUI component importer: generated end */';
assert(core.includes(start) && core.includes(end), 'Missing embedded importer');
const source = core.slice(core.indexOf(start) + start.length, core.indexOf(end));

function fixture(options = {}) {
    const downloads = [];
    const executions = [];
    const installs = [];
    const installed = new Set();
    const scripts = [];
    const outcomes = new Map();
    const registry = {};
    const context = { URL, Map, WeakSet, setTimeout, clearTimeout, Promise, JquanUIComponents: registry, JQUAN_CONFIG: options.config || {} };
    context.window = context;
    function register(name) {
        executions.push(name);
        registry[name] = /Preset$/.test(name) ? { classes: {} } : {
            name: `jquanui-${name === 'formValidator' ? 'form-validator' : name === 'schemaForm' ? 'schema-form' : name === 'overlayManager' ? 'overlay-manager' : name}`,
            requires: name === 'drawer' ? ['jquanui-modal'] : name === 'schemaForm' ? ['jquanui-form-validator'] : ['modal', 'dialog', 'popover', 'select'].includes(name) ? ['jquanui-overlay-manager'] : [],
            install() { if (outcomes.get(name) === 'install-error') throw new Error('fixture install failure'); installs.push(name); }
        };
        if (!/Preset$/.test(name) && name !== 'dialog') registry[`${name}Api`] = { component: name, text() { return 'fixture'; } };
    }
    function scriptElement() {
        const handlers = new Map();
        return {
            src: '', nonce: '', parentNode: null,
            setAttribute() {},
            addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); },
            removeEventListener(type, fn) { handlers.get(type)?.delete(fn); },
            emit(type) { Array.from(handlers.get(type) || []).forEach(fn => fn({ type })); }
        };
    }
    const parent = {
        appendChild(script) {
            if (options.appendError) throw new Error('fixture append failure');
            scripts.push(script);
            script.parentNode = parent;
            const name = new URL(script.src).pathname.split('/').pop().slice(0, -3);
            downloads.push({ name, url: script.src, nonce: script.nonce });
            const outcome = outcomes.get(name);
            if (outcome !== 'timeout') setTimeout(() => {
                if (outcome === 'error') script.emit('error');
                else { if (outcome !== 'unregistered') register(name); script.emit('load'); }
            }, 1);
        },
        removeChild(script) { scripts.splice(scripts.indexOf(script), 1); script.parentNode = null; }
    };
    context.document = {
        currentScript: { src: options.core || 'https://example.test/pkg/dist/core/JquanUI@Core.js?version=4.72', nonce: 'core-nonce' },
        baseURI: 'https://example.test/pages/nested/page.html', scripts, head: parent,
        createElement() { return scriptElement(); }
    };
    context.JquanUI = {
        hasPlugin: name => installed.has(name),
        use(plugin) {
            if (installed.has(plugin.name)) return false;
            plugin.requires.forEach(name => assert(installed.has(name), `dependency not installed: ${name}`));
            plugin.install();
            installed.add(plugin.name);
            return true;
        }
    };
    vm.runInNewContext(options.source || source, context);
    return { context, downloads, executions, installs, outcomes, registry, register, scripts, scriptElement, import: context.JquanUI.import };
}

async function main() {
    let checks = 0;
    const verify = (condition, message) => { assert(condition, message); checks++; };
    const f = fixture();
    verify(f.downloads.length === 0, 'Importer must not download anything until called');
    const [a, b, c] = await Promise.all([f.import('dom'), f.import('dom.js'), f.import('dom')]);
    verify(a === b && b === c && a === f.registry.domApi, 'Concurrent imports return the same API');
    verify(f.downloads.length === 1 && f.executions.length === 1 && f.installs.length === 1, 'Downloads, execution and install are deduplicated');
    verify(f.downloads[0].url === 'https://example.test/pkg/dist/components/dom.js' && f.downloads[0].nonce === 'core-nonce', 'Directory and nonce inherit from Core');
    await f.import('dom');
    verify(f.downloads.length === 1, 'Repeated import reuses loaded component');
    const results = await f.import(['drawer', 'schemaForm', 'table', 'storage', 'dom']);
    verify(results.map(value => value.component).join(',') === 'drawer,schemaForm,table,storage,dom', 'Batch preserves input order');
    verify(f.executions.indexOf('modal') < f.executions.indexOf('drawer') && f.installs.indexOf('modal') < f.installs.indexOf('drawer'), 'Required dependency executes and installs first');
    verify(f.executions.indexOf('uiPreset') < f.executions.indexOf('table') && f.executions.indexOf('pagination') < f.executions.indexOf('table'), 'Presets and operational dependencies load before consumers');
    verify(['localStorage', 'sessionStorage', 'cookie'].every(name => f.installs.indexOf(name) < f.installs.indexOf('storage')), 'Storage drivers install first');
    verify((await f.import('dialog')) === f.registry.dialog, 'Component without API returns the plugin');
    verify((await f.import('uiPreset')) === f.registry.uiPreset, 'Preset returns its registered object');
    const anchored = fixture();
    await anchored.import('popover');
    verify(anchored.installs.join(',') === 'overlayManager,popover', 'Popover importer installs its shared overlay dependency');
    verify(anchored.executions.indexOf('overlayPreset') < anchored.executions.indexOf('popover'), 'Popover preset loads before registration');
    const select = fixture();
    await select.import('select');
    verify(select.installs.join(',') === 'overlayManager,select', 'Select importer installs its shared overlay dependency');
    verify((await f.import([])).length === 0, 'Empty batch resolves without downloads');
    const manual = fixture();
    manual.register('dom');
    verify(await manual.import('dom') === manual.registry.domApi && manual.downloads.length === 0, 'Already registered script is reused');
    const mixed = fixture();
    await mixed.import('drawer', { install: false });
    verify(mixed.installs.length === 0, 'Load-only includes dependencies without installation');
    await mixed.import('drawer');
    verify(mixed.installs.join(',') === 'overlayManager,modal,drawer' && mixed.downloads.filter(item => item.name === 'drawer').length === 1, 'A later default import installs without executing again');
    const concurrentMixed = fixture();
    await Promise.all([concurrentMixed.import('dom', { install: false }), concurrentMixed.import('dom')]);
    verify(concurrentMixed.downloads.length === 1 && concurrentMixed.installs.length === 1, 'Concurrent load-only and install calls compose');
    for (const coreURL of ['https://example.test/pkg/js/JquanUI@core.min.js', 'https://example.test/pkg/dist/full/JquanUI@full.js']) {
        const located = fixture({ core: coreURL });
        await located.import('dom');
        verify(located.downloads[0].url === 'https://example.test/pkg/dist/components/dom.js', 'Minified/Full paths resolve components correctly');
    }
    const configured = fixture({ config: { componentLoader: { baseURL: '/custom', nonce: 'configured' } } });
    await configured.import('dom');
    verify(configured.downloads[0].url === 'https://example.test/custom/dom.js' && configured.downloads[0].nonce === 'configured', 'Global config overrides directory/nonce');
    const override = fixture();
    await override.import('dom', { baseURL: './local/', nonce: 'explicit' });
    verify(override.downloads[0].url === 'https://example.test/pages/nested/local/dom.js' && override.downloads[0].nonce === 'explicit', 'Relative per-call overrides use document.baseURI');
    for (const bad of ['../dom', 'https://example.test/dom.js', 'unknown', '__proto__', 42]) {
        await assert.rejects(f.import(bad), error => error.code === 'COMPONENT_UNKNOWN'); checks++;
    }
    for (const options of [{ timeout: 0 }, { timeout: Infinity }, { baseURL: '' }, { baseURL: 'http://[' }, { install: 'yes' }, { nonce: false }, null]) {
        await assert.rejects(f.import('dom', options), error => error.code === 'COMPONENT_INVALID_OPTIONS'); checks++;
    }
    const invalidBatch = fixture();
    await assert.rejects(invalidBatch.import(['dom', 'unknown']), error => error.code === 'COMPONENT_UNKNOWN');
    verify(invalidBatch.downloads.length === 0, 'Validate an entire batch before loading anything');
    for (const [outcome, code] of [['error', 'COMPONENT_LOAD_FAILED'], ['timeout', 'COMPONENT_TIMEOUT'], ['unregistered', 'COMPONENT_NOT_REGISTERED'], ['install-error', 'COMPONENT_INSTALL_FAILED']]) {
        const broken = fixture();
        broken.outcomes.set('dom', outcome);
        await assert.rejects(broken.import('dom', { timeout: 10 }), error => error.code === code && error.component === 'dom' && error.url.endsWith('/dom.js')); checks++;
        broken.outcomes.delete('dom');
        verify((await broken.import('dom')).component === 'dom', `${outcome} can be retried`);
    }
    const append = fixture({ appendError: true });
    await assert.rejects(append.import('dom'), error => error.code === 'COMPONENT_LOAD_FAILED'); checks++;
    const existing = fixture();
    const inFlight = existing.scriptElement();
    inFlight.src = 'https://example.test/pkg/dist/components/dom.js';
    existing.scripts.push(inFlight);
    const waiting = existing.import('dom');
    setTimeout(() => { existing.register('dom'); inFlight.emit('load'); }, 2);
    verify((await waiting).component === 'dom' && existing.downloads.length === 0, 'Reuses an existing in-flight script tag');
    const cycle = fixture({ source: source.replace('"dom":[]', '"dom":["dom"]') });
    await assert.rejects(cycle.import('dom'), error => error.code === 'COMPONENT_DEPENDENCY_CYCLE'); checks++;
    console.log(`[JquanUI] component import check ok (${checks} assertions)`);
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
