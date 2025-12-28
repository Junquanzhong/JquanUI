/**
 * Ultimate Tabs Component - Fixed Version
 * 修复：高度计算、左移问题、事件处理
 */
export class Tabs {
    constructor(selector, options = {}) {
        this.container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;

        if (!this.container) throw new Error('Tabs: Container not found');

        // === 配置合并 ===
        this.config = {
            mode: 'static',       // 'static' | 'fade' | 'slide'
            defaultIndex: 0,      // 默认选中索引
            autoHeight: true,     // 自适应高度
            trigger: 'click',     // 'click' | 'hover'
            duration: 300,        // 动画时长
            
            // 移动端增强
            swipeable: true, // 是否开启移动端手势切换
            swipeThreshold: 40, // 滑动阈值（像素）
            velocityThreshold: 0.3,  // 滑动速度阈值（单位：像素/毫秒）
            
            // 高级功能
            hashSync: false, // 是否开启 URL 哈希同步
            keyboard: true, // 是否开启键盘导航
            autoplay: false, // 是否开启自动播放
            interval: 3000, // 自动播放间隔（毫秒）
            pauseOnHover: true, // 是否在悬停时暂停自动播放
            
            // 钩子
            onChange: null,
            ...options
        };

        // === 内部状态 ===
        this.state = {
            currentIndex: -1, // 改为 -1，表示未初始化
            isAnimating: false,
            timer: null,
            touch: {
                startX: 0, 
                startY: 0, 
                startTime: 0,
                isDragging: false, 
                width: 0, 
                currentTranslate: 0
            }
        };

        // 绑定上下文
        this._bindMethods();
        this.init();
    }

    _bindMethods() {
        const methods = [
            'handleNavClick', 'handleNavHover', 'handleKeydown',
            'handleTouchStart', 'handleTouchMove', 'handleTouchEnd',
            'next', 'stopAutoplay', 'startAutoplay'
        ];
        methods.forEach(method => {
            if (this[method]) this[method] = this[method].bind(this);
        });
    }

    init() {
        // 1. DOM 准备
        this.nav = this.container.querySelector('.tabs-nav');
        if (!this.nav) return;
        
        this.navItems = Array.from(this.nav.querySelectorAll('.tabs-item'));
        this.content = this.container.querySelector('.tabs-content');
        
        if (!this.content || !this.navItems.length) return;

        // 设置模式 class 和 CSS 变量
        this.container.classList.add(`tabs-mode-${this.config.mode}`);
        this.container.style.setProperty('--tab-duration', `${this.config.duration}ms`);

        // 2. 映射面板
        this.panels = this._mapNavToPanels();
        if (!this.panels.length) return;

        // 3. Slide 模式结构调整
        if (this.config.mode === 'slide') {
            this._setupSlideStructure();
        }

        // 4. 计算初始索引
        let initIndex = this.config.defaultIndex;
        if (this.config.hashSync && window.location.hash) {
            const hash = window.location.hash;
            const hashIndex = this.panels.findIndex(p => p && `#${p.id}` === hash);
            if (hashIndex !== -1) initIndex = hashIndex;
        }
        
        // 确保索引有效
        initIndex = Math.max(0, Math.min(initIndex, this.panels.length - 1));

        // 5. 事件绑定
        this._bindEvents();

        // 6. 无障碍设置
        this._setupA11y();

        // 7. 【重要】禁用自动高度计算，改用 CSS 自然流动
        if (this.config.autoHeight && this.config.mode !== 'slide') {
            // 对于 static/fade 模式，不需要固定高度
            // 让内容自然撑开即可
            this.content.style.height = 'auto';
        }

        // 8. 初始激活（无动画）
        this._activateImmediate(initIndex);

        // 9. 自动播放
        if (this.config.autoplay) this.startAutoplay();
    }

    _mapNavToPanels() {
        const allPanels = Array.from(this.content.querySelectorAll('.tabs-panel'));
        
        return this.navItems.map((item, index) => {
            let panel = null;
            
            if (item.dataset.tabTarget) {
                // 优先使用 data-tab-target 指定的面板
                panel = this.container.querySelector(item.dataset.tabTarget);
            }
            
            if (!panel && allPanels[index]) {
                // 降级：按顺序匹配
                panel = allPanels[index];
            }
            
            // 确保面板有 ID
            if (panel && !panel.id) {
                panel.id = `tab-panel-${Date.now()}-${index}`;
            }
            
            return panel;
        });
    }

    _setupSlideStructure() {
        let track = this.content.querySelector('.tabs-track');
        
        if (!track) {
            track = document.createElement('div');
            track.className = 'tabs-track';
            
            // 只移动有效的 panel
            this.panels.forEach(p => {
                if (p) track.appendChild(p);
            });
            
            this.content.appendChild(track);
        }
        
        this.track = track;
    }

