# Prismara Atlas · 棱镜知识库

基于 JquanUI 的 Blog UI / 第二大脑知识库。视觉从 `D:/Downloads/Prisma-DESIGN.md` 提取，栏目名与部分文章标题参考 `www.jquan.win` 的公开首页；使用当前 Core 与 Carousel，没有 Tailwind 依赖。

## 页面

| 入口 | 用途 |
| --- | --- |
| `pages/index.html` | 4 篇近期文章轮播、封面、64 点小狗电子宠物、栏目入口、最新记录 |
| `pages/library.html` | 栏目目录、文章搜索、组合筛选、标签入口、空状态 |
| `pages/work.html` | 工作机会：网站/系统/办公自动化/咨询服务、合作流程、微信与邮件联系 |
| `pages/showcase.html` | 作品橱窗：精选网站、真实界面预览与新窗口访问；首件 Gaopeng Majan |
| `pages/apps.html` | 开源应用中心，真实软件截图、应用/文档与源码入口、用途筛选、关键词搜索 |
| `pages/archives.html` | 按年月倒序归档、月份跳转、实际文章与栏目数 |
| `pages/tags.html` | 跨栏目主题索引、标签筛选、可分享的 tag 参数、空状态 |
| `pages/about.html` | 独立关于页、知识库与工具入口、阅读外观设置 |
| `pages/404.html` | 未找到页面的设计，提供首页、目录与关键词搜索恢复路径 |
| `pages/column.html` | Python In Excel 栏目 |
| `pages/column-excel.html` | Excel 应用化开发栏目 |
| `pages/column-api.html` | Excel WEB API 栏目 |
| `pages/column-templates.html` | 1CSM 模板开发文档栏目 |
| `pages/article.html` | 修改数据集字段文章 |
| `pages/article-create-dataset.html` | 创建数据集文章 |
| `pages/article-pagination.html` | 动态分页文章 |
| `pages/article-ipinfo.html` | IP 信息查询文章 |
| `pages/article-rewrite.html` | 模板与伪静态文章 |

所有入口相互连接；轮播的标题、摘要、封面、所属栏目与全文来自同一记录，不会把不同文章都指向同一详情。

## 本地预览与生成

可直接打开 `pages/index.html`；不依赖 fetch、外部图片服务或构建服务器。也可从 JquanUI 仓库根目录运行：

```powershell
python -m http.server 8877 --bind 127.0.0.1
```

访问 `http://127.0.0.1:8877/projects/prismara-atlas/pages/index.html`。

内容与页面布局分离。修改 `content/atlas.cjs` 的栏目、文章或正文，然后在 Prismara 目录执行：

```powershell
node scripts/build-pages.cjs
```

页面由 `scripts/build-pages.cjs` 的共享导航、卡片、正文、栏目模板生成；不要直接编辑生成后的 HTML。入口 `article.html` 和 `column.html` 保留为首篇文章与 Python 栏目的稳定链接。

## 文件与依赖

- `content/atlas.cjs`：4 个栏目与 5 篇本地设计示例。`articles` 当前按日期倒序排列，首页使用前 4 条。
- `content/apps.cjs`：4 个开源应用的名称、说明、分类、标签、截图文件、应用与仓库地址；新增应用在此登记，然后重新生成页面。
- `design-system/tokens/prismara-jquan.config.js`：浏览器与 Node 共用的主题、shortcut、团雾 keyframes。
- `jquan.config.cjs`：直接复用同一主题，配置扫描范围、Phosphor blocklist 和动态类 safelist。
- `scripts/prismara-interactions.js`：Carousel 挂载、按钮状态、Canvas 粒子、搜索、目录高亮、复制链接及销毁。
- `scripts/prismara-motion.js`：首屏宠物的地面路径、64 点四脚轮廓、距离驱动步态与可中断玩耍模型；同时供浏览器绘制与 Node 边界/状态检查使用。
- `scripts/prismara-pet-renderer.js`：Canvas 四脚连线、菱形粒子、脚影、泥点、蝴蝶与气球绘制；无 DOM/监听器/外部图片依赖。
- `scripts/prismara-theme.js`：在 Core 前初始化浅色/暗色/系统外观，恢复本地偏好，响应系统与跨标签页变化。
- `assets/covers/`：本地抽象 SVG 封面和站点图标。
- `assets/covers/dark/`：4 张专门为夜读配色的 SVG 封面；通过 JquanUI dark 变体切换显示，独立于系统媒体查询，与手动主题保持一致。
- `assets/apps/`：应用中心使用的真实界面 WebP 截图，来源为站主公开应用中心中的对应项目图片。
- `style-extraction/visual-style-guide.md`：视觉参数、响应式与动效规则。
- `skills/prismara-blog/SKILL.md`：项目开发 skill。

