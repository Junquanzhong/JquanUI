# JquanUI Engine Roadmap

这份路线图只规划 JquanUI 的底层能力，不包含 CRM、行业业务组件或客户项目模板。

## 核心验收标准

每项迭代都必须同时服务于：方便、快捷、极速、好用。

- 常见需求优先用一个直观的原子类或模板语法完成。
- 新能力先检查现有映射、变体、组件和工具链，禁止重复实现。
- 默认行为保持轻量；高成本能力必须 opt-in 或仅在开发/构建阶段启用。
- API、参数、注释和错误信息保持一致，失败时给出可定位的原因。
- 新功能必须有回归测试、文档示例和版本记录。
- 新增组件、功能、公开 API、配置项、变体或原子类必须有配套文档；已有能力扩展必须更新原文档，并通过 `npm run check:docs` 文档闸门。

## 4.72.0 本轮完成

- 补齐 Anchor Positioning：`anchor-scope-*`、`position-area-*`、`position-try-*`、`position-try-order-*`、`position-visibility-*`，常用区域与回退策略优先提供语义类。
- 补齐 View Transitions：`view-transition-group-*`、`view-transition-types-*`，保留自定义名称和过渡类型的任意值通道。
- 同步 Core、Full、压缩产物、回归测试、README、组件现代 CSS 示例、AI Skill、版本元数据和发布验证。

## 4.71.0 本轮完成

- 完成无框架依赖的 SSR 薄适配层：通用 renderer、React、Vue、Svelte、Next、Nuxt 均复用现有关键 CSS 提取与 CSP 注入管线。
- `renderPage()` 支持同步/异步渲染结果，保留框架输出的 `head`、`css`，并提供可转义语言属性的完整 HTML 文档生成。
- `createDocument()` 与自定义 document 工厂保持一致，补齐 CJS、ESM、类型、exports、README、AI Skill 和回归测试。
- 文档浏览器回归改为等待动态内容完成原子样式增强后再采样，降低异步模块加载下的时序抖动。

## 4.70.0 本轮完成

- 深化 Shadow DOM / Web Components 生命周期：`adopt()` 默认同步扫描现有类并监听后续 class、状态属性和子节点变化。
- `adopt(root, { scan, observe })` 与 `detach()` 保持幂等；卸载会断开专属 observer、取消待处理帧、执行插件行为 teardown，并保留第三方 adopted sheets。
- 新增只读 `getAdoptionStatus(root)`，公开挂载、监听、样式模式和 JquanUI sheet 数量，不暴露 root 列表。
- 真实 Chromium 回归覆盖 100 个 ShadowRoot、重复挂载、动态编译、双 root 隔离、主题变量继承和插件生命周期。
- 同步 Core、Full、压缩产物、公共类型、README、AI Skill、CHANGELOG、性能基准和发布验证档案。

## 4.69.0 本轮完成

- 完成容器查询 2.0 的统一路由：`@sm/sidebar:` 与兼容的 `@sidebar/sm:` 都生成正确的命名容器查询。
- 支持 `@sidebar/[min-width:400px]:` 命名任意条件、多个 `@...:` 嵌套组合，并对容器名和条件执行安全校验。
- 支持 `theme.containers` / `theme.extend.containers` 配置重复阈值；运行时、静态提取、插件主题读取和排序继续共用同一条管线。
- 补齐 Core、Full、类型、开发者文档、AI Skill 和回归测试。

## 4.68.0 本轮完成

- `jquan-migrate` 支持 Tailwind 配置作为审计上下文，读取 `theme.extend` 的颜色、间距、断点、圆角、字号、字重和行高令牌，并对插件、`corePlugins`、`variants` 等未执行项给出明确告警。
- 报告新增 `before`/`after`、`migrationSuggestions`、`configWarnings`、`unsupportedTailwindTokens` 和阈值结果，方便人工迁移与 CI 审查。
- 新增 HTML/JS/TS/Vue/Svelte/Astro/Markdown/MDX 类名顺序审计；`--source` 只输出稳定排序建议，不改写业务源码。
- 新增 `--min-expressible`、`--max-manual`、`--max-order`，并修复 `check:migrate` npm 命令缺失。

## 4.67.0 本轮完成

- 建立真实 Chromium Core 性能基准，覆盖 32 节点小页面、2500 节点大 DOM、同页面暖缓存、160 项 MutationObserver 变更、100 个 ShadowRoot 和 2500 节点构建提取。
- 输出浏览器/硬件环境、min/median/max、缓存状态、规则数量与 source/minified/gzip 字节到 `reports/core-performance.json`。
- 新增 `benchmark:core` 与 `check:core-performance`；后者以保守 median 预算拦截明显回退，不把单机数据包装成普遍性能承诺。

