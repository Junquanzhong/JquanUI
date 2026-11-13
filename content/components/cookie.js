// JquanUI component documentation: cookie
export default {
  "id": "cookie",
  "title": "Cookie",
  "chinese": "Cookie",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/cookie.js",
  "api": "JquanUIComponents.cookieApi",
  "summary": "Cookie 读写封装，自动处理 JSON 值、namespace、TTL、Max-Age、Expires、Path、SameSite 和 Secure。",
  "install": "JquanUI.use(JquanUIComponents.cookie);",
  "declarative": "const cookies = JquanUIComponents.cookieApi;\ncookies.config({ namespace: 'crm' });\ncookies.set('locale', 'zh-CN', { maxAge: 86400, sameSite: 'Lax' });",
  "imperative": "const cookies = JquanUIComponents.cookieApi;\ncookies.config({\n  namespace: 'crm',\n  defaults: { path: '/', sameSite: 'Lax', secure: true }\n});\n\ncookies.set('locale', 'zh-CN', { maxAge: 86400 });\ncookies.set('preferences', { density: 'compact' }, { ttl: 3600000 });\nconst locale = cookies.get('locale');\nconst preferences = cookies.get('preferences', {});\nconst all = cookies.getAll();\ncookies.remove('locale');",
  "attrs": [],
  "methods": [
    ["`config({ namespace, defaults })`", "设置命名空间和默认 Cookie 属性；返回当前配置。"],
    ["`get(key, fallback) / set(key, value, options)`", "读写字符串、对象和数组；`ttl` 单位为毫秒，Cookie 的 `maxAge` 单位为秒。"],
    ["`remove(key, options)`", "按同一 `path`/`domain` 组合使 Cookie 过期。"],
    ["`getAll / keys / getMany`", "读取当前 namespace 的全部数据、键或指定键集合。"],
    ["`setMany(payload, options)`", "按同一组选项批量写入。"],
    ["`has / clear`", "检查键或清理当前 namespace 的 Cookie。"]
  ],
  "notes": [
    "Cookie 会随请求发送到匹配的服务端路径，适合服务端也需要读取的非敏感偏好；不能通过 JavaScript 设置 HttpOnly。",
    "删除 Cookie 时必须保持原来的 `path` 和 `domain`，否则浏览器可能保留旧值；`clear()` 使用当前默认选项。",
    "`secure: true` 只应在 HTTPS 页面使用；生产环境建议配置合适的 SameSite，并由服务端决定认证 Cookie。",
    "Cookie 的浏览器容量和每请求开销都有限，较大的草稿、缓存和列表应使用 localStorage 或 Data 持久化。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "quickstart",
      "title": "偏好 Cookie",
      "language": "javascript",
      "code": "const cookies = JquanUIComponents.cookieApi;\ncookies.config({ namespace: 'crm' });\ncookies.set('locale', 'zh-CN', { maxAge: 86400, sameSite: 'Lax' });",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "默认属性、JSON 值与清理",
      "language": "javascript",
      "code": "const cookies = JquanUIComponents.cookieApi;\ncookies.config({\n  namespace: 'crm',\n  defaults: { path: '/', sameSite: 'Lax', secure: true }\n});\n\ncookies.set('locale', 'zh-CN', { maxAge: 86400 });\ncookies.set('preferences', { density: 'compact' }, { ttl: 3600000 });\nconst locale = cookies.get('locale');\nconst preferences = cookies.get('preferences', {});\nconst all = cookies.getAll();\ncookies.remove('locale');",
      "preview": false
    }
  ]
};
