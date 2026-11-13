// JquanUI component documentation: recentActivityFeed
export default {
  "id": "recentActivityFeed",
  "title": "RecentActivityFeed",
  "chinese": "最近动态流",
  "category": "数据展示",
  "version": "1.0.0",
  "file": "dist/components/recentActivityFeed.js",
  "api": "JquanUIComponents.recentActivityFeedApi",
  "summary": "用于展示后台最近动态、操作记录和协作事件流。",
  "install": "JquanUI.use(JquanUIComponents.recentActivityFeed);",
  "declarative": "<section jq-recent-activity-feed id=\"demo-recent-activity-feed\"></section>",
  "imperative": "const feed = JquanUIComponents.recentActivityFeedApi.mount('#demo-recent-activity-feed', { items });\nfeed.prepend({ title: 'New deploy' });\nfeed.clear();",
  "attrs": [
    [
      "`jq-recent-activity-feed`",
      "根节点"
    ],
    [
      "`items[].title / meta / body / type`",
      "动态项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载动态流"
    ],
    [
      "`setItems(items)`",
      "替换动态列表"
    ],
    [
      "`prepend(item) / append(item)`",
      "头部或尾部插入动态"
    ],
    [
      "`clear() / state()`",
      "清空并读取状态"
    ]
  ],
  "notes": [
    "适合工作台首页、审计摘要、项目活动侧栏。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-recent-activity-feed id=\"demo-recent-activity-feed\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const feed = JquanUIComponents.recentActivityFeedApi.mount('#demo-recent-activity-feed', { items });\nfeed.prepend({ title: 'New deploy' });\nfeed.clear();",
      "preview": false
    }
  ]
};
