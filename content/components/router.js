// JquanUI component documentation: router
export default {
  "id": "router",
  "title": "Router",
  "chinese": "路由",
  "category": "网络与集成",
  "version": "1.1.0",
  "file": "dist/components/router.js",
  "api": "JquanUIComponents.routerApi",
  "summary": "轻量前端路由，支持 hash/history、守卫、缓存视图和程序化跳转，适合小型后台和文档应用。",
  "install": "JquanUI.use(JquanUIComponents.router);",
  "declarative": "const router = JquanUIComponents.routerApi.create({\n  root: '#router-view',\n  mode: 'hash',\n  routes: [\n    { path: '/', title: '首页', component: '<div>Home</div>' },\n    { path: '/about', title: '关于', component: '<div>About</div>' }\n  ]\n});",
  "imperative": "router.push('/about?from=docs').then(() => {\n  console.log(router.current());\n  console.log(router.resolve('/about?from=docs').query);\n});\n\n// 页面卸载时释放监听器与缓存视图：\nrouter.destroy();",
  "attrs": [],
  "methods": [
    [
      "`routerApi.create(options) / routerApi.get(id)`",
      "创建或读取路由实例"
    ],
    [
      "`push(location) / replace(location)`",
      "跳转并返回 Promise；location 可带 query"
    ],
    [
      "`current() / routes() / resolve(location)`",
      "读取当前记录、扁平路由列表和目标解析结果"
    ],
    [
      "`clearCache(path?) / destroy()`",
      "清理 keepAlive 缓存，或销毁实例"
    ]
  ],
  "notes": [
    "支持 hash/history、动态 component(target, router)、beforeEach/afterEach、loading、redirect、meta.permission/meta.role、keepAlive 与 cacheLimit。history 模式需要服务器把未知路径回退到入口 HTML；路由组件返回 HTML 字符串、Node，或 { content, destroy }。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "create-router",
      "title": "创建路由实例",
      "language": "javascript",
      "code": "const router = JquanUIComponents.routerApi.create({\n  root: '#router-view',\n  mode: 'hash',\n  routes: [\n    { path: '/', title: '首页', component: '<div>Home</div>' },\n    { path: '/about', title: '关于', component: '<div>About</div>' }\n  ]\n});",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "router.push('/about?from=docs').then(() => {\n  console.log(router.current());\n  console.log(router.resolve('/about?from=docs').query);\n});\n\n// 页面卸载时释放监听器与缓存视图：\nrouter.destroy();",
      "preview": false
    }
  ]
};
