// JquanUI component documentation: auditTimeline
export default {
  "id": "auditTimeline",
  "title": "AuditTimeline",
  "chinese": "审计时间线",
  "category": "数据展示",
  "version": "1.0.0",
  "file": "dist/components/auditTimeline.js",
  "api": "JquanUIComponents.auditTimelineApi",
  "summary": "操作审计时间线，用于记录发布、修改、删除、登录、权限变更等后台行为。",
  "install": "JquanUI.use(JquanUIComponents.auditTimeline);",
  "declarative": "<section jq-audit-timeline id=\"demo-audit-timeline\"></section>",
  "imperative": "const audit = JquanUIComponents.auditTimelineApi.mount('#demo-audit-timeline', {\n  items\n});\n\naudit.prepend(item);",
  "attrs": [
    [
      "`jq-audit-timeline`",
      "根节点"
    ],
    [
      "`items[].title / actor / time / target`",
      "审计记录字段"
    ],
    [
      "`description`",
      "行为详情"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载审计时间线"
    ],
    [
      "`setItems(items)`",
      "整体替换记录列表"
    ],
    [
      "`prepend(item)`",
      "头部插入最新记录"
    ],
    [
      "`state()`",
      "读取当前时间线数据"
    ]
  ],
  "notes": [
    "适合后台操作日志、发布记录、审批历史、工单流转和安全审计页面。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-audit-timeline id=\"demo-audit-timeline\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const audit = JquanUIComponents.auditTimelineApi.mount('#demo-audit-timeline', {\n  items\n});\n\naudit.prepend(item);",
      "preview": false
    }
  ]
};
