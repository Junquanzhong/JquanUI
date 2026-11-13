(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const overlayPreset = JquanUIComponents.overlayPreset || { classes: {}, tones: {}, icons: {} };

    const defaultConfig = {
        placement: 'top-center',
        maxCount: 5,
        duration: 3000,
        showClose: false,
        offset: 16,
        gap: 10
    };

    const runtime = {
        config: Object.assign({}, defaultConfig),
        containers: new Map(),
        instances: new Map(),
        seed: 0
    };

    const defaultClasses = {
        container: `jq-msg-container ${overlayPreset.classes.stackContainer || 'fixed flex flex-col pointer-events-none'} z-[2147483640]`,
        containerStart: 'items-start',
        containerCenter: 'items-center',
        containerEnd: 'items-end',
        item: `jq-msg ${overlayPreset.classes.surface || 'pointer-events-auto border border-slate-200 bg-white text-slate-900 shadow-xl'} flex items-start gap-2.5 min-w-65 max-w-[min(92vw,420px)] px-3.5 py-3 ${overlayPreset.classes.panelRadius || 'rounded-2xl'} opacity-0 transition duration-200`,
        icon: `${overlayPreset.classes.icon || 'inline-flex items-center justify-center rounded-full text-[11px] font-bold'} min-w-5 h-5 mt-0.5`,
        body: overlayPreset.classes.body || 'grid gap-1 min-w-0 flex-1',
        content: overlayPreset.classes.title || 'text-sm font-semibold leading-5 break-words',
        description: overlayPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words',
        close: overlayPreset.classes.close || 'border-0 bg-transparent p-0 w-5 h-5 leading-5 text-sm text-slate-500 cursor-pointer'
    };

    const typeToneMap = {
        info: overlayPreset.tones.info || 'bg-blue-100 text-blue-700',
        success: overlayPreset.tones.success || 'bg-green-100 text-green-700',
        warning: overlayPreset.tones.warning || 'bg-amber-100 text-amber-700',
        error: overlayPreset.tones.error || 'bg-red-100 text-red-700',
        loading: overlayPreset.tones.loading || 'bg-blue-100 text-blue-700'
    };

    const typeIconMap = {
        info: overlayPreset.icons.info || 'i',
        success: overlayPreset.icons.success || 'ok',
        warning: overlayPreset.icons.warning || '!',
        error: overlayPreset.icons.error || 'x',
        loading: overlayPreset.icons.loading || '...'
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-msg-${runtime.seed}`;
    }

    function normalizeOptions(input, typeFallback) {
        if (typeof input === 'string') return { content: input, type: typeFallback || 'info' };
        return Object.assign({ type: typeFallback || 'info' }, input || {});
    }

    function mergeClasses() {
        return Array.from(arguments).flatMap(value => String(value || '').split(/\s+/).filter(Boolean)).join(' ');
    }

    function ensureContainer(placement) {
        let container = runtime.containers.get(placement);
        if (container && document.body.contains(container)) return container;
        container = document.createElement('div');
        const alignClass = placement.includes('center') ? defaultClasses.containerCenter : placement.endsWith('left') ? defaultClasses.containerStart : defaultClasses.containerEnd;
        container.className = mergeClasses(defaultClasses.container, alignClass);
        container.setAttribute('data-msg-placement', placement);
        if (placement === 'top-left') {
            container.style.left = `${runtime.config.offset}px`;
            container.style.top = `${runtime.config.offset}px`;
        } else if (placement === 'top-right') {
            container.style.right = `${runtime.config.offset}px`;
            container.style.top = `${runtime.config.offset}px`;
        } else if (placement === 'bottom-left') {
            container.style.left = `${runtime.config.offset}px`;
            container.style.bottom = `${runtime.config.offset}px`;
        } else if (placement === 'bottom-right') {
            container.style.right = `${runtime.config.offset}px`;
            container.style.bottom = `${runtime.config.offset}px`;
        } else if (placement === 'bottom-center') {
            container.style.left = '50%';
            container.style.bottom = `${runtime.config.offset}px`;
            container.style.transform = 'translateX(-50%)';
        } else {
            container.style.left = '50%';
            container.style.top = `${runtime.config.offset}px`;
            container.style.transform = 'translateX(-50%)';
        }
        document.body.appendChild(container);
        runtime.containers.set(placement, container);
        return container;
    }

    function buildMessageElement(id, options) {
        const el = document.createElement('div');
        el.className = defaultClasses.item;
        el.setAttribute('data-msg-id', id);
        el.setAttribute('data-msg-type', options.type);
        el.setAttribute('role', options.type === 'error' || options.type === 'warning' ? 'alert' : 'status');
        el.setAttribute('aria-live', options.type === 'loading' ? 'polite' : 'assertive');

        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.className = mergeClasses(defaultClasses.icon, typeToneMap[options.type] || typeToneMap.info);
        icon.textContent = typeIconMap[options.type] || typeIconMap.info;

        const body = document.createElement('div');
        body.className = defaultClasses.body;
        const content = document.createElement('div');
        content.setAttribute('data-msg-content', 'true');
        content.className = defaultClasses.content;
        content.textContent = options.content || '';
        body.appendChild(content);

        if (options.description) {
            const description = document.createElement('div');
            description.setAttribute('data-msg-description', 'true');
            description.className = defaultClasses.description;
            description.textContent = options.description;
            body.appendChild(description);
        }

        el.appendChild(icon);
        el.appendChild(body);

        if (options.showClose) {
            const close = document.createElement('button');
            close.type = 'button';
            close.setAttribute('aria-label', 'Close message');
            close.className = defaultClasses.close;
            close.textContent = 'x';
            close.addEventListener('click', event => {
                event.stopPropagation();
                closeMessage(id);
            });
            el.appendChild(close);
        }
        return el;
    }

    function enforceMaxCount(placement, maxCount) {
        const list = Array.from(runtime.instances.values()).filter(item => item.options.placement === placement);
        if (list.length < maxCount) return;
        const removable = list.find(item => item.options.type !== 'loading') || list[0];
        if (removable) closeMessage(removable.id);
    }

    function showMessage(input, typeFallback) {
        const incoming = normalizeOptions(input, typeFallback);
        const options = Object.assign({}, runtime.config, incoming);
        const id = incoming.id || nextId();
        const placement = options.placement || runtime.config.placement;

        if (runtime.instances.has(id)) {
            updateMessage(id, options);
            return { id, close: () => closeMessage(id), update: next => updateMessage(id, next) };
        }

        const container = ensureContainer(placement);
        enforceMaxCount(placement, options.maxCount);
        const element = buildMessageElement(id, options);
        element.style.marginTop = container.children.length > 0 ? `${options.gap}px` : '0';
        element.style.transform = 'translateY(-12px)';
        container.appendChild(element);
        void element.offsetHeight;
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });

        let timer = null;
        if (options.autoClose !== false && options.type !== 'loading' && options.duration > 0) {
            timer = window.setTimeout(() => closeMessage(id), options.duration);
        }

        runtime.instances.set(id, { id, element, options, timer });
        return { id, close: () => closeMessage(id), update: next => updateMessage(id, next) };
    }

    function updateMessage(id, next) {
        const instance = runtime.instances.get(id);
        if (!instance) return null;
        const nextOptions = Object.assign({}, instance.options, normalizeOptions(next, instance.options.type));
        instance.options = nextOptions;

        const content = instance.element.querySelector('[data-msg-content]');
        if (content) content.textContent = nextOptions.content || '';
        let description = instance.element.querySelector('[data-msg-description]');
        if (nextOptions.description) {
            if (!description) {
                description = document.createElement('div');
                description.setAttribute('data-msg-description', 'true');
                description.className = defaultClasses.description;
                instance.element.querySelector('[data-msg-content]').after(description);
            }
            description.textContent = nextOptions.description;
        } else if (description) {
            description.remove();
        }

        instance.element.setAttribute('data-msg-type', nextOptions.type);
        instance.element.setAttribute('role', nextOptions.type === 'error' || nextOptions.type === 'warning' ? 'alert' : 'status');
        instance.element.setAttribute('aria-live', nextOptions.type === 'loading' ? 'polite' : 'assertive');
        const icon = instance.element.firstElementChild;
        if (icon) {
            icon.className = mergeClasses(defaultClasses.icon, typeToneMap[nextOptions.type] || typeToneMap.info);
            icon.textContent = typeIconMap[nextOptions.type] || typeIconMap.info;
        }

        if (instance.timer) {
            clearTimeout(instance.timer);
            instance.timer = null;
        }
        if (nextOptions.autoClose !== false && nextOptions.type !== 'loading' && nextOptions.duration > 0) {
            instance.timer = window.setTimeout(() => closeMessage(id), nextOptions.duration);
        }
        return { id, close: () => closeMessage(id), update: payload => updateMessage(id, payload) };
    }

    function closeMessage(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return;
        if (instance.timer) clearTimeout(instance.timer);
        const { element, options } = instance;
        element.style.opacity = '0';
        element.style.transform = 'translateY(-12px)';
        window.setTimeout(() => {
            if (element.parentNode) element.parentNode.removeChild(element);
            runtime.instances.delete(id);
            if (typeof options.onClose === 'function') options.onClose();
        }, 180);
    }

    function closeAll(placement) {
        Array.from(runtime.instances.values()).forEach(instance => {
            if (!placement || instance.options.placement === placement) closeMessage(instance.id);
        });
    }

    function configMessage(nextConfig) {
        runtime.config = Object.assign({}, runtime.config, nextConfig || {});
        return Object.assign({}, runtime.config);
    }

    function promiseMessage(promise, states) {
        const loading = showMessage(Object.assign({}, states.loading || {}, { type: 'loading' }), 'loading');
        return promise.then(result => {
            loading.update(Object.assign({}, states.success || { content: 'Completed' }, { type: 'success' }));
            return result;
        }).catch(error => {
            loading.update(Object.assign({}, states.error || { content: 'Failed' }, { type: 'error' }));
            throw error;
        });
    }

    const msgApi = {
        show(options) { return showMessage(options); },
        info(options) { return showMessage(options, 'info'); },
        success(options) { return showMessage(options, 'success'); },
        warning(options) { return showMessage(options, 'warning'); },
        error(options) { return showMessage(options, 'error'); },
        loading(options) { return showMessage(Object.assign({}, normalizeOptions(options, 'loading'), { autoClose: false }), 'loading'); },
        update(id, options) { return updateMessage(id, options); },
        close(id) { return closeMessage(id); },
        closeAll(placement) { return closeAll(placement); },
        config(options) { return configMessage(options); },
        promise(promise, states) { return promiseMessage(promise, states || {}); }
    };

    JquanUIComponents.msgApi = msgApi;

    JquanUIComponents.msg = {
        name: 'jquanui-msg',
        version: '1.2.0',
        requires: [],
        install() {}
    };
})(window);
