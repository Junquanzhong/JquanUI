// JquanUI component documentation: tagInput
export default {
  "id": "tagInput",
  "title": "TagInput",
  "chinese": "标签输入",
  "category": "表单输入",
  "version": "1.0.0",
  "file": "dist/components/tagInput.js",
  "api": "JquanUIComponents.tagInputApi",
  "summary": "面向标签、关键词、邮箱白名单、技能选择等场景的输入组件，支持最大数量控制、建议项、粘贴拆分、重复值处理。",
  "install": "JquanUI.use(JquanUIComponents.tagInput);",
  "declarative": "<input jq-tag-input\n  data-tag-max=\"5\"\n  data-tag-suggestions='[\"Vue\",\"React\",\"Svelte\",\"Dashboard\",\"Docs\"]'\n  data-tag-duplicates=\"false\"\n  placeholder=\"输入标签后按回车\">",
  "imperative": "const tagInput = JquanUIComponents.tagInputApi.mount('#demo-tags', {\n  maxTags: 5,\n  suggestions: ['Vue', 'React', 'Docs'],\n  maxTagsText: '最多保留 5 个标签',\n  duplicateText: '该标签已存在'\n});\n\ntagInput.add('Vue');\ntagInput.setTags(['Docs', 'Dashboard']);\ntagInput.remove('Docs');",
  "attrs": [
    [
      "`jq-tag-input`",
      "启用 TagInput"
    ],
    [
      "`data-tag-max`",
      "最大标签数量"
    ],
    [
      "`data-tag-suggestions`",
      "建议项 JSON 数组"
    ],
    [
      "`data-tag-duplicates`",
      "是否允许重复标签"
    ],
    [
      "`data-tag-suggest`",
      "是否显示建议面板"
    ],
    [
      "`data-tag-max-text`",
      "超出数量上限时的提示文案"
    ],
    [
      "`data-tag-duplicate-text`",
      "重复标签提示文案"
    ],
    [
      "`data-tag-invalid-text`",
      "校验失败提示文案"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载 TagInput"
    ],
    [
      "`add / remove / clear`",
      "增删清空标签"
    ],
    [
      "`setTags(tags)`",
      "批量设置标签"
    ],
    [
      "`tags()`",
      "读取当前标签数组"
    ],
    [
      "`focus()`",
      "聚焦输入框"
    ],
    [
      "`state()`",
      "读取标签数、剩余额度、聚焦状态"
    ]
  ],
  "notes": [
    "很适合做搜索关键词、系统标签、邮件白名单、技能项、筛选条件 chips 等高频输入场景。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<input jq-tag-input\n  data-tag-max=\"5\"\n  data-tag-suggestions='[\"Vue\",\"React\",\"Svelte\",\"Dashboard\",\"Docs\"]'\n  data-tag-duplicates=\"false\"\n  placeholder=\"输入标签后按回车\">",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const tagInput = JquanUIComponents.tagInputApi.mount('#demo-tags', {\n  maxTags: 5,\n  suggestions: ['Vue', 'React', 'Docs'],\n  maxTagsText: '最多保留 5 个标签',\n  duplicateText: '该标签已存在'\n});\n\ntagInput.add('Vue');\ntagInput.setTags(['Docs', 'Dashboard']);\ntagInput.remove('Docs');",
      "preview": false
    }
  ]
};
