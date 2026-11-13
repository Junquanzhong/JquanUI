// 🚀 Jquan Optimized: 特色组件与物理引擎文档 (components-physics.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ComponentsPhysicsDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-cube"></i>UI 模块</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">内置物理引擎与组件</li>
            </ul>

            <!-- 模块 1：三层阴影光环物理引擎 (Ring & Shadow Physics) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-intersect text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">光环与阴影物理重组引擎 (Physics Engine)</cite>
                    </div>
                    <span class="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded shadow-sm">Box-Shadow Compositor</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        在原生 CSS 中，如果你对一个元素同时设置了 <code class="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded border border-slate-200">box-shadow</code>（用于投影）和另一个 <code class="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded border border-slate-200">box-shadow</code>（用于描边光环），后写的值会无情地覆盖掉前者。<br/>
                        JquanUI 在全局预检层（Preflight）注入了极其巧妙的 <strong>CSS 变量三层叠算引擎</strong>。它将偏移层（Offset）、光环层（Ring）、投影层（Shadow）物理隔离，最终合成输出。<strong>点击下方开关，体验物理引擎的完美层叠叠加！</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制面板 -->
                        <div class="flex flex-col space-y-6 justify-center">
                            
                            <div class="space-y-3">
                                <label class="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                            <i class="ph ph-drop-shadow text-xl"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-slate-800">环境投影 (Shadow)</div>
                                            <code class="text-xs text-slate-400 font-mono">shadow-xl shadow-primary/30</code>
                                        </div>
                                    </div>
                                    <input type="checkbox" id="toggle-shadow" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" checked>
                                </label>

                                <label class="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                            <i class="ph ph-circle text-xl"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-slate-800">焦点光环 (Ring)</div>
                                            <code class="text-xs text-slate-400 font-mono">ring-4 ring-primary/80</code>
                                        </div>
                                    </div>
                                    <input type="checkbox" id="toggle-ring" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" checked>
                                </label>

                                <label class="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                            <i class="ph ph-arrows-out text-xl"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-slate-800">光环偏移层 (Ring Offset)</div>
                                            <code class="text-xs text-slate-400 font-mono">ring-offset-4 ring-offset-slate-900</code>
                                        </div>
                                    </div>
                                    <input type="checkbox" id="toggle-offset" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" checked>
                                </label>
                            </div>
                        </div>

                        <!-- 右侧：物理渲染实验室 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-flask"></i> 复合渲染测试
                            </label>
                            <div class="flex-1 rounded-xl overflow-hidden bg-slate-900 p-8 flex items-center justify-center min-h-[300px] border border-slate-200 relative isolate">
                                
                                <!-- 环境光装饰 -->
                                <div class="absolute inset-0 bg-slate-800 opacity-50 z-0"></div>

                                <!-- 🚀 被引擎接管物理计算的核心靶点 -->
                                <button id="physics-target" class="z-10 bg-slate-800 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-xl shadow-primary/30 ring-4 ring-primary/80 ring-offset-4 ring-offset-slate-900 hover:scale-105 active:scale-95 outline-none">
                                    Click Me !
                                </button>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：原生加载器 (Native Loaders) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-spinner-gap text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">原生加载器阵列 (Native Loaders)</cite>
                    </div>
                    <span class="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded shadow-sm">GPU Accelerated</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
                        不要再为了一个加载条去引入整个第三方 CSS 库了！<br/>
                        JquanUI 核心预置了 8 种最高频使用的 GPU 加速动画。只需要在类名里加上 <code class="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded border border-primary/20">animate-*</code>，剩下的交给硬件加速引擎。你还可以通过 <code>animation-duration-*</code>、<code>animation-delay-*</code> 和 <code>animation-ease-*</code> 精细控制节奏。
                    </p>
                    
                    <!-- 加载器展示网格 -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        
                        <!-- 1. Wave -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <div class="flex gap-1 h-8 items-center">
                                <div class="w-1.5 h-full bg-primary rounded-full animate-wave animation-delay-0"></div>
                                <div class="w-1.5 h-full bg-primary rounded-full animate-wave animation-delay-150"></div>
                                <div class="w-1.5 h-full bg-primary rounded-full animate-wave animation-delay-300"></div>
                                <div class="w-1.5 h-full bg-primary rounded-full animate-wave animation-delay-500"></div>
                            </div>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-wave</code>
                        </div>

                        <!-- 2. Slide -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group overflow-hidden">
                            <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div class="w-1/2 h-full bg-primary rounded-full animate-slide"></div>
                            </div>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-slide</code>
                        </div>

                        <!-- 3. Morph -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <div class="w-8 h-8 bg-primary animate-morph shadow-lg shadow-primary/30"></div>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-morph</code>
                        </div>

                        <!-- 4. Fill -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <div class="w-8 h-8 border-2 border-slate-200 rounded-lg overflow-hidden relative flex items-end">
                                <div class="w-full bg-primary animate-fill origin-bottom"></div>
                            </div>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-fill</code>
                        </div>

                        <!-- 5. Spin -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <i class="ph ph-spinner-gap text-3xl text-primary animate-spin"></i>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-spin</code>
                        </div>

                        <!-- 6. Ping -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <div class="relative flex h-4 w-4">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                            </div>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-ping</code>
                        </div>

                        <!-- 7. Pulse -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <div class="w-8 h-8 rounded-full bg-primary animate-pulse"></div>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-pulse</code>
                        </div>

                        <!-- 8. Bounce -->
                        <div class="border border-slate-100 bg-white hover:border-primary/30 rounded-xl p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-6 group">
                            <i class="ph ph-arrow-down text-3xl text-primary animate-bounce"></i>
                            <code class="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:text-primary transition-colors">animate-bounce</code>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 底层物理代码预览 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
                <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2"><i class="ph ph-code text-primary text-xl"></i> 源码调用示例 (Usage)</h3>
                
                <div class="relative rounded-lg shadow-inner overflow-hidden border border-slate-200">
                    <pre><code class="language-html text-xs leading-relaxed">
