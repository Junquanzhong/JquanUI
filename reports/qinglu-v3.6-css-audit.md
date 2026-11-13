# 只此青绿 v3.6 CSS 实战审计

审计日期：2026-08-18  
项目：`E:\OneDrive\Documents\web\客户\只此青绿\demo\v3.6`  
运行时：`js/jquanui-core-4.5.1.min.js`  
对照引擎：JquanUI Core 4.14.1

## 结论

CSS 体积大不是单一的“引擎不支持”，也不是“项目没有使用原子类”。项目已经大量使用 JquanUI，但迁移尚未完成，同时保留了大量品牌构图、复杂渐变、关键帧、深层组件覆盖和跨元素状态规则。

- 10 个业务 CSS 文件共 231,479 bytes、7,791 行，不含 Swiper vendor CSS。
- 解析到 1,705 条普通/关键帧规则和 4,099 个 CSS 声明。
- 35 个 HTML/JS 文件中提取到 2,331 个 class token；当前 Core 可解析 1,803 个，占 77.3%。
- 528 个不可解析 token 主要是 `.talent-card__figure`、`.tour-map-wrap` 等语义/BEM 钩子及第三方类，不应简单视为引擎故障。
- 367 个简单目标规则包含 892 个声明，占全部声明 21.8%。这是最明确、最低风险的“尚未完全原子化”部分。
- 222 个伪元素规则包含 994 个声明。4.5.1 时代需要保留较多 CSS；4.13.0 起自动 `before:` / `after:` content、属性状态和滚动条能力已显著降低这部分门槛。
- 803 个声明属于渐变、背景图、mask、filter、shadow、clip-path 等复杂视觉，占 19.6%。多数技术上可用任意属性表达，但保留紧凑 CSS 往往比超长 class 更易维护。
- 119 个选择器块在同一 at-rule 环境重复出现，169 个属性被再次声明。`shop.css` 有 51 个重复块，`artists.css` 有 24 个，说明迭代式追加覆盖也是体积增长的重要来源。

## 归因

### 1. 未完全使用原子引擎

至少 892 个简单目标声明可以优先迁入 HTML，包括 display、position、尺寸、间距、字体、颜色、边框、圆角、透明度和常规 transition。迁移时先用语义尺度，再用任意值；不要把每个历史像素值机械翻译成 `[...]`。

优先处理：

1. `v2-system.css` 中可落到具体元素的静态布局和排版。
2. `shop.css`、`artists.css` 中重复声明的组件基础样式。
3. 各文件的移动端单属性覆盖，改为 `max-tablet:*`、`max-compact:*`。
4. `aria-current`、`aria-pressed`、`.is-active`、`.scrolled` 状态，改用属性、group/peer 或任意选择器变体。

### 2. 旧版 4.5.1 的真实限制

当前项目使用的 4.5.1 缺少后来加入的自动伪元素 content、完整 data/aria 关系变体、现代 `:has()`、滚动条变体及本轮新增的范围/语言/设备/at-rule 变体。项目规范虽然要求原子优先，但开发时确实有一批样式只能或更容易留在 CSS。

升级到 4.14.1 后，下列写法可以直接迁移：

```html
<span class="en not-lang-en:!hidden"></span>
<span class="zh lang-en:!hidden"></span>
<nav class="max-tablet:px-4 [.scrolled_&]:bg-black/90"></nav>
<div class="pointer-fine:hover:scale-105 hover-none:transition-none"></div>
<div class="supports-[backdrop-filter:blur(1px)]:backdrop-blur-md"></div>
<div class="[@media(max-width:760px)]:hidden"></div>
```

父级状态优先改为语义关系：

```html
<article aria-current="true" class="group">
  <img class="group-aria-current:scale-105 motion-reduce:transform-none">
</article>
```

只有无法调整 DOM/状态属性时，再使用 `[.chapter-panel[aria-current=true]_.chapter-media_&]:scale-105` 这类任意选择器。

### 3. 4.14.x 新补的通用能力

- `max-tablet:`、`max-[760px]:`、`min-[901px]:` 范围断点。
- `lang-en:`、`lang-[zh-Hans]:`、`not-lang-en:` 文档语言祖先状态。
- `pointer-fine:`、`pointer-coarse:`、`hover-none:`、`hover-hover:` 等输入能力媒体变体。
- `forced-colors:`、`transparency-reduce:` 无障碍环境变体。
- `supports-[...]`、`media-[...]` 语义任意查询。
- `[@supports(...)]:`、`[@media(...)]:` 通用任意 at-rule。
- `[.scrolled_&]:`、`[&>img]:` 等任意选择器回归保障。
- `theme.extend.keyframes` 与 `theme.extend.animation`，让项目关键帧进入配置、运行时、构建提取和 SSR，不再因 `@keyframes` 单独保留 CSS 文件。

## 应继续保留的 CSS

以下内容不应为了“零 CSS”强行展开成几十个难读的任意原子类：

- 多层品牌渐变、噪点、mask、复杂 clip-path 和艺术化背景。
- 依赖 SVG filter、动态 CSS 变量和指针轨迹的水墨交互。
- Swiper、ECharts、`[jq-*]` 等第三方或组件内部深层皮肤覆盖。
- 多个后代共同响应一个页面状态、且无法合理调整 DOM/ARIA/data 状态的规则。
- 大段特殊排版或需要按选择器集中维护的视觉装置。

目标应是“小型残余视觉 CSS”，不是绝对零 CSS。对这个项目，先清理重复覆盖并迁移简单规则后，业务 CSS 有条件从约 231 KB 降到约 90-130 KB；实际值必须逐页视觉回归后确定。

## 推荐迁移顺序

1. 先升级项目 Core，再跑 `JquanUI.debug()`，避免用旧版能力边界指导新迁移。
2. 清理 119 个重复选择器块和 169 个重复属性，确认最终生效值后再迁移。
3. 迁移 892 个简单目标声明，优先 `v2-system.css`、`shop.css`、`artists.css`。
4. 将语言、最大宽度、pointer/hover、supports 和可表达的伪元素规则迁到 class。
5. 将 15 组项目关键帧迁入 `theme.extend.keyframes`，动画 shorthand 注册到 `theme.extend.animation`。
6. 保留复杂视觉和第三方深层覆盖，按页面拆成明确的 residual CSS。
7. 每迁移一页，在 390、768、1280、1536px 及 reduced-motion 环境做视觉回归，不做全项目一次性机械替换。

## 复现

规则级审计脚本：`scripts/audit-real-css.cjs`。脚本使用 PostCSS AST，不按简单正则猜测规则边界。

```powershell
$env:JQUAN_POSTCSS_ROOT = Join-Path $env:TEMP 'jquan-css-audit\node_modules'
node scripts\audit-real-css.cjs `
  'E:\OneDrive\Documents\web\客户\只此青绿\demo\v3.6\css' `
  'E:\OneDrive\Documents\web\客户\只此青绿\demo\v3.6' `
  'E:\OneDrive\Documents\web\JquanUI V3.2\dist\core\JquanUI@Core.js'
```
