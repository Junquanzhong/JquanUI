// JquanUI component documentation: sessionStorage
export default {
  "id": "sessionStorage",
  "title": "sessionStorage",
  "chinese": "会话存储",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/sessionStorage.js",
  "api": "JquanUIComponents.sessionStorageApi",
  "summary": "sessionStorage 的轻量封装，接口与 localStorage 一致，但数据只在当前标签页会话中保留。",
  "install": "JquanUI.use(JquanUIComponents.sessionStorage);",
  "declarative": "const storage = JquanUIComponents.sessionStorageApi;\nstorage.config({ namespace: 'crm' });\nstorage.set('active-tab', 'contacts');",
  "imperative": "const storage = JquanUIComponents.sessionStorageApi;\nstorage.config({ namespace: 'crm' });\nstorage.setMany({ page: 1, pageSize: 20 });\n\nconst page = storage.get('page', 1);\nconst stop = storage.on('page', (next, previous) => {\n  console.log(previous, next);\n});\nstorage.set('page', page + 1);\nstop();",
  "attrs": [],
  "methods": [
    ["`isAvailable() / config(options)`", "检测可用性并设置 namespace。"],
    ["`get(key, fallback) / set(key, value, options)`", "读取或写入当前会话值；支持 `ttl`，单位为毫秒。"],
    ["`remove / clear / has`", "删除键、清理 namespace 数据或检查键是否存在。"],
    ["`keys / entries / getMany / setMany`", "当前会话中的枚举和批量读写。"],
    ["`on(key, callback)`", "监听当前页写入；返回取消订阅函数。"],
    ["`touch(key, ttl) / purgeExpired()`", "刷新 TTL 或主动清理过期记录。"]
  ],
  "notes": [
    "sessionStorage 按标签页隔离，关闭标签页后数据通常会被浏览器清除，适合临时筛选、向导进度和当前页状态。",
    "接口与 localStorage 对齐，因此业务层可通过 Storage 门面按 `{ driver: 'session' }` 切换。",
    "它不是跨标签页同步机制；需要跨页共享时使用 localStorage 或 Data 的 Broadcast adapter。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "quickstart",
      "title": "保存当前页状态",
      "language": "javascript",
      "code": "const storage = JquanUIComponents.sessionStorageApi;\nstorage.config({ namespace: 'crm' });\nstorage.set('active-tab', 'contacts');",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "批量读写与订阅",
      "language": "javascript",
      "code": "const storage = JquanUIComponents.sessionStorageApi;\nstorage.config({ namespace: 'crm' });\nstorage.setMany({ page: 1, pageSize: 20 });\n\nconst page = storage.get('page', 1);\nconst stop = storage.on('page', (next, previous) => {\n  console.log(previous, next);\n});\nstorage.set('page', page + 1);\nstop();",
      "preview": false
    }
  ]
};
