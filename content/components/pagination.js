// JquanUI component documentation: pagination
export default {
  "id": "pagination",
  "title": "Pagination",
  "chinese": "分页",
  "category": "数据展示",
  "version": "1.1.0",
  "file": "dist/components/pagination.js",
  "api": "JquanUIComponents.paginationApi",
  "summary": "分页组件；可选 semantic 预设，让文本、边框、按钮、原生控件与焦点环随角色变量切换。",
  "install": "JquanUI.use(JquanUIComponents.pagination);",
  "declarative": "<div jq-pagination id=\"demo-pagination\"></div>",
  "imperative": "const pager = JquanUIComponents.paginationApi.mount('#demo-pagination', {\n  page: 1,\n  pageSize: 10,\n  total: 126\n});\n\npager.update({ page: 3 });",
  "attrs": [
    [
      "`jq-pagination`",
      "声明式挂载点"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载分页"
    ],
    [
      "`get(target)`",
      "获取句柄"
    ],
    [
      "`update(target, patch)`",
      "更新页码、总数、pageSize"
    ],
    [
      "`destroy(target)`",
      "销毁"
    ]
  ],
  "notes": [
    "table 组件内部也会联动使用它。",
    "在 Core/Full/Components 之前配置 componentPresets.ui = 'semantic'，并配置七个 theme.semantic 角色（见 overlayPreset 最小运行示例）；缺省 legacy 保持旧类名。分页不依赖 uiPreset 对象，直接读取同一配置。",
    "语义按钮用 bg-accent/10、border-accent/30、text-accent，避免自定义 accent 搭配固定白字。切换 html.dark/html.light 或 setTheme 不重建分页 DOM，不改变当前页和焦点。",
    "classes 为按字段替换的覆盖对象；update 保留已生效的 classes。预设模式仅在组件脚本加载时读取，运行中换肤应更新角色变量。",
    "原生页容量 select 和跳页 input 使用角色；若另装 Select/NumberInput，它们的增强外观由各自组件决定，本轮不保证增强外观全部主题化。",
    "无必需组件依赖；命令式 mount 与声明式 behavior 二选一，避免重复挂载。handle.destroy() 清空分页并移除实例；本示例关闭 showSizer/showJumper，避免额外增强组件生命周期。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div jq-pagination id=\"demo-pagination\"></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const pager = JquanUIComponents.paginationApi.mount('#demo-pagination', {\n  page: 1,\n  pageSize: 10,\n  total: 126\n});\n\npager.update({ page: 3 });",
      "preview": false
    },
    {
      "id": "semantic-minimum",
      "title": "最小可运行：分页与消息共用角色",
      "language": "html",
      "code": "<!doctype html>\n<html class=\"light\" lang=\"zh-CN\">\n<head><meta charset=\"utf-8\">\n<script>\nwindow.JQUAN_CONFIG = {\n  componentPresets: { ui: 'semantic', overlay: 'semantic' },\n  theme: { semantic: {\n    surface: { light: 'white', dark: 'slate-900' },\n    'surface-muted': { light: 'slate-50', dark: 'slate-800' },\n    text: { light: 'slate-700', dark: 'slate-100' },\n    'text-muted': { light: 'slate-500', dark: 'slate-400' },\n    border: { light: 'slate-200', dark: 'slate-700' },\n    accent: { light: 'blue-600', dark: 'blue-400' },\n    focus: { light: 'blue-200', dark: 'blue-500' }\n  } }\n};\n</script>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n<script src=\"./dist/components/overlayPreset.js\"></script>\n<script src=\"./dist/components/msg.js\"></script>\n<script src=\"./dist/components/pagination.js\"></script>\n</head>\n<body>\n<button id=\"mode\" type=\"button\">切换明暗</button>\n<div id=\"pager\"></div>\n<script>\n(async () => {\n  const messageApi = JquanUIComponents.msgApi;\n  const paginationApi = JquanUIComponents.paginationApi; // 命令式挂载，不另装 behavior\n  const message = messageApi.show({ content: '保存成功', description: '主题切换保留当前节点', type: 'success', duration: 0, showClose: true });\n  const pager = paginationApi.mount('#pager', { total: 250, page: 2, showSizer: false, showJumper: false });\n  const button = document.querySelector('#mode');\n  const toggle = () => {\n    const dark = document.documentElement.classList.toggle('dark');\n    document.documentElement.classList.toggle('light', !dark);\n  };\n  button.addEventListener('click', toggle);\n  // 视图卸载时调用 dispose()；预设本身无监听需要销毁。\n  window.dispose = () => { button.removeEventListener('click', toggle); message.close(); pager.destroy(); };\n  window.semanticDemo = { message, pager };\n  JquanUI.scan();\n  window.semanticReady = { ok: true };\n})().catch(error => { window.semanticReady = { ok: false, error: error.stack }; });\n</script>\n</body></html>",
      "preview": false
    }
  ],
  "schema": {
    "theme": {
      "signature": "componentPresets.ui / options.classes",
      "options": [
        [
          "componentPresets.ui",
          "'legacy'|'semantic'",
          "legacy",
          "在组件脚本加载前配置，使用七个 theme.semantic 角色。"
        ],
        [
          "options.classes",
          "Record<string,string>",
          "内置预设",
          "按 root/total/button/buttonDefault/buttonHover/buttonActive/buttonDisabled/ellipsis/sizer/jumper/jumperInput/pages 覆盖。"
        ]
      ],
      "returns": "mount 返回句柄；state() 保留页码和 classes；update 重绘，切换角色变量不会重绘。"
    }
  }
};
