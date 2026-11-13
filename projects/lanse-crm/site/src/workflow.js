import * as data from './data.js';
import { modules } from './schema.js';
export const events = { projects: '项目新增 / 提交', designs: '设计成果提交', procurements: '采购方案选定 / 提交' };
const editable = { projects: ['草稿', '已退回', '已驳回'], designs: ['草稿', '已退回', '已驳回'], procurements: ['待评估', '已退回', '已驳回'] };
const successStatus = { projects: '已立项', designs: '已批准', procurements: '已批准' };
export const currentReviewer = run => run.status === '审核中' ? run.steps[run.index]?.reviewer : '';
export const pendingForMe = () => data.rows('workflowRuns').filter(r => currentReviewer(r) === data.settings().owner);
export const activeRun = (entity, recordId) => data.rows('workflowRuns').find(r => r.entity === entity && r.recordId === recordId && r.status === '审核中');
const activeMember = name => data.rows('users').some(r => r.name === name && r.status === '已启用');
function sendNotice(recipient, title, content, run) {
  data.collections.messages.insert({ id: data.id('messages'), name: title, content, sender: data.settings().owner, recipient, customerId: '', status: '已发送', at: new Date().toISOString(), workflowRunId: run.id, readBy: [], trashedBy: [], hiddenBy: [] });
}
export async function saveTemplate(input, originalId) {
  const name = String(input.name || '').trim(), entity = input.entity, status = input.status;
  if (!name || name.length > 200 || !events[entity] || !['已启用', '已停用'].includes(status)) throw new Error('请填写有效的工作流名称、触发事件和状态');
  if (!Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > 5) throw new Error('工作流需要 1–5 个审核节点');
  const steps = input.steps.map((s, i) => { const title = String(s.title || '').trim(), reviewer = String(s.reviewer || '').trim(); if (!title || title.length > 100 || !activeMember(reviewer)) throw new Error('每个节点须填写名称并选择已启用的审核人'); return { id: `step-${i + 1}`, title, reviewer }; });
  if (status === '已启用' && data.rows('workflowTemplates').some(r => r.entity === entity && r.status === '已启用' && r.id !== originalId)) throw new Error('该事件已有启用流程，请先停用原模板');
  const original = data.get('workflowTemplates', originalId);
  if (originalId && !original) throw new Error('工作流模板不存在');
  const row = { name, entity, status, automatic: !!input.automatic, steps, updatedAt: new Date().toISOString() };
  const saved = original ? await data.sources.workflowTemplates.update(original, row) : await data.sources.workflowTemplates.create({ ...row, id: data.id('workflowTemplates') });
  data.log('workflowTemplates', saved.id, `${original ? '更新' : '新建'}工作流：${name}`);
  await data.flush(); return saved;
}
export async function removeTemplate(id) {
  const row = data.get('workflowTemplates', id);
  if (!row) throw new Error('模板不存在');
  if (data.rows('workflowRuns').some(r => r.templateId === id)) throw new Error('模板已有运行历史，请停用并保留记录');
  await data.sources.workflowTemplates.remove(row); data.log('workflowTemplates', id, `删除工作流：${row.name}`); await data.flush();
}
export function checkSubmission(entity, record) {
  if (!record || !events[entity]) throw new Error('提交记录不存在');
  if (activeRun(entity, record.id)) throw new Error('该记录已在审核中');
  if (!editable[entity].includes(record.status)) throw new Error('当前业务状态不能提交审核');
  data.validate(entity, { ...record, status: record.status }, record.id);
  if (entity === 'procurements') {
    const quote = data.get('supplierQuotes', record.selectedQuoteId), rfq = quote && data.get('rfqs', quote.rfqId);
    if (!quote || rfq?.procurementId !== record.id || quote.amount > record.amount || quote.currency !== record.currency || !record.evaluationReason?.trim()) throw new Error('请先选定预算内的报价方案，并填写评估理由');
    if (data.rows('supplierQuotes').some(q => q.rfqId === quote.rfqId && (q.revision || 1) > (quote.revision || 1))) throw new Error('选定方案已更新，请重新评估最新报价');
  }
}
export async function submit(entity, recordId, templateId) {
  const record = data.get(entity, recordId); checkSubmission(entity, record);
  const template = data.get('workflowTemplates', templateId) || data.rows('workflowTemplates').find(r => r.entity === entity && r.status === '已启用');
  if (!template || template.entity !== entity || template.status !== '已启用') throw new Error('没有可用的审核模板，请先配置并启用工作流');
  if (template.steps.some(s => !activeMember(s.reviewer))) throw new Error('模板审核人已停用或不存在，请先修正配置');
  return data.atomic(async () => {
    const at = new Date().toISOString();
    const run = { id: data.id('workflowRuns'), name: record.name, entity, recordId, templateId: template.id, templateName: template.name, submitter: data.settings().owner, status: '审核中', index: 0, at, recordSnapshot: structuredClone(record), steps: template.steps.map((s, i) => ({ ...s, status: i === 0 ? 'current' : 'pending', comment: '', at: '' })) };
    data.collections.workflowRuns.insert(run);
    data.collections[entity].update({ id: recordId }, { status: '审核中' });
    data.log(entity, recordId, `提交审核：${template.name}`, `当前节点：${run.steps[0].title} · ${run.steps[0].reviewer}`);
    sendNotice(run.steps[0].reviewer, `待审核 · ${record.name}`, `${run.submitter}提交了${modules[entity].singular}，请在审核工作台处理「${run.steps[0].title}」。`, run);
    return run;
  });
}
export async function decide(runId, expectedIndex, decision, comment) {
  const run = data.get('workflowRuns', runId), text = String(comment || '').trim();
  if (!run || run.status !== '审核中' || Number(expectedIndex) !== run.index) throw new Error('审核节点已变化，请刷新后重试');
  if (currentReviewer(run) !== data.settings().owner) throw new Error('只有当前节点指定审核人可以处理');
  if (!['approve', 'return', 'reject'].includes(decision)) throw new Error('审核动作无效');
  if (!text || text.length > 1000) throw new Error('请填写 1–1000 字审核意见');
  const record = data.get(run.entity, run.recordId);
  if (!record || record.status !== '审核中') throw new Error('业务记录状态已变化');
  if (decision === 'approve' && run.steps[run.index + 1] && !activeMember(run.steps[run.index + 1].reviewer)) throw new Error('下一节点审核人不可用，请恢复该成员后继续');
  return data.atomic(async () => {
    const steps = structuredClone(run.steps), at = new Date().toISOString();
    steps[run.index] = { ...steps[run.index], status: decision === 'approve' ? 'completed' : 'rejected', result: ({ approve: '通过', return: '退回修改', reject: '驳回' })[decision], comment: text, at };
    const next = run.index + 1, continuing = decision === 'approve' && next < steps.length;
    if (continuing) steps[next].status = 'current';
    const status = continuing ? '审核中' : decision === 'approve' ? '已通过' : decision === 'return' ? '已退回' : '已驳回';
    data.collections.workflowRuns.update({ id: runId }, { steps, index: continuing ? next : run.index, status, completedAt: continuing ? '' : at });
    if (!continuing) data.collections[run.entity].update({ id: run.recordId }, { status: decision === 'approve' ? successStatus[run.entity] : status });
    const updated = data.get('workflowRuns', runId);
    data.log(run.entity, run.recordId, `${steps[run.index].title}：${steps[run.index].result}`, text);
    if (continuing) sendNotice(steps[next].reviewer, `待审核 · ${record.name}`, `上一节点已通过，请处理「${steps[next].title}」。`, updated);
    else sendNotice(run.submitter, `${status} · ${record.name}`, `${steps[run.index].title}：${text}`, updated);
    return updated;
  });
}
