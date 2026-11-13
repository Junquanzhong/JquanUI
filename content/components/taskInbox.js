// JquanUI component documentation: taskInbox
export default {
  "id": "taskInbox",
  "title": "TaskInbox",
  "chinese": "任务收件箱",
  "category": "数据展示",
  "version": "1.0.0",
  "file": "dist/components/taskInbox.js",
  "api": "JquanUIComponents.taskInboxApi",
  "summary": "用于展示待处理任务、提醒和跟进事项，适合后台工作台首页。",
  "install": "JquanUI.use(JquanUIComponents.taskInbox);",
  "declarative": "<section jq-task-inbox id=\"demo-task-inbox\"></section>",
  "imperative": "const inbox = JquanUIComponents.taskInboxApi.mount('#demo-task-inbox', { items });\ninbox.markDone('task-1');\ninbox.prepend({ title: 'Follow up' });",
  "attrs": [
    [
      "`jq-task-inbox`",
      "根节点"
    ],
    [
      "`items[].title / meta / description / status`",
      "任务字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载任务收件箱"
    ],
    [
      "`setItems(items)`",
      "替换任务列表"
    ],
    [
      "`markDone(taskId)`",
      "标记完成"
    ],
    [
      "`snooze(taskId)`",
      "稍后处理"
    ],
    [
      "`prepend(item) / state()`",
      "插入新任务和读取状态"
    ]
  ],
  "notes": [
    "适合内容待审、待发布、待处理工单和工作台待办。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-task-inbox id=\"demo-task-inbox\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const inbox = JquanUIComponents.taskInboxApi.mount('#demo-task-inbox', { items });\ninbox.markDone('task-1');\ninbox.prepend({ title: 'Follow up' });",
      "preview": false
    }
  ]
};
