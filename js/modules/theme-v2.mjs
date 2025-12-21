// theme-controller.mjs
import DOM from './dom.mjs';
import { get, set } from './localStorage.mjs';

/**
 * 初始化一个极简的主题控制器
 * @param {object} options - 配置选项
 * @param {string} options.el - 主题切换按钮容器选择器 (例如: '#colorPalette')
 * @param {string} options.defaultTheme - 默认主题 (例如: 'theme-indigo')
 * @param {string} [options.luminanceAttr='data-luminance'] - 明暗按钮的属性名
 */
export function createThemeController({ el, defaultTheme, luminanceAttr = 'data-luminance' }) {
    const container = DOM.getEl(el);
    if (!container) {
        console.error(`主题控制器初始化失败：找不到容器 "${el}"`);
        return;
    }

    const body = document.body;
    const THEME_DARK_CLASS = 'theme-dark';
    const STORAGE_KEY_THEME = 'themeName';
    const STORAGE_KEY_LUMINANCE = 'themeIsDark';

    // --- 核心应用函数 ---

    /**
     * 应用主题和明暗模式到 body
     * @param {string} themeName - 主题名，如 'theme-slate'
     * @param {boolean} isDark - 是否为暗色模式
     */
    const applyThemeAndLuminance = (themeName, isDark) => {
        // 获取body现有的非主题类（保留其他业务class）
        const existingClasses = Array.from(body.classList).filter(c => !c.startsWith('theme-'));
        
        // 构建最终的class列表
        let finalClasses = [...existingClasses, themeName];
        if (isDark) {
            finalClasses.push(THEME_DARK_CLASS);
        }
        
        // 一次性设置所有class，避免多次重绘
        body.className = finalClasses.join(' ');
    };
    
    /**
     * 更新按钮的 active 状态
     * @param {string} themeName - 当前主题名
     * @param {boolean} isDark - 当前是否为暗色模式
     */
    const updateButtonStates = (themeName, isDark) => {
        // 更新主题按钮
        DOM.findAll('[data-theme]', container).forEach(btn => {
            DOM.removeClass(btn, 'active');
        });
        const activeThemeBtn = DOM.find(`[data-theme="${themeName}"]`, container);
        if (activeThemeBtn) {
            DOM.addClass(activeThemeBtn, 'active');
        }

        // 更新明暗按钮
        DOM.findAll(`[${luminanceAttr}]`, container).forEach(btn => {
            DOM.removeClass(btn, 'active');
        });
        const luminanceValue = isDark ? 'dark' : 'light';
        const activeLuminanceBtn = DOM.find(`[${luminanceAttr}="${luminanceValue}"]`, container);
        if (activeLuminanceBtn) {
            DOM.addClass(activeLuminanceBtn, 'active');
        }
    };

    // --- 初始化 ---

    // 1. 从 localStorage 读取状态
    const savedTheme = get(STORAGE_KEY_THEME) || defaultTheme;
    const savedLuminance = get(STORAGE_KEY_LUMINANCE, false);

    // 2. 应用初始状态
    applyThemeAndLuminance(savedTheme, savedLuminance);

    // 3. 更新按钮 active 状态
    updateButtonStates(savedTheme, savedLuminance);

    // --- 事件监听 (使用事件委托) ---

    // 1. 监听主题颜色切换
    DOM.delegate(container, '[data-theme]', 'click', (event, button) => {
        const newTheme = DOM.getAttribute(button, 'data-theme');
        if (!newTheme) return;

        const isDark = DOM.hasClass(body, THEME_DARK_CLASS); // 获取当前的暗色状态
        
        // 保存新主题
        set(STORAGE_KEY_THEME, newTheme);
        
        // 应用主题，保留当前的暗色状态
        applyThemeAndLuminance(newTheme, isDark);
        
        // 更新按钮状态
        updateButtonStates(newTheme, isDark);
    });

    // 2. 监听明暗模式切换
    DOM.delegate(container, `[${luminanceAttr}]`, 'click', (event, button) => {
        const luminance = DOM.getAttribute(button, luminanceAttr);
        const isDark = luminance === 'dark';
        
        // 获取当前的主题名
        const currentTheme = Array.from(body.classList).find(c => c.startsWith('theme-') && c !== THEME_DARK_CLASS) || defaultTheme;

        // 保存新暗色状态
        set(STORAGE_KEY_LUMINANCE, isDark);

        // 应用暗色状态，保留当前的主题
        applyThemeAndLuminance(currentTheme, isDark);

        // 更新按钮状态
        updateButtonStates(currentTheme, isDark);
    });
}
