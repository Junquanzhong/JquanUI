// JquanUI component documentation: mediaPicker
export default {
  "id": "mediaPicker",
  "title": "MediaPicker",
  "chinese": "素材选择器",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/mediaPicker.js",
  "api": "JquanUIComponents.mediaPickerApi",
  "summary": "素材库选择器，支持网格/列表视图、类型筛选、搜索、单选/多选和选中结果回显。",
  "install": "JquanUI.use(JquanUIComponents.mediaPicker);",
  "declarative": "<section jq-media-picker id=\"demo-media\"></section>",
  "imperative": "const picker = JquanUIComponents.mediaPickerApi.mount('#demo-media', {\n  items,\n  multiple: true\n});\n\npicker.select('cover-1');\npicker.values();",
  "attrs": [
    [
      "`jq-media-picker`",
      "根节点"
    ],
    [
      "`jq-media-picker-filter`",
      "类型筛选按钮"
    ],
    [
      "`jq-media-picker-view`",
      "网格/列表切换按钮"
    ],
    [
      "`jq-media-picker-search`",
      "搜索输入"
    ],
    [
      "`jq-media-picker-item`",
      "单个素材项"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载素材选择器"
    ],
    [
      "`open / close`",
      "打开/关闭状态钩子"
    ],
    [
      "`setItems(items)`",
      "更新素材列表"
    ],
    [
      "`select / deselect / clear`",
      "控制选择状态"
    ],
    [
      "`value() / values() / state()`",
      "读取当前选中结果"
    ]
  ],
  "notes": [
    "适合 Strapi 封面图选择、Directus 素材库、PocketBase 文件关联和 PbootCMS 上传资源面板。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-media-picker id=\"demo-media\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const picker = JquanUIComponents.mediaPickerApi.mount('#demo-media', {\n  items,\n  multiple: true\n});\n\npicker.select('cover-1');\npicker.values();",
      "preview": false
    }
  ]
};
