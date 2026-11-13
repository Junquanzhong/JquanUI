# 澜序 CRM · Lanse CRM

基于 JquanUI 的中文 B 端 CRM 演示网站。提取用户参考图中的近黑背景、深灰面板、青绿色光晕、细描边与圆角，默认使用白色亮色配置，保留用户后续的明暗主题选择。所有业务数据存于浏览器 IndexedDB，无业务 API 和后端。

## 启动

在本目录执行 `npm run dev`，使用 `live-server` 自动打开 `http://127.0.0.1:4173/projects/lanse-crm/`，修改源文件会自动刷新。需要 Node.js 22+ 和 live-server；开发启动优先使用本地依赖，也可复用全局安装。双击 `Start.cmd` 时，若本地和全局都没有 live-server，会执行 npm install 安装固定版本 1.2.2。首次安装需要联网，CRM 业务本身仍为本地演示。

服务根目录为整个 JquanUI 仓库（`../..`），由 `scripts/live-dev.cjs` 调用真实 live-server API 启动，确保相对路径能加载 Core、组件和 Data。使用绝对路径监听当前演示目录和仓库 dist 目录，避开 1.2.2 CLI 的相对路径监听问题；监听忽略 node_modules、临时文件、报告、验证截图和 site 构建目录。端口为 4173，退出使用 Ctrl+C；若该端口已有服务，请先关闭原服务。默认账号 `admin@lanse.crm`，密码 `Lanse2026`，已在登录页填写。记住登录写入 localStorage，否则仅当前会话有效。

`npm run build` 将当前仓库 Core/Data/组件与页面复制到 `site/`，生成可独立部署的静态目录。通过静态 HTTP 服务器打开 `site/index.html`。开发服务器只发送静态文件，不处理业务。需要支持 IndexedDB、原生 dialog 的现代浏览器；不能用 file 协议直接打开 ES modules。

## 功能

| 分类 | 页面与业务行为 |
| --- | --- |
| 工作空间 | 工作台、目标、趋势、漏斗、待办、动态、全局搜索与提醒；日程日历、站内信、审批中心 |
| 客户与销售 | 线索、客户、公海、联系人、商机；线索转化、公海领取/释放、可拖动阶段看板；客户跟进中心、沟通方式/结果/下次任务 |
| 项目与制造 | 项目立项、设计任务、分项采购、供应商、询价/报价版本、比价选案、审核后下单、生产计划 |
| 交易与财务 | 报价发送/接受/拒绝、生成合同、合同审批/签订、订单交付、回款确认、发票开具/作废 |
| 运营与协作 | 产品上下架、营销活动启动/结束、活动线索录入、任务完成/重新打开、工单处理/解决/关闭；拜访与会议、知识库发布/归档 |
| 工作流 | 事件触发、1–5 级审核配置、指定审核人、节点排序、模板启停/复制、待审与历史、退回/驳回重提、站内信通知 |
| 分析与管理 | 实时汇总报表、成员与角色、工作空间设置、主题切换、完整快照导出、演示数据恢复 |

24 个业务实体均支持新建、编辑、详情、删除和跟进记录。列表提供关键词/状态/负责人筛选、排序、每页 8 条分页、选择和批量删除、CSV 导出、JSON 导入。详情抽屉显示关联客户/商机/合同和反向关联业务。

协作功能：跟进中心可关联客户/联系人/商机，生成下次跟进任务；旧版沟通记录自动迁入。站内信包含收件/已发/草稿/回收站，支持读状态、搜索、分页和回复，切换设置中的演示成员即可收信。日历汇总待办、会议、活动、回款和下次跟进；审批中心与合同状态同步。具体字段、状态、最小示例、生命周期与限制见 [协作说明](docs/COLLABORATION.md)。

制造场景：签订合同 → 建立制造项目/立项审核 → 设计成果/审核 → 多笔采购 → 供应商询报价 → 比价选案/审核 → 下单 → 生产。NS-082 从立项开始，BH-016 可直接体验欧元设备比价。使用流程、字段/参数、状态、最小示例、关系门禁及限制见 [项目制造说明](docs/MANUFACTURING.md)。审核详情提供切换指定演示成员的入口。

建议体验：销售线索转客户/联系人/商机 → 创建报价 → 接受报价并生成合同 → 审批/签订 → 生成订单/交付 → 新建回款并确认到账 → 开票。在报表实时查看影响。

## 数据规则与限制

