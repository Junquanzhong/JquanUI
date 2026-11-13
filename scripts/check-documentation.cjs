'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const packageVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const readme = read('README.md');
const skill = read('skills/jquanui/SKILL.md');
const dataGuide = read('skills/jquanui/DATA.md');
const roadmap = read('ROADMAP.md');
const dataSurface = read('dist/data/data-api-surface.json');
const fontDocs = read('content/font.js');
const fontVfDocs = read('content/font-vf.js');
const fontSizeDocs = read('content/fontsize.js');
const fontWeightDocs = read('content/fontweight.js');
const hyphensDocs = read('content/hyphens.js');
const shadowDocs = read('content/shadow.js');
const interactionDocs = read('content/interaction.js');
const hoverDocs = read('content/hover.js');
const loaderDocs = read('content/loader.js');
const scrollDocs = read('content/scroll.js');
const maskDocs = read('content/mask.js');
const introDocs = read('content/intro.js');
const jitSyntaxDocs = read('content/jit-syntax.js');
const containerDocs = read('content/container.js');
const modernCssDocs = read('content/modern-css.js');
const buildToolchainDocs = read('content/build-toolchain.js');
const architectureDocs = read('content/architecture.js');
const physicsDocs = read('content/components-physics.js');
const pluginDocs = read('content/plugin-system.js');
const objectDocs = read('content/object.js');
const overflowDocs = read('content/overflow.js');
const fontStyleDocs = read('content/fontstyle.js');
const indentDocs = read('content/indent.js');
const containDocs = read('content/contain.js');
const writingDocs = read('content/writing.js');
const backgroundImageDocs = read('content/background-image.js');
const blendModeDocs = read('content/blend-mode.js');
const componentDocs = read('js/components-docs.js');
const docsShell = read('js/docs-shell.js');
const docsNavTemplate = read('docs/templates/docs-nav.html');
const docsFooterTemplate = read('docs/templates/docs-footer.html');
const componentSidebarTemplate = read('docs/templates/component-sidebar-head.html');
const componentHeaderTemplate = read('docs/templates/component-header.html');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const documentedApis = ['createCollection', 'createDatabase', 'createMemoryAdapter', 'createStorageAdapter', 'createIndexedDBAdapter', 'createHttpSyncAdapter', 'createTableDataSource', 'createCrudDataSource', 'createFilterBuilderMatcher', 'liveQuery', 'collection.sync', 'collection.changes', 'collection.applyChanges', 'paginationApi.updatePage'];
for (const token of ['borderRadius', 'boxShadow', 'fontSize', 'configWarnings', 'invalid-value', 'DEFAULT', 'fontWeight', 'customUtilities', 'check:core-config']) {
  assert(skill.includes(token) && read('content/theme-darkmode.js').includes(token), `Missing theme token contract: ${token}`);
}
documentedApis.push('reviewModeApi');
documentedApis.push('JquanUI.checkClasses');
for (const token of ['checkClasses', 'maxClasses', 'timeoutMs', 'resolved', 'unresolved', 'ignored', 'skipped', 'resolve-error', 'insert-error', 'jquan-ready', 'check:core-diagnostics']) {
  assert([architectureDocs, readme, skill].every(source => source.includes(token)), `Class diagnostics contract missing: ${token}`);
}
assert(architectureDocs.includes("id=\"btn-check-classes\"") && architectureDocs.includes('window.JquanUI.checkClasses') && architectureDocs.includes('await JquanUI.compile(dynamicClasses)'), 'Architecture docs must include an interactive query and dynamic completion automation');
  assert(['configure', 'setUtility', 'setText', 'copyPlan', 'exportPlan', 'changes', 'undo', 'reset', 'utilities', 'revert', 'navigate', 'componentOptions', 'setComponentOption', 'component:select.disabled', 'component:popover.open', 'component:tabs.loop', 'component:carousel.indicators', 'component:carousel.progress', 'setLoop', 'setDisabled', 'setSearchable', 'setClearable', 'control()', 'Ctrl/Cmd+Z', 'aria-keyshortcuts', 'saveDraft', 'loadDraft', 'clearDraft', 'applyPlan', 'dryRun', 'before-mismatch'].every(name => read('content/components/reviewMode.js').includes(name) && skill.includes(name)) && readme.includes('Review Mode 0.18'), 'Review Mode docs, README and skill must describe the current editing/export/apply API');
