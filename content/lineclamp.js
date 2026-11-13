// 🚀 Jquan Optimized: LineClamp 组件文档 (lineclamp.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LineClampDoc {
    static render() {
        const sampleTextShort = "长这么大，我说不出来我最爱的一部电影，说不出我最爱的一首歌，更说不出我最爱的那一个人，时常觉得人生其实没有那么有趣，偶尔也会质疑活着的意义是什么?所有来自书上和别人口中的意义，其实都不曾说服过我。但今天突然觉得，大概就是用余生去找到这些最爱吧！";
        
        const sampleTextLong = "我爱你呀，必定是招摇过市、人尽皆知。我要让整个春天知道，让每一朵花，都为我们而开；我要让夜色中繁华知晓，整座城市都为我们眉开眼笑；我要让漫天仙神徒劳，人世浮华三千，不如你的笑；我要将玄之又玄的爱讲给精灵山怪；我要携四季拜访星辰大海；我要生命中的一切通通倒退；我要宇宙中的无垠纷纷赶来。我要你，我要你明目张胆的爱，也要你眉眼盛开！";

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">限制行数 (Line Clamp)</li>
            </ul>

            <!-- 模块 1：API 规范表 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-align-justify text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">基础类名参考</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-6 pb-4 border-b border-slate-100">
                        使用 <code class="inline-code">line-clamp-{n}</code> 功能类，能够优雅地截断多行文本，并在末尾自动添加省略号。底层基于现代 WebKit 盒模型属性实现。
                    </p>
                    
                    <div class="flex flex-col border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                        <div class="flex items-center bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider py-2 px-4 border-b border-slate-200">
                            <div class="w-40 md:w-56">Class</div>
                            <div class="flex-1">Description</div>
                        </div>
                        
                        <div class="flex items-center py-3 px-4 border-b border-slate-100 hover:bg-white transition-colors">
                            <div class="w-40 md:w-56 flex-shrink-0">
                                <code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono border border-primary/20">.line-clamp-1</code>
                            </div>
                            <div class="flex-1 text-sm text-slate-600">限制文本为 1 行（相当于单行截断，常用于单行标题）</div>
                        </div>
                        
                        <div class="flex items-center py-3 px-4 border-b border-slate-100 hover:bg-white transition-colors">
                            <div class="w-40 md:w-56 flex-shrink-0">
                                <code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono border border-primary/20">.line-clamp-2</code> <span class="text-slate-300 mx-1 text-xs">to</span> <code class="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono border border-primary/20">6</code>
                            </div>
                            <div class="flex-1 text-sm text-slate-600">限制文本为 2 到 6 行（预设安全范围）</div>
                        </div>

                        <div class="flex items-center py-3 px-4 border-b border-slate-100 hover:bg-white transition-colors">
                            <div class="w-40 md:w-56 flex-shrink-0">
                                <code class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-mono border border-emerald-200">.line-clamp-none</code>
                            </div>
                            <div class="flex-1 text-sm text-slate-600"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] mr-2 font-bold uppercase tracking-wide">Utility</span>解除所有截断限制，恢复全文显示（常用于响应式折叠）</div>
                        </div>
                        
                        <div class="flex items-center py-3 px-4 hover:bg-white transition-colors bg-indigo-50/30">
                            <div class="w-40 md:w-56 flex-shrink-0">
                                <code class="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-mono border border-amber-200">.line-clamp-[n]</code>
                            </div>
                            <div class="flex-1 text-sm text-slate-600"><span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] mr-2 font-bold uppercase tracking-wide">JIT</span>支持任意行数限制，引擎将在毫秒内动态生成规则</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：视觉示例矩阵 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-cards text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">效果演示 (Visual Demos)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <!-- 示例 1 -->
                        <div class="bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group">
                            <div class="border-b border-slate-200 px-4 py-3 flex justify-between items-center bg-white">
                                <code class="text-xs font-mono text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">line-clamp-1</code>
                            </div>
                            <div class="p-5 flex-1 text-slate-600 text-sm leading-relaxed">
                                <p class="line-clamp-1 group-hover:text-slate-900 transition-colors">${sampleTextShort}</p>
                            </div>
                        </div>

                        <!-- 示例 2 -->
                        <div class="bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group">
                            <div class="border-b border-slate-200 px-4 py-3 flex justify-between items-center bg-white">
                                <code class="text-xs font-mono text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">line-clamp-2</code>
                            </div>
                            <div class="p-5 flex-1 text-slate-600 text-sm leading-relaxed">
                                <p class="line-clamp-2 group-hover:text-slate-900 transition-colors">${sampleTextLong}</p>
                            </div>
                        </div>

                        <!-- 示例 3 -->
                        <div class="bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group">
                            <div class="border-b border-slate-200 px-4 py-3 flex justify-between items-center bg-white">
                                <code class="text-xs font-mono text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">line-clamp-3</code>
                            </div>
                            <div class="p-5 flex-1 text-slate-600 text-sm leading-relaxed">
                                <p class="line-clamp-3 group-hover:text-slate-900 transition-colors">${sampleTextLong}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 3：JIT 引擎动态交互沙盒 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-amber-500 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">JIT 引擎任意值 (Arbitrary Lines)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">line-clamp-[ value ]</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6">
                        依靠强大的 JquanUI JIT 引擎，即使你需要截断到 7 行、8 行，也完全无需手写冗余的 CSS。引擎会通过 MutationObserver 捕获你的 DOM 变更，瞬间下发样式。<br/>
                        <strong>拖动下方滑块，实时观察行数截断与代码的同步变化：</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制台与源码 -->
                        <div class="lg:col-span-5 flex flex-col justify-center space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            <div class="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                <label for="lc-slider" class="flex justify-between text-sm font-medium text-slate-700 mb-4">
                                    <span class="flex items-center gap-2"><i class="ph ph-sliders-horizontal text-primary"></i> 限制行数调节</span>
                                    <span class="font-mono text-primary font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100" id="lc-display">4</span>
                                </label>
                                <input type="range" id="lc-slider" min="1" max="10" value="4" class="w-full form-control !p-0 !h-auto cursor-pointer">
                            </div>

                            <div class="mt-4">
                                <pre id="lc-pre-container"><code class="language-html">
