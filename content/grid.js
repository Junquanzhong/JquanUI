// 🚀 Jquan Optimized: Grid 栅格布局综合指南 (grid.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class GridDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">栅格网格 (Grid)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">Grid 二维网格控制台</h1>
                <p class="text-slate-600">与一维的 Flexbox 不同，Grid 是一套强大的二维“棋盘”系统。你可以通过容器划分精确的行与列，然后通过子项目的 <code class="inline-code">span</code> (跨度)、<code class="inline-code">start</code> (偏移/起点) 和 <code class="inline-code">order</code> (排序) 来精确控制每一个元素的位置。</p>
            </div>

            <!-- ========================================== -->
            <!-- 🧪 实验室 1：Grid 容器规划局 (Container) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-grid-nine text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">网格城市规划局 (Container)</cite>
                    </div>
                    <span class="text-xs font-medium text-slate-800 bg-primary/20 px-2 py-1 rounded-md border border-primary/20">
                        划分列 (Columns)、行 (Rows) 与 沟槽 (Gap)
                    </span>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    <!-- 左侧：控制面板 -->
                    <div class="xl:col-span-4 flex flex-col gap-6">
                        
                        <!-- Columns (列) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">列数 (Columns)</span>
                            </div>
                            <div class="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                ${[1, 2, 3, 4, 5, 6, 8, 12].map(n => `
                                    <button data-type="cols" data-val="grid-cols-${n}" class="ctrl-btn py-1.5 rounded text-xs transition-all ${n === 4 ? 'bg-white shadow-sm text-violet-600 font-bold is-active' : 'text-slate-500 hover:bg-white'}">${n}</button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Rows (行) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">行数 (Rows)</span>
                            </div>
                            <div class="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button data-type="rows" data-val="grid-rows-none" class="ctrl-btn py-1.5 rounded text-xs transition-all bg-white shadow-sm text-violet-600 font-bold is-active">auto</button>
                                ${[1, 2, 3, 4, 5, 6, 8].map(n => `
                                    <button data-type="rows" data-val="grid-rows-${n}" class="ctrl-btn py-1.5 rounded text-xs transition-all text-slate-500 hover:bg-white">${n}</button>
                                `).join('')}
                            </div>
                            <p class="text-[11px] text-slate-400 mt-2">提示: auto 模式下由内容自动撑开行，指定行数则会强制划分高度。</p>
                        </div>

                        <!-- Gap (间距) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">沟槽间距 (Gap)</span>
                            </div>
                            <input type="range" id="gap-slider" min="0" max="8" value="4" class="w-full accent-violet-500">
                            <div class="flex justify-between text-xs text-slate-400 font-mono mt-1">
                                <span>gap-0</span>
                                <span id="gap-display" class="font-bold text-violet-600">gap-4</span>
                                <span>gap-8</span>
                            </div>
                        </div>

                    </div>

                    <!-- 右侧：演示视窗 & 代码块 -->
                    <div class="xl:col-span-8 flex flex-col relative h-full">
                        <div class="bg-slate-100/50 rounded-lg p-4 md:p-6 flex-1 border border-slate-200 border-b-0 min-h-[360px] flex flex-col">
                            <!-- Jquan 演示盒子：使用棋盘背景辅助理解网格 -->
                            <div id="demo-box" class="w-full h-80 grid gap-4 grid-cols-4 transition-all duration-300 relative bg-slate-50 border-2 border-violet-200/50 rounded-lg p-2 overflow-hidden">
                                <!-- 子元素们由 JS 动态生成 -->
                            </div>
                        </div>

                        <!-- 实时代码 (原生 HTML 写入) -->
                        <div class="w-full" id="code-container">
                            <!-- 动态代码 -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- 🎭 实验室 2：Grid 子项目特权 (Span, Offset, Sort) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">子项目特权：跨度、偏移与排序</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8 space-y-10">
                    
                    <!-- 1. 跨度 Span -->
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><i class="ph ph-arrows-out-line-horizontal text-primary"></i>跨度 (Span)</h3>
                        <p class="text-sm text-slate-500 mb-4">使用 <code class="inline-code">col-span-{n}</code> 或 <code class="inline-code">row-span-{n}</code> 让一个项目占据多个格子的空间。</p>
                        
                        <div class="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-sm font-mono font-bold">
                            <div class="bg-primary/5 text-primary border border-primary/20 rounded-lg p-4 col-span-2 shadow-sm">col-span-2</div>
                            <div class="bg-white text-slate-400 border border-slate-200 rounded-lg p-4 shadow-sm">1</div>
                            <div class="bg-white text-slate-400 border border-slate-200 rounded-lg p-4 shadow-sm">1</div>
                            <div class="bg-white text-slate-400 border border-slate-200 rounded-lg p-4 shadow-sm">1</div>
                            <div class="bg-primary text-white rounded-lg p-4 col-span-3 shadow-md transform hover:scale-[1.02] transition-transform cursor-crosshair relative overflow-hidden group">
                                <div class="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                col-span-3
                            </div>
                        </div>
                    </div>

                    <!-- 2. 偏移 Offset (Start) -->
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><i class="ph ph-arrow-fat-right text-primary"></i>偏移 (Offset / Start)</h3>
                        <p class="text-sm text-slate-500 mb-4">现代 Grid 放弃了传统的 margin 偏移，改用网格线定位。使用 <code class="inline-code">col-start-{n}</code> 让项目强制从第 n 条网格线开始，从而完美实现空出格子的“偏移”效果。</p>
                        
                        <div class="grid grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-sm font-mono font-bold">
                            <div class="bg-slate-200/50 text-slate-400 border border-slate-200 border-dashed rounded-lg p-3">网格线 1</div>
                            <div class="bg-slate-200/50 text-slate-400 border border-slate-200 border-dashed rounded-lg p-3">网格线 2</div>
                            <div class="bg-slate-200/50 text-slate-400 border border-slate-200 border-dashed rounded-lg p-3">网格线 3</div>
                            <div class="bg-slate-200/50 text-slate-400 border border-slate-200 border-dashed rounded-lg p-3">网格线 4</div>
                            <div class="bg-slate-200/50 text-slate-400 border border-slate-200 border-dashed rounded-lg p-3">网格线 5</div>
                            <div class="bg-slate-200/50 text-slate-400 border border-slate-200 border-dashed rounded-lg p-3">网格线 6</div>
                            
                            <!-- Offset 演示 -->
                            <div class="bg-primary text-white border border-primary rounded-lg p-3 col-start-2 col-span-4 shadow-sm relative">
                                <span class="absolute -top-3 -left-2 text-[10px] bg-primary text-white px-1.5 rounded">线 2</span>
                                col-start-2 & col-span-4
                                <span class="absolute -top-3 -right-2 text-[10px] bg-primary text-white px-1.5 rounded">线 6</span>
                            </div>
                            <div class="bg-white text-slate-400 border border-slate-200 rounded-lg p-3">自动填补</div>
                        </div>
                    </div>

                    <!-- 3. 排序 Sort (Order) -->
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><i class="ph ph-sort-ascending text-primary"></i>排序 (Sort / Order)</h3>
                        <p class="text-sm text-slate-500 mb-4">无需改变 HTML DOM 结构，使用 <code class="inline-code">order-{1..12}</code>, <code class="inline-code">order-first</code>, <code class="inline-code">order-last</code> 即可任意穿梭重排！</p>
                        
                        <div class="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-sm font-mono font-bold">
                            <div class="bg-white text-slate-400 border border-slate-200 rounded-lg p-4 order-2 relative">
                                <span class="absolute top-1 left-2 text-[10px] text-slate-300">DOM 1</span>
                                order-2
                            </div>
                            <div class="bg-white text-slate-400 border border-slate-200  rounded-lg p-4 order-last relative">
                                <span class="absolute top-1 left-2 text-[10px] text-slate-300">DOM 2</span>
                                order-last
                            </div>
                            <div class="bg-white text-slate-400 border border-slate-200 rounded-lg p-4 order-3 relative">
                                <span class="absolute top-1 left-2 text-[10px] text-slate-300">DOM 3</span>
                                order-3
                            </div>
                            <div class="bg-primary text-white border border-primary rounded-lg p-4 order-first relative transform -translate-y-1">
                                <span class="absolute top-1 left-2 text-[10px] text-primary">DOM 4</span>
                                order-first <i class="ph-fill ph-crown text-yellow-300 ml-1"></i>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- ========================================== -->
            <!-- ⚡ 实验室 3：自适应填充 (Auto-fit & Minmax) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-magic-wand text-xl text-primary"></i>
                    <cite class="font-bold text-primary not-italic">响应式魔术：自动填充 (Auto Grid)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-sm text-slate-600 mb-6">不写任何媒体查询，依然能完美适配屏幕。使用 <code class="inline-code">auto-grid-xs/sm/md/lg</code> 可以让列根据容器宽度自动换行和伸缩。试试改变浏览器窗口大小看看效果！</p>
                    
                    <div class="grid gap-4 auto-grid-fit auto-grid-sm bg-slate-50 p-4 rounded border border-slate-200 resize-x overflow-auto min-w-[300px] max-w-full">
                        <div class="bg-primary text-white h-12 rounded shadow-sm flex items-center justify-center font-bold text-sm">卡片 1</div>
                        <div class="bg-primary text-white h-12 rounded shadow-sm flex items-center justify-center font-bold text-sm">卡片 2</div>
                        <div class="bg-primary text-white h-12 rounded shadow-sm flex items-center justify-center font-bold text-sm">卡片 3</div>
                        <div class="bg-primary text-white h-12 rounded shadow-sm flex items-center justify-center font-bold text-sm">卡片 4</div>
                        <div class="bg-primary text-white h-12 rounded shadow-sm flex items-center justify-center font-bold text-sm">卡片 5</div>
                    </div>
                    <p class="text-xs text-warning mt-2 text-right"><i class="ph ph-warning-circle text-warning"></i> 拖动右下角可以缩放这个容器以测试响应式↗</p>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">Grid 属性映射字典</cite>  
                </div>
                <div class="overflow-x-auto bg-white p-2">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-slate-50 text-slate-500 border border-slate-200">
                            <tr>
                                <th class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs w-1/4">类名 (Class)</th>
                                <th class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs w-1/4">CSS 属性</th>
                                <th class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs">Jquan 架构解析</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700 border border-slate-200 border-t-0">
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-violet-600">grid-cols-{1..12|none}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">grid-template-columns: repeat(n, minmax(0, 1fr))</td>
                                <td class="px-4 py-3 text-slate-600">将容器等分为 N 列。是构建网格的基石。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-violet-600">grid-rows-{1..6|none}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">grid-template-rows: repeat(n, minmax(0, 1fr))</td>
                                <td class="px-4 py-3 text-slate-600">强制划分为 N 行（如果不设置则为隐式 auto 行）。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-fuchsia-600">col-span-{1..12|full}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">grid-column: span n / span n</td>
                                <td class="px-4 py-3 text-slate-600">让子项目横向跨越 N 个格子。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-fuchsia-600">col-start-{1..13|auto}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">grid-column-start: n</td>
                                <td class="px-4 py-3 text-slate-600">完美的 <strong>Offset 偏移</strong> 替代方案！强制从第 n 条物理网格线起笔。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-amber-600">order-{1..12|first|last}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">order: ...</td>
                                <td class="px-4 py-3 text-slate-600">完美的 <strong>Sort 排序</strong>。脱离 HTML 书写顺序进行重排。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-sky-600">auto-grid-{xs|sm|md|lg}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">grid-template-cols: repeat(auto-fit, minmax(...))</td>
                                <td class="px-4 py-3 text-slate-600">终极响应式绝招，根据最小断点宽度自动计算列数，永不溢出。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        // Jquan 核心状态机 (Grid 控制台)
        let state = {
            cols: 'grid-cols-4',
            rows: 'grid-rows-none',
            gap: 'gap-4'
        };

        const demoBox = container.querySelector('#demo-box');
        const codeContainer = container.querySelector('#code-container');
        const escapeHtml = value => String(value).replace(/[&<>\"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\"': '&quot;',
            "'": '&#39;'
        }[character]));
        const gapSlider = container.querySelector('#gap-slider');
        const gapDisplay = container.querySelector('#gap-display');

        // 动态生成子元素
        const renderItems = () => {
            const count = 12; 
            let html = '';
            for (let i = 1; i <= count; i++) {
                // 赋予不同的颜色深浅以增强网格边界的辨识度
                const bgClass = i % 2 === 0 ? 'bg-primary/60' : 'bg-primary';
                html += `<div class="${bgClass} text-white rounded-md shadow-sm flex items-center justify-center text-sm font-bold transition-all duration-300 w-full min-h-[3rem]">${i}</div>\n  `;
            }
            return html;
        };

        demoBox.innerHTML = renderItems();

        const updateBox = () => {
            // 保持背景和基础定位属性不变
            const baseClass = "w-full h-80 grid transition-all duration-300 relative bg-slate-50 border-2 border-violet-200/50 rounded-lg p-2 overflow-hidden";
            
            const stateClasses = [state.cols, state.rows, state.gap];
            
            demoBox.className = `${baseClass} ${stateClasses.join(' ')}`;

            // 实时生成代码片段！无需再手动转义 < >
            const htmlSnippet = 
`<div class="grid p-2 h-80
            ${stateClasses.join(' ')}">
  <div class="bg-violet-500">1</div>
  <div class="bg-violet-400">2</div>
  <!-- ... 共 12 个项目 ... -->
</div>`;

            codeContainer.innerHTML = `<pre><code class="language-html">${escapeHtml(htmlSnippet)}</code></pre>`;
            
            // Jquan 高亮引擎接管
            initCodeHighlighter({ showLineNumbers: true, langLabel: true });
        };

        // 绑定按钮事件 (Cols, Rows)
        const btns = container.querySelectorAll('.ctrl-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const type = target.dataset.type;
                
                // 重置同组按钮
                const groupBtns = container.querySelectorAll(`.ctrl-btn[data-type="${type}"]`);
                groupBtns.forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'border-slate-200', 'text-violet-600', 'font-bold', 'is-active');
                    b.classList.add('text-slate-500', 'hover:bg-white');
                });

                // 激活当前
                target.classList.remove('text-slate-500', 'hover:bg-white');
                target.classList.add('bg-white', 'shadow-sm', 'border-slate-200', 'text-violet-600', 'font-bold', 'is-active');
                
                state[type] = target.dataset.val;
                updateBox();
            });
        });

        // 绑定 Range Slider 事件 (Gap)
        gapSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            state.gap = `gap-${val}`;
            gapDisplay.textContent = `gap-${val}`;
            updateBox();
        });

        // 首次挂载初始化
        updateBox();
    }

    static async onSearch(keyword) {
        return [
            { title: 'grid', desc: '二维栅格布局、跨度与偏移', actionValue: 'grid' },
            { title: 'offset / order', desc: '利用 Grid 实现偏移与排序', actionValue: 'grid' }
        ];
    }
}
