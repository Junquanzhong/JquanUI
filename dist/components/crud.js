(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        title: 'Data',
        rowKey: 'id',
        permissions: {
            create: null,
            edit: null,
            remove: null
        },
        table: {},
        modal: {},
        request: {
            list: null,
            create: null,
            update: null,
            remove: null
        },
        forms: {
            create: null,
            edit: null
        },
        messages: {
            createTitle: 'Create',
            editTitle: 'Edit',
            removeTitle: 'Delete',
            removeContent: 'Are you sure you want to delete this record?',
            removeOkText: 'Delete'
        },
        hooks: {
            beforeCreate: null,
            beforeEdit: null,
            beforeSave: null,
            afterSave: null,
            beforeRemove: null,
            afterRemove: null
        }
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-crud-${runtime.seed}`;
    }

    function deepMerge(base, extra) {
        const output = Object.assign({}, base);
        Object.keys(extra || {}).forEach(key => {
            const baseValue = output[key];
            const nextValue = extra[key];
            if (isPlainObject(baseValue) && isPlainObject(nextValue)) output[key] = deepMerge(baseValue, nextValue);
            else output[key] = nextValue;
        });
        return output;
    }

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function getI18n() {
        return JquanUIComponents.i18nApi || null;
    }

    function t(key, fallback) {
        const i18n = getI18n();
        if (i18n && typeof i18n.has === 'function' && i18n.has(key, { namespace: 'common' })) {
            return i18n.t(key, {}, { namespace: 'common' });
        }
        return fallback || key;
    }

    function normalizeOptions(input) {
        const merged = deepMerge(defaults, input || {});
        merged.request = Object.assign({}, defaults.request, input?.request || {});
        merged.permissions = Object.assign({}, defaults.permissions, input?.permissions || {});
        merged.forms = Object.assign({}, defaults.forms, input?.forms || {});
        merged.messages = Object.assign({}, defaults.messages, input?.messages || {});
        merged.hooks = Object.assign({}, defaults.hooks, input?.hooks || {});
        merged.table = Object.assign({
            toolbar: {
                refresh: true,
                columnToggle: true,
                selectionInfo: true
            },
            selectable: true,
            filterable: true,
            sortable: true,
            pagination: { page: 1, pageSize: 10 }
        }, input?.table || {});
        return merged;
    }

    function inferMode(result) {
        return Array.isArray(result) ? { data: result, total: result.length } : {
            data: Array.isArray(result?.data) ? result.data : [],
            total: Number(result?.total) || (Array.isArray(result?.data) ? result.data.length : 0)
        };
    }

    async function fetchList(record, payload = {}) {
        if (typeof record.options.request.list === 'function') {
            const result = await record.options.request.list(payload, createHandle(record.id));
            const normalized = inferMode(result);
            record.lastListPayload = payload;
            return normalized;
        }
        const http = JquanUIComponents.httpApi;
        if (http && typeof record.options.request.list === 'string') {
            const response = await http.get(record.options.request.list, { params: payload });
            const normalized = inferMode(response.data);
            record.lastListPayload = payload;
            return normalized;
        }
        return { data: [], total: 0 };
    }

    async function runValidator(form, config) {
        const api = JquanUIComponents.formValidatorApi;
        if (!api || !form) return { valid: true, values: null };
        const handle = api.mount(form, config || {});
        const result = await handle.validate();
        return {
            valid: result.valid,
            values: handle.values ? handle.values() : api.values(form)
        };
    }

    function buildFormOptions(record, mode, currentRow) {
        const formConfig = record.options.forms[mode];
        if (!formConfig) return null;
        const values = typeof formConfig.values === 'function' ? formConfig.values(currentRow || null) : Object.assign({}, formConfig.values || {}, currentRow || {});
        return {
            schema: Array.isArray(formConfig.schema) ? formConfig.schema : [],
            values,
            submitText: formConfig.submitText || (mode === 'create' ? t('crud.create', 'Create') : t('crud.save', 'Save')),
            cancelText: formConfig.cancelText || t('crud.cancel', 'Cancel'),
            showCancel: formConfig.showCancel !== false,
            closeOnSubmit: false,
            noValidate: true,
            attributes: formConfig.attributes || {}
        };
    }

    async function saveRecord(record, mode, payload, currentRow, modalHandle) {
        const hooks = record.options.hooks;
        const savePayload = typeof hooks.beforeSave === 'function'
            ? await hooks.beforeSave({ mode, values: payload, row: currentRow, crud: createHandle(record.id) }) || payload
            : payload;

        let result = null;
        if (mode === 'create') {
            if (typeof record.options.request.create === 'function') {
                result = await record.options.request.create(savePayload, createHandle(record.id));
            } else if (typeof record.options.request.create === 'string' && JquanUIComponents.httpApi) {
                result = await JquanUIComponents.httpApi.post(record.options.request.create, savePayload);
            }
        } else {
            if (typeof record.options.request.update === 'function') {
                result = await record.options.request.update(currentRow, savePayload, createHandle(record.id));
            } else if (typeof record.options.request.update === 'string' && JquanUIComponents.httpApi) {
                result = await JquanUIComponents.httpApi.put(record.options.request.update, savePayload);
            }
        }

        if (typeof hooks.afterSave === 'function') {
            await hooks.afterSave({ mode, values: savePayload, row: currentRow, result, crud: createHandle(record.id) });
        }

        await reload(record.id, 'save');
        if (modalHandle) modalHandle.close(mode);
        return result;
    }

    function openFormModal(record, mode, currentRow) {
        const modalApi = JquanUIComponents.modalApi;
        if (!modalApi) throw new Error('[JquanUI crud] modalApi is required.');
        const formConfig = record.options.forms[mode];
        if (!formConfig) throw new Error(`[JquanUI crud] Missing form config for ${mode}.`);

        const modalOptions = deepMerge(record.options.modal, formConfig.modal || {});
        const title = mode === 'create'
            ? (formConfig.title || record.options.messages.createTitle || `${record.options.title} Create`)
            : (formConfig.title || record.options.messages.editTitle || `${record.options.title} Edit`);

        let validatorMounted = false;
        return modalApi.open(Object.assign({}, modalOptions, {
            type: 'form',
            title,
            form: buildFormOptions(record, mode, currentRow),
            onOpen(handle) {
                if (typeof modalOptions.onOpen === 'function') modalOptions.onOpen(handle);
                const form = handle.element()?.querySelector('form');
                if (form && !validatorMounted) {
                    const validatorOptions = formConfig.validator || {};
                    if (validatorOptions && JquanUIComponents.formValidatorApi) {
                        JquanUIComponents.formValidatorApi.mount(form, validatorOptions);
                        validatorMounted = true;
                    }
                }
            },
            onSubmit: async context => {
                const form = context.form;
                const validation = await runValidator(form, formConfig.validator || {});
                if (!validation.valid) return false;
                context.instance.setBusy(true, t('crud.saving', 'Saving...'));
                try {
                    const values = validation.values || context.values;
                    await saveRecord(record, mode, values, currentRow, context.instance);
                    return false;
                } catch (error) {
                    context.instance.setBusy(false);
                    throw error;
                }
            }
        }));
    }

    async function removeRecord(record, row) {
        if (typeof record.options.hooks.beforeRemove === 'function') {
            const allowed = await record.options.hooks.beforeRemove({ row, crud: createHandle(record.id) });
            if (allowed === false) return false;
        }
        let result = null;
        if (typeof record.options.request.remove === 'function') {
            result = await record.options.request.remove(row, createHandle(record.id));
        } else if (typeof record.options.request.remove === 'string' && JquanUIComponents.httpApi) {
            result = await JquanUIComponents.httpApi.delete(record.options.request.remove, { data: row });
        }
        if (typeof record.options.hooks.afterRemove === 'function') {
            await record.options.hooks.afterRemove({ row, result, crud: createHandle(record.id) });
        }
        await reload(record.id, 'remove');
        return result;
    }

    function buildRowActions(record) {
        return [
            { key: 'edit', label: t('crud.edit', 'Edit'), permission: record.options.permissions.edit },
            { key: 'delete', label: t('crud.delete', 'Delete'), permission: record.options.permissions.remove }
        ].concat(Array.isArray(record.options.table.rowActions) ? record.options.table.rowActions : []);
    }

    async function mount(target, inputOptions = {}) {
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI crud] Container not found.');
        const id = element.id || nextId();
        element.id = id;

        const options = normalizeOptions(inputOptions);
        const record = {
            id,
            element,
            options,
            tableHandle: null,
            lastListPayload: null
        };
        runtime.instances.set(id, record);

        const tableApi = JquanUIComponents.tableApi;
        if (!tableApi) throw new Error('[JquanUI crud] tableApi is required.');

        const tableOptions = deepMerge(options.table, {
            rowKey: options.rowKey,
            rowActions: buildRowActions(record),
            remote: {
                enabled: true,
                load: payload => fetchList(record, payload)
            },
            onAction(payload) {
                if (payload.key === 'edit') {
                    openEdit(id, payload.row);
                    return;
                }
                if (payload.key === 'delete') {
                    confirmRemove(id, payload.row);
                    return;
                }
                if (typeof options.table.onAction === 'function') options.table.onAction(payload, createHandle(id));
            }
        });

        record.tableHandle = await tableApi.mount(element, tableOptions);
        return createHandle(id);
    }

    async function reload(target, reason = 'reload') {
        const record = resolveRecord(target);
        if (!record || !record.tableHandle) return null;
        await record.tableHandle.reload(reason);
        return createHandle(record.id);
    }

    function resolveRecord(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            const element = resolveElement(target);
            if (element?.id && runtime.instances.has(element.id)) return runtime.instances.get(element.id);
            return null;
        }
        if (target instanceof HTMLElement && target.id && runtime.instances.has(target.id)) return runtime.instances.get(target.id);
        return null;
    }

    async function openCreate(target) {
        const record = resolveRecord(target);
        if (!record) return null;
        if (typeof record.options.hooks.beforeCreate === 'function') {
            const allowed = await record.options.hooks.beforeCreate({ crud: createHandle(record.id) });
            if (allowed === false) return null;
        }
        return openFormModal(record, 'create', null);
    }

    async function openEdit(target, row) {
        const record = resolveRecord(target);
        if (!record) return null;
        let currentRow = row;
        if (typeof record.options.hooks.beforeEdit === 'function') {
            const result = await record.options.hooks.beforeEdit({ row, crud: createHandle(record.id) });
            if (result === false) return null;
            if (result && result !== true) currentRow = result;
        }
        return openFormModal(record, 'edit', currentRow);
    }

    function confirmRemove(target, row) {
        const record = resolveRecord(target);
        if (!record) return null;
        const modalApi = JquanUIComponents.modalApi;
        if (!modalApi) throw new Error('[JquanUI crud] modalApi is required.');
        return modalApi.confirm(record.options.messages.removeContent, {
            title: record.options.messages.removeTitle,
            confirmText: record.options.messages.removeOkText
        }).then(confirmed => {
            if (!confirmed) return false;
            return removeRecord(record, row);
        });
    }

    function createHandle(id) {
        const record = runtime.instances.get(id);
        if (!record) return null;
        return {
            id,
            table() {
                return record.tableHandle;
            },
            reload(reason = 'reload') {
                return reload(id, reason);
            },
            create() {
                return openCreate(id);
            },
            edit(row) {
                return openEdit(id, row);
            },
            remove(row) {
                return confirmRemove(id, row);
            },
            selectedRows() {
                return record.tableHandle?.selectedRows ? record.tableHandle.selectedRows() : [];
            },
            destroy() {
                if (record.tableHandle?.destroy) record.tableHandle.destroy();
                runtime.instances.delete(id);
                return true;
            }
        };
    }

    const crudApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(target) {
            const record = resolveRecord(target);
            return record ? createHandle(record.id) : null;
        },
        reload(target, reason = 'reload') {
            return reload(target, reason);
        },
        create(target) {
            return openCreate(target);
        },
        edit(target, row) {
            return openEdit(target, row);
        },
        remove(target, row) {
            return confirmRemove(target, row);
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        }
    };

    JquanUIComponents.crudApi = crudApi;

    JquanUIComponents.crud = {
        name: 'jquanui-crud',
        version: '1.0.0',
        requires: [],
        install() {}
    };
})(window);
