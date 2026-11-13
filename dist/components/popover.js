(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const overlayPreset = JquanUIComponents.overlayPreset || { classes: {} };

    const runtime = {
        instances: new Map(),
        idSeed: 0
    };

    const defaultClasses = {
        root: 'jq-popover relative inline-block',
        panel: `jq-popover-panel min-w-44 max-w-[min(92vw,320px)] p-3 ${overlayPreset.classes.panelRadius || 'rounded-2xl'} ${overlayPreset.classes.floatingPanel || 'border border-slate-200 bg-white text-slate-900 shadow-xl'} transition-all duration-200 ease-out`,
        panelClosed: 'opacity-0 scale-95 pointer-events-none invisible',
        panelOpen: 'opacity-100 scale-100 pointer-events-auto visible',
        arrow: `jq-popover-arrow absolute w-2.5 h-2.5 ${overlayPreset.classes.arrow || 'bg-white border-slate-200'} rotate-45`,
        close: `jq-popover-close ${overlayPreset.classes.close || 'border-0 bg-transparent p-0 w-5 h-5 leading-5 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors'}`,
        focus: overlayPreset.classes.focus || 'focus:outline-none focus:ring-2 focus:ring-blue-200'
    };

    function nextId(prefix) {
        runtime.idSeed += 1;
        return `${prefix}-${runtime.idSeed}`;
    }

    function mergeClasses() {
        return Array.from(arguments).flatMap(value => String(value || '').split(/\s+/).filter(Boolean)).join(' ');
    }

    function getViewportPadding(node) {
        const pad = Number(node.getAttribute('data-popover-padding') ?? 8);
        return Number.isFinite(pad) ? pad : 8;
    }

    function getPlacement(node) {
        return node.getAttribute('data-popover-pos') || 'bottom';
    }

    function getOffset(node) {
        const offset = Number(node.getAttribute('data-popover-offset') ?? 10);
        return Number.isFinite(offset) ? offset : 10;
    }

    function setState(node, state) {
        node.setAttribute('data-state', state);
        node.setAttribute('aria-expanded', state === 'open' ? 'true' : 'false');
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent(`jquan:popover:${eventName}`, {
            bubbles: true,
            detail: detail || {}
        }));
    }

    function applyState(instance, isOpen) {
        const { panel, classes } = instance;
        const addClasses = (isOpen ? classes.panelOpen : classes.panelClosed).split(/\s+/).filter(Boolean);
        const removeClasses = (isOpen ? classes.panelClosed : classes.panelOpen).split(/\s+/).filter(Boolean);
        const currentClasses = panel.className.split(/\s+/).filter(name => name && name !== 'hidden');

        if (isOpen && panel.hasAttribute('hidden')) panel.removeAttribute('hidden');

        if (isOpen && addClasses.includes('block') && !addClasses.includes('opacity-100')) {
            addClasses.push('opacity-100', 'scale-100', 'visible', 'pointer-events-auto');
        }

        panel.className = Array.from(new Set(
            currentClasses.filter(name => !removeClasses.includes(name)).concat(addClasses)
        )).join(' ');
    }

    function ensureArrow(instance) {
        let arrow = instance.panel.querySelector('[data-popover-arrow]');
        if (!arrow) {
            arrow = document.createElement('span');
            arrow.setAttribute('data-popover-arrow', 'true');
            instance.panel.appendChild(arrow);
        }
        arrow.className = instance.classes.arrow;
        arrow.style.borderLeftWidth = '1px';
        arrow.style.borderTopWidth = '1px';
        return arrow;
    }

    function applyArrow(instance, placement) {
        const arrow = ensureArrow(instance);
        arrow.style.left = '';
        arrow.style.right = '';
        arrow.style.top = '';
        arrow.style.bottom = '';
        arrow.style.marginLeft = '';
        arrow.style.marginTop = '';
        arrow.style.transform = '';
        if (placement === 'bottom') {
            arrow.style.top = '-6px';
            arrow.style.left = '50%';
            arrow.style.marginLeft = '-5px';
            arrow.style.transform = 'rotate(45deg)';
        } else if (placement === 'top') {
            arrow.style.bottom = '-6px';
            arrow.style.left = '50%';
            arrow.style.marginLeft = '-5px';
            arrow.style.transform = 'rotate(225deg)';
        } else if (placement === 'left') {
            arrow.style.right = '-6px';
            arrow.style.top = '50%';
            arrow.style.marginTop = '-5px';
            arrow.style.transform = 'rotate(135deg)';
        } else {
            arrow.style.left = '-6px';
            arrow.style.top = '50%';
            arrow.style.marginTop = '-5px';
            arrow.style.transform = 'rotate(-45deg)';
        }
    }

    function finishClose(instance, reason) {
        instance.overlay = null;
        if (instance.frame) cancelAnimationFrame(instance.frame);
        instance.frame = null;
        window.removeEventListener('resize', instance.onScrollOrResize, true);
        window.removeEventListener('scroll', instance.onScrollOrResize, true);
        instance.root.setAttribute('data-popover-open', 'false');
        setState(instance.root, 'closed');
        instance.trigger.setAttribute('aria-expanded', 'false');
        applyState(instance, false);
        dispatch(instance, 'close', { placement: instance.panel.dataset.popoverPlacement || getPlacement(instance.root), reason });
        if (typeof instance.onClose === 'function') instance.onClose(reason);
    }

    function closeInstance(id, restoreFocus = true, reason = 'programmatic') {
        const instance = runtime.instances.get(id);
        if (!instance?.overlay) return false;
        if (!restoreFocus) instance.overlay.update({ returnFocus: false });
        return instance.overlay.close(reason);
    }

    function positionPanel(instance) {
        const { root, trigger, panel } = instance;
        const placement = getPlacement(root);
        const offset = getOffset(root);
        const padding = getViewportPadding(root);
        const rect = trigger.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        let top = 0;
        let left = 0;
        let finalPlacement = placement;

        const placeBottom = () => { top = rect.bottom + offset; left = rect.left + (rect.width / 2) - (panelRect.width / 2); };
        const placeTop = () => { top = rect.top - panelRect.height - offset; left = rect.left + (rect.width / 2) - (panelRect.width / 2); };
        const placeLeft = () => { top = rect.top + (rect.height / 2) - (panelRect.height / 2); left = rect.left - panelRect.width - offset; };
        const placeRight = () => { top = rect.top + (rect.height / 2) - (panelRect.height / 2); left = rect.right + offset; };

        if (placement === 'top') placeTop();
        else if (placement === 'left') placeLeft();
        else if (placement === 'right') placeRight();
        else placeBottom();

        const overflowTop = top < padding;
        const overflowBottom = top + panelRect.height > window.innerHeight - padding;
        const overflowLeft = left < padding;
        const overflowRight = left + panelRect.width > window.innerWidth - padding;

        if (placement === 'bottom' && overflowBottom && !overflowTop) {
            finalPlacement = 'top';
            placeTop();
        } else if (placement === 'top' && overflowTop && !overflowBottom) {
            finalPlacement = 'bottom';
            placeBottom();
        } else if (placement === 'left' && overflowLeft && !overflowRight) {
            finalPlacement = 'right';
            placeRight();
        } else if (placement === 'right' && overflowRight && !overflowLeft) {
            finalPlacement = 'left';
            placeLeft();
        }

        top = Math.max(padding, Math.min(top, window.innerHeight - panelRect.height - padding));
        left = Math.max(padding, Math.min(left, window.innerWidth - panelRect.width - padding));

        panel.style.top = `${Math.round(top)}px`;
        panel.style.left = `${Math.round(left)}px`;
        panel.style.transformOrigin = finalPlacement === 'bottom'
            ? 'top center'
            : finalPlacement === 'top'
                ? 'bottom center'
                : finalPlacement === 'left'
                    ? 'center right'
                    : 'center left';
        panel.dataset.popoverPlacement = finalPlacement;
        applyArrow(instance, finalPlacement);
    }

    function openInstance(id) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.destroyed) return false;
        if (instance.overlay) return true;
        const manager = JquanUIComponents.overlayManagerApi;
        if (!manager) throw new Error('[JquanUI popover] Load overlayManager.js before opening Popover.');
        const { root, panel, trigger } = instance;
        const hover = root.getAttribute('data-popover-trigger') === 'hover';
        root.setAttribute('data-popover-open', 'true');
        setState(root, 'open');
        trigger.setAttribute('aria-expanded', 'true');
        applyState(instance, true);
        positionPanel(instance);
        try {
            instance.overlay = manager.open({
                element: panel, panel, ownerElement: root, zIndex: instance.zIndex,
                trapFocus: instance.trapFocus ?? !hover, lockScroll: false,
                closeOnEscape: instance.closeOnEscape, closeOnOutside: instance.closeOnOutside,
                outsideElements: [root], autoFocus: !hover && instance.autoFocus,
                returnFocus: hover ? false : trigger,
                onClose: reason => finishClose(instance, reason)
            });
        } catch (error) {
            root.setAttribute('data-popover-open', 'false'); setState(root, 'closed');
            trigger.setAttribute('aria-expanded', 'false'); applyState(instance, false);
            throw error;
        }
        // Focus handlers may synchronously close or destroy the layer.
        if (instance.destroyed) { instance.overlay.close('destroy'); instance.overlay = null; return false; }
        if (instance.overlay.state().closed) { instance.overlay = null; return false; }
        instance.frame = requestAnimationFrame(() => {
            instance.frame = null;
            if (runtime.instances.get(id) === instance && instance.overlay) {
                positionPanel(instance);
                if (!hover && instance.autoFocus && instance.overlay.isTop() && !panel.contains(document.activeElement)) instance.overlay.focus();
            }
        });
        window.addEventListener('resize', instance.onScrollOrResize, true);
        window.addEventListener('scroll', instance.onScrollOrResize, true);
        dispatch(instance, 'open', {
            placement: panel.dataset.popoverPlacement || getPlacement(root)
        });
        return true;
    }

    function toggleInstance(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        if (instance.root.getAttribute('data-popover-open') === 'true') return closeInstance(id, true);
        return openInstance(id);
    }

    function syncTriggerAria(instance) {
        const { trigger, panel, root } = instance;
        if (!trigger.hasAttribute('aria-haspopup')) trigger.setAttribute('aria-haspopup', 'dialog');
        if (!panel.id) panel.id = nextId('jq-popover-panel');
        if (!trigger.id) trigger.id = nextId('jq-popover-trigger');
        trigger.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', trigger.id);
        root.setAttribute('data-popover-open', 'false');
        trigger.setAttribute('aria-expanded', 'false');
        setState(root, 'closed');
    }

    function resolveInstance(target) {
        if (!target) return null;
        if (typeof target === 'object' && typeof target.state === 'function') {
            return Array.from(runtime.instances.values()).find(instance => instance.handle === target) || null;
        }
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            for (const instance of runtime.instances.values()) {
                if (instance.root.matches(target) || instance.panel.matches(target) || instance.trigger.matches(target)) return instance;
            }
            const found = document.querySelector(target);
            return found ? resolveInstance(found) : null;
        }
        for (const instance of runtime.instances.values()) if (instance.root === target || instance.panel === target || instance.trigger === target) return instance;
        for (const instance of Array.from(runtime.instances.values()).reverse()) if (target instanceof Node && instance.root.contains(target)) return instance;
        return null;
    }

    function createHandle(instance) {
        const id = instance.id;
        const live = () => !instance.destroyed && runtime.instances.get(id) === instance;
        return {
            id,
            open() { return live() ? openInstance(id) : false; },
            close() { return live() ? closeInstance(id, true) : false; },
            toggle() { return live() ? toggleInstance(id) : false; },
            destroy() { return live() ? destroyInstance(id) : false; },
            state() {
                return live() ? instance.root.getAttribute('data-popover-open') === 'true' : null;
            },
            element() {
                return live() ? instance.root : null;
            }
        };
    }

    function mount(root, options) {
        const existing = Array.from(runtime.instances.values()).find(instance => instance.root === root);
        if (existing) return existing.handle;
        if (!root) return null;

        const trigger = root.querySelector('[jq-popover-trigger]');
        const panel = root.querySelector('[jq-popover-panel]');
        if (!trigger || !panel) return null;
        const zIndex = Number(options?.zIndex ?? root.getAttribute('data-popover-zindex') ?? 2147482500);
        if (!Number.isFinite(zIndex)) throw new TypeError('Popover zIndex must be finite');

        const classes = Object.assign({}, defaultClasses, global.JquanUIComponents.popoverClasses || {}, options?.classes || {});
        root.className = mergeClasses(classes.root, root.className);
        if (!trigger.hasAttribute('type') && trigger.tagName === 'BUTTON') trigger.setAttribute('type', 'button');
        if (panel.hasAttribute('hidden')) panel.removeAttribute('hidden');
        panel.className = mergeClasses(classes.panel, panel.className.replace(/\bhidden\b/g, ''));
        panel.style.position = 'fixed';
        panel.style.zIndex = String(zIndex);
        trigger.className = mergeClasses(classes.focus, trigger.className);

        const instance = {
            id: root.id || nextId('jq-popover'),
            root,
            trigger,
            panel,
            classes,
            autoFocus: options?.autoFocus ?? (root.getAttribute('data-popover-autofocus') !== 'false'),
            trapFocus: options?.trapFocus,
            closeOnEscape: options?.closeOnEscape ?? true,
            closeOnOutside: options?.closeOnOutside ?? true,
            zIndex,
            onClose: typeof options?.onClose === 'function' ? options.onClose : null,
            basePanelClass: panel.className,
            cleanup: null, overlay: null, frame: null, destroyed: false,
            onScrollOrResize: () => { if (instance.overlay) positionPanel(instance); }
        };
        while (runtime.instances.has(instance.id)) instance.id = nextId('jq-popover');
        instance.handle = createHandle(instance);
        root.id = instance.id;
        runtime.instances.set(instance.id, instance);
        syncTriggerAria(instance);
        applyState(instance, false);

        const activate = event => {
            const mode = root.getAttribute('data-popover-trigger') || 'click';
            if (mode === 'hover') return;
            event.preventDefault();
            toggleInstance(instance.id);
        };
        const onKeyDown = event => {
            const mode = root.getAttribute('data-popover-trigger') || 'click';
            if (mode === 'hover') return;
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openInstance(instance.id);
            }
        };
        const onMouseEnter = () => {
            if ((root.getAttribute('data-popover-trigger') || 'click') !== 'hover') return;
            openInstance(instance.id);
        };
        const onMouseLeave = () => {
            if ((root.getAttribute('data-popover-trigger') || 'click') !== 'hover') return;
            closeInstance(instance.id, false);
        };

        trigger.addEventListener('click', activate);
        trigger.addEventListener('keydown', onKeyDown);
        root.addEventListener('mouseenter', onMouseEnter);
        root.addEventListener('mouseleave', onMouseLeave);

        const closeButton = root.querySelector('[jq-popover-close]');
        const onCloseButtonClick = event => {
            event.preventDefault();
            closeInstance(instance.id, true);
        };
        if (closeButton) {
            closeButton.className = mergeClasses(classes.close, closeButton.className);
            closeButton.addEventListener('click', onCloseButtonClick);
        }

        instance.cleanup = () => {
            if (instance.destroyed) return;
            instance.destroyed = true;
            runtime.instances.delete(instance.id);
            trigger.removeEventListener('click', activate);
            trigger.removeEventListener('keydown', onKeyDown);
            root.removeEventListener('mouseenter', onMouseEnter);
            root.removeEventListener('mouseleave', onMouseLeave);
            if (closeButton) closeButton.removeEventListener('click', onCloseButtonClick);
            if (instance.overlay) {
                instance.overlay.update({ returnFocus: false });
                instance.overlay.close('destroy');
            }
        };

        return instance.handle;
    }

    function destroyInstance(target) {
        const instance = resolveInstance(target);
        if (!instance) return false;
        if (instance.cleanup) instance.cleanup();
        return true;
    }

    const popoverApi = {
        getHandle(target) {
            // Read-only lookup. Never use mount() to detect an existing instance.
            try { return resolveInstance(target)?.handle || null; }
            catch (_) { return null; }
        },
        mount(target, options) {
            if (typeof target === 'string') {
                const node = document.querySelector(target);
                return node ? mount(node, options) : null;
            }
            return mount(target, options);
        },
        open(target) {
            const instance = resolveInstance(target);
            return instance ? openInstance(instance.id) : false;
        },
        close(target) {
            const instance = resolveInstance(target);
            return instance ? closeInstance(instance.id, true) : false;
        },
        toggle(target) {
            const instance = resolveInstance(target);
            return instance ? toggleInstance(instance.id) : false;
        },
        closeAll() {
            Array.from(runtime.instances.keys()).forEach(id => closeInstance(id, false));
        },
        destroy(target) {
            return destroyInstance(target);
        },
        getState(target) {
            const instance = resolveInstance(target);
            return instance ? instance.root.getAttribute('data-popover-open') === 'true' : false;
        }
    };

    JquanUIComponents.popoverApi = popoverApi;

    JquanUIComponents.popover = {
        name: 'jquanui-popover',
        version: '1.6.0',
        requires: ['jquanui-overlay-manager'],
        install(api) {
            api.addBehaviors({
                selector: '[jq-popover]',
                setup(root) {
                    const handle = mount(root);
                    return () => {
                        if (handle) handle.destroy();
                    };
                }
            });
        }
    };
})(window);
