(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        active: '',
        classes: {
            root: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            item: 'flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors duration-150',
            itemActive: 'border-primary/20 bg-primary/10',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            status: uiPreset.classes.badge || 'inline-flex h-6 items-center rounded-full border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-site-locale-switcher-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) {
        return Object.assign({
            id: 'locale-' + index,
            title: 'Locale',
            meta: '',
            status: 'draft'
        }, clone(item || {}));
    }
    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:site-locale-switcher:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.items.forEach(function (item) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.item, instance.active === item.id && classes.itemActive].filter(Boolean).join(' ');
            button.setAttribute('jq-site-locale-item', '');
            button.setAttribute('data-locale-id', item.id);
            button.innerHTML =
                '<span class="min-w-0">' +
                    '<span class="' + classes.title + '">' + item.title + '</span>' +
                    '<span class="mt-1 block ' + classes.meta + '">' + item.meta + '</span>' +
                '</span>' +
                '<span class="' + classes.status + '">' + item.status + '</span>';
            instance.root.appendChild(button);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-site-locale-switcher-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const items = Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [];
        const instance = {
            id,
            root,
            options: merged,
            items,
            active: String(merged.active || items[0]?.id || ''),
            state() { return { id: id, active: instance.active, items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const button = event.target.closest('[jq-site-locale-item]');
            if (!button || !root.contains(button)) return;
            handle.activate(button.getAttribute('data-locale-id'));
        };
        const handle = {
            id,
            activate(itemId) {
                instance.active = String(itemId || '');
                render(instance);
                dispatch(instance, 'change', { action: 'activate', itemId: instance.active });
                return instance.state();
            },
            setItems(itemsValue) {
                instance.items = Array.isArray(itemsValue) ? itemsValue.map(normalizeItem) : [];
                if (!instance.items.some(function (item) { return item.id === instance.active; })) instance.active = instance.items[0]?.id || '';
                render(instance);
                dispatch(instance, 'change', { action: 'setItems' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-site-locale-switcher-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-site-locale-switcher-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const siteLocaleSwitcherApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-site-locale-switcher-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.siteLocaleSwitcherApi = siteLocaleSwitcherApi;
    JquanUIComponents.siteLocaleSwitcher = {
        name: 'jquanui-site-locale-switcher',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-site-locale-switcher]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