for (const name of documentedApis) assert(readme.includes(name) || skill.includes(name), `Missing documentation for public API: ${name}`);
for (const name of ['exportSnapshot', 'importSnapshot', 'changesSince', 'recoverOnGap', 'resolveConflict', 'join', 'schemaVersion', 'benchmark:data', 'DataSyncError', 'retries', 'createBroadcastAdapter', 'connect', 'diagnose', 'syncStatus', 'DataStorageError', 'deleteDatabase', 'pendingChanges', 'check:data:browser', 'compositeIndexes', 'indexComposite', 'createDataInspector', 'DataValidationError', 'jquanui-data-state', 'acknowledgedEventIds', 'seenEventIds', 'onError', 'Outbox', 'flush()', 'close()', 'status()', 'onCorrupt', 'loadBackup()', 'saveBackup()', '0.2.0']) assert(dataGuide.includes(name), `Data guide missing: ${name}`);
assert(skill.includes('JquanUI 全生态复用规范'), 'Skill missing ecosystem reuse rule');
assert(skill.includes('文档') && skill.includes('回归测试'), 'Skill missing documentation gate');
assert(roadmap.includes('每次扩展必须同步类型、文档'), 'Roadmap missing documentation requirement');
assert(dataSurface.includes('DataValidationError') && dataSurface.includes('createDataInspector'), 'Data API surface manifest is stale');
assert(readme.includes('Ecosystem design rule'), 'README missing ecosystem design rule');
assert(readme.includes('components.html') && skill.includes('Iframe 通信组件') && skill.includes('iframeBridgeApi'), 'Iframe Bridge documentation missing');
for (const page of ['index.html', 'components.html', 'admin-blocks.html']) {
  const source = read(page);
  assert(source.includes('data-jquan-docs-nav'), `${page} missing shared documentation navigation mount`);
  assert((source.match(/data-jquan-docs-nav/g) || []).length === 1, `${page} must have exactly one shared documentation navigation mount`);
  assert(source.includes('js/docs-shell.js'), `${page} missing documentation shell script`);
  assert(source.includes(packageVersion), `${page} is not aligned with the current documentation release`);
  assert(source.includes('data-jquan-docs-footer'), `${page} missing shared documentation footer mount`);
  assert((source.match(/data-jquan-docs-footer/g) || []).length === 1, `${page} must have exactly one shared documentation footer mount`);
  assert(!source.includes('data-jquan-version'), `${page} must not duplicate release labels outside the shared footer`);
}
assert(docsShell.includes('JquanUIComponents.templateApi') && docsShell.includes('Template fallback'), 'Documentation shell must reuse Template with a fallback');
assert(introDocs.includes('data-jquan-runtime-version') && !introDocs.includes('v4.19.0'), 'Intro runtime badge must use the shared release label');
for (const field of ['engineVersion', 'versionLabel', 'componentLoader', 'baseURL', "await import('jquanui/core')", 'Node/SSR', '只复制 dist']) {
  assert(introDocs.includes(field), 'Intro missing distribution contract: ' + field);
}
assert(docsShell.includes('[data-jquan-version], [data-jquan-runtime-version]'), 'Documentation shell must update all release labels');
assert(docsShell.includes("{% include '") && docsShell.includes('docs-nav.html') && docsShell.includes('docs-footer.html') && docsShell.includes('component-sidebar-head.html') && docsShell.includes('component-header.html'), 'Documentation shell must render shared fragments through Template include');
assert(docsNavTemplate.includes('{% for item in items %}') && docsNavTemplate.includes('item.className'), 'Shared navigation template is incomplete');
assert(docsFooterTemplate.includes('data-jquan-version') && docsFooterTemplate.includes('{{ version }}'), 'Shared footer template is incomplete');
assert(componentSidebarTemplate.includes('component-search') && componentHeaderTemplate.includes('返回 CSS 文档'), 'Component shell templates are incomplete');
const componentPage = read('components.html');
assert(componentPage.includes('data-jquan-component-sidebar-head') && componentPage.includes('data-jquan-component-header'), 'Components page must mount shared Template chrome');

