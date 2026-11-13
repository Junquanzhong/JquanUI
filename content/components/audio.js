// JquanUI component documentation: audio
export default {
  "id": "audio",
  "title": "Audio",
  "chinese": "音频播放器",
  "category": "内容与媒体",
  "version": "1.0.0",
  "file": "dist/components/audio.js",
  "api": "JquanUIComponents.audioApi",
  "summary": "基于原生 audio 的音频控件，支持播放/暂停、进度、音量和静音，适合播客和语音片段。",
  "install": "JquanUI.use(JquanUIComponents.audio);",
  "declarative": "<section jq-audio>\n  <audio jq-audio-media src=\"/media/demo.wav\"></audio>\n  <button jq-audio-play>Play</button>\n  <input jq-audio-progress type=\"range\" min=\"0\" max=\"100\" value=\"0\">\n</section>",
  "imperative": "const audio = JquanUIComponents.audioApi.mount('#demo-audio');\n\naudio.play();\naudio.seek(8);\naudio.setVolume(0.6);",
  "attrs": [
    [
      "`jq-audio`",
      "根节点"
    ],
    [
      "`jq-audio-media`",
      "audio 媒体节点"
    ],
    [
      "`jq-audio-play`",
      "播放/暂停触发器"
    ],
    [
      "`jq-audio-progress`",
      "进度条 range"
    ],
    [
      "`jq-audio-volume`",
      "音量条 range"
    ],
    [
      "`jq-audio-mute`",
      "静音按钮"
    ]
  ],
  "methods": [
    [
      "`mount(target)`",
      "挂载音频实例"
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
    "适合语音播报、工单录音、播客列表、操作提示音和白噪声工具。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-audio>\n  <audio jq-audio-media src=\"/media/demo.wav\"></audio>\n  <button jq-audio-play>Play</button>\n  <input jq-audio-progress type=\"range\" min=\"0\" max=\"100\" value=\"0\">\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const audio = JquanUIComponents.audioApi.mount('#demo-audio');\n\naudio.play();\naudio.seek(8);\naudio.setVolume(0.6);",
      "preview": false
    }
  ]
};
