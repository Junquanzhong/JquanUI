import { modules, nav, stages } from './schema.js';
import * as data from './data.js';
import { esc, icon, money, button, notify, setTheme } from './ui.js';
import { dashboard, reports, metrics } from './dashboard.js';
import * as list from './list.js';
import * as overlays from './overlays.js';
import * as collaboration from './collaboration.js';
import * as workflow from './workflow.js';
import * as workflowUI from './workflow-ui.js';
import * as manufacturing from './manufacturing.js';
import * as manufacturingUI from './manufacturing-ui.js';
manufacturingUI.install();
const app = document.getElementById('app');
const C = window.JquanUIComponents;
// Use imperative APIs; installing automatic behavior as well would remount
// an explicitly configured Pagination handle with declarative defaults.
let authenticated = false, ready = false, route = 'dashboard', rendering = false;
const storageGet = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
const storageSet = (storage, key, value) => { try { value === null ? storage.removeItem(key) : storage.setItem(key, value); } catch {} };
const sessionKey = 'lanse-demo-session';
authenticated = !!(storageGet(sessionStorage, sessionKey) || storageGet(localStorage, sessionKey));
const logo = (large = false) => `<span class="flex items-center gap-3"><img src="./assets/mark.svg" alt="" width="${large ? 44 : 34}" height="${large ? 44 : 34}" class="rounded-xl logo-glow"><span><span class="block font-semibold ${large ? 'text-xl' : 'text-lg'} tracking-wide">澜序<span class="text-primary ml-1">CRM</span></span><span class="block text-[9px] tracking-[.22em] text-muted">LANSE WORKSPACE</span></span></span>`;
function login() {
  list.destroyList();
  app.innerHTML = `<main class="min-h-screen grid lg:grid-cols-[1.1fr_1fr]"><section class="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-sidebar hero-glow border-r border-stroke relative overflow-hidden"><a href="#/">${logo(true)}</a><div class="max-w-lg"><div class="flex gap-2 text-primary text-xs mb-6">${icon('layers', 'w-4 h-4')} 连接客户，驱动增长</div><h1 class="text-4xl xl:text-5xl leading-tight font-semibold tracking-tight">让每一次连接，<br><span class="text-primary">成就新的可能。</span></h1><p class="text-muted text-base mt-6 leading-loose">从第一条线索，到长期的信任。<br>澜序陪伴你的团队，让客户关系有序生长。</p><div class="panel hero-glow mt-10 p-6"><div class="flex gap-3 items-center"><span class="avatar">${icon('chart')}</span><div><div class="font-medium">业务全程，清晰可见</div><div class="subtle mt-1">线索 · 客户 · 商机 · 合同 · 回款</div></div></div><div class="flex items-center gap-3 mt-6">${['连接', '协作', '成交'].map((t, i) => `<span class="text-xs px-4 py-2 rounded-lg bg-primary/10 text-primary">${t}</span>${i < 2 ? icon('arrow', 'w-4 h-4 text-muted') : ''}`).join('')}</div></div></div><p class="subtle">JquanUI 驱动 · Lanse CRM</p></section><section class="flex flex-col min-h-screen"><div class="flex justify-between lg:justify-end p-6"><span class="lg:hidden">${logo()}</span><button class="btn-icon" data-action="theme" aria-label="切换明暗主题">${icon(document.documentElement.classList.contains('dark') ? 'sun' : 'moon')}</button></div><div class="flex-1 flex items-center justify-center px-6 py-12"><div class="w-full max-w-sm"><div class="avatar w-12 h-12 mb-6">${icon('shield', 'w-6 h-6')}</div><h2 class="text-3xl font-semibold">欢迎回来</h2><p class="text-muted mt-3 mb-8">登录澜序，开启高效而从容的一天。</p><form id="login-form"><label for="account" class="block mb-2">账号</label><input id="account" name="account" class="field w-full h-11 mb-5" type="email" autocomplete="username" required value="admin@lanse.crm"><label for="password" class="block mb-2">密码</label><div class="relative"><input id="password" name="password" class="field w-full h-11 pr-16" type="password" autocomplete="current-password" required value="Lanse2026"><button type="button" class="absolute right-3 top-3 text-xs text-muted hover:text-primary" data-action="show-password">显示</button></div><div class="flex justify-between items-center my-5"><label class="flex items-center gap-2 text-xs text-muted"><input type="checkbox" name="remember" class="accent-primary">记住登录</label><button type="button" class="text-xs link" data-action="credentials">忘记密码？</button></div><p id="login-error" class="text-danger text-sm mb-4" role="alert"></p><button type="submit" class="btn-primary w-full h-12" ${!ready ? 'disabled' : ''}>${ready ? '登录工作空间' : '正在准备工作空间…'}${icon('arrow', 'w-4 h-4')}</button></form><div class="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/15"><p class="text-xs text-primary font-medium">演示账号已为你填好</p><p class="subtle mt-1">admin@lanse.crm / Lanse2026</p><p class="subtle mt-2">业务操作保存在本地，可以放心体验。</p></div></div></div><p class="subtle text-center pb-6">© 2026 澜序 CRM · 让客户关系有序生长</p></section></main>`;
}
function shell() {
  const page = nav.flatMap(([, items]) => items).find(([key]) => key === route);
  app.innerHTML = `<div class="min-h-screen"><button id="nav-scrim" class="fixed inset-0 bg-black/50 z-30 hidden" data-action="menu-close" aria-label="关闭导航"></button><aside id="sidebar" class="fixed left-0 top-0 bottom-0 z-40 w-[232px] bg-sidebar border-r border-stroke flex flex-col -translate-x-full lg:translate-x-0 transition-transform duration-200"><div class="h-20 px-6 flex items-center shrink-0 border-b border-stroke/60">${logo()}</div><nav class="flex-1 overflow-auto px-4 py-3 scrollbar:w-1 scrollbar-track:bg-sidebar scrollbar-thumb:bg-stroke" aria-label="主导航">${nav.map(([group, items]) => `<div class="mt-3 mb-4"><p class="text-[10px] tracking-wider text-muted px-3 mb-2">${group}</p>${items.map(([key, label, ico]) => `<a href="#/${key}" class="nav-item" ${route === key ? 'aria-current="page"' : ''}>${icon(ico, 'w-4 h-4')}<span>${label}</span>${key === 'workflowInbox' && workflow.pendingForMe().length ? `<span data-workflow-count class="ml-auto text-[10px] px-1.5 bg-warning/10 text-warning rounded">${workflow.pendingForMe().length}</span>` : ''}${key === 'messages' ? `<span data-message-count class="ml-auto text-[10px] px-1.5 bg-primary/10 text-primary rounded">${collaboration.unreadCount()}</span>` : ''}${key === 'tasks' ? `<span data-task-count class="ml-auto text-[10px] px-1.5 bg-primary/10 text-primary rounded">${data.rows('tasks').filter(r => r.status !== '已完成').length}</span>` : ''}</a>`).join('')}</div>`).join('')}</nav><div class="p-4 border-t border-stroke"><div class="rounded-xl bg-primary/5 border border-primary/15 p-3"><div class="text-xs text-primary flex items-center gap-2">${icon('shield', 'w-4 h-4')}澜序演示工作空间</div><p class="text-[10px] text-muted mt-1">让客户关系有序生长</p></div></div></aside><div class="lg:ml-[232px]"><header class="h-[72px] px-4 lg:px-8 border-b border-stroke flex items-center justify-between gap-3 bg-sidebar/80 sticky top-0 z-20 backdrop-blur-lg"><div class="flex items-center gap-3 text-xs text-muted"><button class="btn-icon lg:hidden" data-action="menu" aria-label="展开导航">${icon('menu')}</button><span class="hidden sm:inline">工作空间</span><span class="hidden sm:inline text-stroke">/</span><span class="text-ink">${page?.[1] || '工作台'}</span></div><div class="flex items-center gap-3"><button class="btn-icon hidden md:inline-flex" data-action="global-search" aria-label="全局搜索">${icon('search', 'w-4 h-4')}</button><button class="btn-icon" data-action="theme" aria-label="切换明暗主题">${icon(document.documentElement.classList.contains('dark') ? 'sun' : 'moon', 'w-4 h-4')}</button><button class="btn-icon relative" data-action="notifications" aria-label="查看站内信与待办提醒">${icon('bell', 'w-4 h-4')}<span data-message-count class="absolute -top-1 -right-1 rounded-full bg-primary text-white px-1.5 text-[10px] ${collaboration.unreadCount() ? '' : 'hidden'}">${collaboration.unreadCount()}</span></button><span class="h-7 border-l border-stroke mx-1"></span><button class="flex items-center gap-3" data-action="profile"><span class="avatar bg-mint text-deep w-8 h-8">${esc(data.settings().owner[0])}</span><span class="hidden sm:block text-left"><span class="block text-xs font-medium">${esc(data.settings().owner)}</span><span class="block text-[10px] text-muted">工作空间管理员</span></span></button><button class="text-muted hover:text-primary" data-action="logout" aria-label="退出登录">${icon('logout', 'w-4 h-4')}</button></div></header><main id="main" class="p-4 lg:p-8 max-w-[1600px] mx-auto min-w-0"></main><footer class="px-8 py-6 text-[10px] text-muted flex flex-wrap justify-between gap-2"><span>© 2026 Lanse CRM. Powered by JquanUI.</span><span>用心连接 · 有序生长</span></footer></div></div>`;
}
function settingsView() {
  const s = data.settings();
  return `<h1 class="text-2xl font-semibold">系统设置</h1><p class="text-muted mt-1 mb-6">打造适合团队的工作空间。</p><div class="grid xl:grid-cols-[1.4fr_1fr] gap-6"><section class="panel p-6"><h2 class="section-title mb-6">工作空间信息</h2><form id="settings-form" class="grid gap-5"><div><label class="block mb-2" for="workspace-name">工作空间名称</label><input id="workspace-name" name="name" required maxlength="50" class="field w-full h-11" value="${esc(s.name)}"></div><div><label class="block mb-2" for="workspace-owner">当前演示成员</label><select id="workspace-owner" name="owner" class="field w-full h-11">${['林知夏', '陈屿', '许清禾', '周予安'].map(n => `<option ${s.owner === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div><label class="block mb-2" for="workspace-target">累计签约目标（元）</label><input id="workspace-target" name="target" type="number" min="1" max="1000000000" required class="field w-full h-11" value="${s.target}"></div><div><label class="block mb-2" for="workspace-email">联系邮箱</label><input id="workspace-email" name="email" type="email" required class="field w-full h-11" value="${esc(s.email)}"></div><button type="submit" class="btn-primary justify-self-start">保存设置</button></form></section><div class="grid gap-6 content-start"><section class="panel p-6"><h2 class="section-title">外观偏好</h2><p class="subtle mt-2 mb-4">暗色专注，亮色清晰。主题偏好自动保存。</p><div class="flex gap-3">${button('暗色主题', 'theme-dark', 'moon')}${button('亮色主题', 'theme-light', 'sun')}</div></section><section class="panel p-6"><h2 class="section-title">数据管理</h2><p class="subtle mt-2 mb-4">导出完整工作空间快照，或恢复最初的演示业务数据。</p><div class="grid gap-3">${button('导出完整备份', 'backup', 'download')}${button('恢复演示数据', 'reset-data', 'layers')}</div></section><section class="panel p-6"><h2 class="section-title">角色说明</h2><p class="text-muted text-sm mt-3 leading-loose">管理员：工作空间管理<br>销售经理：团队销售协调<br>销售专员：客户与商机跟进<br>客服专员：客户服务响应<br>财务专员：回款与开票管理</p><p class="subtle mt-3">演示模式展示角色信息，当前账号可体验所有业务操作。</p></section></div></div>`;
}
async function render() {
  if (!ready) { login(); return; }
  if (!authenticated) { login(); return; }
  rendering = true;
  try {
    list.destroyList(); shell();
    const main = document.getElementById('main');
    if (route === 'dashboard') main.innerHTML = dashboard();
    else if (route === 'reports') main.innerHTML = reports();
    else if (route === 'settings') main.innerHTML = settingsView();
    else if (workflowUI.routes.includes(route)) main.innerHTML = workflowUI.view(route);
    else if (collaboration.specialRoutes.includes(route)) main.innerHTML = collaboration.view(route);
    else { main.innerHTML = list.listView(route); await list.mountList(route); }
    JquanUI.enhance(main);
  } finally { rendering = false; }
}
function readRoute() { const value = location.hash.replace(/^#\/?/, '').split('?')[0]; return modules[value] || ['dashboard', 'pool', 'reports', 'settings', ...collaboration.specialRoutes, ...workflowUI.routes].includes(value) ? value : 'dashboard'; }
function go(value) { overlays.dismiss(); if (route === value) render(); else location.hash = `/${value}`; }
window.addEventListener('hashchange', () => { clearTimeout(searchTimer); route = readRoute(); Object.assign(list.state, { search: '', status: '', owner: '', page: 1, selection: [] }); overlays.dismiss(); render().catch(reportError); });
function reportError(error) { notify(error.message || '操作未完成，请重试', 'error'); }
async function refresh() { if (modules[route] || route === 'pool') await list.reloadList(route); else await render(); if (overlays.current?.mode === 'detail') overlays.detail(overlays.current.key, overlays.current.id); for (const el of document.querySelectorAll('[data-workflow-count]')) el.textContent = workflow.pendingForMe().length; for (const el of document.querySelectorAll('[data-task-count]')) el.textContent = data.rows('tasks').filter(r => r.status !== '已完成').length; for (const el of document.querySelectorAll('[data-message-count]')) { el.textContent = collaboration.unreadCount(); el.classList.toggle('hidden', !collaboration.unreadCount()); } }
function selectedContext(element) { return { key: element.dataset.key || (route === 'pool' ? 'customers' : route), id: element.dataset.id }; }
function exportData(key, json = false) {
  const result = json ? data.rows(key) : list.filtered(key, route === 'pool').all();
  C.exportApi.download({ data: result, format: json ? 'json' : 'csv', filename: `澜序-${modules[key].title}-${data.today()}`, columns: json ? undefined : [{ key: 'id', label: '编号' }, ...modules[key].fields.map(f => ({ key: f.key, label: f.label }))] }); notify('导出文件已生成');
}
const transitions = {
  'appointment-complete': ['appointments', '已完成'], 'appointment-cancel': ['appointments', '已取消'], 'knowledge-publish': ['knowledge', '已发布'], 'knowledge-archive': ['knowledge', '已归档'],
  'quote-send': ['quotes', '已发送'], 'quote-accept': ['quotes', '已接受'], 'quote-reject': ['quotes', '已拒绝'],
  'contract-submit': ['contracts', '审批中'], 'contract-approve': ['contracts', '已批准'], 'contract-reject': ['contracts', '已驳回'], 'contract-sign': ['contracts', '已签订'],
  'order-start': ['orders', '交付中'], 'order-complete': ['orders', '已完成'], 'payment-confirm': ['payments', '已回款'], 'invoice-issue': ['invoices', '已开票'], 'invoice-void': ['invoices', '已作废'],
  'complete-task': ['tasks', '已完成'], 'task-reopen': ['tasks', '待处理'], 'ticket-start': ['tickets', '处理中'], 'ticket-resolve': ['tickets', '已解决'], 'ticket-close': ['tickets', '已关闭'], 'product-off': ['products', '已下架'], 'product-on': ['products', '在售'], 'campaign-start': ['campaigns', '进行中'], 'campaign-complete': ['campaigns', '已完成'], 'user-off': ['users', '已停用'], 'user-on': ['users', '已启用']
};
async function action(element) {
  const code = element.dataset.action, { key, id } = selectedContext(element), row = data.get(key, id);
  if (code.startsWith('workflow-')) { await workflowUI.action(element, refresh); return; }
  if (code.startsWith('manufacturing-')) { await manufacturingUI.action(element, refresh); return; }
  if (/^(message-|calendar-|approval-filter)/.test(code)) { await collaboration.action(element, refresh); return; }
  if (transitions[code]) { const [entity, status] = transitions[code], record = data.get(entity, id); if (!record) return; if (await overlays.confirm(`确认${status}？`, `将更新「${record.name}」的业务状态，并记录操作。`)) { await data.changeStatus(entity, record, status); notify(`已更新为${status}`); await refresh(); } return; }
  switch (code) {
    case 'theme': setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark'); await render(); break;
    case 'theme-light': case 'theme-dark': setTheme(code.slice(6)); await render(); break;
    case 'show-password': { const p = document.getElementById('password'); p.type = p.type === 'password' ? 'text' : 'password'; element.textContent = p.type === 'password' ? '显示' : '隐藏'; break; }
    case 'credentials': notify('演示密码：Lanse2026；默认账号已填好。', 'info'); break;
    case 'logout': if (await overlays.confirm('退出工作空间？', '业务数据会保留，下次登录可继续体验。', '退出登录')) { await data.flush(); storageSet(sessionStorage, sessionKey, null); storageSet(localStorage, sessionKey, null); authenticated = false; overlays.dismiss(); login(); } break;
    case 'menu': document.getElementById('sidebar').classList.remove('-translate-x-full'); document.getElementById('nav-scrim').classList.remove('hidden'); break;
    case 'menu-close': document.getElementById('sidebar').classList.add('-translate-x-full'); document.getElementById('nav-scrim').classList.add('hidden'); break;
    case 'reports': go('reports'); break;
    case 'profile': go('settings'); break;
    case 'close': overlays.dismiss(); break;
    case 'new': overlays.form(key); break;
    case 'related-followup': overlays.form('followups', null, { name: `${row.name} · 沟通跟进`, customerId: key === 'customers' ? row.id : row.customerId, contactId: key === 'contacts' ? row.id : '', opportunityId: key === 'opportunities' ? row.id : '', owner: row.owner }); break;
    case 'followup-task': { const task = await data.createFollowupTask(row); notify('下次跟进任务已就绪'); await refresh(); overlays.detail('tasks', task.id); break; }
    case 'new-opportunity': overlays.form('opportunities'); break;
    case 'edit': if (row) overlays.form(key, id); break;
    case 'detail': case 'detail-related': if (key === 'workflowTemplates') { workflowUI.editTemplate(id); break; } if (key === 'workflowRuns') { workflowUI.runView(id); break; } if (!overlays.detail(key, id)) notify('此记录已删除或暂不可查看', 'info'); break;
    case 'delete': case 'bulk-delete': { const ids = code === 'bulk-delete' ? list.state.selection : [id]; if (await overlays.confirm(`删除${ids.length}条记录？`, '删除前会检查关联业务。该操作会永久移除所选记录。', '删除', true)) { await data.remove(key, ids); notify('记录已删除'); await refresh(); } break; }
    case 'reset-filter': Object.assign(list.state, { search: '', status: '', owner: '', page: 1 }); await render(); break;
    case 'view-table': case 'view-kanban': list.state.view = code.slice(5); await render(); break;
    case 'export': exportData(key); break;
    case 'export-json': exportData(overlays.current?.key || key, true); break;
    case 'import': overlays.importDialog(key); break;
    case 'convert': if (row) overlays.convert(row); break;
    case 'claim': case 'release': if (row && await overlays.confirm(code === 'claim' ? '领取这个客户？' : '将客户转入公海？', code === 'claim' ? '客户将分配给当前演示成员，进入潜在客户列表。' : '客户进入共享客户公海，其他成员可领取。')) { await data.save('customers', { ...row, status: code === 'claim' ? '潜在客户' : '公海客户', owner: code === 'claim' ? data.settings().owner : row.owner }, row.id); notify(code === 'claim' ? '已领取客户' : '客户已转入公海'); await refresh(); } break;
    case 'advance': case 'lost': { const status = code === 'lost' ? '流失' : stages[stages.indexOf(row.status) + 1]; if (status && await overlays.confirm('更新商机阶段？', `「${row.name}」将进入${status}阶段。`)) { await data.changeStatus(key, row, status); notify('商机阶段已更新'); await refresh(); } break; }
    case 'related-opportunity': overlays.form('opportunities', null, { customerId: row.id, owner: row.owner }); break;
    case 'related-quote': overlays.form('quotes', null, { name: `${row.name}报价方案`, customerId: row.customerId, opportunityId: row.id, productId: row.productId, amount: row.amount, owner: row.owner }); break;
    case 'related-payment': overlays.form('payments', null, { name: `${row.name}回款`, contractId: row.id, owner: row.owner }); break;
    case 'related-invoice': overlays.form('invoices', null, { name: data.nameOf('customers', row.customerId), customerId: row.customerId, contractId: row.id, owner: row.owner }); break;
    case 'make-contract': { const existing = data.rows('contracts').find(r => r.quoteId === row.id); if (existing) { overlays.detail('contracts', existing.id); notify('已存在关联的合同', 'info'); } else overlays.form('contracts', null, { name: `${row.name}合同`, quoteId: row.id, customerId: row.customerId, amount: row.amount, owner: row.owner }); break; }
    case 'make-order': { const existing = data.rows('orders').find(r => r.contractId === row.id); if (existing) { overlays.detail('orders', existing.id); notify('已存在关联的订单', 'info'); } else overlays.form('orders', null, { name: `${row.name}交付订单`, contractId: row.id, customerId: row.customerId, amount: row.amount, owner: row.owner }); break; }
    case 'campaign-lead': overlays.form('leads', null, { source: '市场活动', owner: row.owner, note: `来自活动：${row.name}` }); break;
    case 'backup': C.exportApi.download({ data: Object.fromEntries(Object.entries(data.collections).map(([k, c]) => [k, c.exportSnapshot()])), format: 'json', filename: `澜序工作空间备份-${data.today()}` }); notify('完整备份已生成'); break;
    case 'reset-data': if (await overlays.confirm('恢复初始演示数据？', '所有当前业务修改会被初始数据替换，建议先导出完整备份。', '恢复数据', true)) { await data.resetData(); notify('演示数据已恢复'); await render(); } break;
    case 'export-report': C.exportApi.download({ data: [metrics()], format: 'csv', filename: '澜序销售报表', columns: [{ key: 'customers', label: '客户数量' }, { key: 'leads', label: '待跟进线索' }, { key: 'pipeline', label: '销售管道金额' }, { key: 'signed', label: '签约金额' }, { key: 'received', label: '回款金额' }] }); notify('报表已导出'); break;
    case 'notifications': showNotifications(); break;
    case 'global-search': showSearch(); break;
  }
}
function showSearch() {
  const el = document.getElementById('overlay');
  el.className = 'w-[calc(100%-2rem)] max-w-2xl max-h-[80vh] p-6 bg-surface text-ink border border-stroke rounded-2xl backdrop:bg-black/60';
  el.innerHTML = `<div class="flex justify-between items-center mb-4"><h2 class="section-title">搜索工作空间</h2>${button('关闭', 'close')}</div><input id="global-query" class="field w-full h-11" placeholder="搜索线索、客户、商机、合同…" aria-label="全局搜索"><div id="search-results" class="grid gap-2 mt-4"><p class="text-muted">输入名称，快速找到相关业务。</p></div>`; el.showModal(); document.getElementById('global-query').focus();
}
function showNotifications() {
  const el = document.getElementById('overlay');
  el.className = 'w-[calc(100%-2rem)] max-w-lg max-h-[80vh] p-6 bg-surface text-ink border border-stroke rounded-2xl backdrop:bg-black/60';
  el.innerHTML = `<div class="flex justify-between items-center mb-5"><h2 class="section-title">消息与待办</h2>${button('关闭', 'close')}</div><a href="#/messages" class="block rounded-xl bg-primary/10 p-4 mb-4" data-action="close"><span class="text-primary font-medium">站内信 · ${collaboration.unreadCount()} 封未读</span><span class="block subtle mt-1">打开收件箱，查看与回复团队消息</span></a>${data.rows('tasks').filter(r => r.status !== '已完成').map(r => `<button class="w-full text-left border-b border-stroke py-4 hover:text-primary" data-action="detail-related" data-key="tasks" data-id="${r.id}"><span class="block">${esc(r.name)}</span><span class="subtle">${r.date} · ${esc(r.owner)}</span></button>`).join('') || '<p class="text-muted">暂时没有待办事项。</p>'}`; el.showModal();
}
document.addEventListener('click', event => {
  const element = event.target.closest('[data-action]');
  if (!element || element.disabled) return;
  if (element.closest('#records-pages')) return; // Pagination owns its actions.
  if (element.tagName === 'A' && element.dataset.action === 'close') { overlays.dismiss(); return; }
  event.preventDefault();
  const isButton = element.tagName === 'BUTTON'; if (isButton) element.disabled = true;
  action(element).catch(reportError).finally(() => { if (isButton) element.disabled = false; });
});
let searchTimer;
document.addEventListener('input', event => {
  if (event.target.closest('#workflow-template-form')) workflowUI.syncPreview();
  if (event.target.id === 'list-search') { list.state.search = event.target.value; list.state.page = 1; clearTimeout(searchTimer); searchTimer = setTimeout(() => list.reloadList(route).catch(reportError), 180); }
  if (event.target.id === 'global-query') { const term = event.target.value.trim().toLowerCase(); const found = term ? Object.entries(modules).flatMap(([key, m]) => data.rows(key).filter(r => `${r.name} ${r.id}`.toLowerCase().includes(term)).map(row => ({ key, title: m.singular, row }))).slice(0, 20) : []; document.getElementById('search-results').innerHTML = found.length ? found.map(r => `<button class="p-3 bg-raised text-left rounded-lg hover:bg-primary/10" data-action="detail-related" data-key="${r.key}" data-id="${r.row.id}"><span class="subtle mr-3">${r.title}</span>${esc(r.row.name)}</button>`).join('') : '<p class="text-muted p-3">没有找到记录。</p>'; }
});
document.addEventListener('change', async event => {
  try {
    const target = event.target;
    if (target.id === 'list-status' || target.id === 'list-owner') { list.state[target.id === 'list-status' ? 'status' : 'owner'] = target.value; list.state.page = 1; await list.reloadList(route); }
    if (target.id === 'calendar-owner') { collaboration.state.calendarOwner = target.value; await render(); }
    if (target.id === 'f-customerId' && target.closest('#record-form')?.dataset.key === 'followups') overlays.filterFollowupRelations();
    if (target.closest('#record-form')) manufacturingUI.formChange(target.closest('#record-form').dataset.key, target.name);
    if (target.closest('#workflow-template-form')) workflowUI.syncPreview();
    if (target.id === 'chart-period') { document.getElementById('main').innerHTML = dashboard(target.value); }
    if (target.dataset.stageId) { const row = data.get('opportunities', target.dataset.stageId); await data.changeStatus('opportunities', row, target.value); notify('商机阶段已更新'); await list.reloadList(route); }
    if (target.closest('#record-form')?.dataset.key === 'quotes' && ['f-productId', 'f-quantity'].includes(target.id)) { const product = data.get('products', document.getElementById('f-productId').value); if (product) document.getElementById('f-amount').value = product.amount * Number(document.getElementById('f-quantity').value || 1); }
  } catch (error) { reportError(error); }
});
document.addEventListener('submit', async event => {
  const form = event.target;
  if (!['login-form', 'record-form', 'followup-form', 'settings-form', 'convert-form', 'import-form', 'message-form', 'message-search-form', 'workflow-template-form', 'workflow-filter-form', 'workflow-submit-form', 'workflow-decision-form', 'purchase-distribute-form', 'purchase-evaluate-form'].includes(form.id)) return;
  event.preventDefault();
  const submitButtons = [...form.querySelectorAll('[type="submit"]')]; for (const button of submitButtons) button.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(form));
    switch (form.id) {
      case 'login-form': if (values.account !== 'admin@lanse.crm' || values.password !== 'Lanse2026') { document.getElementById('login-error').textContent = '账号或密码不正确，请使用下方演示账号。'; return; } authenticated = true; storageSet(values.remember ? localStorage : sessionStorage, sessionKey, 'demo'); route = readRoute(); await render(); break;
      case 'record-form': { const row = await data.save(form.dataset.key, values, form.dataset.id); notify('保存成功'); overlays.dismiss(); await refresh(); overlays.detail(form.dataset.key, row.id); break; }
      case 'followup-form': { const key = form.dataset.key, row = data.get(key, form.dataset.id), customerId = key === 'customers' ? row.id : row.customerId; if (!values.note.trim()) throw new Error('请填写沟通内容'); if (key !== 'followups' && customerId && data.get('customers', customerId)) await data.save('followups', { name: `${row.name} · 沟通记录`.slice(0, 200), customerId, contactId: key === 'contacts' ? row.id : '', opportunityId: key === 'opportunities' ? row.id : '', channel: '其他', date: data.today(), owner: data.settings().owner, status: '待继续跟进', nextDate: '', content: values.note }); if (key !== 'customers' || !customerId) data.log(key, row.id, '新增跟进记录', values.note.trim()); await data.flush(); notify('跟进记录已添加'); overlays.detail(key, row.id); break; }
      case 'message-search-form': collaboration.state.messageQuery = values.query.trim(); collaboration.state.messagePage = 1; await render(); break;
      case 'message-form': { const send = event.submitter?.value === 'send'; await collaboration.saveMessage(values, form.dataset.id, form.dataset.replyId, send); overlays.dismiss(); collaboration.state.folder = send ? 'sent' : 'drafts'; collaboration.state.messagePage = 1; collaboration.state.messageQuery = ''; collaboration.state.unreadOnly = false; notify(send ? '站内信已发送' : '草稿已保存'); go('messages'); break; }
      case 'workflow-template-form': await workflowUI.submitTemplateForm(form); overlays.dismiss(); notify('工作流已保存'); await refresh(); break;
      case 'workflow-filter-form': Object.assign(workflowUI.state, { query: values.query.trim(), status: values.status, page: 1 }); await render(); break;
      case 'workflow-submit-form': { const run = await workflow.submit(form.dataset.key, form.dataset.id, values.templateId); overlays.dismiss(); notify('已提交审核'); await refresh(); workflowUI.runView(run.id); break; }
      case 'workflow-decision-form': { const run = await workflow.decide(form.dataset.id, form.dataset.index, event.submitter?.value, values.comment); overlays.dismiss(); notify(run.status === '审核中' ? '已推进至下一审核节点' : `流程${run.status}`); await refresh(); workflowUI.runView(run.id); break; }
      case 'purchase-distribute-form': await manufacturing.distribute(form.dataset.id, new FormData(form).getAll('supplierIds'), values.date); overlays.dismiss(); notify('供应商询价已生成'); await refresh(); overlays.detail('procurements', form.dataset.id); break;
      case 'purchase-evaluate-form': await manufacturing.selectQuote(form.dataset.id, values.quoteId, values.reason); overlays.dismiss(); notify('报价方案已选定'); await refresh(); overlays.detail('procurements', form.dataset.id); break;
      case 'convert-form': { const customer = await data.convertLead(data.get('leads', form.dataset.id), !!values.opportunity); notify('线索已成功转化'); overlays.dismiss(); await refresh(); overlays.detail('customers', customer.id); break; }
      case 'settings-form': data.collections.settings.update({ id: 'workspace' }, { ...values, target: Number(values.target) }); data.log('settings', 'workspace', '更新工作空间设置'); await data.flush(); notify('设置已保存'); await render(); break;
      case 'import-form': { const file = document.getElementById('import-file').files[0]; if (!file || file.size > 2 * 1024 * 1024) throw new Error('请选择小于 2MB 的 JSON 文件'); await data.importRows(form.dataset.key, JSON.parse(await file.text())); overlays.dismiss(); notify('数据导入成功'); await refresh(); break; }
    }
  } catch (error) { const node = form.querySelector('#form-error'); if (node) node.textContent = error.message; else reportError(error); }
  finally { for (const button of submitButtons) button.disabled = false; }
});
document.addEventListener('dragstart', event => { const card = event.target.closest('[data-drag-id]'); if (card) event.dataTransfer.setData('text/lanse-opportunity', card.dataset.dragId); });
document.addEventListener('dragover', event => { if (event.target.closest('[data-drop-stage]')) event.preventDefault(); });
document.addEventListener('drop', event => { const stage = event.target.closest('[data-drop-stage]'); if (!stage) return; event.preventDefault(); const row = data.get('opportunities', event.dataTransfer.getData('text/lanse-opportunity')); if (row) data.changeStatus('opportunities', row, stage.dataset.dropStage).then(() => list.reloadList(route)).then(() => notify('商机阶段已更新')).catch(reportError); });
window.addEventListener('lanse:storage-error', () => notify('本地存储写入失败，请导出备份后重试。', 'error'));
window.addEventListener('pagehide', () => { clearTimeout(searchTimer); list.destroyList(); C.msgApi.closeAll(); data.close().catch(() => {}); });
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
route = readRoute(); login();
try { await data.initData(); ready = true; await render(); document.body.dataset.ready = 'true'; }
catch (error) { document.body.dataset.ready = 'failed'; app.innerHTML = `<main class="max-w-lg mx-auto p-8 mt-20 panel"><h1 class="text-xl">工作空间暂时无法打开</h1><p class="text-muted mt-4">${esc(error.message)}</p><p class="text-muted mt-3">请通过本地 HTTP 服务打开，并允许浏览器使用 IndexedDB 存储。</p><button class="btn-primary mt-6" onclick="location.reload()">重新加载</button></main>`; }
