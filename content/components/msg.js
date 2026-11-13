// JquanUI component documentation: msg
export default {
  "id": "msg",
  "title": "Msg",
  "chinese": "消息提示",
  "category": "反馈与浮层",
  "version": "1.2.0",
  "file": "dist/components/msg.js",
  "api": "JquanUIComponents.msgApi",
  "summary": "和 toast 类似，但视觉更轻、更像全局消息系统。",
  "install": "JquanUI.use(JquanUIComponents.msg);",
  "declarative": "const msg = JquanUIComponents.msgApi;\nconst handle = msg.success('同步完成');\n\nsetTimeout(() => handle.update({\n  content: '远程数据已经刷新',\n  description: '消息会按默认 duration 自动关闭'\n}), 300);",
  "imperative": "const task = fetch('/api/sync');\nconst result = JquanUIComponents.msgApi.promise(task, {\n  loading: { content: '同步中' },\n  success: { content: '同步完成' },\n  error: { content: '同步失败', description: '请稍后重试' }\n});\n\nresult.catch(error => console.error(error));",
  "attrs": [],
  "methods": [
    [
      "`show(input) / info(input) / success(input) / warning(input) / error(input)`",
      "显示消息；input 可以是字符串或选项对象"
    ],
    [
      "`loading(options)`",
      "显示不会自动关闭的加载消息"
    ],
    [
      "`update(id, options) / close(id) / closeAll(placement?)`",
      "更新或关闭消息"
    ],
    [
      "`config(options) / promise(promiseLike, states)`",
      "设置全局默认值，或绑定异步状态"
    ]
  ],
  "notes": [
    "Msg 是轻量、短时的系统消息，内容字段使用 content；show() 返回 { id, close(), update() }。promise() 会更新同一条 loading 消息，并将原 Promise 的成功值或异常继续向外传递。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "quick-start",
      "title": "快速调用",
      "language": "javascript",
      "code": "const msg = JquanUIComponents.msgApi;\nconst handle = msg.success('同步完成');\n\nsetTimeout(() => handle.update({\n  content: '远程数据已经刷新',\n  description: '消息会按默认 duration 自动关闭'\n}), 300);",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const task = fetch('/api/sync');\nconst result = JquanUIComponents.msgApi.promise(task, {\n  loading: { content: '同步中' },\n  success: { content: '同步完成' },\n  error: { content: '同步失败', description: '请稍后重试' }\n});\n\nresult.catch(error => console.error(error));",
      "preview": false
    }
  ]
};
