(function (root) {
  const config = {
    theme: {
      semantic: {
        canvas: { light: '#FFFFFF', dark: '#0B1316' },
        paper: { light: '#FFFFFF', dark: '#141F23' },
        bone: { light: '#F3F4F6', dark: '#1B2A2F' },
        mist: { light: '#E2E8F0', dark: '#2A3C42' },
        'carbon-ink': { light: '#1D242F', dark: '#E6F2F0' },
        graphite: { light: '#111827', dark: '#CCDCDE' },
        slate: { light: '#6B7280', dark: '#9FB3B8' },
        steel: { light: '#718096', dark: '#829BA3' },
        fog: { light: '#9CA3AF', dark: '#7E969E' },
        'prism-teal': { light: '#14B8A6', dark: '#37D6B1' },
        'deep-teal': { light: '#0D9488', dark: '#32BBA8' },
        'action-ink': { light: '#0F766E', dark: '#70E4CD' },
        'action-fill': { light: '#0F766E', dark: '#70E4CD' },
        'on-action': { light: '#FFFFFF', dark: '#092C26' },
        'pet-fur': { light: '#14B8A6', dark: '#65E6CA' },
        'pet-tail': { light: '#0D9488', dark: '#58C7DA' },
        'pet-toy': { light: '#BD8D36', dark: '#E5BE69' },
        'pet-earth': { light: '#8C7962', dark: '#B69A7A' }
      },
      extend: {
        colors: {
          'cta-ink': '#092C26', 'night-cyan': '#58C7DA'
        },
        fontFamily: {
          body: ['Inter', 'Microsoft YaHei UI', 'system-ui', 'sans-serif'],
          display: ['Mona Sans VF', 'Inter', 'Microsoft YaHei UI', 'system-ui', 'sans-serif'],
          mono: ['Mona Sans Mono VF', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
        },
        keyframes: {
          mistDrift: {
            '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
            '50%': { transform: 'translate3d(22px, -10px, 0) scale(1.08)' }
          }
        },
        animation: { 'mist-drift': 'mistDrift 16s ease-in-out infinite' }
      }
    },
    shortcuts: {
      group: 'relative',
      'shadow-subtle': 'shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.12)]',
      'pr-round': 'rounded-[10px]',
      'pr-page': 'min-h-screen bg-canvas text-graphite font-body antialiased color-scheme-light dark:color-scheme-dark selection:bg-prism-teal/20 selection:text-carbon-ink',
      'pr-shell': 'relative mx-auto w-full max-w-[1200px] px-5 sm:px-8',
      'pr-nav': 'sticky top-0 z-40 border-b border-mist bg-paper/95 shadow-subtle backdrop-blur-sm',
      'pr-focus': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prism-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      'pr-nav-link': 'pr-focus inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-carbon-ink transition-colors hover:bg-bone hover:text-action-ink aria-[current=page]:text-action-ink',
      'pr-nav-brand': 'pr-focus inline-flex items-center gap-3 rounded-md text-carbon-ink',
      'pr-mark': 'inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-prism-teal text-sm font-bold text-white dark:text-cta-ink dark:shadow-[0_0_20px_rgba(55,214,177,0.12)]',
      'pr-primary': 'pr-focus inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-prism-teal bg-prism-teal px-4 py-2.5 text-sm font-semibold text-cta-ink shadow-subtle transition-colors hover:border-action-fill hover:bg-action-fill hover:text-on-action dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_16px_rgba(55,214,177,0.07)]',
      'pr-ghost': 'pr-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-mist bg-paper px-4 py-2.5 text-sm font-medium text-carbon-ink transition-colors hover:border-prism-teal hover:bg-bone',
      'pr-icon-button': 'pr-focus inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-mist bg-paper text-carbon-ink hover:border-prism-teal hover:text-action-ink',
      'pr-card': 'pr-round border border-mist bg-paper p-6 shadow-subtle dark:bg-[linear-gradient(145deg,rgba(55,214,177,0.025),transparent_65%)]',
      'pr-kicker': 'font-mono text-xs font-medium uppercase tracking-[0.16em] text-slate',
      'pr-display': 'font-display font-bold tracking-[0.03em] text-carbon-ink',
      'pr-body': 'text-base leading-7 text-slate',
      'pr-code-panel': 'pr-round my-7 border border-mist bg-bone p-5 font-mono text-sm leading-7 text-graphite dark:bg-canvas dark:border-prism-teal/20',
      'pr-chip': 'inline-flex items-center gap-2 rounded-md border border-mist bg-paper px-3 py-1.5 text-xs font-medium text-slate',
      'pr-filter': 'pr-ghost aria-[pressed=true]:border-action-fill aria-[pressed=true]:bg-action-fill aria-[pressed=true]:text-on-action',
      'pr-carousel-dot': 'pr-focus inline-flex size-10 items-center justify-center rounded-full border border-mist bg-paper/70 text-slate transition-colors hover:border-prism-teal hover:text-action-ink aria-[pressed=true]:border-prism-teal aria-[pressed=true]:bg-prism-teal/15 aria-[pressed=true]:text-action-ink',
      'pr-section': 'py-16 sm:py-20',
      'pr-rule': 'border-t border-mist',
      'pr-hero-title': 'pr-display text-3xl leading-snug sm:text-4xl xl:text-5xl',
      'pr-hero-slide': 'grid h-full min-w-0 items-center gap-8 pb-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12',
      'pr-cover': 'pr-round block w-full overflow-hidden border border-mist bg-bone',
      'pr-breadcrumb': 'mb-8 flex flex-wrap items-center gap-2 text-xs text-slate',
      'pr-article-heading': 'pr-display scroll-mt-36 pt-6 text-2xl md:scroll-mt-24',
      'pr-toc-link': 'pr-focus block rounded-md border-l-2 border-transparent py-2 pl-3 text-sm leading-6 text-slate hover:text-action-ink aria-[current=location]:border-deep-teal aria-[current=location]:text-action-ink',
      'pr-atmosphere': 'bg-[radial-gradient(ellipse_at_50%_0%,rgba(20,184,166,0.1),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_45%_0%,rgba(55,214,177,0.13),transparent_60%),radial-gradient(ellipse_at_90%_80%,rgba(88,199,218,0.06),transparent_55%)]',
      'pr-theme-option': 'pr-focus flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate hover:bg-bone hover:text-carbon-ink aria-[pressed=true]:bg-prism-teal/10 aria-[pressed=true]:text-action-ink',
      'pr-index-link': 'pr-focus inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm text-slate hover:bg-bone hover:text-action-ink aria-[current=page]:bg-prism-teal/10 aria-[current=page]:text-action-ink'
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = config;
  else root.JQUAN_CONFIG = config;
})(typeof window !== 'undefined' ? window : globalThis);
