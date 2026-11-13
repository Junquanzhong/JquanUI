// JquanUI component documentation: select
export default {
  "id": "select",
  "title": "Select",
  "chinese": "下拉单/多选",
  "category": "表单输入",
  "version": "1.5.0",
  "file": "dist/components/select.js",
  "api": "JquanUIComponents.selectApi",
  "summary": "基于原生 select 的增强型单选/多选组件，支持搜索、清空、最大选择数、键盘交互和原生表单值同步。",
  "install": "await JquanUI.import('select'); // 自动装配 OverlayManager；命令式挂载用 install:false",
  "declarative": "<select jq-select data-placeholder=\"选择技术栈\">\n  <option value=\"\">请选择</option>\n  <option value=\"vue\">Vue</option>\n  <option value=\"react\">React</option>\n  <option value=\"svelte\">Svelte</option>\n</select>\n\n<select id=\"demo-select\" jq-select multiple data-select-max=\"3\" data-select-max-text=\"最多只能选择 3 项\" data-helper-text=\"支持搜索与多选\" data-placeholder=\"选择最多 3 项\">\n  <option value=\"docs\">Docs</option>\n  <option value=\"dashboard\">Dashboard</option>\n  <option value=\"table\">Table</option>\n</select>",
  "imperative": "const select = JquanUIComponents.selectApi.mount('#demo-select', {\n  multiple: true,\n  searchable: true,\n  maxSelections: 3,\n  helperText: '支持搜索与多选',\n  maxSelectionsText: '最多只能选择 3 项'\n});\n\nselect.open();\nselect.select('docs');\nselect.setValue(['docs', 'dashboard']);",
  "attrs": [
    [
      "`jq-select`",
      "启用 Select 增强"
    ],
    [
      "`multiple`",
      "启用多选模式"
    ],
    [
      "`data-placeholder`",
      "触发器占位文本"
    ],
    [
      "`data-select-searchable`",
      "是否允许搜索"
    ],
    [
      "`data-select-clearable`",
      "是否允许清空"
    ],
    [
      "`data-select-close-on-select`",
      "单选后是否自动关闭"
    ],
    [
      "`data-select-max`",
      "多选时最大选择数量"
    ],
    [
      "`data-select-max-text`",
      "达到选择上限后的提示文案"
    ],
    [
      "`data-helper-text`",
      "底部辅助说明文本"
    ],
    [
      "`data-empty-text` / `data-select-search-debounce`",
      "无匹配提示与搜索防抖时间（毫秒）"
    ],
    [
      "`disabled`",
      "禁用原生 select，同步禁用增强组件"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载 Select"
    ],
    [
      "`open / close / toggle`",
      "控制面板开关"
    ],
    [
      "`select / deselect / clear`",
      "控制选中值"
    ],
    [
      "`setValue / value / values`",
      "设置或读取当前值"
    ],
    [
      "`search(keyword)`",
      "程序化搜索"
    ],
    [
      "`state()`",
      "读取开关、选中值、过滤结果"
    ],
    [
      "`element()` / `setDisabled(value)` / `setSearchable(value)` / `setClearable(value)`",
      "读取原生节点并单独切换三个布尔行为；setter 返回 boolean"
    ],
    [
      "`get(target)`",
      "通过节点读取已挂载句柄"
    ],
    [
      "`update(patch)`",
      "更新选项、搜索或选择限制"
    ],
    [
      "`destroy(target)`",
      "销毁增强层并恢复原生 select"
    ],
    [
      "`get(target)`",
      "获取稳定句柄；target 可为原生节点、选择器或有效句柄"
    ],
    [
      "`control()`",
      "读取现有可见触发按钮；只读获取，不创建控件，销毁后返回 null。"
    ]
  ],
  "events": [
    [
      "`jquan:select:change`",
      "detail 为 { value, values, instance }；同时触发原生 change。"
    ],
    [
      "`jquan:select:update`",
      "setDisabled/setSearchable/setClearable 派发；detail 为 { option, value, instance }，event.target 是原生 select。"
    ]
  ],
  "notes": [
    "适合筛选器、配置表单、批量操作条件栏，也适合做“可搜索 + 多选”的后台字段组件。",
    "在 Core 与组件加载前设置 componentPresets.ui='semantic'，并配置 surface、surface-muted、text、text-muted、border、accent、focus 七个 theme.semantic 角色；缺省 legacy 保留原配色。",
    "预设模式在组件脚本首次求值时确定；运行中使用 .dark/.light、系统主题或 JquanUI.setTheme() 更新角色，颜色变化不重建 DOM。需要支持 CSS color-mix() 的浏览器；阴影保持固定。",
    "触发器继承所在容器的主题，面板固定挂载 body，继承 body/root 的主题，不复制触发器局部 .dark 或变量。上限 warning 保留固定琥珀色。Select 与 Modal 已消费 OverlayManager；共享 Escape、层级和焦点恢复，Select 不锁滚动、不强制焦点圈闭。",
    "手动 script 引入时，Core 后先加载 overlayManager.js，再加载 select.js；导入器和聚合入口自动满足顺序。相同原生节点的 mount/get 返回同一句柄；destroy 后旧句柄失效，不能操作同 id 的新实例。",
    "remoteMethod(query, handle, {signal, requestId}) 返回选项数组或 Promise。新输入立即取消旧请求，等待 searchDebounce 后发起新请求；仅当前实例的最新结果生效。即使请求忽略 AbortSignal，旧结果也被丢弃。signal 在缺少 AbortController 时为 null。",
    "search(query) 返回 boolean 并立即搜索，不等待 debounce。state().loading 仅表示请求执行中，requestId 在取消/查询时递增。错误保留上一组选项，不额外抛出或派发错误事件；业务如需提示，应在 remoteMethod 内处理。",
    "close/update/destroy 均取消挂起和排队的搜索；销毁移除 body 面板并恢复原生 select 的显示状态与当前值。远程选中项补入原生 option；同表单的原生提交仍可读取值。",
    "触发器暴露 combobox，面板为 dialog，内部 listbox/option 同步选中与活动项。方向键/Home/End 跳过禁用项，Enter 选中，Escape 由共享栈处理；非搜索模式同样支持键盘。ARIA 自动化断言不代替读屏器人工验收。",
    "Review Mode 0.8 只适配已挂载的原生 select：使用 selectApi.get() 的稳定句柄读取 disabled/searchable/clearable，并通过三个公开 setter 修改；不会自动 import、mount 或调用 update，不重建选项和值。",
    "Select 1.5 新增 control()；Review Mode 0.9 可点击可见触发按钮/内部文字或聚焦后 Enter，将审查选中映射到原生 select 并在可见按钮显示高亮。两节点均须在审查 root 内，配置记录始终绑定原生节点；navigate 仍按实际 DOM，wrapper 与 body 浮层不映射。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<select jq-select data-placeholder=\"选择技术栈\">\n  <option value=\"\">请选择</option>\n  <option value=\"vue\">Vue</option>\n  <option value=\"react\">React</option>\n  <option value=\"svelte\">Svelte</option>\n</select>\n\n<select id=\"demo-select\" jq-select multiple data-select-max=\"3\" data-select-max-text=\"最多只能选择 3 项\" data-helper-text=\"支持搜索与多选\" data-placeholder=\"选择最多 3 项\">\n  <option value=\"docs\">Docs</option>\n  <option value=\"dashboard\">Dashboard</option>\n  <option value=\"table\">Table</option>\n</select>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const select = JquanUIComponents.selectApi.mount('#demo-select', {\n  multiple: true,\n  searchable: true,\n  maxSelections: 3,\n  helperText: '支持搜索与多选',\n  maxSelectionsText: '最多只能选择 3 项'\n});\n\nselect.open();\nselect.select('docs');\nselect.setValue(['docs', 'dashboard']);",
      "preview": false
    },
    {
      "id": "semantic-minimum",
      "title": "语义主题 + Select / NumberInput 最小完整组合",
      "language": "html",
      "code": "<!doctype html>\n<html class=\"light\" lang=\"zh-CN\">\n<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<script>\nwindow.JQUAN_CONFIG = {\n  componentPresets: { ui: 'semantic' },\n  theme: { semantic: {\n  \"surface\": {\n    \"light\": \"white\",\n    \"dark\": \"slate-900\"\n  },\n  \"surface-muted\": {\n    \"light\": \"slate-50\",\n    \"dark\": \"slate-800\"\n  },\n  \"text\": {\n    \"light\": \"slate-700\",\n    \"dark\": \"slate-100\"\n  },\n  \"text-muted\": {\n    \"light\": \"slate-500\",\n    \"dark\": \"slate-400\"\n  },\n  \"border\": {\n    \"light\": \"slate-200\",\n    \"dark\": \"slate-700\"\n  },\n  \"accent\": {\n    \"light\": \"blue-600\",\n    \"dark\": \"blue-400\"\n  },\n  \"focus\": {\n    \"light\": \"blue-200\",\n    \"dark\": \"blue-500\"\n  }\n} }\n};\n</script>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body>\n<button id=\"mode\" type=\"button\">切换明暗</button>\n<section id=\"scope\">\n  <label for=\"flavor\">口味</label>\n  <select id=\"flavor\" multiple><option value=\"milk\" selected>牛奶</option><option value=\"tea\">茶</option><option value=\"coffee\" disabled>咖啡</option></select>\n  <label for=\"quantity\">数量</label>\n  <input id=\"quantity\" type=\"number\" min=\"0\" max=\"20\" step=\"1\" value=\"2\" data-number-quick-steps=\"-5,5\">\n</section>\n<script>\nwindow.inputsReady = (async () => {\n  // 命令式挂载使用 install:false，避免再安装声明式 behavior。\n  const [selectApi, numberInputApi] = await JquanUI.import(['select', 'numberInput'], { install: false });\n  const select = selectApi.mount('#flavor', { multiple: true, closeOnSelect: false, helperText: '支持多选' });\n  const number = numberInputApi.mount('#quantity', { largeStep: 5 });\n  const button = document.querySelector('#mode');\n  const toggle = () => {\n    const dark = document.documentElement.classList.toggle('dark');\n    document.documentElement.classList.toggle('light', !dark);\n  };\n  button.addEventListener('click', toggle);\n  window.inputDemo = { select, number };\n  // 视图卸载时调用；原生字段和值保留，Select 的 body 面板会移除。\n  window.disposeInputs = () => { button.removeEventListener('click', toggle); select.destroy(); number.destroy(); };\n  return true;\n})();\n</script>\n</body></html>",
      "preview": false
    },
    {
      "id": "remote-api",
      "title": "可运行远程搜索生命周期（在已加载 Core 的页面执行）",
      "language": "javascript",
      "preview": false,
      "code": "const selectApi = await JquanUI.import('select', { install: false });\nconst source = document.createElement('select');\nsource.setAttribute('aria-label', '远程口味');\ndocument.body.append(source);\nconst catalog = [{ value: 'milk', label: 'Milk' }, { value: 'tea', label: 'Tea' }];\nconst select = selectApi.mount(source, {\n  searchDebounce: 120,\n  async remoteMethod(query, handle, { signal, requestId }) {\n    // 可替换为 fetch(url, { signal }).then(response => response.json())。\n    await new Promise(resolve => setTimeout(resolve, 80));\n    if (signal?.aborted) return [];\n    return catalog.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));\n  }\n});\nselect.open();\nselect.search('milk'); // true；异步结果通过 state()/面板观察\nconst dispose = () => { select.destroy(); source.remove(); };\n// 页面卸载时调用 dispose()；旧句柄不会影响以后挂载的新实例。"
    },
    {
      "id": "visible-control",
      "title": "读取已有控件并用于审查",
      "language": "javascript",
      "preview": false,
      "code": "const select = await JquanUI.import('select', { install: false });\nconst handle = select.mount('#delivery');\nconst review = await JquanUI.import('reviewMode');\nreview.configure({ enabled: true, root: '#preview', allowURL: false });\nreview.open();\nreview.select(handle.control()); // 选中原生字段，高亮现有可见按钮\nreview.setComponentOption('select', 'clearable', false);\n// 离开时 review.destroy()；业务视图卸载再 handle.destroy()。"
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
      "signature": "JquanUIComponents.selectApi.mount(target, options?)",
      "returns": "实例句柄；destroy() 移除增强层并保留原生字段与当前值。",
      "options": [
        [
          "multiple",
          "boolean",
          "source.multiple",
          "多选模式"
        ],
        [
          "searchable",
          "boolean",
          "true",
          "显示搜索框"
        ],
        [
          "closeOnSelect",
          "boolean",
          "true",
          "单选后关闭；多选保持打开"
        ],
        [
          "helperText",
          "string",
          "''",
          "面板底部说明"
        ]
      ]
    },
    "remote": {
      "signature": "remoteMethod(query, handle, context) => SelectOption[] | Promise<SelectOption[]>",
      "options": [
        [
          "context.signal",
          "AbortSignal|null",
          "每请求生成",
          "取消为协作信号；过期结果始终拦截"
        ],
        [
          "context.requestId",
          "number",
          "单调递增",
          "属于当前实例的查询版本；不保证连续发出请求"
        ],
        [
          "searchDebounce",
          "number",
          "120",
          "用户输入防抖毫秒；search() 立即执行"
        ]
      ],
      "returns": "有效数组更新候选；结果按服务端返回展示。选中值仍独立保留。"
    },
    "lifecycle": {
      "signature": "mount / get / element / control / state / update / destroy",
      "returns": "同一存活实例的句柄稳定；element() 返回原生 select，销毁后 null；state() 返回 open/multiple/values/search/filteredCount/requestId/loading/destroyed:false 与 disabled/searchable/clearable，销毁后 null；旧句柄的操作返回 false/null。 control() 返回稳定的 HTMLButtonElement，销毁后 null；不得用于旧实例重挂后的操作。"
    },
    "behaviorSetters": {
      "signature": "setDisabled(value: boolean) / setSearchable(value: boolean) / setClearable(value: boolean): boolean",
      "options": [
        [
          "value",
          "boolean",
          "必填",
          "只接受布尔值；禁用会关闭已打开面板并同步原生 disabled"
        ]
      ],
      "returns": "存活实例修改对应选项并派发原生 select 上的 jquan:select:update，返回 true；类型错误或已销毁返回 false。保留原生 option 与选中值；setSearchable 只切换搜索入口，不清空既有搜索或取消程序化搜索。"
    }
  }
};
