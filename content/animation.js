// 🚀 Jquan Optimized: Animation 动画组件文档 (animation.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class AnimationDoc {
    
    // 辅助器：渲染核心基础动画演示卡片
    static renderBasicBox(title, animClass, customHtml) {
        return `
        <div class="flex flex-col gap-3 group">
            <div class="w-full h-32 relative rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                <!-- 演示元素 -->
                ${customHtml}
            </div>
            <div class="flex flex-col items-start gap-1 px-1">
                <span class="block text-sm font-bold text-slate-700">${title}</span>
                <code class="text-[11px] font-mono text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">${animClass}</code>
            </div>
        </div>`;
    }

    // 辅助器：渲染 Jquan 原生加载器引擎专属卡片 (严格遵守规范，抛弃深色背景)
    static renderLoaderBox(title, animClass, shapeClass) {
        return `
        <div class="flex flex-col gap-3 group">
            <div class="w-full h-32 relative rounded-xl border border-primary/20 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:border-primary/40 transition-colors">
                <!-- 加载器实体 -->
                <div class="${shapeClass} ${animClass} relative z-10"></div>
                
                <div class="absolute bottom-2 text-[9px] text-primary/40 font-bold tracking-widest uppercase">Native Engine</div>
            </div>
            <div class="flex flex-col items-start gap-1 px-1">
                <span class="block text-sm font-bold text-slate-700">${title}</span>
                <code class="text-[11px] font-mono text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">${animClass}</code>
            </div>
        </div>`;
    }

    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>效果</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">动画 (Animation)</li>
            </ul>

            <!-- 模块 1：基础核心动画 (Core Animations) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-film-strip text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">核心基础动画</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code class="inline-code">animate-{name}</code> 为元素添加实用的 CSS 关键帧动画。这是构建微交互和加载状态的基石。
                    </p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        ${this.renderBasicBox(
                            '旋转 (Spin)', 
                            'animate-spin', 
                            `<i class="ph ph-spinner-gap text-4xl text-primary animate-spin"></i>`
                        )}
                        ${this.renderBasicBox(
                            '雷达/波纹 (Ping)', 
                            'animate-ping', 
                            `
                            <div class="relative flex h-6 w-6">
                                <!-- Ping 动画通常应用于背后的绝对定位元素作为扩散波纹 -->
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <!-- 前景的实体圆点 -->
                                <span class="relative inline-flex rounded-full h-6 w-6 bg-rose-500 border-2 border-white shadow-sm"></span>
                            </div>
                            `
                        )}
                        ${this.renderBasicBox(
                            '脉冲 (Pulse)', 
                            'animate-pulse', 
                            `
                            <!-- 骨架屏占位经典用法 -->
                            <div class="w-24 h-24 bg-slate-200 rounded-xl animate-pulse flex flex-col justify-between p-3">
                                <div class="w-1/2 h-3 bg-slate-300 rounded-full"></div>
                                <div class="w-full h-3 bg-slate-300 rounded-full"></div>
                                <div class="w-3/4 h-3 bg-slate-300 rounded-full"></div>
                            </div>
                            `
                        )}
                        ${this.renderBasicBox(
                            '弹跳 (Bounce)', 
                            'animate-bounce', 
                            `
                            <div class="w-12 h-12 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 animate-bounce flex items-center justify-center text-white">
                                <i class="ph ph-arrow-down font-bold"></i>
                            </div>
                            `
                        )}
                    </div>
                </div>
            </div>

            <!-- 模块 2：🚀 Jquan 独家原生加载器引擎 (严格采用 primary/5 主题规范) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden relative">
                <div class="px-6 py-5 border-b border-primary/10 flex items-center justify-between bg-white/50">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-cpu text-primary text-lg"></i>
                        <h3 class="font-bold text-slate-800">原生加载引擎 (Native Loaders)</h3>
                    </div>
                    <span class="text-[10px] font-bold text-primary bg-white px-2 py-1 rounded border border-primary/20 shadow-sm">Engine Built-in</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm mb-6">
                        纯正的底层字典级支持！无需外部引入，引擎原生熔铸了四大经典加载形态，直接挂载类名即可实现高性能动画渲染。
                    </p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <!-- Wave 适合条状 -->
                        ${this.renderLoaderBox('音频波 (Wave)', 'animate-wave', 'w-3 h-12 bg-sky-500 rounded-full')}
                        
                        <!-- Slide 适合滑块条 -->
                        ${this.renderLoaderBox('滑轨 (Slide)', 'animate-slide', 'w-1/3 h-1.5 bg-emerald-500 rounded-full absolute left-0')}
                        
                        <!-- Fill 适合容器填充 (注：底层是 scaleY，配合 origin-bottom 使用最佳) -->
                        ${this.renderLoaderBox('注水 (Fill)', 'animate-fill origin-bottom', 'w-8 h-12 bg-amber-500 rounded-sm')}
                        
                        <!-- Morph 适合方块变圆阵列 -->
                        ${this.renderLoaderBox('形变 (Morph)', 'animate-morph', 'w-10 h-10 bg-rose-500')}
                    </div>
                </div>
            </div>

            <!-- 模块 3：动画全量控制器 (完全暴露引擎的底层修饰符) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-sliders text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">全量动画修饰符</cite>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-10">
                    
                    <!-- 控制播放状态 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <i class="ph-fill ph-play-pause text-slate-400"></i>
                                播放状态 (Play State)
                            </h4>
                            <p class="text-sm text-slate-500 mb-4">使用引擎的 <code class="inline-code">animation-paused</code> 或 <code class="inline-code">animation-running</code> 介入动画状态，常与伪类组合使用。</p>
                            <div class="rounded-lg overflow-hidden">
                                <pre class="!m-0 !rounded-none"><code class="language-html">&lt;!-- 鼠标移入齿轮，立即暂停旋转 --&gt;
