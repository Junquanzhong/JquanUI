// 🚀 Jquan Optimized: Layout Container 响应式容器与查询文档 (container.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutContainerDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">容器与断点 (Container & Queries)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">响应式断点与容器查询</h1>
                <p class="text-slate-600 max-w-4xl leading-relaxed">
                    JquanUI 拥有面向未来的响应式系统。不仅提供基于视口 (Viewport) 的经典 <code class="inline-code">.container</code> 居中束缚，更引入了下一代 CSS 特性 —— <strong>容器查询 (Container Queries)</strong>，让你的组件真正实现无视外部环境的“自治响应式”。
                </p>
            </div>

            <!-- 🧪 实验室 1：视口断点探针 (经典) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-arrows-out-line-horizontal text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">视口断点探针 Playground (Viewport)</cite>
                    </div>
                    <span class="text-xs bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-500 hidden sm:inline-flex items-center gap-1 shadow-sm">
                        <i class="ph ph-info"></i> 拖动右侧边缘改变宽度
                    </span>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="bg-slate-100 p-4 rounded-xl border border-slate-200">
                        <div id="demo-resizer" class="relative resize-x overflow-hidden min-w-[280px] max-w-full h-48 bg-white border-2 border-primary/30 rounded-lg shadow-sm flex flex-col items-center justify-center transition-colors pb-4">
                            
                            <div class="absolute top-3 left-3 flex gap-2">
                                <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200" id="live-width">Width: ...</span>
                            </div>

                            <div class="flex flex-col items-center mt-2">
                                <span class="text-sm text-slate-400 font-medium tracking-widest uppercase mb-1">当前激活媒体断点 (@media)</span>
                                <div id="live-breakpoint" class="text-5xl font-black text-primary drop-shadow-sm transition-all duration-300">
                                    BASE
                                </div>
                            </div>

                            <svg class="absolute bottom-1.5 right-1.5 w-4 h-4 text-primary/40 pointer-events-none" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 14L14 10M5 14L14 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🚀 实验室 2：架构师视角 - 容器查询 (未来科技) -->
            <div class="mb-8 bg-indigo-50/50 border border-indigo-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/70 border-b border-indigo-100 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-xl text-indigo-600 animate-pulse"></i>
                        <cite class="font-bold text-slate-800 not-italic">容器查询实验室 (Container Queries)</cite>
                        <span class="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold tracking-wider uppercase">组件化核心技术</span>
                    </div>
                </div>
                
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm mb-6 leading-relaxed">
                        当你在父元素上添加 <code class="inline-code">container-type-inline-size</code> 时，它就成了一个独立的查询参照物。此时，内部元素不再关心整个浏览器屏幕有多宽，只关心<strong>这个父容器有多宽</strong>。请拖动下方虚线框来验证卡片的自我变形能力：
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        <!-- 交互拖拽区 -->
                        <div>
                            <!-- 定义父级为容器查询节点 -->
                            <div class="relative resize-x overflow-hidden w-full max-w-full min-w-[200px] h-64 bg-slate-50 border-2 border-dashed border-indigo-300 rounded-xl p-4 flex flex-col justify-center container-type-inline-size container-name-demo">
                                <div class="absolute top-2 left-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-mono rounded shadow-sm">container-type-inline-size</div>
                                
                                <!-- 自治响应式卡片 (不受 @media 影响，只受 @container 影响) -->
                                <div class="mt-6 bg-white rounded-xl shadow-md overflow-hidden flex flex-col @sm/demo:flex-row @sm/demo:items-center transition-all duration-300 h-full max-h-[160px] border border-slate-100">
                                    <div class="w-full h-32 @sm/demo:w-36 @sm/demo:h-full @sm/demo:shrink-0 bg-indigo-500 relative transition-all duration-300">
                                        <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" alt="demo">
                                    </div>
                                    <div class="p-4 @sm/demo:pl-5 flex-1 flex flex-col justify-center transition-all duration-300">
                                        <h4 class="font-bold text-slate-800 text-sm mb-1">自治响应式组件</h4>
                                        <p class="text-xs text-slate-500">容器变宽我就横排，变窄我就竖排。</p>
                                    </div>
                                </div>

                                <svg class="absolute bottom-2 right-2 w-4 h-4 text-indigo-400 pointer-events-none" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 14L14 10M5 14L14 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </div>
                        </div>

                        <!-- 解释说明区 -->
                        <div class="flex flex-col justify-center">
                            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                                <i class="ph ph-code text-indigo-500"></i> 代码实现逻辑
                            </h3>
                            <div class="rounded-lg overflow-hidden">
                                <pre><code class="language-html">
&lt;!-- 1. 父元素声明容器类型 --&gt;
&lt;div class="container-type-inline-size w-full"&gt;
    
    &lt;!-- 2. 子元素使用容器变体，自动生成 @container 查询 --&gt;
    &lt;div class="@sm/demo:flex-row @sm/demo:items-center"&gt;...&lt;/div&gt;

