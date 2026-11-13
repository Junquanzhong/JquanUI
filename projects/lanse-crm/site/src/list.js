import { extension } from './overlays.js';
import { modules, stages } from './schema.js';
import { collections, rows, nameOf } from './data.js';
import { esc, icon, money, badge, button, tableClasses, paginationClasses } from './ui.js';
export const state = { search: '', status: '', owner: '', page: 1, size: 8, view: 'table', selection: [], total: 0 };
let table, pagination;
export function destroyList() { table?.destroy(); pagination?.destroy(); table = pagination = null; }
export function filtered(key, pool = false) {
  const search = state.search.toLowerCase();
  return collections[key].query(r => (!pool || r.status === '公海客户') && (!state.status || r.status === state.status) && (!state.owner || r.owner === state.owner) && (!search || modules[key].fields.some(f => String(f.type === 'relation' ? nameOf(f.collection, r[f.key]) : r[f.key] ?? '').toLowerCase().includes(search)) || String(r.id).toLowerCase().includes(search)));
}
export function listView(route) {
  const pool = route === 'pool', key = pool ? 'customers' : route, module = modules[key];
  return `<div class="flex flex-wrap justify-between items-start gap-4 mb-6"><div><div class="flex gap-3 items-center"><h1 class="text-2xl font-semibold">${pool ? '客户公海' : module.title}</h1><span id="entity-count" class="badge">${pool ? rows(key).filter(r => r.status === '公海客户').length : collections[key].size}</span></div><p class="text-muted mt-1">${pool ? '让沉淀的客户资源，再次成为新的机会。' : module.description}</p></div><div class="flex gap-2 flex-wrap">${button('导入', 'import', 'upload')}${button('导出', 'export', 'download')}${!pool ? button(`新建${module.singular}`, 'new', 'plus', true) : ''}</div></div>
  ${key === 'opportunities' ? `<div class="flex gap-2 mb-5"><button class="btn ${state.view === 'table' ? 'text-primary border-primary/30' : ''}" data-action="view-table">${icon('file', 'w-4 h-4')}列表视图</button><button class="btn ${state.view === 'kanban' ? 'text-primary border-primary/30' : ''}" data-action="view-kanban">${icon('grid', 'w-4 h-4')}阶段看板</button></div>` : ''}
  <section class="panel overflow-hidden"><div class="flex flex-wrap gap-3 items-center p-4 border-b border-stroke"><div class="relative flex-1 min-w-48 max-w-sm">${icon('search', 'absolute left-3 top-3 w-4 h-4 text-muted')}<input id="list-search" class="field w-full pl-10 h-10" aria-label="搜索${module.singular}" placeholder="搜索名称、关联信息或编号…" value="${esc(state.search)}"></div><select id="list-status" class="field w-36 h-10" aria-label="状态筛选"><option value="">全部状态</option>${module.statuses.map(s => `<option ${state.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${module.fields.some(f => f.key === 'owner') ? `<select id="list-owner" class="field w-36 h-10" aria-label="负责人筛选"><option value="">全部负责人</option>${[...new Set(rows(key).map(r => r.owner).filter(Boolean))].map(s => `<option ${state.owner === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>` : ''}<button class="btn ml-auto" data-action="reset-filter">重置筛选</button></div><div class="flex flex-wrap justify-between gap-3 items-center px-5 py-3 bg-raised/50"><div class="subtle">${icon('file', 'w-3 h-3 inline mr-1')}<span id="result-count">加载中…</span></div><div class="flex items-center gap-3"><span class="subtle" id="selection-count">未选择</span><button id="bulk-delete" class="text-xs text-danger disabled:opacity-30" data-action="bulk-delete" disabled>批量删除</button></div></div><div id="records-table"></div><div id="kanban" class="overflow-auto"></div><div id="records-pages" class="p-4 border-t border-stroke"></div></section><p class="subtle mt-4 flex items-center gap-2">${icon('shield', 'w-3 h-3')}数据自动保存在当前浏览器 · 点击记录查看详情与跟进</p>`;
}
function display(f, value, row) {
  if (f.key === 'name') return `<button data-action="detail" data-id="${esc(row.id)}" class="font-medium text-left hover:text-primary">${esc(value)}<span class="block subtle mt-1 font-normal">${esc(row.id)}</span></button>`;
  if (f.key === 'status') return badge(value);
  if (f.key === 'owner') return `<span class="flex items-center gap-2"><span class="avatar w-7 h-7 rounded-full">${esc(String(value).slice(0, 1))}</span>${esc(value)}</span>`;
  if (f.type === 'relation') return `<button class="hover:text-primary" data-action="detail-related" data-key="${f.collection}" data-id="${esc(value)}">${esc(nameOf(f.collection, value))}</button>`;
  if (f.key === 'amount') return `<span class="font-medium tabular-nums">${money(value, row.currency)}</span>`;
  return esc(value || '—');
}
export async function mountList(route) {
  const pool = route === 'pool', key = pool ? 'customers' : route;
  if (state.view === 'kanban' && key === 'opportunities') { renderKanban(); return; }
  const fields = modules[key].listFields ? modules[key].listFields.map(name => modules[key].fields.find(f => f.key === name)).filter(Boolean) : modules[key].fields.filter(f => !['textarea', 'email', 'tel'].includes(f.type) && !(key === 'followups' && f.key === 'contactId') && !['productId', 'quoteId', 'opportunityId', 'taxId', 'quantity', 'unit'].includes(f.key)).slice(0, 7);
  table = await JquanUIComponents.tableApi.mount('#records-table', {
    columns: [...fields.map(f => ({ key: f.key, title: f.label, filterable: false, render: (value, row) => display(f, value, row) })), { key: 'actions', title: '操作', sortable: false, render: (_, row) => `<div class="flex items-center gap-4"><button class="text-xs link" data-action="${pool ? 'claim' : extension.canEdit(key, row) ? 'edit' : 'detail'}" data-id="${esc(row.id)}">${pool ? '领取' : extension.canEdit(key, row) ? '编辑' : '详情'}</button><button class="text-xs text-muted hover:text-danger" data-action="delete" data-id="${esc(row.id)}">删除</button></div>` }],
    selectable: true, striped: false, classes: tableClasses, emptyText: '没有匹配的记录，试试调整筛选或新建记录。',
    remote: { enabled: true, load: async payload => {
      if (payload.reason === 'sort') state.page = 1;
      const query = filtered(key, pool);
      state.total = query.count(); state.page = Math.min(state.page, Math.max(1, Math.ceil(state.total / state.size)));
      if (payload.sort.key) query.orderBy({ [payload.sort.key]: payload.sort.order });
      const result = query.paginate(state.page, state.size);
      document.getElementById('result-count').textContent = `共 ${result.total} 条记录`;
      if (pagination && payload.reason === 'sort') pagination.update({ page: state.page }, 'data');
      return result;
    } },
    onChange: payload => { state.selection = payload.selection; document.getElementById('selection-count').textContent = payload.selection.length ? `已选 ${payload.selection.length} 项` : '未选择'; document.getElementById('bulk-delete').disabled = !payload.selection.length; }
  });
  pagination = JquanUIComponents.paginationApi.mount('#records-pages', { total: state.total, page: state.page, pageSize: state.size, showJumper: false, showSizer: false, maxButtons: 5, classes: paginationClasses, labels: { total: '共 {{total}} 条 · 每页 8 条', prev: '上一页', next: '下一页' }, onChange: async payload => { if (payload.reason === 'data') return; state.page = payload.page; table.clearSelection(); state.selection = []; await table.reload(); } });
}
export async function reloadList(route) {
  const count = document.getElementById('entity-count');
  if (count) count.textContent = route === 'pool' ? rows('customers').filter(r => r.status === '公海客户').length : collections[route].size;
  state.selection = []; table?.clearSelection();
  if (state.view === 'kanban' && route === 'opportunities') renderKanban();
  else if (table) { await table.reload(); pagination?.update({ total: state.total, page: state.page }, 'data'); }
}
function renderKanban() {
  const data = filtered('opportunities').all();
  document.getElementById('result-count').textContent = `共 ${data.length} 个商机 · 拖动卡片或选择阶段`;
  document.getElementById('records-pages').classList.add('hidden');
  document.getElementById('kanban').innerHTML = `<div class="grid grid-cols-[repeat(6,250px)] gap-4 p-4">${stages.map(stage => { const items = data.filter(r => r.status === stage); return `<section class="bg-raised/60 rounded-xl p-3 min-h-80" data-drop-stage="${stage}"><div class="flex items-center gap-2 mb-1"><span class="w-2 h-2 bg-primary rounded-full"></span><h2 class="font-medium">${stage}</h2><span class="ml-auto text-xs text-muted">${items.length}</span></div><p class="subtle mb-4">${money(items.reduce((n, r) => n + r.amount, 0))}</p>${items.map(r => `<article class="panel p-4 mb-3 cursor-grab" draggable="true" data-drag-id="${r.id}"><button class="font-medium text-left hover:text-primary" data-action="detail" data-id="${r.id}">${esc(r.name)}</button><p class="subtle mt-2">${esc(nameOf('customers', r.customerId))}</p><p class="text-primary font-semibold mt-3">${money(r.amount)}</p><div class="flex justify-between subtle mt-3"><span>${esc(r.owner)}</span><span>${r.date}</span></div><select class="field w-full h-8 mt-3 text-xs" data-stage-id="${r.id}" aria-label="${esc(r.name)}销售阶段">${stages.map(s => `<option ${s === stage ? 'selected' : ''}>${s}</option>`).join('')}</select></article>`).join('') || '<p class="subtle text-center py-10">暂无商机</p>'}</section>`; }).join('')}</div>`;
}
