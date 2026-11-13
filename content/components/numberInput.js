// JquanUI component documentation: numberInput
export default {
  "id": "numberInput",
  "title": "Number Input",
  "chinese": "数字输入器",
  "category": "表单输入",
  "version": "1.0.0",
  "file": "dist/components/numberInput.js",
  "api": "JquanUIComponents.numberInputApi",
  "summary": "增强原生 number 输入框，提供主题化外观、加减按钮、按住连续步进和键盘大步进。",
  "install": "JquanUI.use(JquanUIComponents.numberInput);",
  "declarative": "<input jq-number-input type=\"number\" min=\"1\" max=\"100\" step=\"1\" data-number-large-step=\"10\" value=\"20\">",
  "imperative": "const input = JquanUIComponents.numberInputApi.mount('#demo-number', {\n  largeStep: 10\n});\n\ninput.step(10);\ninput.setValue(50);",
  "attrs": [
    [
      "`jq-number-input` / `data-jq-number-input`",
      "声明式挂载数字输入器"
    ],
    [
      "`min` / `max` / `step`",
      "沿用原生数字输入约束"
    ],
    [
      "`data-number-large-step`",
      "PageUp/PageDown、Shift+方向键和快捷步进使用的大步长"
    ],
    [
      "`data-number-quick-steps`",
      "逗号分隔的快捷按钮，例如 `-10,10,50`"
    ],
    [
      "`data-number-precision`",
      "固定小数精度"
    ],
    [
      "`data-number-commit-on-input`",
      "输入过程中同步触发 change，默认只在提交动作触发"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载数字输入器"
    ],
    [
      "`get(target)`",
      "获取实例句柄"
    ],
    [
      "`value()` / `number()`",
      "读取字符串值或数字值"
    ],
    [
      "`setValue(value, emit)`",
      "设置值并可选择是否触发事件"
    ],
    [
      "`step(amount)`",
      "按指定步长调整值"
    ],
    [
      "`update(options)`",
      "更新实例配置"
    ],
    [
      "`destroy(target)`",
      "销毁增强层并恢复原输入框"
    ]
  ],
  "notes": [
    "底层保留原生 input，表单提交、校验、disabled、readonly 与业务监听都能继续工作。",
    "组件会触发原生 input/change 事件，并额外派发 `jquan:number-input:change`。",
    "适合分页跳转、价格、库存、排序权重、阈值配置等需要快速调整数值的 B 端场景。",
    "在 Core 与组件加载前设置 componentPresets.ui='semantic'，并配置 surface、surface-muted、text、text-muted、border、accent、focus 七个 theme.semantic 角色；缺省 legacy 保留原配色。",
    "预设模式在组件脚本首次求值时确定；运行中使用 .dark/.light、系统主题或 JquanUI.setTheme() 更新角色，颜色变化不重建 DOM。需要支持 CSS color-mix() 的浏览器；阴影保持固定。",
    "原生 input、加减与相邻快捷按钮均消费语义角色；readonly/disabled 背景使用 surface-muted。classes 为挂载时类名，已有属性选择器优先级保持不变，颜色覆盖可用 !bg-* 等 important 原子类；update({classes}) 不重新应用 DOM 类名。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<input jq-number-input type=\"number\" min=\"1\" max=\"100\" step=\"1\" data-number-large-step=\"10\" value=\"20\">",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const input = JquanUIComponents.numberInputApi.mount('#demo-number', {\n  largeStep: 10\n});\n\ninput.step(10);\ninput.setValue(50);",
      "preview": false
    },
    {
      "id": "semantic-minimum",
      "title": "语义主题 + Select / NumberInput 最小完整组合",
      "language": "html",
      "code": "<!doctype html>\n<html class=\"light\" lang=\"zh-CN\">\n<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<script>\nwindow.JQUAN_CONFIG = {\n  componentPresets: { ui: 'semantic' },\n  theme: { semantic: {\n  \"surface\": {\n    \"light\": \"white\",\n    \"dark\": \"slate-900\"\n  },\n  \"surface-muted\": {\n    \"light\": \"slate-50\",\n    \"dark\": \"slate-800\"\n  },\n  \"text\": {\n    \"light\": \"slate-700\",\n    \"dark\": \"slate-100\"\n  },\n  \"text-muted\": {\n    \"light\": \"slate-500\",\n    \"dark\": \"slate-400\"\n  },\n  \"border\": {\n    \"light\": \"slate-200\",\n    \"dark\": \"slate-700\"\n  },\n  \"accent\": {\n    \"light\": \"blue-600\",\n    \"dark\": \"blue-400\"\n  },\n  \"focus\": {\n    \"light\": \"blue-200\",\n    \"dark\": \"blue-500\"\n  }\n} }\n};\n</script>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body>\n<button id=\"mode\" type=\"button\">切换明暗</button>\n<section id=\"scope\">\n  <label for=\"flavor\">口味</label>\n  <select id=\"flavor\" multiple><option value=\"milk\" selected>牛奶</option><option value=\"tea\">茶</option><option value=\"coffee\" disabled>咖啡</option></select>\n  <label for=\"quantity\">数量</label>\n  <input id=\"quantity\" type=\"number\" min=\"0\" max=\"20\" step=\"1\" value=\"2\" data-number-quick-steps=\"-5,5\">\n</section>\n<script>\nwindow.inputsReady = (async () => {\n  // 命令式挂载使用 install:false，避免再安装声明式 behavior。\n  const [selectApi, numberInputApi] = await JquanUI.import(['select', 'numberInput'], { install: false });\n  const select = selectApi.mount('#flavor', { multiple: true, closeOnSelect: false, helperText: '支持多选' });\n  const number = numberInputApi.mount('#quantity', { largeStep: 5 });\n  const button = document.querySelector('#mode');\n  const toggle = () => {\n    const dark = document.documentElement.classList.toggle('dark');\n    document.documentElement.classList.toggle('light', !dark);\n  };\n  button.addEventListener('click', toggle);\n  window.inputDemo = { select, number };\n  // 视图卸载时调用；原生字段和值保留，Select 的 body 面板会移除。\n  window.disposeInputs = () => { button.removeEventListener('click', toggle); select.destroy(); number.destroy(); };\n  return true;\n})();\n</script>\n</body></html>",
      "preview": false
    }
  ],
  "schema": {
    "configuration": {
      "signature": "JQUAN_CONFIG (before Core and components)",
      "options": [
        [
          "componentPresets.ui",
          "'legacy'|'semantic'",
          "legacy",
          "首次加载组件时选定外观预设"
        ],
        [
          "theme.semantic",
          "Record<string, string | {light:string;dark:string}>",
          "{}",
          "语义模式需完整配置七个角色；缺失变量时使用内置 CSS 回退"
        ]
      ]
    },
    "mount": {
      "signature": "JquanUIComponents.numberInputApi.mount(target, options?)",
      "returns": "实例句柄；destroy() 移除增强层并保留原生字段与当前值。",
      "options": [
        [
          "step",
          "number",
          "原生 step 或 1",
          "普通步长"
        ],
        [
          "largeStep",
          "number",
          "10",
          "PageUp/PageDown 或 Shift+方向键步长"
        ],
        [
          "min / max",
          "number|null",
          "原生 min / max 或 null",
          "数值上下界"
        ],
        [
          "classes",
          "object",
          "内置类名",
          "挂载时 root/decrement/increment/input/quick 类名"
        ]
      ]
    }
  }
};
