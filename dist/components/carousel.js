(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        selector: '[jq-carousel]',
        direction: 'horizontal',
        autoplay: true,
        interval: 4000,
        speed: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pauseOnHover: true,
        pauseOnVisibilityHidden: true,
        arrows: true,
        indicators: true,
        keyboard: true,
        drag: true,
        infinite: true,
        visibleCount: 1,
        slidesPerScroll: 1,
        startIndex: 0,
        gap: 0,
        dragThreshold: 0.18,
        adaptiveHeight: false,
        progress: false,
        thumbnails: false,
        thumbnailsTarget: null,
        indicatorsTarget: null,
        syncTarget: null,
        onChange: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-carousel-${runtime.seed}`;
    }

    function toNumber(value, fallback) {
        if (value === null || value === undefined || value === '') return fallback;
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.visibleCount = Math.max(1, toNumber(merged.visibleCount, 1));
        merged.slidesPerScroll = Math.max(1, toNumber(merged.slidesPerScroll, 1));
        merged.interval = Math.max(1200, toNumber(merged.interval, 4000));
        merged.speed = Math.max(0, toNumber(merged.speed, 420));
        merged.startIndex = Math.max(0, toNumber(merged.startIndex, 0));
        merged.gap = Math.max(0, toNumber(merged.gap, 0));
        merged.dragThreshold = Math.max(0.05, Math.min(0.8, Number(merged.dragThreshold) || 0.18));
        merged.direction = merged.direction === 'vertical' ? 'vertical' : 'horizontal';
        merged.infinite = merged.infinite !== false;
        merged.autoplay = merged.autoplay !== false;
        return merged;
    }

    function createHandle(id) {
        const owner = runtime.instances.get(id);
        if (!owner) return null;
        if (owner.handle) return owner.handle;
        const live = () => owner && runtime.instances.get(id) === owner && !owner.destroyed;
        return owner.handle = {
            id,
            next() { return live() ? moveNext(id) : false; },
            prev() { return live() ? movePrev(id) : false; },
            goTo(index, animate) { return live() ? goTo(id, index, animate) : false; },
            goToPage(page, animate) { return live() ? goToPage(id, page, animate) : false; },
            play() { return live() ? play(id) : false; },
            pause() { return live() ? pause(id) : false; },
            setInterval(interval) { return live() ? setIntervalMs(id, interval) : false; },
            setAutoplay(autoplay) { return live() ? setAutoplay(id, autoplay) : false; },
            setIndicators(indicators) { return live() ? setControl(id, 'indicators', indicators) : false; },
            setProgress(progress) { return live() ? setControl(id, 'progress', progress) : false; },
            update(next) { return live() ? updateInstance(id, next) : null; },
            destroy() { return live() ? destroyInstance(id) : false; },
            state() {
                return live() ? getPublicState(owner) : null;
            },
            element() {
                return live() ? owner.root : null;
            }
        };
    }

    function getPublicState(instance) {
        const currentIndex = instance.state.selectedIndex ?? getRealIndex(instance);
        const pageCount = Math.max(1, Math.ceil(instance.realCount / instance.options.slidesPerScroll));
        const progressPercent = instance.options.autoplay
            ? Math.max(0, Math.min(1, 1 - ((instance.state.remainingMs || instance.options.interval) / instance.options.interval)))
            : 0;
        return {
            currentIndex,
            currentPage: Math.floor(currentIndex / instance.options.slidesPerScroll),
            pageCount,
            total: instance.realCount,
            isPlaying: !!instance.timer,
            isDragging: instance.state.dragging,
            visibleCount: instance.options.visibleCount,
            interval: instance.options.interval,
            autoplay: instance.options.autoplay,
            indicators: !!instance.options.indicators,
            progress: !!instance.options.progress,
            thumbnails: !!instance.options.thumbnails,
            syncTarget: instance.options.syncTarget || null,
            progressPercent: Number(progressPercent.toFixed(3))
        };
    }

    function emit(instance, eventName, detail) {
        if (instance.destroyed || runtime.instances.get(instance.id) !== instance) return;
        instance.root.dispatchEvent(new CustomEvent(`jquan:carousel:${eventName}`, {
            bubbles: true,
            detail: Object.assign({
                index: getRealIndex(instance),
                total: instance.realCount,
                state: getPublicState(instance),
                instance: createHandle(instance.id)
            }, detail || {})
        }));
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
        for (const instance of runtime.instances.values()) if (instance.root === target) return instance;
        for (const instance of Array.from(runtime.instances.values()).reverse()) if (target instanceof Node && instance.root.contains(target)) return instance;
        return null;
    }

    function parseNodeOptions(node) {
        return normalizeOptions({
            direction: node.getAttribute('data-carousel-direction') || defaults.direction,
            autoplay: node.getAttribute('data-carousel-autoplay') !== 'false',
            interval: node.getAttribute('data-carousel-interval'),
            speed: node.getAttribute('data-carousel-speed'),
            easing: node.getAttribute('data-carousel-easing') || defaults.easing,
            pauseOnHover: node.getAttribute('data-carousel-pause-hover') !== 'false',
            arrows: node.getAttribute('data-carousel-arrows') !== 'false',
            indicators: node.getAttribute('data-carousel-indicators') !== 'false',
            keyboard: node.getAttribute('data-carousel-keyboard') !== 'false',
            drag: node.getAttribute('data-carousel-drag') !== 'false',
            infinite: node.getAttribute('data-carousel-infinite') !== 'false',
            visibleCount: node.getAttribute('data-carousel-visible'),
            slidesPerScroll: node.getAttribute('data-carousel-step'),
            startIndex: node.getAttribute('data-carousel-start'),
            gap: node.getAttribute('data-carousel-gap'),
            dragThreshold: node.getAttribute('data-carousel-threshold'),
            adaptiveHeight: node.getAttribute('data-carousel-adaptive-height') === 'true',
            progress: node.getAttribute('data-carousel-progress') === 'true',
            thumbnails: node.getAttribute('data-carousel-thumbs') === 'true',
            thumbnailsTarget: node.getAttribute('data-carousel-thumbs-target'),
            indicatorsTarget: node.getAttribute('data-carousel-indicators-target'),
            syncTarget: node.getAttribute('data-carousel-sync-target')
        });
    }

    function resolveMountTarget(value) {
        if (!value) return null;
        if (typeof value === 'string') return document.querySelector(value);
        return value && value.nodeType === 1 ? value : null;
    }

    function createStructure(instance) {
        const root = instance.root;
        const template = document.createElement('template');
        template.innerHTML = instance.originalHtml;
        const items = Array.from(template.content.querySelectorAll('[jq-carousel-item]'));
        instance.realCount = items.length;
        if (instance.realCount === 0) return false;

        root.innerHTML = '';
        root.setAttribute('tabindex', root.hasAttribute('tabindex') ? root.getAttribute('tabindex') : '0');
        root.setAttribute('role', 'region');
        root.setAttribute('aria-roledescription', 'carousel');
        root.setAttribute('aria-live', 'off');
        root.dataset.carouselReady = 'false';

        const viewport = document.createElement('div');
        viewport.className = 'jq-carousel-viewport';
        viewport.setAttribute('jq-carousel-viewport', '');

        const track = document.createElement('div');
        track.className = 'jq-carousel-track';
        track.setAttribute('jq-carousel-track', '');
        if (instance.options.direction === 'vertical') {
            track.setAttribute('data-carousel-direction', 'vertical');
        }

        const visibleCount = instance.options.visibleCount;
        const shouldClone = instance.options.infinite && instance.realCount > visibleCount;

        const createSlide = (source, realIndex, isClone) => {
            const slide = document.createElement('div');
            slide.className = 'jq-carousel-slide';
            slide.setAttribute('jq-carousel-slide', '');
            slide.setAttribute('data-carousel-real-index', String(realIndex));
            if (isClone) {
                slide.setAttribute('aria-hidden', 'true');
                slide.setAttribute('data-carousel-clone', 'true');
            }
            slide.appendChild(source.cloneNode(true));
            return slide;
        };

        const slides = [];
        if (shouldClone) {
            items.slice(-visibleCount).forEach((item, idx) => {
                slides.push(createSlide(item, instance.realCount - visibleCount + idx, true));
            });
        }
        items.forEach((item, idx) => {
            slides.push(createSlide(item, idx, false));
        });
        if (shouldClone) {
            items.slice(0, visibleCount).forEach((item, idx) => {
                slides.push(createSlide(item, idx, true));
            });
        }

        slides.forEach(slide => track.appendChild(slide));
        viewport.appendChild(track);
        root.appendChild(viewport);

        instance.viewport = viewport;
        instance.track = track;
        instance.slides = slides;
        instance.hasClones = shouldClone;
        instance.cloneOffset = shouldClone ? visibleCount : 0;
        instance.state.current = instance.cloneOffset + Math.min(instance.options.startIndex, Math.max(0, instance.realCount - 1));
        instance.state.dragOffset = 0;

        if (instance.options.arrows) createArrows(instance);
        if (instance.options.indicators) createIndicators(instance);
        if (instance.options.progress) createProgress(instance);
        if (instance.options.thumbnails) createThumbnails(instance, items);

        root.dataset.carouselReady = 'true';
        return true;
    }

    function createArrows(instance) {
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'jq-carousel-arrow jq-carousel-arrow-prev';
        prev.setAttribute('jq-carousel-prev', '');
        prev.setAttribute('aria-label', 'Previous slide');
        prev.textContent = '<';

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'jq-carousel-arrow jq-carousel-arrow-next';
        next.setAttribute('jq-carousel-next', '');
        next.setAttribute('aria-label', 'Next slide');
        next.textContent = '>';

        instance.root.appendChild(prev);
        instance.root.appendChild(next);
        instance.prevButton = prev;
        instance.nextButton = next;
    }

    function createIndicators(instance) {
        const wrap = document.createElement('div');
        wrap.className = 'jq-carousel-indicators';
        wrap.setAttribute('jq-carousel-indicators', '');

        const pageCount = Math.ceil(instance.realCount / instance.options.slidesPerScroll);
        const indicators = [];
        for (let i = 0; i < pageCount; i += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'jq-carousel-indicator';
            button.setAttribute('jq-carousel-indicator', '');
            button.setAttribute('aria-label', `Go to slide ${i + 1}`);
            button.dataset.pageIndex = String(i);
            wrap.appendChild(button);
            indicators.push(button);
        }

        const target = resolveMountTarget(instance.options.indicatorsTarget);
        if (target) {
            target.innerHTML = '';
            target.appendChild(wrap);
        } else {
            instance.root.appendChild(wrap);
        }
        instance.indicators = indicators;
        instance.indicatorWrap = wrap;
    }

    function createProgress(instance) {
        const wrap = document.createElement('div');
        wrap.className = 'jq-carousel-progress';
        wrap.setAttribute('jq-carousel-progress', '');

        const bar = document.createElement('span');
        bar.className = 'jq-carousel-progress-bar';
        bar.setAttribute('jq-carousel-progress-bar', '');
        wrap.appendChild(bar);

        instance.root.appendChild(wrap);
        instance.progressWrap = wrap;
        instance.progressBar = bar;
    }

    function createThumbnails(instance, items) {
        const wrap = document.createElement('div');
        wrap.className = 'jq-carousel-thumbs';
        wrap.setAttribute('jq-carousel-thumbs', '');

        const thumbs = [];
        items.forEach((item, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'jq-carousel-thumb';
            button.setAttribute('jq-carousel-thumb', '');
            button.setAttribute('aria-label', `Go to slide ${index + 1}`);
            button.dataset.pageIndex = String(index);

            const thumbLabel = item.getAttribute('data-carousel-thumb');
            const thumbSrc = item.getAttribute('data-carousel-thumb-src');
            const thumbAlt = item.getAttribute('data-carousel-thumb-alt') || thumbLabel || `Slide ${index + 1}`;
            if (thumbSrc) {
                const image = document.createElement('img');
                image.className = 'jq-carousel-thumb-image';
                image.src = thumbSrc;
                image.alt = thumbAlt;
                image.loading = 'lazy';
                button.appendChild(image);
            } else if (thumbLabel) {
                const text = document.createElement('span');
                text.className = 'jq-carousel-thumb-label';
                text.textContent = thumbLabel;
                button.appendChild(text);
            } else {
                const preview = document.createElement('div');
                preview.className = 'jq-carousel-thumb-preview';
                preview.appendChild(item.cloneNode(true));
                button.appendChild(preview);
            }

            wrap.appendChild(button);
            thumbs.push(button);
        });

        const target = resolveMountTarget(instance.options.thumbnailsTarget);
        if (target) {
            target.innerHTML = '';
            target.appendChild(wrap);
        } else {
            instance.root.appendChild(wrap);
        }
        instance.thumbs = thumbs;
        instance.thumbWrap = wrap;
    }

    function centerActiveThumb(instance, activeButton) {
        if (!instance.thumbWrap || !activeButton) return;
        const wrap = instance.thumbWrap;
        const wrapRect = wrap.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const delta = (buttonRect.left + (buttonRect.width / 2)) - (wrapRect.left + (wrapRect.width / 2));
        if (Math.abs(delta) < 2) return;
        wrap.scrollTo({
            left: wrap.scrollLeft + delta,
            behavior: 'smooth'
        });
    }

    function measure(instance) {
        if (instance.destroyed || runtime.instances.get(instance.id) !== instance || !instance.viewport || !instance.track) return;

        const horizontal = instance.options.direction === 'horizontal';
        const viewportSize = horizontal ? instance.viewport.clientWidth : instance.viewport.clientHeight;
        const totalGap = instance.options.gap * Math.max(0, instance.options.visibleCount - 1);
        const slideSize = (viewportSize - totalGap) / instance.options.visibleCount;

        instance.metrics.viewportSize = viewportSize;
        instance.metrics.slideSize = slideSize;
        instance.metrics.stepSize = slideSize + instance.options.gap;

        instance.track.style.gap = `${instance.options.gap}px`;
        instance.slides.forEach(slide => {
            if (horizontal) {
                slide.style.width = `${slideSize}px`;
                slide.style.minWidth = `${slideSize}px`;
                slide.style.height = '100%';
            } else {
                slide.style.height = `${slideSize}px`;
                slide.style.minHeight = `${slideSize}px`;
                slide.style.width = '100%';
            }
        });

        if (instance.options.adaptiveHeight && horizontal) {
            const active = getActiveSlides(instance);
            const maxHeight = active.reduce((max, slide) => Math.max(max, slide.offsetHeight), 0);
            if (maxHeight > 0) instance.viewport.style.height = `${maxHeight}px`;
        }

        renderPosition(instance, false);
    }

    function renderPosition(instance, animate, dragOffset) {
        const horizontal = instance.options.direction === 'horizontal';
        const offset = -(instance.state.current * instance.metrics.stepSize) + (dragOffset || 0);
        instance.track.style.transition = animate ? `transform ${instance.options.speed}ms ${instance.options.easing}` : 'none';
        instance.track.style.transform = horizontal
            ? `translate3d(${offset}px,0,0)`
            : `translate3d(0,${offset}px,0)`;
        instance.state.animating = animate;
    }

    function getRealIndex(instance) {
        if (!instance.hasClones) return Math.max(0, Math.min(instance.state.current, instance.realCount - 1));
        let index = instance.state.current - instance.cloneOffset;
        while (index < 0) index += instance.realCount;
        return index % instance.realCount;
    }

    function getActiveSlides(instance) {
        const start = instance.state.current;
        return instance.slides.slice(start, start + instance.options.visibleCount);
    }

    function syncUi(instance) {
        const realIndex = getRealIndex(instance);
        const selectedIndex = instance.state.selectedIndex ?? realIndex;
        instance.root.setAttribute('data-carousel-index', String(selectedIndex));

        instance.slides.forEach((slide, idx) => {
            const active = instance.options.syncTarget && !instance.options.infinite && instance.options.visibleCount >= instance.realCount
                ? Number(slide.getAttribute('data-carousel-real-index')) === selectedIndex
                : (idx >= instance.state.current && idx < instance.state.current + instance.options.visibleCount);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            slide.setAttribute('data-carousel-active', active ? 'true' : 'false');
        });

        if (instance.indicators) {
            const page = Math.floor(realIndex / instance.options.slidesPerScroll);
            instance.indicators.forEach((button, idx) => {
                const active = idx === page;
                button.setAttribute('aria-current', active ? 'true' : 'false');
                button.setAttribute('data-active', active ? 'true' : 'false');
            });
        }

        if (instance.thumbs) {
            let activeThumb = null;
            instance.thumbs.forEach((button, idx) => {
                const active = idx === selectedIndex;
                button.setAttribute('aria-current', active ? 'true' : 'false');
                button.setAttribute('data-active', active ? 'true' : 'false');
                if (active) activeThumb = button;
            });
            centerActiveThumb(instance, activeThumb);
        }

        if (instance.prevButton && instance.nextButton && !instance.options.infinite) {
            const maxIndex = Math.max(0, instance.realCount - instance.options.visibleCount);
            const atStart = instance.state.current <= 0;
            const atEnd = instance.state.current >= maxIndex;
            instance.prevButton.disabled = atStart;
            instance.nextButton.disabled = atEnd;
        }

        syncProgress(instance, false);
    }

    function settleInfinitePosition(instance) {
        if (!instance.hasClones) return;
        if (instance.state.current >= instance.realCount + instance.cloneOffset) {
            instance.state.current = instance.cloneOffset;
            renderPosition(instance, false);
        } else if (instance.state.current < instance.cloneOffset) {
            instance.state.current = instance.realCount + instance.cloneOffset - instance.options.slidesPerScroll;
            if (instance.state.current < instance.cloneOffset) instance.state.current = instance.cloneOffset + instance.realCount - 1;
            renderPosition(instance, false);
        }
    }

    function emitChange(instance) {
        if (instance.destroyed || runtime.instances.get(instance.id) !== instance) return;
        const realIndex = getRealIndex(instance);
        const generation = instance.generation;
        if (typeof instance.options.onChange === 'function') {
            instance.options.onChange(realIndex, createHandle(instance.id));
        }
        if (generation !== instance.generation) return;
        emit(instance, 'change', {
            index: realIndex,
            total: instance.realCount
        });
    }

    function syncLinked(instance, index) {
        if (instance.destroyed || runtime.instances.get(instance.id) !== instance) return;
        if (!instance.options.syncTarget) return;
        const linked = resolveInstance(instance.options.syncTarget);
        if (!linked || linked.id === instance.id) return;
        if (linked.state.syncSource === instance.id) return;
        linked.state.syncSource = instance.id;
        try {
            linked.state.selectedIndex = index;
            goTo(linked.id, index, true, true);
        } finally {
            linked.state.syncSource = null;
        }
    }

    function getSyncIndex(instance) {
        return instance && typeof instance.state?.selectedIndex === 'number'
            ? instance.state.selectedIndex
            : getRealIndex(instance);
    }

    function syncProgress(instance, animate) {
        if (instance.progressFrame) { cancelAnimationFrame(instance.progressFrame); instance.progressFrame = null; }
        if (!instance.progressBar || !instance.options.autoplay) return;
        const total = Math.max(1, instance.options.interval);
        const remaining = Math.max(0, Math.min(instance.state.remainingMs || total, total));
        const current = Math.max(0, Math.min(1, 1 - (remaining / total)));
        instance.progressBar.style.transition = animate ? `transform ${remaining}ms linear` : 'none';
        instance.progressBar.style.transform = `scaleX(${current})`;
        if (animate && remaining > 0) {
            const generation = instance.generation;
            instance.progressFrame = requestAnimationFrame(() => {
                instance.progressFrame = null;
                if (instance.destroyed || runtime.instances.get(instance.id) !== instance || generation !== instance.generation || !instance.progressBar) return;
                instance.progressBar.style.transform = 'scaleX(1)';
            });
        }
    }

    function resetProgress(instance) {
        if (!instance.progressBar) return;
        instance.progressBar.style.transition = 'none';
        instance.progressBar.style.transform = 'scaleX(0)';
        if (instance.options.autoplay && instance.timer) {
            syncProgress(instance, true);
        }
    }

    function clearTimer(instance) {
        if (!instance || !instance.timer) return false;
        clearTimeout(instance.timer);
        instance.timer = null;
        return true;
    }

    function scheduleNextTick(instance, delay) {
        clearTimer(instance);
        instance.state.playStartedAt = performance.now();
        instance.state.remainingMs = delay;
        const generation = instance.generation;
        instance.timer = window.setTimeout(() => {
            if (instance.destroyed || runtime.instances.get(instance.id) !== instance || generation !== instance.generation) return;
            instance.timer = null;
            instance.state.remainingMs = instance.options.interval;
            instance.state.autoplayTick = true;
            moveNext(instance.id);
            instance.state.autoplayTick = false;
            if (instance.destroyed || runtime.instances.get(instance.id) !== instance || generation !== instance.generation) return;
            if (instance.options.autoplay) play(instance.id);
        }, delay);
        instance.root.setAttribute('data-carousel-playing', 'true');
        syncProgress(instance, true);
    }

    function restartAutoplay(instance) {
        if (!instance || instance.destroyed || runtime.instances.get(instance.id) !== instance || !instance.options.autoplay || !instance.timer || instance.state.autoplayTick) return;
        scheduleNextTick(instance, instance.options.interval);
    }

    function goTo(id, requestedIndex, animate, suppressLinkedSync) {
        const instance = runtime.instances.get(id);
        if (!instance || instance.realCount === 0) return false;

        const step = instance.options.slidesPerScroll;
        const maxBaseIndex = Math.max(0, instance.realCount - 1);
        const clamped = Math.max(0, Math.min(requestedIndex, maxBaseIndex));

        if (instance.options.infinite && instance.hasClones) {
            instance.state.current = instance.cloneOffset + clamped;
        } else {
            const maxIndex = Math.max(0, instance.realCount - instance.options.visibleCount);
            instance.state.current = Math.max(0, Math.min(clamped, maxIndex));
        }
        instance.state.selectedIndex = clamped;

        renderPosition(instance, animate !== false);
        syncUi(instance);
        emitChange(instance);
        restartAutoplay(instance);
        if (!suppressLinkedSync) syncLinked(instance, getSyncIndex(instance));
        return true;
    }

    function goToPage(id, requestedPage, animate, suppressLinkedSync) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        const pageCount = Math.max(1, Math.ceil(instance.realCount / instance.options.slidesPerScroll));
        const page = Math.max(0, Math.min(requestedPage, pageCount - 1));
        return goTo(id, page * instance.options.slidesPerScroll, animate, suppressLinkedSync);
    }

    function moveNext(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;

        if (instance.options.infinite && instance.hasClones) {
            instance.state.current += instance.options.slidesPerScroll;
            instance.state.selectedIndex = getRealIndex(instance);
            renderPosition(instance, true);
            syncUi(instance);
            emitChange(instance);
            restartAutoplay(instance);
            syncLinked(instance, getSyncIndex(instance));
            return true;
        }

        const maxIndex = Math.max(0, instance.realCount - instance.options.visibleCount);
        const next = Math.min(instance.state.current + instance.options.slidesPerScroll, maxIndex);
        if (next === instance.state.current) return false;
        instance.state.current = next;
        instance.state.selectedIndex = getRealIndex(instance);
        renderPosition(instance, true);
        syncUi(instance);
        emitChange(instance);
        restartAutoplay(instance);
        syncLinked(instance, getSyncIndex(instance));
        return true;
    }

    function movePrev(id) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;

        if (instance.options.infinite && instance.hasClones) {
            instance.state.current -= instance.options.slidesPerScroll;
            instance.state.selectedIndex = getRealIndex(instance);
            renderPosition(instance, true);
            syncUi(instance);
            emitChange(instance);
            restartAutoplay(instance);
            syncLinked(instance, getSyncIndex(instance));
            return true;
        }

        const prev = Math.max(instance.state.current - instance.options.slidesPerScroll, 0);
        if (prev === instance.state.current) return false;
        instance.state.current = prev;
        instance.state.selectedIndex = getRealIndex(instance);
        renderPosition(instance, true);
        syncUi(instance);
        emitChange(instance);
        restartAutoplay(instance);
        syncLinked(instance, getSyncIndex(instance));
        return true;
    }

    function play(id) {
        const instance = runtime.instances.get(id);
        if (!instance || !instance.options.autoplay || instance.timer) return false;
        scheduleNextTick(instance, Math.max(1, instance.state.remainingMs || instance.options.interval));
        emit(instance, 'play', { interval: instance.options.interval });
        return true;
    }

    function pause(id) {
        const instance = runtime.instances.get(id);
        if (!instance || !instance.timer) return false;
        const elapsed = Math.max(0, performance.now() - (instance.state.playStartedAt || performance.now()));
        instance.state.remainingMs = Math.max(0, (instance.state.remainingMs || instance.options.interval) - elapsed);
        clearTimer(instance);
        instance.root.setAttribute('data-carousel-playing', 'false');
        syncProgress(instance, false);
        emit(instance, 'pause', { remainingMs: instance.state.remainingMs });
        return true;
    }

    function setIntervalMs(id, interval) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        const nextInterval = Math.max(1200, toNumber(interval, instance.options.interval));
        const wasPlaying = !!instance.timer;
        pause(id);
        if (instance.destroyed || runtime.instances.get(id) !== instance) return false;
        instance.options.interval = nextInterval;
        instance.state.remainingMs = nextInterval;
        if (wasPlaying && instance.options.autoplay) play(id);
        emit(instance, 'update', { interval: nextInterval, autoplay: instance.options.autoplay });
        return true;
    }

    function setAutoplay(id, autoplay) {
        const instance = runtime.instances.get(id);
        if (!instance) return false;
        instance.options.autoplay = autoplay !== false;
        if (!instance.options.autoplay) {
            pause(id);
            emit(instance, 'update', { interval: instance.options.interval, autoplay: instance.options.autoplay });
            return true;
        }
        const result = play(id);
        emit(instance, 'update', { interval: instance.options.interval, autoplay: instance.options.autoplay });
        return result;
    }

    function setControl(id, option, value) {
        const instance = runtime.instances.get(id), next = value !== false;
        if (!instance) return false;
        if (instance.options[option] === next) return true;
        instance.cleanup?.();
        const keys = option === 'indicators' ? ['indicatorWrap', 'indicators'] : ['progressWrap', 'progressBar'];
        instance[keys[0]]?.remove(); keys.forEach(key => { instance[key] = null; });
        if (option === 'progress' && instance.progressFrame) { cancelAnimationFrame(instance.progressFrame); instance.progressFrame = null; }
        instance.options[option] = next;
        if (next) option === 'indicators' ? createIndicators(instance) : createProgress(instance);
        bindEvents(instance);
        syncUi(instance);
        if (option === 'progress' && instance.timer) syncProgress(instance, true);
        emit(instance, 'update', { interval: instance.options.interval, autoplay: instance.options.autoplay, indicators: instance.options.indicators, progress: instance.options.progress });
        return true;
    }

    function updateInstance(id, next) {
        const instance = runtime.instances.get(id);
        if (!instance) return null;

        const wasPlaying = !!instance.timer;
        pause(id);
        if (instance.destroyed || runtime.instances.get(id) !== instance) return null;
        instance.options = normalizeOptions(Object.assign({}, instance.options, next || {}));
        destroyStructure(instance, false);
        if (!createStructure(instance)) return createHandle(id);
        instance.state.remainingMs = instance.options.interval;
        measure(instance);
        bindEvents(instance);
        syncUi(instance);
        if (wasPlaying && instance.options.autoplay) play(id);
        emit(instance, 'update', {
            interval: instance.options.interval,
            autoplay: instance.options.autoplay,
            indicators: instance.options.indicators,
            progress: instance.options.progress
        });
        return runtime.instances.get(id) === instance && !instance.destroyed ? instance.handle : null;
    }

    function destroyStructure(instance, restoreHtml) {
        instance.generation += 1;
        if (instance.progressFrame) {
            cancelAnimationFrame(instance.progressFrame);
            instance.progressFrame = null;
        }
        if (instance.cleanup) {
            instance.cleanup();
            instance.cleanup = null;
        }
        if (instance.resizeObserver) {
            instance.resizeObserver.disconnect();
            instance.resizeObserver = null;
        }
        pause(instance.id);
        if (instance.indicatorWrap && !instance.root.contains(instance.indicatorWrap)) instance.indicatorWrap.remove();
        if (instance.thumbWrap && !instance.root.contains(instance.thumbWrap)) instance.thumbWrap.remove();
        for (const key of ['indicators', 'indicatorWrap', 'thumbs', 'thumbWrap', 'prevButton', 'nextButton', 'progressBar', 'progressWrap']) instance[key] = null;
        if (restoreHtml !== false) {
            instance.root.innerHTML = instance.originalHtml;
            instance.root.removeAttribute('data-carousel-ready');
            instance.root.removeAttribute('data-carousel-index');
            instance.root.removeAttribute('data-carousel-playing');
        }
    }

    function destroyInstance(target) {
        const instance = resolveInstance(target);
        if (!instance) return false;
        instance.destroyed = true;
        destroyStructure(instance, true);
        runtime.instances.delete(instance.id);
        return true;
    }

    function bindEvents(instance) {
        const cleanups = [];
        const root = instance.root;
        const track = instance.track;
        const horizontal = instance.options.direction === 'horizontal';

        const onTransitionEnd = () => {
            if (!instance.state.animating) return;
            instance.state.animating = false;
            settleInfinitePosition(instance);
            syncUi(instance);
        };
        track.addEventListener('transitionend', onTransitionEnd);
        cleanups.push(() => track.removeEventListener('transitionend', onTransitionEnd));

        if (instance.prevButton) {
            const onPrev = event => {
                event.preventDefault();
                movePrev(instance.id);
            };
            instance.prevButton.addEventListener('click', onPrev);
            cleanups.push(() => instance.prevButton.removeEventListener('click', onPrev));
        }

        if (instance.nextButton) {
            const onNext = event => {
                event.preventDefault();
                moveNext(instance.id);
            };
            instance.nextButton.addEventListener('click', onNext);
            cleanups.push(() => instance.nextButton.removeEventListener('click', onNext));
        }

        if (instance.indicators) {
            instance.indicators.forEach(button => {
                const onClick = event => {
                    event.preventDefault();
                    const page = Number(button.dataset.pageIndex) || 0;
                    goTo(instance.id, page * instance.options.slidesPerScroll, true);
                };
                button.addEventListener('click', onClick);
                cleanups.push(() => button.removeEventListener('click', onClick));
            });
        }

        if (instance.thumbs) {
            instance.thumbs.forEach(button => {
                const onClick = event => {
                    event.preventDefault();
                    const index = Number(button.dataset.pageIndex) || 0;
                    goTo(instance.id, index, true);
                };
                button.addEventListener('click', onClick);
                cleanups.push(() => button.removeEventListener('click', onClick));
            });
        }

        if (instance.options.syncTarget) {
            instance.slides.forEach(slide => {
                const onSelect = event => {
                    event.preventDefault();
                    const index = Number(slide.getAttribute('data-carousel-real-index')) || 0;
                    instance.state.selectedIndex = index;
                    syncUi(instance);
                    goTo(instance.id, index, true);
                };
                slide.addEventListener('click', onSelect);
                cleanups.push(() => slide.removeEventListener('click', onSelect));
            });
        }

        if (instance.options.keyboard) {
            const onKeyDown = event => {
                if (event.key === 'ArrowRight' && horizontal) {
                    event.preventDefault();
                    moveNext(instance.id);
                } else if (event.key === 'ArrowLeft' && horizontal) {
                    event.preventDefault();
                    movePrev(instance.id);
                } else if (event.key === 'ArrowDown' && !horizontal) {
                    event.preventDefault();
                    moveNext(instance.id);
                } else if (event.key === 'ArrowUp' && !horizontal) {
                    event.preventDefault();
                    movePrev(instance.id);
                }
            };
            root.addEventListener('keydown', onKeyDown);
            cleanups.push(() => root.removeEventListener('keydown', onKeyDown));
        }

        if (instance.options.pauseOnHover) {
            const onEnter = () => pause(instance.id);
            const onLeave = () => {
                if (instance.options.autoplay) play(instance.id);
            };
            root.addEventListener('mouseenter', onEnter);
            root.addEventListener('mouseleave', onLeave);
            cleanups.push(() => root.removeEventListener('mouseenter', onEnter));
            cleanups.push(() => root.removeEventListener('mouseleave', onLeave));
        }

        if (instance.options.pauseOnVisibilityHidden) {
            const onVisibility = () => {
                if (document.hidden) pause(instance.id);
                else if (instance.options.autoplay) play(instance.id);
            };
            document.addEventListener('visibilitychange', onVisibility);
            cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));
        }

        if (instance.options.drag) {
            const pointer = {
                active: false,
                startX: 0,
                startY: 0,
                diff: 0,
                axisLocked: false
            };

            const onPointerDown = event => {
                if (instance.state.animating) return;
                pointer.active = true;
                pointer.axisLocked = false;
                pointer.diff = 0;
                pointer.startX = event.clientX;
                pointer.startY = event.clientY;
                pause(instance.id);
                track.style.transition = 'none';
            };

            const onPointerMove = event => {
                if (!pointer.active) return;
                const diffX = event.clientX - pointer.startX;
                const diffY = event.clientY - pointer.startY;

                if (!pointer.axisLocked) {
                    if (horizontal && Math.abs(diffY) > Math.abs(diffX)) {
                        pointer.active = false;
                        return;
                    }
                    if (!horizontal && Math.abs(diffX) > Math.abs(diffY)) {
                        pointer.active = false;
                        return;
                    }
                    pointer.axisLocked = true;
                }

                pointer.diff = horizontal ? diffX : diffY;
                renderPosition(instance, false, pointer.diff);
            };

            const onPointerUp = () => {
                if (!pointer.active) return;
                pointer.active = false;
                const threshold = instance.metrics.viewportSize * instance.options.dragThreshold;
                if (Math.abs(pointer.diff) > threshold) {
                    if (pointer.diff < 0) moveNext(instance.id);
                    else movePrev(instance.id);
                } else {
                    renderPosition(instance, true);
                }
                if (instance.options.autoplay) play(instance.id);
            };

            track.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerUp);
            cleanups.push(() => track.removeEventListener('pointerdown', onPointerDown));
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
        if (!root) return null;
        const existing = Array.from(runtime.instances.values()).find(instance => instance.root === root);
        if (existing) return createHandle(existing.id);
        if (root.id && runtime.instances.has(root.id)) destroyInstance(root.id);

        const merged = normalizeOptions(Object.assign({}, parseNodeOptions(root), options || {}));
        const instance = {
            id: root.id || nextId(),
            root,
            options: merged,
            originalHtml: root.innerHTML,
            realCount: 0,
            slides: [],
            indicators: null,
            indicatorWrap: null,
            thumbs: null,
            thumbWrap: null,
            prevButton: null,
            nextButton: null,
            viewport: null,
            track: null,
            hasClones: false,
            cloneOffset: 0,
            timer: null,
            resizeObserver: null,
            cleanup: null,
            destroyed: false,
            generation: 0,
            progressFrame: null,
            metrics: {
                viewportSize: 0,
                slideSize: 0,
                stepSize: 0
            },
            state: {
                current: 0,
                selectedIndex: merged.startIndex,
                dragOffset: 0,
                dragging: false,
                animating: false,
                syncSource: null,
                autoplayTick: false,
                playStartedAt: 0,
                remainingMs: merged.interval
            }
        };

        root.id = instance.id;
        runtime.instances.set(instance.id, instance);
        createHandle(instance.id);

        if (!createStructure(instance)) {
            runtime.instances.delete(instance.id);
            return null;
        }

        measure(instance);
        bindEvents(instance);
        syncUi(instance);
        if (instance.options.syncTarget) {
            const linked = resolveInstance(instance.options.syncTarget);
            if (linked) {
                goTo(instance.id, getRealIndex(linked), false, true);
            }
        }
        if (instance.options.autoplay) play(instance.id);
        emitChange(instance);
        return runtime.instances.get(instance.id) === instance && !instance.destroyed ? instance.handle : null;
    }

    const carouselApi = {
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
        next(target) {
            const instance = resolveInstance(target);
            return instance ? moveNext(instance.id) : false;
        },
        prev(target) {
            const instance = resolveInstance(target);
            return instance ? movePrev(instance.id) : false;
        },
        goTo(target, index, animate) {
            const instance = resolveInstance(target);
            return instance ? goTo(instance.id, index, animate) : false;
        },
        goToPage(target, page, animate) {
            const instance = resolveInstance(target);
            return instance ? goToPage(instance.id, page, animate) : false;
        },
        play(target) {
            const instance = resolveInstance(target);
            return instance ? play(instance.id) : false;
        },
        pause(target) {
            const instance = resolveInstance(target);
            return instance ? pause(instance.id) : false;
        },
        setInterval(target, interval) {
            const instance = resolveInstance(target);
            return instance ? setIntervalMs(instance.id, interval) : false;
        },
        setAutoplay(target, autoplay) {
            const instance = resolveInstance(target);
            return instance ? setAutoplay(instance.id, autoplay) : false;
        },
        setIndicators(target, indicators) {
            const instance = resolveInstance(target);
            return instance ? setControl(instance.id, 'indicators', indicators) : false;
        },
        setProgress(target, progress) {
            const instance = resolveInstance(target);
            return instance ? setControl(instance.id, 'progress', progress) : false;
        },
        update(target, next) {
            const instance = resolveInstance(target);
            return instance ? updateInstance(instance.id, next) : null;
        },
        destroy(target) {
            return destroyInstance(target);
        },
        getState(target) {
            const instance = resolveInstance(target);
            return instance ? getPublicState(instance) : null;
        }
    };

    JquanUIComponents.carouselApi = carouselApi;

    JquanUIComponents.carousel = {
        name: 'jquanui-carousel',
        version: '1.8.0',
        requires: [],
        install(api) {
            api.addBase(`
[jq-carousel]{
  position:relative;
  display:block;
  overflow:hidden;
}
[jq-carousel-viewport]{
  position:relative;
  width:100%;
  height:100%;
  overflow:hidden;
}
[jq-carousel-track]{
  display:flex;
  width:max-content;
  height:100%;
  will-change:transform;
  touch-action:pan-y;
}
[jq-carousel-track][data-carousel-direction="vertical"]{
  flex-direction:column;
  width:100%;
  height:max-content;
  touch-action:pan-x;
}
[jq-carousel-slide]{
  position:relative;
  flex:0 0 auto;
  overflow:hidden;
}
[jq-carousel][data-carousel-sync-target] [jq-carousel-slide]{
  cursor:pointer;
}
[jq-carousel-arrow]{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  z-index:2;
  width:40px;
  height:40px;
  border:0;
  border-radius:1rem;
  background:rgb(15 23 42 / .32);
  color:#fff;
  cursor:pointer;
}
.jq-carousel-arrow-prev{left:12px;}
.jq-carousel-arrow-next{right:12px;}
.jq-carousel-arrow[disabled]{
  opacity:.35;
  cursor:not-allowed;
}
.jq-carousel-indicators{
  position:absolute;
  left:50%;
  bottom:14px;
  display:flex;
  gap:8px;
  transform:translateX(-50%);
  z-index:2;
}
.jq-carousel-indicator{
  width:10px;
  height:10px;
  border:0;
  border-radius:1rem;
  background:rgb(255 255 255 / .46);
  cursor:pointer;
  transition:width .2s ease, background-color .2s ease, opacity .2s ease;
}
.jq-carousel-indicator[data-active="true"]{
  width:28px;
  background:rgb(255 255 255 / 1);
}
.jq-carousel-progress{
  position:absolute;
  left:14px;
  right:14px;
  bottom:46px;
  height:3px;
  border-radius:999px;
  background:rgb(255 255 255 / .22);
  overflow:hidden;
  z-index:2;
}
.jq-carousel-progress-bar{
  display:block;
  width:100%;
  height:100%;
  transform-origin:left center;
  transform:scaleX(0);
  background:rgb(255 255 255 / .92);
}
.jq-carousel-thumbs{
  display:flex;
  gap:10px;
  margin-top:14px;
  overflow:auto;
}
.jq-carousel-thumb{
  flex:0 0 88px;
  height:56px;
  border:1px solid rgb(148 163 184 / .28);
  border-radius:12px;
  overflow:hidden;
  padding:0;
  background:#fff;
  cursor:pointer;
  opacity:.72;
  transition:opacity .2s ease,border-color .2s ease,transform .2s ease;
}
.jq-carousel-thumb:hover{
  opacity:.92;
  transform:translateY(-1px);
}
.jq-carousel-thumb[data-active="true"]{
  opacity:1;
  border-color:rgb(79 70 229 / .7);
}
.jq-carousel-thumb-preview{
  width:100%;
  height:100%;
}
.jq-carousel-thumb-preview > *{
  width:100%;
  height:100%;
  transform:scale(.34);
  transform-origin:top left;
  width:294%;
  height:294%;
  pointer-events:none;
}
.jq-carousel-thumb-image{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
}
.jq-carousel-thumb-label{
  display:flex;
  width:100%;
  height:100%;
  align-items:center;
  justify-content:center;
  padding:0 8px;
  font-size:12px;
  font-weight:600;
  color:#334155;
}
            `);

            api.addBehaviors({
                selector: '[jq-carousel]',
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


