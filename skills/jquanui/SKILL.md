---
name: jquanui
description: 使用 JquanUI 构建、重构或审查 HTML、JavaScript、组件和前端界面。Use when an AI needs to create layouts, style semantic HTML, migrate CSS or inline styles to atomic classes, use JquanUI runtime/build-time extraction, configure themes, responsive/container/state variants, pseudo-elements, shortcuts, plugins, or JquanUI components. Enforce semantic atomic classes first and avoid custom CSS and arbitrary bracket values unless they are materially necessary.
---

# JquanUI AI 开发规范

Data layer reference: before using `jquanui/data`, read [DATA.md](./DATA.md). It defines the independent Data API, persistence, Schema migration, synchronization recovery, relations, and ecosystem reuse rules.

发布包检查使用 `package.json.files` 与统一排除规则；仓库规划文档 `ROADMAP.md` 只在仓库保留，不随 npm 包分发；`DESKTOP` 同步副本、旧 demo、发布摘要、未被 exports 引用的 `dist/cli/README.md` 重复开发文档、旧 4.5 压缩副本和开发期 manifest 不进入 npm 包，但开发目录仍保留可恢复副本。根 README 保留随包可用的 CLI/Vite/PostCSS/SSR 文档。不要通过提高预算阈值掩盖包体变化；先运行 `npm pack --dry-run --json` 找出未引用的发布文件，再同步 `check:size`、manifest 和 packlist。Full 的 Core/组件统一由锁定 Terser 生成紧凑格式（compress:false、mangle:false，保留许可证注释），源码继续保留注释；用 build:bundles/check:bundles 生成/对账，不能直接手改生成包。公开的 core-archive-v4.5 导出继续保留，不按文件名判断未引用。

## 核心目标

使用语义化 HTML 和 JquanUI 原子类完成界面。默认只引入 Core，不创建页面级 CSS 文件，不写 `style=""`。

```html
<script>
  window.JQUAN_CONFIG = {
    theme: { extend: { colors: { primary: '#6366f1' } } }
  };
</script>
<script src="./js/JquanUI@core.min.js"></script>
```

配置必须位于 Core 之前。npm 项目可使用 `import 'jquanui/core'`。

引入时先确认部署布局：完整仓库可用上面的 `./js/JquanUI@core.min.js`；只复制 dist 时用 `./dist/core/JquanUI@Core.js`，保留 `dist/core`、`dist/components` 和 dist 目录名。js 压缩入口不在 dist/npm 包内。npm 浏览器构建器处理 Core，不会复制按需加载的组件：将所需组件及依赖从 `node_modules/jquanui/dist/components/` 复制到公共资源目录，显式配置 `componentLoader.baseURL`。Core 打包/改名、dist 改名或目录扁平化也需显式配置。静态 import 先于模块主体执行；前置 HTML 配置或使用以下顺序：

```js
window.JQUAN_CONFIG = { componentLoader: { baseURL: '/assets/jquan-components/' } };
await import('jquanui/core');
const dom = await window.JquanUI.import('dom');
```

页面通过 HTTP(S) 访问，只加载一个 Core。Node/SSR 的 core/full/组件子路径是无操作入口，不创建浏览器全局；提取用 `jquanui` / `jquanui/extract`。版本比较读取 `JquanUI.engineVersion`（纯 semver，与 debug/metrics/ready.version 一致），展示标签用 `versionLabel`；旧 `version` 继续包含描述后缀以兼容既有项目。字段无参数、无组件依赖、读取无需销毁。不要把公开 `core-archive-v4.5` 当作当前 Core，也不要删除其导出。入口回归为 `npm run check:core-distribution`。

同步副本先核对引用、差异和 SHA256 再可恢复归档；2026-11-08 的 21 份副本已进入仓库 `archives/sync-copies-2026-11-08.zip`，清单见 `docs/archives/2026-11-08-sync-copies.md`。云提供程序不可用的 CHANGELOG 同步占位条目仍原位保留，不计为已归档。历史诊断文本不作为运行入口；DESKTOP 的 npm 排除规则保留。

## 强制优先级

按以下顺序解决样式需求，只有上一层不足时才进入下一层：

1. 使用正确的语义 HTML 元素和原生属性。
2. 使用现有语义原子类。
3. 使用响应式、状态、关系、属性或伪元素变体。
4. 使用最接近的设计令牌，不追求无视觉价值的像素级一致。
5. 仅对不可替代的值使用 `[...]` 任意值。
6. 对重复组合使用 `shortcuts`，对项目级令牌使用主题配置。
7. 对可复用新能力使用 `customUtilities` 或插件。
8. 只有原子系统确实无法表达时才创建 CSS。

不得因为“不记得类名”直接写 CSS。先查本 Skill、项目文档或用 `JquanUI.resolve()` 验证候选类。

## 语义近似规则

视觉差异不可感知时，使用最近的语义令牌：

- `font-size: 15px` -> `text-md`，不要写 `fs-[15px]`。
- `font-size: 16px` -> `text-md` 或 `text-base`。
- `margin: 15px` -> `m-4`（16px）。
- `gap: 7px` -> `gap-2`（8px）。
- `border-radius: 7px` -> `rounded-lg`（8px）。
- `width: 398px` 若不是固定规格 -> 使用响应式宽度、`max-w-*` 或布局约束。

可接受的近似范围：字号 1px、间距 2px、圆角 2px。品牌色、对齐基线、固定画布、协议尺寸和计算布局不得擅自近似，应配置主题令牌或使用任意值。

优先使用：

```text
text-xs 12px | text-sm 14px | text-md/text-base 16px | text-lg 18px
text-xl 20px | text-2xl 24px | text-3xl 30px | text-4xl 36px
p-1 4px | p-2 8px | p-3 12px | p-4 16px | p-6 24px | p-8 32px
gap-1 4px | gap-2 8px | gap-3 12px | gap-4 16px | gap-6 24px
```

## 任意值使用条件

仅在以下情况使用 `[...]`：

- `calc()`、`clamp()`、`minmax()`、复杂网格轨道。
- 设计稿中的固定设备/画布尺寸。
- CSS 变量、data URL、渐变、遮罩或裁剪路径。
- 项目未提供语义令牌且该值不能合理近似。
- 原生属性任意写法，例如 `[content:attr(data-label)]`。

任意值中的空格使用 `_`：

```html
<div class="grid grid-cols-[minmax(12rem,_18rem)_1fr]"></div>
<div class="w-[calc(100%-2rem)]"></div>
```

同一任意值出现两次以上时，升级为主题令牌、shortcut 或自定义工具，不要复制散落的魔法值。

## 能力地图

优先组合以下能力，不要重新实现：

- 布局：`block`、`flex`、`grid`、`container`、columns、float、position、inset、z-index。
- 尺寸与间距：width/height/min/max/size、margin、padding、gap、space、divide。
- 排版：font family/weight/style/size、line-height、tracking、word spacing、list、clamp、writing mode。
- 复合排版：`text-shadow-none` / `text-shadow-sm` / `text-shadow-md` / `text-shadow-lg`；复杂文字阴影使用 `text-shadow-[...]`，复合字体声明使用 `font-[...]`。
- 视觉：主题色与透明度、border、radius、outline、shadow、ring、gradient、background、mask、blend。
- 现代色彩：主题支持 `oklch()`、Display P3、`light-dark()`、`color-mix()` 及 `/透明度`；品牌色仍必须进入主题配置，不在 HTML 重复长颜色函数。
- 流体令牌：重复的响应式间距和字号配置到 `theme.extend.fluid`，使用 `py-fluid-section`、`max-w-fluid-frame`、`text-fluid-display`，不在模板散落 `clamp(...)`。
- 变换：translate、scale、rotate 2D/3D、skew、origin，自动合成 transform。
- 效果：opacity、filter、backdrop-filter、transition、animation。
- 现代滚动与性能：`scrollbar-gutter-*`、`overflow-anchor-*`、`content-visibility-*`、`contain-*`、`contain-intrinsic-size-*`。
- 滚动驱动动画：`animation-timeline-*`、`animation-range-*`、`scroll-timeline-*`、`view-timeline-*`、`timeline-scope-*`。
- 现代图形与排版：`image-rendering-*`、`text-size-adjust-*`、`shape-*`、`offset-*`、`decoration-skip-ink-*`。
- Anchor Positioning / View Transitions：`anchor-name-*`、`anchor-scope-*`、`position-anchor-*`、`position-area-*`、`position-try-*`、`position-try-order-*`、`position-visibility-*`、`view-transition-name-*`、`view-transition-class-*`、`view-transition-group-nearest`、`view-transition-group-*`、`view-transition-types-*`。优先使用语义值，确有项目自定义锚点或区域时再使用任意值。
- 国际化排版：`text-autospace-*`、`text-spacing-trim-*`、`hyphenate-character-*`、`ruby-position-*`、`ruby-align-*`。
- 字体渲染：`font-kerning-*`、`font-optical-sizing-*`、`font-palette-*`、`font-synthesis-*`。
- SVG 与遮罩：`mask-mode-*`、`mask-type-*`、`mask-composite-*`、`mask-origin-*`、`paint-order-*`、`fill-rule-*`、`clip-rule-*`、`vector-effect-*`。
- 高级国际化排版：`font-variant-ligatures-*`、`font-variant-east-asian-*`、`text-rendering-*`、`text-orientation-*`、`white-space-collapse-*`。
- 表格与图像：`scrollbar-color-*`、`image-orientation-*`、`border-image-*`、`empty-cells-*`、`tab-size-*`。
- 打印分页：`break-*`、`page-break-*`、`orphans-*`、`widows-*`。新项目优先使用 `break-*`，仅需兼容旧打印引擎时使用 `page-break-*`。
- 逻辑布局与国际化换行：`is-*`、`bs-*`、`min-is-*`、`max-is-*`、`break-anywhere`、`break-auto-phrase`、`line-break-*`、`underline-position-*`、`resize-inline`、`resize-block`。
- SVG 高级表现：`shape-rendering-*`、`color-rendering-*`、`color-interpolation-*`、`text-anchor-*`、`dominant-baseline-*`、`baseline-shift-*`、`marker-*`。
- 字体回退与裁剪：`font-size-adjust-*`、`overflow-clip-margin-*`。仅在需要控制替代字体视觉比例或裁剪装饰溢出时使用。
- 逻辑滚动与东亚排版：`scroll-mi`、`scroll-mbs`、`scroll-pi`、`scroll-pbe`、`emphasis-*`。
- 逻辑边框与媒体：`border-bs-*`、`border-be-*`、`image-resolution-*`。
- 性能诊断：开发阶段使用低成本只读快照 `JquanUI.getMetrics()` 查看解析总数、规则数、队列状态、缓存命中率、最慢解析项、扫描/队列耗时和预算告警；需要未解析类、失败规则、插件状态或冲突明细时再使用 `JquanUI.debug()` / `JquanUI.diagnose()`。`getMetrics()` 不触发额外扫描；生产环境不要开启冲突追踪。
- 精确预取：路由、弹窗、异步区块或组件即将显示前，可调用 `JquanUI.prefetch(classes, { maxClasses, maxBytes, timeoutMs })` 预热明确类名。只传完整类名，不传 `hover:*`、`bg-*` 等无界模式；该 API 不扫描 DOM，并复用 Core 的解析、排序和缓存管线。
- 层叠顺序：Core 与构建提取共享 canonical utility order，`p-4 pt-2` 与 `pt-2 p-4` 的结果一致；大型项目可再配置 `cascadeLayers: true` 固定 `reset -> theme -> components -> utilities` 外层顺序。
- Shadow DOM：支持环境默认使用 Constructable Stylesheet；调用 `JquanUI.adopt(shadowRoot)` 会同步编译已有类并监听后续 class、状态属性和子节点变化，销毁时必须调用 `JquanUI.detach(shadowRoot)` 清理 observer 与插件行为。静态提取已覆盖全部类时可用 `{ scan: false }`，不可变根可用 `{ observe: false }`；通过 `JquanUI.getAdoptionStatus(shadowRoot)` 检查挂载状态。`adopt()` / `detach()` 可重复调用且不会移除第三方 sheet。可用 `constructableStylesheets: false` 强制 document 的 `<style>` fallback，但此模式不能挂载 ShadowRoot；不要创建第二套原子规则。
- 任意值安全：保留合法的 `calc()`、`env()`、`image-set()` 和 data URL；不要使用 `expression()`、`-moz-binding`、`behavior`、`javascript:` URL，也不要用未闭合的括号或方括号。
- 现代颜色：主题可使用 `oklch()`、`oklab()`、`lab()`、`lch()`、Display P3 和 8 位 HEX；alpha 组合会尽量保留颜色空间。重复颜色优先进入主题令牌，不要在 HTML 散落长颜色函数。
- 模板安全：不可信模板使用 `safe: true`；必要时配置 `safeResourceProtocols`、`safeDataImages: false` 或 `safeSanitizer`。内置净化始终先执行，后处理钩子不能替代它。
- 布局环境：responsive breakpoints、`max-*` / `min-*` 范围、dark/light、print、motion、contrast、LTR/RTL。
- 文档与设备环境：`lang-*`、`not-lang-*`、`pointer-*`、`hover-none`、`hover-hover`、`forced-colors`、`transparency-reduce`。
- 原生交互状态：`open:*`、`details-open:*`、`popover-open:*`、`modal:*`、`inert:*`、`user-valid:*`、`user-invalid:*`、`starting:*`。
- 移动安全区：`p-safe`、`px-safe`、`pt-safe`、`pb-safe`、`inset-safe`、`bottom-safe`，并支持 `pb-safe-4` 形式的语义附加间距。
- 容器查询：`@sm:`、`@[min-width:400px]:`、`@sm/sidebar:`、兼容的 `@sidebar/lg:`、`container-name-*`；重复阈值配置到 `theme.extend.containers`。
- 关系选择器：`group-*`、`peer-*`、`has-*`、`group-has-*`、`peer-has-*`、`*:`、`**:`。
- 任意变体：`[.scrolled_&]:`、`[&>img]:`、`supports-[...]`、`media-[...]`、`[@supports(...)]:`、`[@media(...)]:`。
- 属性状态：`data-*`、`aria-*`、`group-data-*`、`peer-data-*`、`group-aria-*`、`peer-aria-*`。
- 伪元素：`before:`、`after:`、`placeholder:`、`selection:`、`marker:`、`file:`、`first-line:`、`first-letter:`、`backdrop:`。
- 滚动条：`scrollbar:`、`scrollbar-track:`、`scrollbar-thumb:`、`scrollbar-corner:`。
- 扩展：shortcuts、plugins、custom utilities、semantic themes、safelist、debug/diagnose。
- 项目动效：在 `theme.extend.keyframes` 定义关键帧，在 `theme.extend.animation` 注册 `animate-*`，不为关键帧单独创建 CSS。
- 生产工具：CLI 静态提取、Vite、PostCSS、SSR critical CSS、W3C Design Tokens。
- 性能基准：修改扫描器、解析器、规则排序、缓存、Observer、Constructable Stylesheet 或构建提取后运行 `npm run benchmark:core`；发布候选运行 `npm run check:core-performance`。报告覆盖小页面、2500 节点、暖缓存、160 项变更、100 个 ShadowRoot 和构建提取，并写入 `reports/core-performance.json`。
- 迁移审计：面对存量 CSS，先运行 `jquan-migrate` 区分语义类、任意值候选和人工项；报告仅用于迁移决策，不机械删除复杂 CSS。

