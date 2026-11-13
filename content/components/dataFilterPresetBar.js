// JquanUI component documentation: dataFilterPresetBar
export default {
  "id": "dataFilterPresetBar",
  "title": "DataFilterPresetBar",
  "chinese": "筛选预设条",
  "category": "数据与状态",
  "version": "1.0.0",
  "file": "dist/components/dataFilterPresetBar.js",
  "api": "JquanUIComponents.dataFilterPresetBarApi",
  "summary": "用于列表页快速切换预设筛选条件，如“全部 / 待审核 / 已发布 / 高优先级”。",
  "install": "JquanUI.use(JquanUIComponents.dataFilterPresetBar);",
  "declarative": "<section jq-data-filter-preset-bar id=\"demo-filter-preset-bar\"></section>",
  "imperative": "const bar = JquanUIComponents.dataFilterPresetBarApi.mount('#demo-filter-preset-bar', {\n  presets\n});\n\nbar.activate('published');\nbar.state();",
  "attrs": [
    [
      "`jq-data-filter-preset-bar`",
      "根节点"
    ],
    [
      "`presets[].key / label / filters`",
      "预设项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载预设条"
    ],
    [
      "`activate(key)`",
      "切换当前预设"
    ],
    [
      "`setPresets(presets)`",
      "更新预设列表"
    ],
    [
      "`state()`",
      "读取当前预设状态"
    ]
  ],
  "notes": [
    "适合和 QueryToolbar / FilterBuilder 组合使用。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-data-filter-preset-bar id=\"demo-filter-preset-bar\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const bar = JquanUIComponents.dataFilterPresetBarApi.mount('#demo-filter-preset-bar', {\n  presets\n});\n\nbar.activate('published');\nbar.state();",
      "preview": false
    }
  ]
};
