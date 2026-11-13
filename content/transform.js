// 🚀 Jquan Optimized: Transform 变换与 3D 动画组件文档 (transform.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class TransformDoc {
    // 辅助器：渲染 2D 变换演示方块
    static renderTransformBox(title, transformClass, baseColor = 'bg-blue-500') {
        const encodedCode = encodeURIComponent(transformClass);
        return `
        <div class="code-copy-trigger flex flex-col gap-3 group cursor-pointer" data-code="${encodedCode}">
            <!-- 演示区：带虚线外框作为参考系 -->
            <div class="w-full h-32 relative rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                <!-- 实际变换元素 -->
                <div class="w-16 h-16 rounded-lg ${baseColor} shadow-md flex items-center justify-center text-white transition-transform duration-300 ease-in-out ${transformClass} relative z-10">
                    <i class="ph ph-intersect text-2xl drop-shadow-sm"></i>
                </div>
                
                <!-- 遮罩复制按钮 -->
                <div class="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <span class="text-white text-[11px] font-bold bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm border border-slate-600 mt-20">复制类名</span>
                </div>
            </div>
            <div class="flex items-center justify-between px-1">
                <span class="block text-sm font-bold text-slate-700 truncate">${title}</span>
                <code class="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">${transformClass}</code>
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
                <li class="text-slate-800 font-medium">变换 (Transforms)</li>
            </ul>

            <!-- 模块 1：平移与缩放 (Translate & Scale) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-arrows-out-cardinal text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">平移与缩放 (Hover 预览)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        基于 JquanUI 复合变换矩阵，你可以随意组合 <code class="inline-code">translate</code> 和 <code class="inline-code">scale</code> 类名。悬停在下方方块上查看平滑的物理过渡效果。
                    </p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        ${this.renderTransformBox('向右平移', 'group-hover:translate-x-6', 'bg-emerald-500')}
                        ${this.renderTransformBox('向上平移', 'group-hover:-translate-y-6', 'bg-emerald-500')}
                        ${this.renderTransformBox('放大 (Scale up)', 'group-hover:scale-125', 'bg-sky-500')}
                        ${this.renderTransformBox('缩小 (Scale down)', 'group-hover:scale-75', 'bg-sky-500')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：旋转与倾斜 (Rotate & Skew) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-arrows-clockwise text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">旋转与倾斜</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        ${this.renderTransformBox('顺时针旋转', 'group-hover:rotate-45', 'bg-amber-500')}
                        ${this.renderTransformBox('逆时针旋转', 'group-hover:-rotate-45', 'bg-amber-500')}
                        ${this.renderTransformBox('X轴倾斜', 'group-hover:skew-x-12', 'bg-indigo-500')}
                        ${this.renderTransformBox('Y轴倾斜', 'group-hover:-skew-y-12', 'bg-indigo-500')}
                    </div>
                </div>
            </div>

            <!-- 模块 3：变换基点 (Transform Origin) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-crosshair text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">变换基准点 (Origin)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code class="inline-code">origin-{point}</code> 改变元素变换的轴心。仔细观察下方方块旋转时的“圆心”位置有何不同。
                    </p>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${this.renderTransformBox('中心旋转 (默认)', 'origin-center group-hover:rotate-45', 'bg-rose-500')}
                        ${this.renderTransformBox('左上角发力', 'origin-top-left group-hover:rotate-45', 'bg-rose-500')}
                        ${this.renderTransformBox('右下角发力', 'origin-bottom-right group-hover:-rotate-45', 'bg-rose-500')}
                        ${this.renderTransformBox('底部摆动', 'origin-bottom group-hover:-rotate-12', 'bg-rose-500')}
                    </div>
                </div>
            </div>

            <!-- 模块 4：架构师级 3D 透视翻转 (3D Perspective) -->
            <div class="mb-8 bg-white border border-primary/20 rounded-xl shadow-lg overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-cube text-primary text-lg"></i>
                    <cite class="font-bold text-primary not-italic">3D 透视物理引擎 (3D Transforms)</cite>
                </div>
                <div class="p-6 md:p-10 flex flex-col md:flex-row items-center gap-10">
                    
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-3 text-primary">打造空间级的翻转卡片</h3>
                        <p class="text-slate-400 text-sm leading-relaxed mb-4">
                            结合 <code class="inline-code">perspective</code> 提供景深，使用 <code class="inline-code">transform-3d</code> 开启三维空间，再通过 <code class="inline-code">backface-hidden</code> 隐藏背面。
                        </p>
                        <p class="text-slate-500 text-xs">👉 尝试将鼠标悬停在右侧卡片上，体验极致流畅的 GPU 硬件加速 3D 翻转。</p>
                    </div>

                    <!-- 3D 翻转卡片演示区 -->
                    <div class="w-64 h-80 perspective-1000 group cursor-pointer shrink-0">
                        <!-- 内层 3D 容器 -->
                        <div class="w-full h-full relative transition-transform duration-700 ease-in-out transform-3d group-hover:rotate-y-180">
                            
                            <!-- 正面 -->
                            <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white border border-white/10 p-6">
                                <i class="ph ph-credit-card text-5xl mb-4 text-white/80"></i>
                                <span class="font-bold text-lg tracking-widest">JQUAN BLACK</span>
                                <span class="text-xs text-cyan-100 mt-1 opacity-75">Hover to flip</span>
                            </div>
                            
                            <!-- 背面 (已提前旋转 180度 并贴合) -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 flex flex-col items-center justify-center p-6 text-slate-300">
                                <div class="w-full h-10 bg-slate-900 mb-4 rounded-sm"></div>
                                <div class="w-full flex justify-end">
                                    <div class="bg-white text-slate-800 text-xs px-2 py-1 italic font-bold">123</div>
                                </div>
                                <div class="mt-auto text-[10px] text-slate-500 text-center">
                                    此演示由 JquanUI V3 原生 3D 变换管线驱动。
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <!-- 模块 5：最佳实践代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">复合变换与 GPU 加速实践</cite>
                </div>
                <div class="p-6">
                    <pre><code class="language-html">
&lt;!-- 1. 悬停悬浮按钮 (组合: 向上平移 + 放大 + 阴影过渡) --&gt;
&lt;button class="transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg bg-primary text-white px-4 py-2 rounded"&gt;
    Hover Me
&lt;/button&gt;

&lt;!-- 2. 开启硬件加速的丝滑过渡 (强制使用 translate3d 交给 GPU 渲染) --&gt;
&lt;div class="transform-gpu transition-transform translate-x-10"&gt;
    This element moves smoothly.
&lt;/div&gt;

&lt;!-- 3. 标准 3D 翻转卡片结构 --&gt;
&lt;div class="perspective-1000 group"&gt;
    &lt;div class="transform-3d transition-transform duration-500 group-hover:rotate-y-180"&gt;
        &lt;div class="backface-hidden"&gt;正面内容&lt;/div&gt;
        &lt;div class="backface-hidden rotate-y-180 absolute inset-0"&gt;背面内容&lt;/div&gt;
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
        // 渲染页面后，初始化代码块高亮与复制功能
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
            { class: 'scale-{size}', desc: '控制元素的 2D 缩放比例' },
            { class: 'translate-x-{size}', desc: '控制元素在 X 轴的平移' },
            { class: 'translate-y-{size}', desc: '控制元素在 Y 轴的平移' },
            { class: 'rotate-{degree}', desc: '控制元素的 2D 旋转角度' },
            { class: 'skew-x-{degree}', desc: '控制元素在 X 轴的倾斜' },
            { class: 'origin-{point}', desc: '设置变换的基准中心点' },
            { class: 'transform-gpu', desc: '开启 GPU 硬件加速变换' },
            { class: 'perspective-{size}', desc: '为子元素的 3D 变换提供景深距离' },
            { class: 'transform-3d', desc: '允许子元素保留 3D 空间结构 (preserve-3d)' },
            { class: 'backface-hidden', desc: '当元素背对屏幕时隐藏其背面' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'transform'
        }));
    }
}
