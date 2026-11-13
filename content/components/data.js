// JquanUI component documentation: data
export default {
  "id": "data",
  "title": "Data Layer",
  "chinese": "前端数据层",
  "category": "数据与状态",
  "version": "0.1.x",
  "file": "dist/data/JquanUI@Data.js",
  "api": "JquanUIData / JquanUI.data",
  "summary": "独立的前端集合、查询、持久化与同步数据层，适合本地列表、草稿、离线工作区和页面视图模型。不是服务端数据库，也不进入 Core。",
  "install": "<script src=\"dist/data/JquanUI@Data.js\"></script>\nconst contacts = JquanUIData.createCollection('contacts');",
  "declarative": "const contacts = JquanUIData.createCollection('contacts', {\n  primaryKey: 'id',\n  indexes: ['status'],\n  data: [{ id: 1, name: 'Ada', status: 'active' }]\n});\n\nconst page = contacts.query({ status: 'active' })\n  .orderBy({ name: 'asc' })\n  .paginate(1, 20);",
  "imperative": "const stop = contacts.liveQuery(\n  { status: 'active' },\n  rows => renderContacts(rows)\n);\n\nconst snapshot = contacts.exportSnapshot();\ncontacts.importSnapshot(snapshot);\nstop();",
  "attrs": [
    [
      "`primaryKey`",
      "主键字段，默认 `id`"
    ],
    [
      "`indexes`",
      "等值查询索引字段"
    ],
    [
      "`unique`",
      "唯一约束字段"
    ],
    [
      "`schema`",
      "字段类型、必填和默认值"
    ],
    [
      "`schemaVersion`",
      "当前数据 Schema 版本"
    ],
    [
      "`historyLimit`",
      "变更日志保留数量"
    ]
  ],
  "methods": [
    [
      "`insert / upsert`",
      "新增或写入记录"
    ],
    [
      "`find / query`",
      "条件查询与链式查询"
    ],
    [
      "`update / remove / clear`",
      "修改、删除和清空"
    ],
    [
      "`paginate / groupBy`",
      "分页和分组结果"
    ],
    [
      "`liveQuery`",
      "订阅查询结果变化"
    ],
    [
      "`JquanUIData.liveQuery(collection, matcher, listener, options)`",
      "不依赖实例引用的顶层订阅快捷方式"
    ],
    [
      "`persist`",
      "连接 Memory / Storage / IndexedDB"
    ],
    [
      "`sync`",
      "增量同步、冲突处理和快照恢复"
    ],
    [
      "`createDataInspector`",
      "按需查看诊断与同步状态"
    ],
    [
      "`join`",
      "客户端内存关系查询"
    ]
  ],
  "notes": [
    "优先复用已有 Table、CRUD、FilterBuilder、Pagination、Storage 和 HTTP API，不在 Data 中复制这些能力。",
    "IndexedDB 会兼容已有更高版本并按需创建缺失 Store；事务失败会完整回滚记录、索引、revision 和事件历史。",
    "需要完整参数、Schema 迁移、同步恢复和 AI 调用规范时，阅读 skills/jquanui/DATA.md。",
    "敏感数据、权限和最终数据源必须由服务端负责。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "javascript",
      "code": "const contacts = JquanUIData.createCollection('contacts', {\n  primaryKey: 'id',\n  indexes: ['status'],\n  data: [{ id: 1, name: 'Ada', status: 'active' }]\n});\n\nconst page = contacts.query({ status: 'active' })\n  .orderBy({ name: 'asc' })\n  .paginate(1, 20);",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const stop = contacts.liveQuery(\n  { status: 'active' },\n  rows => renderContacts(rows)\n);\n\nconst snapshot = contacts.exportSnapshot();\ncontacts.importSnapshot(snapshot);\nstop();",
      "preview": false
    }
  ]
};
