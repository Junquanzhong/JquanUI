export const manufacturingKeys = ['projects', 'designs', 'procurements', 'suppliers', 'rfqs', 'supplierQuotes', 'production'];
export const controlledKeys = manufacturingKeys.filter(key => key !== 'suppliers');
export const initialStatus = { projects: '草稿', designs: '草稿', procurements: '待询价', rfqs: '待报价', supplierQuotes: '待评估', production: '待生产' };

export function manufacturingRules(key, result, originalId, { get, rows }) {
  const original = get(key, originalId);
  if (controlledKeys.includes(key)) {
    if (result.status !== (original?.status || initialStatus[key])) throw new Error('业务状态由提交、审核和阶段动作更新，不能直接修改');
    if (original && (original.status === '审核中' || ['designs', 'procurements', 'supplierQuotes', 'production'].includes(key) && ['已批准', '已下单', '已选定', '未选定', '生产中', '已完成'].includes(original.status))) throw new Error('该记录已进入审核或执行阶段，不能直接编辑');
  }
  if (key === 'projects') {
    const contract = get('contracts', result.contractId);
    if (contract.status !== '已签订') throw new Error('项目必须关联已签订合同');
    if (contract.customerId !== result.customerId) throw new Error('项目客户必须与合同客户一致');
    if ((contract.currency || 'CNY') !== result.currency) throw new Error('项目币种必须与合同一致');
    if (result.opportunityId && get('opportunities', result.opportunityId).customerId !== result.customerId) throw new Error('来源商机与项目客户不一致');
    if (original && rows('designs').some(r => r.projectId === originalId) && ['contractId', 'customerId', 'currency'].some(f => original[f] !== result[f])) throw new Error('项目已有设计任务，不能更换合同、客户或币种');
    if (original && ['生产中', '已完成'].includes(original.status)) throw new Error('项目已进入生产，不能编辑立项资料');
  }
  if (key === 'designs') {
    if (get('projects', result.projectId).status !== '已立项') throw new Error('项目须通过立项审核后才能创建设计任务');
    if (rows(key).some(r => r.projectId === result.projectId && r.version === result.version && r.id !== originalId)) throw new Error('该项目的设计版本已存在');
  }
  if (key === 'procurements') {
    const project = get('projects', result.projectId), design = get('designs', result.designId);
    if (project.status !== '已立项' || design.status !== '已批准') throw new Error('项目立项与设计审核通过后才能建立采购需求');
    if (design.projectId !== project.id) throw new Error('来源设计必须属于所选项目');
    if (project.currency !== result.currency) throw new Error('采购币种必须与项目一致');
    const budget = rows(key).filter(r => r.projectId === project.id && r.id !== originalId).reduce((n, r) => n + r.amount, 0);
    if (budget + result.amount > get('contracts', project.contractId).amount) throw new Error('项目采购预算合计不能超过合同金额');
    if (original && rows('rfqs').some(r => r.procurementId === originalId) && ['projectId', 'designId', 'category', 'quantity', 'unit', 'currency', 'specification'].some(f => original[f] !== result[f])) throw new Error('需求已分发询价，技术规格不可更改；修改技术方案请另建采购需求');
  }
  if (key === 'rfqs') {
    const purchase = get('procurements', result.procurementId), supplier = get('suppliers', result.supplierId);
    if (!['待询价', '询价中', '待评估', '已退回', '已驳回'].includes(purchase.status)) throw new Error('该采购已进入审核或执行，不能分发询价');
    if (supplier.status === '已停用') throw new Error('供应商已停用');
    if (!['综合', purchase.category].includes(supplier.category)) throw new Error('供应商供货分类与采购需求不符');
    if (rows(key).some(r => r.procurementId === result.procurementId && r.supplierId === result.supplierId && r.id !== originalId)) throw new Error('该需求已向此供应商分发询价');
    if (original && rows('supplierQuotes').some(r => r.rfqId === originalId) && ['procurementId', 'supplierId'].some(f => original[f] !== result[f])) throw new Error('询价已有报价，不能更换采购或供应商');
  }
  if (key === 'supplierQuotes') {
    const rfq = get('rfqs', result.rfqId), purchase = get('procurements', rfq.procurementId);
    if (!['询价中', '待评估', '已退回', '已驳回'].includes(purchase.status) || rfq.status === '已关闭') throw new Error('该采购方案已锁定，不能录入或编辑报价');
    if (result.currency !== purchase.currency) throw new Error('报价币种必须与采购需求一致');
    if (!Number.isInteger(result.deliveryDays)) throw new Error('交期天数必须为整数');
    if (rows(key).some(r => r.rfqId === rfq.id && r.version === result.version && r.id !== originalId)) throw new Error('该供应商报价版本已存在，请使用新版本号');
    if (original && original.rfqId !== result.rfqId) throw new Error('报价不能更换来源询价');
  }
  if (key === 'production') {
    const purchases = rows('procurements').filter(r => r.projectId === result.projectId);
    if (get('projects', result.projectId).status !== '已立项' || !purchases.length || purchases.some(r => r.status !== '已下单')) throw new Error('所有分项采购审核通过并下单后才能安排生产');
    if (rows(key).some(r => r.projectId === result.projectId && r.id !== originalId)) throw new Error('该项目已有生产计划');
    if (result.startDate > result.date) throw new Error('生产结束日期不能早于开始日期');
  }
  if (key === 'contracts' && original && rows('projects').some(r => r.contractId === originalId) && (result.status !== '已签订' || original.customerId !== result.customerId || (original.currency || 'CNY') !== result.currency)) throw new Error('合同已有制造项目，不能取消签订、更换客户或币种');
  if (key === 'suppliers' && result.status === '已停用' && rows('rfqs').some(r => r.supplierId === originalId && r.status !== '已关闭')) throw new Error('供应商仍有未关闭询价，不能停用');
}
