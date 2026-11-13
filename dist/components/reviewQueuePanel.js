(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            item: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4',
            head: 'flex items-start justify-between gap-3',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            body: 'text-sm text-slate-600',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-review-queue-panel-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) {
        return Object.assign({
            id: 'review-' + index,
            title: 'Review Item',
            meta: '',
            body: '',
            status: 'pending'
        }, clone(item || {}));
    }
    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:review-queue-panel:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }
    function findItem(instance, id) {
        return instance.items.find(function (item) { return item.id === String(id); }) || null;
    }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.items.forEach(function (item) {
            const card = document.createElement('article');
            card.className = classes.item;
            card.setAttribute('data-review-id', item.id);
            const head = document.createElement('div');
            head.className = classes.head;
            const title = document.createElement('div');
            title.className = classes.title;
            title.textContent = item.title;
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = [item.meta, item.status].filter(Boolean).join(' · ');
            head.appendChild(title);
            head.appendChild(meta);
            const body = document.createElement('div');
            body.className = classes.body;
            body.textContent = item.body;
            const actions = document.createElement('div');
            actions.className = classes.actions;
            ['approve', 'reject'].forEach(function (action) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = classes.action;
                button.textContent = action;
                button.setAttribute('jq-review-action', action);
                button.setAttribute('data-review-id', item.id);
                actions.appendChild(button);
            });
            card.appendChild(head);
            card.appendChild(body);
            card.appendChild(actions);
            instance.root.appendChild(card);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-review-queue-panel-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id,
            root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            focused: '',
            state() { return { id: id, focused: instance.focused, items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const button = event.target.closest('[jq-review-action]');
            if (!button || !root.contains(button)) return;
            const reviewId = button.getAttribute('data-review-id');
            const action = button.getAttribute('jq-review-action');
            if (action === 'approve') handle.approve(reviewId);
            if (action === 'reject') handle.reject(reviewId);
        };
        const handle = {
            id,
            approve(reviewId) {
                const item = findItem(instance, reviewId);
                if (!item) return instance.state();
                item.status = 'approved';
                instance.focused = item.id;
                render(instance);
                dispatch(instance, 'change', { action: 'approve', reviewId: item.id });
                return instance.state();
            },
            reject(reviewId) {
                const item = findItem(instance, reviewId);
                if (!item) return instance.state();
                item.status = 'rejected';
                instance.focused = item.id;
                render(instance);
                dispatch(instance, 'change', { action: 'reject', reviewId: item.id });
                return instance.state();
            },
            focus(reviewId) {
                instance.focused = String(reviewId || '');
                dispatch(instance, 'change', { action: 'focus', reviewId: instance.focused });
                return instance.state();
            },
            setItems(items) {
                instance.items = Array.isArray(items) ? items.map(normalizeItem) : [];
                render(instance);
                dispatch(instance, 'change', { action: 'setItems' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-review-queue-panel-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-review-queue-panel-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const reviewQueuePanelApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-review-queue-panel-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.reviewQueuePanelApi = reviewQueuePanelApi;
    JquanUIComponents.reviewQueuePanel = {
        name: 'jquanui-review-queue-panel',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-review-queue-panel]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
