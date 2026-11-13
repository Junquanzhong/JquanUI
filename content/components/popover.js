// JquanUI component documentation: popover
export default {
  "id": "popover",
  "title": "Popover",
  "chinese": "浮层卡片",
  "category": "基础交互",
  "version": "1.6.0",
  "file": "dist/components/popover.js",
  "api": "JquanUIComponents.popoverApi",
  "summary": "比 tooltip 信息密度更高，可放表单、快捷操作、说明块。",
  "install": "await JquanUI.import('popover'); // 手动脚本需先加载并安装 overlayManager",
  "declarative": "<div jq-popover id=\"demo-popover\">\n  <button jq-popover-trigger jq-button>查看详情</button>\n  <section jq-popover-panel>\n    <div class=\"grid gap-2\">\n      <strong>Popover 内容</strong>\n      <p class=\"text-sm text-slate-500\">适合短表单、补充说明、快捷操作。</p>\n    </div>\n  </section>\n</div>",
  "imperative": "const popovers = await JquanUI.import('popover', { install: false });\nconst popover = popovers.mount('#demo-popover', { trapFocus: true, closeOnEscape: true, closeOnOutside: true });\npopover.open();\nconsole.log(popover.state()); // boolean；销毁后为 null\n// popover.close();\n// 卸载视图时：\n// const root = popover.element(); root.removeAttribute('jq-popover'); root.remove(); popover.destroy();",
  "attrs": [
    [
      "`jq-popover`",
      "根节点"
    ],
    [
      "`jq-popover-trigger`",
      "触发器"
    ],
    [
      "`jq-popover-panel`",
      "浮层内容"
    ],
    [
      "`data-popover-trigger`",
      "`click` / `hover`"
    ],
    [
      "`data-popover-pos` / `data-popover-offset` / `data-popover-padding`",
      "默认位置、偏移距离与视口安全边距"
    ],
    [
      "`data-popover-autofocus` / `data-popover-zindex`",
      "打开时是否聚焦内容与层级值"
    ]
  ],
  "methods": [
    [
      "`mount(target, options)`",
      "返回稳定句柄；重复挂载复用首次配置，销毁后旧句柄失效"
    ],
    [
      "`open / close / toggle`",
      "打开、关闭、切换"
    ],
    [
      "`closeAll()`",
      "关闭所有浮层"
    ],
    [
      "`getState(target)`",
      "读取开关状态"
    ],
    [
      "`destroy(target)`",
      "销毁实例并解绑"
    ],
    [
      "`element()`",
      "从句柄读取根节点"
    ],
    [
      "`getHandle(target)`",
      "只读返回当前稳定句柄；未挂载、销毁或非法目标为 null，不自动挂载"
    ]
  ],
  "events": [
    [
      "`jquan:popover:open` / `jquan:popover:close`",
      "浮层打开或关闭时触发，`event.detail.placement` 为实际位置"
    ]
  ],
  "notes": [
    "比 dropdown 更适合承载自定义内容。",
    "semantic 浮层预设的面板与箭头共用 surface/border 角色，避免暗色面板配白色箭头；options.classes.arrow 可覆盖。",
    "Popover 依赖 OverlayManager，共享 Dialog/Modal/Drawer/Select 的顶层 Escape、Tab、外部点击、焦点返回与层级；Popover 不锁滚动。多个 Popover 可独立入栈，打开一个不会隐式关闭另一个。",
    "click 默认自动聚焦并限制焦点，hover 默认不移动或限制焦点。closeOnOutside 使用共享 click 事件；内部触发器不算外部。关闭事件与 onClose(reason) 带 programmatic/escape/outside/detached/destroy 原因。",
    "destroy 清理监听和待执行的定位/焦点帧；owner 移除会关闭共享层。原有定位仍使用 fixed 测量，未提供 portal；祖先 transform/overflow 可能影响位置。",
    "1.6 增加 getHandle(target)：使用与现有 API 相同的 target 解析（句柄、根/触发器/面板/内部节点、id 或选择器），返回已有实例的同一个句柄；未匹配、已销毁或非法选择器返回 null，不安装组件、不修改 DOM。要精确识别根，继续核对 handle.element() === root。Review Mode 0.13.1 通过此接口绑定原实例，再用 open/close/getState(handle) 编辑；销毁或同节点重挂后旧审查记录为 conflict。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div jq-popover id=\"demo-popover\">\n  <button jq-popover-trigger jq-button>查看详情</button>\n  <section jq-popover-panel>\n    <div class=\"grid gap-2\">\n      <strong>Popover 内容</strong>\n      <p class=\"text-sm text-slate-500\">适合短表单、补充说明、快捷操作。</p>\n    </div>\n  </section>\n</div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "const popovers = await JquanUI.import('popover', { install: false });\nconst popover = popovers.mount('#demo-popover', { trapFocus: true, closeOnEscape: true, closeOnOutside: true });\npopover.open();\nconsole.log(popover.state()); // boolean；销毁后为 null\n// popover.close();\n// 卸载视图时：\n// const root = popover.element(); root.removeAttribute('jq-popover'); root.remove(); popover.destroy();",
      "preview": false
    },
    {
      "id": "existing-handle",
      "title": "查询已挂载实例（不重新挂载）",
      "language": "javascript",
      "preview": false,
      "code": "const popovers = await JquanUI.import('popover', { install: false });\nconst current = popovers.getHandle('#demo-popover');\nif (current) {\n  console.log(current.element(), popovers.getState(current));\n}\n// 查询不创建实例；业务卸载时仍销毁先前 mount() 得到的句柄。"
    }
  ],
  "schema": {
    "mount": {
      "signature": "mount(target: HTMLElement|string, options?: PopoverOptions): PopoverHandle|null",
      "options": [
        [
          "autoFocus",
          "boolean",
          "true",
          "click 自动聚焦；hover 忽略并保留当前焦点"
        ],
        [
          "trapFocus",
          "boolean",
          "click: true / hover: false",
          "仅栈顶限制焦点"
        ],
        [
          "closeOnEscape / closeOnOutside",
          "boolean",
          "true",
          "共享栈仅关闭栈顶"
        ],
        [
          "zIndex",
          "number",
          "2147482500",
          "有限数值；共享栈保证新层在旧层之上"
        ],
        [
          "classes",
          "PopoverClasses",
          "预设类",
          "首次挂载覆盖样式"
        ],
        [
          "onClose",
          "(reason: string) => void",
          "null",
          "完成关闭后的回调"
        ]
      ],
      "returns": "稳定句柄；缺少触发器或面板时 null。重复挂载保留原配置。"
    },
    "state": {
      "signature": "handle.state(): boolean|null",
      "returns": "打开为 true，关闭为 false，销毁后 null。"
    },
    "close": {
      "signature": "handle.close(): boolean",
      "returns": "成功关闭自身层时 true；已关闭/销毁时 false。"
    },
    "getHandle": {
      "signature": "getHandle(target: PopoverTarget): PopoverHandle|null",
      "options": [
        [
          "target",
          "HTMLElement|string|PopoverHandle",
          "必填",
          "沿用 Popover target 解析；若只接受根节点，需再比较返回句柄的 element()"
        ]
      ],
      "returns": "只读返回已有稳定句柄；缺失、销毁或非法目标返回 null。不会 mount，不新增依赖或清理资源；业务仍负责销毁原句柄。"
    }
  }
};