## 4.66.0 本轮完成

- 新增 `JquanUI.prefetch(classes, options)`，仅预热显式类名，不扫描 DOM，也不支持无界通配预取。
- 通过 `maxClasses`、`maxBytes`、`timeoutMs` 约束单次同步工作，并返回 accepted/skipped、规则数、字节数、耗时和截断原因。
- 预取与普通运行时共享解析器、canonical rule order、CSSOM 注入和缓存；补齐类型、指标、双文档和回归闸门。

## 4.65.0 本轮完成

- Baseline CSS 独立输出已完成：CLI、Node API、Vite、PostCSS 共享同一份基础/utility 分区结果，默认单文件输出保持兼容。
- 新增 `baselineCss`、`utilityCss` 与对应字节统计；Vite `split: true` 和 PostCSS 双指令支持按顺序加载并复用基础 CSS。

## 4.64.0 本轮完成

- 新增低成本只读 `JquanUI.getMetrics()` 快照，统一暴露解析总数、规则计数、队列状态、缓存水合命中率、扫描/队列耗时、预算告警和最慢解析项。
- `debug()` / `diagnose()` 复用同一套性能快照字段；指标读取不触发额外 DOM 扫描，也不默认启用冲突追踪。
- 补齐 Core、压缩产物、公共类型、README、AI Skill 和回归验证，保持运行时与构建时字段文档一致。

## 4.63.1 本轮完成

- 修复物理方向 shorthand 与 side longhand 的规范排序：`px/pl`、`py/pt`、`mx/ml`、`inset-x/left`、`border-x/border-l` 等组合现在不依赖 class 扫描顺序。
- 补充 runtime CSSOM 与 build-time extraction 的拓扑一致性回归，覆盖响应式、暗色、容器和 `!important` 组合。

## 未来规划筛选（2026-08）

本节吸收外部诊断建议，但只保留能直接提升底层原子引擎“方便、快捷、极速、好用”的能力。规划遵循 Core 轻量、构建时优先、公开 API 可验证、生态能力解耦的原则。

### 组件优先与文档组件化重构（新增主线）

JquanUI 的后续开发先完善已有组件和高频生态能力，再扩展低频 Core 特性。`template`、`iframeBridge`、`favicon`、Data、UI Preset 等组件既是产品能力，也是文档站和回归测试的真实使用样板。

#### 1. 组件能力优先

- 新需求先检查现有组件是否可以直接调用；能力不足时优先迭代原组件并保持旧 API 兼容。
- 模板、父子页通信、Favicon、Data 和基础 UI 组件作为第一批重点，先补齐真实开发中高频的生命周期、错误处理、销毁、组合调用和浏览器边界。
- 组件新增或扩展必须同步类型、开发者文档、AI Skill、组件清单、聚合包和回归测试。
- Core 只提供原子排版和通用运行时能力；组件不得把业务状态或 CRM/CMS 逻辑反向塞入 Core。

#### 2. 文档站组件化

- 将 `components.html`、CSS 文档和 UI 展示页逐步改造成真实的组件组合：公共页头、导航、搜索、分类、代码展示、状态提示、示例容器和版本信息优先复用已有组件。
- 公共文档结构使用 Template 的 include/layout/slot 机制维护，避免十几个页面复制相同导航、页头和页脚；修改一份公共模板即可同步所有页面。
- 文档示例优先使用 JquanUI 原子类和现有组件，尽量不新增页面专用 CSS；确需自定义样式时必须说明无法由现有原子能力表达的原因。
- 文档中的示例代码必须可运行，组件 API、参数、返回值、依赖和限制必须与当前源码及类型声明一致。
- 文档页面的静态构建、模板依赖、组件安装顺序、移动端布局和浏览器交互纳入回归检查，文档站本身不只是展示页面。

#### 3. 实施阶段

- 阶段 A：盘点现有文档重复结构和手写 CSS，建立公共 layout、header、sidebar、footer、code-example 和 API 状态片段。
- 阶段 B：优先迁移 `components.html`，用 Template 组织组件导航和示例区域，并接入 `templateApi`、`codeBlock`、`tabs`、`toast` 等已有能力。
- 阶段 C：迁移 CSS 文档和 UI 展示页，统一导航、版本显示、搜索、代码复制、响应式和主题体验。
- 阶段 D：补充英文文档和 AI Skill 索引，确保开发者文档与 AI 文档都引用同一组可执行示例。

#### 4. 验收标准

- 公共导航、页头和页脚只维护一份模板源，静态构建后每个页面均能正确展开。
- 文档页面不重复加载 Core、Components 或同一单组件；组件安装顺序和依赖关系可验证。
- 示例类名通过当前 Core 解析，组件示例通过当前组件 API 执行，错误示例明确展示失败原因。
- `npm run check:docs`、模板检查、组件检查和视觉结构检查全部通过；文档重构不能降低 Core、Data 或组件的性能预算。

