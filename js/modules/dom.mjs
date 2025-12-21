// dom-complete.mjs - 完整DOM库实现
const typeCheck = (obj) => Object.prototype.toString.apply(obj);
const isFunction = (fn) => typeof fn === 'function' || '[object Function]' === typeCheck(fn);
const isObject = (obj) => ('[object Object]' === typeCheck(obj) || typeof obj === 'object' || isFunction(obj)) && obj !== null;
const isElement = (el) => !!(isObject(el) && el.nodeName && el.tagName && el.nodeType === 1);
const isString = (str) => typeof str === 'string';
const isArray = (arr) => Array.isArray ? Array.isArray(arr) : '[object Array]' === typeCheck(arr);
const isUndefined = (val) => typeof val === 'undefined';

// Attributes 属性操作
const hasClass = (element, className) => {
    return isElement(element) ? element.classList.contains(className) : false;
};

const addClass = (element, className) => {
    if (isElement(element)) {
        element.classList.add(className);
        return true;
    }
    return false;
};

const replaceClass = (element, oldClass, newClass) => {
    if (isElement(element) && hasClass(element, oldClass)) {
        removeClass(element, oldClass);
        addClass(element, newClass);
        return true;
    }
    return false;
};

const removeClass = (element, className) => {
    if (isElement(element)) {
        element.classList.remove(className);
        return true;
    }
    return false;
};

const toggleClass = (element, className) => {
    if (!isElement(element) || !className) return false;
    return element.classList.toggle(className);
};

const getAttribute = (element, attribute) => {
    return isElement(element) ? element.getAttribute(attribute) : null;
};

const setAttribute = (element, attribute, value) => {
    if (isElement(element)) {
        element.setAttribute(attribute, value);
        return true;
    }
    return false;
};

const removeAttribute = (element, attribute) => {
    if (isElement(element)) {
        element.removeAttribute(attribute);
        return true;
    }
    return false;
};

const getAttributes = (element, attributes = []) => {
    if (!isElement(element)) return {};
    const result = {};
    const attrs = isArray(attributes) && attributes.length > 0 ? attributes : element.getAttributeNames();
    attrs.forEach(attr => {
        const value = getAttribute(element, attr);
        if (value) result[attr] = value;
    });
    return result;
};

const setAttributes = (element, attributes) => {
    if (!isElement(element) || !isObject(attributes)) return false;
    Object.keys(attributes).forEach(key => {
        setAttribute(element, key, attributes[key]);
    });
    return true;
};

const removeAttributes = (element, attributes = []) => {
    if (!isElement(element)) return false;
    const attrs = isArray(attributes) && attributes.length > 0 ? attributes : element.getAttributeNames();
    attrs.forEach(attr => removeAttribute(element, attr));
    return true;
};

const getValue = (element) => {
    return isElement(element) ? element.value : '';
};

const setValue = (element, value) => {
    if (isElement(element)) {
        element.value = value;
        return true;
    }
    return false;
};

const attrs = (element, name, value) => {
    if (!isElement(element)) return null;
    if (!name && !value) return getAttributes(element);
    if (isString(name)) {
        if (isUndefined(value)) return getAttribute(element, name);
        return setAttribute(element, name, value);
    }
    if (isObject(name)) return setAttributes(element, name);
    return null;
};

const enable = (element) => {
    if (isElement(element) && getAttribute(element, 'disabled')) {
        return removeAttribute(element, 'disabled');
    }
    return false;
};

const disable = (element) => {
    if (isElement(element) && !getAttribute(element, 'disabled')) {
        return setAttribute(element, 'disabled', 'true');
    }
    return false;
};

const readonly = (element) => {
    if (isElement(element) && ['input', 'textarea'].includes(element.tagName.toLowerCase())) {
        if (getAttribute(element, 'readonly')) {
            return removeAttribute(element, 'readonly');
        } else {
            return setAttribute(element, 'readonly', 'true');
        }
    }
    return false;
};

const html = (element, content) => {
    if (!isElement(element)) return '';
    if (isUndefined(content)) {
        return element.innerHTML;
    } else {
        element.innerHTML = content;
        return true;
    }
};

const text = (element, content) => {
    if (!isElement(element)) return '';
    if (isUndefined(content)) {
        return element.textContent;
    } else {
        element.textContent = content;
        return true;
    }
};

const val = (element, value) => {
    if (!isElement(element)) return '';
    if (isUndefined(value)) {
        return element.value;
    } else {
        element.value = value;
        return true;
    }
};

// Base 基础操作
const build = (htmlString) => {
    if (!isString(htmlString)) return null;
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstElementChild;
};

const createElement = (tagName, attributes = {}, content = '') => {
    const element = document.createElement(tagName);
    
    if (isObject(attributes)) {
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'style' && isString(attributes[key])) {
                element.style.cssText = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
    }
    
    if (content) {
        if (isString(content)) {
            element.innerHTML = content;
        } else if (isElement(content)) {
            element.appendChild(content);
        } else if (isArray(content)) {
            content.forEach(item => {
                if (isElement(item)) element.appendChild(item);
            });
        }
    }
    
    return element;
};

const clone = (element, deep = true) => {
    return isElement(element) ? element.cloneNode(deep) : null;
};

const closest = (element, selector, context) => {
    if (!isElement(element)) return null;
    const root = context || document;
    let current = element;
    
    while (current && current !== root) {
        if (current.matches(selector)) return current;
        current = current.parentElement;
    }
    return current && current !== root && current.matches(selector) ? current : null;
};

const byClass = (className, context = document) => {
    const element = isElement(context) ? context : document;
    return isString(className) ? Array.from(element.getElementsByClassName(className)) : [];
};

