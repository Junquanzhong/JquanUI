// JquanUI component documentation: dom
export default {
  "id": "dom",
  "title": "DOM",
  "chinese": "DOM 工具集",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/dom.js",
  "api": "JquanUIComponents.domApi / window.JquanDOM",
  "summary": "一个很完整的 DOM 助手层，覆盖查询、创建、插入、事件、观察器和常见节点操作。",
  "install": "JquanUI.use(JquanUIComponents.dom);",
  "declarative": "JquanDOM.ready(() => {\n  const el = JquanDOM.create('div', {\n    className: 'rounded-lg border border-slate-200 p-4 text-sm',\n    text: 'Hello JquanUI',\n    attrs: { 'data-source': 'JquanDOM' }\n  });\n  JquanDOM.append('#root', el);\n});",
  "imperative": "const card = JquanDOM.query('[data-card]');\nconst handler = () => JquanDOM.toggleClass(card, 'bg-primary/10');\nJquanDOM.on(card, 'click', handler);\n\nJquanDOM.attr(card, 'aria-live', 'polite');\nJquanDOM.text(card, '已绑定 click 事件');\n// 页面销毁时：\nJquanDOM.off(card, 'click', handler);",
  "attrs": [],
  "methods": [
    ["`query(selector, root?) / queryAll(selector, root?)`", "查询单个或多个节点"],
    ["`resolveRoot(root?) / resolveTargets(target, root?)`", "统一解析选择器、节点和节点集合"],
    ["`create(tagName, options?) / build(html)`", "创建节点；build 返回片段的首个根元素"],
    ["`append / prepend / before / after / remove / empty`", "插入、移动、删除和清空内容"],
    ["`html / text / val`", "读写 HTML、文本和值"],
    ["`attr / removeAttr / data / css`", "读写属性、dataset 和运行时样式"],
    ["`addClass / removeClass / toggleClass / hasClass`", "读写原子类和状态类"],
    ["`show / hide / toggle`", "保留原显示值的显隐控制"],
    ["`parent / children / closest / next / prev`", "节点关系查询"],
    ["`on / off / once / delegate / trigger`", "事件绑定、代理和 CustomEvent 触发"],
    ["`ready(callback)`", "在 DOM 可用时执行一次"],
    ["`serializeForm(form)`", "将表单控件转成普通对象，重复字段转为数组"],
    ["`observeMutation / observeResize / observeIntersection`", "创建对应原生观察器，返回 observer 句柄"],
    ["`debounce(fn, wait, immediate) / throttle(fn, wait)`", "生成节流与防抖函数"]
  ],
  "notes": [
    "目标可以是选择器、Element、NodeList 或数组；写入方法通常返回目标，查询方法返回节点或数组。静态布局仍优先使用 JquanUI 原子类，不要用 css() 替代页面样式。观察器和事件绑定在页面卸载时分别调用 disconnect() 与 off()。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "ready-create",
      "title": "初始化与创建节点",
      "language": "javascript",
      "code": "JquanDOM.ready(() => {\n  const el = JquanDOM.create('div', {\n    className: 'rounded-lg border border-slate-200 p-4 text-sm',\n    text: 'Hello JquanUI',\n    attrs: { 'data-source': 'JquanDOM' }\n  });\n  JquanDOM.append('#root', el);\n});",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const card = JquanDOM.query('[data-card]');\nconst handler = () => JquanDOM.toggleClass(card, 'bg-primary/10');\nJquanDOM.on(card, 'click', handler);\n\nJquanDOM.attr(card, 'aria-live', 'polite');\nJquanDOM.text(card, '已绑定 click 事件');\n// 页面销毁时：\nJquanDOM.off(card, 'click', handler);",
      "preview": false
    }
  ]
};
