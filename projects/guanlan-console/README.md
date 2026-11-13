# 观澜台 Guanlan Console

基于 JquanUI 的 B 端浅色大屏设计项目。项目视觉基准来自 `design-references/reference-dashboard.png`，核心关键词是：浅色、蓝紫、玻璃浮层、柔和 3D 地图、数据驾驶舱。

## 目录

- `design-references/`：原始参考图与后续视觉样本。
- `style-extraction/`：从参考图提取出的设计语言、参数和落地规则。
- `design-system/tokens/`：JquanUI 主题令牌、shortcut 与可复用样式入口。
- `design-system/components/`：后续沉淀的业务组件规范。
- `pages/`：可直接预览的页面原型与业务页面。
- `verification/`：视觉校验截图、检查记录和后续自动化脚本。

## 当前基线

- 项目名：观澜台 Guanlan Console
- 首个页面：`pages/dashboard-preview.html`
- 核心页面：`pages/home.html`、`pages/list.html`、`pages/detail.html`、`pages/form.html`、`pages/settings.html`、`pages/login.html`、`pages/signup.html`
- 主题入口：`design-system/tokens/guanlan-jquan.config.js`
- 设计规范：`style-extraction/visual-style-guide.md`

## JquanUI 使用约束

- 配置脚本必须放在 JquanUI Core 之前。
- 页面默认使用语义 HTML + JquanUI 原子类，不新增页面级 CSS，不写 `style=""`。
- 品牌色、重复阴影、圆角和渐变进入 theme token 或 shortcut。
- 组件优先复用 `dist/components` 中已有能力，业务状态优先使用 `data-*` 与 ARIA。
- 页面至少检查 390px 移动端和 1280px 桌面端无遮挡、无横向溢出。
