(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map(),
        stylesInjected: false,
        openId: null
    };

    const defaults = {
        delimiter: ',',
        maxTags: 0,
        allowDuplicates: false,
        placeholder: 'Add tag',
        suggestions: [],
        suggest: true,
        trim: true,
        maxTagsText: 'Maximum tags reached.',
        duplicateText: 'Duplicate tag ignored.',
        invalidText: 'Invalid tag.',
        validate: null,
        onChange: null,
        onMax: null,
        onInvalid: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-tag-input-${runtime.seed}`;
    }

    function injectStyles() {
        if (runtime.stylesInjected) return;
        runtime.stylesInjected = true;
        const style = document.createElement('style');
        style.id = 'jquanui-tag-input-styles';
        style.textContent = `
[jq-tag-input-wrap]{
  position:relative;
  display:grid;
  gap:8px;
}
[jq-tag-input-control]{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:8px;
  min-height:46px;
  padding:8px 10px;
  border:1px solid rgb(226 232 240 / 1);
  border-radius:14px;
  background:#fff;
  box-shadow:0 1px 2px rgb(15 23 42 / .04);
  transition:border-color .2s ease, box-shadow .2s ease;
}
[jq-tag-input-control][data-focused="true"]{
  border-color:rgb(59 130 246 / 1);
  box-shadow:0 0 0 4px rgb(59 130 246 / .12);
}
[jq-tag-chip]{
  display:inline-flex;
  align-items:center;
  gap:8px;
  max-width:100%;
  min-height:30px;
  padding:0 10px;
  border-radius:999px;
  background:rgb(241 245 249 / 1);
  color:rgb(30 41 59 / 1);
  font-size:12px;
  font-weight:600;
}
[jq-tag-chip-text]{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
[jq-tag-chip-remove]{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:18px;
  height:18px;
  border:0;
  border-radius:999px;
  background:transparent;
  color:rgb(100 116 139 / 1);
  cursor:pointer;
  padding:0;
}
[jq-tag-chip-remove]:hover{
  background:rgb(226 232 240 / 1);
}
[jq-tag-input-field]{
  flex:1 1 140px;
  min-width:120px;
  height:30px;
  border:0;
  background:transparent;
  color:rgb(15 23 42 / 1);
}
[jq-tag-input-field]:focus{
  outline:none;
}
[jq-tag-input-meta]{
  display:flex;
  justify-content:space-between;
  gap:12px;
  color:rgb(100 116 139 / 1);
  font-size:12px;
}
[jq-tag-input-feedback]{
  min-height:18px;
}
[jq-tag-input-counter][data-limit="true"]{
  color:rgb(217 119 6 / 1);
  font-weight:700;
}
[jq-tag-input-panel]{
  position:absolute;
  top:calc(100% + 8px);
  left:0;
  right:0;
  z-index:80;
  display:grid;
  gap:6px;
  padding:8px;
  border:1px solid rgb(226 232 240 / 1);
  border-radius:16px;
  background:#fff;
  box-shadow:0 20px 40px rgb(15 23 42 / .12);
}
[jq-tag-input-panel][hidden]{
  display:none;
}
[jq-tag-input-suggestion]{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  min-height:40px;
  width:100%;
  padding:0 12px;
  border:1px solid transparent;
  border-radius:12px;
  background:transparent;
  color:rgb(15 23 42 / 1);
  text-align:left;
  cursor:pointer;
}
[jq-tag-input-suggestion]:hover,
[jq-tag-input-suggestion][data-active="true"]{
  background:rgb(248 250 252 / 1);
  border-color:rgb(226 232 240 / 1);
}
[jq-tag-input-empty]{
  padding:12px;
  border-radius:12px;
  background:rgb(248 250 252 / 1);
  color:rgb(100 116 139 / 1);
  text-align:center;
  font-size:13px;
}
        `;
        document.head.appendChild(style);
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.maxTags = Math.max(0, Number(merged.maxTags) || 0);
        merged.allowDuplicates = merged.allowDuplicates === true;
        merged.suggest = merged.suggest !== false;
        merged.delimiter = String(merged.delimiter || ',');
        merged.suggestions = Array.isArray(merged.suggestions)
            ? merged.suggestions.map(item => String(item)).filter(Boolean)
            : [];
        return merged;
    }

    function resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        }
        return target instanceof HTMLElement ? target : null;
    }

    function resolveInstance(target) {
        const element = resolveElement(target);
        if (!element) return null;
        if (runtime.instances.has(element.id)) return runtime.instances.get(element.id);
        for (const record of runtime.instances.values()) {
            if (record.source === element || record.root === element || record.root.contains(element)) return record;
        }
        return null;
    }

    function parseSuggestions(source) {
        const raw = source.getAttribute('data-tag-suggestions');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.map(item => String(item));
            } catch (error) {}
        }
        const datalistId = source.getAttribute('list');
        if (!datalistId) return [];
        const datalist = document.getElementById(datalistId);
        if (!datalist) return [];
        return Array.from(datalist.querySelectorAll('option')).map(option => option.value).filter(Boolean);
    }

    function parseInitialTags(source, delimiter) {
        return String(source.value || '')
            .split(delimiter)
            .map(item => item.trim())
            .filter(Boolean);
    }

    function uniqueTags(tags) {
        return Array.from(new Set(tags));
    }

    function syncSource(record, emit) {
        record.source.value = record.tags.join(record.options.delimiter);
        record.source.setAttribute('data-count', String(record.tags.length));
        if (emit !== false) {
            record.source.dispatchEvent(new Event('input', { bubbles: true }));
            record.source.dispatchEvent(new Event('change', { bubbles: true }));
            record.source.dispatchEvent(new CustomEvent('jquan:tag-input:change', {
                bubbles: true,
                detail: {
                    tags: record.tags.slice(),
                    instance: createHandle(record.id)
                }
            }));
        }
    }

    function getFilteredSuggestions(record) {
        const keyword = (record.input.value || '').trim().toLowerCase();
        return record.options.suggestions.filter(item => {
            const value = String(item);
            if (!record.options.allowDuplicates && record.tags.includes(value)) return false;
            return !keyword || value.toLowerCase().includes(keyword);
        });
    }

    function renderSuggestions(record) {
        const list = getFilteredSuggestions(record);
        record.filteredSuggestions = list;
        record.panel.innerHTML = '';
        if (!record.options.suggest || !list.length || !record.focused) {
            record.panel.hidden = true;
            if (runtime.openId === record.id) runtime.openId = null;
            return;
        }
        record.panel.hidden = false;
        runtime.openId = record.id;
        if (record.activeSuggestion >= list.length) record.activeSuggestion = list.length - 1;
        if (record.activeSuggestion < 0) record.activeSuggestion = 0;
        list.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('jq-tag-input-suggestion', '');
            button.dataset.value = item;
            button.dataset.active = index === record.activeSuggestion ? 'true' : 'false';
            button.innerHTML = `<span>${escapeHtml(item)}</span><span>+</span>`;
            record.panel.appendChild(button);
        });
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

    function render(record) {
        record.tagsWrap.innerHTML = '';
        record.tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.setAttribute('jq-tag-chip', '');
            const text = document.createElement('span');
            text.setAttribute('jq-tag-chip-text', '');
            text.textContent = tag;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.setAttribute('jq-tag-chip-remove', '');
            remove.dataset.value = tag;
            remove.textContent = 'x';
            chip.appendChild(text);
            chip.appendChild(remove);
            record.tagsWrap.appendChild(chip);
        });
        record.counter.textContent = record.options.maxTags > 0
            ? `${record.tags.length} / ${record.options.maxTags}`
            : `${record.tags.length} tag(s)`;
        record.counter.setAttribute('data-limit', record.options.maxTags > 0 && record.tags.length >= record.options.maxTags ? 'true' : 'false');
        record.control.setAttribute('data-focused', record.focused ? 'true' : 'false');
        record.input.disabled = record.options.maxTags > 0 && record.tags.length >= record.options.maxTags;
        renderSuggestions(record);
        syncSource(record, false);
    }

    function emitChange(record) {
        if (typeof record.options.onChange === 'function') {
            record.options.onChange(record.tags.slice(), createHandle(record.id));
        }
    }

    function setFeedback(record, message) {
        record.feedback.textContent = message || '';
    }

    function validateTag(record, raw) {
        const tag = record.options.trim ? String(raw || '').trim() : String(raw || '');
        if (!tag) return { ok: false, reason: 'empty' };
        if (!record.options.allowDuplicates && record.tags.includes(tag)) return { ok: false, reason: 'duplicate', value: tag };
        if (record.options.maxTags > 0 && record.tags.length >= record.options.maxTags) return { ok: false, reason: 'max', value: tag };
        if (typeof record.options.validate === 'function') {
            const result = record.options.validate(tag, record.tags.slice());
            if (result === false) return { ok: false, reason: 'invalid', value: tag };
            if (typeof result === 'string') return { ok: false, reason: 'invalid', value: tag, message: result };
        }
        return { ok: true, value: tag };
    }

    function addTag(record, raw, emit) {
        const result = validateTag(record, raw);
        if (!result.ok) {
            if (result.reason === 'max' && typeof record.options.onMax === 'function') record.options.onMax(result.value, createHandle(record.id));
            if (result.reason === 'invalid' && typeof record.options.onInvalid === 'function') record.options.onInvalid(result.value, result.message || result.reason, createHandle(record.id));
            setFeedback(record, result.message || (
                result.reason === 'max' ? record.options.maxTagsText :
                result.reason === 'duplicate' ? record.options.duplicateText :
                result.reason === 'invalid' ? record.options.invalidText : ''
            ));
            return false;
        }
        record.tags.push(result.value);
        record.input.value = '';
        setFeedback(record, '');
        render(record);
        syncSource(record, emit !== false);
        if (emit !== false) emitChange(record);
        return true;
    }

    function removeTag(record, value, emit) {
        const next = record.tags.filter(tag => tag !== String(value));
        if (next.length === record.tags.length) return false;
        record.tags = next;
        setFeedback(record, '');
        render(record);
        syncSource(record, emit !== false);
        if (emit !== false) emitChange(record);
        return true;
    }

    function splitInputValues(record, text) {
        return String(text || '')
            .split(/[,\n;]/g)
            .map(item => record.options.trim ? item.trim() : item)
            .filter(Boolean);
    }

    function createHandle(id) {
        return {
            id,
            add(tag) {
                const record = runtime.instances.get(id);
                return record ? addTag(record, tag, true) : false;
            },
            remove(tag) {
                const record = runtime.instances.get(id);
                return record ? removeTag(record, tag, true) : false;
            },
            clear() {
                const record = runtime.instances.get(id);
                if (!record) return false;
                record.tags = [];
                render(record);
                syncSource(record, true);
                emitChange(record);
                return true;
            },
            setTags(tags, emit = true) {
                const record = runtime.instances.get(id);
                if (!record) return false;
                const next = Array.isArray(tags) ? tags.map(item => String(item)).filter(Boolean) : [];
                record.tags = record.options.allowDuplicates ? next : uniqueTags(next);
                if (record.options.maxTags > 0) record.tags = record.tags.slice(0, record.options.maxTags);
                render(record);
                syncSource(record, emit);
                if (emit) emitChange(record);
                return true;
            },
            tags() {
                const record = runtime.instances.get(id);
                return record ? record.tags.slice() : [];
            },
            focus() {
                const record = runtime.instances.get(id);
                if (!record) return false;
                record.input.focus();
                return true;
            },
            state() {
                const record = runtime.instances.get(id);
                if (!record) return null;
                return {
                    tags: record.tags.slice(),
                    maxTags: record.options.maxTags,
                    remaining: record.options.maxTags > 0 ? Math.max(0, record.options.maxTags - record.tags.length) : null,
                    focused: record.focused
                };
            },
            update(patch = {}) {
                const record = runtime.instances.get(id);
                if (!record) return null;
                record.options = normalizeOptions(Object.assign({}, record.options, patch));
                if (!record.options.allowDuplicates) record.tags = uniqueTags(record.tags);
                if (record.options.maxTags > 0) record.tags = record.tags.slice(0, record.options.maxTags);
                render(record);
                syncSource(record, false);
                return this;
            },
            destroy() {
                const record = runtime.instances.get(id);
                if (!record) return false;
                if (record.cleanup) record.cleanup();
                record.root.remove();
                record.source.hidden = record.originalHidden;
                runtime.instances.delete(id);
                return true;
            }
        };
    }

    function bind(record) {
        const onFocusIn = () => {
            record.focused = true;
            render(record);
        };

        const onFocusOut = event => {
            if (record.root.contains(event.relatedTarget)) return;
            record.focused = false;
            record.activeSuggestion = -1;
            render(record);
        };

        const onKeyDown = event => {
            if ((event.key === 'Enter' || event.key === ',') && record.input.value.trim()) {
                event.preventDefault();
                addTag(record, record.input.value, true);
                return;
            }
            if (event.key === 'Backspace' && !record.input.value && record.tags.length) {
                removeTag(record, record.tags[record.tags.length - 1], true);
                return;
            }
            if (event.key === 'ArrowDown') {
                if (!record.filteredSuggestions.length) return;
                event.preventDefault();
                record.activeSuggestion = record.activeSuggestion < record.filteredSuggestions.length - 1 ? record.activeSuggestion + 1 : 0;
                renderSuggestions(record);
                return;
            }
            if (event.key === 'ArrowUp') {
                if (!record.filteredSuggestions.length) return;
                event.preventDefault();
                record.activeSuggestion = record.activeSuggestion > 0 ? record.activeSuggestion - 1 : record.filteredSuggestions.length - 1;
                renderSuggestions(record);
                return;
            }
            if (event.key === 'Escape') {
                record.activeSuggestion = -1;
                renderSuggestions(record);
                return;
            }
            if (event.key === 'Enter' && record.filteredSuggestions[record.activeSuggestion]) {
                event.preventDefault();
                addTag(record, record.filteredSuggestions[record.activeSuggestion], true);
            }
        };

        const onInput = () => {
            setFeedback(record, '');
            renderSuggestions(record);
        };

        const onPaste = event => {
            const text = event.clipboardData?.getData('text');
            if (!text || !/[,\n;]/.test(text)) return;
            event.preventDefault();
            splitInputValues(record, text).forEach(item => addTag(record, item, false));
            render(record);
            syncSource(record, true);
            emitChange(record);
        };

        const onClick = event => {
            const removeButton = event.target.closest('[jq-tag-chip-remove]');
            if (removeButton) {
                removeTag(record, removeButton.dataset.value, true);
                return;
            }
            const suggestion = event.target.closest('[jq-tag-input-suggestion]');
            if (suggestion) {
                addTag(record, suggestion.dataset.value, true);
                return;
            }
            record.input.focus();
        };

        const onDocumentPointerDown = event => {
            if (!record.root.contains(event.target)) {
                record.focused = false;
                record.activeSuggestion = -1;
                render(record);
            }
        };

        record.root.addEventListener('focusin', onFocusIn);
        record.root.addEventListener('focusout', onFocusOut);
        record.input.addEventListener('keydown', onKeyDown);
        record.input.addEventListener('input', onInput);
        record.input.addEventListener('paste', onPaste);
        record.root.addEventListener('click', onClick);
        document.addEventListener('pointerdown', onDocumentPointerDown, true);

        record.cleanup = () => {
            record.root.removeEventListener('focusin', onFocusIn);
            record.root.removeEventListener('focusout', onFocusOut);
            record.input.removeEventListener('keydown', onKeyDown);
            record.input.removeEventListener('input', onInput);
            record.input.removeEventListener('paste', onPaste);
            record.root.removeEventListener('click', onClick);
            document.removeEventListener('pointerdown', onDocumentPointerDown, true);
        };
    }

    function mount(target, inputOptions = {}) {
        injectStyles();
        const source = resolveElement(target);
        if (!(source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement)) {
            throw new Error('[JquanUI tagInput] Only input or textarea is supported.');
        }

        const existing = resolveInstance(source);
        if (existing) return createHandle(existing.id);

        const options = normalizeOptions(Object.assign({}, {
            maxTags: source.getAttribute('data-tag-max'),
            placeholder: source.getAttribute('placeholder') || defaults.placeholder,
            suggestions: parseSuggestions(source),
            allowDuplicates: source.getAttribute('data-tag-duplicates') === 'true',
            suggest: source.getAttribute('data-tag-suggest') !== 'false'
        }, inputOptions));

        const id = source.id || nextId();
        source.id = id;

        const root = document.createElement('div');
        root.setAttribute('jq-tag-input-wrap', '');

        const control = document.createElement('div');
        control.setAttribute('jq-tag-input-control', '');

        const tagsWrap = document.createElement('div');
        tagsWrap.style.display = 'contents';

        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('jq-tag-input-field', '');
        input.placeholder = options.placeholder;

        control.appendChild(tagsWrap);
        control.appendChild(input);

        const meta = document.createElement('div');
        meta.setAttribute('jq-tag-input-meta', '');

        const feedback = document.createElement('div');
        feedback.setAttribute('jq-tag-input-feedback', '');

        const counter = document.createElement('div');
        counter.setAttribute('jq-tag-input-counter', '');

        meta.appendChild(feedback);
        meta.appendChild(counter);

        const panel = document.createElement('div');
        panel.setAttribute('jq-tag-input-panel', '');
        panel.hidden = true;

        root.appendChild(control);
        root.appendChild(meta);
        root.appendChild(panel);
        source.insertAdjacentElement('afterend', root);

        const record = {
            id,
            source,
            root,
            control,
            tagsWrap,
            input,
            feedback,
            counter,
            panel,
            options,
            tags: options.allowDuplicates ? parseInitialTags(source, options.delimiter) : uniqueTags(parseInitialTags(source, options.delimiter)),
            focused: false,
            activeSuggestion: -1,
            filteredSuggestions: [],
            cleanup: null,
            originalHidden: source.hidden
        };

        if (record.options.maxTags > 0) {
            record.tags = record.tags.slice(0, record.options.maxTags);
        }

        source.hidden = true;
        runtime.instances.set(id, record);
        render(record);
        bind(record);
        return createHandle(id);
    }

    const tagInputApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(target) {
            const record = resolveInstance(target);
            return record ? createHandle(record.id) : null;
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        }
    };

    JquanUIComponents.tagInputApi = tagInputApi;

    JquanUIComponents.tagInput = {
        name: 'jquanui-tag-input',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: 'input[jq-tag-input], textarea[jq-tag-input], input[data-jq-tag-input], textarea[data-jq-tag-input]',
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
