(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        filename: 'export',
        format: 'csv',
        bom: true,
        pretty: true
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-export-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function kebabToCamel(value) {
        return String(value || '').replace(/-([a-z])/g, function (_, char) {
            return char.toUpperCase();
        });
    }

    function normalizeColumns(columns, rows) {
        if (Array.isArray(columns) && columns.length) {
            return columns.map(function (column) {
                if (typeof column === 'string') {
                    return { key: column, label: column };
                }
                return {
                    key: column.key,
                    label: column.label || column.key
                };
            }).filter(function (column) {
                return !!column.key;
            });
        }
        const sample = Array.isArray(rows) ? rows.find(function (row) { return row && typeof row === 'object' && !Array.isArray(row); }) : null;
        return sample ? Object.keys(sample).map(function (key) {
            return { key: key, label: key };
        }) : [];
    }

    function quoteCsv(value) {
        const text = value == null ? '' : String(value);
        if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
        return text;
    }

    function tableToRows(table) {
        const headers = Array.from(table.querySelectorAll('thead th')).map(function (cell) {
            return cell.textContent.trim();
        });
        const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
        return bodyRows.map(function (row) {
            const cells = Array.from(row.children);
            const record = {};
            cells.forEach(function (cell, index) {
                const key = headers[index] || 'column' + (index + 1);
                record[key] = cell.textContent.trim();
            });
            return record;
        });
    }

    function scriptToData(node) {
        try {
            return JSON.parse(node.textContent || 'null');
        } catch (error) {
            return null;
        }
    }

    function resolveSourceData(root, source) {
        if (Array.isArray(source) || (source && typeof source === 'object')) return source;
        const sourceValue = source || root.getAttribute('data-export-source') || '';
        if (!sourceValue) {
            const script = root.querySelector('script[type="application/json"][jq-export-data]');
            return script ? scriptToData(script) : [];
        }
        const node = resolveTarget(sourceValue);
        if (!node) return [];
        if (node.matches('table')) return tableToRows(node);
        if (node.matches('script[type="application/json"]')) return scriptToData(node);
        return [];
    }

    function toPlainRows(data, columns) {
        if (!Array.isArray(data)) return [];
        const normalizedColumns = normalizeColumns(columns, data);
        if (!normalizedColumns.length) {
            return data.map(function (item) {
                return Array.isArray(item) ? item.slice() : [item];
            });
        }
        return data.map(function (item) {
            return normalizedColumns.map(function (column) {
                return item && typeof item === 'object' ? item[column.key] : '';
            });
        });
    }

    function serializeCsv(data, options) {
        const rows = Array.isArray(data) ? data : [];
        const columns = normalizeColumns(options.columns, rows);
        const header = columns.length ? columns.map(function (column) { return quoteCsv(column.label); }).join(',') : '';
        const lines = toPlainRows(rows, columns).map(function (row) {
            return row.map(quoteCsv).join(',');
        });
        return [header].concat(lines).filter(Boolean).join('\r\n');
    }

    function serializeJson(data, options) {
        return JSON.stringify(data == null ? [] : data, null, options.pretty === false ? 0 : 2);
    }

    function serializeTxt(data, options) {
        const rows = Array.isArray(data) ? data : [];
        const columns = normalizeColumns(options.columns, rows);
        if (!rows.length) return '';
        if (!columns.length) return rows.map(function (item) { return String(item); }).join('\n');
        return rows.map(function (row) {
            return columns.map(function (column) {
                const value = row && typeof row === 'object' ? row[column.key] : '';
                return column.label + ': ' + String(value == null ? '' : value);
            }).join(' | ');
        }).join('\n');
    }

    function serialize(data, options) {
        const format = String(options.format || defaults.format).toLowerCase();
        if (format === 'json') return serializeJson(data, options);
        if (format === 'txt') return serializeTxt(data, options);
        return serializeCsv(data, options);
    }

    function mimeFor(format) {
        if (format === 'json') return 'application/json;charset=utf-8';
        if (format === 'txt') return 'text/plain;charset=utf-8';
        return 'text/csv;charset=utf-8';
    }

    function extensionFor(format) {
        return format === 'json' || format === 'txt' ? format : 'csv';
    }

    function triggerDownload(content, options) {
        const format = String(options.format || defaults.format).toLowerCase();
        const filename = (options.filename || defaults.filename) + '.' + extensionFor(format);
        const prefix = options.bom !== false && format === 'csv' ? '\uFEFF' : '';
        const blob = new Blob([prefix + content], { type: mimeFor(format) });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        global.setTimeout(function () {
            URL.revokeObjectURL(href);
        }, 1200);
        return { filename: filename, format: format, size: blob.size };
    }

    function dispatch(root, eventName, detail) {
        root.dispatchEvent(new CustomEvent('jquan:export:' + eventName, {
            bubbles: true,
            detail: detail || {}
        }));
    }

    function exportData(root, input) {
        const options = Object.assign({}, defaults, input || {});
        const data = resolveSourceData(root, options.data || options.source);
        const payload = {
            format: String(options.format || defaults.format).toLowerCase(),
            filename: options.filename || root.getAttribute('data-export-filename') || defaults.filename,
            columns: options.columns || null,
            rows: Array.isArray(data) ? data.length : 0
        };
        dispatch(root, 'before', payload);
        const content = serialize(data, Object.assign({}, options, payload));
        const result = triggerDownload(content, Object.assign({}, options, payload));
        dispatch(root, 'success', Object.assign({}, payload, result));
        return Object.assign({ content: content }, payload, result);
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-export-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const instance = {
            id: id,
            root: root,
            options: Object.assign({}, defaults, options || {}),
            onClick(event) {
                const trigger = event.target.closest('[jq-export-trigger]');
                if (!trigger || !root.contains(trigger)) return;
                event.preventDefault();
                try {
                    exportData(root, {
                        format: trigger.getAttribute('data-export-format') || instance.options.format,
                        filename: trigger.getAttribute('data-export-filename') || instance.options.filename || root.getAttribute('data-export-filename'),
                        source: trigger.getAttribute('data-export-source') || instance.options.source,
                        columns: instance.options.columns
                    });
                } catch (error) {
                    dispatch(root, 'error', { message: error.message });
                }
            }
        };

        const handle = {
            id: id,
            export(input) {
                return exportData(root, Object.assign({}, instance.options, input || {}));
            },
            refresh(nextOptions) {
                instance.options = Object.assign({}, instance.options, nextOptions || {});
                return instance.options;
            },
            state() {
                return {
                    id: id,
                    filename: instance.options.filename || root.getAttribute('data-export-filename') || defaults.filename,
                    source: instance.options.source || root.getAttribute('data-export-source') || null
                };
            },
            destroy() {
                root.removeEventListener('click', instance.onClick);
                root.removeAttribute('data-export-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-export-id', id);
        root.addEventListener('click', instance.onClick);
        runtime.instances.set(id, instance);
        return handle;
    }

    const exportApi = {
        mount: mount,
        download(options) {
            const host = document.createElement('div');
            return exportData(host, options || {});
        },
        serialize: serialize,
        table(target) {
            const table = resolveTarget(target);
            return table && table.matches('table') ? tableToRows(table) : [];
        },
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-export-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.exportApi = exportApi;
    JquanUIComponents.export = {
        name: 'jquanui-export',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-export]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() {
                        if (handle) handle.destroy();
                    };
                }
            });
        }
    };
})(window);