## 变体组合

从环境到状态再到工具排列，保持可读：

```html
<button class="px-4 py-2 bg-primary text-white hover:bg-primary/90 focus-visible:ring-2 disabled:opacity-50 md:px-6">
  保存
</button>

<div data-state="open" class="hidden data-[state=open]:block"></div>
<i class="transition-transform group-data-[state=open]:rotate-180"></i>
```

项目断点、语言和复杂祖先状态仍应写在 class 中：

```html
<div class="max-md:px-4 lang-en:tracking-wide [.scrolled_&]:bg-black/90"></div>
<div class="pointer-fine:hover:scale-105 supports-[backdrop-filter:blur(1px)]:backdrop-blur-md"></div>
```

任意选择器中 `_` 表示空格，`&` 表示当前元素。优先使用语义变体；只有不存在等价语义时才使用任意选择器或任意 at-rule。

多语言排版使用 `lang-*` 做最小差异修正，例如 `text-xl lang-en:text-lg`。`lang-en:` 基于原生 `:lang(en)`，会继承 `<html lang="en">`，同时匹配 `en-US` / `en-GB` 和局部 `lang` 子树。不要为每种语言复制整套 class，也不要用 JavaScript 切换字号类。

Dialog、Popover 和表单优先使用原生状态，不用 JavaScript 切换视觉类：

```html
<dialog class="opacity-100 starting:opacity-0 modal:grid"></dialog>
<div popover class="opacity-0 popover-open:opacity-100"></div>
<input class="user-invalid:border-red-500 user-valid:border-green-500">
```

全屏移动界面必须考虑安全区。直接使用 `pt-safe` / `pb-safe`；需要保留设计间距时使用 `pt-safe-4` / `pb-safe-2`，它们会把设备 inset 与语义间距相加。

使用变体组减少重复：

```html
<button class="hover:(bg-primary text-white shadow-lg) focus-visible:(ring-2 ring-primary/30)"></button>
```

## 伪元素规则

`before:` 和 `after:` 会自动生成空 `content`，装饰层不需要 CSS 文件：

```html
<div class="relative before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-primary/10">
  内容
</div>

<span class="after:content-['NEW'] after:ml-2 after:text-primary">Inbox</span>
```

使用 `content-none` 禁用内容，使用 `content-[attr(data-label)]` 读取属性。父元素有定位需求时显式添加 `relative`；需要独立层叠上下文时添加 `isolate`。

## 主题与颜色

优先使用项目语义色：`primary`、`secondary`、`success`、`warning`、`danger` 或项目配置名。使用透明度后缀，例如 `bg-primary/10`、`border-primary/20`。

