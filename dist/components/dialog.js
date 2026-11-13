(function (global) {
    const components = global.JquanUIComponents || (global.JquanUIComponents = {});

    let seed = 0;

    components.dialog = {
        name: 'jquanui-dialog',
        version: '1.5.0',
        requires: ['jquanui-overlay-manager'],
        install(api) {
            api.addComponents([
                `
[jq-dialog]{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:1.5rem;z-index:1000}
[jq-dialog][data-state="open"]{display:flex}
[jq-dialog-backdrop]{position:absolute;inset:0;background:rgb(15 23 42 / .55)}
[jq-dialog-panel]{position:relative;width:min(40rem,100%);max-height:min(85vh,48rem);overflow:auto;border-radius:1rem;background:rgb(var(--color-surface, 255 255 255) / 1);color:rgb(var(--color-text, 15 23 42) / 1);box-shadow:0 24px 64px rgb(15 23 42 / .24)}
[jq-dialog-close]{cursor:pointer}
                `
            ]);

            const records = new WeakMap();

            function manager() {
                const value = components.overlayManagerApi;
                if (!value || typeof value.open !== 'function') throw new Error('[JquanUI dialog] Load overlayManager.js before opening Dialog.');
                return value;
            }

            function syncTriggers(node, open) {
                document.querySelectorAll('[jq-dialog-trigger]').forEach(trigger => {
                    const selector = trigger.getAttribute('jq-target');
                    if (!selector) return;
                    let target = null;
                    try { target = document.querySelector(selector); } catch { return; }
                    if (target !== node && (target || node.isConnected || trigger.getAttribute('aria-controls') !== node.id)) return;
                    if (node.id) trigger.setAttribute('aria-controls', node.id);
                    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
                });
            }

            function closeRecord(record, reason) {
                if (!record.handle || typeof record.handle.close !== 'function') return false;
                return record.handle.close(reason || 'programmatic');
            }

            function openRecord(record) {
                if (record.handle && record.handle.state && !record.handle.state().closed) {
                    record.handle.focus?.();
                    return record.handle;
                }
                const overlays = manager();
                const previous = document.activeElement;
                record.node.hidden = false;
                record.node.setAttribute('data-state', 'open');
                syncTriggers(record.node, true);
                try {
                    record.handle = overlays.open({
                        element: record.node,
                        panel: record.panel,
                        trapFocus: true,
                        lockScroll: true,
                        closeOnEscape: true,
                        closeOnOutside: false,
                        initialFocus: record.node.querySelector('[jq-dialog-initial-focus]'),
                        returnFocus: previous,
                        onClose(reason) {
                            record.handle = null;
                            record.node.setAttribute('data-state', 'closed');
                            record.node.hidden = true;
                            syncTriggers(record.node, false);
                            record.lastCloseReason = reason;
                        }
                    });
                    return record.handle;
                } catch (error) {
                    record.node.setAttribute('data-state', 'closed');
                    record.node.hidden = true;
                    syncTriggers(record.node, false);
                    throw error;
                }
            }

            api.addBehaviors([
                {
                    selector: '[jq-dialog]',
                    setup(node) {
                        const panel = node.querySelector('[jq-dialog-panel]') || node;
                        if (!node.hasAttribute('role')) node.setAttribute('role', 'dialog');
                        node.setAttribute('aria-modal', 'true');
                        if (!node.hasAttribute('data-state')) node.setAttribute('data-state', 'closed');
                        if (node.getAttribute('data-state') !== 'open') node.hidden = true;
                        if (!node.id) {
                            do { node.id = `jq-dialog-${++seed}`; } while (document.querySelectorAll(`[id="${node.id}"]`).length > 1);
                        }
                        const record = { node, panel, handle: null, lastCloseReason: null };
                        records.set(node, record);
                        const onClick = event => {
                            const target = event.target instanceof Element ? event.target : null;
                            if (!target) return;
                            const owner = target.closest('[jq-dialog]');
                            if (owner !== node) return;
                            if (record.handle?.isTop() && (target === node || target.closest('[jq-dialog-backdrop]') || target.closest('[jq-dialog-close]'))) closeRecord(record, 'programmatic');
                        };
                        node.addEventListener('click', onClick);
                        if (node.getAttribute('data-state') === 'open') openRecord(record);
                        else syncTriggers(node, false);
                        return () => {
                            if (record.handle) closeRecord(record, 'destroy');
                            node.removeEventListener('click', onClick);
                            records.delete(node);
                        };
                    }
                },
                {
                    selector: '[jq-dialog-trigger]',
                    setup(node) {
                        const onClick = event => {
                            const selector = node.getAttribute('jq-target');
                            if (!selector) return;
                            let target = null;
                            try { target = document.querySelector(selector); } catch { return; }
                            const record = target && records.get(target);
                            if (!record) return;
                            event.preventDefault();
                            if (target.id) node.setAttribute('aria-controls', target.id);
                            node.setAttribute('aria-expanded', 'true');
                            openRecord(record);
                        };
                        const selector = node.getAttribute('jq-target');
                        if (selector) {
                            try {
                                const target = document.querySelector(selector);
                                if (target?.id) node.setAttribute('aria-controls', target.id);
                                node.setAttribute('aria-expanded', records.get(target)?.handle ? 'true' : 'false');
                            } catch { /* invalid selector is handled on activation */ }
                        }
                        node.addEventListener('click', onClick);
                        return () => node.removeEventListener('click', onClick);
                    }
                }
            ]);
        }
    };
})(window);
