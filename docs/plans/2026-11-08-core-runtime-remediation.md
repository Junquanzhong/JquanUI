# Core 实战反馈支线：实施队列

日期：2026-11-08。来源：`docs/diagnostics/2026-11-08-core-4.72-assessment.md`。用户已授权安排主线/支线顺序并继续实施。

## 执行顺序

先收口当前 Review Mode 0.13 的 Popover 实例隔离切片，再转入本支线。整个 5.0 提案继续按分片推进；本支线不是等待完整 5.0 发布之后才处理。

主线切片完成条件：真实已挂载实例识别、销毁/同节点重挂隔离、去重/撤销/草稿/apply/回调重入验证、按需示例、类型/文档/skill 同步、生成包一致、原始副本可复测恢复。

2026-11-08 切换记录：以上 Popover 切片已完成，Review Mode 0.13.1 / Popover 1.6.0，完整 Review 回归退出 0；基线、修复、回退四入口行为对照及逐文件哈希见 `verification/review-mode-popover-lifecycle/VERIFICATION.txt`。Core 分项状态以以下表格和最新实施记录为准。

## 支线待办与验收

| 顺序 | 工作 | 完成条件 | 当前状态 |
| --- | --- | --- | --- |
| 1 | 配置校验与普通设计令牌 | 未知键给结构化路径诊断；非法颜色/字体不再中断初始化；borderRadius/boxShadow/fontSize 的值类型和覆盖规则明确；运行时与提取产物一致 | 已完成；专项、提取、类型、文档、完整 check、Review 交叉回归和性能预算均通过 |
| 2 | 动态编译完成契约 | compile 的立即/异步语义与文档一致；提供有明确返回与预算边界的完成机制；动态 20/21/40/41 类和大批量压力验证 | 已完成；三入口专项、完整 check、严格类型、三样本真实性能及文档通过 |
| 3 | 诊断与自动化接法 | 批量校验/显式追踪区分解析失败、插入失败与预算跳过；保持纯查询无副作用；初始 ready 与动态完成分别验收 | 已完成；只读批量查询、失败阶段、自动化范式及三入口专项/类型/文档/真实性能通过 |
| 4 | 版本字段、入口文档与同步副本 | 版本与标签兼容方案、仓库/npm/dist 引入说明、先差异核对与哈希再可恢复归档；发布包继续排除旧副本 | API/入口说明及 21 份可读副本归档已实施；1 份云占位副本原位待核对，验证记录见下文 |

## 第 4 项实施记录：兼容版本元数据与分发整理

新增 `JquanUI.engineVersion` 纯 semver 和 `versionLabel` 描述标签；旧 `version` 继续返回 `4.72.0 (Enterprise Plugin Lifecycle)`，debug/metrics/ready 的 version 仍为 `4.72.0`。保持包版本 4.72.0，记录在 Unreleased；同步公开类型、README、intro 开发者文档及项目 skill。

入口说明区分完整仓库、仅复制 dist 和 npm 浏览器构建器。保留 dist/core 与 dist/components（含 dist 目录名）可自动推断组件地址；打包改名、目录扁平化/改名需要显式 `componentLoader.baseURL`，构建器不会自动复制动态组件资源。配置必须先执行，示例使用前置 HTML 配置或赋值后动态 import。Node/SSR 浏览器子路径继续 no-op，提取走根入口/extract。公开 core-archive-v4.5 导出及正式历史文件保留。

新增 `check:core-distribution`，纳入 check:core 与 check；真实 Edge 核对 Core/min/Full 的旧/新元数据、ready/debug/metrics 一致、现有 CSS 和按需 Review 边界，测试仓库/dist-only/打包后自定义地址的 dom 按需导入，并检查 Node CJS/ESM 条件入口。完整 check、严格 TypeScript 和实际 npm 打包安装 smoke 退出 0；该切片仅变更 Core 元数据，不改变解析/扫描/缓存/提取实现，未新增性能优化声明或重复性能基准。发布 verify 未执行。

22 份同步副本中，21 份可读取文件均与正式对应文件核对差异、记录 SHA256 后归档到 `archives/sync-copies-2026-11-08.zip`，解压到独立目录逐份比对成功后才移除原副本。原始 ISSUES 文档中的 6 处名称是历史诊断记录，不是加载入口，保持原文。另有 `.jquan-home.html` 和 `config/mcporter.json` 因云占位读取失败未纳入引用内容核对，正常页面、构建与 package exports 已核对。清单与限制见 `docs/archives/2026-11-08-sync-copies.md`。

