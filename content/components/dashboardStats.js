// JquanUI component documentation: dashboardStats
export default {
  "id": "dashboardStats",
  "title": "DashboardStats",
  "chinese": "仪表盘统计卡",
  "category": "数据展示",
  "version": "1.0.0",
  "file": "dist/components/dashboardStats.js",
  "api": "JquanUIComponents.dashboardStatsApi",
  "summary": "仪表盘指标卡组件，适合展示内容数、访问量、转化率、收入等关键指标。",
  "install": "JquanUI.use(JquanUIComponents.dashboardStats);",
  "declarative": "<section jq-dashboard-stats id=\"demo-dashboard-stats\"></section>",
  "imperative": "const stats = JquanUIComponents.dashboardStatsApi.mount('#demo-dashboard-stats', {\n  items\n});\n\nstats.setItems(nextItems);",
  "attrs": [
    [
      "`jq-dashboard-stats`",
      "根节点"
    ],
    [
      "`items[].label / value / delta / trend`",
      "统计卡字段"
    ],
    [
      "`trend`",
      "`up` / `down` 趋势"
    ],
    [
      "`description`",
      "补充说明文案"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载统计卡组件"
    ],
    [
      "`setItems(items)`",
      "更新统计项"
    ],
    [
      "`state()`",
      "读取当前卡片数据"
    ]
  ],
  "notes": [
    "适合 Directus/Strapi/PocketBase 的 dashboard 首页，也适合 CRM、运营台和 CMS 概览页。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-dashboard-stats id=\"demo-dashboard-stats\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const stats = JquanUIComponents.dashboardStatsApi.mount('#demo-dashboard-stats', {\n  items\n});\n\nstats.setItems(nextItems);",
      "preview": false
    }
  ]
};
