(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const runtimeState = global.__JquanUIComponentRuntime || (global.__JquanUIComponentRuntime = { uid: 0, dialogOpenCount: 0 });
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const defaultClasses = {
        root: 'jq-dropdown relative inline-block text-left',
        menu: `jq-dropdown-menu absolute min-w-48 p-1.5 ${uiPreset.classes.panel || 'border border-slate-200 bg-white text-slate-900 shadow-lg rounded-2xl'} z-50 transition-all duration-200 ease-out`,
        menuClosed: 'opacity-0 scale-95 pointer-events-none invisible -translate-y-1',
        menuOpen: 'opacity-100 scale-100 pointer-events-auto visible translate-y-0',
        item: `jq-dropdown-item flex items-center w-full min-h-9 px-3 py-2 rounded-lg border-0 bg-transparent text-left text-[14px] text-slate-700 cursor-pointer transition-colors duration-200 ${uiPreset.classes.focus || 'focus:outline-none focus:ring-2 focus:ring-blue-200'}`,
        itemHighlight: uiPreset.classes.surfaceMuted || 'bg-slate-50',
        itemFocus: uiPreset.classes.focus || 'focus:outline-none focus:ring-2 focus:ring-blue-200'
    };

    function nextId(prefix) {
        runtimeState.uid += 1;
        return `${prefix}-${runtimeState.uid}`;
    }

    function mergeClasses() {
        return Array.from(arguments).flatMap(value => String(value || '').split(/\s+/).filter(Boolean)).join(' ');
    }

    JquanUIComponents.dropdown = {
        name: 'jquanui-dropdown',
        version: '1.4.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-dropdown]',
                setup(node) {
                    const classes = Object.assign({}, defaultClasses, global.JquanUIComponents.dropdownClasses || {});
                    const triggerMode = node.getAttribute('data-dropdown-trigger') || 'click';
                    const trigger = node.querySelector('[jq-dropdown-trigger]') || (triggerMode === 'contextmenu' ? node : null);
                    const menu = node.querySelector('[jq-dropdown-menu]');
                    const items = () => Array.from(node.querySelectorAll('[jq-dropdown-item]:not([disabled])'));
                    if (!trigger || !menu) return;

                    const pos = node.getAttribute('data-dropdown-pos') || 'bottom';
                    const align = node.getAttribute('data-dropdown-align') || 'start';
                    const posClasses = pos === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
                    const alignClasses = pos === 'top'
                        ? (align === 'end' ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left')
                        : (align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left');
                    const menuClosedClasses = pos === 'top'
                        ? classes.menuClosed.replace('-translate-y-1', 'translate-y-1')
                        : classes.menuClosed;

                    node.className = mergeClasses(classes.root, node.className);
                    if (menu.hasAttribute('hidden')) menu.removeAttribute('hidden');
                    menu.className = mergeClasses(
                        classes.menu,
                        triggerMode === 'contextmenu' ? 'fixed origin-top-left' : `${posClasses} ${alignClasses}`,
                        menu.className.replace(/\bhidden\b/g, '')
                    );

                    if (!node.hasAttribute('data-state')) node.setAttribute('data-state', 'closed');
                    if (!trigger.hasAttribute('aria-haspopup')) trigger.setAttribute('aria-haspopup', 'menu');
                    if (!trigger.hasAttribute('type') && trigger.tagName === 'BUTTON') trigger.setAttribute('type', 'button');
                    if (triggerMode === 'contextmenu' && trigger === node && !trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');
                    menu.setAttribute('role', 'menu');
                    if (!menu.id) menu.id = nextId('jq-dropdown-menu');
                    trigger.setAttribute('aria-controls', menu.id);

                    let highlightedIndex = -1;
                    let hoverTimeout = null;
                    let lastContextPoint = null;

                    const applyState = isOpen => {
                        const addClasses = (isOpen ? classes.menuOpen : menuClosedClasses).split(/\s+/).filter(Boolean);
                        const removeClasses = (isOpen ? menuClosedClasses : classes.menuOpen).split(/\s+/).filter(Boolean);
                        const current = menu.className.split(/\s+/).filter(Boolean);
                        menu.className = Array.from(new Set(current.filter(name => !removeClasses.includes(name)).concat(addClasses))).join(' ');
                    };

                    const dispatch = (eventName, detail) => {
                        node.dispatchEvent(new CustomEvent(`jquan:dropdown:${eventName}`, {
                            bubbles: true,
                            detail: detail || {}
                        }));
                    };

                    const positionContextMenu = point => {
                        if (!point) return;
                        const rect = menu.getBoundingClientRect();
                        const padding = 8;
                        const left = Math.max(padding, Math.min(point.x, window.innerWidth - rect.width - padding));
                        const top = Math.max(padding, Math.min(point.y, window.innerHeight - rect.height - padding));
                        menu.style.left = `${Math.round(left)}px`;
                        menu.style.top = `${Math.round(top)}px`;
                    };

                    const syncItems = () => {
                        items().forEach((item, index) => {
                            if (!item.dataset.baseClass) item.dataset.baseClass = item.className;
                            item.className = mergeClasses(classes.item, classes.itemFocus, index === highlightedIndex && classes.itemHighlight, item.dataset.baseClass);
                            item.setAttribute('role', 'menuitem');
                            item.setAttribute('tabindex', '-1');
                            item.setAttribute('data-index', String(index));
                            item.setAttribute('data-highlighted', index === highlightedIndex ? 'true' : 'false');
                        });
                    };

                    const close = (restoreFocus = true) => {
                        if (node.getAttribute('data-state') === 'closed') return;
                        node.setAttribute('data-state', 'closed');
                        trigger.setAttribute('aria-expanded', 'false');
                        applyState(false);
                        highlightedIndex = -1;
                        syncItems();
                        dispatch('close');
                        if (triggerMode === 'contextmenu') {
                            menu.style.left = '';
                            menu.style.top = '';
                        }
                        if (restoreFocus && triggerMode !== 'hover' && typeof trigger.focus === 'function') trigger.focus();
                    };

                    const open = detail => {
                        if (trigger.hasAttribute('disabled') || trigger.getAttribute('aria-disabled') === 'true') return;
                        if (node.getAttribute('data-state') === 'open' && triggerMode !== 'contextmenu') return;
                        node.setAttribute('data-state', 'open');
                        trigger.setAttribute('aria-expanded', 'true');
                        applyState(true);
                        syncItems();
                        if (triggerMode === 'contextmenu') positionContextMenu(lastContextPoint);
                        dispatch('open', detail);
                    };

                    const highlight = index => {
                        const list = items();
                        if (list.length === 0) return;
                        highlightedIndex = (index + list.length) % list.length;
                        syncItems();
                        list[highlightedIndex].focus();
                    };

                    syncItems();
                    trigger.setAttribute('aria-expanded', node.getAttribute('data-state') === 'open' ? 'true' : 'false');
                    applyState(node.getAttribute('data-state') === 'open');

                    const onTriggerClick = () => {
                        if (triggerMode !== 'click') return;
                        if (node.getAttribute('data-state') === 'open') close(false);
                        else open();
                    };

                    const onTriggerContextMenu = event => {
                        if (triggerMode !== 'contextmenu') return;
                        event.preventDefault();
                        lastContextPoint = {
                            x: event.clientX,
                            y: event.clientY
                        };
                        open({
                            trigger: 'contextmenu',
                            x: event.clientX,
                            y: event.clientY
                        });
                    };

                    const onDocumentClick = event => {
                        if (!node.contains(event.target) && node.getAttribute('data-state') === 'open') {
                            close(false);
                        }
                    };

                    const onMouseEnter = () => {
                        if (triggerMode !== 'hover') return;
                        if (hoverTimeout) clearTimeout(hoverTimeout);
                        open();
                    };

                    const onMouseLeave = () => {
                        if (triggerMode !== 'hover') return;
                        hoverTimeout = setTimeout(() => {
                            close(false);
                        }, 150);
                    };

                    const onTriggerKeydown = event => {
                        if (triggerMode === 'contextmenu' && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) {
                            event.preventDefault();
                            const rect = trigger.getBoundingClientRect();
                            lastContextPoint = {
                                x: rect.left + Math.min(24, rect.width / 2),
                                y: rect.top + Math.min(24, rect.height / 2)
                            };
                            open({
                                trigger: 'keyboard',
                                x: lastContextPoint.x,
                                y: lastContextPoint.y
                            });
                            highlight(0);
                        } else if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            if (node.getAttribute('data-state') !== 'open') open();
                            highlight(0);
                        } else if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            if (node.getAttribute('data-state') !== 'open') {
                                open();
                                highlight(0);
                            } else {
                                close(false);
                            }
                        } else if (event.key === 'Escape' && node.getAttribute('data-state') === 'open') {
                            event.preventDefault();
                            close();
                        }
                    };

                    const onMenuKeydown = event => {
                        const list = items();
                        if (list.length === 0) return;
                        if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            highlight(highlightedIndex < 0 ? 0 : highlightedIndex + 1);
                        } else if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            highlight(highlightedIndex < 0 ? list.length - 1 : highlightedIndex - 1);
                        } else if (event.key === 'Home') {
                            event.preventDefault();
                            highlight(0);
                        } else if (event.key === 'End') {
                            event.preventDefault();
                            highlight(list.length - 1);
                        } else if (event.key === 'Escape') {
                            event.preventDefault();
                            close();
                        }
                    };

                    const onMenuClick = event => {
                        const item = event.target.closest('[jq-dropdown-item]');
                        if (!item || !node.contains(item) || item.hasAttribute('disabled')) return;
                        dispatch('select', {
                            item,
                            action: item.getAttribute('data-action') || item.textContent.trim()
                        });
                        close(false);
                    };

                    trigger.addEventListener('click', onTriggerClick);
                    trigger.addEventListener('contextmenu', onTriggerContextMenu);
                    trigger.addEventListener('keydown', onTriggerKeydown);
                    menu.addEventListener('keydown', onMenuKeydown);
                    menu.addEventListener('click', onMenuClick);
                    if (triggerMode === 'hover') {
                        node.addEventListener('mouseenter', onMouseEnter);
                        node.addEventListener('mouseleave', onMouseLeave);
                    }
                    document.addEventListener('click', onDocumentClick);

                    return () => {
                        trigger.removeEventListener('click', onTriggerClick);
                        trigger.removeEventListener('contextmenu', onTriggerContextMenu);
                        trigger.removeEventListener('keydown', onTriggerKeydown);
                        menu.removeEventListener('keydown', onMenuKeydown);
                        menu.removeEventListener('click', onMenuClick);
                        if (triggerMode === 'hover') {
                            node.removeEventListener('mouseenter', onMouseEnter);
                            node.removeEventListener('mouseleave', onMouseLeave);
                        }
                        document.removeEventListener('click', onDocumentClick);
                        if (hoverTimeout) clearTimeout(hoverTimeout);
                    };
                }
            });
        }
    };
})(window);
