(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        items: [],
        multiple: false,
        view: 'grid',
        filter: 'all',
        selected: [],
        emptyText: 'No media items',
        classes: {
            root: 'grid gap-4',
            toolbar: 'flex flex-wrap items-center gap-3',
            actions: 'flex flex-wrap items-center gap-2',
            segment: 'inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm',
            segmentButton: 'inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm text-slate-600 transition-colors duration-150',
            segmentButtonActive: 'bg-slate-900 text-white',
            search: uiPreset.classes.control || 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700',
            body: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]',
            surface: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            grid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
            list: 'grid gap-3',
            card: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-colors duration-150',
            cardActive: 'border-blue-300 bg-blue-50',
            thumb: 'grid h-28 place-items-center overflow-hidden rounded-xl bg-slate-100',
            meta: 'grid gap-1',
            title: 'text-sm font-semibold text-slate-800',
            desc: 'text-xs text-slate-500',
            badge: 'inline-flex h-6 items-center rounded-full border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-600',
            empty: 'rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500',
            selectedList: 'grid gap-2',
            selectedItem: 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-media-picker-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeItems(items) {
        return Array.isArray(items) ? items.map(function (item, index) {
            return Object.assign({
                id: String(item.id != null ? item.id : 'media-' + index),
                type: 'image',
                title: 'Untitled',
                url: '',
                size: 0,
                description: ''
            }, clone(item));
        }) : [];
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:media-picker:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function formatSize(size) {
        const value = Number(size) || 0;
        if (value >= 1024 * 1024) return (value / (1024 * 1024)).toFixed(1) + ' MB';
        if (value >= 1024) return Math.round(value / 1024) + ' KB';
        return value + ' B';
    }

    function isVisible(instance, item) {
        const byFilter = instance.filter === 'all' || item.type === instance.filter;
        const keyword = instance.keyword.trim().toLowerCase();
        const byKeyword = !keyword || [item.title, item.description, item.type].join(' ').toLowerCase().includes(keyword);
        return byFilter && byKeyword;
    }

    function visibleItems(instance) {
        return instance.items.filter(function (item) {
            return isVisible(instance, item);
        });
    }

    function selectedItems(instance) {
        return instance.items.filter(function (item) {
            return instance.selected.has(String(item.id));
        });
    }

    function renderCard(instance, item) {
        const classes = instance.options.classes;
        const active = instance.selected.has(String(item.id));
        const card = document.createElement('button');
        card.type = 'button';
        card.className = [classes.card, active && classes.cardActive].filter(Boolean).join(' ');
        card.setAttribute('jq-media-picker-item', '');
        card.setAttribute('data-id', String(item.id));
        card.setAttribute('data-type', item.type);
        const thumb = document.createElement('div');
        thumb.className = classes.thumb;
        if (item.url && item.type === 'image') {
            const image = document.createElement('img');
            image.src = item.url;
            image.alt = item.title;
            image.className = 'h-full w-full object-cover';
            thumb.appendChild(image);
        } else {
            const fallback = document.createElement('div');
            fallback.className = 'grid gap-1 text-center';
            const label = document.createElement('div');
            label.className = 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400';
            label.textContent = item.type;
            const title = document.createElement('div');
            title.className = 'text-sm font-semibold text-slate-700';
            title.textContent = item.title;
            fallback.appendChild(label);
            fallback.appendChild(title);
            thumb.appendChild(fallback);
        }
        const meta = document.createElement('div');
        meta.className = classes.meta;
        const title = document.createElement('div');
        title.className = classes.title;
        title.textContent = item.title;
        const desc = document.createElement('div');
        desc.className = classes.desc;
        desc.textContent = [item.type, formatSize(item.size), item.description].filter(Boolean).join(' · ');
        meta.appendChild(title);
        meta.appendChild(desc);
        card.appendChild(thumb);
        card.appendChild(meta);
        return card;
    }

    function render(instance) {
        const root = instance.root;
        const classes = instance.options.classes;
        root.className = classes.root;
        root.innerHTML = '';

        const toolbar = document.createElement('div');
        toolbar.className = classes.toolbar;

        const filters = document.createElement('div');
        filters.className = classes.segment;
        ['all', 'image', 'video', 'file'].forEach(function (type) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.segmentButton, instance.filter === type && classes.segmentButtonActive].filter(Boolean).join(' ');
            button.setAttribute('jq-media-picker-filter', '');
            button.setAttribute('data-filter', type);
            button.textContent = type;
            filters.appendChild(button);
        });

        const views = document.createElement('div');
        views.className = classes.segment;
        ['grid', 'list'].forEach(function (view) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.segmentButton, instance.view === view && classes.segmentButtonActive].filter(Boolean).join(' ');
            button.setAttribute('jq-media-picker-view', '');
            button.setAttribute('data-view', view);
            button.textContent = view;
            views.appendChild(button);
        });

        const search = document.createElement('input');
        search.type = 'search';
        search.className = classes.search;
        search.placeholder = 'Search media';
        search.value = instance.keyword;
        search.setAttribute('jq-media-picker-search', '');

        const mode = document.createElement('div');
        mode.className = classes.badge;
        mode.textContent = instance.options.multiple ? 'multiple' : 'single';

        toolbar.appendChild(filters);
        toolbar.appendChild(views);
        toolbar.appendChild(search);
        toolbar.appendChild(mode);
        root.appendChild(toolbar);

        const body = document.createElement('div');
        body.className = classes.body;

        const surface = document.createElement('section');
        surface.className = classes.surface;
        const list = visibleItems(instance);
        if (!list.length) {
            const empty = document.createElement('div');
            empty.className = classes.empty;
            empty.textContent = instance.options.emptyText;
            surface.appendChild(empty);
        } else {
            const wrap = document.createElement('div');
            wrap.className = instance.view === 'grid' ? classes.grid : classes.list;
            list.forEach(function (item) {
                wrap.appendChild(renderCard(instance, item));
            });
            surface.appendChild(wrap);
        }

        const aside = document.createElement('aside');
        aside.className = classes.surface;
        const title = document.createElement('div');
        title.className = 'text-sm font-semibold text-slate-800';
        title.textContent = 'Selected';
        aside.appendChild(title);
        const selected = selectedItems(instance);
        const selectedListNode = document.createElement('div');
        selectedListNode.className = 'mt-3 ' + classes.selectedList;
        if (!selected.length) {
            const empty = document.createElement('div');
            empty.className = classes.empty;
            empty.textContent = 'No selected items';
            selectedListNode.appendChild(empty);
        } else {
            selected.forEach(function (item) {
                const row = document.createElement('div');
                row.className = classes.selectedItem;
                row.textContent = item.title + ' · ' + item.type;
                selectedListNode.appendChild(row);
            });
        }
        aside.appendChild(selectedListNode);

        body.appendChild(surface);
        body.appendChild(aside);
        root.appendChild(body);
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-media-picker-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            items: normalizeItems(merged.items),
            selected: new Set((merged.selected || []).map(String)),
            filter: merged.filter || 'all',
            view: merged.view || 'grid',
            keyword: '',
            openState: false,
            state() {
                return {
                    id: id,
                    filter: instance.filter,
                    view: instance.view,
                    multiple: instance.options.multiple,
                    keyword: instance.keyword,
                    total: instance.items.length,
                    visible: visibleItems(instance).length,
                    selected: Array.from(instance.selected),
                    values: selectedItems(instance)
                };
            }
        };

        const onClick = function (event) {
            const filter = event.target.closest('[jq-media-picker-filter]');
            if (filter && root.contains(filter)) {
                instance.filter = String(filter.getAttribute('data-filter'));
                render(instance);
                dispatch(instance, 'filter', { filter: instance.filter });
                return;
            }
            const view = event.target.closest('[jq-media-picker-view]');
            if (view && root.contains(view)) {
                instance.view = String(view.getAttribute('data-view'));
                render(instance);
                dispatch(instance, 'view', { view: instance.view });
                return;
            }
            const card = event.target.closest('[jq-media-picker-item]');
            if (card && root.contains(card)) {
                const key = String(card.getAttribute('data-id'));
                if (instance.options.multiple) {
                    if (instance.selected.has(key)) instance.selected.delete(key);
                    else instance.selected.add(key);
                } else {
                    instance.selected.clear();
                    instance.selected.add(key);
                }
                render(instance);
                dispatch(instance, 'select', { selected: Array.from(instance.selected) });
            }
        };

        const onInput = function (event) {
            const search = event.target.closest('[jq-media-picker-search]');
            if (!search || !root.contains(search)) return;
            instance.keyword = search.value || '';
            render(instance);
            dispatch(instance, 'search', { keyword: instance.keyword });
        };

        const handle = {
            id: id,
            open() {
                instance.openState = true;
                dispatch(instance, 'open');
                return instance.state();
            },
            close() {
                instance.openState = false;
                dispatch(instance, 'close');
                return instance.state();
            },
            setItems(items) {
                instance.items = normalizeItems(items);
                render(instance);
                return instance.state();
            },
            select(idValue) {
                const key = String(idValue);
                if (!instance.options.multiple) instance.selected.clear();
                instance.selected.add(key);
                render(instance);
                dispatch(instance, 'select', { selected: Array.from(instance.selected) });
                return instance.state();
            },
            deselect(idValue) {
                instance.selected.delete(String(idValue));
                render(instance);
                dispatch(instance, 'select', { selected: Array.from(instance.selected) });
                return instance.state();
            },
            clear() {
                instance.selected.clear();
                render(instance);
                dispatch(instance, 'select', { selected: [] });
                return instance.state();
            },
            value() {
                return selectedItems(instance)[0] || null;
            },
            values() {
                return selectedItems(instance);
            },
            setView(view) {
                instance.view = view === 'list' ? 'list' : 'grid';
                render(instance);
                return instance.state();
            },
            setFilter(filter) {
                instance.filter = filter || 'all';
                render(instance);
                return instance.state();
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('input', onInput);
                root.removeAttribute('data-media-picker-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-media-picker-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const mediaPickerApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-media-picker-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.mediaPickerApi = mediaPickerApi;
    JquanUIComponents.mediaPicker = {
        name: 'jquanui-media-picker',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-media-picker]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() {
                        handle?.destroy?.();
                    };
                }
            });
        }
    };
})(window);
