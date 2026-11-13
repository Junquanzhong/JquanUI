// JquanUI component documentation: upload
export default {
  "id": "upload",
  "title": "Upload",
  "chinese": "上传",
  "category": "表单输入",
  "version": "2.0.0",
  "file": "dist/components/upload.js",
  "api": "JquanUIComponents.uploadApi",
  "summary": "文件上传组件，支持拖拽、粘贴、预览、文件队列管理和自定义上传流程。",
  "install": "JquanUI.use(JquanUIComponents.upload);",
  "declarative": "<div jq-upload\n  data-upload-url=\"/api/upload\"\n  data-upload-auto=\"false\"\n  data-upload-accept=\"image/*\"></div>",
  "imperative": "const uploader = JquanUIComponents.uploadApi.mount('#demo-upload', {\n  url: '/api/upload',\n  autoUpload: false,\n  preview: true\n});\n\nuploader.upload();\nuploader.files();\nuploader.clear();",
  "attrs": [
    [
      "`data-upload-url`",
      "上传地址"
    ],
    [
      "`data-upload-auto`",
      "是否自动上传"
    ],
    [
      "`data-upload-accept`",
      "允许文件类型"
    ],
    [
      "`data-upload-chunked`",
      "是否分片上传"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载上传器"
    ],
    [
      "`files()`",
      "读取文件列表"
    ],
    [
      "`upload / retry / preview / clear / remove`",
      "文件操作"
    ],
    [
      "`update(patch)`",
      "动态更新配置"
    ]
  ],
  "notes": [
    "文档页示例一般建议关闭真实上传，只演示文件进入队列、读取状态、清空列表这些行为。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div jq-upload\n  data-upload-url=\"/api/upload\"\n  data-upload-auto=\"false\"\n  data-upload-accept=\"image/*\"></div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const uploader = JquanUIComponents.uploadApi.mount('#demo-upload', {\n  url: '/api/upload',\n  autoUpload: false,\n  preview: true\n});\n\nuploader.upload();\nuploader.files();\nuploader.clear();",
      "preview": false
    }
  ]
};
