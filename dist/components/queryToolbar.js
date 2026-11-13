(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        keyword: '',
        filters: {},
        sort: '',
        searchPlaceholder: 'Search',
        filterFields: [],
        sortOptions: [],
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            row: 'grid gap-3 xl:grid-cols-[minmax(240px,1.2fr)_repeat(3,minmax(0,0.8fr))_auto]',
            search: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            control: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            primary: 'inline-flex h-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 text-sm text-white',
            help: 'text-xs text-slate-500'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-query-toolbar-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeField(field, index) {
        return Object.assign({
            key: 'filter-' + index,
            label: 'Filter ' + (index + 1),
            type: 'select',
            options: []
        }, clone(field || {}));
    }

    function normalizeOption(option) {
        if (typeof option === 'object') return { label: option.label || option.value, value: option.value };
        return { label: String(option), value: String(option) };
    }

    function createSelect(options, value, className) {
        const node = document.createElement('select');
        node.className = className;
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = 'All';
        empty.selected = value == null || value === '';
        node.appendChild(empty);
        options.forEach(function (option) {
            const item = normalizeOption(option);
            const opt = document.createElement('option');
            opt.value = item.value;
            opt.textContent = item.label;
            opt.selected = String(item.value) === String(value);
            node.appendChild(opt);
        });
        return node;
    }

    function createInput(field, value, className) {
        if (field.type === 'select') return createSelect(field.options || [], value, className);
        const input = document.createElement('input');
        input.className = className;
        input.type = field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text';
        input.value = value == null ? '' : String(value);
        if (field.placeholder) input.placeholder = field.placeholder;
        return input;
    }

    function normalizedQuery(instance) {
        const filters = {};
        Object.keys(instance.filters).forEach(function (key) {
            if (instance.filters[key] !== '' && instance.filters[key] != null) filters[key] = instance.filters[key];
        });
        return {
            keyword: instance.keyword,
            filters: filters,
            sort: instance.sort
        };
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:query-toolbar:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';

        const surface = document.createElement('section');
        surface.className = classes.surface;

        const row = document.createElement('div');
        row.className = classes.row;

        const search = document.createElement('input');
        search.type = 'search';
        search.className = classes.search;
        search.value = instance.keyword;
        search.placeholder = instance.options.searchPlaceholder;
        search.setAttribute('jq-query-toolbar-search', '');
        row.appendChild(search);

        instance.fields.forEach(function (field) {
            const control = createInput(field, instance.filters[field.key], classes.control);
            control.setAttribute('jq-query-toolbar-filter', '');
            control.setAttribute('data-key', field.key);
            row.appendChild(control);
        });

        const sort = createSelect(instance.sortOptions, instance.sort, classes.control);
        sort.setAttribute('jq-query-toolbar-sort', '');
        row.appendChild(sort);

        surface.appendChild(row);

        const actions = document.createElement('div');
        actions.className = classes.actions;

        const applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.className = classes.primary;
        applyButton.setAttribute('jq-query-toolbar-apply', '');
        applyButton.textContent = 'Apply';
        actions.appendChild(applyButton);

        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.className = classes.action;
        resetButton.setAttribute('jq-query-toolbar-reset', '');
        resetButton.textContent = 'Reset';
        actions.appendChild(resetButton);

        surface.appendChild(actions);

        const help = document.createElement('div');
        help.className = classes.help;
        help.textContent = 'State is normalized as { keyword, filters, sort } and can be piped to table, list or CMS query adapters.';
        surface.appendChild(help);

        root.appendChild(surface);
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-query-toolbar-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const fields = Array.isArray(merged.filterFields) ? merged.filterFields.map(normalizeField) : [];
        const filters = {};
        fields.forEach(function (field) {
            filters[field.key] = merged.filters?.[field.key] ?? '';
        });

        const instance = {
            id: id,
            root: root,
            options: merged,
            fields: fields,
            filters: filters,
            sortOptions: Array.isArray(merged.sortOptions) ? merged.sortOptions.slice() : [],
            keyword: merged.keyword || '',
            sort: merged.sort || '',
            state() {
                return {
                    id: id,
                    keyword: instance.keyword,
                    filters: clone(instance.filters),
                    sort: instance.sort,
                    query: normalizedQuery(instance)
                };
            }
        };

        const onClick = function (event) {
            const applyButton = event.target.closest('[jq-query-toolbar-apply]');
            if (applyButton && root.contains(applyButton)) {
                dispatch(instance, 'apply', { action: 'apply' });
                return;
            }
            const resetButton = event.target.closest('[jq-query-toolbar-reset]');
            if (resetButton && root.contains(resetButton)) {
                handle.reset();
            }
        };

        const onInput = function (event) {
            const targetNode = event.target;
            if (targetNode.hasAttribute('jq-query-toolbar-search')) {
                instance.keyword = targetNode.value || '';
                dispatch(instance, 'change', { action: 'keyword' });
                return;
            }
            if (targetNode.hasAttribute('jq-query-toolbar-filter')) {
                instance.filters[targetNode.getAttribute('data-key')] = targetNode.value || '';
                dispatch(instance, 'change', { action: 'filter', key: targetNode.getAttribute('data-key') });
                return;
            }
            if (targetNode.hasAttribute('jq-query-toolbar-sort')) {
                instance.sort = targetNode.value || '';
                dispatch(instance, 'change', { action: 'sort' });
            }
        };

        const handle = {
            id: id,
            setKeyword(keyword) {
                instance.keyword = keyword == null ? '' : String(keyword);
                render(instance);
                dispatch(instance, 'change', { action: 'setKeyword' });
                return instance.state();
            },
            setFilter(key, value) {
                instance.filters[String(key)] = value == null ? '' : value;
                render(instance);
                dispatch(instance, 'change', { action: 'setFilter', key: String(key) });
                return instance.state();
            },
            setFilters(nextFilters) {
                Object.keys(instance.filters).forEach(function (key) {
                    instance.filters[key] = nextFilters?.[key] ?? '';
                });
                render(instance);
                dispatch(instance, 'change', { action: 'setFilters' });
                return instance.state();
            },
            setSort(sort) {
                instance.sort = sort == null ? '' : String(sort);
                render(instance);
                dispatch(instance, 'change', { action: 'setSort' });
                return instance.state();
            },
            apply() {
                dispatch(instance, 'apply', { action: 'apply' });
                return instance.state();
            },
            reset() {
                instance.keyword = '';
                Object.keys(instance.filters).forEach(function (key) {
                    instance.filters[key] = '';
                });
                instance.sort = '';
                render(instance);
                dispatch(instance, 'reset', { action: 'reset' });
                return instance.state();
            },
            query() {
                return normalizedQuery(instance);
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('input', onInput);
                root.removeAttribute('data-query-toolbar-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-query-toolbar-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const queryToolbarApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-query-toolbar-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.queryToolbarApi = queryToolbarApi;
    JquanUIComponents.queryToolbar = {
        name: 'jquanui-query-toolbar',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-query-toolbar]',
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
