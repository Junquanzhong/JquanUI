// JquanUI component documentation: schemaForm
export default {
  "id": "schemaForm",
  "title": "SchemaForm",
  "chinese": "Schema 表单",
  "category": "表单输入",
  "version": "1.0.0",
  "file": "dist/components/schemaForm.js",
  "api": "JquanUIComponents.schemaFormApi",
  "summary": "通过 schema 渲染后台表单，支持 setValue / setValues / validate / reset / patchSchema，适合动态内容录入和模型配置。",
  "install": "JquanUI.use(JquanUIComponents.formValidator);\nJquanUI.use(JquanUIComponents.schemaForm);",
  "declarative": "<section jq-schema-form>\n  <script type=\"application/json\" jq-schema-form-data>\n    [{\"name\":\"title\",\"label\":\"标题\",\"type\":\"text\",\"required\":true}]\n  </script>\n</section>",
  "imperative": "const form = JquanUIComponents.schemaFormApi.mount('#demo-schema-form', {\n  schema,\n  values: { title: 'Hello JquanUI' }\n});\n\nform.setValue('title', 'Updated');\nawait form.validate();",
  "attrs": [
    [
      "`jq-schema-form`",
      "根节点"
    ],
    [
      "`jq-schema-form-data`",
      "声明式 schema JSON"
    ],
    [
      "`type`",
      "`text` / `textarea` / `select` / `switch` / `checkbox` / `radio-group` / `checkbox-group` / `number` / `date` / `email`"
    ],
    [
      "`required / min / max / minLength / maxLength`",
      "校验规则"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载 SchemaForm"
    ],
    [
      "`setValue / setValues / getValue / values`",
      "值读写"
    ],
    [
      "`validate()`",
      "执行校验"
    ],
    [
      "`reset(values?)`",
      "重置表单"
    ],
    [
      "`patchSchema(schema)`",
      "替换 schema 重新渲染"
    ]
  ],
  "notes": [
    "适合 PocketBase collection 配置、Directus 内容模型、Strapi 内容录入、PbootCMS 配置页。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-schema-form>\n  <script type=\"application/json\" jq-schema-form-data>\n    [{\"name\":\"title\",\"label\":\"标题\",\"type\":\"text\",\"required\":true}]\n  </script>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const form = JquanUIComponents.schemaFormApi.mount('#demo-schema-form', {\n  schema,\n  values: { title: 'Hello JquanUI' }\n});\n\nform.setValue('title', 'Updated');\nawait form.validate();",
      "preview": false
    }
  ]
};
