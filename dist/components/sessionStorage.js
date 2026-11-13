(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const subscribers = new Map();
    const runtime = {
        namespace: '',
        enabled: null
    };

    function isAvailable() {
        if (runtime.enabled !== null) return runtime.enabled;
        try {
            const probeKey = '__jquan_session_probe__';
            window.sessionStorage.setItem(probeKey, '1');
            window.sessionStorage.removeItem(probeKey);
            runtime.enabled = true;
        } catch (error) {
            runtime.enabled = false;
        }
        return runtime.enabled;
    }

    function applyNamespace(key) {
        const normalized = String(key || '').trim();
        if (!runtime.namespace) return normalized;
        return `${runtime.namespace}:${normalized}`;
    }

    function stripNamespace(storageKey) {
        if (!runtime.namespace) return storageKey;
        const prefix = `${runtime.namespace}:`;
        return storageKey.startsWith(prefix) ? storageKey.slice(prefix.length) : storageKey;
    }

    function serialize(value, options = {}) {
        return JSON.stringify({
            value,
            expiresAt: typeof options.ttl === 'number' && options.ttl > 0 ? Date.now() + options.ttl : null
        });
    }

    function deserialize(raw, fallback = null) {
        if (raw == null) return { ok: false, value: fallback, expired: false };
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
                if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                    return { ok: false, value: fallback, expired: true };
                }
                return { ok: true, value: parsed.value, expired: false };
            }
            return { ok: true, value: parsed, expired: false };
        } catch (error) {
            return { ok: true, value: raw, expired: false };
        }
    }

    function emit(key, nextValue, previousValue, meta = {}) {
        const listeners = subscribers.get(key);
        if (!listeners || listeners.size === 0) return;
        listeners.forEach(listener => {
            try {
                listener(nextValue, previousValue, meta);
            } catch (error) {
                console.error('[JquanUI sessionStorage] subscriber failed:', error);
            }
        });
    }

    function get(key, fallback = null) {
        if (!isAvailable()) return fallback;
        const namespacedKey = applyNamespace(key);
        const state = deserialize(window.sessionStorage.getItem(namespacedKey), fallback);
        if (state.expired) {
            window.sessionStorage.removeItem(namespacedKey);
            return fallback;
        }
        return state.value;
    }

    function set(key, value, options = {}) {
        if (!isAvailable()) return false;
        const namespacedKey = applyNamespace(key);
        const previousValue = get(key, null);
        window.sessionStorage.setItem(namespacedKey, serialize(value, options));
        emit(namespacedKey, value, previousValue, { key, namespacedKey, source: 'local' });
        return true;
    }

    function remove(key) {
        if (!isAvailable()) return false;
        const namespacedKey = applyNamespace(key);
        const previousValue = get(key, null);
        window.sessionStorage.removeItem(namespacedKey);
        emit(namespacedKey, null, previousValue, { key, namespacedKey, source: 'local', removed: true });
        return true;
    }

    function clear(options = {}) {
        if (!isAvailable()) return false;
        const onlyNamespace = options.namespaceOnly !== false;
        if (!onlyNamespace || !runtime.namespace) {
            window.sessionStorage.clear();
            return true;
        }
        keys().forEach(key => remove(key));
        return true;
    }

    function has(key) {
        if (!isAvailable()) return false;
        const namespacedKey = applyNamespace(key);
        const raw = window.sessionStorage.getItem(namespacedKey);
        const state = deserialize(raw, null);
        if (state.expired) {
            window.sessionStorage.removeItem(namespacedKey);
            return false;
        }
        return raw !== null;
    }

    function keys() {
        if (!isAvailable()) return [];
        const result = [];
        for (let i = 0; i < window.sessionStorage.length; i += 1) {
            const storageKey = window.sessionStorage.key(i);
            if (!storageKey) continue;
            if (!runtime.namespace || storageKey.startsWith(`${runtime.namespace}:`)) {
                const publicKey = stripNamespace(storageKey);
                if (has(publicKey)) result.push(publicKey);
            }
        }
        return result;
    }

    function entries() {
        return keys().map(key => [key, get(key)]);
    }

    function getMany(requestKeys) {
        return (requestKeys || []).reduce((acc, key) => {
            acc[key] = get(key);
            return acc;
        }, {});
    }

    function setMany(payload, options = {}) {
        Object.entries(payload || {}).forEach(([key, value]) => set(key, value, options));
        return true;
    }

    function on(key, callback) {
        const namespacedKey = applyNamespace(key);
        if (!subscribers.has(namespacedKey)) subscribers.set(namespacedKey, new Set());
        subscribers.get(namespacedKey).add(callback);

        return () => {
            const listeners = subscribers.get(namespacedKey);
            if (!listeners) return;
            listeners.delete(callback);
            if (listeners.size === 0) subscribers.delete(namespacedKey);
        };
    }

    function config(options = {}) {
        if (typeof options.namespace === 'string') runtime.namespace = options.namespace.trim();
        if (typeof options.enabled === 'boolean') runtime.enabled = options.enabled;
        return {
            namespace: runtime.namespace,
            enabled: isAvailable()
        };
    }

    function touch(key, ttl) {
        const current = get(key);
        if (typeof current === 'undefined' || current === null) return false;
        return set(key, current, { ttl });
    }

    function purgeExpired() {
        if (!isAvailable()) return 0;
        let removed = 0;
        for (let i = 0; i < window.sessionStorage.length; i += 1) {
            const storageKey = window.sessionStorage.key(i);
            if (!storageKey) continue;
            if (runtime.namespace && !storageKey.startsWith(`${runtime.namespace}:`)) continue;
            const raw = window.sessionStorage.getItem(storageKey);
            const state = deserialize(raw, null);
            if (state.expired) {
                window.sessionStorage.removeItem(storageKey);
                removed += 1;
            }
        }
        return removed;
    }

    JquanUIComponents.sessionStorageApi = {
        isAvailable,
        config,
        get,
        set,
        remove,
        clear,
        has,
        keys,
        entries,
        getMany,
        setMany,
        on,
        touch,
        purgeExpired
    };

    JquanUIComponents.sessionStorage = {
        name: 'jquanui-session-storage',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
