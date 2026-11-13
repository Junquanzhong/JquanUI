'use strict';

const path = require('path');
const {
    createTemplateBundle,
    extractFromFiles,
    normalizeContentEntries,
    resolveConfig,
    resolveConfigFile
} = require('./jquan-extract.cjs');

function normalizeInputs(input, config = {}) {
    if (input === undefined || input === null) {
        const contentInputs = normalizeContentEntries(config.content);
        return contentInputs.length > 0 ? contentInputs : ['index.html', 'src'];
    }
    return Array.isArray(input) ? input : [input];
}

function buildExtraction(options = {}, root = process.cwd()) {
    const config = options.config && typeof options.config === 'object'
        ? options.config
        : resolveConfig({ root, configFile: options.configFile });
    const configFile = resolveConfigFile({ root, config: options.config, configFile: options.configFile });
    const inputs = normalizeInputs(options.input, config).map(item => path.resolve(root, item));
    return extractFromFiles(inputs, {
        core: options.core ? path.resolve(root, options.core) : undefined,
        config,
        configFile: configFile || undefined,
        root,
        minify: !!options.minify,
        split: options.split === true
    });
}

function assertWarnings(result, options = {}) {
    if (!options.failOnWarn || !result || !result.report) return;
    if (result.report.unresolvedClassCount > 0 || result.report.failedRuleCount > 0 || result.report.configWarnings?.length > 0) {
        throw new Error(`[JquanUI] Static extraction found ${result.report.warnings} warning(s).`);
    }
}

function jquanUIPostCSSPlugin(options = {}) {
    return {
        postcssPlugin: 'jquanui-static-extractor',
        Once(root, helpers = {}) {
            if (typeof options.templateBundle === 'string' && options.templateBundle.trim()) {
                const fs = require('fs');
                const bundle = createTemplateBundle(options.templateInput || options.templateRoot || options.templates || 'templates', {
                    root: options.root || process.cwd(),
                    templates: options.templateRoot || options.templates || 'templates'
                });
                const output = path.resolve(options.root || process.cwd(), options.templateBundle);
                fs.mkdirSync(path.dirname(output), { recursive: true });
                fs.writeFileSync(output, bundle.code, 'utf8');
                if (options.templateBundleReport) {
                    const reportOutput = path.resolve(options.root || process.cwd(), options.templateBundleReport);
                    fs.mkdirSync(path.dirname(reportOutput), { recursive: true });
                    fs.writeFileSync(reportOutput, JSON.stringify(bundle.report, null, 2), 'utf8');
                }
                if (root.result && root.result.messages) {
                    root.result.messages.push({
                        type: 'asset',
                        plugin: 'jquanui-static-extractor',
                        file: options.templateBundle,
                        content: bundle.code,
                        templateCount: bundle.count
                    });
                }
            }
            const result = buildExtraction(options, options.root || process.cwd());
            let replaced = false;

            root.walkAtRules('jquanui', atRule => {
                const param = String(atRule.params || '').trim();
                if (param && param !== 'utilities' && param !== 'baseline') return;
                const css = options.split === true && param === 'baseline' ? result.baselineCss
                    : options.split === true && param === 'utilities' ? result.utilityCss
                    : result.css;
                atRule.replaceWith(helpers.postcss.parse(css));
                replaced = true;
            });

            if (!replaced && options.inject) {
                const css = options.split === true ? [result.baselineCss, result.utilityCss].filter(Boolean).join('\n') : result.css;
                root.append(helpers.postcss.parse(css));
            }

            if (options.baselineOutput || options.utilitiesOutput) {
                const fs = require('fs');
                const rootPath = options.root || process.cwd();
                const outputs = [
                    ['baselineOutput', result.baselineCss],
                    ['utilitiesOutput', result.utilityCss]
                ];
                outputs.forEach(([key, css]) => {
                    if (!options[key]) return;
                    const output = path.resolve(rootPath, options[key]);
                    fs.mkdirSync(path.dirname(output), { recursive: true });
                    fs.writeFileSync(output, css, 'utf8');
                    if (root.result && root.result.messages) root.result.messages.push({
                        type: 'asset',
                        plugin: 'jquanui-static-extractor',
                        file: options[key],
                        content: css,
                        cssPart: key === 'baselineOutput' ? 'baseline' : 'utilities'
                    });
                });
            }

            if (options.report && root.result && root.result.messages) {
                root.result.messages.push({
                    type: 'asset',
                    plugin: 'jquanui-static-extractor',
                    file: options.report,
                    content: JSON.stringify(result.report, null, 2)
                });
            }

            assertWarnings(result, options);
        }
    };
}

jquanUIPostCSSPlugin.postcss = true;
jquanUIPostCSSPlugin.buildExtraction = buildExtraction;

module.exports = jquanUIPostCSSPlugin;
module.exports.jquanUIPostCSSPlugin = jquanUIPostCSSPlugin;
