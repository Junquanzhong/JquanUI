// JquanUI component documentation: watermark
export default {
  "id": "watermark",
  "title": "Watermark",
  "chinese": "水印",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/watermark.js",
  "api": "JquanUIComponents.watermarkApi",
  "summary": "给任意区块追加重复文字水印，支持文本、副标题、角度、透明度、间距和运行时更新。",
  "install": "JquanUI.use(JquanUIComponents.watermark);",
  "declarative": "<section jq-watermark data-watermark-text=\"JquanUI\" data-watermark-subtext=\"Internal Use Only\">\n  <div class=\"p-6\">这里是受保护的内容区块</div>\n</section>",
  "imperative": "const wm = JquanUIComponents.watermarkApi.mount('#demo-watermark', {\n  text: 'Design Review',\n  subtext: 'Confidential'\n});\n\nwm.update({ angle: -14, opacity: 0.1 });",
  "attrs": [
    [
      "`jq-watermark`",
      "声明式入口"
    ],
    [
      "`data-watermark-text`",
      "主水印文字"
    ],
    [
      "`data-watermark-subtext`",
      "副标题"
    ],
    [
      "`data-watermark-angle`",
      "旋转角度"
    ],
    [
      "`data-watermark-opacity`",
      "透明度"
    ],
    [
      "`data-watermark-gap-x / gap-y`",
      "平铺间距"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "挂载水印实例"
    ],
    [
      "`update(target, patch)`",
      "更新文字、角度、透明度等配置"
    ],
    [
      "`refresh(target)`",
      "重新生成水印层"
    ],
    [
      "`destroy(target)`",
      "销毁水印"
    ]
  ],
  "notes": [
    "适合后台截图防扩散、合同/报表预览、内部演示环境标识。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-watermark data-watermark-text=\"JquanUI\" data-watermark-subtext=\"Internal Use Only\">\n  <div class=\"p-6\">这里是受保护的内容区块</div>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const wm = JquanUIComponents.watermarkApi.mount('#demo-watermark', {\n  text: 'Design Review',\n  subtext: 'Confidential'\n});\n\nwm.update({ angle: -14, opacity: 0.1 });",
      "preview": false
    }
  ]
};
