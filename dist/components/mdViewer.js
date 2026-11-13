(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        parserPromise: null,
        parser: null,
        purifier: null,
        mermaidPromise: null,
        mermaid: null,
        mathPromise: null,
        instances: new Map(),
        stylesInjected: false
    };

    const defaults = {
        selector: '[jq-md], [data-jq-md]',
        source: '',
        src: '',
        sanitize: true,
        breaks: true,
        gfm: true,
        autoRender: true,
        autoObserve: false,
        highlight: true,
        toc: false,
        tocSelector: '',
        anchor: true,
        anchorPrefix: 'md-heading',
        mermaid: true,
        math: false,
        baseUrl: '',
        targetBlank: true,
        loadingClass: 'is-loading',
        errorClass: 'is-error',
        renderClass: 'is-rendered',
        emptyClass: 'is-empty',
        onRender: null,
        onError: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-md-${runtime.seed}`;
    }

    function normalizeBoolean(value, fallback) {
        if (value == null || value === '') return fallback;
        if (typeof value === 'boolean') return value;
        const normalized = String(value).trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
        if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
        return fallback;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.sanitize = merged.sanitize !== false;
        merged.breaks = merged.breaks !== false;
        merged.gfm = merged.gfm !== false;
        merged.autoRender = merged.autoRender !== false;
        merged.autoObserve = merged.autoObserve === true;
        merged.highlight = merged.highlight !== false;
        merged.toc = merged.toc === true;
        merged.anchor = merged.anchor !== false;
        merged.mermaid = merged.mermaid !== false;
        merged.math = merged.math === true;
        return merged;
    }

    function injectStyles() {
        if (runtime.stylesInjected) return;
        runtime.stylesInjected = true;

        const style = document.createElement('style');
        style.id = 'jquanui-md-viewer-styles';
        style.textContent = `
[jq-md],[data-jq-md]{
  display:block;
  width:100%;
}
[jq-md].is-loading,[data-jq-md].is-loading{
  opacity:.72;
}
[jq-md].is-error,[data-jq-md].is-error{
  color:rgb(185 28 28 / 1);
}
[jq-md].is-empty,[data-jq-md].is-empty{
  min-height:48px;
}
[jq-md-content]{
  color:rgb(var(--gray-800, 31 41 55) / 1);
  line-height:1.8;
  word-break:break-word;
}
[jq-md-content] > :first-child{
  margin-top:0;
}
[jq-md-content] > :last-child{
  margin-bottom:0;
}
[jq-md-content] h1,
[jq-md-content] h2,
[jq-md-content] h3,
[jq-md-content] h4,
[jq-md-content] h5,
[jq-md-content] h6{
  position:relative;
  margin:1.5em 0 .65em;
  line-height:1.3;
  color:rgb(var(--gray-950, 3 7 18) / 1);
}
[jq-md-content] h1{font-size:2rem;}
[jq-md-content] h2{font-size:1.625rem;}
[jq-md-content] h3{font-size:1.375rem;}
[jq-md-content] h4{font-size:1.125rem;}
[jq-md-content] h5{font-size:1rem;}
[jq-md-content] h6{font-size:.875rem;}
[jq-md-content] p,
[jq-md-content] ul,
[jq-md-content] ol,
[jq-md-content] blockquote,
[jq-md-content] table,
[jq-md-content] pre,
[jq-md-content] figure{
  margin:1em 0;
}
[jq-md-content] ul,
[jq-md-content] ol{
  padding-left:1.4em;
}
[jq-md-content] blockquote{
  margin-left:0;
  padding:.875rem 1rem;
  border-left:4px solid rgb(var(--primary-hue-500, 59 130 246) / 1);
  background:rgb(248 250 252 / 1);
  border-radius:0 12px 12px 0;
}
[jq-md-content] table{
  width:100%;
  border-collapse:collapse;
  overflow:hidden;
}
[jq-md-content] th,
[jq-md-content] td{
  padding:.75rem .875rem;
  border:1px solid rgb(226 232 240 / 1);
  text-align:left;
  vertical-align:top;
}
[jq-md-content] thead th{
  background:rgb(248 250 252 / 1);
}
[jq-md-content] a{
  color:rgb(var(--primary-hue-600, 37 99 235) / 1);
  text-decoration:none;
}
[jq-md-content] a:hover{
  text-decoration:underline;
}
[jq-md-content] img{
  max-width:100%;
  height:auto;
  border-radius:12px;
}
[jq-md-content] hr{
  border:0;
  border-top:1px solid rgb(226 232 240 / 1);
  margin:1.5rem 0;
}
[jq-md-content] code:not(pre code){
  padding:.15rem .35rem;
  border-radius:6px;
  background:rgb(241 245 249 / 1);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
  font-size:.92em;
}
[jq-md-heading-anchor]{
  margin-left:.45rem;
  color:rgb(148 163 184 / 1);
  font-size:.9em;
  opacity:0;
  transition:opacity .2s ease;
}
[jq-md-content] h1:hover [jq-md-heading-anchor],
[jq-md-content] h2:hover [jq-md-heading-anchor],
[jq-md-content] h3:hover [jq-md-heading-anchor],
[jq-md-content] h4:hover [jq-md-heading-anchor],
[jq-md-content] h5:hover [jq-md-heading-anchor],
[jq-md-content] h6:hover [jq-md-heading-anchor]{
  opacity:1;
}
[jq-md-mermaid]{
  overflow:auto;
  padding:1rem;
  border:1px solid rgb(226 232 240 / 1);
  border-radius:16px;
  background:rgb(255 255 255 / 1);
}
[jq-md-toc]{
  display:flex;
  flex-direction:column;
  gap:.5rem;
}
[jq-md-toc] a{
  color:rgb(71 85 105 / 1);
  text-decoration:none;
}
[jq-md-toc] a:hover{
  color:rgb(var(--primary-hue-600, 37 99 235) / 1);
}
        `;
        document.head.appendChild(style);
    }

    function slugify(text) {
        return String(text || '')
            .trim()
            .toLowerCase()
            .replace(/<[^>]+>/g, '')
            .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-');
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function cleanMarkdown(raw) {
        if (!raw) return '';
        const normalized = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalized.split('\n');
        while (lines.length && lines[0].trim() === '') lines.shift();
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
        if (!lines.length) return '';

        let minIndent = Infinity;
        let inFence = false;
        lines.forEach(line => {
            if (/^\s*```/.test(line)) {
                inFence = !inFence;
                return;
            }
            if (inFence) return;
            if (!line.trim()) return;
            const match = line.match(/^[ \t]*/);
            const indent = match ? match[0].replace(/\t/g, '    ').length : 0;
            if (indent < minIndent) minIndent = indent;
        });
        if (!Number.isFinite(minIndent) || minIndent <= 0) return lines.join('\n');
        inFence = false;
        return lines.map(line => {
            if (/^\s*```/.test(line)) {
                inFence = !inFence;
                return line;
            }
            if (inFence || !line.trim()) return line;
            const expanded = line.replace(/\t/g, '    ');
            return expanded.slice(Math.min(minIndent, expanded.length));
        }).join('\n');
    }

    function decodeHtml(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    async function ensureParser() {
        if (runtime.parser && runtime.purifier) return runtime;
        if (!runtime.parserPromise) {
            runtime.parserPromise = Promise.all([
                import('https://unpkg.com/marked@12.0.2/lib/marked.esm.js'),
                import('https://unpkg.com/dompurify@3.1.6/dist/purify.es.mjs')
            ]).then(([markedModule, purifierModule]) => {
                runtime.parser = markedModule.marked || markedModule.default || markedModule;
                runtime.purifier = purifierModule.default || purifierModule;
                return runtime;
            });
        }
        return runtime.parserPromise;
    }

    async function ensureMermaid() {
        if (runtime.mermaid) return runtime.mermaid;
        if (!runtime.mermaidPromise) {
            runtime.mermaidPromise = import('https://unpkg.com/mermaid@10.9.1/dist/mermaid.esm.min.mjs').then(module => {
                runtime.mermaid = module.default || module;
                runtime.mermaid.initialize({
                    startOnLoad: false,
                    theme: 'base',
                    securityLevel: 'loose',
                    themeVariables: {
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        primaryColor: '#dbeafe',
                        primaryTextColor: '#0f172a',
                        lineColor: '#475569'
                    }
                });
                return runtime.mermaid;
            }).catch(() => null);
        }
        return runtime.mermaidPromise;
    }

    async function ensureMath() {
        if (global.MathJax?.typesetPromise) return global.MathJax;
        if (!runtime.mathPromise) {
            runtime.mathPromise = new Promise((resolve, reject) => {
                if (!global.MathJax) {
                    global.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']],
                            displayMath: [['$$', '$$'], ['\\[', '\\]']]
                        },
                        svg: { fontCache: 'global' },
                        startup: {
                            typeset: false,
                            ready() {
                                global.MathJax.startup.defaultReady();
                                resolve(global.MathJax);
                            }
                        }
                    };
                }
                const existing = Array.from(document.scripts).find(script => script.src && script.src.includes('mathjax'));
                if (existing && global.MathJax?.typesetPromise) {
                    resolve(global.MathJax);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js';
                script.async = true;
                script.onerror = () => reject(new Error('MathJax load failed.'));
                document.head.appendChild(script);
            }).catch(() => null);
        }
        return runtime.mathPromise;
    }

    function createRenderer(options, tocItems) {
        const headingIds = new Map();
        const renderer = new runtime.parser.Renderer();

        renderer.heading = function (text, level) {
            const plain = String(text).replace(/<[^>]*>/g, '').trim();
            const baseSlug = slugify(plain) || `${options.anchorPrefix}-${level}`;
            const count = headingIds.get(baseSlug) || 0;
            headingIds.set(baseSlug, count + 1);
            const anchorId = count ? `${baseSlug}-${count + 1}` : baseSlug;
            tocItems.push({ level, text: plain, id: anchorId });
            const anchor = options.anchor
                ? `<a jq-md-heading-anchor href="#${anchorId}" aria-label="Anchor">#</a>`
                : '';
            return `<h${level} id="${anchorId}">${text}${anchor}</h${level}>`;
        };

        renderer.link = function (href, title, text) {
            const attributes = [];
            attributes.push(`href="${escapeHtml(resolveHref(href, options.baseUrl))}"`);
            if (title) attributes.push(`title="${escapeHtml(title)}"`);
            if (options.targetBlank) {
                attributes.push('target="_blank"');
                attributes.push('rel="noopener noreferrer"');
            }
            return `<a ${attributes.join(' ')}>${text}</a>`;
        };

        renderer.image = function (href, title, text) {
            const src = escapeHtml(resolveHref(href, options.baseUrl));
            const alt = escapeHtml(text || '');
            const caption = text ? `<figcaption>${escapeHtml(text)}</figcaption>` : '';
            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            return `<figure><img src="${src}" alt="${alt}"${titleAttr}>${caption}</figure>`;
        };

        renderer.code = function (code, language) {
            const lang = String(language || '').trim().toLowerCase();
            const safeCode = escapeHtml(code || '');
            if (lang === 'mermaid') {
                return `<div jq-md-mermaid class="mermaid">${safeCode}</div>`;
            }
            const className = lang ? `language-${lang}` : 'language-plaintext';
            return `<pre><code class="${className}" data-language="${escapeHtml(lang || 'plaintext')}">${safeCode}</code></pre>`;
        };

        renderer.table = function (header, body) {
            return `<div style="overflow:auto;"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
        };

        return renderer;
    }

    function resolveHref(href, baseUrl) {
        if (!href) return '';
        if (!baseUrl) return href;
        try {
            return new URL(href, baseUrl).toString();
        } catch (error) {
            return href;
        }
    }

    async function parseMarkdown(markdown, options) {
        await ensureParser();
        const tocItems = [];
        const renderer = createRenderer(options, tocItems);
        runtime.parser.use({
            gfm: options.gfm,
            breaks: options.breaks,
            renderer
        });
        const html = runtime.parser.parse(cleanMarkdown(markdown || ''));
        if (!options.sanitize) return { html, toc: tocItems };
        const sanitized = runtime.purifier.sanitize(html, {
            ADD_TAGS: ['mjx-container', 'svg', 'g', 'path', 'rect', 'circle', 'line', 'text', 'marker', 'defs', 'foreignObject'],
            ADD_ATTR: ['viewBox', 'width', 'height', 'd', 'fill', 'stroke', 'transform', 'style', 'xmlns', 'marker-end', 'marker-start', 'target', 'rel']
        });
        return { html: sanitized, toc: tocItems };
    }

    async function renderMermaid(container) {
        const nodes = Array.from(container.querySelectorAll('.mermaid'));
        if (!nodes.length) return;
        const mermaid = await ensureMermaid();
        if (!mermaid) return;
        try {
            await mermaid.run({ nodes });
        } catch (error) {}
    }

    async function renderMath(container) {
        const math = await ensureMath();
        if (!math?.typesetPromise) return;
        try {
            await math.typesetPromise([container]);
        } catch (error) {}
    }

    function renderTOC(target, tocItems) {
        if (!target) return null;
        const container = resolveElement(target);
        if (!container) return null;
        container.setAttribute('jq-md-toc', '');
        container.innerHTML = tocItems.map(item => {
            const indent = Math.max(0, item.level - 1) * 12;
            return `<a href="#${item.id}" style="padding-left:${indent}px;">${escapeHtml(item.text)}</a>`;
        }).join('');
        return container;
    }

    async function highlightCode(container) {
        const api = JquanUIComponents.codeBlockApi;
        if (!api || typeof api.render !== 'function') return;
        const nodes = Array.from(container.querySelectorAll('pre code'));
        for (let i = 0; i < nodes.length; i += 1) {
            await api.render(nodes[i], {
                selector: null,
                autoDetect: true,
                lineNumbers: true,
                copyButton: true,
                langLabel: true
            });
        }
    }

    async function readSource(options, element) {
        if (options.source) return options.source;
        if (options.src) {
            const response = await fetch(options.src, {
                headers: { Accept: 'text/markdown,text/plain;q=0.9,*/*;q=0.8' }
            });
            if (!response.ok) {
                throw new Error(`[JquanUI mdViewer] Failed to load markdown: ${options.src} (${response.status})`);
            }
            return response.text();
        }
        if (element) {
            const scriptId = element.getAttribute('data-md-script');
            if (scriptId) {
                const script = document.getElementById(scriptId);
                if (script) return script.textContent || '';
            }
            const sourceSelector = element.getAttribute('data-md-source');
            if (sourceSelector) {
                const sourceNode = document.querySelector(sourceSelector);
                if (sourceNode) return sourceNode.textContent || sourceNode.innerText || '';
            }
            const inline = element.querySelector('script[type="text/markdown"]');
            if (inline) return inline.textContent || '';
            return decodeHtml(element.innerHTML);
        }
        return '';
    }

    function instanceRecord(id, element, options) {
        return {
            id,
            element,
            options,
            observer: null,
            toc: [],
            markdown: '',
            html: ''
        };
    }

    async function mount(target, inputOptions = {}) {
        injectStyles();
        const element = resolveElement(target);
        if (!element) throw new Error(`[JquanUI mdViewer] Container not found: ${target}`);

        const options = normalizeOptions(Object.assign({}, readOptionsFromElement(element), inputOptions));
        const id = element.id || nextId();
        element.id = id;

        if (runtime.instances.has(id)) {
            destroy(id);
        }

        const record = instanceRecord(id, element, options);
        runtime.instances.set(id, record);

        if (options.autoRender) {
            await render(id);
        }

        if (options.autoObserve) {
            record.observer = new MutationObserver(() => {
                if (record.__rendering) return;
                render(id).catch(() => {});
            });
            record.observer.observe(element, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        return createHandle(record);
    }

    async function render(target, override = {}) {
        const record = resolveRecord(target);
        if (!record) throw new Error('[JquanUI mdViewer] Instance not found.');
        const options = normalizeOptions(Object.assign({}, record.options, override));
        record.options = options;
        record.__rendering = true;
        const element = record.element;

        element.classList.add(options.loadingClass);
        element.classList.remove(options.errorClass, options.emptyClass);

        try {
            const markdown = override.source != null ? override.source : await readSource(options, element);
            record.markdown = markdown || '';
            const parsed = await parseMarkdown(markdown, options);
            record.html = parsed.html;
            record.toc = parsed.toc;

            element.innerHTML = `<div jq-md-content>${parsed.html}</div>`;

            if (!cleanMarkdown(markdown)) {
                element.classList.add(options.emptyClass);
            }

            if (options.highlight) await highlightCode(element);
            if (options.mermaid) await renderMermaid(element);
            if (options.math) await renderMath(element);
            if (options.toc && (options.tocSelector || override.tocSelector)) {
                renderTOC(override.tocSelector || options.tocSelector, parsed.toc);
            }

            element.classList.remove(options.loadingClass, options.errorClass);
            element.classList.add(options.renderClass);

            if (typeof options.onRender === 'function') {
                options.onRender({
                    id: record.id,
                    element,
                    html: record.html,
                    markdown: record.markdown,
                    toc: record.toc
                });
            }
            return createHandle(record);
        } catch (error) {
            element.classList.remove(options.loadingClass);
            element.classList.add(options.errorClass);
            if (typeof options.onError === 'function') options.onError(error);
            throw error;
        } finally {
            record.__rendering = false;
        }
    }

    function update(target, patch = {}) {
        const record = resolveRecord(target);
        if (!record) return null;
        record.options = normalizeOptions(Object.assign({}, record.options, patch));
        return createHandle(record);
    }

    function resolveRecord(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            const element = resolveElement(target);
            if (element?.id && runtime.instances.has(element.id)) return runtime.instances.get(element.id);
            return null;
        }
        if (target instanceof HTMLElement && target.id && runtime.instances.has(target.id)) {
            return runtime.instances.get(target.id);
        }
        return null;
    }

    function destroy(target) {
        const record = resolveRecord(target);
        if (!record) return false;
        if (record.observer) record.observer.disconnect();
        runtime.instances.delete(record.id);
        return true;
    }

    function createHandle(record) {
        return {
            id: record.id,
            element() {
                return record.element;
            },
            options() {
                return Object.assign({}, record.options);
            },
            html() {
                return record.html;
            },
            markdown() {
                return record.markdown;
            },
            toc() {
                return record.toc.slice();
            },
            render(override = {}) {
                return render(record.id, override);
            },
            update(patch = {}) {
                return update(record.id, patch);
            },
            destroy() {
                return destroy(record.id);
            }
        };
    }

    function readOptionsFromElement(element) {
        return {
            src: element.getAttribute('data-md-src') || '',
            toc: normalizeBoolean(element.getAttribute('data-md-toc'), false),
            tocSelector: element.getAttribute('data-md-toc-target') || '',
            highlight: normalizeBoolean(element.getAttribute('data-md-highlight'), true),
            mermaid: normalizeBoolean(element.getAttribute('data-md-mermaid'), true),
            math: normalizeBoolean(element.getAttribute('data-md-math'), false),
            sanitize: normalizeBoolean(element.getAttribute('data-md-sanitize'), true),
            autoObserve: normalizeBoolean(element.getAttribute('data-md-observe'), false),
            baseUrl: element.getAttribute('data-md-base-url') || '',
            source: element.getAttribute('data-md-source-text') || ''
        };
    }

    const mdViewerApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        render(target, override = {}) {
            return render(target, override);
        },
        update(target, patch = {}) {
            return update(target, patch);
        },
        get(target) {
            const record = resolveRecord(target);
            return record ? createHandle(record) : null;
        },
        destroy(target) {
            return destroy(target);
        },
        parse(markdown, options = {}) {
            return parseMarkdown(markdown, normalizeOptions(options));
        }
    };

    JquanUIComponents.mdViewerApi = mdViewerApi;

    JquanUIComponents.mdViewer = {
        name: 'jquanui-md-viewer',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-md], [data-jq-md]',
                setup(node) {
                    mount(node).catch(() => {});
                    return () => {
                        if (node.id) destroy(node.id);
                    };
                }
            });
        }
    };
})(window);
