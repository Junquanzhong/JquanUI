// 🚀 Jquan Optimized: 环颜色组件文档 (ringcolor.js) - V3.7 引擎重构完美版
import { initCodeHighlighter } from '../js/code-block.mjs';
import { copyText } from '../js/copy.mjs'; 
export default class RingColorDoc {
    static render() {
        const semanticColors = [
            { name: 'primary', label: '主题色' },
            { name: 'secondary', label: '次要色' },
            { name: 'success', label: '成功' },
            { name: 'danger', label: '危险' },
            { name: 'warning', label: '警告' },
            { name: 'important', label: '重要' },
            { name: 'special', label: '特殊' },
            { name: 'black', label: '纯黑' },
            { name: 'white', label: '纯白' } 
        ];
        const standardColors = ['slate', 'gray', 'zinc', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
        
        const chineseColors = [
            'placergold', 'coralorange', 'cherrypink', 'goldenmarigold', 'tomatored', 'watermelonred', 
            'mintgreen', 'skyazure', 'jadegreen', 'dodgerblue', 'royalblue', 'peace', 
            'graphite', 'silvergray', 'midnight', 'mistwhite', 'snowwhite', 'cloudgray'
        ];
        
        const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        // 完全剔除冗余类，使用标准的 ring-2 配合 ring-color 触发
        const renderRingRow = (colorName) => `
            <div class="flex items-center gap-3 md:gap-4 py-3 border-b border-slate-50 last:border-0">
                <div class="w-24 md:w-28 flex-shrink-0">
                    <span class="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        <i class="ph-fill ph-circle text-slate-300"></i> ${colorName}
                    </span>
                </div>
                <div class="flex-1 grid grid-cols-10 gap-2 md:gap-3 py-1">
                    ${weights.map(weight => `
                        <div class="relative flex flex-col items-center justify-center cursor-pointer color-copy-btn group h-10 md:h-12 rounded-md transition-colors duration-200 bg-white ring-2 ring-${colorName}-${weight}" data-clipboard="ring-2 ring-${colorName}-${weight}">
                            
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-700 border border-slate-200 shadow-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 font-medium z-30">复制类名</div>
                            
                            <span class="text-[9px] md:text-[10px] font-mono text-slate-400 group-hover:text-primary transition-colors duration-200">${weight}</span>
                            
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        return `
        <div class="container pb-10 relative">
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>色彩</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">环颜色 (Ring Color)</li>
            </ul>
            <!-- 模块 1：语义化环颜色 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-target text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">语义化环 (Semantic Rings)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 z-10 relative">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        ${semanticColors.map(color => `
                            <div class="color-copy-btn cursor-pointer group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 transition-colors ${color.name === 'white' ? 'bg-slate-200 hover:bg-slate-300' : 'bg-white hover:bg-slate-50'}" data-clipboard="ring ring-${color.name}">
                                <div class="w-16 h-10 rounded shadow-sm bg-white ring-2 ring-${color.name} mb-4 transition-all group-hover:ring-[3px]"></div>
                                <span class="font-bold text-sm ${color.name === 'white' ? 'text-slate-600' : 'text-slate-700'} group-hover:text-primary transition-colors">ring-${color.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <!-- 模块 2：高级修饰 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">状态与修饰 (Interactions & Offsets)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        <!-- Hover 状态 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative color-copy-btn cursor-pointer group" data-clipboard="hover:ring hover:ring-primary">
                            <h4 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>悬浮出环 (Hover)
                            </h4>
                            <div class="h-12 rounded border border-slate-200 bg-slate-50 flex items-center justify-center transition-shadow duration-200 text-xs text-slate-500 font-medium group-hover:ring-2 group-hover:ring-primary">
                                悬浮我试试
                            </div>
                            <div class="mt-6 text-center">
                                <code class="inline-code text-[10px]">hover:ring-primary</code>
                            </div>
                        </div>
                        <!-- Focus 状态 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative color-copy-btn cursor-pointer" data-clipboard="focus:ring-2 focus:ring-amber-400 focus:outline-none">
                            <h4 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>聚焦高亮 (Focus)
                            </h4>
                            <input type="text" placeholder="点击我获取焦点" class="w-full h-12 px-3 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-shadow">
                            <div class="mt-6 text-center">
                                <code class="inline-code text-[10px]">focus:ring-amber-400</code>
                            </div>
                        </div>
                        <!-- Alpha 透明度 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden color-copy-btn cursor-pointer" data-clipboard="ring-4 ring-primary/40">
                            <div class="absolute inset-0 z-0 bg-slate-50 opacity-40"></div>
                            <h4 class="text-sm font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>透明环 (Alpha)
                            </h4>
                            <div class="relative z-10 h-12 rounded bg-white border border-slate-200 ring-4 ring-primary/40 flex items-center justify-center text-xs text-primary font-bold mx-2">
                                40% 透明度环
                            </div>
                            <div class="mt-6 text-center relative z-10">
                                <code class="inline-code text-[10px] bg-white/90 backdrop-blur-sm">ring-primary/40</code>
                            </div>
                        </div>
                        <!-- 偏移环颜色 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative color-copy-btn cursor-pointer group" data-clipboard="ring-2 ring-blue-500 ring-offset-2 ring-offset-red-100">
                            <h4 class="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>偏移环 (Offset)
                            </h4>
                            <div class="h-12 rounded bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-600 font-medium ring-2 ring-blue-500 ring-offset-2 ring-offset-red-500 mx-2 transition-all">
                                蓝环 + 红垫底
                            </div>
                            <div class="mt-6 flex flex-col gap-1 items-center">
                                <code class="inline-code text-[9px] leading-tight block text-center">ring-offset-red-100</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 模块 3：标准环色阶 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-palette text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">标准环色阶 (Standard Ring Palette)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-3">
                    ${standardColors.map(color => renderRingRow(color)).join('')}
                </div>
            </div>
            <!-- 模块 4：中式拓展环色阶 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-yin-yang text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">拓展：中式环色阶 (Chinese Ring Palette)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-3">
                    ${chineseColors.map(color => renderRingRow(color)).join('')}
                </div>
            </div>
        </div>
        `;
    }
    static mount(container) {
        initCodeHighlighter();
        // 💡 Jquan 核心魔法：向页面动态注入引擎缺失的 box-shadow 扳机！
        // 若项目需要固定的全局规则，再将这段 CSS 放入项目样式；单个元素优先使用原子类。
        if (!document.getElementById('jquan-engine-polyfill')) {
            const style = document.createElement('style');
            style.id = 'jquan-engine-polyfill';
            style.innerHTML = `
                /* 补全引擎缺失的全局变量分发与属性赋值 */
                *, ::before, ::after {
                    /* 初始化防崩变量 */
                    --jquan-ring-inset: ;
                    --jquan-ring-offset-width: 0px;
                    --jquan-ring-offset-color: #fff;
                    --jquan-ring-color: rgba(59, 130, 246, 0.5); /* 默认环颜色 */
                    
                    /* 动态拼合 offset 阴影（你的原引擎漏了这步） */
                    --jquan-ring-offset-shadow: 0 0 0 var(--jquan-ring-offset-width) var(--jquan-ring-offset-color);
                    
                    /* 默认无阴影 */
                    --jquan-ring-shadow: 0 0 #0000;
                    --jquan-shadow: 0 0 #0000;
                    
                    /* 🔫 终极扳机：将三个阴影图层合并渲染！ */
                    box-shadow: var(--jquan-ring-offset-shadow), var(--jquan-ring-shadow), var(--jquan-shadow);
                }
            `;
            document.head.appendChild(style);
        }
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
            { class: 'ring-{color}-{weight}', desc: '设置环(外阴影)颜色，例如 ring-blue-500' },
            { class: 'ring-primary / secondary', desc: '设置语义化主题环颜色' },
            { class: 'hover:ring-{color}', desc: '设置悬浮状态下的环颜色' },
            { class: 'focus:ring-{color}', desc: '设置获取焦点状态下的环颜色 (常用于表单元素)' },
            { class: 'ring-{color}/{opacity}', desc: '现代 Alpha 语法设置环透明度，例如 ring-black/20' },
            { class: 'ring-offset-{color}-{weight}', desc: '设置环偏移(内层垫底)的颜色' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'ringcolor'
        }));
    }
}
