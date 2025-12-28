/**
 * JquanUI JIT Engine (ES Module)
 * 一个轻量级、运行时、基于属性映射的原子化 CSS 引擎。
 * 
 * @author Gemini-3-Pro
 * @version 1.0.0
 * @license MIT
 */

// 默认属性映射表 (Registry)
const DEFAULT_MAP = {
    // --- 尺寸 (Sizing) ---
    'w': 'width',
    'h': 'height',
    'min-w': 'min-width',
    'max-w': 'max-width',
    'min-h': 'min-height',
    'max-h': 'max-height',

    // --- 间距 (Spacing) ---
    'm': 'margin',
    'mt': 'margin-top',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'mr': 'margin-right',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom'],
    'p': 'padding',
    'pt': 'padding-top',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'pr': 'padding-right',
    'px': ['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],

    // --- 排版 (Typography) ---
    'fs': 'font-size',        // font-size
    'fw': 'font-weight',      // font-weight
    'lh': 'line-height',      // line-height
    'ls': 'letter-spacing',   // letter-spacing
    'c': 'color',             // color
    'text': 'color',          // 习惯兼容
    'align': 'text-align',
    'decoration': 'text-decoration',

    // --- 背景 (Background) ---
    'bg': 'background',       // 可以是颜色，也可以是 image/gradient
    'bg-c': 'background-color',
    'bg-img': 'background-image',
    'bg-pos': 'background-position',
    'bg-size': 'background-size',

    // --- 边框 (Borders) ---
    'border': 'border-width',
    'border-c': 'border-color',
    'border-s': 'border-style',
    'border-t': 'border-top-width',
    'border-b': 'border-bottom-width',
    'border-l': 'border-left-width',
    'border-r': 'border-right-width',
    'rounded': 'border-radius',
    'rounded-t': ['border-top-left-radius', 'border-top-right-radius'],
    'rounded-b': ['border-bottom-left-radius', 'border-bottom-right-radius'],
    'rounded-l': ['border-top-left-radius', 'border-bottom-left-radius'],
    'rounded-r': ['border-top-right-radius', 'border-bottom-right-radius'],

    // --- 布局 (Layout - Flex/Grid) ---
    'flex': 'flex',
    'grow': 'flex-grow',
    'shrink': 'flex-shrink',
    'order': 'order',
    'grid-cols': 'grid-template-columns',
    'grid-rows': 'grid-template-rows',
    'gap': 'gap',
    'gap-x': 'column-gap',
    'gap-y': 'row-gap',
    'justify': 'justify-content',
    'items': 'align-items',
    'self': 'align-self',

    // --- 定位 (Positioning) ---
    'inset': ['top', 'right', 'bottom', 'left'],
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left',
    'z': 'z-index',

    // --- 视觉效果 (Effects) ---
    'opacity': 'opacity',
    'shadow': 'box-shadow',
    'outline': 'outline',
    'outline-o': 'outline-offset',
    
    // --- 变换 (Transforms) ---
    // 注意：现代浏览器支持独立的 translate/rotate/scale 属性，无需写在 transform 字符串里
    'rotate': 'rotate',
    'scale': 'scale',
    'translate-x': 'translate', // 简单映射，虽然 translate 属性通常接受两个值，但 JIT 直接填入值
    'translate-y': 'translate', 
    
    // --- 滤镜 (Filters) ---
    'filter': 'filter',
    'blur': 'filter',         // 用户需写 blur-[blur(5px)]
    'backdrop': 'backdrop-filter',
    
    // --- 其他 ---
    'cursor': 'cursor',
    'overflow': 'overflow',
    'variable': '--*'         // 特殊处理逻辑
};

// 正则：匹配 (!)?prefix-[value]
// 捕获组 1: (!) 可选，表示 !important
// 捕获组 2: 前缀
// 捕获组 3: 值
const PARSE_REGEX = /^(!?)([a-z0-9-]+)-\[(.+)\]$/;

// 内部状态
let _observer = null;
let _config = { ...DEFAULT_MAP };

/**
 * 解析单个元素的所有类名
 * @param {HTMLElement} el 
 */
function processElement(el) {
    // 性能优化：快速检查是否可能包含 JIT 类
    if (!el.className.includes('-[') && !el.className.includes('!')) return;

    el.classList.forEach(cls => {
        try {
            const match = cls.match(PARSE_REGEX);
            if (!match) return;

            const isImportant = match[1] === '!';
            const prefix = match[2];
            let rawValue = match[3];

            // 1. 下划线处理：将 _ 替换为空格 (Tailwind 习惯)
            // 排除 url() 内部的下划线，这里做简单替换，复杂情况暂不考虑
            const value = rawValue.replace(/_/g, ' ');

            // 2. 查找映射
            if (_config.hasOwnProperty(prefix)) {
                const propOrProps = _config[prefix];
                const priority = isImportant ? 'important' : '';

                if (Array.isArray(propOrProps)) {
                    // 一对多映射 (如 mx -> margin-left, margin-right)
                    propOrProps.forEach(p => {
                        el.style.setProperty(p, value, priority);
                    });
                } else {
                    // 一对一映射
                    el.style.setProperty(propOrProps, value, priority);
                }
            } else if (prefix.startsWith('--')) {
                // 3. 支持 CSS 变量直接赋值: --my-var-[#fff]
                // 这允许用户定义任意 CSS 变量
                el.style.setProperty(prefix, value, isImportant ? 'important' : '');
            }

        } catch (e) {
            console.warn(`[JquanUI-JIT] Error parsing class "${cls}":`, e);
        }
    });
}

/**
 * 全局扫描并应用样式
 */
function runParser() {
    // 性能优化：使用 QuerySelector 缩小范围
    const elements = document.querySelectorAll('[class*="-["]');
    elements.forEach(processElement);
}

/**
 * 初始化引擎
 * @param {Object} customMap - 可选，扩展默认映射表
 */
export function init(customMap = {}) {
    // 合并配置
    _config = { ..._config, ...customMap };

    // 初次运行
    runParser();

    // 如果已经有观察者，先断开
    if (_observer) _observer.disconnect();

    // 创建新的观察者
    _observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        // 快速过滤
        for (const m of mutations) {
            if (m.type === 'childList') {
                shouldUpdate = true;
                break;
            } else if (m.type === 'attributes' && m.attributeName === 'class') {
                shouldUpdate = true;
                break; 
            }
        }

        if (shouldUpdate) {
            // 在微任务中运行，或使用简单的防抖，这里直接运行保证响应速度
            // 对于极大页面，建议加 requestAnimationFrame
            runParser(); 
        }
    });

    _observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    console.log('%c JquanUI JIT Engine v1.0 Started ', 'background: #222; color: #bada55');
}

/**
 * 手动触发更新（用于极特殊情况下的动态内容）
 */
export function refresh() {
    runParser();
}

/**
 * 自动启动 (可选)
 * 如果检测到 script 标签上有 data-auto-init 属性
 */
if (typeof document !== 'undefined') {
    const currentScript = document.currentScript; // ES Module 中通常为 null，但为了兼容性保留
    // 在 Module 环境下，更推荐显式调用 init()
}
