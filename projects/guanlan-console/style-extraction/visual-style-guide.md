# 观澜台视觉规范 v0.1

参考图：`../design-references/reference-dashboard.png`  
提取日期：2026-09-17

## 1. 视觉方向

观澜台采用“浅色数据驾驶舱”方向：大面积近白背景承载高密度信息，核心视觉由蓝紫渐变、玻璃卡片和柔和 3D 地图构成。它不是传统深色监控屏，而是面向企业经营、运营分析和区域态势的轻量中台界面。

关键词：

- 浅色大屏：背景以 `#F7FAFF`、`#EEF5FF` 为主，避免厚重黑底。
- 蓝紫主轴：标题、激活状态、地图热区统一使用蓝紫渐变。
- 玻璃卡片：白色半透明面板、细描边、柔和投影，形成层级。
- 数据漂浮层：指标卡、图表、地图标记像贴在主视觉上方。
- 克制高饱和点缀：橙、绿、青只服务于分类、趋势和状态。

## 2. 色彩系统

### 基础色

| Token | Hex | 用途 |
| --- | --- | --- |
| `canvas` | `#F7FAFF` | 页面主背景 |
| `canvas-cool` | `#EEF5FF` | 大屏边缘冷光背景 |
| `surface` | `#FFFFFF` | 主卡片与浮层 |
| `surface-soft` | `#F6F8FF` | 卡片内部浅底 |
| `line` | `#E7EAF6` | 细描边、分割线 |
| `ink` | `#30366F` | 主标题、关键数字 |
| `muted` | `#747BA8` | 次级文字 |
| `faint` | `#AEB5D1` | 图标、辅助说明 |

### 品牌与状态色

| Token | Hex | 用途 |
| --- | --- | --- |
| `primary` | `#596BE8` | 主按钮、激活、关键折线 |
| `primary-deep` | `#3858A8` | 大标题深端、强调文本 |
| `violet` | `#846BFF` | 渐变高光、活跃态 |
| `sky` | `#64C8FF` | 信息、地图浮标 |
| `mint` | `#31C879` | 成功、增长、可用状态 |
| `amber` | `#FFC84A` | 轻提示、分组条 |
| `orange` | `#FF8A62` | 地区排行、热度提示 |
| `rose` | `#FF6F86` | 风险、下降、异常 |

### 渐变

- 主标题：`primary-deep -> primary -> violet`
- 地图主视觉：`#A8CBFF -> #7D92F2 -> #6276E8`
- 激活轨道：`violet -> primary`
- 圆环徽标：`rose -> violet -> sky`

## 3. 排版

- 中文标题：超粗、紧凑、低字距；主视觉标题可用 `font-black text-6xl` 起步。
- 英文装饰字：轻量斜体，只作为氛围层，不承载关键信息。
- 数字：大号、细中带稳，推荐 `text-5xl font-light tracking-tight`。
- 标签：小写或全大写均可，但必须小字号、宽字距、低饱和。
- 正文：B 端内容保持 12-16px；密集表格不超过 14px。

## 4. 布局

- 页面画布：最大宽度约 1280-1440px，居中，四周保留空气感。
- 主容器：大圆角 24-32px，白色玻璃面板，内部左右分区。
- 导航栏：窄侧边栏 56-72px，图标纵向排列，激活项使用蓝紫竖线或圆点。
- 信息区：左侧指标和榜单，右侧主视觉地图/球体，浮层叠放在地图边缘。
- 间距节奏：8px 基础网格，常用间距 12 / 16 / 24 / 32 / 48。

## 5. 组件参数

### 面板

- 主面板：`rounded-3xl border border-white/80 bg-white/75 shadow-glass backdrop-blur-xl`
- 浮动卡：`rounded-2xl border border-white/80 bg-white/85 shadow-float backdrop-blur-md`
- 信息胶囊：`rounded-full bg-white/90 shadow-soft`

### 图标

- 使用 Phosphor 图标，优先 regular/fill 变体。
- 图标容器使用 36-44px 正方形，圆角 12-14px。
- 激活图标使用蓝紫或青色填充，非激活图标使用 `faint`。

### 数据可视化

- 折线图：蓝紫 + 橙色双线，线宽 2px，少坐标轴。
- 柱图：绿色用于覆盖/增长，红色只标记异常。
- 环形进度：27%/67% 一类指标用细环，文字与数值分离。
- 地图标记：白色浮层 + 彩色图标块 + 圆形脉冲点。

## 6. JquanUI 落地规则

- 原子类优先；重复 5 个以上类组合上升为 shortcut。
- 设计稿固定画布、复杂渐变、径向背景允许使用任意值。
- 颜色必须进入 `guanlan-jquan.config.js`，避免在 HTML 中散落品牌 HEX。
- 动态可见态使用 `data-state` / `aria-expanded`，不要用 JS 写 `style`。
- 后续业务组件优先核对 `dist/components` 中已有 `table`、`tabs`、`dropdown`、`toast`、`queryToolbar`、`dashboardStats`、`appShell`。

## 7. 质量门槛

- 390px：顶部标题不遮挡，卡片单列堆叠，侧边栏变为顶部/底部轻导航。
- 1280px：主面板完整显示，地图视觉不压缩成噪声。
- 控制台无 JquanUI 未解析类告警。
- 页面不新增 `style=""`，除非后续明确有不可替代的第三方覆盖。
