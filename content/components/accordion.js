// JquanUI component documentation: accordion
export default {
  "id": "accordion",
  "title": "Accordion",
  "chinese": "折叠面板",
  "category": "基础交互",
  "version": "2.0.0",
  "file": "dist/components/accordion.js",
  "api": "JquanUIComponents.accordionApi",
  "summary": "支持单开、多开、批量展开/收起和状态读取，适合 FAQ、设置分组、侧栏区块。",
  "install": "JquanUI.use(JquanUIComponents.accordion);",
  "declarative": "<section jq-accordion id=\"demo-accordion\">\n  <article jq-accordion-item>\n    <button jq-accordion-trigger>基础配置</button>\n    <div jq-accordion-panel>这里放组件说明或表单。</div>\n  </article>\n</section>",
  "imperative": "const handle = JquanUIComponents.accordionApi.mount('#demo-accordion', {\n  multiple: true,\n  defaultOpen: [0]\n});\n\nhandle.open(1);\nhandle.closeAll();",
  "attrs": [
    [
      "`jq-accordion`",
      "根节点"
    ],
    [
      "`jq-accordion-item`",
      "单个条目"
    ],
    [
      "`jq-accordion-trigger`",
      "触发器"
    ],
    [
      "`jq-accordion-panel`",
      "内容面板"
    ],
    [
      "`data-multiple` / `data-collapsible`",
      "是否允许多开、是否允许全部收起"
    ],
    [
      "`data-default-open`",
      "默认展开的索引或条目标识，多个值用逗号分隔"
    ],
    [
      "`data-duration` / `data-keyboard`",
      "动画时长（毫秒）与是否启用键盘导航"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载实例"
    ],
    [
      "`open / close / toggle`",
      "控制单项"
    ],
    [
      "`openAll / closeAll`",
      "批量控制"
    ],
    [
      "`getState(target)`",
      "读取当前展开状态"
    ],
    [
      "`update(target, options)`",
      "更新实例配置"
    ],
    [
      "`destroy(target)`",
      "销毁实例并解绑事件"
    ]
  ],
  "events": [
    [
      "`jquan:accordion:change`",
      "展开状态变化时触发，`event.detail` 包含当前状态"
    ]
  ],
  "notes": [
    "适合文档目录、参数分组、后台配置面板。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-accordion id=\"demo-accordion\">\n  <article jq-accordion-item>\n    <button jq-accordion-trigger>基础配置</button>\n    <div jq-accordion-panel>这里放组件说明或表单。</div>\n  </article>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const handle = JquanUIComponents.accordionApi.mount('#demo-accordion', {\n  multiple: true,\n  defaultOpen: [0]\n});\n\nhandle.open(1);\nhandle.closeAll();",
      "preview": false
    }
  ]
};
