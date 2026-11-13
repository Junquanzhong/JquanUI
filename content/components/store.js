// JquanUI component documentation: store
export default {
  "id": "store",
  "title": "Store",
  "chinese": "状态仓库",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/store.js",
  "api": "JquanUIComponents.storeApi",
  "summary": "响应式状态管理，支持 patch、watch、action、transaction 和持久化。",
  "install": "JquanUI.use(JquanUIComponents.storage);\nJquanUI.use(JquanUIComponents.store);",
  "declarative": "const store = JquanUIComponents.storeApi.create({\n  state: { count: 0, profile: { name: 'Jquan' } }\n});\n\nconst stop = store.watch(\n  state => state.count,\n  value => console.log('count:', value)\n);\nstore.update('count', count => count + 1);",
  "imperative": "const store = JquanUIComponents.storeApi.create({\n  id: 'crm-filters',\n  state: { status: 'all', page: 1 },\n  persist: { key: 'crm-filters', driver: 'local' }\n});\n\nconst unsubscribe = store.subscribe(({ state, meta }) => {\n  console.log(state, meta.type);\n});\nstore.patch({ status: 'active' });\nstore.transaction(draft => { draft.page += 1; });\nstore.action('filters/changed', { status: 'active' });\n\n// 页面卸载时：\nunsubscribe();\nstore.destroy();",
  "attrs": [],
  "methods": [
    [
      "`create(options)`",
      "创建 store"
    ],
    [
      "`getState() / get(path, fallback?)`",
      "读取完整快照或路径值；返回值会被复制"
    ],
    [
      "`set(nextState) / patch(patchState) / update(path, valueOrUpdater)`",
      "替换、深合并或按路径更新状态"
    ],
    [
      "`subscribe(listener, immediate?) / watch(selector, listener, immediate?)`",
      "订阅完整状态或选择器变化，返回取消函数"
    ],
    [
      "`action(type, payload?, meta?) / onAction(listener)`",
      "记录动作并监听动作事件"
    ],
    [
      "`transaction(mutator, meta?) / reset(meta?) / destroy()`",
      "批量变更、恢复初始状态和释放 store"
    ]
  ],
  "notes": [
    "Store 是不可变快照式状态层：读操作返回副本，写操作返回 store 句柄并通知订阅者。persist 只是 create() 的配置，不是实例方法；它依赖已安装的 Storage、localStorage 或 sessionStorage 组件。持久化数据来自客户端，不能当作权限或安全边界。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "create-watch",
      "title": "创建与监听",
      "language": "javascript",
      "code": "const store = JquanUIComponents.storeApi.create({\n  state: { count: 0, profile: { name: 'Jquan' } }\n});\n\nconst stop = store.watch(\n  state => state.count,\n  value => console.log('count:', value)\n);\nstore.update('count', count => count + 1);",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const store = JquanUIComponents.storeApi.create({\n  id: 'crm-filters',\n  state: { status: 'all', page: 1 },\n  persist: { key: 'crm-filters', driver: 'local' }\n});\n\nconst unsubscribe = store.subscribe(({ state, meta }) => {\n  console.log(state, meta.type);\n});\nstore.patch({ status: 'active' });\nstore.transaction(draft => { draft.page += 1; });\nstore.action('filters/changed', { status: 'active' });\n\n// 页面卸载时：\nunsubscribe();\nstore.destroy();",
      "preview": false
    }
  ]
};
