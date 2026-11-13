// 🚀 Jquan Optimized: Border Radius 边框圆角组件文档 (border-radius.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class BorderRadiusDoc {
    static render() {
        return `
        <div class="container pb-10">
            <p class="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">项目圆角在 Core 前配置 theme.extend.borderRadius，例如 { card: '18px' }，使用 rounded-card、rounded-t-card 或 rounded-ss-card；DEFAULT 对应 rounded。radius 是兼容别名，同层 borderRadius 优先，extend 覆盖 theme 同名项。非法项见 JquanUI.debug().configWarnings；完整参数和示例见“主题与暗黑模式”。</p>
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>边框</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">边框圆角 (Border Radius)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">边框圆角</h1>
                <p class="text-slate-600">利用 <code class="inline-code">rounded-*</code> 工具类，控制元素的边框圆角弧度，支持全局统一设置以及单向局部覆盖（甚至精确到某一个角）。</p>
            </div>

            <!-- 🧪 高能实验室：曲率引擎 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">曲率组合实验室</cite>
                    </div>
                    <span class="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <!-- 左侧：控制面板 -->
                    <div class="lg:col-span-6 flex flex-col gap-6">
                        
                        <!-- 基础圆角大小 -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">基础曲率 (Base Radius)</p>
                            <div class="flex flex-wrap gap-2" id="radius-controls">
                                <button data-val="rounded-none" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">none</button>
                                <button data-val="rounded-sm" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">sm</button>
                                <button data-val="rounded" class="radius-btn px-3 py-1.5 rounded border border-primary bg-primary/5 text-primary text-xs font-mono font-bold is-active ring-1 ring-primary/30 transition-all">DEFAULT</button>
                                <button data-val="rounded-md" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">md</button>
                                <button data-val="rounded-lg" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">lg</button>
                                <button data-val="rounded-xl" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">xl</button>
                                <button data-val="rounded-2xl" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">2xl</button>
                                <button data-val="rounded-3xl" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">3xl</button>
                                <button data-val="rounded-full" class="radius-btn px-3 py-1.5 rounded border border-slate-200 bg-white hover:border-primary/50 text-xs font-mono font-medium text-slate-600 transition-all">full</button>
                            </div>
                        </div>

                        <!-- 局部禁用控制 (Jquan：已统一为 Primary 色系) -->
                        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1">
                                <i class="ph ph-scissors"></i> 局部切角 (Disable Corner)
                            </p>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-[10px] text-slate-400 mb-2">上/下/左/右 (单边)</p>
                                    <div class="flex flex-wrap gap-1" id="disable-side-controls">
                                        <button data-disable="rounded-t-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-t-none</button>
                                        <button data-disable="rounded-b-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-b-none</button>
                                        <button data-disable="rounded-l-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-l-none</button>
                                        <button data-disable="rounded-r-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-r-none</button>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[10px] text-slate-400 mb-2">精确角点 (单角)</p>
                                    <div class="flex flex-wrap gap-1" id="disable-corner-controls">
                                        <button data-disable="rounded-tl-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-tl-none</button>
                                        <button data-disable="rounded-tr-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-tr-none</button>
                                        <button data-disable="rounded-bl-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-bl-none</button>
                                        <button data-disable="rounded-br-none" class="disable-btn w-full text-left px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-mono text-slate-500 transition-all">rounded-br-none</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：演示视窗 -->
                    <div class="lg:col-span-6 flex flex-col items-center justify-center bg-slate-800/5 rounded-xl p-8 border border-slate-100 relative min-h-[16rem]">
                        <!-- 演示区块 -->
                        <div id="demo-box" class="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl transition-all duration-300 rounded flex items-center justify-center overflow-hidden relative group border border-indigo-400/30">
                            <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span class="text-white/90 font-bold tracking-widest uppercase text-sm z-10 drop-shadow-sm">JquanUI</span>
                        </div>

                        <!-- 实时代码 -->
                        <div class="mt-6 w-full">
                            <div class="mt-6 w-full" id="code-container">
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
                    <cite class="font-bold text-slate-800 not-italic">边框圆角最佳实践</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        通过巧妙地组合基础圆角与单边去除（<code class="inline-code">rounded-*-none</code>），可以轻松实现输入框与按钮的无缝拼接等高级 UI 组件。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 示例 1：用户头像 (绝对圆形) --&gt;
&lt;img class="w-12 h-12 rounded-full object-cover" src="avatar.jpg" alt="Avatar"&gt;

&lt;!-- 示例 2：现代化卡片 (大圆角) --&gt;
&lt;div class="rounded-2xl shadow-lg border border-slate-100 bg-white p-6"&gt;
    &lt;h3 class="text-lg font-bold"&gt;JquanUI Card&lt;/h3&gt;
&lt;/div&gt;

&lt;!-- 示例 3：输入框组合拼接 (左侧输入框去除右圆角，右侧按钮去除左圆角) --&gt;
&lt;div class="flex"&gt;
    &lt;input type="text" class="border border-slate-300 rounded-l-md px-4 py-2 focus:outline-none" placeholder="Search..."&gt;
    &lt;button class="bg-primary text-white rounded-r-md px-4 py-2 hover:bg-primary-dark"&gt;Go&lt;/button&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">边框圆角字典 (Border Radius Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">类名 (Class)</th>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">CSS 属性</th>
                                <th class="px-6 py-3 font-medium tracking-wide">视觉效果描述</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">rounded-none</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">border-radius: 0px;</span></td>
                                <td class="px-6 py-4 text-slate-600">无圆角，绝对硬朗的直角。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">rounded</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">border-radius: 0.25rem;</span></td>
                                <td class="px-6 py-4 text-slate-600">默认圆角，提供微妙的柔和感。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">rounded-md / lg / xl</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">border-radius: ...;</span></td>
                                <td class="px-6 py-4 text-slate-600">递增的圆角曲率，常用于现代卡片、浮窗、模态框设计。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">rounded-full</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">border-radius: 9999px;</span></td>
                                <td class="px-6 py-4 text-slate-600">胶囊形或完全正圆（当宽高相等时）。常用于用户头像、徽章、药丸按钮。</td>
                            </tr>
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">局部方向禁用修饰符 (可叠加)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">rounded-{t|r|b|l}-none</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/5 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-mono">border-*-radius: 0;</span></td>
                                <td class="px-6 py-4 text-slate-600">禁用<strong>上/右/下/左</strong>单侧的两个圆角。常用于输入框与按钮组合拼接的场景。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">rounded-{tl|tr|bl|br}-none</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/5 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-mono">border-*-radius: 0;</span></td>
                                <td class="px-6 py-4 text-slate-600">精确禁用<strong>某个单一角点</strong>。</td>
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
        
        let currentBase = 'rounded';
        let disabledCorners = new Set();

        const updateBox = () => {
            // 清理旧的 class
            demoBox.className = 'w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden relative group border border-indigo-400/30';
            
            // 应用当前状态
            const classesToApply = [currentBase, ...Array.from(disabledCorners)];
            demoBox.classList.add(...classesToApply);
            
            // 构建完整的 HTML 结构并交由代码块组件接管
            const classStr = classesToApply.join(' ');
            const htmlSnippet = `&lt;div class="${classStr}"&gt;...&lt;/div&gt;`;
            
            container.querySelector('#code-container').innerHTML = `
                <pre><code class="language-html">${htmlSnippet}</code></pre>
            `;
            // 重新触发高亮引擎 (如果已有静态代码块则一并解析，体现组件引擎的自适应性)
            initCodeHighlighter({ showLineNumbers: false, langLabel: true });
        };

        // 基础曲率逻辑
        const radiusBtns = container.querySelectorAll('.radius-btn');
        radiusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                radiusBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/5', 'text-primary', 'font-bold', 'is-active', 'ring-1', 'ring-primary/30');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600', 'font-medium');
                });
                
                const target = e.currentTarget;
                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600', 'font-medium');
                target.classList.add('border-primary', 'bg-primary/5', 'text-primary', 'font-bold', 'is-active', 'ring-1', 'ring-primary/30');
                
                currentBase = target.dataset.val;
                updateBox();
            });
        });

        // 局部切角逻辑 (支持多选，Jquan 严谨修正主题色一致性)
        const disableBtns = container.querySelectorAll('.disable-btn');
        disableBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const val = target.dataset.disable;
                
                if (disabledCorners.has(val)) {
                    disabledCorners.delete(val);
                    target.classList.remove('bg-primary/5', 'border-primary/20', 'text-primary', 'font-bold');
                    target.classList.add('bg-white', 'border-slate-200', 'text-slate-500');
                } else {
                    disabledCorners.add(val);
                    target.classList.remove('bg-white', 'border-slate-200', 'text-slate-500');
                    target.classList.add('bg-primary/5', 'border-primary/20', 'text-primary', 'font-bold');
                }
                updateBox();
            });
        });
        updateBox();
    }
    

    static async onSearch(keyword) {
        return [{ title: 'rounded', desc: '边框圆角设置', actionValue: 'border-radius' }];
    }
}