不得把品牌色重复写成 `bg-[#6366f1]`。应配置一次：

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        surface: '#ffffff'
      }
    }
  }
};
```

使用 `dark:` 处理深色模式。保持 class 优先、系统 media 兜底语义。

普通设计令牌配置在 Core 前；runtime、CLI/Vite/PostCSS/SSR 提取共用配置：

```js
window.JQUAN_CONFIG = {
  theme: { extend: {
    borderRadius: { DEFAULT: '6px', card: '18px' },
    boxShadow: { soft: '0 16px 40px rgba(86,103,214,0.12)' },
    fontSize: {
      headline: ['37px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: 650 }],
      caption: '13px'
    }
  } }
};
// rounded-card rounded-t-card rounded-ss-card shadow-soft text-headline
console.table(JquanUI.debug().configWarnings); // Core 已加载后调用
```

theme 与 theme.extend 的 borderRadius/boxShadow/fontSize/fontFamily/spacing/breakpoints/containers 合并默认值，extend 覆盖 theme 同名项；radius 是 borderRadius 兼容别名，同层 borderRadius 优先（tokens 工具原有 radius 输出可直接消费）。圆角/阴影 DEFAULT 对应 rounded/shadow；字号 DEFAULT 和 fluid-* 保留，覆盖 text-base 使用 base。字号支持字符串、[字号, 行高]、[字号, {lineHeight?,letterSpacing?,fontWeight?}]；fontWeight 可为字符串或有限数字，其余为非空 CSS 字符串。字符串只输出 font-size，覆盖 text-lg 等内置档位时不保留原行高。保留未配置的内置项，不替换整套默认主题。显式 customUtilities 优先于主题生成类，shortcuts/plugins 仍随后执行；主题初始化不修改传入配置，支持冻结对象。圆角方向名、shadow 的 color 和原型键不可作为令牌名，避免字号与颜色令牌重名。固定色阴影保持原值，不自动改写成 shadow-color 变量；继续与 ring 组合。

`debug()/diagnose().configWarnings` 返回独立的 `{path,code,message}[]`，code 为 unknown-key/invalid-type/invalid-value/invalid-name。覆盖 theme/extend 未知键、普通令牌类型/结构、字号选项、初始 semantic 与 customUtilities 对象类型；错误项跳过，有效项继续。颜色为字符串或一层色阶；null、非法 HEX、非字符串字体数组等不会中断初始化。根级组件/插件键透传，不宣称全生态 schema 校验；字符串只做结构检查，不等于完整 CSS 属性语义检查。提取 `result.report.configWarnings` 使用同一诊断，`report.warnings` 计入配置警告，doctor 输出路径且 ok=false；CLI --fail-on-warn 与 Vite/PostCSS failOnWarn 也计入配置警告，未开启时有效 CSS 正常输出；resolve 查询仍只读，不逐类 console.warn。初次配置/受支持的首次晚赋生效，后续深层改值不是热更新；无额外销毁或依赖。缓存格式更新，旧缓存失效重编译。完整文档 content/theme-darkmode.js；最小页面 examples/core-config-tokens.html；回归 `npm run check:core-config` 与 `npm run check:core-performance`。

复用提示：`先配置普通设计令牌再使用 rounded-card/shadow-soft/text-headline；检查 debug().configWarnings 的字段路径，同步 runtime/提取配置与文档/类型/skill，保留默认档位与 ring 组合，不重复堆叠任意值。`

重复出现的跨视口尺度应配置为流体令牌，而不是反复写任意值：

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      fluid: {
        spacing: {
          section: ['3rem', '6vw', '6rem'],
          frame: { min: '18rem', preferred: '80vw', max: '72rem' }
        },
        fontSize: {
          display: { min: '2.25rem', preferred: '6vw', max: '4.5rem', lineHeight: '1.05' }
        }
      }
    }
  }
};
```

使用 `py-fluid-section`、`max-w-fluid-frame`、`text-fluid-display`。流体间距可用于间距、尺寸、布局和 Safe Area 附加间距。只有确实需要在最小值与最大值之间连续变化、并且会复用的设计尺度才应成为流体令牌；普通固定间距继续使用 `p-4`、`gap-6` 等基础令牌。

## 响应式与容器优先

先让 DOM 结构自然流动，再添加断点。移动端从单列开始：

```html
<section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"></section>
```

组件内部优先使用容器查询，页面骨架使用 viewport 断点。不要用大量固定宽度修补响应式问题。

容器查询使用 `container-type-inline-size` 声明参照容器，组件后代使用 `@sm:`。命名容器推荐尺寸在前：`@sm/sidebar:grid-cols-2`；旧式 `@sidebar/sm:grid-cols-2` 同样兼容。`@[min-width:400px]:` 表示匿名任意条件，`@sidebar/[min-width:400px]:` 表示命名任意条件。多个 `@...:` 变体可以嵌套，保持书写顺序。重复的自定义阈值应配置为 `theme.extend.containers`，不要在多个模板复制任意值。

标准断点的上界使用 `max-{断点}:`，例如 `max-md:hidden`。项目可以在配置中增加自己的断点名，引擎会自动支持对应的正向与 `max-*` 变体；一次性精确边界可写 `max-[760px]:hidden`。不要把某个客户或页面的断点名称硬编码进通用组件，也不要为了单个最大宽度媒体查询新建 CSS 文件。

## 重复样式

重复的 5 个以上原子类组合应考虑 shortcut：

```js
window.JQUAN_CONFIG = {
  shortcuts: {
    'btn-primary': 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 focus-visible:ring-2'
  }
};
```

shortcut 表达视觉组合，语义和可访问属性仍写在 HTML 中。

## 存量 CSS 迁移

不要让 AI 一次性把整份 CSS 替换成中括号类。先运行：

```bash
npx jquan-migrate --input ./css --format markdown --output ./reports/jquan-migration.md --config ./jquan.config.cjs
```

按报告类别处理：

1. `semantic`：优先迁移，可接受 `15px -> text-md`、`15px -> p-4` 这类无感知近似。
2. `arbitrary`：先判断是否重复；重复两次以上应升级为主题令牌、流体令牌或 shortcut。
3. `manual`：保留并人工检查，尤其是复杂选择器、渐变、mask、shadow、transform 和 keyframes。

迁移后使用 `jquan-extract --doctor` 验证类名解析。只有完成视觉回归后才能删除对应 CSS；`jquan-migrate` 本身不会改写业务文件。

迁移工具的完整审计方式：

```bash
npx jquan-migrate --input ./css --source ./src --format markdown --output ./reports/jquan-migration.md --config ./tailwind.config.cjs
npx jquan-migrate --source ./src --max-order 0 --output ./reports/class-order.json
```

`--source` 会审计 HTML、JS/JSX/TS/TSX、Vue、Svelte、Astro、Markdown/MDX 中可静态发现的类字符串，给出 `original -> sorted`，只建议顺序，不直接改源码。顺序遵循布局 -> 定位 -> 尺寸 -> 间距 -> 排版 -> 颜色/边框 -> 效果 -> 状态/变体。`--min-semantic`、`--min-expressible`、`--max-manual`、`--max-order` 可作为 CI 阈值，失败统一返回状态码 `2`。

暗色迁移候选使用独立的只读审计：

```bash
npx jquan-migrate --source ./src --dark-audit --format markdown --output ./reports/dark-audit.md
npx jquan-migrate --source ./src --dark-audit --max-dark-missing 0 --output ./reports/dark-audit.json
```

它列出硬编码白/灰/彩色原子类、固定阴影、已使用的语义角色和缺少 `dark:` 的候选，报告保留源文件、行号和 class 字符串。`semantic-role` 只说明迁移方向，不证明七个角色已在 `theme.semantic` 中配置；`shadow` 仍需人工判断。工具不会自动改写、自动添加 `dark:` 或重解释 `bg-white/90`，阈值失败返回 `2`。优先把候选迁移到 `componentPresets.ui = 'semantic'` 使用的角色令牌，再做视觉回归。

`--dark-audit` 必须有 `--source`；`--max-dark-missing` 必须同时启用审计并传非负整数。参数错误或无源文件退出 `1`。同文件相同 class 字符串去重并记录首次位置；行号定位失败为 null。按属性、important 和移除 dark 后的有序变体链配对：`dark:hover:bg-*` 不覆盖普通 `bg-*`，不同断点也不互相覆盖。支持 dark/dark-class/dark-media、变体组和显式任意颜色；不展开 shortcut、不执行动态拼接或条件分支、不做 CSS 层叠与对比度判断。自定义角色名通过 `--config` 的 `theme.semantic` 识别；标准角色名只是提示，仍需确认配色。

API：`migrate.auditDarkFiles(inputs, { root, config })` 返回 `{ summary, candidates, files }`；`migrate.auditDarkSource(source, { source: 'card.html', config })` 还返回 `findings`。CJS 使用 `require('jquanui').migrate`，ESM 可从 `jquanui/migrate` 导入同名函数。都是同步只读调用，无销毁资源；完整参数和报告字段见 `dist/cli/README.md`。

复用任务提示：`运行 jquan-migrate --source ./src --dark-audit 生成报告，按文件列出缺少暗色处理的候选；核对 semantic 角色和设计意图后迁移，并执行文档、类型及视觉回归。`

Tailwind 配置只作为令牌和断点上下文读取：支持 `theme.extend.colors`、`spacing`、`screens`、`borderRadius`、`fontSize`、`fontWeight`、`lineHeight`；插件、`corePlugins`、`variants` 只进入 `configWarnings`/`unsupportedTailwindTokens`，不会被执行，也不会假装已经迁移。报告中的 `before`/`after`、`reason` 和 `migrationSuggestions` 是人工迁移依据；复杂选择器、渐变、mask、shadow、transform、keyframes 继续人工处理。

项目专属动画应进入主题配置：

```js
window.JQUAN_CONFIG = {
  theme: {
    extend: {
      keyframes: {
        reveal: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: { reveal: 'reveal 600ms ease both' }
    }
  }
};
```

HTML 使用 `animate-reveal motion-reduce:animate-none`。只有关键帧需要复杂选择器联动或不能用声明对象表达时才保留 CSS。

## JavaScript 与组件

### 浮层与分页主题

新页面在 Core/Full/Components **之前**配置 `componentPresets: { ui: 'semantic' }`，并提供 `surface`、`surface-muted`、`text`、`text-muted`、`border`、`accent`、`focus` 七个 `theme.semantic` light/dark 色值。`overlay` 缺省继承 `ui`，可显式设为 `'legacy'` 保留旧浮层，或单独设为 `'semantic'`。不运行中切换预设模式；日常切换根元素 `.dark/.light`、跟随系统或用 `setTheme()` 更新完整角色集合。

```js
// 先显式加载 overlayPreset.js、msg.js、pagination.js（Core 之后）。
const preset = JquanUIComponents.overlayPreset; // classes/tones/icons、mode、presets
const messageApi = JquanUIComponents.msgApi;
const paginationApi = JquanUIComponents.paginationApi;
const message = messageApi.show({ content: '保存成功', duration: 0 });
const pager = paginationApi.mount('#pager', { total: 120, showSizer: false });
// 卸载：message.close(); pager.destroy(); 预设无需 destroy。
```

Core、压缩 Core、Full 和 Components 入口都内置 `JquanUI.import`；只引入 Core 后即可按名称加载本地组件，命令式 Pagination 使用 `{ install: false }`。完整可复制 HTML 和配置参数见 `content/components/overlayPreset.js` 的 `semantic-minimum`，分页见 `content/components/pagination.js`。共享面板、Msg/Toast、Popover 箭头、分页和 Select/NumberInput 增强外观已接入；Tooltip 保持反色，Modal 表单待迁移。body 中的消息/portal 不继承触发器局部 `.dark`。状态图标用显式 dark 色档，阴影和遮罩保持固定。

### Select / NumberInput 主题组合

沿用上面的七角色配置与 `componentPresets.ui='semantic'`（组件加载前设置），然后命令式挂载：

```js
const [selectApi, numberApi] = await JquanUI.import(['select', 'numberInput'], { install: false });
const select = selectApi.mount('#flavor', { multiple: true }); // 原生 select
const number = numberApi.mount('#quantity', { largeStep: 5 }); // 原生 input[type=number]
select.setValue(['milk']);
number.step(5);
// 卸载：select.destroy(); number.destroy(); 原生字段和值保留。
```

完整 HTML、参数与销毁见两个组件页的 `semantic-minimum`。需 CSS color-mix()；Select 的 body 面板跟随页面主题，触发器跟随局部容器。NumberInput 的 classes 仅 mount 应用，颜色覆盖用 `!bg-red-100` 等 important 类。Select、Modal、Dialog、Drawer 和 Popover 已接入共享栈；Tooltip/Dropdown 等继续分批核对。

Select 的 mount/get 返回同一存活句柄，旧句柄不能控制同 id 重挂实例。远程搜索用 `remoteMethod(query, handle, {signal, requestId})`；输入立即取消旧请求，`searchDebounce` 只延迟新请求，`search()` 立即执行。只接收最新结果；错误保留候选，业务自行提示。close/update/destroy 取消异步工作。完整参数、键盘与示例见组件页 `remote-api`；手动加载需先引入 overlayManager.js。

### 历史颜色类的暗色语义映射（Core 4.72+，显式启用）

已有页面可以用 `darkMapping` 降低批量迁移成本。它默认关闭，只对 `map` 中列出的颜色令牌生成暗色 CSS 覆盖，不改写 DOM 或 class；映射目标必须是 `theme.semantic` 中的角色。

```js
window.JQUAN_CONFIG = {
  darkMapping: {
    enabled: true,
    map: { white: 'surface', 'slate-700': 'text', 'slate-200': 'border' }
  },
  theme: { semantic: {
    surface: { light: 'white', dark: 'slate-900' },
    text: { light: 'slate-700', dark: 'slate-100' },
    border: { light: 'slate-200', dark: 'slate-700' }
  } }
};
```

`bg-white/90`、`text-slate-700`、`border-slate-200` 以及对应的 `decoration-*`、`outline-*`、`ring-*`、`fill-*`、`stroke-*`、`caret-*`、`accent-*`、`placeholder:text-*` 会保留原亮色规则，并在 `.dark` 与 `prefers-color-scheme: dark` 下使用目标角色的 dark 值；透明度后缀会保留。`dark:bg-*`、`dark-class:*` 和 `dark-media:*` 等显式变体优先，不会再叠加自动映射。未列入 `map` 的历史类继续保持原义。`darkMapping` 必须在 Core 之前配置。

映射匹配主题节点自身和后代，例如 `<html class="dark bg-white">`；根 `.light` 阻止系统暗色回退。自动覆盖使用低权重主题条件，同一重要性、同类状态下显式 dark 规则优先；`!bg-white` 仍高于普通 `dark:bg-*`。`map` 的键为不带 `/90` 的颜色令牌，目标角色必须已配置；缺失角色会跳过。配置按颜色而非用途生效，`white -> surface` 也影响 `text-white`，需要保持白字时显式声明 `dark:text-white`。字号、边框宽度、任意值和阴影不参与映射。

占位符使用当前实际语法 `placeholder:text-slate-700`。Table semantic 预设已补齐正文、表头、空/加载状态、排序标记和工具栏按钮焦点环；完整示例见 `content/components/table.js`。排序 `<span>` 的键盘操作仍待后续迭代。验证用 `npm run check:dark-mapping`（Core/压缩/Full/静态提取、冷热缓存、系统/局部主题）和 `npm run check:semantic-theme`；切换检查使用可聚焦的刷新按钮，并保留节点/输入选区断言。

复用提示：`为旧页面配置显式 darkMapping，逐一核对相同颜色在背景、文字和图标中的用途，保留显式 dark 覆盖；用浏览器验证根节点、系统/局部主题、透明度、重要性、冷热缓存和静态 CSS，并同步文档与 skill。`

复用提示：`为现有 Msg/Toast/Popover/Pagination 接入 semantic 预设，先配置七个角色，保留 classes 覆盖；核对挂载层级与局部主题，执行明暗/系统主题、焦点、分页行为回归并同步文档和 skill。`


动态状态优先修改标准属性或 `data-state`，让原子变体负责视觉：

```js
button.setAttribute('aria-expanded', String(open));
panel.dataset.state = open ? 'open' : 'closed';
```

不要在 JavaScript 中反复写 `element.style.*`。动态类必须是完整可扫描字符串；无法静态发现时加入 `safelist` 或调用 `JquanUI.addSafelist()`。

需要提前准备动态 UI 时，按用途选择 API：`await JquanUI.compile(classes)` 等待明确的本批类名尝试完成；默认空队列冷类不超过 20 个时同步处理，大队列 idle 切片最多 40 个，返回值始终为 Promise。不要把 compile 返回或固定 setTimeout 当成全部 CSS 就绪。`JquanUI.prefetch(classes, options)` 用于有数量、CSS 字节和同步耗时预算的受控预热。默认预算是 `maxClasses: 100`、`maxBytes: 100000`、`timeoutMs: 50`。检查返回值的 `accepted`、`skipped`、`reason` 和 `truncated`；`skipped[].reason` 只会是 `max-classes`、`max-bytes` 或 `timeout`。已处理类不会重复插入或占用本次字节预算。

```js
const result = JquanUI.prefetch(
  ['grid', 'gap-4', 'hover:bg-primary/90', 'before:block'],
  { maxClasses: 40, maxBytes: 32000, timeoutMs: 16 }
);

if (result.truncated) console.table(result.skipped);
```

动态编译只需 Core，无组件依赖。compile 输入可为 string 或 Iterable，展开变体组并去重；`compile(classes, {sync:true})` 显式同步排空共享队列，可能阻塞主线程。结果字段：`requested` 本次类、`processed` 已尝试、`unresolved` 无解析结果、`failed` 解析异常/至少一条插入失败、`pending` 未尝试、`complete` 本批无 pending、`cancelled`、`reason`、`remaining` 共享队列余量、`durationMs`（含等待）。complete 不是有效 CSS 保证，failed 也可能已有部分规则；浏览器静默丢弃的声明不保证能识别。结果不受 debug 样本上限截断。

```js
const pending = JquanUI.compile(['grid', 'gap-4', 'hover:(bg-primary/90 text-white)']);
const partial = await JquanUI.flush({ maxMs: 8 });
console.log(partial.pending, partial.reason);
const done = await pending;
if (done.complete && !done.cancelled && !done.unresolved.length && !done.failed.length) {
  showPreparedContent();
}
```

`flush({maxMs})` 同步处理当前类队列，再返回 Promise 快照；预算为非负 number，默认 Infinity，0 不处理类，非法预算抛 RangeError。每类之前检查预算，单次解析/插入不可抢占，可能超时；部分结果 reason=budget，解析器内重入为 busy。省略预算同步排空。flush 不扫描 DOM/执行插件扫描 hook，也不接收尚未交付的 MutationObserver 记录；业务先提交 DOM 后 enhance(root)，或提前 compile 完整类名再显示。enhance 即使空根也会同步排空已有共享队列；scan 保留诊断，isReady()/jquan:ready 仅覆盖初始 ready。

destroy()/首次受支持的晚到配置会取消等待者（cancelled=true，reason=destroyed/config-changed），旧 idle 任务失效；样式表不可用为 stylesheet-unavailable，恢复后重新 compile/flush；正常完成 reason=null。视图销毁用 generation 标记忽略过期 UI 更新，不把 Core.destroy 当作局部组件清理。缓存格式 5 保留 unresolved 与 resolve-error/insert-error 阶段，旧格式失效；重复 compile 会复用已处理结果，不是更改 token 后的强制重试。完整参数与生命周期见 content/jit-syntax.js，可运行 examples/core-compile-completion.html，回归 npm run check:core-compile。

批量诊断使用 Core 的 `JquanUI.checkClasses(classNames, options?)`，单类候选可继续 resolve。输入 string/有限 Iterable，规范化复用 compile；Core 不写 CSS、不扫描/排空队列、不改 processed/debug/指标/缓存。自定义/插件 resolver 仍会执行且需自身纯净；resolve 异常直接抛出，checkClasses 则逐项返回 error。不能把查询成功当作 CSS 已插入。

```js
const report = JquanUI.checkClasses(['grid', 'hover:(p-2 m-2)', 'business-marker'], {
  maxClasses: 1000, timeoutMs: 50
});
console.table(report.results);
```

报告包含 requested、results、complete、ok、reason、maxClasses、timeoutMs、durationMs。results 与去重请求同序，不受 debug 80 项样本上限截断；每项 className/status/css/error/reason/runtime。status=resolved（有 CSS）、unresolved（无解析）、error（{name,message}）、ignored（jquan-ready）、skipped（max-classes/timeout），无对应字段为 null。runtime 是调用入口时历史状态：unprocessed/pending/processed/unresolved/resolve-error/insert-error，与本次 status 独立；过去失败现在可能解析成功。processed 仅表示尝试完成，不保证浏览器计算样式；业务/第三方标记 unresolved 不一定是错误，沿用 resolve 宽容规则而非独立 CSS 语义验证。

预算 maxClasses 默认 1000、非负安全整数或 Infinity；timeoutMs 默认 50、非负 number 或 Infinity；非法值抛 RangeError。0 跳过全部，两者为 0 时数量优先。每类前检查，不含输入枚举/展开，resolver 不可抢占；末次超时仍可能 complete。complete=没有跳过，ok=全部 resolved/ignored 且无跳过，空集合均 true。reason 为 max-classes/timeout/null；skipped 不生成全局失败。缓存格式 5 保存失败阶段，4 失效；jquan-ready 是保留标记，compile/scan 不记未解析，直接 resolve 仍 null。

debug()/diagnose() 默认只读，{track:true} 显式开启冲突追踪并重扫。自动化顺序：初始 isReady/jquan:ready → 等业务 DOM/数据/模板更新 → await compile(完整动态类) 并检查 complete/pending/cancelled/unresolved/failed → 等字体/图片/实际布局 → 截图。checkClasses、初始 ready、固定 setTimeout 都不替代动态完成。查询无资源无需销毁；页面异步渲染继续用 generation 忽略过期回调。参数表与交互见 content/architecture.js，示例 examples/core-class-diagnostics.html，回归 npm run check:core-diagnostics。

复用提示：`用 checkClasses 只读定位类名问题，分别解释当前 status 与历史 runtime；把预算跳过和真实失败分开，使用 await compile 验收动态样式，保持默认诊断无副作用并同步文档、类型、skill 和冷热缓存回归。`

复用提示：`为动态页面接入 await JquanUI.compile，检查 complete/cancelled/unresolved/failed 后展示；用 generation 避免旧请求覆盖新视图，预算 flush 检查 pending/reason，保持 Core 与组件职责独立，并同步类型、文档、skill 与真实队列/缓存/性能回归。`

### JquanUI 全生态复用规范

JquanUI 采用“复用优先、原组件演进、独立能力解耦”的设计：

1. 先检查现有组件、API、适配器和工具链，优先直接调用公开能力。
2. 现有能力不足时，优先迭代原组件，保持旧 API 兼容并补齐通用能力。
3. 新组件只能调用扩展后的统一 API，不得复制 HTTP、存储、状态、分页、表格、校验或模板逻辑。
4. 只有职责边界或运行环境确实不同，才创建新的独立组件或适配器。
5. 扩展必须同步类型、文档、回归测试和聚合包。

### 文档配套闸门

凡是新增组件、功能、公开 API、配置项、变体或原子类，都必须同时完成配套文档；已有能力扩展时必须更新原有文档，不得只在源码或聊天记录中说明。文档至少包含用途、引入方式、最小示例、参数或类名、返回值/状态、依赖关系、限制和生态组合方式。组件索引只收录活动模块；发现 `*-DESKTOP-*` 等同步副本时先归档并保存哈希，再运行索引、manifest 和 bundle 检查。提交前运行 `npm run check:docs`，并把新公开 API 加入文档覆盖清单。

### 文档也遵守组件优先

JquanUI 文档不是脱离生态的静态样稿，而是组件和原子引擎的真实使用场景。重构文档页面时，先复用已有 `template`、`codeBlock`、`tabs`、`toast`、`uiPreset` 和组件 API；现有能力不足时先扩展原组件，再考虑新增组件。公共页头、导航、搜索、页脚、代码示例和状态反馈应通过 Template 的 `include`、`layout`、`slot` 或现有组件集中维护，避免在多个 HTML 页面复制相同结构。

文档示例必须优先使用语义原子类，不能因为页面是文档就退回大段 CSS。示例中新增的类名、组件 API、配置和脚本必须能被当前 Core/Components 实际解析或执行；文档、`components.html`、README 和本 Skill 的同一能力说明应保持一致。完成文档组件化后运行 `npm run check:docs`、模板回归、组件回归和视觉结构检查。

### 组件文档模块规范

组件文档目录位于 `content/components/`，每个组件必须拥有同名的独立文档模块，并由 `content/components/index.js` 聚合。控制器 `js/components-docs.js` 只负责搜索、分类、公共渲染和演示生命周期，不再保存组件目录数据。每个模块至少提供 `id`、`title`、`chinese`、`category`、`kind`、`version`、`file`、`api`、`install`、`declarative`、`imperative`、`examples`、`attrs`、`methods`、`events` 和 `notes`。

`kind: 'ui'` 用于有可见 DOM 表面的组件，例如 Button、Tabs、Table、Modal；`kind: 'service'` 用于数据、网络、存储、模板和浏览器能力。文档分类必须帮助开发者先判断“放进页面的组件”还是“提供能力的服务”，不得把两者混成一个模糊类目。每个模块至少提供一个声明式示例和一个命令式/API 示例；详情页从 `examples` 渲染代码，不能在控制器中重复写同一段示例。

公共导航、组件页头、组件侧栏头、页脚和代码展示壳使用 `docs/templates/` 下的 Template 片段；组件模块只维护自己的用途、真实 API、示例和必要的演示初始化。新增或修改组件文档后运行 `npm run check:component-docs`，确认模块索引、分类、源码路径、API 方法和示例源没有分叉。

例如：Data 请求复用 `JquanUIComponents.httpApi`；HTTP 缺少通用能力时先扩展 `http.js`，不要在 Data 中重新实现 `fetch()`。Data 的页面结果交给 `paginationApi.updatePage()`；持久化优先复用 `storageApi`，只有 IndexedDB 等不同存储模型才新增适配器。

每次新增生态能力前，AI 必须说明已检查哪些现有能力、为何不能直接复用、是否应先迭代原组件，以及新 API 的归属。

需要交互组件时先检查 `jquanui/components`，不要重复实现现有 button、dialog、dropdown、tabs、tooltip、table、form、upload、router 等能力。

## 组件调用规范

JquanUI Core 只负责原子 CSS。组件位于 `dist/components`，通过 `window.JquanUIComponents` 暴露；不要把组件 API 当成 Core API，也不要在只加载 Core 时调用组件。

### 选择引入方式

按实际需求选择最小入口：

```html
<!-- 1. 只使用原子排版：默认首选 -->
<script src="./js/JquanUI@core.min.js"></script>

<!-- 2. 使用少量组件：Core + 单组件文件 -->
<script src="./js/JquanUI@core.min.js"></script>
<script src="./dist/components/dialog.js"></script>

<!-- 3. 使用多个组件：Core + Components 聚合包 -->
<script src="./js/JquanUI@core.min.js"></script>
<script src="./dist/components/JquanUI@components.js"></script>

<!-- 4. 需要完整运行时和全部组件时才使用 Full -->
<script src="./dist/full/JquanUI@full.js"></script>
```

不要同时加载 Full、Core 和 Components 聚合包。不要同时加载 Components 聚合包和其中的单组件文件。npm 浏览器项目可使用 `import 'jquanui/core'` 和 `import 'jquanui/components/dialog'`；使用全部组件时使用 `import 'jquanui/components'`。

### 标准安装顺序

组件脚本注册的是组件定义，必须在 Core 就绪后安装：

```html
<script src="./js/JquanUI@core.min.js"></script>
<script src="./dist/components/dialog.js"></script>
<script>
  JquanUI.use(JquanUIComponents.dialog);
</script>
```

AI 必须遵守：

1. 先加载 Core，再加载组件脚本，再调用 `JquanUI.use()`。
2. 每个组件只安装一次；Core 会按组件名去重，但代码中仍不得重复调用。
3. 有依赖的组件先安装依赖，再安装主组件。
4. 声明式节点应在组件安装前已经存在；动态插入后可调用 `JquanUI.enhance(root)`。
5. 页面卸载、视图替换或测试结束时调用句柄/API 的 `destroy()`；不要遗留监听器和实例。
6. 不要猜测 API。先查 `js/components-docs.js` 中对应 `id`，再查 `dist/components/{name}.js` 的实际 `*Api` 导出。

依赖安装示例：

```js
JquanUI.use(JquanUIComponents.pagination);
JquanUI.use(JquanUIComponents.table);

JquanUI.use(JquanUIComponents.modal);
JquanUI.use(JquanUIComponents.formValidator);
JquanUI.use(JquanUIComponents.table);
JquanUI.use(JquanUIComponents.crud);
```

### 声明式优先，命令式补充

静态 HTML 优先写 `jq-*` / `data-jq-*` 属性，让插件自动增强：

```html
<div jq-tabs id="account-tabs">
  <nav jq-tab-list>
    <button type="button" jq-tab jq-target="#profile-panel">资料</button>
    <button type="button" jq-tab jq-target="#security-panel">安全</button>
  </nav>
  <div jq-tab-content>
    <section id="profile-panel" jq-tab-panel>资料内容</section>
    <section id="security-panel" jq-tab-panel>安全内容</section>
  </div>
</div>
```

需要数据、回调或程序控制时使用对应 API：

```js
const tabs = JquanUIComponents.tabsApi.mount('#account-tabs', {
  mode: 'fade'
});
JquanUI.use(JquanUIComponents.tabs);

tabs.goTo(1);
```

首次 options 需要在自动增强前 mount；如果插件已增强目标，使用已有句柄的 update({ mode: 'fade' })。

优先保存 `mount()` 返回的句柄，不要反复 mount 同一节点。更新时优先使用句柄的 `update()`、`patch()`、`setData()` 等现有方法，不要销毁 DOM 后重新实现组件。

### 高频组件范式

按钮通常只需声明式属性：

```html
<button type="button" jq-button data-variant="primary" data-size="sm">保存</button>
```

Dialog 是纯声明式组件，使用触发器和目标选择器；当前没有 `dialogApi`：

Dialog 1.5 使用共享 OverlayManager：`await JquanUI.import('dialog')` 自动安装依赖；手动脚本/npm 按 overlayManager → dialog 加载并安装。打开后统一管理顶层 Escape/Tab、焦点返回、嵌套滚动锁和 z-index；初始 `data-state="open"` 也加入栈。`jq-dialog-initial-focus` 放在面板内可见可用元素，关闭按钮可含图标。节点移除自动释放；不调用 `__jquan*` 私有方法或手写 body overflow。完整依赖、参数、状态与卸载见组件页 `shared-minimum`，回归使用 `node scripts/check-overlay-browser.cjs`、`node scripts/check-modal-browser.cjs`。

Drawer 1.2 通过 `const drawers = await JquanUI.import('drawer')` 自动安装 overlayManager → modal → drawer。`const panel = drawers.open({ id: 'filters', title: '高级筛选', content: '<p>条件</p>' })` 返回稳定包装句柄；`panel.state()` 读取 isTop/isClosing/destroyed/busy/closePending。update/patch 累积参数，返回相同句柄；服务也接受当前句柄。相同业务 id 再次 open 会销毁旧实例，旧句柄不影响替代实例。`await panel.close()` 的 true 表示开始退出动画；卸载用 `panel.destroy()` 立即清理。不要据 close 的 true 判断 DOM 已移除，不手写焦点或 body 锁。完整参数、回调、依赖与类型见 Drawer 页；回归运行 `node scripts/check-modal-browser.cjs`。

```html
<button type="button" jq-dialog-trigger jq-target="#confirm-dialog">打开</button>
<div jq-dialog id="confirm-dialog" aria-labelledby="confirm-title">
  <div jq-dialog-backdrop></div>
  <section jq-dialog-panel class="p-6">
    <h2 id="confirm-title">确认操作</h2>
    <button type="button" jq-dialog-close>取消</button>
  </section>
</div>
```

```js
JquanUI.use(JquanUIComponents.dialog);
```

数据表格先安装 pagination，再安装 table：

```js
JquanUI.use(JquanUIComponents.pagination);
JquanUI.use(JquanUIComponents.table);

const table = await JquanUIComponents.tableApi.mount('#records', {
  columns: [
    { key: 'name', title: '名称', sortable: true },
    { key: 'status', title: '状态' }
  ],
  data: rows
});

table.state();
```

表单校验使用原生 `form`、`label`、`name` 和约束属性，组件只补充规则与反馈：

```js
JquanUI.use(JquanUIComponents.formValidator);
const validator = JquanUIComponents.formValidatorApi.mount('#profile-form', {
  schema: { email: ['required', 'email'] }
});
const result = await validator.validate();
```

Toast、Msg、Copy 等命令式工具直接调用对应 API，不为它们重复创建状态系统：

```js
JquanUI.use(JquanUIComponents.toast);
JquanUIComponents.toastApi.success({ title: '保存成功' });
```

具体参数必须以当前组件文件为准，因为不同组件的 `mount/update/state/destroy` 签名可能不同。

### 基础服务组件调用规范

这些模块不是 Core 原子类，也不是页面级 CSS。使用前按“Core -> 组件脚本 -> use/install”加载；静态布局继续写 JquanUI 原子类，服务组件只处理运行时行为。

#### DOM 工具集

~~~html
<script src="./js/JquanUI@core.min.js"></script>
<script src="./dist/components/dom.js"></script>
<script>
  JquanUI.use(JquanUIComponents.dom);
  JquanDOM.ready(() => {
    const card = JquanDOM.create('article', {
      className: 'rounded-lg border border-slate-200 p-4 text-sm',
      text: '准备就绪'
    });
    JquanDOM.append('#root', card);
  });
</script>
~~~

JquanDOM / JquanUIComponents.domApi 支持 query/queryAll、create/build、append/prepend/before/after/remove/empty、html/text/val、attr/data/css、类名读写、节点关系、事件、表单序列化和三类原生观察器。目标参数可以是选择器、Element 或节点集合；on() 返回 handler，事件解绑时传给 off()；observer 需要调用 disconnect()。静态样式不要用 css() 逐项写回，优先原子类。

#### Permission 权限显示控制

~~~js
JquanUI.use(JquanUIComponents.permission);
const permissions = JquanUIComponents.permissionApi;
permissions.setPermissions(['component.read', 'component.write']);
permissions.setRoles(['admin']);
~~~

~~~html
<button type="button"
  data-permission="component.write"
  data-permission-deny="disable">
  保存
</button>
<div data-role-permission="admin">管理员区域</div>
~~~

has(values, mode)、hasRole(values, mode) 支持 some/every；can({ permission, permissionMode, role, roleMode }) 用于组合判断。默认拒绝会隐藏节点，data-permission-deny="disable" 会禁用控件。权限组件只控制前端显示，不替代服务端鉴权；权限变化后使用 refresh(root?)，不重新实现节点扫描。

#### Router 路由

~~~js
JquanUI.use(JquanUIComponents.router);
const router = JquanUIComponents.routerApi.create({
  root: '#router-view',
  mode: 'hash',
  routes: [
    { path: '/', title: '首页', component: '<h1>Home</h1>' },
    { path: '/users/:id', component: target => '<h1>User ' + target.params.id + '</h1>' }
  ],
  beforeEach: (to, from) => to.route?.meta?.public !== false
});
await router.push('/users/42');
~~~

句柄提供 current()、routes()、push(location)、replace(location)、resolve(location)、clearCache(path?)、destroy()。beforeEach 返回 false 取消导航，返回字符串执行重定向；afterEach 适合记录成功导航。component 可返回 HTML 字符串、Node，或 { content, destroy }。meta.permission/meta.role 会调用 Permission；keepAlive: true 配合 cacheLimit 使用。history 模式还需要服务器把未知路径回退到入口 HTML。

#### Store 状态仓库

~~~js
JquanUI.use(JquanUIComponents.storage);
JquanUI.use(JquanUIComponents.store);

const store = JquanUIComponents.storeApi.create({
  state: { filters: { status: 'all' }, page: 1 },
  persist: { key: 'filters', driver: 'local' }
});

const stop = store.watch(
  state => state.filters.status,
  status => console.log(status)
);
store.update('filters.status', 'active');
~~~

使用 getState() 读取完整快照，get(path, fallback?) 读取路径；set() 替换、patch() 深合并、update() 按路径更新。subscribe(listener, immediate?) 监听完整状态，watch(selector, listener, immediate?) 监听选择器，二者都返回取消函数。action(type, payload, meta) 记录动作，onAction() 监听动作；transaction() 适合一次性提交多项变更，reset() 恢复创建时的初始状态。persist 只能在 create() 中配置，并依赖 Storage 与对应 driver，不是 store 实例方法。视图销毁时取消订阅并调用 destroy()。

#### Toast 与 Msg

Toast 是卡片式操作反馈，使用 title/description；Msg 是更轻量的系统消息，使用 content。两者都通过 API 命令式调用：

~~~js
JquanUI.use(JquanUIComponents.toast);
const handle = JquanUIComponents.toastApi.success({
  title: '保存成功',
  description: '配置已更新'
});
handle.update({ description: '已同步' });
handle.close();
~~~

对应的 Msg 调用是 JquanUIComponents.msgApi.success({ content: '保存成功' })。两者都提供 show/info/success/warning/error/loading、update(id, options)、close(id)、closeAll(placement?)、config(options) 和 promise(promiseLike, states)；show() / loading() 返回 { id, close(), update() }。promise() 会把同一条 loading 通知更新为 success/error，并继续返回原 Promise 的结果或异常。不要为 Toast/Msg 重建一套状态管理；异步操作优先使用 promise()。

### 模板引擎

模板引擎属于 Components，不属于 Core：

```html
<script src="./js/JquanUI@core.min.js"></script>
<script src="./dist/components/template.js"></script>
<script>
  JquanUI.use(JquanUIComponents.template);
</script>
```

页面内公共模板使用 `include`：

```html
<template id="shared-card">
  <article class="rounded-lg border border-slate-200 p-4">
    <h3>{{ item.title }}</h3>
  </article>
</template>

<script type="text/jq-template" id="page-template">
  {% for item in items %}
    {% include 'shared-card' with { item: item } %}
  {% endfor %}
</script>

<main jq-template="page-template" data-jq-template-data='{"items":[]}'></main>
```

命令式模板使用：

```js
const templateApi = JquanUIComponents.templateApi;
const view = templateApi.mount('#view', {
  template: '<h2>{{ title }}</h2>',
  data: { title: 'JquanUI' },
  sanitize: true,
  safeExpressions: true
});

view.patch({ title: '更新后的标题' });
```

`{{ value }}` 默认转义，`{!! html !!}` 输出原始 HTML。模板或数据不完全可信时启用 `sanitize: true` 和 `safeExpressions: true`，并避免原始 HTML 输出。

统一安全场景优先使用 `safe: true`，不要只打开其中一项：它会同时启用安全表达式、HTML 净化、资源协议过滤和过滤器白名单。需要自定义过滤器时显式提供 `safeFilters`，并只加入无副作用、无 HTML 注入能力的过滤器。CLI 页面构建使用 `--safe`。

外部公共 HTML 模板已支持。必须先注册加载器，再安装 Template 插件：

```js
const templateApi = JquanUIComponents.templateApi;

templateApi.useLoader({
  name: 'JQFileLoader',
  base: './templates/',
  extensions: ['.html'],
  cache: {
    maxEntries: 64,
    ttl: 300000,
    version: 'site-v1'
  }
});

JquanUI.use(JquanUIComponents.template);
```

页面模板可以直接引用公共文件：

```html
<script type="text/jq-template" id="page-template">
  {% include 'header.html' %}
  <main>{{ title }}</main>
  {% include 'footer.html' %}
</script>

<div jq-template="page-template" data-jq-template-data='{"title":"首页"}'></div>
```

外部文件通过 `fetch()` 加载，页面必须运行在 HTTP 服务中，不能依赖 `file://`。命令式调用使用 `renderAsync()` / `mountAsync()`；同步 `render()` 不加载外部文件。可使用 `preload()`、`clearTemplateCache()`、`templateCacheSize()` 和 `inspectTemplate()` 管理缓存。外部缓存使用有上限的 LRU；`ttl` 单位是毫秒，`0` 表示不过期，部署新模板时顺延 `version`。编译缓存默认最多 500 项，特殊长生命周期页面可通过 `cacheLimit` 调整。默认禁止父级 `..` 路径、跨域 URL 和非 `.html/.htm` 文件；只有明确需求时才调整加载器选项。

调试多文件模板时使用 `await templateApi.dependencyGraph('page.html')` 获取递归依赖图；动态 include 表达式会进入 `dynamicDependencies`，不会被误请求为文件。捕获渲染错误时读取 `templateName`、`includeChain`、`position` 和 `snippet`，不要通过解析错误消息猜文件。`inspect(name)` 是 `inspectTemplate(name)` 的简写。

Vite 开发服务器会自动监听 `.html/.htm` 模板变化、清除匹配缓存并重渲染已挂载实例，生产构建不会注入 HMR 客户端。只有项目已有其他模板热更新方案时才配置 `templateHmr: false`。自定义开发服务器可以派发 `jquan:template:update` 事件，或直接调用 `templateApi.invalidate(name)` / `await templateApi.refresh(name)`。

生产静态站优先在构建期展开公共模板，避免浏览器运行时 `fetch()`：

```bash
npx jquan-extract --render-html ./pages --html-output ./dist --templates ./templates --data ./site.json
```

AI 使用该命令时必须把页面入口与公共模板目录分开：`pages` 只放需要输出的页面，`templates` 放 header、footer、layout 等片段。目录构建会保持页面相对路径；`site.json` 必须是对象。不得用 `..` 绕出模板根目录。需要在 Node 中接入时使用 `buildTemplatePages()`；只渲染一个页面字符串时使用 `renderTemplateFile()`，不要另写正则替换 include。

如果页面必须保留客户端模板渲染，则改用生产模板预打包，不要让每个 include 单独请求：

```bash
npx jquan-extract --bundle-templates ./templates --template-bundle-output ./dist/jquan.templates.js --templates ./templates
```

生成脚本可在 `template.js` 之前或之后加载；它写入 `window.JQUAN_TEMPLATES`，并在 API 已存在时调用 `registerTemplates()`。Vite 项目配置 `templateInput`、`templateRoot`、`templateBundle` 即可自动发射和注入；只有项目自行管理脚本标签时才设 `templateBundleInject: false`。静态内容优先用 `--render-html` 直接生成最终 HTML，确实需要浏览器数据驱动时才使用模板 bundle。

需要审计依赖或做精确缓存时，增加 `--template-bundle-report`，或在 Vite/PostCSS 中配置 `templateBundleReport`。SSR 代码优先使用语义明确的 `renderToString()` / `renderToStringAsync()`。

只有大模板且频繁更新、需要保留输入焦点或局部 DOM 状态时才设置 `patch: true`；普通页面不要启用，默认 `innerHTML` 更快。Patch 不是业务状态管理，仍应通过 `data`、句柄和标准属性更新状态。

### Iframe 通信组件

父页面与 iframe 子页面通信使用独立的 `iframeBridge`，不要在业务页面重复封装 `window.postMessage`。先加载 Core 和组件脚本，再安装组件：

```html
<script src="./dist/core/JquanUI@Core.js"></script>
<script src="./dist/components/iframeBridge.js"></script>
<script>
JquanUI.use(JquanUIComponents.iframeBridge);

const bridge = JquanUIComponents.iframeBridgeApi.createParent({
  iframe: '#report-frame',
  targetOrigin: window.location.origin,
  namespace: 'report'
});

bridge.on('ready', () => bridge.send('context', { locale: 'zh-CN' }));
bridge.on('request:health', () => ({ ok: true }));
const result = await bridge.request('load', { page: 1 });
bridge.destroy();
</script>
```

子页面使用 `createChild({ targetOrigin, namespace })`，请求处理器使用 `on('request:name', handler)`，普通消息使用 `on('name', handler)`。`ready()` 完成 handshake 后再发送依赖连接的请求。`targetOrigin` 必须是明确 origin；`targetOrigin: '*'` 只有显式设置 `allowAnyOrigin: true` 才会被接受。MessageChannel 默认启用，不能用时自动回退到 `postMessage`。销毁页面或 iframe 前调用 `destroy()`。

安全边界：通信协议只验证协议版本、命名空间、来源和消息源，不验证业务权限。不要把 payload 直接写入 `innerHTML`、执行为代码或当作登录授权；服务端权限仍需独立校验。

### Favicon 图标组件

浏览器标签页图标、未读数量和加载/成功/错误状态使用独立的 `favicon` 组件，不要在业务页面重复操作 `link[rel="icon"]` 或引入重复的 Favico 封装。它不依赖 Core，但推荐在 Core 后加载并安装：

```html
<script src="./dist/core/JquanUI@Core.js"></script>
<script src="./dist/components/favicon.js"></script>
<script>
JquanUI.use(JquanUIComponents.favicon);

const favicon = JquanUIComponents.faviconApi;
favicon.set('/assets/brand.svg');
favicon.badge(12, { color: '#dc2626' });
favicon.status('loading');
setTimeout(() => favicon.status('success'), 800);
</script>
```

公开能力：

- `set(source, options)` 设置 href、`{ svg }` 或 `{ canvas }` 图标，成为当前实例的 base icon。
- `badge(value, options)` 生成未读数量徽标；数字超过 999 显示 `999+`，空值通过 `clear()` 返回 base icon。
- `status('idle' | 'loading' | 'success' | 'error' | 'warning' | 'info', options)` 生成内置状态图标；loading 默认按帧更新，可用 `animate: false` 关闭。
- `watch({ light, dark })` 根据 `prefers-color-scheme` 选择图标，返回停止监听的函数。
- `clear()` 清除徽标/状态并恢复实例 base icon；`restore()` 恢复调用前原始 link；`destroy()` 停止计时器、主题监听并恢复原始图标。
- `create(options)` 创建独立句柄；多个句柄共享一个受管 favicon 节点，销毁非当前 owner 不会误删其他实例的图标。

输入规则：优先使用项目已有的静态 favicon URL；SVG 仅传入受信任的 `<svg>` 字符串，组件会拒绝 `script`、`foreignObject`、事件属性、脚本协议和 HTML 数据源；Canvas 必须能通过 `toDataURL('image/png')` 导出。组件会复用已有 `link[rel~="icon"]`，没有时才创建一个，不要为每次状态更新手动插入新的 link。

组件与 `notificationCenterPanel`、`msg` 或 `Data` 配合时，只传递未读数量或状态结果；不要把 favicon 当作通知队列、持久化层或权限提示的替代品。完整参数与开发者示例见 `components.html`。

### HTTP 请求客户端

HTTP 是纯 JavaScript 服务组件，不提供声明式 DOM。先加载 Core、HTTP 文件并安装组件，再通过 `JquanUIComponents.httpApi` 或独立实例调用：

```html
<script src="./dist/core/JquanUI@Core.js"></script>
<script src="./dist/components/http.js"></script>
<script>
  JquanUI.use(JquanUIComponents.http);
  const api = JquanUIComponents.httpApi.create({
    baseURL: '/api',
    timeout: 10000,
    retries: 2
  });
</script>
```

使用 `get/delete/head/options` 发送无请求体请求，使用 `post/put/patch` 发送 JSON、文本、Blob、FormData 或 URLSearchParams。普通对象默认序列化为 JSON，文件表单使用 `postForm()`，不要手动设置 multipart boundary。

```js
const response = await api.get('/contacts', {
  params: { status: 'active', page: 1 },
  responseType: 'json'
});
console.log(response.data, response.status, response.duration);

const created = await api.post('/contacts', { name: 'Ada' });
```

响应统一包含 `requestId`、`data`、`status`、`headers`、`config`、`url`、`ok`、`duration` 和 `raw`。非 2xx 默认抛出 `JquanHttpError`，读取 `error.code`、`error.response` 和 `error.config`，不要只依赖字符串消息。`timeout` 会产生 `ERR_TIMEOUT`；网络失败通常为 `ERR_NETWORK`；取消使用 `cancelSource()` 和 `isCancel()`：

```js
const source = api.cancelSource();
const pending = api.get('/report', { signal: source.signal });
source.cancel('离开报表页');
try {
  await pending;
} catch (error) {
  if (JquanUIComponents.httpApi.isCancel(error)) return;
  throw error;
}
```

拦截器 `use()` 返回移除函数；路由离开、组件销毁和测试结束时必须调用它。`setAuth({ token })` 或 `setAuth({ getToken })` 默认生成 Bearer Authorization 头，公共请求默认实例可直接调用 `httpApi.get()`。Data、Crud、Upload 等能力必须复用 HTTP，缺少通用能力时先扩展 HTTP 并补类型、文档和测试。

### i18n 国际化

i18n 同时支持声明式 DOM 和命令式 API。先注册消息，再初始化一次；用户操作时调用 `setLocale()`，不要在每次切换时重复 `init()`。

#### 消息 key 的三种组织方式

运行时的完整寻址形式是 `locale -> namespace -> key`。`registerMessages()` 的输入可以按下面三种方式组织：

| 语言包形状 | 注册调用 | 节点 key | 适用场景 |
| --- | --- | --- | --- |
| 平铺（默认） | `registerMessages({ 'zh-CN': { greeting: '你好' } })` | `greeting` 或 `common.greeting` | 小页面；所有消息放入默认 `common` namespace |
| 显式嵌套 | `registerMessages({ 'zh-CN': { common: { greeting: '你好' }, account: { title: '账户' } } }, { nested: true })` | `common.greeting`、`account.title` | 多模块语言包；namespace 名称明确 |
| 单语言 namespace | `registerLocale('zh-CN', { title: '账户' }, { namespace: 'account' })` | `account.title`（或节点加 `data-i18n-namespace="account"` 后使用 `title`） | 按需加载或独立维护的模块 |

资源顶层值全部为对象，且出现 `common` 或 `fallbackNamespaces` 中的名称时，会自动按 namespace 拆分；其他 namespace 使用 `{ nested: true }` 明确声明。普通嵌套消息可用 `{ nested: false }`，或显式传入 `{ namespace }` 避免自动识别。点号路径在同一 namespace 内继续表示嵌套对象，例如 `common.menu.file`；带点号的字面 key 也支持。

```js
const i18n = JquanUIComponents.i18nApi;
i18n.registerMessages({
  'zh-CN': {
    common: { greeting: '你好，{{name}}', menu: { file: '文件' } },
    account: { title: '账户' }
  },
  'en-US': {
    common: { greeting: 'Hello, {{name}}', menu: { file: 'File' } },
    account: { title: 'Account' }
  }
}, { nested: true });
```

原生 HTML 使用 `data-i18n` 翻译文本，`data-i18n-placeholder`、`data-i18n-title` 翻译属性，控件值使用 `data-i18n="key" data-i18n-target="value"`。`data-i18n-params` 传入 JSON 插值参数，`data-i18n-switcher` 提供语言切换按钮：

```html
<h1 data-i18n="common.greeting" data-i18n-params='{"name":"Ada"}'>欢迎</h1>
<h2 data-i18n="title" data-i18n-namespace="account">账户</h2>
<button type="button" data-i18n-switcher="en-US">English</button>
```

#### init 与 setLocale 的完整生命周期

页面先引入 Core、`dist/components/localStorage.js` 和 `dist/components/i18n.js`。下面代码放在 DOM 后的 `<script type="module">`；localStorage 供 `persist:true` 使用：

```html
<h1 data-i18n="greeting" data-i18n-params='{"name":"Ada"}'>欢迎</h1>
<button type="button" data-locale="zh-CN">中文</button>
<button type="button" data-locale="en-US">English</button>
```

```js
JquanUI.use(JquanUIComponents.localStorage);
JquanUI.use(JquanUIComponents.i18n);
const i18n = JquanUIComponents.i18nApi;
i18n.registerMessages({
  'zh-CN': { greeting: '你好，{{name}}' },
  'en-US': { greeting: 'Hello, {{name}}' }
});

await i18n.init({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  availableLocales: ['zh-CN', 'en-US'],
  detectOrder: ['storage', 'default'],
  persist: true,
  autoObserve: false,
  syncDocument: true
});

document.querySelectorAll('[data-locale]').forEach(button => {
  button.addEventListener('click', async () => {
    await i18n.setLocale(button.dataset.locale, { reason: 'language-button' });
  });
});
```

`init()` 只初始化一次；再次调用只合并配置，不执行切换。`setLocale()` 在 `autoLoad:true` 时等待资源，始终重新翻译整个 `document`，同步 `<html lang>` 与 RTL 的 `dir`，并触发 `change`。`persist:true` 依赖已引入的 localStorage API，或 Storage 门面及对应 driver。演示/测试使用 `persist:false` 和 `detectOrder:['default']` 固定初始语言；默认检测顺序是 URL、存储、HTML、浏览器、默认值，单独传入 `locale` 不会覆盖较高优先级来源。

默认插值会写入 `textContent` 并转义参数。句子包含 `<b>`、链接等结构时，优先拆成多个 key；只有语言包完全可信且确实要保留标签时，才使用 `data-i18n-html` 或 `data-i18n-target="html"`：

```html
<!-- 推荐：每个结构片段独立翻译，保留 DOM 语义 -->
<p><b data-i18n="meal.time">早餐</b><span data-i18n="meal.name">牛奶</span></p>
<!-- 仅对完全可信的语言包开放 HTML -->
<p data-i18n="meal.markup" data-i18n-html></p>
```

`data-i18n-html` 只作为标记，key 仍由 `data-i18n` 提供；HTML 模式没有内置标签/key 白名单，且该标记关闭插值转义。只为应用审核过的静态语言包 key 开放 HTML（例如 `new Set(['meal.markup'])`），语言包中的外部输入需要在进入引擎前净化。`data-i18n-target="html"` 保留参数转义，但也不净化语言包标签。父节点不要同时加文本 key，否则会替换后代结构。

小页面通常无需额外监听，切换时由 `setLocale()` 翻译 `document`。已有内容的局部更新调用 `translate(root)`；持续注入的列表/模板可调用 `observe(root)` 增量翻译新增节点。它不改变语言切换的全量行为，也不监听参数属性变化。`autoObserve` 默认 true，初始化会观察 body；要管理局部根应设 `autoObserve:false`。观察器是引擎级单一资源，重复 `observe()` 会替换旧根；它不立即翻译已有节点。视图卸载时调用 `disconnect()`，`on('change', handler)` 返回的取消函数另行调用。

```js
const panel = document.querySelector('#messages'); // 已存在的容器
const row = document.createElement('p');
row.dataset.i18n = 'greeting';
row.dataset.i18nParams = JSON.stringify({ name: 'Ada' });
panel.append(row);
i18n.translate(panel);       // 一次性局部更新
i18n.observe(panel);         // 后续插入自动增量翻译
// 无 observe 时，新插入的 data-i18n-switcher 还需 i18n.bindSwitchers(panel)
// 路由卸载：i18n.disconnect();
```

列表、数量和日期使用数据驱动渲染：循环创建节点后设置 `data-i18n` 与 `data-i18n-params`，再局部翻译，不为每种语言复制列表模板。复数使用 `t(key, { count })`；`tn/td/tc` 将数字/日期/货币格式化后放入 `{{value}}`，不会自动传入 `count`。语言包可通过 `localesPath` 或 `loader(locale, options)` 异步加载；开启 `autoLoad` 后 `init()` 与 `setLocale()` 会等待资源。

### Storage 存储生态

Storage 是统一门面，不是新的介质。使用它前必须加载并安装 `localStorage`、`sessionStorage`、`cookie` 三个 driver，再安装 `storage`：

```js
JquanUI.use(JquanUIComponents.localStorage);
JquanUI.use(JquanUIComponents.sessionStorage);
JquanUI.use(JquanUIComponents.cookie);
JquanUI.use(JquanUIComponents.storage);

const storage = JquanUIComponents.storageApi;
storage.config({ namespace: 'crm', defaultDriver: 'local' });
storage.set('filters', { status: 'active' }, { ttl: 86400000 });
const filters = storage.get('filters', {});
```

统一 API 包括 `get`、`set`、`remove`、`has`、`touch`、`keys`、`entries`、`getMany`、`setMany`、`clear` 和 `purgeExpired`。单次操作通过 `{ driver: 'session' }` 覆盖默认 driver；`storage.driver('cookie')`、`storage.local()`、`storage.session()` 可读取原始 driver。对象和数组自动序列化，TTL 单位为毫秒；Cookie 自身的 `maxAge` 单位是秒。

支持事件的 driver 的 `on(key, callback)` 返回取消函数。localStorage 会转发当前页写入和其他标签页的 `storage` 事件；sessionStorage 只在当前标签页有效。默认 `clear()` 只清理当前 namespace，跨项目或测试环境务必设置独立 namespace。存储不可用时先检查 `isAvailable()`，不要把 localStorage、sessionStorage 或可脚本读取的 Cookie 当作密钥保管区。

### 组件索引

优先复用下列已有组件，不要重新实现同类能力：

- 基础交互：`button`、`accordion`、`tabs`、`dialog`、`modal`、`drawer`、`dropdown`、`popover`、`tooltip`、`select`。
- 表单与输入：`formValidator`、`schemaForm`、`tagInput`、`upload`、`relationPicker`、`mediaPicker`、`filterBuilder`。
- 数据与内容：`table`、`pagination`、`tree`、`infiniteScroll`、`mdViewer`、`codeBlock`、`carousel`、`video`、`audio`、`map`。
- 反馈与输出：`toast`、`msg`、`notificationCenterPanel`、`copy`、`export`、`print`、`watermark`、`favicon`。
- 应用能力：`router`、`appShell`、`http`、`store`、`storage`、`localStorage`、`sessionStorage`、`cookie`、`permission`、`i18n`、`template`、`dom`。
- 组合能力：`crud`、`kanbanBoard`、`approvalFlow`、`auditTimeline`、`commentThread`、`revisionCompare`、`taskInbox`、`workspaceSwitcher` 等。

组件索引只用于发现能力。实际调用前必须核对当前组件文档和源码，尤其是组合组件的依赖、异步返回值和销毁方法。

### 组件样式规则

- 组件外层布局仍使用 Core 原子类，不把业务页面布局塞进组件配置。
- 优先通过组件提供的 `classes`、variant、size 或状态属性定制；没有公开入口时再评估扩展。
- 不修改组件内部生成 DOM 的私有 class，不依赖未文档化结构写深层 CSS。
- 动态状态优先使用 `aria-*`、`data-state` 和原生属性，配合 Core 变体。
- 组件不存在时，先判断能否用原生 HTML + Core 原子类完成；只有重复且通用的交互才新增组件。

表单优先使用 `field-sizing-content` / `field-sizing-fixed`、`color-scheme-light` / `color-scheme-dark` 和 `caret-*`，不要为原生控件尺寸、深浅色控件或光标颜色新增 CSS。

现代排版优先使用 `text-wrap-stable`、`text-box-trim-*`、`text-box-edge-*`、`interpolate-size-*` 和 `box-decoration-*`，只有引擎没有对应语义映射时才写 CSS。

## 允许独立 CSS 的边界

仅允许以下情况，并在代码中说明原因：

- 项目专属复杂 `@keyframes`，且内置 animation 无法表达。
- 第三方库只能通过深层选择器覆盖。
- 浏览器特性无法由当前变体或任意属性表达。
- 大段打印排版、富文本内容策略或全局文档样式。
- 性能验证证明单一静态规则优于大量动态原子规则。

即使需要 CSS，也先把布局、间距、颜色和响应式保留为原子类，只把不可表达部分放入 CSS。

## 构建与生产

- 小型静态页或动态原型：直接加载 Core。
- 多页静态站生产构建：使用 `jquan-extract --render-html` 预展开 include/layout。
- 客户端模板生产构建：使用 `--bundle-templates` 或 Vite `templateBundle` 预打包，避免运行时逐文件请求。
- PostCSS 项目也可配置 `templateInput`、`templateRoot`、`templateBundle` 生成同一模板 bundle；该能力默认关闭。
- 模板运行时回归使用 `npm run check:template-runtime`，覆盖语法、循环、缓存、异步 include、安全模式和 DOM mount 生命周期；新增模板能力后必须运行它。
- Vite/PostCSS 项目：使用 `jquanui/vite` 或 `jquanui/postcss` 构建时提取。
- SSR：单一 HTML 字符串使用 `renderCriticalCss` / `injectCriticalCss` 注入首屏 CSS；React/Vue/Svelte/Next/Nuxt 接入使用 `jquanui/ssr`，它只复用现有提取器，不安装或模拟框架运行时。React 用 `createReactSSRAdapter({ renderToString })`，Vue 用异步 `createVueSSRAdapter({ renderToString })`，Svelte 用 `createSvelteSSRAdapter({ render })`，并以 `{ document: true }` 保留 `{ html, head, css }`；Next/Nuxt 在最终 HTML 响应处调用 `createNextSSRAdapter().inject(renderedHtml)` / `createNuxtSSRAdapter().inject(renderedHtml)`。应用有自己的 HTML 壳时，在适配器配置中提供 `document(rendered, options)`；它会同时被 `{ document: true }` 和 `adapter.createDocument()` 复用。CSP nonce、id、theme/config、safelist 统一放进 `critical` 配置，禁止另写第二套服务端 CSS 生成器。
- 动态服务端类名：配置 `safelist`。
- 发布前运行 `npm run verify`。
- Core 性能相关改动还必须运行 `npm run check:core-performance`。只比较同一机器、浏览器和样本数的 median；不得把单机绝对耗时、一次快样本或未经验证的倍数写成普遍性能承诺。无标准路径 Chromium 时通过 `JQUAN_BROWSER` 指定 Edge、Chrome 或 Chromium。

## 执行工作流

1. 阅读现有 HTML、组件约定和主题配置。
2. 选择语义元素，补齐 label、button type、aria、alt 等属性。
3. 用原子类完成布局、排版、颜色和状态。
4. 将任意值逐项替换为最近的语义令牌；保留确有意义的精确值。
5. 将重复组合提升为 shortcut 或项目令牌。
6. 检查 `before/after`、dark、hover、focus-visible、disabled 和动态状态。
7. 在至少 390px 移动端和 1280px 桌面验证无溢出、遮挡和孤字换行。
8. 检查控制台，并使用 `JquanUI.debug()` 查看未解析类和失败规则。
9. 对构建项目运行提取或项目验证命令。

## 文档页面标准

原子类和平台能力文档统一对标 `content/font.js` 的“说明 + 演示 + 交互”结构，不能只堆砌类名表。每个高频能力至少包含：

1. **用途说明**：说明解决什么真实排版或交互问题，以及什么时候应该使用它。
2. **最小示例**：展示推荐的语义类组合，并明确配置、依赖和浏览器前提。
3. **可视演示**：让开发者直接看到类名产生的布局、颜色、状态或排版结果。
4. **可操作交互**：能通过按钮、原生控件、拖动或输入改变状态；交互必须调用真实引擎能力，不得伪造结果。
5. **实时反馈**：展示当前状态、实际 class/API 调用或生成结果，便于定位问题。
6. **可复制代码**：代码必须与演示保持同步，使用当前 Core、组件 API 和版本，不得使用过期类名。

文档演示优先使用原生 HTML 属性、Core 原子变体和已有组件；不要为演示额外创建页面 CSS。交互销毁逻辑必须放在页面模块的 `unmount()` 或组件句柄中，动态 DOM 更新后重新调用 `JquanUI.enhance()`。新增 API、原子类或组件时，同时更新对应 `content/*.js`、`components.html` 或 CSS 文档导航、README/Skill、回归检查和 CHANGELOG。验收至少包括桌面视口、390px 移动视口、控制台无错误、示例状态可复现和代码复制结果一致。

## 输出要求

### 澜序 CRM 本地演示项目

完整双主题 CRM 示例位于 `projects/lanse-crm/`，入口 `index.html`；在该目录执行 `npm run dev`，使用 live-server 服务仓库根目录并打开 CRM 路径，提供开发自动刷新。Start.cmd 优先复用已有 live-server，缺少时 npm install 安装固定版本。设计提取见 `docs/DESIGN.md`，业务流程、限制和部署见 `README.md`，后续修改需同时遵循 `skills/lanse-crm/SKILL.md`。

该项目直接使用当前 Core 源码、Data 的 `createCollection/createCrudDataSource` 与 IndexedDB 持久化，复用 Table/Pagination/Msg/Export。命令式挂载 Table/Pagination 时不同时安装其声明式 behavior，避免分页配置被重挂覆盖；Msg 外观在脚本加载前配置现有 overlayPreset。双主题由 `theme.semantic` 和根元素 dark/light 状态表达，布局用原子类，重复外观用 shortcuts。没有页面级 CSS 或业务 HTTP 请求。

正式 Core、压缩 Core、Full、CLI 与 package 使用同一发布版本；归档入口 `dist/core/JquanUI@Core v4.5.js` 保持 4.5.3，不参与当前版本检查。迭代演示功能时同步项目 README、设计说明和项目 skill，并运行项目 check、相关 browser 检查与根 check:docs。


- 输出或修改实际可运行代码，不只描述方案。
- 默认不创建 CSS 文件，不输出 inline style。
- 说明保留任意值或 CSS 的具体原因。
- 不虚构类名；不确定时通过 `JquanUI.resolve('candidate')` 或项目测试确认。
- 保持类名顺序稳定：布局 -> 尺寸 -> 间距 -> 排版 -> 颜色/边框 -> 效果 -> 状态 -> 响应式。

澜序 CRM 新增客户跟进、站内信、日历、合同审批聚合及知识库，默认白色亮色并保存偏好。复用 schema/Table/Pagination/CRUD 和 Data；跨客户关联由应用校验，历史跟进一次迁入，消息读/回收状态按演示成员隔离；没有新增框架 API。扩展字段、示例、限制和销毁流程见 `projects/lanse-crm/docs/COLLABORATION.md`，修改遵循同目录项目 skill。

澜序 CRM 已扩展项目制造与审核工作流，24 个业务实体。立项/设计/采购门禁、报价版本与审核人限制由应用服务维护；approvalFlow 命令式只读展示实例快照，弹窗 cleanup 销毁，不用组件本身的 approve/reject 操作业务。模板/实例/本地站内信沿用独立 Data，未新增框架 API；国际金额分币种展示。详见 `projects/lanse-crm/docs/MANUFACTURING.md` 和项目 skill。

聚合构建：npm ci 后运行 npm run build:bundles。锁定的 Terser 只压缩 Components 与 Full 内组件代码的格式，compress/mangle 均关闭；单文件组件仍为可读源码，Core 保持原样。用 npm run check:bundles 校验生成物。

### Carousel / Tabs 最小闭环

类型分别从 `jquanui/components/carousel` / `jquanui/components/tabs` 导入；`JquanUI.import('carousel')` / `import('tabs')` 返回精确 API 类型。mount / update 的同步回调若销毁或替换当前实例，原调用返回 null；检查返回值再使用句柄。Carousel next / prev / 自动播放同步公开 currentIndex。回归命令：`npm run check:highfreq-lifecycle`（Core、压缩 Core、Full、Components）。


轮播与页签优先复用 carousel / tabs，不为简单需求重写定时器或切换器。完整可运行声明式与命令式示例见 `content/components/carousel.js`、`content/components/tabs.js` 的 `lifecycle` / `api-lifecycle`，页面会显示对应 schema 参数摘要。

```html
<section jq-carousel id="hero" class="h-48" aria-label="精选内容"
  data-carousel-autoplay="false" data-carousel-speed="420">
  <article jq-carousel-item>第一张</article>
  <article jq-carousel-item>第二张</article>
</section>
<script src="./dist/core/JquanUI@Core.js"></script>
<script src="./dist/components/carousel.js"></script>
<script>
  JquanUI.use(JquanUIComponents.carousel);
</script>
```

需要回调或 options 时，首次 `mount(options)` 应先于 `use()` 自动增强；重复 `mount()` 返回同一稳定句柄，不会应用新的配置；`update()` 返回同一句柄。已有实例使用 `update()`。Tabs 的 `goTo(1, { animate: false })` 与 Carousel 的 `goTo(1, false)` 签名不同，均以 0 为起点。

```js
const tabs = JquanUIComponents.tabsApi.mount('#account-tabs', {
  mode: 'fade',
  duration: 0, // 显式 0 立即完成
  onChange(index, panel, handle) { console.log(index, panel.id, handle.state()); }
});
JquanUI.use(JquanUIComponents.tabs);
console.log(tabs.update({ duration: 0 }) === tabs); // true
tabs.goTo(1, { animate: false });

// 卸载视图时，防止排队的声明式增强再次匹配：
const root = tabs.element();
root.removeAttribute('jq-tabs');
root.remove();
tabs.destroy();
```

Carousel 1.8 默认 `interval: 4000, speed: 420`；`handle.setIndicators(boolean)` 与 `handle.setProgress(boolean)` 只替换本实例的圆点/进度条，保留当前页、内容、稳定句柄和播放计时；全局 API 同名方法也可按 target 调用。Carousel `update()` / `destroy()` 取消旧进度 RAF，并只移除本实例生成在根节点外的缩略图 / 指示器包装，保留外部容器与其余内容。动态内容不会写回首次快照，变更内容前销毁并重新挂载。Tabs `update()` / `destroy()` 取消旧过渡完成回调；两者销毁后旧句柄 `state()` / `element()` 为 null、`update()` 为 null、其他操作为 false；同 id 重挂返回新句柄，旧句柄不影响新实例。

可复用提示词：

```text
复用 JquanUI carousel / tabs 实现当前交互。先核对对应组件文档 schema 与源码，选择声明式最小闭环；需要回调时在 use 自动增强之前 mount(options)。保留 0 起索引与组件各自 goTo 签名，补上视图卸载逻辑，并在 390px / 1280px 验证实际状态和无运行时错误。
```

### Popover 共享生命周期与表单组合

Popover 1.6 通过 `await JquanUI.import('popover')` 安装 OverlayManager；需要 mount(options) 时使用 `{ install: false }`，先命令式挂载再自动增强。重复 mount 返回相同句柄且保留初始配置。多个 Popover 独立进入共享栈，Escape/Tab/外部 click 仅由顶层处理，不锁滚动。click 默认自动聚焦并 trap；hover 默认不移动或 trap 焦点，业务可显式配置 trapFocus。`state()` 为 boolean，销毁后 null；旧句柄和 API 使用旧句柄不能影响重新挂载的实例。卸载时移除声明属性及视图根节点，再 destroy；组件取消定位帧与监听，owner 移除也会关闭层。完整参数/返回/依赖/限制见 Popover 页。

Modal 表单提交统一由 Modal 管理，FormValidator 只校验，不触发原生提交；更新/销毁清理校验句柄与旧提交，旧异步结果不关闭新表单或清除新 busy。用 `node scripts/check-modal-browser.cjs` 与 `node scripts/check-popover-browser.cjs` 验证组合。

FormValidator 1.1 的 mount/get 返回同一存活句柄，自动 enhance 保留手动 mount 的选项；同 id 新表单退休旧实例，旧节点或句柄 destroy 不删除新实例。用 handle.updateSchema(patch) 合并规则并重新绑定事件；reset/updateSchema/destroy 使旧异步结果失效，同字段只应用最新请求，淘汰结果含 valid:false、cancelled:true。卸载保存并调用原 handle.destroy()；状态读取 handle.state().destroyed。独立应用自行提交要给 onSuccess 并返回 false，否则有效表单默认调用原生 submit。示例见 FormValidator stable-lifecycle；运行 `node scripts/check-form-validator-browser.cjs` 与 Modal 组合回归。

复用提示：`扩展现有浮层时消费 OverlayManager，核对顶层 Escape/Tab、原始滚动恢复、同 id/重挂句柄隔离和异步表单退休；同步组件文档、类型与本 skill 并运行真实浏览器回归。`

## 可视化审查模式（reviewMode 0.18.1）

独立按需组件：Core/Full/Components 排除实现，manifest 用 `onDemandOnly:["reviewMode.js"]` 保留 importer 目录。按钮或应用 URL 入口才导入；配置或参数本身不下载。API 为 JquanUIComponents.reviewModeApi；依赖 Copy 自动安装；静态顺序 Core → copy → reviewMode，再依序 use。

```js
const review = await JquanUI.import('reviewMode');
review.configure({enabled:true, root:'#preview', allowURL:false});
review.open(); review.select('#title');
review.setText('确认的新标题');
review.setUtility('font-size','text-md');
review.setUtility('font-size','text-lg'); // 只导出最终值
console.table(review.utilities('brand'));
review.setAttribute('title','说明');
review.undo(); review.redo();
console.log(review.changes()); await review.copyPlan();
console.log(review.exportPlan('json'));
review.saveDraft('client-home');
const draft = review.loadDraft('client-home'); // 独立方案快照，不自动应用
review.clearDraft('client-home');
review.close(); // 保留历史；重开勿重复 configure
review.destroy(); // 保存方案后恢复未被外部覆盖的字段
```

root 只支持同 document、connected light DOM HTML。唯一 data-jq-review-key/id 稳定定位；结构路径须核对。navigate(parent/first-child/previous-sibling/next-sibling) 按实际 DOM、不越 root、不写历史；selection.navigation 提供可用性。setText 只改直接文本，混合内容指定 childNodes 索引，保留嵌套结构。入口/工具层/SVG/script/style/template 不可选。

utilities(query?) 为六组35字段的独立候选，合并主题色/间距（上限64/32）并经 Core.resolve 校验；搜索忽略大小写，最多120字符。setUtility 只接受语义基础类，保留变体；间距、边框、overflow 按整字段族替换方向类，null 移除、undo 恢复。setAttribute 仅 title/aria-label/aria-description、适用元素 alt/href。完整参数与限制见 content/components/reviewMode.js。


项目主题令牌（0.14）：0.14 utilities() 发现 theme / theme.extend 的 fontSize、fluid.fontSize、borderRadius（兼容 radius）、boxShadow，映射 text-* / text-fluid-* / rounded-* / shadow-*；圆角/阴影 DEFAULT 对应 rounded/shadow。每个新字段先去重并至多考察64个配置候选，再按 Core.resolve 的实际最终字段校验及搜索，内置候选另计，extend 优先列入；名称遵循既有语义类语法（字母/数字/点/连字符，不含下划线）。这不是全部原子类清单。配置先于 Core；普通令牌需支持它们的当前 Core，旧 Core 未解析的项会过滤，不热更新 Core 配置。 单字号、字号+行高支持；带字重/字间距的跨字段字号不接管。颜色/间距的原有64/32限额保留。自定义 resolver 抛错时过滤候选，setUtility 返回 false，会话继续可用。

```js
// Core 前配置：theme: { extend: { fontSize:{heading:['34px','1.2']}, borderRadius:{card:'22px'}, boxShadow:{soft:'0 12px 36px rgb(60 70 120 / .15)'} } }
const review = await JquanUI.import('reviewMode');
review.configure({enabled:true,root:'#preview'}); review.open(); review.select('#title');
console.table(review.utilities('heading'));
review.setUtility('font-size','text-heading');
// 选择卡片后可用 rounded-card / shadow-soft；净修改复用 copyPlan/saveDraft/applyPlan。
// 结束前先复制或保存方案，再 review.destroy()。
```

完整按需示例 examples/review-mode-theme-tokens.html；专项 npm run check:review-theme 覆盖四入口的真实候选/CSS、限额、去重/撤销/草稿/apply/冲突/销毁与移动端面板。


文字排版（0.15）：0.15 新增 font-family（字体）、text-decoration-line（无装饰/下划线/上划线/删除线）和 white-space（正常换行/单行/保留空白与换行）字段，六组共35字段。font-sans/font-serif/font-mono 为内置字体候选；theme/theme.extend.fontFamily 的字符串或字符串数组映射 font-*，extend 优先，64个配置候选上限先于 Core 校验与搜索，内置另计。字段只设置字体族，不下载字体文件；项目字体文件与加载等待由页面负责。

```js
// Core 前配置：theme: {extend:{fontFamily:{brand:['Georgia','serif']}}}
const review = await JquanUI.import('reviewMode');
review.configure({enabled:true,root:'#preview'}); review.open(); review.select('#title');
review.setUtility('font-family','font-brand');
review.setUtility('text-decoration-line','underline');
review.setUtility('white-space','whitespace-pre-wrap');
// copyPlan/saveDraft 后，在页面卸载时 review.destroy()。
```

换行字段引入后，truncate 同时命中 overflow 与 white-space，按跨字段复合类保留，不作为单字段候选/修改接管；已有 truncate 保持在 DOM，其他 CSS 层叠可能影响预览。旧方案若将 truncate 写入 utility:overflow 的 before/after，会以 invalid-value 拒绝预检且不写入页面。需要拆分编辑时，由开发者先改成 overflow-hidden text-ellipsis whitespace-nowrap，再基于新页面重新生成方案。旧草稿仍可读取，不自动迁移；其他字段沿用原 schema、去重/撤销/草稿/apply。

完整示例 examples/review-mode-typography.html；专项 npm run check:review-typography。

Review 0.17 的 `copyPlan()` 在 Copy 失败或异常时，在审查面板展示只读完整方案并自动全选；客户可按 Ctrl/Cmd+C 或长按手动复制，点击“返回编辑”退出。0.18.1 连续复制时只有最新有效请求更新 UI，新请求立即清除旧手动面板；旧请求仍返回各自结果。跟踪值/元素/会话变化使旧结果失效；成功复制仍返回 true，失败仍返回 false。示例：examples/review-mode-manual-copy.html，回归：npm run check:review-manual-copy。

Review 0.16.1 在后台 DOM/组件刷新时保留当前聚焦且已改动的文字/属性/数值输入和光标；干净输入跟随页面更新。临时输入只在点击应用后写入，不进 exportPlan/saveDraft。切换元素/视图、显式编辑、close/configure/destroy 会重新读取页面，不当作持久化草稿；不承诺保留输入法组合会话或原生撤销栈。示例：examples/review-mode-input-drafts.html，回归：npm run check:review-input-drafts。

Tabs 2.5+ / Review 0.16+：`handle.setLoop(boolean)` 和 `state().loop` 无损设置首尾循环；`review.setComponentOption('tabs', 'loop', false)` 让末页停留，true 恢复循环。字段 `component:tabs.loop` 复用 schemaVersion:2 的去重、撤销、草稿及 apply。setter 不移动当前页/重建内容/重置计时，loop=false 的自动播放在末页继续计时；只改运行时 options，不改 data-tabs-loop。旧 Tabs 无 setter/state.loop 时隐藏该项并拒绝编辑/应用。

componentOptions()/setComponentOption 仅适配真实已挂载根，不自动 import/mount、不调用 update：Carousel 1.8+ 的 autoplay/indicators/progress:boolean、interval:有限number≥1200 用 getHandle 与稳定 setter；旧 Carousel 隐藏 indicators/progress；Tabs 2.4+ 的 autoplay/interval、Tabs 2.5+ 的 loop；Select 1.4+ 用 get/setDisabled/setSearchable/setClearable；Popover 1.6+ 仅编辑 `open:boolean`。Carousel 的新开关不重建内容或移动当前页，字段参与 schemaVersion:2 的历史、去重、草稿、apply 与冲突检查。禁止用 mount() 探测实例，也不凭 DOM 标记猜测。销毁或同节点重挂后旧记录为 conflict，即使新值相同也拒绝撤销/还原/编辑；重新 configure 才捕获新实例。Review 不会重新挂载、重建面板或接管 OverlayManager 配置。

组件方案字段仍使用规范名称：`component:carousel.indicators`、`component:carousel.progress`、`component:select.disabled`、`component:popover.open`；Select 的可见触发器通过 `control()` 映射回原生节点。

记录按原节点/字段保留首次 before、最终 after，回到原值不导出；changes 给 ready/conflict/detached。新编辑清 redo；reset 预检全部记录；configure/destroy 仅恢复仍匹配的值。revert(target,field) 可撤销逐项恢复。exportPlan/copyPlan：组件净修改用 schemaVersion 2，其余1；消费者核对版本/定位/原值后改源码，applyPlan 支持严格预览应用，源码回写由项目负责。示例 examples/review-mode*.html；首屏请求缺席不等于已测得渲染加速。

Ctrl/Cmd+Z 撤销，Shift+Z/Y 重做已应用历史；选择模式限 root/工具层，浏览模式限工具层。input/textarea/select、contenteditable 后代、textbox/searchbox/combobox/spinbutton 保留原生撤销；Alt/IME/重复/已取消/空历史不处理。未应用草稿属输入框，冲突沿用 undo/redo；close/destroy 清理监听。title/aria-keyshortcuts 提供提示。

复用提示：`复用 Core.resolve、Copy、稳定组件句柄和 Popover 的公开 open/close/getState，保留按需、原值/最终值去重与外部冲突；同步文档/类型/skill/示例，运行 check:review-mode、check:docs、check:component-docs 与严格类型验证。`

0.11 草稿：saveDraft(key?) / loadDraft(key?) / clearDraft(key?) 显式写入、读取、删除原生 localStorage 里的最终值 ReviewPlan。默认 key=default，同源共享，应按项目/页面命名；key 为 1–80 个 ASCII 字符，首位字母/数字，其余字母/数字/点/下划线/冒号/连字符。上限 1,048,576 个 UTF-16 代码单元。save 需 enabled 且有净修改，close 后可保存；load/clear 无需启用，destroy/reset/configure 不自动删除。load 校验版本、定位、规范字段和值类型，返回独立快照；失败为 false/null 并保留旧存储。不保存未应用输入或撤销栈、不自动应用，也不新增组件依赖。完整闭环见 Review Mode persistent-draft 示例。

0.12 严格方案应用：`applyPlan(plan, options?)` 默认 `dryRun:true`，只返回 `{ok,dryRun,applied,issues,changes}` 预检报告。plan 可直接使用 `loadDraft()` 返回值或 `exportPlan('json')` 字符串；调用前要有 `configure({enabled:true, root})`，且当前会话没有未提交记录；预检要求页面路径一致、`target.stable=true` 且唯一、`status:'ready'`、schema/字段值合法，并逐项核对当前值等于 `before`。任一项失败时 `applied=0` 且不改 DOM；确认报告后显式传 `{dryRun:false}`，并保持 `open()`，才应用当前预览 DOM。应用复用审查记录和 undo/redo；写入失败会回滚仍由会话持有的字段并报告 `rollback-conflict`。该 API 不写源文件、不跨 iframe/ShadowRoot，issues.code（例如 `session-not-empty`、`before-mismatch`、`target-not-found`、`write-failed`）用于向客户或交付工具显示定位、冲突与 schema 错误。

复用提示：`通过 JquanUI.import('reviewMode') 按需加载，按项目/页面设置草稿 key，检查 saveDraft/clearDraft 的 boolean 与 loadDraft 的 null，展示 draft.page/changes；应用前先 applyPlan(draft) 做 dry-run，确认 issues 为空后再 applyPlan(draft,{dryRun:false})，保留按需和原值核对，验证刷新后的方案读取与 DOM 状态。`

应用最小闭环见 `examples/review-mode-apply.html`。已有会话先保存方案再 reset 清空记录及整个撤销/重做栈；原值对照包括文本片段和原子字段数组，href/文本沿用原编辑白名单，新增原子类限单个语义基础候选。仅接受当前规范的唯一审查键/id 定位，JSON 输入上限 1,048,576 个 UTF-16 代码单元；closed 会话只做 dry-run。

Popover 查询示例：`const live = popoverApi.getHandle(target); if (live?.element() === target) console.log(popoverApi.getState(live));` 查询返回现有句柄或 null，不自动挂载；业务视图卸载时仍销毁原 mount 句柄。审查专项执行 `node scripts/check-review-mode-popover-browser.cjs`，覆盖四入口的标记伪装、原节点销毁/重挂、草稿、apply、外部变更、回调重入与实际按钮按需导入。

