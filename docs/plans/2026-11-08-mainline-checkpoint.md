# 主线进度与支线切换：2026-11-08

## 本轮安排

用户已授权自行安排推进顺序。Core 实战反馈支线已收口，主线已推进到 Review Mode 0.18.1；当前修复连续复制竞态，后续继续组件审查与交互体验切片。5.0 继续分片迭代。

主线恢复时先读本文件、`docs/plans/2026-10-30-visual-review-mode.md`、项目 skill 和当前源码。支线实施队列见 `docs/plans/2026-11-08-core-runtime-remediation.md`。

## 当前实现

2026-11-12 最新恢复点：Review Mode 0.18.1 连续复制竞态修复。只有最新有效 copyPlan 请求更新 UI，新请求立即清除旧手动面板；旧 Promise 仍返回各自结果。新增四入口专项，保留现有方案 schema、编辑历史和按需导入。完整 check 与 check:review-mode 退出 0；专项四入口各 22 断言通过，隔离回退 17 文件哈希匹配。包体 859935 / 860160 bytes，未提高预算；Core/min/Full/Components 原字节保留。验证与回退见 verification/review-mode-copy-race-2026-11-12/VERIFICATION.txt。

2026-11-11 最新恢复点：Carousel 1.8 / Review Mode 0.18 无损控制切片。Carousel 通过 setIndicators/setProgress 只替换自有控制节点，保留当前页、内容、句柄与播放计时；Review 增加 component:carousel.indicators/progress，复用历史、草稿、strict apply 和冲突规则。复制失败兜底仍保留，完整验收见 verification/review-mode-carousel-controls-2026-11-11/VERIFICATION.txt。

2026-11-11 Carousel 无损控制切片已交付，不再作为下一项重复实施；证据见 verification/review-mode-carousel-controls-2026-11-11/VERIFICATION.txt。


2026-11-10 最新恢复点：Review Mode 0.16.1 动态审查输入修复。后台刷新保留当前聚焦的未应用文字/属性/间隔输入和光标，干净输入跟随源值；显式操作沿用真实值和冲突验证。未应用输入不进入历史、导出或持久化草稿。文档、skill和按需示例同步，完整验收以 verification/review-mode-input-drafts-2026-11-10/VERIFICATION.txt 为准。

2026-11-09 补录恢复点：Review Mode 0.16.0 / Tabs 2.5.0 首尾循环审查已完成，稳定 setLoop(boolean)、state().loop、component:tabs.loop；四入口67断言、高频组件31断言、完整check/Review和类型检查、22文件隔离回退通过，见 verification/review-mode-tabs-loop-2026-11-09/VERIFICATION.txt。原文件已更新0.16版本行，但上轮恢复点段落因换行匹配未插入，本次补录。

2026-11-09 最新恢复点：Review Mode 0.15.0 排版切片已交付，新增 font-family/text-decoration-line/white-space 与项目字体候选，六组35字段。完整 check、完整 Review 回归、四入口各74断言、1280/390px 按需示例与严格类型通过；文档/skill/类型同步，Core/min/Full/Components 哈希保持本轮基线。truncate 作为跨字段复合类保留，旧 overflow 方案含它时预检 invalid-value，不写 DOM；需要拆开编辑时先拆源类并重新生成方案。证据见 verification/review-mode-typography-2026-11-09/VERIFICATION.txt。后续从0.15继续，不重做 Core 支线或0.14主题候选。

2026-11-09 最新恢复点：已返回主线并交付 Review Mode 0.14.0 项目主题候选切片。utilities/面板发现 fontSize、fluid.fontSize、borderRadius/radius、boxShadow；每新增字段64个配置候选上限，复用 Core 最终解析和既有历史/草稿/apply，隔离自定义 resolver 异常。四入口各68断言、1280/390px 按需示例、最终源码完整 check 与完整 Review 回归、严格类型均通过。文档/skill/类型/示例同步，Core/min/Full/Components 哈希保持本切片开始时的值。证据见 verification/review-mode-theme-tokens-2026-11-09/VERIFICATION.txt；从当前0.14继续后续审查切片，不重做 Core 支线或主题候选。

2026-11-08 最新恢复点：Core 支线第 1–3 项已完成；第 4 项版本元数据、三种引入说明、类型/skill 与 21 份同步副本归档已交付。完整 check、严格类型、实际打包安装 smoke 通过，证据见 `verification/core-distribution-2026-11-08/VERIFICATION.txt`。新增 engineVersion/versionLabel，旧 version 兼容保留。尚有 1 份 CHANGELOG 云占位副本原位待文件可读后核对归档，不记为全部目录清理完成。主线可以从 Review Mode 0.13.1 已完成切片继续，不重做前 3 项或既有 Popover 生命周期修复。

- Core 正式版本仍为 4.72.0，源码 `dist/core/JquanUI@Core.js`。
- Review Mode 已更新到 0.18.1，继续作为独立按需组件，通过 `JquanUI.import('reviewMode')` 加载，依赖 Copy，Core/Full/Components 不包含其实现。
- 已有元素选择/导航、直接文本片段、白名单属性、六组 35 项外观字段、搜索/色样、最终值去重、撤销/重做、逐项恢复及方案复制。
- 已接入 Carousel/Tabs 配置、Select 配置与可见触发器映射、Popover 开关、显式持久化草稿和默认 dry-run 的严格 `applyPlan`。
- 源码定位与源文件写回仍为规划，完整 5.0 尚未完成。

## Popover 切片本轮修正

原适配器按 DOM 属性猜测挂载状态，并在操作时重新查找节点上的实例；销毁后重挂会让旧记录操作新实例。

