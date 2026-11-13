// 🚀 Jquan Optimized: 语法糖与 JIT 引擎 (jit-syntax.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class JitSyntaxDoc {
    static debounceTimer = null;
    static initialTimer = null;
    static renderEpoch = 0;

    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-cpu"></i>核心能力</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">语法糖与 JIT 引擎</li>
            </ul>

            <!-- 模块 1：洋葱变体组实验室 (Variant Groups Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-brackets-curly text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">变体组剥洋葱沙盒 (Variant Groups Engine)</cite>
                    </div>
                    <span class="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded shadow-sm">Real-time CSSOM Extraction</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        还在为你 HTML 节点上那长达几行的 <code class="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow-lg</code> 感到烦恼吗？<br/>
                        JquanUI 运行时内置了极速的<strong>剥洋葱解析算法</strong>。将共同的前缀提取在括号外，引擎会在 0 毫秒内自动展开并水合样式。<br/>
                        <strong>尝试在下方修改括号内的代码，体验实时解析引擎：</strong>
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：编辑区与解析结果 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-keyboard"></i> 源码输入区 (Jquan Syntax)
                            </label>
                            <textarea id="ctrl-variant-input" rows="4" class="w-full text-sm font-mono text-slate-700 border border-slate-200 rounded-lg focus:ring-primary focus:border-primary p-4 shadow-inner bg-slate-50 resize-none leading-relaxed" spellcheck="false">
sm:hover:(bg-primary text-white shadow-xl -translate-y-2 rounded-2xl)
active:(scale-95 bg-primary)
transition-all duration-300 px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-lg cursor-pointer
                            </textarea>
                            
                            <div class="pt-2 flex-1 flex flex-col">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <i class="ph ph-magic-wand"></i> JIT 编译产物 (Compiled CSS Rules)
                                    </div>
                                    <span id="compile-status" class="text-[10px] text-emerald-500 font-mono flex items-center gap-1 opacity-0 transition-opacity"><i class="ph ph-check-circle"></i> Compiled</span>
                                </label>
                                <!-- 🚀 Jquan 终极修复：设立独立靶点，杜绝弹性高度坍塌与滚动截断 -->
                                <div id="code-render-target" class="h-[300px] relative rounded-lg shadow-inner overflow-hidden">
                                    <!-- JS 会在这里动态注入 <pre><code> 并重新执行编译 -->
                                </div>
                            </div>
                        </div>

                        <!-- 右侧：视觉预览舞台 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-eye"></i> 实时渲染舞台 (Render Output)
                            </label>
                            <div class="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 p-8 min-h-[300px]">
                                <!-- 预览组件 -->
                                <button id="preview-variant-btn" class="">
                                    <div class="flex items-center gap-2">
                                        <span>Hover Me !</span>
                                        <i class="ph ph-rocket-launch text-xl"></i>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：任意值引擎 (Arbitrary Values) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-code text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">任意值动态网关 (Arbitrary Values JIT)</cite>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
                        当预设的字典无法满足你的创意时，不要去写 <code>style=""</code>！<br/>
                        JquanUI 的核心网关支持拦截 <code class="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">-[...]</code> 语法，并即时推导出 CSS。你可以放入具体数值、HEX 颜色，甚至复杂的 <code>calc()</code> 计算公式。由于引擎拥有空格兼容层，你可以使用下划线 <code>_</code> 来代替空格。
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- 案例卡片内容保持不变 -->
                        <div class="border border-slate-100 bg-white rounded-xl p-5 hover:shadow-md transition-shadow group">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2"><i class="ph ph-palette text-primary"></i> 精确色彩</h3>
                                <code class="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">bg-[#1e293b]</code>
                            </div>
                            <div class="h-20 w-full rounded-lg bg-[#1e293b] flex items-center justify-center border border-slate-200 group-hover:scale-[1.02] transition-transform">
                                <span class="text-white font-mono text-sm tracking-widest text-[#38bdf8]">text-[#38bdf8]</span>
                            </div>
                        </div>

                        <div class="border border-slate-100 bg-white rounded-xl p-5 hover:shadow-md transition-shadow group">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2"><i class="ph ph-ruler text-primary"></i> 绝对尺寸</h3>
                                <code class="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">w-[calc(100%-2rem)]</code>
                            </div>
                            <div class="h-20 w-full bg-slate-100 rounded-lg flex items-center px-4">
                                <div class="h-8 bg-primary/20 border border-primary/40 rounded w-[calc(100%-2rem)] flex items-center justify-center group-hover:w-[100%] transition-all duration-500">
                                    <span class="text-primary text-xs font-mono">动态计算</span>
                                </div>
                            </div>
                        </div>

                        <div class="border border-slate-100 bg-white rounded-xl p-5 hover:shadow-md transition-shadow group">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2"><i class="ph ph-squares-four text-primary"></i> 复杂网格</h3>
                                <code class="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded line-clamp-1" title="grid-cols-[1fr_minmax(100px,_2fr)_1fr]">grid-cols-[1fr_minmax(100px,_2fr)...]</code>
                            </div>
                            <div class="h-20 w-full grid grid-cols-[1fr_minmax(100px,_2fr)_1fr] gap-2">
                                <div class="bg-slate-200 rounded animate-pulse"></div>
                                <div class="bg-primary/20 border border-primary/30 rounded flex items-center justify-center text-xs text-primary font-bold">2fr</div>
                                <div class="bg-slate-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 模块 3：无 CSS 伪元素与属性状态 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <i class="ph ph-selection-plus text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">伪元素与状态变体 (CSS-free Composition)</cite>
                </div>
                <div class="p-6 md:p-8 grid gap-8 lg:grid-cols-2 items-center">
                    <div>
                        <p class="text-slate-500 text-sm leading-relaxed mb-5">
                            <code>before:</code> 和 <code>after:</code> 会自动创建空伪元素，不再要求额外声明 <code>content: ""</code>。
                            使用 <code>content-[...]</code> 写文本，使用 <code>data-*</code> / <code>aria-*</code> 驱动组件状态。
                        </p>
                        <pre class="jq-static-code"><code class="language-html text-xs leading-relaxed">&lt;div class="relative before:absolute before:inset-0
  before:rounded-xl before:bg-primary/10"&gt;...&lt;/div&gt;

&lt;button class="after:content-['NEW'] after:ml-2"&gt;Inbox&lt;/button&gt;

&lt;div data-state="open"
  class="hidden data-[state=open]:block"&gt;...&lt;/div&gt;</code></pre>
                    </div>
                    <div class="grid gap-4">
                        <div class="relative isolate overflow-hidden rounded-xl border border-primary/20 bg-white p-6 before:absolute before:inset-2 before:-z-10 before:rounded-lg before:bg-primary/10">
                            <div class="font-bold text-slate-800 after:content-['NEW'] after:ml-2 after:rounded after:bg-primary after:px-1.5 after:py-0.5 after:text-[10px] after:text-white">Inbox</div>
                            <p class="mt-2 text-sm text-slate-500">装饰层和标签全部由原子类生成。</p>
                        </div>
                        <div data-state="open" class="hidden data-[state=open]:flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            <span class="font-semibold">data-state="open" 已命中</span>
                            <i class="ph ph-check-circle text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 4：精确预取与规则预算 -->
            <div class="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <i class="ph ph-gauge text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">精确预取 (Budgeted Prefetch)</cite>
                </div>
                <div class="grid gap-8 p-6 md:p-8 lg:grid-cols-2">
                    <div>
                        <p class="mb-5 text-sm leading-relaxed text-slate-500">
                            路由、弹窗或异步组件即将出现时，使用 <code>JquanUI.prefetch()</code> 提前生成明确类名的规则。
                            它不扫描 DOM，也不接受无界通配模式；数量、CSS 字节和同步耗时均有独立预算。
                        </p>
                        <pre class="jq-static-code"><code class="language-js text-xs leading-relaxed">const result = JquanUI.prefetch([
  'grid',
  'gap-4',
  'hover:bg-primary/90',
  'before:block'
], {
  maxClasses: 40,
  maxBytes: 32000,
  timeoutMs: 16
});

console.log(result.accepted);
console.table(result.skipped);</code></pre>
                    </div>
                    <div class="grid content-start gap-3 text-sm">
                        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                            <strong class="block mb-1">适合 prefetch()</strong>
                            <span>可选界面即将显示，需要有预算、可观察的样式预热。</span>
                        </div>
                        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
                            <strong class="block mb-1">适合 compile() / flush()</strong>
                            <span>类名集合已经确定；compile 返回 Promise，await 它确认本批完成，flush 可显式排空共享队列。</span>
                        </div>
                        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                            <strong class="block mb-1">显式类名原则</strong>
                            <span>传入 <code>md:grid</code>，不要传入 <code>hover:*</code> 或 <code>bg-*</code>。</span>
                        </div>
                        <p class="text-xs leading-relaxed text-slate-500">
                            prefetch 默认预算：100 个类、100000 UTF-8 字节、50ms。<code>compile()</code> 返回 Promise，结果包含 <code>requested/processed/unresolved/failed/pending/complete/reason</code>；<code>complete</code> 表示本次类名都已完成一次尝试，不代表每个类都有有效 CSS。超过 20 个类时直接 <code>await compile()</code>，不要用固定延时猜测完成。<code>flush({ maxMs: 8 })</code> 可取得部分结果，省略预算则排空当前队列。
                        </p>
                    </div>
                </div>
            </div>

            <section class="mb-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                <h3 class="text-xl font-bold text-slate-800">动态编译完成契约</h3>
                <p class="text-sm leading-relaxed text-slate-600">只需 Core，无组件依赖。compile 接受完整类名字符串或可迭代集合，展开变体组并去重。默认冷队列不超过 20 类时同步处理，更大的队列通过 idle 分片，每片最多 40 类；Promise 只等待本次请求的类，不等待后续无关工作。需要立即处理已知小批量时传入 <code>{ sync: true }</code>，这会同步排空共享队列。addSafelist 保持原返回方式；scan/enhance 同步扫描并执行插件，flush 不扫描 DOM、不执行插件扫描 hook，也不清空诊断。</p>
                <pre class="jq-static-code"><code class="language-js text-xs leading-relaxed">const completion = await JquanUI.compile([
  'grid', 'gap-4', 'hover:(bg-primary/90 text-white)'
]);
if (!completion.cancelled &amp;&amp; completion.complete &amp;&amp;
    !completion.unresolved.length &amp;&amp; !completion.failed.length) {
  showPreparedContent();
}

// 预算结果是当前快照；部分结果不会取消原请求。
const pending = JquanUI.compile(dynamicClasses);
const partial = await JquanUI.flush({ maxMs: 8 });
console.log(partial.pending, partial.reason);
const done = await pending;</code></pre>
                <div class="overflow-auto">
                    <table class="w-full text-left text-sm">
                        <thead><tr><th class="p-2">字段 / 参数</th><th class="p-2">类型 / 默认</th><th class="p-2">含义</th></tr></thead>
                        <tbody>
                            <tr><td class="p-2">compile(classes, {sync})</td><td class="p-2">string | Iterable&lt;string&gt;；sync=false</td><td class="p-2">返回 Promise&lt;CompileResult&gt;；空集合也有完成结果。</td></tr>
                            <tr><td class="p-2">flush({maxMs})</td><td class="p-2">非负 number；Infinity</td><td class="p-2">同步处理调用时队列，返回 Promise 包装的快照；0 不处理类，负值/NaN/非数字抛 RangeError。</td></tr>
                            <tr><td class="p-2">requested / processed / pending</td><td class="p-2">string[]</td><td class="p-2">本次去重类名 / 已尝试 / 尚未尝试。</td></tr>
                            <tr><td class="p-2">unresolved / failed</td><td class="p-2">string[]</td><td class="p-2">processed 的子集；无解析结果 / 解析异常或至少一条 CSSOM 规则插入失败。部分规则可能已插入。</td></tr>
                            <tr><td class="p-2">complete / cancelled</td><td class="p-2">boolean</td><td class="p-2">本批全部已尝试 / 被 destroy 或首次晚到配置取消。complete 不保证有效 CSS，浏览器静默忽略的无效声明也未必抛错。</td></tr>
                            <tr><td class="p-2">reason</td><td class="p-2">string | null</td><td class="p-2">null、budget、busy、stylesheet-unavailable、destroyed、config-changed。busy 仅表示解析器重入调用 flush，不能递归排空。</td></tr>
                            <tr><td class="p-2">remaining / durationMs</td><td class="p-2">number</td><td class="p-2">快照时共享队列余量 / 本次调用到结果的毫秒数，compile 包含调度等待。</td></tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-sm leading-relaxed text-slate-600">预算在每个类之前检查；单次解析和 CSSOM 插入不能中途抢占，可能超过 maxMs。省略预算或 sync=true 会阻塞主线程直到队列完成，适合有限的类集合。flush 只处理当前类队列，不收集尚未交付的 MutationObserver 记录；业务先提交 DOM，再用完整类名 compile，或对已插入根调用 enhance。初始 isReady()/jquan:ready 不是后续动态工作的完成信号。</p>
                <p class="text-sm leading-relaxed text-slate-600">destroy() 和受支持的首次晚到配置会结算等待者，分别返回 destroyed/config-changed，旧 idle 回调失效。样式表暂不可用时返回 stylesheet-unavailable 与 pending；恢复后重新 compile 或 flush。已处理结果会复用，含未解析/失败状态；新增令牌后应使用既有配置初始化流程，而非重复 compile 同一失败类。缓存格式 5 保存未解析及解析/插入失败阶段，旧格式失效。示例销毁时用 generation 标记忽略过期 UI 更新，见 <a href="./examples/core-compile-completion.html" target="_blank" rel="noopener" class="text-primary underline">可运行示例</a>；回归入口 <code>npm run check:core-compile</code>。</p>
            </section>

            <!-- 模块 5：ShadowRoot 生命周期 -->
            <div class="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <i class="ph ph-cube-transparent text-primary text-lg"></i>
                    <cite class="font-bold text-slate-800 not-italic">Shadow DOM / Web Components</cite>
                </div>
                <div class="grid gap-8 p-6 md:p-8 lg:grid-cols-2">
                    <div>
                        <p class="mb-5 text-sm leading-relaxed text-slate-500">
                            Constructable Stylesheet 可用时，<code>adopt()</code> 会共享主题与工具规则、同步编译根内现有类，并监听后续 DOM 变化；组件销毁时使用 <code>detach()</code> 释放专属监听和插件行为。
                        </p>
                        <pre class="jq-static-code"><code class="language-js text-xs leading-relaxed">class ProfileCard extends HTMLElement {
  connectedCallback() {
    this.root = this.shadowRoot || this.attachShadow({ mode: 'open' });
    this.root.innerHTML = '&lt;article class="p-4 rounded-lg bg-primary/10"&gt;Profile&lt;/article&gt;';
    JquanUI.adopt(this.root);
    console.log(JquanUI.getAdoptionStatus(this.root));
  }

  disconnectedCallback() {
    JquanUI.detach(this.root);
  }
}

customElements.define('profile-card', ProfileCard);</code></pre>
                    </div>
                    <div class="grid content-start gap-3 text-sm">
                        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                            <strong class="mb-1 block">默认完整生命周期</strong>
                            <span><code>{ scan: true, observe: true }</code>，适合运行时生成或会更新的 Web Component。</span>
                        </div>
                        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
                            <strong class="mb-1 block">静态根优化</strong>
                            <span>构建产物已包含全部规则时可设 <code>scan: false</code>；根永不变化时可设 <code>observe: false</code>。</span>
                        </div>
                        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                            <strong class="mb-1 block">隔离与主题</strong>
                            <span>卸载只移除 JquanUI 的两张 sheet；宿主主题变量会继承，ShadowRoot 内的 <code>.dark</code> / <code>.light</code> 也可局部覆盖。</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 6：核心机制解析列表 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
                <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2"><i class="ph ph-info text-primary text-xl"></i> JIT 引擎运行原理 (Under the Hood)</h3>
                <div class="space-y-4">
                    ${this.renderMechanismRow('ph-magnifying-glass', '智能提取与转义', '当你在 HTML 中写入 <code>w-[23.5px]</code> 时，DOM 解析器不会报错。我们的底层转义器 (Escaper) 会自动将其安全转换为合法的 CSS 类名选择器如 <code>.w-\\[23\\.5px\\]</code>。')}
                    ${this.renderMechanismRow('ph-arrows-split', '占位符掩护算法 (Placeholder Masking)', '如果你同时使用了变体组和任意值，如 <code>hover:(w-[10px] bg-red-500)</code>。引擎会先用 <code>__JQUAN_ARB_0__</code> 保护中括号内容，安全剥离括号后再将任意值还原，确保正则匹配万无一失。')}
                    ${this.renderMechanismRow('ph-lightning', '切片渲染 (Time-Slicing)', '遇到庞大的页面时，JquanUI 会动用 <code>requestIdleCallback</code> 将需要计算的类名分块处理。<code>await JquanUI.compile(classes)</code> 是完成信号；<code>JquanUI.flush({ maxMs: 8 })</code> 可按预算取得部分结果，避免依赖固定延时。')}
                </div>
            </div>

        </div>
        `;
    }

    static renderMechanismRow(icon, title, desc) {
        return `
            <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <i class="ph ${icon} text-xl"></i>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-slate-800 mb-1">${title}</h4>
                    <p class="text-sm text-slate-500 leading-relaxed">${desc}</p>
                </div>
            </div>
        `;
    }

        // ==========================================
    // 挂载逻辑：引擎实时调用与 CSSOM 嗅探 API
    // ==========================================
    static mount(container) {
        const epoch = ++JitSyntaxDoc.renderEpoch;
        const inputEl = container.querySelector('#ctrl-variant-input');
        const previewBtn = container.querySelector('#preview-variant-btn');
        const statusEl = container.querySelector('#compile-status');
        const codeTargetEl = container.querySelector('#code-render-target');

        if (!inputEl || !previewBtn || !codeTargetEl) return;

        initCodeHighlighter({
            selector: '#app-container .jq-static-code code',
            showLineNumbers: true,
            langLabel: true
        });

        // 核心渲染器：销毁旧节点，注入新纯净代码块，然后重新执行编译！
        const renderCodeBlock = (codeString) => {
            // 转义防止 HTML 解析错误
            const safeCode = codeString.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // 重建纯净结构
            codeTargetEl.innerHTML = `<pre><code class="language-css text-xs leading-relaxed">${safeCode}</code></pre>`;
            
            // 🚀 Jquan 终极布局修复：绝对定位阻断法！
            initCodeHighlighter({ 
                selector: '#code-render-target pre code',
                showLineNumbers: true, 
                langLabel: true,
                // 使用 absolute inset-0 彻底跳出文档流，霸道地填满外层的 300px，绝不往外多撑开 1 像素！
                containerClass: 'absolute inset-0 group text-slate-300 font-mono text-sm flex flex-col',
                // 让滚动包裹层在绝对空间内自由滚动
                scrollWrapperClass: 'overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent'
            });
        };

        // 🧠 Jquan P8 核心黑科技：CSSOM 嗅探器
        const extractCompiledCSS = (classesStr) => {
            const classList = classesStr.split(' ').filter(Boolean);
            if (classList.length === 0) return '';
            
            const targetSelectors = classList.map(cls => '.' + CSS.escape(cls));
            let extractedRules = [];

            try {
                for (let sheet of document.styleSheets) {
                    try {
                        if (!sheet.cssRules) continue;
                        for (let rule of sheet.cssRules) {
                            if (rule.type === CSSRule.STYLE_RULE) {
                                if (targetSelectors.some(sel => rule.selectorText.includes(sel))) {
                                    extractedRules.push(rule.cssText);
                                }
                            } else if (rule.type === CSSRule.MEDIA_RULE) {
                                let innerRules = [];
                                for (let innerRule of rule.cssRules) {
                                    if (innerRule.type === CSSRule.STYLE_RULE && targetSelectors.some(sel => innerRule.selectorText.includes(sel))) {
                                        innerRules.push('  ' + innerRule.cssText);
                                    }
                                }
                                if (innerRules.length > 0) {
                                    extractedRules.push(`@media ${rule.conditionText} {\n${innerRules.join('\n')}\n}`);
                                }
                            }
                        }
                    } catch (e) { /* 忽略跨域 */ }
                }
            } catch (e) { console.warn(e); }

            if (extractedRules.length === 0) return '/* JIT 引擎编译中... */\n/* (如果长时间无输出，代表该类属于浏览器原生默认样式或语法无效) */';
            
            return [...new Set(extractedRules)].join('\n\n')
                .replace(/\{ /g, '{\n  ')
                .replace(/; /g, ';\n  ')
                .replace(/ \}/g, '\n}');
        };

        let requestId = 0;
        const updateSandbox = async () => {
            const request = ++requestId;
            const rawSyntax = inputEl.value.trim();
            statusEl?.classList.remove('opacity-100');
            statusEl?.classList.add('opacity-0');
            
            if (rawSyntax === '') {
                renderCodeBlock('/* 等待输入... */');
                previewBtn.className = '';
                return;
            }

            try {
                // 1. 调用 JquanUI 解析语法
                const singleLineSyntax = rawSyntax.replace(/\n/g, ' ');
                const expandedClasses = window.JquanUI.expandSyntax(singleLineSyntax);
                
                // 2. 注入 DOM
                const completion = await window.JquanUI.compile(expandedClasses);
                if (epoch !== JitSyntaxDoc.renderEpoch || request !== requestId || !inputEl.isConnected || completion.cancelled) return;
                previewBtn.className = expandedClasses;

                // 3. 初始反馈
                renderCodeBlock('/* 正在提取底层 CSS 树参数... */');

                // 4. 完成信号来自 compile，而不是固定延时
                if (!codeTargetEl.isConnected) return;
                const compiledCSS = extractCompiledCSS(expandedClasses);
                renderCodeBlock(compiledCSS);
                statusEl?.classList.remove('opacity-0');
                statusEl?.classList.add('opacity-100');

            } catch (error) {
                if (epoch !== JitSyntaxDoc.renderEpoch || request !== requestId || !codeTargetEl.isConnected) return;
                renderCodeBlock('/* 引擎解析错误，请检查语法结构是否闭合 */');
            }
        };

        // 监听输入，带 200ms 防抖
        inputEl.addEventListener('input', () => {
            requestId++;
            clearTimeout(JitSyntaxDoc.debounceTimer);
            JitSyntaxDoc.debounceTimer = setTimeout(updateSandbox, 200);
        });

        // 初始渲染一次
        JitSyntaxDoc.initialTimer = setTimeout(updateSandbox, 100);
    }

    static unmount() {
        JitSyntaxDoc.renderEpoch++;
        clearTimeout(JitSyntaxDoc.debounceTimer);
        clearTimeout(JitSyntaxDoc.initialTimer);
        JitSyntaxDoc.debounceTimer = null;
        JitSyntaxDoc.initialTimer = null;
    }

    static async onSearch(keyword) {
        const apiData = [
            { class: '():', desc: '变体组语法 (如 hover:(bg-red text-white))' },
            { class: '-[]', desc: '任意值包裹语法 (如 w-[100px], bg-[#000])' },
            { class: 'expandSyntax()', desc: 'JS API: 展开洋葱变体语法' },
            { class: 'compile()', desc: 'JS API: 编译明确类名并等待本批完成' },
            { class: 'flush()', desc: 'JS API: 按预算处理共享编译队列' },
            { class: 'prefetch()', desc: 'JS API: 按数量、字节和时间预算精确预取类名' },
            { class: 'adopt()', desc: 'JS API: 挂载并监听 ShadowRoot' },
            { class: 'detach()', desc: 'JS API: 清理 ShadowRoot 样式与生命周期' },
            { class: 'getAdoptionStatus()', desc: 'JS API: 读取 ShadowRoot 挂载状态' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'jit-syntax'
        }));
    }
}
