// 🚀 Jquan Optimized: Typography 字体排版系统文档 (font.js)
import { Tabs } from '../js/tabs.mjs';
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FontDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>基础</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">字体排印 (Typography)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">字体排印</h1>
                <p class="text-slate-600">
                    JquanUI 提供统一的字号、字重、行高和字体族原子类。Core 只负责生成 CSS，不会凭空下载项目字体；MiSans 等字体类需要你在项目中提供字体文件或对应的字体 CSS。
                </p>
            </div>

            <!-- 🧪 核心模块 1：排版实验室 (Typography Playground) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-aa text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">排版实验室 Playground</cite>
                    </div>
                    <span class="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold tracking-wider uppercase">Interactive</span>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <!-- 控制面板 (左侧) -->
                        <section class="lg:col-span-5 flex flex-col space-y-6">
                            <!-- 字体族控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1"><i class="ph ph-text-t text-lg"></i> 字体族 (Font Family)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="family" data-class="font-sans" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">sans (默认)</button>
                                    <button data-type="family" data-class="font-serif" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">serif</button>
                                    <button data-type="family" data-class="font-mono" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">mono</button>
                                    <button data-type="family" data-class="font-misans-vf" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">MiSans (需字体资源)</button>
                                </div>
                            </div>
                            
                            <!-- 字重控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1"><i class="ph ph-barbell text-lg"></i> 字重 (Font Weight)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="weight" data-class="font-light" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">light</button>
                                    <button data-type="weight" data-class="font-normal" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">normal</button>
                                    <button data-type="weight" data-class="font-bold" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">bold</button>
                                    <button data-type="weight" data-class="font-black" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">black</button>
                                </div>
                            </div>

                            <!-- 字号控制 -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1"><i class="ph ph-text-h text-lg"></i> 字号标尺 (Text Scale)</label>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="size" data-class="text-sm" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">sm</button>
                                    <button data-type="size" data-class="text-base" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">base</button>
                                    <button data-type="size" data-class="text-2xl" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-primary/5 text-slate-600 transition-all">2xl</button>
                                    <button data-type="size" data-class="text-5xl" class="typo-btn px-3 py-1.5 text-sm font-medium rounded-lg border border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-1 transition-all is-active">5xl</button>
                                </div>
                            </div>
                        </section>

                        <!-- 演示视窗 (右侧) -->
                        <section class="lg:col-span-7 relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[300px] p-8 bg-slate-50">
                            
                            <!-- 动态文本展示 -->
                            <div class="text-center w-full transition-all duration-300">
                                <p id="typo-demo-text" class="text-slate-900 font-misans-vf font-bold text-5xl leading-tight transition-all duration-300">
                                    超越时代的原子化 UI
                                </p>
                                <p class="mt-4 text-slate-500 text-sm">
                                    The quick brown fox jumps over the lazy dog.
                                </p>
                            </div>

                            <!-- 实时生成的代码片段 -->
                            <div class="absolute bottom-4 inset-x-4 flex justify-center">
                                <div class="font-mono text-xs tracking-wider px-4 py-2 bg-white/95 text-slate-600 rounded-lg shadow-lg border border-slate-200 flex items-center gap-2">
                                    <span class="text-slate-400">class</span><span class="text-slate-400">=</span><code class="text-primary">"<span id="typo-demo-code">font-misans-vf font-bold text-5xl</span>"</code>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <!-- 模块 2：全局配置与调用机制 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-globe text-indigo-500 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">全局引擎级覆盖</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm mb-6 leading-relaxed">
                        如果项目需要品牌字体，把字体族注册为主题令牌，再用语义类调用。这样配置集中管理，组件中不需要重复写字体名；没有加载字体资源时，浏览器会按回退栈显示。
                    </p>
                    
                    <div id="global-config-tabs" class="tabs-container">
                        <div class="flex mb-4">
                            <nav class="tabs-nav flex p-1 bg-slate-100/80 rounded-lg space-x-1" role="tablist">
                                <button class="tabs-item is-active px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 bg-white text-slate-800 shadow-sm transition-all" data-tab-target="#panel-config">
                                    <i class="ph ph-brackets-curly text-blue-500"></i> config.js
                                </button>
                                <button class="tabs-item px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all" data-tab-target="#panel-html">
                                    <i class="ph ph-file-html text-orange-500"></i> index.html
                                </button>
                            </nav>
                        </div>
                        
                        <div class="tabs-content rounded-xl overflow-hidden">
                            <section id="panel-config" class="tabs-panel is-active">
                                <pre class="!m-0 !rounded-none"><code class="language-javascript">
