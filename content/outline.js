// 🚀 Jquan Optimized: Outline 轮廓组件文档 (outline.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class OutlineDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>边框</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">轮廓 (Outline & Ring)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">焦点轮廓</h1>
                <p class="text-slate-600">使用 <code class="inline-code">outline-*</code> 系列工具类，在外围绘制不占据盒模型物理空间的轮廓线。这是实现无障碍访问（a11y）中 Focus 状态的核心组件。</p>
            </div>

            <!-- 🧪 高能实验室：光环发生器 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-target text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">悬浮光环实验室</cite>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-2">
                        <span class="hidden rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-flex">Interactive</span>
                        <span class="hidden rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 lg:inline-flex">💡 轮廓不会挤开旁边内容</span>
                    </div>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <!-- 左侧：控制面板 -->
                    <div class="lg:col-span-5 flex flex-col gap-6">
                        
                        <!-- 尺寸控制 -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1"><i class="ph ph-arrows-out"></i> 尺寸 (Size)</p>
                            <div class="flex gap-2" id="size-controls">
                                <button data-val="outline-0" class="control-btn size-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">0</button>
                                <button data-val="outline-1" class="control-btn size-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">1</button>
                                <button data-val="outline-2" class="control-btn size-btn px-3 py-1.5 rounded border border-primary bg-primary/10 font-mono text-xs text-primary font-bold ring-1 ring-primary/30 is-active transition-all">2</button>
                                <button data-val="outline-4" class="control-btn size-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">4</button>
                                <button data-val="outline-8" class="control-btn size-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">8</button>
                            </div>
                        </div>

                        <!-- 样式控制 -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1"><i class="ph ph-paint-brush"></i> 样式 (Style)</p>
                            <div class="grid grid-cols-3 gap-2" id="style-controls">
                                <button data-val="outline-none" class="control-btn style-btn px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-[11px] text-slate-600 transition-all">none</button>
                                <button data-val="outline-solid" class="control-btn style-btn px-2 py-1.5 rounded border border-primary bg-primary/10 font-mono text-[11px] text-primary font-bold ring-1 ring-primary/30 is-active transition-all">solid</button>
                                <button data-val="outline-dashed" class="control-btn style-btn px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-[11px] text-slate-600 transition-all">dashed</button>
                                <button data-val="outline-dotted" class="control-btn style-btn px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-[11px] text-slate-600 transition-all">dotted</button>
                                <button data-val="outline-double" class="control-btn style-btn px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-[11px] text-slate-600 transition-all">double</button>
                                <!-- Jquan 兼容拓展：原版环轮廓 -->
                                <button data-val="outline-ring" class="control-btn style-btn px-2 py-1.5 rounded border border-amber-200 bg-amber-50 font-mono text-[11px] text-amber-600 hover:bg-amber-100 transition-all relative group">
                                    ring
                                    <span class="absolute -top-1 -right-1 flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>
                                </button>
                            </div>
                        </div>

                        <!-- 偏移量控制 -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1"><i class="ph ph-arrows-out-line-horizontal"></i> 偏移量 (Offset)</p>
                            <div class="flex gap-2" id="offset-controls">
                                <button data-val="outline-offset-0" class="control-btn offset-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">0</button>
                                <button data-val="outline-offset-1" class="control-btn offset-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">1</button>
                                <button data-val="outline-offset-2" class="control-btn offset-btn px-3 py-1.5 rounded border border-primary bg-primary/10 font-mono text-xs text-primary font-bold ring-1 ring-primary/30 is-active transition-all">2</button>
                                <button data-val="outline-offset-4" class="control-btn offset-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">4</button>
                                <button data-val="outline-offset-8" class="control-btn offset-btn px-3 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-600 transition-all">8</button>
                            </div>
                        </div>

                    </div>

                    <!-- 右侧：演示视窗 -->
                    <div class="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-8 border border-slate-200 min-h-[22rem]">
                        
                        <!-- 对比展示区 -->
                        <div class="flex items-center gap-1">
                            <!-- 左侧静止参照物 -->
                            <div class="w-16 h-12 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-white text-slate-300 text-xs">邻居</div>
                            
                            <!-- 被操纵的目标按钮 -->
                            <!-- Jquan 架构细节：利用 outline-indigo-500 将轮廓颜色定死，方便演示 -->
                            <button id="demo-box" class="px-6 py-3 bg-indigo-600 text-white font-bold rounded shadow outline-indigo-500 transition-all outline-2 outline-solid outline-offset-2 hover:bg-indigo-700">
                                Focus Me
                            </button>

                            <!-- 右侧静止参照物 -->
                            <div class="w-16 h-12 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-white text-slate-300 text-xs">邻居</div>
                        </div>
                        
                        <!-- 实时代码 -->
                        <div class="mt-12 w-full">
                            <div class="mt-12 w-full" id="code-container">
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
                    <cite class="font-bold text-slate-800 not-italic">无障碍交互 (A11y) 最佳实践</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        轮廓通常不会一直显示。现代 Web 开发中，我们会去除浏览器丑陋的默认黑框，并结合伪类（如 <code class="inline-code">focus:</code> 或 <code class="inline-code">focus-visible:</code>）在用户使用键盘 Tab 键导航时，渲染出符合品牌调性的优雅光环。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 示例 1：安全的 Focus 光环（键盘导航时出现向外扩张的轮廓） --&gt;
