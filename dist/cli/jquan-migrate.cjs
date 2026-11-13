#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const VERSION = '4.72.0';
const DEFAULT_BREAKPOINTS = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px', '3xl': '1920px', '4xl': '2560px' };
const COMPLEX_PROPERTIES = /^(?:animation|background-image|backdrop-filter|box-shadow|clip-path|content|filter|mask(?:-image)?|-webkit-mask-image|text-shadow|transform|transition)$/i;
const COMPLEX_VALUES = /(?:url|(?:repeating-)?(?:linear|radial|conic)-gradient|image-set)\(/i;
const SOURCE_EXTENSIONS = new Set(['.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.md', '.mdx']);
const DARK_COLOR_NAMES = new Set('white black slate gray zinc neutral stone red orange amber yellow lime green emerald teal cyan sky blue indigo violet purple fuchsia pink rose'.split(' '));
const DARK_ROLE_NAMES = new Set(['surface', 'surface-muted', 'text', 'text-muted', 'border', 'accent', 'focus', 'panel', 'main', 'muted']);

const FIXED_UTILITIES = {
    display: { block: 'block', 'inline-block': 'inline-block', inline: 'inline', flex: 'flex', 'inline-flex': 'inline-flex', grid: 'grid', 'inline-grid': 'inline-grid', contents: 'contents', 'flow-root': 'flow-root', none: 'hidden' },
    position: { static: 'static', fixed: 'fixed', absolute: 'absolute', relative: 'relative', sticky: 'sticky' },
    visibility: { visible: 'visible', hidden: 'invisible', collapse: 'collapse' },
    'box-sizing': { 'border-box': 'box-border', 'content-box': 'box-content' },
    'text-align': { left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify', start: 'text-start', end: 'text-end' },
    'text-transform': { uppercase: 'uppercase', lowercase: 'lowercase', capitalize: 'capitalize', none: 'normal-case' },
    'font-style': { italic: 'italic', normal: 'not-italic' },
    'font-weight': { 100: 'font-thin', 200: 'font-extralight', 300: 'font-light', 400: 'font-normal', 500: 'font-medium', 600: 'font-semibold', 700: 'font-bold', 800: 'font-extrabold', 900: 'font-black' },
    'white-space': { normal: 'whitespace-normal', nowrap: 'whitespace-nowrap', pre: 'whitespace-pre', 'pre-line': 'whitespace-pre-line', 'pre-wrap': 'whitespace-pre-wrap', 'break-spaces': 'whitespace-break-spaces' },
    'flex-direction': { row: 'flex-row', 'row-reverse': 'flex-row-reverse', column: 'flex-col', 'column-reverse': 'flex-col-reverse' },
    'flex-wrap': { wrap: 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse', nowrap: 'flex-nowrap' },
    'justify-content': { normal: 'justify-normal', start: 'justify-start', 'flex-start': 'justify-start', end: 'justify-end', 'flex-end': 'justify-end', center: 'justify-center', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly', stretch: 'justify-stretch' },
    'align-items': { start: 'items-start', 'flex-start': 'items-start', end: 'items-end', 'flex-end': 'items-end', center: 'items-center', baseline: 'items-baseline', stretch: 'items-stretch' },
    'align-self': { auto: 'self-auto', start: 'self-start', 'flex-start': 'self-start', end: 'self-end', 'flex-end': 'self-end', center: 'self-center', stretch: 'self-stretch', baseline: 'self-baseline' },
    overflow: { auto: 'overflow-auto', hidden: 'overflow-hidden', clip: 'overflow-clip', visible: 'overflow-visible', scroll: 'overflow-scroll' },
    'overflow-x': { auto: 'overflow-x-auto', hidden: 'overflow-x-hidden', clip: 'overflow-x-clip', visible: 'overflow-x-visible', scroll: 'overflow-x-scroll' },
    'overflow-y': { auto: 'overflow-y-auto', hidden: 'overflow-y-hidden', clip: 'overflow-y-clip', visible: 'overflow-y-visible', scroll: 'overflow-y-scroll' },
    cursor: { auto: 'cursor-auto', default: 'cursor-default', pointer: 'cursor-pointer', wait: 'cursor-wait', text: 'cursor-text', move: 'cursor-move', help: 'cursor-help', 'not-allowed': 'cursor-not-allowed', grab: 'cursor-grab', grabbing: 'cursor-grabbing' },
    'pointer-events': { none: 'pointer-events-none', auto: 'pointer-events-auto' },
    'object-fit': { contain: 'object-contain', cover: 'object-cover', fill: 'object-fill', none: 'object-none', 'scale-down': 'object-scale-down' },
    'list-style-position': { inside: 'list-inside', outside: 'list-outside' },
    'border-collapse': { collapse: 'border-collapse', separate: 'border-separate' },
    'table-layout': { auto: 'table-auto', fixed: 'table-fixed' },
    'user-select': { none: 'select-none', text: 'select-text', all: 'select-all', auto: 'select-auto' },
    resize: { none: 'resize-none', both: 'resize', horizontal: 'resize-x', vertical: 'resize-y' },
    isolation: { isolate: 'isolate', auto: 'isolation-auto' }
};

const SPACING_PROPERTIES = {
    margin: 'm', 'margin-left': 'ml', 'margin-right': 'mr', 'margin-top': 'mt', 'margin-bottom': 'mb', 'margin-inline': 'mi', 'margin-inline-start': 'ms', 'margin-inline-end': 'me',
    padding: 'p', 'padding-left': 'pl', 'padding-right': 'pr', 'padding-top': 'pt', 'padding-bottom': 'pb', 'padding-inline': 'pi', 'padding-inline-start': 'ps', 'padding-inline-end': 'pe', 'padding-block': 'pb-block', 'padding-block-start': 'pbs', 'padding-block-end': 'pbe',
    gap: 'gap', 'column-gap': 'gap-x', 'row-gap': 'gap-y', width: 'w', height: 'h', 'min-width': 'min-w', 'min-height': 'min-h', 'max-width': 'max-w', 'max-height': 'max-h',
    top: 'top', right: 'right', bottom: 'bottom', left: 'left', inset: 'inset', 'flex-basis': 'basis', 'text-indent': 'indent', 'scroll-margin': 'scroll-m', 'scroll-padding': 'scroll-p'
};

const FONT_SIZES = { '0.75rem': 'text-xs', '12px': 'text-xs', '0.875rem': 'text-sm', '13px': 'text-sm', '14px': 'text-sm', '15px': 'text-md', '1rem': 'text-md', '16px': 'text-md', '17px': 'text-md', '1.125rem': 'text-lg', '18px': 'text-lg', '19px': 'text-lg', '1.25rem': 'text-xl', '20px': 'text-xl', '21px': 'text-xl', '1.5rem': 'text-2xl', '24px': 'text-2xl', '1.875rem': 'text-3xl', '30px': 'text-3xl', '2.25rem': 'text-4xl', '36px': 'text-4xl', '3rem': 'text-5xl', '48px': 'text-5xl', '3.75rem': 'text-6xl', '60px': 'text-6xl', '4.5rem': 'text-7xl', '72px': 'text-7xl', '6rem': 'text-8xl', '96px': 'text-8xl', '8rem': 'text-9xl', '128px': 'text-9xl' };
const RADII = { '0': 'rounded-none', '0px': 'rounded-none', '0.125rem': 'rounded-sm', '2px': 'rounded-sm', '0.25rem': 'rounded', '4px': 'rounded', '0.375rem': 'rounded-md', '6px': 'rounded-md', '0.5rem': 'rounded-lg', '8px': 'rounded-lg', '0.75rem': 'rounded-xl', '12px': 'rounded-xl', '1rem': 'rounded-2xl', '16px': 'rounded-2xl', '1.5rem': 'rounded-3xl', '24px': 'rounded-3xl', '9999px': 'rounded-full' };
const LINE_HEIGHTS = { 1: 'leading-none', 1.25: 'leading-tight', 1.375: 'leading-snug', 1.5: 'leading-normal', 1.625: 'leading-relaxed', 2: 'leading-loose' };
const PSEUDO_VARIANTS = { ':hover': 'hover', ':focus': 'focus', ':focus-visible': 'focus-visible', ':focus-within': 'focus-within', ':active': 'active', ':checked': 'checked', ':disabled': 'disabled', ':invalid': 'invalid', ':valid': 'valid', '::before': 'before', '::after': 'after', '::placeholder': 'placeholder', '::selection': 'selection', '::marker': 'marker' };

function normalizeValue(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').replace(/\s*([,:/])\s*/g, '$1').toLowerCase();
}

function normalizeFluidValue(value) {
    const safe = item => {
        const result = String(item ?? '').trim();
        return result && !/[{};\r\n]/.test(result) ? result : null;
    };
    if (typeof value === 'string') {
        const result = safe(value);
        return result && /^clamp\(.+\)$/i.test(result) ? result : null;
    }
    const parts = Array.isArray(value) ? (value.length === 3 ? value : null) : (value && typeof value === 'object' ? [value.min, value.preferred, value.max] : null);
    if (!parts) return null;
    const normalized = parts.map(safe);
    return normalized.every(Boolean) ? `clamp(${normalized.join(', ')})` : null;
}

function buildSpacingScale(config = {}) {
    const values = {
        0: '0px', px: '1px', '0.5': '0.125rem', 1: '0.25rem', '1.5': '0.375rem', 2: '0.5rem', '2.5': '0.625rem', 3: '0.75rem', '3.5': '0.875rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem', 40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem', 56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem', 80: '20rem', 96: '24rem', auto: 'auto', full: '100%'
    };
    Object.assign(values, config.theme?.spacing || {}, config.theme?.extend?.spacing || {});
    const fluid = Object.assign({}, config.theme?.fluid?.spacing || {}, config.theme?.extend?.fluid?.spacing || {});
    for (const [name, definition] of Object.entries(fluid)) {
        const value = normalizeFluidValue(definition);
        if (value) values[`fluid-${name}`] = value;
    }
    const reverse = new Map();
    for (const [name, value] of Object.entries(values)) {
        reverse.set(normalizeValue(value), name);
        const rem = String(value).match(/^(\d+(?:\.\d+)?)rem$/);
        if (rem) reverse.set(`${Number(rem[1]) * 16}px`, name);
    }
    const pixelEntries = [...reverse.entries()]
        .filter(([value]) => /^\d+(?:\.\d+)?px$/.test(value))
        .sort((a, b) => Number.parseFloat(b[0]) - Number.parseFloat(a[0]));
    for (const [value, name] of pixelEntries) {
        const pixels = Number.parseFloat(value);
        for (const delta of [-1, 1, -2, 2]) {
            const nearby = pixels + delta;
            if (nearby >= 0 && !reverse.has(`${nearby}px`)) reverse.set(`${nearby}px`, name);
        }
    }
    for (const zero of ['0', '0px', '0rem', '0em', '0%']) reverse.set(zero, '0');
    return reverse;
}

function flattenColors(source, prefix = '', output = new Map()) {
    if (!source || typeof source !== 'object') return output;
    for (const [key, value] of Object.entries(source)) {
        const name = prefix ? `${prefix}-${key}` : key;
        if (typeof value === 'string') output.set(normalizeValue(value), name.replace(/-default$/i, ''));
        else if (value && typeof value === 'object') flattenColors(value, name, output);
    }
    return output;
}

function buildColorScale(config = {}) {
    const colors = new Map([['transparent', 'transparent'], ['currentcolor', 'current'], ['#fff', 'white'], ['#ffffff', 'white'], ['white', 'white'], ['rgb(255,255,255)', 'white'], ['#000', 'black'], ['#000000', 'black'], ['black', 'black'], ['rgb(0,0,0)', 'black']]);
    flattenColors(config.theme?.colors, '', colors);
    flattenColors(config.theme?.extend?.colors, '', colors);
    return colors;
}

function tokenValue(value) {
    if (Array.isArray(value)) return value[0];
    if (value && typeof value === 'object') return value.value ?? value[0];
    return value;
}

function buildNamedScale(config, themeKey, fallback, classPrefix) {
    const scale = new Map(Object.entries(fallback || {}));
    const theme = config.theme || {};
    const aliases = themeKey === 'borderRadius' ? ['radius'] : [];
    const values = Object.assign({}, ...aliases.map(alias => theme[alias] || {}), theme[themeKey] || {}, ...aliases.map(alias => theme.extend?.[alias] || {}), theme.extend?.[themeKey] || {});
    for (const [name, rawValue] of Object.entries(values)) {
        const value = tokenValue(rawValue);
        if ((typeof value === 'string' && value.trim()) || (typeof value === 'number' && Number.isFinite(value))) scale.set(normalizeValue(value), `${classPrefix}-${name.replace(/-default$/i, '')}`);
    }
    return scale;
}

function normalizeMigrationConfig(input = {}) {
    const config = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const theme = config.theme && typeof config.theme === 'object' ? config.theme : {};
    const extend = theme.extend && typeof theme.extend === 'object' ? theme.extend : {};
    const normalized = Object.assign({}, config, { theme: Object.assign({}, theme, { extend: Object.assign({}, extend) }) });
    const warnings = [];
    const unsupportedTailwindTokens = [];
    const mergeAlias = (target, alias) => {
        const values = Object.assign({}, theme[target] || {}, extend[target] || {});
        if (Object.keys(values).length) normalized.theme.extend[alias] = Object.assign({}, normalized.theme.extend[alias] || {}, values);
    };
    mergeAlias('screens', 'breakpoints');
    mergeAlias('borderRadius', 'radius');

    const supportedTheme = new Set(['colors', 'spacing', 'fluid', 'screens', 'breakpoints', 'borderRadius', 'radius', 'fontSize', 'fontWeight', 'lineHeight']);
    for (const key of Object.keys(theme)) {
        if (key !== 'extend' && !supportedTheme.has(key)) unsupportedTailwindTokens.push(`theme.${key}`);
    }
    for (const key of Object.keys(extend)) {
        if (!supportedTheme.has(key)) unsupportedTailwindTokens.push(`theme.extend.${key}`);
    }
    if (Array.isArray(config.plugins) && config.plugins.length) {
        warnings.push('Tailwind plugins are not executed by jquan-migrate; plugin-generated utilities require manual review.');
        unsupportedTailwindTokens.push('plugins');
    }
    if (config.corePlugins) {
        warnings.push('Tailwind corePlugins settings are reported for context but are not used to disable JquanUI utilities.');
        unsupportedTailwindTokens.push('corePlugins');
    }
    if (config.variants) {
        warnings.push('Tailwind variants settings are reported for context; JquanUI variants remain controlled by Core configuration.');
        unsupportedTailwindTokens.push('variants');
    }
    for (const token of unsupportedTailwindTokens) warnings.push(`Configuration token ${token} is not translated automatically.`);
    const looksLikeTailwind = !!config.content || !!config.purge || !!config.corePlugins || !!config.plugins || !!theme.screens || !!extend.screens;
    return {
        config: normalized,
        format: looksLikeTailwind ? 'tailwind-compatible' : 'jquanui',
        warnings: [...new Set(warnings)],
        unsupportedTailwindTokens: [...new Set(unsupportedTailwindTokens)]
    };
}

function arbitrarySuggestion(property, value) {
    if (!value || /[{};\r\n\]]/.test(value) || COMPLEX_PROPERTIES.test(property) || COMPLEX_VALUES.test(value)) return null;
    return `[${property}:${String(value).trim().replace(/\s+/g, '_')}]`;
}

function suggestAtomicClass(property, value, options = {}) {
    const prop = String(property || '').trim().toLowerCase();
    const normalized = normalizeValue(value);
    const fixed = FIXED_UTILITIES[prop]?.[normalized];
    if (fixed) return { className: fixed, kind: 'semantic' };

    const spacingPrefix = SPACING_PROPERTIES[prop];
    if (spacingPrefix) {
        const negative = normalized.startsWith('-');
        const key = options.spacingScale?.get(negative ? normalized.slice(1) : normalized);
        if (key) return { className: `${negative ? '-' : ''}${spacingPrefix}-${key}`, kind: 'semantic' };
    }
    const customFontSize = options.fontSizeScale?.get(normalized);
    if (prop === 'font-size' && customFontSize) return { className: customFontSize, kind: 'semantic' };
    const customRadius = options.radiusScale?.get(normalized);
    if (prop === 'border-radius' && customRadius) return { className: customRadius, kind: 'semantic' };
    const customLineHeight = options.lineHeightScale?.get(normalized);
    if (prop === 'line-height' && customLineHeight) return { className: customLineHeight, kind: 'semantic' };
    const customFontWeight = options.fontWeightScale?.get(normalized);
    if (prop === 'font-weight' && customFontWeight) return { className: customFontWeight, kind: 'semantic' };
    if (prop === 'font-size' && FONT_SIZES[normalized]) return { className: FONT_SIZES[normalized], kind: 'semantic' };
    if (prop === 'border-radius' && RADII[normalized]) return { className: RADII[normalized], kind: 'semantic' };
    if (prop === 'line-height' && LINE_HEIGHTS[normalized]) return { className: LINE_HEIGHTS[normalized], kind: 'semantic' };
    const numericOpacity = Number(normalized);
    if (prop === 'opacity' && Number.isFinite(numericOpacity) && numericOpacity >= 0 && numericOpacity <= 1) {
        const amount = Math.round(numericOpacity * 100);
        if (amount % 5 === 0) return { className: `opacity-${amount}`, kind: 'semantic' };
    }
    if (prop === 'z-index' && ['0', '10', '20', '30', '40', '50', 'auto'].includes(normalized)) return { className: `z-${normalized}`, kind: 'semantic' };
    if (/^border(?:-(?:top|right|bottom|left))?-width$/.test(prop)) {
        const side = { 'border-top-width': 't', 'border-right-width': 'r', 'border-bottom-width': 'b', 'border-left-width': 'l' }[prop] || '';
        const width = { '0': '0', '0px': '0', '1px': '', '2px': '2', '4px': '4', '8px': '8' }[normalized];
        if (width !== undefined) return { className: `border${side ? `-${side}` : ''}${width ? `-${width}` : ''}`, kind: 'semantic' };
    }
    const colorPrefix = { color: 'text', 'background-color': 'bg', 'border-color': 'border', 'outline-color': 'outline', fill: 'fill', stroke: 'stroke' }[prop];
    const colorName = colorPrefix && options.colorScale?.get(normalized);
    if (colorName) return { className: `${colorPrefix}-${colorName}`, kind: 'semantic' };

    const arbitrary = options.includeArbitrary === false ? null : arbitrarySuggestion(prop, value);
    return arbitrary ? { className: arbitrary, kind: 'arbitrary' } : null;
}

const CLASS_ORDER_GROUPS = [
    /^(?:!|[\w-]+:)*(?:container|block|inline|flex|grid|table|contents|hidden|sr-only|visible|invisible)/,
    /^(?:!|[\w-]+:)*(?:static|fixed|absolute|relative|sticky|inset|top|right|bottom|left|z-)/,
    /^(?:!|[\w-]+:)*(?:float|clear|isolate|object-|overflow|overscroll|box-|aspect-|columns?)/,
    /^(?:!|[\w-]+:)*(?:flex|grow|shrink|basis|order)/,
    /^(?:!|[\w-]+:)*(?:justify|items|content|self|place)/,
    /^(?:!|[\w-]+:)*(?:gap|space-|divide-)/,
    /^(?:!|[\w-]+:)*(?:w-|h-|size-|min-|max-)/,
    /^(?:!|[\w-]+:)*(?:m[trblxyse]?[-:[]|p[trblxyseib-]*[-:[])/,
    /^(?:!|[\w-]+:)*(?:font-|text-(?:xs|sm|md|lg|xl|\d|left|center|right|justify|wrap|ellipsis|balance|pretty)|leading-|tracking-|align-|uppercase|lowercase|capitalize|normal-case|italic|not-italic|whitespace-|break-)/,
    /^(?:!|[\w-]+:)*(?:text-|bg-|from-|via-|to-)/,
    /^(?:!|[\w-]+:)*(?:border|rounded|outline|ring|decoration|underline|no-underline|accent-|caret-)/,
    /^(?:!|[\w-]+:)*(?:shadow|opacity|mix-blend|bg-blend|filter|blur|backdrop-|transition|duration-|ease-|delay-|animate|transform|origin|scale-|rotate-|translate-|skew-)/,
    /^(?:!|[\w-]+:)*(?:hover|focus|active|disabled|checked|group|peer|before|after|motion|contrast|forced|print|dark|light|sm|md|lg|xl|2xl|3xl|4xl):/
];

function classOrderKey(token) {
    const value = String(token || '');
    const group = CLASS_ORDER_GROUPS.findIndex(pattern => pattern.test(value));
    const variantCount = (value.match(/:/g) || []).length;
    return `${String(group < 0 ? CLASS_ORDER_GROUPS.length : group).padStart(2, '0')}:${String(variantCount).padStart(2, '0')}:${value}`;
}

function sortClassTokens(tokens) {
    return [...tokens].sort((a, b) => {
        const left = classOrderKey(a);
        const right = classOrderKey(b);
        return left < right ? -1 : left > right ? 1 : 0;
    });
}

function splitClassString(value) {
    return String(value || '').trim().split(/\s+/).filter(Boolean);
}

function classStringLine(source, index) {
    return String(source || '').slice(0, Math.max(0, index)).split('\n').length;
}

function collectSourceFiles(inputs, root = process.cwd()) {
    const files = [];
    const visit = input => {
        const resolved = path.resolve(root, input);
        if (!fs.existsSync(resolved)) return;
        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
            for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
                if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) visit(path.join(resolved, entry.name));
            }
        } else if (stat.isFile() && SOURCE_EXTENSIONS.has(path.extname(resolved).toLowerCase()) && !files.includes(resolved)) files.push(resolved);
    };
    (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean).forEach(visit);
    return files.sort();
}

function auditClassSource(source, options = {}) {
    const extractor = require('./jquan-extract.cjs');
    const audits = [];
    for (const classString of extractor.extractClassStrings(String(source || ''))) {
        const tokens = splitClassString(classString);
        if (tokens.length < 2) continue;
        const sortedTokens = sortClassTokens(tokens);
        const sorted = sortedTokens.join(' ');
        if (sorted !== classString.trim()) audits.push({ original: classString.trim(), sorted, changed: true, tokens, line: options.line || null });
    }
    return audits;
}

function auditClassFiles(inputs, options = {}) {
    const files = collectSourceFiles(inputs, options.root || process.cwd());
    const reports = [];
    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        const extractor = require('./jquan-extract.cjs');
        const seen = new Set();
        const audits = [];
        for (const classString of extractor.extractClassStrings(source)) {
            const original = classString.trim();
            const tokens = splitClassString(original);
            if (tokens.length < 2) continue;
            const sorted = sortClassTokens(tokens).join(' ');
            const key = `${original}\u0000${sorted}`;
            if (sorted !== original && !seen.has(key)) {
                seen.add(key);
                const index = source.indexOf(classString);
                audits.push({ original, sorted, changed: true, tokens, line: classStringLine(source, index) });
            }
        }
        reports.push({ source: file, audits });
    }
    return { files: reports, total: reports.reduce((sum, item) => sum + item.audits.length, 0) };
}

// Keep colons/spaces inside arbitrary selectors, colors and grouped variants intact.
function splitDarkSyntax(value, delimiter) {
    const parts = [];
    let start = 0, square = 0, round = 0, quote = '', escaped = false;
    for (let index = 0; index < value.length; index++) {
        const char = value[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\') { escaped = true; continue; }
        if (quote) { if (char === quote) quote = ''; continue; }
        if (char === '"' || char === "'") { quote = char; continue; }
        if (char === '[') square++;
        else if (char === ']') square--;
        else if (char === '(') round++;
        else if (char === ')') round--;
        if (square === 0 && round === 0 && (delimiter === ':' ? char === ':' : /\s/.test(char))) {
            if (index > start) parts.push(value.slice(start, index));
            start = index + 1;
        }
    }
    if (start < value.length) parts.push(value.slice(start));
    return parts;
}

function darkClassTokens(value, prefix = '', depth = 0) {
    const tokens = [];
    for (const token of splitDarkSyntax(value, 'space')) {
        const parts = splitDarkSyntax(token, ':');
        const last = parts[parts.length - 1] || '';
        if (depth < 20 && parts.length > 1 && last.startsWith('(') && last.endsWith(')')) {
            tokens.push(...darkClassTokens(last.slice(1, -1), prefix + parts.slice(0, -1).join(':') + ':', depth + 1));
        } else tokens.push(prefix + token);
    }
    return tokens;
}

function darkTokenParts(token) {
    const raw = String(token || '').trim();
    const segments = splitDarkSyntax(raw.replace(/^!/, ''), ':');
    const base = segments.pop() || '';
    return { raw, base: base.replace(/^!/, ''), variants: segments, important: raw.startsWith('!') || base.startsWith('!') };
}

function darkCandidate(token, roles) {
    const { base } = darkTokenParts(token);
    const color = base.match(/^(bg|text|border(?:-[trblxyse])?|outline|ring(?:-offset)?|decoration|fill|stroke|shadow)-(.+)$/i);
    if (color) {
        // Alpha follows the color; slash characters inside brackets stay in the value.
        const value = color[2].replace(/\/(?:\d+(?:\.\d+)?|\[[^\]]+\])$/, '');
        const property = color[1] === 'shadow' ? 'shadow-color' : color[1];
        const role = color[1] === 'bg' ? 'surface' : color[1] === 'text' ? 'text' : color[1] === 'shadow' ? 'shadow' : 'border';
        if (DARK_COLOR_NAMES.has(value.replace(/-\d+$/, '').toLowerCase()) || /^\[(?:color:)?(?:#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\(.+\))\]$/i.test(value)) {
            return { token, kind: 'hardcoded-color', property, role, reason: 'literal palette or arbitrary color needs role review' };
        }
        if (roles.has(value)) return { token, kind: 'semantic-role', property, role: value, reason: 'role name detected; verify configured light/dark values' };
    }
    if (/^(?:shadow(?:-(?:none|sm|md|lg|xl|2xl|inner|\[.+\]))?|drop-shadow(?:-(?:none|sm|md|lg|xl|2xl|\[.+\]))?)$/.test(base)) {
        return { token, kind: 'shadow', property: base.startsWith('drop-shadow') ? 'drop-shadow' : 'shadow', role: 'shadow', reason: 'fixed shadow needs dark-mode review' };
    }
    return null;
}

function auditDarkSource(source, options = {}) {
    const extractor = require('./jquan-extract.cjs');
    const roles = new Set([...DARK_ROLE_NAMES, ...Object.keys(options.config?.theme?.semantic || {})]);
    const darkModes = new Set(['dark', 'dark-class', 'dark-media']);
    const signature = item => `${item.property}|${item.parts.important}|${item.parts.variants.filter(part => !darkModes.has(part)).join(':')}`;
    const findings = [];
    const seen = new Set();
    for (const classString of extractor.extractClassStrings(String(source || ''))) {
        const original = classString.trim();
        const items = [...new Set(darkClassTokens(original))].map(token => {
            const candidate = darkCandidate(token, roles);
            return candidate ? Object.assign(candidate, { parts: darkTokenParts(token) }) : null;
        }).filter(Boolean);
        const paired = new Set(items.filter(item => item.parts.variants.some(part => darkModes.has(part))).map(signature));
        const candidates = items.map(item => {
            const { parts, ...candidate } = item;
            const hasDarkVariant = parts.variants.some(part => darkModes.has(part)) || paired.has(signature(item));
            return Object.assign(candidate, { hasDarkVariant, missingDarkVariant: !hasDarkVariant && candidate.kind !== 'semantic-role' });
        });
        if (!candidates.length) continue;
        const key = `${original}\u0000${candidates.map(item => item.token).join(' ')}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const index = extractor.decodeHtmlEntities(String(source || '')).indexOf(classString);
        findings.push({ source: options.source || null, classString: original, line: index < 0 ? null : classStringLine(extractor.decodeHtmlEntities(String(source || '')), index), candidates });
    }
    const candidates = findings.flatMap(item => item.candidates.map(candidate => Object.assign({}, candidate, { source: item.source, classString: item.classString, line: item.line })));
    const summary = {
        classStrings: new Set(findings.map(item => item.classString)).size,
        candidates: candidates.length,
        hardcodedColors: candidates.filter(item => item.kind === 'hardcoded-color').length,
        shadows: candidates.filter(item => item.kind === 'shadow').length,
        semanticRoles: candidates.filter(item => item.kind === 'semantic-role').length,
        missingDarkVariants: candidates.filter(item => item.missingDarkVariant).length
    };
    return { version: VERSION, source: options.source || null, summary, candidates, findings };
}

function auditDarkFiles(inputs, options = {}) {
    const files = collectSourceFiles(inputs, options.root || process.cwd());
    const reports = files.map(file => auditDarkSource(fs.readFileSync(file, 'utf8'), Object.assign({}, options, { source: file })));
    const summary = reports.reduce((total, report) => {
        for (const key of Object.keys(total)) total[key] += report.summary[key] || 0;
        return total;
    }, { classStrings: 0, candidates: 0, hardcodedColors: 0, shadows: 0, semanticRoles: 0, missingDarkVariants: 0 });
    return { version: VERSION, generatedAt: new Date().toISOString(), summary, files: reports, candidates: reports.flatMap(report => report.candidates) };
}

function removeComments(source) {
    let output = '';
    let quote = '';
    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        if (quote) {
            output += char;
            if (char === '\\') output += source[++index] || '';
            else if (char === quote) quote = '';
        } else if (char === '"' || char === "'") {
            quote = char;
            output += char;
        } else if (char === '/' && source[index + 1] === '*') {
            index += 2;
            while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
                if (source[index] === '\n') output += '\n';
                index += 1;
            }
            index += 1;
        } else output += char;
    }
    return output;
}

function findTopLevel(source, start, target) {
    let quote = '';
    let round = 0;
    let square = 0;
    for (let index = start; index < source.length; index += 1) {
        const char = source[index];
        if (quote) {
            if (char === '\\') index += 1;
            else if (char === quote) quote = '';
            continue;
        }
        if (char === '"' || char === "'") quote = char;
        else if (char === '(') round += 1;
        else if (char === ')') round = Math.max(0, round - 1);
        else if (char === '[') square += 1;
        else if (char === ']') square = Math.max(0, square - 1);
        else if (char === target && round === 0 && square === 0) return index;
    }
    return -1;
}

function findClosingBrace(source, openIndex) {
    let depth = 1;
    let quote = '';
    for (let index = openIndex + 1; index < source.length; index += 1) {
        const char = source[index];
        if (quote) {
            if (char === '\\') index += 1;
            else if (char === quote) quote = '';
        } else if (char === '"' || char === "'") quote = char;
        else if (char === '{') depth += 1;
        else if (char === '}' && --depth === 0) return index;
    }
    return -1;
}

function splitDeclarations(body) {
    const parts = [];
    let start = 0;
    while (start < body.length) {
        const end = findTopLevel(body, start, ';');
        const part = body.slice(start, end < 0 ? body.length : end).trim();
        if (part) parts.push(part);
        if (end < 0) break;
        start = end + 1;
    }
    return parts.map(raw => {
        const colon = findTopLevel(raw, 0, ':');
        if (colon < 1) return null;
        const property = raw.slice(0, colon).trim().toLowerCase();
        let value = raw.slice(colon + 1).trim();
        const important = /\s*!important\s*$/i.test(value);
        if (important) value = value.replace(/\s*!important\s*$/i, '').trim();
        return /^[a-z-]+$|^--[\w-]+$/.test(property) && value ? { property, value, important } : null;
    }).filter(Boolean);
}

function parseCss(source) {
    const clean = removeComments(String(source || ''));
    const rules = [];
    function walk(fragment, contexts = [], offset = 0) {
        let cursor = 0;
        while (cursor < fragment.length) {
            const open = findTopLevel(fragment, cursor, '{');
            if (open < 0) break;
            const prelude = fragment.slice(cursor, open).trim().replace(/^;+/g, '').trim();
            const close = findClosingBrace(fragment, open);
            if (close < 0) break;
            const body = fragment.slice(open + 1, close);
            const absolute = offset + cursor + Math.max(0, fragment.slice(cursor, open).indexOf(prelude));
            const line = clean.slice(0, absolute).split('\n').length;
            if (prelude.startsWith('@')) {
                if (!/^@(?:-[\w]+-)?keyframes\b/i.test(prelude)) walk(body, contexts.concat(prelude.replace(/\s+/g, ' ')), offset + open + 1);
            } else if (prelude) {
                rules.push({ selector: prelude.replace(/\s+/g, ' '), declarations: splitDeclarations(body), contexts: contexts.slice(), line });
            }
            cursor = close + 1;
        }
    }
    walk(clean);
    return rules;
}

function selectorTarget(selector) {
    const normalized = selector.trim();
    const patterns = [
        { re: /^\.([_a-zA-Z][\w-]*)(::?[\w-]+)?$/, prefix: '' },
        { re: /^\.dark\s+\.([_a-zA-Z][\w-]*)(::?[\w-]+)?$/, prefix: 'dark' }
    ];
    for (const { re, prefix } of patterns) {
        const match = normalized.match(re);
        if (!match) continue;
        const pseudo = match[2] || '';
        if (pseudo && !PSEUDO_VARIANTS[pseudo]) return null;
        return { targetClass: match[1], variants: [prefix, PSEUDO_VARIANTS[pseudo]].filter(Boolean) };
    }
    return null;
}

function contextVariants(contexts, config = {}) {
    const breakpoints = Object.assign({}, DEFAULT_BREAKPOINTS, config.theme?.extend?.breakpoints || {});
    const variants = [];
    for (const context of contexts) {
        const media = context.match(/^@media\s*\(\s*min-width\s*:\s*([^\s)]+)\s*\)$/i);
        if (media) {
            const found = Object.entries(breakpoints).find(([, width]) => normalizeValue(typeof width === 'object' ? (width.min ?? width[0] ?? '') : width) === normalizeValue(media[1]));
            if (found) variants.push(found[0]);
            else variants.push(`min-[${media[1]}]`);
            continue;
        }
        const supports = context.match(/^@supports\s*(.+)$/i);
        if (supports) variants.push(`supports-[${supports[1].replace(/^\(|\)$/g, '').replace(/\s+/g, '_')}]`);
        else return null;
    }
    return variants;
}

function auditCss(source, options = {}) {
    const normalizedConfig = normalizeMigrationConfig(options.config || {});
    const config = normalizedConfig.config;
    const suggestionOptions = {
        includeArbitrary: options.includeArbitrary !== false,
        spacingScale: buildSpacingScale(config),
        colorScale: buildColorScale(config),
        fontSizeScale: buildNamedScale(config, 'fontSize', {}, 'text'),
        radiusScale: buildNamedScale(config, 'borderRadius', {}, 'rounded'),
        lineHeightScale: buildNamedScale(config, 'lineHeight', {}, 'leading'),
        fontWeightScale: buildNamedScale(config, 'fontWeight', {}, 'font')
    };
    const rules = parseCss(source);
    const findings = [];
    const totals = { rules: rules.length, declarations: 0, semantic: 0, arbitrary: 0, manual: 0, important: 0 };
    for (const rule of rules) {
        const target = selectorTarget(rule.selector);
        const atVariants = contextVariants(rule.contexts, config);
        const selectorMigratable = !!target && !!atVariants;
        const declarations = rule.declarations.map(declaration => {
            totals.declarations += 1;
            if (declaration.important) totals.important += 1;
            if (!selectorMigratable) {
                totals.manual += 1;
                return Object.assign({}, declaration, { kind: 'manual', reason: target ? 'unsupported-at-rule-context' : 'complex-selector', before: `${declaration.property}: ${declaration.value}${declaration.important ? ' !important' : ''}`, after: null });
            }
            const suggestion = suggestAtomicClass(declaration.property, declaration.value, suggestionOptions);
            if (!suggestion) {
                totals.manual += 1;
                return Object.assign({}, declaration, { kind: 'manual', reason: COMPLEX_PROPERTIES.test(declaration.property) || COMPLEX_VALUES.test(declaration.value) ? 'complex-visual' : 'no-safe-atomic-form', before: `${declaration.property}: ${declaration.value}${declaration.important ? ' !important' : ''}`, after: null });
            }
            totals[suggestion.kind] += 1;
            const variants = atVariants.concat(target.variants);
            const className = `${declaration.important ? '!' : ''}${variants.length ? `${variants.join(':')}:` : ''}${suggestion.className}`;
            return Object.assign({}, declaration, { kind: suggestion.kind, className, before: `${declaration.property}: ${declaration.value}${declaration.important ? ' !important' : ''}`, after: className });
        });
        findings.push({ selector: rule.selector, targetClass: target?.targetClass || null, contexts: rule.contexts, line: rule.line, declarations });
    }
    const semanticCoverage = totals.declarations ? totals.semantic / totals.declarations : 0;
    const expressibleCoverage = totals.declarations ? (totals.semantic + totals.arbitrary) / totals.declarations : 0;
    const migrationSuggestions = findings.flatMap(finding => finding.declarations.map(declaration => ({
        selector: finding.selector,
        line: finding.line,
        before: declaration.before,
        after: declaration.after,
        kind: declaration.kind,
        reason: declaration.reason || null
    })));
    return {
        version: VERSION,
        source: options.source || null,
        configSource: options.configSource || null,
        configFormat: normalizedConfig.format,
        configWarnings: normalizedConfig.warnings,
        unsupportedTailwindTokens: normalizedConfig.unsupportedTailwindTokens,
        totals,
        coverage: { semantic: semanticCoverage, expressible: expressibleCoverage },
        findings,
        migrationSuggestions
    };
}

function collectCssFiles(inputs, root = process.cwd()) {
    const files = [];
    const visit = input => {
        const resolved = path.resolve(root, input);
        if (!fs.existsSync(resolved)) return;
        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
            for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
                if (entry.name === 'node_modules' || entry.name === '.git') continue;
                visit(path.join(resolved, entry.name));
            }
        } else if (stat.isFile() && path.extname(resolved).toLowerCase() === '.css' && !files.includes(resolved)) files.push(resolved);
    };
    (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean).forEach(visit);
    return files.sort();
}

function auditCssFiles(inputs, options = {}) {
    const files = collectCssFiles(inputs, options.root || process.cwd());
    const reports = files.map(file => auditCss(fs.readFileSync(file, 'utf8'), Object.assign({}, options, { source: file })));
    const totals = { files: files.length, rules: 0, declarations: 0, semantic: 0, arbitrary: 0, manual: 0, important: 0 };
    for (const report of reports) for (const key of Object.keys(totals)) if (key !== 'files') totals[key] += report.totals[key] || 0;
    const configWarnings = [...new Set(reports.flatMap(report => report.configWarnings || []))];
    const unsupportedTailwindTokens = [...new Set(reports.flatMap(report => report.unsupportedTailwindTokens || []))];
    const manualRatio = totals.declarations ? totals.manual / totals.declarations : 0;
    return {
        version: VERSION,
        generatedAt: new Date().toISOString(),
        configSource: options.configSource || null,
        configFormat: options.configFormat || reports[0]?.configFormat || 'jquanui',
        configWarnings,
        unsupportedTailwindTokens,
        totals,
        coverage: {
            semantic: totals.declarations ? totals.semantic / totals.declarations : 0,
            expressible: totals.declarations ? (totals.semantic + totals.arbitrary) / totals.declarations : 0
        },
        thresholds: { minSemantic: null, minExpressible: null, maxManual: null, manualRatio, passed: true, failures: [] },
        files: reports,
        migrationSuggestions: reports.flatMap(report => (report.migrationSuggestions || []).map(item => Object.assign({}, item, { source: report.source })))
    };
}

function percentage(value) {
    return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatMigrationReport(report) {
    const lines = [
        '# JquanUI CSS Migration Audit', '',
        `- Files: ${report.totals.files ?? 1}`,
        `- Rules: ${report.totals.rules}`,
        `- Declarations: ${report.totals.declarations}`,
        `- Semantic replacements: ${report.totals.semantic} (${percentage(report.coverage.semantic)})`,
        `- Arbitrary-value candidates: ${report.totals.arbitrary}`,
        `- Manual review: ${report.totals.manual}`,
        `- Total expressible: ${percentage(report.coverage.expressible)}`,
        report.configSource ? `- Config: \`${report.configSource}\`` : '',
        report.configFormat ? `- Config format: \`${report.configFormat}\`` : '',
        report.configWarnings?.length ? `- Config warnings: ${report.configWarnings.join('; ')}` : '', ''
    ];
    if (report.unsupportedTailwindTokens?.length) lines.splice(lines.length - 1, 0, `- Untranslated config tokens: ${report.unsupportedTailwindTokens.map(item => `\`${item}\``).join(', ')}`);
    if (report.thresholds && !report.thresholds.passed) lines.splice(lines.length - 1, 0, `- Threshold failures: ${report.thresholds.failures.join('; ')}`);
    const reports = Array.isArray(report.files) ? report.files : [report];
    for (const file of reports) {
        lines.push(`## ${file.source || 'Inline CSS'}`, '');
        for (const finding of file.findings || []) {
            const suggestions = finding.declarations.filter(item => item.className).map(item => item.className);
            const manual = finding.declarations.filter(item => item.kind === 'manual');
            lines.push(`### \`${finding.selector}\``, '');
            if (suggestions.length) lines.push(`Suggested classes: \`${suggestions.join(' ')}\``);
            for (const item of finding.declarations.filter(item => item.before)) lines.push(`- \`${item.before}\` -> ${item.after ? `\`${item.after}\`` : `manual (${item.reason})`}`);
            if (manual.length) lines.push(`Manual declarations: ${manual.map(item => `\`${item.property}: ${item.value}\``).join(', ')}`);
            lines.push('');
        }
    }
    if (report.classOrder?.total) {
        lines.push('## Class order audit', '', `- Out-of-order class strings: ${report.classOrder.total}`, '');
        for (const file of report.classOrder.files || []) for (const item of file.audits || []) lines.push(`- ${file.source}:${item.line || '?'}: \`${item.original}\` -> \`${item.sorted}\``);
        lines.push('');
    }
    if (report.darkAudit) {
        lines.push('## Dark-mode migration audit', '', `- Class strings: ${report.darkAudit.summary.classStrings}`, `- Hardcoded color candidates: ${report.darkAudit.summary.hardcodedColors}`, `- Shadow candidates: ${report.darkAudit.summary.shadows}`, `- Semantic role classes: ${report.darkAudit.summary.semanticRoles}`, `- Missing dark variants: ${report.darkAudit.summary.missingDarkVariants}`, '');
        for (const item of report.darkAudit.candidates) lines.push(`- ${item.source || 'inline'}:${item.line || '?'}: \`${item.token}\` — ${item.kind}; ${item.reason}${item.missingDarkVariant ? '; add a role or explicit dark variant' : ''}`);
        lines.push('');
    }
    return `${lines.join('\n').trim()}\n`;
}

function printHelp() {
    console.log(`JquanUI CSS migration auditor

Usage:
  jquan-migrate --input ./css --output ./jquan-migration.json
  jquan-migrate -i ./src/styles.css --format markdown

Options:
  --input, -i       CSS file or directory. Can be repeated.
  --output, -o      Write the report to a file instead of stdout.
  --format          json (default) or markdown.
  --config, -c      JquanUI config file for project tokens and breakpoints.
  --source, -s      HTML/JS/Vue/Svelte source for class-order auditing. Can be repeated.
  --semantic-only   Do not suggest arbitrary property classes.
  --min-semantic    Exit with code 2 when semantic coverage is below this percentage.
  --min-expressible  Exit with code 2 when semantic + arbitrary coverage is below this percentage.
  --max-manual       Exit with code 2 when manual-review ratio exceeds this percentage.
  --max-order        Exit with code 2 when out-of-order class strings exceed this count.
  --dark-audit       Audit --source files for hardcoded colors, shadows, semantic roles, and missing dark variants.
  --max-dark-missing Exit with code 2 when dark-audit missing-dark-variant candidates exceed this count.
  --help, -h        Show this help.
`);
}

function parseArgs(argv) {
    const args = { inputs: [], sources: [], format: 'json', output: null, configFile: null, includeArbitrary: true, minSemantic: null, minExpressible: null, maxManual: null, maxOrder: null, darkAudit: false, maxDarkMissing: null };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--help' || arg === '-h') args.help = true;
        else if (arg === '--input' || arg === '-i') args.inputs.push(argv[++index]);
        else if (arg.startsWith('--input=')) args.inputs.push(arg.slice(8));
        else if (arg === '--output' || arg === '-o') args.output = argv[++index];
        else if (arg.startsWith('--output=')) args.output = arg.slice(9);
        else if (arg === '--format') args.format = argv[++index];
        else if (arg.startsWith('--format=')) args.format = arg.slice(9);
        else if (arg === '--config' || arg === '-c') args.configFile = argv[++index];
        else if (arg.startsWith('--config=')) args.configFile = arg.slice(9);
        else if (arg === '--source' || arg === '-s') args.sources.push(argv[++index]);
        else if (arg.startsWith('--source=')) args.sources.push(arg.slice(9));
        else if (arg === '--semantic-only') args.includeArbitrary = false;
        else if (arg === '--min-semantic') args.minSemantic = Number(argv[++index]);
        else if (arg.startsWith('--min-semantic=')) args.minSemantic = Number(arg.slice(15));
        else if (arg === '--min-expressible') args.minExpressible = Number(argv[++index]);
        else if (arg.startsWith('--min-expressible=')) args.minExpressible = Number(arg.slice(18));
        else if (arg === '--max-manual') args.maxManual = Number(argv[++index]);
        else if (arg.startsWith('--max-manual=')) args.maxManual = Number(arg.slice(13));
        else if (arg === '--max-order') args.maxOrder = Number(argv[++index]);
        else if (arg.startsWith('--max-order=')) args.maxOrder = Number(arg.slice(12));
        else if (arg === '--dark-audit') args.darkAudit = true;
        else if (arg === '--max-dark-missing' || arg.startsWith('--max-dark-missing=')) {
            const raw = arg === '--max-dark-missing' ? argv[++index] : arg.slice(19);
            if (!/^\d+$/.test(raw || '') || !Number.isSafeInteger(Number(raw))) throw new Error('--max-dark-missing must be a non-negative integer.');
            args.maxDarkMissing = Number(raw);
        }
        else args.inputs.push(arg);
    }
    return args;
}