    _bindEvents() {
        // 导航点击/悬停
        this.navItems.forEach((item, index) => {
            // 存储索引到 dataset，更可靠
            item.dataset.tabIndex = index;
            
            if (this.config.trigger === 'hover') {
                item.addEventListener('mouseenter', this.handleNavHover);
            } else {
                item.addEventListener('click', this.handleNavClick);
            }
        });

        // 键盘
        if (this.config.keyboard) {
            this.nav.addEventListener('keydown', this.handleKeydown);
        }

        // 触摸
        if (this.config.swipeable) {
            this.content.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            this.content.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.content.addEventListener('touchend', this.handleTouchEnd);
        }

        // 自动播放悬停暂停
        if (this.config.autoplay && this.config.pauseOnHover) {
            this.container.addEventListener('mouseenter', this.stopAutoplay);
            this.container.addEventListener('mouseleave', this.startAutoplay);
        }
    }

    _setupA11y() {
        this.nav.setAttribute('role', 'tablist');
        
        this.navItems.forEach((item, index) => {
            // 确保导航项有 ID
            if (!item.id) item.id = `tab-nav-${Date.now()}-${index}`;
            
            item.setAttribute('role', 'tab');
            
            const panel = this.panels[index];
            if (panel) {
                panel.setAttribute('role', 'tabpanel');
                item.setAttribute('aria-controls', panel.id);
                panel.setAttribute('aria-labelledby', item.id);
            }
        });
    }

    /* ================= 激活逻辑 ================= */

