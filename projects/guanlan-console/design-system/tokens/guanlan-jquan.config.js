(function () {
  window.JQUAN_CONFIG = {
    theme: {
      extend: {
        colors: {
          canvas: '#F7FAFF',
          'canvas-cool': '#EEF5FF',
          surface: '#FFFFFF',
          'surface-soft': '#F6F8FF',
          line: '#E7EAF6',
          ink: '#30366F',
          muted: '#747BA8',
          faint: '#AEB5D1',
          primary: '#596BE8',
          'primary-deep': '#3858A8',
          violet: '#846BFF',
          sky: '#64C8FF',
          mint: '#31C879',
          amber: '#FFC84A',
          orange: '#FF8A62',
          rose: '#FF6F86'
        },
        boxShadow: {
          soft: '0 16px 40px rgba(86, 103, 214, 0.12)',
          float: '0 22px 55px rgba(68, 77, 146, 0.16)',
          glass: '0 28px 80px rgba(77, 91, 160, 0.18)'
        },
        borderRadius: {
          control: '12px',
          card: '18px',
          panel: '28px',
          screen: '32px'
        },
        fontFamily: {
          sans: ['AlimamaAgileVF', 'Microsoft YaHei UI', 'Microsoft YaHei', 'sans-serif']
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' }
          },
          pulseRing: {
            '0%': { transform: 'scale(0.72)', opacity: '0.42' },
            '100%': { transform: 'scale(1.5)', opacity: '0' }
          }
        },
        animation: {
          float: 'float 6s ease-in-out infinite',
          'pulse-ring': 'pulseRing 1.8s ease-out infinite'
        },
        fluid: {
          spacing: {
            stage: ['2rem', '6vw', '5rem'],
            frame: { min: '21rem', preferred: '88vw', max: '82rem' }
          },
          fontSize: {
            hero: { min: '3rem', preferred: '8vw', max: '7.5rem', lineHeight: '0.96' }
          }
        }
      }
    },
    shortcuts: {
      'gl-page': 'min-h-screen bg-canvas text-ink font-sans antialiased selection:bg-primary/20 selection:text-ink',
      'shadow-soft': 'shadow-[0_16px_40px_rgba(86,_103,_214,_0.12)]',
      'gl-stage': 'relative h-screen w-screen overflow-hidden',
      'gl-screen': 'relative h-full w-full max-w-none overflow-hidden rounded-none border-0 bg-white/75 shadow-none backdrop-blur-xl',
      'gl-panel': 'rounded-panel border border-white/80 bg-white/80 shadow-[0_16px_40px_rgba(86,_103,_214,_0.12)] backdrop-blur-xl',
      'gl-card': 'rounded-2xl border border-white/80 bg-white/88 shadow-[0_22px_55px_rgba(68,_77,_146,_0.16)] backdrop-blur-md',
      'gl-chip': 'inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/88 px-3 py-1.5 text-xs font-bold text-ink shadow-[0_16px_40px_rgba(86,_103,_214,_0.12)]',
      'gl-icon': 'inline-flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_16px_40px_rgba(86,_103,_214,_0.12)]',
      'gl-nav-icon': 'inline-flex size-10 items-center justify-center rounded-xl text-faint transition-colors hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary',
      'gl-nav-active': 'bg-primary/12 text-primary ring-1 ring-primary/15',
      'gl-nav-group': 'relative',
      'gl-flyout-menu': 'absolute left-[calc(100%+12px)] top-0 z-50 min-w-[220px] space-y-1 rounded-2xl border border-white/80 bg-white/92 p-2 shadow-[0_22px_55px_rgba(68,_77,_146,_0.16)] backdrop-blur-xl max-lg:fixed max-lg:left-3 max-lg:right-3 max-lg:top-20',
      'gl-flyout-menu-title': 'px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-faint',
      'gl-flyout-menu-link': 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      'gl-flyout-menu-active': 'bg-primary/10 text-primary',
      'gl-kicker': 'text-xs font-black uppercase tracking-[0.18em] text-muted',
      'gl-number': 'text-5xl font-light tracking-tight text-ink',
      'gl-label': 'text-xs font-semibold text-muted',
      'gl-map-marker': 'absolute z-20 flex items-center gap-2 rounded-xl border border-white/80 bg-white/92 px-3 py-2 text-xs font-bold text-ink shadow-[0_22px_55px_rgba(68,_77,_146,_0.16)] backdrop-blur-md',
      'gl-shell': 'relative grid h-full min-h-0 grid-cols-1 lg:grid-cols-[76px_1fr]',
      'gl-sidebar': 'relative z-30 flex items-center justify-between border-b border-line/70 px-5 py-4 lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-5',
      'gl-content': 'relative z-10 min-h-0 min-w-0 overflow-y-auto p-5 sm:p-7 lg:p-9',
      'gl-toolbar': 'flex flex-col gap-4 border-b border-line/70 pb-5 lg:flex-row lg:items-center lg:justify-between',
      'gl-section-title': 'text-2xl font-black tracking-tight text-ink',
      'gl-link-tabs': 'flex min-w-0 items-center gap-1 overflow-x-auto border-b border-line/80',
      'gl-link-tab': 'inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-3.5 text-sm font-bold text-muted transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      'gl-link-tab-active': 'border-primary text-primary',
      'gl-input': 'w-full rounded-xl border border-line bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15',
      'gl-select': 'w-full rounded-xl border border-line bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15',
      'gl-filter-panel': 'grid gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 data-[state=closed]:hidden data-[state=open]:grid',
      'gl-action': 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(86,_103,_214,_0.12)] transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      'gl-action-soft': 'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/80 px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50',
      'gl-bulk-bar': 'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm data-[state=empty]:opacity-70',
      'gl-table-wrap': 'overflow-x-auto rounded-2xl border border-line/80 bg-white/55',
      'gl-table': 'w-full min-w-[760px] border-collapse text-left text-sm',
      'gl-table-head': 'border-b border-line/80 bg-surface-soft/80 text-xs font-black uppercase tracking-[0.14em] text-muted',
      'gl-table-row': 'border-b border-line/60 text-muted transition-colors last:border-b-0 hover:bg-primary/5',
      'gl-status': 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
      'gl-form-section': 'rounded-2xl border border-line/80 bg-white/60 p-5 sm:p-6',
      'gl-field-label': 'mb-2 flex items-center gap-2 text-sm font-bold text-ink',
      'gl-auth-card': 'relative z-10 w-full max-w-md rounded-panel border border-white/80 bg-white/85 p-6 shadow-[0_28px_80px_rgba(77,_91,_160,_0.18)] backdrop-blur-xl sm:p-8'
    }
  };
})();

