// 🚀 Jquan Minimalist Edition: Layout Z-Index 层级系统 (layout-zindex.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class LayoutZIndexDoc {
    static render() {
        // ==========================================
        // 🛠️ 架构级拆分 1：基础局部数值层级
        // ==========================================
        const basicZIndex = [
            { class: 'z-above', css: 'z-index: -50;', desc: '负向层级，通常用于将装饰性背景元素置于最底层。' },
            { class: 'z-0', css: 'z-index: 0;', desc: '重置层级，产生新的局部层叠上下文。' },
            { class: 'z-1', css: 'z-index: 1;', desc: '微调层级。' },
            { class: 'z-2', css: 'z-index: 2;', desc: '微调层级。' },
            { class: 'z-5', css: 'z-index: 5;', desc: '低层级。' },
            { class: 'z-10', css: 'z-index: 10;', desc: '常规层级 1。' },
            { class: 'z-20', css: 'z-index: 20;', desc: '常规层级 2。' },
            { class: 'z-30', css: 'z-index: 30;', desc: '常规层级 3。' },
            { class: 'z-40', css: 'z-index: 40;', desc: '常规层级 4。' },
            { class: 'z-50', css: 'z-index: 50;', desc: '局部最高层级，通常用于卡片内的浮动元素。' },
            { class: 'z-auto', css: 'z-index: auto;', desc: '默认行为，不创建新的层叠上下文。' }
        ];

        // ==========================================
        // 🛠️ 架构级拆分 2：全局语义层级 (UI 组件系统专用)
        // ==========================================
        const semanticZIndex = [
            { class: 'z-base', css: 'z-index: 1100;', desc: '基础系统层，通常是页面主框架的基准高度。' },
            { class: 'z-dropdown', css: 'z-index: 1200;', desc: '下拉菜单层，必须高于基础元素。' },
            { class: 'z-sticky', css: 'z-index: 1300;', desc: '粘性定位层，如吸顶导航栏。' },
            { class: 'z-fixed', css: 'z-index: 1400;', desc: '固定定位层，如悬浮操作按钮。' },
            { class: 'z-modal', css: 'z-index: 1500;', desc: '模态对话框层，必须位于常规内容之上。' },
            { class: 'z-overlay', css: 'z-index: 1600;', desc: '遮罩层，阻断用户与下方内容的交互。' },
            { class: 'z-popover', css: 'z-index: 1700;', desc: '气泡卡片层，可以在模态框之上显示更详细信息。' },
            { class: 'z-tooltip', css: 'z-index: 1800;', desc: '文字提示层，极少被遮挡。' },
            { class: 'z-messager', css: 'z-index: 1900;', desc: '全局消息通知层 (Toast/Message)，拥有最高优先级。' }
        ];

        // 统一渲染行函数（集成现代化隐式复制功能）
        const generateTableRows = (types) => types.map(item => `
            <tr class="group border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-6 w-1/4">
                    <div class="flex items-center gap-2">
                        <code class="inline-code">${item.class}</code>
                        <button class="copy-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all p-1 rounded" data-copy-text="${item.class}" title="复制类名">
                            <i class="ph ph-copy text-sm"></i>
                        </button>
                    </div>
                </td>
                <td class="py-3 px-6 w-1/4"><code class="inline-code">${item.css}</code></td>
                <td class="py-3 px-6 text-sm text-slate-600 leading-relaxed w-1/2">${item.desc}</td>
            </tr>
        `).join('');

        return `
        <div class="container pb-12">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>布局</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">层级 (Z-Index)</li>
            </ul>

            <!-- 模块 1：核心沙盒 (特殊卡片：完美应用主色/5背景与边框) -->
            <div class="mb-8 bg-primary/5 border border-primary/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <!-- 卡片 Header + 右侧控制器融合 -->
                <div class="bg-white/50 border-b border-primary/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-stack text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">层叠上下文沙盒 (Z-Axis Engine)</cite>
                    </div>
                    
                    <!-- 交互控制器：控制目标卡片的 Z-Index -->
                    <div class="flex items-center gap-2" id="zindex-controls">
                        <span class="text-[10px] text-primary/60 uppercase tracking-widest font-bold mr-2 hidden md:inline-block">Target Level</span>
                        <button data-z="z-0" class="z-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:border-primary/40 hover:text-primary transition-all shadow-sm">z-0</button>
                        <button data-z="z-20" class="z-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:border-primary/40 hover:text-primary transition-all shadow-sm">z-20</button>
                        <button data-z="z-40" class="z-btn px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-primary text-white bg-primary shadow-sm transition-all">z-40</button>
                    </div>
                </div>

                <!-- 卡片 Body：视口展示区 -->
                <div class="p-6 md:p-8 flex-1">
                    <div class="bg-slate-50/80 border border-slate-200/60 rounded-xl p-6 relative overflow-hidden h-64 flex items-center justify-center">
                        
                        <!-- 参照物：底层卡片 -->
                        <div class="absolute z-10 w-32 h-32 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center transform -translate-x-12 -translate-y-8">
                            <span class="text-xs text-slate-400 font-medium">Layer A</span>
                            <code class="text-slate-600 font-mono text-sm font-bold mt-1">z-10</code>
                        </div>

                        <!-- 参照物：中层卡片 -->
                        <div class="absolute z-30 w-32 h-32 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center transform translate-x-12 translate-y-8">
                            <span class="text-xs text-slate-400 font-medium">Layer B</span>
                            <code class="text-slate-600 font-mono text-sm font-bold mt-1">z-30</code>
                        </div>

                        <!-- 🚀 动态目标卡片 (Target) -->
                        <div id="demo-target-card" class="absolute z-40 w-36 h-36 bg-primary/20 backdrop-blur-sm border-2 border-primary rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 cursor-pointer">
                            <span class="text-xs text-primary/70 font-bold uppercase tracking-wider mb-1">Target</span>
                            <code class="text-primary font-mono text-lg font-black" id="target-z-display">z-40</code>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：基础数值层级 API 表格卡片 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-list-numbers text-slate-500 text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">基础数值层级 (Local Stack)</cite>
                </div>
                <!-- 0 padding 让表格完美贴合卡片边缘 -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white border-b border-slate-200">
                                <th class="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">类名 (Class)</th>
                                <th class="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">CSS 属性</th>
                                <th class="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateTableRows(basicZIndex)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 模块 3：全局语义层级 API 表格卡片 (内嵌架构科普) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-globe text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">全局语义层级 (Global System Stack)</cite>
                </div>
                
                <!-- 架构级科普：直接融入卡片内部 -->
                <div class="bg-indigo-50/40 border-b border-indigo-100/50 p-6 flex items-start gap-4">
                    <i class="ph ph-lightbulb-filament text-indigo-500 text-2xl mt-0.5"></i>
                    <div>
                        <h3 class="text-sm font-bold text-indigo-900 mb-1">为什么要分化出“全局语义系”？</h3>
                        <p class="text-xs text-indigo-700/80 leading-relaxed">
                            在大型项目中，如果你在组件内随意使用 <code class="bg-white/60 px-1 py-0.5 rounded border border-indigo-200 font-mono text-indigo-600">z-index: 99</code>，极易引发层叠穿透。使用 <code class="bg-white/60 px-1 py-0.5 rounded border border-indigo-200 font-mono text-indigo-600">z-modal</code> 等语义化类名，引擎底层会预留极大的数值区间（如 1100、1500），从工程级别确保 UI 交互体系（如下拉框、模态窗、通知等）坚不可摧。
                        </p>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white border-b border-slate-200">
                                <th class="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">类名 (Class)</th>
                                <th class="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">CSS 属性</th>
                                <th class="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">设计初衷</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateTableRows(semanticZIndex)}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：沙盒交互 & 隐式复制功能
    // ==========================================
    static mount(container) {
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        // 1. 沙盒交互逻辑
        const buttons = container.querySelectorAll('.z-btn');
        const targetCard = container.querySelector('#demo-target-card');
        const targetDisplay = container.querySelector('#target-z-display');

        if (buttons.length > 0 && targetCard) {
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetZ = e.target.dataset.z;

                    // 切换按钮状态
                    buttons.forEach(b => {
                        b.classList.remove('border-primary', 'text-white', 'bg-primary');
                        b.classList.add('border-slate-200', 'text-slate-600', 'bg-white');
                    });
                    e.target.classList.remove('border-slate-200', 'text-slate-600', 'bg-white');
                    e.target.classList.add('border-primary', 'text-white', 'bg-primary');

                    // 应用新的 z-index
                    const currentClasses = Array.from(targetCard.classList);
                    currentClasses.forEach(cls => {
                        if (cls.startsWith('z-')) {
                            targetCard.classList.remove(cls);
                        }
                    });
                    
                    targetCard.classList.add(targetZ);
                    targetDisplay.innerText = targetZ;
                });
            });
        }

        // 2. 剪贴板复制交互逻辑
        const copyBtns = container.querySelectorAll('.copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const currentBtn = e.currentTarget;
                const textToCopy = currentBtn.dataset.copyText;
                const icon = currentBtn.querySelector('i');

                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    icon.classList.remove('ph-copy');
                    icon.classList.add('ph-check', 'text-emerald-500');
                    currentBtn.classList.remove('text-slate-400');
                    
                    setTimeout(() => {
                        icon.classList.remove('ph-check', 'text-emerald-500');
                        icon.classList.add('ph-copy');
                        currentBtn.classList.add('text-slate-400');
                    }, 1500);

                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
        });
    }

    static async onSearch(keyword) {
        const zIndexClasses = [
            'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto', 'z-above',
            'z-base', 'z-dropdown', 'z-sticky', 'z-fixed', 'z-modal', 'z-overlay', 'z-popover', 'z-tooltip', 'z-messager'
        ];
        const matched = zIndexClasses.filter(cls => cls.includes(keyword.toLowerCase()));
        
        return matched.map(cls => ({
            title: cls,
            desc: `控制元素的 Z 轴层叠顺序`,
            actionValue: 'zindex'
        }));
    }
}