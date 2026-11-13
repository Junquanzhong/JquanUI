// 🚀 Jquan UI Docs - Intro Section (The Modern Light Edition v4 - Architectural Standard)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class IntroDoc {
    // 使用静态属性管理 Canvas 状态，完美适配单例路由架构
    static animationId = null;
    static canvas = null;
    static ctx = null;
    static pulses = [];
    static resizeHandler = null;
    static cssWidth = 0;
    static cssHeight = 0;

    static render() {
        return `
        <!-- 顶级容器：现代高级浅色主题 -->
        <div class="relative w-full overflow-hidden rounded-3xl bg-slate-50 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 transition-all">
            
            <!-- 动态星云脉冲背景层 (由 JS 控制) -->
            <canvas id="jquan-nebula-bg" class="absolute inset-0 z-0 w-full h-full pointer-events-none"></canvas>
            
            <!-- 纯白渐变遮罩：让底部内容更清晰，顶部更通透 -->
            <div class="absolute inset-0 z-0 bg-gradient-to-b from-white/30 via-white/60 to-slate-50/90 pointer-events-none"></div>

            <!-- 主内容区 -->
            <div class="relative z-10 px-4 sm:px-6 py-16 md:py-28 flex flex-col items-center justify-center text-center">
                
                <!-- 顶配徽章 (浅色版) -->
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-blue-100/50 backdrop-blur-md mb-8 shadow-sm">
                    <span class="relative flex size-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full size-2 bg-blue-500"></span>
                    </span>
                    <span data-jquan-runtime-version class="text-[10px] sm:text-xs font-bold text-blue-600 tracking-wider uppercase whitespace-nowrap">JquanUI Runtime Engine v4.72.0 Active</span>
                </div>

                <!-- 超级标题 -->
                <h1 class="text-[34px] sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight text-slate-900">
                    超越时代的 <br class="md:hidden" />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">原子化 CSS 引擎</span>
                </h1>
                
                <p class="max-w-2xl text-base sm:text-lg md:text-xl text-slate-500 mb-12 md:mb-20 leading-relaxed">
                    小型页面可以直接加载 Runtime Core；生产项目也可以使用 CLI、Vite、PostCSS 和 SSR 提取器，在构建阶段生成静态 CSS。引擎只为实际出现的原子类生成规则。
                </p>

                <!-- 核心特性网格 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4 text-left">
                    
                    <!-- Feature 1 -->
                    <div class="group p-6 rounded-2xl bg-white/60 border border-slate-100 hover:border-blue-200 backdrop-blur-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <i class="ph ph-cpu text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">运行时 JIT</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">
                            废弃庞大的静态 CSS 文件。引擎实时侦听 DOM 变化，正则匹配类名并瞬间按需编译，支持任意值 <code class="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-xs">w-[123px]</code> 语法。
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="group p-6 rounded-2xl bg-white/60 border border-slate-100 hover:border-purple-200 backdrop-blur-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                            <i class="ph ph-lightning text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">按需注入</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">
                            通过 CSSOM 逐条插入已解析规则，并对规则和缓存做校验，适合动态 DOM 和原型开发。
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="group p-6 rounded-2xl bg-white/60 border border-slate-100 hover:border-emerald-200 backdrop-blur-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <i class="ph ph-book-open-text text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">语义化设计令牌</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">
                            内置排版、颜色、布局、状态、容器查询、安全区和现代 CSS 变体；项目色彩与字号可以通过主题配置扩展。
                        </p>
                    </div>

                    <!-- Feature 4 -->
                    <div class="group p-6 rounded-2xl bg-white/60 border border-slate-100 hover:border-rose-200 backdrop-blur-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                            <i class="ph ph-shield-check text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">零依赖 & 极度防弹</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">
                            纯 Vanilla JS 编写。类名转义覆盖 <code>2xl</code>、任意值和组合变体，并提供诊断与回归检查工具。
                        </p>
                    </div>

                    <!-- Feature 5: 标准代码高亮模块 -->
                    <div class="group p-6 rounded-2xl bg-white/60 border border-slate-100 hover:border-amber-200 backdrop-blur-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 lg:col-span-2">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 shrink-0 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                <i class="ph ph-code text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800">极简调用，所想即所得</h3>
                        </div>
                        <!-- 使用引擎标准代码块结构 -->
                        <div class="mt-4 rounded-xl overflow-hidden">
                            <pre><code class="language-html">
&lt;!-- 1. 引入 JquanUI 核心引擎 --&gt;
&lt;script src="./js/JquanUI@core.min.js"&gt;&lt;/script&gt;

&lt;!-- 2. 极速构建现代原子化 UI --&gt;
&lt;div class="flex min-h-screen items-center justify-center bg-slate-50"&gt;
    &lt;h1 class="text-4xl font-bold text-primary drop-shadow-md"&gt;
        Hello, Jquan Engine!
    &lt;/h1&gt;
&lt;/div&gt;
                            </code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <section class="p-4 sm:p-6 mb-10 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700">
            <h2 class="text-2xl font-bold mb-4">选择引入方式</h2>
            <p class="mb-4 text-slate-600 dark:text-slate-300">配置先于 Core 执行。同一页面只加载一个 Core；组件通过 JquanUI.import() 按需引入。</p>
            <div class="overflow-x-auto"><table class="w-full text-left text-sm">
                <thead><tr><th class="p-3">部署形态</th><th class="p-3">入口</th><th class="p-3">组件位置</th></tr></thead>
                <tbody>
                    <tr><td class="p-3">完整仓库</td><td class="p-3"><code>./js/JquanUI@core.min.js</code> 或 <code>./dist/core/JquanUI@Core.js</code></td><td class="p-3"><code>./dist/components/</code></td></tr>
                    <tr><td class="p-3">只复制 dist</td><td class="p-3"><code>./dist/core/JquanUI@Core.js</code></td><td class="p-3">保留 dist/core 与 dist/components（包括 dist 目录名）；仓库 js 压缩入口不在 dist 内</td></tr>
                    <tr><td class="p-3">npm + 浏览器构建器</td><td class="p-3"><code>import 'jquanui/core'</code></td><td class="p-3">将所需组件及依赖复制到公共资源目录，显式配置 componentLoader.baseURL</td></tr>
                </tbody>
            </table></div>
            <pre><code class="language-html">&lt;!-- dist-only：保留 dist 这一层目录，通过 HTTP 服务访问 --&gt;
&lt;script src="./dist/core/JquanUI@Core.js"&gt;&lt;/script&gt;
&lt;script&gt;
  (async () =&gt; {
    const dom = await JquanUI.import('dom');
    console.log(dom);
  })().catch(console.error);
&lt;/script&gt;</code></pre>
            <p class="my-4 text-slate-600 dark:text-slate-300">构建器不会自动复制 import() 动态请求的组件。静态导入先于模块主体执行：配置放在 HTML 前置脚本，或先赋值再动态 import。</p>
            <pre><code class="language-js">// 将 node_modules/jquanui/dist/components 中所需组件及依赖复制到 public/assets/jquan-components/
window.JQUAN_CONFIG = {
  componentLoader: { baseURL: '/assets/jquan-components/' }
};
await import('jquanui/core'); // 浏览器构建器入口
const dom = await window.JquanUI.import('dom');</code></pre>
            <p class="my-4 text-slate-600 dark:text-slate-300">dist 改名、扁平化或 Core 打包改名时同样需要 baseURL。Node/SSR 的 core、full 和组件子路径是无操作入口，不创建浏览器全局；构建提取从 jquanui 或 jquanui/extract 引入。</p>
            <h3 class="text-xl font-bold mb-3">版本字段</h3>
            <div class="overflow-x-auto"><table class="w-full text-left text-sm">
                <thead><tr><th class="p-3">无参属性 / 返回类型</th><th class="p-3">当前值</th><th class="p-3">用途</th></tr></thead>
                <tbody>
                    <tr><td class="p-3"><code>engineVersion: string</code></td><td class="p-3">4.72.0</td><td class="p-3">纯 semver，用于版本比较</td></tr>
                    <tr><td class="p-3"><code>versionLabel: string</code></td><td class="p-3">Enterprise Plugin Lifecycle</td><td class="p-3">描述标签</td></tr>
                    <tr><td class="p-3"><code>version: string</code></td><td class="p-3">4.72.0 (Enterprise Plugin Lifecycle)</td><td class="p-3">兼容原有展示值</td></tr>
                </tbody>
            </table></div>
            <pre><code class="language-js">console.log(JquanUI.engineVersion, JquanUI.versionLabel);
console.log(JquanUI.debug().version); // 与 engineVersion 相同的纯版本</code></pre>
            <p class="mt-4 text-slate-600 dark:text-slate-300">getMetrics().version 与 jquan:ready 事件的 detail.version 继续返回纯版本；字段读取无组件依赖、无清理步骤。组件销毁按各自 API 执行，卸载整个运行时使用 JquanUI.destroy()。公开 core-archive-v4.5 保留为历史兼容入口，不是当前 Core。</p>
        </section>
        `;
    }

    // ==========================================
    // 生命周期：挂载 (统一使用静态方法)
    // ==========================================
    static mount(container) {
        // 1. 初始化标准代码高亮器
        initCodeHighlighter({
            showLineNumbers: true,
            langLabel: true,
        });

        // 2. 启动底层 Canvas 动画
        IntroDoc.initCanvasAnimation(container);
    }

    // ==========================================
    // 生命周期：卸载清理 (防内存泄漏)
    // ==========================================
    static unmount() {
        if (IntroDoc.animationId) {
            cancelAnimationFrame(IntroDoc.animationId);
            IntroDoc.animationId = null;
        }
        if (IntroDoc.resizeHandler) {
            window.removeEventListener('resize', IntroDoc.resizeHandler);
            IntroDoc.resizeHandler = null;
        }
        IntroDoc.pulses = [];
        IntroDoc.ctx = null;
        IntroDoc.canvas = null;
    }

    // --- P8 级原生 Canvas：星云脉冲静态核心逻辑 ---
    static initCanvasAnimation(container) {
        IntroDoc.canvas = document.getElementById('jquan-nebula-bg');
        if (!IntroDoc.canvas) return;

        IntroDoc.ctx = IntroDoc.canvas.getContext('2d');
        
        // 绑定静态方法的上下文
        IntroDoc.resizeHandler = IntroDoc.resizeCanvas.bind(IntroDoc);
        window.addEventListener('resize', IntroDoc.resizeHandler);
        
        IntroDoc.resizeCanvas();
        IntroDoc.createPulses();
        IntroDoc.animate();
    }

    static resizeCanvas() {
        if (!IntroDoc.canvas || !IntroDoc.canvas.parentElement) return;
        const parent = IntroDoc.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        
        IntroDoc.canvas.width = parent.offsetWidth * dpr;
        IntroDoc.canvas.height = parent.offsetHeight * dpr;
        IntroDoc.ctx.scale(dpr, dpr);
        
        IntroDoc.cssWidth = parent.offsetWidth;
        IntroDoc.cssHeight = parent.offsetHeight;
    }

    static createPulses() {
        IntroDoc.pulses = [];
        const pulseCount = Math.max(8, Math.floor(window.innerWidth / 120)); 
        
        const themeColors = [
            '59, 130, 246',  // Blue 500
            '99, 102, 241',  // Indigo 500
            '168, 85, 247',  // Purple 500
            '14, 165, 233',  // Sky 500
            '16, 185, 129'   // Emerald 500
        ];

        for (let i = 0; i < pulseCount; i++) {
            const baseRadius = 80 + Math.random() * 150; 
            IntroDoc.pulses.push({
                x: Math.random() * (IntroDoc.cssWidth || window.innerWidth),
                y: Math.random() * (IntroDoc.cssHeight || window.innerHeight),
                vx: (Math.random() - 0.5) * 0.4, 
                vy: (Math.random() - 0.5) * 0.4,
                baseRadius: baseRadius,
                color: themeColors[Math.floor(Math.random() * themeColors.length)],
                angle: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.02,
                baseOpacity: 0.15 + Math.random() * 0.15 
            });
        }
    }

    static animate() {
        if (!IntroDoc.ctx || !IntroDoc.canvas) return;

        IntroDoc.ctx.clearRect(0, 0, IntroDoc.cssWidth, IntroDoc.cssHeight);
        IntroDoc.ctx.globalCompositeOperation = 'lighter';

        IntroDoc.pulses.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -p.baseRadius) p.vx *= -1;
            if (p.x > IntroDoc.cssWidth + p.baseRadius) p.vx *= -1;
            if (p.y < -p.baseRadius) p.vy *= -1;
            if (p.y > IntroDoc.cssHeight + p.baseRadius) p.vy *= -1;

            p.angle += p.pulseSpeed;
            const currentRadius = p.baseRadius + Math.sin(p.angle) * (p.baseRadius * 0.2); 
            const currentOpacity = p.baseOpacity + Math.cos(p.angle) * 0.05; 
            const safeRadius = Math.max(1, currentRadius); 
            
            const gradient = IntroDoc.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, safeRadius);
            gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, currentOpacity)})`);
            gradient.addColorStop(0.5, `rgba(${p.color}, ${Math.max(0, currentOpacity * 0.4)})`);
            gradient.addColorStop(1, `rgba(${p.color}, 0)`);

            IntroDoc.ctx.beginPath();
            IntroDoc.ctx.arc(p.x, p.y, safeRadius, 0, Math.PI * 2);
            IntroDoc.ctx.fillStyle = gradient;
            IntroDoc.ctx.fill();
        });

        IntroDoc.animationId = requestAnimationFrame(IntroDoc.animate.bind(IntroDoc));
    }
}
