(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        multiple: false,
        collapsible: true,
        duration: 220,
        defaultOpen: [],
        keyboard: true,
        onChange: null
    };

    function nextId(prefix) {
        runtime.seed += 1;
        return `${prefix}-${runtime.seed}`;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.multiple = merged.multiple === true;
        merged.collapsible = merged.collapsible !== false;
        merged.keyboard = merged.keyboard !== false;
        merged.duration = Math.max(0, Number(merged.duration) || 220);
        if (!Array.isArray(merged.defaultOpen)) {
            if (merged.defaultOpen === '' || merged.defaultOpen == null) merged.defaultOpen = [];
            else merged.defaultOpen = [merged.defaultOpen];
        }
        return merged;
    }

    function parseNodeOptions(node) {
        const defaultOpen = (node.getAttribute('data-default-open') || '')
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);

        return normalizeOptions({
            multiple: node.getAttribute('data-multiple') === 'true',
            collapsible: node.getAttribute('data-collapsible') !== 'false',
            duration: node.getAttribute('data-duration'),
            keyboard: node.getAttribute('data-keyboard') !== 'false',
            defaultOpen
        });
    }

    function resolveInstance(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            for (const instance of runtime.instances.values()) {
                if (instance.root.matches(target)) return instance;
            }
            const found = document.querySelector(target);
            return found ? resolveInstance(found) : null;
        }
        for (const instance of runtime.instances.values()) {
            if (instance.root === target || instance.root.contains(target)) return instance;
        }
        return null;
    }

    function createHandle(id) {
        return {
            id,
            open(target) { return openItem(id, target); },
            close(target) { return closeItem(id, target); },
            toggle(target) { return toggleItem(id, target); },
            openAll() { return openAll(id); },
            closeAll() { return closeAll(id); },
            update(options) { return updateInstance(id, options); },
            destroy() { return destroyInstance(id); },
            state() {
                const instance = runtime.instances.get(id);
                return instance ? getState(instance) : null;
            },
            element() {
                const instance = runtime.instances.get(id);
                return instance ? instance.root : null;
            }
        };
    }

    function getState(instance) {
        return {
            openIndexes: instance.items
                .map((item, index) => item.trigger.getAttribute('aria-expanded') === 'true' ? index : null)
                .filter(index => index !== null),
            total: instance.items.length,
            multiple: instance.options.multiple,
            collapsible: instance.options.collapsible
        };
    }

    function resolveItem(instance, target) {
        if (typeof target === 'number') {
            return instance.items[target] || null;
        }
        if (typeof target === 'string') {
            const num = Number(target);
            if (Number.isFinite(num)) return instance.items[num] || null;
            return instance.items.find(item =>
                item.trigger.id === target ||
                item.panel.id === target ||
                item.item.id === target ||
                item.trigger.matches(target) ||
                item.panel.matches(target) ||
                item.item.matches(target)
            ) || null;
        }
        return instance.items.find(item =>
            item.item === target ||
            item.trigger === target ||
            item.panel === target ||
            item.item.contains(target) ||
            item.trigger.contains(target) ||
            item.panel.contains(target)
        ) || null;
    }

    function syncAria(item, expanded) {
        item.trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        item.trigger.setAttribute('data-state', expanded ? 'open' : 'closed');
        item.item.setAttribute('data-state', expanded ? 'open' : 'closed');
        item.panel.setAttribute('data-state', expanded ? 'open' : 'closed');
    }

    function animateOpen(instance, item) {
        const panel = item.panel;
        panel.removeAttribute('hidden');
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.remove('hidden');
    }

    function animateClose(instance, item) {
        const panel = item.panel;
        panel.setAttribute('aria-hidden', 'true');
        panel.classList.add('hidden');
    }

    function applyExpanded(instance, item, expanded, emit) {
        if (item.disabled) return false;
        const isOpen = item.trigger.getAttribute('aria-expanded') === 'true';
        if (isOpen === expanded) return true;

        syncAria(item, expanded);
        if (expanded) animateOpen(instance, item);
        else animateClose(instance, item);

        if (emit !== false) emitChange(instance);
        return true;
    }

    function emitChange(instance) {
        const state = getState(instance);
        if (typeof instance.options.onChange === 'function') {
            instance.options.onChange(state, createHandle(instance.id));
        }
        instance.root.dispatchEvent(new CustomEvent('jquan:accordion:change', {
            bubbles: true,
            detail: {
                state,
                instance: createHandle(instance.id)
            }
        }));
    }

    function openItem(id, target) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        const item = resolveItem(instance, target);
        if (!item) return false;

        if (!instance.options.multiple) {
            instance.items.forEach(entry => {
                if (entry !== item) applyExpanded(instance, entry, false, false);
            });
        }

        return applyExpanded(instance, item, true, true);
    }

    function closeItem(id, target) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        const item = resolveItem(instance, target);
        if (!item) return false;

        const openItems = instance.items.filter(entry => entry.trigger.getAttribute('aria-expanded') === 'true');
        if (!instance.options.collapsible && openItems.length <= 1 && openItems.includes(item)) {
            return false;
        }

        return applyExpanded(instance, item, false, true);
    }

    function toggleItem(id, target) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        const item = resolveItem(instance, target);
        if (!item) return false;
        const expanded = item.trigger.getAttribute('aria-expanded') === 'true';
        return expanded ? closeItem(id, target) : openItem(id, target);
    }

    function openAll(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        if (!instance.options.multiple) {
            if (instance.items[0]) return openItem(id, 0);
            return false;
        }
        instance.items.forEach(item => applyExpanded(instance, item, true, false));
        emitChange(instance);
        return true;
    }

    function closeAll(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        if (!instance.options.collapsible) return false;
        instance.items.forEach(item => applyExpanded(instance, item, false, false));
        emitChange(instance);
        return true;
    }

    function setupStructure(instance) {
        const root = instance.root;
        const itemNodes = Array.from(root.querySelectorAll('[jq-accordion-item]'));
        if (itemNodes.length === 0) return false;

        const items = itemNodes.map((itemNode, index) => {
            const trigger = itemNode.querySelector('[jq-accordion-trigger]');
            const panel = itemNode.querySelector('[jq-accordion-panel]');
            if (!trigger || !panel) return null;

            if (!trigger.id) trigger.id = nextId('jq-accordion-trigger');
            if (!panel.id) panel.id = nextId('jq-accordion-panel');
            if (trigger.tagName === 'BUTTON' && !trigger.hasAttribute('type')) {
                trigger.setAttribute('type', 'button');
            }

            trigger.setAttribute('role', 'button');
            trigger.setAttribute('aria-controls', panel.id);
            trigger.dataset.index = String(index);

            panel.setAttribute('role', 'region');
            panel.setAttribute('aria-labelledby', trigger.id);

            const disabled = itemNode.getAttribute('data-disabled') === 'true' || trigger.disabled;
            if (disabled) {
                trigger.disabled = true;
                itemNode.setAttribute('data-disabled', 'true');
            }

            return {
                index,
                item: itemNode,
                trigger,
                panel,
                disabled
            };
        }).filter(Boolean);

        if (items.length === 0) return false;
        instance.items = items;
        return true;
    }

    function applyInitialState(instance) {
        const requested = new Set(instance.options.defaultOpen.map(value => String(value)));
        let openedAny = false;

        instance.items.forEach(item => {
            const shouldOpen =
                requested.has(String(item.index)) ||
                requested.has(item.trigger.id) ||
                requested.has(item.panel.id) ||
                item.item.getAttribute('data-open') === 'true' ||
                item.trigger.getAttribute('aria-expanded') === 'true';

            const expanded = shouldOpen && (instance.options.multiple || !openedAny);
            syncAria(item, expanded);
            item.panel.removeAttribute('hidden');
            item.panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
            item.panel.classList.toggle('hidden', !expanded);
            if (expanded) openedAny = true;
        });

        if (!openedAny && instance.items[0]) {
            syncAria(instance.items[0], true);
            instance.items[0].panel.removeAttribute('hidden');
            instance.items[0].panel.setAttribute('aria-hidden', 'false');
            instance.items[0].panel.classList.remove('hidden');
        }
    }

    function bindEvents(instance) {
        const cleanups = [];

        const onClick = event => {
            const trigger = event.target.closest('[jq-accordion-trigger]');
            if (!trigger || !instance.root.contains(trigger)) return;
            const index = Number(trigger.dataset.index);
            if (!Number.isFinite(index)) return;
            toggleItem(instance.id, index);
        };

        instance.root.addEventListener('click', onClick);
        cleanups.push(() => instance.root.removeEventListener('click', onClick));

        if (instance.options.keyboard) {
            const onKeyDown = event => {
                const trigger = event.target.closest('[jq-accordion-trigger]');
                if (!trigger || !instance.root.contains(trigger)) return;
                const currentIndex = instance.items.findIndex(item => item.trigger === trigger);
                if (currentIndex === -1) return;

                let nextIndex = currentIndex;
                if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % instance.items.length;
                else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + instance.items.length) % instance.items.length;
                else if (event.key === 'Home') nextIndex = 0;
                else if (event.key === 'End') nextIndex = instance.items.length - 1;
                else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleItem(instance.id, currentIndex);
                    return;
                } else {
                    return;
                }

                event.preventDefault();
                instance.items[nextIndex].trigger.focus();
            };

            instance.root.addEventListener('keydown', onKeyDown);
            cleanups.push(() => instance.root.removeEventListener('keydown', onKeyDown));
        }

        instance.cleanup = () => cleanups.forEach(fn => fn());
    }

    function mount(root, options) {
        const existing = resolveInstance(root);
        if (existing) return createHandle(existing.id);

        const instance = {
            id: root.id || nextId('jq-accordion'),
            root,
            options: normalizeOptions(Object.assign({}, parseNodeOptions(root), options || {})),
            items: [],
            cleanup: null
        };

        root.id = instance.id;
        runtime.instances.set(instance.id, instance);

        if (!setupStructure(instance)) {
            runtime.instances.delete(instance.id);
            return null;
        }

        applyInitialState(instance);
        bindEvents(instance);
        return createHandle(instance.id);
    }

    function updateInstance(id, options) {
        const instance = runtime.instances.get(id);
        if (!instance) return null;
        if (instance.cleanup) instance.cleanup();
        instance.options = normalizeOptions(Object.assign({}, instance.options, options || {}));
        setupStructure(instance);
        applyInitialState(instance);
        bindEvents(instance);
        return createHandle(id);
    }

    function destroyInstance(target) {
        const instance = typeof target === 'string' ? runtime.instances.get(target) : resolveInstance(target);
        if (!instance) return false;
        if (instance.cleanup) instance.cleanup();
        runtime.instances.delete(instance.id);
        return true;
    }

    const accordionApi = {
        mount(target, options) {
            if (typeof target === 'string') {
                const node = document.querySelector(target);
                return node ? mount(node, options) : null;
            }
            return mount(target, options);
        },
        open(target, item) {
            const instance = resolveInstance(target);
            return instance ? openItem(instance.id, item) : false;
        },
        close(target, item) {
            const instance = resolveInstance(target);
            return instance ? closeItem(instance.id, item) : false;
        },
        toggle(target, item) {
            const instance = resolveInstance(target);
            return instance ? toggleItem(instance.id, item) : false;
        },
        openAll(target) {
            const instance = resolveInstance(target);
            return instance ? openAll(instance.id) : false;
        },
        closeAll(target) {
            const instance = resolveInstance(target);
            return instance ? closeAll(instance.id) : false;
        },
        update(target, options) {
            const instance = resolveInstance(target);
            return instance ? updateInstance(instance.id, options) : null;
        },
        destroy(target) {
            return destroyInstance(target);
        },
        getState(target) {
            const instance = resolveInstance(target);
            return instance ? getState(instance) : null;
        }
    };

    JquanUIComponents.accordionApi = accordionApi;

    JquanUIComponents.accordion = {
        name: 'jquanui-accordion',
        version: '2.0.0',
        requires: [],
        install(api) {
            api.addComponents([
                `
[jq-accordion]{
  display:grid;
  gap:.75rem;
}
[jq-accordion-item]{
  border:1px solid rgb(var(--color-border, 226 232 240) / 1);
  border-radius:.875rem;
  background:rgb(var(--color-surface, 255 255 255) / 1);
  overflow:hidden;
}
[jq-accordion-item][data-state="open"]{
  box-shadow:0 10px 24px rgb(15 23 42 / .04);
}
[jq-accordion-item][data-disabled="true"]{
  opacity:.62;
}
[jq-accordion-trigger]{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  padding:1rem 1.125rem;
  border:0;
  background:transparent;
  color:rgb(var(--color-text, 15 23 42) / 1);
  cursor:pointer;
  font-weight:600;
  text-align:left;
}
[jq-accordion-trigger]::after{
  content:"+";
  font-size:18px;
  line-height:1;
  color:rgb(var(--color-text-muted, 100 116 139) / 1);
  transition:transform .2s ease;
}
[jq-accordion-trigger][data-state="open"]::after{
  transform:rotate(45deg);
}
[jq-accordion-trigger]:focus-visible{
  outline:none;
  box-shadow:inset 0 0 0 2px rgb(var(--color-primary, 59 130 246) / .22);
}
[jq-accordion-trigger][disabled]{
  cursor:not-allowed;
}
[jq-accordion-panel]{
  display:grid;
  grid-template-rows:1fr;
  overflow:hidden;
  border-top:1px solid rgb(var(--color-border, 226 232 240) / 1);
  opacity:1;
  padding:0 1.125rem 1rem;
  transition:grid-template-rows .22s ease, opacity .22s ease, border-color .22s ease, padding-bottom .22s ease;
}
[jq-accordion-panel] > *{
  min-height:0;
  overflow:hidden;
}
[jq-accordion-panel].hidden{
  display:grid;
  height:0;
  grid-template-rows:0fr;
  opacity:0;
  border-top-color:transparent;
  padding-bottom:0;
  pointer-events:none;
}
                `
            ]);

            api.addBehaviors({
                selector: '[jq-accordion]',
                setup(node) {
                    const handle = mount(node);
                    return () => {
                        if (handle) handle.destroy();
                    };
                }
            });
        }
    };
})(window);
