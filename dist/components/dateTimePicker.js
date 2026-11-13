(function (global) {
    const components = global.JquanUIComponents || (global.JquanUIComponents = {});
    const runtime = { seed: 0, instances: new Map(), openId: null, stylesInjected: false };
    const defaults = {
        mode: 'date',
        placeholder: 'Select date',
        minuteStep: 5,
        clearable: true,
        disabled: false,
        min: '',
        max: '',
        locale: 'en-US',
        onChange: null,
        onOpen: null,
        onClose: null
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-date-time-picker-' + runtime.seed;
    }

    function resolveElement(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function dateKey(value) {
        return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
    }

    function parseValue(value, mode) {
        const text = String(value || '').trim();
        if (!text) return null;
        if (mode === 'time') {
            const timeMatch = text.match(/^(\d{2}):(\d{2})/);
            if (!timeMatch) return null;
            const time = new Date();
            time.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
            return time;
        }
        const dateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s)?(\d{2})?:?(\d{2})?/);
        if (!dateMatch) return null;
        const result = new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]));
        if (mode === 'datetime' && dateMatch[4] != null) result.setHours(Number(dateMatch[4]), Number(dateMatch[5] || 0), 0, 0);
        return Number.isNaN(result.getTime()) ? null : result;
    }

    function formatValue(value, mode) {
        if (!value) return '';
        const date = dateKey(value);
        if (mode === 'time') return pad(value.getHours()) + ':' + pad(value.getMinutes());
        return mode === 'datetime' ? date + 'T' + pad(value.getHours()) + ':' + pad(value.getMinutes()) : date;
    }

    function formatDisplay(value, mode, locale) {
        if (!value) return '';
        if (mode === 'time') return pad(value.getHours()) + ':' + pad(value.getMinutes());
        const date = value.toLocaleDateString(locale || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return mode === 'datetime' ? date + ' · ' + pad(value.getHours()) + ':' + pad(value.getMinutes()) : date;
    }

    function monthLabel(value, locale) {
        return value.toLocaleDateString(locale || 'en-US', { month: 'long', year: 'numeric' });
    }

    function injectStyles() {
        if (runtime.stylesInjected) return;
        runtime.stylesInjected = true;
        const style = document.createElement('style');
        style.id = 'jquanui-date-time-picker-styles';
        style.textContent = `
[jq-dtp-wrap]{position:relative;display:grid;gap:8px;width:100%}
[jq-dtp-source]{display:none!important}
[jq-dtp-trigger]{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;width:100%;padding:0 14px;border:1px solid rgb(226 232 240);border-radius:12px;background:#fff;color:rgb(30 41 59);cursor:pointer;text-align:left;transition:border-color .2s ease,box-shadow .2s ease,background-color .2s ease}
[jq-dtp-trigger]:hover,[jq-dtp-trigger][data-open="true"]{border-color:rgb(89 107 232);background:#fff;box-shadow:0 0 0 4px rgb(89 107 232 / .12)}
[jq-dtp-trigger]:focus-visible{outline:none;border-color:rgb(89 107 232);box-shadow:0 0 0 4px rgb(89 107 232 / .14)}
[jq-dtp-trigger][disabled]{cursor:not-allowed;background:rgb(248 250 252);color:rgb(148 163 184)}
[jq-dtp-value]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[jq-dtp-placeholder]{color:rgb(148 163 184)}
[jq-dtp-meta]{display:flex;align-items:center;gap:10px;flex-shrink:0;color:rgb(100 116 139)}
[jq-dtp-clear]{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:0;border-radius:999px;background:transparent;color:inherit;cursor:pointer}
[jq-dtp-clear]:hover{background:rgb(89 107 232 / .1);color:rgb(89 107 232)}
[jq-dtp-arrow]{width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin-top:-4px}
[jq-dtp-panel]{position:absolute;top:calc(100% + 10px);left:0;z-index:90;display:grid;gap:14px;width:min(100%,390px);padding:16px;border:1px solid rgb(231 234 246);border-radius:18px;background:rgb(255 255 255 / .98);box-shadow:0 22px 55px rgb(68 77 146 / .18);backdrop-filter:blur(18px)}
[jq-dtp-panel][hidden]{display:none}
[jq-dtp-header]{display:flex;align-items:center;justify-content:space-between;gap:10px}
[jq-dtp-heading]{min-width:0;font-size:14px;font-weight:800;color:rgb(48 54 111)}
[jq-dtp-nav]{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid rgb(231 234 246);border-radius:10px;background:rgb(247 250 255);color:rgb(89 107 232);cursor:pointer}
[jq-dtp-nav]:hover{border-color:rgb(89 107 232 / .35);background:rgb(89 107 232 / .08)}
[jq-dtp-panel][data-mode="time"] [jq-dtp-nav]{visibility:hidden}
[jq-dtp-calendar]{display:grid;gap:8px}
[jq-dtp-weekdays],[jq-dtp-calendar-grid]{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
[jq-dtp-weekday]{padding:4px 0;color:rgb(174 181 209);font-size:10px;font-weight:800;text-align:center;text-transform:uppercase}
[jq-dtp-day]{display:grid;place-items:center;min-height:34px;border:1px solid transparent;border-radius:10px;background:transparent;color:rgb(48 54 111);font-size:12px;font-weight:700;cursor:pointer}
[jq-dtp-day]:hover{border-color:rgb(89 107 232 / .22);background:rgb(89 107 232 / .07)}
[jq-dtp-day][data-muted="true"]{color:rgb(174 181 209)}
[jq-dtp-day][data-today="true"]{border-color:rgb(100 200 255 / .5)}
[jq-dtp-day][data-selected="true"]{border-color:rgb(89 107 232);background:rgb(89 107 232);color:#fff;box-shadow:0 8px 18px rgb(86 103 214 / .18)}
[jq-dtp-day][disabled]{cursor:not-allowed;opacity:.35}
[jq-dtp-time]{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:2px}
[jq-dtp-time-column]{display:grid;gap:6px;max-height:176px;overflow:auto;padding:4px;border:1px solid rgb(231 234 246);border-radius:12px;background:rgb(247 250 255 / .7)}
[jq-dtp-time-label]{padding:2px 8px;color:rgb(116 123 168);font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
[jq-dtp-time-option]{min-height:32px;border:1px solid transparent;border-radius:9px;background:transparent;color:rgb(48 54 111);font-size:12px;font-weight:800;cursor:pointer}
[jq-dtp-time-option]:hover{background:rgb(89 107 232 / .08)}
[jq-dtp-time-option][data-selected="true"]{border-color:rgb(89 107 232 / .2);background:rgb(89 107 232);color:#fff}
[jq-dtp-footer]{display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid rgb(231 234 246);padding-top:12px}
[jq-dtp-actions]{display:flex;gap:8px}
[jq-dtp-action]{min-height:34px;padding:0 11px;border:1px solid rgb(231 232 246);border-radius:10px;background:#fff;color:rgb(48 54 111);font-size:12px;font-weight:800;cursor:pointer}
[jq-dtp-action]:hover{border-color:rgb(89 107 232 / .35);background:rgb(89 107 232 / .06);color:rgb(89 107 232)}
[jq-dtp-action][data-primary="true"]{border-color:rgb(89 107 232);background:rgb(89 107 232);color:#fff}
`;
        document.head.appendChild(style);
    }

    function normalizeOptions(source, inputOptions) {
        const type = source.getAttribute('data-date-time-mode') || source.getAttribute('data-dtp-mode') || source.type;
        const mode = type === 'datetime-local' || type === 'datetime' ? 'datetime' : type === 'time' ? 'time' : 'date';
        const options = Object.assign({}, defaults, {
            mode,
            placeholder: source.getAttribute('data-placeholder') || defaults.placeholder,
            minuteStep: source.getAttribute('data-minute-step') || defaults.minuteStep,
            clearable: source.getAttribute('data-clearable') !== 'false',
            disabled: source.disabled,
            min: source.getAttribute('min') || '',
            max: source.getAttribute('max') || '',
            locale: source.getAttribute('data-locale') || defaults.locale
        }, inputOptions || {});
        options.minuteStep = Math.min(60, Math.max(1, Number(options.minuteStep) || 5));
        return options;
    }

    function isAllowed(record, value) {
        if (!value) return true;
        const current = formatValue(value, record.options.mode);
        if (record.options.min && current < record.options.min) return false;
        if (record.options.max && current > record.options.max) return false;
        return true;
    }

    function renderDayGrid(record) {
        const cursor = record.viewDate;
        const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const start = new Date(first);
        start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
        const selected = record.draftValue ? dateKey(record.draftValue) : '';
        const today = dateKey(new Date());
        record.grid.innerHTML = '';
        for (let index = 0; index < 42; index += 1) {
            const value = new Date(start);
            value.setDate(start.getDate() + index);
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('jq-dtp-day', '');
            button.dataset.date = dateKey(value);
            button.dataset.muted = value.getMonth() === cursor.getMonth() ? 'false' : 'true';
            button.dataset.today = dateKey(value) === today ? 'true' : 'false';
            button.dataset.selected = dateKey(value) === selected ? 'true' : 'false';
            button.disabled = !isAllowed(record, value);
            button.textContent = String(value.getDate());
            record.grid.appendChild(button);
        }
        record.heading.textContent = monthLabel(cursor, record.options.locale);
    }

    function renderTime(record) {
        if (!record.time) return;
        const value = record.draftValue || new Date();
        record.hours.innerHTML = '<div jq-dtp-time-label>Hour</div>';
        record.minutes.innerHTML = '<div jq-dtp-time-label>Minute</div>';
        for (let hour = 0; hour < 24; hour += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('jq-dtp-time-option', '');
            button.dataset.part = 'hour';
            button.dataset.value = String(hour);
            button.dataset.selected = value.getHours() === hour ? 'true' : 'false';
            button.textContent = pad(hour);
            record.hours.appendChild(button);
        }
        for (let minute = 0; minute < 60; minute += record.options.minuteStep) {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('jq-dtp-time-option', '');
            button.dataset.part = 'minute';
            button.dataset.value = String(minute);
            button.dataset.selected = value.getMinutes() - (value.getMinutes() % record.options.minuteStep) === minute ? 'true' : 'false';
            button.textContent = pad(minute);
            record.minutes.appendChild(button);
        }
    }

    function render(record) {
        record.trigger.dataset.open = record.open ? 'true' : 'false';
        record.trigger.disabled = record.options.disabled;
        record.clear.hidden = !record.options.clearable || !record.value || record.options.disabled;
        record.valueNode.textContent = '';
        if (record.value) record.valueNode.textContent = formatDisplay(record.value, record.options.mode, record.options.locale);
        else {
            const placeholder = document.createElement('span');
            placeholder.setAttribute('jq-dtp-placeholder', '');
            placeholder.textContent = record.options.placeholder;
            record.valueNode.appendChild(placeholder);
        }
        record.panel.hidden = !record.open;
        record.panel.dataset.mode = record.options.mode;
        record.heading.textContent = record.options.mode === 'time'
            ? 'Select time'
            : monthLabel(record.viewDate, record.options.locale);
        if (record.grid) renderDayGrid(record);
        if (record.time) renderTime(record);
    }

    function emitChange(record, value) {
        record.source.value = formatValue(value, record.options.mode);
        record.source.dispatchEvent(new Event('input', { bubbles: true }));
        record.source.dispatchEvent(new Event('change', { bubbles: true }));
        record.source.dispatchEvent(new CustomEvent('jquan:date-time-picker:change', {
            bubbles: true,
            detail: { value: record.source.value, date: value ? new Date(value) : null, mode: record.options.mode, instance: createHandle(record.id) }
        }));
        if (typeof record.options.onChange === 'function') record.options.onChange(record.source.value, createHandle(record.id));
    }

    function close(record, restoreFocus) {
        if (!record.open) return false;
        record.open = false;
        record.draftValue = record.value ? new Date(record.value) : null;
        if (runtime.openId === record.id) runtime.openId = null;
        render(record);
        if (restoreFocus !== false) record.trigger.focus();
        if (typeof record.options.onClose === 'function') record.options.onClose(createHandle(record.id));
        return true;
    }

    function open(record) {
        if (record.options.disabled) return false;
        if (runtime.openId && runtime.openId !== record.id) {
            const current = runtime.instances.get(runtime.openId);
            if (current) close(current, false);
        }
        record.open = true;
        record.draftValue = record.value ? new Date(record.value) : new Date();
        if (record.options.mode === 'time') record.draftValue.setSeconds(0, 0);
        record.viewDate = new Date(record.draftValue);
        runtime.openId = record.id;
        render(record);
        if (typeof record.options.onOpen === 'function') record.options.onOpen(createHandle(record.id));
        return true;
    }

    function commit(record, value) {
        if (value && !isAllowed(record, value)) return false;
        record.value = value ? new Date(value) : null;
        emitChange(record, record.value);
        render(record);
        return true;
    }

    function selectDay(record, value) {
        const parts = String(value).split('-').map(Number);
        const base = record.draftValue || new Date();
        const next = new Date(parts[0], parts[1] - 1, parts[2], base.getHours(), base.getMinutes(), 0, 0);
        if (!isAllowed(record, next)) return;
        record.draftValue = next;
        if (record.options.mode === 'date') {
            commit(record, next);
            close(record, false);
        } else render(record);
    }

    function createHandle(id) {
        return {
            id,
            open() { const record = runtime.instances.get(id); return record ? open(record) : false; },
            close() { const record = runtime.instances.get(id); return record ? close(record) : false; },
            clear() {
                const record = runtime.instances.get(id);
                if (!record) return false;
                commit(record, null);
                return true;
            },
            setValue(value, emit = true) {
                const record = runtime.instances.get(id);
                if (!record) return false;
                const next = value instanceof Date ? new Date(value) : parseValue(value, record.options.mode);
                if (next && !isAllowed(record, next)) return false;
                record.value = next;
                if (emit) emitChange(record, next);
                render(record);
                return true;
            },
            value() { const record = runtime.instances.get(id); return record ? record.source.value : ''; },
            state() {
                const record = runtime.instances.get(id);
                return record ? { open: record.open, mode: record.options.mode, value: record.source.value, draftValue: formatValue(record.draftValue, record.options.mode) } : null;
            },
            destroy() {
                const record = runtime.instances.get(id);
                if (!record) return false;
                record.cleanup();
                record.root.remove();
                record.source.hidden = record.originalHidden;
                record.source.removeAttribute('data-jq-date-time-picker-source');
                runtime.instances.delete(id);
                return true;
            }
        };
    }

    function mount(target, inputOptions) {
        injectStyles();
        const source = resolveElement(target);
        if (!source || !(source instanceof HTMLInputElement)) throw new Error('[JquanUI dateTimePicker] Only input is supported.');
        const existing = Array.from(runtime.instances.values()).find(record => record.source === source);
        if (existing) return createHandle(existing.id);
        const options = normalizeOptions(source, inputOptions);
        const id = source.id || nextId();
        source.id = id;
        const originalHidden = source.hidden;
        const root = document.createElement('div');
        root.setAttribute('jq-dtp-wrap', '');
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.setAttribute('jq-dtp-trigger', '');
        trigger.setAttribute('aria-haspopup', 'dialog');
        const valueNode = document.createElement('span');
        valueNode.setAttribute('jq-dtp-value', '');
        const meta = document.createElement('span');
        meta.setAttribute('jq-dtp-meta', '');
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.setAttribute('jq-dtp-clear', '');
        clear.setAttribute('aria-label', 'Clear date or time');
        clear.textContent = 'x';
        const icon = document.createElement('i');
        icon.className = 'ph ph-calendar-blank';
        const arrow = document.createElement('span');
        arrow.setAttribute('jq-dtp-arrow', '');
        meta.appendChild(clear);
        meta.appendChild(icon);
        meta.appendChild(arrow);
        trigger.appendChild(valueNode);
        trigger.appendChild(meta);

        const panel = document.createElement('div');
        panel.setAttribute('jq-dtp-panel', '');
        panel.dataset.mode = options.mode;
        panel.setAttribute('role', 'dialog');
        const header = document.createElement('div');
        header.setAttribute('jq-dtp-header', '');
        const previous = document.createElement('button');
        previous.type = 'button';
        previous.setAttribute('jq-dtp-nav', '');
        previous.dataset.direction = 'previous';
        previous.setAttribute('aria-label', 'Previous month');
        previous.textContent = '<';
        const heading = document.createElement('strong');
        heading.setAttribute('jq-dtp-heading', '');
        const next = document.createElement('button');
        next.type = 'button';
        next.setAttribute('jq-dtp-nav', '');
        next.dataset.direction = 'next';
        next.setAttribute('aria-label', 'Next month');
        next.textContent = '>';
        header.append(previous, heading, next);
        panel.appendChild(header);

        let grid = null;
        if (options.mode !== 'time') {
            const calendar = document.createElement('div');
            calendar.setAttribute('jq-dtp-calendar', '');
            const weekdays = document.createElement('div');
            weekdays.setAttribute('jq-dtp-weekdays', '');
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
                const label = document.createElement('span');
                label.setAttribute('jq-dtp-weekday', '');
                label.textContent = day;
                weekdays.appendChild(label);
            });
            grid = document.createElement('div');
            grid.setAttribute('jq-dtp-calendar-grid', '');
            calendar.append(weekdays, grid);
            panel.appendChild(calendar);
        }

        let time = null;
        let hours = null;
        let minutes = null;
        if (options.mode !== 'date') {
            time = document.createElement('div');
            time.setAttribute('jq-dtp-time', '');
            hours = document.createElement('div');
            hours.setAttribute('jq-dtp-time-column', '');
            minutes = document.createElement('div');
            minutes.setAttribute('jq-dtp-time-column', '');
            time.append(hours, minutes);
            panel.appendChild(time);
        }

        const footer = document.createElement('div');
        footer.setAttribute('jq-dtp-footer', '');
        const today = document.createElement('button');
        today.type = 'button';
        today.setAttribute('jq-dtp-action', '');
        today.dataset.action = 'today';
        today.textContent = options.mode === 'time' ? 'Now' : 'Today';
        const actions = document.createElement('div');
        actions.setAttribute('jq-dtp-actions', '');
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.setAttribute('jq-dtp-action', '');
        cancel.dataset.action = 'cancel';
        cancel.textContent = 'Cancel';
        const apply = document.createElement('button');
        apply.type = 'button';
        apply.setAttribute('jq-dtp-action', '');
        apply.dataset.action = 'apply';
        apply.dataset.primary = 'true';
        apply.textContent = 'Apply';
        actions.append(cancel, apply);
        footer.append(today, actions);
        panel.appendChild(footer);

        root.append(trigger, panel);
        source.insertAdjacentElement('afterend', root);
        source.hidden = true;
        source.setAttribute('data-jq-date-time-picker-source', 'true');

        const initial = parseValue(source.value, options.mode);
        const record = {
            id, source, root, trigger, valueNode, clear, panel, heading, grid, time, hours, minutes,
            options, value: initial, draftValue: initial ? new Date(initial) : null,
            viewDate: initial ? new Date(initial) : new Date(), open: false, originalHidden, cleanup: null
        };

        const onClick = function (event) {
            const clearButton = event.target.closest('[jq-dtp-clear]');
            if (clearButton) {
                event.stopPropagation();
                commit(record, null);
                close(record, false);
                return;
            }
            const day = event.target.closest('[jq-dtp-day]');
            if (day && !day.disabled) selectDay(record, day.dataset.date);
            const option = event.target.closest('[jq-dtp-time-option]');
            if (option && record.draftValue) {
                const nextValue = new Date(record.draftValue);
                if (option.dataset.part === 'hour') nextValue.setHours(Number(option.dataset.value));
                else nextValue.setMinutes(Number(option.dataset.value));
                record.draftValue = nextValue;
                render(record);
            }
            const nav = event.target.closest('[jq-dtp-nav]');
            if (nav && record.options.mode !== 'time') {
                record.viewDate.setMonth(record.viewDate.getMonth() + (nav.dataset.direction === 'next' ? 1 : -1));
                render(record);
            }
            const action = event.target.closest('[jq-dtp-action]');
            if (action) {
                if (action.dataset.action === 'today') {
                    const now = new Date();
                    record.draftValue = record.options.mode === 'time'
                        ? now
                        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), record.draftValue?.getHours() || 0, record.draftValue?.getMinutes() || 0);
                    record.viewDate = new Date(record.draftValue);
                    render(record);
                }
                if (action.dataset.action === 'cancel') close(record);
                if (action.dataset.action === 'apply') {
                    if (record.draftValue && isAllowed(record, record.draftValue)) commit(record, record.draftValue);
                    close(record);
                }
            }
            if (event.target.closest('[jq-dtp-trigger]')) open(record);
        };
        const onKeyDown = function (event) {
            if (event.key === 'Escape') close(record);
            if (event.key === 'Enter' && document.activeElement === trigger) open(record);
        };
        const onDocumentPointerDown = function (event) {
            if (record.open && !root.contains(event.target)) close(record);
        };
        root.addEventListener('click', onClick);
        root.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onDocumentPointerDown, true);
        record.cleanup = function () {
            root.removeEventListener('click', onClick);
            root.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onDocumentPointerDown, true);
        };
        runtime.instances.set(id, record);
        render(record);
        return createHandle(id);
    }

    components.dateTimePickerApi = {
        mount,
        get(target) {
            const source = resolveElement(target);
            const record = Array.from(runtime.instances.values()).find(item => item.source === source || item.root === source);
            return record ? createHandle(record.id) : null;
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        }
    };

    components.dateTimePicker = {
        name: 'jquanui-date-time-picker',
        version: '1.0.0',
        requires: [],
        install(ui) {
            ui.addBehaviors({
                selector: 'input[jq-date-time-picker], input[data-jq-date-time-picker], input[data-jq-datetime]',
                setup(node) {
                    const handle = mount(node);
                    return () => handle && handle.destroy();
                }
            });
        }
    };
})(window);
