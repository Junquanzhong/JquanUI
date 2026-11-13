(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        defaultDriver: 'local',
        namespace: ''
    };

    function assertDriver(name) {
        const driver = getDriver(name);
        if (!driver) {
            throw new Error(`[JquanUI storage] Unknown driver: ${name}`);
        }
        return driver;
    }

    function getDriver(name) {
        switch (name) {
            case 'local':
                return JquanUIComponents.localStorageApi || null;
            case 'session':
                return JquanUIComponents.sessionStorageApi || null;
            case 'cookie':
                return JquanUIComponents.cookieApi || null;
            default:
                return null;
        }
    }

    function resolveDriverName(options = {}) {
        return options.driver || runtime.defaultDriver;
    }

    function configureNamespaces(namespace) {
        if (JquanUIComponents.localStorageApi) JquanUIComponents.localStorageApi.config({ namespace });
        if (JquanUIComponents.sessionStorageApi) JquanUIComponents.sessionStorageApi.config({ namespace });
        if (JquanUIComponents.cookieApi) JquanUIComponents.cookieApi.config({ namespace });
    }

    function withDriver(method, key, value, options = {}) {
        const driverName = resolveDriverName(options);
        const driver = assertDriver(driverName);

        switch (method) {
            case 'get':
                return driver.get(key, value);
            case 'set':
                return driver.set(key, value, options);
            case 'remove':
                return driver.remove(key, options);
            case 'has':
                return driver.has(key);
            case 'touch':
                return driver.touch ? driver.touch(key, value) : false;
            default:
                throw new Error(`[JquanUI storage] Unsupported method: ${method}`);
        }
    }

    const storageApi = {
        config(options = {}) {
            if (typeof options.defaultDriver === 'string') {
                runtime.defaultDriver = options.defaultDriver;
            }
            if (typeof options.namespace === 'string') {
                runtime.namespace = options.namespace.trim();
                configureNamespaces(runtime.namespace);
            }
            return {
                defaultDriver: runtime.defaultDriver,
                namespace: runtime.namespace
            };
        },

        driver(name) {
            return assertDriver(name);
        },

        isAvailable(driverName = runtime.defaultDriver) {
            const driver = assertDriver(driverName);
            return typeof driver.isAvailable === 'function' ? driver.isAvailable() : true;
        },

        get(key, fallback = null, options = {}) {
            return withDriver('get', key, fallback, options);
        },

        set(key, value, options = {}) {
            return withDriver('set', key, value, options);
        },

        remove(key, options = {}) {
            return withDriver('remove', key, null, options);
        },

        has(key, options = {}) {
            return withDriver('has', key, null, options);
        },

        touch(key, ttl, options = {}) {
            return withDriver('touch', key, ttl, options);
        },

        clear(options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            return driver.clear(options);
        },

        keys(options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            return driver.keys();
        },

        entries(options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            return typeof driver.entries === 'function' ? driver.entries() : Object.entries(driver.getAll());
        },

        getMany(keys, options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            return driver.getMany(keys);
        },

        setMany(payload, options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            return driver.setMany(payload, options);
        },

        on(key, callback, options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            if (typeof driver.on !== 'function') {
                throw new Error(`[JquanUI storage] Driver "${resolveDriverName(options)}" does not support subscriptions.`);
            }
            return driver.on(key, callback);
        },

        purgeExpired(options = {}) {
            const driver = assertDriver(resolveDriverName(options));
            if (typeof driver.purgeExpired !== 'function') return 0;
            return driver.purgeExpired();
        },

        cookie: () => assertDriver('cookie'),
        local: () => assertDriver('local'),
        session: () => assertDriver('session')
    };

    JquanUIComponents.storageApi = storageApi;

    JquanUIComponents.storage = {
        name: 'jquanui-storage',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