#### 阶段 A 已完成的首个交付点（2026-08-30）

- 新增 `js/docs-shell.js`，三份文档入口共用同一套顶部导航和版本标签，页面源不再复制导航结构。
- 文档壳优先调用已有 `templateApi.render()`，并保留无 Template 环境下的静态回退；没有新增 Core 或业务组件。
- `index.html`、`components.html`、`admin-blocks.html` 已统一引用 `4.63.1` Core，并纳入文档结构与 Template smoke 检查。

#### 阶段 B 已完成的首个交付点（2026-08-30）

- 新增 `docs/templates/docs-nav.html` 与 `docs/templates/docs-footer.html`，公共导航和页脚不再以内联模板字符串维护。
- `docs-shell.js` 通过已有 `templateApi.render()` 的 `include` 机制展开公共片段，并在模板读取失败、`file://` 或 Template 未加载时保留静态回退。
- 三份文档入口统一使用页脚挂载点，版本标签只由共享页脚维护；文档检查覆盖模板文件、include 路径、挂载点、异步读取和回退输出。

#### 阶段 C 已完成的首个交付点（2026-08-30）

- 将原先集中在 `js/components-docs.js` 的 76 份组件目录拆分为 `content/components/*.js`，通过 `content/components/index.js` 聚合加载，控制器不再保存重复目录源。
- 统一 UI 组件与功能组件的分类拓扑，增加 `kind: 'ui' | 'service'` 元数据，详情页明确显示组件类型。
- 标准化每份文档的 `examples` 契约，详情页按独立模块数据展示声明式和命令式示例；新增组件文档覆盖检查，校验模块、manifest、源码、API 和示例源一致。
- 将 `components.html` 的侧栏品牌/搜索区和页面头部接入 Template 公共片段，继续保留无模板环境的静态回退。

#### 阶段 C 第二轮交付点（2026-08-30）

- 为 76 个文档模块建立“预览标记 -> demo markup -> initializer”检查契约；Data 和 iframeBridge 补齐真实可操作预览，Select/TagInput 的扩展说明恢复显示。
- iframeBridge 预览覆盖握手、`send()`、`request()`、`state()` 和 `destroy()`；Data 预览覆盖 `insert()`、`update()`、查询过滤、快照和 `liveQuery()`。
- 修复经典脚本动态加载组件目录时的 URL 基准错误，组件目录现在始终以 `components-docs.js` 的脚本路径解析。
- 新增 `npm run check:component-docs:browser`，使用独立 Edge 会话验证 76 个导航项、关键预览交互、控制台错误和 390px 移动端无横向溢出。
- 数据展示组预览补齐 Pagination 翻页、Table 筛选、FilterBuilder 规则追加和 Crud 初始化回归；异步句柄在切换文档页时会销毁，迟到的 mount 结果不会重新绑定旧页面。

#### 阶段 D 首轮交付点（2026-08-30）

- 对 DOM、Msg、Permission、Router、Store、Toast 六个高频服务/反馈组件进行源码对账，示例、公开方法、返回句柄、生命周期、持久化和权限边界均已按当前实现更新。
- 命令式服务组件不再使用伪声明式 HTML 占位示例；Permission 保留真实声明式属性示例，其他纯 API 模块使用可复制 JavaScript。
- AI Skill 新增基础服务组件调用规范，明确组件加载顺序、复用边界、销毁要求和 Core 原子类优先原则。
- 组件文档检查新增占位注释回归规则；静态文档、76 模块浏览器检查、390px 移动端检查和全量 package check 全部通过。

建议将本主线排在新的 Core 大规模映射之前：

`组件盘点与补强` → `Template 文档布局` → `components.html 重构` → `其他文档页迁移` → `示例与 AI Skill 对账` → `性能基础能力`。

### 第一组：性能基础与构建交付（最高优先级）

#### 1. 性能指标 API

- 在现有 `debug()` / `diagnose()` 的扫描、解析、缓存和失败统计之上，增加只读的 `getMetrics()` 快照入口。
- 提供 `totalResolves`、缓存命中率、扫描耗时、最慢解析项、规则数和预算告警；默认只做低成本计数，高成本明细必须显式开启。
- Core、CLI、Vite 和 PostCSS 使用同一份字段定义，避免运行时和构建时出现两套指标。

#### 2. Baseline CSS 独立输出

