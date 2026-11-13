// JquanUI component documentation: toast
export default {
  "id": "toast",
  "title": "Toast",
  "chinese": "通知条",
  "category": "反馈与浮层",
  "version": "1.2.0",
  "file": "dist/components/toast.js",
  "api": "JquanUIComponents.toastApi",
  "summary": "适合偏“操作反馈”的短通知，有 info/success/warning/error/loading/promise。 ",
  "install": "JquanUI.use(JquanUIComponents.toast);",
  "declarative": "const toast = JquanUIComponents.toastApi;\nconst handle = toast.success({\n  title: '保存成功',\n  description: '配置已更新'\n});\n\nsetTimeout(() => handle.close(), 1200);",
  "imperative": "const request = fetch('/api/save');\nconst result = JquanUIComponents.toastApi.promise(request, {\n  loading: { title: '提交中' },\n  success: { title: '已完成' },\n  error: { title: '失败', description: '请检查网络后重试' }\n});\n\nresult.catch(error => console.error(error));",
  "attrs": [],
  "methods": [
    [
      "`show(input) / info(input) / success(input) / warning(input) / error(input)`",
      "显示 Toast；input 可以是标题字符串或选项对象"
    ],
    [
      "`loading(options)`",
      "显示不会自动关闭的加载 Toast"
    ],
    [
      "`update(id, options) / close(id) / closeAll(placement?)`",
      "更新或关闭指定通知"
    ],
    [
      "`config(options) / promise(promiseLike, states)`",
      "设置默认配置，或把异步流程映射为 loading/success/error"
    ]
  ],
  "notes": [
    "Toast 是卡片式操作反馈，使用 title/description；Msg 是更轻量的系统消息，使用 content。show() 与 loading() 返回 { id, close(), update() }；promise() 保留原 Promise 的返回值和异常。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "quick-start",
      "title": "快速调用",
      "language": "javascript",
      "code": "const toast = JquanUIComponents.toastApi;\nconst handle = toast.success({\n  title: '保存成功',\n  description: '配置已更新'\n});\n\nsetTimeout(() => handle.close(), 1200);",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const request = fetch('/api/save');\nconst result = JquanUIComponents.toastApi.promise(request, {\n  loading: { title: '提交中' },\n  success: { title: '已完成' },\n  error: { title: '失败', description: '请检查网络后重试' }\n});\n\nresult.catch(error => console.error(error));",
      "preview": false
    }
  ]
};
