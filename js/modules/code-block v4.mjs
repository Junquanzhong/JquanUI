/**
 * code-block.mjs - CAN Ultimate Production Edition v4.0.0 (CSS Custom Highlight API)
 * 
 * 特性：
 * 1. 动态按需加载语言包 (性能极大优化)
 * 2. 智能缩进清洗 (Smart Dedent)
 * 3. CSS Custom Highlight API 渲染语法高亮（零 DOM 标签污染）
 * 4. 不支持 Highlight API 的浏览器自动降级为 hljs innerHTML 传统方案
 * 5. 交互优化 (固定悬浮按钮、Grid对齐、语言水印)
 * 6. 您的定制化 Tailwind 样式
 */

import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/highlight.min.js';

// --- 配置常量 ---
const CDN_BASE = 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages';

// 是否支持 CSS Custom Highlight API
const SUPPORTS_HIGHLIGHT_API = !!(globalThis.CSS?.highlights && typeof Highlight !== 'undefined');

// 语言别名映射
const LANGUAGE_ALIASES = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'sh': 'bash',
    'zsh': 'bash',
    'html': 'html',
    'vue': 'vue',
    'yml': 'yaml'
};

// hljs scope → highlight name 映射前缀
const HIGHLIGHT_PREFIX = 'code-hl-';

// 全局计数器，确保每个代码块的 highlight name 唯一
let blockIdCounter = 0;

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
    selector: 'pre code',
    showLineNumbers: true,
    maxLines: 20,

    containerClass: 'relative group rounded-lg text-gray-300 overflow-hidden my-4 font-mono text-sm border border-surface',
    scrollWrapperClass: 'overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent',

    copyIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    checkIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,

    langLabel: true,
    tabSize: 4
};

// ============================================================
//  One Dark Pro 配色 — hljs scope → CSS 样式映射
//  所有颜色在 injectHighlightStyles() 中以 ::highlight() 注入
// ============================================================
const SCOPE_STYLES = {
    // --- 关键字 / 语言结构 ---
    'keyword':              { color: '#c678dd' },
    'built_in':             { color: '#e5c07b' },
    'type':                 { color: '#e5c07b' },
    'literal':              { color: '#d19a66' },
    'number':               { color: '#d19a66' },
    'operator':             { color: '#56b6c2' },
    'punctuation':          { color: '#abb2bf' },

    // --- 字符串 / 正则 ---
    'string':               { color: '#98c379' },
    'regexp':               { color: '#98c379' },
    'subst':                { color: '#e06c75' },

    // --- 注释 / 文档 ---
    'comment':              { color: '#5c6370', fontStyle: 'italic' },
    'doctag':               { color: '#c678dd' },

    // --- 函数 / 类 / 变量 ---
    'title':                { color: '#61afef' },
    'title.function':       { color: '#61afef' },
    'title.class':          { color: '#e5c07b' },
    'title.class.inherited':{ color: '#98c379' },
    'function':             { color: '#61afef' },
    'params':               { color: '#abb2bf' },
    'variable':             { color: '#e06c75' },
    'variable.language':    { color: '#e06c75' },
    'variable.constant':    { color: '#d19a66' },
    'property':             { color: '#e06c75' },

    // --- 标签 / 属性 (HTML/XML) ---
    'tag':                  { color: '#e06c75' },
    'name':                 { color: '#e06c75' },
    'attr':                 { color: '#d19a66' },
    'attribute':            { color: '#d19a66' },

    // --- 模板 / 元数据 ---
    'meta':                 { color: '#61afef' },
    'meta.keyword':         { color: '#c678dd' },
    'meta.string':          { color: '#98c379' },
    'template-tag':         { color: '#c678dd' },
    'template-variable':    { color: '#e06c75' },

    // --- CSS 专用 ---
    'selector-tag':         { color: '#e06c75' },
    'selector-id':          { color: '#61afef' },
    'selector-class':       { color: '#e5c07b' },
    'selector-attr':        { color: '#d19a66' },
    'selector-pseudo':      { color: '#56b6c2' },

    // --- Diff ---
    'addition':             { color: '#98c379', backgroundColor: 'rgba(152,195,121,0.1)' },
    'deletion':             { color: '#e06c75', backgroundColor: 'rgba(224,108,117,0.1)' },

    // --- 其他 ---
    'section':              { color: '#61afef' },
    'bullet':               { color: '#d19a66' },
    'symbol':               { color: '#56b6c2' },
    'link':                 { color: '#56b6c2', textDecoration: 'underline' },
    'emphasis':             { fontStyle: 'italic' },
    'strong':               { fontWeight: 'bold' },
    'formula':              { color: '#56b6c2' },
    'quote':                { color: '#5c6370', fontStyle: 'italic' },
};

