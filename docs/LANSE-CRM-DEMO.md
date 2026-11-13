# 澜序 CRM 演示项目

项目目录：`projects/lanse-crm/`。它是基于当前 JquanUI 源码与独立 Data 的纯前端 CRM，提供默认白色亮色及暗色主题、默认演示账号、24 个实体 CRUD、公海/商机看板、报价→合同→订单、财务与服务流程。

演示目录执行 `npm run dev`，使用 live-server 自动打开 `http://127.0.0.1:4173/projects/lanse-crm/` 并在源文件修改后刷新。服务根目录为仓库 `../..`；Start.cmd 在本地和全局都没有 live-server 时通过 npm install 安装 1.2.2。账号 `admin@lanse.crm` / `Lanse2026`。`npm run build` 输出可独立部署的静态 `site/`，需要现代浏览器及 HTTP 服务。无业务后端、无业务网络请求，数据按浏览器/origin 保存。

详细使用、依赖、数据规则、参数/状态、生命周期和限制见 [项目 README](../projects/lanse-crm/README.md)，风格提取见 [设计规格](../projects/lanse-crm/docs/DESIGN.md)，后续迭代规则见 [项目 skill](../projects/lanse-crm/skills/lanse-crm/SKILL.md)。

Table/Pagination 采用命令式挂载，Data 负责集合操作与持久化，Msg/Export 复用已有组件，原生 dialog 提供表单与详情。首次登录后可新建客户，再通过线索转化、商机报价、合同审批、订单交付体验业务链；写入等待 flush，页面离开 close，列表切换 destroy。

检查：在演示目录运行 `npm run check`、`npm run check:browser`；在仓库根运行 `npm run check:docs`。本项目不修改 Core/Data/组件公共 API 或原有生成产物。当前 Core 报告 4.70.0 与 package 4.72.0 是已观察到的基线差异。

新增客户跟进中心、站内信、日程日历、拜访与会议、审批中心和知识库。客户跟进关联联系人/商机并生成下次任务，旧自由文本沟通一次迁入；站内信支持草稿/收发/回复/读状态/分成员回收，日历聚合真实安排，审批直接同步合同，知识文档支持发布/归档。参数、最小示例、依赖、状态、限制与生命周期见 [协作说明](../projects/lanse-crm/docs/COLLABORATION.md)。不新增框架组件或 Data API。

项目制造扩展：签约后建立海外船舶项目，以可配置 1–5 级工作流审核立项/设计/采购方案；设计拆分多笔设备/钢材/系统采购，向供应商分发询价、保留报价版本、填写比价理由，审核后下单并安排生产。审核限定当前节点指定演示成员，意见与实例快照保留，站内信通知下一审核人。合同/采购币种一致，报表分币种统计。复用 approvalFlow 只读渲染时间线，关闭时 destroy，不修改框架 API。字段、示例、限制、升级与销毁见 [制造说明](../projects/lanse-crm/docs/MANUFACTURING.md)，专题验证为 `npm run check:manufacturing`。
