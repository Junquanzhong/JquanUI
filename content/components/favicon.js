// JquanUI component documentation: favicon
export default {
  "id": "favicon",
  "title": "Favicon",
  "chinese": "网页图标",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/favicon.js",
  "api": "JquanUIComponents.faviconApi",
  "summary": "统一管理浏览器标签页图标、未读徽标、状态图标、主题切换和原始图标恢复，不依赖外部 Favico 库。",
  "install": "JquanUI.use(JquanUIComponents.favicon);",
  "declarative": "<link rel=\"icon\" href=\"/assets/brand.svg\">\n<script src=\"./dist/components/favicon.js\"></script>",
  "imperative": "const favicon = JquanUIComponents.faviconApi;\nfavicon.set('/assets/brand.svg');\nfavicon.badge(12, { color: '#dc2626' });\nfavicon.status('success');\n\nconst stop = favicon.watch({\n  light: '/assets/brand-light.svg',\n  dark: '/assets/brand-dark.svg'\n});",
  "attrs": [
    [
      "`source`",
      "安全 href、`{ svg }` 或可导出的 `{ canvas }`"
    ],
    [
      "`badge(value)`",
      "空值清除徽标，数字超过 999 显示 `999+`"
    ],
    [
      "`status(state)`",
      "`idle` / `loading` / `success` / `error` / `warning` / `info`"
    ],
    [
      "`watch({ light, dark })`",
      "跟随 `prefers-color-scheme` 切换图标"
    ]
  ],
  "methods": [
    [
      "`set(source, options)`",
      "设置当前实例的基础图标"
    ],
    [
      "`badge(value, options)`",
      "生成未读数量徽标"
    ],
    [
      "`status(state, options)`",
      "生成状态图标和 loading 帧"
    ],
    [
      "`clear / restore`",
      "返回基础图标 / 恢复原始 link"
    ],
    [
      "`create(options)`",
      "创建独立图标控制句柄"
    ],
    [
      "`destroy()`",
      "清理监听、计时器并恢复图标"
    ]
  ],
  "notes": [
    "组件会复用已有 `link[rel~=\"icon\"]`，没有时才创建一个受管节点。",
    "徽标适合未读数、同步状态和后台任务结果，不替代 Notification、Msg 或 Data。",
    "SVG 输入会拒绝脚本、事件属性、foreignObject 和不安全资源协议。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<link rel=\"icon\" href=\"/assets/brand.svg\">\n<script src=\"./dist/components/favicon.js\"></script>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const favicon = JquanUIComponents.faviconApi;\nfavicon.set('/assets/brand.svg');\nfavicon.badge(12, { color: '#dc2626' });\nfavicon.status('success');\n\nconst stop = favicon.watch({\n  light: '/assets/brand-light.svg',\n  dark: '/assets/brand-dark.svg'\n});",
      "preview": false
    }
  ]
};
