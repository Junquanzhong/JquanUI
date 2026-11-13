(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        mode: 'hash',
        routes: [],
        root: null,
        notFound: null,
        beforeEach: null,
        afterEach: null,
        loading: null,
        cacheLimit: 12
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-router-${runtime.seed}`;
    }

    function normalizeRoutes(routes, parent = null) {
        return (Array.isArray(routes) ? routes : []).map(route => {
            const normalized = Object.assign({
                path: '/',
                name: '',
                title: '',
                component: null,
                redirect: '',
                children: [],
                meta: {}
            }, route || {});
            normalized.parent = parent;
            normalized.children = normalizeRoutes(normalized.children, normalized);
            return normalized;
        });
    }

    function flattenRoutes(routes, bucket = []) {
        routes.forEach(route => {
            bucket.push(route);
            if (route.children.length) flattenRoutes(route.children, bucket);
        });
        return bucket;
    }

    function normalizePath(path) {
        const raw = String(path || '/').trim();
        if (!raw) return '/';
        const cleaned = raw.replace(/\/{2,}/g, '/');
        if (cleaned === '/') return '/';
        return cleaned.startsWith('/') ? cleaned.replace(/\/+$/, '') : `/${cleaned.replace(/\/+$/, '')}`;
    }

    function parseQuery(queryString) {
        const query = {};
        const params = new URLSearchParams((queryString || '').replace(/^\?/, ''));
        params.forEach((value, key) => {
            if (Object.prototype.hasOwnProperty.call(query, key)) {
                if (Array.isArray(query[key])) query[key].push(value);
                else query[key] = [query[key], value];
            } else {
                query[key] = value;
            }
        });
        return query;
    }

    function buildQuery(query = {}) {
        const params = new URLSearchParams();
        Object.entries(query || {}).forEach(([key, value]) => {
            if (value == null) return;
            if (Array.isArray(value)) value.forEach(item => params.append(key, item));
            else params.set(key, value);
        });
        const output = params.toString();
        return output ? `?${output}` : '';
    }

    function compilePathPattern(path) {
        const keys = [];
        const pattern = normalizePath(path)
            .replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
            .replace(/\\\/:([\w]+)/g, (_, key) => {
                keys.push(key);
                return '/([^/]+)';
            });
        return {
            keys,
            regex: new RegExp(`^${pattern}$`)
        };
    }

    function resolveCurrentPath(mode) {
        if (mode === 'history') {
            return `${window.location.pathname}${window.location.search}`;
        }
        const hash = window.location.hash.replace(/^#/, '') || '/';
        return hash.startsWith('/') ? hash : `/${hash}`;
    }

    function splitLocation(rawLocation) {
        const [path, search = ''] = String(rawLocation || '/').split('?');
        return {
            path: normalizePath(path),
            query: parseQuery(search)
        };
    }

    function matchRoute(route, path) {
        const compiled = route.__compiled || (route.__compiled = compilePathPattern(route.path));
        const matched = path.match(compiled.regex);
        if (!matched) return null;
        const params = {};
        compiled.keys.forEach((key, index) => {
            params[key] = decodeURIComponent(matched[index + 1] || '');
        });
        return params;
    }

    function checkPermission(route) {
        const permissionApi = JquanUIComponents.permissionApi;
        if (!route.meta) return true;
        if (route.meta.permission && permissionApi && typeof permissionApi.has === 'function') {
            return permissionApi.has(route.meta.permission, route.meta.permissionMode || 'some');
        }
        if (route.meta.role && permissionApi && typeof permissionApi.hasRole === 'function') {
            return permissionApi.hasRole(route.meta.role, route.meta.roleMode || 'some');
        }
        return true;
    }

    function resolveTarget(record, rawLocation) {
        const current = splitLocation(rawLocation);
        const flatRoutes = flattenRoutes(record.routes);
        for (let i = 0; i < flatRoutes.length; i += 1) {
            const route = flatRoutes[i];
            const params = matchRoute(route, current.path);
            if (!params) continue;
            return {
                path: current.path,
                fullPath: `${current.path}${buildQuery(current.query)}`,
                query: current.query,
                params,
                route
            };
        }
        return {
            path: current.path,
            fullPath: `${current.path}${buildQuery(current.query)}`,
            query: current.query,
            params: {},
            route: record.options.notFound || null
        };
    }

    function routeChain(route) {
        const chain = [];
        let cursor = route || null;
        while (cursor) {
            chain.unshift(cursor);
            cursor = cursor.parent || null;
        }
        return chain;
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function cacheKeyOf(target) {
        const route = target?.route;
        return route?.name || target?.fullPath || target?.path || '';
    }

    function getRoot(record) {
        const root = resolveElement(record.options.root);
        if (!root) throw new Error('[JquanUI router] root container not found.');
        return root;
    }

    function getOrCreateViewContainer(root, key) {
        const existing = Array.from(root.querySelectorAll('[data-route-cache-key]')).find(node => node.getAttribute('data-route-cache-key') === key);
        if (existing) return existing;
        const container = document.createElement('div');
        container.setAttribute('data-route-cache-key', key);
        root.appendChild(container);
        return container;
    }

    function markCacheUsed(record, key) {
        const existing = record.cacheOrder.indexOf(key);
        if (existing >= 0) record.cacheOrder.splice(existing, 1);
        record.cacheOrder.push(key);
    }

    function pruneCache(record, root) {
        while (record.cacheOrder.length > record.options.cacheLimit) {
            const key = record.cacheOrder.shift();
            const cache = record.cache.get(key);
            if (!cache) continue;
            cache.destroy?.();
            cache.container?.remove();
            record.cache.delete(key);
        }
        root.querySelectorAll('[data-route-cache-key]').forEach(node => {
            const key = node.getAttribute('data-route-cache-key');
            node.style.display = key === record.activeCacheKey ? '' : 'none';
        });
    }

    function clearNonCachedViews(root) {
        root.querySelectorAll('[data-route-transient="true"]').forEach(node => node.remove());
    }

    function normalizeViewOutput(view) {
        if (view && typeof view === 'object' && !Array.isArray(view) && !(view instanceof Node)) {
            return {
                content: Object.prototype.hasOwnProperty.call(view, 'content') ? view.content : '',
                destroy: typeof view.destroy === 'function' ? view.destroy : null
            };
        }
        return { content: view, destroy: null };
    }

    async function renderInto(container, viewResult) {
        container.innerHTML = '';
        if (typeof viewResult.content === 'string') {
            container.innerHTML = viewResult.content;
        } else if (viewResult.content instanceof Node) {
            container.appendChild(viewResult.content);
        } else if (viewResult.content != null) {
            container.textContent = String(viewResult.content);
        }
    }

    async function renderRoute(record, target) {
        const root = getRoot(record);
        if (target.route?.redirect) {
            return navigate(record.id, target.route.redirect, { replace: true });
        }
        const route = target.route;
        if (!route) {
            clearNonCachedViews(root);
            root.innerHTML = '<div>404</div>';
            record.activeCacheKey = '';
            return target;
        }

        const keepAlive = route.meta?.keepAlive === true;

        if (keepAlive) {
            const key = cacheKeyOf(target);
            let cached = record.cache.get(key);
            if (!cached) {
                let view = route.component;
                if (typeof route.component === 'function') {
                    view = await route.component(target, createHandle(record.id));
                }
                const viewResult = normalizeViewOutput(view);
                const container = getOrCreateViewContainer(root, key);
                await renderInto(container, viewResult);
                cached = {
                    key,
                    container,
                    destroy: viewResult.destroy,
                    target: Object.assign({}, target)
                };
                record.cache.set(key, cached);
            } else {
                cached.target = Object.assign({}, target);
            }
            record.activeCacheKey = key;
            markCacheUsed(record, key);
            clearNonCachedViews(root);
            pruneCache(record, root);
        } else {
            let view = route.component;
            if (typeof route.component === 'function') {
                view = await route.component(target, createHandle(record.id));
            }
            const viewResult = normalizeViewOutput(view);
            record.activeCacheKey = '';
            root.querySelectorAll('[data-route-cache-key]').forEach(node => {
                node.style.display = 'none';
            });
            clearNonCachedViews(root);
            const transient = document.createElement('div');
            transient.setAttribute('data-route-transient', 'true');
            root.appendChild(transient);
            await renderInto(transient, viewResult);
        }

        record.current = Object.assign({}, target, { matched: routeChain(route), keepAlive });
        if (route.title) document.title = route.title;
        return record.current;
    }

    async function transition(record, rawLocation) {
        const from = record.current;
        const to = resolveTarget(record, rawLocation);
        if (to.route && !checkPermission(to.route)) return false;
        if (typeof record.options.beforeEach === 'function') {
            const allowed = await record.options.beforeEach(to, from, createHandle(record.id));
            if (allowed === false) return false;
            if (typeof allowed === 'string') return navigate(record.id, allowed, { replace: true });
        }
        if (typeof record.options.loading === 'function') record.options.loading(true, to, from);
        const result = await renderRoute(record, to);
        if (typeof record.options.loading === 'function') record.options.loading(false, result, from);
        if (typeof record.options.afterEach === 'function') record.options.afterEach(result, from, createHandle(record.id));
        return result;
    }

    function writeLocation(mode, fullPath, replace) {
        if (mode === 'history') {
            if (replace) history.replaceState({}, '', fullPath);
            else history.pushState({}, '', fullPath);
            return;
        }
        const targetHash = `#${fullPath}`;
        if (replace) {
            const url = `${window.location.pathname}${window.location.search}${targetHash}`;
            history.replaceState({}, '', url);
        } else {
            window.location.hash = fullPath;
        }
    }

    async function navigate(target, location, options = {}) {
        const record = typeof target === 'string' ? runtime.instances.get(target) : target;
        if (!record) return null;
        const destination = typeof location === 'string'
            ? location
            : `${normalizePath(location.path || '/')}${buildQuery(location.query || {})}`;
        writeLocation(record.options.mode, destination, options.replace === true);
        return transition(record, destination);
    }

    function mount(options = {}) {
        const id = options.id || nextId();
        const record = {
            id,
            options: Object.assign({}, defaults, options),
            routes: normalizeRoutes(options.routes || []),
            current: null,
            cleanup: null,
            cache: new Map(),
            cacheOrder: [],
            activeCacheKey: ''
        };
        runtime.instances.set(id, record);

        const onLocationChange = () => {
            transition(record, resolveCurrentPath(record.options.mode)).catch(() => {});
        };
        window.addEventListener(record.options.mode === 'history' ? 'popstate' : 'hashchange', onLocationChange);
        record.cleanup = () => window.removeEventListener(record.options.mode === 'history' ? 'popstate' : 'hashchange', onLocationChange);
        transition(record, resolveCurrentPath(record.options.mode)).catch(() => {});
        return createHandle(id);
    }

    function createHandle(id) {
        const record = runtime.instances.get(id);
        if (!record) return null;
        return {
            id,
            current() {
                return record.current;
            },
            routes() {
                return flattenRoutes(record.routes).slice();
            },
            push(location) {
                return navigate(record, location, { replace: false });
            },
            replace(location) {
                return navigate(record, location, { replace: true });
            },
            resolve(location) {
                return resolveTarget(record, location);
            },
            clearCache(path) {
                const key = path ? cacheKeyOf(resolveTarget(record, path)) : null;
                if (!key) {
                    record.cache.forEach(cache => {
                        cache.destroy?.();
                        cache.container?.remove();
                    });
                    record.cache.clear();
                    record.cacheOrder = [];
                    record.activeCacheKey = '';
                    return true;
                }
                const cache = record.cache.get(key);
                if (!cache) return false;
                cache.destroy?.();
                cache.container?.remove();
                record.cache.delete(key);
                record.cacheOrder = record.cacheOrder.filter(item => item !== key);
                if (record.activeCacheKey === key) record.activeCacheKey = '';
                return true;
            },
            destroy() {
                record.cleanup?.();
                record.cache.forEach(cache => cache.destroy?.());
                runtime.instances.delete(id);
                return true;
            }
        };
    }

    const routerApi = {
        create(options = {}) {
            return mount(options);
        },
        get(id) {
            return runtime.instances.has(id) ? createHandle(id) : null;
        }
    };

    JquanUIComponents.routerApi = routerApi;

    JquanUIComponents.router = {
        name: 'jquanui-router',
        version: '1.1.0',
        requires: [],
        install() {}
    };
})(window);
