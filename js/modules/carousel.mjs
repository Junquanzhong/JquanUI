/*
* carousel.mjs
* 生产级滑块轮播组件 - 优化版
* @author Gemini-3-Pro
* @version 3.0.0
* @license MIT
*/
// Carousel.mjs - 生产级最终版 (v3.1)
export default class Carousel {
  constructor(options) {
    this.config = {
      container: '.carousel',
      direction: 'horizontal', // 'horizontal' | 'vertical'
      autoplay: true,          // 是否自动播放
      interval: 3000,          // 自动播放间隔 ms
      speed: 400, // 切换动画时长(ms)
      indicators: true,        // 是否显示指示器
      arrows: true,            // 是否显示左右切换箭头
      pauseOnHover: true,      // 是否在悬停时暂停自动播放
      infinite: true,          // 是否启用无限循环
      visibleCount: 1,         // 可见滑块数量
      slidesPerScroll: 1, // 每次切换几个
      gap: 0, // 间距，支持数字或 'gap-4'
      dragThreshold: 50, // 拖拽切换阈值
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // 动画 easing 函数
      onChange: null, // 回调: (index, element) => {}
      ...options
    };

    // 内部状态
    this.state = {
      currentIndex: 0,
      isDragging: false,
      isAnimating: false,
      autoPlayTimer: null,
      containerWidth: 0,
      slideWidth: 0,
      totalMoveSize: 0,
    };

    // 触摸物理状态
    this.touch = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      diff: 0,
      directionLocked: false // 方向锁：防止并在轮播时误触发页面滚动
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.container = typeof this.config.container === 'string' 
      ? document.querySelector(this.config.container) 
      : this.config.container;

    if (!this.container) {
      console.error('Carousel Error: Container not found');
      return;
    }

    // 1. 解析配置
    this.gapSize = this._parseGap(this.config.gap);

    // 2. 构建 DOM 结构 (核心：适配你的 HTML/CSS)
    this._setupStructure();

    // 3. 计算尺寸
    this._updateDimensions();

    // 4. 绑定事件 (触摸、Resize、Hover)
    this._bindEvents();

    // 5. 初始化位置 (处理无限循环的初始偏移)
    if (this.config.infinite) {
      this.state.currentIndex = this.config.visibleCount;
      this._updateTrackPosition(false);
    }

    // 6. 启动
    if (this.config.autoplay) this.play();
    
    // 标记初始化完成
    this.container.classList.add('carousel-ready');
  }

  /**
   * 核心逻辑：结构重组
   * 将 .carousel-item 的内容提取到 .carousel-slide 中
   * 并处理无限循环所需的克隆
   */
  _setupStructure() {
    // 保存原始 HTML 以便 destroy() 恢复
    this.originalHtml = this.container.innerHTML;
    
    // 获取原始数据项
    const rawItems = Array.from(this.container.querySelectorAll('.carousel-item'));
    this.realSlideCount = rawItems.length;

    if (this.realSlideCount === 0) return;

    // 清空容器，应用基础样式
    this.container.innerHTML = '';
    // group 用于 hover 检测
    this.container.classList.add('group'); 

    // 创建轨道
    this.track = document.createElement('div');
    this.track.className = 'carousel-track';
    // 强制内联样式确保布局正确
    this.track.classList.add('flex','w-full','h-full','relative');
    this.track.style.willChange = 'transform';
  

    if (this.config.direction === 'vertical') {
      this.track.style.flexDirection = 'column';
    }

    // 准备要渲染的节点列表（包含克隆项）
    let itemsProcess = [...rawItems];

    if (this.config.infinite && this.realSlideCount > this.config.visibleCount) {
      // 头部克隆 (取原来的最后几项)
      const clonesStart = rawItems.slice(-this.config.visibleCount).map(el => this._cloneNode(el));
      // 尾部克隆 (取原来的前几项)
      const clonesEnd = rawItems.slice(0, this.config.visibleCount).map(el => this._cloneNode(el));
      
      itemsProcess = [...clonesStart, ...rawItems, ...clonesEnd];
    }

    // 渲染 Slide
    itemsProcess.forEach((sourceItem) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      
      // 样式关键点：
      // 1. relative: 为了让 absolute 的 caption 能够定位
      // 2. height: 100% : 继承容器高度 (由你的 CSS @media 控制)
      // 3. flex-shrink-0: 防止被挤压
      slide.classList.add('relative','h-full','flex-shrink-0','overflow-hidden');
      
      // 如果是克隆项，标记 aria-hidden
      if (sourceItem.hasAttribute('aria-hidden')) {
        slide.setAttribute('aria-hidden', 'true');
        slide.classList.add('is-clone');
      }

      // 【内容转移】: 提取原 .carousel-item 里的所有内容 (img, caption)
      // 使用 cloneNode(true) 避免移动原始节点导致引用丢失，
      // 如果是 rawItems 本身，则需要移动子元素
      if (sourceItem.classList.contains('is-clone-source')) {
         // 这是一个我们手动标记的克隆源，直接 append 内容
         while (sourceItem.firstChild) slide.appendChild(sourceItem.firstChild);
      } else {
         // 这是一个原始 DOM 节点，我们需要移动它的子元素
         // 注意：如果是 itemsProcess 里的原生节点，需要小心处理
         // 为了简单稳健，我们直接把 sourceItem 的 innerHTML 拿过来
         slide.innerHTML = sourceItem.innerHTML;
      }

      this.track.appendChild(slide);
    });

