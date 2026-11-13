// JquanUI component documentation: export
export default {
  "id": "export",
  "title": "Export",
  "chinese": "文件导出",
  "category": "浏览器工具",
  "version": "1.0.0",
  "file": "dist/components/export.js",
  "api": "JquanUIComponents.exportApi",
  "summary": "导出 JSON / CSV / TXT，支持数组数据与 HTML Table，适合报表、列表、运营台账。",
  "install": "JquanUI.use(JquanUIComponents.export);",
  "declarative": "<section jq-export data-export-source=\"#report-table\" data-export-filename=\"orders\">\n  <button jq-export-trigger data-export-format=\"csv\">导出 CSV</button>\n  <button jq-export-trigger data-export-format=\"json\">导出 JSON</button>\n</section>",
  "imperative": "JquanUIComponents.exportApi.download({\n  filename: 'orders',\n  format: 'csv',\n  data: rows,\n  columns: [\n    { key: 'id', label: 'ID' },\n    { key: 'owner', label: 'Owner' }\n  ]\n});",
  "attrs": [
    [
      "`jq-export`",
      "声明式入口"
    ],
    [
      "`jq-export-trigger`",
      "导出触发按钮"
    ],
    [
      "`data-export-format`",
      "`csv` / `json` / `txt`"
    ],
    [
      "`data-export-source`",
      "数组数据源或 table / script 选择器"
    ],
    [
      "`data-export-filename`",
      "导出文件名"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载导出行为"
    ],
    [
      "`download(options)`",
      "直接导出数据"
    ],
    [
      "`serialize(data, options)`",
      "先序列化为字符串"
    ],
    [
      "`table(target)`",
      "从 table 提取数据"
    ]
  ],
  "notes": [
    "比“按钮里自己拼 Blob”更统一，适合和 table、crud、报表模块联动。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-export data-export-source=\"#report-table\" data-export-filename=\"orders\">\n  <button jq-export-trigger data-export-format=\"csv\">导出 CSV</button>\n  <button jq-export-trigger data-export-format=\"json\">导出 JSON</button>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "JquanUIComponents.exportApi.download({\n  filename: 'orders',\n  format: 'csv',\n  data: rows,\n  columns: [\n    { key: 'id', label: 'ID' },\n    { key: 'owner', label: 'Owner' }\n  ]\n});",
      "preview": false
    }
  ]
};
