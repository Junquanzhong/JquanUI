import * as data from './data.js';
import * as workflow from './workflow.js';
export const quotesFor = purchaseId => data.rows('supplierQuotes').filter(q => data.get('rfqs', q.rfqId)?.procurementId === purchaseId);
export const purchasesFor = projectId => data.rows('procurements').filter(r => r.projectId === projectId);
export async function distribute(purchaseId, supplierIds, deadline) {
  const purchase = data.get('procurements', purchaseId), ids = [...new Set(supplierIds)];
  if (!purchase || !ids.length || ids.length > 20) throw new Error('请选择 1–20 家供应商');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) throw new Error('请选择报价截止日期');
  return data.atomic(async () => {
    const invitations = [];
    for (const supplierId of ids) {
      const supplier = data.get('suppliers', supplierId);
      if (!supplier) throw new Error('供应商不存在');
      const invitation = await data.save('rfqs', { name: `${purchase.name} · ${supplier.name}询价`.slice(0, 200), procurementId: purchaseId, supplierId, owner: purchase.owner, date: deadline, status: '待报价', note: `${purchase.quantity} ${purchase.unit}；${purchase.currency} 报价。\n${purchase.specification}` });
      invitations.push(invitation);
    }
    data.log('procurements', purchaseId, `分发 ${invitations.length} 家供应商询价`);
    return invitations;
  });
}
export async function selectQuote(purchaseId, quoteId, reason) {
  const purchase = data.get('procurements', purchaseId), quote = data.get('supplierQuotes', quoteId), text = String(reason || '').trim();
  if (!purchase || !quote || data.get('rfqs', quote.rfqId)?.procurementId !== purchaseId) throw new Error('报价不属于当前采购需求');
  if (!['待评估', '已退回', '已驳回'].includes(purchase.status)) throw new Error('当前采购阶段不能调整方案');
  if (!text || text.length > 2000) throw new Error('请填写 1–2000 字评估理由');
  if (quote.currency !== purchase.currency || quote.amount > purchase.amount) throw new Error('方案必须使用采购币种且在预算内');
  if (data.get('suppliers', data.get('rfqs', quote.rfqId).supplierId)?.status === '已停用') throw new Error('选定供应商已停用');
  // Only the latest revision of a supplier's quote may be selected.
  const versions = quotesFor(purchaseId).filter(q => q.rfqId === quote.rfqId);
  if (versions.some(q => (q.revision || 1) > (quote.revision || 1))) throw new Error('请评估该供应商最新的报价版本');
  return data.atomic(async () => {
    for (const q of quotesFor(purchaseId)) data.collections.supplierQuotes.update({ id: q.id }, { status: q.id === quoteId ? '已选定' : '未选定' });
    data.collections.procurements.update({ id: purchaseId }, { selectedQuoteId: quoteId, evaluationReason: text, status: '待评估' });
    data.log('procurements', purchaseId, `选定报价：${quote.name}`, text);
    const template = data.rows('workflowTemplates').find(t => t.entity === 'procurements' && t.status === '已启用' && t.automatic);
    if (template) await workflow.submit('procurements', purchaseId, template.id);
    return data.get('procurements', purchaseId);
  });
}
export async function issuePurchase(purchaseId) {
  const purchase = data.get('procurements', purchaseId);
  if (!purchase || purchase.status !== '已批准') throw new Error('方案审核通过后才能下单');
  const quote = data.get('supplierQuotes', purchase.selectedQuoteId);
  if (!quote || quote.amount > purchase.amount || quote.currency !== purchase.currency) throw new Error('选定报价无效');
  return data.atomic(async () => {
    data.collections.procurements.update({ id: purchaseId }, { status: '已下单', purchaseNumber: `PO-${data.id('purchase')}`, orderedAt: data.today(), orderedAmount: quote.amount });
    for (const rfq of data.rows('rfqs').filter(r => r.procurementId === purchaseId)) data.collections.rfqs.update({ id: rfq.id }, { status: '已关闭' });
    data.log('procurements', purchaseId, '采购已下单', `${quote.currency} ${quote.amount} · ${quote.name}`);
    return data.get('procurements', purchaseId);
  });
}
export async function productionAction(id, complete) {
  const record = data.get('production', id);
  if (!record || record.status !== (complete ? '生产中' : '待生产')) throw new Error('生产计划状态已变化');
  const purchases = purchasesFor(record.projectId);
  if (!purchases.length || purchases.some(r => r.status !== '已下单')) throw new Error('全部采购落实后才能开始生产');
  return data.atomic(async () => {
    data.collections.production.update({ id }, { status: complete ? '已完成' : '生产中' });
    data.collections.projects.update({ id: record.projectId }, { status: complete ? '已完成' : '生产中' });
    data.log('production', id, complete ? '生产计划已完成' : '生产已开始');
    data.log('projects', record.projectId, complete ? '生产阶段已完成' : '进入生产阶段');
    return data.get('production', id);
  });
}
