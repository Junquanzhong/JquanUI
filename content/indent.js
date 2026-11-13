// 🚀 Jquan Optimized: Indent 组件文档 (indent.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class IndentDoc {
    static render() {
        const toggleBase = 'btn-toggle inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800';
        const toggleActive = 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20';
        // 核心常用缩进档位
        const indentScale = [
            { cls: 'indent-0', val: '0', desc: '无缩进 (现代齐头式排版)' },
            { cls: 'indent-2', val: '0.5rem', desc: '微缩进' },
            { cls: 'indent-4', val: '1rem', desc: '单字缩进' },
            { cls: 'indent-8', val: '2rem', desc: '双字缩进 (经典中文排版)' },
            { cls: 'indent-12', val: '3rem', desc: '大缩进' },
            { cls: 'indent-16', val: '4rem', desc: '超大缩进 (引用文段)' }
        ];

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">缩进 (Text Indent)</li>
            </ul>

            <!-- 模块 1：沉浸式排版标尺沙盒 (Interactive Ruler Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-ruler text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">动态基准线沙盒 (Indentation Sandbox)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">indent-[ value ]</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6">
                        首行缩进常用于长文阅读场景，帮助读者区分段落。在中文排版中，<code class="inline-code">indent-8</code> (即 2rem，通常等于两个中文字符宽度) 是最经典的“首行缩进两字符”方案。
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制台 -->
                        <div class="lg:col-span-5 flex flex-col justify-center space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            
                            <div class="bg-slate-50 p-5 rounded-lg border border-slate-100 shadow-inner">
                                <label class="flex justify-between text-sm font-medium text-slate-700 mb-4">
                                    <span class="flex items-center gap-2"><i class="ph ph-arrows-out-line-horizontal text-primary"></i> 缩进距离调节</span>
                                    <span class="font-mono text-primary font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 w-16 text-center" id="indent-display">2rem</span>
                                </label>
                                <!-- range max 设为 16，对应 indent-16，即 4rem -->
                                <input type="range" id="indent-slider" min="0" max="16" step="1" value="8" class="w-full form-control !p-0 !h-auto cursor-pointer">
                                <div class="flex justify-between text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                                    <span>0 (0px)</span>
                                    <span>16 (4rem)</span>
                                </div>
                            </div>

                            <!-- 预设快捷按钮 -->
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">经典断点 (Presets)</label>
                                <div class="flex flex-wrap gap-2" id="preset-buttons">
                                    <button class="${toggleBase}" data-val="0">indent-0</button>
                                    <button class="${toggleBase}" data-val="4">indent-4</button>
                                    <button class="${toggleBase} active ${toggleActive}" data-val="8">indent-8 (中文双字)</button>
                                </div>
                            </div>

                            <!-- 代码生成 -->
                            <div class="pt-2">
                                <pre id="indent-code-container"><code class="language-html">
&lt;!-- indent-[xx] 控制段落首行缩进 --&gt;
&lt;p class="indent-8 text-slate-700"&gt;
    再美的花朵，盛开后就凋落...
&lt;/p&gt;
                                </code></pre>
                            </div>
                        </div>

                        <!-- 右侧：视觉呈现 -->
                        <div class="lg:col-span-7 relative flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                            
                            <!-- 纵向排版基准线 -->
                            <div class="absolute left-10 md:left-14 top-0 bottom-0 w-px bg-primary/40 border-l-2 border-dashed border-primary/30 z-0"></div>
                            
                            <!-- 刻度提示 -->
                            <div class="absolute top-4 left-4 text-xs font-mono text-primary/60 bg-white/80 px-1 py-0.5 rounded z-0 shadow-sm border border-primary/10">Base Line</div>

                            <div class="relative z-10 bg-white/95 backdrop-blur shadow-sm border border-slate-200 rounded-lg p-6 max-w-md w-full mx-auto mt-4 ml-8 md:ml-12">
                                <p id="indent-preview" class="indent-8 text-slate-700 font-misans-vf leading-relaxed text-justify transition-all duration-300">
                                    再美的花朵，盛开后就凋落，再亮眼的星，一闪过就坠落。排版的艺术在于规则与留白之间的平衡。The most beautiful flowers wither after they bloom; the brightest stars fall after a flash. 
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：常用比例尺与对比 (Indent Scale Gallery) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-align-left text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">常用缩进档位图鉴 (Indent Scale)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${indentScale.map(item => `
                            <div class="group border border-slate-100 rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all bg-white relative">
                                <div class="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                                    <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">${item.cls}</code>
                                    <span class="text-xs text-slate-400 font-medium">${item.desc}</span>
                                </div>
                                <div class="p-5 relative bg-slate-50">
                                    <!-- 辅助基准线 -->
                                    <div class="absolute left-5 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-300"></div>
                                    <p class="${item.cls} text-sm text-slate-600 leading-relaxed relative z-10 bg-white/90 p-1 rounded">
                                        这是一段用于演示排版首行缩进特性的示例文本。通过改变缩进数值，观察第一行文字相较于下方文字左侧边缘的距离变化。
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        `;
    }

    // ==========================================
    // 挂载逻辑：滑块与 DOM 演算
    // ==========================================
    static mount(container) {
        // 1. 初始化代码高亮
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        const slider = container.querySelector('#indent-slider');
        const display = container.querySelector('#indent-display');
        const preview = container.querySelector('#indent-preview');
        const codeContainer = container.querySelector('#indent-code-container');
        const presetBtns = container.querySelectorAll('.btn-toggle');
        let currentIndentClass = 'indent-8';

        // 核心更新逻辑
        const updateIndent = (val) => {
            // Tailwind 中 indent-{n} 规则：n * 0.25rem
            const remValue = (val * 0.25).toFixed(2);
            const classValue = `indent-${val}`;
            
            // 更新 UI 和预览
            display.textContent = `${remValue}rem`;
            preview.classList.remove(currentIndentClass);
            preview.classList.add(classValue);
            currentIndentClass = classValue;

            // 更新预设按钮的高亮状态
            presetBtns.forEach(btn => {
                if (btn.dataset.val == val) {
                    btn.classList.add('active', 'border-primary', 'text-primary', 'bg-primary/5', 'ring-1', 'ring-primary/20');
                    btn.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-600');
                } else {
                    btn.classList.remove('active', 'border-primary', 'text-primary', 'bg-primary/5', 'ring-1', 'ring-primary/20');
                    btn.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-600');
                }
            });

            // TreeWalker 精准替换代码块内容
            if (codeContainer) {
                const walker = document.createTreeWalker(
                    codeContainer,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while ((node = walker.nextNode())) {
                    if (node.nodeValue.includes('indent-')) {
                        // 替换旧的 indent-xx 或 indent-[xx]
                        node.nodeValue = node.nodeValue.replace(/indent-(?:\[.*?\]|\d+)/g, classValue);
                    }
                }
            }
        };

        // 绑定滑块事件
        if (slider) {
            slider.addEventListener('input', (e) => {
                updateIndent(e.target.value);
            });
        }

        // 绑定预设按钮事件
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.dataset.val;
                if (slider) slider.value = val;
                updateIndent(val);
            });
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'indent-0 to indent-16', desc: '预设基础首行缩进比例尺' },
            { class: 'indent-[value]', desc: 'JIT 引擎任意缩进值支持' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'indent'
        }));
    }
}
