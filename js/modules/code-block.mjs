/**
 * code-block.mjs - CAN Ultimate Production Edition v3.1 (Dynamic + Custom CSS)
 * 
 * 特性：
 * 1. 动态按需加载语言包 (性能极大优化)
 * 2. 智能缩进清洗 (Smart Dedent)
 * 3. 您的定制化 Tailwind 样式
 * 4. 交互优化 (固定悬浮按钮、Grid对齐、语言水印)
 */

import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/highlight.min.js';

// --- 配置常量 ---
const CDN_BASE = 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages';

// 语言别名映射 (用于动态加载时的文件名匹配)
const LANGUAGE_ALIASES = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'sh': 'bash',
    'zsh': 'bash',
    'html': 'xml',
    'vue': 'xml',
    'yml': 'yaml'
};

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
    selector: 'pre code', // 选择器，默认所有 pre 下的 code 元素
    showLineNumbers: true,  // 是否默认显示行号
    maxLines: 20,  // 最大显示行数，超过部分会被截断
    
    // 容器样式 (User Custom)
    containerClass: 'relative group rounded-lg text-gray-300 overflow-hidden my-4 font-mono text-sm border border-surface',
    
    // 滚动区域样式
    scrollWrapperClass: 'overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent',
    
    copyIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    checkIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    
    langLabel: true,  // 是否显示语言标签
    tabSize: 4
};

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
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('CAN: Legacy Copy Failed', err);
        }
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
        // console.warn(`CAN: Failed to load '${targetLang}', fallback to plaintext.`);
        return 'plaintext';
    }
}

/**
 * 处理单个代码块 (异步)
 */
async function processBlock(codeEl, config) {
    // 1. 预处理
    let rawHtml = codeEl.innerHTML;
    let rawText = decodeHTML(rawHtml);
    let formattedCode = normalizeIndent(rawText, config.tabSize);
    if (!formattedCode) return;
    // 提前计算行数，用于 UI 逻辑判断
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
    // 4. 高亮
    const highlightResult = hljs.highlight(formattedCode, { language: loadedLang, ignoreIllegals: true });
    
    // 5. DOM 重构
    const preEl = codeEl.closest('pre');
    if (!preEl) return;
    preEl.innerHTML = '';
    preEl.className = config.containerClass;
    // A. 语言水印 (优化：仅当行数 > 1 且配置开启时显示)
    if (config.langLabel && lineCount > 1) {
        const langBadge = document.createElement('div');
        langBadge.className = 'absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none select-none uppercase tracking-widest z-10';
        langBadge.innerText = loadedLang; // 显示实际加载的语言名
        preEl.appendChild(langBadge);
    }
    // B. 复制按钮 (User Custom: bg-white hover-bg-primary right-6)
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
    // (lines 和 lineCount 已在上方提前计算)
    // E. 行号列 (User Custom: text-gray-600 border-gray)
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
    // F. 代码列 (User Custom: text-gray-300 text-gray)
    const codeContentCol = document.createElement('div');
    codeContentCol.className = 'py-3 px-4 whitespace-pre font-mono text-sm leading-6 text-gray-300 text-gray';
    if (!config.showLineNumbers) codeContentCol.classList.add('pl-4');
    
    codeContentCol.innerHTML = highlightResult.value;
    
    gridLayout.appendChild(codeContentCol);
    scrollWrapper.appendChild(gridLayout);
    preEl.appendChild(scrollWrapper);
}

/**
 * 初始化入口
 */
export function initCodeHighlighter(userConfig = {}) {
    const config = { ...DEFAULT_CONFIG, ...userConfig };
    const codeBlocks = document.querySelectorAll(`${config.selector}:not(.hljs-done)`);
    
    if (codeBlocks.length === 0) return;

    codeBlocks.forEach(async (block) => {
        block.classList.add('hljs-done'); // 先标记防止重复
        await processBlock(block, config);
    });
}

export { hljs };