    this.container.appendChild(this.track);
    this.slides = Array.from(this.track.children);

    // 添加 UI 组件
    if (this.config.indicators) this._createIndicators();
    if (this.config.arrows) this._createArrows();
  }

  // 辅助克隆函数
  _cloneNode(el) {
    const clone = el.cloneNode(true);
    clone.classList.add('is-clone-source'); // 标记这是克隆源
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  }

  _parseGap(gap) {
    if (typeof gap === 'number') return gap;
    if (typeof gap === 'string' && gap.startsWith('gap-')) {
      const val = gap.replace('gap-', '');
      return parseFloat(val) * 4 || 0; // 假设 1 unit = 4px (Tailwind 标准)
    }
    return 0;
  }

  /**
   * 尺寸计算
   * 依赖容器的 CSS 宽度/高度
   */
  _updateDimensions() {
    const rect = this.container.getBoundingClientRect();
    this.state.containerWidth = rect.width;
    this.state.containerHeight = rect.height;

    const isHorizontal = this.config.direction === 'horizontal';
    const trackSize = isHorizontal ? this.state.containerWidth : this.state.containerHeight;
    
    // 计算单个 Slide 宽度
    const totalGapSpace = this.gapSize * (this.config.visibleCount - 1);
    const itemSize = (trackSize - totalGapSpace) / this.config.visibleCount;
    
    this.state.slideWidth = itemSize;
    this.state.totalMoveSize = itemSize + this.gapSize; // 移动步长

    // 应用尺寸到 Slide
    this.slides.forEach(slide => {
      if (isHorizontal) {
        slide.style.width = `${itemSize}px`;
        slide.style.marginRight = `${this.gapSize}px`;
      } else {
        slide.style.height = `${itemSize}px`;
        slide.style.marginBottom = `${this.gapSize}px`;
        slide.classList.add('w-full');
      }
    });

    // 重新校准位置 (无动画)
    this._updateTrackPosition(false);
  }

  _updateTrackPosition(animate = true, overrideOffset = null) {
    const isHorizontal = this.config.direction === 'horizontal';
    
    // 计算基础偏移
    let offset = -(this.state.currentIndex * this.state.totalMoveSize);

    // 叠加拖拽偏移
    if (overrideOffset !== null) {
      offset += overrideOffset;
    }

    const translate = isHorizontal 
      ? `translate3d(${offset}px, 0, 0)` 
      : `translate3d(0, ${offset}px, 0)`;

    if (animate) {
      this.track.style.transition = `transform ${this.config.speed}ms ${this.config.easing}`;
      this.state.isAnimating = true;
    } else {
      this.track.style.transition = 'none';
      this.state.isAnimating = false;
    }

    this.track.style.transform = translate;
  }

  // --- 交互逻辑 ---

  goTo(index, animate = true) {
    if (index === this.state.currentIndex) return;
    
    this.state.currentIndex = index;
    this._updateTrackPosition(animate);
    this._updateIndicators();
    this._updateArrowsState();
  }

  next() {
    const step = this.config.slidesPerScroll;
    
    if (this.config.infinite) {
      this.goTo(this.state.currentIndex + step);
    } else {
      const max = this.slides.length - this.config.visibleCount;
      const nextIdx = Math.min(this.state.currentIndex + step, max);
      if (this.state.currentIndex < nextIdx) this.goTo(nextIdx);
    }
  }

  prev() {
    const step = this.config.slidesPerScroll;
    
    if (this.config.infinite) {
      this.goTo(this.state.currentIndex - step);
    } else {
      const prevIdx = Math.max(this.state.currentIndex - step, 0);
      if (this.state.currentIndex > prevIdx) this.goTo(prevIdx);
    }
  }

  // --- 事件处理 ---

  _bindEvents() {
    // 1. 无缝循环重置
    this.track.addEventListener('transitionend', () => {
        if (!this.state.isAnimating) return;
        this.state.isAnimating = false;
        
        if (this.config.infinite) {
            const visible = this.config.visibleCount;
            const realCount = this.realSlideCount;
            
            // 越过右边界 -> 跳回开头
            if (this.state.currentIndex >= realCount + visible) {
                const diff = this.state.currentIndex - (realCount + visible);
                this.state.currentIndex = visible + diff;
                this._updateTrackPosition(false);
            } 
            // 越过左边界 -> 跳回末尾
            else if (this.state.currentIndex < visible) {
                const diff = visible - this.state.currentIndex;
                this.state.currentIndex = realCount + visible - diff;
                this._updateTrackPosition(false);
            }
        }

        if (this.config.onChange) {
            this.config.onChange(this.getRealIndex());
        }
    });

    // 2. 响应式尺寸
    this.resizeObserver = new ResizeObserver(entries => {
        window.requestAnimationFrame(() => {
            if (!entries[0].contentRect.width) return;
            this._updateDimensions();
        });
    });
    this.resizeObserver.observe(this.container);

    // 3. 触摸/拖拽
    this.track.addEventListener('touchstart', e => this._onDragStart(e), { passive: true });
    this.track.addEventListener('mousedown', e => this._onDragStart(e));

    this.track.addEventListener('touchmove', e => this._onDragMove(e), { passive: false });
    document.addEventListener('mousemove', e => this._onDragMove(e));

    this.track.addEventListener('touchend', e => this._onDragEnd(e));
    document.addEventListener('mouseup', e => this._onDragEnd(e));

    // 4. 悬停暂停
    if (this.config.pauseOnHover) {
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.play());
    }
  }

  // --- 拖拽核心逻辑 (带方向锁) ---

  _onDragStart(e) {
    if (this.state.isAnimating) return; // 动画中不响应
    
    this.state.isDragging = true;
    this.touch.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    this.touch.startY = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
    this.touch.directionLocked = false;
    this.touch.diff = 0;

    this.pause();
    this.track.style.transition = 'none'; // 拖拽时由手指完全控制，移除 CSS 动画
  }

  _onDragMove(e) {
    if (!this.state.isDragging) return;

    const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const y = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
    
    const diffX = x - this.touch.startX;
    const diffY = y - this.touch.startY;
    const isHorizontal = this.config.direction === 'horizontal';

    // 方向锁逻辑
    if (!this.touch.directionLocked) {
        // 如果是水平轮播，且垂直移动更多 -> 判定为滚动页面 -> 放弃轮播控制
        if (isHorizontal && Math.abs(diffY) > Math.abs(diffX)) {
            this.state.isDragging = false;
            return;
        }
        // 垂直轮播同理
        if (!isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
            this.state.isDragging = false;
            return;
        }
        this.touch.directionLocked = true;
    }

    // 阻止默认行为 (防止页面跟随滚动)
    if (e.cancelable) e.preventDefault();

    this.touch.diff = isHorizontal ? diffX : diffY;

    // 边缘阻力
    if (!this.config.infinite) {
        const isFirst = this.state.currentIndex === 0;
        const isLast = this.state.currentIndex === (this.slides.length - this.config.visibleCount);
        if ((isFirst && this.touch.diff > 0) || (isLast && this.touch.diff < 0)) {
            this.touch.diff *= 0.3;
        }
    }

    this._updateTrackPosition(false, this.touch.diff);
  }

  _onDragEnd() {
    if (!this.state.isDragging) return;
    this.state.isDragging = false;

    if (this.config.autoplay && !this.config.pauseOnHover) this.play();

    // 判断拖拽距离是否足够触发切换
    if (Math.abs(this.touch.diff) > this.config.dragThreshold) {
        if (this.touch.diff < 0) this.next();
        else this.prev();
    } else {
        // 距离不够，回弹
        this.goTo(this.state.currentIndex);
    }
  }

  // --- UI 组件 ---

  getRealIndex() {
    if (!this.config.infinite) return this.state.currentIndex;
    let idx = this.state.currentIndex - this.config.visibleCount;
    if (idx < 0) idx = this.realSlideCount + idx;
    return idx % this.realSlideCount;
  }

  _createIndicators() {
    // 移除旧的（如果存在）
    const old = this.container.querySelector('.carousel-indicators');
    if (old) old.remove();

    const wrap = document.createElement('div');
    // 使用你的 CSS 类名
    wrap.className = 'carousel-indicators absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20';
    
    const count = Math.ceil(this.realSlideCount / this.config.slidesPerScroll);

    for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        // 结合你的 CSS 和基础样式
        btn.className = 'carousel-indicator w-2.5 h-2.5 rounded-full bg-white/50 transition-all duration-300 mx-1 p-0 border-none cursor-pointer';
        btn.ariaLabel = `Slide ${i + 1}`;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            let target = i * this.config.slidesPerScroll;
            if (this.config.infinite) target += this.config.visibleCount;
            this.goTo(target);
        });
        wrap.appendChild(btn);
    }

    this.container.appendChild(wrap);
    this.indicators = Array.from(wrap.children);
    this._updateIndicators();
  }

  _updateIndicators() {
    if (!this.indicators) return;
    const realIdx = this.getRealIndex();
    const activeIdx = Math.floor(realIdx / this.config.slidesPerScroll);

    this.indicators.forEach((dot, i) => {
        if (i === activeIdx) {
            dot.classList.remove('bg-white/50');
            dot.classList.add('bg-white', 'w-6'); // 激活变宽
        } else {
            dot.classList.add('bg-white/50');
            dot.classList.remove('bg-white', 'w-6');
        }
    });
  }

  _createArrows() {
    // 移除旧的
    const oldPrev = this.container.querySelector('.carousel-arrow-prev');
    const oldNext = this.container.querySelector('.carousel-arrow-next');
    if (oldPrev) oldPrev.remove();
    if (oldNext) oldNext.remove();

    const makeBtn = (dir) => {
        const btn = document.createElement('button');
        // 使用你的 CSS 类名 carousel-arrow
        btn.className = `carousel-arrow carousel-arrow-${dir} absolute top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white cursor-pointer border-none transition-colors ${dir === 'prev' ? 'left-2' : 'right-2'}`;
        btn.innerHTML = dir === 'prev' ? '&#10094;' : '&#10095;';
        return btn;
    };

    this.prevBtn = makeBtn('prev');
    this.nextBtn = makeBtn('next');

    this.prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
    this.nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    this.container.appendChild(this.prevBtn);
    this.container.appendChild(this.nextBtn);
    this._updateArrowsState();
  }

  _updateArrowsState() {
    if (!this.prevBtn || !this.nextBtn) return;
    if (this.config.infinite) {
        this.prevBtn.style.opacity = '1';
        this.prevBtn.style.pointerEvents = 'auto';
        this.nextBtn.style.opacity = '1';
        this.nextBtn.style.pointerEvents = 'auto';
        return;
    }
    // 非循环模式的处理
    const isFirst = this.state.currentIndex === 0;
    const isLast = this.state.currentIndex >= (this.slides.length - this.config.visibleCount);

    this.prevBtn.style.opacity = isFirst ? '0.3' : '1';
    this.prevBtn.style.pointerEvents = isFirst ? 'none' : 'auto';
    
    this.nextBtn.style.opacity = isLast ? '0.3' : '1';
    this.nextBtn.style.pointerEvents = isLast ? 'none' : 'auto';
  }

  play() {
    if (this.state.autoPlayTimer) return;
    this.state.autoPlayTimer = setInterval(() => this.next(), this.config.interval);
  }

  pause() {
    if (this.state.autoPlayTimer) {
      clearInterval(this.state.autoPlayTimer);
      this.state.autoPlayTimer = null;
    }
  }

  destroy() {
    this.pause();
    this.resizeObserver.disconnect();
    this.container.innerHTML = this.originalHtml;
    this.container.classList.remove('carousel-ready', 'group');
  }
}