- CLI 增加可选的基础 CSS 输出，将 preflight、变量初始化和关键帧与动态 utility CSS 分离。
- 保留当前单文件输出作为默认兼容路径；拆分只在构建阶段启用，不增加运行时请求。
- Vite/PostCSS 可复用该输出并利用浏览器/CDN 缓存，配套检查 CSS 内容哈希、层顺序和重复注入。

#### 3. 精确预取与规则预算

- 已在 `4.66.0` 提供 `JquanUI.prefetch(classes, options)`，只预解析调用方明确列出的类名。
- 不支持 `hover:*` 这类无界通配预取；数量、UTF-8 CSS 字节和同步耗时预算均可配置并返回截断原因。
- 预取结果复用现有解析缓存和排序器，没有新增第二套 CSS 生成逻辑。

#### 4. 性能基准和冷启动预算

- 已在 `4.67.0` 建立小页面、大 DOM、频繁变更、缓存暖启动、ShadowRoot 和构建提取基准。
- 以真实浏览器 median、包体字节和机器环境作为优化依据，不把“Lighthouse 100”或固定 3–5 倍加速作为未经验证的承诺。
- WASM 仅保留为可选实验：先比较解析、初始化、下载和内存总成本；只有在真实基准持续获益时才进入独立实验包，不进入默认 Core。

### 第二组：开发体验与采用成本

#### 1. VS Code 扩展 Beta

- 类名补全读取项目配置、语义色、断点、动画、shortcuts 和插件映射。
- Hover 显示生成 CSS，诊断未命中类、无效任意值和真实冲突。
- 提供安全的语义替换建议，例如把稳定的 `text-[#...]` 替换为已存在的主题色；不自动改变用户无法确认的视觉结果。

#### 2. 迁移工具持续增强

- 在现有 `jquan-migrate` 基础上增加 Tailwind 配置、常见 CSS 声明和类名排序审计。
- 输出可解释的兼容性报告、无法自动迁移的人工清单和迁移前后 CSS 对照。
- 不复制 Core 的解析器；迁移工具只调用统一的映射、诊断和提取能力。

#### 3. 文档与国际化 DX

- 完成中文/英文核心 API、原子类、组件和 AI Skill 的同步版本。
- 增加“语义类优先、任意值例外、原子类排序、变体组合、组件复用”的可检索示例。
- 维持 `components.html` 面向开发者、`skills/jquanui` 面向 AI 的双文档体系。

### 第三组：现代 CSS 平台能力

#### 1. 容器查询 2.0

- 完善 `@container`、命名容器和嵌套容器变体，统一 `@sm/sidebar:`、`@md/sidebar:` 等语法的解析、排序和静态提取。
- 增加容器尺寸变量的安全路由与浏览器回退说明，不把容器断点与 viewport 断点混用。

#### 2. Shadow DOM 与 Web Components 深化

- 已在 `4.70.0` 完成 `adopt()` / `detach()` 生命周期、重复挂载、样式隔离、动态类扫描、插件 teardown 和主题变量继承测试。
- 轻量适配保持在 `adopt(root, { scan, observe })` 与 `getAdoptionStatus(root)`，没有把 Core 扩展成组件状态框架。

#### 3. SSR 与框架适配层

- 继续完善现有 SSR Critical CSS、Vite、PostCSS 和静态提取能力，优先提供 React/Vue/Svelte/Next/Nuxt 的薄适配层。
- 适配层只负责收集类名、注入关键 CSS 和复用构建产物，不在 Core 内引入框架运行时。
- Server Components、Deno、Bun 和 Cloudflare Workers 作为独立兼容性验证，不承诺零配置统一运行时。

### 第四组：可选研究，不阻塞主线

- Lightning CSS：作为构建阶段的可选压缩、前缀和兼容性后处理器，不替换浏览器端 CSSOM 注入。
- CSS Houdini：仅在独立实验插件中验证 `paint()` 注册、CSP、浏览器兼容和性能，不进入默认 Core。
- View Transitions、CSS Anchor Positioning：当前已有相关映射，后续补充组合预设和 SSR/SPA 使用文档即可，不重复造组件。

### 暂不纳入底层引擎主线

- Figma 插件、主题市场、AI 自动生成组件、完整 40+ 官方 UI 组件库和 Zod 专用插件：这些属于生态产品或业务适配，不应增加 Core 复杂度。
- 动画预设库可以作为独立 preset 包探索，但必须复用现有动画映射和插件系统。
- “官方组件库”如果未来启动，应以独立包形式建设，并继续遵守当前组件 manifest、类型、文档和回归流程。

### 建议开发顺序

`getMetrics()` → Baseline CSS 输出 → 精确预取 → 性能基准 → VS Code Beta → 迁移工具增强 → 容器查询 2.0 → Shadow DOM 深化 → SSR 框架适配 → WASM/Lightning CSS/Houdini 研究。

