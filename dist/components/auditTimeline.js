(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-3',
            item: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            head: 'flex flex-wrap items-center justify-between gap-3',
            title: 'text-sm font-semibold text-slate-800',
            time: 'text-xs text-slate-500',
            meta: 'text-xs text-slate-600',
            desc: 'text-sm text-slate-600'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-audit-timeline-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ id: 'audit-' + index, title: 'Action', actor: 'system', time: '', description: '', target: '' }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:audit-timeline:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        instance.items.forEach(function (item) {
            const card = document.createElement('section');
            card.className = classes.item;
            const head = document.createElement('div');
            head.className = classes.head;
            const title = document.createElement('div');
            title.className = classes.title;
            title.textContent = item.title;
            const time = document.createElement('div');
            time.className = classes.time;
            time.textContent = item.time || '';
            head.appendChild(title);
            head.appendChild(time);
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = [item.actor, item.target].filter(Boolean).join(' · ');
            const desc = document.createElement('div');
            desc.className = classes.desc;
            desc.textContent = item.description || '';
            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(desc);
            root.appendChild(card);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-audit-timeline-id');
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
            prepend(item) { instance.items.unshift(normalizeItem(item || {}, 0)); render(instance); dispatch(instance, 'change', { action: 'prepend' }); return instance.state(); },
            state() { return instance.state(); },
            destroy() { root.removeAttribute('data-audit-timeline-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-audit-timeline-id', id);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const auditTimelineApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-audit-timeline-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.auditTimelineApi = auditTimelineApi;
    JquanUIComponents.auditTimeline = {
        name: 'jquanui-audit-timeline',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-audit-timeline]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
