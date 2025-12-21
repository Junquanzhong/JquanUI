// accordion.mjs (Optimized for Perfect Height Animation)

const COMPONENT_NAME = 'accordion';
const ITEM_SELECTOR = '.accordion-item';
const HEADER_SELECTOR = '.accordion-header';
const CONTENT_SELECTOR = '.accordion-content';
const CONTENT_INNER_SELECTOR = '.accordion-content-inner';

const DEFAULT_OPTIONS = {
    mode: 'multiple',
    defaultOpen: false,
    animationDuration: 300,
};

class Accordion {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        this.options.mode = this.element.dataset.accordion || this.options.mode;
        this.options.defaultOpen = this.element.dataset.accordionOpen !== undefined ? this.element.dataset.accordionOpen !== 'false' : this.options.defaultOpen;
        this.options.animationDuration = this.element.dataset.accordionDuration || this.options.animationDuration;

        this.items = this.element.querySelectorAll(ITEM_SELECTOR);
        if (this.items.length === 0) {
            console.warn(`[${COMPONENT_NAME}] No items found.`);
            return;
        }

        this.init();
    }

    init() {
        // 关键：将动画时长设置为 CSS 变量
        this.element.style.setProperty('--accordion-duration', `${this.options.animationDuration}ms`);
        
        this.items.forEach((item, index) => {
            const header = item.querySelector(HEADER_SELECTOR);
            const content = item.querySelector(CONTENT_SELECTOR);
            const inner = content.querySelector(CONTENT_INNER_SELECTOR);
            if (!header || !content || !inner) return;

            header.addEventListener('click', () => this.toggle(item));

            // 初始化展开状态
            if (this.options.mode === 'single' && this.options.defaultOpen && index === 0) {
                // 默认展开的项，立即设置高度，避免动画
                item.classList.add('is-open');
                this._setupAria(item, true);
                content.style.maxHeight = inner.scrollHeight + 'px'; // 设置为真实高度
            } else {
                // 默认关闭的项，max-height 为 0
                content.style.maxHeight = '0';
                this._setupAria(item, false);
            }
        });
    }

    toggle(itemToToggle) {
        if (itemToToggle.classList.contains('is-open')) {
            this.close(itemToToggle);
        } else {
            this.open(itemToToggle);
        }
    }

    open(itemToOpen) {
        if (itemToOpen.classList.contains('is-open')) return;

        if (this.options.mode === 'single') {
            this.items.forEach(item => {
                if (item !== itemToOpen && item.classList.contains('is-open')) {
                    this.close(item);
                }
            });
        }

        const content = itemToOpen.querySelector(CONTENT_SELECTOR);
        const inner = content.querySelector(CONTENT_INNER_SELECTOR);

        // 关键：动画前的准备
        // 1. 先让内容可见，以便测量高度
        content.style.maxHeight = 'none'; 
        // 2. 测量内部包裹层的真实高度 (scrollHeight 是最可靠的)
        const height = inner.scrollHeight;
        // 3. 立即将 maxHeight 设回 0，准备开始从 0 到 height 的动画
        content.style.maxHeight = '0';

        // 强制浏览器重绘，确保上面的样式变更生效
        // 这是保证动画从 0 开始的关键技巧
        content.offsetHeight; 

        // 添加打开状态的类
        itemToOpen.classList.add('is-open');

        // 关键：开始动画
        requestAnimationFrame(() => {
            content.style.maxHeight = height + 'px';
        });

        this._setupAria(itemToOpen, true);

        // 动画结束后，将 max-height 设置为 'none' 以防内容动态变化时被截断
        const onTransitionEnd = (e) => {
            if (e.propertyName === 'max-height') {
                itemToOpen.classList.add('is-fully-opened');
                content.removeEventListener('transitionend', onTransitionEnd);
            }
        };
        content.addEventListener('transitionend', onTransitionEnd);
    }

    close(itemToClose) {
        if (!itemToClose.classList.contains('is-open')) return;
        
        const content = itemToClose.querySelector(CONTENT_SELECTOR);
        const inner = content.querySelector(CONTENT_INNER_SELECTOR);
        
        // 移除 'fully-opened' 类，准备关闭动画
        itemToClose.classList.remove('is-fully-opened');

        // 先将 max-height 设为当前真实高度
        content.style.maxHeight = inner.scrollHeight + 'px';
        
        // 强制浏览器重绘
        content.offsetHeight;

        // 关闭状态类
        itemToClose.classList.remove('is-open');

        // 关键：在下一帧开始关闭动画
        requestAnimationFrame(() => {
            content.style.maxHeight = '0';
        });

        this._setupAria(itemToClose, false);
    }
    
    _setupAria(item, isOpen) {
        const header = item.querySelector(HEADER_SELECTOR);
        const content = item.querySelector(CONTENT_SELECTOR);
        const contentId = content.id || `accordion-content-${Math.random().toString(36).substr(2, 9)}`;
        content.id = contentId;
        
        header.setAttribute('aria-controls', contentId);
        header.setAttribute('aria-expanded', isOpen);
        content.setAttribute('aria-hidden', !isOpen);
    }

    destroy() {
        // ... (destroy 逻辑保持不变)
        this.items.forEach(item => {
            const header = item.querySelector(HEADER_SELECTOR);
            header.removeEventListener('click', this.toggle);
            // ... 其他清理
        });
        this.element.style.removeProperty('--accordion-duration');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const accordionElements = document.querySelectorAll(`[data-accordion]:not([data-accordion-initialized])`);
    accordionElements.forEach(el => {
        new Accordion(el);
        el.setAttribute('data-accordion-initialized', 'true');
    });
});

export default Accordion;
