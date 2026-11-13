(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        active: '',
        classes: {
            root: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm',
            item: uiPreset.classes.action || 'inline-flex h-auto items-start justify-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700',
            itemActive: 'border-primary/20 bg-primary/10 text-primary',
            meta: 'text-xs text-slate-500'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-content-outline-panel-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ id: 'outline-' + index, title: 'Heading ' + (index + 1), level: 2, meta: '' }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:content-outline-panel:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.items.forEach(function (item) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.item, instance.active === item.id && classes.itemActive].filter(Boolean).join(' ');
            button.style.paddingLeft = (12 + (Math.max(0, Number(item.level || 2) - 2) * 16)) + 'px';
            button.setAttribute('jq-outline-item', '');
            button.setAttribute('data-id', item.id);
            button.innerHTML = '<span class="flex-1 text-left">' + item.title + '</span><span class="' + classes.meta + '">' + (item.meta || ('H' + item.level)) + '</span>';
            instance.root.appendChild(button);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-content-outline-panel-id');
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
            state() { return { id, active: instance.active, items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const item = event.target.closest('[jq-outline-item]');
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
                root.removeAttribute('data-content-outline-panel-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-content-outline-panel-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const contentOutlinePanelApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-content-outline-panel-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.contentOutlinePanelApi = contentOutlinePanelApi;
    JquanUIComponents.contentOutlinePanel = {
        name: 'jquanui-content-outline-panel',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-content-outline-panel]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
