// 🚀 Jquan Minimalist Edition: Layout Display 显示类型 (display.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutDisplayDoc {
    static render() {
        // ==========================================
        // 🛠️ 架构级拆分：核心类 vs 高级/表格类
        // ==========================================
        
        // 表 1：核心显示类型 (高频使用)
        const coreDisplayTypes = [
            { class: 'block', css: 'display: block;', desc: '独占一行，可设置宽高。' },
            { class: 'inline-block', css: 'display: inline-block;', desc: '并排显示，但可以设置宽高、边距。' },
            { class: 'inline', css: 'display: inline;', desc: '并排显示，不接受宽高，只占据内容本身空间。' },
            { class: 'flex', css: 'display: flex;', desc: '块级弹性盒子，极强的内部排版能力。' },
            { class: 'inline-flex', css: 'display: inline-flex;', desc: '内联弹性盒子，可与其他内联元素并排。' },
            { class: 'grid', css: 'display: grid;', desc: '块级网格容器，二维排版之王。' },
            { class: 'inline-grid', css: 'display: inline-grid;', desc: '内联网格容器。' },
            { class: 'hidden', css: 'display: none;', desc: '元素及其内容完全从渲染树中移除。' }
        ];

        // 表 2：高级排版与表格系统 (低频/特定场景)
        const advancedDisplayTypes = [
            { class: 'table', css: 'display: table;', desc: '行为类似 &lt;table&gt; 元素。' },
            { class: 'table-row', css: 'display: table-row;', desc: '行为类似 &lt;tr&gt; 元素。' },
            { class: 'table-cell', css: 'display: table-cell;', desc: '行为类似 &lt;td&gt; 元素。' },
            { class: 'contents', css: 'display: contents;', desc: '自身不产生盒模型，其子元素直接参与父级布局 (神级属性，用于穿透多余标签)。' },
            { class: 'list-item', css: 'display: list-item;', desc: '行为类似 &lt;li&gt; 元素。' },
            { class: 'flow-root', css: 'display: flow-root;', desc: '创建一个新的块级格式化上下文 (BFC)，完美清除内部浮动，拒绝 margin 塌陷。' }
        ];

        const generateTableRows = (types) => types.map(item => `
            <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-5 w-1/4"><code class="inline-code">${item.class}</code></td>
                <td class="py-3 px-5 w-1/4"><code class="inline-code">${item.css}</code></td>
                <td class="py-3 px-5 text-sm text-slate-600 leading-relaxed w-1/2">${item.desc}</td>
            </tr>
        `).join('');

        return `
        <div class="container pb-12">
            <!-- 面包屑 -->
            <ul class="flex items-center text-xs text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">显示类型 (Display)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-slate-800 tracking-tight mb-2">显示类型</h1>
                <p class="text-sm text-slate-500">
                    控制元素生成何种类型的显示框。支持响应式断点前缀，是构建网页流式布局的绝对基石。
                </p>
            </div>

            <!-- 🎨 模块 1：核心演示沙盒 -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">盒模型行为沙盒</cite>
                    </div>
                    
                    <!-- 交互控制器 -->
                    <div class="flex flex-wrap gap-2" id="display-controls">
                        <button data-display="block" class="disp-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-primary text-white bg-primary shadow-sm transition-all">block</button>
                        <button data-display="inline-block" class="disp-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:border-primary/40 hover:text-peace transition-all">inline-block</button>
                        <button data-display="inline" class="disp-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:border-primary/40 hover:text-peace transition-all">inline</button>
                        <button data-display="hidden" class="disp-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:border-rose-400 hover:text-rose-500 transition-all">hidden</button>
                    </div>
                </div>

                <div class="p-6 md:p-8">
                    <p class="mb-5 max-w-3xl text-sm leading-relaxed text-slate-600">选择一个 display 原子类，三个同级盒子会立即改变占位方式。日常布局优先使用 <code class="inline-code">flex</code> 或 <code class="inline-code">grid</code>；只有需要控制元素参与文档流的方式时，再选择 block、inline-block、inline 或 hidden。</p>
                    <!-- 视口展示区：用明显的边框和底色展现盒子的实际占位 -->
                    <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                        <div class="text-[10px] text-slate-400 absolute top-2 left-3 uppercase tracking-widest font-bold">Parent Container</div>
                        
                        <!-- 演示元素 -->
                        <div class="mt-4 p-4 border border-slate-200 bg-slate-50/50 rounded-lg leading-relaxed text-sm text-slate-600">
                            这是前置的文本内容，用来对比流式排版。
                            
                            <!-- 动态切换目标的方块 -->
                            <div id="demo-box-1" class="block w-24 h-12 bg-primary/10 border border-primary text-primary font-bold rounded flex items-center justify-center m-1 shadow-sm transition-all duration-300">
                                1
                            </div>
                            <div id="demo-box-2" class="block w-24 h-12 bg-primary/10 border border-primary text-primary font-bold rounded flex items-center justify-center m-1 shadow-sm transition-all duration-300">
                                2
                            </div>
                            <div id="demo-box-3" class="block w-24 h-12 bg-primary/10 border border-primary text-primary font-bold rounded flex items-center justify-center m-1 shadow-sm transition-all duration-300">
                                3
                            </div>

                            这是后置的文本内容，你可以观察盒子是如何将这些文本推开，或是与它们并排行走的。
                        </div>
                    </div>
                    <div class="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
                        <span id="display-behavior" class="text-sm font-medium text-slate-600">block：每个盒子独占一行。</span>
                    <div class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 sm:text-right"><span class="text-slate-400">class</span> = <code id="display-live-code" class="text-primary">"block"</code></div>
                    </div>
                </div>
            </div>

            <!-- 💡 模块 2：响应式高频用法 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-devices text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">响应式显示 (Responsive Display)</cite>
                </div>
                <div class="p-6">
                    <p class="text-sm text-slate-600 mb-4 leading-relaxed">
                        这是最常见的使用场景：在手机上隐藏某个侧边栏，而在桌面端显示。通过 <code class="inline-code">hidden md:block</code> 即可极简实现。
                    </p>
                    <div class="rounded-lg overflow-hidden">
                        <pre><code class="language-html text-sm">
&lt;!-- 移动端不可见，屏幕 >= 768px 时显示为块级元素 --&gt;
&lt;div class="hidden md:block"&gt;
    PC端导航栏
&lt;/div&gt;

&lt;!-- 移动端采用 flex 布局，桌面端改为 grid 布局 --&gt;
&lt;div class="flex flex-col lg:grid lg:grid-cols-3"&gt;
    &lt;div&gt;内容模块&lt;/div&gt;
&lt;/div&gt;
                        </code></pre>
                    </div>
                </div>
            </div>

            <!-- 📋 模块 3：核心显示类型表格 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-primary rounded-full inline-block"></span>
                    <cite class="font-bold text-slate-800 not-italic">核心盒模型 (Core)</cite>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white border-b border-slate-200">
                                <th class="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">类名 (Class)</th>
                                <th class="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">CSS 属性</th>
                                <th class="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateTableRows(coreDisplayTypes)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 模块 4：高级排版与表格系统 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <span class="w-1.5 h-4 bg-slate-400 rounded-full inline-block"></span>
                    <cite class="font-bold text-slate-800 not-italic">高级排版 & 表格 (Advanced & Table)</cite>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white border-b border-slate-200">
                                <th class="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">类名 (Class)</th>
                                <th class="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">CSS 属性</th>
                                <th class="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateTableRows(advancedDisplayTypes)}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：沙盒交互
    // ==========================================
    static mount(container) {
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        const buttons = container.querySelectorAll('.disp-btn');
        const boxes = [
            container.querySelector('#demo-box-1'),
            container.querySelector('#demo-box-2'),
            container.querySelector('#demo-box-3')
        ];
        const code = container.querySelector('#display-live-code');
        const behavior = container.querySelector('#display-behavior');
        const descriptions = {
            block: 'block：每个盒子独占一行，可设置宽高。',
            'inline-block': 'inline-block：盒子并排，但仍可设置宽高。',
            inline: 'inline：内容随文本流同行，宽高不生效。',
            hidden: 'hidden：盒子从渲染树移除，不再占据空间。'
        };

        if (buttons.length > 0 && boxes[0]) {
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetDisplay = e.target.dataset.display;

                    // 1. 切换按钮状态
                    buttons.forEach(b => {
                        b.classList.remove('border-primary', 'text-white', 'bg-primary', 'border-rose-500', 'bg-rose-500');
                        b.classList.add('border-slate-200', 'text-slate-600', 'bg-white');
                    });
                    
                    if (targetDisplay === 'hidden') {
                        e.target.classList.remove('border-slate-200', 'text-slate-600', 'bg-white');
                        e.target.classList.add('border-rose-500', 'text-white', 'bg-rose-500');
                    } else {
                        e.target.classList.remove('border-slate-200', 'text-slate-600', 'bg-white');
                        e.target.classList.add('border-primary', 'text-white', 'bg-primary');
                    }

                    // 2. 实时驱动引擎更新类名
                    boxes.forEach(box => {
                        if (!box) return;
                        box.classList.remove('block', 'inline-block', 'inline', 'hidden');
                        box.classList.add(targetDisplay);
                    });
                    if (code) code.textContent = `"${targetDisplay}"`;
                    if (behavior) behavior.textContent = descriptions[targetDisplay] || targetDisplay;
                });
            });
        }
    }

    static async onSearch(keyword) {
        const displayClasses = ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'hidden', 'contents', 'table', 'table-row', 'table-cell', 'flow-root'];
        const matched = displayClasses.filter(cls => cls.includes(keyword.toLowerCase()));
        
        return matched.map(cls => ({
            title: cls,
            desc: `设置元素的显示类型为 ${cls}`,
            actionValue: 'display'
        }));
    }
}
