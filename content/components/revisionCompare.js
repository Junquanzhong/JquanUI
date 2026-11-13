// JquanUI component documentation: revisionCompare
export default {
  "id": "revisionCompare",
  "title": "RevisionCompare",
  "chinese": "版本对比",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/revisionCompare.js",
  "api": "JquanUIComponents.revisionCompareApi",
  "summary": "用于内容修订前后差异展示，适合版本历史和审核比较。",
  "install": "JquanUI.use(JquanUIComponents.revisionCompare);",
  "declarative": "<section jq-revision-compare id=\"demo-revision-compare\"></section>",
  "imperative": "const compare = JquanUIComponents.revisionCompareApi.mount('#demo-revision-compare', {\n  left,\n  right\n});\n\ncompare.setValues(prevText, nextText);",
  "attrs": [
    [
      "`jq-revision-compare`",
      "根节点"
    ],
    [
      "`left / right`",
      "左右两侧文本"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载版本对比"
    ],
    [
      "`setValues(left, right)`",
      "更新左右文本"
    ],
    [
      "`state()`",
      "读取当前 diff 数据"
    ]
  ],
  "notes": [
    "适合修订对比、审核差异、版本快照比较。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-revision-compare id=\"demo-revision-compare\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const compare = JquanUIComponents.revisionCompareApi.mount('#demo-revision-compare', {\n  left,\n  right\n});\n\ncompare.setValues(prevText, nextText);",
      "preview": false
    }
  ]
};
