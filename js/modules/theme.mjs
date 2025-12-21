// theme.mjs (修改版本 v2)

import * as storage from './localStorage.mjs';
import DOM from './dom.mjs';

// 定义常量
const STORAGE_KEY = 'app-theme';
const THEME_CLASS_PREFIX = 'theme-';
const DARK_MODE_CLASS = 'theme-dark';
const ACTIVE_CLASS = 'active'; // 新增：激活状态的 class

/**
 * 初始化主题系统
 * @param {object} options - 配置选项
 * @param {string} options.el - 主题按钮容器的选择器，例如 '#colorPalette'
 * @param {string} [options.defaultTheme='theme-indigo'] - 默认主题名称
 * @param {string} [options.darkModeToggleSelector='[data-luminance]'] - 明暗切换按钮的选择器
 * @param {boolean} [options.syncIframes=false] - 是否将主题同步应用到同域名的所有 iframe
 * @returns {object} 返回一个包含可操作方法的对象
 */
export function initTheme(options) {
    // 1. 参数校验
    if (!options || typeof options !== 'object') {
        console.error('[theme.mjs] 初始化失败：options 必须是一个对象。');
        return null;
    }

    const { 
        el, 
        defaultTheme = 'theme-indigo', 
        darkModeToggleSelector = '[data-luminance]',
        syncIframes = false 
    } = options;

    if (!el || typeof el !== 'string') {
        console.error('[theme.mjs] 初始化失败：必须提供有效的容器选择器。');
        return null;
    }

    // 2. 获取DOM元素
    const container = DOM.getEl(el);
    if (!container) {
        console.error(`[theme.mjs] 初始化失败：找不到容器元素 "${el}"。`);
        return null;
    }

    // --- 新增：获取主题指示器元素 ---
    const themeIndicatorSpan = DOM.getEl('#themePickerTrigger > span');

    // --- 新增：明暗按钮选择器 ---
    const LUMINANCE_BUTTON_SELECTOR = '.theme-icon-btn';

    // 3. 核心功能函数

    /**
     * --- 新增：更新主题指示器（#themePickerTrigger > span）的背景色
     * @param {string} themeName - 例如 'theme-red'
     */
    const updateThemeIndicator = (themeName) => {
        if (!themeIndicatorSpan) return;

        // 移除旧的颜色类（假设只保留 bg-* 类）
        const classList = Array.from(themeIndicatorSpan.classList);
        classList.forEach(cls => {
            if (cls.startsWith('bg-')) {
                DOM.removeClass(themeIndicatorSpan, cls);
            }
        });

        if (themeName && themeName.startsWith(THEME_CLASS_PREFIX)) {
            const colorName = themeName.substring(THEME_CLASS_PREFIX.length); // e.g., 'red'
            // 默认使用 500 色阶，可根据需要调整
            const bgColorClass = `bg-${colorName}`;
            DOM.addClass(themeIndicatorSpan, bgColorClass);
        }
    };

    /**
     * --- 新增：更新容器内主题按钮的 active 状态
     * @param {string} themeName - 当前激活的主题名
     */
    const updateActiveButton = (themeName) => {
        // 移除所有按钮的 active class
        const buttons = container.querySelectorAll('[data-theme]');
        buttons.forEach(btn => {
            DOM.removeClass(btn, ACTIVE_CLASS);
        });

        // 给匹配的按钮添加 active
        if (themeName) {
            const activeButton = container.querySelector(`[data-theme="${themeName}"]`);
            if (activeButton) {
                DOM.addClass(activeButton, ACTIVE_CLASS);
            }
        }
    };

    /**
     * --- 新增：更新明暗切换按钮的激活状态
     * @param {string} mode - 'light' 或 'dark'
     */
    const updateActiveLuminanceButton = (mode) => {
        // 获取所有明暗切换按钮
        const luminanceButtons = document.querySelectorAll(LUMINANCE_BUTTON_SELECTOR);
        luminanceButtons.forEach(btn => {
            DOM.removeClass(btn, 'bg-accent');
        });
        if (mode) {
            const activeBtn = document.querySelector(`${LUMINANCE_BUTTON_SELECTOR}[data-luminance="${mode}"]`);
            if (activeBtn) {
                DOM.addClass(activeBtn, 'bg-accent');
            }
        }
    };

    /**
     * 将主题类同步到所有同域名的 iframe
     * @param {string} themeName - 主题名称
     * @param {string} mode - 'light' 或 'dark'
     */
    const syncThemeToIframes = (themeName, mode) => {
        if (!syncIframes) return;

        DOM.findAll('iframe').forEach(iframe => {
            try {
                const iframeBody = iframe.contentWindow.document.body;
                if (iframeBody) {
                    // 清除旧主题
                    const classList = Array.from(iframeBody.classList);
                    classList.forEach(className => {
                        if (className.startsWith(THEME_CLASS_PREFIX)) {
                            DOM.removeClass(iframeBody, className);
                        }
                    });
                    // 应用新主题
                    DOM.addClass(iframeBody, themeName);
                    // 应用明暗模式
                    if (mode === 'dark') {
                        DOM.addClass(iframeBody, DARK_MODE_CLASS);
                    } else {
                        DOM.removeClass(iframeBody, DARK_MODE_CLASS);
                    }
                }
            } catch (e) {
                console.warn(`[theme.mjs] 无法同步主题到跨域 iframe: ${iframe.src}`, e.message);
            }
        });
    };

    /**
     * --- 修改 ---：清除body上所有的颜色主题类，但保留暗色模式类
     */
    const clearColorThemeClasses = () => {
        const body = document.body;
        const classList = Array.from(body.classList);
        classList.forEach(className => {
            if (className.startsWith(THEME_CLASS_PREFIX) && className !== DARK_MODE_CLASS) {
                DOM.removeClass(body, className);
            }
        });
    };

    /**
     * --- 修改 ---：应用指定的颜色主题类到body，并保留现有的暗色模式
     * @param {string} themeName - 主题名称，例如 'theme-slate'
     */
    const applyTheme = (themeName) => {
        const body = document.body;
        clearColorThemeClasses();
        if (themeName) {
            DOM.addClass(body, themeName);
        }
        const currentMode = getCurrentLuminance();
        syncThemeToIframes(themeName, currentMode);

        // --- 新增：更新 UI 反馈 ---
        updateActiveButton(themeName);
        updateThemeIndicator(themeName);
    };

    /**
     * 获取当前的明暗模式 ('light' | 'dark')
     * @returns {string}
     */
    const getCurrentLuminance = () => {
        const body = document.body;
        return DOM.hasClass(body, DARK_MODE_CLASS) ? 'dark' : 'light';
    };

    /**
     * 设置明暗模式
     * @param {string} mode - 'light' 或 'dark'
     */
    const setLuminance = (mode) => {
        const body = document.body;
        if (mode === 'dark') {
            DOM.addClass(body, DARK_MODE_CLASS);
        } else {
            DOM.removeClass(body, DARK_MODE_CLASS);
        }
        const currentTheme = Array.from(body.classList).find(c => c.startsWith(THEME_CLASS_PREFIX) && c !== DARK_MODE_CLASS);
        if (currentTheme) {
            syncThemeToIframes(currentTheme, mode);
        }
        // --- 新增：更新明暗按钮的激活状态 ---
        updateActiveLuminanceButton(mode);
    };

    /**
     * 从localStorage加载并应用主题
     */
    const loadTheme = () => {
        const savedTheme = storage.get(STORAGE_KEY, defaultTheme);
        applyTheme(savedTheme);

        const savedLuminance = storage.get(`${STORAGE_KEY}-luminance`, 'light');
        setLuminance(savedLuminance);
    };

    /**
     * 保存主题到localStorage并应用
     * @param {string} themeName - 要设置的主题名称
     */
    const setTheme = (themeName) => {
        if (typeof themeName !== 'string') {
            console.error(`[theme.mjs] 设置主题失败：主题名称必须是一个字符串。`);
            return;
        }
        storage.set(STORAGE_KEY, themeName);
        applyTheme(themeName);
    };

    /**
     * 保存明暗模式到localStorage并应用
     * @param {string} mode - 'light' 或 'dark'
     */
    const setLuminanceAndSave = (mode) => {
        if (mode !== 'light' && mode !== 'dark') {
            console.error(`[theme.mjs] 设置明暗模式失败：模式必须是 'light' 或 'dark'。`);
            return;
        }
        storage.set(`${STORAGE_KEY}-luminance`, mode);
        setLuminance(mode);
    };
    
    // 4. 事件监听
    const handleThemeButtonClick = (event) => {
        const button = event.target.closest('[data-theme]');
        if (!button) return;

        const theme = DOM.getAttribute(button, 'data-theme');
        if (theme) {
            setTheme(theme);
        }
    };
    DOM.on(container, 'click', handleThemeButtonClick);

    const handleLuminanceButtonClick = (event) => {
        const button = event.target.closest(darkModeToggleSelector);
        if (!button) return;

        const luminance = DOM.getAttribute(button, 'data-luminance');
        if (luminance) {
            setLuminanceAndSave(luminance);
        }
    };
    DOM.on(document.body, 'click', handleLuminanceButtonClick);

    // 5. 初始化
    loadTheme();

    // 6. 返回API
    return {
        setTheme,
        setLuminance: setLuminanceAndSave,
        getCurrentTheme: () => storage.get(STORAGE_KEY, defaultTheme),
        getCurrentLuminance,
        destroy: () => {
            DOM.off(container, 'click', handleThemeButtonClick);
            DOM.off(document.body, 'click', handleLuminanceButtonClick);
        }
    };
}
