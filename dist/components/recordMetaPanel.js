(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        title: 'Meta',
        status: { label: 'Draft', tone: 'default' },
        meta: [],
        stats: [],
        seo: [],
        actions: [],
        classes: {
            root: 'grid gap-4',
            surface: 'grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            title: 'text-sm font-semibold text-slate-800',
            badge: 'inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700',
            badgeSuccess: 'inline-flex min-h-7 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700',
            badgeWarn: 'inline-flex min-h-7 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-700',
            section: 'grid gap-3',
            row: 'grid gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2',
            label: 'text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500',
            value: 'text-sm text-slate-800',
            stats: 'grid gap-3 sm:grid-cols-3',
            statCard: 'grid gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3',
            statValue: 'text-lg font-semibold text-slate-900',
            statLabel: 'text-xs text-slate-500',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700',
            actionPrimary: 'inline-flex h-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 text-sm text-white',
            muted: 'text-xs text-slate-500'
        }
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-record-meta-panel-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeRows(rows) {
        return Array.isArray(rows) ? rows.map(function (row, index) {
            return Object.assign({
                key: 'row-' + index,
                label: 'Field',
                value: '-'
            }, clone(row || {}));
        }) : [];
    }

    function normalizeStats(stats) {
        return Array.isArray(stats) ? stats.map(function (item, index) {
            return Object.assign({
                key: 'stat-' + index,
                label: 'Stat',
                value: '0'
            }, clone(item || {}));
        }) : [];
    }

    function normalizeActions(actions) {
        return Array.isArray(actions) ? actions.map(function (item, index) {
            return Object.assign({
                key: 'action-' + index,
                label: 'Action',
                tone: 'default'
            }, clone(item || {}));
        }) : [];
    }

    function normalizeStatus(status) {
        return Object.assign({
            label: 'Draft',
            tone: 'default'
        }, clone(status || {}));
    }

    function getStatusClass(classes, tone) {
        if (tone === 'success') return classes.badgeSuccess;
        if (tone === 'warning') return classes.badgeWarn;
        return classes.badge;
    }

    function stateSnapshot(instance) {
        return {
            id: instance.id,
            title: instance.title,
            status: clone(instance.status),
            meta: clone(instance.meta),
            stats: clone(instance.stats),
            seo: clone(instance.seo),
            actions: clone(instance.actions)
        };
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:record-meta-panel:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function renderRows(rows, classes) {
        const wrap = document.createElement('div');
        wrap.className = classes.section;
        rows.forEach(function (row) {
            const item = document.createElement('div');
            item.className = classes.row;
            const label = document.createElement('div');
            label.className = classes.label;
            label.textContent = row.label;
            const value = document.createElement('div');
            value.className = classes.value;
            value.textContent = row.value == null ? '-' : String(row.value);
            item.appendChild(label);
            item.appendChild(value);
            wrap.appendChild(item);
        });
        return wrap;
    }

    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';

        const surface = document.createElement('section');
        surface.className = classes.surface;

        const header = document.createElement('div');
        header.className = 'flex flex-wrap items-center justify-between gap-3';
        const title = document.createElement('div');
        title.className = classes.title;
        title.textContent = instance.title;
        const badge = document.createElement('div');
        badge.className = getStatusClass(classes, instance.status.tone);
        badge.textContent = instance.status.label;
        header.appendChild(title);
        header.appendChild(badge);
        surface.appendChild(header);

        if (instance.meta.length) {
            const blockTitle = document.createElement('div');
            blockTitle.className = classes.title;
            blockTitle.textContent = 'Meta';
            surface.appendChild(blockTitle);
            surface.appendChild(renderRows(instance.meta, classes));
        }

        if (instance.stats.length) {
            const blockTitle = document.createElement('div');
            blockTitle.className = classes.title;
            blockTitle.textContent = 'Stats';
            surface.appendChild(blockTitle);
            const stats = document.createElement('div');
            stats.className = classes.stats;
            instance.stats.forEach(function (item) {
                const card = document.createElement('div');
                card.className = classes.statCard;
                const value = document.createElement('div');
                value.className = classes.statValue;
                value.textContent = item.value == null ? '0' : String(item.value);
                const label = document.createElement('div');
                label.className = classes.statLabel;
                label.textContent = item.label;
                card.appendChild(value);
                card.appendChild(label);
                stats.appendChild(card);
            });
            surface.appendChild(stats);
        }

        if (instance.seo.length) {
            const blockTitle = document.createElement('div');
            blockTitle.className = classes.title;
            blockTitle.textContent = 'SEO';
            surface.appendChild(blockTitle);
            surface.appendChild(renderRows(instance.seo, classes));
        }

        if (instance.actions.length) {
            const actions = document.createElement('div');
            actions.className = classes.actions;
            instance.actions.forEach(function (action) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = action.tone === 'primary' ? classes.actionPrimary : classes.action;
                button.setAttribute('jq-record-meta-panel-action', '');
                button.setAttribute('data-key', action.key);
                button.textContent = action.label;
                actions.appendChild(button);
            });
            surface.appendChild(actions);
        }

        const muted = document.createElement('div');
        muted.className = classes.muted;
        muted.textContent = 'Use setMeta / setStats / setSeo / setStatus to keep the detail sidebar in sync with editor state.';
        surface.appendChild(muted);

        root.appendChild(surface);
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-record-meta-panel-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});

        const instance = {
            id: id,
            root: root,
            options: merged,
            title: merged.title || 'Meta',
            status: normalizeStatus(merged.status),
            meta: normalizeRows(merged.meta),
            stats: normalizeStats(merged.stats),
            seo: normalizeRows(merged.seo),
            actions: normalizeActions(merged.actions),
            state() {
                return stateSnapshot(instance);
            }
        };

        const onClick = function (event) {
            const button = event.target.closest('[jq-record-meta-panel-action]');
            if (!button || !root.contains(button)) return;
            const key = String(button.getAttribute('data-key'));
            const action = instance.actions.find(function (item) {
                return item.key === key;
            });
            if (!action) return;
            dispatch(instance, 'action', {
                action: clone(action)
            });
        };

        const handle = {
            id: id,
            setTitle(title) {
                instance.title = title == null ? '' : String(title);
                render(instance);
                dispatch(instance, 'change', { action: 'setTitle' });
                return instance.state();
            },
            setStatus(status) {
                instance.status = normalizeStatus(status);
                render(instance);
                dispatch(instance, 'change', { action: 'setStatus' });
                return instance.state();
            },
            setMeta(meta) {
                instance.meta = normalizeRows(meta);
                render(instance);
                dispatch(instance, 'change', { action: 'setMeta' });
                return instance.state();
            },
            setStats(stats) {
                instance.stats = normalizeStats(stats);
                render(instance);
                dispatch(instance, 'change', { action: 'setStats' });
                return instance.state();
            },
            setSeo(seo) {
                instance.seo = normalizeRows(seo);
                render(instance);
                dispatch(instance, 'change', { action: 'setSeo' });
                return instance.state();
            },
            setActions(actions) {
                instance.actions = normalizeActions(actions);
                render(instance);
                dispatch(instance, 'change', { action: 'setActions' });
                return instance.state();
            },
            state() {
                return instance.state();
            },
            destroy() {
                root.removeEventListener('click', onClick);
                root.removeAttribute('data-record-meta-panel-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-record-meta-panel-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }

    const recordMetaPanelApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-record-meta-panel-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.recordMetaPanelApi = recordMetaPanelApi;
    JquanUIComponents.recordMetaPanel = {
        name: 'jquanui-record-meta-panel',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-record-meta-panel]',
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
