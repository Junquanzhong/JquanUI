// 🚀 Jquan Optimized: 文本换行与断词组件文档 (break.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class BreakDoc {
    static render() {
        // 长单词测试样本：包含一个超长无空格的 URL，才能真正测试出断词(Word Break)的特性
        const longWordText = "再美的花朵，盛开后就凋落，再亮眼的星，一闪过就坠落。The most beautiful flowers wither after they bloom; the brightest stars fall after a flash.";
        
        // 标题测试样本：用于测试 balance
        const balanceTitle = "JquanUI 4.19 排版能力更新：更稳定的标题换行体验";
        
        // 段落测试样本：故意制造最后一行只有一个词（孤儿词）的场景，用于测试 pretty
        const prettyText = "作为前端开发者，我们始终追求极致的用户体验与代码美学。良好的排版不仅能提升阅读效率，更是对设计初心的致敬。JquanUI，生而 卓越。";

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">换行与断词 (Break & Wrap)</li>
            </ul>

            <div class="mb-6 text-slate-600 text-sm leading-relaxed max-w-4xl">
                <p>在网页排版中，换行分为两个完全不同的维度：<br>
                1. <b>长单词断行 (Word Break)</b>：当遇到长链接、长英文单词时，是否允许在单词内部强行“咔嚓”切断以防止撑破容器。<br>
                2. <b>整体折行策略 (Text Wrap)</b>：控制标题或段落的整体外形，让排版看起来更平衡、更具美感（避免头重脚轻或孤字）。</p>
            </div>

            <!-- 模块 1：长单词断行策略 (Word Break) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-scissors text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">处理长单词/链接 (Word Break)</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">当文本中出现一条<b>超长且没有空格的链接</b>时，我们通过红色的容器警戒线，来看看这三个类的不同应对方式。</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <!-- break-normal -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-slate-800 text-sm">不处理 (Normal)</span>
                                    <code class="inline-code">break-normal</code>
                                </div>
                                <p class="text-xs text-slate-500">默认行为。长单词绝不屈服，直接撑破容器边缘，导致横向滚动条或破坏布局。</p>
                            </div>
                            <div class="flex-grow bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto custom-scrollbar p-6 relative">
                                <div class="relative w-40 min-w-[10rem] bg-white border border-slate-200 shadow-sm rounded-l">
                                    <div class="absolute top-0 right-0 bottom-0 w-px border-r-2 border-dashed border-red-400 z-10 pointer-events-none"></div>
                                    <div class="absolute -top-5 right-0 text-[10px] text-red-500 font-medium translate-x-1/2 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded z-20 shadow-sm">边界</div>
                                    <div class="break-normal p-3 text-sm text-slate-700 font-mono relative z-0">
                                        ${longWordText}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- break-words -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-slate-800 text-sm">温和断句 (Words)</span>
                                    <code class="inline-code text-emerald-600 border-emerald-200 bg-emerald-50">break-words</code>
                                </div>
                                <p class="text-xs text-slate-500">推荐做法。只有在单词实在太长、没有其他办法时，才会在长单词内部断开，保护布局完整。</p>
                            </div>
                            <div class="flex-grow bg-slate-50 rounded-lg border border-slate-200 overflow-hidden p-6 relative">
                                <div class="relative w-40 min-w-[10rem] bg-white border border-emerald-200 shadow-sm rounded-l ring-1 ring-emerald-500/20">
                                    <div class="absolute top-0 right-0 bottom-0 w-px border-r-2 border-dashed border-red-400 z-10 pointer-events-none"></div>
                                    <div class="break-words p-3 text-sm text-slate-700 font-mono relative z-0">
                                        ${longWordText}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- break-all -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-slate-800 text-sm">暴力切断 (All)</span>
                                    <code class="inline-code">break-all</code>
                                </div>
                                <p class="text-xs text-slate-500">无差别攻击。不管是不是长单词，一旦碰到边缘，立刻在任意字符间强行断开（适合纯字母/代码片段）。</p>
                            </div>
                            <div class="flex-grow bg-slate-50 rounded-lg border border-slate-200 overflow-hidden p-6 relative">
                                <div class="relative w-40 min-w-[10rem] bg-white border border-slate-200 shadow-sm rounded-l">
                                    <div class="absolute top-0 right-0 bottom-0 w-px border-r-2 border-dashed border-red-400 z-10 pointer-events-none"></div>
                                    <div class="break-all p-3 text-sm text-slate-700 font-mono relative z-0">
                                        ${longWordText}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：智能文本折行策略 (Text Wrap) - 排版美学 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between relative z-10">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-align-center text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">整体排版美学 (Text Wrap Strategies)</cite>
                    </div>
                </div>

                <div class="p-6 md:p-8">
                    <!-- Text Balance (平衡) -->
                    <div class="mb-10">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span>标题平衡 (Balance)</span>
                            <code class="inline-code">text-balance</code>
                        </h4>
                        <p class="text-sm text-slate-500 mb-4 max-w-3xl">极度适合<b>居中对齐的标题</b>。默认排版(wrap)会尽量填满第一行，导致最后一行可能只有几个字，头重脚轻；而 <code class="inline-code text-xs">text-balance</code> 会智能计算，让每一行的长度尽可能平均，视觉更稳重。</p>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                                <span class="text-xs text-slate-400 font-mono mb-3 uppercase tracking-wider">text-wrap (默认头重脚轻)</span>
                                <h1 class="text-wrap text-2xl font-bold text-slate-800 max-w-[280px] leading-tight border-b-2 border-red-300 pb-2">${balanceTitle}</h1>
                            </div>
                            <div class="bg-primary/5 p-6 rounded-lg border border-primary/20 flex flex-col items-center justify-center text-center">
                                <span class="text-xs text-primary font-mono mb-3 uppercase tracking-wider font-bold">text-balance (两端平衡 ✅)</span>
                                <h1 class="text-balance text-2xl font-bold text-slate-800 max-w-[280px] leading-tight border-b-2 border-emerald-400 pb-2">${balanceTitle}</h1>
                            </div>
                        </div>
                    </div>

                    <hr class="border-slate-100 mb-10">

                    <!-- Text Pretty (防孤字) -->
                    <div>
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span>防孤字排版 (Pretty)</span>
                            <code class="inline-code">text-pretty</code>
                        </h4>
                        <p class="text-sm text-slate-500 mb-4 max-w-3xl">极度适合<b>段落文本</b>。在传统排版中，段落的最后一行往往会落单一个词（排版学称之为“孤儿词”）。<code class="inline-code text-xs">text-pretty</code> 会智能微调前面的行，确保最后一行至少有一定长度，提升段落阅读舒适度。</p>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <span class="inline-block text-xs text-slate-400 font-mono mb-3 uppercase tracking-wider">text-wrap (可能出现孤字)</span>
                                <p class="text-wrap text-slate-700 leading-relaxed max-w-[250px] bg-white p-3 border border-slate-200 rounded shadow-sm">
                                    作为前端开发者，我们始终追求极致的用户体验与代码美学。良好的排版不仅能提升阅读效率，更是对设计初心的致敬。JquanUI，生而 <span class="bg-red-100 text-red-600 font-bold px-1 rounded">卓越。</span>
                                </p>
                            </div>
                            <div class="bg-primary/5 p-6 rounded-lg border border-primary/20">
                                <span class="inline-block text-xs text-primary font-mono mb-3 uppercase tracking-wider font-bold">text-pretty (优雅收尾 ✅)</span>
                                <p class="text-pretty text-slate-700 leading-relaxed max-w-[250px] bg-white p-3 border border-primary/20 rounded shadow-sm">
                                    作为前端开发者，我们始终追求极致的用户体验与代码美学。良好的排版不仅能提升阅读效率，更是对设计初心的致敬。JquanUI，<span class="bg-emerald-100 text-emerald-700 font-bold px-1 rounded">生而 卓越。</span>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
        `;
    }

    // 挂载逻辑
    static mount(container) {
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    // 全局搜索 API
    static async onSearch(keyword) {
        const apiData = [
            { class: 'break-normal', desc: '正常的换行行为，长单词可能会溢出容器' },
            { class: 'break-words', desc: '在确实无法排版时，允许在长单词内部换行' },
            { class: 'break-all', desc: '无论如何都在触碰边界时强制断开字符' },
            { class: 'text-wrap', desc: '默认文本换行策略' },
            { class: 'text-nowrap', desc: '强制不换行' },
            { class: 'text-balance', desc: '平衡各行的长度，极度适合居中对齐的短标题' },
            { class: 'text-pretty', desc: '防止段落最后一行出现“孤儿词”（单个单词）' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'break'
        }));
    }
}
