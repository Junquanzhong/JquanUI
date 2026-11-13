// JquanUI component documentation: map
export default {
  "id": "map",
  "title": "Map",
  "chinese": "地图",
  "category": "内容与媒体",
  "version": "2.0.0",
  "file": "dist/components/map.js",
  "api": "JquanUIComponents.mapApi",
  "summary": "地图组件抽象层，支持 provider 注册、声明式挂载和事件绑定。",
  "install": "JquanUI.use(JquanUIComponents.map);",
  "declarative": "<div jq-map data-map-provider=\"custom\"></div>",
  "imperative": "JquanUIComponents.mapApi.registerProvider('custom', CustomMapProvider);\nconst map = await JquanUIComponents.mapApi.mount({\n  target: '#map-root',\n  provider: 'custom',\n  center: [121.4737, 31.2304],\n  zoom: 11\n});",
  "attrs": [
    [
      "`jq-map`",
      "声明式入口"
    ],
    [
      "`data-map-provider`",
      "地图 provider 名称"
    ],
    [
      "`data-map-on-*`",
      "声明式事件回调映射"
    ]
  ],
  "methods": [
    [
      "`mount(options)`",
      "挂载地图"
    ],
    [
      "`registerProvider(name, ProviderClass)`",
      "注册 provider"
    ],
    [
      "`normalizeCoordinate`",
      "统一坐标格式"
    ],
    [
      "`get / destroy`",
      "实例读取与销毁"
    ]
  ],
  "notes": [
    "因为依赖 provider，文档页更适合展示接入方式而不是强制跑完整地图。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div jq-map data-map-provider=\"custom\"></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "JquanUIComponents.mapApi.registerProvider('custom', CustomMapProvider);\nconst map = await JquanUIComponents.mapApi.mount({\n  target: '#map-root',\n  provider: 'custom',\n  center: [121.4737, 31.2304],\n  zoom: 11\n});",
      "preview": false
    }
  ]
};
