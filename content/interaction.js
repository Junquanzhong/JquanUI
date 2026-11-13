// 🚀 Jquan Optimized: 交互与行为控制台 (interaction.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class InteractionDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-mouse-pointer"></i>交互</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">行为控制 (Interactivity)</li>
            </ul>

            <div class="mb-6">
                <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-2">交互与行为引擎</h1>
                <p class="text-slate-600">这里不仅仅有光标样式的切换，更包含了决定元素是否响应鼠标点击 (Pointer Events)、是否允许文本选取 (User Select) 等提升应用级 UX 的核心属性。</p>
            </div>

            <!-- ========================================== -->
            <!-- 🖱️ 实验室 1：全景光标图鉴 (Cursor) -->
            <!-- ========================================== -->
            <div class="mb-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-cursor text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">全景光标图鉴 (Cursor)</cite>
                    </div>
                    <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                        点击卡片即可复制类名
                    </span>
                </div>
                
                <div class="p-6 md:p-8 bg-slate-50">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <!-- Jquan 精心整理的常用光标全集 -->
                        ${this.renderCursorBox('cursor-auto', '自动')}
                        ${this.renderCursorBox('cursor-default', '默认')}
                        ${this.renderCursorBox('cursor-pointer', '手型 / 链接')}
                        ${this.renderCursorBox('cursor-wait', '等待加载')}
                        ${this.renderCursorBox('cursor-text', '文本输入')}
                        ${this.renderCursorBox('cursor-move', '移动')}
                        ${this.renderCursorBox('cursor-help', '帮助')}
                        ${this.renderCursorBox('cursor-not-allowed', '禁止')}
                        ${this.renderCursorBox('cursor-crosshair', '十字准星')}
                        ${this.renderCursorBox('cursor-zoom-in', '放大')}
                        ${this.renderCursorBox('cursor-grab', '抓取')}
                        ${this.renderCursorBox('cursor-grabbing', '抓紧')}
                        ${this.renderCursorBox('cursor-col-resize', '列宽调整')}
                        ${this.renderCursorBox('cursor-row-resize', '行高调整')}
                        ${this.renderCursorBox('cursor-none', '隐藏光标')}
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- 🛡️ 实验室 2：防误触机制 (Select & Pointer Events) -->
            <!-- ========================================== -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
                
                <!-- 文本选取 User Select -->
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center gap-2">
                        <i class="ph ph-text-t text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">文本选取 (User Select)</cite>
                    </div>
                    <div class="p-6 md:p-8 space-y-6 flex-1 bg-slate-50">
                        <p class="text-sm text-slate-500">控制用户是否可以选择元素的文本。这是区分“网页”与“App应用”质感的关键细节。</p>
                        
                        <div class="space-y-4">
                            <div class="select-none bg-white border border-primary/20 p-4 rounded-lg shadow-sm">
                                <span class="block text-xs font-bold text-primary mb-1">select-none (极度常用)</span>
                                <p class="text-slate-700">尝试双击或拖拽选中我？你做不到。这通常用于按钮、卡片、拖拽组件，防止用户操作时出现难看的蓝色高亮块。</p>
                            </div>
                            
                            <div class="select-all bg-white border border-primary/20 p-4 rounded-lg shadow-sm">
                                <span class="block text-xs font-bold text-primary mb-1">select-all</span>
                                <p class="text-slate-700">点击我任意位置一次。你会发现整段文本被一次性全部选中了！非常适合用于复制 Token 或序列号的区域。</p>
                            </div>

                            <div class="select-text bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                                <span class="block text-xs font-bold text-slate-500 mb-1">select-text</span>
                                <p class="text-slate-700">正常的文本行为，允许用户使用光标自由滑动选取任意部分内容。</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 点击穿透 Pointer Events -->
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div class="bg-primary/5 border-b border-primary/20 px-6 py-4 flex items-center gap-2">
                        <i class="ph ph-intersect text-xl text-primary"></i>
                        <cite class="font-bold text-primary not-italic">点击穿透 (Pointer Events)</cite>
                    </div>
                    <div class="p-6 md:p-8 space-y-6 flex-1 bg-slate-50">
                        <p class="text-sm text-primary">控制元素是否响应鼠标事件（悬停、点击）。如果设为 none，鼠标事件会“穿透”它并触发下层的元素。</p>
                        
                        <div class="relative h-48 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white overflow-hidden">
                            <!-- 底层目标按钮 -->
                            <button id="pointer-target" type="button" class="px-6 py-3 bg-primary text-white rounded-lg font-bold shadow-md transition-transform active:scale-95 z-10">
                                点我试试！
                            </button>

                            <!-- 上层干扰层 (包含一个 Select 控制其是否穿透) -->
                            <div id="pointer-overlay" class="pointer-events-none absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-20 flex items-end justify-center pb-4 transition-colors">
                                <span class="text-white text-sm font-bold bg-slate-900/60 px-3 py-1 rounded select-none">我是上层遮罩</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-center mt-4">
                            <label for="pointer-select" class="text-sm font-bold text-primary">上层遮罩状态:</label>
                            <select id="pointer-select" class="bg-white border border-primary text-primary text-sm rounded-lg px-3 py-1.5 outline-none focus-visible:ring-1 focus-visible:ring-primary">
                                <option value="pointer-events-none">pointer-events-none (允许穿透)</option>
                                <option value="pointer-events-auto">pointer-events-auto (阻挡点击)</option>
                            </select>
                        </div>
                        <p id="pointer-status" class="text-[11px] text-slate-500" aria-live="polite">提示：切换阻挡后，你将无法点击到底部的按钮。</p>
                    </div>
                </div>

            </div>

            <!-- ========================================== -->
            <!-- 🎛️ 实验室 3：尺寸调整控制 (Resize) -->
            <!-- ========================================== -->
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-10">
                <div class="bg-primary/5 border-b border-primary px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-arrows-out text-xl text-primary"></i>
                    <cite class="font-bold text-primary not-italic">尺寸调整控制 (Resize)</cite>
                </div>
                <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                    
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-primary mb-2">resize-none (固定死)</label>
                        <textarea class="resize-none w-full h-24 p-3 rounded-lg border border-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="你无法调整我的大小..."></textarea>
                    </div>

                    <div class="flex-1">
                        <label class="block text-xs font-bold text-primary mb-2">resize-y (仅限垂直, 推荐)</label>
                        <textarea class="resize-y w-full h-24 p-3 rounded-lg border border-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-primary/10" placeholder="拉动我的右下角，只能上下变高..."></textarea>
                    </div>

                    <div class="flex-1">
                        <label class="block text-xs font-bold text-primary mb-2">resize (全向放飞)</label>
                        <textarea class="resize w-full h-24 p-3 rounded-lg border border-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="我可以被任意缩放..."></textarea>
                    </div>

                </div>
            </div>
            <div class="mb-10">
                <pre id="interaction-code"><code class="language-html">
