// JquanUI component documentation: roleMemberAssigner
export default {
  "id": "roleMemberAssigner",
  "title": "RoleMemberAssigner",
  "chinese": "角色成员分配器",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/roleMemberAssigner.js",
  "api": "JquanUIComponents.roleMemberAssignerApi",
  "summary": "用于角色和成员的关系分配，适合后台权限分组和团队组织配置。",
  "install": "JquanUI.use(JquanUIComponents.roleMemberAssigner);",
  "declarative": "<section jq-role-member-assigner id=\"demo-role-member-assigner\"></section>",
  "imperative": "const assigner = JquanUIComponents.roleMemberAssignerApi.mount('#demo-role-member-assigner', {\n  roles,\n  members,\n  assignments\n});\n\nassigner.setRole('editor');\nassigner.toggle('u-1');",
  "attrs": [
    [
      "`jq-role-member-assigner`",
      "根节点"
    ],
    [
      "`roles[] / members[]`",
      "角色和成员数据"
    ],
    [
      "`assignments[roleKey]`",
      "角色成员关系"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载分配器"
    ],
    [
      "`setRole(key)`",
      "切换当前角色"
    ],
    [
      "`toggle(memberId)`",
      "切换成员分配"
    ],
    [
      "`setAssignments(assignments)`",
      "整体替换关系"
    ],
    [
      "`state()`",
      "读取当前状态"
    ]
  ],
  "notes": [
    "适合角色管理、项目成员分配、分组维护页。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-role-member-assigner id=\"demo-role-member-assigner\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const assigner = JquanUIComponents.roleMemberAssignerApi.mount('#demo-role-member-assigner', {\n  roles,\n  members,\n  assignments\n});\n\nassigner.setRole('editor');\nassigner.toggle('u-1');",
      "preview": false
    }
  ]
};
