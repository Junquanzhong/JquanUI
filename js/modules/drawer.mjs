/**
 * drawer.mjs (JquanUIex Refactored - Production Grade)
 * 
 * 特性：
 * 1. 支持上下左右四个方向 (data-position)
 * 2. 完整的生命周期事件 (onShow, onHide) 和 DOM 事件分发
 * 3. 焦点陷阱 (Focus Trap) A11y 支持
 * 4. 实例管理与编程式调用
 * 5. 单例遮罩层
 */

const DEFAULTS = {
    position: 'right',
    backdrop: true,
    bodyLock: true,
    closeOnBackdrop: true,
    closeOnEsc: true,
    onShow: () => { },
    onHide: () => { },
};

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function trapFocus(element, e) {
    const focusableContent = element.querySelectorAll(focusableSelector);
    if (focusableContent.length === 0) return;
    const firstFocusable = focusableContent[0];
    const lastFocusable = focusableContent[focusableContent.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
        }
    }
}

class Drawer {
    constructor(targetEl, options = {}) {
        this._targetEl = typeof targetEl === 'string' ? document.querySelector(targetEl) : targetEl;
        if (!this._targetEl) {
            console.error('Drawer: Target element not found.', targetEl);
            return;
        }
        this._options = { ...DEFAULTS, ...options, ...this._getDataAttributes() };
        this._visible = false;
        this._triggerEl = null;
        this._initDom();
        this._targetEl.__drawerInstance = this;
    }

    _getDataAttributes() {
        const dataset = this._targetEl.dataset;
        const config = {};
        if (dataset.position) config.position = dataset.position;
        if (dataset.backdrop !== undefined) config.backdrop = dataset.backdrop !== 'false';
        if (dataset.bodyLock !== undefined) config.bodyLock = dataset.bodyLock !== 'false';
        return config;
    }

    _initDom() {
        this._targetEl.classList.add('drawer-panel');
        this._targetEl.setAttribute('data-position', this._options.position);
        this._targetEl.setAttribute('aria-hidden', 'true');
        this._targetEl.setAttribute('role', 'dialog');
        this._targetEl.setAttribute('aria-modal', 'true');
        this._targetEl.setAttribute('tabindex', '-1');
    }

    show(triggerEl = null) {
        if (this._visible) return;
        DrawerManager.closeAll(this);
        this._triggerEl = triggerEl;
        if (typeof this._options.onShow === 'function') this._options.onShow(this);
        if (this._options.backdrop) DrawerManager.showBackdrop(this);

        this._targetEl.setAttribute('aria-hidden', 'false');
        this._visible = true;
        if (this._options.bodyLock) document.body.classList.add('drawer-open');

        this._addEventListeners();
        setTimeout(() => {
            const firstFocusable = this._targetEl.querySelector(focusableSelector);
            if (firstFocusable) firstFocusable.focus();
            else this._targetEl.focus();
        }, 50);
        this._targetEl.dispatchEvent(new CustomEvent('drawer:shown', { detail: { drawer: this } }));
    }

    hide() {
        if (!this._visible) return;
        if (typeof this._options.onHide === 'function') this._options.onHide(this);
        this._targetEl.setAttribute('aria-hidden', 'true');
        this._visible = false;
        if (!DrawerManager.hasOpenDrawers()) {
            DrawerManager.hideBackdrop();
            document.body.classList.remove('drawer-open');
        }
        this._removeEventListeners();
        if (this._triggerEl && document.body.contains(this._triggerEl)) this._triggerEl.focus();
        this._targetEl.dispatchEvent(new CustomEvent('drawer:hidden', { detail: { drawer: this } }));
    }

    toggle(triggerEl) {
        this._visible ? this.hide() : this.show(triggerEl);
    }

    _addEventListeners() {
        this._keydownHandler = (e) => {
            if (e.key === 'Escape' && this._options.closeOnEsc) this.hide();
            if (e.key === 'Tab') trapFocus(this._targetEl, e);
        };
        document.addEventListener('keydown', this._keydownHandler);
        this._closeBtnHandler = (e) => {
            const closeBtn = e.target.closest('[data-drawer-close]');
            if (closeBtn) this.hide();
        };
        this._targetEl.addEventListener('click', this._closeBtnHandler);
    }

    _removeEventListeners() {
        if (this._keydownHandler) document.removeEventListener('keydown', this._keydownHandler);
        if (this._closeBtnHandler) this._targetEl.removeEventListener('click', this._closeBtnHandler);
    }

    isVisible() { return this._visible; }
    shouldCloseOnBackdrop() { return this._options.closeOnBackdrop; }
}

const DrawerManager = {
    backdropEl: null,
    activeDrawers: [],
    initBackdrop() {
        if (this.backdropEl) return;
        this.backdropEl = document.createElement('div');
        this.backdropEl.className = 'drawer-backdrop';
        this.backdropEl.setAttribute('tabindex', '-1');
        document.body.appendChild(this.backdropEl);
        this.backdropEl.addEventListener('click', () => {
            const topDrawer = this.activeDrawers[this.activeDrawers.length - 1];
            if (topDrawer && topDrawer.shouldCloseOnBackdrop()) topDrawer.hide();
        });
    },
    showBackdrop(drawerInstance) {
        this.initBackdrop();
        if (!this.activeDrawers.includes(drawerInstance)) this.activeDrawers.push(drawerInstance);
        requestAnimationFrame(() => this.backdropEl.classList.add('is-visible'));
    },
    hideBackdrop() {
        if (!this.backdropEl) return;
        this.backdropEl.classList.remove('is-visible');
    },
    closeAll(excludeInstance = null) {
        this.activeDrawers.forEach(d => {
            if (d !== excludeInstance && d.isVisible()) d.hide();
        });
        if (excludeInstance) this.activeDrawers = [excludeInstance];
        else this.activeDrawers = [];
    },
    hasOpenDrawers() { return this.activeDrawers.some(d => d.isVisible()); }
};

function initDrawers(options = {}) {
    console.log('JquanUIex: Initializing Drawers...');
    const triggers = document.querySelectorAll('[data-drawer-target]');
    triggers.forEach(trigger => {
        const targetId = trigger.dataset.drawerTarget;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            if (!targetEl.__drawerInstance) {
                const triggerOptions = {};
                if (trigger.dataset.drawerPosition) triggerOptions.position = trigger.dataset.drawerPosition;
                if (trigger.dataset.drawerBackdrop) triggerOptions.backdrop = trigger.dataset.drawerBackdrop !== 'false';
                new Drawer(targetEl, { ...options, ...triggerOptions });
            }
            trigger.addEventListener('click', handleTriggerClick);
        }
    });
}

function handleTriggerClick(e) {
    if (e.currentTarget.tagName === 'A') e.preventDefault();
    const targetId = e.currentTarget.dataset.drawerTarget;
    const targetEl = document.getElementById(targetId);
    if (targetEl && targetEl.__drawerInstance) {
        targetEl.__drawerInstance.toggle(e.currentTarget);
    }
}

// 导出 Drawer 类，允许高级用户手动实例化： const myDrawer = new Drawer('#my-id', { position: 'top' });
export { Drawer };

// 默认初始化
if (typeof window !== 'undefined') {
    // 可选：文档加载完成后自动初始化
    window.addEventListener('DOMContentLoaded', () => initDrawers());
}
