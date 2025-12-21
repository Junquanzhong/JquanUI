// modal.mjs - JquanUI Modal Component v1.1.0 (Final Integrated Version)
// Author: CAN
// I LOVE CODING

class Modal {
    // 用于管理所有活动的模态框实例
    static activeModals = new Set();
    // 用于管理全局配置
    static globalOptions = {
        closeOnOutsideClick: true,
        closeOnEscape: true,
    };

    constructor(triggerOrOptions) {
        if (typeof triggerOrOptions === 'object' && !(triggerOrOptions instanceof HTMLElement)) {
            this.options = { ...Modal.globalOptions, ...triggerOrOptions };
            this.trigger = null;
        } else if (triggerOrOptions instanceof HTMLElement) {
            this.trigger = triggerOrOptions;
            this.options = this._parseDataAttributes(this.trigger);
        } else {
            console.error('Modal: Invalid constructor argument. Expected an HTMLElement or an options object.');
            return;
        }

        this.modal = null;
        this.overlay = null;
        this.content = null;
        this.innerContent = null;
        this.closeButton = null;
        this.iframe = null;
        this.originalIframeSrc = null;
        this._isInitialized = false; // 防止重复初始化

        this._init();
    }

    /**
     * 从触发器的 data-* 属性中解析配置
     * @private
     */
    _parseDataAttributes(trigger) {
        const options = { ...Modal.globalOptions };
        const targetId = trigger.getAttribute('href')?.substring(1) || trigger.dataset.modalTarget;
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                options.content = targetElement.innerHTML;
            }
        } else {
            options.content = trigger.dataset.modalContent || '';
        }
        if (trigger.dataset.modal === 'video') {
            options.type = 'video';
            options.content = `<iframe src="${options.content || ''}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            options.type = 'html';
        }
        const size = trigger.dataset.modalSize;
        options.size = (size === 'sm' || size === 'lg' || size === 'full') ? size : 'lg';
        options.closeOnOutsideClick = trigger.dataset.modalCloseOutside !== 'false';
        options.closeOnEscape = trigger.dataset.modalEscOutside !== 'false';
        options.customOverlayClass = trigger.dataset.modalOverlayClass;
        options.customContentClass = trigger.dataset.modalContentClass;
        return options;
    }

    /**
     * 初始化模态框，创建DOM结构并绑定事件
     * @private
     */
    _init() {
        if (this._isInitialized) return;
        
        this._createElements();
        this._buildStructure();
        this._bindEvents();
        this._isInitialized = true;

        // 只有编程式调用时才立即显示
        if (!this.trigger) {
            this.show();
        }
    }

    /**
     * 创建模态框所需的基础元素
     * @private
     */
    _createElements() {
        this.modal = document.createElement('div');
        this.overlay = document.createElement('div');
        this.content = document.createElement('div');
        this.innerContent = document.createElement('div');
        this.closeButton = document.createElement('button');

        // **关键修正：初始状态使用 `hidden` 类彻底隐藏**
        this.modal.className = 'fixed inset-0 z-modal flex items-center justify-center p-4';
        this.overlay.className = `absolute inset-0 bg-black opacity-50 ${this.options.customOverlayClass || ''}`;
        this.content.className = `relative bg-white rounded-lg shadow-xl max-w-2xl w-full transform transition-all scale-95 ${this.options.customContentClass || ''}`;
        this.innerContent.className = 'modal-inner-content';
        this.closeButton.className = 'absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none';
        this.closeButton.innerHTML = '<i class="bx bx-x text-2xl"></i>';
        this.closeButton.setAttribute('aria-label', 'Close modal');
    }
    
    /**
     * 构建模态框的DOM结构
     * @private
     */
    _buildStructure() {
        this.innerContent.innerHTML = this.options.content;

        if (this.options.type === 'video') {
            this.iframe = this.innerContent.querySelector('iframe');
            if (this.iframe) {
                this.originalIframeSrc = this.iframe.src;
            }
        }

        switch (this.options.size) {
            case 'sm':
                this.content.classList.remove('max-w-2xl');
                this.content.classList.add('max-w-md');
                break;
            case 'full':
                this.content.classList.remove('max-w-2xl', 'rounded-lg');
                this.content.classList.add('w-full', 'h-full', 'max-w-full', 'max-h-full', 'm-0');
                break;
        }
        
        this.content.appendChild(this.closeButton);
        this.content.appendChild(this.innerContent);
        this.modal.appendChild(this.overlay);
        this.modal.appendChild(this.content);
        
        // 将创建好的DOM添加到body，但保持隐藏状态
        document.body.appendChild(this.modal);
        this.hide(true); // 立即进入隐藏状态，但不执行动画
    }

    /**
     * 绑定事件监听器
     * @private
     */
    _bindEvents() {
        this.closeButton.addEventListener('click', () => this.hide());
        if (this.options.closeOnOutsideClick) {
            this.overlay.addEventListener('click', () => this.hide());
        }
        if (this.options.closeOnEscape) {
            this._handleKeyDown = this._handleKeyDown.bind(this);
            document.addEventListener('keydown', this._handleKeyDown);
        }
        if (this.trigger) {
            this.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.show();
            });
        }
    }

    /**
     * 处理键盘事件
     * @private
     */
    _handleKeyDown(e) {
        if (e.key === 'Escape' && Modal.activeModals.has(this)) {
            this.hide();
        }
    }

    /**
     * 显示模态框
     */
    show() {
        if (Modal.activeModals.has(this)) return;
        if (!this._isInitialized) {
             console.warn("Modal is not fully initialized yet. Please wait.");
             return;
        }

        document.body.style.overflow = 'hidden';
        Modal.activeModals.add(this);

        // 1. 先设置 `display: block`
        this.modal.classList.remove('hidden');
        
        // 2. 在下一个渲染帧，开始执行显示动画
        requestAnimationFrame(() => {
            this.modal.classList.remove('opacity-0', 'invisible', 'scale-95');
            this.modal.classList.add('opacity-100', 'visible', 'scale-100');
        });

        if (this.options.type === 'video' && this.iframe) {
            this.iframe.src = this.originalIframeSrc;
        }
    }

    /**
     * 隐藏模态框
     * @param {boolean} immediate - 是否立即隐藏，不播放动画
     */
    hide(immediate = false) {
        if (!Modal.activeModals.has(this)) return;

        if (immediate) {
            // 直接设置为隐藏状态，用于初始化
            this.modal.classList.add('hidden');
            this.modal.classList.remove('opacity-100', 'visible', 'scale-100');
            this.modal.classList.add('opacity-0', 'invisible', 'scale-95');
            return;
        }

        // 1. 开始播放隐藏动画
        this.modal.classList.remove('opacity-100', 'visible', 'scale-100');
        this.modal.classList.add('opacity-0', 'invisible', 'scale-95');

        // 2. 动画结束后，设置 `display: none`
        const duration = parseFloat(getComputedStyle(this.modal).transitionDuration) * 1000 || 300;
        setTimeout(() => {
            if (this.options.type === 'video' && this.iframe) {
                this.iframe.src = '';
            }
            Modal.activeModals.delete(this);
            if (Modal.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
            this.modal.classList.add('hidden');
        }, duration);
    }

    /**
     * 销毁模态框实例，清理DOM和事件
     */
    destroy() {
        if (this._handleKeyDown) {
            document.removeEventListener('keydown', this._handleKeyDown);
        }
        
        // 从触发器上移除实例引用
        if (this.trigger) {
            delete this.trigger._modalInstance;
        }

        this.hide(); // 先播放关闭动画

        // 动画结束后从DOM中移除
        const duration = parseFloat(getComputedStyle(this.modal).transitionDuration) * 1000 || 300;
        setTimeout(() => {
            if(this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
        }, duration);
    }

    /**
     * 编程式创建并显示一个模态框
     * @param {object} options - 模态框配置
     * @returns {Modal} - 新的模态框实例
     */
    static show(options) {
        const modalInstance = new Modal(options);
        return modalInstance;
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 防止在没有JquanUI环境时出错
    window.JquanUI = window.JquanUI || {};

    const triggers = document.querySelectorAll('[data-modal-target], [href^="#"][data-modal], [data-modal-content]');
    document.body.classList.add('is-loaded');

    triggers.forEach(trigger => {
        // 确保每个触发器只初始化一次
        if (!trigger._modalInstance) {
            trigger._modalInstance = new Modal(trigger);
        }
    });
    
    // 将Modal类挂载到全局对象
    window.JquanUI.Modal = Modal;
});
