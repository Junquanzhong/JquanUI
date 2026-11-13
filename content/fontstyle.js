// 🚀 Jquan Optimized: FontStyle 组件文档 (fontstyle.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class FontStyleDoc {
    static render() {
        const toggleBase = 'btn-toggle inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800';
        const toggleActive = 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20';
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-house"></i>排版</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">文字装饰 (Text Decoration)</li>
            </ul>

            <!-- 模块 1：排版装饰组合仪 (The Combinator Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="card-decoration deco-morninglight opacity-30"></div>
                
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">排版装饰组合仪 (Style Combinator)</cite>
                    </div>
                    <span class="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">Interactive Sandbox</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6">
                        文本装饰的真正威力在于**组合**。通过搭配位置、样式、粗细与偏移量，你可以创造出极具设计感的视觉焦点。<br/>
                        <strong>点击下方选项，实时预览并获取生成的类名：</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：控制面板 -->
                        <div class="lg:col-span-6 flex flex-col space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-8 lg:pb-0 lg:pr-8">
                            
                            <!-- 线条位置 -->
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">位置 (Position)</label>
                                <div class="flex flex-wrap gap-2" id="ctrl-line">
                                    <button class="${toggleBase} active ${toggleActive}" data-val="underline">Underline</button>
                                    <button class="${toggleBase}" data-val="overline">Overline</button>
                                    <button class="${toggleBase}" data-val="line-through">Strike</button>
                                    <button class="${toggleBase}" data-val="no-underline">None</button>
                                </div>
                            </div>

                            <!-- 线条样式 -->
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">样式 (Style)</label>
                                <div class="flex flex-wrap gap-2" id="ctrl-style">
                                    <button class="${toggleBase}" data-val="decoration-solid">Solid</button>
                                    <button class="${toggleBase}" data-val="decoration-dashed">Dashed</button>
                                    <button class="${toggleBase}" data-val="decoration-dotted">Dotted</button>
                                    <button class="${toggleBase}" data-val="decoration-double">Double</button>
                                    <button class="${toggleBase} active ${toggleActive}" data-val="decoration-wavy">Wavy</button>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <!-- 粗细 -->
                                <div class="space-y-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">粗细 (Thickness)</label>
                                    <select class="w-full text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary" id="ctrl-thickness">
                                        <option value="decoration-auto">Auto</option>
                                        <option value="decoration-1">1px</option>
                                        <option value="decoration-2" selected>2px</option>
                                        <option value="decoration-4">4px</option>
                                        <option value="decoration-8">8px</option>
                                    </select>
                                </div>
                                <!-- 偏移 -->
                                <div class="space-y-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">偏移 (Offset)</label>
                                    <select class="w-full text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary" id="ctrl-offset">
                                        <option value="underline-offset-auto">Auto</option>
                                        <option value="underline-offset-0">0px</option>
                                        <option value="underline-offset-1">1px</option>
                                        <option value="underline-offset-2">2px</option>
                                        <option value="underline-offset-4" selected>4px</option>
                                        <option value="underline-offset-8">8px</option>
                                    </select>
                                </div>
                            </div>

                            <!-- 附加修饰 -->
                            <div class="space-y-2 pt-2 border-t border-slate-100">
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" id="ctrl-italic" checked class="rounded border-slate-300 text-primary focus:ring-primary">
                                    <span class="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">开启斜体 (Italic)</span>
                                </label>
                            </div>
                        </div>

                        <!-- 右侧：效果预览与代码生成 -->
                        <div class="lg:col-span-6 flex flex-col space-y-4">
                            <!-- 视觉舞台 -->
                            <div class="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 p-8 min-h-[200px]">
                                <p id="preview-text" class="text-3xl md:text-4xl text-slate-800 font-misans-vf font-bold transition-all duration-300 underline decoration-wavy decoration-2 underline-offset-4 italic">
                                    JquanUI Design
                                </p>
                            </div>
                            
                            <!-- 代码输出 -->
                            <div>
                                <pre id="code-container"><code class="language-html">
&lt;p class="DYNAMIC_CLASSES_HERE"&gt;
    JquanUI Design
&lt;/p&gt;
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
                    
                    <!-- 分类 1: 基础装饰与排版 -->
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">基础修饰 (Base Styles)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        ${this.renderGalleryCard('下划线', 'underline', '<span class="underline">Text Underline</span>')}
                        ${this.renderGalleryCard('上划线', 'overline', '<span class="overline">Text Overline</span>')}
                        ${this.renderGalleryCard('删除线', 'line-through', '<span class="line-through">Line Through</span>')}
                        ${this.renderGalleryCard('无装饰', 'no-underline', '<span class="no-underline">No Underline</span>')}
                        ${this.renderGalleryCard('斜体', 'italic', '<span class="italic font-serif">Italic Style</span>')}
                        ${this.renderGalleryCard('非斜体', 'italic-not', '<span class="italic-not">Normal Style</span>')}
                        ${this.renderGalleryCard('抗锯齿', 'antialiased', '<span class="antialiased">Antialiased</span>')}
                        ${this.renderGalleryCard('亚像素抗锯齿', 'subpixel-antialiased', '<span class="subpixel-antialiased">Subpixel Antialiased</span>')}
                    </div>

                    <!-- 分类 2: 装饰线样式 -->
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">线条样式 (Decoration Styles)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                        ${this.renderGalleryCard('实线', 'decoration-solid', '<span class="underline decoration-solid">Solid Line</span>')}
                        ${this.renderGalleryCard('双实线', 'decoration-double', '<span class="underline decoration-double">Double Line</span>')}
                        ${this.renderGalleryCard('点状线', 'decoration-dotted', '<span class="underline decoration-dotted">Dotted Line</span>')}
                        ${this.renderGalleryCard('虚线', 'decoration-dashed', '<span class="underline decoration-dashed">Dashed Line</span>')}
                        ${this.renderGalleryCard('波浪线', 'decoration-wavy', '<span class="underline decoration-wavy">Wavy Line</span>')}
                    </div>

                    <!-- 分类 3: 粗细与偏移量 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">粗细 (Thickness)</h3>
                            <div class="space-y-2">
                                ${this.renderRowCard('decoration-1', '1px', 'underline decoration-1')}
                                ${this.renderRowCard('decoration-2', '2px', 'underline decoration-2')}
                                ${this.renderRowCard('decoration-4', '4px', 'underline decoration-4')}
                                ${this.renderRowCard('decoration-8', '8px', 'underline decoration-8')}
                                ${this.renderRowCard('decoration-from-font', '由字体决定', 'underline decoration-from-font')}
                            </div>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">偏移量 (Offset)</h3>
                            <div class="space-y-2">
                                ${this.renderRowCard('underline-offset-0', '紧贴 0px', 'underline underline-offset-0')}
                                ${this.renderRowCard('underline-offset-1', '偏移 1px', 'underline underline-offset-1')}
                                ${this.renderRowCard('underline-offset-2', '偏移 2px', 'underline underline-offset-2')}
                                ${this.renderRowCard('underline-offset-4', '偏移 4px', 'underline underline-offset-4')}
                                ${this.renderRowCard('underline-offset-8', '偏移 8px', 'underline underline-offset-8')}
                            </div>
                        </div>
                    </div>

                    <!-- 分类 4: 垂直对齐 -->
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">排版对齐 (Vertical Align)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="border border-slate-100 bg-slate-50 rounded-lg p-5 flex items-center justify-between">
                            <div>
                                <div class="text-slate-800 font-bold mb-1">上标对齐</div>
                                <code class="text-xs text-primary font-mono">align-super</code>
                            </div>
                            <div class="text-2xl text-slate-800 bg-white px-4 py-2 rounded shadow-sm border border-slate-100">
                                X<span class="align-super text-sm text-primary">2</span>
                            </div>
                        </div>
                        <div class="border border-slate-100 bg-slate-50 rounded-lg p-5 flex items-center justify-between">
                            <div>
                                <div class="text-slate-800 font-bold mb-1">下标对齐</div>
                                <code class="text-xs text-primary font-mono">align-sub</code>
                            </div>
                            <div class="text-2xl text-slate-800 bg-white px-4 py-2 rounded shadow-sm border border-slate-100">
                                H<span class="align-sub text-sm text-primary">2</span>O
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        `;
    }

    // 辅助渲染方法：图鉴卡片
    static renderGalleryCard(title, cls, previewHtml) {
        return `
            <div class="group border border-slate-100 hover:border-primary/30 bg-white rounded-lg p-4 transition-all hover:shadow-md flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden">
                <div class="text-lg text-slate-800 font-medium z-10 w-full truncate px-2">
                    ${previewHtml}
                </div>
                <div class="z-10 flex flex-col gap-1 items-center">
                    <span class="text-xs text-slate-400 font-medium">${title}</span>
                    <code class="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100 font-mono group-hover:bg-primary/5 group-hover:text-primary transition-colors">${cls}</code>
                </div>
            </div>
        `;
    }

    // 辅助渲染方法：列表行
    // 辅助渲染方法：列表行 (v3.1 Patch: 修复 Webkit 底层装饰线缩放撕裂 Bug)
    static renderRowCard(cls, desc, previewCls) {
        return `
            <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/40 hover:shadow-sm transition-all group cursor-default">
                <div class="flex items-center gap-3">
                    <code class="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">${cls}</code>
                    <span class="text-sm text-slate-500">${desc}</span>
                </div>
                <!-- 移除了 scale 缩放，改用文本颜色渐变，规避 GPU 渲染重绘 Bug -->
                <div class="text-xl text-slate-800 font-bold ${previewCls} group-hover:text-primary transition-colors">
                    Aa
                </div>
            </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：组件绑定与沙盒引擎
    // ==========================================
    static mount(container) {
        // 1. 初始化极致代码块高亮
        initCodeHighlighter({ showLineNumbers: false, langLabel: false });

        // 2. 沙盒逻辑状态管理
        const state = {
            line: 'underline',
            style: 'decoration-wavy',
            thickness: 'decoration-2',
            offset: 'underline-offset-4',
            italic: 'italic'
        };

        const previewText = container.querySelector('#preview-text');
        const codeContainer = container.querySelector('#code-container');

        // 核心更新机制
        const updatePlayground = () => {
            // 组装生成的类名
            const activeClasses = [state.line];
            if (state.line !== 'no-underline') {
                activeClasses.push(state.style, state.thickness, state.offset);
            }
            if (state.italic) {
                activeClasses.push(state.italic);
            }
            
            const classString = activeClasses.filter(Boolean).join(' ');

            // A. 更新视觉预览节点
            previewText.className = `text-3xl md:text-4xl text-slate-800 font-misans-vf font-bold transition-all duration-300 ${classString}`;

            // B. TreeWalker 外科手术级替换代码块文本，保护高亮组件
            if (codeContainer) {
                const walker = document.createTreeWalker(
                    codeContainer,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while ((node = walker.nextNode())) {
                    // 匹配初始的 DYNAMIC_CLASSES_HERE 或之后动态生成的类名组合
                    if (node.nodeValue.includes('DYNAMIC_CLASSES_HERE') || node.nodeValue.includes('underline') || node.nodeValue.includes('italic') || node.nodeValue.includes('decoration')) {
                        // 利用正则表达式替换位于 class="" 内部的组合内容
                        // 因为高亮器会把属性值分开，所以这里直接全量更新文本节点内容最为安全
                        node.nodeValue = classString;
                    }
                }
            }
        };

        // 首次渲染执行注入
        setTimeout(updatePlayground, 100);

        // 3. 事件绑定
        // 按钮组单选逻辑
        const bindButtonGroup = (groupId, stateKey) => {
            const wrapper = container.querySelector(groupId);
            if (!wrapper) return;
            const buttons = wrapper.querySelectorAll('.btn-toggle');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    buttons.forEach(b => {
                        b.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                        b.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-600');
                    });
                    target.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-600');
                    target.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary', 'ring-1', 'ring-primary/20');
                    state[stateKey] = target.dataset.val;
                    updatePlayground();
                });
            });
        };

        bindButtonGroup('#ctrl-line', 'line');
        bindButtonGroup('#ctrl-style', 'style');

        // Select 下拉逻辑
        const bindSelect = (selectId, stateKey) => {
            const select = container.querySelector(selectId);
            if (select) {
                select.addEventListener('change', (e) => {
                    state[stateKey] = e.target.value;
                    updatePlayground();
                });
            }
        };

        bindSelect('#ctrl-thickness', 'thickness');
        bindSelect('#ctrl-offset', 'offset');

        // Checkbox 逻辑
        const italicCb = container.querySelector('#ctrl-italic');
        if (italicCb) {
            italicCb.addEventListener('change', (e) => {
                state.italic = e.target.checked ? 'italic' : '';
                updatePlayground();
            });
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'underline, overline, line-through', desc: '文本基础修饰线' },
            { class: 'decoration-solid to wavy', desc: '文本修饰线样式 (实线、虚线、波浪线等)' },
            { class: 'decoration-0 to 8', desc: '文本修饰线粗细' },
            { class: 'underline-offset-0 to 8', desc: '下划线偏移量' },
            { class: 'italic, non-italic', desc: '斜体与非斜体' },
            { class: 'align-super, align-sub', desc: '上标与下标对齐' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'fontstyle'
        }));
    }
}
