// 🚀 Jquan Optimized: List 列表组件文档 (list.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ListDoc {
    static render() {
        // 预设列表演示数据，体现真实的业务场景
        const listItems = [
            '初始化 JquanUI 核心引擎',
            '配置 Singularity JIT 编译器',
            '构建现代化的响应式页面'
        ];

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">列表 (List Style)</li>
            </ul>

            <!-- 模块 1：列表样式矩阵 (List Style Type) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-list-bullets text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">列表标记样式 (List Type)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code class="inline-code">list-{ none | disc | decimal | square }</code> 来控制列表元素的标记符号。我们摒弃了传统的表格，通过真实的排版场景直接展现它们的视觉差异。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <!-- 无样式 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">无标记 (None)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-none</code>
                            </div>
                            <ul class="list-none space-y-2 text-slate-600 text-sm">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">常用于导航栏、卡片列表或自定义 Icon 列表的场景。</div>
                        </div>

                        <!-- 实心圆 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">实心圆 (Disc)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-disc</code>
                            </div>
                            <ul class="list-disc pl-5 space-y-2 text-slate-600 text-sm marker:text-primary">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">最常用的无序列表标记，适合功能说明、特性介绍。</div>
                        </div>

                        <!-- 数字序列 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">数字 (Decimal)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-decimal</code>
                            </div>
                            <ul class="list-decimal pl-5 space-y-2 text-slate-600 text-sm marker:text-emerald-500 marker:font-bold">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">标准有序列表，适用于操作步骤、排行榜等有先后顺序的场景。</div>
                        </div>

                        <!-- 实心方块 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">实心方块 (Square)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-square</code>
                            </div>
                            <ul class="list-square pl-5 space-y-2 text-slate-600 text-sm marker:text-amber-500">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">提供更具几何感和硬朗风格的标记符号，常用于特殊区块声明。</div>
                        </div>

                        <!-- 空心圆 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">空心圆 (Circle)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-circle</code>
                            </div>
                            <ul class="list-circle pl-5 space-y-2 text-slate-600 text-sm marker:text-amber-500">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">提供更具几何感和硬朗风格的标记符号，常用于特殊区块声明。</div>
                        </div>
                        <!-- 字母序列 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">字母 (Alpha)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-alpha</code>
                            </div>
                            <ul class="list-alpha pl-5 space-y-2 text-slate-600 text-sm marker:text-amber-500">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">提供更具几何感和硬朗风格的标记符号，常用于特殊区块声明。</div>
                        </div>
                        <!-- 罗马数字序列 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">罗马数字 (Roman)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-roman</code>
                            </div>
                            <ul class="list-roman pl-5 space-y-2 text-slate-600 text-sm marker:text-amber-500">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">提供更具几何感和硬朗风格的标记符号，常用于特殊区块声明。</div>
                        </div>
                        <!-- 列表项无图像 -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm">列表项无图像 (Image None)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">list-image-none</code>
                            </div>
                            <ul class="list-image-none pl-5 space-y-2 text-slate-600 text-sm marker:text-amber-500">
                                ${listItems.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-4 text-xs text-slate-400">提供更具几何感和硬朗风格的标记符号，常用于特殊区块声明。</div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：架构师进阶：列表位置 (List Position) -->
            <div class="mb-8 bg-primary/5 border border-indigo-100 rounded-xl shadow-sm overflow-hidden relative">
                <!-- 背景装饰：浅色水印 -->
                <div class="absolute top-0 right-0 -mt-8 -mr-8 text-indigo-100 opacity-60 pointer-events-none">
                    <i class="ph-fill ph-align-left text-[12rem]"></i>
                </div>
                
                <div class="p-8 relative z-10">
                    <h3 class="text-xl font-bold mb-3 text-slate-800 flex items-center gap-2">
                        <i class="ph ph-graduation-cap text-primary"></i> Jquan 排版进阶：标记位置控制
                    </h3>
                    <p class="text-indigo-700/80 mb-8 text-sm leading-relaxed max-w-3xl">
                        当列表项的文字过长发生折行时，标记符号是包含在文本流内（inside）还是挂在外部（outside），将决定阅读体验的成败。使用 <code class="bg-white/60 px-1 py-0.5 rounded border border-indigo-200 text-primary">list-inside</code> 或 <code class="bg-white/60 px-1 py-0.5 rounded border border-indigo-200 text-primary">list-outside</code> 来精准控制。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Outside 示例 (默认推荐) -->
                        <div class="bg-white p-5 rounded-lg border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-2 mb-3">
                                <code class="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">list-outside</code>
                                <span class="text-xs text-emerald-500 font-medium">（排版推荐，默认行为）</span>
                            </div>
                            <ul class="list-disc list-outside pl-4 space-y-2 text-slate-600 text-sm leading-relaxed marker:text-emerald-500">
                                <li>当文字超长产生折行时，第二行的文字会与第一行的文字<strong class="text-slate-900">严格左对齐</strong>，标记符号悬挂在文字盒模型外部。这种排版在长文本阅读时更加清晰易读。</li>
                            </ul>
                        </div>

                        <!-- Inside 示例 -->
                        <div class="bg-white p-5 rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-2 mb-3">
                                <code class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">list-inside</code>
                            </div>
                            <ul class="list-disc list-inside space-y-2 text-slate-600 text-sm leading-relaxed marker:text-amber-500">
                                <li>标记符号被包裹在文本块内部，当文字折行时，第二行文字会顶格显示，<strong class="text-slate-900">跑到标记符号的下方</strong>。通常用于不需要左侧对齐的紧凑型排版。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：最佳实践代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">嵌套列表最佳实践</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        结合 <code class="inline-code">space-y-{n}</code> 和 <code class="inline-code">pl-{n}</code> 等间距类名，可以优雅地构建多级嵌套列表。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 规范的二级嵌套列表结构 --&gt;
&lt;ul class="list-decimal list-outside pl-5 space-y-3 text-slate-700"&gt;
    &lt;li&gt;
        &lt;strong&gt;系统准备阶段&lt;/strong&gt;
        &lt;!-- 嵌套的子列表推荐使用不同的标记和更小的间距 --&gt;
        &lt;ul class="list-disc list-outside pl-5 mt-2 space-y-1 text-slate-500"&gt;
            &lt;li&gt;清理旧版本的缓存与模块&lt;/li&gt;
            &lt;li&gt;注入新的 Singularity JIT 引擎&lt;/li&gt;
        &lt;/ul&gt;
    &lt;/li&gt;
    &lt;li&gt;
        &lt;strong&gt;视图渲染阶段&lt;/strong&gt;
        &lt;ul class="list-circle list-outside pl-5 mt-2 space-y-1 text-slate-500"&gt;
            &lt;li&gt;挂载单页路由 (SPA)&lt;/li&gt;
            &lt;li&gt;初始化高亮代码块&lt;/li&gt;
        &lt;/ul&gt;
    &lt;/li&gt;
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
            { class: 'list-none', desc: '移除列表标记符号 (常用于导航/卡片)' },
            { class: 'list-disc', desc: '无序列表实心圆标记' },
            { class: 'list-decimal', desc: '有序列表数字序列标记' },
            { class: 'list-square', desc: '无序列表实心方块标记' },
            { class: 'list-inside', desc: '标记符号在文本流内部' },
            { class: 'list-outside', desc: '标记符号悬挂在文本外部 (默认)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'list' // 指向当前路由的标识
        }));
    }
}