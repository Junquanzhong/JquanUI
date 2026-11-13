# JquanUI 可视化审查模式提案

## 当前基线：0.18.1 连续复制竞态修复

2026-11-12：copyPlan 的有效请求新增独立序号，只有最新请求可更新成功提示或手动复制面板。重试立即清除旧面板；每个 Promise 仍返回各自复制结果，过期请求不触碰新 UI。会话/文本校验和编辑历史沿用既有逻辑；无新增 API/schema/依赖，Core 与聚合入口保持原字节。专项 npm run check:review-copy-race；基线、修改与隔离回退证据见 verification/review-mode-copy-race-2026-11-12/VERIFICATION.txt。

当前 API 为独立 `reviewModeApi`，通过 `await JquanUI.import("reviewMode")` 使用；下方早期 `JquanUI.review.*` 示例属于原始提案。当前真实签名、参数、返回与限制见 `content/components/reviewMode.js` 的 navigate/schema。

日期：2026-10-30。状态：**阶段 A、B/C、首批组件适配、持久化草稿与严格预览应用已实现；源码回写仍为提案**。

当前实现基线为 Review Mode 0.18.1：六组共35字段，新增字体、文字装饰、空白与换行编辑及项目字体候选；保留项目字号/流体字号、圆角/radius 别名和阴影令牌。Carousel 1.8+、Tabs、Select 的已挂载实例支持受限配置编辑，Popover 1.6+ 通过只读 getHandle 捕获稳定实例，提供 `open:boolean` 编辑；Carousel 的 `indicators` / `progress` 通过稳定 setter 无损切换。`saveDraft/loadDraft/clearDraft` 支持显式保存和读取最终值方案，`applyPlan` 默认 dry-run 并在显式关闭 dry-run 后严格应用当前预览 DOM。草稿不会自动恢复页面，消费者仍需核对 schema、定位、原值和冲突；源码映射与源码回写尚未实现。

## 0.15 字体、文字装饰与换行（2026-11-09）

新增 font-family、text-decoration-line、white-space 三个规范字段，六组共35字段。内置候选提供三类字体、四类文字装饰与六类空白/换行模式；theme/theme.extend.fontFamily 发现项目字体，使用既有64候选限额、Core 最终解析和异常隔离。只设置字体族，不下载字体。编辑继续复用原首次 before/最终 after、撤销/逐项恢复、草稿及严格 applyPlan，不增加 schema 或组件依赖。

兼容边界：truncate 同时命中 overflow 与 white-space，作为跨字段复合类原样保留，不再作为单字段接管；旧 utility:overflow 方案含 truncate 时预检 invalid-value 且不写 DOM，旧草稿仍可读取，不自动迁移。需要独立编辑时先在源页面拆成 overflow-hidden text-ellipsis whitespace-nowrap，再重新生成方案。其他 CSS 级联仍可能影响预览。

新完整示例 examples/review-mode-typography.html 先配置 Core，点击才加载 reviewMode，提供方案复制与卸载清理。四入口各74项专项覆盖候选/限额/覆盖/异常、实际字体与装饰/换行 CSS、变体保留、去重/撤销/草稿/apply/冲突/销毁和旧 truncate 方案预检；1280/390px 实际下拉编辑与无横向溢出通过。完整 check、完整 check:review-mode（含原主题68断言和所有旧套件）、严格 TypeScript、文档/组件文档、包预算与 bundle 对账通过。Core/min/Full/Components 原字节保持本轮基线；发布 verify 未执行。

原始哈希、基线/修改/隔离回退、四件交付物及完整字面输出见 verification/review-mode-typography-2026-11-09/VERIFICATION.txt。本切片完成后从0.15继续后续主线；完整5.0和源码写回仍为规划。

## 0.14 项目主题候选（2026-11-09）