## 4.63.0 本轮完成

- 修复运行时与构建时的级联拓扑：shorthand/longhand 工具类采用固定属性排序，结果不再依赖 HTML、DOM 或异步扫描顺序。
- `cascadeLayers` 保持跨层隔离，同时新增同层工具规则的 canonical ordering；`p-4` 与 `pt-2` 等冲突组合在不同 class 顺序下保持一致。
- 任意值安全扫描增加 CSS escape 归一化、括号/方括号平衡和遗留 `expression`、binding、behavior、JavaScript URL 拦截，并保留合法 data URL、`calc()`、`env()`、`image-set()`。
- 现代颜色增加 8 位 HEX RGB 通道解析，并按颜色空间生成 alpha 混合；保留现有 RGB 通道与完整 CSS 颜色双轨兼容。
- 支持 Constructable Stylesheet；现代浏览器自动使用共享样式表，旧环境回退到 `<style>`，并通过 `JquanUI.adopt(root)` / `detach(root)` 挂载 ShadowRoot。
- 新增控制台欢迎信息和官网地址；补齐 Core、CLI、压缩产物、Full、类型/文档与回归验证。

## 4.59.0 本轮完成

- Data 升级到 `0.2.0`，待同步 Outbox 与受限历史窗口解耦，超长离线期间不因历史裁剪丢失待发送事件。
- 持久化句柄保持函数调用兼容，并新增 `flush()`、`close()`、`status()`。
- Memory、Storage、IndexedDB 增加主/备份槽，损坏主状态自动恢复最近有效备份并通过 `onCorrupt` 报告。
- 持久化格式继续使用兼容的 version 1，补齐类型、文档、Node、Edge、基准和安装包回归。

## 4.58.2 本轮完成

- 自动持久化与 IndexedDB 写入串行化，保证异步并发时最后一次状态生效。
- `persist()` 增加 `onError` 后台保存错误回调，并补齐类型、文档和时序回归。

## 4.58.1 本轮完成

- Data 持久化升级为版本化状态包，恢复记录、revision、变更历史、待同步与已确认事件、去重集合和自动 ID 序列；兼容旧数组格式且静默恢复。
- 顶层 `liveQuery()` 与集合方法共用 `LiveQueryOptions<T>`，补齐 `debounce`、`cache` 类型声明和表面回归闸门。
- 安装包冒烟检查覆盖 Data 的 CJS/ESM 入口、持久化状态包和顶层 `liveQuery()` 类型，避免源码正确但发布包缺失。

## 全生态架构规范

JquanUI 遵循“复用优先、原组件演进、独立能力解耦”：新组件先调用现有公开 API；现有能力不足时先扩展原组件并保持兼容；只有职责边界或运行环境不同才新增独立组件。组件间通过公开 API、适配器和事件协议协作，不读取私有状态或依赖未文档化 DOM。每次扩展必须同步类型、文档、聚合包、回归测试和版本记录。

Data 的 HTTP 同步复用 `JquanUIComponents.httpApi`，页面结果复用 `paginationApi.updatePage()`，持久化优先复用 `storageApi`。

## 下一阶段组件候选

Data 4.59.0 本轮完成后，进入新的独立组件开发阶段。以下两个方向已完成初步去重检查，暂不进入 Core，也不并入 Data。

### 第一优先级：Iframe 父子页面通信组件

建议组件名：`iframeBridge.js`，公开 API 以 `JquanUIComponents.iframeBridgeApi` 暴露。

目标是为原生 HTML、多页面演示站、后台嵌入页和微前端场景提供稳定的父子窗口通信协议。实现时优先使用 `postMessage`，在可用时升级到 `MessageChannel`，内置 handshake、request/response、事件订阅、超时、销毁和来源校验；必须支持父页面和子页面两种角色、同源和跨源配置、`targetOrigin` 白名单、消息命名空间、请求 ID、错误响应和重复连接清理。不得默认使用 `'*'` 作为发送目标，不得把 `event.data` 直接当作可信 HTML 或脚本执行。

首版拟提供：`createParent()`、`createChild()`、`send()`、`request()`、`on()`、`off()`、`ready()`、`destroy()`；同步补齐类型声明、组件文档、AI Skill、Node/浏览器回归和真实跨 iframe 测试。已有 `print.js` 内部创建的隐藏 iframe 只服务打印流程，不复用为通信 API，也不重复实现打印能力。

### 第二优先级：网页 Favicon 管理组件

建议组件名：`favicon.js`，公开 API 以 `JquanUIComponents.faviconApi` 暴露。

