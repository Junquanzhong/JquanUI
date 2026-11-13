// JquanUI component documentation: tooltip
export default {
  "id": "tooltip",
  "title": "Tooltip",
  "chinese": "文字提示",
  "category": "基础交互",
  "version": "1.2.0",
  "file": "dist/components/tooltip.js",
  "api": null,
  "summary": "极轻量提示组件，通过 `data-tips` 直接启用，自动处理 hover/focus 与定位。",
  "install": "JquanUI.use(JquanUIComponents.tooltip);",
  "declarative": "<button jq-button data-tips=\"复制当前组件示例\" data-tips-pos=\"top\">\n  Hover me\n</button>",
  "imperative": "// Tooltip 为声明式组件，无独立 API。",
  "attrs": [
    [
      "`data-tips`",
      "提示文本"
    ],
    [
      "`data-tips-pos`",
      "`top` / `bottom` / `left` / `right`"
    ],
    [
      "`data-tips-length`",
      "`small` / `medium` / `large`"
    ],
    [
      "`data-tips-align`",
      "文本对齐方式"
    ]
  ],
  "methods": [],
  "notes": [
    "适合图标按钮、状态标记、缩略解释。",
    "semantic 浮层预设下仍保持深底白字反色提示；共享 description 的 text-text-muted 会被替换为 text-white，保留其排版和其他自定义类。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<button jq-button data-tips=\"复制当前组件示例\" data-tips-pos=\"top\">\n  Hover me\n</button>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "// Tooltip 为声明式组件，无独立 API。",
      "preview": false
    }
  ]
};
