// JquanUI component documentation: permission
export default {
  "id": "permission",
  "title": "Permission",
  "chinese": "权限",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/permission.js",
  "api": "JquanUIComponents.permissionApi",
  "summary": "管理 permissions 和 roles，并联动 router / appShell / table 等组件的显示控制。",
  "install": "JquanUI.use(JquanUIComponents.permission);",
  "declarative": "<button\n  type=\"button\"\n  data-permission=\"component.write\"\n  data-permission-deny=\"disable\">\n  保存\n</button>\n\n<div data-role-permission=\"admin\">\n  仅管理员可见\n</div>",
  "imperative": "const permissions = JquanUIComponents.permissionApi;\npermissions.setPermissions(['component.read', 'component.write']);\npermissions.setRoles(['admin']);\n\nconst canEdit = permissions.can({\n  permission: 'component.write',\n  role: 'admin'\n});\nconsole.log(canEdit, permissions.state());",
  "attrs": [],
  "methods": [
    [
      "`setPermissions(values) / setRoles(values)`",
      "替换当前权限和角色集合"
    ],
    [
      "`grant(values) / revoke(values)`",
      "增删权限并刷新已绑定节点"
    ],
    [
      "`has(values, mode?) / hasRole(values, mode?) / can(config)`",
      "判断权限、角色或组合条件；mode 支持 some/every"
    ],
    [
      "`state() / refresh(root?)`",
      "读取当前集合，或重新应用 DOM 控制"
    ]
  ],
  "notes": [
    "权限组件只负责前端显示和交互控制，不替代服务端鉴权。默认拒绝策略是隐藏节点；data-permission-deny=disable 会改为禁用控件。权限值可以写数组或逗号分隔字符串，节点使用 data-permission-mode / data-role-mode 选择 some 或 every。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative-markup",
      "title": "声明式节点控制",
      "language": "html",
      "code": "<button\n  type=\"button\"\n  data-permission=\"component.write\"\n  data-permission-deny=\"disable\">\n  保存\n</button>\n\n<div data-role-permission=\"admin\">\n  仅管理员可见\n</div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const permissions = JquanUIComponents.permissionApi;\npermissions.setPermissions(['component.read', 'component.write']);\npermissions.setRoles(['admin']);\n\nconst canEdit = permissions.can({\n  permission: 'component.write',\n  role: 'admin'\n});\nconsole.log(canEdit, permissions.state());",
      "preview": false
    }
  ]
};
