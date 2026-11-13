import { initCodeHighlighter } from '../js/code-block.mjs';

/**
 * JQ Build Toolchain: 构建时提取、SSR、Vite/PostCSS 与 Design Tokens 文档。
 * 浏览器演示只切换真实可复制的构建入口，不伪造 Node 构建结果。
 */
export default class BuildToolchainDoc {
    static cleanup = [];

    static render() {
        return `
        <div class="container pb-10">
            <ul class="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <li><span class="inline-flex items-center gap-1"><i class="ph ph-cpu"></i>核心能力</span></li>
                <li class="text-slate-300">/</li>
                <li class="font-medium text-slate-800">构建工具链</li>
            </ul>

            <div class="mb-8 max-w-4xl">
                <h1 class="mb-2 text-3xl font-bold tracking-tight text-slate-800">构建工具链</h1>
                <p class="leading-relaxed text-slate-600">开发阶段可以直接加载 Core，生产阶段则把已知类名在构建期提取成 CSS，再按需要注入 SSR 关键 CSS。CLI、Vite、PostCSS、SSR 和 W3C Design Tokens 共用同一套解析与排序规则。</p>
                <p class="mt-3 text-sm leading-relaxed text-slate-600">聚合构建使用 <code>npm run build:bundles</code>，一致性校验使用 <code>npm run check:bundles</code>。Full 的 Core 与组件均使用固定版本 Terser 紧凑格式，<code>compress: false</code>、<code>mangle: false</code>，保留许可证注释；不做压缩变换或标识符重命名。独立 Core 源码保留开发注释，压缩 Core 继续由 <code>npm run build:core</code> 生成；构建后按 Core/min/Full 分别验证行为。</p>
            </div>

            <section class="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                <header class="flex items-center justify-between gap-4 border-b border-primary/10 bg-white/60 px-6 py-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-package text-xl text-primary"></i>
                        <h2 class="font-bold text-slate-800">生产构建实验室 Playground</h2>
                    </div>
                    <span class="hidden rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-flex">Interactive</span>
                </header>
                <div class="grid gap-6 p-6 md:p-8 lg:grid-cols-5">
                    <section class="space-y-5 lg:col-span-2">
                        <div>
                            <h3 class="mb-1 text-sm font-bold text-slate-800">选择构建入口</h3>
                            <p class="text-sm leading-relaxed text-slate-600">每个按钮对应真实公开 API 或 CLI 命令。这里不在浏览器里冒充 Node 构建，而是让你先看到正确入口、输出物和适用场景。</p>
                        </div>
                        <div class="grid gap-2 sm:grid-cols-2">
                            <button type="button" data-build-pipeline="cli" class="rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/15">CLI 静态提取</button>
                            <button type="button" data-build-pipeline="vite" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary">Vite / PostCSS</button>
                            <button type="button" data-build-pipeline="ssr" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary">SSR 关键 CSS</button>
                            <button type="button" data-build-pipeline="tokens" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary">Design Tokens</button>
                        </div>
                        <div class="rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
                            <p><strong class="text-slate-700">当前入口：</strong><span id="build-pipeline-label">CLI 静态提取</span></p>
                            <p class="mt-2"><strong class="text-slate-700">输出：</strong><span id="build-pipeline-output">dist/jquan.css + dist/jquan.report.json</span></p>
                        </div>
                        <button type="button" id="build-pipeline-confirm" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 active:scale-95">
                            <i class="ph ph-check-circle"></i>确认查看这条链路
                        </button>
                        <p id="build-pipeline-status" class="min-h-5 text-xs leading-relaxed text-slate-400">等待选择构建入口。</p>
                    </section>

                    <section class="space-y-4 lg:col-span-3">
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <h3 class="font-bold text-slate-800">可复制的真实配置</h3>
                                <p id="build-pipeline-description" class="mt-1 text-sm text-slate-500">扫描源码中的完整类名，并输出可部署的 CSS。</p>
                            </div>
                            <span id="build-pipeline-badge" class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">CLI</span>
                        </div>
                        <div id="build-toolchain-code-host">
                            <pre><code class="language-bash">npx jquan-extract --input ./src --output ./dist/jquan.css --report ./dist/jquan.report.json --fail-on-warn</code></pre>
                        </div>
                        <div class="grid gap-3 sm:grid-cols-3">
                            <div class="rounded-lg border border-slate-200 bg-white p-4">
                                <div class="text-xs font-bold uppercase tracking-wider text-slate-400">规则来源</div>
                                <div id="build-rule-source" class="mt-2 text-sm font-semibold text-slate-700">源码类名</div>
                            </div>
                            <div class="rounded-lg border border-slate-200 bg-white p-4">
                                <div class="text-xs font-bold uppercase tracking-wider text-slate-400">首屏策略</div>
                                <div id="build-first-paint" class="mt-2 text-sm font-semibold text-slate-700">静态 CSS</div>
                            </div>
                            <div class="rounded-lg border border-slate-200 bg-white p-4">
                                <div class="text-xs font-bold uppercase tracking-wider text-slate-400">运行时角色</div>
                                <div id="build-runtime-role" class="mt-2 text-sm font-semibold text-slate-700">动态类兜底</div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>

            <div class="mb-8 grid gap-6 lg:grid-cols-2">
                <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <i class="ph ph-terminal-window text-xl text-primary"></i>
                        <h2 class="font-bold text-slate-800">CLI 与 Vite / PostCSS</h2>
                    </header>
                    <div class="space-y-5 p-6">
                        <p class="text-sm leading-relaxed text-slate-600"><code class="inline-code">jquan-extract</code> 适合静态站、CI 和一次性产物；Vite 与 PostCSS 适合把同一套提取流程接入现有开发服务器。需要拆分 reset/theme 与 utilities 时，可启用 <code class="inline-code">split</code> 并读取 <code class="inline-code">baselineCss</code>、<code class="inline-code">utilityCss</code>。</p>
                        <pre><code class="language-javascript">import { vitePlugin } from 'jquanui/vite';

export default {
  plugins: [vitePlugin({
    input: ['index.html', 'src'],
    split: true,
    baselineOutput: 'assets/jquan.base.css',
    utilitiesOutput: 'assets/jquan.utilities.css'
  })]
};</code></pre>
                        <pre><code class="language-javascript">const { postcssPlugin } = require('jquanui/postcss');

module.exports = {
  plugins: [postcssPlugin({
    input: ['index.html', 'src'],
    output: 'dist/jquan.css'
  })]
};</code></pre>
                    </div>
                </section>

                <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <i class="ph ph-browser text-xl text-emerald-600"></i>
                        <h2 class="font-bold text-slate-800">SSR 与首屏关键 CSS</h2>
                    </header>
                    <div class="space-y-5 p-6">
                        <p class="text-sm leading-relaxed text-slate-600">服务端先渲染 HTML，再从本次 HTML 使用到的完整类名提取关键 CSS。结果包含 <code class="inline-code">html</code>、<code class="inline-code">css</code>、<code class="inline-code">styleTag</code> 和 <code class="inline-code">classes</code>，可以直接注入文档 head。</p>
                        <pre><code class="language-javascript">const { renderCriticalCss, injectCriticalCss } = require('jquanui');

const critical = renderCriticalCss(
  '&lt;main class="container dark:bg-slate-900 p-6"&gt;CRM&lt;/main&gt;',
  { minify: true }
);

const html = injectCriticalCss(
  '&lt;!doctype html&gt;&lt;html&gt;&lt;head&gt;&lt;/head&gt;&lt;body&gt;...&lt;/body&gt;&lt;/html&gt;',
  critical,
  { nonce: cspNonce }
);</code></pre>
                        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-800">
                            <strong>适用原则：</strong>SSR/SEO 页面把关键 CSS 内联；完整静态 CSS 仍作为缓存资源加载；动态类继续交给运行时 Core 或 safelist。
                        </div>
                    </div>
                </section>
            </div>

            <section class="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <header class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <i class="ph ph-swatches text-xl text-indigo-500"></i>
                    <h2 class="font-bold text-slate-800">W3C Design Tokens 双向桥接</h2>
                </header>
                <div class="grid gap-6 p-6 md:p-8 lg:grid-cols-2">
                    <div class="space-y-4">
                        <p class="text-sm leading-relaxed text-slate-600">把设计工具输出的 <code class="inline-code">design.tokens.json</code> 导入 JquanUI 配置，也可以把现有主题导出为标准 Token 文件。颜色、间距、圆角、字体和 semantic 令牌保持在同一条配置链路里。</p>
                        <pre><code class="language-bash">npx jquan-tokens import \
  --input ./design.tokens.json \
  --output ./jquan.config.json

npx jquan-tokens export \
  --input ./jquan.config.json \
  --output ./design.tokens.json</code></pre>
                    </div>
                    <div class="space-y-4">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div class="mb-3 flex items-center justify-between gap-3">
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">示例令牌</span>
                                <span id="tokens-status" class="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">W3C JSON</span>
                            </div>
                            <pre class="mb-0"><code class="language-json">{
  "color": {
    "primary": { "$type": "color", "$value": "#6366f1" },
    "surface": { "$type": "color", "$value": "#ffffff" }
  },
  "spacing": {
    "section": { "$type": "dimension", "$value": "3rem" }
  }
}</code></pre>
                        </div>
                        <button type="button" id="tokens-toggle" class="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100 active:scale-95">
                            <i class="ph ph-arrows-left-right"></i>切换导入 / 导出说明
                        </button>
                        <p id="tokens-feedback" class="text-xs leading-relaxed text-slate-500">导入会生成 JquanUI 配置；导出会把主题令牌整理成 W3C Tokens JSON。</p>
                    </div>
                </div>
            </section>

            <section class="overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                <header class="flex items-center gap-2 border-b border-primary/10 bg-white/60 px-6 py-4">
                    <i class="ph ph-list-checks text-xl text-primary"></i>
                    <h2 class="font-bold text-slate-800">生产落地检查清单</h2>
                </header>
                <div class="grid gap-3 p-6 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="rounded-lg border border-primary/10 bg-white p-4"><strong class="text-slate-800">1. 提取</strong><p class="mt-1 leading-relaxed">扫描真实源码入口，不把动态拼接的无界前缀当成静态类名。</p></div>
                    <div class="rounded-lg border border-primary/10 bg-white p-4"><strong class="text-slate-800">2. 诊断</strong><p class="mt-1 leading-relaxed">读取 report，处理 unresolved 与 warning，再进入视觉回归。</p></div>
                    <div class="rounded-lg border border-primary/10 bg-white p-4"><strong class="text-slate-800">3. 首屏</strong><p class="mt-1 leading-relaxed">SSR 页面注入 critical CSS，完整 CSS 作为可缓存资源加载。</p></div>
                    <div class="rounded-lg border border-primary/10 bg-white p-4"><strong class="text-slate-800">4. 兜底</strong><p class="mt-1 leading-relaxed">异步路由、富文本和运行时类名使用 safelist 或 Core compile/prefetch。</p></div>
                </div>
            </section>
        </div>
        `;
    }

