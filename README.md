# JquanUI v3.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](https://cssui.jquan.win)
[![Website](https://img.shields.io/badge/website-cssui.jquan.win-green.svg)](https://cssui.jquan.win)

## 🚀 简介

JquanUI 是一个基于企业官网开发的原子化 CSS UI 框架，专为现代 Web 应用设计。它提供了丰富的原子类、组件和工具函数，帮助开发者快速构建美观、响应式的用户界面。

## ✨ 核心特性

### 🎨 原子化 CSS 设计
- **丰富的原子类**: 提供大量的 CSS 工具类，覆盖布局、颜色、间距、字体等各个方面
- **响应式设计**: 内置响应式类，轻松适配不同屏幕尺寸
- **主题系统**: 支持多种主题和暗黑模式切换
- **自定义配置**: 灵活的配置系统，满足个性化需求

### 🧩 组件库
- **按钮组件**: 多种样式的按钮，支持主要、次要、成功、警告、危险等状态
- **表单控件**: 输入框、选择器、复选框等完整的表单组件
- **布局组件**: 栅格系统、弹性布局、卡片、容器等
- **导航组件**: 面包屑、标签页、抽屉菜单等
- **反馈组件**: 模态框、工具提示、加载器等

### 🔧 高级功能
- **骨架屏**: 内置骨架屏组件，提升用户体验
- **懒加载**: 图片和组件懒加载功能
- **国际化**: 支持多语言切换
- **表单验证**: 强大的表单验证功能
- **代码高亮**: 内置代码块高亮显示

## 📦 快速开始

### 1. 引入 CSS 文件

```html
<!-- 引入 JquanUI 核心样式 -->
<link rel="stylesheet" href="css/JquanUI@3.0.css">
<!-- 引入主题样式 -->
<link rel="stylesheet" href="css/JquanUI-Theme@3.0.css">
<!-- 引入配置样式 -->
<link rel="stylesheet" href="css/Config.css">
```

### 2. 引入 JavaScript 文件

```html
<!-- 引入 JquanUI 核心脚本 -->
<script src="js/JquanUI@3.0.js"></script>
```

### 3. 使用示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JquanUI 示例</title>
    <link rel="stylesheet" href="css/JquanUI@3.0.css">
    <link rel="stylesheet" href="css/JquanUI-Theme@3.0.css">
</head>
<body class="theme-indigo">
    <div class="container py-4">
        <div class="card">
            <div class="card-header">
                <h3 class="text-xl font-semibold">欢迎使用 JquanUI</h3>
            </div>
            <div class="card-body">
                <p class="text-gray-600 mb-4">这是一个使用 JquanUI 构建的卡片组件</p>
                <button class="btn btn-primary">主要按钮</button>
                <button class="btn btn-secondary">次要按钮</button>
            </div>
        </div>
    </div>
</body>
</html>
```

## 🎯 主要功能模块

### 布局系统
- **Flexbox 布局**: 完整的 Flexbox 工具类
- **Grid 布局**: CSS Grid 栅格系统
- **响应式布局**: 移动端优先的响应式设计
- **间距系统**: 统一的间距单位和类名

### 样式系统
- **颜色系统**: 丰富的颜色变量和主题色
- **字体系统**: 多种字体选择和可变字体支持
- **边框和圆角**: 灵活的边框和圆角样式
- **阴影效果**: 多层级的阴影效果

### 交互组件
- **模态框**: 支持自定义的模态框组件
- **标签页**: 可切换的标签页组件
- **轮播图**: 图片轮播和展示组件
- **手风琴**: 折叠式内容展示组件

### 实用工具
- **复制功能**: 一键复制文本内容
- **Cookie 管理**: 便捷的 Cookie 操作
- **主题切换**: 动态主题和暗黑模式
- **加载状态**: 多种加载动画和状态指示

## 🌐 在线演示

访问我们的在线文档和演示：[https://cssui.jquan.win](https://cssui.jquan.win)

## 📁 项目结构

```
JquanUI/
├── css/                    # 样式文件
│   ├── JquanUI@3.0.css    # 核心样式
│   ├── JquanUI-Theme@3.0.css # 主题样式
│   ├── Config.css          # 配置样式
│   └── app.css             # 应用样式
├── js/                     # JavaScript 文件
│   ├── JquanUI@3.0.js      # 核心脚本
│   ├── apps/               # 应用脚本
│   └── modules/            # 模块脚本
├── html/                   # HTML 示例文件
├── fonts/                  # 字体文件
├── images/                 # 图片资源
└── lib/                    # 第三方库
```

## 🛠️ 开发环境

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/your-username/JquanUI.git
cd JquanUI
```

2. 启动开发服务器
```bash
# Windows
Start.cmd

# 或使用 live-server
live-server
```

### 构建和部署

项目采用纯前端技术栈，无需复杂构建过程。直接部署静态文件即可。

## 🔧 配置选项

JquanUI 提供了丰富的配置选项，您可以通过修改 `Config.css` 文件来自定义主题、颜色、字体等样式。

### 主题配置
```css
:root {
  --primary-color: #3f51b5;
  --secondary-color: #ff4081;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --danger-color: #f44336;
}
```

## 📚 文档

详细的文档和示例请访问：[https://cssui.jquan.win](https://cssui.jquan.win)

文档包含：
- 快速开始指南
- 完整的组件文档
- 原子类参考
- 主题定制指南
- 最佳实践

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进 JquanUI！

### 贡献指南
1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📝 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- 感谢所有贡献者的支持和帮助
- 感谢开源社区提供的优秀工具和库
- 特别感谢使用 JquanUI 的开发者们

## 📞 联系我们

- 项目主页: [https://cssui.jquan.win](https://cssui.jquan.win)
- 提交 Issue: [GitHub Issues](https://github.com/your-username/JquanUI/issues)

---

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**