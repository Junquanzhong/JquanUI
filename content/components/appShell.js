// JquanUI component documentation: appShell
export default {
  "id": "appShell",
  "title": "AppShell",
  "chinese": "应用壳层",
  "category": "页面结构",
  "version": "1.3.0",
  "file": "dist/components/appShell.js",
  "api": "JquanUIComponents.appShellApi",
  "summary": "组合侧栏、顶部栏、面包屑、Tab 和 Router 的应用骨架，适合快速拼出后台壳层。",
  "install": "JquanUI.use(JquanUIComponents.router);\nJquanUI.use(JquanUIComponents.permission);\nJquanUI.use(JquanUIComponents.appShell);",
  "declarative": "<div id=\"demo-shell\"></div>",
  "imperative": "const shell = JquanUIComponents.appShellApi.mount('#demo-shell', {\n  title: 'JquanUI Admin',\n  brand: 'JquanUI',\n  menu: [\n    { label: '仪表盘', path: '/' },\n    { label: '组件', path: '/components' }\n  ],\n  router: {\n    routes: [...]\n  }\n});",
  "attrs": [],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载壳层"
    ],
    [
      "`get(id)`",
      "读取实例句柄"
    ],
    [
      "`open(path) / closeTab(path)`",
      "切换路由并管理标签页"
    ]
  ],
  "notes": [
    "非常适合给组件后台、设计系统后台做演示壳，预览里应该把菜单切换、标签变化和当前路由一起展示出来。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div id=\"demo-shell\"></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const shell = JquanUIComponents.appShellApi.mount('#demo-shell', {\n  title: 'JquanUI Admin',\n  brand: 'JquanUI',\n  menu: [\n    { label: '仪表盘', path: '/' },\n    { label: '组件', path: '/components' }\n  ],\n  router: {\n    routes: [...]\n  }\n});",
      "preview": false
    }
  ]
};
