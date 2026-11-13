(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    function ensureModalApi() {
        return JquanUIComponents.modalApi || null;
    }

    const runtime = {
        seed: 0,
        active: new Map()
    };

    const defaults = {
        placement: 'right',
        size: 'md',
        closeOnBackdropClick: true,
        closeOnEscape: true,
        lockScroll: true,
        title: '',
        description: '',
        content: '',
        footer: null,
        actions: [],
        className: '',
        backdropClassName: '',
        beforeClose: null,
        onOpen: null,
        onClose: null,
        onDestroy: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-drawer-${runtime.seed}`;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.placement = ['left', 'right', 'top', 'bottom'].includes(merged.placement) ? merged.placement : 'right';
        return merged;
    }

    function resolveContent(options) {
        if (options.content) return options.content;
        if (options.target) {
            const node = typeof options.target === 'string' ? document.querySelector(options.target) : options.target;
            if (node) return node.innerHTML;
        }
        return '';
    }

    function forget(entry) {
        if (runtime.active.get(entry.id) === entry) runtime.active.delete(entry.id);
    }

    function modalOptions(entry) {
        return Object.assign({}, entry.options, {
            surface: 'drawer',
            onOpen(handle) { entry.options.onOpen?.(entry.handle || handle); },
            onClose(handle, reason) {
                forget(entry);
                entry.options.onClose?.(entry.handle || handle, reason);
            },
            onDestroy(handle, reason) {
                forget(entry);
                entry.options.onDestroy?.(entry.handle || handle, reason);
            }
        });
    }

    function wrapHandle(entry) {
        const modalHandle = entry.modalHandle;
        const update = next => {
            if (modalHandle.state().destroyed || modalHandle.state().isClosing) return null;
            const merged = normalizeOptions(Object.assign({}, entry.options, next || {}));
            if (next && next.target && !Object.prototype.hasOwnProperty.call(next, 'content')) merged.content = resolveContent(Object.assign({}, merged, { content: '' }));
            entry.options = merged;
            const result = modalHandle.update(modalOptions(entry));
            return result ? entry.handle : null;
        };
        return {
            id: entry.id,
            state() { return Object.assign({}, modalHandle.state(), { id: entry.id }); },
            close(reason) {
                return modalHandle.close(reason || 'api');
            },
            update,
            patch: update,
            destroy() {
                return modalHandle.destroy();
            },
            setBusy(busy, busyText) {
                return modalHandle.setBusy(busy, busyText);
            },
            element() {
                return modalHandle.element();
            },
            getFormData() { return modalHandle.getFormData(); }
        };
    }

    function openDrawer(input) {
        const modalApi = ensureModalApi();
        if (!modalApi) return null;

        const options = normalizeOptions(input);
        const id = options.id || nextId();
        runtime.active.get(id)?.handle.destroy();
        options.content = resolveContent(options);
        const entry = { id, options, handle: null, modalHandle: null };
        const handle = modalApi.drawer(modalOptions(entry));

        if (!handle) return null;

        entry.modalHandle = handle;
        const wrapped = entry.handle = wrapHandle(entry);
        runtime.active.set(id, entry);
        return wrapped;
    }

    function resolveActive(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.active.has(target)) return runtime.active.get(target);
            const modalApi = ensureModalApi();
            if (!modalApi) return null;
            return null;
        }
        for (const entry of runtime.active.values()) {
            if (entry.handle === target) return entry;
            const element = entry.handle.element();
            if (element === target || (element && target instanceof Node && element.contains(target))) return entry;
        }
        return null;
    }

    const drawerApi = {
        open(options) {
            return openDrawer(options);
        },
        close(target) {
            const entry = resolveActive(target);
            return entry ? entry.handle.close('api') : false;
        },
        update(target, next) {
            const entry = resolveActive(target);
            return entry ? entry.handle.update(next) : null;
        },
        patch(target, next) {
            const entry = resolveActive(target);
            return entry ? entry.handle.patch(next) : null;
        },
        destroy(target) {
            const entry = resolveActive(target);
            return entry ? entry.handle.destroy() : false;
        },
        closeAll() {
            Array.from(runtime.active.values()).forEach(entry => entry.handle.close('closeAll'));
            return true;
        }
    };

    JquanUIComponents.drawerApi = drawerApi;

    JquanUIComponents.drawer = {
        name: 'jquanui-drawer',
        version: '1.2.0',
        requires: ['jquanui-modal'],
        install(api) {
            api.addBehaviors({
                selector: '[jq-drawer-trigger]',
                setup(node) {
                    if (node.tagName === 'BUTTON' && !node.hasAttribute('type')) {
                        node.setAttribute('type', 'button');
                    }

                    const onClick = event => {
                        event.preventDefault();
                        const target = node.getAttribute('data-drawer-target');
                        const title = node.getAttribute('data-drawer-title') || '';
                        const description = node.getAttribute('data-drawer-description') || '';
                        const placement = node.getAttribute('data-drawer-placement') || 'right';
                        const size = node.getAttribute('data-drawer-size') || 'md';

                        openDrawer({
                            target,
                            title,
                            description,
                            placement,
                            size
                        });
                    };

                    node.addEventListener('click', onClick);
                    return () => {
                        node.removeEventListener('click', onClick);
                    };
                }
            });
        }
    };
})(window);
