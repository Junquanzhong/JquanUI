(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const overlayPreset = JquanUIComponents.overlayPreset || { classes: {}, tones: {}, icons: {} };

    const runtime = {
        config: {
            placement: 'bottom-right',
            maxCount: 5,
            duration: 4500,
            gap: 12,
            offset: 16
        },
        containers: new Map(),
        items: new Map(),
        seed: 0
    };

    const defaultClasses = {
        container: `jq-toast-container ${overlayPreset.classes.stackContainer || 'fixed flex flex-col pointer-events-none'} z-[2147483600]`,
        containerStart: 'items-start',
        containerCenter: 'items-center',
        containerEnd: 'items-end',
        toast: `jq-toast ${overlayPreset.classes.surface || 'pointer-events-auto border border-slate-200 bg-white text-slate-900 shadow-xl'} grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 items-start min-w-70 max-w-[min(92vw,420px)] p-3.5 ${overlayPreset.classes.panelRadius || 'rounded-2xl'} opacity-0 transition duration-200`,
        icon: `${overlayPreset.classes.icon || 'inline-flex items-center justify-center rounded-full text-[11px] font-bold'} w-6 h-6`,
        body: overlayPreset.classes.body || 'grid gap-1 min-w-0 flex-1',
        title: overlayPreset.classes.title || 'text-sm font-semibold leading-5 break-words',
        description: overlayPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words',
        action: overlayPreset.classes.action || 'mt-1 border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-blue-600 cursor-pointer',
        close: overlayPreset.classes.close || 'border-0 bg-transparent p-0 w-5 h-5 leading-5 text-sm text-slate-500 cursor-pointer'
    };

    const toneMap = {
        info: { iconClass: overlayPreset.tones.info || 'bg-blue-100 text-blue-700', icon: overlayPreset.icons.info || 'i' },
        success: { iconClass: overlayPreset.tones.success || 'bg-green-100 text-green-700', icon: overlayPreset.icons.success || 'ok' },
        warning: { iconClass: overlayPreset.tones.warning || 'bg-amber-100 text-amber-700', icon: overlayPreset.icons.warning || '!' },
        error: { iconClass: overlayPreset.tones.error || 'bg-red-100 text-red-700', icon: overlayPreset.icons.error || 'x' },
        loading: { iconClass: overlayPreset.tones.loading || 'bg-blue-100 text-blue-700', icon: overlayPreset.icons.loading || '...' }
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-toast-${runtime.seed}`;
    }

    function normalizeOptions(input, typeFallback) {
        if (typeof input === 'string') {
            return { title: input, type: typeFallback || 'info' };
        }
        return Object.assign({ type: typeFallback || 'info' }, input || {});
    }

    function mergeClasses() {
        return Array.from(arguments).flatMap(value => String(value || '').split(/\s+/).filter(Boolean)).join(' ');
    }

    function getPlacementStyle(container, placement, offset) {
        container.style.top = '';
        container.style.right = '';
        container.style.bottom = '';
        container.style.left = '';
        container.style.transform = '';
        if (placement === 'top-left') {
            container.style.top = `${offset}px`; container.style.left = `${offset}px`;
        } else if (placement === 'top-center') {
            container.style.top = `${offset}px`; container.style.left = '50%'; container.style.transform = 'translateX(-50%)';
        } else if (placement === 'top-right') {
            container.style.top = `${offset}px`; container.style.right = `${offset}px`;
        } else if (placement === 'bottom-left') {
            container.style.bottom = `${offset}px`; container.style.left = `${offset}px`;
        } else if (placement === 'bottom-center') {
            container.style.bottom = `${offset}px`; container.style.left = '50%'; container.style.transform = 'translateX(-50%)';
        } else {
            container.style.bottom = `${offset}px`; container.style.right = `${offset}px`;
        }
    }

    function ensureContainer(placement) {
        let container = runtime.containers.get(placement);
        if (container && document.body.contains(container)) return container;
        container = document.createElement('div');
        const alignClass = placement.includes('center') ? defaultClasses.containerCenter : placement.endsWith('left') ? defaultClasses.containerStart : defaultClasses.containerEnd;
        container.className = mergeClasses(defaultClasses.container, alignClass);
        container.setAttribute('data-toast-placement', placement);
        getPlacementStyle(container, placement, runtime.config.offset);
        document.body.appendChild(container);
        runtime.containers.set(placement, container);
        return container;
    }

    function buildToastElement(id, options) {
        const tone = toneMap[options.type] || toneMap.info;
        const el = document.createElement('div');
        el.className = defaultClasses.toast;
        el.setAttribute('data-toast-id', id);
        el.setAttribute('data-toast-type', options.type);
        el.setAttribute('role', options.type === 'error' || options.type === 'warning' ? 'alert' : 'status');
        el.setAttribute('aria-live', options.type === 'loading' ? 'polite' : 'assertive');

        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.className = mergeClasses(defaultClasses.icon, tone.iconClass);
        icon.textContent = tone.icon;

        const body = document.createElement('div');
        body.className = defaultClasses.body;

        const title = document.createElement('div');
        title.setAttribute('data-toast-title', 'true');
        title.className = defaultClasses.title;
        title.textContent = options.title || '';
        body.appendChild(title);

        if (options.description) {
            const desc = document.createElement('div');
            desc.setAttribute('data-toast-description', 'true');
            desc.className = defaultClasses.description;
            desc.textContent = options.description;
            body.appendChild(desc);
        }

        if (options.actionText) {
            const action = document.createElement('button');
            action.type = 'button';
            action.setAttribute('data-toast-action', 'true');
            action.className = defaultClasses.action;
            action.textContent = options.actionText;
            action.addEventListener('click', event => {
                event.stopPropagation();
                if (typeof options.onAction === 'function') options.onAction();
                if (options.closeOnAction !== false) closeToast(id);
            });
            body.appendChild(action);
        }

        const close = document.createElement('button');
        close.type = 'button';
        close.setAttribute('aria-label', 'Close toast');
        close.className = defaultClasses.close;
        close.textContent = 'x';
        close.addEventListener('click', event => {
            event.stopPropagation();
            closeToast(id);
        });

        el.appendChild(icon);
        el.appendChild(body);
        el.appendChild(close);
        return el;
    }

    function enforceMaxCount(placement) {
        const list = Array.from(runtime.items.values()).filter(item => item.options.placement === placement);
        if (list.length < runtime.config.maxCount) return;
        const candidate = list.find(item => item.options.type !== 'loading') || list[0];
        if (candidate) closeToast(candidate.id);
    }

    function showToast(input, typeFallback) {
        const options = Object.assign({}, runtime.config, normalizeOptions(input, typeFallback));
        const id = options.id || nextId();
        const placement = options.placement || runtime.config.placement;

        if (runtime.items.has(id)) {
            updateToast(id, options);
            return createHandle(id);
        }

        const container = ensureContainer(placement);
        enforceMaxCount(placement);
        const element = buildToastElement(id, options);
        element.style.marginTop = container.children.length > 0 ? `${runtime.config.gap}px` : '0';
        element.style.transform = 'translateY(10px)';
        container.appendChild(element);

        void element.offsetHeight;
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });

        let timer = null;
        if (options.autoClose !== false && options.type !== 'loading' && options.duration > 0) {
            timer = window.setTimeout(() => closeToast(id), options.duration);
        }

        runtime.items.set(id, { id, element, options, timer });
        return createHandle(id);
    }

    function createHandle(id) {
        return { id, close: () => closeToast(id), update: next => updateToast(id, next) };
    }

    function updateToast(id, next) {
        const item = runtime.items.get(id);
        if (!item) return null;
        const options = Object.assign({}, item.options, normalizeOptions(next, item.options.type));
        item.options = options;

        const title = item.element.querySelector('[data-toast-title]');
        if (title) title.textContent = options.title || '';

        let desc = item.element.querySelector('[data-toast-description]');
        if (options.description) {
            if (!desc) {
                desc = document.createElement('div');
                desc.setAttribute('data-toast-description', 'true');
                desc.className = defaultClasses.description;
                item.element.querySelector('[data-toast-title]').after(desc);
            }
            desc.textContent = options.description;
        } else if (desc) {
            desc.remove();
        }

        const tone = toneMap[options.type] || toneMap.info;
        const icon = item.element.firstElementChild;
        if (icon) {
            icon.className = mergeClasses(defaultClasses.icon, tone.iconClass);
            icon.textContent = tone.icon;
        }

        item.element.setAttribute('data-toast-type', options.type);
        item.element.setAttribute('role', options.type === 'error' || options.type === 'warning' ? 'alert' : 'status');
        item.element.setAttribute('aria-live', options.type === 'loading' ? 'polite' : 'assertive');

        if (item.timer) {
            clearTimeout(item.timer);
            item.timer = null;
        }
        if (options.autoClose !== false && options.type !== 'loading' && options.duration > 0) {
            item.timer = window.setTimeout(() => closeToast(id), options.duration);
        }
        return createHandle(id);
    }

    function closeToast(id) {
        const item = runtime.items.get(id);
        if (!item) return false;
        if (item.timer) clearTimeout(item.timer);
        item.element.style.opacity = '0';
        item.element.style.transform = 'translateY(10px)';
        window.setTimeout(() => {
            if (item.element.parentNode) item.element.parentNode.removeChild(item.element);
            runtime.items.delete(id);
            if (typeof item.options.onClose === 'function') item.options.onClose();
        }, 180);
        return true;
    }

    function closeAll(placement) {
        Array.from(runtime.items.values()).forEach(item => {
            if (!placement || item.options.placement === placement) closeToast(item.id);
        });
    }

    function config(nextConfig = {}) {
        runtime.config = Object.assign({}, runtime.config, nextConfig);
        return Object.assign({}, runtime.config);
    }

    function promise(promiseLike, states = {}) {
        const handle = showToast(Object.assign({}, states.loading || {}, { type: 'loading' }), 'loading');
        return promiseLike.then(result => {
            handle.update(Object.assign({}, states.success || { title: 'Completed' }, { type: 'success' }));
            return result;
        }).catch(error => {
            handle.update(Object.assign({}, states.error || { title: 'Failed' }, { type: 'error' }));
            throw error;
        });
    }

    const toastApi = {
        show(options) { return showToast(options); },
        info(options) { return showToast(options, 'info'); },
        success(options) { return showToast(options, 'success'); },
        warning(options) { return showToast(options, 'warning'); },
        error(options) { return showToast(options, 'error'); },
        loading(options) { return showToast(Object.assign({}, normalizeOptions(options, 'loading'), { autoClose: false }), 'loading'); },
        update(id, options) { return updateToast(id, options); },
        close(id) { return closeToast(id); },
        closeAll(placement) { return closeAll(placement); },
        config(nextConfig) { return config(nextConfig); },
        promise(promiseLike, states) { return promise(promiseLike, states); }
    };

    JquanUIComponents.toastApi = toastApi;

    JquanUIComponents.toast = {
        name: 'jquanui-toast',
        version: '1.2.0',
        requires: [],
        install() {}
    };
})(window);
