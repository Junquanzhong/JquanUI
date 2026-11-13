export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = (value, currency = 'CNY') => new Intl.NumberFormat('zh-CN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);
export const paths = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2m-8 3h2"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5zM8 9h8m-8 4h5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4M8 7h2m4 0h2M8 11h2m4 0h2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart: '<path d="M3 3v18h18M7 15l5-5 4 3 5-7"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 12h8m-8 4h5"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-4 5h4M6 5V3h12"/>',
  box: '<path d="M12 3l9 5v9l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v9M7.5 5.5l9 5"/>',
  megaphone: '<path d="M3 10h5l12-6v16L8 14H3zM8 14l2 7H6l-2-7"/>',
  check: '<path d="M5 12l4 4L19 6"/>',
  task: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 4V2h6v2M8 10l2 2 5-5m-7 10h8"/>',
  support: '<path d="M3 14v-3a9 9 0 0 1 18 0v3M5 12H3v7h4v-7zm14 0h2v7h-4v-7zM17 21h-5"/>',
  settings: '<path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12l1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  arrow: '<path d="M4 12h16m-6-6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  close: '<path d="M6 6l12 12M6 18L18 6"/>',
  download: '<path d="M12 3v12m-5-5l5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5l5-5 5 5M4 16v5h16v-5"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  logout: '<path d="M9 3H4v18h5M10 12h11m-5-5l5 5-5 5"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 5l9 7 9-7"/>',
  layers: '<path d="M12 3l10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  shield: '<path d="M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6"/>'
};
export const icon = (name, cls = 'w-5 h-5') => `<svg class="${cls} shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
export const button = (label, action, ico, primary = false, extra = '') => `<button type="button" class="${primary ? 'btn-primary' : 'btn'}" data-action="${action}" ${extra}>${ico ? icon(ico, 'w-4 h-4') : ''}${label}</button>`;
export const badge = value => { const tone = /完成|已签|赢单|已回款|已转化|已解决|已开票|已启用/.test(value) ? 'text-success bg-success/10' : /流失|驳回|逾期|停用/.test(value) ? 'text-danger bg-danger/10' : /审批|待|进行|谈判/.test(value) ? 'text-warning bg-warning/10' : 'text-primary bg-primary/10'; return `<span class="badge ${tone}"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>${esc(value)}</span>`; };
export const notify = (content, type = 'success') => JquanUIComponents.msgApi[type]({ content, duration: 2200, maxCount: 2, placement: 'bottom-right' });
export const setTheme = mode => { document.documentElement.className = `${mode} color-scheme-${mode}`; try { localStorage.setItem('lanse-theme', mode); } catch {} document.querySelector('meta[name="theme-color"]').content = mode === 'dark' ? '#0b1014' : '#ffffff'; };
export const tableClasses = { root: 'grid gap-0', toolbar: 'hidden', scroll: 'overflow-auto', table: 'min-w-full text-sm text-ink border-collapse', headRow: 'bg-raised', headCell: 'table-cell py-3 text-xs text-muted font-medium', bodyCell: 'table-cell', row: '', rowHover: 'hover:bg-primary/5', rowStriped: '', rowClickable: 'cursor-pointer', empty: 'p-12 text-center text-muted', pagination: 'hidden', sort: 'inline-flex items-center gap-2 cursor-pointer', sortMarker: 'text-primary text-xs', selectionCell: 'w-10', checkbox: 'accent-primary w-4 h-4 cursor-pointer' };
export const paginationClasses = { root: 'flex flex-wrap items-center justify-end gap-3 text-xs text-muted', total: 'mr-auto text-muted', button: 'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg border cursor-pointer', buttonDefault: 'border-stroke bg-surface text-muted', buttonActive: 'bg-primary/10 border-primary/30 text-primary', buttonHover: 'hover:bg-primary/10', sizer: 'hidden', jumper: 'hidden', buttonDisabled: 'opacity-40 cursor-not-allowed', pages: 'flex gap-1', ellipsis: 'px-2 text-muted' };
