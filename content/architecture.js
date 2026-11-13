// 🚀 Jquan Optimized: 架构与性能调优文档 (architecture.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ArchitectureDoc {
    static cacheMonitor = null;
    static diagnosticMonitor = null;

    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-cpu"></i>核心能力</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">架构与性能调优</li>
            </ul>

            <!-- 模块 1：渲染切片与防抖 (Time-Slicing) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-knife text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">渲染切片与 FOUC 防御 (Time-Slicing)</cite>
                    </div>
                    <span class="text-xs font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded shadow-sm">requestIdleCallback</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        初始 fullScan、scan、enhance 与显式 sync 编译会同步处理已有类；初始 ready 在扫描后发出。<br/>
                        动态编译的冷队列不超过 20 类时同步处理，更大的队列使用 <strong>Time-Slicing（时间切片）</strong>。每次 idle 回调最多处理 <code class="text-xs font-bold text-slate-700">CHUNK_SIZE = 40</code> 个类，空闲时间不足时可以更少；一次回调不等同于一帧。需要确认本次完成时使用 await compile。
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：架构原理图解 -->
                        <div class="flex flex-col space-y-4 justify-center">
                            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <i class="ph ph-activity"></i> Jquan JIT 异步工作流
                            </h4>
                            <div class="space-y-3">
                                <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                                    <span class="text-xs font-bold text-slate-600">1. MutationObserver 捕获</span>
                                    <i class="ph ph-arrow-right text-slate-400"></i>
                                    <span class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 border border-emerald-100 rounded">Pending Nodes (Set)</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                                    <span class="text-xs font-bold text-slate-600">2. requestAnimationFrame 收集</span>
                                    <i class="ph ph-arrow-right text-slate-400"></i>
                                    <span class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 border border-blue-100 rounded">Class Queue (Set)</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col gap-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-bold text-slate-600">3. requestIdleCallback 切片解析</span>
                                        <span class="text-[10px] bg-slate-200 text-slate-500 px-1.5 rounded font-mono">up to 40 / idle</span>
                                    </div>
                                    <!-- 进度条假象 -->
                                    <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                                        <div class="h-full bg-primary w-1/4 rounded-full animate-pulse"></div>
                                        <div class="h-full bg-primary w-1/4 rounded-full animate-pulse delay-150"></div>
                                        <div class="h-full bg-primary w-1/4 rounded-full animate-pulse delay-300"></div>
                                        <div class="h-full bg-slate-300 w-1/4 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 右侧：代码演示 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-code"></i> 底层切片源码节选
                            </label>
                            <div class="relative h-[250px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
// 兼容性极好的空闲时间调度器
const scheduleIdle = window.requestIdleCallback || function(cb) {
    return setTimeout(() => {
        const start = Date.now();
        cb({ didTimeout: false,
             timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) });
    }, 1);
};

// ... 切分块并插入 CSSOM
if (processedCount >= CHUNK_SIZE ||
    (processedCount > 0 && deadline && deadline.timeRemaining() <= 1)) {
    break; // 中断当前切片，交出主线程控制权
}
// 实现还会去重调度任务，销毁/重配置会使旧回调失效。
if (classQueue.size > 0) scheduleQueueTask();
                                </code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：水合缓存与热启动 (Hydration & Warm Start) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-database text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">水合缓存与热启动 (Warm Start)</cite>
                    </div>
                    <span class="text-xs font-mono text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded shadow-sm">localStorage CSSOM</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
                        就算有时间切片，大量计算依然耗费 CPU。所以 JquanUI 实现了<strong>结果缓存引擎</strong>。<br/>
                        当它解析完新类名时，会将生成的 CSS Rules 数组和配置特征 Hash 序列化存入 localStorage。用户再次打开页面时，引擎可以复用通过校验的规则，并将其水合回 <code class="inline-code">&lt;style&gt;</code>，减少重复解析。
                    </p>
                    
                    <div class="flex flex-col lg:flex-row gap-8">
                        <div class="w-full lg:w-1/2 border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col justify-center items-center text-center space-y-4">
                            <i class="ph ph-hard-drives text-4xl text-slate-400"></i>
                            <div>
                                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">当前 JIT 本地缓存状态</div>
                                <div id="cache-status" class="text-xl font-bold font-mono text-emerald-600">正在嗅探...</div>
                            </div>
                            <div class="flex gap-3 mt-4">
                                <button id="btn-clear-cache" class="px-4 py-2 bg-white border border-rose-200 text-rose-500 text-xs font-bold rounded-lg hover:bg-rose-50 hover:shadow-sm transition-all active:scale-95">
                                    <i class="ph ph-trash"></i> 强制清空缓存
                                </button>
                            </div>
                            <p class="text-xs text-slate-400 mt-2 max-w-[200px]">提示：清空后，在页面内进行任何操作产生新类名，缓存会自动在 1.2 秒内防抖重建。</p>
                        </div>

                        <!-- 效果演示与 API -->
                        <div class="w-full lg:w-1/2 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">开发调试 API</label>
                            <div class="relative h-[220px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
