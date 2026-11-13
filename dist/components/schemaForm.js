(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        schema: [],
        values: {},
        validator: null,
        submitText: 'Submit',
        classes: {
            form: 'grid gap-4',
            section: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            sectionTitle: 'text-sm font-semibold text-slate-800',
            field: 'grid gap-2',
            row: 'grid gap-4 md:grid-cols-2',
            label: 'text-sm font-medium text-slate-700',
            help: 'text-xs leading-5 text-slate-500',
            input: uiPreset.classes.control || 'h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700',
            textarea: 'min-h-[104px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700',
            actions: 'flex flex-wrap gap-3 pt-2',
            switchWrap: 'inline-flex items-center gap-3',
            switchInput: 'h-4 w-4 rounded border-slate-300',
            group: 'flex flex-wrap gap-4'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-schema-form-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeSchema(schema) {
        return Array.isArray(schema) ? clone(schema) : [];
    }

    function groupSchema(schema) {
        const rows = [];
        let currentRow = [];
        schema.forEach(function (field) {
            if (field.type === 'section') {
                if (currentRow.length) rows.push({ type: 'row', fields: currentRow.splice(0) });
                rows.push(field);
                return;
            }
            if (field.span === 2) {
                if (currentRow.length) rows.push({ type: 'row', fields: currentRow.splice(0) });
                rows.push({ type: 'row', fields: [field] });
                return;
            }
            currentRow.push(field);
            if (currentRow.length === 2) rows.push({ type: 'row', fields: currentRow.splice(0) });
        });
        if (currentRow.length) rows.push({ type: 'row', fields: currentRow.splice(0) });
        return rows;
    }

    function getFieldDefault(field) {
        if (field.value !== undefined) return field.value;
        if (field.defaultValue !== undefined) return field.defaultValue;
        if (field.type === 'checkbox' || field.type === 'switch') return false;
        if (field.type === 'checkbox-group' || field.multiple) return [];
        return '';
    }

    function buildInitialValues(schema, incoming) {
        const values = Object.assign({}, incoming || {});
        schema.forEach(function (field) {
            if (!field || !field.name) return;
            if (values[field.name] === undefined) values[field.name] = getFieldDefault(field);
        });
        return values;
    }

    function ensureValidatorSchema(schema, validator) {
        if (validator && validator.schema) return validator;
        const generated = {};
        schema.forEach(function (field) {
            if (!field?.name) return;
            const rules = [];
            if (field.required) rules.push('required');
            if (field.type === 'email') rules.push('email');
            if (field.minLength) rules.push({ type: 'minLength', minLength: field.minLength });
            if (field.maxLength) rules.push({ type: 'maxLength', maxLength: field.maxLength });
            if (field.min !== undefined) rules.push({ type: 'min', min: field.min });
            if (field.max !== undefined) rules.push({ type: 'max', max: field.max });
            if (field.pattern) rules.push({ type: 'pattern', pattern: field.pattern });
            if (rules.length) generated[field.name] = rules;
        });
        return { schema: generated };
    }

    function createInput(field, value, classes) {
        const type = field.type || 'text';
        const common = {
            name: field.name || '',
            disabled: field.disabled === true
        };
        let node;
        if (type === 'textarea') {
            node = document.createElement('textarea');
            node.className = classes.textarea;
            node.value = value == null ? '' : String(value);
        } else if (type === 'select') {
            node = document.createElement('select');
            node.className = classes.input;
            if (field.multiple) node.multiple = true;
            (field.options || []).forEach(function (option) {
                const item = document.createElement('option');
                if (typeof option === 'object') {
                    item.value = option.value;
                    item.textContent = option.label || option.value;
                } else {
                    item.value = option;
                    item.textContent = option;
                }
                if (field.multiple && Array.isArray(value)) item.selected = value.includes(item.value);
                else item.selected = String(value) === String(item.value);
                node.appendChild(item);
            });
            if (field.placeholder && !field.multiple) {
                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = field.placeholder;
                placeholder.selected = value == null || value === '';
                node.insertBefore(placeholder, node.firstChild);
            }
        } else if (type === 'radio-group' || type === 'checkbox-group') {
            node = document.createElement('div');
            node.className = classes.group;
            (field.options || []).forEach(function (option, index) {
                const wrap = document.createElement('label');
                wrap.className = 'inline-flex items-center gap-2 text-sm text-slate-700';
                const input = document.createElement('input');
                input.type = type === 'radio-group' ? 'radio' : 'checkbox';
                input.name = field.name || '';
                input.value = typeof option === 'object' ? option.value : option;
                input.className = classes.switchInput;
                if (type === 'radio-group') input.checked = String(value) === String(input.value);
                else input.checked = Array.isArray(value) && value.includes(input.value);
                const text = document.createElement('span');
                text.textContent = typeof option === 'object' ? (option.label || option.value) : option;
                wrap.appendChild(input);
                wrap.appendChild(text);
                node.appendChild(wrap);
            });
        } else if (type === 'switch' || type === 'checkbox') {
            node = document.createElement('label');
            node.className = classes.switchWrap;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = field.name || '';
            input.className = classes.switchInput;
            input.checked = !!value;
            const text = document.createElement('span');
            text.className = 'text-sm text-slate-700';
            text.textContent = field.switchText || field.label || field.name || 'Toggle';
            node.appendChild(input);
            node.appendChild(text);
        } else {
            node = document.createElement('input');
            node.type = type === 'number' || type === 'date' || type === 'email' ? type : 'text';
            node.className = classes.input;
            node.value = value == null ? '' : String(value);
            if (field.placeholder) node.placeholder = field.placeholder;
            if (field.min !== undefined) node.min = String(field.min);
            if (field.max !== undefined) node.max = String(field.max);
            if (field.step !== undefined) node.step = String(field.step);
        }
        Object.keys(common).forEach(function (key) {
            if (common[key] !== undefined && node instanceof HTMLElement && key in node) node[key] = common[key];
            else if (common[key] !== undefined && node instanceof HTMLElement) node.setAttribute(key, String(common[key]));
        });
        return node;
    }

    function render(instance) {
        const root = instance.root;
        const classes = instance.options.classes;
        const form = document.createElement('form');
        form.className = classes.form;
        form.setAttribute('jq-form-validate', '');
        form.noValidate = true;
        const groups = groupSchema(instance.schema);
        let section = null;

        function ensureSection(title) {
            section = document.createElement('section');
            section.className = classes.section;
            if (title) {
                const heading = document.createElement('div');
                heading.className = classes.sectionTitle;
                heading.textContent = title;
                section.appendChild(heading);
            }
            form.appendChild(section);
        }

        ensureSection('');
        groups.forEach(function (group) {
            if (group.type === 'section') {
                ensureSection(group.label || '');
                return;
            }
            const row = document.createElement('div');
            row.className = group.fields.length > 1 ? classes.row : 'grid gap-4';
            group.fields.forEach(function (field) {
                const wrap = document.createElement('label');
                wrap.className = classes.field;
                wrap.setAttribute('data-field', field.name || '');
                if (field.type !== 'switch' && field.type !== 'checkbox') {
                    const title = document.createElement('span');
                    title.className = classes.label;
                    title.textContent = field.label || field.name || 'Field';
                    wrap.appendChild(title);
                }
                const control = createInput(field, instance.values[field.name], classes);
                wrap.appendChild(control);
                if (field.help) {
                    const help = document.createElement('div');
                    help.className = classes.help;
                    help.textContent = field.help;
                    wrap.appendChild(help);
                }
                row.appendChild(wrap);
            });
            section.appendChild(row);
        });
        const actions = document.createElement('div');
        actions.className = classes.actions;
        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = uiPreset.classes.action || 'inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700';
        submit.textContent = instance.options.submitText;
        actions.appendChild(submit);
        form.appendChild(actions);

        root.innerHTML = '';
        root.appendChild(form);
        instance.form = form;
        if (global.JquanUI && typeof global.JquanUI.enhance === 'function') global.JquanUI.enhance(form);
    }

    function readValues(instance) {
        const values = {};
        instance.schema.forEach(function (field) {
            if (!field?.name) return;
            const elements = Array.from(instance.form.elements).filter(function (el) {
                return el.name === field.name;
            });
            if (!elements.length) return;
            if (field.type === 'radio-group') {
                const checked = elements.find(function (el) { return el.checked; });
                values[field.name] = checked ? checked.value : '';
            } else if (field.type === 'checkbox-group') {
                values[field.name] = elements.filter(function (el) { return el.checked; }).map(function (el) { return el.value; });
            } else if (field.type === 'switch' || field.type === 'checkbox') {
                values[field.name] = !!elements[0].checked;
            } else if (field.type === 'select' && elements[0].multiple) {
                values[field.name] = Array.from(elements[0].selectedOptions).map(function (option) { return option.value; });
            } else if (field.type === 'number') {
                values[field.name] = elements[0].value === '' ? '' : Number(elements[0].value);
            } else {
                values[field.name] = elements[0].value;
            }
        });
        instance.values = values;
        return values;
    }

    function writeValues(instance, patch, replace) {
        instance.values = replace ? buildInitialValues(instance.schema, patch || {}) : Object.assign({}, instance.values, patch || {});
        render(instance);
        mountValidator(instance);
        return instance.values;
    }

    function mountValidator(instance) {
        if (!JquanUIComponents.formValidatorApi) return null;
        if (instance.validatorHandle?.destroy) instance.validatorHandle.destroy();
        const validatorOptions = ensureValidatorSchema(instance.schema, instance.options.validator);
        instance.validatorHandle = JquanUIComponents.formValidatorApi.mount(instance.form, validatorOptions);
        return instance.validatorHandle;
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-schema-form-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            schema: normalizeSchema(merged.schema),
            values: buildInitialValues(normalizeSchema(merged.schema), merged.values),
            validatorHandle: null,
            form: null,
            state() {
                return {
                    id: id,
                    values: readValues(instance),
                    schemaSize: instance.schema.length
                };
            }
        };
        render(instance);
        mountValidator(instance);
        const onInput = function () {
            readValues(instance);
            root.dispatchEvent(new CustomEvent('jquan:schema-form:change', {
                bubbles: true,
                detail: instance.state()
            }));
        };
        const onSubmit = async function (event) {
            event.preventDefault();
            readValues(instance);
            let result = { valid: true, values: instance.values };
            if (instance.validatorHandle?.validate) result = await instance.validatorHandle.validate();
            root.dispatchEvent(new CustomEvent('jquan:schema-form:submit', {
                bubbles: true,
                detail: Object.assign({}, result, { values: instance.values })
            }));
        };
        instance.form.addEventListener('input', onInput);
        instance.form.addEventListener('change', onInput);
        instance.form.addEventListener('submit', onSubmit);

        const handle = {
            id: id,
            setValue(name, value) {
                const patch = {};
                patch[name] = value;
                writeValues(instance, patch, false);
                return instance.state();
            },
            setValues(values) {
                writeValues(instance, values, false);
                return instance.state();
            },
            getValue(name) {
                readValues(instance);
                return instance.values[name];
            },
            values() {
                return readValues(instance);
            },
            async validate() {
                readValues(instance);
                if (instance.validatorHandle?.validate) return instance.validatorHandle.validate();
                return { valid: true, values: instance.values };
            },
            reset(values) {
                const next = values ? buildInitialValues(instance.schema, values) : buildInitialValues(instance.schema, merged.values);
                writeValues(instance, next, true);
                return instance.state();
            },
            patchSchema(schema) {
                instance.schema = normalizeSchema(schema);
                instance.values = buildInitialValues(instance.schema, instance.values);
                render(instance);
                mountValidator(instance);
                return instance.state();
            },
            state() {
                return instance.state();
            },
            destroy() {
                instance.validatorHandle?.destroy?.();
                instance.form?.removeEventListener('input', onInput);
                instance.form?.removeEventListener('change', onInput);
                instance.form?.removeEventListener('submit', onSubmit);
                root.removeAttribute('data-schema-form-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-schema-form-id', id);
        runtime.instances.set(id, instance);
        return handle;
    }

    const schemaFormApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-schema-form-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.schemaFormApi = schemaFormApi;
    JquanUIComponents.schemaForm = {
        name: 'jquanui-schema-form',
        version: '1.0.0',
        requires: ['jquanui-form-validator'],
        install(api) {
            api.addBehaviors({
                selector: '[jq-schema-form]',
                setup(node) {
                    const script = node.querySelector('script[type="application/json"][jq-schema-form-data]');
                    let schema = [];
                    try { schema = script ? JSON.parse(script.textContent || '[]') : []; } catch (error) {}
                    const handle = mount(node, { schema: schema });
                    return function cleanup() {
                        handle?.destroy?.();
                    };
                }
            });
        }
    };
})(window);
