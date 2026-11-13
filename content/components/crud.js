// JquanUI component documentation: crud
export default {
  "id": "crud",
  "title": "Crud",
  "chinese": "增删改查工作台",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/crud.js",
  "api": "JquanUIComponents.crudApi",
  "summary": "组合式高级组件，整合 table、modal、formValidator、http，适合把增删改查工作台一次搭起来。",
  "install": "JquanUI.use(JquanUIComponents.modal);\nJquanUI.use(JquanUIComponents.formValidator);\nJquanUI.use(JquanUIComponents.table);\nJquanUI.use(JquanUIComponents.crud);",
  "declarative": "<div id=\"demo-crud\"></div>",
  "imperative": "const crud = await JquanUIComponents.crudApi.mount('#demo-crud', {\n  columns: [...],\n  request: {\n    list: async () => rows,\n    create: async payload => payload,\n    update: async payload => payload,\n    remove: async row => row\n  }\n});\n\ncrud.create();\ncrud.reload();",
  "attrs": [],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载 CRUD 工作台"
    ],
    [
      "`reload(target)`",
      "刷新数据"
    ],
    [
      "`create / edit / remove`",
      "打开内置流程"
    ],
    [
      "`destroy(target)`",
      "销毁"
    ]
  ],
  "notes": [
    "这是组合组件，最值得把创建、编辑、删除、刷新这些高频流程全部讲清楚。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div id=\"demo-crud\"></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const crud = await JquanUIComponents.crudApi.mount('#demo-crud', {\n  columns: [...],\n  request: {\n    list: async () => rows,\n    create: async payload => payload,\n    update: async payload => payload,\n    remove: async row => row\n  }\n});\n\ncrud.create();\ncrud.reload();",
      "preview": false
    }
  ]
};
