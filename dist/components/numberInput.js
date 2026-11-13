(function (global) {
  const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

  const config = global.JquanUI?.config || global.JQUAN_CONFIG || {};
  const semantic = config.componentPresets?.ui === 'semantic';
  function color(role, fallback, alpha) {
    if (!semantic) return fallback;
    const base = fallback.replace(/ \/ [^)]+/, '');
    const value = `var(--color-${role}-css, ${base})`;
    return alpha == null ? value : `color-mix(in srgb, ${value} ${alpha}%, transparent)`;
  }

  const runtime = {
    seed: 0,
    instances: new Map(),
    stylesInjected: false
  };

  const defaults = {
    step: 1,
    largeStep: 10,
    min: null,
    max: null,
    precision: null,
    disabled: false,
    readonly: false,
    commitOnInput: false,
    labels: {},
    classes: {},
    onChange: null
  };

  const defaultClasses = {
    root: 'jq-number-input',
    decrement: 'jq-number-input-button jq-number-input-decrement',
    increment: 'jq-number-input-button jq-number-input-increment',
    input: 'jq-number-input-field',
    quick: 'jq-number-input-quick'
  };

  function nextId() {
    runtime.seed += 1;
    return `jq-number-input-${runtime.seed}`;
  }

  function resolveElement(target) {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
    return target instanceof HTMLElement ? target : null;
  }

  function mergeClasses() {
    return Array.from(arguments)
      .flatMap(value => String(value || '').split(/\s+/).filter(Boolean))
      .join(' ');
  }

  function injectStyles() {
    if (runtime.stylesInjected) return;
    runtime.stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'jquanui-number-input-styles';
    style.textContent = `
[jq-number-input-wrap]{display:inline-grid;grid-template-columns:34px minmax(52px,1fr) 34px;align-items:center;min-height:36px;border:1px solid ${color("border", "#e2e8f0")};border-radius:12px;background:${color("surface", "#fff")};color:${color("text", "#334155")};box-shadow:0 1px 2px rgb(15 23 42 / .04);transition:border-color .18s ease,box-shadow .18s ease,background-color .18s ease}
[jq-number-input-wrap]:hover{border-color:${color("text-muted", "#94a3b8")}}
[jq-number-input-wrap]:focus-within{border-color:${color("accent", "#3b82f6")};box-shadow:0 0 0 4px ${color("focus", "rgb(59 130 246 / .12)", 12)}}
[jq-number-input-wrap][data-disabled="true"]{background:${color("surface-muted", "#f8fafc")};color:${color("text-muted", "#94a3b8")};cursor:not-allowed}
[jq-number-input-wrap][data-readonly="true"]{background:${color("surface-muted", "#f8fafc")}}
[jq-number-input-button]{display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:34px;border:0;background:transparent;color:${color("text-muted", "#64748b")};font-size:18px;line-height:1;cursor:pointer;transition:background-color .18s ease,color .18s ease}
[jq-number-input-button]:first-child{border-radius:11px 0 0 11px}
[jq-number-input-button]:last-child{border-radius:0 11px 11px 0}
[jq-number-input-button]:hover{background:${color("accent", "rgb(59 130 246 / .08)", 8)};color:${color("accent", "#2563eb")}}
[jq-number-input-button]:focus-visible{outline:2px solid ${color("focus", "rgb(59 130 246 / .35)", 35)};outline-offset:-2px}
[jq-number-input-button][disabled]{cursor:not-allowed;opacity:.38;background:transparent;color:${color("text-muted", "#94a3b8")}}
[jq-number-input-field]{min-width:0;width:100%;height:34px;border:0;border-left:1px solid ${color("border", "#e2e8f0")};border-right:1px solid ${color("border", "#e2e8f0")};background:transparent;color:inherit;text-align:center;font:inherit;font-size:14px;font-weight:700;line-height:1;outline:0;appearance:textfield;-moz-appearance:textfield}
[jq-number-input-field]::-webkit-outer-spin-button,[jq-number-input-field]::-webkit-inner-spin-button{margin:0;appearance:none;-webkit-appearance:none}
[jq-number-input-field]::placeholder{color:${color("text-muted", "#94a3b8")};font-weight:500}
[jq-number-input-field][disabled]{cursor:not-allowed}
[jq-number-input-quick]{display:flex;align-items:center;gap:6px;margin-left:8px}
[jq-number-input-quick-button]{display:inline-flex;align-items:center;justify-content:center;min-height:30px;padding:0 9px;border:1px solid ${color("border", "#e2e8f0")};border-radius:999px;background:${color("surface-muted", "#f8fafc")};color:${color("text-muted", "#475569")};font-size:12px;font-weight:800;cursor:pointer;transition:border-color .18s ease,background-color .18s ease,color .18s ease}
[jq-number-input-quick-button]:hover{border-color:${color("focus", "rgb(59 130 246 / .35)", 35)};background:${color("accent", "rgb(59 130 246 / .08)", 8)};color:${color("accent", "#2563eb")}}
[jq-number-input-quick-button][disabled]{cursor:not-allowed;opacity:.45}
`;document.head.appendChild(style);
  }

  function readNumber(value) {
    if (value == null || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function decimalPlaces(value) {
    const text = String(value);
    if (!text.includes('.')) return 0;
    return text.split('.')[1].replace(/0+$/, '').length;
  }

  function normalizeOptions(source, inputOptions) {
    const options = Object.assign({}, defaults, {
      step: source.getAttribute('step') || source.getAttribute('data-number-step') || defaults.step,
      largeStep: source.getAttribute('data-number-large-step') || source.getAttribute('data-large-step') || defaults.largeStep,
      min: source.getAttribute('min'),
      max: source.getAttribute('max'),
      precision: source.getAttribute('data-number-precision'),
      disabled: source.disabled,
      readonly: source.readOnly,
      commitOnInput: source.getAttribute('data-number-commit-on-input') === 'true',
      labels: {},
      classes: {}
    }, inputOptions || {});
    options.step = Math.abs(Number(options.step)) || defaults.step;
    options.largeStep = Math.abs(Number(options.largeStep)) || options.step * 10;
    options.min = readNumber(options.min);
    options.max = readNumber(options.max);
    options.precision = options.precision === null || options.precision === '' ? null : Math.max(0, Number(options.precision) || 0);
    options.labels = Object.assign({}, inputOptions?.labels || {});
    options.classes = Object.assign({}, defaultClasses, inputOptions?.classes || {});
    return options;
  }

  function formatLabel(value, params = {}) {
    const raw = typeof value === 'function' ? value(params) : value;
    return String(raw == null ? '' : raw).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => params[key] == null ? '' : String(params[key]));
  }

  function getI18nLabel(name, params) {
    const i18n = global.JquanUIComponents?.i18nApi;
    const key = `numberInput.${name}`;
    if (!i18n || typeof i18n.has !== 'function' || !i18n.has(key, { namespace: 'common' })) return null;
    return i18n.t(key, params, { namespace: 'common' });
  }

  function getLabel(options, name, fallback, params = {}) {
    if (options.labels && options.labels[name] != null) return formatLabel(options.labels[name], params);
    const localized = getI18nLabel(name, params);
    return localized == null ? formatLabel(fallback, params) : localized;
  }

  function formatNumber(value, record) {
    if (value == null || !Number.isFinite(value)) return '';
    const precision = record.options.precision == null
      ? Math.max(decimalPlaces(record.options.step), decimalPlaces(value))
      : record.options.precision;
    if (!precision) return String(Math.round(value));
    return value.toFixed(precision).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function clamp(value, options) {
    if (value == null || !Number.isFinite(value)) return value;
    let next = value;
    if (options.min != null) next = Math.max(options.min, next);
    if (options.max != null) next = Math.min(options.max, next);
    return next;
  }

  function currentValue(record) {
    const value = readNumber(record.source.value);
    if (value != null) return value;
    if (record.options.min != null) return record.options.min;
    return 0;
  }

  function canStep(record, delta) {
    if (record.options.disabled || record.options.readonly) return false;
    const value = currentValue(record);
    if (delta < 0 && record.options.min != null && value <= record.options.min) return false;
    if (delta > 0 && record.options.max != null && value >= record.options.max) return false;
    return true;
  }

  function dispatch(record, reason) {
    record.source.dispatchEvent(new Event('input', { bubbles: true }));
    record.source.dispatchEvent(new Event('change', { bubbles: true }));
    record.source.dispatchEvent(new CustomEvent('jquan:number-input:change', {
      bubbles: true,
      detail: { value: record.source.value, number: readNumber(record.source.value), reason, instance: createHandle(record.id) }
    }));
    if (typeof record.options.onChange === 'function') record.options.onChange(readNumber(record.source.value), createHandle(record.id), reason);
  }

  function setValue(record, value, reason, emit) {
    const next = clamp(value, record.options);
    record.source.value = formatNumber(next, record);
    render(record);
    if (emit !== false) dispatch(record, reason || 'setValue');
    return createHandle(record.id);
  }

  function step(record, amount, reason) {
    if (!runtime.instances.has(record.id)) return null;
    if (record.options.disabled || record.options.readonly) return null;
    const base = currentValue(record);
    return setValue(record, base + amount, reason || 'step', true);
  }

  function render(record) {
    record.root.dataset.disabled = String(record.source.disabled || record.options.disabled);
    record.root.dataset.readonly = String(record.source.readOnly || record.options.readonly);
    record.decrement.disabled = !canStep(record, -record.options.step);
    record.increment.disabled = !canStep(record, record.options.step);
    if (record.quickRoot) {
      Array.from(record.quickRoot.querySelectorAll('[jq-number-input-quick-button]')).forEach(button => {
        button.disabled = !canStep(record, Number(button.dataset.amount) || 0);
      });
    }
  }

  function createButton(className, label, ariaLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('jq-number-input-button', '');
    button.setAttribute('aria-label', ariaLabel);
    button.textContent = label;
    return button;
  }

  function startRepeat(record, amount, reason) {
    step(record, amount, reason);
    if (!runtime.instances.has(record.id)) return;
    let speed = 260;
    let timer = null;
    const repeat = () => {
      if (!runtime.instances.has(record.id)) return;
      step(record, amount, reason);
      speed = Math.max(55, speed * 0.78);
      timer = global.setTimeout(repeat, speed);
    };
    timer = global.setTimeout(repeat, 420);
    const stop = () => {
      global.clearTimeout(timer);
      document.removeEventListener('pointerup', stop, true);
      document.removeEventListener('pointercancel', stop, true);
    };
    document.addEventListener('pointerup', stop, true);
    document.addEventListener('pointercancel', stop, true);
  }

  function mount(target, inputOptions = {}) {
    injectStyles();
    const source = resolveElement(target);
    if (!source || !(source instanceof HTMLInputElement)) throw new Error('[JquanUI numberInput] Only input elements are supported.');
    const existing = Array.from(runtime.instances.values()).find(record => record.source === source);
    if (existing) return createHandle(existing.id);

    const options = normalizeOptions(source, inputOptions);
    const id = source.id || nextId();
    source.id = id;
    source.type = 'number';
    const originalParent = source.parentNode;
    const originalNext = source.nextSibling;
    const originalClass = source.className;
    const root = document.createElement('span');
    root.setAttribute('jq-number-input-wrap', '');
    root.className = options.classes.root;
    root.dataset.jqNumberInputRoot = 'true';
    const decrement = createButton(options.classes.decrement, '-', getLabel(options, 'decrease', 'Decrease value'));
    const increment = createButton(options.classes.increment, '+', getLabel(options, 'increase', 'Increase value'));
    source.className = mergeClasses(originalClass, options.classes.input);
    source.setAttribute('jq-number-input-field', '');
    source.setAttribute('data-jq-number-input-source', 'true');
    source.dataset.jqNumberInputMounted = 'true';
    originalParent.insertBefore(root, source);
    root.append(decrement, source, increment);

    let quickRoot = null;
    const quickSteps = String(source.getAttribute('data-number-quick-steps') || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => Number(item))
      .filter(Number.isFinite);
    if (quickSteps.length) {
      quickRoot = document.createElement('span');
      quickRoot.setAttribute('jq-number-input-quick', '');
      quickRoot.className = options.classes.quick;
      quickSteps.forEach(amount => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('jq-number-input-quick-button', '');
        button.dataset.amount = String(amount);
        button.textContent = amount > 0 ? `+${amount}` : String(amount);
        quickRoot.appendChild(button);
      });
      root.insertAdjacentElement('afterend', quickRoot);
    }

    const record = { id, source, root, decrement, increment, quickRoot, options, originalParent, originalNext, originalClass, cleanup: null };

    const onPointerDown = event => {
      const button = event.target.closest('[jq-number-input-button]');
      if (!button || button.disabled) return;
      event.preventDefault();
      const amount = button === increment ? options.step : -options.step;
      startRepeat(record, amount, button === increment ? 'increment' : 'decrement');
    };
    const onQuickClick = event => {
      const button = event.target.closest('[jq-number-input-quick-button]');
      if (!button || button.disabled) return;
      step(record, Number(button.dataset.amount) || 0, 'quickStep');
    };
    const onKeyDown = event => {
      if (options.disabled || options.readonly) return;
      if (event.key === 'ArrowUp') { event.preventDefault(); step(record, event.shiftKey ? options.largeStep : options.step, 'keyboard'); }
      if (event.key === 'ArrowDown') { event.preventDefault(); step(record, event.shiftKey ? -options.largeStep : -options.step, 'keyboard'); }
      if (event.key === 'PageUp') { event.preventDefault(); step(record, options.largeStep, 'keyboardLarge'); }
      if (event.key === 'PageDown') { event.preventDefault(); step(record, -options.largeStep, 'keyboardLarge'); }
      if (event.key === 'Home' && options.min != null) { event.preventDefault(); setValue(record, options.min, 'keyboardMin', true); }
      if (event.key === 'End' && options.max != null) { event.preventDefault(); setValue(record, options.max, 'keyboardMax', true); }
    };
    const onBlur = () => {
      const value = readNumber(source.value);
      if (value == null && source.value !== '') return;
      setValue(record, value, 'blur', true);
    };
    const onInput = () => {
      render(record);
      if (options.commitOnInput) dispatch(record, 'input');
    };

    root.addEventListener('pointerdown', onPointerDown);
    source.addEventListener('keydown', onKeyDown);
    source.addEventListener('blur', onBlur);
    source.addEventListener('input', onInput);
    if (quickRoot) quickRoot.addEventListener('click', onQuickClick);
    record.cleanup = () => {
      root.removeEventListener('pointerdown', onPointerDown);
      source.removeEventListener('keydown', onKeyDown);
      source.removeEventListener('blur', onBlur);
      source.removeEventListener('input', onInput);
      if (quickRoot) quickRoot.removeEventListener('click', onQuickClick);
    };

    runtime.instances.set(id, record);
    render(record);
    return createHandle(id);
  }

  function resolveInstance(target) {
    const element = resolveElement(target);
    if (!element) return runtime.instances.get(target) || null;
    return Array.from(runtime.instances.values()).find(record => record.source === element || record.root === element || record.quickRoot === element) || null;
  }

  function createHandle(id) {
    const record = runtime.instances.get(id);
    if (!record) return null;
    return {
      id,
      value() { return record.source.value; },
      number() { return readNumber(record.source.value); },
      state() {
        return {
          value: record.source.value,
          number: readNumber(record.source.value),
          min: record.options.min,
          max: record.options.max,
          step: record.options.step,
          largeStep: record.options.largeStep,
          disabled: record.source.disabled || record.options.disabled,
          readonly: record.source.readOnly || record.options.readonly
        };
      },
      setValue(value, emit = true) { return setValue(record, Number(value), 'setValue', emit); },
      step(amount = record.options.step) { return step(record, Number(amount) || record.options.step, 'apiStep'); },
      update(patch = {}) {
        record.options = Object.assign({}, record.options, patch || {}, { classes: Object.assign({}, record.options.classes, patch.classes || {}) });
        render(record);
        return this;
      },
      destroy() {
        if (!runtime.instances.has(id)) return false;
        record.cleanup();
        record.source.className = record.originalClass;
        record.source.removeAttribute('jq-number-input-field');
        record.source.removeAttribute('data-jq-number-input-source');
        delete record.source.dataset.jqNumberInputMounted;
        if (record.originalNext && record.originalNext.parentNode === record.originalParent) record.originalParent.insertBefore(record.source, record.originalNext);
        else record.originalParent.appendChild(record.source);
        record.root.remove();
        if (record.quickRoot) record.quickRoot.remove();
        runtime.instances.delete(id);
        return true;
      }
    };
  }

  const numberInputApi = {
    mount(target, options = {}) { return mount(target, options); },
    get(target) {
      const record = resolveInstance(target);
      return record ? createHandle(record.id) : null;
    },
    destroy(target) {
      const handle = this.get(target);
      return handle ? handle.destroy() : false;
    }
  };

  JquanUIComponents.numberInputApi = numberInputApi;

  JquanUIComponents.numberInput = {
    name: 'jquanui-number-input',
    version: '1.0.0',
    requires: [],
    install(api) {
      api.addBehaviors({
        selector: 'input[jq-number-input], input[data-jq-number-input]',
        setup(node) {
          const handle = mount(node);
          return () => handle && handle.destroy();
        }
      });
    }
  };
})(window);
