(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaultClasses = {
        root: 'jq-table-wrap grid gap-3',
        toolbar: 'jq-table-toolbar flex flex-wrap items-center justify-between gap-3',
        toolbarMain: 'jq-table-toolbar-main flex flex-wrap items-center gap-2',
        toolbarSide: 'jq-table-toolbar-side flex flex-wrap items-center gap-2',
        meta: uiPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words',
        button: `${uiPreset.classes.action || 'inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors duration-200'} ${uiPreset.classes.tableFocus || ''}`.trim(),
        select: uiPreset.classes.control || 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700',
        scroll: `jq-table-scroll overflow-auto ${uiPreset.classes.panel || 'border border-slate-200 bg-white text-slate-900 shadow-sm rounded-2xl'}`,
        table: `jq-table min-w-full text-sm ${uiPreset.classes.tableText || 'text-slate-700'} border-collapse`,
        headRow: uiPreset.classes.tableHead || 'bg-slate-50',
        headCell: `${uiPreset.classes.tableCell || 'px-4 py-3 border-b border-slate-100 align-middle'} text-left font-semibold ${uiPreset.classes.tableTitle || 'text-slate-900'} whitespace-nowrap`,
        bodyCell: `${uiPreset.classes.tableCell || 'px-4 py-3 border-b border-slate-100 align-middle'} text-left`,
        row: 'jq-table-row',
        rowClickable: 'cursor-pointer',
        rowHover: uiPreset.classes.tableRowHover || 'hover:bg-slate-50',
        rowStriped: uiPreset.classes.tableRowStriped || 'even:bg-slate-50/60',
        empty: `jq-table-empty px-4 py-8 text-center ${uiPreset.classes.tableMuted || 'text-slate-500'}`,
        loading: `jq-table-loading px-4 py-8 text-center ${uiPreset.classes.tableMuted || 'text-slate-500'}`,
        sort: 'jq-table-sort inline-flex items-center gap-2 cursor-pointer select-none',
        sortMarker: `jq-table-sort-marker text-xs ${uiPreset.classes.tableMuted || 'text-slate-400'}`,
        filter: `jq-table-filter mt-2 block w-full min-w-0 ${uiPreset.classes.controlSm || 'h-8 px-2 rounded-md border border-slate-200 bg-white text-slate-700'}`,
        actions: 'jq-table-actions flex flex-wrap gap-2',
        summary: `jq-table-summary grid gap-1 px-4 py-3 ${uiPreset.classes.panel || 'border border-slate-200 bg-white text-slate-900 shadow-sm rounded-2xl'} ${uiPreset.classes.surfaceMuted || 'bg-slate-50'}`,
        selectionCell: 'w-12',
        checkbox: 'jq-table-checkbox',
        pagination: 'jq-table-pagination'
    };

    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const defaults = {
        columns: [],
        data: [],
        rowKey: 'id',
        striped: true,
        hover: true,
        bordered: true,
        selectable: false,
        sortable: true,
        filterable: true,
        resizable: false,
        loading: false,
        emptyText: 'No data',
        loadingText: 'Loading...',
        pagination: null,
        remote: null,
        toolbar: {
            refresh: false,
            columnToggle: false,
            selectionInfo: true
        },
        classes: {},
        summary: null,
        onChange: null,
        onRowClick: null,
        onAction: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-table-${runtime.seed}`;
    }

    function mergeClasses() {
        return Array.from(arguments)
            .flatMap(value => String(value || '').split(/\s+/).filter(Boolean))
            .join(' ');
    }

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, token => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[token]));
    }

    function normalizeColumn(column) {
        const normalized = Object.assign({
            key: '',
            title: '',
            width: null,
            sortable: true,
            filterable: false,
            hidden: false,
            permission: null,
            emptyText: '',
            align: 'left',
            actions: null,
            classes: {}
        }, column || {});
        if (!normalized.title) normalized.title = normalized.key;
        normalized.classes = isPlainObject(normalized.classes) ? normalized.classes : {};
        return normalized;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.columns = Array.isArray(merged.columns) ? merged.columns.map(normalizeColumn) : [];
        merged.data = Array.isArray(merged.data) ? merged.data : [];
        merged.toolbar = Object.assign({}, defaults.toolbar, input?.toolbar || {});
        merged.classes = Object.assign({}, defaultClasses, input?.classes || {});
        return merged;
    }

    function readValue(row, key) {
        return String(key || '').split('.').reduce((cursor, segment) => cursor == null ? undefined : cursor[segment], row);
    }

    function getRowId(row, rowKey) {
        const value = typeof rowKey === 'function' ? rowKey(row) : readValue(row, rowKey);
        return value == null ? '' : String(value);
    }

    function sortRows(rows, sortState) {
        if (!sortState.key || !sortState.order) return rows.slice();
        const direction = sortState.order === 'desc' ? -1 : 1;
        return rows.slice().sort((a, b) => {
            const av = readValue(a, sortState.key);
            const bv = readValue(b, sortState.key);
            if (av == null && bv == null) return 0;
            if (av == null) return -1 * direction;
            if (bv == null) return 1 * direction;
            if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
            return String(av).localeCompare(String(bv), undefined, { numeric: true }) * direction;
        });
    }

    function filterRows(rows, columns, filters) {
        const activeKeys = Object.keys(filters).filter(key => String(filters[key] || '').trim() !== '');
        if (!activeKeys.length) return rows.slice();
        return rows.filter(row => activeKeys.every(key => {
            const column = columns.find(item => item.key === key);
            const rawValue = readValue(row, key);
            const query = String(filters[key]).trim().toLowerCase();
            if (typeof column?.filter === 'function') return column.filter(query, row, rawValue);
            return String(rawValue == null ? '' : rawValue).toLowerCase().includes(query);
        }));
    }

    function paginateRows(rows, pagination) {
        if (!pagination) return { rows: rows.slice(), total: rows.length };
        const page = Math.max(1, Number(pagination.page) || 1);
        const pageSize = Math.max(1, Number(pagination.pageSize) || 10);
        const start = (page - 1) * pageSize;
        return {
            rows: rows.slice(start, start + pageSize),
            total: rows.length
        };
    }

    function getVisibleColumns(record) {
        const permissionApi = JquanUIComponents.permissionApi;
        return record.options.columns.filter(column => {
            if (record.state.hiddenColumns.has(column.key)) return false;
            if (column.permission && permissionApi && typeof permissionApi.has === 'function') {
                return permissionApi.has(column.permission, column.permissionMode || 'some');
            }
            return true;
        });
    }

    function getCurrentRows(record) {
        const visibleColumns = getVisibleColumns(record);
        const filtered = filterRows(record.options.data, visibleColumns, record.state.filters);
        const sorted = sortRows(filtered, record.state.sort);
        if (record.options.remote?.enabled) {
            return {
                rows: sorted,
                total: Number(record.state.remoteTotal) || sorted.length
            };
        }
        return paginateRows(sorted, record.state.pagination);
    }

    function alignClass(align) {
        return alignClasses[align] || alignClasses.left;
    }

    function renderToolbar(record, total, selectedCount) {
        const { options } = record;
        const selectionInfo = options.toolbar.selectionInfo && options.selectable
            ? `<div class="${options.classes.meta}">${selectedCount} selected</div>`
            : '';
        const refresh = options.toolbar.refresh
            ? `<button type="button" class="${options.classes.button}" data-action="refresh"${options.loading ? ' disabled' : ''}>Refresh</button>`
            : '';
        const columnToggle = options.toolbar.columnToggle
            ? `<select class="${options.classes.select}" data-role="column-toggle">${options.columns.map(column => `<option value="${column.key}" ${record.state.hiddenColumns.has(column.key) ? '' : 'selected'}>${escapeHtml(column.title)}</option>`).join('')}</select>`
            : '';
        const totalInfo = `<div class="${options.classes.meta}">${total} row(s)</div>`;
        return `<div class="${options.classes.toolbar}">
  <div class="${options.classes.toolbarMain}">${selectionInfo}${totalInfo}</div>
  <div class="${options.classes.toolbarSide}">${columnToggle}${refresh}</div>
</div>`;
    }

    function renderHeaderCell(record, column) {
        const sortable = record.options.sortable && column.sortable !== false && column.key;
        const currentSort = record.state.sort.key === column.key ? record.state.sort.order : '';
        const sortMarker = currentSort === 'asc' ? '^' : currentSort === 'desc' ? 'v' : '';
        const sortHtml = sortable
            ? `<span class="${record.options.classes.sort}" data-sort-key="${column.key}">${escapeHtml(column.title)}<small class="${record.options.classes.sortMarker}">${sortMarker}</small></span>`
            : escapeHtml(column.title);
        const filterHtml = record.options.filterable && column.filterable
            ? `<input class="${mergeClasses(record.options.classes.filter, column.classes.filter)}" type="text" data-filter-key="${column.key}" value="${escapeHtml(record.state.filters[column.key] || '')}" placeholder="Filter">`
            : '';
        return `<th class="${mergeClasses(record.options.classes.headCell, alignClass(column.align), column.classes.headCell)}"${column.width ? ` width="${Number(column.width) || column.width}"` : ''}>${sortHtml}${filterHtml}</th>`;
    }

    function renderCell(record, row, column) {
        if (column.key === '__select__') {
            const rowId = getRowId(row, record.options.rowKey);
            return `<td class="${mergeClasses(record.options.classes.bodyCell, record.options.classes.selectionCell)}"><input class="${record.options.classes.checkbox}" type="checkbox" data-role="row-select" data-id="${rowId}" ${record.state.selection.has(rowId) ? 'checked' : ''}></td>`;
        }
        if (column.key === '__actions__') {
            const permissionApi = JquanUIComponents.permissionApi;
            const buttons = (Array.isArray(column.actions) ? column.actions : []).filter(action => {
                if (!action.permission || !permissionApi || typeof permissionApi.has !== 'function') return true;
                return permissionApi.has(action.permission, action.permissionMode || 'some');
            }).map(action => {
                const label = action.label || action.key || 'Action';
                return `<button type="button" class="${mergeClasses(record.options.classes.button, action.className)}" data-role="row-action" data-action-key="${action.key}" data-row-id="${escapeHtml(getRowId(row, record.options.rowKey))}">${escapeHtml(label)}</button>`;
            }).join('');
            return `<td class="${record.options.classes.bodyCell}"><div class="${record.options.classes.actions}">${buttons}</div></td>`;
        }
        const rawValue = readValue(row, column.key);
        const rendered = typeof column.render === 'function'
            ? column.render(rawValue, row, record.state)
            : rawValue;
        const content = rendered == null || rendered === '' ? (column.emptyText || '') : rendered;
        return `<td class="${mergeClasses(record.options.classes.bodyCell, alignClass(column.align), column.classes.bodyCell)}">${content == null ? '' : content}</td>`;
    }

    function renderSummary(record, rows, total) {
        if (typeof record.options.summary !== 'function') return '';
        const result = record.options.summary({
            rows,
            total,
            selection: Array.from(record.state.selection),
            sort: Object.assign({}, record.state.sort),
            filters: Object.assign({}, record.state.filters)
        });
        if (!result) return '';
        return `<div class="${record.options.classes.summary}">${typeof result === 'string' ? result : String(result)}</div>`;
    }

    function render(record) {
        const { element, options } = record;
        const columns = getVisibleColumns(record);
        const finalColumns = options.selectable
            ? [{ key: '__select__', title: '', width: 48, sortable: false, filterable: false, align: 'left', classes: {} }, ...columns]
            : columns.slice();
        if (Array.isArray(options.rowActions) && options.rowActions.length) {
            finalColumns.push({ key: '__actions__', title: 'Actions', sortable: false, filterable: false, actions: options.rowActions, align: 'left', classes: {} });
        }

        const current = getCurrentRows(record);
        const pageRows = current.rows;
        const selectableIds = pageRows.map(row => getRowId(row, options.rowKey)).filter(Boolean);
        const allSelected = selectableIds.length > 0 && selectableIds.every(id => record.state.selection.has(id));

        const colgroup = finalColumns.some(column => column.width)
            ? `<colgroup>${finalColumns.map(column => `<col${column.width ? ` width="${Number(column.width) || column.width}"` : ''}>`).join('')}</colgroup>`
            : '';

        const headerHtml = finalColumns.map(column => {
            if (column.key === '__select__') {
                return `<th class="${mergeClasses(options.classes.headCell, options.classes.selectionCell)}" width="48"><input class="${options.classes.checkbox}" type="checkbox" data-role="select-all" ${allSelected ? 'checked' : ''}></th>`;
            }
            return renderHeaderCell(record, column);
        }).join('');

        let bodyHtml = '';
        if (options.loading) {
            bodyHtml = `<tr><td colspan="${finalColumns.length}" class="${options.classes.loading}">${escapeHtml(options.loadingText)}</td></tr>`;
        } else if (!pageRows.length) {
            bodyHtml = `<tr><td colspan="${finalColumns.length}" class="${options.classes.empty}">${escapeHtml(options.emptyText)}</td></tr>`;
        } else {
            bodyHtml = pageRows.map(row => {
                const rowId = getRowId(row, options.rowKey);
                const cells = finalColumns.map(column => renderCell(record, row, column)).join('');
                const rowClass = mergeClasses(
                    options.classes.row,
                    typeof options.onRowClick === 'function' && options.classes.rowClickable,
                    options.hover && options.classes.rowHover,
                    options.striped && options.classes.rowStriped
                );
                return `<tr class="${rowClass}" data-row-key="${escapeHtml(rowId)}" data-clickable="${typeof options.onRowClick === 'function' ? 'true' : 'false'}">${cells}</tr>`;
            }).join('');
        }

        const summaryHtml = renderSummary(record, pageRows, current.total);
        element.innerHTML = `<div class="${options.classes.root}">
${renderToolbar(record, current.total, record.state.selection.size)}
  <div class="${options.classes.scroll}">
    <table class="${options.classes.table}">
      ${colgroup}
      <thead><tr class="${options.classes.headRow}">${headerHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  </div>
  ${summaryHtml}
  <div class="${options.classes.pagination}" data-role="pagination"></div>
</div>`;

        bind(record, current.total);
        return record;
    }

    function buildRemotePayload(record, reason) {
        return {
            page: record.state.pagination?.page || 1,
            pageSize: record.state.pagination?.pageSize || 10,
            sort: Object.assign({}, record.state.sort),
            filters: Object.assign({}, record.state.filters),
            reason
        };
    }

    async function loadRemote(record, reason = 'remote') {
        if (!record.options.remote?.enabled || typeof record.options.remote.load !== 'function') return null;
        record.options.loading = true;
        render(record);
        const payload = buildRemotePayload(record, reason);
        const result = await Promise.resolve(record.options.remote.load(payload, createHandle(record.id)));
        if (Array.isArray(result)) {
            record.options.data = result;
            record.state.remoteTotal = result.length;
        } else if (result && Array.isArray(result.data)) {
            record.options.data = result.data;
            record.state.remoteTotal = Number(result.total) || result.data.length;
        } else {
            record.options.data = [];
            record.state.remoteTotal = 0;
        }
        record.options.loading = false;
        render(record);
        return result;
    }

    function emitChange(record, reason) {
        const payload = {
            sort: Object.assign({}, record.state.sort),
            filters: Object.assign({}, record.state.filters),
            pagination: record.state.pagination
                ? Object.assign({}, record.state.pagination, {
                    total: record.options.remote?.enabled ? record.state.remoteTotal : record.options.data.length
                })
                : null,
            selection: Array.from(record.state.selection),
            visibleColumns: record.options.columns.filter(column => !record.state.hiddenColumns.has(column.key)).map(column => column.key),
            reason
        };
        if (typeof record.options.onChange === 'function') record.options.onChange(payload);
        return payload;
    }

    function bind(record, total) {
        const { element, options, state } = record;
        element.onclick = event => {
            const refreshButton = event.target.closest('[data-action="refresh"]');
            if (refreshButton) {
                loadRemote(record, 'refresh').catch(() => {
                    record.options.loading = false;
                    render(record);
                });
                return;
            }

            const sortNode = event.target.closest('[data-sort-key]');
            if (sortNode) {
                const key = sortNode.getAttribute('data-sort-key');
                const current = state.sort.key === key ? state.sort.order : '';
                const next = current === 'asc' ? 'desc' : current === 'desc' ? '' : 'asc';
                state.sort = { key: next ? key : '', order: next };
                if (state.pagination) state.pagination.page = 1;
                if (options.remote?.enabled) {
                    loadRemote(record, 'sort').catch(() => {
                        record.options.loading = false;
                        render(record);
                    });
                } else {
                    render(record);
                }
                emitChange(record, 'sort');
                return;
            }

            const rowAction = event.target.closest('[data-role="row-action"]');
            if (rowAction) {
                const rowId = rowAction.getAttribute('data-row-id');
                const row = options.data.find(item => getRowId(item, options.rowKey) === rowId);
                const payload = {
                    key: rowAction.getAttribute('data-action-key'),
                    row,
                    rowId
                };
                if (typeof options.onAction === 'function') options.onAction(payload);
                return;
            }

            const rowNode = event.target.closest('tbody tr[data-row-key]');
            if (rowNode && typeof options.onRowClick === 'function' && !event.target.closest('input,button,select,a')) {
                const rowId = rowNode.getAttribute('data-row-key');
                const row = options.data.find(item => getRowId(item, options.rowKey) === rowId);
                options.onRowClick(row, rowId, createHandle(record.id));
            }
        };

        element.querySelectorAll('input[data-filter-key]').forEach(input => {
            input.onkeydown = event => {
                if (event.key !== 'Enter') return;
                const key = input.getAttribute('data-filter-key');
                state.filters[key] = input.value;
                if (state.pagination) state.pagination.page = 1;
                if (options.remote?.enabled) {
                    loadRemote(record, 'filter').catch(() => {
                        record.options.loading = false;
                        render(record);
                    });
                } else {
                    render(record);
                }
                emitChange(record, 'filter');
            };
        });

        const columnToggle = element.querySelector('select[data-role="column-toggle"]');
        if (columnToggle) {
            columnToggle.onchange = () => {
                const key = columnToggle.value;
                if (state.hiddenColumns.has(key)) state.hiddenColumns.delete(key);
                else state.hiddenColumns.add(key);
                render(record);
                emitChange(record, 'columns');
            };
        }

        const selectAll = element.querySelector('[data-role="select-all"]');
        if (selectAll) {
            selectAll.onchange = () => {
                const rows = getCurrentRows(record).rows;
                if (selectAll.checked) rows.forEach(row => state.selection.add(getRowId(row, options.rowKey)));
                else rows.forEach(row => state.selection.delete(getRowId(row, options.rowKey)));
                render(record);
                emitChange(record, 'selection');
            };
        }

        element.querySelectorAll('[data-role="row-select"]').forEach(input => {
            input.onchange = () => {
                const key = input.getAttribute('data-id');
                if (input.checked) state.selection.add(key);
                else state.selection.delete(key);
                emitChange(record, 'selection');
            };
        });

        if (state.pagination) {
            const paginationNode = element.querySelector('[data-role="pagination"]');
            if (paginationNode && JquanUIComponents.paginationApi) {
                const existing = JquanUIComponents.paginationApi.get(paginationNode);
                if (existing) existing.destroy();
                JquanUIComponents.paginationApi.mount(paginationNode, {
                    total,
                    page: state.pagination.page,
                    pageSize: state.pagination.pageSize,
                    onChange: payload => {
                        state.pagination.page = payload.page;
                        state.pagination.pageSize = payload.pageSize;
                        if (options.remote?.enabled) {
                            loadRemote(record, 'pagination').catch(() => {
                                record.options.loading = false;
                                render(record);
                            });
                        } else {
                            render(record);
                        }
                        emitChange(record, 'pagination');
                    }
                });
            }
        }
    }

    async function mount(target, inputOptions = {}) {
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI table] Container not found.');
        const id = element.id || nextId();
        element.id = id;
        const options = normalizeOptions(inputOptions);
        const record = {
            id,
            element,
            options,
            state: {
                sort: { key: '', order: '' },
                filters: {},
                pagination: options.pagination ? Object.assign({ page: 1, pageSize: 10 }, options.pagination) : null,
                selection: new Set(),
                hiddenColumns: new Set(options.columns.filter(column => column.hidden).map(column => column.key)),
                remoteTotal: Array.isArray(options.data) ? options.data.length : 0
            }
        };
        runtime.instances.set(id, record);
        if (options.remote?.enabled) {
            await loadRemote(record, 'init');
        } else {
            render(record);
        }
        return createHandle(id);
    }

    function update(target, patch = {}, reason = 'update') {
        const id = typeof target === 'string' ? target : target.id;
        const record = runtime.instances.get(id);
        if (!record) return null;
        record.options = normalizeOptions(Object.assign({}, record.options, patch));
        if (patch.columns) {
            record.state.hiddenColumns = new Set(record.options.columns.filter(column => column.hidden).map(column => column.key));
        }
        if (patch.pagination === null) record.state.pagination = null;
        else if (patch.pagination) record.state.pagination = Object.assign(record.state.pagination || { page: 1, pageSize: 10 }, patch.pagination);
        render(record);
        emitChange(record, reason);
        return createHandle(id);
    }

    function createHandle(id) {
        const record = runtime.instances.get(id);
        if (!record) return null;
        return {
            id,
            state() {
                return {
                    sort: Object.assign({}, record.state.sort),
                    filters: Object.assign({}, record.state.filters),
                    pagination: record.state.pagination ? Object.assign({}, record.state.pagination) : null,
                    selection: Array.from(record.state.selection),
                    hiddenColumns: Array.from(record.state.hiddenColumns)
                };
            },
            reload(reason = 'reload') {
                if (record.options.remote?.enabled) {
                    return loadRemote(record, reason).then(() => this);
                }
                render(record);
                return Promise.resolve(this);
            },
            update(patch = {}, reason = 'update') {
                return update(id, patch, reason);
            },
            setLoading(loading = true) {
                record.options.loading = !!loading;
                render(record);
                return this;
            },
            setFilter(key, value) {
                record.state.filters[key] = value;
                render(record);
                return this;
            },
            clearSelection() {
                record.state.selection.clear();
                render(record);
                return this;
            },
            selectedRows() {
                const keys = record.state.selection;
                return record.options.data.filter(row => keys.has(getRowId(row, record.options.rowKey)));
            },
            destroy() {
                const paginationNode = record.element.querySelector('[data-role="pagination"]');
                if (paginationNode && JquanUIComponents.paginationApi) {
                    const existing = JquanUIComponents.paginationApi.get(paginationNode);
                    if (existing) existing.destroy();
                }
                runtime.instances.delete(id);
                if (record.element) {
                    record.element.onclick = null;
                    record.element.innerHTML = '';
                }
                return true;
            }
        };
    }

    const tableApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(target) {
            const element = resolveElement(target);
            if (element?.id) return createHandle(element.id);
            return runtime.instances.get(target) ? createHandle(target) : null;
        },
        update(target, patch = {}, reason = 'update') {
            return update(typeof target === 'string' ? target : target.id, patch, reason);
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        }
    };

    JquanUIComponents.tableApi = tableApi;

    JquanUIComponents.table = {
        name: 'jquanui-table',
        version: '2.2.0',
        requires: [],
        install() {}
    };
})(window);