const byId = (id, context = document) => {
    const element = isElement(context) ? context : document;
    return isString(id) ? element.getElementById(id.replace(/^#/, '')) : null;
};

const getEl = (selector, context = document) => {
    const element = isElement(context) ? context : document;
    return isString(selector) ? element.querySelector(selector) : null;
};

const first = (element, elementsOnly = true) => {
    return isElement(element) ? (elementsOnly ? element.firstElementChild : element.firstChild) : null;
};

const last = (element, elementsOnly = true) => {
    return isElement(element) ? (elementsOnly ? element.lastElementChild : element.lastChild) : null;
};

const filter = (elements, selector) => {
    if (!isArray(elements)) return [];
    if (isString(selector)) {
        return elements.filter(el => el.matches(selector));
    } else if (isFunction(selector)) {
        return elements.filter(selector);
    }
    return elements;
};

const find = (selector, context = document) => {
    return getEl(selector, context);
};

const findAll = (selector, context = document) => {
    const element = isElement(context) ? context : document;
    return isString(selector) ? Array.from(element.querySelectorAll(selector)) : [];
};

const fragment = (content) => {
    const frag = document.createDocumentFragment();
    if (isString(content)) {
        const div = document.createElement('div');
        div.innerHTML = content;
        while (div.firstChild) {
            frag.appendChild(div.firstChild);
        }
    } else if (isElement(content)) {
        frag.appendChild(content);
    } else if (isArray(content)) {
        content.forEach(item => {
            if (isElement(item)) frag.appendChild(item);
        });
    }
    return frag;
};

const getActiveElement = () => document.activeElement;

const getAncestorBy = (element, selector) => {
    if (!isElement(element)) return null;
    let current = element.parentElement;
    while (current) {
        if (isFunction(selector) ? selector(current) : current.matches(selector)) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
};

const getAncestorByClassName = (element, className) => {
    return getAncestorBy(element, el => hasClass(el, className));
};

const getAncestorByTagName = (element, tagName) => {
    return getAncestorBy(element, el => el.tagName.toLowerCase() === tagName.toLowerCase());
};

const getChildren = (element, selector) => {
    if (!isElement(element)) return [];
    const children = Array.from(element.children);
    if (isString(selector)) {
        return children.filter(child => child.matches(selector));
    } else if (isFunction(selector)) {
        return children.filter(selector);
    }
    return children;
};

const getChildrenBy = (element, selector) => {
    return getChildren(element, selector);
};

const getContainingBlock = (element) => {
    if (!isElement(element)) return null;
    let current = element.parentElement;
    while (current) {
        const style = window.getComputedStyle(current);
        if (style.transform !== 'none' || style.perspective !== 'none' || style.willChange === 'transform') {
            return current;
        }
        current = current.parentElement;
    }
    return null;
};

const getDocument = (element) => {
    return isElement(element) ? element.ownerDocument : document;
};

const getFirstChild = (element, selector) => {
    const children = getChildren(element, selector);
    return children.length > 0 ? children[0] : null;
};

const getFirstChildBy = (element, selector) => {
    return getFirstChild(element, selector);
};

const getImages = (selector = 'body', unique = false) => {
    const container = isString(selector) ? getEl(selector) : selector;
    if (!container) return [];
    const images = Array.from(container.getElementsByTagName('img')).map(img => img.src);
    return unique ? [...new Set(images)] : images;
};

const getHostOrParent = (element) => {
    return isElement(element) ? (element.getRootNode().host || element.parentElement) : null;
};

const getLastChild = (element, selector) => {
    const children = getChildren(element, selector);
    return children.length > 0 ? children[children.length - 1] : null;
};

const getLastChildBy = (element, selector) => {
    return getLastChild(element, selector);
};

const getNodeName = (element) => {
    return isElement(element) ? element.nodeName.toLowerCase() : '';
};

const getOffsetParent = (element) => {
    return isElement(element) ? element.offsetParent : null;
};

const getScrollParent = (element) => {
    if (!isElement(element)) return null;
    let current = element.parentElement;
    while (current) {
        const style = window.getComputedStyle(current);
        if (/(auto|scroll|overlay)/.test(style.overflow + style.overflowY + style.overflowX)) {
            return current;
        }
        current = current.parentElement;
    }
    return document.scrollingElement || document.documentElement;
};

const getTagName = (element) => {
    return isElement(element) ? element.tagName.toLowerCase() : '';
};

const getWindow = (element) => {
    return isElement(element) ? element.ownerDocument.defaultView : window;
};

const getVisualViewport = () => {
    return window.visualViewport || window;
};

const index = (element, context) => {
    const parent = isString(context) ? getEl(context) : context;
    if (!isElement(parent)) return -1;
    const children = Array.from(parent.children);
    return children.indexOf(element);
};

const children = (element, selector) => {
    return getChildren(element, selector);
};

const parent = (element, type = 'parent') => {
    if (!isElement(element)) return null;
    switch (type) {
        case 'offset': return getOffsetParent(element);
        case 'scroll': return getScrollParent(element);
        default: return element.parentElement;
    }
};

const parents = (element, includeSelf = false) => {
    if (!isElement(element)) return [];
    const result = [];
    let current = includeSelf ? element : element.parentElement;
    while (current) {
        result.push(current);
        current = current.parentElement;
    }
    return result;
};

// 继续实现其他分类的函数...
// 由于函数数量很多，这里先实现主要分类，后续可以继续扩展

// Color 颜色操作
const getColor = (element, property, hex = true) => {
    if (!isElement(element) || !isString(property)) return '';
    const style = window.getComputedStyle(element)[property];
    return hex ? toHex(style) : toRGB(style);
};

const randomHexColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

const toHex = (color) => {
    if (!color) return '';
    
    // 颜色名称映射
    const colorMap = {
        black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
        blue: '#0000ff', yellow: '#ffff00', purple: '#800080', orange: '#ffa500',
        pink: '#ffc0cb', brown: '#a52a2a', gray: '#808080', cyan: '#00ffff',
        magenta: '#ff00ff', lime: '#00ff00', teal: '#008080', navy: '#000080',
        maroon: '#800000', olive: '#808000', silver: '#c0c0c0', aqua: '#00ffff'
    };
    
    const lowerColor = color.toLowerCase();
    if (colorMap[lowerColor]) return colorMap[lowerColor];
    
    // HEX格式
    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color)) {
        return color.length === 4 ? 
               `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color;
    }
    
    // RGB格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    
    return color;
};

const toHSL = (color) => {
    // 简化的RGB转HSL实现
    const hex = toHex(color).replace('#', '');
    if (hex.length !== 6) return color;
    
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};
// 继续实现颜色转换函数
const toRGB = (color) => {
    if (!color) return '';
    
    // 颜色名称映射
    const colorMap = {
        black: 'rgb(0, 0, 0)', white: 'rgb(255, 255, 255)', red: 'rgb(255, 0, 0)',
        green: 'rgb(0, 128, 0)', blue: 'rgb(0, 0, 255)', yellow: 'rgb(255, 255, 0)',
        purple: 'rgb(128, 0, 128)', orange: 'rgb(255, 165, 0)', pink: 'rgb(255, 192, 203)',
        brown: 'rgb(165, 42, 42)', gray: 'rgb(128, 128, 128)', cyan: 'rgb(0, 255, 255)',
        magenta: 'rgb(255, 0, 255)', lime: 'rgb(0, 255, 0)', teal: 'rgb(0, 128, 128)',
        navy: 'rgb(0, 0, 128)', maroon: 'rgb(128, 0, 0)', olive: 'rgb(128, 128, 0)',
        silver: 'rgb(192, 192, 192)', aqua: 'rgb(0, 255, 255)'
    };
    
    const lowerColor = color.toLowerCase();
    if (colorMap[lowerColor]) return colorMap[lowerColor];
    
    // RGB格式直接返回
    if (/^rgb\(/.test(color)) return color;
    
    // HEX转RGB
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i) ||
                    color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
    
    if (hexMatch) {
        const r = parseInt(hexMatch[1].length === 1 ? hexMatch[1] + hexMatch[1] : hexMatch[1], 16);
        const g = parseInt(hexMatch[2].length === 1 ? hexMatch[2] + hexMatch[2] : hexMatch[2], 16);
        const b = parseInt(hexMatch[3].length === 1 ? hexMatch[3] + hexMatch[3] : hexMatch[3], 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    return color;
};

// Detect 检测函数
const isCollection = (obj) => {
    return obj instanceof NodeList || obj instanceof HTMLCollection;
};

const isDOM = (obj) => {
    return isElement(obj) || isCollection(obj) || 
           obj instanceof DocumentFragment || 
           (obj.nodeType === 3 && obj.tagName); // Text node
};

const isFragment = (obj) => {
    return obj instanceof DocumentFragment;
};

const isNode = (obj) => {
    return obj instanceof Node;
};

const isOverflowElement = (element) => {
    if (!isElement(element)) return false;
    const style = window.getComputedStyle(element);
    return /auto|scroll|overlay|hidden/.test(style.overflow + style.overflowY + style.overflowX);
};

const isShadowRoot = (element) => {
    return element instanceof ShadowRoot;
};

const isTableElement = (element) => {
    return isElement(element) && 
           ['table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'].includes(element.tagName.toLowerCase());
};

const isText = (node) => {
    return node && node.nodeType === 3; // Text node
};

const canPosition = (element) => {
    return isElement(element) && window.getComputedStyle(element).display !== 'none';
};

const contains = (container, element) => {
    if (!isElement(container) || !isElement(element)) return false;
    return container.contains(element);
};

const inDocument = (element) => {
    return isElement(element) && document.documentElement.contains(element);
};

const isContainingBlock = (element) => {
    if (!isElement(element)) return false;
    const style = window.getComputedStyle(element);
    return style.transform !== 'none' || style.perspective !== 'none' || 
           style.willChange === 'transform' || style.willChange === 'perspective';
};

const isLayoutViewport = () => {
    return document.documentElement.clientWidth === window.innerWidth;
};

const isMatched = (element, selector) => {
    return isElement(element) && element.matches(selector);
};

const isScaled = (element) => {
    if (!isElement(element)) return false;
    const rect = element.getBoundingClientRect();
    return Math.round(rect.width) !== element.offsetWidth || 
           Math.round(rect.height) !== element.offsetHeight;
};

const isWindow = (obj) => {
    return obj === window || (obj && obj === obj.window);
};

const has = (elements, selector) => {
    if (isElement(elements)) {
        return isString(selector) ? Array.from(elements.querySelectorAll(selector)) : [];
    } else if (isCollection(elements)) {
        const filtered = Array.from(elements).filter(el => 
            isString(selector) ? el.matches(selector) : selector(el)
        );
        return filtered;
    }
    return [];
};

// DOM Rect 矩形操作
const getBoundingClientRect = (element, includeScale = false, includeVisualViewport = false) => {
    if (!isElement(element)) return null;
    const rect = element.getBoundingClientRect();
    const viewport = window.visualViewport;
    
    let scaleX = 1, scaleY = 1;
    if (includeScale && isElement(element)) {
        scaleX = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;
        scaleY = element.offsetHeight > 0 ? rect.height / element.offsetHeight : 1;
    }
    
    let left = rect.left, top = rect.top;
    if (includeVisualViewport && viewport && !isLayoutViewport()) {
        left += viewport.offsetLeft || 0;
        top += viewport.offsetTop || 0;
    }
    
    return {
        width: rect.width / scaleX,
        height: rect.height / scaleY,
        top: top / scaleY,
        right: (rect.right + (includeVisualViewport && viewport ? viewport.offsetLeft || 0 : 0)) / scaleX,
        bottom: (rect.bottom + (includeVisualViewport && viewport ? viewport.offsetTop || 0 : 0)) / scaleY,
        left: left / scaleX,
        x: left / scaleX,
        y: top / scaleY
    };
};

const getDocumentRect = (element) => {
    const doc = isElement(element) ? element.ownerDocument : document;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const width = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    const height = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
    
    return {
        width,
        height,
        x: -scrollX,
        y: -scrollY
    };
};

const getViewportRect = (element, strategy = 'fixed') => {
    const doc = isElement(element) ? element.ownerDocument : document;
    const visualViewport = window.visualViewport;
    const win = getWindow(element);
    
    let width = doc.documentElement.clientWidth;
    let height = doc.documentElement.clientHeight;
    let x = 0;
    let y = 0;
    
    if (visualViewport) {
        width = visualViewport.width;
        height = visualViewport.height;
        const isFixed = strategy === 'fixed';
        if (!isLayoutViewport() || isFixed && isFixed) {
            x = visualViewport.offsetLeft;
            y = visualViewport.offsetTop;
        }
    }
    
    return {
        width,
        height,
        x,
        y
    };
};

const inBounding = (element, container) => {
    if (!isElement(element) || !isElement(container)) return false;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return elementRect.top >= containerRect.top &&
           elementRect.right <= containerRect.right &&
           elementRect.bottom <= containerRect.bottom &&
           elementRect.left >= containerRect.left;
};

const inViewport = (element) => {
    if (!isElement(element)) return false;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return rect.top >= 0 &&
           rect.left >= 0 &&
           rect.bottom <= viewportHeight &&
           rect.right <= viewportWidth;
};

// DOM Insertion DOM插入操作
const insertAfter = (element, target) => {
    if (!isElement(element) || !isElement(target)) return null;
    if (target.parentNode) {
        target.parentNode.insertBefore(element, target.nextSibling);
        return element;
    }
    return null;
};

const insertBefore = (element, target) => {
    if (!isElement(element) || !isElement(target)) return null;
    if (target.parentNode) {
        target.parentNode.insertBefore(element, target);
        return element;
    }
    return null;
};

const insertHTMLAfterBegin = (element, html, parse = true) => {
    if (!isElement(element) || !isString(html)) return null;
    if (parse) {
        element.insertAdjacentHTML('afterbegin', html);
        return build(html);
    } else {
        element.insertAdjacentText('afterbegin', html);
        return document.createTextNode(html);
    }
};

const insertHTMLAfterEnd = (element, html, parse = true) => {
    if (!isElement(element) || !isString(html)) return null;
    if (parse) {
        element.insertAdjacentHTML('afterend', html);
        return build(html);
    } else {
        element.insertAdjacentText('afterend', html);
        return document.createTextNode(html);
    }
};

const insertHTMLBeforeBegin = (element, html, parse = true) => {
    if (!isElement(element) || !isString(html)) return null;
    if (parse) {
        element.insertAdjacentHTML('beforebegin', html);
        return build(html);
    } else {
        element.insertAdjacentText('beforebegin', html);
        return document.createTextNode(html);
    }
};

const insertHTMLBeforeEnd = (element, html, parse = true) => {
    if (!isElement(element) || !isString(html)) return null;
    if (parse) {
        element.insertAdjacentHTML('beforeend', html);
        return build(html);
    } else {
        element.insertAdjacentText('beforeend', html);
        return document.createTextNode(html);
    }
};

const append = (element, parent) => {
    if (!isElement(parent)) return null;
    
    let content;
    if (isString(element)) {
        content = fragment(element);
    } else if (isElement(element)) {
        content = element;
    } else {
        return null;
    }
    
    if (parent.append) {
        parent.append(content);
    } else {
        parent.appendChild(content);
    }
    return content;
};

const prepend = (element, parent) => {
    if (!isElement(parent)) return null;
    
    let content;
    if (isString(element)) {
        content = fragment(element);
    } else if (isElement(element)) {
        content = element;
    } else {
        return null;
    }
    
    if (parent.prepend) {
        parent.prepend(content);
    } else {
        parent.insertBefore(content, parent.firstChild);
    }
    return content;
};

const after = (element, target) => {
    return insertAfter(element, target);
};

const before = (element, target) => {
    return insertBefore(element, target);
};

const detach = (elements, selector) => {
    const elementList = isString(elements) ? findAll(elements) : 
                       isElement(elements) ? [elements] : 
                       isArray(elements) ? elements : [];
    
    const clones = elementList.map(el => clone(el, true));
    elementList.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    return clones;
};

const empty = (element) => {
    if (!isElement(element)) return false;
    element.innerHTML = '';
    return true;
};

const replace = (newElement, oldElement) => {
    if (!isElement(oldElement)) return null;
    
    let replacement;
    if (isString(newElement)) {
        replacement = build(newElement);
    } else if (isElement(newElement)) {
        replacement = newElement;
    } else {
        return null;
    }
    
    if (oldElement.parentNode) {
        oldElement.parentNode.replaceChild(replacement, oldElement);
        return replacement;
    }
    return null;
};

const replaceAll = (selector, newElement) => {
    const elements = findAll(selector);
    elements.forEach(element => {
        replace(newElement, element);
    });
    return elements;
};

const remove = (element) => {
    if (isString(element)) {
        findAll(element).forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        return true;
    } else if (isElement(element)) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
            return true;
        }
    }
    return false;
};

const unwrap = (elements, selector) => {
    const elementList = isString(elements) ? findAll(elements) : 
                       isElement(elements) ? [elements] : 
                       isArray(elements) ? elements : [];
    
    elementList.forEach(element => {
        const parent = element.parentNode;
        if (parent && (!selector || parent.matches(selector))) {
            const grandParent = parent.parentNode;
            if (grandParent) {
                while (element.firstChild) {
                    grandParent.insertBefore(element.firstChild, parent);
                }
                grandParent.removeChild(parent);
            }
        }
    });
    return elementList;
};

const wrap = (elements, wrapper) => {
    const elementList = isString(elements) ? findAll(elements) : 
                       isElement(elements) ? [elements] : 
                       isArray(elements) ? elements : [];
    
    elementList.forEach((element, index) => {
        let wrapperElement;
        if (isString(wrapper)) {
            wrapperElement = build(wrapper);
        } else if (isFunction(wrapper)) {
            const result = wrapper(element, index);
            wrapperElement = isElement(result) ? result : build(result);
        } else if (isElement(wrapper)) {
            wrapperElement = clone(wrapper, true);
        }
        
        if (wrapperElement) {
            const parent = element.parentNode;
            if (parent) {
                parent.insertBefore(wrapperElement, element);
                wrapperElement.appendChild(element);
            }
        }
    });
    return elementList;
};

// 继续实现DOM插入操作
const wrapAll = (elements, wrapper) => {
    const elementList = isString(elements) ? findAll(elements) : 
                       isElement(elements) ? [elements] : 
                       isArray(elements) ? elements : [];
    
    if (elementList.length === 0) return [];
    
    const firstElement = elementList[0];
    let wrapperElement;
    
    if (isString(wrapper)) {
        wrapperElement = build(wrapper);
    } else if (isFunction(wrapper)) {
        const result = wrapper();
        wrapperElement = isElement(result) ? result : build(result);
    } else if (isElement(wrapper)) {
        wrapperElement = clone(wrapper, true);
    }
    
    if (wrapperElement) {
        const parent = firstElement.parentNode;
        if (parent) {
            // 隐藏包装元素
            wrapperElement.style.display = 'none';
            // 在第一个元素前插入包装元素
            parent.insertBefore(wrapperElement, firstElement);
            
            // 收集所有元素的HTML
            let contentHTML = '';
            elementList.forEach(element => {
                contentHTML += element.outerHTML;
                element.style.display = 'none';
                element.remove();
            });
            
            // 设置包装元素内容并显示
            wrapperElement.innerHTML = contentHTML;
            wrapperElement.style.display = '';
        }
    }
    
    return elementList;
};

const wrapInner = (elements, wrapper) => {
    const elementList = isString(elements) ? findAll(elements) : 
                       isElement(elements) ? [elements] : 
                       isArray(elements) ? elements : [];
    
    elementList.forEach((element, index) => {
        const content = element.innerHTML;
        let wrapperElement;
        
        if (isString(wrapper)) {
            wrapperElement = build(wrapper);
        } else if (isFunction(wrapper)) {
            const result = wrapper(element, index);
            wrapperElement = isElement(result) ? result : build(result);
        } else if (isElement(wrapper)) {
            wrapperElement = clone(wrapper, true);
        }
        
        if (wrapperElement) {
            wrapperElement.innerHTML = content;
            element.innerHTML = wrapperElement.outerHTML;
        }
    });
    
    return elementList;
};

// Position 位置操作
const getOffset = (element) => {
    if (!isElement(element)) return null;
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };
};

const getOffsetLeft = (element) => {
    const offset = getOffset(element);
    return offset ? offset.left : 0;
};

const getOffsetTop = (element) => {
    const offset = getOffset(element);
    return offset ? offset.top : 0;
};

const getPageXY = (element) => {
    const offset = getOffset(element);
    return offset ? { x: offset.left, y: offset.top } : { x: 0, y: 0 };
};

const getPageX = (element) => {
    return getOffsetLeft(element);
};

const getPageY = (element) => {
    return getOffsetTop(element);
};

const getDocumentScrollLeft = (doc = document) => {
    return Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
};

const getDocumentScrollTop = (doc = document) => {
    return Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
};

const getScroll = (win = window) => {
    return {
        top: win.pageYOffset || document.documentElement.scrollTop,
        left: win.pageXOffset || document.documentElement.scrollLeft
    };
};

const getScrollLeft = (win = window) => {
    return win === document ? getDocumentScrollLeft() : 
           typeof win.scrollX !== 'undefined' ? win.scrollX : win.scrollLeft;
};

const getScrollTop = (win = window) => {
    return win === document ? getDocumentScrollTop() : 
           typeof win.scrollY !== 'undefined' ? win.scrollY : win.scrollTop;
};

const getScrollTotal = (element = window) => {
    const getHorizontalScroll = (el) => {
        const scrolls = [];
        let current = el;
        
        while (current && current !== document) {
            if (isElement(current)) {
                const style = window.getComputedStyle(current);
                if (/(auto|scroll)/.test(style.overflow + style.overflowX)) {
                    scrolls.push(getScrollLeft(current));
                }
            }
            current = current.parentNode;
        }
        
        scrolls.push(getScrollLeft(document));
        return scrolls;
    };
    
    const getVerticalScroll = (el) => {
        const scrolls = [];
        let current = el;
        
        while (current && current !== document) {
            if (isElement(current)) {
                const style = window.getComputedStyle(current);
                if (/(auto|scroll)/.test(style.overflow + style.overflowY)) {
                    scrolls.push(getScrollTop(current));
                }
            }
            current = current.parentNode;
        }
        
        scrolls.push(getScrollTop(document));
        return scrolls;
    };
    
    return {
        top: getVerticalScroll(element),
        left: getHorizontalScroll(element)
    };
};

const getScrollTotalLeft = (element = window) => {
    return getScrollTotal(element).left;
};

const getScrollTotalTop = (element = window) => {
    return getScrollTotal(element).top;
};

const offset = (element) => {
    return getOffset(element);
};

const positions = (element) => {
    if (!isElement(element)) return null;
    const offsetPos = getOffset(element);
    const pagePos = getPageXY(element);
    
    return {
        top: offsetPos.top,
        left: offsetPos.left,
        ...pagePos
    };
};

const scrollTo = (element, position, direction = 'vertical', callback = null) => {
    const target = isElement(element) ? element : getEl(element);
    if (!target) return;
    
    const isVertical = direction === 'vertical';
    const currentPos = isVertical ? target.scrollTop : target.scrollLeft;
    const distance = position - currentPos;
    const duration = 300; // ms
    const startTime = performance.now();
    
    const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 缓动函数
        const ease = progress < 0.5 ? 
            2 * progress * progress : 
            -1 + (4 - 2 * progress) * progress;
            
        const newPos = currentPos + distance * ease;
        
        if (isVertical) {
            target.scrollTop = newPos;
        } else {
            target.scrollLeft = newPos;
        }
        
        if (callback) callback(newPos);
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    };
    
    requestAnimationFrame(animateScroll);
};

// Platform Detection 平台检测
const isBrowser = () => {
    return ![typeof window, typeof document].includes('undefined');
};

const isDeno = () => {
    try {
        return typeof Deno !== 'undefined' && Deno.core;
    } catch (e) {
        return false;
    }
};

const isNodeJs = () => {
    return typeof process !== 'undefined' && 
           !!process.versions && 
           !!process.versions.node;
};

const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isWebKit = () => {
    const ua = navigator.userAgent;
    return /KHTML/.test(ua) || !!ua.match(/AppleWebKit\/(\S*)/);
};

const browser = () => {
    const ua = navigator.userAgent;
    let browserInfo = { name: 'unknown', version: 'unknown', major: 0 };
    
    const patterns = [
        { name: 'Opera', pattern: /OPR\/(\d+)/ },
        { name: 'Edge', pattern: /Edg\/(\d+)/ },
        { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
        { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
        { name: 'Safari', pattern: /Version\/(\d+).*Safari/ },
        { name: 'IE', pattern: /MSIE (\d+)/ }
    ];
    
    for (const { name, pattern } of patterns) {
        const match = ua.match(pattern);
        if (match) {
            browserInfo.name = name;
            browserInfo.version = match[1];
            browserInfo.major = parseInt(match[1], 10);
            break;
        }
    }
    
    return browserInfo;
};

const os = () => {
    const ua = navigator.userAgent;
    let osInfo = { name: 'unknown', version: 'unknown' };
    
    const osPatterns = [
        { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
        { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
        { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
        { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
        { name: 'Windows Vista', pattern: /Windows NT 6\.0/ },
        { name: 'Windows XP', pattern: /Windows NT 5\.1/ },
        { name: 'macOS', pattern: /Mac OS X (\d+[._]\d+)/ },
        { name: 'iOS', pattern: /(iPhone|iPad|iPod).*OS (\d+)_(\d+)/ },
        { name: 'Android', pattern: /Android (\d+)/ },
        { name: 'Linux', pattern: /Linux/ }
    ];
    
    for (const { name, pattern } of osPatterns) {
        const match = ua.match(pattern);
        if (match) {
            osInfo.name = name;
            if (match[1]) {
                osInfo.version = match[1].replace('_', '.');
            } else if (match[2] && match[3]) {
                osInfo.version = `${match[2]}.${match[3]}`;
            }
            break;
        }
    }
    
    return osInfo;
};

// Load Resources 资源加载
const injectCSS = (css, media, charset) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    
    if (media) style.media = media;
    if (charset) css = `@charset "${charset}";` + css;
    
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    
    document.head.appendChild(style);
    return style;
};

const loadCSS = (url, media) => {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url + '?random=' + Date.now();
        
        if (media) link.media = media;
        
        link.onload = () => resolve(link);
        link.onerror = reject;
        
        document.head.appendChild(link);
    });
};

const loadScript = (url) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url + '?random=' + Date.now();
        
        script.onload = () => resolve(script);
        script.onerror = reject;
        
        document.body.appendChild(script);
    });
};

const dnsPrefetch = (url) => {
    if (!url) return false;
    const link = document.createElement('link');
    link.rel = 'dns-prefetch preconnect';
    link.href = url;
    document.head.appendChild(link);
    return true;
};

const prefetch = (url) => {
    if (!url) return false;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    return true;
};

const preload = (url, options = {}) => {
    if (!url) return false;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    Object.keys(options).forEach(key => {
        link[key] = options[key];
    });
    
    document.head.appendChild(link);
    return true;
};

// 继续实现剩余函数
// Style 样式操作
const getStyle = (element, property) => {
    if (!isElement(element)) return '';
    const computedStyle = window.getComputedStyle(element);
    return computedStyle[property] || '';
};

const setStyle = (element, property, value) => {
    if (isElement(element)) {
        element.style[property] = value;
        return true;
    }
    return false;
};

const setStyles = (element, styles) => {
    if (!isElement(element) || !isObject(styles)) return false;
    
    Object.keys(styles).forEach(property => {
        element.style[property] = styles[property];
    });
    return true;
};

const getStyles = (element, properties = []) => {
    if (!isElement(element)) return {};
    const computedStyle = window.getComputedStyle(element);
    const result = {};
    
    if (isArray(properties) && properties.length > 0) {
        properties.forEach(property => {
            result[property] = computedStyle[property];
        });
    } else {
        // 获取所有样式属性
        for (let i = 0; i < computedStyle.length; i++) {
            const property = computedStyle[i];
            result[property] = computedStyle[property];
        }
    }
    
    return result;
};

const removeStyle = (element, property) => {
    if (isElement(element)) {
        element.style[property] = '';
        return true;
    }
    return false;
};

const removeStyles = (element, properties = []) => {
    if (!isElement(element)) return false;
    
    if (isArray(properties) && properties.length > 0) {
        properties.forEach(property => {
            element.style[property] = '';
        });
    } else {
        element.style.cssText = '';
    }
    return true;
};

const hide = (element) => {
    if (isElement(element)) {
        const currentDisplay = getStyle(element, 'display');
        if (currentDisplay !== 'none') {
            element.setAttribute('data-original-display', currentDisplay);
            element.style.display = 'none';
        }
        return true;
    }
    return false;
};

const show = (element) => {
    if (isElement(element)) {
        const originalDisplay = element.getAttribute('data-original-display') || 'block';
        element.style.display = originalDisplay;
        element.removeAttribute('data-original-display');
        return true;
    }
    return false;
};

const toggle = (element) => {
    if (!isElement(element)) return false;
    const isHidden = getStyle(element, 'display') === 'none';
    return isHidden ? show(element) : hide(element);
};

const fadeIn = (element, duration = 400, callback = null) => {
    if (!isElement(element)) return;
    
    const startTime = performance.now();
    const originalOpacity = getStyle(element, 'opacity') || '1';
    
    element.style.opacity = '0';
    element.style.display = element.getAttribute('data-original-display') || 'block';
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress.toString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (callback) callback();
        }
    };
    
    requestAnimationFrame(animate);
};

const fadeOut = (element, duration = 400, callback = null) => {
    if (!isElement(element)) return;
    
    const startTime = performance.now();
    const originalOpacity = getStyle(element, 'opacity') || '1';
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = (1 - progress).toString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
            element.style.opacity = originalOpacity;
            if (callback) callback();
        }
    };
    
    requestAnimationFrame(animate);
};

const fadeToggle = (element, duration = 400, callback = null) => {
    if (!isElement(element)) return;
    const isHidden = getStyle(element, 'display') === 'none';
    return isHidden ? fadeIn(element, duration, callback) : fadeOut(element, duration, callback);
};

const slideDown = (element, duration = 400, callback = null) => {
    if (!isElement(element)) return;
    
    const startTime = performance.now();
    const originalHeight = element.scrollHeight;
    const originalDisplay = getStyle(element, 'display');
    
    element.style.overflow = 'hidden';
    element.style.height = '0px';
    element.style.display = originalDisplay === 'none' ? 'block' : originalDisplay;
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.height = (originalHeight * progress) + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.height = '';
            element.style.overflow = '';
            if (callback) callback();
        }
    };
    
    requestAnimationFrame(animate);
};

const slideUp = (element, duration = 400, callback = null) => {
    if (!isElement(element)) return;
    
    const startTime = performance.now();
    const originalHeight = element.scrollHeight;
    
    element.style.overflow = 'hidden';
    element.style.height = originalHeight + 'px';
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.height = (originalHeight * (1 - progress)) + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            if (callback) callback();
        }
    };
    
    requestAnimationFrame(animate);
};

const slideToggle = (element, duration = 400, callback = null) => {
    if (!isElement(element)) return;
    const isHidden = getStyle(element, 'display') === 'none';
    return isHidden ? slideDown(element, duration, callback) : slideUp(element, duration, callback);
};

// Traversal 遍历操作
const next = (element, selector) => {
    if (!isElement(element)) return null;
    let nextElement = element.nextElementSibling;
    
    while (nextElement) {
        if (!selector || nextElement.matches(selector)) {
            return nextElement;
        }
        nextElement = nextElement.nextElementSibling;
    }
    return null;
};

const nextAll = (element, selector) => {
    if (!isElement(element)) return [];
    const result = [];
    let nextElement = element.nextElementSibling;
    
    while (nextElement) {
        if (!selector || nextElement.matches(selector)) {
            result.push(nextElement);
        }
        nextElement = nextElement.nextElementSibling;
    }
    return result;
};

const nextUntil = (element, selector, filter) => {
    if (!isElement(element)) return [];
    const result = [];
    let nextElement = element.nextElementSibling;
    
    while (nextElement && !nextElement.matches(selector)) {
        if (!filter || nextElement.matches(filter)) {
            result.push(nextElement);
        }
        nextElement = nextElement.nextElementSibling;
    }
    return result;
};

const prev = (element, selector) => {
    if (!isElement(element)) return null;
    let prevElement = element.previousElementSibling;
    
    while (prevElement) {
        if (!selector || prevElement.matches(selector)) {
            return prevElement;
        }
        prevElement = prevElement.previousElementSibling;
    }
    return null;
};

const prevAll = (element, selector) => {
    if (!isElement(element)) return [];
    const result = [];
    let prevElement = element.previousElementSibling;
    
    while (prevElement) {
        if (!selector || prevElement.matches(selector)) {
            result.push(prevElement);
        }
        prevElement = prevElement.previousElementSibling;
    }
    return result;
};

const prevUntil = (element, selector, filter) => {
    if (!isElement(element)) return [];
    const result = [];
    let prevElement = element.previousElementSibling;
    
    while (prevElement && !prevElement.matches(selector)) {
        if (!filter || prevElement.matches(filter)) {
            result.push(prevElement);
        }
        prevElement = prevElement.previousElementSibling;
    }
    return result;
};

const siblings = (element, selector) => {
    if (!isElement(element)) return [];
    const result = [];
    let sibling = element.parentNode.firstChild;
    
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== element) {
            if (!selector || sibling.matches(selector)) {
                result.push(sibling);
            }
        }
        sibling = sibling.nextSibling;
    }
    return result;
};

// 观察器函数
const observeIntersections = (container, callback, options = {}) => {
    const containerEl = typeof container === 'string' ? getEl(container) : container;
    const selector = options.selector || '*';
    const intersectionRatio = options.intersectionRatio || 0;
    
    if (!containerEl || !isFunction(callback)) return null;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > intersectionRatio) {
                callback(entry.target, entry);
            }
        });
    }, {
        root: containerEl,
        rootMargin: options.rootMargin || '0px',
        threshold: options.thresholds || [0, 0.1, 0.5, 1]
    });
    
    containerEl.querySelectorAll(selector).forEach(el => {
        observer.observe(el);
    });
    
    return observer;
};

const observeMutations = (element, callback, options = {}) => {
    const target = typeof element === 'string' ? getEl(element) : element;
    if (!target || !isFunction(callback)) return null;
    
    const observer = new MutationObserver((mutations) => {
        callback(mutations, observer);
    });
    
    observer.observe(target, {
        childList: options.childList !== false,
        attributes: options.attributes !== false,
        characterData: options.characterData || false,
        subtree: options.subtree !== false,
        attributeFilter: options.attributeFilter || null,
        attributeOldValue: options.attributeOldValue || false,
        characterDataOldValue: options.characterDataOldValue || false
    });
    
    return observer;
};

const observeResize = (element, callback, options = {}) => {
    const target = typeof element === 'string' ? getEl(element) : element;
    if (!target || !isFunction(callback)) return null;
    
    const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            callback(entry.target, entry.contentRect, entry);
        });
    });
    
    observer.observe(target, options);
    return observer;
};

// 事件处理函数
const on = (element, event, handler, options = {}) => {
    if (!isElement(element) || !isString(event) || !isFunction(handler)) return false;
    
    const events = event.split(' ');
    events.forEach(e => {
        element.addEventListener(e, handler, options);
    });
    
    return true;
};

const off = (element, event, handler, options = {}) => {
    if (!isElement(element) || !isString(event) || !isFunction(handler)) return false;
    
    const events = event.split(' ');
    events.forEach(e => {
        element.removeEventListener(e, handler, options);
    });
    
    return true;
};

const once = (element, event, handler, options = {}) => {
    if (!isElement(element) || !isString(event) || !isFunction(handler)) return false;
    
    const onceHandler = (e) => {
        handler(e);
        off(element, event, onceHandler, options);
    };
    
    return on(element, event, onceHandler, options);
};

const trigger = (element, event, data = {}) => {
    if (!isElement(element) || !isString(event)) return false;
    
    let customEvent;
    if (typeof CustomEvent === 'function') {
        customEvent = new CustomEvent(event, {
            bubbles: true,
            cancelable: true,
            detail: data
        });
    } else {
        customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent(event, true, true, data);
    }
    
    return element.dispatchEvent(customEvent);
};

const delegate = (container, selector, event, handler, options = {}) => {
    const containerEl = typeof container === 'string' ? getEl(container) : container;
    if (!containerEl || !isString(selector) || !isString(event) || !isFunction(handler)) return false;
    
    const delegateHandler = (e) => {
        const target = e.target;
        const matchingElement = target.closest(selector);
        if (matchingElement && containerEl.contains(matchingElement)) {
            handler.call(matchingElement, e, matchingElement);
        }
    };
    
    return on(containerEl, event, delegateHandler, options);
};

// 工具函数
const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const memoize = (func) => {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func.apply(this, args);
        cache.set(key, result);
        return result;
    };
};

// 导出所有函数
const DOM = {
    // 类型检查
    typeCheck, isFunction, isObject, isElement, isString, isArray, isUndefined,
    
    // 属性操作
    hasClass, addClass, replaceClass, removeClass, toggleClass,
    getAttribute, setAttribute, removeAttribute, getAttributes, setAttributes, removeAttributes,
    getValue, setValue, attrs, enable, disable, readonly,
    html, text, val,
    
    // 基础操作
    build, createElement, clone, closest,
    byClass, byId, getEl, first, last, filter, find, findAll, fragment,
    getActiveElement, getAncestorBy, getAncestorByClassName, getAncestorByTagName,
    getChildren, getChildrenBy, getContainingBlock, getDocument,
    getFirstChild, getFirstChildBy, getImages, getHostOrParent,
    getLastChild, getLastChildBy, getNodeName, getOffsetParent,
    getScrollParent, getTagName, getWindow, getVisualViewport,
    index, children, parent, parents,
    
    // 颜色操作
    getColor, randomHexColor, toHex, toHSL, toRGB,
    
    // 检测函数
    isCollection, isDOM, isFragment, isNode, isOverflowElement,
    isShadowRoot, isTableElement, isText, canPosition, contains,
    inDocument, isContainingBlock, isLayoutViewport, isMatched,
    isScaled, isWindow, has,
    
    // DOM矩形操作
    getBoundingClientRect, getDocumentRect, getViewportRect,
    inBounding, inViewport,
    
    // DOM插入操作
    insertAfter, insertBefore, insertHTMLAfterBegin, insertHTMLAfterEnd,
    insertHTMLBeforeBegin, insertHTMLBeforeEnd, append, prepend, after, before,
    detach, empty, replace, replaceAll, remove, unwrap, wrap, wrapAll, wrapInner,
    
    // 位置操作
    getOffset, getOffsetLeft, getOffsetTop, getPageXY, getPageX, getPageY,
    getDocumentScrollLeft, getDocumentScrollTop, getScroll, getScrollLeft,
    getScrollTop, getScrollTotal, getScrollTotalLeft, getScrollTotalTop,
    offset, positions, scrollTo,
    
    // 平台检测
    isBrowser, isDeno, isNodeJs, isMobile, isWebKit, browser, os,
    
    // 资源加载
    injectCSS, loadCSS, loadScript, dnsPrefetch, prefetch, preload,
    
    // 样式操作
    getStyle, setStyle, setStyles, getStyles, removeStyle, removeStyles,
    hide, show, toggle, fadeIn, fadeOut, fadeToggle, slideDown, slideUp, slideToggle,
    
    // 遍历操作
    next, nextAll, nextUntil, prev, prevAll, prevUntil, siblings,
    
    // 观察器
    observeIntersections, observeMutations, observeResize,
    
    // 事件处理
    on, off, once, trigger, delegate,
    
    // 工具函数
    debounce, throttle, memoize
};

export default DOM;



