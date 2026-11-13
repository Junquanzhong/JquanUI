// JquanUI component documentation: queryToolbar
export default {
  "id": "queryToolbar",
  "title": "QueryToolbar",
  "chinese": "查询工具栏",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/queryToolbar.js",
  "api": "JquanUIComponents.queryToolbarApi",
  "summary": "后台列表页顶部查询工具栏，支持关键词搜索、筛选项、排序、apply/reset 和标准化 query 输出。",
  "install": "JquanUI.use(JquanUIComponents.queryToolbar);",
  "declarative": "<section jq-query-toolbar id=\"demo-query-toolbar\"></section>",
  "imperative": "const toolbar = JquanUIComponents.queryToolbarApi.mount('#demo-query-toolbar', {\n  keyword: 'cms',\n  filterFields,\n  sortOptions\n});\n\ntoolbar.setKeyword('pocketbase');\ntoolbar.setFilter('status', 'published');\ntoolbar.apply();",
  "attrs": [
    [
      "`jq-query-toolbar`",
      "根节点"
    ],
    [
      "`jq-query-toolbar-search`",
      "关键词搜索输入"
    ],
    [
      "`jq-query-toolbar-filter`",
      "筛选项控件"
    ],
    [
      "`jq-query-toolbar-sort`",
      "排序选择"
    ],
    [
      "`jq-query-toolbar-apply / reset`",
      "查询与重置动作"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载查询工具栏"
    ],
    [
      "`setKeyword(keyword)`",
      "设置关键词"
    ],
    [
      "`setFilter(key, value) / setFilters(filters)`",
      "设置筛选条件"
    ],
    [
      "`setSort(sort) / apply() / reset()`",
      "排序、查询和重置"
    ],
    [
      "`query() / state()`",
      "读取标准化 query 和运行时状态"
    ]
  ],
  "notes": [
    "适合 Directus / Strapi / PocketBase / PbootCMS 的内容列表、用户列表、订单列表顶栏。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-query-toolbar id=\"demo-query-toolbar\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const toolbar = JquanUIComponents.queryToolbarApi.mount('#demo-query-toolbar', {\n  keyword: 'cms',\n  filterFields,\n  sortOptions\n});\n\ntoolbar.setKeyword('pocketbase');\ntoolbar.setFilter('status', 'published');\ntoolbar.apply();",
      "preview": false
    }
  ]
};
