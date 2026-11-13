// 🚀 Jquan Optimized: Layout Object 内容适配组件文档 (object.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutObjectDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">内容适配 (Object Fit)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">对象适配</h1>
                <p class="text-slate-600">利用 <code class="inline-code">object-fit</code> 和 <code class="inline-code">object-position</code> 工具类，精准控制替换元素（如 <code class="inline-code">&lt;img&gt;</code> 或 <code class="inline-code">&lt;video&gt;</code>）的内容应该如何去适应其所处的容器，这在响应式布局中是不可或缺的神技。</p>
            </div>

            <!-- 🧪 高能实验室：多维适配引擎 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">响应式裁切实验室</cite>
                    </div>
                    <span class="text-xs font-medium text-slate-400 bg-white px-2 py-1 border border-slate-200 rounded-md shadow-sm">💡 提示：拖拽右侧容器的右下角可以改变大小</span>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- 左侧：控制面板 -->
                    <div class="lg:col-span-5 flex flex-col gap-6">
                        
                        <!-- Object Fit 控制器 -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1">
                                <i class="ph ph-resize"></i> 缩放模式 (Fit)
                            </p>
                            <div class="grid grid-cols-2 gap-2" id="fit-controls">
                                <button data-fit="object-contain" class="fit-btn flex flex-col items-start px-3 py-2 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary/30 transition-all text-left is-active group">
                                    <span class="font-mono font-bold text-primary text-sm">contain</span>
                                    <span class="text-[10px] text-slate-500 mt-1">等比缩放进容器，不裁剪</span>
                                </button>
                                <button data-fit="object-cover" class="fit-btn flex flex-col items-start px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                    <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">cover</span>
                                    <span class="text-[10px] text-slate-400 mt-1">等比铺满容器，会裁剪</span>
                                </button>
                                <button data-fit="object-fill" class="fit-btn flex flex-col items-start px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                    <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">fill</span>
                                    <span class="text-[10px] text-slate-400 mt-1">强制拉伸填满，会变形</span>
                                </button>
                                <button data-fit="object-none" class="fit-btn flex flex-col items-start px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                    <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">none</span>
                                    <span class="text-[10px] text-slate-400 mt-1">保持原图大小，不缩放</span>
                                </button>
                                <button data-fit="object-scale-down" class="fit-btn flex flex-col items-start px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group col-span-2">
                                    <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">scale-down</span>
                                    <span class="text-[10px] text-slate-400 mt-1">none与contain的保守结合体</span>
                                </button>
                            </div>
                        </div>

                        <hr class="border-slate-100">

                        <!-- Object Position 控制器 (高级扩展) -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-1">
                                <i class="ph ph-crosshair"></i> 锚点位置 (Position)
                            </p>
                            <p class="text-[10px] text-slate-400 mb-2 leading-tight">仅在发生裁切 (cover/none) 或留白 (contain) 时才表现出明显差异。</p>
                            
                            <div class="grid grid-cols-3 gap-1 w-32 mx-auto" id="pos-controls">
                                <button data-pos="object-left-top" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-up-left text-slate-400 group-hover:text-primary"></i></button>
                                <button data-pos="object-top" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-up text-slate-400 group-hover:text-primary"></i></button>
                                <button data-pos="object-right-top" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-up-right text-slate-400 group-hover:text-primary"></i></button>
                                
                                <button data-pos="object-left" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-left text-slate-400 group-hover:text-primary"></i></button>
                                <button data-pos="object-center" class="pos-btn h-8 rounded border border-primary bg-primary/10 flex items-center justify-center transition-all group is-active"><i class="ph ph-circle text-primary"></i></button>
                                <button data-pos="object-right" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-right text-slate-400 group-hover:text-primary"></i></button>
                                
                                <button data-pos="object-left-bottom" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-down-left text-slate-400 group-hover:text-primary"></i></button>
                                <button data-pos="object-bottom" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-down text-slate-400 group-hover:text-primary"></i></button>
                                <button data-pos="object-right-bottom" class="pos-btn h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all group"><i class="ph ph-arrow-down-right text-slate-400 group-hover:text-primary"></i></button>
                            </div>
                        </div>

                    </div>

                    <!-- 右侧：演示视窗 -->
                    <div class="lg:col-span-7 flex flex-col items-center justify-center bg-slate-800/5 rounded-xl p-4 border border-slate-100 relative">
                        <!-- 动态调节尺寸的容器 -->
                        <!-- Jquan 神仙细节：resize-y/resize-x 允许用户拖拽感受自适应 -->
                        <div class="relative w-full max-w-[24rem] h-56 min-h-[10rem] min-w-[12rem] bg-[repeating-conic-gradient(#e2e8f0_0_25%,transparent_0_50%)] bg-[length:20px_20px] border-2 border-dashed border-primary/50 rounded-lg overflow-hidden resize-y shadow-inner group">
                            
                            <div class="absolute inset-x-0 top-0 h-full w-full bg-white/40 pointer-events-none z-0"></div>
                            
                            <!-- 原图分辨率 800x400 (宽屏)，塞入这个容器中 -->
                            <img id="demo-image" src="https://picsum.photos/id/1015/800/400" alt="Landscape" class="relative z-10 w-full h-full object-contain object-center transition-all duration-300">
                            
                            <!-- 尺寸指示器 -->
                            <div class="absolute bottom-1 right-3 text-[10px] font-mono text-primary font-bold bg-white/80 px-2 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">可拖拽缩放</div>
                        </div>

                        <!-- 当前激活的类名指示器 -->
                        <div class="mt-6 flex items-center gap-2">
                            <span class="text-sm font-medium text-slate-500">当前激活类名：</span>
                            <code class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono text-primary shadow-sm transition-all" id="active-classes">object-contain object-center</code>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 2：最佳实践代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">基础用法与最佳实践</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        使用 <code class="inline-code">object-{fit}</code> 类名配合宽高属性，即可轻松控制图片、视频等替换元素的内容适应方式。
                    </p>
                    <pre><code class="language-html">
