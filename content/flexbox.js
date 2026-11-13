// 🚀 Jquan Optimized: Flexbox 弹性布局综合指南 (flexbox.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FlexboxDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">弹性盒子 (Flexbox)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">Flexbox 终极控制台</h1>
                <p class="text-slate-600">弹性盒子模型是一个强大的二维布局系统。我们将它分为两部分：作用于<b>容器 (Container)</b>的全局轴线控制，以及作用于<b>子项目 (Items)</b>的个体伸缩与对齐。</p>
            </div>

            <!-- ========================================== -->
            <!-- 🧪 实验室 1：Flex 容器 (Container) 控制台 -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-xl text-indigo-600"></i>
                        <cite class="font-bold text-indigo-900 not-italic">容器操纵实验室 (Container)</cite>
                    </div>
                    <span class="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                        控制主轴、交叉轴与折行行为
                    </span>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    <!-- 左侧：控制面板 -->
                    <div class="xl:col-span-4 flex flex-col gap-5">
                        
                        <!-- 1. Direction (主轴方向) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">主轴方向 (Direction)</span>
                            </div>
                            <select data-type="direction" class="ctrl-select w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all">
                                <option value="flex-row">flex-row (水平, 默认)</option>
                                <option value="flex-row-reverse">flex-row-reverse</option>
                                <option value="flex-col">flex-col (垂直)</option>
                                <option value="flex-col-reverse">flex-col-reverse</option>
                            </select>
                        </div>

                        <!-- 2. Wrap (折行) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">换行行为 (Wrap)</span>
                            </div>
                            <div class="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button data-type="wrap" data-val="flex-nowrap" class="ctrl-btn flex-1 py-1.5 rounded text-xs transition-all text-slate-500 hover:bg-white">nowrap</button>
                                <button data-type="wrap" data-val="flex-wrap" class="ctrl-btn flex-1 py-1.5 rounded text-xs transition-all bg-white shadow-sm border border-slate-200 text-indigo-600 font-bold is-active">wrap</button>
                                <button data-type="wrap" data-val="flex-wrap-reverse" class="ctrl-btn flex-1 py-1.5 rounded text-xs transition-all text-slate-500 hover:bg-white">reverse</button>
                            </div>
                        </div>

                        <hr class="border-slate-100 my-2">

                        <!-- 3. Justify Content (主轴对齐) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">主轴对齐 (Justify Content)</span>
                            </div>
                            <select data-type="justify" class="ctrl-select w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all">
                                <option value="justify-start">justify-start (默认)</option>
                                <option value="justify-end">justify-end</option>
                                <option value="justify-center">justify-center</option>
                                <option value="justify-between">justify-between (两端对齐)</option>
                                <option value="justify-around">justify-around (环绕)</option>
                                <option value="justify-evenly">justify-evenly (匀称)</option>
                            </select>
                        </div>

                        <!-- 4. Align Items (交叉轴单行对齐) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider" title="控制每一行内的交叉轴对齐方式">单行交叉轴 (Align Items)</span>
                            </div>
                            <select data-type="items" class="ctrl-select w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all">
                                <option value="items-stretch">items-stretch (默认拉伸)</option>
                                <option value="items-start">items-start</option>
                                <option value="items-center">items-center</option>
                                <option value="items-end">items-end</option>
                                <option value="items-baseline">items-baseline (基线)</option>
                            </select>
                        </div>

                        <!-- 5. Align Content (交叉轴多行对齐) -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider" title="需配合 flex-wrap 使用，控制多行的整体对齐">多行交叉轴 (Align Content)</span>
                                <span class="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded">需 Wrap</span>
                            </div>
                            <select data-type="content" class="ctrl-select w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all">
                                <option value="content-start">content-start</option>
                                <option value="content-center">content-center</option>
                                <option value="content-end">content-end</option>
                                <option value="content-between">content-between</option>
                                <option value="content-around">content-around</option>
                                <option value="content-evenly">content-evenly</option>
                                <option value="content-stretch">content-stretch (默认)</option>
                            </select>
                        </div>

                    </div>

                    <!-- 右侧：演示视窗 & 代码块 -->
                    <div class="xl:col-span-8 flex flex-col relative h-full">
                        <div class="bg-slate-100/50 rounded-lg p-4 md:p-6 flex-1 border border-slate-200 border-b-0 min-h-[360px]">
                            <!-- Jquan 演示盒子，具有固定宽高以体现各种对齐和拉伸 -->
                            <div id="demo-box" class="w-full h-80 bg-white border-2 border-dashed border-indigo-200 rounded-lg p-2 gap-2 flex transition-all duration-500 relative">
                                <!-- 背景辅助线标记中心 -->
                                <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                                    <div class="w-full h-px bg-indigo-300"></div>
                                    <div class="h-full w-px bg-indigo-300 absolute"></div>
                                </div>
                                <!-- 子元素们由 JS 动态生成 -->
                            </div>
                        </div>

                        <!-- 实时代码 -->
                        <div class="w-full py-4" id="code-container">
                            <!-- 动态代码 -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- 🎭 实验室 2：Flex 子项目 (Items) 行为图鉴 -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-squares-four text-xl text-emerald-600"></i>
                    <cite class="font-bold text-emerald-900 not-italic">子项目伸缩行为 (Flex Shorthand)</cite>
                </div>
                <div class="p-6 md:p-8 space-y-8">
                    <p class="text-sm text-slate-600">这四个简写类名定义了子项目在面对空间盈余或不足时的表现，是构建响应式组件的灵魂。</p>
                    
                    <!-- flex-1 -->
                    <div class="border border-slate-200 rounded-lg p-5">
                        <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                            <code class="font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-100">flex-1</code>
                            <span class="text-sm text-slate-600 font-medium">无视内容初始大小，平均分配所有剩余空间。<span class="text-xs text-slate-400 font-normal ml-2">(flex: 1 1 0%)</span></span>
                        </div>
                        <div class="flex gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                            <div class="flex-none w-20 bg-slate-300 text-center py-3 rounded text-sm text-slate-600">固定的头</div>
                            <div class="flex-1 bg-emerald-500 text-white text-center py-3 rounded shadow-sm flex items-center justify-center gap-2 font-mono text-sm">
                                <i class="ph ph-arrows-out-line-horizontal animate-pulse"></i> flex-1 (填满剩余)
                            </div>
                            <div class="flex-none w-20 bg-slate-300 text-center py-3 rounded text-sm text-slate-600">固定的尾</div>
                        </div>
                    </div>

                    <!-- flex-auto -->
                    <div class="border border-slate-200 rounded-lg p-5">
                        <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                            <code class="font-mono text-sky-600 bg-sky-50 px-2 py-1 rounded font-bold border border-sky-100">flex-auto</code>
                            <span class="text-sm text-slate-600 font-medium">基于内容初始大小，然后按比例分配剩余空间。<span class="text-xs text-slate-400 font-normal ml-2">(flex: 1 1 auto)</span></span>
                        </div>
                        <div class="flex gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                            <div class="flex-auto bg-sky-500 text-white text-center py-3 px-4 rounded shadow-sm text-sm">短内容 auto</div>
                            <div class="flex-auto bg-sky-600 text-white text-center py-3 px-4 rounded shadow-sm text-sm">内容很长很长就会抢占更多 auto</div>
                        </div>
                    </div>

                    <!-- flex-initial & none -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="border border-slate-200 rounded-lg p-5">
                            <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                                <code class="font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-100">flex-initial</code>
                                <span class="text-sm text-slate-600 font-medium">默认行为。不放大，但空间不够会缩小。</span>
                            </div>
                            <div class="flex gap-2 bg-slate-50 p-4 rounded border border-slate-200 overflow-hidden">
                                <div class="flex-initial w-64 bg-amber-500 text-white text-center py-3 rounded shadow-sm text-sm whitespace-nowrap overflow-hidden text-ellipsis">缩小时会截断</div>
                                <div class="flex-initial w-64 bg-amber-500 text-white text-center py-3 rounded shadow-sm text-sm whitespace-nowrap overflow-hidden text-ellipsis">缩小时会截断</div>
                            </div>
                        </div>

                        <div class="border border-slate-200 rounded-lg p-5">
                            <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                                <code class="font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded font-bold border border-rose-100">flex-none</code>
                                <span class="text-sm text-slate-600 font-medium">绝对死硬派。既不放大，也不缩小。</span>
                            </div>
                            <div class="flex gap-2 bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto">
                                <div class="flex-none w-48 bg-rose-500 text-white text-center py-3 rounded shadow-sm text-sm">宁死不屈 none</div>
                                <div class="flex-none w-48 bg-rose-500 text-white text-center py-3 rounded shadow-sm text-sm">宁死不屈 none</div>
                                <div class="flex-none w-48 bg-rose-500 text-white text-center py-3 rounded shadow-sm text-sm">溢出也无所谓</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- ========================================== -->
            <!-- 📚 字典映射区域 -->
            <!-- ========================================== -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">其它高级属性字典 (Advance Dictionary)</cite>  
                </div>
                <div class="overflow-x-auto bg-white p-2">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-slate-50 text-slate-500 border border-slate-200">
                            <tr>
                                <th class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs w-1/4">类名 (Class)</th>
                                <th class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs w-1/4">属性 (Property)</th>
                                <th class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs">描述 (Description)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700 border border-slate-200 border-t-0">
                            <!-- Grow / Shrink -->
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-primary">grow / grow-0</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">flex-grow: 1 / 0</td>
                                <td class="px-4 py-3 text-slate-600">允许/禁止项目瓜分容器的剩余空间。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-primary">shrink / shrink-0</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">flex-shrink: 1 / 0</td>
                                <td class="px-4 py-3 text-slate-600">允许/禁止项目在容器空间不足时被压缩。</td>
                            </tr>
                            <!-- Basis -->
                            <tr class="hover:bg-slate-50 bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-fuchsia-600">basis-{size}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">flex-basis: ...</td>
                                <td class="px-4 py-3 text-slate-600">在 flex 因子介入前，设置项目在主轴方向上的初始理想尺寸。它比 width/height 优先级更高。</td>
                            </tr>
                            <!-- Order -->
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-amber-600">order-{1..12} / first / last</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">order: {n} / -9999 / 9999</td>
                                <td class="px-4 py-3 text-slate-600">改变 DOM 结构视觉呈现的先后顺序，脱离 HTML 节点约束。</td>
                            </tr>
                            <!-- Align Self -->
                            <tr class="hover:bg-slate-50 bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-indigo-600">self-{auto|start|center|end|stretch}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">align-self: ...</td>
                                <td class="px-4 py-3 text-slate-600">赋予单个子项目特权，覆盖容器定义的 <code>align-items</code> 行为。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        // Jquan 核心状态机 (仅针对 Container 控制台)
        let state = {
            direction: 'flex-row',
            wrap: 'flex-wrap',
            justify: 'justify-start',
            items: 'items-stretch',
            content: 'content-start' // 老版本中缺失但在多行布局中极重要
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

        // 生成子元素的函数 (提供不同高度和宽度的方块，以便肉眼观察拉伸和对齐)
        const renderItems = () => {
            const count = 12; // 数量足够多，才能触发 wrap 和 content 对齐
            let html = '';
            for (let i = 1; i <= count; i++) {
                // 每隔几个元素赋予不同的高宽，以便观察基线和拉伸效果
                let sizeClass = 'w-16 h-16'; 
                if (i === 2) sizeClass = 'w-20 h-10';
                if (i === 5) sizeClass = 'w-12 h-24';
                if (i === 9) sizeClass = 'w-24 h-12';
                
                html += `<div class="bg-indigo-500 text-white rounded shadow flex items-center justify-center text-sm font-bold transition-all duration-300 ${sizeClass}">${i}</div>\n  `;
            }
            return html;
        };

        // 注入初始子项目
        demoBox.innerHTML += renderItems();

        const updateBox = () => {
            // 基础结构类
            const baseClass = 'w-full h-80 bg-white border-2 border-dashed border-indigo-200 rounded-lg p-2 gap-2 flex transition-all duration-500 relative';
            const stateClasses = [state.direction, state.wrap, state.justify, state.items, state.content];
            
            // 应用到 DOM
            demoBox.className = `${baseClass} ${stateClasses.join(' ')}`;

            // 生成代码片段交由高亮引擎处理
            const htmlSnippet = 
`<div class="flex gap-2 p-2 h-80
            ${stateClasses.join(' ')}">
  <div class="w-16 h-16">1</div>
  <div class="w-20 h-10">2</div>
  <!-- ... items ... -->
</div>`;

            codeContainer.innerHTML = `<pre><code class="language-html">${escapeHtml(htmlSnippet)}</code></pre>`;
            
            // 使用你的插件处理
            initCodeHighlighter({ showLineNumbers: true, langLabel: true });
        };

        // 绑定 Select 事件
        const selects = container.querySelectorAll('.ctrl-select');
        selects.forEach(select => {
            select.value = state[select.dataset.type]; // 确保 UI 与 State 一致
            select.addEventListener('change', (e) => {
                const type = e.currentTarget.dataset.type;
                state[type] = e.currentTarget.value;
                updateBox();
            });
        });

        // 绑定 Wrap Button 事件
        const wrapBtns = container.querySelectorAll('.ctrl-btn');
        wrapBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                
                wrapBtns.forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'border-slate-200', 'text-indigo-600', 'font-bold', 'is-active');
                    b.classList.add('text-slate-500', 'hover:bg-white');
                });

                target.classList.remove('text-slate-500', 'hover:bg-white');
                target.classList.add('bg-white', 'shadow-sm', 'border-slate-200', 'text-indigo-600', 'font-bold', 'is-active');
                
                state.wrap = target.dataset.val;
                updateBox();
            });
        });

        // 初始化第一次渲染
        updateBox();
    }

    static async onSearch(keyword) {
        return [
            { title: 'flexbox', desc: '弹性容器的方向、折行与对齐', actionValue: 'flexbox' },
            { title: 'flex-1/auto/none', desc: '弹性子项目的伸缩行为', actionValue: 'flexbox' }
        ];
    }
}
