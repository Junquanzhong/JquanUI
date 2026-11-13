import * as data from './data.js';
import * as business from './manufacturing.js';
import * as workflow from './workflow.js';
import * as workflowUI from './workflow-ui.js';
import * as overlays from './overlays.js';
import { controlledKeys } from './business-rules.js';
import { esc, money, badge, button, icon, notify } from './ui.js';

export function canEdit(key, row) {
  if (!controlledKeys.includes(key) || !row) return true;
  return row.status !== '审核中' && !(key === 'projects' ? ['生产中', '已完成'] : ['已批准', '已下单', '已选定', '未选定', '生产中', '已完成']).includes(row.status);
}
const act = (label, code, key, row, primary = false) => button(label, code, null, primary, `data-key="${key}" data-id="${esc(row.id)}"`);
export function actions(key, row) {
  const run = workflow.activeRun(key, row.id), submit = act('提交审核', 'workflow-submit', key, row, true);
  let content = run ? button('查看当前审核', 'workflow-run', 'shield', true, `data-id="${esc(run.id)}"`) : '';
  if (key === 'contracts' && row.status === '已签订') content += act('建立制造项目', 'manufacturing-project', key, row);
  if (key === 'projects') content += ['草稿', '已退回', '已驳回'].includes(row.status) ? submit : row.status === '已立项' ? act('创建设计任务', 'manufacturing-design', key, row, true) + (business.purchasesFor(row.id).length && business.purchasesFor(row.id).every(p => p.status === '已下单') ? act('安排生产', 'manufacturing-production', key, row) : '') : '';
  if (key === 'designs') content += ['草稿', '已退回', '已驳回'].includes(row.status) ? submit : row.status === '已批准' ? act('拆分采购需求', 'manufacturing-purchase', key, row, true) : '';
  if (key === 'procurements') content += act('比较报价方案', 'manufacturing-compare', key, row) + (['待询价', '询价中', '待评估', '已退回', '已驳回'].includes(row.status) ? act('分发供应商询价', 'manufacturing-distribute', key, row) + (row.selectedQuoteId ? submit : '') : row.status === '已批准' ? act('确认采购下单', 'manufacturing-issue', key, row, true) : '');
  if (key === 'rfqs' && row.status !== '已关闭') content += act('录入供应商报价', 'manufacturing-quote', key, row, true);
  if (key === 'supplierQuotes') { const rfq = data.get('rfqs', row.rfqId), purchase = data.get('procurements', rfq?.procurementId); if (purchase) content += button('查看采购比价', 'manufacturing-compare', 'wallet', false, `data-key="procurements" data-id="${esc(purchase.id)}"`); if (purchase && ['询价中', '待评估', '已退回', '已驳回'].includes(purchase.status)) content += act('新增报价版本', 'manufacturing-requote', key, row); }
  if (key === 'production') content += row.status === '待生产' ? act('开始生产', 'manufacturing-start', key, row, true) : row.status === '生产中' ? act('完成生产阶段', 'manufacturing-complete', key, row, true) : '';
  return content;
}
export function detailExtra(key, row) {
  let content = '';
  if (key === 'projects') {
    const designs = data.rows('designs').filter(d => d.projectId === row.id), purchases = business.purchasesFor(row.id), production = data.rows('production').find(p => p.projectId === row.id);
    const progress = [['合同', '已签订'], ['立项', row.status === '草稿' ? '待提交' : row.status], ['设计', designs.some(d => d.status === '已批准') ? '已批准' : `${designs.length} 个任务`], ['采购', `${purchases.filter(p => p.status === '已下单').length} / ${purchases.length} 已下单`], ['生产', production?.status || '待安排']];
    content += `<section class="panel bg-raised p-4 mt-6"><h4 class="section-title mb-4">项目全景</h4><div class="grid grid-cols-2 sm:grid-cols-3 gap-3">${progress.map(([name, value]) => `<div class="rounded-lg bg-surface p-3"><p class="subtle">${name}</p><p class="text-sm font-medium mt-2">${esc(value)}</p></div>`).join('')}</div><div class="grid grid-cols-2 gap-4 border-t border-stroke mt-4 pt-4"><div><p class="subtle">分项采购预算</p><p class="text-primary font-semibold mt-2">${money(purchases.reduce((n, p) => n + p.amount, 0), row.currency)}</p></div><div><p class="subtle">已下单金额</p><p class="font-semibold mt-2">${money(purchases.reduce((n, p) => n + (p.orderedAmount || 0), 0), row.currency)}</p></div></div></section>`;
  }
  if (key === 'procurements' && row.selectedQuoteId) {
    const quote = data.get('supplierQuotes', row.selectedQuoteId);
    content += `<section class="rounded-xl p-4 bg-primary/5 border border-primary/15 mt-5"><p class="text-primary font-medium">选定方案 · ${esc(quote?.name)}</p><p class="text-lg font-semibold mt-2">${money(quote?.amount, row.currency)}</p><p class="text-sm text-muted whitespace-pre-wrap break-words mt-3">${esc(row.evaluationReason)}</p>${row.purchaseNumber ? `<p class="subtle mt-3">采购单号 ${esc(row.purchaseNumber)} · ${esc(row.orderedAt)}</p>` : ''}</section>`;
  }
  const history = data.rows('workflowRuns').filter(r => r.entity === key && r.recordId === row.id).sort((a, b) => b.at.localeCompare(a.at));
  if (history.length) content += `<h4 class="section-title mt-6 mb-3">审核历史</h4><div class="grid gap-2">${history.map(r => `<button class="text-left p-3 bg-raised rounded-lg flex flex-wrap justify-between items-center gap-2" data-action="workflow-run" data-id="${esc(r.id)}"><span class="text-xs">${esc(r.templateName)}<span class="block subtle mt-1">${new Date(r.at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span></span>${badge(r.status)}</button>`).join('')}</div>`;
  return content;
}
function fill(id, value) { const node = document.getElementById(`f-${id}`); if (node) node.value = value || ''; }
function filterRelation(field, key, predicate) {
  const node = document.getElementById(`f-${field}`); if (!node) return;
  const previous = node.value;
  node.innerHTML = '<option value="">请选择</option>' + data.rows(key).filter(predicate).map(r => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  if ([...node.options].some(o => o.value === previous)) node.value = previous;
}
export function formChange(key, changed, initial = false) {
  const value = field => document.getElementById(`f-${field}`)?.value;
  if (['payments', 'invoices', 'orders'].includes(key)) { const contract = data.get('contracts', value('contractId')); if (contract) fill('currency', contract.currency || 'CNY'); }
  if (key === 'projects') {
    filterRelation('contractId', 'contracts', r => r.status === '已签订');
    if (changed === 'contractId') { const c = data.get('contracts', value('contractId')); if (c) for (const f of ['customerId', 'currency', 'country', 'deliveryTerms', 'paymentTerms']) fill(f, c[f] || (f === 'currency' ? 'CNY' : '')); }
    filterRelation('opportunityId', 'opportunities', r => !value('customerId') || r.customerId === value('customerId'));
  }
  if (['designs', 'procurements', 'production'].includes(key)) filterRelation('projectId', 'projects', r => r.status === '已立项' && (key !== 'production' || business.purchasesFor(r.id).length && business.purchasesFor(r.id).every(p => p.status === '已下单')));
  if (key === 'procurements') { filterRelation('designId', 'designs', r => r.projectId === value('projectId') && r.status === '已批准'); if (!initial) { const project = data.get('projects', value('projectId')); if (project) fill('currency', project.currency); } }
  if (key === 'rfqs') {
    filterRelation('procurementId', 'procurements', r => ['待询价', '询价中', '待评估', '已退回', '已驳回'].includes(r.status));
    const purchase = data.get('procurements', value('procurementId'));
    filterRelation('supplierId', 'suppliers', r => r.status !== '已停用' && (!purchase || ['综合', purchase.category].includes(r.category)));
  }
  if (key === 'supplierQuotes') {
    filterRelation('rfqId', 'rfqs', r => r.status !== '已关闭' && ['询价中', '待评估', '已退回', '已驳回'].includes(data.get('procurements', r.procurementId)?.status));
    if (!initial) { const rfq = data.get('rfqs', value('rfqId')), purchase = rfq && data.get('procurements', rfq.procurementId); if (purchase) fill('currency', purchase.currency); }
  }
}
function distributionDialog(row) {
  const suppliers = data.rows('suppliers').filter(s => s.status !== '已停用' && ['综合', row.category].includes(s.category) && !data.rows('rfqs').some(r => r.procurementId === row.id && r.supplierId === s.id));
  overlays.dismiss();
  overlays.open(`${overlays.header('分发供应商询价', esc(row.name))}<form id="purchase-distribute-form" data-id="${esc(row.id)}" class="p-6"><p class="text-sm text-muted mb-4">${esc(row.quantity)} ${esc(row.unit)} · 采购币种 ${esc(row.currency)}。每家供应商生成独立询价单。</p><div class="grid gap-3">${suppliers.map(s => `<label class="flex gap-3 items-start p-4 rounded-xl bg-raised"><input type="checkbox" name="supplierIds" value="${esc(s.id)}" class="accent-primary mt-1"><span><span class="block font-medium">${esc(s.name)}</span><span class="block subtle mt-1">${esc(s.contact)} · ${esc(s.country)} · ${esc(s.category)}</span></span></label>`).join('') || '<p class="text-muted">符合分类的供应商均已受邀，或暂无可用供应商。请先维护供应商档案。</p>'}</div><label for="rfq-deadline" class="block mt-5 mb-2">报价截止日期</label><input id="rfq-deadline" name="date" type="date" required class="field w-full h-11" value="${data.today()}"><p id="form-error" class="text-danger mt-4" role="alert"></p><div class="flex justify-end gap-3 mt-5">${button('取消', 'close')}<button type="submit" class="btn-primary" ${!suppliers.length ? 'disabled' : ''}>分发询价</button></div></form>`);
}
export function compareDialog(row) {
  const quotes = business.quotesFor(row.id), editable = ['待评估', '已退回', '已驳回'].includes(row.status);
  overlays.dismiss();
  overlays.open(`${overlays.header('评估与选定报价方案', esc(row.name))}<div class="p-6"><div class="flex flex-wrap gap-3 mb-5"><span class="badge">预算 ${money(row.amount, row.currency)}</span>${badge(row.status)}<span class="subtle">报价 ${quotes.length} 份 · 按同一币种比较</span></div><form id="purchase-evaluate-form" data-id="${esc(row.id)}"><div class="overflow-auto"><table class="min-w-full border-collapse text-sm"><thead class="bg-raised text-muted text-xs"><tr>${['选择', '供应商 / 版本', '总金额', '交期', '质保 / 方案'].map(t => `<th class="table-cell py-3">${t}</th>`).join('')}</tr></thead><tbody>${quotes.map(q => { const rfq = data.get('rfqs', q.rfqId), latest = !quotes.some(other => other.rfqId === q.rfqId && (other.revision || 1) > (q.revision || 1)), eligible = editable && latest && q.amount <= row.amount; return `<tr><td class="table-cell"><input type="radio" name="quoteId" value="${esc(q.id)}" ${q.id === row.selectedQuoteId ? 'checked' : ''} ${!eligible ? 'disabled' : ''} ${editable ? 'required' : ''} class="accent-primary" aria-label="选择${esc(q.name)}"></td><td class="table-cell"><span class="block font-medium">${esc(data.nameOf('suppliers', rfq.supplierId))}</span><span class="subtle block mt-1">${esc(q.version)} · ${latest ? '最新版本' : '历史版本'}</span></td><td class="table-cell ${q.amount > row.amount ? 'text-danger' : 'text-primary'} font-semibold">${money(q.amount, q.currency)}${q.amount > row.amount ? '<span class="block subtle">超出预算</span>' : ''}</td><td class="table-cell">${q.deliveryDays} 天</td><td class="table-cell"><span class="block">${esc(q.warranty)}</span><span class="block subtle mt-1">${esc(q.note || '—')}</span></td></tr>`; }).join('') || '<tr><td colspan="5" class="p-8 text-center text-muted">还没有供应商报价，请先分发询价并录入报价。</td></tr>'}</tbody></table></div><label for="evaluation-reason" class="block mt-5 mb-2">评估与选定理由</label><textarea id="evaluation-reason" name="reason" class="field w-full h-24 py-3" maxlength="2000" ${editable ? 'required' : 'disabled'} placeholder="综合技术匹配、金额、交期和质保说明选择原因…">${esc(row.evaluationReason || '')}</textarea><p id="form-error" class="text-danger mt-4" role="alert"></p><div class="flex flex-wrap justify-end gap-3 mt-5">${button('关闭', 'close')}${editable && quotes.length ? '<button type="submit" class="btn-primary">保存选定方案</button>' : ''}</div></form></div>`, false, 'max-w-4xl');
}
export async function action(element, refresh) {
  const { key, id } = element.dataset, row = data.get(key, id);
  if (!row) throw new Error('业务记录不存在');
  switch (element.dataset.action) {
    case 'manufacturing-project': overlays.form('projects', null, { name: `${row.name} · 制造项目`, contractId: row.id, customerId: row.customerId, currency: row.currency || 'CNY', country: row.country || '', deliveryTerms: row.deliveryTerms || 'FOB', paymentTerms: row.paymentTerms || '', owner: row.owner, date: row.date }); return;
    case 'manufacturing-design': overlays.form('designs', null, { name: `${row.name} · 设计任务`, projectId: id, owner: row.owner }); return;
    case 'manufacturing-purchase': { const project = data.get('projects', row.projectId); overlays.form('procurements', null, { name: `${project.name} · 采购需求`, projectId: project.id, designId: id, currency: project.currency, owner: project.owner }); return; }
    case 'manufacturing-production': { const existing = data.rows('production').find(p => p.projectId === id); if (existing) overlays.detail('production', existing.id); else overlays.form('production', null, { name: `${row.name} · 生产计划`, projectId: id, owner: row.owner }); return; }
    case 'manufacturing-distribute': distributionDialog(row); return;
    case 'manufacturing-compare': compareDialog(row); return;
    case 'manufacturing-quote': { const purchase = data.get('procurements', row.procurementId); overlays.form('supplierQuotes', null, { name: `${data.nameOf('suppliers', row.supplierId)} · 报价`, rfqId: id, currency: purchase.currency, owner: row.owner }); return; }
    case 'manufacturing-requote': overlays.form('supplierQuotes', null, { ...row, status: '待评估', version: `V${Math.max(...business.quotesFor(data.get('rfqs', row.rfqId).procurementId).filter(q => q.rfqId === row.rfqId).map(q => q.revision || 1)) + 1}` }); return;
    case 'manufacturing-issue': if (await overlays.confirm('确认采购下单？', '将按审核通过的报价记录采购单号，锁定方案并关闭询价。')) { await business.issuePurchase(id); notify('采购已下单'); } break;
    case 'manufacturing-start': case 'manufacturing-complete': { const complete = element.dataset.action === 'manufacturing-complete'; if (await overlays.confirm(complete ? '完成生产阶段？' : '开始生产？', '将同步项目与生产计划的阶段状态。')) { await business.productionAction(id, complete); notify('生产状态已更新'); } break; }
  }
  await refresh();
}
export function install() {
  Object.assign(overlays.extension, { canEdit, actions, detail: detailExtra, afterForm: (key, row) => formChange(key, '', true) });
}
