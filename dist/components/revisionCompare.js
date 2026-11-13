(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        left: '',
        right: '',
        classes: {
            root: 'grid gap-4 xl:grid-cols-2',
            pane: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            title: 'text-sm font-semibold text-slate-800',
            body: 'rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-7 text-slate-700 whitespace-pre-wrap',
            diffAdd: 'bg-emerald-50 text-emerald-700',
            diffRemove: 'bg-rose-50 text-rose-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-revision-compare-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function escapeHtml(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function diffLines(left, right) {
        const leftLines = String(left || '').split('\n');
        const rightLines = String(right || '').split('\n');
        const total = Math.max(leftLines.length, rightLines.length);
        const rows = [];
        for (let i = 0; i < total; i += 1) {
            rows.push({
                left: leftLines[i] ?? '',
                right: rightLines[i] ?? '',
                same: (leftLines[i] ?? '') === (rightLines[i] ?? '')
            });
        }
        return rows;
    }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:revision-compare:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function render(instance) {
        const classes = instance.options.classes;
        const rows = diffLines(instance.left, instance.right);
        instance.root.className = classes.root;
        instance.root.innerHTML =
            '<section class="' + classes.pane + '"><div class="' + classes.title + '">Previous</div><div class="' + classes.body + '">' +
            rows.map(function (row) {
                return '<div class="' + (row.same ? '' : classes.diffRemove) + '">' + escapeHtml(row.left) + '</div>';
            }).join('') +
            '</div></section>' +
            '<section class="' + classes.pane + '"><div class="' + classes.title + '">Current</div><div class="' + classes.body + '">' +
            rows.map(function (row) {
                return '<div class="' + (row.same ? '' : classes.diffAdd) + '">' + escapeHtml(row.right) + '</div>';
            }).join('') +
            '</div></section>';
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-revision-compare-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            left: merged.left || '',
            right: merged.right || '',
            state() { return { id: id, left: instance.left, right: instance.right, diff: diffLines(instance.left, instance.right) }; }
        };
        const handle = {
            id: id,
            setValues(left, right) { instance.left = String(left || ''); instance.right = String(right || ''); render(instance); dispatch(instance, 'change', { action: 'setValues' }); return instance.state(); },
            state() { return instance.state(); },
            destroy() { root.removeAttribute('data-revision-compare-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-revision-compare-id', id);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const revisionCompareApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-revision-compare-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.revisionCompareApi = revisionCompareApi;
    JquanUIComponents.revisionCompare = {
        name: 'jquanui-revision-compare',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-revision-compare]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
