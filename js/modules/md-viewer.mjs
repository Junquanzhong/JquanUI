/**
 * CAN: JquanUI Markdown Viewer v5.1.0
 * 修复：用户手动修改导致的核心逻辑丢失问题
 * 1. 恢复 async/await 语法正确性
 * 2. 恢复 Mermaid 代码块拦截
 * 3. 恢复 MathJax 自动加载与 SVG 白名单
 */

import { marked } from 'https://unpkg.com/marked@12.0.0/lib/marked.esm.js';
import DOMPurify from 'https://unpkg.com/dompurify@3.0.9/dist/purify.es.mjs';
import mermaid from 'https://unpkg.com/mermaid@10.9.0/dist/mermaid.esm.min.mjs';
import { init as initJIT, refresh as refreshJIT } from './jit-engine.mjs';
import { initCodeHighlighter } from './code-block.mjs';

// 初始化 Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        primaryColor: '#e0e7ff',
        edgeLabelBackground: '#ffffff',
    }
});

class JquanRenderer {
    constructor() {
        this.renderer = new marked.Renderer();
        this.setupJquanStyles();
        
        marked.use({ 
            renderer: this.renderer,
            gfm: true,
            breaks: true,
            pedantic: false
        });

         // --- 关键修复：MathJax 自动配置与加载 (切换到 cdnjs 源) ---
        if (!window.MathJax) {
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true
                },
                svg: { fontCache: 'global' },
                startup: { typeset: false }
            };
            const script = document.createElement('script');
            // 使用 cdnjs 替代 jsdelivr，提高国内访问稳定性
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js';
            script.async = true;
            document.head.appendChild(script);
        }

        DOMPurify.addHook('afterSanitizeAttributes', (node) => {
            if (node.tagName === 'A') {
                node.setAttribute('target', '_blank');
                node.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    setupJquanStyles() {
        this.renderer.heading = (text, level) => {
            const map = {
                1: 'text-3xl font-bold border-b border-gray-200 pb-4 mb-6 mt-8 text-surface-text',
                2: 'text-2xl font-bold mb-4 mt-8 text-surface-text',
                3: 'text-xl font-semibold mb-3 mt-6 text-surface-text',
                4: 'text-lg font-semibold mb-2 mt-4',
                5: 'text-base font-medium mb-2',
                6: 'text-sm font-medium text-gray-500 uppercase tracking-wide'
            };
            return `<h${level} class="${map[level] || map[6]}">${text}</h${level}>`;
        };

        this.renderer.table = (header, body) => `
            <div class="overflow-x-auto my-6 rounded-lg border border-surface-border">
                <table class="table w-full text-left bg-surface-bg">
                    <thead class="bg-gray-50 font-semibold text-gray-700 border-b border-surface-border">
                        ${header}
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                        ${body}
                    </tbody>
                </table>
            </div>`;

        this.renderer.blockquote = (quote) => 
            `<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-gray-50 rounded-r text-gray-600 italic">${quote}</blockquote>`;

        this.renderer.list = (body, ordered) => {
            const type = ordered ? 'list-decimal' : 'list-disc';
            return `<${ordered ? 'ol' : 'ul'} class="${type} pl-6 mb-4 space-y-1 text-surface-text">${body}</${ordered ? 'ol' : 'ul'}>`;
        };

        this.renderer.link = (href, title, text) => 
            `<a href="${href}" class="text-blue-600 hover-text-blue-800 hover-underline transition-colors" title="${title || ''}">${text}</a>`;

        this.renderer.image = (href, title, text) => 
            `<figure class="my-6">
                <img src="${href}" alt="${text}" class="max-w-full h-auto rounded-lg shadow-sm mx-auto block border border-gray-200" />
                ${text ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${text}</figcaption>` : ''}
            </figure>`;
            
        // --- 关键修复：Mermaid 代码块拦截 ---
        this.renderer.code = (code, lang) => {
            const language = (lang || '').trim();
            if (language === 'mermaid') {
                return `<div class="mermaid flex justify-center my-6 overflow-x-auto p-4 bg-img-leftslash border rounded-lg border-surface">${code}</div>`;
            }
            return `<pre><code class="language-${language}">${code}</code></pre>`;
        };
    }

    clean(raw) {
        if (!raw) return '';
        let content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = content.split('\n');
        while (lines.length > 0 && lines[0].trim() === '') lines.shift();
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
        if (lines.length === 0) return '';

        let minIndent = Infinity;
        for (const line of lines) {
            if (line.trim().length > 0) {
                const indentMatch = line.match(/^\s*/);
                const indentLen = indentMatch ? indentMatch[0].length : 0;
                if (indentLen < minIndent) minIndent = indentLen;
            }
        }

        if (minIndent > 0 && minIndent !== Infinity) {
            content = lines.map(line => line.length >= minIndent ? line.slice(minIndent) : line).join('\n');
        } else {
            content = lines.join('\n');
        }
        return content;
    }

    parse(raw) {
        const cleanData = this.clean(raw);
        // --- 关键修复：允许 SVG 和 MathJax 标签通过净化 ---
        return DOMPurify.sanitize(marked.parse(cleanData), {
            ADD_TAGS: ['mjx-container', 'svg', 'g', 'path', 'rect', 'circle', 'line', 'text', 'marker', 'defs', 'style', 'foreignObject'],
            ADD_ATTR: ['viewBox', 'width', 'height', 'd', 'fill', 'stroke', 'transform', 'style', 'xmlns', 'marker-end', 'marker-start']
        });
    }
}

const engine = new JquanRenderer();
let jitInitialized = false;

/**
 * 渲染函数
 * 修复：必须添加 async 关键字
 */
export async function displayMarkdown(containerId, markdownData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!jitInitialized) {
        initJIT({}); 
        jitInitialized = true;
    }

    // 准备动画状态：先移除 hidden 让其占位，但设为全透明
    // 添加 transition 类以准备过渡效果
    container.classList.remove('hidden');
    container.classList.add('opacity-0', 'transition-opacity', 'duration-500', 'ease-out');

    // 1. 基础渲染
    container.innerHTML = engine.parse(markdownData || '');

    // 2. 渲染 Mermaid
    try {
        await mermaid.run({
            querySelector: `#${containerId} .mermaid`
        });
    } catch (e) {
        console.warn('Mermaid rendering failed:', e);
    }

    // 3. 渲染 MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
        try {
            await window.MathJax.typesetPromise([container]);
        } catch (e) {
            console.warn('MathJax rendering failed:', e);
        }
    }

    // 4. JIT 刷新
    requestAnimationFrame(() => {
        refreshJIT();
        // 双重 rAF 确保样式计算已应用，触发 CSS Transition
        requestAnimationFrame(() => {
            container.classList.remove('opacity-0');
            container.classList.add('opacity-100');
        });
    });

    // 5. 代码高亮
    initCodeHighlighter({
        selector: `#${containerId} pre code`,
        scrollWrapperClass: 'overflow-auto max-h-[600px] custom-scroll p-4',
        showLineNumbers: true
    });
}

// --- AutoScan 模块 ---
function autoScan() {
    const scripts = document.querySelectorAll('script[type="text/markdown"]');
    scripts.forEach(script => {
        if (script.dataset.processed) return;
        const targetSelector = script.dataset.target;
        if (!targetSelector) return;

        let container;
        if (targetSelector.startsWith('#') || targetSelector.startsWith('.')) {
            container = document.querySelector(targetSelector);
        } else {
            container = document.getElementById(targetSelector);
        }

        if (!container) return;
        if (!container.id) container.id = `jq-md-${Math.random().toString(36).slice(2, 11)}`;

        displayMarkdown(container.id, script.textContent);
        script.dataset.processed = 'true';
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoScan);
    } else {
        autoScan();
    }
}
