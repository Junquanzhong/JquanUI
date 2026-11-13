---
name: prismara-blog
description: 在 projects/prismara-atlas 中维护基于 JquanUI 的第二大脑 Blog、亮暗夜读主题、轮播、目录、栏目、详情、应用中心、归档、标签、关于、404、工作机会与作品橱窗。
---

# Prismara Atlas 项目 Skill

## 修改入口

1. 先读 `README.md`、`style-extraction/visual-style-guide.md` 与相关组件文档。
2. 内容改 `content/atlas.cjs`；结构改 `scripts/build-pages.cjs`；交互改 `scripts/prismara-interactions.js`。
   应用数据改 `content/apps.cjs`，真实截图存入 `assets/apps/`；宠物地面路径与行为维护于 `scripts/prismara-motion.js`。
   外观初始化与偏好同步维护于 `scripts/prismara-theme.js`，必须在 Core 前加载。
3. 执行 `node scripts/build-pages.cjs` 同步所有静态 HTML，避免逐页复制。
4. 主题只维护 `design-system/tokens/prismara-jquan.config.js`；提取配置通过 require 复用，不维护第二份主题。

## 设计与实现

- 亮色为白纸、碳黑、发丝线与 Prism Teal；暗色参考 lanse-crm 的深墨绿层次，画布 #0B1316、卡片 #141F23、次表面 #1B2A2F、边框 #2A3C42、薄荷强调 #37D6B1。按钮 6px 圆角、卡片/封面 10px 不变；暗色卡片仅用微弱渐变和阴影表现层次。
- 颜色统一进入 theme.semantic。canvas 与 paper 分别是页面/卡片；bone 是次表面，mist 是边框，carbon-ink/graphite/slate 为标题/正文/辅助。action-ink 是链接，action-fill/on-action 是填色控件的配对色；CTA 使用固定 cta-ink，不能把随暗色变亮的 carbon-ink 放在薄荷按钮上。
- 先语义 HTML，再 JquanUI 原子类和 `pr-*` shortcuts；配置先于 Core。不新增 Tailwind、页面级 CSS 或模板 inline style。
- 首页是内容发现入口：4 篇近期文章轮播、栏目索引、封面卡片与最新列表。每篇标题/摘要/封面/查看全文/查看栏目必须来自同一记录。
- 目录页提供真正能用的搜索、栏目筛选、标签链接、结果数与空状态；栏目页展示该栏目的真实本地记录数；详情页提供面包屑、目录、正文、相关内容和返回路径。
- `apps.html` 展示站主制作的开源软件，使用真实本地截图，分开提供应用/文档与 GitHub 源码入口。支持分类与关键词取交集、结果数、无结果重置和 q 参数；共享交互使用 data-app-* hooks，卡片必须为 article。外部入口加 target="_blank" 与 rel="noopener noreferrer"。
- `archives.html` 按现有文章年月倒序生成，不手写数量或虚构历史；`tags.html` 合并文章标签和栏目主题，支持 tag 参数、按钮选择、URL 同步与未知主题恢复。标签文本用 textContent，data-tag-values 是转义后的 JSON。
- `about.html` 是独立入口，保留作者实际已知信息，不编造履历；`404.html` 提供原生 GET 搜索回到知识库。404 页面需部署服务器另行配置状态与兜底路由。
- 字体声明采用参考规范字体并保留中文系统回退；不得宣称未安装的字体已被实际加载。

## 外观与封面

- 用根 `.light/.dark` 与语义角色表达主题，不依赖简单滤镜或只把背景变黑。亮暗封面分别位于 assets/covers 与 assets/covers/dark，由同一 image 模板输出 dark:hidden / hidden dark:block；软件真实截图保留配色，暗色降低少量亮度即可。
- 默认 system；localStorage 键 prismara-appearance 只保存 light/dark/system。PrismaraTheme.setPreference(value) 合法时返回 true，非法返回 false；getPreference() 取选择，getResolved() 返回 light/dark。仅此脚本维护状态。
- 首屏初始化在 Core 前完成，更新 theme-color，color-scheme 由原子类表达；系统事件仅在 system 模式生效，storage 事件同步其他标签页。存储不可用时本页切换继续工作，非法保存值回退 system；file:// 的跨文件存储不保证，网站同源按浏览器规则共享。
- 页头用原生 details 展示三种选择，aria-pressed 标记当前偏好；Escape/点击外部收起，选中后返回 summary 焦点。关于页选项调用相同 API。切换不重建 DOM/输入/轮播。监听器在真正 pagehide 清理，bfcache 保留。
- prismara:themechange 的 detail 为 {preference,resolved}，用于刷新 Canvas 缓存的主题粒子色，静态减弱动画也重绘一次，不创建新 RAF。
- shortcut 含 display 时不能仅靠同元素 hidden 覆盖；手机搜索图标使用 max-sm:hidden，避免 inline-flex 的排序导致页头挤压。新增布局要检查手机截图，不能只检查 scrollWidth。

## 复用 Carousel