function main(argv = process.argv.slice(2)) {
    const args = parseArgs(argv);
    if (args.help) {
        printHelp();
        return { ok: true, help: true };
    }
    if (!args.inputs.length && !args.sources.length) throw new Error('At least one --input CSS file or --source file or directory is required.');
    if (args.darkAudit && !args.sources.length) throw new Error('--dark-audit requires at least one --source file or directory.');
    if (args.maxDarkMissing !== null && !args.darkAudit) throw new Error('--max-dark-missing requires --dark-audit.');
    if (!['json', 'markdown'].includes(args.format)) throw new Error('--format must be json or markdown.');
    const root = process.cwd();
    const extractor = require('./jquan-extract.cjs');
    const config = args.configFile ? extractor.loadConfigFile(args.configFile, { root }) : {};
    const configInfo = normalizeMigrationConfig(config);
    const report = auditCssFiles(args.inputs, { root, config: configInfo.config, configSource: args.configFile ? path.resolve(root, args.configFile) : null, configFormat: configInfo.format, includeArbitrary: args.includeArbitrary });
    if (args.inputs.length && !report.totals.files) throw new Error('No CSS files found in the requested inputs.');
    if (args.sources.length) report.classOrder = auditClassFiles(args.sources, { root });
    if (args.darkAudit) {
        report.darkAudit = auditDarkFiles(args.sources, { root, config });
        if (!report.darkAudit.files.length) throw new Error('No source files found for --dark-audit.');
    }
    const thresholdReasons = [];
    if (Number.isFinite(args.minSemantic) && report.coverage.semantic * 100 < args.minSemantic) thresholdReasons.push(`semantic coverage ${percentage(report.coverage.semantic)} < ${args.minSemantic}%`);
    if (Number.isFinite(args.minExpressible) && report.coverage.expressible * 100 < args.minExpressible) thresholdReasons.push(`expressible coverage ${percentage(report.coverage.expressible)} < ${args.minExpressible}%`);
    const manualRatio = report.totals.declarations ? report.totals.manual / report.totals.declarations : 0;
    if (Number.isFinite(args.maxManual) && manualRatio * 100 > args.maxManual) thresholdReasons.push(`manual ratio ${percentage(manualRatio)} > ${args.maxManual}%`);
    const orderCount = report.classOrder?.total || 0;
    if (Number.isFinite(args.maxOrder) && orderCount > args.maxOrder) thresholdReasons.push(`out-of-order class strings ${orderCount} > ${args.maxOrder}`);
    if (Number.isFinite(args.maxDarkMissing) && (report.darkAudit?.summary.missingDarkVariants || 0) > args.maxDarkMissing) thresholdReasons.push(`missing dark variants ${report.darkAudit.summary.missingDarkVariants} > ${args.maxDarkMissing}`);
    report.thresholds = { minSemantic: Number.isFinite(args.minSemantic) ? args.minSemantic : null, minExpressible: Number.isFinite(args.minExpressible) ? args.minExpressible : null, maxManual: Number.isFinite(args.maxManual) ? args.maxManual : null, maxOrder: Number.isFinite(args.maxOrder) ? args.maxOrder : null, maxDarkMissing: Number.isFinite(args.maxDarkMissing) ? args.maxDarkMissing : null, manualRatio, orderCount, passed: thresholdReasons.length === 0, failures: thresholdReasons };
    const thresholdFailed = thresholdReasons.length > 0;
    const content = args.format === 'markdown' ? formatMigrationReport(report) : `${JSON.stringify(report, null, 2)}\n`;
    if (args.output) {
        const output = path.resolve(root, args.output);
        if (report.darkAudit) {
            const canonical = file => {
                const resolved = fs.existsSync(file) ? fs.realpathSync(file) : path.resolve(file);
                return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
            };
            const target = canonical(output);
            if (report.darkAudit.files.some(file => canonical(file.source) === target)) throw new Error('--output must differ from dark-audit source files.');
        }
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.writeFileSync(output, content, 'utf8');
        report.output = output;
    } else process.stdout.write(content);
    return { ok: !thresholdFailed, thresholdFailed, report };
}

if (require.main === module) {
    try {
        const result = main();
        if (result.thresholdFailed) process.exitCode = 2;
    } catch (error) {
        console.error(`[JquanUI migrate] ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { VERSION, auditCss, auditCssFiles, auditClassFiles, auditDarkSource, auditDarkFiles, collectCssFiles, collectSourceFiles, formatMigrationReport, normalizeMigrationConfig, parseCss, sortClassTokens, suggestAtomicClass, main };