&lt;!-- 示例 1：用户头像（强制铺满，防止变形） --&gt;
&lt;img src="avatar.jpg" class="w-16 h-16 rounded-full object-cover" alt="User Avatar"&gt;

&lt;!-- 示例 2：电商商品图（等比缩放，保证完整显示） --&gt;
&lt;img src="product.jpg" class="w-full h-64 object-contain bg-slate-50" alt="Product"&gt;

&lt;!-- 示例 3：控制裁切锚点（裁剪时保留图片的右上角） --&gt;
&lt;img src="banner.jpg" class="w-full h-48 object-cover object-right-top" alt="Banner"&gt;
                    </code></pre>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">内容适配字典 (Object Fit Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-3 font-medium tracking-wide w-48">类名 (Class)</th>
                                <!-- Jquan 优化：添加 whitespace-nowrap 强制不折行 -->
                                <th class="px-6 py-3 font-medium tracking-wide w-40 whitespace-nowrap">CSS 属性</th>
                                <th class="px-6 py-3 font-medium tracking-wide">核心特性及应用场景</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">object-contain</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">object-fit: contain;</span></td>
                                <td class="px-6 py-4 text-slate-600">
                                    <p class="font-bold text-slate-800 mb-1">保持比例，完整缩放进容器。</p>
                                    不会出现裁剪，绝不失真。可能由于比例不一致导致在容器边缘留有空白（Letterboxing）。常用于电商商品图展示。
                                </td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">object-cover</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">object-fit: cover;</span></td>
                                <td class="px-6 py-4 text-slate-600">
                                    <p class="font-bold text-slate-800 mb-1">保持比例，完全铺满容器。</p>
                                    填充满，绝不失真，无留白！代价是超出容器比例的部分会被**无情裁剪掉**。极度适合用户头像、文章封面图。
                                </td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">object-fill</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">object-fit: fill;</span></td>
                                <td class="px-6 py-4 text-slate-600">
                                    <p class="font-bold text-slate-800 mb-1">强制拉伸填满（无视比例）。</p>
                                    填满无留白，但如果原图比例与容器不一致，**图片将被严重挤压变形**。除非有特殊需求，通常不推荐使用。
                                </td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-slate-500">object-none</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">object-fit: none;</span></td>
                                <td class="px-6 py-4 text-slate-600">
                                    <p class="font-bold text-slate-800 mb-1">按原图物理像素死板呈现。</p>
                                    不缩放。大图放小容器会被严重裁剪，小图放大容器周围全是留白。常配合 <code class="text-xs bg-slate-100 px-1 rounded">object-position</code> 用于展示大图的局部细节。
                                </td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">object-scale-down</td>
                                <td class="px-6 py-4 whitespace-nowrap"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">object-fit: scale-down;</span></td>
                                <td class="px-6 py-4 text-slate-600">
                                    <p class="font-bold text-slate-800 mb-1">智能保守模式 (none 与 contain 的结合)。</p>
                                    如果图片比容器大，它就像 <code class="text-xs bg-slate-100 px-1 rounded">contain</code> 一样缩小以适应；如果图片比容器小，它就像 <code class="text-xs bg-slate-100 px-1 rounded">none</code> 一样保持原尺寸（坚决不放大产生马赛克模糊）。
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：绑定交互事件与代码高亮
    // ==========================================
    static mount(container) {
        // 调用标准代码高亮组件
        initCodeHighlighter({ showLineNumbers: true, langLabel: true });

        const imageEl = container.querySelector('#demo-image');
        const activeClassesEl = container.querySelector('#active-classes');

        // 当前状态记录
        let currentFit = 'object-contain';
        let currentPos = 'object-center';

        // 更新 UI 标签的函数
        const updateActiveClasses = () => {
            activeClassesEl.innerText = `${currentFit} ${currentPos}`;
        };

        // --- Fit 按钮逻辑 ---
        const fitBtns = container.querySelectorAll('.fit-btn');
        fitBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const fitVal = target.dataset.fit;

                // 重置所有 Fit 按钮的 UI
                fitBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/5', 'ring-1', 'ring-primary/30', 'is-active');
                    b.classList.add('border-slate-200', 'bg-white');
                    const text = b.querySelector('span:first-child');
                    text.classList.remove('text-primary');
                    text.classList.add('text-slate-700');
                });

                // 激活当前按钮
                target.classList.remove('border-slate-200', 'bg-white');
                target.classList.add('border-primary', 'bg-primary/5', 'ring-1', 'ring-primary/30', 'is-active');
                const activeText = target.querySelector('span:first-child');
                activeText.classList.remove('text-slate-700');
                activeText.classList.add('text-primary');

                // 移除旧的 Fit 类，添加新的
                imageEl.classList.remove(currentFit);
                imageEl.classList.add(fitVal);
                currentFit = fitVal;

                updateActiveClasses();
            });
        });

        // --- Position 按钮逻辑 (高级拓展) ---
        const posBtns = container.querySelectorAll('.pos-btn');
        posBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const posVal = target.dataset.pos;

                // 重置所有 Pos 按钮的 UI
                posBtns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'is-active');
                    b.classList.add('border-slate-200', 'bg-white');
                    const icon = b.querySelector('i');
                    icon.classList.remove('text-primary');
                    icon.classList.add('text-slate-400');
                });

                // 激活当前按钮
                target.classList.remove('border-slate-200', 'bg-white');
                target.classList.add('border-primary', 'bg-primary/10', 'is-active');
                const activeIcon = target.querySelector('i');
                activeIcon.classList.remove('text-slate-400');
                activeIcon.classList.add('text-primary');

                // 移除旧的 Pos 类，添加新的
                imageEl.classList.remove(currentPos);
                imageEl.classList.add(posVal);
                currentPos = posVal;

                updateActiveClasses();
            });
        });
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'object-contain', desc: '保持比例完整缩放进容器，无裁剪，可能有留白' },
            { class: 'object-cover', desc: '保持比例铺满整个容器，无留白，可能有裁剪' },
            { class: 'object-fill', desc: '强制拉伸填满容器，不保持比例，会变形' },
            { class: 'object-none', desc: '不缩放，按原图实际尺寸显示' },
            { class: 'object-scale-down', desc: '像contain一样缩小，但绝不放大，保持清晰' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'object' 
        }));
    }
}