// ============================================================
//  样式注入（只执行一次）
// ============================================================
let stylesInjected = false;

/**
 * 注入 ::highlight() 样式到页面
 * 为每个 scope 生成两种规则：
 *   1. 通用规则：::highlight(code-hl-keyword) —— 用于 Highlight API
 *   2. 降级规则：.hljs-keyword —— 用于传统 hljs 方案
 */
function injectHighlightStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    let css = '';

    for (const [scope, styles] of Object.entries(SCOPE_STYLES)) {
        // CSS Custom Highlight API 的名称需要把 "." 替换为 "-"
        const highlightName = HIGHLIGHT_PREFIX + scope.replace(/\./g, '-');

        // ::highlight() 规则（仅支持文本装饰类属性）
        if (SUPPORTS_HIGHLIGHT_API) {
            let highlightProps = '';
            if (styles.color) highlightProps += `color: ${styles.color}; `;
            if (styles.backgroundColor) highlightProps += `background-color: ${styles.backgroundColor}; `;
            if (styles.textDecoration) highlightProps += `text-decoration: ${styles.textDecoration}; `;
            // 注意：::highlight() 不支持 font-style / font-weight，但仍写入以备未来浏览器支持
            // 目前这些属性会被浏览器忽略，不会报错

            if (highlightProps) {
                css += `::highlight(${highlightName}) { ${highlightProps}}\n`;
            }
        }

        // 降级方案：传统 hljs class 规则
        // hljs 生成的类名规则：scope "title.function" → class "hljs-title function_"
        const hljsClass = scope.split('.').map((part, i) => i === 0 ? `hljs-${part}` : `${part}_`).join('.');
        let fallbackProps = '';
        if (styles.color) fallbackProps += `color: ${styles.color}; `;
        if (styles.backgroundColor) fallbackProps += `background-color: ${styles.backgroundColor}; `;
        if (styles.textDecoration) fallbackProps += `text-decoration: ${styles.textDecoration}; `;
        if (styles.fontStyle) fallbackProps += `font-style: ${styles.fontStyle}; `;
        if (styles.fontWeight) fallbackProps += `font-weight: ${styles.fontWeight}; `;

        if (fallbackProps) {
            // 对于多级 scope 如 "title.function"，hljs 会生成 <span class="hljs-title function_">
            // 我们需要用 .hljs-title.function_ 选择器
            const selectorParts = scope.split('.');
            let selector;
            if (selectorParts.length === 1) {
                selector = `.hljs-${selectorParts[0]}`;
            } else {
                selector = `.hljs-${selectorParts[0]}` + selectorParts.slice(1).map(p => `.${p}_`).join('');
            }
            css += `${selector} { ${fallbackProps}}\n`;
        }
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'code-block-highlight-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
}

// ============================================================
//  工具函数
// ============================================================

/**
 * HTML 实体解码
 */
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

/**
 * 智能去缩进与格式化
 */
