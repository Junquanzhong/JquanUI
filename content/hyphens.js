// 🚀 Jquan Optimized: Hyphens 组件文档 (hyphens.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class HyphensDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">连字符与断行 (Hyphens)</li>
            </ul>

            <!-- 模块 1：排版挤压模拟器 (The Compression Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-arrows-in-line-horizontal text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">动态排版挤压模拟器 (Compression Sandbox)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">hyphens-*</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <div class="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between bg-slate-50 border border-slate-100 p-5 rounded-xl">
                        <div class="flex-1">
                            <p class="text-slate-600 text-sm">
                                连字符策略只有在**容器空间受限**且遇到**无法单行容纳的长单词**时才会生效。<br>
                                拖动右侧滑块，挤压下方容器宽度，观察超长单词 <code class="text-primary font-mono bg-primary/10 px-1 rounded">Supercalifragilisticexpialidocious</code> 的断字行为。
                            </p>
                            <p class="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
                                <i class="ph ph-warning-circle"></i> 红色虚线代表容器的物理边界。
                            </p>
                        </div>
                        
                        <!-- 核心交互：宽度控制滑块 -->
                        <div class="w-full lg:w-64 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <label class="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                <span>容器宽度 (Width)</span>
                                <span id="width-display" class="text-primary font-mono">240px</span>
                            </label>
                            <input type="range" id="width-slider" min="140" max="380" step="5" value="240" class="w-full form-control !p-0 !h-auto cursor-pointer">
                        </div>
                    </div>
                    
                    <!-- 预览展示区：利用 overflow-visible 允许内容穿透以展示溢出 bug -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 overflow-hidden pb-4">
                        
                        <!-- 1. hyphens-none -->
                        <div class="relative">
                            <div class="mb-3 flex justify-between items-center">
                                <code class="text-xs font-mono font-bold text-slate-800">hyphens-none</code>
                                <span class="text-[10px] text-slate-400 uppercase">无断字</span>
                            </div>
                            <div class="bg-slate-50 border border-slate-200 rounded p-4 relative h-64 shadow-inner demo-container">
                                <!-- 物理边界警告线 -->
                                <div class="absolute right-0 top-0 bottom-0 w-px border-r-2 border-dashed border-rose-300 z-0"></div>
                                <p class="text-slate-700 leading-relaxed hyphens-none break-keep whitespace-normal relative z-10">
                                    这是一个禁用连字符的段落。当遇到类似 <span class="font-bold text-slate-900 bg-rose-100/50">Supercalifragilisticexpialidocious</span> 这样的超长单词时，它绝不妥协，直接冲破边界。
                                </p>
                            </div>
                        </div>

                        <!-- 2. hyphens-manual -->
                        <div class="relative">
                            <div class="mb-3 flex justify-between items-center">
                                <code class="text-xs font-mono font-bold text-primary">hyphens-manual</code>
                                <span class="text-[10px] text-slate-400 uppercase">手动断字 (依赖 &amp;shy;)</span>
                            </div>
                            <div class="bg-white border border-primary/30 rounded p-4 relative h-64 shadow-sm demo-container ring-1 ring-primary/5">
                                <div class="absolute right-0 top-0 bottom-0 w-px border-r-2 border-dashed border-rose-300 z-0"></div>
                                <!-- 注意这里的长单词手动插入了软连字符 &shy; -->
                                <p class="text-slate-700 leading-relaxed hyphens-manual break-keep whitespace-normal relative z-10">
                                    这是一个仅在指定断点断字的段落。长单词被注入了 <code>&amp;shy;</code>：<span class="font-bold text-primary bg-primary/5">Su&shy;per&shy;cali&shy;frag&shy;ilistic&shy;expi&shy;ali&shy;docious</span>。它只在这些标记处安全折行。
                                </p>
                            </div>
                        </div>

                        <!-- 3. hyphens-auto -->
                        <div class="relative">
                            <div class="mb-3 flex justify-between items-center">
                                <code class="text-xs font-mono font-bold text-teal-600">hyphens-auto</code>
                                <span class="text-[10px] text-slate-400 uppercase">字典自动断字 (依赖 lang)</span>
                            </div>
                            <div class="bg-teal-50/30 border border-teal-200 rounded p-4 relative h-64 shadow-sm demo-container">
                                <div class="absolute right-0 top-0 bottom-0 w-px border-r-2 border-dashed border-rose-300 z-0"></div>
                                <!-- 必须提供正确的 lang 属性，浏览器字典才会生效 -->
                                <p lang="en" class="text-slate-700 leading-relaxed hyphens-auto break-keep whitespace-normal relative z-10">
                                    This uses the browser's hyphenation dictionary. The excessively long word <strong class="text-teal-700 bg-teal-100/50">Supercalifragilisticexpialidocious</strong> will be automatically and correctly broken at syllable boundaries based on the specified language.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：原理与代码参考 (Technical Reference) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-books text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">原理解析 (How it works)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <div class="space-y-4">
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">1. 什么是软连字符 (Soft Hyphen)?</h3>
                            <p class="text-sm text-slate-600 leading-relaxed">
                                软连字符（HTML 实体 <code class="text-primary bg-primary/10 px-1 rounded">&amp;shy;</code>）是一个不可见的标记。它告诉浏览器：**“如果这一行实在装不下去了，请在这里断开并加上破折号；如果装得下，请假装我不存在。”** 这在 <code class="font-mono text-xs">hyphens-manual</code> 模式下极其有用，也是专业排版的必备技巧。
                            </p>
                            <pre><code class="language-html">
&lt;!-- 只有在空间不足时，才会在 shy 标记处断开并显示连字符 --&gt;
&lt;p class="hyphens-manual"&gt;
    Ex&amp;shy;tra&amp;shy;or&amp;shy;di&amp;shy;nary
&lt;/p&gt;
                            </code></pre>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">2. 为什么 hyphens-auto 没生效?</h3>
                            <p class="text-sm text-slate-600 leading-relaxed">
                                <code class="font-mono text-xs">hyphens-auto</code> 完全依赖于浏览器内置的字典。如果你没有在 HTML 标签或当前段落中声明正确的语言 <code class="text-primary bg-primary/10 px-1 rounded">lang="en"</code>，浏览器将不知道如何按音节拆分单词，从而导致属性失效。
                            </p>
                            <pre><code class="language-html">
&lt;!-- 必须声明语言，浏览器才能查阅对应字典 --&gt;
&lt;p class="hyphens-auto" lang="en"&gt;
    Pneumonoultramicroscopicsilicovolcanoconiosis
&lt;/p&gt;
                            </code></pre>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        `;
    }

        // ==========================================
    // 挂载逻辑：宽度推演模拟器
    // ==========================================
    static mount(container) {
        // 1. 初始化代码高亮
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        const slider = container.querySelector('#width-slider');
        const display = container.querySelector('#width-display');
        const demoContainers = container.querySelectorAll('.demo-container');

        // 核心更新逻辑：调整物理宽度以压迫文本
        const updateWidth = (val) => {
            // 修复：移除了错误的转义字符，使用标准的 ES6 模板字符串
            const pixelVal = `${val}px`;
            display.textContent = pixelVal;
            
            // 为了视觉效果，我们改变容器自身的宽度，且不使用 overflow-hidden
            // 这样能清晰展示 none 模式下的越界溢出
            demoContainers.forEach(box => {
                box.classList.remove(...Array.from(box.classList).filter(name => name.startsWith('w-[')));
                box.classList.add(`w-[${pixelVal}]`);
            });
            window.JquanUI?.compile?.(`w-[${pixelVal}]`);
        };

        // 绑定滑块事件
        if (slider) {
            slider.addEventListener('input', (e) => {
                updateWidth(e.target.value);
            });
            
            // 首次渲染触发一次
            updateWidth(slider.value);
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'hyphens-none', desc: '禁止断字排版，长单词可能溢出' },
            { class: 'hyphens-manual', desc: '仅在有连字符 (-) 或软连字符 (&shy;) 处断开' },
            { class: 'hyphens-auto', desc: '浏览器基于 lang 字典自动断开长单词' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'hyphens'
        }));
    }
}
