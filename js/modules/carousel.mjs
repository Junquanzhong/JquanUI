// carousel.mjs
//本组件逻辑部分由claude-4.7-sonnet生成，后由GLM-4.6优化,UI部分由JquanUIex@3.0.css提供
// 修复版本：3.0.2 - 修复指示器点击问题和索引计算
export default class Carousel {
  constructor(options) {
    // 默认配置
    this.config = {
      container: '.carousel',
      direction: 'horizontal',
      rtl: false,
      autoplay: true,
      interval: 3000,
      speed: 500,
      indicators: true,
      arrows: true,
      pauseOnHover: true,
      infinite: true,
      visibleCount: 1,
      slidesPerScroll: 1,
      gap: 'gap-0',
      onChange: null,
      ...options
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    console.log('初始化轮播图...');
    
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isAnimating = false;
    this.autoplayTimer = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchMoveX = 0;
    this.touchMoveY = 0;
    this.isTouching = false;

    this.container = typeof this.config.container === 'string' 
      ? document.querySelector(this.config.container) 
      : this.config.container;

    if (!this.container) {
      console.error('轮播图容器不存在:', this.config.container);
      return;
    }

    this.originalHTML = this.container.innerHTML;
    this.items = this.container.querySelectorAll('.carousel-item');
    this.slideCount = this.items.length;

    if (this.slideCount === 0) {
      console.error('未找到轮播项');
      return;
    }

    if (this.config.visibleCount < 1) {
      this.config.visibleCount = 1;
    }
    if (this.config.visibleCount > this.slideCount) {
      this.config.visibleCount = this.slideCount;
    }

    this.parseGapValue();
    this.maxIndex = Math.max(0, this.slideCount - this.config.visibleCount);

    this.init();
    this.bindEvents();

    if (this.config.autoplay) {
      this.play();
    }

    console.log('轮播图初始化完成');
  }

  parseGapValue() {
    if (typeof this.config.gap === 'string' && this.config.gap.startsWith('gap-')) {
      const gapValue = this.config.gap.replace('gap-', '');
      if (!isNaN(gapValue)) {
        this.gapPixels = parseFloat(gapValue);
      } else {
        const tailwindGapMap = {
          '0': 0, 'px': 1, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10,
          '3': 12, '3.5': 14, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32,
          '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64,
          '20': 80, '24': 96, '28': 112, '32': 128, '36': 144, '40': 160,
          '44': 176, '48': 192, '52': 208, '56': 224, '60': 240, '64': 256,
          '72': 288, '80': 320, '96': 384
        };
        this.gapPixels = tailwindGapMap[gapValue] || 0;
      }
    } else if (typeof this.config.gap === 'number') {
      this.gapPixels = this.config.gap;
    } else {
      this.gapPixels = 0;
    }
  }

  init() {
    console.log('初始化轮播图结构...');
    
    this.container.classList.add('relative', 'overflow-hidden');
    
    if (!this.container.style.height && !this.container.offsetHeight) {
      const firstImg = this.items[0].querySelector('img');
      if (firstImg && firstImg.complete) {
        this.container.style.height = `${firstImg.offsetHeight}px`;
      } else if (firstImg) {
        firstImg.onload = () => {
          this.container.style.height = `${firstImg.offsetHeight}px`;
        };
      }
    }

    this.track = document.createElement('div');
    this.track.classList.add('carousel-track', 'relative', 'w-full', 'h-full', 'flex');
    this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;
    
    if (this.config.direction === 'horizontal') {
      this.track.classList.add('flex-row', 'flex-nowrap');
    } else {
      this.track.classList.add('flex-col', 'flex-nowrap');
    }

    this.slides = [];
    const totalGapWidth = this.gapPixels * (this.config.visibleCount - 1);
    const slideWidth = (100 - (totalGapWidth / this.container.offsetWidth * 100)) / this.config.visibleCount;
    this.slideWidthPercent = slideWidth;
    
    Array.from(this.items).forEach((item, index) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide', 'relative');
      slide.setAttribute('data-index', index);
      
      slide.style.flex = `0 0 ${slideWidth}%`;
      slide.style.width = `${slideWidth}%`;
      slide.style.minWidth = `${slideWidth}%`;
      
      const shouldHaveGap = this.gapPixels > 0 && (index % this.config.visibleCount !== 0);
      
      if (shouldHaveGap && this.config.direction === 'horizontal') {
        slide.style.marginLeft = `${this.gapPixels}px`;
      } else if (shouldHaveGap && this.config.direction === 'vertical') {
        slide.style.marginTop = `${this.gapPixels}px`;
      }
      
      while (item.firstChild) {
        slide.appendChild(item.firstChild);
      }
      
      this.track.appendChild(slide);
      this.slides.push(slide);
    });

    this.container.innerHTML = '';
    this.container.appendChild(this.track);

    if (this.config.indicators) {
      this.createIndicators();
    }

    if (this.config.arrows) {
      this.createArrows();
    }

    if (this.config.infinite && this.slideCount > this.config.visibleCount) {
      for (let i = 0; i < this.config.visibleCount; i++) {
        const slideClone = this.slides[i].cloneNode(true);
        slideClone.classList.add('carousel-clone');
        slideClone.setAttribute('aria-hidden', 'true');
        
        const cloneIndex = i;
        const shouldHaveGap = this.gapPixels > 0 && (cloneIndex % this.config.visibleCount !== 0);
        
        if (shouldHaveGap && this.config.direction === 'horizontal') {
          slideClone.style.marginLeft = `${this.gapPixels}px`;
        } else if (shouldHaveGap && this.config.direction === 'vertical') {
          slideClone.style.marginTop = `${this.gapPixels}px`;
        }
        
        this.track.appendChild(slideClone);
      }
      
      for (let i = this.slideCount - this.config.visibleCount; i < this.slideCount; i++) {
        const slideClone = this.slides[i].cloneNode(true);
        slideClone.classList.add('carousel-clone');
        slideClone.setAttribute('aria-hidden', 'true');
        
        const cloneIndex = i;
        const shouldHaveGap = this.gapPixels > 0 && (cloneIndex % this.config.visibleCount !== 0);
        
        if (shouldHaveGap && this.config.direction === 'horizontal') {
          slideClone.style.marginLeft = `${this.gapPixels}px`;
        } else if (shouldHaveGap && this.config.direction === 'vertical') {
          slideClone.style.marginTop = `${this.gapPixels}px`;
        }
        
        this.track.insertBefore(slideClone, this.track.firstChild);
      }

      this.currentIndex = this.config.visibleCount;
    }

    this.goToSlide(this.currentIndex, false);
    
    console.log('轮播图结构初始化完成');
  }

