/*! JquanUI local component importer. Embedded in Core by build-component-import.cjs. */
(function (global) {
    const catalog = __JQUAN_COMPONENT_CATALOG__;
    const coreScript = document.currentScript;
    const coreSource = coreScript && coreScript.src;
    const scriptPromises = new Map();
    const failedScripts = new WeakSet();

    function failure(code, name, url, message, cause) {
        const error = new Error(`[JquanUI.import] ${message}`);
        error.name = 'JquanComponentImportError';
        error.code = code;
        error.component = name;
        error.url = url || null;
        if (cause) error.cause = cause;
        return error;
    }

    function normalizeName(value) {
        if (typeof value !== 'string') throw failure('COMPONENT_UNKNOWN', String(value), null, 'Component name must be a string.');
        const name = value.replace(/\.js$/, '');
        if (!Object.prototype.hasOwnProperty.call(catalog, name)) {
            throw failure('COMPONENT_UNKNOWN', name, null, `Unknown component "${name}". Use a name from components.manifest.json.`);
        }
        return name;
    }

    function resolveSettings(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw failure('COMPONENT_INVALID_OPTIONS', '', null, 'Options must be an object.');
        }
        const config = global.JQUAN_CONFIG && global.JQUAN_CONFIG.componentLoader || {};
        const settings = Object.assign({ timeout: 15000, install: true }, config, options);
        if (!Number.isFinite(settings.timeout) || settings.timeout <= 0 || typeof settings.install !== 'boolean') {
            throw failure('COMPONENT_INVALID_OPTIONS', '', null, 'timeout must be positive milliseconds and install must be boolean.');
        }
        let inferred = './dist/components/';
        if (coreSource) {
            const pathname = new URL(coreSource, document.baseURI).pathname;
            if (/\/dist\/(?:core|full)\//i.test(pathname)) inferred = new URL('../components/', coreSource).href;
            else if (/\/js\/[^/]*core[^/]*\.js$/i.test(pathname)) inferred = new URL('../dist/components/', coreSource).href;
        }
        const baseURL = settings.baseURL === undefined ? inferred : settings.baseURL;
        if (typeof baseURL !== 'string' || !baseURL) throw failure('COMPONENT_INVALID_OPTIONS', '', null, 'baseURL must be a non-empty directory URL.');
        try {
            settings.baseURL = new URL(baseURL.endsWith('/') ? baseURL : `${baseURL}/`, document.baseURI).href;
        } catch (error) {
            throw failure('COMPONENT_INVALID_OPTIONS', '', null, 'baseURL must be a valid directory URL.', error);
        }
        settings.nonce = settings.nonce === undefined ? coreScript && coreScript.nonce || '' : settings.nonce;
        if (typeof settings.nonce !== 'string') throw failure('COMPONENT_INVALID_OPTIONS', '', null, 'nonce must be a string.');
        return settings;
    }

    function loadScript(name, url, settings) {
        if (scriptPromises.has(url)) return scriptPromises.get(url);
        const promise = new Promise((resolve, reject) => {
            const existing = Array.from(document.scripts || []).find(script => script.src === url && !failedScripts.has(script));
            const script = existing || document.createElement('script');
            let timer;
            let settled = false;
            function finish(error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
                if (error) {
                    failedScripts.add(script);
                    if (!existing && script.parentNode) script.parentNode.removeChild(script);
                    reject(error);
                } else resolve();
            }
            function onLoad() {
                const registry = global.JquanUIComponents || {};
                finish(registry[name] ? null : failure('COMPONENT_NOT_REGISTERED', name, url, `"${name}" loaded but did not register its component.`));
            }
            function onError(event) {
                finish(failure('COMPONENT_LOAD_FAILED', name, url, `Failed to load "${name}" from ${url}.`, event));
            }
            script.addEventListener('load', onLoad);
            script.addEventListener('error', onError);
            timer = setTimeout(() => finish(failure('COMPONENT_TIMEOUT', name, url, `Loading "${name}" timed out after ${settings.timeout}ms.`)), settings.timeout);
            if (!existing) {
                script.async = true;
                script.src = url;
                script.setAttribute('data-jquan-component', name);
                if (settings.nonce) script.nonce = settings.nonce;
                try { (document.head || document.documentElement).appendChild(script); }
                catch (error) { finish(failure('COMPONENT_LOAD_FAILED', name, url, `Failed to append script for "${name}".`, error)); }
            }
        });
        scriptPromises.set(url, promise);
        // Failed downloads can be retried; successful scripts never execute twice.
        promise.catch(() => { if (scriptPromises.get(url) === promise) scriptPromises.delete(url); });
        return promise;
    }

    async function importOne(name, settings, trail) {
        if (trail.includes(name)) throw failure('COMPONENT_DEPENDENCY_CYCLE', name, null, `Dependency cycle: ${trail.concat(name).join(' -> ')}`);
        const nextTrail = trail.concat(name);
        await Promise.all(catalog[name].map(dependency => importOne(dependency, settings, nextTrail)));
        const url = new URL(`${name}.js`, settings.baseURL).href;
        if (!(global.JquanUIComponents && global.JquanUIComponents[name])) await loadScript(name, url, settings);
        const registry = global.JquanUIComponents;
        const plugin = registry[name];
        if (settings.install && typeof plugin.install === 'function') {
            if (typeof global.JquanUI.use !== 'function') throw failure('COMPONENT_INSTALL_FAILED', name, url, 'Load Core before importing components.');
            try { global.JquanUI.use(plugin); }
            catch (error) { throw failure('COMPONENT_INSTALL_FAILED', name, url, `Failed to install "${name}".`, error); }
        }
        return registry[`${name}Api`] || plugin;
    }

    global.JquanUI.import = async function importComponent(names, options = {}) {
        const settings = resolveSettings(options);
        if (Array.isArray(names)) {
            const normalized = names.map(normalizeName);
            return Promise.all(normalized.map(name => importOne(name, settings, [])));
        }
        return importOne(normalizeName(names), settings, []);
    };
})(window);