&lt;i class="animate-spin hover:animation-paused"&gt;&lt;/i&gt;</code></pre>
                            </div>
                        </div>
                        <div class="flex justify-center">
                            <div class="group flex items-center justify-center w-40 h-32 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer relative overflow-hidden">
                                <i class="ph ph-gear text-5xl text-slate-400 animate-spin group-hover:animation-paused transition-colors group-hover:text-primary"></i>
                                <div class="absolute bottom-2 text-[10px] text-slate-400 font-medium tracking-wider uppercase">Hover Me</div>
                            </div>
                        </div>
                    </div>

                    <hr class="border-slate-100">

                    <!-- 控制方向 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <i class="ph-fill ph-arrows-left-right text-slate-400"></i>
                                动画方向 (Direction)
                            </h4>
                            <p class="text-sm text-slate-500 mb-4">通过 <code class="inline-code">animation-dir-reverse</code> 强行反转关键帧，或 <code class="inline-code">animation-dir-alternate</code> 往复播放。</p>
                            <div class="rounded-lg overflow-hidden">
                                <pre class="!m-0 !rounded-none"><code class="language-html">&lt;!-- 咬合效果：主齿轮顺时针，副齿轮逆时针 --&gt;
&lt;i class="animate-spin"&gt;&lt;/i&gt;
&lt;i class="animate-spin animation-dir-reverse"&gt;&lt;/i&gt;</code></pre>
                            </div>
                        </div>
                        <div class="flex justify-center">
                            <div class="flex items-center justify-center w-40 h-32 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
                                <i class="ph ph-gear text-4xl text-slate-700 animate-spin absolute -ml-5 -mt-5"></i>
                                <i class="ph ph-gear text-4xl text-primary animate-spin animation-dir-reverse absolute ml-4 mt-4"></i>
                            </div>
                        </div>
                    </div>

                    <hr class="border-slate-100">

                    <!-- 循环与填充模式 (展现引擎进阶能力) -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <i class="ph-fill ph-arrows-clockwise text-slate-400"></i>
                                循环与驻留 (Iteration & Fill Mode)
                            </h4>
                            <p class="text-sm text-slate-500 mb-4">默认动画是无限循环（infinite）。利用引擎的 <code class="inline-code">animation-iterate-once</code> 限制次数，用 <code class="inline-code">animation-fill-forwards</code> 让动画停留在最后一帧。</p>
                            <div class="rounded-lg overflow-hidden">
                                <pre class="!m-0 !rounded-none"><code class="language-html">&lt;!-- 箭头掉落一次后，永久停留在底部 --&gt;
&lt;i class="animate-bounce animation-iterate-once animation-fill-forwards"&gt;&lt;/i&gt;</code></pre>
                            </div>
                        </div>
                        <div class="flex justify-center group cursor-pointer">
                            <div class="flex items-center justify-center w-40 h-32 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
                                <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:animate-bounce group-hover:animation-iterate-once group-hover:animation-fill-forwards transform -translate-y-4">
                                    <i class="ph ph-arrow-down font-bold"></i>
                                </div>
                                <div class="absolute bottom-2 text-[10px] text-slate-400 font-medium tracking-wider uppercase opacity-50">Hover to Drop</div>
                            </div>
                        </div>
                    </div>

                    <hr class="border-slate-100">

                    <!-- 强制覆写时间与延迟 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <i class="ph-fill ph-clock text-slate-400"></i>
                                时间与延迟 (Duration & Delay)
                            </h4>
                            <p class="text-sm text-slate-500 mb-4">使用引擎的字典直接干预时间缩放。<code class="inline-code">animation-duration-300</code> 加速，或用 <code class="inline-code">animation-delay-500</code> 错开起步。</p>
                            <div class="rounded-lg overflow-hidden border border-slate-200">
                                <pre class="!m-0 !rounded-none"><code class="language-html">&lt;!-- 同样是旋转，时间设定决定了转速 --&gt;