**保留待办**：`CHANGELOG-DESKTOP-064SV5C.md` 云占位文件因 OneDrive 提供程序未运行而未取得字节与哈希，原位保留，不能标记全部目录清理完成。云文件恢复可读后，沿用相同差异/引用/哈希/解压验证流程处理。Core 功能支线已交付，主线可从 Review Mode 0.13.1 的现有切片继续，完整 5.0 和源文件写回仍为规划。

基线/修改/独立回退的完整命令、字面输出、退出状态、逐文件哈希和四件交付物见 `verification/core-distribution-2026-11-08/VERIFICATION.txt`。隔离回退恢复 37 个已捕获文件（含 21 份原副本），现场保留新实现与归档。

每项交付同时更新 `content/`、项目 skill、公开类型与必要示例。Core 扫描/解析/缓存/排序/提取改动运行真实性能检查；发布候选使用 `verify`。先保存正式 Core、min、Full 的基线，逐入口对账后再生成产物，不提升包体/性能阈值掩盖回归。

晚到配置首次恢复、普通 scan 保留诊断和 min 文件存在性已有实测依据。将这些保留为回归，不按附件误判另立修复。也不通过 webdriver 自动改变同步语义。

## 第 1 项实施记录

2026-11-08 已接入普通 theme/extend.borderRadius（兼容 radius）、boxShadow、fontSize。字号支持字符串、[字号, 行高] 与 [字号, {lineHeight,letterSpacing,fontWeight}]；普通 token 合并内置值，extend 覆盖 theme，显式 customUtilities 优先。方向圆角、ring 阴影、迁移与 tokens 的原 radius 输出继续复用已有能力。

debug()/diagnose() 与提取报告增加独立的 configWarnings（path/code/message）。theme/extend 未知键、普通令牌及初始 semantic 的类型/结构异常被隔离；配置对象不再被生成规则改写，冻结配置可用。根级组件/插件键继续透传，不宣称完整 CSS 语义或全生态配置校验。CLI --fail-on-warn、Vite/PostCSS failOnWarn 和 doctor 接入同一诊断。缓存格式从 2 到 3，使旧语义缓存失效，新格式保留热启动。

回归入口 npm run check:core-config，已纳入 check:core 和 check；同时更新 content/theme-darkmode.js、圆角/阴影/字号文档、skill、类型、README、CHANGELOG 和 examples/core-config-tokens.html。专项/静态提取覆盖三种正式运行时、冻结配置、错误隔离、类型、覆盖顺序、首次晚赋、缓存、ring 与构建严格模式。`npm run check`、`npm run check:review-mode`、Core 性能预算和严格类型均退出 0。最终命令、哈希与副本回退结果见 verification/core-config-tokens-2026-11-08/VERIFICATION.txt。

下一切片从第 2 项“动态编译完成契约”继续。本文件后续计划 API 只有实现并测试后才可写为已支持。

## 第 2 项实施记录：动态编译完成契约

2026-11-08 已完成 Core `compile()`/`flush()` 契约。`compile(classes, { sync })` 接受 string 或 Iterable，变体组展开、类名去重；返回只针对本次请求的 Promise。默认不改变冷队列行为：不超过 20 个类同步处理，大队列通过 idle 分片，每片最多 40 个；`sync:true` 显式同步排空共享队列。`flush({ maxMs })` 在返回 Promise 前合作式处理当前队列，0 不处理类、省略预算排空；每类前检查预算，单个 resolver/CSSOM 插入不可抢占，预算结果使用 `reason: 'budget'`。flush 不扫描 DOM、不执行插件 scan hook，也不消费未交付 MutationObserver 记录。

结果字段为 `requested`、`processed`、`unresolved`、`failed`、`pending`、`complete`、`cancelled`、`reason`、`remaining`、`durationMs`。`complete` 只表示本请求没有 pending，必须独立检查 unresolved/failed；诊断数组上限不影响结果数组。destroy、首次受支持的晚到配置和样式表暂不可用均有明确结算原因；旧 idle 任务由 generation/token 失效。缓存格式升至 4，保存 unresolved/failed 结果，旧格式失效。

