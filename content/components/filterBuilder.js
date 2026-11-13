// JquanUI component documentation: filterBuilder
export default {
  "id": "filterBuilder",
  "title": "FilterBuilder",
  "chinese": "筛选构建器",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/filterBuilder.js",
  "api": "JquanUIComponents.filterBuilderApi",
  "summary": "面向 CMS / Admin 列表页的条件构建器，支持字段、操作符、逻辑组、规则增删和标准化 payload 输出。",
  "install": "JquanUI.use(JquanUIComponents.filterBuilder);",
  "declarative": "<section jq-filter-builder id=\"demo-filter-builder\"></section>",
  "imperative": "const filters = JquanUIComponents.filterBuilderApi.mount('#demo-filter-builder', {\n  logic: 'AND',\n  fields,\n  rules\n});\n\nfilters.appendRule();\nfilters.setLogic('OR');\nfilters.payload();",
  "attrs": [
    [
      "`jq-filter-builder`",
      "根节点"
    ],
    [
      "`jq-filter-builder-logic`",
      "AND / OR 切换按钮"
    ],
    [
      "`jq-filter-builder-field`",
      "字段选择"
    ],
    [
      "`jq-filter-builder-operator`",
      "操作符选择"
    ],
    [
      "`jq-filter-builder-value`",
      "值输入控件"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载筛选构建器"
    ],
    [
      "`setLogic(logic)`",
      "切换顶层 AND / OR"
    ],
    [
      "`appendRule(rule?) / removeRule(id)`",
      "追加或删除规则"
    ],
    [
      "`setRules(rules) / clear()`",
      "整体替换或清空规则"
    ],
    [
      "`rules() / payload() / state()`",
      "读取规则、标准化 payload 和运行时状态"
    ]
  ],
  "notes": [
    "适合 PocketBase collection 列表筛选、Directus 数据集过滤、Strapi 内容列表和 PbootCMS 条件检索。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-filter-builder id=\"demo-filter-builder\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const filters = JquanUIComponents.filterBuilderApi.mount('#demo-filter-builder', {\n  logic: 'AND',\n  fields,\n  rules\n});\n\nfilters.appendRule();\nfilters.setLogic('OR');\nfilters.payload();",
      "preview": false
    }
  ]
};
