// JquanUI component documentation: contentOutlinePanel
export default {
  "id": "contentOutlinePanel",
  "title": "ContentOutlinePanel",
  "chinese": "内容大纲面板",
  "category": "页面结构",
  "version": "1.0.0",
  "file": "dist/components/contentOutlinePanel.js",
  "api": "JquanUIComponents.contentOutlinePanelApi",
  "summary": "用于展示文档或长内容的大纲导航，支持层级缩进和当前节点高亮。",
  "install": "JquanUI.use(JquanUIComponents.contentOutlinePanel);",
  "declarative": "<aside jq-content-outline-panel id=\"demo-content-outline-panel\"></aside>",
  "imperative": "const outline = JquanUIComponents.contentOutlinePanelApi.mount('#demo-content-outline-panel', {\n  items\n});\n\noutline.activate('section-2');\noutline.state();",
  "attrs": [
    [
      "`jq-content-outline-panel`",
      "根节点"
    ],
    [
      "`items[].title / level / meta`",
      "大纲项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载大纲面板"
    ],
    [
      "`activate(itemId)`",
      "激活当前项"
    ],
    [
      "`setItems(items)`",
      "更新大纲列表"
    ],
    [
      "`state()`",
      "读取当前状态"
    ]
  ],
  "notes": [
    "适合文档编辑、长文章编辑器、知识库详情页。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<aside jq-content-outline-panel id=\"demo-content-outline-panel\"></aside>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const outline = JquanUIComponents.contentOutlinePanelApi.mount('#demo-content-outline-panel', {\n  items\n});\n\noutline.activate('section-2');\noutline.state();",
      "preview": false
    }
  ]
};