- 依赖 `dist/components/carousel.js`，首次命令式 mount 在 `JquanUI.use(JquanUIComponents.carousel)` 之前完成。
- 使用组件自动播放和转场，不重写轮播定时器。当前配置为 interval=6500、speed=520、infinite=true、arrows=false、indicators=false；4 个 `pr-carousel-dot` 圆形图标通过公开 goTo 方法选择文章。不要恢复数字、前后箭头、轮播暂停控件或首屏分隔线。背景动效暂停入口保留。
- 用 `onChange(index)` 更新圆形图标的 aria-pressed、保存当前展示文章；`prefers-reduced-motion` 下关闭自动播放且 speed=0，焦点进入整个 data-hero（包括图标切换器）时暂停，离开后恢复。隐藏 slide 用组件的 `aria-hidden` 同步 inert，避免键盘进入不可见链接。
- 卸载时先移除 `jq-carousel`，再 destroy；取消自己创建的监听器和观察器。

## 首屏粒子宠物

- 当前是侧身垂耳四脚犬，64 个点依次为身体 0–15、头 16–27、耳 28–35、四条腿 36–51、尾 52–57、脸 58–63。不要恢复悬浮前视犬或水母。点与骨架连线/脚影配合保证四脚可辨认，粒子仍为主体。
- motion.js 提供 createPet/stepPet/geometry/pose/layout；renderer.js 负责 Canvas 绘制；只在首页、共享交互前加载。接口、参数与最小调用示例以 README 的“宠物模型”为准。time 形参保留但实例实际时间累计 elapsed；elapsed=0 不推进行为/步态/玩具/物理，调整尺寸仍夹紧位置。0 尺寸不得初始化。
- 地面范围为首屏轮播区域内部的浅景深带，y/groundY 是脚底基线，四脚根据实际移动距离推进 gait；站立段后移补偿身体、摆动段抬脚返回。停步后 stride 衰减，不用 time 正弦让静止犬原地走。头朝向 look/gazeX，与身体/脚分开；只有顶气球允许 jump。
- playing 从九种动作中按权重随机选择：漫步/趴地/刨土/追蝴蝶/顶气球/边缘抬腿/嗅闻/伸懒腰/甩毛。activities 只是清单，不按下标轮播；禁止连续重复，降低隔次重复，时长 ±15% 随机，边缘抬腿低频。createPet({seed}) 支持可复现检查，默认种子随机；随机状态保存在实例中，elapsed=0/主题重绘不得消耗随机数。指针离开重新抽取动作，撒娇 nuzzle/paw/tilt 与持续时间也随机，不能恢复正弦定时切换。
- rest/dig 动作逐步降低身体/头，不能瞬间换形；edge-walk 必须到达左右边缘才开始 pee 并抬后腿；balloon-walk 到球下方再跳，必须经过 crouch/push-off/airborne/landing；rear/crouch 让后腿支持、前半身抬起，不能四脚整体上浮。碰球后加强向上速度、低阻力高抛，toy.squash=1 后指数衰减，球线按速度摆动；漏顶后用低处柔性恢复力接住，禁止坐标夹回。每跳只计一次真实 headHits。蝴蝶和气球都维护 id/stage：butterfly 从左右画布外 entering → playing → exiting，balloon 从上方 entering → playing → exiting，只有完整越界后才删除；指针打断只切 exiting，renderer 继续画出场过程。蝴蝶有独立轨迹，狗沿地面追，不随蝴蝶悬浮。
- sniff 低头慢走、鼻尖轻动；stretch 前肩下压、前爪前伸、后爪落地；shake 身体与头部错相轻摆。新增姿态同时维护模型/geometry/renderer，指针进入平滑解除。测试对各行为使用独立种子夹具，不依赖随机样本恰好抽到所有行为；另测随机选择进度、不同种子差异、相同种子复现、不连续重复、冻结与高弹弧线。浏览器截图覆盖九动作 × 亮暗 × 手机/桌面，共 36 张，区分定向行为夹具与随机序列模拟。
- 光标优先打断任意动作：noticing/look 短暂停下并注视，approaching/run 沿地面靠近，cute/nuzzle 或 paw 摇尾蹭蹭/抬爪；离开后 playing，位置不重置。高处光标只影响视线和地面目标。先平滑解除趴地/抬腿再跑，不瞬间吸附指针。
- 顶球的 crouch/rear 必须实际参与 geometry：躯干压低、绕髋部抬前肩、前爪折起，后爪保留地面接触；不能只记录状态名。collar 三点与脸/头使用同一骨架变换，renderer 不另算项圈高度。测试单独覆盖 jump=0 时的 crouch/rear 可见变化，及玩具删除前一帧完整越界边界与相邻帧连续性。
- Canvas 为首屏内容上方 pointer-events-none/aria-hidden 装饰，不拦截链接、拖动；Canvas 不参与布局、不在轮播下方额外占空间；地面基线只在 Canvas 内部计算，不能为了宠物增大首屏留白。不新增宠物面板、养成/存储功能。
- 只监听 data-hero 的 pointerenter/move/leave/cancel；touch 不建立目标。30fps/DPR1.5；暂停/后台/离屏/减弱动画取消 RAF、清空目标。真正 pagehide 清理 RAF/观察器/媒体监听/AbortController；bfcache 保留。
- 配色来自 pet-fur/pet-tail/action-ink，加 pet-toy（暖金）/pet-earth（泥点）语义令牌；主题切换只重绘不改变 pet 实例。draw(ctx,pose,palette) 无 DOM/监听器，输入 ctx 按 DPR 缩放，调用方清屏。
- Node 模拟覆盖四脚接触/摆动、全部动作、边缘抬腿前提、顶球碰撞、每个动作被光标打断、零步长冻结、地面范围/尺寸变化/连续性；浏览器验证真实注视-跑来-撒娇、离开、触摸、暂停/减弱/离屏/点击穿透，独立真实模型快进后用实际 renderer 截取全部动作的亮暗手机/桌面证据，不给产品增加测试菜单。区分模拟截图与实时鼠标证据。

