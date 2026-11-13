(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        active: '',
        classes: {
            root: 'grid gap-3',
            list: 'grid gap-2',
            item: uiPreset.classes.action || 'inline-flex h-auto items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700',
            itemActive: 'border-primary/20 bg-primary/10 text-primary',
            meta: 'text-xs text-slate-500'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-workspace-switcher-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ id: 'workspace-' + index, title: 'Workspace ' + (index + 1), meta: '' }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:workspace-switcher:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        const list = document.createElement('div');
        list.className = classes.list;
        instance.items.forEach(function (item) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.item, instance.active === item.id && classes.itemActive].filter(Boolean).join(' ');
            button.setAttribute('jq-workspace-switcher-item', '');
            button.setAttribute('data-id', item.id);
            button.innerHTML = '<span class="text-left">' + item.title + '</span><span class="' + classes.meta + '">' + (item.meta || '') + '</span>';
            list.appendChild(button);
        });
        instance.root.appendChild(list);
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-workspace-switcher-id');
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
            active: merged.active || items[0]?.id || '',
            state() { return { id, active: instance.active, current: instance.items.find(function (item) { return item.id === instance.active; }) || null, items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const item = event.target.closest('[jq-workspace-switcher-item]');
            if (!item || !root.contains(item)) return;
            handle.activate(item.getAttribute('data-id'));
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
                root.removeAttribute('data-workspace-switcher-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-workspace-switcher-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const workspaceSwitcherApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-workspace-switcher-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.workspaceSwitcherApi = workspaceSwitcherApi;
    JquanUIComponents.workspaceSwitcher = {
        name: 'jquanui-workspace-switcher',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-workspace-switcher]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
