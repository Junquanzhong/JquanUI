#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_EXTENSIONS = new Set(['.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro']);
const DEFAULT_CONFIG_FILES = ['jquan.config.cjs', 'jquan.config.js', 'jquan.config.json'];

function printHelp() {
    console.log(`JquanUI static CSS extractor

Usage:
  node dist/cli/jquan-extract.cjs --init
  node dist/cli/jquan-extract.cjs --doctor
  node dist/cli/jquan-extract.cjs --input ./index.html --output ./dist/jquan.css
  node dist/cli/jquan-extract.cjs --input ./src --output ./dist/jquan.css --minify
  node dist/cli/jquan-extract.cjs --input ./src --output ./dist/jquan.css --config ./jquan.config.cjs
  node dist/cli/jquan-extract.cjs --render-html ./pages --html-output ./dist --templates ./templates --data ./site.json
  node dist/cli/jquan-extract.cjs --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --templates ./templates

Options:
  --input, -i     File or directory to scan. Can be repeated.
  --output, -o    CSS file to write.
  --baseline-output  Write the reusable baseline CSS (preflight, theme variables, keyframes).
  --utilities-output Write the discovered utility CSS separately.
  --core          Runtime core file to reuse. Defaults to ../core/JquanUI@Core.js.
  --config, -c    JquanUI config file (.json, .js, or .cjs).
  --report        Write a JSON extraction report.
  --doctor        Check config, content inputs, extraction health, and package wiring.
  --json          Print --doctor output as JSON.
  --fail-on-warn  Exit with code 1 when unresolved classes or failed rules are found.
  --init          Create a starter jquan.config.cjs.
  --force         Overwrite an existing file when used with --init.
  --minify        Minify generated CSS.
  --render-html   HTML file or directory to render. Can be repeated.
  --html-output   Output HTML file or directory.
  --templates     Root directory used to resolve include/layout files.
  --data          JSON data file passed to every rendered page.
  --safe          Use the Template safe preset (expressions, HTML, URLs, filters).
  --bundle-templates       Template file or directory to prebundle. Can be repeated.
  --template-bundle-output JavaScript template bundle to write.
  --template-bundle-report JSON dependency report to write.
  --help, -h      Show this help.
`);
}

function parseArgs(argv) {
    const args = { inputs: [], output: null, baselineOutput: null, utilitiesOutput: null, core: path.resolve(__dirname, '../core/JquanUI@Core.js'), configFile: null, report: null, failOnWarn: false, init: false, force: false, minify: false, doctor: false, json: false, templateInputs: [], htmlOutput: null, templates: null, dataFile: null, safe: false, templateBundleInputs: [], templateBundleOutput: null, templateBundleReport: null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') args.help = true;
        else if (arg === '--minify') args.minify = true;
        else if (arg === '--doctor') args.doctor = true;
        else if (arg === '--json') args.json = true;
        else if (arg === '--input' || arg === '-i') args.inputs.push(argv[++i]);
        else if (arg.startsWith('--input=')) args.inputs.push(arg.slice('--input='.length));
        else if (arg === '--output' || arg === '-o') args.output = argv[++i];
        else if (arg.startsWith('--output=')) args.output = arg.slice('--output='.length);
        else if (arg === '--baseline-output') args.baselineOutput = argv[++i];
        else if (arg.startsWith('--baseline-output=')) args.baselineOutput = arg.slice('--baseline-output='.length);
        else if (arg === '--utilities-output') args.utilitiesOutput = argv[++i];
        else if (arg.startsWith('--utilities-output=')) args.utilitiesOutput = arg.slice('--utilities-output='.length);
        else if (arg === '--core') args.core = path.resolve(argv[++i]);
        else if (arg.startsWith('--core=')) args.core = path.resolve(arg.slice('--core='.length));
        else if (arg === '--config' || arg === '-c') args.configFile = argv[++i];
        else if (arg.startsWith('--config=')) args.configFile = arg.slice('--config='.length);
        else if (arg === '--report') args.report = argv[++i];
        else if (arg.startsWith('--report=')) args.report = arg.slice('--report='.length);
        else if (arg === '--fail-on-warn') args.failOnWarn = true;
        else if (arg === '--init') args.init = true;
        else if (arg === '--force') args.force = true;
        else if (arg === '--render-html') args.templateInputs.push(argv[++i]);
        else if (arg.startsWith('--render-html=')) args.templateInputs.push(arg.slice('--render-html='.length));
        else if (arg === '--html-output') args.htmlOutput = argv[++i];
        else if (arg.startsWith('--html-output=')) args.htmlOutput = arg.slice('--html-output='.length);
        else if (arg === '--templates') args.templates = argv[++i];
        else if (arg.startsWith('--templates=')) args.templates = arg.slice('--templates='.length);
        else if (arg === '--data') args.dataFile = argv[++i];
        else if (arg.startsWith('--data=')) args.dataFile = arg.slice('--data='.length);
        else if (arg === '--safe') args.safe = true;
        else if (arg === '--bundle-templates') args.templateBundleInputs.push(argv[++i]);
        else if (arg.startsWith('--bundle-templates=')) args.templateBundleInputs.push(arg.slice('--bundle-templates='.length));
        else if (arg === '--template-bundle-output') args.templateBundleOutput = argv[++i];
        else if (arg.startsWith('--template-bundle-output=')) args.templateBundleOutput = arg.slice('--template-bundle-output='.length);
        else if (arg === '--template-bundle-report') args.templateBundleReport = argv[++i];
        else if (arg.startsWith('--template-bundle-report=')) args.templateBundleReport = arg.slice('--template-bundle-report='.length);
        else args.inputs.push(arg);
    }
    return args;
}