&lt;p class="line-clamp-[4] text-slate-600"&gt;
    ${sampleTextLong.substring(0, 20)}...
&lt;/p&gt;
                                </code></pre>
                            </div>
                        </div>

                        <!-- 右侧：动态视觉沙盒 -->
                        <div class="lg:col-span-7 flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                            <div class="bg-slate-100/50 px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">
                                Live Preview
                            </div>
                            <div class="p-6 md:p-8 flex-1 flex items-start">
                                <p id="lc-preview-text" class="line-clamp-[4] text-slate-700 text-base leading-relaxed transition-all duration-200">
                                    我爱你呀，必定是招摇过市、人尽皆知。我要让整个春天知道，让每一朵花，都为我们而开；我要让夜色中繁华知晓，整座城市都为我们眉开眼笑；我要让漫天仙神徒劳，人世浮华三千，不如你的笑；我要将玄之又玄的爱讲给精灵山怪；我要携四季拜访星辰大海；我要生命中的一切通通倒退；我要宇宙中的无垠纷纷赶来。我要你，我要你明目张胆的爱，也要你眉眼盛开！这段文字为了测试超长截断，特意在此处继续延伸，直到宇宙的尽头，直到时间的彼岸，直到代码跑完最后一个循环。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 4：实战技巧 (Responsive & Undo) -->
            <div class="mb-8 bg-primary/5 border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                <div class="absolute top-0 right-0 -mt-6 -mr-6 text-primary/10 pointer-events-none">
                    <i class="ph-fill ph-monitor text-9xl"></i>
                </div>
                <div class="p-8 relative z-10">
                    <h3 class="text-xl font-bold mb-3 text-slate-800 flex items-center gap-2">
                        <i class="ph ph-arrows-out-line-vertical text-primary"></i> 响应式折叠与撤销
                    </h3>
                    <p class="text-slate-600 mb-6 text-sm leading-relaxed max-w-3xl">
                        在企业级项目中，通常需要实现“移动端折叠截断，桌面端展开全文”的需求。借助于响应式前缀和 <code class="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-primary font-mono text-xs">line-clamp-none</code>，只需要一行代码即可实现。
                    </p>
                    <div class="mt-4 shadow-sm rounded-lg overflow-hidden">
                        <pre><code class="language-html">
&lt;!-- 移动端默认限制 3 行，中大屏幕（md断点）自动恢复全文显示 --&gt;
&lt;p class="line-clamp-3 md:line-clamp-none text-slate-600"&gt;
    响应式文本内容...
&lt;/p&gt;
                        </code></pre>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：事件绑定与 DOM 操控
    // ==========================================
    static mount(container) {
        // 1. 初始化高亮代码块
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,       
        });

        // 2. JIT 沙盒交互绑定
        const lcSlider = container.querySelector('#lc-slider');
        const lcDisplay = container.querySelector('#lc-display');
        const lcPreviewText = container.querySelector('#lc-preview-text');
        const lcPreContainer = container.querySelector('#lc-pre-container');

        if (lcSlider && lcPreviewText) {
            lcSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                
                // A. 更新数值面板
                lcDisplay.textContent = val;
                
                // B. 动态替换预览文本的 class，触发 JIT 引擎编译
                // 使用正则替换掉原有的 line-clamp-[x] 或 line-clamp-x
                lcPreviewText.className = lcPreviewText.className.replace(/line-clamp-(?:\[\d+\]|\d+)/, `line-clamp-[${val}]`);
                
                // C. 【外科手术级 DOM 更新】更新代码块内容，保持高亮与复制功能不被破坏
                if (lcPreContainer) {
                    const walker = document.createTreeWalker(
                        lcPreContainer,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );
                    
                    let node;
                    while ((node = walker.nextNode())) {
                        if (node.nodeValue.includes('line-clamp-[')) {
                            node.nodeValue = node.nodeValue.replace(/line-clamp-\[\d+\]/g, `line-clamp-[${val}]`);
                        }
                    }
                }
            });
        }
    }

    // ==========================================
    // 全局搜索 API 供 router 或 search 模块调用
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'line-clamp-1 to 6', desc: '预设的文本行数截断' },
            { class: 'line-clamp-[n]', desc: 'JIT 引擎任意行数动态截断' },
            { class: 'line-clamp-none', desc: '取消行数限制，恢复全文展示' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'lineclamp'
        }));
    }
}