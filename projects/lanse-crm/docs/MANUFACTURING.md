# 项目制造与可配置审核工作流

## 用途与入口

以签约后的船舶订单作为制造项目，贯通立项审核、设计审核、分项采购、供应商询报价、评估选案、采购审核、下单和生产状态。导航新增「项目与制造」七类标准业务页面；「管理」包含工作流配置与审核工作台。保持白色默认主题与原有明暗视觉令牌。

业务仍由本地 JquanUI Data 集合与 IndexedDB 保存，没有金蝶或其他业务接口。入口引入顺序为 overlayPreset → theme → Core → Data → Pagination/Table/Msg/Export/approvalFlow → app。approvalFlow 只作审核快照的只读时间线展示，动作、权限与阶段状态由应用服务控制；不安装其自动 behavior，不使用组件内置 approve/reject 写业务状态。

## 建议体验

1. 打开「项目档案」的 `NS-082 · 8200DWT 多用途船`，提交立项审核。可在合同详情「建立制造项目」，继承合同客户、币种、国家及商业条款；默认项目流程在新建时自动启动。
2. 在流程详情点击「以陈屿体验审核」，填写意见并通过一级审核；切换林知夏处理二级审核。也可在系统设置切换当前成员，打开审核工作台「我的待审」。通过最后一级后，项目进入「已立项」。
3. 创建设计任务，填写设计院、版本和成果/采购清单，提交技术与项目审核。完成后，在设计详情「拆分采购需求」，分别录入设备、钢材、系统及其预算和技术规格。
4. 在采购详情分发供应商询价，每家受邀供应商有独立询价单；从询价详情录入供应商总报价、币种、交期、质保和版本。
5. 在「比较报价方案」选择方案并填写理由。金额、交期和质保供人决策，系统不替代采购人员自动选案。可新增报价版本；选定供应商提供新版本后须重新评估，历史版本保留。
6. 提交采购方案审核，通过后确认下单，生成采购单号并关闭对应询价。项目所有采购下单后，安排生产计划；开始/完成生产同步项目状态。

另一个样例 `BH-016 · 海工服务船` 已完成立项与设计，可直接体验欧元设备比价及钢材询价。初始样例的已批准状态表示此前已完成的阶段；只有本次实际提交后的审核有逐节点运行历史。

生产后的检验、试航、交付、结算与质保待业务访谈确认，目前只展示生产计划和生产状态，不为这些后续节点编造规则。

## 标准业务实体

| 集合 / 页面 | 字段与状态 |
| --- | --- |
| projects / 项目档案 | 客户、已签合同、可选来源商机、国家、CNY/USD/EUR、EXW/FOB/CIF/DAP、付款节点、负责人、计划日期；草稿/审核中/已立项/已退回/已驳回/生产中/已完成 |
| designs / 设计任务 | 项目、设计院、版本、负责人、日期、成果与采购清单；草稿/审核中/已批准/已退回/已驳回 |
| procurements / 采购需求 | 项目、批准的设计、设备/钢材/系统/其他、数量、单位、预算、币种、负责人、要求日期、技术规格；待询价/询价中/待评估/审核中/已批准/已下单/已退回/已驳回 |
| suppliers / 供应商 | 名称、供货分类、联系人、联系方式、国家、负责人、备注；合作中/候选/已停用 |
| rfqs / 供应商询价 | 采购、受邀供应商、负责人、截止日期、说明；待报价/已报价/已关闭 |
| supplierQuotes / 供应商报价 | 询价、版本、总额、币种、交期天数、质保、负责人、说明；待评估/已选定/未选定 |
| production / 生产计划 | 项目、负责人、开始/完成日期、备注；待生产/生产中/已完成 |

这七类复用既有表单、Table/Pagination、详情、搜索/状态/负责人筛选、排序、CSV/JSON 导出、JSON 批量导入及删除保护，业务实体总数为 24。流程管理的状态字段只展示，不接受通用表单改状态；新建/导入须使用初始业务状态，随后走阶段动作。供应商状态采用通用 CRUD。

关键规则：客户与合同一致，项目/采购/报价币种一致，设计属于所选项目；设计版本在项目内唯一，报价版本在询价内唯一。采购预算合计不能超过来源合同金额；选案不得超预算，只能选择该供应商最新报价版本。供应商供货分类必须匹配需求或为综合；同一采购对同一供应商只分发一次，未关闭询价的供应商不能停用。询价分发失败恢复整批，避免部分邀请落盘。

审核中记录锁定，设计/采购已批准和执行中的记录不能普通编辑。已分发的采购技术规格保持不变，技术方案变更另建需求；退回后可修改预算/负责人/日期或重新评估方案再提交。已经选定/未选定的历史报价不能覆盖编辑，使用「新增报价版本」保留修订。审批后的采购方案与询报价记录锁定，审核历史保护原业务记录和模板；生产已经执行时不能删除计划。

## 工作流模板与实例

模板字段为 `id/name/entity/status/automatic/steps/updatedAt`；`entity` 为 projects/designs/procurements，`status` 为已启用/已停用。每个事件只能启用一个模板，可复制停用模板、编辑、启停、导出与删除尚未运行的模板。配置器支持 1–5 个有序节点，填写步骤名称、指定已启用成员，上移/下移/删除节点，实时预览「发生 → 步骤 → 结束」。

`automatic: true` 的触发点：项目新建、设计成果新建、采购选案保存。关闭自动启动后，通过业务详情手动提交；现有种子数据不会因模板启用而自动重跑。没有可用模板或审核人失效时，提交报错，不直接跳过审核。

