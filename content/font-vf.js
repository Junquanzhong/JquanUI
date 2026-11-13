// 🚀 Jquan Optimized: Variable Fonts 组件文档 (font-vf.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FontVFDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>基础</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">可变字体 (Variable Fonts)</li>
            </ul>

            <!-- 卡片 1：可变字体互动演示 -->
            <div class="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-sliders-horizontal text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">字轴动态控制</cite>
                </div>
                <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <!-- 控制面板 -->
                    <section class="flex flex-col space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <i class="ph ph-faders"></i> 阿里灵动体参数调节
                        </h2>

                        <!-- 衬线 SRIF -->
                        <div>
                            <label for="srif" class="flex justify-between text-sm font-medium text-slate-700 mb-2">
                                <span>衬线 (SRIF)</span>
                                <span class="font-mono bg-white border border-slate-200 text-primary px-2 py-0.5 rounded shadow-sm" id="srif-value">0</span>
                            </label>
                            <input type="range" id="srif" name="srif" min="0" max="1" value="0" step="1" class="w-full form-control !p-0 !h-auto cursor-pointer">
                            <div class="flex justify-between text-xs text-slate-400 mt-1.5 font-medium">
                                <span>0 (无衬线)</span>
                                <span>1 (有衬线)</span>
                            </div>
                        </div>

                        <!-- 倾斜度 slnt -->
                        <div>
                            <label for="slnt" class="flex justify-between text-sm font-medium text-slate-700 mb-2">
                                <span>倾斜度 (slnt)</span>
                                <span class="font-mono bg-white border border-slate-200 text-primary px-2 py-0.5 rounded shadow-sm" id="slnt-value">0</span>
                            </label>
                            <input type="range" id="slnt" name="slnt" min="-10" max="10" value="0" step="0.1" class="w-full form-control !p-0 !h-auto cursor-pointer">
                            <div class="flex justify-between text-xs text-slate-400 mt-1.5 font-medium">
                                <span>-10 (左倾)</span>
                                <span>0 (垂直)</span>
                                <span>10 (右倾)</span>
                            </div>
                        </div>

                        <!-- 字宽 wdth -->
                        <div>
                            <label for="wdth" class="flex justify-between text-sm font-medium text-slate-700 mb-2">
                                <span>字宽 (wdth)</span>
                                <span class="font-mono bg-white border border-slate-200 text-primary px-2 py-0.5 rounded shadow-sm" id="wdth-value">75</span>
                            </label>
                            <input type="range" id="wdth" name="wdth" min="50" max="125" value="75" step="1" class="w-full form-control !p-0 !h-auto cursor-pointer">
                            <div class="flex justify-between text-xs text-slate-400 mt-1.5 font-medium">
                                <span>50 (极窄)</span>
                                <span>75 (默认)</span>
                                <span>125 (极宽)</span>
                            </div>
                        </div>

                        <!-- 字重 wght -->
                        <div>
                            <label for="wght" class="flex justify-between text-sm font-medium text-slate-700 mb-2">
                                <span>字重 (wght)</span>
                                <span class="font-mono bg-white border border-slate-200 text-primary px-2 py-0.5 rounded shadow-sm" id="wght-value">100</span>
                            </label>
                            <input type="range" id="wght" name="wght" min="100" max="900" value="100" step="1" class="w-full form-control !p-0 !h-auto cursor-pointer">
                            <div class="flex justify-between text-xs text-slate-400 mt-1.5 font-medium">
                                <span>100 (极细)</span>
                                <span>400 (常规)</span>
                                <span>900 (极粗)</span>
                            </div>
                        </div>
                    </section>

                    <!-- 文本预览区域 -->
                    <section class="flex flex-col">
                        <div id="preview-section" class="flex-grow flex flex-col items-center justify-center font-ali-agile text-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner p-8 transition-all duration-300">
                            <p class="mb-6 text-4xl sm:text-5xl text-slate-800 transition-all duration-200">探索，创造，改变</p>
                            <p class="text-3xl sm:text-4xl text-primary transition-all duration-200">
                                Explore, Create, Change
                            </p>
                        </div>
                        <div class="mt-4">
                            <pre id="font-vf-code"><code class="language-html">
