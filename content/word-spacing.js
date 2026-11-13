// 🚀 Jquan Optimized: 单词间距组件文档 (word-spacing.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class WordSpacingDoc {
    static render() {
        // 使用包含多个单词的经典测试句，最能体现单词间距的变化
        const demoText = "The quick brown fox jumps over the lazy dog.";

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">单词间距 (Word Spacing)</li>
            </ul>

            <div class="mb-8 text-slate-600 text-sm leading-relaxed max-w-4xl">
                <p>单词间距 (<code class="inline-code">word-spacing</code>) 用于调整文本中“空格”的宽度。与字母间距 (<code class="inline-code">tracking</code>) 拉开所有字符不同，它只改变词与词之间的距离。这在英文排版、标题设计以及解决两端对齐时的空白分布问题时非常有用。</p>
            </div>

            <!-- 模块 1：间距比例尺演示 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-columns text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">间距比例尺 (Spacing Scale)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <!-- Tighter -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">极紧 (Tighter)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">word-spacing-tighter</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded overflow-hidden">
                                <p class="word-spacing-tighter text-slate-800 font-medium whitespace-nowrap truncate" title="${demoText}">${demoText}</p>
                            </div>
                            <div class="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                                <span>CSS: -0.05em</span>
                            </div>
                        </div>

                        <!-- Tight -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">收紧 (Tight)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">word-spacing-tight</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded overflow-hidden">
                                <p class="word-spacing-tight text-slate-800 font-medium whitespace-nowrap truncate" title="${demoText}">${demoText}</p>
                            </div>
                            <div class="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                                <span>CSS: -0.025em</span>
                            </div>
                        </div>

                        <!-- Normal -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm flex items-center gap-1">正常 (Normal) <span class="w-2 h-2 rounded-full bg-green-500 inline-block ml-1" title="默认状态"></span></span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">word-spacing-normal</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded overflow-hidden">
                                <p class="word-spacing-normal text-slate-800 font-medium whitespace-nowrap truncate" title="${demoText}">${demoText}</p>
                            </div>
                            <div class="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                                <span>CSS: 0em (重置间距)</span>
                            </div>
                        </div>

                        <!-- Wide -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">宽松 (Wide)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">word-spacing-wide</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded overflow-hidden">
                                <p class="word-spacing-wide text-slate-800 font-medium whitespace-nowrap truncate" title="${demoText}">${demoText}</p>
                            </div>
                            <div class="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                                <span>CSS: 0.025em</span>
                            </div>
                        </div>

                        <!-- Wider -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">更宽 (Wider)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">word-spacing-wider</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded overflow-hidden">
                                <p class="word-spacing-wider text-slate-800 font-medium whitespace-nowrap truncate" title="${demoText}">${demoText}</p>
                            </div>
                            <div class="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                                <span>CSS: 0.05em</span>
                            </div>
                        </div>

                        <!-- Widest -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">极宽 (Widest)</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">word-spacing-widest</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded overflow-hidden">
                                <p class="word-spacing-widest text-slate-800 font-medium whitespace-nowrap truncate" title="${demoText}">${demoText}</p>
                            </div>
                            <div class="mt-3 flex justify-between items-center text-[11px] text-slate-400">
                                <span>CSS: 0.1em</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：架构师进阶 - Tracking vs Word Spacing -->
            <div class="mb-8 bg-sky-50/50 border border-sky-100 rounded-xl shadow-sm overflow-hidden relative">
                <div class="absolute top-0 right-0 -mt-2 -mr-2 text-sky-500/10 pointer-events-none">
                    <i class="ph ph-magic-wand text-8xl"></i>
                </div>
                
                <div class="p-6 md:p-8 relative z-10">
                    <h3 class="text-lg font-bold mb-3 text-slate-800 flex items-center gap-2">
                        <i class="ph ph-info text-sky-500"></i> 它和 tracking 有什么区别？
                    </h3>
                    <p class="text-slate-600 mb-6 text-sm leading-relaxed max-w-3xl">
                        初级开发者经常用 <code class="inline-code">tracking-widest</code> (letter-spacing) 来拉长标题，但这会导致<strong>每个字母</strong>都散开，降低了单词的可读性。高级排版的做法是：保持字母紧凑，仅用 <code class="inline-code">word-spacing</code> 拉开词的距离，保留单词的整体轮廓。
                    </p>

                    <!-- 对比演示 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- 错误示范 -->
                        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                            <div class="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
                            <div class="flex justify-between items-center mb-3 pl-2">
                                <span class="text-xs font-bold text-slate-500">❌ 仅使用 tracking-widest</span>
                            </div>
                            <div class="pl-2">
                                <p class="tracking-widest uppercase font-bold text-slate-800 text-sm">
                                    DESIGN SYSTEM ARCHITECTURE
                                </p>
                                <p class="text-[10px] text-slate-400 mt-2">字母过于松散，"SYSTEM" 看起来像六个独立的字母。</p>
                            </div>
                        </div>

                        <!-- 正确示范 -->
                        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                            <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                            <div class="flex justify-between items-center mb-3 pl-2">
                                <span class="text-xs font-bold text-slate-500">✅ tracking-wide + word-spacing-widest</span>
                            </div>
                            <div class="pl-2">
                                <p class="tracking-wide word-spacing-widest uppercase font-bold text-slate-800 text-sm">
                                    DESIGN SYSTEM ARCHITECTURE
                                </p>
                                <p class="text-[10px] text-slate-400 mt-2">单字母紧凑，词距拉开，块面感和阅读节奏极佳。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    // 挂载逻辑：初始化插件
    static mount(container) {
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    // 全局搜索 API
    static async onSearch(keyword) {
        const apiData = [
            { class: 'word-spacing-tighter', desc: '减少极多的单词间距 (-0.05em)' },
            { class: 'word-spacing-tight', desc: '减少少量的单词间距 (-0.025em)' },
            { class: 'word-spacing-normal', desc: '重置为默认的单词间距 (0em)' },
            { class: 'word-spacing-wide', desc: '增加少量的单词间距 (0.025em)' },
            { class: 'word-spacing-wider', desc: '增加适量的单词间距 (0.05em)' },
            { class: 'word-spacing-widest', desc: '增加大量的单词间距 (0.1em)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'word-spacing'
        }));
    }
}