// 🚀 Jquan Optimized: Effects Opacity 透明度组件文档 (opacity.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class EffectsOpacityDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>效果</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">透明度 (Opacity)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">透明度 (Opacity)</h1>
                <p class="text-slate-600 max-w-3xl leading-relaxed">
                    使用 <code class="inline-code">opacity-*</code> 工具类可以控制整个元素及其所有子元素的透明度。通常用于禁用状态、悬浮特效或图层叠加。
                </p>
            </div>

            <!-- 🧪 核心模块 1：透明度实验室 Playground -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-drop-half-bottom text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">透明度实验室</cite>
                    </div>
                    <code id="opacity-demo-code" class="text-xs font-mono bg-white border border-slate-200 text-primary px-2 py-1 rounded shadow-sm">opacity-100</code>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- 控制面板 -->
                        <section class="lg:col-span-1 flex flex-col space-y-6">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">调整不透明度</label>
                                <div class="flex flex-col gap-2">
                                    <button data-opacity="opacity-100" class="opacity-btn w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all">
                                        <span>100% (完全不透明)</span><span class="text-xs font-mono opacity-60">opacity-100</span>
                                    </button>
                                    <button data-opacity="opacity-75" class="opacity-btn w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">
                                        <span>75%</span><span class="text-xs font-mono opacity-50">opacity-75</span>
                                    </button>
                                    <button data-opacity="opacity-50" class="opacity-btn w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">
                                        <span>50%</span><span class="text-xs font-mono opacity-50">opacity-50</span>
                                    </button>
                                    <button data-opacity="opacity-25" class="opacity-btn w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">
                                        <span>25%</span><span class="text-xs font-mono opacity-50">opacity-25</span>
                                    </button>
                                    <button data-opacity="opacity-0" class="opacity-btn w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">
                                        <span>0% (完全透明)</span><span class="text-xs font-mono opacity-50">opacity-0</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <!-- 演示视窗 -->
                        <section class="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-inner p-6 flex items-center justify-center min-h-[300px] relative overflow-hidden">
                            <!-- 棋盘格背景 (用于凸显透明度) -->
                            <div class="absolute inset-0 z-0 bg-gradient-to-br from-slate-200 via-slate-50 to-slate-200 opacity-20"></div>
                            
                            <!-- 目标组件 -->
                            <div id="opacity-demo-box" class="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 opacity-100 transition-opacity duration-500 ease-in-out">
                                <div class="flex items-center gap-4 mb-4">
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white shadow-md">
                                        <i class="ph ph-rocket text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-base font-bold text-slate-800">JquanUI Pro</h3>
                                        <p class="text-xs text-slate-500 mt-0.5">连内部元素也会一起变透明</p>
                                    </div>
                                </div>
                                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary w-2/3 rounded-full"></div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <!-- 💡 核心模块 2：Jquan 架构师视角 (全局透明度 vs 通道透明度) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/20 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-lightbulb text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">Jquan 架构师视角：别让文字也变糊了！</cite>
                </div>
                
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm leading-relaxed mb-6">
                        初学者最常犯的错误就是为了让背景半透明，使用了 <code class="inline-code">opacity-50</code>。这会导致整个 DOM 节点（包含里面极其重要的文字）全部变成 50% 透明度，严重影响阅读！正确的现代做法是使用 <strong>Alpha 通道颜色修饰符 (<code class="inline-code">bg-color/opacity</code>)</strong>。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- ❌ 错误示范 -->
                        <div class="flex flex-col">
                            <div class="mb-3 flex items-center gap-2">
                                <span class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">错误示范</span>
                                <span class="text-sm font-mono text-slate-500">bg-indigo-600 opacity-50</span>
                            </div>
                            <!-- 模拟深色图片背景上的卡片 -->
                            <div class="relative w-full h-40 rounded-xl overflow-hidden flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
                                <div class="w-3/4 bg-indigo-600 opacity-50 p-4 rounded-lg text-center">
                                    <strong class="text-white block text-lg mb-1">标题看不清了</strong>
                                    <p class="text-indigo-100 text-sm">因为内部文本也继承了 50% 的全局透明度，与底图混在一起。</p>
                                </div>
                            </div>
                        </div>

                        <!-- ✅ 正确示范 -->
                        <div class="flex flex-col">
                            <div class="mb-3 flex items-center gap-2">
                                <span class="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold uppercase">高级做法</span>
                                <span class="text-sm font-mono text-slate-500">bg-indigo-600/50</span>
                            </div>
                            <div class="relative w-full h-40 rounded-xl overflow-hidden flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
                                <div class="w-3/4 bg-indigo-600/50 p-4 rounded-lg text-center backdrop-blur-sm border border-white/20">
                                    <strong class="text-white block text-lg mb-1 drop-shadow-md">文字依然清晰</strong>
                                    <p class="text-indigo-50 text-sm drop-shadow">只有背景色具备 50% 透明度，文字保持 100% 纯白不透明！</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🖱️ 交互特效：悬浮渐变 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-cursor-click text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">状态交互 (Hover / Focus)</cite>
                </div>
                <div class="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                    <div class="flex-1 text-slate-600 text-sm leading-relaxed">
                        <p class="mb-2">结合 <code class="inline-code">hover:</code> 或 <code class="inline-code">group-hover:</code> 修饰符，配合 <code class="inline-code">transition-opacity</code>，可以极其优雅地实现图片悬浮信息展示、按钮变暗等常见交互。</p>
                        <p>请将鼠标悬浮在右侧（或下方）的图片上查看效果。</p>
                    </div>
                    <div class="relative w-64 h-40 rounded-xl overflow-hidden group shadow-md cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Demo">
                        <!-- 初始透明度为 0，悬浮时变为 100 -->
                        <div class="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                            <i class="ph ph-code text-3xl text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500"></i>
                            <span class="text-white font-bold tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">查看源码</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 字典表格区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-open-text text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">透明度核心 API</cite>
                </div>
                <div class="p-0 max-h-[400px] overflow-y-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead class="bg-white/90 backdrop-blur text-slate-500 sticky top-0 border-b border-slate-100 z-10 shadow-sm">
                            <tr>
                                <th class="px-6 py-3 font-medium w-1/3">工具类 (Class)</th>
                                <th class="px-6 py-3 font-medium w-1/3">CSS 属性</th>
                                <th class="px-6 py-3 font-medium">表现</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-3 font-mono font-medium text-slate-500">opacity-0</td>
                                <td class="px-6 py-3 font-mono text-xs text-slate-500">opacity: 0;</td>
                                <td class="px-6 py-3">完全透明 (仍占据文档流，可触发点击)</td>
                            </tr>
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-3 font-mono font-medium text-slate-600">opacity-5 / 10 / 20...</td>
                                <td class="px-6 py-3 font-mono text-xs text-slate-500">opacity: 0.05 / 0.1 / 0.2;</td>
                                <td class="px-6 py-3">微弱显现 (适合阴影、水印或轻量背景)</td>
                            </tr>
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-3 font-mono font-medium text-primary">opacity-50</td>
                                <td class="px-6 py-3 font-mono text-xs text-slate-500">opacity: 0.5;</td>
                                <td class="px-6 py-3">半透明 (适合禁用状态 disabled)</td>
                            </tr>
                            <tr class="hover:bg-primary/5 transition-colors">
                                <td class="px-6 py-3 font-mono font-medium text-slate-800">opacity-100</td>
                                <td class="px-6 py-3 font-mono text-xs text-slate-500">opacity: 1;</td>
                                <td class="px-6 py-3">完全不透明 (默认状态)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        initCodeHighlighter({ showLineNumbers: false });

        const demoBox = container.querySelector('#opacity-demo-box');
        const codeDisplay = container.querySelector('#opacity-demo-code');
        const btns = container.querySelectorAll('.opacity-btn');

        if (!demoBox || btns.length === 0) return;

        let currentOpacity = 'opacity-100';

        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const newOpacity = target.dataset.opacity;

                // 切换 Demo Box 的类名
                demoBox.classList.remove(currentOpacity);
                demoBox.classList.add(newOpacity);
                currentOpacity = newOpacity;

                // 更新代码显示
                codeDisplay.innerText = newOpacity;

                // 重置所有按钮状态
                btns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                });
                
                // 激活当前按钮
                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                target.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');
            });
        });
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'opacity-*', desc: '效果：元素全局透明度控制 (opacity-0 到 100)' },
            { class: 'hover:opacity-*', desc: '效果：悬浮时的透明度变化' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'opacity' 
        }));
    }
}
