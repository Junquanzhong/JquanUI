// JquanUI component documentation: template
export default {
  "id": "template",
  "title": "Template",
  "chinese": "模板引擎",
  "category": "浏览器工具",
  "version": "1.4.0",
  "file": "dist/components/template.js",
  "api": "JquanUIComponents.templateApi",
  "summary": "面向 CMS、后台工作台和配置驱动视图的模板引擎，覆盖变量、循环、条件、include、布局/插槽、缓存、异步片段、安全模式、SSR 字符串渲染与调试链路。",
  "install": "JquanUI.use(JquanUIComponents.template);",
  "declarative": "<script type=\"text/jq-template\" id=\"tpl-card-list\">\n  <section class=\"grid gap-3\">\n    {% if title %}\n      <header class=\"flex items-center justify-between gap-3\">\n        <h3 class=\"text-lg font-semibold text-slate-900\">{{ title }}</h3>\n        <span class=\"text-sm text-slate-500\">{{ items | length }} items</span>\n      </header>\n    {% endif %}\n    <div class=\"grid gap-3 md:grid-cols-2\">\n      {% for item in items %}\n        {% include 'tpl-card-item' with { item: item } %}\n      {% endfor %}\n    </div>\n  </section>\n</script>\n\n<template id=\"tpl-card-item\">\n  <article class=\"rounded-2xl border border-slate-200 bg-white p-4\">\n    <div class=\"flex items-start justify-between gap-3\">\n      <div>\n        <div class=\"font-semibold text-slate-900\">{{ item.name }}</div>\n        <div class=\"mt-1 text-sm text-slate-500\">{{ item.desc }}</div>\n      </div>\n      {% if item.stable %}\n        <span class=\"inline-flex rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600\">Stable</span>\n      {% else %}\n        <span class=\"inline-flex rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600\">Beta</span>\n      {% endif %}\n    </div>\n  </article>\n</template>\n\n<div jq-template=\"tpl-card-list\" data-jq-template-data='{\"title\":\"组件清单\",\"items\":[]}'></div>",
  "imperative": "JquanUIComponents.templateApi.registerFilter('badge', value =>\n  value ? 'Stable' : 'Beta'\n);\n\nconst html = JquanUIComponents.templateApi.render(`\n  {% for item in items %}\n    <div>{{ item.name | upper }}</div>\n  {% endfor %}\n`, {\n  items: [{ name: 'modal' }, { name: 'table' }]\n});\n\nconst view = JquanUIComponents.templateApi.mount('#demo-template', {\n  template: '<h3>{{ title }}</h3>',\n  data: { title: 'JquanUI' }\n});\n\nview.update({\n  template: `\n    {% layout 'dashboard-layout' with { pageTitle: title } %}\n      {% slot 'body' %}\n        <div>{{ title }}</div>\n      {% endslot %}\n    {% endlayout %}\n  `\n});\nview.patch({ title: 'JquanUI Template' });\nawait view.renderAsync();\nJquanUIComponents.templateApi.clearCache();",
  "attrs": [
    [
      "`jq-template` / `data-jq-template`",
      "声明式挂载点或模板源引用"
    ],
    [
      "`data-jq-template-source`",
      "从 script/template/其他节点读取模板内容"
    ],
    [
      "`data-jq-template-data`",
      "JSON 格式初始数据"
    ],
    [
      "`data-jq-template-mode`",
      "`replace` / `append`"
    ],
    [
      "`data-jq-template-sanitize`",
      "是否对渲染结果做基础净化"
    ],
    [
      "`safeExpressions`",
      "开启后拦截危险表达式能力"
    ]
  ],
  "methods": [
    [
      "`render(template, data, options)`",
      "同步渲染模板字符串；`cacheLimit` 控制编译缓存上限，不会加载外部 include 文件"
    ],
    [
      "`renderAsync(template, data, options)`",
      "异步渲染模板字符串或异步模板源；可加载外部 include，并支持同一编译缓存策略"
    ],
    [
      "`compile(template)`",
      "编译模板为 AST"
    ],
    [
      "`ast(template)`",
      "输出模板 AST，便于调试模板结构"
    ],
    [
      "`renderToString / renderToStringAsync`",
      "SSR/预渲染语义别名；分别对应同步和异步字符串渲染"
    ],
    [
      "`mount / mountAsync`",
      "挂载声明式或命令式模板实例；异步外部模板使用 `mountAsync`"
    ],
    [
      "`patch / setData / update / render / renderAsync`",
      "更新数据、模板或手动重渲染；更新模板后显式调用 `render()` 或 `renderAsync()`"
    ],
    [
      "`registerTemplate / unregisterTemplate`",
      "注册或移除全局模板片段"
    ],
    [
      "`registerFilter / unregisterFilter`",
      "注册或移除过滤器"
    ],
    [
      "`clearCache / cacheSize`",
      "清空或读取编译缓存"
    ],
    [
      "`dependencies(template)`",
      "提取 include / layout 依赖图"
    ],
    [
      "`dependencyGraph(name)`",
      "递归分析外部模板依赖、动态依赖和循环链"
    ],
    [
      "`useLoader / createFileLoader`",
      "注册外部 HTML 模板加载器；支持 `maxEntries`、`ttl`、`version`，默认限制父级路径和远程 URL"
    ],
    [
      "`preload(names)`",
      "预加载并缓存公共模板文件"
    ],
    [
      "`clearTemplateCache / templateCacheSize / inspect / inspectTemplate`",
      "管理和诊断外部模板缓存"
    ],
    [
      "`invalidate(name) / refresh(name)`",
      "开发态失效模板缓存，并可重新渲染全部已挂载实例"
    ],
    [
      "`safeExpressions`",
      "限制表达式访问危险全局对象或构造能力"
    ],
    [
      "`state()`",
      "读取当前模板、数据、错误与渲染结果"
    ]
  ],
  "notes": [
    "适合 CMS 栏目块、卡片列表、邮件模板、运营位、文档片段和后台配置驱动 UI。它不是纯展示模板，而是偏后台与内容系统的拼装引擎。开启 safeExpressions 后更适合多角色配置场景。",
    "静态多页站优先在构建期使用 `jquan-extract --render-html` 展开 include；浏览器运行时只在确实需要动态数据或热更新时使用外部 loader。",
    "模板挂载句柄必须在页面卸载时调用 `destroy()`；`mount()` 是同步注册，`mountAsync()` 才会等待外部模板加载。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<script type=\"text/jq-template\" id=\"tpl-card-list\">\n  <section class=\"grid gap-3\">\n    {% if title %}\n      <header class=\"flex items-center justify-between gap-3\">\n        <h3 class=\"text-lg font-semibold text-slate-900\">{{ title }}</h3>\n        <span class=\"text-sm text-slate-500\">{{ items | length }} items</span>\n      </header>\n    {% endif %}\n    <div class=\"grid gap-3 md:grid-cols-2\">\n      {% for item in items %}\n        {% include 'tpl-card-item' with { item: item } %}\n      {% endfor %}\n    </div>\n  </section>\n</script>\n\n<template id=\"tpl-card-item\">\n  <article class=\"rounded-2xl border border-slate-200 bg-white p-4\">\n    <div class=\"flex items-start justify-between gap-3\">\n      <div>\n        <div class=\"font-semibold text-slate-900\">{{ item.name }}</div>\n        <div class=\"mt-1 text-sm text-slate-500\">{{ item.desc }}</div>\n      </div>\n      {% if item.stable %}\n        <span class=\"inline-flex rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600\">Stable</span>\n      {% else %}\n        <span class=\"inline-flex rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600\">Beta</span>\n      {% endif %}\n    </div>\n  </article>\n</template>\n\n<div jq-template=\"tpl-card-list\" data-jq-template-data='{\"title\":\"组件清单\",\"items\":[]}'></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "JquanUIComponents.templateApi.registerFilter('badge', value =>\n  value ? 'Stable' : 'Beta'\n);\n\nconst html = JquanUIComponents.templateApi.render(`\n  {% for item in items %}\n    <div>{{ item.name | upper }}</div>\n  {% endfor %}\n`, {\n  items: [{ name: 'modal' }, { name: 'table' }]\n});\n\nconst view = JquanUIComponents.templateApi.mount('#demo-template', {\n  template: '<h3>{{ title }}</h3>',\n  data: { title: 'JquanUI' }\n});\n\nview.update({\n  template: `\n    {% layout 'dashboard-layout' with { pageTitle: title } %}\n      {% slot 'body' %}\n        <div>{{ title }}</div>\n      {% endslot %}\n    {% endlayout %}\n  `\n});\nview.patch({ title: 'JquanUI Template' });\nawait view.renderAsync();\nJquanUIComponents.templateApi.clearCache();",
      "preview": false
    }
  ]
};
