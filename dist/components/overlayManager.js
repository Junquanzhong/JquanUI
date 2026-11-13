(function (global) {
    const components = global.JquanUIComponents || (global.JquanUIComponents = {});
    if (components.overlayManager) return;
    const doc = global.document;
    const entries = [];
    let seed = 0;
    let scrollSnapshot = null;
    let observer = null;
    let destroying = false;
    const topEntry = () => entries[entries.length - 1] || null;
    const focusableSelector = 'a[href],area[href],button,input,select,textarea,iframe,[tabindex],[contenteditable="true"]';

    function available(node) {
        return node && node.isConnected && typeof node.focus === 'function' &&
            !node.matches(':disabled') && !node.closest('[hidden],[inert],[aria-hidden="true"]') &&
            global.getComputedStyle(node).visibility === 'visible' && node.getClientRects().length > 0;
    }

    function focusables(panel) {
        return Array.from(panel.querySelectorAll(focusableSelector)).filter(node => available(node) && node.tabIndex >= 0);
    }

    function focusInitial(entry) {
        let target = entry.options.initialFocus;
        if (typeof target === 'string') target = entry.panel.querySelector(target);
        if (!target || !entry.panel.contains(target) || !available(target)) target = focusables(entry.panel)[0];
        if (!target) {
            target = entry.panel;
            if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); entry.addedTabindex = true; }
        }
        if (available(target)) target.focus({ preventScroll: true });
    }

    function syncScroll() {
        const locked = entries.some(entry => entry.options.lockScroll);
        if (locked && !scrollSnapshot && doc.body) {
            const body = doc.body;
            scrollSnapshot = { body, x: body.style.getPropertyValue('overflow-x'), xPriority: body.style.getPropertyPriority('overflow-x'), y: body.style.getPropertyValue('overflow-y'), yPriority: body.style.getPropertyPriority('overflow-y'), padding: body.style.getPropertyValue('padding-right'), paddingPriority: body.style.getPropertyPriority('padding-right'), marker: body.getAttribute('data-jquan-overlay-scroll-lock') };
            const scrollbar = Math.max(0, global.innerWidth - doc.documentElement.clientWidth);
            if (scrollbar > 0) body.style.setProperty('padding-right', `${(parseFloat(global.getComputedStyle(body).paddingRight) || 0) + scrollbar}px`, 'important');
            body.style.setProperty('overflow', 'hidden', 'important');
            body.setAttribute('data-jquan-overlay-scroll-lock', 'true');
        } else if (!locked && scrollSnapshot) {
            const { body, x, xPriority, y, yPriority, padding, paddingPriority, marker } = scrollSnapshot;
            body.style.removeProperty('overflow');
            if (x) body.style.setProperty('overflow-x', x, xPriority);
            if (y) body.style.setProperty('overflow-y', y, yPriority);
            if (padding) body.style.setProperty('padding-right', padding, paddingPriority); else body.style.removeProperty('padding-right');
            if (marker === null) body.removeAttribute('data-jquan-overlay-scroll-lock'); else body.setAttribute('data-jquan-overlay-scroll-lock', marker);
            scrollSnapshot = null;
        }
    }

    function syncLayers() {
        let previous = -Infinity;
        entries.forEach(entry => {
            previous = Math.max(entry.options.zIndex ?? 1000, previous + 1);
            entry.element.style.setProperty('z-index', String(previous), 'important');
        });
    }

    function notify() {
        doc.dispatchEvent(new global.CustomEvent('jquanui-overlay-change', { detail: { count: entries.length } }));
    }

    function requestClose(entry, reason) {
        if (entry.closed) return Promise.resolve(false);
        if (entry.requestPromise) return entry.requestPromise;
        const pending = Promise.resolve().then(() => {
            if (entry.closed) return false;
            return entry.options.onRequestClose ? entry.options.onRequestClose(reason, entry.handle) : release(entry, reason);
        }).then(result => result !== false);
        entry.requestPromise = pending;
        const clear = () => { if (entry.requestPromise === pending) entry.requestPromise = null; };
        pending.then(clear, clear);
        return pending;
    }

    function dismiss(entry, reason) {
        // Keep immediate dismissal for existing consumers without a request hook.
        if (!entry.options.onRequestClose) return release(entry, reason);
        requestClose(entry, reason).catch(error => global.setTimeout(() => { throw error; }));
    }

    function snapshot(entry) {
        return { id: entry.id, element: entry.element, panel: entry.panel, ownerElement: entry.options.ownerElement || null, isTop: topEntry() === entry, closed: entry.closed, lockScroll: entry.options.lockScroll, trapFocus: entry.options.trapFocus };
    }

    function release(entry, reason) {
        if (entry.closed) return false;
        const wasTop = topEntry() === entry;
        entry.closed = true;
        entries.splice(entries.indexOf(entry), 1);
        // A child may have saved a trigger in a lower layer that is now closing.
        entries.forEach(other => {
            if (other.returnTarget && entry.element.contains(other.returnTarget)) other.returnTarget = entry.returnTarget;
        });
        if (entry.zValue) entry.element.style.setProperty('z-index', entry.zValue, entry.zPriority); else entry.element.style.removeProperty('z-index');
        if (entry.addedTabindex && entry.panel.getAttribute('tabindex') === '-1') entry.panel.removeAttribute('tabindex');
        syncLayers();
        syncScroll();
        notify();
        const next = topEntry();
        if (!entries.length) stopListening();
        try { entry.options.onClose?.(reason, entry.handle); }
        finally {
            // An onClose callback may itself open another layer; keep its new focus.
            if (wasTop && topEntry() === next && entry.returnTarget !== false) {
                if (available(entry.returnTarget) && (!next || !next.options.trapFocus || next.panel.contains(entry.returnTarget))) entry.returnTarget.focus({ preventScroll: true });
                else if (next) focusInitial(next);
            }
        }
        return true;
    }

    function onKeydown(event) {
        const entry = topEntry();
        if (!entry || event.defaultPrevented || event.isComposing) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (entry.options.closeOnEscape) dismiss(entry, 'escape');
        } else if (event.key === 'Tab' && entry.options.trapFocus) {
            const nodes = focusables(entry.panel);
            const first = nodes[0], last = nodes[nodes.length - 1];
            if (!first) { event.preventDefault(); focusInitial(entry); }
            else if (event.shiftKey && (doc.activeElement === first || !nodes.includes(doc.activeElement))) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (doc.activeElement === last || !nodes.includes(doc.activeElement))) { event.preventDefault(); first.focus(); }
        }
    }

    function onFocus(event) {
        const entry = topEntry();
        if (entry?.options.trapFocus && !entry.panel.contains(event.target)) focusInitial(entry);
    }

    function onClick(event) {
        const entry = topEntry();
        if (!entry || !entry.options.closeOnOutside || event.defaultPrevented) return;
        const regions = [entry.panel, ...(entry.options.outsideElements || [])];
        const inside = regions.some(node => node && (event.composedPath ? event.composedPath().includes(node) : node.contains(event.target)));
        if (!inside) { event.preventDefault(); event.stopPropagation(); dismiss(entry, 'outside'); }
    }

    function startListening() {
        doc.addEventListener('keydown', onKeydown, true);
        doc.addEventListener('focusin', onFocus, true);
        doc.addEventListener('click', onClick, true);
        observer = new global.MutationObserver(() => {
            releaseAll(entries.slice().reverse().filter(entry => !entry.element.isConnected || !entry.panel.isConnected || (entry.options.ownerElement && !entry.options.ownerElement.isConnected)), 'detached');
        });
        observer.observe(doc.documentElement, { childList: true, subtree: true });
    }

    function stopListening() {
        doc.removeEventListener('keydown', onKeydown, true);
        doc.removeEventListener('focusin', onFocus, true);
        doc.removeEventListener('click', onClick, true);
        observer?.disconnect();
        observer = null;
    }

    function open(options) {
        if (destroying) throw new Error('OverlayManager is releasing its stack');
        if (!options || !options.element || options.element.ownerDocument !== doc || !options.element.isConnected) throw new TypeError('Overlay element must be connected to the current document');
        const existing = entries.find(entry => entry.element === options.element);
        if (existing) return existing.handle;
        const panel = options.panel || options.element;
        if (!options.element.contains(panel)) throw new TypeError('Overlay panel must belong to the overlay element');
        if (typeof options.initialFocus === 'string') panel.querySelector(options.initialFocus); // Validate before acquiring resources.
        if (options.zIndex !== undefined && !Number.isFinite(options.zIndex)) throw new TypeError('Overlay zIndex must be finite');
        if (options.ownerElement && (options.ownerElement.ownerDocument !== doc || !options.ownerElement.isConnected)) throw new TypeError('Overlay ownerElement must be connected to the current document');
        const entry = {
            id: `jq-overlay-${++seed}`, element: options.element, panel, closed: false, addedTabindex: false, requestPromise: null,
            options: { ...options, trapFocus: options.trapFocus ?? true, lockScroll: options.lockScroll ?? true, closeOnEscape: options.closeOnEscape ?? true, closeOnOutside: options.closeOnOutside ?? false },
            returnTarget: options.returnFocus === undefined ? doc.activeElement : options.returnFocus,
            zValue: options.element.style.getPropertyValue('z-index'), zPriority: options.element.style.getPropertyPriority('z-index')
        };
        entry.handle = {
            id: entry.id,
            close: (reason = 'programmatic') => release(entry, reason),
            requestClose: (reason = 'programmatic') => requestClose(entry, reason),
            update(options) {
                if (entry.closed) return null;
                const patch = {};
                for (const key of ['trapFocus', 'lockScroll', 'closeOnEscape', 'closeOnOutside', 'initialFocus', 'onRequestClose', 'zIndex', 'outsideElements', 'autoFocus']) {
                    if (options?.[key] !== undefined) patch[key] = options[key];
                }
                if (typeof patch.initialFocus === 'string') entry.panel.querySelector(patch.initialFocus);
                if (patch.zIndex !== undefined && !Number.isFinite(patch.zIndex)) throw new TypeError('Overlay zIndex must be finite');
                Object.assign(entry.options, patch);
                if (options && Object.prototype.hasOwnProperty.call(options, 'returnFocus')) entry.returnTarget = options.returnFocus === undefined ? doc.activeElement : options.returnFocus;
                entry.requestPromise = null;
                syncLayers(); syncScroll(); notify();
                if (entry.handle.isTop() && entry.options.trapFocus && !entry.panel.contains(doc.activeElement)) focusInitial(entry);
                return entry.handle;
            },
            focus() { if (entry.closed || !entry.handle.isTop()) return false; focusInitial(entry); return true; },
            destroy: () => release(entry, 'destroy'),
            isTop: () => topEntry() === entry,
            state: () => snapshot(entry)
        };
        entries.push(entry);
        if (entries.length === 1) startListening();
        syncLayers(); syncScroll(); notify();
        if (entry.options.autoFocus !== false && (entry.options.autoFocus === true || entry.options.trapFocus || entry.options.initialFocus)) focusInitial(entry);
        return entry.handle;
    }

    function destroy() {
        if (destroying) return 0;
        const pending = entries.slice().reverse();
        destroying = true;
        try { return releaseAll(pending, 'destroy'); }
        finally { destroying = false; }
    }

    function releaseAll(pending, reason) {
        // Both explicit destruction and detached cleanup must release the whole batch.
        let firstError;
        pending.forEach(entry => { try { release(entry, reason); } catch (error) { firstError ||= error; } });
        if (firstError) throw firstError;
        return pending.length;
    }

    components.overlayManagerApi = { open, top: () => topEntry()?.handle || null, stack: () => entries.map(snapshot), destroy };
    components.overlayManager = { name: 'jquanui-overlay-manager', version: '1.3.0', requires: [], install() { return destroy; } };
})(window);
