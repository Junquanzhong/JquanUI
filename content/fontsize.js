// 🚀 Jquan Optimized: FontSize 组件文档 (fontsize.js)
import { Tabs } from '../js/tabs.mjs';
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FontSizeDoc {
    static render() {
        const typographicScale = [
            { cls: 'text-xs', size: '12px', rem: '0.75rem', sample: '探索，创造，改变' },
            { cls: 'text-sm', size: '14px', rem: '0.875rem', sample: 'The quick brown fox.' },
            { cls: 'text-md', size: '16px', rem: '1rem', sample: 'JquanUI 排版引擎' },
            { cls: 'text-lg', size: '18px', rem: '1.125rem', sample: '设计不仅仅是外观。' },
            { cls: 'text-xl', size: '20px', rem: '1.25rem', sample: 'Typography is the voice.' },
            { cls: 'text-2xl', size: '24px', rem: '1.5rem', sample: '洞察每一处细节' },
            { cls: 'text-3xl', size: '30px', rem: '1.875rem', sample: 'Think Different' },
            { cls: 'text-4xl', size: '36px', rem: '2.25rem', sample: '极简，即极速' },
            { cls: 'text-5xl', size: '48px', rem: '3rem', sample: 'Hello World' },
            { cls: 'text-6xl', size: '60px', rem: '3.75rem', sample: '未来已来' },
            { cls: 'text-7xl', size: '72px', rem: '4.5rem', sample: 'Innovation' },
            { cls: 'text-8xl', size: '96px', rem: '6rem', sample: 'A B C' },
            { cls: 'text-9xl', size: '128px', rem: '8rem', sample: '1 2' },
        ];

        return `
        <div class="container pb-10">
            <p class="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">项目字号在 Core 前配置 theme.extend.fontSize，例如 { headline: ['37px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: 650 }] }，使用 text-headline。支持单个字符串、[字号, 行高] 或 [字号, 选项]；单字符串仅输出字号，不继承被覆盖内置档位的行高。DEFAULT / fluid-* 保留，改 text-base 用 base。非法项见 JquanUI.debug().configWarnings；完整示例见“主题与暗黑模式”。</p>
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">字号 (Font Size)</li>
            </ul>

            <!-- 模块 1：原生标签的优雅 (Heading Initialization) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-h text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">原生标题初始化</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6 pb-4 border-b border-slate-100">
                        JquanUI 自动规范了基础的 HTML 标题层级，你可以直接使用 <code class="inline-code">&lt;h1&gt;</code> 到 <code class="inline-code">&lt;h6&gt;</code>，并配合 <code class="inline-code">&lt;small&gt;</code> 标签构建优雅的副标题层级。
                    </p>
                    <div class="space-y-6">
                        <h1>这是一级标题 <small class="text-slate-400 font-normal ml-2">System Architecture</small></h1>
                        <h2>这是二级标题 <small class="text-slate-400 font-normal ml-2">Module Definition</small></h2>
                        <h3>这是三级标题 <small class="text-slate-400 font-normal ml-2">Sub-component</small></h3>
                        <h4>这是四级标题 <small class="text-slate-400 font-normal ml-2">Details</small></h4>
                        <h5>这是五级标题 <small class="text-slate-400 font-normal ml-2">Parameters</small></h5>
                        <h6>这是六级标题 <small class="text-slate-400 font-normal ml-2">Notes</small></h6>
                    </div>
                </div>
            </div>

            <!-- 模块 2：字号比例尺瀑布 (The Typographic Scale) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-ruler text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">原子字号比例尺 (Visual Scale)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-slate-200/50 px-2 py-1 rounded">text-{size}</span>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-6">
                        摒弃枯燥的表格，通过视觉瀑布流直接感受字距与字号的张力。类名基于 Tailwind 规范构建。
                    </p>
                    
                    <div class="flex flex-col border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                        <div class="flex items-center bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider py-2 px-4 border-b border-slate-200">
                            <div class="w-24 md:w-32">Class</div>
                            <div class="w-20 md:w-32">Size</div>
                            <div class="flex-1">Preview</div>
                        </div>
                        
                        ${typographicScale.map(item => `
                            <div class="flex items-baseline py-4 px-4 border-b border-slate-100 hover:bg-white transition-colors overflow-hidden">
                                <div class="w-24 md:w-32 flex-shrink-0">
                                    <code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono shadow-sm border border-primary/20">${item.cls}</code>
                                </div>
                                <div class="w-20 md:w-32 flex-shrink-0 flex flex-col justify-center">
                                    <span class="text-slate-700 text-sm font-medium">${item.size}</span>
                                    <span class="text-slate-400 text-xs font-mono">${item.rem}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="${item.cls} text-slate-800 font-medium truncate">${item.sample}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 3：JIT 引擎无极控制沙盒 (Arbitrary Values) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <!-- 背景装饰：晨光特效 -->
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">JIT 引擎任意值 (Arbitrary Values)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">fs-[ value ]</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6">
                        导入 <code class="inline-code">Jit-engine.mjs</code> 后，无论是 <code class="inline-code">26px</code>、<code class="inline-code">2.5vw</code> 还是 <code class="inline-code">calc()</code> 函数，JIT 引擎都能瞬间生成。<br/>
                        <strong>拖动下方滑块，体验 JIT 引擎的动态生成能力：</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制与代码输出 -->
                        <div class="lg:col-span-5 flex flex-col justify-center space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            
                            <!-- 控制区 -->
                            <div class="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                <label for="fs-slider" class="flex justify-between text-sm font-medium text-slate-700 mb-4">
                                    <span class="flex items-center gap-2"><i class="ph ph-sliders-horizontal text-primary"></i> 字号无极调节</span>
                                    <span class="font-mono text-primary font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100" id="fs-display">26px</span>
                                </label>
                                <input type="range" id="fs-slider" min="12" max="100" value="26" class="w-full form-control !p-0 !h-auto cursor-pointer">
                            </div>

                            <!-- 标准化 Code Block：交给你的 mjs 引擎渲染 -->
                            <div class="mt-4">
                                <pre id="fs-pre-container"><code class="language-html">
&lt;p class="fs-[26px]"&gt;
    JIT 生成字体
&lt;/p&gt;
                                </code></pre>
                            </div>

                        </div>

                        <!-- 右侧：效果预览 -->
                        <div class="lg:col-span-7 flex items-center justify-center min-h-[250px] bg-slate-50 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                            <p id="fs-preview-text" class="text-slate-800 font-bold fs-[26px] transition-all duration-100 ease-out whitespace-nowrap">
                                JIT 生成字体
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：安全获取 DOM 并绑定交互
    // ==========================================
    static mount(container) {
        // 1. 绑定 JIT 沙盒交互
        const fsSlider = container.querySelector('#fs-slider');
        const fsDisplay = container.querySelector('#fs-display');
        const fsPreviewText = container.querySelector('#fs-preview-text');
        const fsPreContainer = container.querySelector('#fs-pre-container');

        const escapeHtml = value => String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const renderFontSizeCode = pxVal => {
            if (!fsPreContainer) return;
            const source = `<p class="fs-[${pxVal}]">
    JIT 生成字体
</p>`;
            fsPreContainer.innerHTML = `<code class="language-html">${escapeHtml(source)}</code>`;
            fsPreContainer.classList.remove('hljs-done');
            initCodeHighlighter({
                selector: '#fs-pre-container code',
                showLineNumbers: true,
                langLabel: true
            });
        };

        if (fsSlider && fsPreviewText) {
            renderFontSizeCode(`${fsSlider.value}px`);
            fsSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                const pxVal = `${val}px`;
                
                // A. 更新右侧视觉预览
                fsPreviewText.classList.remove(...Array.from(fsPreviewText.classList).filter(name => name.startsWith('fs-[')));
                fsPreviewText.classList.add(`fs-[${pxVal}]`);
                window.JquanUI?.compile?.(`fs-[${pxVal}]`);
                
                // B. 更新左侧控制台数值显示
                fsDisplay.textContent = pxVal;
                
                // C. 重新渲染共享代码块，确保动态示例与复制内容同步。
                renderFontSizeCode(pxVal);
            });
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'text-xs to text-9xl', desc: '预设的基础字号比例尺' },
            { class: 'fs-[size]', desc: 'JIT 引擎任意字号生成器' },
            { class: 'Typography', desc: '排版基础，标题标签 h1-h6 规范' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'fontsize'
        }));
    }
}