    /**
     * 立即激活（无动画），用于初始化
     */
    _activateImmediate(index) {
        // 更新导航状态
        this.navItems.forEach((item, i) => {
            const isActive = i === index;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-selected', String(isActive));
            item.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // 更新面板状态
        if (this.config.mode === 'slide') {
            // Slide 模式：直接定位
            this.panels.forEach((p, i) => {
                if (p) p.classList.toggle('is-active', i === index);
            });
            if (this.track) {
                this.track.style.transition = 'none';
                this.track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
            }
        } else {
            // Static/Fade 模式
            this.panels.forEach((p, i) => {
                if (!p) return;
                if (i === index) {
                    p.classList.add('is-active');
                    // 移除可能的动画，直接显示
                    p.style.animation = 'none';
                    p.style.opacity = '1';
                } else {
                    p.classList.remove('is-active');
                }
            });
        }

        this.state.currentIndex = index;
    }

    /**
     * 带动画激活
     */
    async activate(index, animate = true) {
        if (!this.panels.length) return;
        
        // 循环处理
        const len = this.panels.length;
        index = ((index % len) + len) % len;

        // 防止重复激活和动画中切换
        if (index === this.state.currentIndex && !this.state.touch.isDragging) return;
        if (this.state.isAnimating) return;

        this.state.isAnimating = true;
        const prevIndex = this.state.currentIndex;

        // 1. 更新导航 UI（不使用 scrollIntoView 的自动滚动）
        this._updateNavState(index);

        // 2. Hash 同步
        if (this.config.hashSync) {
            const id = this.panels[index]?.id;
            if (id) history.replaceState(null, null, `#${id}`);
        }

        // 3. 切换内容
        await this._switchContent(index, prevIndex, animate);

        // 4. 更新状态
        this.state.currentIndex = index;
        this.state.isAnimating = false;

        // 5. 回调
        if (this.config.onChange) {
            this.config.onChange(index, this.panels[index]);
        }
    }

    _updateNavState(index) {
        this.navItems.forEach((item, i) => {
            const isActive = i === index;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-selected', String(isActive));
            item.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // 【修复】使用更安全的滚动方式，只滚动导航容器，不影响页面
        const activeItem = this.navItems[index];
        if (activeItem && this.nav.scrollTo) {
            const navRect = this.nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            
            // 计算需要滚动的距离
            const scrollLeft = this.nav.scrollLeft + (itemRect.left - navRect.left) 
                              - (navRect.width / 2) + (itemRect.width / 2);
            
            this.nav.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }

    async _switchContent(index, prevIndex, animate) {
        if (this.config.mode === 'slide') {
            return this._switchSlide(index, animate);
        } else {
            return this._switchStaticOrFade(index, prevIndex, animate);
        }
    }

    _switchStaticOrFade(index, prevIndex, animate) {
        return new Promise(resolve => {
            // 移除旧面板的激活状态
            this.panels.forEach((p, i) => {
                if (!p) return;
                
                if (i === index) {
                    // 重置样式让 CSS 动画生效
                    p.style.animation = '';
                    p.style.opacity = '';
                    p.classList.add('is-active');
                } else {
                    p.classList.remove('is-active');
                }
            });

            // 等待动画完成
            if (animate) {
                setTimeout(resolve, this.config.duration);
            } else {
                resolve();
            }
        });
    }

    _switchSlide(index, animate) {
        return new Promise(resolve => {
            if (!this.track) {
                resolve();
                return;
            }

            const translateX = -index * 100;

            if (animate) {
                this.track.style.transition = `transform ${this.config.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            } else {
                this.track.style.transition = 'none';
            }

            // 强制重绘
            void this.track.offsetHeight;
            
            this.track.style.transform = `translate3d(${translateX}%, 0, 0)`;

            // 更新面板激活状态
            this.panels.forEach((p, i) => {
                if (p) p.classList.toggle('is-active', i === index);
            });

            if (animate) {
                setTimeout(resolve, this.config.duration);
            } else {
                resolve();
            }
        });
    }

    /* ================= 事件处理 ================= */

    handleNavClick(e) {
        e.preventDefault();
        const item = e.currentTarget;
        const index = parseInt(item.dataset.tabIndex, 10);
        
        if (!isNaN(index)) {
            this.stopAutoplay();
            this.activate(index);
        }
    }

    handleNavHover(e) {
        const item = e.currentTarget;
        const index = parseInt(item.dataset.tabIndex, 10);
        
        if (!isNaN(index)) {
            this.stopAutoplay();
            this.activate(index);
        }
    }

    handleKeydown(e) {
        const key = e.key;
        let newIndex = this.state.currentIndex;

        switch (key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                newIndex--;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                newIndex++;
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = this.panels.length - 1;
                break;
            default:
                return;
        }

        e.preventDefault();
        this.stopAutoplay();
        this.activate(newIndex);
        
        // 焦点跟随
        const targetItem = this.navItems[((newIndex % this.panels.length) + this.panels.length) % this.panels.length];
        if (targetItem) targetItem.focus();
    }

    /* ================= 触摸处理 ================= */

    handleTouchStart(e) {
        if (this.state.isAnimating) return;
        this.stopAutoplay();

        const touch = e.touches[0];
        Object.assign(this.state.touch, {
            startX: touch.clientX,
            startY: touch.clientY,
            startTime: Date.now(),
            isDragging: true,
            width: this.content.offsetWidth,
            currentTranslate: -this.state.currentIndex * 100
        });

        if (this.config.mode === 'slide' && this.track) {
            this.track.style.transition = 'none';
        }
    }

    handleTouchMove(e) {
        const { touch } = this.state;
        if (!touch.isDragging) return;

        const currentTouch = e.touches[0];
        const diffX = currentTouch.clientX - touch.startX;
        const diffY = currentTouch.clientY - touch.startY;

        // 判断滑动方向
        if (Math.abs(diffY) > Math.abs(diffX)) {
            touch.isDragging = false;
            return;
        }

        if (e.cancelable) e.preventDefault();

        if (this.config.mode === 'slide' && this.track) {
            let movePercent = (diffX / touch.width) * 100;
            
            // 边界阻尼
            const isAtStart = this.state.currentIndex === 0 && diffX > 0;
            const isAtEnd = this.state.currentIndex === this.panels.length - 1 && diffX < 0;
            
            if (isAtStart || isAtEnd) {
                movePercent *= 0.3;
            }

            const translateX = touch.currentTranslate + movePercent;
            this.track.style.transform = `translate3d(${translateX}%, 0, 0)`;
        }
    }

    handleTouchEnd(e) {
        const { touch } = this.state;
        if (!touch.isDragging) return;
        touch.isDragging = false;

        const changedTouch = e.changedTouches[0];
        const diffX = changedTouch.clientX - touch.startX;
        const timeDiff = Date.now() - touch.startTime;
        const absDiff = Math.abs(diffX);
        
        const velocity = absDiff / timeDiff;
        const isFlick = velocity > this.config.velocityThreshold && absDiff > 10;
        const isSwipe = absDiff > this.config.swipeThreshold;

        let targetIndex = this.state.currentIndex;

        if (isSwipe || isFlick) {
            if (diffX > 0 && this.state.currentIndex > 0) {
                targetIndex--;
            } else if (diffX < 0 && this.state.currentIndex < this.panels.length - 1) {
                targetIndex++;
            }
        }

        this.activate(targetIndex);

        if (this.config.autoplay && !this.config.pauseOnHover) {
            this.startAutoplay();
        }
    }

    /* ================= 自动播放 ================= */

    startAutoplay() {
        this.stopAutoplay();
        this.state.timer = setInterval(this.next, this.config.interval);
    }

    stopAutoplay() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }

    next() {
        this.activate(this.state.currentIndex + 1);
    }

    prev() {
        this.activate(this.state.currentIndex - 1);
    }

    /* ================= 公共 API ================= */

    goTo(index) {
        this.activate(index);
    }

    getCurrentIndex() {
        return this.state.currentIndex;
    }

    /* ================= 销毁 ================= */

    destroy() {
        this.stopAutoplay();

        this.navItems.forEach(item => {
            item.removeEventListener('click', this.handleNavClick);
            item.removeEventListener('mouseenter', this.handleNavHover);
        });

        if (this.config.keyboard) {
            this.nav.removeEventListener('keydown', this.handleKeydown);
        }

        if (this.config.swipeable) {
            this.content.removeEventListener('touchstart', this.handleTouchStart);
            this.content.removeEventListener('touchmove', this.handleTouchMove);
            this.content.removeEventListener('touchend', this.handleTouchEnd);
        }

        this.container.removeEventListener('mouseenter', this.stopAutoplay);
        this.container.removeEventListener('mouseleave', this.startAutoplay);

        // 清理 class
        this.container.classList.remove(`tabs-mode-${this.config.mode}`);
    }
}
