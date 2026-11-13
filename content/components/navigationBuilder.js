// JquanUI component documentation: navigationBuilder
export default {
  "id": "navigationBuilder",
  "title": "NavigationBuilder",
  "chinese": "导航构建器",
  "category": "页面结构",
  "version": "1.0.0",
  "file": "dist/components/navigationBuilder.js",
  "api": "JquanUIComponents.navigationBuilderApi",
  "summary": "用于后台菜单和站点导航配置，支持菜单项编辑、排序、删除和结构化导航输出。",
  "install": "JquanUI.use(JquanUIComponents.navigationBuilder);",
  "declarative": "<section jq-navigation-builder id=\"demo-navigation-builder\"></section>",
  "imperative": "const nav = JquanUIComponents.navigationBuilderApi.mount('#demo-navigation-builder', {\n  items\n});\n\nnav.appendItem({ label: 'Reports', path: '/reports' });\nnav.items();",
  "attrs": [
    [
      "`jq-navigation-builder`",
      "根节点"
    ],
    [
      "`jq-navigation-builder-label / path / icon`",
      "菜单项编辑控件"
    ],
    [
      "`jq-navigation-builder-up / down`",
      "排序控制"
    ],
    [
      "`jq-navigation-builder-remove`",
      "删除项"
    ],
    [
      "`jq-navigation-builder-add`",
      "追加菜单项"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载导航构建器"
    ],
    [
      "`appendItem(item?) / removeItem(id)`",
      "追加或删除菜单项"
    ],
    [
      "`setItems(items)`",
      "整体替换导航项"
    ],
    [
      "`items() / state()`",
      "读取导航配置与状态"
    ]
  ],
  "notes": [
    "适合 CMS 后台侧栏、顶部菜单、门户站栏目导航和运营菜单配置页。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-navigation-builder id=\"demo-navigation-builder\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const nav = JquanUIComponents.navigationBuilderApi.mount('#demo-navigation-builder', {\n  items\n});\n\nnav.appendItem({ label: 'Reports', path: '/reports' });\nnav.items();",
      "preview": false
    }
  ]
};
