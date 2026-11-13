(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        roles: [],
        members: [],
        assignments: {},
        classes: {
            root: 'grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]',
            sidebar: 'grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm',
            role: uiPreset.classes.action || 'inline-flex h-9 items-center justify-start rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            roleActive: 'border-primary/20 bg-primary/10 text-primary',
            panel: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            grid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
            member: 'grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3',
            memberActive: 'border-primary/20 bg-primary/5',
            title: 'text-sm font-semibold text-slate-800',
            meta: 'text-xs text-slate-500',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-role-member-assigner-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeRole(item, index) { return Object.assign({ key: 'role-' + index, label: 'Role ' + (index + 1) }, clone(item || {})); }
    function normalizeMember(item, index) { return Object.assign({ id: 'member-' + index, name: 'Member ' + (index + 1), meta: '' }, clone(item || {})); }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:role-member-assigner:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function assignedSet(instance) { return new Set(instance.assignments[instance.activeRole] || []); }
    function render(instance) {
        const classes = instance.options.classes;
        instance.root.className = classes.root;
        instance.root.innerHTML = '';
        const sidebar = document.createElement('div');
        sidebar.className = classes.sidebar;
        instance.roles.forEach(function (role) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [classes.role, instance.activeRole === role.key && classes.roleActive].filter(Boolean).join(' ');
            button.setAttribute('jq-role-member-role', '');
            button.setAttribute('data-key', role.key);
            button.textContent = role.label;
            sidebar.appendChild(button);
        });
        const panel = document.createElement('div');
        panel.className = classes.panel;
        const title = document.createElement('div');
        title.className = classes.title;
        title.textContent = instance.roles.find(function (item) { return item.key === instance.activeRole; })?.label || 'Members';
        panel.appendChild(title);
        const grid = document.createElement('div');
        grid.className = classes.grid;
        const assigned = assignedSet(instance);
        instance.members.forEach(function (member) {
            const card = document.createElement('div');
            card.className = [classes.member, assigned.has(member.id) && classes.memberActive].filter(Boolean).join(' ');
            const name = document.createElement('div');
            name.className = classes.title;
            name.textContent = member.name;
            const meta = document.createElement('div');
            meta.className = classes.meta;
            meta.textContent = member.meta || '';
            const action = document.createElement('button');
            action.type = 'button';
            action.className = classes.action;
            action.setAttribute('jq-role-member-toggle', '');
            action.setAttribute('data-id', member.id);
            action.textContent = assigned.has(member.id) ? 'Remove' : 'Assign';
            card.appendChild(name);
            card.appendChild(meta);
            card.appendChild(action);
            grid.appendChild(card);
        });
        panel.appendChild(grid);
        instance.root.appendChild(sidebar);
        instance.root.appendChild(panel);
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-role-member-assigner-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const roles = Array.isArray(merged.roles) ? merged.roles.map(normalizeRole) : [];
        const instance = {
            id,
            root,
            options: merged,
            roles,
            members: Array.isArray(merged.members) ? merged.members.map(normalizeMember) : [],
            assignments: clone(merged.assignments || {}),
            activeRole: roles[0]?.key || '',
            state() {
                return { id, activeRole: instance.activeRole, assignments: clone(instance.assignments), roles: clone(instance.roles), members: clone(instance.members) };
            }
        };
        const onClick = function (event) {
            const role = event.target.closest('[jq-role-member-role]');
            if (role && root.contains(role)) {
                handle.setRole(role.getAttribute('data-key'));
                return;
            }
            const toggle = event.target.closest('[jq-role-member-toggle]');
            if (toggle && root.contains(toggle)) {
                handle.toggle(toggle.getAttribute('data-id'));
            }
        };
        const handle = {
            id,
            setRole(key) {
                instance.activeRole = String(key || '');
                render(instance);
                dispatch(instance, 'change', { action: 'setRole', key: instance.activeRole });
                return instance.state();
            },
            toggle(memberId) {
                const key = instance.activeRole;
                if (!instance.assignments[key]) instance.assignments[key] = [];
                const set = new Set(instance.assignments[key]);
                if (set.has(String(memberId))) set.delete(String(memberId));
                else set.add(String(memberId));
                instance.assignments[key] = Array.from(set);
                render(instance);
                dispatch(instance, 'change', { action: 'toggle', memberId: String(memberId), role: key });
                return instance.state();
            },
            setAssignments(assignments) {
                instance.assignments = clone(assignments || {});
                render(instance);
                dispatch(instance, 'change', { action: 'setAssignments' });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-role-member-assigner-id');
                runtime.instances.delete(id);
                return true;
            }
        };
        instance.handle = handle;
        root.setAttribute('data-role-member-assigner-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const roleMemberAssignerApi = {
        mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-role-member-assigner-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.roleMemberAssignerApi = roleMemberAssignerApi;
    JquanUIComponents.roleMemberAssigner = {
        name: 'jquanui-role-member-assigner',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-role-member-assigner]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
