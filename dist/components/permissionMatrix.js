(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        columns: [],
        rows: [],
        values: {},
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            toolbar: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            tableWrap: 'overflow-x-auto rounded-2xl border border-slate-200',
            table: 'min-w-full border-collapse bg-white text-sm',
            th: 'border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700',
            td: 'border-b border-slate-200 px-3 py-2 text-slate-700',
            rowLabel: 'font-medium text-slate-800',
            checkbox: 'h-4 w-4 rounded border-slate-300',
            help: 'text-xs text-slate-500'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-permission-matrix-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeColumns(columns) {
        return Array.isArray(columns) ? columns.map(function (column, index) {
            return Object.assign({
                key: 'perm-' + index,
                label: 'Permission ' + (index + 1)
            }, clone(column || {}));
        }) : [];
    }

    function normalizeRows(rows) {
        return Array.isArray(rows) ? rows.map(function (row, index) {
            return Object.assign({
                key: 'module-' + index,
                label: 'Module ' + (index + 1)
            }, clone(row || {}));
        }) : [];
    }

    function ensureValues(rows, columns, incoming) {
        const values = {};
        rows.forEach(function (row) {
            values[row.key] = {};
            columns.forEach(function (column) {
                values[row.key][column.key] = !!incoming?.[row.key]?.[column.key];
            });
        });
        return values;
    }

    function snapshot(instance) {
        const values = {};
        Object.keys(instance.values).forEach(function (rowKey) {
            values[rowKey] = Object.assign({}, instance.values[rowKey]);
        });
        return {
            id: instance.id,
            columns: clone(instance.columns),
            rows: clone(instance.rows),
            values: values,
            payload: values
        };
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:permission-matrix:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function rowAllChecked(instance, rowKey) {
        return instance.columns.every(function (column) {
            return !!instance.values?.[rowKey]?.[column.key];
        });
    }

    function columnAllChecked(instance, columnKey) {
        return instance.rows.every(function (row) {
            return !!instance.values?.[row.key]?.[columnKey];
        });
    }

    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';

        const surface = document.createElement('section');
        surface.className = classes.surface;

        const toolbar = document.createElement('div');
        toolbar.className = classes.toolbar;

        const checkAll = document.createElement('button');
        checkAll.type = 'button';
        checkAll.className = classes.action;
        checkAll.setAttribute('jq-permission-matrix-all', 'true');
        checkAll.textContent = 'Check all';
        toolbar.appendChild(checkAll);

        const clearAll = document.createElement('button');
        clearAll.type = 'button';
        clearAll.className = classes.action;
        clearAll.setAttribute('jq-permission-matrix-all', 'false');
        clearAll.textContent = 'Clear all';
        toolbar.appendChild(clearAll);

        surface.appendChild(toolbar);

        const tableWrap = document.createElement('div');
        tableWrap.className = classes.tableWrap;
        const table = document.createElement('table');
        table.className = classes.table;

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');

        const moduleHead = document.createElement('th');
        moduleHead.className = classes.th;
        moduleHead.textContent = 'Module';
        headRow.appendChild(moduleHead);

        instance.columns.forEach(function (column) {
            const th = document.createElement('th');
            th.className = classes.th;
            const wrap = document.createElement('label');
            wrap.className = 'inline-flex items-center gap-2';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = classes.checkbox;
            checkbox.checked = columnAllChecked(instance, column.key);
            checkbox.setAttribute('jq-permission-matrix-column', '');
            checkbox.setAttribute('data-column-key', column.key);
            const text = document.createElement('span');
            text.textContent = column.label;
            wrap.appendChild(checkbox);
            wrap.appendChild(text);
            th.appendChild(wrap);
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        instance.rows.forEach(function (row) {
            const tr = document.createElement('tr');
            const labelTd = document.createElement('td');
            labelTd.className = classes.td;
            const wrap = document.createElement('label');
            wrap.className = 'inline-flex items-center gap-2 ' + classes.rowLabel;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = classes.checkbox;
            checkbox.checked = rowAllChecked(instance, row.key);
            checkbox.setAttribute('jq-permission-matrix-row', '');
            checkbox.setAttribute('data-row-key', row.key);
            const text = document.createElement('span');
            text.textContent = row.label;
            wrap.appendChild(checkbox);
            wrap.appendChild(text);
            labelTd.appendChild(wrap);
            tr.appendChild(labelTd);

            instance.columns.forEach(function (column) {
                const td = document.createElement('td');
                td.className = classes.td;
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = classes.checkbox;
                checkbox.checked = !!instance.values?.[row.key]?.[column.key];
                checkbox.setAttribute('jq-permission-matrix-cell', '');
                checkbox.setAttribute('data-row-key', row.key);
                checkbox.setAttribute('data-column-key', column.key);
                td.appendChild(checkbox);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        surface.appendChild(tableWrap);

        const help = document.createElement('div');
        help.className = classes.help;
        help.textContent = 'Payload is a row-key to permission-key boolean matrix and can be mapped to role policies directly.';
        surface.appendChild(help);

        root.appendChild(surface);
    }

    function setAll(instance, checked) {
        instance.rows.forEach(function (row) {
            instance.columns.forEach(function (column) {
                instance.values[row.key][column.key] = checked;
            });
        });
    }

    function setRow(instance, rowKey, checked) {
        instance.columns.forEach(function (column) {
            instance.values[rowKey][column.key] = checked;
        });
    }

    function setColumn(instance, columnKey, checked) {
        instance.rows.forEach(function (row) {
            instance.values[row.key][columnKey] = checked;
        });
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-permission-matrix-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});

        const columns = normalizeColumns(merged.columns);
        const rows = normalizeRows(merged.rows);
        const instance = {
            id: id,
            root: root,
            options: merged,
            columns: columns,
            rows: rows,
            values: ensureValues(rows, columns, merged.values),
            state() {
                return snapshot(instance);
            }
        };

        const onClick = function (event) {
            const toggleAll = event.target.closest('[jq-permission-matrix-all]');
            if (toggleAll && root.contains(toggleAll)) {
                setAll(instance, toggleAll.getAttribute('jq-permission-matrix-all') === 'true');
                render(instance);
                dispatch(instance, 'change', { action: 'all' });
            }
        };

        const onInput = function (event) {
            const targetNode = event.target;
            if (targetNode.hasAttribute('jq-permission-matrix-row')) {
                setRow(instance, targetNode.getAttribute('data-row-key'), !!targetNode.checked);
                render(instance);
                dispatch(instance, 'change', { action: 'row', rowKey: targetNode.getAttribute('data-row-key') });
                return;
            }
            if (targetNode.hasAttribute('jq-permission-matrix-column')) {
                setColumn(instance, targetNode.getAttribute('data-column-key'), !!targetNode.checked);
                render(instance);
                dispatch(instance, 'change', { action: 'column', columnKey: targetNode.getAttribute('data-column-key') });
                return;
            }
            if (targetNode.hasAttribute('jq-permission-matrix-cell')) {
                const rowKey = targetNode.getAttribute('data-row-key');
                const columnKey = targetNode.getAttribute('data-column-key');
                instance.values[rowKey][columnKey] = !!targetNode.checked;
                dispatch(instance, 'change', { action: 'cell', rowKey: rowKey, columnKey: columnKey });
            }
        };

        const handle = {
            id: id,
            setValues(values) {
                instance.values = ensureValues(instance.rows, instance.columns, values);
                render(instance);
                dispatch(instance, 'change', { action: 'setValues' });
                return instance.state();
            },
            checkAll() {
                setAll(instance, true);
                render(instance);
                dispatch(instance, 'change', { action: 'checkAll' });
                return instance.state();
            },
            clearAll() {
                setAll(instance, false);
                render(instance);
                dispatch(instance, 'change', { action: 'clearAll' });
                return instance.state();
            },
            payload() {
                return snapshot(instance).payload;
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('input', onInput);
                root.removeAttribute('data-permission-matrix-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-permission-matrix-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const permissionMatrixApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-permission-matrix-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.permissionMatrixApi = permissionMatrixApi;
    JquanUIComponents.permissionMatrix = {
        name: 'jquanui-permission-matrix',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-permission-matrix]',
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
