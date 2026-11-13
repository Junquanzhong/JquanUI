// 🚀 Jquan Optimized: Transition 过渡动画组件文档 (transition.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class TransitionDoc {
    // 辅助器：渲染基础过渡属性演示方块
    static renderPropertyBox(title, transitionClass, hoverEffects, baseClass, icon) {
        return `
        <div class="flex flex-col gap-3 group cursor-pointer">
            <div class="w-full h-32 relative rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                <!-- 演示元素：显式加上 transform 和 shadow-sm 以激活 Jquan 的物理基准态 -->
                <div class="${baseClass} ${transitionClass} ${hoverEffects} transform shadow-sm duration-500 w-16 h-16 rounded-xl flex items-center justify-center text-white relative z-10">
                    <i class="ph ${icon} text-2xl"></i>
                </div>
                <div class="absolute bottom-2 text-[10px] text-slate-400 font-medium tracking-wider uppercase opacity-50 group-hover:opacity-100 transition-opacity">Hover Me</div>
            </div>
            <div class="flex flex-col items-start gap-1 px-1">
                <span class="block text-sm font-bold text-slate-700">${title}</span>
                <code class="text-[11px] font-mono text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">${transitionClass}</code>
            </div>
        </div>`;
    }

        // 辅助器：渲染赛道（用于比较 duration 和 ease）
    static renderTrack(label, classes, color = 'bg-primary') {
        return `
        <div class="flex items-center gap-4">
            <div class="w-28 shrink-0 text-right">
                <code class="text-xs text-slate-500 font-mono">${label}</code>
            </div>
            <!-- 赛道父级容器：相对定位 -->
            <div class="flex-1 h-10 bg-white/50 border border-slate-100 rounded-lg relative overflow-hidden flex items-center">
                <!-- 🚀 Jquan 纯血组合学 (Zero-JIT)：弃用 calc()，利用 left-full 结合 translateX 自我回推实现完美吸边！ -->
                <div class="absolute left-1 translate-x-0 transform w-8 h-8 rounded-md ${color} shadow-sm ${classes} group-hover:left-full group-hover:-translate-x-full group-hover:-ml-1 flex items-center justify-center text-white/90">
                    <i class="ph-fill ph-caret-double-right text-sm"></i>
                </div>
            </div>
        </div>`;
    }

    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>交互</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">过渡 (Transitions)</li>
            </ul>

            <!-- 模块 1：过渡属性 (Transition Properties) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-magic-wand text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">受控属性 (Transition Property)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code class="inline-code">transition-{property}</code> 精确控制哪些属性应该具有动画效果。良好的实践是仅对发生变化的属性应用过渡，以提升浏览器渲染性能。
                    </p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        ${this.renderPropertyBox(
                            '全属性过渡', 
                            'transition-all', 
                            'group-hover:bg-rose-500 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-lg group-hover:rounded-full', 
                            'bg-indigo-500', 
                            'ph-star'
                        )}
                        ${this.renderPropertyBox(
                            '仅颜色过渡', 
                            'transition-colors', 
                            'group-hover:bg-emerald-500 group-hover:text-emerald-50 group-hover:rotate-12', 
                            'bg-slate-800 text-slate-300', 
                            'ph-palette'
                        )}
                        ${this.renderPropertyBox(
                            '仅变换过渡', 
                            'transition-transform', 
                            'group-hover:-translate-y-4 group-hover:scale-110 group-hover:rotate-90 group-hover:bg-amber-500', // bg 会瞬间切换
                            'bg-amber-400', 
                            'ph-arrows-out-cardinal'
                        )}
                        ${this.renderPropertyBox(
                            '仅透明度过渡', 
                            'transition-opacity', 
                            'group-hover:opacity-20 group-hover:scale-75', // scale 会瞬间缩小
                            'bg-sky-500', 
                            'ph-ghost'
                        )}
                    </div>
                    <div class="mt-4 text-xs text-slate-400 italic">
                        * 最佳实践：如果你声明了受控属性 (如 transition-opacity)，那么其他维度的变化 (如颜色、缩放) 将被剥夺过渡曲线，瞬间触发。
                    </div>
                </div>
            </div>

            <!-- 模块 2：持续时间 (Duration) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden relative group cursor-crosshair">
                <div class="px-6 py-5 border-b border-primary/10 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-hourglass-high text-primary text-lg"></i>
                        <h3 class="font-bold text-slate-800">持续时间赛道 (Duration)</h3>
                    </div>
                    <span class="text-xs font-bold text-primary bg-white px-2 py-1 rounded-full border border-primary/20 shadow-sm animate-pulse">Hover to Race</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm mb-6">
                        使用 <code class="inline-code border-primary/20 bg-white">duration-{time}</code> 控制动画的快慢。在下面的赛道中，当你将鼠标移入此面板，所有方块将同时向右移动，但到达终点的时间各不相同。
                    </p>
                    
                    <div class="flex flex-col gap-3">
                        <!-- 注意：赛道使用 left 绝对定位位移，因此必须配上 transition-all 才能让 left 受到过渡接管 -->
                        ${this.renderTrack('duration-75', 'transition-all duration-75', 'bg-sky-400')}
                        ${this.renderTrack('duration-150', 'transition-all duration-150', 'bg-sky-500')}
                        ${this.renderTrack('duration-300', 'transition-all duration-300', 'bg-sky-600')}
                        ${this.renderTrack('duration-500', 'transition-all duration-500', 'bg-indigo-500')}
                        ${this.renderTrack('duration-700', 'transition-all duration-700', 'bg-indigo-600')}
                        ${this.renderTrack('duration-1000', 'transition-all duration-1000', 'bg-indigo-800')}
                    </div>
                </div>
            </div>

            <!-- 模块 3：缓动曲线 (Timing Function) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl overflow-hidden relative group cursor-crosshair">
                <div class="px-6 py-5 border-b border-primary/10 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-wave-sine text-primary text-lg"></i>
                        <h3 class="font-bold text-slate-800">缓动曲线赛道 (Easing)</h3>
                    </div>
                    <span class="text-xs font-bold text-primary bg-white px-2 py-1 rounded-full border border-primary/20 shadow-sm animate-pulse">Hover to Race</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm mb-6">
                        使用 <code class="inline-code border-primary/20 bg-white">ease-{timing}</code> 控制动画的速度变化率。在相同时间（1000ms）内，体验不同物理曲线带来的视觉差异。
                    </p>
                    
                    <div class="flex flex-col gap-3">
                        ${this.renderTrack('ease-linear', 'transition-all duration-1000 ease-linear', 'bg-emerald-500')}
                        <div class="text-[10px] text-slate-500 ml-24 -mt-2 mb-2">匀速运动，机械感强，常用于加载动画 (Loading)。</div>
                        
                        ${this.renderTrack('ease-in', 'transition-all duration-1000 ease-in', 'bg-amber-500')}
                        <div class="text-[10px] text-slate-500 ml-24 -mt-2 mb-2">慢启动，越来越快，适合表现重力下落或元素退出视口。</div>
                        
                        ${this.renderTrack('ease-out', 'transition-all duration-1000 ease-out', 'bg-rose-500')}
                        <div class="text-[10px] text-slate-500 ml-24 -mt-2 mb-2">快启动，逐渐减速，符合人类对摩擦力的认知，最适合 UI 元素的进入。</div>
                        
                        ${this.renderTrack('ease-in-out', 'transition-all duration-1000 ease-in-out', 'bg-primary')}
                        <div class="text-[10px] text-slate-500 ml-24 -mt-2">慢启动，加速后再减速，非常平滑，适合循环动画或页面级切换。</div>
                    </div>
                </div>
            </div>

            <!-- 模块 4：延迟与最佳实践 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">动画延迟与编排</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        通过配合使用 <code class="inline-code">delay-{time}</code>，你可以不写一行 JS 就完成复杂的级联动画（如列表项依次浮现）。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 优雅的卡片悬停交互：属性 + 时间 + 曲线组合 --&gt;
