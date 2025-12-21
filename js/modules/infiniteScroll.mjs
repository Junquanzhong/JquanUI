// infiniteScroll.mjs - 无限滚动修复版 (v2)

/**
 * 图片无限滚动组件
 * 特点：
 * - 可视区域显示指定数量的元素（默认3.5个）
 * - 支持自动无限滚动
 * - 支持触摸和鼠标拖动
 * - 响应式设计，兼容移动端
 * - 可自定义滚动速度
 * - 新增 scrollDirection 参数控制滚动方向
 */

export default class InfiniteScroll {
  /**
   * @param {Object} options - 配置选项
   * @param {string|HTMLElement} options.container - 容器选择器或DOM元素
   * @param {boolean} [options.autoScroll=true] - 是否自动滚动
   * @param {number} [options.speed=1] - 滚动速度 (1-10)
   * @param {number} [options.visibleItems=3.5] - 可视区域显示的项目数量
   * @param {string} [options.direction='horizontal'] - 滚动方向，'horizontal'或'vertical'
   * @param {number} [options.gap=16] - 项目间距
   * @param {boolean} [options.pauseOnHover=true] - 鼠标悬停时是否暂停
   * @param {string} [options.scrollDirection='left'] - 滚动方向: 'left' 或 'right' (水平时)
   */
  constructor(options) {
    this.options = {
      autoScroll: true,
      speed: 1,
      visibleItems: 3.5,
      direction: 'horizontal',
      gap: 16,
      pauseOnHover: true,
      scrollDirection: 'left', // 新增参数，默认向左
      ...options
    };

    this.container = typeof this.options.container === 'string' 
      ? document.querySelector(this.options.container) 
      : this.options.container;
      
    if (!this.container) {
      throw new Error('Container element not found');
    }

    this.init();
  }

  init() {
    // 确保容器有相对或绝对定位
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }
    
    // 获取内容元素和子项
    this.scrollContainer = this.container.querySelector('ul') || this.container.querySelector('.scroll-content');
    if (!this.scrollContainer) {
      throw new Error('Scroll container (ul or .scroll-content) not found inside the container');
    }
    
    // 获取所有子项
    this.items = [...this.scrollContainer.children];
    
    if (this.items.length === 0) {
      throw new Error('No items found in scroll container');
    }
    
    // 添加必要的样式
    this.applyStyles();
    
    // 初始化滚动状态
    this.scrollPosition = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationId = null;
    
    // 克隆元素实现无限滚动效果
    this.setupInfiniteScroll();
    
    // 添加事件监听
    this.addEventListeners();
    
    // 如果启用自动滚动，开始滚动
    if (this.options.autoScroll) {
      this.startAutoScroll();
    }
    
    // 初次调整大小
    this.handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  applyStyles() {
    // 容器样式
    Object.assign(this.container.style, {
      overflow: 'hidden',
      userSelect: 'none'
    });
    
    // 滚动容器样式
    Object.assign(this.scrollContainer.style, {
      display: 'flex',
      flexDirection: this.options.direction === 'horizontal' ? 'row' : 'column',
      gap: `${this.options.gap}px`,
      transition: 'transform 0.3s ease',
      willChange: 'transform',
      touchAction: 'pan-y',
      padding: '0',
      margin: '0',
      listStyle: 'none'
    });
    
    // 计算单个项目所占宽度/高度的百分比
    // 使视图中显示 visibleItems 个项目（例如3.5个）
    const totalGapSize = this.options.gap * (Math.ceil(this.options.visibleItems) - 1);
    const itemSizePercent = (100 - (totalGapSize / this.container.clientWidth * 100)) / this.options.visibleItems;
    
    // 设置子元素样式
    if (this.items && this.items.length > 0) {
      this.items.forEach(item => {
        Object.assign(item.style, {
          flexShrink: '0',
          flexGrow: '0',
          width: this.options.direction === 'horizontal' ? `${itemSizePercent}%` : '100%',
          height: this.options.direction === 'vertical' ? `${itemSizePercent}%` : 'auto',
          boxSizing: 'border-box'
        });
      });
    }
  }
  
