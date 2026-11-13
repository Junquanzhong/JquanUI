// JquanUI component documentation: batchActions
export default {
  "id": "batchActions",
  "title": "BatchActions",
  "chinese": "批量操作栏",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/batchActions.js",
  "api": "JquanUIComponents.batchActionsApi",
  "summary": "面向表格和列表的批量操作栏，支持选中数量联动、危险动作、禁用态和执行事件 payload。",
  "install": "JquanUI.use(JquanUIComponents.batchActions);",
  "declarative": "<section jq-batch-actions id=\"demo-batch-actions\"></section>",
  "imperative": "const batch = JquanUIComponents.batchActionsApi.mount('#demo-batch-actions', {\n  selected: ['post-1', 'post-2'],\n  actions\n});\n\nbatch.setSelected(['post-3']);\nbatch.trigger('publish');",
  "attrs": [
    [
      "`jq-batch-actions`",
      "根节点"
    ],
    [
      "`jq-batch-actions-trigger`",
      "单个操作按钮"
    ],
    [
      "`selected`",
      "当前选中项 id 列表"
    ],
    [
      "`actions[].minSelected`",
      "最少选中数量要求"
    ],
    [
      "`actions[].tone`",
      "默认或危险动作样式"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载批量操作栏"
    ],
    [
      "`setSelected(ids)`",
      "同步表格/列表当前选中项"
    ],
    [
      "`setActions(actions)`",
      "替换动作列表"
    ],
    [
      "`trigger(key)`",
      "命令式触发某个操作"
    ],
    [
      "`selected() / clear() / state()`",
      "读取选中项、清空、读取状态"
    ]
  ],
  "notes": [
    "适合 CMS 内容列表、订单列表、素材列表、用户列表的批量发布、删除、移动分类、导出。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-batch-actions id=\"demo-batch-actions\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const batch = JquanUIComponents.batchActionsApi.mount('#demo-batch-actions', {\n  selected: ['post-1', 'post-2'],\n  actions\n});\n\nbatch.setSelected(['post-3']);\nbatch.trigger('publish');",
      "preview": false
    }
  ]
};
