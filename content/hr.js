// 🚀 Jquan Optimized: 分割线组件文档 (hr.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class HrDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">分割线 (Dividers)</li>
            </ul>

            <div class="mb-8 text-slate-600 text-sm">
                <p>分割线用于在视觉上分隔内容区域。除了原生的 <code class="inline-code">&lt;hr&gt;</code> 标签，Tailwind 强大的 <code class="inline-code">divide-*</code> 实用类更能帮助我们优雅地处理列表项之间的分隔线。</p>
            </div>

            <!-- 模块 1：基础线条样式 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-minus text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">基础线条样式 (Basic Line Styles)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        通过修改 <code class="inline-code">border-{style}</code> 属性，我们可以快速改变原生 <code class="inline-code">&lt;hr&gt;</code> 的视觉表现形式。
                    </p>
                    
                    <div class="space-y-8">
                        <!-- 实线 (默认) -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">原生实线 (Solid / Default)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">border-solid</code>
                            </div>
                            <hr class="border-slate-200 border-t">
                        </div>

                        <!-- 虚线 (Dashed) -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">虚线 (Dashed)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">border-dashed</code>
                            </div>
                            <!-- 加粗一点让视觉更明显 border-t-2 -->
                            <hr class="border-slate-300 border-t-2 border-dashed">
                        </div>

                        <!-- 点线 (Dotted) -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">点线 (Dotted)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">border-dotted</code>
                            </div>
                            <hr class="border-slate-400 border-t-2 border-dotted">
                        </div>

                        <!-- 双实线 (Double) -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">双实线 (Double)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">border-double</code>
                            </div>
                            <hr class="border-slate-300 border-t-4 border-double">
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：色彩与渐变 (取代原 hr-theme 与 hr-gradient) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-palette text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">色彩与渐变 (Colors & Gradients)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="space-y-8">
                        <!-- 主题色分割线 -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">主题色分割线</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">border-primary</code>
                            </div>
                            <hr class="border-primary/50 border-t-2">
                            <p class="text-xs text-slate-400 mt-2">提示：利用 <code class="inline-code">/50</code> 可调整边框颜色的透明度，使其更加柔和。</p>
                        </div>

                        <!-- 渐变分割线 -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">平滑渐变线</span>
                                <code class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">bg-gradient-to-r</code>
                            </div>
                            <!-- 渐变线通常不使用 border，而是直接给一个高度 h-px 并渲染背景色 -->
                            <hr class="h-1 border-0 bg-gradient-to-r from-teal-400 via-primary to-yellow-200 rounded-full">
                        </div>
                        
                        <!-- 渐隐消失线 -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-slate-700 font-medium text-sm">两端渐隐消失</span>
                                <code class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">from-transparent</code>
                            </div>
                            <hr class="h-px border-0 bg-gradient-to-r from-transparent via-slate-400 to-transparent">
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：带文本/图标的分割线 (架构师加餐) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-t text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">带内容的分割线 (Divider with Content)</cite>
                </div>
                <div class="p-6 md:p-8 space-y-10">
                    <p class="text-slate-500 text-sm mb-4">
                        纯线条往往无法满足复杂的排版需求，利用 Flex 布局，我们可以轻松构建出现代 Web 常见的带文字或图标的分割线。
                    </p>

                    <!-- 文字居中 -->
                    <div class="relative flex py-5 items-center">
                        <div class="flex-1 border-t border-slate-300"></div>
                        <span class="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR 继续使用</span>
                        <div class="flex-1 border-t border-slate-300"></div>
                    </div>

                    <!-- 文字居左 (使用 w-full 强制撑开剩余空间) -->
                    <div class="relative flex py-5 items-center">
                        <span class="flex-shrink-0 mr-4 text-primary font-bold text-lg">章节 01</span>
                        <div class="w-full flex-1 border-t border-slate-300 border-dashed"></div>
                    </div>

                    <!-- 带图标 (使用语义化的 hr) -->
                    <div class="relative flex py-5 items-center">
                        <hr class="flex-1 border-t border-slate-300">
                        <span class="flex-shrink-0 mx-4 text-slate-400 bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                            <i class="ph ph-star text-amber-500"></i>
                        </span>
                        <hr class="flex-1 border-t border-slate-300">
                    </div>
                </div>
            </div>

            <!-- 模块 4：正确理解 Divide 容器分隔 -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden relative">
                <div class="absolute top-0 right-0 -mt-4 -mr-4 text-primary/10 pointer-events-none">
                    <i class="ph-fill ph-rows text-8xl"></i>
                </div>
                
                <div class="p-8 relative z-10">
                    <h3 class="text-xl font-bold mb-3 text-slate-800 flex items-center gap-2">
                        <i class="ph-fill ph-warning-circle text-amber-500"></i> Divide 容器分隔
                    </h3>
                    <p class="text-slate-600 mb-6 text-sm leading-relaxed max-w-3xl">
                        它是一个<strong>“容器指令”</strong>！当你有一个列表容器时，只需给父级加上该属性，它会自动在所有相邻的子元素之间（且不包含首尾边缘）绘制完美的分隔线。
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Y 轴分隔 (垂直列表) -->
                        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-sm font-bold text-slate-800">Y 轴垂直分隔列表</span>
                                <code class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">divide-y</code>
                            </div>
                            
                            <!-- 核心演示：父级加上 divide-y 和 divide-slate-100 -->
                            <ul class="divide-y divide-slate-100 text-sm text-slate-600">
                                <li class="py-3 flex items-center gap-2"><i class="ph ph-check-circle text-emerald-500"></i> 这是列表的第一项</li>
                                <li class="py-3 flex items-center gap-2"><i class="ph ph-check-circle text-emerald-500"></i> 这里自动产生了一条顶边框</li>
                                <li class="py-3 flex items-center gap-2"><i class="ph ph-check-circle text-emerald-500"></i> 无需为每个 li 单独写 border-b</li>
                            </ul>
                        </div>

                        <!-- X 轴分隔 (水平菜单) -->
                        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-sm font-bold text-slate-800">X 轴水平分隔菜单</span>
                                <code class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">divide-x</code>
                            </div>
                            
                            <!-- 核心演示：父级加上 divide-x -->
                            <div class="flex items-center justify-center bg-slate-50 p-4 rounded-md mt-4">
                                <nav class="flex divide-x-2 divide-primary/20 divide-dotted text-sm text-slate-600 font-medium">
                                    <a href="#" class="px-4 hover:text-primary transition-colors">首页</a>
                                    <a href="#" class="px-4 hover:text-primary transition-colors">产品</a>
                                    <a href="#" class="px-4 hover:text-primary transition-colors">关于我们</a>
                                    <a href="#" class="px-4 hover:text-primary transition-colors">联系</a>
                                </nav>
                            </div>
                            <p class="text-xs text-slate-400 mt-4 text-center">👆 这里使用了 <code class="inline-code">divide-x-2 divide-dotted</code></p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    // 挂载逻辑：初始化插件
    static mount(container) {
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    // 全局搜索 API
    static async onSearch(keyword) {
        const apiData = [
            { class: 'border-solid / dashed / dotted / double', desc: '控制 hr 线条的基础样式' },
            { class: 'bg-gradient-to-r', desc: '利用渐变背景色创建炫酷分割线' },
            { class: 'divide-x / divide-y', desc: '给父容器使用，自动在子元素之间添加分隔线' },
            { class: 'divide-solid / dashed / dotted', desc: '控制容器子元素之间分隔线的样式' },
            { class: 'divide-{color}', desc: '控制容器子元素之间分隔线的颜色' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'hr'
        }));
    }
}