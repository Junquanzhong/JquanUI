(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        direction: 'horizontal',
        scrollDirection: 'left',
        autoScroll: true,
        pauseOnHover: true,
        pauseOnVisibilityHidden: true,
        speed: 1.2,
        visibleItems: 3.5,
        gap: 16,
        drag: true,
        dragMomentum: false,
        cloneFactor: 3,
        adaptiveItemSize: true
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-infinite-scroll-${runtime.seed}`;
    }

    function toNumber(value, fallback) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.direction = merged.direction === 'vertical' ? 'vertical' : 'horizontal';
        merged.scrollDirection = merged.scrollDirection === 'right' || merged.scrollDirection === 'down'
            ? merged.scrollDirection
            : (merged.direction === 'vertical' ? 'up' : 'left');
        merged.autoScroll = merged.autoScroll !== false;
        merged.pauseOnHover = merged.pauseOnHover !== false;
        merged.pauseOnVisibilityHidden = merged.pauseOnVisibilityHidden !== false;
        merged.drag = merged.drag !== false;
        merged.speed = Math.max(0.2, Math.min(12, toNumber(merged.speed, 1.2)));
        merged.visibleItems = Math.max(1, toNumber(merged.visibleItems, 3.5));
        merged.gap = Math.max(0, toNumber(merged.gap, 16));
        merged.cloneFactor = Math.max(2, toNumber(merged.cloneFactor, 3));
        return merged;
    }

    function createHandle(id) {
        return {
            id,
            play() { return resume(id); },
            pause() { return pause(id); },
            setSpeed(speed) { return setSpeed(id, speed); },
            update(next) { return updateInstance(id, next); },
            destroy() { return destroyInstance(id); },
            state() {
                const instance = runtime.instances.get(id);
                return instance ? getPublicState(instance) : null;
            },
            element() {
                const instance = runtime.instances.get(id);
                return instance ? instance.root : null;
            }
        };
    }

    function getPublicState(instance) {
        return {
            isPlaying: !instance.paused,
            speed: instance.options.speed,
            direction: instance.options.direction,
            scrollDirection: instance.options.scrollDirection,
            itemCount: instance.items.length
        };
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

    function parseNodeOptions(node) {
        return normalizeOptions({
            direction: node.getAttribute('data-scroll-direction-axis') || node.getAttribute('data-infinite-direction') || defaults.direction,
            scrollDirection: node.getAttribute('data-scroll-direction') || defaults.scrollDirection,
            autoScroll: node.getAttribute('data-infinite-autoscroll') !== 'false',
            pauseOnHover: node.getAttribute('data-infinite-pause-hover') !== 'false',
            speed: node.getAttribute('data-infinite-speed'),
            visibleItems: node.getAttribute('data-infinite-visible'),
            gap: node.getAttribute('data-infinite-gap'),
            drag: node.getAttribute('data-infinite-drag') !== 'false'
        });
    }

    function getAxisSign(instance) {
        if (instance.options.direction === 'vertical') {
            return instance.options.scrollDirection === 'down' ? 1 : -1;
        }
        return instance.options.scrollDirection === 'right' ? 1 : -1;
    }

    function createStructure(instance) {
        const root = instance.root;
        const content = root.querySelector('[jq-infinite-scroll-content]') || root.querySelector('ul') || root.querySelector('.scroll-content');
        if (!content) return false;

        const items = Array.from(content.children);
        if (items.length === 0) return false;

        instance.originalHtml = root.innerHTML;
        instance.sourceContent = content;
        instance.items = items.map(item => item.cloneNode(true));

        root.innerHTML = '';
        root.setAttribute('role', 'region');
        root.setAttribute('aria-roledescription', 'infinite scroll');
        root.setAttribute('data-infinite-ready', 'false');

        const viewport = document.createElement('div');
        viewport.className = 'jq-infinite-scroll-viewport';
        viewport.setAttribute('jq-infinite-scroll-viewport', '');

        const track = document.createElement('div');
        track.className = 'jq-infinite-scroll-track';
        track.setAttribute('jq-infinite-scroll-track', '');
        track.setAttribute('data-axis', instance.options.direction);

        const minimumCopies = Math.max(instance.items.length * instance.options.cloneFactor, Math.ceil(instance.options.visibleItems) * 4);
        const rendered = [];
        for (let i = 0; i < minimumCopies; i += 1) {
            const source = instance.items[i % instance.items.length].cloneNode(true);
            source.setAttribute('data-clone-index', String(i));
            source.setAttribute('jq-infinite-scroll-item', '');
            rendered.push(source);
            track.appendChild(source);
        }

        viewport.appendChild(track);
        root.appendChild(viewport);

        instance.viewport = viewport;
        instance.track = track;
        instance.renderedItems = rendered;
        instance.offset = 0;
        root.setAttribute('data-infinite-ready', 'true');
        return true;
    }

    function measure(instance) {
        const horizontal = instance.options.direction === 'horizontal';
        const viewportSize = horizontal ? instance.viewport.clientWidth : instance.viewport.clientHeight;
        const gap = instance.options.gap;
        const itemBaseSize = (viewportSize - (gap * (Math.ceil(instance.options.visibleItems) - 1))) / instance.options.visibleItems;

        instance.track.style.gap = `${gap}px`;
        instance.track.style.flexDirection = horizontal ? 'row' : 'column';

        instance.renderedItems.forEach(item => {
            item.style.flex = '0 0 auto';
            if (instance.options.adaptiveItemSize) {
                if (horizontal) {
                    item.style.width = `${itemBaseSize}px`;
                    item.style.minWidth = `${itemBaseSize}px`;
                } else {
                    item.style.height = `${itemBaseSize}px`;
                    item.style.minHeight = `${itemBaseSize}px`;
                }
            }
        });

        const first = instance.renderedItems[0];
        if (!first) return;
        instance.itemSize = horizontal
            ? first.getBoundingClientRect().width + gap
            : first.getBoundingClientRect().height + gap;
        instance.originalSpan = instance.itemSize * instance.items.length;
        instance.totalSpan = instance.itemSize * instance.renderedItems.length;
        applyTransform(instance);
    }

    function normalizeOffset(instance) {
        if (!instance.originalSpan) return;
        if (instance.offset <= -instance.originalSpan) {
            instance.offset += instance.originalSpan;
        } else if (instance.offset >= instance.originalSpan) {
            instance.offset -= instance.originalSpan;
        }
    }

    function applyTransform(instance) {
        normalizeOffset(instance);
        if (instance.options.direction === 'horizontal') {
            instance.track.style.transform = `translate3d(${instance.offset}px,0,0)`;
        } else {
            instance.track.style.transform = `translate3d(0,${instance.offset}px,0)`;
        }
    }

    function tick(instance) {
        if (instance.paused) return;
        instance.offset += getAxisSign(instance) * instance.options.speed;
        applyTransform(instance);
        instance.rafId = requestAnimationFrame(() => tick(instance));
    }

    function start(instance) {
        if (!instance.options.autoScroll || !instance.paused) return false;
        instance.paused = false;
        instance.root.setAttribute('data-playing', 'true');
        instance.rafId = requestAnimationFrame(() => tick(instance));
        return true;
    }

    function stop(instance) {
        if (instance.rafId) {
            cancelAnimationFrame(instance.rafId);
            instance.rafId = null;
        }
        instance.paused = true;
        instance.root.setAttribute('data-playing', 'false');
        return true;
    }

    function pause(target) {
        const instance = typeof target === 'string' ? runtime.instances.get(target) : resolveInstance(target);
        return instance ? stop(instance) : false;
    }

    function resume(target) {
        const instance = typeof target === 'string' ? runtime.instances.get(target) : resolveInstance(target);
        return instance ? start(instance) : false;
    }

    function setSpeed(target, speed) {
        const instance = typeof target === 'string' ? runtime.instances.get(target) : resolveInstance(target);
        if (!instance) return false;
        instance.options.speed = Math.max(0.2, Math.min(12, toNumber(speed, instance.options.speed)));
        return true;
    }

    function bindEvents(instance) {
        const cleanups = [];

        if (instance.options.pauseOnHover) {
            const onEnter = () => stop(instance);
            const onLeave = () => {
                if (instance.options.autoScroll) start(instance);
            };
            instance.root.addEventListener('mouseenter', onEnter);
            instance.root.addEventListener('mouseleave', onLeave);
            cleanups.push(() => instance.root.removeEventListener('mouseenter', onEnter));
            cleanups.push(() => instance.root.removeEventListener('mouseleave', onLeave));
        }

        if (instance.options.pauseOnVisibilityHidden) {
            const onVisibility = () => {
                if (document.hidden) stop(instance);
                else if (instance.options.autoScroll) start(instance);
            };
            document.addEventListener('visibilitychange', onVisibility);
            cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));
        }

        if (instance.options.drag) {
            const drag = {
                active: false,
                startX: 0,
                startY: 0,
                startOffset: 0
            };

            const onPointerDown = event => {
                drag.active = true;
                drag.startX = event.clientX;
                drag.startY = event.clientY;
                drag.startOffset = instance.offset;
                stop(instance);
                instance.track.style.transition = 'none';
            };

            const onPointerMove = event => {
                if (!drag.active) return;
                const diff = instance.options.direction === 'horizontal'
                    ? event.clientX - drag.startX
                    : event.clientY - drag.startY;
                instance.offset = drag.startOffset + diff;
                applyTransform(instance);
            };

            const onPointerUp = () => {
                if (!drag.active) return;
                drag.active = false;
                normalizeOffset(instance);
                applyTransform(instance);
                if (instance.options.autoScroll) start(instance);
            };

            instance.track.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerUp);

            cleanups.push(() => instance.track.removeEventListener('pointerdown', onPointerDown));
            cleanups.push(() => window.removeEventListener('pointermove', onPointerMove));
            cleanups.push(() => window.removeEventListener('pointerup', onPointerUp));
            cleanups.push(() => window.removeEventListener('pointercancel', onPointerUp));
        }

        instance.resizeObserver = new ResizeObserver(() => measure(instance));
        instance.resizeObserver.observe(instance.root);
        cleanups.push(() => instance.resizeObserver.disconnect());

        const imageLoadHandler = () => measure(instance);
        const images = Array.from(instance.root.querySelectorAll('img'));
        images.forEach(image => {
            if (image.complete) return;
            image.addEventListener('load', imageLoadHandler);
            image.addEventListener('error', imageLoadHandler);
            cleanups.push(() => image.removeEventListener('load', imageLoadHandler));
            cleanups.push(() => image.removeEventListener('error', imageLoadHandler));
        });

        instance.cleanup = () => cleanups.forEach(fn => fn());
    }

    function mount(root, options) {
        const existing = resolveInstance(root);
        if (existing) return createHandle(existing.id);

        const instance = {
            id: root.id || nextId(),
            root,
            options: normalizeOptions(Object.assign({}, parseNodeOptions(root), options || {})),
            sourceContent: null,
            viewport: null,
            track: null,
            items: [],
            renderedItems: [],
            originalHtml: root.innerHTML,
            itemSize: 0,
            originalSpan: 0,
            totalSpan: 0,
            offset: 0,
            paused: true,
            rafId: null,
            resizeObserver: null,
            cleanup: null
        };

        root.id = instance.id;
        runtime.instances.set(instance.id, instance);

        if (!createStructure(instance)) {
            runtime.instances.delete(instance.id);
            return null;
        }

        measure(instance);
        bindEvents(instance);
        if (instance.options.autoScroll) start(instance);
        return createHandle(instance.id);
    }

    function updateInstance(id, next) {
        const instance = runtime.instances.get(id);
        if (!instance) return null;
        const wasPlaying = !instance.paused;
        destroyStructure(instance, false);
        instance.options = normalizeOptions(Object.assign({}, instance.options, next || {}));
        if (!createStructure(instance)) return createHandle(id);
        measure(instance);
        bindEvents(instance);
        if (wasPlaying && instance.options.autoScroll) start(instance);
        return createHandle(id);
    }

    function destroyStructure(instance, restoreHtml) {
        stop(instance);
        if (instance.cleanup) {
            instance.cleanup();
            instance.cleanup = null;
        }
        if (restoreHtml !== false) {
            instance.root.innerHTML = instance.originalHtml;
            instance.root.removeAttribute('data-infinite-ready');
            instance.root.removeAttribute('data-playing');
        }
    }

    function destroyInstance(target) {
        const instance = typeof target === 'string' ? runtime.instances.get(target) : resolveInstance(target);
        if (!instance) return false;
        destroyStructure(instance, true);
        runtime.instances.delete(instance.id);
        return true;
    }

    const infiniteScrollApi = {
        mount(target, options) {
            if (typeof target === 'string') {
                const node = document.querySelector(target);
                return node ? mount(node, options) : null;
            }
            return mount(target, options);
        },
        play(target) { return resume(target); },
        pause(target) { return pause(target); },
        setSpeed(target, speed) { return setSpeed(target, speed); },
        update(target, next) {
            const instance = resolveInstance(target);
            return instance ? updateInstance(instance.id, next) : null;
        },
        destroy(target) { return destroyInstance(target); },
        getState(target) {
            const instance = resolveInstance(target);
            return instance ? getPublicState(instance) : null;
        }
    };

    JquanUIComponents.infiniteScrollApi = infiniteScrollApi;

    JquanUIComponents.infiniteScroll = {
        name: 'jquanui-infinite-scroll',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBase(`
[jq-infinite-scroll]{
  position:relative;
  display:block;
  overflow:hidden;
}
[jq-infinite-scroll-viewport]{
  position:relative;
  width:100%;
  height:100%;
  overflow:hidden;
}
[jq-infinite-scroll-track]{
  display:flex;
  width:max-content;
  will-change:transform;
  touch-action:pan-y;
}
[jq-infinite-scroll-track][data-axis="vertical"]{
  flex-direction:column;
  width:100%;
  height:max-content;
  touch-action:pan-x;
}
[jq-infinite-scroll-item]{
  flex:0 0 auto;
  box-sizing:border-box;
}
            `);

            api.addBehaviors({
                selector: '[jq-infinite-scroll]',
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
