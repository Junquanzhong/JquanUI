/**
 * JquanUI JIT Engine (ES Module) - CAN Stable Core
 * 
 * 修复了正则贪婪匹配导致的属性截断问题。
 * 完美支持 URL、连字符属性 (min-w) 及任意变体。
 * 
 * @author Gemini-3-Pro & CAN
 * @version 3.3.0 (Regex Overhaul)
 * @license MIT
 */

// ----------------------------------------------------------------------
// 1. 配置
// ----------------------------------------------------------------------

const BREAKPOINTS = {
    'sm': '640px', 'md': '768px', 'lg': '1024px', 'xl': '1280px', '2xl': '1536px',
};

const PSEUDO_MAP = {
    'hover': ':hover', 'focus': ':focus', 'active': ':active', 
    'visited': ':visited', 'disabled': ':disabled', 
    'first': ':first-child', 'last': ':last-child', 
    'odd': ':nth-child(odd)', 'even': ':nth-child(even)',
    'before': '::before', 'after': '::after', 'placeholder': '::placeholder',
};

const PROP_MAP = {
    // --- 尺寸 (Dimensions) ---
    'w': 'width', 'h': 'height', 'size': ['width', 'height'], // 新增: 同时设置宽高
    'min-w': 'min-width', 'max-w': 'max-width', 
    'min-h': 'min-height', 'max-h': 'max-height',
    'min-s': ['min-width', 'min-height'], // 新增
    'max-s': ['max-width', 'max-height'], // 新增
    // --- 间距 (Spacing) ---
    'm': 'margin', 'mt': 'margin-top', 'mb': 'margin-bottom', 'ml': 'margin-left', 'mr': 'margin-right',
    'mx': ['margin-left', 'margin-right'], 'my': ['margin-top', 'margin-bottom'],
    'p': 'padding', 'pt': 'padding-top', 'pb': 'padding-bottom', 'pl': 'padding-left', 'pr': 'padding-right',
    'px': ['padding-left', 'padding-right'], 'py': ['padding-top', 'padding-bottom'],
    // --- 排版 (Typography) ---
    'fs': 'font-size', 'fw': 'font-weight', 
    'lh': 'line-height', 'ls': 'letter-spacing',
    'c': 'color', 'text': 'color', 
    'align': 'text-align', 'align-v': 'vertical-align', // 新增
    'decoration': 'text-decoration', 'indent': 'text-indent', // 新增
    'whitespace': 'white-space', 'break': 'word-break', // 新增
    'content': 'content', // 用于 ::before/::after
    // --- 背景 (Background) ---
    'bg-c': 'background-color', 'bg-img': 'background-image',
    'bg-size': 'background-size', 'bg-pos': 'background-position', // 新增
    'bg-rep': 'background-repeat', 'bg-att': 'background-attachment', // 新增
    'bg-clip': 'background-clip', // 新增
    // --- 边框与圆角 (Borders & Radius) ---
    'border': 'border-width', 'border-c': 'border-color', 'border-s': 'border-style',
    'border-t': 'border-top-width', 'border-b': 'border-bottom-width',
    'border-l': 'border-left-width', 'border-r': 'border-right-width',
    'border-x': ['border-left-width', 'border-right-width'],
    'border-y': ['border-top-width', 'border-bottom-width'],
    'rounded': 'border-radius', 
    'rounded-t': ['border-top-left-radius', 'border-top-right-radius'],
    'rounded-b': ['border-bottom-left-radius', 'border-bottom-right-radius'],
    'rounded-l': ['border-top-left-radius', 'border-bottom-left-radius'], // 新增
    'rounded-r': ['border-top-right-radius', 'border-bottom-right-radius'], // 新增
    'rounded-tl': 'border-top-left-radius', 'rounded-tr': 'border-top-right-radius', // 新增
    'rounded-bl': 'border-bottom-left-radius', 'rounded-br': 'border-bottom-right-radius', // 新增
    'outline': 'outline', 'outline-o': 'outline-offset', 'outline-w': 'outline-width', 'outline-c': 'outline-color', // 新增细节
    // --- Flexbox & Grid ---
    'd': 'display', 
    'flex': 'flex', 'dir': 'flex-direction', 'wrap': 'flex-wrap', 'basis': 'flex-basis', // 新增
    'grow': 'flex-grow', 'shrink': 'flex-shrink', 'order': 'order',
    'grid-cols': 'grid-template-columns', 'grid-rows': 'grid-template-rows', // 新增
    'col': 'grid-column', 'row': 'grid-row', // 新增
    'gap': 'gap', 'gap-x': 'column-gap', 'gap-y': 'row-gap', // 新增
    'justify': 'justify-content', 'justify-items': 'justify-items', 'justify-self': 'justify-self', // 新增
    'items': 'align-items', 'content': 'align-content', 'self': 'align-self', // 新增
    'place': 'place-content', 'place-items': 'place-items', 'place-self': 'place-self', // 新增
    // --- 定位 (Positioning) ---
    'pos': 'position', 'z': 'z-index',
    'inset': ['top', 'right', 'bottom', 'left'], 
    'inset-x': ['left', 'right'], 'inset-y': ['top', 'bottom'], // 新增
    'top': 'top', 'right': 'right', 'bottom': 'bottom', 'left': 'left',
    'float': 'float', 'clear': 'clear', // 新增
    // --- 视觉效果 (Visual Effects) ---
    'opacity': 'opacity', 'shadow': 'box-shadow', 
    'blend': 'mix-blend-mode', // 新增
    'filter': 'filter', 'backdrop': 'backdrop-filter', // 新增
    'cursor': 'cursor', 'select': 'user-select', 'pointer': 'pointer-events', 'resize': 'resize', // 新增交互类
    'visible': 'visibility', // 新增
    'object': 'object-fit', 'object-pos': 'object-position', // 新增
    // --- 变换与过渡 (Transform & Transition) ---
    'transition': 'transition', 'duration': 'transition-duration', 'delay': 'transition-delay', 'ease': 'transition-timing-function', // 新增细节
    'transform': 'transform', 'origin': 'transform-origin', // 新增
    // --- SVG ---
    'fill': 'fill', 'stroke': 'stroke', 'stroke-w': 'stroke-width', // 新增
    
    // --- 溢出 (Overflow) ---
    'overflow': 'overflow', 'overflow-x': 'overflow-x', 'overflow-y': 'overflow-y' // 新增
};

