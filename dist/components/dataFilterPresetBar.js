(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        presets: [],
        active: '',
        classes: {
            root: 'flex flex-wrap gap-2',
            item: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            itemActive: 'border-primary/20 bg-primary/10 text-primary'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-data-filter-preset-bar-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizePreset(item, index) { return Object.assign({ key: 'preset-' + index, label: 'Preset ' + (index + 1), filters: {} }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:data-filter-preset-bar:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        instance.presets.forEach(function (preset) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.item, instance.active === preset.key && classes.itemActive].filter(Boolean).join(' ');
            button.setAttribute('jq-filter-preset-item', '');
            button.setAttribute('data-key', preset.key);
            button.textContent = preset.label;
            instance.root.appendChild(button);
        });
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-filter-preset-bar-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id,
            root,
            options: merged,
            presets: Array.isArray(merged.presets) ? merged.presets.map(normalizePreset) : [],
            active: merged.active || '',
            state() {
                const current = instance.presets.find(function (item) { return item.key === instance.active; }) || null;
                return { id, active: instance.active, preset: current, presets: clone(instance.presets) };
            }
        };
        const onClick = function (event) {
            const button = event.target.closest('[jq-filter-preset-item]');
            if (!button || !root.contains(button)) return;
            handle.activate(button.getAttribute('data-key'));
        };
        const handle = {
            id,
            activate(key) {
                instance.active = String(key || '');
                render(instance);
                dispatch(instance, 'change', { action: 'activate', key: instance.active });
                return instance.state();
            },
            setPresets(presets) {
                instance.presets = Array.isArray(presets) ? presets.map(normalizePreset) : [];
                if (!instance.presets.some(function (item) { return item.key === instance.active; })) instance.active = '';
                render(instance);
                dispatch(instance, 'change', { action: 'setPresets' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-filter-preset-bar-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-filter-preset-bar-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const dataFilterPresetBarApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-filter-preset-bar-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.dataFilterPresetBarApi = dataFilterPresetBarApi;
    JquanUIComponents.dataFilterPresetBar = {
        name: 'jquanui-data-filter-preset-bar',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-data-filter-preset-bar]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
