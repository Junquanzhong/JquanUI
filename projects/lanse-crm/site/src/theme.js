(function () {
  let mode = 'light';
  try { const saved = localStorage.getItem('lanse-theme'); if (['light', 'dark'].includes(saved)) mode = saved; } catch {}
  document.documentElement.className = mode === 'light' ? 'light color-scheme-light' : 'dark color-scheme-dark';
  document.querySelector('meta[name="theme-color"]').content = mode === 'dark' ? '#0b1014' : '#ffffff';
  window.JQUAN_CONFIG = {
    theme: {
      semantic: {
        canvas: { light: '#ffffff', dark: '#0b1014' },
        sidebar: { light: '#ffffff', dark: '#101719' },
        surface: { light: '#ffffff', dark: '#151d20' },
        raised: { light: '#f6f9f9', dark: '#1a2528' },
        stroke: { light: '#e2e9e8', dark: '#273236' },
        ink: { light: '#192c2a', dark: '#edf4f2' },
        muted: { light: '#697c79', dark: '#8c9b9c' },
        primary: { light: '#087f6d', dark: '#21e6bd' },
        cyan: { light: '#147d9b', dark: '#50c9e3' },
        success: { light: '#12835d', dark: '#57dca4' },
        warning: { light: '#a16a13', dark: '#e6bc75' },
        danger: { light: '#c74258', dark: '#f38491' }
      },
      extend: { colors: { mint: '#21e6bd', deep: '#063b34' }, fontFamily: { sans: ['Segoe UI', 'Microsoft YaHei', 'sans-serif'] } }
    },
    shortcuts: {
      'panel': 'bg-surface border border-stroke rounded-2xl',
      'btn': 'inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-ink bg-raised border border-stroke rounded-lg cursor-pointer transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed',
      'btn-primary': 'btn text-deep bg-mint border-mint glow-button hover:bg-mint/90',
      'btn-icon': 'btn w-10 px-0 shrink-0',
      'field': 'block min-w-0 px-3 text-sm text-ink bg-raised border border-stroke rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted color-scheme-light dark:color-scheme-dark',
      'nav-item': 'flex items-center gap-3 w-full px-3 py-2.5 text-sm text-muted rounded-lg border border-transparent cursor-pointer transition-colors hover:bg-primary/5 hover:text-ink aria-[current=page]:bg-primary/10 aria-[current=page]:border-primary/20 aria-[current=page]:text-primary',
      'badge': 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary whitespace-nowrap',
      'section-title': 'text-base font-semibold text-ink',
      'subtle': 'text-xs text-muted',
      'link': 'text-primary hover:underline cursor-pointer',
      'avatar': 'inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary font-semibold text-xs',
      'table-cell': 'px-4 py-4 text-left border-b border-stroke/60 align-middle whitespace-nowrap',
      'hero-glow': 'bg-surface dark:glow-dark glow-light'
    },
    // Project motifs are utilities so page structure remains entirely atomic.
    customUtilities: {
      'glow-dark': { css: 'background-image', val: 'radial-gradient(ellipse at 85% 60%,rgba(22,174,151,.20),transparent 65%)' },
      'glow-light': { css: 'background-image', val: 'radial-gradient(ellipse at 85% 60%,rgba(22,174,151,.08),transparent 65%)' },
      'glow-button': { css: 'box-shadow', val: 'inset 0 1px 3px rgba(255,255,255,.7),0 0 14px rgba(33,230,189,.09)' },
      'logo-glow': { css: 'box-shadow', val: '0 0 24px rgba(33,230,189,.20)' }
    }
  };
  // The existing shared overlay preset is read by Msg at script load time.
  const overlay = window.JquanUIComponents.overlayPreset;
  Object.assign(overlay.classes, {
    surface: 'pointer-events-auto border border-stroke bg-raised text-ink shadow-xl',
    title: 'text-sm font-medium leading-5 break-words',
    description: 'text-xs text-muted leading-5 break-words',
    panelRadius: 'rounded-xl'
  });
  Object.assign(overlay.tones, {
    success: 'bg-success/15 text-success', info: 'bg-primary/15 text-primary',
    error: 'bg-danger/15 text-danger', warning: 'bg-warning/15 text-warning'
  });
})();
