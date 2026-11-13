// 🚀 Jquan Designed: 现代遮罩与裁剪控制台 (mask.js) v1.0
// 包含原生 Clip-path 几何裁剪与高级 Mask-image 图像遮罩
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class MaskDoc {
    static render() {
        const dotMask = 'mask-[radial-gradient(circle,_black_40%,_transparent_41%)]';
        const fadeMask = 'mask-[linear-gradient(to_bottom,_black_50%,_transparent_100%)]';
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-magic-wand"></i>视觉与特效</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">遮罩与裁剪 (Mask & Clip)</li>
            </ul>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-xl flex items-center justify-center">
                        <i class="ph ph-scissors text-primary text-2xl"></i>
                    </div>
                    遮罩与裁剪 
                    <span class="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-mono align-middle ml-2">v1.0</span>
                </h1>
                <p class="text-slate-600 leading-relaxed max-w-3xl mt-4 pl-1">
                    告别死板的方形盒子！利用 <code>clip-*</code> 实现完美的几何图形裁剪，或者使用 <code>mask-*</code> 配合 SVG、渐变色实现苹果官网级别的图层遮罩与镂空特效。它们是现代高级 UI 的灵魂。
                </p>
            </div>

            <!-- 展示区：采用双列响应式网格 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                ${this.renderShowcase(
                    '几何图形裁剪 (Clip-path)',
                    '使用 <code>clip-circle</code> 和 <code>clip-ellipse</code> 瞬间改变元素的物理渲染边界。注意：裁剪外的区域将无法响应鼠标事件。',
                    `<div class="flex gap-6 items-center justify-center py-4">
    <!-- 默认形态 -->
    <div class="flex flex-col items-center gap-3">
        <div class="w-24 h-24 bg-slate-200 border-2 border-slate-300 flex items-center justify-center clip-auto shadow-sm transition-transform hover:scale-105 cursor-pointer">
            <span class="text-xs font-bold text-slate-500">Auto</span>
        </div>
        <code class="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded">clip-auto</code>
    </div>

    <!-- 圆形裁剪 -->
    <div class="flex flex-col items-center gap-3">
        <div class="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center clip-circle shadow-md transition-transform hover:scale-105 cursor-pointer">
            <i class="ph-fill ph-check-circle text-white text-3xl"></i>
        </div>
        <code class="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">clip-circle</code>
    </div>

    <!-- 椭圆裁剪 -->
    <div class="flex flex-col items-center gap-3">
        <div class="w-32 h-24 bg-gradient-to-r from-violet-400 to-fuchsia-500 flex items-center justify-center clip-ellipse shadow-md transition-transform hover:scale-105 cursor-pointer">
            <span class="text-white font-bold tracking-widest text-sm">ELLIPSE</span>
        </div>
        <code class="text-[11px] text-violet-600 bg-violet-50 px-2 py-1 rounded border border-violet-200">clip-ellipse</code>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '平铺与不平铺 (Mask Repeat)',
                    '使用语义化遮罩类与任意值 <code>mask-[...]</code> 声明图形源，再用 <code>mask-repeat</code> 或 <code>mask-no-repeat</code> 控制是否平铺。',
                    `<div class="flex gap-6">
    <!-- Mask Repeat -->
    <div class="flex-1 flex flex-col items-center gap-3">
        <!-- 注意：这里使用了一段 SVG 编码作为示例遮罩源 -->
        <div class="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl ${dotMask} mask-repeat mask-size-[20px_20px]">
        </div>
        <code class="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">mask-repeat</code>
    </div>

    <!-- Mask No Repeat -->
    <div class="flex-1 flex flex-col items-center gap-3">
        <div class="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl ${dotMask} mask-no-repeat mask-pos-[center] mask-size-[60px_60px]">
        </div>
        <code class="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">mask-no-repeat</code>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '遮罩尺寸控制 (Mask Size)',
                    '使用 <code>mask-contain</code> 保持遮罩比例完全显示，或使用 <code>mask-cover</code> 让遮罩铺满整个容器（类似 background-size）。',
                    `<div class="flex gap-6">
    <!-- Mask Contain -->
    <div class="flex-1 flex flex-col items-center gap-3">
        <div class="w-full h-32 bg-rose-500 rounded-xl ${dotMask} mask-no-repeat mask-pos-[center] mask-contain">
        </div>
        <div class="text-center">
            <code class="text-[11px] text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">mask-contain</code>
            <p class="text-[10px] text-slate-400 mt-1">图形完整显示</p>
        </div>
    </div>

    <!-- Mask Cover -->
    <div class="flex-1 flex flex-col items-center gap-3">
        <div class="w-full h-32 bg-rose-500 rounded-xl ${dotMask} mask-no-repeat mask-pos-[center] mask-cover">
        </div>
        <div class="text-center">
            <code class="text-[11px] text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">mask-cover</code>
            <p class="text-[10px] text-slate-400 mt-1">图形放大并铺满</p>
        </div>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '遮罩渐变淡出 (实战应用) 🚀',
                    '最常见的场景：用 <code>linear-gradient</code> 结合遮罩，实现一段文本或一张图片的底部渐变淡出（Fade-out）效果，而不需要额外叠加白色半透明层！',
                    `<div class="relative h-48 bg-white border border-slate-200 rounded-xl p-4 overflow-hidden ${fadeMask} mask-no-repeat mask-cover">
        <h4 class="font-bold text-slate-800 mb-2">CSS 渐变遮罩黑科技</h4>
        <p class="text-sm text-slate-600 leading-relaxed">
            这段文字的底部正在逐渐消失。注意，这不是盖了一层白色的半透明渐变色，而是真的“被裁剪”了！
            <br><br>
            这意味着，无论这段内容下面是什么背景（比如复杂的背景图），淡出效果都能完美融合，不会出现“穿帮”的白色渐变遮挡。这就是 <code>mask-image</code> 的终极魅力。
            <br><br>
            苹果经常使用这种手法来处理长列表或长文本的折叠状态视觉过渡。
        </p>
</div>`
                )}

            </div>

            <!-- 全局复制成功提示 Toast -->
            <div id="mask-toast-msg" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-[99] pointer-events-none">
                <i class="ph-fill ph-check-circle text-emerald-400 text-xl"></i>
                <span>代码已复制到剪贴板！</span>
            </div>
            <div class="mt-8">
                <pre id="mask-code"><code class="language-html">
&lt;div class="h-32 rounded-xl bg-primary mask-[linear-gradient(to_bottom,_black_50%,_transparent_100%)] mask-cover"&gt;&lt;/div&gt;
                </code></pre>
            </div>

        </div>
        `;
    }

    // 🚀 Jquan UI 架构：卡片组件渲染
    static renderShowcase(title, desc, code) {
        const encodedCode = encodeURIComponent(code);
        return `
        <div class="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group h-full">
            <div class="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div class="pr-4">
                    <h3 class="text-base font-bold text-slate-800 tracking-tight">${title}</h3>
                    <p class="text-[13px] text-slate-500 mt-1.5 leading-relaxed">${desc}</p>
                </div>
                <button class="code-copy-trigger shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold shadow-sm" data-code="${encodedCode}">
                    <i class="ph ph-code"></i>
                    <span>复制</span>
                </button>
            </div>
            <div class="p-6 relative bg-slate-50/30 bg-[radial-gradient(rgb(0_0_0_/_0.04)_1px,transparent_1px)] bg-[length:16px_16px] grow">
                ${code}
            </div>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ selector: '#mask-code code', showLineNumbers: false, langLabel: false });
        // =========================================================
        // 复制逻辑挂载 (带有局部反馈 + 全局 Toast)
        // =========================================================
        const copyTriggers = container.querySelectorAll('.code-copy-trigger');
        const toastMsg = container.querySelector('#mask-toast-msg');
        let toastTimeout;

        copyTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                const codeToCopy = decodeURIComponent(btn.dataset.code);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    btn.classList.remove('bg-white', 'border-slate-200', 'text-slate-600', 'hover:border-primary/40', 'hover:bg-primary/5');
                    btn.classList.add('bg-emerald-50', 'border-emerald-300', 'text-emerald-600');
                    icon.className = 'ph-fill ph-check-circle text-sm';
                    text.innerText = '已复制';

                    toastMsg.classList.remove('translate-y-20', 'opacity-0');
                    toastMsg.classList.add('translate-y-0', 'opacity-100');
                    
                    if (toastTimeout) clearTimeout(toastTimeout);
                    
                    toastTimeout = setTimeout(() => {
                        toastMsg.classList.remove('translate-y-0', 'opacity-100');
                        toastMsg.classList.add('translate-y-20', 'opacity-0');
                        
                        btn.classList.remove('bg-emerald-50', 'border-emerald-300', 'text-emerald-600');
                        btn.classList.add('bg-white', 'border-slate-200', 'text-slate-600', 'hover:border-primary/40', 'hover:bg-primary/5');
                        icon.className = 'ph ph-code';
                        text.innerText = '复制';
                    }, 2000);
                }).catch(err => console.error('复制失败', err));
            });
        });
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'clip-auto', desc: '恢复默认的裁剪边界' },
            { class: 'clip-circle', desc: '将元素裁剪为完美的圆形 (事件也只会响应圆形内)' },
            { class: 'clip-ellipse', desc: '将元素裁剪为椭圆形' },
            { class: 'mask-none', desc: '移除所有遮罩效果' },
            { class: 'mask-repeat / mask-no-repeat', desc: '控制遮罩图像的平铺与重复行为' },
            { class: 'mask-contain', desc: '遮罩图形保持比例缩放以适应容器' },
            { class: 'mask-cover', desc: '遮罩图形保持比例缩放并完全覆盖容器' }
        ];

        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'mask' // 记得在主路由系统中映射 'mask' 到这个组件！
        }));
    }
}

