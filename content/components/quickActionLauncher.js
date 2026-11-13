// JquanUI component documentation: quickActionLauncher
export default {
  "id": "quickActionLauncher",
  "title": "QuickActionLauncher",
  "chinese": "快捷动作启动器",
  "category": "基础交互",
  "version": "1.0.0",
  "file": "dist/components/quickActionLauncher.js",
  "api": "JquanUIComponents.quickActionLauncherApi",
  "summary": "用于聚合后台常用操作，支持搜索与程序化触发。",
  "install": "JquanUI.use(JquanUIComponents.quickActionLauncher);",
  "declarative": "<section jq-quick-action-launcher id=\"demo-quick-action-launcher\"></section>",
  "imperative": "const launcher = JquanUIComponents.quickActionLauncherApi.mount('#demo-quick-action-launcher', { items });\nlauncher.search('publish');\nlauncher.execute('create-post');",
  "attrs": [
    [
      "`jq-quick-action-launcher`",
      "根节点"
    ],
    [
      "`items[].id / title / meta / description`",
      "动作项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载启动器"
    ],
    [
      "`search(keyword)`",
      "程序化搜索"
    ],
    [
      "`execute(actionId)`",
      "触发动作事件"
    ],
    [
      "`setItems(items) / state()`",
      "更新动作列表和读取状态"
    ]
  ],
  "notes": [
    "适合命令面板、工作台快捷入口、运营后台动作中心。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-quick-action-launcher id=\"demo-quick-action-launcher\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const launcher = JquanUIComponents.quickActionLauncherApi.mount('#demo-quick-action-launcher', { items });\nlauncher.search('publish');\nlauncher.execute('create-post');",
      "preview": false
    }
  ]
};
