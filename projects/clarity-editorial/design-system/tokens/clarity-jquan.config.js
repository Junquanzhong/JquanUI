(function () {
  window.JQUAN_CONFIG = {
    theme: {
      extend: {
        colors: {
          canvas: '#F7F9FC',
          surface: '#FFFFFF',
          'surface-soft': '#FBFCFE',
          line: '#E7ECF2',
          ink: '#354252',
          muted: '#98A6B6',
          faint: '#C5CFD9',
          primary: '#4A9BFF',
          'primary-deep': '#287FE5',
          success: '#58C49B',
          warm: '#F4B97B'
        },
        boxShadow: {
          subtle: '0 8px 24px rgba(71, 93, 117, 0.08)',
          float: '0 16px 40px rgba(71, 93, 117, 0.14)'
        },
        borderRadius: {
          editorial: '4px',
          float: '8px'
        },
        fontFamily: {
          sans: ['Avenir Next', 'Segoe UI', 'Microsoft YaHei UI', 'sans-serif']
        }
      }
    },
    shortcuts: {
      'group': 'relative',
      'ce-page': 'min-h-screen bg-canvas text-ink font-sans antialiased',
      'ce-stage': 'relative h-screen w-screen overflow-hidden',
      'ce-screen': 'relative h-full w-full max-w-none overflow-hidden bg-canvas',
      'ce-shell': 'grid h-full min-h-0 grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-[74px_1fr] lg:grid-rows-1',
      'ce-sidebar': 'relative z-30 flex h-auto flex-row items-center justify-between border-b border-r-0 border-line bg-surface px-4 py-3 lg:h-full lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-5',
      'ce-nav-group': 'relative',
      'ce-nav-icon': 'relative inline-flex size-10 items-center justify-center text-faint transition-colors hover:text-primary focus-visible:text-primary',
      'ce-nav-active': 'text-primary',
      'ce-nav-active-bar': 'absolute -left-5 top-1/2 h-8 w-0.5 -translate-y-1/2 bg-primary max-md:-bottom-3 max-md:left-1/2 max-md:top-auto max-md:h-0.5 max-md:w-8 max-md:-translate-x-1/2 max-md:translate-y-0',
      'ce-flyout': 'absolute left-[calc(100%+1rem)] top-0 z-50 hidden min-w-[190px] border border-line bg-white p-2 shadow-float data-[state=open]:block max-md:fixed max-md:left-3 max-md:right-3 max-md:top-16',
      'ce-flyout-title': 'px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint',
      'ce-flyout-link': 'flex items-center gap-3 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-primary/5 hover:text-primary',
      'ce-flyout-link-active': 'bg-primary/5 text-primary',
      'ce-workspace': 'grid min-h-0 min-w-0 grid-rows-[68px_1fr]',
      'ce-header': 'relative z-20 flex items-center justify-between border-b border-line bg-surface px-5 shadow-subtle lg:px-8',
      'ce-search': 'flex items-center gap-3 text-sm text-muted',
      'ce-content': 'min-h-0 overflow-y-auto bg-canvas px-5 py-7 sm:px-8 lg:px-12',
      'ce-main': 'mx-auto w-full max-w-[1180px]',
      'ce-kicker': 'text-xs font-medium uppercase tracking-[0.16em] text-muted',
      'ce-title': 'text-2xl font-medium tracking-tight text-ink',
      'ce-panel': 'border border-line bg-surface shadow-subtle',
      'ce-panel-padded': 'border border-line bg-surface p-5 shadow-subtle sm:p-8',
      'ce-link': 'text-primary transition-colors hover:text-primary-deep',
      'ce-tab-list': 'flex items-center gap-5 overflow-x-auto',
      'ce-tab': 'relative inline-flex min-h-10 shrink-0 items-center px-1 text-sm text-muted transition-colors hover:text-primary',
      'ce-tab-active': 'font-medium text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary',
      'ce-input': 'w-full border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/10',
      'ce-button': 'inline-flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
      'ce-button-soft': 'inline-flex items-center justify-center gap-2 border border-line bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
      'ce-meta': 'text-sm text-muted',
      'ce-photo': 'block w-full overflow-hidden bg-surface-soft',
      'ce-photo-img': 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]',
      'ce-aspect-4-3': 'h-44 sm:h-52 lg:h-48',
      'ce-aspect-16-7': 'h-64 sm:h-80 lg:h-96',
      'ce-aspect-16-9': 'h-56 sm:h-72',
      'ce-footer': 'flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted',
      'ce-avatar': 'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-medium text-primary',
      'ce-popover-panel': 'min-w-56 border border-line bg-white p-2 text-sm text-muted shadow-float',
      'ce-popover-panel-scroll': 'max-h-[calc(100vh-1rem)] overflow-y-auto',
      'ce-auth-card': 'w-full max-w-[420px] border border-line bg-surface p-7 shadow-subtle sm:p-9'
    }
  };
})();
