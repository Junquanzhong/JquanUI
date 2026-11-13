// JquanUI component documentation: video
export default {
  "id": "video",
  "title": "Video",
  "chinese": "视频播放器",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/video.js",
  "api": "JquanUIComponents.videoApi",
  "summary": "基于原生 video 的轻量播放器，支持播放/暂停、静音、进度、音量、全屏和画中画。",
  "install": "JquanUI.use(JquanUIComponents.video);",
  "declarative": "<section jq-video>\n  <video jq-video-media src=\"/media/demo.mp4\" playsinline></video>\n  <div class=\"controls\">\n    <button jq-video-play>Play</button>\n    <input jq-video-progress type=\"range\" min=\"0\" max=\"100\" value=\"0\">\n    <button jq-video-mute>Mute</button>\n  </div>\n</section>",
  "imperative": "const video = JquanUIComponents.videoApi.mount('#demo-video');\n\nvideo.play();\nvideo.seek(3.5);\nvideo.setVolume(0.4);\nvideo.mute(false);",
  "attrs": [
    [
      "`jq-video`",
      "根节点"
    ],
    [
      "`jq-video-media`",
      "video 媒体节点"
    ],
    [
      "`jq-video-play`",
      "播放/暂停触发器"
    ],
    [
      "`jq-video-progress`",
      "进度条 range"
    ],
    [
      "`jq-video-volume`",
      "音量条 range"
    ],
    [
      "`jq-video-mute / fullscreen / pip`",
      "静音、全屏、画中画控制"
    ]
  ],
  "methods": [
    [
      "`mount(target)`",
      "挂载播放器"
    ],
    [
      "`play / pause / toggle`",
      "播放控制"
    ],
    [
      "`seek(seconds)`",
      "跳转时间"
    ],
    [
      "`setVolume(value)`",
      "设置音量 0-1"
    ],
    [
      "`setSource(src) / mute(force)`",
      "切换资源与静音"
    ]
  ],
  "notes": [
    "适合课程预览、产品演示、Banner 视频、操作录屏回放。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-video>\n  <video jq-video-media src=\"/media/demo.mp4\" playsinline></video>\n  <div class=\"controls\">\n    <button jq-video-play>Play</button>\n    <input jq-video-progress type=\"range\" min=\"0\" max=\"100\" value=\"0\">\n    <button jq-video-mute>Mute</button>\n  </div>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const video = JquanUIComponents.videoApi.mount('#demo-video');\n\nvideo.play();\nvideo.seek(3.5);\nvideo.setVolume(0.4);\nvideo.mute(false);",
      "preview": false
    }
  ]
};