已同步 `dist/index.d.ts`、`dist/cli/jquan-extract.d.ts` 的复用类型、`content/jit-syntax.js`、README、项目 skill、CHANGELOG、`examples/core-compile-completion.html` 和 `check:core-compile`。三入口（Core/min/Full）专项每入口 46 项断言另加 fallback/缓存/样式表检查，覆盖 20/21/40/41/1000 阈值、重复/重叠请求、101 未解析类、CSSOM/解析异常、0/2ms 预算、重入 busy、无 idle fallback、热缓存负结果与旧格式、stylesheet-unavailable 重试、flush 纯性、destroy/晚配取消；390px 示例验证真实 CSS、两种按钮路径和无溢出。`npm run check`、严格 TypeScript consumer、三样本 `npm run check:core-performance` 均退出 0。发布 `verify` 未执行。

全量检查初次遇到 manifest 过期、随后 npm packed bytes 超原预算 3532 字节。保留公开 core-archive-v4.5 导出，未删除旧文件；Full 的 Core 复用组件既有 Terser 紧凑格式（compress:false、mangle:false），独立源码保留注释。最终包 128 文件、3947801 unpacked bytes、849793 packed bytes，原 840KiB packed 预算不变；生成包行为对账和 bundles 一致性通过。源码/构建器/文档/skill/类型快照与回退记录见 `verification/core-compile-completion-2026-11-08/VERIFICATION.txt`。

完整 `npm run check:review-mode` 退出 0，原四入口基础/编辑/按需/草稿/apply/Popover 生命周期断言均通过。baseline/modified/rollback 行为探针均退出 0，独立 rollback-copy 的所有清单文件 SHA256 等于 baseline；现场源码与 MODIFIED_FILE 保持修改版。jit-syntax 文档基线是本轮精确逆转重建，未预先捕获其原始哈希；该限制已写入证据，不据此宣称文档原字节来源。

下一项为第 3 项“诊断与自动化接法”，重点是独立批量校验/显式追踪，不把 debug 样本当作完成结果。

## 第 3 项实施记录：只读类诊断与自动化

Core 已新增同步 `checkClasses(classNames, {maxClasses,timeoutMs})`。输入规范化复用 compile，逐类返回当前 status（resolved/unresolved/error/ignored/skipped）、CSS 或错误摘要、预算原因和调用入口时的历史 runtime（unprocessed/pending/processed/unresolved/resolve-error/insert-error）。当前能解析与过去是否失败相互独立。complete 表示没有跳过，ok 表示所有项都 resolved/ignored 且没有跳过；业务标记未解析不自动当作页面故障。预算每类前检查，单次 resolver 不可抢占，输入枚举/展开不计入解析预算。

查询不插入 CSS、不扫描 DOM/运行 scan hook、不排空队列、不写 processed/debug/指标/缓存；自定义 resolver 仍需自身同步且纯净。错误被逐项隔离，包括抛出非 Error 的 null/string；已有 compile 的失败数组保持兼容。缓存格式 5 保存 resolve-error/insert-error，格式 4 失效，避免热启动丢失失败阶段。jquan-ready 作为保留标记返回 ignored，扫描/编译不再产生未解析噪声，直接 resolve 仍为 null。

文档明确初始 ready、业务异步更新和动态编译完成是三个阶段；截图前等待本次 compile 结果、所需字体/图片和实际布局。`debug()/diagnose()` 默认只查询，`{track:true}` 显式开启冲突跟踪并扫描；类型补齐 track 参数与 resolve 签名。同步更新 content/architecture.js 的交互校验/参数表/生命周期/自动化范式、jit-syntax 缓存说明、README、skill、公开类型、CHANGELOG 和 examples/core-class-diagnostics.html。

`npm run check:core-diagnostics` 每正式入口 49 断言，另有缓存/无样式表查询和 24 静态提取对账断言；覆盖快照纯性、去重/变体组、121 未解析类、数量/时间/零预算、错误隔离、独立历史、动态队列不被查询排空、缓存失败阶段及旧格式失效。示例在 1280/390px 检查只读查询、41 类动态完成与真实 computed CSS，无横向溢出；真实 architecture 模块 mount/校验/unmount 通过。完整 check、严格 TypeScript、三样本性能预算、原 compile/flush 专项及完整 Review 交叉回归退出 0。发布 verify 未执行。

基线/修改/独立回退的完整命令、字面输出、退出状态和逐文件 SHA256 在 `verification/core-class-diagnostics-2026-11-08/VERIFICATION.txt`。下一项从第 4 项“版本字段、入口文档与同步副本”继续；主线 Review 保持 0.13.1 按需交付。