目标是统一管理网页标题栏图标、动态状态图标、未读数量徽标、加载/成功/错误状态和主题切换，不依赖外部 Favico 库。首版应支持 `href` 图标、SVG/Canvas 生成、数量徽标、颜色、动画帧、原始图标恢复、`prefers-color-scheme` 和实例销毁；更新时只维护现有 `link[rel="icon"]` 节点，避免重复插入和污染 Head。数量、文字和颜色必须经过边界处理，Canvas/SVG 输出不得引入未净化的用户内容。

首版拟提供：`set()`、`badge()`、`status()`、`clear()`、`restore()`、`watch()`、`destroy()`；同步补齐类型声明、组件文档、AI Skill、浏览器 favicon 像素/DOM 回归和多实例清理测试。

开发顺序固定为：`iframeBridge` -> `favicon`。两项都遵循“复用已有 API、独立职责、类型/文档/回归同步”的生态规范。

## 4.61.0 本轮完成

- 完成第二优先级 `favicon.js`：安全图标源、SVG/Canvas、徽标、状态图标、loading 帧、主题监听、原始图标恢复和实例销毁。
- 补齐 Components/Full 聚合包、类型声明、`components.html`、AI Skill、README、浏览器行为回归和安装包检查。
- `iframeBridge` 与 `favicon` 均遵循独立职责、来源/输入校验、复用已有能力和文档测试同步规范。

## 4.60.0 本轮完成

- 完成第一优先级 `iframeBridge.js`：父子页面握手、MessageChannel 优先、postMessage 降级、来源校验、命名空间、事件、请求响应、超时和销毁。
- 完成组件清单、全部/Full bundle、`components.html` 开发者文档、AI Skill、README 和通信协议回归。
- 补齐 `browser-globals.d.ts` 类型声明，并用真实 Edge 同源子页面验证 MessageChannel 握手与 request/response。
- 安装包冒烟检查确认 `iframeBridge.js` 随 tarball 发布内容存在。
- 第二优先级 `favicon.js` 保留为下一组件。

Data 的 API 使用规范集中维护在 `skills/jquanui/DATA.md`；新增 Data 能力必须同步类型、回归、README、CHANGELOG 与该指南。

## 4.57.0 本轮完成

- Data 生产化加固：IndexedDB 自动适配已有高版本数据库并按需升级缺失 Store；事务回滚同步恢复 revision、变更历史和事件去重状态。
- 完成第二组第一项：模板 bundle 报告现在记录每个模板的静态依赖、动态依赖和聚合计数，Vite 输出可直接消费该图谱。
- 完成第二组第二项：Safe Preset 增加可配置资源协议、Data Image 开关和净化后处理钩子，后处理不能绕过内置净化。
- 完成第二组第三项的结构化回归：QA 页面、响应式 viewport、当前 Core 引用和代表性原子类均加入检查。
- npm 发布暂缓，不纳入本轮验收。

## 4.58.0 本轮完成

- 补齐复合排版映射：`font-[...]` 任意字体声明和 `text-shadow-*` 语义/任意值映射。
- 同步字体与阴影开发者文档、AI Skill、重复映射审计和 Core 回归闸门。

## 4.43.0 本轮完成

- 完成第一组收尾项中的性能诊断：`debug()` / `diagnose()` 现在提供扫描、队列、缓存水合、解析计数和预算告警。
- 增加独立模板性能检查，覆盖 1000 次字符串渲染，并验证 DOM Patch 仍为显式 opt-in、默认路径仍保留 `innerHTML`。
- Core 回归测试接入性能诊断断言。

## 4.42.0 本轮完成

- 补齐逻辑块向边框：`border-bs-*`、`border-be-*`，覆盖颜色、宽度和样式。
- 补齐图像分辨率：`image-resolution-from-image`、`image-resolution-snap`。
- 新增对应回归测试并通过重复映射审计。

## 4.41.0 本轮完成

- 补齐逻辑滚动偏移：`scroll-mi`、`scroll-mbs`、`scroll-mbe`、`scroll-pi`、`scroll-pbs`、`scroll-pbe`。
- 补齐东亚文字强调：`emphasis-*` 点、圆、芝麻、三角、颜色和位置映射。
- 新增对应回归测试并通过重复映射审计。

## 4.40.0 本轮完成

- 补齐字体回退比例控制：`font-size-adjust-none`、`font-size-adjust-from-font`。
- 补齐裁剪溢出边界：`overflow-clip-margin`、`overflow-clip-margin-content`、`overflow-clip-margin-border` 及任意值。
- 新增对应回归测试并通过重复映射审计。

## 4.39.0 本轮完成

- 补齐 SVG 高级表现属性：`shape-rendering-*`、`color-rendering-*`、`color-interpolation-*`、`text-anchor-*`、`dominant-baseline-*`、`baseline-shift-*`、`marker-*`。
- 新增 SVG 映射回归测试并通过重复审计。

