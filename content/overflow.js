// 🚀 Jquan Optimized: Layout Overflow 溢出控制组件文档 (overflow.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutOverflowDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">溢出控制 (Overflow)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">溢出控制</h1>
                <p class="text-slate-600">
                    当子元素的内容或尺寸超出其父级容器的边界时，使用 <code class="inline-code">overflow-*</code> 系列工具类来精准调度浏览器的渲染策略。支持全局双轴控制，以及 X 轴 / Y 轴的独立拆分控制。
                </p>
            </div>

            <!-- 🧪 高能实验室：双轴溢出控制台 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-intersect-square text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">双轴溢出实验室</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <!-- 左侧：控制面板 -->
                    <div class="lg:col-span-5 flex flex-col gap-8">
                        
                        <!-- 水平 (X轴) 控制 -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                                    <i class="ph ph-arrows-out-line-horizontal text-sky-500"></i> 水平溢出 (X轴)
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-2" id="x-controls">
                                <button data-axis="x" data-val="overflow-x-visible" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-400 hover:text-sky-600 transition-all text-xs font-mono font-medium text-slate-600">visible</button>
                                <button data-axis="x" data-val="overflow-x-hidden" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-400 hover:text-sky-600 transition-all text-xs font-mono font-medium text-slate-600">hidden</button>
                                <button data-axis="x" data-val="overflow-x-auto" class="axis-btn px-3 py-1.5 rounded-lg border border-sky-500 bg-sky-50 ring-1 ring-sky-300 text-sky-700 transition-all text-xs font-mono font-bold is-active">auto</button>
                                <button data-axis="x" data-val="overflow-x-scroll" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-400 hover:text-sky-600 transition-all text-xs font-mono font-medium text-slate-600">scroll</button>
                                <button data-axis="x" data-val="overflow-x-clip" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-400 hover:text-sky-600 transition-all text-xs font-mono font-medium text-slate-600">clip</button>
                            </div>
                        </div>

                        <!-- 垂直 (Y轴) 控制 -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                                    <i class="ph ph-arrows-out-line-vertical text-indigo-500"></i> 垂直溢出 (Y轴)
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-2" id="y-controls">
                                <button data-axis="y" data-val="overflow-y-visible" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all text-xs font-mono font-medium text-slate-600">visible</button>
                                <button data-axis="y" data-val="overflow-y-hidden" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all text-xs font-mono font-medium text-slate-600">hidden</button>
                                <button data-axis="y" data-val="overflow-y-auto" class="axis-btn px-3 py-1.5 rounded-lg border border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300 text-indigo-700 transition-all text-xs font-mono font-bold is-active">auto</button>
                                <button data-axis="y" data-val="overflow-y-scroll" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all text-xs font-mono font-medium text-slate-600">scroll</button>
                                <button data-axis="y" data-val="overflow-y-clip" class="axis-btn px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all text-xs font-mono font-medium text-slate-600">clip</button>
                            </div>
                        </div>

                        <!-- 组合状态提示 -->
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm mt-4">
                            <span class="text-slate-500 block mb-2 text-xs font-bold uppercase">当前容器类名：</span>
                            <div class="font-mono text-primary font-bold flex items-center gap-2">
                                <span id="code-x">overflow-x-auto</span> 
                                <span class="text-slate-300">+</span> 
                                <span id="code-y">overflow-y-auto</span>
                            </div>
                            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                                💡 提示：<code class="text-slate-600">scroll</code> 在 Windows 会强制显示滚动条槽，而 <code class="text-slate-600">auto</code> 只有在溢出时才显示。
                            </p>
                        </div>
                    </div>

                    <!-- 右侧：演示视窗 -->
                    <div class="lg:col-span-7 flex flex-col items-center justify-center bg-slate-800/5 rounded-xl p-6 border border-slate-100 min-h-[24rem]">
                        
                        <!-- 受到控制的父容器 (相对较小) -->
                        <div id="demo-container" class="relative w-64 h-48 bg-white border-2 border-primary shadow-xl overflow-x-auto overflow-y-auto transition-shadow duration-300">
                            
                            <!-- 标签 -->
                            <div class="sticky top-0 left-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 uppercase z-10 w-max shadow-sm">
                                限制容器 (256x192)
                            </div>

                            <!-- 故意撑爆容器的超大子元素 -->
                            <div class="w-[400px] h-[300px] bg-[repeating-conic-gradient(#f8fafc_0_25%,transparent_0_50%)] bg-[length:20px_20px] p-4 text-sm text-slate-500 border border-dashed border-slate-300 m-2 relative">
                                <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                    <i class="ph-fill ph-warning-circle text-[10rem] text-rose-500"></i>
                                </div>
                                <p class="relative z-10 font-bold text-slate-800 mb-2 whitespace-nowrap">🔥 我是一个尺寸为 400x300 的超级大盒子！</p>
                                <p class="relative z-10 whitespace-nowrap text-rose-500 font-mono text-xs">如果不做控制，我就会不可逆转地溢出边界...</p>
                                
                                <div class="absolute bottom-2 right-2 text-xs font-mono font-bold text-slate-400">Bottom Right Corner</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：最佳实践与代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">架构师的最佳实践</cite>
                </div>
                <div class="p-6">
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <h4 class="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1"><i class="ph-fill ph-check-circle"></i> 水平滚动表格 (Mobile)</h4>
                            <p class="text-xs text-blue-600/80 mb-3 leading-relaxed">在移动端，面对宽大的数据表格，切忌让表格撑爆页面产生全局横向滚动。应在外层包裹一个 <code class="bg-blue-100 px-1 rounded">overflow-x-auto</code> 容器。</p>
                        </div>
                        <div class="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                            <h4 class="font-bold text-amber-800 text-sm mb-2 flex items-center gap-1"><i class="ph-fill ph-warning"></i> Clip vs Hidden</h4>
                            <p class="text-xs text-amber-600/80 mb-3 leading-relaxed"><code class="bg-amber-100 px-1 rounded">clip</code> 类似于 hidden，但它<strong>禁止一切程序性滚动</strong>（JS 无法滚动它），且它不会像 hidden 那样强制创建新的块级格式化上下文(BFC)。</p>
                        </div>
                    </div>

                    <pre><code class="language-html">
