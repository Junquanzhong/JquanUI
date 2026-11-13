'use strict';

const fs = require('node:fs');
const path = require('node:path');

const postcssRoot = process.env.JQUAN_POSTCSS_ROOT;
if (!postcssRoot) throw new Error('Set JQUAN_POSTCSS_ROOT to the temporary PostCSS node_modules directory.');
const postcss = require(path.join(postcssRoot, 'postcss'));
const vm = require('node:vm');

const cssDir = process.argv[2];
if (!cssDir) throw new Error('Usage: node scripts/audit-real-css.cjs <css-directory>');
const projectRoot = process.argv[3] ? path.resolve(process.argv[3]) : null;
const corePath = process.argv[4] ? path.resolve(process.argv[4]) : null;

const files = fs.readdirSync(cssDir)
    .filter(name => name.endsWith('.css') && name !== 'swiper-bundle.min.css')
    .sort();

const totals = Object.create(null);
const byFile = [];
const properties = new Map();
const media = new Map();
const supports = new Map();

function increment(target, key, amount = 1) {
    target[key] = (target[key] || 0) + amount;
}

function mapIncrement(target, key, amount = 1) {
    target.set(key, (target.get(key) || 0) + amount);
}

function declarationCount(rule) {
    let count = 0;
    rule.each(node => {
        if (node.type === 'decl') count++;
    });
    return count;
}

function classifySelector(selector) {
    if (/::(?:before|after)\b/.test(selector)) return 'pseudo-element';
    if (/\bhtml(?::not\()?\[lang(?:=|\])/.test(selector) || /:lang\(/.test(selector)) return 'language-ancestor';
    if (/:has\(/.test(selector)) return 'has-relation';
    if (/\[(?:aria-|data-)[^\]]+\]/.test(selector)) return 'attribute-state';
    if (/:(?:hover|focus|focus-visible|focus-within|active|checked|disabled|invalid|valid)\b/.test(selector)) return 'interactive-state';
    if (/:(?:nth-|not\(|first-|last-|only-)/.test(selector)) return 'structural-state';
    if (/\s[>+~]\s|\s+[^,+]+/.test(selector.trim())) return 'compound-relation';
    if (/^[.#\[][\w\-\\\[\]=\"'*]+$/.test(selector.trim())) return 'simple-target';
    return 'other-selector';
}

for (const file of files) {
    const source = fs.readFileSync(path.join(cssDir, file), 'utf8');
    const root = postcss.parse(source, { from: file });
    const stats = { file, bytes: Buffer.byteLength(source), lines: source.split(/\r?\n/).length, rules: 0, declarations: 0 };
    const selectorContexts = new Map();

    root.walkAtRules(atRule => {
        if (atRule.name === 'media') mapIncrement(media, atRule.params);
        if (atRule.name === 'supports') mapIncrement(supports, atRule.params);
        if (/keyframes$/i.test(atRule.name)) increment(stats, 'keyframes');
    });

    root.walkRules(rule => {
        const inKeyframes = rule.parent && rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name);
        const decls = declarationCount(rule);
        stats.rules++;
        stats.declarations += decls;
        if (inKeyframes) {
            increment(stats, 'keyframe-rules');
            increment(stats, 'keyframe-declarations', decls);
            return;
        }

        const category = classifySelector(rule.selector);
        increment(stats, `${category}-rules`);
        increment(stats, `${category}-declarations`, decls);
        const atRuleContext = [];
        let contextParent = rule.parent;
        while (contextParent && contextParent.type !== 'root') {
            if (contextParent.type === 'atrule') atRuleContext.unshift(`@${contextParent.name} ${contextParent.params}`);
            contextParent = contextParent.parent;
        }
        const selectorKey = `${atRuleContext.join('|')}|${rule.selector.replace(/\s+/g, ' ').trim()}`;
        const currentProperties = new Set((rule.nodes || []).filter(node => node.type === 'decl').map(node => node.prop));
        if (selectorContexts.has(selectorKey)) {
            increment(stats, 'repeated-selector-blocks');
            const previousProperties = selectorContexts.get(selectorKey);
            increment(stats, 'redeclared-properties', [...currentProperties].filter(prop => previousProperties.has(prop)).length);
            currentProperties.forEach(prop => previousProperties.add(prop));
        } else {
            selectorContexts.set(selectorKey, currentProperties);
        }
        for (const node of rule.nodes || []) {
            if (node.type !== 'decl') continue;
            mapIncrement(properties, node.prop);
            if (node.important) increment(stats, 'important-declarations');
            const complexVisual = /^(?:background(?:-image)?|mask(?:-image)?|-webkit-mask-image|filter|backdrop-filter|box-shadow|text-shadow|clip-path)$/i.test(node.prop)
                || /(?:gradient|url|image-set)\(/i.test(node.value);
            if (complexVisual) increment(stats, 'complex-visual-declarations');
            else increment(stats, 'ordinary-declarations');
            if (/\b(?:var|calc|clamp|min|max)\(/i.test(node.value)) increment(stats, 'computed-value-declarations');
            let parent = rule.parent;
            while (parent && parent.type !== 'root') {
                if (parent.type === 'atrule' && parent.name === 'media') increment(stats, 'media-declarations');
                if (parent.type === 'atrule' && parent.name === 'supports') increment(stats, 'supports-declarations');
                parent = parent.parent;
            }
        }
    });

    for (const [key, value] of Object.entries(stats)) {
        if (typeof value === 'number' && !['bytes', 'lines'].includes(key)) increment(totals, key, value);
    }
    byFile.push(stats);
}

const sortMap = map => [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const output = {
    files: byFile,
    totals,
    media: sortMap(media),
    supports: sortMap(supports),
    properties: sortMap(properties).slice(0, 80)
};

if (projectRoot && corePath) {
    const extractor = require(path.resolve(__dirname, '../dist/cli/jquan-extract.cjs'));
    const inputFiles = [];
    const walk = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (entry.name === '_jquan_changes' || entry.name === 'node_modules' || entry.name === 'assets') continue;
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) walk(fullPath);
            else if (/\.(?:html?|js)$/i.test(entry.name) && !/(?:jquanui-core|swiper-bundle)/i.test(entry.name)) inputFiles.push(fullPath);
        }
    };
    walk(projectRoot);

    const configContext = { window: {} };
    vm.createContext(configContext);
    vm.runInContext(fs.readFileSync(path.join(projectRoot, 'js/jquan.config.js'), 'utf8'), configContext);
    const result = extractor.extractFromFiles(inputFiles, {
        core: corePath,
        config: configContext.window.JQUAN_CONFIG || {},
        root: projectRoot
    });
    const unresolvedExact = result.classes.filter(className => !result.runtime.api.resolve(className));
    output.atomicUsage = {
        scannedFiles: result.files.length,
        classTokens: result.classes.length,
        resolvedClassTokens: result.classes.length - unresolvedExact.length,
        unresolvedClassTokens: unresolvedExact.length,
        generatedRules: result.report.generatedRuleCount,
        unresolvedExamples: unresolvedExact.slice(0, 120)
    };
}

console.log(JSON.stringify(output, null, 2));
