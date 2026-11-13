# JquanUI Core 4.72.0 问题清单

> 来源：公式积木项目（`E:\OneDrive\Documents\web\excel`）实际开发中撞到的问题。
> 每条都给了**实测证据**和**定位行号**，行号基于当前 `dist/core/JquanUI@Core.js`（280712 B）。
> 复现工具：`E:\OneDrive\Documents\web\excel\js\__diag.html`（无头 Edge 截图即可看到全部结果）。

---

## P0-1　`theme.extend` 白名单不含 `borderRadius` / `boxShadow` / `fontSize`，静默丢弃

**现象**：配置里写
```js
theme: { extend: { borderRadius: { card: '18px' }, boxShadow: { soft: '0 16px 40px rgba(...)' } } }
```
`rounded-card`、`rounded-control`、`shadow-soft` 全部无样式，**浏览器控制台零输出、零报错**。

**定位**：`dist/core/JquanUI@Core.js`
- extend 处理段 `L683–733` 只处理 `fontFamily / spacing / colors / containers / fluid / breakpoints / keyframes / animation`
- 令牌表：`radius` `L234–237`（内置只有 `none/sm/DEFAULT/md/lg/xl/2xl/3xl/full`）、`shadows` `L239–248`（`sm/DEFAULT/md/lg/xl/2xl/inner/none`）

**实测证据**（`__diag.html`）
```
rounded-card        : null
rounded-control     : null
rounded-foo(shortcut): OK  css=.rounded-foo { border-radius: 18px; }
rounded-2xl         : OK  css=.rounded-2xl { border-radius: 1rem; }
shadow-soft         : null
shadow-md           : OK  css=.shadow-md { --jquan-shadow: 0 4px 6px -1px ... }
```

**影响**：凡是把圆角/阴影做成"设计令牌"的项目，类名写法完全正确但没有任何视觉效果，且极难定位——只有把 `JquanUI.resolve()` 逐个跑一遍才发现返回 `null`。

**建议修法**
1. extend 段补三个分支：`borderRadius` → 写入 `radius`；`boxShadow` → 写入 `shadows`；`fontSize` → 写入字号表（或在 `customUtilities` 里注册 `text-*`）。
2. 或者明确宣告不支持，但**必须在白名单外的键上给出 `configWarnings`**，见 P0-2。
3. 文档/skill 里 `jquan-migrate` 会读 Tailwind 的 `borderRadius/fontSize`（SKILL.md L299），容易让人误以为运行时也支持，建议在运行时能力表里对齐说明。

**当前临时绕法**：shortcut 指到任意值，如 `'rounded-card': 'rounded-[18px]'`、`'shadow-soft': 'shadow-[0_16px_40px_rgba(86,103,214,0.12)]'`（实测可用）。

---

## P0-2　配置里的未知键 / 非法值完全没有反馈

**现象**：写错键名（`borderRadius`、`boxShadow`、拼错的 `shadows`）、值类型不对，一律被安静跳过，没有 console，没有 debug 报告条目。

**定位**：`L683–733` 全部是 `if (userConfig.theme?.extend?.xxx)` 形式的静默判断，没有 else 分支，也没有收集"未识别键"。

**影响**：这是最贵的一类问题——用户会以为自己写对了，转头去怀疑类名、怀疑 Core 版本、怀疑构建产物。

**建议修法**
- `buildDebugReport()` 增加 `configWarnings: [{ path: 'theme.extend.borderRadius', reason: 'unsupported-key' }]`。
- 开发模式（`!JquanUI.isReady()` 或 `config.dev === true`）在 Core 初始化时 `console.warn` 一次汇总。

---

## P0-3　未解析类在运行时完全静默，`debug()` 也查不到

**现象**：`JquanUI.resolve('rounded-card')` 返回 `null`，但既不 `console.warn`，`JquanUI.debug()` 的未解析列表里也是空的。

**定位**
- `resolveUtility()` 未命中时直接 `return null`（无任何日志）。
- 未解析记录只在 `resolveAndInsertClass()` 里做：`L4008–4012`
  ```js
  if (!result || !result.css) {
      processedClasses.add(cls);
      rememberDebugItem(debugState.unresolvedClasses, { className: cls });
      return { status: 'unresolved', ... };
  }
  ```
  也就是说：**只有走了扫描/队列的类才会被记进 debug**，手动 `resolve()` 的失败不入账。

**实测证据**
```
console.warn 次数   : 0
debug 未解析条数    : 0  []
```

**影响**：开发时唯一可行的发现手段是"自己写一个探针页批量 resolve 再截图读结果"——这次就是这么干的（`__probe.html` / `__diag.html`）。对一个"类名驱动"的框架来说，这个缺口太大。