## 4.38.0 本轮完成

- 补齐逻辑尺寸：`is-*`、`bs-*`、`min-is-*`、`max-is-*`、`min-bs-*`、`max-bs-*`。
- 补齐现代换行：`break-anywhere`、`break-auto-phrase`、`line-break-*`。
- 补齐下划线位置和逻辑调整大小：`underline-position-*`、`resize-inline`、`resize-block`。

## 4.37.0 本轮完成

- 补齐打印分页兼容映射：`page-break-before-*`、`page-break-after-*`、`page-break-inside-*`。
- 补齐 `orphans-*` 与 `widows-*` 分页行数控制，并加入回归测试。

## 4.36.0 本轮完成

- 补齐高级国际化排版：连字、东亚字体变体、文字方向、竖排、空白折叠和文本渲染。
- 补齐滚动条颜色、图像方向、边框图像、空单元格和制表位宽度映射。
- 新增对应 Core 回归覆盖，并通过重复映射检查。

## 4.35.0 本轮完成

- 补齐国际化排版：`text-autospace-*`、`text-spacing-trim-*`、`hyphenate-character-*`、`ruby-position-*`、`ruby-align-*`。
- 补齐字体渲染控制：`font-kerning-*`、`font-optical-sizing-*`、`font-palette-*`、`font-synthesis-*`。
- 补齐 Mask 与 SVG 基础能力：`mask-mode-*`、`mask-type-*`、`mask-composite-*`、`mask-origin-*`、`paint-order-*`、`fill-rule-*`、`clip-rule-*`、`vector-effect-*`。

## 4.34.0 本轮完成

- 补齐滚动锚定、Scroll-driven Animations、View Timeline 和 `timeline-scope` 映射。
- 补齐 `shape-*`、`offset-*` 现代形状与路径动画映射。
- 补齐 `text-decoration-skip-ink-*` 排版可读性映射，并加入对应回归测试。

## 4.33.0 本轮完成

- 补齐高频现代平台映射：`scrollbar-gutter`、`content-visibility`、CSS containment、`contain-intrinsic-size`。
- 补齐现代渲染与前瞻能力：图像像素渲染、移动端文字缩放、Anchor Positioning、View Transitions、forced-colors 与打印色彩调整。
- 新映射已通过重复映射审计与 Core 回归测试，并保持 Core、Full、Components、压缩产物的同一版本。

## 当前已具备

- Core 运行时原子 CSS 引擎和压缩构建流程。
- 语义布局、排版、颜色、响应式、容器查询、语言、状态和现代 CSS 变体。
- 伪元素、关系选择器、Safe Area、Cascade Layers、现代颜色和流体令牌。
- 主题、shortcuts、插件、缓存水合、诊断和冲突追踪。
- CLI 静态提取、Vite、PostCSS、SSR Critical CSS、Design Tokens 和迁移审计。
- Full/Components 中的模板引擎：变量、条件、循环、过滤器、include、layout、slot、AST、依赖分析、异步渲染和基础净化。
- 组件 manifest 驱动的确定性聚合构建：Components 包含全部组件，Full 是明确的精选组件 profile。

## 优先规划：外部 HTML 模板加载

目标：让原生 HTML 多页面开发获得接近 PHP 模板的公共文件复用能力。

```text
templates/
  header.html
  footer.html
pages/
  index.html
  about.html
```

```html
{% include 'header.html' %}
<main>页面内容</main>
{% include 'footer.html' %}
```

### 第一阶段：文件加载器（4.20.0 已完成）

- 已新增 `templateApi.useLoader()` 和默认 `JQFileLoader`。
- 已支持 `fetch()` 加载 `.html`、`.htm` 和自定义加载函数。
- include 和 layout 已可引用外部文件名。
- 已保留 DOM `<template>`、`<script>` 和注册表模板的优先级兼容来源。
- 外部加载明确使用 `renderAsync()` / `mountAsync()`，同步渲染不会隐式请求网络。

建议参数命名：

```js
templateApi.useLoader({
  name: 'JQFileLoader',
  base: '/templates/',
  extensions: ['.html']
});
```

最终使用者仍然只写：

```html
{% include 'header.html' %}
```

### 第二阶段：缓存与预加载（4.22.0 已完成）

- 已提供 `templateApi.preload(names, options)` 预加载公共模板。
- 已提供 `templateApi.clearTemplateCache(name)` 精确清理文件缓存。
- 已提供 `templateApi.templateCacheSize()` 和 `inspectTemplate()` 查看缓存状态。
- 已将同一文件的并发请求合并为一个 Promise，避免重复网络请求。
- 已支持可配置的缓存上限、TTL、版本号、LRU 淘汰和失败请求回收。
- 已隔离 loader 生命周期，切换加载器后旧请求不会污染新缓存。
- 编译 AST 缓存已支持 `cacheLimit` 上限和 LRU 淘汰。

