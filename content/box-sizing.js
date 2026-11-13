// 🚀 Jquan Optimized: Box Sizing 盒模型组件文档 (box-sizing.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class BoxSizingDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">盒模型 (Box Sizing)</li>
            </ul>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">盒模型 (Box Sizing)</h1>
                <p class="text-slate-600 leading-relaxed max-w-3xl">
                    控制浏览器如何计算元素的总大小。<strong class="text-slate-800">边框盒 (Border Box)</strong> 将内边距和边框计算在指定的宽高之内；<strong class="text-slate-800">内容盒 (Content Box)</strong> 则是将它们附加在指定的宽高之外。
                </p>
            </div>

            <!-- 模块 1：核心概念可视化矩阵 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-package text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">盒模型行为对比</cite>
                    </div>
                </div>
                <div class="p-6 md:p-10">
                    <p class="text-slate-500 text-sm mb-12 text-center">
                        下方的两个示例中，我们都给元素设定了 <code class="inline-code">w-48 h-32</code> (12rem x 8rem)，以及 <code class="inline-code">p-6 border-8</code>。<br>观察它们在 <span class="border-b border-dashed border-slate-400">灰色虚线参考线（代表 w-48 h-32 的绝对空间）</span> 下的不同表现。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8">
                        
                        <!-- 1. Border Box 演示 -->
                        <div class="flex flex-col items-center group">
                            <div class="mb-6 flex flex-col items-center gap-2">
                                <code class="text-sm font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">box-border</code>
                                <span class="text-slate-700 font-medium">边框盒 (现代默认)</span>
                            </div>
                            
                            <!-- 虚线参考框 -->
                            <div class="relative w-48 h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
                                <div class="absolute -top-6 text-xs font-bold text-slate-400 uppercase tracking-widest">12rem x 8rem</div>
                                
                                <!-- 真实元素: box-border -->
                                <div class="box-border w-48 h-32 p-6 border-8 border-emerald-400 bg-emerald-100 absolute inset-auto shadow-sm transition-transform duration-500 group-hover:scale-105">
                                    <div class="w-full h-full bg-emerald-300 border border-emerald-400 flex items-center justify-center text-emerald-800 text-xs font-bold shadow-inner">
                                        Content Area
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-8 text-xs text-slate-500 text-center max-w-[200px] leading-relaxed">
                                内边距 (Padding) 和边框 (Border) 往<strong>内</strong>挤压内容区。<br>
                                最终真实体积 = <strong class="text-slate-800">严格遵守设定值</strong>。
                            </div>
                        </div>

                        <!-- 2. Content Box 演示 -->
                        <div class="flex flex-col items-center group">
                            <div class="mb-6 flex flex-col items-center gap-2">
                                <code class="text-sm font-mono text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-100">box-content</code>
                                <span class="text-slate-700 font-medium">内容盒 (传统标准)</span>
                            </div>
                            
                            <!-- 虚线参考框 -->
                            <div class="relative w-48 h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
                                <div class="absolute -top-6 text-xs font-bold text-slate-400 uppercase tracking-widest">12rem x 8rem</div>
                                
                                <!-- 真实元素: box-content. 
                                     由于是 content-box, width/height 只管内容，
                                     所以实际尺寸会向外膨胀 (w-48 + px-6*2 + border-8*2) -->
                                <div class="box-content w-48 h-32 p-6 border-8 border-amber-400 bg-amber-100 absolute shadow-sm transition-transform duration-500 group-hover:scale-105">
                                    <div class="w-full h-full bg-amber-300 border border-amber-400 flex items-center justify-center text-amber-800 text-xs font-bold shadow-inner">
                                        Content Area
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-20 text-xs text-slate-500 text-center max-w-[240px] leading-relaxed">
                                内边距 (Padding) 和边框 (Border) 往<strong>外</strong>扩张膨胀。<br>
                                最终真实体积 = <strong class="text-slate-800">设定值 + Padding + Border</strong>。
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：Jquan 排版进阶 (原理深度剖析) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-white/50 border-b border-primary/20 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-lightbulb text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">Jquan 架构师视角：为什么你需要了解它？</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="text-slate-600 text-sm leading-relaxed space-y-4 max-w-4xl">
                        <p>
                            在 JquanUI (以及现代 Web 开发) 的全局 Preflight 初始化阶段，我们已经注入了 <code class="text-primary bg-white border border-primary/20 px-1 py-0.5 rounded font-mono">* { box-sizing: border-box; }</code>。这意味着你编写的 <code class="text-primary bg-white border border-primary/20 px-1 py-0.5 rounded font-mono">w-1/2</code> 就是严格的一半，即使加上 <code class="text-primary bg-white border border-primary/20 px-1 py-0.5 rounded font-mono">p-4 border</code> 也不会撑爆父容器。
                        </p>
                        <p>
                            <strong class="text-slate-800">那为什么还要提供 <code class="text-amber-600 bg-white border border-amber-200 px-1 py-0.5 rounded font-mono">box-content</code>？</strong>
                        </p>
                        <ul class="list-disc list-outside pl-5 space-y-2 text-slate-600">
                            <li><strong class="text-slate-800">特殊组件集成：</strong> 某些古老的第三方日历、图表库或者富文本编辑器，其内部 CSS 强依赖 content-box，直接接入会样式错乱，使用它可以为其隔离上下文环境。</li>
                            <li><strong class="text-slate-800">Canvas 与 Video 适配：</strong> 在计算严格像素映射的游戏画布或特定视频比例容器时，有时需要将其恢复为 content-box 从而剥离内边距对画布计算逻辑的干扰。</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 模块 3：最佳实践代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">在实战中使用</cite>
                </div>
                <div class="p-6">
                    <pre><code class="language-html">
&lt;!-- 现代开发的日常 (默认隐式生效，也可显式声明 box-border) --&gt;
&lt;div class="box-border h-32 w-32 p-4 border-4 bg-slate-100"&gt;
    这个盒子在屏幕上占据的真实空间，永远是严格的 8rem x 8rem (128px)。
&lt;/div&gt;

&lt;!-- 集成第三方图表库时的安全隔离策略 --&gt;
&lt;div class="box-content w-full overflow-hidden"&gt;
    &lt;!-- 这里面的图表组件如果强依赖传统盒模型，就不会崩溃了 --&gt;
    &lt;div id="legacy-chart-container"&gt;&lt;/div&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        // 渲染页面后，初始化代码块高亮与复制功能
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'box-border', desc: '边框盒模型 (设定体积包含 border/padding) - 现代默认' },
            { class: 'box-content', desc: '内容盒模型 (设定体积不含 border/padding，向外膨胀)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'box-sizing'
        }));
    }
}