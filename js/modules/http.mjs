/**
 * JquanUI HTTP Module
 * 现代 Fetch API 的轻量级封装，支持拦截器和超时
 * @author Gemini-3-Pro
 * @version 1.0.0
 * @license MIT
 */

class HttpClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.interceptors = {
            request: [],
            response: []
        };
    }

    /**
     * 添加请求拦截器
     * @param {Function} onFulfilled (config) => config
     * @param {Function} onRejected (error) => Promise.reject(error)
     */
    useRequestInterceptor(onFulfilled, onRejected) {
        this.interceptors.request.push({ onFulfilled, onRejected });
    }

    /**
     * 添加响应拦截器
     * @param {Function} onFulfilled (response) => response
     * @param {Function} onRejected (error) => Promise.reject(error)
     */
    useResponseInterceptor(onFulfilled, onRejected) {
        this.interceptors.response.push({ onFulfilled, onRejected });
    }

    /**
     * 核心请求方法
     */
    async request(endpoint, options = {}) {
        let config = {
            url: this.baseURL + endpoint,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            method: 'GET',
            timeout: 10000, // 默认 10秒超时
            ...options
        };

        // 1. 执行请求拦截器
        for (const interceptor of this.interceptors.request) {
            if (interceptor.onFulfilled) {
                config = await interceptor.onFulfilled(config);
            }
        }

        // 处理超时逻辑
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), config.timeout);
        config.signal = controller.signal;

        try {
            // 2. 发起原生请求
            let response = await fetch(config.url, config);
            clearTimeout(id);

            // 3. 自动解析 JSON (如果适用)
            if (response.headers.get('content-type')?.includes('application/json')) {
                // 将 data 挂载到 response 对象上，保留原始 status 等信息
                response.data = await response.json();
            }

            // 检查 HTTP 状态码
            if (!response.ok) {
                throw { response, message: `HTTP Error ${response.status}` };
            }

            // 4. 执行响应拦截器 (成功)
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onFulfilled) {
                    response = await interceptor.onFulfilled(response);
                }
            }

            return response.data || response;

        } catch (error) {
            clearTimeout(id);
            // 4. 执行响应拦截器 (失败)
            let finalError = error;
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onRejected) {
                    try {
                        finalError = await interceptor.onRejected(finalError);
                    } catch (e) {
                        finalError = e;
                    }
                }
            }
            throw finalError;
        }
    }

    get(url, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${url}?${queryString}` : url;
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(url, data = {}, options = {}) {
        return this.request(url, { ...options, method: 'POST', body: JSON.stringify(data) });
    }

    put(url, data = {}, options = {}) {
        return this.request(url, { ...options, method: 'PUT', body: JSON.stringify(data) });
    }

    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}

// 导出单例，但也允许用户创建新实例
export const http = new HttpClient();
export { HttpClient };
