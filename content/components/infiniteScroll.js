// JquanUI component documentation: infiniteScroll
export default {
  "id": "infiniteScroll",
  "title": "InfiniteScroll",
  "chinese": "无缝滚动",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/infiniteScroll.js",
  "api": "JquanUIComponents.infiniteScrollApi",
  "summary": "用于 logo wall、公告流、品牌列表等循环滚动场景。",
  "install": "JquanUI.use(JquanUIComponents.infiniteScroll);",
  "declarative": "<section jq-infinite-scroll id=\"demo-marquee\">\n  <div jq-infinite-scroll-item>Vue</div>\n  <div jq-infinite-scroll-item>React</div>\n  <div jq-infinite-scroll-item>Svelte</div>\n</section>",
  "imperative": "const scroller = JquanUIComponents.infiniteScrollApi.mount('#demo-marquee', {\n  speed: 28\n});\n\nscroller.pause();\nscroller.setSpeed(48);",
  "attrs": [
    [
      "`jq-infinite-scroll`",
      "根节点"
    ],
    [
      "`jq-infinite-scroll-item`",
      "滚动项"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载实例"
    ],
    [
      "`play / pause`",
      "播放控制"
    ],
    [
      "`setSpeed(target, speed)`",
      "动态修改速度"
    ],
    [
      "`getState(target)`",
      "读取方向、速度、播放状态"
    ]
  ],
  "notes": [
    "比 carousel 更适合连续滚动展示。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-infinite-scroll id=\"demo-marquee\">\n  <div jq-infinite-scroll-item>Vue</div>\n  <div jq-infinite-scroll-item>React</div>\n  <div jq-infinite-scroll-item>Svelte</div>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const scroller = JquanUIComponents.infiniteScrollApi.mount('#demo-marquee', {\n  speed: 28\n});\n\nscroller.pause();\nscroller.setSpeed(48);",
      "preview": false
    }
  ]
};
