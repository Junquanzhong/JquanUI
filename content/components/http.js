// JquanUI component documentation: http
export default {
  "id": "http",
  "title": "HTTP",
  "chinese": "请求客户端",
  "category": "网络与集成",
  "version": "1.0.0",
  "file": "dist/components/http.js",
  "api": "JquanUIComponents.httpApi",
  "summary": "基于 fetch 的统一请求客户端，覆盖实例默认配置、参数序列化、JSON/表单请求、响应解析、拦截器、认证、超时、重试和取消。",
  "install": "JquanUI.use(JquanUIComponents.http);",
  "declarative": "const api = JquanUIComponents.httpApi.create({ baseURL: '/api' });\nconst response = await api.get('/health');\nconsole.log(response.data);",
  "imperative": "const api = JquanUIComponents.httpApi.create({\n  baseURL: '/api',\n  timeout: 10000,\n  retries: 2,\n  retryDelay: attempt => attempt * 500\n});\n\nconst removeRequestInterceptor = api.interceptors.request.use(config => {\n  config.headers.set('X-Client', 'jquan-docs');\n  return config;\n});\n\ntry {\n  const response = await api.post('/contacts', { name: 'Ada' }, {\n    params: { source: 'docs' },\n    responseType: 'json'\n  });\n  console.log(response.status, response.data);\n} catch (error) {\n  if (JquanUIComponents.httpApi.isCancel(error)) return;\n  console.error(error.code, error.response?.status);\n} finally {\n  removeRequestInterceptor();\n}",
  "attrs": [],
  "methods": [
    ["`create(defaultsPatch)`", "创建相互独立的请求实例；实例可继续调用 `create()`。"],
    ["`request(config)`", "使用配置对象发起请求；`url`、`method`、`params`、`data`、`headers` 和 `signal` 均在配置中传入。"],
    ["`get / delete / head / options`", "无请求体方法；返回标准化响应对象。"],
    ["`post / put / patch`", "JSON、文本、Blob、FormData 或 URLSearchParams 请求。普通对象默认按 JSON 序列化。"],
    ["`postForm(url, data, config)`", "把对象转换为 FormData；数组值会重复 append 同名字段。"],
    ["`withConfig(patch) / defaults()`", "更新或读取默认配置；实例级配置不会污染其他实例。"],
    ["`interceptors.request/response.use()`", "注册请求或响应拦截器；返回移除函数，页面销毁时应调用。"],
    ["`setAuth / clearAuth`", "配置 token 或 `getToken()`，默认写入 Authorization Bearer 头。"],
    ["`cancelSource() / isCancel(error)`", "创建 AbortController 兼容的取消源并识别取消错误。"],
    ["`all / spread / toFormData / createError`", "并发请求、结果展开、表单转换和标准化错误辅助方法。"]
  ],
  "notes": [
    "响应统一为 `{ requestId, data, status, headers, config, url, ok, duration, raw }`；非 2xx 默认抛出带 `code`、`config` 和 `response` 的 `JquanHttpError`。",
    "`timeout`、`retries`、`retryOn` 和 `retryDelay` 只对可重试错误生效；取消和超时不会继续重试。",
    "`postForm` 适合文件或表单接口；不要手动设置 multipart boundary，让浏览器为 FormData 生成。",
    "crud、upload 和 Data 的 HTTP 同步适配应复用本组件，不要在业务组件中重新封装 fetch。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "quickstart",
      "title": "快速开始",
      "language": "javascript",
      "code": "const api = JquanUIComponents.httpApi.create({ baseURL: '/api' });\nconst response = await api.get('/health');\nconsole.log(response.data);",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "实例、拦截器与错误处理",
      "language": "javascript",
      "code": "const api = JquanUIComponents.httpApi.create({\n  baseURL: '/api',\n  timeout: 10000,\n  retries: 2,\n  retryDelay: attempt => attempt * 500\n});\n\nconst removeRequestInterceptor = api.interceptors.request.use(config => {\n  config.headers.set('X-Client', 'jquan-docs');\n  return config;\n});\n\ntry {\n  const response = await api.post('/contacts', { name: 'Ada' }, {\n    params: { source: 'docs' },\n    responseType: 'json'\n  });\n  console.log(response.status, response.data);\n} catch (error) {\n  if (JquanUIComponents.httpApi.isCancel(error)) return;\n  console.error(error.code, error.response?.status);\n} finally {\n  removeRequestInterceptor();\n}",
      "preview": false
    }
  ]
};
