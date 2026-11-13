// 🚀 Jquan Optimized: 渐变色组件文档 (gradient.js) - V3.8 数据驱动渲染版
import { initCodeHighlighter } from '../js/code-block.mjs';
import { copyText } from '../js/copy.mjs'; 

export default class GradientDoc {
    static render() {
        // -----------------------------------------------------------
        // 核心数据模型 (Data Models)
        // -----------------------------------------------------------
        
        const tailwindMixed = [
            "from-red-500 to-orange-500", "from-rose-400 to-red-500", "from-pink-500 to-rose-500", 
            "from-amber-200 to-yellow-400", "from-amber-200 to-yellow-500", "from-amber-500 to-pink-500",
            "from-violet-200 to-pink-200", "from-blue-200 to-cyan-200", "from-teal-200 to-teal-500",
            "from-lime-400 to-lime-500", "from-teal-400 to-yellow-200", "from-emerald-400 to-cyan-400",
            "from-indigo-400 to-cyan-400", "from-cyan-500 to-blue-500", "from-indigo-500 to-blue-500",
            "from-blue-600 to-violet-600", "from-fuchsia-500 to-cyan-500", "from-fuchsia-600 to-pink-600",
            "from-fuchsia-600 to-purple-600", "from-fuchsia-500 to-pink-500", "from-violet-500 to-purple-500", 
            "from-violet-600 to-indigo-600", "from-purple-500 to-purple-900", "from-blue-800 to-indigo-900", 
            "from-neutral-300 to-stone-400", "from-stone-500 to-stone-700", "from-slate-300 to-slate-500", 
            "from-emerald-500 to-emerald-900", "from-slate-900 to-slate-700"
        ];

        const tailwindMono = [
            "from-blue-900 to-blue-300", "from-green-800 via-green-600 to-green-400", 
            "from-orange-700 via-orange-500 to-orange-300", "from-purple-900 via-purple-600 to-purple-300",
            "from-red-800 via-red-600 to-red-400", "from-teal-700 via-teal-500 to-teal-300",
            "from-pink-700 via-pink-500 to-pink-300", "from-gray-800 via-gray-600 to-gray-400",
            "from-indigo-900 via-indigo-600 to-indigo-300", "from-yellow-400 to-yellow-200",
            "from-cyan-700 via-cyan-500 to-cyan-300", "from-lime-700 via-lime-500 to-lime-300",
            "from-amber-700 via-amber-500 to-amber-300", "from-emerald-500 to-emerald-900",
            "from-fuchsia-700 via-fuchsia-500 to-fuchsia-300", "from-rose-700 via-rose-500 to-rose-300",
            "from-violet-800 via-violet-600 to-violet-400", "from-sky-700 via-sky-500 to-sky-300",
            "from-slate-300 to-slate-500", "from-stone-700 via-stone-500 to-stone-300",
            "from-zinc-700 via-zinc-500 to-zinc-300"
        ];

        const tailwindDual = [
            "from-blue-900 to-purple-900", "from-orange-500 to-pink-500", "from-green-700 to-teal-500",
            "from-blue-400 to-cyan-300", "from-yellow-200 to-orange-400", "from-pink-600 to-purple-600",
            "from-green-900 to-emerald-300", "from-red-700 to-orange-500", "from-blue-100 to-indigo-300",
            "from-yellow-400 to-orange-600", "from-gray-400 to-blue-500", "from-pink-200 to-red-400",
            "from-blue-800 to-teal-600", "from-yellow-600 to-red-600", "from-purple-300 to-indigo-500",
            "from-yellow-300 to-lime-500", "from-blue-600 to-purple-800", "from-orange-200 to-pink-300",
            "from-cyan-400 to-blue-600", "from-amber-700 to-green-700", "from-rose-700 to-pink-700"
        ];

        const tailwindTri = [
            "from-red-500 via-yellow-300 to-blue-500", "from-green-400 via-yellow-200 to-blue-400",
            "from-orange-500 via-pink-400 to-purple-600", "from-blue-900 via-teal-500 to-cyan-200",
            "from-yellow-500 via-orange-600 to-red-700", "from-pink-300 via-yellow-200 to-green-400",
            "from-purple-800 via-pink-500 to-indigo-300", "from-blue-500 via-purple-400 to-red-500",
            "from-blue-600 via-purple-500 to-pink-400", "from-amber-600 via-green-500 to-yellow-200",
            "from-pink-400 via-yellow-300 to-cyan-300", "from-blue-900 via-purple-700 to-pink-500",
            "from-yellow-400 via-green-300 to-orange-500", "from-purple-400 via-pink-300 to-red-400",
            "from-blue-600 via-orange-400 to-pink-300", "from-green-800 via-lime-500 to-yellow-300",
            "from-orange-300 via-pink-200 to-purple-400", "from-blue-400 via-teal-300 to-green-200",
            "from-amber-400 via-orange-300 to-yellow-200", "from-gray-400 via-purple-300 to-blue-200",
            "from-rose-500 via-fuchsia-500 to-violet-500"
        ];

        const legacyV1 = [
            "seasalt", "taurine", "blueberry", "strawberry", "cranberry", 
            "lemon", "violetblue", "basalt", "iceblue", "straw", "fireunicorn"
        ];

        // -----------------------------------------------------------
        // 引擎处理器 (Engine Parsers)
        // -----------------------------------------------------------
        
        // 解析标准 Tailwind 渐变，自动生成类名和展示标签
        const parseTailwind = (list) => list.map(c => ({
            class: `bg-gradient-to-r ${c}`,
            label: c.split(' ').map(x => x.replace(/from-|via-|to-/, '')).join('→')
        }));

        // 解析 V1.3 老牌渐变预设
        const parseV1 = (list, glowing = false) => list.map(c => ({
            class: `bg-gradient bg-${c}${glowing ? ' glowing' : ''}`,
            label: c
        }));

        // 统一组件卡片渲染器
        const renderCards = (items) => {
            return items.map(item => `
                <div class="color-copy-btn cursor-pointer group flex flex-col gap-2" data-clipboard="${item.class}">
                    <!-- 绝对克制：仅用细边框和极浅的悬浮投影，去除变形拉伸 -->
                    <div class="${item.class} h-24 rounded-xl border border-slate-200/50 shadow-sm relative overflow-hidden transition-shadow duration-200 group-hover:shadow-md">
                        <!-- 悬浮交互层 -->
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span class="bg-white/95 text-slate-700 text-[10px] px-2 py-1 rounded shadow backdrop-blur-sm font-medium">复制类名</span>
                        </div>
                    </div>
                    <div class="text-center px-1">
                        <p class="text-[11px] font-mono text-slate-500 truncate group-hover:text-primary transition-colors" title="${item.label}">${item.label}</p>
                    </div>
                </div>
            `).join('');
        };

        // -----------------------------------------------------------
        // 视图拼装 (View Rendering)
        // -----------------------------------------------------------
        return `
        <div class="container pb-10 relative">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>色彩</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">渐变色 (Gradients)</li>
            </ul>

            <!-- 架构师指北 -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                <i class="ph-fill ph-swatches text-primary text-2xl mt-0.5"></i>
                <div>
                    <h3 class="font-bold text-primary mb-1">无界渐变引擎</h3>
                    <p class="text-primary/80 text-sm leading-relaxed mb-3">
                        以下示例展示常用渐变组合。JquanUI 4.19 的 JIT 会按实际出现的类生成规则，你可以像乐高一样自由拼装：
                    </p>
                    <ul class="text-primary/80 text-sm space-y-1 pl-4 list-disc">
                        <li><b>方向控制：</b>使用 <code class="inline-code bg-white text-primary">bg-gradient-to-{t|tr|r|br|b|bl|l|tl}</code> 定义方向。</li>
                        <li><b>色彩接力：</b>使用 <code class="inline-code bg-white text-sky-600">from-{color}</code> (起点)、<code class="inline-code bg-white text-sky-600">via-{color}</code> (中途点)、<code class="inline-code bg-white text-sky-600">to-{color}</code> (终点) 自由接力。</li>
                        <li><b>透明度通道：</b>所有颜色均支持 <code class="inline-code bg-white text-sky-600">from-blue-500/50</code> 这种带有 Alpha 通道的现代写法！</li>
                    </ul>
                </div>
            </div>

            <!-- 模块 1：主色混搭渐变 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-drop text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">主色渐变预设 (Mixed Gradients)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-4">
                        ${renderCards(parseTailwind(tailwindMixed))}
                    </div>
                </div>
            </div>

            <!-- 模块 2：单色系平滑渐变 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-waves text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">单色系渐变 (Monochromatic Gradients)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-4">
                        ${renderCards(parseTailwind(tailwindMono))}
                    </div>
                </div>
            </div>

            <!-- 模块 3：双色系跨越渐变 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-infinity text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">双色系渐变 (Dual-Tone Gradients)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-4">
                        ${renderCards(parseTailwind(tailwindDual))}
                    </div>
                </div>
            </div>

            <!-- 模块 4：三色系绚丽渐变 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-rainbow text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">三色系渐变 (Tri-Tone Gradients)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-4">
                        ${renderCards(parseTailwind(tailwindTri))}
                    </div>
                </div>
            </div>

            <!-- 模块 5：经典 V1.3 渐变库 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-archive text-slate-500 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">经典渐变 (V1.3 Legacy Gradients)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-4">
                        ${renderCards(parseV1(legacyV1, false))}
                    </div>
                </div>
            </div>

            <!-- 模块 6：发光特效 (Glowing) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-sparkle text-amber-500 text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">发光特效附加 (Glowing Effect)</cite>
                    </div>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-sm text-slate-500 mb-6"><i class="ph ph-info"></i> 在旧版类名后追加 <code class="inline-code">glowing</code> 即可激活阴影发光特效。请注意查看卡片周边的光晕。</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
                        ${renderCards(parseV1(legacyV1, true))}
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    // 挂载逻辑：统一事件委托复制与引擎魔法垫片 (V3.9)
    static mount(container) {
        initCodeHighlighter();

        // 渐变变量与 via stop 已由 Core 统一生成；文档页不再注入重复的全局 style 垫片。

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

    // API 检索配置
    static async onSearch(keyword) {
        const apiData = [
            { class: 'bg-gradient-to-{direction}', desc: '设置渐变方向，如 to-r, to-b, to-br 等' },
            { class: 'from-{color}', desc: '设置渐变起点颜色' },
            { class: 'via-{color}', desc: '设置渐变途经点颜色' },
            { class: 'to-{color}', desc: '设置渐变终点颜色' },
            { class: 'glowing', desc: '用于 V1.3 老牌渐变，触发发光特效' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'gradient'
        }));
    }
}
