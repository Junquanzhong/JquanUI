// JquanUI component documentation: i18n
export default {
  "id": "i18n",
  "title": "i18n",
  "chinese": "国际化",
  "category": "网络与集成",
  "version": "1.1.0",
  "file": "dist/components/i18n.js",
  "api": "JquanUIComponents.i18nApi",
  "summary": "面向原生 HTML 的国际化引擎，支持语言检测、嵌套或平铺消息 key、命名空间、插值、复数、Intl 格式化、异步语言包、DOM 翻译和 RTL。",
  "install": "JquanUI.use(JquanUIComponents.i18n);",
  "declarative": "<p data-i18n=\"greeting\">欢迎</p>\n<input data-i18n-placeholder=\"search\" aria-label=\"Search\">\n<button type=\"button\" data-i18n-switcher=\"en-US\">English</button>",
  "imperative": "const api = JquanUIComponents.i18nApi;\napi.registerMessages({\n  'zh-CN': { greeting: '你好，{{name}}', items: { one: '{{count}} 项', other: '{{count}} 项' }, itemCount: '共 {{value}} 项' },\n  'en-US': { greeting: 'Hello, {{name}}', items: { one: '{{count}} item', other: '{{count}} items' }, itemCount: '{{value}} items total' }\n});\n\nawait api.init({\n  locale: 'zh-CN', fallbackLocale: 'en-US',\n  detectOrder: ['default'], persist: false, autoObserve: false\n});\napi.t('greeting', { name: 'Ada' });\napi.t('items', { count: 2 }); // 复数：通过 count 选择 one/other\napi.tn('itemCount', 1234);   // 数字格式化：插入 {{value}}\napi.formatValue(12345.67, { type: 'number' });",
  "attrs": [
    [
      "`data-i18n` / `data-i18n-key`",
      "翻译元素文本；`data-i18n-target=\"html\"` 或 `data-i18n-html` 才会写入 HTML。"
    ],
    [
      "`data-i18n-params`",
      "JSON 格式插值参数，例如 `{\"name\":\"Ada\"}`。"
    ],
    [
      "`data-i18n-placeholder` / `data-i18n-title`",
      "翻译原生 placeholder / title 属性；控件值使用 `data-i18n=\"key\" data-i18n-target=\"value\"`。"
    ],
    [
      "`data-i18n-attr`",
      "用 `title:common.title;aria-label:common.label` 批量绑定属性。"
    ],
    [
      "`data-i18n-switcher`",
      "点击后切换到指定 locale，并自动更新 `aria-pressed`。"
    ],
    [
      "`data-i18n-namespace`",
      "为单个节点指定消息命名空间。"
    ]
  ],
  "methods": [
    [
      "`init(options) / config(options) / state()`",
      "初始化检测、持久化、文档同步和状态读取。`init()` 返回 Promise。"
    ],
    [
      "`setLocale / getLocale`",
      "切换或读取当前语言；切换会翻译文档并更新 `<html lang>` 与 `dir`。"
    ],
    [
      "`registerLocale / registerMessages`",
      "注册单语言或多语言资源；资源按 namespace 合并。`registerMessages(payload, { nested: true })` 显式读取 `locale → namespace → key`。"
    ],
    [
      "`loadLocale(locale, options)`",
      "通过 `loader` 或 `localesPath` 异步加载语言包，支持 namespace。"
    ],
    [
      "`has / t / format`",
      "查询消息、翻译插值文本；缺失 key 默认返回 key，可配置 `missingKey`。"
    ],
    [
      "`tn / td / tc`",
      "数字、日期和货币便捷格式化翻译入口；复数使用 `t(key, { count })`。"
    ],
    [
      "`formatValue(value, options)`",
      "使用 Intl 格式化 number、currency、date、relativeTime 和 list。"
    ],
    [
      "`scope(namespace, options)`",
      "创建带默认 namespace 的轻量翻译作用域。"
    ],
    [
      "`translate / bindSwitchers / observe / disconnect`",
      "翻译指定根节点、绑定切换器、观察动态节点并清理观察器。"
    ],
    [
      "`on('change', handler) / off`",
      "监听语言切换；`on` 返回取消监听函数。"
    ]
  ],
  "schema": {
    "init": {
      "signature": "init(options): Promise<I18nEngine>",
      "options": [
        [
          "locale",
          "string",
          "'zh-CN'",
          "默认候选语言；detectOrder 决定 URL、持久化等来源的优先级。"
        ],
        [
          "fallbackLocale",
          "string",
          "'en'",
          "当前语言缺 key 时的单个回退语言。"
        ],
        [
          "defaultNamespace / fallbackNamespaces",
          "string / string[]",
          "'common' / ['common']",
          "默认 namespace 与额外查找 namespace。"
        ],
        [
          "persist / storageKey / storageDriver",
          "boolean / string / string",
          "true / 'jquanui:locale' / 'local'",
          "保存用户语言；需先引入 localStorage 组件，或 Storage 门面及对应 driver。"
        ],
        [
          "detectOrder",
          "string[]",
          "['url','storage','html','navigator','default']",
          "固定测试使用 ['default']；保留选择可使用 ['storage','default']。"
        ],
        [
          "autoLoad",
          "boolean",
          "false",
          "开启后 init/setLocale 等待 loader 或 localesPath 语言包。"
        ],
        [
          "autoObserve / observeDebounce",
          "boolean / number",
          "true / 32",
          "默认监听 body 的新增子树；明确管理局部观察器时设 autoObserve:false。"
        ],
        [
          "syncDocument",
          "boolean",
          "true",
          "同步 <html lang> 和 dir。"
        ]
      ],
      "returns": "Promise<I18nEngine>；首次初始化完成后返回引擎实例。重复 init 只合并配置，不执行切换或重新翻译；日常使用 setLocale。"
    },
    "setLocale": {
      "signature": "setLocale(locale, options): Promise<string>",
      "options": [
        [
          "previousLocale",
          "string|null",
          "当前语言",
          "用于 change 事件的旧语言。"
        ],
        [
          "reason",
          "string",
          "'manual'",
          "change 事件中的切换原因。"
        ],
        [
          "silent",
          "boolean",
          "false",
          "是否关闭 debug 日志。"
        ]
      ],
      "returns": "切换完成后的 locale 字符串；会触发 `change` 事件。"
    },
    "translate": {
      "signature": "translate(root = document): true",
      "options": [
        [
          "root",
          "Document|Element",
          "document",
          "只翻译指定根节点；返回 `true`。"
        ]
      ],
      "returns": "API 门面返回 true；同步翻译根节点及后代，不绑定新增语言按钮。需要时另调 bindSwitchers(root)。"
    },
    "observe": {
      "signature": "observe(root = document.body): true",
      "options": [
        [
          "root",
          "Document|Element",
          "document.body",
          "监听动态插入节点并增量翻译。"
        ]
      ],
      "returns": "API 门面返回 true；替换旧观察器，只处理后续新增子树，不重译已有节点或监听属性变化。disconnect() 清除观察器、队列和计时器。"
    },
    "registerMessages": {
      "signature": "registerMessages(payload, options = {}): I18nEngine",
      "options": [
        [
          "payload",
          "Record<locale, messages>",
          "必填",
          "语言码为第一层，资源形状见下方三种组织方式。"
        ],
        [
          "namespace",
          "string",
          "defaultNamespace",
          "指定后整个语言资源注册到该 namespace，不自动拆分。"
        ],
        [
          "nested",
          "boolean",
          "自动识别",
          "true 将全部对象子项作为 namespace；false 保留原始嵌套消息。"
        ],
        [
          "replace",
          "boolean",
          "false",
          "true 替换对应 namespace；默认深度合并。"
        ]
      ],
      "returns": "引擎实例；注册不触发 DOM 翻译，已有页面需调用 translate(root) 或 setLocale(locale)。"
    }
  },
  "notes": [
    "语言包组织有三种等价入口：① registerMessages({ locale: { greeting: 文本 } }) 放入默认 common；② registerMessages({ locale: { common: {...}, account: {...} } }, { nested:true }) 显式拆成 namespace；③ registerLocale(locale, messages, { namespace: 'account' }) 按模块注册。common.greeting 是 namespace + key，common.menu.file 继续按点路径查找嵌套对象，也支持同名的字面点号 key。",
    "自动 namespace 识别仅在所有顶层值都是对象，且至少有 defaultNamespace/fallbackNamespaces 中的名称时触发。非 common 业务 namespace 推荐显式 nested:true；普通嵌套对象使用 nested:false 或显式 namespace，避免命名歧义。",
    "生命周期：先引入组件并注册消息，再 await init() 一次；日常切换 await setLocale(nextLocale)。默认检测顺序是 URL、存储、<html lang>、浏览器、默认语言；locale 不是无条件覆盖其他来源。固定首屏用 detectOrder:['default']，保留用户选择用 ['storage','default']。",
    "persist:true 依赖已引入的 localStorageApi，或 Storage 门面及其 driver；i18n 本身不直接读写浏览器存储。纯演示/测试使用 persist:false。",
    "setLocale() 始终重新翻译 document。observe(root) 只减少新增节点时的扫描范围，不改变语言切换的全量行为；大型页面可把一次内容更新交给 translate(root)，当前没有局部 setLocale 选项。",
    "autoObserve 默认 true：init 会观察 body。要手动管理局部根，init 时设 autoObserve:false；observe(root) 会替换旧观察器，只监听 childList/subtree，不监听 data-i18n 或参数属性变化，也不立即翻译已有内容。先 translate(root)，再 observe(root)，属性更新后显式 translate(root)。无观察器时新增切换按钮另调 bindSwitchers(root)。",
    "结构化句子优先拆成多个叶子 data-i18n，保留 b/span/a 等原始语义；不要给包含这些后代的父节点再加文本 key。确需整句 HTML 时，使用 data-i18n=\"key\" data-i18n-html：单独 data-i18n-html=\"key\" 不会被文本扫描器发现。",
    "HTML 模式直接写入 innerHTML，没有内置标签或 key 白名单；data-i18n-html 还会关闭插值转义。应用应只为预先审核的静态语言包 key 开放 HTML，并在输入边界净化资源；不要把外部参数拼入 HTML 翻译。data-i18n-target=\"html\" 保留参数转义，但也不会净化语言包中的标签。",
    "复数使用 t(key, { count })，由 Intl.PluralRules 选择 one/other 等分支。tn/td/tc 是数字/日期/货币格式化后插入 {{value}}；它们不会自动提供 count。数据列表只保存业务数据与 key，渲染后设置 data-i18n-params，再 translate(root)。",
    "视图卸载时调用 disconnect() 停止观察并取消待执行增量翻译；on('change', handler) 返回的取消函数需单独调用。disconnect 不撤回已翻译文本，也不移除已绑定的切换按钮事件。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式翻译",
      "language": "html",
      "code": "<p data-i18n=\"greeting\">欢迎</p>\n<input data-i18n-placeholder=\"search\" aria-label=\"Search\">\n<button type=\"button\" data-i18n-switcher=\"en-US\">English</button>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "消息、复数与 Intl",
      "language": "javascript",
      "code": "const api = JquanUIComponents.i18nApi;\napi.registerMessages({\n  'zh-CN': { greeting: '你好，{{name}}', items: { one: '{{count}} 项', other: '{{count}} 项' }, itemCount: '共 {{value}} 项' },\n  'en-US': { greeting: 'Hello, {{name}}', items: { one: '{{count}} item', other: '{{count}} items' }, itemCount: '{{value}} items total' }\n});\n\nawait api.init({\n  locale: 'zh-CN', fallbackLocale: 'en-US',\n  detectOrder: ['default'], persist: false, autoObserve: false\n});\napi.t('greeting', { name: 'Ada' });\napi.t('items', { count: 2 }); // 复数：通过 count 选择 one/other\napi.tn('itemCount', 1234);   // 数字格式化：插入 {{value}}\napi.formatValue(12345.67, { type: 'number' });",
      "preview": false
    },
    {
      "id": "lifecycle",
      "title": "最小完整页面：初始化、切换与持久化",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<meta charset=\"utf-8\">\n<title>i18n 最小示例</title>\n<body>\n  <h1 data-i18n=\"greeting\" data-i18n-params='{\"name\":\"Ada\"}'>欢迎</h1>\n  <button type=\"button\" data-locale=\"zh-CN\">中文</button>\n  <button type=\"button\" data-locale=\"en-US\">English</button>\n  <output id=\"locale-status\" aria-live=\"polite\"></output>\n  <script src=\"./js/JquanUI@core.min.js\"></script>\n  <script src=\"./dist/components/localStorage.js\"></script>\n  <script src=\"./dist/components/i18n.js\"></script>\n  <script type=\"module\">\n    JquanUI.use(JquanUIComponents.localStorage);\n    JquanUI.use(JquanUIComponents.i18n);\n    const api = JquanUIComponents.i18nApi;\n    api.registerMessages({\n      'zh-CN': { greeting: '你好，{{name}}' },\n      'en-US': { greeting: 'Hello, {{name}}' }\n    });\n    await api.init({ locale: 'zh-CN', fallbackLocale: 'en-US',\n      availableLocales: ['zh-CN', 'en-US'],\n      detectOrder: ['storage', 'default'], persist: true,\n      autoObserve: false, syncDocument: true });\n    const status = document.querySelector('#locale-status');\n    status.textContent = api.getLocale();\n    document.querySelectorAll('[data-locale]').forEach(button => {\n      button.addEventListener('click', async () => {\n        status.textContent = await api.setLocale(button.dataset.locale);\n      });\n    });\n  </script>\n</body>\n</html>"
    },
    {
      "id": "key-organization",
      "title": "三种消息组织方式：平铺、嵌套、单 namespace",
      "language": "javascript",
      "preview": false,
      "code": "const api = JquanUIComponents.i18nApi;\n// 1. locale -> key，默认写入 common namespace\napi.registerMessages({ 'zh-CN': { greeting: '你好' } });\napi.t('greeting', {}, { locale: 'zh-CN' }); // 你好\n\n// 2. locale -> namespace -> key，显式声明资源分层\napi.registerMessages({ 'zh-CN': {\n  common: { menu: { file: '文件' } }, account: { title: '账户' }\n} }, { nested: true });\napi.t('common.menu.file', {}, { locale: 'zh-CN' }); // 文件\napi.t('account.title', {}, { locale: 'zh-CN' });    // 账户\n\n// 3. 单语言、单 namespace；适合按模块加载\napi.registerLocale('en-US', { title: 'Account' }, { namespace: 'account' });\napi.t('title', {}, { locale: 'en-US', namespace: 'account' }); // Account\n// 等价节点：<h2 data-i18n=\"title\" data-i18n-namespace=\"account\"></h2>"
    },
    {
      "id": "dynamic-nodes",
      "title": "动态内容：一次翻译与持续观察",
      "language": "html-javascript",
      "preview": false,
      "code": "<ul id=\"messages\"></ul>\n<script type=\"module\">\n  const api = JquanUIComponents.i18nApi;\n  api.registerMessages({ 'zh-CN': { greeting: '你好，{{name}}' } });\n  await api.init({ locale: 'zh-CN', detectOrder: ['default'],\n    persist: false, autoObserve: false });\n  const list = document.querySelector('#messages');\n  function append(name) {\n    const item = document.createElement('li');\n    item.dataset.i18n = 'greeting';\n    item.dataset.i18nParams = JSON.stringify({ name });\n    list.append(item);\n    return item;\n  }\n  append('Ada');\n  api.translate(list); // 已有内容：同步局部翻译\n  api.observe(list);   // 未来新增节点：默认 32ms 合并翻译\n  const row = append('Grace');\n  row.dataset.i18nParams = JSON.stringify({ name: 'Lin' });\n  api.translate(row);  // 参数属性变化需显式翻译\n  // 路由卸载时：api.disconnect();\n</script>"
    },
    {
      "id": "structured-and-data-driven",
      "title": "保留结构与 HTML key 白名单",
      "language": "html-javascript",
      "preview": false,
      "code": "<p><b data-i18n=\"meal.time\"></b> <span data-i18n=\"meal.name\"></span></p>\n<p id=\"meal-markup\" data-i18n=\"meal.markup\" data-i18n-html></p>\n<script type=\"module\">\n  const api = JquanUIComponents.i18nApi;\n  api.registerMessages({ 'zh-CN': {\n    meal: { time: '早餐', name: '牛奶、动物饼干',\n      markup: '<b>早餐</b> <span>牛奶、动物饼干</span>' }\n  } });\n  // 应用明确审核过的静态 HTML key；这不是净化器。\n  const htmlKeys = new Set(['meal.markup']);\n  const key = 'meal.markup';\n  if (htmlKeys.has(key)) {\n    const node = document.querySelector('#meal-markup');\n    node.dataset.i18n = key;\n    node.setAttribute('data-i18n-html', '');\n  }\n  await api.init({ locale: 'zh-CN', detectOrder: ['default'],\n    persist: false, autoObserve: false });\n</script>"
    }
  ]
};
