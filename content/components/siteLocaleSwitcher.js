// JquanUI component documentation: siteLocaleSwitcher
export default {
  "id": "siteLocaleSwitcher",
  "title": "SiteLocaleSwitcher",
  "chinese": "站点语言切换器",
  "category": "网络与集成",
  "version": "1.0.0",
  "file": "dist/components/siteLocaleSwitcher.js",
  "api": "JquanUIComponents.siteLocaleSwitcherApi",
  "summary": "用于多语言站点、多地区内容后台的语言版本切换与状态展示。",
  "install": "JquanUI.use(JquanUIComponents.siteLocaleSwitcher);",
  "declarative": "<section jq-site-locale-switcher id=\"demo-site-locale-switcher\"></section>",
  "imperative": "const locale = JquanUIComponents.siteLocaleSwitcherApi.mount('#demo-site-locale-switcher', { items, active: 'zh-CN' });\nlocale.activate('en-US');\nlocale.state();",
  "attrs": [
    [
      "`jq-site-locale-switcher`",
      "根节点"
    ],
    [
      "`items[].title / meta / status`",
      "语言项字段"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载语言切换器"
    ],
    [
      "`activate(itemId)`",
      "切换当前语言"
    ],
    [
      "`setItems(items)`",
      "更新语言列表"
    ],
    [
      "`state()`",
      "读取当前语言状态"
    ]
  ],
  "notes": [
    "适合 PocketBase / Directus / Strapi 这类多语言内容后台。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-site-locale-switcher id=\"demo-site-locale-switcher\"></section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const locale = JquanUIComponents.siteLocaleSwitcherApi.mount('#demo-site-locale-switcher', { items, active: 'zh-CN' });\nlocale.activate('en-US');\nlocale.state();",
      "preview": false
    }
  ]
};
