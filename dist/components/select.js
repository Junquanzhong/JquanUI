(function (global) {
  const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});


  const config = global.JquanUI?.config || global.JQUAN_CONFIG || {};
  const semantic = (JquanUIComponents.uiPreset?.mode || config.componentPresets?.ui) === 'semantic';
  function color(role, fallback, alpha) {
    if (!semantic) return fallback;
    const base = fallback.replace(/ \/ [^)]+/, '');
    const value = `var(--color-${role}-css, ${base})`;
    return alpha == null ? value : `color-mix(in srgb, ${value} ${alpha}%, transparent)`;
  }

  const runtime = {
    seed: 0,
    instances: new Map(),
    stylesInjected: false,
    openId: null
  };

  const defaults = {
    multiple: false,
    searchable: true,
    clearable: true,
    closeOnSelect: true,
    placeholder: 'Select option',
    searchPlaceholder: 'Search...',
    noResultsText: 'No results found',
    helperText: '',
    maxSelectionsText: 'Selection limit reached',
    maxSelections: 0,
    disabled: false,
    options: [],
    searchDebounce: 120,
    remoteMethod: null,
    onChange: null,
    onOpen: null,
    onClose: null
  };

  function nextId(prefix) {
    runtime.seed += 1;
    return `${prefix}-${runtime.seed}`;
  }

  function injectStyles() {
    if (runtime.stylesInjected) return;
    runtime.stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'jquanui-select-styles';
    style.textContent = `
[jq-select-wrap]{position:relative;display:grid;gap:8px;}
${semantic ? 'button' : ''}[jq-select-trigger]{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;width:100%;padding:8px 12px;border:1px solid ${color("border", "#e2e8f0")};border-radius:14px;background:${color("surface", "#fff")};color:${color("text", "#0f172a")};cursor:pointer;box-shadow:0 1px 2px rgb(15 23 42 / .04);transition:border-color .2s ease, box-shadow .2s ease, background-color .2s ease;}
${semantic ? 'button' : ''}[jq-select-trigger]:focus-visible{outline:none;border-color:${color("accent", "#3b82f6")};box-shadow:0 0 0 4px ${color("focus", "rgb(59 130 246 / .14)", 14)};}
${semantic ? 'button' : ''}[jq-select-trigger][disabled]{cursor:not-allowed;background:${color("surface-muted", "#f8fafc")};color:${color("text-muted", "#94a3b8")};}
${semantic ? 'button' : ''}[jq-select-trigger][data-open="true"]{border-color:${color("accent", "#3b82f6")};box-shadow:0 0 0 4px ${color("focus", "rgb(59 130 246 / .12)", 12)};}
[jq-select-value]{min-width:0;display:flex;flex:1;flex-wrap:wrap;align-items:center;gap:6px;}
[jq-select-placeholder]{color:${color("text-muted", "#94a3b8")};}
[jq-select-chip]{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:28px;padding:0 10px;border-radius:999px;background:${color("surface-muted", "#f1f5f9")};color:${color("text", "#1e293b")};font-size:12px;font-weight:600;line-height:1;}
[jq-select-chip-text]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
[jq-select-meta]{display:flex;align-items:center;gap:8px;flex-shrink:0;}
[jq-select-clear]{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:0;border-radius:999px;background:transparent;color:${color("text-muted", "#64748b")};cursor:pointer;}
[jq-select-clear]:hover{background:${color("surface-muted", "#f1f5f9")};}
[jq-select-arrow]{width:10px;height:10px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .2s ease;color:${color("text-muted", "#64748b")};margin-top:-3px;}
${semantic ? 'button' : ''}[jq-select-trigger][data-open="true"] [jq-select-arrow]{transform:rotate(-135deg);margin-top:3px;}
[jq-select-panel]{position:fixed;top:0;left:0;right:auto;z-index:80;display:grid;gap:10px;padding:10px;box-sizing:border-box;width:220px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);border:1px solid ${color("border", "#e2e8f0")};border-radius:16px;background:${color("surface", "#fff")};${semantic ? `color:${color('text', '#0f172a')};` : ''}box-shadow:0 20px 40px rgb(15 23 42 / .12);overflow:hidden;}
[jq-select-panel][hidden]{display:none;}
[jq-select-search]{box-sizing:border-box;width:100%;height:38px;padding:0 12px;border:1px solid ${color("border", "#e2e8f0")};border-radius:12px;background:${color("surface", "#fff")};color:${color("text", "#0f172a")};}
[jq-select-search]:focus{outline:none;border-color:${color("accent", "#3b82f6")};box-shadow:0 0 0 3px ${color("focus", "rgb(59 130 246 / .12)", 12)};}
[jq-select-list]{min-width:0;display:grid;gap:6px;max-height:280px;overflow-x:hidden;overflow-y:auto;}
[jq-select-option]{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;min-height:42px;width:100%;padding:0 12px;border:1px solid transparent;border-radius:12px;background:transparent;color:${color("text", "#0f172a")};text-align:left;cursor:pointer;transition:background-color .16s ease, border-color .16s ease;}
[jq-select-option]:hover,
[jq-select-option][data-active="true"]{background:${color("surface-muted", "#f8fafc")};border-color:${color("border", "#e2e8f0")};}
[jq-select-option][data-selected="true"]{background:${color("accent", "#eff6ff", 10)};border-color:${color("accent", "#bfdbfe", 30)};}
[jq-select-option][disabled]{cursor:not-allowed;opacity:.45;}
[jq-select-check]{width:18px;height:18px;border:1px solid ${color("border", "#cbd5e1")};border-radius:999px;background:${color("surface", "#fff")};}
[jq-select-option][data-selected="true"] [jq-select-check]{background:${color("accent", "#3b82f6")};border-color:${color("accent", "#3b82f6")};box-shadow:inset 0 0 0 4px ${color("surface", "#fff")};}
[jq-select-option][data-multiple="true"] [jq-select-check]{border-radius:6px;}
[jq-select-option-label]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
[jq-select-option-meta]{color:${color("accent", "#3b82f6")};font-size:12px;font-weight:700;}
[jq-select-empty]{padding:14px 12px;border-radius:12px;background:${color("surface-muted", "#f8fafc")};color:${color("text-muted", "#64748b")};text-align:center;font-size:13px;}
[jq-select-helper]{padding:0 2px;color:${color("text-muted", "#64748b")};font-size:12px;line-height:1.5;}
[jq-select-helper][data-tone="warning"]{color:#d97706;font-weight:600;}`;document.head.appendChild(style);
  }

  function normalizeOptions(input) {
    const merged = Object.assign({}, defaults, input || {});
    merged.multiple = merged.multiple === true;
    merged.searchable = merged.searchable !== false;
    merged.clearable = merged.clearable !== false;
    merged.closeOnSelect = merged.closeOnSelect !== false;
    merged.disabled = merged.disabled === true;
    merged.maxSelections = Math.max(0, Number(merged.maxSelections) || 0);
    merged.searchDebounce = Math.max(0, Number(merged.searchDebounce ?? defaults.searchDebounce) || 0);
    merged.options = Array.isArray(merged.options) ? merged.options.map(normalizeOption) : [];
    return merged;
  }

  function normalizeOption(option) {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        value: String(option),
        label: String(option),
        disabled: false
      };
    }
    const value = option?.value != null ? String(option.value) : '';
    return {
      value,
      label: option?.label != null ? String(option.label) : value,
      disabled: option?.disabled === true,
      description: option?.description != null ? String(option.description) : '',
      keywords: Array.isArray(option?.keywords) ? option.keywords.map(item => String(item)) : []
    };
  }

  function readElementOptions(element) {
    if (!(element instanceof HTMLSelectElement)) return [];
    return Array.from(element.options).map(option => ({
      value: option.value,
      label: option.textContent || option.label || option.value,
      disabled: option.disabled
    }));
  }

  function readInitialValues(element, multiple) {
    if (!(element instanceof HTMLSelectElement)) return [];
    if (multiple) {
      return Array.from(element.selectedOptions).map(option => option.value);
    }
    return element.value ? [element.value] : [];
  }

  function resolveElement(target) {
    if (typeof target === 'string') {
      return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
    }
    return target instanceof HTMLElement ? target : null;
  }

  function resolveInstance(target) {
    if (target && typeof target === 'object' && !(target instanceof HTMLElement)) {
      const record = runtime.instances.get(target.id);
      return record?.handle === target ? record : null;
    }
    const element = resolveElement(target);
    if (!element) return null;
    if (runtime.instances.get(element.id)?.source === element) return runtime.instances.get(element.id);
    for (const record of runtime.instances.values()) {
      if (record.source === element || record.root === element || record.root.contains(element)) return record;
    }
    return null;
  }

  function buildSearchText(option) {
    return [
      option.label,
      option.value,
      option.description || '',
      ...(option.keywords || [])
    ].join(' ').toLowerCase();
  }

  function getFilteredOptions(record) {
    const keyword = record.search.trim().toLowerCase();
    if (!keyword || typeof record.options.remoteMethod === 'function') return record.options.options.slice();
    return record.options.options.filter(option => buildSearchText(option).includes(keyword));
  }

  function cancelSearch(record) {
    clearTimeout(record.searchTimer);
    record.requestId++;
    record.controller?.abort();
    record.controller = null;
    record.loading = false;
    record.listNode.setAttribute('aria-busy', 'false');
  }

  async function applySearch(record, requestId) {
    if (runtime.instances.get(record.id) !== record || requestId !== record.requestId) return;
    if (typeof record.options.remoteMethod !== 'function') { renderOptions(record); return; }
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    record.controller = controller;
    record.loading = true;
    record.listNode.setAttribute('aria-busy', 'true');
    try {
      const options = await record.options.remoteMethod(record.search, record.handle, { requestId, signal: controller?.signal || null });
      if (runtime.instances.get(record.id) !== record || requestId !== record.requestId) return;
      if (Array.isArray(options)) record.options.options = options.map(normalizeOption);
      renderOptions(record);
    } catch (error) {
      // Rejected searches retain the last options; cancellation is advisory.
    } finally {
      if (runtime.instances.get(record.id) === record && requestId === record.requestId) {
        record.loading = false;
        record.controller = null;
        record.listNode.setAttribute('aria-busy', 'false');
      }
    }
  }

  function search(record, keyword, wait = 0) {
    cancelSearch(record);
    record.search = String(keyword || '');
    record.searchInput.value = record.search;
    record.activeIndex = -1;
    const requestId = record.requestId;
    if (wait > 0) record.searchTimer = setTimeout(() => applySearch(record, requestId), wait);
    else applySearch(record, requestId);
    return true;
  }

  function syncNative(record, emit) {
    const source = record.source;
    if (!(source instanceof HTMLSelectElement)) return;
    source.multiple = record.options.multiple;
    const values = new Set(record.value);
    record.value.forEach(value => {
      if (!Array.from(source.options).some(option => option.value === value)) {
        const item = record.options.options.find(option => option.value === value);
        source.add(new Option(item?.label || value, value));
      }
    });
    Array.from(source.options).forEach(option => {
      option.selected = values.has(option.value);
    });
    if (!record.options.multiple) {
      source.value = record.value[0] || '';
    }
    source.setAttribute('data-state', record.value.length ? 'filled' : 'empty');
    if (emit !== false) {
      source.dispatchEvent(new Event('change', { bubbles: true }));
      source.dispatchEvent(new CustomEvent('jquan:select:change', {
        bubbles: true,
        detail: {
          value: record.options.multiple ? record.value.slice() : (record.value[0] || ''),
          values: record.value.slice(),
          instance: record.handle
        }
      }));
    }
  }

  function emitChange(record) {
    if (typeof record.options.onChange === 'function') {
      record.options.onChange(record.options.multiple ? record.value.slice() : (record.value[0] || ''), record.handle);
    }
  }

  function renderValue(record) {
    const selected = record.options.options.filter(option => record.value.includes(option.value));
    record.valueNode.innerHTML = '';
    if (!selected.length) {
      const placeholder = document.createElement('span');
      placeholder.setAttribute('jq-select-placeholder', '');
      placeholder.textContent = record.options.placeholder;
      record.valueNode.appendChild(placeholder);
      return;
    }
    if (!record.options.multiple) {
      const text = document.createElement('span');
      text.textContent = selected[0].label;
      record.valueNode.appendChild(text);
      return;
    }
    selected.forEach(option => {
      const chip = document.createElement('span');
      chip.setAttribute('jq-select-chip', '');
      const text = document.createElement('span');
      text.setAttribute('jq-select-chip-text', '');
      text.textContent = option.label;
      chip.appendChild(text);
      record.valueNode.appendChild(chip);
    });
  }

  function renderOptions(record) {
    const filtered = getFilteredOptions(record);
    record.filtered = filtered;
    record.listNode.innerHTML = '';
    record.trigger.removeAttribute('aria-activedescendant');
    record.searchInput.removeAttribute('aria-activedescendant');
    record.listNode.removeAttribute('aria-activedescendant');
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.setAttribute('jq-select-empty', '');
      empty.textContent = record.options.noResultsText;
      record.listNode.appendChild(empty);
      record.activeIndex = -1;
      return;
    }
    if (record.activeIndex >= filtered.length) record.activeIndex = filtered.length - 1;
    filtered.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('jq-select-option', '');
      button.id = record.listNode.id + '-option-' + index;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(record.value.includes(option.value)));
      button.tabIndex = -1;
      button.dataset.value = option.value;
      button.dataset.selected = record.value.includes(option.value) ? 'true' : 'false';
      button.dataset.active = index === record.activeIndex ? 'true' : 'false';
      button.dataset.multiple = record.options.multiple ? 'true' : 'false';
      button.disabled = option.disabled;

      const check = document.createElement('span');
      check.setAttribute('jq-select-check', '');
      button.appendChild(check);

      const label = document.createElement('span');
      label.setAttribute('jq-select-option-label', '');
      label.textContent = option.label;
      button.appendChild(label);

      const meta = document.createElement('span');
      meta.setAttribute('jq-select-option-meta', '');
      meta.textContent = record.value.includes(option.value) ? 'Selected' : '';
      button.appendChild(meta);

      record.listNode.appendChild(button);
      if (index === record.activeIndex && !option.disabled) {
        [record.trigger, record.searchInput, record.listNode].forEach(node => node.setAttribute('aria-activedescendant', button.id));
      }
    });
  }

  function render(record) {
    record.trigger.disabled = record.options.disabled;
    record.trigger.setAttribute('aria-expanded', String(record.open));
    record.panel.setAttribute('aria-hidden', String(!record.open));
    record.listNode.setAttribute('aria-multiselectable', String(record.options.multiple));
    record.trigger.setAttribute('data-open', record.open ? 'true' : 'false');
    record.clearButton.hidden = !record.options.clearable || record.value.length === 0 || record.options.disabled;
    const atLimit = record.options.multiple && record.options.maxSelections > 0 && record.value.length >= record.options.maxSelections;
    const helperText = atLimit ? record.options.maxSelectionsText : record.options.helperText;
    record.helperNode.textContent = helperText || '';
    record.helperNode.hidden = !helperText;
    record.helperNode.setAttribute('data-tone', atLimit ? 'warning' : 'muted');
    renderValue(record);
    renderOptions(record);
    syncNative(record, false);
    if (record.open) positionPanel(record);
  }

  function positionPanel(record) {
    if (!record.open || record.panel.hidden) return;
    const margin = 8;
    const gap = 8;
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const triggerRect = record.trigger.getBoundingClientRect();
    if (!triggerRect.width || !triggerRect.height || !viewportWidth || !viewportHeight) return;

    const availableWidth = Math.max(0, viewportWidth - margin * 2);
    const width = Math.min(Math.max(triggerRect.width, 220), availableWidth);
    record.panel.style.width = `${width}px`;
    record.panel.style.maxWidth = `${availableWidth}px`;
    record.panel.style.maxHeight = `${Math.max(0, viewportHeight - margin * 2)}px`;

    const panelRect = record.panel.getBoundingClientRect();
    const panelHeight = Math.min(panelRect.height, Math.max(0, viewportHeight - margin * 2));
    const maxLeft = Math.max(margin, viewportWidth - width - margin);
    const left = Math.min(Math.max(triggerRect.left, margin), maxLeft);
    const bottomTop = triggerRect.bottom + gap;
    const topTop = triggerRect.top - panelHeight - gap;
    const canPlaceAbove = topTop >= margin;
    const canPlaceBelow = bottomTop + panelHeight <= viewportHeight - margin;
    let top = bottomTop;
    let placement = 'bottom';

    if (!canPlaceBelow && canPlaceAbove) {
      top = topTop;
      placement = 'top';
    } else {
      top = Math.min(Math.max(top, margin), Math.max(margin, viewportHeight - panelHeight - margin));
    }

    record.panel.style.left = `${left}px`;
    record.panel.style.top = `${top}px`;
    record.panel.dataset.placement = placement;
  }

  function close(record, restoreFocus) {
    cancelSearch(record);
    if (!record.open) return false;
    record.open = false;
    if (record.reposition) {
      window.removeEventListener('resize', record.reposition);
      window.removeEventListener('scroll', record.reposition, true);
      record.reposition = null;
    }
    record.panel.hidden = true;
    record.search = '';
    record.activeIndex = -1;
    record.searchInput.value = '';
    render(record);
    const overlay = record.overlay;
    record.overlay = null;
    if (overlay) {
      if (restoreFocus === false) overlay.update({ returnFocus: false });
      overlay.close('select-close');
    }
    if (runtime.openId === record.id) runtime.openId = null;
    if (typeof record.options.onClose === 'function') record.options.onClose(record.handle);
    return true;
  }

  function open(record) {
    if (record.options.disabled || runtime.instances.get(record.id) !== record) return false;
    if (record.open) return true;
    const manager = JquanUIComponents.overlayManagerApi;
    if (!manager) throw new Error('[JquanUI select] Load overlayManager.js before opening Select.');
    if (runtime.openId && runtime.openId !== record.id) {
      const active = runtime.instances.get(runtime.openId);
      if (active) close(active, false);
    }
    record.open = true;
    record.panel.hidden = false;
    runtime.openId = record.id;
    render(record);
    positionPanel(record);
    record.reposition = () => positionPanel(record);
    window.addEventListener('resize', record.reposition);
    window.addEventListener('scroll', record.reposition, true);
    record.overlay = manager.open({
      element: record.panel, ownerElement: record.source,
      outsideElements: [record.root, record.source], returnFocus: record.trigger,
      trapFocus: false, lockScroll: false, closeOnOutside: true,
      initialFocus: record.options.searchable ? record.searchInput : record.listNode,
      onClose(reason) {
        record.overlay = null;
        if (reason === 'detached') record.handle.destroy();
        else close(record, false);
      }
    });
    if (typeof record.options.onOpen === 'function') record.options.onOpen(record.handle);
    return true;
  }

  function toggle(record) {
    return record.open ? close(record) : open(record);
  }

  function setBehavior(record, option, value) {
    if (typeof value !== 'boolean') return false;
    record.options[option] = value;
    if (option === 'disabled') {
      record.source.disabled = value;
      if (value && record.open) close(record, false);
      // onClose may destroy this instance or mount another one on the same source.
      if (runtime.instances.get(record.id) !== record || record.destroying) return false;
      record.trigger.disabled = value;
    }
    if (option === 'searchable') {
      record.searchInput.hidden = !value;
      if (!value && document.activeElement === record.searchInput) record.listNode.focus();
      if (record.open) positionPanel(record);
    }
    record.clearButton.hidden = !record.options.clearable || record.value.length === 0 || record.options.disabled;
    record.source.dispatchEvent(new CustomEvent('jquan:select:update', {
      bubbles: true, detail: { option, value, instance: record.handle }
    }));
    return runtime.instances.get(record.id) === record && !record.destroying && record.options[option] === value;
  }

  function selectValue(record, nextValue, emit) {
    const option = record.options.options.find(item => item.value === String(nextValue));
    if (!option || option.disabled) return false;
    const value = String(nextValue);
    if (record.options.multiple) {
      const exists = record.value.includes(value);
      if (exists) {
        record.value = record.value.filter(item => item !== value);
      } else {
        if (record.options.maxSelections > 0 && record.value.length >= record.options.maxSelections) return false;
        record.value = record.value.concat(value);
      }
    } else {
      record.value = [value];
    }
    render(record);
    syncNative(record, emit !== false);
    if (emit !== false) emitChange(record);
    if (!record.options.multiple && record.options.closeOnSelect) close(record, false);
    return true;
  }

  function clearValue(record, emit) {
    if (!record.value.length) return true;
    record.value = [];
    render(record);
    syncNative(record, emit !== false);
    if (emit !== false) emitChange(record);
    return true;
  }

  function setValue(record, next, emit) {
    const values = Array.isArray(next) ? next.map(item => String(item)) : (next == null || next === '' ? [] : [String(next)]);
    const allowed = values.filter(value => record.options.options.some(option => option.value === value));
    record.value = record.options.multiple
      ? (record.options.maxSelections > 0 ? allowed.slice(0, record.options.maxSelections) : allowed)
      : allowed.slice(0, 1);
    render(record);
    syncNative(record, emit !== false);
    if (emit !== false) emitChange(record);
    return true;
  }

  function createHandle(id) {
    const owner = runtime.instances.get(id);
    if (!owner) return null;
    if (owner.handle) return owner.handle;
    const live = () => runtime.instances.get(id) === owner && !owner.destroying ? owner : null;
    return owner.handle = {
      id,
      open() {
        const record = live();
        return record ? open(record) : false;
      },
      close() {
        const record = live();
        return record ? close(record) : false;
      },
      toggle() {
        const record = live();
        return record ? toggle(record) : false;
      },
      search(keyword) {
        const record = live();
        if (!record) return false;
        return search(record, keyword);
      },
      select(value) {
        const record = live();
        return record ? selectValue(record, value, true) : false;
      },
      deselect(value) {
        const record = live();
        if (!record) return false;
        record.value = record.value.filter(item => item !== String(value));
        render(record);
        syncNative(record, true);
        emitChange(record);
        return true;
      },
      clear() {
        const record = live();
        return record ? clearValue(record, true) : false;
      },
      setValue(value, emit = true) {
        const record = live();
        return record ? setValue(record, value, emit) : false;
      },
      value() {
        const record = live();
        if (!record) return null;
        return record.options.multiple ? record.value.slice() : (record.value[0] || '');
      },
      values() {
        const record = live();
        return record ? record.value.slice() : [];
      },
      element() {
        const record = live();
        return record ? record.source : null;
      },
      control() {
        const record = live();
        return record ? record.trigger : null;
      },
      state() {
        const record = live();
        if (!record) return null;
        return {
          open: record.open,
          multiple: record.options.multiple,
          values: record.value.slice(),
          search: record.search,
          filteredCount: record.filtered.length,
          requestId: record.requestId, loading: record.loading, destroyed: false,
          disabled: record.options.disabled, searchable: record.options.searchable, clearable: record.options.clearable
        };
      },
      setDisabled(value) {
        const record = live();
        return record ? setBehavior(record, 'disabled', value) : false;
      },
      setSearchable(value) {
        const record = live();
        return record ? setBehavior(record, 'searchable', value) : false;
      },
      setClearable(value) {
        const record = live();
        return record ? setBehavior(record, 'clearable', value) : false;
      },
      update(patch = {}) {
        const record = live();
        if (!record) return null;
        cancelSearch(record);
        record.options = normalizeOptions(Object.assign({}, record.options, patch, {
          options: patch.options || record.options.options
        }));
        if (patch.multiple === false && record.value.length > 1) {
          record.value = record.value.slice(0, 1);
        }
        if (record.options.disabled && record.open) close(record, false);
        record.searchInput.hidden = !record.options.searchable;
        render(record);
        syncNative(record, false);
        return this;
      },
      destroy() {
        const record = live();
        if (!record) return false;
        record.destroying = true;
        cancelSearch(record);
        runtime.instances.delete(id);
        try { close(record, false); }
        finally {
          if (record.cleanup) record.cleanup();
          record.panel.remove();
          record.root.remove();
          record.source.hidden = record.originalHidden;
          record.source.removeAttribute('data-jq-select-source');
        }
        return true;
      }
    };
  }

  function bind(record) {
    const onTriggerClick = event => {
      event.preventDefault();
      toggle(record);
    };

    const onClearClick = event => {
      event.preventDefault();
      event.stopPropagation();
      clearValue(record, true);
    };

    const onSearchInput = () => search(record, record.searchInput.value, record.options.searchDebounce);

    const onPanelClick = event => {
      const optionNode = event.target.closest('[jq-select-option]');
      if (!optionNode || !record.panel.contains(optionNode)) return;
      selectValue(record, optionNode.dataset.value, true);
      if (record.options.multiple) render(record);
    };

    const navigate = (key) => {
      const enabled = record.filtered.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);
      if (!enabled.length) return;
      const current = enabled.indexOf(record.activeIndex);
      const next = key === 'Home' ? 0 : key === 'End' ? enabled.length - 1
        : current < 0 ? (key === 'ArrowUp' ? enabled.length - 1 : 0)
        : (current + (key === 'ArrowUp' ? -1 : 1) + enabled.length) % enabled.length;
      record.activeIndex = enabled[next];
      renderOptions(record);
      record.listNode.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    };
    const onTriggerKeyDown = event => {
      if (record.options.disabled || event.isComposing) return;
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open(record);
        navigate(event.key === 'ArrowUp' ? 'End' : 'Home');
      } else if (event.key === 'Backspace' && record.options.clearable) {
        clearValue(record, true);
      }
    };
    const onSearchKeyDown = event => {
      if (event.isComposing || !record.open) return;
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        navigate(event.key);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const option = record.filtered[record.activeIndex];
        if (option) selectValue(record, option.value, true);
      }
    };

    record.trigger.addEventListener('click', onTriggerClick);
    record.clearButton.addEventListener('click', onClearClick);
    record.searchInput.addEventListener('input', onSearchInput);
    record.panel.addEventListener('keydown', onSearchKeyDown);
    record.trigger.addEventListener('keydown', onTriggerKeyDown);
    record.panel.addEventListener('click', onPanelClick);

    record.cleanup = () => {
      record.trigger.removeEventListener('click', onTriggerClick);
      record.clearButton.removeEventListener('click', onClearClick);
      record.searchInput.removeEventListener('input', onSearchInput);
      record.panel.removeEventListener('keydown', onSearchKeyDown);
      record.trigger.removeEventListener('keydown', onTriggerKeyDown);
      record.panel.removeEventListener('click', onPanelClick);
    };
  }

  function mount(target, inputOptions = {}) {
    injectStyles();
    const source = resolveElement(target);
    if (!(source instanceof HTMLSelectElement)) {
      throw new Error('[JquanUI select] Only native <select> is supported.');
    }

    const existing = resolveInstance(source);
    if (existing) return createHandle(existing.id);

    const options = normalizeOptions(Object.assign({}, {
      multiple: source.multiple,
      disabled: source.disabled,
      placeholder: source.getAttribute('data-placeholder') || defaults.placeholder,
      searchPlaceholder: source.getAttribute('data-search-placeholder') || defaults.searchPlaceholder,
      noResultsText: source.getAttribute('data-empty-text') || defaults.noResultsText,
      helperText: source.getAttribute('data-helper-text') || defaults.helperText,
      maxSelectionsText: source.getAttribute('data-select-max-text') || defaults.maxSelectionsText,
      searchable: source.getAttribute('data-select-searchable') !== 'false',
      clearable: source.getAttribute('data-select-clearable') !== 'false',
      closeOnSelect: source.getAttribute('data-select-close-on-select') !== 'false',
      maxSelections: source.getAttribute('data-select-max'),
      searchDebounce: source.getAttribute('data-select-search-debounce') ?? defaults.searchDebounce,
      options: readElementOptions(source)
    }, inputOptions));

    const id = source.id && !runtime.instances.has(source.id) ? source.id : nextId('jq-select');
    source.id = id;

    const root = document.createElement('div');
    root.setAttribute('jq-select-wrap', '');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.setAttribute('jq-select-trigger', '');
    trigger.id = id + '-trigger';
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-controls', id + '-listbox');
    trigger.setAttribute('aria-label', source.getAttribute('aria-label') || source.labels?.[0]?.textContent || options.placeholder);

    const valueNode = document.createElement('div');
    valueNode.setAttribute('jq-select-value', '');

    const meta = document.createElement('div');
    meta.setAttribute('jq-select-meta', '');

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.setAttribute('jq-select-clear', '');
    clearButton.setAttribute('aria-label', 'Clear selection');
    clearButton.textContent = 'x';

    const arrow = document.createElement('span');
    arrow.setAttribute('jq-select-arrow', '');

    meta.appendChild(clearButton);
    meta.appendChild(arrow);
    trigger.appendChild(valueNode);
    trigger.appendChild(meta);

    const panel = document.createElement('div');
    panel.setAttribute('jq-select-panel', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', trigger.id);
    panel.hidden = true;

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.setAttribute('jq-select-search', '');
    searchInput.placeholder = options.searchPlaceholder;
    searchInput.setAttribute('aria-label', options.searchPlaceholder);
    searchInput.setAttribute('aria-controls', id + '-listbox');
    searchInput.hidden = !options.searchable;

    const listNode = document.createElement('div');
    listNode.setAttribute('jq-select-list', '');
    listNode.id = id + '-listbox';
    listNode.setAttribute('role', 'listbox');
    listNode.setAttribute('aria-labelledby', trigger.id);
    listNode.tabIndex = -1;

    const helperNode = document.createElement('div');
    helperNode.setAttribute('jq-select-helper', '');
    helperNode.hidden = true;

    panel.appendChild(searchInput);
    panel.appendChild(listNode);
    panel.appendChild(helperNode);
    root.appendChild(trigger);

    source.insertAdjacentElement('afterend', root);
    document.body.appendChild(panel);

    const record = {
      id,
      source,
      root,
      trigger,
      valueNode,
      clearButton,
      panel,
      searchInput,
      listNode,
      helperNode,
      options,
      value: readInitialValues(source, options.multiple),
      handle: null, overlay: null, requestId: 0, controller: null, searchTimer: null, loading: false, destroying: false,
      open: false,
      search: '',
      activeIndex: 0,
      filtered: options.options.slice(),
      cleanup: null,
      reposition: null,
      originalHidden: source.hidden
    };

    source.hidden = true;
    source.setAttribute('data-jq-select-source', 'true');
    runtime.instances.set(id, record);
    createHandle(id);
    render(record);
    bind(record);
    return createHandle(id);
  }

  const selectApi = {
    mount(target, options = {}) {
      return mount(target, options);
    },
    get(target) {
      const record = resolveInstance(target);
      return record ? record.handle : null;
    },
    destroy(target) {
      const handle = this.get(target);
      return handle ? handle.destroy() : false;
    }
  };

  JquanUIComponents.selectApi = selectApi;

  JquanUIComponents.select = {
    name: 'jquanui-select',
    version: '1.5.0',
    requires: ['jquanui-overlay-manager'],
    install(api) {
      api.addBehaviors({
        selector: 'select[jq-select], select[data-jq-select]',
        setup(node) {
          const handle = mount(node);
          return () => {
            if (handle) handle.destroy();
          };
        }
      });
    }
  };
})(window);
