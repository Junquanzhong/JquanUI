// theme.mjs

import { get as getStorage, set as setStorage } from './localStorage.mjs';
import DOM from './dom.mjs';

const STORAGE_KEY = 'app-theme-settings';
const DEFAULT_BASE_THEME = ''//'theme-blue'; // 默认基础主题

// 立即应用的函数 (保持不变)
function applyThemeImmediately() {
    const settings = getStorage(STORAGE_KEY);
    if (!settings) return;

    const body = document.body;
    if (!body) return;

    body.className.split(' ').forEach(cls => {
        if (cls.startsWith('theme-')) {
            body.classList.remove(cls);
        }
    });

    if (settings.baseTheme) {
        body.classList.add(settings.baseTheme);
    }
    if (settings.darkMode) {
        body.classList.add('theme-dark');
    }
}

/**
 * 应用主题到 <body> 元素
 * @param {object} settings - 主题设置对象
 */
function applyTheme(settings) {
    const body = document.body;
    if (!body) {
        console.warn('[theme.mjs] <body> 元素未找到，无法应用主题。');
        return;
    }

    // 清除所有旧的主题类
    body.className.split(' ').forEach(cls => {
        if (cls.startsWith('theme-')) {
            DOM.removeClass(body, cls);
        }
    });

    // 应用新的设置
    if (settings.baseTheme) {
        DOM.addClass(body, settings.baseTheme);
    }
    if (settings.darkMode) {
        DOM.addClass(body, 'theme-dark');
    }
}

/**
 * 更新亮/暗模式按钮的活动状态
 * @param {boolean} isDarkMode - 当前是否为暗色模式
 * @param {string} buttonSelector - 亮/暗按钮的通用选择器
 */
function updateLuminanceButtonsState(isDarkMode, buttonSelector = '[data-luminance]') {
    const buttons = DOM.findAll(buttonSelector);
    buttons.forEach(button => {
        const luminance = DOM.getAttribute(button, 'data-luminance');
        if (luminance === 'dark' && isDarkMode) {
            DOM.addClass(button, 'active');
        } else if (luminance === 'light' && !isDarkMode) {
            DOM.addClass(button, 'active');
        } else {
            DOM.removeClass(button, 'active');
        }
    });
}

/**
 * 主题模块的完整初始化函数
 * @param {object} options - 配置选项
 * @param {string} options.baseThemeSelector - 基础主题切换按钮的选择器 (默认: '[data-theme]')
 * @param {string} options.luminanceSelector - 亮/暗模式切换按钮的选择器 (默认: '[data-luminance]')
 */
export function init(options = {}) {
    const {
        baseThemeSelector = '[data-theme]', // e.g., <button data-theme="theme-red">
        luminanceSelector = '[data-luminance]', // e.g., <button data-luminance="dark">
    } = options;

    // 1. 获取或创建初始设置
    let settings = getStorage(STORAGE_KEY);
    if (!settings) {
        settings = {
            baseTheme: DEFAULT_BASE_THEME,
            darkMode: false, // 默认亮色
        };
    } else {
        // 确保设置对象结构完整
        settings.baseTheme = settings.baseTheme || DEFAULT_BASE_THEME;
        settings.darkMode = !!settings.darkMode; // 强制转换为布尔值
    }

    // 2. 应用主题
    applyTheme(settings);

    // 3. 初始化按钮状态
    updateLuminanceButtonsState(settings.darkMode, luminanceSelector);

    // 4. 为所有主题相关按钮绑定事件
    DOM.on(document.body, 'click', (event) => {
        // 检查是否点击了基础主题按钮
        const baseThemeButton = event.target.closest(baseThemeSelector);
        if (baseThemeButton) {
            const newBaseTheme = DOM.getAttribute(baseThemeButton, 'data-theme');
            if (newBaseTheme && newBaseTheme.startsWith('theme-')) {
                settings.baseTheme = newBaseTheme;
                setStorage(STORAGE_KEY, settings);
                applyTheme(settings);
                console.log('切换基础主题为:', settings.baseTheme);
                return; // 处理完毕，不再继续往下检查
            }
        }

        // 检查是否点击了亮/暗模式按钮
        const luminanceButton = event.target.closest(luminanceSelector);
        if (luminanceButton) {
            const newLuminance = DOM.getAttribute(luminanceButton, 'data-luminance');
            if (newLuminance === 'dark' || newLuminance === 'light') {
                // 只有当状态确实改变时才执行
                if ((newLuminance === 'dark' && !settings.darkMode) || (newLuminance === 'light' && settings.darkMode)) {
                    settings.darkMode = (newLuminance === 'dark');
                    setStorage(STORAGE_KEY, settings);
                    applyTheme(settings);
                    updateLuminanceButtonsState(settings.darkMode, luminanceSelector);
                    console.log('切换亮暗模式为:', settings.darkMode ? '暗色' : '亮色');
                }
                return; // 处理完毕
            }
        }
    }, { delegate: true });
}

// 导出立即应用的函数 (保持不变)
export { applyThemeImmediately };

/**
 * 获取当前的主题设置
 * @returns {object} - 当前主题设置对象
 */
export function getCurrentTheme() {
    return getStorage(STORAGE_KEY) || { baseTheme: '', darkMode: false };
}
