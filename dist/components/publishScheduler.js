(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        value: '',
        timezone: 'Asia/Shanghai',
        status: 'draft',
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            row: 'grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_160px]',
            control: uiPreset.classes.control || 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            meta: 'grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4',
            title: 'text-sm font-semibold text-slate-800',
            text: 'text-sm text-slate-600',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-publish-scheduler-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:publish-scheduler:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        const surface = document.createElement('section');
        surface.className = classes.surface;
        const row = document.createElement('div');
        row.className = classes.row;
        const date = document.createElement('input');
        date.type = 'datetime-local';
        date.className = classes.control;
        date.value = instance.value;
        date.setAttribute('jq-publish-scheduler-date', '');
        const timezone = document.createElement('input');
        timezone.className = classes.control;
        timezone.value = instance.timezone;
        timezone.setAttribute('jq-publish-scheduler-timezone', '');
        const status = document.createElement('select');
        status.className = classes.control;
        status.setAttribute('jq-publish-scheduler-status', '');
        ['draft', 'scheduled', 'published'].forEach(function (item) {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            option.selected = item === instance.status;
            status.appendChild(option);
        });
        row.appendChild(date);
        row.appendChild(timezone);
        row.appendChild(status);
        surface.appendChild(row);
        const actions = document.createElement('div');
        actions.className = 'flex flex-wrap gap-2';
        const apply = document.createElement('button');
        apply.type = 'button';
        apply.className = classes.action;
        apply.textContent = 'Apply';
        apply.setAttribute('jq-publish-scheduler-apply', '');
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = classes.action;
        clear.textContent = 'Clear';
        clear.setAttribute('jq-publish-scheduler-clear', '');
        actions.appendChild(apply);
        actions.appendChild(clear);
        surface.appendChild(actions);
        const meta = document.createElement('div');
        meta.className = classes.meta;
        meta.innerHTML = '<div class="' + classes.title + '">Schedule Summary</div><div class="' + classes.text + '">' +
            (instance.value ? ('Publish at ' + instance.value + ' (' + instance.timezone + ')') : 'No publish time selected') +
            '</div><div class="' + classes.text + '">Status: ' + instance.status + '</div>';
        surface.appendChild(meta);
        root.appendChild(surface);
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-publish-scheduler-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            value: merged.value || '',
            timezone: merged.timezone || 'Asia/Shanghai',
            status: merged.status || 'draft',
            state() { return { id: id, value: instance.value, timezone: instance.timezone, status: instance.status, payload: { publishAt: instance.value, timezone: instance.timezone, status: instance.status } }; }
        };
        const onClick = function (event) {
            const apply = event.target.closest('[jq-publish-scheduler-apply]');
            if (apply && root.contains(apply)) {
                dispatch(instance, 'change', { action: 'apply' });
                return;
            }
            const clear = event.target.closest('[jq-publish-scheduler-clear]');
            if (clear && root.contains(clear)) {
                handle.clear();
            }
        };
        const onInput = function (event) {
            const targetNode = event.target;
            if (targetNode.hasAttribute('jq-publish-scheduler-date')) instance.value = targetNode.value || '';
            if (targetNode.hasAttribute('jq-publish-scheduler-timezone')) instance.timezone = targetNode.value || '';
            if (targetNode.hasAttribute('jq-publish-scheduler-status')) instance.status = targetNode.value || 'draft';
            render(instance);
            dispatch(instance, 'change', { action: 'edit' });
        };
        const handle = {
            id: id,
            setValue(payload) {
                instance.value = payload?.value || '';
                instance.timezone = payload?.timezone || instance.timezone;
                instance.status = payload?.status || instance.status;
                render(instance);
                dispatch(instance, 'change', { action: 'setValue' });
                return instance.state();
            },
            clear() {
                instance.value = '';
                instance.status = 'draft';
                render(instance);
                dispatch(instance, 'change', { action: 'clear' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeAttribute('data-publish-scheduler-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-publish-scheduler-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('input', onInput);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const publishSchedulerApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-publish-scheduler-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.publishSchedulerApi = publishSchedulerApi;
    JquanUIComponents.publishScheduler = {
        name: 'jquanui-publish-scheduler',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-publish-scheduler]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
