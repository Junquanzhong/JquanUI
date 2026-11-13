#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const corePath = process.env.JQUAN_CORE_PATH
  ? path.resolve(root, process.env.JQUAN_CORE_PATH)
  : path.join(root, 'dist/core/JquanUI@Core.js');
const isArchiveCore = /v?4\.5/i.test(corePath);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createRuntime(config = {}, options = {}) {
    const styleElements = [];
    const nodes = options.nodes || [];
    const documentListeners = {};
    const dispatchedEvents = [];
    const rootClasses = new Set();
    const rootAttributes = {};
    const storage = options.storage || new Map();
  let observerStarts = 0;
  let observerCallback = null;
    const observerRecords = [];
    const rootNode = {
        nodeType: 1,
        getAttribute(name) {
            return name === 'class' ? (options.rootClass || 'block flex') : (rootAttributes[name] || '');
        },
        setAttribute(name, value) {
            rootAttributes[name] = String(value);
        },
        classList: {
            add(...names) {
                names.forEach(name => rootClasses.add(name));
            }
        },
        querySelectorAll(selector) {
            return selector === '[class]' ? nodes : [];
        }
  };

  function createStyleElement() {
    const element = {
      id: '',
      _textContent: '',
      sheet: {
        cssRules: [],
        insertRule(rule, index = this.cssRules.length) {
          if (String(rule).trim().match(/}\s*(?:\.|@|[a-z])/i)) {
            throw new Error('insertRule received multiple top-level rules');
          }
          const position = Math.max(0, Math.min(Number(index) || 0, this.cssRules.length));
          this.cssRules.splice(position, 0, rule);
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

  class FakeCSSStyleSheet {
    constructor() { this.cssRules = []; }
    replaceSync(value) { this.cssRules = value ? [String(value)] : []; }
    insertRule(rule, index = this.cssRules.length) {
      const position = Math.max(0, Math.min(Number(index) || 0, this.cssRules.length));
      this.cssRules.splice(position, 0, rule);
    }
  }

  const initialConfig = options.omitConfig ? undefined : config;
  const context = {
    window: {},
    JQUAN_CONFIG: initialConfig,
    document: {
      readyState: options.readyState || 'complete',
      documentElement: rootNode,
      head: { appendChild: () => {} },
      createElement: createStyleElement,
      querySelector: () => null,
      querySelectorAll: selector => rootNode.querySelectorAll(selector),
      currentScript: null,
      addEventListener(name, callback) {
        documentListeners[name] = callback;
      },
      dispatchEvent(event) {
        dispatchedEvents.push(event);
        return true;
      }
    },
    console: { log: () => {}, warn: () => {}, error: () => {} },
    localStorage: {
      getItem: key => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    },
    setTimeout: cb => { cb(); return 1; },
    clearTimeout: () => {},
    requestAnimationFrame: cb => { cb(); return 1; },
    cancelAnimationFrame: () => {},
    CSSStyleSheet: options.constructable ? FakeCSSStyleSheet : undefined,
    MutationObserver: function MutationObserver(callback) {
      this.callback = callback;
      this.root = null;
      this.disconnected = false;
      this.observe = root => {
        this.root = root;
        observerStarts++;
        observerRecords.push(this);
        if (root === rootNode) observerCallback = callback;
      };
      this.disconnect = () => { this.disconnected = true; };
    },
    CustomEvent: function CustomEvent(type, init) {
      this.type = type;
      this.detail = init && init.detail;
    }
  };
  context.window = context;
  if (options.constructable) context.document.adoptedStyleSheets = [];
  context.window.JQUAN_CONFIG = initialConfig;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(corePath, 'utf8'), context, { filename: corePath });
  return {
    api: context.window.JquanUI,
    styleElements,
    documentListeners,
    dispatchedEvents,
    rootClasses,
    rootAttributes,
    storage,
    observerStarts,
    observerRecords,
    get observerCallback() { return observerCallback; },
    context
  };
}

const containerRuntime = createRuntime();
const initialDebugReport = containerRuntime.api.debug();
if (!isArchiveCore) {
  const scansBeforeMetrics = initialDebugReport.scans;
  const initialMetrics = containerRuntime.api.getMetrics();
  assert(initialMetrics && initialMetrics.totalResolves >= 0, 'getMetrics should expose a read-only runtime snapshot');
  assert(initialMetrics.scans === scansBeforeMetrics, 'getMetrics should not trigger a new scan');
  assert(initialMetrics.processedClassCount === initialDebugReport.processedClassCount, 'getMetrics and debug should share processed class counts');
  assert(initialMetrics.performance && Array.isArray(initialMetrics.performance.warnings), 'getMetrics should expose performance budget data');
  initialMetrics.totalResolves = -1;
  assert(containerRuntime.api.getMetrics().totalResolves >= 0, 'getMetrics should return an independent snapshot');
}
assert(initialDebugReport.performance && Array.isArray(initialDebugReport.performance.warnings), 'debug report should expose performance diagnostics');
assert(typeof initialDebugReport.performance.lastScanMs === 'number', 'debug report should expose scan timing');
assert(typeof initialDebugReport.performance.resolveCount === 'number', 'debug report should expose resolve count');
const containerRule = containerRuntime.api.resolve('container').css;
assert(containerRule.includes('max-width: 640px'), '.container should use the sm viewport breakpoint');
assert(containerRule.includes('max-width: 1536px'), '.container should use the 2xl viewport breakpoint');
assert(!containerRule.includes('max-width: 24rem'), '.container must not use container-query thresholds');

const modernLayoutRuntime = createRuntime();
const modernLayoutCases = {
  'scrollbar-gutter-stable-both-edges': 'scrollbar-gutter: stable both-edges',
  'overflow-anchor-none': 'overflow-anchor: none',
  'content-visibility-auto': 'content-visibility: auto',
  'contain-inline-size': 'contain: inline-size',
  'image-rendering-pixelated': 'image-rendering: pixelated',
  'view-transition-name-none': 'view-transition-name: none',
  'view-transition-group-nearest': 'view-transition-group: nearest',
  'view-transition-types-[--slide]': 'view-transition-types: --slide',
  'forced-color-adjust-none': 'forced-color-adjust: none',
  'animation-timeline-[--scroll]': 'animation-timeline: --scroll',
  'scroll-timeline-axis-[block]': 'scroll-timeline-axis: block',
  'offset-rotate-reverse': 'offset-rotate: reverse',
  'decoration-skip-ink-all': 'text-decoration-skip-ink: all'
};
for (const [utility, declaration] of Object.entries(modernLayoutCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}
const anchorRule = modernLayoutRuntime.api.resolve('anchor-name-[--tooltip]');
assert(anchorRule && anchorRule.css.includes('anchor-name: --tooltip'), 'anchor-name arbitrary values should resolve');
const modernAnchorCases = {
  'anchor-scope-none': 'anchor-scope: none',
  'position-area-top-span-left': 'position-area: top span-left',
  'position-try-order-most-width': 'position-try-order: most-width',
  'position-visibility-no-overflow': 'position-visibility: no-overflow'
};
for (const [utility, declaration] of Object.entries(modernAnchorCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}
const arbitraryAnchorRule = modernLayoutRuntime.api.resolve('position-area-[top_span-right]');
assert(arbitraryAnchorRule && arbitraryAnchorRule.css.includes('position-area: top span-right'), 'position-area arbitrary values should resolve');

const modernTypographyCases = {
  'text-autospace-ideograph-alpha': 'text-autospace: ideograph-alpha',
  'text-spacing-trim-space-first': 'text-spacing-trim: space-first',
  'hyphenate-character-none': 'hyphenate-character: none',
  'ruby-position-under': 'ruby-position: under',
  'font-kerning-none': 'font-kerning: none',
  'font-optical-sizing-auto': 'font-optical-sizing: auto',
  'font-palette-dark': 'font-palette: dark',
  'font-synthesis-small-caps': 'font-synthesis: small-caps',
  'mask-composite-exclude': '-webkit-mask-composite: exclude',
  'mask-type-luminance': 'mask-type: luminance',
  'mask-origin-content': '-webkit-mask-origin: content-box',
  'paint-order-stroke': 'paint-order: stroke',
  'fill-rule-evenodd': 'fill-rule: evenodd',
  'clip-rule-nonzero': 'clip-rule: nonzero',
  'vector-effect-non-scaling-stroke': 'vector-effect: non-scaling-stroke'
};
for (const [utility, declaration] of Object.entries(modernTypographyCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}
const typographyCompositionCases = {
  'text-shadow-sm': 'text-shadow: 0 1px 2px rgb(0 0 0 / 0.15)',
  'text-shadow-none': 'text-shadow: none',
  'text-shadow-[0_2px_4px_rgb(0_0_0_/_0.2)]': 'text-shadow: 0 2px 4px rgb(0 0 0 / 0.2)',
  'font-[700_1rem/1.5_sans-serif]': 'font: 700 1rem/1.5 sans-serif'
};
for (const [utility, declaration] of Object.entries(typographyCompositionCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const typographySurfaceCases = {
  'font-variant-ligatures-common': 'font-variant-ligatures: common-ligatures',
  'font-variant-position-super': 'font-variant-position: super',
  'font-variant-east-asian-jis78': 'font-variant-east-asian: jis78',
  'text-rendering-optimize-legibility': 'text-rendering: optimizeLegibility',
  'text-orientation-upright': 'text-orientation: upright',
  'white-space-collapse-preserve': 'white-space-collapse: preserve',
  'scrollbar-color-auto': 'scrollbar-color: auto',
  'image-orientation-from-image': 'image-orientation: from-image',
  'border-image-repeat-round': 'border-image-repeat: round',
  'empty-cells-hide': 'empty-cells: hide',
  'tab-size-[4]': 'tab-size: 4'
};
for (const [utility, declaration] of Object.entries(typographySurfaceCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const printLayoutCases = {
  'page-break-before-always': 'page-break-before: always',
  'page-break-after-avoid': 'page-break-after: avoid',
  'page-break-inside-avoid': 'page-break-inside: avoid',
  'orphans-[3]': 'orphans: 3',
  'widows-[3]': 'widows: 3'
};
for (const [utility, declaration] of Object.entries(printLayoutCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const layoutTypographyCases = {
  'is-[20rem]': 'inline-size: 20rem',
  'min-is-[12rem]': 'min-inline-size: 12rem',
  'bs-[10rem]': 'block-size: 10rem',
  'break-anywhere': 'overflow-wrap: anywhere',
  'break-auto-phrase': 'word-break: auto-phrase',
  'line-break-strict': 'line-break: strict',
  'underline-position-under': 'text-underline-position: under',
  'resize-inline': 'resize: inline',
  'resize-block': 'resize: block'
};
for (const [utility, declaration] of Object.entries(layoutTypographyCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const svgSurfaceCases = {
  'shape-rendering-crisp-edges': 'shape-rendering: crispEdges',
  'color-rendering-optimize-speed': 'color-rendering: optimizeSpeed',
  'color-interpolation-srgb': 'color-interpolation: sRGB',
  'color-interpolation-filters-linear-rgb': 'color-interpolation-filters: linearRGB',
  'text-anchor-middle': 'text-anchor: middle',
  'dominant-baseline-central': 'dominant-baseline: central',
  'baseline-shift-super': 'baseline-shift: super',
  'marker-end-none': 'marker-end: none'
};
for (const [utility, declaration] of Object.entries(svgSurfaceCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const mediaAccessibilityCases = {
  'font-size-adjust-none': 'font-size-adjust: none',
  'font-size-adjust-from-font': 'font-size-adjust: from-font',
  'overflow-clip-margin-content': 'overflow-clip-margin: content-box',
  'overflow-clip-margin-border': 'overflow-clip-margin: border-box',
  'overflow-clip-margin-[12px]': 'overflow-clip-margin: 12px'
};
for (const [utility, declaration] of Object.entries(mediaAccessibilityCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const logicalScrollTextCases = {
  'scroll-mi-[1rem]': 'scroll-margin-inline: 1rem',
  'scroll-mbs-[2rem]': 'scroll-margin-block-start: 2rem',
  'scroll-pi-[1rem]': 'scroll-padding-inline: 1rem',
  'scroll-pbe-[2rem]': 'scroll-padding-block-end: 2rem',
  'emphasis-dot': 'text-emphasis-style: dot',
  'emphasis-position-under': 'text-emphasis-position: under',
  'emphasis-color-current': 'text-emphasis-color: currentColor'
};
for (const [utility, declaration] of Object.entries(logicalScrollTextCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const logicalBorderImageCases = {
  'border-bs-w-[1px]': 'border-block-start-width: 1px',
  'border-be-w-2': 'border-block-end-width: 2px',
  'border-bs-[red]': 'border-block-start-color: red',
  'border-be-dashed': 'border-block-end-style: dashed',
  'image-resolution-from-image': 'image-resolution: from-image',
  'image-resolution-snap': 'image-resolution: snap'
};
for (const [utility, declaration] of Object.entries(logicalBorderImageCases)) {
  const rule = modernLayoutRuntime.api.resolve(utility);
  assert(rule && rule.css.includes(declaration), `${utility} should resolve to ${declaration}`);
}

const lateConfigRuntime = createRuntime({}, { omitConfig: true, rootClass: 'border-primary/10' });
lateConfigRuntime.context.window.JQUAN_CONFIG = {
  theme: { extend: { colors: { primary: 'rgb(99 102 241)' } } }
};
const lateThemeRule = lateConfigRuntime.api.resolve('border-primary/10');
assert(lateThemeRule && lateThemeRule.css.includes('rgba(99, 102, 241, 0.1)'), 'late theme config should restore border-primary/10');
const lateThemeStyle = lateConfigRuntime.styleElements.find(element => element.id === 'jquan-css-theme-vars');
assert(lateThemeStyle && lateThemeStyle.textContent.includes('--primary: 99 102 241'), 'late theme config should rebuild theme variables');
const modernColorRuntime = createRuntime({
  theme: {
    extend: {
      colors: {
        brand: 'oklch(62% 0.2 250)',
        wide: 'color(display-p3 0.9 0.2 0.4)',
        translucent: 'rgb(12 34 56 / 0.7)',
        adaptive: 'light-dark(#ffffff, #030303)'
      }
    },
    semantic: {
      accent: { light: 'brand', dark: 'wide' }
    }
  }
});
const modernBrandRule = modernColorRuntime.api.resolve('bg-brand');
assert(modernBrandRule && modernBrandRule.css.includes('background-color: oklch(62% 0.2 250)'), 'OKLCH theme colors should remain complete CSS colors');
const modernBrandAlphaRule = modernColorRuntime.api.resolve('bg-brand/20');
assert(modernBrandAlphaRule && modernBrandAlphaRule.css.includes('color-mix(in oklch, oklch(62% 0.2 250) 20%, transparent)'), 'modern theme colors should preserve their color space when applying opacity');
const wideGamutRule = modernColorRuntime.api.resolve('text-wide/50');
assert(wideGamutRule && wideGamutRule.css.includes('color-mix(in display-p3, color(display-p3 0.9 0.2 0.4) 50%, transparent)'), 'Display P3 theme colors should preserve their color space when applying opacity');
const translucentRule = modernColorRuntime.api.resolve('bg-translucent');
assert(translucentRule && translucentRule.css.includes('rgb(12 34 56 / 0.7)'), 'RGB colors with native alpha should not be reduced to invalid channels');
const adaptiveRule = modernColorRuntime.api.resolve('border-adaptive/30');
assert(adaptiveRule && adaptiveRule.css.includes('light-dark(#ffffff, #030303)'), 'light-dark theme colors should compose with opacity suffixes');
const semanticModernRule = modernColorRuntime.api.resolve('bg-accent/15');
assert(semanticModernRule && semanticModernRule.css.includes('color-mix(in srgb, var(--color-accent-css) 15%, transparent)'), 'semantic modern colors should use complete-color variables');
const modernThemeStyle = modernColorRuntime.styleElements.find(element => element.id === 'jquan-css-theme-vars');
assert(modernThemeStyle && modernThemeStyle.textContent.includes('--color-accent-css: oklch(62% 0.2 250)'), 'semantic themes should emit complete modern-color variables');
const darkMappingRuntime = createRuntime({
  darkMapping: { enabled: true, map: { white: 'surface', 'slate-700': 'text', 'slate-200': 'border' } },
  theme: { semantic: {
    surface: { light: 'white', dark: 'slate-900' },
    text: { light: 'slate-700', dark: 'slate-100' },
    border: { light: 'slate-200', dark: 'slate-700' }
  } }
});
const mappedBackground = darkMappingRuntime.api.resolve('bg-white/90');
assert(mappedBackground && mappedBackground.css.includes('.bg-white\\/90:where(.dark, .dark *)'), 'dark mapping should add a class-mode override');
assert(mappedBackground.css.includes('@media (prefers-color-scheme: dark)'), 'dark mapping should add a system-mode override');
assert(mappedBackground.css.includes('var(--color-surface-css)') && mappedBackground.css.includes('90%'), 'dark mapping should preserve semantic role and opacity');
const mappedText = darkMappingRuntime.api.resolve('hover:text-slate-700');
assert(mappedText && mappedText.css.includes('.hover\\:text-slate-700:where(.dark, .dark *):hover'), 'dark mapping should retain state variants');
const explicitDark = darkMappingRuntime.api.resolve('dark:bg-white');
assert(explicitDark && !explicitDark.css.includes('var(--color-surface-css)'), 'explicit dark variants should not receive a duplicate automatic override');
const disabledMapping = createRuntime({ theme: { semantic: { surface: { light: 'white', dark: 'slate-900' } } } });
const disabledRule = disabledMapping.api.resolve('bg-white');
assert(disabledRule && !disabledRule.css.includes('var(--color-surface-css)'), 'dark mapping must remain opt-in');
const collisionMapping = createRuntime({
  darkMapping: { enabled: true, map: { md: 'text', 'toString': 'surface', white: 'missing' } },
  theme: { extend: { colors: { md: '#ff0000', toString: '#00ff00' } }, semantic: { text: { light: 'black', dark: 'white' } } }
});
assert(!collisionMapping.api.resolve('text-md').css.includes('color:'), 'mapping must not reinterpret a font-size alias as text color');
assert(!collisionMapping.api.resolve('bg-white').css.includes(':where'), 'missing semantic roles must not generate mapping rules');
assert(!collisionMapping.api.resolve('bg-toString').css.includes(':where'), 'inherited object properties must not become semantic roles');
for (const utility of ['print:block', 'motion-reduce:block', 'light:block', 'dark-media:bg-red-500']) {
  const result = darkMappingRuntime.api.resolve(utility);
  assert(result && result.css.startsWith('@media '), `${utility} must wrap a media rule rather than append it to a selector`);
}
const mappedPlaceholder = darkMappingRuntime.api.resolve('placeholder:text-slate-700');
assert(mappedPlaceholder.css.includes(':where(.dark, .dark *)::placeholder'), 'mapped placeholder variant must preserve its pseudo-element');
const mappedContainer = darkMappingRuntime.api.resolve('@sm:bg-white');
assert(mappedContainer.css.includes('@container (min-width: 24rem)'), 'mapped container rule must keep its container condition');
const cacheStorage = new Map();
createRuntime({}, { storage: cacheStorage, rootClass: 'bg-white' });
const cacheKey = Array.from(cacheStorage.keys())[0];
const previousCache = JSON.parse(cacheStorage.get(cacheKey));
delete previousCache.format;
cacheStorage.set(cacheKey, JSON.stringify(previousCache));
assert(createRuntime({}, { storage: cacheStorage }).api.getMetrics().cacheHydrate === 'invalid', 'a pre-fix rule cache must invalidate without a package version change');
const modernShadowColorRule = modernColorRuntime.api.resolve('shadow-brand');
assert(modernShadowColorRule && modernShadowColorRule.css.includes('--jquan-shadow-color-css: oklch(62% 0.2 250)'), 'modern shadow colors should use the complete-color shadow variable');
const modernShadowRule = modernColorRuntime.api.resolve('shadow-md');
assert(modernShadowRule && modernShadowRule.css.includes('color-mix(in srgb, var(--jquan-shadow-color-css'), 'shadow utilities should emit a modern-color override');
assert((modernShadowRule.css.match(/--jquan-shadow:/g) || []).length === 2, 'shadow utilities should retain a legacy declaration before the modern override');
const arbitraryShadowRule = modernColorRuntime.api.resolve('shadow-[0_8px_30px_rgb(0_0_0_/_0.2)]');
assert(arbitraryShadowRule && (arbitraryShadowRule.css.match(/--jquan-shadow:/g) || []).length === 2, 'arbitrary shadows should use the dual shadow declaration pipeline');
assert(arbitraryShadowRule.css.includes('box-shadow: var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow)'), 'arbitrary shadows should preserve ring and shadow composition');
const modernRingRule = modernColorRuntime.api.resolve('ring-brand');
assert(modernRingRule && modernRingRule.css.includes('--jquan-ring-color: oklch(62% 0.2 250)'), 'ring colors should accept modern CSS colors');
const modernRingOffsetRule = modernColorRuntime.api.resolve('ring-offset-wide');
assert(modernRingOffsetRule && modernRingOffsetRule.css.includes('--jquan-ring-offset-color: color(display-p3 0.9 0.2 0.4)'), 'ring offsets should accept modern CSS colors');
const ringWidthRule = modernColorRuntime.api.resolve('ring-2');
assert(ringWidthRule && ringWidthRule.css.includes('--jquan-ring-width: 2px'), 'ring width values should remain distinct from ring colors');
const hex8Runtime = createRuntime({ theme: { extend: { colors: { alphaBrand: '#11223344' } } } });
const hex8ShadowRule = hex8Runtime.api.resolve('shadow-alphaBrand');
assert(hex8ShadowRule && hex8ShadowRule.css.includes('--jquan-shadow-color: 17 34 51'), '8-digit HEX colors should expose RGB channels to shadow composition');
assert(hex8ShadowRule.css.includes('--jquan-shadow-color-css: #11223344'), '8-digit HEX colors should retain the original alpha-bearing CSS color');

const pseudoRuntime = createRuntime();
const borderGradientRule = pseudoRuntime.api.resolve('border-gradient-to-r');
assert(borderGradientRule && borderGradientRule.css.includes('::after'), 'border gradient should generate an exact pseudo-element rule');
assert(!borderGradientRule.css.includes('[class*='), 'border gradient should not use a substring selector');
const ringGradientRule = pseudoRuntime.api.resolve('ring-gradient-to-r');
assert(ringGradientRule && ringGradientRule.css.includes('--jquan-ring-width'), 'ring gradient should use the shared ring width variable');
assert(!ringGradientRule.css.includes('[class*='), 'ring gradient should not use a substring selector');
const beforePositionRule = pseudoRuntime.api.resolve('before:absolute');
assert(beforePositionRule && beforePositionRule.css.includes('::before'), 'before variant should target ::before');
assert(beforePositionRule.css.includes('content: var(--jquan-content, "")'), 'before utilities should create the pseudo-element automatically');
const afterContentRule = pseudoRuntime.api.resolve('after:content-["New"]');
assert(afterContentRule && afterContentRule.css.includes('--jquan-content: "New"'), 'arbitrary pseudo content should set the shared content variable');
assert(afterContentRule.css.includes('content: var(--jquan-content)'), 'arbitrary pseudo content should consume the shared content variable');
const noContentRule = pseudoRuntime.api.resolve('before:content-none');
assert(noContentRule && noContentRule.css.includes('--jquan-content: none'), 'content-none should explicitly suppress generated content');
const dataStateRule = pseudoRuntime.api.resolve('data-[state=open]:block');
assert(dataStateRule && dataStateRule.css.includes('[data-state=open]'), 'data attribute variants should support exact state matching');
const ariaStateRule = pseudoRuntime.api.resolve('aria-expanded:hidden');
assert(ariaStateRule && ariaStateRule.css.includes('[aria-expanded="true"]'), 'aria shorthand variants should match the true state');
const groupDataRule = pseudoRuntime.api.resolve('group-data-[state=open]:rotate-180');
assert(groupDataRule && groupDataRule.css.includes('.group[data-state=open]'), 'group data variants should target stateful ancestors');
const scrollbarRule = pseudoRuntime.api.resolve('scrollbar-thumb:bg-blue-500/50');
assert(scrollbarRule && scrollbarRule.css.includes('::-webkit-scrollbar-thumb'), 'scrollbar pseudo-element variants should be available without custom CSS');
const dataUrlRule = pseudoRuntime.api.resolve("bg-[url('data:image/svg+xml;base64,AAAA')]");
assert(dataUrlRule && dataUrlRule.css.includes("background-image: url('data:image/svg+xml;base64,AAAA')"), 'data URL arbitrary values must preserve embedded semicolons');
assert(pseudoRuntime.api.resolve('[color:expression(alert(1))]') === null, 'legacy CSS expression syntax must be rejected');
assert(pseudoRuntime.api.resolve('[-moz-binding:url(http://example.test)]') === null, 'legacy moz binding syntax must be rejected');
assert(pseudoRuntime.api.resolve('[behavior:url(#default#xss)]') === null, 'legacy behavior syntax must be rejected');
assert(pseudoRuntime.api.resolve('bg-[url(javascript:alert(1))]') === null, 'javascript URLs must be rejected from arbitrary values');
assert(pseudoRuntime.api.resolve('text-red-500/[0.1.2]') === null, 'malformed alpha fractions must be rejected');
const semanticMediumTextRule = pseudoRuntime.api.resolve('text-md');
assert(semanticMediumTextRule && semanticMediumTextRule.css.includes('font-size: 1rem'), 'text-md should provide the semantic 16px font-size alias');
const maxBreakpointRule = pseudoRuntime.api.resolve('max-[760px]:hidden');
assert(maxBreakpointRule && maxBreakpointRule.css.includes('@media (width < 760px)'), 'arbitrary max breakpoints should generate range media queries');
const configuredMaxBreakpointRuntime = createRuntime({ theme: { extend: { breakpoints: { tablet: '761px' } } } });
const configuredMaxBreakpointRule = configuredMaxBreakpointRuntime.api.resolve('max-tablet:block');
assert(configuredMaxBreakpointRule && configuredMaxBreakpointRule.css.includes('@media (width < 761px)'), 'max-* variants should resolve configured breakpoints');
const languageRule = pseudoRuntime.api.resolve('lang-en:text-sm');
assert(languageRule && languageRule.css.includes(':lang(en)'), 'lang-* variants should use inherited CSS language matching');
const negatedLanguageRule = pseudoRuntime.api.resolve('not-lang-en:hidden');
assert(negatedLanguageRule && negatedLanguageRule.css.includes(':not(:lang(en))'), 'not-lang-* variants should target other inherited languages');
const regionalLanguageRule = pseudoRuntime.api.resolve('lang-[en-US]:text-lg');
assert(regionalLanguageRule && regionalLanguageRule.css.includes(':lang(en-US)'), 'lang-* variants should accept regional BCP 47 language tags');
assert(pseudoRuntime.api.resolve('lang-[en_US]:text-lg') === null, 'lang-* variants should reject invalid language ranges');
const popoverOpenRule = pseudoRuntime.api.resolve('popover-open:opacity-100');
assert(popoverOpenRule && popoverOpenRule.css.includes(':popover-open'), 'popover-open should target native popover state');
const modalRule = pseudoRuntime.api.resolve('modal:flex');
assert(modalRule && modalRule.css.includes(':modal'), 'modal should target modal dialogs');
const inertRule = pseudoRuntime.api.resolve('inert:opacity-50');
assert(inertRule && inertRule.css.includes('[inert]'), 'inert should target inert elements');
const userInvalidRule = pseudoRuntime.api.resolve('user-invalid:border-red-500');
assert(userInvalidRule && userInvalidRule.css.includes(':user-invalid'), 'user-invalid should target user-interacted invalid controls');
const startingStyleRule = pseudoRuntime.api.resolve('starting:opacity-0');
assert(startingStyleRule && startingStyleRule.css.includes('@starting-style'), 'starting should generate @starting-style rules');
const safeBottomRule = pseudoRuntime.api.resolve('pb-safe');
assert(safeBottomRule && safeBottomRule.css.includes('padding-bottom: env(safe-area-inset-bottom, 0px)'), 'pb-safe should apply the bottom safe-area inset');
const safeBottomOffsetRule = pseudoRuntime.api.resolve('pb-safe-4');
assert(safeBottomOffsetRule && safeBottomOffsetRule.css.includes('calc(env(safe-area-inset-bottom, 0px) + 1rem)'), 'pb-safe-* should add semantic spacing to the safe-area inset');
const safeInlineRule = pseudoRuntime.api.resolve('px-safe-2');
assert(safeInlineRule && safeInlineRule.css.includes('padding-left: calc(env(safe-area-inset-left, 0px) + 0.5rem)'), 'px-safe-* should compose the left safe-area inset');
assert(safeInlineRule.css.includes('padding-right: calc(env(safe-area-inset-right, 0px) + 0.5rem)'), 'px-safe-* should compose the right safe-area inset');
const safeInsetRule = pseudoRuntime.api.resolve('inset-safe');
assert(safeInsetRule && safeInsetRule.css.includes('top: env(safe-area-inset-top, 0px)'), 'inset-safe should expose all four safe-area offsets');
const fieldSizingRule = pseudoRuntime.api.resolve('field-sizing-content');
assert(fieldSizingRule && fieldSizingRule.css.includes('field-sizing: content'), 'field-sizing-content should resolve modern intrinsic form sizing');
const colorSchemeRule = pseudoRuntime.api.resolve('color-scheme-dark');
assert(colorSchemeRule && colorSchemeRule.css.includes('color-scheme: dark'), 'color-scheme-dark should resolve native theme controls');
const caretRule = pseudoRuntime.api.resolve('caret-current');
assert(caretRule && caretRule.css.includes('caret-color: currentColor'), 'caret-current should resolve caret color');
const textWrapStableRule = pseudoRuntime.api.resolve('text-wrap-stable');
assert(textWrapStableRule && textWrapStableRule.css.includes('text-wrap: stable'), 'text-wrap-stable should resolve modern wrapping');
const textBoxRule = pseudoRuntime.api.resolve('text-box-trim-both');
assert(textBoxRule && textBoxRule.css.includes('text-box-trim: trim-both'), 'text-box-trim-both should resolve typography metrics');
const interpolateRule = pseudoRuntime.api.resolve('interpolate-size-allow-keywords');
assert(interpolateRule && interpolateRule.css.includes('interpolate-size: allow-keywords'), 'interpolate-size should resolve intrinsic size animation');
const decorationBreakRule = pseudoRuntime.api.resolve('box-decoration-clone');
assert(decorationBreakRule && decorationBreakRule.css.includes('box-decoration-break: clone'), 'box-decoration-clone should resolve fragmented decoration behavior');
const pointerRule = pseudoRuntime.api.resolve('pointer-fine:block');
assert(pointerRule && pointerRule.css.includes('@media (pointer: fine)'), 'pointer capability variants should generate media queries');
const supportsRule = pseudoRuntime.api.resolve('supports-[display:grid]:grid');
assert(supportsRule && supportsRule.css.includes('@supports (display:grid)'), 'supports-[...] should generate feature queries');
const arbitraryMediaRule = pseudoRuntime.api.resolve('[@media(max-width:760px)]:hidden');
assert(arbitraryMediaRule && arbitraryMediaRule.css.includes('@media (max-width:760px)'), 'arbitrary @media variants should generate at-rules');
const arbitrarySupportsRule = pseudoRuntime.api.resolve('[@supports(backdrop-filter:blur(1px))]:backdrop-blur-sm');
assert(arbitrarySupportsRule && arbitrarySupportsRule.css.includes('@supports (backdrop-filter:blur(1px))'), 'arbitrary @supports variants should preserve nested functions');
const ancestorSelectorRule = pseudoRuntime.api.resolve('[.scrolled_&]:bg-black');
assert(ancestorSelectorRule && ancestorSelectorRule.css.includes('.scrolled .\\[\\.scrolled_\\&\\]\\:bg-black'), 'arbitrary selector variants should support ancestor state selectors');
const configuredAnimationRuntime = createRuntime({
  theme: {
    extend: {
      keyframes: {
        'brand-reveal': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'brand-reveal': 'brand-reveal 600ms ease both'
      }
    }
  }
});
const configuredAnimationRule = configuredAnimationRuntime.api.resolve('animate-brand-reveal');
assert(configuredAnimationRule && configuredAnimationRule.css.includes('animation: brand-reveal 600ms ease both'), 'configured animation utilities should resolve');
const configuredAnimationStyle = configuredAnimationRuntime.styleElements.find(element => element.id === 'jquan-css-runtime');
assert(configuredAnimationStyle && configuredAnimationStyle.textContent.includes('@keyframes brand-reveal'), 'configured keyframes should be injected into base CSS');
assert(configuredAnimationStyle.textContent.includes('transform: translateY(12px)'), 'configured keyframes should serialize declaration objects');
const fluidRuntime = createRuntime({
  theme: {
    extend: {
      fluid: {
        spacing: {
          section: ['3rem', '6vw', '6rem'],
          frame: { min: '18rem', preferred: '80vw', max: '72rem' },
          direct: 'clamp(1rem, 4vw, 3rem)',
          broken: ['1rem', '2rem'],
          unsafe: ['1rem', '2vw; color:red', '3rem']
        },
        fontSize: {
          display: { min: '2.25rem', preferred: '6vw', max: '4.5rem', lineHeight: '1.05' },
          lead: ['1.125rem', '2vw', '1.5rem'],
          broken: { min: '1rem', preferred: '', max: '2rem' }
        }
      }
    }
  }
});
const fluidPaddingRule = fluidRuntime.api.resolve('py-fluid-section');
assert(fluidPaddingRule && fluidPaddingRule.css.includes('padding-top: clamp(3rem, 6vw, 6rem)'), 'fluid spacing should resolve through spacing utilities');
const fluidHeightRule = fluidRuntime.api.resolve('h-fluid-frame');
assert(fluidHeightRule && fluidHeightRule.css.includes('height: clamp(18rem, 80vw, 72rem)'), 'fluid spacing should resolve through height utilities');
const fluidMaxWidthRule = fluidRuntime.api.resolve('max-w-fluid-frame');
assert(fluidMaxWidthRule && fluidMaxWidthRule.css.includes('max-width: clamp(18rem, 80vw, 72rem)'), 'fluid spacing should resolve through max-width utilities');
const fluidSafeAreaRule = fluidRuntime.api.resolve('pb-safe-fluid-direct');
assert(fluidSafeAreaRule && fluidSafeAreaRule.css.includes('clamp(1rem, 4vw, 3rem)'), 'fluid spacing should compose with safe-area offsets');
const fluidDisplayRule = fluidRuntime.api.resolve('text-fluid-display');
assert(fluidDisplayRule && fluidDisplayRule.css.includes('font-size: clamp(2.25rem, 6vw, 4.5rem)'), 'fluid font sizes should resolve');
assert(fluidDisplayRule.css.includes('line-height: 1.05'), 'fluid font sizes should preserve configured line height');
assert(fluidRuntime.api.resolve('text-fluid-lead').css.includes('font-size: clamp(1.125rem, 2vw, 1.5rem)'), 'fluid font size arrays should resolve');
assert(fluidRuntime.api.resolve('p-fluid-broken') === null, 'malformed fluid spacing arrays should be rejected');
assert(fluidRuntime.api.resolve('p-fluid-unsafe') === null, 'unsafe fluid spacing declarations should be rejected');
assert(fluidRuntime.api.resolve('text-fluid-broken') === null, 'malformed fluid font sizes should be rejected');
const extractor = require('../dist/cli/jquan-extract.cjs');
for (const source of ['<div class="p-4 pt-2"></div>', '<div class="pt-2 p-4"></div>']) {
  const ordered = extractor.extractFromSource(source, { core: corePath }).css;
  assert(ordered.indexOf('.p-4 {') < ordered.indexOf('.pt-2 {'), 'spacing utility output must use canonical order independent of class order');
}
const extractedAnimation = extractor.extractFromSource('<div class="animate-brand-reveal"></div>', {
  core: corePath,
  config: {
    theme: {
      extend: {
        keyframes: { 'brand-reveal': { from: { opacity: '0' }, to: { opacity: '1' } } },
        animation: { 'brand-reveal': 'brand-reveal 600ms ease both' }
      }
    }
  }
});
assert(extractedAnimation.css.includes('@keyframes brand-reveal'), 'build-time extraction should include configured keyframes');
assert(extractedAnimation.css.includes('animation: brand-reveal 600ms ease both'), 'build-time extraction should include configured animation utilities');
const extractedFluid = extractor.extractFromSource('<section class="py-fluid-section"><h1 class="text-fluid-display"></h1></section>', {
  core: corePath,
  config: {
    theme: {
      extend: {
        fluid: {
          spacing: { section: ['3rem', '6vw', '6rem'] },
          fontSize: { display: { min: '2.25rem', preferred: '6vw', max: '4.5rem', lineHeight: '1.05' } }
        }
      }
    }
  }
});
assert(extractedFluid.css.includes('padding-top: clamp(3rem, 6vw, 6rem)'), 'build-time extraction should include fluid spacing');
assert(extractedFluid.css.includes('font-size: clamp(2.25rem, 6vw, 4.5rem)'), 'build-time extraction should include fluid typography');
const extractedPlatformUtilities = extractor.extractFromSource('<dialog class="starting:opacity-0 modal:flex pb-safe-4"></dialog>', { core: corePath });
assert(extractedPlatformUtilities.css.includes('@starting-style'), 'build-time extraction should include @starting-style variants');
assert(extractedPlatformUtilities.css.includes(':modal'), 'build-time extraction should include native state variants');
assert(extractedPlatformUtilities.css.includes('safe-area-inset-bottom'), 'build-time extraction should include safe-area utilities');
const layeredRuntime = createRuntime({
  cascadeLayers: true,
  theme: { semantic: { primary: { light: 'blue-600', dark: 'blue-300' } } }
});
const layeredThemeStyle = layeredRuntime.styleElements.find(element => element.id === 'jquan-css-theme-vars');
const layeredRuntimeStyle = layeredRuntime.styleElements.find(element => element.id === 'jquan-css-runtime');
assert(layeredThemeStyle && layeredThemeStyle.textContent.includes('@layer jquan-reset, jquan-theme, jquan-components, jquan-utilities;'), 'cascade layers should declare deterministic order before theme rules');
assert(layeredThemeStyle.textContent.includes('@layer jquan-theme'), 'cascade layers should isolate theme variables');
assert(layeredRuntimeStyle && layeredRuntimeStyle.textContent.includes('@layer jquan-reset'), 'cascade layers should isolate reset and base variables');
layeredRuntime.api.compile(['bg-blue-500']);
assert(layeredRuntimeStyle.sheet.cssRules.some(rule => rule.includes('@layer jquan-utilities')), 'cascade layers should wrap runtime utility rules');
const layeredExtraction = extractor.extractFromSource('<div class="bg-blue-500"></div>', { core: corePath, config: { cascadeLayers: true } });
assert(layeredExtraction.css.includes('@layer jquan-reset'), 'build-time extraction should include the reset layer');
assert(layeredExtraction.css.includes('@layer jquan-utilities'), 'build-time extraction should include utility layers');

if (!isArchiveCore) {
  const topologyCases = [
    { name: 'padding shorthand and side', classes: ['p-4', 'pt-2'], first: 'p-4', second: 'pt-2' },
    { name: 'padding inline shorthand and side', classes: ['px-4', 'pl-2'], first: 'px-4', second: 'pl-2' },
    { name: 'padding block shorthand and side', classes: ['py-4', 'pt-2'], first: 'py-4', second: 'pt-2' },
    { name: 'margin shorthand and side', classes: ['m-4', 'mt-2'], first: 'm-4', second: 'mt-2' },
    { name: 'margin inline shorthand and side', classes: ['mx-4', 'ml-2'], first: 'mx-4', second: 'ml-2' },
    { name: 'inset inline shorthand and side', classes: ['inset-x-4', 'left-2'], first: 'inset-x-4', second: 'left-2' },
    { name: 'border width shorthand and side', classes: ['border-4', 'border-t-w-2'], first: 'border-4', second: 'border-t-w-2' },
    { name: 'border inline shorthand and side', classes: ['border-x-w-4', 'border-l-w-2'], first: 'border-x-w-4', second: 'border-l-w-2' },
    { name: 'width and max-width', classes: ['w-full', 'max-w-lg'], first: 'w-full', second: 'max-w-lg' }
  ];

  for (const testCase of topologyCases) {
    const sourceA = `<div class="${testCase.classes.join(' ')}"></div>`;
    const sourceB = `<div class="${testCase.classes.slice().reverse().join(' ')}"></div>`;
    const extractedA = extractor.extractFromSource(sourceA, { core: corePath }).css;
    const extractedB = extractor.extractFromSource(sourceB, { core: corePath }).css;
    const extractedOrderA = [extractedA.indexOf(`.${testCase.first} {`), extractedA.indexOf(`.${testCase.second} {`)];
    const extractedOrderB = [extractedB.indexOf(`.${testCase.first} {`), extractedB.indexOf(`.${testCase.second} {`)];
    assert(extractedOrderA[0] >= 0 && extractedOrderA[0] < extractedOrderA[1], `${testCase.name} extraction order should be canonical`);
    assert(extractedOrderB[0] >= 0 && extractedOrderB[0] < extractedOrderB[1], `${testCase.name} extraction order should ignore source order`);

    const runtime = createRuntime();
    runtime.api.compile(testCase.classes.slice().reverse());
    const runtimeRules = runtime.styleElements
      .find(element => element.id === 'jquan-css-runtime')
      .sheet.cssRules
      .map(String);
    const runtimeOrder = [
      runtimeRules.findIndex(rule => rule.includes(`.${testCase.first} {`)),
      runtimeRules.findIndex(rule => rule.includes(`.${testCase.second} {`))
    ];
    assert(runtimeOrder[0] >= 0 && runtimeOrder[0] < runtimeOrder[1], `${testCase.name} runtime order should be canonical`);
    assert(runtime.api.debug().failedRuleCount === 0, `${testCase.name} runtime insertion should not fail`);
  }

  const responsiveExtractionA = extractor.extractFromSource('<div class="sm:p-4 sm:pt-2"></div>', { core: corePath }).css;
  const responsiveExtractionB = extractor.extractFromSource('<div class="sm:pt-2 sm:p-4"></div>', { core: corePath }).css;
  assert(responsiveExtractionA.indexOf('.sm\\:p-4 {') < responsiveExtractionA.indexOf('.sm\\:pt-2 {'), 'responsive shorthand should precede side utility');
  assert(responsiveExtractionB.indexOf('.sm\\:p-4 {') < responsiveExtractionB.indexOf('.sm\\:pt-2 {'), 'responsive order should ignore source order');

  const variantRuntime = createRuntime();
  variantRuntime.api.compile(['container', 'dark:bg-black', 'sm:pt-2', '!p-4']);
  const variantReport = variantRuntime.api.debug();
  assert(variantReport.failedRuleCount === 0, 'container, dark, responsive and important variants should inject without failure');
  const variantRules = variantRuntime.styleElements
    .find(element => element.id === 'jquan-css-runtime')
    .sheet.cssRules
    .map(String);
  assert(variantRules.some(rule => rule.includes('max-width: 640px')), 'container utility should retain viewport max-width rules');
  assert(variantRules.some(rule => rule.includes('@media (min-width: 640px)')), 'responsive utility should retain its media query');
  assert(variantRules.some(rule => rule.includes('!important')), 'important utility should retain important declaration');

  const containerRuntime = createRuntime({
    theme: { extend: { containers: { sidebar: '30rem', wide: '48rem' } } }
  });
  const sizeNamedRule = containerRuntime.api.resolve('@sm/sidebar:p-4');
  const namedSizeRule = containerRuntime.api.resolve('@sidebar/lg:p-4');
  const arbitraryNamedRule = containerRuntime.api.resolve('@sidebar/[min-width:400px]:p-4');
  const arbitraryLengthNamedRule = containerRuntime.api.resolve('@sidebar/[400px]:p-4');
  const nestedContainerRule = containerRuntime.api.resolve('@sm:@md/sidebar:p-4');
  const configuredContainerRule = containerRuntime.api.resolve('@wide:p-4');
  const malformedContainerRule = containerRuntime.api.resolve('@bad.name/sidebar:p-4');
  assert(sizeNamedRule && sizeNamedRule.css.includes('@container sidebar (min-width: 24rem)'), '@sm/name should use the size then named-container syntax');
  assert(namedSizeRule && namedSizeRule.css.includes('@container sidebar (min-width: 32rem)'), '@name/size should remain supported');
  assert(arbitraryNamedRule && arbitraryNamedRule.css.includes('@container sidebar (min-width:400px)'), 'named arbitrary container conditions should be supported');
  assert(arbitraryLengthNamedRule && arbitraryLengthNamedRule.css.includes('@container sidebar (min-width: 400px)'), 'named arbitrary length conditions should be supported');
  assert(nestedContainerRule && nestedContainerRule.css.includes('@container sidebar (min-width: 28rem)') && nestedContainerRule.css.includes('@container (min-width: 24rem)'), 'nested named container queries should preserve both conditions');
  assert(configuredContainerRule && configuredContainerRule.css.includes('@container (min-width: 48rem)'), 'theme.extend.containers should register custom container thresholds');
  assert(malformedContainerRule === null, 'malformed container variants should not emit a guessed CSS query');
  const extractedContainer = extractor.extractFromSource('<div class="container-type-inline-size container-name-sidebar"><div class="@sm/sidebar:grid-cols-2"></div></div>', {
    core: corePath,
    config: { theme: { extend: { containers: { sidebar: '30rem' } } } }
  }).css;
  assert(extractedContainer.includes('@container sidebar (min-width: 24rem)'), 'build-time extraction should match runtime named container routing');

  const legacyRouteRuntime = createRuntime();
  const ringArbitrary = legacyRouteRuntime.api.resolve('ring-[2px]');
  const fontArbitrary = legacyRouteRuntime.api.resolve('font-[700_1rem_sans-serif]');
  const divideArbitrary = legacyRouteRuntime.api.resolve('divide-[2px]');
  assert(ringArbitrary && ringArbitrary.css.includes('--jquan-ring-width: 2px'), 'ring arbitrary values should return to the legacy ring resolver');
  assert(fontArbitrary && fontArbitrary.css.includes('font: 700 1rem sans-serif'), 'font shorthand arbitrary values should return to the legacy font resolver');
  assert(divideArbitrary && divideArbitrary.css.includes('border-width: 2px'), 'divide arbitrary values should preserve their child selector route');
  assert(![ringArbitrary, fontArbitrary, divideArbitrary].some(result => /\btrue\s*:/.test(result.css)), 'route pass-through signals must never become CSS property names');
}

const modernColorExtraction = extractor.extractFromSource('<div class="bg-brand/20 ring-brand shadow-brand shadow-md"></div>', {
  core: corePath,
  config: { theme: { extend: { colors: { brand: 'oklch(62% 0.2 250)' } } } }
});
assert(modernColorExtraction.css.includes('color-mix(in oklch, oklch(62% 0.2 250) 20%, transparent)'), 'build-time extraction should preserve modern color opacity');
assert(modernColorExtraction.css.includes('--jquan-ring-color: oklch(62% 0.2 250)'), 'build-time extraction should preserve modern ring colors');
assert(modernColorExtraction.css.includes('--jquan-shadow-color-css: oklch(62% 0.2 250)'), 'build-time extraction should preserve modern shadow colors');
const defaultRuntimeStyle = pseudoRuntime.styleElements.find(element => element.id === 'jquan-css-runtime');
assert(defaultRuntimeStyle && !defaultRuntimeStyle.textContent.includes('@layer jquan-reset'), 'cascade layers should remain opt-in for compatibility');

if (!isArchiveCore) {
const shortcutRuntime = createRuntime({
  shortcuts: {
    'fancy-before': 'before:content-["x"] p-4'
  }
});
const shortcutRule = shortcutRuntime.api.resolve('fancy-before').css;
assert(shortcutRule.includes('.fancy-before::before'), 'shortcut should preserve variant selector rules');
const baseRule = shortcutRule.match(/\.fancy-before\s*\{([^{}]*)\}/);
assert(baseRule, 'shortcut should include a base rule');
assert(!baseRule[1].includes('.fancy-before::before'), 'shortcut generated a broken multi-rule body');

const multiRuleRuntime = createRuntime();
multiRuleRuntime.api.compile(['container', 'dark:bg-black']);
const multiRuleReport = multiRuleRuntime.api.debug();
assert(multiRuleReport.failedRuleCount === 0, 'multi-rule utilities should be split before insertRule');
assert(multiRuleReport.insertedRuleCount > 2, 'multi-rule utilities should insert each top-level rule');

if (!isArchiveCore) {
  const prefetchRuntime = createRuntime({}, { rootClass: '' });
  const scansBeforePrefetch = prefetchRuntime.api.getMetrics().scans;
  const prefetchResult = prefetchRuntime.api.prefetch('p-4 hover:bg-blue-500 before:block p-4', {
    maxClasses: 8,
    maxBytes: 50000,
    timeoutMs: 100
  });
  assert(prefetchResult.requested.length === 3, 'prefetch should expand and deduplicate explicit class tokens');
  assert(prefetchResult.accepted.length === 3 && prefetchResult.skipped.length === 0, 'prefetch should accept explicit classes within budget');
  assert(prefetchResult.ruleCount >= 3 && prefetchResult.bytes > 0, 'prefetch should report inserted rule and byte totals');
  assert(prefetchRuntime.api.getMetrics().scans === scansBeforePrefetch, 'prefetch should not trigger a DOM scan');
  assert(prefetchRuntime.api.getProcessedClasses().has('hover:bg-blue-500'), 'prefetch should reuse the runtime utility pipeline');
  const metricsAfterPrefetch = prefetchRuntime.api.getMetrics();
  assert(metricsAfterPrefetch.prefetchCount === 1 && metricsAfterPrefetch.prefetchResolved === 3, 'metrics should record successful prefetch work');

  const classLimited = prefetchRuntime.api.prefetch(['m-1', 'm-2', 'm-3'], { maxClasses: 1, maxBytes: 50000, timeoutMs: 100 });
  assert(classLimited.accepted.length === 1 && classLimited.skipped.length === 2, 'prefetch should enforce maxClasses');
  assert(classLimited.reason === 'max-classes' && classLimited.truncated === true, 'prefetch should explain class-budget truncation');
  assert(!prefetchRuntime.api.getProcessedClasses().has('m-2'), 'class-budget skips must remain unprocessed');

  const byteLimited = prefetchRuntime.api.prefetch(['grid', 'shadow-lg'], { maxClasses: 2, maxBytes: 1, timeoutMs: 100 });
  assert(byteLimited.accepted.length === 0 && byteLimited.skipped[0].reason === 'max-bytes', 'prefetch should enforce maxBytes before insertion');
  assert(!prefetchRuntime.api.getProcessedClasses().has('grid'), 'byte-budget skips must remain unprocessed');

  const timedOut = prefetchRuntime.api.prefetch(['inline-grid'], { maxClasses: 1, maxBytes: 50000, timeoutMs: 0 });
  assert(timedOut.accepted.length === 0 && timedOut.skipped[0].reason === 'timeout', 'prefetch should enforce timeoutMs');
  assert(!prefetchRuntime.api.getProcessedClasses().has('inline-grid'), 'timeout skips must remain unprocessed');
}

const debugRuntime = createRuntime();
debugRuntime.api.enhance();
const passiveReport = debugRuntime.api.debug();
assert(passiveReport.conflictTracking === false, 'conflict tracking should be disabled by default');
assert(passiveReport.conflictCount === 0, 'passive debug should not collect conflicts');
const trackedReport = debugRuntime.api.debug({ track: true });
assert(trackedReport.conflictTracking === true, 'debug({ track: true }) should enable conflict tracking');
assert(trackedReport.conflictCount > 0, 'tracked debug should collect conflicts');
}

const largeNodeSet = Array.from({ length: 96 }, (_, index) => ({
  getAttribute: name => name === 'class' ? `w-[${index + 1}px]` : '',
  querySelectorAll: () => []
}));
const firstPaintRuntime = createRuntime({}, { nodes: largeNodeSet });
const firstPaintRules = firstPaintRuntime.styleElements
  .find(element => element.id === 'jquan-css-runtime').sheet.cssRules;
assert(firstPaintRuntime.api.getProcessedClasses().size >= 98, 'initial synchronous scan should process more than one 40-rule chunk');
assert(firstPaintRules.length > 40, 'initial synchronous scan should inject more than one 40-rule chunk');
if (typeof firstPaintRuntime.api.debug === 'function') {
  assert(firstPaintRuntime.api.debug().queueSize === 0, 'initial synchronous scan should drain the complete class queue');
}
assert(firstPaintRuntime.api.isReady() === true, 'complete documents should be marked ready');
assert(firstPaintRuntime.rootClasses.has('jquan-ready'), 'ready class should be added to the document root');
assert(firstPaintRuntime.rootAttributes['data-jquan-ready'], 'ready version attribute should be added to the document root');
assert(firstPaintRuntime.dispatchedEvents.some(event => event.type === 'jquan:ready'), 'ready event should be dispatched');

const observerRuntime = createRuntime();
const observerTarget = {
  nodeType: 1,
  getAttribute: name => name === 'class' ? 'bg-red-500' : '',
  querySelectorAll: () => []
};
observerRuntime.observerCallback([{ type: 'attributes', attributeName: 'title', target: observerTarget }]);
assert(!observerRuntime.api.getProcessedClasses().has('bg-red-500'), 'irrelevant attributes should not trigger a runtime scan');
observerRuntime.observerCallback([{ type: 'attributes', attributeName: 'data-state', target: observerTarget }]);
assert(observerRuntime.api.getProcessedClasses().has('bg-red-500'), 'state attributes should trigger a runtime scan');

if (!isArchiveCore) {
  const lifecycle = { setups: 0, teardowns: 0 };
  const shadowNodes = [{
    nodeType: 1,
    getAttribute: name => name === 'class' ? 'ml-[901px]' : (name === 'data-shadow-test' ? '' : ''),
    querySelectorAll: () => [],
    matches: selector => selector === '[data-shadow-test]'
  }];
  const shadowRoot = {
    adoptedStyleSheets: [{ thirdParty: true }],
    querySelectorAll(selector) {
      if (selector === '[class]' || selector === '[data-shadow-test]') return shadowNodes;
      return [];
    }
  };
  const constructableRuntime = createRuntime({
    constructableStylesheets: true,
    plugins: [{
      name: 'shadow-lifecycle-test',
      install({ addBehaviors }) {
        addBehaviors({
          selector: '[data-shadow-test]',
          setup() {
            lifecycle.setups++;
            return () => { lifecycle.teardowns++; };
          }
        });
      }
    }]
  }, { constructable: true, rootClass: '' });

  assert(constructableRuntime.api.styleMode === 'constructable', 'constructable runtime should expose its active style mode');
  assert(constructableRuntime.api.adopt(shadowRoot) === true, 'adopt should mount a compatible ShadowRoot');
  assert(shadowRoot.adoptedStyleSheets.length === 3, 'adopt should preserve third-party sheets and append two shared engine sheets');
  assert(constructableRuntime.api.getProcessedClasses().has('ml-[901px]'), 'adopt should synchronously scan existing ShadowRoot classes');
  assert(lifecycle.setups === 1, 'adopt should initialize plugin behaviors inside the ShadowRoot');
  const adoptedStatus = constructableRuntime.api.getAdoptionStatus(shadowRoot);
  assert(adoptedStatus.adopted && adoptedStatus.observed && adoptedStatus.sheetCount === 2, 'adoption status should report both engine sheets and observer state');
  assert(constructableRuntime.api.adopt(shadowRoot) === true && shadowRoot.adoptedStyleSheets.length === 3, 'repeated adopt should be idempotent');
  assert(constructableRuntime.observerRecords.filter(record => record.root === shadowRoot).length === 1, 'repeated adopt should not create duplicate observers');

  const dynamicNode = {
    nodeType: 1,
    getAttribute: name => name === 'class' ? 'mt-[902px]' : '',
    querySelectorAll: () => []
  };
  const shadowObserver = constructableRuntime.observerRecords.find(record => record.root === shadowRoot);
  shadowObserver.callback([{ type: 'childList', addedNodes: [dynamicNode], removedNodes: [] }]);
  assert(constructableRuntime.api.getProcessedClasses().has('mt-[902px]'), 'adopted-root observer should compile dynamically inserted classes');

  assert(constructableRuntime.api.detach(shadowRoot) === true, 'detach should remove a mounted ShadowRoot');
  assert(shadowRoot.adoptedStyleSheets.length === 1 && shadowRoot.adoptedStyleSheets[0].thirdParty, 'detach should preserve third-party stylesheets');
  assert(shadowObserver.disconnected && lifecycle.teardowns === 1, 'detach should disconnect its observer and teardown plugin behaviors');
  const detachedStatus = constructableRuntime.api.getAdoptionStatus(shadowRoot);
  assert(!detachedStatus.adopted && !detachedStatus.observed && detachedStatus.sheetCount === 0, 'detached status should be observable and stable');
  assert(constructableRuntime.api.detach(shadowRoot) === true, 'repeated detach should be idempotent');

  const ignoredNode = {
    nodeType: 1,
    getAttribute: name => name === 'class' ? 'mb-[903px]' : '',
    querySelectorAll: () => []
  };
  shadowObserver.callback([{ type: 'childList', addedNodes: [ignoredNode], removedNodes: [] }]);
  assert(!constructableRuntime.api.getProcessedClasses().has('mb-[903px]'), 'detached observers must not compile later mutations');

  const isolatedRoot = { adoptedStyleSheets: [], querySelectorAll: () => [] };
  assert(constructableRuntime.api.adopt(isolatedRoot, { scan: false }) === true, 'adopt should support a scan-free lifecycle mount');
  assert(constructableRuntime.api.getAdoptionStatus(isolatedRoot).adopted, 'a second ShadowRoot should mount independently');
  assert(constructableRuntime.api.getAdoptionStatus(shadowRoot).adopted === false, 'mounting another ShadowRoot must not remount a detached root');
  constructableRuntime.api.detach(isolatedRoot);
}

const sharedStorage = new Map();
createRuntime({}, {
  storage: sharedStorage,
  nodes: [{ getAttribute: name => name === 'class' ? 'bg-blue-600' : '', querySelectorAll: () => [] }]
});
const loadingRuntime = createRuntime({}, { storage: sharedStorage, readyState: 'loading', rootClass: '' });
const loadingStyle = loadingRuntime.styleElements.find(element => element.id === 'jquan-css-runtime');
assert(loadingStyle && loadingStyle.sheet.cssRules.some(rule => String(rule).includes('.bg-blue-600')), 'warm cache CSS should hydrate before DOMContentLoaded');
assert(loadingRuntime.observerStarts === 1, 'mutation observer should start during document parsing');
assert(loadingRuntime.api.isReady() === false, 'loading documents should not be marked ready before DOMContentLoaded');
assert(typeof loadingRuntime.documentListeners.DOMContentLoaded === 'function', 'DOMContentLoaded completion handler should be registered');
loadingRuntime.documentListeners.DOMContentLoaded();
assert(loadingRuntime.api.isReady() === true, 'loading documents should become ready after the initial scan');

console.log('[JquanUI] core regression check ok');
