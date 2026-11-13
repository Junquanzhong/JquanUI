// JquanUI component documentation: overlayPreset
export default {
  "id": "overlayPreset",
  "title": "OverlayPreset",
  "chinese": "浮层预设",
  "category": "设计预设",
  "version": "内置",
  "file": "dist/components/overlayPreset.js",
  "api": "JquanUIComponents.overlayPreset",
  "summary": "浮层共享外观；支持 legacy/semantic，Msg、Toast 和共享面板随 Core 角色变量切换主题。",
  "install": "<script src=\"./dist/components/overlayPreset.js\"></script> <!-- 位于消费者之前 -->",
  "declarative": "const overlay = JquanUIComponents.overlayPreset.classes;",
  "imperative": "const preset = JquanUIComponents.overlayPreset;\nconsole.log(preset.mode);\nconst panel = preset.classes.surface;\nconst tone = preset.tones.success;",
  "attrs": [],
  "methods": [
    [
      "`classes.*`",
      "浮层结构类名"
    ],
    [
      "`tones.*`",
      "语义色调"
    ],
    [
      "`icons.*`",
      "默认符号"
    ],
    [
      "`mode / presets.legacy / presets.semantic`",
      "读取加载时模式和两套 classes/tones/icons；当前字段是所选映射的浅副本。"
    ]
  ],
  "notes": [
    "配置位于 Core/Full/Components 和消费者脚本之前。Core 负责生成语义色变量，预设不注入默认令牌。直接 script 引入时先加载 overlayPreset.js，再加载 msg/toast/modal/popover 等消费者。四种发布入口都具备 JquanUI.import，也可按名称加载；完整示例使用显式 script 展示 CSP/静态部署时的等价顺序。",
    "componentPresets.overlay 缺省时继承 componentPresets.ui；仅 semantic 字符串启用语义模式。显式 overlay=legacy 可保留旧浮层。预设和消费者在加载时捕获类名，运行中修改模式不会换掉已有默认值。",
    "日常切换 html.dark/html.light，移除两者跟随系统；setTheme(name) 的命名主题应包含完整角色。变量改变不重建消息或分页 DOM。局部 .dark 只影响后代；挂在 body 的消息/portal 不继承触发器的局部主题。",
    "共享 surface/floatingPanel、描述、操作、关闭、focus 与 Popover 箭头使用角色；Msg/Toast 已直接消费这些字段。状态图标采用显式明暗蓝/绿/黄/红色，不复用品牌 accent；backdrop 与阴影强度保持固定。",
    "Tooltip 保持深底白字的反色提示。Modal 表单输入、图片查看器、Select/NumberInput 等组件内部硬编码样式尚未全部迁移；启用预设不代表所有浮层细节已完成暗色适配。",
    "classes/tones/icons 可在消费者脚本加载前覆盖；修改 presets.* 不会自动更新当前浅副本。Popover 的 options.classes 覆盖继续有效。",
    "预设无行为、定时器和 destroy 方法。消费组件按各自 API 关闭/销毁；示例 dispose 解绑按钮事件并关闭消息、销毁分页。构建提取时包含所用组件源码或显式 safelist，避免遗漏动态类。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "const overlay = JquanUIComponents.overlayPreset.classes;",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const preset = JquanUIComponents.overlayPreset;\nconsole.log(preset.mode);\nconst panel = preset.classes.surface;\nconst tone = preset.tones.success;",
      "preview": false
    },
    {
      "id": "semantic-minimum",
      "title": "最小可运行：消息 + 分页 + 明暗切换",
      "language": "html",
      "code": "<!doctype html>\n<html class=\"light\" lang=\"zh-CN\">\n<head><meta charset=\"utf-8\">\n<script>\nwindow.JQUAN_CONFIG = {\n  componentPresets: { ui: 'semantic', overlay: 'semantic' },\n  theme: { semantic: {\n    surface: { light: 'white', dark: 'slate-900' },\n    'surface-muted': { light: 'slate-50', dark: 'slate-800' },\n    text: { light: 'slate-700', dark: 'slate-100' },\n    'text-muted': { light: 'slate-500', dark: 'slate-400' },\n    border: { light: 'slate-200', dark: 'slate-700' },\n    accent: { light: 'blue-600', dark: 'blue-400' },\n    focus: { light: 'blue-200', dark: 'blue-500' }\n  } }\n};\n</script>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n<script src=\"./dist/components/overlayPreset.js\"></script>\n<script src=\"./dist/components/msg.js\"></script>\n<script src=\"./dist/components/pagination.js\"></script>\n</head>\n<body>\n<button id=\"mode\" type=\"button\">切换明暗</button>\n<div id=\"pager\"></div>\n<script>\n(async () => {\n  const messageApi = JquanUIComponents.msgApi;\n  const paginationApi = JquanUIComponents.paginationApi; // 命令式挂载，不另装 behavior\n  const message = messageApi.show({ content: '保存成功', description: '主题切换保留当前节点', type: 'success', duration: 0, showClose: true });\n  const pager = paginationApi.mount('#pager', { total: 250, page: 2, showSizer: false, showJumper: false });\n  const button = document.querySelector('#mode');\n  const toggle = () => {\n    const dark = document.documentElement.classList.toggle('dark');\n    document.documentElement.classList.toggle('light', !dark);\n  };\n  button.addEventListener('click', toggle);\n  // 视图卸载时调用 dispose()；预设本身无监听需要销毁。\n  window.dispose = () => { button.removeEventListener('click', toggle); message.close(); pager.destroy(); };\n  window.semanticDemo = { message, pager };\n  JquanUI.scan();\n  window.semanticReady = { ok: true };\n})().catch(error => { window.semanticReady = { ok: false, error: error.stack }; });\n</script>\n</body></html>",
      "preview": false
    }
  ],
  "schema": {
    "configuration": {
      "signature": "JQUAN_CONFIG.componentPresets: { ui?: 'legacy'|'semantic', overlay?: 'legacy'|'semantic' }",
      "options": [
        [
          "componentPresets.overlay",
          "'legacy'|'semantic'",
          "继承 componentPresets.ui，最终 legacy",
          "仅首次加载预设时选择；显式 legacy 可覆盖 ui=semantic。"
        ],
        [
          "theme.semantic",
          "Record<string, string | { light: string; dark: string }>",
          "{}",
          "需配置 surface、surface-muted、text、text-muted、border、accent、focus 七个角色。"
        ]
      ]
    },
    "state": {
      "signature": "preset.mode / preset.classes / preset.tones / preset.icons",
      "returns": "mode 为 legacy|semantic，映射值均为 class 或图标字符串；读取无需销毁。"
    }
  }
};