&lt;i class="animate-spin animation-duration-300"&gt;&lt;/i&gt;  &lt;!-- 快 --&gt;
&lt;i class="animate-spin animation-duration-1000"&gt;&lt;/i&gt; &lt;!-- 慢 --&gt;</code></pre>
                            </div>
                        </div>
                        <div class="flex justify-center">
                            <div class="flex items-center justify-center w-40 h-32 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden gap-6">
                                <div class="flex flex-col items-center gap-2">
                                    <i class="ph ph-spinner-gap text-3xl text-rose-500 animate-spin animation-duration-300"></i>
                                    <span class="text-[10px] font-mono text-slate-400">300ms</span>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <i class="ph ph-spinner-gap text-3xl text-sky-500 animate-spin animation-duration-1000"></i>
                                    <span class="text-[10px] font-mono text-slate-400">1000ms</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 实战代码块 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">组合实战：消息红点与骨架屏</cite>
                </div>
                <div class="p-6">
                    <pre><code class="language-html">
&lt;!-- 经典通知红点 (Ping + Absolute 叠加层) --&gt;
&lt;button class="relative bg-white p-2 rounded-lg border hover:bg-slate-50"&gt;
    &lt;i class="ph ph-bell text-xl"&gt;&lt;/i&gt;
    &lt;span class="absolute top-0 right-0 flex h-3 w-3 -mt-1 -mr-1"&gt;
        &lt;span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"&gt;&lt;/span&gt;
        &lt;span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"&gt;&lt;/span&gt;
    &lt;/span&gt;
&lt;/button&gt;

&lt;!-- 数据加载骨架屏 (Pulse 占位阵列) --&gt;
&lt;div class="border border-slate-200 rounded-lg p-4 max-w-sm w-full mx-auto"&gt;
    &lt;div class="animate-pulse flex space-x-4"&gt;
        &lt;div class="rounded-full bg-slate-200 h-10 w-10"&gt;&lt;/div&gt;
        &lt;div class="flex-1 space-y-6 py-1"&gt;
            &lt;div class="h-2 bg-slate-200 rounded"&gt;&lt;/div&gt;
            &lt;div class="space-y-3"&gt;
                &lt;div class="grid grid-cols-3 gap-4"&gt;
                    &lt;div class="h-2 bg-slate-200 rounded col-span-2"&gt;&lt;/div&gt;
                    &lt;div class="h-2 bg-slate-200 rounded col-span-1"&gt;&lt;/div&gt;
                &lt;/div&gt;
                &lt;div class="h-2 bg-slate-200 rounded"&gt;&lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：初始化插件
    // ==========================================
    static mount(container) {
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'animate-none', desc: '移除所有关键帧动画' },
            { class: 'animate-spin', desc: '线性旋转动画，常用于加载 Spinner' },
            { class: 'animate-ping', desc: '扩散波纹动画，常用于雷达、通知红点' },
            { class: 'animate-pulse', desc: '透明度脉冲动画，常用于骨架屏加载' },
            { class: 'animate-bounce', desc: '上下弹跳动画，常用于指示箭头' },
            { class: 'animate-wave', desc: 'Jquan 专属加载器：波浪形变动画' },
            { class: 'animate-slide', desc: 'Jquan 专属加载器：穿梭滑动动画' },
            { class: 'animate-fill', desc: 'Jquan 专属加载器：注水填充动画' },
            { class: 'animate-morph', desc: 'Jquan 专属加载器：形态融合动画' },
            { class: 'animation-duration-{time}', desc: '强制覆盖动画时间 (如 animation-duration-300)' },
            { class: 'animation-delay-{time}', desc: '控制动画起步延迟' },
            { class: 'animation-paused', desc: '设置播放状态为暂停' },
            { class: 'animation-running', desc: '设置播放状态为运行' },
            { class: 'animation-dir-reverse', desc: '逆向播放动画' },
            { class: 'animation-dir-alternate', desc: '正反交替播放动画' },
            { class: 'animation-iterate-once', desc: '限制动画只播放 1 次' },
            { class: 'animation-iterate-twice', desc: '限制动画播放 2 次' },
            { class: 'animation-fill-forwards', desc: '动画结束后驻留在最后一帧' },
            { class: 'animation-fill-both', desc: '动画应用首帧和末帧状态' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'animation'
        }));
    }
}