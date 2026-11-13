// JquanUI component documentation: iframeBridge
export default {
  "id": "iframeBridge",
  "title": "iframeBridge",
  "chinese": "父子通信",
  "category": "网络与集成",
  "version": "1.0.0",
  "file": "dist/components/iframeBridge.js",
  "api": "JquanUIComponents.iframeBridgeApi",
  "summary": "为父页面与 iframe 子页面提供带来源校验、握手、请求响应、事件订阅和超时控制的通信协议。",
  "install": "JquanUI.use(JquanUIComponents.iframeBridge);",
  "declarative": "<iframe id=\"demo-child\" src=\"./child.html\" title=\"通信子页面\"></iframe>",
  "imperative": "// 父页面\nconst parentBridge = JquanUIComponents.iframeBridgeApi.createParent({\n  iframe: '#demo-child',\n  targetOrigin: window.location.origin,\n  namespace: 'demo'\n});\n\nparentBridge.on('ready', () => parentBridge.send('theme', { mode: 'dark' }));\nconst result = await parentBridge.request('health', { probe: true });\n\n// 子页面\nconst childBridge = JquanUIComponents.iframeBridgeApi.createChild({\n  targetOrigin: 'https://parent.example',\n  namespace: 'demo'\n});\nchildBridge.on('request:health', () => ({ ok: true }));\nawait childBridge.ready();",
  "attrs": [
    [
      "`iframe`",
      "父页面传入 iframe 元素或选择器；子页面不需要 iframe 节点"
    ],
    [
      "`targetOrigin`",
      "必须明确指定允许通信的 origin，不能默认使用 `*`"
    ],
    [
      "`namespace`",
      "隔离不同业务通道，父子两侧必须一致"
    ],
    [
      "`channel`",
      "默认优先使用 MessageChannel；设为 `false` 时使用 postMessage"
    ]
  ],
  "methods": [
    [
      "`createParent(options)`",
      "创建父页面端桥接"
    ],
    [
      "`createChild(options)`",
      "创建 iframe 子页面端桥接"
    ],
    [
      "`send(name, payload)`",
      "发送单向事件"
    ],
    [
      "`request(name, payload, options)`",
      "发送请求并等待响应"
    ],
    [
      "`on(name, handler)`",
      "订阅事件；请求处理器使用 `request:name`"
    ],
    [
      "`ready()`",
      "等待握手完成"
    ],
    [
      "`state()`",
      "读取连接、通道和 pending 状态"
    ],
    [
      "`destroy()`",
      "移除监听、关闭端口并拒绝未完成请求"
    ]
  ],
  "notes": [
    "跨源场景必须使用精确的 targetOrigin 或 allowedOrigins。",
    "请求处理器返回 Promise 时会自动等待；错误会以结构化 response 返回。",
    "不要把收到的 payload 直接当作 HTML、脚本或权限判断依据。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<iframe id=\"demo-child\" src=\"./child.html\" title=\"通信子页面\"></iframe>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "// 父页面\nconst parentBridge = JquanUIComponents.iframeBridgeApi.createParent({\n  iframe: '#demo-child',\n  targetOrigin: window.location.origin,\n  namespace: 'demo'\n});\n\nparentBridge.on('ready', () => parentBridge.send('theme', { mode: 'dark' }));\nconst result = await parentBridge.request('health', { probe: true });\n\n// 子页面\nconst childBridge = JquanUIComponents.iframeBridgeApi.createChild({\n  targetOrigin: 'https://parent.example',\n  namespace: 'demo'\n});\nchildBridge.on('request:health', () => ({ ok: true }));\nawait childBridge.ready();",
      "preview": false
    }
  ]
};
