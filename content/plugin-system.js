// 🚀 Jquan Optimized: 插件生态宇宙文档 (plugin-system.js)
import { initCodeHighlighter } from '../js/code-block.mjs';

export default class PluginSystemDoc {
    static render() {
        return `
        <div class="container pb-10">
            <!-- 面包屑 -->
            <ul class="flex items-center text-sm text-slate-500 mb-6 gap-2">
                <li><a href="#" class="hover:text-primary transition-colors flex items-center gap-1"><i class="ph ph-cpu"></i>核心能力</a></li>
                <li class="text-slate-300">/</li>
                <li class="text-slate-800 font-medium">插件生态宇宙</li>
            </ul>

            <!-- 模块 1：静态组件注入 (Components Injection) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 relative">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-puzzle-piece text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">静态组件注入 (Components Injection)</cite>
                    </div>
                    <span id="plugin-status" class="text-xs font-mono text-slate-400 bg-fuchsia-50 border border-fuchsia-200 px-2 py-1 rounded shadow-sm">Interactive · addComponents()</span>
                </div>
                
                <div class="p-6 md:p-8 z-10 relative">
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">
                        当原子类（Utility Classes）组合得过于庞大时，我们通常需要将其提炼为一个可复用的组件。<br/>
                        借助插件 API 中的 <code class="text-xs font-bold text-slate-700">addComponents</code>，你可以把可复用组件规则注入组件层；需要修改全局预检时使用 <code class="text-xs font-bold text-slate-700">addBase</code>。插件只安装一次，后续页面和动态节点都复用同一份规则。
                    </p>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                        <!-- 左侧：配置代码 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-file-code"></i> 编写你的第一个插件
                            </label>
                            <div class="relative h-[320px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
window.JquanUI.use({
    name: 'acme-ui-plugin',
    version: '1.0.0',
    install({ addComponents }) {
        addComponents(\`
        /* 注入一个赛博朋克风格的按钮组件 */
        .btn-cyber {
            position: relative;
            padding: 0.75rem 2rem;
            background: linear-gradient(45deg, transparent 5%, #1e293b 5%);
            color: #fff;
            font-weight: 800;
            letter-spacing: 2px;
            box-shadow: 6px 0px 0px #38bdf8;
            transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
            cursor: pointer;
            border: none;
            outline: none;
        }
        .btn-cyber:active {
            box-shadow: 2px 0px 0px #38bdf8;
            transform: translate(4px, 0);
        }
        \`);
        return () => console.log('plugin disposed');
    }
});
                                </code></pre>
                            </div>
                        </div>

                        <!-- 右侧：效果预览 -->
                        <div class="flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="ph ph-eye"></i> 真实渲染输出
                            </label>

                            <div class="flex-1 flex flex-col items-center justify-center bg-slate-900 rounded-xl border border-slate-200 overflow-hidden p-8">
                                
                                <div class="text-center space-y-6">
                                    <p class="text-slate-400 text-sm font-mono">&lt;button class="<span class="text-sky-400">btn-cyber</span>"&gt;</p>
                                    
                                    <!-- 这个按钮依赖我们下方 JS 动态注入的组件才能生效！ -->
                                    <button class="btn-cyber">SYS.BOOT()</button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 2：动态任意值匹配 (Match Utilities) -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative isolate">
                <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-brackets-curly text-primary text-lg"></i>
                        <cite class="font-bold text-slate-800 not-italic">动态任意值解析器 (Dynamic Utility Matcher)</cite>
                    </div>
                    <span class="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded shadow-sm">matchUtilities()</span>
                </div>
                <div class="p-6 md:p-8">
                    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
                        这是 Jquan JIT 引擎最硬核的开放能力。<br/>
                        使用 <code class="text-xs font-bold text-slate-700">matchUtilities</code>，你可以截获类似 <code class="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">text-glow-[value]</code> 的任意类名。引擎会将其中的值（无论是颜色、像素还是复杂函数）安全地提取出来并喂给你的回调函数。你只需返回对应的 CSS 规则即可。
                    </p>
                    
                    <div class="flex flex-col lg:flex-row gap-8">
                        <!-- 配置代码 -->
                        <div class="w-full lg:w-1/2 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">开发动态工具类插件</label>
                            <div class="relative h-[250px] rounded-lg shadow-inner overflow-hidden border border-slate-200">
                                <pre><code class="language-javascript text-xs leading-relaxed">
window.JquanUI.use(function({ matchUtilities }) {
    matchUtilities({
        // 捕获所有 text-glow-XXX 或 text-glow-[XXX]
        'text-glow': (value) => {
            return {
                css: 'text-shadow',
                // 返回多层弥散阴影以制造霓虹灯发光效果
                val: \`0 0 10px \${value}, 0 0 20px \${value}, 0 0 40px \${value}\`
            };
        }
    });
});
                                </code></pre>
                            </div>
                        </div>

                        <!-- 效果演示 -->
                        <div class="w-full lg:w-1/2 flex flex-col space-y-4">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">JIT 沙盒测试</label>
                            
                            <div class="flex-1 flex flex-col justify-center bg-slate-900 rounded-xl border border-slate-200 overflow-hidden p-8 gap-6">
                                
                                <div class="flex items-center gap-2">
                                    <span class="text-slate-400 font-mono text-sm whitespace-nowrap">class="text-glow-[</span>
                                    <input type="text" id="glow-input" value="#f43f5e" class="w-24 bg-slate-800 text-white border border-slate-700 rounded text-sm px-2 py-1 focus:ring-1 focus:ring-rose-500 font-mono text-center outline-none">
                                    <span class="text-slate-400 font-mono text-sm">]"</span>
                                </div>
                                
                                <!-- 测试文本 (默认带一个状态) -->
                                <div class="flex-1 flex items-center justify-center">
                                    <h2 id="glow-target" class="text-4xl font-black text-white text-glow-[#f43f5e] transition-all duration-300">
                                        NEON LIGHT
                                    </h2>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 模块 3：底层 API 清单 -->
            <div class="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
                <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2"><i class="ph ph-plugs text-primary text-xl"></i> Plugin API 清单 (API Reference)</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${this.renderApiCard('addUtilities(utils)', '注入静态原子类（等同于直接修改 dictionary 核心字典）。')}
                    ${this.renderApiCard('matchUtilities(matchers)', '注册正则前缀，处理 -[...] 任意值语法并动态返回规则。')}
                    ${this.renderApiCard('addComponents(cssStr)', '向组件层注入可复用的组件选择器；全局预检规则请使用 addBase。')}
                    ${this.renderApiCard('addVariant(name, def)', '注册自定义状态变体，如扩展支持 <code>firefox:</code> 等特性。')}
                    ${this.renderApiCard('addBase(cssStr)', '向基础预检层添加经过信任的全局基础规则。')}
                    ${this.renderApiCard('addBehaviors(behaviors)', '按 selector 为节点安装行为，并在节点移除或引擎销毁时执行清理。')}
                    ${this.renderApiCard('addScanHook(handler)', '在扫描根节点时读取外部状态；只做轻量同步，不在其中重复扫描 DOM。')}
                    ${this.renderApiCard('theme(path) / requires', '读取当前令牌或声明插件依赖；install 返回函数可在 destroy 时释放资源。')}
                </div>
            </div>

        </div>
        `;
    }

