// 🚀 Jquan Optimized: Layout Position 定位组件文档 (position.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutPositionDoc {
    static render() {
        // ==========================================
        // 🛠️ 预渲染方向与位移数据 (Direction Offset)
        // ==========================================
        const offsetData = [
            { class: '0', css: '0', desc: '位移为 0' },
            { class: 'px', css: '1px', desc: '位移为 1px' },
            { class: '0.5', css: '0.125rem (2px)', desc: '极小微调' },
            { class: '1', css: '0.25rem (4px)', desc: '1 个单位刻度' },
            { class: '1.5', css: '0.375rem (6px)', desc: '1.5 个单位刻度' },
            { class: '2', css: '0.5rem (8px)', desc: '2 个单位刻度' },
            { class: '2.5', css: '0.625rem (10px)', desc: '2.5 个单位刻度' },
            { class: '3', css: '0.75rem (12px)', desc: '3 个单位刻度' },
            { class: '3.5', css: '0.875rem (14px)', desc: '3.5 个单位刻度' },
            { class: '4', css: '1rem (16px)', desc: '标准基础位移' },
            { class: '5', css: '1.25rem (20px)', desc: '5 个单位刻度' },
            { class: '6', css: '1.5rem (24px)', desc: '6 个单位刻度' },
            { class: '7', css: '1.75rem (28px)', desc: '7 个单位刻度' },
            { class: '8', css: '2rem (32px)', desc: '中等位移' },
            { class: '9', css: '2.25rem (36px)', desc: '9 个单位刻度' },
            { class: '10', css: '2.5rem (40px)', desc: '10 个单位刻度' },
            { class: '11', css: '2.75rem (44px)', desc: '11 个单位刻度' },
            { class: '12', css: '3rem (48px)', desc: '大位移' },
            { class: '1/2', css: '50%', desc: '视口或容器的 50%' },
            { class: 'full', css: '100%', desc: '视口或容器的 100%' },
            { class: 'auto', css: 'auto', desc: '由浏览器自动计算' }
        ];

        const generateOffsetRows = () => offsetData.map(item => `
            <tr class="hover:bg-primary/5 transition-colors">
                <td class="px-6 py-3 font-mono font-medium text-slate-700">{dir}-${item.class}</td>
                <td class="px-6 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">{dir}: ${item.css};</span></td>
                <td class="px-6 py-3 text-slate-500">${item.desc}</td>
            </tr>
        `).join('');

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">定位 (Position)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">元素定位</h1>
                <p class="text-slate-600">控制元素在文档流中的排布方式。JquanUI 提供了高度语义化的定位类及精确到像素级的方位位移修饰符。</p>
            </div>

            <!-- 🧪 实验室：定位引擎动态沙盒 (标准卡片包裹 + 特殊主题风格) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-crosshair text-xl text-primary"></i>
                    <cite class="font-bold text-slate-800 not-italic">定位脱流实验室 Playground</cite>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- 控制面板 -->
                    <div class="lg:col-span-4 flex flex-col gap-4">
                        <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">定位模式 (Position Type)</p>
                        
                        <div class="flex flex-col gap-2" id="pos-controls">
                            <button data-pos="static" class="pos-btn flex flex-col items-start px-4 py-3 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">static</span>
                                <span class="text-xs text-slate-400 mt-1">默认状态，安分守己地呆在文档流中。</span>
                            </button>

                            <button data-pos="relative" class="pos-btn flex flex-col items-start px-4 py-3 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">relative</span>
                                <span class="text-xs text-slate-400 mt-1">留住原本占位，但可偏离原位置，更是 absolute 的锚点容器。</span>
                            </button>

                            <button data-pos="absolute" class="pos-btn flex flex-col items-start px-4 py-3 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary/30 transition-all text-left is-active">
                                <span class="font-mono font-bold text-primary text-sm transition-colors">absolute</span>
                                <span class="text-xs text-slate-500 mt-1">彻底脱离文档流，如同幽灵般吸附在最近的 relative 父级上。</span>
                            </button>
                        </div>
                    </div>

                    <!-- 演示视窗 -->
                    <div class="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner p-6 flex flex-col h-[320px]">
                        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-4">浏览器视口模拟</div>
                        
                        <!-- 模拟页面滚动区 -->
                        <div class="relative w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-4 overflow-auto scroll-smooth">
                            
                            <div class="h-16 border border-slate-200 bg-slate-100 rounded mb-4 flex items-center justify-center text-xs text-slate-400">普通的文档流内容块</div>
                            
                            <!-- 核心：相对定位的父级锚点 -->
                            <div class="relative w-full h-40 border-2 border-primary/30 bg-primary/5 rounded-lg flex items-center justify-center p-4">
                                <span class="absolute top-2 left-2 text-[10px] font-mono text-primary/60 font-bold">position: relative 父级锚点</span>
                                
                                <!-- 目标方块 -->
                                <div id="demo-box" class="absolute top-4 right-4 w-32 h-24 bg-primary text-white rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-500 z-10 opacity-90 backdrop-blur">
                                    <i class="ph ph-ghost text-2xl mb-1 drop-shadow-sm"></i>
                                    <span class="font-mono text-sm font-bold tracking-wider bg-black/20 px-2 py-0.5 rounded" id="demo-badge">absolute</span>
                                </div>

                                <div class="w-full h-full border border-primary/20 bg-white/50 rounded flex items-center justify-center text-xs text-slate-400">父级内部文档流块</div>
                            </div>

                            <div class="h-32 border border-slate-200 bg-slate-100 rounded mt-4 flex items-center justify-center text-xs text-slate-400">向下滚动查看更多...</div>
                            <div class="h-32 border border-slate-200 bg-slate-100 rounded mt-4 flex items-center justify-center text-xs text-slate-400">页面底部内容</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="grid grid-cols-1 gap-6">
                
                <!-- 核心定位属性表 (标准卡片包裹) -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                        <i class="ph ph-push-pin text-slate-400 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">核心定位属性 (Position Classes)</cite>
                    </div>
                    <div class="overflow-x-auto bg-white">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th class="px-6 py-3 font-medium tracking-wide">类名 (Class)</th>
                                    <th class="px-6 py-3 font-medium tracking-wide">CSS 属性</th>
                                    <th class="px-6 py-3 font-medium tracking-wide">行为描述</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700">
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-slate-700">static</td>
                                    <td class="px-6 py-4"><span class="bg-slate-100 px-2 py-1 rounded text-xs font-mono whitespace-nowrap">position: static;</span></td>
                                    <td class="px-6 py-4 leading-relaxed">默认值。元素乖乖遵循正常的文档流排布，<code class="text-rose-500 bg-rose-50 px-1 rounded mx-0.5">top/right/bottom/left</code> 对其完全无效。</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">relative</td>
                                    <td class="px-6 py-4"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono whitespace-nowrap">position: relative;</span></td>
                                    <td class="px-6 py-4 leading-relaxed">元素仍然保留在正常的文档流中（保留其原始占位），但可以通过方位属性相对于其<strong class="text-slate-900">原始位置</strong>进行偏移。通常用作绝对定位子元素的“定海神针”。</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-amber-600">absolute</td>
                                    <td class="px-6 py-4"><span class="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-mono whitespace-nowrap">position: absolute;</span></td>
                                    <td class="px-6 py-4 leading-relaxed">彻底脱离文档流（不占空间）。它会像幽灵一样寻找<strong class="text-slate-900">最近的已定位（非 static）祖先元素</strong>作为基准原点。如果没找到，就以整个页面文档为基准。</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-emerald-600">fixed</td>
                                    <td class="px-6 py-4"><span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-mono whitespace-nowrap">position: fixed;</span></td>
                                    <td class="px-6 py-4 leading-relaxed">脱离文档流。永远相对于<strong class="text-slate-900">浏览器的可视窗口</strong>进行定位。任凭页面怎么翻滚，它都纹丝不动，常用于回到顶部按钮、全局顶栏。</td>
                                </tr>
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-indigo-600">sticky</td>
                                    <td class="px-6 py-4"><span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-mono whitespace-nowrap">position: sticky;</span></td>
                                    <td class="px-6 py-4 leading-relaxed">跨界混血儿。在跨越特定阈值前，它像 <code class="bg-slate-100 px-1 rounded text-xs">relative</code> 一样滚动；一旦滚动到达设定阈值（如 <code class="bg-slate-100 px-1 rounded text-xs">top-0</code>），它立刻“粘”在视口上，化身 <code class="bg-slate-100 px-1 rounded text-xs">fixed</code>。</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 方位与位移速查表 (标准卡片包裹) -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                        <i class="ph ph-arrows-out-cardinal text-slate-400 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">方向与位移 (Placement & Offset)</cite>
                    </div>
                    <div class="p-6 bg-white border-b border-slate-100">
                        <p class="text-sm text-slate-600 leading-relaxed mb-4">
                            使用前缀 <code class="inline-code font-bold">top-</code>、<code class="inline-code font-bold">right-</code>、<code class="inline-code font-bold">bottom-</code>、<code class="inline-code font-bold">left-</code> 配合下方的位移刻度来精准锚定元素。
                        </p>
                        
                        <!-- 神级缩写 Inset 介绍 -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col items-center text-center justify-center">
                                <span class="font-mono font-bold text-primary mb-2">inset-*</span>
                                <span class="text-xs text-slate-500">同时设置 <br>top, right, bottom, left</span>
                            </div>
                            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center justify-center">
                                <span class="font-mono font-bold text-slate-700 mb-2">inset-x-*</span>
                                <span class="text-xs text-slate-500">同时设置横向 <br>left, right</span>
                            </div>
                            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center justify-center">
                                <span class="font-mono font-bold text-slate-700 mb-2">inset-y-*</span>
                                <span class="text-xs text-slate-500">同时设置纵向 <br>top, bottom</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-0 max-h-[400px] overflow-y-auto bg-white">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white/90 backdrop-blur text-slate-500 sticky top-0 border-b border-slate-100 z-10 shadow-sm">
                                <tr>
                                    <th class="px-6 py-3 font-medium">类名组合演示</th>
                                    <th class="px-6 py-3 font-medium">CSS 映射</th>
                                    <th class="px-6 py-3 font-medium">描述</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-600">
                                ${generateOffsetRows().replace(/\{dir\}/g, 'left')}
                                
                                <!-- 专属 inset 展示 -->
                                <tr class="hover:bg-primary/5 transition-colors bg-primary/5 border-t-2 border-primary/10">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">inset-0</td>
                                    <td class="px-6 py-4">
                                        <div class="bg-white border border-primary/20 px-2 py-1 rounded text-xs font-mono text-primary leading-tight inline-block">
                                            top: 0;<br>right: 0;<br>bottom: 0;<br>left: 0;
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-slate-500">快速填满父容器神技（配合 absolute 使用）</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：绑定交互事件，维护组件级状态
    // ==========================================
    static mount(container) {
        // 1. 初始化标准代码高亮引擎
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        // 2. 绑定定位沙盒交互引擎
        const buttons = container.querySelectorAll('.pos-btn');
        const demoBox = container.querySelector('#demo-box');
        const badge = container.querySelector('#demo-badge');

        if (!demoBox || buttons.length === 0) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const posType = target.dataset.pos; // 'static', 'relative', 'absolute'

                // A. 视觉状态复位
                buttons.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/5', 'ring-1', 'ring-primary/30', 'is-active');
                    b.classList.add('border-slate-200', 'bg-white');
                    
                    const title = b.querySelector('span:first-child');
                    if(title) {
                        title.classList.remove('text-primary');
                        title.classList.add('text-slate-700');
                    }
                });

                // B. 激活当前按钮视觉
                target.classList.remove('border-slate-200', 'bg-white');
                target.classList.add('border-primary', 'bg-primary/5', 'ring-1', 'ring-primary/30', 'is-active');
                
                const activeTitle = target.querySelector('span:first-child');
                if(activeTitle) {
                    activeTitle.classList.remove('text-slate-700');
                    activeTitle.classList.add('text-primary');
                }

                // C. 驱动引擎更新 DOM 物理表现
                // 清除所有可能影响演示的旧类名
                demoBox.classList.remove('static', 'relative', 'absolute', 'fixed', 'sticky');
                demoBox.classList.remove('top-4', 'right-4', 'left-4', 'top-0', 'left-0');
                
                // 写入新的属性
                demoBox.classList.add(posType);
                badge.innerText = posType;

                // 针对不同定位，给予最直观的默认位移修饰符
                if (posType === 'absolute') {
                    demoBox.classList.add('top-4', 'right-4');
                } else if (posType === 'relative') {
                    demoBox.classList.add('top-4', 'left-4');
                }
            });
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'static / relative / absolute / fixed / sticky', desc: '元素定位类型' },
            { class: 'top-* / right-* / bottom-* / left-*', desc: '元素脱离文档流后的位移方向' },
            { class: 'inset-*', desc: '全向位移缩写 (top+right+bottom+left)' },
            { class: 'inset-x-*', desc: '水平位移缩写 (left+right)' },
            { class: 'inset-y-*', desc: '垂直位移缩写 (top+bottom)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'position' 
        }));
    }
}