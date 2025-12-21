// JquanUI@3.1.0.js (Part 1 of 2)
// 版本: 3.1.0
// 一个功能完备的前端UI框架和工具库，集成了骨架屏、懒加载、锚点、表单校验等高级功能

const jqui = {
    version: '3.1.0',

    // ============ 工具方法区域 ============
    util: (function () {
        const isFunction = (fn) => typeof fn === 'function';
        const isObject = (obj) => obj !== null && typeof obj === 'object';
        const isElement = (el) => !!(el && el.nodeType === 1);
        const isString = (str) => typeof str === 'string';
        const isUndefined = (val) => typeof val === 'undefined';

        const getEl = (selector, context = document) => {
            const el = isElement(context) ? context : document;
            return isString(selector) ? el.querySelector(selector) : null;
        };

        const findAll = (selector, context = document) => {
            const el = isElement(context) ? context : document;
            return isString(selector) ? Array.from(el.querySelectorAll(selector)) : [];
        };

        const children = (element, selector) => {
            if (!isElement(element)) return [];
            const childs = Array.from(element.children);
            return selector ? childs.filter(child => child.matches(selector)) : childs;
        };

        const parent = (element, selector) => {
            if (!isElement(element)) return null;
            let p = element.parentElement;
            if (selector) {
                while (p && !p.matches(selector)) p = p.parentElement;
            }
            return p;
        };

        const index = (element) => {
            if (!isElement(element) || !element.parentElement) return -1;
            return Array.from(element.parentElement.children).indexOf(element);
        };

        const hasClass = (element, className) => isElement(element) && element.classList.contains(className);
        const addClass = (element, className) => isElement(element) && element.classList.add(className);
        const removeClass = (element, className) => isElement(element) && element.classList.remove(className);
        const toggleClass = (element, className) => isElement(element) && element.classList.toggle(className);
        const getStyle = (element, property) => isElement(element) ? getComputedStyle(element)[property] : '';
        const setStyle = (element, property, value) => isElement(element) && (element.style[property] = value);
        const getAttribute = (element, attribute) => isElement(element) ? element.getAttribute(attribute) : null;
        const setAttribute = (element, attribute, value) => isElement(element) && element.setAttribute(attribute, value);

        const html = (element, content) => {
            if (!isElement(element)) return '';
            return isUndefined(content) ? element.innerHTML : (element.innerHTML = content, true);
        };

        const on = (element, event, handler, options) => {
            if (!isElement(element) || !isString(event) || !isFunction(handler)) return false;
            element.addEventListener(event, handler, options);
            return true;
        };
        const off = (element, event, handler) => {
            if (!isElement(element) || !isString(event) || !isFunction(handler)) return false;
            element.removeEventListener(event, handler);
            return true;
        };

        const delegate = (container, selector, event, handler) => {
            const containerEl = getEl(container);
            if (!containerEl) return false;
            const delegateHandler = (e) => {
                const target = e.target.closest(selector);
                if (target && containerEl.contains(target)) handler.call(target, e, target);
            };
            on(containerEl, event, delegateHandler);
            return true;
        };

        const debounce = (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => { timeout = null; if (!immediate) func(...args); };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        };

        return {
            isFunction, isObject, isElement, isString, isUndefined,
            getEl, findAll, children, parent, index,
            hasClass, addClass, removeClass, toggleClass, getStyle, setStyle,
            getAttribute, setAttribute, html,
            on, off, delegate,
            debounce,
        };
    })(),

    cookie: (function () {
        const defaultOptions = { path: '/', domain: '', secure: false, sameSite: 'Lax' };
        const encode = encodeURIComponent, decode = decodeURIComponent;
        function serialize(opts = {}) {
            const opt = Object.assign({}, defaultOptions, opts); let str = '';
            if (opt.expires) { const d = opt.expires instanceof Date ? opt.expires : new Date(Date.now() + Number(opt.expires) * 1000); str += `; Expires=${d.toUTCString()}`; }
            if (opt.maxAge != null) str += `; Max-Age=${opt.maxAge}`; if (opt.domain) str += `; Domain=${opt.domain}`; if (opt.path) str += `; Path=${opt.path}`; if (opt.secure) str += "; Secure";
            if (opt.sameSite) str += `; SameSite=${opt.sameSite}`; return str;
        }
        return {
            get(key) { const raw = document.cookie.split('; ').find(row => row.startsWith(`${encode(key)}=`)); return raw ? decode(raw.split('=')[1]) : null; },
            set(key, value, opts = {}) { const v = encode(String(value)) + serialize(opts); document.cookie = `${encode(key)}=${v}`; return this; },
            getAll() { return document.cookie.split('; ').reduce((acc, cur) => { if (!cur) return acc; const [k, ...rest] = cur.split('='); acc[decode(k)] = decode(rest.join('=')); return acc; }, {}); },
            remove(key, opts = {}) { this.set(key, '', Object.assign({}, opts, { maxAge: -1, expires: new Date(0) })); return this; },
            clear() { Object.keys(this.getAll()).forEach(k => this.remove(k, { path: '/' })); return this; }
        };
    })(),

    storage: (function () {
        const subscribers = {};
        const triggerEvent = (key, newValue, oldValue) => { if (subscribers[key]) { subscribers[key].forEach(callback => callback(newValue, oldValue)); } };
        window.addEventListener('storage', (event) => {
            if (event.key && subscribers[event.key]) {
                let newValue = null, oldValue = null;
                try { newValue = event.newValue ? JSON.parse(event.newValue) : null; oldValue = event.oldValue ? JSON.parse(event.oldValue) : null; } catch (e) { newValue = event.newValue; oldValue = event.oldValue; }
                triggerEvent(event.key, newValue, oldValue);
            }
        });
        return {
            set(key, value) { const oldValueStr = localStorage.getItem(key); const oldValue = oldValueStr ? JSON.parse(oldValueStr) : null; localStorage.setItem(key, JSON.stringify(value)); triggerEvent(key, value, oldValue); },
            get(key, defaultValue = null) { const item = localStorage.getItem(key); if (item === null) return defaultValue; try { return JSON.parse(item); } catch (e) { console.error(`jqui.storage.get: Error parsing item "${key}".`, e); return item; } },
            remove(key) { const oldValueStr = localStorage.getItem(key); const oldValue = oldValueStr ? JSON.parse(oldValueStr) : null; localStorage.removeItem(key); triggerEvent(key, null, oldValue); },
            on(key, callback) { if (!subscribers[key]) subscribers[key] = []; subscribers[key].push(callback); return () => { subscribers[key] = subscribers[key].filter(cb => cb !== callback); if (subscribers[key].length === 0) delete subscribers[key]; }; }
        };
    })(),

    msg: (function () {
        let msgIdCounter = 0; const msgInstances = new Map(); const defaultOptions = { timeout: 3000, autoClose: true, showClose: false };
        function createMsgContainer() { let container = document.getElementById('msg-container'); if (!container) { container = document.createElement('div'); container.id = 'msg-container'; Object.assign(container.style, { pointerEvents: 'none', position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: '9999' }); document.body.appendChild(container); } return container; }
        function createMsgElement(id, type, options) { const msgEl = document.createElement('span'); msgEl.className = `px-4 py-2 text-black bg-white rounded-lg shadow-lg relative z-10`; msgEl.style.pointerEvents = 'auto'; const iconPath = `/images/${type}.svg`; const icon = document.createElement('img'); Object.assign(icon, { className: 'w-4 h-4 inline-block mr-2 -mt-0.5', src: iconPath, alt: `${type} icon` }); icon.onerror = () => icon.style.display = 'none'; if (type === 'loading') { icon.classList.add('animate-spin'); } const content = document.createTextNode(options.content); msgEl.appendChild(icon); msgEl.appendChild(content); if (options.showClose) { const closeBtn = document.createElement('button'); Object.assign(closeBtn, { className: 'ml-2 text-lg leading-none font-bold', innerHTML: '&times;' }); closeBtn.onclick = (e) => { e.stopPropagation(); closeMsg(id); }; msgEl.appendChild(closeBtn); } return msgEl; }
        function closeMsg(id) { const msgInstance = msgInstances.get(id); if (!msgInstance) return; const msgEl = msgInstance.element; Object.assign(msgEl.style, { opacity: '0', transform: 'translateY(-10px)' }); setTimeout(() => { if (msgEl.parentNode) msgEl.parentNode.removeChild(msgEl); if (msgInstance.onClose) msgInstance.onClose(); msgInstances.delete(id); }, 300); }
        function show(type, options) { msgIdCounter++; const id = msgIdCounter; const finalOptions = typeof options === 'string' ? { content: options } : { ...defaultOptions, ...options }; if (type === 'loading' && finalOptions.autoClose === undefined) finalOptions.autoClose = false; const container = createMsgContainer(); const msgEl = createMsgElement(id, type, finalOptions); container.appendChild(msgEl); requestAnimationFrame(() => { Object.assign(msgEl.style, { transition: 'all 0.3s ease-out', opacity: '1', transform: 'translateY(0)' }); }); msgInstances.set(id, { element: msgEl, onClose: finalOptions.onClose }); if (finalOptions.autoClose && finalOptions.timeout > 0) { setTimeout(() => closeMsg(id), finalOptions.timeout); } return () => closeMsg(id); }
        return {
            info: (options) => show('info', options), success: (options) => show('success', options),
            warning: (options) => show('warning', options), error: (options) => show('error', options),
            loading: (options) => show('loading', options), close: (closeFn) => { if (typeof closeFn === 'function') closeFn(); }
        };
    })(),

    copy: (function () {
        const copyToClipboard = async (str) => { if (!str) return false; try { await navigator.clipboard.writeText(str); return true; } catch (err) { console.warn('jqui.copy: navigator.clipboard failed, falling back.', err); return new Promise((resolve) => { const el = document.createElement("textarea"); el.value = str; el.style.position = "absolute"; el.style.left = "-9999px"; document.body.appendChild(el); el.select(); const successful = document.execCommand('copy'); document.body.removeChild(el); resolve(successful); }); } };
        return {
            async text(text) { if (typeof text !== 'string' || text.trim() === '') { jqui.msg.warning('复制内容不能为空'); return false; } const success = await copyToClipboard(text.trim()); jqui.msg[success ? 'success' : 'error'](success ? '复制成功' : '复制失败'); return success; },
            async element(target) { let element = typeof target === 'string' ? document.querySelector(target) : target; if (!element) { jqui.msg.error(typeof target === 'string' ? `未找到选择器 "${target}"` : '无效的DOM元素'); return false; } const textToCopy = element.value || element.textContent || element.innerText; if (!textToCopy) { jqui.msg.warning('目标元素没有可复制的内容'); return false; } return await this.text(textToCopy.trim()); },
            initButtons() { document.querySelectorAll('[data-jqui-copy-text]').forEach(el => { el.addEventListener('click', () => this.text(el.getAttribute('data-jqui-copy-text'))); }); document.querySelectorAll('[data-jqui-copy-target]').forEach(el => { el.addEventListener('click', () => this.element(el.getAttribute('data-jqui-copy-target'))); }); }
        };
    })(),

    i18n: (function () {
        let translations = {}; let currentLang = "en"; let config = {};
        function initI18n(userConfig) {
            config = { storageKey: "jqui-language", urlParamKey: "lg", debug: false, ...userConfig, };
            const { languages, defaultLanguage, storageKey, urlParamKey } = config;
            if (!languages || !defaultLanguage) { console.error('[jqui.i18n] `languages` and `defaultLanguage` are required in config.'); return; }
            function determineLanguage() {
                const urlParams = new URLSearchParams(window.location.search); const urlLang = urlParams.get(urlParamKey);
                if (urlLang && languages.includes(urlLang)) { if (config.debug) console.log(`[I18n Debug] Language from URL: ${urlLang}`); jqui.storage.set(storageKey, urlLang); return urlLang; }
                const storedLang = jqui.storage.get(storageKey);
                if (storedLang && languages.includes(storedLang)) { if (config.debug) console.log(`[I18n Debug] Language from storage: ${storedLang}`); return storedLang; }
                const browserLang = navigator.language.split("-")[0];
                if (languages.includes(browserLang)) { if (config.debug) console.log(`[I18n Debug] Language from browser: ${browserLang}`); return browserLang; }
                if (config.debug) console.log(`[I18n Debug] Using default language: ${defaultLanguage}`); return defaultLanguage;
            }
            async function loadTranslations(lang) { if (translations[lang]) return; try { const response = await fetch(`./locales/${lang}.json`); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); translations[lang] = await response.json(); if (config.debug) console.log(`[I18n Debug] Loaded translations for '${lang}'.`); } catch (error) { console.error(`[I18n Error] Could not load translations for '${lang}':`, error); translations[lang] = {}; } }
            async function setLanguage(lang, saveToStorage = true, updateUrl = true) {
                if (!languages.includes(lang)) { console.error(`[I18n Error] Language "${lang}" is not supported.`); return; }
                document.documentElement.lang = lang; document.querySelectorAll('[id^="lang-"]').forEach(btn => jqui.util.removeClass(btn, 'active')); const activeBtn = document.getElementById(`lang-${lang}`); if (activeBtn) jqui.util.addClass(activeBtn, 'active');
                const titleEl = document.querySelector("title"); if (titleEl) { const titleText = titleEl.getAttribute(`data-lang-${lang}`); if (titleText) document.title = titleText; }
                await loadTranslations(lang); document.querySelectorAll("[data-i18n-key]").forEach(el => { const key = el.getAttribute("data-i18n-key"); if (key) el.textContent = t(key); });
                if (saveToStorage) jqui.storage.set(storageKey, lang); if (updateUrl) { const url = new URL(window.location); if (url.searchParams.get(urlParamKey) !== lang) { url.searchParams.set(urlParamKey, lang); window.history.replaceState({}, "", url); } }
                currentLang = lang; window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } })); if (config.debug) console.log(`[I18n Debug] Language set to "${lang}".`);
            }
            document.addEventListener("click", (event) => { if (event.target.id && event.target.id.startsWith("lang-")) { setLanguage(event.target.id.split("-")[1]); } });
            jqui.storage.on(storageKey, (newLang) => { if (newLang && newLang !== currentLang) { if (config.debug) console.log(`[I18n Debug] Language updated from storage: ${newLang}`); setLanguage(newLang, false, false); } });
            setLanguage(determineLanguage());
        }
        function t(key, variables = {}) {
            const lang = document.documentElement.lang || currentLang; let translation = translations[lang]?.[key] || translations[config.defaultLanguage]?.[key] || key;
            if (typeof translation === "object" && variables.count !== undefined) { const rule = new Intl.PluralRules(lang).select(variables.count); translation = translation[rule] || translation.other || key; }
            return translation.replace(/{{(\w+)}}/g, (match, varName) => variables[varName] !== undefined ? variables[varName] : match);
        }
        return { init: initI18n, t };
    })(),

    // ============ UI 组件区域 ============
    components: {},

    use: function (componentName, selector, options) {
        const component = this.components[componentName];
        if (!component) { console.error(`jqui Error: Component "${componentName}" not found.`); return; }
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) { component(element, options); } else { console.error(`jqui Error: Element not found for selector "${selector}".`); }
    },

    autoInit: function () {
        const elementsToInit = document.querySelectorAll('[data-jqui-auto]');
        elementsToInit.forEach(element => {
            const componentName = element.getAttribute('data-jqui-auto');
            if (componentName && this.components[componentName]) {
                try { const optionsString = element.getAttribute('data-jqui-options'); const options = optionsString ? JSON.parse(optionsString) : {}; this.components[componentName](element, options); }
                catch (e) { console.error(`jqui Auto-Init Error: Failed for "${componentName}" on`, element, e); this.components[componentName](element, {}); }
            }
        });
    },

    init: function () {
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => { this.autoInit(); this.copy.initButtons(); jqui.lazyload.init(); jqui.anchor.init(); jqui.validate.init(); }); }
        else { this.autoInit(); this.copy.initButtons(); jqui.lazyload.init(); jqui.anchor.init(); jqui.validate.init(); }
    }
};