## 内容与验证

栏目标题参考线上公开结构；正文、日期和摘要为设计示例。禁止将它们称为线上实时数据或已验证技术文档。新增文章时保持稳定 URL、所属栏目和封面引用一致，新增页面同步 README、设计说明和本 skill。

应用信息来源为站主公开应用中心，2026-10-26 核对项目与仓库：Nginx Aegis、TOTP Authenticator、ES3 Game Assistance、JquanUI。数据字段为 id/title/category/categoryLabel/icon/summary/tags/preview/url/action/repository；计数从数据计算。新项目需要真实名称、可访问入口、仓库与本地截图；不编造版本、下载量、星标数或许可。

执行项目静态验证、doctor 和真实浏览器检查：

```powershell
node scripts/verify-prismara.cjs
node ../../dist/cli/jquan-extract.cjs --doctor --config jquan.config.cjs --json
node scripts/verify-browser.cjs
```

必须核对 18 页 × 亮暗主题 × 390/768/1280px；无横向溢出/封面失效/运行时异常，主要正文/辅助字/按钮对比度至少 4.5；轮播显示内容、全文链接、栏目链接相符；文章/应用/标签筛选能恢复；归档与源数据一致；减弱动画没有残留 RAF/自动播放。主题验证需覆盖系统切换、显式覆盖、跨页恢复、真实跨标签同步、存储不可用与非法值、输入焦点和轮播状态保留。最后运行根 `npm run check:docs`。组件或 Core 源码发生变化时，才追加对应文档、项目 skill、相关回归与生成产物对账。

## 工作机会与作品橱窗

- work.html 是合作接单页，数据来自 content/work.cjs；不得改成招聘职位列表或编造报价/交期/客户。服务、流程、微信 junquanzhong 和邮箱 junquanzhong@vip.qq.com 来自原站公开工作机会页，核对日期 2026-10-27。可更新数据后重新生成；不要自动发送联系消息。
- showcase.html 展示 content/showcase.cjs 的 works；工作机会页复用前两件。未收到站主确认的作品名单时保留真实空状态，不把开源应用自动当作精选网站，也不放占位假客户。作品字段为 id/title/url/preview/category/summary/tags/role；id 唯一、url 为 HTTPS、preview 是 assets/showcase 的本地真实截图文件名。README 含最小记录示例。
- 图片、标题、访问按钮必须统一复用 externalWorkLink，输出 target="_blank" rel="nofollow noopener noreferrer"，accessible label 提示新窗口。不能只给按钮加 nofollow；内部导航保留当前窗口。文字与 URL 属性均转义。真实截图不做主题换色，暗色 opacity-90。
- 微信使用 data-copy-contact/data-contact-status，Clipboard API 成功更新 aria-live；失败保留可选中的原号码与明确手动复制提示。无后端、二维码或自动发送动作；事件复用 AbortController，在真正 pagehide 清理。
- 主导航在 lg 起显示全部入口，较窄屏幕保留四项导航；作品/合作次导航和页脚补全路径，检查 768px 和手机页头。关于页提供合作入口。
- 新页遵守既有亮暗语义色与 JquanUI 原子类；生成器共享模板，禁止直接改生成 HTML。静态验证包括实际作品与不落盘测试数据的三个外链、HTTPS/转义/空状态，浏览器验证真实联系方式、复制成功/拒绝降级和两页导航；全站 18 × 2 × 3 = 108 组。

- 首件精选网站由用户指定为 https://gpmajan.om/，标题 Gaopeng Majan。2026-10-27 核对公开内容并用 Edge 截取实际黑金首屏，本地预览 assets/showcase/gpmajan.webp；来源记录见同目录 README。仅描述可见的企业展示、英语/阿拉伯语入口和粒子视觉，不能据截图推断作者承担的具体职责、技术栈或商业成绩，role 保持“网站作品”。
- 作品记录变更后检查 work/showcase 两处数据一致、三个外链地址与 rel/target 一致、截图实际 decode，并在手机/桌面亮暗模式查看卡片。浏览器真实点击首件作品后验证新标签页地址，原页面保留；检查关闭自己创建的标签页。
