(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        requestSeed: 0,
        instances: new Map()
    };

    const defaults = {
        baseURL: '',
        timeout: 15000,
        headers: {
            Accept: 'application/json, text/plain, */*'
        },
        credentials: 'same-origin',
        responseType: 'auto',
        retries: 0,
        retryDelay: 300,
        retryOn: [408, 425, 429, 500, 502, 503, 504],
        validateStatus(status) {
            return status >= 200 && status < 300;
        },
        paramsSerializer: null,
        transformRequest: null,
        transformResponse: null
    };

    function nextRequestId() {
        runtime.requestSeed += 1;
        return `jq-http-${runtime.requestSeed}`;
    }

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

    function normalizeMethod(method) {
        return String(method || 'GET').trim().toUpperCase();
    }

    function normalizeHeaders(headers) {
        const output = new Headers();
        Object.entries(headers || {}).forEach(([key, value]) => {
            if (value == null) return;
            output.set(key, String(value));
        });
        return output;
    }

    function headersToObject(headers) {
        if (!headers) return {};
        if (headers instanceof Headers) {
            const output = {};
            headers.forEach((value, key) => {
                output[key] = value;
            });
            return output;
        }
        return Object.assign({}, headers);
    }

    function serializeParams(params, serializer) {
        if (!params) return '';
        if (typeof serializer === 'function') return serializer(params);
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value == null) return;
            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (item != null) search.append(key, String(item));
                });
                return;
            }
            if (isPlainObject(value)) {
                search.append(key, JSON.stringify(value));
                return;
            }
            search.append(key, String(value));
        });
        return search.toString();
    }

    function buildURL(baseURL, url, params, serializer) {
        const raw = String(url || '');
        const resolved = baseURL ? new URL(raw, baseURL).toString() : raw;
        const query = serializeParams(params, serializer);
        if (!query) return resolved;
        return `${resolved}${resolved.includes('?') ? '&' : '?'}${query}`;
    }

    function isBodyMethod(method) {
        return !['GET', 'HEAD'].includes(normalizeMethod(method));
    }

    function isFormData(value) {
        return typeof FormData !== 'undefined' && value instanceof FormData;
    }

    function isURLSearchParams(value) {
        return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
    }

    function createHttpError(message, meta = {}) {
        const error = new Error(message);
        error.name = 'JquanHttpError';
        Object.assign(error, meta);
        return error;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function shouldRetry(error, config, attempt) {
        const maxRetries = Number(config.retries) || 0;
        if (attempt >= maxRetries) return false;
        if (error?.isCanceled) return false;
        if (error?.name === 'AbortError') return false;
        if (error?.response) {
            return (config.retryOn || []).includes(error.response.status);
        }
        return true;
    }

    function parseContentType(headers) {
        const contentType = headers?.get ? headers.get('content-type') : headers?.['content-type'];
        return String(contentType || '').toLowerCase();
    }

    async function parseResponseBody(response, responseType) {
        if (responseType === 'raw') return response;
        if (responseType === 'text') return response.text();
        if (responseType === 'blob') return response.blob();
        if (responseType === 'arrayBuffer') return response.arrayBuffer();
        if (responseType === 'formData') return response.formData();

        const contentType = parseContentType(response.headers);
        if (responseType === 'json') {
            if (response.status === 204) return null;
            return response.json();
        }
        if (contentType.includes('application/json') || contentType.includes('+json')) {
            if (response.status === 204) return null;
            return response.json();
        }
        if (contentType.startsWith('text/') || contentType.includes('xml') || contentType.includes('html')) {
            return response.text();
        }
        return response.text();
    }

    function createInterceptorStore() {
        const items = [];
        return {
            use(onFulfilled, onRejected) {
                const record = { onFulfilled, onRejected };
                items.push(record);
                return () => {
                    const index = items.indexOf(record);
                    if (index >= 0) items.splice(index, 1);
                };
            },
            async runFulfilled(value) {
                let current = value;
                for (let i = 0; i < items.length; i += 1) {
                    if (typeof items[i].onFulfilled === 'function') {
                        current = await items[i].onFulfilled(current);
                    }
                }
                return current;
            },
            async runRejected(error) {
                let current = error;
                for (let i = 0; i < items.length; i += 1) {
                    if (typeof items[i].onRejected === 'function') {
                        current = await items[i].onRejected(current);
                    }
                }
                throw current;
            }
        };
    }

    function applyAuthHeaders(config, instance) {
        if (!instance.runtime.auth) return config;
        const auth = instance.runtime.auth;
        const token = typeof auth.getToken === 'function' ? auth.getToken() : auth.token;
        if (!token) return config;
        const type = auth.type || 'Bearer';
        config.headers.set(auth.header || 'Authorization', type ? `${type} ${token}` : String(token));
        return config;
    }

    function prepareBody(config) {
        if (!isBodyMethod(config.method)) return undefined;
        const data = config.data;
        if (data == null) return undefined;
        if (isFormData(data) || isURLSearchParams(data) || data instanceof Blob || data instanceof ArrayBuffer || typeof data === 'string') {
            return data;
        }
        if (isPlainObject(data) || Array.isArray(data)) {
            if (!config.headers.has('Content-Type')) {
                config.headers.set('Content-Type', 'application/json');
            }
            const contentType = config.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) return JSON.stringify(data);
            if (contentType.includes('application/x-www-form-urlencoded')) {
                const search = new URLSearchParams();
                Object.entries(data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach(item => search.append(key, item));
                    } else if (value != null) {
                        search.append(key, value);
                    }
                });
                return search;
            }
        }
        return data;
    }

    function mergeConfig(baseConfig, inputConfig = {}) {
        const merged = deepMerge(baseConfig, inputConfig);
        merged.method = normalizeMethod(merged.method);
        merged.headers = normalizeHeaders(merged.headers);
        return merged;
    }

    function createAbortSignal(config) {
        const controller = new AbortController();
        const cleanup = [];
        if (config.signal) {
            if (config.signal.aborted) controller.abort(config.signal.reason);
            else {
                const forwardAbort = () => controller.abort(config.signal.reason);
                config.signal.addEventListener('abort', forwardAbort, { once: true });
                cleanup.push(() => config.signal.removeEventListener('abort', forwardAbort));
            }
        }
        let timer = null;
        if (Number(config.timeout) > 0) {
            timer = setTimeout(() => {
                controller.abort(createHttpError(`Request timeout after ${config.timeout}ms.`, {
                    code: 'ERR_TIMEOUT',
                    config
                }));
            }, Number(config.timeout));
            cleanup.push(() => clearTimeout(timer));
        }
        return {
            signal: controller.signal,
            abort(reason) {
                controller.abort(reason);
            },
            cleanup() {
                cleanup.forEach(fn => fn());
            }
        };
    }

    function createResponseShape(response, data, config, requestId, duration) {
        return {
            requestId,
            data,
            status: response.status,
            statusText: response.statusText,
            headers: headersToObject(response.headers),
            config,
            url: response.url,
            ok: response.ok,
            duration,
            raw: response
        };
    }

    async function dispatchRequest(instance, inputConfig) {
        const requestId = nextRequestId();
        const baseConfig = deepMerge(defaults, instance.defaults);
        let config = mergeConfig(baseConfig, inputConfig);
        config.requestId = requestId;
        config.metadata = Object.assign({}, config.metadata);
        config = await instance.interceptors.request.runFulfilled(config);
        config = applyAuthHeaders(config, instance);
        config.url = buildURL(config.baseURL, config.url, config.params, config.paramsSerializer);
        const body = prepareBody(config);
        let attempt = 0;

        while (true) {
            const startedAt = Date.now();
            const signalPack = createAbortSignal(config);
            try {
                const response = await fetch(config.url, {
                    method: config.method,
                    headers: config.headers,
                    body,
                    signal: signalPack.signal,
                    credentials: config.credentials,
                    mode: config.mode,
                    cache: config.cache,
                    redirect: config.redirect,
                    referrerPolicy: config.referrerPolicy,
                    integrity: config.integrity,
                    keepalive: config.keepalive
                });

                let data = await parseResponseBody(response, config.responseType || 'auto');
                if (typeof config.transformResponse === 'function') {
                    data = await config.transformResponse(data, response, config);
                }
                const shaped = createResponseShape(response, data, config, requestId, Date.now() - startedAt);
                if (!config.validateStatus(response.status, shaped)) {
                    throw createHttpError(`Request failed with status ${response.status}.`, {
                        code: 'ERR_BAD_RESPONSE',
                        config,
                        requestId,
                        response: shaped
                    });
                }
                signalPack.cleanup();
                return instance.interceptors.response.runFulfilled(shaped);
            } catch (error) {
                signalPack.cleanup();
                const normalized = normalizeError(error, config, requestId);
                if (shouldRetry(normalized, config, attempt)) {
                    attempt += 1;
                    const retryDelay = typeof config.retryDelay === 'function'
                        ? config.retryDelay(attempt, normalized, config)
                        : Number(config.retryDelay) * attempt;
                    if (retryDelay > 0) await sleep(retryDelay);
                    continue;
                }
                return instance.interceptors.response.runRejected(normalized);
            }
        }
    }

    function normalizeError(error, config, requestId) {
        if (error?.name === 'JquanHttpError') return error;
        if (error?.name === 'AbortError') {
            return createHttpError('Request was canceled.', {
                code: 'ERR_CANCELED',
                isCanceled: true,
                config,
                requestId,
                cause: error
            });
        }
        return createHttpError(error?.message || 'Network request failed.', {
            code: error?.code || 'ERR_NETWORK',
            config,
            requestId,
            cause: error
        });
    }

    function createInstance(inputDefaults = {}) {
        const instanceId = `jq-http-instance-${runtime.instances.size + 1}`;
        const instance = {
            id: instanceId,
            defaults: deepMerge(defaults, inputDefaults),
            interceptors: {
                request: createInterceptorStore(),
                response: createInterceptorStore()
            },
            runtime: {
                auth: null
            }
        };

        const api = function request(config) {
            if (typeof config === 'string') return api.get(config);
            return dispatchRequest(instance, config || {});
        };

        api.id = instanceId;
        api.defaults = instance.defaults;
        api.interceptors = {
            request: {
                use: instance.interceptors.request.use
            },
            response: {
                use: instance.interceptors.response.use
            }
        };
        api.request = function request(config = {}) {
            return dispatchRequest(instance, config);
        };
        api.get = function get(url, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, method: 'GET' }));
        };
        api.delete = function remove(url, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, method: 'DELETE' }));
        };
        api.head = function head(url, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, method: 'HEAD' }));
        };
        api.options = function options(url, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, method: 'OPTIONS' }));
        };
        api.post = function post(url, data, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, data, method: 'POST' }));
        };
        api.put = function put(url, data, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, data, method: 'PUT' }));
        };
        api.patch = function patch(url, data, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, { url, data, method: 'PATCH' }));
        };
        api.postForm = function postForm(url, data, config = {}) {
            return dispatchRequest(instance, Object.assign({}, config, {
                url,
                data: toFormData(data),
                method: 'POST'
            }));
        };
        api.withConfig = function withConfig(patch = {}) {
            instance.defaults = deepMerge(instance.defaults, patch);
            api.defaults = instance.defaults;
            return api;
        };
        api.setAuth = function setAuth(authConfig = {}) {
            instance.runtime.auth = Object.assign({}, authConfig);
            return api;
        };
        api.clearAuth = function clearAuth() {
            instance.runtime.auth = null;
            return api;
        };
        api.create = function create(childDefaults = {}) {
            return createInstance(deepMerge(instance.defaults, childDefaults));
        };
        api.cancelSource = function cancelSource() {
            const controller = new AbortController();
            return {
                signal: controller.signal,
                cancel(reason = 'Request canceled.') {
                    controller.abort(createHttpError(reason, { code: 'ERR_CANCELED', isCanceled: true }));
                }
            };
        };
        api.isCancel = function isCancel(error) {
            return !!error?.isCanceled || error?.code === 'ERR_CANCELED';
        };
        api.all = function all(tasks = []) {
            return Promise.all(tasks);
        };
        api.spread = function spread(handler) {
            return function wrap(args) {
                return handler.apply(null, args);
            };
        };

        runtime.instances.set(instanceId, { instance, api });
        return api;
    }

    function toFormData(data) {
        if (isFormData(data)) return data;
        const form = new FormData();
        Object.entries(data || {}).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(item => form.append(key, item));
                return;
            }
            if (value != null) form.append(key, value);
        });
        return form;
    }

    const defaultInstance = createInstance({});

    const httpApi = {
        create(defaultsPatch = {}) {
            return createInstance(defaultsPatch);
        },
        request(config = {}) {
            return defaultInstance.request(config);
        },
        get(url, config = {}) {
            return defaultInstance.get(url, config);
        },
        delete(url, config = {}) {
            return defaultInstance.delete(url, config);
        },
        head(url, config = {}) {
            return defaultInstance.head(url, config);
        },
        options(url, config = {}) {
            return defaultInstance.options(url, config);
        },
        post(url, data, config = {}) {
            return defaultInstance.post(url, data, config);
        },
        put(url, data, config = {}) {
            return defaultInstance.put(url, data, config);
        },
        patch(url, data, config = {}) {
            return defaultInstance.patch(url, data, config);
        },
        postForm(url, data, config = {}) {
            return defaultInstance.postForm(url, data, config);
        },
        defaults() {
            return defaultInstance.defaults;
        },
        withConfig(patch = {}) {
            defaultInstance.withConfig(patch);
            return defaultInstance.defaults;
        },
        interceptors: defaultInstance.interceptors,
        setAuth(authConfig = {}) {
            defaultInstance.setAuth(authConfig);
            return true;
        },
        clearAuth() {
            defaultInstance.clearAuth();
            return true;
        },
        cancelSource() {
            return defaultInstance.cancelSource();
        },
        isCancel(error) {
            return defaultInstance.isCancel(error);
        },
        all(tasks = []) {
            return defaultInstance.all(tasks);
        },
        spread(handler) {
            return defaultInstance.spread(handler);
        },
        toFormData(data) {
            return toFormData(data);
        },
        createError(message, meta = {}) {
            return createHttpError(message, meta);
        }
    };

    JquanUIComponents.httpApi = httpApi;

    JquanUIComponents.http = {
        name: 'jquanui-http',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
