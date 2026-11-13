// JquanUI component documentation: dropdown
export default {
  "id": "dropdown",
  "title": "Dropdown",
  "chinese": "下拉菜单",
  "category": "基础交互",
  "version": "1.4.0",
  "file": "dist/components/dropdown.js",
  "api": null,
  "summary": "声明式下拉菜单，支持 click / hover / contextmenu 触发、上下左右对齐、过渡动画以及 open / close / select 事件抛出。",
  "install": "JquanUI.use(JquanUIComponents.dropdown);",
  "declarative": "<div id=\"demo-dropdown\" jq-dropdown data-dropdown-align=\"end\" data-dropdown-pos=\"bottom\">\n  <button jq-dropdown-trigger jq-button>更多操作</button>\n  <div jq-dropdown-menu>\n    <button jq-dropdown-item>编辑</button>\n    <button jq-dropdown-item>复制</button>\n    <button jq-dropdown-item>删除</button>\n  </div>\n</div>\n\n<div id=\"demo-dropdown-context\" jq-dropdown data-dropdown-trigger=\"contextmenu\">\n  右键打开上下文菜单\n  <div jq-dropdown-menu>\n    <button jq-dropdown-item data-action=\"new-file\">新建文件</button>\n  </div>\n</div>",
  "imperative": "const root = document.querySelector('#demo-dropdown');\nconst contextMenu = document.querySelector('#demo-dropdown-context');\n\nroot.addEventListener('jquan:dropdown:open', () => console.log('open'));\nroot.addEventListener('jquan:dropdown:close', () => console.log('close'));\nroot.addEventListener('jquan:dropdown:select', event => {\n  console.log(event.detail.action);\n});\n\ncontextMenu.addEventListener('jquan:dropdown:open', event => {\n  console.log(event.detail.x, event.detail.y);\n});",
  "attrs": [
    [
      "`jq-dropdown`",
      "根容器"
    ],
    [
      "`jq-dropdown-trigger`",
      "触发按钮"
    ],
    [
      "`jq-dropdown-menu`",
      "菜单容器"
    ],
    [
      "`jq-dropdown-item`",
      "菜单项"
    ],
    [
      "`data-dropdown-trigger`",
      "`click` / `hover` / `contextmenu`"
    ],
    [
      "`data-dropdown-align`",
      "`start` / `end`"
    ],
    [
      "`data-dropdown-pos`",
      "`bottom` / `top`"
    ]
  ],
  "methods": [],
  "notes": [
    "适合表格行操作、用户菜单、工具菜单，也可用作右键上下文菜单；文档预览现已直接运行真实组件逻辑。"
  ],
  "events": [
    [
      "`jquan:dropdown:open` / `jquan:dropdown:close`",
      "菜单打开或关闭时触发"
    ],
    [
      "`jquan:dropdown:select`",
      "菜单项被选中时触发，`event.detail.action` 为动作值"
    ]
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div id=\"demo-dropdown\" jq-dropdown data-dropdown-align=\"end\" data-dropdown-pos=\"bottom\">\n  <button jq-dropdown-trigger jq-button>更多操作</button>\n  <div jq-dropdown-menu>\n    <button jq-dropdown-item>编辑</button>\n    <button jq-dropdown-item>复制</button>\n    <button jq-dropdown-item>删除</button>\n  </div>\n</div>\n\n<div id=\"demo-dropdown-context\" jq-dropdown data-dropdown-trigger=\"contextmenu\">\n  右键打开上下文菜单\n  <div jq-dropdown-menu>\n    <button jq-dropdown-item data-action=\"new-file\">新建文件</button>\n  </div>\n</div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const root = document.querySelector('#demo-dropdown');\nconst contextMenu = document.querySelector('#demo-dropdown-context');\n\nroot.addEventListener('jquan:dropdown:open', () => console.log('open'));\nroot.addEventListener('jquan:dropdown:close', () => console.log('close'));\nroot.addEventListener('jquan:dropdown:select', event => {\n  console.log(event.detail.action);\n});\n\ncontextMenu.addEventListener('jquan:dropdown:open', event => {\n  console.log(event.detail.x, event.detail.y);\n});",
      "preview": false
    }
  ]
};