Core 支线补齐普通设计令牌后，Review 的 utilities() 与面板下拉项接入 theme / theme.extend 的 fontSize、fluid.fontSize、borderRadius（兼容 radius）、boxShadow。圆角与阴影 DEFAULT 对应 rounded/shadow；每个新增字段先去重并限64个配置候选，再执行 Core.resolve 字段校验和搜索，内置候选另计，extend 优先。字号支持单值/字号+行高，字重或字间距复合字号继续排除；解析异常被隔离，不打断面板。最终值去重、撤销/逐项恢复、草稿与严格 applyPlan 复用现有 API 和 schema，无新增组件依赖。

新示例 examples/review-mode-theme-tokens.html 先配置 Core，点击按钮后才导入 reviewMode，提供标题/卡片、方案复制与 pagehide 清理。四入口各68项专项覆盖候选来源/覆盖/去重/限额、解析异常、实际 CSS、变体保留、编辑历史、草稿/apply/冲突/销毁；1280/390px 实际下拉编辑与无横向溢出通过。最终源码完整 check、check:review-mode、文档/组件文档/类型/包预算和 bundle 对账通过；Core/min/Full/Components 原字节保持不变，未新增 Core 性能或完整 5.0 完成声明。

原始哈希、行为基线/修改/隔离回退与四件交付物见 verification/review-mode-theme-tokens-2026-11-09/VERIFICATION.txt。此前 Core 支线待文件可读后处理的云占位 CHANGELOG 副本保持原位；本轮不影响该待办。

## 2026-10-31 按需交付补齐

Review Mode 继续作为独立组件。Core、压缩 Core、Full、Components 均不内置其实现；只在业务实际调用 `await JquanUI.import("reviewMode")` 时加载。清单 components 保留全目录，onDemandOnly 让构建器排除审查运行时，并拒绝 Full 显式加入该项。旧聚合入口先 import，再访问 reviewModeApi。

完整预览 examples/review-mode.html 改为按钮或应用 URL 入口触发首次 import，普通访问不加载 reviewMode/Copy；已注册的 Copy 复用。URL 参数与 JQUAN_CONFIG 本身不触发 Core 下载。失败可重试、close 重开保留历史，destroy 后重配。此次范围是按需交付；记录当时组件适配仍待后续，现已在 0.6–0.11 分片完成。初始代码字节减少与浏览器请求数有实测证据；渲染时间收益未作结论。

## 0.4.0 搜索、色样和修改清单

已实现 utilities(query?) 过滤候选；界面支持中文字段/候选/原子类搜索与最多10个过滤色样。修改清单显示首次原值和最终值、冲突/脱离与结构定位提示，支持定位元素和 revert(target, canonicalField) 逐项还原，且还原可撤销。冲突/脱离/替代节点不接管；close/open 保留界面状态，configure/destroy 清空。Core 与聚合包继续不内嵌审查运行时。详见组件 schema 与完整示例。

## 0.3.0 原子类扩展与编辑器视觉

Review Mode 继续按需加载，编辑器提供 32 个字段，分为文字与排版、布局与排列、宽度与高度、间距、颜色与质感、图片与溢出。候选值由 Core.resolve 实际校验，并从 theme.extend.colors / spacing 发现项目令牌；方向间距按字段族替换，响应式和状态变体保留。面板使用可折叠分组、元素摘要、高级信息、主色复制操作和移动端自适应。

## 0.2.0 编辑与方案导出

```js
const review = await JquanUI.import('reviewMode'); // 自动安装 copy 依赖
review.configure({ enabled: true, root: '#preview', allowURL: true });
review.open();
review.select('[data-jq-review-key="hero-title"]');
review.setText('客户确认的新标题');
review.setUtility('font-size', 'text-md');
review.setUtility('font-size', 'text-lg');
review.undo(); review.redo();
console.log(review.changes()); // 同一元素的字号只保留 text-lg，before 保留首次原值
await review.copyPlan(); // 客户可读摘要 + JSON，交给开发者或 AI 修改源文件
console.log(review.exportPlan('json'));
```

