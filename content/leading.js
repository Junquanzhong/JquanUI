// 🚀 Jquan Optimized: Leading (行高) 组件文档 (leading.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LeadingDoc {
    static render() {
        const relativeLeading = [
            { cls: 'leading-none', val: '1', desc: '无间距 (通常用于大标题)' },
            { cls: 'leading-tight', val: '1.25', desc: '紧凑' },
            { cls: 'leading-snug', val: '1.375', desc: '微紧' },
            { cls: 'leading-normal', val: '1.5', desc: '正常 (浏览器的默认基准)' },
            { cls: 'leading-relaxed', val: '1.625', desc: '宽松 (适合博客长文阅读)' },
            { cls: 'leading-loose', val: '2', desc: '极宽 (诗歌或短句排版)' }
        ];

        const absoluteLeading = [
            { cls: 'leading-3', val: '0.75rem' },
            { cls: 'leading-4', val: '1rem' },
            { cls: 'leading-5', val: '1.25rem' },
            { cls: 'leading-6', val: '1.5rem' },
            { cls: 'leading-7', val: '1.75rem' },
            { cls: 'leading-8', val: '2rem' },
            { cls: 'leading-9', val: '2.25rem' },
            { cls: 'leading-10', val: '2.5rem' }
        ];

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">行高 (Leading)</li>
            </ul>

            <!-- 模块 1：相对行高 视觉演示器 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-aa text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">相对行高</cite>
                </div>
                
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        根据元素当前的字体大小，赋予其一个无单位的相对倍数作为行高。使用 <code>.leading-{size}</code> 来控制。
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-slate-100 p-6 rounded-xl shadow-sm">
                        <!-- 左侧：控制面板 -->
                        <div class="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                            <div class="flex flex-col gap-2" id="relative-controls">
                                ${relativeLeading.map((item, index) => `
                                    <button class="flex items-center justify-between p-3 rounded-lg border transition-all btn-leading-rel ${index === 3 ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}" data-class="${item.cls}" data-val="${item.val}">
                                        <div class="flex flex-col items-start">
                                            <span class="font-bold text-sm">.${item.cls}</span>
                                            <span class="text-xs opacity-70">${item.desc}</span>
                                        </div>
                                        <span class="font-mono text-xs bg-white px-2 py-1 rounded shadow-sm border border-slate-100">${item.val}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 右侧：视觉预览与代码高亮 -->
                        <div class="lg:col-span-7 flex flex-col justify-center">
                            <div class="mb-3 flex justify-between items-center">
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">实时预览</span>
                                <span class="text-[10px] text-slate-400 flex items-center gap-1"><span class="w-2 h-2 inline-block bg-primary/20 rounded-sm"></span> 蓝色为文本字面高度</span>
                            </div>
                            
                            <!-- 文本留白视觉差 -->
                            <div class="bg-slate-50 p-6 rounded-xl border border-slate-200/60 shadow-inner mb-4">
                                <p id="preview-relative" class="leading-normal text-slate-700 text-base md:text-lg transition-all duration-300 border-y border-dashed border-slate-300">
                                    <span class="bg-primary/20 box-decoration-clone rounded-sm">
                                        排版的艺术在于空间管理。优秀的设计不仅关乎文字的形态，更关乎文字之间的留白。<br>
                                        The art of typography lies in space management. Great design is not just about the form of words.
                                    </span>
                                </p>
                            </div>
                            
                            <!-- 必须使用标准 pre > code 结构，以触发您的 initCodeHighlighter -->
                            <div id="dynamic-code-container">
                                <pre><code class="language-html">&lt;p class="leading-normal"&gt;...&lt;/p&gt;</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：绝对行高 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-ruler text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">绝对行高</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code>.leading-{number}</code> 控制元素的绝对行高。
                    </p>
                    
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        ${absoluteLeading.map(item => `
                            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col items-center justify-center gap-3 relative group">
                                <span class="text-xs font-mono text-slate-500 absolute top-2 right-2 bg-slate-100 px-1.5 py-0.5 rounded">${item.val}</span>
                                <div class="h-12 flex items-center justify-center">
                                    <div class="bg-slate-800 text-white font-bold px-4 rounded ${item.cls} flex items-center justify-center transition-all group-hover:bg-primary">
                                        Aa
                                    </div>
                                </div>
                                <code class="text-sm font-bold text-slate-700">.${item.cls}</code>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

                        <!-- 模块 3：任意值行高 (JIT Engine) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-brackets-square text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">任意值行高 (Arbitrary Values)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-4">
                        全面拥抱 JIT 引擎！当预设类名无法满足需求时，可直接使用方括号语法 <code>.leading-[&lt;value&gt;]</code> 即时生成任意行高。这彻底取代了旧版本中繁琐的 <code>data-line-height</code> 属性方案。
                    </p>
                    
                    <!-- 必须使用标准 pre > code 结构 -->
                    <pre><code class="language-html">
                    <!-- 绝对数值 (精确像素) -->;
                    <p class="leading-[16px]">;基于精确像素的行高</p>;

                    <!-- 相对数值 (如 rem / em / % ) -->;
                    <p class="leading-[3rem]">;基于 rem 的行高</p>;

                    <!-- 甚至可以使用 CSS calc() 计算函数 -->;
                    <p class="leading-[calc(100%+10px)]">;动态计算的行高</p>;</code></pre>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：交互与视图更新
    // ==========================================
    static mount(container) {
        // 1. 初始化页面级的代码高亮 (关闭行号和语言标签以保持代码块迷你紧凑)
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        const buttons = container.querySelectorAll('.btn-leading-rel');
        const preview = container.querySelector('#preview-relative');
        const codeContainer = container.querySelector('#dynamic-code-container');

        // 切换相对行高
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                const targetClass = targetBtn.dataset.class;
                
                // 1. 重置所有按钮状态
                buttons.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                });

                // 2. 激活当前按钮
                targetBtn.classList.add('border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                targetBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');

                // 3. 更新预览区类名
                preview.className = `text-slate-700 text-base md:text-lg transition-all duration-300 border-y border-dashed border-slate-300 ${targetClass}`;
                
                // 4. 注入干净的 pre > code 结构，让组件能够正常工作
                codeContainer.innerHTML = `<pre><code class="language-html">&lt;p class="${targetClass}"&gt;...&lt;/p&gt;</code></pre>`;
                
                // 5. 重新触发高亮解析
                initCodeHighlighter({ showLineNumbers: false, langLabel: false });
            });
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'leading-none to leading-loose', desc: '相对字体的等比缩放行高' },
            { class: 'leading-3 to leading-10', desc: '基于 rem 规范的绝对行高' },
            { class: 'leading-[value]', desc: '基于 JIT 引擎的任意值行高支持' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'leading'
        }));
    }
}