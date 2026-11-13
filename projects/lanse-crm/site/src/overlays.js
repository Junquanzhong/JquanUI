import { modules, stages } from './schema.js';
import { rows, get, settings, nameOf, today } from './data.js';
import { esc, icon, money, badge, button } from './ui.js';
const overlay = () => document.getElementById('overlay');
export let current = null;
export const extension = { canEdit: () => true, actions: () => '', detail: () => '', afterForm: () => {}, options: (_, items) => items };
const cleanups = new Set();
export const registerCleanup = callback => cleanups.add(callback);
function cleanup() { for (const callback of cleanups) callback(); cleanups.clear(); }
document.getElementById('overlay').addEventListener('close', () => { if (!overlay().open) { cleanup(); current = null; } });
export function dismiss() { cleanup(); overlay().close(); current = null; }
export function open(content, drawer = false, maxWidth = 'max-w-2xl') {
  cleanup();
  const el = overlay();
  el.className = drawer ? 'fixed top-0 bottom-0 right-0 left-auto m-0 w-full max-w-xl h-screen max-h-screen p-0 text-ink bg-surface border-l border-stroke shadow-2xl backdrop:bg-black/60' : `fixed inset-0 w-[calc(100%-2rem)] ${maxWidth} max-h-[90vh] p-0 text-ink bg-surface border border-stroke rounded-2xl shadow-2xl backdrop:bg-black/60`;
  el.innerHTML = content;
  if (!el.open) el.showModal();
}
export const header = (title, subtitle = '') => `<div class="sticky top-0 z-10 bg-surface px-6 py-5 border-b border-stroke flex justify-between gap-4 items-center"><div><h2 class="text-lg font-semibold">${title}</h2>${subtitle ? `<p class="subtle mt-1">${subtitle}</p>` : ''}</div><button type="button" class="btn-icon" data-action="close" aria-label="关闭">${icon('close')}</button></div>`;
export function form(key, originalId, prefill = {}) {
  const module = modules[key], row = originalId ? get(key, originalId) : prefill;
  if (originalId && !extension.canEdit(key, row)) throw new Error('该记录已进入审核或执行阶段，不能直接编辑');
  current = { key, id: originalId, mode: 'form' };
  open(`${header(`${originalId ? '编辑' : '新建'}${module.singular}`, '完善业务信息，带 * 的项目为必填项。')}<form id="record-form" data-key="${key}" data-id="${originalId || ''}" class="p-6"><div class="grid grid-cols-1 sm:grid-cols-2 gap-5">${module.fields.map(f => field(f, row?.[f.key] ?? f.default ?? (f.key === 'owner' ? settings().owner : f.type === 'date' ? (f.required ? today() : '') : f.type === 'select' ? f.options[0] : f.type === 'number' ? f.key === 'quantity' ? 1 : '' : ''))).join('')}</div><p id="form-error" class="text-danger text-sm mt-4" role="alert"></p><div class="flex justify-end gap-3 pt-5 mt-5 border-t border-stroke">${button('取消', 'close')}<button class="btn-primary" type="submit">${icon('check', 'w-4 h-4')}保存${module.singular}</button></div></form>`);
  if (key === 'followups') filterFollowupRelations();
  extension.afterForm(key, row);
}
export function filterFollowupRelations() {
  const customerId = document.getElementById('f-customerId').value;
  for (const [field, key] of [['contactId', 'contacts'], ['opportunityId', 'opportunities']]) {
    const select = document.getElementById(`f-${field}`), previous = select.value;
    select.innerHTML = '<option value="">暂不关联</option>' + rows(key).filter(r => r.customerId === customerId).map(r => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
    if ([...select.options].some(o => o.value === previous)) select.value = previous;
  }
}
function field(f, value) {
  const attrs = `id="f-${f.key}" name="${f.key}" ${f.required ? 'required' : ''} ${f.readOnly ? 'disabled' : ''}`;
  let control;
  if (['select', 'relation'].includes(f.type)) {
    const options = f.type === 'relation' ? extension.options(f, rows(f.collection)).map(r => [r.id, r.name]) : f.options.map(s => [s, s]);
    control = `<select ${attrs} class="field w-full h-11"><option value="">请选择${f.label}</option>${options.map(([v, label]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
  } else if (f.type === 'textarea') control = `<textarea ${attrs} class="field w-full h-24 py-3 resize-y" maxlength="2000" placeholder="补充需求、沟通信息或业务备注">${esc(value)}</textarea>`;
  else control = `<input ${attrs} type="${f.type}" class="field w-full h-11" value="${esc(value)}" ${f.min !== undefined ? `min="${f.min}" step="${f.key === 'quantity' ? '1' : '.01'}"` : ''} ${f.pattern ? `pattern="${f.pattern}"` : ''} ${f.type === 'text' ? 'maxlength="200"' : ''} placeholder="请输入${f.label}">`;
  return `<div class="${f.type === 'textarea' ? 'sm:col-span-2' : ''}"><label class="block text-sm mb-2" for="f-${f.key}">${f.label}${f.readOnly ? `（${f.readOnlyHint || '流程更新'}）` : ''}${f.required ? '<span class="text-primary ml-1">*</span>' : ''}</label>${control}</div>`;
}
function workflow(key, row) {
  const action = (label, code, primary = false) => button(label, code, primary ? 'arrow' : null, primary, `data-key="${key}" data-id="${row.id}"`);
  switch (key) {
    case 'leads': return row.status !== '已转化' ? action('转为客户', 'convert', true) : `<a class="btn" href="#/customers" data-action="close">查看客户</a>`;
    case 'customers': return row.status === '公海客户' ? action('领取客户', 'claim', true) : action('转入公海', 'release') + action('创建商机', 'related-opportunity', true);
    case 'opportunities': return !['赢单', '流失'].includes(row.status) ? action('推进下一阶段', 'advance', true) + action('标记流失', 'lost') + action('创建报价', 'related-quote') : action('创建报价', 'related-quote');
    case 'quotes': return (row.status === '草稿' ? action('发送报价', 'quote-send', true) : row.status === '已发送' ? action('客户接受', 'quote-accept', true) + action('客户拒绝', 'quote-reject') : '') + (row.status === '已接受' ? action('生成合同', 'make-contract', true) : '');
    case 'contracts': return row.status === '草稿' || row.status === '已驳回' ? action('提交审批', 'contract-submit', true) : row.status === '审批中' ? action('审批通过', 'contract-approve', true) + action('驳回', 'contract-reject') : row.status === '已批准' ? action('确认签订', 'contract-sign', true) : row.status === '已签订' ? action('生成订单', 'make-order', true) + action('新建回款', 'related-payment') + action('申请开票', 'related-invoice') + extension.actions(key, row) : '';
    case 'orders': return row.status === '待交付' ? action('开始交付', 'order-start', true) : row.status === '交付中' ? action('完成交付', 'order-complete', true) : '';
    case 'payments': return row.status !== '已回款' ? action('确认到账', 'payment-confirm', true) : '';
    case 'invoices': return row.status === '待开票' ? action('确认开票', 'invoice-issue', true) : row.status === '已开票' ? action('作废发票', 'invoice-void') : '';
    case 'tasks': return action(row.status === '已完成' ? '重新打开' : '完成任务', row.status === '已完成' ? 'task-reopen' : 'complete-task', true);
    case 'tickets': return row.status === '待处理' ? action('开始处理', 'ticket-start', true) : row.status === '处理中' ? action('解决工单', 'ticket-resolve', true) : row.status === '已解决' ? action('关闭工单', 'ticket-close') : '';
    case 'products': return action(row.status === '在售' ? '下架产品' : '上架产品', row.status === '在售' ? 'product-off' : 'product-on');
    case 'campaigns': return (row.status === '计划中' ? action('启动活动', 'campaign-start', true) : row.status === '进行中' ? action('结束活动', 'campaign-complete', true) : '') + action('录入活动线索', 'campaign-lead');
    case 'followups': { const task = rows('tasks').find(r => r.followupId === row.id); return task ? button('查看下次任务', 'detail-related', 'task', true, `data-key="tasks" data-id="${task.id}"`) : row.nextDate ? action('生成下次跟进任务', 'followup-task', true) : ''; }
    case 'appointments': return row.status === '已安排' ? action('完成日程', 'appointment-complete', true) + action('取消日程', 'appointment-cancel') : '';
    case 'knowledge': return row.status === '草稿' ? action('发布文档', 'knowledge-publish', true) : row.status === '已发布' ? action('归档文档', 'knowledge-archive') : action('重新发布', 'knowledge-publish', true);
    case 'users': return action(row.status === '已启用' ? '停用成员' : '启用成员', row.status === '已启用' ? 'user-off' : 'user-on');
    default: return extension.actions(key, row);
  }
}
export function detail(key, originalId) {
  const row = get(key, originalId);
  if (!row || !modules[key]) return false;
  current = { key, id: originalId, mode: 'detail' };
  const module = modules[key];
  const logs = rows('logs').filter(r => r.entity === key && r.recordId === originalId).sort((a, b) => b.at.localeCompare(a.at));
  const related = Object.entries(modules).flatMap(([other, m]) => m.fields.filter(f => f.collection === key).flatMap(f => rows(other).filter(r => r[f.key] === originalId).map(r => ({ key: other, row: r, label: m.singular }))));
  const payments = key === 'contracts' ? rows('payments').filter(r => r.contractId === row.id && r.status === '已回款').reduce((n, r) => n + r.amount, 0) : null;
  open(`${header(`${module.singular}详情`, esc(row.id))}<div class="p-6"><div class="flex items-center gap-3 mb-3"><span class="avatar w-12 h-12">${icon(module.icon, 'w-6 h-6')}</span><div><h3 class="text-xl font-semibold">${esc(row.name)}</h3><div class="mt-2">${badge(row.status)}</div></div></div><div class="flex flex-wrap gap-2 mt-5">${workflow(key, row)}${['customers', 'contacts', 'opportunities'].includes(key) ? button('记录跟进', 'related-followup', 'chat', false, `data-key="${key}" data-id="${row.id}"`) : ''}${extension.canEdit(key, row) ? button('编辑', 'edit', 'file', false, `data-key="${key}" data-id="${row.id}"`) : ''}</div>${key === 'opportunities' ? `<div class="flex flex-wrap gap-2 mt-5">${stages.map((s, i) => `<span class="text-xs px-2 py-1 rounded-md ${s === row.status ? 'bg-primary/15 text-primary' : 'text-muted bg-raised'}">${i + 1} ${s}</span>`).join('')}</div>` : ''}${payments !== null ? `<div class="panel bg-raised p-4 mt-5 grid grid-cols-2 gap-4"><div><p class="subtle">已回款</p><p class="text-primary text-lg">${money(payments, row.currency)}</p></div><div><p class="subtle">未回款</p><p class="text-lg">${money(row.amount - payments, row.currency)}</p></div></div>` : ''}${extension.detail(key, row)}<h4 class="section-title mt-7 mb-4">基本信息</h4><dl class="grid grid-cols-2 gap-x-6 gap-y-5">${module.fields.map(f => `<div class="${f.type === 'textarea' ? 'col-span-2' : ''}"><dt class="subtle mb-1">${f.label}</dt><dd class="break-words whitespace-pre-wrap">${f.type === 'relation' && row[f.key] ? `<button class="link text-left" data-action="detail-related" data-key="${f.collection}" data-id="${esc(row[f.key])}">${esc(nameOf(f.collection, row[f.key]))}</button>` : f.key === 'amount' ? money(row[f.key], row.currency) : esc(row[f.key] || '—')}</dd></div>`).join('')}</dl>${related.length ? `<h4 class="section-title mt-7 mb-3">关联业务 <span class="subtle">${related.length}</span></h4><div class="grid gap-2">${related.map(r => `<button class="flex items-center justify-between text-left p-3 rounded-lg bg-raised hover:bg-primary/10" data-action="detail-related" data-key="${r.key}" data-id="${r.row.id}"><span><span class="subtle mr-2">${r.label}</span>${esc(r.row.name)}</span>${icon('arrow', 'w-4 h-4 text-primary')}</button>`).join('')}</div>` : ''}<h4 class="section-title mt-7 mb-3">跟进与操作记录</h4><form id="followup-form" data-key="${key}" data-id="${row.id}" class="grid gap-3"><label for="followup-note" class="sr-only">跟进内容</label><textarea id="followup-note" name="note" class="field w-full h-20 py-3" required maxlength="2000" placeholder="记录一次沟通，或写下下一步计划…"></textarea><button class="btn self-end justify-self-end" type="submit">${icon('plus', 'w-4 h-4')}添加跟进</button></form><div class="grid gap-4 mt-5">${logs.map(r => `<div class="border-l-2 border-primary/20 pl-4"><p class="text-sm">${esc(r.name)}</p>${r.detail ? `<p class="text-muted mt-1 text-sm">${esc(r.detail)}</p>` : ''}<p class="subtle mt-2">${esc(r.owner)} · ${new Date(r.at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}</p></div>`).join('') || '<p class="subtle">暂无跟进记录，记录第一次连接。</p>'}</div></div>`, true);
  return true;
}
export function confirm(title, description, label = '确认', danger = false) {
  const el = document.getElementById('confirm');
  return new Promise(resolve => {
    el.innerHTML = `<div class="avatar mb-4 ${danger ? 'text-danger bg-danger/10' : ''}">${icon(danger ? 'shield' : 'check')}</div><h2 class="text-lg font-semibold">${esc(title)}</h2><p class="text-muted mt-3 mb-6">${esc(description)}</p><form method="dialog" class="flex justify-end gap-3"><button class="btn" value="cancel">取消</button><button class="${danger ? 'btn bg-danger/10 text-danger border-danger/30' : 'btn-primary'}" value="ok">${esc(label)}</button></form>`;
    el.returnValue = 'cancel'; el.onclose = () => resolve(el.returnValue === 'ok'); el.showModal();
  });
}
export function convert(row) { current = { key: 'leads', id: row.id, mode: 'convert' }; open(`${header('将线索转为客户', esc(row.company))}<form id="convert-form" data-id="${row.id}" class="p-6"><p class="text-muted">建立客户与联系人关系，保留原线索及转化记录。同名客户会复用已有客户。</p><label class="flex gap-3 items-center my-5"><input type="checkbox" name="opportunity" checked class="accent-primary w-4 h-4">同时创建一个待确认商机</label><div class="flex justify-end gap-3">${button('取消', 'close')}<button type="submit" class="btn-primary">确认转化 ${icon('arrow', 'w-4 h-4')}</button></div><p id="form-error" role="alert" class="text-danger mt-3"></p></form>`); }
export function importDialog(key) { open(`${header(`导入${modules[key].singular}`, '使用 JSON 数组导入；编号由系统生成，关联字段使用现有记录编号。')}<form id="import-form" data-key="${key}" class="p-6"><label for="import-file" class="block mb-3">选择 JSON 文件</label><input id="import-file" name="file" type="file" accept=".json,application/json" required class="field w-full h-auto p-3"><p class="subtle mt-4">先导出 JSON 查看字段模板。最大 500 条，必填字段与关联关系全部验证后才会保存。</p><p id="form-error" role="alert" class="text-danger mt-3"></p><div class="flex justify-end gap-3 mt-6">${button('导出 JSON 模板', 'export-json')}${button('取消', 'close')}<button class="btn-primary" type="submit">开始导入</button></div></form>`); current = { key, mode: 'import' }; }
