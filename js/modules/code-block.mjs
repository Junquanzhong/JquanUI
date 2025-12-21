// code-highlighter.mjs (新增高度限制优化版)

import hljs from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/highlight.min.js';
import { copyText } from './copy.mjs'; // 请根据你的实际路径调整

// 引入你需要的语言包
import javascript from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/javascript.min.js';
import python from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/python.min.js';
import xml from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/xml.min.js';
import css from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/css.min.js';
import vbscript from 'https://unpkg.com/@highlightjs/cdn-assets@11.9.0/es/languages/vbscript.min.js';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('mjs', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('vba', vbscript);

/**
 * 【核心功能】利用 Shadow DOM 安全地转义代码中的文本内容
 * 此函数会保留代码语法符号（如 {}, []），但转义具有HTML特殊含义的字符（如 <, >, &）。
 * @param {string} rawHtml - 从 codeElement.innerHTML 获取的原始HTML字符串
 * @returns {string} - 安全的、已转义的HTML字符串，准备好交给 highlight.js
 */
function getSafeCodeFromHtml(rawHtml) {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = rawHtml;

    const escapeTextNodes = (node) => {
        
        node.childNodes.forEach(escapeTextNodes);

    };

    shadowRoot.childNodes.forEach(escapeTextNodes);
    return shadowRoot.innerHTML;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
    codeBlockSelector: 'pre code.code-block',
    showLinesByDefault: true,
    copyButtonText: '复制',
    copiedButtonText: '已复制!',
    copiedTextDuration: 2000,
};

/**
 * 使用 Grid 布局创建完美的行号对齐
 * @param {HTMLElement} codeElement - 高亮后的 <code> 元素
 */
function applyLineNumbersWithGrid(codeElement) {
    const originalText = codeElement.dataset.originalText;
    const lines = originalText.split('\n');
    
    const lineCount = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;

    if (lineCount <= 0 && originalText.trim() === '') {
        return;
    }

    const gridWrapper = document.createElement('div');
    gridWrapper.classList.add('grid', 'grid-sidebar' ,'sidebar-w-12');

    const lineNumbersContainer = document.createElement('div');
    lineNumbersContainer.setAttribute('aria-hidden', 'true');
    lineNumbersContainer.classList.add('text-right','pr-2', 'border-solid', 'border-gray-300', 'border-r', 'text-gray-400','pl-3', 'select-none');

    for (let i = 1; i <= lineCount; i++) {
        const lineSpan = document.createElement('span');
        lineSpan.textContent = i;
        lineSpan.classList.add('block','text-center','w-auto','text-sm','leading-6');
        lineNumbersContainer.appendChild(lineSpan);
    }

    const codeContentContainer = document.createElement('div');
    const highlightedLines = codeElement.innerHTML.split('\n');
    const linesHtml = highlightedLines.map(line => `<span class="code-line pl-5 inline-block">${line || '<br>'}</span>`).join('\n');
    codeContentContainer.innerHTML = linesHtml;

    lineNumbersContainer.classList.add('text-sm','leading-6');
    codeContentContainer.classList.add('text-sm','leading-6');

    gridWrapper.appendChild(lineNumbersContainer);
    gridWrapper.appendChild(codeContentContainer);

    codeElement.innerHTML = '';
    codeElement.appendChild(gridWrapper);
}

/**
 * 渲染代码块
 * @param {HTMLElement} codeElement - <code> DOM 元素
 * @param {object} config - 配置对象
 */
function renderCodeBlock(codeElement, globalConfig) {
    const preElement = codeElement.closest('pre');
    if (!preElement) {
        console.warn('CAN: 代码块没有被 <pre> 标签包裹，已跳过处理:', codeElement);
        return;
    }

    const rawCodeHtml = codeElement.innerHTML.trim();
    const tempEl = document.createElement('div');
    tempEl.innerHTML = rawCodeHtml;
    const originalCode = tempEl.textContent;

    if (!originalCode) {
        console.warn('CAN: 代码块内容为空，已跳过处理。', codeElement);
        return;
    }

    // 【新增优化点】提前计算行数，用于后续判断
    const lines = originalCode.split('\n');
    const lineCount = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
    
    const safeCodeForHighlighting = getSafeCodeFromHtml(rawCodeHtml);

    let language = codeElement.dataset.language || 'plaintext';
    if (!hljs.getLanguage(language)) {
        console.warn(`CAN: 未知语言 "${language}", 已回退到 "plaintext".`);
        language = 'plaintext';
    }

    const showLines = codeElement.dataset.showLines === 'true' || (!('showLines' in codeElement.dataset) && globalConfig.showLinesByDefault);

    codeElement.dataset.originalText = originalCode;

    const result = hljs.highlight(safeCodeForHighlighting, { language, ignoreIllegals: true });
    
    codeElement.innerHTML = result.value;
    codeElement.classList.add('hljs', `language-${language}`);

    if (showLines) {
        applyLineNumbersWithGrid(codeElement);
    }
    
    preElement.classList.add('relative', 'whitespace-pre','overflow-x-auto');

    // 【新增逻辑】如果行数超过16行，则向上查找 .tabs-panel 并添加 class
    if (lineCount > 16) {
        // 从 codeElement 开始向上查找最近的 .tabs-panel 祖先元素
        const tabsPanel = codeElement.closest('.tabs-panel');
        if (tabsPanel) {
            tabsPanel.classList.add('tabs-panel-max-height', 'overflow-auto');
            console.log(`CAN: 代码块行数 (${lineCount}) 超过16行，已在 .tabs-panel 上添加最大高度限制。`);
        } else {
            console.warn('CAN: 代码块超过16行，但未找到父级 .tabs-panel 元素来应用高度限制。');
        }
    }


    preElement.dataset.codeContent = originalCode;

    const copyButton = document.createElement('button');
    copyButton.innerHTML = `<i class='bxr bx-copy text-gray hover-text-green-500'></i>`;
    copyButton.className = 'absolute top-2 right-2 bg-gray-200 text-white text-xs p-3 rounded flex';
    
    copyButton.addEventListener('click', async () => {
        const codeToCopy = preElement.dataset.codeContent;
        try {
            await copyText(codeToCopy);
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `<i class='bxr bx-check text-green-500'></i>`;
            
            setTimeout(() => {
                copyButton.innerHTML = originalHTML;
            }, globalConfig.copiedTextDuration);

        } catch (err) {
            console.error('复制失败:', err);
        }
    });

    preElement.appendChild(copyButton);
}

/**
 * 初始化所有代码高亮块
 * @param {object} userConfig - 用户自定义配置
 */
export function initCodeHighlighter(userConfig = {}) {
    const config = { ...DEFAULT_CONFIG, ...userConfig };
    const codeBlocks = document.querySelectorAll(config.codeBlockSelector);

    if (codeBlocks.length === 0) {
        console.warn('CAN: 未找到任何代码块。请检查选择器是否正确。');
        return;
    }

    codeBlocks.forEach(block => {
        if (block) {
            renderCodeBlock(block, config);
        }
    });
}

export { hljs };
