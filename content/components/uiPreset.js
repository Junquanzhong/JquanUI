// JquanUI component documentation: uiPreset
export default {
  "id": "uiPreset",
  "title": "UiPreset",
  "chinese": "界面预设",
  "category": "设计预设",
  "version": "内置",
  "file": "dist/components/uiPreset.js",
  "api": "JquanUIComponents.uiPreset",
  "summary": "共享 UI 视觉预设；默认 legacy，可选 semantic 通过七个 light/dark 角色令牌联动主题。",
  "install": "const preset = await JquanUI.import('uiPreset'); // 无需 JquanUI.use()",
  "declarative": "const classes = JquanUIComponents.uiPreset.classes;",
  "imperative": "const preset = await JquanUI.import('uiPreset');\nconsole.log(preset.mode); // 'legacy' 或 'semantic'\nconst panel = preset.classes.panel;\nconst control = preset.classes.control;",
  "attrs": [],
  "methods": [
    [
      "`classes.surface / panel / control / action ...`",
      "统一读取预设 class"
    ],
    [
      "`mode / presets.legacy / presets.semantic`",
      "读取加载时选择的模式和两套类映射；classes 是所选映射的浅副本。"
    ]
  ],
  "notes": [
    "先配置 JQUAN_CONFIG，再引入 Core/Full/Components；uiPreset 读取 JquanUI.config 或 JQUAN_CONFIG。仅 semantic 值启用语义预设，其他值保留 legacy。",
    "必须为七个角色提供可解析的 light/dark 颜色，支持色板 key、HEX 和已配置项目色；未配置角色时对应语义原子类没有有效颜色，预设不会猜测品牌色或自动注入默认令牌。",
    "切换 html.dark/html.light，或移除两类跟随系统。局部 .dark 可覆盖继承变量；Core 的 .light 只在 html 上抑制系统兜底，不提供局部 light 重置。",
    "setTheme(name) 只更新变量；每个命名主题应包含完整角色集合。不会重建 Table DOM，排序、筛选和焦点保持。",
    "Table 2.4 已完成文本、边框、背景、控件、空/加载状态和排序焦点的语义预设接入；Pagination 与 Overlay Preset 已接入；其他消费者的内部硬编码部分仍需逐个迁移。",
    "classes 覆盖仍有效；Table 在加载时捕获默认类，运行中修改 componentPresets.ui 不会给已加载组件换预设。需重载页面选择另一套；日常换肤使用角色值和 setTheme。",
    "错误颜色继续使用 red-600 / dark:red-400；阴影强度沿用现有 shadow，角色令牌不自动改变阴影参数。历史 bg-white/90 等原子类保持原有含义。",
    "预设没有资源需要销毁；消费组件和业务按钮监听在视图卸载时分别 destroy/removeEventListener。构建提取时将所用预设类纳入输入或 safelist。",
    "componentPresets.ui=semantic 也启用 Pagination，并在 overlay 未显式配置时启用 Overlay Preset；overlay=legacy 可单独保留旧浮层。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "const classes = JquanUIComponents.uiPreset.classes;",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const preset = await JquanUI.import('uiPreset');\nconsole.log(preset.mode); // 'legacy' 或 'semantic'\nconst panel = preset.classes.panel;\nconst control = preset.classes.control;",
      "preview": false
    },
    {
      "id": "semantic-minimum",
      "title": "最小可运行：语义预设 + Table + 明暗切换",
      "language": "html",
      "code": "<!doctype html>\n<html class=\"light\" lang=\"zh-CN\">\n<head><meta charset=\"utf-8\">\n<script>\nwindow.JQUAN_CONFIG = {\n  componentPresets: { ui: 'semantic' },\n  theme: { semantic: {\n      surface: { light: 'white', dark: 'slate-900' },\n      'surface-muted': { light: 'slate-50', dark: 'slate-800' },\n      text: { light: 'slate-700', dark: 'slate-100' },\n      'text-muted': { light: 'slate-500', dark: 'slate-400' },\n      border: { light: 'slate-200', dark: 'slate-700' },\n      accent: { light: 'blue-600', dark: 'blue-400' },\n      focus: { light: 'blue-200', dark: 'blue-500' }\n  } }\n};\n</script>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body>\n<button id=\"mode\" type=\"button\">切换明暗</button>\n<div id=\"table\"></div>\n<script>\n(async () => {\n  const api = await JquanUI.import('table'); // 自动加载 uiPreset、pagination\n  const table = await api.mount('#table', {\n    columns: [{ key: 'name', title: '名称', sortable: true }],\n    data: [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }],\n    toolbar: { refresh: true }\n  });\n  const button = document.querySelector('#mode');\n  const toggle = () => {\n    const html = document.documentElement;\n    const dark = html.classList.toggle('dark');\n    html.classList.toggle('light', !dark);\n  };\n  button.addEventListener('click', toggle);\n  // 视图卸载时调用 dispose()，解绑业务事件并销毁 Table。\n  window.dispose = () => { button.removeEventListener('click', toggle); table?.destroy(); };\n  window.themeTable = table;\n  JquanUI.scan();\n  window.themeReady = { ok: true };\n})().catch(error => { window.themeReady = { ok: false, error: error.stack }; });\n</script>\n</body></html>",
      "preview": false
    }
  ],
  "schema": {
    "configuration": {
      "signature": "JQUAN_CONFIG.componentPresets.ui: 'legacy' | 'semantic'",
      "options": [
        [
          "componentPresets.ui",
          "'legacy'|'semantic'",
          "'legacy'",
          "在 Core 和组件脚本加载之前配置；仅在 uiPreset 首次加载时选择。"
        ],
        [
          "theme.semantic",
          "Record<string, string | { light: string; dark: string }>",
          "{}",
          "semantic 模式需要 surface、surface-muted、text、text-muted、border、accent、focus 七个角色。"
        ]
      ],
      "returns": "JquanUI.import('uiPreset') 返回 { mode, classes, presets }；没有实例、监听器或销毁方法。"
    }
  }
};
