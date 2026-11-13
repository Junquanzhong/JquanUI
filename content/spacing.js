// 🚀 Jquan Optimized: Layout Spacing 间距组件文档 (spacing.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutSpacingDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">间距系统 (Margin / Padding / Space)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">间距系统</h1>
                <p class="text-slate-600">基于统一的比例刻度，JquanUI 提供了极为全面的 <code class="inline-code">m-*</code> (外边距)、<code class="inline-code">p-*</code> (内边距) 以及 <code class="inline-code">space-*</code> (子元素间距) 工具类，精准掌控元素的呼吸感。</p>
            </div>

            <!-- 🧪 实验室 1：盒模型 (Margin & Padding) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-cube text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">盒模型实验室 Playground</cite>
                    </div>
                    <span class="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold tracking-wider uppercase">Interactive</span>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- 控制面板 -->
                        <section class="lg:col-span-1 flex flex-col space-y-6">
                            <!-- Margin 控制 -->
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300"></span>
                                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">外边距 (Margin)</label>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="m" data-class="m-0" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 transition-all">m-0</button>
                                    <button data-type="m" data-class="m-4" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-200 ring-offset-1 transition-all is-active">m-4</button>
                                    <button data-type="m" data-class="m-8" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 transition-all">m-8</button>
                                    <button data-type="m" data-class="my-8" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 transition-all">my-8</button>
                                    <button data-type="m" data-class="mx-auto" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 transition-all">mx-auto</button>
                                </div>
                            </div>
                            
                            <!-- Padding 控制 -->
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300"></span>
                                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">内边距 (Padding)</label>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <button data-type="p" data-class="p-0" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 transition-all">p-0</button>
                                    <button data-type="p" data-class="p-4" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-emerald-400 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200 ring-offset-1 transition-all is-active">p-4</button>
                                    <button data-type="p" data-class="p-8" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 transition-all">p-8</button>
                                    <button data-type="p" data-class="px-8" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 transition-all">px-8</button>
                                    <button data-type="p" data-class="pt-8" class="mp-btn px-2 py-1 text-sm font-medium rounded border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 transition-all">pt-8</button>
                                </div>
                            </div>
                        </section>

                        <!-- 演示视窗 -->
                        <section class="lg:col-span-3 relative h-64 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4">
                            <!-- 父容器 (用于挤出外边距橙色) -->
                            <div class="w-full max-w-sm h-full bg-orange-50 border-2 border-dashed border-orange-300 rounded flex flex-col relative transition-all">
                                
                                <!-- 目标盒子 -->
                                <div id="demo-mp-box" class="m-4 p-4 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded flex-grow flex transition-all duration-300 ease-in-out">
                                    
                                    <!-- 内容区 -->
                                    <div class="bg-primary/10 border border-primary/30 rounded w-full h-full flex flex-col items-center justify-center text-primary relative shadow-sm">
                                        <i class="ph ph-bounding-box text-3xl mb-1 opacity-50"></i>
                                        <div class="font-mono text-sm font-bold tracking-wider" id="demo-mp-code">
                                            m-4 p-4
                                        </div>
                                    </div>

                                </div>

                                <span class="absolute top-1 left-2 text-[10px] text-orange-400 font-bold uppercase tracking-widest">Margin Area</span>
                            </div>
                        </section>
                    </div>

                    <div class="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="text-xs text-slate-500">实时组合 · 使用统一代码块组件复制</div>
                            <span class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">Live</span>
                        </div>
                        <div id="spacing-playground-code-host"></div>
                        <p id="spacing-playground-status" class="m-0 text-xs text-slate-500" aria-live="polite">m-4 p-4 · space-x-4 · space-y-4</p>
                    </div>
                </div>
            </div>

            <!-- 🧪 实验室 2：子元素引力 (Space Between) -->
            <div class="mb-8 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/60 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-arrows-out-cardinal text-xl text-slate-600"></i>
                        <cite class="font-bold text-slate-800 not-italic">子元素引力 (Space Between)</cite>
                    </div>
                    <span class="hidden sm:inline-block text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 shadow-sm">自动处理子元素间的缝隙，无需首尾重置</span>
                </div>
                
                <div class="p-6 md:p-8 flex-1">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- 水平引力 X -->
                        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-sm font-bold text-slate-600">水平间距 (space-x)</span>
                                <div class="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                    <button data-type="space-x" data-class="space-x-1" class="space-btn px-2 py-0.5 text-xs font-medium rounded hover:bg-white hover:shadow-sm text-slate-500 transition-all">1</button>
                                    <button data-type="space-x" data-class="space-x-4" class="space-btn px-2 py-0.5 text-xs font-medium rounded bg-white shadow-sm text-primary transition-all">4</button>
                                    <button data-type="space-x" data-class="space-x-8" class="space-btn px-2 py-0.5 text-xs font-medium rounded hover:bg-white hover:shadow-sm text-slate-500 transition-all">8</button>
                                </div>
                            </div>
                            <div id="demo-space-x" class="flex flex-row space-x-4 bg-slate-50 p-4 border border-slate-100 rounded-lg flex-grow items-center justify-center transition-all duration-300">
                                <div class="w-16 h-16 bg-primary rounded-lg shadow flex items-center justify-center text-white/50 text-xs font-mono">1</div>
                                <div class="w-16 h-16 bg-primary rounded-lg shadow flex items-center justify-center text-white/50 text-xs font-mono">2</div>
                                <div class="w-16 h-16 bg-primary rounded-lg shadow flex items-center justify-center text-white/50 text-xs font-mono">3</div>
                            </div>
                        </div>

                        <!-- 垂直引力 Y -->
                        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-sm font-bold text-slate-600">垂直间距 (space-y)</span>
                                <div class="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                    <button data-type="space-y" data-class="space-y-1" class="space-btn px-2 py-0.5 text-xs font-medium rounded hover:bg-white hover:shadow-sm text-slate-500 transition-all">1</button>
                                    <button data-type="space-y" data-class="space-y-4" class="space-btn px-2 py-0.5 text-xs font-medium rounded bg-white shadow-sm text-primary transition-all">4</button>
                                    <button data-type="space-y" data-class="space-y-8" class="space-btn px-2 py-0.5 text-xs font-medium rounded hover:bg-white hover:shadow-sm text-slate-500 transition-all">8</button>
                                </div>
                            </div>
                            <div id="demo-space-y" class="flex flex-col space-y-4 bg-slate-50 p-4 border border-slate-100 rounded-lg flex-grow justify-center transition-all duration-300">
                                <div class="w-full h-10 bg-primary rounded-lg shadow flex items-center justify-center text-white/50 text-xs font-mono">1</div>
                                <div class="w-full h-10 bg-primary rounded-lg shadow flex items-center justify-center text-white/50 text-xs font-mono">2</div>
                                <div class="w-full h-10 bg-primary rounded-lg shadow flex items-center justify-center text-white/50 text-xs font-mono">3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- 方向速查 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                        <i class="ph ph-compass text-slate-500 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">方向速查字典 (Direction Modifiers)</cite>
                    </div>
                    <table class="w-full text-left text-sm border-collapse">
                        <tbody class="divide-y divide-slate-100 text-slate-700 bg-white">
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-mono font-bold text-slate-800 w-16">t</td><td class="px-6 py-4"><span class="val-badge text-xs bg-slate-100 px-2 py-1 rounded">top</span> (上)</td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-mono font-bold text-slate-800">r</td><td class="px-6 py-4"><span class="val-badge text-xs bg-slate-100 px-2 py-1 rounded">right</span> (右)</td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-mono font-bold text-slate-800">b</td><td class="px-6 py-4"><span class="val-badge text-xs bg-slate-100 px-2 py-1 rounded">bottom</span> (下)</td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-mono font-bold text-slate-800">l</td><td class="px-6 py-4"><span class="val-badge text-xs bg-slate-100 px-2 py-1 rounded">left</span> (左)</td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-mono font-bold text-slate-800 text-primary">x</td><td class="px-6 py-4"><span class="val-badge text-xs bg-primary/10 text-primary px-2 py-1 rounded">left & right</span> (水平双向)</td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 font-mono font-bold text-slate-800 text-primary">y</td><td class="px-6 py-4"><span class="val-badge text-xs bg-primary/10 text-primary px-2 py-1 rounded">top & bottom</span> (垂直双向)</td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-6 py-4 text-slate-400 text-xs italic" colspan="2">* 无方向字母直接代表四个方向 (如 m-4)</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- 刻度对照表 -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <i class="ph ph-ruler text-slate-500 text-lg"></i>
                            <cite class="font-bold text-slate-800 not-italic">统一间距刻度 (Spacing Scale)</cite>
                        </div>
                        <span class="text-xs text-slate-400 border border-slate-200 bg-white px-2 py-0.5 rounded shadow-sm">1 unit = 0.25rem = 4px</span>
                    </div>
                    <div class="p-0 h-[348px] overflow-y-auto relative bg-white">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead class="bg-white/90 backdrop-blur text-slate-500 sticky top-0 shadow-sm z-10 border-b border-slate-100">
                                <tr>
                                    <th class="px-6 py-3 font-medium">类名后缀</th>
                                    <th class="px-6 py-3 font-medium">Rem</th>
                                    <th class="px-6 py-3 font-medium">Px</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700">
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">0</td><td class="px-6 py-3 text-slate-500">0rem</td><td class="px-6 py-3">0px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">px</td><td class="px-6 py-3 text-slate-500">1px</td><td class="px-6 py-3">1px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">0.5</td><td class="px-6 py-3 text-slate-500">0.125rem</td><td class="px-6 py-3">2px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">1</td><td class="px-6 py-3 text-slate-500">0.25rem</td><td class="px-6 py-3">4px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">1.5</td><td class="px-6 py-3 text-slate-500">0.375rem</td><td class="px-6 py-3">6px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">2</td><td class="px-6 py-3 text-slate-500">0.5rem</td><td class="px-6 py-3">8px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">3</td><td class="px-6 py-3 text-slate-500">0.75rem</td><td class="px-6 py-3">12px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono text-primary font-bold">4</td><td class="px-6 py-3 text-slate-500">1rem</td><td class="px-6 py-3 font-bold text-slate-800">16px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">5</td><td class="px-6 py-3 text-slate-500">1.25rem</td><td class="px-6 py-3">20px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">6</td><td class="px-6 py-3 text-slate-500">1.5rem</td><td class="px-6 py-3">24px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono text-primary font-bold">8</td><td class="px-6 py-3 text-slate-500">2rem</td><td class="px-6 py-3 font-bold text-slate-800">32px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">10</td><td class="px-6 py-3 text-slate-500">2.5rem</td><td class="px-6 py-3">40px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono">12</td><td class="px-6 py-3 text-slate-500">3rem</td><td class="px-6 py-3">48px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono text-primary font-bold">16</td><td class="px-6 py-3 text-slate-500">4rem</td><td class="px-6 py-3 font-bold text-slate-800">64px</td></tr>
                                <tr class="hover:bg-slate-50"><td class="px-6 py-3 font-mono text-primary font-bold">24</td><td class="px-6 py-3 text-slate-500">6rem</td><td class="px-6 py-3 font-bold text-slate-800">96px</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
        `;
    }

    static mount(container) {
        const demoMpBox = container.querySelector('#demo-mp-box');
        const demoMpCode = container.querySelector('#demo-mp-code');
        const mpButtons = container.querySelectorAll('.mp-btn');
        
        const mpState = { m: 'm-4', p: 'p-4' };

        const codeHost = container.querySelector('#spacing-playground-code-host');
        const statusDisplay = container.querySelector('#spacing-playground-status');
        const spaceState = {
            'space-x': { box: container.querySelector('#demo-space-x'), current: 'space-x-4' },
            'space-y': { box: container.querySelector('#demo-space-y'), current: 'space-y-4' }
        };

        const getClassString = () => [
            mpState.m,
            mpState.p,
            spaceState['space-x'].current,
            spaceState['space-y'].current
        ].join(' ');

        const escapeHtml = value => String(value).replace(/[&<>\"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\"': '&quot;',
            "'": '&#39;'
        }[character]));

        const updateFeedback = () => {
            const classString = getClassString();
            if (codeHost) {
                const source = `<div class="${classString}">间距内容</div>`;
                codeHost.innerHTML = `<pre><code class="language-html">${escapeHtml(source)}</code></pre>`;
                initCodeHighlighter({
                    selector: '#spacing-playground-code-host pre code',
                    showLineNumbers: false,
                    langLabel: false
                });
            }
            if (statusDisplay) statusDisplay.textContent = classString;
        };

        mpButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const type = target.dataset.type; 
                const className = target.dataset.class; 

                if (mpState[type]) {
                    demoMpBox.classList.remove(mpState[type]);
                }

                mpState[type] = className;
                demoMpBox.classList.add(mpState[type]);

                demoMpCode.innerText = `${mpState.m} ${mpState.p}`;

                container.querySelectorAll(`.mp-btn[data-type="${type}"]`).forEach(b => {
                    b.classList.remove('ring-2', 'ring-offset-1', 'border-orange-400', 'text-orange-600', 'border-emerald-400', 'text-emerald-600');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
                });

                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
                if (type === 'm') {
                    target.classList.add('border-orange-400', 'text-orange-600', 'ring-2', 'ring-orange-200', 'ring-offset-1');
                } else {
                    target.classList.add('border-emerald-400', 'text-emerald-600', 'ring-2', 'ring-emerald-200', 'ring-offset-1');
                }
                updateFeedback();
            });
        });

        const spaceButtons = container.querySelectorAll('.space-btn');

        spaceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const type = target.dataset.type;
                const className = target.dataset.class;

                const targetState = spaceState[type];
                if (!targetState || !targetState.box) return;

                targetState.box.classList.remove(targetState.current);
                targetState.current = className;
                targetState.box.classList.add(targetState.current);

                container.querySelectorAll(`.space-btn[data-type="${type}"]`).forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'text-primary');
                    b.classList.add('hover:bg-white', 'hover:shadow-sm', 'text-slate-500');
                });

                target.classList.remove('hover:bg-white', 'hover:shadow-sm', 'text-slate-500');
                target.classList.add('bg-white', 'shadow-sm', 'text-primary');
                updateFeedback();
            });
        });

        updateFeedback();
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'm-* / mx-* / my-*', desc: '外边距 (Margin) - 控制盒子外部的排斥距离' },
            { class: 'p-* / px-* / py-*', desc: '内边距 (Padding) - 控制盒子内部内容与边框的呼吸感' },
            { class: 'space-x-*', desc: '水平子元素间距 (Space Between X) - 自动分配同行元素的缝隙' },
            { class: 'space-y-*', desc: '垂直子元素间距 (Space Between Y) - 自动分配同列元素的缝隙' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'spacing' 
        }));
    }
}