&lt;button class="bg-primary text-white px-4 py-2 rounded focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"&gt;
    提交表单
&lt;/button&gt;

&lt;!-- 示例 2：输入框的 Ring 光环方案（使用 outline-ring 模拟内部发光阴影） --&gt;
&lt;input type="text" class="border border-slate-300 rounded px-3 py-2 focus:outline-none focus:outline-ring focus:ring-primary/50" placeholder="请输入..."&gt;

&lt;!-- 示例 3：卡片 Focus 状态（常用于可点击的链接卡片） --&gt;
&lt;a href="#" class="block p-4 border rounded hover:bg-slate-50 focus:outline-dashed focus:outline-2 focus:outline-primary focus:outline-offset-4"&gt;
    &lt;h3&gt;访问 Jquan 实验室&lt;/h3&gt;
&lt;/a&gt;
                    </code></pre>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">轮廓字典 (Outline Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">类名 (Class)</th>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">CSS 属性</th>
                                <th class="px-6 py-3 font-medium tracking-wide">架构师解析</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <!-- 基础样式 -->
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">基础样式 (Style)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">outline-none</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">outline: 2px solid transparent;</span></td>
                                <td class="px-6 py-4 text-slate-600">移除浏览器丑陋的原生焦点边框（注意：出于无障碍考虑，底层仍会保留透明轮廓）。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">outline-{solid|dashed|dotted}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">outline-style: ...</span></td>
                                <td class="px-6 py-4 text-slate-600">设置轮廓的线型。最常见的是 solid 实线。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-amber-500 whitespace-nowrap">outline-ring (特色)</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-mono">box-shadow: 0 0 0 ...</span></td>
                                <td class="px-6 py-4 text-slate-600">利用 Box-shadow 模拟的极度柔和光环，高级感拉满。支持 <code class="text-xs text-amber-500">inset / outset</code> 方向衍生。</td>
                            </tr>

                            <!-- 尺寸 -->
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">尺寸厚度 (Size)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">outline-{0|1|2|4|8}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">outline-width: ...</span></td>
                                <td class="px-6 py-4 text-slate-600">设置轮廓线的厚度（0px ~ 8px）。</td>
                            </tr>

                            <!-- 偏移 -->
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">偏移间距 (Offset)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-sky-600 whitespace-nowrap">outline-offset-{0|1|2|4|8}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-sky-50 text-sky-700 px-2 py-1 rounded text-xs font-mono">outline-offset: ...</span></td>
                                <td class="px-6 py-4 text-slate-600">神级属性！将轮廓向外推移一定距离，产生“悬浮光环”效果，且绝不会影响邻居元素的排版！</td>
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
        
        let currentState = {
            size: 'outline-2',
            style: 'outline-solid',
            offset: 'outline-offset-2'
        };

        const updateBox = () => {
            // 清理旧类名 (保留基础 UI 类)
            demoBox.className = 'px-6 py-3 bg-indigo-600 text-white font-bold rounded shadow outline-indigo-500 transition-all hover:bg-indigo-700';
            
            // 添加新类名
            const classesToApply = [currentState.size, currentState.style, currentState.offset];
            demoBox.classList.add(...classesToApply);
            
            // 构建完整的 HTML 结构并交由代码块组件接管
            const classStr = classesToApply.join(' ');
            const htmlSnippet = `&lt;button class="outline-indigo-500 ${classStr}"&gt;\n  Focus Me\n&lt;/button&gt;`;
            
            container.querySelector('#code-container').innerHTML = `
                <pre><code class="language-html">${htmlSnippet}</code></pre>
            `;
            // 重新触发高亮引擎
            initCodeHighlighter({ showLineNumbers: false, langLabel: true });
        };


        // 绑定公共控制器逻辑
        const bindControls = (selector, stateKey) => {
            const btns = container.querySelectorAll(selector);
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // 重置该组所有按钮样式
                    btns.forEach(b => {
                        b.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'font-bold', 'ring-1', 'ring-primary/30', 'is-active');
                        // 特殊处理琥珀色 ring 按钮
                        if(!b.classList.contains('text-amber-600')) {
                            b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                        }
                    });
                    
                    const target = e.currentTarget;
                    if(!target.classList.contains('text-amber-600')) {
                        target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                        target.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'font-bold', 'ring-1', 'ring-primary/30', 'is-active');
                    }
                    
                    currentState[stateKey] = target.dataset.val;
                    updateBox();
                });
            });
        };

        bindControls('.size-btn', 'size');
        bindControls('.style-btn', 'style');
        bindControls('.offset-btn', 'offset');
        updateBox();
    }

    static async onSearch(keyword) {
        return [{ title: 'outline', desc: '焦点轮廓与光环', actionValue: 'outline' }];
    }
}
