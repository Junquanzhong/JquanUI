// JquanUI component documentation: dialog
export default {
  "id": "dialog",
  "title": "Dialog",
  "chinese": "原生式对话框",
  "category": "反馈与浮层",
  "version": "1.5.0",
  "file": "dist/components/dialog.js",
  "api": null,
  "summary": "声明式 DOM 对话框，与 Modal、Drawer、Select 共享有序浮层栈。",
  "install": "await JquanUI.import('dialog'); // 自动安装 overlayManager",
  "declarative": "<button jq-dialog-trigger jq-target=\"#simple-dialog\">打开</button>\n<div jq-dialog id=\"simple-dialog\">\n  <div jq-dialog-backdrop></div>\n  <section jq-dialog-panel class=\"p-6\">\n    <h3 class=\"text-xl font-bold\">标题</h3>\n    <button jq-dialog-close class=\"mt-4\">关闭</button>\n  </section>\n</div>",
  "imperative": "// Dialog 没有独立服务 API，推荐保留声明式触发器。\n// 动态插入节点后重新增强根节点：\nJquanUI.enhance(document.querySelector('#simple-dialog'));",
  "attrs": [
    [
      "`jq-dialog`",
      "根节点"
    ],
    [
      "`jq-dialog-panel`",
      "面板"
    ],
    [
      "`jq-dialog-trigger`",
      "触发器"
    ],
    [
      "`jq-dialog-close`",
      "关闭按钮"
    ],
    [
      "`jq-target`",
      "触发器使用的根节点 CSS 选择器；无匹配或非法选择器不触发打开"
    ],
    [
      "`jq-dialog-initial-focus`",
      "面板内优先聚焦的可见可用元素；未设置时选择首个可聚焦控件"
    ],
    [
      "`data-state`",
      "默认 closed；初始 open 会在增强时加入共享栈。运行时由组件管理，请使用触发器或关闭按钮"
    ]
  ],
  "methods": [],
  "notes": [
    "引入方式：await JquanUI.import('dialog') 自动安装 OverlayManager；手动脚本或 npm 使用 overlayManager → dialog 顺序，并依次 JquanUI.use。Full 已包含依赖。",
    "根节点保留 role=dialog、aria-modal=true；所有匹配触发器同步 aria-controls、aria-expanded。请给根节点 aria-label 或 aria-labelledby。",
    "打开加入共享有序栈，仅顶层处理 Escape、Tab 陷阱、外部聚焦和关闭按钮；关闭返回打开前焦点，最后一个滚动锁释放时恢复 overflow 和 padding 的原值及优先级。",
    "面板内部点击不关闭；背景或 jq-dialog-close 的后代点击关闭所属顶层 Dialog，嵌套 Dialog 的关闭不会误关父层。",
    "节点移除或行为清理释放自己的共享层；OverlayManager.destroy() 会关闭整页所有共享层。没有独立 dialogApi，不使用 __jquan* 私有方法。",
    "不负责 portal、背景 inert、跨 iframe/ShadowRoot 焦点或异步关闭校验；需要这些业务 API 时复用 Modal。组件继承现有 surface/text CSS 变量，未新增主题配置。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<button jq-dialog-trigger jq-target=\"#simple-dialog\">打开</button>\n<div jq-dialog id=\"simple-dialog\">\n  <div jq-dialog-backdrop></div>\n  <section jq-dialog-panel class=\"p-6\">\n    <h3 class=\"text-xl font-bold\">标题</h3>\n    <button jq-dialog-close class=\"mt-4\">关闭</button>\n  </section>\n</div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "// Dialog 没有独立服务 API，推荐保留声明式触发器。\n// 动态插入节点后重新增强根节点：\nJquanUI.enhance(document.querySelector('#simple-dialog'));",
      "preview": false
    },
    {
      "id": "shared-minimum",
      "title": "最小闭环：引入、嵌套与销毁",
      "language": "html",
      "code": "<button type=\"button\" jq-dialog-trigger jq-target=\"#account-dialog\">账户</button>\n<div jq-dialog id=\"account-dialog\" aria-labelledby=\"account-title\">\n  <div jq-dialog-backdrop></div>\n  <section jq-dialog-panel class=\"p-6\">\n    <h2 id=\"account-title\">账户详情</h2>\n    <input aria-label=\"姓名\" jq-dialog-initial-focus>\n    <button type=\"button\" jq-dialog-close><span>关闭</span></button>\n  </section>\n</div>\n<script>\n(async () => {\n  await JquanUI.import('dialog');\n  JquanUI.enhance(document.body);\n  // 路由卸载时移除根节点，组件自动释放自己的焦点与滚动锁。\n  // document.querySelector('#account-dialog').remove();\n})();\n</script>",
      "preview": false
    }
  ]
};