**建议修法**
- `resolve()` 支持 `{ trace: true }`，把 miss 记进 `debugState.resolveMisses`。
- 提供 `JquanUI.checkClasses(list)` → `[{ className, ok, css?, reason }]`，一次批量校验（这正是 AI/CI 最需要的入口）。
- 生产环境不 warn，开发环境（未 ready 或 dev 标记）对每个 miss 打一条。

---

## P1-1　`compile()` / `addSafelist()` 是异步的，与 `enhance()` 不一致

**现象**：`JquanUI.compile([...25 个新类])` 调用后立刻检查，一个都没生效；等 200ms 才全部生效。

**定位**
- `compile()` `L4466–4470`：`compileAndInject(new Set(classNames))` —— **没有传 `isSync`**
- `addSafelist()` `L4476–4482`：同上
- `enhance()` `L4535–4542`：`compileAndInject(classes, true)` —— **是同步的**
- 判定逻辑 `L4062–4071`：
  ```js
  if (isSync) { processQueueChunk({ timeRemaining: () => 999 }, true); return; }
  if (classQueue.size <= 20) { processQueueChunk({ timeRemaining: () => 999 }); return; }
  if (!isProcessingQueue) { isProcessingQueue = true; scheduleIdle(processQueueChunk); }
  ```

**实测证据**
```
compile 25 个新类    : 立即已处理 0/25   (之前 processed=0)
200ms 后已处理       : 25/25
```

**影响**：所有"动态插入 DOM → 调 compile 补样式"的写法，首帧一定丢样式（尤其首次渲染一屏卡片/步骤块时）。本项目实测症状：无头截图抓到未着色的步骤卡，需要额外调 `JquanUI.scan()` 兜底。

**建议修法**：`compile()` 本身就是显式命令，语义应是同步 —— 内部传 `true`；若担心卡顿，改成 `compile(classes, { sync = true })` 并给出预算参数。

---

## P1-2　队列阈值与分片大小不自洽

**现象**：20 个类以内同步，一超过就整批进队列；但一次 idle 只处理 `CHUNK_SIZE = 40`，剩下继续 `scheduleIdle`。

**定位**：`L3986` `CHUNK_SIZE = 40`；`L4069` 阈值 `classQueue.size <= 20`；`L4053` 分片中断；`L4058` 递归 `scheduleIdle`。

**影响**：21–40 个类要等**一次** idle；41+ 要等**两次**以上。首屏第一次渲染的函数库（本项目 52 个函数 × 多张卡）正好落在这个最坏区间，抖动最明显。

**建议修法**：同步阈值提到 `CHUNK_SIZE`（21 和 40 没有理由不一样对待），或干脆"首次渲染同步、后续增量异步"。

---

## P1-3　缺少 `flushQueue()` 公开 API

**现状盘点**
- `scan` = `fullScan`（`L4465`）：会 `refreshBaseStyles()` + 重扫整个文档 + **清空 `unresolvedClasses/failedRules/conflicts`**（`L3948–3950`）。代价过大，还会丢诊断信息。
- `enhance(root)`（`L4535`）：只处理 root 里**已经存在**的类，无法把待处理队列冲出去。
- `processQueueChunk(..., true)` 内部支持 drainAll，但没暴露。

**影响**：想把"迟到"的样式立刻落地，只能拿 `scan()` 当锤子用（本项目就是这么绕的），副作用是额外一次全量重扫。

**建议修法**：暴露
```js
flushQueue({ maxMs = 8 } = {})  // → processQueueChunk({ timeRemaining: () => 999 }, true)
```
并返回 `{ processed, remaining }`。

---

## P1-4　`data-[k=<纯数字>]:` 属性变体静默失效，而 `resolve()` 仍返回非 null

**现象**：`data-[hit=1]:ring-2`、`data-[v=1]:bg-rose/40` 这类"属性值等于纯数字"的变体不产生任何样式；把值换成 `on` 或 `true` 立刻生效。但 `JquanUI.resolve('data-[hit=1]:ring-2')` 返回**非 null**，所以探针会报"没问题"。

**实测**（`E:\OneDrive\Documents\web\excel\js\__probe3.html`，属性静态写在 HTML 里，排除 JS 写属性失败的可能）

| 写法 | 结果 |
|---|---|
| `data-v="1"` + `data-[v=1]:bg-rose/40` | ❌ 不变色 |
| `data-v="on"` + `data-[v=on]:bg-rose/40` | ✅ 变红 |
| `data-v="true"` + `data-[v=true]:bg-rose/40` | ✅ 变红 |
| `data-v="1"` + `data-[v=1]:ring-4`（叠加已有 `ring-2`） | ❌ 环未加粗 |
| `data-hit="1"` + `data-[hit=1]:bg-rose/40` | ❌ 不变色 |

同页面截图：A/E 两行保持浅蓝底，B/C 两行变红，D 行环粗细与未加 ring-4 时一致。