Popover 1.6.0 新增只读 `getHandle(target)`，Review 捕获原始稳定句柄并核对 `handle.element() === node`。销毁、同节点重挂、同 id 换节点时旧记录转为 conflict，即使新实例开关值相同也不会被撤销/恢复修改。未挂载标记节点和子节点不暴露组件字段。业务组件继续独立导入/挂载，Review 不自动加载业务 Popover。

同步更新组件文档、项目 skill、类型、按需示例、CHANGELOG 和聚合产物。示例真实按钮触发 Review 导入，pagehide 先销毁 Review 再销毁业务实例。

## 验证与回退证据

当前验收日志及四入口基线/修复/回退行为保存在 `verification/review-mode-popover-lifecycle/`，最终命令与退出状态见 `VERIFICATION.txt`。

本轮当前 Popover 切片验收完成。`npm run check:review-mode` 最终退出 0：四入口每入口基础 46、编辑 275、按需 14、草稿 62、apply 41、Popover 生命周期 40 项断言通过，配套示例通过。`check:overlays`、`check:docs`、`check:component-docs`、types-surface、严格 TypeScript consumer、manifest、size 和 bundle 一致性检查通过。完整 5.0 仍按上述未完成项继续推进。

- 专项断言覆盖句柄身份、未挂载/销毁/重挂、历史/去重/恢复、草稿、严格 apply、外部更新及回调重入。
- 回退在独立 rollback-copy 上执行，逐文件核对原始 SHA256，并重新运行相同行为探针；工作目录保留修复实现。
- 完整 Review 回归曾出现 Runtime.evaluate 超时，以及固定等待 150ms 后的 Full 移动布局失败；独立 min/Full 复跑通过。布局回归改为有上限地等待实际重排结果，保留原来的越界/重叠断言。初次失败日志也保留；最终回归状态以 VERIFICATION.txt 为准。
- Core 和压缩 Core 本轮未改。发布候选 `npm run verify` 本轮未执行。

**旧证据口径更正：** `verification/review-mode-popover/BASELINE_FILE.js` 已是 0.13；其中 MODIFIED_FILE 只增加 fixture 注释，不能证明功能回退或实例隔离正确。该旧目录不作为本次验收证据。

## Core 支线结论及恢复点

输入为根目录 `ISSUES-2026-11-08-core-4.72.md` 和相邻 excel 项目的 `js/__diag.html`；附件中的建议按待核验材料处理。完整判定见 `docs/diagnostics/2026-11-08-core-4.72-assessment.md`，可复跑探针和原始输出见 `verification/core-4.72-audit-2026-11-08/`。

成立且优先：普通 borderRadius/boxShadow/fontSize 令牌缺失、未知配置缺诊断、非法颜色/字体可中断初始化、动态 compile 完成契约与文档不符。

需纠正：首次受支持的晚到配置会恢复未解析类；普通 scan 保留诊断；仓库的 js 压缩入口存在。直接 resolve 是只读查询，compile/扫描会记录未解析类，二者应区分。

Core 支线第 1 项已实现普通 borderRadius（radius 别名）、boxShadow、fontSize 与结构化 configWarnings；runtime、min、Full、静态提取、doctor 与构建严格模式已接入。文档/skill/类型/示例同步；`npm run check`、`npm run check:review-mode`、Core 性能预算和严格类型均通过，最终验收状态见 verification/core-config-tokens-2026-11-08/VERIFICATION.txt。下一项为动态编译完成契约，随后是类诊断、版本与分发入口。Core 源码、压缩版及 Full 已在本支线更新，前文“Core 本轮未改”仅指 Popover 切片；原始哈希与回退副本另存。未改传入的诊断页，也未删除或归档同步副本。

2026-11-08 动态编译完成契约已完成：Core/min/Full 的 `compile()` 返回 awaitable 本批结果；`flush({maxMs})` 提供同步合作式预算快照；保留 20/40 默认切片并增加 sync 选项。结果明确区分 processed/unresolved/failed/pending，支持 busy/budget/stylesheet-unavailable/destroyed/config-changed 原因；缓存格式 4 保存负结果。文档、skill、类型、示例和 `check:core-compile` 已同步，每入口 46 断言及 fallback/缓存/无样式表/示例检查通过，完整 `npm run check`、严格 TypeScript consumer、Core 性能三样本通过。Full 的 Core 改用组件既有紧凑格式（不压缩变换/重命名），修复包体预算超限且保留公开归档导出。证据见 verification/core-compile-completion-2026-11-08/VERIFICATION.txt。当前第 3 项诊断与自动化接法仍未完成；发布 `verify` 未执行。

本切片完整 `check:review-mode` 已退出 0，主线 Review 按需导入和原四入口全套断言保持通过；基线/修改/独立回退及逐文件 SHA256 对照通过，工作目录保留修改版。恢复工作从 Core 支线第 3 项继续，无需重新做第 1/2 项。

2026-11-08 第 3 项已收口：Core checkClasses 只读批量查询和独立历史 runtime 状态已落地，保留数量/时间预算，区分未命中、解析异常、CSSOM 插入异常和预算跳过；查询不改变样式/队列/debug/指标/缓存。缓存格式 5 保存失败阶段、4 失效，jquan-ready 不再产生未解析噪声。文档、skill、类型、参数表、架构页交互和独立示例已同步。三入口各 49 断言与缓存/无样式表检查、24 提取对账、1280/390px 实际 CSS、完整 check、严格类型、三样本性能和完整 Review 回归均通过。证据在 verification/core-class-diagnostics-2026-11-08/VERIFICATION.txt；发布 verify 未执行。恢复工作改从第 4 项版本/入口/同步副本继续；完整 5.0 和源文件写回仍在规划。