  createIndicators() {
    this.indicators = document.createElement('div');
    this.indicators.classList.add('carousel-indicators', 'absolute', 'bottom-4', 'left-1/2', 'transform', '-translate-x-1/2', 'flex', 'gap-2', 'z-10');

    const indicatorCount = Math.max(1, Math.ceil(this.slideCount / this.config.slidesPerScroll));
    
    for (let i = 0; i < indicatorCount; i++) {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator', 'w-2.5', 'h-2.5', 'rounded-full', 'bg-white/50', 'border-none', 'p-0', 'cursor-pointer', 'transition-colors');
      indicator.setAttribute('data-index', i);
      indicator.setAttribute('aria-label', `幻灯片组 ${i + 1}`);

      // 关键修复：简化指示器点击逻辑
      indicator.addEventListener('click', () => {
        if (!this.isAnimating) {
          let targetIndex;
          if (this.config.infinite) {
            // 无限循环模式：直接计算目标索引
            targetIndex = i * this.config.slidesPerScroll;
            // 关键修复：在无限循环模式下，需要调整索引以匹配克隆结构
            if (this.config.infinite && this.slideCount > this.config.visibleCount) {
              targetIndex += this.config.visibleCount;
            }
          } else {
            // 非无限循环模式：确保不超出边界
            targetIndex = Math.min(i * this.config.slidesPerScroll, this.maxIndex);
          }
          
          console.log(`指示器点击: 指示器 ${i}, 目标索引: ${targetIndex}`);
          this.goToSlide(targetIndex);
        }
      });

      this.indicators.appendChild(indicator);
    }

    this.container.appendChild(this.indicators);
    this.updateIndicators();
  }