按顺序加载主题配置、`scripts/prismara-theme.js`、`dist/core/JquanUI@Core.js`，首页再加载 `dist/components/carousel.js`、`scripts/prismara-motion.js`、`scripts/prismara-pet-renderer.js` 和共享交互脚本。Phosphor 使用仓库已有资源。字体声明保留 Inter / Mona Sans；当前未额外分发字体文件，缺失时使用系统字体回退。

## 夜读外观

全站页头的太阳/月亮图标展开原生外观菜单，选择浅色、暗色或跟随系统；关于页也提供相同选项。默认跟随系统，手动选择优先。选择保存在同源 localStorage 的 `prismara-appearance`，跨页面恢复、其他标签页同步；存储不可用时本页仍能切换，非法值降级为系统。file:// 的跨文件存储行为由浏览器决定，部署后按网站同源共享。

暗色参考 `projects/lanse-crm/src/theme.js` 的深墨绿层次：画布 `#0B1316`、卡片 `#141F23`、次表面 `#1B2A2F`、边框 `#2A3C42`、正文 `#CCDCDE`、标题 `#E6F2F0`、薄荷强调 `#37D6B1`。正文、CTA、代码块、封面、雾层和粒子各有对应角色；真实应用截图保留原色，暗色略降亮度。保留原有 6px 控件/10px 卡片尺度。

主题由 `theme.semantic` 与根 `.light/.dark` 驱动；切换不替换 DOM，也不重挂 Carousel。浏览器初始化在 Core 前完成；`theme-color` 和原生控件的 color-scheme 同步。项目接口：

```js
PrismaraTheme.setPreference('dark'); // light | dark | system；合法值返回 true，否则 false
PrismaraTheme.getPreference();      // 保存的选择，例如 system
PrismaraTheme.getResolved();        // 实际外观：light | dark
```

`prismara:themechange` 事件 detail 为 `{ preference, resolved }`，Canvas 据此刷新主题粒子色；静态减弱动画状态下也可立即重绘。主题监听器随真正的 pagehide 清理，bfcache 保留；页面交互用 AbortController 清理菜单和其他事件。不要在其他脚本创建第二份主题状态。

## 交互约定

- Carousel 使用现有组件的 6500ms 自动播放与 520ms 切换，以 4 个圆形主题图标选择文章，移除数字、前后箭头、轮播暂停按钮及首屏分隔线。保留方向键和拖动。焦点进入整个首屏（包括切换图标）、悬停或页面隐藏时暂停；减弱动画模式关闭自动播放，手动切换不带动画。
- 首屏为 64 点侧身垂耳四脚犬，四脚步态跟随实际移动距离，脚影留在地面，停步后停止踏步。按权重随机选择漫步、趴地休息、刨土、追蝴蝶、顶气球、走到边缘抬后腿、低头嗅闻、伸懒腰与甩毛；动作不连续重复，时长略有变化。气球被头碰到后高高弹起并短暂形变。光标进入会中止玩耍，短暂停下抬头注视，再沿地面跑向光标的水平位置，停留后随机蹭蹭、抬爪或歪头；高处光标不会把狗拉到空中。移出重新选择自主活动。手机触摸不会留下跟随目标。宠物仅限首屏，不拦截链接或轮播拖动。Canvas 是覆盖首屏轮播的背景装饰，不参与布局、不在轮播下方另占空间。
- 宠物帧率上限 30fps、DPR 上限 1.5；离屏、后台、暂停与减弱动画时停止 RAF、清除指针目标，保留静态幼犬。浅色/夜读配色从 pet-fur、pet-tail、action-ink 读取；切换主题不重置位置。背景暂停独立于轮播。
- 搜索在标题、摘要、栏目和标签中匹配，并与栏目筛选取交集；空结果有重置按钮。`library.html?q=API` 可作为标签搜索入口，不向远程接口发送输入。
- 应用中心复用搜索逻辑，按全部/开发/安全/实用工具筛选，与名称、说明和标签搜索取交集；支持 `apps.html?q=TOTP`。应用与源码链接在新窗口打开，不发送搜索词或调用远程项目 API。
- 文章目录使用原生锚点，滚动观察器更新当前章节。复制链接优先使用 Clipboard API，不可用时展示当前链接供复制。
- 归档从文章日期生成月份，不维护手写时间线。标签索引合并文章标签与所属栏目的主题；`tags.html?tag=Python` 直接显示相关记录，点击标签同步当前 URL，未知主题显示可恢复的空状态。标签文本通过 textContent 展示。
- 共享页脚和目录浏览导航连接归档/标签/关于；404 搜索使用原生 GET 表单跳转到 `library.html?q=关键词`。`404.html` 是静态页面，部署时须由服务器配置未匹配路由与 HTTP 404 状态。
- 整页导航时自动释放监听器、观察器、动画帧和 Carousel 句柄；轮播销毁前移除声明式挂载属性，防止自动重挂。