// ----------------------------------------------------------------------
// 2. 核心正则 (The Fix)
// ----------------------------------------------------------------------

// 分组解释:
// 1. Prefix Chain: ^((?:[^:]+:)*)  -> 从开头匹配，必须以冒号结尾，可以重复 (如 md:hover:)
// 2. Important:    (!?)            -> 可选的 !
// 3. Property:     ([a-z0-9-]+)    -> 属性名 (支持连字符，如 min-w)
//    Separator:    -\[             -> 必须是 -[
// 4. Value:        (.+)            -> 值 (贪婪匹配直到最后的 ])
//    End:          \]$             -> 必须以 ] 结尾
const PARSE_REGEX = /^((?:[^:]+:)*)(!?)([a-z0-9-]+)-\[(.+)\]$/;

// ----------------------------------------------------------------------
// 3. 编译逻辑
// ----------------------------------------------------------------------

const _generatedClasses = new Set();
const _parseCache = new Map();
let _styleSheet = null;

function getStyleSheet() {
    if (_styleSheet) return _styleSheet;
    const styleEl = document.createElement('style');
    styleEl.id = 'jquan-jit-v3-2';
    document.head.appendChild(styleEl);
    _styleSheet = styleEl.sheet;
    return _styleSheet;
}

function compileClass(fullClass) {
    if (_generatedClasses.has(fullClass) || _parseCache.has(fullClass)) return;
    
    // 基础过滤
    if (!fullClass.includes('-[') && !fullClass.includes('!')) {
        _parseCache.set(fullClass, false);
        return;
    }

    try {
        const match = fullClass.match(PARSE_REGEX);
        
        if (!match) {
            _parseCache.set(fullClass, false);
            return;
        }

        const prefixChain = match[1]; // 如 "md:hover:"
        const isImportant = match[2] === '!';
        const propKey = match[3];     // 如 "bg" 或 "min-w"
        let propValue = match[4];     // 如 "url('...')"

        // 1. 值处理: 只有非 url 才替换下划线
        if (!propValue.startsWith('url(')) {
            propValue = propValue.replace(/_/g, ' ');
        }

        // 2. 属性映射
        let cssProps = [];
        if (propKey === 'bg') {
            // 智能背景判断
            if (propValue.startsWith('url(') || propValue.includes('gradient(')) {
                cssProps = ['background-image'];
            } else if (/^(#|rgb|hsl|[a-z]+$)/.test(propValue)) {
                cssProps = ['background-color'];
            } else {
                cssProps = ['background'];
            }
        } else if (PROP_MAP[propKey]) {
            cssProps = Array.isArray(PROP_MAP[propKey]) ? PROP_MAP[propKey] : [PROP_MAP[propKey]];
        } else if (propKey.startsWith('--')) {
            cssProps = [propKey];
        } else {
            // 未知属性
            _parseCache.set(fullClass, false);
            return;
        }

        // 3. 构建 CSS
        const priority = isImportant ? ' !important' : '';
        const declarations = cssProps.map(p => `${p}: ${propValue}${priority};`).join(' ');

        // 4. 处理选择器 (Prefixes)
        let mediaQuery = null;
        let pseudoSelector = '';
        let parentSelector = '';

        if (prefixChain) {
            const parts = prefixChain.slice(0, -1).split(':'); // 去掉末尾冒号
            for (const part of parts) {
                if (BREAKPOINTS[part]) {
                    mediaQuery = `@media (min-width: ${BREAKPOINTS[part]})`;
                } else if (PSEUDO_MAP[part]) {
                    pseudoSelector += PSEUDO_MAP[part];
                } else if (part.startsWith('[') && part.endsWith(']')) {
                    // 任意变体 [&_img] -> 去括号 -> 替换_ -> & img
                    const raw = part.slice(1, -1).replace(/_/g, ' ');
                    parentSelector = raw.includes('&') ? raw : `& ${raw}`;
                } else if (part === 'dark') {
                    parentSelector = `.dark &`;
                }
            }
        }

        // 5. 组合最终规则
        const escapedClass = `.${CSS.escape(fullClass)}`;
        let finalSelector = escapedClass;

        if (parentSelector) {
            finalSelector = parentSelector.replace(/&/g, escapedClass);
        }
        finalSelector += pseudoSelector;

        let cssRule = `${finalSelector} { ${declarations} }`;
        if (mediaQuery) {
            cssRule = `${mediaQuery} { ${cssRule} }`;
        }

        const sheet = getStyleSheet();
        sheet.insertRule(cssRule, sheet.cssRules.length);
        _generatedClasses.add(fullClass);

    } catch (e) {
        console.warn(`[JquanUI] Error: ${fullClass}`, e);
        _parseCache.set(fullClass, false);
    }
}

// ----------------------------------------------------------------------
// 4. 扫描器
// ----------------------------------------------------------------------

function scan() {
    const elements = document.querySelectorAll('*[class]');
    for (let i = 0; i < elements.length; i++) {
        const classes = elements[i].classList;
        for (let j = 0; j < classes.length; j++) {
            const cls = classes[j];
            // 只处理包含 -[ 的类名
            if (cls.indexOf('-[') > 0) { 
                compileClass(cls);
            }
        }
    }
}

// ----------------------------------------------------------------------
// 5. 初始化
// ----------------------------------------------------------------------

let _observer = null;

export function init(customMap = {}) {
    Object.assign(PROP_MAP, customMap);
    scan();

    if (_observer) _observer.disconnect();
    _observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (const m of mutations) {
            if ((m.type === 'childList' && m.addedNodes.length) || 
                (m.type === 'attributes' && m.attributeName === 'class')) {
                shouldScan = true; break;
            }
        }
        if (shouldScan) scan();
    });

    _observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    console.log('%c JquanUI JIT v3.2 (Stable) ', 'background: #2563eb; color: #fff; padding: 2px 5px;');
}

export function refresh() { scan(); }

if (typeof document !== 'undefined' && document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    init();
}
