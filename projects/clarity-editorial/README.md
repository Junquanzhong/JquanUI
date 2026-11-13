# 澄光编辑台 Clarity Editorial

基于 JquanUI 的轻量内容编辑后台实例。设计基准来自 `design-references/articles-reference.png` 和 `design-references/blog-reference.png`，核心关键词是：留白、摄影内容、编辑感、低对比度、天蓝色交互强调。

## 页面

- `pages/articles.html`：摄影作者画廊与时间范围 Tabs
- `pages/blog.html`：特色文章、普通文章与 Related posts
- `pages/article-detail.html`：文章详情阅读页
- `pages/author-detail.html`：作者档案与作品页
- `pages/media-library.html`：素材库与 JquanUI Media Picker
- `pages/login.html`、`pages/signup.html`：轻量认证流程
- `pages/profile.html`：个人资料、安全和通知设置

## 设计入口

- `style-extraction/visual-style-guide.md`：从参考图提炼的设计规范
- `design-system/tokens/clarity-jquan.config.js`：浏览器运行时主题与 shortcuts
- `jquan.config.cjs`：JquanUI 提取器配置
- `scripts/clarity-interactions.js`：共享导航、搜索、状态反馈和素材组件挂载

## JquanUI 约束

- 页面使用全屏 `ce-stage` / `ce-screen` canvas，主内容在内部滚动。
- 主题配置脚本必须在 `dist/core/JquanUI@Core.js` 之前加载。
- 组件优先复用 `dist/components`：Tabs、Pagination、Media Picker、Select。
- 页面不使用 page-level `<style>` 和 inline `style=""`。
- 图片使用真实摄影素材 URL，正文布局保持轻量白色内容面板与细边框。

