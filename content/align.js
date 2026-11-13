// 🚀 Jquan Optimized: 文本对齐组件文档 (align.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class AlignDoc {
    static render() {
        const demoText = "孤独是你长久的朋友，爱只会偶尔来敲门。我们应当与孤独同生，弹琴、看书、买菜，对日子诚恳。一生有太多的遗憾与失去，我们要好好打扫悔恨，种新的花，忘记旧的人，掌好夜深的每一盏灯，爱来时窃窃听闻。";

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">文本对齐 (Text Alignment)</li>
            </ul>

            <section class="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                <header class="flex flex-col justify-between gap-3 border-b border-primary/10 bg-white/60 px-6 py-4 sm:flex-row sm:items-center">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-align-left text-xl text-primary"></i>
                        <h1 class="font-bold text-slate-800">文本对齐实验室 Playground</h1>
                    </div>
                    <span class="w-fit rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </header>
                <div class="grid gap-6 p-6 md:p-8 lg:grid-cols-5">
                    <section class="space-y-5 lg:col-span-2">
                        <div>
                            <h2 class="mb-1 text-sm font-bold text-slate-800">先选择语义，再看结果</h2>
                            <p class="text-sm leading-relaxed text-slate-600">文字方向使用原生 <code class="inline-code">dir</code>；对齐使用 <code class="inline-code">text-start</code> / <code class="inline-code">text-end</code> 时会自动适配 LTR 与 RTL，不需要写两套 CSS。</p>
                        </div>
                        <div>
                            <p class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Text align</p>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" data-align-value="text-left" class="align-playground-btn rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary">text-left</button>
                                <button type="button" data-align-value="text-center" class="align-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-center</button>
                                <button type="button" data-align-value="text-right" class="align-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-right</button>
                                <button type="button" data-align-value="text-start" class="align-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-start</button>
                                <button type="button" data-align-value="text-end" class="align-playground-btn col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-end</button>
                            </div>
                        </div>
                        <div>
                            <p class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Writing direction</p>
                            <div class="flex gap-2">
                                <button type="button" data-align-direction="ltr" class="align-direction-btn rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">LTR</button>
                                <button type="button" data-align-direction="rtl" class="align-direction-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">RTL</button>
                            </div>
                        </div>
                    </section>
                    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-inner lg:col-span-3">
                        <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Preview</span>
                            <span id="align-playground-status" class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">LTR · text-left</span>
                        </div>
                        <div class="mt-4 rounded-lg bg-slate-50 p-5">
                            <p id="align-playground-target" dir="ltr" class="text-left text-base leading-relaxed text-slate-700 transition-all">
                                JquanUI 让版式规则保持直接：先用原生语义表达语言环境，再用一个原子类决定文本对齐。<span class="block mt-3 text-sm text-slate-500">Logical utilities adapt to the writing direction without duplicating your markup.</span>
                            </p>
                        </div>
                        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-600">
                            <span class="text-slate-400">class</span> = <code id="align-playground-code" class="text-primary">"text-left"</code>
                            <span class="ml-3 text-slate-400">dir</span> = <code id="align-playground-dir" class="text-primary">"ltr"</code>
                        </div>
                    </section>
                </div>
            </section>

            <!-- 模块 1：文本水平对齐 (Text Align) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-align-left text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">文本水平对齐 (Horizontal Alignment)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code class="inline-code">text-{alignment}</code> 实用类来控制文本块的对齐方式。除了传统的方向，我们还支持 <code class="inline-code">start</code> 和 <code class="inline-code">end</code> 等逻辑属性以适应多语言 (RTL/LTR) 布局。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                        <!-- Left -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm flex items-center gap-1"><i class="ph ph-text-align-left"></i> 左对齐</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">text-left</code>
                            </div>
                            <p class="text-left text-slate-600 text-sm leading-relaxed">${demoText.substring(0, 60)}...</p>
                        </div>

                        <!-- Center -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm flex items-center gap-1"><i class="ph ph-text-align-center"></i> 居中对齐</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">text-center</code>
                            </div>
                            <p class="text-center text-slate-600 text-sm leading-relaxed">${demoText.substring(0, 60)}...</p>
                        </div>

                        <!-- Right -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm flex items-center gap-1"><i class="ph ph-text-align-right"></i> 右对齐</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">text-right</code>
                            </div>
                            <p class="text-right text-slate-600 text-sm leading-relaxed">${demoText.substring(0, 60)}...</p>
                        </div>

                        <!-- Start -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm flex items-center gap-1"><i class="ph ph-text-align-left"></i> 开始 (逻辑)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">text-start</code>
                            </div>
                            <p class="text-start text-slate-600 text-sm leading-relaxed">${demoText.substring(0, 60)}...</p>
                        </div>

                        <!-- End -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm flex items-center gap-1"><i class="ph ph-text-align-right"></i> 结束 (逻辑)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">text-end</code>
                            </div>
                            <p class="text-end text-slate-600 text-sm leading-relaxed">${demoText.substring(0, 60)}...</p>
                        </div>

                        <!-- Justify -->
                        <div class="border border-slate-100 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group md:col-span-2 lg:col-span-3 mt-2">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-medium text-sm flex items-center gap-1"><i class="ph ph-text-align-justify"></i> 两端对齐 (Justify)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">text-justify</code>
                            </div>
                            
                            <div class="border-x-2 border-primary/30 px-4 py-2">
                                <p class="text-justify text-slate-600 text-sm leading-relaxed">${demoText}</p>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：文本垂直对齐 (Vertical Alignment) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-rows text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">行内垂直对齐 (Vertical Alignment)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        使用 <code class="inline-code">align-{alignment}</code> 来控制行内元素（inline）、行内块元素（inline-block）或表格单元格的垂直对齐方式。
                    </p>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200">
                                    <th class="py-3 px-4 font-semibold w-1/4">Class</th>
                                    <th class="py-3 px-4 font-semibold w-1/4">对齐方式</th>
                                    <th class="py-3 px-4 font-semibold w-2/4">实时渲染效果 (对比基准线)</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                <!-- Baseline -->
                                <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td class="py-4 px-4"><code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono">align-baseline</code></td>
                                    <td class="py-4 px-4 text-slate-600">基线对齐 (默认)</td>
                                    <td class="py-4 px-4">
                                        <div class="bg-slate-100 inline-block p-2 rounded">
                                            <span class="text-2xl text-slate-800">基准文字</span>
                                            <span class="align-baseline text-xs text-emerald-600 font-bold bg-emerald-100 px-1 rounded">align-baseline</span>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Top -->
                                <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td class="py-4 px-4"><code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono">align-top</code></td>
                                    <td class="py-4 px-4 text-slate-600">顶部对齐</td>
                                    <td class="py-4 px-4">
                                        <div class="bg-slate-100 inline-block p-2 rounded">
                                            <span class="text-2xl text-slate-800">基准文字</span>
                                            <span class="align-top text-xs text-blue-600 font-bold bg-blue-100 px-1 rounded">align-top</span>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Middle -->
                                <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td class="py-4 px-4"><code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono">align-middle</code></td>
                                    <td class="py-4 px-4 text-slate-600">居中对齐</td>
                                    <td class="py-4 px-4">
                                        <div class="bg-slate-100 inline-block p-2 rounded">
                                            <span class="text-2xl text-slate-800">基准文字</span>
                                            <span class="align-middle text-xs text-amber-600 font-bold bg-amber-100 px-1 rounded">align-middle</span>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Bottom -->
                                <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td class="py-4 px-4"><code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono">align-bottom</code></td>
                                    <td class="py-4 px-4 text-slate-600">底部对齐</td>
                                    <td class="py-4 px-4">
                                        <div class="bg-slate-100 inline-block p-2 rounded">
                                            <span class="text-2xl text-slate-800">基准文字</span>
                                            <span class="align-bottom text-xs text-purple-600 font-bold bg-purple-100 px-1 rounded">align-bottom</span>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Sub / Super -->
                                <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td class="py-4 px-4">
                                        <code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono block mb-1">align-super</code>
                                        <code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono block">align-sub</code>
                                    </td>
                                    <td class="py-4 px-4 text-slate-600">上标 / 下标</td>
                                    <td class="py-4 px-4">
                                        <div class="bg-slate-100 inline-block p-2 rounded text-lg text-slate-800 font-mono">
                                            X<span class="align-super text-xs text-rose-500 font-bold">2</span> 
                                            + H<span class="align-sub text-xs text-cyan-600 font-bold">2</span>O
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 模块 3：架构师进阶 - 尾部对齐与书写方向 (Text Align Last) -->
            <div class="mb-8 bg-primary/5 border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                <!-- 背景装饰图标 -->
                <div class="absolute top-0 right-0 -mt-6 -mr-6 text-primary/10 pointer-events-none">
                    <i class="ph-fill ph-text-align-center text-9xl"></i>
                </div>
                
                <div class="p-8 relative z-10">
                    <h3 class="text-xl font-bold mb-3 text-slate-800 flex items-center gap-2">
                        <i class="ph ph-graduation-cap text-primary"></i> 进阶：尾行对齐与多语言方向
                    </h3>
                    <p class="text-slate-600 mb-8 text-sm leading-relaxed max-w-3xl">
                        当文本设置为两端对齐 (<code class="inline-code">text-justify</code>) 时，默认情况下最后一行是左对齐的。利用 <code class="inline-code">text-align-last-{val}</code>，我们可以完美控制段落收尾的姿态。此外，逻辑属性 <code class="inline-code">start / end</code> 能够智能感知书写方向。
                    </p>

                    <!-- 核心场景：Justify 配合 Last-Center -->
                    <div class="mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 黄金组合：诗歌与引用排版
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div class="text-xs text-slate-400 mb-2">默认：最后一行突兀靠边 (auto)</div>
                                <div class="p-4 border border-dashed border-slate-300 rounded bg-slate-50">
                                    <p class="text-justify text-slate-600 text-sm">
                                        ${demoText}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <div class="text-xs text-emerald-600 mb-2 font-medium">优化：使用 text-align-last-center</div>
                                <div class="p-4 border border-emerald-200 rounded bg-emerald-50/30 shadow-inner">
                                    <p class="text-justify text-align-last-center text-slate-700 font-medium text-sm">
                                        ${demoText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 所有值的完整对比 -->
                    <div class="mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-blue-500"></span> 所有值的完整对比
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <!-- auto -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">1. <code class="text-primary bg-primary/10 px-1 rounded">auto</code> (默认)</h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-auto text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- left -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">2. <code class="text-primary bg-primary/10 px-1 rounded">left</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-left text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- center -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">3. <code class="text-primary bg-primary/10 px-1 rounded">center</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-center text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- right -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">4. <code class="text-primary bg-primary/10 px-1 rounded">right</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-right text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- justify -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">5. <code class="text-primary bg-primary/10 px-1 rounded">justify</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-justify text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- start -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">6. <code class="text-primary bg-primary/10 px-1 rounded">start</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-start text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- end -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">7. <code class="text-primary bg-primary/10 px-1 rounded">end</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-align-last-end text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 所有值的完整对比 -->
                    <div class="mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-blue-500"></span> 所有值的完整对比
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <!-- auto -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">1. <code class="text-primary bg-primary/10 px-1 rounded">auto</code> (默认)</h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-auto text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- left -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">2. <code class="text-primary bg-primary/10 px-1 rounded">left</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-left text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- center -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">3. <code class="text-primary bg-primary/10 px-1 rounded">center</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-center text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- right -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">4. <code class="text-primary bg-primary/10 px-1 rounded">right</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-right text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- justify -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">5. <code class="text-primary bg-primary/10 px-1 rounded">justify</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-justify text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- start -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">6. <code class="text-primary bg-primary/10 px-1 rounded">start</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-start text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                            <!-- end -->
                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h5 class="font-semibold text-xs text-slate-700 mb-2">7. <code class="text-primary bg-primary/10 px-1 rounded">end</code></h5>
                                <div class="border border-dashed border-slate-300 p-3 bg-white rounded">
                                    <p class="text-justify text-justify-inter-character text-align-last-end text-xs text-slate-600 leading-relaxed">${demoText}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LTR vs RTL 演示 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-sm font-bold text-slate-800">从左到右 (LTR)</span>
                                <code class="inline-code">dir="ltr"</code>
                            </div>
                            <div class="space-y-3" dir="ltr">
                                <div class="p-3 bg-slate-50 border border-slate-100 rounded text-sm text-slate-600">
                                    <span class="text-xs text-primary font-bold mr-2">start:</span> In LTR text, <code class="text-xs">start</code> means left.
                                </div>
                                <div class="p-3 bg-slate-50 border border-slate-100 rounded text-sm text-slate-600 text-align-last-end text-end">
                                    <span class="text-xs text-primary font-bold mr-2">end:</span> In LTR text, <code class="text-xs">end</code> means right.
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-sm font-bold text-slate-800">从右到左 (RTL)</span>
                                <code class="inline-code">dir="rtl"</code>
                            </div>
                            <div class="space-y-3" dir="rtl">
                                <div class="p-3 bg-amber-50/50 border border-amber-100 rounded text-sm text-slate-600 text-start">
                                    In RTL text, <code class="text-xs">start</code> means right. <span class="text-xs text-amber-600 font-bold ml-2">:start</span>
                                </div>
                                <div class="p-3 bg-amber-50/50 border border-amber-100 rounded text-sm text-slate-600 text-end">
                                    In RTL text, <code class="text-xs">end</code> means left. <span class="text-xs text-amber-600 font-bold ml-2">:end</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 模块 4：响应式对齐最佳实践 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-devices text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">响应式控制 (Responsive)</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        移动端为了阅读体验通常需要左对齐，而到了桌面端大屏幕，为了视觉平衡可能需要居中。通过断点前缀可以轻松实现这一需求。
                    </p>
                    <div class="shadow-sm rounded-lg overflow-hidden border border-slate-200">
                        <pre><code class="language-html">
&lt;!-- 移动端默认左对齐，在中等屏幕(md)及以上转为居中对齐 --&gt;
&lt;div class="text-left md:text-center text-slate-700"&gt;
    &lt;h2 class="text-xl font-bold mb-2"&gt;响应式标题&lt;/h2&gt;
    &lt;p&gt;这段文字会随着设备的屏幕尺寸改变对齐方式，提供最佳阅读体验。&lt;/p&gt;
&lt;/div&gt;
                        </code></pre>
                    </div>
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

        const target = container.querySelector('#align-playground-target');
        const status = container.querySelector('#align-playground-status');
        const code = container.querySelector('#align-playground-code');
        const direction = container.querySelector('#align-playground-dir');
        const alignmentButtons = container.querySelectorAll('.align-playground-btn');
        const directionButtons = container.querySelectorAll('.align-direction-btn');
        if (!target || !status || !code || !direction) return;

        const state = { alignment: 'text-left', direction: 'ltr' };
        const update = () => {
            target.classList.remove('text-left', 'text-center', 'text-right', 'text-start', 'text-end');
            target.classList.add(state.alignment);
            target.setAttribute('dir', state.direction);
            status.textContent = `${state.direction.toUpperCase()} · ${state.alignment}`;
            code.textContent = `"${state.alignment}"`;
            direction.textContent = `"${state.direction}"`;
        };
        const setActive = (nodes, attribute, value) => nodes.forEach(node => {
            const active = node.dataset[attribute] === value;
            node.classList.toggle('border-primary', active);
            node.classList.toggle('bg-primary/10', active);
            node.classList.toggle('text-primary', active);
            node.classList.toggle('font-semibold', active);
            node.classList.toggle('border-slate-200', !active);
            node.classList.toggle('bg-white', !active);
            node.classList.toggle('text-slate-700', !active);
        });
        alignmentButtons.forEach(button => button.addEventListener('click', () => {
            state.alignment = button.dataset.alignValue;
            setActive(alignmentButtons, 'alignValue', state.alignment);
            update();
        }));
        directionButtons.forEach(button => button.addEventListener('click', () => {
            state.direction = button.dataset.alignDirection;
            setActive(directionButtons, 'alignDirection', state.direction);
            update();
        }));
        update();
    }

    // ==========================================
    // 全局搜索 API 供 router 或 search 模块调用
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'text-left / center / right', desc: '控制文本水平对齐' },
            { class: 'text-justify', desc: '文本两端对齐' },
            { class: 'indent-{size}', desc: '段落首行缩进' },
            { class: 'align-baseline / top / middle / bottom', desc: '控制元素的垂直对齐' },
            { class: 'align-sub / super', desc: '文本的上标与下标对齐' },
            { class: 'text-align-last-{val}', desc: '控制段落最后一行的对齐方式' },
            { class: 'text-start / text-end', desc: '基于多语言书写方向的逻辑对齐' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'align'
        }));
    }
}
