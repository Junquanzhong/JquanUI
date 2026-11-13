// 🚀 Jquan Optimized: 大小写转换组件文档 (transform.js / text-transform.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class TransformDoc {
    static render() {
        const demoText = "jquan UI framework is absolutely awesome!";
        const smallCapsDemoText = "Jquan UI framework is built for P8 Engineers.";

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">文本转换 (Text Transform)</li>
            </ul>

            <div class="mb-8 text-slate-600 text-sm">
                <p>文本转换与字体变体属性用于控制英文字母（或拉丁语系）的大小写及形态显示。通过这些原子类，我们可以在不修改原始 HTML 数据的前提下，赋予文本更高级的视觉排版效果。</p>
            </div>

            <!-- 模块 1：核心转换类演示 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-aa text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">核心转换一览 (Core Transforms)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <!-- Uppercase -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">全部大写</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">uppercase</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded">
                                <p class="uppercase text-slate-800 font-medium">${demoText}</p>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">常用于警示语、小型标题或徽章 (Badge) 的文字表现。</p>
                        </div>

                        <!-- Lowercase -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">全部小写</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">lowercase</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded">
                                <p class="lowercase text-slate-800 font-medium">JQUAN UI FRAMEWORK IS ABSOLUTELY AWESOME!</p>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">强行将所有字母转换为小写，无视原始 HTML 数据的大小写。</p>
                        </div>

                        <!-- Capitalize -->
                        <div class="border border-slate-200 rounded-lg p-5 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <span class="text-slate-700 font-bold text-sm">首字母大写</span>
                                <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">capitalize</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded">
                                <p class="capitalize text-slate-800 font-medium">${demoText}</p>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">每个单词的首字母都会被大写，常用于人名、地名或标准标题排版。</p>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：高级排版 - 小型大写字母 (Small Caps) 🚀 引擎 3.7 新增 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-indigo-50/50 border-b border-indigo-100 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-t text-indigo-500 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">高级排版：小型大写字母 (Small Caps)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-sm text-slate-500 mb-6 leading-relaxed">
                        小型大写字母是一种高级字体排版技术。它会将文本中的小写字母，替换为与小写字母高度相同（或略高）的大写字母形状。这在 Dashboard 仪表盘数据标签、专业报表、缩写词排版时极具视觉高级感，能避免常规大写字母破坏文本行的整体灰度。
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <!-- Small Caps -->
                        <div class="border border-indigo-100 rounded-lg p-5 bg-indigo-50/30 hover:bg-white hover:border-indigo-300 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-indigo-50 pb-3">
                                <span class="text-slate-700 font-bold text-sm">小型大写</span>
                                <code class="text-xs font-mono text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded">small-caps</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded">
                                <p class="small-caps text-slate-800 font-medium text-lg">${smallCapsDemoText}</p>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">原有大写字母保持原样，原有小写字母转为“小型大写”。这是最经典的用法。</p>
                        </div>

                        <!-- All Small Caps -->
                        <div class="border border-indigo-100 rounded-lg p-5 bg-indigo-50/30 hover:bg-white hover:border-indigo-300 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-indigo-50 pb-3">
                                <span class="text-slate-700 font-bold text-sm">全小型大写</span>
                                <code class="text-xs font-mono text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded">all-small-caps</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded">
                                <p class="all-small-caps text-slate-800 font-medium text-lg">${smallCapsDemoText}</p>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">强制将整段文本（包括原来的大写字母）全部转为统一高度的小型大写字母。</p>
                        </div>

                        <!-- Titling Caps -->
                        <div class="border border-indigo-100 rounded-lg p-5 bg-indigo-50/30 hover:bg-white hover:border-indigo-300 transition-colors group shadow-sm">
                            <div class="flex items-center justify-between mb-4 border-b border-indigo-50 pb-3">
                                <span class="text-slate-700 font-bold text-sm">标题大写</span>
                                <code class="text-xs font-mono text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded">titling-caps</code>
                            </div>
                            <div class="bg-white p-3 border border-dashed border-slate-300 rounded">
                                <p class="titling-caps text-slate-800 font-medium text-lg">${smallCapsDemoText}</p>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">专为大字号标题设计的变体，通常字重会显得更轻盈（取决于字体文件是否包含该字形）。</p>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 3：架构师进阶 - normal-case 的意义 -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden relative">
                <div class="absolute top-0 right-0 -mt-2 -mr-2 text-primary/10 pointer-events-none">
                    <i class="ph ph-lightbulb text-8xl"></i>
                </div>
                
                <div class="p-6 md:p-8 relative z-10">
                    <h3 class="text-lg font-bold mb-3 text-slate-800 flex items-center gap-2">
                        <i class="ph ph-info text-primary"></i> normal-case 到底怎么用？
                    </h3>
                    <p class="text-slate-600 mb-6 text-sm leading-relaxed max-w-3xl">
                        原子类最怕的就是 CSS 层叠继承。例如：一个卡片组件的最外层定义了全大写，但你希望卡片内部的某行描述文字恢复原始模样，这时就需要使用 <code>normal-case</code> 强制重置。
                    </p>

                    <!-- 演示继承覆盖 -->
                    <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm max-w-2xl">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-bold text-slate-700">父级元素被设置了 uppercase 💥</span>
                        </div>
                        
                        <!-- 父级容器加上 uppercase -->
                        <div class="uppercase p-4 bg-slate-50 border border-dashed border-slate-200 rounded">
                            <p class="text-sm text-slate-500 mb-2">this is title (受父级影响，全大写了)</p>
                            
                            <!-- 子元素使用 normal-case 挣脱束缚 -->
                            <div class="mt-4 p-3 bg-white border border-slate-200 shadow-sm rounded relative overflow-hidden">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                <div class="flex justify-between items-center mb-1 pl-2">
                                    <span class="text-xs font-bold text-slate-700">子元素使用 normal-case 成功逃脱 🛡️</span>
                                </div>
                                <p class="normal-case text-sm text-slate-800 font-medium pl-2">
                                    this description keeps its original lowercase format!
                                </p>
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
            { class: 'uppercase', desc: '将文本全部转换为大写字母' },
            { class: 'lowercase', desc: '将文本全部转换为小写字母' },
            { class: 'capitalize', desc: '将文本中每个单词的首字母转换为大写' },
            { class: 'normal-case', desc: '恢复文本原始的大小写形式，常用于覆盖父级继承' },
            { class: 'small-caps', desc: '将小写字母替换为小型大写字母形态 (UI进阶排版)' },
            { class: 'all-small-caps', desc: '强制将所有字母统一转为小型大写字母形态' },
            { class: 'titling-caps', desc: '采用专为标题设计的大写变体字形' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'transform'
        }));
    }
}