  createArrows() {
    const prevArrow = document.createElement('button');
    prevArrow.classList.add('carousel-arrow', 'carousel-arrow-prev', 'absolute', 'top-1/2', '-translate-y-1/2', 'left-2.5', 'bg-black/30', 'text-white', 'border-none', 'rounded-full', 'w-10', 'h-10', 'text-lg', 'cursor-pointer', 'z-10', 'flex', 'justify-center', 'items-center', 'transition-colors');
    prevArrow.setAttribute('aria-label', '上一个');
    prevArrow.innerHTML = '&#10094;';

    const nextArrow = document.createElement('button');
    nextArrow.classList.add('carousel-arrow', 'carousel-arrow-next', 'absolute', 'top-1/2', '-translate-y-1/2', 'right-2.5', 'bg-black/30', 'text-white', 'border-none', 'rounded-full', 'w-10', 'h-10', 'text-lg', 'cursor-pointer', 'z-10', 'flex', 'justify-center', 'items-center', 'transition-colors');
    nextArrow.setAttribute('aria-label', '下一个');
    nextArrow.innerHTML = '&#10095;';

    prevArrow.addEventListener('mouseenter', () => {
      prevArrow.classList.remove('bg-black/30');
      prevArrow.classList.add('bg-black/50');
    });
    prevArrow.addEventListener('mouseleave', () => {
      prevArrow.classList.remove('bg-black/50');
      prevArrow.classList.add('bg-black/30');
    });

    nextArrow.addEventListener('mouseenter', () => {
      nextArrow.classList.remove('bg-black/30');
      nextArrow.classList.add('bg-black/50');
    });
    nextArrow.addEventListener('mouseleave', () => {
      nextArrow.classList.remove('bg-black/50');
      nextArrow.classList.add('bg-black/30');
    });

    prevArrow.addEventListener('click', () => this.prev());
    nextArrow.addEventListener('click', () => this.next());

    this.container.appendChild(prevArrow);
    this.container.appendChild(nextArrow);

    this.prevArrow = prevArrow;
    this.nextArrow = nextArrow;
  }

  bindEvents() {
    if (this.config.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pause());
      this.container.addEventListener('mouseleave', () => {
        if (this.config.autoplay) {
          this.play();
        }
      });
    }

    this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.container.addEventListener('touchend', () => this.handleTouchEnd());

    this.track.addEventListener('transitionend', () => {
      this.isAnimating = false;
      
      if (this.config.infinite && this.slideCount > this.config.visibleCount) {
        if (this.currentIndex < this.config.visibleCount) {
          this.track.style.transition = 'none';
          this.currentIndex = this.slideCount;
          this.updateTrackPosition();
          void this.track.offsetWidth;
          this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;
        } else if (this.currentIndex > this.slideCount) {
          this.track.style.transition = 'none';
          this.currentIndex = this.config.visibleCount;
          this.updateTrackPosition();
          void this.track.offsetWidth;
          this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;
        }
      }

      this.updateIndicators();

      if (typeof this.config.onChange === 'function') {
        const realIndex = this.getRealIndex();
        this.config.onChange(realIndex, this.slides[realIndex]);
      }
    });

