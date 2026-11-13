(function (global) {
    const components = global.JquanUIComponents || (global.JquanUIComponents = {});
    if (components.faviconApi) return;

    const COMPONENT_VERSION = '1.0.0';
    const MAX_BADGE_LENGTH = 4;
    const MAX_LABEL_LENGTH = 24;
    const SAFE_HREF = /^(?:https?:|data:image\/(?:png|gif|jpeg|jpg|webp|svg\+xml);|blob:|\/|\.\/|\.\.\/)/i;
    const COLORS = {
        loading: '#64748b',
        success: '#16a34a',
        error: '#dc2626',
        warning: '#d97706',
        info: '#2563eb',
        idle: '#64748b'
    };
    let instanceSeed = 0;
    let activeOwner = null;
    let originalState = null;
    let managedLink = null;

    function nextId() {
        instanceSeed += 1;
        return `favicon-${Date.now().toString(36)}-${instanceSeed}`;
    }

    function escapeXml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, token => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;'
        }[token]));
    }

    function safeHref(value) {
        const href = String(value == null ? '' : value).trim();
        if (!href || !SAFE_HREF.test(href) || /[\u0000-\u001f\u007f]/.test(href) || /^javascript:/i.test(href)) return null;
        return href;
    }

    function safeColor(value, fallback) {
        const color = String(value == null ? '' : value).trim();
        if (/^(?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([^)]{1,100}\)|[a-z]+)$/i.test(color)) return color;
        return fallback;
    }

    function safeLabel(value) {
        return String(value == null ? '' : value).trim().slice(0, MAX_LABEL_LENGTH);
    }

    function sourceToHref(source) {
        if (typeof source === 'string') return safeHref(source);
        if (!source || typeof source !== 'object') return null;
        if (source.href != null) return safeHref(source.href);
        if (source.svg != null) return svgToHref(source.svg);
        if (source.canvas && typeof source.canvas.toDataURL === 'function') {
            try {
                const result = source.canvas.toDataURL('image/png');
                return /^data:image\//i.test(result) ? result : null;
            } catch (error) {
                throw new TypeError('[JquanUI favicon] canvas source cannot be serialized.');
            }
        }
        return null;
    }

    function svgToHref(svg) {
        const text = String(svg == null ? '' : svg).trim();
        if (!/^<svg[\s>]/i.test(text) || /<(?:script|foreignObject|iframe|object|embed)\b/i.test(text) || /(?:javascript:|vbscript:|data:text\/html)/i.test(text) || /\bon[a-z]+\s*=/i.test(text)) return null;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(text)}`;
    }

    function makeSvg(markup) {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${markup}</svg>`)}`;
    }

    function makeStatusSvg(state, options = {}, frame = 0) {
        const key = String(state || 'idle').toLowerCase();
        const color = safeColor(options.color, COLORS[key] || COLORS.idle);
        const background = safeColor(options.background, '#ffffff');
        const stroke = Math.max(1.5, Math.min(4, Number(options.strokeWidth) || 3));
        const label = safeLabel(options.label || '');
        if (key === 'loading') {
            const angle = (Number(frame) % 8) * 45;
            return makeSvg(`<rect width="32" height="32" rx="7" fill="${escapeXml(background)}"/><g transform="rotate(${angle} 16 16)" fill="none" stroke="${escapeXml(color)}" stroke-width="${stroke}" stroke-linecap="round"><path d="M16 5a11 11 0 0 1 9.5 5.5"/><path opacity=".2" d="M25.5 10.5A11 11 0 1 1 16 5"/></g>`);
        }
        const symbol = key === 'success' ? '<path d="m8 16 5 5 11-11"/>'
            : key === 'error' ? '<path d="m10 10 12 12M22 10 10 22"/>'
                : key === 'warning' ? '<path d="M16 8v9M16 22h.01"/>'
                    : key === 'info' ? '<path d="M16 14v8M16 10h.01"/>'
                        : '<circle cx="16" cy="16" r="9"/>';
        const outline = key === 'warning' ? '<path d="m16 6 11 20H5L16 6Z"/>' : key === 'info' ? '<circle cx="16" cy="16" r="11"/>' : symbol;
        return makeSvg(`<rect width="32" height="32" rx="7" fill="${escapeXml(background)}"/><g fill="none" stroke="${escapeXml(color)}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${outline}</g>${label ? `<text x="16" y="29" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" fill="${escapeXml(color)}">${escapeXml(label)}</text>` : ''}`);
    }

    function normalizeBadge(value) {
        if (value == null || value === false || value === '') return '';
        if (value === true) return '*';
        const text = safeLabel(value);
        if (!text) return '';
        if (/^\d+$/.test(text)) {
            const number = Number(text);
            if (number > 999) return '999+';
        }
        return text.slice(0, MAX_BADGE_LENGTH);
    }

    function makeBadgeSvg(value, options = {}) {
        const text = normalizeBadge(value);
        if (!text) return null;
        const color = safeColor(options.color, '#dc2626');
        const textColor = safeColor(options.textColor, '#ffffff');
        const background = safeColor(options.background, '#ffffff');
        const base = sourceToHref(options.base);
        const image = base ? `<image href="${escapeXml(base)}" x="0" y="0" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>` : `<rect width="32" height="32" rx="7" fill="${escapeXml(background)}"/>`;
        const compact = text.length > 2 || text === '999+';
        const width = compact ? 19 : 13;
        return makeSvg(`${image}<rect x="${32 - width}" y="1" width="${width}" height="12" rx="6" fill="${escapeXml(color)}" stroke="${escapeXml(background)}" stroke-width="1.5"/><text x="${32 - width / 2}" y="9.5" text-anchor="middle" font-size="${compact ? 6 : 7}" font-family="Arial,sans-serif" font-weight="700" fill="${escapeXml(textColor)}">${escapeXml(text)}</text>`);
    }

    function findIconLink() {
        return global.document?.head?.querySelector('link[rel~="icon"]') || global.document?.querySelector('link[rel~="icon"]') || null;
    }

    function snapshotLink(link) {
        if (!link) return null;
        return Array.from(link.attributes || []).reduce((state, attribute) => {
            state[attribute.name] = attribute.value;
            return state;
        }, {});
    }

    function restoreLink() {
        if (!managedLink) return;
        if (originalState === null) {
            managedLink.remove?.();
        } else {
            Array.from(managedLink.attributes || []).forEach(attribute => managedLink.removeAttribute(attribute.name));
            Object.entries(originalState).forEach(([name, value]) => managedLink.setAttribute(name, value));
        }
        managedLink = null;
        originalState = null;
    }

    function ensureLink(owner) {
        if (managedLink && managedLink.isConnected !== false) {
            activeOwner = owner;
            return managedLink;
        }
        const existing = findIconLink();
        if (existing) {
            managedLink = existing;
            originalState = snapshotLink(existing);
        } else {
            managedLink = global.document.createElement('link');
            managedLink.setAttribute('rel', 'icon');
            global.document.head.appendChild(managedLink);
            originalState = null;
        }
        activeOwner = owner;
        return managedLink;
    }

    function createInstance(defaults = {}) {
        const owner = nextId();
        let baseHref = null;
        let baseType = null;
        let currentHref = null;
        let destroyed = false;
        let frameTimer = null;
        let watchStop = null;

        function assertActive() {
            if (destroyed) throw new Error('[JquanUI favicon] Instance is destroyed.');
        }

        function apply(source, type = 'image/svg+xml') {
            assertActive();
            const href = sourceToHref(source);
            if (!href) throw new TypeError('[JquanUI favicon] source must be a safe href, SVG, or canvas.');
            const link = ensureLink(owner);
            link.setAttribute('href', href);
            if (type) link.setAttribute('type', type);
            else link.removeAttribute('type');
            currentHref = href;
            return instance;
        }

        function stopFrameTimer() {
            if (frameTimer != null) global.clearInterval(frameTimer);
            frameTimer = null;
        }

        const instance = {
            id: owner,
            set(source, options = {}) {
                stopFrameTimer();
                const href = sourceToHref(source);
                if (!href) throw new TypeError('[JquanUI favicon] source must be a safe href, SVG, or canvas.');
                baseHref = href;
                baseType = options.type || (String(href).startsWith('data:image/svg') ? 'image/svg+xml' : null);
                return apply(href, baseType);
            },
            badge(value, options = {}) {
                stopFrameTimer();
                const href = makeBadgeSvg(value, { ...defaults, ...options, base: options.base || baseHref });
                if (!href) return instance.clear();
                return apply(href, 'image/svg+xml');
            },
            status(state, options = {}) {
                stopFrameTimer();
                const config = { ...defaults, ...options };
                const key = String(state || 'idle').toLowerCase();
                const render = frame => apply(makeStatusSvg(key, config, frame), 'image/svg+xml');
                render(0);
                if (key === 'loading' && config.animate !== false) {
                    frameTimer = global.setInterval(() => {
                        if (activeOwner === owner) render((Date.now() / 120) | 0);
                    }, Math.max(80, Number(config.interval) || 120));
                }
                return instance;
            },
            clear() {
                stopFrameTimer();
                if (baseHref) return apply(baseHref, baseType);
                restoreLinkIfOwner();
                return instance;
            },
            restore() {
                stopFrameTimer();
                if (activeOwner === owner) restoreLink();
                baseHref = null;
                baseType = null;
                currentHref = null;
                return instance;
            },
            watch(options = {}) {
                assertActive();
                if (watchStop) watchStop();
                const media = global.matchMedia?.('(prefers-color-scheme: dark)');
                const update = () => {
                    const source = media?.matches ? options.dark : options.light;
                    if (source != null) instance.set(source, options);
                };
                if (!media || options.light == null && options.dark == null) return () => {};
                const listener = () => update();
                media.addEventListener?.('change', listener);
                media.addListener?.(listener);
                update();
                watchStop = () => {
                    media.removeEventListener?.('change', listener);
                    media.removeListener?.(listener);
                    watchStop = null;
                };
                return watchStop;
            },
            state() {
                return { id: owner, destroyed, baseHref, currentHref, watching: !!watchStop, managed: activeOwner === owner && !!managedLink };
            },
            destroy() {
                if (destroyed) return;
                stopFrameTimer();
                watchStop?.();
                if (activeOwner === owner) restoreLink();
                destroyed = true;
            }
        };

        function restoreLinkIfOwner() {
            if (activeOwner === owner) restoreLink();
        }

        return instance;
    }

    const singleton = createInstance();
    const api = {
        create: createInstance,
        set: (...args) => singleton.set(...args),
        badge: (...args) => singleton.badge(...args),
        status: (...args) => singleton.status(...args),
        clear: (...args) => singleton.clear(...args),
        restore: (...args) => singleton.restore(...args),
        watch: (...args) => singleton.watch(...args),
        state: (...args) => singleton.state(...args),
        destroy: (...args) => singleton.destroy(...args)
    };

    components.faviconApi = api;
    components.favicon = {
        name: 'jquanui-favicon',
        version: COMPONENT_VERSION,
        requires: [],
        install() {},
        teardown() { singleton.destroy(); }
    };
})(window);
