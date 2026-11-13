(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        stores: new Map()
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-store-${runtime.seed}`;
    }

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function clone(value) {
        if (typeof structuredClone === 'function') return structuredClone(value);
        return JSON.parse(JSON.stringify(value));
    }

    function deepMerge(base, extra) {
        const output = Array.isArray(base) ? base.slice() : Object.assign({}, base);
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

    function getByPath(source, path) {
        if (!path) return source;
        return String(path).split('.').reduce((cursor, segment) => cursor == null ? undefined : cursor[segment], source);
    }

    function setByPath(target, path, value) {
        const segments = String(path || '').split('.').filter(Boolean);
        if (!segments.length) return value;
        const output = Array.isArray(target) ? target.slice() : deepMerge({}, target || {});
        let cursor = output;
        segments.forEach((segment, index) => {
            if (index === segments.length - 1) {
                cursor[segment] = value;
                return;
            }
            if (!isPlainObject(cursor[segment]) && !Array.isArray(cursor[segment])) {
                cursor[segment] = {};
            } else if (Array.isArray(cursor[segment])) {
                cursor[segment] = cursor[segment].slice();
            } else {
                cursor[segment] = deepMerge({}, cursor[segment]);
            }
            cursor = cursor[segment];
        });
        return output;
    }

    function createEmitter() {
        const listeners = new Set();
        return {
            subscribe(handler) {
                if (typeof handler !== 'function') return () => {};
                listeners.add(handler);
                return () => listeners.delete(handler);
            },
            emit(payload) {
                Array.from(listeners).forEach(handler => {
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

    function getStorage() {
        return JquanUIComponents.storageApi || null;
    }

    function createStore(options = {}) {
        const id = options.id || nextId();
        const emitter = createEmitter();
        const actionListeners = new Set();
        const selectors = new Set();
        const storage = getStorage();
        const persist = options.persist || null;
        const persistKey = typeof persist === 'string' ? persist : persist?.key;

        let state = clone(options.state || {});
        if (persist && storage && persistKey) {
            const driver = persist.driver || 'local';
            const saved = storage.get(persistKey, null, { driver });
            if (saved != null) state = isPlainObject(state) && isPlainObject(saved) ? deepMerge(state, saved) : saved;
        }

        function save() {
            if (!persist || !storage || !persistKey) return;
            const driver = persist.driver || 'local';
            const payload = typeof persist.serialize === 'function' ? persist.serialize(state) : state;
            storage.set(persistKey, payload, { driver });
        }

        function notify(meta) {
            const snapshot = clone(state);
            emitter.emit({
                id,
                state: snapshot,
                meta
            });
            selectors.forEach(entry => {
                const nextValue = entry.selector(snapshot);
                if (!Object.is(nextValue, entry.lastValue)) {
                    const previousValue = entry.lastValue;
                    entry.lastValue = nextValue;
                    entry.listener(nextValue, previousValue, meta);
                }
            });
            save();
        }

        const store = {
            id,
            getState() {
                return clone(state);
            },
            get(path, fallback = undefined) {
                const value = getByPath(state, path);
                return value === undefined ? fallback : clone(value);
            },
            set(nextState, meta = {}) {
                const previous = state;
                state = clone(nextState);
                notify(Object.assign({ type: 'set', previousState: clone(previous) }, meta));
                return store;
            },
            patch(patchState, meta = {}) {
                const previous = state;
                state = isPlainObject(state) && isPlainObject(patchState)
                    ? deepMerge(state, patchState)
                    : clone(patchState);
                notify(Object.assign({ type: 'patch', previousState: clone(previous) }, meta));
                return store;
            },
            update(path, valueOrUpdater, meta = {}) {
                const current = getByPath(state, path);
                const nextValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(clone(current), clone(state)) : valueOrUpdater;
                const previous = state;
                state = setByPath(state, path, nextValue);
                notify(Object.assign({ type: 'update', path, previousState: clone(previous) }, meta));
                return store;
            },
            reset(meta = {}) {
                const previous = state;
                state = clone(options.state || {});
                notify(Object.assign({ type: 'reset', previousState: clone(previous) }, meta));
                return store;
            },
            subscribe(listener, immediate = false) {
                if (immediate) {
                    listener({
                        id,
                        state: clone(state),
                        meta: { type: 'init' }
                    });
                }
                return emitter.subscribe(listener);
            },
            watch(selector, listener, immediate = true) {
                if (typeof selector !== 'function' || typeof listener !== 'function') return () => {};
                const entry = {
                    selector,
                    listener,
                    lastValue: selector(state)
                };
                selectors.add(entry);
                if (immediate) listener(entry.lastValue, undefined, { type: 'init' });
                return () => selectors.delete(entry);
            },
            action(type, payload, meta = {}) {
                Array.from(actionListeners).forEach(handler => handler({ type, payload, meta, store }));
                notify(Object.assign({ type: 'action', actionType: type, payload }, meta));
                return store;
            },
            onAction(listener) {
                if (typeof listener !== 'function') return () => {};
                actionListeners.add(listener);
                return () => actionListeners.delete(listener);
            },
            transaction(mutator, meta = {}) {
                const draft = clone(state);
                const result = typeof mutator === 'function' ? mutator(draft) : draft;
                const nextState = result === undefined ? draft : result;
                const previous = state;
                state = clone(nextState);
                notify(Object.assign({ type: 'transaction', previousState: clone(previous) }, meta));
                return store;
            },
            destroy() {
                emitter.clear();
                actionListeners.clear();
                selectors.clear();
                runtime.stores.delete(id);
                return true;
            }
        };

        runtime.stores.set(id, store);
        return store;
    }

    const storeApi = {
        create(options = {}) {
            return createStore(options);
        },
        get(id) {
            return runtime.stores.get(id) || null;
        },
        destroy(id) {
            const store = runtime.stores.get(id);
            return store ? store.destroy() : false;
        }
    };

    JquanUIComponents.storeApi = storeApi;

    JquanUIComponents.store = {
        name: 'jquanui-store',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
