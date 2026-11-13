// 🚀 Jquan Optimized: 书写模式与方向组件文档 (writing.js) v2.2
// 修复：恢复官方代码块 UI 风格，使用状态追踪树遍历算法解决交互更新 Bug
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class WritingDoc {
    static render() {
        const toggleBase = 'btn-toggle w-full inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 text-left';
        const toggleActive = 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20';
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-text-t"></i>排版与文本</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">书写模式 (Writing Mode)</li>
            </ul>

            <!-- 模块 1：排版方向组合仪 (The Combinator Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-compass text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">排版方向组合仪 (Flow Combinator)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Interactive Sandbox</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6">
                        打破传统的横向与 LTR（从左到右）结界。通过切换书写模式和文本方向，你可以轻松实现<strong>古文竖排、日系排版</strong>，或者一键适配阿拉伯语等<strong>中东国际化</strong>业务。<br/>
                        <strong>点击下方选项，实时预览文档流的变化：</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制面板 -->
                        <div class="lg:col-span-5 flex flex-col space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            
                            <!-- 书写模式 (Writing Mode) -->
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">书写模式 (Writing Mode)</label>
                                <div class="flex flex-col gap-2" id="ctrl-writing">
                                    <button class="${toggleBase} active ${toggleActive}" data-val="writing-horizontal">
                                        <span>默认横排 (Horizontal)</span>
                                        <i class="ph ph-arrow-right"></i>
                                    </button>
                                    <button class="${toggleBase}" data-val="writing-vertical-rl">
                                        <span>经典竖排 (Vertical-RL)</span>
                                        <i class="ph ph-arrow-down flex-row-reverse"></i>
                                    </button>
                                    <button class="${toggleBase}" data-val="writing-vertical-lr">
                                        <span>正向竖排 (Vertical-LR)</span>
                                        <i class="ph ph-arrow-down"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- 文本方向 (Direction) -->
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">文档流方向 (Direction)</label>
                                <div class="flex flex-col gap-2" id="ctrl-direction">
                                    <button class="${toggleBase} active ${toggleActive}" data-val="direction-ltr">
                                        <span>从左到右 (LTR)</span>
                                        <i class="ph ph-text-align-left"></i>
                                    </button>
                                    <button class="${toggleBase}" data-val="direction-rtl">
                                        <span>从右到左 (RTL)</span>
                                        <i class="ph ph-text-align-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 右侧：效果预览与代码生成 -->
                        <div class="lg:col-span-7 flex flex-col space-y-4">
                            <!-- 视觉舞台 -->
                            <div class="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 p-6 min-h-[300px]">
                                
                                <!-- 被控制的预览实体 -->
                                <div id="preview-box" class="writing-horizontal direction-ltr bg-white p-6 rounded-2xl shadow-md border border-slate-200 transition-all duration-500 max-h-full overflow-hidden">
                                    <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                                        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                                            <i class="ph-fill ph-globe-hemisphere-east"></i>
                                        </div>
                                        <h4 class="text-lg font-bold text-slate-800 m-0 leading-none">JquanUI 排版引擎</h4>
                                    </div>
                                    <p class="text-slate-600 leading-relaxed font-serif tracking-wide">
                                        山川异域，风月同天。<br>
                                        The layout flows smoothly globally.
                                    </p>
                                </div>

                            </div>
                            
                            <!-- 官方组件代码输出区 -->
                            <div>
                                <pre id="code-container"><code class="language-html">
&lt;div class="DYNAMIC_CLASSES_HERE bg-white p-6 rounded-2xl shadow-md"&gt;
    &lt;!-- Content Here --&gt;
&lt;/div&gt;
                                </code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：全景原子参考 (Atomic Reference Gallery) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-books text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">原子类名图鉴 (Reference Gallery)</cite>
                </div>
                <div class="p-6 md:p-8">
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <!-- 分类 1: 书写模式 -->
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">书写模式 (Writing Mode)</h3>
                            <div class="space-y-3">
                                ${this.renderRowCard(
                                    'writing-horizontal', 
                                    '默认水平排版', 
                                    `<div class="writing-horizontal text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded">水平排版</div>`
                                )}
                                ${this.renderRowCard(
                                    'writing-vertical-rl', 
                                    '经典竖排 (从右向左推进)', 
                                    `<div class="writing-vertical-rl h-16 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-1 py-2 rounded font-serif">经典竖排</div>`
                                )}
                                ${this.renderRowCard(
                                    'writing-vertical-lr', 
                                    '正向竖排 (从左向右推进)', 
                                    `<div class="writing-vertical-lr h-16 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-1 py-2 rounded">正向竖排</div>`
                                )}
                            </div>
                        </div>

                        <!-- 分类 2: 文档流方向 -->
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">文档方向 (Direction)</h3>
                            <div class="space-y-3">
                                ${this.renderRowCard(
                                    'direction-ltr', 
                                    'Left-To-Right (默认)', 
                                    `<div class="direction-ltr flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded w-32">
                                        <div class="w-3 h-3 bg-slate-300 rounded-full"></div>
                                        <div class="h-2 flex-1 bg-slate-200 rounded"></div>
                                    </div>`
                                )}
                                ${this.renderRowCard(
                                    'direction-rtl', 
                                    'Right-To-Left (国际化)', 
                                    `<div class="direction-rtl flex items-center gap-2 bg-white border border-emerald-200 px-3 py-2 rounded w-32">
                                        <div class="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                        <div class="h-2 flex-1 bg-emerald-100 rounded"></div>
                                    </div>`
                                )}
                            </div>
                        </div>
                    </div>

                    <!-- 实战提示 -->
                    <div class="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4 items-start">
                        <i class="ph-fill ph-lightbulb text-primary text-xl shrink-0 mt-0.5"></i>
                        <div>
                            <h4 class="font-bold text-slate-800 mb-1">方向属性对 Flexbox 的物理影响</h4>
                            <p class="text-sm text-slate-600 leading-relaxed">
                                当你给一个 Flex 容器加上 <code>direction-rtl</code> 时，你不需要手动去修改 <code>flex-row-reverse</code>！整个 Flex 主轴的起点会自动从左侧切换到右侧，<code>gap</code> 间距也会完美翻转。
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 模块 3：最佳实践代码 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">实战代码：国际化多语言组件</cite>
                </div>
                <div class="p-6">
                    <p class="text-slate-500 text-sm mb-4">
                        在构建真正的多语言系统时，通常会在最外层的容器或 <code>&lt;html&gt;</code> 标签上切换 <code>direction-*</code> 类名，内部所有遵循现代布局（Flex/Grid）的子元素将自动完成物理位置的翻转适配。
                    </p>
                    <pre><code class="language-html">
&lt;!-- LTR 英文用户界面 --&gt;
&lt;div class="direction-ltr bg-white p-4 rounded-lg flex items-center gap-4"&gt;
    &lt;img src="avatar.jpg" class="w-10 h-10 rounded-full" alt="Avatar"&gt;
    &lt;div class="flex-1"&gt;
        &lt;h3 class="font-bold"&gt;Welcome back, Jquan&lt;/h3&gt;
        &lt;p class="text-sm text-gray-500"&gt;You have 3 new messages.&lt;/p&gt;
    &lt;/div&gt;
    &lt;button class="bg-blue-500 text-white px-4 py-2 rounded"&gt;View&lt;/button&gt;
&lt;/div&gt;

&lt;!-- RTL 阿拉伯语用户界面 (自动翻转：头像到右侧，按钮到左侧) --&gt;
&lt;div class="direction-rtl bg-white p-4 rounded-lg flex items-center gap-4 mt-4"&gt;
    &lt;img src="avatar.jpg" class="w-10 h-10 rounded-full" alt="Avatar"&gt;
    &lt;div class="flex-1"&gt;
        &lt;h3 class="font-bold"&gt;مرحبا بعودتك ، جوان&lt;/h3&gt;
        &lt;p class="text-sm text-gray-500"&gt;لديك 3 رسائل جديدة.&lt;/p&gt;
    &lt;/div&gt;
    &lt;button class="bg-blue-500 text-white px-4 py-2 rounded"&gt;يعرض&lt;/button&gt;
&lt;/div&gt;
                    </code></pre>
                </div>
            </div>

        </div>

        `;
    }

    // 辅助渲染方法：列表行
    static renderRowCard(cls, desc, previewHtml) {
        return `
            <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/40 hover:shadow-sm transition-all group cursor-default">
                <div class="flex flex-col gap-1">
                    <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 w-fit">${cls}</code>
                    <span class="text-[13px] text-slate-500 pl-1">${desc}</span>
                </div>
                <div class="shrink-0 flex items-center justify-center">
                    ${previewHtml}
                </div>
            </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：组件绑定与沙盒引擎
    // ==========================================
    static mount(container) {
        // 1. 初始化官方代码高亮插件 (全局生效，包含沙盒区与最佳实践区)
        initCodeHighlighter({ showLineNumbers: true, lineNumbers: true });

        // 2. 沙盒逻辑状态管理
        const state = {
            writing: 'writing-horizontal',
            direction: 'direction-ltr'
        };

        const previewBox = container.querySelector('#preview-box');
        const codeContainer = container.querySelector('#code-container');
        
        // 核心内存变量：记录当前高亮区块内的动态类名，用于精确替换
        let currentDynamicClass = 'DYNAMIC_CLASSES_HERE';

        // 核心更新机制
        const updatePlayground = () => {
            const activeClasses = [state.writing, state.direction];
            const classString = activeClasses.filter(Boolean).join(' ');

            // A. 更新视觉预览节点
            previewBox.className = `${classString} bg-white p-6 rounded-2xl shadow-md border border-slate-200 transition-all duration-500 max-h-full overflow-hidden`;

            // B. 外科手术级 DOM 替换：保留高亮插件的 UI，仅替换目标字符串
            if (codeContainer) {
                const walker = document.createTreeWalker(
                    codeContainer,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while ((node = walker.nextNode())) {
                    // 仅当文本节点中包含我们上一次记录的类名组时，进行替换
                    if (node.nodeValue.includes(currentDynamicClass)) {
                        node.nodeValue = node.nodeValue.replace(currentDynamicClass, classString);
                    }
                }
                // 更新内存中的追踪状态
                currentDynamicClass = classString;
            }
        };

        // 首次渲染执行注入，给高亮插件一点执行时间
        setTimeout(updatePlayground, 100);

        // 3. 事件绑定抽象
        const bindButtonGroup = (groupId, stateKey) => {
            const wrapper = container.querySelector(groupId);
            if (!wrapper) return;
            const buttons = wrapper.querySelectorAll('.btn-toggle');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.target.closest('.btn-toggle');
                    if (!targetBtn) return;
                    
                    buttons.forEach(b => {
                        b.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                        b.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-600');
                    });
                    targetBtn.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-600');
                    targetBtn.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                    state[stateKey] = targetBtn.dataset.val;
                    updatePlayground();
                });
            });
        };

        bindButtonGroup('#ctrl-writing', 'writing');
        bindButtonGroup('#ctrl-direction', 'direction');
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'writing-horizontal', desc: '默认排版，水平从左到右书写' },
            { class: 'writing-vertical-rl', desc: '垂直排版，文本流从右向左推进 (适用于古文、日文)' },
            { class: 'writing-vertical-lr', desc: '垂直排版，文本流从左向右推进 (适用于侧边栏标签)' },
            { class: 'direction-ltr', desc: '强制文档流方向为从左到右 (Left-to-Right)' },
            { class: 'direction-rtl', desc: '强制文档流方向为从右到左 (Right-to-Left, 适配阿拉伯语等)' }
        ];

        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'writing'
        }));
    }
}
