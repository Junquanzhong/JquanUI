// JquanUI component documentation: drawer
export default {
  "id": "drawer",
  "title": "Drawer",
  "chinese": "抽屉",
  "category": "反馈与浮层",
  "version": "1.2.0",
  "file": "dist/components/drawer.js",
  "api": "JquanUIComponents.drawerApi",
  "summary": "对 modal 的抽屉模式封装，适合侧边编辑、详情预览、过滤面板。",
  "install": "await JquanUI.import('drawer'); // 自动安装 overlayManager → modal → drawer",
  "declarative": "<button jq-drawer-trigger\n  data-drawer-target=\"#drawer-content\"\n  data-drawer-title=\"高级筛选\"\n  data-drawer-placement=\"right\">\n  打开抽屉\n</button>",
  "imperative": "const drawer = await JquanUI.import('drawer');\nconst panel = drawer.open({\n  id: 'filters',\n  title: '高级筛选',\n  placement: 'right',\n  content: '<p>筛选条件</p>'\n});\npanel.patch({ description: '按当前条件缩小范围' });\n// await panel.close(); // true 表示开始退出动画；state().destroyed 之后 DOM 已移除\n// panel.destroy(); // 路由卸载时立即清理",
  "attrs": [
    [
      "`jq-drawer-trigger`",
      "声明式触发"
    ],
    [
      "`data-drawer-target`",
      "抽屉内容来源"
    ],
    [
      "`data-drawer-placement`",
      "`left` / `right` / `top` / `bottom`"
    ],
    [
      "`data-drawer-size`",
      "`sm` / `md` / `lg` / `xl`"
    ],
    [
      "`data-drawer-title` / `data-drawer-description`",
      "标题与说明"
    ]
  ],
  "methods": [
    [
      "`open(options?)`",
      "返回稳定 DrawerHandle；缺少 Modal API 时返回 null。同 id 替换会销毁旧实例。"
    ],
    [
      "句柄 `state()`",
      "读取 id、destroyed、isClosing、busy、closePending、isTop；id 是 Drawer 业务 id。"
    ],
    [
      "句柄或服务 `update / patch`",
      "返回原 Drawer 句柄或 null；累积已有选项并保留内部清理钩子；关闭中/已销毁时 null。"
    ],
    [
      "句柄或服务 `close / destroy`",
      "close(reason?) 返回 Promise<boolean>，经过 beforeClose 和退出动画；destroy() 立即销毁并返回 boolean。旧句柄不会命中同 id 新实例。"
    ],
    [
      "`closeAll()`",
      "请求关闭所有存活 Drawer，返回 true；beforeClose/busy 仍可能保留实例。"
    ],
    [
      "句柄 `setBusy / element / getFormData`",
      "复用 Modal 的忙碌态、根节点和表单数据读取。"
    ]
  ],
  "notes": [
    "依赖：自动导入会安装 overlayManager → modal → drawer；手动脚本/npm 请按相同顺序安装，并加载 overlayPreset。没有额外 Drawer 焦点陷阱或滚动锁。",
    "参数：id:string 可选（默认自动生成）；target:string|HTMLElement 可选，读取 innerHTML；placement:left|right|top|bottom 默认 right；size 默认 md；title/description 默认空字符串；content、footer、actions、classes、trapFocus、zIndex、beforeClose、表单和图片选项复用 ModalOptions。",
    "closeOnBackdropClick、closeOnEscape、lockScroll 默认 true，trapFocus 默认 true；关闭仅释放自身共享层，下层锁保留。beforeClose 返回 false 或抛错否决关闭；setBusy(true) 阻止普通关闭。",
    "onOpen(handle)、onClose(handle,reason)、onDestroy(handle,reason) 接收稳定 Drawer 句柄。更新回调时仍保留内部注册清理；旧实例关闭回调不能删除同 id 新实例。",
    "update 与 patch 累积已有参数；修改 target 且未给 content 时重新读取模板。服务目标支持业务 id、当前句柄、根节点或其后代；旧句柄返回 null/false。",
    "关闭开始时 close() 可已得到 true，退出动画期间 DOM 和共享层仍存在；通过 state().isClosing/destroyed 区分。路由卸载用 destroy()；节点移除由 Modal/OverlayManager 自动清理。",
    "不新增定位、portal 或跨 ShadowRoot/iframe 能力。内容字符串按 HTML 使用，请先处理业务数据。类型可从 jquanui/components/drawer 导入。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<button jq-drawer-trigger\n  data-drawer-target=\"#drawer-content\"\n  data-drawer-title=\"高级筛选\"\n  data-drawer-placement=\"right\">\n  打开抽屉\n</button>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const drawer = await JquanUI.import('drawer');\nconst panel = drawer.open({\n  id: 'filters',\n  title: '高级筛选',\n  placement: 'right',\n  content: '<p>筛选条件</p>'\n});\npanel.patch({ description: '按当前条件缩小范围' });\n// await panel.close(); // true 表示开始退出动画；state().destroyed 之后 DOM 已移除\n// panel.destroy(); // 路由卸载时立即清理",
      "preview": false
    },
    {
      "id": "options",
      "title": "选项与状态最小闭环",
      "language": "javascript",
      "code": "const drawers = await JquanUI.import('drawer');\nconst panel = drawers.open({ id: 'edit-record', title: '编辑', trapFocus: true, lockScroll: true, content: '<button>保存</button>' });\npanel.update({ title: '编辑记录' });\npanel.patch({ description: '更改会保留标题' });\nconsole.log(panel.state().isTop);\nawait panel.close('done');\n// 路由卸载需要立即结束时：panel.destroy();",
      "preview": false
    }
  ]
};