&lt;!-- 移动端自适应宽表格最佳实践 --&gt;
&lt;div class="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm"&gt;
    &lt;table class="w-full text-left whitespace-nowrap min-w-[600px]"&gt;
        &lt;!-- 表格内容 --&gt;
    &lt;/table&gt;
&lt;/div&gt;

&lt;!-- 现代化卡片裁剪 (防止子元素的圆角被背景色盖住) --&gt;
&lt;div class="rounded-2xl overflow-hidden bg-white shadow-md"&gt;
    &lt;img src="cover.jpg" class="w-full h-48 object-cover"&gt;
    &lt;div class="p-4"&gt;卡片内容&lt;/div&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">溢出控制字典 (Overflow Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-3 font-medium tracking-wide w-48">类名 (Class)</th>
                                <th class="px-6 py-3 font-medium tracking-wide w-48 whitespace-nowrap">CSS 属性</th>
                                <th class="px-6 py-3 font-medium tracking-wide">作用域与表现行为</th>
                            </tr>
                        </thead>
                        
                        <!-- 全局双轴控制 -->
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">双轴联合控制 (X & Y)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">overflow-auto</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">overflow: auto;</span></td>
                                <td class="px-6 py-4 text-slate-600"><strong>智能滚动：</strong>仅当内容超出容器边界时，浏览器才会显示对应方向的滚动条。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">overflow-hidden</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">overflow: hidden;</span></td>
                                <td class="px-6 py-4 text-slate-600"><strong>无情裁剪：</strong>隐藏溢出容器部分的内容，且不提供任何滚动条。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-slate-600">overflow-visible</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">overflow: visible;</span></td>
                                <td class="px-6 py-4 text-slate-600"><strong>默认放任：</strong>溢出的内容可见，它将不受限制地渲染到容器外。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-slate-600">overflow-scroll</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">overflow: scroll;</span></td>
                                <td class="px-6 py-4 text-slate-600"><strong>强制滚动槽：</strong>无论内容是否溢出，都会在容器边缘渲染出滚动条槽（Windows等系统可见）。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-slate-600">overflow-clip</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">overflow: clip;</span></td>
                                <td class="px-6 py-4 text-slate-600"><strong>极端裁剪：</strong>裁剪内容，且不仅隐藏滚动条，还彻底禁止了通过 JavaScript 进行的代码滚动。</td>
                            </tr>
                        </tbody>

                        <!-- 单轴控制 -->
                        <tbody class="divide-y divide-slate-100 text-slate-700 border-t-2 border-slate-200">
                            <tr class="bg-slate-50/50">
                                <td colspan="3" class="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">独立单轴控制 (X 或 Y)</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-sky-600">overflow-x-{auto|hidden|visible...}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-sky-50 text-sky-700 px-2 py-1 rounded text-xs font-mono">overflow-x: *;</span></td>
                                <td class="px-6 py-4 text-slate-600">仅对<strong>水平方向 (左右)</strong> 的溢出行为生效。常用于移动端宽表格外层。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-indigo-600">overflow-y-{auto|hidden|visible...}</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-mono">overflow-y: *;</span></td>
                                <td class="px-6 py-4 text-slate-600">仅对<strong>垂直方向 (上下)</strong> 的溢出行为生效。常用于固定高度的长列表、侧边栏菜单等。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：绑定交互事件与代码高亮
    // ==========================================
    static mount(container) {
        initCodeHighlighter({ showLineNumbers: true, langLabel: true });

        const demoContainer = container.querySelector('#demo-container');
        const codeX = container.querySelector('#code-x');
        const codeY = container.querySelector('#code-y');

        // 状态存储
        let currentX = 'overflow-x-auto';
        let currentY = 'overflow-y-auto';

        const updateClasses = () => {
            // 清除旧的 overflow 类
            demoContainer.className = demoContainer.className.replace(/overflow-x-[a-z]+/g, '');
            demoContainer.className = demoContainer.className.replace(/overflow-y-[a-z]+/g, '');
            // 添加新类
            demoContainer.classList.add(currentX);
            demoContainer.classList.add(currentY);
            // 更新显示代码
            codeX.innerText = currentX;
            codeY.innerText = currentY;
        };

        // 处理坐标轴按钮的公共逻辑
        const bindAxisButtons = (selector, axisStr, colorClass, activeColorClass, bgClass) => {
            const btns = container.querySelectorAll(selector);
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    const val = target.dataset.val;

                    // 重置同组按钮样式
                    btns.forEach(b => {
                        b.classList.remove(`border-${colorClass}-500`, `bg-${colorClass}-50`, `ring-1`, `ring-${colorClass}-300`, `text-${colorClass}-700`, 'is-active', 'font-bold');
                        b.classList.add('border-slate-200', 'bg-white', 'text-slate-600', 'font-medium');
                    });

                    // 激活当前按钮样式
                    target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600', 'font-medium');
                    target.classList.add(`border-${colorClass}-500`, `bg-${colorClass}-50`, `ring-1`, `ring-${colorClass}-300`, `text-${colorClass}-700`, 'is-active', 'font-bold');

                    // 更新状态并渲染
                    if (axisStr === 'x') currentX = val;
                    if (axisStr === 'y') currentY = val;
                    updateClasses();
                });
            });
        };

        // 分别绑定 X 和 Y 的控制器 (sky 是蓝色系，indigo 是靛蓝色系)
        bindAxisButtons('#x-controls .axis-btn', 'x', 'sky');
        bindAxisButtons('#y-controls .axis-btn', 'y', 'indigo');
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'overflow-auto', desc: '智能溢出处理，内容超出时才显示滚动条' },
            { class: 'overflow-hidden', desc: '隐藏溢出部分，无滚动条 (创建BFC)' },
            { class: 'overflow-visible', desc: '允许内容溢出容器可见 (默认)' },
            { class: 'overflow-scroll', desc: '强制显示滚动条槽' },
            { class: 'overflow-clip', desc: '严格裁剪溢出内容，并禁止代码滚动' },
            { class: 'overflow-x-auto', desc: '水平方向智能滚动' },
            { class: 'overflow-y-auto', desc: '垂直方向智能滚动' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'overflow' 
        }));
    }
}
