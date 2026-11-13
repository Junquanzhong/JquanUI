// JquanUI component documentation: permissionMatrix
export default {
  "id": "permissionMatrix",
  "title": "PermissionMatrix",
  "chinese": "权限矩阵",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/permissionMatrix.js",
  "api": "JquanUIComponents.permissionMatrixApi",
  "summary": "角色权限矩阵，支持模块 x 动作授权、整行整列勾选、全选/清空和结构化权限 payload 输出。",
  "install": "JquanUI.use(JquanUIComponents.permissionMatrix);",
  "declarative": "<section jq-permission-matrix id=\"demo-permission-matrix\"></section>",
  "imperative": "const matrix = JquanUIComponents.permissionMatrixApi.mount('#demo-permission-matrix', {\n  rows,\n  columns,\n  values\n});\n\nmatrix.checkAll();\nmatrix.payload();",
  "attrs": [
    [
      "`jq-permission-matrix`",
      "根节点"
    ],
    [
      "`jq-permission-matrix-cell`",
      "单元格权限勾选"
    ],
    [
      "`jq-permission-matrix-row / column`",
      "整行/整列控制"
    ],
    [
      "`jq-permission-matrix-all`",
      "全选/清空控制"
    ],
    [
      "`values[rowKey][columnKey]`",
      "权限布尔值矩阵"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载权限矩阵"
    ],
    [
      "`setValues(values)`",
      "整体替换权限值"
    ],
    [
      "`checkAll() / clearAll()`",
      "全选或清空"
    ],
    [
      "`payload()`",
      "读取结构化权限矩阵"
    ],
    [
      "`state()`",
      "读取当前完整状态"
    ]
  ],
  "notes": [
    "适合 Strapi 角色权限、Directus role policy、PocketBase 管理端菜单授权和 CMS 后台动作控制。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-permission-matrix id=\"demo-permission-matrix\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const matrix = JquanUIComponents.permissionMatrixApi.mount('#demo-permission-matrix', {\n  rows,\n  columns,\n  values\n});\n\nmatrix.checkAll();\nmatrix.payload();",
      "preview": false
    }
  ]
};
