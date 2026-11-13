(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        columns: [],
        classes: {
            root: 'grid gap-4 xl:grid-cols-3',
            column: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            columnHead: 'flex items-center justify-between gap-3',
            columnTitle: 'text-sm font-semibold text-slate-800',
            columnCount: 'inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600',
            list: 'grid gap-3',
            card: 'grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3',
            cardTitle: 'text-sm font-semibold text-slate-800',
            cardMeta: 'text-xs text-slate-500',
            cardDesc: 'text-sm text-slate-600',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-kanban-board-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeCard(card, index) {
        return Object.assign({ id: String(card?.id || ('card-' + Date.now() + '-' + index)), title: 'Task', meta: '', description: '' }, clone(card || {}));
    }
    function normalizeColumn(column, index) {
        return Object.assign({ key: String(column?.key || ('column-' + index)), title: 'Column ' + (index + 1), cards: [] }, clone(column || {}), {
            cards: Array.isArray(column?.cards) ? column.cards.map(normalizeCard) : []
        });
    }
    function snapshot(instance) { return { id: instance.id, columns: clone(instance.columns) }; }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:kanban-board:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function findCard(instance, cardId) {
        for (let i = 0; i < instance.columns.length; i += 1) {
            const column = instance.columns[i];
            const index = column.cards.findIndex(function (card) { return card.id === String(cardId); });
            if (index >= 0) return { column: column, columnIndex: i, cardIndex: index, card: column.cards[index] };
        }
        return null;
    }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        instance.columns.forEach(function (column) {
            const section = document.createElement('section');
            section.className = classes.column;
            section.setAttribute('data-column-key', column.key);
            const head = document.createElement('div');
            head.className = classes.columnHead;
            const title = document.createElement('div');
            title.className = classes.columnTitle;
            title.textContent = column.title;
            const count = document.createElement('div');
            count.className = classes.columnCount;
            count.textContent = String(column.cards.length);
            head.appendChild(title);
            head.appendChild(count);
            section.appendChild(head);
            const list = document.createElement('div');
            list.className = classes.list;
            column.cards.forEach(function (card) {
                const item = document.createElement('article');
                item.className = classes.card;
                item.setAttribute('data-card-id', card.id);
                const cardTitle = document.createElement('div');
                cardTitle.className = classes.cardTitle;
                cardTitle.textContent = card.title;
                const meta = document.createElement('div');
                meta.className = classes.cardMeta;
                meta.textContent = card.meta || '';
                const desc = document.createElement('div');
                desc.className = classes.cardDesc;
                desc.textContent = card.description || '';
                const actions = document.createElement('div');
                actions.className = classes.actions;
                const left = document.createElement('button');
                left.type = 'button';
                left.className = classes.action;
                left.textContent = 'Prev';
                left.setAttribute('jq-kanban-prev', '');
                left.setAttribute('data-card-id', card.id);
                const right = document.createElement('button');
                right.type = 'button';
                right.className = classes.action;
                right.textContent = 'Next';
                right.setAttribute('jq-kanban-next', '');
                right.setAttribute('data-card-id', card.id);
                actions.appendChild(left);
                actions.appendChild(right);
                item.appendChild(cardTitle);
                item.appendChild(meta);
                item.appendChild(desc);
                item.appendChild(actions);
                list.appendChild(item);
            });
            section.appendChild(list);
            root.appendChild(section);
        });
    }
    function moveCardInternal(instance, cardId, direction) {
        const found = findCard(instance, cardId);
        if (!found) return false;
        const targetIndex = direction === 'prev' ? found.columnIndex - 1 : found.columnIndex + 1;
        if (targetIndex < 0 || targetIndex >= instance.columns.length) return false;
        found.column.cards.splice(found.cardIndex, 1);
        instance.columns[targetIndex].cards.push(found.card);
        return true;
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-kanban-board-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            columns: Array.isArray(merged.columns) ? merged.columns.map(normalizeColumn) : [],
            state() { return snapshot(instance); }
        };
        const onClick = function (event) {
            const prev = event.target.closest('[jq-kanban-prev]');
            if (prev && root.contains(prev)) {
                if (moveCardInternal(instance, prev.getAttribute('data-card-id'), 'prev')) {
                    render(instance);
                    dispatch(instance, 'change', { action: 'movePrev', cardId: prev.getAttribute('data-card-id') });
                }
                return;
            }
            const next = event.target.closest('[jq-kanban-next]');
            if (next && root.contains(next)) {
                if (moveCardInternal(instance, next.getAttribute('data-card-id'), 'next')) {
                    render(instance);
                    dispatch(instance, 'change', { action: 'moveNext', cardId: next.getAttribute('data-card-id') });
                }
            }
        };
        const handle = {
            id: id,
            setColumns(columns) { instance.columns = Array.isArray(columns) ? columns.map(normalizeColumn) : []; render(instance); dispatch(instance, 'change', { action: 'setColumns' }); return instance.state(); },
            appendCard(columnKey, card) {
                const column = instance.columns.find(function (item) { return item.key === String(columnKey); });
                if (!column) return instance.state();
                column.cards.push(normalizeCard(card || {}, column.cards.length));
                render(instance);
                dispatch(instance, 'change', { action: 'appendCard', columnKey: String(columnKey) });
                return instance.state();
            },
            moveCard(cardId, direction) {
                if (moveCardInternal(instance, cardId, direction === 'prev' ? 'prev' : 'next')) {
                    render(instance);
                    dispatch(instance, 'change', { action: 'moveCard', cardId: String(cardId), direction: direction });
                }
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeAttribute('data-kanban-board-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-kanban-board-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const kanbanBoardApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-kanban-board-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.kanbanBoardApi = kanbanBoardApi;
    JquanUIComponents.kanbanBoard = {
        name: 'jquanui-kanban-board',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-kanban-board]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
