(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-3',
            item: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            itemUnread: 'border-primary/20 bg-primary/5',
            head: 'flex flex-wrap items-center justify-between gap-3',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            body: 'text-sm text-slate-600',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-notification-center-panel-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ id: 'notice-' + index, title: 'Notification', meta: '', body: '', unread: true }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:notification-center-panel:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.items.forEach(function (item) {
            const card = document.createElement('article');
            card.className = [classes.item, item.unread && classes.itemUnread].filter(Boolean).join(' ');
            card.setAttribute('data-notice-id', item.id);
            const head = document.createElement('div');
            head.className = classes.head;
            const title = document.createElement('div');
            title.className = classes.title;
            title.textContent = item.title;
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = item.meta || '';
            head.appendChild(title);
            head.appendChild(meta);
            const body = document.createElement('div');
            body.className = classes.body;
            body.textContent = item.body || '';
            const actions = document.createElement('div');
            actions.className = classes.actions;
            const read = document.createElement('button');
            read.type = 'button';
            read.className = classes.action;
            read.textContent = item.unread ? 'Mark read' : 'Read';
            read.setAttribute('jq-notice-read', '');
            read.setAttribute('data-notice-id', item.id);
            actions.appendChild(read);
            card.appendChild(head);
            card.appendChild(body);
            card.appendChild(actions);
            instance.root.appendChild(card);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-notification-center-panel-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id,
            root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            state() { return { id, unreadCount: instance.items.filter(function (item) { return item.unread; }).length, items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const read = event.target.closest('[jq-notice-read]');
            if (!read || !root.contains(read)) return;
            handle.markRead(read.getAttribute('data-notice-id'));
        };
        const handle = {
            id,
            setItems(items) { instance.items = Array.isArray(items) ? items.map(normalizeItem) : []; render(instance); dispatch(instance, 'change', { action: 'setItems' }); return instance.state(); },
            markRead(noticeId) {
                const target = instance.items.find(function (item) { return item.id === String(noticeId); });
                if (!target) return instance.state();
                target.unread = false;
                render(instance);
                dispatch(instance, 'change', { action: 'markRead', noticeId: String(noticeId) });
                return instance.state();
            },
            prepend(item) { instance.items.unshift(normalizeItem(item || {}, 0)); render(instance); dispatch(instance, 'change', { action: 'prepend' }); return instance.state(); },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeAttribute('data-notification-center-panel-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-notification-center-panel-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const notificationCenterPanelApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-notification-center-panel-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.notificationCenterPanelApi = notificationCenterPanelApi;
    JquanUIComponents.notificationCenterPanel = {
        name: 'jquanui-notification-center-panel',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-notification-center-panel]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
