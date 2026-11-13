// 🚀 Jquan Ultimate: Layout Visible 响应式显隐文档 (visible.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutVisibleDoc {
    static render() {
        // ==========================================
        // 🛠️ 预渲染真值表 (Truth Matrix) HTML
        // ==========================================
        const bpOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
        // 保留你修改的 ph 图标
        const checkIcon = '<i class="ph ph-check text-primary text-xl font-black drop-shadow-sm"></i>';
        const crossIcon = '<i class="ph ph-x text-slate-300 text-xl font-bold"></i>';
        
        let matrixHtml = '';
        
        // 生成 Visible 组
        bpOrder.forEach(targetBp => {
            matrixHtml += `<tr class="hover:bg-primary/5 transition-colors">
                <td class="px-5 py-4 font-mono font-bold text-slate-700 text-left border-r border-slate-100 bg-slate-50/50">visible-${targetBp}</td>`;
            bpOrder.forEach(currentBp => {
                const isVisible = targetBp === currentBp;
                matrixHtml += `<td class="px-4 py-4">${isVisible ? checkIcon : crossIcon}</td>`;
            });
            matrixHtml += '</tr>';
        });

        // 柔和的分界线
        matrixHtml += `<tr class="bg-slate-100/50"><td colspan="9" class="h-1.5 p-0"></td></tr>`;

        // 生成 Hidden 组
        bpOrder.forEach(targetBp => {
            matrixHtml += `<tr class="hover:bg-primary/5 transition-colors">
                <td class="px-5 py-4 font-mono font-bold text-slate-700 text-left border-r border-slate-100 bg-slate-50/50">hidden-${targetBp}</td>`;
            bpOrder.forEach(currentBp => {
                const isHidden = targetBp === currentBp;
                matrixHtml += `<td class="px-4 py-4">${isHidden ? crossIcon : checkIcon}</td>`;
            });
            matrixHtml += '</tr>';
        });

        // 断点色彩映射 (为物理沙盒准备)
        const colorMap = {
            xs: 'rose', sm: 'orange', md: 'amber', lg: 'green',
            xl: 'emerald', '2xl': 'cyan', '3xl': 'blue', '4xl': 'indigo'
        };

        // 预生成物理沙盒卡片 HTML
        let visibleBlocks = '';
        let hiddenBlocks = '';
        
        bpOrder.forEach(bp => {
            const color = colorMap[bp];
            const baseClass = `sim-block flex items-center justify-center font-mono text-sm font-bold rounded-lg transition-all duration-300 ease-out overflow-hidden whitespace-nowrap bg-${color}-50 text-${color}-600 border-${color}-200 shadow-sm`;
            
            visibleBlocks += `<div data-bp="${bp}" data-type="visible" class="${baseClass}">visible-${bp}</div>`;
            hiddenBlocks += `<div data-bp="${bp}" data-type="hidden" class="${baseClass}">hidden-${bp}</div>`;
        });

        // ==========================================
        // 🚀 返回最终视图
        // ==========================================
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-home"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">响应式显隐 (Responsive Visibility)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">响应式显隐</h1>
                <p class="text-slate-600">
                    基于设备断点精确控制元素的显示与隐藏。<br>
                    <span class="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded text-sm mt-2 border border-primary/20">
                        <i class="ph ph-info-circle"></i> JquanUI 的显隐类是<b>区间隔离（Tier-specific）</b>的，即 visible-md 仅在中屏显示，不会影响小屏和大屏。
                    </span>
                </p>
            </div>

            <!-- 🎨 模块 1：终极态 Playground：物理坍缩与重排沙盒 -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-laptop text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">响应式物理显隐沙盒 (Physics Simulator)</cite>
                    </div>
                    <span class="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 hidden sm:inline-block shadow-sm">
                        <i class="ph ph-expand-horizontal"></i> 拖拽右侧边缘，观察下方元素的“折叠消失”与“挤占出现”
                    </span>
                </div>
                
                <div class="p-6 md:p-8">
                    <div class="bg-slate-100/50 p-4 rounded-xl border border-primary/10">
                        <div id="demo-viewport" class="relative resize-x overflow-hidden min-w-[320px] max-w-full bg-white border border-slate-200 rounded-lg shadow-sm mx-auto flex flex-col transition-colors duration-150 pb-6">
                            
                            <!-- 顶栏标尺 -->
                            <div class="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
                                <div class="font-mono text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <i class="ph ph-ruler text-slate-400"></i>
                                    <span id="sim-width">100%</span>
                                </div>
                                <div class="font-mono text-sm font-black text-primary bg-primary/10 px-3 py-0.5 rounded border border-primary/20" id="sim-bp">
                                    xs
                                </div>
                            </div>

                            <!-- 实体展现区 -->
                            <div class="p-5 flex flex-col gap-8">
                                
                                <!-- Visible 组展现 -->
                                <div>
                                    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <i class="ph ph-eye text-emerald-500 text-base"></i> Visible 元素池 (仅当前断点可见)
                                    </h3>
                                    <!-- 真实重排容器 -->
                                    <div class="flex flex-wrap gap-y-2 min-h-[44px] p-2 bg-slate-50 rounded border border-slate-100 shadow-inner" id="sim-visible-zone">
                                        ${visibleBlocks}
                                    </div>
                                    <p class="text-[10px] text-slate-400 mt-1 pl-1">※ 你永远只会看到唯一一个方块处于展开状态</p>
                                </div>

                                <!-- Hidden 组展现 -->
                                <div>
                                    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <i class="ph ph-eye-closed text-rose-500 text-base"></i> Hidden 元素池 (仅当前断点隐藏)
                                    </h3>
                                    <!-- 真实重排容器 -->
                                    <div class="flex flex-wrap gap-y-2 min-h-[44px] p-2 bg-slate-50 rounded border border-slate-100 shadow-inner" id="sim-hidden-zone">
                                        ${hiddenBlocks}
                                    </div>
                                    <p class="text-[10px] text-slate-400 mt-1 pl-1">※ 你会看到整个队列中，只有当前断点对应的方块发生了折叠坍缩</p>
                                </div>

                            </div>

                            <!-- 拖拽提示柄 -->
                            <svg class="absolute bottom-1 right-1 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 14L14 10M5 14L14 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 模块 2：显隐真值表 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-table text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">可见性状态真值表 (Visibility Truth Matrix)</cite>
                    </div>
                    <div class="flex gap-4 text-xs text-slate-500">
                        <span class="flex items-center gap-1"><i class="ph ph-check text-primary text-base font-bold"></i> 显示</span>
                        <span class="flex items-center gap-1"><i class="ph ph-x text-slate-300 text-base font-bold"></i> 隐藏</span>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-center text-sm whitespace-nowrap">
                        <thead class="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th class="px-5 py-4 font-bold text-left border-r border-slate-100 bg-slate-50">类名响应图谱</th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">xs</div><div class="text-[10px] text-slate-400 font-normal">&lt;640px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">sm</div><div class="text-[10px] text-slate-400 font-normal">≥640px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">md</div><div class="text-[10px] text-slate-400 font-normal">≥768px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">lg</div><div class="text-[10px] text-slate-400 font-normal">≥1024px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">xl</div><div class="text-[10px] text-slate-400 font-normal">≥1280px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">2xl</div><div class="text-[10px] text-slate-400 font-normal">≥1536px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">3xl</div><div class="text-[10px] text-slate-400 font-normal">≥1920px</div></th>
                                <th class="px-4 py-4"><div class="text-xs font-bold text-slate-700">4xl</div><div class="text-[10px] text-slate-400 font-normal">≥2560px</div></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            ${matrixHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 🔧 模块 3：特殊显示模式修饰符 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-sliders text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">特殊 Display 修饰符 (Modifiers)</cite>
                    </div>
                </div>
                <div class="p-6">
                    <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                        <code class="inline-code">visible-*</code> 默认恢复的显示属性是 <code class="inline-code">display: block;</code>。如果需要其他排列方式，请追加组合修饰符。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                            <span class="font-mono text-sm font-bold text-slate-700 mb-2">visible-*-block</span>
                            <span class="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded shadow-sm">display: block;</span>
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                            <span class="font-mono text-sm font-bold text-slate-700 mb-2">visible-*-inline</span>
                            <span class="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded shadow-sm">display: inline;</span>
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                            <span class="font-mono text-sm font-bold text-slate-700 mb-2">visible-*-inline-block</span>
                            <span class="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded shadow-sm">display: inline-block;</span>
                        </div>
                    </div>

                    <div class="rounded-lg overflow-hidden">
                        <pre><code class="language-html">
&lt;!-- 仅在中屏 (md) 显示，并且作为 inline-block 排列 --&gt;
&lt;div class="visible-md-inline-block bg-primary text-white p-2 rounded"&gt;
    中屏特供按钮
&lt;/div&gt;

&lt;!-- 仅在超大屏 (2xl) 显示，作为 inline 文本 --&gt;
&lt;span class="visible-2xl-inline text-amber-500"&gt;宽屏提示信息&lt;/span&gt;
                        </code></pre>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：物理重排引擎
    // ==========================================
    static mount(container) {
        initCodeHighlighter({ showLineNumbers: true, langLabel: false });

        const bpThresholds = [
            { bp: '4xl', min: 2560 },
            { bp: '3xl', min: 1920 },
            { bp: '2xl', min: 1536 },
            { bp: 'xl', min: 1280 },
            { bp: 'lg', min: 1024 },
            { bp: 'md', min: 768 },
            { bp: 'sm', min: 640 },
            { bp: 'xs', min: 0 }
        ];

        const viewport = container.querySelector('#demo-viewport');
        const widthLabel = container.querySelector('#sim-width');
        const bpLabel = container.querySelector('#sim-bp');
        const blocks = container.querySelectorAll('.sim-block');

        // 定义展开与折叠的具体 CSS 状态
        // 用 width, opacity 和 padding/margin 做过渡，实现丝滑的元素显隐推挤效果
        const stateExpand = ['w-28', 'opacity-100', 'px-3', 'py-1.5', 'mx-1', 'border'];
        const stateCollapse = ['w-0', 'opacity-0', 'px-0', 'py-0', 'mx-0', 'border-0', 'pointer-events-none'];

        const setBlockState = (block, show) => {
            if (show) {
                block.classList.remove(...stateCollapse);
                block.classList.add(...stateExpand);
            } else {
                block.classList.remove(...stateExpand);
                block.classList.add(...stateCollapse);
            }
        };

        if (viewport) {
            let lastBp = '';

            const updateDashboard = (width) => {
                widthLabel.innerText = `${Math.round(width)}px`;
                
                const currentBpMatch = bpThresholds.find(b => width >= b.min);
                const currentBp = currentBpMatch ? currentBpMatch.bp : 'xs';

                if (currentBp !== lastBp) {
                    lastBp = currentBp;
                    bpLabel.innerText = currentBp;

                    // 核心物理动画引擎：遍历所有块并赋予展开/折叠状态
                    blocks.forEach(block => {
                        const blockBp = block.dataset.bp;
                        const type = block.dataset.type;

                        if (type === 'visible') {
                            // Visible 元素：只有等于当前断点时，展开，其它坍缩
                            setBlockState(block, blockBp === currentBp);
                        } else {
                            // Hidden 元素：只有等于当前断点时，坍缩，其它展开
                            setBlockState(block, blockBp !== currentBp);
                        }
                    });
                }
            };

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    updateDashboard(entry.contentRect.width);
                }
            });

            resizeObserver.observe(viewport);
            
            // 初始状态立即赋予
            updateDashboard(viewport.offsetWidth);
        }
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'visible-xs ~ visible-4xl', desc: '仅在特定区间屏幕宽度下显示' },
            { class: 'hidden-xs ~ hidden-4xl', desc: '仅在特定区间屏幕宽度下隐藏' },
            { class: 'visible-*-block', desc: '以 block 形式响应式显示' },
            { class: 'visible-*-inline', desc: '以 inline 形式响应式显示' },
            { class: 'visible-*-inline-block', desc: '以 inline-block 形式响应式显示' }
        ];
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'visible' 
        }));
    }
}