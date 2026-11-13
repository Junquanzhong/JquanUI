// 🚀 Jquan Designed: 现代阴影控制台 (shadow.js)
// 彻底告别内联 onclick。完美集成了基础阴影、交互态阴影与 JIT 彩色发光阴影！
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ShadowDoc {
    static render() {
        return `
        <div class="container pb-10">
            <p class="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">项目阴影在 Core 前配置 theme.extend.boxShadow，例如 { soft: '0 16px 40px rgba(86,103,214,0.12)' }，使用 shadow-soft 或 hover:shadow-soft；DEFAULT 对应 shadow，保持 ring 组合。固定颜色不会被阴影颜色类改写。非法项见 JquanUI.debug().configWarnings；完整规则与最小页面见“主题与暗黑模式”。</p>
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-squares-four"></i>效果</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">阴影 (Box Shadow)</li>
            </ul>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">层级与阴影</h1>
                <p class="text-slate-600 leading-relaxed max-w-3xl">
                    阴影是构建现代 UI 深度（Z轴）和文字层次的核心元素。JquanUI 提供了平滑的盒阴影阶梯与轻量文字阴影。
                    不仅如此，结合状态变体（如 <code>hover:</code>）和引擎的 <strong>任意值 JIT 解析</strong>，你可以轻松创造出赛博朋克般的发光组件。
                </p>
            </div>

            <!-- 1. 基础阴影物理阶梯 -->
            <div class="mb-10">
                <h2 class="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">基础物理阶梯</h2>
                <!-- 为了让白色卡片的阴影更明显，我们在外层铺一层柔和的灰色底 -->
                <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    ${this.renderShadowBox('shadow-sm', '轻微凸起')}
                    ${this.renderShadowBox('shadow', '标准悬浮')}
                    ${this.renderShadowBox('shadow-md', '中等深度')}
                    ${this.renderShadowBox('shadow-lg', '强烈景深')}
                    ${this.renderShadowBox('shadow-xl', '模态层级')}
                    ${this.renderShadowBox('shadow-2xl', '顶级悬浮')}
                    ${this.renderShadowBox('shadow-inner', '内凹陷')}
                    ${this.renderShadowBox('shadow-none', '抹除阴影')}
                </div>
            </div>

            <!-- 2. 现代微交互与彩色阴影展示 -->
            <div class="mb-10">
                <h2 class="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">高级应用：微交互与彩色光辉</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    ${this.renderFeatureBox(
                        '平滑交互态卡片 (Hover Effect)',
                        '结合位移与阴影变化，这是现代 Dashboard 中最常用的卡片交互反馈。',
                        `<div class="w-full h-32 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center cursor-pointer group">
    <span class="font-bold text-slate-400 group-hover:text-primary transition-colors tracking-wide">把鼠标移上来试试</span>
</div>`
                    )}

                    ${this.renderFeatureBox(
                        '主题色辉光 (JIT Glowing Shadow)',
                        '利用 JquanUI 强悍的任意值 JIT 引擎，直接用 <code>primary</code> 颜色作为阴影渲染出主题光环！',
                        `<div class="w-full h-32 bg-primary rounded-2xl shadow-[0_10px_25px_rgb(var(--color-primary)/0.4)] flex flex-col items-center justify-center cursor-pointer hover:shadow-[0_15px_35px_rgb(var(--color-primary)/0.6)] transition-shadow duration-300">
    <span class="font-bold text-white text-lg tracking-wider">Jquan JIT Glow</span>
    <span class="text-white/70 text-xs mt-1 font-mono">shadow-[0_10px_25px_rgb(...)]</span>
</div>`
                    )}

                </div>
            </div>

            <!-- 3. 文字阴影 -->
            <div class="mb-10">
                <div class="flex flex-wrap items-end justify-between gap-3 mb-4 border-b border-slate-200 pb-2">
                    <div>
                        <h2 class="text-xl font-bold text-slate-800">文字阴影</h2>
                        <p class="mt-1 text-sm text-slate-500">优先使用语义档位；只有品牌标题或特殊视觉才使用任意值。</p>
                    </div>
                    <code class="text-xs text-slate-500">text-shadow-[...]</code>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    ${this.renderTextShadowBox('text-shadow-none', '无阴影')}
                    ${this.renderTextShadowBox('text-shadow-sm', '轻微')}
                    ${this.renderTextShadowBox('text-shadow-md', '中等')}
                    ${this.renderTextShadowBox('text-shadow-lg', '强调')}
                </div>
                <div class="mt-5 rounded-xl border border-slate-200 bg-slate-900 p-6 text-center">
                    <p class="text-2xl font-bold text-white text-shadow-[0_2px_4px_rgb(0_0_0_/_0.2)]">品牌标题任意文字阴影</p>
                    <code class="mt-3 block text-xs text-emerald-300 break-all">text-shadow-[0_2px_4px_rgb(0_0_0_/_0.2)]</code>
                </div>
            </div>

            <!-- 全局复制成功提示 Toast -->
            <div id="shadow-toast-msg" class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-50 pointer-events-none">
                <i class="ph-fill ph-check-circle text-emerald-400 text-xl"></i>
                <span>组件代码已复制到剪贴板！</span>
            </div>
            <div class="mt-8">
                <pre id="shadow-code"><code class="language-html">
&lt;div class="rounded-xl shadow-lg hover:shadow-xl transition-shadow"&gt;卡片&lt;/div&gt;
                </code></pre>
            </div>

        </div>
        `;
    }

    // 辅助器：渲染基础阴影方块
    static renderShadowBox(className, desc) {
        const code = `<div class="w-full h-24 bg-white rounded-xl ${className} flex items-center justify-center">
    <span class="font-mono text-slate-800 font-bold text-sm">${className}</span>
</div>`;
        const encodedCode = encodeURIComponent(code);
        return `
        <div class="flex flex-col group relative">
            <div class="p-6 relative z-10">
                ${code}
            </div>
            <!-- 控制面板：悬停时显示一键复制 -->
            <div class="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center z-20 border border-primary/20">
                <span class="text-xs text-slate-600 font-bold mb-2">${desc}</span>
                <button class="code-copy-trigger flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-bold shadow-md" data-code="${encodedCode}">
                    <i class="ph ph-copy"></i>
                    <span>复制代码</span>
                </button>
            </div>
        </div>`;
    }

    static renderTextShadowBox(className, desc) {
        return `
        <div class="min-h-36 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center">
            <strong class="text-2xl text-slate-800 ${className}">JquanUI</strong>
            <div>
                <code class="text-xs text-primary">${className}</code>
                <p class="mt-1 text-xs text-slate-500">${desc}</p>
            </div>
        </div>`;
    }

    // 辅助器：渲染高级特性区块
    static renderFeatureBox(title, desc, code) {
        const encodedCode = encodeURIComponent(code);
        return `
        <div class="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
            <div class="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div>
                    <h3 class="text-base font-bold text-slate-800 tracking-tight">${title}</h3>
                    <p class="text-xs text-slate-500 mt-1">${desc}</p>
                </div>
                <button class="code-copy-trigger shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold shadow-sm" data-code="${encodedCode}">
                    <i class="ph ph-code"></i>
                    <span>复制代码</span>
                </button>
            </div>
            <div class="p-8 relative bg-slate-50/30 bg-[radial-gradient(rgb(0_0_0_/_0.04)_1px,transparent_1px)] bg-[length:16px_16px] flex items-center justify-center">
                ${code}
            </div>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ selector: '#shadow-code code', showLineNumbers: false, langLabel: false });
        // =========================================================
        // 现代事件委托与批量绑定 (取代丑陋的内联 onclick)
        // =========================================================
        const copyTriggers = container.querySelectorAll('.code-copy-trigger');
        const toastMsg = container.querySelector('#shadow-toast-msg');
        let toastTimeout;

        copyTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                const codeToCopy = decodeURIComponent(btn.dataset.code);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                
                // 保存原始样式，以便还原
                const originalBg = btn.className.match(/bg-[a-zA-Z0-9/-]+/)[0];
                const originalText = btn.className.match(/text-[a-zA-Z0-9/-]+/)[0];
                
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    // 1. 按钮局部状态反馈
                    btn.classList.remove(originalBg, originalText, 'border-slate-200');
                    btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
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
                        btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                        btn.classList.add(originalBg, originalText, 'border-slate-200');
                        // 根据原来是主色调按钮还是白色按钮，还原对应的图标
                        icon.className = originalBg.includes('white') ? 'ph ph-code' : 'ph ph-copy';
                        text.innerText = '复制代码';
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                });
            });
        });
    }

    static async onSearch(keyword) {
        const items = [
            { title: '阴影 (Box Shadow)', desc: '层级阴影、悬浮微交互与彩色发光阴影', actionValue: 'shadow' },
            { title: 'text-shadow-sm / md / lg', desc: '语义文字阴影阶梯', actionValue: 'shadow' },
            { title: 'text-shadow-none', desc: '移除文字阴影', actionValue: 'shadow' },
            { title: 'text-shadow-[...]', desc: '任意值文字阴影', actionValue: 'shadow' }
        ];
        const normalized = keyword.toLowerCase();
        return items.filter(item =>
            item.title.toLowerCase().includes(normalized) ||
            item.desc.toLowerCase().includes(normalized)
        );
    }
}
