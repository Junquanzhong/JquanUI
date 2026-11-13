// JquanUI component documentation: copy
export default {
  "id": "copy",
  "title": "Copy",
  "chinese": "复制",
  "category": "浏览器工具",
  "version": "1.1.0",
  "file": "dist/components/copy.js",
  "api": "JquanUIComponents.copyApi",
  "summary": "既支持声明式复制按钮，也支持直接复制文本/元素内容的 API。",
  "install": "JquanUI.use(JquanUIComponents.copy);",
  "declarative": "<pre id=\"copy-source\">npm i jquanui</pre>\n<button jq-copy-trigger\n  data-copy-target=\"#copy-source\"\n  data-copy-success=\"已复制\"\n  jq-button>\n  复制命令\n</button>",
  "imperative": "await JquanUIComponents.copyApi.copyText('npm i jquanui');\nawait JquanUIComponents.copyApi.copyElement('#copy-source');",
  "attrs": [
    [
      "`jq-copy-trigger`",
      "复制触发器"
    ],
    [
      "`data-copy-text`",
      "直接复制文本"
    ],
    [
      "`data-copy-target`",
      "复制目标元素内容"
    ],
    [
      "`data-copy-success`",
      "成功提示"
    ]
  ],
  "methods": [
    [
      "`copyText(text, options)`",
      "复制纯文本"
    ],
    [
      "`copyElement(target, options)`",
      "复制元素文本/值"
    ]
  ],
  "notes": [
    "这个组件和组件文档页天然匹配，可直接用于“复制示例代码”。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<pre id=\"copy-source\">npm i jquanui</pre>\n<button jq-copy-trigger\n  data-copy-target=\"#copy-source\"\n  data-copy-success=\"已复制\"\n  jq-button>\n  复制命令\n</button>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "await JquanUIComponents.copyApi.copyText('npm i jquanui');\nawait JquanUIComponents.copyApi.copyElement('#copy-source');",
      "preview": false
    }
  ]
};
