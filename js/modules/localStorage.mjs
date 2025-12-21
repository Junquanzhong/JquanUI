// localStorage.mjs

// 一个私有对象，用来存储所有订阅的回调函数
const subscribers = {};

/**
 * 触发自定义事件，供内部 set 方法使用
 * @param {string} key - 变化的键
 * @param {*} newValue - 新值
 * @param {*} oldValue - 旧值
 */
const triggerEvent = (key, newValue, oldValue) => {
    if (subscribers[key]) {
        subscribers[key].forEach(callback => {
            callback(newValue, oldValue);
        });
    }
};

/**
 * 设置 localStorage 并触发自定义事件
 * @param {string} key - 键
 * @param {any} value - 值
 */
export const set = (key, value) => {
    const oldValue = localStorage.getItem(key);
    const stringifiedValue = JSON.stringify(value);
    localStorage.setItem(key, stringifiedValue);
    // 触发事件，通知所有订阅者
    triggerEvent(key, value, JSON.parse(oldValue));
};

/**
 * 获取 localStorage 值
 * @param {string} key - 键
 * @param {any} defaultValue - 默认值
 * @returns {any}
 */
export const get = (key, defaultValue = null) => {
    const item = localStorage.getItem(key);
    if (item === null) {
        return defaultValue;
    }
    try {
        return JSON.parse(item);
    } catch (e) {
        console.error(`Error parsing localStorage item "${key}":`, e);
        return item; // 如果解析失败，返回原始字符串
    }
};

/**
 * 删除 localStorage 项
 * @param {string} key - 键
 */
export const remove = (key) => {
    const oldValue = localStorage.getItem(key);
    localStorage.removeItem(key);
    triggerEvent(key, null, JSON.parse(oldValue));
};

/**
 * === 核心新增功能 ===
 * 订阅某个键的变化
 * @param {string} key - 要监听的 localStorage 键
 * @param {function} callback - 当键值变化时执行的回调函数 (newValue, oldValue) => {}
 * @returns {function} 返回一个取消订阅的函数
 */
export const on = (key, callback) => {
    if (!subscribers[key]) {
        subscribers[key] = [];
    }
    subscribers[key].push(callback);

    // 返回一个函数，用于取消订阅
    const unsubscribe = () => {
        if (subscribers[key]) {
            subscribers[key] = subscribers[key].filter(cb => cb !== callback);
            if (subscribers[key].length === 0) {
                delete subscribers[key];
            }
        }
    };
    return unsubscribe;
};

// 监听来自其他标签页或 iframe 的原生 'storage' 事件
window.addEventListener('storage', (event) => {
    // 当同一个域的另一个页面修改了 localStorage
    if (event.key && subscribers[event.key]) {
        let newValue = null;
        let oldValue = null;
        try {
            newValue = event.newValue ? JSON.parse(event.newValue) : null;
            oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
        } catch(e) {
            // 如果不是JSON格式，直接使用原始值
            newValue = event.newValue;
            oldValue = event.oldValue;
        }
        // 触发我们自己的订阅者
        triggerEvent(event.key, newValue, oldValue);
    }
});
