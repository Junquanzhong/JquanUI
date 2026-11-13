(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            toolbar: 'flex flex-wrap gap-2',
            list: 'grid gap-3',
            row: 'grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_auto]',
            control: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            danger: 'inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm text-rose-700',
            help: 'text-xs text-slate-500'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-navigation-builder-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) {
        return Object.assign({ id: String(item?.id || ('nav-' + Date.now() + '-' + index)), label: 'Menu ' + (index + 1), path: '/', icon: 'folder' }, clone(item || {}));
    }
    function snapshot(instance) { return { id: instance.id, items: clone(instance.items), tree: clone(instance.items) }; }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:navigation-builder:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        const surface = document.createElement('section');
        surface.className = classes.surface;
        const toolbar = document.createElement('div');
        toolbar.className = classes.toolbar;
        const add = document.createElement('button');
        add.type = 'button';
        add.className = classes.action;
        add.setAttribute('jq-navigation-builder-add', '');
        add.textContent = 'Add item';
        toolbar.appendChild(add);
        surface.appendChild(toolbar);
        const list = document.createElement('div');
        list.className = classes.list;
        instance.items.forEach(function (item) {
            const row = document.createElement('div');
            row.className = classes.row;
            row.setAttribute('data-item-id', item.id);
            const label = document.createElement('input');
            label.className = classes.control;
            label.value = item.label;
            label.placeholder = 'Menu label';
            label.setAttribute('jq-navigation-builder-label', '');
            label.setAttribute('data-item-id', item.id);
            const path = document.createElement('input');
            path.className = classes.control;
            path.value = item.path;
            path.placeholder = '/path';
            path.setAttribute('jq-navigation-builder-path', '');
            path.setAttribute('data-item-id', item.id);
            const icon = document.createElement('input');
            icon.className = classes.control;
            icon.value = item.icon || '';
            icon.placeholder = 'icon';
            icon.setAttribute('jq-navigation-builder-icon', '');
            icon.setAttribute('data-item-id', item.id);
            const actions = document.createElement('div');
            actions.className = 'flex flex-wrap gap-2';
            const up = document.createElement('button');
            up.type = 'button';
            up.className = classes.action;
            up.textContent = 'Up';
            up.setAttribute('jq-navigation-builder-up', '');
            up.setAttribute('data-item-id', item.id);
            const down = document.createElement('button');
            down.type = 'button';
            down.className = classes.action;
            down.textContent = 'Down';
            down.setAttribute('jq-navigation-builder-down', '');
            down.setAttribute('data-item-id', item.id);
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = classes.danger;
            remove.textContent = 'Remove';
            remove.setAttribute('jq-navigation-builder-remove', '');
            remove.setAttribute('data-item-id', item.id);
            actions.appendChild(up);
            actions.appendChild(down);
            actions.appendChild(remove);
            row.appendChild(label);
            row.appendChild(path);
            row.appendChild(icon);
            row.appendChild(actions);
            list.appendChild(row);
        });
        surface.appendChild(list);
        const help = document.createElement('div');
        help.className = classes.help;
        help.textContent = 'Use items() or state() to output menu configs for sidebar, top nav or CMS navigation settings.';
        surface.appendChild(help);
        root.appendChild(surface);
    }
    function moveItem(instance, itemId, direction) {
        const index = instance.items.findIndex(function (item) { return item.id === String(itemId); });
        if (index < 0) return false;
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= instance.items.length) return false;
        const current = instance.items[index];
        instance.items[index] = instance.items[target];
        instance.items[target] = current;
        return true;
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-navigation-builder-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            state() { return snapshot(instance); }
        };
        const onClick = function (event) {
            const add = event.target.closest('[jq-navigation-builder-add]');
            if (add && root.contains(add)) { handle.appendItem(); return; }
            const up = event.target.closest('[jq-navigation-builder-up]');
            if (up && root.contains(up)) { if (moveItem(instance, up.getAttribute('data-item-id'), 'up')) { render(instance); dispatch(instance, 'change', { action: 'moveUp' }); } return; }
            const down = event.target.closest('[jq-navigation-builder-down]');
            if (down && root.contains(down)) { if (moveItem(instance, down.getAttribute('data-item-id'), 'down')) { render(instance); dispatch(instance, 'change', { action: 'moveDown' }); } return; }
            const remove = event.target.closest('[jq-navigation-builder-remove]');
            if (remove && root.contains(remove)) handle.removeItem(remove.getAttribute('data-item-id'));
        };
        const onInput = function (event) {
            const targetNode = event.target;
            const itemId = targetNode?.getAttribute('data-item-id');
            if (!itemId) return;
            const item = instance.items.find(function (entry) { return entry.id === String(itemId); });
            if (!item) return;
            if (targetNode.hasAttribute('jq-navigation-builder-label')) item.label = targetNode.value || '';
            if (targetNode.hasAttribute('jq-navigation-builder-path')) item.path = targetNode.value || '';
            if (targetNode.hasAttribute('jq-navigation-builder-icon')) item.icon = targetNode.value || '';
            dispatch(instance, 'change', { action: 'edit', itemId: itemId });
        };
        const handle = {
            id: id,
            appendItem(item) { instance.items.push(normalizeItem(item || {}, instance.items.length)); render(instance); dispatch(instance, 'change', { action: 'appendItem' }); return instance.state(); },
            removeItem(itemId) { instance.items = instance.items.filter(function (item) { return item.id !== String(itemId); }); render(instance); dispatch(instance, 'change', { action: 'removeItem', itemId: String(itemId) }); return instance.state(); },
            setItems(items) { instance.items = Array.isArray(items) ? items.map(normalizeItem) : []; render(instance); dispatch(instance, 'change', { action: 'setItems' }); return instance.state(); },
            items() { return clone(instance.items); },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeAttribute('data-navigation-builder-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-navigation-builder-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const navigationBuilderApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-navigation-builder-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.navigationBuilderApi = navigationBuilderApi;
    JquanUIComponents.navigationBuilder = {
        name: 'jquanui-navigation-builder',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-navigation-builder]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
