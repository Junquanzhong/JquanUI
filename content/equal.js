// 🚀 Jquan Minimalist Edition: Layout Equal 等分布局系统 (equal.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutEqualDoc {
    static render() {
        // ==========================================
        // 🛠️ 预渲染紧凑型分段控制器 (Segmented Control)
        // ==========================================
        let controlButtons = '';
        for (let i = 1; i <= 12; i++) {
            const isActive = i === 3;
            controlButtons += `
                <button data-cols="${i}" class="eq-btn relative w-8 h-8 flex items-center justify-center text-xs font-mono font-medium rounded-md transition-all duration-200 z-10
                    ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}">
                    ${isActive ? `<span class="eq-active-bg absolute inset-0 bg-primary rounded-md -z-10 shadow-sm"></span>` : ''}
                    ${i}
                </button>
            `;
        }

        // ==========================================
        // 🛠️ 预渲染极简骨架占位块 (Skeleton Placeholders)
        // ==========================================
        let demoItems = '';
        for (let i = 1; i <= 12; i++) {
            demoItems += `
                <div class="bg-white border border-slate-200/80 rounded-lg h-12 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300">
                    <span class="text-[10px] font-mono text-slate-300">0${i.toString().substring(0,2)}</span>
                </div>
            `;
        }

        // ==========================================
        // 🚀 返回极简重构视图
        // ==========================================
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-xs text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">等分 (Equal)</li>
            </ul>

            <!-- 标题区 (缩减字号，提升留白) -->
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-slate-800 tracking-tight mb-2">等分网格</h1>
                <p class="text-sm text-slate-500">
                    借助全新的 JquanUI 运行时引擎，直接使用 <code class="inline-code">equal-*</code> 即可实现精确的网格等分，无需嵌套复杂标签。
                </p>
            </div>

            <!-- 🎨 模块 1：极简重排引擎沙盒 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-squares-four text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">沙盒演示</cite>
                    </div>
                    
                    <!-- 紧凑型分段控制器 -->
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Columns</span>
                        <div class="flex items-center p-1 bg-primary/5 rounded-lg border border-primary/20" id="eq-controls">
                            ${controlButtons}
                        </div>
                    </div>
                </div>

                <div class="p-6 md:p-8">
                    <!-- 视口展示区 -->
                    <div class="bg-slate-50 p-6 rounded-lg border border-slate-100 inset-shadow-sm overflow-hidden relative">
                        <!-- 浮动类名指示器 -->
                        <div class="inline-flex flex items-center gap-1.5 bg-white/80 backdrop-blur border border-slate-200 px-2 py-1 rounded text-[10px] text-slate-500 shadow-sm z-10">
                            Class: <code class="text-primary font-mono font-bold" id="current-class-display">equal-3</code>
                        </div>

                        <!-- 🚀 核心：直接使用你的引擎 equal-3！不搞虚假的 grid-cols！ -->
                        <div id="demo-grid" class="equal-3 gap-3 w-full pt-6">
                            ${demoItems}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 💡 模块 2：用法说明 (左右双栏，采用标准化卡片包裹) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                
                <!-- 基础用法 -->
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                        <i class="ph ph-code text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">基础等分</cite>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                            为父容器添加 <code class="inline-code">equal-N</code> 即可等分子元素。结合 <code class="inline-code">gap-*</code> 控制间距。
                        </p>
                        <div class="rounded-md overflow-hidden">
                            <pre><code class="language-html">
&lt;div class="equal-4 gap-4"&gt;
    &lt;div class="card"&gt;Item 1&lt;/div&gt;
    &lt;div class="card"&gt;Item 2&lt;/div&gt;
    &lt;div class="card"&gt;Item 3&lt;/div&gt;
    &lt;div class="card"&gt;Item 4&lt;/div&gt;
&lt;/div&gt;
                            </code></pre>
                        </div>
                    </div>
                </div>

                <!-- 响应式用法 -->
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="ph ph-devices text-primary text-lg"></i>
                            <cite class="font-bold text-slate-800 not-italic">响应式等分</cite>
                        </div>
                        <span class="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Advanced</span>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                            新版引擎原生支持响应式修饰符。你可以轻松实现多端适配，例如移动端单列，PC 端四列。
                        </p>
                        <div class="rounded-md overflow-hidden">
                            <pre><code class="language-html">
&lt;!-- 移动端 1等分 -> 平板 2等分 -> 桌面 4等分 --&gt;
&lt;div class="equal-1 md:equal-2 lg:equal-4 gap-4"&gt;
    &lt;div class="card"&gt;产品 A&lt;/div&gt;
    &lt;div class="card"&gt;产品 B&lt;/div&gt;
    &lt;div class="card"&gt;产品 C&lt;/div&gt;
    &lt;div class="card"&gt;产品 D&lt;/div&gt;
&lt;/div&gt;
                            </code></pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：极简交互引擎
    // ==========================================
    static mount(container) {
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        const buttons = container.querySelectorAll('.eq-btn');
        const gridBox = container.querySelector('#demo-grid');
        const classDisplay = container.querySelector('#current-class-display');

        if (buttons.length > 0 && gridBox) {
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.currentTarget;
                    const targetCols = targetBtn.dataset.cols;

                    // 1. 更新分段控制器 UI (极简冷淡风状态切换)
                    buttons.forEach(b => {
                        b.classList.remove('text-white');
                        b.classList.add('text-slate-500', 'hover:text-primary', 'hover:bg-primary/20');
                        const bg = b.querySelector('.eq-active-bg');
                        if (bg) bg.remove();
                    });

                    targetBtn.classList.remove('text-slate-500', 'hover:text-primary', 'hover:bg-primary/20');
                    targetBtn.classList.add('text-white');
                    targetBtn.insertAdjacentHTML('afterbegin', `<span class="eq-active-bg absolute inset-0 bg-primary rounded-md -z-10 shadow-sm"></span>`);

                    // 2. 更新类名文本指示器
                    classDisplay.innerText = `equal-${targetCols}`;

                    // 3. 🚀 引擎验证时刻：直接查找并替换 equal-* 类名！
                    // 不再使用 grid-cols 模拟，完全交由 JquanUI 引擎在底层注入 CSSOM
                    const currentClasses = Array.from(gridBox.classList);
                    currentClasses.forEach(cls => {
                        if (cls.startsWith('equal-')) {
                            gridBox.classList.remove(cls);
                        }
                    });
                    
                    gridBox.classList.add(`equal-${targetCols}`);
                });
            });
        }
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'equal-1 ~ equal-12', desc: '将容器子元素精确划分为 1 到 12 等分' },
            { class: '{bp}:equal-*', desc: '响应式等分修饰符 (如 md:equal-3)' }
        ];
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'equal' 
        }));
    }
}