## 内容范围

这是 UI 设计项目。正文、日期、摘要和阅读时长是本地设计样例，尚未对接线上 CMS、全文或真实访问统计；封面是项目内的矢量设计素材。不要把样例正文或数量当作 `jquan.win` 的实时数据。部署时还需要替换内容源、核实文章信息，并选择 Core 的最终部署路径。

应用中心的 Nginx Aegis、TOTP Authenticator、ES3 游戏存档修改器与 JquanUI 来源于 `https://www.jquan.win/应用中心/`，项目身份与 GitHub 仓库于 2026-10-26 核对。它们是人工整理的静态入口，不宣称实时同步版本、发布状态或访问统计。新增应用应提供真实图片和地址，并同步此文档与项目 skill。

## 验证

在当前项目目录执行：

```powershell
node scripts/verify-prismara.cjs
node ../../dist/cli/jquan-extract.cjs --doctor --config jquan.config.cjs --json
node scripts/verify-browser.cjs
```

浏览器检查使用 Edge / Chrome（可用 `JQUAN_BROWSER` 指定），覆盖 18 个页面 × 亮暗两种主题 × 390px / 768px / 1280px，共 108 组显示检查，并检查文字对比度、封面配色、主题恢复/系统跟随/跨标签同步/存储降级/焦点与输入保留，以及既有轮播、背景与搜索回归、归档/标签/404 路径；截图与报告输出到 `verification/`。宠物检查包含平滑接近、停留卖萌、移出游玩、触摸不粘滞、暂停/减弱动画忽略光标、文章真实点击；Node 模拟边缘目标、尺寸变化和位置连续性。实际通过结果以 verification/RESULTS.md 为准。仓库根运行 `npm run check:docs`。本轮没有修改 Core 或组件源码，因此没有重建压缩 Core、Components 或 Full。

## 宠物模型

首页在交互前加载 prismara-motion.js 与 prismara-pet-renderer.js，其他页面没有宠物画布。当前设计详见 `docs/2026-10-28-grounded-pet-design.md`，前一版悬浮犬记录保留为历史。

```js
const pet = PrismaraMotion.createPet();
const snapshot = PrismaraMotion.stepPet(pet, 1200, 780, 1.2, 1 / 30,
  { inside: true, x: 300, y: 200 });
// state: noticing -> approaching -> cute；高处光标只改变视线和地面目标。
PrismaraPetRenderer.draw(canvas.getContext('2d'), snapshot,
  {fur:'#14B8A6',tail:'#0D9488',detail:'#0F766E',toy:'#BD8D36',earth:'#8C7962'});
```

createPet(options = {}) 返回独立实例；可选 options.seed 为有限数值，会转为 uint32（0 回退固定非零种子），例如 createPet({seed:42}) 可复现测试。默认由 Math.random 生成每只宠物的种子，后续选择使用实例内的随机状态。stepPet(pet,width,height,time,elapsed,pointer) 更新该实例，尺寸/指针为 px，elapsed 为秒且夹紧到 0–0.1。time 形参为调用兼容保留，实际动作时间由实例累计的 elapsed 驱动，暂停不会补跑；elapsed=0 不推进位置、步态、玩具、随机状态或行为，但尺寸变化会先夹紧位置。pointer 为 {inside,x,y} 或 null，空指针表示自主活动。调用方须提供正画布尺寸，现有交互在零尺寸时不初始化。

返回 x/y/groundY/scale/state/action/facing/gait/stride/lie/dig/lift/jump/rear/crouch/jumpStage/headDrop/look/gazeX/wag/nuzzle/paw/blink/breath/time/toy/headHits/bounds/geometry，以及嗅闻 sniff、伸懒腰 stretch、甩毛 shake、歪头 tilt 的姿态强度。y 是脚底地面坐标，jump 仅改变犬形局部高度；geometry 含 64 个 points、四个 feet（x/y/planted）、head、headAngle 和随骨架变换的 collar 三点。pose(width,height,time) 为地面漫步目标，layout 返回左右/远近地面范围。geometry(snapshot) 可重算局部犬形，不产生副作用。

