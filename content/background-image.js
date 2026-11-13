// 🚀 Jquan Optimized: Background Image 背景图像综合文档 (background-image.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class BackgroundImageDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>背景</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">背景图像 (Background Image)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">背景图像控制台</h1>
                <p class="text-slate-600">管理背景图像是一门艺术。通过组合使用 <code class="inline-code">size</code>, <code class="inline-code">repeat</code>, <code class="inline-code">position</code>, <code class="inline-code">attachment</code> 以及盒模型相关的 <code class="inline-code">clip</code> 和 <code class="inline-code">origin</code> 工具类，你可以创造出千变万化的视觉效果。</p>
            </div>

            <!-- 🧪 高能实验室：全景背景引擎 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-image text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">全景背景操纵实验室</cite>
                    </div>
                    <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 border border-emerald-200 rounded-md">
                        💡 提示：在演示区内向下滚动，观察 Attachment 和 Clip 的效果
                    </span>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    <!-- 左侧：多维控制面板 -->
                    <div class="xl:col-span-5 flex flex-col gap-6">
                        
                        <!-- Size & Repeat -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">尺寸 (Size)</p>
                                <select data-type="size" class="ctrl-select w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                                    <option value="bg-auto">bg-auto (原始大小)</option>
                                    <option value="bg-cover">bg-cover (等比覆盖)</option>
                                    <option value="bg-contain">bg-contain (等比包含)</option>
                                </select>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">重复 (Repeat)</p>
                                <select data-type="repeat" class="ctrl-select w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all">
                                    <option value="bg-no-repeat">bg-no-repeat</option>
                                    <option value="bg-repeat">bg-repeat (平铺)</option>
                                    <option value="bg-repeat-x">bg-repeat-x (水平)</option>
                                    <option value="bg-repeat-y">bg-repeat-y (垂直)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Position (采用 3x3 矩阵更直观) -->
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">定位 (Position)</p>
                            <div class="grid grid-cols-3 gap-1 w-48 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button data-val="bg-top-left" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">左上</button>
                                <button data-val="bg-top" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">中上</button>
                                <button data-val="bg-top-right" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">右上</button>
                                <button data-val="bg-left" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">左中</button>
                                <button data-val="bg-center" class="pos-btn p-2 rounded bg-white shadow-sm border border-slate-200 text-primary font-bold text-xs transition-all is-active">居中</button>
                                <button data-val="bg-right" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">右中</button>
                                <button data-val="bg-bottom-left" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">左下</button>
                                <button data-val="bg-bottom" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">中下</button>
                                <button data-val="bg-bottom-right" class="pos-btn p-2 rounded hover:bg-white text-xs text-slate-500 transition-all">右下</button>
                            </div>
                        </div>

                        <!-- Advanced Box Model Controls -->
                        <div class="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                            <p class="text-xs text-primary uppercase tracking-wider font-bold mb-4 flex items-center gap-1">
                                <i class="ph ph-cube"></i> 高级盒模型 (Box Model)
                            </p>
                            <div class="space-y-4">
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm text-slate-700 font-medium">附着模式 (Attachment)</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button data-type="attachment" data-val="bg-scroll" class="ctrl-btn flex-1 py-1.5 border border-primary bg-primary/10 text-primary font-bold rounded text-xs ring-1 ring-primary/30 is-active">Scroll (随内容)</button>
                                        <button data-type="attachment" data-val="bg-fixed" class="ctrl-btn flex-1 py-1.5 border border-slate-200 bg-white text-slate-600 rounded text-xs hover:border-primary/50">Fixed (视口固定)</button>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm text-slate-700 font-medium">贴图起点 (Origin)</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button data-type="origin" data-val="bg-origin-border" class="ctrl-btn flex-1 py-1.5 border border-slate-200 bg-white text-slate-600 rounded text-[11px] hover:border-primary/50">border</button>
                                        <button data-type="origin" data-val="bg-origin-padding" class="ctrl-btn flex-1 py-1.5 border border-primary bg-primary/10 text-primary font-bold rounded text-[11px] ring-1 ring-primary/30 is-active">padding(默认)</button>
                                        <button data-type="origin" data-val="bg-origin-content" class="ctrl-btn flex-1 py-1.5 border border-slate-200 bg-white text-slate-600 rounded text-[11px] hover:border-primary/50">content</button>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm text-slate-700 font-medium">裁剪边界 (Clip)</span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button data-type="clip" data-val="bg-clip-border" class="ctrl-btn flex-1 py-1.5 border border-primary bg-primary/10 text-primary font-bold rounded text-[11px] ring-1 ring-primary/30 is-active">border(默认)</button>
                                        <button data-type="clip" data-val="bg-clip-padding" class="ctrl-btn flex-1 py-1.5 border border-slate-200 bg-white text-slate-600 rounded text-[11px] hover:border-primary/50">padding</button>
                                        <button data-type="clip" data-val="bg-clip-content" class="ctrl-btn flex-1 py-1.5 border border-slate-200 bg-white text-slate-600 rounded text-[11px] hover:border-primary/50">content</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- 右侧：演示视窗 -->
                    <div class="xl:col-span-7 flex flex-col relative">
                        <div class="bg-slate-100 rounded-lg p-6 flex justify-center items-center relative overflow-hidden h-[380px]">
                            <div id="demo-box" 
                                 class="w-full max-w-xl h-64 border-[16px] border-dashed border-indigo-500/30 p-8 overflow-y-auto transition-all duration-300 shadow-xl rounded-lg bg-[url('https://www.jquan.win/upload/20250626/2a170408a3db79.webp')]">
                                 <!-- 内容占位，为了挤出滚动条，测试 attachment -->
                                 <div class="h-[400px] w-full bg-white/60 backdrop-blur-sm border border-white rounded p-4 shadow-sm flex flex-col items-center">
                                    <span class="font-bold text-indigo-900 mb-2">Content Area</span>
                                    <span class="text-xs text-indigo-700 text-center">向下滚动我，测试 <code class="bg-white/80 px-1 rounded">bg-fixed</code> 与 <code class="bg-white/80 px-1 rounded">bg-scroll</code> 的区别。</span>
                                    <div class="mt-auto pb-4">
                                        <i class="ph ph-arrow-down text-2xl text-indigo-600 animate-bounce"></i>
                                    </div>
                                 </div>
                            </div>
                        </div>

                        <!-- 实时代码 -->
                        <div class="w-full rounded-b-xl py-4" id="code-container">
                            <!-- 动态注入代码块 -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：最佳实践代码 (Jquan 优化：直接使用原生 HTML 标签，引擎自动转义) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">常见场景最佳实践</cite>
                </div>
                <div class="p-6">
                    <pre><code class="language-html">
