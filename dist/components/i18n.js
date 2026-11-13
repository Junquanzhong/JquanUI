(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
    const BINDING_ATTRIBUTES = ['text', 'html', 'attr', 'value', 'placeholder', 'title'];

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function deepMerge(base, extra) {
        const output = Object.assign({}, base);
        Object.keys(extra || {}).forEach(key => {
            const baseValue = output[key];
            const nextValue = extra[key];
            if (isPlainObject(baseValue) && isPlainObject(nextValue)) {
                output[key] = deepMerge(baseValue, nextValue);
            } else if (Array.isArray(nextValue)) {
                output[key] = nextValue.slice();
            } else {
                output[key] = nextValue;
            }
        });
        return output;
    }

    function getStorageDriver() {
        if (JquanUIComponents.storageApi) return JquanUIComponents.storageApi;
        if (JquanUIComponents.localStorageApi) return JquanUIComponents.localStorageApi;
        return null;
    }

    function getByPath(source, path) {
        if (!source || !path) return undefined;
        if (Object.prototype.hasOwnProperty.call(source, path)) return source[path];
        return String(path).split('.').reduce((cursor, segment) => {
            if (cursor == null) return undefined;
            return cursor[segment];
        }, source);
    }

    function setByPath(target, path, value) {
        const segments = String(path || '').split('.').filter(Boolean);
        if (!segments.length) return target;
        let cursor = target;
        segments.forEach((segment, index) => {
            if (index === segments.length - 1) {
                cursor[segment] = value;
                return;
            }
            if (!isPlainObject(cursor[segment])) cursor[segment] = {};
            cursor = cursor[segment];
        });
        return target;
    }

    function parseJSON(value, fallback) {
        if (value == null || value === '') return fallback;
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function normalizeLocale(locale) {
        return String(locale || '').trim().replace('_', '-');
    }

    function normalizeLanguage(locale) {
        const normalized = normalizeLocale(locale);
        return normalized.toLowerCase();
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, token => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[token]));
    }

    function formatTemplate(template, params, escapeValues) {
        return String(template).replace(/\{\{\s*([.\w-]+)\s*\}\}/g, (_, token) => {
            const value = getByPath(params, token);
            if (value == null) return `{{${token}}}`;
            return escapeValues ? escapeHtml(value) : String(value);
        });
    }

    function createEmitter() {
        const listeners = new Map();
        return {
            on(event, handler) {
                if (typeof handler !== 'function') return () => {};
                if (!listeners.has(event)) listeners.set(event, new Set());
                listeners.get(event).add(handler);
                return () => this.off(event, handler);
            },
            off(event, handler) {
                const bucket = listeners.get(event);
                if (!bucket) return false;
                return bucket.delete(handler);
            },
            emit(event, payload) {
                const bucket = listeners.get(event);
                if (!bucket) return;
                Array.from(bucket).forEach(handler => {
                    try {
                        handler(payload);
                    } catch (error) {
                        setTimeout(() => {
                            throw error;
                        }, 0);
                    }
                });
            },
            clear() {
                listeners.clear();
            }
        };
    }

    class I18nEngine {
        constructor() {
            this.messages = {};
            this.loadedLocales = new Set();
            this.pendingLoads = new Map();
            this.formatterCache = new Map();
            this.emitter = createEmitter();
            this.observer = null;
            this.initialized = false;
            this.runtime = {
                locale: 'zh-CN',
                fallbackLocale: 'en',
                fallbackNamespaces: ['common'],
                defaultNamespace: 'common',
                storageKey: 'jquanui:locale',
                storageDriver: 'local',
                persist: true,
                syncDocument: true,
                syncUrl: false,
                urlParamKey: 'lang',
                localesPath: '',
                autoLoad: false,
                autoObserve: true,
                debug: false,
                missingKey: 'key',
                escapeInterpolation: true,
                detectOrder: ['url', 'storage', 'html', 'navigator', 'default'],
                availableLocales: [],
                loader: null,
                observeDebounce: 32
            };
            this.pendingObservedRoots = new Set();
            this.observeTimer = null;
        }

        config(options = {}) {
            this.runtime = deepMerge(this.runtime, options);
            if (typeof this.runtime.fallbackNamespaces === 'string') {
                this.runtime.fallbackNamespaces = [this.runtime.fallbackNamespaces];
            }
            if (!Array.isArray(this.runtime.fallbackNamespaces) || !this.runtime.fallbackNamespaces.length) {
                this.runtime.fallbackNamespaces = [this.runtime.defaultNamespace];
            }
            if (!Array.isArray(this.runtime.detectOrder) || !this.runtime.detectOrder.length) {
                this.runtime.detectOrder = ['url', 'storage', 'html', 'navigator', 'default'];
            }
            return this.getState();
        }

        async init(options = {}) {
            if (this.initialized) {
                this.config(options);
                return this;
            }
            this.config(options);
            const locale = this.detectLocale();
            await this.setLocale(locale, { reason: 'init' });
            if (this.runtime.autoObserve) this.observe();
            this.bindSwitchers();
            this.initialized = true;
            return this;
        }

        getState() {
            return {
                locale: this.runtime.locale,
                fallbackLocale: this.runtime.fallbackLocale,
                defaultNamespace: this.runtime.defaultNamespace,
                availableLocales: this.runtime.availableLocales.slice()
            };
        }

        detectLocale() {
            const order = this.runtime.detectOrder;
            for (let i = 0; i < order.length; i += 1) {
                const mode = order[i];
                const resolved = this.resolveLocaleByMode(mode);
                if (resolved) return resolved;
            }
            return this.runtime.locale || this.runtime.fallbackLocale;
        }

        resolveLocaleByMode(mode) {
            switch (mode) {
                case 'url': {
                    if (typeof window === 'undefined') return null;
                    const url = new URL(window.location.href);
                    return this.resolveAvailableLocale(url.searchParams.get(this.runtime.urlParamKey));
                }
                case 'storage': {
                    const driver = getStorageDriver();
                    if (!driver || !this.runtime.persist) return null;
                    const stored = driver.get(this.runtime.storageKey, null, { driver: this.runtime.storageDriver });
                    return this.resolveAvailableLocale(stored);
                }
                case 'html': {
                    if (!document.documentElement) return null;
                    return this.resolveAvailableLocale(document.documentElement.lang);
                }
                case 'navigator': {
                    if (!global.navigator) return null;
                    return this.resolveAvailableLocale(global.navigator.language || global.navigator.userLanguage);
                }
                case 'default':
                    return this.resolveAvailableLocale(this.runtime.locale || this.runtime.fallbackLocale);
                default:
                    return null;
            }
        }

        resolveAvailableLocale(locale) {
            const normalized = normalizeLocale(locale);
            if (!normalized) return null;
            if (!this.runtime.availableLocales.length) return normalized;
            if (this.runtime.availableLocales.includes(normalized)) return normalized;
            const short = normalized.split('-')[0];
            const exactShort = this.runtime.availableLocales.find(item => item.split('-')[0] === short);
            return exactShort || null;
        }

        getLocale() {
            return this.runtime.locale;
        }

        hasLocale(locale) {
            return !!this.messages[normalizeLocale(locale)];
        }

        has(key, options = {}) {
            return this.resolveMessage(key, options) !== undefined;
        }

        async setLocale(locale, options = {}) {
            const nextLocale = this.resolveAvailableLocale(locale) || normalizeLocale(locale);
            if (!nextLocale) throw new Error('[JquanUI i18n] Invalid locale.');
            if (this.runtime.autoLoad) await this.loadLocale(nextLocale);
            if (!this.messages[nextLocale]) this.messages[nextLocale] = {};
            if (this.runtime.autoLoad && this.runtime.fallbackLocale && nextLocale !== this.runtime.fallbackLocale) {
                await this.loadLocale(this.runtime.fallbackLocale);
            }
            this.runtime.locale = nextLocale;
            this.syncEnvironment(nextLocale, options);
            this.translate(document);
            this.bindSwitchers();
            const payload = {
                locale: nextLocale,
                previousLocale: options.previousLocale || null,
                reason: options.reason || 'manual'
            };
            this.emitter.emit('change', payload);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('jquanui:i18n:change', { detail: payload }));
            }
            return nextLocale;
        }

        syncEnvironment(locale, options = {}) {
            if (this.runtime.syncDocument && document?.documentElement) {
                document.documentElement.lang = locale;
                document.documentElement.dir = this.isRTL(locale) ? 'rtl' : 'ltr';
            }
            if (this.runtime.persist) {
                const driver = getStorageDriver();
                if (driver && typeof driver.set === 'function') {
                    driver.set(this.runtime.storageKey, locale, { driver: this.runtime.storageDriver });
                }
            }
            if (this.runtime.syncUrl && typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set(this.runtime.urlParamKey, locale);
                window.history.replaceState({}, '', url);
            }
            if (options.silent !== true && this.runtime.debug) {
                console.info('[JquanUI i18n] locale changed:', locale);
            }
        }

        registerLocale(locale, resources, options = {}) {
            const normalizedLocale = normalizeLocale(locale);
            const namespace = options.namespace || this.runtime.defaultNamespace;
            if (!this.messages[normalizedLocale]) this.messages[normalizedLocale] = {};
            if (!this.messages[normalizedLocale][namespace]) this.messages[normalizedLocale][namespace] = {};
            this.messages[normalizedLocale][namespace] = options.replace === true
                ? deepMerge({}, resources || {})
                : deepMerge(this.messages[normalizedLocale][namespace], resources || {});
            this.loadedLocales.add(normalizedLocale);
            if (this.runtime.availableLocales.length && !this.runtime.availableLocales.includes(normalizedLocale)) {
                this.runtime.availableLocales.push(normalizedLocale);
            }
            return this;
        }

        registerMessages(payload, options = {}) {
            Object.keys(payload || {}).forEach(locale => {
                const resources = payload[locale];
                const keys = isPlainObject(resources) ? Object.keys(resources) : [];
                const knownNamespaces = [this.runtime.defaultNamespace].concat(this.runtime.fallbackNamespaces || []);
                const splitNamespaces = !options.namespace
                    && isPlainObject(resources)
                    && keys.length > 0
                    && keys.every(key => isPlainObject(resources[key]))
                    && (options.nested === true || (options.nested !== false && keys.some(key => knownNamespaces.includes(key))));
                if (splitNamespaces) {
                    keys.forEach(namespace => {
                        this.registerLocale(locale, resources[namespace], Object.assign({}, options, { namespace }));
                    });
                    return;
                }
                this.registerLocale(locale, resources, options);
            });
            return this;
        }

        async loadLocale(locale, options = {}) {
            const normalizedLocale = normalizeLocale(locale);
            if (!normalizedLocale) throw new Error('[JquanUI i18n] loadLocale requires locale.');
            if (this.pendingLoads.has(normalizedLocale)) return this.pendingLoads.get(normalizedLocale);
            const promise = this.fetchLocale(normalizedLocale, options).then(result => {
                if (result && typeof result === 'object') {
                    if (options.namespace) {
                        this.registerLocale(normalizedLocale, result, { namespace: options.namespace });
                    } else {
                        Object.keys(result).forEach(namespace => {
                            this.registerLocale(normalizedLocale, result[namespace], { namespace });
                        });
                    }
                }
                this.loadedLocales.add(normalizedLocale);
                this.pendingLoads.delete(normalizedLocale);
                return this.messages[normalizedLocale] || {};
            }).catch(error => {
                this.pendingLoads.delete(normalizedLocale);
                throw error;
            });
            this.pendingLoads.set(normalizedLocale, promise);
            return promise;
        }

        async fetchLocale(locale, options = {}) {
            if (typeof this.runtime.loader === 'function') {
                return this.runtime.loader(locale, options);
            }
            if (!this.runtime.localesPath) {
                throw new Error(`[JquanUI i18n] Missing loader/localesPath for locale "${locale}".`);
            }
            const basePath = String(this.runtime.localesPath).replace(/\/+$/, '');
            const url = options.namespace
                ? `${basePath}/${locale}/${options.namespace}.json`
                : `${basePath}/${locale}.json`;
            const response = await fetch(url, {
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) {
                throw new Error(`[JquanUI i18n] Failed to load locale "${locale}" from "${url}" (${response.status}).`);
            }
            return response.json();
        }

        resolveNamespaces(options = {}) {
            const namespaces = [];
            if (options.namespace) namespaces.push(options.namespace);
            if (Array.isArray(options.namespaces)) namespaces.push(...options.namespaces);
            namespaces.push(this.runtime.defaultNamespace);
            namespaces.push(...this.runtime.fallbackNamespaces);
            return Array.from(new Set(namespaces.filter(Boolean)));
        }

        resolveMessage(key, options = {}) {
            const locale = normalizeLocale(options.locale || this.runtime.locale);
            const fallbackLocale = normalizeLocale(options.fallbackLocale || this.runtime.fallbackLocale);
            const namespaces = this.resolveNamespaces(options);
            const localizedKey = String(key || '');
            const resolveInLocale = currentLocale => {
                const resources = this.messages[currentLocale] || {};
                const candidates = [];
                namespaces.forEach(namespace => candidates.push([namespace, localizedKey]));
                if (!options.namespace && localizedKey.includes('.')) {
                    const segments = localizedKey.split('.');
                    const registered = Array.from(new Set(namespaces.concat(Object.keys(resources))));
                    registered.forEach(namespace => {
                        if (segments[0] === namespace && segments.length > 1) {
                            candidates.push([namespace, segments.slice(1).join('.')]);
                        }
                    });
                }
                for (const [namespace, path] of candidates) {
                    const message = getByPath(resources[namespace], path);
                    if (message !== undefined) return message;
                }
                return undefined;
            };
            const message = resolveInLocale(locale);
            if (message !== undefined) return message;
            if (fallbackLocale && fallbackLocale !== locale) {
                const fallbackMessage = resolveInLocale(fallbackLocale);
                if (fallbackMessage !== undefined) return fallbackMessage;
            }
            return undefined;
        }

        resolvePlural(message, count, locale) {
            if (!isPlainObject(message)) return message;
            const pluralRule = this.getCachedFormatter('plural', locale, null, () => new Intl.PluralRules(locale));
            const bucket = pluralRule.select(Number(count));
            return message[bucket] ?? message.other ?? message.one ?? message.zero;
        }

        formatValue(value, options = {}) {
            const locale = options.locale || this.runtime.locale;
            const type = options.type || 'string';
            switch (type) {
                case 'number': {
                    const formatter = this.getCachedFormatter('number', locale, options, () => new Intl.NumberFormat(locale, options));
                    return formatter.format(value);
                }
                case 'currency': {
                    const formatter = this.getCachedFormatter('currency', locale, options, () => new Intl.NumberFormat(locale, Object.assign({
                        style: 'currency',
                        currency: options.currency || 'USD'
                    }, options)));
                    return formatter.format(value);
                }
                case 'date': {
                    const formatter = this.getCachedFormatter('date', locale, options, () => new Intl.DateTimeFormat(locale, options));
                    return formatter.format(value instanceof Date ? value : new Date(value));
                }
                case 'relativeTime': {
                    const formatter = this.getCachedFormatter('relativeTime', locale, options, () => new Intl.RelativeTimeFormat(locale, options));
                    return formatter.format(value, options.unit || 'day');
                }
                case 'list': {
                    const formatter = this.getCachedFormatter('list', locale, options, () => new Intl.ListFormat(locale, options));
                    return formatter.format(Array.isArray(value) ? value : [value]);
                }
                default:
                    return String(value);
            }
        }

        format(key, params = {}, options = {}) {
            return this.t(key, params, options);
        }

        t(key, params = {}, options = {}) {
            const resolved = this.resolveMessage(key, options);
            if (resolved === undefined) {
                if (typeof this.runtime.missingKey === 'function') {
                    return this.runtime.missingKey(key, params, options);
                }
                if (this.runtime.missingKey === 'empty') return '';
                if (this.runtime.missingKey === 'bracket') return `[${key}]`;
                return key;
            }
            const locale = normalizeLocale(options.locale || this.runtime.locale);
            let message = resolved;
            if (params && Object.prototype.hasOwnProperty.call(params, 'count')) {
                message = this.resolvePlural(message, params.count, locale);
            }
            if (message == null) return key;
            if (typeof message === 'function') {
                return message(params, {
                    locale,
                    key,
                    i18n: this
                });
            }
            if (isPlainObject(message)) {
                return JSON.stringify(message);
            }
            return formatTemplate(message, params, options.escapeInterpolation ?? this.runtime.escapeInterpolation);
        }

        tn(key, value, formatOptions = {}, translateOptions = {}) {
            const formatted = this.formatValue(value, Object.assign({ type: 'number' }, formatOptions));
            return this.t(key, Object.assign({}, translateOptions.params, { value: formatted }), translateOptions);
        }

        td(key, value, formatOptions = {}, translateOptions = {}) {
            const formatted = this.formatValue(value, Object.assign({ type: 'date' }, formatOptions));
            return this.t(key, Object.assign({}, translateOptions.params, { value: formatted }), translateOptions);
        }

        tc(key, value, formatOptions = {}, translateOptions = {}) {
            const formatted = this.formatValue(value, Object.assign({ type: 'currency' }, formatOptions));
            return this.t(key, Object.assign({}, translateOptions.params, { value: formatted }), translateOptions);
        }

        getCachedFormatter(type, locale, options, factory) {
            const cacheKey = `${type}:${locale}:${JSON.stringify(options || {})}`;
            if (!this.formatterCache.has(cacheKey)) {
                this.formatterCache.set(cacheKey, factory());
            }
            return this.formatterCache.get(cacheKey);
        }

        createScope(namespace, presetOptions = {}) {
            return {
                t: (key, params, options) => this.t(key, params, Object.assign({}, presetOptions, options, { namespace })),
                has: (key, options) => this.has(key, Object.assign({}, presetOptions, options, { namespace })),
                namespace
            };
        }

        bindSwitchers(root = document) {
            if (!root) return;
            const nodes = [];
            if (root.nodeType === 1 && root.matches?.('[data-i18n-switcher]')) {
                nodes.push(root);
            }
            if (typeof root.querySelectorAll === 'function') {
                nodes.push(...root.querySelectorAll('[data-i18n-switcher]'));
            }
            nodes.forEach(node => {
                const locale = node.getAttribute('data-i18n-switcher');
                const isActive = locale === this.runtime.locale;
                node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                node.classList.toggle('active', isActive);
                if (node.__jqI18nBound) return;
                const handler = event => {
                    event.preventDefault();
                    this.setLocale(locale, { previousLocale: this.runtime.locale, reason: 'switcher' }).catch(error => {
                        if (this.runtime.debug) console.error(error);
                    });
                };
                node.addEventListener('click', handler);
                node.__jqI18nBound = handler;
            });
        }

        translate(root = document) {
            if (!root || (typeof root.querySelectorAll !== 'function' && root.nodeType !== 1 && root !== document)) return;
            this.translateText(root);
            this.translateAttributes(root);
        }

        translateText(root) {
            const nodes = [];
            if (root.nodeType === 1 && root.matches?.('[data-i18n], [data-i18n-key]')) {
                nodes.push(root);
            }
            if (typeof root.querySelectorAll === 'function') {
                nodes.push(...root.querySelectorAll('[data-i18n], [data-i18n-key]'));
            }
            nodes.forEach(node => {
                const key = node.getAttribute('data-i18n') || node.getAttribute('data-i18n-key');
                const namespace = node.getAttribute('data-i18n-namespace') || undefined;
                const params = parseJSON(node.getAttribute('data-i18n-params'), {});
                const asHtml = node.hasAttribute('data-i18n-html');
                const target = node.getAttribute('data-i18n-target') || 'text';
                const result = this.t(key, params, { namespace, escapeInterpolation: !asHtml });
                if (target === 'html' || asHtml) {
                    if (node.innerHTML !== result) node.innerHTML = result;
                    return;
                }
                if (target === 'value' && 'value' in node) {
                    if (node.value !== result) node.value = result;
                    return;
                }
                if (node.textContent !== result) node.textContent = result;
            });
        }

        translateAttributes(root) {
            const nodes = [];
            if (root.nodeType === 1 && root.matches?.('[data-i18n-attr], [data-i18n-placeholder], [data-i18n-title]')) {
                nodes.push(root);
            }
            if (typeof root.querySelectorAll === 'function') {
                nodes.push(...root.querySelectorAll('[data-i18n-attr], [data-i18n-placeholder], [data-i18n-title]'));
            }
            nodes.forEach(node => {
                const namespace = node.getAttribute('data-i18n-namespace') || undefined;
                const inlineConfig = node.getAttribute('data-i18n-attr');
                if (inlineConfig) {
                    inlineConfig.split(';').forEach(item => {
                        const [attrName, key] = item.split(':').map(part => part && part.trim());
                        if (!attrName || !key) return;
                        const value = this.t(key, {}, { namespace });
                        if (node.getAttribute(attrName) !== value) node.setAttribute(attrName, value);
                    });
                }
                BINDING_ATTRIBUTES.forEach(type => {
                    const attributeName = `data-i18n-${type}`;
                    const key = node.getAttribute(attributeName);
                    if (!key) return;
                    const value = this.t(key, {}, { namespace, escapeInterpolation: type !== 'html' });
                    if (type === 'placeholder' || type === 'title') {
                        if (node.getAttribute(type) !== value) node.setAttribute(type, value);
                        return;
                    }
                    if (type === 'value' && 'value' in node) {
                        if (node.value !== value) node.value = value;
                        return;
                    }
                    if (type === 'html') {
                        if (node.innerHTML !== value) node.innerHTML = value;
                        return;
                    }
                    if (node.textContent !== value) node.textContent = value;
                });
            });
        }

        queueObservedNode(node) {
            if (node instanceof Element) {
                this.pendingObservedRoots.add(node);
                return;
            }
            if (node instanceof DocumentFragment) {
                Array.from(node.children || []).forEach(child => {
                    if (child instanceof Element) this.pendingObservedRoots.add(child);
                });
            }
        }

        flushObservedMutations() {
            const roots = Array.from(this.pendingObservedRoots);
            this.pendingObservedRoots.clear();
            this.observeTimer = null;
            roots.forEach(root => {
                this.translate(root);
                this.bindSwitchers(root);
            });
        }

        observe(root = document.body) {
            if (typeof MutationObserver === 'undefined' || !root) return;
            this.disconnect();
            this.observer = new MutationObserver(mutations => {
                for (let i = 0; i < mutations.length; i += 1) {
                    const addedNodes = mutations[i].addedNodes || [];
                    for (let j = 0; j < addedNodes.length; j += 1) {
                        this.queueObservedNode(addedNodes[j]);
                    }
                }
                if (this.pendingObservedRoots.size && !this.observeTimer) {
                    const wait = Math.max(0, Number(this.runtime.observeDebounce) || 0);
                    this.observeTimer = window.setTimeout(() => this.flushObservedMutations(), wait);
                }
            });
            this.observer.observe(root, {
                childList: true,
                subtree: true
            });
        }

        disconnect() {
            if (this.observer) this.observer.disconnect();
            this.observer = null;
            if (this.observeTimer) {
                clearTimeout(this.observeTimer);
                this.observeTimer = null;
            }
            this.pendingObservedRoots.clear();
        }

        on(event, handler) {
            return this.emitter.on(event, handler);
        }

        off(event, handler) {
            return this.emitter.off(event, handler);
        }

        isRTL(locale = this.runtime.locale) {
            return RTL_LANGUAGES.includes(normalizeLanguage(locale).split('-')[0]);
        }
    }

    const engine = new I18nEngine();

    const i18nApi = {
        config(options = {}) {
            return engine.config(options);
        },
        init(options = {}) {
            return engine.init(options);
        },
        state() {
            return engine.getState();
        },
        getLocale() {
            return engine.getLocale();
        },
        setLocale(locale, options = {}) {
            return engine.setLocale(locale, Object.assign({ previousLocale: engine.getLocale() }, options));
        },
        registerLocale(locale, resources, options = {}) {
            return engine.registerLocale(locale, resources, options);
        },
        registerMessages(payload, options = {}) {
            return engine.registerMessages(payload, options);
        },
        loadLocale(locale, options = {}) {
            return engine.loadLocale(locale, options);
        },
        has(key, options = {}) {
            return engine.has(key, options);
        },
        t(key, params = {}, options = {}) {
            return engine.t(key, params, options);
        },
        format(key, params = {}, options = {}) {
            return engine.format(key, params, options);
        },
        tn(key, value, formatOptions = {}, translateOptions = {}) {
            return engine.tn(key, value, formatOptions, translateOptions);
        },
        td(key, value, formatOptions = {}, translateOptions = {}) {
            return engine.td(key, value, formatOptions, translateOptions);
        },
        tc(key, value, formatOptions = {}, translateOptions = {}) {
            return engine.tc(key, value, formatOptions, translateOptions);
        },
        formatValue(value, options = {}) {
            return engine.formatValue(value, options);
        },
        scope(namespace, options = {}) {
            return engine.createScope(namespace, options);
        },
        translate(root = document) {
            engine.translate(root);
            return true;
        },
        bindSwitchers(root = document) {
            engine.bindSwitchers(root);
            return true;
        },
        observe(root = document.body) {
            engine.observe(root);
            return true;
        },
        disconnect() {
            engine.disconnect();
            return true;
        },
        on(event, handler) {
            return engine.on(event, handler);
        },
        off(event, handler) {
            return engine.off(event, handler);
        }
    };

    JquanUIComponents.i18nApi = i18nApi;

    JquanUIComponents.i18n = {
        name: 'jquanui-i18n',
        version: '1.1.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[data-i18n-switcher]',
                setup(node) {
                    if (node.__jqI18nBehaviorBound) return null;
                    node.__jqI18nBehaviorBound = true;
                    i18nApi.bindSwitchers(node.ownerDocument || document);
                    return () => {};
                }
            });
        }
    };
})(window);
