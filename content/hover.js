// 🚀 Jquan Optimized: 现代悬停动画控制台 (hover.js)
// 抛弃臃肿的 Hover.css，拥抱原子化组合的无尽魔法！
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class HoverDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-mouse-pointer"></i>交互</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">悬停动画 (Hover)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">现代悬停与微动效</h1>
                <p class="text-slate-600 leading-relaxed">
                    在 JquanUI 中，我们利用引擎强大的 <code class="inline-code">transition</code> 与 <code class="inline-code">hover: / group-hover:</code> 变体，你可以像搭积木一样，自由控制动画的<strong class="text-slate-800">方向、颜色、缓动曲线与耗时</strong>，组合出无数种质感极佳的现代微动效。
                </p>
            </div>

            <!-- ========================================== -->
            <!-- 🧲 实验室 1：基础物理悬停 (Transform) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-bounding-box text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">基础物理变换 (Transforms)</cite>
                    </div>
                    <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                        利用 scale / translate / rotate
                    </span>
                </div>
                
                <div class="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        
                        ${this.renderHoverBox(
                            '放大 (Grow)', 
                            'transition-transform duration-300 hover:scale-110', 
                            'hover:scale-110'
                        )}
                        
                        ${this.renderHoverBox(
                            '缩小 (Shrink)', 
                            'transition-transform duration-300 hover:scale-95', 
                            'hover:scale-95'
                        )}
                        
                        ${this.renderHoverBox(
                            '上浮 (Float)', 
                            'transition-transform duration-300 hover:-translate-y-2', 
                            'hover:-translate-y-2'
                        )}
                        
                        ${this.renderHoverBox(
                            '下沉 (Sink)', 
                            'transition-transform duration-300 hover:translate-y-2', 
                            'hover:translate-y-2'
                        )}

                        ${this.renderHoverBox(
                            '左推 (Push L)', 
                            'transition-transform duration-300 hover:-translate-x-2', 
                            'hover:-translate-x-2'
                        )}

                        ${this.renderHoverBox(
                            '右推 (Push R)', 
                            'transition-transform duration-300 hover:translate-x-2', 
                            'hover:translate-x-2'
                        )}
                        
                        ${this.renderHoverBox(
                            '轻微倾斜 (Skew)', 
                            'transition-transform duration-300 hover:skew-x-6', 
                            'hover:skew-x-6'
                        )}

                        ${this.renderHoverBox(
                            '旋转 (Rotate)', 
                            'transition-transform duration-300 hover:rotate-6', 
                            'hover:rotate-6'
                        )}
                        
                        ${this.renderHoverBox(
                            '放大并旋转', 
                            'transition-transform duration-300 hover:scale-110 hover:rotate-3', 
                            'hover:scale-110 + rotate'
                        )}

                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- 🌟 实验室 2：光影与色彩 (Shadow & Colors) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-sparkle text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">光影与质感 (Shadows & Colors)</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        ${this.renderAdvancedBox(
                            '深邃阴影 (Deep Shadow)',
                            'hover:shadow-xl hover:-translate-y-1',
                            'bg-white text-slate-700 border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'
                        )}

                        ${this.renderAdvancedBox(
                            '发光边缘 (Glow)',
                            'hover:shadow-lg hover:shadow-amber-500/50',
                            'bg-white text-slate-700 border border-slate-200 transition-shadow duration-300 hover:shadow-lg hover:shadow-amber-500/50 hover:border-amber-400'
                        )}

                        ${this.renderAdvancedBox(
                            '内嵌光环 (Inset Ring)',
                            'hover:ring-2 hover:bg-slate-50',
                            'bg-white text-slate-700 border border-slate-200 transition-all duration-300 hover:ring-2 hover:ring-amber-500 hover:ring-inset hover:bg-amber-50'
                        )}

                        ${this.renderAdvancedBox(
                            '柔和褪色 (Fade)',
                            'hover:opacity-70',
                            'bg-primary text-white transition-opacity duration-300 hover:opacity-70'
                        )}

                        ${this.renderAdvancedBox(
                            '背景反转 (Invert)',
                            'hover:bg-slate-800 hover:text-white',
                            'bg-white text-primary border border-primary transition-colors duration-300 hover:bg-slate-800 hover:text-white'
                        )}

                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- ⚔️ 实验室 3：现代高级伪类动效 (Group Hover Magic) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">高级 UI 动效 (Composition Magic)</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8 border-b border-slate-100">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        <!-- 1. 扫光填充 (Sweep to Right) -->
                        <div class="code-copy-trigger flex flex-col gap-2 cursor-pointer group" data-code="relative overflow-hidden group transition-colors duration-300 | absolute inset-0 bg-rose-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 -z-10">
                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">扫光填充 (Sweep to Right)</span>
                            
                            <div class="relative overflow-hidden group border border-slate-100 rounded-lg p-4 text-center z-10">
                                <span class="relative z-20 text-slate-700 group-hover:text-white transition-colors duration-300 font-bold">悬停扫光</span>
                                <!-- 魔法核心：底层色块，初始宽度0，左侧对齐，悬停时撑满 -->
                                <div class="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out -z-10"></div>
                            </div>
                        </div>

                        <!-- 2. 扫光填充 (Sweep to Bottom) -->
                        <div class="code-copy-trigger flex flex-col gap-2 cursor-pointer group" data-code="relative overflow-hidden group | absolute inset-0 bg-sky-500 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 -z-10">
                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">向下浸染 (Sweep to Bottom)</span>
                            
                            <div class="relative overflow-hidden group border border-slate-100 rounded-lg p-4 text-center z-10">
                                <span class="relative z-20 text-slate-700 group-hover:text-white transition-colors duration-300 font-bold">悬停浸染</span>
                                <!-- 魔法核心：底层色块，顶部对齐，垂直拉伸 -->
                                <div class="absolute inset-0 bg-primary scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 ease-out -z-10"></div>
                            </div>
                        </div>

                        <!-- 3. 底部中心横线展开 (Underline Reveal) -->
                        <div class="code-copy-trigger flex flex-col gap-2 cursor-pointer group" data-code="relative inline-block group py-1 | absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-out">
                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">中心下划线 (Underline Reveal)</span>
                            
                            <div class="p-4 text-center border border-slate-100 rounded-lg flex items-center justify-center">
                                <!-- Jquan 修复：移除未注册的命名分组，直接使用外部卡片的 group-hover！inline-block 依然负责包裹正确的宽度 -->
                                <div class="relative inline-block py-1 w-20">
                                    <span class="text-slate-700 group-hover:text-indigo-400 transition-colors duration-300 font-bold">导航链接</span>
                                    <div class="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-out"></div>
                                </div>
                            </div>
                        </div>
                        <!-- 4. 气泡浮出 (Bubble Up) -->
                        <div class="code-copy-trigger flex flex-col gap-2 cursor-pointer group" data-code="group-hover:-translate-y-1 | absolute opacity-0 translate-y-3 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 ease-out">
                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">悬停气泡 (Bubble Tooltip)</span>
                            
                            <div class="relative group p-4 text-center flex items-center justify-center border border-primary rounded-lg bg-primary">
                                <i class="ph ph-bell-ringing text-2xl text-slate-300 group-hover:text-amber-400 transition-colors duration-300 group-hover:-translate-y-1 transform"></i>
                                <!-- Jquan 修复：加大了位移距离，引入了初始 scale-95，并增加了 ease-out，让气泡弹出的质感如丝般顺滑！ -->
                                <div class="absolute -top-12 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg opacity-0 translate-y-3 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none">
                                    新消息!
                                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rotate-45"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 5. 图标位移 (Icon Forward) -->
                        <div class="code-copy-trigger flex flex-col gap-2 cursor-pointer group" data-code="group-hover:pr-6 | absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">图标推入 (Icon Forward)</span>
                            
                            <div class="relative group border border-primary rounded-lg p-4 text-center overflow-hidden bg-primary hover:bg-primary/60 transition-colors">
                                <span class="font-bold text-slate-300 group-hover:text-white transition-colors">继续阅读</span>
                                <!-- 图标推入 -->
                                <i class="ph ph-arrow-right absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white font-bold"></i>
                            </div>
                        </div>

                        <!-- 6. 遮罩层显现 (Overlay Fade) -->
                        <div class="code-copy-trigger flex flex-col gap-2 cursor-pointer group" data-code="relative overflow-hidden group | absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all">
                            <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">毛玻璃遮罩 (Blur Overlay)</span>
                            
                            <div class="relative overflow-hidden group rounded-lg h-16 bg-primary border border-primary flex items-center justify-center">
                                <span class="font-bold text-white">商品图片区域</span>
                                <!-- 毛玻璃遮罩 -->
                                <div class="absolute inset-0 bg-primary/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <span class="text-white font-bold text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">查看详情</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="mt-8 text-center">
                        <p class="text-sm text-slate-400"><i class="ph ph-info"></i> 点击上述任意魔法模块，可立即复制实现它的核心 HTML/原子类代码组合。</p>
                    </div>
                </div>
            </div>

            <!-- 全局复制成功提示 Toast -->
            <div id="toast-msg" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-50 pointer-events-none">
                <i class="ph-fill ph-check-circle text-emerald-400 text-xl"></i>
                <span>拼装代码已复制到剪贴板！</span>
            </div>
            <div class="mt-8">
                <pre id="hover-code"><code class="language-html">