<!-- 场景 1：全屏横幅 Hero Banner (居中、覆盖、不重复) -->
<div class="w-full h-96 bg-[url('hero.jpg')] bg-cover bg-center bg-no-repeat">
    <h1 class="text-white text-4xl">Jquan 实验室</h1>
</div>

<!-- 场景 2：视差滚动背景 Parallax (利用 bg-fixed 锁定视口) -->
<div class="w-full h-64 bg-[url('stars.jpg')] bg-fixed bg-cover bg-center bg-no-repeat">
    <p class="text-white backdrop-blur-sm bg-black/30 p-4">背景不会随着我的滚动而移动</p>
</div>

<!-- 场景 3：装饰性纹理铺图 (重复平铺) -->
<div class="w-full h-full bg-[url('pattern.png')] bg-repeat bg-auto">
    <!-- 你的页面内容 -->
</div>
                    </code></pre>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">背景图像字典大全 (Background Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white p-2">
                    <!-- 尺寸与重复 -->
                    <table class="w-full text-left text-sm border-collapse mb-6">
                        <thead class="bg-slate-50 text-slate-500 border border-slate-200">
                            <tr>
                                <th colspan="3" class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs">尺寸 (Size) & 重复 (Repeat)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700 border border-slate-200 border-t-0">
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-primary w-1/4">bg-auto</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-size: auto;</td>
                                <td class="px-4 py-3 text-slate-600">保持图像的原始物理大小，可能会被容器裁剪。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-primary w-1/4">bg-cover</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-size: cover;</td>
                                <td class="px-4 py-3 text-slate-600">拉伸图像以<strong>完全填满</strong>容器，图像的某些部分可能会被裁切。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-primary w-1/4">bg-contain</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-size: contain;</td>
                                <td class="px-4 py-3 text-slate-600">缩放图像直到刚好<strong>完全放入</strong>容器内，可能会出现留白。</td>
                            </tr>
                            <tr class="bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-sky-600">bg-repeat</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">background-repeat: repeat;</td>
                                <td class="px-4 py-3 text-slate-600">在 X 和 Y 轴上同时平铺图像。</td>
                            </tr>
                            <tr class="bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-sky-600">bg-no-repeat</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">background-repeat: no-repeat;</td>
                                <td class="px-4 py-3 text-slate-600">图像仅显示一次，不平铺。</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 定位与附着 -->
                    <table class="w-full text-left text-sm border-collapse mb-6">
                        <thead class="bg-slate-50 text-slate-500 border border-slate-200">
                            <tr>
                                <th colspan="3" class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs">定位 (Position) & 附着 (Attachment)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700 border border-slate-200 border-t-0">
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-primary w-1/4">bg-{center|top|bottom...}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-position: ...</td>
                                <td class="px-4 py-3 text-slate-600">控制图像在容器内的对齐网格（如 <code>bg-center</code>, <code>bg-top-right</code>）。</td>
                            </tr>
                            <tr class="bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-amber-600 w-1/4">bg-scroll</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-attachment: scroll;</td>
                                <td class="px-4 py-3 text-slate-600">默认行为。背景相对于元素本身固定，当页面滚动时，它会随之滚动出视口。</td>
                            </tr>
                            <tr class="bg-slate-50/30">
                                <td class="px-4 py-3 font-mono font-bold text-amber-600 w-1/4">bg-fixed</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-attachment: fixed;</td>
                                <td class="px-4 py-3 text-slate-600">背景相对于<strong>浏览器视口固定</strong>。实现视差滚动 (Parallax) 的核心属性。</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 高级盒模型 -->
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-slate-50 text-slate-500 border border-slate-200">
                            <tr>
                                <th colspan="3" class="px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-xs">盒模型控制 (Clip & Origin)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700 border border-slate-200 border-t-0">
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-fuchsia-600 w-1/4">bg-clip-{border|padding|content}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-clip: ...-box;</td>
                                <td class="px-4 py-3 text-slate-600">决定背景被“剪刀”裁减到哪一层。<code>border</code> 绘制到边框外沿；<code>padding</code> 不包含边框区域；<code>content</code> 仅在内容区绘制。</td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-mono font-bold text-fuchsia-600 w-1/4">bg-origin-{border|padding|content}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500 w-1/3">background-origin: ...-box;</td>
                                <td class="px-4 py-3 text-slate-600">决定背景坐标 (0,0) 的“起点”。默认从 <code>padding</code> 起始。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    static mount(container) {
        // 维持 Jquan 的高标准：状态机管理
        const imageClass = "bg-[url('https://www.jquan.win/upload/20250626/2a170408a3db79.webp')]";
        let state = {
            size: 'bg-auto',
            repeat: 'bg-no-repeat',
            position: 'bg-center',
            attachment: 'bg-scroll',
            clip: 'bg-clip-border',
            origin: 'bg-origin-padding'
        };

        const demoBox = container.querySelector('#demo-box');
        const codeContainer = container.querySelector('#code-container');
        const escapeHtml = value => String(value).replace(/[&<>\"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '\"': '&quot;',
            "'": '&#39;'
        }[character]));

        const updateBox = () => {
            // 清理旧的变动 class，保留盒模型基础 class
            demoBox.className = `w-full max-w-xl h-64 border-[16px] border-dashed border-indigo-500/30 p-8 overflow-y-auto transition-all duration-300 shadow-xl rounded-lg ${imageClass}`;
            
            const classesToApply = [
                state.size,
                state.repeat,
                state.position,
                state.attachment,
                state.clip,
                state.origin
            ];

            demoBox.classList.add(...classesToApply);
            
            // Jquan 优化：结构换行拆分（让 clip/origin 属性不再躲在视口外侧），并且直接写入原生 HTML 标签！
            const htmlSnippet = 
`<div class="w-64 h-64 p-8 border-16
            ${state.size} ${state.repeat} ${state.position} 
            ${state.attachment} ${state.clip} ${state.origin}"
     ${imageClass}">
  <!-- 滚动内容 -->
</div>`;

            // 直接塞进去，配合你聪明的 code-block.mjs
            codeContainer.innerHTML = `<pre><code class="language-html">${escapeHtml(htmlSnippet)}</code></pre>`;
            
            // Jquan 优化：打开行号以保持绝对的 UI 一致性
            initCodeHighlighter({ showLineNumbers: true, langLabel: true });
        };

        // 1. 绑定 Select 事件 (Size & Repeat)
        const selects = container.querySelectorAll('.ctrl-select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                const target = e.currentTarget;
                const type = target.dataset.type;
                state[type] = target.value;
                updateBox();
            });
        });

        // 2. 绑定 3x3 矩阵事件 (Position)
        const posBtns = container.querySelectorAll('.pos-btn');
        posBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                posBtns.forEach(b => {
                    b.classList.remove('bg-white', 'shadow-sm', 'border', 'border-slate-200', 'text-primary', 'font-bold', 'is-active');
                    b.classList.add('hover:bg-white', 'text-slate-500');
                });
                
                const target = e.currentTarget;
                target.classList.remove('hover:bg-white', 'text-slate-500');
                target.classList.add('bg-white', 'shadow-sm', 'border', 'border-slate-200', 'text-primary', 'font-bold', 'is-active');
                
                state.position = target.dataset.val;
                updateBox();
            });
        });

        // 3. 绑定盒模型相关按钮事件 (Attachment, Clip, Origin)
        const ctrlBtns = container.querySelectorAll('.ctrl-btn');
        ctrlBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const type = target.dataset.type;
                
                const siblings = container.querySelectorAll(`.ctrl-btn[data-type="${type}"]`);
                siblings.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary', 'font-bold', 'ring-1', 'ring-primary/30', 'is-active');
                    b.classList.add('border-slate-200', 'bg-white', 'text-slate-600', 'hover:border-primary/50');
                });

                target.classList.remove('border-slate-200', 'bg-white', 'text-slate-600', 'hover:border-primary/50');
                target.classList.add('border-primary', 'bg-primary/10', 'text-primary', 'font-bold', 'ring-1', 'ring-primary/30', 'is-active');
                
                state[type] = target.dataset.val;
                updateBox();
            });
        });

        // 初始化
        updateBox();
    }

    static async onSearch(keyword) {
        return [{ title: 'background-image', desc: '背景图像大小、定位与剪裁', actionValue: 'background-image' }];
    }
}
