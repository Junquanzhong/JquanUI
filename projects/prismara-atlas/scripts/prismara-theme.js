(function () {
  'use strict';
  const key = 'prismara-appearance';
  const valid = value => ['light', 'dark', 'system'].includes(value);
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { const saved = localStorage.getItem(key); if (valid(saved)) preference = saved; } catch {}
  const resolved = () => preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  function renderControls() {
    const dark = resolved() === 'dark';
    document.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.classList.toggle('ph-moon-stars', dark);
      icon.classList.toggle('ph-sun', !dark);
    });
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === preference)));
    document.querySelectorAll('[data-theme-summary]').forEach(summary => summary.setAttribute('aria-label', `外观设置：${preference === 'system' ? '跟随系统，' : ''}${dark ? '暗色' : '浅色'}`));
    document.querySelectorAll('[data-theme-status]').forEach(node => { node.textContent = preference === 'system' ? `跟随系统 · 当前${dark ? '暗色' : '浅色'}` : `${dark ? '暗色' : '浅色'}外观`; });
  }
  function apply() {
    const mode = resolved(), root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.classList.toggle('light', mode === 'light');
    root.dataset.appearance = preference;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = mode === 'dark' ? '#0B1316' : '#FFFFFF';
    renderControls();
    window.dispatchEvent(new CustomEvent('prismara:themechange', { detail: { preference, resolved: mode } }));
  }
  function setPreference(value) {
    if (!valid(value)) return false;
    preference = value;
    try { localStorage.setItem(key, value); } catch {}
    apply();
    return true;
  }
  const systemChange = () => { if (preference === 'system') apply(); };
  const storageChange = event => {
    if (event.key === key || event.key === null) { preference = valid(event.newValue) ? event.newValue : 'system'; apply(); }
  };
  system.addEventListener('change', systemChange);
  window.addEventListener('storage', storageChange);
  document.addEventListener('DOMContentLoaded', renderControls, { once: true });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    system.removeEventListener('change', systemChange);
    window.removeEventListener('storage', storageChange);
  });
  window.PrismaraTheme = { setPreference, getPreference: () => preference, getResolved: resolved };
  apply();
})();
