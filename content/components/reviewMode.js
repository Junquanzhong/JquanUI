// JquanUI component documentation: reviewMode
export default {
  "id": "reviewMode",
  "title": "Review Mode",
  "chinese": "可视化审查模式",
  "category": "浏览器工具",
  "version": "0.18.1",
  "file": "dist/components/reviewMode.js",
  "api": "JquanUIComponents.reviewModeApi",
  "summary": "独立按需页面审查：文字、35 个语义字段、元素导航、可见 Select 点选、Carousel/Tabs/Select/Popover 配置、持久化草稿、严格方案预检/应用、去重清单及撤销。",
  "install": "// 在需要审查时执行；自动加载并安装 Copy 依赖\nconst review = await JquanUI.import(\"reviewMode\");\nreview.configure({ enabled: true, root: \"#preview\" });\nreview.open();\n// Core / Full / Components 均不内置审查实现；普通访问无需导入。",
  "declarative": "<button type=\"button\" data-jq-review-open>审查 / 修改页面</button>\n<main id=\"preview\"><h1 data-jq-review-key=\"title\">预览内容</h1></main>\n<script>\n// Core 已加载；只在点击时导入。完整示例另含加载失败重试和 URL 入口。\ndocument.querySelector(\"[data-jq-review-open]\").addEventListener(\"click\", async () => {\n  const review = await JquanUI.import(\"reviewMode\");\n  if (!review.state().enabled) review.configure({ enabled: true, root: \"#preview\" });\n  review.open();\n});\n</script>",
  "imperative": "const review = await JquanUI.import(\"reviewMode\");\nreview.configure({ enabled: true, root: \"#preview\", allowURL: true });\nreview.open();\nreview.select(\"[data-jq-review-key=title]\");\nreview.setText(\"客户确认的新标题\");\nreview.setUtility(\"font-size\", \"text-md\");\nreview.setUtility(\"font-size\", \"text-lg\");\nreview.undo(); review.redo();\nconsole.log(review.changes()); // 字号仅保留最终 text-lg，before 是首次原值\nawait review.copyPlan(); // 摘要 + JSON；关闭 UI 后仍可导出\nconsole.log(review.exportPlan(\"json\"));\nreview.saveDraft(\"client-home\");\nreview.close();\n// 离开预览前先保存方案；销毁恢复未被外部覆盖的预览字段\nreview.destroy();",
  "attrs": [
    [
      "`data-jq-review-open`",
      "组件已启用时打开会话；首次加载前由应用按钮监听器调用 import，Core 不接管此属性"
    ],
    [
      "`data-jq-review-key`",
      "为元素提供稳定的客户可读定位键"
    ],
    [
      "`?jqui-review=1`",
      "已加载并 configure(enabled:true) 后检查；若要 URL 触发首次下载，由页面检测参数再 import，见完整示例"
    ]
  ],
  "methods": [
    [
      "`configure(options)`",
      "启用与替换会话配置，恢复旧会话仍持有的字段"
    ],
    [
      "`open()` / `close()` / `toggle()` / `select(target)`",
      "选择、浏览和关闭；close 保留预览与历史"
    ],
    [
      "`navigate(direction)`",
      "选择外层、内部或相邻元素，滚动到目标；不产生修改记录"
    ],
    [
      "`setText(value, index?)`",
      "修改直接文本节点，保留嵌套元素"
    ],
    [
      "`setUtility(property, token|null)`",
      "校验并替换同字段基础原子类，保留变体"
    ],
    [
      "`utilities(query?)`",
      "按中文字段、分组、候选标签或原子类子串过滤目录快照"
    ],
    [
      "`setAttribute(name, value|null)`",
      "修改允许的文字 / 链接属性，null 移除"
    ],
    [
      "`undo()` / `redo()` / `reset()`",
      "撤销、重做、无冲突时整体还原"
    ],
    [
      "`changes()` / `exportPlan(format?)`",
      "读取最终值快照、摘要 / JSON 字符串；utilities 返回当前 Core 可用候选"
    ],
    [
      "`copyPlan(format?)`",
      "通过 Copy 组件复制方案，Promise<boolean>"
    ],
    [
      "`saveDraft(key?)` / `loadDraft(key?)` / `clearDraft(key?)`",
      "使用 localStorage 保存、读取或删除 detached 修改方案；不会自动应用草稿"
    ],
    [
      "`applyPlan(plan, options?)`",
      "默认 dry-run 严格检查页面、稳定定位、schema、原值和冲突；显式 dryRun:false 才应用当前预览 DOM，不写源文件"
    ],
    [
      "`state()` / `destroy()`",
      "会话状态 / 恢复仍持有的字段后清理并禁用"
    ],
    [
      "`revert(target, field)`",
      "还原原始节点的一项净修改；支持撤销，冲突/脱离/无修改时返回 false"
    ],
    [
      "`componentOptions()` / `setComponentOption(component, option, value)`",
      "读取已挂载 Carousel 1.8+、Tabs 2.4+、Select 1.4+ 与 Popover 1.6+ 的真实配置候选，或通过公开 setter/API 编辑；不自动导入/挂载业务组件"
    ]
  ],
  "notes": [
    "reviewMode 是独立按需组件；Core、压缩 Core、Full 和 Components 均不嵌入其实现。JquanUI.import(\"reviewMode\") 才加载运行时，自动安装 Copy；已在 Full/Components 注册的 Copy 会复用。仅配置 JQUAN_CONFIG.reviewMode 或在 URL 加参数，不会使 Core 自动下载组件。",
    "客户用文字片段输入、字号/颜色/字重/对齐/圆角下拉项、属性输入和底部撤销/重做/复制按钮；高级原始信息折叠保留。面板外观复用 Core 原子类，位置/叠层使用测量所需的内联 style。",
    "只在预览 DOM 实时修改；复制方案供开发者或 AI 在源文件落实。没有页面源码映射、自动源码回写或跨 iframe/ShadowRoot。saveDraft/loadDraft/clearDraft 仅通过浏览器 localStorage 保存和读取最终值方案，不自动写回页面；applyPlan 只作用于当前预览 DOM。",
    "close 保留预览，configure/destroy 恢复仍持有的字段；存在页面外部更新时保留该更新。reset 冲突时不部分还原。结束验收前复制或 saveDraft 方案；刷新页面不会保留本会话，但可用 loadDraft 读取 detached 方案。",
    "结构化内容编辑使用直接 Text 节点，不打平 HTML；内容结构被外部程序替换时标记冲突，不修改替代节点。组件标记仍只读；仅通过下方明确列出的适配器编辑公开配置，不推测内部 state/options。",
    "同一字段改回原值后从 changes/export 中消失，历史仍可撤销；同一字段多次编辑只导出最终值，首次 before 不被中间值覆盖。",
    "基础类编辑保留变体；同字段原有 important 类会被新基础类替换。其他 CSS 级联与原生组件自动更新可能改变最终外观，面板可核对计算值。",
    "组件清单 components 保留完整 importer 目录，onDemandOnly:[\"reviewMode.js\"] 使构建器从 Components 与 Full 排除审查实现，且拒绝 Full 显式内嵌该项。旧代码仅加载 Components 后直接访问 reviewModeApi 的用法应先 await JquanUI.import(\"reviewMode\")；如明确需要静态加载，仍可按 Core -> copy.js -> reviewMode.js 再依序 use。",
    "完整示例普通访问只加载 Core；首次按钮点击或 ?jqui-review=1 才 import，下载失败可重试。close 后重开保留历史，不重复 configure；destroy 后先 configure。首次打开包含下载耗时，是否提升渲染耗时需同机测量；本轮验证的是初始脚本缺席和请求数量。",
    "0.3 编辑面板按文字排版、布局、尺寸、间距、颜色质感、媒体溢出分组；中文候选与元素摘要供客户操作，高级原子类/属性仍可查看。展开的分组与控件焦点在修改后保留。静态面板外观复用原子类，不添加 CSS 样式表；动态定位尺寸/叠层保留必要 style。",
    "utilities() 每次返回独立快照，内置候选与当前 runtimeConfig/theme.extend 令牌合并，经 Core.resolve 过滤。颜色键上限64、间距键上限32，嵌套色最多4层；列表不是所有可能原子类的全集，setUtility 仍接受合法且解析为该字段的语义类。运行时 addColor 新名称在 runtimeConfig 中可见。",
    "padding/margin/gap、border-color/border-width/border-radius、overflow 以整个字段族归并方向类，选择整体值会替换该族已有基础方向类；null 移除该族。撤销恢复原方向类。响应式/hover/dark 变体保留；字号与行高复合类归字号字段，跨多个可编辑字段的复合类不接管。其他 CSS 级联或 inline style 可能使预览与候选不同，核对高级计算值。",
    "0.4 在外观编辑顶部加入搜索，忽略大小写并按子串匹配中文字段、分组、候选标签/原子类。搜索自动展开匹配组并暂时隐藏文字输入区；清空恢复文字区与原分组展开状态。查询保留到 close/open，configure/destroy 清空。查询最多120字符。",
    "文字/背景/边框颜色提供最多10个当前过滤候选的色样按钮，使用对应 bg-* 原子类显示颜色并通过原字段 setUtility 写入历史；点击后 aria-pressed 表示选中。搜索主题键可直接找到自定义色。色样位于工具层上下文，选中元素有局部主题变量、darkMapping 或继承颜色时以页面实际预览为准。",
    "修改清单按元素身份和字段显示首次原值、最终值、ready/conflict/detached 与定位状态。定位元素返回编辑视图；还原此项等同 revert(node, canonicalField)，保留其他记录且本身可 undo/redo。外部同字段更新时禁用还原，脱离节点禁用定位和还原；同 id 新节点不接管旧记录。清单仅展示与还原，不新增审批状态。",
    "0.5 选中范围区提供外层容器、内部元素、前一个、后一个四个原生按钮；不可用方向禁用，操作后保留在可用导航控件上的键盘焦点。navigate 只改变选择并最近滚动，不写历史、不改变选择/浏览模式。直接父元素和首个可选直接子元素不跨层；相邻方向跳过不可选兄弟；边界为配置 root，隐藏但可选的普通 HTML 仍可导航。工具层、审查入口、SVG、script/style/template 等不参与。",
    "selection.navigation 是四方向可用性的独立布尔快照；DOM 增删或相邻节点/祖先的入口属性变化后，面板会更新禁用状态。目标移除后导航返回 false，不按 id 接管替代节点。close 清空当前选择；重开后重新选取。文本输入需点击应用文字才写入记录，切换元素不会提交尚未应用的输入。",
    "0.6 首个组件适配器仅接入 Carousel 1.7+ 已挂载根节点的 autoplay(boolean) 与 interval(number，有限且>=1200毫秒)。componentOptions 返回独立描述快照；选中子节点、未挂载节点、旧版本或未加载组件时返回[]。不会自动导入/挂载业务轮播，不根据标记猜测 options。Review Mode 依赖仍只有 Copy。",
    "通过 Carousel.getHandle 绑定原始稳定句柄，使用 setAutoplay/setInterval，无通用 update、不重建内部节点，保留幻灯片文字和监听器。组件实例销毁后同节点重挂也不接管旧记录，记录为 conflict；重新 configure 才开始新会话。外部配置更新通过现有 update 事件刷新面板，冲突不覆盖。",
    "component:carousel.autoplay / component:carousel.interval 参与首次原值与最终值归并、undo/redo/reset/revert/destroy。数值/布尔保留原类型；含组件净修改时导出 schemaVersion:2，否则保持1。消费者需先检查版本；方案只描述配置变更，不记录逐帧播放位置或剩余计时。恢复 autoplay=true 遵循 setter 会启动播放，不回放原暂停状态。回调关闭会话时不写入过期历史；仍属原会话的未提交配置会尝试恢复。外部回调重入并销毁/重配时以页面最新状态为准；多字段 reset 在开始前预检冲突，写入期间回调干预可能中止且已恢复项会从净修改中移除。",
    "0.7 增加 Tabs 2.4+ 适配器：已挂载且选中根节点可读取并编辑 autoplay(boolean) 与 interval(number，有限且>=1200毫秒)。适配通过 tabsApi.getHandle 和稳定句柄 setAutoplay/setInterval 完成，不自动加载/挂载 Tabs，不调用 update，不重建面板；其他 Tabs 选项保持只读。",
    "0.8 增加 Select 1.4+ 适配器：已挂载且选中原生 select 根节点可读取并编辑 disabled/searchable/clearable 三个 boolean。适配通过 selectApi.get() 和稳定句柄 setDisabled/setSearchable/setClearable 完成，不自动加载或挂载 Select，不调用 update，不重建原生 option、值或表单同步。配置只读取原生根；可见触发按钮的点选映射见 0.9 说明。未挂载、旧版本或未加载组件时返回 [] 或 false。",
    "Carousel、Tabs 与 Select 组件字段共用 component:<name>.* 记录格式；Carousel 1.8+ 还支持 indicators/progress 两个布尔开关，通过稳定句柄只替换自有控制节点并保留当前页。外部 jquan:carousel:update、jquan:tabs:update、jquan:select:update 会刷新冲突状态，event.target 是已选业务根节点。实例销毁和同节点重挂不接管旧记录。组件 schemaVersion 2 规则不变。",
    "0.9 可见 Select 点选：Select 1.5+ 的 control() 提供现有触发按钮；点击按钮或后代、聚焦后按 Enter、select(handle.control()) 均选中原生 select，配置记录/定位/类名/属性属于原生节点，高亮使用按钮的可见几何。原生节点与按钮必须均在 root 内且可审查；wrapper、body 面板、伪造标记不映射。Select 1.4 仍可通过原生节点配置，但没有可见映射。无需新增依赖或挂载，destroy/close 沿用原生命周期。",
    "navigate 仍选择实际 DOM 层级，不做触发按钮映射，所以可借外层/内部按钮查看增强结构；生成按钮上的样式仍属运行期 DOM，源码落实需核对。原生字段的样式/属性编辑不重定向按钮。禁用按钮可能不产生 click，选择模式会在 pointerdown 选中它，仍可重新启用。销毁后旧 control() 为 null，同 id 重挂不会接管旧配置记录。",
    "0.10 键盘历史：Ctrl/Cmd+Z 撤销，Ctrl/Cmd+Shift+Z 或 Ctrl/Cmd+Y 重做，只操作已应用的审查历史。选择模式下限 root 内元素或工具层；浏览页面时只处理工具层。input/textarea/select、contenteditable（含后代）和 textbox/searchbox/combobox/spinbutton 角色保留原生快捷键。Alt、IME 合成、按键重复、已取消事件和空历史不处理。关闭/销毁移除监听，重开不重复执行。冲突/脱离字段沿用 undo/redo 校验且不覆盖页面。工具栏按钮包含 title 提示和 aria-keyshortcuts。无需新增依赖/配置，API 返回和导出 schema 不变。",
    "0.11 显式草稿归档：saveDraft/loadDraft/clearDraft 将最终值方案存入同源 localStorage，默认 key 为 default，应用应按项目/页面选唯一 key。key 1–80 字符，首位字母/数字，其余字母/数字/点/下划线/冒号/连字符。payload 上限 1,048,576 个 UTF-16 代码单元；失败返回 false/null，保留旧草稿。无后台自动保存/自动应用/历史回放，不保存未应用输入。configure/reset/destroy 不清理草稿。当前通过浏览器原生单条存储归档，不安装 Storage driver 或新增依赖。",
    "0.12 严格方案：applyPlan 默认只预检，不触碰 DOM 或历史。使用新的 enabled 会话，或先保存当前方案再 reset() 清空全部记录与 undo/redo。定位必须为当前唯一审查键/id 的规范选择器且 tag 相同，页面包含查询参数与 hash、移除 jqui-review 后须完全一致。只接受 ready 记录，拒绝 conflict/detached、重复字段、非语义新增类、非法 href 和不支持的文本节点。输入 JSON 上限 1,048,576 个 UTF-16 代码单元；返回独立快照。dryRun:false 要求 open()，逐项复查原值并经现有字段提交路径建立撤销记录；destroy/reset 按原生命周期恢复。组件同步回调可能改写页面或重配会话，此时中止并恢复仍匹配本次最终值的字段，外部覆盖保留并返回 rollback-conflict；applied 表示仍未恢复的已提交字段数。不会自动加载/挂载组件，不写源文件。",
    "0.13.1 Popover 适配通过 Popover 1.6+ getHandle() 捕获原始稳定句柄并精确核对根节点，使用 open/close/getState(handle) 修改。仅 DOM 标记、未挂载节点、子节点与旧版组件不暴露配置。销毁后保留 DOM 标记或同节点重挂也不会接管原记录；即使新实例值相同，旧记录仍为 conflict，undo/reset/revert/后续编辑/destroy 均不修改新实例。重新 configure 后才开始新会话。外部 open/close 事件刷新冲突；依赖仍只有 Copy，不自动导入或挂载业务 Popover。",
    "0.14 utilities() 发现 theme / theme.extend 的 fontSize、fluid.fontSize、borderRadius（兼容 radius）、boxShadow，映射 text-* / text-fluid-* / rounded-* / shadow-*；圆角/阴影 DEFAULT 对应 rounded/shadow。每个新字段先去重并至多考察64个配置候选，再按 Core.resolve 的实际最终字段校验及搜索，内置候选另计，extend 优先列入；名称遵循既有语义类语法（字母/数字/点/连字符，不含下划线）。这不是全部原子类清单。配置先于 Core；普通令牌需支持它们的当前 Core，旧 Core 未解析的项会过滤，不热更新 Core 配置。",
    "项目字号支持字符串、[字号, 行高]、[字号, {lineHeight}] 和流体字号；带 fontWeight/letterSpacing 的跨字段字号仍排除，避免接管独立字重/字间距。新增候选复用原 setUtility、首次 before/最终 after 去重、撤销/逐项恢复、草稿和严格 applyPlan，不增加计划 schema。实际计算值仍受 CSS 层叠影响。完整按需示例 examples/review-mode-theme-tokens.html；退出前先复制或保存，再 destroy。",
    "候选解析异常被隔离：自定义 resolver 抛错的候选被过滤，setUtility 返回 false，不中断审查面板或会话。",
    "0.15 新增 font-family（字体）、text-decoration-line（无装饰/下划线/上划线/删除线）和 white-space（正常换行/单行/保留空白与换行）字段，六组共35字段。font-sans/font-serif/font-mono 为内置字体候选；theme/theme.extend.fontFamily 的字符串或字符串数组映射 font-*，extend 优先，64个配置候选上限先于 Core 校验与搜索，内置另计。字段只设置字体族，不下载字体文件；项目字体文件与加载等待由页面负责。",
    "换行字段引入后，truncate 同时命中 overflow 与 white-space，按跨字段复合类保留，不作为单字段候选/修改接管；已有 truncate 保持在 DOM，其他 CSS 层叠可能影响预览。旧方案若将 truncate 写入 utility:overflow 的 before/after，会以 invalid-value 拒绝预检且不写入页面。需要拆分编辑时，由开发者先改成 overflow-hidden text-ellipsis whitespace-nowrap，再基于新页面重新生成方案。旧草稿仍可读取，不自动迁移；其他字段沿用原 schema、去重/撤销/草稿/apply。",
    "0.16 新增 Tabs 2.5+ 的 component:tabs.loop:boolean（首尾循环）。通过原稳定句柄 setLoop 编辑，不重建面板，不移动当前页或重启播放；false 时末页停留且自动播放计时继续。旧 Tabs 无 setter/state.loop 时隐藏该项，编辑返回 false，方案预检拒绝。该字段使用 schemaVersion:2，参与首次 before/最终 after 去重、撤销/恢复、草稿及严格 apply；外部 update 和销毁重挂仍按冲突处理。",
    "0.16.1：MutationObserver 或组件 update/open/close 引起的后台刷新，保留当前聚焦且已改动的文字、白名单属性或数值间隔输入及可用的选区/光标；干净输入仍同步页面最新值，属性输入所在折叠区保持展开。仅保护当前输入框，不缓存其他未应用字段；切换元素/视图、应用其他编辑、关闭、configure 或 destroy 以实际页面值重新建立输入。待应用输入不写预览 DOM，不进历史、exportPlan/saveDraft；点击原有应用按钮后才校验并写入。该临时保护不等同于 localStorage 方案草稿，不承诺保留浏览器原生撤销栈或输入法组合会话。",
    "0.17：copyPlan() 自动复制失败时，在审查面板显示只读、完整的方案文本并自动全选，支持 Ctrl/Cmd+C 或长按手动复制；返回编辑可关闭兜底面板。方案快照只在当前导出文本未变化时保留，跟踪字段变化、选择其他元素、关闭或销毁会失效旧文本。0.18.1 修复连续复制的竞态：只有最新有效请求能更新提示与手动面板，新请求立即清理旧面板；早期请求仍返回各自结果。过期会话与请求不更新 UI。示例：先发 A 再发 B，B 成功后 A 失败不再弹出旧面板。回归：npm run check:review-copy-race。成功复制继续使用原状态提示；copyPlan 仍返回 Promise<boolean>，不新增类型或方案字段。",
    "0.18：Carousel 1.8+ 的 component:carousel.indicators 与 component:carousel.progress 可在已挂载根节点上切换。公开 setter 只替换本实例生成的圆点/进度条，保留当前页、内容、句柄和播放计时；旧 Carousel 隐藏字段并拒绝编辑。字段参与 schemaVersion:2 的去重、撤销、草稿、strict apply 与实例冲突检查；示例为 examples/review-mode-carousel-controls.html。"
  ],
  "kind": "service",
  "examples": [
    {
      "id": "declarative",
      "title": "点击后按需加载",
      "language": "html",
      "code": "<button type=\"button\" data-jq-review-open>审查 / 修改页面</button>\n<main id=\"preview\"><h1 data-jq-review-key=\"title\">预览内容</h1></main>\n<script>\n// Core 已加载；只在点击时导入。完整示例另含加载失败重试和 URL 入口。\ndocument.querySelector(\"[data-jq-review-open]\").addEventListener(\"click\", async () => {\n  const review = await JquanUI.import(\"reviewMode\");\n  if (!review.state().enabled) review.configure({ enabled: true, root: \"#preview\" });\n  review.open();\n});\n</script>",
      "preview": false
    },
    {
      "id": "imperative",
      "title": "编辑并复制方案",
      "language": "javascript",
      "code": "const review = await JquanUI.import(\"reviewMode\");\nreview.configure({ enabled: true, root: \"#preview\", allowURL: true });\nreview.open();\nreview.select(\"[data-jq-review-key=title]\");\nreview.setText(\"客户确认的新标题\");\nreview.setUtility(\"font-size\", \"text-md\");\nreview.setUtility(\"font-size\", \"text-lg\");\nreview.undo(); review.redo();\nconsole.log(review.changes()); // 字号仅保留最终 text-lg，before 是首次原值\nawait review.copyPlan(); // 摘要 + JSON；关闭 UI 后仍可导出\nconsole.log(review.exportPlan(\"json\"));\nreview.saveDraft(\"client-home\");\nreview.close();\n// 离开预览前先保存方案；销毁恢复未被外部覆盖的预览字段\nreview.destroy();",
      "preview": false
    },
    {
      "id": "complete-preview",
      "title": "完整按需预览页（保存到项目根目录）",
      "language": "html",
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>JquanUI Review Mode 按需审查示例</title>\n  <script>\n    window.JQUAN_CONFIG = { theme: { extend: { colors: { brand: '#2563eb', mist: '#eff6ff' }, spacing: { section: '3rem' } } } };\n  </script>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-8 text-slate-900\">\n  <button type=\"button\" data-jq-review-open class=\"rounded-lg bg-blue-600 px-4 py-2 text-white\">打开页面审查</button>\n  <span id=\"review-load-status\" role=\"status\" class=\"ml-3 text-sm text-slate-600\"></span>\n  <div class=\"mt-3 flex flex-wrap gap-2\">\n    <button type=\"button\" id=\"save-draft\" class=\"rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700\">保存客户草稿</button>\n    <button type=\"button\" id=\"load-draft\" class=\"rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700\">读取草稿</button>\n    <button type=\"button\" id=\"clear-draft\" class=\"rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700\">清理草稿</button>\n  </div>\n  <pre id=\"draft-output\" hidden class=\"mx-auto mt-4 max-w-xl overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700\" aria-label=\"已保存的修改方案\"></pre>\n  <main id=\"preview\" class=\"mx-auto mt-8 max-w-xl rounded-xl bg-white p-8 shadow-lg\">\n    <h1 id=\"hero-title\" data-jq-review-key=\"hero-title\" class=\"text-3xl font-bold\">客户预览标题</h1>\n    <p data-jq-review-key=\"hero-body\" class=\"mt-3 text-slate-600\">点选文字后可用“外层容器”选中整张卡片，再搜索“圆角”或“brand”调整样式，再到修改清单核对、逐项还原并复制最终方案。</p>\n    <section data-jq-review-key=\"feature-grid\" class=\"grid grid-cols-2 gap-4 mt-6\">\n      <article data-jq-review-key=\"feature-card\" class=\"p-4 rounded-xl bg-mist border border-blue-100\">\n        <p class=\"text-sm font-semibold text-brand\">直接看见改变</p>\n        <p class=\"mt-2 text-sm text-slate-600\">试着修改这张卡片的内边距、圆角与阴影。</p>\n      </article>\n      <article data-jq-review-key=\"second-card\" class=\"p-4 rounded-xl bg-slate-50 border border-slate-200\">\n        <p class=\"text-sm font-semibold\">只交付最终方案</p>\n        <p class=\"mt-2 text-sm text-slate-600\">反复调整同一字段，导出仍只保留最后的选择。</p>\n      </article>\n    </section>\n    <a href=\"#preview\" data-jq-review-key=\"hero-link\" class=\"inline-block mt-4 text-blue-600\">了解更多</a>\n  </main>\n  <script>\n    // 普通访问仅加载 Core；页面入口负责首次导入，组件负责后续审查交互。\n    const reviewButton = document.querySelector('[data-jq-review-open]');\n    const reviewStatus = document.getElementById('review-load-status');\n    let reviewPromise = null;\n    let reviewApi = null;\n    const draftKey = 'review-demo-client-home';\n    async function openReview() {\n      reviewButton.disabled = true;\n      reviewStatus.textContent = '';\n      try {\n        const review = await (reviewPromise || (reviewPromise = JquanUI.import('reviewMode')));\n        reviewApi = review;\n        // 重开保留已有预览和历史；destroy 后再创建会话。\n        if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n        review.open();\n      } catch (error) {\n        reviewPromise = null;\n        reviewStatus.textContent = '审查工具加载失败，请再次点击重试。';\n      } finally {\n        reviewButton.disabled = false;\n      }\n    }\n    reviewButton.addEventListener('click', openReview);\n    async function withReview(action) {\n      try {\n        const review = reviewApi || await (reviewPromise || (reviewPromise = JquanUI.import('reviewMode')));\n        reviewApi = review;\n        return action(review);\n      } catch (_) {\n        reviewPromise = null;\n        reviewStatus.textContent = '审查工具尚未加载，请先打开页面审查。';\n        return false;\n      }\n    }\n    document.getElementById('save-draft').addEventListener('click', () => withReview(review => {\n      reviewStatus.textContent = review.saveDraft(draftKey) ? '草稿已保存：只记录最终值，不改变页面。' : '没有可保存的修改或浏览器存储不可用。';\n    }));\n    document.getElementById('load-draft').addEventListener('click', () => withReview(review => {\n      const draft = review.loadDraft(draftKey);\n      const output = document.getElementById('draft-output');\n      output.hidden = !draft;\n      output.textContent = draft ? JSON.stringify(draft, null, 2) : '';\n      reviewStatus.textContent = draft ? `已读取 ${draft.changes.length} 项修改，方案显示在下方。` : '没有可读取的草稿。';\n    }));\n    document.getElementById('clear-draft').addEventListener('click', () => withReview(review => {\n      reviewStatus.textContent = review.clearDraft(draftKey) ? '草稿已清理。' : '没有可清理的草稿。';\n      document.getElementById('draft-output').hidden = true;\n      document.getElementById('draft-output').textContent = '';\n    }));\n    // URL 是本页面选择加载工具的入口；Core 自身不会扫描参数或下载该组件。\n    if (new URL(location.href).searchParams.get('jqui-review') === '1') openReview();\n  </script>\n</body>\n</html>\n",
      "preview": false
    },
    {
      "id": "structured-text",
      "title": "保留粗体和链接的文本片段编辑",
      "language": "javascript",
      "code": "// <p id=\"sentence\">前缀 <b>粗体</b> 后缀</p>\nreview.select(\"#sentence\");\nconsole.log(review.state().selection.textNodes); // [{index:0,value:\"前缀 \"},{index:2,value:\" 后缀\"}]\nreview.setText(\"新的前缀 \", 0); // 不替换 b、不清空监听器\n// 多个直接文本片段时，省略 index 返回 false；也可点选 b 后 setText(\"新粗体\")。",
      "preview": false
    },
    {
      "id": "field-groups",
      "title": "35 个语义字段与主题候选",
      "language": "javascript",
      "preview": false,
      "code": "const catalog = review.utilities();\nconsole.table(catalog.map(({ field, group, options }) => ({ field, group, candidates: options.length })));\nreview.select(\"#preview\");\nreview.setUtility(\"display\", \"flex\");\nreview.setUtility(\"gap\", \"gap-6\");\nreview.setUtility(\"padding\", \"p-8\");\nreview.setUtility(\"border-radius\", \"rounded-2xl\");\nreview.setUtility(\"box-shadow\", \"shadow-lg\");\n// 字段分组（语义基础类由 Core.resolve 校验）\n{\n  \"typography\": [\n    \"font-size\",\n    \"font-family\",\n    \"text-decoration-line\",\n    \"white-space\",\n    \"color\",\n    \"font-weight\",\n    \"text-align\",\n    \"line-height\",\n    \"letter-spacing\",\n    \"font-style\",\n    \"text-transform\"\n  ],\n  \"layout\": [\n    \"display\",\n    \"flex-direction\",\n    \"flex-wrap\",\n    \"align-items\",\n    \"justify-content\",\n    \"grid-template-columns\"\n  ],\n  \"sizing\": [\n    \"width\",\n    \"height\",\n    \"min-width\",\n    \"max-width\",\n    \"min-height\",\n    \"max-height\"\n  ],\n  \"spacing\": [\n    \"padding\",\n    \"margin\",\n    \"gap\"\n  ],\n  \"appearance\": [\n    \"background-color\",\n    \"border-color\",\n    \"border-width\",\n    \"border-radius\",\n    \"box-shadow\",\n    \"opacity\"\n  ],\n  \"media\": [\n    \"overflow\",\n    \"object-fit\",\n    \"aspect-ratio\"\n  ]\n}"
    },
    {
      "id": "search-and-revert",
      "title": "查找主题色并逐项还原",
      "language": "javascript",
      "preview": false,
      "code": "const review = await JquanUI.import(\"reviewMode\");\nreview.configure({ enabled: true, root: \"#preview\" });\nreview.open();\nconsole.table(review.utilities(\"brand\"));\nconsole.table(review.utilities(\"圆角\"));\nreview.select(\"[data-jq-review-key=feature-card]\");\nreview.setUtility(\"border-radius\", \"rounded-2xl\");\nreview.setUtility(\"padding\", \"p-8\");\n// 只还原圆角，保留内边距；该还原可撤销。\nreview.revert(\"[data-jq-review-key=feature-card]\", \"utility:border-radius\");\nreview.undo();\n// 客户可在面板的修改清单中核对原值和最终值，再复制方案。\nawait review.copyPlan();"
    },
    {
      "id": "selection-navigation",
      "title": "从文字选到整张卡片",
      "language": "javascript",
      "preview": false,
      "code": "const review = await JquanUI.import(\"reviewMode\");\nreview.configure({ enabled: true, root: \"#preview\" });\nreview.open();\n// feature-card 内有文字元素：先选择卡片内部，再返回整张卡片。\nreview.select(\"[data-jq-review-key=feature-card]\");\nreview.navigate(\"first-child\");\nreview.navigate(\"parent\");\nreview.setUtility(\"padding\", \"p-8\");\nconsole.log(review.state().selection.navigation);\n// 相邻方向跳过不可选兄弟，不越过 #preview；返回 false 表示方向不可用。\nreview.navigate(\"next-sibling\");\nawait review.copyPlan();\nreview.destroy();"
    },
    {
      "id": "carousel-options",
      "title": "轮播配置完整示例（保存到项目根目录）",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Review Mode 组件配置预览</title>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-6 text-slate-900\">\n  <main id=\"preview\" class=\"mx-auto max-w-xl\">\n    <p class=\"mb-2 text-sm font-semibold text-blue-600\">JQUANUI REVIEW MODE</p>\n    <h1 class=\"text-3xl font-bold\">把修改意见，直接变成预览</h1>\n    <p class=\"mt-3 mb-6 text-slate-600\">打开审查后可调整轮播的自动播放和切换间隔，修改清单只保留最终配置。</p>\n    <section id=\"sample-carousel\" data-jq-review-key=\"sample-carousel\" class=\"h-48 rounded-2xl shadow-lg\" aria-label=\"组件配置示例\">\n      <article jq-carousel-item class=\"flex h-full items-center justify-center bg-blue-100 text-blue-900 text-2xl font-semibold\">保留内容，调整节奏</article>\n      <article jq-carousel-item class=\"flex h-full items-center justify-center bg-indigo-100 text-indigo-900 text-2xl font-semibold\">随时撤销，复制方案</article>\n    </section>\n    <button id=\"start-review\" type=\"button\" class=\"mt-6 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50\">打开轮播配置审查</button>\n    <p id=\"load-status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\"></p>\n  </main>\n  <script>\n    // 本示例先挂载业务轮播，再按需加载审查；Review Mode 自身不下载业务组件。\n    const start = document.getElementById('start-review');\n    start.addEventListener('click', async () => {\n      start.disabled = true;\n      try {\n        const carousel = await JquanUI.import('carousel');\n        if (!carousel.getHandle('#sample-carousel')) carousel.mount('#sample-carousel', { autoplay: false, interval: 4000, infinite: false });\n        const review = await JquanUI.import('reviewMode');\n        if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n        review.open(); review.select('#sample-carousel');\n        document.getElementById('load-status').textContent = '';\n      } catch (error) {\n        document.getElementById('load-status').textContent = '加载失败，请再次点击重试。';\n      } finally { start.disabled = false; }\n    });\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "tabs-options",
      "title": "Tabs 配置完整示例（保存到项目根目录）",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Review Mode Tabs 配置预览</title>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-6 text-slate-900\">\n  <main id=\"preview\" class=\"mx-auto max-w-xl\">\n    <h1 class=\"text-3xl font-bold\">标签页节奏审查</h1>\n    <div id=\"sample-tabs\" data-jq-review-key=\"sample-tabs\" class=\"mt-6 rounded-2xl bg-white p-6 shadow-lg\">\n      <nav jq-tab-list aria-label=\"示例标签页\">\n        <button type=\"button\" jq-tab jq-target=\"#tab-a\">项目介绍</button>\n        <button type=\"button\" jq-tab jq-target=\"#tab-b\">交付说明</button>\n      </nav>\n      <div jq-tab-content>\n        <section id=\"tab-a\" jq-tab-panel>第一面板内容</section>\n        <section id=\"tab-b\" jq-tab-panel>第二面板内容</section>\n      </div>\n    </div>\n    <button id=\"start-review\" type=\"button\" class=\"mt-6 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white\">打开标签页配置审查</button>\n    <p id=\"load-status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\"></p>\n  </main>\n  <script>\n    document.getElementById('start-review').addEventListener('click', async event => {\n      const button = event.currentTarget; button.disabled = true;\n      try {\n        const tabs = await JquanUI.import('tabs');\n        if (!tabs.getHandle('#sample-tabs')) tabs.mount('#sample-tabs', { autoplay: false, interval: 3200, loop: true, duration: 0 });\n        const review = await JquanUI.import('reviewMode');\n        if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n        review.open(); review.select('#sample-tabs');\n        // 面板中的“首尾循环”可比较末页停留与回到首页；方案只保留最终值。\n      } catch (_) { document.getElementById('load-status').textContent = '加载失败，请再次点击重试。'; }\n      finally { button.disabled = false; }\n    });\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "select-adapter",
      "title": "Select 行为审查完整示例（保存到项目根目录）",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Review Mode Select 配置预览</title>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-6 text-slate-900\">\n  <main id=\"preview\" class=\"mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg\">\n    <p class=\"text-sm font-semibold text-blue-600\">JQUANUI REVIEW MODE</p>\n    <h1 class=\"mt-3 text-3xl font-bold\">让客户直接选择交互方式</h1>\n    <p class=\"mt-3 mb-6 text-slate-600\">打开审查后，点击下拉框即可调整是否禁用、允许搜索和允许清空，选项与当前值保持不变。</p>\n    <label for=\"sample-select\" class=\"block mb-2 text-sm font-medium\">交付方式</label>\n    <select id=\"sample-select\" data-jq-review-key=\"delivery-select\">\n      <option value=\"online\" selected>线上交付</option>\n      <option value=\"meeting\">现场演示</option>\n    </select>\n    <button id=\"start-review\" type=\"button\" class=\"mt-6 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50\">审查下拉框配置</button>\n    <p id=\"load-status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\"></p>\n  </main>\n  <script>\n    // 业务 Select 独立加载。审查工具只在按钮点击时导入，不接管业务组件生命周期。\n    let selectPromise = null;\n    function loadSelect() {\n      return selectPromise || (selectPromise = JquanUI.import('select', { install: false })\n        .then(api => api.mount('#sample-select'))\n        .catch(error => { selectPromise = null; throw error; }));\n    }\n    loadSelect().catch(() => { document.getElementById('load-status').textContent = '下拉框加载失败，点击审查按钮重试。'; });\n    document.getElementById('start-review').addEventListener('click', async event => {\n      const button = event.currentTarget; button.disabled = true;\n      try {\n        await loadSelect();\n        const review = await JquanUI.import('reviewMode');\n        if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n        review.open();\n        document.getElementById('load-status').textContent = '';\n      } catch (_) { document.getElementById('load-status').textContent = '加载失败，请再次点击重试。'; }\n      finally { button.disabled = false; }\n    });\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "keyboard-history",
      "title": "键盘撤销与文字草稿",
      "language": "javascript",
      "preview": false,
      "code": "const review = await JquanUI.import('reviewMode');\nreview.configure({ enabled: true, root: '#preview', allowURL: false });\nreview.open(); review.select('#title');\nreview.setUtility('font-size', 'text-lg');\n// 聚焦页面非输入元素或审查工具栏：Ctrl/Cmd+Z 撤销，Shift+Z/Y 重做。\n// 聚焦文字输入框：保留浏览器撤销；点击“应用文字”后才进入审查历史。\n// close/destroy 自动移除快捷键监听。"
    },
    {
      "id": "persistent-draft",
      "title": "保存并读取客户最终值草稿",
      "language": "javascript",
      "preview": false,
      "code": "const review = await JquanUI.import('reviewMode');\nreview.configure({ enabled: true, root: '#preview', allowURL: false });\nreview.open(); review.select('#hero-title');\nreview.setText('客户确认的新标题');\nreview.saveDraft('client-home'); // false 表示未保存；保留旧草稿\nreview.destroy(); // 恢复预览，但草稿仍在\nconst draft = review.loadDraft('client-home');\nif (draft) console.log(draft.page, draft.changes); // 只读数据，不自动应用\nreview.clearDraft('client-home'); // 项目完成后清理"
    },
    {
      "id": "strict-apply",
      "title": "先预检再应用（可撤销）",
      "language": "javascript",
      "preview": false,
      "code": "const review = await JquanUI.import('reviewMode');\nreview.configure({ enabled: true, root: '#preview', allowURL: false });\nreview.open(); review.select('[data-jq-review-key=\"title\"]');\nreview.setText('客户确认的新标题');\nconst plan = review.exportPlan('json');\nif (review.reset()) { // 模拟重新访问原始页面，清空已有审查历史\n  const report = review.applyPlan(plan); // 默认 dry-run；页面不变\n  if (report.ok) {\n    const result = review.applyPlan(plan, { dryRun: false });\n    console.log(result.applied, result.issues);\n    // 应用记录可 undo/redo；destroy 恢复未被外部覆盖的预览字段\n  }\n}\nreview.destroy();"
    },
    {
      "id": "strict-apply-page",
      "title": "严格方案完整页面（保存到项目根目录）",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Review Mode：方案预检与应用</title>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-4 text-slate-900 sm:p-8\">\n  <div class=\"mx-auto max-w-2xl\">\n    <h1 class=\"text-2xl font-bold\">先核对，再恢复客户方案</h1>\n    <p class=\"mt-3 text-sm text-slate-600\">生成方案会模拟一次客户编辑并还原页面。预检只读；应用后可在审查工具内撤销，也可点击还原。</p>\n    <nav class=\"mt-5 flex flex-wrap gap-2\" aria-label=\"方案操作\">\n      <button id=\"prepare\" type=\"button\" class=\"rounded-lg bg-blue-600 px-4 py-2 text-white\">1. 生成示例方案</button>\n      <button id=\"preflight\" type=\"button\" disabled class=\"rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50\">2. 预检方案</button>\n      <button id=\"apply\" type=\"button\" disabled class=\"rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50\">3. 应用预览</button>\n      <button id=\"restore\" type=\"button\" disabled class=\"rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50\">还原页面</button>\n    </nav>\n    <p id=\"status\" role=\"status\" class=\"mt-4 text-sm text-slate-600\">尚未导入审查组件。</p>\n    <main id=\"preview\" class=\"mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm\">\n      <h2 id=\"client-title\" data-jq-review-key=\"client-title\" class=\"text-xl font-semibold\">原始页面标题</h2>\n      <p class=\"mt-3 text-slate-600\">这里保留页面原有内容与结构。</p>\n    </main>\n    <pre id=\"report\" class=\"mt-6 max-w-full overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100\" aria-label=\"方案报告\">等待生成方案</pre>\n  </div>\n  <script>\n    const status = document.getElementById('status'), report = document.getElementById('report');\n    const controls = Object.fromEntries(['prepare', 'preflight', 'apply', 'restore'].map(id => [id, document.getElementById(id)]));\n    let review, plan, pending;\n    async function session() {\n      review = await (pending || (pending = JquanUI.import('reviewMode')));\n      if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n      review.open();\n      return review;\n    }\n    async function run(action) {\n      try { await action(); }\n      catch (_) { pending = null; status.textContent = '加载未完成，请重试。'; }\n    }\n    controls.prepare.addEventListener('click', () => run(async () => {\n      const api = await session();\n      if (!api.reset()) { status.textContent = '页面已有外部更新，请核对当前修改。'; return; }\n      api.select('#client-title'); api.setText('客户确认的新标题'); api.setUtility('font-size', 'text-3xl');\n      plan = JSON.parse(api.exportPlan('json'));\n      api.reset(); api.close();\n      report.textContent = JSON.stringify(plan, null, 2);\n      controls.preflight.disabled = false; controls.apply.disabled = true; controls.restore.disabled = true;\n      status.textContent = '方案已生成，页面已还原。请先预检。';\n    }));\n    controls.preflight.addEventListener('click', () => run(async () => {\n      const api = await session(), result = api.applyPlan(plan); api.close();\n      report.textContent = JSON.stringify(result, null, 2); controls.apply.disabled = !result.ok;\n      status.textContent = result.ok ? '预检通过，页面未变化。' : '存在冲突，请核对报告。';\n    }));\n    controls.apply.addEventListener('click', () => run(async () => {\n      const api = await session(), result = api.applyPlan(plan, { dryRun: false });\n      report.textContent = JSON.stringify(result, null, 2);\n      controls.apply.disabled = true; controls.restore.disabled = !result.ok;\n      status.textContent = result.ok ? '方案已应用，可使用审查工具撤销或点击还原。' : '应用中止，请核对报告。';\n    }));\n    controls.restore.addEventListener('click', () => run(async () => {\n      const api = await session(), restored = api.reset(); api.close();\n      status.textContent = restored ? '页面已还原，可重新预检方案。' : '页面已有外部更新，请核对冲突。';\n      controls.restore.disabled = restored;\n    }));\n    addEventListener('pagehide', () => review?.destroy(), { once: true });\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "popover-adapter",
      "title": "Popover 开关配置审查",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Review Mode：Popover 配置审查</title>\n  <script src=\"../dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-6 text-slate-900\">\n  <main id=\"preview\" class=\"mx-auto max-w-xl\">\n    <h1 class=\"text-3xl font-bold\">Popover 交互审查</h1>\n    <p class=\"mt-3 text-slate-600\">业务 Popover 先独立挂载，Review Mode 只提供开关状态编辑。</p>\n    <div id=\"sample-popover\" data-jq-review-key=\"sample-popover\" jq-popover class=\"relative mt-8 inline-block\">\n      <button type=\"button\" jq-popover-trigger class=\"rounded-xl bg-blue-600 px-4 py-3 font-medium text-white\">查看说明</button>\n      <section jq-popover-panel class=\"w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl\">\n        <h2 class=\"font-semibold\">交付说明</h2>\n        <p class=\"mt-2 text-sm text-slate-600\">此面板内容保持不变，只调整是否打开。</p>\n      </section>\n    </div>\n    <button id=\"start-review\" type=\"button\" class=\"mt-8 block rounded-xl bg-slate-900 px-4 py-3 font-medium text-white\">打开 Popover 审查</button>\n    <p id=\"status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\"></p>\n  </main>\n  <script>\n    let popoverPromise = null, popoverHandle = null, reviewApi = null;\n    const status = document.getElementById('status');\n    function loadPopover() {\n      return popoverPromise || (popoverPromise = JquanUI.import('popover', { install: false }).then(api => {\n        const handle = api.mount('#sample-popover', { trapFocus: true });\n        if (!handle) throw new Error('Popover mount did not complete');\n        popoverHandle = handle;\n        return handle;\n      }).catch(error => { popoverPromise = null; throw error; }));\n    }\n    loadPopover().catch(() => { status.textContent = 'Popover 加载失败，请重试。'; });\n    document.getElementById('start-review').addEventListener('click', async event => {\n      const button = event.currentTarget; button.disabled = true;\n      try {\n        await loadPopover();\n        const review = await JquanUI.import('reviewMode');\n        reviewApi = review;\n        if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n        review.open(); review.select('#sample-popover');\n        status.textContent = '已选中 Popover；在面板的“浮层设置”中切换开关。';\n      } catch (_) { status.textContent = '审查加载失败，请再次点击重试。'; }\n      finally { button.disabled = false; }\n    });\n    addEventListener('pagehide', () => {\n      reviewApi?.destroy();\n      popoverHandle?.destroy();\n    }, { once: true });\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "project-theme-tokens-page",
      "title": "项目字号、流体字号、圆角与阴影：按需完整页面",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n  <title>Review Mode · 项目主题令牌</title>\n  <script>\n    window.JQUAN_CONFIG = { theme: { extend: {\n      colors: { brand: '#596be8' },\n      fontSize: { heading: ['34px', '1.2'], compact: '22px' },\n      borderRadius: { card: '22px' },\n      boxShadow: { soft: '0 12px 36px rgb(60 70 120 / .15)' },\n      fluid: { fontSize: { display: { min: '28px', preferred: '5vw', max: '48px', lineHeight: '1.1' } } }\n    } } };\n  </script>\n  <script src=\"../dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"min-h-screen bg-slate-50 p-4 text-slate-900 md:p-10\">\n  <main class=\"mx-auto max-w-3xl\">\n    <p class=\"text-sm font-semibold text-brand\">JQUANUI · REVIEW MODE</p>\n    <h1 class=\"mt-3 text-3xl font-bold\">把项目的设计语言交给审查人</h1>\n    <p class=\"mt-4 text-slate-600\">打开审查，选择下方标题或卡片，搜索 heading、display、card、soft，即可使用项目配置的字号、圆角和阴影。</p>\n    <div class=\"mt-6 flex flex-wrap gap-3\">\n      <button id=\"open-review\" type=\"button\" class=\"rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50\">打开审查</button>\n      <button id=\"copy-plan\" type=\"button\" class=\"rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold\">复制修改方案</button>\n    </div>\n    <p id=\"status\" role=\"status\" class=\"mt-3 text-sm text-slate-600\">普通访问只加载 Core；点击按钮后再加载审查组件。</p>\n    <section id=\"preview\" class=\"mt-8\">\n      <article id=\"project-card\" data-jq-review-key=\"project-card\" class=\"rounded-lg bg-white p-6 shadow-sm md:p-8\">\n        <p class=\"text-sm font-semibold text-brand\">给客户的预览区域</p>\n        <h2 id=\"project-title\" data-jq-review-key=\"project-title\" class=\"mt-3 text-2xl font-bold\">每个想法，都可以看见</h2>\n        <p class=\"mt-4 leading-relaxed text-slate-600\">试着把标题改为项目字号，再为卡片选择项目圆角与柔和阴影。反复修改同一字段时，方案只保留最终选择。</p>\n      </article>\n    </section>\n  </main>\n  <script>\n    let review = null, pending = null;\n    const status = document.getElementById('status'), openButton = document.getElementById('open-review');\n    openButton.addEventListener('click', async () => {\n      if (pending) return;\n      openButton.disabled = true;\n      pending = JquanUI.import('reviewMode');\n      try {\n        review = await pending;\n        if (!review.state().enabled) review.configure({ enabled: true, root: '#preview', allowURL: false });\n        review.open(); review.select('#project-title');\n        status.textContent = '已打开审查。可以搜索项目字号、圆角与阴影。';\n      } catch (error) { status.textContent = '加载失败，请再次点击重试。'; console.error(error); }\n      finally { pending = null; openButton.disabled = false; }\n    });\n    document.getElementById('copy-plan').addEventListener('click', async () => {\n      if (!review) { status.textContent = '请先打开审查并调整预览。'; return; }\n      status.textContent = await review.copyPlan() ? '修改方案已复制。' : '没有可复制的修改，或浏览器未允许复制。';\n    });\n    addEventListener('pagehide', () => review?.destroy());\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "typography-page",
      "title": "字体、文字装饰与换行：按需完整页面",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n  <title>Review Mode · 文字排版</title>\n  <script>\n    window.JQUAN_CONFIG={theme:{extend:{colors:{brand:'#596be8'},fontFamily:{brand:['Georgia','serif'],reading:['Arial','sans-serif']}}}};\n  </script>\n  <script src=\"../dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"min-h-screen bg-slate-50 p-4 text-slate-900 md:p-10\">\n  <main class=\"mx-auto max-w-3xl\">\n    <p class=\"text-sm font-semibold text-brand\">JQUANUI · TYPOGRAPHY REVIEW</p>\n    <h1 class=\"mt-3 text-3xl font-bold\">让文字表达，更接近你的想法</h1>\n    <p class=\"mt-4 text-slate-600\">打开审查，选择标题调整字体和文字装饰，选择段落调整空白与换行。项目字体可以搜索 brand、reading。</p>\n    <div class=\"mt-6 flex flex-wrap gap-3\">\n      <button id=\"open-review\" type=\"button\" class=\"rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50\">打开审查</button>\n      <button id=\"copy-plan\" type=\"button\" class=\"rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold\">复制修改方案</button>\n    </div>\n    <p id=\"status\" role=\"status\" class=\"mt-3 text-sm text-slate-600\">点击按钮后才加载审查组件。</p>\n    <section id=\"preview\" class=\"mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8\">\n      <h2 id=\"sample-title\" data-jq-review-key=\"sample-title\" class=\"font-sans text-2xl font-bold no-underline md:text-3xl\">A little change, a clearer message.</h2>\n      <p id=\"sample-copy\" data-jq-review-key=\"sample-copy\" class=\"mt-5 whitespace-normal leading-relaxed text-slate-600\">让想法成为清晰的文字。\n保留这一行，或让它自然换行。\n把每一个    细节，都调整到舒服的位置。</p>\n    </section>\n  </main>\n  <script>\n    let review=null,pending=null;\n    const button=document.getElementById('open-review'),status=document.getElementById('status');\n    button.addEventListener('click',async()=>{\n      if(pending)return;\n      button.disabled=true;pending=JquanUI.import('reviewMode');\n      try{review=await pending;if(!review.state().enabled)review.configure({enabled:true,root:'#preview',allowURL:false});review.open();review.select('#sample-title');status.textContent='已打开审查，可调整字体、文字装饰和换行。';}\n      catch(error){status.textContent='加载失败，请再次点击重试。';console.error(error);}\n      finally{pending=null;button.disabled=false;}\n    });\n    document.getElementById('copy-plan').addEventListener('click',async()=>{status.textContent=review&&await review.copyPlan()?'修改方案已复制。':'请先修改预览；复制需要浏览器授权。';});\n    addEventListener('pagehide',()=>review?.destroy());\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "input-drafts",
      "title": "动态页面上的未应用输入",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n  <title>Review Mode 动态页面输入</title>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-6 text-slate-900\">\n  <main id=\"preview\" class=\"mx-auto max-w-xl\">\n    <p class=\"mb-3 text-sm font-semibold text-blue-600\">动态页面审查</p>\n    <h1 id=\"sample-title\" data-jq-review-key=\"title\" class=\"text-3xl font-bold\">欢迎审查这个页面</h1>\n    <p class=\"mt-4 text-slate-600\">打开审查后在文字框输入新标题。后台每秒刷新一次，当前输入会保留；点击“应用文字”才更新页面。</p>\n    <p id=\"live-status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\">后台更新：0</p>\n    <button id=\"start-review\" type=\"button\" class=\"mt-6 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50\">打开审查</button>\n    <p id=\"load-status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\"></p>\n  </main>\n  <script>\n    let tick = 0;\n    const timer = setInterval(() => { document.getElementById('live-status').textContent = `后台更新：${++tick}`; }, 1000);\n    document.getElementById('start-review').addEventListener('click', async event => {\n      const button = event.currentTarget; button.disabled = true;\n      try {\n        const review = await JquanUI.import('reviewMode');\n        if (!review.state().enabled) review.configure({enabled:true,root:'#preview',allowURL:false});\n        review.open(); review.select('#sample-title');\n      } catch (_) { document.getElementById('load-status').textContent = '加载失败，请再次点击重试。'; }\n      finally { button.disabled = false; }\n    });\n    addEventListener('pagehide', () => { clearInterval(timer); window.JquanUIComponents?.reviewModeApi?.destroy(); });\n  </script>\n</body>\n</html>\n"
    },
    {
      "id": "manual-copy",
      "title": "复制失败时的手动方案",
      "language": "html",
      "preview": false,
      "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n  <title>Review Mode 手动复制方案</title>\n  <script src=\"./dist/core/JquanUI@Core.js\"></script>\n</head>\n<body class=\"bg-slate-50 p-6 text-slate-900\">\n  <main id=\"preview\" class=\"mx-auto max-w-xl\">\n    <p class=\"mb-3 text-sm font-semibold text-blue-600\">交付方案审查</p>\n    <h1 id=\"sample-title\" data-jq-review-key=\"title\" class=\"text-3xl font-bold\">客户确认前的标题</h1>\n    <p class=\"mt-4 text-slate-600\">如果浏览器不允许自动复制，审查面板会显示完整方案并自动全选，可直接按 Ctrl/Cmd+C 或长按复制。</p>\n    <button id=\"start-review\" type=\"button\" class=\"mt-6 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50\">打开审查</button>\n    <p id=\"load-status\" role=\"status\" class=\"mt-3 text-sm text-slate-500\"></p>\n  </main>\n  <script>\n    document.getElementById('start-review').addEventListener('click', async event => {\n      const button = event.currentTarget; button.disabled = true;\n      try {\n        const review = await JquanUI.import('reviewMode');\n        if (!review.state().enabled) review.configure({enabled:true,root:'#preview',allowURL:false});\n        review.open(); review.select('#sample-title');\n      } catch (_) { document.getElementById('load-status').textContent = '加载失败，请再次点击重试。'; }\n      finally { button.disabled = false; }\n    });\n    addEventListener('pagehide', () => window.JquanUIComponents?.reviewModeApi?.destroy());\n  </script>\n</body>\n</html>\n"
    }
  ],
  "schema": {
    "configure": {
      "signature": "configure(options?: ReviewModeOptions): boolean",
      "options": [
        [
          "enabled",
          "boolean",
          "false",
          "仅 true 启用入口"
        ],
        [
          "root",
          "HTMLElement|string",
          "document.body",
          "同文档已连接普通 HTML 根；无效时原会话不变"
        ],
        [
          "allowURL",
          "boolean",
          "true",
          "configure 时检查 ?jqui-review=1，不监听后续 URL 变化"
        ]
      ],
      "returns": "有效配置会恢复旧会话未被外部更新的预览字段并清理历史，然后替换配置。加载前可用 window.JQUAN_CONFIG.reviewMode；加载后也可手动 configure。"
    },
    "open": {
      "signature": "open(): boolean; close(): boolean; toggle(): boolean",
      "returns": "未启用或 root 离线时 open=false；重复 open 保留一个面板。close 成功时 true，已关闭时 false；保留预览与历史供再次 open 或 export/copy。Escape 关闭，浏览页面恢复常规交互。"
    },
    "select": {
      "signature": "select(target: HTMLElement|string): boolean",
      "options": [
        [
          "target",
          "HTMLElement|string",
          "必填",
          "同 document 已连接 root 内元素；Select 1.5+ 触发按钮及后代映射到原生字段"
        ]
      ],
      "returns": "活动会话选择成功为 true；失效/脱离/范围外返回 false。映射依赖真实 selectApi.get 与 handle.control/element 身份，不靠属性猜测；不打开下拉、不写修改历史。"
    },
    "setText": {
      "signature": "setText(value: string, index?: number): boolean",
      "options": [
        [
          "value",
          "string",
          "必填",
          "文字原样写入 Text.data，不解析 HTML"
        ],
        [
          "index",
          "number",
          "单个直接文本节点的索引或空元素的0",
          "childNodes 下标；混合句子有多个直接文本节点时必须指定"
        ]
      ],
      "returns": "成功 true；未打开、不支持的输入/媒体元素、非文本下标或页面冲突时 false。空元素可新增 Text；撤销恢复原先没有文本节点的状态。返回原值后该字段不导出。"
    },
    "setUtility": {
      "signature": "setUtility(property: ReviewUtilityField, token: string|null): boolean",
      "options": [
        [
          "property",
          "ReviewUtilityField",
          "必填",
          "35 个字段，见 field-groups 示例与类型"
        ],
        [
          "token",
          "string|null",
          "必填",
          "当前 Core 可解析的语义基础类，含小数、负间距、分数和透明度；禁止新增任意值/变体/important 类，null 移除字段族"
        ]
      ],
      "returns": "活动会话有效选中元素时，校验语义基础类实际 CSS 字段后替换该字段族，成功返回 true；无效类/字段/外部更新冲突返回 false。null 移除。原值与最终值归并，支持撤销。"
    },
    "setAttribute": {
      "signature": "setAttribute(name: ReviewAttribute, value: string|null): boolean",
      "options": [
        [
          "name",
          "'title'|'aria-label'|'aria-description'|'alt'|'href'",
          "必填",
          "alt 仅 IMG/AREA，href 仅 A/AREA"
        ],
        [
          "value",
          "string|null",
          "必填",
          "null 移除；空字符串表示存在的空属性"
        ]
      ],
      "returns": "只修改白名单字段；事件、id、审查键、class/style 等保持只读。href 解析后仅接收 http/https/mailto/tel/file 及其合法相对形式。"
    },
    "undo": {
      "signature": "undo(): boolean; redo(): boolean; reset(): boolean",
      "returns": "需要活动会话。新编辑退休 redo 分支；未变化的编辑不新增历史。字段或文本节点已被外部覆盖/移除时 undo/redo=false，保留外部值。reset 预检所有修改，无冲突才整体恢复并清空历史；有冲突则 false 且不部分还原。"
    },
    "changes": {
      "signature": "changes(): ReviewChange[]",
      "returns": "独立快照，按首次触及顺序输出。以节点身份 + 字段去重，只保留首次 before 和最终 after；原值字段省略。field 为 utility:CSS属性、attribute:属性名或 text:直接文本下标。target 包含 selector/stable；status 为 ready/conflict/detached。稳定定位优先唯一审查键、唯一 id，否则结构路径；同 id 替换节点不会接管旧历史。组件字段为 component:carousel.autoplay / component:carousel.interval / component:carousel.indicators / component:carousel.progress，before/after 为原生 boolean/number。"
    },
    "exportPlan": {
      "signature": "exportPlan(format: 'text'|'json' = 'text'): string",
      "returns": "text 为客户可读摘要 + JSON；json 为 schemaVersion=2（含组件净修改）或1（无组件净修改）、createdAt、page、changes。page 移除 jqui-review 参数，未配置时 createdAt=null。无效格式为空字符串；不写源文件、不执行 JSON。定位不稳定或冲突的项在摘要中提示核对。"
    },
    "copyPlan": {
      "signature": "copyPlan(format: 'text'|'json' = 'text'): Promise<boolean>",
      "returns": "依赖现有 Copy；enabled 会话可在关闭 UI 后复制。空计划、无效格式、剪贴板失败返回 false；成功 true。异步完成在会话关闭、变更或重配后不更新新面板提示。"
    },
    "saveDraft": {
      "signature": "saveDraft(key?: string): boolean",
      "returns": "enabled:true 且有净修改时保存版本化 ReviewPlan 到 localStorage，成功 true；关闭 UI 后仍可保存。无净修改、非法 key、序列化结果超过 1,048,576 个 UTF-16 代码单元或写入失败返回 false，保留旧草稿；不会保存未应用的输入、redo 历史或整页 HTML。保存包含 ready/conflict/detached 状态，后续由消费者核对。",
      "options": [
        [
          "key",
          "string",
          "\"default\"",
          "1–80 个 ASCII 字符；首位字母/数字，其余字母/数字/点/下划线/冒号/连字符。同源共享同一 key，应用应按项目/页面命名，例如 client-home。"
        ]
      ]
    },
    "loadDraft": {
      "signature": "loadDraft(key?: string): ReviewPlan|null",
      "returns": "返回独立 ReviewPlan|null；校验包格式/version/savedAt、计划版本、定位、规范字段和值类型。缺失、损坏、超限或存储读取失败返回 null，保留原存储。读取不要求启用/打开，销毁后仍可读取；不触碰 DOM、不恢复历史，旧方案仍需核对页面、元素定位和原值。",
      "options": [
        [
          "key",
          "string",
          "\"default\"",
          "1–80 个 ASCII 字符；首位字母/数字，其余字母/数字/点/下划线/冒号/连字符。同源共享同一 key，应用应按项目/页面命名，例如 client-home。"
        ]
      ]
    },
    "clearDraft": {
      "signature": "clearDraft(key?: string): boolean",
      "returns": "删除当前 key 的草稿（包括损坏数据）；存在且成功删除返回 true，缺失、非法 key 或读取/删除失败返回 false。只删除对应 jquanui-review-draft:<key>，保留其他应用存储。configure/destroy/reset 均不自动清理草稿。",
      "options": [
        [
          "key",
          "string",
          "\"default\"",
          "1–80 个 ASCII 字符；首位字母/数字，其余字母/数字/点/下划线/冒号/连字符。同源共享同一 key，应用应按项目/页面命名，例如 client-home。"
        ]
      ]
    },
    "applyPlan": {
      "signature": "applyPlan(plan: ReviewPlan|string, options?: { dryRun?: boolean }): ReviewApplyResult",
      "options": [
        [
          "plan",
          "ReviewPlan|string",
          "必填",
          "可传 loadDraft() 返回值或 exportPlan('json')；只接受当前 schema 的规范字段"
        ],
        [
          "options.dryRun",
          "boolean",
          "true",
          "默认只预检不改 DOM；显式 false 才执行应用"
        ]
      ],
      "returns": "返回 {ok,dryRun,applied,issues,changes}。要求当前已 configure(enabled:true)，且 session 没有未提交记录；页面路径相同、target.stable=true 且唯一、status=ready、schema/字段值合法、当前值等于 before，显式应用还要求 open()。任一项失败则 applied=0 且不写入。应用阶段复用审查记录和 undo/redo，写入失败会恢复仍由会话持有的字段并报告 rollback-conflict；仅修改当前预览 DOM，不写源文件。issues.code 包含 session-not-empty、not-active、page-mismatch、target-not-found、target-ambiguous、before-mismatch、non-ready-status、invalid-plan、write-failed 等。"
    },
    "state": {
      "signature": "state(): ReviewModeState",
      "returns": "enabled、active、picking、changeCount、canUndo、canRedo、selection；selection 包括 tag/label/text摘要、textNodes 的实际索引/原文、定位/类/属性/组件标记和8项计算外观。只读属性里 password value 掩码；不导出整页 HTML 或输入框值。 selection.navigation 包含 parent、first-child、previous-sibling、next-sibling 四方向是否可用；返回独立快照，不含 DOM 引用。"
    },
    "destroy": {
      "signature": "destroy(): void",
      "returns": "恢复仍匹配本会话最终值的预览字段，保留外部更新/已脱离当前 root 的节点；清空记录、UI、观察器、监听与 RAF 并禁用入口。Core.destroy 同样清理。草稿由 saveDraft/loadDraft/clearDraft 独立管理，不会随 destroy 自动写入或应用。"
    },
    "utilities": {
      "signature": "utilities(query?: string): ReviewUtilityDescriptor[]",
      "options": [
        [
          "query",
          "string",
          "空字符串",
          "忽略大小写的子串查询，trim后最多120字符；字段/组匹配则保留该字段全部选项，候选匹配则过滤选项。非字符串返回空数组。"
        ]
      ],
      "returns": "默认返回六组35字段的独立快照；查询无匹配返回[]，每项 field/label/group/options[{token,label}]。不扫描页面，不启用会话，不安装额外组件。 0.14 utilities() 发现 theme / theme.extend 的 fontSize、fluid.fontSize、borderRadius（兼容 radius）、boxShadow，映射 text-* / text-fluid-* / rounded-* / shadow-*；圆角/阴影 DEFAULT 对应 rounded/shadow。每个新字段先去重并至多考察64个配置候选，再按 Core.resolve 的实际最终字段校验及搜索，内置候选另计，extend 优先列入；名称遵循既有语义类语法（字母/数字/点/连字符，不含下划线）。这不是全部原子类清单。配置先于 Core；普通令牌需支持它们的当前 Core，旧 Core 未解析的项会过滤，不热更新 Core 配置。 0.15 新增 font-family（字体）、text-decoration-line（无装饰/下划线/上划线/删除线）和 white-space（正常换行/单行/保留空白与换行）字段，六组共35字段。font-sans/font-serif/font-mono 为内置字体候选；theme/theme.extend.fontFamily 的字符串或字符串数组映射 font-*，extend 优先，64个配置候选上限先于 Core 校验与搜索，内置另计。字段只设置字体族，不下载字体文件；项目字体文件与加载等待由页面负责。"
    },
    "revert": {
      "signature": "revert(target: HTMLElement|string, field: ReviewChange[\"field\"]): boolean",
      "options": [
        [
          "target",
          "HTMLElement|string",
          "必填",
          "当前文档中原始记录所属节点或查询选择器；按节点身份查找，不靠 id 接管替代节点。"
        ],
        [
          "field",
          "utility:<ReviewUtilityField>|attribute:<ReviewAttribute>|text:<number>|component:carousel.autoplay|component:carousel.interval|component:carousel.indicators|component:carousel.progress|component:tabs.autoplay|component:tabs.interval|component:tabs.loop|component:select.disabled|component:select.searchable|component:select.clearable|component:popover.open",
          "必填",
          "changes() 中的规范字段，如 utility:color、attribute:title、text:0。"
        ]
      ],
      "returns": "活动会话、原节点仍可编辑且当前字段与本会话最终值相同时恢复首次原值并加入撤销历史，返回true；无净修改/字段不存在/冲突/节点脱离时false，不部分覆盖。支持还原未被选中的节点字段。"
    },
    "navigate": {
      "signature": "navigate(direction: ReviewNavigationDirection): boolean",
      "options": [
        [
          "direction",
          "'parent'|'first-child'|'previous-sibling'|'next-sibling'",
          "必填",
          "直接父元素、首个可选直接子元素、最近可选前/后兄弟；不越过 root。"
        ]
      ],
      "returns": "活动会话且当前原节点仍可选、该方向有目标时选择并最近滚动，返回 true；无选中、关闭、节点脱离、边界或无效方向返回 false，保留现有修改与 undo/redo。没有新增依赖；destroy 沿用会话清理。"
    },
    "componentOptions": {
      "signature": "componentOptions(): ReviewComponentOption[]",
      "returns": "选中已挂载 Carousel 1.8+、Tabs 2.4+、Select 1.4+ 或 Popover 1.6+ 根节点时返回对应公开配置的独立快照；Tabs 2.5+ 额外提供 loop:boolean，旧句柄隐藏该项。未挂载节点、子节点、旧版本或未加载组件返回[]，不会自动导入/挂载。"
    },
    "setComponentOption": {
      "signature": "setComponentOption(component, option, value): boolean",
      "options": [
        [
          "component",
          "\"carousel\"|\"tabs\"|\"select\"|\"popover\"",
          "必填",
          "选择已挂载的组件根节点；Select 为原生 select"
        ],
        [
          "option",
          "\"autoplay\"|\"interval\"|\"indicators\"|\"progress\"|\"loop\"|\"disabled\"|\"searchable\"|\"clearable\"|\"open\"",
          "必填",
          "Carousel/Tabs: autoplay、interval；Tabs 2.5+ 另支持 loop；Select: disabled、searchable、clearable；Popover: open"
        ],
        [
          "value",
          "boolean|number",
          "必填",
          "autoplay/indicators/progress/loop/disabled/searchable/clearable/open 必须布尔；interval 必须有限数字且>=1200毫秒；不自动转换或钳制输入"
        ]
      ],
      "returns": "Carousel/Tabs/Select 沿用各自公开 setter；Carousel 1.8+ 的 indicators/progress 不重建内容；Popover 仅支持 open:boolean，并通过 popoverApi.open/close/getState 工作。字段参与原值/最终值去重、undo/redo/reset/revert/destroy 与 schemaVersion 2；组件不存在、未挂载、外部更新或值类型错误返回 false。 Popover 需 1.6+ getHandle()，保存原句柄身份，销毁/重挂后拒绝旧记录操作；close/open 保留原会话，新实例需重新 configure。"
    },
    "keyboardHistory": {
      "signature": "keydown: Ctrl/Meta+Z | Ctrl/Meta+Shift+Z | Ctrl/Meta+Y",
      "options": [
        [
          "范围",
          "root 或 review UI",
          "选择模式",
          "浏览模式只处理工具层；原生输入控件保留本地撤销"
        ],
        [
          "撤销对象",
          "已应用 Review 历史",
          "无自动提交",
          "未点击应用的文字草稿由输入框原生撤销管理"
        ]
      ],
      "returns": "有相应历史时拦截按键并复用 undo/redo；无历史、编辑控件、组合键排除条件或关闭会话时不拦截。冲突时提示并保留原页面值。"
    }
  },
  "events": []
};


