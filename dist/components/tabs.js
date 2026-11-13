(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaultClasses = {
        root: 'jq-tabs block',
        list: 'jq-tab-list flex items-center gap-2 overflow-auto border-b border-slate-200',
        tab: `jq-tab relative ${uiPreset.classes.navItem || 'inline-flex items-center gap-2 min-h-10 px-3 rounded-lg text-slate-600 transition-colors duration-200'} justify-center font-semibold whitespace-nowrap cursor-pointer`,
        tabActive: 'text-slate-900',
        tabInactive: 'text-slate-500',
        tabContent: 'jq-tab-content relative',
        panel: 'jq-tab-panel block pt-4',
        panelHidden: 'hidden',
        track: 'jq-tab-track flex w-full',
        panelSlide: 'min-w-full w-full pt-4',
        focus: uiPreset.classes.focus || 'focus:outline-none focus:ring-2 focus:ring-blue-200'
    };

    const defaults = {
        mode: 'static',
        trigger: 'click',
        defaultIndex: 0,
        keyboard: true,
        swipeable: true,
        swipeThreshold: 48,
        hashSync: false,
        autoplay: false,
        interval: 3200,
        pauseOnHover: true,
        loop: true,
        duration: 320,
        classes: {},
        onChange: null
    };

    function nextId(prefix) {
        runtime.seed += 1;
        return `${prefix}-${runtime.seed}`;
    }

    function mergeClasses() {
        return Array.from(arguments)
            .flatMap(value => String(value || '').split(/\s+/).filter(Boolean))
            .join(' ');
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        const numberOr = (value, fallback) => {
            if (value === null || value === undefined || value === '') return fallback;
            const result = Number(value);
            return Number.isFinite(result) ? result : fallback;
        };
        merged.mode = ['static', 'fade', 'slide'].includes(merged.mode) ? merged.mode : 'static';
        merged.trigger = merged.trigger === 'hover' ? 'hover' : 'click';
        merged.defaultIndex = Math.max(0, numberOr(merged.defaultIndex, 0) || 0);
        merged.interval = Math.max(1200, numberOr(merged.interval, 3200) || 3200);
        merged.duration = Math.max(0, numberOr(merged.duration, 320));
        merged.swipeThreshold = Math.max(0, numberOr(merged.swipeThreshold, 48));
        merged.loop = merged.loop !== false;
        merged.keyboard = merged.keyboard !== false;
        merged.swipeable = merged.swipeable !== false;
        merged.classes = Object.assign({}, defaultClasses, input?.classes || {});
        return merged;
    }

    function resolveInstance(target) {
        if (!target) return null;
        if (typeof target === 'object' && typeof target.state === 'function') return Array.from(runtime.instances.values()).find(instance => instance.handle === target) || null;
        if (typeof target === 'string') {
            if (runtime.instances.has(target)) return runtime.instances.get(target);
            for (const instance of runtime.instances.values()) {
                if (instance.root.matches(target)) return instance;
            }
            const found = document.querySelector(target);
            return found ? resolveInstance(found) : null;
        }
        for (const instance of runtime.instances.values()) {
            if (instance.root === target) return instance;
        }
        for (const instance of Array.from(runtime.instances.values()).reverse()) {
            if (target instanceof Node && instance.root.contains(target)) return instance;
        }
        return null;
    }

    function parseNodeOptions(node) {
        return normalizeOptions({
            mode: node.getAttribute('data-tabs-mode') || defaults.mode,
            trigger: node.getAttribute('data-tabs-trigger') || defaults.trigger,
            defaultIndex: node.getAttribute('data-tabs-default'),
            keyboard: node.getAttribute('data-tabs-keyboard') !== 'false',
            swipeable: node.getAttribute('data-tabs-swipe') !== 'false',
            swipeThreshold: node.getAttribute('data-tabs-swipe-threshold'),
            hashSync: node.getAttribute('data-tabs-hash-sync') === 'true',
            autoplay: node.getAttribute('data-tabs-autoplay') === 'true',
            interval: node.getAttribute('data-tabs-interval'),
            pauseOnHover: node.getAttribute('data-tabs-pause-hover') !== 'false',
            loop: node.getAttribute('data-tabs-loop') !== 'false',
            duration: node.getAttribute('data-tabs-duration')
        });
    }

    function createHandle(id) {
        const owner = runtime.instances.get(id);
        if (!owner) return null;
        if (owner.handle) return owner.handle;
        const live = () => owner && runtime.instances.get(id) === owner && !owner.destroyed;
        return owner.handle = {
            id,
            goTo(index, options) { return live() ? activate(id, index, options) : false; },
            next() { return live() ? next(id) : false; },
            prev() { return live() ? prev(id) : false; },
            play() { return live() ? startAutoplay(id) : false; },
            pause() { return live() ? stopAutoplay(id) : false; },
            setInterval(interval) { return live() ? setIntervalMs(id, interval) : false; },
            setAutoplay(autoplay) { return live() ? setAutoplay(id, autoplay) : false; },
            setLoop(loop) { return live() ? setLoop(id, loop) : false; },
            update(nextOptions) { return live() ? updateInstance(id, nextOptions) : null; },
            destroy() { return live() ? destroyInstance(id) : false; },
            state() {
                return live() ? {
                    currentIndex: owner.state.currentIndex,
                    total: owner.tabs.length,
                    mode: owner.options.mode,
                    isPlaying: !!owner.state.timer,
                    interval: owner.options.interval,
                    autoplay: !!owner.options.autoplay,
                    loop: owner.options.loop
                } : null;
            },
            element() {
                return live() ? owner.root : null;
            }
        };
    }

    function setupStructure(instance) {
        const root = instance.root;
        const list = root.querySelector('[jq-tab-list]') || root.querySelector('.tabs-nav');
        const tabs = list ? Array.from(list.querySelectorAll('[jq-tab], .tabs-item')) : [];
        const content = root.querySelector('[jq-tab-content]') || root.querySelector('.tabs-content') || root;
        const panels = Array.from(content.querySelectorAll('[jq-tab-panel], .tabs-panel'));
        if (!list || tabs.length === 0 || panels.length === 0) return false;

        instance.list = list;
        instance.tabs = tabs;
        instance.content = content;
        instance.panels = tabs.map((tab, index) => {
            const target = tab.getAttribute('jq-target') || tab.getAttribute('data-tab-target');
            if (target) return root.querySelector(target) || document.querySelector(target);
            return panels[index] || null;
        }).filter(Boolean);
        if (instance.panels.length === 0) return false;

        if (!instance.baseRootClass) instance.baseRootClass = root.className;
        root.className = mergeClasses(instance.options.classes.root, instance.baseRootClass);
        root.setAttribute('data-tabs-mode', instance.options.mode);
        if (!instance.baseListClass) instance.baseListClass = list.className;
        list.className = mergeClasses(instance.options.classes.list, instance.baseListClass);
        list.setAttribute('role', 'tablist');
        list.setAttribute('aria-orientation', 'horizontal');
        if (!instance.baseContentClass) instance.baseContentClass = content.className;
        content.className = mergeClasses(instance.options.classes.tabContent, instance.baseContentClass);

        if (instance.options.mode === 'slide') {
            let track = content.querySelector('[jq-tab-track]');
            if (!track) {
                track = document.createElement('div');
                track.setAttribute('jq-tab-track', '');
                instance.panels.forEach(panel => track.appendChild(panel));
                content.appendChild(track);
            }
            if (!instance.baseTrackClass) instance.baseTrackClass = track.className;
            track.className = mergeClasses(instance.options.classes.track, instance.baseTrackClass);
            instance.track = track;
            content.classList.add('overflow-hidden');
        } else {
            instance.track = null;
            content.classList.remove('overflow-hidden');
        }

        instance.tabs.forEach((tab, index) => {
            if (!tab.id) tab.id = nextId('jq-tab');
            if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
            if (tab.tagName === 'BUTTON' && !tab.hasAttribute('type')) tab.setAttribute('type', 'button');
            tab.dataset.tabIndex = String(index);
            if (!tab.dataset.baseClass) tab.dataset.baseClass = tab.className;
            tab.className = mergeClasses(instance.options.classes.tab, instance.options.classes.focus, tab.dataset.baseClass);

            const panel = instance.panels[index];
            if (panel) {
                if (!panel.id) panel.id = nextId('jq-tab-panel');
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tab.id);
                tab.setAttribute('aria-controls', panel.id);
                if (!panel.dataset.baseClass) panel.dataset.baseClass = panel.className;
                panel.className = mergeClasses(instance.options.classes.panel, instance.options.mode === 'slide' && instance.options.classes.panelSlide, panel.dataset.baseClass);
            }
        });
        return true;
    }

    function getInitialIndex(instance) {
        let index = instance.options.defaultIndex;
        if (instance.options.hashSync && window.location.hash) {
            const hashIndex = instance.panels.findIndex(panel => panel && `#${panel.id}` === window.location.hash);
            if (hashIndex !== -1) index = hashIndex;
        }
        const activeIndex = instance.tabs.findIndex(tab => tab.getAttribute('data-state') === 'active' || tab.classList.contains('is-active'));
        if (activeIndex !== -1) index = activeIndex;
        return Math.max(0, Math.min(index, instance.panels.length - 1));
    }

    function updateNavScroll(instance, index) {
        const active = instance.tabs[index];
        if (!active || typeof instance.list.scrollTo !== 'function') return;
        const listRect = instance.list.getBoundingClientRect();
        const itemRect = active.getBoundingClientRect();
        const nextLeft = instance.list.scrollLeft + (itemRect.left - listRect.left) - (listRect.width / 2) + (itemRect.width / 2);
        instance.list.scrollTo({ left: nextLeft, behavior: 'smooth' });
    }

    function applyState(instance, index, animate) {
        instance.tabs.forEach((tab, tabIndex) => {
            const active = tabIndex === index;
            tab.setAttribute('data-state', active ? 'active' : 'inactive');
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.setAttribute('tabindex', active ? '0' : '-1');
            tab.classList.toggle('is-active', active);
            tab.className = mergeClasses(
                instance.options.classes.tab,
                instance.options.classes.focus,
                active ? instance.options.classes.tabActive : instance.options.classes.tabInactive,
                tab.dataset.baseClass
            );
        });

        if (instance.options.mode === 'slide' && instance.track) {
            instance.track.style.transition = animate ? `transform ${instance.options.duration}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none';
            instance.track.style.transform = `translate3d(${-index * 100}%,0,0)`;
        }

        instance.panels.forEach((panel, panelIndex) => {
            const active = panelIndex === index;
            panel.setAttribute('data-state', active ? 'active' : 'inactive');
            panel.classList.toggle('is-active', active);
            if (instance.options.mode === 'slide') {
                panel.hidden = false;
                panel.classList.remove('hidden');
            } else {
                panel.hidden = !active;
                panel.classList.toggle('hidden', !active);
            }
            if (instance.options.mode === 'fade') {
                panel.classList.toggle('opacity-0', !active);
                panel.classList.toggle('opacity-100', active);
                panel.classList.add('transition-opacity', 'duration-300');
            }
        });

        instance.state.currentIndex = index;
        updateNavScroll(instance, index);

        if (instance.options.hashSync) {
            const panel = instance.panels[index];
            if (panel && panel.id) history.replaceState(null, '', `#${panel.id}`);
        }
    }

    function emitChange(instance) {
        if (instance.destroyed || runtime.instances.get(instance.id) !== instance) return;
        const generation = instance.generation;
        const panel = instance.panels[instance.state.currentIndex];
        const detail = {
            index: instance.state.currentIndex,
            panel,
            instance: createHandle(instance.id)
        };
        if (typeof instance.options.onChange === 'function') {
            instance.options.onChange(detail.index, detail.panel, detail.instance);
        }
        if (instance.destroyed || runtime.instances.get(instance.id) !== instance || generation !== instance.generation) return;
        instance.root.dispatchEvent(new CustomEvent('jquan:tabs:change', {
            bubbles: true,
            detail
        }));
    }

    function activate(id, nextIndex, options) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.destroyed || instance.state.animating) return false;
        const opts = Object.assign({ animate: true, focus: false }, options || {});
        const total = instance.panels.length;
        let index = Number(nextIndex);
        if (!Number.isFinite(index)) return false;
        if (instance.options.loop) index = ((index % total) + total) % total;
        else index = Math.max(0, Math.min(index, total - 1));
        if (index === instance.state.currentIndex && !opts.force) return true;
        instance.state.animating = true;
        applyState(instance, index, opts.animate !== false);
        const generation = instance.generation;
        const finalize = () => {
            if (runtime.instances.get(id) !== instance || instance.destroyed || generation !== instance.generation) return;
            instance.transitionTimer = null;
            instance.state.animating = false;
            if (opts.focus) instance.tabs[index].focus();
            emitChange(instance);
        };
        if (opts.animate !== false && instance.options.duration > 0) {
            instance.transitionTimer = window.setTimeout(finalize, instance.options.duration);
        } else {
            finalize();
        }
        return true;
    }

    function next(id) {
        const instance = runtime.instances.get(id);
        return instance ? activate(id, instance.state.currentIndex + 1) : false;
    }

    function prev(id) {
        const instance = runtime.instances.get(id);
        return instance ? activate(id, instance.state.currentIndex - 1) : false;
    }

    function stopAutoplay(target) {
        const instance = resolveInstance(target);
        if (!instance || !instance.state.timer) return false;
        clearInterval(instance.state.timer);
        instance.state.timer = null;
        instance.root.setAttribute('data-tabs-playing', 'false');
        return true;
    }

    function startAutoplay(target) {
        const instance = resolveInstance(target);
        if (!instance || !instance.options.autoplay || instance.state.timer) return false;
        instance.state.timer = window.setInterval(() => next(instance.id), instance.options.interval);
        instance.root.setAttribute('data-tabs-playing', 'true');
        return true;
    }

    function setIntervalMs(target, interval) {
        const instance = resolveInstance(target);
        const next = Number(interval);
        if (!instance || !Number.isFinite(next) || next < 1200) return false;
        const wasPlaying = !!instance.state.timer;
        if (wasPlaying) stopAutoplay(instance.id);
        instance.options.interval = next;
        if (wasPlaying && instance.options.autoplay) startAutoplay(instance.id);
        instance.root.dispatchEvent(new CustomEvent('jquan:tabs:update', { bubbles: true, detail: { option: 'interval', value: next, instance: createHandle(instance.id) } }));
        return true;
    }

    function setAutoplay(target, autoplay) {
        const instance = resolveInstance(target);
        if (!instance || typeof autoplay !== 'boolean') return false;
        instance.options.autoplay = autoplay;
        if (autoplay) startAutoplay(instance.id); else stopAutoplay(instance.id);
        instance.root.dispatchEvent(new CustomEvent('jquan:tabs:update', { bubbles: true, detail: { option: 'autoplay', value: autoplay, instance: createHandle(instance.id) } }));
        return true;
    }

    function setLoop(target, loop) {
        const instance = resolveInstance(target);
        if (!instance || typeof loop !== 'boolean') return false;
        instance.options.loop = loop;
        instance.root.dispatchEvent(new CustomEvent('jquan:tabs:update', { bubbles: true, detail: { option: 'loop', value: loop, instance: createHandle(instance.id) } }));
        return true;
    }

    function bindEvents(instance) {
        const cleanups = [];
        const onActivate = event => {
            const tab = event.target.closest('[jq-tab], .tabs-item');
            if (!tab || !instance.root.contains(tab)) return;
            const index = Number(tab.dataset.tabIndex);
            if (!Number.isFinite(index)) return;
            stopAutoplay(instance.id);
            activate(instance.id, index);
        };

        if (instance.options.trigger === 'hover') {
            instance.list.addEventListener('mouseenter', onActivate, true);
            cleanups.push(() => instance.list.removeEventListener('mouseenter', onActivate, true));
        } else {
            instance.list.addEventListener('click', onActivate);
            cleanups.push(() => instance.list.removeEventListener('click', onActivate));
        }

        if (instance.options.keyboard) {
            const onKeyDown = event => {
                const current = event.target.closest('[jq-tab], .tabs-item');
                if (!current || !instance.root.contains(current)) return;
                let nextIndex = instance.state.currentIndex;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex += 1;
                else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex -= 1;
                else if (event.key === 'Home') nextIndex = 0;
                else if (event.key === 'End') nextIndex = instance.tabs.length - 1;
                else return;
                event.preventDefault();
                stopAutoplay(instance.id);
                activate(instance.id, nextIndex, { focus: true });
            };
            instance.list.addEventListener('keydown', onKeyDown);
            cleanups.push(() => instance.list.removeEventListener('keydown', onKeyDown));
        }

        if (instance.options.swipeable) {
            const touch = { startX: 0, startY: 0, dragging: false };
            const onTouchStart = event => {
                const point = event.touches[0];
                touch.startX = point.clientX;
                touch.startY = point.clientY;
                touch.dragging = true;
                stopAutoplay(instance.id);
                if (instance.options.mode === 'slide' && instance.track) {
                    instance.track.style.transition = 'none';
                }
            };
            const onTouchMove = event => {
                if (!touch.dragging || instance.options.mode !== 'slide' || !instance.track) return;
                const point = event.touches[0];
                const diffX = point.clientX - touch.startX;
                const diffY = point.clientY - touch.startY;
                if (Math.abs(diffY) > Math.abs(diffX)) {
                    touch.dragging = false;
                    return;
                }
                if (event.cancelable) event.preventDefault();
                const movePercent = (diffX / Math.max(1, instance.content.offsetWidth)) * 100;
                instance.track.style.transform = `translate3d(${(-instance.state.currentIndex * 100) + movePercent}%,0,0)`;
            };
            const onTouchEnd = event => {
                if (!touch.dragging) return;
                touch.dragging = false;
                const point = event.changedTouches[0];
                const diffX = point.clientX - touch.startX;
                if (Math.abs(diffX) > instance.options.swipeThreshold) {
                    if (diffX < 0) next(instance.id);
                    else prev(instance.id);
                } else {
                    activate(instance.id, instance.state.currentIndex, { force: true });
                }
            };
            instance.content.addEventListener('touchstart', onTouchStart, { passive: true });
            instance.content.addEventListener('touchmove', onTouchMove, { passive: false });
            instance.content.addEventListener('touchend', onTouchEnd);
            cleanups.push(() => instance.content.removeEventListener('touchstart', onTouchStart));
            cleanups.push(() => instance.content.removeEventListener('touchmove', onTouchMove));
            cleanups.push(() => instance.content.removeEventListener('touchend', onTouchEnd));
        }

        if (instance.options.autoplay && instance.options.pauseOnHover) {
            const onEnter = () => stopAutoplay(instance.id);
            const onLeave = () => startAutoplay(instance.id);
            instance.root.addEventListener('mouseenter', onEnter);
            instance.root.addEventListener('mouseleave', onLeave);
            cleanups.push(() => instance.root.removeEventListener('mouseenter', onEnter));
            cleanups.push(() => instance.root.removeEventListener('mouseleave', onLeave));
        }

        instance.cleanup = () => cleanups.forEach(fn => fn());
    }

    function mount(root, options) {
        if (!root) return null;
        const existing = Array.from(runtime.instances.values()).find(instance => instance.root === root);
        if (existing) return createHandle(existing.id);
        if (root.id && runtime.instances.has(root.id)) destroyInstance(root.id);
        const instance = {
            id: root.id || nextId('jq-tabs'),
            root,
            options: normalizeOptions(Object.assign({}, parseNodeOptions(root), options || {})),
            list: null,
            content: null,
            track: null,
            tabs: [],
            panels: [],
            cleanup: null,
            state: {
                currentIndex: -1,
                animating: false,
                timer: null
            },
            destroyed: false,
            generation: 0,
            transitionTimer: null
        };
        root.id = instance.id;
        runtime.instances.set(instance.id, instance);
        createHandle(instance.id);
        if (!setupStructure(instance)) {
            runtime.instances.delete(instance.id);
            return null;
        }
        bindEvents(instance);
        activate(instance.id, getInitialIndex(instance), { animate: false, force: true });
        if (runtime.instances.get(instance.id) !== instance || instance.destroyed) return null;
        if (instance.options.autoplay) startAutoplay(instance.id);
        return instance.handle;
    }

    function updateInstance(id, nextOptions) {
        const instance = runtime.instances.get(id);
        if (!instance) return null;
        const currentIndex = instance.state.currentIndex;
        instance.generation += 1;
        if (instance.transitionTimer) {
            clearTimeout(instance.transitionTimer);
            instance.transitionTimer = null;
        }
        instance.state.animating = false;
        stopAutoplay(id);
        if (instance.cleanup) instance.cleanup();
        instance.options = normalizeOptions(Object.assign({}, instance.options, nextOptions || {}));
        setupStructure(instance);
        bindEvents(instance);
        activate(id, Math.min(currentIndex, instance.panels.length - 1), { animate: false, force: true });
        if (runtime.instances.get(id) !== instance || instance.destroyed) return null;
        if (instance.options.autoplay) startAutoplay(id);
        return instance.handle;
    }

    function destroyInstance(target) {
        const instance = resolveInstance(target);
        if (!instance) return false;
        instance.destroyed = true;
        instance.generation += 1;
        if (instance.transitionTimer) {
            clearTimeout(instance.transitionTimer);
            instance.transitionTimer = null;
        }
        instance.state.animating = false;
        stopAutoplay(instance.id);
        if (instance.cleanup) instance.cleanup();
        runtime.instances.delete(instance.id);
        return true;
    }

    const tabsApi = {
        getHandle(target) {
            const instance = resolveInstance(target);
            return instance ? createHandle(instance.id) : null;
        },
        mount(target, options) {
            if (typeof target === 'string') {
                const node = document.querySelector(target);
                return node ? mount(node, options) : null;
            }
            return mount(target, options);
        },
        goTo(target, index, options) {
            const instance = resolveInstance(target);
            return instance ? activate(instance.id, index, options) : false;
        },
        next(target) {
            const instance = resolveInstance(target);
            return instance ? next(instance.id) : false;
        },
        prev(target) {
            const instance = resolveInstance(target);
            return instance ? prev(instance.id) : false;
        },
        play(target) {
            return startAutoplay(target);
        },
        pause(target) {
            return stopAutoplay(target);
        },
        update(target, nextOptions) {
            const instance = resolveInstance(target);
            return instance ? updateInstance(instance.id, nextOptions) : null;
        },
        destroy(target) {
            return destroyInstance(target);
        },
        getState(target) {
            const instance = resolveInstance(target);
            return instance ? createHandle(instance.id).state() : null;
        }
    };

    JquanUIComponents.tabsApi = tabsApi;

    JquanUIComponents.tabs = {
        name: 'jquanui-tabs',
        version: '2.5.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-tabs]',
                setup(node) {
                    if (!node.isConnected) return;
                    const handle = mount(node);
                    return () => {
                        if (handle) handle.destroy();
                    };
                }
            });
        }
    };
})(window);
