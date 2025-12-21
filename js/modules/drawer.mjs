/**
 * drawer.mjs (JquanUIex 版本)
 * 一个灵活的、可配置的抽屉组件脚本。
 * 依赖 JquanUIex CSS 框架来处理样式和过渡效果。
 */

// ---------------------------------------------------------------------------
// 1. 状态管理和配置 (无变动)
// ---------------------------------------------------------------------------
const state = {
    openDrawerId: null,
    drawerOptions: new Map(),
};

const defaultOptions = {
    position: 'right',
    disableMask: false,
    bodyLock: true,
};

// ---------------------------------------------------------------------------
// 2. DOM 元素缓存和工具函数
// ---------------------------------------------------------------------------

// 创建一个全局遮罩层，并附加到 body
const mask = document.createElement('div');
mask.dataset.drawerMask = ''; // 用于选择器和自定义CSS
document.body.appendChild(mask);

/**
 * 获取抽屉元素的选项配置
 * @param {HTMLElement} triggerEl - 触发按钮元素
 * @returns {Object} - 合并后的选项对象
 */
function getDrawerOptions(triggerEl) {
    const drawerId = triggerEl.dataset.drawerTarget;
    if (state.drawerOptions.has(drawerId)) {
        return state.drawerOptions.get(drawerId);
    }

    const options = { ...defaultOptions };
    if (triggerEl.dataset.drawerDisableMask !== undefined) {
        options.disableMask = true;
    }
    if (triggerEl.dataset.drawerPosition) {
        options.position = triggerEl.dataset.drawerPosition;
    }
    if (triggerEl.dataset.drawerBodyLock !== undefined) {
        options.bodyLock = triggerEl.dataset.drawerBodyLock === 'true';
    }
    
    state.drawerOptions.set(drawerId, options);
    return options;
}

function toggleDrawer(drawerId, triggerEl) {
    if (state.openDrawerId === drawerId) {
        closeDrawer();
    } else {
        openDrawer(drawerId, triggerEl);
    }
}

// ---------------------------------------------------------------------------
// 3. 核心 Open/Close 逻辑 (使用类名和自定义CSS)
// ---------------------------------------------------------------------------

function openDrawer(drawerId, triggerEl) {
    const drawer = document.getElementById(drawerId);
    if (!drawer) {
        console.error(`Drawer with id "${drawerId}" not found.`);
        return;
    }

    const options = getDrawerOptions(triggerEl);
    
    if (state.openDrawerId && state.openDrawerId !== drawerId) {
        closeDrawer(false);
    }
    
    state.openDrawerId = drawerId;
    state.lastFocusedTrigger = triggerEl;

    // 更新 ARIA 属性
    drawer.setAttribute('aria-hidden', 'false');
    
    // 打开遮罩
    if (!options.disableMask) {
        mask.classList.add('is-open');
    }
    
    // 锁定body滚动
    if (options.bodyLock) {
        document.body.classList.add('is-drawer-open');
    }

    // 使用 requestAnimationFrame 确保DOM更新后再执行动画
    requestAnimationFrame(() => {
        // 通过添加/移除 'is-open' 类来控制滑动动画
        drawer.classList.add('is-open');
        
        // 焦点管理
        const focusableElement = drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
            setTimeout(() => focusableElement.focus(), 100);
        }
    });
}

function closeDrawer(restoreFocus = true) {
    if (!state.openDrawerId) return;

    const drawer = document.getElementById(state.openDrawerId);
    if (!drawer) return;
    
    const triggerEl = document.querySelector(`[data-drawer-target="${state.openDrawerId}"]`);
    const options = triggerEl ? getDrawerOptions(triggerEl) : defaultOptions;
    
    // 立即更新 ARIA 属性和恢复焦点
    drawer.setAttribute('aria-hidden', 'true');
    if (restoreFocus && state.lastFocusedTrigger) {
        state.lastFocusedTrigger.focus();
    }

    // 隐藏遮罩
    mask.classList.remove('is-open');
    
    // 解锁body滚动
    if (options.bodyLock) {
        document.body.classList.remove('is-drawer-open');
    }

    // 移除 'is-open' 类，触发关闭动画
    drawer.classList.remove('is-open');

    state.openDrawerId = null;
    state.lastFocusedTrigger = null;
}

// ---------------------------------------------------------------------------
// 4. 事件监听器 (无变动)
// ---------------------------------------------------------------------------
function handleTriggerClick(event) {
    const trigger = event.target.closest('[data-drawer-target]');
    if (trigger) {
        const drawerId = trigger.dataset.drawerTarget;
        toggleDrawer(drawerId, trigger);
    }
}

function handleMaskClick(event) {
    if (event.target === mask) {
        const triggerEl = document.querySelector(`[data-drawer-target="${state.openDrawerId}"]`);
        const options = triggerEl ? getDrawerOptions(triggerEl) : defaultOptions;
        if (!options.disableMask) {
            closeDrawer();
        }
    }
}

function handleEscKey(event) {
    if (event.key === 'Escape' && state.openDrawerId) {
        closeDrawer();
    }
}

function handleCloseClick(event) {
    const closeButton = event.target.closest('[data-drawer-close]');
    if (closeButton) {
        const drawer = closeButton.closest('.drawer');
        if (drawer && drawer.id === state.openDrawerId) {
            closeDrawer();
        }
    }
}

// ---------------------------------------------------------------------------
// 5. 初始化函数 (更新类名)
// ---------------------------------------------------------------------------
export function initDrawers() {
    console.log('Initializing drawers with JquanUIex (Optimized)...');
    document.querySelectorAll('[id]').forEach(el => {
        // 检查是否存在对应的触发按钮
        const trigger = document.querySelector(`[data-drawer-target="${el.id}"]`);
        if (trigger) {
            const options = getDrawerOptions(trigger);
            
            // 1. 添加核心抽屉类，这是 CSS 的钩子
            el.classList.add('drawer');
            // 2. 将位置写入 data 属性，供 CSS 选择器使用
            el.dataset.drawerPosition = options.position;
            
            // 3. 应用基础样式类
            el.classList.add(
                'fixed', 'top-0', 'h-full', 'w-80', 'bg-white', 'shadow-xl', 'z-50'
            );
            // 4. 初始 ARIA 状态
            el.setAttribute('aria-hidden', 'true');
        }
    });
    document.addEventListener('click', handleTriggerClick, true);
    document.addEventListener('click', handleCloseClick, true);
    
    mask.addEventListener('click', handleMaskClick);
    document.addEventListener('keydown', handleEscKey);
    console.log('JquanUIex drawers (Optimized) initialized.');
    requestAnimationFrame(() => {
        document.body.classList.remove('is-drawer-ready');
        document.body.classList.add('is-loaded');
        console.log('Drawer transitions enabled.');
    });
}