// ============ 组件定义区 ============
jqui.components.infiniteScroll = function (container, userOptions = {}) {
    // ... (infiniteScroll 的完整实现与之前版本相同)
    class InfiniteScroll {
        constructor(options) { this.options = { autoScroll: true, speed: 1, visibleItems: 3.5, direction: 'horizontal', gap: 16, pauseOnHover: true, scrollDirection: 'left', ...options }; this.container = typeof this.options.container === 'string' ? jqui.util.getEl(this.options.container) : this.options.container; if (!this.container) throw new Error('Container element not found'); this.init(); }
        init() { if (jqui.util.getStyle(this.container, 'position') === 'static') { this.container.style.position = 'relative'; } this.scrollContainer = this.container.querySelector('ul') || this.container.querySelector('.scroll-content'); if (!this.scrollContainer) { throw new Error('Scroll container (ul or .scroll-content) not found inside the container'); } this.items = [...this.scrollContainer.children]; if (this.items.length === 0) { throw new Error('No items found in scroll container'); } this.applyStyles(); this.scrollPosition = 0; this.isDragging = false; this.startX = 0; this.startY = 0; this.currentTranslate = 0; this.prevTranslate = 0; this.animationId = null; this.setupInfiniteScroll(); this.addEventListeners(); if (this.options.autoScroll) this.startAutoScroll(); this.handleResize(); window.addEventListener('resize', this.handleResize.bind(this)); }
        applyStyles() { Object.assign(this.container.style, { overflow: 'hidden', userSelect: 'none' }); Object.assign(this.scrollContainer.style, { display: 'flex', flexDirection: this.options.direction === 'horizontal' ? 'row' : 'column', gap: `${this.options.gap}px`, transition: 'transform 0.3s ease', willChange: 'transform', touchAction: 'pan-y', padding: '0', margin: '0', listStyle: 'none' }); if (this.items && this.items.length > 0) { const totalGapSize = this.options.gap * (Math.ceil(this.options.visibleItems) - 1); const itemSizePercent = (100 - (totalGapSize / this.container.clientWidth * 100)) / this.options.visibleItems; this.items.forEach(item => { Object.assign(item.style, { flexShrink: '0', flexGrow: '0', width: this.options.direction === 'horizontal' ? `${itemSizePercent}%` : '100%', height: this.options.direction === 'vertical' ? `${itemSizePercent}%` : 'auto', boxSizing: 'border-box' }); }); } }
        setupInfiniteScroll() { const originalItemCount = this.items.length; const minClonesNeeded = Math.max(originalItemCount * 3, Math.ceil(this.options.visibleItems) * 4); while (this.scrollContainer.children.length > originalItemCount) { this.scrollContainer.removeChild(this.scrollContainer.lastChild); } const clones = []; for (let i = 0; i < minClonesNeeded; i++) { clones.push(this.items[i % originalItemCount].cloneNode(true)); } clones.forEach(clone => { this.scrollContainer.appendChild(clone); }); this.allItems = [...this.scrollContainer.children]; }
        addEventListeners() { this.scrollContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false }); this.scrollContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false }); this.scrollContainer.addEventListener('touchend', this.handleTouchEnd.bind(this)); this.scrollContainer.addEventListener('mousedown', this.handleMouseDown.bind(this)); window.addEventListener('mousemove', this.handleMouseMove.bind(this)); window.addEventListener('mouseup', this.handleMouseUp.bind(this)); if (this.options.pauseOnHover) { this.container.addEventListener('mouseenter', this.pauseAutoScroll.bind(this)); this.container.addEventListener('mouseleave', this.resumeAutoScroll.bind(this)); this.container.addEventListener('touchstart', this.pauseAutoScroll.bind(this)); this.container.addEventListener('touchend', this.resumeAutoScroll.bind(this)); } }
        handleResize() { this.applyStyles(); if (this.items && this.items.length > 0) { const firstItem = this.items[0]; const itemSize = this.options.direction === 'horizontal' ? firstItem.offsetWidth + this.options.gap : firstItem.offsetHeight + this.options.gap; this.itemSize = itemSize; this.originalContentSize = itemSize * this.items.length; this.totalContentSize = itemSize * this.allItems.length; } }
        handleTouchStart(e) { this.pauseAutoScroll(); this.isDragging = true; this.startX = e.touches[0].clientX; this.startY = e.touches[0].clientY; this.prevTranslate = this.currentTranslate; cancelAnimationFrame(this.animationId); e.preventDefault(); }
        handleTouchMove(e) { if (!this.isDragging) return; const currentX = e.touches[0].clientX; const currentY = e.touches[0].clientY; const diffX = currentX - this.startX; const diffY = currentY - this.startY; if (this.options.direction === 'horizontal') { this.currentTranslate = this.prevTranslate + diffX; } else { this.currentTranslate = this.prevTranslate + diffY; } this.applyTransform(); e.preventDefault(); }
        handleTouchEnd() { this.isDragging = false; this.snapToItem(); this.resumeAutoScroll(); }
        handleMouseDown(e) { this.pauseAutoScroll(); this.isDragging = true; this.startX = e.clientX; this.startY = e.clientY; this.prevTranslate = this.currentTranslate; cancelAnimationFrame(this.animationId); e.preventDefault(); }
        handleMouseMove(e) { if (!this.isDragging) return; const currentX = e.clientX; const currentY = e.clientY; const diffX = currentX - this.startX; const diffY = currentY - this.startY; if (this.options.direction === 'horizontal') { this.currentTranslate = this.prevTranslate + diffX; } else { this.currentTranslate = this.prevTranslate + diffY; } this.applyTransform(); }
        handleMouseUp() { this.isDragging = false; this.snapToItem(); this.resumeAutoScroll(); }
        applyTransform() { const transform = this.options.direction === 'horizontal' ? `translateX(${this.currentTranslate}px)` : `translateY(${this.currentTranslate}px)`; this.scrollContainer.style.transform = transform; }
        snapToItem() { if (!this.itemSize || !this.originalContentSize) return; const normalizedTranslate = ((this.currentTranslate % this.originalContentSize) + this.originalContentSize) % this.originalContentSize; let snapPosition = Math.round(normalizedTranslate / this.itemSize) * this.itemSize; this.currentTranslate = snapPosition; this.scrollContainer.style.transition = 'transform 0.3s ease'; this.applyTransform(); setTimeout(() => { this.scrollContainer.style.transition = ''; }, 300); }
        checkAndResetPosition() { if (!this.originalContentSize || !this.totalContentSize) return; const buffer = this.originalContentSize; if (this.scrollPosition <= -this.totalContentSize + buffer) { this.scrollPosition += this.originalContentSize; } else if (this.scrollPosition >= buffer) { this.scrollPosition -= this.originalContentSize; } }
        startAutoScroll() { if (!this.options.autoScroll || this.autoScrollPaused) return; const speed = 0.5 * this.options.speed; const scrollStep = this.options.scrollDirection === 'left' ? -speed : speed; this.autoScrollAnimationId = requestAnimationFrame(() => { this.scrollPosition += scrollStep; this.checkAndResetPosition(); if (this.options.direction === 'horizontal') { this.scrollContainer.style.transform = `translateX(${this.scrollPosition}px)`; } else { this.scrollContainer.style.transform = `translateY(${this.scrollPosition}px)`; } this.startAutoScroll(); }); }
        pauseAutoScroll() { this.autoScrollPaused = true; cancelAnimationFrame(this.autoScrollAnimationId); }
        resumeAutoScroll() { if (!this.options.autoScroll) return; this.autoScrollPaused = false; this.startAutoScroll(); }
        setSpeed(speed) { this.options.speed = Math.min(Math.max(speed, 1), 10); }
        toggleAutoScroll(enable) { this.options.autoScroll = enable; if (enable) { this.autoScrollPaused = false; this.startAutoScroll(); } else { this.pauseAutoScroll(); } }
        setVisibleItems(count) { this.options.visibleItems = count; this.handleResize(); }
        destroy() { cancelAnimationFrame(this.autoScrollAnimationId); cancelAnimationFrame(this.animationId); window.removeEventListener('resize', this.handleResize.bind(this)); }
    }
    new InfiniteScroll({ container, ...userOptions });
};

