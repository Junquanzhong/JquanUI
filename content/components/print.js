// JquanUI component documentation: print
export default {
  "id": "print",
  "title": "Print",
  "chinese": "打印",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/print.js",
  "api": "JquanUIComponents.printApi",
  "summary": "局部打印组件，支持只打印指定区域、复制当前样式、排除工具栏和自定义 pageStyle。",
  "install": "JquanUI.use(JquanUIComponents.print);",
  "declarative": "<section jq-print data-print-target=\"#invoice-panel\">\n  <button jq-print-trigger>打印当前发票</button>\n  <article id=\"invoice-panel\" jq-print-content>...</article>\n</section>",
  "imperative": "const printer = JquanUIComponents.printApi.mount('#demo-print', {\n  target: '#invoice-panel',\n  title: 'Invoice Preview'\n});\n\nprinter.print({\n  pageStyle: '@page { margin: 12mm; }'\n});",
  "attrs": [
    [
      "`jq-print`",
      "声明式入口"
    ],
    [
      "`jq-print-trigger`",
      "打印触发按钮"
    ],
    [
      "`jq-print-content`",
      "推荐的打印内容节点"
    ],
    [
      "`data-print-target`",
      "需要打印的选择器"
    ],
    [
      "`data-print-title`",
      "打印标题"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载打印实例"
    ],
    [
      "`print(target, options)`",
      "触发局部打印"
    ],
    [
      "`update(patch)`",
      "更新目标和 pageStyle"
    ],
    [
      "`destroy(target)`",
      "销毁实例"
    ]
  ],
  "notes": [
    "适合报价单、发票、合同预览、面试评价表、审批单等场景。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-print data-print-target=\"#invoice-panel\">\n  <button jq-print-trigger>打印当前发票</button>\n  <article id=\"invoice-panel\" jq-print-content>...</article>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const printer = JquanUIComponents.printApi.mount('#demo-print', {\n  target: '#invoice-panel',\n  title: 'Invoice Preview'\n});\n\nprinter.print({\n  pageStyle: '@page { margin: 12mm; }'\n});",
      "preview": false
    }
  ]
};
