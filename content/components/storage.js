// JquanUI component documentation: storage
export default {
  "id": "storage",
  "title": "Storage",
  "chinese": "统一存储门面",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/storage.js",
  "api": "JquanUIComponents.storageApi",
  "summary": "把 localStorage、sessionStorage 和 cookie 统一为一套可替换的读写接口，业务代码只选择 driver，不重复处理序列化和命名空间。",
  "install": "JquanUI.use(JquanUIComponents.localStorage);\nJquanUI.use(JquanUIComponents.sessionStorage);\nJquanUI.use(JquanUIComponents.cookie);\nJquanUI.use(JquanUIComponents.storage);",
  "declarative": "const storage = JquanUIComponents.storageApi;\nstorage.config({ namespace: 'crm', defaultDriver: 'local' });\nstorage.set('view', 'contacts');",
  "imperative": "const storage = JquanUIComponents.storageApi;\nstorage.config({ namespace: 'crm', defaultDriver: 'local' });\n\nstorage.set('filters', { status: 'active' }, { ttl: 86400000 });\nconst filters = storage.get('filters', {});\nconst stop = storage.on('filters', (next, previous, meta) => {\n  console.log(meta.source, previous, next);\n});\n\nstorage.set('view', 'contacts', { driver: 'session' });\nstorage.remove('view', { driver: 'session' });\nstop();",
  "attrs": [],
  "methods": [
    ["`config({ namespace, defaultDriver })`", "设置统一命名空间和默认 driver；会同步已安装驱动的 namespace。"],
    ["`driver(name) / local() / session() / cookie()`", "读取具体驱动；可直接访问该驱动的完整 API。"],
    ["`isAvailable(driver)`", "检查目标浏览器存储是否可用。"],
    ["`get / set / remove / has / touch`", "统一读写、删除、存在性检查和 TTL 刷新。"],
    ["`keys / entries / getMany / setMany`", "批量读取、批量写入和命名空间内枚举。"],
    ["`clear / purgeExpired`", "清理当前 driver 的命名空间数据和过期项。"],
    ["`on(key, callback)`", "订阅支持事件的 driver；返回取消订阅函数。"],
    ["`options.driver`", "单次调用覆盖默认 driver，例如 `{ driver: 'session' }`。"]
  ],
  "notes": [
    "Storage 是门面，不是新的存储介质；使用前必须先加载并安装 localStorage、sessionStorage、cookie 三个 driver。",
    "对象和数组会自动 JSON 序列化；`ttl` 单位为毫秒，`0` 或未设置表示不过期。",
    "默认 `clear()` 只清除当前 namespace；明确传入 `namespaceOnly: false` 才清空整个浏览器存储。",
    "敏感令牌不要仅因方便写入 localStorage 或 cookie；认证和授权仍由服务端控制。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "quickstart",
      "title": "统一入口",
      "language": "javascript",
      "code": "const storage = JquanUIComponents.storageApi;\nstorage.config({ namespace: 'crm', defaultDriver: 'local' });\nstorage.set('view', 'contacts');",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "TTL、订阅与驱动切换",
      "language": "javascript",
      "code": "const storage = JquanUIComponents.storageApi;\nstorage.config({ namespace: 'crm', defaultDriver: 'local' });\n\nstorage.set('filters', { status: 'active' }, { ttl: 86400000 });\nconst filters = storage.get('filters', {});\nconst stop = storage.on('filters', (next, previous, meta) => {\n  console.log(meta.source, previous, next);\n});\n\nstorage.set('view', 'contacts', { driver: 'session' });\nstorage.remove('view', { driver: 'session' });\nstop();",
      "preview": false
    }
  ]
};