function normalizeIndent(text, tabSize = 4) {
    if (!text) return text;
    const lines = text.replace(/\r\n/g, '\n').split('\n');

    while (lines.length > 0 && lines[0].trim() === '') lines.shift();
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

    if (lines.length === 0) return '';

    let minIndent = Infinity;
    lines.forEach(line => {
        if (line.trim().length > 0) {
            const match = line.match(/^ */);
            const indentLen = match ? match[0].length : 0;
            if (indentLen < minIndent) minIndent = indentLen;
        }
    });
    if (minIndent === Infinity) minIndent = 0;

    const spaces = ' '.repeat(tabSize);
    return lines.map(line => {
        let content = line.length >= minIndent ? line.substring(minIndent) : line;
        return content.replace(/\t/g, spaces);
    }).join('\n');
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (err) { console.error('CAN: Legacy Copy Failed', err); }
        textArea.remove();
    }
}

/**
 * 动态加载语言包
 */
async function loadLanguage(lang) {
    let targetLang = lang.toLowerCase();
    if (LANGUAGE_ALIASES[targetLang]) {
        targetLang = LANGUAGE_ALIASES[targetLang];
    }
    if (hljs.getLanguage(targetLang)) return targetLang;

    try {
        const module = await import(`${CDN_BASE}/${targetLang}.min.js`);
        hljs.registerLanguage(targetLang, module.default);
        return targetLang;
    } catch (error) {
        return 'plaintext';
    }
}

// ============================================================
//  hljs Emitter 树 → Token 位置列表
// ============================================================

/**
 * 从 hljs 的 _emitter 树中提取 token 信息
 * 
 * hljs 内部的 emitter 树结构大致为：
 * {
 *   rootNode: {
 *     children: [
 *       "plain text string",
 *       { kind: "keyword", children: ["const"] },
 *       " ",
 *       { kind: "title", children: [
 *         { kind: "function", children: ["myFunc"] }
 *       ]},
 *       ...
 *     ]
 *   }
 * }
 * 
 * 我们需要递归遍历这棵树，记录每个有 kind（scope）的文本节点
 * 的全局字符偏移量 [start, end) 和对应的 scope 路径。
 * 
 * @param {Object} emitterResult - hljs.highlight() 的返回值
 * @returns {Array<{scope: string, start: number, end: number}>}
 */
function extractTokens(emitterResult) {
    const tokens = [];
    let offset = 0;

    function walk(node, scopeStack) {
        if (!node) return;

        // 文本节点（叶子）
        if (typeof node === 'string') {
            const len = node.length;
            if (len > 0 && scopeStack.length > 0) {
                // 取最深层的完整 scope 路径
                const scope = scopeStack.join('.');
                tokens.push({ scope, start: offset, end: offset + len });
            }
            offset += len;
            return;
        }

        // 容器节点
        if (node.children && Array.isArray(node.children)) {
            const nextStack = node.kind ? [...scopeStack, node.kind] : scopeStack;
            for (const child of node.children) {
                walk(child, nextStack);
            }
        }
    }

    // hljs _emitter 的根节点
    const root = emitterResult._emitter?.rootNode || emitterResult._emitter?.root;
    if (root) {
        walk(root, []);
    }

    return tokens;
}

/**
 * 收集 DOM 元素下的所有文本节点
 */
function getTextNodes(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
}

/**
 * 构建文本节点偏移映射表
 */
function buildNodeMap(textNodes) {
    let fullLength = 0;
    const nodeMap = [];
    for (const node of textNodes) {
        const start = fullLength;
        fullLength += node.textContent.length;
        nodeMap.push({ node, start, end: fullLength });
    }
    return { nodeMap, fullLength };
}

/**
 * 根据全局偏移量创建 Range（支持跨文本节点）
 */
function createRangeFromOffsets(nodeMap, globalStart, globalEnd) {
    const range = new Range();
    let startSet = false;

    for (const { node, start, end } of nodeMap) {
        if (!startSet && globalStart < end) {
            range.setStart(node, Math.max(0, globalStart - start));
            startSet = true;
        }
        if (startSet && globalEnd <= end) {
            range.setEnd(node, Math.max(0, globalEnd - start));
            return range;
        }
    }
    return null;
}