&lt;div class="transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary"&gt;
    卡片内容
&lt;/div&gt;

&lt;!-- 列表元素依次入场 (CSS 级联延迟编排) --&gt;
&lt;ul&gt;
    &lt;li class="transition-opacity duration-500 delay-100 opacity-0 hover:opacity-100"&gt;Item 1&lt;/li&gt;
    &lt;li class="transition-opacity duration-500 delay-200 opacity-0 hover:opacity-100"&gt;Item 2&lt;/li&gt;
    &lt;li class="transition-opacity duration-500 delay-300 opacity-0 hover:opacity-100"&gt;Item 3&lt;/li&gt;
&lt;/ul&gt;
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
            { class: 'transition-all', desc: '过渡所有支持的属性' },
            { class: 'transition', desc: '过渡色彩、背景、阴影和变换 (推荐默认值)' },
            { class: 'transition-colors', desc: '仅过渡颜色相关的属性' },
            { class: 'transition-opacity', desc: '仅过渡透明度' },
            { class: 'transition-transform', desc: '仅过渡平移、缩放、旋转等变换属性' },
            { class: 'duration-{time}', desc: '控制过渡的持续时间 (如 duration-300 即 300ms)' },
            { class: 'ease-linear', desc: '线性匀速过渡' },
            { class: 'ease-in', desc: '慢入加速过渡' },
            { class: 'ease-out', desc: '快入减速过渡 (UI 首选)' },
            { class: 'ease-in-out', desc: '慢入慢出平滑过渡' },
            { class: 'delay-{time}', desc: '控制过渡开始前的等待延迟时间' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'transition'
        }));
    }
}