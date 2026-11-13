// JquanUI component documentation: reviewQueuePanel
export default {
  "id": "reviewQueuePanel",
  "title": "ReviewQueuePanel",
  "chinese": "审核队列面板",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/reviewQueuePanel.js",
  "api": "JquanUIComponents.reviewQueuePanelApi",
  "summary": "用于展示待审内容、审核动作和当前审批结果。",
  "install": "JquanUI.use(JquanUIComponents.reviewQueuePanel);",
  "declarative": "<section jq-review-queue-panel id=\"demo-review-queue-panel\"></section>",
  "imperative": "const queue = JquanUIComponents.reviewQueuePanelApi.mount('#demo-review-queue-panel', { items });\nqueue.approve('review-1');\nqueue.reject('review-2');",
  "attrs": [
    [
      "`jq-review-queue-panel`",
      "根节点"
    ],
    [
      "`items[].title / meta / body / status`",
      "审核项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载审核队列"
    ],
    [
      "`approve(reviewId)`",
      "标记通过"
    ],
    [
      "`reject(reviewId)`",
      "标记驳回"
    ],
    [
      "`focus(reviewId) / setItems(items) / state()`",
      "聚焦、更新、读取状态"
    ]
  ],
  "notes": [
    "适合内容审核、工单审批、评论审核、发布流转。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-review-queue-panel id=\"demo-review-queue-panel\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const queue = JquanUIComponents.reviewQueuePanelApi.mount('#demo-review-queue-panel', { items });\nqueue.approve('review-1');\nqueue.reject('review-2');",
      "preview": false
    }
  ]
};
