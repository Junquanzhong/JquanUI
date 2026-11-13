// JquanUI component documentation: recordMetaPanel
export default {
  "id": "recordMetaPanel",
  "title": "RecordMetaPanel",
  "chinese": "记录信息面板",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/recordMetaPanel.js",
  "api": "JquanUIComponents.recordMetaPanelApi",
  "summary": "内容详情页右侧信息面板，适合展示状态、作者、发布时间、SEO、统计信息和快捷动作。",
  "install": "JquanUI.use(JquanUIComponents.recordMetaPanel);",
  "declarative": "<aside jq-record-meta-panel id=\"demo-record-meta\"></aside>",
  "imperative": "const panel = JquanUIComponents.recordMetaPanelApi.mount('#demo-record-meta', {\n  title: 'Article Meta',\n  status,\n  meta,\n  stats,\n  seo\n});\n\npanel.setStatus({ label: 'Published', tone: 'success' });\npanel.setStats(stats);",
  "attrs": [
    [
      "`jq-record-meta-panel`",
      "根节点"
    ],
    [
      "`jq-record-meta-panel-action`",
      "快速操作按钮"
    ],
    [
      "`status.label / status.tone`",
      "状态文本与视觉等级"
    ],
    [
      "`meta / seo`",
      "键值信息区"
    ],
    [
      "`stats`",
      "统计卡片区"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载信息面板"
    ],
    [
      "`setTitle(title) / setStatus(status)`",
      "更新标题和状态"
    ],
    [
      "`setMeta(meta) / setSeo(seo)`",
      "更新基础信息与 SEO 信息"
    ],
    [
      "`setStats(stats) / setActions(actions)`",
      "更新统计和动作区"
    ],
    [
      "`state()`",
      "读取当前面板状态"
    ]
  ],
  "notes": [
    "适合 Strapi / Directus / PocketBase 后台详情页右侧边栏，也适合 PbootCMS 文章编辑页的发布信息卡。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<aside jq-record-meta-panel id=\"demo-record-meta\"></aside>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const panel = JquanUIComponents.recordMetaPanelApi.mount('#demo-record-meta', {\n  title: 'Article Meta',\n  status,\n  meta,\n  stats,\n  seo\n});\n\npanel.setStatus({ label: 'Published', tone: 'success' });\npanel.setStats(stats);",
      "preview": false
    }
  ]
};