  setupInfiniteScroll() {
    // 关键修复：克隆足够多的元素以确保无缝滚动
    // 至少需要原始内容的3倍长度（或更多），确保在任何滚动位置都有内容
    const originalItemCount = this.items.length;
    const minClonesNeeded = Math.max(originalItemCount * 3, Math.ceil(this.options.visibleItems) * 4);
    
    // 清空现有克隆（如果有）
    while (this.scrollContainer.children.length > originalItemCount) {
      this.scrollContainer.removeChild(this.scrollContainer.lastChild);
    }
    
    // 重新克隆
    const clones = [];
    for (let i = 0; i < minClonesNeeded; i++) {
      const itemIndex = i % originalItemCount;
      clones.push(this.items[itemIndex].cloneNode(true));
    }
    
    clones.forEach(clone => {
      this.scrollContainer.appendChild(clone);
    });
    
    // 更新所有项目列表
    this.allItems = [...this.scrollContainer.children];
  }
  
  addEventListeners() {
    // 触摸事件 (移动端)
    this.scrollContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.scrollContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.scrollContainer.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // 鼠标事件 (桌面端)
    this.scrollContainer.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // 暂停自动滚动
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', this.pauseAutoScroll.bind(this));
      this.container.addEventListener('mouseleave', this.resumeAutoScroll.bind(this));
      this.container.addEventListener('touchstart', this.pauseAutoScroll.bind(this));
      this.container.addEventListener('touchend', this.resumeAutoScroll.bind(this));
    }
  }
  
  handleResize() {
    // 重新应用样式以适应新的容器大小
    this.applyStyles();
    
    // 计算每个项目的宽度（包括gap）
    if (this.items && this.items.length > 0) {
      const firstItem = this.items[0];
      const itemSize = this.options.direction === 'horizontal'
        ? firstItem.offsetWidth + this.options.gap
        : firstItem.offsetHeight + this.options.gap;
        
      this.itemSize = itemSize;
      // 原始内容总长度（不含克隆）
      this.originalContentSize = itemSize * this.items.length;
      // 克隆后总长度
      this.totalContentSize = itemSize * this.allItems.length;
    }
  }
  
  // 触摸事件处理
  handleTouchStart(e) {
    this.pauseAutoScroll();
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.prevTranslate = this.currentTranslate;
    
    cancelAnimationFrame(this.animationId);
    e.preventDefault();
  }
  
  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    // 计算移动距离
    const diffX = currentX - this.startX;
    const diffY = currentY - this.startY;
    
    // 根据滚动方向应用移动
    if (this.options.direction === 'horizontal') {
      this.currentTranslate = this.prevTranslate + diffX;
    } else {
      this.currentTranslate = this.prevTranslate + diffY;
    }
    
    this.applyTransform();
    e.preventDefault();
  }
  
  handleTouchEnd() {
    this.isDragging = false;
    this.snapToItem();
    this.resumeAutoScroll();
  }
  
  // 鼠标事件处理
  handleMouseDown(e) {
    this.pauseAutoScroll();
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.prevTranslate = this.currentTranslate;
    
    cancelAnimationFrame(this.animationId);
    e.preventDefault();
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    // 计算移动距离
    const diffX = currentX - this.startX;
    const diffY = currentY - this.startY;
    
    // 根据滚动方向应用移动
    if (this.options.direction === 'horizontal') {
      this.currentTranslate = this.prevTranslate + diffX;
    } else {
      this.currentTranslate = this.prevTranslate + diffY;
    }
    
    this.applyTransform();
  }
  
  handleMouseUp() {
    this.isDragging = false;
    this.snapToItem();
    this.resumeAutoScroll();
  }
  
  // 应用变换
  applyTransform() {
    const transform = this.options.direction === 'horizontal'
      ? `translateX(${this.currentTranslate}px)`
      : `translateY(${this.currentTranslate}px)`;
      
    this.scrollContainer.style.transform = transform;
  }
  
  // 自动对齐到最近的项目（用于拖拽结束）
  snapToItem() {
    if (!this.itemSize || !this.originalContentSize) return;
    
    // 计算最近的原始项目位置（基于原始内容长度）
    const normalizedTranslate = ((this.currentTranslate % this.originalContentSize) + this.originalContentSize) % this.originalContentSize;
    let snapPosition = Math.round(normalizedTranslate / this.itemSize) * this.itemSize;
    
    // 调整到等效位置（可能在克隆区域）
    this.currentTranslate = snapPosition;
    this.scrollContainer.style.transition = 'transform 0.3s ease';
    this.applyTransform();
    
    // 重置过渡效果
    setTimeout(() => {
      this.scrollContainer.style.transition = '';
    }, 300);
  }
  
  // 无限滚动核心：检测并重置位置（无缝）
  checkAndResetPosition() {
    if (!this.originalContentSize || !this.totalContentSize) return;
    
    // 安全边界：当滚动位置接近克隆内容末尾时，重置到等效开头位置
    const buffer = this.originalContentSize; // 重置缓冲区
    
    if (this.scrollPosition <= -this.totalContentSize + buffer) {
      // 滚动到末尾，重置到开头（加一个原始内容长度避免跳变）
      this.scrollPosition += this.originalContentSize;
    } else if (this.scrollPosition >= buffer) {
      // 滚动到开头（反向滚动时），重置到末尾
      this.scrollPosition -= this.originalContentSize;
    }
  }
  
  // 自动滚动
  startAutoScroll() {
    if (!this.options.autoScroll || this.autoScrollPaused) return;
    
    // 调整速度 (1-10)
    const speed = 0.5 * this.options.speed;
    // 根据 scrollDirection 决定滚动方向
    const scrollStep = this.options.scrollDirection === 'left' ? -speed : speed;
    
    this.autoScrollAnimationId = requestAnimationFrame(() => {
      this.scrollPosition += scrollStep;
      this.checkAndResetPosition(); // 关键：无缝重置
      
      if (this.options.direction === 'horizontal') {
        this.scrollContainer.style.transform = `translateX(${this.scrollPosition}px)`;
      } else {
        this.scrollContainer.style.transform = `translateY(${this.scrollPosition}px)`;
      }
      
      this.startAutoScroll();
    });
  }
  
  pauseAutoScroll() {
    this.autoScrollPaused = true;
    cancelAnimationFrame(this.autoScrollAnimationId);
  }
  
  resumeAutoScroll() {
    if (!this.options.autoScroll) return;
    this.autoScrollPaused = false;
    this.startAutoScroll();
  }
  
  // 公共方法：手动调整滚动速度
  setSpeed(speed) {
    this.options.speed = Math.min(Math.max(speed, 1), 10);
  }
  
  // 公共方法：切换自动滚动
  toggleAutoScroll(enable) {
    this.options.autoScroll = enable;
    if (enable) {
      this.autoScrollPaused = false;
      this.startAutoScroll();
    } else {
      this.pauseAutoScroll();
    }
  }
  
  // 公共方法：设置可见项目数量
  setVisibleItems(count) {
    this.options.visibleItems = count;
    this.handleResize(); // 重新应用样式
  }
  
  // 销毁组件，移除事件监听
  destroy() {
    cancelAnimationFrame(this.autoScrollAnimationId);
    cancelAnimationFrame(this.animationId);
    
    this.scrollContainer.removeEventListener('touchstart', this.handleTouchStart);
    this.scrollContainer.removeEventListener('touchmove', this.handleTouchMove);
    this.scrollContainer.removeEventListener('touchend', this.handleTouchEnd);
    
    this.scrollContainer.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    
    this.container.removeEventListener('mouseenter', this.pauseAutoScroll);
    this.container.removeEventListener('mouseleave', this.resumeAutoScroll);
    this.container.removeEventListener('touchstart', this.pauseAutoScroll);
    this.container.removeEventListener('touchend', this.resumeAutoScroll);
    
    window.removeEventListener('resize', this.handleResize);
  }
}
