// 🚀 Jquan Optimized: 渲染边界与性能组件文档 (contain.js) v1.0
// 专注 P8 级重绘与回流调优 (CSS Containment)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ContainDoc {
    static render() {
        const toggleBase = 'btn-toggle w-full inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 text-left';
        const toggleActive = 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20';
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-cpu"></i>进阶与性能</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">渲染边界 (Containment)</li>
            </ul>

            <!-- 模块 1：渲染隔离结界沙盒 (The Isolation Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <!-- 科技感背景装饰 -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">内核渲染隔离仪 (Browser Engine Sandbox)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Performance Tuning</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6 flex items-start gap-3">
                        <i class="ph-fill ph-warning-circle text-indigo-500 text-xl mt-0.5 shrink-0"></i>
                        <p class="text-indigo-800 text-sm leading-relaxed">
                            <strong>硬核警告：</strong> <code class="bg-white/60 px-1 py-0.5 rounded text-indigo-600 border border-indigo-200">contain</code> 是现代浏览器的黑魔法。它告诉浏览器：“这个容器独立于外部的 DOM 树，内部的变动不会触发外部的重排 (Reflow) 和重绘 (Repaint)”。<strong>合理使用可极大提升长列表和复杂看板的滚动与交互性能。</strong>
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制面板 -->
                        <div class="lg:col-span-5 flex flex-col space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            
                            <div class="space-y-3">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                    <span>包含策略 (Contain Strategy)</span>
                                    <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Single choice</span>
                                </label>
                                <div class="flex flex-col gap-2" id="ctrl-contain">
                                    <button class="${toggleBase} active ${toggleActive}" data-val="contain-none" data-desc="不进行任何优化，常规渲染流。">
                                        <span>无隔离 (None)</span>
                                    </button>
                                    <button class="${toggleBase}" data-val="contain-layout" data-desc="布局隔离：内部元素的变动不会影响外部布局，外部也不会影响内部。">
                                        <span>仅布局隔离 (Layout)</span>
                                    </button>
                                    <button class="${toggleBase}" data-val="contain-paint" data-desc="绘制隔离：子元素不会绘制在容器边界之外。">
                                        <span>仅绘制隔离 (Paint)</span>
                                    </button>
                                    <button class="${toggleBase}" data-val="contain-size" data-desc="尺寸隔离：容器大小不受子元素影响 (需显式指定宽高)。">
                                        <span>仅尺寸隔离 (Size)</span>
                                    </button>
                                    <button class="${toggleBase} border-l-4 border-l-amber-400" data-val="contain-content" data-desc="内容隔离：相当于 layout + paint，最常用的安全优化级别。">
                                        <span class="font-bold text-slate-700">内容级隔离 (Content)</span>
                                        <i class="ph-fill ph-star text-amber-400"></i>
                                    </button>
                                    <button class="${toggleBase} border-l-4 border-l-rose-500" data-val="contain-strict" data-desc="严格隔离：layout + paint + size，性能最高，但必须定高定宽！">
                                        <span class="font-bold text-rose-600">严格级隔离 (Strict)</span>
                                        <i class="ph-fill ph-lightning text-rose-500"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 引擎状态监控区 -->
                            <div class="bg-primary/5 rounded-lg p-4 font-mono text-xs border border-primary/20 shadow-inner mt-auto">
                                <div class="text-slate mb-2 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    内核渲染预测 (Engine Predict)
                                </div>
                                <div id="engine-monitor" class="text-slate-300 leading-relaxed min-h-[40px] transition-all">
                                    标准 DOM 树挂载，发生全局 Reflow 时该节点将一同参与计算。
                                </div>
                            </div>
                        </div>

                        <!-- 右侧：效果预览与代码生成 -->
                        <div class="lg:col-span-7 flex flex-col space-y-4">
                            <!-- 视觉舞台 (模拟 DOM 树) -->
                            <div class="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-6 min-h-[300px] relative overflow-hidden">
                                
                                <div class="text-xs text-slate-400 mb-4 w-full text-center">👇 祖先 DOM 节点</div>
                                
                                <!-- 被控制的预览实体 (模拟渲染结界) -->
                                <div id="preview-box" class="contain-none w-full max-w-sm bg-white p-5 rounded-xl shadow-sm border-2 border-dashed border-slate-300 transition-all duration-500 relative">
                                    <!-- 隔离区标识 -->
                                    <div id="isolation-badge" class="absolute -top-3 -right-3 bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors duration-300">
                                        Standard Flow
                                    </div>
                                    
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                                            <i class="ph-fill ph-code-block text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-bold text-slate-800 m-0">复杂卡片组件</h4>
                                            <p class="text-[11px] text-slate-400 m-0">高频数据更新区</p>
                                        </div>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="h-2 bg-slate-100 rounded w-full"></div>
                                        <div class="h-2 bg-slate-100 rounded w-5/6"></div>
                                        <div class="h-2 bg-slate-100 rounded w-4/6"></div>
                                    </div>
                                </div>
                                
                                <div class="text-xs text-slate-400 mt-4 w-full text-center">👆 兄弟 DOM 节点</div>
                            </div>
                            
                            <!-- 官方组件代码输出区 -->
                            <div>
                                <pre id="code-container"><code class="language-html">
&lt;!-- 通过 Containment 隔离局部重绘 --&gt;
&lt;div class="DYNAMIC_CLASSES_HERE w-full bg-white p-5 rounded-xl"&gt;
    &lt;!-- 内部高频 DOM 变化不会引发全局回流 --&gt;
&lt;/div&gt;
                                </code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：全景原子参考 (Atomic Reference Gallery) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-books text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">隔离策略图鉴 (Strategy Gallery)</cite>
                </div>
                <div class="p-6 md:p-8">
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        <!-- 基础隔离 -->
                        <div class="space-y-4">
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <i class="ph-fill ph-puzzle-piece text-slate-400"></i> 单一隔离维度
                            </h3>
                            ${this.renderRowCard(
                                'contain-layout', 
                                '布局隔离', 
                                '内部元素的排列绝对不会影响外部其它元素的布局（反之亦然）。'
                            )}
                            ${this.renderRowCard(
                                'contain-paint', 
                                '绘制隔离', 
                                '设定渲染死角。子元素如果超出容器，会被直接裁剪而不会渲染。'
                            )}
                            ${this.renderRowCard(
                                'contain-size', 
                                '尺寸隔离', 
                                '无视子元素的内容，容器宽高必须由 CSS 直接写死（例如 h-64）。'
                            )}
                        </div>

                        <!-- 复合隔离 (推荐) -->
                        <div class="space-y-4">
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <i class="ph-fill ph-shield-check text-emerald-500"></i> 复合隔离级别 (实战推荐)
                            </h3>
                            ${this.renderRowCard(
                                'contain-content', 
                                '内容级安全隔离 (常用)', 
                                '<span class="text-amber-600 font-medium">= layout + paint</span>。最安全的万金油选项，适合绝大多数独立的组件区块。'
                            )}
                            ${this.renderRowCard(
                                'contain-strict', 
                                '极限严格隔离 (极客)', 
                                '<span class="text-rose-600 font-medium">= layout + paint + size</span>。最高性能，但如果容器没有显式宽高，容器尺寸会变为 0！'
                            )}
                            ${this.renderRowCard(
                                'contain-none', 
                                '移除隔离', 
                                '清除所有 contain 规则，恢复浏览器标准的文档流瀑布式渲染。'
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：P8 级最佳实践代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-code text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">性能实战：超长列表与复杂面板优化</cite>
                    </div>
                    <div class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">60fps 优化方案</div>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        当页面存在瀑布流、长列表 (Infinite Scroll) 或高频动画时，在每一项的根节点加上 <code>contain-content</code>（如果定高甚至可以加上 <code>contain-strict</code>），可以把由于 DOM 插入引发的全局 Reflow 压缩到仅仅是局部的 Reflow。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 实战 1：虚拟滚动/无限滚动列表中的每一项 --&gt;
&lt;!-- 加上 contain-content 后，这个列表项内部的图片加载/文字折行，绝不会导致外层重排 --&gt;
&lt;ul class="space-y-4"&gt;
    &lt;li class="contain-content bg-white p-4 rounded-lg shadow"&gt;
        &lt;h3&gt;动态新闻标题&lt;/h3&gt;
        &lt;p&gt;很长很长的文本...&lt;/p&gt;
    &lt;/li&gt;
&lt;/ul&gt;

&lt;!-- 实战 2：定宽高的独立微前端挂载点 / 图表 Canvas 容器 --&gt;
&lt;!-- 既然尺寸已经写死，直接上 contain-strict 实现最顶级的渲染隔离 --&gt;
&lt;div class="contain-strict w-[400px] h-[300px] bg-slate-900 rounded-xl" id="echarts-container"&gt;
    &lt;!-- 内部哪怕每秒发生 60 次 Canvas 重绘，也不会让浏览器主线程卡顿 --&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>

        `;
    }

    // 辅助渲染方法：图鉴卡片
    static renderRowCard(cls, title, desc) {
        return `
            <div class="flex flex-col p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/40 hover:shadow-sm transition-all group">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-slate-700 font-bold text-sm">${title}</span>
                    <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">${cls}</code>
                </div>
                <p class="text-[13px] text-slate-500 leading-relaxed">${desc}</p>
            </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：组件绑定与沙盒引擎
    // ==========================================
    static mount(container) {
        // 1. 初始化官方代码高亮插件 (全局生效，继承自你优美的 UI)
        initCodeHighlighter({ showLineNumbers: true, langLabel: true });

        const state = {
            contain: 'contain-none'
        };

        const previewBox = container.querySelector('#preview-box');
        const badge = container.querySelector('#isolation-badge');
        const monitor = container.querySelector('#engine-monitor');
        const codeContainer = container.querySelector('#code-container');
        
        // 状态追踪：完美修复高亮插件代码块替换问题
        let currentDynamicClass = 'DYNAMIC_CLASSES_HERE';

        const updatePlayground = (targetBtn) => {
            const val = state.contain;
            
            // A. 更新模拟器的视觉表现 (移除旧的业务逻辑类名)
            previewBox.className = `w-full max-w-sm bg-white p-5 rounded-xl shadow-sm border-2 border-dashed transition-all duration-500 relative ${val}`;
            
            // 根据不同级别给予不同的视觉暗示
            if (val === 'contain-none') {
                previewBox.classList.add('border-slate-300');
                badge.className = 'absolute -top-3 -right-3 bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors duration-300';
                badge.innerText = 'Standard Flow';
            } else if (val === 'contain-content') {
                previewBox.classList.add('border-amber-400', 'ring-4', 'ring-amber-500/10');
                badge.className = 'absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors duration-300';
                badge.innerHTML = '<i class="ph-fill ph-lock-key"></i> Content Isolated';
            } else if (val === 'contain-strict') {
                previewBox.classList.add('border-rose-500', 'ring-4', 'ring-rose-500/10');
                badge.className = 'absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors duration-300';
                badge.innerHTML = '<i class="ph-fill ph-lightning"></i> Strict Isolated';
            } else {
                previewBox.classList.add('border-primary');
                badge.className = 'absolute -top-3 -right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors duration-300';
                badge.innerText = val.split('-')[1].toUpperCase() + ' Isolated';
            }

            // 更新监控区描述
            if (targetBtn && targetBtn.dataset.desc) {
                monitor.innerText = targetBtn.dataset.desc;
                monitor.classList.add('text-emerald-400');
                setTimeout(() => monitor.classList.remove('text-emerald-400'), 300);
            }

            // B. 外科手术级 DOM 替换：保留高亮插件的 UI，仅替换目标字符串
            const classString = val !== 'contain-none' ? val : ''; // 如果是 none 则代码区显示为空
            
            if (codeContainer) {
                const walker = document.createTreeWalker(
                    codeContainer,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while ((node = walker.nextNode())) {
                    if (node.nodeValue.includes(currentDynamicClass)) {
                        node.nodeValue = node.nodeValue.replace(currentDynamicClass, classString || ' '); // 用空格保底防止完全空掉
                    }
                }
                currentDynamicClass = classString || ' ';
            }
        };

        // 首次初始化
        setTimeout(() => updatePlayground(container.querySelector('[data-val="contain-none"]')), 100);

        // 3. 事件绑定
        const buttons = container.querySelectorAll('.btn-toggle');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.target.closest('.btn-toggle');
                if (!targetBtn) return;
                
                buttons.forEach(b => {
                    b.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                    b.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-600');
                });
                targetBtn.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-600');
                targetBtn.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                state.contain = targetBtn.dataset.val;
                updatePlayground(targetBtn);
            });
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'contain-none', desc: '不应用任何 CSS 渲染隔离' },
            { class: 'contain-strict', desc: '严格隔离（布局+绘制+尺寸），性能极佳但需固定尺寸' },
            { class: 'contain-content', desc: '内容级隔离（布局+绘制），最常用的组件性能优化边界' },
            { class: 'contain-size', desc: '仅隔离尺寸计算（内部元素不影响容器大小）' },
            { class: 'contain-layout', desc: '仅隔离布局计算（内部不影响外部）' },
            { class: 'contain-paint', desc: '仅隔离绘制（超出容器不渲染）' }
        ];

        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'contain'
        }));
    }
}
