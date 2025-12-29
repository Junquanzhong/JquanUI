/**
 * JquanUI JIT Engine (ES Module) - CAN Stable Core
 * 
 * 修复了正则贪婪匹配导致的属性截断问题。
 * 完美支持 URL、连字符属性 (min-w) 及任意变体。
 * 
 * @author Gemini-3-Pro & CAN
 * @version 3.2.1 (Smart Text Fix)
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

// 基础映射表
const PROP_MAP = {
    'w': 'width', 'h': 'height', 'min-w': 'min-width', 'max-w': 'max-width', 'min-h': 'min-height', 'max-h': 'max-height',
    'm': 'margin', 'mt': 'margin-top', 'mb': 'margin-bottom', 'ml': 'margin-left', 'mr': 'margin-right',
    'mx': ['margin-left', 'margin-right'], 'my': ['margin-top', 'margin-bottom'],
    'p': 'padding', 'pt': 'padding-top', 'pb': 'padding-bottom', 'pl': 'padding-left', 'pr': 'padding-right',
    'px': ['padding-left', 'padding-right'], 'py': ['padding-top', 'padding-bottom'],
    'fs': 'font-size', 'fw': 'font-weight', 'lh': 'line-height', 'ls': 'letter-spacing',
    'c': 'color', 
    // 注意：'text' 属性现在由 compileClass 内部的智能逻辑处理，此处仅作 align 别名保留
    'align': 'text-align', 'decoration': 'text-decoration',
    'bg-c': 'background-color', 'bg-img': 'background-image',
    'border': 'border-width', 'border-c': 'border-color', 'border-s': 'border-style',
    'rounded': 'border-radius', 
    'rounded-t': ['border-top-left-radius', 'border-top-right-radius'],
    'rounded-b': ['border-bottom-left-radius', 'border-bottom-right-radius'],
    'd': 'display', 'flex': 'flex', 'grow': 'flex-grow', 'shrink': 'flex-shrink', 'order': 'order',
    'grid-cols': 'grid-template-columns', 'gap': 'gap', 'justify': 'justify-content', 'items': 'align-items',
    'inset': ['top', 'right', 'bottom', 'left'], 'top': 'top', 'right': 'right', 'bottom': 'bottom', 'left': 'left',
    'pos': 'position', 'z': 'z-index',
    'opacity': 'opacity', 'shadow': 'box-shadow', 'outline': 'outline',
    'cursor': 'cursor', 'overflow': 'overflow', 'filter': 'filter',
    'transition': 'transition', 'transform': 'transform'
};

// ----------------------------------------------------------------------
// 2. 核心正则 (The Fix)
// ----------------------------------------------------------------------

// 匹配: prefix:prefix:prop-[value]
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
    styleEl.id = 'jquan-jit-v3-2-1';
    document.head.appendChild(styleEl);
    _styleSheet = styleEl.sheet;
    return _styleSheet;
}

function compileClass(fullClass) {
    if (_generatedClasses.has(fullClass) || _parseCache.has(fullClass)) return;
    
    // 基础过滤：必须包含 -[ 且不只是 !
    if (fullClass.indexOf('-[') === -1) {
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
        const propKey = match[3];     // 如 "bg", "text", "min-w"
        let propValue = match[4];     // 如 "center", "#fff", "url(...)"

        // 1. 值处理: 只有非 url 才替换下划线
        if (!propValue.startsWith('url(')) {
            propValue = propValue.replace(/_/g, ' ');
        }

        // 2. 属性映射 (Property Mapping)
        let cssProps = [];

        // === 智能属性处理 ===
        if (propKey === 'bg') {
            // Smart BG
            if (propValue.startsWith('url(') || propValue.includes('gradient(')) {
                cssProps = ['background-image'];
            } else if (/^(#|rgb|hsl|[a-z]+$)/.test(propValue)) {
                cssProps = ['background-color'];
            } else {
                cssProps = ['background'];
            }
        } 
        else if (propKey === 'text') {
            // Smart Text (Fix for .text-[center])
            if (/^(center|left|right|justify|start|end)$/.test(propValue)) {
                cssProps = ['text-align'];
            } else if (/^(\d+(px|rem|em|%)|calc|var)/.test(propValue)) {
                cssProps = ['font-size']; // 允许 text-[16px]
            } else {
                cssProps = ['color']; // 默认 text-[#333]
            }
        }
        else if (PROP_MAP[propKey]) {
            // Standard Map
            cssProps = Array.isArray(PROP_MAP[propKey]) ? PROP_MAP[propKey] : [PROP_MAP[propKey]];
        } 
        else if (propKey.startsWith('--')) {
            // CSS Variables
            cssProps = [propKey];
        } 
        else {
            // Unknown Property
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
                    // 任意变体 [&_img]
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
    console.log('%c JquanUI JIT v3.2.1 (Fixed) ', 'background: #0ea5e9; color: #fff; padding: 2px 5px;');
}

export function refresh() { scan(); }

if (typeof document !== 'undefined' && document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    init();
}
