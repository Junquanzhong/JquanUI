// 🚀 Jquan Optimized: Whitespace 空白字符组件文档 (whitespace.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class WhitespaceDoc {
    static render() {
        // 核心测试文本：故意包含“硬换行(\n)”和“连续多个空格(     )”
        // 这是测试 whitespace 家族能力的最佳试金石
        const demoText = `是谁多事种芭蕉，
      早也潇潇，晚也潇潇。
是君心绪无聊，
      种了芭蕉，又怨芭蕉。`;

        const spaceModes = [
            { cls: 'whitespace-nowrap', name: '强制单行 (Nowrap)', desc: '合并连续空格，无视换行符，强制在一行显示，必定冲破容器宽度。' },
            { cls: 'whitespace-normal', name: '默认换行 (Normal)', desc: '合并连续空格，忽略换行符，触碰容器边缘时自动换行。' },
            { cls: 'whitespace-pre', name: '严格预格式 (Pre)', desc: '保留源码里所有的空格和换行符，不自动折行，长句会冲破容器。' },
            { cls: 'whitespace-pre-line', name: '保留换行 (Pre Line)', desc: '合并多余空格，但保留源码中的换行符，且触碰边缘会自动换行。' },
            { cls: 'whitespace-pre-wrap', name: '全保留且换行 (Pre Wrap)', desc: '保留所有空格和换行符，且在触碰边缘时自动换行。' },
            { cls: 'whitespace-break-spaces', name: '断开空格 (Break Spaces)', desc: '类似 pre-wrap，但行尾的连续空格也会占据空间并触发换行。' },
        ];

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">空白与换行 (Whitespace)</li>
            </ul>

            <div class="mb-6 text-slate-600 text-sm">
                <p>合理使用 <code class="inline-code">whitespace-*</code> 能够精准控制文本中的<b>连续空格</b>与<b>回车换行符</b>的呈现逻辑。这在渲染用户输入的评论、代码片段或诗歌时尤为重要。</p>
            </div>

            <!-- 模块 1：全景可视化对比 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-paragraph text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">空白处理可视化对比 (Visual Comparison)</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        ${spaceModes.map(item => `
                            <div class="flex flex-col">
                                <!-- 卡片头部：类名与描述 -->
                                <div class="mb-3">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="font-bold text-slate-800 text-sm">${item.name}</span>
                                        <code class="inline-code">${item.cls}</code>
                                    </div>
                                    <p class="text-xs text-slate-500 leading-relaxed">${item.desc}</p>
                                </div>
                                
                                <!-- 卡片渲染区：使用物理边界可视化法 -->
                                <div class="flex-grow bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto custom-scrollbar p-6 relative">
                                    <!-- 模拟的固定宽度容器 (w-48 = 192px) -->
                                    <div class="relative w-48 min-w-[12rem] bg-white border border-slate-200 shadow-sm rounded-l">
                                        
                                        <!-- 红色警戒线 (表示容器的最大宽度边界) -->
                                        <div class="absolute top-0 right-0 bottom-0 w-px border-r-2 border-dashed border-red-400 z-10 pointer-events-none"></div>
                                        <div class="absolute -top-5 right-0 text-[10px] text-red-500 font-medium translate-x-1/2 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded whitespace-nowrap z-20 shadow-sm">边界</div>
                                        
                                        <!-- 核心排版演示区域 -->
                                        <!-- 注意：给文本区域加上浅色背景，以凸显元素本身并未变宽，只是内容溢出 -->
                                        <div class="${item.cls} p-3 text-sm text-slate-700 leading-relaxed font-misans-vf relative z-0">
                                            ${demoText}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：架构师进阶实战 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                <div class="absolute top-0 right-0 -mt-4 -mr-4 text-slate-100 pointer-events-none">
                    <i class="ph-fill ph-lightbulb text-8xl"></i>
                </div>
                
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between relative z-10">
                    <div class="flex items-center gap-2">
                        <i class="ph-fill ph-check-circle text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">实战指北：用户评论该用哪个？</cite>
                    </div>
                </div>

                <div class="p-6 md:p-8 relative z-10">
                    <p class="text-slate-600 mb-6 text-sm leading-relaxed max-w-3xl">
                        当前端展示用户在 <code class="inline-code">&lt;textarea&gt;</code> 中输入的评论时，用户往往敲击了回车换行，如果直接渲染，换行会消失。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                            <span class="inline-flex items-center gap-1.5 bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded font-bold mb-4 shadow-sm"><i class="ph ph-x-circle text-red-500 text-sm"></i> 错误做法 (Normal)</span>
                            <div class="text-sm text-slate-500 bg-white p-3 border border-slate-200 rounded shadow-inner whitespace-normal mb-3">
                                楼主写的太好了！(我想换行) 但是换行全丢了！变成了一大段话。
                            </div>
                            <p class="text-xs text-slate-400">换行全部丢失，变成毫无结构的一段文字。</p>
                        </div>

                        <div class="bg-primary/5 p-5 rounded-lg border border-primary/20 relative">
                            <span class="inline-flex items-center gap-1.5 bg-white border border-primary/30 text-primary text-xs px-2.5 py-1 rounded font-bold mb-4 shadow-sm"><i class="ph-fill ph-star text-amber-500 text-sm"></i> 最佳实践 (Pre-line)</span>
                            <div class="text-sm text-slate-700 bg-white p-3 border border-primary/20 rounded shadow-sm whitespace-pre-line mb-3 font-medium">
                                楼主写的太好了！
                                
                                (我想换行) 完美保留了我的回车，排版极其清晰！
                            </div>
                            <p class="text-xs text-slate-500">添加 <code class="inline-code">whitespace-pre-line</code>。既保留了回车，又能在超出屏幕时自动折行，并吃掉多余空格。</p>
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
            { class: 'whitespace-nowrap', desc: '强制不换行，常搭配 overflow-hidden 使用' },
            { class: 'whitespace-normal', desc: '默认行为，合并空格且自动换行' },
            { class: 'whitespace-pre', desc: '保留源码的空格和换行符，且不自动换行' },
            { class: 'whitespace-pre-line', desc: '合并多余空格，保留源码换行符并允许自动换行' },
            { class: 'whitespace-pre-wrap', desc: '保留所有空格和换行，允许自动换行' },
            { class: 'whitespace-break-spaces', desc: '保留空格，并在任意空格处换行' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'whitespace'
        }));
    }
}