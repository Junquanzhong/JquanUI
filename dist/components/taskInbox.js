(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-3',
            item: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            head: 'flex flex-wrap items-center justify-between gap-3',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            desc: 'text-sm text-slate-600',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-task-inbox-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ id: 'task-' + index, title: 'Task', meta: '', description: '', status: 'pending' }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:task-inbox:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.items.forEach(function (item) {
            const card = document.createElement('article');
            card.className = classes.item;
            card.setAttribute('data-task-id', item.id);
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
            const desc = document.createElement('div');
            desc.className = classes.desc;
            desc.textContent = item.description || '';
            const actions = document.createElement('div');
            actions.className = classes.actions;
            const done = document.createElement('button');
            done.type = 'button';
            done.className = classes.action;
            done.textContent = 'Done';
            done.setAttribute('jq-task-inbox-done', '');
            done.setAttribute('data-task-id', item.id);
            const snooze = document.createElement('button');
            snooze.type = 'button';
            snooze.className = classes.action;
            snooze.textContent = 'Snooze';
            snooze.setAttribute('jq-task-inbox-snooze', '');
            snooze.setAttribute('data-task-id', item.id);
            actions.appendChild(done);
            actions.appendChild(snooze);
            card.appendChild(head);
            card.appendChild(desc);
            card.appendChild(actions);
            instance.root.appendChild(card);
        });
    }
    function findTask(instance, id) { return instance.items.find(function (item) { return item.id === String(id); }) || null; }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-task-inbox-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id,
            root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            state() { return { id, items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const done = event.target.closest('[jq-task-inbox-done]');
            if (done && root.contains(done)) {
                handle.markDone(done.getAttribute('data-task-id'));
                return;
            }
            const snooze = event.target.closest('[jq-task-inbox-snooze]');
            if (snooze && root.contains(snooze)) {
                handle.snooze(snooze.getAttribute('data-task-id'));
            }
        };
        const handle = {
            id,
            setItems(items) { instance.items = Array.isArray(items) ? items.map(normalizeItem) : []; render(instance); dispatch(instance, 'change', { action: 'setItems' }); return instance.state(); },
            markDone(taskId) {
                const task = findTask(instance, taskId);
                if (!task) return instance.state();
                task.status = 'done';
                render(instance);
                dispatch(instance, 'change', { action: 'markDone', taskId: String(taskId) });
                return instance.state();
            },
            snooze(taskId) {
                const task = findTask(instance, taskId);
                if (!task) return instance.state();
                task.status = 'snoozed';
                render(instance);
                dispatch(instance, 'change', { action: 'snooze', taskId: String(taskId) });
                return instance.state();
            },
            prepend(item) { instance.items.unshift(normalizeItem(item || {}, 0)); render(instance); dispatch(instance, 'change', { action: 'prepend' }); return instance.state(); },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeAttribute('data-task-inbox-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-task-inbox-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const taskInboxApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-task-inbox-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.taskInboxApi = taskInboxApi;
    JquanUIComponents.taskInbox = {
        name: 'jquanui-task-inbox',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-task-inbox]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
