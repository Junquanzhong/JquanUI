(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map(),
        stylesInjected: false
    };

    const defaultMessages = {
        required: 'This field is required.',
        email: 'Please enter a valid email address.',
        url: 'Please enter a valid URL.',
        number: 'Please enter a valid number.',
        integer: 'Please enter an integer.',
        min: 'Value must be at least {{min}}.',
        max: 'Value must be at most {{max}}.',
        minLength: 'Please enter at least {{minLength}} characters.',
        maxLength: 'Please enter no more than {{maxLength}} characters.',
        pattern: 'Input format is invalid.',
        match: 'The values do not match.',
        checked: 'Please check this field.',
        minItems: 'Please select at least {{minItems}} item(s).',
        maxItems: 'Please select no more than {{maxItems}} item(s).'
    };

    const defaults = {
        schema: {},
        mode: 'submit',
        validateOnInput: false,
        validateOnBlur: true,
        scrollToError: true,
        focusOnError: true,
        stopAtFirstError: false,
        nativeValidation: false,
        errorClass: 'is-invalid',
        successClass: 'is-valid',
        pendingClass: 'is-validating',
        formErrorClass: 'has-errors',
        fieldErrorSelector: '[data-field-error]',
        fieldContainerSelector: '[data-field]',
        messages: {},
        onValidate: null,
        onFieldValidate: null,
        onSuccess: null,
        onError: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-form-${runtime.seed}`;
    }

    function injectStyles() {
        if (runtime.stylesInjected) return;
        runtime.stylesInjected = true;
        const style = document.createElement('style');
        style.id = 'jquanui-form-validator-styles';
        style.textContent = `
[data-jq-validate] .is-invalid,
[jq-form-validate] .is-invalid{
  border-color:rgb(220 38 38 / 1) !important;
  box-shadow:0 0 0 3px rgb(220 38 38 / .12);
}
[data-jq-validate] .is-valid,
[jq-form-validate] .is-valid{
  border-color:rgb(22 163 74 / 1);
}
[data-jq-validate] .is-validating,
[jq-form-validate] .is-validating{
  border-color:rgb(37 99 235 / 1);
}
[data-field-error]{
  display:block;
  margin-top:6px;
  color:rgb(220 38 38 / 1);
  font-size:12px;
  line-height:1.45;
}
        `;
        document.head.appendChild(style);
    }

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function mergeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.messages = Object.assign({}, defaultMessages, input?.messages || {});
        merged.validateOnInput = input?.validateOnInput === true || merged.mode === 'input';
        merged.validateOnBlur = input?.validateOnBlur !== false && merged.mode !== 'manual';
        merged.nativeValidation = input?.nativeValidation === true;
        return merged;
    }

    function resolveForm(target) {
        if (typeof target === 'string') {
            let form = null;
            try { form = document.querySelector(target); } catch { /* Business ids may not be CSS selectors. */ }
            return form || document.getElementById(target.replace(/^#/, ''));
        }
        return target instanceof HTMLFormElement ? target : null;
    }

    function toArray(value) {
        if (Array.isArray(value)) return value;
        if (value == null) return [];
        return [value];
    }

    function getFieldName(field) {
        return field?.name || field?.getAttribute('name') || field?.getAttribute('data-name') || '';
    }

    function getFieldElements(form, name) {
        if (!form || !name) return [];
        return Array.from(form.elements).filter(field => getFieldName(field) === name);
    }

    function getFieldPrimary(form, name) {
        const fields = getFieldElements(form, name);
        return fields[0] || null;
    }

    function getFieldContainer(field, form, options) {
        return field.closest(options.fieldContainerSelector) || field.closest('.field') || field.parentElement || form;
    }

    function getErrorElement(field, form, options) {
        const container = getFieldContainer(field, form, options);
        const existing = container.querySelector(options.fieldErrorSelector);
        if (existing) return existing;
        const node = document.createElement('div');
        node.setAttribute('data-field-error', '');
        container.appendChild(node);
        return node;
    }

    function getFieldErrorElement(instance, name) {
        const fields = getFieldElements(instance.form, name);
        for (let i = 0; i < fields.length; i += 1) {
            const container = getFieldContainer(fields[i], instance.form, instance.options);
            const existing = container.querySelector(instance.options.fieldErrorSelector);
            if (existing) return existing;
        }
        const primary = fields[0];
        return primary ? getErrorElement(primary, instance.form, instance.options) : null;
    }

    function getCheckboxGroupValue(fields) {
        return fields.filter(field => field.checked).map(field => field.value);
    }

    function readFieldValue(form, name) {
        const fields = getFieldElements(form, name);
        if (!fields.length) return undefined;
        const first = fields[0];
        const type = String(first.type || '').toLowerCase();
        if (type === 'checkbox') {
            if (fields.length === 1) return !!first.checked ? first.value || true : '';
            return getCheckboxGroupValue(fields);
        }
        if (type === 'radio') {
            const checked = fields.find(field => field.checked);
            return checked ? checked.value : '';
        }
        if (first instanceof HTMLSelectElement && first.multiple) {
            return Array.from(first.selectedOptions).map(option => option.value);
        }
        if (type === 'number' || type === 'range') {
            return first.value === '' ? '' : Number(first.value);
        }
        return first.value;
    }

    function collectValues(form) {
        const output = {};
        Array.from(form.elements).forEach(field => {
            const name = getFieldName(field);
            if (!name || field.disabled) return;
            if (Object.prototype.hasOwnProperty.call(output, name)) return;
            output[name] = readFieldValue(form, name);
        });
        return output;
    }

    function normalizeRule(rule) {
        if (typeof rule === 'function') {
            return { validator: rule };
        }
        if (typeof rule === 'string') {
            return { type: rule };
        }
        return isPlainObject(rule) ? Object.assign({}, rule) : {};
    }

    function formatMessage(message, params = {}) {
        return String(message).replace(/\{\{\s*([.\w-]+)\s*\}\}/g, (_, token) => {
            const value = params[token];
            return value == null ? `{{${token}}}` : String(value);
        });
    }

    function resolveMessage(rule, type, options, context) {
        if (typeof rule.message === 'function') return rule.message(context);
        if (typeof rule.message === 'string') return formatMessage(rule.message, context);
        const i18n = JquanUIComponents.i18nApi;
        if (i18n && typeof i18n.t === 'function' && i18n.has && i18n.has(`formValidator.${type}`, { namespace: 'common' })) {
            return i18n.t(`formValidator.${type}`, context, { namespace: 'common' });
        }
        return formatMessage(options.messages[type] || options.messages.required || 'Validation error.', context);
    }

    function isEmptyValue(value) {
        return value == null || value === '' || (Array.isArray(value) && value.length === 0);
    }

    const builtinValidators = {
        required(value, rule) {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'boolean') return value;
            return !isEmptyValue(value);
        },
        checked(value) {
            return value === true || value === 'on' || value === 'true' || value === 1 || value === '1';
        },
        email(value) {
            if (isEmptyValue(value)) return true;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
        },
        url(value) {
            if (isEmptyValue(value)) return true;
            try {
                new URL(String(value));
                return true;
            } catch (error) {
                return false;
            }
        },
        number(value) {
            if (isEmptyValue(value)) return true;
            return Number.isFinite(Number(value));
        },
        integer(value) {
            if (isEmptyValue(value)) return true;
            return Number.isInteger(Number(value));
        },
        min(value, rule) {
            if (isEmptyValue(value)) return true;
            return Number(value) >= Number(rule.value ?? rule.min);
        },
        max(value, rule) {
            if (isEmptyValue(value)) return true;
            return Number(value) <= Number(rule.value ?? rule.max);
        },
        minLength(value, rule) {
            if (isEmptyValue(value)) return true;
            return String(value).length >= Number(rule.value ?? rule.minLength);
        },
        maxLength(value, rule) {
            if (isEmptyValue(value)) return true;
            return String(value).length <= Number(rule.value ?? rule.maxLength);
        },
        minItems(value, rule) {
            if (isEmptyValue(value)) return true;
            return toArray(value).length >= Number(rule.value ?? rule.minItems);
        },
        maxItems(value, rule) {
            if (isEmptyValue(value)) return true;
            return toArray(value).length <= Number(rule.value ?? rule.maxItems);
        },
        pattern(value, rule) {
            if (isEmptyValue(value)) return true;
            const pattern = rule.pattern || rule.value;
            const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
            return regex.test(String(value));
        },
        match(value, rule, context) {
            if (isEmptyValue(value)) return true;
            const compareName = rule.field || rule.value;
            return value === context.values[compareName];
        },
        custom(value, rule, context) {
            if (typeof rule.validator !== 'function') return true;
            return rule.validator(value, context);
        }
    };

    async function runRule(ruleInput, context, options) {
        const rule = normalizeRule(ruleInput);
        const type = rule.type || (rule.validator ? 'custom' : 'required');
        const validator = rule.validator || builtinValidators[type];
        if (typeof validator !== 'function') {
            return { valid: true, type, rule };
        }
        const result = await Promise.resolve(validator(context.value, rule, context));
        if (result === true || result == null) {
            return { valid: true, type, rule };
        }
        if (typeof result === 'string') {
            return { valid: false, type, rule, message: result };
        }
        if (isPlainObject(result)) {
            return {
                valid: result.valid !== false,
                type,
                rule,
                message: result.message
            };
        }
        const message = resolveMessage(rule, type, options, Object.assign({}, context, rule));
        return { valid: !!result, type, rule, message };
    }

    function clearFieldState(instance, name) {
        const fields = getFieldElements(instance.form, name);
        fields.forEach(field => {
            field.classList.remove(instance.options.errorClass, instance.options.successClass, instance.options.pendingClass);
            field.removeAttribute('aria-invalid');
        });
        const errorNode = getFieldErrorElement(instance, name);
        if (errorNode) errorNode.textContent = '';
        delete instance.state.fields[name];
    }

    function applyFieldState(instance, name, payload) {
        const fields = getFieldElements(instance.form, name);
        if (!fields.length) return;
        const errorNode = getFieldErrorElement(instance, name);
        fields.forEach(field => {
            field.classList.remove(instance.options.errorClass, instance.options.successClass, instance.options.pendingClass);
            if (payload.pending) field.classList.add(instance.options.pendingClass);
            else if (payload.valid) field.classList.add(instance.options.successClass);
            else field.classList.add(instance.options.errorClass);
            field.setAttribute('aria-invalid', payload.valid ? 'false' : 'true');
        });
        if (errorNode) errorNode.textContent = payload.valid || payload.pending ? '' : (payload.message || '');
        instance.state.fields[name] = Object.assign({}, payload);
    }

    function buildFieldContext(instance, name) {
        const values = collectValues(instance.form);
        return {
            name,
            form: instance.form,
            field: getFieldPrimary(instance.form, name),
            fields: getFieldElements(instance.form, name),
            value: values[name],
            values,
            instance: createHandle(instance.id)
        };
    }

    async function validateField(instance, name, trigger = 'manual') {
        const generation = instance.generation;
        const request = (instance.requests.get(name) || 0) + 1;
        instance.requests.set(name, request);
        const current = () => isActive(instance) && instance.generation === generation && instance.requests.get(name) === request;
        const cancelled = () => ({ valid: false, cancelled: true, name, errors: [], trigger });
        if (!current()) return cancelled();
        const rules = toArray(instance.schema[name]);
        if (!rules.length) {
            clearFieldState(instance, name);
            return { valid: true, name, errors: [] };
        }

        const context = buildFieldContext(instance, name);
        applyFieldState(instance, name, { valid: true, pending: true, message: '', trigger });
        const errors = [];

        for (let i = 0; i < rules.length; i += 1) {
            const rule = normalizeRule(rules[i]);
            const shouldRun = !rule.trigger || toArray(rule.trigger).includes(trigger) || trigger === 'submit';
            if (!shouldRun) continue;
            const result = await runRule(rule, context, instance.options);
            if (!current()) return cancelled();
            if (!result.valid) {
                const message = result.message || resolveMessage(rule, result.type, instance.options, Object.assign({}, context, rule));
                errors.push({ type: result.type, message, rule });
                if (instance.options.stopAtFirstError) break;
            }
        }

        const payload = {
            name,
            valid: errors.length === 0,
            pending: false,
            message: errors[0]?.message || '',
            errors,
            trigger
        };
        applyFieldState(instance, name, payload);

        if (typeof instance.options.onFieldValidate === 'function') {
            instance.options.onFieldValidate(payload);
        }
        return payload;
    }

    async function validateAll(instance, trigger = 'submit') {
        const generation = instance.generation;
        const names = Array.from(new Set(Object.keys(instance.schema)));
        const results = [];
        for (let i = 0; i < names.length; i += 1) {
            results.push(await validateField(instance, names[i], trigger));
        }
        const valid = results.every(item => item.valid);
        const payload = {
            valid,
            fields: results,
            values: collectValues(instance.form),
            trigger
        };
        if (!isActive(instance) || generation !== instance.generation || results.some(item => item.cancelled)) return Object.assign(payload, { valid: false, cancelled: true });
        instance.form.classList.toggle(instance.options.formErrorClass, !valid);
        if (typeof instance.options.onValidate === 'function') instance.options.onValidate(payload);
        return payload;
    }

    function focusFirstError(instance, results) {
        const first = results.fields.find(item => !item.valid);
        if (!first) return;
        const field = getFieldPrimary(instance.form, first.name);
        if (!field) return;
        if (instance.options.scrollToError) {
            field.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        if (instance.options.focusOnError) {
            field.focus({ preventScroll: true });
        }
    }

    function parseDeclarativeSchema(form) {
        const schema = {};
        Array.from(form.elements).forEach(field => {
            const name = getFieldName(field);
            if (!name || schema[name]) return;
            const rules = [];
            if (field.hasAttribute('required')) {
                rules.push({ type: field.type === 'checkbox' ? 'checked' : 'required' });
            }
            if (field.type === 'email') rules.push({ type: 'email' });
            if (field.type === 'url') rules.push({ type: 'url' });
            if (field.type === 'number') rules.push({ type: 'number' });
            if (field.getAttribute('min') != null && field.getAttribute('min') !== '') {
                rules.push({ type: 'min', min: Number(field.getAttribute('min')) });
            }
            if (field.getAttribute('max') != null && field.getAttribute('max') !== '') {
                rules.push({ type: 'max', max: Number(field.getAttribute('max')) });
            }
            if (field.getAttribute('minlength')) {
                rules.push({ type: 'minLength', minLength: Number(field.getAttribute('minlength')) });
            }
            if (field.getAttribute('maxlength')) {
                rules.push({ type: 'maxLength', maxLength: Number(field.getAttribute('maxlength')) });
            }
            if (field.getAttribute('pattern')) {
                rules.push({ type: 'pattern', pattern: field.getAttribute('pattern') });
            }
            const matchField = field.getAttribute('data-rule-match');
            if (matchField) rules.push({ type: 'match', field: matchField });
            const custom = field.getAttribute('data-rules');
            if (custom) {
                try {
                    const parsed = JSON.parse(custom);
                    toArray(parsed).forEach(rule => rules.push(rule));
                } catch (error) {}
            }
            if (rules.length) schema[name] = rules;
        });
        return schema;
    }

    function bindEvents(instance) {
        const cleanup = [];
        const form = instance.form;

        const submitHandler = async event => {
            if (!instance.options.nativeValidation) event.preventDefault();
            const generation = instance.generation;
            const results = await validateAll(instance, 'submit');
            if (!isActive(instance) || generation !== instance.generation || results.cancelled) return;
            if (results.valid) {
                if (typeof instance.options.onSuccess === 'function') {
                    const response = instance.options.onSuccess({
                        form,
                        values: results.values,
                        results,
                        instance: createHandle(instance.id)
                    });
                    if (response === false) event.preventDefault();
                } else if (!instance.options.nativeValidation) {
                    form.submit?.();
                }
                return;
            }
            if (typeof instance.options.onError === 'function') {
                instance.options.onError({
                    form,
                    values: results.values,
                    results,
                    instance: createHandle(instance.id)
                });
            }
            focusFirstError(instance, results);
        };

        form.addEventListener('submit', submitHandler);
        cleanup.push(() => form.removeEventListener('submit', submitHandler));

        const names = Array.from(new Set(Object.keys(instance.schema)));
        names.forEach(name => {
            getFieldElements(form, name).forEach(field => {
                if (instance.options.validateOnBlur) {
                    const blurHandler = () => validateField(instance, name, 'blur').catch(() => {});
                    field.addEventListener('blur', blurHandler);
                    cleanup.push(() => field.removeEventListener('blur', blurHandler));
                }
                if (instance.options.validateOnInput) {
                    const inputHandler = () => validateField(instance, name, 'input').catch(() => {});
                    const eventName = field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT' ? 'change' : 'input';
                    field.addEventListener(eventName, inputHandler);
                    cleanup.push(() => field.removeEventListener(eventName, inputHandler));
                }
            });
        });

        instance.cleanup = () => cleanup.forEach(fn => fn());
    }

    function isActive(instance) {
        return !instance.destroyed && runtime.instances.get(instance.id) === instance;
    }

    function retire(instance) {
        if (!isActive(instance)) return false;
        instance.destroyed = true;
        instance.generation += 1;
        instance.cleanup?.();
        runtime.instances.delete(instance.id);
        return true;
    }

    function createHandle(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return null;
        if (instance.handle) return instance.handle;
        return instance.handle = {
            id,
            form() {
                return isActive(instance) ? instance.form : null;
            },
            values() {
                return isActive(instance) ? collectValues(instance.form) : null;
            },
            state() {
                return Object.assign(JSON.parse(JSON.stringify(instance.state)), { destroyed: !isActive(instance) });
            },
            validate() {
                return validateAll(instance, 'manual');
            },
            validateField(name, trigger = 'manual') {
                return validateField(instance, name, trigger);
            },
            reset() {
                if (!isActive(instance)) return false;
                instance.generation += 1;
                Object.keys(instance.schema).forEach(name => clearFieldState(instance, name));
                instance.form.classList.remove(instance.options.formErrorClass);
                instance.state = { fields: {} };
                return true;
            },
            updateSchema(patch = {}) {
                if (!isActive(instance)) return null;
                instance.generation += 1;
                instance.schema = Object.assign({}, instance.schema, patch);
                instance.cleanup?.();
                bindEvents(instance);
                return this;
            },
            destroy() {
                return retire(instance);
            }
        };
    }

    function mount(target, inputOptions = {}) {
        injectStyles();
        const form = resolveForm(target);
        if (!(form instanceof HTMLFormElement)) throw new Error('[JquanUI formValidator] Form not found.');
        const mounted = Array.from(runtime.instances.values()).find(instance => instance.form === form);
        if (mounted) return createHandle(mounted.id);
        const options = mergeOptions(inputOptions);
        const id = form.id || nextId();
        form.id = id;
        form.setAttribute('data-jq-validate', 'true');
        if (!options.nativeValidation) form.setAttribute('novalidate', 'novalidate');

        if (runtime.instances.has(id)) {
            retire(runtime.instances.get(id));
        }

        const schema = Object.assign({}, parseDeclarativeSchema(form), options.schema || {});
        const instance = {
            id,
            form,
            options,
            schema,
            state: { fields: {} },
            cleanup: null,
            generation: 0, requests: new Map(), destroyed: false, handle: null
        };

        runtime.instances.set(id, instance);
        bindEvents(instance);
        return createHandle(id);
    }

    function resolveInstance(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            const form = resolveForm(target);
            if (form?.id && runtime.instances.get(form.id)?.form === form) return runtime.instances.get(form.id);
            return null;
        }
        if (target instanceof HTMLFormElement && target.id && runtime.instances.has(target.id)) {
            const instance = runtime.instances.get(target.id);
            return instance.form === target ? instance : null;
        }
        return null;
    }

    const formValidatorApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(target) {
            const instance = resolveInstance(target);
            return instance ? createHandle(instance.id) : null;
        },
        validate(target) {
            const instance = resolveInstance(target);
            if (!instance) throw new Error('[JquanUI formValidator] Instance not found.');
            return validateAll(instance, 'manual');
        },
        validateField(target, name, trigger = 'manual') {
            const instance = resolveInstance(target);
            if (!instance) throw new Error('[JquanUI formValidator] Instance not found.');
            return validateField(instance, name, trigger);
        },
        destroy(target) {
            const instance = resolveInstance(target);
            return instance ? createHandle(instance.id).destroy() : false;
        },
        registerRule(name, validator) {
            if (!name || typeof validator !== 'function') return false;
            builtinValidators[name] = validator;
            return true;
        },
        values(target) {
            const instance = resolveInstance(target);
            return instance ? collectValues(instance.form) : null;
        }
    };

    JquanUIComponents.formValidatorApi = formValidatorApi;

    JquanUIComponents.formValidator = {
        name: 'jquanui-form-validator',
        version: '1.1.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: 'form[jq-form-validate], form[data-jq-validate]',
                setup(node) {
                    if (!node.isConnected) return () => {};
                    const handle = mount(node, {
                        mode: node.getAttribute('data-validate-mode') || 'submit',
                        validateOnInput: node.getAttribute('data-validate-on-input') === 'true',
                        validateOnBlur: node.getAttribute('data-validate-on-blur') !== 'false',
                        nativeValidation: node.getAttribute('data-native-validation') === 'true'
                    });
                    return () => {
                        handle.destroy();
                    };
                }
            });
        }
    };
})(window);
