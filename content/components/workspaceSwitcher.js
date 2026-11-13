// JquanUI component documentation: workspaceSwitcher
export default {
  "id": "workspaceSwitcher",
  "title": "WorkspaceSwitcher",
  "chinese": "工作区切换器",
  "category": "页面结构",
  "version": "1.0.0",
  "file": "dist/components/workspaceSwitcher.js",
  "api": "JquanUIComponents.workspaceSwitcherApi",
  "summary": "用于组织、项目、站点或工作区的快速切换。",
  "install": "JquanUI.use(JquanUIComponents.workspaceSwitcher);",
  "declarative": "<section jq-workspace-switcher id=\"demo-workspace-switcher\"></section>",
  "imperative": "const switcher = JquanUIComponents.workspaceSwitcherApi.mount('#demo-workspace-switcher', { items });\nswitcher.activate('workspace-2');\nswitcher.state();",
  "attrs": [
    [
      "`jq-workspace-switcher`",
      "根节点"
    ],
    [
      "`items[].title / meta`",
      "工作区字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载工作区切换器"
    ],
    [
      "`activate(itemId)`",
      "切换当前工作区"
    ],
    [
      "`setItems(items)`",
      "替换工作区列表"
    ],
    [
      "`state()`",
      "读取当前状态"
    ]
  ],
  "notes": [
    "适合多站点 CMS、多团队后台、多项目工作台。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-workspace-switcher id=\"demo-workspace-switcher\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const switcher = JquanUIComponents.workspaceSwitcherApi.mount('#demo-workspace-switcher', { items });\nswitcher.activate('workspace-2');\nswitcher.state();",
      "preview": false
    }
  ]
};
