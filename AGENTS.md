# JquanUI 项目协作约定

## 项目入口

- 当前 Core 源码：`dist/core/JquanUI@Core.js`。
- 组件：`dist/components/`，注册清单为 `components.manifest.json`。
- 开发者文档：`content/`；组件模块为 `content/components/`。
- 项目 AI skill：`skills/jquanui/SKILL.md`；Data 专题为 `skills/jquanui/DATA.md`。
- 5.0 迭代提案：`docs/5.0-ITERATION-PLAN.md`。提案中的新 API 和目录不是已实现能力。

## 用户明确要求

每次开发新东西，都必须更新配套文档和 skill。新增组件、功能、公开 API、配置项、变体或原子类，以及已有能力扩展，都将对应文档和项目 skill 的同步更新作为完成条件。

- Core 更新对应 `content/*.js` 和项目 skill。
- 组件更新 `content/components/{name}.js`，按需同步 index、manifest、类型、示例及 skill。
- Data 更新对应开发者文档与 `skills/jquanui/DATA.md`。
- 构建与工具链更新对应文档、CLI/API 示例、类型及 skill。
- 文档说明用途、引入方式、最小示例、参数、返回/状态、依赖、限制、销毁及生态组合；示例必须符合当前实际实现。

## 实施与验证

先阅读项目 skill 与相关代码，优先复用已有组件和服务；能力不足时先迭代原组件。Core 保持 CSS 引擎职责，组件和 Data 独立。

按改动运行相关回归及 `npm run check:docs`；组件改动运行 `npm run check:component-docs`，更新类型与所需生成产物。Core 扫描、解析、排序、缓存或构建提取改动运行真实性能检查。发布候选运行 `npm run verify`。

先核对当前基线。已知源码、压缩 Core 与 Full 曾出现分叉，不能未经行为对账就从旧源码覆盖生成产物。记录已有失败与本次结果，只有实际通过的检查才能标记通过。