当前编辑六类基础原子类：字号、文字/背景颜色、字重、对齐和整体圆角；候选值交给 Core.resolve 校验，并同步 compile 供即时预览。新增候选使用语义基础类，同字段现有基础类按实际 CSS 声明识别，响应式和 dark 等变体保留。新增任意值、变体编辑和组件 options 不在本轮 UI 中。

文本修改直接文本节点，`selection.textNodes` 给出 childNodes 索引。混合内容需指定 `setText(value, index)` 或点选内部文字元素，保留粗体、链接节点和监听器；不将内容替换成 innerHTML。可编辑属性为 title、aria-label、aria-description，以及适用元素的 alt/href。其他属性保留只读。

记录以节点身份和字段归并，保留首次 before 与最终 after，改回原值后不导出。`changes()` 输出 `text:索引`、`utility:CSS属性` 或 `attribute:名称`，每项含定位与 ready/conflict/detached 状态；同 id 的替代节点不会接管旧记录。结构定位不稳定或字段已被页面覆盖时，摘要提示核对。JSON schemaVersion 为 1，包含 createdAt、page 与 changes，不包含整页 HTML，也不是可直接执行的脚本。

close/重新 open 保留预览与历史；reset 在全部记录仍匹配时整体还原，否则返回 false 且不部分覆盖。configure/destroy 恢复仍由本会话持有的字段，保留页面外部覆盖及已脱离页面的节点，再清理记录。0.2 当时尚无草稿持久化；当前 0.11+ 可用 saveDraft/loadDraft/clearDraft 保存方案，读取不自动应用。原设计中的 `JquanUI.review.apply` 继续作为概念代码，实际 API 归属 reviewModeApi。

## 当前可用入口（阶段 A，0.1.0）

```js
const review = await JquanUI.import('reviewMode');
review.configure({ enabled: true, root: '#preview', allowURL: true });
review.open();
review.select('[data-jq-review-key="hero-title"]');
console.log(review.state());
// 路由离开或结束验收：
review.destroy();
```

页面按钮 `[data-jq-review-open]` 与 `?jqui-review=1` 已实现；两者都需要项目显式 enabled，URL 在 configure 时检查。脚本加载前可设置 `window.JQUAN_CONFIG.reviewMode`；完整示例见 `examples/review-mode.html`。API 由独立组件 `JquanUIComponents.reviewModeApi` 提供，Core 仅同步 importer 目录，不增加 `JquanUI.review` 别名。

阶段 A 的选取、高亮、内容摘要、类名、HTML 属性、8 项计算外观和组件标记仍可使用；0.2 在其上增加上述编辑/撤销/方案复制。当前仍仅支持同 document 普通 HTML 根，ShadowRoot/跨 iframe 与源码回写继续留在后续阶段；组件 options、持久化草稿和严格 `applyPlan` 已在 0.6–0.12 分片中实现。以下原始设计中的 `JquanUI.review.*` 仍为概念代码，实际 API 以当前组件 schema 为准。

## 背景

页面交付给客户或负责人审查时，修改意见经常停留在“这里大一点”“这个按钮换个颜色”“这段文字改一下”。客户不熟悉开发者工具，开发者只能反复猜测位置和意图。JquanUI 已经拥有原子类、组件属性和运行时能力，适合增加一个面向审查人的前台编辑层，把视觉意见转换成可复制、可合并的修改方案。

## 建议入口

入口分成三层，默认关闭：

1. 预览 URL 使用 `?jqui-review=1`，由项目配置显式开启审查入口。
2. 开发者在控制台调用 `JquanUI.review.open()`、`JquanUI.review.close()` 或 `JquanUI.review.toggle()`。
3. 页面可以放置 `data-jq-review-open` 按钮，调用同一个公开入口，不要求客户接触控制台。

生产页面不因 URL 参数自动获得编辑权限；入口应由项目配置决定，并允许项目设置审查根节点、可编辑字段和导出回调。该能力先定位为预览/验收工具，不写入正式数据接口。

