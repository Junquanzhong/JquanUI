// JquanUI component documentation: kanbanBoard
export default {
  "id": "kanbanBoard",
  "title": "KanbanBoard",
  "chinese": "看板",
  "category": "数据展示",
  "version": "1.0.0",
  "file": "dist/components/kanbanBoard.js",
  "api": "JquanUIComponents.kanbanBoardApi",
  "summary": "用于任务流转、内容编排和工单协作的轻量看板组件，支持列分组和卡片跨列移动。",
  "install": "JquanUI.use(JquanUIComponents.kanbanBoard);",
  "declarative": "<section jq-kanban-board id=\"demo-kanban-board\"></section>",
  "imperative": "const board = JquanUIComponents.kanbanBoardApi.mount('#demo-kanban-board', {\n  columns\n});\n\nboard.appendCard('todo', { title: 'Write docs' });\nboard.moveCard('card-1', 'next');",
  "attrs": [
    [
      "`jq-kanban-board`",
      "根节点"
    ],
    [
      "`columns[].key / title / cards`",
      "看板列定义"
    ],
    [
      "`cards[].title / meta / description`",
      "卡片字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载看板"
    ],
    [
      "`setColumns(columns)`",
      "整体替换列"
    ],
    [
      "`appendCard(columnKey, card)`",
      "向列中追加卡片"
    ],
    [
      "`moveCard(cardId, direction)`",
      "跨列移动卡片"
    ],
    [
      "`state()`",
      "读取当前看板结构"
    ]
  ],
  "notes": [
    "适合内容排期、审批池、客服工单、产品任务看板。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-kanban-board id=\"demo-kanban-board\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const board = JquanUIComponents.kanbanBoardApi.mount('#demo-kanban-board', {\n  columns\n});\n\nboard.appendCard('todo', { title: 'Write docs' });\nboard.moveCard('card-1', 'next');",
      "preview": false
    }
  ]
};