// ============ 新增组件 ============
jqui.skeleton = (function () {
    const skeletonClass = 'jqui-skeleton';
    const activeClass = 'is-active';
    function show(container, options = {}) {
        const target = typeof container === 'string' ? jqui.util.getEl(container) : container;
        if (!target) return;
        target.classList.add(skeletonClass, activeClass);
        if (options.overlay) {
            const overlay = document.createElement('div'); overlay.className = `${skeletonClass}__overlay`; target.appendChild(overlay);
        }
    }
    function hide(container) {
        const target = typeof container === 'string' ? jqui.util.getEl(container) : container;
        if (!target) return;
        target.classList.remove(skeletonClass, activeClass);
        const overlay = target.querySelector(`.${skeletonClass}__overlay`); if (overlay) overlay.remove();
    }
    function autoInit() {
        const elements = jqui.util.findAll(`[data-jqui-skeleton="${activeClass}"]`);
        if (elements.length === 0) return;
        elements.forEach(el => show(el));
        window.addEventListener('load', () => { setTimeout(() => { elements.forEach(el => hide(el)); }, 300); });
    }
    return { show, hide, autoInit };
})();

jqui.lazyload = (function () {
    let observer;
    const loadedClass = 'is-loaded';
    const errorClass = 'is-error';
    function onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.dataset.lazySrc) { loadImage(el); }
                if (el.dataset.lazyBg) { loadBg(el); }
                if (el.dataset.lazyPicture) { loadPicture(el); }
                observer.unobserve(el);
            }
        });
    }
    function loadImage(img) {
        const src = img.dataset.lazySrc;
        const errorSrc = img.dataset.lazyError;
        const newImg = new Image();
        newImg.onload = () => {
            img.src = src;
            jqui.util.addClass(img, loadedClass);
            img.style.opacity = '0';
            setTimeout(() => { img.style.transition = 'opacity 0.3s'; img.style.opacity = '1'; }, 10);
        };
        newImg.onerror = () => { if (errorSrc) img.src = errorSrc; jqui.util.addClass(img, errorClass); };
        newImg.src = src;
    }
    function loadBg(el) {
        const bg = el.dataset.lazyBg;
        const errorSrc = el.dataset.lazyError;
        const newImg = new Image();
        newImg.onload = () => { el.style.backgroundImage = `url(${bg})`; jqui.util.addClass(el, loadedClass); };
        newImg.onerror = () => { if (errorSrc) el.style.backgroundImage = `url(${errorSrc})`; jqui.util.addClass(el, errorClass); };
        newImg.src = bg;
    }
    function loadPicture(picture) {
        const sources = picture.querySelectorAll('source[data-lazy-srcset]');
        sources.forEach(source => { source.srcset = source.dataset.lazySrcset; });
        const img = picture.querySelector('img[data-lazy-src]');
        if (img) loadImage(img);
    }
    function init() {
        if (!('IntersectionObserver' in window)) return;
        observer = new IntersectionObserver(onIntersection);
        jqui.util.findAll('[data-lazy-src], [data-lazy-bg], [data-lazy-picture]').forEach(el => observer.observe(el));
    }
    function observe(el) { if (observer && el) observer.observe(el); }
    function unobserve(el) { if (observer && el) observer.unobserve(el); }
    return { init, observe, unobserve };
})();

