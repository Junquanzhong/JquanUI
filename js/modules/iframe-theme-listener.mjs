// iframe-theme-listener.mjs

import * as storage from './localStorage.mjs';

// 定义常量，必须与主页面 theme.mjs 中的保持一致！
const STORAGE_KEY = 'app-theme';
const THEME_CLASS_PREFIX = 'theme-';
const DARK_MODE_CLASS = 'theme-dark';

/**
 * 获取当前存储的主题名称
 * @param {string} defaultTheme - 如果没有存储的主题，则返回此默认值
 * @returns {string} 当前的主题名称
 */
export const getCurrentTheme = (defaultTheme = 'theme-indigo') => {
    return storage.get(STORAGE_KEY, defaultTheme);
};

/**
 * 获取当前存储的明暗模式
 * @param {string} defaultLuminance - 如果没有存储的模式，则返回此默认值 ('light' | 'dark')
 * @returns {string} 当前的明暗模式 ('light' | 'dark')
 */
export const getCurrentLuminance = (defaultLuminance = 'light') => {
    return storage.get(`${STORAGE_KEY}-luminance`, defaultLuminance);
};

/**
 * --- 核心 ---：一个高阶函数，用于监听主题变化并执行回调
 * @param {function} callback - 当主题或明暗模式变化时执行的回调函数
 * @param {object} [options] - 配置选项
 * @param {string} [options.defaultTheme='theme-indigo'] - 默认主题
 * @param {string} [options.defaultLuminance='light'] - 默认明暗模式
 * @returns {function} 返回一个用于停止监听的函数
 */
export function onThemeChange(callback, options = {}) {
    const {
        defaultTheme = 'theme-indigo',
        defaultLuminance = 'light'
    } = options;

    // 检查 callback 是否为函数
    if (typeof callback !== 'function') {
        console.error('[iframe-theme-listener.mjs] onThemeChange 失败：回调必须是一个函数。');
        return () => {}; // 返回一个空的取消函数
    }

    // --- 监听逻辑 ---
    // 使用 storage.on 方法 (假设你的 localStorage.mjs 实现了事件监听)
    // 我们需要分别监听两个不同的 key
    const handleThemeChange = () => {
        const theme = getCurrentTheme(defaultTheme);
        const luminance = getCurrentLuminance(defaultLuminance);
        callback({ theme, luminance });
    };

    // 初始执行一次，以获取当前状态
    handleThemeChange();

    // 订阅变化
    const unsubscribeTheme = storage.on(STORAGE_KEY, handleThemeChange);
    const unsubscribeLuminance = storage.on(`${STORAGE_KEY}-luminance`, handleThemeChange);

    // 返回一个函数，调用它可以取消所有订阅
    return () => {
        unsubscribeTheme();
        unsubscribeLuminance();
    };
}
