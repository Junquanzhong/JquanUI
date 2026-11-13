(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        namespace: '',
        defaults: {
            path: '/',
            sameSite: 'Lax',
            secure: false
        }
    };

    const encode = encodeURIComponent;
    const decode = decodeURIComponent;

    function applyNamespace(key) {
        const normalized = String(key || '').trim();
        if (!runtime.namespace) return normalized;
        return `${runtime.namespace}:${normalized}`;
    }

    function stripNamespace(key) {
        if (!runtime.namespace) return key;
        const prefix = `${runtime.namespace}:`;
        return key.startsWith(prefix) ? key.slice(prefix.length) : key;
    }

    function serializeOptions(options = {}) {
        const finalOptions = Object.assign({}, runtime.defaults, options);
        let result = '';

        if (finalOptions.expires) {
            const expiresDate = finalOptions.expires instanceof Date
                ? finalOptions.expires
                : new Date(Date.now() + Number(finalOptions.expires) * 1000);
            result += `; Expires=${expiresDate.toUTCString()}`;
        }

        if (typeof finalOptions.maxAge === 'number') result += `; Max-Age=${finalOptions.maxAge}`;
        if (finalOptions.domain) result += `; Domain=${finalOptions.domain}`;
        if (finalOptions.path) result += `; Path=${finalOptions.path}`;
        if (finalOptions.secure) result += '; Secure';
        if (finalOptions.sameSite) result += `; SameSite=${finalOptions.sameSite}`;
        return result;
    }

    function serializeValue(value, options = {}) {
        const payload = {
            value,
            expiresAt: typeof options.ttl === 'number' && options.ttl > 0 ? Date.now() + options.ttl : null,
            meta: {
                path: options.path || runtime.defaults.path || '',
                domain: options.domain || '',
                secure: options.secure === true || runtime.defaults.secure === true,
                sameSite: options.sameSite || runtime.defaults.sameSite || ''
            }
        };
        return encode(JSON.stringify(payload));
    }

    function deserializeValue(raw, fallback = null) {
        if (raw == null) return { ok: false, value: fallback, expired: false };
        try {
            const decoded = decode(raw);
            const parsed = JSON.parse(decoded);
            if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
                if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                    return { ok: false, value: fallback, expired: true, meta: parsed.meta || {} };
                }
                return { ok: true, value: parsed.value, expired: false, meta: parsed.meta || {} };
            }
            return { ok: true, value: parsed, expired: false, meta: {} };
        } catch (error) {
            try {
                return { ok: true, value: decode(raw), expired: false, meta: {} };
            } catch (nestedError) {
                return { ok: true, value: raw, expired: false, meta: {} };
            }
        }
    }

    function findCookieRow(key) {
        const namespacedKey = applyNamespace(key);
        return document.cookie.split('; ').find(row => row.startsWith(`${encode(namespacedKey)}=`)) || null;
    }

    function get(key, fallback = null) {
        const row = findCookieRow(key);
        if (!row) return fallback;
        const rawValue = row.slice(row.indexOf('=') + 1);
        const state = deserializeValue(rawValue, fallback);
        if (state.expired) {
            remove(key, state.meta || {});
            return fallback;
        }
        return state.value;
    }

    function set(key, value, options = {}) {
        const namespacedKey = applyNamespace(key);
        const serialized = serializeValue(value, options);
        document.cookie = `${encode(namespacedKey)}=${serialized}${serializeOptions(options)}`;
        return true;
    }

    function remove(key, options = {}) {
        const namespacedKey = applyNamespace(key);
        document.cookie = `${encode(namespacedKey)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0${serializeOptions(options)}`;
        return true;
    }

    function getAll() {
        return document.cookie.split('; ').reduce((acc, row) => {
            if (!row) return acc;
            const [encodedKey, ...rest] = row.split('=');
            const decodedKey = decode(encodedKey);
            if (runtime.namespace && !decodedKey.startsWith(`${runtime.namespace}:`)) return acc;
            const publicKey = stripNamespace(decodedKey);
            acc[publicKey] = get(publicKey);
            return acc;
        }, {});
    }

    function has(key) {
        return findCookieRow(key) !== null;
    }

    function keys() {
        return Object.keys(getAll());
    }

    function clear(options = {}) {
        keys().forEach(key => remove(key, options));
        return true;
    }

    function setMany(payload, options = {}) {
        Object.entries(payload || {}).forEach(([key, value]) => set(key, value, options));
        return true;
    }

    function getMany(requestKeys) {
        return (requestKeys || []).reduce((acc, key) => {
            acc[key] = get(key);
            return acc;
        }, {});
    }

    function config(options = {}) {
        if (typeof options.namespace === 'string') runtime.namespace = options.namespace.trim();
        if (options.defaults && typeof options.defaults === 'object') {
            runtime.defaults = Object.assign({}, runtime.defaults, options.defaults);
        }
        return {
            namespace: runtime.namespace,
            defaults: Object.assign({}, runtime.defaults)
        };
    }

    JquanUIComponents.cookieApi = {
        config,
        get,
        set,
        remove,
        getAll,
        clear,
        has,
        keys,
        setMany,
        getMany
    };

    JquanUIComponents.cookie = {
        name: 'jquanui-cookie',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
