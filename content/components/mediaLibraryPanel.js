// JquanUI component documentation: mediaLibraryPanel
export default {
  "id": "mediaLibraryPanel",
  "title": "MediaLibraryPanel",
  "chinese": "媒体库面板",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/mediaLibraryPanel.js",
  "api": "JquanUIComponents.mediaLibraryPanelApi",
  "summary": "面向 CMS 素材库的选择面板，支持搜索、选中和素材结果输出。",
  "install": "JquanUI.use(JquanUIComponents.mediaLibraryPanel);",
  "declarative": "<section jq-media-library-panel id=\"demo-media-library-panel\"></section>",
  "imperative": "const panel = JquanUIComponents.mediaLibraryPanelApi.mount('#demo-media-library-panel', {\n  items\n});\n\npanel.select('asset-1');\npanel.values();",
  "attrs": [
    [
      "`jq-media-library-panel`",
      "根节点"
    ],
    [
      "`items[].id / title / type / url / meta`",
      "素材项字段"
    ],
    [
      "`jq-media-library-search`",
      "搜索输入"
    ],
    [
      "`jq-media-library-item`",
      "素材项"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载媒体库面板"
    ],
    [
      "`setItems(items)`",
      "替换素材列表"
    ],
    [
      "`select(id)`",
      "程序化选中素材"
    ],
    [
      "`clear()`",
      "清空选中"
    ],
    [
      "`values() / state()`",
      "读取选中结果和状态"
    ]
  ],
  "notes": [
    "适合封面图、视频、附件选择，也适合资源库抽屉内容区。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-media-library-panel id=\"demo-media-library-panel\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const panel = JquanUIComponents.mediaLibraryPanelApi.mount('#demo-media-library-panel', {\n  items\n});\n\npanel.select('asset-1');\npanel.values();",
      "preview": false
    }
  ]
};
