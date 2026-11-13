// JquanUI component documentation: relationPicker
export default {
  "id": "relationPicker",
  "title": "RelationPicker",
  "chinese": "关联选择器",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/relationPicker.js",
  "api": "JquanUIComponents.relationPickerApi",
  "summary": "用于选择作者、标签、相关文章、关联产品等记录，支持搜索、单选/多选、已选回显和 payload 输出。",
  "install": "JquanUI.use(JquanUIComponents.relationPicker);",
  "declarative": "<section jq-relation-picker id=\"demo-relation\"></section>",
  "imperative": "const relation = JquanUIComponents.relationPickerApi.mount('#demo-relation', {\n  items,\n  multiple: true\n});\n\nrelation.select('post-1');\nrelation.values();",
  "attrs": [
    [
      "`jq-relation-picker`",
      "根节点"
    ],
    [
      "`jq-relation-picker-search`",
      "搜索输入"
    ],
    [
      "`jq-relation-picker-item`",
      "单个记录项"
    ],
    [
      "`labelKey / valueKey`",
      "指定显示字段和主键字段"
    ],
    [
      "`searchKeys`",
      "指定参与搜索的字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载关联选择器"
    ],
    [
      "`open / close`",
      "打开/关闭状态钩子"
    ],
    [
      "`setItems(items)`",
      "更新数据源"
    ],
    [
      "`select / deselect / clear`",
      "控制选中状态"
    ],
    [
      "`value() / values() / state()`",
      "读取当前选中结果"
    ]
  ],
  "notes": [
    "适合 PocketBase relation 字段、Directus 关联内容、Strapi 作者/标签选择和 PbootCMS 推荐内容关联。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-relation-picker id=\"demo-relation\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const relation = JquanUIComponents.relationPickerApi.mount('#demo-relation', {\n  items,\n  multiple: true\n});\n\nrelation.select('post-1');\nrelation.values();",
      "preview": false
    }
  ]
};
