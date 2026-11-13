// JquanUI component documentation: assetFolderTree
export default {
  "id": "assetFolderTree",
  "title": "AssetFolderTree",
  "chinese": "素材目录树",
  "category": "页面结构",
  "version": "1.0.0",
  "file": "dist/components/assetFolderTree.js",
  "api": "JquanUIComponents.assetFolderTreeApi",
  "summary": "用于媒体库、文件中心和素材管理中的目录树切换。",
  "install": "JquanUI.use(JquanUIComponents.assetFolderTree);",
  "declarative": "<aside jq-asset-folder-tree id=\"demo-asset-folder-tree\"></aside>",
  "imperative": "const tree = JquanUIComponents.assetFolderTreeApi.mount('#demo-asset-folder-tree', { items, expanded: ['root'] });\ntree.toggle('images');\ntree.activate('campaign');",
  "attrs": [
    [
      "`jq-asset-folder-tree`",
      "根节点"
    ],
    [
      "`items[].title / meta / children`",
      "目录项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载目录树"
    ],
    [
      "`activate(itemId)`",
      "激活目录"
    ],
    [
      "`toggle(itemId)`",
      "展开或折叠目录"
    ],
    [
      "`setItems(items) / state()`",
      "更新树和读取状态"
    ]
  ],
  "notes": [
    "适合媒体库左侧目录、附件管理、素材归档后台。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<aside jq-asset-folder-tree id=\"demo-asset-folder-tree\"></aside>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const tree = JquanUIComponents.assetFolderTreeApi.mount('#demo-asset-folder-tree', { items, expanded: ['root'] });\ntree.toggle('images');\ntree.activate('campaign');",
      "preview": false
    }
  ]
};
