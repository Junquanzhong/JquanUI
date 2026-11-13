// JquanUI component documentation: tabs
export default {
  "id": "tabs",
  "title": "Tabs",
  "chinese": "标签页",
  "category": "基础交互",
  "version": "2.5.0",
  "file": "dist/components/tabs.js",
  "api": "JquanUIComponents.tabsApi",
  "summary": "支持 static / fade / slide 三种切换模式，键盘操作、滑动切换、自动播放、hash 同步。 稳定句柄与过渡任务取消支持视图更新和卸载。",
  "install": "JquanUI.use(JquanUIComponents.tabs);",
  "declarative": "<div jq-tabs id=\"demo-tabs\" data-tabs-mode=\"static\">\n  <nav jq-tab-list aria-label=\"内容分类\">\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-api\">API</button>\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-example\">示例</button>\n  </nav>\n  <div jq-tab-content>\n    <section id=\"demo-tabs-api\" jq-tab-panel>API 内容</section>\n    <section id=\"demo-tabs-example\" jq-tab-panel>示例内容</section>\n  </div>\n</div>",
  "imperative": "// 在 JquanUI.use(tabs) 自动增强之前 mount，首次配置才会生效。\nconst tabs = JquanUIComponents.tabsApi.mount('#demo-tabs', {\n  mode: 'fade',\n  onChange(index, panel, handle) { console.log(index, panel.id, handle.state()); }\n});\nJquanUI.use(JquanUIComponents.tabs);\n\ntabs.goTo(1, { animate: false }); // 索引从 0 开始\nconsole.log(tabs.state());\n// 视图卸载时：\n// const root = tabs.element();\n// root.removeAttribute('jq-tabs'); root.remove(); tabs.destroy();",
  "attrs": [
    [
      "`data-tabs-mode`",
      "`static` / `fade` / `slide`"
    ],
    [
      "`data-tabs-trigger`",
      "`click` / `hover`"
    ],
    [
      "`data-tabs-autoplay`",
      "是否自动轮播"
    ],
    [
      "`data-tabs-hash-sync`",
      "是否同步 hash"
    ],
    [
      "`data-tabs-default` / `data-tabs-keyboard`",
      "默认索引与是否启用键盘导航"
    ],
    [
      "`data-tabs-swipe` / `data-tabs-swipe-threshold`",
      "是否允许触摸滑动与滑动触发阈值"
    ],
    [
      "`data-tabs-interval` / `data-tabs-pause-hover` / `data-tabs-loop`",
      "自动播放间隔、悬停暂停与是否循环"
    ]
  ],
  "methods": [
    [
      "`mount(target, options?)`",
      "返回稳定句柄或 null；重复 mount 返回同一对象，不应用新的 options。"
    ],
    [
      "`handle.goTo(index, options?) / next() / prev()`",
      "以 0 为起点切换标签；goTo 的 options 可传 animate / focus。"
    ],
    [
      "`handle.play() / pause()`",
      "自动播放控制。"
    ],
    [
      "`handle.state() / element()`",
      "读取当前状态 / 根节点；销毁后均为 null。全局读取状态用 getState(target)。"
    ],
    [
      "`handle.update(options)` / `tabsApi.update(target, options)`",
      "取消上一过渡完成任务与待执行焦点，再应用配置；返回同一稳定句柄。"
    ],
    [
      "`handle.destroy()` / `tabsApi.destroy(target)`",
      "停止播放、取消过渡完成任务及待执行焦点、解绑事件；首次 true，再次 false，旧句柄不控制重挂实例。"
    ],
    [
      "`getHandle(target)`",
      "只读获取现有稳定句柄，不挂载；子节点解析到所属标签页"
    ],
    [
      "`handle.setInterval(ms) / setAutoplay(value)`",
      "以公开 setter 修改自动播放配置，并触发 jquan:tabs:update"
    ],
    [
      "`handle.setLoop(loop)`",
      "仅 boolean；无损切换首尾循环，true 循环、false 停在边界；不移动当前页，不重启播放。"
    ]
  ],
  "events": [
    [
      "`jquan:tabs:change`",
      "切换完成后冒泡；event.detail 为 { index, panel, instance }，状态通过 instance.state() 获取。首次 mount 的激活也会触发。"
    ],
    [
      "`jquan:tabs:update`",
      "配置 setter 更新后冒泡，detail 为 { option, value, instance }；loop 使用原稳定句柄，无导航 change。"
    ]
  ],
  "schema": {
    "mount": {
      "signature": "mount(target, options): TabsHandle|null",
      "options": [
        [
          "target",
          "string | Element",
          "必填",
          "选择器或根节点；options 的摘要见后续行。"
        ],
        [
          "mode",
          "'static' | 'fade' | 'slide'",
          "'static'",
          "面板切换模式。"
        ],
        [
          "trigger",
          "'click' | 'hover'",
          "'click'",
          "点击或悬停激活。"
        ],
        [
          "defaultIndex",
          "number",
          "0",
          "初始索引，0 起；hashSync 命中或已有 active 状态时可能覆盖。"
        ],
        [
          "keyboard / swipeable",
          "boolean",
          "true / true",
          "方向键、Home/End / 触摸滑动。"
        ],
        [
          "swipeThreshold",
          "number",
          "48",
          "像素阈值；缺失、null 或空字符串使用 48。"
        ],
        [
          "hashSync",
          "boolean",
          "false",
          "初始化读取 hash，激活时 replaceState 更新 hash；不监听后续 hashchange。"
        ],
        [
          "autoplay",
          "boolean",
          "false",
          "是否自动切换；play() 只在 autoplay 已启用时启动计时。"
        ],
        [
          "interval",
          "number",
          "3200",
          "自动切换毫秒间隔，最小 1200。"
        ],
        [
          "pauseOnHover / loop",
          "boolean",
          "true / true",
          "悬停暂停 / 所有切换是否循环，loop 也影响 goTo 和键盘。"
        ],
        [
          "duration",
          "number",
          "320",
          "切换完成回调延时，缺失、null 或空字符串使用 320；显式 0 有效，立即完成且不等待计时器。slide 的 CSS transition 使用该值，fade 的 CSS 固定 duration-300。"
        ],
        [
          "classes",
          "Record<string, string>",
          "{}",
          "覆盖 root、list、tab、tabActive、tabInactive、tabContent、panel、panelHidden、track、panelSlide、focus；先读源码确认使用位置。"
        ],
        [
          "onChange",
          "(index, panel, handle) => void | null",
          "null",
          "初次激活及后续切换完成时回调。"
        ]
      ],
      "returns": "返回稳定 TabsHandle；目标选择器未匹配，或缺少 tab list、tab、panel 时返回 null。重复 mount 返回同一对象且不应用新的 options；update 返回同一句柄。句柄包含 goTo、next、prev、play、pause、update、state、element、destroy。销毁后旧句柄的操作返回 false，update/state/element 返回 null；同 id 重挂返回新句柄，旧句柄不控制新实例。"
    },
    "state": {
      "signature": "state(): TabsState|null",
      "returns": "包含 currentIndex、total、mode、isPlaying、interval、autoplay、loop 的状态快照。销毁后返回 null。"
    },
    "goTo": {
      "signature": "handle.goTo(index, options?): boolean",
      "options": [
        [
          "index",
          "number",
          "必填",
          "0 起的面板索引；loop=true 时循环归一，false 时限制在边界。"
        ],
        [
          "options.animate",
          "boolean",
          "true",
          "false 时立即更新状态并同步触发 change。"
        ],
        [
          "options.focus",
          "boolean",
          "false",
          "完成切换后聚焦对应 tab。"
        ]
      ],
      "returns": "成功接收切换时 true；实例已销毁、索引无效或上一切换未完成时 false。全局形式为 tabsApi.goTo(target, index, options)。"
    },
    "lifecycle": {
      "signature": "handle.update(options): TabsHandle|null; handle.destroy(): boolean",
      "returns": "update 取消旧过渡的完成回调与待执行焦点，再同步激活当前索引；该新激活仍会触发当前 onChange/change。destroy 取消过渡与自动播放，旧任务不会再触发 change 或抢回焦点；不恢复已修改的 DOM 属性、class 或 slide 轨道。"
    },
    "getHandle": {
      "signature": "getHandle(target: TabsTarget): TabsHandle|null",
      "options": [
        [
          "target",
          "HTMLElement|string|TabsHandle",
          "必填",
          "现有标签页根、内部节点、选择器或句柄"
        ]
      ],
      "returns": "返回现有已挂载实例的稳定句柄；不初始化、不改变当前索引。缺失/销毁返回 null。"
    },
    "setLoop": {
      "signature": "handle.setLoop(loop: boolean): boolean",
      "options": [
        [
          "loop",
          "boolean",
          "必填",
          "是否首尾循环；默认配置为 true。仅接受 boolean，不接受字符串。"
        ]
      ],
      "returns": "活实例接收配置返回 true；无效类型或已销毁返回 false。只改现有实例的边界策略，不重建 DOM、不改变当前索引/焦点、不触发 change、不改变播放/暂停或重置计时。next/prev/goTo、键盘、滑动和后续自动播放均读取新配置。loop=false 时自动播放在末页保持运行并停留，不自动暂停。"
    }
  },
  "notes": [
    "类型从 jquanui/components/tabs 导入 TabsApi、TabsOptions、TabsHandle、TabsState；JquanUI.import('tabs') 也返回精确 API 类型。mount / update 的 onChange 中若销毁或替换当前实例，原调用返回 null，旧调用不会启动替代实例的自动播放。",
    "依赖当前 Core；tabs 没有强制组件依赖。可选 uiPreset 需先加载；未加载时使用内置外观。最小 HTML 保存到项目根目录即可运行。",
    "纯声明式只需在节点之后加载脚本并 use。需要 options / 回调时先 mount(options)，再 use；若节点已经增强，用 update(options)，重复 mount 不覆盖配置。",
    "每个 tab 的 jq-target 指向唯一的 panel id。命令式和 data-tabs-* 配置作用于同一实例，显式 options 优先。动态插入的声明式根节点可调用 JquanUI.enhance(root)。",
    "点击、键盘和触摸会停止自动播放；需要继续时调用 play()，前提是 autoplay 已启用，可用 update({ autoplay: true }) 启用。",
    "hashSync 读取初始 hash 并在切换时写入 URL，不是路由组件；路由内容由 router 负责。",
    "Tabs 2.3：update / destroy 取消旧过渡完成回调和待执行焦点，destroy 同时停止播放并解绑事件；不恢复已增加的 DOM 属性、class 或 slide 轨道。销毁视图仍应先移除 jq-tabs 标记与根节点，再 destroy；destroy 本身不禁止 Core 对保留声明式标记的节点再次增强。",
    "重复 mount、update、onChange 与事件中的 instance 使用同一稳定句柄。销毁后 state()/element() 为 null；同 id 重挂得到新句柄，旧句柄不能切换、更新或销毁新实例。",
    "Tabs 2.4 增加 getHandle、setInterval、setAutoplay，供 Review Mode 等扩展读取和修改真实配置。setter 不重建面板；间隔必须>=1200毫秒。更新会冒泡 jquan:tabs:update，销毁后旧句柄不影响重挂实例。",
    "Tabs 2.5 新增稳定句柄 setLoop(boolean) 与 state().loop。只改变运行时配置，data-tabs-loop 初始化属性保持原样；如需持久化由应用保存。Review Mode 0.16 可编辑 component:tabs.loop，仍按需导入；destroy 清理实例后旧 setter 返回 false。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<div jq-tabs id=\"demo-tabs\" data-tabs-mode=\"static\">\n  <nav jq-tab-list aria-label=\"内容分类\">\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-api\">API</button>\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-example\">示例</button>\n  </nav>\n  <div jq-tab-content>\n    <section id=\"demo-tabs-api\" jq-tab-panel>API 内容</section>\n    <section id=\"demo-tabs-example\" jq-tab-panel>示例内容</section>\n  </div>\n</div>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "// 在 JquanUI.use(tabs) 自动增强之前 mount，首次配置才会生效。\nconst tabs = JquanUIComponents.tabsApi.mount('#demo-tabs', {\n  mode: 'fade',\n  onChange(index, panel, handle) { console.log(index, panel.id, handle.state()); }\n});\nJquanUI.use(JquanUIComponents.tabs);\n\ntabs.goTo(1, { animate: false }); // 索引从 0 开始\nconsole.log(tabs.state());\n// 视图卸载时：\n// const root = tabs.element();\n// root.removeAttribute('jq-tabs'); root.remove(); tabs.destroy();",
      "preview": false
    },
    {
      "id": "lifecycle",
      "title": "最小运行闭环：声明式，只需点击切换",
      "language": "html-javascript",
      "preview": false,
      "code": "<div jq-tabs id=\"demo-tabs\" data-tabs-mode=\"static\">\n  <nav jq-tab-list aria-label=\"内容分类\">\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-api\">API</button>\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-example\">示例</button>\n  </nav>\n  <div jq-tab-content>\n    <section id=\"demo-tabs-api\" jq-tab-panel>API 内容</section>\n    <section id=\"demo-tabs-example\" jq-tab-panel>示例内容</section>\n  </div>\n</div>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n<script src=\"./dist/components/tabs.js\"></script>\n<script>\n  JquanUI.use(JquanUIComponents.tabs);\n  // 点击和方向键、Home/End 已可用；此处不需要 mount。\n  // 视图卸载时：\n  // const root = document.querySelector('#demo-tabs');\n  // root.removeAttribute('jq-tabs'); root.remove();\n  // JquanUIComponents.tabsApi.destroy(root);\n</script>"
    },
    {
      "id": "api-lifecycle",
      "title": "最小运行闭环：命令式，带回调",
      "language": "html-javascript",
      "preview": false,
      "code": "<div jq-tabs id=\"demo-tabs\" data-tabs-mode=\"static\">\n  <nav jq-tab-list aria-label=\"内容分类\">\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-api\">API</button>\n    <button type=\"button\" jq-tab jq-target=\"#demo-tabs-example\">示例</button>\n  </nav>\n  <div jq-tab-content>\n    <section id=\"demo-tabs-api\" jq-tab-panel>API 内容</section>\n    <section id=\"demo-tabs-example\" jq-tab-panel>示例内容</section>\n  </div>\n</div>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n<script src=\"./dist/components/tabs.js\"></script>\n<script>\n  // 在 JquanUI.use(tabs) 自动增强之前 mount，首次配置才会生效。\n  const tabs = JquanUIComponents.tabsApi.mount('#demo-tabs', {\n    mode: 'fade',\n    onChange(index, panel, handle) { console.log(index, panel.id, handle.state()); }\n  });\n  JquanUI.use(JquanUIComponents.tabs);\n  \n  tabs.goTo(1, { animate: false }); // 索引从 0 开始\n  console.log(tabs.state());\n  // 视图卸载时：\n  // const root = tabs.element();\n  // root.removeAttribute('jq-tabs'); root.remove(); tabs.destroy();\n</script>"
    },
    {
      "id": "stable-lifecycle",
      "title": "更新取消旧过渡，duration 0 立即完成",
      "language": "javascript",
      "preview": false,
      "code": "// 在上述最小 HTML / 引入基础上执行\nconst api = JquanUIComponents.tabsApi;\nconst tabs = api.mount('#demo-tabs');\nconsole.log(api.mount('#demo-tabs') === tabs); // true\ntabs.goTo(1, { focus: true });\n// 旧过渡的完成回调与焦点任务取消；新配置同步激活当前索引。\nconsole.log(tabs.update({ duration: 0 }) === tabs); // true\ntabs.goTo(0); // duration: 0 立即完成\nconst root = tabs.element();\nroot.removeAttribute('jq-tabs'); root.remove(); tabs.destroy();\nconsole.log(tabs.state(), tabs.element()); // null, null\n// 同 id 重挂后旧 tabs.goTo(1) 返回 false。"
    },
    {
      "id": "existing-handle",
      "title": "读取并调整已有实例",
      "language": "javascript",
      "preview": false,
      "code": "const tabs = await JquanUI.import(\"tabs\");\nconst handle = tabs.getHandle(\"#demo-tabs\");\nif (handle && handle.element() === document.querySelector(\"#demo-tabs\")) {\n  handle.setInterval(5000);\n  handle.setAutoplay(false);\n  handle.setLoop(false); // 末页停留；true 恢复首尾循环\n  console.log(handle.state().loop);\n}\n// getHandle 不会自动 mount；未挂载时先由业务决定是否 mount。"
    }
  ]
};
