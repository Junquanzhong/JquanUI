// JquanUI component documentation: overlayManager
export default {
  "id": "overlayManager",
  "title": "OverlayManager",
  "chinese": "浮层管理",
  "category": "浏览器工具",
  "version": "1.3.0",
  "file": "dist/components/overlayManager.js",
  "api": "JquanUIComponents.overlayManagerApi",
  "summary": "Dialog、Modal、Drawer、Popover、Select 共享的独立浮层生命周期服务，支持异步关闭请求、策略更新、焦点与嵌套滚动锁。",
  "install": "await JquanUI.import('overlayManager'); // 自动安装并返回 API",
  "declarative": "<section id=\"custom-overlay\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"custom-title\" hidden class=\"fixed inset-0\">\n  <div id=\"custom-panel\" class=\"p-6 rounded-xl bg-white\">\n    <h2 id=\"custom-title\">自定义浮层</h2>\n    <button id=\"custom-close\" type=\"button\">关闭</button>\n  </div>\n</section>",
  "imperative": "const overlays = await JquanUI.import('overlayManager');\nconst element = document.querySelector('#custom-overlay');\nelement.hidden = false;\nconst layer = overlays.open({\n  element, panel: element.querySelector('#custom-panel'),\n  initialFocus: '#custom-close', closeOnOutside: true,\n  onClose(reason) { element.hidden = true; console.log(reason); }\n});\nelement.querySelector('#custom-close').addEventListener('click', () => layer.close(), { once: true });\n// 路由离开时释放这个句柄：layer.destroy();",
  "attrs": [],
  "methods": [
    [
      "`open(options)`",
      "返回 OverlayHandle；同一活动 element 重复 open 返回同一句柄"
    ],
    [
      "`top() / stack()`",
      "读取最上层句柄或从底到顶的状态快照"
    ],
    [
      "`handle.close(reason?) / handle.destroy()`",
      "关闭并释放；第一次返回 true，重复返回 false"
    ],
    [
      "`handle.isTop() / handle.state()`",
      "检查堆叠与 closed、lockScroll、trapFocus 状态"
    ],
    [
      "`destroy()`",
      "释放当前服务堆栈，返回释放数量；以后仍可再次 open"
    ],
    [
      "`handle.requestClose(reason?)`",
      "Promise<boolean>；onRequestClose 接管时，回调负责检查/动画并最终 close 释放；同一待处理请求去重"
    ],
    [
      "`handle.update(options) / focus()`",
      "更新焦点/关闭/锁/zIndex 策略；focus 只聚焦当前顶层，已关闭 update 返回 null"
    ]
  ],
  "notes": [
    "element 是当前 document 内已连接的 HTMLElement；panel 默认 element，必须位于 element 内。调用方先显示 DOM，并在 onClose 中隐藏 DOM；服务不创建、不移动或移除节点。无依赖，插件名为 jquanui-overlay-manager，手动安装后再安装依赖它的 Dialog。",
    "默认 trapFocus=true、lockScroll=true、closeOnEscape=true、closeOnOutside=false。initialFocus 支持 panel 内的元素或选择器；returnFocus 默认打开前的活动元素，false 禁用返回。只管理最上层 Escape、Tab 和外部点击；关闭开关设为 false 会阻止下层响应同一操作。IME composing 的 Escape 不会关闭。",
    "焦点候选排除隐藏、visibility:hidden、disabled/禁用 fieldset、inert、aria-hidden 及负 tabindex。空面板临时增加 tabindex=-1，释放时清理；当前版本服务面板使用普通 DOM，不跨 iframe 或 ShadowRoot 管理焦点。",
    "嵌套滚动锁在最后一个 lockScroll 层关闭时恢复 body 原有 overflow-x/y 值、各自的 important 优先级和 data-jquan-overlay-scroll-lock 标记和 padding-right 值/优先级；补偿消失的滚动条宽度；锁期间应用不要另行修改这些属性。",
    "活动 element 的 inline z-index 默认从 1000 起；zIndex 指定最小值，后打开层始终高于其下层，释放时恢复原值和优先级。祖先的 CSS stacking context 仍会影响实际层叠；本轮没有 portal 或定位 API。",
    "onClose(reason, handle) 的内置 reason 包括 programmatic、escape、outside、destroy、detached，Dialog 关闭按钮使用 close-button；handle.close 可传业务自定义字符串。释放先完成资源清理再调用回调，回调抛错会向调用方传播；destroy 和自动移除仍清理其余层；异步移除回调的异常由浏览器报告。",
    "节点移除后 MutationObserver 自动释放；也应在路由离开时主动调用自己的 handle.destroy。服务 destroy 会关闭整个共享堆栈，应只由页面/测试所有者调用。",
    "Dialog 保留 jq-dialog、jq-dialog-trigger、jq-dialog-close，import(dialog) 自动加载服务。Modal 2.2、Drawer 1.2 已接入；Popover 1.5、Select 1.1 已接入。",
    "TypeScript 可从 jquanui 或 jquanui/components/overlayManager 导入 OverlayManagerApi、OverlayOptions、OverlayHandle、OverlayState；import(overlayManager) 和浏览器全局 API 有精确类型。",
    "onRequestClose(reason,handle) 可异步拒绝/接管关闭，服务保留堆栈直到调用 handle.close。close/destroy 是直接释放，服务整栈 destroy 绕过消费方检查。jquanui-overlay-change 文档事件在堆栈/策略变化后同步派发，detail.count 为活动层数。",
    "1.2 新增 outsideElements: HTMLElement[]，将额外节点（如触发器）计入外部 click 的内部区域；只影响点击，不扩展焦点陷阱。autoFocus=false 取消打开时聚焦但保留 Tab/focusin 陷阱；显式 true 即使 trapFocus=false 也聚焦 panel 候选。handle.update 支持 outsideElements、autoFocus 和 returnFocus；autoFocus 仅控制初次打开，update 仍会修正违反当前 trapFocus 策略的焦点。returnFocus 为 HTMLElement/false/null，false 禁用关闭时返回。",
    "1.3 新增 ownerElement: HTMLElement，用于 body 下独立 panel 的逻辑归属与移除清理；state() 返回 ownerElement。Select 使用 ownerElement 保持 Modal/Drawer 的活动状态判断。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "markup",
      "title": "准备普通 DOM",
      "language": "html",
      "code": "<section id=\"custom-overlay\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"custom-title\" hidden class=\"fixed inset-0\">\n  <div id=\"custom-panel\" class=\"p-6 rounded-xl bg-white\">\n    <h2 id=\"custom-title\">自定义浮层</h2>\n    <button id=\"custom-close\" type=\"button\">关闭</button>\n  </div>\n</section>",
      "preview": false
    },
    {
      "id": "imperative",
      "title": "导入、打开与销毁",
      "language": "javascript",
      "code": "const overlays = await JquanUI.import('overlayManager');\nconst element = document.querySelector('#custom-overlay');\nelement.hidden = false;\nconst layer = overlays.open({\n  element, panel: element.querySelector('#custom-panel'),\n  initialFocus: '#custom-close', closeOnOutside: true,\n  onClose(reason) { element.hidden = true; console.log(reason); }\n});\nelement.querySelector('#custom-close').addEventListener('click', () => layer.close(), { once: true });\n// 路由离开时释放这个句柄：layer.destroy();",
      "preview": false
    }
  ]
};