// ============================================================
//  渲染器：Custom Highlight API
// ============================================================

/**
 * 使用 CSS Custom Highlight API 渲染语法高亮
 * 
 * @param {HTMLElement} codeContentEl - 包含纯文本的代码容器元素
 * @param {string} formattedCode - 格式化后的纯文本代码
 * @param {Object} highlightResult - hljs.highlight() 的返回值
 * @param {number} blockId - 当前代码块的唯一 ID
 */
function renderWithHighlightAPI(codeContentEl, formattedCode, highlightResult, blockId) {
    // 将纯文本放入 DOM（此时 DOM 中只有纯文本节点，零标签）
    codeContentEl.textContent = formattedCode;

    // 提取 token 列表
    const tokens = extractTokens(highlightResult);
    if (tokens.length === 0) return;

    // 构建文本节点映射
    const textNodes = getTextNodes(codeContentEl);
    const { nodeMap } = buildNodeMap(textNodes);

    // 按 scope 分组收集 Range
    const scopeRanges = {};

    for (const token of tokens) {
        // 将多级 scope 如 "title.function" 的每一层都注册
        // 这样 CSS 中既可以用 ::highlight(code-hl-title) 设置通用样式
        // 也可以用 ::highlight(code-hl-title-function) 设置精确样式
        // 但我们优先使用最精确（最深层）的 scope

        const scopeKey = token.scope;
        // 规范化 scope 名称：替换 "." 为 "-"
        const highlightName = HIGHLIGHT_PREFIX + scopeKey.replace(/\./g, '-');

        const range = createRangeFromOffsets(nodeMap, token.start, token.end);
        if (!range) continue;

        if (!scopeRanges[highlightName]) {
            scopeRanges[highlightName] = [];
        }
        scopeRanges[highlightName].push(range);
    }

    // 注册所有 Highlight 到 CSS.highlights
    for (const [name, ranges] of Object.entries(scopeRanges)) {
        if (ranges.length > 0) {
            const highlight = new Highlight(...ranges);
            // 使用全局名称，确保多个代码块的同类 scope 共享同一个 highlight name
            // 因为 ::highlight(name) 的样式是全局的，多个 Highlight 实例可以共用同一个 name
            // 如果已存在同名 highlight，需要合并 ranges
            const existing = CSS.highlights.get(name);
            if (existing) {
                // Highlight 对象是一个 Set<Range>，可以直接 add
                for (const r of ranges) {
                    existing.add(r);
                }
            } else {
                CSS.highlights.set(name, highlight);
            }
        }
    }
}

/**
 * 使用传统 hljs innerHTML 渲染（降级方案）
 */
function renderWithInnerHTML(codeContentEl, highlightResult) {
    codeContentEl.innerHTML = highlightResult.value;
}

// ============================================================
//  处理单个代码块
// ============================================================

/**
 * 记录每个代码块注册的 Range 引用，以便后续清理（如果需要）
 */
const blockRegistry = new Map();

/**
 * 处理单个代码块 (异步)
 */
