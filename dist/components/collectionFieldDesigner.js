(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        fields: [],
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            toolbar: 'flex flex-wrap gap-2',
            rowList: 'grid gap-3',
            row: 'grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_160px_120px_140px_auto]',
            control: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            checkboxWrap: 'inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            danger: 'inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm text-rose-700',
            help: 'text-xs text-slate-500'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-collection-field-designer-' + runtime.seed;
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
            id: String(field?.id || ('field-' + Date.now() + '-' + index)),
            name: 'field_' + (index + 1),
            type: 'text',
            required: false,
            defaultValue: ''
        }, clone(field || {}));
    }

    function normalizedSchema(instance) {
        return instance.fields.map(function (field, index) {
            return {
                id: field.id,
                name: field.name,
                type: field.type,
                required: field.required === true,
                defaultValue: field.defaultValue,
                order: index + 1
            };
        });
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:collection-field-designer:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function createSelect(options, value, className) {
        const node = document.createElement('select');
        node.className = className;
        options.forEach(function (option) {
            const item = document.createElement('option');
            item.value = option.value;
            item.textContent = option.label;
            item.selected = String(option.value) === String(value);
            node.appendChild(item);
        });
        return node;
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
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = classes.action;
        addButton.setAttribute('jq-collection-field-designer-add', '');
        addButton.textContent = 'Add field';
        toolbar.appendChild(addButton);
        surface.appendChild(toolbar);

        const list = document.createElement('div');
        list.className = classes.rowList;
        instance.fields.forEach(function (field) {
            const row = document.createElement('div');
            row.className = classes.row;
            row.setAttribute('data-field-id', field.id);

            const name = document.createElement('input');
            name.className = classes.control;
            name.value = field.name;
            name.placeholder = 'field_name';
            name.setAttribute('jq-collection-field-name', '');
            name.setAttribute('data-field-id', field.id);

            const type = createSelect([
                { label: 'Text', value: 'text' },
                { label: 'Textarea', value: 'textarea' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'Date', value: 'date' },
                { label: 'Relation', value: 'relation' }
            ], field.type, classes.control);
            type.setAttribute('jq-collection-field-type', '');
            type.setAttribute('data-field-id', field.id);

            const requiredWrap = document.createElement('label');
            requiredWrap.className = classes.checkboxWrap;
            const required = document.createElement('input');
            required.type = 'checkbox';
            required.checked = field.required === true;
            required.setAttribute('jq-collection-field-required', '');
            required.setAttribute('data-field-id', field.id);
            const requiredText = document.createElement('span');
            requiredText.textContent = 'Required';
            requiredWrap.appendChild(required);
            requiredWrap.appendChild(requiredText);

            const defaultValue = document.createElement('input');
            defaultValue.className = classes.control;
            defaultValue.value = field.defaultValue == null ? '' : String(field.defaultValue);
            defaultValue.placeholder = 'Default value';
            defaultValue.setAttribute('jq-collection-field-default', '');
            defaultValue.setAttribute('data-field-id', field.id);

            const actions = document.createElement('div');
            actions.className = 'flex flex-wrap gap-2';
            const up = document.createElement('button');
            up.type = 'button';
            up.className = classes.action;
            up.textContent = 'Up';
            up.setAttribute('jq-collection-field-up', '');
            up.setAttribute('data-field-id', field.id);
            const down = document.createElement('button');
            down.type = 'button';
            down.className = classes.action;
            down.textContent = 'Down';
            down.setAttribute('jq-collection-field-down', '');
            down.setAttribute('data-field-id', field.id);
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = classes.danger;
            remove.textContent = 'Remove';
            remove.setAttribute('jq-collection-field-remove', '');
            remove.setAttribute('data-field-id', field.id);
            actions.appendChild(up);
            actions.appendChild(down);
            actions.appendChild(remove);

            row.appendChild(name);
            row.appendChild(type);
            row.appendChild(requiredWrap);
            row.appendChild(defaultValue);
            row.appendChild(actions);
            list.appendChild(row);
        });
        surface.appendChild(list);

        const help = document.createElement('div');
        help.className = classes.help;
        help.textContent = 'Schema is normalized as ordered field descriptors and can be mapped to CMS collection definitions.';
        surface.appendChild(help);

        root.appendChild(surface);
    }

    function moveField(instance, fieldId, direction) {
        const index = instance.fields.findIndex(function (field) {
            return field.id === String(fieldId);
        });
        if (index < 0) return false;
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= instance.fields.length) return false;
        const current = instance.fields[index];
        instance.fields[index] = instance.fields[target];
        instance.fields[target] = current;
        return true;
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-collection-field-designer-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});

        const instance = {
            id: id,
            root: root,
            options: merged,
            fields: Array.isArray(merged.fields) ? merged.fields.map(normalizeField) : [],
            state() {
                return {
                    id: id,
                    fieldCount: instance.fields.length,
                    fields: clone(instance.fields),
                    schema: normalizedSchema(instance)
                };
            }
        };

        const onClick = function (event) {
            const add = event.target.closest('[jq-collection-field-designer-add]');
            if (add && root.contains(add)) {
                handle.appendField();
                return;
            }
            const up = event.target.closest('[jq-collection-field-up]');
            if (up && root.contains(up)) {
                if (moveField(instance, up.getAttribute('data-field-id'), 'up')) {
                    render(instance);
                    dispatch(instance, 'change', { action: 'moveUp' });
                }
                return;
            }
            const down = event.target.closest('[jq-collection-field-down]');
            if (down && root.contains(down)) {
                if (moveField(instance, down.getAttribute('data-field-id'), 'down')) {
                    render(instance);
                    dispatch(instance, 'change', { action: 'moveDown' });
                }
                return;
            }
            const remove = event.target.closest('[jq-collection-field-remove]');
            if (remove && root.contains(remove)) {
                handle.removeField(remove.getAttribute('data-field-id'));
            }
        };

        const onInput = function (event) {
            const targetNode = event.target;
            const fieldId = targetNode?.getAttribute('data-field-id');
            if (!fieldId) return;
            const field = instance.fields.find(function (item) {
                return item.id === String(fieldId);
            });
            if (!field) return;
            if (targetNode.hasAttribute('jq-collection-field-name')) field.name = targetNode.value || '';
            if (targetNode.hasAttribute('jq-collection-field-type')) field.type = targetNode.value || 'text';
            if (targetNode.hasAttribute('jq-collection-field-default')) field.defaultValue = targetNode.value || '';
            if (targetNode.hasAttribute('jq-collection-field-required')) field.required = !!targetNode.checked;
            dispatch(instance, 'change', { action: 'edit', fieldId: fieldId });
        };

        const handle = {
            id: id,
            appendField(field) {
                instance.fields.push(normalizeField(field || {}, instance.fields.length));
                render(instance);
                dispatch(instance, 'change', { action: 'appendField' });
                return instance.state();
            },
            removeField(fieldId) {
                instance.fields = instance.fields.filter(function (field) {
                    return field.id !== String(fieldId);
                });
                render(instance);
                dispatch(instance, 'change', { action: 'removeField', fieldId: String(fieldId) });
                return instance.state();
            },
            setFields(fields) {
                instance.fields = Array.isArray(fields) ? fields.map(normalizeField) : [];
                render(instance);
                dispatch(instance, 'change', { action: 'setFields' });
                return instance.state();
            },
            schema() {
                return normalizedSchema(instance);
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('input', onInput);
                root.removeAttribute('data-collection-field-designer-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-collection-field-designer-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const collectionFieldDesignerApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-collection-field-designer-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.collectionFieldDesignerApi = collectionFieldDesignerApi;
    JquanUIComponents.collectionFieldDesigner = {
        name: 'jquanui-collection-field-designer',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-collection-field-designer]',
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