    static mount(container) {
        this.unmount();
        const codeHost = container.querySelector('#build-toolchain-code-host');
        const pipelineLabel = container.querySelector('#build-pipeline-label');
        const pipelineOutput = container.querySelector('#build-pipeline-output');
        const pipelineDescription = container.querySelector('#build-pipeline-description');
        const pipelineBadge = container.querySelector('#build-pipeline-badge');
        const ruleSource = container.querySelector('#build-rule-source');
        const firstPaint = container.querySelector('#build-first-paint');
        const runtimeRole = container.querySelector('#build-runtime-role');
        const status = container.querySelector('#build-pipeline-status');
        const confirmButton = container.querySelector('#build-pipeline-confirm');
        const tokensStatus = container.querySelector('#tokens-status');
        const tokensFeedback = container.querySelector('#tokens-feedback');
        const tokensToggle = container.querySelector('#tokens-toggle');
        if (!codeHost || !pipelineLabel || !pipelineOutput || !pipelineDescription || !pipelineBadge || !ruleSource || !firstPaint || !runtimeRole || !status || !confirmButton) return;

        const pipelines = {
            cli: {
                label: 'CLI 静态提取',
                badge: 'CLI',
                output: 'dist/jquan.css + dist/jquan.report.json',
                description: '扫描源码中的完整类名，并输出可部署的 CSS。',
                source: 'HTML / JS / Vue / Svelte',
                paint: '静态 CSS',
                runtime: '动态类兜底',
                lang: 'bash',
                code: 'npx jquan-extract --input ./src --output ./dist/jquan.css --report ./dist/jquan.report.json --fail-on-warn'
            },
            vite: {
                label: 'Vite / PostCSS',
                badge: 'VITE',
                output: 'assets/jquan.base.css + assets/jquan.utilities.css',
                description: '把提取流程接入开发服务器，并让构建产物参与 HMR 与部署。',
                source: 'Vite / PostCSS 输入',
                paint: '构建 CSS',
                runtime: 'Core 监听动态类',
                lang: 'javascript',
                code: "import { vitePlugin } from 'jquanui/vite';\n\nexport default {\n  plugins: [vitePlugin({\n    input: ['index.html', 'src'],\n    split: true,\n    baselineOutput: 'assets/jquan.base.css',\n    utilitiesOutput: 'assets/jquan.utilities.css'\n  })]\n};"
            },
            ssr: {
                label: 'SSR 关键 CSS',
                badge: 'SSR',
                output: 'styleTag + html + css',
                description: '从本次服务端渲染结果提取首屏实际使用到的类，并生成 CSP 兼容的 styleTag。',
                source: 'renderToString 输出',
                paint: '关键 CSS 内联',
                runtime: '异步内容兜底',
                lang: 'javascript',
                code: "const { renderCriticalCss, injectCriticalCss } = require('jquanui');\n\nconst critical = renderCriticalCss(\n  '<main class=\"container p-6 dark:bg-slate-900\">CRM</main>',\n  { minify: true }\n);\n\nconst html = injectCriticalCss(documentHtml, critical, { nonce: cspNonce });"
            },
            tokens: {
                label: 'Design Tokens',
                badge: 'TOKENS',
                output: 'jquan.config.json ↔ design.tokens.json',
                description: '在设计工具 Token 文件与 JquanUI 主题配置之间双向转换。',
                source: 'W3C Tokens JSON',
                paint: '主题令牌',
                runtime: '复用主题配置',
                lang: 'bash',
                code: 'npx jquan-tokens import --input ./design.tokens.json --output ./jquan.config.json\n\nnpx jquan-tokens export --input ./jquan.config.json --output ./design.tokens.json'
            }
        };

        let active = 'cli';
        let tokensMode = 'import';

        const renderCode = () => {
            const item = pipelines[active];
            codeHost.innerHTML = `<pre><code class="language-${item.lang}">${item.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
            initCodeHighlighter({ selector: '#build-toolchain-code-host pre code', showLineNumbers: true, langLabel: true });
        };

        const update = () => {
            const item = pipelines[active];
            pipelineLabel.textContent = item.label;
            pipelineOutput.textContent = item.output;
            pipelineDescription.textContent = item.description;
            pipelineBadge.textContent = item.badge;
            ruleSource.textContent = item.source;
            firstPaint.textContent = item.paint;
            runtimeRole.textContent = item.runtime;
            container.querySelectorAll('[data-build-pipeline]').forEach(button => {
                const isActive = button.dataset.buildPipeline === active;
                button.className = isActive
                    ? 'rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/15'
                    : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary';
            });
            renderCode();
        };

        container.querySelectorAll('[data-build-pipeline]').forEach(button => {
            const handler = () => {
                active = button.dataset.buildPipeline;
                status.textContent = `${pipelines[active].label} 已选中，点击确认按钮查看这条生产链路。`;
                update();
            };
            button.addEventListener('click', handler);
            this.cleanup.push(() => button.removeEventListener('click', handler));
        });

        const confirmHandler = () => {
            const item = pipelines[active];
            status.textContent = `${item.label} 示例已确认：可复制代码已刷新；实际构建请在 Node/Vite/PostCSS/SSR 环境执行。`;
            status.className = 'min-h-5 text-xs leading-relaxed text-success';
        };
        confirmButton.addEventListener('click', confirmHandler);
        this.cleanup.push(() => confirmButton.removeEventListener('click', confirmHandler));

        if (tokensToggle && tokensStatus && tokensFeedback) {
            const tokenHandler = () => {
                tokensMode = tokensMode === 'import' ? 'export' : 'import';
                const isImport = tokensMode === 'import';
                tokensStatus.textContent = isImport ? '导入模式' : '导出模式';
                tokensStatus.className = isImport
                    ? 'rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700'
                    : 'rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700';
                tokensFeedback.textContent = isImport
                    ? '导入会把 W3C Design Tokens 转换为 JquanUI 主题配置，可继续交给 Core 或构建提取。'
                    : '导出会把主题配置整理为 W3C Tokens JSON，方便交给设计工具或其他系统继续使用。';
            };
            tokensToggle.addEventListener('click', tokenHandler);
            this.cleanup.push(() => tokensToggle.removeEventListener('click', tokenHandler));
        }

        update();
    }

    static unmount() {
        this.cleanup.forEach(dispose => dispose());
        this.cleanup = [];
    }

    static async onSearch(keyword) {
        const items = [
            ['jquan-extract', 'CLI 静态提取与 report'],
            ['vitePlugin()', 'Vite 构建时提取'],
            ['postcssPlugin()', 'PostCSS 构建时提取'],
            ['renderCriticalCss()', 'SSR 首屏关键 CSS'],
            ['createReactSSRAdapter()', 'React SSR 适配器'],
            ['jquan-tokens', 'W3C Design Tokens 双向桥接'],
            ['baselineCss / utilityCss', '拆分基础层与工具层']
        ];
        return items
            .filter(([name, desc]) => `${name} ${desc}`.toLowerCase().includes(keyword.toLowerCase()))
            .map(([title, desc]) => ({ title, desc, actionValue: 'build-toolchain' }));
    }
}
