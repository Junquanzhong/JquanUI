// 🚀 Jquan Optimized: Blend Mode 混合模式文档 (blend-mode.js) - 全量矩阵火力展示版 V4.0
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class BlendModeDoc {
    
    // 🚀 全量 mix-blend 模式数组 (18个)
    static get mixModes() {
        return [
            'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
            'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 
            'exclusion', 'hue', 'saturation', 'color', 'luminosity', 
            'plus-darker', 'plus-lighter'
        ];
    }

    // 🚀 全量 bg-blend 模式数组 (16个)
    static get bgModes() {
        return [
            'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
            'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 
            'exclusion', 'hue', 'saturation', 'color', 'luminosity'
        ];
    }

    // 辅助器：渲染高密度 Mix Blend 卡片
    static renderMixBox(mode) {
        const blendClass = `mix-blend-${mode}`;
        return `
        <div class="flex flex-col gap-2 group cursor-crosshair">
            <div class="w-full h-28 relative rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-center px-4">
                <!-- 底层 DOM：用来展示物理透视的高对比度文字 -->
                <div class="text-slate-800 font-black text-5xl leading-none -ml-2 tracking-tighter uppercase select-none">MIX</div>
                <div class="text-slate-800 font-bold text-xs mt-1 select-none">DOM Text</div>
                
                <!-- 顶层 DOM：渐变色块，应用 mix-blend 模式 -->
                <div class="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-300 ${blendClass} transition-transform duration-500 group-hover:scale-110" aria-hidden="true"></div>
            </div>
            <code class="text-[10px] font-mono text-primary bg-primary/5 border border-primary/20 px-2 py-1 rounded w-fit truncate" title="${blendClass}">${blendClass}</code>
        </div>`;
    }

    // 辅助器：渲染高密度 Background Blend 卡片
    static renderBgBox(mode) {
        const blendClass = `bg-blend-${mode}`;
        
        // 🚀 Jquan 修复：必须在同一个 background-image 属性中使用逗号分隔多层背景。
        // 最前方的 linear-gradient 是顶层，后方的 url() 是底层图片。
        // 这样 bg-blend-mode 才能让上层的渐变色精确地“浸染”到底层图片上！
        return `
        <div class="flex flex-col gap-2 group cursor-crosshair">
            <!-- 单一 DOM：多图层融合 -->
            <div class="w-full h-28 relative rounded-lg border border-primary/20 shadow-sm transition-all duration-500 group-hover:shadow-md ${blendClass} bg-[radial-gradient(circle_at_25%_30%,#fef08a_0_18%,transparent_42%),linear-gradient(135deg,#06b6d4,#8b5cf6_52%,#ec4899)]">
            </div>
            <code class="text-[10px] font-mono text-primary bg-primary/5 border border-primary/20 px-2 py-1 rounded w-fit truncate" title="${blendClass}">${blendClass}</code>
        </div>`;
    }

    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-magic-wand"></i>效果</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">混合模式 (Blend Mode)</li>
            </ul>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">混合模式全量矩阵</h1>
                <p class="text-slate-600 leading-relaxed max-w-3xl">
                    本页列出 JquanUI 支持的元素混合和背景混合类。<strong class="text-slate-800">Mix Blend</strong> 用于多个 DOM 元素之间的混合；<strong class="text-slate-800">Background Blend</strong> 用于同一元素的多层背景。
                </p>
            </div>

            <!-- 模块 1：全量 mix-blend 矩阵 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-layers text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">元素物理层叠矩阵 (Mix Blend - 18款)</cite>
                    </div>
                    <span class="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">DOM 叠加</span>
                </div>
                <div class="p-6">
                    <!-- 使用 2列(移动端)/3列(平板)/6列(桌面端) 的高密度网格 -->
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        ${this.mixModes.map(mode => this.renderMixBox(mode)).join('')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：排版魔法交互区 (保留这个，用于提升逼格) -->
            <div class="mb-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
                <div class="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-center">
                    <div class="flex-1 w-full rounded-2xl h-48 relative overflow-hidden flex items-center justify-center group cursor-crosshair">
                        <!-- 白色发光球 -->
                        <div class="absolute w-40 h-40 bg-white rounded-full blur-xl group-hover:scale-[2] group-hover:-translate-x-12 transition-transform duration-700"></div>
                        <!-- 差值模式的文字，与背景光球产生底片反转效果 -->
                        <h2 class="relative text-5xl md:text-6xl font-black text-white mix-blend-difference tracking-tighter uppercase z-10 pointer-events-none text-center">
                            MIX MODE<br>INTERACTION
                        </h2>
                        <div class="absolute bottom-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Hover to move light</div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：全量 bg-blend 矩阵 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-slate-50/90">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-images text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">单元素滤镜魔法矩阵 (Background Blend - 16款)</cite>
                    </div>
                    <span class="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">单一 DOM</span>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-6">
                        下方的所有卡片内部均<strong>无子元素</strong>。它们仅仅是由一张背景图与 <code class="inline-code">from-indigo-500 via-purple-500 to-pink-500</code> 的 CSS 渐变叠加而成。
                    </p>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        ${this.bgModes.map(mode => this.renderBgBox(mode)).join('')}
                    </div>
                </div>
            </div>

            <!-- 实战代码块 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">如何在实战中使用？</cite>
                </div>
                <div class="p-6">
                    <pre><code class="language-html">
&lt;!-- 物理层叠 (mix-blend) 适用场景：让顶层图片透出底部的文字或布局 --&gt;
&lt;div class="relative bg-white"&gt;
    &lt;h1 class="text-9xl font-black text-slate-900"&gt;BEHIND&lt;/h1&gt;
    &lt;!-- 使用 plus-lighter 产生强曝光穿透 --&gt;
    &lt;img src="image.webp" class="absolute inset-0 mix-blend-plus-lighter"&gt;
&lt;/div&gt;

&lt;!-- 滤镜魔法 (bg-blend) 适用场景：不修改 DOM，通过 CSS 直接给卡片加滤镜 --&gt;
&lt;div class="h-64 w-full rounded-xl 
            bg-[url('image.webp')] bg-cover
            bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 
            bg-blend-color-burn"&gt;
    &lt;!-- 此时背景将呈现出极其浓烈的 Instagram 滤镜风 --&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    static async onSearch(keyword) {
        // 动态生成全量搜索数据，一劳永逸
        const mixSearch = this.mixModes.map(mode => ({
            title: `mix-blend-${mode}`,
            desc: `多元素层叠混合模式: ${mode}`,
            actionValue: 'blend-mode'
        }));
        const bgSearch = this.bgModes.map(mode => ({
            title: `bg-blend-${mode}`,
            desc: `单元素背景滤镜模式: ${mode}`,
            actionValue: 'blend-mode'
        }));
        
        const allApis = [...mixSearch, ...bgSearch];
        
        return allApis.filter(item => 
            item.title.toLowerCase().includes(keyword.toLowerCase())
        );
    }
}
