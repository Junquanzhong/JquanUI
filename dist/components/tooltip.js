(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const overlayPreset = JquanUIComponents.overlayPreset || { classes: {} };

    const runtime = {
        tooltip: null,
        arrow: null,
        active: null
    };

    const defaultClasses = {
        tooltip: `jq-tooltip fixed z-[2147483000] px-3 py-2 rounded-lg bg-slate-950 text-white ${overlayPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words'} shadow-xl opacity-0 pointer-events-none transition duration-200 hidden max-w-[min(280px,calc(100vw-24px))] whitespace-pre-wrap`.replace(/\btext-(?:slate-500|text-muted)\b/g, 'text-white'),
        tooltipOpen: 'block',
        arrow: 'jq-tooltip-arrow fixed z-[2147483001] w-2.5 h-2.5 bg-slate-950 rotate-45 opacity-0 pointer-events-none transition duration-200 hidden'
    };

    function mergeClasses() {
        return Array.from(arguments).flatMap(value => String(value || '').split(/\s+/).filter(Boolean)).join(' ');
    }

    function ensureTooltip() {
        if (runtime.tooltip && document.body.contains(runtime.tooltip)) return runtime;
        runtime.tooltip = document.createElement('div');
        runtime.arrow = document.createElement('div');
        runtime.tooltip.className = defaultClasses.tooltip;
        runtime.arrow.className = defaultClasses.arrow;
        document.body.appendChild(runtime.tooltip);
        document.body.appendChild(runtime.arrow);
        return runtime;
    }

    function getPlacement(node) {
        return node.getAttribute('data-tips-pos') || (node.classList.contains('tips--bottom') ? 'bottom' : node.classList.contains('tips--left') ? 'left' : node.classList.contains('tips--right') ? 'right' : 'top');
    }

    function getWidth(node) {
        const length = node.getAttribute('data-tips-length');
        if (length === 'small') return 80;
        if (length === 'medium') return 150;
        if (length === 'large') return 260;
        return null;
    }

    function showTooltip(node) {
        const text = node.getAttribute('data-tips');
        if (!text) return;
        const ui = ensureTooltip();
        runtime.active = node;
        ui.tooltip.textContent = text;
        ui.tooltip.className = mergeClasses(defaultClasses.tooltip, defaultClasses.tooltipOpen);
        ui.arrow.className = mergeClasses(defaultClasses.arrow, defaultClasses.tooltipOpen);
        ui.tooltip.hidden = false;
        ui.arrow.hidden = false;
        ui.tooltip.style.textAlign = node.getAttribute('data-tips-align') || '';
        const width = getWidth(node);
        ui.tooltip.style.width = width ? `${width}px` : '';

        requestAnimationFrame(() => {
            const placement = getPlacement(node);
            const rect = node.getBoundingClientRect();
            const tooltipRect = ui.tooltip.getBoundingClientRect();
            const padding = 12;
            const gap = 12;
            let top = 0;
            let left = 0;

            if (placement === 'bottom') {
                top = rect.bottom + gap;
                left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                ui.arrow.style.top = `${top - 6}px`;
                ui.arrow.style.left = `${rect.left + rect.width / 2 - 5}px`;
                ui.arrow.style.transform = 'rotate(225deg)';
            } else if (placement === 'left') {
                top = rect.top + rect.height / 2 - tooltipRect.height / 2;
                left = rect.left - tooltipRect.width - gap;
                ui.arrow.style.top = `${rect.top + rect.height / 2 - 5}px`;
                ui.arrow.style.left = `${left + tooltipRect.width - 1}px`;
                ui.arrow.style.transform = 'rotate(135deg)';
            } else if (placement === 'right') {
                top = rect.top + rect.height / 2 - tooltipRect.height / 2;
                left = rect.right + gap;
                ui.arrow.style.top = `${rect.top + rect.height / 2 - 5}px`;
                ui.arrow.style.left = `${left - 6}px`;
                ui.arrow.style.transform = 'rotate(-45deg)';
            } else {
                top = rect.top - tooltipRect.height - gap;
                left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                ui.arrow.style.top = `${top + tooltipRect.height - 1}px`;
                ui.arrow.style.left = `${rect.left + rect.width / 2 - 5}px`;
                ui.arrow.style.transform = 'rotate(45deg)';
            }

            top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

            ui.tooltip.style.top = `${Math.round(top)}px`;
            ui.tooltip.style.left = `${Math.round(left)}px`;
            ui.tooltip.style.opacity = '1';
            ui.tooltip.style.transform = 'translateY(0)';
            ui.arrow.style.opacity = '1';
        });
    }

    function hideTooltip(node) {
        if (runtime.active !== node) return;
        runtime.tooltip.style.opacity = '0';
        runtime.arrow.style.opacity = '0';
        window.setTimeout(() => {
            if (runtime.active !== node) return;
            runtime.tooltip.className = defaultClasses.tooltip;
            runtime.arrow.className = defaultClasses.arrow;
            runtime.tooltip.hidden = true;
            runtime.arrow.hidden = true;
            runtime.active = null;
        }, 180);
    }

    JquanUIComponents.tooltip = {
        name: 'jquanui-tooltip-lite',
        version: '1.2.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[data-tips]',
                setup(node) {
                    const isNaturallyFocusable = /^(A|BUTTON|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(node.tagName);
                    if (!isNaturallyFocusable && !node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
                    if (!node.hasAttribute('aria-label') && !node.hasAttribute('aria-labelledby')) {
                        const text = node.getAttribute('data-tips');
                        if (text) node.setAttribute('aria-label', text);
                    }
                    const onEnter = () => showTooltip(node);
                    const onLeave = () => hideTooltip(node);
                    node.addEventListener('mouseenter', onEnter);
                    node.addEventListener('focus', onEnter);
                    node.addEventListener('mouseleave', onLeave);
                    node.addEventListener('blur', onLeave);
                    return () => {
                        node.removeEventListener('mouseenter', onEnter);
                        node.removeEventListener('focus', onEnter);
                        node.removeEventListener('mouseleave', onLeave);
                        node.removeEventListener('blur', onLeave);
                        hideTooltip(node);
                    };
                }
            });
        }
    };
})(window);
