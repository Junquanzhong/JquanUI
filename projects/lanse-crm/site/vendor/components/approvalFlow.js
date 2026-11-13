(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        steps: [],
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            list: 'grid gap-3',
            step: 'grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4',
            head: 'flex flex-wrap items-center justify-between gap-3',
            title: 'text-sm font-semibold text-slate-800',
            badge: 'inline-flex h-7 items-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600',
            badgeDone: 'inline-flex h-7 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700',
            badgeWarn: 'inline-flex h-7 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-700',
            badgeDanger: 'inline-flex h-7 items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 text-xs font-medium text-rose-700',
            meta: 'text-xs text-slate-500',
            desc: 'text-sm text-slate-600',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-approval-flow-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeStep(step, index) {
        return Object.assign({ id: String(step?.id || ('step-' + index)), title: 'Step ' + (index + 1), actor: '', time: '', description: '', status: index === 0 ? 'current' : 'pending' }, clone(step || {}));
    }
    function snapshot(instance) { return { id: instance.id, steps: clone(instance.steps) }; }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:approval-flow:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function badgeClass(classes, status) {
        if (status === 'completed') return classes.badgeDone;
        if (status === 'current') return classes.badgeWarn;
        if (status === 'rejected') return classes.badgeDanger;
        return classes.badge;
    }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        const surface = document.createElement('section');
        surface.className = classes.surface;
        const list = document.createElement('div');
        list.className = classes.list;
        instance.steps.forEach(function (step) {
            const item = document.createElement('article');
            item.className = classes.step;
            item.setAttribute('data-step-id', step.id);
            const head = document.createElement('div');
            head.className = classes.head;
            const title = document.createElement('div');
            title.className = classes.title;
            title.textContent = step.title;
            const badge = document.createElement('div');
            badge.className = badgeClass(classes, step.status);
            badge.textContent = step.status;
            head.appendChild(title);
            head.appendChild(badge);
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = [step.actor, step.time].filter(Boolean).join(' · ');
            const desc = document.createElement('div');
            desc.className = classes.desc;
            desc.textContent = step.description || '';
            const actions = document.createElement('div');
            actions.className = classes.actions;
            const approve = document.createElement('button');
            approve.type = 'button';
            approve.className = classes.action;
            approve.textContent = 'Approve';
            approve.setAttribute('jq-approval-approve', '');
            approve.setAttribute('data-step-id', step.id);
            const reject = document.createElement('button');
            reject.type = 'button';
            reject.className = classes.action;
            reject.textContent = 'Reject';
            reject.setAttribute('jq-approval-reject', '');
            reject.setAttribute('data-step-id', step.id);
            actions.appendChild(approve);
            actions.appendChild(reject);
            item.appendChild(head);
            item.appendChild(meta);
            item.appendChild(desc);
            item.appendChild(actions);
            list.appendChild(item);
        });
        surface.appendChild(list);
        root.appendChild(surface);
    }
    function stepIndex(instance, stepId) { return instance.steps.findIndex(function (step) { return step.id === String(stepId); }); }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-approval-flow-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            steps: Array.isArray(merged.steps) ? merged.steps.map(normalizeStep) : [],
            state() { return snapshot(instance); }
        };
        const onClick = function (event) {
            const approve = event.target.closest('[jq-approval-approve]');
            if (approve && root.contains(approve)) {
                handle.approve(approve.getAttribute('data-step-id'));
                return;
            }
            const reject = event.target.closest('[jq-approval-reject]');
            if (reject && root.contains(reject)) {
                handle.reject(reject.getAttribute('data-step-id'));
            }
        };
        const handle = {
            id: id,
            setSteps(steps) { instance.steps = Array.isArray(steps) ? steps.map(normalizeStep) : []; render(instance); dispatch(instance, 'change', { action: 'setSteps' }); return instance.state(); },
            approve(stepId) {
                const index = stepIndex(instance, stepId);
                if (index < 0) return instance.state();
                instance.steps[index].status = 'completed';
                if (instance.steps[index + 1] && instance.steps[index + 1].status === 'pending') instance.steps[index + 1].status = 'current';
                render(instance);
                dispatch(instance, 'change', { action: 'approve', stepId: String(stepId) });
                return instance.state();
            },
            reject(stepId) {
                const index = stepIndex(instance, stepId);
                if (index < 0) return instance.state();
                instance.steps[index].status = 'rejected';
                render(instance);
                dispatch(instance, 'change', { action: 'reject', stepId: String(stepId) });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeAttribute('data-approval-flow-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-approval-flow-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const approvalFlowApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-approval-flow-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.approvalFlowApi = approvalFlowApi;
    JquanUIComponents.approvalFlow = {
        name: 'jquanui-approval-flow',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-approval-flow]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
