// JquanUI component documentation: tree
export default {
  "id": "tree",
  "title": "Tree",
  "chinese": "树结构",
  "category": "数据展示",
  "version": "1.0.0",
  "file": "dist/components/tree.js",
  "api": "JquanUIComponents.treeApi",
  "summary": "用于栏目、菜单、分类、权限节点的树形组件，支持展开、选择、勾选级联和运行时增删改。",
  "install": "JquanUI.use(JquanUIComponents.tree);",
  "declarative": "<section jq-tree id=\"demo-tree\">\n  <script type=\"application/json\" jq-tree-data>\n    [{\"key\":\"content\",\"label\":\"内容管理\",\"children\":[{\"key\":\"posts\",\"label\":\"文章\"}]}]\n  </script>\n</section>",
  "imperative": "const tree = JquanUIComponents.treeApi.mount('#demo-tree', {\n  data: nodes,\n  expandedKeys: ['content']\n});\n\ntree.select('posts');\ntree.append('content', { key: 'pages', label: '页面' });",
  "attrs": [
    [
      "`jq-tree`",
      "根节点"
    ],
    [
      "`jq-tree-data`",
      "声明式 JSON 数据脚本"
    ],
    [
      "`jq-tree-toggle`",
      "展开/收起控制"
    ],
    [
      "`jq-tree-check`",
      "勾选框"
    ],
    [
      "`jq-tree-label`",
      "节点标题按钮"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载树实例"
    ],
    [
      "`expand / collapse / toggle / expandAll`",
      "展开控制"
    ],
    [
      "`select / check`",
      "选中与勾选"
    ],
    [
      "`append / update / remove`",
      "节点增删改"
    ],
    [
      "`state() / tree()`",
      "读取状态和完整树数据"
    ]
  ],
  "notes": [
    "适合 PocketBase / Directus / Strapi / PbootCMS 里的栏目树、菜单树、权限树。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-tree id=\"demo-tree\">\n  <script type=\"application/json\" jq-tree-data>\n    [{\"key\":\"content\",\"label\":\"内容管理\",\"children\":[{\"key\":\"posts\",\"label\":\"文章\"}]}]\n  </script>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const tree = JquanUIComponents.treeApi.mount('#demo-tree', {\n  data: nodes,\n  expandedKeys: ['content']\n});\n\ntree.select('posts');\ntree.append('content', { key: 'pages', label: '页面' });",
      "preview": false
    }
  ]
};
