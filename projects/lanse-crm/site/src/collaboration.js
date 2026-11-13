import * as data from './data.js';
import * as overlays from './overlays.js';
import { esc, icon, button, badge, money } from './ui.js';

export const specialRoutes = ['messages', 'calendar', 'approvals'];
export const state = { folder: 'inbox', messageQuery: '', unreadOnly: false, messagePage: 1, month: data.today().slice(0, 7), day: data.today(), calendarOwner: '', approvalStatus: '审批中' };
const folders = [['inbox', '收件箱'], ['sent', '已发送'], ['drafts', '草稿箱'], ['trash', '回收站']];
const me = () => data.settings().owner;
const contains = (row, field, name = me()) => (row[field] || []).includes(name);
const participant = row => row.sender === me() || (row.status === '已发送' && row.recipient === me());
const visible = row => participant(row) && !contains(row, 'hiddenBy');
export const unreadCount = () => data.rows('messages').filter(r => r.status === '已发送' && r.recipient === me() && visible(r) && !contains(r, 'readBy') && !contains(r, 'trashedBy')).length;
const inFolder = (row, folder) => visible(row) && (folder === 'trash' ? contains(row, 'trashedBy') : !contains(row, 'trashedBy') && (folder === 'drafts' ? row.status === '草稿' && row.sender === me() : row.status === '已发送' && row[folder === 'sent' ? 'sender' : 'recipient'] === me()));
const dateTime = value => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
const heading = (title, description, actions = '') => `<div class="flex flex-wrap items-start justify-between gap-4 mb-6"><div><h1 class="text-2xl font-semibold">${title}</h1><p class="text-muted mt-1">${description}</p></div><div class="flex flex-wrap gap-2">${actions}</div></div>`;
const empty = text => `<div class="p-10 text-center text-muted">${icon('mail', 'w-8 h-8 mx-auto mb-3')}<p>${text}</p></div>`;

export function messagesView() {
  const all = data.rows('messages'), counts = Object.fromEntries(folders.map(([key]) => [key, all.filter(r => inFolder(r, key)).length]));
  const query = state.messageQuery.toLowerCase();
  const filtered = all.filter(r => inFolder(r, state.folder) && (!state.unreadOnly || !contains(r, 'readBy')) && (!query || `${r.name} ${r.content} ${r.sender} ${r.recipient}`.toLowerCase().includes(query))).sort((a, b) => b.at.localeCompare(a.at));
  const pages = Math.max(1, Math.ceil(filtered.length / 8)); state.messagePage = Math.min(state.messagePage, pages);
  const items = filtered.slice((state.messagePage - 1) * 8, state.messagePage * 8);
  return heading('站内信', '让业务信息找到对的人，让团队协作有迹可循。', button('写站内信', 'message-compose', 'plus', true)) + `<div class="grid lg:grid-cols-[200px_1fr] gap-6"><aside class="panel p-3 self-start"><p class="subtle px-3 pt-2 pb-3">${esc(me())}的信箱 · ${unreadCount()} 封未读</p>${folders.map(([key, label]) => `<button class="nav-item" data-action="message-folder" data-folder="${key}" ${state.folder === key ? 'aria-current="page"' : ''}>${icon(key === 'drafts' ? 'file' : 'mail', 'w-4 h-4')}<span>${label}</span><span class="ml-auto text-xs">${counts[key]}</span></button>`).join('')}<p class="subtle px-3 py-3 leading-relaxed">在系统设置切换演示成员，可体验收信与回复。</p></aside><section class="panel overflow-hidden min-w-0"><div class="flex flex-wrap gap-3 p-4 border-b border-stroke"><form id="message-search-form" class="flex flex-1 gap-2 min-w-48"><input name="query" class="field w-full h-10" value="${esc(state.messageQuery)}" aria-label="搜索站内信" placeholder="搜索主题、内容或成员…"><button class="btn shrink-0 whitespace-nowrap" type="submit">搜索</button></form>${state.folder === 'inbox' ? button(state.unreadOnly ? '全部消息' : '仅看未读', 'message-unread-filter') + button('全部已读', 'message-read-all', 'check') : ''}</div><div id="message-list">${items.map(r => `<article class="flex gap-3 px-5 py-5 border-b border-stroke/60 hover:bg-primary/5"><span class="avatar mt-1">${esc((state.folder === 'inbox' ? r.sender : r.recipient || r.sender).slice(0, 1))}</span><button class="flex-1 min-w-0 text-left" data-action="message-open" data-id="${esc(r.id)}"><span class="flex items-center flex-wrap gap-2"><span class="${r.status === '已发送' && r.recipient === me() && !contains(r, 'readBy') ? 'font-semibold' : 'font-medium'} break-words">${esc(r.name || '无主题草稿')}</span>${r.status === '草稿' ? badge('草稿') : r.recipient === me() && !contains(r, 'readBy') ? '<span class="badge">未读</span>' : ''}</span><span class="block subtle mt-2">${esc(r.sender)} → ${esc(r.recipient || '未选收件人')} · ${dateTime(r.at)}</span><span class="block text-muted text-xs mt-2 truncate">${esc(r.content || '尚未填写内容')}</span></button><button class="text-xs ${state.folder === 'trash' ? 'link' : 'text-muted hover:text-danger'} shrink-0" data-action="${state.folder === 'trash' ? 'message-restore' : 'message-trash'}" data-id="${esc(r.id)}">${state.folder === 'trash' ? '恢复' : '移除'}</button></article>`).join('') || empty('当前文件夹没有匹配的站内信。')}</div><div class="p-4 flex flex-wrap items-center justify-between gap-3 subtle"><span>共 ${filtered.length} 封 · 第 ${state.messagePage} / ${pages} 页</span><div class="flex gap-2">${button('上一页', 'message-page', null, false, `data-delta="-1" ${state.messagePage <= 1 ? 'disabled' : ''}`)}${button('下一页', 'message-page', null, false, `data-delta="1" ${state.messagePage >= pages ? 'disabled' : ''}`)}</div></div></section></div>`;
}

