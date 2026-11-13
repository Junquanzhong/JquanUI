// 🚀 Jquan Optimized: Filter 滤镜与光学效果组件文档 (filter.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FilterDoc {
    // 辅助器：渲染滤镜演示方块（支持普通滤镜与 Backdrop 滤镜）
    static renderFilterBox(title, filterClass, isBackdrop = false) {
        const imgSrc = "https://www.jquan.win/upload/20250625/22696b8e5cff58.webp";
        
        let visualHtml = '';
        if (isBackdrop) {
            // 背景滤镜 (Backdrop) 的演示结构：底图 + 上层半透明毛玻璃面板
            visualHtml = `
                <div class="w-full h-32 relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <!-- 底图 -->
                    <img src="${imgSrc}" class="w-full h-full object-cover absolute inset-0 z-0">
                    <!-- 演示面板：带半透明背景和 backdrop-filter -->
                    <div class="absolute inset-0 z-10 flex items-center justify-center p-4">
                        <div class="w-full h-full bg-white/30 rounded-lg shadow-sm border border-white/40 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-white/20 ${filterClass}">
                            <span class="text-white font-bold text-sm drop-shadow-md tracking-wider">Backdrop Effect</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 普通滤镜 (Filter) 的演示结构：直接作用于图片
            visualHtml = `
                <img src="${imgSrc}" alt="滤镜演示" class="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-200 transition-all duration-300 group-hover:scale-105 ${filterClass}">
            `;
        }

        const encodedCode = encodeURIComponent(filterClass);

        return `
        <div class="code-copy-trigger flex flex-col gap-3 group cursor-pointer" data-code="${encodedCode}">
            <div class="w-full relative rounded-xl overflow-hidden transition-transform duration-300">
                ${visualHtml}
                <!-- 遮罩复制按钮 -->
                <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <span class="text-white text-xs font-bold bg-slate-800/80 px-2 py-1 rounded backdrop-blur-sm border border-slate-600 flex items-center gap-1"><i class="ph ph-copy"></i> 复制类名</span>
                </div>
            </div>
            <div class="flex items-center justify-between px-1">
                <span class="block text-sm font-bold text-slate-700 truncate">${title}</span>
                <code class="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">${filterClass || '默认'}</code>
            </div>
        </div>`;
    }

    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>视觉</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">滤镜 (Filters)</li>
            </ul>

            <!-- 模块 1：常规光学滤镜 (CSS Filters) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-aperture text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">常规滤镜 (Filter)</cite>
                    </div>
                    <span class="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        直接作用于元素本身的光学效果。得益于 Jquan 引擎的复合管道设计，你可以随心所欲地叠加多个滤镜（例如 <code class="inline-code">grayscale blur-sm</code>）。
                    </p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${this.renderFilterBox('原图 (无效果)', '')}
                        ${this.renderFilterBox('模糊', 'blur-sm')}
                        ${this.renderFilterBox('黑白/灰度', 'grayscale')}
                        ${this.renderFilterBox('老照片', 'sepia')}
                        ${this.renderFilterBox('色彩反转', 'invert')}
                        ${this.renderFilterBox('高饱和度', 'saturate-200')}
                        ${this.renderFilterBox('高对比度', 'contrast-150')}
                        ${this.renderFilterBox('高亮度', 'brightness-150')}
                        ${this.renderFilterBox('色相旋转', 'hue-rotate-90')}
                    </div>
                </div>
            </div>

            <!-- 模块 2：背景毛玻璃滤镜 (Backdrop Filters) -->
            <div class="mb-8 bg-white border border-primary/20 rounded-xl shadow-lg overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between gap-3 backdrop-blur-md">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-drop-half-bottom text-primary text-lg"></i>
                        <cite class="font-bold text-primary not-italic">背景穿透滤镜 (Backdrop Filter)</cite>
                    </div>
                    <span class="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Interactive</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6">
                        应用于元素背后的区域，通常需要元素本身具有一定的透明度（如 <code class="inline-code text-slate-300 border-slate-700 bg-slate-800">bg-white/30</code>）。这是打造现代 UI （如 iOS 毛玻璃、全局弹窗遮罩）的核心武器。
                    </p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${this.renderFilterBox('无滤镜遮罩', '', true)}
                        ${this.renderFilterBox('背景模糊', 'backdrop-blur-sm', true)}
                        ${this.renderFilterBox('背景灰度', 'backdrop-grayscale', true)}
                        ${this.renderFilterBox('背景高反差', 'backdrop-contrast-150', true)}
                        ${this.renderFilterBox('背景反相', 'backdrop-invert', true)}
                        ${this.renderFilterBox('背景老照片', 'backdrop-sepia', true)}
                        ${this.renderFilterBox('背景高饱和', 'backdrop-saturate-200', true)}
                        ${this.renderFilterBox('背景暗化', 'backdrop-brightness-50', true)}
                    </div>
                </div>
            </div>

            <!-- 模块 3：架构师进阶代码演示 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">Jquan 复合滤镜叠加实践</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        在 JquanUI 中，你可以像拼接乐高积木一样，将多个不同的滤镜指令直接写在 <code class="inline-code">class</code> 中，引擎会自动打通管道完成叠加渲染。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 场景 1：图片复古处理 (黑白 + 模糊 + 高对比) --&gt;
&lt;img src="..." class="grayscale blur-[2px] contrast-150 shadow-lg rounded"&gt;

&lt;!-- 场景 2：现代系统的浮动导航栏 (半透明背景 + 强毛玻璃模糊 + 饱和度提升) --&gt;
&lt;nav class="fixed top-0 w-full bg-white/70 backdrop-blur-md backdrop-saturate-150 border-b border-slate-200"&gt;
    &lt;div class="container"&gt;Jquan Glassmorphism Navigation&lt;/div&gt;
&lt;/nav&gt;

&lt;!-- 场景 3：模态框背后的暗黑聚焦遮罩 --&gt;
&lt;div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm backdrop-brightness-75 z-50"&gt;
    &lt;!-- Dialog Content --&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：初始化插件
    // ==========================================
    static mount(container) {
        // 渲染页面后，初始化代码块高亮与复制功能
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'blur-{size}', desc: '为元素应用高斯模糊效果' },
            { class: 'grayscale', desc: '将元素转换为黑白灰度' },
            { class: 'invert', desc: '反转元素的色彩' },
            { class: 'sepia', desc: '为元素应用复古老照片色调' },
            { class: 'backdrop-blur-{size}', desc: '背景毛玻璃效果 (常配合带透明度的背景色使用)' },
            { class: 'backdrop-saturate-{amount}', desc: '调整背景区域的饱和度' },
            { class: 'contrast-{amount}', desc: '调整元素的对比度' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'filter'
        }));
    }
}
