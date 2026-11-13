(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    if (JquanUIComponents.overlayPreset) return;

    const legacy = {
        classes: {
            backdrop: 'absolute inset-0 bg-slate-950/60 backdrop-blur-sm',
            surface: 'pointer-events-auto border border-slate-200 bg-white text-slate-900 shadow-2xl',
            panelRadius: 'rounded-2xl',
            panelRadiusLg: 'rounded-3xl',
            floatingPanel: 'fixed border border-slate-200 bg-white text-slate-900 shadow-xl',
            stackContainer: 'fixed flex flex-col pointer-events-none',
            icon: 'inline-flex items-center justify-center rounded-full text-[11px] font-bold',
            body: 'grid gap-1 min-w-0 flex-1',
            title: 'text-sm font-semibold leading-5 break-words',
            description: 'text-[13px] leading-5 text-slate-500 break-words',
            action: 'mt-1 border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-blue-600 cursor-pointer',
            close: 'border-0 bg-transparent p-0 w-5 h-5 leading-5 text-sm text-slate-500 cursor-pointer',
            softClose: 'inline-flex items-center justify-center w-9 h-9 rounded-full border-0 bg-slate-900/5 text-slate-700 cursor-pointer',
            focus: 'focus:outline-none focus:ring-2 focus:ring-blue-200'
        },
        tones: {
            info: 'bg-blue-100 text-blue-700',
            success: 'bg-green-100 text-green-700',
            warning: 'bg-amber-100 text-amber-700',
            error: 'bg-red-100 text-red-700',
            loading: 'bg-blue-100 text-blue-700'
        },
        icons: {
            info: 'i',
            success: 'ok',
            warning: '!',
            error: 'x',
            loading: '...'
        }
    };
    // Reuse Core's role variables; choose once before consumers capture defaults.
    const semantic = {
        classes: Object.assign({}, legacy.classes, {
            surface: 'pointer-events-auto border border-border bg-surface text-text shadow-2xl',
            floatingPanel: 'fixed border border-border bg-surface text-text shadow-xl',
            description: 'text-[13px] leading-5 text-text-muted break-words',
            action: 'mt-1 border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-accent cursor-pointer',
            close: 'border-0 bg-transparent p-0 w-5 h-5 leading-5 text-sm text-text-muted cursor-pointer',
            softClose: 'inline-flex items-center justify-center w-9 h-9 rounded-full border-0 bg-surface-muted text-text cursor-pointer',
            focus: 'focus:outline-none focus:ring-2 focus:ring-focus',
            arrow: 'bg-surface border-border'
        }),
        tones: {
            info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
            success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
            warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
            error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
            loading: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
        },
        icons: Object.assign({}, legacy.icons)
    };
    const config = global.JquanUI?.config || global.JQUAN_CONFIG || {};
    const mode = (config.componentPresets?.overlay ?? config.componentPresets?.ui) === 'semantic' ? 'semantic' : 'legacy';
    const selected = mode === 'semantic' ? semantic : legacy;
    JquanUIComponents.overlayPreset = {
        mode,
        presets: { legacy, semantic },
        classes: Object.assign({}, selected.classes),
        tones: Object.assign({}, selected.tones),
        icons: Object.assign({}, selected.icons)
    };
})(window);
