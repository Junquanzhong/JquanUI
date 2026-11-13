// JquanUI component documentation: collectionFieldDesigner
export default {
  "id": "collectionFieldDesigner",
  "title": "CollectionFieldDesigner",
  "chinese": "字段建模器",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/collectionFieldDesigner.js",
  "api": "JquanUIComponents.collectionFieldDesignerApi",
  "summary": "集合字段建模器，用于配置内容模型字段，支持字段名、类型、必填、默认值、排序和 schema 输出。",
  "install": "JquanUI.use(JquanUIComponents.collectionFieldDesigner);",
  "declarative": "<section jq-collection-field-designer id=\"demo-field-designer\"></section>",
  "imperative": "const designer = JquanUIComponents.collectionFieldDesignerApi.mount('#demo-field-designer', {\n  fields\n});\n\ndesigner.appendField({ name: 'author', type: 'relation' });\ndesigner.schema();",
  "attrs": [
    [
      "`jq-collection-field-designer`",
      "根节点"
    ],
    [
      "`jq-collection-field-name / type / required / default`",
      "字段配置控件"
    ],
    [
      "`jq-collection-field-up / down`",
      "字段排序"
    ],
    [
      "`jq-collection-field-remove`",
      "删除字段"
    ],
    [
      "`jq-collection-field-designer-add`",
      "追加字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载字段建模器"
    ],
    [
      "`appendField(field?)`",
      "追加字段"
    ],
    [
      "`removeField(id)`",
      "删除字段"
    ],
    [
      "`setFields(fields)`",
      "整体替换字段列表"
    ],
    [
      "`schema() / state()`",
      "读取标准化 schema 和当前状态"
    ]
  ],
  "notes": [
    "适合 PocketBase collection 字段、Directus schema、Strapi content type 和 PbootCMS 自定义模型配置。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-collection-field-designer id=\"demo-field-designer\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const designer = JquanUIComponents.collectionFieldDesignerApi.mount('#demo-field-designer', {\n  fields\n});\n\ndesigner.appendField({ name: 'author', type: 'relation' });\ndesigner.schema();",
      "preview": false
    }
  ]
};