async function processBlock(codeEl, config) {
    // 1. 预处理
    const rawHtml = codeEl.innerHTML;
    const rawText = decodeHTML(rawHtml);
    const formattedCode = normalizeIndent(rawText, config.tabSize);
    if (!formattedCode) return;

    const lines = formattedCode.split('\n');
    const lineCount = lines.length;

    // 2. 识别语言
    let lang = 'plaintext';
    const classList = Array.from(codeEl.classList);
    const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
    if (langClass) {
        lang = langClass.replace(/^(language-|lang-)/, '');
    } else if (codeEl.dataset.language) {
        lang = codeEl.dataset.language;
    }

    // 3. 动态加载语言
    const loadedLang = await loadLanguage(lang);

    // 4. hljs 高亮（仅做词法分析）
    const highlightResult = hljs.highlight(formattedCode, { language: loadedLang, ignoreIllegals: true });

    // 5. DOM 重构
    const preEl = codeEl.closest('pre');
    if (!preEl) return;

    const blockId = blockIdCounter++;
    preEl.innerHTML = '';
    preEl.className = config.containerClass;
    preEl.dataset.codeBlockId = blockId;

    // A. 语言水印
    if (config.langLabel && lineCount > 1) {
        const langBadge = document.createElement('div');
        langBadge.className = 'absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none select-none uppercase tracking-widest z-10';
        langBadge.innerText = loadedLang;
        preEl.appendChild(langBadge);
    }

    // B. 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'absolute top-3 right-3 p-1.5 rounded-md bg-white hover-bg-primary text-gray-400 hover-text-white transition-all z-20 focus-outline-none backdrop-blur-sm';
    copyBtn.innerHTML = config.copyIcon;
    copyBtn.title = "复制代码";
    copyBtn.addEventListener('click', async () => {
        try {
            await copyToClipboard(formattedCode);
            copyBtn.innerHTML = config.checkIcon;
            copyBtn.classList.add('text-green-400');
            setTimeout(() => {
                copyBtn.innerHTML = config.copyIcon;
                copyBtn.classList.remove('text-green-400');
            }, 2000);
        } catch (e) { console.error(e); }
    });
    preEl.appendChild(copyBtn);

    // C. 滚动视口
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = config.scrollWrapperClass;

    // D. Grid 布局
    const gridLayout = document.createElement('div');
    gridLayout.className = 'grid grid-cols-[auto_1fr] gap-0 min-w-full';

    // E. 行号列
    if (config.showLineNumbers) {
        const lineNumCol = document.createElement('div');
        lineNumCol.className = 'flex flex-col text-right select-none text-gray-600 border-r border-gray py-3 pr-3 pl-3 text-xs leading-6';
        let nums = '';
        for (let i = 1; i <= lineCount; i++) {
            nums += `<span class="h-6 block">${i}</span>`;
        }
        lineNumCol.innerHTML = nums;
        gridLayout.appendChild(lineNumCol);
    }

    // F. 代码列
    const codeContentCol = document.createElement('div');
    codeContentCol.className = 'py-3 px-4 whitespace-pre font-mono text-sm leading-6 text-gray-300 text-gray';
    if (!config.showLineNumbers) codeContentCol.classList.add('pl-4');

    // ★ 核心分歧点：选择渲染方式
    if (SUPPORTS_HIGHLIGHT_API) {
        renderWithHighlightAPI(codeContentCol, formattedCode, highlightResult, blockId);
    } else {
        renderWithInnerHTML(codeContentCol, highlightResult);
    }

    gridLayout.appendChild(codeContentCol);
    scrollWrapper.appendChild(gridLayout);
    preEl.appendChild(scrollWrapper);

    // 记录到注册表
    blockRegistry.set(blockId, { preEl, codeContentCol });
}

// ============================================================
//  公共 API
// ============================================================

/**
 * 初始化入口
 */
export function initCodeHighlighter(userConfig = {}) {
    const config = { ...DEFAULT_CONFIG, ...userConfig };

    // 注入样式（只执行一次）
    injectHighlightStyles();

    const codeBlocks = document.querySelectorAll(`${config.selector}:not(.hljs-done)`);
    if (codeBlocks.length === 0) return;

    codeBlocks.forEach(async (block) => {
        block.classList.add('hljs-done');
        await processBlock(block, config);
    });
}

/**
 * 清理所有 Custom Highlight（用于 SPA 路由切换等场景）
 */
export function clearAllHighlights() {
    if (!SUPPORTS_HIGHLIGHT_API) return;

    for (const key of CSS.highlights.keys()) {
        if (key.startsWith(HIGHLIGHT_PREFIX)) {
            CSS.highlights.delete(key);
        }
    }
    blockRegistry.clear();
    blockIdCounter = 0;
}

/**
 * 检测当前浏览器是否使用 Custom Highlight API
 */
export function isUsingHighlightAPI() {
    return SUPPORTS_HIGHLIGHT_API;
}

export { hljs };
