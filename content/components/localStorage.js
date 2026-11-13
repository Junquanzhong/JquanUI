// JquanUI component documentation: localStorage
export default {
  "id": "localStorage",
  "title": "localStorage",
  "chinese": "本地存储",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/localStorage.js",
  "api": "JquanUIComponents.localStorageApi",
  "summary": "localStorage 的轻量封装，自动序列化对象，支持 TTL、namespace、批量读写、跨标签页 storage 事件和订阅。",
  "install": "JquanUI.use(JquanUIComponents.localStorage);",
  "declarative": "const storage = JquanUIComponents.localStorageApi;\nstorage.config({ namespace: 'crm' });\nstorage.set('filters', { status: 'active' }, { ttl: 3600000 });",
  "imperative": "const storage = JquanUIComponents.localStorageApi;\nstorage.config({ namespace: 'crm' });\n\nconst stop = storage.on('filters', (next, previous, meta) => {\n  console.log(meta.source, previous, next);\n});\nstorage.set('filters', { status: 'active' }, { ttl: 3600000 });\nconst filters = storage.get('filters', {});\nconst entries = storage.entries();\nstop();",
  "attrs": [],
  "methods": [
    ["`isAvailable() / config(options)`", "检测可用性并设置 namespace；隐私模式或禁用存储时写入会返回 `false`。"],
    ["`get(key, fallback) / set(key, value, options)`", "读取或写入任意可 JSON 序列化值；`ttl` 单位为毫秒。"],
    ["`remove / clear / has`", "删除键、清理 namespace 数据或检查键是否存在。"],
    ["`keys / entries`", "读取当前 namespace 的有效键或 `[key, value]` 数组。"],
    ["`getMany(keys) / setMany(payload, options)`", "批量读取和写入。"],
    ["`on(key, callback)`", "监听当前页写入和其他标签页的 `storage` 事件；返回取消订阅函数。"],
    ["`touch(key, ttl) / purgeExpired()`", "刷新 TTL 或主动清理过期记录。"]
  ],
  "notes": [
    "数据只存在当前 origin 的 localStorage；它适合偏好、草稿和缓存，不适合存放密钥或服务端权威数据。",
    "`clear()` 默认只清理当前 namespace；传入 `{ namespaceOnly: false }` 才会清空整个 localStorage。",
    "`on()` 的跨标签页事件由浏览器发出，当前页自己的 `set()` 也会通知本页订阅者。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "quickstart",
      "title": "TTL 与命名空间",
      "language": "javascript",
      "code": "const storage = JquanUIComponents.localStorageApi;\nstorage.config({ namespace: 'crm' });\nstorage.set('filters', { status: 'active' }, { ttl: 3600000 });",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "订阅、批量读写与清理",
      "language": "javascript",
      "code": "const storage = JquanUIComponents.localStorageApi;\nstorage.config({ namespace: 'crm' });\n\nconst stop = storage.on('filters', (next, previous, meta) => {\n  console.log(meta.source, previous, next);\n});\nstorage.set('filters', { status: 'active' }, { ttl: 3600000 });\nconst filters = storage.get('filters', {});\nconst entries = storage.entries();\nstop();",
      "preview": false
    }
  ]
};
