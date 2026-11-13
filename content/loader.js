// 🚀 Jquan Optimized: 现代加载器控制台 (loader.js)
// 完美集成 JquanUI 原生能力，新增顶级交互体验与视觉暗示！
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LoaderDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-squares-four"></i>组件</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">加载器 (Loader)</li>
            </ul>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">现代引擎级加载器</h1>
                <p class="text-slate-600 leading-relaxed">
                    JquanUI 已将常用加载动画作为<strong>原生能力</strong>集成。<br>
                    纯净的原子类组合，零外部插件依赖。将鼠标悬停在卡片上，点击即可一键复制纯 HTML 代码！
                </p>
            </div>

            <!-- 加载器展示网格 (完美 2x4 布局) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                ${this.renderLoaderBox(
                    '脉冲波浪', 
                    'loader-waves',
                    `<div class="flex items-center justify-center gap-1.5 h-10">
    <div class="w-1.5 h-full bg-blue-500 rounded-full animate-wave animation-delay-0"></div>
    <div class="w-1.5 h-full bg-blue-500 rounded-full animate-wave animation-delay-100"></div>
    <div class="w-1.5 h-full bg-blue-500 rounded-full animate-wave animation-delay-200"></div>
    <div class="w-1.5 h-full bg-blue-500 rounded-full animate-wave animation-delay-300"></div>
    <div class="w-1.5 h-full bg-blue-500 rounded-full animate-wave animation-delay-500"></div>
</div>`
                )}

                ${this.renderLoaderBox(
                    '旋风光环', 
                    'loader-whirlwind',
                    `<div class="w-14 h-14 rounded-full border-4 border-slate-200 border-t-indigo-500 border-b-indigo-500 animate-spin"></div>`
                )}

                ${this.renderLoaderBox(
                    '阴影辉光', 
                    'loader-shadowring',
                    `<div class="w-12 h-12 rounded-full border-4 border-transparent border-t-rose-500 animate-spin shadow-[0_0_15px_rgba(244,63,94,0.6)]"></div>`
                )}

                ${this.renderLoaderBox(
                    '散点自转', 
                    'loader-scatterplotrotation',
                    `<div class="relative w-12 h-12 animate-spin">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rounded-full"></div>
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full opacity-70"></div>
    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-amber-500 rounded-full opacity-40"></div>
    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full opacity-90"></div>
</div>`
                )}

                ${this.renderLoaderBox(
                    '内环滑块', 
                    'loader-innerringslider',
                    `<div class="relative w-14 h-14 flex items-center justify-center">
    <div class="absolute inset-0 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin"></div>
    <div class="absolute inset-2 rounded-full border-4 border-slate-200 border-b-emerald-500 animate-spin animation-dir-reverse animation-duration-700"></div>
</div>`
                )}

                ${this.renderLoaderBox(
                    '线性穿梭', 
                    'loader-line',
                    `<div class="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
    <div class="w-1/2 h-full bg-cyan-500 rounded-full animate-slide"></div>
</div>`
                )}

                ${this.renderLoaderBox(
                    '液位填充', 
                    'loader-fill',
                    `<div class="w-12 h-12 border-4 border-violet-200 rounded-full overflow-hidden flex items-end">
    <div class="w-full h-full bg-violet-500 origin-bottom animate-fill"></div>
</div>`
                )}

                ${this.renderLoaderBox(
                    '异变晶体', 
                    'loader-morph',
                    `<div class="w-12 h-12 bg-gradient-to-tr from-fuchsia-500 to-cyan-500 animate-morph shadow-lg"></div>`
                )}

            </div>

            <!-- 全局复制成功提示 Toast -->
            <div id="toast-msg" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-50 pointer-events-none">
                <i class="ph-fill ph-check-circle text-emerald-400 text-xl"></i>
                <span>加载器代码已复制到剪贴板！</span>
            </div>
            <div class="mt-8">
                <pre id="loader-code"><code class="language-html">
&lt;div class="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin"&gt;&lt;/div&gt;
                </code></pre>
            </div>

        </div>
        `;
    }

    // 辅助：生成卡片并对 HTML 代码进行 URI 编码，防断裂
    static renderLoaderBox(title, subtitle, code) {
        const encodedCode = encodeURIComponent(code);
        return `
        <div class="code-copy-trigger group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300" data-code="${encodedCode}">
            <!-- 纯 CSS 实现的实验舱网格背景 -->
            <div class="absolute inset-0 rounded-xl bg-[radial-gradient(rgb(0_0_0)_1px,transparent_1px)] bg-[length:16px_16px] opacity-[0.03] pointer-events-none"></div>
            
            <!-- 🚀 Jquan 体验提升：悬停时优雅滑出的复制按钮 -->
            <div class="copy-indicator absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm transform translate-y-1 group-hover:translate-y-0 z-20">
                <i class="ph ph-copy text-base"></i>
                <span class="text-[11px] font-bold tracking-wide">复制代码</span>
            </div>

            <div class="h-20 flex items-center justify-center w-full relative z-10 pointer-events-none">
                ${code}
            </div>
            
            <div class="mt-6 text-center relative z-10 pointer-events-none">
                <span class="text-slate-800 font-bold text-sm block mb-1 group-hover:text-blue-600 transition-colors">${title}</span>
                <span class="text-slate-400 font-mono text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded">${subtitle}</span>
            </div>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ selector: '#loader-code code', showLineNumbers: false, langLabel: false });
        const copyTriggers = container.querySelectorAll('.code-copy-trigger');
        const toastMsg = container.querySelector('#toast-msg');
        let toastTimeout;

        copyTriggers.forEach(box => {
            box.addEventListener('click', () => {
                // 解码真实的 HTML 代码
                const codeToCopy = decodeURIComponent(box.dataset.code);
                
                // 获取当前卡片内的状态指示器
                const indicator = box.querySelector('.copy-indicator');
                const icon = indicator.querySelector('i');
                const text = indicator.querySelector('span');
                
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    
                    // 1. 卡片局部状态反馈 (变为绿色已复制)
                    indicator.classList.remove('bg-slate-50', 'border-slate-200', 'text-slate-500');
                    indicator.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-600');
                    icon.className = 'ph-fill ph-check-circle text-base';
                    text.innerText = '已复制!';

                    // 2. 唤起全局 Toast
                    toastMsg.classList.remove('translate-y-20', 'opacity-0');
                    toastMsg.classList.add('translate-y-0', 'opacity-100');
                    
                    if (toastTimeout) clearTimeout(toastTimeout);
                    
                    toastTimeout = setTimeout(() => {
                        // 还原全局 Toast
                        toastMsg.classList.remove('translate-y-0', 'opacity-100');
                        toastMsg.classList.add('translate-y-20', 'opacity-0');
                        
                        // 还原卡片局部状态
                        indicator.classList.remove('bg-emerald-50', 'border-emerald-200', 'text-emerald-600');
                        indicator.classList.add('bg-slate-50', 'border-slate-200', 'text-slate-500');
                        icon.className = 'ph ph-copy text-base';
                        text.innerText = '复制代码';
                    }, 2000);

                }).catch(err => {
                    console.error('复制失败', err);
                });
            });
        });
    }

    static async onSearch(keyword) {
        return [
            { title: '加载器 (Loader)', desc: '完全依赖 JquanUI 引擎原生能力构建的加载动效', actionValue: 'loader' }
        ];
    }
}

