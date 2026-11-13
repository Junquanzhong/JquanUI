(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaults = {
        title: document.title || 'Print',
        pageStyle: '@page { size: auto; margin: 16mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
        copyStyles: true,
        removeSelectors: '[data-print-ignore="true"], [jq-print-trigger]'
    };

    function nextId() {
        runtime.seed += 1;
        return 'jq-print-' + runtime.seed;
    }

    function resolveTarget(target, root) {
        if (!target) return root || null;
        if (typeof target === 'string') return (root || document).querySelector(target);
        return target.nodeType === 1 ? target : null;
    }

    function collectStyles(doc) {
        return Array.from(doc.querySelectorAll('style, link[rel="stylesheet"]')).map(function (node) {
            return node.outerHTML;
        }).join('\n');
    }

    function clonePrintable(node, removeSelectors) {
        const clone = node.cloneNode(true);
        if (removeSelectors) {
            Array.from(clone.querySelectorAll(removeSelectors)).forEach(function (child) {
                child.remove();
            });
            if (clone.matches && clone.matches(removeSelectors)) return null;
        }
        return clone;
    }

    function dispatch(root, eventName, detail) {
        root.dispatchEvent(new CustomEvent('jquan:print:' + eventName, {
            bubbles: true,
            detail: detail || {}
        }));
    }

    function printNode(root, input) {
        const options = Object.assign({}, defaults, input || {});
        const source = resolveTarget(options.target || root.getAttribute('data-print-target') || '[jq-print-content]', root) || root;
        const printable = clonePrintable(source, options.removeSelectors);
        if (!printable) throw new Error('Printable node not found.');
        const iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        const head = [
            '<meta charset="utf-8">',
            '<title>' + String(options.title || defaults.title) + '</title>',
            options.copyStyles === false ? '' : collectStyles(document),
            '<style>' + (options.pageStyle || defaults.pageStyle) + '</style>'
        ].join('\n');
        doc.open();
        doc.write('<!DOCTYPE html><html><head>' + head + '</head><body></body></html>');
        doc.close();
        doc.body.appendChild(printable);
        dispatch(root, 'before', {
            title: options.title || defaults.title
        });

        const cleanup = function () {
            iframe.remove();
            dispatch(root, 'after', {
                title: options.title || defaults.title
            });
        };

        const win = iframe.contentWindow;
        win.focus();
        global.setTimeout(function () {
            try {
                win.print();
            } finally {
                global.setTimeout(cleanup, 240);
            }
        }, 80);
        return {
            title: options.title || defaults.title,
            target: source.id ? '#' + source.id : source.tagName.toLowerCase()
        };
    }

    function mount(target, options) {
        const root = resolveTarget(target);
        if (!root) return null;
        const existingId = root.getAttribute('data-print-id');
        if (existingId && runtime.instances.has(existingId)) return runtime.instances.get(existingId).handle;

        const id = existingId || root.id || nextId();
        const instance = {
            id: id,
            root: root,
            options: Object.assign({}, defaults, options || {}),
            onClick(event) {
                const trigger = event.target.closest('[jq-print-trigger]');
                if (!trigger || !root.contains(trigger)) return;
                event.preventDefault();
                try {
                    printNode(root, Object.assign({}, instance.options, {
                        target: trigger.getAttribute('data-print-target') || instance.options.target,
                        title: trigger.getAttribute('data-print-title') || instance.options.title
                    }));
                } catch (error) {
                    dispatch(root, 'error', { message: error.message });
                }
            }
        };

        const handle = {
            id: id,
            print(input) {
                return printNode(root, Object.assign({}, instance.options, input || {}));
            },
            update(patch) {
                instance.options = Object.assign({}, instance.options, patch || {});
                return instance.options;
            },
            state() {
                return {
                    id: id,
                    title: instance.options.title,
                    target: instance.options.target || root.getAttribute('data-print-target') || '[jq-print-content]'
                };
            },
            destroy() {
                root.removeEventListener('click', instance.onClick);
                root.removeAttribute('data-print-id');
                runtime.instances.delete(id);
                return true;
            }
        };

        instance.handle = handle;
        root.setAttribute('data-print-id', id);
        root.addEventListener('click', instance.onClick);
        runtime.instances.set(id, instance);
        return handle;
    }

    const printApi = {
        mount: mount,
        print(target, options) {
            const root = resolveTarget(target);
            if (!root) return null;
            const handle = mount(root, options);
            return handle ? handle.print(options) : null;
        },
        destroy(target) {
            const root = resolveTarget(target);
            if (!root) return false;
            const id = root.getAttribute('data-print-id');
            const instance = id ? runtime.instances.get(id) : null;
            return instance ? instance.handle.destroy() : false;
        }
    };

    JquanUIComponents.printApi = printApi;
    JquanUIComponents.print = {
        name: 'jquanui-print',
        version: '1.0.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-print]',
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
