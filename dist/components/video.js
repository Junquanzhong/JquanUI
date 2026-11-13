(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        autoplay: false,
        muted: false,
        loop: false,
        playsInline: true
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-video-' + runtime.seed;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function formatTime(value) {
        const seconds = Math.max(0, Math.floor(Number(value) || 0));
        const hour = Math.floor(seconds / 3600);
        const minute = Math.floor((seconds % 3600) / 60);
        const second = seconds % 60;
        if (hour > 0) return [hour, minute, second].map(function (part, index) {
            return index === 0 ? String(part) : String(part).padStart(2, '0');
        }).join(':');
        return String(minute).padStart(2, '0') + ':' + String(second).padStart(2, '0');
    }

    function dispatch(instance, eventName, detail) {
        instance.root.dispatchEvent(new CustomEvent('jquan:video:' + eventName, {
            bubbles: true,
            detail: Object.assign({}, instance.state(), detail || {})
        }));
    }

    function sync(instance) {
        const media = instance.media;
        const progress = instance.root.querySelector('[jq-video-progress]');
        const current = instance.root.querySelector('[jq-video-current]');
        const duration = instance.root.querySelector('[jq-video-duration]');
        const play = instance.root.querySelector('[jq-video-play]');
        const mute = instance.root.querySelector('[jq-video-mute]');
        const volume = instance.root.querySelector('[jq-video-volume]');

        const total = Number.isFinite(media.duration) ? media.duration : 0;
        const ratio = total > 0 ? (media.currentTime / total) * 100 : 0;
        if (progress && document.activeElement !== progress) progress.value = String(clamp(ratio, 0, 100));
        if (current) current.textContent = formatTime(media.currentTime);
        if (duration) duration.textContent = formatTime(total);
        if (play) play.textContent = media.paused ? 'Play' : 'Pause';
        if (mute) mute.textContent = media.muted || media.volume === 0 ? 'Unmute' : 'Mute';
        if (volume && document.activeElement !== volume) volume.value = String(Math.round((media.muted ? 0 : media.volume) * 100));
        instance.root.setAttribute('data-video-playing', media.paused ? 'false' : 'true');
        instance.root.setAttribute('data-video-muted', media.muted || media.volume === 0 ? 'true' : 'false');
    }

    function bind(instance) {
        const media = instance.media;
        const root = instance.root;
        const cleanups = [];

        function on(type, target, handler, options) {
            target.addEventListener(type, handler, options);
            cleanups.push(function () {
                target.removeEventListener(type, handler, options);
            });
        }

        on('play', media, function () {
            sync(instance);
            dispatch(instance, 'play');
        });
        on('pause', media, function () {
            sync(instance);
            dispatch(instance, 'pause');
        });
        on('timeupdate', media, function () {
            sync(instance);
            dispatch(instance, 'timeupdate');
        });
        on('durationchange', media, function () {
            sync(instance);
        });
        on('volumechange', media, function () {
            sync(instance);
            dispatch(instance, 'volumechange');
        });
        on('loadedmetadata', media, function () {
            sync(instance);
            dispatch(instance, 'ready');
        });
        on('ended', media, function () {
            sync(instance);
            dispatch(instance, 'ended');
        });
        on('click', root, function (event) {
            const trigger = event.target.closest('[jq-video-play],[jq-video-mute],[jq-video-fullscreen],[jq-video-pip]');
            if (!trigger || !root.contains(trigger)) return;
            event.preventDefault();
            if (trigger.hasAttribute('jq-video-play')) {
                if (media.paused) media.play().catch(function () {});
                else media.pause();
                return;
            }
            if (trigger.hasAttribute('jq-video-mute')) {
                media.muted = !media.muted;
                sync(instance);
                return;
            }
            if (trigger.hasAttribute('jq-video-fullscreen')) {
                if (document.fullscreenElement === root) {
                    document.exitFullscreen?.();
                } else {
                    root.requestFullscreen?.().catch?.(function () {});
                }
                return;
            }
            if (trigger.hasAttribute('jq-video-pip') && document.pictureInPictureEnabled && !media.disablePictureInPicture) {
                if (document.pictureInPictureElement === media) {
                    document.exitPictureInPicture?.().catch?.(function () {});
                } else {
                    media.requestPictureInPicture?.().catch?.(function () {});
                }
            }
        });

        const progress = root.querySelector('[jq-video-progress]');
        if (progress) {
            on('input', progress, function () {
                const total = Number.isFinite(media.duration) ? media.duration : 0;
                if (total <= 0) return;
                media.currentTime = total * (clamp(Number(progress.value) || 0, 0, 100) / 100);
                sync(instance);
            });
        }

        const volume = root.querySelector('[jq-video-volume]');
        if (volume) {
            on('input', volume, function () {
                media.muted = false;
                media.volume = clamp((Number(volume.value) || 0) / 100, 0, 1);
                sync(instance);
            });
        }

        instance.cleanup = function () {
            cleanups.forEach(function (fn) { fn(); });
        };
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-video-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const media = root.querySelector('video,[jq-video-media]');
        if (!media) return null;
        const id = existingId || root.id || nextId();
        const merged = Object.assign({}, defaults, options || {});
        media.autoplay = !!merged.autoplay;
        media.muted = !!merged.muted;
        media.loop = !!merged.loop;
        media.playsInline = merged.playsInline !== false;

        const instance = {
            id: id,
            root: root,
            media: media,
            state() {
                return {
                    id: id,
                    paused: media.paused,
                    muted: media.muted,
                    currentTime: Number(media.currentTime || 0).toFixed(2),
                    duration: Number.isFinite(media.duration) ? Number(media.duration).toFixed(2) : null,
                    volume: Number(media.volume || 0).toFixed(2),
                    src: media.currentSrc || media.getAttribute('src') || null
                };
            }
        };

        const handle = {
            id: id,
            play() { return media.play(); },
            pause() { media.pause(); return true; },
            toggle() {
                if (media.paused) return media.play();
                media.pause();
                return true;
            },
            seek(seconds) {
                media.currentTime = clamp(Number(seconds) || 0, 0, Number.isFinite(media.duration) ? media.duration : Number.MAX_SAFE_INTEGER);
                sync(instance);
                return instance.state();
            },
            setVolume(value) {
                media.muted = false;
                media.volume = clamp(Number(value) || 0, 0, 1);
                sync(instance);
                return instance.state();
            },
            setSource(src) {
                media.src = src || '';
                media.load();
                sync(instance);
                return instance.state();
            },
            mute(force) {
                media.muted = typeof force === 'boolean' ? force : true;
                sync(instance);
                return instance.state();
            },
            state() { return instance.state(); },
            destroy() {
                instance.cleanup?.();
                root.removeAttribute('data-video-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-video-id', id);
        runtime.instances.set(id, instance);
        bind(instance);
        sync(instance);
        return handle;
    }

    const videoApi = {
        mount: mount,
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-video-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.videoApi = videoApi;
    JquanUIComponents.video = {
        name: 'jquanui-video',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-video]',
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