**定位线索**：与 `候选类` → `resolveAndInsertClass`（`L3997`）→ `compileAndInject`（`L4062`）链路有关；数字值在解析 `data-[k=v]` 时被当作特殊值丢弃，生成的规则选择器与 `[data-k="1"]` 不相等。

**影响**：`data-state="1"`、`data-step="2"`、`data-level="3"` 这类最自然的状态写法全部失效，而且 **resolve 探针给出假阳性**——比 P0-3 的"返回 null"更难查：P0-3 至少探针能发现，这一条连探针都骗过。本次排查就因此先误判为"样式太淡看不清"，直到把值从 `1` 换成 `on` 才暴露。

**建议修法**
1. 数字值应正常生成 `[data-k="1"]`；若确有语义冲突，`resolve()` 必须返回 null 并进 P0-3 的未解析告警，不允许"resolve 成功但匹配不到"。
2. 加回归用例：`data-[k=1]:bg-red-500` 必须生成一条实际可命中的规则（静态 HTML 里断言 `data-k="1"` 节点的 computedStyle）。

**当前临时绕法**：属性值一律用字母或 `true`，如 `data-hit="on"`（已在公式积木中使用）。

---

## P2-1　未解析类被 `processedClasses` 永久标记，配置晚到无法自愈

**定位**：`L4009` `processedClasses.add(cls)`（在 `result` 为空的失败分支里也加）。

**影响**：`installLateConfigBridge`（`L4449`）支持的"Core 之后补配置"场景，如果某个类在配置到达前就被扫过一次（判为未解析并记入 processed），配置到达后**它不会重新解析**，只能刷新页面。表现是"改了配置没反应"。

**建议修法**：晚到 config 应用完成后，把 unresolved 集合里的类从 `processedClasses` 中移除并重新扫描一次。

---

## P2-2　`requestIdleCallback` 缺失/无头环境下退化为 `setTimeout(1)`，截图与首屏验收不可靠

**定位**：`L3979–3982`
```js
const scheduleIdle = window.requestIdleCallback || function(cb) {
    return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) }), 1);
};
```

**影响**：无头浏览器（`--virtual-time-budget` 下时间被虚拟推进）和任何 CI 截图流程都会随机抓到"未着色"的中间态。本项目验收时连踩两次，最后靠手动 `scan()` 才稳定。

**建议修法**：检测到无 `requestIdleCallback`、或 `navigator.webdriver`、或 `config.diagnostics.syncAll = true` 时直接走同步路径。

---

## P2-3　文档示例里的 Core 文件名与仓库实际不一致

**现象**：SKILL.md（L22）和组件示例都写
```html
<script src="./js/JquanUI@core.min.js"></script>
```
但 `dist/core` 目录实际是：

| 文件 | 大小 |
|---|---|
| `JquanUI@Core.js` | 280712 |
| `jquanui-core-4.5.3.min.js` | 98866 |
| `JquanUI@Core v4.5.js` | 164251 |
| `JquanUI@Core-DESKTOP-064SV5C.js` | 268070 |
| `JquanUI@Core-DESKTOP-064SV5C-2.js` | 276848 |

**没有** `JquanUI@core.min.js`（小写 c、带 min）。照文档抄必然 404。

**建议修法**：文档统一改为 `JquanUI@Core.js`；如果要保留 min 入口，就真的产出 `JquanUI@Core.min.js` 并在发布脚本里校验存在性。

---

## P2-4　`ph-*` 图标类名拼错时静默渲染成空白，没有校验入口

**现象**：`<i class="ph ph-star-fill"></i>` 什么都不显示——不是方块、不是问号，就是空白。元素和类名都在，字库里没有对应字形。

**实测**：`assets/phosphor/regular/style.css` 里 `.ph-star` 相关的只有 5 条

```
.ph.ph-star:before
.ph.ph-star-and-crescent:before
.ph.ph-star-four:before
.ph.ph-star-half:before
.ph.ph-star-of-david:before
```

`ph-star-fill` 命中 **0 条**。Phosphor 的填充风格是**两个类组合**（`ph-fill ph-star`），不是 `ph-star-fill`——而 `regular` 包里只有 `.ph.ph-xxx` 这一套带 `:before` 的规则，SKILL.md 也没给可用图标名清单，只能靠猜。

**影响**：图标整块消失，零反馈。排查时会先怀疑别的——本次就先把它读成"按钮被 flex 挤没了 / 卡片右侧被裁"，多开一轮截图才定位到是类名不存在。这与 P0-3（未解析类静默）是同一类毛病，只是发生在图标层，连 `resolve()` 都管不到。

