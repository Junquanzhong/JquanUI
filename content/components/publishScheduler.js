// JquanUI component documentation: publishScheduler
export default {
  "id": "publishScheduler",
  "title": "PublishScheduler",
  "chinese": "发布调度器",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/publishScheduler.js",
  "api": "JquanUIComponents.publishSchedulerApi",
  "summary": "用于设置发布时间、时区和发布状态，适合内容定时上线场景。",
  "install": "JquanUI.use(JquanUIComponents.publishScheduler);",
  "declarative": "<section jq-publish-scheduler id=\"demo-publish-scheduler\"></section>",
  "imperative": "const scheduler = JquanUIComponents.publishSchedulerApi.mount('#demo-publish-scheduler', {\n  value: '2026-05-22T09:00',\n  timezone: 'Asia/Shanghai',\n  status: 'scheduled'\n});\n\nscheduler.setValue({ value: '2026-05-23T10:00' });",
  "attrs": [
    [
      "`jq-publish-scheduler`",
      "根节点"
    ],
    [
      "`jq-publish-scheduler-date`",
      "发布时间输入"
    ],
    [
      "`jq-publish-scheduler-timezone`",
      "时区输入"
    ],
    [
      "`jq-publish-scheduler-status`",
      "状态选择"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载发布调度器"
    ],
    [
      "`setValue(payload)`",
      "更新发布时间/时区/状态"
    ],
    [
      "`clear()`",
      "清空调度数据"
    ],
    [
      "`state()`",
      "读取当前调度 payload"
    ]
  ],
  "notes": [
    "适合文章、活动、商品的定时发布和发布前状态控制。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-publish-scheduler id=\"demo-publish-scheduler\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const scheduler = JquanUIComponents.publishSchedulerApi.mount('#demo-publish-scheduler', {\n  value: '2026-05-22T09:00',\n  timezone: 'Asia/Shanghai',\n  status: 'scheduled'\n});\n\nscheduler.setValue({ value: '2026-05-23T10:00' });",
      "preview": false
    }
  ]
};
