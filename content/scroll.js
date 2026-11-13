// 🚀 Jquan Optimized: 现代滚动控制台 (scroll.js) v2.0
// 新增 Firefox 跨端兼容、纵向吸附 (Snap Y) 与滚动链阻断 (Overscroll)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ScrollDoc {
    static themeScrollbarClasses() {
        return 'scrollbar-thin scrollbar-color-[rgb(var(--color-primary)_/_0.3)_rgb(var(--color-primary)_/_0.05)] scrollbar:w-1.5 scrollbar:h-1.5 scrollbar:rounded-lg scrollbar-track:bg-primary/5 scrollbar-track:rounded-lg scrollbar-thumb:bg-primary/30 scrollbar-thumb:rounded-lg';
    }

    static render() {
        const themedScrollbar = this.themeScrollbarClasses();
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-squares-four"></i>交互与布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">滚动 (Scroll)</li>
            </ul>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-2">
                    现代滚动与溢出 <span class="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-mono align-middle">v2.0</span>
                </h1>
                <p class="text-slate-600 leading-relaxed max-w-3xl mt-3">
                    抛弃沉重的 JS 滚动插件吧！利用 JquanUI 提供的原子类，你可以轻松实现 <strong>滚动捕获 (Scroll Snap)</strong>、<strong>平滑滚动 (Smooth Scroll)</strong>、<strong>滚动链阻断</strong>，并获得全浏览器兼容的主题化滚动条。
                </p>
            </div>

            <!-- 展示区：采用单列/双列响应式网格 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                ${this.renderShowcase(
                    '横向滚动捕获 (Scroll Snap X)',
                    '使用 <code>snap-x</code> 和 <code>snap-mandatory</code> 实现画廊级的原生吸附体验。',
                    `<div class="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 ${themedScrollbar}">
    <div class="shrink-0 w-4/5 sm:w-72 h-40 rounded-2xl bg-white border border-slate-200 flex items-center justify-center snap-center shadow-sm transition-transform hover:border-primary/40">
        <span class="text-slate-400 font-bold text-xl tracking-widest">CARD 01</span>
    </div>
    <div class="shrink-0 w-4/5 sm:w-72 h-40 rounded-2xl bg-white border border-slate-200 flex items-center justify-center snap-center shadow-sm transition-transform hover:border-primary/40">
        <span class="text-slate-400 font-bold text-xl tracking-widest">CARD 02</span>
    </div>
    <div class="shrink-0 w-4/5 sm:w-72 h-40 rounded-2xl bg-white border border-slate-200 flex items-center justify-center snap-center shadow-sm transition-transform hover:border-primary/40">
        <span class="text-slate-400 font-bold text-xl tracking-widest">CARD 03</span>
    </div>
    <div class="shrink-0 w-4/5 sm:w-72 h-40 rounded-2xl bg-white border border-slate-200 flex items-center justify-center snap-center shadow-sm transition-transform hover:border-primary/40">
        <span class="text-slate-400 font-bold text-xl tracking-widest">CARD 04</span>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '纵向全屏吸附 (Scroll Snap Y) 🚀',
                    '垂直方向的轮播、整屏落地页或类似短视频的交互，全靠 <code>snap-y</code> 支持。',
                    `<div class="h-56 overflow-y-auto snap-y snap-mandatory ${themedScrollbar} border border-slate-200 rounded-xl bg-slate-50">
    <div class="h-full w-full snap-start flex items-center justify-center bg-indigo-50 border-b border-indigo-100">
        <span class="text-indigo-400 font-bold tracking-widest">SECTION ONE</span>
    </div>
    <div class="h-full w-full snap-start flex items-center justify-center bg-emerald-50 border-b border-emerald-100">
        <span class="text-emerald-400 font-bold tracking-widest">SECTION TWO</span>
    </div>
    <div class="h-full w-full snap-start flex items-center justify-center bg-rose-50 border-b border-rose-100">
        <span class="text-rose-400 font-bold tracking-widest">SECTION THREE</span>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '平滑滚动与锚点间距 (Smooth Scroll)',
                    '<code>scroll-smooth</code> 实现丝滑跳转，<code>scroll-mt-*</code> 预留完美的顶部悬浮导航间距。',
                    `<div class="relative h-56 overflow-y-auto scroll-smooth ${themedScrollbar} border border-slate-200 rounded-xl bg-white">
    <!-- 悬浮导航头 -->
    <div class="sticky top-0 flex gap-2 p-2 bg-white/90 backdrop-blur border-b border-slate-100 z-10">
        <a href="#sec-1" class="flex-1 text-center py-1.5 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-600 font-medium rounded-lg text-sm transition-colors">A 块</a>
        <a href="#sec-2" class="flex-1 text-center py-1.5 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-600 font-medium rounded-lg text-sm transition-colors">B 块</a>
        <a href="#sec-3" class="flex-1 text-center py-1.5 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-600 font-medium rounded-lg text-sm transition-colors">C 块</a>
    </div>
    <!-- 内容区 -->
    <div class="p-4 space-y-6">
        <div id="sec-1" class="h-32 bg-slate-50 rounded-xl flex flex-col items-center justify-center scroll-mt-14 border border-slate-200 text-slate-400">
            <span class="font-bold text-lg">区块 A</span>
            <span class="text-xs mt-1 font-mono">scroll-mt-14</span>
        </div>
        <div id="sec-2" class="h-32 bg-slate-50 rounded-xl flex flex-col items-center justify-center scroll-mt-14 border border-slate-200 text-slate-400">
            <span class="font-bold text-lg">区块 B</span>
            <span class="text-xs mt-1 font-mono">scroll-mt-14</span>
        </div>
        <div id="sec-3" class="h-32 bg-slate-50 rounded-xl flex flex-col items-center justify-center scroll-mt-14 border border-slate-200 text-slate-400">
            <span class="font-bold text-lg">区块 C</span>
            <span class="text-xs mt-1 font-mono">scroll-mt-14</span>
        </div>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '滚动链阻断 (Overscroll Contain) 🛡️',
                    '使用 <code>overscroll-contain</code>，当内部容器滚动到底部时，防止外层页面跟着滚动。',
                    `<div class="h-56 overflow-y-auto overscroll-contain ${themedScrollbar} border border-amber-200 rounded-xl bg-amber-50 relative">
    <div class="sticky top-0 bg-amber-100/90 backdrop-blur border-b border-amber-200 px-4 py-2 text-xs text-amber-700 font-bold flex items-center justify-between z-10">
        <span>试着在这个框里猛烈滚动！</span>
        <i class="ph-fill ph-warning-circle text-lg"></i>
    </div>
    <div class="p-4 text-amber-800/60 text-sm leading-relaxed">
        <p class="mb-4">在普通的滚动容器中（如模态框、下拉菜单），一旦你滚动到底部，继续滑动鼠标滚轮或触控板，整个父级网页就会跟着滑动。这被称为“滚动链 (Scroll Chaining)”。</p>
        <p class="mb-4">这通常是非常糟糕的用户体验，因为用户原本只打算查看弹窗内的内容。</p>
        <p class="mb-4">加入 <code>overscroll-contain</code> 或 <code>overscroll-none</code> 属性后，滚动行为会被严格限制在此容器内部。</p>
        <p class="mb-2">向下滚动...</p>
        <p class="mb-2">继续...</p>
        <p class="mb-2">快到了...</p>
        <p class="font-bold text-amber-700 bg-amber-200/50 p-3 rounded">🎯 触底了！你看，外层页面并没有被连带滚动！</p>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '隐藏滚动条 (Hide Scrollbar)',
                    '内容可以自由滚动，但滚动条被完全隐藏。适用于移动端优先的横向滑动菜单。',
                    `<div class="w-full flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-1">
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-md font-bold text-xl">1</div>
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary/80 text-white flex items-center justify-center shadow-md font-bold text-xl">2</div>
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary/60 text-white flex items-center justify-center shadow-md font-bold text-xl">3</div>
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary/40 text-primary flex items-center justify-center shadow-md font-bold text-xl">4</div>
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-md font-bold text-xl">5</div>
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-md font-bold text-xl">6</div>
    <div class="shrink-0 w-24 h-24 rounded-full bg-primary/5 text-primary flex items-center justify-center border border-primary/20 font-bold text-xl">7</div>
</div>`
                )}

                ${this.renderShowcase(
                    '原生滚动条宽度 (Scrollbar Width) ✨',
                    '使用 <code>scrollbar-thin</code> 或 <code>scrollbar-none</code> 极简控制现代浏览器原生滚动条的粗细与隐藏。基于最新 CSS 标准，告别臃肿的伪元素。',
                    `<div class="flex gap-3">
    <!-- Thin (细滚动条) -->
    <div class="flex-1 h-40 overflow-y-auto scrollbar-thin border border-slate-200 rounded-lg bg-white p-3 shadow-sm hover:border-primary/40 transition-colors">
        <div class="text-xs font-bold text-slate-400 mb-2 text-center bg-slate-50 py-1 rounded">scrollbar-thin</div>
        <div class="h-64 bg-slate-50/50 rounded border border-dashed border-slate-200 flex flex-col items-center justify-between py-2 text-slate-400 font-mono text-xs">
            <span>顶部</span>
            <div class="w-px h-10 bg-slate-200"></div>
            <span>底部</span>
        </div>
    </div>
    <!-- None (无滚动条) -->
    <div class="flex-1 h-40 overflow-y-auto scrollbar-none border border-slate-200 rounded-lg bg-white p-3 shadow-sm hover:border-primary/40 transition-colors">
        <div class="text-xs font-bold text-slate-400 mb-2 text-center bg-slate-50 py-1 rounded">scrollbar-none</div>
        <div class="h-64 bg-slate-50/50 rounded border border-dashed border-slate-200 flex flex-col items-center justify-between py-2 text-slate-400 font-mono text-xs">
            <span>顶部</span>
            <div class="w-px h-10 bg-slate-200"></div>
            <span>底部</span>
        </div>
    </div>
    <!-- Auto (默认滚动条) -->
    <div class="flex-1 h-40 overflow-y-auto scrollbar-auto border border-slate-200 rounded-lg bg-white p-3 shadow-sm hover:border-primary/40 transition-colors hidden sm:block">
        <div class="text-xs font-bold text-slate-400 mb-2 text-center bg-slate-50 py-1 rounded">scrollbar-auto</div>
        <div class="h-64 bg-slate-50/50 rounded border border-dashed border-slate-200 flex flex-col items-center justify-between py-2 text-slate-400 font-mono text-xs">
            <span>顶部</span>
            <div class="w-px h-10 bg-slate-200"></div>
            <span>底部</span>
        </div>
    </div>
</div>`
                )}

                ${this.renderShowcase(
                    '全端主题化纵向滚动 (Themed Y-Scroll)',
                    '不仅支持 Webkit，现已升级支持 <code>Firefox</code> 原生的 <code>scrollbar-color</code> 规范，双引擎完美融合主题色。',
                    `<div class="h-48 overflow-y-auto ${themedScrollbar} p-4 rounded-xl border border-slate-200 bg-slate-50">
    <div class="h-[200%] bg-gradient-to-b from-primary/5 via-primary/20 to-primary rounded-lg flex flex-col items-center justify-between py-6 border border-primary/20 text-primary font-medium">
        <span>向下滚动</span>
        <div class="flex flex-col items-center animate-bounce">
            <div class="w-1 h-3 bg-primary rounded-full mb-1"></div>
            <div class="w-1.5 h-1.5 bg-primary rounded-full mb-1"></div>
            <div class="w-0.5 h-0.5 bg-primary rounded-full"></div>
        </div>
        <span class="text-white font-bold tracking-widest">BOTTOM</span>
    </div>
</div>`
                )}

            </div>

            <!-- 全局复制成功提示 Toast -->
            <div id="scroll-toast-msg" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-[99] pointer-events-none">
                <i class="ph-fill ph-check-circle text-emerald-400 text-xl"></i>
                <span>代码已复制到剪贴板！</span>
            </div>
            <div class="mt-8">
                <pre id="scroll-code"><code class="language-html">
&lt;div class="overflow-x-auto snap-x snap-mandatory"&gt;滚动内容&lt;/div&gt;
                </code></pre>
            </div>

        </div>
        `;
    }

    // 🚀 Jquan UI 架构：包含标题、描述、代码预览区和右侧优雅的复制按钮
    static renderShowcase(title, desc, code) {
        const encodedCode = encodeURIComponent(code);
        return `
        <div class="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group h-full">
            <!-- 头部控制栏 -->
            <div class="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div class="pr-4">
                    <h3 class="text-base font-bold text-slate-800 tracking-tight">${title}</h3>
                    <p class="text-[13px] text-slate-500 mt-1.5 leading-relaxed">${desc}</p>
                </div>
                <!-- 优雅的复制按钮 -->
                <button class="code-copy-trigger shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold shadow-sm" data-code="${encodedCode}">
                    <i class="ph ph-code"></i>
                    <span>复制</span>
                </button>
            </div>
            <!-- 预览区 -->
            <div class="p-6 relative bg-slate-50/30 bg-[radial-gradient(rgb(0_0_0_/_0.04)_1px,transparent_1px)] bg-[length:16px_16px] grow">
                ${code}
            </div>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ selector: '#scroll-code code', showLineNumbers: false, langLabel: false });
        // =========================================================
        // 复制逻辑挂载 (带有局部反馈 + 全局 Toast)
        // =========================================================
        const copyTriggers = container.querySelectorAll('.code-copy-trigger');
        const toastMsg = container.querySelector('#scroll-toast-msg');
        let toastTimeout;

        copyTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                const codeToCopy = decodeURIComponent(btn.dataset.code);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    // 1. 按钮局部状态反馈 (变为主题绿)
                    btn.classList.remove('bg-white', 'border-slate-200', 'text-slate-600', 'hover:border-primary/40', 'hover:bg-primary/5');
                    btn.classList.add('bg-emerald-50', 'border-emerald-300', 'text-emerald-600');
                    icon.className = 'ph-fill ph-check-circle text-sm';
                    text.innerText = '已复制';

                    // 2. 唤起全局 Toast
                    toastMsg.classList.remove('translate-y-20', 'opacity-0');
                    toastMsg.classList.add('translate-y-0', 'opacity-100');
                    
                    if (toastTimeout) clearTimeout(toastTimeout);
                    
                    toastTimeout = setTimeout(() => {
                        // 还原全局 Toast
                        toastMsg.classList.remove('translate-y-0', 'opacity-100');
                        toastMsg.classList.add('translate-y-20', 'opacity-0');
                        
                        // 还原局部按钮状态
                        btn.classList.remove('bg-emerald-50', 'border-emerald-300', 'text-emerald-600');
                        btn.classList.add('bg-white', 'border-slate-200', 'text-slate-600', 'hover:border-primary/40', 'hover:bg-primary/5');
                        icon.className = 'ph ph-code';
                        text.innerText = '复制';
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                });
            });
        });
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: 'snap-x / snap-y', desc: '实现画廊级或短视频级的横纵向滚动吸附' },
            { class: 'scroll-smooth', desc: '平滑滚动行为，常用于锚点平滑跳转' },
            { class: 'scroll-mt-*', desc: '设置滚动锚点顶边距，防止被固定导航栏遮挡' },
            { class: 'overscroll-contain', desc: '阻断滚动链，防止内层元素触底时带动外层网页滚动' },
            { class: 'scrollbar-none', desc: '完全隐藏滚动条但保留滚动能力' },
            { class: 'scrollbar-thin scrollbar-color-[...] scrollbar-thumb:bg-primary/30', desc: '使用原子类组合主题化滚动条，兼容 Firefox 与 WebKit' },
            { class: 'scrollbar-none', desc: '完全隐藏滚动条但保留滚动区域 (原生规范)' },
            { class: 'scrollbar-thin', desc: '将滚动条宽度设置为细长优雅形态 (原生规范)' },
            { class: 'scrollbar-auto', desc: '恢复浏览器默认的滚动条宽度' }
        ];

        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'scroll'
        }));
    }
}
