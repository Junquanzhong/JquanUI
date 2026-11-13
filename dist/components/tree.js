(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        data: [],
        checkable: true,
        selectable: true,
        expandedKeys: [],
        selectedKey: null,
        checkedKeys: [],
        classes: {
            root: 'jq-tree grid gap-1 text-sm text-slate-700',
            node: 'jq-tree-node grid gap-1',
            row: 'jq-tree-row flex items-center gap-2 min-h-10 rounded-xl px-2 py-1 transition-colors duration-150',
            rowActive: 'bg-blue-50 text-blue-800',
            rowHover: 'hover:bg-slate-50',
            toggle: 'inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-transparent text-slate-500',
            togglePlaceholder: 'inline-flex h-7 w-7',
            checkbox: 'h-4 w-4 rounded border-slate-300',
            label: 'min-w-0 flex-1 truncate text-left',
            children: 'ml-6 grid gap-1 border-l border-slate-200 pl-3',
            toolbar: `rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${uiPreset.classes.focus || ''}`
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-tree-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function cloneNode(node) {
        return {
            key: String(node.key),
            label: node.label || node.key,
            disabled: node.disabled === true,
            children: Array.isArray(node.children) ? node.children.map(cloneNode) : []
        };
    }

    function normalizeData(data) {
        return Array.isArray(data) ? data.map(cloneNode) : [];
    }

    function walk(nodes, iteratee, parent) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (iteratee(node, parent, i) === false) return false;
            if (node.children && node.children.length) {
                if (walk(node.children, iteratee, node) === false) return false;
            }
        }
        return true;
    }

    function findNode(nodes, key, parent) {
        let found = null;
        walk(nodes, function (node, currentParent) {
            if (String(node.key) === String(key)) {
                found = { node: node, parent: currentParent || parent || null };
                return false;
            }
            return true;
        }, parent || null);
        return found;
    }

    function descendantKeys(node) {
        const keys = [];
        walk(node.children || [], function (item) {
            keys.push(String(item.key));
        });
        return keys;
    }

    function parentChain(nodes, key) {
        const chain = [];
        function search(list, parents) {
            for (let i = 0; i < list.length; i += 1) {
                const node = list[i];
                const nextParents = parents.concat(node);
                if (String(node.key) === String(key)) {
                    chain.push.apply(chain, parents);
                    return true;
                }
                if (node.children && node.children.length && search(node.children, nextParents)) return true;
            }
            return false;
        }
        search(nodes, []);
        return chain;
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:tree:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function render(instance) {
        const root = instance.root;
        const classes = instance.options.classes;
        root.className = classes.root;
        root.innerHTML = '';

        function createNode(node, depth) {
            const wrap = document.createElement('div');
            wrap.className = classes.node;
            wrap.setAttribute('jq-tree-node', '');
            wrap.setAttribute('data-key', String(node.key));

            const row = document.createElement('div');
            row.className = [
                classes.row,
                classes.rowHover,
                instance.selectedKey === String(node.key) && classes.rowActive
            ].filter(Boolean).join(' ');
            row.setAttribute('jq-tree-row', '');
            row.setAttribute('data-key', String(node.key));
            row.setAttribute('data-depth', String(depth));

            if (node.children && node.children.length) {
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = classes.toggle;
                toggle.setAttribute('jq-tree-toggle', '');
                toggle.setAttribute('data-key', String(node.key));
                toggle.setAttribute('aria-label', instance.expandedKeys.has(String(node.key)) ? 'Collapse' : 'Expand');
                toggle.textContent = instance.expandedKeys.has(String(node.key)) ? '-' : '+';
                row.appendChild(toggle);
            } else {
                const placeholder = document.createElement('span');
                placeholder.className = classes.togglePlaceholder;
                row.appendChild(placeholder);
            }

            if (instance.options.checkable) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = classes.checkbox;
                checkbox.setAttribute('jq-tree-check', '');
                checkbox.setAttribute('data-key', String(node.key));
                checkbox.checked = instance.checkedKeys.has(String(node.key));
                checkbox.disabled = node.disabled === true;
                row.appendChild(checkbox);
            }

            const label = document.createElement('button');
            label.type = 'button';
            label.className = classes.label;
            label.setAttribute('jq-tree-label', '');
            label.setAttribute('data-key', String(node.key));
            label.textContent = node.label;
            label.disabled = node.disabled === true;
            row.appendChild(label);
            wrap.appendChild(row);

            if (node.children && node.children.length && instance.expandedKeys.has(String(node.key))) {
                const children = document.createElement('div');
                children.className = classes.children;
                children.setAttribute('jq-tree-children', '');
                node.children.forEach(function (child) {
                    children.appendChild(createNode(child, depth + 1));
                });
                wrap.appendChild(children);
            }
            return wrap;
        }

        instance.data.forEach(function (node) {
            root.appendChild(createNode(node, 0));
        });
    }

    function syncParentChecks(instance, key) {
        const parents = parentChain(instance.data, key).reverse();
        parents.forEach(function (parent) {
            const allChildKeys = descendantKeys(parent).filter(function (childKey) {
                const found = findNode(parent.children || [], childKey);
                return found && (!found.node.children || found.node.children.length === 0 || true);
            });
            if (!allChildKeys.length) return;
            const directAndDesc = descendantKeys(parent);
            const everyChecked = directAndDesc.every(function (childKey) {
                return instance.checkedKeys.has(String(childKey));
            });
            if (everyChecked) instance.checkedKeys.add(String(parent.key));
            else instance.checkedKeys.delete(String(parent.key));
        });
    }

    function setChecked(instance, key, checked, silent) {
        const found = findNode(instance.data, key);
        if (!found) return false;
        const targetKey = String(found.node.key);
        if (checked) instance.checkedKeys.add(targetKey);
        else instance.checkedKeys.delete(targetKey);
        descendantKeys(found.node).forEach(function (childKey) {
            if (checked) instance.checkedKeys.add(String(childKey));
            else instance.checkedKeys.delete(String(childKey));
        });
        syncParentChecks(instance, targetKey);
        render(instance);
        if (!silent) dispatch(instance, 'check', { key: targetKey, checked: checked });
        return true;
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-tree-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            data: normalizeData(merged.data),
            expandedKeys: new Set((merged.expandedKeys || []).map(String)),
            checkedKeys: new Set((merged.checkedKeys || []).map(String)),
            selectedKey: merged.selectedKey != null ? String(merged.selectedKey) : null,
            state() {
                return {
                    id: id,
                    selectedKey: instance.selectedKey,
                    expandedKeys: Array.from(instance.expandedKeys),
                    checkedKeys: Array.from(instance.checkedKeys),
                    total: countNodes(instance.data)
                };
            }
        };

        function countNodes(nodes) {
            let total = 0;
            walk(nodes, function () {
                total += 1;
            });
            return total;
        }

        const onClick = function (event) {
            const toggle = event.target.closest('[jq-tree-toggle]');
            if (toggle && root.contains(toggle)) {
                const key = String(toggle.getAttribute('data-key'));
                if (instance.expandedKeys.has(key)) instance.expandedKeys.delete(key);
                else instance.expandedKeys.add(key);
                render(instance);
                dispatch(instance, 'expand', { key: key, expanded: instance.expandedKeys.has(key) });
                return;
            }
            const label = event.target.closest('[jq-tree-label]');
            if (label && root.contains(label) && instance.options.selectable) {
                instance.selectedKey = String(label.getAttribute('data-key'));
                render(instance);
                dispatch(instance, 'select', { key: instance.selectedKey });
            }
        };

        const onChange = function (event) {
            const checkbox = event.target.closest('[jq-tree-check]');
            if (!checkbox || !root.contains(checkbox)) return;
            const key = String(checkbox.getAttribute('data-key'));
            setChecked(instance, key, checkbox.checked, false);
        };

        const handle = {
            id: id,
            expand(key) {
                instance.expandedKeys.add(String(key));
                render(instance);
                return instance.state();
            },
            collapse(key) {
                instance.expandedKeys.delete(String(key));
                render(instance);
                return instance.state();
            },
            toggle(key) {
                const normalized = String(key);
                if (instance.expandedKeys.has(normalized)) instance.expandedKeys.delete(normalized);
                else instance.expandedKeys.add(normalized);
                render(instance);
                return instance.state();
            },
            expandAll() {
                walk(instance.data, function (node) {
                    if (node.children && node.children.length) instance.expandedKeys.add(String(node.key));
                });
                render(instance);
                return instance.state();
            },
            collapseAll() {
                instance.expandedKeys.clear();
                render(instance);
                return instance.state();
            },
            select(key) {
                instance.selectedKey = String(key);
                render(instance);
                dispatch(instance, 'select', { key: instance.selectedKey });
                return instance.state();
            },
            check(key, checked) {
                setChecked(instance, key, checked !== false, false);
                return instance.state();
            },
            append(parentKey, node) {
                const payload = cloneNode(node);
                if (parentKey == null) instance.data.push(payload);
                else {
                    const found = findNode(instance.data, parentKey);
                    if (!found) return false;
                    if (!Array.isArray(found.node.children)) found.node.children = [];
                    found.node.children.push(payload);
                    instance.expandedKeys.add(String(found.node.key));
                }
                render(instance);
                dispatch(instance, 'update', { action: 'append', key: payload.key, parentKey: parentKey });
                return instance.state();
            },
            remove(key) {
                const normalized = String(key);
                function removeFrom(list) {
                    const index = list.findIndex(function (item) {
                        return String(item.key) === normalized;
                    });
                    if (index !== -1) {
                        list.splice(index, 1);
                        return true;
                    }
                    return list.some(function (item) {
                        return item.children && removeFrom(item.children);
                    });
                }
                const removed = removeFrom(instance.data);
                if (!removed) return false;
                instance.expandedKeys.delete(normalized);
                instance.checkedKeys.delete(normalized);
                if (instance.selectedKey === normalized) instance.selectedKey = null;
                render(instance);
                dispatch(instance, 'update', { action: 'remove', key: normalized });
                return instance.state();
            },
            update(key, patch) {
                const found = findNode(instance.data, key);
                if (!found) return false;
                Object.assign(found.node, patch || {});
                render(instance);
                dispatch(instance, 'update', { action: 'patch', key: String(key), patch: patch || {} });
                return instance.state();
            },
            setData(data) {
                instance.data = normalizeData(data);
                instance.expandedKeys.clear();
                instance.checkedKeys.clear();
                instance.selectedKey = null;
                render(instance);
                return instance.state();
            },
            state() {
                return instance.state();
            },
            tree() {
                return JSON.parse(JSON.stringify(instance.data));
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeEventListener('change', onChange);
                root.removeAttribute('data-tree-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-tree-id', id);
        root.addEventListener('click', onClick);
        root.addEventListener('change', onChange);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const treeApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-tree-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.treeApi = treeApi;
    JquanUIComponents.tree = {
        name: 'jquanui-tree',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-tree]',
                setup(node) {
                    const handle = mount(node, {
                        data: (() => {
                            const script = node.querySelector('script[type="application/json"][jq-tree-data]');
                            if (!script) return [];
                            try { return JSON.parse(script.textContent || '[]'); } catch (error) { return []; }
                        })()
                    });
                    return function cleanup() {
                        handle?.destroy?.();
                    };
                }
            });
        }
    };
})(window);
