(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    function isElement(value) {
        return value instanceof Element;
    }

    function isNode(value) {
        return value instanceof Node;
    }

    function isNodeList(value) {
        return value instanceof NodeList || value instanceof HTMLCollection || Array.isArray(value);
    }

    function isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    function toArray(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (isNodeList(value)) return Array.from(value);
        return [value];
    }

    function splitClassNames(value) {
        return String(value || '').split(/\s+/).filter(Boolean);
    }

    function resolveRoot(root) {
        if (!root) return document;
        if (isElement(root) || root === document || root instanceof DocumentFragment) return root;
        if (typeof root === 'string') return document.querySelector(root) || document;
        return document;
    }

    function resolveTargets(target, root) {
        if (typeof target === 'string') {
            return Array.from(resolveRoot(root).querySelectorAll(target));
        }
        return toArray(target).filter(node => isNode(node) || node === document || node instanceof DocumentFragment);
    }

    function resolveFirstTarget(target, root) {
        if (typeof target === 'string') return resolveRoot(root).querySelector(target);
        const list = resolveTargets(target, root);
        return list[0] || null;
    }

    function query(selector, root) {
        return resolveRoot(root).querySelector(selector);
    }

    function queryAll(selector, root) {
        return Array.from(resolveRoot(root).querySelectorAll(selector));
    }

    function create(tagName, options = {}) {
        const element = document.createElement(tagName);
        const {
            className,
            text,
            html,
            attrs,
            style,
            children
        } = options;

        if (className) element.className = className;
        if (text != null) element.textContent = String(text);
        if (html != null) element.innerHTML = String(html);
        if (isObject(attrs)) {
            Object.entries(attrs).forEach(([key, value]) => {
                if (value == null) return;
                element.setAttribute(key, String(value));
            });
        }
        if (isObject(style)) Object.assign(element.style, style);
        if (children) append(element, children);
        return element;
    }

    function build(html) {
        const template = document.createElement('template');
        template.innerHTML = String(html || '').trim();
        return template.content.firstElementChild || null;
    }

    function append(target, content) {
        const element = resolveFirstTarget(target);
        if (!(isElement(element) || element instanceof DocumentFragment)) return null;
        toArray(content).forEach(item => {
            if (typeof item === 'string') element.insertAdjacentHTML('beforeend', item);
            else if (isNode(item)) element.appendChild(item);
        });
        return element;
    }

    function prepend(target, content) {
        const element = resolveFirstTarget(target);
        if (!(isElement(element) || element instanceof DocumentFragment)) return null;
        const items = toArray(content);
        for (let i = items.length - 1; i >= 0; i -= 1) {
            const item = items[i];
            if (typeof item === 'string') element.insertAdjacentHTML('afterbegin', item);
            else if (isNode(item)) element.insertBefore(item, element.firstChild);
        }
        return element;
    }

    function before(target, content) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return null;
        toArray(content).forEach(item => {
            if (typeof item === 'string') element.insertAdjacentHTML('beforebegin', item);
            else if (isNode(item) && element.parentNode) element.parentNode.insertBefore(item, element);
        });
        return element;
    }

    function after(target, content) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return null;
        const items = toArray(content);
        for (let i = items.length - 1; i >= 0; i -= 1) {
            const item = items[i];
            if (typeof item === 'string') element.insertAdjacentHTML('afterend', item);
            else if (isNode(item) && element.parentNode) element.parentNode.insertBefore(item, element.nextSibling);
        }
        return element;
    }

    function remove(target) {
        resolveTargets(target).forEach(node => {
            if (node && typeof node.remove === 'function') node.remove();
        });
        return true;
    }

    function empty(target) {
        const targets = resolveTargets(target);
        targets.forEach(node => {
            if (isElement(node)) node.innerHTML = '';
        });
        return targets[0] || null;
    }

    function html(target, value) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return value === undefined ? '' : null;
        if (value === undefined) return element.innerHTML;
        element.innerHTML = String(value);
        return element;
    }

    function text(target, value) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return value === undefined ? '' : null;
        if (value === undefined) return element.textContent || '';
        element.textContent = String(value);
        return element;
    }

    function val(target, value) {
        const element = resolveFirstTarget(target);
        if (!element || !('value' in element)) return value === undefined ? '' : null;
        if (value === undefined) return element.value;
        element.value = value;
        return element;
    }

    function attr(target, name, value) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return value === undefined ? null : element;
        if (isObject(name)) {
            Object.entries(name).forEach(([key, nextValue]) => {
                if (nextValue == null) element.removeAttribute(key);
                else element.setAttribute(key, String(nextValue));
            });
            return element;
        }
        if (value === undefined) return element.getAttribute(name);
        if (value == null) element.removeAttribute(name);
        else element.setAttribute(name, String(value));
        return element;
    }

    function removeAttr(target, name) {
        resolveTargets(target).forEach(node => {
            if (isElement(node)) node.removeAttribute(name);
        });
        return resolveFirstTarget(target);
    }

    function data(target, name, value) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return value === undefined ? null : element;
        if (value === undefined) return element.dataset[name];
        if (value == null) delete element.dataset[name];
        else element.dataset[name] = String(value);
        return element;
    }

    function css(target, name, value) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return value === undefined ? '' : element;
        if (isObject(name)) {
            Object.assign(element.style, name);
            return element;
        }
        if (value === undefined) return getComputedStyle(element)[name];
        element.style[name] = value;
        return element;
    }

    function addClass(target, className) {
        const names = splitClassNames(className);
        resolveTargets(target).forEach(node => {
            if (isElement(node) && names.length) node.classList.add(...names);
        });
        return target;
    }

    function removeClass(target, className) {
        const names = splitClassNames(className);
        resolveTargets(target).forEach(node => {
            if (isElement(node) && names.length) node.classList.remove(...names);
        });
        return target;
    }

    function toggleClass(target, className, force) {
        const names = splitClassNames(className);
        let changed = false;
        resolveTargets(target).forEach(node => {
            if (!isElement(node) || !names.length) return;
            names.forEach(name => {
                if (force === undefined) changed = node.classList.toggle(name) || changed;
                else {
                    node.classList.toggle(name, force);
                    changed = true;
                }
            });
        });
        return changed;
    }

    function hasClass(target, className) {
        const element = resolveFirstTarget(target);
        const names = splitClassNames(className);
        return isElement(element) ? names.every(name => element.classList.contains(name)) : false;
    }

    function show(target, displayValue) {
        resolveTargets(target).forEach(node => {
            if (!isElement(node)) return;
            const original = node.dataset.originalDisplay || displayValue || 'block';
            node.style.display = original;
            delete node.dataset.originalDisplay;
        });
        return target;
    }

    function hide(target) {
        resolveTargets(target).forEach(node => {
            if (!isElement(node)) return;
            const current = getComputedStyle(node).display;
            if (current !== 'none') node.dataset.originalDisplay = current;
            node.style.display = 'none';
        });
        return target;
    }

    function toggle(target) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return false;
        const hidden = getComputedStyle(element).display === 'none';
        if (hidden) show(element);
        else hide(element);
        return hidden;
    }

    function parent(target, selector) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return null;
        if (!selector) return element.parentElement;
        return element.closest(selector)?.parentElement || element.parentElement?.closest(selector) || null;
    }

    function children(target, selector) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return [];
        const all = Array.from(element.children);
        return selector ? all.filter(child => child.matches(selector)) : all;
    }

    function closest(target, selector) {
        const element = resolveFirstTarget(target);
        return isElement(element) ? element.closest(selector) : null;
    }

    function next(target, selector) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return null;
        let current = element.nextElementSibling;
        while (current) {
            if (!selector || current.matches(selector)) return current;
            current = current.nextElementSibling;
        }
        return null;
    }

    function prev(target, selector) {
        const element = resolveFirstTarget(target);
        if (!isElement(element)) return null;
        let current = element.previousElementSibling;
        while (current) {
            if (!selector || current.matches(selector)) return current;
            current = current.previousElementSibling;
        }
        return null;
    }

    function on(target, events, handler, options) {
        const nodes = resolveTargets(target);
        if (!nodes.length || typeof handler !== 'function') return null;
        String(events).split(/\s+/).filter(Boolean).forEach(event => {
            nodes.forEach(node => node.addEventListener(event, handler, options));
        });
        return handler;
    }

    function off(target, events, handler, options) {
        const nodes = resolveTargets(target);
        if (!nodes.length || typeof handler !== 'function') return null;
        String(events).split(/\s+/).filter(Boolean).forEach(event => {
            nodes.forEach(node => node.removeEventListener(event, handler, options));
        });
        return handler;
    }

    function once(target, events, handler, options) {
        const nodes = resolveTargets(target);
        if (!nodes.length || typeof handler !== 'function') return null;
        const wrapped = function wrapped(event) {
            off(nodes, events, wrapped, options);
            handler.call(this, event);
        };
        on(nodes, events, wrapped, options);
        return wrapped;
    }

    function delegate(target, selector, events, handler, options) {
        const element = resolveFirstTarget(target);
        if (!element || typeof handler !== 'function') return null;
        const wrapped = function wrapped(event) {
            const matched = event.target.closest(selector);
            if (matched && element.contains(matched)) {
                handler.call(matched, event, matched);
            }
        };
        on(element, events, wrapped, options);
        return wrapped;
    }

    function trigger(target, eventName, detail) {
        const element = resolveFirstTarget(target);
        if (!element) return false;
        return element.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail
        }));
    }

    function ready(callback) {
        if (typeof callback !== 'function') return;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    function serializeForm(form) {
        const element = resolveFirstTarget(form);
        if (!(element instanceof HTMLFormElement)) return {};
        const formData = new FormData(element);
        const result = {};
        for (const [key, value] of formData.entries()) {
            if (Object.prototype.hasOwnProperty.call(result, key)) {
                if (Array.isArray(result[key])) result[key].push(value);
                else result[key] = [result[key], value];
            } else {
                result[key] = value;
            }
        }
        return result;
    }

    function observeMutation(target, callback, options) {
        const element = resolveFirstTarget(target);
        if (!element || typeof callback !== 'function') return null;
        const observer = new MutationObserver((mutations, obs) => callback(mutations, obs));
        observer.observe(element, Object.assign({
            childList: true,
            subtree: true,
            attributes: true
        }, options || {}));
        return observer;
    }

    function observeResize(target, callback, options) {
        const element = resolveFirstTarget(target);
        if (!element || typeof callback !== 'function') return null;
        const observer = new ResizeObserver((entries, obs) => callback(entries, obs));
        observer.observe(element, options || {});
        return observer;
    }

    function observeIntersection(target, callback, options) {
        const elements = resolveTargets(target);
        if (!elements.length || typeof callback !== 'function') return null;
        const observer = new IntersectionObserver((entries, obs) => callback(entries, obs), options || {});
        elements.forEach(element => observer.observe(element));
        return observer;
    }

    function debounce(fn, wait, immediate) {
        let timer = null;
        return function debounced(...args) {
            const callNow = immediate && !timer;
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = null;
                if (!immediate) fn.apply(this, args);
            }, wait);
            if (callNow) fn.apply(this, args);
        };
    }

    function throttle(fn, wait) {
        let last = 0;
        let timer = null;
        return function throttled(...args) {
            const now = Date.now();
            const remaining = wait - (now - last);
            if (remaining <= 0) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                last = now;
                fn.apply(this, args);
            } else if (!timer) {
                timer = setTimeout(() => {
                    last = Date.now();
                    timer = null;
                    fn.apply(this, args);
                }, remaining);
            }
        };
    }

    const domApi = {
        query,
        queryAll,
        resolveRoot,
        resolveTargets,
        create,
        build,
        append,
        prepend,
        before,
        after,
        remove,
        empty,
        html,
        text,
        val,
        attr,
        removeAttr,
        data,
        css,
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        show,
        hide,
        toggle,
        parent,
        children,
        closest,
        next,
        prev,
        on,
        off,
        once,
        delegate,
        trigger,
        ready,
        serializeForm,
        observeMutation,
        observeResize,
        observeIntersection,
        debounce,
        throttle
    };

    const domComponent = Object.assign({}, domApi, {
        name: 'jquanui-dom',
        version: '1.2.0',
        requires: [],
        install() {
            if (!global.JquanDOM) global.JquanDOM = domApi;
        }
    });

    JquanUIComponents.domApi = domApi;
    JquanUIComponents.dom = domComponent;
    if (!global.JquanDOM) global.JquanDOM = domApi;
})(window);
