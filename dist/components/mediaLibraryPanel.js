(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        selected: [],
        classes: {
            root: 'grid gap-4',
            toolbar: 'flex flex-wrap items-center gap-3',
            search: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            grid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
            card: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors',
            cardActive: 'border-primary/30 bg-primary/5',
            thumb: 'aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 text-xs',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            badge: 'inline-flex h-6 items-center rounded-full border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-600',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-media-library-panel-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeItem(item, index) { return Object.assign({ id: String(item?.id || ('asset-' + index)), title: 'Asset', type: 'image', url: '', size: '', meta: '' }, clone(item || {})); }
    function visibleItems(instance) {
        const keyword = instance.keyword.trim().toLowerCase();
        if (!keyword) return instance.items.slice();
        return instance.items.filter(function (item) {
            return [item.title, item.type, item.meta, item.id].join(' ').toLowerCase().includes(keyword);
        });
    }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:media-library-panel:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        const toolbar = document.createElement('div');
        toolbar.className = classes.toolbar;
        const search = document.createElement('input');
        search.type = 'search';
        search.className = classes.search;
        search.value = instance.keyword;
        search.placeholder = 'Search media';
        search.setAttribute('jq-media-library-search', '');
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = classes.action;
        clear.textContent = 'Clear';
        clear.setAttribute('jq-media-library-clear', '');
        toolbar.appendChild(search);
        toolbar.appendChild(clear);
        root.appendChild(toolbar);
        const grid = document.createElement('div');
        grid.className = classes.grid;
        visibleItems(instance).forEach(function (item) {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = [classes.card, instance.selected.has(item.id) && classes.cardActive].filter(Boolean).join(' ');
            card.setAttribute('jq-media-library-item', '');
            card.setAttribute('data-id', item.id);
            const thumb = document.createElement('div');
            thumb.className = classes.thumb;
            if (item.url) {
                const image = document.createElement('img');
                image.src = item.url;
                image.alt = item.title;
                image.className = 'h-full w-full object-cover';
                thumb.appendChild(image);
            } else {
                thumb.textContent = item.type.toUpperCase();
            }
            const title = document.createElement('div');
            title.className = classes.title;
            title.textContent = item.title;
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = [item.type, item.size, item.meta].filter(Boolean).join(' · ');
            const badge = document.createElement('div');
            badge.className = classes.badge;
            badge.textContent = item.id;
            card.appendChild(thumb);
            card.appendChild(title);
            card.appendChild(meta);
            card.appendChild(badge);
            grid.appendChild(card);
        });
        root.appendChild(grid);
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-media-library-panel-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeItem) : [],
            selected: new Set((merged.selected || []).map(String)),
            keyword: '',
            state() { return { id: id, keyword: instance.keyword, selected: Array.from(instance.selected), visible: visibleItems(instance), items: clone(instance.items) }; }
        };
        const onClick = function (event) {
            const clear = event.target.closest('[jq-media-library-clear]');
            if (clear && root.contains(clear)) {
                instance.selected.clear();
                render(instance);
                dispatch(instance, 'change', { action: 'clear' });
                return;
            }
            const item = event.target.closest('[jq-media-library-item]');
            if (item && root.contains(item)) {
                const idValue = String(item.getAttribute('data-id'));
                if (instance.selected.has(idValue)) instance.selected.delete(idValue);
                else instance.selected.add(idValue);
                render(instance);
                dispatch(instance, 'change', { action: 'toggle', id: idValue });
            }
        };
        const onInput = function (event) {
            const search = event.target.closest('[jq-media-library-search]');
            if (!search || !root.contains(search)) return;
            instance.keyword = search.value || '';
            render(instance);
            dispatch(instance, 'change', { action: 'search', keyword: instance.keyword });
        };
        const handle = {
            id: id,
            setItems(items) { instance.items = Array.isArray(items) ? items.map(normalizeItem) : []; render(instance); dispatch(instance, 'change', { action: 'setItems' }); return instance.state(); },
            select(idValue) { instance.selected.add(String(idValue)); render(instance); dispatch(instance, 'change', { action: 'select', id: String(idValue) }); return instance.state(); },
            clear() { instance.selected.clear(); render(instance); dispatch(instance, 'change', { action: 'clear' }); return instance.state(); },
            values() { return instance.items.filter(function (item) { return instance.selected.has(item.id); }); },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeAttribute('data-media-library-panel-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-media-library-panel-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const mediaLibraryPanelApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-media-library-panel-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.mediaLibraryPanelApi = mediaLibraryPanelApi;
    JquanUIComponents.mediaLibraryPanel = {
        name: 'jquanui-media-library-panel',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-media-library-panel]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
