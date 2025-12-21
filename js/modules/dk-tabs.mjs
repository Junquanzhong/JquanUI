/**
 * 选项卡组件类
 * 支持点击切换和浮动切换两种模式
 * 完全响应式设计，支持移动端
 */
export default class Tabs {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.container - 选项卡容器选择器
     * @param {string} [options.switchMode='click'] - 切换模式 'click' | 'hover'
     * @param {number} [options.defaultActive=0] - 默认激活的选项卡索引
     * @param {boolean} [options.animation=true] - 是否启用动画
     * @param {boolean} [options.responsive=true] - 是否启用响应式
     * @param {string} [options.themeColor='#3498db'] - 主题颜色
     * @param {boolean} [options.closable=false] - 是否可关闭选项卡
     */
    constructor(options) {
        this.config = {
            container: options.container,
            switchMode: options.switchMode || 'click',
            defaultActive: options.defaultActive || 0,
            animation: options.animation !== false,
            responsive: options.responsive !== false,
            themeColor: options.themeColor || '#3498db',
            closable: options.closable || false
        };
        
        this.tabCount = 0;
        this.isInitialized = false;
        this.eventHandlers = new Map();
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        try {
            this.container = document.querySelector(this.config.container);
            if (!this.container) {
                throw new Error(`找不到容器: ${this.config.container}`);
            }

            this.tabsHeader = this.container.querySelector('.tabs');
            this.tabs = this.container.querySelectorAll('.tab');
            this.contents = this.container.querySelectorAll('.tab-content');
            this.tabCount = this.tabs.length;

            if (this.tabs.length === 0 || this.contents.length === 0) {
                throw new Error('未找到选项卡或内容区域');
            }

            this.createIndicator();
            this.setupEvents();
            this.setThemeColor(this.config.themeColor);
            this.activateTab(this.config.defaultActive);
            
            this.isInitialized = true;
            console.log('Tabs 组件初始化成功');
        } catch (error) {
            console.error('Tabs 组件初始化失败:', error);
        }
    }

