// 🚀 Jquan Optimized: Columns 瀑布流组件文档 (columns.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ColumnsDoc {
    static render() {
        // 生成高低错落的演示卡片数据
        const generateCards = () => {
            const heights = ['h-24', 'h-40', 'h-32', 'h-48', 'h-28', 'h-36', 'h-20', 'h-44'];
            const colors = [
                'from-emerald-400 to-teal-500', 
                'from-rose-400 to-red-500', 
                'from-indigo-400 to-purple-500', 
                'from-amber-400 to-orange-500',
                'from-blue-400 to-cyan-500'
            ];
            
            let html = '';
            for (let i = 0; i < 8; i++) {
                const h = heights[i % heights.length];
                const c = colors[i % colors.length];
                html += `
                    <div class="mb-4 relative rounded-xl bg-gradient-to-br ${c} shadow-sm overflow-hidden group hover:shadow-md transition-all break-inside-avoid">
                        <div class="${h} w-full flex flex-col justify-end p-4">
                            <!-- 遮罩层增加质感 -->
                            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            <div class="relative z-10 text-white font-bold text-sm tracking-wider opacity-90 drop-shadow-md">Item 0${i + 1}</div>
                        </div>
                    </div>
                `;
            }
            return html;
        };

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">瀑布流 (Columns)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">瀑布流 (Columns)</h1>
                <p class="text-slate-600 max-w-3xl leading-relaxed">
                    基于 CSS Multi-column 规范。使用 <code class="inline-code">columns-*</code> 工具类，可以轻松实现类似报纸排版或 Pinterest 风格的瀑布流图片墙，内容会自动向下一列流动。
                </p>
            </div>

            <!-- 🧪 核心模块 1：瀑布流实验室 Playground -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-columns text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">多列布局实验室</cite>
                    </div>
                    <code id="col-demo-code" class="text-xs font-mono bg-white border border-primary/20 text-primary px-2 py-1 rounded shadow-sm">columns-2 gap-4</code>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- 控制面板 -->
                        <section class="lg:col-span-1 flex flex-col space-y-6">
                            <!-- 列数控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">列数 (Columns)</label>
                                <div class="flex flex-col gap-2">
                                    <button data-type="col" data-class="columns-1" class="col-btn w-full text-left px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">单列展示 (columns-1)</button>
                                    <button data-type="col" data-class="columns-2" class="col-btn w-full text-left px-4 py-2 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">双列展示 (columns-2)</button>
                                    <button data-type="col" data-class="columns-3" class="col-btn w-full text-left px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">三列展示 (columns-3)</button>
                                    <button data-type="col" data-class="columns-4" class="col-btn w-full text-left px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">四列展示 (columns-4)</button>
                                </div>
                            </div>
                            
                            <!-- 间距控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">列间距 (Gap)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="gap" data-class="gap-2" class="gap-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">gap-2</button>
                                    <button data-type="gap" data-class="gap-4" class="gap-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">gap-4</button>
                                    <button data-type="gap" data-class="gap-8" class="gap-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">gap-8</button>
                                </div>
                            </div>
                        </section>

                        <!-- 演示视窗 -->
                        <section class="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-inner p-6 bg-slate-50">
                            <!-- 目标容器 (瀑布流) -->
                            <div id="col-demo-box" class="columns-2 gap-4 transition-all duration-500 ease-in-out">
                                ${generateCards()}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <!-- 🛡️ 核心模块 2：Jquan 架构师视角 (防断裂与响应式) -->
            <div class="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-amber-500/20 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-shield-warning text-xl text-amber-500"></i>
                    <cite class="font-bold text-slate-800 not-italic">架构师避坑指南：防断裂与响应式</cite>
                </div>
                
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 class="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <span class="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-xs font-mono">break-inside-avoid</span> 必须加上！
                            </h3>
                            <p class="text-slate-600 text-sm leading-relaxed mb-4">
                                在多列布局中，浏览器默认会为了填充列高，而把一个元素从中间“腰斩”，分到两列去显示。为了保持卡片或图片的完整性，<strong>必须</strong>给每一个子元素添加 <code class="inline-code">break-inside-avoid</code>。
                            </p>
                            <div class="relative w-full h-32 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center columns-2 gap-4 p-4">
                                <!-- 错误示范 (被腰斩) -->
                                <div class="w-full bg-slate-100 border border-slate-300 rounded p-2 text-center text-xs text-slate-500 line-through">如果没有 avoid<br>我会被切成两半</div>
                                <div class="w-full bg-slate-100 border border-slate-300 rounded p-2 text-center text-xs text-slate-500 line-through">如果没有 avoid<br>我会被切成两半</div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                                基于宽度的列系统
                            </h3>
                            <p class="text-slate-600 text-sm leading-relaxed mb-4">
                                除了指定绝对的列数 (<code class="inline-code">columns-3</code>)，我们更推荐使用宽度断点，如 <code class="inline-code">columns-3xs</code> (约 16rem)。这样浏览器会根据容器宽度<strong>自动计算</strong>能放得下几列，天然具备响应式，连媒体查询都省了！
                            </p>
                            <pre><code class="language-html">
&lt;!-- 移动端自动 1 列，大屏自动展开多列 --&gt;
&lt;div class="columns-xs gap-6"&gt;
    &lt;div class="break-inside-avoid mb-6"&gt;...&lt;/div&gt;
    &lt;div class="break-inside-avoid mb-6"&gt;...&lt;/div&gt;
&lt;/div&gt;
                            </code></pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 字典表格区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-open-text text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">瀑布流核心 API</cite>
                </div>
                <div class="p-0 overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead class="bg-white text-slate-500 border-b border-slate-100">
                            <tr>
                                <th class="px-6 py-4 font-medium w-1/3">工具类 (Class)</th>
                                <th class="px-6 py-4 font-medium w-1/3">CSS 属性</th>
                                <th class="px-6 py-4 font-medium">使用场景</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-4 font-mono font-medium text-primary">columns-{1-12}</td>
                                <td class="px-6 py-4 font-mono text-xs text-slate-500">columns: {n};</td>
                                <td class="px-6 py-4">强制容器分为固定的 N 列，不考虑容器宽度。</td>
                            </tr>
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-4 font-mono font-medium text-emerald-600">columns-{3xs-7xl}</td>
                                <td class="px-6 py-4 font-mono text-xs text-slate-500">columns: {width};</td>
                                <td class="px-6 py-4">设定列的最小理想宽度，浏览器会据此自动增减列数 (智能响应式)。</td>
                            </tr>
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-4 font-mono font-medium text-amber-600">break-inside-avoid</td>
                                <td class="px-6 py-4 font-mono text-xs text-slate-500">break-inside: avoid;</td>
                                <td class="px-6 py-4"><strong>必需！</strong>加在子元素上，防止卡片在跨列时被拦腰截断。</td>
                            </tr>
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-4 font-mono font-medium text-indigo-600">break-inside-auto</td>
                                <td class="px-6 py-4 font-mono text-xs text-slate-500">break-inside: auto;</td>
                                <td class="px-6 py-4">允许内容在列之间折断 (适用于纯文字排版的报纸效果)。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        initCodeHighlighter({ showLineNumbers: false });

        const demoBox = container.querySelector('#col-demo-box');
        const codeDisplay = container.querySelector('#col-demo-code');
        const colBtns = container.querySelectorAll('.col-btn');
        const gapBtns = container.querySelectorAll('.gap-btn');

        if (!demoBox) return;

        const state = {
            col: 'columns-2',
            gap: 'gap-4'
        };

        const updateDisplay = () => {
            demoBox.className = `${state.col} ${state.gap} transition-all duration-500 ease-in-out`;
            codeDisplay.innerText = `${state.col} ${state.gap}`;
        };

        // 处理列数切换
        colBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                state.col = target.dataset.class;

                colBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                });
                
                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                target.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');

                updateDisplay();
            });
        });

        // 处理间距切换
        gapBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                state.gap = target.dataset.class;

                gapBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                });
                
                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                target.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');

                updateDisplay();
            });
        });
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'columns-*', desc: '瀑布流/多列布局 (columns-1 到 12)' },
            { class: 'columns-{size}', desc: '响应式瀑布流 (columns-xs, sm, md等)' },
            { class: 'break-inside-avoid', desc: '防止瀑布流子元素被截断 (极其重要)' },
            { class: 'break-inside-auto', desc: '允许瀑布流子元素被截断' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'columns' 
        }));
    }
}