function createConfigTemplate() {
    return `'use strict';

module.exports = {
  content: [
    'index.html',
    'src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}',
    '!src/legacy/**'
  ],
  safelist: [
    // 'opacity-0',
    // { class: 'bg-brand-500', variants: ['hover', 'dark'] }
  ],
  blocklist: [
    // /^debug-/,
    // 'legacy-only'
  ],
  shortcuts: {
    'btn-primary': 'inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500'
  },
  theme: {
    extend: {
      colors: {
        brand: { 500: '#3366ff' }
      }
    }
  }
};
`;
}

function initConfigFile(options = {}) {
    const target = path.resolve(options.root || process.cwd(), options.configFile || 'jquan.config.cjs');
    if (fs.existsSync(target) && !options.force) {
        throw new Error(`Config file already exists: ${target}. Use --force to overwrite.`);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, createConfigTemplate(), 'utf8');
    return target;
}

function stripBom(value) {
    return typeof value === 'string' && value.charCodeAt(0) === 0xFEFF ? value.slice(1) : value;
}

function readJsonFile(file, options = {}) {
    const resolved = path.resolve(options.root || process.cwd(), file);
    if (!fs.existsSync(resolved)) throw new Error(`JSON data file not found: ${file}`);
    const value = JSON.parse(stripBom(fs.readFileSync(resolved, 'utf8')));
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`JSON data file must contain an object: ${file}`);
    }
    return value;
}

function loadConfigFile(configFile, options = {}) {
    const resolved = path.resolve(options.root || process.cwd(), configFile);
    if (!fs.existsSync(resolved)) throw new Error(`Config file not found: ${configFile}`);
    const ext = path.extname(resolved).toLowerCase();
    let config;

    if (ext === '.json') {
        config = JSON.parse(stripBom(fs.readFileSync(resolved, 'utf8')));
    } else if (ext === '.js' || ext === '.cjs') {
        delete require.cache[require.resolve(resolved)];
        config = require(resolved);
        if (config && config.__esModule && config.default) config = config.default;
    } else {
        throw new Error(`Unsupported config file extension: ${ext || '(none)'}`);
    }

    if (typeof config === 'function') {
        config = config({ root: options.root || process.cwd(), configFile: resolved });
    }
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
        throw new Error(`Config file must export an object: ${configFile}`);
    }
    return config;
}

function findConfigFile(root = process.cwd()) {
    const base = path.resolve(root || process.cwd());
    for (const name of DEFAULT_CONFIG_FILES) {
        const candidate = path.join(base, name);
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

function resolveConfigFile(options = {}) {
    if (options.config || options.configFile === false) return null;
    if (options.configFile) return path.resolve(options.root || process.cwd(), options.configFile);
    return findConfigFile(options.root || process.cwd());
}

function resolveConfig(options = {}) {
    if (options.config && typeof options.config === 'object' && !Array.isArray(options.config)) return options.config;
    const configFile = resolveConfigFile(options);
    if (configFile) return loadConfigFile(configFile, options);
    return {};
}

function normalizeContentEntries(content) {
    if (!content) return [];
    if (typeof content === 'string') return [content];
    if (Array.isArray(content)) return content.flatMap(item => normalizeContentEntries(item));
    if (content && typeof content === 'object') {
        if (content.files) return normalizeContentEntries(content.files);
        if (content.paths) return normalizeContentEntries(content.paths);
    }
    return [];
}

function normalizeSlash(value) {
    return String(value || '').replace(/\\/g, '/');
}

function hasGlobSyntax(value) {
    return /[*?{}[\]]/.test(String(value || ''));
}

function escapeRegExp(value) {
    return String(value).replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function expandBraces(pattern) {
    const match = String(pattern).match(/\{([^{}]+)\}/);
    if (!match) return [pattern];
    const before = pattern.slice(0, match.index);
    const after = pattern.slice(match.index + match[0].length);
    return match[1].split(',').flatMap(part => expandBraces(`${before}${part.trim()}${after}`));
}

function globToRegExp(pattern) {
    const normalized = normalizeSlash(pattern);
    let source = '^';
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        const next = normalized[i + 1];
        if (char === '*') {
            if (next === '*') {
                const after = normalized[i + 2];
                if (after === '/') {
                    source += '(?:.*/)?';
                    i += 2;
                } else {
                    source += '.*';
                    i += 1;
                }
            } else {
                source += '[^/]*';
            }
        } else if (char === '?') {
            source += '[^/]';
        } else {
            source += escapeRegExp(char);
        }
    }
    source += '$';
    return new RegExp(source);
}

function createGlobMatcher(pattern) {
    const patterns = expandBraces(pattern).map(item => globToRegExp(item));
    return value => {
        const normalized = normalizeSlash(value);
        return patterns.some(patternRe => patternRe.test(normalized));
    };
}

function collectAllSourceFiles(root, files = []) {
    const resolved = path.resolve(root || process.cwd());
    if (!fs.existsSync(resolved)) return files;
    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
        if (DEFAULT_EXTENSIONS.has(path.extname(resolved).toLowerCase())) files.push(resolved);
        return files;
    }
    if (!stat.isDirectory()) return files;
    for (const item of fs.readdirSync(resolved, { withFileTypes: true })) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        const child = path.join(resolved, item.name);
        if (item.isDirectory()) collectAllSourceFiles(child, files);
        else if (DEFAULT_EXTENSIONS.has(path.extname(item.name).toLowerCase())) files.push(child);
    }
    return files;
}

