'use strict';

const path = require('path');
const fs = require('fs');
const { createTemplateBundle, extractFromFiles, normalizeContentEntries, resolveConfig, resolveConfigFile } = require('./jquan-extract.cjs');

const VIRTUAL_ID = 'virtual:jquanui.css';
const RESOLVED_VIRTUAL_ID = '\0virtual:jquanui.css';
const TEMPLATE_HMR_EVENT = 'jquanui:template-update';
const TEMPLATE_HMR_CLIENT = `
if (import.meta.hot) {
  import.meta.hot.on('${TEMPLATE_HMR_EVENT}', data => {
    window.dispatchEvent(new CustomEvent('jquan:template:update', { detail: data }));
  });
}
`;

function normalizeInputs(input, config = {}) {
    if (input === undefined || input === null) {
        const contentInputs = normalizeContentEntries(config.content);
        return contentInputs.length > 0 ? contentInputs : ['index.html', 'src'];
    }
    return Array.isArray(input) ? input : [input];
}

function createCssBuilder(options, rootRef) {
    let cachedResult = null;
    let cachedSignature = '';

    return function buildResult(force = false) {
        const root = rootRef.root || process.cwd();
        const config = options.config && typeof options.config === 'object' ? options.config : resolveConfig({ root, configFile: options.configFile });
        const inputs = normalizeInputs(options.input, config).map(item => path.resolve(root, item));
        const configFile = resolveConfigFile({ root, config: options.config, configFile: options.configFile }) || '';
        const signature = JSON.stringify({
            inputs,
            minify: !!options.minify,
            core: options.core || '',
            config,
            configFile,
            configMtime: configFile && fs.existsSync(configFile) ? fs.statSync(configFile).mtimeMs : 0
        });
        if (!force && cachedResult !== null && cachedSignature === signature) return cachedResult;
        const result = extractFromFiles(inputs, {
            core: options.core ? path.resolve(root, options.core) : undefined,
            config,
            configFile: configFile || undefined,
            root,
            minify: !!options.minify,
            split: options.split === true
        });
        cachedResult = result;
        cachedSignature = signature;
        return cachedResult;
    };
}

