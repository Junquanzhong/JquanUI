/**
 * JquanUI Reactive Store
 * 基于 Proxy 的极简状态管理，支持订阅发布模式
 * @author Gemini-3-Pro
 * @version 1.0.0
 * @license MIT
 */

export class Store {
    constructor(initialState = {}) {
        this.listeners = new Set();
        
        // 使用 Proxy 拦截状态变更
        this.state = new Proxy(initialState, {
            set: (target, property, value) => {
                const oldValue = target[property];
                
                // 只有值真正改变时才触发
                if (oldValue !== value) {
                    target[property] = value;
                    this.notify(property, value, oldValue);
                }
                return true;
            }
        });
    }

    /**
     * 订阅状态变更
     * @param {Function} callback (key, newValue, oldValue) => void
     * @returns {Function} unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        // 返回取消订阅的函数
        return () => this.listeners.delete(callback);
    }

    /**
     * 仅监听特定 Key 的变更 (语法糖)
     * @param {String} key 
     * @param {Function} callback 
     */
    watch(key, callback) {
        return this.subscribe((prop, newVal, oldVal) => {
            if (prop === key) {
                callback(newVal, oldVal);
            }
        });
    }

    /**
     * 内部通知机制
     */
    notify(key, newVal, oldVal) {
        this.listeners.forEach(listener => listener(key, newVal, oldVal));
    }

    /**
     * 批量更新状态 (避免多次触发，虽然这里简化了，但生产环境通常需要)
     * @param {Object} newState 
     */
    setState(newState) {
        Object.assign(this.state, newState);
    }
    
    /**
     * 获取当前状态快照 (非响应式)
     */
    getSnapshot() {
        return { ...this.state };
    }
}

// 导出一个全局默认 Store 实例，方便简单应用使用
export const globalStore = new Store({
    user: null,
    theme: 'light',
    isLoading: false
});
