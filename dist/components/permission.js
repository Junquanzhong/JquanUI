(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        permissions: new Set(),
        roles: new Set(),
        mode: 'some'
    };

    function normalizeList(value) {
        if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
        if (value == null) return [];
        return String(value).split(',').map(item => item.trim()).filter(Boolean);
    }

    function hasAll(sourceSet, values) {
        return values.every(value => sourceSet.has(value));
    }

    function hasSome(sourceSet, values) {
        return values.some(value => sourceSet.has(value));
    }

    function checkPermissions(requirements, mode = runtime.mode) {
        const values = normalizeList(requirements);
        if (!values.length) return true;
        return mode === 'every' ? hasAll(runtime.permissions, values) : hasSome(runtime.permissions, values);
    }

    function checkRoles(requirements, mode = runtime.mode) {
        const values = normalizeList(requirements);
        if (!values.length) return true;
        return mode === 'every' ? hasAll(runtime.roles, values) : hasSome(runtime.roles, values);
    }

    function can(config = {}) {
        const permissionPassed = config.permission == null ? true : checkPermissions(config.permission, config.permissionMode || runtime.mode);
        const rolePassed = config.role == null ? true : checkRoles(config.role, config.roleMode || runtime.mode);
        return permissionPassed && rolePassed;
    }

    function syncNode(node) {
        const allowed = can({
            permission: node.getAttribute('data-permission'),
            permissionMode: node.getAttribute('data-permission-mode') === 'every' ? 'every' : 'some',
            role: node.getAttribute('data-role-permission'),
            roleMode: node.getAttribute('data-role-mode') === 'every' ? 'every' : 'some'
        });
        const denyMode = node.getAttribute('data-permission-deny') || 'hide';
        if (denyMode === 'disable') {
            if ('disabled' in node) node.disabled = !allowed;
            node.setAttribute('aria-hidden', allowed ? 'false' : 'true');
            return;
        }
        node.style.display = allowed ? '' : 'none';
        node.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    }

    function refresh(root = document) {
        root.querySelectorAll('[data-permission],[data-role-permission]').forEach(syncNode);
        return true;
    }

    const permissionApi = {
        setPermissions(values = []) {
            runtime.permissions = new Set(normalizeList(values));
            refresh();
            return Array.from(runtime.permissions);
        },
        setRoles(values = []) {
            runtime.roles = new Set(normalizeList(values));
            refresh();
            return Array.from(runtime.roles);
        },
        grant(values = []) {
            normalizeList(values).forEach(value => runtime.permissions.add(value));
            refresh();
            return Array.from(runtime.permissions);
        },
        revoke(values = []) {
            normalizeList(values).forEach(value => runtime.permissions.delete(value));
            refresh();
            return Array.from(runtime.permissions);
        },
        has(values, mode = runtime.mode) {
            return checkPermissions(values, mode);
        },
        hasRole(values, mode = runtime.mode) {
            return checkRoles(values, mode);
        },
        can,
        state() {
            return {
                permissions: Array.from(runtime.permissions),
                roles: Array.from(runtime.roles)
            };
        },
        refresh
    };

    JquanUIComponents.permissionApi = permissionApi;

    JquanUIComponents.permission = {
        name: 'jquanui-permission',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[data-permission],[data-role-permission]',
                setup(node) {
                    syncNode(node);
                    return () => {};
                }
            });
        }
    };
})(window);