### 第三阶段：开发体验（4.24.0 已完成）

- Vite 开发模式已通过 WebSocket 自定义事件支持外部模板热更新。
- 已让外部模板错误显示文件名、include 链、行号、列号和上下文片段。
- include 循环已显示完整链路，例如 `header -> nav -> header`。
- 已提供 `templateApi.dependencyGraph(name)` 的递归文件依赖图，并分离动态依赖。
- 已提供 `templateApi.inspect(name)` 查看加载来源、缓存状态和最后更新时间。
- 已提供 `invalidate(name)` / `refresh(name)`，供其他开发服务器接入 watch、SSE 或 WebSocket。

### 第四阶段：构建与发布（4.32.0 已完成）

- CLI 与 Vite 已可把公共模板预打包为内存映射，运行时 include/layout 不再逐文件请求。
- CLI 已支持从 HTML 页面入口展开 include/layout，输出独立页面或保持目录结构的静态目录。
- Vite/PostCSS 工作流已可选地把模板 bundle 文件纳入构建输出；Vite 同时接入 watch 图。
- SSR 和静态构建复用同一套模板语法与依赖解析。
- 外部模板加载器和构建时展开器已复用同一解析器和错误格式，避免开发与生产表现分叉。
- 模板 bundle 已提供可选依赖报告，CLI、Vite、PostCSS 输出结构保持一致。

## 模板引擎后续增强

- 已将模板引擎回归测试从文档演示中独立出来；`npm run check:template-runtime` 覆盖语法、缓存、异步、循环、安全和 DOM 挂载，且已接入总检查。
- 已提供明确的 `safe` 配置预设：安全表达式、HTML 净化、资源协议校验和过滤器白名单。
- 已对大模板提供可选的 DOM patch 策略，但默认仍保持简单快速的 `innerHTML` 渲染。
- 已增加 SSR/Node 端 `renderToString()` / `renderToStringAsync()` 纯字符串渲染 API，浏览器端 mount 作为独立层。

## Core 后续方向

- 继续补齐高频 CSS 映射，但每次新增前先执行顶层重复映射检查。
- 4.31.0 已补齐原生表单尺寸、控件色彩方案和 caret 颜色映射。
- 4.32.0 已补齐现代文本盒模型、尺寸插值和分段装饰映射。
- 维持扫描过滤、规则 Set 去重、缓存裁剪和冷启动性能预算。
- 将常见诊断接入统一 `debug()` / `diagnose()` 报告，不在生产默认开启高成本追踪。
- 保持 Core、Full、Components、CLI、类型声明和压缩产物的单一版本来源。

## 聚合包治理（4.21.0 已完成）

- `dist/components/components.manifest.json` 是组件集合与顺序的唯一清单。
- `JquanUI@components.js` 由全部独立组件文件确定性生成。
- `JquanUI@full.js` 由当前 Core 与 manifest 中的精选 Full profile 生成。
- 构建检查会拒绝遗漏文件、重复文件、重复插件名和任何聚合包漂移。
- Full 定位为开箱即用的精选包；需要其他组件时使用 Components 聚合包或单组件入口。

## JQ / Jquan 命名约定

可以在新增的底层能力中使用 `JQ` 或 `Jquan`，用于明确作者和归属，但必须克制、统一、可解释。

推荐：

- `JQFileLoader`：外部模板文件加载器名称。
- `JQTemplateCache`：模板缓存内部模块或诊断标识。
- `jquan:template:*`：模板生命周期事件。
- `data-jq-template-*`：模板声明式属性。
- `--jquan-*`：Core CSS 自定义属性。
- `jquanui-*`：DOM id、组件标识和发布产物。

避免：

- 为普通局部变量、每一个函数或每一个映射都加 `JQ` 前缀。
- 同一能力同时使用 `JQTemplate`、`JquanTemplate`、`jq-template` 三套公开名称。
- 用个人名字替代能力语义，造成用户无法猜测 API 用途。
- 新增与已有 `JquanUIComponents`、`templateApi`、`JquanUI` API 重复的入口。

命名优先级：现有公开 API 兼容性 > 能力语义清晰 > JQ/Jquan 归属标识。

## 不纳入范围

- CRM、CMS、客户项目的业务字段和页面模板。
- 在 Core 中加入完整组件状态机或业务数据请求层。
- 为了零 CSS 而把复杂品牌视觉强行拆成难维护的任意类。
- 把模板引擎扩展成替代 React/Vue 的完整响应式框架。
