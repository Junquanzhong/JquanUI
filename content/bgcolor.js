// 🚀 Jquan Optimized: 背景颜色与修饰组件文档 (bgcolor.js) - V3.2
import { initCodeHighlighter } from '../js/code-block.mjs';
import { copyText } from '../js/copy.mjs'; // 接入纯 ESM 复制模块

export default class BgColorDoc {
    static render() {
        // 数据驱动：语义化色彩
        const semanticColors = [
            { name: 'primary', hex: '主题色' },
            { name: 'secondary', hex: '次要色' },
            { name: 'success', hex: '成功' },
            { name: 'danger', hex: '危险' },
            { name: 'warning', hex: '警告' },
            { name: 'important', hex: '重要' },
            { name: 'special', hex: '特殊' },
            { name: 'black', hex: '纯黑' },
            { name: 'white', hex: '纯白', border: true }
        ];

        // 数据驱动：标准色阶
        const standardColors = ['slate', 'gray', 'zinc', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
        
        // 数据驱动：扩展中式色阶 (已迁移至引擎核心或全局配置，此处仅负责渲染视图)
        const chineseColors = [
            'placergold', 'coralorange', 'cherrypink', 'goldenmarigold', 'tomatored', 'watermelonred', 
            'mintgreen', 'skyazure', 'jadegreen', 'dodgerblue', 'royalblue', 'peace', 
            'graphite', 'silvergray', 'midnight', 'mistwhite', 'snowwhite', 'cloudgray'
        ];
        
        const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

        // 渲染色阶行的辅助函数 (极简高定版：全局采用 hover:opacity-90 实现克制的透明度交互)
        const renderColorRow = (colorName) => `
            <div class="flex items-center gap-3 md:gap-4 py-2.5 border-b border-slate-50 last:border-0">
                <div class="w-24 md:w-28 flex-shrink-0">
                    <span class="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        <i class="ph-fill ph-drop text-slate-300"></i> ${colorName}
                    </span>
                </div>
                <div class="flex-1 grid grid-cols-10 gap-1.5 md:gap-3">
                    ${weights.map(weight => `
                        <div class="relative flex flex-col items-center cursor-pointer color-copy-btn" data-clipboard="bg-${colorName}-${weight}">
                            
                            <!-- 核心色块：统一使用 hover:opacity-90，去除干扰性的形变与底色改变 -->
                            <div class="peer w-full h-8 md:h-10 rounded shadow-sm bg-${colorName}-${weight} border border-slate-200/50 hover:opacity-90 transition-opacity duration-200 relative z-10"></div>
                            
                            <!-- 悬浮提示：受 peer-hover 控制 -->
                            <div class="absolute -top-9 left-1/2 -translate-x-1/2 bg-white text-slate-700 border border-slate-200 shadow-sm text-[10px] px-2 py-1 rounded opacity-0 peer-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 font-medium z-30">点击复制</div>
                            
                            <!-- 底部文本 -->
                            <span class="text-[10px] md:text-xs text-slate-400 mt-1.5 font-mono peer-hover:text-primary transition-colors duration-200">${weight}</span>
                            
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
                <li class="text-slate-800 font-medium">背景 (Background)</li>
            </ul>

            <section class="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                <header class="flex flex-col justify-between gap-3 border-b border-primary/10 bg-white/60 px-6 py-4 sm:flex-row sm:items-center">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-paint-brush-broad text-xl text-primary"></i>
                        <h1 class="font-bold text-slate-800">背景颜色实验室 Playground</h1>
                    </div>
                    <span class="w-fit rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </header>
                <div class="grid gap-6 p-6 md:p-8 lg:grid-cols-5">
                    <section class="space-y-4 lg:col-span-2">
                        <div>
                            <h2 class="mb-1 text-sm font-bold text-slate-800">语义色优先</h2>
                            <p class="text-sm leading-relaxed text-slate-600">先使用主题语义色，透明度通过斜杠后缀表达；品牌色只在配置中维护一次。</p>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" data-bg-choice="bg-primary" class="bg-playground-btn rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary">bg-primary</button>
                            <button type="button" data-bg-choice="bg-secondary" class="bg-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">bg-secondary</button>
                            <button type="button" data-bg-choice="bg-success" class="bg-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">bg-success</button>
                            <button type="button" data-bg-choice="bg-warning" class="bg-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">bg-warning</button>
                            <button type="button" data-bg-choice="bg-danger" class="bg-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">bg-danger</button>
                            <button type="button" data-bg-choice="bg-primary/20" class="bg-playground-btn rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700">bg-primary/20</button>
                        </div>
                    </section>
                    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-inner lg:col-span-3">
                        <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Preview</span>
                            <span id="bg-playground-status" class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">bg-primary</span>
                        </div>
                        <div class="mt-4 rounded-lg bg-slate-50 p-5">
                            <div id="bg-playground-surface" class="flex min-h-32 items-center justify-center rounded-xl bg-primary p-6 text-center text-white shadow-lg transition-colors duration-300">
                                <div>
                                    <p class="text-xl font-bold">主题背景色</p>
                                    <p class="mt-1 text-sm text-white/80">点击左侧语义类观察透明度和颜色变化</p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-600"><span class="text-slate-400">class</span> = <code id="bg-playground-code" class="text-primary">"bg-primary"</code></div>
                    </section>
                </div>
            </section>

            <!-- 模块 1：语义化色彩 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-swatches text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">语义化色彩 (Semantic Colors)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 z-10 relative">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        ${semanticColors.map(color => `
                            <!-- 卡片整体也去除了干扰背景色的交互 -->
                            <div class="color-copy-btn cursor-pointer group flex flex-col items-center bg-white p-5 rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all" data-clipboard="bg-${color.name}">
                                <!-- 圆形色块统一采用 group-hover:opacity-90 -->
                                <div class="w-14 h-14 rounded-full bg-${color.name} ${color.border ? 'border-2 border-slate-200' : 'shadow-inner'} mb-3 group-hover:opacity-90 transition-opacity duration-200 relative"></div>
                                <span class="font-bold text-slate-700 text-sm">${color.name}</span>
                                <span class="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider">${color.hex}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：状态交互与透明度 (使用浅色棋盘格背景演示透明度) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">交互与透明度 (Interactions & Opacity)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <!-- 悬浮与聚焦 -->
                        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                            <div class="absolute top-4 right-4 text-slate-200"><i class="ph-fill ph-cursor text-4xl"></i></div>
                            <h4 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>状态修饰符 (Hover & Focus)
                            </h4>
                            <div class="flex flex-col gap-6 relative z-10">
                                <div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div class="w-24 h-10 rounded bg-slate-200 hover:bg-primary transition-colors cursor-pointer flex items-center justify-center text-xs text-slate-500 hover:text-white shadow-sm font-medium">悬浮我试试</div>
                                    <code class="inline-code">hover:bg-primary</code>
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <input type="text" placeholder="点击输入框聚焦" class="w-32 px-3 py-2 text-sm border border-slate-300 rounded outline-none focus:bg-amber-50 focus:border-amber-400 transition-colors shadow-inner">
                                    <code class="inline-code">focus:bg-amber-50</code>
                                </div>
                            </div>
                        </div>

                        <!-- 现代透明度语法：使用设计师最爱的灰白棋盘格背景展示 -->
                        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <!-- 灰白透明棋盘格背景 SVG -->
                            <div class="absolute inset-0 z-0 bg-slate-50 opacity-60"></div>
                            
                            <h4 class="text-sm font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>现代 Alpha 透明度语法
                            </h4>
                            
                            <div class="flex gap-4 relative z-10 items-end">
                                <div class="flex flex-col items-center gap-2">
                                    <div class="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shadow-sm backdrop-blur-[2px] ring-1 ring-primary/10">/20</div>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <div class="w-14 h-14 rounded-lg bg-primary/40 flex items-center justify-center text-primary text-sm font-bold shadow-sm backdrop-blur-[2px] ring-1 ring-primary/20">/40</div>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <div class="w-14 h-14 rounded-lg bg-primary/60 flex items-center justify-center text-white text-sm font-bold shadow-sm backdrop-blur-[2px] ring-1 ring-primary/30">/60</div>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <div class="w-14 h-14 rounded-lg bg-primary/80 flex items-center justify-center text-white text-sm font-bold shadow-sm backdrop-blur-[2px] ring-1 ring-primary/40">/80</div>
                                </div>
                            </div>
                            
                            <div class="mt-6 relative z-10 bg-white/90 p-3 rounded-lg border border-slate-100 flex items-center justify-between shadow-sm">
                                <span class="text-xs text-slate-500 font-medium">在任意颜色后追加斜杠即可</span>
                                <code class="inline-code bg-emerald-50 text-emerald-600 border-emerald-100">bg-primary/40</code>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 3：标准色阶 (清爽高密度网格) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-palette text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">标准色阶 (Standard Palette)</cite>
                    </div>
                    <span class="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-slate-500 font-medium flex items-center gap-1"><i class="ph ph-hand-pointing"></i> 点击色块复制类名</span>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-2">
                    ${standardColors.map(color => renderColorRow(color)).join('')}
                </div>
            </div>

            <!-- 模块 4：中式拓展色阶 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-yin-yang text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">拓展：中式色阶 (Chinese Palette)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-2">
                    ${chineseColors.map(color => renderColorRow(color)).join('')}
                </div>
            </div>

            <!-- 模块 5：背景修饰工具属性 (现代化浅色表格) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-wrench text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">背景修饰工具 (Background Utilities)</cite>
                    </div>
                </div>
                <div class="p-6">
                    <div class="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                        <table class="w-full text-left text-sm text-slate-600 border-collapse bg-white">
                            <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
                                <tr>
                                    <th class="px-6 py-4 font-bold w-1/5">分类 (Category)</th>
                                    <th class="px-6 py-4 font-bold w-1/4">类名 (Class)</th>
                                    <th class="px-6 py-4 font-bold w-1/4">CSS 属性</th>
                                    <th class="px-6 py-4 font-bold">描述 (Description)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <!-- 背景尺寸 -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5 align-top font-bold text-slate-800 bg-slate-50/30" rowspan="3">Size (尺寸)</td>
                                    <td class="px-6 py-3"><code class="inline-code">bg-auto</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-size: auto;</code></td>
                                    <td class="px-6 py-3 text-slate-500">保持原始尺寸</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-3"><code class="inline-code">bg-cover</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-size: cover;</code></td>
                                    <td class="px-6 py-3 text-slate-500">完全覆盖背景区域，可能会被裁剪</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                                    <td class="px-6 py-3"><code class="inline-code">bg-contain</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-size: contain;</code></td>
                                    <td class="px-6 py-3 text-slate-500">完全可见，可能会留白</td>
                                </tr>
                                
                                <!-- 背景附着 -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5 align-top font-bold text-slate-800 bg-slate-50/30" rowspan="3">Attachment (附着)</td>
                                    <td class="px-6 py-3"><code class="inline-code">bg-fixed</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-attachment: fixed;</code></td>
                                    <td class="px-6 py-3 text-slate-500">背景固定，不随内容滚动（常用于视差滚动）</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-3"><code class="inline-code">bg-local</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-attachment: local;</code></td>
                                    <td class="px-6 py-3 text-slate-500">随元素内容的滚动而滚动</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                                    <td class="px-6 py-3"><code class="inline-code">bg-scroll</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-attachment: scroll;</code></td>
                                    <td class="px-6 py-3 text-slate-500">默认值，不随自身滚动，但随页面滚动</td>
                                </tr>

                                <!-- 背景位置 -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5 align-top font-bold text-slate-800 bg-slate-50/30" rowspan="2">Position (位置)</td>
                                    <td class="px-6 py-3"><code class="inline-code">bg-center / top / bottom</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-position: {pos};</code></td>
                                    <td class="px-6 py-3 text-slate-500">将背景图片对齐到对应边缘</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                                    <td class="px-6 py-3"><code class="inline-code">bg-top-left / bottom-right</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-position: {x} {y};</code></td>
                                    <td class="px-6 py-3 text-slate-500">将背景图片对齐到对应角落</td>
                                </tr>

                                <!-- 背景重复 -->
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-5 align-top font-bold text-slate-800 bg-slate-50/30" rowspan="3">Repeat (重复)</td>
                                    <td class="px-6 py-3"><code class="inline-code">bg-no-repeat</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-repeat: no-repeat;</code></td>
                                    <td class="px-6 py-3 text-slate-500">不重复，仅显示一次</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-3"><code class="inline-code">bg-repeat</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-repeat: repeat;</code></td>
                                    <td class="px-6 py-3 text-slate-500">水平和垂直平铺（默认）</td>
                                </tr>
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-3"><code class="inline-code">bg-repeat-x / bg-repeat-y</code></td>
                                    <td class="px-6 py-3"><code class="inline-code">background-repeat: repeat-x / y;</code></td>
                                    <td class="px-6 py-3 text-slate-500">仅在单方向平铺</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // 挂载逻辑：绑定纯 ESM 的 copyText
    static mount(container) {
        initCodeHighlighter();

        const surface = container.querySelector('#bg-playground-surface');
        const status = container.querySelector('#bg-playground-status');
        const code = container.querySelector('#bg-playground-code');
        const buttons = container.querySelectorAll('.bg-playground-btn');
        const choices = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-primary/20'];
        if (surface && status && code) {
            buttons.forEach(button => button.addEventListener('click', () => {
                const value = button.dataset.bgChoice;
                surface.classList.remove(...choices);
                surface.classList.add(value);
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

        // 委托绑定所有带有 .color-copy-btn 的元素
        container.addEventListener('click', async (e) => {
            const btn = e.target.closest('.color-copy-btn');
            if (btn) {
                const textToCopy = btn.getAttribute('data-clipboard');
                if (textToCopy) {
                    // 调用分离解耦后的纯净复制模块，自带 Toast 回调！
                    await copyText(textToCopy);
                }
            }
        });
    }

    // 全局搜索 API
    static async onSearch(keyword) {
        const apiData = [
            { class: 'bg-{color}-{weight}', desc: '设置背景颜色，例如 bg-blue-500' },
            { class: 'bg-primary / secondary', desc: '设置语义化主题背景颜色' },
            { class: 'hover:bg-{color}', desc: '设置悬浮状态下的背景颜色' },
            { class: 'focus:bg-{color}', desc: '设置聚焦状态下的背景颜色' },
            { class: 'bg-{color}/{opacity}', desc: '现代 Alpha 语法设置背景透明度，例如 bg-black/50' },
            { class: 'bg-cover / contain', desc: '控制背景图片的尺寸行为' },
            { class: 'bg-fixed / local / scroll', desc: '控制背景图片的附着行为' },
            { class: 'bg-no-repeat', desc: '禁止背景图片重复平铺' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'bgcolor'
        }));
    }
}