// 清空引擎在本地写入的缓存片段
window.JquanUI.clearCache();

// 获取当前页面已经被解析并记录的类名集合
const classSet = window.JquanUI.getProcessedClasses();
console.log('已被 JIT 接管的原子类数:', classSet.size);

// 强行停止监听 DOM 变化 (进入静态渲染模式)
window.JquanUI.stop();
// 重新启动监听
window.JquanUI.start();
                                </code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：动态安全白名单 (Dynamic Safelist) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-shield-check text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">动态安全白名单 (Dynamic Safelist)</cite>
                    </div>
                    <span class="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded shadow-sm">addSafelist()</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
                        当你的前端从后端接口拉取了一段富文本（Rich Text），里面携带了各种没见过的 <code class="text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">bg-[#ff00ff]</code>。如果这段 HTML 在 JquanUI 初始化之后才被直接 <code>innerHTML</code> 塞进去，有可能会出现短暂的样式丢失。<br/>
                        这就是 <code class="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">JquanUI.addSafelist()</code> 的用武之地。
                    </p>
                    
                    <div class="flex flex-col lg:flex-row gap-8 items-stretch">
                        
                        <!-- 代码控制台 -->
                        <div class="w-full lg:w-1/2 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">执行动态注入</label>
                            <div class="relative h-[250px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
// 假设这是后端返回的包含复杂类名的字符串：
const dynamicClasses = 'bg-[#8b5cf6] text-white p-4 shadow-[0_0_20px_#8b5cf6] border-4 border-dashed border-[#c4b5fd] rotate-3 hover:rotate-0 transition-transform';

// 在插入 DOM 之前或之后，主动通知 JIT 引擎：
// 引擎会立即解析、编译、并注水到 CSSOM 中
window.JquanUI.addSafelist(dynamicClasses);
                                </code></pre>
                            </div>
                            <button id="btn-fire-safelist" class="mt-2 w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2">
                                <i class="ph ph-play"></i> 点击执行 addSafelist
                            </button>
                        </div>

                        <!-- 虚假富文本模拟器 -->
                        <div class="w-full lg:w-1/2 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                                <span>富文本渲染容器</span>
                                <span id="safelist-status" class="text-xs font-mono text-slate-400">Waiting...</span>
                            </label>
                            
                            <div class="flex-1 border border-slate-200 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-8">
                                
                                <!-- 初始是一堆普通的字，因为它们身上的类名并没有被 JIT 引擎事先扫描过！ -->
                                <div id="fake-richtext" class="text-center font-bold text-lg p-2 rounded-xl text-slate-800 border-2 border-slate-300 bg-white transition-all duration-500">
                                    I am a Remote Component!
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 模块 4：运行时诊断与性能快照 (Runtime Diagnostics) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-gauge text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">运行时诊断与性能快照 (Runtime Diagnostics)</cite>
                    </div>
                    <span class="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded shadow-sm">getMetrics() / debug() / diagnose()</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        开发阶段先用低成本的 <code class="inline-code">getMetrics()</code> 查看运行时概况，需要未解析类、失败规则或冲突明细时再读取 <code class="inline-code">debug()</code> 与 <code class="inline-code">diagnose()</code>。面板直接读取真实 API，不构造伪造指标。
                    </p>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4"><div class="text-xs font-bold uppercase tracking-wider text-slate-400">已插入规则</div><div id="diagnostic-rules" class="mt-2 text-2xl font-bold font-mono text-primary">—</div></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4"><div class="text-xs font-bold uppercase tracking-wider text-slate-400">解析次数</div><div id="diagnostic-resolves" class="mt-2 text-2xl font-bold font-mono text-primary">—</div></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4"><div class="text-xs font-bold uppercase tracking-wider text-slate-400">已处理类名</div><div id="diagnostic-classes" class="mt-2 text-2xl font-bold font-mono text-primary">—</div></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4"><div class="text-xs font-bold uppercase tracking-wider text-slate-400">队列状态</div><div id="diagnostic-queue" class="mt-2 text-2xl font-bold font-mono text-primary">—</div></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4"><div class="text-xs font-bold uppercase tracking-wider text-slate-400">缓存水合</div><div id="diagnostic-cache" class="mt-2 text-2xl font-bold font-mono text-primary">—</div></div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4"><div class="text-xs font-bold uppercase tracking-wider text-slate-400">最慢解析</div><div id="diagnostic-slowest" class="mt-2 truncate text-sm font-bold font-mono text-primary">—</div></div>
                    </div>
                    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                        <div class="space-y-4">
                            <div class="flex flex-wrap items-center gap-3">
                                <button id="btn-refresh-diagnostics" type="button" class="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700 active:scale-95"><i class="ph ph-arrows-clockwise"></i>刷新快照</button>
                                <button id="btn-track-conflicts" type="button" class="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20 active:scale-95"><i class="ph ph-scan"></i>开启冲突追踪</button>
                            </div>
                            <div id="diagnostic-summary" class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">等待读取 JquanUI 运行时状态。</div>
                            <p class="text-xs leading-relaxed text-slate-400">冲突追踪是 opt-in 操作；开启后会触发一次完整扫描，生产环境不要默认开启。</p>
                        </div>
                        <div id="diagnostic-output-host" class="relative min-h-[260px] overflow-hidden rounded-lg border border-slate-200 shadow-inner">
                            <pre><code class="language-json text-xs leading-relaxed">{
  "metrics": "JquanUI.getMetrics()",
  "debug": "JquanUI.debug()",
  "diagnose": "JquanUI.diagnose()"
}</code></pre>
                        </div>
                    </div>
                    <pre class="mt-6"><code class="language-javascript">const metrics = JquanUI.getMetrics();
const debug = JquanUI.debug();
const diagnosis = JquanUI.diagnose({ track: true });

console.table({
  rules: metrics.insertedRuleCount,
  classes: metrics.processedClassCount,
  queue: metrics.queueSize,
  unresolved: diagnosis.unresolvedClassCount,
  conflicts: diagnosis.conflictCount
});</code></pre>
                </div>
            </div>

            <section class="mb-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 class="text-xl font-bold text-slate-800">批量类诊断：checkClasses()</h2>
                <p class="text-sm leading-relaxed text-slate-600">只需 Core，无组件依赖。传入完整类名字符串或 Iterable；变体组展开并去重。查询重新调用当前 resolver，Core 自身不写样式、不排空队列、不扫描 DOM，也不修改 processed、debug、指标或缓存。插件/自定义 resolver 会执行，需保持它们自身无副作用；这与直接 resolve 一样。返回 CSS 仅代表解析命中，不代表浏览器接受或页面实际生效。</p>
                <label for="class-check-input" class="block text-sm font-medium text-slate-700">输入要校验的类</label>
                <textarea id="class-check-input" rows="3" class="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-sm">grid hover:(p-2 m-2) diagnostic-missing jquan-ready</textarea>
                <button id="btn-check-classes" type="button" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white focus:ring-2">只读校验</button>
                <p id="class-check-status" role="status" class="text-sm text-slate-600">点击按钮查询当前解析结果。</p>
                <pre id="class-check-output" class="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100"></pre>
                <pre><code class="language-javascript">const report = JquanUI.checkClasses(
  ['grid', 'hover:(p-2 m-2)', 'business-marker'],
  { maxClasses: 1000, timeoutMs: 50 }
);
console.table(report.results);
console.log(report.complete, report.ok, report.reason);</code></pre>
                <div class="overflow-auto">
                    <table class="w-full text-left text-sm">
                        <thead><tr><th class="p-2">字段 / 参数</th><th class="p-2">类型 / 默认</th><th class="p-2">含义</th></tr></thead>
                        <tbody>
                            <tr><td class="p-2">classNames</td><td class="p-2">string | Iterable&lt;string&gt;</td><td class="p-2">显式类名；只接受有限集合，不支持无界通配。与 compile 共用规范化。</td></tr>
                            <tr><td class="p-2">maxClasses / timeoutMs</td><td class="p-2">1000 / 50</td><td class="p-2">非负整数数量 / 非负毫秒；均允许 Infinity。非法值抛 RangeError。0 跳过全部类，两个均为 0 时数量优先。</td></tr>
                            <tr><td class="p-2">requested / results</td><td class="p-2">string[] / ClassCheckItem[]</td><td class="p-2">去重后的请求 / 同序逐类结果，不受 debug 的 80 项样本限制。</td></tr>
                            <tr><td class="p-2">results[].status</td><td class="p-2">resolved / unresolved / error / ignored / skipped</td><td class="p-2">有 CSS / 未命中 / resolver 抛错 / 保留标记 jquan-ready / 本次预算跳过。</td></tr>
                            <tr><td class="p-2">css / error / reason</td><td class="p-2">string|null / {name,message}|null / string|null</td><td class="p-2">仅 resolved 有 CSS，error 有错误摘要，skipped 有 max-classes 或 timeout。每项也有 className。</td></tr>
                            <tr><td class="p-2">results[].runtime</td><td class="p-2">调用入口时的历史快照</td><td class="p-2">unprocessed、pending、processed、unresolved、resolve-error、insert-error；与本次 status 独立，过去失败的类现在可能解析成功。</td></tr>
                            <tr><td class="p-2">complete / ok / reason</td><td class="p-2">boolean / boolean / string|null</td><td class="p-2">未跳过任何类 / 全部 resolved 或 ignored 且无跳过 / max-classes、timeout 或 null。空集合 complete/ok 均为 true。</td></tr>
                            <tr><td class="p-2">maxClasses / timeoutMs / durationMs</td><td class="p-2">number</td><td class="p-2">有效预算与查询耗时；不含输入枚举/展开。预算每类前检查，单次 resolver 不可抢占，最后一类超时仍可能 complete。</td></tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-sm leading-relaxed text-slate-600">先根据 status 修正拼写或配置；unresolved 也可能只是业务/第三方标记，不自动视为页面故障。未知变体等解析宽容行为沿用 resolve，不进行独立 CSS 语义校验。根据 runtime 区分过去的 resolve-error 与 insert-error；processed 仅表示已有完成尝试，不是浏览器计算样式的证明。预算跳过不会变成全局未解析或失败。需要生成规则时显式 await compile，并检查 unresolved/failed/pending/cancelled；debug()/diagnose() 默认只查询，{track:true} 才开启冲突追踪并重扫，不能用于纯查询测试。</p>
                <p class="text-sm leading-relaxed text-slate-600">jquan-ready 是引擎保留标记：扫描/编译不再把它记成未解析，checkClasses 返回 ignored，单类 resolve 仍返回 null。缓存格式 5 保存失败阶段，旧格式 4 失效。查询无监听、计时器或句柄，无需销毁；交互页面卸载时仍需忽略未完成业务请求。完整示例见 <a href="./examples/core-class-diagnostics.html" target="_blank" rel="noopener" class="text-primary underline">类诊断与动态渲染</a>；回归 <code>npm run check:core-diagnostics</code>。</p>
                <h3 class="font-semibold text-slate-800">截图和自动化的完成条件</h3>
                <pre><code class="language-javascript">// 1. 自动化先等待 Core 初始就绪。
if (!JquanUI.isReady()) {
  await new Promise(resolve =&gt; document.addEventListener('jquan:ready', resolve, { once: true }));
}
// 2. 业务先结束本次异步取数/模板更新，拿到完整动态类名。
await renderCurrentView();
const done = await JquanUI.compile(dynamicClasses);
if (done.cancelled || !done.complete || done.pending.length ||
    done.unresolved.length || done.failed.length) {
  throw new Error('Dynamic styles are not ready');
}
// 3. 等待业务依赖的字体/图片与实际布局，随后截图。
await document.fonts.ready;
await new Promise(resolve =&gt; requestAnimationFrame(() =&gt; requestAnimationFrame(resolve)));</code></pre>
                <p class="text-xs leading-relaxed text-slate-500">isReady/jquan:ready 只覆盖初始扫描；checkClasses 不会生成 CSS，flush 也不接收尚未交付的 MutationObserver 记录。字体、图片、动画、网络和业务请求各自等待实际条件；不要用固定延时或 webdriver 切换同步语义来掩盖未完成状态。</p>
            </section>
        </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：JquanUI 真实沙盒操作绑定
    // ==========================================
    static mount(container) {
        const classCheckInput = container.querySelector('#class-check-input');
        const classCheckButton = container.querySelector('#btn-check-classes');
        const classCheckOutput = container.querySelector('#class-check-output');
        const classCheckStatus = container.querySelector('#class-check-status');
        if (classCheckInput && classCheckButton && classCheckOutput && classCheckStatus) {
            classCheckButton.addEventListener('click', () => {
                try {
                    const report = window.JquanUI.checkClasses(classCheckInput.value);
                    classCheckOutput.textContent = JSON.stringify(report, null, 2);
                    classCheckStatus.textContent = report.ok ? '全部类已解析或为保留标记；本次查询未生成样式。' : '请查看未命中、错误或预算跳过项。';
                } catch (error) { classCheckStatus.textContent = error.message; }
            });
        }

        // 1. 初始化极致代码块高亮 (绝对定位防截断，尊重宿主背景色)
        initCodeHighlighter({ 
            showLineNumbers: true, 
            langLabel: true,
            containerClass: 'absolute inset-0 group font-mono text-sm flex flex-col rounded-lg overflow-hidden',
            scrollWrapperClass: 'overflow-auto flex-1'
        });

        // 2. 缓存侦测系统挂载
        const cacheStatusEl = container.querySelector('#cache-status');
        const clearCacheBtn = container.querySelector('#btn-clear-cache');

        const updateCacheDisplay = () => {
            try {
                // 找出属于 JquanUI 的缓存 Key
                let targetKey = null;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('jquan_runtime_cache_')) {
                        targetKey = key;
                        break;
                    }
                }

                if (targetKey) {
                    const data = localStorage.getItem(targetKey);
                    const bytes = new Blob([data]).size;
                    const kb = (bytes / 1024).toFixed(2);
                    cacheStatusEl.innerHTML = `<span class="text-emerald-600">${kb} KB</span> <span class="text-xs text-slate-400 font-normal ml-1">(${targetKey})</span>`;
                } else {
                    cacheStatusEl.innerHTML = `<span class="text-slate-400">Empty (No Cache)</span>`;
                }
            } catch (e) {
                cacheStatusEl.innerHTML = `<span class="text-rose-500">Error Accessing</span>`;
            }
        };

        // 初始化更新一次显示
        updateCacheDisplay();
        // 设置一个定时器，因为用户如果在页面里操作产生了新类名，缓存会在1.2s后防抖更新
        ArchitectureDoc.cacheMonitor = setInterval(updateCacheDisplay, 2000);

        if (clearCacheBtn && window.JquanUI) {
            clearCacheBtn.addEventListener('click', () => {
                window.JquanUI.clearCache();
                updateCacheDisplay();
                clearCacheBtn.innerHTML = '<i class="ph ph-check"></i> 已清空';
                clearCacheBtn.classList.replace('text-rose-500', 'text-emerald-500');
                clearCacheBtn.classList.replace('border-rose-200', 'border-emerald-200');
                
                setTimeout(() => {
                    clearCacheBtn.innerHTML = '<i class="ph ph-trash"></i> 强制清空缓存';
                    clearCacheBtn.classList.replace('text-emerald-500', 'text-rose-500');
                    clearCacheBtn.classList.replace('border-emerald-200', 'border-rose-200');
                }, 2000);
            });
        }

        // 3. 运行时诊断面板：读取真实 Core API，不制造静态假数据
        const diagnosticElements = {
            rules: container.querySelector('#diagnostic-rules'),
            resolves: container.querySelector('#diagnostic-resolves'),
            classes: container.querySelector('#diagnostic-classes'),
            queue: container.querySelector('#diagnostic-queue'),
            cache: container.querySelector('#diagnostic-cache'),
            slowest: container.querySelector('#diagnostic-slowest'),
            summary: container.querySelector('#diagnostic-summary'),
            outputHost: container.querySelector('#diagnostic-output-host')
        };
        const refreshDiagnosticsBtn = container.querySelector('#btn-refresh-diagnostics');
        const trackConflictsBtn = container.querySelector('#btn-track-conflicts');

        const readDiagnostics = (options = {}) => {
            if (!window.JquanUI || !diagnosticElements.summary) return;
            try {
                const metrics = window.JquanUI.getMetrics();
                const debug = window.JquanUI.debug(options);
                const diagnosis = window.JquanUI.diagnose();
                const slowest = metrics.slowestResolve
                    ? `${metrics.slowestResolve.className || metrics.slowestResolve.class || 'unknown'} · ${metrics.slowestResolve.durationMs || metrics.slowestResolve.ms || 0}ms`
                    : '暂无';
                diagnosticElements.rules.textContent = String(metrics.insertedRuleCount ?? metrics.dynamicRuleCount ?? 0);
                diagnosticElements.resolves.textContent = String(metrics.totalResolves ?? 0);
                diagnosticElements.classes.textContent = String(metrics.processedClassCount ?? 0);
                diagnosticElements.queue.textContent = metrics.isProcessingQueue ? `${metrics.queueSize ?? 0} · processing` : String(metrics.queueSize ?? 0);
                diagnosticElements.cache.textContent = `${metrics.cacheHydrate || 'miss'} · ${metrics.cacheBytes || 0}B`;
                diagnosticElements.slowest.textContent = slowest;
                diagnosticElements.summary.textContent = `未解析 ${diagnosis.unresolvedClassCount ?? 0} · 失败规则 ${diagnosis.failedRuleCount ?? 0} · 冲突 ${diagnosis.conflictCount ?? 0} · 冲突追踪 ${diagnosis.conflictTracking ? '已开启' : '未开启'}`;
                const output = {
                    metrics: {
                        version: metrics.version,
                        insertedRuleCount: metrics.insertedRuleCount,
                        processedClassCount: metrics.processedClassCount,
                        queueSize: metrics.queueSize,
                        cacheHydrate: metrics.cacheHydrate,
                        cacheBytes: metrics.cacheBytes
                    },
                    debug: {
                        unresolvedClassCount: debug.unresolvedClassCount,
                        failedRuleCount: debug.failedRuleCount,
                        conflictCount: debug.conflictCount,
                        conflictTracking: debug.conflictTracking
                    },
                    diagnose: {
                        unresolvedClasses: diagnosis.unresolvedClasses?.slice(0, 8) || [],
                        failedRules: diagnosis.failedRules?.slice(0, 8) || []
                    }
                };
                if (diagnosticElements.outputHost) {
                    const escapedOutput = JSON.stringify(output, null, 2)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;');
                    diagnosticElements.outputHost.innerHTML = `<pre><code class="language-json text-xs leading-relaxed">${escapedOutput}</code></pre>`;
                    initCodeHighlighter({
                        selector: '#diagnostic-output-host pre code',
                        showLineNumbers: false,
                        langLabel: false
                    });
                }
            } catch (error) {
                diagnosticElements.summary.textContent = `诊断 API 读取失败：${error.message}`;
            }
        };

        if (refreshDiagnosticsBtn) refreshDiagnosticsBtn.addEventListener('click', () => readDiagnostics());
        if (trackConflictsBtn) trackConflictsBtn.addEventListener('click', () => {
            readDiagnostics({ track: true });
            trackConflictsBtn.disabled = true;
            trackConflictsBtn.textContent = '冲突追踪已开启';
        });
        readDiagnostics();
        ArchitectureDoc.diagnosticMonitor = setInterval(readDiagnostics, 2000);

        // 4. 动态安全白名单注入系统挂载
        const fireSafelistBtn = container.querySelector('#btn-fire-safelist');
        const fakeRichText = container.querySelector('#fake-richtext');
        const safelistStatus = container.querySelector('#safelist-status');

        // 我们准备在这个靶点上赋予的、极度夸张的类名字符串
        const payloadClasses = 'bg-[#8b5cf6] text-white p-6 shadow-[0_10px_30px_rgba(139,92,246,0.5)] border-4 border-dashed border-[#c4b5fd] rotate-3 hover:rotate-0 hover:scale-110 cursor-pointer transition-all';

        if (fireSafelistBtn && fakeRichText && window.JquanUI) {
            fireSafelistBtn.addEventListener('click', () => {
                
                safelistStatus.innerHTML = '<i class="ph ph-spinner animate-spin text-primary"></i> 正在注入 JIT...';
                
                // 🚀 调用光学魔法：强行把类名交给引擎白名单进行 JIT 编译并植入 CSSOM！
                window.JquanUI.addSafelist(payloadClasses);

                // 稍微延迟 100ms 模拟网络应用过程，然后给 DOM 挂上类名
                setTimeout(() => {
                    // 把类名扔给它！因为 JIT 已经预先编译好写入了，所以挂上去的瞬间毫无 FOUC (样式闪烁)
                    fakeRichText.className = `text-center font-bold text-xl rounded-2xl ${payloadClasses}`;
                    fakeRichText.innerText = 'System Initialized! ✨';
                    
                    safelistStatus.innerHTML = '<span class="text-emerald-500 font-bold"><i class="ph ph-check-circle"></i> Compiled & Injected</span>';
                    
                    // 按钮状态禁用
                    fireSafelistBtn.disabled = true;
                    fireSafelistBtn.classList.replace('bg-slate-800', 'bg-slate-300');
                    fireSafelistBtn.innerHTML = '已完成演示，请重置页面';
                }, 300);
            });
        }
    }

    static unmount() {
        if (ArchitectureDoc.cacheMonitor) {
            clearInterval(ArchitectureDoc.cacheMonitor);
            ArchitectureDoc.cacheMonitor = null;
        }
        if (ArchitectureDoc.diagnosticMonitor) {
            clearInterval(ArchitectureDoc.diagnosticMonitor);
            ArchitectureDoc.diagnosticMonitor = null;
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'JquanUI.addSafelist()', desc: 'JS API: 动态强行预编译类名白名单' },
            { class: 'JquanUI.clearCache()', desc: 'JS API: 清除 JIT 本地水合引擎的缓存' },
            { class: 'JquanUI.getMetrics()', desc: 'JS API: 读取低成本运行时性能快照' },
            { class: 'JquanUI.debug() / diagnose()', desc: 'JS API: 查看未解析类、失败规则与冲突明细' },
            { class: 'JquanUI.checkClasses()', desc: 'JS API: 按预算只读校验类名，区分当前解析与历史运行时状态' },
            { class: 'Time-Slicing', desc: '底层架构：requestIdleCallback 渲染切片原理' },
            { class: 'Warm Start (Hydration)', desc: '底层架构：缓存直接注水防 FOUC 机制' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'architecture'
        }));
    }
}
