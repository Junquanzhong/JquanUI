// JquanUI component documentation: table
export default {
  "id": "table",
  "title": "Table",
  "chinese": "表格",
  "category": "数据展示",
  "version": "2.2.0",
  "file": "dist/components/table.js",
  "api": "JquanUIComponents.tableApi",
  "summary": "完整数据表格，支持排序、筛选、选择、分页和状态读取，适合索引页、后台列表、文档总览。；semantic 预设下正文、表头、空/加载状态与工具栏焦点环消费主题角色。",
  "install": "JquanUI.use(JquanUIComponents.pagination);\nJquanUI.use(JquanUIComponents.table);",
  "declarative": "<div id=\"demo-table\"></div>",
  "imperative": "const table = await JquanUIComponents.tableApi.mount('#demo-table', {\n  columns: [\n    { key: 'name', title: '组件名', sortable: true },\n    { key: 'type', title: '类型' }\n  ],\n  data: [\n    { name: 'Modal', type: 'overlay' },\n    { name: 'Tabs', type: 'navigation' }\n  ]\n});\n\ntable.reload();\ntable.clearSelection();\ntable.state();",
  "attrs": [],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载表格"
    ],
    [
      "`update(target, patch)`",
      "更新列、数据、分页"
    ],
    [
      "`reload()`",
      "重新加载本地/远程数据"
    ],
    [
      "`state()`",
      "读取排序、筛选、分页、勾选状态"
    ]
  ],
  "notes": [
    "如果你的组件文档后续做“组件索引表”，table 可以直接复用，预览里也应该把排序、筛选、刷新这些高频动作展示清楚。",
    "在 Core 和组件之前配置 componentPresets.ui = 'semantic' 与七个 theme.semantic 角色；Table 复用 uiPreset 的 tableText/tableTitle/tableMuted/tableFocus，legacy 缺省保持旧色值。运行中通过 html.dark/html.light 或 setTheme() 切换颜色，无需重新 mount；classes.table/headCell/empty/loading/button 仍可覆盖。",
    "命令式挂载可用 const api = await JquanUI.import('table', { install: false }); const table = await api.mount('#demo-table', options)。import 会装载依赖文件；视图卸载调用 table.destroy()，业务按钮事件自行解绑。",
    "排序控件当前为 span，本轮只迁移颜色和刷新按钮焦点环；键盘排序与请求取消仍属后续迭代，勿把规划中的 API 当作已实现能力。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div id=\"demo-table\"></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const table = await JquanUIComponents.tableApi.mount('#demo-table', {\n  columns: [\n    { key: 'name', title: '组件名', sortable: true },\n    { key: 'type', title: '类型' }\n  ],\n  data: [\n    { name: 'Modal', type: 'overlay' },\n    { name: 'Tabs', type: 'navigation' }\n  ]\n});\n\ntable.reload();\ntable.clearSelection();\ntable.state();",
      "preview": false
    },
    {
      "id": "semantic-minimum",
      "title": "最小完整示例：明暗主题与销毁",
      "language": "html",
      "code": "<!doctype html>\n<html class=\"light\" lang=\"zh-CN\">\n<head><meta charset=\"utf-8\">\n<script>\nwindow.JQUAN_CONFIG = {\n  componentPresets: { ui: 'semantic' },\n  theme: { semantic: {\n      surface: { light: 'white', dark: 'slate-900' },\n      'surface-muted': { light: 'slate-50', dark: 'slate-800' },\n      text: { light: 'slate-700', dark: 'slate-100' },\n      'text-muted': { light: 'slate-500', dark: 'slate-400' },\n      border: { light: 'slate-200', dark: 'slate-700' },\n      accent: { light: 'blue-600', dark: 'blue-400' },\n      focus: { light: 'blue-200', dark: 'blue-500' }\n  } }\n};\n</script>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body>\n<button id=\"mode\" type=\"button\">切换明暗</button>\n<div id=\"table\"></div>\n<script>\n(async () => {\n  const api = await JquanUI.import('table'); // 自动加载 uiPreset、pagination\n  const table = await api.mount('#table', {\n    columns: [{ key: 'name', title: '名称', sortable: true }],\n    data: [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }],\n    toolbar: { refresh: true }\n  });\n  const button = document.querySelector('#mode');\n  const toggle = () => {\n    const html = document.documentElement;\n    const dark = html.classList.toggle('dark');\n    html.classList.toggle('light', !dark);\n  };\n  button.addEventListener('click', toggle);\n  // 视图卸载时调用 dispose()，解绑业务事件并销毁 Table。\n  window.dispose = () => { button.removeEventListener('click', toggle); table?.destroy(); };\n  window.themeTable = table;\n  JquanUI.scan();\n  window.themeReady = { ok: true };\n})().catch(error => { window.themeReady = { ok: false, error: error.stack }; });\n</script>\n</body></html>",
      "preview": false
    }
  ]
};
