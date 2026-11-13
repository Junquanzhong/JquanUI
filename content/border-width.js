// 🚀 Jquan Optimized: Border Width 边框宽度组件文档 (border-width.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class BorderWidthDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>边框</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">边框宽度 (Border Width)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">边框宽度</h1>
                <p class="text-slate-600">使用 <code class="inline-code">border-{width}</code> 及其方向衍生类，精确控制元素每个边界的粗细。它们会占据盒模型的物理空间。</p>
            </div>

            <!-- 🧪 高能实验室：几何边框引擎 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-square-half text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">边缘构造实验室</cite>
                    </div>
                    <span class="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <!-- 左侧：控制面板 -->
                    <div class="lg:col-span-6 flex flex-col gap-6">
                        
                        <!-- 全局边框宽度 -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1"><i class="ph ph-squares-four"></i> 全局宽度 (All Sides)</p>
                            <div class="flex gap-2" id="global-width-controls">
                                <button data-val="border-0" class="global-btn px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-mono text-sm text-slate-600 transition-all">0</button>
                                <button data-val="border" class="global-btn px-4 py-2 rounded-lg border border-primary bg-primary/10 font-mono text-sm text-primary font-bold ring-1 ring-primary/30 is-active transition-all">1px</button>
                                <button data-val="border-2" class="global-btn px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-mono text-sm text-slate-600 transition-all">2px</button>
                                <button data-val="border-4" class="global-btn px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-mono text-sm text-slate-600 transition-all">4px</button>
                                <button data-val="border-8" class="global-btn px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-mono text-sm text-slate-600 transition-all">8px</button>
                            </div>
                        </div>

                        <!-- 局部覆盖控制面板 (十字阵列设计) -->
                        <div class="p-5 bg-slate-800/5 border border-slate-200 rounded-xl relative">
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-4 flex items-center gap-1"><i class="ph ph-crosshair"></i> 局部边界重写 (Overrides)</p>
                            
                            <!-- 可视化十字方向键 -->
                            <div class="w-64 mx-auto relative h-48 flex items-center justify-center">
                                <!-- Top -->
                                <div class="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                                    <span class="block text-[10px] text-slate-400 font-bold mb-1">Top (t)</span>
                                    <select data-dir="t" class="dir-select bg-white border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                                        <option value="">- 无覆盖 -</option>
                                        <option value="0">0px (border-t-0)</option>
                                        <option value="1">1px (border-t)</option>
                                        <option value="2">2px (border-t-2)</option>
                                        <option value="4">4px (border-t-4)</option>
                                        <option value="8">8px (border-t-8)</option>
                                    </select>
                                </div>
                                <!-- Bottom -->
                                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                    <select data-dir="b" class="dir-select bg-white border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                                        <option value="">- 无覆盖 -</option>
                                        <option value="0">0px (border-b-0)</option>
                                        <option value="1">1px (border-b)</option>
                                        <option value="2">2px (border-b-2)</option>
                                        <option value="4">4px (border-b-4)</option>
                                        <option value="8">8px (border-b-8)</option>
                                    </select>
                                    <span class="block text-[10px] text-slate-400 font-bold mt-1">Bottom (b)</span>
                                </div>
                                <!-- Left -->
                                <div class="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
<span class="block writing-vertical-rl rotate-180 text-[10px] font-bold text-slate-400">Left (l)</span>
                                    <select data-dir="l" class="dir-select bg-white border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                                        <option value="">-</option>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="4">4</option>
                                        <option value="8">8</option>
                                    </select>
                                </div>
                                <!-- Right -->
                                <div class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <select data-dir="r" class="dir-select bg-white border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                                        <option value="">-</option>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="4">4</option>
                                        <option value="8">8</option>
                                    </select>
<span class="block writing-vertical-rl text-[10px] font-bold text-slate-400">Right (r)</span>
                                </div>
                                <!-- Center core -->
                                <div class="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-300">
                                    <i class="ph ph-plus"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：演示视窗 -->
                    <div class="lg:col-span-6 flex flex-col items-center justify-center bg-white rounded-xl p-8 border border-slate-100 min-h-[20rem] shadow-inner">
                        
                        <!-- 演示区块：内部文字来证明 border 会压缩内部空间 -->
                        <div id="demo-box" class="w-48 h-48 bg-emerald-50 border-emerald-500 border transition-all duration-300 flex flex-col items-center justify-center p-4 text-center">
                            <span class="text-emerald-700 font-bold mb-1">Content Area</span>
                            <span class="text-[10px] text-emerald-500/70 leading-tight">Observe how thick borders push me inwards.</span>
                        </div>

                        <!-- 实时代码 -->
                        <div class="mt-8 w-full">
                            <div class="mt-8 w-full" id="code-container">
                            <!-- 动态注入代码块 -->
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：最佳实践与代码演示 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">边框宽度最佳实践</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        单侧边框通常在排版布局中发挥奇效，例如：用左边框构建引言，用下边框构建表单分割线。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 示例 1：经典的 Blockquote (左侧加粗强调线) --&gt;
&lt;div class="border-l-4 border-primary bg-primary/5 p-4 rounded-r"&gt;
    &lt;p class="text-slate-700"&gt;"架构的本质是管理复杂性。" -- Jquan&lt;/p&gt;
