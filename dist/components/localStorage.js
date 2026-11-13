(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const subscribers = new Map();
    const storageRuntime = {
        namespace: '',
        enabled: null
    };

    function isAvailable() {
        if (storageRuntime.enabled !== null) return storageRuntime.enabled;
        try {
            const probeKey = '__jquan_storage_probe__';
            window.localStorage.setItem(probeKey, '1');
            window.localStorage.removeItem(probeKey);
            storageRuntime.enabled = true;
        } catch (error) {
            storageRuntime.enabled = false;
        }
        return storageRuntime.enabled;
    }

    function applyNamespace(key) {
        const normalized = String(key || '').trim();
        if (!storageRuntime.namespace) return normalized;
        return `${storageRuntime.namespace}:${normalized}`;
    }

    function stripNamespace(storageKey) {
        if (!storageRuntime.namespace) return storageKey;
        const prefix = `${storageRuntime.namespace}:`;
        return storageKey.startsWith(prefix) ? storageKey.slice(prefix.length) : storageKey;
    }

    function serialize(value, options = {}) {
        const payload = {
            value,
            expiresAt: typeof options.ttl === 'number' && options.ttl > 0 ? Date.now() + options.ttl : null
        };
        return JSON.stringify(payload);
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
                console.error('[JquanUI localStorage] subscriber failed:', error);
            }
        });
    }

    function get(key, fallback = null) {
        if (!isAvailable()) return fallback;
        const namespacedKey = applyNamespace(key);
        const state = deserialize(window.localStorage.getItem(namespacedKey), fallback);
        if (state.expired) {
            window.localStorage.removeItem(namespacedKey);
            return fallback;
        }
        return state.value;
    }

    function set(key, value, options = {}) {
        if (!isAvailable()) return false;
        const namespacedKey = applyNamespace(key);
        const previousValue = get(key, null);
        window.localStorage.setItem(namespacedKey, serialize(value, options));
        emit(namespacedKey, value, previousValue, { key, namespacedKey, source: 'local' });
        return true;
    }

    function remove(key) {
        if (!isAvailable()) return false;
        const namespacedKey = applyNamespace(key);
        const previousValue = get(key, null);
        window.localStorage.removeItem(namespacedKey);
        emit(namespacedKey, null, previousValue, { key, namespacedKey, source: 'local', removed: true });
        return true;
    }

    function clear(options = {}) {
        if (!isAvailable()) return false;
        const onlyNamespace = options.namespaceOnly !== false;
        if (!onlyNamespace || !storageRuntime.namespace) {
            window.localStorage.clear();
            return true;
        }
        keys().forEach(key => remove(key));
        return true;
    }

    function has(key) {
        if (!isAvailable()) return false;
        const namespacedKey = applyNamespace(key);
        const raw = window.localStorage.getItem(namespacedKey);
        const state = deserialize(raw, null);
        if (state.expired) {
            window.localStorage.removeItem(namespacedKey);
            return false;
        }
        return raw !== null;
    }

    function keys() {
        if (!isAvailable()) return [];
        const result = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const storageKey = window.localStorage.key(i);
            if (!storageKey) continue;
            if (!storageRuntime.namespace || storageKey.startsWith(`${storageRuntime.namespace}:`)) {
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
        Object.entries(payload || {}).forEach(([key, value]) => {
            set(key, value, options);
        });
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
        if (typeof options.namespace === 'string') {
            storageRuntime.namespace = options.namespace.trim();
        }
        if (typeof options.enabled === 'boolean') {
            storageRuntime.enabled = options.enabled;
        }
        return {
            namespace: storageRuntime.namespace,
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
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const storageKey = window.localStorage.key(i);
            if (!storageKey) continue;
            if (storageRuntime.namespace && !storageKey.startsWith(`${storageRuntime.namespace}:`)) continue;
            const raw = window.localStorage.getItem(storageKey);
            const state = deserialize(raw, null);
            if (state.expired) {
                window.localStorage.removeItem(storageKey);
                removed += 1;
            }
        }
        return removed;
    }

    window.addEventListener('storage', event => {
        if (!event.key) return;
        if (storageRuntime.namespace && !event.key.startsWith(`${storageRuntime.namespace}:`)) return;
        const nextState = deserialize(event.newValue, null);
        const previousState = deserialize(event.oldValue, null);
        emit(event.key, nextState.expired ? null : nextState.value, previousState.value, {
            key: stripNamespace(event.key),
            namespacedKey: event.key,
            source: 'storage'
        });
    });

    JquanUIComponents.localStorageApi = {
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

    JquanUIComponents.localStorage = {
        name: 'jquanui-local-storage',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
