(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4',
            card: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            label: 'text-xs font-medium uppercase tracking-[0.12em] text-slate-500',
            value: 'text-2xl font-semibold text-slate-900',
            deltaUp: 'text-xs font-medium text-emerald-600',
            deltaDown: 'text-xs font-medium text-rose-600',
            desc: 'text-xs text-slate-500'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-dashboard-stats-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ key: 'stat-' + index, label: 'Metric', value: '0', delta: '', trend: 'up', description: '' }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:dashboard-stats:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        instance.items.forEach(function (item) {
            const card = document.createElement('section');
            card.className = classes.card;
            const label = document.createElement('div');
            label.className = classes.label;
            label.textContent = item.label;
            const value = document.createElement('div');
            value.className = classes.value;
            value.textContent = String(item.value);
            const delta = document.createElement('div');
            delta.className = item.trend === 'down' ? classes.deltaDown : classes.deltaUp;
            delta.textContent = item.delta || '';
            const desc = document.createElement('div');
            desc.className = classes.desc;
            desc.textContent = item.description || '';
            card.appendChild(label);
            card.appendChild(value);
            card.appendChild(delta);
            card.appendChild(desc);
            root.appendChild(card);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-dashboard-stats-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            state() { return { id: id, items: clone(instance.items) }; }
        };
        const handle = {
            id: id,
            setItems(items) { instance.items = Array.isArray(items) ? items.map(normalizeItem) : []; render(instance); dispatch(instance, 'change', { action: 'setItems' }); return instance.state(); },
            state() { return instance.state(); },
            destroy() { root.removeAttribute('data-dashboard-stats-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-dashboard-stats-id', id);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const dashboardStatsApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-dashboard-stats-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.dashboardStatsApi = dashboardStatsApi;
    JquanUIComponents.dashboardStats = {
        name: 'jquanui-dashboard-stats',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-dashboard-stats]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