&lt;button class="transition-transform duration-300 hover:scale-110"&gt;悬停&lt;/button&gt;
                </code></pre>
            </div>

        </div>
        `;
    }

    // 辅助：生成基础盒子的函数
    static renderHoverBox(label, classNames, showText) {
        return `
        <div class="code-copy-trigger flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl cursor-pointer ${classNames} group relative" data-code="${classNames}">
            <span class="text-slate-800 font-bold text-sm mb-1 pointer-events-none">${label}</span>
            <span class="text-slate-400 font-mono text-[10px] pointer-events-none">${showText}</span>
        </div>`;
    }

    // 辅助：生成中级盒子的函数
    static renderAdvancedBox(label, code, fullClasses) {
        return `
        <div class="code-copy-trigger flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer ${fullClasses} group relative" data-code="${code}">
            <span class="font-bold text-sm mb-1 pointer-events-none">${label}</span>
            <span class="font-mono text-[10px] opacity-70 pointer-events-none">${code}</span>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ selector: '#hover-code code', showLineNumbers: false, langLabel: false });
        // 挂载全局点击复制代码的逻辑
        const copyTriggers = container.querySelectorAll('.code-copy-trigger');
        const toastMsg = container.querySelector('#toast-msg');
        let toastTimeout;

        copyTriggers.forEach(box => {
            box.addEventListener('click', () => {
                const codeToCopy = box.dataset.code;
                
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    // 显示 Toast
                    toastMsg.classList.remove('translate-y-20', 'opacity-0');
                    toastMsg.classList.add('translate-y-0', 'opacity-100');
                    
                    if (toastTimeout) clearTimeout(toastTimeout);
                    
                    // 2秒后隐藏 Toast
                    toastTimeout = setTimeout(() => {
                        toastMsg.classList.remove('translate-y-0', 'opacity-100');
                        toastMsg.classList.add('translate-y-20', 'opacity-0');
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                });
            });
        });
    }

    static async onSearch(keyword) {
        return [
            { title: '悬停动效 (Hover)', desc: '使用原子类组合现代交互动画，抛弃臃肿插件', actionValue: 'hover' }
        ];
    }
}
