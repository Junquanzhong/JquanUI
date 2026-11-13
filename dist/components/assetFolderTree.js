(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        active: '',
        expanded: [],
        classes: {
            root: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm',
            item: 'grid gap-1',
            row: 'flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2',
            button: 'flex-1 text-left text-sm font-medium text-slate-800',
            meta: 'text-xs text-slate-500',
            children: 'grid gap-2 pl-4'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-asset-folder-tree-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) {
        const normalized = Object.assign({
            id: 'folder-' + index,
            title: 'Folder',
            meta: '',
            children: []
        }, clone(item || {}));
        normalized.children = Array.isArray(normalized.children) ? normalized.children.map(normalizeItem) : [];
        return normalized;
    }
    function flatten(items, result) {
        items.forEach(function (item) {
            result.push(item);
            if (Array.isArray(item.children) && item.children.length) flatten(item.children, result);
        });
        return result;
    }
    function findItem(items, id) {
        const flat = flatten(items, []);
        return flat.find(function (item) { return item.id === String(id); }) || null;
    }
    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:asset-folder-tree:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }
    function renderBranch(instance, items, level) {
        const classes = instance.options.classes;
        const wrap = document.createElement('div');
        wrap.className = level > 0 ? classes.children : 'grid gap-2';
        items.forEach(function (item) {
            const node = document.createElement('div');
            node.className = classes.item;
            const row = document.createElement('div');
            row.className = classes.row + (instance.active === item.id ? ' border-primary/20 bg-primary/10' : '');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = classes.button;
            button.setAttribute('jq-asset-folder-item', '');
            button.setAttribute('data-folder-id', item.id);
            button.textContent = item.title;
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = item.meta;
            row.appendChild(button);
            row.appendChild(meta);
            node.appendChild(row);
            if (Array.isArray(item.children) && item.children.length && instance.expanded.has(item.id)) {
                node.appendChild(renderBranch(instance, item.children, level + 1));
            }
            wrap.appendChild(node);
        });
        return wrap;
    }
    function render(instance) {
        instance.root.className = instance.options.classes.root;
        instance.root.innerHTML = '';
        instance.root.appendChild(renderBranch(instance, instance.items, 0));
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-asset-folder-tree-id');
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
            expanded: new Set((merged.expanded || []).map(String)),
            state() {
                return {
                    id: id,
                    active: instance.active,
                    expanded: Array.from(instance.expanded),
                    items: clone(instance.items)
                };
            }
        };
        const onClick = function (event) {
            const button = event.target.closest('[jq-asset-folder-item]');
            if (!button || !root.contains(button)) return;
            handle.activate(button.getAttribute('data-folder-id'));
        };
        const handle = {
            id,
            activate(itemId) {
                const item = findItem(instance.items, itemId);
                if (!item) return instance.state();
                instance.active = item.id;
                if (Array.isArray(item.children) && item.children.length) instance.expanded.add(item.id);
                render(instance);
                dispatch(instance, 'change', { action: 'activate', itemId: item.id });
                return instance.state();
            },
            toggle(itemId) {
                const key = String(itemId || '');
                if (instance.expanded.has(key)) instance.expanded.delete(key);
                else instance.expanded.add(key);
                render(instance);
                dispatch(instance, 'change', { action: 'toggle', itemId: key });
                return instance.state();
            },
            setItems(itemsValue) {
                instance.items = Array.isArray(itemsValue) ? itemsValue.map(normalizeItem) : [];
                render(instance);
                dispatch(instance, 'change', { action: 'setItems' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-asset-folder-tree-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-asset-folder-tree-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const assetFolderTreeApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-asset-folder-tree-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.assetFolderTreeApi = assetFolderTreeApi;
    JquanUIComponents.assetFolderTree = {
        name: 'jquanui-asset-folder-tree',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-asset-folder-tree]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