    window.addEventListener('resize', this.debounce(() => {
      this.updateTrackPosition();
    }, 250));
  }

  getRealIndex() {
    if (!this.config.infinite) {
      return this.currentIndex;
    }
    
    if (this.currentIndex < this.config.visibleCount) {
      return this.slideCount - (this.config.visibleCount - this.currentIndex);
    } else if (this.currentIndex > this.slideCount) {
      return this.currentIndex - this.slideCount;
    } else {
      return this.currentIndex - this.config.visibleCount;
    }
  }

  updateIndicators() {
    if (!this.config.indicators) return;

    const realIndex = this.getRealIndex();
    const currentIndicatorIndex = Math.floor(realIndex / this.config.slidesPerScroll);

    Array.from(this.indicators.children).forEach((indicator, i) => {
      if (i === currentIndicatorIndex) {
        indicator.classList.remove('bg-white/50');
        indicator.classList.add('bg-white');
        indicator.setAttribute('aria-current', 'true');
      } else {
        indicator.classList.remove('bg-white');
        indicator.classList.add('bg-white/50');
        indicator.removeAttribute('aria-current');
      }
    });
  }

  updateTrackPosition() {
    let transformValue;
    
    if (this.config.direction === 'horizontal') {
      let totalOffset = 0;
      for (let i = 0; i < this.currentIndex; i++) {
        totalOffset += this.slideWidthPercent;
        if (i % this.config.visibleCount !== 0) {
          totalOffset += (this.gapPixels / this.container.offsetWidth * 100);
        }
      }
      transformValue = `translateX(-${totalOffset}%)`;
    } else {
      let totalOffset = 0;
      for (let i = 0; i < this.currentIndex; i++) {
        totalOffset += this.slideWidthPercent;
        if (i % this.config.visibleCount !== 0) {
          totalOffset += (this.gapPixels / this.container.offsetHeight * 100);
        }
      }
      transformValue = `translateY(-${totalOffset}%)`;
    }
    
    this.track.style.transform = transformValue;
  }

  goToSlide(index, animate = true) {
    if (this.isAnimating) return;
    
    if (!this.config.infinite) {
      if (index < 0) index = 0;
      if (index > this.maxIndex) index = this.maxIndex;
    }

    this.currentIndex = index;
    
    if (!animate) {
      this.track.style.transition = 'none';
      this.updateTrackPosition();
      void this.track.offsetWidth;
      this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;
      this.updateIndicators();
    } else {
      this.isAnimating = true;
      this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;
      this.updateTrackPosition();
    }
  }

  next() {
    if (this.isAnimating) return;
    
    const nextIndex = this.currentIndex + this.config.slidesPerScroll;
    
    if (!this.config.infinite) {
      if (this.currentIndex >= this.maxIndex) {
        this.goToSlide(0);
      } else {
        this.goToSlide(Math.min(nextIndex, this.maxIndex));
      }
    } else {
      this.goToSlide(nextIndex);
    }
  }

    prev() {
    if (this.isAnimating) return;
    
    const prevIndex = this.currentIndex - this.config.slidesPerScroll;
    
    if (!this.config.infinite) {
      if (this.currentIndex <= 0) {
        this.goToSlide(this.maxIndex);
      } else {
        this.goToSlide(Math.max(prevIndex, 0));
      }
    } else {
      this.goToSlide(prevIndex);
    }
  }

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.config.interval);
  }

  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.isTouching = true;
    
    if (this.isPlaying) {
      this.pause();
      this.wasPlaying = true;
    }
  }

  handleTouchMove(e) {
    if (!this.isTouching) return;
    
    e.preventDefault();
    
    this.touchMoveX = e.touches[0].clientX;
    this.touchMoveY = e.touches[0].clientY;
    
    const diffX = this.touchStartX - this.touchMoveX;
    const diffY = this.touchStartY - this.touchMoveY;
    
    let currentOffset = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      currentOffset += this.slideWidthPercent;
      if (i % this.config.visibleCount !== 0) {
        currentOffset += (this.gapPixels / this.container.offsetWidth * 100);
      }
    }
    
    if (this.config.direction === 'horizontal' && Math.abs(diffX) > Math.abs(diffY)) {
      const moveX = diffX / this.container.offsetWidth * 100;
      const translateX = -(currentOffset + moveX);
      this.track.style.transition = 'none';
      this.track.style.transform = `translateX(${translateX}%)`;
    } else if (this.config.direction === 'vertical' && Math.abs(diffY) > Math.abs(diffX)) {
      const moveY = diffY / this.container.offsetHeight * 100;
      const translateY = -(currentOffset + moveY);
      this.track.style.transition = 'none';
      this.track.style.transform = `translateY(${translateY}%)`;
    }
  }

  handleTouchEnd() {
    if (!this.isTouching) return;
    
    this.isTouching = false;
    
    const diffX = this.touchStartX - this.touchMoveX;
    const diffY = this.touchStartY - this.touchMoveY;
    
    this.track.style.transition = `transform ${this.config.speed}ms ease-in-out`;
    
    const threshold = 50;
    
    if (this.config.direction === 'horizontal') {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          this.next();
        } else {
          this.prev();
        }
      } else {
        this.goToSlide(this.currentIndex);
      }
    } else if (this.config.direction === 'vertical') {
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          this.next();
        } else {
          this.prev();
        }
      } else {
        this.goToSlide(this.currentIndex);
      }
    }
    
    if (this.wasPlaying) {
      this.play();
      this.wasPlaying = false;
    }
  }

  debounce(fn, delay) {
    let timer = null;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    };
  }

  destroy() {
    this.pause();
    
    this.container.removeEventListener('mouseenter', this.pause);
    this.container.removeEventListener('mouseleave', this.play);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    
    if (this.originalHTML) {
      this.container.innerHTML = this.originalHTML;
    } else {
      this.container.innerHTML = '';
    }
    
    this.track = null;
    this.slides = null;
    this.indicators = null;
    this.prevArrow = null;
    this.nextArrow = null;
  }
}


