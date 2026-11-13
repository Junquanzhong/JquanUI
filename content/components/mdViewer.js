// JquanUI component documentation: mdViewer
export default {
  "id": "mdViewer",
  "title": "MdViewer",
  "chinese": "Markdown 渲染器",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/mdViewer.js",
  "api": "JquanUIComponents.mdViewerApi",
  "summary": "支持 Markdown 渲染、TOC、Mermaid、代码块联动。",
  "install": "JquanUI.use(JquanUIComponents.codeBlock);\nJquanUI.use(JquanUIComponents.mdViewer);",
  "declarative": "<div jq-md id=\"doc-md\" data-md-source=\"#doc-md-source\"></div>\n<script id=\"doc-md-source\" type=\"text/markdown\">\n# 标题\n\n- 列表\n- 代码块\n</script>",
  "imperative": "JquanUIComponents.mdViewerApi.mount('#doc-md', {\n  source: '# 标题\\n\\n- 支持列表\\n- 支持代码块'\n});",
  "attrs": [
    [
      "`jq-md` / `data-jq-md`",
      "渲染入口"
    ],
    [
      "`data-md-source`",
      "从其他节点读取 Markdown 源"
    ],
    [
      "`data-md-source-text`",
      "直接提供内联 Markdown 文本"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载渲染器"
    ],
    [
      "`render / update`",
      "重渲染与局部更新"
    ],
    [
      "`parse(markdown, options)`",
      "只做解析"
    ],
    [
      "`destroy(target)`",
      "销毁"
    ]
  ],
  "notes": [
    "如果组件文档后续想支持 md 源文件渲染，这个组件很合适。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div jq-md id=\"doc-md\" data-md-source=\"#doc-md-source\"></div>\n<script id=\"doc-md-source\" type=\"text/markdown\">\n# 标题\n\n- 列表\n- 代码块\n</script>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "JquanUIComponents.mdViewerApi.mount('#doc-md', {\n  source: '# 标题\\n\\n- 支持列表\\n- 支持代码块'\n});",
      "preview": false
    }
  ]
};