function resolveGlobFiles(entries, options = {}) {
    const root = path.resolve(options.root || process.cwd());
    const includeMatchers = [];
    const excludeMatchers = [];
    const directInputs = [];

    for (const raw of normalizeContentEntries(entries)) {
        if (typeof raw !== 'string' || !raw.trim()) continue;
        const negated = raw.startsWith('!');
        const value = negated ? raw.slice(1) : raw;
        if (hasGlobSyntax(value)) {
            const absolutePattern = normalizeSlash(path.resolve(root, value));
            (negated ? excludeMatchers : includeMatchers).push(createGlobMatcher(absolutePattern));
        } else if (negated) {
            const absolute = normalizeSlash(path.resolve(root, value));
            excludeMatchers.push(candidate => normalizeSlash(candidate).startsWith(absolute));
        } else {
            directInputs.push(value);
        }
    }

    const files = new Set();
    for (const input of directInputs) {
        for (const file of walkInput(path.resolve(root, input))) files.add(file);
    }
    if (includeMatchers.length > 0) {
        for (const file of collectAllSourceFiles(root)) {
            const normalized = normalizeSlash(file);
            if (includeMatchers.some(match => match(normalized))) files.add(file);
        }
    }
    for (const file of Array.from(files)) {
        if (excludeMatchers.some(match => match(file))) files.delete(file);
    }
    return Array.from(files);
}

function normalizeSafelistEntries(safelist, expandSyntax = null) {
    const classes = [];
    const add = value => {
        if (typeof value !== 'string') return;
        for (const token of splitTokens(value, expandSyntax)) classes.push(token);
    };
    const visit = item => {
        if (!item) return;
        if (typeof item === 'string') add(item);
        else if (Array.isArray(item)) item.forEach(visit);
        else if (item && typeof item === 'object') {
            const base = item.class || item.classes || item.raw || item.value;
            if (base) add(base);
            if (base && Array.isArray(item.variants)) {
                for (const token of splitTokens(base, expandSyntax)) {
                    for (const variant of item.variants) {
                        if (typeof variant === 'string' && variant) classes.push(`${variant}:${token}`);
                    }
                }
            }
        }
    };
    visit(safelist);
    return classes;
}

function createBlocklistMatcher(blocklist) {
    const entries = [];
    const visit = item => {
        if (!item) return;
        if (Array.isArray(item)) item.forEach(visit);
        else if (typeof item === 'string' || item instanceof RegExp) entries.push(item);
        else if (item && typeof item === 'object') {
            if (item.pattern instanceof RegExp) entries.push(item.pattern);
            else if (typeof item.pattern === 'string') entries.push(new RegExp(item.pattern));
            else if (typeof item.class === 'string') entries.push(item.class);
        }
    };
    visit(blocklist);
    return token => entries.some(entry => entry instanceof RegExp ? entry.test(token) : entry === token);
}

function walkInput(target, files = []) {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) throw new Error(`Input not found: ${target}`);
    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
        if (DEFAULT_EXTENSIONS.has(path.extname(resolved).toLowerCase())) files.push(resolved);
        return files;
    }
    if (!stat.isDirectory()) return files;
    for (const item of fs.readdirSync(resolved, { withFileTypes: true })) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        const child = path.join(resolved, item.name);
        if (item.isDirectory()) walkInput(child, files);
        else if (DEFAULT_EXTENSIONS.has(path.extname(item.name).toLowerCase())) files.push(child);
    }
    return files;
}

function splitTokens(value, expandSyntax = null) {
    const expanded = typeof expandSyntax === 'function' ? expandSyntax(value) : value;
    return expanded.split(/\s+/).map(token => token.trim()).filter(Boolean);
}

function decodeHtmlEntities(value) {
    return value
        .replace(/&quot;/g, '"')
        .replace(/&#34;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function readBalancedBlock(source, openIndex, openChar, closeChar) {
    let depth = 0;
    let quote = '';
    let escaped = false;
    for (let i = openIndex; i < source.length; i++) {
        const char = source[i];
        if (quote) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === quote) quote = '';
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            continue;
        }
        if (char === openChar) depth++;
        else if (char === closeChar) {
            depth--;
            if (depth === 0) return source.slice(openIndex + 1, i);
        }
    }
    return '';
}

