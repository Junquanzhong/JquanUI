(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const HIGHLIGHT_VERSION = '11.9.0';
    const CORE_URL = `https://unpkg.com/@highlightjs/cdn-assets@${HIGHLIGHT_VERSION}/es/highlight.min.js`;
    const LANGUAGE_BASE_URL = `https://unpkg.com/@highlightjs/cdn-assets@${HIGHLIGHT_VERSION}/es/languages`;

    const runtime = {
        seed: 0,
        corePromise: null,
        hljs: null,
        languagePromises: new Map(),
        instances: new Map(),
        classesCompiled: false
    };

    const aliases = {
        js: 'javascript',
        jsx: 'javascript',
        mjs: 'javascript',
        cjs: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        py: 'python',
        sh: 'bash',
        zsh: 'bash',
        shell: 'bash',
        yml: 'yaml',
        md: 'markdown',
        rb: 'ruby',
        cs: 'csharp',
        html: 'xml',
        vue: 'xml'
    };

    const defaults = {
        selector: '[jq-code], pre code[data-jq-code], pre code[class*="language-"], pre code[data-language]',
        autoDetect: true,
        lineNumbers: true,
        copyButton: true,
        langLabel: true,
        smartIndent: true,
        tabSize: 4,
        maxHeight: 500,
        wrapLines: false,
        theme: 'onedark',
        onRender: null
    };

    const ui = {
        host: 'relative my-4 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm',
        shell: 'relative',
        lang: 'pointer-events-none absolute bottom-3 right-3 z-10 select-none text-xs uppercase tracking-widest text-slate-400',
        actions: 'contents',
        copy: 'absolute right-3 top-3 z-20 inline-flex rounded-md bg-white p-1.5 text-slate-400 transition-all backdrop-blur-sm hover:bg-primary hover:text-white focus:outline-none',
        bodyBase: 'overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent',
        grid: 'grid min-w-full grid-cols-[auto_1fr] gap-0',
        lines: 'select-none border-r border-slate-200 py-3 pr-3 pl-3 text-right text-xs leading-6 text-slate-500 flex flex-col',
        content: 'm-0 bg-transparent px-4 py-3 font-mono text-sm leading-6 text-slate-700 whitespace-pre',
        contentWrap: 'whitespace-pre-wrap break-words'
    };

    const copyIcons = {
        idle: `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>`,
        success: `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>`
    };

    const tokenClassMap = {
        comment: 'text-slate-400 italic',
        quote: 'text-slate-400 italic',
        keyword: 'text-violet-600',
        'selector-tag': 'text-rose-500',
        subst: 'text-rose-500',
        number: 'text-amber-600',
        literal: 'text-amber-600',
        variable: 'text-rose-500',
        'template-variable': 'text-rose-500',
        string: 'text-emerald-600',
        doctag: 'text-violet-600',
        title: 'text-sky-600',
        section: 'text-sky-600',
        'selector-id': 'text-sky-600',
        type: 'text-orange-500',
        tag: 'text-rose-500',
        name: 'text-rose-500',
        attribute: 'text-amber-600',
        attr: 'text-amber-600',
        regexp: 'text-cyan-600',
        link: 'text-cyan-600 underline',
        symbol: 'text-cyan-600',
        bullet: 'text-cyan-600',
        built_in: 'text-orange-500',
        meta: 'text-sky-600',
        deletion: 'bg-red-50 text-rose-500',
        addition: 'bg-emerald-50 text-emerald-600',
        emphasis: 'italic',
        strong: 'font-bold'
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-code-${runtime.seed}`;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.lineNumbers = merged.lineNumbers !== false;
        merged.copyButton = merged.copyButton !== false;
        merged.langLabel = merged.langLabel !== false;
        merged.smartIndent = merged.smartIndent !== false;
        merged.autoDetect = merged.autoDetect !== false;
        merged.wrapLines = merged.wrapLines === true;
        merged.tabSize = Math.max(2, Number(merged.tabSize) || 4);
        merged.maxHeight = Math.max(160, Number(merged.maxHeight) || 500);
        return merged;
    }

    function ensureUtilityClasses(extra = []) {
        if (!window.JquanUI || typeof window.JquanUI.compile !== 'function') return;
        const base = [
            ui.host,
            ui.shell,
            ui.lang,
            ui.actions,
            ui.copy,
            ui.bodyBase,
            ui.grid,
            ui.lines,
            ui.content,
            ui.contentWrap,
            ...Object.values(tokenClassMap)
        ];
        const classes = base.concat(extra).join(' ');
        if (!runtime.classesCompiled || extra.length > 0) {
            window.JquanUI.compile(classes);
            runtime.classesCompiled = true;
        }
    }

    async function ensureCore() {
        if (runtime.hljs) return runtime.hljs;
        if (!runtime.corePromise) {
            runtime.corePromise = import(CORE_URL).then(module => {
                runtime.hljs = module.default || module;
                return runtime.hljs;
            }).catch(() => null);
        }
        return runtime.corePromise;
    }

    async function ensureLanguage(language) {
        const hljs = await ensureCore();
        if (!hljs) return null;
        const normalized = aliases[(language || '').toLowerCase()] || (language || 'plaintext').toLowerCase();
        if (normalized === 'plaintext') return 'plaintext';
        if (hljs.getLanguage(normalized)) return normalized;
        if (!runtime.languagePromises.has(normalized)) {
            runtime.languagePromises.set(normalized, import(`${LANGUAGE_BASE_URL}/${normalized}.min.js`).then(module => {
                hljs.registerLanguage(normalized, module.default);
                return normalized;
            }).catch(() => 'plaintext'));
        }
        return runtime.languagePromises.get(normalized);
    }

    function decodeHtml(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    }

    function smartDedent(input, tabSize) {
        if (!input) return '';
        const normalized = input.replace(/\r\n/g, '\n');
        const lines = normalized.split('\n');
        while (lines.length && lines[0].trim() === '') lines.shift();
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
        if (lines.length === 0) return '';

        let minIndent = Infinity;
        lines.forEach(line => {
            if (!line.trim()) return;
            const match = line.match(/^[ \t]*/);
            const raw = match ? match[0] : '';
            const expanded = raw.replace(/\t/g, ' '.repeat(tabSize));
            minIndent = Math.min(minIndent, expanded.length);
        });
        if (!Number.isFinite(minIndent)) minIndent = 0;

        return lines.map(line => {
            const expanded = line.replace(/\t/g, ' '.repeat(tabSize));
            return expanded.slice(Math.min(minIndent, expanded.length));
        }).join('\n');
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function guessLanguage(node) {
        const fromData = node.getAttribute('data-language') || node.getAttribute('jq-language');
        if (fromData) return fromData.toLowerCase();
        const className = Array.from(node.classList).find(name => name.startsWith('language-') || name.startsWith('lang-'));
        if (className) return className.replace(/^language-/, '').replace(/^lang-/, '').toLowerCase();
        return 'plaintext';
    }

    function readSource(node, options) {
        const sourceSelector = node.getAttribute('data-code-source');
        if (sourceSelector) {
            const sourceNode = document.querySelector(sourceSelector);
            if (sourceNode) {
                return sourceNode.textContent || sourceNode.innerText || '';
            }
        }

        const raw = node.textContent && node.textContent.trim()
            ? node.textContent
            : decodeHtml(node.innerHTML);

        return options.smartIndent ? smartDedent(raw, options.tabSize) : raw;
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.focus();
        area.select();
        try {
            document.execCommand('copy');
            return true;
        } finally {
            area.remove();
        }
    }

    function remapHighlightMarkup(html) {
        return html.replace(/class="hljs-([^"]+)"/g, function (_, token) {
            return `class="${tokenClassMap[token] || ''}"`;
        });
    }

    function createShell(node, code, language, renderedHtml, options) {
        const pre = node.tagName === 'PRE' ? node : node.closest('pre');
        const host = pre || node;
        const shell = document.createElement('div');
        shell.setAttribute('jq-code-shell', '');
        shell.className = ui.shell;

        const lang = document.createElement('div');
        lang.setAttribute('jq-code-lang', '');
        lang.className = ui.lang;
        lang.textContent = language;

        const actions = document.createElement('div');
        actions.setAttribute('jq-code-actions', '');
        actions.className = ui.actions;

        if (options.copyButton) {
            const copy = document.createElement('button');
            copy.type = 'button';
            copy.setAttribute('jq-code-copy', '');
            copy.setAttribute('aria-label', 'Copy code');
            copy.className = ui.copy;
            copy.innerHTML = copyIcons.idle;
            copy.addEventListener('click', async () => {
                await copyText(code);
                copy.innerHTML = copyIcons.success;
                window.setTimeout(() => {
                    copy.innerHTML = copyIcons.idle;
                }, 1200);
            });
            actions.appendChild(copy);
        }

        const body = document.createElement('div');
        body.setAttribute('jq-code-body', '');
        body.className = `${ui.bodyBase} max-h-[${options.maxHeight}px]`;

        const grid = document.createElement('div');
        grid.setAttribute('jq-code-grid', '');
        grid.className = ui.grid;

        const lines = code.split('\n');
        if (options.lineNumbers) {
            const lineCol = document.createElement('div');
            lineCol.setAttribute('jq-code-lines', '');
            lineCol.className = ui.lines;
            lineCol.innerHTML = lines.map((_, index) => `<span>${index + 1}</span>`).join('');
            grid.appendChild(lineCol);
        }

        const content = document.createElement('code');
        content.setAttribute('jq-code-content', '');
        content.setAttribute('data-wrap', options.wrapLines ? 'true' : 'false');
        content.setAttribute('data-language', language);
        content.className = `${ui.content}${options.wrapLines ? ` ${ui.contentWrap}` : ''}`;
        content.innerHTML = renderedHtml;

        grid.appendChild(content);
        body.appendChild(grid);
        shell.appendChild(body);
        if (options.copyButton) shell.appendChild(actions.firstElementChild);
        if (options.langLabel && lines.length > 1) shell.appendChild(lang);

        host.innerHTML = '';
        host.setAttribute('jq-code-rendered', 'true');
        host.className = ui.host;
        host.appendChild(shell);

        return { host, shell, content };
    }

    async function highlightCode(code, language, autoDetect) {
        const hljs = await ensureCore();
        if (!hljs) {
            return {
                language: language || 'plaintext',
                html: escapeHtml(code)
            };
        }

        let resolvedLanguage = aliases[(language || '').toLowerCase()] || (language || 'plaintext').toLowerCase();
        if (resolvedLanguage && resolvedLanguage !== 'plaintext') {
            resolvedLanguage = await ensureLanguage(resolvedLanguage);
        }

        try {
            if (resolvedLanguage && resolvedLanguage !== 'plaintext' && hljs.getLanguage(resolvedLanguage)) {
                return {
                    language: resolvedLanguage,
                    html: remapHighlightMarkup(hljs.highlight(code, { language: resolvedLanguage, ignoreIllegals: true }).value)
                };
            }

            if (autoDetect) {
                const result = hljs.highlightAuto(code);
                return {
                    language: result.language || 'plaintext',
                    html: remapHighlightMarkup(result.value || escapeHtml(code))
                };
            }
        } catch (error) {
        }

        return {
            language: 'plaintext',
            html: escapeHtml(code)
        };
    }

    async function renderNode(node, userOptions) {
        if (!node || node.hasAttribute('jq-code-content') || node.closest('[jq-code-rendered="true"] [jq-code-content]')) {
            return null;
        }

        const host = node.tagName === 'PRE' ? node : node.closest('pre');
        if (host && host.getAttribute('jq-code-rendered') === 'true') {
            return null;
        }

        const options = normalizeOptions(userOptions);
        ensureUtilityClasses([`max-h-[${options.maxHeight}px]`]);

        const code = readSource(node, options);
        if (!code.trim()) return null;

        const requestedLanguage = guessLanguage(node);
        const result = await highlightCode(code, requestedLanguage, options.autoDetect);
        const view = createShell(node, code, result.language, result.html, options);

        const id = node.id || nextId();
        node.id = id;
        runtime.instances.set(id, {
            id,
            source: node,
            host: view.host,
            shell: view.shell,
            content: view.content,
            options,
            code,
            language: result.language
        });

        if (typeof options.onRender === 'function') {
            options.onRender({
                id,
                code,
                language: result.language,
                element: view.host
            });
        }

        return createHandle(id);
    }

    async function mount(target, options) {
        if (typeof target === 'string') {
            const nodes = Array.from(document.querySelectorAll(target));
            const handles = [];
            for (const node of nodes) {
                const handle = await renderNode(node, options);
                if (handle) handles.push(handle);
            }
            return handles;
        }
        return renderNode(target, options);
    }

    async function refresh(target, options) {
        const instance = resolveInstance(target);
        if (!instance) return null;
        const source = instance.source;
        return renderNode(source, Object.assign({}, instance.options, options || {}));
    }

    function destroy(target) {
        const instance = resolveInstance(target);
        if (!instance) return false;
        runtime.instances.delete(instance.id);
        return true;
    }

    function resolveInstance(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            for (const instance of runtime.instances.values()) {
                if (instance.source.matches(target) || instance.host.matches(target)) return instance;
            }
            const found = document.querySelector(target);
            return found ? resolveInstance(found) : null;
        }
        for (const instance of runtime.instances.values()) {
            if (instance.source === target || instance.host === target || instance.host.contains(target) || instance.source.contains(target)) {
                return instance;
            }
        }
        return null;
    }

    function createHandle(id) {
        return {
            id,
            refresh(options) { return refresh(id, options); },
            destroy() { return destroy(id); },
            state() {
                const instance = runtime.instances.get(id);
                return instance ? {
                    language: instance.language,
                    code: instance.code,
                    options: Object.assign({}, instance.options)
                } : null;
            },
            element() {
                const instance = runtime.instances.get(id);
                return instance ? instance.host : null;
            }
        };
    }

    const codeBlockApi = {
        mount(target, options) { return mount(target, options); },
        refresh(target, options) { return refresh(target, options); },
        destroy(target) { return destroy(target); },
        getState(target) {
            const instance = resolveInstance(target);
            return instance ? createHandle(instance.id).state() : null;
        }
    };

    JquanUIComponents.codeBlockApi = codeBlockApi;

    JquanUIComponents.codeBlock = {
        name: 'jquanui-code-block',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: defaults.selector,
                setup(node) {
                    if (node.hasAttribute('jq-code-content')) return null;
                    const host = node.tagName === 'PRE' ? node : node.closest('pre');
                    if (host && host.getAttribute('jq-code-rendered') === 'true') return null;
                    mount(node);
                    return () => {
                        destroy(node);
                    };
                }
            });
        }
    };
})(window);