运行实例字段为 `id/name/entity/recordId/templateId/templateName/submitter/status/index/at/completedAt/recordSnapshot/steps`。提交时保存完整业务记录与节点快照；模板之后的编辑、启停不会重写已有实例。节点状态为 current/pending/completed/rejected，处理结果为通过/退回修改/驳回，记录审核人、意见和时间。

实例状态为审核中/已通过/已退回/已驳回。只有当前节点指定成员能处理，审核意见必填 1–1000 字。通过推进到下一节点，最后一步通过才更新原业务阶段；退回或驳回结束本次实例，修改重提会创建新实例并保留旧历史。重复提交和过期节点索引被拒绝。当前审核人、下一审核人、发起者通过本地站内信获得待审和结论通知，消息内可打开对应流程。

审核工作台提供我的待审/我发起的/全部历史、关键词和状态筛选及每页 8 条分页。角色身份仍为演示成员切换，审核人限制用于模拟正常业务操作，不是服务端权限。配置暂限顺序人工审核，暂不支持并行会签、条件分支、脚本、自动催办或撤回。

## 应用服务与最小示例

```js
import { save } from './src/data.js';
import { saveTemplate, submit, decide } from './src/workflow.js';

// 同一事件已有启用模板时，先停用它，再启用新的模板。
const template = await saveTemplate({
  name: '设计两级审核', entity: 'designs', status: '已停用', automatic: false,
  steps: [
    { title: '技术审核', reviewer: '许清禾' },
    { title: '项目确认', reviewer: '林知夏' }
  ]
});
const design = await save('designs', {
  name: 'BH-016 详细设计', projectId: 'MAR-PRJ-2', institute: '海岳设计院',
  version: 'V2', owner: '许清禾', date: '2026-12-20',
  deliverables: '技术规格与分项采购清单已完成。'
});
const run = await submit('designs', design.id, 'WF-DESIGN');
// 当前成员切换为首个节点的许清禾后调用；expectedIndex 防重复/过期操作。
await decide(run.id, 0, 'approve', '技术资料完整，同意推进。');
```

`saveTemplate(input, originalId?)` 返回模板；`submit(entity, recordId, templateId?)` 返回新实例；`decide(runId, expectedIndex, decision, comment)` 返回更新后的实例，decision 为 approve/return/reject。`activeRun(entity,id)` 返回审核中实例或 undefined；`pendingForMe()` 返回当前成员待审数组。无效参数/关系/阶段/审核人抛出 Error。

```js
import { distribute, selectQuote, issuePurchase } from './src/manufacturing.js';
// 初始设备采购已有两份报价，可直接评估。
await selectQuote('MAR-PUR-1', 'MAR-SQ-1', '交期更短且支持现场调试，满足技术要求。');
// 在采购审核通过后：
// const ordered = await issuePurchase('MAR-PUR-1');
// ordered: 采购记录，包含 purchaseNumber/orderedAt/orderedAmount

// 初始钢材需求可以分发：
const invitations = await distribute('MAR-PUR-2', ['MAR-SUP-3'], '2026-12-01');
```

`distribute(purchaseId,supplierIds,deadline)` 返回询价记录数组；`selectQuote(purchaseId,quoteId,reason)` 返回采购记录，理由必填 1–2000 字；`issuePurchase(id)` 返回下单后的采购；`productionAction(id,complete)` 返回生产计划，complete=false 开始、true 完成。`quotesFor(id)` 与 `purchasesFor(id)` 只读查询。所有写入等待 flush，多集合动作经应用 atomic 快照恢复。这些是项目应用函数，未扩展 Data 或 Core 公共 API。

## 外贸金额

合同新增币种、国家、交付和付款条款。旧合同缺失币种按 CNY 读取；项目继承并校验来源合同币种。订单/回款/发票继承合同币种，详情与列表显示实际货币符号，导出包含币种。金额字段仍为总价，供应商报价的单位、数量和技术要求来自询价/采购关联。

工作台目标、趋势和团队金额按 CNY 汇总；分析报表新增 CNY/USD/EUR 各自的已签合同与已回款合计。外币不折算、不混加。既有销售商机与单产品客户报价仍按人民币演示，关联客户报价生成的合同要求人民币一致；外币合同可独立新建。

## 升级、生命周期与验收

缺少的新集合通过原有每集合 IndexedDB persist 初始化；settings.manufacturingVersion 首次升级只增补缺少的 MAR-CUS/MAR-CTR 样例依赖，不覆盖原客户、合同与设置。新实体、模板与实例纳入完整备份和演示数据恢复；恢复时清空自建流程与历史，主题/设置保留。

页面继续销毁 Table/Pagination；审核详情以 approvalFlowApi.mount 渲染只读时间线，overlay 的 cleanup 注册 destroy，在替换/关闭/Escape 时释放。原生 dialog 负责焦点和关闭。所有业务/意见/模板输入纯文本转义，采购比价表在手机局部横向滚动。无新增全局定时器或业务网络请求。

验证命令：项目 `npm run check`、`npm run check:browser`、`npm run check:manufacturing`、`npm run build`、`node scripts/check-browser.cjs --portable`，根 `npm run check:docs`。结果、双主题与手机截图见 verification，实际通过数量记录在对应 JSON 和 REVIEW。既有 select 组件文档漂移保留基线；未修改框架组件/Core/Data 源码或旧压缩产物。
