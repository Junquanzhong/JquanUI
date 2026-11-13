// 🚀 Jquan Optimized: 文本颜色组件文档 (textcolor.js) - V3.3 纯净去糖版
import { initCodeHighlighter } from '../js/code-block.mjs';
import { copyText } from '../js/copy.mjs'; // 接入纯 ESM 复制模块

export default class TextColorDoc {
    static render() {
        // 数据驱动：语义化色彩
        const semanticColors = [
            { name: 'primary', label: '主题色' },
            { name: 'secondary', label: '次要色' },
            { name: 'success', label: '成功' },
            { name: 'danger', label: '危险' },
            { name: 'warning', label: '警告' },
            { name: 'important', label: '重要' },
            { name: 'special', label: '特殊' },
            { name: 'black', label: '纯黑' },
            { name: 'white', label: '纯白' } // 纯白会单独处理浅灰背景
        ];

        // 数据驱动：标准色阶
        const standardColors = ['slate', 'gray', 'zinc', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
        
        // 数据驱动：扩展中式色阶
        const chineseColors = [
            'placergold', 'coralorange', 'cherrypink', 'goldenmarigold', 'tomatored', 'watermelonred', 
            'mintgreen', 'skyazure', 'jadegreen', 'dodgerblue', 'royalblue', 'peace', 
            'graphite', 'silvergray', 'midnight', 'mistwhite', 'snowwhite', 'cloudgray'
        ];
        
        const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

        // 渲染文本色阶行的辅助函数 (绝对禁止形变，保持统一白底)
        const renderTextRow = (colorName) => `
            <div class="flex items-center gap-3 md:gap-4 py-3 border-b border-slate-50 last:border-0">
                <div class="w-24 md:w-28 flex-shrink-0">
                    <span class="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        <i class="ph-fill ph-text-t text-slate-300"></i> ${colorName}
                    </span>
                </div>
                <div class="flex-1 grid grid-cols-10 gap-1.5 md:gap-2">
                    ${weights.map(weight => `
                        <div class="relative flex flex-col items-center justify-center cursor-pointer color-copy-btn group h-14 md:h-16 border border-slate-100 rounded-lg transition-colors duration-200 bg-white hover:bg-slate-50" data-clipboard="text-${colorName}-${weight}">
                            
                            <!-- 核心文本展示：克制显示，绝不放大 -->
                            <span class="text-xl md:text-2xl font-bold tracking-tighter text-${colorName}-${weight}">Aa</span>
                            
                            <!-- 悬浮提示 -->
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-700 border border-slate-200 shadow-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 font-medium z-30">复制类名</div>
                            
                            <!-- 底部文本 -->
                            <span class="text-[9px] md:text-[10px] mt-1 font-mono text-slate-400 group-hover:text-primary transition-colors duration-200">${weight}</span>
                            
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return `
        <div class="container pb-10 relative">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>色彩</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">文本颜色 (Text Color)</li>
            </ul>

            <section class="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                <header class="flex flex-col justify-between gap-3 border-b border-primary/10 bg-white/60 px-6 py-4 sm:flex-row sm:items-center">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-aa text-xl text-primary"></i>
                        <h1 class="font-bold text-slate-800">文本颜色实验室 Playground</h1>
                    </div>
                    <span class="w-fit rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </header>
                <div class="grid gap-6 p-6 md:p-8 lg:grid-cols-5">
                    <section class="space-y-4 lg:col-span-2">
                        <div>
                            <h2 class="mb-1 text-sm font-bold text-slate-800">文本语义与透明度</h2>
                            <p class="text-sm leading-relaxed text-slate-600">使用 <code class="inline-code">text-primary</code> 等主题色保持可维护性，需要层次差异时追加透明度后缀。</p>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" data-text-choice="text-primary" class="text-playground-btn rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary">text-primary</button>
                            <button type="button" data-text-choice="text-secondary" class="text-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-secondary</button>
                            <button type="button" data-text-choice="text-success" class="text-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-success</button>
                            <button type="button" data-text-choice="text-danger" class="text-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-danger</button>
                            <button type="button" data-text-choice="text-slate-700" class="text-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-slate-700</button>
                            <button type="button" data-text-choice="text-primary/40" class="text-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">text-primary/40</button>
                        </div>
                    </section>
                    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-inner lg:col-span-3">
                        <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Preview</span>
                            <span id="text-playground-status" class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">text-primary</span>
                        </div>
                        <div class="mt-4 rounded-lg bg-slate-50 p-5">
                            <p id="text-playground-target" class="text-center text-3xl font-bold text-primary transition-colors duration-300">语义化文本颜色</p>
                            <p class="mt-2 text-center text-sm text-slate-500">主题配置变化时，所有语义类一起响应。</p>
                        </div>
                        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600"><span class="text-slate-400">class</span> = <code id="text-playground-code" class="text-primary">"text-primary"</code></div>
                    </section>
                </div>
            </section>

            <!-- 模块 1：语义化色彩 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-aa text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">语义化排版 (Semantic Text)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 z-10 relative">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        ${semanticColors.map(color => `
                            <div class="color-copy-btn cursor-pointer group flex flex-col items-center p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all ${color.name === 'white' ? 'bg-slate-200 hover:bg-slate-300' : 'bg-white hover:bg-slate-50'}" data-clipboard="text-${color.name}">
                                <div class="h-12 flex items-center justify-center">
                                    <span class="text-2xl font-bold text-${color.name}">Aa</span>
                                </div>
                                <span class="font-bold mt-2 text-sm text-slate-700">${color.name}</span>
                                <span class="text-[10px] text-slate-400 mt-1 font-mono">${color.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：现代交互 & 渐变引擎 (统一浅色背景) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">高级修饰：悬浮、透明与渐变</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <!-- Hover 状态 -->
                        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group color-copy-btn cursor-pointer hover:border-primary/30 transition-colors" data-clipboard="text-slate-500 hover:text-primary">
                            <h4 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Hover 悬浮变色
                            </h4>
                            <div class="flex flex-col items-center justify-center py-4">
                                <span class="text-3xl font-bold text-slate-400 group-hover:text-primary transition-colors duration-300">交互之美</span>
                            </div>
                            <div class="mt-4 flex justify-center">
                                <code class="inline-code text-xs">text-slate-400 hover:text-primary</code>
                            </div>
                        </div>

                        <!-- Alpha 透明度 -->
                        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group color-copy-btn cursor-pointer hover:border-primary/30 transition-colors" data-clipboard="text-primary/40">
                            <!-- 灰白透明棋盘格背景，仅用于展示透明度 -->
                            <div class="absolute inset-0 z-0 bg-slate-50 opacity-50"></div>
                            
                            <h4 class="text-sm font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Alpha 文本透明度
                            </h4>
                            <div class="flex flex-col items-center justify-center py-4 relative z-10">
                                <span class="text-3xl font-bold text-primary/40 group-hover:text-primary/80 transition-colors duration-300">若隐若现</span>
                            </div>
                            <div class="mt-4 flex justify-center relative z-10">
                                <code class="inline-code text-xs bg-white/90 backdrop-blur-sm">text-primary/40</code>
                            </div>
                        </div>

                        <!-- 现代渐变文字 (恢复浅色外观) -->
                        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group color-copy-btn cursor-pointer hover:border-primary/30 transition-colors" data-clipboard="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                            <h4 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-blue-500"></span>现代渐变引擎
                            </h4>
                            <div class="flex flex-col items-center justify-center py-4">
                                <span class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 group-hover:from-pink-500 group-hover:to-orange-400 transition-all duration-500">渐变色彩</span>
                            </div>
                            <div class="mt-4 flex justify-center">
                                <code class="inline-code text-[10px] text-center leading-tight">
                                    text-transparent bg-clip-text<br>bg-gradient-to-r from-X to-Y
                                </code>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 3：标准色阶 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-palette text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">标准排版色阶 (Standard Text Palette)</cite>
                    </div>
                    <span class="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-slate-500 font-medium flex items-center gap-1"><i class="ph ph-hand-pointing"></i> 点击复制类名</span>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-1">
                    ${standardColors.map(color => renderTextRow(color)).join('')}
                </div>
            </div>

            <!-- 模块 4：中式拓展色阶 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-yin-yang text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">拓展：中式排版色阶 (Chinese Text Palette)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-1">
                    ${chineseColors.map(color => renderTextRow(color)).join('')}
                </div>
            </div>

        </div>
        `;
    }

    // 挂载逻辑：绑定纯 ESM 的 copyText
    static mount(container) {
        initCodeHighlighter();

        const target = container.querySelector('#text-playground-target');
        const status = container.querySelector('#text-playground-status');
        const code = container.querySelector('#text-playground-code');
        const buttons = container.querySelectorAll('.text-playground-btn');
        const choices = ['text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-slate-700', 'text-primary/40'];
        if (target && status && code) {
            buttons.forEach(button => button.addEventListener('click', () => {
                const value = button.dataset.textChoice;
                target.classList.remove(...choices);
                target.classList.add(value);
                status.textContent = value;
                code.textContent = `"${value}"`;
                buttons.forEach(item => {
                    const active = item === button;
                    item.classList.toggle('border-primary', active);
                    item.classList.toggle('bg-primary/10', active);
                    item.classList.toggle('text-primary', active);
                    item.classList.toggle('border-slate-200', !active);
                    item.classList.toggle('bg-white', !active);
                    item.classList.toggle('text-slate-700', !active);
                });
            }));
        }

        // 事件委托：无缝对接强大的外部复制模块
        container.addEventListener('click', async (e) => {
            const btn = e.target.closest('.color-copy-btn');
            if (btn) {
                const textToCopy = btn.getAttribute('data-clipboard');
                if (textToCopy) {
                    await copyText(textToCopy);
                }
            }
        });
    }

    // 全局搜索 API 配置
    static async onSearch(keyword) {
        const apiData = [
            { class: 'text-{color}-{weight}', desc: '设置文本颜色，例如 text-blue-500' },
            { class: 'text-primary / secondary', desc: '设置语义化主题文本颜色' },
            { class: 'hover:text-{color}', desc: '设置悬浮状态下的文本颜色' },
            { class: 'text-{color}/{opacity}', desc: '现代 Alpha 语法设置文本透明度，例如 text-black/50' },
            { class: 'text-transparent bg-clip-text', desc: '搭配渐变背景实现现代渐变文字效果' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'textcolor'
        }));
    }
}