// 配置必须放在 Core 之前
window.JQUAN_CONFIG = {
    theme: {
        extend: {
            fontFamily: {
                brand: ['MiSans Light', 'sans-serif']
            }
        }
    }
};
                                </code></pre>
                            </section>
                            <section id="panel-html" class="tabs-panel hidden">
                                <pre class="!m-0 !rounded-none"><code class="language-html">
&lt;!-- 或者通过内联根节点直接注入 --&gt;
&lt;html lang="zh-CN"&gt;
    &lt;body class="bg-slate-50 text-slate-900"&gt;
        &lt;!-- 所有的排版将默认继承 MiSans --&gt;
        &lt;h1 class="font-brand text-3xl font-bold"&gt;品牌字体已经变更&lt;/h1&gt;
    &lt;/body&gt;
&lt;/html&gt;
                                </code></pre>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：复合字体声明 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-brackets-square text-violet-500 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">复合 font 声明</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-600 text-sm leading-relaxed mb-5">
                        常规排版优先组合 <code>font-sans</code>、<code>font-bold</code>、<code>text-base</code> 和 <code>leading-normal</code> 等语义类。只有需要一次设置字体样式、字重、字号、行高和字体族的不可拆分场景，才使用 <code>font-[...]</code>。
                    </p>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        <div class="min-h-40 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                            <p class="font-[700_1rem/1.5_sans-serif] text-slate-800">
                                复合声明保持原生 CSS font 简写语义
                            </p>
                        </div>
                        <div class="rounded-xl overflow-hidden bg-slate-950 flex items-center">
                            <pre class="!m-0 !rounded-none w-full"><code class="language-html">&lt;p class="font-[700_1rem/1.5_sans-serif]"&gt;
    复合字体声明
&lt;/p&gt;</code></pre>
                        </div>
                    </div>
                    <p class="mt-4 text-xs leading-relaxed text-slate-500">
                        任意值中的空格写成下划线。相同声明出现两次以上时，应提升为主题字体令牌或 shortcut，避免重复魔法值。
                    </p>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 生命周期与逻辑挂载
    // ==========================================
    static mount(container) {
        // 1. 初始化标准代码高亮器
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });

        // 2. 初始化配置演示的 Tabs
        if (container.querySelector('#global-config-tabs')) {
            new Tabs('#global-config-tabs', {
                mode: 'fade',
                duration: 300,
                autoHeight: false
            });
        }

        // 3. 字体实验室核心逻辑 (Playground Engine)
        const demoText = container.querySelector('#typo-demo-text');
        const codeDisplay = container.querySelector('#typo-demo-code');
        const buttons = container.querySelectorAll('.typo-btn');

        if (demoText && buttons.length > 0) {
            // 初始状态字典
            const state = {
                family: 'font-misans-vf',
                weight: 'font-bold',
                size: 'text-5xl'
            };

            // 专属高亮与复位函数
            const updateUI = (type, targetBtn) => {
                // 清理同类按钮状态
                buttons.forEach(btn => {
                    if (btn.dataset.type === type) {
                        btn.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30');
                        btn.classList.add('border-slate-200', 'bg-white');
                    }
                });
                // 激活当前按钮
                targetBtn.classList.remove('border-slate-200', 'bg-white');
                targetBtn.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'ring-2', 'ring-primary/30', 'ring-offset-1');
            };

            // 监听点击事件
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    const type = target.dataset.type;      // family, weight, size
                    const className = target.dataset.class; // font-mono, text-sm, etc.

                    // 从 DOM 移除旧的 class
                    if (state[type]) {
                        demoText.classList.remove(state[type]);
                    }

                    // 更新状态并添加新的 class
                    state[type] = className;
                    demoText.classList.add(state[type]);

                    // 更新按钮视图
                    updateUI(type, target);

                    // 实时生成代码拼装
                    codeDisplay.innerText = `${state.family} ${state.weight} ${state.size}`;
                });
            });
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'font-sans', desc: '字体族：默认无衬线字体系统' },
            { class: 'font-serif', desc: '字体族：衬线字体系统' },
            { class: 'font-mono', desc: '字体族：等宽代码字体' },
            { class: 'font-misans-vf', desc: '字体族：项目提供字体资源后使用的 MiSans 可变字体类' },
            { class: 'text-sm', desc: '字号：小号字体 (14px)' },
            { class: 'text-base', desc: '字号：基准字体 (16px)' },
            { class: 'text-2xl', desc: '字号：2号标题 (24px)' },
            { class: 'font-normal', desc: '字重：常规体 (400)' },
            { class: 'font-bold', desc: '字重：粗体 (700)' },
            { class: 'font-[700_1rem/1.5_sans-serif]', desc: '任意复合 font 简写声明；常规排版优先使用语义类组合' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'font' 
        }));
    }
}
