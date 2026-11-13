---
name: lanse-crm
description: 迭代澜序 CRM 的 JquanUI 双主题界面、本地业务数据及标准 CRM 演示流程。
---

# 澜序 CRM 开发约定

先阅读仓库 `skills/jquanui/SKILL.md`、`DATA.md`，以及本项目 README、docs/DESIGN.md。入口为 projects/lanse-crm/index.html。本目录 `npm run dev` 使用 live-server 启动整个仓库根目录 `../..`，打开 `/projects/lanse-crm/`，监听 127.0.0.1:4173。`scripts/live-dev.cjs` 调用 live-server API，优先本地依赖并兼容全局安装；Start.cmd 在两者都不存在时 npm install 安装 1.2.2。root/watch/ignore 均传入绝对路径，监听演示目录与框架 dist，避开 1.2.2 CLI 的相对路径监听问题。保留自动刷新，忽略 node_modules、临时文件、报告、verification 和 site，避免回归产物反复刷新。live-server WebSocket 只负责开发刷新，不是业务后端。`scripts/serve.cjs` 保留给隔离浏览器回归使用，不作为默认启动器。`npm run build` 输出可独立部署的 site/。

## 视觉

以用户提供的 NexProp 深色后台截图为视觉源，不使用海报标题、水印或交易文案。品牌为「澜序 CRM / Lanse」。暗色 #0b1014，面板 #151d20，强调 #21e6bd；亮色背景/面板为 #ffffff，语义强调 #087f6d。保留细描边、16px 卡片圆角、8px 控件圆角、局部青绿渐变。完整令牌表见 DESIGN。

所有样式使用 Core 原子类、theme.semantic、shortcuts、customUtilities。不创建页面 CSS 或 element.style。宽高放在控件实际 class 中，避免 shortcut 的 w-full 覆盖工具栏 w-36。复用 assets/mark.svg 和 ui.js 的描边图标；不引入随机图片或第二套图标语言。

## 结构

采用仓库原生 HTML/ES modules。app.js 负责组合和事件；schema.js 管字段和导航；data.js 管数据与业务校验；list.js 管查询/表格；overlays.js 管表单/详情；dashboard.js 管真实集合统计。新增模块先加 schema，再同步关联、状态和业务动作。

Table/Pagination 使用命令式 mount，不同时安装声明式 behavior，避免重挂。Msg 外观在加载 Msg 前配置已有 overlayPreset；不能传不存在的 Msg classes 参数。页面切换销毁 Table/Pagination，原生 dialog 负责焦点与 Escape。

Data 使用 collection + createCrudDataSource + IndexedDB persistence，status/owner 索引。所有写入 flush 后反馈；pagehide close；bfcache 返回重新初始化。业务层维护关联完整性，多集合转化/批量导入保留失败恢复，不添加业务 HTTP 请求。

## 业务与完成条件

现有 24 个实体 CRUD、公海、商机看板、报价→合同→订单、回款/开票、任务/工单/活动、报表与设置均须保持工作。新增字段同步表单、详情、筛选、导出和验证。余额包含待回款计划；合同客户和单据一致；删除先检查引用。Table render 回调中的用户字段必须 esc。

默认账号 admin@lanse.crm / Lanse2026。角色和审批等为演示信息，不声称真实权限、到账、开票。备份当前只导出，JSON 导入只新增；若扩展恢复必须验证全量关系并支持回滚。

每次扩展同步 README、DESIGN 和本 skill。运行本项目 check、相关 browser 回归和根 check:docs。改组件源码时另跑 check:component-docs。390px/1280px 检查主题和实际操作。保留有意义的截图和结果，清理临时 profile。已有 Core/Full 版本差异不能未经行为对账覆盖产物。

## 跟进与协作扩展

先读 docs/COLLABORATION.md。默认亮色，已有有效 lanse-theme 优先；初始化 theme-color 与实际主题一致。followups/appointments/knowledge 使用现有 schema 表单、Table/Pagination、CRUD、IndexedDB，messages 单独由 collaboration.js 维护业务视图。messages/calendar/approvals 是特定路由，不能交给通用 list。

