// 选项卡模块 - 多实例支持版
export class Tabs {
    constructor(selector, options = {}) {
        // 存储选择器和配置
        this.selector = selector;
        this.config = {
            trigger: options.trigger || 'click',
            swipeable: options.swipeable !== undefined ? options.swipeable : true,
            lazy: options.lazy !== undefined ? options.lazy : false,
            animation: options.animation || 'slide',
            duration: options.duration || 500,
            bound: options.bound !== undefined ? options.bound : false,
            itemCLS: options.itemCLS || 'tabs-item',
            activeCLS: options.activeCLS || 'tabs-active',
            navCLS: options.navCLS || 'tabs-nav',
            contentCLS: options.contentCLS || 'tabs-content',
            trackCLS: options.trackCLS || 'tabs-track',
            panelCLS: options.panelCLS || 'tabs-panel',
            ...options
        };

        // 初始化元素引用（严格限定在当前容器内）
        this.container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
            
        if (!this.container) {
            console.error(`Tabs: 容器 "${selector}" 未找到`);
            return;
        }

        // 限定查询范围，避免跨容器干扰
        this.nav = this.container.querySelector(`.${this.config.navCLS}`);
        this.navItems = this.nav?.querySelectorAll(`.${this.config.itemCLS}`) || [];
        this.content = this.container.querySelector(`.${this.config.contentCLS}`);
        this.track = this.content?.querySelector(`.${this.config.trackCLS}`);
        this.panels = this.track?.querySelectorAll(`.${this.config.panelCLS}`) || [];

        // 验证必要元素是否存在
        if (!this.nav || !this.content || !this.track || this.panels.length === 0) {
            console.error(`Tabs: 容器 "${selector}" 缺少必要的子元素`);
            return;
        }

        // 实例唯一标识（用于事件处理）
        this.instanceId = `tabs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 状态变量
        this.currentIndex = 0;
        this.isAnimating = false;
        this.startX = 0;
        this.currentX = 0;
        this.isSwiping = false;
        this.isDestroyed = false;

        // 初始化
        this.init();
    }

    init() {
        // 为当前实例添加唯一类名，避免样式冲突
        this.container.classList.add(this.instanceId);
        
        // 设置基础样式
        this.setupStyles();
        
        // 绑定事件（带实例隔离）
        this.bindEvents();
        
        // 初始化显示第一个选项卡
        this.switchTo(0, false);
        
        // 触发初始化完成事件
        this.container.dispatchEvent(new CustomEvent('tabs:init', {
            detail: { instance: this, instanceId: this.instanceId }
        }));
    }

    setupStyles() {
        // 设置轨道和面板样式（只影响当前实例）
        this.track.classList.add('flex');
        this.track.classList.add('transition-transform','duration-'+this.config.duration);
        //this.track.style.transition = `transform ${this.config.duration}ms ease`;
        
        this.panels.forEach(panel => {
            panel.classList.add('col-12','w-full','shrink-0');
        });

        // 设置内容区域溢出隐藏
        this.content.classList.add('overflow-hidden','relative');

        // 确保轨道足够宽以容纳所有面板
        //this.track.style.width = `${this.panels.length * 100}%`;
        
        // 如果是淡入淡出动画，设置初始透明度
        if (this.config.animation === 'fade') {
            this.panels.forEach((panel, index) => {
                panel.style.opacity = index === 0 ? '1' : '0';
                panel.classList.add('absolute','top-0','left-0','w-full');
                panel.style.transition = `opacity ${this.config.duration}ms ease`;
            });
        }
    }

    bindEvents() {
        // 导航项事件（带实例检查）
        this.navItems.forEach((item, index) => {
            const eventHandler = (e) => {
                // 确保事件来自当前实例
                if (!this.container.contains(e.target)) return;
                
                if (this.config.trigger === 'hover') {
                    this.switchTo(index);
                } else {
                    e.preventDefault();
                    this.switchTo(index);
                }
            };

            item.addEventListener('click', eventHandler);
            if (this.config.trigger === 'hover') {
                item.addEventListener('mouseenter', eventHandler);
            }
            
            // 存储事件处理器引用以便清理
            item._tabsEventHandler = eventHandler;
        });

        // 滑动事件（带实例隔离）
        if (this.config.swipeable) {
            this.bindSwipeEvents();
        }

        // 窗口大小变化事件
        this._resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this._resizeHandler);
    }

    bindSwipeEvents() {
        const touchStartHandler = (e) => {
            if (!this.container.contains(e.target)) return;
            
            this.startX = e.touches[0].clientX;
            this.currentX = this.startX;
            this.isSwiping = true;
            this.track.style.transition = 'none';
        };

        const touchMoveHandler = (e) => {
            if (!this.isSwiping || !this.container.contains(e.target)) return;
            
            const deltaX = e.touches[0].clientX - this.currentX;
            this.currentX = e.touches[0].clientX;
            
            if (Math.abs(deltaX) > 5) {
                this.updateTrackPosition(deltaX);
            }
        };

        const touchEndHandler = (e) => {
            if (!this.isSwiping || !this.container.contains(e.target)) return;
            
            this.isSwiping = false;
            //this.track.style.transition = `transform ${this.config.duration}ms ease`;
            this.track.classList.remove('transition-transform','duration-'+this.config.duration);
            
            const deltaX = this.currentX - this.startX;
            const threshold = 50;
            
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.prev();
                } else {
                    this.next();
                }
            } else {
                this.switchTo(this.currentIndex);
            }
        };

        this.track.addEventListener('touchstart', touchStartHandler, { passive: true });
        this.track.addEventListener('touchmove', touchMoveHandler, { passive: true });
        this.track.addEventListener('touchend', touchEndHandler);
        
        // 存储事件处理器以便清理
        this._swipeHandlers = { touchStartHandler, touchMoveHandler, touchEndHandler };
    }

    updateTrackPosition(deltaX) {
        const currentPosition = -this.currentIndex * 100;
        const panelWidth = 100 / this.panels.length;
        const newPosition = currentPosition + (deltaX / this.track.offsetWidth) * 100;
        this.track.style.transform = `translateX(${newPosition}%)`;
    }

    switchTo(index, animate = true) {
        if (this.isAnimating || index === this.currentIndex || this.isDestroyed) return;

        // 边界检查
        if (index < 0 || index >= this.navItems.length) {
            if (this.config.bound) {
                index = index < 0 ? this.navItems.length - 1 : 0;
            } else {
                return;
            }
        }

        this.isAnimating = true;

        // 更新导航激活状态
        this.updateNavActive(index);

        // 执行切换动画
        this.performAnimation(index, animate);

        // 触发切换事件
        this.container.dispatchEvent(new CustomEvent('tabs:switch', {
            detail: { 
                instance: this,
                instanceId: this.instanceId,
                fromIndex: this.currentIndex,
                toIndex: index
            }
        }));

        this.currentIndex = index;
        
        // 动画结束后重置状态
        if (animate) {
            setTimeout(() => {
                this.isAnimating = false;
            }, this.config.duration);
        } else {
            this.isAnimating = false;
        }
    }

    updateNavActive(index) {
        this.navItems.forEach((item, i) => {
            item.classList.toggle(this.config.activeCLS, i === index);
        });
    }

    performAnimation(index, animate) {
        const transition = animate ? `transform ${this.config.duration}ms ease` : 'none';
        
        if (!animate) {
            //this.track.style.transition = 'none';
            this.track.classList.remove('transition-transform','duration-'+this.config.duration);
        }

        switch (this.config.animation) {
            case 'slide':
                this.track.style.transform = `translateX(-${index * 100}%)`;
                if (animate) {
                    //this.track.style.transition = transition;
                    this.track.classList.add('transition-transform','duration-'+this.config.duration);
                }
                break;
                
            case 'fade':
                this.panels.forEach((panel, i) => {
                    panel.style.opacity = i === index ? '1' : '0';
                    if (animate) {
                        //panel.style.transition = `opacity ${this.config.duration}ms ease`;
                        panel.classList.add('transition-opacity','duration-'+this.config.duration);
                    }
                });
                break;
                
            default:
                this.track.style.transform = `translateX(-${index * 100}%)`;
                if (animate) {
                    //this.track.style.transition = transition;
                    this.track.classList.add('transition-transform','duration-'+this.config.duration);
                }
        }
    }

    next() {
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.navItems.length && !this.config.bound) {
            nextIndex = this.navItems.length - 1;
        }
        this.switchTo(nextIndex);
    }

    prev() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0 && !this.config.bound) {
            prevIndex = 0;
        }
        this.switchTo(prevIndex);
    }

    handleResize() {
        // 确保在窗口大小变化时布局正确
        if (this.config.animation === 'slide') {
            this.track.style.width = `${this.panels.length * 100}%`;
            this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
    }

    // 公共方法
    updateContent(index, content) {
        if (index >= 0 && index < this.panels.length) {
            this.panels[index].innerHTML = content;
            this.container.dispatchEvent(new CustomEvent('tabs:content-updated', {
                detail: { instance: this, index, content }
            }));
        }
    }

    addPanel(title, content, index = null) {
        // 创建新的导航项
        const newNavItem = document.createElement('div');
        newNavItem.className = this.config.itemCLS;
        newNavItem.textContent = title;
        this.nav.appendChild(newNavItem);
        
        // 创建新的面板
        const newPanel = document.createElement('div');
        newPanel.className = this.config.panelCLS;
        newPanel.innerHTML = content;
        this.track.appendChild(newPanel);
        
        // 更新引用
        this.navItems = this.nav.querySelectorAll(`.${this.config.itemCLS}`);
        this.panels = this.track.querySelectorAll(`.${this.config.panelCLS}`);
        
        // 重新绑定事件
        this.bindEvents();
        
        // 更新轨道宽度
        this.track.style.width = `${this.panels.length * 100}%`;
        
        // 触发添加事件
        this.container.dispatchEvent(new CustomEvent('tabs:panel-added', {
            detail: { instance: this, title, content, index }
        }));
    }

    removePanel(index) {
        if (index < 0 || index >= this.navItems.length) return;
        
        // 移除导航项和面板
        this.navItems[index].remove();
        this.panels[index].remove();
        
        // 更新引用
        this.navItems = this.nav.querySelectorAll(`.${this.config.itemCLS}`);
        this.panels = this.track.querySelectorAll(`.${this.config.panelCLS}`);
        
        // 调整当前索引
        if (this.currentIndex >= this.panels.length) {
            this.currentIndex = this.panels.length - 1;
        }
        
        // 重新绑定事件
        this.bindEvents();
        
        // 更新轨道宽度
        this.track.style.width = `${this.panels.length * 100}%`;
        
        // 触发移除事件
        this.container.dispatchEvent(new CustomEvent('tabs:panel-removed', {
            detail: { instance: this, index }
        }));
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getTotalPanels() {
        return this.panels.length;
    }

    destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        
        // 清理事件监听器
        this.navItems.forEach(item => {
            if (item._tabsEventHandler) {
                item.removeEventListener('click', item._tabsEventHandler);
                item.removeEventListener('mouseenter', item._tabsEventHandler);
            }
        });
        
        if (this._swipeHandlers) {
            this.track.removeEventListener('touchstart', this._swipeHandlers.touchStartHandler);
            this.track.removeEventListener('touchmove', this._swipeHandlers.touchMoveHandler);
            this.track.removeEventListener('touchend', this._swipeHandlers.touchEndHandler);
        }
        
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
        
        // 移除实例类名
        this.container.classList.remove(this.instanceId);
        
        // 触发销毁事件
        this.container.dispatchEvent(new CustomEvent('tabs:destroy', {
            detail: { instance: this, instanceId: this.instanceId }
        }));
    }
}

// 自动初始化函数（支持批量初始化）
export function initTabs(selectors, options = {}) {
    if (typeof selectors === 'string') {
        // 单个选择器
        return new Tabs(selectors, options);
    } else if (Array.isArray(selectors)) {
        // 多个选择器
        return selectors.map(selector => new Tabs(selector, options));
    } else {
        console.error('initTabs: 选择器必须是字符串或数组');
        return null;
    }
}
