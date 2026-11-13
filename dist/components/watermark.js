(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        text: 'JquanUI',
        subtext: '',
        angle: -22,
        gapX: 28,
        gapY: 28,
        offsetX: 0,
        offsetY: 0,
        width: 220,
        height: 120,
        opacity: 0.14,
        fontSize: 15,
        subFontSize: 11,
        color: '#0f172a',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontWeight: 600,
        zIndex: 8,
        pointerEvents: 'none'
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-watermark-' + runtime.seed;
    }

    function toNumber(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function mergeOptions(root, options) {
        return Object.assign({}, defaults, {
            text: root.getAttribute('data-watermark-text') || defaults.text,
            subtext: root.getAttribute('data-watermark-subtext') || '',
            angle: root.getAttribute('data-watermark-angle'),
            gapX: root.getAttribute('data-watermark-gap-x'),
            gapY: root.getAttribute('data-watermark-gap-y'),
            offsetX: root.getAttribute('data-watermark-offset-x'),
            offsetY: root.getAttribute('data-watermark-offset-y'),
            width: root.getAttribute('data-watermark-width'),
            height: root.getAttribute('data-watermark-height'),
            opacity: root.getAttribute('data-watermark-opacity'),
            fontSize: root.getAttribute('data-watermark-font-size'),
            subFontSize: root.getAttribute('data-watermark-sub-font-size'),
            color: root.getAttribute('data-watermark-color') || defaults.color,
            fontFamily: root.getAttribute('data-watermark-font-family') || defaults.fontFamily,
            fontWeight: root.getAttribute('data-watermark-font-weight') || defaults.fontWeight,
            zIndex: root.getAttribute('data-watermark-zindex'),
            pointerEvents: root.getAttribute('data-watermark-pointer-events') || defaults.pointerEvents
        }, options || {});
    }

    function escapeSvgText(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function createPattern(options) {
        const width = Math.max(120, toNumber(options.width, defaults.width));
        const height = Math.max(72, toNumber(options.height, defaults.height));
        const gapX = Math.max(0, toNumber(options.gapX, defaults.gapX));
        const gapY = Math.max(0, toNumber(options.gapY, defaults.gapY));
        const tileWidth = width + gapX;
        const tileHeight = height + gapY;
        const text = escapeSvgText(options.text || defaults.text);
        const subtext = escapeSvgText(options.subtext || '');
        const fontSize = Math.max(10, toNumber(options.fontSize, defaults.fontSize));
        const subFontSize = Math.max(9, toNumber(options.subFontSize, defaults.subFontSize));
        const opacity = Math.max(0.02, Math.min(1, toNumber(options.opacity, defaults.opacity)));
        const angle = toNumber(options.angle, defaults.angle);
        const offsetX = toNumber(options.offsetX, defaults.offsetX);
        const offsetY = toNumber(options.offsetY, defaults.offsetY);
        const color = options.color || defaults.color;
        const fontFamily = escapeSvgText(options.fontFamily || defaults.fontFamily);
        const fontWeight = escapeSvgText(options.fontWeight || defaults.fontWeight);
        const subY = subtext ? 62 : 52;
        const lines = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="' + tileWidth + '" height="' + tileHeight + '" viewBox="0 0 ' + tileWidth + ' ' + tileHeight + '">',
            '<g transform="translate(' + offsetX + ' ' + offsetY + ') rotate(' + angle + ' ' + (width / 2) + ' ' + (height / 2) + ')" fill="' + color + '" fill-opacity="' + opacity + '">',
            '<text x="24" y="52" font-size="' + fontSize + '" font-family="' + fontFamily + '" font-weight="' + fontWeight + '">' + text + '</text>'
        ];
        if (subtext) {
            lines.push('<text x="24" y="' + subY + '" font-size="' + subFontSize + '" font-family="' + fontFamily + '" font-weight="500">' + subtext + '</text>');
        }
        lines.push('</g></svg>');
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(lines.join(''));
    }

    function dispatch(instance, eventName) {
        instance.root.dispatchEvent(new CustomEvent('jquan:watermark:' + eventName, {
            bubbles: true,
            detail: instance.state()
        }));
    }

    function apply(instance) {
        const root = instance.root;
        const options = instance.options;
        const layer = instance.layer;
        const computed = global.getComputedStyle(root);
        if (computed.position === 'static') {
            if (!instance.managedPosition) {
                instance.managedPosition = true;
                instance.originalPosition = root.style.position || '';
            }
            root.style.position = 'relative';
        }
        if (!root.contains(layer)) root.appendChild(layer);
        layer.style.position = 'absolute';
        layer.style.inset = '0';
        layer.style.zIndex = String(Math.max(1, toNumber(options.zIndex, defaults.zIndex)));
        layer.style.pointerEvents = options.pointerEvents || defaults.pointerEvents;
        layer.style.backgroundImage = 'url("' + createPattern(options) + '")';
        layer.style.backgroundRepeat = 'repeat';
        layer.style.backgroundPosition = '0 0';
        layer.style.backgroundSize = Math.max(120, toNumber(options.width, defaults.width)) + Math.max(0, toNumber(options.gapX, defaults.gapX)) + 'px ' + (Math.max(72, toNumber(options.height, defaults.height)) + Math.max(0, toNumber(options.gapY, defaults.gapY))) + 'px';
        layer.setAttribute('aria-hidden', 'true');
        root.setAttribute('data-watermark-ready', 'true');
        dispatch(instance, 'apply');
    }

    function createHandle(id) {
        const getInstance = () => runtime.instances.get(id);
        return {
            id: id,
            update(patch) {
                const instance = getInstance();
                if (!instance) return null;
                instance.options = Object.assign({}, instance.options, patch || {});
                apply(instance);
                dispatch(instance, 'update');
                return instance.state();
            },
            refresh() {
                const instance = getInstance();
                if (!instance) return null;
                apply(instance);
                return instance.state();
            },
            destroy() {
                return destroy(id);
            },
            state() {
                const instance = getInstance();
                return instance ? instance.state() : null;
            },
            element() {
                const instance = getInstance();
                return instance ? instance.root : null;
            }
        };
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-watermark-id');
        if (existingId && runtime.instances.has(existingId)) return createHandle(existingId);

        const id = existingId || root.id || nextId();
        const layer = document.createElement('div');
        layer.className = 'jq-watermark-layer';
        layer.setAttribute('jq-watermark-layer', '');

        const instance = {
            id: id,
            root: root,
            layer: layer,
            managedPosition: false,
            originalPosition: root.style.position || '',
            options: mergeOptions(root, options),
            state() {
                return {
                    id: id,
                    text: instance.options.text,
                    subtext: instance.options.subtext,
                    opacity: toNumber(instance.options.opacity, defaults.opacity),
                    angle: toNumber(instance.options.angle, defaults.angle)
                };
            }
        };

        root.setAttribute('data-watermark-id', id);
        runtime.instances.set(id, instance);
        apply(instance);
        return createHandle(id);
    }

    function destroy(target) {
        const instance = typeof target === 'string' && runtime.instances.has(target)
            ? runtime.instances.get(target)
            : runtime.instances.get(resolveTarget(target)?.getAttribute('data-watermark-id'));
        if (!instance) return false;
        if (instance.layer.parentNode) instance.layer.parentNode.removeChild(instance.layer);
        if (instance.managedPosition) instance.root.style.position = instance.originalPosition;
        instance.root.removeAttribute('data-watermark-ready');
        instance.root.removeAttribute('data-watermark-id');
        dispatch(instance, 'destroy');
        runtime.instances.delete(instance.id);
        return true;
    }

    const watermarkApi = {
        mount: mount,
        update(target, patch) {
            const root = resolveTarget(target);
            if (!root) return null;
            const handle = mount(root);
            return handle ? handle.update(patch) : null;
        },
        refresh(target) {
            const root = resolveTarget(target);
            if (!root) return null;
            const handle = mount(root);
            return handle ? handle.refresh() : null;
        },
        destroy: destroy,
        getState(target) {
            const root = resolveTarget(target);
            if (!root) return null;
            const id = root.getAttribute('data-watermark-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.state() : null;
        }
    };

    JquanUIComponents.watermarkApi = watermarkApi;
    JquanUIComponents.watermark = {
        name: 'jquanui-watermark',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-watermark]',
                setup(node) {
                    const handle = mount(node);
                    return function cleanup() {
                        if (handle) handle.destroy();
                    };
                }
            });
        }
    };
})(window);