followups 联系人/商机必须属于客户，下次日期不得早于本次日期；表单按客户过滤选项，业务层再次校验。旧手动沟通在 settings.collaborationVersion 缺失时迁入，FUP-LEGACY 编号去重，保留旧日志。客户详情快速留言同步跟进集合；创建下次任务使用 createFollowupTask，tasks.followupId 去重且保护删除，任务生成后独立维护排期。

messages 发件人取当前演示成员，收件人只选已启用成员。草稿可不完整，发送需收件人/主题/正文；发送更新同一草稿，已发送正文不可编辑。readBy/trashedBy/hiddenBy 分成员保存；永久移除不能抹掉另一位参与者的消息。当前预设四位成员名作为演示信箱身份，无真实权限。所有用户文本 esc，正文纯文本，写入 flush 后反馈。

日历不重复展示已生成任务的跟进计划，已完成/已取消/已回款不列为待办。审批复用 contracts 的状态动作与日志，禁止建立第二份审批状态。知识库采用纯文本，保留换行，草稿/发布/归档动作同步原集合。新增日程开始时间校验 HH:mm。路由切换继续销毁列表实例，无新增组件公共 API。

完成条件同步 README、DESIGN、COLLABORATION、本 skill、根项目文档与 jquanui skill；回归检查新实体 CRUD、旧数据迁移及去重、主题持久化、跟进任务去重、跨客户阻断、站内信收发/草稿/回复/回收、日历/审批/知识状态、双主题和手机溢出。

## 项目制造与审核工作流

先读 docs/MANUFACTURING.md 和 docs/plans/2026-10-09-manufacturing-workflow.md。projects/designs/procurements/suppliers/rfqs/supplierQuotes/production 为七个新实体；workflowTemplates/workflowRuns 为应用集合，workflows/workflowInbox 为专用页面。保持通用 schema + Table/Pagination 的 CRUD、导出、筛选；业务状态字段 readOnly/default，禁止从通用表单或导入跳过阶段。

business-rules.js 检查签约/立项/设计/采购门禁、项目/设计/客户/币种关系、预算和版本唯一性。制造写入通过 data.save 的 atomic 包装；workflow.js 保存模板快照及业务快照，当前节点指定成员和 expectedIndex 校验，处理意见必填。退回/驳回终结旧实例，重提新建实例。模板每事件一个启用，automatic 的触发为项目/设计新建与采购选案；提交失败回滚源记录。

manufacturing.js 负责分发询价、报价版本、理由选案、审核后下单、生产阶段联动。供应商报价必须同币种，最新版本且预算内才能选案；新修订使同供应商旧选案失效，不能覆盖历史已选/未选报价。需求分发后技术规格不可修改。供应商有未关闭询价不能停用；审批记录、关联记录与已执行生产保护删除。

合同新增国家/币种/条款；旧币种默认 CNY。订单、回款、发票从合同派生币种，金额显示和 CSV 包含币种。目标/趋势/团队统计只汇总 CNY，报表分币种展示，不能混加。既有商机与客户报价仍为人民币，外币合同独立新建。

复用 approvalFlowApi.mount 只读展示流程，actions/badges 隐藏，用中文描述显示节点状态；不要用组件内置 approve/reject 写业务。overlays.registerCleanup 注册 destroy，替换/关闭/Escape 均释放；overlays.extension 组合制造动作、详情和表单联动，maxWidth 可给比价弹窗 max-w-4xl。组件源码未修改，不安装重复 behavior。

settings.manufacturingVersion 首次只补缺少的 MAR-CUS/MAR-CTR 依赖，不能覆盖用户已有数据。模板/实例纳入备份/演示恢复。完成需同步 README/DESIGN/MANUFACTURING、此 skill、根项目文档与 jquanui/DATA；运行 check、check:browser、check:manufacturing、build/portable、根 check:docs，检查明暗和 390px；记录实测数量。制造只覆盖已讨论到的生产阶段，不自行补试航/交付/质保逻辑。
