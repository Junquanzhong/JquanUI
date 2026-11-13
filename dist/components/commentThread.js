(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };
    const runtime = { seed: 0, instances: new Map() };
    const defaults = {
        items: [],
        classes: {
            root: 'grid gap-3',
            item: 'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
            head: 'flex flex-wrap items-center justify-between gap-3',
            author: 'text-sm font-semibold text-slate-800',
            time: 'text-xs text-slate-500',
            body: 'text-sm leading-7 text-slate-600',
            replies: 'ml-6 grid gap-3 border-l border-slate-200 pl-4',
            actions: 'flex flex-wrap gap-2',
            action: uiPreset.classes.action || 'inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700'
        }
    };
    function nextId() { runtime.seed += 1; return 'jq-comment-thread-' + runtime.seed; }
    function resolveTarget(target) { if (!target) return null; if (typeof target === 'string') return document.querySelector(target); return target.nodeType === 1 ? target : null; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function normalizeComment(item, index) {
        return Object.assign({ id: String(item?.id || ('comment-' + Date.now() + '-' + index)), author: 'User', time: '', content: '', replies: [] }, clone(item || {}), {
            replies: Array.isArray(item?.replies) ? item.replies.map(normalizeComment) : []
        });
    }
    function snapshot(instance) { return { id: instance.id, items: clone(instance.items) }; }
    function dispatch(instance, eventName, detail) { instance.root.dispatchEvent(new CustomEvent('jquan:comment-thread:' + eventName, { bubbles: true, detail: Object.assign({}, instance.state(), detail || {}) })); }
    function findComment(list, id) {
        for (let i = 0; i < list.length; i += 1) {
            const item = list[i];
            if (item.id === String(id)) return item;
            const inReply = findComment(item.replies || [], id);
            if (inReply) return inReply;
        }
        return null;
    }
    function renderList(items, classes) {
        const frag = document.createDocumentFragment();
        items.forEach(function (item) {
            const card = document.createElement('article');
            card.className = classes.item;
            card.setAttribute('data-comment-id', item.id);
            const head = document.createElement('div');
            head.className = classes.head;
            const author = document.createElement('div');
            author.className = classes.author;
            author.textContent = item.author;
            const time = document.createElement('div');
            time.className = classes.time;
            time.textContent = item.time || '';
            head.appendChild(author);
            head.appendChild(time);
            const body = document.createElement('div');
            body.className = classes.body;
            body.textContent = item.content || '';
            const actions = document.createElement('div');
            actions.className = classes.actions;
            const reply = document.createElement('button');
            reply.type = 'button';
            reply.className = classes.action;
            reply.textContent = 'Reply';
            reply.setAttribute('jq-comment-reply', '');
            reply.setAttribute('data-comment-id', item.id);
            actions.appendChild(reply);
            card.appendChild(head);
            card.appendChild(body);
            card.appendChild(actions);
            if (item.replies && item.replies.length) {
                const replies = document.createElement('div');
                replies.className = classes.replies;
                replies.appendChild(renderList(item.replies, classes));
                card.appendChild(replies);
            }
            frag.appendChild(card);
        });
        return frag;
    }
    function render(instance) {
        const classes = instance.options.classes;
        const root = instance.root;
        root.className = classes.root;
        root.innerHTML = '';
        root.appendChild(renderList(instance.items, classes));
    }
    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-comment-thread-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        merged.classes = Object.assign({}, defaults.classes, options?.classes || {});
        const instance = {
            id: id,
            root: root,
            options: merged,
            items: Array.isArray(merged.items) ? merged.items.map(normalizeComment) : [],
            state() { return snapshot(instance); }
        };
        const onClick = function (event) {
            const reply = event.target.closest('[jq-comment-reply]');
            if (reply && root.contains(reply)) {
                handle.reply(reply.getAttribute('data-comment-id'), {
                    author: 'You',
                    time: 'just now',
                    content: 'Follow-up note from runtime action.'
                });
            }
        };
        const handle = {
            id: id,
            setItems(items) { instance.items = Array.isArray(items) ? items.map(normalizeComment) : []; render(instance); dispatch(instance, 'change', { action: 'setItems' }); return instance.state(); },
            appendComment(comment) { instance.items.push(normalizeComment(comment || {}, instance.items.length)); render(instance); dispatch(instance, 'change', { action: 'appendComment' }); return instance.state(); },
            reply(commentId, comment) {
                const target = findComment(instance.items, commentId);
                if (!target) return instance.state();
                target.replies = target.replies || [];
                target.replies.push(normalizeComment(comment || {}, target.replies.length));
                render(instance);
                dispatch(instance, 'change', { action: 'reply', commentId: String(commentId) });
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() { root.removeEventListener('click', onClick); root.removeAttribute('data-comment-thread-id'); runtime.instances.delete(id); return true; }
        };
        instance.handle = handle;
        root.setAttribute('data-comment-thread-id', id);
        root.addEventListener('click', onClick);
        runtime.instances.set(id, instance);
        render(instance);
        return handle;
    }
    const commentThreadApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-comment-thread-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };
    JquanUIComponents.commentThreadApi = commentThreadApi;
    JquanUIComponents.commentThread = {
        name: 'jquanui-comment-thread',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-comment-thread]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() { handle?.destroy?.(); };
                }
            });
        }
    };
})(window);
