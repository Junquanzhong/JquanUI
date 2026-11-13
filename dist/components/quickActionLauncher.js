(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        keyword: '',
        classes: {
            root: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            search: uiPreset.classes.control || 'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700',
            grid: 'grid gap-3 sm:grid-cols-2',
            item: 'grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors duration-150 hover:border-primary/30 hover:bg-primary/5',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            body: 'text-sm text-slate-600',
            empty: 'rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-quick-action-launcher-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) {
        return Object.assign({
            id: 'action-' + index,
            title: 'Action',
            meta: '',
            description: ''
        }, clone(item || {}));
    }
    function visibleItems(instance) {
        const keyword = instance.keyword.trim().toLowerCase();
        if (!keyword) return instance.items.slice();
        return instance.items.filter(function (item) {
            return [item.id, item.title, item.meta, item.description].some(function (value) {
                return String(value || '').toLowerCase().includes(keyword);
            });
        });
    }
    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:quick-action-launcher:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }
    function render(instance) {
        const classes = instance.options.classes;
        const list = visibleItems(instance);
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        const search = document.createElement('input');
        search.type = 'search';
        search.className = classes.search;
        search.placeholder = 'Search actions';
        search.value = instance.keyword;
        search.setAttribute('jq-quick-action-search', '');
        instance.root.appendChild(search);
        if (!list.length) {
            const empty = document.createElement('div');
            empty.className = classes.empty;
            empty.textContent = 'No matched actions';
            instance.root.appendChild(empty);
            return;
        }
        const grid = document.createElement('div');
        grid.className = classes.grid;
        list.forEach(function (item) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = classes.item;
            button.setAttribute('jq-quick-action-item', '');
            button.setAttribute('data-action-id', item.id);
            button.innerHTML =
                '<div class="' + classes.title + '">' + item.title + '</div>' +
                '<div class="' + classes.meta + '">' + item.meta + '</div>' +
                '<div class="' + classes.body + '">' + item.description + '</div>';
            grid.appendChild(button);
        });
        instance.root.appendChild(grid);
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-quick-action-launcher-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id,
            root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            keyword: String(merged.keyword || ''),
            lastAction: '',
            state() {
                return {
                    id: id,
                    keyword: instance.keyword,
                    lastAction: instance.lastAction,
                    visible: visibleItems(instance).map(function (item) { return item.id; }),
                    items: clone(instance.items)
                };
            }
        };
        const onInput = function (event) {
            const input = event.target.closest('[jq-quick-action-search]');
            if (!input || !root.contains(input)) return;
            instance.keyword = input.value || '';
            render(instance);
            dispatch(instance, 'search', { keyword: instance.keyword });
        };
        const onClick = function (event) {
            const button = event.target.closest('[jq-quick-action-item]');
            if (!button || !root.contains(button)) return;
            handle.execute(button.getAttribute('data-action-id'));
        };
        const handle = {
            id,
            execute(actionId) {
                instance.lastAction = String(actionId || '');
                dispatch(instance, 'execute', { actionId: instance.lastAction });
                return instance.state();
            },
            search(keyword) {
                instance.keyword = String(keyword || '');
                render(instance);
                dispatch(instance, 'search', { keyword: instance.keyword });
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
                root.removeEventListener('input', onInput);
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-quick-action-launcher-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-quick-action-launcher-id', id);
        root.addEventListener('input', onInput);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const quickActionLauncherApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-quick-action-launcher-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.quickActionLauncherApi = quickActionLauncherApi;
    JquanUIComponents.quickActionLauncher = {
        name: 'jquanui-quick-action-launcher',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-quick-action-launcher]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
