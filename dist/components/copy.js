(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    function normalizeText(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    async function fallbackCopy(text) {
        return new Promise(resolve => {
            const el = document.createElement('textarea');
            el.value = text;
            el.setAttribute('readonly', 'true');
            el.style.position = 'fixed';
            el.style.top = '0';
            el.style.left = '-9999px';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.focus();
            el.select();

            let successful = false;
            try {
                successful = document.execCommand('copy');
            } catch (error) {
                successful = false;
            }

            document.body.removeChild(el);
            resolve(successful);
        });
    }

    async function writeClipboard(text) {
        const normalized = normalizeText(text);
        if (!normalized) return false;

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(normalized);
                return true;
            } catch (error) {
                return fallbackCopy(normalized);
            }
        }

        return fallbackCopy(normalized);
    }

    function resolveTargetElement(reference, rootDocument) {
        if (!reference) return null;
        if (reference instanceof HTMLElement) return reference;
        if (typeof reference === 'string') {
            try {
                return rootDocument.querySelector(reference);
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    function extractElementText(element) {
        if (!element) return '';
        if ('value' in element && typeof element.value === 'string') return normalizeText(element.value);
        if (element.getAttribute('data-copy-source') === 'html') return normalizeText(element.innerHTML);
        return normalizeText(element.textContent || element.innerText || '');
    }

    function emitCopyEvent(node, type, detail) {
        node.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            detail
        }));
    }

    function setLiveFeedback(node, message) {
        const liveId = node.getAttribute('aria-describedby');
        const liveRegion = liveId ? document.getElementById(liveId) : null;
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    function updateTriggerState(node, state, resetDelay) {
        node.setAttribute('data-copy-state', state);
        if (state === 'success' || state === 'error') {
            const timer = window.setTimeout(() => {
                node.setAttribute('data-copy-state', 'idle');
            }, resetDelay);
            return timer;
        }
        return null;
    }

    async function performCopy(options) {
        const {
            text,
            target,
            trigger,
            documentRef = document,
            successMessage = 'Copied',
            errorMessage = 'Copy failed',
            emptyMessage = 'Nothing to copy',
            resetDelay = 1800
        } = options;

        let resolvedText = normalizeText(text);
        let targetElement = null;

        if (!resolvedText && target) {
            targetElement = resolveTargetElement(target, documentRef);
            resolvedText = extractElementText(targetElement);
        }

        if (!resolvedText) {
            if (trigger) {
                setLiveFeedback(trigger, emptyMessage);
                emitCopyEvent(trigger, 'jquan:copy:error', { ok: false, reason: 'empty', target: targetElement, text: '' });
                updateTriggerState(trigger, 'error', resetDelay);
            }
            return { ok: false, reason: 'empty', text: '', target: targetElement };
        }

        if (trigger) {
            trigger.setAttribute('aria-busy', 'true');
            updateTriggerState(trigger, 'copying', resetDelay);
        }

        const ok = await writeClipboard(resolvedText);

        if (trigger) {
            trigger.removeAttribute('aria-busy');
            if (ok) {
                setLiveFeedback(trigger, successMessage);
                emitCopyEvent(trigger, 'jquan:copy:success', { ok: true, text: resolvedText, target: targetElement });
                updateTriggerState(trigger, 'success', resetDelay);
            } else {
                setLiveFeedback(trigger, errorMessage);
                emitCopyEvent(trigger, 'jquan:copy:error', { ok: false, reason: 'clipboard', text: resolvedText, target: targetElement });
                updateTriggerState(trigger, 'error', resetDelay);
            }
        }

        return { ok, text: resolvedText, target: targetElement, reason: ok ? null : 'clipboard' };
    }

    const copyApi = {
        copyText(text, options = {}) {
            return performCopy(Object.assign({}, options, { text }));
        },
        copyElement(target, options = {}) {
            return performCopy(Object.assign({}, options, { target }));
        }
    };

    JquanUIComponents.copyApi = copyApi;

    JquanUIComponents.copy = {
        name: 'jquanui-copy',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addComponents([
                `
[jq-copy-trigger]{
  position:relative;
}
[jq-copy-trigger][data-copy-state="copying"]{
  opacity:.82;
}
[jq-copy-trigger][data-copy-state="success"]{
  outline:2px solid rgb(var(--color-primary, 59 130 246) / .28);
  outline-offset:2px;
}
[jq-copy-trigger][data-copy-state="error"]{
  outline:2px solid rgb(239 68 68 / .28);
  outline-offset:2px;
}
[jq-copy-live]{
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0, 0, 0, 0);
  white-space:nowrap;
  border:0;
}
                `
            ]);

            api.addBehaviors({
                selector: '[jq-copy-trigger]',
                setup(node) {
                    if (node.tagName === 'BUTTON' && !node.hasAttribute('type')) {
                        node.setAttribute('type', 'button');
                    }

                    if (!node.hasAttribute('data-copy-state')) {
                        node.setAttribute('data-copy-state', 'idle');
                    }

                    const liveId = node.getAttribute('data-copy-live-id') || `jq-copy-live-${Math.random().toString(36).slice(2, 10)}`;
                    let liveRegion = document.getElementById(liveId);
                    if (!liveRegion) {
                        liveRegion = document.createElement('span');
                        liveRegion.id = liveId;
                        liveRegion.setAttribute('jq-copy-live', '');
                        liveRegion.setAttribute('aria-live', 'polite');
                        liveRegion.setAttribute('aria-atomic', 'true');
                        document.body.appendChild(liveRegion);
                    }
                    node.setAttribute('aria-describedby', liveId);

                    let resetTimer = null;

                    const onClick = async event => {
                        const text = node.getAttribute('data-copy-text');
                        const target = node.getAttribute('data-copy-target');
                        const successMessage = node.getAttribute('data-copy-success') || 'Copied';
                        const errorMessage = node.getAttribute('data-copy-error') || 'Copy failed';
                        const emptyMessage = node.getAttribute('data-copy-empty') || 'Nothing to copy';
                        const resetDelay = Number(node.getAttribute('data-copy-reset')) || 1800;

                        if (resetTimer) {
                            clearTimeout(resetTimer);
                            resetTimer = null;
                        }

                        const result = await performCopy({
                            text,
                            target,
                            trigger: node,
                            documentRef: document,
                            successMessage,
                            errorMessage,
                            emptyMessage,
                            resetDelay
                        });

                        if (result.ok || result.reason === 'clipboard' || result.reason === 'empty') {
                            resetTimer = window.setTimeout(() => {
                                node.setAttribute('data-copy-state', 'idle');
                            }, resetDelay);
                        }
                    };

                    node.addEventListener('click', onClick);

                    return () => {
                        if (resetTimer) clearTimeout(resetTimer);
                        node.removeEventListener('click', onClick);
                    };
                }
            });
        }
    };
})(window);
