// JquanUI component documentation: codeBlock
export default {
  "id": "codeBlock",
  "title": "CodeBlock",
  "chinese": "代码高亮块",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/codeBlock.js",
  "api": "JquanUIComponents.codeBlockApi",
  "summary": "自动格式化与高亮代码块，可带语言标签、复制按钮、行号。",
  "install": "JquanUI.use(JquanUIComponents.codeBlock);",
  "declarative": "<pre><code class=\"language-js\">\nconst app = new App();\n</code></pre>",
  "imperative": "JquanUIComponents.codeBlockApi.mount('#demo-code', {\n  showLineNumbers: true,\n  copyable: true\n});",
  "attrs": [
    [
      "`data-language`",
      "显式指定语言"
    ],
    [
      "`data-jq-code`",
      "作为代码块入口"
    ],
    [
      "`class=\"language-xxx\"`",
      "语言推断"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载高亮"
    ],
    [
      "`refresh(target, options)`",
      "重新渲染"
    ],
    [
      "`destroy(target)`",
      "销毁实例"
    ],
    [
      "`getState(target)`",
      "读取实例状态"
    ]
  ],
  "notes": [
    "建议在组件文档页全面接入。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<pre><code class=\"language-js\">\nconst app = new App();\n</code></pre>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "JquanUIComponents.codeBlockApi.mount('#demo-code', {\n  showLineNumbers: true,\n  copyable: true\n});",
      "preview": false
    }
  ]
};
