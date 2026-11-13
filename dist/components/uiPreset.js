(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    if (JquanUIComponents.uiPreset) return;

    const legacy = {
            surface: 'border border-slate-200 bg-white text-slate-900 shadow-sm',
            surfaceMuted: 'bg-slate-50',
            panel: 'border border-slate-200 bg-white text-slate-900 shadow-sm rounded-2xl',
            panelLg: 'border border-slate-200 bg-white text-slate-900 shadow-sm rounded-3xl',
            control: 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700',
            controlSm: 'h-8 px-2 rounded-md border border-slate-200 bg-white text-slate-700',
            action: 'inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors duration-200',
            actionSubtle: 'inline-flex items-center justify-center h-9 px-3 rounded-lg bg-transparent text-slate-700 hover:bg-slate-100 transition-colors duration-200',
            navItem: 'inline-flex items-center gap-2 min-h-10 px-3 rounded-lg text-slate-600 transition-colors duration-200',
            navItemActive: 'bg-blue-50 text-blue-800 border border-blue-200',
            navItemMuted: 'text-slate-400',
            title: 'text-sm font-semibold leading-5 break-words',
            description: 'text-[13px] leading-5 text-slate-500 break-words',
            tableHead: 'bg-slate-50',
            tableCell: 'px-4 py-3 border-b border-slate-100 align-middle',
            tableRowHover: 'hover:bg-slate-50',
            tableRowStriped: 'even:bg-slate-50/60',
            focus: 'focus:outline-none focus:ring-2 focus:ring-blue-200'
    };

    // Opt in before loading components; Core owns the light/dark role values.
    const semantic = {
        surface: 'border border-border bg-surface text-text shadow-sm',
        surfaceMuted: 'bg-surface-muted',
        panel: 'border border-border bg-surface text-text shadow-sm rounded-2xl',
        panelLg: 'border border-border bg-surface text-text shadow-sm rounded-3xl',
        control: 'h-9 px-3 rounded-lg border border-border bg-surface text-text',
        controlSm: 'h-8 px-2 rounded-md border border-border bg-surface text-text',
        action: 'inline-flex items-center justify-center h-9 px-3 rounded-lg border border-border bg-surface text-text hover:bg-surface-muted transition-colors duration-200',
        actionSubtle: 'inline-flex items-center justify-center h-9 px-3 rounded-lg bg-transparent text-text hover:bg-surface-muted transition-colors duration-200',
        navItem: 'inline-flex items-center gap-2 min-h-10 px-3 rounded-lg text-text-muted transition-colors duration-200',
        navItemActive: 'bg-accent/10 text-accent border border-accent/30',
        navItemMuted: 'text-text-muted/70',
        title: 'text-sm font-semibold leading-5 text-text break-words',
        description: 'text-[13px] leading-5 text-text-muted break-words',
        tableHead: 'bg-surface-muted',
        tableCell: 'px-4 py-3 border-b border-border align-middle',
        tableRowHover: 'hover:bg-surface-muted',
        tableRowStriped: 'even:bg-surface-muted/60',
        tableText: 'text-text',
        tableTitle: 'text-text',
        tableMuted: 'text-text-muted',
        tableError: 'text-red-600 dark:text-red-400',
        focus: 'focus:outline-none focus:ring-2 focus:ring-focus',
        tableFocus: 'focus-visible:ring-2 focus-visible:ring-focus'
    };
    const config = global.JquanUI?.config || global.JQUAN_CONFIG || {};
    const mode = config.componentPresets?.ui === 'semantic' ? 'semantic' : 'legacy';
    JquanUIComponents.uiPreset = {
        mode,
        presets: { legacy, semantic },
        classes: Object.assign({}, mode === 'semantic' ? semantic : legacy)
    };
})(window);
