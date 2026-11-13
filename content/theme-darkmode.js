// 🚀 Jquan Optimized: 主题与暗黑模式文档 (theme-darkmode.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class ThemeModeDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-palette"></i>设计系统</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">主题与暗黑模式</li>
            </ul>

            <section class="mb-8 rounded-xl border border-slate-200 bg-white p-6">
                <h2 class="mb-3 text-xl font-bold text-slate-800">普通设计令牌与配置诊断</h2>
                <p class="mb-4 text-sm leading-relaxed text-slate-600">在 Core 前设置 JQUAN_CONFIG；npm 提取器使用同一份 config。theme 与 theme.extend 支持 borderRadius、boxShadow、fontSize、fontFamily、spacing、breakpoints 和 containers。它们合并内置档位，extend 的同名项覆盖 theme；radius 是 borderRadius 的兼容别名，同层 borderRadius 优先。无需组件或额外依赖。</p>
                <pre><code class="language-javascript">window.JQUAN_CONFIG = {
  theme: { extend: {
    borderRadius: { DEFAULT: '6px', card: '18px' },
    boxShadow: { soft: '0 16px 40px rgba(86,103,214,0.12)' },
    fontSize: {
      headline: ['37px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: 650 }],
      caption: '13px'
    }
  } }
};
// HTML: rounded-card shadow-soft text-headline
// 局部圆角/变体：rounded-t-card、rounded-ss-card、md:rounded-card、hover:shadow-soft</code></pre>
                <div class="mt-4 overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-600">
                        <thead><tr><th class="p-2">参数</th><th class="p-2">值 / 类名 / 默认行为</th></tr></thead>
                        <tbody>
                            <tr><td class="p-2">borderRadius / radius</td><td class="p-2">名称 → 非空 CSS 字符串；生成 rounded-* 及方向/逻辑圆角；DEFAULT 对应 rounded。</td></tr>
                            <tr><td class="p-2">boxShadow</td><td class="p-2">名称 → 非空 CSS 字符串（可含逗号多重阴影）；生成 shadow-*；DEFAULT 对应 shadow，保留 ring 组合。固定颜色不会被 shadow-color 自动改写。</td></tr>
                            <tr><td class="p-2">fontSize</td><td class="p-2">字符串仅设置字号；[字号, 行高] 或 [字号, {lineHeight, letterSpacing, fontWeight}] 生成 text-*。字符串覆盖内置档位时不保留原行高；未给出的选项不输出。</td></tr>
                            <tr><td class="p-2">命名限制</td><td class="p-2">名称以字母/数字开头，后续字母、数字、下划线或连字符；禁止原型键。圆角方向名与 shadow 的 color 保留；字号 DEFAULT / fluid-* 保留，改 text-base 用 base。避免与颜色令牌重名。</td></tr>
                            <tr><td class="p-2">覆盖顺序</td><td class="p-2">内置 → theme → theme.extend → 显式 customUtilities → shortcuts / plugins。主题配置不修改传入对象，冻结配置也可用。</td></tr>
                        </tbody>
                    </table>
                </div>
                <h3 class="mb-2 mt-5 font-semibold text-slate-800">诊断返回与限制</h3>
                <pre><code class="language-javascript">console.table(JquanUI.debug().configWarnings);
// [{ path: 'theme.extend.colors.bad', code: 'invalid-value', message: '...' }]
// 也可以 JquanUI.diagnose().configWarnings
// Node: extractFromSource(html, { config }).report.configWarnings</code></pre>
                <p class="mt-3 text-sm leading-relaxed text-slate-600">configWarnings 返回独立数组，字段为 path / code / message；code 为 unknown-key、invalid-type、invalid-value 或 invalid-name。theme/extend 未知键、普通令牌类型/结构异常和非法 fontSize 选项会被记录并跳过，其他有效项继续初始化。颜色支持字符串或一层色阶，非法 null / 数组、错误 HEX、非字符串字体列表会产生诊断；semantic 支持字符串或完整 light/dark 对。校验不等于完整 CSS 属性语义校验；CSS 变量及浏览器新语法仍由 CSSOM 处理。根级组件/插件扩展键透传，不做全生态 schema 校验，也不逐类 console.warn。</p>
                <p class="mt-3 text-sm leading-relaxed text-slate-600">提取报告 warnings 总数包含 configWarnings；doctor 输出路径诊断，配置错误使 doctor.ok=false。CLI --fail-on-warn、Vite/PostCSS failOnWarn 同样包含配置警告；未开启时保留报告并继续输出有效 CSS。普通 resolve 查询保持只读。配置初次加载或受支持的首次晚赋时生效，任意深层修改不是热更新 API；日常换肤仍用 dark/light 或 setTheme。无额外监听或销毁步骤。缓存格式已更新，旧格式重编译，新格式可正常热启动。完整最小页面见 examples/core-config-tokens.html，回归运行 npm run check:core-config。</p>
            </section>

            <!-- 模块 1：语义化系统 (Semantic Colors Sandbox) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-yin-yang text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">语义化色彩提权 (Semantic Colors)</cite>
                    </div>
                    <span class="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded shadow-sm">Dark Mode Auto-Mapping</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        在 JquanUI 中，通过配置 <code class="text-xs font-bold text-slate-700">semantic</code> 字典，引擎会在底层自动完成明暗映射。你只需要在 HTML 中写下 <code class="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.5 rounded font-bold">bg-surface text-main</code>，剩下的脏活累活，引擎瞬间帮你搞定。
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：配置代码 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-file-code"></i> 配置入口 (jquan.config.js)
                            </label>
                            <div class="relative h-[280px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
window.JQUAN_CONFIG = {
    theme: {
        semantic: {
            // 支持传入 Tailwind 颜色键，或直接传 HEX
            primary: { light: 'blue-500', dark: 'blue-400' },
            surface: { light: 'white', dark: '#0f172a' },
            panel: { light: 'slate-50', dark: '#1e293b' },
            main: { light: 'slate-800', dark: 'slate-100' },
            muted: { light: 'slate-500', dark: 'slate-400' },
            border: { light: 'slate-200', dark: 'slate-700' }
        }
    }
};
                                </code></pre>
                            </div>
                        </div>

                        <!-- 右侧：语义化组件预览 -->
                        <div class="flex flex-col space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <i class="ph ph-eye"></i> 渲染输出 (Render Output)
                                </label>
                                <!-- 局部暗黑切换开关 -->
                                <button id="toggle-dark-btn" class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors">
                                    <i class="ph ph-moon-stars text-base"></i> 切换局部暗黑
                                </button>
                            </div>

                            <!-- 预览靶点 (这里的类名使用了 Arbitrary Variables 兜底，确保在文档站没配 config 时依然惊艳) -->
                            <div id="semantic-preview-box" class="flex-1 flex flex-col items-center justify-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden p-8 transition-colors duration-300">
                                
                                <!-- 演示卡片 (采用极致干净的原生语义化类名) -->
                                <div class="w-full max-w-sm rounded-2xl shadow-xl transition-all duration-500 border overflow-hidden bg-surface border-border">
                                    
                                    <!-- 卡片头部 -->
                                    <div class="p-6 border-b transition-colors duration-500 border-border bg-panel flex justify-between items-start">
                                        <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 bg-primary shadow-lg shadow-primary/30">
                                            <i class="ph ph-rocket-launch text-white text-2xl"></i>
                                        </div>
                                        <span class="text-xs font-bold px-2 py-1 rounded-full transition-colors duration-500 bg-primary/10 text-primary">
                                            Semantic Engine
                                        </span>
                                    </div>
                                    
                                    <!-- 卡片内容 -->
                                    <div class="p-6 space-y-4">
                                        <h3 class="text-lg font-bold transition-colors duration-500 text-main">
                                            零延迟映射
                                        </h3>
                                        <p class="text-sm leading-relaxed transition-colors duration-500 text-muted">
                                            当你切换模式时，并非去替换 DOM 上的 class，而是底层的 CSS 变量完成重新赋值。浏览器按 CSS 变量层叠重新计算样式，已有原子规则保持不变。
                                        </p>
                                        <button class="w-full py-3 rounded-lg font-bold text-white transition-all duration-500 hover:opacity-90 active:scale-95 bg-primary shadow-md shadow-primary/20">
                                            立即体验
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：0ms 动态主题引擎 (The Variables Switcher) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-swatches text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">0ms 动态主题引擎 (Theme Switcher)</cite>
                    </div>
                    <span id="theme-status" class="text-xs font-mono text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded shadow-sm">Theme API · default</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
                        如果你正在开发 SaaS 或多租户应用，提供多套耀眼的主题是必备的杀手锏。<br/>
                        调用 <code class="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">JquanUI.setTheme('name')</code>，引擎只替换主题变量样式表，不刷新页面，也不会重新生成已经缓存的原子规则。局部 <code class="inline-code">.dark</code> 仍可独立控制组件范围。
                    </p>
                    
                    <div class="flex flex-col lg:flex-row gap-8">
                        <!-- 主题选择器 -->
                        <div class="w-full lg:w-1/3 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">选择全局主题</label>
                            
                            <button class="theme-btn active border-2 border-primary bg-primary/5 text-primary font-bold p-4 rounded-xl flex items-center justify-between transition-all" data-theme="default">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full bg-blue-500 shadow-inner"></div>
                                    <span>默认蓝 (Default)</span>
                                </div>
                                <i class="ph ph-check-circle text-xl"></i>
                            </button>

                            <button class="theme-btn border-2 border-slate-100 hover:border-slate-300 text-slate-600 font-bold p-4 rounded-xl flex items-center justify-between transition-all" data-theme="cyberpunk">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full bg-rose-500 shadow-inner"></div>
                                    <span>赛博夜城 (Cyberpunk)</span>
                                </div>
                            </button>

                            <button class="theme-btn border-2 border-slate-100 hover:border-slate-300 text-slate-600 font-bold p-4 rounded-xl flex items-center justify-between transition-all" data-theme="forest">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full bg-emerald-500 shadow-inner"></div>
                                    <span>精灵之森 (Neon Forest)</span>
                                </div>
                            </button>
                        </div>

                        <!-- 效果演示与 API -->
                        <div class="w-full lg:w-2/3 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">动态 API 调用</label>
                            <div class="relative h-[220px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
// 1. 在初始化时配置好可用主题
window.JQUAN_CONFIG = {
    themes: {
        cyberpunk: {
            semantic: {
                primary: '#f43f5e', // 致命玫瑰粉
                surface: '#0a0a0a', // 纯粹的黑
                // ...
            }
        }
    }
};

// 2. 在业务逻辑中任意时刻触发换肤（仅更新变量样式表）
document.querySelector('#btn').addEventListener('click', () => {
    window.JquanUI.setTheme('cyberpunk');
});
                                </code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
                <h3 class="font-bold text-slate-800 mb-4">可选组件语义预设 · Table</h3>
                <p class="text-sm text-slate-500 mb-4">在引入 Core 和组件前选择 semantic，并配置七个明暗角色。默认 legacy 保持现有外观。Table 消费角色变量，切换 html 的 dark/light 或 setTheme 不重建表格；历史类默认保持原义，也可以用显式 <code>darkMapping</code> 把选定颜色类映射到语义角色。</p>
                <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                    <p class="mb-2 font-semibold text-slate-700">历史颜色类的暗色迁移（默认关闭）</p>
                    <pre><code class="language-javascript">window.JQUAN_CONFIG = {
  darkMapping: {
    enabled: true,
    map: { white: 'surface', 'slate-700': 'text', 'slate-200': 'border' }
  },
  theme: { semantic: {
    surface: { light: 'white', dark: 'slate-900' },
    text: { light: 'slate-700', dark: 'slate-100' },
    border: { light: 'slate-200', dark: 'slate-700' }
  } }
};</code></pre>
                    <p class="mt-2">配置后 <code>bg-white/90</code> 会在 <code>.dark</code> 和系统暗色下使用 <code>surface</code> 的 dark 值，并保留透明度；显式 <code>dark:</code> 变体优先。映射只生成 CSS 覆盖，不修改 DOM、class 或主题变量。</p>
                    <table class="mt-3 w-full text-left"><thead><tr><th>参数</th><th>类型 / 默认值</th><th>说明</th></tr></thead><tbody>
                        <tr><td>darkMapping.enabled</td><td>boolean / false</td><td>Core 加载前启用自动覆盖</td></tr>
                        <tr><td>darkMapping.map</td><td>Record&lt;string, string&gt; / {}</td><td>不带透明度的颜色名 → 已配置的 semantic 角色；无效目标跳过</td></tr>
                    </tbody></table>
                    <p class="mt-2">支持主题节点自身及后代（含 html.dark.bg-white）、hover、响应式、容器和 placeholder:text-*。同一重要性及同类状态下显式 dark 规则优先；!bg-white 仍优于普通 dark:bg-*。html.light 阻止系统回退。映射按颜色生效，white → surface 也会影响 text-white；需要保留白字时写 dark:text-white。字号、宽度、任意值和阴影不参与映射。</p>
                    <p class="mt-2">配置只影响生成的 CSS，无返回值或额外监听需要销毁；修改配置后重新加载，日常用根 dark/light 或 setTheme 切换。静态 CSS 通过提取器传入相同 config。运行 npm run check:dark-mapping 验证三种运行时入口、静态提取与冷热缓存，npm run check:semantic-theme 验证 Table。旧规则缓存会自动失效重编译。</p>
                </div>
                <pre><code class="language-javascript">window.JQUAN_CONFIG = {
  componentPresets: { ui: 'semantic' },
  theme: { semantic: {
      surface: { light: 'white', dark: 'slate-900' },
      'surface-muted': { light: 'slate-50', dark: 'slate-800' },
      text: { light: 'slate-700', dark: 'slate-100' },
      'text-muted': { light: 'slate-500', dark: 'slate-400' },
      border: { light: 'slate-200', dark: 'slate-700' },
      accent: { light: 'blue-600', dark: 'blue-400' },
      focus: { light: 'blue-200', dark: 'blue-500' }
  } }
};</code></pre>
                <p class="text-sm text-slate-500 mt-4">然后 await JquanUI.import('table') 并 mount。html.light 明确使用浅色，html.dark 使用深色，两类都移除则跟随系统；局部 .dark 可继承覆盖。每个命名主题须提供完整角色，其他组件、分页和 Overlay Preset 的硬编码颜色仍逐步迁移。详见组件 uiPreset 的完整 HTML 和销毁闭环。</p>
            </section>

            <!-- 模块 3：底层原理揭秘 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
                <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2"><i class="ph ph-cpu text-primary text-xl"></i> 架构揭秘 (Architecture Notes)</h3>
                <div class="space-y-4">
                    ${this.renderMechanismRow('ph-lightning', '拒绝 JS 遍历', '传统框架换肤往往需要遍历 DOM 树修改 class，或者通过 JS 动态计算数百个组件。Jquan 引擎直接利用 CSS 变量层叠 (CSS Variables Cascading) 的物理特性，修改成本趋近于 0。')}
                    ${this.renderMechanismRow('ph-shield-check', '双标签隔离引擎', '在 <code>&lt;head&gt;</code> 中，我们设立了 <code>#jquan-css-theme-vars</code> 和 <code>#jquan-css-runtime</code> 两个独立的靶点。主题切换只会精准替换变量靶点，绝不触碰复杂的规则池缓存，保障极致性能。')}
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
    // 挂载逻辑：局部暗黑与主题沙盒引擎
    // ==========================================
    static mount(container) {

        // 1. 初始化极致代码块高亮 (尊重用户自有样式，仅做物理防溢出限制)
        initCodeHighlighter({ showLineNumbers: true, langLabel: true });

        // 2. 局部暗黑切换魔法 (针对 Preview Box)
        const darkBtn = container.querySelector('#toggle-dark-btn');
        const previewBox = container.querySelector('#semantic-preview-box');
        const themeStatus = container.querySelector('#theme-status');
        
        if (darkBtn && previewBox) {
            darkBtn.addEventListener('click', () => {
                const isDark = previewBox.classList.toggle('dark');
                
                // 动态更新按钮状态
                if (isDark) {
                    darkBtn.innerHTML = '<i class="ph ph-sun text-base text-amber-500"></i> 切换明亮模式';
                    darkBtn.classList.replace('bg-slate-100', 'bg-slate-800');
                    darkBtn.classList.replace('text-slate-700', 'text-slate-200');
                    darkBtn.classList.replace('hover:bg-slate-200', 'hover:bg-slate-700');
                    previewBox.classList.replace('bg-slate-100', 'bg-slate-900');
                } else {
                    darkBtn.innerHTML = '<i class="ph ph-moon-stars text-base"></i> 切换局部暗黑';
                    darkBtn.classList.replace('bg-slate-800', 'bg-slate-100');
                    darkBtn.classList.replace('text-slate-200', 'text-slate-700');
                    darkBtn.classList.replace('hover:bg-slate-700', 'hover:bg-slate-200');
                    previewBox.classList.replace('bg-slate-900', 'bg-slate-100');
                }
            });
        }

                // 3. 动态主题注入系统 (P8 级安全挂载)
        if (window.JquanUI && typeof window.JquanUI.setTheme === 'function') {
            
            // 🚀 Jquan 核心重构：利用 API 动态注册语义化色彩字典
            const semanticColors = ['primary', 'surface', 'panel', 'main', 'muted', 'border'];
            semanticColors.forEach(color => {
                window.JquanUI.addColor(color, `var(--color-${color})`);
            });

            // 安全读取或创建配置
            const config = window.JquanUI.config || (window.JquanUI.config = {});
            config.themes = config.themes || {};
            
            // 补充完整的 default 主题 (包含明暗状态，让局部暗黑按钮完美生效)
            config.themes.default = {
                semantic: {
                    primary: { light: '#3b82f6', dark: '#3b82f6' }, // 经典蓝
                    surface: { light: '#ffffff', dark: '#0f172a' },
                    panel: { light: '#f8fafc', dark: '#1e293b' },
                    main: { light: '#1e293b', dark: '#f1f5f9' },
                    muted: { light: '#64748b', dark: '#94a3b8' },
                    border: { light: '#e2e8f0', dark: '#334155' }
                }
            };

            // 预埋沙盒专属的实验性主题
            config.themes.cyberpunk = {
                semantic: {
                    primary: { light: '#e11d48', dark: '#f43f5e' }, // 玫瑰粉
                    surface: { light: '#171717', dark: '#0a0a0a' }, // 赛博深黑
                    panel: { light: '#262626', dark: '#171717' },
                    main: { light: '#f8fafc', dark: '#f1f5f9' },
                    muted: { light: '#a3a3a3', dark: '#737373' },
                    border: { light: '#404040', dark: '#262626' }
                }
            };

            config.themes.forest = {
                semantic: {
                    primary: { light: '#059669', dark: '#10b981' }, // 翡翠绿
                    surface: { light: '#f0fdf4', dark: '#022c22' }, 
                    panel: { light: '#ffffff', dark: '#064e3b' },
                    main: { light: '#064e3b', dark: '#ecfdf5' },
                    muted: { light: '#047857', dark: '#6ee7b7' },
                    border: { light: '#86efac', dark: '#047857' }
                }
            };

            // 监听主题切换按钮
            const themeBtns = container.querySelectorAll('.theme-btn');
            themeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.currentTarget;
                    const themeName = targetBtn.getAttribute('data-theme');
                    
                    // UI 状态重置
                    themeBtns.forEach(b => {
                        b.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary');
                        b.classList.add('border-slate-100', 'text-slate-600');
                        const icon = b.querySelector('.ph-check-circle');
                        if (icon) icon.remove();
                    });

                    // 激活当前按钮
                    targetBtn.classList.remove('border-slate-100', 'text-slate-600');
                    targetBtn.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary');
                    targetBtn.insertAdjacentHTML('beforeend', '<i class="ph ph-check-circle text-xl"></i>');

                    // 🚀 调用光学魔法：全局主题瞬间切换
                    window.JquanUI.setTheme(themeName);
                    if (themeStatus) themeStatus.textContent = `Theme API · ${themeName}`;
                });
            });

            // 🚀 引擎驱动补丁：立刻应用默认变量并全量扫描文档生成 CSSOM！
            window.JquanUI.setTheme('default');
            window.JquanUI.scan();
        }
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'semantic colors', desc: '语义化色彩配置与映射' },
            { class: 'dark:', desc: '暗黑模式状态变体' },
            { class: 'setTheme()', desc: 'JS API: 0ms 瞬间动态主题切换引擎' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'theme-darkmode'
        }));
    }
}