async function runDocsShellSmoke(templateApi) {
  const navRoot = {
    innerHTML: '',
    getAttribute(name) { return name === 'data-active' ? 'components' : null; }
  };
  const footerRoot = { innerHTML: '' };
  const context = {
    window: { JquanUIComponents: templateApi ? { templateApi } : undefined },
    fetch: templateApi ? async name => ({ ok: true, text: async () => name.endsWith('docs-nav.html') ? docsNavTemplate : docsFooterTemplate }) : undefined,
    document: {
      readyState: 'complete',
      querySelectorAll(selector) {
        if (selector === '[data-jquan-docs-nav]') return [navRoot];
        if (selector === '[data-jquan-docs-footer]') return [footerRoot];
        return [];
      }
    }
  };
  context.window.window = context.window;
  context.window.fetch = context.fetch;
  vm.runInNewContext(docsShell, context, { filename: 'js/docs-shell.js' });
  await Promise.resolve();
  await Promise.resolve();
  await new Promise(resolve => setTimeout(resolve, 0));
  return { nav: navRoot.innerHTML, footer: footerRoot.innerHTML };
}

(async () => {
  const templateRenderCalls = [];
  const templateResult = await runDocsShellSmoke({
    render(source, data, options) {
      templateRenderCalls.push({ source, data, options });
      if (source.includes('docs-nav.html')) return '<a data-template-rendered="true"></a>';
      return '<span data-footer-template-rendered="true"></span>';
    }
  });
  assert(templateRenderCalls.length === 2 && templateRenderCalls.some(call => call.source === "{% include 'docs-nav.html' %}" && call.data.items.length === 3 && call.options.templates['docs-nav.html']), 'Documentation shell must render navigation through the Template include');
  assert(templateRenderCalls.some(call => call.source === "{% include 'docs-footer.html' %}" && call.data.version === packageVersion && call.options.templates['docs-footer.html']), 'Documentation shell must render footer through the Template include');
  assert(templateResult.nav.includes('data-template-rendered="true"') && templateResult.footer.includes('data-footer-template-rendered="true"'), 'Documentation shell Template render output was not mounted');
  const fallbackResult = await runDocsShellSmoke(null);
  assert(fallbackResult.nav.includes('components.html') && fallbackResult.nav.includes('UI 展示页') && fallbackResult.footer.includes(`JquanUI v${packageVersion}`), 'Documentation shell fallback must preserve navigation and footer');
  assert(readme.includes('skills/jquanui/SKILL.md') && skill.includes('createParent') && skill.includes('createChild') && skill.includes('targetOrigin') && skill.includes('MessageChannel'), 'Iframe Bridge usage documentation incomplete');
  assert(readme.includes('favicon') && skill.includes('Favicon 图标组件') && skill.includes('faviconApi') && skill.includes('prefers-color-scheme'), 'Favicon documentation missing');
assert(componentDocs.includes("activeId: 'iframeBridge'") && /categoryOrder = \['基础交互'/.test(componentDocs) && componentDocs.includes("'网络与集成'") && /new URL\('\.\.\/content\/components\/index\.js', script\?\.src \|\| document\.baseURI\)/.test(componentDocs), 'Component docs navigation order or module loading is stale');
assert(readme.includes('JquanUI.getMetrics()') && skill.includes('JquanUI.getMetrics()'), 'Runtime metrics documentation missing');
assert(readme.includes('JquanUI.prefetch()') && readme.includes('maxClasses') && readme.includes('maxBytes') && readme.includes('timeoutMs'), 'README prefetch documentation missing');
assert(skill.includes('JquanUI.prefetch(classes, options)') && skill.includes('max-classes') && skill.includes('hover:*'), 'AI Skill prefetch guidance missing');
assert(jitSyntaxDocs.includes('JquanUI.prefetch()') && jitSyntaxDocs.includes("{ class: 'prefetch()'") && jitSyntaxDocs.includes('Budgeted Prefetch'), 'JIT developer documentation missing prefetch API');
assert(jitSyntaxDocs.includes('JquanUI.adopt(this.root)') && jitSyntaxDocs.includes('JquanUI.detach(this.root)') && jitSyntaxDocs.includes('getAdoptionStatus()'), 'JIT developer documentation missing ShadowRoot lifecycle API');
assert(jitSyntaxDocs.includes("selector: '#code-render-target pre code'") && jitSyntaxDocs.includes("selector: '#app-container .jq-static-code code'"), 'JIT code highlighting must stay scoped to its target blocks');
assert(!jitSyntaxDocs.includes('statusEl.style.opacity') && jitSyntaxDocs.includes("statusEl?.classList.add('opacity-0')") && jitSyntaxDocs.includes("statusEl?.classList.add('opacity-100')"), 'JIT syntax status feedback must use atomic opacity classes instead of inline style mutation');
assert(readme.includes('npm run benchmark:core') && readme.includes('npm run check:core-performance') && readme.includes('2500-node'), 'README Core performance benchmark documentation missing');
assert(skill.includes('npm run benchmark:core') && skill.includes('npm run check:core-performance') && skill.includes('JQUAN_BROWSER'), 'AI Skill Core performance benchmark guidance missing');
assert(readme.includes('getAdoptionStatus') && readme.includes('scan: true, observe: true') && readme.includes('third-party adopted sheets'), 'README ShadowRoot lifecycle documentation missing');
assert(skill.includes('getAdoptionStatus') && skill.includes('observe: false') && skill.includes('JquanUI.detach'), 'AI Skill ShadowRoot lifecycle guidance missing');
assert(readme.includes('## SSR Framework Adapters') && readme.includes('createReactSSRAdapter') && readme.includes('createNextSSRAdapter'), 'README SSR framework adapter documentation missing');
assert(skill.includes('createVueSSRAdapter') && skill.includes('createSvelteSSRAdapter') && skill.includes('createNuxtSSRAdapter'), 'AI Skill SSR framework adapter guidance missing');
assert(fontDocs.includes('font-[700_1rem/1.5_sans-serif]'), 'Font docs missing arbitrary composite font example');
  assert(containerDocs.includes('@sm/demo:flex-row') && containerDocs.includes('container-name-demo'), 'Container docs must demonstrate atomic named container variants');
  assert(!containerDocs.includes('<style>') && !containerDocs.includes('@container (min-width: 400px)'), 'Container docs should not fall back to a page CSS block for the primary demo');
  assert(readme.includes('position-area-top') && readme.includes('view-transition-group-nearest'), 'README modern platform utility guidance is stale');
  assert(skill.includes('position-try-order-*') && skill.includes('view-transition-types-*'), 'AI Skill modern platform utility guidance is stale');
assert(read('content/modern-css.js').includes('position-area-top-span-right') && read('content/modern-css.js').includes('view-transition-group-nearest'), 'Modern CSS documentation examples are stale');
assert(modernCssDocs.includes('modern-dialog') && modernCssDocs.includes('modal:opacity-100') && modernCssDocs.includes('dialog-open'), 'Modern CSS documentation is missing the native Dialog demo');
assert(modernCssDocs.includes('dark-audit') && modernCssDocs.includes('max-dark-missing'), 'Modern CSS documentation is missing dark migration audit guidance');
assert(modernCssDocs.includes('modern-popover') && modernCssDocs.includes('popover-open:opacity-100') && modernCssDocs.includes('popover-open'), 'Modern CSS documentation is missing the native Popover demo');
assert(modernCssDocs.includes('modern-inert-target') && modernCssDocs.includes('inert:pointer-events-none') && modernCssDocs.includes('inert'), 'Modern CSS documentation is missing the inert state demo');
assert(modernCssDocs.includes('starting:opacity-0') && modernCssDocs.includes('pointer-fine:inline-flex') && modernCssDocs.includes('hover-hover:inline-flex') && modernCssDocs.includes('forced-colors:outline-w-2'), 'Modern CSS documentation is missing native environment state examples');
assert(architectureDocs.includes('diagnostic-output-host') && architectureDocs.includes('JquanUI.getMetrics()') && architectureDocs.includes('JquanUI.debug(options)') && architectureDocs.includes('JquanUI.diagnose()'), 'Architecture documentation is missing the live runtime diagnostics panel');
assert(buildToolchainDocs.includes('jquan-extract') && buildToolchainDocs.includes('vitePlugin') && buildToolchainDocs.includes('postcssPlugin'), 'Build toolchain documentation is missing CLI/Vite/PostCSS examples');
assert(buildToolchainDocs.includes('renderCriticalCss') && buildToolchainDocs.includes('injectCriticalCss') && buildToolchainDocs.includes('SSR 关键 CSS'), 'Build toolchain documentation is missing SSR critical CSS guidance');
assert(buildToolchainDocs.includes('jquan-tokens') && buildToolchainDocs.includes('W3C Design Tokens') && buildToolchainDocs.includes('tokens-toggle'), 'Build toolchain documentation is missing Design Tokens bridge guidance');
assert(buildToolchainDocs.includes('build-toolchain-code-host') && buildToolchainDocs.includes('build-pipeline-status') && buildToolchainDocs.includes('initCodeHighlighter'), 'Build toolchain documentation is missing the interactive code playground');
assert(architectureDocs.includes('diagnosticMonitor') && architectureDocs.includes('clearInterval(ArchitectureDoc.diagnosticMonitor)'), 'Architecture diagnostics monitor must be cleaned up on unmount');
assert(pluginDocs.includes('addBase(cssStr)') && pluginDocs.includes('addBehaviors(behaviors)') && pluginDocs.includes('addScanHook(handler)'), 'Plugin documentation is missing the public lifecycle API surface');
assert(pluginDocs.includes("name: 'jquanui-doc-plugin-demo'") && pluginDocs.includes('插件已复用 · 未重复安装'), 'Plugin documentation demo must use a stable plugin identity and expose install feedback');
assert(jitSyntaxDocs.includes('static unmount()') && jitSyntaxDocs.includes('JitSyntaxDoc.renderEpoch++') && jitSyntaxDocs.includes('clearTimeout(JitSyntaxDoc.initialTimer)') && jitSyntaxDocs.includes('request !== requestId'), 'JIT documentation must invalidate asynchronous sandbox work when input or route changes');
for (const token of ['JquanUI.compile', 'JquanUI.flush', 'processed', 'unresolved', 'failed', 'pending', 'cancelled', 'stylesheet-unavailable', 'config-changed', 'check:core-compile']) {
  assert([jitSyntaxDocs, readme, skill].every(source => source.includes(token)), `Dynamic compile contract missing: ${token}`);
}
assert(jitSyntaxDocs.includes('const completion = await window.JquanUI.compile') && !jitSyntaxDocs.includes('JitSyntaxDoc.renderTimer'), 'JIT sandbox must wait for actual compile completion');
assert(read('content/theme-darkmode.js').includes('id="theme-status"') && read('content/theme-darkmode.js').includes('Theme API · ${themeName}'), 'Theme documentation must expose live setTheme feedback');
assert(!physicsDocs.includes('style="') && physicsDocs.includes('animation-delay-150') && physicsDocs.includes('animation-ease-*'), 'Physics documentation must use atomic animation timing utilities');
assert(read('content/align.js').includes('文本对齐实验室 Playground') && read('content/align.js').includes('align-playground-target'), 'Alignment documentation is missing its interactive playground');
assert(read('content/display.js').includes('display-live-code') && read('content/display.js').includes('display-behavior'), 'Display documentation is missing live class and behavior feedback');
assert(read('content/bgcolor.js').includes('背景颜色实验室 Playground') && read('content/bgcolor.js').includes('bg-playground-surface'), 'Background color documentation is missing its interactive playground');
assert(read('content/textcolor.js').includes('文本颜色实验室 Playground') && read('content/textcolor.js').includes('text-playground-target'), 'Text color documentation is missing its interactive playground');
assert(read('content/spacing.js').includes('spacing-playground-code-host') && read('content/spacing.js').includes('initCodeHighlighter') && read('content/spacing.js').includes('spacing-playground-status'), 'Spacing documentation is missing the shared code block, live status, or copy feedback');
assert(read('content/flexbox.js').includes('escapeHtml(htmlSnippet)') && read('content/grid.js').includes('escapeHtml(htmlSnippet)'), 'Layout playground code snippets must be escaped before the shared highlighter parses them');
assert(read('content/background-image.js').includes('escapeHtml(htmlSnippet)'), 'Background image playground code snippets must be escaped before the shared highlighter parses them');
assert(read('content/size.js').includes('size-playground-code-host') && read('content/size.js').includes('initCodeHighlighter'), 'Size documentation is missing the shared live code block');
assert(read('content/theme-darkmode.js').includes('initCodeHighlighter({ showLineNumbers: true, langLabel: true })'), 'Theme documentation must use the shared code block defaults');
assert(!read('content/gradient.js').includes('jquan-gradient-polyfill') && !read('content/gradient.js').includes('document.createElement(\'style\')'), 'Gradient documentation must reuse Core gradient rules instead of injecting a duplicate global style');
assert(!read('content/opacity.js').includes('style="'), 'Opacity documentation must not use inline CSS for its demo background');
assert(!read('content/border-width.js').includes('style="') && read('content/border-width.js').includes('writing-vertical-rl'), 'Border width documentation must use atomic writing-mode utilities instead of inline CSS');
for (const [name, source] of [
  ['object', objectDocs],
  ['overflow', overflowDocs],
  ['fontstyle', fontStyleDocs],
  ['indent', indentDocs]
]) {
  assert(!source.includes('<style>') && !source.includes('style="'), `${name} documentation must not inject page CSS or inline CSS`);
  assert(source.includes('initCodeHighlighter'), `${name} documentation must use the shared code highlighter`);
}
assert(objectDocs.includes('bg-[repeating-conic-gradient') && !objectDocs.includes('bg-checkerboard'), 'Object documentation must use an atomic checkerboard background');
assert(overflowDocs.includes('bg-[repeating-conic-gradient') && !overflowDocs.includes('bg-checkerboard'), 'Overflow documentation must use an atomic checkerboard background');
assert(fontStyleDocs.includes('toggleBase') && fontStyleDocs.includes('toggleActive'), 'Font style documentation must use atomic toggle classes');
assert(indentDocs.includes('currentIndentClass') && !indentDocs.includes('preview.style.'), 'Indent documentation must switch atomic indent classes without inline CSS');
for (const [name, source] of [
  ['contain', containDocs],
  ['writing', writingDocs],
  ['background-image', backgroundImageDocs],
  ['blend-mode', blendModeDocs]
]) {
  assert(!source.includes('<style>') && !source.includes('style="'), `${name} documentation must not inject page CSS or inline CSS`);
  assert(source.includes('initCodeHighlighter'), `${name} documentation must use the shared code highlighter`);
}
assert(containDocs.includes('toggleBase') && containDocs.includes('ring-amber-500/10') && !containDocs.includes('box-isolated-'), 'Contain documentation must express sandbox states with atomic classes');
assert(writingDocs.includes('toggleBase') && writingDocs.includes('ring-primary/20'), 'Writing documentation must express toggle states with atomic classes');
assert(backgroundImageDocs.includes("bg-[url('hero.jpg')]") && backgroundImageDocs.includes('const imageClass'), 'Background image documentation must demonstrate atomic URL utilities');
assert(blendModeDocs.includes('bg-[radial-gradient') && !blendModeDocs.includes('style="background-image'), 'Blend mode documentation must express layered backgrounds with atomic classes');
for (const [name, source, codeId] of [
  ['font-vf', fontVfDocs, 'font-vf-code'],
  ['hover', hoverDocs, 'hover-code'],
  ['interaction', interactionDocs, 'interaction-code'],
  ['loader', loaderDocs, 'loader-code'],
  ['mask', maskDocs, 'mask-code'],
  ['scroll', scrollDocs, 'scroll-code'],
  ['shadow', shadowDocs, 'shadow-code']
]) {
  assert(source.includes('initCodeHighlighter'), `${name} documentation must use the shared code highlighter`);
  assert(source.includes(`id="${codeId}"`), `${name} documentation is missing its shared code block`);
  assert(!source.includes('<style>') && !source.includes('style="'), `${name} documentation must not inject page CSS or inline CSS`);
}
assert(fontVfDocs.includes('font-variation-settings:') && fontVfDocs.includes('JquanUI?.compile?.(variationClass)'), 'Variable font documentation must use a supported full arbitrary property and precompile dynamic classes');
assert(!fontSizeDocs.includes('style="') && fontSizeDocs.includes('id="fs-pre-container"') && fontSizeDocs.includes('fs-[${pxVal}]') && fontSizeDocs.includes('JquanUI?.compile?.(`fs-[${pxVal}]`)'), 'Font-size documentation must use atomic JIT classes for the live preview');
assert(!fontWeightDocs.includes('style="') && fontWeightDocs.includes('id="fw-pre-container"') && fontWeightDocs.includes('fw-[${weightVal}]') && fontWeightDocs.includes('JquanUI?.compile?.(weightClass)'), 'Font-weight documentation must use atomic JIT classes for the live preview');
assert(!hyphensDocs.includes('.style.width') && hyphensDocs.includes('w-[${pixelVal}]') && hyphensDocs.includes('JquanUI?.compile?.(`w-[${pixelVal}]`)'), 'Hyphens documentation must use an atomic JIT width class for the compression sandbox');
assert(!interactionDocs.includes('onclick=') && interactionDocs.includes('pointer-target') && interactionDocs.includes('pointer-status'), 'Interaction documentation must use mounted events and visible live feedback');
assert(hoverDocs.includes('group-hover:pr-6') && !hoverDocs.includes('group hover:pr-6'), 'Hover documentation contains an invalid variant token');
assert(!loaderDocs.includes('style="') && !loaderDocs.includes('JquanUI 4.19'), 'Loader documentation must use current Core capabilities without stale version text or inline CSS');
assert(!scrollDocs.includes('style="') && !scrollDocs.includes("createElement('style'") && !scrollDocs.includes('theme-scrollbar') && scrollDocs.includes('themeScrollbarClasses'), 'Scroll documentation must compose scrollbar behavior with Core atomic variants');
assert(!maskDocs.includes('style="') && maskDocs.includes('dotMask') && maskDocs.includes('fadeMask') && maskDocs.includes('mask-pos-[center]'), 'Mask documentation must express mask demos with Core classes instead of inline CSS');
for (const page of ['border-width.js', 'border-radius.js', 'outline.js']) assert(read(`content/${page}`).includes('Interactive'), `Border documentation playground badge is missing: ${page}`);
assert(!read('content/shadow.js').includes('style="') && read('content/shadow.js').includes('bg-[radial-gradient'), 'Shadow documentation must use atomic classes for the demo surface');
for (const page of ['filter.js']) assert(read(`content/${page}`).includes('Interactive'), `Effect documentation playground badge is missing: ${page}`);
assert(!read('content/transform.js').includes('border border border-primary'), 'Transform documentation contains a duplicated border utility');
  for (const className of ['text-shadow-none', 'text-shadow-sm', 'text-shadow-md', 'text-shadow-lg', 'text-shadow-[0_2px_4px_rgb(0_0_0_/_0.2)]']) {
    assert(shadowDocs.includes(className), `Shadow docs missing: ${className}`);
  }
  assert(["content/components/reviewMode.js", "skills/jquanui/SKILL.md", "README.md"].every(file => read(file).includes("onDemandOnly")), "Review Mode docs must explain on-demand bundle exclusion and importer entry");
  console.log(`[JquanUI] documentation check ok (${documentedApis.length} public APIs)`);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

