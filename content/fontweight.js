// 🚀 Jquan Optimized: FontWeight 组件文档 (fontweight.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FontWeightDoc {
    static render() {
        // 数据驱动：标准字重阶梯
        const weightScale = [
            { cls: 'font-thin', weight: '100', name: '极细体 (Thin)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-extralight', weight: '200', name: '超细体 (ExtraLight)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-light', weight: '300', name: '细体 (Light)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-normal', weight: '400', name: '常规体 (Normal)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-medium', weight: '500', name: '中等体 (Medium)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-semibold', weight: '600', name: '半粗体 (SemiBold)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-bold', weight: '700', name: '粗体 (Bold)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-extrabold', weight: '800', name: '特粗体 (ExtraBold)', sample: 'Design is intelligence made visible.' },
            { cls: 'font-black', weight: '900', name: '极粗体 (Black)', sample: 'Design is intelligence made visible.' },
        ];

        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">字重 (Font Weight)</li>
            </ul>

            <!-- 模块 1：标准字重阶梯 (Standard Font Weights) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-b text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">原子字重阶梯 (Weight Scale)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-slate-200/50 px-2 py-1 rounded">font-{weight}</span>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-6">
                        使用标准语义化类名控制排版的视觉重量。以下演示采用内嵌的 <code class="inline-code font-misans-vf">MiSans 可变字体</code> 渲染，大字号下展现极致的粗细对比。
                    </p>
                    
                    <div class="flex flex-col border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                        <div class="flex items-center bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider py-2 px-6 border-b border-slate-200">
                            <div class="w-32 md:w-48">Class</div>
                            <div class="w-24 md:w-32">Weight</div>
                            <div class="flex-1">Visual Preview</div>
                        </div>
                        
                        ${weightScale.map(item => `
                            <div class="flex items-center py-5 px-6 border-b border-slate-100 hover:bg-white transition-colors overflow-hidden group">
                                <div class="w-32 md:w-48 flex-shrink-0">
                                    <code class="text-primary bg-primary/10 px-2.5 py-1 rounded text-xs font-mono shadow-sm border border-primary/20">${item.cls}</code>
                                </div>
                                <div class="w-24 md:w-32 flex-shrink-0 flex flex-col justify-center">
                                    <span class="text-slate-700 text-sm font-bold font-mono">${item.weight}</span>
                                    <span class="text-slate-400 text-xs">${item.name.split(' ')[0]}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <!-- 使用 font-misans-vf 确保渲染质量，text-3xl 放大力量感 -->
                                    <div class="${item.cls} font-misans-vf text-3xl text-slate-800 truncate transition-transform group-hover:translate-x-1 duration-300">
                                        ${item.sample}
                                    </div>
                                    <div class="${item.cls} font-misans-vf text-lg text-slate-400 mt-1 truncate">
                                        设计是让智慧可见
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：JIT + VF 可变字体无极体验 (Variable Font Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <!-- 背景装饰 -->
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-sliders text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">VF 可变字体无极调控 (JIT Arbitrary Values)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">fw-[ value ]</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6">
                        得益于 <code class="inline-code">MiSans-VF</code> 的可变字体特性与 JquanUI 的 JIT 引擎，字重不再局限于 9 个固定档位。<br/>
                        <strong>拖动下方滑块（支持 100-900 之间任意数字，如 653），感受文字重量“逐克”增加的丝滑体验！</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制与代码输出 -->
                        <div class="lg:col-span-5 flex flex-col justify-center space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            
                            <!-- 控制区 -->
                            <div class="bg-slate-50 p-5 rounded-lg border border-slate-100 shadow-inner">
                                <label for="fw-slider" class="flex justify-between text-sm font-medium text-slate-700 mb-4">
                                    <span class="flex items-center gap-2"><i class="ph ph-barbell text-primary"></i> 力量感调节 (1 级精度)</span>
                                    <span class="font-mono text-primary font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 w-12 text-center" id="fw-display">400</span>
                                </label>
                                <!-- 这里 step="1" 是核心灵魂，展现真正的可变字体 -->
                                <input type="range" id="fw-slider" min="100" max="900" step="1" value="400" class="w-full form-control !p-0 !h-auto cursor-pointer">
                                
                                <div class="flex justify-between text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                                    <span>Thin (100)</span>
                                    <span>Black (900)</span>
                                </div>
                            </div>

                            <!-- 标准化 Code Block：调用 code-block.mjs -->
                            <div class="mt-4">
                                <pre id="fw-pre-container"><code class="language-html">
&lt;!-- fw-[xx] 控制字重，font-misans-vf 开启可变字体引擎 --&gt;
&lt;p class="font-misans-vf fw-[400] text-5xl"&gt;
    JquanUI Typography
&lt;/p&gt;
                                </code></pre>
                            </div>

                        </div>

                        <!-- 右侧：效果预览 -->
                        <div class="lg:col-span-7 flex flex-col items-center justify-center min-h-[250px] bg-slate-50 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 p-8 relative group">
                            
                            <div class="absolute top-4 left-4 flex gap-2">
                                <span class="flex h-3 w-3 relative">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                                <span class="text-xs text-slate-400 font-mono">Live Rendering</span>
                            </div>

                            <p id="fw-preview-text" class="text-slate-800 font-misans-vf fw-[400] text-4xl md:text-5xl text-center whitespace-nowrap">
                                JquanUI Typography
                            </p>
                            <p id="fw-preview-sub" class="text-slate-400 font-misans-vf fw-[400] text-lg mt-4 text-center">
                                排版引擎力量感实时演算
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：安全获取 DOM 并绑定交互
    // ==========================================
    static mount(container) {
        // 1. 绑定 VF 字重沙盒交互
        const fwSlider = container.querySelector('#fw-slider');
        const fwDisplay = container.querySelector('#fw-display');
        const fwPreviewText = container.querySelector('#fw-preview-text');
        const fwPreviewSub = container.querySelector('#fw-preview-sub');
        const fwPreContainer = container.querySelector('#fw-pre-container');

        const escapeHtml = value => String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const renderFontWeightCode = weightVal => {
            if (!fwPreContainer) return;
            const source = `<!-- fw-[xx] 控制字重，font-misans-vf 开启可变字体引擎 -->
<p class="font-misans-vf fw-[${weightVal}] text-5xl">
    JquanUI Typography
</p>`;
            fwPreContainer.innerHTML = `<code class="language-html">${escapeHtml(source)}</code>`;
            fwPreContainer.classList.remove('hljs-done');
            initCodeHighlighter({
                selector: '#fw-pre-container code',
                showLineNumbers: true,
                langLabel: true
            });
        };

        if (fwSlider && fwPreviewText) {
            renderFontWeightCode(fwSlider.value);
            // 注意这里使用 input 事件，确保拖动时实时触发
            fwSlider.addEventListener('input', (e) => {
                const weightVal = e.target.value;
                
                // A. 更新右侧视觉预览
                const weightClass = `fw-[${weightVal}]`;
                [fwPreviewText, fwPreviewSub].filter(Boolean).forEach(node => {
                    node.classList.remove(...Array.from(node.classList).filter(name => name.startsWith('fw-[')));
                    node.classList.add(weightClass);
                });
                window.JquanUI?.compile?.(weightClass);
                
                // B. 更新左侧控制台数值显示
                fwDisplay.textContent = weightVal;
                
                // C. 重新渲染共享代码块，确保动态示例与复制内容同步。
                renderFontWeightCode(weightVal);
            });
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'font-thin to font-black', desc: '预设的基础字重比例尺 100-900' },
            { class: 'fw-[weight]', desc: 'JIT 引擎任意字重，支持可变字体无极调控' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'fontweight'
        }));
    }
}
