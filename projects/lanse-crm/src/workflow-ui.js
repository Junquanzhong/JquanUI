import * as data from './data.js';
import * as service from './workflow.js';
import * as overlays from './overlays.js';
import { modules } from './schema.js';
import { button, badge, esc, icon, notify } from './ui.js';
export const routes = ['workflows', 'workflowInbox'];
export const state = { tab: 'pending', status: '', query: '', page: 1 };
let draft;
const me = () => data.settings().owner;
const title = (name, description, actions = '') => `<div class="flex flex-wrap justify-between gap-4 mb-6"><div><h1 class="text-2xl font-semibold">${name}</h1><p class="text-muted mt-1">${description}</p></div><div class="flex flex-wrap gap-2">${actions}</div></div>`;
const sequence = steps => `<div class="flex flex-wrap gap-2 items-center"><span class="badge">发生</span>${steps.map(s => `${icon('arrow', 'w-3 h-3 text-muted')}<span class="text-xs px-3 py-2 rounded-lg bg-raised border border-stroke">${esc(s.title)}<span class="block text-muted mt-1">${esc(s.reviewer)}</span></span>`).join('')}${icon('arrow', 'w-3 h-3 text-muted')}<span class="badge">结束</span></div>`;
export function templatesView() {
  return title('工作流配置', '定义触发事件与审核节点，让业务按照团队规则推进。', button('新建工作流', 'workflow-new', 'plus', true) + button('导出模板', 'workflow-export', 'download')) + `<div class="panel p-5 mb-6"><div class="flex gap-3 items-center"><span class="avatar">${icon('layers')}</span><div><h2 class="section-title">发生 → 步骤 → 步骤 → 结束</h2><p class="subtle mt-1">每个事件启用一个流程，支持 1–5 级审核。运行实例保留提交时的模板快照。</p></div></div></div><div class="grid gap-5">${data.rows('workflowTemplates').map(t => `<article class="panel p-5"><div class="flex flex-wrap justify-between items-start gap-3 mb-4"><div><h2 class="section-title">${esc(t.name)}</h2><p class="subtle mt-2">${esc(service.events[t.entity])} · ${t.automatic ? '事件发生后自动启动' : '手动提交启动'}</p></div>${badge(t.status)}</div>${sequence(t.steps)}<div class="flex flex-wrap gap-2 mt-5 border-t border-stroke pt-4">${button('编辑配置', 'workflow-edit', 'file', false, `data-id="${esc(t.id)}"`)}${button(t.status === '已启用' ? '停用' : '启用', 'workflow-toggle', null, false, `data-id="${esc(t.id)}"`)}${button('复制模板', 'workflow-copy', 'layers', false, `data-id="${esc(t.id)}"`)}${button('删除', 'workflow-delete', null, false, `data-id="${esc(t.id)}"`)}</div></article>`).join('') || '<section class="panel p-10 text-center text-muted">还没有工作流，创建第一个审核模板。</section>'}</div>`;
}
export function inboxView() {
  const all = data.rows('workflowRuns'), query = state.query.toLowerCase();
  const found = all.filter(r => (state.tab === 'pending' ? service.currentReviewer(r) === me() : state.tab === 'started' ? r.submitter === me() : true) && (!state.status || r.status === state.status) && (!query || `${r.name} ${r.templateName} ${r.submitter}`.toLowerCase().includes(query))).sort((a, b) => b.at.localeCompare(a.at));
  const pages = Math.max(1, Math.ceil(found.length / 8)); state.page = Math.min(state.page, pages);
  return title('审核工作台', `当前成员：${me()}。查看审核待办、发起记录与完整流程历史。`, '<a class="btn" href="#/workflows">工作流配置</a>') + `<div class="grid sm:grid-cols-3 gap-4 mb-6">${[['pending', '我的待审', service.pendingForMe().length], ['started', '我发起的', all.filter(r => r.submitter === me()).length], ['all', '全部历史', all.length]].map(([tab, name, count]) => `<button class="panel text-left p-5 ${state.tab === tab ? 'border-primary bg-primary/5' : ''}" data-action="workflow-tab" data-tab="${tab}" aria-pressed="${state.tab === tab}"><span class="subtle">${name}</span><span class="block text-3xl font-semibold mt-2 text-primary">${count}</span></button>`).join('')}</div><section class="panel p-5"><form id="workflow-filter-form" class="flex flex-wrap gap-3 mb-5"><input name="query" class="field flex-1 min-w-48 h-10" value="${esc(state.query)}" placeholder="搜索业务名称、流程或发起人…" aria-label="搜索审核记录"><select name="status" class="field w-36 h-10" aria-label="审核状态"><option value="">全部状态</option>${['审核中', '已通过', '已退回', '已驳回'].map(s => `<option ${state.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select><button class="btn" type="submit">筛选</button></form><div id="workflow-run-list" class="grid gap-3">${found.slice((state.page - 1) * 8, state.page * 8).map(r => `<button class="rounded-xl p-4 bg-raised text-left border border-stroke hover:border-primary/30" data-action="workflow-run" data-id="${esc(r.id)}"><span class="flex flex-wrap gap-3 justify-between"><span class="font-medium">${esc(r.name)}</span>${badge(r.status)}</span><span class="block subtle mt-2">${esc(r.templateName)} · ${esc(r.submitter)}发起</span><span class="block text-xs text-primary mt-3">${r.status === '审核中' ? `当前：${esc(r.steps[r.index].title)} · ${esc(service.currentReviewer(r))}` : `${r.steps.filter(s => s.status === 'completed').length} / ${r.steps.length} 步通过`} · ${new Date(r.at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}</span></button>`).join('') || '<p class="text-muted text-center py-10">当前没有匹配的审核记录。</p>'}</div><div class="flex flex-wrap justify-between items-center gap-3 mt-5 subtle"><span>共 ${found.length} 条 · 第 ${state.page} / ${pages} 页</span><div class="flex gap-2">${button('上一页', 'workflow-page', null, false, `data-delta="-1" ${state.page <= 1 ? 'disabled' : ''}`)}${button('下一页', 'workflow-page', null, false, `data-delta="1" ${state.page >= pages ? 'disabled' : ''}`)}</div></div></section>`;
}
function readDraftSteps() {
  draft.steps = [...document.querySelectorAll('[data-workflow-step]')].map(el => ({ title: el.querySelector('input').value, reviewer: el.querySelector('select').value }));
}
function renderSteps() {
  const users = data.rows('users').filter(u => u.status === '已启用');
  document.getElementById('workflow-steps').innerHTML = draft.steps.map((s, i) => `<div data-workflow-step class="panel bg-raised p-4"><div class="flex flex-wrap justify-between items-center gap-3 mb-3"><span class="badge">第 ${i + 1} 级审核</span><div class="flex gap-2">${button('上移', 'workflow-step-up', null, false, `data-index="${i}" ${!i ? 'disabled' : ''}`)}${button('下移', 'workflow-step-down', null, false, `data-index="${i}" ${i === draft.steps.length - 1 ? 'disabled' : ''}`)}${button('移除', 'workflow-step-remove', null, false, `data-index="${i}" ${draft.steps.length === 1 ? 'disabled' : ''}`)}</div></div><div class="grid sm:grid-cols-2 gap-4"><div><label class="block text-xs mb-2" for="step-title-${i}">步骤名称</label><input id="step-title-${i}" class="field w-full h-11" value="${esc(s.title)}" required maxlength="100"></div><div><label class="block text-xs mb-2" for="step-reviewer-${i}">指定审核人</label><select id="step-reviewer-${i}" class="field w-full h-11" required><option value="">选择审核人</option>${users.map(u => `<option ${s.reviewer === u.name ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></div></div></div>`).join('');
  document.getElementById('workflow-preview').innerHTML = sequence(draft.steps);
  document.querySelector('[data-action="workflow-step-add"]').disabled = draft.steps.length >= 5;
}
export function editTemplate(id, copy = false) {
  const original = data.get('workflowTemplates', id);
  if (id && !original) throw new Error('模板不存在');
  draft = original ? structuredClone(original) : { name: '', entity: 'projects', status: '已停用', automatic: false, steps: [{ title: '一级审核', reviewer: '陈屿' }] };
  if (copy) { draft.name = `${draft.name} · 副本`; draft.status = '已停用'; }
  overlays.dismiss();
  overlays.open(`${overlays.header(copy ? '复制工作流' : id ? '编辑工作流' : '新建工作流', '配置事件与顺序审核；运行中的实例保留原有配置。')}<form id="workflow-template-form" data-id="${copy ? '' : esc(id || '')}" class="p-6 grid gap-5"><div><label for="wf-name" class="block mb-2">工作流名称</label><input id="wf-name" name="name" class="field w-full h-11" required maxlength="200" value="${esc(draft.name)}"></div><div class="grid sm:grid-cols-2 gap-4"><div><label for="wf-event" class="block mb-2">触发事件</label><select id="wf-event" name="entity" class="field w-full h-11">${Object.entries(service.events).map(([key, label]) => `<option value="${key}" ${draft.entity === key ? 'selected' : ''}>${label}</option>`).join('')}</select></div><div><label for="wf-status" class="block mb-2">模板状态</label><select id="wf-status" name="status" class="field w-full h-11">${['已启用', '已停用'].map(s => `<option ${draft.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div><label class="flex items-center gap-3"><input type="checkbox" name="automatic" ${draft.automatic ? 'checked' : ''} class="accent-primary">事件发生后自动启动审核</label><p class="subtle">项目新建、设计成果新建、采购方案选定触发自动流程；关闭自动启动后，业务详情可手动提交。</p><div id="workflow-steps" class="grid gap-4"></div>${button('添加审核节点', 'workflow-step-add', 'plus')}<div id="workflow-preview" class="border-t border-stroke pt-4"></div><p id="form-error" class="text-danger" role="alert"></p><div class="flex justify-end gap-3">${button('取消', 'close')}<button class="btn-primary" type="submit">保存工作流</button></div></form>`);
  renderSteps();
}
export async function submitTemplateForm(form) {
  readDraftSteps(); const values = Object.fromEntries(new FormData(form));
  return service.saveTemplate({ ...values, automatic: !!values.automatic, steps: draft.steps }, form.dataset.id);
}
export function submissionDialog(entity, id) {
  const row = data.get(entity, id); service.checkSubmission(entity, row);
  const templates = data.rows('workflowTemplates').filter(t => t.entity === entity && t.status === '已启用');
  if (!templates.length) throw new Error('请先在工作流配置中启用对应审核模板');
  overlays.dismiss();
  overlays.open(`${overlays.header('提交业务审核', esc(row.name))}<form id="workflow-submit-form" data-key="${entity}" data-id="${esc(id)}" class="p-6"><label for="workflow-template" class="block mb-3">审核工作流</label><select id="workflow-template" name="templateId" class="field w-full h-11">${templates.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select><div class="mt-5">${sequence(templates[0].steps)}</div><p class="subtle mt-4">提交后业务资料锁定，待当前审核人处理。退回后可以修改并重新提交。</p><p id="form-error" class="text-danger mt-4" role="alert"></p><div class="flex justify-end gap-3 mt-6">${button('取消', 'close')}<button type="submit" class="btn-primary">确认提交</button></div></form>`);
}
export function runView(id) {
  const run = data.get('workflowRuns', id);
  if (!run) throw new Error('审核记录不存在');
  const reviewer = service.currentReviewer(run), mine = reviewer === me();
  overlays.dismiss();
  overlays.open(`${overlays.header('审核流程详情', esc(run.id))}<div class="p-6"><div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="text-xl font-semibold">${esc(run.name)}</h3><p class="subtle mt-2">${esc(run.templateName)} · ${esc(run.submitter)}发起</p></div>${badge(run.status)}</div><button class="link text-sm mt-4" data-action="detail-related" data-key="${run.entity}" data-id="${esc(run.recordId)}">查看业务记录</button><div class="rounded-xl bg-raised p-4 mt-5"><p class="text-sm font-medium">提交时的业务快照</p><p class="subtle mt-2 whitespace-pre-wrap break-words">${esc(run.recordSnapshot.paymentTerms || run.recordSnapshot.deliverables || run.recordSnapshot.evaluationReason || run.recordSnapshot.note || '已保存业务字段快照') }</p></div><div id="workflow-timeline" class="mt-5"></div>${run.status === '审核中' ? mine ? `<form id="workflow-decision-form" data-id="${esc(id)}" data-index="${run.index}" class="mt-5 grid gap-3"><label for="workflow-comment">审核意见</label><textarea id="workflow-comment" name="comment" required maxlength="1000" class="field w-full h-24 py-3" placeholder="说明审核结论，或列出需要修改的内容…"></textarea><p id="form-error" class="text-danger" role="alert"></p><div class="flex flex-wrap gap-3"><button class="btn-primary" type="submit" name="decision" value="approve">通过并推进</button><button class="btn" type="submit" name="decision" value="return">退回修改</button><button class="btn text-danger" type="submit" name="decision" value="reject">驳回</button></div></form>` : `<div class="mt-5 bg-primary/5 rounded-xl p-4"><p class="text-sm">当前等待 ${esc(reviewer)}处理「${esc(run.steps[run.index].title)}」。</p>${button(`以${esc(reviewer)}体验审核`, 'workflow-switch', 'user', false, `data-id="${esc(id)}" data-name="${esc(reviewer)}"`)}</div>` : '<p class="subtle mt-5">流程已结束；如需修改，请在业务记录中重新提交。</p>'}</div>`);
  const classes = { root: 'mt-5', surface: 'grid gap-4', list: 'grid gap-3', step: 'p-4 border border-stroke rounded-xl bg-raised', head: 'flex gap-3', title: 'text-sm font-semibold text-ink', badge: 'hidden', badgeDone: 'hidden', badgeWarn: 'hidden', badgeDanger: 'hidden', meta: 'subtle mt-2', desc: 'text-sm text-muted whitespace-pre-wrap break-words mt-2', actions: 'hidden' };
  const handle = JquanUIComponents.approvalFlowApi.mount('#workflow-timeline', { classes, steps: run.steps.map(s => ({ id: s.id, title: s.title, actor: s.reviewer, time: s.at ? new Date(s.at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '', status: s.status, description: `${s.result || ({ current: '当前待审核', pending: '等待前置节点', completed: '已通过', rejected: '已结束' })[s.status]}${s.comment ? `\n${s.comment}` : ''}` })) });
  overlays.registerCleanup(() => handle?.destroy());
}
export function syncPreview() { if (document.getElementById('workflow-template-form')) { readDraftSteps(); document.getElementById('workflow-preview').innerHTML = sequence(draft.steps); } }
export const view = route => route === 'workflows' ? templatesView() : inboxView();
export async function action(element, refresh) {
  const code = element.dataset.action, id = element.dataset.id;
  if (code.startsWith('workflow-step-')) {
    readDraftSteps(); const index = Number(element.dataset.index);
    if (code === 'workflow-step-add' && draft.steps.length < 5) draft.steps.push({ title: `${draft.steps.length + 1}级审核`, reviewer: '' });
    if (code === 'workflow-step-remove' && draft.steps.length > 1) draft.steps.splice(index, 1);
    if (code === 'workflow-step-up' && index > 0) [draft.steps[index - 1], draft.steps[index]] = [draft.steps[index], draft.steps[index - 1]];
    if (code === 'workflow-step-down' && index < draft.steps.length - 1) [draft.steps[index + 1], draft.steps[index]] = [draft.steps[index], draft.steps[index + 1]];
    renderSteps(); return;
  }
  switch (code) {
    case 'workflow-new': editTemplate(); return;
    case 'workflow-edit': editTemplate(id); return;
    case 'workflow-copy': editTemplate(id, true); return;
    case 'workflow-run': runView(id); return;
    case 'workflow-submit': submissionDialog(element.dataset.key, id); return;
    case 'workflow-toggle': { const t = data.get('workflowTemplates', id); await service.saveTemplate({ ...t, status: t.status === '已启用' ? '已停用' : '已启用' }, id); notify('模板状态已更新'); break; }
    case 'workflow-delete': if (await overlays.confirm('删除工作流模板？', '已有运行历史的模板会保留，可选择停用。', '删除', true)) { await service.removeTemplate(id); notify('模板已删除'); } break;
    case 'workflow-tab': state.tab = element.dataset.tab; state.page = 1; break;
    case 'workflow-page': state.page += Number(element.dataset.delta); break;
    case 'workflow-switch': data.collections.settings.update({ id: 'workspace' }, { owner: element.dataset.name }); await data.flush(); await refresh(); runView(id); return;
    case 'workflow-export': JquanUIComponents.exportApi.download({ data: data.rows('workflowTemplates'), format: 'json', filename: '澜序工作流模板' }); notify('模板已导出'); return;
  }
  await refresh();
}