- 必填字段、邮箱、手机、数值与关联记录均校验；报价数量为正整数，产品编码与成员邮箱不能重复。
- 回款、订单、发票要求关联合同已签订；客户与合同一致。同类有效记录合计不能超过合同金额，待回款计划也占用余额。
- 已有财务/订单的合同不能降额到已占用额度以下、取消签订状态或更换客户。有引用关系的记录不能删除；批量操作先验证全部记录。
- 线索转化复用同名客户，保留原线索，建立联系人，可同时创建零金额待确认商机。
- JSON 导入只新增，系统生成编号，关联字段须使用已有记录编号。限 500 条、2MB；失败恢复本批之前的数据。通过导入窗口「导出 JSON 模板」获取完整字段示例。
- CSV 导出当前筛选结果；完整备份包含所有集合快照，当前没有完整备份恢复入口。恢复演示数据重置业务集合，保留主题和工作空间设置。
- 登录、审批、签订、到账与开票均为前端演示状态，不调用外部系统。角色展示组织信息；制造工作流按照当前演示成员与节点审核人校验，可切换成员体验。报价目前是单产品和可调整总额，不模拟复杂价税/折扣和多行明细。
- 签约仅计已签订合同；回款仅计已回款记录；管道排除赢单/流失；赢单率为赢单/(赢单+流失)。趋势为所选月累计记录，不伪造历史增长。
- 数据按浏览器和 origin 隔离，不同端口数据独立。目前支持单标签页体验，没有多标签同步；清空站点存储会移除数据。

## 结构与引入

`index.html` 加载 overlayPreset → 主题 → 当前 Core → Data → Pagination/Table/Msg/Export/approvalFlow → app ES module。

- `src/theme.js`：双主题语义色、shortcuts、光晕 customUtilities，无页面 CSS/inline style。
- `src/schema.js`、`seed.js`：字段、导航与样例数据。
- `src/data.js`：集合、持久化、CRUD 数据源、关联校验、业务流程。
- `src/workflow.js` / `workflow-ui.js`：审核模板、实例、工作台与配置器；`manufacturing.js` / `manufacturing-ui.js`：项目与采购业务；`business-rules.js` / `manufacturing-seed.js`：门禁与船舶样例。
- `src/collaboration.js`：站内信、日历、审批聚合及本地消息业务。
- `src/ui.js`、`dashboard.js`、`list.js`、`overlays.js`、`app.js`：共享界面、报表、列表、表单详情、路由和事件。
- `docs/DESIGN.md`：风格参数；`skills/lanse-crm/SKILL.md`：后续开发规范。

Table/Pagination 使用命令式 API mount，不再安装同一组件的声明式 behavior，避免分页配置被默认值覆盖。Table 的 `remote.load` 在本项目仅为异步本地 Data 查询，不发送业务网络请求；live-server 的 WebSocket 仅用于开发自动刷新。消息样式通过加载 Msg 之前的 overlayPreset 配置。

页面切换调用 Table/Pagination.destroy；每次业务写入 flush 后才显示成功；pagehide 调用持久化 close 并关闭消息；从 bfcache 返回重新初始化。输入 HTML 通过 esc/textContent 转义。

最小数据示例：

```js
const c = JquanUIData.createCollection('demo', { data: [{ id: '1', name: '云栖科技' }] });
const source = JquanUIData.createCrudDataSource(c);
await source.create({ id: '2', name: '远山智能' });
const result = c.query().orderBy({ name: 'asc' }).paginate(1, 8);
// result: { data, total, page, pageSize, pages }
const persistence = await c.persist(JquanUIData.createIndexedDBAdapter({
  name: 'demo', store: 'collections', key: 'customers'
}));
await persistence.flush();
await persistence.close();
```

## 验证

`npm run check` 检查语法、依赖与原子样式；`npm run check:browser` 执行既有 CRM 的 Edge CDP 回归；`npm run check:manufacturing` 验证制造业务链、多级审核与保护规则；`npm run build` 生成静态站。Edge 可通过 `JQUAN_BROWSER` 指定替代 Chromium 路径。回归使用隔离临时 profile，结束清理，不操作用户浏览器数据。结果与截图见 `verification/`。

仓库根另运行 `npm run check:docs`。当前源码报告版本 4.70.0、package.json 为 4.72.0，是已有基线差异；本项目不修改 Core/Data/组件 API，不重建旧压缩/Full 文件。

合同支持 CNY/USD/EUR，订单/回款/发票继承合同币种；工作台目标和趋势按 CNY，外币在报表分币种展示。制造实体业务状态由审核/阶段动作更新，导入只接受初始状态；审核记录和引用关系保护删除。approvalFlow 仅作只读时间线，实例由应用服务控制，在弹窗关闭与替换时销毁。