export function compose(originalId, replyId) {
  const original = data.get('messages', originalId), reply = data.get('messages', replyId);
  if (originalId && (!original || original.sender !== me() || original.status !== '草稿' || !inFolder(original, 'drafts'))) throw new Error('草稿不存在或不可编辑');
  if (replyId && (!reply || !visible(reply) || reply.status !== '已发送' || contains(reply, 'trashedBy'))) throw new Error('消息不可回复');
  const row = original || (reply ? { name: `回复：${reply.name}`.slice(0, 200), recipient: reply.sender === me() ? reply.recipient : reply.sender, customerId: reply.customerId } : {});
  const members = data.rows('users').filter(r => r.status === '已启用');
  overlays.dismiss();
  overlays.open(`${overlays.header(reply ? '回复站内信' : original ? '编辑草稿' : '写站内信', `发件人：${esc(me())}`)}<form id="message-form" data-id="${esc(originalId || '')}" data-reply-id="${esc(replyId || original?.replyId || '')}" class="p-6 grid gap-5"><div><label for="msg-recipient" class="block mb-2">收件人</label><select id="msg-recipient" name="recipient" class="field w-full h-11"><option value="">请选择成员</option>${members.map(r => `<option ${r.name === row.recipient ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div><div><label for="msg-name" class="block mb-2">主题</label><input id="msg-name" name="name" class="field w-full h-11" maxlength="200" value="${esc(row.name || '')}"></div><div><label for="msg-customer" class="block mb-2">关联客户（可选）</label><select id="msg-customer" name="customerId" class="field w-full h-11"><option value="">暂不关联</option>${data.rows('customers').map(r => `<option value="${esc(r.id)}" ${r.id === row.customerId ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div><div><label for="msg-content" class="block mb-2">消息内容</label><textarea id="msg-content" name="content" class="field w-full h-48 py-3 resize-y" maxlength="2000">${esc(row.content || '')}</textarea></div>${reply ? `<div class="bg-raised rounded-lg p-4"><p class="subtle">原消息 · ${esc(reply.sender)}</p><p class="text-xs text-muted mt-2 whitespace-pre-wrap break-words">${esc(reply.content)}</p></div>` : ''}<p id="form-error" class="text-danger" role="alert"></p><div class="flex flex-wrap justify-end gap-3 border-t border-stroke pt-5">${button('取消', 'close')}<button type="submit" name="intent" value="draft" class="btn">保存草稿</button><button type="submit" name="intent" value="send" class="btn-primary">${icon('mail', 'w-4 h-4')}发送</button></div></form>`);
}

export async function saveMessage(values, originalId, replyId, send) {
  const original = data.get('messages', originalId);
  if (originalId && (!original || original.sender !== me() || original.status !== '草稿' || !inFolder(original, 'drafts'))) throw new Error('只能编辑自己的有效草稿');
  const input = Object.fromEntries(['name', 'content', 'recipient', 'customerId'].map(k => [k, String(values[k] || '').trim()]));
  if (input.name.length > 200 || input.content.length > 2000) throw new Error('主题或正文过长');
  if (send && (!input.name || !input.content || !input.recipient)) throw new Error('发送前请填写收件人、主题和正文');
  if (input.recipient && !data.rows('users').some(r => r.name === input.recipient && r.status === '已启用')) throw new Error('收件人不可用');
  if (input.customerId && !data.get('customers', input.customerId)) throw new Error('关联客户已不存在');
  if (replyId && !data.get('messages', replyId)) throw new Error('原消息已不存在');
  const row = { ...input, sender: me(), status: send ? '已发送' : '草稿', at: new Date().toISOString(), replyId: replyId || '', readBy: [], trashedBy: [], hiddenBy: [] };
  const result = original ? await data.sources.messages.update(original, row) : await data.sources.messages.create({ ...row, id: data.id('messages') });
  data.log('messages', result.id, `${send ? '发送站内信' : '保存草稿'}：${input.name || '无主题'}`);
  await data.flush(); return result;
}

async function mark(row, field, enabled) {
  const names = new Set(row[field] || []); enabled ? names.add(me()) : names.delete(me());
  await data.sources.messages.update(row, { [field]: [...names] }); await data.flush();
}
async function openMessage(id) {
  let row = data.get('messages', id);
  if (!row || !visible(row)) throw new Error('消息不存在或不属于当前成员');
  if (row.status === '草稿' && !contains(row, 'trashedBy')) { compose(id); return; }
  if (row.recipient === me() && row.status === '已发送') { await mark(row, 'readBy', true); row = data.get('messages', id); }
  overlays.dismiss();
  overlays.open(`${overlays.header('站内信详情', dateTime(row.at))}<article class="p-6"><h3 class="text-xl font-semibold break-words">${esc(row.name || '无主题草稿')}</h3><p class="subtle mt-3">${esc(row.sender)} → ${esc(row.recipient || '未选收件人')}</p>${row.workflowRunId ? button('打开审核流程', 'workflow-run', 'shield', false, `data-id="${esc(row.workflowRunId)}"`) : ''}${row.customerId ? `<button class="link mt-4 text-sm" data-action="detail-related" data-key="customers" data-id="${esc(row.customerId)}">关联客户 · ${esc(data.nameOf('customers', row.customerId))}</button>` : row.customerName ? `<p class="subtle mt-4">历史客户 · ${esc(row.customerName)}（已删除）</p>` : ''}<p class="whitespace-pre-wrap break-words leading-loose my-6">${esc(row.content || '尚未填写内容')}</p><div class="flex flex-wrap gap-3 pt-5 border-t border-stroke">${contains(row, 'trashedBy') ? button('恢复消息', 'message-restore', 'mail', true, `data-id="${esc(id)}"`) + button('永久移除', 'message-delete', null, false, `data-id="${esc(id)}"`) : button('回复', 'message-reply', 'chat', true, `data-id="${esc(id)}"`) + (row.recipient === me() ? button('标为未读', 'message-unread', null, false, `data-id="${esc(id)}"`) : '') + button('移入回收站', 'message-trash', null, false, `data-id="${esc(id)}"`)}</div></article>`);
}

const isoDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function calendarEvents() {
  return ['tasks', 'appointments', 'campaigns', 'payments', 'followups'].flatMap(key => data.rows(key).filter(r => !['已取消', '已完成', '已回款'].includes(r.status) && (key !== 'followups' || r.nextDate && !data.rows('tasks').some(t => t.followupId === r.id))).map(row => ({ key, row, date: key === 'followups' ? row.nextDate : row.date, type: ({ tasks: '任务', appointments: '日程', campaigns: '活动', payments: '回款', followups: '下次跟进' })[key] }))).filter(e => !state.calendarOwner || e.row.owner === state.calendarOwner).sort((a, b) => (a.row.time || '').localeCompare(b.row.time || ''));
}
export function calendarView() {
  const [year, month] = state.month.split('-').map(Number), first = new Date(year, month - 1, 1), offset = (first.getDay() + 6) % 7;
  const events = calendarEvents(), dayEvents = events.filter(e => e.date === state.day);
  const cells = Array.from({ length: 42 }, (_, i) => { const date = new Date(year, month - 1, i - offset + 1), value = isoDay(date), found = events.filter(e => e.date === value); return `<button class="min-w-0 min-h-20 sm:min-h-24 p-2 sm:p-3 border-b border-r border-stroke text-left ${value === state.day ? 'bg-primary/10' : 'hover:bg-raised'} ${date.getMonth() === month - 1 ? '' : 'text-muted bg-raised/40'}" data-action="calendar-day" data-day="${value}" aria-label="${value}，${found.length} 项安排" aria-pressed="${value === state.day}"><span class="inline-flex items-center justify-center rounded-full w-7 h-7 ${value === data.today() ? 'bg-primary text-white' : ''}">${date.getDate()}</span><span class="flex gap-1 mt-2">${found.slice(0, 3).map(e => `<span class="w-1.5 h-1.5 rounded-full ${e.key === 'payments' ? 'bg-warning' : 'bg-primary'}"></span>`).join('')}</span>${found.length ? `<span class="block text-[10px] text-muted mt-1">${found.length} 项</span>` : ''}</button>`; });
  return heading('日程日历', '统一查看拜访、会议、待办、下次跟进与回款安排。', button('新建日程', 'calendar-new', 'plus', true, `data-day="${state.day}"`) + '<a href="#/appointments" class="btn">日程列表</a>') + `<div class="grid xl:grid-cols-[1.6fr_1fr] gap-6"><section class="panel overflow-hidden min-w-0"><div class="p-4 flex flex-wrap items-center justify-between gap-3"><h2 id="calendar-month-title" class="section-title">${year} 年 ${month} 月</h2><div class="flex gap-2">${button('上月', 'calendar-month', null, false, 'data-delta="-1"')}${button('今天', 'calendar-today')}${button('下月', 'calendar-month', null, false, 'data-delta="1"')}</div></div><div class="grid grid-cols-7 border-t border-stroke">${['一', '二', '三', '四', '五', '六', '日'].map(d => `<span class="text-center py-3 subtle bg-raised">${d}</span>`).join('')}${cells.join('')}</div><p class="subtle p-4">${icon('clock', 'w-3 h-3 inline mr-1')}点击日期查看安排 · 已完成与已取消的事项不占用日历</p></section><section class="panel p-5 self-start min-w-0"><div class="flex flex-wrap items-center justify-between gap-3 mb-5"><div><h2 class="section-title">${state.day}</h2><p class="subtle mt-1">${dayEvents.length} 项待办安排</p></div><select id="calendar-owner" class="field h-10 w-36" aria-label="日历负责人筛选"><option value="">全部成员</option>${data.rows('users').map(r => `<option ${r.name === state.calendarOwner ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div>${dayEvents.map(e => `<button class="block w-full text-left rounded-xl bg-raised p-4 mb-3 hover:bg-primary/10" data-action="detail-related" data-key="${e.key}" data-id="${esc(e.row.id)}"><span class="flex gap-2 items-center text-xs text-primary mb-2">${icon(e.key === 'payments' ? 'wallet' : 'calendar', 'w-4 h-4')}${e.type}${e.row.time ? ` · ${esc(e.row.time)}` : ''}</span><span class="block font-medium break-words">${esc(e.row.name)}</span><span class="block subtle mt-2">${esc(e.row.owner)}${e.row.customerId ? ` · ${esc(data.nameOf('customers', e.row.customerId))}` : ''}</span></button>`).join('') || empty('这一天暂时没有待办安排。')}${button('添加这一天的日程', 'calendar-new', 'plus', false, `data-day="${state.day}"`)}</section></div>`;
}
export function approvalsView() {
  const all = data.rows('contracts'), filtered = all.filter(r => !state.approvalStatus || r.status === state.approvalStatus);
  return heading('审批中心', '集中处理合同审批，决策与业务状态保持同步。', '<a class="btn" href="#/contracts">合同列表</a>') + `<div class="grid sm:grid-cols-3 gap-4 mb-6">${[['审批中', '待审批', 'warning'], ['已批准', '已批准', 'success'], ['已驳回', '已驳回', 'danger']].map(([status, title, tone]) => `<button class="panel text-left p-5 ${state.approvalStatus === status ? 'border-primary' : ''}" data-action="approval-filter" data-status="${status}"><span class="subtle">${title}</span><span class="block text-3xl font-semibold mt-2 text-${tone}">${all.filter(r => r.status === status).length}</span></button>`).join('')}</div><section class="panel p-5"><div class="flex flex-wrap gap-2 mb-5">${['审批中', '已批准', '已驳回', '已签订', ''].map(s => button(s || '全部合同', 'approval-filter', null, false, `data-status="${s}" aria-pressed="${state.approvalStatus === s}"`)).join('')}</div><div class="grid gap-4">${filtered.map(r => `<article class="p-5 rounded-xl bg-raised border border-stroke"><div class="flex flex-wrap justify-between gap-3"><div><button class="font-semibold text-left hover:text-primary" data-action="detail-related" data-key="contracts" data-id="${esc(r.id)}">${esc(r.name)}</button><p class="subtle mt-2">${esc(data.nameOf('customers', r.customerId))} · 申请人 ${esc(r.owner)}</p></div>${badge(r.status)}</div><div class="flex flex-wrap justify-between items-center gap-4 mt-5"><span class="text-xl font-semibold">${money(r.amount, r.currency)}</span><div class="flex flex-wrap gap-2">${r.status === '审批中' ? button('审批通过', 'contract-approve', 'check', true, `data-key="contracts" data-id="${r.id}"`) + button('驳回', 'contract-reject', null, false, `data-key="contracts" data-id="${r.id}"`) : button('查看流程记录', 'detail-related', 'file', false, `data-key="contracts" data-id="${r.id}"`)}</div></div></article>`).join('') || empty('当前没有符合条件的合同。')}</div></section>`;
}
export const view = route => ({ messages: messagesView, calendar: calendarView, approvals: approvalsView })[route]();

export async function action(element, refresh) {
  const code = element.dataset.action, id = element.dataset.id;
  if (code.startsWith('message-')) {
    const row = data.get('messages', id);
    if (id && (!row || !visible(row))) throw new Error('消息不存在或不可操作');
    switch (code) {
      case 'message-compose': compose(); return;
      case 'message-reply': compose(null, id); return;
      case 'message-open': await openMessage(id); await refresh(); return;
      case 'message-folder': state.folder = element.dataset.folder; state.unreadOnly = false; state.messageQuery = ''; state.messagePage = 1; break;
      case 'message-page': state.messagePage += Number(element.dataset.delta); break;
      case 'message-unread-filter': state.unreadOnly = !state.unreadOnly; state.messagePage = 1; break;
      case 'message-read-all': for (const r of data.rows('messages').filter(r => inFolder(r, 'inbox'))) await mark(r, 'readBy', true); break;
      case 'message-unread': await mark(row, 'readBy', false); overlays.dismiss(); break;
      case 'message-trash': if (await overlays.confirm('移入回收站？', '可以在回收站恢复此消息。')) { await mark(row, 'trashedBy', true); overlays.dismiss(); } break;
      case 'message-restore': await mark(row, 'trashedBy', false); overlays.dismiss(); break;
      case 'message-delete': if (!contains(row, 'trashedBy')) throw new Error('请先移入回收站'); if (await overlays.confirm('永久移除这条消息？', '该消息将从当前成员的信箱永久移除，无法恢复。', '永久移除', true)) { if (row.status === '草稿') { await data.sources.messages.remove(row); await data.flush(); } else await mark(row, 'hiddenBy', true); overlays.dismiss(); } break;
    }
    await refresh(); return;
  }
  switch (code) {
    case 'calendar-new': overlays.form('appointments', null, { date: element.dataset.day, time: '09:00' }); return;
    case 'calendar-day': state.day = element.dataset.day; state.month = state.day.slice(0, 7); break;
    case 'calendar-month': { const [y, m] = state.month.split('-').map(Number); state.day = isoDay(new Date(y, m - 1 + Number(element.dataset.delta), 1)); state.month = state.day.slice(0, 7); break; }
    case 'calendar-today': state.day = data.today(); state.month = state.day.slice(0, 7); break;
    case 'approval-filter': state.approvalStatus = element.dataset.status; break;
  }
  await refresh();
}
