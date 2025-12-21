// scrollSpy.mjs

/**
 * 默认配置项
 */
const defaultOptions = {
  // 导航链接的选择器
  navSelector: '.nav-link',
  // 内容区块的选择器
  sectionSelector: '.section',
  // 激活状态的 CSS 类名
  activeClass: 'nav-active',
  // Intersection Observer 的配置
  observerOptions: {
    root: null,
    rootMargin: '0px 0px -50% 0px',
    threshold: 0,
  },
  // 状态更新时的回调函数
  // (activeSection, activeLink) => { ... }
  onUpdate: null, 
};

/**
 * 创建一个滚动高亮实例
 * @param {object} userOptions - 用户自定义的配置
 * @returns {object} - 包含 destroy 方法的实例对象
 */
export function createScrollSpy(userOptions = {}) {
  // 合并默认配置和用户配置
  const options = { ...defaultOptions, ...userOptions };

  // 获取所有导航链接和内容区块
  const navLinks = document.querySelectorAll(options.navSelector);
  const sections = document.querySelectorAll(options.sectionSelector);

  // 容错处理：如果找不到元素，则警告并退出
  if (!navLinks.length || !sections.length) {
    console.warn('ScrollSpy: No navigation links or sections found. Please check your selectors.');
    return { destroy: () => {} }; // 返回一个空的 destroy 函数
  }
  
  // 创建 Intersection Observer
  // 新的、更智能的 IntersectionObserver 代码
const observer = new IntersectionObserver((entries) => {
    // 1. 【关键修复】首先检查是否已滚动到页面底部
    const isAtBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 1;

    if (isAtBottom) {
        // 如果在底部，强制高亮最后一个区块
        const lastSection = sections[sections.length - 1];
        if (!lastSection) return;

        const targetId = lastSection.id;
        let activeLink = document.querySelector(`${options.navSelector}[data-target="#${targetId}"]`);

        if (!activeLink) {
            activeLink = document.querySelector(`${options.navSelector}[href="#${targetId}"]`);
        }
        
        // 执行高亮逻辑（和原来一样）
        if (activeLink && !activeLink.classList.contains(options.activeClass)) {
            navLinks.forEach(link => link.classList.remove(options.activeClass));
            activeLink.classList.add(options.activeClass);
            if (typeof options.onUpdate === 'function') {
                options.onUpdate(lastSection, activeLink);
            }
        }
        return; // 已经处理，直接结束
    }

    // 2. 【常规处理】如果不在底部，找出所有进入视口的区块
    const intersectingEntries = entries.filter(entry => entry.isIntersecting);

    if (intersectingEntries.length > 0) {
        // 在所有可见的区块中，选出最顶部的那个（boundingClientRect.top 最小）
        const topmostEntry = intersectingEntries.reduce((prev, current) =>
            prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current
        );

        const activeSection = topmostEntry.target;
        const targetId = activeSection.id;
        let activeLink = document.querySelector(`${options.navSelector}[data-target="#${targetId}"]`);

        if (!activeLink) {
            activeLink = document.querySelector(`${options.navSelector}[href="#${targetId}"]`);
        }

        // 只有当找到了新的激活链接时，才执行更新
        if (activeLink && !activeLink.classList.contains(options.activeClass)) {
            navLinks.forEach(link => link.classList.remove(options.activeClass));
            activeLink.classList.add(options.activeClass);
            if (typeof options.onUpdate === 'function') {
                options.onUpdate(activeSection, activeLink);
            }
        }
    }
}, options.observerOptions);

  // 启动观察
  const init = () => {
    sections.forEach(section => observer.observe(section));
  };

  // 清理观察，用于销毁实例
  const destroy = () => {
    observer.disconnect(); // 停止观察所有目标
    navLinks.forEach(link => link.classList.remove(options.activeClass)); // 移除所有激活状态
  };

  // 初始化
  init();

  // 暴露 destroy 方法供外部调用
  return { destroy };
}
