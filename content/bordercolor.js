// 🚀 Jquan Optimized: 边框颜色组件文档 (bordercolor.js) - V3.4 纯净克制版
import { initCodeHighlighter } from '../js/code-block.mjs';
import { copyText } from '../js/copy.mjs'; // 接入纯 ESM 复制模块

export default class BorderColorDoc {
    static render() {
        // 数据驱动：语义化与基础边框色
        const semanticColors = [
            { name: 'light', label: '默认浅边框' },
            { name: 'strong', label: '默认深边框' },
            { name: 'primary', label: '主题色' },
            { name: 'secondary', label: '次要色' },
            { name: 'success', label: '成功' },
            { name: 'danger', label: '危险' },
            { name: 'warning', label: '警告' },
            { name: 'important', label: '重要' },
            { name: 'special', label: '特殊' },
            { name: 'black', label: '纯黑' },
            { name: 'white', label: '纯白' } // 纯白会单独处理浅灰背景以便展示
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

        // 渲染边框色阶行的辅助函数 (绝对禁止形变，保持统一白底)
        // 架构师巧思：使用 border-2 让边框颜色更清晰可见，内部留白，悬浮时背景仅微微变灰
        const renderBorderRow = (colorName) => `
            <div class="flex items-center gap-3 md:gap-4 py-3 border-b border-slate-50 last:border-0">
                <div class="w-24 md:w-28 flex-shrink-0">
                    <span class="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        <i class="ph-fill ph-square text-slate-300"></i> ${colorName}
                    </span>
                </div>
                <div class="flex-1 grid grid-cols-10 gap-1.5 md:gap-2">
                    ${weights.map(weight => `
                        <div class="relative flex flex-col items-center justify-center cursor-pointer color-copy-btn group h-12 md:h-14 rounded transition-colors duration-200 bg-white hover:bg-slate-50 border-2 border-${colorName}-${weight}" data-clipboard="border-${colorName}-${weight}">
                            
                            <!-- 悬浮提示 -->
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-700 border border-slate-200 shadow-sm text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 font-medium z-30">复制类名</div>
                            
                            <!-- 内部权重数值 -->
                            <span class="text-[9px] md:text-[10px] font-mono text-slate-400 group-hover:text-primary transition-colors duration-200">${weight}</span>
                            
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return `
        <div class="container pb-10 relative">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>边框</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">边框颜色 (Border Color)</li>
            </ul>

            <!-- 模块 1：语义化边框颜色 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">语义化边框 (Semantic Borders)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 z-10 relative">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        ${semanticColors.map(color => `
                            <!-- 若为纯白边框，底色使用浅灰以便凸显，其他全用白底 -->
                            <div class="color-copy-btn cursor-pointer group flex flex-col items-center justify-center h-24 rounded-xl border-2 border-${color.name} transition-colors ${color.name === 'white' ? 'bg-slate-200 hover:bg-slate-300' : 'bg-white hover:bg-slate-50'} shadow-sm hover:shadow-md" data-clipboard="border-${color.name}">
                                <span class="font-bold text-sm ${color.name === 'white' ? 'text-slate-600' : 'text-slate-700'} group-hover:text-primary transition-colors">border-${color.name}</span>
                                <span class="text-[10px] text-slate-400 mt-1 font-mono">${color.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：高级修饰 (Hover / Focus / Alpha / 渐变) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">交互与高级效果 (Interactions & Effects)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <!-- Hover 状态 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative color-copy-btn cursor-pointer" data-clipboard="border-slate-200 hover:border-primary">
                            <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>悬浮变色 (Hover)
                            </h4>
                            <div class="h-12 rounded border-2 border-slate-200 hover:border-primary bg-slate-50 flex items-center justify-center transition-colors duration-200 text-xs text-slate-500 font-medium">
                                悬浮我试试
                            </div>
                            <div class="mt-4 text-center">
                                <code class="inline-code text-[10px]">hover:border-primary</code>
                            </div>
                        </div>

                        <!-- Focus 状态 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative color-copy-btn cursor-pointer" data-clipboard="focus:border-amber-400 focus:bg-amber-50">
                            <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>聚焦变色 (Focus)
                            </h4>
                            <input type="text" placeholder="点击我获取焦点" class="w-full h-12 px-3 text-xs bg-slate-50 border-2 border-slate-200 rounded outline-none focus:border-amber-400 focus:bg-amber-50 transition-colors shadow-inner">
                            <div class="mt-4 text-center">
                                <code class="inline-code text-[10px]">focus:border-amber-400</code>
                            </div>
                        </div>

                        <!-- Alpha 透明度 -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden color-copy-btn cursor-pointer" data-clipboard="border-primary/30">
                            <div class="absolute inset-0 z-0 bg-slate-50 opacity-40"></div>
                            <h4 class="text-sm font-bold text-slate-800 mb-4 relative z-10 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>透明边框 (Alpha)
                            </h4>
                            <div class="relative z-10 h-12 rounded border-[3px] border-primary/30 bg-white/80 backdrop-blur-sm flex items-center justify-center text-xs text-primary font-bold">
                                30% 透明边框
                            </div>
                            <div class="mt-4 text-center relative z-10">
                                <code class="inline-code text-[10px] bg-white/90">border-primary/30</code>
                            </div>
                        </div>

                        <!-- 现代渐变边框 (依赖引擎支持) -->
                        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative color-copy-btn cursor-pointer" data-clipboard="border-gradient-to-r from-teal-400 to-blue-500">
                            <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-blue-500"></span>渐变边框 (Gradient)
                            </h4>
                            <!-- JquanUI 引擎专属渐变边框类名演示 -->
                            <div class="h-12 rounded border-2 border-transparent border-gradient-to-r from-teal-400 to-blue-500 bg-white flex items-center justify-center text-xs text-slate-600 font-medium">
                                渐变之美
                            </div>
                            <div class="mt-4 text-center">
                                <code class="inline-code text-[9px] leading-tight text-center block">border-gradient-to-r<br>from-teal-400 to-blue-500</code>
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
                        <cite class="font-bold text-slate-800 not-italic">标准边框色阶 (Standard Border Palette)</cite>
                    </div>
                    <span class="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-slate-500 font-medium flex items-center gap-1"><i class="ph ph-hand-pointing"></i> 点击复制类名</span>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-1">
                    ${standardColors.map(color => renderBorderRow(color)).join('')}
                </div>
            </div>

            <!-- 模块 4：中式拓展色阶 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-yin-yang text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">拓展：中式边框色阶 (Chinese Border Palette)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8 flex flex-col gap-1">
                    ${chineseColors.map(color => renderBorderRow(color)).join('')}
                </div>
            </div>

        </div>
        `;
    }

    // 挂载逻辑：绑定纯 ESM 的 copyText
    static mount(container) {
        initCodeHighlighter();

        // 顶层事件委托：统一处理复制操作
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
            { class: 'border-{color}-{weight}', desc: '设置边框颜色，例如 border-blue-500' },
            { class: 'border-light / strong', desc: '设置默认的浅色或深色基础边框' },
            { class: 'border-primary / secondary', desc: '设置语义化主题边框颜色' },
            { class: 'hover:border-{color}', desc: '设置悬浮状态下的边框颜色' },
            { class: 'focus:border-{color}', desc: '设置获取焦点状态下的边框颜色 (常用于输入框)' },
            { class: 'border-{color}/{opacity}', desc: '现代 Alpha 语法设置边框透明度，例如 border-black/20' },
            { class: 'border-gradient-to-r', desc: '设置渐变色边框 (需配合 from-* 和 to-* 使用)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'bordercolor'
        }));
    }
}