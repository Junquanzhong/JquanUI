// loading.mjs
// =====================================================
// 轻量级加载指示器（ESM）模块
// 基于已定义的 CSS 动画类，提供灵活的加载器展示功能
// =====================================================

/**
 * 预设的加载动画样式类（确保与您的 CSS 定义一致）
 */
const LOADER_STYLES = [
  'loader-waves',
  'loader-whirlwind', 
  'loader-shadowring',
  'loader-scatterplotrotation',
  'loader-innerringslider',
  'loader-line',
  'loader-fill'
];

/** 默认配置 */
const DEFAULT_OPTIONS = {
  style: 'loader-waves',        // 动画样式类
  size: 48,                     // 加载器大小（px）
  color: '#ffffff',             // 加载器颜色（如果 CSS 支持变量）
  fullscreen: true,             // 是否全屏覆盖
  overlay: true,                // 是否显示遮罩层
  zIndex: 50,                   // 层级
};

/** 内部加载器实例（单例模式） */
let loaderInstance = null;

/**
 * 显示加载器
 * @param {Object} options - 配置选项
 * @param {string} options.style - 加载动画样式类名
 * @param {number} options.size - 加载器尺寸（px）
 * @param {string} options.color - 加载器颜色（CSS 支持变量时使用）
 * @param {boolean} options.fullscreen - 是否全屏覆盖
 * @param {boolean} options.overlay - 是否显示遮罩层
 * @param {number} options.zIndex - 层级
 * @returns {HTMLElement} 加载器根容器元素
 */
export function showLoader(options = {}) {
  // 如果已有加载器，先隐藏
  if (loaderInstance) {
    console.warn('[loading.mjs] 加载器已在显示，将先隐藏旧实例');
    hideLoader();
  }

  // 合并配置
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // 验证样式类是否存在
  if (!LOADER_STYLES.includes(config.style)) {
    console.warn(`[loading.mjs] 未知的加载器样式 "${config.style}"，已回退到 "loader-waves"`);
    config.style = 'loader-waves';
  }

  // 创建遮罩层容器
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed',
    'inset-0',
    'w-full',
    'h-full',
    'flex',
    'items-center',
    'justify-center',
    config.overlay ? 'bg-surface' : '',
    config.overlay ? 'bg-opacity-50' : '', // 只在需要遮罩时加 opacity
  ].filter(Boolean).join(' ');
  
  overlay.style.zIndex = config.zIndex;

  // 创建加载器内容容器
  const loaderContainer = document.createElement('div');
  loaderContainer.className = [
    'flex',
    'flex-col',                 // 垂直排列
    'items-center',
    'justify-center'
  ].join(' ');

  // 创建加载动画元素
  const loaderElement = document.createElement('div');
  loaderElement.className = config.style;
  
  // 设置大小和颜色（支持 CSS 变量）
  loaderElement.style.setProperty('--loader-size', `${config.size}px`);
  loaderElement.style.setProperty('--loader-color', config.color);
  
  // 同时设置内联样式确保兼容性
  loaderElement.style.width = `${config.size}px`;
  loaderElement.style.height = `${config.size}px`;

  // 组装 DOM
  loaderContainer.appendChild(loaderElement);
  overlay.appendChild(loaderContainer);
  document.body.appendChild(overlay);
  
  loaderInstance = overlay;
  return overlay;
}

/**
 * 隐藏当前加载器
 */
export function hideLoader() {
  if (loaderInstance) {
    loaderInstance.remove();
    loaderInstance = null;
  }
}

/**
 * 显示加载器并自动在 Promise 完成时隐藏
 * @param {Function|Promise} task - 要执行的任务（函数或Promise）
 * @param {Object} options - 与 showLoader 相同的配置选项
 * @returns {Promise} 任务执行结果
 */
export async function withLoader(task, options = {}) {
  showLoader(options);
  
  try {
    const result = await (typeof task === 'function' ? task() : task);
    return result;
  } finally {
    hideLoader();
  }
}

/**
 * 获取当前加载器实例（用于自定义操作）
 * @returns {HTMLElement|null}
 */
export function getLoader() {
  return loaderInstance;
}

/**
 * 更新现有加载器配置
 * @param {Object} options - 新的配置选项
 */
export function updateLoader(options = {}) {
  if (!loaderInstance) {
    console.warn('[loading.mjs] 没有活动的加载器，无法更新');
    return;
  }
  
  hideLoader();
  showLoader(options);
}