&lt;div class="pointer-events-none select-none"&gt;交互状态由原子类控制&lt;/div&gt;
                </code></pre>
            </div>

        </div>
        `;
    }

    // 辅助生成光标卡片的渲染函数
    static renderCursorBox(className, label) {
        return `
        <div class="copy-box flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all ${className} relative overflow-hidden group" data-copy="${className}">
            <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            <span class="text-slate-800 font-mono text-sm font-bold pointer-events-none">${className}</span>
            <span class="text-slate-400 text-xs mt-1 pointer-events-none">${label}</span>
            <div class="status-msg absolute inset-0 bg-indigo-500 text-white flex flex-col items-center justify-center transform translate-y-full transition-transform duration-200 font-bold text-sm pointer-events-none">
                <i class="ph ph-check-circle text-2xl mb-1"></i> 已复制
            </div>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ selector: '#interaction-code code', showLineNumbers: false, langLabel: false });
        // 1. 光标卡片“点击复制”的极其顺滑交互
        const copyBoxes = container.querySelectorAll('.copy-box');
        copyBoxes.forEach(box => {
            box.addEventListener('click', (e) => {
                const text = box.dataset.copy;
                
                // 写入剪贴板
                navigator.clipboard.writeText(text).then(() => {
                    const statusMsg = box.querySelector('.status-msg');
                    // 弹出成功状态层
                    statusMsg.classList.remove('translate-y-full');
                    statusMsg.classList.add('translate-y-0');
                    
                    // 1秒后收回
                    setTimeout(() => {
                        statusMsg.classList.remove('translate-y-0');
                        statusMsg.classList.add('translate-y-full');
                    }, 1000);
                }).catch(err => {
                    console.error('复制失败', err);
                });
            });
        });

        // 2. 点击穿透 (Pointer Events) 演示控制逻辑
        const pointerOverlay = container.querySelector('#pointer-overlay');
        const pointerSelect = container.querySelector('#pointer-select');
        const pointerTarget = container.querySelector('#pointer-target');
        const pointerStatus = container.querySelector('#pointer-status');

        pointerTarget?.addEventListener('click', () => {
            if (!pointerStatus) return;
            pointerStatus.textContent = '已点击到底层按钮：pointer-events-none 允许事件穿透遮罩。';
            pointerStatus.classList.remove('text-slate-500', 'text-warning');
            pointerStatus.classList.add('text-emerald-600');
        });
        
        pointerSelect?.addEventListener('change', (e) => {
            const val = e.target.value;
            // 移除旧的类
            pointerOverlay?.classList.remove('pointer-events-none', 'pointer-events-auto');
            // 增加新的类
            pointerOverlay?.classList.add(val);

            if (pointerStatus) {
                pointerStatus.textContent = val === 'pointer-events-auto'
                    ? '当前状态：遮罩会拦截指针事件，底层按钮不可点击。'
                    : '当前状态：遮罩允许事件穿透，底层按钮可以点击。';
                pointerStatus.classList.remove('text-emerald-600', 'text-warning');
                pointerStatus.classList.add('text-slate-500');
            }
            
            // 改变遮罩颜色以提供视觉反馈
            if (val === 'pointer-events-auto') {
                pointerOverlay?.classList.replace('bg-slate-900/40', 'bg-rose-900/60');
                pointerOverlay?.querySelector('span')?.replaceChildren('我是不可穿透的铁壁');
                pointerOverlay?.querySelector('span')?.classList.replace('bg-slate-900/60', 'bg-rose-900');
            } else {
                pointerOverlay?.classList.replace('bg-rose-900/60', 'bg-slate-900/40');
                pointerOverlay?.querySelector('span')?.replaceChildren('我是虚无的上层遮罩');
                pointerOverlay?.querySelector('span')?.classList.replace('bg-rose-900', 'bg-slate-900/60');
            }
        });
    }

    static async onSearch(keyword) {
        return [
            { title: '光标 (Cursor)', desc: '切换鼠标指针的图标表现样式', actionValue: 'interaction' },
            { title: '文本选取 (User Select)', desc: '控制文本是否允许高亮选中', actionValue: 'interaction' },
            { title: '点击穿透 (Pointer Events)', desc: '控制元素是否拦截鼠标事件', actionValue: 'interaction' }
        ];
    }
}