&lt;/div&gt;

&lt;!-- 示例 2：导航栏 / 列表项的底部分割线 --&gt;
&lt;ul class="flex space-x-6 border-b border-slate-200"&gt;
    &lt;li class="pb-2 border-b-2 border-primary text-primary font-bold"&gt;活跃项&lt;/li&gt;
    &lt;li class="pb-2 text-slate-500 hover:text-slate-800"&gt;普通项&lt;/li&gt;
&lt;/ul&gt;

&lt;!-- 示例 3：卡片顶部高亮提示条 --&gt;
&lt;div class="border-t-4 border-rose-500 bg-white shadow-md p-5 rounded"&gt;
    &lt;h4 class="text-rose-600 font-bold"&gt;警告信息&lt;/h4&gt;
    &lt;p class="text-sm text-slate-500"&gt;您的数据库即将被 Jquan 格式化。&lt;/p&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">边框宽度字典 (Border Width Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">类名 (Class)</th>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">CSS 属性</th>
                                <th class="px-6 py-3 font-medium tracking-wide">作用域与场景</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">border-0</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">border-width: 0px;</span></td>
                                <td class="px-6 py-4 text-slate-600">移除所有方向的边框。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">border</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">border-width: 1px;</span></td>
                                <td class="px-6 py-4 text-slate-600">默认的 1px 发丝边框，UI 界面中最常用的分割线厚度。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">border-{2|4|8}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">border-width: 2/4/8px;</span></td>
                                <td class="px-6 py-4 text-slate-600">更粗的加重边框，常用于强调焦点状态或特殊的高亮面板。</td>
                            </tr>
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">单向修饰符 (t, r, b, l)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-sky-600 whitespace-nowrap">border-t-{size}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-sky-50 text-sky-700 px-2 py-1 rounded text-xs font-mono">border-top-width: ...</span></td>
                                <td class="px-6 py-4 text-slate-600">仅设置<strong>顶部</strong>边框宽度。常用于列表项之间的横线分割。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-sky-600 whitespace-nowrap">border-l-{size}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-sky-50 text-sky-700 px-2 py-1 rounded text-xs font-mono">border-left-width: ...</span></td>
                                <td class="px-6 py-4 text-slate-600">仅设置<strong>左侧</strong>边框宽度。配合高亮颜色，常用于“引言（Blockquote）”的左侧修饰线。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        initCodeHighlighter({ showLineNumbers: true, langLabel: true });

        const demoBox = container.querySelector('#demo-box');
        const codeDisplay = container.querySelector('#code-display');
        
        let globalClass = 'border';
        let overrides = { t: '', r: '', b: '', l: '' };

        const updateBox = () => {
            // 清理旧的 border 类
            demoBox.className = 'w-48 h-48 bg-emerald-50 border-emerald-500 transition-all duration-300 flex flex-col items-center justify-center p-4 text-center';
            
            // 构建需要应用的 border class
            const classesToApply = [globalClass];
            if (overrides.t) classesToApply.push(overrides.t === '1' ? 'border-t' : `border-t-${overrides.t}`);
            if (overrides.r) classesToApply.push(overrides.r === '1' ? 'border-r' : `border-r-${overrides.r}`);
            if (overrides.b) classesToApply.push(overrides.b === '1' ? 'border-b' : `border-b-${overrides.b}`);
            if (overrides.l) classesToApply.push(overrides.l === '1' ? 'border-l' : `border-l-${overrides.l}`);
            demoBox.classList.add(...classesToApply);
            
            // 构建完整的 HTML 结构并交由代码块组件接管
            const classStr = classesToApply.join(' ');
            const htmlSnippet = `&lt;div class="border-emerald-500 ${classStr}"&gt;...&lt;/div&gt;`;
            
            container.querySelector('#code-container').innerHTML = `
                <pre><code class="language-html">${htmlSnippet}</code></pre>
            `;
            // 重新触发高亮引擎
            initCodeHighlighter({ showLineNumbers: false, langLabel: true });
        };

        // 全局宽度逻辑
        const globalBtns = container.querySelectorAll('.global-btn');
        globalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                
                // 样式重置
                globalBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'font-bold', 'ring-1', 'ring-primary/30', 'is-active');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                });
                
                // 激活样式
                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                target.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'font-bold', 'ring-1', 'ring-primary/30', 'is-active');
                
                globalClass = target.dataset.val;
                updateBox();
            });
        });

        // 局部覆盖逻辑
        const dirSelects = container.querySelectorAll('.dir-select');
        dirSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const target = e.currentTarget;
                const dir = target.dataset.dir;
                overrides[dir] = target.value;
                updateBox();
            });
        });
        updateBox();
    }

    static async onSearch(keyword) {
        return [{ title: 'border-width', desc: '控制边框粗细', actionValue: 'border-width' }];
    }
}
