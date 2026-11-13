(function (global) {
    const components = global.JquanUIComponents || (global.JquanUIComponents = {});
    const PROTOCOL = 'jquanui:iframe-bridge';
    const PROTOCOL_VERSION = 1;
    let seed = 0;

    function nextId(prefix) {
        seed += 1;
        return `${prefix}-${Date.now().toString(36)}-${seed}`;
    }

    function asWindow(value) {
        if (value && typeof value.postMessage === 'function') return value;
        if (value?.contentWindow && typeof value.contentWindow.postMessage === 'function') return value.contentWindow;
        return null;
    }

    function asOrigin(value, fallback) {
        if (value == null || value === '') return fallback;
        const origin = String(value).trim();
        if (origin === '*') return origin;
        try { return new URL(origin, global.location?.href || undefined).origin; }
        catch { throw new TypeError('[JquanUI iframeBridge] targetOrigin must be a valid origin.'); }
    }

    function inferOrigin(role, iframe, explicit) {
        if (explicit != null) return asOrigin(explicit, null);
        if (role === 'child' && global.document?.referrer) {
            try { return new URL(global.document.referrer).origin; } catch {}
        }
        if (role === 'parent' && iframe?.getAttribute) {
            const source = iframe.getAttribute('src');
            if (source && !source.startsWith('about:')) {
                try { return new URL(source, global.location?.href).origin; } catch {}
            }
        }
        return asOrigin(null, global.location?.origin || 'null');
    }

    function createBridge(role, input = {}) {
        const options = { namespace: 'default', timeout: 5000, channel: true, ...input };
        const iframe = role === 'parent' ? (typeof options.iframe === 'string' ? global.document?.querySelector(options.iframe) : options.iframe) : null;
        const peerWindow = asWindow(role === 'parent' ? iframe : options.parentWindow || global.parent);
        if (!peerWindow || (role === 'child' && peerWindow === global)) throw new TypeError(`[JquanUI iframeBridge] ${role} requires a connected peer window.`);
        const targetOrigin = inferOrigin(role, iframe, options.targetOrigin ?? options.origin);
        const allowAnyOrigin = options.allowAnyOrigin === true;
        if (targetOrigin === '*' && !allowAnyOrigin) throw new TypeError('[JquanUI iframeBridge] targetOrigin="*" requires allowAnyOrigin: true.');
        const allowedOrigins = new Set((Array.isArray(options.allowedOrigins) ? options.allowedOrigins : [targetOrigin]).map(value => asOrigin(value, targetOrigin)));
        const namespace = String(options.namespace || 'default');
        const pending = new Map();
        const listeners = new Map();
        let port = null;
        let destroyed = false;
        let connected = false;
        let readyState = false;
        let helloTimer = null;
        let readyResolve;
        let readyReject;
        const readyPromise = new Promise((resolve, reject) => { readyResolve = resolve; readyReject = reject; });

        function originAllowed(origin) {
            return allowAnyOrigin || allowedOrigins.has(origin) || (targetOrigin === '*' && origin === '*');
        }

        function validMessage(message, origin, source) {
            return !destroyed && source === peerWindow && originAllowed(origin) && message?.protocol === PROTOCOL && message.version === PROTOCOL_VERSION && message.namespace === namespace;
        }

        function envelope(action, payload = {}, id = null) {
            return { protocol: PROTOCOL, version: PROTOCOL_VERSION, namespace, action, id, ...payload };
        }

        function post(message, transfer = []) {
            if (destroyed) return false;
            try {
                if (port && message.action !== 'hello') port.postMessage(message, transfer);
                else peerWindow.postMessage(message, targetOrigin, transfer);
                return true;
            } catch (error) {
                if (typeof options.onError === 'function') options.onError(error);
                return false;
            }
        }

        function emit(name, payload, context) {
            (listeners.get(name) || []).forEach(listener => {
                try { listener(payload, context); } catch (error) { if (typeof options.onError === 'function') options.onError(error); }
            });
        }

        function rejectPending(error) {
            pending.forEach(item => { clearTimeout(item.timer); item.reject(error); });
            pending.clear();
        }

        function attachPort(nextPort) {
            if (!nextPort || typeof nextPort.postMessage !== 'function') return;
            if (port && typeof port.close === 'function') port.close();
            port = nextPort;
            port.onmessage = event => handleMessage(event.data, targetOrigin, peerWindow);
            if (typeof port.start === 'function') port.start();
        }

        function sendReady() {
            connected = true;
            post(envelope('ready', { role }));
        }

        function handleMessage(message, origin, source) {
            if (!validMessage(message, origin, source)) return;
            if (message.action === 'hello') {
                connected = true;
                if (eventPort(message) && typeof eventPort(message).postMessage === 'function') attachPort(eventPort(message));
                sendReady();
                return;
            }
            if (message.action === 'ready') {
                connected = true;
                readyState = true;
                clearTimeout(helloTimer);
                readyResolve({ role, peerOrigin: origin, channel: !!port });
                emit('ready', message, { origin });
                return;
            }
            if (message.action === 'response') {
                const item = pending.get(message.id);
                if (!item) return;
                pending.delete(message.id);
                clearTimeout(item.timer);
                if (message.error) { const error = new Error(message.error.message || 'Iframe bridge request failed.'); error.code = message.error.code || 'IFRAME_REQUEST_FAILED'; item.reject(error); }
                else item.resolve(message.payload);
                return;
            }
            if (message.action === 'event') { emit(message.name, message.payload, { origin, event: message }); return; }
            if (message.action !== 'request') return;
            const handlers = listeners.get(`request:${message.name}`) || [];
            const handler = handlers[handlers.length - 1];
            if (!handler) { post(envelope('response', { error: { code: 'IFRAME_HANDLER_MISSING', message: `No handler for ${message.name}.` } }, message.id)); return; }
            Promise.resolve().then(() => handler(message.payload, { origin, role, name: message.name, id: message.id }))
                .then(payload => post(envelope('response', { payload }, message.id)))
                .catch(error => post(envelope('response', { error: { code: error.code || 'IFRAME_HANDLER_FAILED', message: error.message || String(error) } }, message.id)));
        }

        function eventPort(message) {
            return message && message.__eventPort ? message.__eventPort : null;
        }

        function onWindowMessage(event) {
            const message = event?.data && event.ports?.[0]
                ? { ...event.data, __eventPort: event.ports[0] }
                : event?.data;
            handleMessage(message, event?.origin, event?.source);
        }

        function startHandshake() {
            const sendHello = () => {
                if (destroyed || readyState) return;
                let transfer = [];
                let message = envelope('hello', { role });
                if (options.channel !== false && typeof global.MessageChannel === 'function' && !port) {
                    const channel = new global.MessageChannel();
                    attachPort(channel.port2);
                    transfer = [channel.port1];
                }
                post(message, transfer);
            };
            sendHello();
            let attempts = 0;
            helloTimer = global.setInterval(() => { if (++attempts >= 4) { global.clearInterval(helloTimer); if (!readyState) { const error = new Error('[JquanUI iframeBridge] Handshake timed out.'); error.code = 'IFRAME_HANDSHAKE_TIMEOUT'; readyReject(error); } } else sendHello(); }, Math.max(250, Number(options.handshakeInterval) || 750));
        }

        const bridge = {
            role,
            namespace,
            get connected() { return connected; },
            get readyState() { return readyState; },
            ready() { return readyPromise; },
            send(name, payload) { return post(envelope('event', { name: String(name), payload })); },
            request(name, payload, requestOptions = {}) {
                if (destroyed) return Promise.reject(new Error('[JquanUI iframeBridge] Bridge is destroyed.'));
                const id = nextId('request');
                const timeout = Math.max(1, Number(requestOptions.timeout ?? options.timeout) || 5000);
                return readyPromise.then(() => new Promise((resolve, reject) => {
                    const timer = global.setTimeout(() => { pending.delete(id); const error = new Error(`Iframe request timed out: ${name}`); error.code = 'IFRAME_REQUEST_TIMEOUT'; reject(error); }, timeout);
                    pending.set(id, { resolve, reject, timer });
                    if (!post(envelope('request', { name: String(name), payload }, id))) { clearTimeout(timer); pending.delete(id); reject(new Error('[JquanUI iframeBridge] Unable to send request.')); }
                }));
            },
            on(name, handler) {
                if (typeof handler !== 'function') return () => {};
                const key = String(name).startsWith('request:') ? String(name) : String(name);
                if (!listeners.has(key)) listeners.set(key, []);
                listeners.get(key).push(handler);
                return () => bridge.off(key, handler);
            },
            off(name, handler) {
                const key = String(name);
                const list = listeners.get(key) || [];
                listeners.set(key, list.filter(item => item !== handler));
                return bridge;
            },
            state() { return { role, namespace, connected, ready: readyState, peerOrigin: targetOrigin, channel: !!port, pending: pending.size }; },
            destroy() {
                if (destroyed) return;
                destroyed = true;
                global.clearInterval(helloTimer);
                global.removeEventListener('message', onWindowMessage);
                if (iframe?.removeEventListener && onLoad) iframe.removeEventListener('load', onLoad);
                if (port?.close) port.close();
                rejectPending(Object.assign(new Error('[JquanUI iframeBridge] Bridge destroyed.'), { code: 'IFRAME_BRIDGE_DESTROYED' }));
                listeners.clear();
            }
        };
        const onLoad = () => startHandshake();
        global.addEventListener('message', onWindowMessage);
        if (role === 'parent' && iframe?.addEventListener) iframe.addEventListener('load', onLoad);
        startHandshake();
        return bridge;
    }

    const api = {
        createParent(options = {}) { return createBridge('parent', options); },
        createChild(options = {}) { return createBridge('child', options); }
    };

    components.iframeBridgeApi = api;
    components.iframeBridge = {
        name: 'jquanui-iframe-bridge',
        version: '1.0.0',
        requires: [],
        install() {},
        teardown() {}
    };
})(window);