        /**
     * 创建选项卡指示器
     */
    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'tab-indicator';
        this.tabsHeader.appendChild(this.indicator);
        this.updateIndicator();
    }

    /**
     * 更新指示器位置
     */
    updateIndicator() {
        const activeTab = this.tabsHeader.querySelector('.tab.active');
        if (activeTab) {
            this.indicator.style.width = activeTab.offsetWidth + 'px';
            this.indicator.style.left = activeTab.offsetLeft + 'px';
        }
    }

    /**
     * 设置事件监听
     */
    setupEvents() {
        // 清理之前的事件监听
        this.cleanupEvents();

        // 根据切换模式设置事件
        if (this.config.switchMode === 'hover') {
            this.tabs.forEach(tab => {
                const handler = () => this.activateTab(tab.dataset.tab);
                tab.addEventListener('mouseenter', handler);
                this.eventHandlers.set(tab, { type: 'mouseenter', handler });
            });
        } else {
            this.tabs.forEach(tab => {
                const handler = () => this.activateTab(tab.dataset.tab);
                tab.addEventListener('click', handler);
                this.eventHandlers.set(tab, { type: 'click', handler });
            });
        }

        // 键盘导航
        const keyHandler = (e) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                const tabIndex = parseInt(e.key) - 1;
                if (tabIndex < this.tabs.length) {
                    this.activateTab(tabIndex);
                }
            }
        };
        document.addEventListener('keydown', keyHandler);
        this.eventHandlers.set('keydown', { type: 'keydown', handler: keyHandler });

        // 窗口大小变化时更新指示器
        const resizeHandler = () => this.updateIndicator();
        window.addEventListener('resize', resizeHandler);
        this.eventHandlers.set('resize', { type: 'resize', handler: resizeHandler });
    }

    /**
     * 清理事件监听
     */
    cleanupEvents() {
        this.eventHandlers.forEach(({ type, handler }, element) => {
            if (element === 'keydown' || element === 'resize') {
                document.removeEventListener(type, handler);
            } else {
                element.removeEventListener(type, handler);
            }
        });
        this.eventHandlers.clear();
    }

    /**
     * 激活指定选项卡
     * @param {number|string} index - 选项卡索引
     */
    activateTab(index) {
        const tabIndex = parseInt(index);
        
        if (tabIndex < 0 || tabIndex >= this.tabs.length) {
            console.warn(`选项卡索引 ${tabIndex} 超出范围`);
            return;
        }

        // 移除所有激活状态
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.contents.forEach(content => content.classList.remove('active'));

        // 激活指定选项卡
        this.tabs[tabIndex].classList.add('active');
        this.contents[tabIndex].classList.add('active');

        // 更新指示器
        this.updateIndicator();

        // 触发自定义事件
        this.emit('tabChange', { 
            index: tabIndex, 
            tab: this.tabs[tabIndex], 
            content: this.contents[tabIndex] 
        });
    }

    /**
     * 设置主题颜色
     * @param {string} color - 主题颜色
     */
    setThemeColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        if (this.indicator) {
            this.indicator.style.background = color;
        }
        
        this.tabs.forEach(tab => {
            tab.style.setProperty('--primary-color', color);
        });
    }

    /**
     * 动态添加选项卡
     * @param {string} title - 选项卡标题
     * @param {string} content - 选项卡内容
     * @param {number} [position] - 插入位置，默认为最后
     * @returns {number} 新选项卡的索引
     */
    addTab(title, content, position) {
        const tabId = this.tabCount;
        const insertPosition = position !== undefined ? position : this.tabs.length;

        // 创建新选项卡
        const newTab = document.createElement('button');
        newTab.className = 'tab';
        newTab.dataset.tab = tabId;
        newTab.innerHTML = title;

        // 创建新内容区域
        const newContent = document.createElement('div');
        newContent.className = 'tab-content';
        newContent.dataset.tab = tabId;
        newContent.innerHTML = `<div class="tab-panel">${content}</div>`;

        // 插入到指定位置
        if (insertPosition >= this.tabs.length) {
            this.tabsHeader.appendChild(newTab);
            this.container.appendChild(newContent);
        } else {
            const referenceTab = this.tabs[insertPosition];
            const referenceContent = this.contents[insertPosition];
            this.tabsHeader.insertBefore(newTab, referenceTab);
            this.container.insertBefore(newContent, referenceContent);
        }

        // 更新计数和重新初始化
        this.tabCount++;
        this.tabs = this.container.querySelectorAll('.tab');
        this.contents = this.container.querySelectorAll('.tab-content');
        this.setupEvents();

        // 触发自定义事件
        this.emit('tabAdded', { 
            index: insertPosition, 
            tab: newTab, 
            content: newContent 
        });

        return insertPosition;
    }

    /**
     * 移除指定选项卡
     * @param {number} index - 要移除的选项卡索引
     * @returns {boolean} 是否成功移除
     */
    removeTab(index) {
        if (this.tabs.length <= 1) {
            console.warn('至少需要保留一个选项卡');
            return false;
        }

        if (index < 0 || index >= this.tabs.length) {
            console.warn(`选项卡索引 ${index} 超出范围`);
            return false;
        }

        const tabToRemove = this.tabs[index];
        const contentToRemove = this.contents[index];
        const wasActive = tabToRemove.classList.contains('active');

        // 移除元素
        tabToRemove.remove();
        contentToRemove.remove();

        // 更新计数和重新初始化
        this.tabCount--;
        this.tabs = this.container.querySelectorAll('.tab');
        this.contents = this.container.querySelectorAll('.tab-content');
        this.setupEvents();

        // 如果移除的是当前激活的选项卡，激活前一个
        if (wasActive) {
            const newIndex = Math.max(0, index - 1);
            this.activateTab(newIndex);
        }

        this.updateIndicator();

        // 触发自定义事件
        this.emit('tabRemoved', { index });

        return true;
    }

    /**
     * 获取当前激活的选项卡索引
     * @returns {number} 激活的选项卡索引
     */
    getActiveTabIndex() {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].classList.contains('active')) {
                return i;
            }
        }
        return 0;
    }

    /**
     * 更新组件配置
     * @param {Object} newConfig - 新的配置选项
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        if (newConfig.themeColor) {
            this.setThemeColor(newConfig.themeColor);
        }
        
        this.setupEvents();
        
        if (newConfig.defaultActive !== undefined) {
            this.activateTab(newConfig.defaultActive);
        }
    }

    /**
     * 获取当前配置
     * @returns {Object} 当前配置
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * 获取选项卡数量
     * @returns {number} 选项卡数量
     */
    getTabCount() {
        return this.tabs.length;
    }

    /**
     * 触发自定义事件
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     */
    emit(eventName, detail) {
        const event = new CustomEvent(`tabs:${eventName}`, {
            detail: {
                ...detail,
                instance: this
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 添加事件监听
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        this.container.addEventListener(`tabs:${eventName}`, callback);
    }

    /**
     * 移除事件监听
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(eventName, callback) {
        this.container.removeEventListener(`tabs:${eventName}`, callback);
    }

    /**
     * 销毁组件实例
     */
    destroy() {
        this.cleanupEvents();
        
        if (this.indicator) {
            this.indicator.remove();
        }
        
        // 移除所有自定义事件监听
        const events = ['tabChange', 'tabAdded', 'tabRemoved'];
        events.forEach(event => {
            this.container.removeEventListener(`tabs:${event}`, () => {});
        });

        this.isInitialized = false;
        console.log('Tabs 组件已销毁');
    }
}

    
