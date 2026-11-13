// JquanUI component documentation: modal
export default {
  "id": "modal",
  "title": "Modal",
  "chinese": "模态框",
  "category": "反馈与浮层",
  "version": "2.1.0",
  "file": "dist/components/modal.js",
  "api": "JquanUIComponents.modalApi",
  "summary": "完整的模态框服务：dialog、form、image、drawer surface、confirm、promise 状态联动都统一在一个 API 里。",
  "install": "await JquanUI.import('modal'); // 手动引入需先加载 overlayManager.js 与 overlayPreset.js",
  "declarative": "<button jq-modal-trigger\n  data-modal-title=\"删除确认\"\n  data-modal-content=\"确定要删除这条数据吗？\">\n  打开模态框\n</button>",
  "imperative": "const modals = await JquanUI.import('modal');\nconst modal = modals.open({ title: '记录详情', content: '<p>正在查看记录</p>' });\nmodal.patch({ title: '记录详情 · 已更新' });\n// await modal.close(); // true 表示开始退出动画；卸载视图用 modal.destroy()\n",
  "attrs": [
    [
      "`jq-modal-trigger`",
      "声明式触发"
    ],
    [
      "`data-modal-title`",
      "标题"
    ],
    [
      "`data-modal-content`",
      "HTML 内容"
    ],
    [
      "`data-modal-type`",
      "`dialog` / `form` / `image`"
    ],
    [
      "`data-modal-description` / `data-modal-placement` / `data-modal-surface`",
      "说明、位置与 surface 类型"
    ],
    [
      "`data-modal-images` / `data-modal-start-index` / `data-modal-loop`",
      "图片模式的资源、起始索引与循环设置"
    ]
  ],
  "methods": [
    [
      "`open(options)`",
      "打开自定义模态框"
    ],
    [
      "`alert / confirm / promise`",
      "内置高频弹框模式"
    ],
    [
      "`update / patch`",
      "运行时更新内容"
    ],
    [
      "`close / closeAll / destroy`",
      "关闭与销毁"
    ],
    [
      "`drawer(options)`",
      "通过 Modal API 创建抽屉 surface"
    ],
    [
      "`getOpenCount()`",
      "读取当前打开数量"
    ],
    [
      "句柄 `setBusy / getFormData / element`",
      "控制提交忙碌态、读取表单数据与根节点"
    ],
    [
      "`state()`",
      "读取 destroyed/isClosing/busy/closePending/isTop 状态"
    ]
  ],
  "notes": [
    "如果组件文档页后面要做“复制代码 / 预览详情”，modal 是非常适合的承载层。",
    "Modal 已接入 OverlayManager，与 Select 共享层级、焦点、Escape 与滚动锁；动画结束才释放层。手动引入必须先加载 overlayManager.js；推荐 JquanUI.import('modal')。",
    "state() 返回 destroyed/isClosing/busy/closePending/isTop；close() 返回 Promise<boolean>，同一等待中的 beforeClose 请求去重。update/patch 使旧关闭决定失效；destroy() 取消入场帧与离场计时器并立即释放。",
    "当前 Dialog/Popover 仍有独立生命周期；三者混合的既有全量 Modal 回归仍在“共享栈”断言失败，不据此宣称全部浮层完成迁移。",
    "Modal 独占 form 提交流程：内置 FormValidator 只做校验，不触发原生 form.submit。update/patch/destroy 会退休旧表单与校验句柄；旧异步校验/提交结果不会修改新表单、清除新 busy 状态或关闭新视图。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<button jq-modal-trigger\n  data-modal-title=\"删除确认\"\n  data-modal-content=\"确定要删除这条数据吗？\">\n  打开模态框\n</button>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const modals = await JquanUI.import('modal');\nconst modal = modals.open({ title: '记录详情', content: '<p>正在查看记录</p>' });\nmodal.patch({ title: '记录详情 · 已更新' });\n// await modal.close(); // true 表示开始退出动画；卸载视图用 modal.destroy()\n",
      "preview": false
    }
  ],
  "schema": {
    "lifecycle": {
      "signature": "handle.close(reason?) => Promise<boolean>; handle.destroy() => boolean",
      "returns": "close 的 true 表示离场动画开始；销毁后 state().destroyed=true。",
      "options": [
        [
          "beforeClose",
          "function|null",
          "null",
          "异步结果被更新或销毁失效；抛出异常按否决处理"
        ],
        [
          "trapFocus / lockScroll",
          "boolean",
          "true",
          "沿用共享服务策略"
        ],
        [
          "closeOnEscape",
          "boolean",
          "true",
          "只有栈顶层响应 Escape"
        ]
      ]
    }
  }
};
