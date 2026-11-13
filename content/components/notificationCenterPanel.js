// JquanUI component documentation: notificationCenterPanel
export default {
  "id": "notificationCenterPanel",
  "title": "NotificationCenterPanel",
  "chinese": "通知中心面板",
  "category": "反馈与浮层",
  "version": "1.0.0",
  "file": "dist/components/notificationCenterPanel.js",
  "api": "JquanUIComponents.notificationCenterPanelApi",
  "summary": "用于展示系统通知、工作流提醒和消息列表。",
  "install": "JquanUI.use(JquanUIComponents.notificationCenterPanel);",
  "declarative": "<section jq-notification-center-panel id=\"demo-notification-center-panel\"></section>",
  "imperative": "const center = JquanUIComponents.notificationCenterPanelApi.mount('#demo-notification-center-panel', { items });\ncenter.markRead('notice-1');\ncenter.prepend({ title: 'New notice' });",
  "attrs": [
    [
      "`jq-notification-center-panel`",
      "根节点"
    ],
    [
      "`items[].title / meta / body / unread`",
      "通知字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载通知中心"
    ],
    [
      "`setItems(items)`",
      "替换通知列表"
    ],
    [
      "`markRead(noticeId)`",
      "标记已读"
    ],
    [
      "`prepend(item) / state()`",
      "插入通知和读取状态"
    ]
  ],
  "notes": [
    "适合顶部通知抽屉、消息中心页和系统提醒面板。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-notification-center-panel id=\"demo-notification-center-panel\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const center = JquanUIComponents.notificationCenterPanelApi.mount('#demo-notification-center-panel', { items });\ncenter.markRead('notice-1');\ncenter.prepend({ title: 'New notice' });",
      "preview": false
    }
  ]
};