    static renderApiCard(title, desc) {
        return `
            <div class="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <code class="text-sm font-bold text-primary font-mono block mb-2">${title}</code>
                <p class="text-sm text-slate-600 leading-relaxed">${desc}</p>
            </div>
        `;
    }

    // ==========================================
    // 挂载逻辑：真实向 JquanUI 注册实验性插件
    // ==========================================
    static mount(container) {

        // 1. 初始化极致代码块高亮
        initCodeHighlighter({ 
            showLineNumbers: true, 
            langLabel: true,
            containerClass: 'absolute inset-0 group font-mono text-sm flex flex-col rounded-lg overflow-hidden',
            scrollWrapperClass: 'overflow-auto flex-1'
        });

        // 2. 🔥 Jquan 硬核魔法：直接向运行时引擎注入演示环境所需插件！
        if (window.JquanUI && typeof window.JquanUI.use === 'function') {
            const demoPlugin = {
                name: 'jquanui-doc-plugin-demo',
                version: '1.0.0',
                install({ addComponents, matchUtilities }) {
                
                // 注入演示里的赛博朋克按钮
                addComponents(`
                    .btn-cyber {
                        position: relative;
                        padding: 0.75rem 2rem;
                        background: linear-gradient(45deg, transparent 5%, #1e293b 5%);
                        color: #fff;
                        font-weight: 800;
                        letter-spacing: 2px;
                        box-shadow: 6px 0px 0px #38bdf8;
                        transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
                        cursor: pointer;
                        border: none;
                        outline: none;
                    }
                    .btn-cyber:active {
                        box-shadow: 2px 0px 0px #38bdf8;
                        transform: translate(4px, 0);
                    }
                `);

                // 注入霓虹发光文字的动态匹配器
                matchUtilities({
                    'text-glow': (value) => {
                        return {
                            css: 'text-shadow',
                            val: `0 0 10px ${value}, 0 0 20px ${value}, 0 0 40px ${value}`
                        };
                    }
                });
                
                }
            };
            const installed = window.JquanUI.use(demoPlugin);
            const pluginStatus = container.querySelector('#plugin-status');
            if (pluginStatus) {
                pluginStatus.textContent = installed ? '插件已安装 · 规则已注入' : '插件已复用 · 未重复安装';
                pluginStatus.classList.remove('text-slate-400');
                pluginStatus.classList.add('text-emerald-600');
            }
        }

        // 3. 动态发光沙盒交互逻辑
        const glowInput = container.querySelector('#glow-input');
        const glowTarget = container.querySelector('#glow-target');

        if (glowInput && glowTarget && window.JquanUI) {
            glowInput.addEventListener('input', (e) => {
                const colorValue = e.target.value.trim();
                if (!colorValue) return;

                // 移除旧的 text-glow 类名
                glowTarget.className.split(' ').forEach(cls => {
                    if (cls.startsWith('text-glow-')) {
                        glowTarget.classList.remove(cls);
                    }
                });

                // 拼接新的 JIT 任意值类名
                const newClass = `text-glow-[${colorValue}]`;
                glowTarget.classList.add(newClass);

                // 🚀 触发 JquanUI 的主动编译
                window.JquanUI.compile(newClass);
            });
        }
    }

    static unmount() {
        // 插件属于运行时全局能力，页面卸载只移除本页事件，不重复销毁插件。
    }

    // ==========================================
    // 全局搜索 API
    // ==========================================
    static async onSearch(keyword) {
        const apiData = [
            { class: 'JquanUI.use()', desc: 'JS API: 注册并挂载系统级插件' },
            { class: 'addComponents()', desc: 'Plugin API: 注入静态 CSS 组件' },
            { class: 'matchUtilities()', desc: 'Plugin API: 处理动态 JIT 任意值解析' },
            { class: 'addVariant()', desc: 'Plugin API: 添加自定义伪类/变体状态' }
        ];
        
        return apiData.filter(item => 
            item.class.toLowerCase().includes(keyword.toLowerCase()) || 
            item.desc.toLowerCase().includes(keyword.toLowerCase())
        ).map(item => ({
            title: item.class,
            desc: item.desc,
            actionValue: 'plugin-system'
        }));
    }
}