function jquanUIVitePlugin(options = {}) {
    const pluginOptions = Object.assign({
        output: 'assets/jquan.css',
        baselineOutput: 'assets/jquan.base.css',
        utilitiesOutput: 'assets/jquan.utilities.css',
        split: false,
        emit: true,
        inject: 'style',
        minify: true,
        templateHmr: true,
        templateBundle: false,
        templateBundleInject: true
    }, options);
    const rootRef = { root: process.cwd() };
    const buildResult = createCssBuilder(pluginOptions, rootRef);
    const buildCss = force => buildResult(force).css;
    let templateBuildResult = null;

    function buildTemplates(force = false) {
        if (typeof pluginOptions.templateBundle !== 'string' || !pluginOptions.templateBundle.trim()) return null;
        if (!force && templateBuildResult) return templateBuildResult;
        const templateRoot = pluginOptions.templateRoot || pluginOptions.templates || 'templates';
        const inputs = pluginOptions.templateInput || templateRoot;
        templateBuildResult = createTemplateBundle(inputs, {
            root: rootRef.root,
            templates: templateRoot
        });
        return templateBuildResult;
    }

    function assertWarnings(result) {
        if (!pluginOptions.failOnWarn || !result || !result.report) return;
        if (result.report.unresolvedClassCount > 0 || result.report.failedRuleCount > 0 || result.report.configWarnings?.length > 0) {
            throw new Error(`[JquanUI] Static extraction found ${result.report.warnings} warning(s). See ${pluginOptions.report || 'report output'} for details.`);
        }
    }

    return {
        name: 'jquanui-static-extractor',
        enforce: 'pre',
        configResolved(config) {
            rootRef.root = config.root || process.cwd();
            rootRef.command = config.command || 'build';
            rootRef.base = config.base || '/';
        },
        resolveId(id) {
            if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
            return null;
        },
        load(id) {
            if (id === RESOLVED_VIRTUAL_ID) return buildCss();
            return null;
        },
        transformIndexHtml() {
            const tags = [];
            const result = pluginOptions.inject ? buildResult() : null;
            const splitOutputs = pluginOptions.split === true;
            const cssAssets = splitOutputs
                ? [
                    { css: result && result.baselineCss, output: pluginOptions.baselineOutput },
                    { css: result && result.utilityCss, output: pluginOptions.utilitiesOutput }
                ]
                : [{ css: result && result.css, output: pluginOptions.output }];
            const base = String(rootRef.base || '/').replace(/\/$/, '');
            if (pluginOptions.inject === 'link') {
                cssAssets.filter(asset => asset.output).forEach(asset => tags.push({
                    tag: 'link',
                    attrs: { rel: 'stylesheet', href: `${base}/${String(asset.output).replace(/\\/g, '/').replace(/^\//, '')}` },
                    injectTo: 'head'
                }));
            } else if (pluginOptions.inject) {
                cssAssets.filter(asset => asset.css).forEach((asset, index) => tags.push({
                    tag: 'style',
                    attrs: { 'data-jquanui-static': splitOutputs ? (index === 0 ? 'baseline' : 'utilities') : '' },
                    children: asset.css,
                    injectTo: 'head'
                }));
            }
            if (rootRef.command === 'serve' && pluginOptions.templateHmr !== false) {
                tags.push({
                    tag: 'script',
                    attrs: { type: 'module', 'data-jquanui-template-hmr': '' },
                    children: TEMPLATE_HMR_CLIENT,
                    injectTo: 'body'
                });
            }
            if (rootRef.command === 'build' && typeof pluginOptions.templateBundle === 'string' && pluginOptions.templateBundleInject !== false) {
                const base = String(rootRef.base || '/').replace(/\/$/, '');
                const source = pluginOptions.templateBundle.replace(/\\/g, '/').replace(/^\//, '');
                tags.push({
                    tag: 'script',
                    attrs: { src: `${base}/${source}`, 'data-jquanui-templates': '' },
                    injectTo: 'head'
                });
            }
            return tags.length ? tags : undefined;
        },
        buildStart() {
            const configFile = resolveConfigFile({ root: rootRef.root, config: pluginOptions.config, configFile: pluginOptions.configFile });
            if (configFile && this.addWatchFile) this.addWatchFile(configFile);
            const templateResult = buildTemplates();
            if (templateResult && this.addWatchFile) templateResult.files.forEach(file => this.addWatchFile(file));
            if (pluginOptions.warmup !== false) buildCss(true);
        },
        generateBundle() {
            const result = buildResult(true);
            const emitCombined = pluginOptions.split !== true || Object.prototype.hasOwnProperty.call(options, 'output');
            if (pluginOptions.emit && emitCombined) {
                this.emitFile({
                    type: 'asset',
                    fileName: pluginOptions.output,
                    source: result.css
                });
            }
            if (pluginOptions.emit && pluginOptions.split === true) {
                if (pluginOptions.baselineOutput) this.emitFile({ type: 'asset', fileName: pluginOptions.baselineOutput, source: result.baselineCss });
                if (pluginOptions.utilitiesOutput) this.emitFile({ type: 'asset', fileName: pluginOptions.utilitiesOutput, source: result.utilityCss });
            }
            if (pluginOptions.report) {
                this.emitFile({
                    type: 'asset',
                    fileName: pluginOptions.report,
                    source: JSON.stringify(result.report, null, 2)
                });
            }
            const templateResult = buildTemplates(true);
            if (templateResult) {
                this.emitFile({
                    type: 'asset',
                    fileName: pluginOptions.templateBundle,
                    source: templateResult.code
                });
                if (pluginOptions.templateBundleReport) {
                    this.emitFile({
                        type: 'asset',
                        fileName: pluginOptions.templateBundleReport,
                        source: JSON.stringify(templateResult.report, null, 2)
                    });
                }
            }
            assertWarnings(result);
        },
        handleHotUpdate(ctx) {
            if (!ctx || !ctx.file) return;
            const normalized = ctx.file.replace(/\\/g, '/');
            const configFile = (resolveConfigFile({ root: rootRef.root, config: pluginOptions.config, configFile: pluginOptions.configFile }) || '').replace(/\\/g, '/');
            const extensions = ['.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];
            if (normalized === configFile || extensions.some(ext => normalized.endsWith(ext))) buildCss(true);
            if (pluginOptions.templateHmr !== false && /\.html?$/i.test(normalized) && ctx.server && ctx.server.ws) {
                const relative = path.relative(rootRef.root, ctx.file).replace(/\\/g, '/');
                ctx.server.ws.send({
                    type: 'custom',
                    event: TEMPLATE_HMR_EVENT,
                    data: {
                        file: normalized,
                        relative,
                        name: path.basename(normalized),
                        timestamp: Date.now()
                    }
                });
            }
        }
    };
}

module.exports = jquanUIVitePlugin;
module.exports.jquanUIVitePlugin = jquanUIVitePlugin;
module.exports.VIRTUAL_ID = VIRTUAL_ID;
module.exports.TEMPLATE_HMR_EVENT = TEMPLATE_HMR_EVENT;
