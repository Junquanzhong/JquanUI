(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            item: 'grid gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3',
            head: 'flex items-start justify-between gap-3',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            body: 'text-sm leading-6 text-slate-600',
            badge: uiPreset.classes.badge || 'inline-flex h-6 items-center rounded-full border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-recent-activity-feed-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) {
        return Object.assign({
            id: 'activity-' + index,
            title: 'Activity',
            meta: '',
            body: '',
            type: 'update'
        }, clone(item || {}));
    }
    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:recent-activity-feed:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.items.forEach(function (item) {
            const card = document.createElement('article');
            card.className = classes.item;
            card.setAttribute('data-activity-id', item.id);
            const head = document.createElement('div');
            head.className = classes.head;
            const title = document.createElement('div');
            title.className = classes.title;
            title.textContent = item.title;
            const badge = document.createElement('span');
            badge.className = classes.badge;
            badge.textContent = item.type;
            head.appendChild(title);
            head.appendChild(badge);
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = item.meta;
            const body = document.createElement('div');
            body.className = classes.body;
            body.textContent = item.body;
            card.appendChild(head);
            card.appendChild(meta);
            card.appendChild(body);
            instance.root.appendChild(card);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-recent-activity-feed-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id,
            root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            state() { return { id: id, items: clone(instance.items) }; }
        };
        const handle = {
            id,
            setItems(items) {
                instance.items = Array.isArray(items) ? items.map(normalizeItem) : [];
                render(instance);
                dispatch(instance, 'change', { action: 'setItems' });
                return instance.state();
            },
            prepend(item) {
                instance.items.unshift(normalizeItem(item || {}, 0));
                render(instance);
                dispatch(instance, 'change', { action: 'prepend' });
                return instance.state();
            },
            append(item) {
                instance.items.push(normalizeItem(item || {}, instance.items.length));
                render(instance);
                dispatch(instance, 'change', { action: 'append' });
                return instance.state();
            },
            clear() {
                instance.items = [];
                render(instance);
                dispatch(instance, 'change', { action: 'clear' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                root.removeAttribute('data-recent-activity-feed-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-recent-activity-feed-id', id);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const recentActivityFeedApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-recent-activity-feed-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.recentActivityFeedApi = recentActivityFeedApi;
    JquanUIComponents.recentActivityFeed = {
        name: 'jquanui-recent-activity-feed',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-recent-activity-feed]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