&lt;!-- 物理引擎完美层叠（无需按顺序编写，引擎自动拼装底层属性） --&gt;
&lt;button class="shadow-xl shadow-blue-500/50 ring-4 ring-blue-500 ring-offset-2 ring-offset-white"&gt;
    Physics Button
&lt;/button&gt;

&lt;!-- 动态控制原生加载器的速度与填充模式 --&gt;
&lt;div class="animate-morph animation-duration-500 animation-ease-in-out"&gt;&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：物理重组引擎测试台交互
    // ==========================================
    static mount(container) {

        // 1. 初始化极致代码块高亮 (绝对定位防截断)
        initCodeHighlighter({ 
            showLineNumbers: true, 
            langLabel: true,
            containerClass: 'relative group font-mono text-sm flex flex-col rounded-lg overflow-hidden bg-slate-50',
            scrollWrapperClass: 'overflow-auto flex-1'
        });

        // 2. 物理光环与阴影实验室交互绑定
        const cbShadow = container.querySelector('#toggle-shadow');
        const cbRing = container.querySelector('#toggle-ring');
        const cbOffset = container.querySelector('#toggle-offset');
        const targetBtn = container.querySelector('#physics-target');

        const updatePhysicsTarget = () => {
            if (!targetBtn) return;

            // 基础类名保持不变
            let classes = ['z-10', 'bg-slate-800', 'text-white', 'font-bold', 'py-4', 'px-10', 'rounded-xl', 'transition-all', 'duration-300', 'hover:scale-105', 'active:scale-95', 'outline-none'];

            // 物理层叠组合判定
            if (cbShadow && cbShadow.checked) {
                classes.push('shadow-xl', 'shadow-primary/30');
            }
            if (cbRing && cbRing.checked) {
                classes.push('ring-4', 'ring-primary/80');
            }
            if (cbOffset && cbOffset.checked) {
                classes.push('ring-offset-4', 'ring-offset-slate-900');
            }

            // 更新 DOM，触发 JIT 编译
            targetBtn.className = classes.join(' ');
        };

        if (cbShadow) cbShadow.addEventListener('change', updatePhysicsTarget);
        if (cbRing) cbRing.addEventListener('change', updatePhysicsTarget);
        if (cbOffset) cbOffset.addEventListener('change', updatePhysicsTarget);
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'animate-wave, animate-slide', desc: 'GPU 原生平移与波浪加载器' },
            { class: 'animate-morph, animate-fill', desc: 'GPU 原生形变与填充加载器' },
            { class: 'animate-spin, ping, pulse', desc: '传统动画效果' },
            { class: 'ring, ring-offset', desc: '物理焦点光环与光环偏移层级' },
            { class: 'shadow, shadow-color', desc: '阴影环境配置层级' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'components-physics'
        }));
    }
}