## 审查界面

打开后显示底部工具栏，工具栏包含“选择元素”“退出”“撤销/重做”“复制修改方案”。点击元素时显示轻量浮层和右侧或底部属性面板：

- 内容：可编辑文本，结构化内容按文本节点或明确的 HTML 白名单处理。
- 样式：当前原子类、语义属性和可用候选类；字号、颜色、间距等优先映射到 JquanUI 令牌。
- 属性：`id`、`role`、`aria-*`、`data-*`、链接目标等经过配置允许的属性。
- 组件：识别 `jq-*` / `data-*` 组件节点，展示实际可用的 options 和状态；不存在公开 API 的字段不出现在编辑面板。
- 定位：显示可读的元素名称、文本摘要、组件名称和稳定审查键，避免让客户理解 CSS 选择器。

选中元素时只高亮当前目标，暂停页面原有点击行为，按 Escape 返回页面交互。编辑层自身使用独立根节点和命名空间，不能被审查选择器再次选中。

## 修改记录与去重

每次编辑生成规范化记录：

```js
{
  target: '[data-jq-review-key="hero-title"]',
  field: 'font-size',
  value: 'text-lg',
  source: 'utility',
  previous: 'text-md'
}
```

记录主键为 `target + field`，同一元素的同一字段只保留最后一次有效值。比如 `text-md → text-lg → text-xl` 最终只导出 `font-size: text-xl`，同时保留 `previous` 和可读历史供撤销使用。类名字段按 CSS 属性族归一化，避免 `text-md` 与 `text-lg` 被误认为两个独立修改；无明确属性族的新增类才按类名去重。

目标优先使用显式 `data-jq-review-key`，其次使用稳定 id，再其次由组件名、语义标签和结构路径生成。导出前若目标不稳定，界面必须提示开发者补充稳定审查键。

## 复制修改方案

“复制修改方案”同时提供两种格式：

- 给客户看的摘要：按页面区域列出“标题字号改为 `text-lg`”“按钮文字改为……”。
- 给开发者执行的 JquanUI 方案：输出可重复运行的 JSON 或代码片段，包含目标、字段、最终值和原值。

建议的代码形式：

```js
JquanUI.review.apply([
  { target: '[data-jq-review-key="hero-title"]', set: { classes: { 'font-size': 'text-lg' } } },
  { target: '[data-jq-review-key="hero-cta"]', set: { textContent: '立即开始' } }
]);
```

导出顺序按首次修改位置排序；同一目标的字段按稳定字段顺序输出。复制内容应带有方案版本、页面路径和生成时间，便于提交到代码审查或工单系统。

## 分阶段实现

| 阶段 | 交付 | 验收 |
| --- | --- | --- |
| A | review session、入口、元素选择、高亮、只读属性面板 | URL/控制台/按钮三种入口，退出后页面行为恢复 |
| B | 文本、原子类、允许属性编辑与撤销/重做 | 只修改白名单字段，实时预览，键盘和移动端可用 |
| C | 规范化记录、字段族去重、JSON/代码复制 | `text-md → text-lg` 只导出 `text-lg`，撤销仍可回到历史 |
| D | 组件 options 适配器、项目配置、持久化草稿 | 已完成 Carousel/Tabs/Select 适配与显式草稿读写；正式发布仍由项目核对方案后提交完成 |

## 与现有能力的关系

该模式应复用 Core 的 `resolve()`、组件 manifest、组件文档 schema 和现有 importer；它属于独立的 Review/Data adapter，不把审查逻辑塞入 Core 编译器。组件适配器必须读取真实类型和公开 API，不能根据规划虚构组件字段。实现新 API 后再同步 `content/`、类型、文档和 `skills/jquanui/SKILL.md`。

阶段 A 的真实 API 与参数表见 `content/components/reviewMode.js` 和 `dist/components/reviewMode.d.ts`；新编辑与导出 API 实现时继续更新本文件、组件文档与 skill。