&lt;/div&gt;

&lt;!-- 3. 重复阈值可配置到 theme.extend.containers.demo --&gt;
                                </code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="grid grid-cols-1 gap-6">
                
                <!-- 容器查询属性字典 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                        <i class="ph ph-cube-focus text-slate-400 text-lg"></i>    
                        <cite class="font-bold text-slate-800 not-italic">容器查询 API (Container Queries)</cite>    
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th class="px-6 py-3 font-medium tracking-wide w-1/3">工具类 (Class)</th>
                                    <th class="px-6 py-3 font-medium tracking-wide">CSS 属性映射</th>
                                    <th class="px-6 py-3 font-medium text-slate-400">使用场景描述</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700 bg-white">
                                <tr class="hover:bg-indigo-50/50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-indigo-600">container-type-inline-size</td>
                                    <td class="px-6 py-4 font-mono text-xs text-slate-500">container-type: inline-size;</td>
                                    <td class="px-6 py-4 text-xs text-slate-600"><strong>最常用。</strong>告诉浏览器：请监听我的水平宽度变化。子元素可以通过 <code class="inline-code">@container (min-width: ...)</code> 进行响应。</td>
                                </tr>
                                <tr class="hover:bg-indigo-50/50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-slate-600">container-type-size</td>
                                    <td class="px-6 py-4 font-mono text-xs text-slate-500">container-type: size;</td>
                                    <td class="px-6 py-4 text-xs text-slate-600">同时监听宽度和高度变化。通常用于极其复杂的全维响应式布局。</td>
                                </tr>
                                <tr class="hover:bg-indigo-50/50 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-slate-600">container-type-normal</td>
                                    <td class="px-6 py-4 font-mono text-xs text-slate-500">container-type: normal;</td>
                                    <td class="px-6 py-4 text-xs text-slate-600">默认值。取消容器查询监听，将其重置为普通的 DOM 节点。</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 经典断点映射 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                        <i class="ph ph-desktop text-slate-400 text-lg"></i>    
                        <cite class="font-bold text-slate-800 not-italic">经典视口断点 (Viewport Breakpoints)</cite>    
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th class="px-6 py-3 font-medium tracking-wide">标识 (Prefix)</th>
                                    <th class="px-6 py-3 font-medium tracking-wide">屏幕断点 (@media)</th>
                                    <th class="px-6 py-3 font-medium tracking-wide">Container CSS 属性</th>
                                    <th class="px-6 py-3 font-medium text-slate-400">适用设备参考</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700 bg-white" id="breakpoint-table">
                                <tr class="hover:bg-primary/5 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-slate-500">默认 (base)</td>
                                    <td class="px-6 py-4 font-mono text-xs text-slate-500">width &lt; 640px</td>
                                    <td class="px-6 py-4"><span class="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs font-mono">width: 100%;</span></td>
                                    <td class="px-6 py-4 text-xs text-slate-400">手机竖屏</td>
                                </tr>
                                <tr class="hover:bg-primary/5 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">sm</td>
                                    <td class="px-6 py-4 font-mono text-xs">min-width: 640px</td>
                                    <td class="px-6 py-4"><span class="bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">max-width: 540px;</span></td>
                                    <td class="px-6 py-4 text-xs text-slate-400">大屏手机 / 平板竖屏</td>
                                </tr>
                                <tr class="hover:bg-primary/5 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">md</td>
                                    <td class="px-6 py-4 font-mono text-xs">min-width: 768px</td>
                                    <td class="px-6 py-4"><span class="bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">max-width: 720px;</span></td>
                                    <td class="px-6 py-4 text-xs text-slate-400">平板横屏</td>
                                </tr>
                                <tr class="hover:bg-primary/5 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">lg</td>
                                    <td class="px-6 py-4 font-mono text-xs">min-width: 1024px</td>
                                    <td class="px-6 py-4"><span class="bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">max-width: 960px;</span></td>
                                    <td class="px-6 py-4 text-xs text-slate-400">老式桌面显示器 / 笔电</td>
                                </tr>
                                <tr class="hover:bg-primary/5 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">xl</td>
                                    <td class="px-6 py-4 font-mono text-xs">min-width: 1280px</td>
                                    <td class="px-6 py-4"><span class="bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">max-width: 1140px;</span></td>
                                    <td class="px-6 py-4 text-xs text-slate-400">现代桌面显示器 (1080p级)</td>
                                </tr>
                                <tr class="hover:bg-primary/5 transition-colors">
                                    <td class="px-6 py-4 font-mono font-bold text-primary">2xl</td>
                                    <td class="px-6 py-4 font-mono text-xs">min-width: 1536px</td>
                                    <td class="px-6 py-4"><span class="bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">max-width: 1320px;</span></td>
                                    <td class="px-6 py-4 text-xs text-slate-400">大型宽屏显示器</td>
                                </tr>
                                <tr class="hover:bg-amber-50 transition-colors bg-amber-50/30">
                                    <td class="px-6 py-4 font-mono font-bold text-amber-600 flex items-center gap-1">3xl <span class="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span></td>
                                    <td class="px-6 py-4 font-mono text-xs text-amber-800">min-width: 1920px</td>
                                    <td class="px-6 py-4"><span class="bg-amber-100 border border-amber-200 text-amber-700 px-2 py-1 rounded text-xs font-mono">max-width: 1600px;</span></td>
                                    <td class="px-6 py-4 text-xs text-amber-600">全高清大屏 / 数据看板</td>
                                </tr>
                                <tr class="hover:bg-amber-50 transition-colors bg-amber-50/30 border-b-0">
                                    <td class="px-6 py-4 font-mono font-bold text-amber-600 flex items-center gap-1">4xl <span class="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span></td>
                                    <td class="px-6 py-4 font-mono text-xs text-amber-800">min-width: 2560px</td>
                                    <td class="px-6 py-4"><span class="bg-amber-100 border border-amber-200 text-amber-700 px-2 py-1 rounded text-xs font-mono">max-width: 2400px;</span></td>
                                    <td class="px-6 py-4 text-xs text-amber-600">2K / 4K 巨型屏幕</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 全宽流体容器 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                        <i class="ph ph-waves text-primary text-lg"></i>    
                        <cite class="font-bold text-slate-800 not-italic">全宽流体容器 (container-fluid)</cite>
                    </div>
                    <div class="p-6">
                        <p class="text-sm text-slate-600 mb-4 leading-relaxed">
                            如果你希望布局无视断点的限制，始终横跨整个视口宽度（通常用于顶栏、底栏或全屏海报），请使用 <code class="inline-code">.container-fluid</code>。这等同于 100% 宽度，但保留了 JquanUI 底层的内外边距重置逻辑。
                        </p>
                        
                        <div class="rounded-lg overflow-hidden">
                            <pre><code class="language-html">
