/* JquanUI documentation shell: shared templates, navigation, footer, and release labels. */
(function (global) {
    'use strict';

    const VERSION = '4.72.0';
    const TEMPLATE_PATH = 'docs/templates/';
    const NAV_ITEMS = [
        { key: 'css', href: 'index.html', icon: 'ph-text-aa', label: 'CSS 文档' },
        { key: 'components', href: 'components.html', icon: 'ph-cubes', label: '组件文档' },
        { key: 'blocks', href: 'admin-blocks.html', icon: 'ph-layout', label: 'UI 展示页' }
    ];
    let templateSourcesPromise = null;

    function navigationClass(active, key) {
        return active === key
            ? 'inline-flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg text-sm font-medium bg-white text-primary shadow-sm whitespace-nowrap'
            : 'inline-flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[character]));
    }

    function navigationFrame(markup) {
        return `<div class="flex items-center p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto">${markup}</div>`;
    }

    function fallbackNavigation(items) {
        return items.map(item => `
<a href="${escapeHtml(item.href)}" class="${escapeHtml(item.className)}"${item.active ? ' aria-current="page"' : ''}>
    <i class="ph ${escapeHtml(item.icon)}"></i>
    <span>${escapeHtml(item.label)}</span>
</a>`).join('');
    }

    function fallbackFooter() {
        return `
<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
    <span data-jquan-version>JquanUI v${VERSION}</span>
    <div class="flex items-center gap-3">
        <a href="https://cssui.jquan.win/" class="hover:text-primary transition-colors" target="_blank" rel="noreferrer">cssui.jquan.win</a>
        <span aria-hidden="true">&middot;</span>
        <span>Atomic UI system</span>
    </div>
</div>`;
    }

    function loadTemplateSources() {
        if (templateSourcesPromise) return templateSourcesPromise;
        if (typeof global.fetch !== 'function') return Promise.reject(new Error('fetch() is unavailable for documentation templates.'));
        const names = ['docs-nav.html', 'docs-footer.html', 'component-sidebar-head.html', 'component-header.html'];
        templateSourcesPromise = Promise.all(names.map(name => {
            return global.fetch(`${TEMPLATE_PATH}${name}`).then(response => {
                if (!response || response.ok === false) throw new Error(`Documentation template request failed: ${name}`);
                return response.text().then(source => [name, String(source)]);
            });
        })).then(entries => Object.fromEntries(entries)).catch(error => {
            templateSourcesPromise = null;
            throw error;
        });
        return templateSourcesPromise;
    }

    function renderTemplate(templateApi, includeName, data, sources) {
        if (!templateApi || typeof templateApi.render !== 'function') return null;
        const html = templateApi.render(`{% include '${includeName}' %}`, data, { templates: sources });
        return typeof html === 'string' ? html : null;
    }

    function applyTemplateLater(root, includeName, data, renderMarkup) {
        const templateApi = global.JquanUIComponents && global.JquanUIComponents.templateApi;
        if (!templateApi || typeof templateApi.render !== 'function') return;
        loadTemplateSources().then(sources => {
            const markup = renderTemplate(templateApi, includeName, data, sources);
            if (markup == null || !root) return;
            root.innerHTML = renderMarkup(markup);
            updateReleaseLabels();
        }).catch(error => {
            if (global.console && typeof global.console.warn === 'function') {
                global.console.warn('[JquanUI Docs] Template fallback:', error);
            }
        });
    }

    function renderNavigation(root) {
        const active = root.getAttribute('data-active') || 'css';
        const items = NAV_ITEMS.map(item => ({
            ...item,
            active: item.key === active,
            className: navigationClass(active, item.key)
        }));
        root.innerHTML = navigationFrame(fallbackNavigation(items));
        applyTemplateLater(root, 'docs-nav.html', { items }, navigationFrame);
    }

    function renderFooter(root) {
        root.innerHTML = fallbackFooter();
        applyTemplateLater(root, 'docs-footer.html', { version: VERSION, siteUrl: 'https://cssui.jquan.win/' }, markup => markup);
    }

    function fallbackComponentSidebarHead() {
        return `
<div class="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
    <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm shadow-primary/40">
        <i class="ph ph-cube"></i>
    </div>
    <span class="ml-2.5 font-bold text-lg tracking-tight text-slate-800">JquanUI<span class="text-primary">Components</span></span>
</div>
<div class="px-4 pt-4">
    <label class="relative block">
        <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input id="component-search" type="text" placeholder="搜索组件 / API / 场景" class="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
    </label>
</div>`;
    }

    function fallbackComponentHeader() {
        return `
<div class="flex items-center gap-3">
    <span class="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/10 text-xs">独立入口</span>
    <span class="hidden sm:inline text-xs text-slate-400">声明式 + 命令式 + API</span>
</div>
<div class="flex items-center gap-4 text-slate-400">
    <a href="index.html" class="hover:text-primary transition-colors" title="返回 CSS 文档"><i class="ph ph-arrow-left text-2xl"></i></a>
</div>`;
    }

    function renderComponentSidebarHead(root) {
        root.innerHTML = fallbackComponentSidebarHead();
        applyTemplateLater(root, 'component-sidebar-head.html', {}, markup => markup);
    }

    function renderComponentHeader(root) {
        root.innerHTML = fallbackComponentHeader();
        applyTemplateLater(root, 'component-header.html', {}, markup => markup);
    }

    function updateReleaseLabels() {
        document.querySelectorAll('[data-jquan-version], [data-jquan-runtime-version]').forEach(node => {
            node.textContent = node.textContent.replace(/v\d+\.\d+\.\d+(?:-[\w.]+)?/i, `v${VERSION}`);
        });
        document.querySelectorAll('[data-jquan-core-src]').forEach(node => {
            const source = node.getAttribute('src');
            if (source) node.setAttribute('src', source.replace(/\?v=[^"']+$/, `?v=${VERSION}`));
        });
    }

    function boot() {
        document.querySelectorAll('[data-jquan-docs-nav]').forEach(renderNavigation);
        document.querySelectorAll('[data-jquan-docs-footer]').forEach(renderFooter);
        document.querySelectorAll('[data-jquan-component-sidebar-head]').forEach(renderComponentSidebarHead);
        document.querySelectorAll('[data-jquan-component-header]').forEach(renderComponentHeader);
        updateReleaseLabels();
    }

    global.JquanUIDocs = Object.freeze({ version: VERSION, renderNavigation, renderFooter, renderComponentSidebarHead, renderComponentHeader, boot });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})(window);
