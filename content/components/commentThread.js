// JquanUI component documentation: commentThread
export default {
  "id": "commentThread",
  "title": "CommentThread",
  "chinese": "评论线程",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/commentThread.js",
  "api": "JquanUIComponents.commentThreadApi",
  "summary": "支持评论列表、回复嵌套和增量追加，适合审核备注、协作讨论和内容评论面板。",
  "install": "JquanUI.use(JquanUIComponents.commentThread);",
  "declarative": "<section jq-comment-thread id=\"demo-comment-thread\"></section>",
  "imperative": "const thread = JquanUIComponents.commentThreadApi.mount('#demo-comment-thread', {\n  items\n});\n\nthread.appendComment({ author: 'PM', content: 'Need revision' });\nthread.reply('comment-1', { author: 'Editor', content: 'Updated' });",
  "attrs": [
    [
      "`jq-comment-thread`",
      "根节点"
    ],
    [
      "`items[].author / time / content / replies`",
      "评论节点字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载评论线程"
    ],
    [
      "`setItems(items)`",
      "整体替换评论列表"
    ],
    [
      "`appendComment(comment)`",
      "追加顶层评论"
    ],
    [
      "`reply(commentId, comment)`",
      "向指定评论追加回复"
    ],
    [
      "`state()`",
      "读取当前评论树"
    ]
  ],
  "notes": [
    "适合 CMS 审核备注、运营协作留言、客服工单沟通、评论审核页。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-comment-thread id=\"demo-comment-thread\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const thread = JquanUIComponents.commentThreadApi.mount('#demo-comment-thread', {\n  items\n});\n\nthread.appendComment({ author: 'PM', content: 'Need revision' });\nthread.reply('comment-1', { author: 'Editor', content: 'Updated' });",
      "preview": false
    }
  ]
};