&lt;!-- 无论在任何断点，始终 100% 宽度 --&gt;
&lt;div class="container-fluid bg-primary"&gt;
    &lt;div class="container"&gt;
        我是居中的内容，但在全宽背景之内
    &lt;/div&gt;
&lt;/div&gt;
                            </code></pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        `;
    }

    static mount(container) {
        initCodeHighlighter({ showLineNumbers: true, langLabel: false });

        // --- 经典视口断点探针逻辑 ---
        const resizerBox = container.querySelector('#demo-resizer');
        const widthDisplay = container.querySelector('#live-width');
        const bpDisplay = container.querySelector('#live-breakpoint');

        if (resizerBox) {
            const breakpoints = [
                { bp: '4xl', min: 2560 },
                { bp: '3xl', min: 1920 },
                { bp: '2xl', min: 1536 },
                { bp: 'xl', min: 1280 },
                { bp: 'lg', min: 1024 },
                { bp: 'md', min: 768 },
                { bp: 'sm', min: 640 },
                { bp: 'BASE', min: 0 }
            ];

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const currentWidth = Math.round(entry.contentRect.width);
                    widthDisplay.innerText = `Width: ${currentWidth}px`;

                    const currentBp = breakpoints.find(b => currentWidth >= b.min);
                    
                    if (currentBp) {
                        if (bpDisplay.innerText !== currentBp.bp) {
                            bpDisplay.innerText = currentBp.bp;
                            bpDisplay.classList.remove('scale-110');
                            // 触发重绘以运行动画
                            void bpDisplay.offsetWidth; 
                            bpDisplay.classList.add('scale-110');
                            
                            if(currentBp.bp.includes('xl') && currentWidth >= 1920) {
                                bpDisplay.classList.add('text-amber-500');
                                bpDisplay.classList.remove('text-primary');
                            } else {
                                bpDisplay.classList.remove('text-amber-500');
                                bpDisplay.classList.add('text-primary');
                            }
                        }
                    }
                }
            });

            resizeObserver.observe(resizerBox);
        }
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'container', desc: '布局：响应式居中容器，限制各断点下的最大宽度' },
            { class: 'container-fluid', desc: '布局：全宽流体容器，始终填满视口 (100% width)' },
            { class: 'sm / md / lg / xl', desc: '布局：基础屏幕断点 (640px ~ 1280px)' },
            { class: '2xl / 3xl / 4xl', desc: '布局：超大屏幕断点，适配巨幕与数据看版' },
            { class: 'container-type-inline-size', desc: '架构：将元素定义为容器查询节点 (依据宽度)' },
            { class: 'container-type-size', desc: '架构：将元素定义为容器查询节点 (宽高结合)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'container' 
        }));
    }
}