state 为 playing/noticing/approaching/cute。自主 action 为 walk/rest/dig/chase/balloon-walk/balloon/edge-walk/pee/sniff/stretch/shake，等待玩具离场时也可能为 watch/waiting；互动为 look/run/nuzzle/paw/tilt。自主动作按权重随机选择：漫步、嗅闻常见，边缘抬腿少见，不连续重复同一类型，并降低隔一个动作后立刻重复的概率。每次选择的时长在基础值 ±15% 内变化，鼠标离开时重新抽取动作；撒娇类型与 1.8–3.8 秒的持续时间也随机选择，不连续重复。activities 是类型清单，不是执行顺序。

玩具 type 为 butterfly/balloon，只在对应玩耍出现；边缘和气球动作的计时在到达目标后开始。四脚的站立段向后补偿身体位移、摆动段抬脚前移；gait 按距离前进。balloon 的 headHits 统计每次跳跃内一次有效头碰：给球更强的向上速度，以低阻力形成高抛弧线；toy.squash 在接触时为 1，随后衰减到 0，renderer 表现短暂横向膨胀和纵向压缩，球线随速度摆动。低处的柔性回位力让漏顶的球回到可顶高度，不直接修改坐标。玩具保留 id/stage 生命周期，蝴蝶从左右画布外进入并完整飞出，气球从上方进入并在结束后向上飞出，指针打断也只切换 stage=exiting，不删除实体。balloon 的 jumpStage 为 crouch/push-off/airborne/landing，rear 与 crouch 让后腿接地、前身抬起，renderer 不把四脚整体上移。嗅闻时低头慢走并轻动鼻尖；伸懒腰时压低前肩、前爪前伸、后爪支撑；甩毛时身体与头部小幅错相摆动。这些姿态在指针进入后平滑解除。

renderer.draw(ctx,snapshot,palette) 只绘图，无状态/监听器；ctx 预先按 DPR 设置坐标，调用前由交互清屏。palette 的 fur/tail/detail/toy/earth 来自 pet-fur/pet-tail/action-ink/pet-toy/pet-earth 语义令牌。脚影、少量泥点与抬腿粒子不会持久留在页面。无远程素材、后台养成或额外交互面板。

Canvas 继续使用 data-pet="dog" / data-motion-toggle；data-pet-state/action/position/facing/ground/head-hits 仅供内部检查。观察器/监听/RAF 随 pagehide 清理，bfcache 保留；暂停/离屏/后台/减弱动画取消 RAF，触屏不建立跟随目标。主题切换只重绘颜色，不推进模型。

## 工作机会与作品橱窗

服务和公开联系信息来自 `https://www.jquan.win/工作机会`，于 2026-10-27 核对，集中维护于 `content/work.cjs`。这里是项目合作入口；微信号支持 Clipboard API 复制，拒绝授权或 API 不可用时保留可选中的号码及手动复制提示。邮件只打开邮件客户端，不自动发送。无需后台服务；监听随共享交互的 pagehide 生命周期清理。

作品集中维护于 `content/showcase.cjs` 的 `works` 数组。首件作品为站主指定的 [Gaopeng Majan](https://gpmajan.om/)，2026-10-27 核对网站标题与公开内容，采用实际浏览器截图；来源与裁切方式见 `assets/showcase/README.md`。工作机会页展示前两件，作品橱窗展示全部。填入真实项目后运行生成命令即可：

```js
// 字段示意；用站主确认的网址和真实截图替换后再加入 works。
{ id: 'stable-id', title: '网站名称', url: 'https://your-site.example/',
  preview: 'stable-id.webp', category: '网站类型', summary: '简要介绍',
  tags: ['JquanUI'], role: '承担的工作' }
```

截图置于 `assets/showcase/`，卡片保留截图自身配色，暗色稍降亮度。仅接受 HTTPS 地址，id 保持唯一，preview 为本地文件名；生成器不抓取远程图片。预览图、标题与访问按钮统一由 externalWorkLink 输出 `target="_blank" rel="nofollow noopener noreferrer"`，内部页面正常导航。空数组显示明确空状态，不显示虚构数量、客户或成果。新增项目需核实网址、说明与截图，并同步文档/skill；静态检查同时使用不落盘的测试作品验证实际卡片的三处外链属性与转义。浏览器覆盖真实联系信息、微信复制成功/失败、合作页到橱窗的导航、两页作品卡片的亮暗手机/桌面显示和实际点击新窗口行为。