2026-10-31 审查 0.5：已实现 navigate(parent/first-child/previous-sibling/next-sibling)、selection.navigation 四向快照和客户“选中范围”按钮。限制在配置 root 内，跳过不可选节点，不跨父子层、不修改历史；滚动到目标并保留导航按钮键盘焦点，DOM 更新同步禁用状态。关闭清空当前选中，重开后重新选择。文档、skill、类型、完整示例和四入口浏览器回归同步；组件 options/草稿/apply 继续作为后续计划。


2026-10-31 审查0.6：首个 Carousel 1.7 配置适配器完成，componentOptions/setComponentOption 支持 autoplay/interval 的真实类型、去重、撤销/逐项恢复和原实例冲突检查。新增只读 carouselApi.getHandle，精确核对 element；不调用会重建内容的 update，不自动下载或挂载业务轮播。含组件修改的方案使用 schemaVersion2，其余仍1；配置恢复不回放播放计时/原暂停状态。新增 examples/review-mode-components.html，文档/skill/类型与生成包同步。其他适配、无损指示点/进度条接口、草稿和 apply 仍待后续。


2026-10-31 审查0.7：Tabs 2.4 配置适配完成，componentOptions/setComponentOption 接入 autoplay/interval，增加 tabsApi.getHandle、稳定句柄 setter 与 update 事件；不重建面板、不自动加载/挂载，外部更新和重挂实例按冲突处理。文档、skill、类型、示例同步；其他组件选项、草稿和 apply 仍待后续。

2026-10-31 审查0.8：Select 1.4 配置适配完成，componentOptions/setComponentOption 接入 disabled/searchable/clearable；适配通过 selectApi.get() 与稳定句柄 setter 工作，保留原生 options、value 与表单同步。新增 jquan:select:update 冲突刷新、类型/文档/skill/示例及独立验证；其他 Select 选项、持久化草稿和 apply 仍待后续。

2026-10-31 审查0.9：Select 1.5 新增 control() 只读返回现有触发按钮。Review 点击/Enter/显式 select 可见控件时映射到原生字段，高亮跟随可见按钮，记录保留原节点身份；不越 root，不按伪造标记猜测，navigate 仍按实际 DOM。文档、skill、类型、示例、原生交互回归与独立回退验证同步。

2026-11-01 审查0.10：新增 Ctrl/Cmd+Z、Shift+Z/Y 键盘历史，复用 undo/redo 冲突检查；保护输入框/富文本原生撤销，限定 root/工具层和浏览模式边界，忽略 IME/Alt/重复按键。按钮提示、文档、skill、类型说明、示例与真实键盘回归同步，关闭销毁清理监听。


## 0.11 持久化草稿切片（2026-11-01）

Review Mode 0.11.0 提供 `saveDraft(key?)`、`loadDraft(key?)` 与 `clearDraft(key?)`。它们只保存和读取版本化的最终值计划，不自动改变预览、历史或组件实例。key 经过长度与字符校验，localStorage 不可用或 payload 损坏时返回明确的 false/null。0.12 在此基础上增加下节的严格 `applyPlan`；草稿读取仍不自动应用，源码映射与回写由项目工具完成。

## 0.12 严格方案应用切片（2026-11-04）

新增 `applyPlan(plan, { dryRun })`，默认 dry-run。它可直接消费 `loadDraft()` 或 `exportPlan('json')`，先校验页面、schema、稳定唯一 locator、ready 状态和每一项的 `before` 原值；预检失败不触碰 DOM。显式 `dryRun:false` 才执行已通过预检的批量写入，写入中断会恢复仍由会话持有的字段并返回 `write-failed`，外部覆盖保留并报告 `rollback-conflict`。调用要求空审查记录/历史，显式写入要求 open()；成功应用可撤销。应用只作用于当前预览 DOM，不写源码、不跨 iframe/ShadowRoot；同步类型、组件文档、skill、README、CHANGELOG 与浏览器回归。

