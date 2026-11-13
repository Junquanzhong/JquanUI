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
        selected: [],
        labelKey: 'title',
        valueKey: 'id',
        searchKeys: ['title', 'id'],
        emptyText: 'No related records',
        placeholder: 'Search relation',
        classes: {
            root: 'grid gap-4',
            toolbar: 'flex flex-wrap items-center gap-3',
            search: uiPreset.classes.control || 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700',
            body: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]',
            surface: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            list: 'grid gap-3',
            item: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-colors duration-150',
            itemActive: 'border-blue-300 bg-blue-50',
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
        return 'jq-relation-picker-' + runtime.seed;
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
                id: 'record-' + index,
                title: 'Untitled',
                description: '',
                type: 'record'
            }, clone(item));
        }) : [];
    }

    function getValue(instance, item) {
        return String(item?.[instance.options.valueKey] ?? '');
    }

    function getLabel(instance, item) {
        return String(item?.[instance.options.labelKey] ?? getValue(instance, item));
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:relation-picker:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function visibleItems(instance) {
        const keyword = instance.keyword.trim().toLowerCase();
        if (!keyword) return instance.items.slice();
        return instance.items.filter(function (item) {
            return instance.options.searchKeys.some(function (key) {
                return String(item?.[key] ?? '').toLowerCase().includes(keyword);
            });
        });
    }

    function selectedItems(instance) {
        return instance.items.filter(function (item) {
            return instance.selected.has(getValue(instance, item));
        });
    }

    function renderItem(instance, item) {
        const classes = instance.options.classes;
        const active = instance.selected.has(getValue(instance, item));
        const card = document.createElement('button');
        card.type = 'button';
        card.className = [classes.item, active && classes.itemActive].filter(Boolean).join(' ');
        card.setAttribute('jq-relation-picker-item', '');
        card.setAttribute('data-id', getValue(instance, item));

        const title = document.createElement('div');
        title.className = classes.title;
        title.textContent = getLabel(instance, item);

        const desc = document.createElement('div');
        desc.className = classes.desc;
        desc.textContent = [item.type, item.description].filter(Boolean).join(' · ');

        const badge = document.createElement('div');
        badge.className = classes.badge;
        badge.textContent = getValue(instance, item);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(badge);
        return card;
    }

    function render(instance) {
        const root = instance.root;
        const classes = instance.options.classes;
        root.className = classes.root;
        root.innerHTML = '';

        const toolbar = document.createElement('div');
        toolbar.className = classes.toolbar;
        const search = document.createElement('input');
        search.type = 'search';
        search.className = classes.search;
        search.value = instance.keyword;
        search.placeholder = instance.options.placeholder;
        search.setAttribute('jq-relation-picker-search', '');
        const mode = document.createElement('div');
        mode.className = classes.badge;
        mode.textContent = instance.options.multiple ? 'multiple' : 'single';
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
            wrap.className = classes.list;
            list.forEach(function (item) {
                wrap.appendChild(renderItem(instance, item));
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
            empty.textContent = 'No selected relations';
            selectedListNode.appendChild(empty);
        } else {
            selected.forEach(function (item) {
                const row = document.createElement('div');
                row.className = classes.selectedItem;
                row.textContent = getLabel(instance, item) + ' · ' + getValue(instance, item);
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
        const existingId = root.getAttribute('data-relation-picker-id');
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
            keyword: '',
            openState: false,
            state() {
                return {
                    id: id,
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
            const item = event.target.closest('[jq-relation-picker-item]');
            if (!item || !root.contains(item)) return;
            const key = String(item.getAttribute('data-id'));
            if (instance.options.multiple) {
                if (instance.selected.has(key)) instance.selected.delete(key);
                else instance.selected.add(key);
            } else {
                instance.selected.clear();
                instance.selected.add(key);
            }
            render(instance);
            dispatch(instance, 'select', { selected: Array.from(instance.selected) });
        };

        const onInput = function (event) {
            const search = event.target.closest('[jq-relation-picker-search]');
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
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('input', onInput);
                root.removeAttribute('data-relation-picker-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-relation-picker-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const relationPickerApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-relation-picker-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.relationPickerApi = relationPickerApi;
    JquanUIComponents.relationPicker = {
        name: 'jquanui-relation-picker',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-relation-picker]',
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
