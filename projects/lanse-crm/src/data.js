import { modules } from './schema.js';
import { seed } from './seed.js';
import { manufacturingSeed } from './manufacturing-seed.js';
import { manufacturingRules, manufacturingKeys } from './business-rules.js';
const D = window.JquanUIData;
export const collections = {}, sources = {};
const handles = [];
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
export const id = key => `${key.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
export const rows = key => collections[key].query().all();
export const get = (key, value) => collections[key]?.get(value);
export const settings = () => get('settings', 'workspace');
export const nameOf = (key, value) => get(key, value)?.name || '未关联';
export async function initData() {
  const initial = { ...seed(), settings: [{ id: 'workspace', name: '澜序科技', target: 1000000, owner: '林知夏', email: 'admin@lanse.crm' }] };
  for (const [key, data] of Object.entries(initial)) {
    const collection = D.createCollection(`lanse-${key}`, { data, indexes: ['status', 'owner'], historyLimit: 200 });
    collections[key] = collection;
    sources[key] = D.createCrudDataSource(collection);
    const handle = await collection.persist(D.createIndexedDBAdapter({ name: 'lanse-crm-v1', store: 'collections', key }), { debounce: 0, onError: error => window.dispatchEvent(new CustomEvent('lanse:storage-error', { detail: error })) });
    handles.push(handle);
  }
  if (!settings().manufacturingVersion) {
    const marine = manufacturingSeed();
    for (const key of ['customers', 'contracts']) for (const row of marine[key]) if (!get(key, row.id)) collections[key].insert(row);
    collections.settings.update({ id: 'workspace' }, { manufacturingVersion: 1 });
    await flush();
  }
  // Import previous free-text customer comments once, without replacing persisted data.
  if (!settings().collaborationVersion) {
    for (const entry of rows('logs').filter(r => r.name === '新增跟进记录' || r.name.startsWith('跟进'))) {
      const record = get(entry.entity, entry.recordId);
      const customerId = entry.entity === 'customers' ? record?.id : record?.customerId;
      if (!get('customers', customerId) || !entry.detail) continue;
      const migratedId = `FUP-LEGACY-${entry.id}`;
      if (!get('followups', migratedId)) collections.followups.insert({ id: migratedId, name: '历史沟通记录', customerId, contactId: entry.entity === 'contacts' ? record.id : '', opportunityId: entry.entity === 'opportunities' ? record.id : '', channel: '其他', date: entry.at.slice(0, 10), owner: entry.owner, status: '待继续跟进', nextDate: '', content: entry.detail, legacyLogId: entry.id });
    }
    collections.settings.update({ id: 'workspace' }, { collaborationVersion: 1 });
    await flush();
  }
}
export const flush = () => Promise.all(handles.map(handle => handle.flush()));
export const close = () => Promise.all(handles.map(handle => handle.close()));
export function log(key, recordId, name, detail = '') {
  collections.logs.insert({ id: id('logs'), entity: key, recordId, name, detail, owner: settings().owner, at: new Date().toISOString() });
}
export function validate(key, input, originalId) {
  const result = {};
  for (const f of modules[key].fields) {
    let value = input[f.key] ?? get(key, originalId)?.[f.key] ?? f.default ?? '';
    if (typeof value !== 'string' && typeof value !== 'number') throw new Error(`${f.label}格式不正确`);
    value = typeof value === 'string' ? value.trim() : value;
    if (f.required && value === '') throw new Error(`请填写${f.label}`);
    if (String(value).length > (f.type === 'textarea' ? 2000 : 200)) throw new Error(`${f.label}内容过长`);
    if (f.type === 'number') { value = Number(value); if (!Number.isFinite(value) || value < (f.min ?? 0)) throw new Error(`${f.label}数值不正确`); if (f.key === 'quantity' && !Number.isInteger(value)) throw new Error('数量必须是正整数'); }
    if (f.type === 'select' && !f.options.includes(value)) throw new Error(`请选择有效的${f.label}`);
    if (f.type === 'relation' && value && !get(f.collection, value)) throw new Error(`${f.label}记录不存在`);
    if (f.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('邮箱格式不正确');
    if (f.type === 'date' && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${f.label}格式不正确`);
    if (f.pattern && value && !new RegExp(`^(?:${f.pattern})$`).test(value)) throw new Error(`${f.label}格式不正确`);
    result[f.key] = value;
  }
  if (key === 'products' && rows(key).some(r => r.code === result.code && r.id !== originalId)) throw new Error('产品编码已存在');
  if (key === 'users' && result.email && rows(key).some(r => r.email === result.email && r.id !== originalId)) throw new Error('成员邮箱已存在');
  if (key === 'followups') {
    for (const [field, entity] of [['contactId', 'contacts'], ['opportunityId', 'opportunities']]) {
      if (result[field] && get(entity, result[field]).customerId !== result.customerId) throw new Error('联系人、商机必须属于所选客户');
    }
    if (result.nextDate && result.nextDate < result.date) throw new Error('下次跟进日期不能早于本次跟进日期');
  }
  if (originalId && ['contacts', 'opportunities'].includes(key) && rows('followups').some(r => r[key === 'contacts' ? 'contactId' : 'opportunityId'] === originalId && r.customerId !== result.customerId)) throw new Error('已有客户跟进引用，不能更换关联客户');
  if (key === 'appointments' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(result.time)) throw new Error('请选择有效的开始时间');
  const contract = get('contracts', result.contractId);
  if (['payments', 'invoices', 'orders'].includes(key)) {
    if (contract.status !== '已签订') throw new Error('请先完成关联合同的签订');
    result.currency = contract.currency || 'CNY';
    if (result.customerId && result.customerId !== contract.customerId) throw new Error('客户必须与合同客户一致');
    const consumed = rows(key).filter(r => r.contractId === contract.id && r.id !== originalId && r.status !== '已作废' && r.status !== '已取消').reduce((n, r) => n + r.amount, 0);
    if (consumed + result.amount > contract.amount) throw new Error(`${modules[key].singular}合计不能超过合同金额（剩余 ¥${contract.amount - consumed}）`);
  }
  if (key === 'quotes' && result.opportunityId && get('opportunities', result.opportunityId).customerId !== result.customerId) throw new Error('商机与客户不匹配');
  if (key === 'contracts') {
    if (result.quoteId && result.currency !== (get('quotes', result.quoteId).currency || 'CNY')) throw new Error('合同币种须与来源报价一致');
    if (result.quoteId && get('quotes', result.quoteId).customerId !== result.customerId) throw new Error('报价与客户不匹配');
    const committed = Math.max(...['payments', 'invoices', 'orders'].map(k => rows(k).filter(r => r.contractId === originalId && !['已作废', '已取消'].includes(r.status)).reduce((n, r) => n + r.amount, 0)), 0);
    if (committed && (result.amount < committed || result.status !== '已签订')) throw new Error('合同已有财务或订单记录，不能降额或取消签订状态');
    if (committed && get('contracts', originalId)?.customerId !== result.customerId) throw new Error('合同已有财务或订单记录，不能更换客户');
    if (committed && (get('contracts', originalId)?.currency || 'CNY') !== result.currency) throw new Error('合同已有财务或订单记录，不能更换币种');
  }
  manufacturingRules(key, result, originalId, { get, rows });
  return result;
}
export async function save(key, input, originalId) {
  return manufacturingKeys.includes(key) ? atomic(() => write(key, input, originalId)) : write(key, input, originalId);
}
async function write(key, input, originalId) {
  const data = validate(key, input, originalId);
  const original = get(key, originalId);
  if (key === 'leads' && original?.status === '已转化' && data.status !== '已转化') throw new Error('已转化线索不能退回，客户已独立管理');
  const row = original ? await sources[key].update(original, data) : await sources[key].create({ ...data, id: id(key), createdAt: today(), createdAtFull: new Date().toISOString(), ...(key === 'supplierQuotes' ? { revision: Math.max(0, ...rows(key).filter(r => r.rfqId === data.rfqId).map(r => r.revision || 1)) + 1 } : {}) });
  log(key, row.id, `${original ? '更新' : '新建'}${modules[key].singular}：${row.name}`);
  if (key === 'followups') log('customers', row.customerId, `${original ? '更新' : '新增'}跟进：${row.name}`, row.content);
  if (key === 'rfqs' && get('procurements', row.procurementId).status === '待询价') collections.procurements.update({ id: row.procurementId }, { status: '询价中' });
  if (key === 'supplierQuotes') { const rfq = get('rfqs', row.rfqId); collections.rfqs.update({ id: rfq.id }, { status: '已报价' }); const purchase = get('procurements', rfq.procurementId); if (!original && get('supplierQuotes', purchase.selectedQuoteId)?.rfqId === rfq.id) { collections.supplierQuotes.update({ id: purchase.selectedQuoteId }, { status: '未选定' }); collections.procurements.update({ id: purchase.id }, { selectedQuoteId: '', evaluationReason: '' }); } collections.procurements.update({ id: rfq.procurementId }, { status: '待评估' }); }
  if (!original && ['projects', 'designs'].includes(key)) {
    const workflow = await import('./workflow.js');
    const template = rows('workflowTemplates').find(t => t.entity === key && t.status === '已启用' && t.automatic);
    if (template) await workflow.submit(key, row.id, template.id);
  }
  await flush(); return get(key, row.id);
}
export async function createFollowupTask(row) {
  if (!row.nextDate) throw new Error('请先编辑记录，填写下次跟进日期');
  const existing = rows('tasks').find(r => r.followupId === row.id);
  if (existing) return existing;
  return atomic(async () => {
    const task = await save('tasks', { name: `跟进：${row.name}`, customerId: row.customerId, priority: '中', owner: row.owner, status: '待处理', date: row.nextDate, note: row.content });
    collections.tasks.update({ id: task.id }, { followupId: row.id });
    log('followups', row.id, '已创建下次跟进任务', task.name);
    return get('tasks', task.id);
  });
}
export async function remove(key, ids) {
  // Validate the entire batch before deleting any record.
  for (const value of ids) {
    const record = get(key, value);
    if (key === 'production' && record?.status !== '待生产') throw new Error('生产已执行，不能删除计划');
    if (['rfqs', 'supplierQuotes'].includes(key)) {
      const rfq = key === 'rfqs' ? record : get('rfqs', record?.rfqId);
      if (['审核中', '已批准', '已下单'].includes(get('procurements', rfq?.procurementId)?.status)) throw new Error('采购已进入审核或执行，不能删除询报价记录');
    }
    if (rows('workflowRuns').some(r => r.entity === key && r.recordId === value)) throw new Error('该记录已有审核历史，不能删除');
    if (key === 'supplierQuotes' && rows('procurements').some(r => r.selectedQuoteId === value)) throw new Error('报价已被选为采购方案，不能删除');
    if (key === 'followups' && rows('tasks').some(r => r.followupId === value)) throw new Error('该跟进记录已有任务，请先删除关联任务');
    for (const [other, module] of Object.entries(modules)) {
      for (const f of module.fields.filter(f => f.collection === key)) {
        if (rows(other).some(r => r[f.key] === value && !(other === key && ids.includes(r.id)))) throw new Error(`该${modules[key].singular}被${module.title}引用，请先处理关联记录`);
      }
    }
  }
  for (const value of ids) { const row = get(key, value); if (row) { if (key === 'customers') for (const message of rows('messages').filter(r => r.customerId === value)) collections.messages.update({ id: message.id }, { customerId: '', customerName: row.name }); await sources[key].remove(row); log(key, value, `删除${modules[key].singular}：${row.name}`); } }
  await flush();
}
export async function atomic(work) {
  const snapshots = Object.fromEntries(Object.entries(collections).map(([k, c]) => [k, c.exportSnapshot()]));
  try { const result = await work(); await flush(); return result; }
  catch (error) { for (const [k, c] of Object.entries(collections)) c.importSnapshot(snapshots[k], { replace: true }); await flush(); throw error; }
}
export async function convertLead(row, includeOpportunity) {
  if (row.status === '已转化') throw new Error('该线索已转化');
  return atomic(async () => {
    let customer = rows('customers').find(c => c.name === row.company);
    if (!customer) customer = await save('customers', { name: row.company, industry: '科技互联网', level: 'C · 普通客户', owner: row.owner, status: '潜在客户', phone: row.phone, email: row.email, note: row.note });
    const contact = await save('contacts', { name: row.name, customerId: customer.id, phone: row.phone, email: row.email, owner: row.owner, status: '业务联系人' });
    if (includeOpportunity) await save('opportunities', { name: `${row.company}合作机会`, customerId: customer.id, amount: 0, owner: row.owner, status: '需求确认', date: today() });
    collections.leads.update({ id: row.id }, { status: '已转化', customerId: customer.id, contactId: contact.id });
    log('leads', row.id, `线索转化：${row.company}`, '已建立客户与联系人关系。');
    return customer;
  });
}
export async function changeStatus(key, row, status) { return save(key, { ...row, status }, row.id); }
export async function resetData() {
  const initial = seed();
  for (const key of Object.keys(initial)) collections[key].import(initial[key], { replace: true });
  log('settings', 'workspace', '恢复演示数据'); await flush();
}
export async function importRows(key, input) {
  if (!Array.isArray(input) || input.length > 500 || !input.length) throw new Error('请导入包含 1–500 条记录的 JSON 数组');
  await atomic(async () => { for (const row of input) await save(key, row); });
}
