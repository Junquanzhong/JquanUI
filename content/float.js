// 🚀 Jquan Optimized: Layout Float 浮动组件文档 (float.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutFloatDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">浮动 (Float)</li>
            </ul>

            <!-- 标题区 -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">浮动与清除</h1>
                <p class="text-slate-600">在 Flex 和 Grid 普及的今天，<code class="inline-code">float</code> 主要用于实现经典的“图文环绕”排版。同时，JquanUI 提供了原生的 <code class="inline-code">clearfix</code> 工具类来拯救父容器高度塌陷。</p>
            </div>

            <!-- 🧪 实验室 1：图文环绕引擎 -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-text-align-left text-xl text-primary"></i>
                        <cite class="font-bold text-slate-800 not-italic">图文环绕实验室</cite>
                    </div>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- 控制面板 -->
                    <div class="lg:col-span-4 flex flex-col gap-4">
                        <p class="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">图片浮动方向</p>
                        
                        <div class="flex flex-col gap-2">
                            <button data-float="float-left" class="float-btn flex items-center justify-between px-4 py-3 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary/30 transition-all text-left is-active group">
                                <span class="font-mono font-bold text-primary text-sm transition-colors">float-left</span>
                                <i class="ph ph-arrow-left text-primary"></i>
                            </button>
                            <button data-float="float-right" class="float-btn flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">float-right</span>
                                <i class="ph ph-arrow-right text-slate-400 group-hover:text-primary"></i>
                            </button>
                            <button data-float="float-none" class="float-btn flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all text-left group">
                                <span class="font-mono font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">float-none</span>
                                <i class="ph ph-x-circle text-slate-400 group-hover:text-primary"></i>
                            </button>
                        </div>
                    </div>

                    <!-- 演示视窗 -->
                    <div class="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner p-6 flex flex-col">
                        <!-- 演示文章容器 -->
                        <div class="text-sm text-slate-600 leading-relaxed text-justify relative">
                            <!-- 浮动块 -->
                            <div id="demo-float-box" class="float-left w-24 h-24 mb-2 mx-3 bg-primary rounded-lg shadow-sm flex items-center justify-center text-white transition-all duration-500">
                                <i class="ph ph-image text-3xl opacity-80"></i>
                            </div>
                            JquanUI 是一个现代化的前端 UI 框架，旨在提供极致的开发体验。当你在处理需要大段文字描述并且插入说明配图的场景时，Flexbox 会显得有些生硬，因为 flex 容器会将元素按行或列死板地切分。而使用原生的 CSS float 属性，文字会像流水一样自然地环绕在浮动元素的周围，这正是传统排版的优雅之处。切换左侧按钮，你可以实时观察文本流是如何随着浮动块的位置变化而重新排列的。无需复杂的计算，浏览器原生引擎即可完成这种优美的避让效果。
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🧪 实验室 2：高度塌陷与 Clearfix -->
            <div class="mb-8 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-white/60 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-lifebuoy text-xl text-slate-600"></i>
                    <cite class="font-bold text-slate-800 not-italic">高度塌陷与 Clearfix 救援</cite>
                </div>
                
                <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <!-- 控制面板 -->
                    <div>
                        <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                            当父容器内部的所有子元素都设置了 <code class="inline-code">float</code> 时，它们会脱离文档流，导致父容器“以为”自己内部没有内容，从而发生<strong class="text-rose-500">高度塌陷</strong>（高度变为 0）。
                            为父容器添加 <code class="inline-code font-bold text-primary">clearfix</code> 即可完美清除内部浮动，找回失去的高度。
                        </p>
                        
                        <div class="flex items-center gap-4 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                            <span class="text-sm font-bold text-slate-700">拯救父级高度：</span>
                            <!-- 切换开关 -->
                            <button id="toggle-clearfix" class="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1 shadow-sm" id="clearfix-knob"></span>
                            </button>
                            <span class="text-xs font-mono font-bold text-slate-400" id="clearfix-status">塌陷中...</span>
                        </div>
                    </div>

                    <!-- 演示视窗 -->
                    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-inner h-48 block pt-16">
                        
                        <!-- 父容器 -->
                        <div id="demo-parent-box" class="w-full border-2 border-dashed border-rose-400 bg-rose-50/30 p-2 transition-all duration-300 relative">
                            <span class="absolute -top-6 left-0 text-[10px] font-bold uppercase tracking-wider text-rose-500" id="parent-label">高度塌陷的父级容器</span>
                            
                            <!-- 浮动子元素 -->
                            <div class="float-left w-16 h-16 bg-slate-700 rounded shadow-sm flex items-center justify-center text-white text-xs font-mono">子 1</div>
                            <div class="float-right w-16 h-16 bg-slate-400 rounded shadow-sm flex items-center justify-center text-white text-xs font-mono">子 2</div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 📚 字典映射区域 -->
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-2 items-center">
                    <i class="ph ph-book-bookmark text-slate-400 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">浮动属性字典 (Float Classes)</cite>  
                </div>
                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-3 font-medium tracking-wide">类名 (Class)</th>
                                <th class="px-6 py-3 font-medium tracking-wide">CSS 属性</th>
                                <th class="px-6 py-3 font-medium tracking-wide">应用场景描述</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-700">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">float-left</td>
                                <td class="px-6 py-4"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">float: left;</span></td>
                                <td class="px-6 py-4 text-slate-600">元素向左浮动，后续的行内/文本内容将围绕在其右侧排布。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-primary">float-right</td>
                                <td class="px-6 py-4"><span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">float: right;</span></td>
                                <td class="px-6 py-4 text-slate-600">元素向右浮动，后续的行内/文本内容将围绕在其左侧排布。</td>
                            </tr>
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-mono font-bold text-slate-500">float-none</td>
                                <td class="px-6 py-4"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">float: none;</span></td>
                                <td class="px-6 py-4 text-slate-600">重置/移除元素的浮动状态，恢复常规文档流（常用于响应式断点中取消浮动）。</td>
                            </tr>
                            <tr class="hover:bg-emerald-50 transition-colors bg-emerald-50/30 border-t-2 border-emerald-100">
                                <td class="px-6 py-4 font-mono font-bold text-emerald-600">clearfix</td>
                                <td class="px-6 py-4">
                                    <div class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-mono inline-block">
                                        &::after {<br>
                                        &nbsp;&nbsp;content: "";<br>
                                        &nbsp;&nbsp;display: block;<br>
                                        &nbsp;&nbsp;clear: both;<br>
                                        }
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-slate-600">挂载于<strong>父级容器</strong>上。通过伪元素强制闭合内部环境，防止因内部全为浮动子元素而导致的高度塌陷问题。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：绑定交互事件
    // ==========================================
    static mount(container) {
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        // --- 实验室 1：图文环绕 ---
        const floatBtns = container.querySelectorAll('.float-btn');
        const floatBox = container.querySelector('#demo-float-box');

        if (floatBox && floatBtns.length > 0) {
            floatBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    const floatVal = target.dataset.float;

                    // 重置按钮 UI
                    floatBtns.forEach(b => {
                        b.classList.remove('border-primary', 'bg-primary/5', 'ring-1', 'ring-primary/30', 'is-active');
                        b.classList.add('border-slate-200', 'bg-white');
                        const text = b.querySelector('span');
                        const icon = b.querySelector('i');
                        text.classList.remove('text-primary');
                        text.classList.add('text-slate-700');
                        icon.classList.remove('text-primary');
                        icon.classList.add('text-slate-400');
                    });

                    // 激活当前按钮 UI
                    target.classList.remove('border-slate-200', 'bg-white');
                    target.classList.add('border-primary', 'bg-primary/5', 'ring-1', 'ring-primary/30', 'is-active');
                    const activeText = target.querySelector('span');
                    const activeIcon = target.querySelector('i');
                    activeText.classList.remove('text-slate-700');
                    activeText.classList.add('text-primary');
                    activeIcon.classList.remove('text-slate-400');
                    activeIcon.classList.add('text-primary');

                    // 改变方块的类名
                    floatBox.classList.remove('float-left', 'float-right', 'float-none');
                    floatBox.classList.add(floatVal);
                    
                    // 为了演示美观，调整一下外边距
                    floatBox.classList.remove('ml-3', 'mr-3', 'mx-auto', 'mb-2');
                    if (floatVal === 'float-left') floatBox.classList.add('mr-3', 'mb-2');
                    else if (floatVal === 'float-right') floatBox.classList.add('ml-3', 'mb-2');
                    else floatBox.classList.add('mx-auto', 'mb-4');
                });
            });
        }

        // --- 实验室 2：Clearfix ---
        const toggleBtn = container.querySelector('#toggle-clearfix');
        const knob = container.querySelector('#clearfix-knob');
        const statusText = container.querySelector('#clearfix-status');
        const parentBox = container.querySelector('#demo-parent-box');
        const parentLabel = container.querySelector('#parent-label');

        let isClearfixOn = false;

        if (toggleBtn && parentBox) {
            toggleBtn.addEventListener('click', () => {
                isClearfixOn = !isClearfixOn;

                if (isClearfixOn) {
                    // 开启 Clearfix
                    toggleBtn.classList.remove('bg-slate-300');
                    toggleBtn.classList.add('bg-primary');
                    knob.classList.remove('translate-x-1');
                    knob.classList.add('translate-x-6');
                    
                    statusText.innerText = "clearfix 开启 (高度恢复)";
                    statusText.classList.remove('text-slate-400');
                    statusText.classList.add('text-emerald-500');

                    parentBox.classList.add('clearfix');
                    parentBox.classList.remove('border-rose-400', 'bg-rose-50/30');
                    parentBox.classList.add('border-emerald-400', 'bg-emerald-50/30');

                    parentLabel.innerText = "健康包裹的父级容器";
                    parentLabel.classList.remove('text-rose-500');
                    parentLabel.classList.add('text-emerald-600');
                } else {
                    // 关闭 Clearfix (恢复高度塌陷)
                    toggleBtn.classList.remove('bg-primary');
                    toggleBtn.classList.add('bg-slate-300');
                    knob.classList.remove('translate-x-6');
                    knob.classList.add('translate-x-1');
                    
                    statusText.innerText = "塌陷中...";
                    statusText.classList.remove('text-emerald-500');
                    statusText.classList.add('text-slate-400');

                    parentBox.classList.remove('clearfix');
                    parentBox.classList.remove('border-emerald-400', 'bg-emerald-50/30');
                    parentBox.classList.add('border-rose-400', 'bg-rose-50/30');

                    parentLabel.innerText = "高度塌陷的父级容器";
                    parentLabel.classList.remove('text-emerald-600');
                    parentLabel.classList.add('text-rose-500');
                }
            });
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'float-left', desc: '元素向左浮动，文本右侧环绕' },
            { class: 'float-right', desc: '元素向右浮动，文本左侧环绕' },
            { class: 'float-none', desc: '重置/清除浮动状态，恢复正常文档流' },
            { class: 'clearfix', desc: '【神技】给父级容器添加，完美解决因内部子元素全部浮动导致的高度塌陷问题' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'float' 
        }));
    }
}