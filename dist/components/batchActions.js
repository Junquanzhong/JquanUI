(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        selected: [],
        actions: [],
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            header: 'flex flex-wrap items-center justify-between gap-3',
            counter: 'inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            actionDanger: 'inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm text-rose-700',
            muted: 'text-xs text-slate-500'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-batch-actions-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeAction(action, index) {
        return Object.assign({
            key: 'action-' + index,
            label: 'Action ' + (index + 1),
            tone: 'default',
            minSelected: 1,
            confirm: false
        }, clone(action || {}));
    }

    function normalizedState(instance) {
        return {
            selected: instance.selected.slice(),
            selectedCount: instance.selected.length,
            actions: instance.actions.map(function (action) {
                return {
                    key: action.key,
                    label: action.label,
                    tone: action.tone,
                    enabled: instance.selected.length >= (action.minSelected || 1)
                };
            })
        };
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:batch-actions:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';

        const surface = document.createElement('section');
        surface.className = classes.surface;

        const header = document.createElement('div');
        header.className = classes.header;

        const counter = document.createElement('div');
        counter.className = classes.counter;
        counter.textContent = instance.selected.length ? ('Selected ' + instance.selected.length) : 'No selection';
        header.appendChild(counter);

        const actions = document.createElement('div');
        actions.className = classes.actions;
        instance.actions.forEach(function (action) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = action.tone === 'danger' ? classes.actionDanger : classes.action;
            button.setAttribute('jq-batch-actions-trigger', '');
            button.setAttribute('data-key', action.key);
            button.disabled = instance.selected.length < (action.minSelected || 1);
            button.textContent = action.label;
            actions.appendChild(button);
        });
        header.appendChild(actions);
        surface.appendChild(header);

        const help = document.createElement('div');
        help.className = classes.muted;
        help.textContent = 'Use setSelected() to sync table selections. Trigger payload includes selected ids and action metadata.';
        surface.appendChild(help);

        root.appendChild(surface);
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-batch-actions-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});

        const instance = {
            id: id,
            root: root,
            options: merged,
            selected: Array.isArray(merged.selected) ? merged.selected.map(String) : [],
            actions: Array.isArray(merged.actions) ? merged.actions.map(normalizeAction) : [],
            state() {
                return Object.assign({ id: id }, normalizedState(instance));
            }
        };

        const onClick = function (event) {
            const button = event.target.closest('[jq-batch-actions-trigger]');
            if (!button || !root.contains(button) || button.disabled) return;
            const key = String(button.getAttribute('data-key'));
            const action = instance.actions.find(function (item) {
                return item.key === key;
            });
            if (!action) return;
            dispatch(instance, 'execute', {
                action: clone(action),
                confirmed: action.confirm === true
            });
        };

        const handle = {
            id: id,
            setSelected(selected) {
                instance.selected = Array.isArray(selected) ? selected.map(String) : [];
                render(instance);
                dispatch(instance, 'change', { action: 'setSelected' });
                return instance.state();
            },
            clear() {
                instance.selected = [];
                render(instance);
                dispatch(instance, 'change', { action: 'clear' });
                return instance.state();
            },
            setActions(actions) {
                instance.actions = Array.isArray(actions) ? actions.map(normalizeAction) : [];
                render(instance);
                dispatch(instance, 'change', { action: 'setActions' });
                return instance.state();
            },
            trigger(key) {
                const action = instance.actions.find(function (item) {
                    return item.key === String(key);
                });
                if (!action) return instance.state();
                if (instance.selected.length < (action.minSelected || 1)) return instance.state();
                dispatch(instance, 'execute', {
                    action: clone(action),
                    confirmed: action.confirm === true
                });
                return instance.state();
            },
            selected() {
                return instance.selected.slice();
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-batch-actions-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-batch-actions-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const batchActionsApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-batch-actions-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.batchActionsApi = batchActionsApi;
    JquanUIComponents.batchActions = {
        name: 'jquanui-batch-actions',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-batch-actions]',
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
