(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map(),
        stylesInjected: false,
        templates: Object.create(null),
        filters: Object.create(null),
        compiledCache: new Map(),
        loader: null,
        loaderGeneration: 0,
        hmrHandler: null,
        templateCache: new Map(),
        pendingLoads: new Map(),
        templateMeta: new Map()
    };

    const defaults = {
        selector: '[jq-template], [data-jq-template]',
        template: '',
        source: '',
        data: {},
        templates: {},
        filters: {},
        mode: 'replace',
        patch: false,
        sanitize: false,
        safe: false,
        safeFilters: ['upper', 'lower', 'json', 'join', 'length', 'default', 'currency', 'date'],
        safeResourceProtocols: ['http', 'https', 'mailto', 'tel'],
        safeDataImages: true,
        safeSanitizer: null,
        cache: true,
        cacheLimit: 500,
        safeExpressions: false,
        autoRender: true,
        loadingClass: 'is-loading',
        errorClass: 'is-error',
        renderClass: 'is-rendered',
        emptyClass: 'is-empty',
        onRender: null,
        onError: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-template-${runtime.seed}`;
    }

    function injectStyles() {
        if (runtime.stylesInjected) return;
        runtime.stylesInjected = true;
        const style = document.createElement('style');
        style.id = 'jquanui-template-styles';
        style.textContent = `
[jq-template],[data-jq-template]{
  display:block;
  width:100%;
}
[jq-template].is-loading,[data-jq-template].is-loading{
  opacity:.7;
}
[jq-template].is-empty,[data-jq-template].is-empty{
  min-height:24px;
}
[jq-template].is-error,[data-jq-template].is-error{
  color:rgb(185 28 28 / 1);
}
        `;
        document.head.appendChild(style);
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.mode = merged.mode === 'append' ? 'append' : 'replace';
        merged.patch = merged.patch === true;
        merged.sanitize = merged.sanitize === true;
        merged.safe = merged.safe === true;
        merged.cache = merged.cache !== false;
        merged.cacheLimit = normalizeCacheLimit(merged.cacheLimit, defaults.cacheLimit);
        merged.safeExpressions = merged.safeExpressions === true;
        merged.safeFilters = Array.isArray(merged.safeFilters)
            ? Array.from(new Set(merged.safeFilters.map(name => String(name || '').trim()).filter(Boolean)))
            : defaults.safeFilters.slice();
        merged.safeResourceProtocols = Array.isArray(merged.safeResourceProtocols)
            ? Array.from(new Set(merged.safeResourceProtocols.map(protocol => String(protocol || '').trim().toLowerCase().replace(/:$/, '')).filter(protocol => /^[a-z][a-z0-9+.-]*$/.test(protocol))))
            : defaults.safeResourceProtocols.slice();
        merged.safeDataImages = merged.safeDataImages !== false;
        merged.safeSanitizer = typeof merged.safeSanitizer === 'function' ? merged.safeSanitizer : null;
        if (merged.safe) {
            merged.sanitize = true;
            merged.safeExpressions = true;
        }
        merged.autoRender = merged.autoRender !== false;
        merged.data = isPlainObject(merged.data) ? merged.data : {};
        merged.templates = isPlainObject(merged.templates) ? merged.templates : {};
        merged.filters = isPlainObject(merged.filters) ? merged.filters : {};
        return merged;
    }

    function isPlainObject(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    }

    function normalizeCacheLimit(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
    }

    function normalizeTtl(value) {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : 0;
    }

    function normalizeExtensions(value) {
        const input = Array.isArray(value) && value.length ? value : ['.html', '.htm'];
        return Array.from(new Set(input.map(extension => {
            const normalized = String(extension || '').trim().toLowerCase();
            return normalized && normalized.startsWith('.') ? normalized : `.${normalized}`;
        }).filter(extension => extension.length > 1)));
    }

    function resolveLoaderRequest(name, loader) {
        let request = String(name == null ? '' : name).trim().replace(/^['"]|['"]$/g, '');
        if (!request || /[\0\\]/.test(request)) throw new Error(`Invalid external template name: ${name}`);
        if (!loader.allowParent && request.split('/').includes('..')) throw new Error(`Parent template paths are disabled: ${request}`);
        const remote = /^[a-z][a-z0-9+.-]*:/i.test(request) || request.startsWith('//');
        if (remote && !loader.allowRemote) throw new Error(`Remote template URLs are disabled: ${request}`);
        if (!remote && !/\.[a-z0-9]+(?:[?#].*)?$/i.test(request) && loader.extensions.length) {
            request += loader.extensions[0];
        }
        const cleanPath = request.split(/[?#]/)[0].toLowerCase();
        if (loader.extensions.length && !loader.extensions.some(extension => cleanPath.endsWith(extension))) {
            throw new Error(`Unsupported template extension: ${request}`);
        }
        const base = loader.base;
        const url = remote || request.startsWith('/') || !base
            ? request
            : `${base.replace(/\/$/, '')}/${request.replace(/^\//, '')}`;
        return { name: request, url, key: `${loader.name}@${loader.version}:${url}` };
    }

    function createFileLoader(options = {}) {
        const config = isPlainObject(options) ? options : {};
        const cacheConfig = isPlainObject(config.cache) ? config.cache : {};
        const loader = {
            name: String(config.name || 'JQFileLoader'),
            base: String(config.base == null ? './templates/' : config.base),
            extensions: normalizeExtensions(config.extensions),
            cache: config.cache !== false && cacheConfig.enabled !== false,
            maxEntries: normalizeCacheLimit(config.maxEntries ?? cacheConfig.maxEntries, 128),
            ttl: normalizeTtl(config.ttl ?? cacheConfig.ttl),
            version: String(config.version ?? cacheConfig.version ?? 'default'),
            allowParent: config.allowParent === true,
            allowRemote: config.allowRemote === true,
            fetchOptions: isPlainObject(config.fetchOptions) ? Object.assign({}, config.fetchOptions) : {},
            load: typeof config.load === 'function' ? config.load : null
        };
        if (!loader.load) {
            loader.load = async (name, context) => {
                if (typeof global.fetch !== 'function') throw new Error('[JquanUI template] fetch() is unavailable for JQFileLoader.');
                const response = await global.fetch(context.url, loader.fetchOptions);
                if (!response || !response.ok) {
                    const status = response ? `${response.status} ${response.statusText || ''}`.trim() : 'no response';
                    throw new Error(`Template request failed: ${context.url} (${status})`);
                }
                return await response.text();
            };
        }
        return loader;
    }

    function normalizeLoader(input) {
        if (typeof input === 'function') return createFileLoader({ load: input });
        if (!isPlainObject(input)) throw new Error('[JquanUI template] Loader must be a function or options object.');
        return createFileLoader(input);
    }

    function trimTemplateCache(loader) {
        const limit = loader.maxEntries;
        while (runtime.templateCache.size > limit) {
            const key = runtime.templateCache.keys().next().value;
            runtime.templateCache.delete(key);
            runtime.templateMeta.delete(key);
        }
        while (runtime.templateMeta.size > limit) {
            const key = runtime.templateMeta.keys().next().value;
            runtime.templateMeta.delete(key);
            runtime.templateCache.delete(key);
        }
    }

    function readCachedTemplate(request, loader) {
        if (!loader.cache || !runtime.templateCache.has(request.key)) return { hit: false, value: '' };
        const source = runtime.templateCache.get(request.key);
        const meta = runtime.templateMeta.get(request.key);
        const now = Date.now();
        if (!meta || meta.version !== loader.version || (meta.expiresAt && now >= meta.expiresAt)) {
            runtime.templateCache.delete(request.key);
            if (meta) {
                meta.expired = true;
                meta.expiredAt = now;
            }
            return { hit: false, value: '' };
        }
        meta.hits += 1;
        meta.lastAccessedAt = now;
        runtime.templateCache.delete(request.key);
        runtime.templateCache.set(request.key, source);
        runtime.templateMeta.delete(request.key);
        runtime.templateMeta.set(request.key, meta);
        return { hit: true, value: source };
    }

    function normalizeTemplatePath(value) {
        return String(value == null ? '' : value)
            .trim()
            .replace(/\\/g, '/')
            .split(/[?#]/)[0]
            .replace(/^\.\//, '')
            .toLowerCase();
    }

    function matchesTemplateMeta(meta, target) {
        const normalizedTarget = normalizeTemplatePath(target);
        if (!normalizedTarget || !meta) return false;
        const name = normalizeTemplatePath(meta.name);
        const url = normalizeTemplatePath(meta.url);
        return name === normalizedTarget
            || url === normalizedTarget
            || normalizedTarget.endsWith(`/${name}`)
            || url.endsWith(`/${normalizedTarget}`);
    }

    function invalidateTemplates(names) {
        const list = (Array.isArray(names) ? names : [names]).filter(Boolean);
        const keys = [];
        if (!list.length) {
            keys.push(...runtime.templateMeta.keys());
        } else {
            runtime.templateMeta.forEach((meta, key) => {
                if (list.some(name => matchesTemplateMeta(meta, name))) keys.push(key);
            });
        }
        runtime.loaderGeneration += 1;
        runtime.pendingLoads.clear();
        keys.forEach(key => {
            runtime.templateCache.delete(key);
            runtime.templateMeta.delete(key);
        });
        return keys.length;
    }

    async function loadExternalTemplate(name, record) {
        const loader = runtime.loader;
        if (!loader) throw new Error(`Template not found: ${name}`);
        const generation = runtime.loaderGeneration;
        const request = resolveLoaderRequest(name, loader);
        const cached = readCachedTemplate(request, loader);
        if (cached.hit) return cached.value;
        if (runtime.pendingLoads.has(request.key)) return await runtime.pendingLoads.get(request.key);

        const pending = Promise.resolve(loader.load(request.name, {
            name: request.name,
            url: request.url,
            key: request.key,
            base: loader.base,
            loader: loader.name,
            options: record && record.options ? record.options : {}
        })).then(value => {
            if (typeof value !== 'string') throw new Error(`Template loader "${loader.name}" must return a string: ${request.name}`);
            const source = normalizeTemplateSource(value);
            if (runtime.loader === loader && runtime.loaderGeneration === generation) {
                const loadedAt = Date.now();
                if (loader.cache && loader.maxEntries > 0) runtime.templateCache.set(request.key, source);
                runtime.templateMeta.set(request.key, {
                    name: request.name,
                    url: request.url,
                    loader: loader.name,
                    version: loader.version,
                    bytes: source.length,
                    loadedAt,
                    lastAccessedAt: loadedAt,
                    expiresAt: loader.ttl > 0 ? loadedAt + loader.ttl : null,
                    hits: 0,
                    expired: false
                });
                trimTemplateCache(loader);
            }
            return source;
        }).finally(() => {
            if (runtime.pendingLoads.get(request.key) === pending) runtime.pendingLoads.delete(request.key);
        });

        runtime.pendingLoads.set(request.key, pending);
        return await pending;
    }

    function normalizeTemplateSource(input) {
        const source = String(input == null ? '' : input).replace(/\r\n?/g, '\n');
        if (!source.trim()) return '';
        const trimmed = source.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
        const lines = trimmed.split('\n');
        let indent = Infinity;
        lines.forEach(line => {
            if (!line.trim()) return;
            const match = line.match(/^[\t ]*/);
            indent = Math.min(indent, match ? match[0].length : 0);
        });
        if (!Number.isFinite(indent) || indent <= 0) return trimmed;
        return lines.map(line => line.trim() ? line.slice(indent) : '').join('\n');
    }

    function shouldSkipWhitespaceText(value) {
        const text = String(value == null ? '' : value);
        return /^[\t \n\r]+$/.test(text) && /[\n\r]/.test(text);
    }

    function resolveElement(target) {
        if (typeof target === 'string') {
            try {
                return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
            } catch (error) {
                return document.getElementById(target.replace(/^#/, ''));
            }
        }
        return target instanceof HTMLElement ? target : null;
    }

    function resolveInstance(target) {
        const element = resolveElement(target);
        if (!element) return null;
        if (runtime.instances.has(element.id)) return runtime.instances.get(element.id);
        for (const record of runtime.instances.values()) {
            if (record.element === element) return record;
        }
        return null;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, token => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[token]));
    }

    function sanitizeHtml(value, options = {}) {
        const protocols = Array.isArray(options.safeResourceProtocols) ? options.safeResourceProtocols : defaults.safeResourceProtocols;
        const allowDataImages = options.safeDataImages !== false;
        if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
            let output = String(value == null ? '' : value);
            output = output.replace(/<(?:script|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/(?:script|iframe|object|embed|link|meta)\s*>|<\/?(?:script|iframe|object|embed|link|meta)\b[^>]*>/gi, '');
            output = output.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
            output = output.replace(/\s+(?:src|href|xlink:href)\s*=\s*("|')\s*([^"']*)\1/gi, (match, quote, resource) => isSafeResourceUrl(resource, protocols, allowDataImages) ? match : '');
            return output;
        }
        const template = document.createElement('template');
        template.innerHTML = String(value == null ? '' : value);
        const blockedTags = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta']);
        const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null);
        const targets = [];
        while (walker.nextNode()) {
            targets.push(walker.currentNode);
        }
        targets.forEach(node => {
            const tag = String(node.tagName || '').toLowerCase();
            if (blockedTags.has(tag)) {
                node.remove();
                return;
            }
            Array.from(node.attributes).forEach(attribute => {
                const name = String(attribute.name || '').toLowerCase();
                const value = String(attribute.value || '');
                if (name.startsWith('on')) {
                    node.removeAttribute(attribute.name);
                    return;
                }
                if ((name === 'src' || name === 'href' || name === 'xlink:href') && !isSafeResourceUrl(value, protocols, allowDataImages)) {
                    node.removeAttribute(attribute.name);
                }
            });
        });
        return template.innerHTML;
    }

    function isSafeResourceUrl(value, protocols = defaults.safeResourceProtocols, allowDataImages = true) {
        const source = String(value || '').trim();
        if (!source || /^(?:#|\/|\.\.?\/)/.test(source)) return true;
        const protocol = source.match(/^([a-z][a-z0-9+.-]*):/i);
        if (protocol && protocols.includes(protocol[1].toLowerCase())) return true;
        if (allowDataImages && /^data:image\/(?:gif|jpe?g|png|webp|avif);base64,/i.test(source)) return true;
        return false;
    }

    function safeRenderHtml(value, options) {
        const sanitized = sanitizeHtml(value, options);
        if (!options || typeof options.safeSanitizer !== 'function') return sanitized;
        const result = options.safeSanitizer(sanitized, {
            protocols: options.safeResourceProtocols.slice(),
            allowDataImages: options.safeDataImages
        });
        return typeof result === 'string' ? result : sanitized;
    }

    function toCollection(value) {
        if (Array.isArray(value)) {
            return value.map((item, index) => ({
                key: index,
                value: item,
                index
            }));
        }
        if (value && typeof value === 'object') {
            return Object.keys(value).map((key, index) => ({
                key,
                value: value[key],
                index
            }));
        }
        return [];
    }

    function splitTopLevel(input, separator) {
        const text = String(input || '');
        const parts = [];
        let current = '';
        let depthParen = 0;
        let depthBrace = 0;
        let depthBracket = 0;
        let quote = '';
        for (let index = 0; index < text.length; index += 1) {
            const char = text[index];
            const next = text[index + 1];
            if (quote) {
                current += char;
                if (char === '\\') {
                    index += 1;
                    current += text[index] || '';
                    continue;
                }
                if (char === quote) quote = '';
                continue;
            }
            if (char === '"' || char === "'" || char === '`') {
                quote = char;
                current += char;
                continue;
            }
            if (char === '(') depthParen += 1;
            else if (char === ')') depthParen = Math.max(0, depthParen - 1);
            else if (char === '{') depthBrace += 1;
            else if (char === '}') depthBrace = Math.max(0, depthBrace - 1);
            else if (char === '[') depthBracket += 1;
            else if (char === ']') depthBracket = Math.max(0, depthBracket - 1);

            if (separator === '|' && char === '|' && next === '|') {
                current += '||';
                index += 1;
                continue;
            }

            if (depthParen === 0 && depthBrace === 0 && depthBracket === 0 && char === separator) {
                parts.push(current.trim());
                current = '';
                continue;
            }

            current += char;
        }
        if (current || !parts.length) parts.push(current.trim());
        return parts.filter((part, index) => part || index === 0);
    }

    function transformFilters(expression) {
        const segments = splitTopLevel(expression, '|');
        let output = segments.shift() || '';
        segments.forEach(segment => {
            if (!segment) return;
            const match = segment.match(/^([a-zA-Z_$][\w$]*)(?:\(([\s\S]*)\))?$/);
            if (!match) throw new Error(`Invalid filter syntax: ${segment}`);
            const name = match[1];
            const args = match[2] && match[2].trim() ? `, ${match[2].trim()}` : '';
            output = `helpers.applyFilter(${JSON.stringify(name)}, (${output})${args})`;
        });
        return output;
    }

    function isUnsafeExpression(source) {
        return /(?:\bwindow\b|\bdocument\b|\bglobalThis\b|\bFunction\b|\beval\b|=>|new\s+|;|__proto__|prototype|constructor|\[[^\]]*\]|\bthis\b)/.test(source);
    }

    function evaluateExpression(expression, scope, helpers, options) {
        const source = transformFilters(String(expression || '').trim());
        if (options && options.safeExpressions && isUnsafeExpression(source)) {
            throw new Error(`Unsafe expression blocked: ${expression}`);
        }
        try {
            return Function('scope', 'helpers', `
                with (scope) {
                    return (${source});
                }
            `)(scope, helpers);
        } catch (error) {
            throw new Error(`Expression failed: ${expression}. ${error.message}`);
        }
    }

    function parseTag(content) {
        const source = String(content || '').trim();
        if (!source) return { type: 'comment' };
        let match = source.match(/^if\s+([\s\S]+)$/);
        if (match) return { type: 'if', test: match[1].trim() };
        match = source.match(/^elseif\s+([\s\S]+)$/);
        if (match) return { type: 'elseif', test: match[1].trim() };
        if (source === 'else') return { type: 'else' };
        if (source === 'endif') return { type: 'endif' };
        match = source.match(/^for\s+([a-zA-Z_$][\w$]*)(?:\s*,\s*([a-zA-Z_$][\w$]*))?\s+in\s+([\s\S]+)$/);
        if (match) return {
            type: 'for',
            valueName: match[1],
            keyName: match[2] || '',
            iterable: match[3].trim()
        };
        if (source === 'endfor') return { type: 'endfor' };
        match = source.match(/^set\s+([a-zA-Z_$][\w$]*)\s*=\s*([\s\S]+)$/);
        if (match) return { type: 'set', name: match[1], expression: match[2].trim() };
        match = source.match(/^include\s+(.+?)(?:\s+with\s+([\s\S]+))?$/);
        if (match) return { type: 'include', template: match[1].trim(), context: match[2] ? match[2].trim() : '' };
        match = source.match(/^layout\s+(.+?)(?:\s+with\s+([\s\S]+))?$/);
        if (match) return { type: 'layout', template: match[1].trim(), context: match[2] ? match[2].trim() : '' };
        if (source === 'endlayout') return { type: 'endlayout' };
        match = source.match(/^slot\s+(.+)$/);
        if (match) return { type: 'slot', name: match[1].trim() };
        if (source === 'endslot') return { type: 'endslot' };
        match = source.match(/^renderSlot\s+(.+)$/);
        if (match) return { type: 'renderSlot', name: match[1].trim() };
        throw new Error(`Unknown tag: ${source}`);
    }

    function positionFromIndex(source, index) {
        const safeIndex = Math.max(0, Math.min(Number(index) || 0, String(source || '').length));
        const before = String(source || '').slice(0, safeIndex);
        const lines = before.split('\n');
        return {
            index: safeIndex,
            line: lines.length,
            column: lines[lines.length - 1].length + 1
        };
    }

    function enrichError(error, source, index, extra) {
        const nextError = error instanceof Error ? error : new Error(String(error));
        if (!nextError.position) {
            nextError.position = Object.assign(positionFromIndex(source, index), extra || {});
        }
        if (!nextError.templateContext) {
            const location = nextError.position;
            nextError.templateContext = `${location.line}:${location.column}`;
        }
        if (!/\(line\s+\d+,\s*col\s+\d+\)/.test(nextError.message)) {
            nextError.message = `${nextError.message} (line ${nextError.position.line}, col ${nextError.position.column})`;
        }
        if (!nextError.snippet) {
            const lines = String(source || '').split('\n');
            const lineNumber = Math.max(1, nextError.position.line || 1);
            const start = Math.max(1, lineNumber - 1);
            const end = Math.min(lines.length, lineNumber + 1);
            nextError.snippet = lines.slice(start - 1, end).map((line, offset) => ({
                line: start + offset,
                text: line
            }));
        }
        return nextError;
    }

    function enrichTemplateTrace(error, templateName, chain) {
        const nextError = error instanceof Error ? error : new Error(String(error));
        const name = String(templateName || '').trim();
        const includeChain = (Array.isArray(chain) ? chain : []).map(item => String(item || '').trim()).filter(Boolean);
        if (!nextError.templateName && name) nextError.templateName = name;
        if (!nextError.includeChain) nextError.includeChain = includeChain;
        if (!nextError.templateTraceAdded && (name || includeChain.length)) {
            const details = [];
            if (name) details.push(`template: ${name}`);
            if (includeChain.length) details.push(`include: ${includeChain.join(' -> ')}`);
            nextError.message = `${nextError.message} [${details.join('; ')}]`;
            nextError.templateTraceAdded = true;
        }
        return nextError;
    }

    function evaluateNodeExpression(expression, node, scope, helpers, record) {
        try {
            return evaluateExpression(expression, scope, helpers, record.options);
        } catch (error) {
            throw enrichError(error, record.template, node && node.position ? node.position.index : 0, node && node.position ? node.position : {});
        }
    }

    function createIfNode(test) {
        return {
            type: 'if',
            branches: [{
                test,
                body: []
            }],
            elseBody: null
        };
    }

    function compileTemplate(template) {
        const source = normalizeTemplateSource(template);
        const root = { type: 'root', body: [] };
        const containerStack = [root.body];
        const blockStack = [];
        const pattern = /(\{\!\![\s\S]*?\!\!\}|\{\{[\s\S]*?\}\}|\{\%[\s\S]*?\%\}|\{\#[\s\S]*?\#\})/g;
        let lastIndex = 0;
        let match;

        function currentBody() {
            return containerStack[containerStack.length - 1];
        }

        while ((match = pattern.exec(source))) {
            if (match.index > lastIndex) {
                const textValue = source.slice(lastIndex, match.index);
                if (!shouldSkipWhitespaceText(textValue)) {
                    currentBody().push({ type: 'text', value: textValue });
                }
            }
            const token = match[0];
            if (token.startsWith('{{')) {
                    currentBody().push({
                        type: 'output',
                        expression: token.slice(2, -2).trim(),
                        escape: true,
                        position: positionFromIndex(source, match.index)
                    });
            } else if (token.startsWith('{!!')) {
                currentBody().push({
                    type: 'output',
                    expression: token.slice(3, -3).trim(),
                    escape: false,
                    position: positionFromIndex(source, match.index)
                });
            } else if (token.startsWith('{#')) {
                currentBody().push({ type: 'comment' });
            } else if (token.startsWith('{%')) {
                let parsed;
                try {
                    parsed = parseTag(token.slice(2, -2));
                } catch (error) {
                    throw enrichError(error, source, match.index);
                }
                if (parsed.type === 'if') {
                    const node = createIfNode(parsed.test);
                    node.position = positionFromIndex(source, match.index);
                    currentBody().push(node);
                    blockStack.push(node);
                    containerStack.push(node.branches[0].body);
                } else if (parsed.type === 'elseif') {
                    const active = blockStack[blockStack.length - 1];
                    if (!active || active.type !== 'if') throw enrichError(new Error('Unexpected elseif without matching if.'), source, match.index);
                    containerStack.pop();
                    const branch = { test: parsed.test, body: [], position: positionFromIndex(source, match.index) };
                    active.branches.push(branch);
                    containerStack.push(branch.body);
                } else if (parsed.type === 'else') {
                    const active = blockStack[blockStack.length - 1];
                    if (!active || active.type !== 'if') throw enrichError(new Error('Unexpected else without matching if.'), source, match.index);
                    containerStack.pop();
                    active.elseBody = [];
                    containerStack.push(active.elseBody);
                } else if (parsed.type === 'endif') {
                    const active = blockStack.pop();
                    if (!active || active.type !== 'if') throw enrichError(new Error('Unexpected endif without matching if.'), source, match.index);
                    containerStack.pop();
                } else if (parsed.type === 'for') {
                    const node = {
                        type: 'for',
                        valueName: parsed.valueName,
                        keyName: parsed.keyName,
                        iterable: parsed.iterable,
                        body: [],
                        position: positionFromIndex(source, match.index)
                    };
                    currentBody().push(node);
                    blockStack.push(node);
                    containerStack.push(node.body);
                } else if (parsed.type === 'endfor') {
                    const active = blockStack.pop();
                    if (!active || active.type !== 'for') throw enrichError(new Error('Unexpected endfor without matching for.'), source, match.index);
                    containerStack.pop();
                } else if (parsed.type === 'layout') {
                    const node = {
                        type: 'layout',
                        template: parsed.template,
                        context: parsed.context,
                        body: [],
                        position: positionFromIndex(source, match.index)
                    };
                    currentBody().push(node);
                    blockStack.push(node);
                    containerStack.push(node.body);
                } else if (parsed.type === 'endlayout') {
                    const active = blockStack.pop();
                    if (!active || active.type !== 'layout') throw enrichError(new Error('Unexpected endlayout without matching layout.'), source, match.index);
                    containerStack.pop();
                } else if (parsed.type === 'slot') {
                    const node = {
                        type: 'slot',
                        name: parsed.name,
                        body: [],
                        position: positionFromIndex(source, match.index)
                    };
                    currentBody().push(node);
                    blockStack.push(node);
                    containerStack.push(node.body);
                } else if (parsed.type === 'endslot') {
                    const active = blockStack.pop();
                    if (!active || active.type !== 'slot') throw enrichError(new Error('Unexpected endslot without matching slot.'), source, match.index);
                    containerStack.pop();
                } else {
                    parsed.position = positionFromIndex(source, match.index);
                    currentBody().push(parsed);
                }
            }
            lastIndex = pattern.lastIndex;
        }

        if (lastIndex < source.length) {
            const tailText = source.slice(lastIndex);
            if (!shouldSkipWhitespaceText(tailText)) {
                currentBody().push({ type: 'text', value: tailText });
            }
        }

        if (blockStack.length) {
            const dangling = blockStack[blockStack.length - 1];
            throw enrichError(new Error(`Unclosed block: ${dangling.type}`), source, source.length, dangling.position || {});
        }

        return root;
    }

    function getCompiledTemplate(template, options) {
        const source = normalizeTemplateSource(template);
        const cacheLimit = normalizeCacheLimit(options && options.cacheLimit, defaults.cacheLimit);
        const useCache = (!options || options.cache !== false) && cacheLimit > 0;
        if (!useCache) return compileTemplate(source);
        if (runtime.compiledCache.has(source)) {
            const cached = runtime.compiledCache.get(source);
            runtime.compiledCache.delete(source);
            runtime.compiledCache.set(source, cached);
            return cached;
        }
        const ast = compileTemplate(source);
        runtime.compiledCache.set(source, ast);
        while (runtime.compiledCache.size > cacheLimit) {
            runtime.compiledCache.delete(runtime.compiledCache.keys().next().value);
        }
        return ast;
    }

    function extractDependenciesFromNodes(nodes, bag) {
        (nodes || []).forEach(node => {
            if (!node) return;
            if (node.type === 'include' || node.type === 'layout') {
                const raw = String(node.template || '').trim().replace(/^['"]|['"]$/g, '');
                if (/^[a-zA-Z0-9._:-]+$/.test(raw)) bag.add(raw);
            }
            if (node.type === 'if') {
                node.branches.forEach(branch => extractDependenciesFromNodes(branch.body, bag));
                if (node.elseBody) extractDependenciesFromNodes(node.elseBody, bag);
            }
            if (node.type === 'for' || node.type === 'layout' || node.type === 'slot') {
                extractDependenciesFromNodes(node.body, bag);
            }
        });
    }

    function extractDependencyDetailsFromNodes(nodes, staticBag, dynamicBag) {
        (nodes || []).forEach(node => {
            if (!node) return;
            if (node.type === 'include' || node.type === 'layout') {
                const expression = String(node.template || '').trim();
                const literal = expression.match(/^(['"])([\s\S]*)\1$/);
                if (literal) staticBag.add(literal[2]);
                else if (expression) dynamicBag.add(expression);
            }
            if (node.type === 'if') {
                node.branches.forEach(branch => extractDependencyDetailsFromNodes(branch.body, staticBag, dynamicBag));
                if (node.elseBody) extractDependencyDetailsFromNodes(node.elseBody, staticBag, dynamicBag);
            }
            if (node.type === 'for' || node.type === 'layout' || node.type === 'slot') {
                extractDependencyDetailsFromNodes(node.body, staticBag, dynamicBag);
            }
        });
    }

    function extractDependencyDetails(template, options = {}) {
        const ast = getCompiledTemplate(template, options);
        const staticBag = new Set();
        const dynamicBag = new Set();
        extractDependencyDetailsFromNodes(ast.body, staticBag, dynamicBag);
        return {
            dependencies: Array.from(staticBag),
            dynamicDependencies: Array.from(dynamicBag)
        };
    }

    function extractDependencies(template, options = {}) {
        const ast = getCompiledTemplate(template, options);
        const bag = new Set();
        extractDependenciesFromNodes(ast.body, bag);
        return Array.from(bag);
    }

    async function resolveTemplateDescriptor(name, record) {
        const key = String(name == null ? '' : name).trim().replace(/^['"]|['"]$/g, '');
        if (!key) throw new Error('Template name is required');
        if (Object.prototype.hasOwnProperty.call(record.templates, key)) {
            return { name: key, source: await resolveTemplateValueAsync(record.templates[key]), sourceType: 'options', url: null };
        }
        if (Object.prototype.hasOwnProperty.call(runtime.templates, key)) {
            return { name: key, source: await resolveTemplateValueAsync(runtime.templates[key]), sourceType: 'registry', url: null };
        }
        const node = document.getElementById(key);
        if (node) {
            return {
                name: key,
                source: node.tagName === 'TEMPLATE' ? node.innerHTML : (node.textContent || node.innerHTML || ''),
                sourceType: 'dom',
                url: null
            };
        }
        if (!runtime.loader) throw new Error(`Template not found: ${key}`);
        const request = resolveLoaderRequest(key, runtime.loader);
        const source = await loadExternalTemplate(key, record);
        return { name: request.name, source, sourceType: 'external', url: request.url };
    }

    async function buildDependencyGraph(name, options = {}) {
        const recursive = options.recursive !== false;
        const nodes = Object.create(null);
        const order = [];
        const cycles = [];
        const visited = new Set();
        const record = {
            templates: Object.assign({}, runtime.templates, isPlainObject(options.templates) ? options.templates : {}),
            options: normalizeOptions(options),
            state: { data: {} },
            renderStack: []
        };

        async function visit(requestedName, stack) {
            let descriptor;
            try {
                descriptor = await resolveTemplateDescriptor(requestedName, record);
            } catch (error) {
                throw enrichTemplateTrace(error, requestedName, stack.concat(String(requestedName || '')));
            }
            const key = descriptor.name;
            const cycleIndex = stack.indexOf(key);
            if (cycleIndex >= 0) {
                cycles.push(stack.slice(cycleIndex).concat(key));
                return key;
            }
            if (visited.has(key)) return key;
            visited.add(key);
            const dependencyDetails = extractDependencyDetails(descriptor.source, options);
            const dependencies = dependencyDetails.dependencies;
            nodes[key] = {
                name: key,
                sourceType: descriptor.sourceType,
                url: descriptor.url,
                dependencies: dependencies.slice(),
                dynamicDependencies: dependencyDetails.dynamicDependencies
            };
            order.push(key);
            if (recursive) {
                for (const dependency of dependencies) {
                    await visit(dependency, stack.concat(key));
                }
            }
            return key;
        }

        const entry = await visit(name, []);
        return { entry, nodes, order, cycles };
    }

    async function refreshTemplateInstances(names) {
        const invalidated = invalidateTemplates(names);
        const records = Array.from(runtime.instances.values());
        const results = await Promise.allSettled(records.map(record => renderAsync(record)));
        return {
            invalidated,
            rendered: results.filter(result => result.status === 'fulfilled').length,
            failed: results.filter(result => result.status === 'rejected').length
        };
    }

    function bindTemplateHmr() {
        if (runtime.hmrHandler || typeof global.addEventListener !== 'function') return;
        runtime.hmrHandler = event => {
            const detail = event && event.detail && typeof event.detail === 'object' ? event.detail : {};
            const names = detail.templates || detail.name || detail.relative || detail.file || null;
            refreshTemplateInstances(names).catch(error => {
                if (typeof console !== 'undefined') console.error('[JquanUI template] HMR refresh failed:', error);
            });
        };
        global.addEventListener('jquan:template:update', runtime.hmrHandler);
    }

    function unbindTemplateHmr() {
        if (!runtime.hmrHandler || typeof global.removeEventListener !== 'function') return;
        global.removeEventListener('jquan:template:update', runtime.hmrHandler);
        runtime.hmrHandler = null;
    }

    function createHelpers(record) {
        return {
            include(templateName, scopePatch) {
                const includeKey = String(templateName == null ? '' : templateName).trim().replace(/^['"]|['"]$/g, '');
                const stack = Array.isArray(record.renderStack) ? record.renderStack : (record.renderStack = []);
                if (stack.includes(includeKey)) {
                    throw enrichTemplateTrace(new Error(`Include cycle detected: ${stack.concat(includeKey).join(' -> ')}`), includeKey, stack.concat(includeKey));
                }
                let templateSource;
                try {
                    templateSource = resolveNamedTemplate(record, templateName);
                } catch (error) {
                    throw enrichTemplateTrace(error, includeKey, stack.concat(includeKey));
                }
                const nextScope = scopePatch && typeof scopePatch === 'object'
                    ? Object.assign(Object.create(null), record.state.data, scopePatch)
                    : record.state.data;
                stack.push(includeKey);
                try {
                    return renderTemplate(templateSource, nextScope, record);
                } catch (error) {
                    throw enrichTemplateTrace(error, includeKey, stack.slice());
                } finally {
                    stack.pop();
                }
            },
            renderSlot(name, fallbackScope) {
                const slotName = String(name == null ? 'default' : name).trim().replace(/^['"]|['"]$/g, '') || 'default';
                const slotMap = scopeSlots(fallbackScope);
                return Object.prototype.hasOwnProperty.call(slotMap, slotName) ? slotMap[slotName] : '';
            },
            applyFilter(name, value) {
                if (record.options.safe && !record.options.safeFilters.includes(String(name))) {
                    throw new Error(`Filter blocked by safe preset: ${name}`);
                }
                const filter = resolveFilter(record, name);
                if (typeof filter !== 'function') throw new Error(`Unknown filter: ${name}`);
                const args = Array.prototype.slice.call(arguments, 2);
                return filter.apply(null, [value].concat(args));
            }
        };
    }

    function resolveFilter(record, name) {
        return record.filters[name] || runtime.filters[name] || null;
    }

    function resolveNamedTemplate(record, templateName) {
        const key = String(templateName == null ? '' : templateName).trim().replace(/^['"]|['"]$/g, '');
        if (Object.prototype.hasOwnProperty.call(record.templates, key)) return resolveTemplateValue(record.templates[key]);
        if (Object.prototype.hasOwnProperty.call(runtime.templates, key)) return resolveTemplateValue(runtime.templates[key]);
        const node = document.getElementById(key);
        if (node) {
            return node.tagName === 'TEMPLATE' ? node.innerHTML : (node.textContent || node.innerHTML || '');
        }
        throw new Error(`Template not found: ${key}`);
    }

    async function resolveNamedTemplateAsync(record, templateName) {
        const key = String(templateName == null ? '' : templateName).trim().replace(/^['"]|['"]$/g, '');
        if (Object.prototype.hasOwnProperty.call(record.templates, key)) return await resolveTemplateValueAsync(record.templates[key]);
        if (Object.prototype.hasOwnProperty.call(runtime.templates, key)) return await resolveTemplateValueAsync(runtime.templates[key]);
        const node = document.getElementById(key);
        if (node) {
            return node.tagName === 'TEMPLATE' ? node.innerHTML : (node.textContent || node.innerHTML || '');
        }
        return await loadExternalTemplate(key, record);
    }

    function resolveTemplateValue(value) {
        const resolved = typeof value === 'function' ? value() : value;
        return typeof resolved === 'string' ? normalizeTemplateSource(resolved) : resolved;
    }

    async function resolveTemplateValueAsync(value) {
        const resolved = typeof value === 'function' ? value() : value;
        const output = resolved && typeof resolved.then === 'function' ? await resolved : resolved;
        return typeof output === 'string' ? normalizeTemplateSource(output) : output;
    }

    function scopeSlots(scope) {
        return scope && scope.slots && typeof scope.slots === 'object' ? scope.slots : {};
    }

    function renderNodes(nodes, scope, record) {
        const helpers = createHelpers(record);
        return nodes.map(node => {
            if (!node || node.type === 'comment') return '';
            if (node.type === 'text') return node.value;
            if (node.type === 'output') {
                let value;
                try {
                    value = evaluateExpression(node.expression, scope, helpers, record.options);
                } catch (error) {
                    throw enrichError(error, record.template, node.position ? node.position.index : 0, node.position || {});
                }
                return node.escape ? escapeHtml(value) : String(value == null ? '' : value);
            }
            if (node.type === 'set') {
                try {
                    scope[node.name] = evaluateExpression(node.expression, scope, helpers, record.options);
                } catch (error) {
                    throw enrichError(error, record.template, node.position ? node.position.index : 0, node.position || {});
                }
                return '';
            }
            if (node.type === 'include') {
                let nameValue;
                let patch;
                try {
                    nameValue = evaluateExpression(node.template, scope, helpers, record.options);
                    patch = node.context ? evaluateExpression(node.context, scope, helpers, record.options) : null;
                } catch (error) {
                    throw enrichError(error, record.template, node.position ? node.position.index : 0, node.position || {});
                }
                return helpers.include(nameValue, patch);
            }
            if (node.type === 'renderSlot') {
                let slotName;
                try {
                    slotName = evaluateExpression(node.name, scope, helpers, record.options);
                } catch (error) {
                    throw enrichError(error, record.template, node.position ? node.position.index : 0, node.position || {});
                }
                return helpers.renderSlot(slotName, scope);
            }
            if (node.type === 'if') {
                for (let index = 0; index < node.branches.length; index += 1) {
                    const branch = node.branches[index];
                    let passed = false;
                    try {
                        passed = evaluateExpression(branch.test, scope, helpers, record.options);
                    } catch (error) {
                        throw enrichError(error, record.template, branch.position ? branch.position.index : (node.position ? node.position.index : 0), branch.position || node.position || {});
                    }
                    if (passed) {
                        return renderNodes(branch.body, Object.create(scope), record);
                    }
                }
                return node.elseBody ? renderNodes(node.elseBody, Object.create(scope), record) : '';
            }
            if (node.type === 'for') {
                let collection;
                try {
                    collection = toCollection(evaluateExpression(node.iterable, scope, helpers, record.options));
                } catch (error) {
                    throw enrichError(error, record.template, node.position ? node.position.index : 0, node.position || {});
                }
                return collection.map((entry, index) => {
                    const childScope = Object.create(scope);
                    childScope[node.valueName] = entry.value;
                    if (node.keyName) childScope[node.keyName] = entry.key;
                    childScope.loop = {
                        index,
                        number: index + 1,
                        first: index === 0,
                        last: index === collection.length - 1,
                        length: collection.length,
                        key: entry.key
                    };
                    return renderNodes(node.body, childScope, record);
                }).join('');
            }
            if (node.type === 'layout') {
                let layoutName;
                let patch;
                try {
                    layoutName = evaluateExpression(node.template, scope, helpers, record.options);
                    patch = node.context ? evaluateExpression(node.context, scope, helpers, record.options) : {};
                } catch (error) {
                    throw enrichError(error, record.template, node.position ? node.position.index : 0, node.position || {});
                }
                const slots = Object.create(null);
                const defaultNodes = [];
                node.body.forEach(child => {
                    if (child && child.type === 'slot') {
                        let slotName;
                        try {
                            slotName = String(evaluateExpression(child.name, scope, helpers, record.options) || 'default');
                        } catch (error) {
                            throw enrichError(error, record.template, child.position ? child.position.index : (node.position ? node.position.index : 0), child.position || node.position || {});
                        }
                        slots[slotName] = renderNodes(child.body, Object.create(scope), record);
                    } else {
                        defaultNodes.push(child);
                    }
                });
                slots.default = renderNodes(defaultNodes, Object.create(scope), record);
                return helpers.include(layoutName, Object.assign({}, patch && typeof patch === 'object' ? patch : {}, {
                    slots
                }));
            }
            if (node.type === 'slot') {
                return '';
            }
            return '';
        }).join('');
    }

    async function renderNodesAsync(nodes, scope, record) {
        const helpers = {
            include: async (templateName, scopePatch) => {
                const includeKey = String(templateName == null ? '' : templateName).trim().replace(/^['"]|['"]$/g, '');
                const stack = Array.isArray(record.renderStack) ? record.renderStack : (record.renderStack = []);
                if (stack.includes(includeKey)) {
                    throw enrichTemplateTrace(new Error(`Include cycle detected: ${stack.concat(includeKey).join(' -> ')}`), includeKey, stack.concat(includeKey));
                }
                let templateSource;
                try {
                    templateSource = await resolveNamedTemplateAsync(record, templateName);
                } catch (error) {
                    throw enrichTemplateTrace(error, includeKey, stack.concat(includeKey));
                }
                const nextScope = scopePatch && typeof scopePatch === 'object'
                    ? Object.assign(Object.create(null), record.state.data, scopePatch)
                    : record.state.data;
                stack.push(includeKey);
                try {
                    return await renderTemplateAsync(templateSource, nextScope, record);
                } catch (error) {
                    throw enrichTemplateTrace(error, includeKey, stack.slice());
                } finally {
                    stack.pop();
                }
            },
            renderSlot: createHelpers(record).renderSlot,
            applyFilter: createHelpers(record).applyFilter
        };
        const chunks = [];
        for (let index = 0; index < nodes.length; index += 1) {
            const node = nodes[index];
            if (!node || node.type === 'comment') continue;
            if (node.type === 'text') {
                chunks.push(node.value);
                continue;
            }
            if (node.type === 'output') {
                const value = evaluateNodeExpression(node.expression, node, scope, helpers, record);
                chunks.push(node.escape ? escapeHtml(value) : String(value == null ? '' : value));
                continue;
            }
            if (node.type === 'set') {
                scope[node.name] = evaluateNodeExpression(node.expression, node, scope, helpers, record);
                continue;
            }
            if (node.type === 'include') {
                const nameValue = evaluateNodeExpression(node.template, node, scope, helpers, record);
                const patch = node.context ? evaluateNodeExpression(node.context, node, scope, helpers, record) : null;
                chunks.push(await helpers.include(nameValue, patch));
                continue;
            }
            if (node.type === 'renderSlot') {
                const slotName = evaluateNodeExpression(node.name, node, scope, helpers, record);
                chunks.push(helpers.renderSlot(slotName, scope));
                continue;
            }
            if (node.type === 'if') {
                let branchHtml = '';
                for (let branchIndex = 0; branchIndex < node.branches.length; branchIndex += 1) {
                    const branch = node.branches[branchIndex];
                    if (evaluateNodeExpression(branch.test, branch, scope, helpers, record)) {
                        branchHtml = await renderNodesAsync(branch.body, Object.create(scope), record);
                        break;
                    }
                }
                if (!branchHtml && node.elseBody) {
                    branchHtml = await renderNodesAsync(node.elseBody, Object.create(scope), record);
                }
                chunks.push(branchHtml);
                continue;
            }
            if (node.type === 'for') {
                const collection = toCollection(evaluateNodeExpression(node.iterable, node, scope, helpers, record));
                let loopHtml = '';
                for (let loopIndex = 0; loopIndex < collection.length; loopIndex += 1) {
                    const entry = collection[loopIndex];
                    const childScope = Object.create(scope);
                    childScope[node.valueName] = entry.value;
                    if (node.keyName) childScope[node.keyName] = entry.key;
                    childScope.loop = {
                        index: loopIndex,
                        number: loopIndex + 1,
                        first: loopIndex === 0,
                        last: loopIndex === collection.length - 1,
                        length: collection.length,
                        key: entry.key
                    };
                    loopHtml += await renderNodesAsync(node.body, childScope, record);
                }
                chunks.push(loopHtml);
                continue;
            }
            if (node.type === 'layout') {
                const layoutName = evaluateNodeExpression(node.template, node, scope, helpers, record);
                const patch = node.context ? evaluateNodeExpression(node.context, node, scope, helpers, record) : {};
                const slots = Object.create(null);
                const defaultNodes = [];
                for (let childIndex = 0; childIndex < node.body.length; childIndex += 1) {
                    const child = node.body[childIndex];
                    if (child && child.type === 'slot') {
                        const slotName = String(evaluateNodeExpression(child.name, child, scope, helpers, record) || 'default');
                        slots[slotName] = await renderNodesAsync(child.body, Object.create(scope), record);
                    } else {
                        defaultNodes.push(child);
                    }
                }
                slots.default = await renderNodesAsync(defaultNodes, Object.create(scope), record);
                chunks.push(await helpers.include(layoutName, Object.assign({}, patch && typeof patch === 'object' ? patch : {}, { slots })));
            }
        }
        return chunks.join('');
    }

    function renderTemplate(template, data, record) {
        const source = normalizeTemplateSource(template);
        const previousTemplate = record.template;
        record.template = source;
        try {
            const ast = getCompiledTemplate(source, record && record.options ? record.options : null);
            const scope = Object.assign(Object.create(null), data || {});
            return renderNodes(ast.body, scope, record);
        } finally {
            record.template = previousTemplate;
        }
    }

    async function renderTemplateAsync(template, data, record) {
        const source = normalizeTemplateSource(template);
        const previousTemplate = record.template;
        record.template = source;
        try {
            const ast = getCompiledTemplate(source, record && record.options ? record.options : null);
            const scope = Object.assign(Object.create(null), data || {});
            return await renderNodesAsync(ast.body, scope, record);
        } finally {
            record.template = previousTemplate;
        }
    }

    function parseJsonAttribute(value, fallback) {
        if (value == null || value === '') return fallback;
        try {
            const parsed = JSON.parse(value);
            return parsed;
        } catch (error) {
            return fallback;
        }
    }

    function readElementTemplate(element) {
        if (!element) return '';
        if (element.tagName === 'SCRIPT' || element.tagName === 'TEMPLATE') {
            return normalizeTemplateSource(element.tagName === 'TEMPLATE' ? element.innerHTML : (element.textContent || ''));
        }
        return normalizeTemplateSource(element.innerHTML || '');
    }

    async function readSourceTemplateAsync(source) {
        const resolved = typeof source === 'function' ? source() : source;
        const value = resolved && typeof resolved.then === 'function' ? await resolved : resolved;
        if (typeof value === 'string') {
            const element = resolveElement(value) || document.getElementById(String(value).replace(/^#/, ''));
            return element ? readElementTemplate(element) : value;
        }
        return readElementTemplate(value);
    }

    function resolveSourceTemplate(element, options) {
        if (options.template) return normalizeTemplateSource(options.template);
        if (options.source) return readElementTemplate(resolveElement(options.source) || document.getElementById(String(options.source).replace(/^#/, '')));
        const sourceName = element.getAttribute('jq-template') || element.getAttribute('data-jq-template') || element.getAttribute('data-jq-template-source');
        if (sourceName && sourceName !== '' && sourceName !== 'true') {
            const sourceNode = document.getElementById(sourceName.replace(/^#/, '')) || document.querySelector(sourceName);
            if (sourceNode) return readElementTemplate(sourceNode);
        }
        return readElementTemplate(element);
    }

    async function resolveSourceTemplateAsync(element, options) {
        if (options.template) return normalizeTemplateSource(options.template);
        if (options.source) return await readSourceTemplateAsync(options.source);
        const sourceName = element.getAttribute('jq-template') || element.getAttribute('data-jq-template') || element.getAttribute('data-jq-template-source');
        if (sourceName && sourceName !== '' && sourceName !== 'true') {
            return await readSourceTemplateAsync(sourceName);
        }
        return readElementTemplate(element);
    }

    function syncClasses(record, state) {
        const classList = record.element.classList;
        classList.remove(record.options.loadingClass, record.options.errorClass, record.options.renderClass, record.options.emptyClass);
        if (state) classList.add(state);
    }

    function patchDomChildren(element, html) {
        if (!element || typeof document === 'undefined' || typeof document.createElement !== 'function' || !element.childNodes) return false;
        const template = document.createElement('template');
        if (!template || !template.content) return false;
        template.innerHTML = String(html || '');
        syncDomChildren(element, template.content);
        return true;
    }

    function syncDomChildren(target, source) {
        const targetNodes = Array.from(target.childNodes || []);
        const sourceNodes = Array.from(source.childNodes || []);
        for (let index = 0; index < sourceNodes.length; index += 1) {
            const current = target.childNodes[index];
            const next = sourceNodes[index];
            if (!current) {
                target.appendChild(next.cloneNode(true));
                continue;
            }
            if (current.nodeType !== next.nodeType || (current.nodeType === 1 && current.tagName !== next.tagName)) {
                target.replaceChild(next.cloneNode(true), current);
                continue;
            }
            if (current.nodeType === 3 || current.nodeType === 4) {
                if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
                continue;
            }
            syncDomAttributes(current, next);
            syncDomChildren(current, next);
        }
        while (target.childNodes.length > sourceNodes.length) {
            const last = target.lastChild;
            if (last && typeof last.remove === 'function') last.remove();
            else target.removeChild(last);
        }
    }

    function syncDomAttributes(target, source) {
        const sourceNames = new Set(Array.from(source.attributes || []).map(attribute => attribute.name));
        Array.from(target.attributes || []).forEach(attribute => {
            if (!sourceNames.has(attribute.name)) target.removeAttribute(attribute.name);
        });
        Array.from(source.attributes || []).forEach(attribute => {
            if (target.getAttribute(attribute.name) !== attribute.value) target.setAttribute(attribute.name, attribute.value);
        });
    }

    function replaceRenderedHtml(record, html) {
        if (record.options.patch && patchDomChildren(record.element, html)) return;
        record.element.innerHTML = html;
    }

    function render(record, patch) {
        if (patch && isPlainObject(patch)) {
            record.state.data = Object.assign({}, record.state.data, patch);
        }
        syncClasses(record, record.options.loadingClass);
        try {
            const rawHtml = renderTemplate(record.template, record.state.data, record);
            const html = record.options.sanitize ? safeRenderHtml(rawHtml, record.options) : rawHtml;
            if (record.options.mode === 'append') {
                record.element.insertAdjacentHTML('beforeend', html);
            } else {
                replaceRenderedHtml(record, html);
            }
            record.state.html = html;
            record.state.error = null;
            record.element.setAttribute('data-render-count', String((Number(record.element.getAttribute('data-render-count')) || 0) + 1));
            syncClasses(record, html.trim() ? record.options.renderClass : record.options.emptyClass);
            record.element.dispatchEvent(new CustomEvent('jquan:template:render', {
                bubbles: true,
                detail: {
                    html,
                    data: Object.assign({}, record.state.data),
                    instance: createHandle(record.id)
                }
            }));
            if (typeof record.options.onRender === 'function') {
                record.options.onRender(html, Object.assign({}, record.state.data), createHandle(record.id));
            }
            return html;
        } catch (error) {
            record.state.error = error;
            if (record.options.mode !== 'append') record.element.innerHTML = '';
            syncClasses(record, record.options.errorClass);
            record.element.dispatchEvent(new CustomEvent('jquan:template:error', {
                bubbles: true,
                detail: {
                    error,
                    instance: createHandle(record.id)
                }
            }));
            if (typeof record.options.onError === 'function') {
                record.options.onError(error, createHandle(record.id));
            }
            throw error;
        }
    }

    async function renderAsync(record, patch) {
        if (patch && isPlainObject(patch)) {
            record.state.data = Object.assign({}, record.state.data, patch);
        }
        syncClasses(record, record.options.loadingClass);
        try {
            const template = record.template && typeof record.template.then === 'function'
                ? await record.template
                : record.template;
            const rawHtml = await renderTemplateAsync(template, record.state.data, record);
            const html = record.options.sanitize ? safeRenderHtml(rawHtml, record.options) : rawHtml;
            if (record.options.mode === 'append') record.element.insertAdjacentHTML('beforeend', html);
            else replaceRenderedHtml(record, html);
            record.state.html = html;
            record.state.error = null;
            record.element.setAttribute('data-render-count', String((Number(record.element.getAttribute('data-render-count')) || 0) + 1));
            syncClasses(record, html.trim() ? record.options.renderClass : record.options.emptyClass);
            if (typeof record.options.onRender === 'function') {
                record.options.onRender(html, Object.assign({}, record.state.data), createHandle(record.id));
            }
            return html;
        } catch (error) {
            record.state.error = error;
            if (record.options.mode !== 'append') record.element.innerHTML = '';
            syncClasses(record, record.options.errorClass);
            if (typeof record.options.onError === 'function') {
                record.options.onError(error, createHandle(record.id));
            }
            throw error;
        }
    }

    function createHandle(id) {
        return {
            id,
            render(patch) {
                const record = runtime.instances.get(id);
                return record ? render(record, patch) : '';
            },
            renderAsync(patch) {
                const record = runtime.instances.get(id);
                return record ? renderAsync(record, patch) : Promise.resolve('');
            },
            update(patch = {}) {
                const record = runtime.instances.get(id);
                if (!record) return null;
                if (patch.data && isPlainObject(patch.data)) {
                    record.state.data = Object.assign({}, record.state.data, patch.data);
                }
                if (patch.template != null) {
                    record.template = String(patch.template);
                }
                if (patch.source != null) {
                    record.options.source = patch.source;
                }
                if (patch.templates && isPlainObject(patch.templates)) {
                    record.templates = Object.assign({}, record.templates, patch.templates);
                }
                if (patch.filters && isPlainObject(patch.filters)) {
                    record.filters = Object.assign({}, record.filters, patch.filters);
                }
                record.options = normalizeOptions(Object.assign({}, record.options, patch));
                return this;
            },
            setData(nextData, rerender = true) {
                const record = runtime.instances.get(id);
                if (!record) return null;
                record.state.data = isPlainObject(nextData) ? Object.assign({}, nextData) : {};
                if (rerender !== false) render(record);
                return this;
            },
            patch(nextData, rerender = true) {
                const record = runtime.instances.get(id);
                if (!record) return null;
                record.state.data = Object.assign({}, record.state.data, isPlainObject(nextData) ? nextData : {});
                if (rerender !== false) render(record);
                return this;
            },
            data() {
                const record = runtime.instances.get(id);
                return record ? Object.assign({}, record.state.data) : {};
            },
            html() {
                const record = runtime.instances.get(id);
                return record ? record.state.html : '';
            },
            template() {
                const record = runtime.instances.get(id);
                return record ? record.template : '';
            },
            state() {
                const record = runtime.instances.get(id);
                if (!record) return null;
                return {
                    templateLength: record.template.length,
                    rendered: record.state.html,
                    data: Object.assign({}, record.state.data),
                    error: record.state.error ? record.state.error.message : null,
                    cacheSize: runtime.compiledCache.size
                };
            },
            destroy() {
                const record = runtime.instances.get(id);
                if (!record) return false;
                record.element.innerHTML = record.originalHtml;
                record.element.classList.remove(record.options.loadingClass, record.options.errorClass, record.options.renderClass, record.options.emptyClass);
                runtime.instances.delete(id);
                return true;
            }
        };
    }

    function mount(target, inputOptions = {}) {
        injectStyles();
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI template] Target element not found.');
        const existing = resolveInstance(element);
        if (existing) return createHandle(existing.id);

        const options = normalizeOptions(Object.assign({}, {
            source: element.getAttribute('data-jq-template-source') || '',
            mode: element.getAttribute('data-jq-template-mode') || defaults.mode,
            sanitize: element.getAttribute('data-jq-template-sanitize') === 'true',
            patch: element.getAttribute('data-jq-template-patch') === 'true',
            data: parseJsonAttribute(element.getAttribute('data-jq-template-data'), {}),
            templates: parseJsonAttribute(element.getAttribute('data-jq-template-templates'), {}),
            filters: {}
        }, inputOptions));

        const id = element.id || nextId();
        element.id = id;

        const record = {
            id,
            element,
            options,
            template: resolveSourceTemplate(element, options),
            templates: Object.assign({}, runtime.templates, options.templates),
            filters: Object.assign({}, runtime.filters, options.filters),
            originalHtml: element.innerHTML,
            renderStack: [],
            state: {
                data: Object.assign({}, options.data),
                html: '',
                error: null
            }
        };

        runtime.instances.set(id, record);
        if (options.autoRender) render(record);
        return createHandle(id);
    }

    async function mountAsync(target, inputOptions = {}) {
        injectStyles();
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI template] Target element not found.');
        const existing = resolveInstance(element);
        if (existing) return createHandle(existing.id);

        const options = normalizeOptions(Object.assign({}, {
            source: element.getAttribute('data-jq-template-source') || '',
            mode: element.getAttribute('data-jq-template-mode') || defaults.mode,
            sanitize: element.getAttribute('data-jq-template-sanitize') === 'true',
            patch: element.getAttribute('data-jq-template-patch') === 'true',
            data: parseJsonAttribute(element.getAttribute('data-jq-template-data'), {}),
            templates: parseJsonAttribute(element.getAttribute('data-jq-template-templates'), {}),
            filters: {}
        }, inputOptions));

        const id = element.id || nextId();
        element.id = id;

        const record = {
            id,
            element,
            options,
            template: await resolveSourceTemplateAsync(element, options),
            templates: Object.assign({}, runtime.templates, options.templates),
            filters: Object.assign({}, runtime.filters, options.filters),
            originalHtml: element.innerHTML,
            renderStack: [],
            state: {
                data: Object.assign({}, options.data),
                html: '',
                error: null
            }
        };

        runtime.instances.set(id, record);
        if (options.autoRender) await renderAsync(record);
        return createHandle(id);
    }

    const templateApi = {
        compile(template, options = {}) {
            return getCompiledTemplate(template, options);
        },
        render(template, data = {}, options = {}) {
            const record = {
                template: normalizeTemplateSource(template),
                templates: Object.assign({}, runtime.templates, isPlainObject(options.templates) ? options.templates : {}),
                filters: Object.assign({}, runtime.filters, isPlainObject(options.filters) ? options.filters : {}),
                options: normalizeOptions(options),
                renderStack: [],
                state: {
                    data: Object.assign({}, isPlainObject(data) ? data : {})
                }
            };
            const html = renderTemplate(template, record.state.data, record);
            return record.options.sanitize ? safeRenderHtml(html, record.options) : html;
        },
        async renderAsync(template, data = {}, options = {}) {
            const record = {
                templates: Object.assign({}, runtime.templates, isPlainObject(options.templates) ? options.templates : {}),
                filters: Object.assign({}, runtime.filters, isPlainObject(options.filters) ? options.filters : {}),
                options: normalizeOptions(options),
                renderStack: [],
                state: {
                    data: Object.assign({}, isPlainObject(data) ? data : {})
                }
            };
            const rawTemplate = await readSourceTemplateAsync(template);
            record.template = rawTemplate;
            const html = await renderTemplateAsync(rawTemplate, record.state.data, record);
            return record.options.sanitize ? safeRenderHtml(html, record.options) : html;
        },
        renderToString(template, data = {}, options = {}) {
            return this.render(template, data, options);
        },
        async renderToStringAsync(template, data = {}, options = {}) {
            return await this.renderAsync(template, data, options);
        },
        mount(target, options = {}) {
            return mount(target, options);
        },
        mountAsync(target, options = {}) {
            return mountAsync(target, options);
        },
        get(target) {
            const record = resolveInstance(target);
            return record ? createHandle(record.id) : null;
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        },
        registerTemplate(name, template) {
            runtime.templates[String(name)] = String(template == null ? '' : template);
            return this;
        },
        registerTemplates(templates) {
            if (!isPlainObject(templates)) throw new Error('[JquanUI template] Templates must be an object map.');
            Object.entries(templates).forEach(([name, template]) => {
                this.registerTemplate(name, template);
            });
            return this;
        },
        unregisterTemplate(name) {
            delete runtime.templates[String(name)];
            return this;
        },
        registerFilter(name, handler) {
            if (typeof handler !== 'function') throw new Error('[JquanUI template] Filter must be a function.');
            runtime.filters[String(name)] = handler;
            return this;
        },
        unregisterFilter(name) {
            delete runtime.filters[String(name)];
            return this;
        },
        createFileLoader(options = {}) {
            return createFileLoader(options);
        },
        useLoader(loader) {
            runtime.loader = normalizeLoader(loader);
            runtime.loaderGeneration += 1;
            runtime.templateCache.clear();
            runtime.pendingLoads.clear();
            runtime.templateMeta.clear();
            return this;
        },
        clearLoader() {
            runtime.loader = null;
            runtime.loaderGeneration += 1;
            runtime.templateCache.clear();
            runtime.pendingLoads.clear();
            runtime.templateMeta.clear();
            return this;
        },
        async preload(names, options = {}) {
            const list = Array.isArray(names) ? names : [names];
            const record = { options: normalizeOptions(options), state: { data: {} }, renderStack: [] };
            await Promise.all(list.filter(Boolean).map(name => loadExternalTemplate(name, record)));
            return list.filter(Boolean);
        },
        clearTemplateCache(name) {
            if (name == null) {
                runtime.templateCache.clear();
                runtime.pendingLoads.clear();
                runtime.templateMeta.clear();
                return this;
            }
            if (!runtime.loader) return this;
            const request = resolveLoaderRequest(name, runtime.loader);
            runtime.templateCache.delete(request.key);
            runtime.pendingLoads.delete(request.key);
            runtime.templateMeta.delete(request.key);
            return this;
        },
        templateCacheSize() {
            return runtime.templateCache.size;
        },
        inspectTemplate(name) {
            if (!runtime.loader) return null;
            const request = resolveLoaderRequest(name, runtime.loader);
            const meta = runtime.templateMeta.get(request.key);
            return meta ? Object.assign({ cached: runtime.templateCache.has(request.key) }, meta) : null;
        },
        inspect(name) {
            return this.inspectTemplate(name);
        },
        invalidate(names) {
            return invalidateTemplates(names);
        },
        async refresh(names) {
            return await refreshTemplateInstances(names);
        },
        clearCache() {
            runtime.compiledCache.clear();
            return this;
        },
        dependencies(template, options = {}) {
            return extractDependencies(template, options);
        },
        async dependencyGraph(name, options = {}) {
            return await buildDependencyGraph(name, options);
        },
        ast(template, options = {}) {
            return getCompiledTemplate(template, options);
        },
        filters() {
            return Object.keys(runtime.filters);
        },
        templates() {
            return Object.keys(runtime.templates);
        },
        cacheSize() {
            return runtime.compiledCache.size;
        }
    };

    if (isPlainObject(global.JQUAN_TEMPLATES)) templateApi.registerTemplates(global.JQUAN_TEMPLATES);

    templateApi
        .registerFilter('upper', value => String(value == null ? '' : value).toUpperCase())
        .registerFilter('lower', value => String(value == null ? '' : value).toLowerCase())
        .registerFilter('json', value => JSON.stringify(value, null, 2))
        .registerFilter('join', (value, separator = ', ') => Array.isArray(value) ? value.join(separator) : value)
        .registerFilter('length', value => {
            if (Array.isArray(value) || typeof value === 'string') return value.length;
            if (value && typeof value === 'object') return Object.keys(value).length;
            return 0;
        })
        .registerFilter('default', (value, fallback = '') => value == null || value === '' || value === false ? fallback : value)
        .registerFilter('currency', (value, currency = 'CNY', locale = 'zh-CN') => {
            const amount = Number(value);
            if (!Number.isFinite(amount)) return value;
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency
            }).format(amount);
        })
        .registerFilter('date', (value, locale = 'zh-CN') => {
            const date = value instanceof Date ? value : new Date(value);
            return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale);
        });

    JquanUIComponents.templateApi = templateApi;

    JquanUIComponents.template = {
        name: 'jquanui-template',
        version: '1.5.0',
        requires: [],
        install(api) {
            bindTemplateHmr();
            api.addBehaviors({
                selector: defaults.selector,
                setup(node) {
                    if (runtime.loader) {
                        let disposed = false;
                        let handle = null;
                        mountAsync(node).then(instance => {
                            if (disposed) instance.destroy();
                            else handle = instance;
                        }).catch(error => {
                            if (!disposed && typeof console !== 'undefined') console.error('[JquanUI template] Async mount failed:', error);
                        });
                        return () => {
                            disposed = true;
                            if (handle) handle.destroy();
                            else templateApi.destroy(node);
                        };
                    }
                    const handle = mount(node);
                    return () => {
                        if (handle) handle.destroy();
                    };
                }
            });
        },
        teardown() {
            unbindTemplateHmr();
        }
    };
})(window);
