(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        logic: 'AND',
        fields: [],
        rules: [],
        classes: {
            root: 'grid gap-4',
            toolbar: 'flex flex-wrap items-center gap-3',
            logic: 'inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1',
            logicButton: 'inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold text-slate-600 transition-colors duration-150',
            logicButtonActive: 'bg-white text-slate-900 shadow-sm',
            surface: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            ruleList: 'grid gap-3',
            ruleRow: 'grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto]',
            control: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            danger: 'inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm text-rose-600',
            empty: 'rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500',
            help: 'text-xs text-slate-500'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-filter-builder-' + runtime.seed;
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
        const operators = Array.isArray(field?.operators) && field.operators.length ? field.operators.slice() : ['equals', 'contains'];
        return Object.assign({
            key: 'field-' + index,
            label: 'Field ' + (index + 1),
            type: 'text',
            operators: operators,
            options: []
        }, clone(field || {}));
    }

    function normalizeFields(fields) {
        return Array.isArray(fields) ? fields.map(normalizeField) : [];
    }

    function normalizeRule(rule, fields, index) {
        const fallbackField = fields[0] || { key: 'keyword', operators: ['contains'] };
        const field = fields.find(function (item) {
            return String(item.key) === String(rule?.field);
        }) || fallbackField;
        const operators = Array.isArray(field.operators) && field.operators.length ? field.operators : ['equals'];
        return {
            id: String(rule?.id || ('rule-' + Date.now() + '-' + index)),
            field: String(rule?.field || field.key),
            operator: String(rule?.operator || operators[0]),
            value: rule?.value != null ? rule.value : ''
        };
    }

    function normalizeRules(rules, fields) {
        if (!Array.isArray(rules) || !rules.length) {
            return fields.length ? [normalizeRule({}, fields, 0)] : [];
        }
        return rules.map(function (rule, index) {
            return normalizeRule(rule, fields, index);
        });
    }

    function getField(instance, key) {
        return instance.fields.find(function (field) {
            return String(field.key) === String(key);
        }) || null;
    }

    function getOperators(field) {
        return Array.isArray(field?.operators) && field.operators.length ? field.operators : ['equals'];
    }

    function createSelect(options, value, className) {
        const node = document.createElement('select');
        node.className = className;
        options.forEach(function (option) {
            const item = document.createElement('option');
            if (typeof option === 'object') {
                item.value = option.value;
                item.textContent = option.label || option.value;
            } else {
                item.value = option;
                item.textContent = option;
            }
            item.selected = String(item.value) === String(value);
            node.appendChild(item);
        });
        return node;
    }

    function createValueControl(field, value, className) {
        if (field.type === 'select') {
            return createSelect(field.options || [], value, className);
        }
        const input = document.createElement('input');
        input.className = className;
        input.type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
        input.value = value == null ? '' : String(value);
        if (field.placeholder) input.placeholder = field.placeholder;
        return input;
    }

    function normalizedPayload(instance) {
        return {
            logic: instance.logic,
            rules: instance.rules.map(function (rule) {
                const field = getField(instance, rule.field);
                return {
                    id: rule.id,
                    field: rule.field,
                    fieldLabel: field?.label || rule.field,
                    type: field?.type || 'text',
                    operator: rule.operator,
                    value: rule.value
                };
            })
        };
    }

    function sqlPreview(instance) {
        const operatorMap = {
            equals: '=',
            notEquals: '!=',
            contains: 'LIKE',
            startsWith: 'LIKE',
            endsWith: 'LIKE',
            gt: '>',
            gte: '>=',
            lt: '<',
            lte: '<=',
            in: 'IN'
        };
        return instance.rules.map(function (rule) {
            const symbol = operatorMap[rule.operator] || rule.operator;
            let value = rule.value;
            if (rule.operator === 'contains') value = "'%" + value + "%'";
            else if (rule.operator === 'startsWith') value = "'" + value + "%'";
            else if (rule.operator === 'endsWith') value = "'%" + value + "'";
            else if (rule.operator === 'in') value = '(' + String(value).split(',').map(function (part) { return "'" + part.trim() + "'"; }).join(', ') + ')';
            else if (typeof value === 'string' && value !== '' && isNaN(Number(value))) value = "'" + value + "'";
            return rule.field + ' ' + symbol + ' ' + value;
        }).join(' ' + instance.logic + ' ');
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:filter-builder:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';

        const toolbar = document.createElement('div');
        toolbar.className = classes.toolbar;

        const logicWrap = document.createElement('div');
        logicWrap.className = classes.logic;
        ['AND', 'OR'].forEach(function (logic) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.logicButton, instance.logic === logic && classes.logicButtonActive].filter(Boolean).join(' ');
            button.setAttribute('jq-filter-builder-logic', logic);
            button.textContent = logic;
            logicWrap.appendChild(button);
        });
        toolbar.appendChild(logicWrap);

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = classes.action;
        addButton.setAttribute('jq-filter-builder-add', '');
        addButton.textContent = 'Add rule';
        toolbar.appendChild(addButton);
        root.appendChild(toolbar);

        const surface = document.createElement('section');
        surface.className = classes.surface;
        if (!instance.rules.length) {
            const empty = document.createElement('div');
            empty.className = classes.empty;
            empty.textContent = 'No rules';
            surface.appendChild(empty);
        } else {
            const list = document.createElement('div');
            list.className = classes.ruleList;
            instance.rules.forEach(function (rule) {
                const field = getField(instance, rule.field) || instance.fields[0];
                const row = document.createElement('div');
                row.className = classes.ruleRow;
                row.setAttribute('jq-filter-builder-row', '');
                row.setAttribute('data-rule-id', rule.id);

                const fieldSelect = createSelect(instance.fields.map(function (item) {
                    return { label: item.label, value: item.key };
                }), rule.field, classes.control);
                fieldSelect.setAttribute('jq-filter-builder-field', '');
                fieldSelect.setAttribute('data-rule-id', rule.id);

                const operatorSelect = createSelect(getOperators(field).map(function (item) {
                    return typeof item === 'object' ? item : { label: item, value: item };
                }), rule.operator, classes.control);
                operatorSelect.setAttribute('jq-filter-builder-operator', '');
                operatorSelect.setAttribute('data-rule-id', rule.id);

                const valueControl = createValueControl(field, rule.value, classes.control);
                valueControl.setAttribute('jq-filter-builder-value', '');
                valueControl.setAttribute('data-rule-id', rule.id);

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = classes.danger;
                removeButton.setAttribute('jq-filter-builder-remove', '');
                removeButton.setAttribute('data-rule-id', rule.id);
                removeButton.textContent = 'Remove';

                row.appendChild(fieldSelect);
                row.appendChild(operatorSelect);
                row.appendChild(valueControl);
                row.appendChild(removeButton);
                list.appendChild(row);
            });
            surface.appendChild(list);
        }

        const help = document.createElement('div');
        help.className = classes.help;
        help.textContent = 'Payload is normalized as { logic, rules[] } and can be sent directly to CMS query adapters.';
        surface.appendChild(help);
        root.appendChild(surface);
    }

    function syncRuleFromField(instance, ruleId, fieldKey) {
        const rule = instance.rules.find(function (item) {
            return item.id === ruleId;
        });
        if (!rule) return;
        const field = getField(instance, fieldKey);
        if (!field) return;
        rule.field = field.key;
        rule.operator = getOperators(field)[0]?.value || getOperators(field)[0];
        rule.value = field.type === 'number' ? 0 : '';
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-filter-builder-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const fields = normalizeFields(merged.fields);
        const instance = {
            id: id,
            root: root,
            options: merged,
            fields: fields,
            logic: String(merged.logic || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND',
            rules: normalizeRules(merged.rules, fields),
            state() {
                return {
                    id: id,
                    logic: instance.logic,
                    ruleCount: instance.rules.length,
                    rules: clone(instance.rules),
                    payload: normalizedPayload(instance),
                    queryPreview: sqlPreview(instance)
                };
            }
        };

        const onClick = function (event) {
            const logic = event.target.closest('[jq-filter-builder-logic]');
            if (logic && root.contains(logic)) {
                instance.logic = String(logic.getAttribute('jq-filter-builder-logic') || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND';
                render(instance);
                dispatch(instance, 'change', { action: 'logic', logic: instance.logic });
                return;
            }
            const addButton = event.target.closest('[jq-filter-builder-add]');
            if (addButton && root.contains(addButton)) {
                handle.appendRule();
                return;
            }
            const removeButton = event.target.closest('[jq-filter-builder-remove]');
            if (removeButton && root.contains(removeButton)) {
                handle.removeRule(removeButton.getAttribute('data-rule-id'));
            }
        };

        const onInput = function (event) {
            const targetNode = event.target;
            const ruleId = targetNode?.getAttribute('data-rule-id');
            if (!ruleId) return;
            if (targetNode.hasAttribute('jq-filter-builder-field')) {
                syncRuleFromField(instance, ruleId, targetNode.value);
                render(instance);
                dispatch(instance, 'change', { action: 'field', ruleId: ruleId });
                return;
            }
            const rule = instance.rules.find(function (item) { return item.id === ruleId; });
            if (!rule) return;
            if (targetNode.hasAttribute('jq-filter-builder-operator')) {
                rule.operator = targetNode.value;
                dispatch(instance, 'change', { action: 'operator', ruleId: ruleId });
                return;
            }
            if (targetNode.hasAttribute('jq-filter-builder-value')) {
                rule.value = targetNode.value;
                dispatch(instance, 'change', { action: 'value', ruleId: ruleId });
            }
        };

        const handle = {
            id: id,
            setLogic(logic) {
                instance.logic = String(logic || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND';
                render(instance);
                dispatch(instance, 'change', { action: 'setLogic', logic: instance.logic });
                return instance.state();
            },
            appendRule(rule) {
                instance.rules.push(normalizeRule(rule || {}, instance.fields, instance.rules.length));
                render(instance);
                dispatch(instance, 'change', { action: 'appendRule' });
                return instance.state();
            },
            removeRule(ruleId) {
                const nextRules = instance.rules.filter(function (item) {
                    return item.id !== String(ruleId);
                });
                instance.rules = nextRules;
                render(instance);
                dispatch(instance, 'change', { action: 'removeRule', ruleId: String(ruleId) });
                return instance.state();
            },
            clear() {
                instance.rules = [];
                render(instance);
                dispatch(instance, 'change', { action: 'clear' });
                return instance.state();
            },
            setRules(rules) {
                instance.rules = normalizeRules(rules, instance.fields);
                render(instance);
                dispatch(instance, 'change', { action: 'setRules' });
                return instance.state();
            },
            rules() {
                return clone(instance.rules);
            },
            payload() {
                return normalizedPayload(instance);
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('input', onInput);
                root.removeAttribute('data-filter-builder-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-filter-builder-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const filterBuilderApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-filter-builder-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.filterBuilderApi = filterBuilderApi;
    JquanUIComponents.filterBuilder = {
        name: 'jquanui-filter-builder',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-filter-builder]',
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