**建议修法**
1. `dist` 里补一份图标名清单（JSON 或 `JquanUI.icons()`），CI 里能校验 HTML 中出现的 `ph-*` 是否都存在。
2. 文档明确写填充风格的正确写法是 `ph-fill ph-star`，并给出高频图标表。
3. 或在 `regular/style.css` 里为常用图标补 `-fill` 别名，减少踩坑面。

**当前临时绕法**：不用填充图标，靠颜色区分选中态（`ph ph-star` + `text-amber`）。

---

## P3-1　`version` 字符串混入了描述文字

**定位**：`L7` `const ENGINE_VERSION = '4.72.0';`、`L4554`
```js
version: `${ENGINE_VERSION} (Enterprise Plugin Lifecycle)`,
```

**实测**：`JquanUI.version === '4.72.0 (Enterprise Plugin Lifecycle)'`

**影响**：任何 `semver` 比较、`version.split('.')[1]`、按版本做特性开关的代码都会算错。

**建议修法**：`version` 只放 `'4.72.0'`，另加 `versionTag: 'Enterprise Plugin Lifecycle'`。

---

## P3-2　仓库里残留 4 组 `-DESKTOP-064SV5C` 同步副本

- `dist/core/JquanUI@Core-DESKTOP-064SV5C.js`、`...-2.js`
- `skills/jquanui/SKILL-DESKTOP-064SV5C.md`、`...-2.md`
- `CHANGELOG-DESKTOP-064SV5C.md`、`README-DESKTOP-064SV5C.md`、`ROADMAP-DESKTOP-064SV5C.md`

**影响**：grep / IDE 跳转 / AI 检索会命中旧副本，改错文件（SKILL.md 自己写了"发现 `*-DESKTOP-*` 同步副本时先归档并保存哈希"，但目录里还在）。这也是本次排查中"读到过期结论"的风险点。

**建议修法**：统一移入 `archive/`（保留哈希与日期），并在 `.gitignore`/发布清单里排除。

---

### P2-5 · focus ring 的默认色仍是 Tailwind 蓝，没跟主题走

读任何带 `shadow-*` 的元素的 `getComputedStyle().boxShadow`，都能看到前面挂着两段尺寸为 `0 0 0 0` 的占位：

```
rgb(255,255,255) 0px 0px 0px 0px, rgba(59,130,246,0.5) 0px 0px 0px 0px, rgba(0,0,0,0.04) 0px 1px 2px 0px
```

第二段的 `#3B82F6` 是 Tailwind 默认 ring 色，没有跟随 `theme.extend.colors`。

**影响**：只写 `ring-2` 不写颜色，焦点环会是蓝色，和自定义主题不搭；只写 `shadow-*` 时因为尺寸是 0 所以看不出来，属于"埋着的默认值"。

**规避**：本项目所有 ring 都显式带色（`ring-night-cyan/60`、`ring-primary/70`）。

**顺带一个正面的结论**：`shortcuts` 嵌套 `shortcuts` 是**生效**的（`fb-panel` 里嵌 `shadow-subtle`，实测 `box-shadow` 拿到 `rgba(0,0,0,0.04) 0 1px 2px`），这点比 `theme.extend.borderRadius` 强。

---

## 附：已实测**正常**、不用改的部分

避免你在排查时误伤：

| 类 / 能力 | 结果 |
|---|---|
| `rounded-xl / 2xl / 3xl` | OK（12 / 16 / 24px） |
| `shadow-md`、`shadow-[0_16px_40px_rgba(...)]` | OK |
| `bg-primary/10`、`bg-primary/12` | OK |
| `size-7`、`size-9`、`min-w-[520px]` | OK |
| `tracking-[0.18em]`、`text-[10px]` | OK |
| `bg-[conic-gradient(...)]`、`bg-[radial-gradient(...)]` | OK |
| `border-line/70`、`backdrop-blur-xl` | OK |
| `data-[on=true]:bg-primary` | OK（但属性值是**纯数字**时会失效，见 P1-4） |
| `theme.extend.colors` / `spacing` / `fontFamily` | OK |
| `shortcuts` 指向任意值类 | OK（18px 圆角可落地） |

---

## 建议的修复顺序

1. **P0-1 + P0-2**：extend 白名单补齐 + 未知键告警 —— 一次性解决"配了没用还不知道为什么"。
2. **P0-3**：`checkClasses()` / resolve trace —— 让"类名写错"能被程序发现，而不是靠人肉探针。
3. **P1-1 ~ P1-4**：`compile()` 同步化 + `flushQueue()` + **数字属性值变体** —— 解决动态 UI 首帧丢样式，以及"改名探针过了、页面却没变"。
4. **P2-1 / P2-2**：晚到配置自愈 + 无头环境同步模式 —— 让 CI 截图可信。
5. **P2-3 ~ P3-2**：文档/版本号/副本清理 —— 低成本，但能省掉后来人第一小时的困惑。