function extractStringLiterals(source) {
    const values = [];
    const pattern = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    let match;
    while ((match = pattern.exec(source))) {
        const quote = match[1];
        const value = match[2];
        if (quote === '`' && /\$\{/.test(value)) {
            values.push(value.replace(/\$\{[\s\S]*?\}/g, ' ').replace(/\\`/g, '`'));
        } else {
            values.push(value.replace(/\\(["'`\\])/g, '$1'));
        }
    }
    return values;
}

function extractUtilityFunctionStrings(source) {
    const classStrings = [];
    const callPattern = /\b(?:clsx|classnames|classNames|cn|cva|twMerge)\s*\(/g;
    let match;
    while ((match = callPattern.exec(source))) {
        const openIndex = match.index + match[0].length - 1;
        for (const value of extractStringLiterals(readBalancedBlock(source, openIndex, '(', ')'))) {
            classStrings.push(value);
        }
    }
    return classStrings;
}

function extractClassBindingStrings(source) {
    const classStrings = [];
    const bindingPattern = /(?:\bv-bind:class|:class|\bclass:class|\bclassName|\bclass)\s*=\s*\{?\s*([\[{])/g;
    let match;
    while ((match = bindingPattern.exec(source))) {
        const openChar = match[1];
        const closeChar = openChar === '[' ? ']' : '}';
        for (const value of extractStringLiterals(readBalancedBlock(source, match.index + match[0].lastIndexOf(openChar), openChar, closeChar))) {
            classStrings.push(value);
        }
    }
    return classStrings;
}

function extractClassStrings(source) {
    const classStrings = [];
    const patterns = [
        /\bclass(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g,
        /\bclass(?:Name)?\s*:\s*["'`]([^"'`]+)["'`]/g,
        /\b(?:class|className)\s*=\s*\{["'`]([^"'`]+)["'`]\}/g
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(source))) classStrings.push(decodeHtmlEntities(match[1]));
    }
    const dynamicBindingPattern = /(?:\bv-bind:class|:class)\s*=\s*(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
    let dynamicMatch;
    while ((dynamicMatch = dynamicBindingPattern.exec(source))) {
        classStrings.push(...extractStringLiterals(decodeHtmlEntities(dynamicMatch[2])));
    }
    const svelteDirectivePattern = /\bclass:([A-Za-z0-9_:/.[\]-]+)(?=[\s=>])/g;
    let svelteMatch;
    while ((svelteMatch = svelteDirectivePattern.exec(source))) classStrings.push(svelteMatch[1]);
    classStrings.push(...extractUtilityFunctionStrings(source));
    classStrings.push(...extractClassBindingStrings(source));
    return classStrings;
}

function createRuntime(coreFile, options = {}) {
    const insertedRules = [];
    const styleElements = [];
    const config = resolveConfig(options);

    function makeStyleElement() {
        const element = {
            id: '',
            _textContent: '',
            sheet: {
                cssRules: [],
                insertRule(rule, index = this.cssRules.length) {
                    const position = Math.max(0, Math.min(Number(index) || 0, this.cssRules.length));
                    this.cssRules.splice(position, 0, rule);
                    insertedRules.splice(Math.min(position, insertedRules.length), 0, rule);
                }
            },
            set textContent(value) {
                this._textContent = value || '';
                this.sheet.cssRules = [];
            },
            get textContent() {
                return this._textContent;
            }
        };
        styleElements.push(element);
        return element;
    }

    const root = {
        nodeType: 1,
        classList: [],
        getAttribute: () => '',
        setAttribute: () => {},
        querySelectorAll: () => []
    };

    const context = {
        window: {},
        JQUAN_CONFIG: config,
        document: {
            readyState: 'complete',
            documentElement: root,
            head: { appendChild: () => {} },
            createElement: makeStyleElement,
            querySelector: () => null,
            currentScript: null,
            addEventListener: () => {}
        },
        console: {
            log: () => {},
            warn: (...args) => console.warn(...args),
            error: (...args) => console.error(...args)
        },
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        setTimeout: cb => { cb(); return 1; },
        clearTimeout: () => {},
        requestAnimationFrame: cb => { cb(); return 1; },
        cancelAnimationFrame: () => {},
        MutationObserver: function MutationObserver() {
            this.observe = () => {};
            this.disconnect = () => {};
        }
    };

    context.window = context;
    context.window.JQUAN_CONFIG = config;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(coreFile, 'utf8'), context, { filename: coreFile });

    return {
        api: context.window.JquanUI,
        insertedRules,
        getBaseCss() {
            return styleElements.map(el => el.textContent).filter(Boolean).join('\n');
        }
    };
}

function minifyCss(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>])\s*/g, '$1')
        .trim();
}

function collectClassesFromSource(source, expandSyntax = null) {
    const classes = new Set();
    for (const classString of extractClassStrings(source)) {
        for (const token of splitTokens(classString, expandSyntax)) classes.add(token);
    }
    return classes;
}

function buildExtractionReport(result, options = {}) {
    const debug = result && result.runtime && result.runtime.api && typeof result.runtime.api.debug === 'function'
        ? result.runtime.api.debug()
        : {};
    const unresolvedClasses = Array.isArray(debug.unresolvedClasses) ? debug.unresolvedClasses : [];
    const failedRules = Array.isArray(debug.failedRules) ? debug.failedRules : [];
    const conflicts = Array.isArray(debug.conflicts) ? debug.conflicts : [];
    const configWarnings = Array.isArray(debug.configWarnings) ? debug.configWarnings : [];
    return {
        generatedAt: new Date().toISOString(),
        core: options.core || null,
        files: result.files || [],
        classCount: result.classes ? result.classes.length : 0,
        ruleCount: result.ruleCount || 0,
        cssBytes: Buffer.byteLength(result.css || '', 'utf8'),
        baselineCssBytes: Buffer.byteLength(result.baselineCss || '', 'utf8'),
        utilityCssBytes: Buffer.byteLength(result.utilityCss || '', 'utf8'),
        warnings: unresolvedClasses.length + failedRules.length + configWarnings.length,
        unresolvedClassCount: unresolvedClasses.length,
        failedRuleCount: failedRules.length,
        conflictCount: conflicts.length,
        unresolvedClasses,
        failedRules,
        conflicts,
        configWarnings
    };
}

function readCoreVersion(coreFile) {
    if (!fs.existsSync(coreFile)) return null;
    const match = fs.readFileSync(coreFile, 'utf8').match(/const\s+ENGINE_VERSION\s*=\s*['"]([^'"]+)['"]/);
    return match ? match[1] : null;
}

function diagnoseProject(options = {}) {
    const root = path.resolve(options.root || process.cwd());
    const core = path.resolve(options.core || path.resolve(__dirname, '../core/JquanUI@Core.js'));
    const startedAt = new Date().toISOString();
    const result = {
        ok: true,
        generatedAt: startedAt,
        root,
        core,
        coreVersion: readCoreVersion(core),
        configFile: null,
        configLoaded: false,
        contentEntries: [],
        inputCount: 0,
        files: [],
        classCount: 0,
        ruleCount: 0,
        cssBytes: 0,
        warningCount: 0,
        unresolvedClassCount: 0,
        failedRuleCount: 0,
        conflictCount: 0,
        warnings: [],
        recommendations: []
    };

    try {
        result.configFile = resolveConfigFile(options);
        const config = resolveConfig(options);
        result.configLoaded = !!(result.configFile || options.config);
        result.contentEntries = normalizeContentEntries(config.content);
        const scanInputs = (Array.isArray(options.inputs) ? options.inputs : [options.inputs]).filter(Boolean);
        const inputs = scanInputs.length > 0 ? scanInputs : result.contentEntries;
        result.inputCount = inputs.length;

        if (!fs.existsSync(core)) {
            result.ok = false;
            result.warnings.push(`Core file not found: ${core}`);
        }
        if (!result.configLoaded) {
            result.recommendations.push('Create jquan.config.cjs with `jquan-extract --init` for repeatable extraction.');
        }
        if (inputs.length === 0) {
            result.ok = false;
            result.warnings.push('No content inputs found. Add --input or config.content.');
            return result;
        }

        const extraction = extractFromFiles(inputs, Object.assign({}, options, { root, core, config, header: false }));
        result.files = extraction.files || [];
        result.classCount = extraction.classes.length;
        result.ruleCount = extraction.ruleCount;
        result.cssBytes = Buffer.byteLength(extraction.css || '', 'utf8');
        result.unresolvedClassCount = extraction.report.unresolvedClassCount;
        result.failedRuleCount = extraction.report.failedRuleCount;
        result.conflictCount = extraction.report.conflictCount;
        result.warningCount = extraction.report.warnings + extraction.report.conflictCount;
        if (result.files.length === 0) result.warnings.push('Content inputs resolved to zero files.');
        if (result.classCount === 0) result.warnings.push('No class tokens were discovered.');
        if (result.unresolvedClassCount > 0) result.warnings.push(`${result.unresolvedClassCount} unresolved class token(s).`);
        if (result.failedRuleCount > 0) result.warnings.push(`${result.failedRuleCount} failed CSS rule insertion(s).`);
        for (const warning of extraction.report.configWarnings) result.warnings.push(`${warning.path}: ${warning.message}`);
        if (result.conflictCount > 0) result.recommendations.push(`${result.conflictCount} likely class conflict(s) detected; inspect the extraction report.`);
        result.ok = result.warnings.length === 0;
    } catch (error) {
        result.ok = false;
        result.warnings.push(error.message);
    }

    return result;
}

function formatDoctorReport(report) {
    const lines = [
        `JquanUI doctor ${report.ok ? 'ok' : 'found issues'}`,
        `Root: ${report.root}`,
        `Core: ${report.coreVersion || 'unknown'} (${report.core})`,
        `Config: ${report.configFile || '(none)'}`,
        `Content entries: ${report.contentEntries.length}`,
        `Files: ${report.files.length}`,
        `Classes: ${report.classCount}`,
        `Rules: ${report.ruleCount}`,
        `CSS bytes: ${report.cssBytes}`,
        `Warnings: ${report.warnings.length}`
    ];
    for (const warning of report.warnings) lines.push(`- ${warning}`);
    for (const recommendation of report.recommendations) lines.push(`> ${recommendation}`);
    return lines.join('\n');
}

function renderCssFromClasses(classNames, options = {}) {
    const core = path.resolve(options.core || path.resolve(__dirname, '../core/JquanUI@Core.js'));
    if (!fs.existsSync(core)) throw new Error(`Core file not found: ${core}`);
    const runtime = options.runtime || createRuntime(core, options);
    const classes = Array.from(new Set(Array.isArray(classNames) ? classNames : Array.from(classNames || [])));
    runtime.api.compile(Array.from(classes));

    const header = options.header === false ? '' : (options.header || `/* JquanUI static CSS generated from ${classes.length} class token(s). */`);
    const rawBaselineCss = runtime.getBaseCss();
    const rawUtilityCss = runtime.insertedRules.join('\n');
    const baselineCss = options.minify ? minifyCss(rawBaselineCss) : rawBaselineCss;
    const utilityCss = options.minify ? minifyCss(rawUtilityCss) : rawUtilityCss;
    let css = [header, baselineCss, utilityCss].filter(Boolean).join('\n');
    if (options.minify) css = minifyCss(css);
    return {
        css,
        baselineCss,
        utilityCss,
        classes,
        report: buildExtractionReport({ css, classes, runtime, ruleCount: runtime.insertedRules.length }, { core }),
        runtime,
        ruleCount: runtime.insertedRules.length
    };
}

function extractFromSource(source, options = {}) {
    const core = path.resolve(options.core || path.resolve(__dirname, '../core/JquanUI@Core.js'));
    const config = options.config && typeof options.config === 'object' ? options.config : resolveConfig(options);
    const runtime = options.runtime || createRuntime(core, Object.assign({}, options, { config }));
    const classes = collectClassesFromSource(source, runtime.api.expandSyntax);
    for (const token of normalizeSafelistEntries(config.safelist, runtime.api.expandSyntax)) classes.add(token);
    const shouldBlock = createBlocklistMatcher(config.blocklist);
    const filtered = Array.from(classes).filter(token => !shouldBlock(token));
    return renderCssFromClasses(filtered, Object.assign({}, options, { runtime, core, config }));
}

function extractFromFiles(inputs, options = {}) {
    const core = path.resolve(options.core || path.resolve(__dirname, '../core/JquanUI@Core.js'));
    const config = options.config && typeof options.config === 'object' ? options.config : resolveConfig(options);
    const runtime = options.runtime || createRuntime(core, Object.assign({}, options, { config }));
    const inputList = (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean);
    const scanInputs = inputList.length > 0 ? inputList : normalizeContentEntries(config.content);
    if (scanInputs.length === 0) throw new Error('No input files provided. Use --input or config.content.');
    const files = Array.from(new Set(resolveGlobFiles(scanInputs, { root: options.root || process.cwd() })));
    const classes = new Set();

    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        for (const token of collectClassesFromSource(source, runtime.api.expandSyntax)) classes.add(token);
    }
    for (const token of normalizeSafelistEntries(config.safelist, runtime.api.expandSyntax)) classes.add(token);
    const shouldBlock = createBlocklistMatcher(config.blocklist);
    const filteredClasses = Array.from(classes).filter(token => !shouldBlock(token));

    const result = renderCssFromClasses(filteredClasses, Object.assign({}, options, {
        runtime,
        core,
        config,
        header: options.header === undefined ? `/* JquanUI static CSS generated from ${files.length} file(s), ${filteredClasses.length} class token(s). */` : options.header
    }));
    result.files = files;
    result.report = buildExtractionReport(result, { core });
    return result;
}

function renderCriticalCss(html, options = {}) {
    return extractFromSource(html, Object.assign({ header: false }, options));
}

function escapeHtmlAttribute(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function normalizeStyleAttributes(options = {}) {
    const attributes = Object.assign({}, options.attributes || {});
    if (options.attribute !== false) {
        const defaultAttribute = options.attribute || 'data-jquanui-critical';
        if (typeof defaultAttribute === 'string' && defaultAttribute) attributes[defaultAttribute] = attributes[defaultAttribute] === undefined ? '' : attributes[defaultAttribute];
    }
    if (options.id) attributes.id = options.id;
    if (options.nonce) attributes.nonce = options.nonce;
    return attributes;
}

function renderStyleAttributes(attributes) {
    return Object.entries(attributes)
        .filter(([name, value]) => /^[A-Za-z_:][A-Za-z0-9_:.-]*$/.test(name) && value !== false && value != null)
        .map(([name, value]) => value === true || value === '' ? name : `${name}="${escapeHtmlAttribute(value)}"`)
        .join(' ');
}

function createCriticalStyleTag(css, options = {}) {
    const attrs = renderStyleAttributes(normalizeStyleAttributes(options));
    return `<style${attrs ? ` ${attrs}` : ''}>${css || ''}</style>`;
}

function injectCriticalCss(html, options = {}) {
    const result = renderCriticalCss(html, options);
    const attributes = normalizeStyleAttributes(options);
    const markerPattern = Object.prototype.hasOwnProperty.call(attributes, 'id')
        ? `\\bid\\s*=\\s*(?:"${escapeRegExp(attributes.id)}"|'${escapeRegExp(attributes.id)}'|${escapeRegExp(attributes.id)})(?=\\s|>|/)`
        : `\\b${escapeRegExp(Object.keys(attributes).find(name => name.startsWith('data-')) || 'data-jquanui-critical')}\\b`;
    const styleTag = createCriticalStyleTag(result.css, options);
    let output = html;
    if (options.replaceExisting !== false) {
        output = output.replace(new RegExp(`<style\\b[^>]*${markerPattern}[^>]*>[\\s\\S]*?<\\/style>`, 'i'), '');
    }
    if (/<\/head>/i.test(output)) {
        output = output.replace(/<\/head>/i, `${styleTag}</head>`);
    } else {
        output = `${styleTag}${output}`;
    }
    return Object.assign({}, result, { html: output, styleTag, attributes });
}

function createNodeTemplateRuntime(options = {}) {
    const component = path.resolve(options.component || path.resolve(__dirname, '../components/template.js'));
    const templateRoot = path.resolve(options.root || process.cwd(), options.templates || options.templateRoot || '.');
    if (!fs.existsSync(component)) throw new Error(`Template component not found: ${component}`);
    if (!fs.existsSync(templateRoot) || !fs.statSync(templateRoot).isDirectory()) {
        throw new Error(`Template root directory not found: ${templateRoot}`);
    }

    class HTMLElement {}
    const context = {
        window: {},
        console,
        HTMLElement,
        Intl,
        Date,
        Promise,
        setTimeout,
        clearTimeout,
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {},
        document: {
            querySelector() { return null; },
            getElementById() { return null; }
        }
    };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(component, 'utf8'), context, { filename: component });

    const api = context.JquanUIComponents && context.JquanUIComponents.templateApi;
    if (!api || typeof api.renderAsync !== 'function') {
        throw new Error(`Template API is unavailable in component: ${component}`);
    }
    api.useLoader({
        name: 'JQNodeFileLoader',
        base: '',
        extensions: options.extensions || ['.html', '.htm'],
        cache: options.cache === false ? false : { maxEntries: options.cacheLimit || 256 },
        async load(name) {
            const target = path.resolve(templateRoot, name);
            const relative = path.relative(templateRoot, target);
            if (relative.startsWith('..') || path.isAbsolute(relative)) {
                throw new Error(`Template path escapes the configured root: ${name}`);
            }
            if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
                throw new Error(`Template file not found: ${target}`);
            }
            return stripBom(fs.readFileSync(target, 'utf8'));
        }
    });
    return { api, component, templateRoot };
}

function enrichTemplateBuildError(error, entry) {
    const nextError = error instanceof Error ? error : new Error(String(error));
    nextError.entryFile = entry;
    if (!nextError.templateName) nextError.templateName = entry;
    if (!nextError.buildEntryAdded) {
        nextError.message = `${nextError.message}\nentry: ${entry}`;
        nextError.buildEntryAdded = true;
    }
    return nextError;
}

async function renderTemplateFile(entry, options = {}) {
    const root = path.resolve(options.root || process.cwd());
    const input = path.resolve(root, entry);
    if (!fs.existsSync(input) || !fs.statSync(input).isFile()) throw new Error(`HTML entry file not found: ${input}`);
    if (!/\.html?$/i.test(input)) throw new Error(`HTML entry must use .html or .htm: ${input}`);
    const runtime = options.runtime || createNodeTemplateRuntime(options);
    const data = options.data && typeof options.data === 'object' && !Array.isArray(options.data) ? options.data : {};
    const source = stripBom(fs.readFileSync(input, 'utf8'));
    try {
        const html = await runtime.api.renderAsync(source, data, {
            cache: options.cache !== false,
            cacheLimit: options.cacheLimit,
            safeExpressions: options.safeExpressions === true,
            sanitize: options.sanitize === true,
            templates: options.registeredTemplates,
            filters: options.filters
            ,safe: options.safe === true
        });
        return { html, entry: input, runtime };
    } catch (error) {
        throw enrichTemplateBuildError(error, input);
    }
}

function resolveTemplateEntries(inputs, options = {}) {
    const root = path.resolve(options.root || process.cwd());
    const entries = Array.isArray(inputs) ? inputs : [inputs];
    const files = [];
    for (const entry of entries.filter(Boolean)) {
        const resolved = path.resolve(root, entry);
        if (hasGlobSyntax(entry)) {
            files.push(...resolveGlobFiles(entry, { root }));
        } else if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
            files.push(...walkInput(resolved));
        } else if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            files.push(resolved);
        } else {
            throw new Error(`HTML input not found: ${entry}`);
        }
    }
    return Array.from(new Set(files.map(file => path.resolve(file)).filter(file => /\.html?$/i.test(file)))).sort();
}

function templateEntryBase(file, inputs, root) {
    const candidates = (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean).map(entry => {
        if (hasGlobSyntax(entry)) return root;
        const resolved = path.resolve(root, entry);
        return fs.existsSync(resolved) && fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved);
    }).filter(base => {
        const relative = path.relative(base, file);
        return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    });
    return candidates.sort((a, b) => b.length - a.length)[0] || root;
}

function createTemplateBundle(inputs, options = {}) {
    const root = path.resolve(options.root || process.cwd());
    const templateRoot = path.resolve(root, options.templates || options.templateRoot || '.');
    const files = resolveTemplateEntries(inputs, { root });
    if (files.length === 0) throw new Error('No template files were found to bundle.');
    const templates = Object.create(null);
    const entries = [];

    for (const file of files) {
        const relative = path.relative(templateRoot, file);
        if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new Error(`Template file is outside the configured template root: ${file}`);
        }
        const name = relative.replace(/\\/g, '/');
        if (Object.prototype.hasOwnProperty.call(templates, name)) throw new Error(`Duplicate template bundle name: ${name}`);
        templates[name] = stripBom(fs.readFileSync(file, 'utf8'));
        entries.push({
            name,
            file,
            bytes: Buffer.byteLength(templates[name], 'utf8')
        });
    }

    const availableNames = new Set(Object.keys(templates));
    const resolveDependencyName = value => {
        const name = String(value || '').trim().replace(/^['"]|['"]$/g, '').replace(/\\/g, '/');
        if (availableNames.has(name)) return name;
        if (!/[.][a-z0-9]+$/i.test(name) && availableNames.has(`${name}.html`)) return `${name}.html`;
        if (!/[.][a-z0-9]+$/i.test(name) && availableNames.has(`${name}.htm`)) return `${name}.htm`;
        return name;
    };
    entries.forEach(entry => {
        const source = templates[entry.name];
        const dependencies = [];
        const dynamicDependencies = [];
        const staticPattern = /{%\s*(?:include|layout)\s+(['"])(.*?)\1[^%]*%}/gi;
        let match;
        while ((match = staticPattern.exec(source))) dependencies.push(resolveDependencyName(match[2]));
        const dynamicPattern = /{%\s*(?:include|layout)\s+([^%]+?)%}/gi;
        while ((match = dynamicPattern.exec(source))) {
            const expression = match[1].trim();
            if (!/^(['"]).*\1(?:\s|$)/.test(expression)) dynamicDependencies.push(expression);
        }
        entry.dependencies = Array.from(new Set(dependencies));
        entry.dynamicDependencies = Array.from(new Set(dynamicDependencies));
    });

    const payload = JSON.stringify(templates)
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
    const code = `(function(global){'use strict';var templates=${payload};var target=global.JQUAN_TEMPLATES;if(!target||typeof target!=='object')target=global.JQUAN_TEMPLATES=Object.create(null);Object.keys(templates).forEach(function(name){target[name]=templates[name];});var components=global.JquanUIComponents;var api=components&&components.templateApi;if(api&&typeof api.registerTemplates==='function')api.registerTemplates(templates);})(typeof window!=='undefined'?window:globalThis);`;
    return {
        code,
        templates,
        files,
        entries,
        count: files.length,
        bytes: Buffer.byteLength(code, 'utf8'),
        templateRoot,
        report: {
            generatedAt: new Date().toISOString(),
            templateRoot,
            count: files.length,
            bundleBytes: Buffer.byteLength(code, 'utf8'),
            entries,
            dependencyCount: entries.reduce((total, entry) => total + entry.dependencies.length, 0),
            dynamicDependencyCount: entries.reduce((total, entry) => total + entry.dynamicDependencies.length, 0)
        }
    };
}

function writeTemplateBundle(inputs, options = {}) {
    if (!options.output) throw new Error('A template bundle output file is required.');
    const result = createTemplateBundle(inputs, options);
    const output = path.resolve(options.root || process.cwd(), options.output);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, result.code, 'utf8');
    return Object.assign({}, result, { output });
}

function writeTemplateBundleReport(result, reportFile, root = process.cwd()) {
    if (!reportFile) return null;
    const output = path.resolve(root, reportFile);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(result.report, null, 2), 'utf8');
    return output;
}

async function buildTemplatePages(inputs, options = {}) {
    const root = path.resolve(options.root || process.cwd());
    const files = resolveTemplateEntries(inputs, { root });
    if (files.length === 0) throw new Error('No HTML entry files were found.');
    if (!options.output) throw new Error('An HTML output file or directory is required.');
    const output = path.resolve(root, options.output);
    const outputIsFile = files.length === 1 && /\.html?$/i.test(output);
    const runtime = options.runtime || createNodeTemplateRuntime(Object.assign({}, options, { root }));
    const results = [];

    for (const file of files) {
        const rendered = await renderTemplateFile(file, Object.assign({}, options, { root, runtime }));
        const relative = path.relative(templateEntryBase(file, inputs, root), file);
        const destination = outputIsFile ? output : path.resolve(output, relative);
        const outputRelative = path.relative(outputIsFile ? path.dirname(output) : output, destination);
        if (outputRelative.startsWith('..') || path.isAbsolute(outputRelative)) {
            throw new Error(`HTML output escapes the configured directory: ${destination}`);
        }
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, rendered.html, 'utf8');
        results.push({ entry: file, output: destination, bytes: Buffer.byteLength(rendered.html, 'utf8') });
    }
    return { files: results, count: results.length, output, templateRoot: runtime.templateRoot };
}

async function main(argv = process.argv.slice(2)) {
    const args = parseArgs(argv);
    if (args.help) {
        printHelp();
        return { ok: true };
    }
    if (args.init) {
        const configPath = initConfigFile({ root: process.cwd(), configFile: args.configFile, force: args.force });
        console.log(`[JquanUI] Created config -> ${configPath}`);
        return { ok: true, configPath };
    }
    if (args.doctor) {
        const report = diagnoseProject({ inputs: args.inputs, core: args.core, configFile: args.configFile, root: process.cwd(), minify: args.minify });
        if (args.json) console.log(JSON.stringify(report, null, 2));
        else console.log(formatDoctorReport(report));
        return report;
    }
    if (args.templateInputs.length > 0) {
        if (!args.htmlOutput) {
            printHelp();
            return { ok: false, error: 'Missing --html-output.' };
        }
        const data = args.dataFile ? readJsonFile(args.dataFile, { root: process.cwd() }) : {};
        const result = await buildTemplatePages(args.templateInputs, {
            root: process.cwd(),
            output: args.htmlOutput,
            templates: args.templates || '.',
            data,
            safe: args.safe
        });
        console.log(`[JquanUI] Rendered ${result.count} HTML page(s) -> ${result.output}`);
        return Object.assign({ ok: true }, result);
    }
    if (args.templateBundleInputs.length > 0) {
        if (!args.templateBundleOutput) {
            printHelp();
            return { ok: false, error: 'Missing --template-bundle-output.' };
        }
        const result = writeTemplateBundle(args.templateBundleInputs, {
            root: process.cwd(),
            output: args.templateBundleOutput,
            templates: args.templates || '.'
        });
        if (args.templateBundleReport) writeTemplateBundleReport(result, args.templateBundleReport, process.cwd());
        console.log(`[JquanUI] Bundled ${result.count} template(s) -> ${result.output}`);
        return Object.assign({ ok: true }, result);
    }
    const config = resolveConfig({ configFile: args.configFile, root: process.cwd() });
    const configInputs = normalizeContentEntries(config.content);
    const inputs = args.inputs.length > 0 ? args.inputs : configInputs;
    if (inputs.length === 0 || (!args.output && !args.baselineOutput && !args.utilitiesOutput)) {
        printHelp();
        return { ok: false, error: 'Missing --input and an output path.' };
    }

    const result = extractFromFiles(inputs, { core: args.core, config, root: process.cwd(), minify: args.minify });
    const outputs = [];
    if (args.output) {
        const output = path.resolve(args.output);
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.writeFileSync(output, result.css, 'utf8');
        outputs.push(['full', output]);
    }
    if (args.baselineOutput) {
        const baselineOutput = path.resolve(args.baselineOutput);
        fs.mkdirSync(path.dirname(baselineOutput), { recursive: true });
        fs.writeFileSync(baselineOutput, result.baselineCss, 'utf8');
        outputs.push(['baseline', baselineOutput]);
    }
    if (args.utilitiesOutput) {
        const utilitiesOutput = path.resolve(args.utilitiesOutput);
        fs.mkdirSync(path.dirname(utilitiesOutput), { recursive: true });
        fs.writeFileSync(utilitiesOutput, result.utilityCss, 'utf8');
        outputs.push(['utilities', utilitiesOutput]);
    }
    if (args.report) {
        const reportPath = path.resolve(args.report);
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(result.report, null, 2), 'utf8');
    }
    console.log(`[JquanUI] Extracted ${result.classes.length} class token(s) from ${result.files.length} file(s) -> ${outputs.map(([kind, file]) => `${kind}: ${file}`).join(', ')}`);
    if (args.report) console.log(`[JquanUI] Report written -> ${path.resolve(args.report)}`);
    const hasWarnings = result.report && (result.report.unresolvedClassCount > 0 || result.report.failedRuleCount > 0 || result.report.configWarnings?.length > 0);
    return Object.assign({ ok: !(args.failOnWarn && hasWarnings), output: args.output ? path.resolve(args.output) : null, baselineOutput: args.baselineOutput ? path.resolve(args.baselineOutput) : null, utilitiesOutput: args.utilitiesOutput ? path.resolve(args.utilitiesOutput) : null, reportPath: args.report ? path.resolve(args.report) : null }, result);
}

module.exports = {
    DEFAULT_EXTENSIONS,
    DEFAULT_CONFIG_FILES,
    collectClassesFromSource,
    buildExtractionReport,
    createBlocklistMatcher,
    createConfigTemplate,
    createCriticalStyleTag,
    diagnoseProject,
    createRuntime,
    decodeHtmlEntities,
    escapeHtmlAttribute,
    extractClassStrings,
    extractFromFiles,
    extractFromSource,
    findConfigFile,
    formatDoctorReport,
    injectCriticalCss,
    initConfigFile,
    loadConfigFile,
    main,
    minifyCss,
    normalizeContentEntries,
    normalizeSafelistEntries,
    normalizeStyleAttributes,
    readJsonFile,
    renderStyleAttributes,
    resolveGlobFiles,
    resolveConfig,
    resolveConfigFile,
    renderCriticalCss,
    renderCssFromClasses,
    createNodeTemplateRuntime,
    renderTemplateFile,
    resolveTemplateEntries,
    buildTemplatePages,
    createTemplateBundle,
    writeTemplateBundle,
    writeTemplateBundleReport,
    splitTokens,
    walkInput
};

if (require.main === module) {
    Promise.resolve(main()).then(result => {
        if (result && result.ok === false) process.exitCode = 1;
    }).catch(error => {
        console.error(`[JquanUI] Extract failed: ${error.message}`);
        process.exitCode = 1;
    });
}
