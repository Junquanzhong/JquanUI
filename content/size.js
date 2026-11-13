// 🚀 Jquan Optimized: Layout Size 尺寸与纵横比文档 (size.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutSizeDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">尺寸系统 (W / H / Aspect)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">尺寸系统</h1>
                <p class="text-slate-600">在 JquanUI 中，通过高度集成的 <code class="inline-code">w-*</code>、<code class="inline-code">h-*</code> 以及 <code class="inline-code">aspect-*</code> 类，你可以以难以置信的速度构建出精准且响应式的布局容器。</p>
            </div>

            <!-- 🧪 核心模块 1：动态尺寸实验室 (标准卡片包裹) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-sliders-horizontal text-xl text-primary"></i>
                    <cite class="font-bold text-slate-800 not-italic">尺寸实验室 Playground</cite>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- 控制面板 -->
                        <section class="lg:col-span-1 flex flex-col space-y-6">
                            <!-- 宽度控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">宽度 (Width)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="w" data-class="w-24" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">w-24</button>
                                    <button data-type="w" data-class="w-48" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">w-48</button>
                                    <button data-type="w" data-class="w-1/2" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">w-1/2</button>
                                    <button data-type="w" data-class="w-full" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">w-full</button>
                                </div>
                            </div>
                            
                            <!-- 高度控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">高度 (Height)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="h" data-class="h-24" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">h-24</button>
                                    <button data-type="h" data-class="h-40" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">h-40</button>
                                    <button data-type="h" data-class="h-full" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">h-full</button>
                                </div>
                            </div>

                            <!-- 组合控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">快捷正方形 (Size)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="size" data-class="size-16" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all">size-16</button>
                                    <button data-type="size" data-class="size-32" class="size-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all">size-32</button>
                                </div>
                            </div>
                        </section>

                        <!-- 演示视窗 -->
                        <section class="lg:col-span-3 relative h-64 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4 bg-slate-50">
                            <!-- 标尺辅助线 -->
                            <div class="absolute inset-0 pointer-events-none border border-primary/20"></div>
                            
                            <!-- 目标元素 -->
                            <div id="demo-box" class="w-full h-24 bg-primary text-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ring-4 ring-primary/30">
                                <div class="font-mono text-sm tracking-widest px-3 py-1 bg-black/20 rounded backdrop-blur-sm" id="demo-code">
                                    w-full h-24
                                </div>
                            </div>
                        </section>
                    </div>
                    <div class="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="text-xs text-slate-500">实时组合 · 使用统一代码块组件复制</div>
                            <span class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">Live</span>
                        </div>
                        <div id="size-playground-code-host"></div>
                        <p id="size-playground-status" class="m-0 text-xs text-slate-500" aria-live="polite">w-full h-24 · aspect-video</p>
                    </div>
                </div>
            </div>

            <!-- 📐 核心模块 2：现代布局神器 - 纵横比 (Aspect Ratio) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-aspect-ratio text-xl text-indigo-500"></i>
                    <cite class="font-bold text-slate-800 not-italic">纵横比系统 (Aspect Ratio)</cite>
                    <span class="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded text-[10px] font-bold tracking-wider uppercase">现代布局必备</span>
                </div>
                
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        在视频播放器、图片画廊或商品卡片中，维持固定的宽高比是极其常见的需求。过去我们依赖 <code class="inline-code">padding-bottom</code> Hack 技术，而在 JquanUI 中，仅需一行 <code class="inline-code">aspect-*</code>，容器就会根据宽度自动撑开完美的高度！
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <!-- 控制面板 -->
                        <div class="lg:col-span-1 flex flex-col gap-3">
                            <button data-aspect="aspect-video" class="aspect-btn px-4 py-2.5 text-sm font-medium rounded-lg border border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200 ring-offset-1 transition-all flex justify-between items-center">
                                <span>aspect-video</span><span class="text-xs opacity-70 font-mono font-bold">16 / 9</span>
                            </button>
                            <button data-aspect="aspect-square" class="aspect-btn px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-600 transition-all flex justify-between items-center">
                                <span>aspect-square</span><span class="text-xs opacity-70 font-mono font-bold">1 / 1</span>
                            </button>
                            <button data-aspect="aspect-4/3" class="aspect-btn px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-600 transition-all flex justify-between items-center">
                                <span>aspect-4/3</span><span class="text-xs opacity-70 font-mono font-bold">4 / 3</span>
                            </button>
                            <button data-aspect="aspect-3/2" class="aspect-btn px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-600 transition-all flex justify-between items-center">
                                <span>aspect-3/2</span><span class="text-xs opacity-70 font-mono font-bold">3 / 2</span>
                            </button>
                            <button data-aspect="aspect-auto" class="aspect-btn px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-600 transition-all flex justify-between items-center">
                                <span>aspect-auto</span><span class="text-xs opacity-70 font-mono font-bold">auto</span>
                            </button>
                        </div>
                        
                        <!-- 演示视窗 -->
                        <div class="lg:col-span-2 flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[360px] items-center bg-slate-50 relative">
                            
                            <!-- 纵横比目标元素 (固定宽，自动高) -->
                            <div id="aspect-demo-box" class="w-64 sm:w-80 aspect-video bg-indigo-900 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative group border border-indigo-400/30">
                                <!-- 真实图景模拟 -->
                                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen group-hover:scale-110 transition-transform duration-1000" alt="Aspect Ratio Demo">
                                
                                <!-- 叠加渐变使文字更清晰 -->
                                <div class="absolute inset-0 bg-gradient-to-t from-indigo-950/80 to-transparent pointer-events-none"></div>

                                <div class="relative z-10 flex flex-col items-center gap-1.5 translate-y-2">
                                    <div class="font-mono text-sm tracking-widest px-3 py-1.5 bg-black/40 text-white rounded-lg backdrop-blur-md border border-white/20 shadow-2xl flex items-center gap-2">
                                        <i class="ph ph-crop"></i>
                                        <span id="aspect-demo-code">aspect-video</span>
                                    </div>
                                    <span class="text-xs text-white/80 font-medium tracking-widest" id="aspect-demo-sub">16 / 9</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 字典表格区域 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- 响应式百分比 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                        <i class="ph ph-drop text-slate-400 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">响应式百分比 (Fluid)</cite>
                    </div>
                    <div class="p-0 max-h-96 overflow-y-auto bg-white">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white/90 backdrop-blur text-slate-500 sticky top-0 border-b border-slate-100 z-10 shadow-sm">
                                <tr>
                                    <th class="px-6 py-3 font-medium">工具类 (w- / h-)</th>
                                    <th class="px-6 py-3 font-medium">计算属性</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700">
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">1/2</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">50%</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">1/3</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">33.333333%</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">2/3</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">66.666667%</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">1/4</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">25%</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">3/4</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">75%</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono text-primary font-bold">full</td><td class="px-6 py-3"><span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">100%</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 视口与内容适配 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                        <i class="ph ph-corners-out text-slate-400 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">视口与内容适配 (Viewport & Content)</cite>
                    </div>
                    <div class="p-0 max-h-96 overflow-y-auto bg-white">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white/90 backdrop-blur text-slate-500 sticky top-0 border-b border-slate-100 z-10 shadow-sm">
                                <tr>
                                    <th class="px-6 py-3 font-medium">工具类</th>
                                    <th class="px-6 py-3 font-medium">映射规则</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700">
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono font-bold text-primary">w-screen</td><td class="px-6 py-3">width: <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">100vw</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono font-bold text-primary">h-screen</td><td class="px-6 py-3">height: <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">100vh</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono font-bold text-primary">h-svh</td><td class="px-6 py-3">height: <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">100svh</span> <span class="text-xs text-slate-400 ml-1">// 安全视口</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">{w|h}-auto</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">auto</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">{w|h}-min</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">min-content</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">{w|h}-max</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">max-content</span></td></tr>
                                <tr class="hover:bg-primary/5 transition-colors"><td class="px-6 py-3 font-mono">{w|h}-fit</td><td class="px-6 py-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">fit-content</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- 极限约束 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm md:col-span-2 flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center gap-2">
                        <i class="ph ph-arrows-left-right text-slate-400 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">极限约束 (Min / Max Constraints)</cite>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 bg-white">
                        <div class="border-b md:border-b-0 md:border-r border-slate-200">
                            <table class="w-full text-left text-sm border-collapse">
                                <thead class="bg-white text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th class="px-6 py-4 font-medium">最小限制 (min-w- / min-h-)</th>
                                        <th class="px-6 py-4 font-medium">属性值</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-700">
                                    <tr class="hover:bg-primary/5"><td class="px-6 py-4 font-mono">min-{w|h}-0</td><td class="px-6 py-4"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">0px</span></td></tr>
                                    <tr class="hover:bg-primary/5"><td class="px-6 py-4 font-mono">min-{w|h}-full</td><td class="px-6 py-4"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">100%</span></td></tr>
                                    <tr class="hover:bg-primary/5"><td class="px-6 py-4 font-mono">min-{w|h}-screen</td><td class="px-6 py-4"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">100vw / 100vh</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <table class="w-full text-left text-sm border-collapse">
                                <thead class="bg-white text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th class="px-6 py-4 font-medium">最大限制 (max-w- / max-h-)</th>
                                        <th class="px-6 py-4 font-medium">属性值</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-700">
                                    <tr class="hover:bg-primary/5"><td class="px-6 py-4 font-mono">max-{w|h}-0</td><td class="px-6 py-4"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">0px</span></td></tr>
                                    <tr class="hover:bg-primary/5"><td class="px-6 py-4 font-mono">max-{w|h}-full</td><td class="px-6 py-4"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">100%</span></td></tr>
                                    <tr class="hover:bg-primary/5"><td class="px-6 py-4 font-mono">max-w-7xl</td><td class="px-6 py-4"><span class="bg-slate-100 px-2 py-0.5 rounded text-xs">80rem (1280px)</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        `;
    }

    static mount(container) {
        const codeHost = container.querySelector('#size-playground-code-host');
        const statusDisplay = container.querySelector('#size-playground-status');
        const sizeState = { w: 'w-full', h: 'h-24', size: '' };
        let currentAspect = 'aspect-video';
        const escapeHtml = value => String(value).replace(/[&<>\"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\"': '&quot;',
            "'": '&#39;'
        }[character]));
        const getSizeClasses = () => [sizeState.size || sizeState.w, sizeState.size ? '' : sizeState.h].filter(Boolean).join(' ');
        const updateCodeFeedback = () => {
            const sizeClasses = getSizeClasses();
            const classString = `${sizeClasses} · ${currentAspect}`;
            if (codeHost) {
                const source = `<div class="${sizeClasses}">尺寸内容</div>\n<div class="${currentAspect}">纵横比内容</div>`;
                codeHost.innerHTML = `<pre><code class="language-html">${escapeHtml(source)}</code></pre>`;
                initCodeHighlighter({ selector: '#size-playground-code-host pre code', showLineNumbers: false, langLabel: false });
            }
            if (statusDisplay) statusDisplay.textContent = classString;
        };

        // --- 逻辑 1: W/H Size 控制面板 ---
        const demoBox = container.querySelector('#demo-box');
        const codeDisplay = container.querySelector('#demo-code');
        const buttons = container.querySelectorAll('.size-btn');

        if (demoBox && buttons.length > 0) {
            const deactivateAllType = (typeFilter) => {
                buttons.forEach(btn => {
                    if (btn.dataset.type === typeFilter || typeFilter === 'all') {
                        btn.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30', 'border-orange-500', 'bg-orange-100', 'ring-orange-300');
                        btn.classList.add('border-slate-200', 'bg-white');
                        if (btn.dataset.type === 'size') {
                            btn.classList.add('border-orange-200', 'bg-orange-50');
                        }
                    }
                });
            };

            const activateBtn = (btn, isSize) => {
                btn.classList.remove('border-slate-200', 'bg-white', 'border-orange-200', 'bg-orange-50');
                if (isSize) {
                    btn.classList.add('border-orange-500', 'bg-orange-100', 'ring-2', 'ring-orange-300', 'ring-offset-1');
                } else {
                    btn.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30', 'ring-offset-1');
                }
            };

            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    const type = target.dataset.type; 
                    const className = target.dataset.class; 

                    if (type === 'size') {
                        if (sizeState.w) demoBox.classList.remove(sizeState.w);
                        if (sizeState.h) demoBox.classList.remove(sizeState.h);
                        if (sizeState.size) demoBox.classList.remove(sizeState.size);

                        sizeState.size = className;
                        sizeState.w = '';
                        sizeState.h = '';

                        demoBox.classList.add(sizeState.size);
                        codeDisplay.innerText = sizeState.size;

                        deactivateAllType('all');
                        activateBtn(target, true);

                    } else {
                        if (sizeState.size) {
                            demoBox.classList.remove(sizeState.size);
                            sizeState.size = '';
                            deactivateAllType('size');
                        }

                        if (sizeState[type]) demoBox.classList.remove(sizeState[type]);
                        
                        sizeState[type] = className;
                        demoBox.classList.add(sizeState[type]);

                        deactivateAllType(type);
                        activateBtn(target, false);

                        let text = [];
                        if (sizeState.w) text.push(sizeState.w);
                        if (sizeState.h) text.push(sizeState.h);
                        codeDisplay.innerText = text.join(' ');
                    }
                    updateCodeFeedback();
                });
            });
        }

        // --- 逻辑 2: 纵横比 (Aspect Ratio) 控制面板 ---
        const aspectBtns = container.querySelectorAll('.aspect-btn');
        const aspectDemoBox = container.querySelector('#aspect-demo-box');
        const aspectDemoCode = container.querySelector('#aspect-demo-code');
        const aspectDemoSub = container.querySelector('#aspect-demo-sub');

        if (aspectDemoBox && aspectBtns.length > 0) {
            aspectBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    const newAspect = target.dataset.aspect;
                    
                    // 替换类名触发 CSS 过渡
                    aspectDemoBox.classList.remove(currentAspect);
                    aspectDemoBox.classList.add(newAspect);
                    currentAspect = newAspect;

                    // 更新文字标识
                    aspectDemoCode.innerText = newAspect;
                    aspectDemoSub.innerText = target.querySelector('span:last-child').innerText;

                    // 按钮 UI 状态排他切换
                    aspectBtns.forEach(b => {
                        b.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-700', 'ring-2', 'ring-indigo-200');
                        b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                    });
                    
                    target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                    target.classList.add('border-indigo-500', 'bg-indigo-50', 'text-indigo-700', 'ring-2', 'ring-indigo-200');
                    updateCodeFeedback();
                });
            });
        }
        updateCodeFeedback();
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'w-*', desc: '布局：宽度设置 (w-1/2, w-full, w-screen...)' },
            { class: 'h-*', desc: '布局：高度设置 (h-24, h-screen, h-svh...)' },
            { class: 'size-*', desc: '布局：宽高正方形合并设置 (size-16...)' },
            { class: 'min-w-*', desc: '布局：最小宽度约束' },
            { class: 'max-w-*', desc: '布局：最大宽度约束 (max-w-7xl...)' },
            { class: 'aspect-video', desc: '布局：16/9 视频纵横比' },
            { class: 'aspect-square', desc: '布局：1/1 正方形纵横比' },
            { class: 'aspect-auto', desc: '布局：自适应纵横比' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'size' 
        }));
    }
}
