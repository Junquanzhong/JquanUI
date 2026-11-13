// JquanUI component documentation: carousel
export default {
  "id": "carousel",
  "title": "Carousel",
  "chinese": "轮播",
  "category": "内容与媒体",
  "version": "1.8.0",
  "file": "dist/components/carousel.js",
  "api": "JquanUIComponents.carouselApi",
  "summary": "支持方向、圆点指示器、外部分页器、缩略图导航、主从联动轮播、缩略图独立封面源、自动播放进度条、切换时间控制、触控滑动和程序化跳转。 稳定句柄隔离旧实例，update / destroy 清理自动播放进度帧。",
  "install": "JquanUI.use(JquanUIComponents.carousel);",
  "declarative": "<section jq-carousel id=\"demo-carousel\" class=\"h-48\" aria-label=\"精选内容\"\n  data-carousel-autoplay=\"false\" data-carousel-speed=\"420\">\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-blue-100 text-blue-900\">第一张</article>\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-amber-100 text-amber-900\">第二张</article>\n</section>",
  "imperative": "// 在 JquanUI.use(carousel) 自动增强之前 mount，首次配置才会生效。\nconst carousel = JquanUIComponents.carouselApi.mount('#demo-carousel', {\n  autoplay: true,\n  interval: 4000,\n  speed: 420,\n  indicators: true,\n  onChange(index, handle) { console.log(index, handle.state()); }\n});\nJquanUI.use(JquanUIComponents.carousel); // 安装组件样式与声明式 behavior\n\ncarousel.goTo(1, false); // 索引从 0 开始；false 表示不使用切换动画\ncarousel.pause();\n// 视图卸载时（移除声明式标记，避免排队的增强再次挂载）：\n// const root = carousel.element();\n// root.removeAttribute('jq-carousel'); root.remove(); carousel.destroy();",
  "attrs": [
    [
      "`jq-carousel` / `jq-carousel-item`",
      "轮播根节点与内容项；根节点需有可测量宽高，例如 h-48。"
    ],
    [
      "`data-carousel-autoplay` / `data-carousel-interval`",
      "自动播放（默认 true）与毫秒间隔；最小 1200ms，推荐显式设置 4000。"
    ],
    [
      "`data-carousel-speed` / `data-carousel-direction`",
      "切换毫秒数与 horizontal / vertical；推荐显式设置 speed=420。"
    ],
    [
      "`data-carousel-arrows` / `data-carousel-indicators`",
      "前后按钮与圆点；均默认 true，写 false 关闭。"
    ],
    [
      "`data-carousel-visible` / `data-carousel-step` / `data-carousel-gap`",
      "可见项数、每次移动项数、像素间距。"
    ],
    [
      "`data-carousel-progress` / `data-carousel-thumbs`",
      "自动播放进度条与缩略图导航；写 true 启用。"
    ],
    [
      "`data-carousel-indicators-target` / `data-carousel-thumbs-target`",
      "外部圆点 / 缩略图容器的选择器。"
    ],
    [
      "`data-carousel-thumb-src` / `data-carousel-thumb-alt` / `data-carousel-thumb`",
      "写在内容项上：独立缩略图地址、替代文本或缩略图文字。"
    ],
    [
      "`data-carousel-sync-target`",
      "另一轮播根节点选择器；两个实例须先挂载，内容数量与顺序保持一致。"
    ]
  ],
  "methods": [
    [
      "`mount(target, options?)`",
      "target 为选择器或 Element，返回稳定句柄或 null；重复挂载返回同一对象，新 options 不会重新应用。"
    ],
    [
      "`handle.goTo(index, animate?) / goToPage(page, animate?)`",
      "以 0 为起点切换项目 / 页面；全局 API 在第一个参数传 target。"
    ],
    [
      "`handle.next() / prev()`",
      "按 slidesPerScroll 移动。"
    ],
    [
      "`handle.play() / pause() / setAutoplay(boolean)`",
      "播放、暂停或修改 autoplay；play() 需要 autoplay 未禁用。"
    ],
    [
      "`handle.setInterval(ms)`",
      "更新间隔，最小 1200ms；保留原先是否播放的状态。"
    ],
    [
      "`handle.setIndicators(boolean) / setProgress(boolean)`",
      "运行时开关圆点与自动播放进度条；不重建内容、不中断当前页，返回是否成功。"
    ],
    [
      "`handle.update(options)`",
      "从首次挂载的原 HTML 重建轮播，清理旧进度 RAF 与外部缩略图 / 指示器包装，位置按 startIndex 重新计算；返回同一稳定句柄。"
    ],
    [
      "`handle.state() / element()`",
      "读取状态 / 根节点；销毁后均返回 null。全局读取状态用 getState(target)。"
    ],
    [
      "`handle.destroy()` / `carouselApi.destroy(target)`",
      "停止播放、取消进度 RAF、解绑监听、断开 ResizeObserver 并恢复原始内容；首次销毁返回 true，再次为 false。旧句柄不控制重挂实例。"
    ],
    [
      "`getHandle(target)`",
      "只读获取已挂载稳定句柄，不挂载；子节点解析到所属轮播，未挂载返回 null"
    ]
  ],
  "schema": {
    "mount": {
      "signature": "mount(target, options): CarouselHandle|null",
      "options": [
        [
          "target",
          "string | Element",
          "必填",
          "选择器或根节点；options 的摘要见后续行。"
        ],
        [
          "direction",
          "'horizontal' | 'vertical'",
          "'horizontal'",
          "方向；vertical 需要给根节点明确高度。"
        ],
        [
          "autoplay",
          "boolean",
          "true",
          "自动播放；静态内容建议显式设为 false。"
        ],
        [
          "interval",
          "number",
          "4000",
          "毫秒，最小 1200；缺失、null 或空字符串回退默认值。"
        ],
        [
          "speed",
          "number",
          "420",
          "切换毫秒数，最小 0；缺失、null 或空字符串回退默认值，显式 0 禁用切换动画。"
        ],
        [
          "easing",
          "string",
          "'cubic-bezier(0.22, 1, 0.36, 1)'",
          "切换曲线。"
        ],
        [
          "pauseOnHover / pauseOnVisibilityHidden",
          "boolean",
          "true / true",
          "悬停 / 页面进入后台时暂停；后者仅通过 options 设置。"
        ],
        [
          "arrows / indicators / keyboard / drag",
          "boolean",
          "true / true / true / true",
          "前后按钮、页码圆点、键盘和拖动。"
        ],
        [
          "infinite",
          "boolean",
          "true",
          "使用克隆项目进行循环；false 到边界停止。"
        ],
        [
          "visibleCount / slidesPerScroll",
          "number",
          "1 / 1",
          "可见数量 / 单次移动数量，最小均为 1。"
        ],
        [
          "startIndex / gap",
          "number",
          "0 / 0",
          "起始索引（0 起）/ 像素间距，最小均为 0。"
        ],
        [
          "dragThreshold",
          "number",
          "0.18",
          "拖动比例阈值，范围 0.05–0.8。"
        ],
        [
          "adaptiveHeight / progress / thumbnails",
          "boolean",
          "false / false / false",
          "内容自适应高度、播放进度条、缩略图导航。"
        ],
        [
          "thumbnailsTarget / indicatorsTarget",
          "string | Element | null",
          "null / null",
          "外部缩略图 / 圆点容器；挂载时替换容器内容，update / destroy 仅移除本实例生成的包装，不移除容器或其余内容。"
        ],
        [
          "syncTarget",
          "string | Element | null",
          "null",
          "同步轮播目标，项目索引保持一致。"
        ],
        [
          "onChange",
          "(index, handle) => void | null",
          "null",
          "挂载完成和切换时调用；在首次 mount 中传入。"
        ]
      ],
      "returns": "返回稳定 CarouselHandle；目标不存在或没有 [jq-carousel-item] 时返回 null。重复 mount 返回同一对象且不应用新 options；update(options) 返回同一句柄。句柄包含 next、prev、goTo、goToPage、play、pause、setInterval、setAutoplay、setIndicators、setProgress、update、state、element、destroy。销毁后旧句柄的操作返回 false，update/state/element 返回 null；即使同 id 重挂也不会控制新实例。"
    },
    "state": {
      "signature": "state(): CarouselState|null",
      "returns": "包含 currentIndex、currentPage、pageCount、total、isPlaying、isDragging、visibleCount、interval、autoplay、indicators、progress、thumbnails、syncTarget、progressPercent。索引 / 页码从 0 开始；销毁后返回 null。"
    },
    "lifecycle": {
      "signature": "handle.update(options): CarouselHandle|null; handle.destroy(): boolean",
      "returns": "update 清理旧进度 RAF 与本实例生成的外部包装，从首次挂载的原 HTML 重建结构，保留句柄身份。destroy 清理播放计时、进度 RAF、监听与 ResizeObserver，恢复首次挂载的原 HTML；旧实例的排队进度任务不会写入新结构。destroy 本身不禁止 Core 对仍保留声明式标记的节点再次增强，卸载仍需移除标记与根节点。"
    },
    "getHandle": {
      "signature": "getHandle(target: CarouselTarget): CarouselHandle|null",
      "options": [
        [
          "target",
          "HTMLElement|string|CarouselHandle",
          "必填",
          "支持现有轮播根、内部节点、id/选择器或句柄"
        ]
      ],
      "returns": "返回当前已挂载实例的稳定句柄，不初始化、不重建、不改变播放。内部节点可解析到所属轮播；需要精确根匹配时检查 handle.element() === targetNode。缺失或已销毁句柄返回null。无额外依赖；句柄销毁沿用 destroy()。"
    }
  },
  "notes": [
    "类型从 jquanui/components/carousel 导入 CarouselApi、CarouselOptions、CarouselHandle、CarouselState；JquanUI.import('carousel') 也返回精确 API 类型。next / prev / 自动播放同步 state.currentIndex 与画面。mount / update 回调中若销毁或替换当前实例，原调用返回 null，旧播放任务不会启动替代实例。",
    "依赖当前 Core；carousel 没有其他组件依赖。把以下最小示例保存到项目根目录的 HTML 中即可运行，脚本路径以该目录为准。",
    "纯声明式在内容节点之后加载 Core / carousel 并 use。需要 options 或回调时，先 mount(options)，再 use 安装样式；如果已由 behavior 增强，则用 update(options)。重复 mount 不覆盖已有配置。",
    "Carousel 的内容使用克隆节点构造轨道；图片写 alt，交互项避免重复 id，不要把依赖原 DOM 引用或绑定的业务监听器直接嵌入内容项。",
    "外部缩略图 / 指示器容器挂载时会清空。update 始终从首次挂载保存的原 HTML 重建，不重复采集生成的克隆项；位置按 startIndex 定位。update / destroy 仅移除本实例生成在根节点外的缩略图 / 指示器包装，不移除外部容器或后来加入的其他内容。destroy 恢复首次挂载的原 HTML。动态业务内容不会自动写回原始快照，变更内容前应销毁并重新挂载。已安装声明式 behavior 时，销毁视图先移除 jq-carousel 标记与根节点，再 destroy，避免排队的 Core 增强重新挂载。",
    "装饰和外层布局使用 Core 原子类；只需两三张内容也可直接使用本最小声明式，不需要手写定时器。",
    "Carousel 1.8：setIndicators/setProgress 只替换由本实例拥有的控制节点，保留当前页、内容、句柄和自动播放计时；关闭后外部容器中的其他内容不被恢复。update / destroy 会取消旧进度 requestAnimationFrame；不要自建轮播进度循环。",
    "Carousel 1.7 增加只读 getHandle(target)，适用于 Review Mode 等扩展；不要用 mount() 探测是否已挂载。Review Mode 0.6 仅支持 autoplay/interval，通过原句柄 setter 编辑，不调用会重建内部 DOM 的 update。"
  ],
  "kind": "ui",
  "examples": [
    {
      "id": "declarative",
      "title": "声明式用法",
      "language": "html",
      "code": "<section jq-carousel id=\"demo-carousel\" class=\"h-48\" aria-label=\"精选内容\"\n  data-carousel-autoplay=\"false\" data-carousel-speed=\"420\">\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-blue-100 text-blue-900\">第一张</article>\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-amber-100 text-amber-900\">第二张</article>\n</section>",
      "preview": true
    },
    {
      "id": "imperative",
      "title": "命令式 / API 用法",
      "language": "javascript",
      "code": "// 在 JquanUI.use(carousel) 自动增强之前 mount，首次配置才会生效。\nconst carousel = JquanUIComponents.carouselApi.mount('#demo-carousel', {\n  autoplay: true,\n  interval: 4000,\n  speed: 420,\n  indicators: true,\n  onChange(index, handle) { console.log(index, handle.state()); }\n});\nJquanUI.use(JquanUIComponents.carousel); // 安装组件样式与声明式 behavior\n\ncarousel.goTo(1, false); // 索引从 0 开始；false 表示不使用切换动画\ncarousel.pause();\n// 视图卸载时（移除声明式标记，避免排队的增强再次挂载）：\n// const root = carousel.element();\n// root.removeAttribute('jq-carousel'); root.remove(); carousel.destroy();",
      "preview": false
    },
    {
      "id": "lifecycle",
      "title": "最小运行闭环：声明式，无需自写定时器",
      "language": "html-javascript",
      "preview": false,
      "code": "<section jq-carousel id=\"demo-carousel\" class=\"h-48\" aria-label=\"精选内容\"\n  data-carousel-autoplay=\"false\" data-carousel-speed=\"420\">\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-blue-100 text-blue-900\">第一张</article>\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-amber-100 text-amber-900\">第二张</article>\n</section>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n<script src=\"./dist/components/carousel.js\"></script>\n<script>\n  JquanUI.use(JquanUIComponents.carousel);\n  // 按钮、圆点、方向键和拖动已可用；此处不需要 mount。\n  // 视图卸载时：\n  // const root = document.querySelector('#demo-carousel');\n  // root.removeAttribute('jq-carousel'); root.remove();\n  // JquanUIComponents.carouselApi.destroy(root);\n</script>"
    },
    {
      "id": "api-lifecycle",
      "title": "最小运行闭环：命令式，带回调",
      "language": "html-javascript",
      "preview": false,
      "code": "<section jq-carousel id=\"demo-carousel\" class=\"h-48\" aria-label=\"精选内容\"\n  data-carousel-autoplay=\"false\" data-carousel-speed=\"420\">\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-blue-100 text-blue-900\">第一张</article>\n  <article jq-carousel-item class=\"flex h-full items-center justify-center bg-amber-100 text-amber-900\">第二张</article>\n</section>\n<script src=\"./dist/core/JquanUI@Core.js\"></script>\n<script src=\"./dist/components/carousel.js\"></script>\n<script>\n  // 在 JquanUI.use(carousel) 自动增强之前 mount，首次配置才会生效。\n  const carousel = JquanUIComponents.carouselApi.mount('#demo-carousel', {\n    autoplay: true,\n    interval: 4000,\n    speed: 420,\n    indicators: true,\n    onChange(index, handle) { console.log(index, handle.state()); }\n  });\n  JquanUI.use(JquanUIComponents.carousel); // 安装组件样式与声明式 behavior\n  \n  carousel.goTo(1, false); // 索引从 0 开始；false 表示不使用切换动画\n  carousel.pause();\n  // 视图卸载时（移除声明式标记，避免排队的增强再次挂载）：\n  // const root = carousel.element();\n  // root.removeAttribute('jq-carousel'); root.remove(); carousel.destroy();\n</script>"
    },
    {
      "id": "stable-lifecycle",
      "title": "稳定句柄与同 id 重挂隔离",
      "language": "javascript",
      "preview": false,
      "code": "// 在上述最小 HTML / 引入基础上执行\nconst api = JquanUIComponents.carouselApi;\nconst handle = api.mount('#demo-carousel');\nconsole.log(api.mount('#demo-carousel') === handle); // true\nconsole.log(handle.update({ interval: 4000, speed: 0 }) === handle); // true\nconst root = handle.element();\nroot.removeAttribute('jq-carousel');\nroot.remove();\nhandle.destroy();\nconsole.log(handle.state(), handle.element()); // null, null\n// 再插入具有同 id 的新节点并 mount 后，旧 handle.next() 仍为 false。"
    },
    {
      "id": "existing-handle",
      "title": "只读取现有轮播实例",
      "language": "javascript",
      "preview": false,
      "code": "const carousel = await JquanUI.import(\"carousel\");\nconst root = document.querySelector(\"#demo-carousel\");\nconst handle = carousel.getHandle(root); // 不挂载；未挂载时 null\nif (handle && handle.element() === root) console.log(handle.state());\n// 调用方自行决定是否 mount；路由卸载时 handle?.destroy()。"
    }
  ],
  "events": [
    [
      "`jquan:carousel:change`",
      "切换时冒泡；detail 包含 index、total、state、instance。onChange(index, handle) 使用相同索引。"
    ],
    [
      "`jquan:carousel:play / pause / update`",
      "播放状态或配置变化时冒泡；detail 包含当前 state 与 instance。"
    ]
  ]
};
