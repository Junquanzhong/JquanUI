import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ModernCssDoc {
    static render() {
        return `
        <div class="container pb-10">
            <ul class="flex items-center gap-2 mb-6 text-sm text-slate-500">
                <li><span class="inline-flex items-center gap-1"><i class="ph ph-sparkle"></i>核心能力</span></li>
                <li class="text-slate-300">/</li>
                <li class="font-medium text-slate-800">现代 CSS 与迁移</li>
            </ul>

            <div class="mb-8 max-w-4xl">
                <h1 class="mb-2 text-3xl font-bold tracking-tight text-slate-800">现代 CSS 与迁移</h1>
                <p class="leading-relaxed text-slate-600">把浏览器近年的能力收进原子类：状态由原生属性驱动，安全区和语言由环境自动适配，主题令牌负责统一颜色，存量 CSS 则先审计再迁移。</p>
            </div>

            <section class="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                <header class="flex items-center justify-between gap-4 border-b border-primary/10 bg-white/60 px-6 py-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-flask text-xl text-primary"></i>
                        <h2 class="font-bold text-slate-800">现代能力实验室 Playground</h2>
                    </div>
                    <span class="hidden rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-flex">Interactive</span>
                </header>
                <div class="grid gap-6 p-6 md:p-8 lg:grid-cols-5">
                    <section class="space-y-5 lg:col-span-2">
                        <div>
                            <h3 class="mb-1 text-sm font-bold text-slate-800">状态与环境控制</h3>
                            <p class="text-sm leading-relaxed text-slate-600">点击按钮改变原生 <code class="inline-code">open</code>、<code class="inline-code">lang</code>、主题类和表单值；预览区只通过原子变体响应。</p>
                        </div>
                        <div class="grid gap-2 sm:grid-cols-2">
                            <button type="button" data-modern-action="details" class="rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/15">切换 details-open</button>
                            <button type="button" data-modern-action="language" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary">切换 :lang(en)</button>
                            <button type="button" data-modern-action="theme" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary">切换 .dark 主题</button>
                            <button type="button" data-modern-action="validity" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary">切换表单校验</button>
                        </div>
                        <div class="rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
                            <p><strong class="text-slate-700">当前状态：</strong><span id="modern-state-summary">details 已展开 · 中文 · 浅色 · 未填写</span></p>
                            <p class="mt-2">这类交互不需要页面 CSS，也不需要 JavaScript 拼接视觉规则。</p>
                        </div>
                    </section>
                    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-inner lg:col-span-3" id="modern-playground-preview">
                        <div class="space-y-4 rounded-lg bg-slate-50 p-4 transition-colors dark:bg-slate-900">
                            <div class="flex items-center justify-between gap-3">
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Native state preview</span>
                                <span id="modern-state-badge" class="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">open</span>
                            </div>
                            <details id="modern-details" class="group rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800" open>
                                <summary class="cursor-pointer list-none font-semibold text-slate-800 dark:text-white">details 原生展开状态</summary>
                                <p class="hidden mt-3 text-sm text-slate-600 details-open:block dark:text-slate-300">这段内容由 open 属性控制，状态样式由 <code class="inline-code">details-open:</code> 或 <code class="inline-code">group-open:</code> 生成。</p>
                            </details>
                            <div class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                                <p id="modern-language-copy" lang="zh-CN" class="text-xl font-bold text-slate-800 lang-en:text-lg dark:text-white">跨语言保持清晰层级</p>
                                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">同一组 class 可由 html lang 或局部 lang 属性驱动。</p>
                            </div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-200">必填字段
                                <input id="modern-validity-input" required placeholder="点击“切换表单校验”" class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none user-invalid:border-danger user-invalid:ring-2 user-invalid:ring-danger/20 user-valid:border-success dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                            </label>
                        </div>
                        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-600">
                            <span class="text-slate-400">class</span> = <code id="modern-live-code" class="text-primary">"details-open:block lang-en:text-lg dark:bg-slate-900 user-invalid:border-danger"</code>
                        </div>
                    </section>
                    <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-inner lg:col-span-5">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 class="font-bold text-slate-800">Dialog、Popover 与原生环境状态</h3>
                                <p class="mt-1 text-sm leading-relaxed text-slate-600">弹层由浏览器的 <code class="inline-code">showModal()</code>、<code class="inline-code">popover</code> 和 <code class="inline-code">inert</code> 状态驱动；环境变体则直接响应设备能力。</p>
                            </div>
                            <span id="modern-native-status" class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">等待操作</span>
                        </div>
                        <div class="grid gap-4 md:grid-cols-3">
                            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div class="mb-3 flex flex-wrap gap-2">
                                    <button type="button" data-modern-action="dialog-open" class="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">打开 Dialog</button>
                                    <button type="button" data-modern-action="popover-open" popovertarget="modern-popover" class="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20">切换 Popover</button>
                                </div>
                                <p class="text-xs leading-relaxed text-slate-500">使用 <code class="inline-code">modal:*</code>、<code class="inline-code">popover-open:*</code> 和 <code class="inline-code">starting:*</code>，无需手动追加视觉类。</p>
                            </div>
                            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <button type="button" data-modern-action="inert" class="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100">切换 inert 区域</button>
                                <div id="modern-inert-target" class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 transition-all inert:pointer-events-none inert:opacity-50 inert:grayscale">
                                    这段内容在 <code class="inline-code">inert</code> 时不可聚焦，并由 <code class="inline-code">inert:*</code> 降低视觉强调。
                                </div>
                            </div>
                            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div class="mb-2 flex flex-wrap gap-2 text-xs font-semibold">
                                    <span class="hidden rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 pointer-fine:inline-flex">pointer-fine</span>
                                    <span class="hidden rounded-full bg-amber-100 px-2 py-1 text-amber-700 pointer-coarse:inline-flex">pointer-coarse</span>
                                    <span class="hidden rounded-full bg-blue-100 px-2 py-1 text-blue-700 hover-hover:inline-flex">hover-hover</span>
                                    <span class="hidden rounded-full bg-slate-200 px-2 py-1 text-slate-600 hover-none:inline-flex">hover-none</span>
                                    <span class="rounded-full bg-primary/10 px-2 py-1 text-primary forced-colors:outline-w-2 forced-colors:outline-solid forced-colors:outline-primary">forced-colors</span>
                                </div>
                                <div class="flex items-center gap-2 text-xs text-slate-500">
                                    <span class="h-2.5 w-2.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none"></span>
                                    <span>motion-reduce 会关闭此动效</span>
                                </div>
                            </div>
                        </div>
                        <dialog id="modern-dialog" class="w-[min(90vw,28rem)] rounded-xl border border-slate-200 bg-white p-0 text-slate-800 opacity-0 shadow-2xl transition-opacity duration-300 starting:opacity-0 modal:opacity-100 backdrop:bg-slate-950/40">
                            <div class="space-y-4 p-6">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 class="font-bold">原生 Dialog</h4>
                                        <p class="mt-1 text-sm text-slate-500">当前规则由 <code class="inline-code">modal:opacity-100</code> 和 <code class="inline-code">starting:opacity-0</code> 驱动。</p>
                                    </div>
                                    <button type="button" data-modern-action="dialog-close" class="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="关闭 Dialog"><i class="ph ph-x"></i></button>
                                </div>
                                <button type="button" data-modern-action="dialog-close" class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">关闭</button>
                            </div>
                        </dialog>
                        <div id="modern-popover" popover class="w-[min(90vw,22rem)] rounded-xl border border-primary/20 bg-white p-5 text-slate-800 opacity-0 shadow-xl transition-opacity duration-300 starting:opacity-0 popover-open:opacity-100">
                            <div class="flex items-start gap-3">
                                <i class="ph ph-popover text-xl text-primary"></i>
                                <div>
                                    <h4 class="font-bold">原生 Popover</h4>
                                    <p class="mt-1 text-sm text-slate-500">浏览器切换 <code class="inline-code">:popover-open</code>，JquanUI 只负责映射状态变体。</p>
                                </div>
                            </div>
                        </div>
                        <pre><code class="language-html">&lt;dialog class="opacity-0 starting:opacity-0 modal:opacity-100"&gt;...&lt;/dialog&gt;
&lt;div popover class="opacity-0 starting:opacity-0 popover-open:opacity-100"&gt;...&lt;/div&gt;
&lt;section inert class="inert:pointer-events-none inert:opacity-50"&gt;...&lt;/section&gt;
&lt;span class="hidden pointer-fine:inline-flex hover-hover:inline-flex"&gt;设备能力&lt;/span&gt;</code></pre>
                    </section>
                </div>
            </section>

            <div class="mb-8 grid gap-6 lg:grid-cols-2">
                <section class="overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                    <header class="flex items-center gap-2 border-b border-primary/10 bg-white/60 px-6 py-4">
                        <i class="ph ph-toggle-left text-xl text-primary"></i>
                        <h2 class="font-bold text-slate-800">原生状态变体</h2>
                    </header>
                    <div class="space-y-5 p-6">
                        <p class="text-sm leading-relaxed text-slate-600">优先改变原生属性或状态，不在 JavaScript 里手动拼视觉类。下面的 details、dialog 和表单状态都由浏览器驱动。</p>
                        <div class="space-y-3">
                            <details class="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm" open>
                                <summary class="cursor-pointer list-none font-semibold text-slate-800">details-open: 只在展开时显示的内容</summary>
                                <p class="mt-3 text-sm text-slate-600">这段内容由原生 open 属性控制，使用 <code class="inline-code">details-open:block</code> 或 <code class="inline-code">group-open:</code> 响应状态。</p>
                            </details>
                            <label class="block text-sm font-medium text-slate-700">表单校验
                                <input required placeholder="必填字段" class="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 outline-none user-invalid:border-danger user-invalid:ring-2 user-invalid:ring-danger/20 user-valid:border-success">
                            </label>
                        </div>
                        <pre><code class="language-html">&lt;details class="group"&gt;
  &lt;summary&gt;打开说明&lt;/summary&gt;
  &lt;p class="details-open:block"&gt;展开后显示&lt;/p&gt;
&lt;/details&gt;
&lt;input required class="user-invalid:border-danger user-valid:border-success"&gt;</code></pre>
                    </div>
                </section>

                <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <i class="ph ph-device-mobile text-xl text-emerald-600"></i>
                        <h2 class="font-bold text-slate-800">Safe Area 与语言适配</h2>
                    </header>
                    <div class="space-y-5 p-6">
                        <p class="text-sm leading-relaxed text-slate-600">全屏移动界面用 safe 类避开刘海和底部手势区；多语言只添加必要的微调，不复制整套布局。</p>
                        <div class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-4 text-white before:absolute before:inset-0 before:bg-primary/10">
                            <div class="relative flex min-h-32 flex-col justify-between pb-safe-2 pt-safe-2">
                                <span class="text-xs text-slate-300">安全区演示</span>
                                <div>
                                    <p class="text-xl font-bold lang-en:text-lg">可适配的标题</p>
                                    <p class="mt-1 text-sm text-slate-300">中文与 English 都保持可读宽度</p>
                                </div>
                            </div>
                        </div>
                        <pre><code class="language-html">&lt;main class="pt-safe px-safe"&gt;
  &lt;h1 class="text-xl lang-en:text-lg"&gt;标题&lt;/h1&gt;
&lt;/main&gt;</code></pre>
                    </div>
                </section>
            </div>

            <div class="mb-8 grid gap-6 lg:grid-cols-2">
                <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4"><i class="ph ph-stack text-xl text-indigo-500"></i><h2 class="font-bold text-slate-800">层叠层与现代颜色</h2></header>
                    <div class="space-y-5 p-6">
                        <p class="text-sm leading-relaxed text-slate-600">新项目可以开启固定的 reset、theme、components、utilities 层顺序。颜色支持 OKLCH、Display-P3、<code class="inline-code">light-dark()</code> 和 <code class="inline-code">color-mix()</code>，品牌值应放进主题而不是散落在 HTML。</p>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="rounded-lg bg-[oklch(65%_0.2_250)] p-4 text-white shadow-lg">OKLCH</div>
                            <div class="rounded-lg bg-primary/10 p-4 text-primary ring-1 ring-primary/30">主题透明度</div>
                        </div>
                        <pre><code class="language-javascript">window.JQUAN_CONFIG = {
  cascadeLayers: true,
  theme: { extend: {
    colors: { brand: 'oklch(65% 0.2 250)' }
  }}
};</code></pre>
                    </div>
                </section>

                <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4"><i class="ph ph-arrows-in-line-vertical text-xl text-amber-500"></i><h2 class="font-bold text-slate-800">流体令牌</h2></header>
                    <div class="space-y-5 p-6">
                        <p class="text-sm leading-relaxed text-slate-600">重复使用的连续尺度配置到 <code class="inline-code">theme.extend.fluid</code>，让字号和留白在手机到桌面之间平滑变化。</p>
                        <div class="rounded-lg border border-amber-200 bg-amber-50 p-5">
                            <p class="text-fluid-display font-bold text-slate-900">Fluid display</p>
                            <p class="mt-2 text-sm text-slate-600">缩放窗口即可观察连续字号。</p>
                        </div>
                        <pre><code class="language-javascript">theme: { extend: { fluid: {
  spacing: { section: ['3rem', '6vw', '6rem'] },
  fontSize: { display: { min: '2.25rem', preferred: '6vw', max: '4.5rem', lineHeight: '1.05' } }
}}}
// HTML: class="py-fluid-section text-fluid-display"</code></pre>
                    </div>
                </section>
            </div>

            <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4"><i class="ph ph-file-magnifying-glass text-xl text-rose-500"></i><h2 class="font-bold text-slate-800">迁移审计：先报告，再删除 CSS</h2></header>
                <div class="grid gap-6 p-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                    <div>
                        <p class="mb-4 text-sm leading-relaxed text-slate-600"><code class="inline-code">jquan-migrate</code> 不会自动改写业务文件，它会把可直接迁移的语义值、需要主题化的任意值和必须人工检查的复杂规则分开。确认视觉回归后，再删除对应 CSS。暗色审计不会自动重解释历史颜色或改写模板；优先把候选迁移到 semantic 角色，再逐页验证。</p>
                        <div class="flex flex-wrap gap-2 text-xs font-medium"><span class="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">semantic：优先迁移</span><span class="rounded-md bg-amber-50 px-2 py-1 text-amber-700">arbitrary：先判断复用</span><span class="rounded-md bg-rose-50 px-2 py-1 text-rose-700">manual：人工检查</span></div>
                    </div>
                    <pre><code class="language-bash">npx jquan-migrate \
  --input ./css \
  --format markdown \
  --output ./reports/jquan-migration.md \
  --config ./jquan.config.cjs

# 迁移后检查动态类名与生成规则
npx jquan-extract --doctor

# 暗色候选只读审计：硬编码颜色、阴影、语义角色、缺少 dark:
npx jquan-migrate --source ./src --dark-audit --format markdown --output ./reports/dark-audit.md
npx jquan-migrate --source ./src --dark-audit --max-dark-missing 0 --output ./reports/dark-audit.json</code></pre>
                </div>
                <div class="px-6 pb-6 text-sm leading-relaxed text-slate-600">
                    <p>暗色报告按每文件唯一 class 字符串计数并记录首次行号；无法定位的绑定行号为 null。配对必须具有相同属性、important 和有序的非 dark 变体链，支持变体组和任意颜色。dark:hover:bg-* 不会掩盖普通 bg-*；报告不展开 shortcut、不执行动态拼接，也不代表最终对比度。</p>
                    <p class="mt-2">--dark-audit 必须配 --source；--max-dark-missing 为非负整数。超过候选阈值退出 2，参数错误或未找到源文件退出 1。--config 的 theme.semantic 可补充自定义角色名。API 使用 migrate.auditDarkFiles(inputs, { root, config }) 或 auditDarkSource(source, { source, config })；同步返回 summary、candidates 和文件上下文，无需销毁。</p>
                    <pre class="mt-4"><code class="language-javascript">const { migrate } = require('jquanui');
const report = migrate.auditCssFiles(['./css'], { config });
report.darkAudit = migrate.auditDarkFiles(['./src'], { config });
console.log(migrate.formatMigrationReport(report));</code></pre>
                </div>
            </section>

            <section class="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4"><i class="ph ph-crosshair text-xl text-cyan-600"></i><h2 class="font-bold text-slate-800">Anchor Positioning 与 View Transitions</h2></header>
                <div class="grid gap-6 p-6 lg:grid-cols-2">
                    <div class="space-y-4">
                        <p class="text-sm leading-relaxed text-slate-600">锚点定位使用语义类建立参照物和候选区域，不需要为每个浮层重复写定位 CSS；`anchor-scope-none`、`position-try-order-most-width` 与 `position-visibility-no-overflow` 可表达范围、回退优先级和溢出策略。任意值只用于项目确实需要的自定义锚点名或候选规则。</p>
                        <div class="relative min-h-32 rounded-lg border border-cyan-200 bg-cyan-50 p-5">
                            <button class="anchor-name-[--demo-anchor] inline-flex rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white">Anchor</button>
                            <div class="position-fixed position-anchor-[--demo-anchor] position-area-top-span-right rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-cyan-800 shadow-md">Anchored panel</div>
                        </div>
                        <pre><code class="language-html">&lt;button class="anchor-name-[--tooltip]"&gt;Anchor&lt;/button&gt;
&lt;div class="position-fixed position-anchor-[--tooltip] position-area-top"&gt;
  Tooltip
&lt;/div&gt;</code></pre>
                    </div>
                    <div class="space-y-4">
                        <p class="text-sm leading-relaxed text-slate-600">页面级过渡用 <code class="inline-code">view-transition-name-*</code> 标识共享元素，使用 <code class="inline-code">view-transition-group-*</code> 与 <code class="inline-code">view-transition-types-*</code> 表达原生过渡语义，动画降级配合 <code class="inline-code">motion-reduce:</code>。</p>
                        <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
                            <div class="view-transition-name-card view-transition-group-nearest rounded-lg bg-white p-4 shadow-sm motion-reduce:transition-none">可共享的页面卡片</div>
                        </div>
                        <pre><code class="language-html">&lt;article class="view-transition-name-card view-transition-group-nearest"&gt;
  内容
&lt;/article&gt;

&lt;html class="view-transition-types-[--route]"&gt;</code></pre>
                    </div>
                </div>
            </section>
        </div>`;
    }

    static mount(container) {
        initCodeHighlighter({ showLineNumbers: true, langLabel: true });

        const details = container.querySelector('#modern-details');
        const languageCopy = container.querySelector('#modern-language-copy');
        const validityInput = container.querySelector('#modern-validity-input');
        const preview = container.querySelector('#modern-playground-preview');
        const summary = container.querySelector('#modern-state-summary');
        const badge = container.querySelector('#modern-state-badge');
        const liveCode = container.querySelector('#modern-live-code');
        const dialog = container.querySelector('#modern-dialog');
        const popover = container.querySelector('#modern-popover');
        const inertTarget = container.querySelector('#modern-inert-target');
        const nativeStatus = container.querySelector('#modern-native-status');
        const actions = container.querySelectorAll('[data-modern-action]');
        if (!details || !languageCopy || !validityInput || !preview || !summary || !badge || !liveCode) return;

        const setNativeStatus = (message, tone = 'neutral') => {
            if (!nativeStatus) return;
            nativeStatus.textContent = message;
            nativeStatus.className = tone === 'active'
                ? 'rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success'
                : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500';
        };

        const update = () => {
            const isEnglish = languageCopy.getAttribute('lang') === 'en';
            const isDark = preview.classList.contains('dark');
            const isValid = validityInput.value.trim() !== '';
            const isOpen = details.open;
            badge.textContent = isOpen ? 'open' : 'closed';
            badge.className = isOpen
                ? 'rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success'
                : 'rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-500';
            summary.textContent = `${isOpen ? 'details 已展开' : 'details 已折叠'} · ${isEnglish ? 'English' : '中文'} · ${isDark ? '深色' : '浅色'} · ${isValid ? '已填写' : '未填写'}`;
            liveCode.textContent = `"details-open:block text-xl${isEnglish ? ' lang-en:text-lg' : ''} dark:bg-slate-900 ${isValid ? 'user-valid:border-success' : 'user-invalid:border-danger'}"`;
        };

        actions.forEach(action => action.addEventListener('click', () => {
            switch (action.dataset.modernAction) {
                case 'details':
                    details.open = !details.open;
                    break;
                case 'language':
                    languageCopy.setAttribute('lang', languageCopy.getAttribute('lang') === 'en' ? 'zh-CN' : 'en');
                    break;
                case 'theme':
                    preview.classList.toggle('dark');
                    break;
                case 'validity':
                    validityInput.value = validityInput.value.trim() ? '' : 'JquanUI';
                    validityInput.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                case 'dialog-open':
                    if (dialog && typeof dialog.showModal === 'function') {
                        dialog.showModal();
                        setNativeStatus('Dialog 已打开', 'active');
                    } else {
                        setNativeStatus('当前浏览器不支持 Dialog');
                    }
                    break;
                case 'dialog-close':
                    if (dialog && dialog.open) dialog.close();
                    setNativeStatus('Dialog 已关闭');
                    break;
                case 'inert':
                    if (inertTarget) {
                        inertTarget.toggleAttribute('inert');
                        setNativeStatus(inertTarget.hasAttribute('inert') ? 'inert 已启用' : 'inert 已关闭', inertTarget.hasAttribute('inert') ? 'active' : 'neutral');
                    }
                    break;
            }
            update();
        }));
        details.addEventListener('toggle', update);
        validityInput.addEventListener('input', update);
        if (dialog) dialog.addEventListener('close', () => setNativeStatus('Dialog 已关闭'));
        if (popover) popover.addEventListener('toggle', event => setNativeStatus(event.newState === 'open' ? 'Popover 已打开' : 'Popover 已关闭', event.newState === 'open' ? 'active' : 'neutral'));
        update();
    }

    static async onSearch(keyword) {
        const items = [
            ['open:', '原生 details/dialog/popover 状态变体'],
            ['modal: / popover-open:', 'Dialog 与 Popover 原生弹层状态'],
            ['starting: / inert:', '进入动画与不可交互状态'],
            ['pointer-fine / hover-hover', '设备输入能力环境变体'],
            ['p-safe / pb-safe', '移动端 Safe Area 安全区'],
            ['cascadeLayers', '启用固定层叠层顺序'],
            ['text-fluid-display', '流体字号令牌'],
            ['jquan-migrate', '存量 CSS 迁移审计工具'],
            ['position-area / view-transition', '锚点定位与页面过渡']
        ];
        return items.filter(([name, desc]) => `${name} ${desc}`.toLowerCase().includes(keyword.toLowerCase())).map(([title, desc]) => ({ title, desc, actionValue: 'modern-css' }));
    }
}
