// JquanUI component documentation: button
export default {
  "id": "button",
  "title": "Button",
  "chinese": "按钮",
  "category": "基础交互",
  "version": "1.1.0",
  "file": "dist/components/button.js",
  "api": null,
  "summary": "声明式按钮样式插件，自动处理默认 type、disabled/loading 状态和 variant/size 约定。",
  "install": "JquanUI.use(JquanUIComponents.button);",
  "declarative": "<button id=\"demo-button\" jq-button data-variant=\"primary\">保存</button>\n<button jq-button data-variant=\"ghost\" data-size=\"sm\">取消</button>",
  "imperative": "// Button 主要是声明式组件，无独立 JS API。\n// 通过标准属性和 data-state 控制状态：\nconst button = document.querySelector('#demo-button');\nbutton.setAttribute('data-state', 'loading');\nbutton.disabled = true;",
  "attrs": [
    [
      "`jq-button`",
      "启用按钮样式和默认行为"
    ],
    [
      "`data-variant`",
      "`default` / `primary` / `ghost`"
    ],
    [
      "`data-size`",
      "`md` / `sm` / `lg`"
    ],
    [
      "`data-state`",
      "`idle` / `loading` / `disabled`"
    ]
  ],
  "methods": [],
  "notes": [
    "适合统一项目中按钮基线风格，不负责业务事件本身。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<button id=\"demo-button\" jq-button data-variant=\"primary\">保存</button>\n<button jq-button data-variant=\"ghost\" data-size=\"sm\">取消</button>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "// Button 主要是声明式组件，无独立 JS API。\n// 通过标准属性和 data-state 控制状态：\nconst button = document.querySelector('#demo-button');\nbutton.setAttribute('data-state', 'loading');\nbutton.disabled = true;",
      "preview": false
    }
  ]
};
