// JquanUI component documentation: approvalFlow
export default {
  "id": "approvalFlow",
  "title": "ApprovalFlow",
  "chinese": "审批流",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/approvalFlow.js",
  "api": "JquanUIComponents.approvalFlowApi",
  "summary": "展示流程节点、当前审批状态和通过/驳回动作，适合发布流程、工单审核和多级审批。",
  "install": "JquanUI.use(JquanUIComponents.approvalFlow);",
  "declarative": "<section jq-approval-flow id=\"demo-approval-flow\"></section>",
  "imperative": "const flow = JquanUIComponents.approvalFlowApi.mount('#demo-approval-flow', {\n  steps\n});\n\nflow.approve('editor');\nflow.reject('legal');",
  "attrs": [
    [
      "`jq-approval-flow`",
      "根节点"
    ],
    [
      "`steps[].title / actor / time / description / status`",
      "流程节点字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载审批流"
    ],
    [
      "`setSteps(steps)`",
      "整体替换步骤"
    ],
    [
      "`approve(stepId)`",
      "将节点设为通过"
    ],
    [
      "`reject(stepId)`",
      "将节点设为驳回"
    ],
    [
      "`state()`",
      "读取当前步骤状态"
    ]
  ],
  "notes": [
    "适合内容发布审批、财务审批、权限申请、流程追踪。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-approval-flow id=\"demo-approval-flow\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const flow = JquanUIComponents.approvalFlowApi.mount('#demo-approval-flow', {\n  steps\n});\n\nflow.approve('editor');\nflow.reject('legal');",
      "preview": false
    }
  ]
};