## 0.13 Popover 适配切片（2026-11-07）

新增 `componentOptions()` / `setComponentOption('popover', 'open', boolean)`。适配器只识别已经由 Popover 组件挂载的根节点，并通过 `popoverApi.getState/open/close` 修改开关状态；不自动导入或 mount、不重建面板、不改变 OverlayManager 配置。`jquan:popover:open` / `jquan:popover:close` 会刷新审查面板和冲突状态；销毁或同节点重挂不会接管旧记录。详见 `examples/review-mode-popover.html`，该示例先独立按需挂载 Popover，再按需加载 Review Mode。

2026-11-08 收口：Review Mode 0.13.1 通过 Popover 1.6.0 的只读 getHandle 捕获原始句柄，修正 DOM 标记误判与重挂接管旧历史。四入口各 40 项专项断言及完整 check:review-mode 通过；文档/skill/类型/按需示例与生成包同步。固定 150ms 的布局回归等待改为有上限的实际布局检查，继续断言无越界/重叠。真实基线、修改及隔离回退行为见 verification/review-mode-popover-lifecycle/VERIFICATION.txt；主线暂存后进入 Core 配置与令牌支线。


## 0.16 Tabs 首尾循环切片（2026-11-09）

Tabs 2.5 增加稳定句柄 setLoop(boolean) 与 state().loop；Review 0.16 在已挂载根节点增加“首尾循环”，用 component:tabs.loop 参与 schemaVersion:2 的历史、最终值去重、草稿和严格 apply。false 时末页停留，true 恢复首尾循环；不调用 update、不重建内容、不移动当前页、不重启播放计时，外部更新/销毁重挂继续按冲突处理。旧 Tabs 缺少 setter/state.loop 时隐藏字段并拒绝编辑/应用。文档、类型、skill、按需示例与生成分发入口同步；证据见 verification/review-mode-tabs-loop-2026-11-09/VERIFICATION.txt。后续仍按切片扩展组件适配，源码定位和回写仍为规划。


## 0.16.1 动态审查输入修复（2026-11-10）

0.16 的后台 DOM/组件更新重建面板时会覆盖未应用输入。现保留当前聚焦且已改动的文字、属性和数值输入，以及可读取的选区；干净输入继续接收源值。仅后台刷新启用此保护，显式应用/撤销/选择/关闭等继续读真实页面；未应用值不进入方案、历史或持久化草稿。不承诺跨字段暂存、IME 组合会话或原生撤销栈。四入口专项和1280/390px原生输入示例见 verification/review-mode-input-drafts-2026-11-10/VERIFICATION.txt；公开类型和 Core/min/Full/Components 保持原值。


## 0.17 手动复制兜底（2026-11-11）

copyPlan() 仍按需使用 Copy；自动复制失败或异常时，Review 面板显示完整只读方案文本并自动全选，客户可以直接按 Ctrl/Cmd+C 或长按复制。选择其他元素、跟踪字段变化、close/destroy 或新请求会使旧快照失效；过期异步结果不重新打开面板。成功复制提示和 Promise<boolean> 保持兼容，不改变 ReviewPlan schema。新增按需示例和四入口回归，证据见 verification/review-mode-manual-copy-2026-11-10/VERIFICATION.txt。

## 0.18 Carousel 控制切片（2026-11-11）

Carousel 1.8 增加 `setIndicators(boolean)` 与 `setProgress(boolean)`，只替换本实例生成的圆点/进度条，保留当前页、原内容、稳定句柄和自动播放计时。Review Mode 0.18 在已挂载 Carousel 1.8+ 根节点显示 `component:carousel.indicators` / `component:carousel.progress`，复用 schemaVersion 2 的首次原值/最终值去重、撤销、草稿、严格 apply 和冲突检查；旧 Carousel 隐藏字段。同步类型、组件文档、skill、按需示例与四入口浏览器回归。