&lt;section class="font-ali-agile"&gt;
    &lt;p class="[font-variation-settings:&quot;SRIF&quot;_0,&quot;slnt&quot;_0,&quot;wdth&quot;_75,&quot;wght&quot;_100]"&gt;
        探索，创造，改变
    &lt;/p&gt;
&lt;/section&gt;
                            </code></pre>
                        </div>
                    </section>
                </div>
            </div>

            <!-- 卡片 2：系统预设可选字体 -->
            <div class="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-text-a-underline text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">内置可变字体库</cite>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <!-- 小米 VF -->
                        <div class="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <code class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">font-misans-vf</code>
                                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">MiSans</span>
                            </div>
                            <div class="font-misans-vf text-slate-800 flex-col">
                                <p class="text-2xl mb-2 font-bold">探索，创造，改变</p>
                                <p class="text-xl text-slate-500 mb-2">0123456789</p>
                                <p class="text-lg">Explore, Create, Change</p>
                            </div>
                            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <span class="text-xs font-medium text-slate-500">支持轴:</span>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">wght</code>
                            </div>
                        </div>

                        <!-- Mona VF -->
                        <div class="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <code class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">font-mona</code>
                                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">MonaSans</span>
                            </div>
                            <div class="font-mona text-slate-800 flex-col">
                                <p class="text-2xl mb-2 font-bold">探索，创造，改变</p>
                                <p class="text-xl text-slate-500 mb-2">0123456789</p>
                                <p class="text-lg">Explore, Create, Change</p>
                            </div>
                            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <span class="text-xs font-medium text-slate-500">支持轴:</span>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">opsz</code>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">wdth</code>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">wght</code>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">ital</code>
                            </div>
                        </div>

                        <!-- 阿里妈妈 VF -->
                        <div class="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                            <div class="flex items-center justify-between mb-4">
                                <code class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">font-ali-agile</code>
                                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">AliAgile</span>
                            </div>
                            <div class="font-ali-agile text-slate-800 flex-col">
                                <p class="text-2xl mb-2 font-bold">探索，创造，改变</p>
                                <p class="text-xl text-slate-500 mb-2">0123456789</p>
                                <p class="text-lg">Explore, Create, Change</p>
                            </div>
                            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <span class="text-xs font-medium text-slate-500">支持轴:</span>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">SRIF</code>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">slnt</code>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">wdth</code>
                                <code class="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">wght</code>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 卡片 3：控制器类名 -->
            <div class="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-terminal-window text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">内置原子类控制器 (Atomic Utility)</cite>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span class="text-slate-600 font-medium">衬线 (SRIF)</span>
                            <code class="text-primary bg-white px-2 py-1 rounded shadow-sm text-sm border border-slate-100">[font-variation-settings:&quot;SRIF&quot;_0|1]</code>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span class="text-slate-600 font-medium">倾斜度 (slnt)</span>
                            <code class="text-primary bg-white px-2 py-1 rounded shadow-sm text-sm border border-slate-100">[font-variation-settings:&quot;slnt&quot;_value]</code>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span class="text-slate-600 font-medium">字宽 (wdth)</span>
                            <code class="text-primary bg-white text-sm border border-slate-100 px-2 py-1 rounded shadow-sm">[font-variation-settings:&quot;wdth&quot;_50|75|100|125]</code>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span class="text-slate-600 font-medium">字重 (wght)</span>
                            <code class="text-primary bg-white px-2 py-1 rounded shadow-sm text-sm border border-slate-100">[font-variation-settings:&quot;wght&quot;_100|400|700|900]</code>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span class="text-slate-600 font-medium">复合轴声明</span>
                            <code class="text-primary bg-white px-2 py-1 rounded shadow-sm text-sm border border-slate-100">[font-variation-settings:&quot;slnt&quot;_-2,&quot;wdth&quot;_90]</code>
                        </div>
                    </div>
                    
                    <div class="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p class="text-sm text-blue-800 font-bold mb-1 flex items-center gap-1">
                            <i class="ph ph-info"></i> 光学调整 (opsz): <code class="ml-2 font-mono font-normal">font-opsz-{size}</code>
                        </p>
                        <p class="text-sm text-blue-700 leading-relaxed">
                            支持尺寸：<code class="px-1 bg-white rounded">xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl</code>。<br>
                            尺寸同字号，<span class="font-bold">opsz</span> 是可变字体中最“智能”的特性之一。它允许字体根据文字的显示尺寸自动调整其字重、字宽、衬线粗细、字间距等细节，以达到在不同尺寸下最佳的阅读体验（小字更清晰，大字更精美）。
                        </p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：安全获取 DOM 并绑定可变字体交互
    // ==========================================
    static mount(container) {
        // 获取所有控制元素
        const srifSlider = container.querySelector('#srif');
        const slntSlider = container.querySelector('#slnt');
        const wdthSlider = container.querySelector('#wdth');
        const wghtSlider = container.querySelector('#wght');

        const srifValue = container.querySelector('#srif-value');
        const slntValue = container.querySelector('#slnt-value');
        const wdthValue = container.querySelector('#wdth-value');
        const wghtValue = container.querySelector('#wght-value');

        const previewSection = container.querySelector('#preview-section');

        // 如果元素不存在，直接返回（防止路由组件切换报错）
        if (!srifSlider || !previewSection) return;

        const escapeHtml = value => String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const renderVariationCode = variationClass => {
            const codeHost = container.querySelector('#font-vf-code');
            if (!codeHost) return;
            const source = `<section class="font-ali-agile">
    <p class="${variationClass}">
        探索，创造，改变
    </p>
</section>`;
            codeHost.innerHTML = `<code class="language-html">${escapeHtml(source)}</code>`;
            codeHost.classList.remove('hljs-done');
            initCodeHighlighter({ selector: '#font-vf-code code', showLineNumbers: false, langLabel: false });
        };

        // 更新字体样式的核心函数
        const updateFontVariation = () => {
            const srif = srifSlider.value;
            const slnt = slntSlider.value;
            const wdth = wdthSlider.value;
            const wght = wghtSlider.value;

            // 更新 UI 上的数字显示
            srifValue.textContent = srif;
            slntValue.textContent = slnt;
            wdthValue.textContent = wdth;
            wghtValue.textContent = wght;

            // [Jquan 核心] 使用官方提供的 Variation 标签构建 CSS 字符串
            const variationClass = `[font-variation-settings:"SRIF"_${srif},"slnt"_${slnt},"wdth"_${wdth},"wght"_${wght}]`;
            previewSection.classList.remove(...Array.from(previewSection.classList).filter(name => name.startsWith('[font-variation-settings:')));
            previewSection.classList.add(variationClass);
            window.JquanUI?.compile?.(variationClass);
            renderVariationCode(variationClass);
        };

        // 绑定原生事件监听（使用 input 事件实现丝滑的拖拽预览）
        srifSlider.addEventListener('input', updateFontVariation);
        slntSlider.addEventListener('input', updateFontVariation);
        wdthSlider.addEventListener('input', updateFontVariation);
        wghtSlider.addEventListener('input', updateFontVariation);

        // 组件挂载时立刻执行一次，赋予初始状态
        updateFontVariation();
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'font-misans-vf', desc: '小米可变字体 (MiSans)' },
            { class: 'font-mona', desc: 'MonaSans 可变字体 (支持 opsz)' },
            { class: 'font-ali-agile', desc: '阿里妈妈灵动体 (AliAgile)' },
            { class: 'font-variation-settings', desc: '控制可变字体的 CSS 属性 (SRIF, slnt, wdth, wght)' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'font-vf' // 如果你路由用名字匹配，跳到这里
        }));
    }
}