jqui.anchor = (function () {
    let navLinks, sections, observer, options;
    const activeClass = 'is-active';
    const defaultOptions = { selector: '[data-anchor]', offset: 0, smooth: true, rootMargin: '-20% 0px -70% 0px' };
    function updateActiveLink() {
        let currentSectionId = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= options.offset && rect.bottom > options.offset) {
                currentSectionId = section.id;
            }
        });
        navLinks.forEach(link => {
            jqui.util.toggleClass(link, activeClass, link.getAttribute('href') === `#${currentSectionId}` || link.dataset.anchorTarget === currentSectionId);
        });
    }
    function onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    jqui.util.toggleClass(link, activeClass, link.getAttribute('href') === `#${id}` || link.dataset.anchorTarget === id);
                });
            }
        });
    }
    function handleClick(e) {
        const link = e.target.closest(options.selector);
        if (!link) return;
        const targetId = link.getAttribute('href')?.slice(1) || link.dataset.anchorTarget;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - options.offset;
        if (options.smooth) {
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
        } else {
            window.scrollTo(0, targetTop);
        }
        e.preventDefault();
    }
    function init(userOptions = {}) {
        options = { ...defaultOptions, ...userOptions };
        navLinks = jqui.util.findAll(options.selector);
        sections = jqui.util.findAll(navLinks.map(link => link.getAttribute('href')?.slice(1) || link.dataset.anchorTarget).filter(Boolean).map(id => `#${id}`).join(','));
        if (!navLinks.length || !sections.length) return;

        document.addEventListener('click', handleClick);

        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(onIntersection, { rootMargin: options.rootMargin });
            sections.forEach(section => observer.observe(section));
        } else {
            window.addEventListener('scroll', jqui.util.debounce(updateActiveLink, 50));
            updateActiveLink();
        }
    }
    return { init };
})();

jqui.validate = (function () {
    const rules = {
        required: (val) => !!val,
        email: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        tel: (val) => !val || /^1[3-9]\d{9}$/.test(val),
        idcard: (val) => !val || /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val),
        minlength: (val, min) => !val || val.length >= parseInt(min, 10),
        maxlength: (val, max) => !val || val.length <= parseInt(max, 10),
        min: (val, min) => !val || parseFloat(val) >= parseFloat(min),
        max: (val, max) => !val || parseFloat(val) <= parseFloat(max),
        pattern: (val, pattern) => !val || new RegExp(pattern).test(val),
    };
    function validateField(field) {
        const fieldName = field.getAttribute('name') || field.id;
        const value = field.value.trim();
        let isValid = true; let errorMessage = '';

        for (const key in rules) {
            const ruleValue = field.getAttribute(`data-rule-${key}`);
            if (ruleValue !== null) {
                const rule = rules[key];
                const valid = rule(value, ruleValue);
                if (!valid) {
                    isValid = false;
                    errorMessage = field.dataset.validateMsg || `${fieldName} is not valid.`;
                    jqui.util.setAttribute(field, 'data-verify', 'danger');
                    jqui.msg.error(errorMessage);
                    break;
                }
            }
        }

        if (isValid) {
            jqui.util.setAttribute(field, 'data-verify', 'success');
        }
        return isValid;
    }
    function validateForm(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;
        fields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }
    function init(context = document) {
        const fields = context.querySelectorAll('input[data-rule], textarea[data-rule], select[data-rule]');
        fields.forEach(field => {
            jqui.util.on(field, 'blur', () => validateField(field));
            jqui.util.on(field, 'input', jqui.util.debounce(() => validateField(field), 300));
        });
        const forms = context.querySelectorAll('form');
        forms.forEach(form => {
            jqui.util.on(form, 'submit', (e) => {
                if (!validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }
    return { init, validateField, validateForm };
})();


// JquanUI@3.1.0.js (Part 2 of 2)
// 此部分代码需追加到Part 1之后

jqui.components.tabs = function (container, options = {}) {
    class Tabs {
        constructor(element, options = {}) {
            this.container = element;
            if (!this.container) {
                console.error("Tabs component: Container element not found.");
                return;
            }
            this.options = { trigger: 'click', initialActiveIndex: 0, ...options };
            this.tabTriggers = this.container.querySelectorAll('[data-tab-trigger]');
            this.tabContents = this.container.querySelectorAll('[data-tab-content]');
            if (this.tabTriggers.length === 0 || this.tabContents.length === 0) {
                console.error("Tabs component: Tab triggers or contents not found.");
                return;
            }
            this.init();
        }

        init() {
            this.tabTriggers.forEach((trigger, index) => {
                trigger.addEventListener(this.options.trigger, () => this.activateTab(index));
            });
            this.activateTab(this.options.initialActiveIndex);
        }

        activateTab(index) {
            if (index < 0 || index >= this.tabTriggers.length) return;
            this.tabTriggers.forEach(t => jqui.util.removeClass(t, 'is-active'));
            this.tabContents.forEach(c => c.style.display = 'none');
            jqui.util.addClass(this.tabTriggers[index], 'is-active');
            this.tabContents[index].style.display = 'block';
            this.container.dispatchEvent(new CustomEvent('tabActivated', { detail: { index, trigger: this.tabTriggers[index], content: this.tabContents[index] } }));
        }
    }
    new Tabs(container, options);
};

jqui.components.accordion = function (container, userOptions = {}) {
    class Accordion {
        constructor(element, options = {}) {
            this.element = element;
            this.options = { itemSelector: '.accordion-item', triggerSelector: '.accordion-trigger', contentSelector: '.accordion-content', allowMultiple: false, openOnInit: [], ...options };
            this.items = this.element.querySelectorAll(this.options.itemSelector);
            this.init();
        }

        init() {
            this.items.forEach((item, index) => {
                const trigger = item.querySelector(this.options.triggerSelector);
                const content = item.querySelector(this.options.contentSelector);
                if (trigger && content) {
                    trigger.addEventListener('click', (e) => this.toggleItem(item, trigger, content, e));
                    const isOpen = this.options.openOnInit.includes(index) || item.classList.contains('is-open');
                    if (isOpen) { this.openItem(item, trigger, content, false); } else { this.closeItem(item, trigger, content, false); }
                }
            });
        }

        toggleItem(item, trigger, content, event) {
            const isOpen = jqui.util.hasClass(item, 'is-open');
            if (isOpen) { this.closeItem(item, trigger, content); }
            else {
                if (!this.options.allowMultiple) { this.closeAllItems(); }
                this.openItem(item, trigger, content);
            }
            event && event.preventDefault();
        }

        openItem(item, trigger, content, dispatch = true) {
            jqui.util.addClass(item, 'is-open');
            trigger.setAttribute('aria-expanded', 'true');
            content.style.maxHeight = content.scrollHeight + "px";
            if (dispatch) this.element.dispatchEvent(new CustomEvent('accordionItemOpened', { detail: { item, trigger, content } }));
        }

        closeItem(item, trigger, content, dispatch = true) {
            jqui.util.removeClass(item, 'is-open');
            trigger.setAttribute('aria-expanded', 'false');
            content.style.maxHeight = null;
            if (dispatch) this.element.dispatchEvent(new CustomEvent('accordionItemClosed', { detail: { item, trigger, content } }));
        }

        closeAllItems() {
            this.items.forEach(item => {
                const trigger = item.querySelector(this.options.triggerSelector);
                const content = item.querySelector(this.options.contentSelector);
                if (trigger && content) this.closeItem(item, trigger, content, false);
            });
        }
    }
    new Accordion(container, userOptions);
};

jqui.initAccordion = function () {
    const accordionElements = jqui.util.findAll(`[data-jqui-auto="accordion"]:not([data-accordion-initialized])`);
    accordionElements.forEach(el => { jqui.components.accordion(el); el.setAttribute('data-accordion-initialized', 'true'); });
};

jqui.drawerManager = (function () {
    const state = { openDrawerId: null, lastFocusedTrigger: null, options: {} };
    const defaultOptions = { position: 'right', disableMask: false, bodyLock: true, closeOnEscape: true, animationDuration: 300 };
    const mask = document.createElement('div'); mask.dataset.drawerMask = ''; document.body.appendChild(mask);

    function setDrawerStyles(drawer, position) {
        const styles = { top: 0, bottom: 0, width: '320px', height: '100%', background: 'white', boxShadow: '0 0 15px rgba(0,0,0,0.1)', zIndex: 999, transition: `transform ${defaultOptions.animationDuration}ms ease-in-out` };
        if (position === 'left') { Object.assign(styles, { left: 0, transform: 'translateX(-100%)' }); }
        else if (position === 'right') { Object.assign(styles, { right: 0, transform: 'translateX(100%)' }); }
        else if (position === 'top') { Object.assign(styles, { left: 0, width: '100%', height: '320px', transform: 'translateY(-100%)' }); }
        else if (position === 'bottom') { Object.assign(styles, { left: 0, bottom: 0, width: '100%', height: '320px', transform: 'translateY(100%)' }); }
        Object.assign(drawer.style, styles);
    }

    function getDrawerOptions(triggerEl) {
        const drawerId = triggerEl.dataset.drawerTarget;
        let options = state.options[drawerId];
        if (!options) {
            options = { ...defaultOptions };
            const dataAttrs = ['position', 'disableMask', 'bodyLock', 'closeOnEscape'];
            dataAttrs.forEach(attr => { if (triggerEl.dataset[`drawer${attr.charAt(0).toUpperCase() + attr.slice(1)}`] !== undefined) { options[attr] = triggerEl.dataset[`drawer${attr.charAt(0).toUpperCase() + attr.slice(1)}`] === 'true' || triggerEl.dataset[`drawer${attr.charAt(0).toUpperCase() + attr.slice(1)}`]; } else if (attr !== 'position' && triggerEl.dataset[`drawer${attr.charAt(0).toUpperCase() + attr.slice(1)}`] !== undefined) { options[attr] = triggerEl.dataset[`drawer${attr.charAt(0).toUpperCase() + attr.slice(1)}`]; } });
            state.options[drawerId] = options;
        }
        return options;
    }

    function openDrawer(drawerId, triggerEl) {
        const drawer = document.getElementById(drawerId);
        if (!drawer) { console.error(`Drawer with id "${drawerId}" not found.`); return; }
        const options = getDrawerOptions(triggerEl);
        if (state.openDrawerId && state.openDrawerId !== drawerId) closeDrawer(false);
        state.openDrawerId = drawerId; state.lastFocusedTrigger = triggerEl;
        drawer.setAttribute('aria-hidden', 'false'); drawer.classList.add('is-open');
        if (!options.disableMask) { jqui.util.addClass(mask, 'is-open'); }
        if (options.bodyLock) { document.body.style.overflow = 'hidden'; }
        requestAnimationFrame(() => {
            setDrawerStyles(drawer, options.position);
            const translateProp = options.position === 'left' || options.position === 'right' ? 'translateX' : 'translateY';
            const translateValue = '0%';
            drawer.style.transform = `${translateProp}(${translateValue})`;
        });
        const focusableElement = drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) setTimeout(() => focusableElement.focus(), 100);
        drawer.dispatchEvent(new CustomEvent('drawer:opened', { detail: { drawerId, triggerEl } }));
    }

    function closeDrawer(restoreFocus = true) {
        if (!state.openDrawerId) return;
        const drawer = document.getElementById(state.openDrawerId);
        if (!drawer) return;
        const triggerEl = document.querySelector(`[data-drawer-target="${state.openDrawerId}"]`);
        const options = triggerEl ? getDrawerOptions(triggerEl) : defaultOptions;

        drawer.classList.remove('is-open');
        const translateProp = options.position === 'left' || options.position === 'right' ? 'translateX' : 'translateY';
        const translateValue = options.position === 'left' || options.position === 'top' ? '-100%' : '100%';
        drawer.style.transform = `${translateProp}(${translateValue})`;

        setTimeout(() => {
            drawer.setAttribute('aria-hidden', 'true');
            jqui.util.removeClass(mask, 'is-open');
            if (options.bodyLock) { document.body.style.overflow = ''; }
            drawer.dispatchEvent(new CustomEvent('drawer:closed', { detail: { drawerId: state.openDrawerId } }));
        }, options.animationDuration);

        if (restoreFocus && state.lastFocusedTrigger) { state.lastFocusedTrigger.focus(); }
        state.openDrawerId = null; state.lastFocusedTrigger = null;
    }

    function handleTriggerClick(event) { const trigger = event.target.closest('[data-drawer-target]'); if (trigger) { const drawerId = trigger.dataset.drawerTarget; if (state.openDrawerId === drawerId) closeDrawer(); else openDrawer(drawerId, trigger); } }

    function initDrawers() {
        document.querySelectorAll('[id]').forEach(el => { const trigger = document.querySelector(`[data-drawer-target="${el.id}"]`); if (trigger) { const options = getDrawerOptions(trigger); setDrawerStyles(el, options.position); el.setAttribute('aria-hidden', 'true'); } });
        document.addEventListener('click', handleTriggerClick, true);
        mask.addEventListener('click', () => { if (state.openDrawerId && !getDrawerOptions(document.querySelector(`[data-drawer-target="${state.openDrawerId}"]`)).disableMask) closeDrawer(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.openDrawerId && getDrawerOptions(document.querySelector(`[data-drawer-target="${state.openDrawerId}"]`)).closeOnEscape) closeDrawer(); });
    }

    return { open: openDrawer, close: closeDrawer, initDrawers };
})();

jqui.modal = (function () {
    const DEFAULT_OPTIONS = { type: 'alert', title: '提示', content: '', showCloseButton: true, closeOnBackdropClick: true, confirmText: '确认', cancelText: '取消', onConfirm: null, onCancel: null };
    let modalElement = null, backdropElement = null, currentResolve = null, activeInstance = null;

    function createElement(tag, classes = '', attributes = {}) { const el = document.createElement(tag); if (classes) el.className = classes; Object.keys(attributes).forEach(key => el.setAttribute(key, attributes[key])); return el; }

    class ModalInstance {
        constructor(options) { this.options = { ...DEFAULT_OPTIONS, ...options }; this.id = `modal-${Date.now()}`; }
        open() { return new Promise((resolve) => { if (activeInstance) activeInstance.close(false); activeInstance = this; currentResolve = resolve; this.createModal(); this.bindEvents(); document.body.appendChild(this.modalFragment); requestAnimationFrame(() => this.animateIn()); }); }
        close(resolved = true) { if (!this.modalElement || this.modalElement.parentNode !== document.body) return; this.animateOut(); setTimeout(() => { if (this.modalElement.parentNode) this.modalFragment.remove(); activeInstance = null; if (currentResolve) { currentResolve(resolved); currentResolve = null; } }, 300); }
        createModal() {
            this.modalElement = createElement('div', `jqui-modal-overlay ${this.options.type}`);
            this.backdropElement = createElement('div', 'jqui-modal-backdrop');
            this.modalBody = createElement('div', 'jqui-modal-body');
            const header = createElement('header', 'jqui-modal-header');
            const title = createElement('h2', 'jqui-modal-title'); title.textContent = this.options.title;
            header.appendChild(title);
            if (this.options.showCloseButton) { const closeBtn = createElement('button', 'jqui-modal-close', { type: 'button' }); closeBtn.innerHTML = '&times;'; closeBtn.addEventListener('click', () => this.close(false)); header.appendChild(closeBtn); }
            this.modalBody.appendChild(header);
            const content = createElement('div', 'jqui-modal-content'); content.innerHTML = this.options.content; this.modalBody.appendChild(content);
            if (this.options.type === 'confirm') { const footer = createElement('footer', 'jqui-modal-footer'); const cancelBtn = createElement('button', 'jqui-btn jqui-btn-secondary', { type: 'button' }); cancelBtn.textContent = this.options.cancelText; cancelBtn.addEventListener('click', () => this.close(false)); const confirmBtn = createElement('button', 'jqui-btn jqui-btn-primary', { type: 'button' }); confirmBtn.textContent = this.options.confirmText; confirmBtn.addEventListener('click', () => this.close(true)); footer.appendChild(cancelBtn); footer.appendChild(confirmBtn); this.modalBody.appendChild(footer); }
            else if (this.options.type === 'alert') { const footer = createElement('footer', 'jqui-modal-footer'); const confirmBtn = createElement('button', 'jqui-btn jqui-btn-primary', { type: 'button' }); confirmBtn.textContent = this.options.confirmText; confirmBtn.addEventListener('click', () => this.close(true)); footer.appendChild(confirmBtn); this.modalBody.appendChild(footer); }
            this.modalElement.appendChild(this.backdropElement); this.modalElement.appendChild(this.modalBody);
            this.modalFragment = document.createDocumentFragment(); this.modalFragment.appendChild(this.modalElement);
        }
        bindEvents() { if (this.options.closeOnBackdropClick) { this.backdropElement.addEventListener('click', () => this.close(false)); } }
        animateIn() { this.modalElement.style.opacity = '1'; this.modalBody.style.transform = 'scale(1)'; }
        animateOut() { this.modalElement.style.opacity = '0'; this.modalBody.style.transform = 'scale(0.9)'; }
    }

    const api = { alert: (content, title) => new ModalInstance({ type: 'alert', content, title }).open(), confirm: (content, title) => new ModalInstance({ type: 'confirm', content, title }).open() };
    return api;
})();


jqui.components.carousel = function (container, userOptions = {}) {
    class Carousel {
        constructor(options) {
            this.config = { container: '.carousel', slides: '.carousel-slide', controls: '.carousel-control', indicators: '.carousel-indicator', autoplay: true, interval: 5000, pauseOnHover: true, ...options };
            this.container = jqui.util.getEl(this.config.container);
            if (!this.container) return;
            this.init();
        }

        init() {
            this.slides = this.container.querySelectorAll(this.config.slides);
            if (this.slides.length === 0) return;
            this.currentIndex = 0; this.isPlaying = this.config.autoplay; this.intervalId = null;
            this.setupIndicators(); this.setupControls(); this.addEventListeners(); this.showSlide(0); if (this.isPlaying) this.startAutoplay();
        }

        setupIndicators() {
            const indicatorsContainer = this.container.querySelector(this.config.indicators);
            if (indicatorsContainer) { indicatorsContainer.innerHTML = ''; this.slides.forEach((_, i) => { const btn = document.createElement('button'); jqui.util.addClass(btn, i === 0 ? 'is-active' : ''); btn.addEventListener('click', () => this.goToSlide(i)); indicatorsContainer.appendChild(btn); }); this.indicatorButtons = indicatorsContainer.querySelectorAll('button'); }
        }

        setupControls() {
            this.controls = { prev: this.container.querySelector(`${this.config.controls}.prev`), next: this.container.querySelector(`${this.config.controls}.next`) };
            if (this.controls.prev) this.controls.prev.addEventListener('click', () => this.prevSlide());
            if (this.controls.next) this.controls.next.addEventListener('click', () => this.nextSlide());
        }

        addEventListeners() {
            if (this.config.pauseOnHover) { this.container.addEventListener('mouseenter', () => this.pauseAutoplay()); this.container.addEventListener('mouseleave', () => this.resumeAutoplay()); }
            document.addEventListener('visibilitychange', () => { document.hidden ? this.pauseAutoplay() : this.resumeAutoplay(); });
        }

        showSlide(index) {
            this.slides.forEach((slide, i) => { jqui.util.toggleClass(slide, 'is-active', i === index); });
            if (this.indicatorButtons) { this.indicatorButtons.forEach((btn, i) => { jqui.util.toggleClass(btn, 'is-active', i === index); }); }
            this.currentIndex = index; this.container.dispatchEvent(new CustomEvent('carouselSlideChange', { detail: { index, slide: this.slides[index] } }));
        }

        nextSlide() { this.goToSlide((this.currentIndex + 1) % this.slides.length); }
        prevSlide() { this.goToSlide((this.currentIndex - 1 + this.slides.length) % this.slides.length); }
        goToSlide(index) { if (index >= 0 && index < this.slides.length) this.showSlide(index); }

        startAutoplay() { this.isPlaying = true; this.intervalId = setInterval(() => this.nextSlide(), this.config.interval); }
        pauseAutoplay() { this.isPlaying = false; clearInterval(this.intervalId); }
        resumeAutoplay() { if (!this.isPlaying && this.config.autoplay) this.startAutoplay(); }
    }
    new Carousel({ container, ...userOptions });
};

jqui.theme = (function () {
    const STORAGE_KEY = 'jqui-theme'; const THEME_CLASS_PREFIX = 'theme-'; const DARK_MODE_CLASS = 'theme-dark';
    function initTheme(options) {
        if (!options || !options.el) return null; const { el, defaultTheme = 'theme-indigo' } = options; const container = jqui.util.getEl(el); if (!container) return null;
        const applyTheme = (themeName) => { const body = document.body; jqui.util.findAll(`body .${THEME_CLASS_PREFIX}`).forEach(cls => jqui.util.removeClass(body, cls)); if (themeName) jqui.util.addClass(body, themeName); };
        const setLuminance = (mode) => { const body = document.body; if (mode === 'dark') jqui.util.addClass(body, DARK_MODE_CLASS); else jqui.util.removeClass(body, DARK_MODE_CLASS); };
        const loadTheme = () => { applyTheme(jqui.storage.get(STORAGE_KEY, defaultTheme)); setLuminance(jqui.storage.get(`${STORAGE_KEY}-luminance`, 'light')); };
        const setTheme = (themeName) => { jqui.storage.set(STORAGE_KEY, themeName); applyTheme(themeName); };
        const setLuminanceAndSave = (mode) => { jqui.storage.set(`${STORAGE_KEY}-luminance`, mode); setLuminance(mode); };
        const handleThemeButtonClick = (e) => { const button = e.target.closest('[data-theme]'); if (button) setTheme(jqui.util.getAttribute(button, 'data-theme')); };
        const handleLuminanceButtonClick = (e) => { const button = e.target.closest('[data-luminance]'); if (button) setLuminanceAndSave(jqui.util.getAttribute(button, 'data-luminance')); };
        jqui.util.on(container, 'click', handleThemeButtonClick); jqui.util.delegate(document.body, '[data-luminance]', 'click', handleLuminanceButtonClick); loadTheme();
        return { setTheme, setLuminance: setLuminanceAndSave };
    }
    return { init: initTheme };
})();

jqui.iframeThemeListener = (function () {
    const STORAGE_KEY = 'jqui-theme';
    function onThemeChange(callback, options = {}) { if (typeof callback !== 'function') return () => { }; const { defaultTheme = 'theme-indigo' } = options; const handleStorageChange = () => { const theme = jqui.storage.get(STORAGE_KEY, defaultTheme); const luminance = jqui.storage.get(`${STORAGE_KEY}-luminance`, 'light'); callback({ theme, luminance }); }; handleStorageChange(); const unsubscribeTheme = jqui.storage.on(STORAGE_KEY, handleStorageChange); const unsubscribeLuminance = jqui.storage.on(`${STORAGE_KEY}-luminance`, handleStorageChange); return () => { unsubscribeTheme(); unsubscribeLuminance(); }; }
    return { onThemeChange };
})();

jqui.codeHighlighter = (function () {
    let hljs = null, isHljsLoading = false, loadHljsPromise = null;
    async function getHljs() { if (hljs) return hljs; if (isHljsLoading) return loadHljsPromise; isHljsLoading = true; loadHljsPromise = import('https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/highlight.min.js').then(module => { hljs = module.default; return hljs; }); return loadHljsPromise; }
    const DEFAULT_CONFIG = { codeBlockSelector: 'pre code.jqui-code-block' };
    async function init(userConfig = {}) { const config = { ...DEFAULT_CONFIG, ...userConfig }; const codeBlocks = jqui.util.findAll(config.codeBlockSelector); if (codeBlocks.length === 0) return; const hljsModule = await getHljs(); codeBlocks.forEach(block => { const preElement = block.closest('pre'); if (!preElement) return; const originalCode = jqui.util.html(block).trim(); if (!originalCode) return; let language = jqui.util.getAttribute(block, 'data-language') || 'plaintext'; if (language && !hljsModule.getLanguage(language)) language = 'plaintext'; const result = hljsModule.highlight(originalCode, { language, ignoreIllegals: true }); jqui.util.html(block, result.value); jqui.util.addClass(block, 'hljs', `language-${language}`); const copyButton = document.createElement('button'); copyButton.innerHTML = `<i class='bx bx-copy'></i>`; copyButton.className = 'absolute top-2 right-2 p-2 bg-gray-700 text-white rounded hover:bg-gray-600'; copyButton.title = '复制代码'; copyButton.addEventListener('click', async () => { await jqui.copy.text(originalCode); }); preElement.style.position = 'relative'; preElement.appendChild(copyButton); }); }
    return { init };
})();

jqui.template = (function () {
    const filters = { escape: s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'), default: (s, alt = '') => s || alt };
    function tokenize(t) { const RE = /\{jquan:(\w+)(?:\s+([^}]*))?\}|\{\/jquan:(\w+)\}|\{jquan:([\w.]+(?:\|[\w,:]+)?)\}/gs; const tok = []; let last = 0, m; while ((m = RE.exec(t)) !== null) { if (m.index > last) tok.push({ type: 'text', val: t.slice(last, m.index) }); if (m[1]) tok.push({ type: 'open', name: m[1], raw: m[2] || '' }); else if (m[3]) tok.push({ type: 'close', name: m[3] }); else if (m[4]) tok.push({ type: 'var', expr: m[4] }); last = RE.lastIndex; } if (last < t.length) tok.push({ type: 'text', val: t.slice(last) }); return tok; }
    function buildAST(tokens) { const stack = [{ type: 'root', kids: [] }]; for (const t of tokens) { const top = stack[stack.length - 1]; if (t.type === 'text' || t.type === 'var') { top.kids.push(t); continue; } if (t.type === 'open') { const nd = { type: 'tag', name: t.name, raw: t.raw, kids: [] }; top.kids.push(nd); stack.push(nd); } else { const pop = stack.pop(); if (!pop || pop.name !== t.name) throw Error(`Unexpected /jquan:${t.name}`); } } if (stack.length !== 1) throw Error('Unclosed tag'); return stack[0]; }
    function walk(n, ctx) {
        if (n.type === 'text') return Promise.resolve(n.val);
        if (n.type === 'var') {
            const [path, ...chain] = n.expr.split('|');
            let v = path.split('.').reduce((o, k) => (o ? o[k] : ''), ctx);
            return Promise.resolve(chain.reduce((v, f) => {
                const [name, ...args] = f.split(':');
                const fn = filters[name] || (x => x);
                return fn(v, ...args);
            }, v));
        }
        if (n.type === 'tag') {
            const { name, raw, kids } = n;
            if (name === 'list') {
                const arr = ctx.list || [];
                return Promise.all(arr.map((it, idx) => {
                    const sub = { ...ctx, ...it, '@index': idx, '@first': idx === 0 };
                    return Promise.all(kids.map(c => walk(c, sub))).then(parts => parts.join(''));
                })).then(results => results.join(''));
            }
            if (name === 'if') {
                const cond = new Function('ctx', `with(ctx){ return !!(${raw.match(/cond="([^"]+)"/)?.[1] || 'false'}) }`)(ctx);
                if (!cond) return Promise.resolve('');
                return Promise.all(kids.map(c => walk(c, ctx))).then(parts => parts.join(''));
            }
        }
        if (n.type === 'root') {
            return Promise.all(n.kids.map(c => walk(c, ctx))).then(parts => parts.join(''));
        }
        return Promise.resolve('');
    }
    async function loadTemplate(url) { try { const response = await fetch(url); if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`); return await response.text(); } catch (e) { console.error(`jqui.template: Error loading template from ${url}`, e); return ''; } }
    return { async render(tpl, data = {}) { return walk(buildAST(tokenize(tpl)), data); }, async renderFile(url, data = {}) { const tpl = await loadTemplate(url); return this.render(tpl, data); }, addFilter(name, fn) { filters[name] = fn; } };
})();


// --- 自动初始化 ---
const originalInit = jqui.init;
jqui.init = function () {
    originalInit.call(this);
    jqui.initAccordion();
    jqui.drawerManager.initDrawers();
    jqui.codeHighlighter.init();
    jqui.skeleton.autoInit();
};

// Export for ESM environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = jqui;
}

