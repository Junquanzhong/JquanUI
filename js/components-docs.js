(function () {
    let docs = [];

    const componentDocsIndexUrl = (() => {
        const script = Array.from(document.scripts || []).find(node => /(?:^|\/)components-docs\.js(?:\?|$)/.test(node.src || ''));
        return new URL('../content/components/index.js', script?.src || document.baseURI).href;
    })();

    async function loadComponentDocs() {
        const module = await import(componentDocsIndexUrl);
        const loaded = module && module.default;
        if (!Array.isArray(loaded) || loaded.length === 0) throw new Error('Component documentation index is empty.');
        docs = loaded;
        return docs;
    }

    const state = {
        keyword: '',
        activeId: 'iframeBridge',
        demoCleanups: []
    };

    function ensurePlugins() {
        if (!window.JquanUI || !window.JquanUIComponents) return;
        const plugins = Object.keys(window.JquanUIComponents).reduce((acc, key) => {
            const plugin = window.JquanUIComponents[key];
            if (!plugin || typeof plugin !== 'object' || !plugin.name || typeof plugin.install !== 'function') return acc;
            acc[plugin.name] = plugin;
            return acc;
        }, {});
        const visited = new Set();
        const visiting = new Set();

        function installByName(name) {
            if (!name || visited.has(name)) return;
            if (window.JquanUI.hasPlugin && window.JquanUI.hasPlugin(name)) {
                visited.add(name);
                return;
            }
            if (visiting.has(name)) return;
            const plugin = plugins[name];
            if (!plugin) return;
            visiting.add(name);
            const deps = Array.isArray(plugin.requires) ? plugin.requires : [];
            deps.forEach(dep => installByName(dep));
            if (!window.JquanUI.hasPlugin || !window.JquanUI.hasPlugin(plugin.name)) {
                window.JquanUI.use(plugin);
            }
            visiting.delete(name);
            visited.add(name);
        }

        Object.keys(plugins).forEach(installByName);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, token => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[token]));
    }

    function formatInlineCode(text) {
        const escaped = escapeHtml(text);
        return escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    }

    function getFilteredDocs() {
        const keyword = state.keyword.trim().toLowerCase();
        if (!keyword) return docs;
        return docs.filter(item => {
            const text = [
                item.id,
                item.title,
                item.chinese,
                item.category,
                item.summary,
                item.api || '',
                item.file
            ].join(' ').toLowerCase();
            return text.includes(keyword);
        });
    }

    function groupDocs(items) {
        return items.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {});
    }

    function enhanceRenderedRoot(root) {
        if (root && window.JquanUI && typeof window.JquanUI.enhance === 'function') {
            window.JquanUI.enhance(root);
        }
    }

    function renderSidebar() {
        const mount = document.getElementById('component-sidebar');
        const grouped = groupDocs(getFilteredDocs());
        const categoryOrder = ['基础交互', '表单输入', '反馈与浮层', '数据展示', '页面结构', '内容与媒体', '数据与状态', '网络与集成', '浏览器工具', '设计预设'];
        const html = categoryOrder
            .filter(category => grouped[category]?.length)
            .map(category => `
                <section class="space-y-1">
                    <div class="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">${category}</div>
                    ${grouped[category].map(item => `
                        <button data-id="${item.id}" class="component-nav-item w-full text-left px-3 py-2 rounded-xl border transition-all ${state.activeId === item.id ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' : 'bg-transparent border-transparent text-slate-600 hover:bg-white hover:border-slate-200'}">
                                <div class="font-medium">${item.chinese}</div>
                            <div class="text-xs ${state.activeId === item.id ? 'text-primary/80' : 'text-slate-400'}">${escapeHtml(item.title)}</div>
                        </button>
                    `).join('')}
                </section>
            `).join('');

        mount.innerHTML = html || `<div class="px-3 py-10 text-sm text-slate-400 text-center">没有匹配到组件</div>`;
        enhanceRenderedRoot(mount);
        mount.querySelectorAll('.component-nav-item').forEach(node => {
            node.addEventListener('click', () => {
                state.activeId = node.getAttribute('data-id');
                renderSidebar();
                renderDoc();
            });
        });
    }

    function renderKeyValueTable(rows, headers) {
        if (!rows || rows.length === 0) {
            return `<div class="text-sm text-slate-400">当前组件没有独立列出的 ${headers[0]}。</div>`;
        }
        return `
            <div class="overflow-hidden border border-slate-200 rounded-xl">
                <table class="min-w-full text-sm">
                    <thead class="bg-slate-50 text-slate-500">
                        <tr>
                            <th class="text-left px-4 py-3 font-semibold">${headers[0]}</th>
                            <th class="text-left px-4 py-3 font-semibold">${headers[1]}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        ${rows.map(([key, value]) => `
                            <tr>
                                <td class="px-4 py-3 align-top font-mono text-[13px] text-slate-800">${formatInlineCode(key)}</td>
                                <td class="px-4 py-3 align-top text-slate-600">${formatInlineCode(value)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderComponentSchema(item) {
        const schema = item?.schema;
        if (!schema || typeof schema !== 'object') return '';
        const entries = Object.entries(schema).filter(([, value]) => value && typeof value === 'object');
        if (entries.length === 0) return '';
        return `
            <section class="mb-8 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">API 参数摘要</div>
                <div class="divide-y divide-slate-100">
                    ${entries.map(([name, entry]) => `
                        <div class="p-6">
                            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <code class="font-mono text-sm font-semibold text-slate-900">${escapeHtml(name)}</code>
                                <span class="text-xs text-slate-500">${formatInlineCode(entry.signature || '')}</span>
                            </div>
                            ${Array.isArray(entry.options) && entry.options.length ? `
                                <div class="mt-4 overflow-x-auto border border-slate-200 rounded-xl">
                                    <table class="min-w-full text-sm">
                                        <thead class="bg-slate-50 text-slate-500">
                                            <tr>
                                                <th class="text-left px-4 py-3 font-semibold">参数</th>
                                                <th class="text-left px-4 py-3 font-semibold">类型</th>
                                                <th class="text-left px-4 py-3 font-semibold">默认值</th>
                                                <th class="text-left px-4 py-3 font-semibold">说明</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100 bg-white">
                                            ${entry.options.map(([option, type, defaultValue, description]) => `
                                                <tr>
                                                    <td class="px-4 py-3 align-top font-mono text-[13px] text-slate-800">${escapeHtml(option || '')}</td>
                                                    <td class="px-4 py-3 align-top text-slate-600">${escapeHtml(type || '')}</td>
                                                    <td class="px-4 py-3 align-top font-mono text-[13px] text-slate-600">${escapeHtml(defaultValue || '')}</td>
                                                    <td class="px-4 py-3 align-top text-slate-600">${formatInlineCode(description || '')}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : ''}
                            ${entry.returns ? `<p class="mt-4 text-sm leading-6 text-slate-600"><span class="font-semibold text-slate-800">返回：</span>${formatInlineCode(entry.returns)}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderComponentExamples(item) {
        const examples = Array.isArray(item?.examples) && item.examples.length
            ? item.examples
            : [
                { id: 'declarative', title: '声明式用法', language: 'html', code: item?.declarative || '' },
                { id: 'imperative', title: '命令式 / API 用法', language: 'javascript', code: item?.imperative || '' }
            ];
        return `
            <section class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                ${examples.map(example => `
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                            <span class="font-semibold text-slate-800">${escapeHtml(example.title || example.id || '示例')}</span>
                            <span class="text-[11px] uppercase tracking-wider text-slate-400">${escapeHtml(example.language || 'text')}</span>
                        </div>
                        <div class="p-6">${renderDocCodeBlock(example.code || '', example.language || 'text')}</div>
                    </div>
                `).join('')}
            </section>
        `;
    }

    function renderComponentExtras(item) {
        if (!item) return '';

        if (item.id === 'select') {
            const selectModes = [
                ['单选模式', '适合状态切换、筛选器、配置项选择，通常开启 `closeOnSelect`。'],
                ['多选模式', '适合标签筛选、权限范围、功能勾选，建议搭配 `maxSelections`。'],
                ['搜索模式', '选项多于 8-10 个时建议默认开启，降低滚动查找成本。'],
                ['可清空模式', '适合“全部 / 未选择 / 可选填”的后台表单。']
            ];

            const selectRules = [
                ['选项来源', '优先保留原生 `select/option` 结构，增强层只负责体验，不抢业务值语义。'],
                ['搜索体验', '后台场景建议开启 `searchable`，并提供明确 `searchPlaceholder`。'],
                ['多选上限', '需要业务限制时使用 `maxSelections` + `maxSelectionsText`，避免静默失败。'],
                ['辅助说明', '`helperText` 适合放“最多可选几项”“可搜索”“影响范围”等说明。'],
                ['表单联动', '因为底层仍是原生 `select`，提交、重置、禁用态与表单集成成本更低。'],
                ['可访问性', '涉及键盘操作的场景，建议保留清晰 placeholder 和选中反馈。']
            ];

            const selectScenarios = [
                ['筛选工具栏', '组件分类、状态、负责人、版本标签等后台筛选条件。'],
                ['系统配置', '主题、语言、站点策略、权限组等单项或多项配置。'],
                ['批量操作', '标签分配、渠道归属、通知范围、能力开关集合。'],
                ['表单字段增强', '替换原生 select 的同时保留原生值同步与提交兼容。']
            ];

            const selectExample = `<select id="demo-select" jq-select multiple
  data-placeholder="选择组件能力"
  data-search-placeholder="搜索组件能力"
  data-helper-text="支持搜索、清空与多选"
  data-select-max="4"
  data-select-max-text="最多只能选择 4 项">
  <option value="modal">Modal</option>
  <option value="drawer">Drawer</option>
  <option value="tabs">Tabs</option>
  <option value="crud">Crud</option>
  <option value="template">Template</option>
  <option value="upload">Upload</option>
</select>

const select = JquanUIComponents.selectApi.mount('#demo-select', {
  multiple: true,
  searchable: true,
  clearable: true,
  maxSelections: 4,
  helperText: '支持搜索、清空与多选',
  maxSelectionsText: '最多只能选择 4 项',
  onChange(value, handle) {
    console.log('selected', value, handle.state());
  }
});

select.open();
select.search('ta');
select.select('template');
select.setValue(['modal', 'tabs', 'crud']);

const state = select.state();
const values = select.values();`;

            return `
                <section class="mt-8 grid gap-6">
                    <div class="grid gap-6 xl:grid-cols-2">
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">交互模式</div>
                            <div class="p-6">${renderKeyValueTable(selectModes, ['模式', '说明'])}</div>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">接入规则</div>
                            <div class="p-6">${renderKeyValueTable(selectRules, ['主题', '建议'])}</div>
                        </div>
                    </div>

                    <div class="grid gap-6 xl:grid-cols-2">
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">典型业务场景</div>
                            <div class="p-6">${renderKeyValueTable(selectScenarios, ['场景', '适合内容'])}</div>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">推荐配置组合</div>
                            <div class="p-6">${renderKeyValueTable([
                                ['后台筛选器', '`multiple: true` + `searchable: true` + `clearable: true`'],
                                ['配置表单', '`multiple: false` + `closeOnSelect: true` + `helperText`'],
                                ['权限范围选择', '`multiple: true` + `maxSelections` + `maxSelectionsText`'],
                                ['长列表数据', '`searchable: true` + 自定义 `searchPlaceholder`']
                            ], ['组合', '建议'])}</div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">完整企业示例</div>
                        <div class="p-6">${renderDocCodeBlock(selectExample, 'html')}</div>
                    </div>
                </section>
            `;
        }

        if (item.id === 'tagInput') {
            const tagModes = [
                ['自由输入', '适合关键词、技能、白名单、邮件抄送、搜索条件 chips。'],
                ['建议项辅助', '候选集合已知时开启 `suggestions`，提升录入速度与一致性。'],
                ['最大数量控制', '通过 `maxTags` 限制数量，适合“最多 5 个关键词”类需求。'],
                ['去重模式', '默认建议关闭重复标签，减少脏数据与展示噪音。']
            ];

            const tagRules = [
                ['标签上限', '`maxTags` 不只是交互限制，也是在前端提前表达业务规则。'],
                ['建议项质量', '`suggestions` 应来自稳定词典，不建议把脏字符串直接暴露给用户。'],
                ['校验策略', '业务需要时用 `validate()` 做格式校验，比如邮箱、域名、slug。'],
                ['重复控制', '筛选词、标签、白名单通常应关闭重复；流水备注类场景可按需放开。'],
                ['粘贴体验', '批量输入场景建议保留分隔符拆分能力，减少逐个回车录入成本。'],
                ['状态提示', '超限、重复、非法字符都应有明确文案反馈，避免用户误判。']
            ];

            const tagScenarios = [
                ['系统标签', '文章、组件、项目、任务的标签与分类录入。'],
                ['白名单输入', '邮箱、域名、账号、IP 片段等批量输入场景。'],
                ['搜索条件', '关键词、地区、部门、能力维度等筛选 chips。'],
                ['技能与特征', '招聘、档案、能力盘点类系统中的多值字段。']
            ];

            const tagExample = `<input id="demo-tags" jq-tag-input
  data-tag-max="5"
  data-tag-max-text="最多保留 5 个标签"
  data-tag-duplicate-text="该标签已存在"
  data-tag-invalid-text="仅允许字母、数字与短横线"
  data-tag-suggestions='["Vue","React","Svelte","Docs","Dashboard","Table","Router"]'
  value="Docs,Dashboard"
  placeholder="输入标签后按回车">

const tagInput = JquanUIComponents.tagInputApi.mount('#demo-tags', {
  maxTags: 5,
  suggestions: ['Vue', 'React', 'Svelte', 'Docs', 'Dashboard', 'Table', 'Router'],
  maxTagsText: '最多保留 5 个标签',
  duplicateText: '该标签已存在',
  invalidText: '仅允许字母、数字与短横线',
  validate(value) {
    return /^[a-z0-9-]+$/i.test(value) || '仅允许字母、数字与短横线';
  }
});

tagInput.add('Vue');
tagInput.setTags(['Docs', 'Dashboard', 'React']);
tagInput.remove('Docs');

const tags = tagInput.tags();
const state = tagInput.state();`;

            return `
                <section class="mt-8 grid gap-6">
                    <div class="grid gap-6 xl:grid-cols-2">
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">输入模式</div>
                            <div class="p-6">${renderKeyValueTable(tagModes, ['模式', '说明'])}</div>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">接入规则</div>
                            <div class="p-6">${renderKeyValueTable(tagRules, ['主题', '建议'])}</div>
                        </div>
                    </div>

                    <div class="grid gap-6 xl:grid-cols-2">
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">典型业务场景</div>
                            <div class="p-6">${renderKeyValueTable(tagScenarios, ['场景', '适合内容'])}</div>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">推荐配置组合</div>
                            <div class="p-6">${renderKeyValueTable([
                                ['关键词输入', '`maxTags` + `suggestions` + 去重'],
                                ['邮箱白名单', '`validate()` + 粘贴拆分 + 去重'],
                                ['后台筛选词', '`suggestions` + `state()` + 自定义提示文案'],
                                ['技能标签', '`maxTags` + 候选建议 + 批量 `setTags()`']
                            ], ['组合', '建议'])}</div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">完整企业示例</div>
                        <div class="p-6">${renderDocCodeBlock(tagExample, 'html')}</div>
                    </div>
                </section>
            `;
        }

        if (item.id !== 'template') return '';

        const templateSyntax = [
            ['`{{ expr }}`', '输出表达式结果，默认转义 HTML。'],
            ['`{!! expr !!}`', '输出原始 HTML，不做转义，建议配合可控数据源。'],
            ['`{% if / elseif / else / endif %}`', '条件分支渲染。'],
            ['`{% for item in items %}`', '数组循环，循环变量可通过 `loop` 读取索引、首尾、长度。'],
            ['`{% for key, item in object %}`', '对象循环，适合统计面板、配置项、字典映射。'],
            ['`{% set total = items | length %}`', '设置局部变量，减少重复表达式。'],
            ['`{% include "card" with { item: item } %}`', '引入模板片段，可附带局部上下文。'],
            ['`{% layout "shell" with {...} %}`', '布局继承入口，用于后台页、邮件骨架、栏目页。'],
            ['`{% slot "body" %}...{% endslot %}`', '向布局注入插槽内容。'],
            ['`{% renderSlot "body" %}`', '在布局模板中渲染插槽。']
        ];

        const templateFilters = [
            ['`upper` / `lower`', '大小写转换，适合 badge、代码名、状态名。'],
            ['`length`', '数组 / 字符串 / 对象长度。'],
            ['`join(separator)`', '数组拼接。'],
            ['`default(fallback)`', '空值兜底。'],
            ['`currency(currency, locale)`', '货币格式化。'],
            ['`date(locale)`', '日期时间格式化。'],
            ['`json`', '调试时输出 JSON 字符串。'],
            ['`registerFilter(name, handler)`', '业务层注册自定义过滤器。']
        ];

        const templateScenarios = [
            ['CMS 栏目块', '列表、推荐位、专题页模块、碎片内容拼装。'],
            ['后台工作台', '概览卡片、统计分区、开关区块、低代码页面片段。'],
            ['邮件 / 通知', '统一骨架、变量替换、条件显示、片段复用。'],
            ['文档系统', '代码示例卡片、版本提示块、可配置说明区。']
        ];

        const templateRules = [
            ['声明式挂载', '节点上写 `jq-template` 或 `data-jq-template-source`，适合静态页面和 CMS 输出。'],
            ['命令式渲染', '`templateApi.render()` 适合字符串模板即时渲染、调试面板、服务端返回片段。'],
            ['实例化挂载', '`mount()` / `mountAsync()` 适合需要后续 `patch()`、`update()`、`setData()` 的页面区块。'],
            ['缓存策略', '默认开启编译缓存；频繁切换模板时用 `cacheSize()` 监控、用 `clearCache()` 清理。'],
            ['安全模式', '多角色配置场景开启 `safeExpressions`，阻止危险全局对象和构造能力。'],
            ['错误调试', '用 `ast()`、`dependencies()`、错误对象上的 `position / snippet` 做定位。']
        ];

        const fullExample = `JquanUIComponents.templateApi.registerTemplate('product-card', \`
<article class="rounded-2xl border border-slate-200 bg-white p-4">
  <div class="flex items-start justify-between gap-3">
    <div>
      <div class="font-semibold text-slate-900">{{ item.name }}</div>
      <div class="mt-1 text-sm text-slate-500">{{ item.desc }}</div>
    </div>
    <span class="inline-flex rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      {{ item.status | upper }}
    </span>
  </div>
  <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
    <span class="text-xs text-slate-400">Price</span>
    <strong class="text-sm text-slate-800">{{ item.price | currency('CNY', 'zh-CN') }}</strong>
  </div>
</article>
\`);

JquanUIComponents.templateApi.registerTemplate('dashboard-shell', \`
<section class="grid gap-4">
  <header class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
    {% renderSlot "hero" %}
  </header>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
    <div>{% renderSlot "body" %}</div>
    <aside>{% renderSlot "aside" %}</aside>
  </div>
</section>
\`);

const view = JquanUIComponents.templateApi.mount('#demo-template', {
  template: \`
    {% layout "dashboard-shell" with { pageTitle: title } %}
      {% slot "hero" %}
        <div class="grid gap-2">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Overview</div>
          <div class="text-2xl font-bold text-slate-900">{{ title }}</div>
          <div class="text-sm text-slate-500">{{ subtitle | default('Template workspace') }}</div>
        </div>
      {% endslot %}
      {% slot "body" %}
        {% if items | length %}
          <div class="grid gap-3 md:grid-cols-2">
            {% for item in items %}
              {% include "product-card" with { item: item } %}
            {% endfor %}
          </div>
        {% else %}
          <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            当前没有数据
          </div>
        {% endif %}
      {% endslot %}
      {% slot "aside" %}
        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          {% for key, stat in stats %}
            <div class="flex items-center justify-between gap-3 py-2">
              <span class="text-sm text-slate-500">{{ key }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ stat }}</span>
            </div>
          {% endfor %}
        </div>
      {% endslot %}
    {% endlayout %}
  \`,
  data: {
    title: 'Component Workspace',
    subtitle: '配置驱动页面',
    items: [
      { name: 'Modal', desc: '复杂弹窗工作流', status: 'stable', price: 299 },
      { name: 'Crud', desc: '列表与表单闭环', status: 'beta', price: 699 }
    ],
    stats: { coverage: '96%', docs: 'A', quality: 'Stable' }
  },
  safeExpressions: true
});

view.patch({
  subtitle: 'patch() 已完成局部数据更新'
});`;

        return `
            <section class="mt-8 grid gap-6">
                <div class="grid gap-6 xl:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">模板语法速查</div>
                        <div class="p-6">${renderKeyValueTable(templateSyntax, ['语法', '说明'])}</div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">内置过滤器</div>
                        <div class="p-6">${renderKeyValueTable(templateFilters, ['过滤器', '说明'])}</div>
                    </div>
                </div>

                <div class="grid gap-6 xl:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">接入与上线规则</div>
                        <div class="p-6">${renderKeyValueTable(templateRules, ['主题', '建议'])}</div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">典型业务场景</div>
                        <div class="p-6">${renderKeyValueTable(templateScenarios, ['场景', '适合内容'])}</div>
                    </div>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">完整企业示例</div>
                    <div class="p-6">${renderDocCodeBlock(fullExample, 'js')}</div>
                </div>
            </section>
        `;
    }

    function renderDocCodeBlock(code, language) {
        return `<pre class="!m-0"><code data-jq-code data-language="${language}">${escapeHtml(code)}</code></pre>`;
    }

    function enhanceDocCodeBlocks(root) {
        if (!root || !window.JquanUIComponents?.codeBlockApi) return;
        root.querySelectorAll('pre:not([jq-code-rendered="true"]) > code').forEach(node => {
            if (!node.hasAttribute('data-jq-code') && !node.hasAttribute('data-language') && !/language-/.test(node.className || '')) {
                node.setAttribute('data-jq-code', '');
                node.setAttribute('data-language', 'text');
            }
        });

        root.querySelectorAll('pre:not([jq-code-rendered="true"]) > code[data-jq-code], pre:not([jq-code-rendered="true"]) > code[data-language], pre:not([jq-code-rendered="true"]) > code[class*="language-"]').forEach(node => {
            try {
                window.JquanUIComponents.codeBlockApi.mount(node, {
                    lineNumbers: true,
                    copyable: true
                });
            } catch (error) {
                console.error('[JquanUI Docs] Failed to enhance code block.', error);
            }
        });
    }

    function getDemoMarkup(id) {
        const map = {
            favicon: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-favicon-set" jq-button data-size="sm">set()</button>
                        <button id="preview-favicon-badge" jq-button data-size="sm" data-variant="primary">badge(12)</button>
                        <button id="preview-favicon-loading" jq-button data-size="sm">status(loading)</button>
                        <button id="preview-favicon-success" jq-button data-size="sm">status(success)</button>
                        <button id="preview-favicon-clear" jq-button data-size="sm">clear()</button>
                        <button id="preview-favicon-restore" jq-button data-size="sm">restore()</button>
                    </div>
                    <div class="grid gap-3 sm:grid-cols-3">
                        <div class="rounded-xl border border-slate-200 bg-white p-4 text-center">
                            <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl text-primary" id="preview-favicon-icon">◆</div>
                            <div class="mt-3 text-xs text-slate-500">当前图标</div>
                        </div>
                        <div class="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div class="text-sm font-semibold text-slate-800">浏览器标签页状态</div>
                            <div class="mt-2 text-sm leading-6 text-slate-600">按钮会更新页面 favicon；在支持的浏览器中可观察标签页图标、徽标和状态帧变化。</div>
                            <div id="preview-favicon-state" class="mt-3"></div>
                        </div>
                    </div>
                </div>
            `,
            iframeBridge: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-iframe-send" jq-button data-size="sm">send(theme)</button>
                        <button id="preview-iframe-request" jq-button data-size="sm" data-variant="primary">request(health)</button>
                        <button id="preview-iframe-state" jq-button data-size="sm">state()</button>
                        <button id="preview-iframe-destroy" jq-button data-size="sm">destroy()</button>
                    </div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)]">
                        <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <iframe id="preview-iframe-child" title="iframeBridge 子页面预览" class="h-56 w-full border-0 bg-white"></iframe>
                        </div>
                        <div class="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
                            <div class="text-sm font-semibold text-slate-800">通信状态</div>
                            <div id="preview-iframe-status" class="mt-3"></div>
                        </div>
                    </div>
                </div>
            `,
            data: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-data-insert" jq-button data-size="sm" data-variant="primary">insert()</button>
                        <button id="preview-data-update" jq-button data-size="sm">update()</button>
                        <button id="preview-data-filter" jq-button data-size="sm">query(active)</button>
                        <button id="preview-data-snapshot" jq-button data-size="sm">snapshot()</button>
                        <button id="preview-data-reset" jq-button data-size="sm">reset()</button>
                    </div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)]">
                        <div id="preview-data-list" class="grid gap-2"></div>
                        <div id="preview-data-state" class="min-w-0"></div>
                    </div>
                </div>
            `,
            button: `
                <div class="flex flex-wrap gap-3">
                    <button jq-button>默认按钮</button>
                    <button jq-button data-variant="primary">主按钮</button>
                    <button jq-button data-variant="ghost">幽灵按钮</button>
                    <button jq-button data-size="sm">小按钮</button>
                    <button jq-button data-size="lg">大按钮</button>
                </div>
            `,
            accordion: `
                <div class="grid gap-4 w-full">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-accordion-open-first" jq-button data-size="sm" data-variant="primary">打开第一个</button>
                        <button id="preview-accordion-open-second" jq-button data-size="sm">切换第二个</button>
                        <button id="preview-accordion-close-all" jq-button data-size="sm">全部收起</button>
                        <button id="preview-accordion-open-all" jq-button data-size="sm">全部展开</button>
                    </div>
                    <section id="preview-accordion" jq-accordion class="grid gap-3 w-full" data-multiple="true" data-collapsible="true">
                        <article jq-accordion-item>
                            <button jq-accordion-trigger>文档目录分组</button>
                            <div jq-accordion-panel><div class="p-4 text-sm text-slate-600">适合 FAQ、设置页、文档目录。当前预览使用多开模式，便于同时观察多个面板状态。</div></div>
                        </article>
                        <article jq-accordion-item>
                            <button jq-accordion-trigger>程序化控制</button>
                            <div jq-accordion-panel><div class="p-4 text-sm text-slate-600">上方按钮正在调用 open / toggle / closeAll，用来展示命令式控制能力。</div></div>
                        </article>
                        <article jq-accordion-item>
                            <button jq-accordion-trigger>状态读取</button>
                            <div jq-accordion-panel><div class="p-4 text-sm text-slate-600">当前展开索引会实时输出到下方状态面板。</div></div>
                        </article>
                    </section>
                    <div id="preview-accordion-state"></div>
                </div>
            `,
            tabs: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-tabs-go-api" jq-button data-size="sm" data-variant="primary">goTo(API)</button>
                        <button id="preview-tabs-prev" jq-button data-size="sm">prev()</button>
                        <button id="preview-tabs-next" jq-button data-size="sm">next()</button>
                        <button id="preview-tabs-play" jq-button data-size="sm">play()</button>
                        <button id="preview-tabs-pause" jq-button data-size="sm">pause()</button>
                    </div>
                    <div id="preview-tabs-state"></div>
                    <div id="preview-tabs">
                        <nav jq-tab-list>
                            <button jq-tab jq-target="#tab-a" class="px-3 py-2">预览</button>
                            <button jq-tab jq-target="#tab-b" class="px-3 py-2">API</button>
                            <button jq-tab jq-target="#tab-c" class="px-3 py-2">说明</button>
                        </nav>
                        <div jq-tab-content>
                            <section id="tab-a" jq-tab-panel><div class="pt-4 text-sm text-slate-600">面向内容分组展示。</div></section>
                            <section id="tab-b" jq-tab-panel><div class="pt-4 text-sm text-slate-600">支持 goTo / next / prev / autoplay。</div></section>
                            <section id="tab-c" jq-tab-panel><div class="pt-4 text-sm text-slate-600">适合代码 / 预览 / API 三栏切换。</div></section>
                        </div>
                    </div>
                </div>
            `,
            dropdown: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-dropdown-open" jq-button data-size="sm" data-variant="primary">打开菜单</button>
                        <button id="preview-dropdown-close" jq-button data-size="sm">关闭菜单</button>
                    </div>
                    <div id="preview-dropdown" jq-dropdown class="relative inline-block" data-dropdown-align="start" data-dropdown-pos="bottom">
                        <button jq-dropdown-trigger jq-button data-variant="primary">更多操作</button>
                        <div jq-dropdown-menu class="min-w-56">
                            <button jq-dropdown-item data-action="copy">复制代码</button>
                            <button jq-dropdown-item data-action="api">查看 API</button>
                            <button jq-dropdown-item data-action="source">跳转源码</button>
                        </div>
                    </div>
                    <div id="preview-dropdown-context" jq-dropdown data-dropdown-trigger="contextmenu" class="min-h-40 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-600">
                        <div class="grid gap-2">
                            <div class="font-medium text-slate-800">右键场景区</div>
                            <div>在这块区域点击右键，模拟文件夹空白处的上下文菜单。</div>
                            <div class="text-xs text-slate-500">支持鼠标右键，也支持键盘 ContextMenu / Shift+F10。</div>
                        </div>
                        <div jq-dropdown-menu class="min-w-56">
                            <button jq-dropdown-item data-action="new-file">新建文件</button>
                            <button jq-dropdown-item data-action="new-folder">新建文件夹</button>
                            <button jq-dropdown-item data-action="paste">粘贴</button>
                            <button jq-dropdown-item data-action="refresh">刷新</button>
                        </div>
                    </div>
                    <div id="preview-dropdown-state"></div>
                </div>
            `,
            select: `
                <div class="grid gap-4">
                    <div class="grid gap-4 lg:grid-cols-2">
                        <label class="grid gap-2 text-sm">
                            <span class="font-medium text-slate-700">单选 Select</span>
                            <select id="preview-select-single" jq-select data-placeholder="选择技术栈">
                                <option value="">请选择</option>
                                <option value="vue">Vue</option>
                                <option value="react">React</option>
                                <option value="svelte">Svelte</option>
                                <option value="solid">Solid</option>
                            </select>
                        </label>
                        <label class="grid gap-2 text-sm">
                            <span class="font-medium text-slate-700">多选 Select</span>
                            <select id="preview-select-multiple" jq-select multiple data-select-max="3" data-select-max-text="最多只能选择 3 项" data-helper-text="支持搜索与批量选择" data-placeholder="选择最多 3 项">
                                <option value="docs">Docs</option>
                                <option value="dashboard">Dashboard</option>
                                <option value="table">Table</option>
                                <option value="upload">Upload</option>
                                <option value="router">Router</option>
                            </select>
                        </label>
                    </div>
                    <label class="grid gap-2 text-sm">
                        <span class="font-medium text-slate-700">禁用态 Select</span>
                        <select id="preview-select-disabled" jq-select disabled data-placeholder="当前不可编辑">
                            <option value="locked" selected>Locked by policy</option>
                            <option value="editable">Editable</option>
                        </select>
                    </label>
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-select-open" jq-button data-size="sm" data-variant="primary">open(single)</button>
                        <button id="preview-select-set-single" jq-button data-size="sm">选中 React</button>
                        <button id="preview-select-set-multi" jq-button data-size="sm">设置多选值</button>
                        <button id="preview-select-limit" jq-button data-size="sm">触发上限提示</button>
                        <button id="preview-select-clear" jq-button data-size="sm">clear()</button>
                        <button id="preview-select-search" jq-button data-size="sm">search("do")</button>
                    </div>
                    <div id="preview-select-state"></div>
                </div>
            `,
            popover: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-popover-open" jq-button data-size="sm" data-variant="primary">open()</button>
                        <button id="preview-popover-toggle" jq-button data-size="sm">toggle()</button>
                        <button id="preview-popover-close" jq-button data-size="sm">close()</button>
                    </div>
                    <div id="preview-popover" jq-popover data-popover-pos="bottom">
                        <button jq-popover-trigger jq-button data-variant="primary">查看详情</button>
                        <section jq-popover-panel>
                            <div class="grid gap-3 min-w-56">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="font-semibold text-slate-800">Popover 内容</div>
                                    <span class="inline-flex h-7 items-center rounded-xl bg-primary/10 px-2.5 text-xs font-semibold text-primary">Live</span>
                                </div>
                                <p class="text-sm text-slate-500">适合承载说明、操作按钮、状态卡片，而不只是纯文字提示。</p>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                        <div class="font-semibold text-slate-800">42</div>
                                        <div>Actions</div>
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                        <div class="font-semibold text-slate-800">3</div>
                                        <div>Status</div>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button jq-button data-size="sm" data-variant="primary">保存</button>
                                    <button jq-button data-size="sm">取消</button>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div id="preview-popover-state"></div>
                </div>
            `,
            tooltip: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button jq-button data-tips="复制这段示例代码" data-tips-pos="top">顶部提示</button>
                        <button jq-button data-variant="primary" data-tips="用于说明危险操作" data-tips-pos="right">右侧提示</button>
                        <button jq-button data-tips="这里演示 bottom + large" data-tips-pos="bottom" data-tips-length="large">底部长提示</button>
                    </div>
                    <div id="preview-tooltip-state"></div>
                </div>
            `,
            modal: `
                <div class="grid gap-4">
                    <div class="flex gap-3 flex-wrap">
                        <button id="demo-modal-open" jq-button data-variant="primary">open()</button>
                        <button id="demo-modal-alert" jq-button>alert()</button>
                        <button id="demo-modal-confirm" jq-button>confirm()</button>
                        <button id="demo-modal-promise" jq-button data-size="sm">promise()</button>
                        <button id="demo-modal-update" jq-button data-size="sm">update()</button>
                        <button id="demo-modal-patch" jq-button data-size="sm">patch()</button>
                        <button id="demo-modal-close-all" jq-button data-size="sm">closeAll()</button>
                    </div>
                    <div id="preview-modal-state"></div>
                </div>
            `,
            drawer: `
                <div class="grid gap-4">
                    <div class="flex gap-3 flex-wrap">
                        <button id="demo-drawer-open" jq-button data-variant="primary">右侧抽屉</button>
                        <button id="demo-drawer-open-left" jq-button>左侧抽屉</button>
                        <button id="demo-drawer-update" jq-button data-size="sm">patch()</button>
                        <button id="demo-drawer-close-all" jq-button data-size="sm">closeAll()</button>
                    </div>
                    <div id="preview-drawer-state"></div>
                    <div id="drawer-content-template" class="hidden">
                        <div class="grid gap-3">
                            <div class="text-sm text-slate-600">这里可以放筛选器、表单或文档详情。</div>
                            <label class="grid gap-2 text-sm">
                                <span class="font-medium text-slate-700">组件分类</span>
                                <input class="h-10 px-3 rounded-lg border border-slate-200" placeholder="例如：overlay">
                            </label>
                        </div>
                    </div>
                </div>
            `,
            dialog: `
                <div class="grid gap-4">
                    <div class="flex gap-3 flex-wrap">
                        <button jq-dialog-trigger jq-target="#preview-dialog" jq-button data-variant="primary">打开 Dialog</button>
                        <button id="preview-dialog-open-api" jq-button data-size="sm">程序化打开</button>
                    </div>
                    <div id="preview-dialog-state"></div>
                </div>
                <div jq-dialog id="preview-dialog">
                    <div jq-dialog-backdrop></div>
                    <section jq-dialog-panel class="p-6">
                        <h3 class="text-xl font-bold text-slate-800">简单 Dialog</h3>
                        <p class="mt-2 text-sm text-slate-500">更轻的声明式实现。</p>
                        <button jq-dialog-close jq-button class="mt-4">关闭</button>
                    </section>
                </div>
            `,
            toast: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="demo-toast-show" jq-button>Show</button>
                        <button id="demo-toast-info" jq-button>Info</button>
                        <button id="demo-toast-success" jq-button data-variant="primary">Success</button>
                        <button id="demo-toast-warning" jq-button>Warning</button>
                        <button id="demo-toast-error" jq-button>Error</button>
                        <button id="demo-toast-loading" jq-button>Loading</button>
                    </div>
                    <div id="preview-toast-state"></div>
                </div>
            `,
            msg: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="demo-msg-show" jq-button>Show</button>
                        <button id="demo-msg-info" jq-button data-variant="primary">Info</button>
                        <button id="demo-msg-success" jq-button>Success</button>
                        <button id="demo-msg-warning" jq-button>Warning</button>
                        <button id="demo-msg-error" jq-button>Error</button>
                        <button id="demo-msg-loading" jq-button>Loading</button>
                    </div>
                    <div id="preview-msg-state"></div>
                </div>
            `,
            copy: `
                <div class="grid gap-3">
                    <pre id="copy-preview-source" class="!m-0"><code>npm i jquanui</code></pre>
                    <div class="flex gap-3 flex-wrap">
                        <button jq-copy-trigger data-copy-target="#copy-preview-source" data-copy-success="命令已复制" jq-button data-variant="primary">复制命令</button>
                        <button id="copy-api-btn" jq-button>copyText API</button>
                        <button id="copy-element-btn" jq-button data-size="sm">copyElement API</button>
                    </div>
                    <div id="preview-copy-state"></div>
                </div>
            `,
            codeBlock: `
                <div class="grid gap-4">
                    <div class="flex gap-3 flex-wrap">
                        <button id="preview-code-js" jq-button data-size="sm" data-variant="primary">JavaScript</button>
                        <button id="preview-code-html" jq-button data-size="sm">HTML</button>
                        <button id="preview-code-json" jq-button data-size="sm">JSON</button>
                        <button id="preview-code-refresh" jq-button data-size="sm">refresh()</button>
                    </div>
                    <div id="preview-code-state"></div>
                    <pre id="preview-code"><code class="language-js">
const table = JquanUIComponents.tableApi.mount('#table', {
  columns: [{ key: 'name', title: 'Name' }],
  data: [{ name: 'Modal' }]
});
                    </code></pre>
                </div>
            `,
            mdViewer: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-md-basic" jq-button data-size="sm" data-variant="primary">标题 / 列表</button>
                        <button id="preview-md-table" jq-button data-size="sm">表格 / 引用</button>
                        <button id="preview-md-code" jq-button data-size="sm">代码块</button>
                        <button id="preview-md-rich" jq-button data-size="sm">链接 / 任务 / 分割线</button>
                        <button id="preview-md-full" jq-button data-size="sm">综合语法</button>
                        <button id="preview-md-mermaid" jq-button data-size="sm">Mermaid</button>
                    </div>
                    <div id="preview-md-state"></div>
                    <div class="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">TOC</div>
                            <div id="preview-md-toc" class="mt-3"></div>
                        </div>
                        <div id="preview-md" class="min-h-[260px] rounded-xl border border-slate-200 bg-white p-6"></div>
                    </div>
                </div>
            `,
            carousel: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-carousel-prev" jq-button data-size="sm">prev()</button>
                        <button id="preview-carousel-next" jq-button data-size="sm" data-variant="primary">next()</button>
                        <button id="preview-carousel-go-3" jq-button data-size="sm">goTo(3)</button>
                        <button id="preview-carousel-page-2" jq-button data-size="sm">goToPage(2)</button>
                        <button id="preview-carousel-play" jq-button data-size="sm">play()</button>
                        <button id="preview-carousel-pause" jq-button data-size="sm">pause()</button>
                        <button id="preview-carousel-speed-fast" jq-button data-size="sm">interval 1800</button>
                        <button id="preview-carousel-speed-slow" jq-button data-size="sm">interval 4200</button>
                    </div>
                    <div id="preview-carousel-state"></div>
                    <section id="preview-carousel" class="w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-white" data-carousel-progress="true" data-carousel-indicators-target="#preview-carousel-dots" data-carousel-thumbs-target="#preview-carousel-thumbs">
                        <div jq-carousel-item data-carousel-thumb="Modal" class="h-56 text-white flex items-center justify-center bg-[linear-gradient(135deg,#4f46e5,#818cf8)]">
                            <div class="px-8 text-center">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Overlay</div>
                                <div class="mt-3 text-3xl font-bold">Modal</div>
                            </div>
                        </div>
                        <div jq-carousel-item data-carousel-thumb="Tabs" class="h-56 text-white flex items-center justify-center bg-[linear-gradient(135deg,#059669,#34d399)]">
                            <div class="px-8 text-center">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Navigation</div>
                                <div class="mt-3 text-3xl font-bold">Tabs</div>
                            </div>
                        </div>
                        <div jq-carousel-item data-carousel-thumb="Table" class="h-56 text-white flex items-center justify-center bg-[linear-gradient(135deg,#d97706,#fbbf24)]">
                            <div class="px-8 text-center">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Data</div>
                                <div class="mt-3 text-3xl font-bold">Table</div>
                            </div>
                        </div>
                        <div jq-carousel-item data-carousel-thumb="Toast" class="h-56 text-white flex items-center justify-center bg-[linear-gradient(135deg,#0f172a,#334155)]">
                            <div class="px-8 text-center">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Feedback</div>
                                <div class="mt-3 text-3xl font-bold">Toast</div>
                            </div>
                        </div>
                    </section>
                    <div id="preview-carousel-dots" class="flex justify-center"></div>
                    <div id="preview-carousel-thumbs"></div>
                    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                        <section id="preview-carousel-gallery-main" class="h-64 rounded-xl overflow-hidden border border-slate-200 bg-white" data-carousel-sync-target="#preview-carousel-gallery-nav">
                            <div jq-carousel-item data-carousel-thumb="Overview" class="h-64 text-white flex items-center justify-center bg-[linear-gradient(135deg,#1d4ed8,#60a5fa)]"><div class="px-8 text-center"><div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Gallery</div><div class="mt-3 text-3xl font-bold">Overview</div></div></div>
                            <div jq-carousel-item data-carousel-thumb="Analytics" class="h-64 text-white flex items-center justify-center bg-[linear-gradient(135deg,#7c3aed,#c084fc)]"><div class="px-8 text-center"><div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Gallery</div><div class="mt-3 text-3xl font-bold">Analytics</div></div></div>
                            <div jq-carousel-item data-carousel-thumb="Automation" class="h-64 text-white flex items-center justify-center bg-[linear-gradient(135deg,#0f766e,#2dd4bf)]"><div class="px-8 text-center"><div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Gallery</div><div class="mt-3 text-3xl font-bold">Automation</div></div></div>
                            <div jq-carousel-item data-carousel-thumb="Delivery" class="h-64 text-white flex items-center justify-center bg-[linear-gradient(135deg,#b45309,#f59e0b)]"><div class="px-8 text-center"><div class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Gallery</div><div class="mt-3 text-3xl font-bold">Delivery</div></div></div>
                        </section>
                        <section id="preview-carousel-gallery-nav" class="h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-50" data-carousel-sync-target="#preview-carousel-gallery-main">
                            <div jq-carousel-item data-carousel-thumb="Overview" class="h-16 text-slate-800 flex items-center justify-center bg-white border-b border-slate-200">Overview</div>
                            <div jq-carousel-item data-carousel-thumb="Analytics" class="h-16 text-slate-800 flex items-center justify-center bg-white border-b border-slate-200">Analytics</div>
                            <div jq-carousel-item data-carousel-thumb="Automation" class="h-16 text-slate-800 flex items-center justify-center bg-white border-b border-slate-200">Automation</div>
                            <div jq-carousel-item data-carousel-thumb="Delivery" class="h-16 text-slate-800 flex items-center justify-center bg-white">Delivery</div>
                        </section>
                    </div>
                </div>
            `,
            infiniteScroll: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-marquee-play" jq-button data-size="sm" data-variant="primary">play()</button>
                        <button id="preview-marquee-pause" jq-button data-size="sm">pause()</button>
                        <button id="preview-marquee-speed-up" jq-button data-size="sm">speed 2.4</button>
                        <button id="preview-marquee-speed-down" jq-button data-size="sm">speed 0.6</button>
                    </div>
                    <div id="preview-marquee-state"></div>
                    <section id="preview-marquee" class="w-full py-3 border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                        <div jq-infinite-scroll-content>
                            <div class="h-12 px-5 rounded-xl border border-slate-200 bg-white inline-flex items-center font-semibold text-slate-700 shadow-sm">Modal</div>
                            <div class="h-12 px-5 rounded-xl border border-slate-200 bg-white inline-flex items-center font-semibold text-slate-700 shadow-sm">Toast</div>
                            <div class="h-12 px-5 rounded-xl border border-slate-200 bg-white inline-flex items-center font-semibold text-slate-700 shadow-sm">Table</div>
                            <div class="h-12 px-5 rounded-xl border border-slate-200 bg-white inline-flex items-center font-semibold text-slate-700 shadow-sm">Upload</div>
                            <div class="h-12 px-5 rounded-xl border border-slate-200 bg-white inline-flex items-center font-semibold text-slate-700 shadow-sm">Router</div>
                            <div class="h-12 px-5 rounded-xl border border-slate-200 bg-white inline-flex items-center font-semibold text-slate-700 shadow-sm">Store</div>
                        </div>
                    </section>
                </div>
            `,
            video: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-video-play" jq-button data-variant="primary">play()</button>
                        <button id="preview-video-pause" jq-button data-size="sm">pause()</button>
                        <button id="preview-video-seek" jq-button data-size="sm">seek(2s)</button>
                        <button id="preview-video-mute" jq-button data-size="sm">mute()</button>
                    </div>
                    <div id="preview-video-state"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section id="preview-video" jq-video class="grid gap-3">
                            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
                                <video jq-video-media class="block h-64 w-full bg-black object-cover" playsinline poster=""></video>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div class="flex flex-wrap items-center gap-3">
                                    <button jq-video-play jq-button data-size="sm" data-variant="primary">Play</button>
                                    <button jq-video-mute jq-button data-size="sm">Mute</button>
                                    <button jq-video-fullscreen jq-button data-size="sm">Fullscreen</button>
                                    <button jq-video-pip jq-button data-size="sm">PiP</button>
                                    <div class="ml-auto text-xs text-slate-500"><span jq-video-current>00:00</span> / <span jq-video-duration>00:00</span></div>
                                </div>
                                <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
                                    <input jq-video-progress type="range" min="0" max="100" value="0" class="w-full">
                                    <input jq-video-volume type="range" min="0" max="100" value="100" class="w-full">
                                </div>
                            </div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">控制:</span> 播放、暂停、静音、Seek、音量</div>
                                <div><span class="font-semibold text-slate-800">增强:</span> Fullscreen、Picture-in-Picture</div>
                                <div><span class="font-semibold text-slate-800">API:</span> play、pause、toggle、setSource</div>
                                <div><span class="font-semibold text-slate-800">事件:</span> ready、play、pause、timeupdate、ended</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            audio: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-audio-play" jq-button data-variant="primary">play()</button>
                        <button id="preview-audio-pause" jq-button data-size="sm">pause()</button>
                        <button id="preview-audio-seek" jq-button data-size="sm">seek(1s)</button>
                        <button id="preview-audio-volume" jq-button data-size="sm">volume 30%</button>
                    </div>
                    <div id="preview-audio-state"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section id="preview-audio" jq-audio class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <audio jq-audio-media preload="metadata"></audio>
                            <div class="flex flex-wrap items-center gap-3">
                                <button jq-audio-play jq-button data-size="sm" data-variant="primary">Play</button>
                                <button jq-audio-mute jq-button data-size="sm">Mute</button>
                                <div class="ml-auto text-xs text-slate-500"><span jq-audio-current>00:00</span> / <span jq-audio-duration>00:00</span></div>
                            </div>
                            <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
                                <input jq-audio-progress type="range" min="0" max="100" value="0" class="w-full">
                                <input jq-audio-volume type="range" min="0" max="100" value="100" class="w-full">
                            </div>
                            <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                                这个预览会在页面里生成一个本地音频片段，不依赖外网资源。
                            </div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">控制:</span> 播放、暂停、Seek、音量、静音</div>
                                <div><span class="font-semibold text-slate-800">资源:</span> 支持动态切换 src</div>
                                <div><span class="font-semibold text-slate-800">API:</span> play、pause、toggle、setVolume</div>
                                <div><span class="font-semibold text-slate-800">事件:</span> ready、play、pause、timeupdate、ended</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            pagination: `
                <div class="grid gap-4">
                    <div class="flex gap-3 flex-wrap">
                        <button id="preview-pagination-prev" jq-button data-size="sm">上一页</button>
                        <button id="preview-pagination-next" jq-button data-size="sm">下一页</button>
                        <button id="preview-pagination-size" jq-button data-size="sm">pageSize 20</button>
                    </div>
                    <div id="preview-pagination-state"></div>
                    <div id="preview-pagination"></div>
                </div>
            `,
            numberInput: `
                <div class="grid gap-4">
                    <div class="grid gap-4 md:grid-cols-3">
                        <label class="grid gap-2 text-sm">
                            <span class="font-medium text-slate-700">基础数字</span>
                            <input id="preview-number" jq-number-input type="number" min="0" max="100" step="1" data-number-large-step="10" value="20" class="w-24">
                        </label>
                        <label class="grid gap-2 text-sm">
                            <span class="font-medium text-slate-700">快捷步进</span>
                            <input id="preview-number-quick" jq-number-input type="number" min="0" max="500" step="5" data-number-large-step="50" data-number-quick-steps="-50,50,100" value="100" class="w-28">
                        </label>
                        <label class="grid gap-2 text-sm">
                            <span class="font-medium text-slate-700">只读态</span>
                            <input id="preview-number-readonly" jq-number-input type="number" value="24" readonly class="w-24">
                        </label>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-number-set" jq-button data-variant="primary" data-size="sm">setValue(50)</button>
                        <button id="preview-number-step" jq-button data-size="sm">step(10)</button>
                        <button id="preview-number-reset" jq-button data-size="sm">reset()</button>
                    </div>
                    <div id="preview-number-state"></div>
                </div>
            `,
            table: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-table-filter-overlay" jq-button data-variant="primary">筛选 overlay</button>
                        <button id="preview-table-filter-clear" jq-button>清空筛选</button>
                        <button id="preview-table-refresh" jq-button data-size="sm">reload()</button>
                        <button id="preview-table-clear-selection" jq-button data-size="sm">clearSelection()</button>
                        <button id="preview-table-loading" jq-button data-size="sm">setLoading()</button>
                    </div>
                    <div id="preview-table-state"></div>
                    <div id="preview-table"></div>
                </div>
            `,
            upload: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-upload-add" jq-button data-variant="primary">添加示例文件</button>
                        <button id="preview-upload-files" jq-button>files()</button>
                        <button id="preview-upload-remove" jq-button data-size="sm">remove()</button>
                        <button id="preview-upload-retry" jq-button data-size="sm">retry()</button>
                        <button id="preview-upload-preview" jq-button data-size="sm">preview()</button>
                        <button id="preview-upload-upload" jq-button data-size="sm">upload()</button>
                        <button id="preview-upload-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-upload-state"></div>
                    <div id="preview-upload"></div>
                </div>
            `,
            formValidator: `
                <form id="preview-form" class="grid gap-3">
                    <label class="grid gap-2 text-sm">
                        <span class="font-medium text-slate-700">邮箱</span>
                        <input type="email" name="email" class="h-11 px-3 rounded-xl border border-slate-200" placeholder="name@example.com">
                    </label>
                    <div class="flex flex-wrap gap-3">
                        <button type="submit" jq-button data-variant="primary">提交校验</button>
                        <button id="preview-form-check" type="button" jq-button>validateField</button>
                        <button id="preview-form-invalid" type="button" jq-button data-size="sm">填入错误值</button>
                        <button id="preview-form-valid" type="button" jq-button data-size="sm">填入正确值</button>
                    </div>
                    <div id="preview-form-result"></div>
                </form>
            `,
            tagInput: `
                <div class="grid gap-4">
                    <label class="grid gap-2 text-sm">
                        <span class="font-medium text-slate-700">标签输入</span>
                        <input id="preview-tag-input" jq-tag-input data-tag-max="5" data-tag-max-text="最多保留 5 个标签" data-tag-duplicate-text="该标签已存在" data-tag-invalid-text="仅允许字母、数字与短横线" data-tag-suggestions='["Vue","React","Svelte","Docs","Dashboard","Table","Router"]' value="Docs,Dashboard" placeholder="输入标签后按回车">
                    </label>
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-tag-add" jq-button data-size="sm" data-variant="primary">add("Vue")</button>
                        <button id="preview-tag-add-many" jq-button data-size="sm">setTags(...)</button>
                        <button id="preview-tag-overflow" jq-button data-size="sm">触发上限</button>
                        <button id="preview-tag-duplicate" jq-button data-size="sm">触发重复</button>
                        <button id="preview-tag-remove" jq-button data-size="sm">remove("Docs")</button>
                        <button id="preview-tag-clear" jq-button data-size="sm">clear()</button>
                        <button id="preview-tag-focus" jq-button data-size="sm">focus()</button>
                    </div>
                    <div id="preview-tag-state"></div>
                </div>
            `,
            template: `
                <div class="grid gap-4">
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div class="max-w-2xl">
                                <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Template Engine</div>
                                <div class="mt-2 text-2xl font-bold tracking-tight text-slate-900">配置驱动内容块与后台页面拼装</div>
                                <p class="mt-3 text-sm leading-7 text-slate-500">这一页不是只演示变量替换，而是把模板引擎最关键的几类能力都摊开：列表渲染、布局/插槽、异步片段、依赖分析、安全拦截，以及在线编辑调试。</p>
                            </div>
                            <div class="grid gap-2 text-right">
                                <div class="inline-flex items-center justify-end rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">Enterprise Preview</div>
                                <div class="text-xs text-slate-400">PbootCMS 风格的内容拼装体验</div>
                            </div>
                        </div>
                    </div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div class="grid gap-4">
                            <div class="rounded-2xl border border-slate-200 bg-white p-4">
                                <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Render Flow</div>
                                <div class="mt-3 flex flex-wrap gap-3">
                                    <button id="preview-template-render" jq-button data-size="sm" data-variant="primary">render()</button>
                                    <button id="preview-template-patch" jq-button data-size="sm">patch()</button>
                                    <button id="preview-template-empty" jq-button data-size="sm">空列表</button>
                                    <button id="preview-template-price" jq-button data-size="sm">切换报价</button>
                                    <button id="preview-template-raw" jq-button data-size="sm">字符串渲染</button>
                                </div>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white p-4">
                                <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Composition</div>
                                <div class="mt-3 flex flex-wrap gap-3">
                                    <button id="preview-template-layout" jq-button data-size="sm">布局 + 插槽</button>
                                    <button id="preview-template-object" jq-button data-size="sm">对象遍历</button>
                                    <button id="preview-template-async" jq-button data-size="sm">异步模板</button>
                                    <button id="preview-template-playground" jq-button data-size="sm">在线编辑器</button>
                                </div>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white p-4">
                                <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Debug & Safety</div>
                                <div class="mt-3 flex flex-wrap gap-3">
                                    <button id="preview-template-cache" jq-button data-size="sm">缓存状态</button>
                                    <button id="preview-template-deps" jq-button data-size="sm">依赖图</button>
                                    <button id="preview-template-ast" jq-button data-size="sm">AST</button>
                                    <button id="preview-template-cycle" jq-button data-size="sm">循环检测</button>
                                    <button id="preview-template-safe" jq-button data-size="sm">安全模式</button>
                                </div>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Use Cases</div>
                            <div class="mt-3 grid gap-3">
                                <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                    <div class="text-sm font-semibold text-slate-900">CMS 栏目块</div>
                                    <div class="mt-1 text-sm text-slate-500">列表、详情、推荐位、碎片化内容卡片。</div>
                                </div>
                                <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                    <div class="text-sm font-semibold text-slate-900">后台工作台</div>
                                    <div class="mt-1 text-sm text-slate-500">概览卡片、统计分区、可配置布局与条件区块。</div>
                                </div>
                                <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                    <div class="text-sm font-semibold text-slate-900">邮件 / 运营位</div>
                                    <div class="mt-1 text-sm text-slate-500">多模板片段复用、过滤器格式化与安全控制。</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="preview-template-state"></div>
                    <script type="text/jq-template" id="preview-template-main">
                        {% set total = items | length %}
                        <section class="grid gap-4">
                            <header class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <div>
                                    <div class="text-lg font-semibold text-slate-900">{{ title }}</div>
                                    <div class="mt-1 text-sm text-slate-500">{{ subtitle || '组件文档驱动视图' }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total</div>
                                    <div class="mt-1 text-2xl font-bold text-slate-900">{{ total }}</div>
                                </div>
                            </header>
                            {% if total %}
                                <div class="grid gap-3 lg:grid-cols-2">
                                    {% for item in items %}
                                        {% include "preview-template-card" with { item: item } %}
                                    {% endfor %}
                                </div>
                            {% else %}
                                <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                    当前没有数据，可通过 patch() 或 setData() 重新渲染。
                                </div>
                            {% endif %}
                        </section>
                    </script>
                    <script type="text/jq-template" id="preview-template-layout-page">
                        {% layout "preview-template-shell" with { pageTitle: title, pageNote: note } %}
                            {% slot "hero" %}
                                <div class="grid gap-2">
                                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Enterprise Layout</div>
                                    <div class="text-2xl font-bold text-slate-900">{{ title }}</div>
                                    <div class="text-sm text-slate-500">{{ note }}</div>
                                </div>
                            {% endslot %}
                            {% slot "body" %}
                                <div class="grid gap-3 md:grid-cols-3">
                                    {% for key, stat in stats %}
                                        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                                            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ key }}</div>
                                            <div class="mt-2 text-2xl font-bold text-slate-900">{{ stat.value }}</div>
                                            {% if stat.value >= 90 %}
                                                <div class="mt-1 text-sm font-medium text-emerald-600">Excellent</div>
                                            {% elseif stat.value >= 70 %}
                                                <div class="mt-1 text-sm font-medium text-blue-600">Healthy</div>
                                            {% else %}
                                                <div class="mt-1 text-sm font-medium text-amber-600">Needs Attention</div>
                                            {% endif %}
                                        </div>
                                    {% endfor %}
                                </div>
                            {% endslot %}
                            {% slot "aside" %}
                                <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                    <div class="text-sm font-semibold text-slate-900">Feature Flags</div>
                                    <div class="mt-3 grid gap-2 text-sm text-slate-500">
                                        {% for key, flag in flags %}
                                            <div class="flex items-center justify-between gap-3">
                                                <span>{{ key }}</span>
                                                {% if flag %}
                                                    <span class="text-emerald-600 font-semibold">ON</span>
                                                {% else %}
                                                    <span class="text-slate-400 font-semibold">OFF</span>
                                                {% endif %}
                                            </div>
                                        {% endfor %}
                                    </div>
                                </div>
                            {% endslot %}
                        {% endlayout %}
                    </script>
                    <template id="preview-template-shell">
                        <section class="grid gap-4">
                            <header class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                                {% renderSlot "hero" %}
                            </header>
                            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                                <div>{% renderSlot "body" %}</div>
                                <aside>{% renderSlot "aside" %}</aside>
                            </div>
                            <footer class="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                                {{ pageNote || 'Layout footer' }}
                            </footer>
                        </section>
                    </template>
                    <template id="preview-template-card">
                        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <div class="font-semibold text-slate-900">{{ item.name | upper }}</div>
                                    <div class="mt-1 text-sm text-slate-500">{{ item.desc }}</div>
                                </div>
                                {% if item.stable %}
                                    <span class="inline-flex rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">{{ item.stable | badge }}</span>
                                {% else %}
                                    <span class="inline-flex rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">{{ item.stable | badge }}</span>
                                {% endif %}
                            </div>
                            <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                <div class="text-xs font-medium text-slate-400">Price</div>
                                <div class="text-sm font-semibold text-slate-800">{{ item.price | currency('CNY', 'zh-CN') }}</div>
                            </div>
                        </article>
                    </template>
                    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div id="preview-template" class="min-w-0 p-4"></div>
                    </div>
                    <div id="preview-template-playground-panel" class="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div class="text-sm font-semibold text-slate-900">在线模板编辑器</div>
                                <div class="mt-1 text-sm text-slate-500">直接在文档里修改模板、运行、看 AST 与错误定位。</div>
                            </div>
                            <div class="text-xs text-slate-400">safeExpressions 默认开启</div>
                        </div>
                        <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <label class="grid gap-2 text-sm">
                                <span class="font-medium text-slate-700">Template Source</span>
                                <textarea id="preview-template-editor" class="min-h-[280px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] leading-6 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20">{% if title %}
<section class="grid gap-3">
  <h3 class="text-xl font-semibold text-slate-900">{{ title }}</h3>
  <div class="grid gap-3">
    {% for item in items %}
      <div class="rounded-2xl border border-slate-200 bg-white p-4">{{ item.name }}</div>
    {% endfor %}
  </div>
</section>
{% endif %}</textarea>
                            </label>
                            <div class="grid gap-2 text-sm">
                                <span class="font-medium text-slate-700">Rendered Output</span>
                                <div id="preview-template-live" class="min-h-[280px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4"></div>
                            </div>
                        </div>
                        <div class="mt-4 flex flex-wrap gap-3">
                            <button id="preview-template-run" jq-button data-size="sm" data-variant="primary">运行模板</button>
                            <button id="preview-template-broken" jq-button data-size="sm">注入错误</button>
                        </div>
                    </div>
                    <div id="preview-template-render-output"></div>
                    <div id="preview-template-debug"></div>
                </div>
            `,
            crud: `
                <div class="grid gap-4">
                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div class="max-w-2xl">
                                <div class="font-semibold text-slate-800">组件管理工作台</div>
                                <p class="mt-2 text-sm leading-6 text-slate-500">这个预览不再只演示 API 名称，而是直接展示增、改、删、重载后的数据变化。Crud 本质上是 table + modal + formValidator + request 的组合工作流。</p>
                            </div>
                            <div class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                                Live Preview
                            </div>
                        </div>
                    </div>
                    <div id="preview-crud-metrics" class="grid gap-3 md:grid-cols-3"></div>
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-crud-create" jq-button data-variant="primary">新增一条记录</button>
                        <button id="preview-crud-edit" jq-button>修改第一条</button>
                        <button id="preview-crud-remove" jq-button>删除最后一条</button>
                        <button id="preview-crud-reload" jq-button data-size="sm">reload()</button>
                    </div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div id="preview-crud-root"></div>
                        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">最近动作</div>
                            <div id="preview-crud-log" class="mt-3 grid gap-2"></div>
                        </div>
                    </div>
                    <div id="preview-crud-state"></div>
                </div>
            `,
            router: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="router-home" jq-button data-size="sm" data-variant="primary">push 首页</button>
                        <button id="router-about" jq-button data-size="sm">push 关于</button>
                        <button id="router-guides" jq-button data-size="sm">replace 指南</button>
                        <button id="router-clear-cache" jq-button data-size="sm">clearCache()</button>
                    </div>
                    <div id="preview-router-state"></div>
                    <div id="preview-router-view" class="rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-[140px]"></div>
                </div>
            `,
            appShell: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-shell-open-overview" jq-button data-size="sm" data-variant="primary">打开概览</button>
                        <button id="preview-shell-open-components" jq-button data-size="sm">打开组件</button>
                        <button id="preview-shell-open-settings" jq-button data-size="sm">打开设置</button>
                        <button id="preview-shell-close-settings" jq-button data-size="sm">关闭设置标签</button>
                    </div>
                    <div id="preview-shell-state"></div>
                    <div id="preview-shell" class="overflow-hidden rounded-xl border border-slate-200 min-h-[340px]"></div>
                </div>
            `,
            http: `
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-http-build" jq-button data-variant="primary">构造请求配置</button>
                        <button id="preview-http-request" jq-button data-size="sm">请求模拟接口</button>
                    </div>
                    <div id="preview-http-output"></div>
                </div>
            `,
            i18n: `
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-lang-zh" jq-button data-size="sm">中文</button>
                        <button id="preview-lang-en" jq-button data-size="sm">English</button>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-i18n-text" class="font-semibold text-slate-800"></div>
                        <div id="preview-i18n-meta" class="mt-2 text-sm text-slate-500"></div>
                        <p id="preview-i18n-bound" data-i18n="common.demo.bound" class="mt-3 text-sm text-slate-700"></p>
                        <input id="preview-i18n-placeholder" data-i18n-placeholder="common.demo.placeholder" class="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" aria-label="Translated input">
                    </div>
                </div>
            `,
            permission: `
                <div class="grid gap-3">
                    <div class="flex gap-3">
                        <button id="preview-role-editor" jq-button data-size="sm">设为 editor</button>
                        <button id="preview-role-admin" jq-button data-size="sm" data-variant="primary">设为 admin</button>
                    </div>
                    <div id="preview-permission-output"></div>
                </div>
            `,
            store: `
                <div class="grid gap-3">
                    <div class="flex gap-3">
                        <button id="preview-store-inc" jq-button data-variant="primary">count + 1</button>
                        <button id="preview-store-patch" jq-button>patch title</button>
                    </div>
                    <div id="preview-store-output"></div>
                </div>
            `,
            storage: `
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-storage-set" jq-button data-variant="primary">写入</button>
                        <button id="preview-storage-read" jq-button>读取</button>
                        <button id="preview-storage-keys" jq-button data-size="sm">keys()</button>
                    </div>
                    <div id="preview-storage-output"></div>
                </div>
            `,
            localStorage: `
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-localstorage-run" jq-button data-variant="primary">写入并读取</button>
                        <button id="preview-localstorage-many" jq-button data-size="sm">setMany()</button>
                    </div>
                    <div id="preview-localstorage-output"></div>
                </div>
            `,
            sessionStorage: `
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-sessionstorage-run" jq-button data-variant="primary">写入并读取</button>
                        <button id="preview-sessionstorage-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-sessionstorage-output"></div>
                </div>
            `,
            cookie: `
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-cookie-run" jq-button data-variant="primary">写入并读取</button>
                        <button id="preview-cookie-remove" jq-button data-size="sm">remove()</button>
                    </div>
                    <div id="preview-cookie-output"></div>
                </div>
            `,
            watermark: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-watermark-default" jq-button data-variant="primary">默认水印</button>
                        <button id="preview-watermark-confidential" jq-button data-size="sm">Confidential</button>
                        <button id="preview-watermark-light" jq-button data-size="sm">低透明度</button>
                        <button id="preview-watermark-destroy" jq-button data-size="sm">destroy()</button>
                    </div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section id="preview-watermark" jq-watermark data-watermark-text="JquanUI" data-watermark-subtext="Internal Preview" class="min-h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div class="max-w-xl">
                                <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Protected Surface</div>
                                <h3 class="mt-3 text-2xl font-bold text-slate-900">Dashboard Overview</h3>
                                <p class="mt-3 text-sm leading-7 text-slate-500">这个预览区会直接挂真实水印层。你可以用它给报表预览、合同草稿、内部演示环境加重复文字标识。</p>
                                <div class="mt-5 grid gap-3 sm:grid-cols-3">
                                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div class="text-xs text-slate-400">Owner</div>
                                        <div class="mt-2 text-sm font-semibold text-slate-800">Design System</div>
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div class="text-xs text-slate-400">Status</div>
                                        <div class="mt-2 text-sm font-semibold text-emerald-700">Internal Draft</div>
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div class="text-xs text-slate-400">Version</div>
                                        <div class="mt-2 text-sm font-semibold text-slate-800">v1.0.0</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">视觉:</span> 平铺文字、旋转角度、透明度、副标题</div>
                                <div><span class="font-semibold text-slate-800">API:</span> mount、update、refresh、destroy</div>
                                <div><span class="font-semibold text-slate-800">事件:</span> apply、update、destroy</div>
                                <div><span class="font-semibold text-slate-800">场景:</span> 报表、合同、内网演示、后台截图</div>
                            </div>
                        </aside>
                    </div>
                    <div id="preview-watermark-output"></div>
                </div>
            `,
            export: `
                <div class="grid gap-4">
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section id="preview-export" jq-export data-export-source="#preview-export-table" data-export-filename="component-ops" class="grid gap-4">
                            <div class="flex flex-wrap gap-3">
                                <button jq-export-trigger data-export-format="csv" jq-button data-variant="primary">导出 CSV</button>
                                <button jq-export-trigger data-export-format="json" jq-button data-size="sm">导出 JSON</button>
                                <button jq-export-trigger data-export-format="txt" jq-button data-size="sm">导出 TXT</button>
                                <button id="preview-export-serialize" jq-button data-size="sm">serialize()</button>
                            </div>
                            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <table id="preview-export-table" class="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead class="bg-slate-50 text-left text-slate-500">
                                        <tr>
                                            <th class="px-4 py-3 font-medium">ID</th>
                                            <th class="px-4 py-3 font-medium">Owner</th>
                                            <th class="px-4 py-3 font-medium">Status</th>
                                            <th class="px-4 py-3 font-medium">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 text-slate-700">
                                        <tr>
                                            <td class="px-4 py-3">CMP-1001</td>
                                            <td class="px-4 py-3">Docs Team</td>
                                            <td class="px-4 py-3">Ready</td>
                                            <td class="px-4 py-3">2026-05-21</td>
                                        </tr>
                                        <tr>
                                            <td class="px-4 py-3">CMP-1002</td>
                                            <td class="px-4 py-3">UI Core</td>
                                            <td class="px-4 py-3">Review</td>
                                            <td class="px-4 py-3">2026-05-19</td>
                                        </tr>
                                        <tr>
                                            <td class="px-4 py-3">CMP-1003</td>
                                            <td class="px-4 py-3">Platform</td>
                                            <td class="px-4 py-3">Draft</td>
                                            <td class="px-4 py-3">2026-05-17</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">格式:</span> csv、json、txt</div>
                                <div><span class="font-semibold text-slate-800">来源:</span> 数组、Table、JSON Script</div>
                                <div><span class="font-semibold text-slate-800">API:</span> mount、download、serialize、table</div>
                                <div><span class="font-semibold text-slate-800">事件:</span> before、success、error</div>
                            </div>
                        </aside>
                    </div>
                    <div id="preview-export-output"></div>
                </div>
            `,
            print: `
                <div class="grid gap-4">
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <section id="preview-print" jq-print data-print-target="#preview-print-panel" class="grid gap-4">
                        <div class="flex flex-wrap gap-3">
                            <button jq-print-trigger jq-button data-variant="primary">打印账单</button>
                            <button id="preview-print-compact" jq-button data-size="sm">紧凑页边距</button>
                        </div>
                        <article id="preview-print-panel" jq-print-content class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Invoice</div>
                                    <h3 class="mt-3 text-2xl font-bold text-slate-900">JQ-2026-051</h3>
                                    <div class="mt-2 text-sm text-slate-500">Acme Product Studio</div>
                                </div>
                                <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-emerald-700">Paid</div>
                            </div>
                            <div class="mt-6 grid gap-3 sm:grid-cols-3">
                                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div class="text-xs text-slate-400">Owner</div>
                                    <div class="mt-2 text-sm font-semibold text-slate-800">Design System</div>
                                </div>
                                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div class="text-xs text-slate-400">Period</div>
                                    <div class="mt-2 text-sm font-semibold text-slate-800">May 2026</div>
                                </div>
                                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div class="text-xs text-slate-400">Amount</div>
                                    <div class="mt-2 text-sm font-semibold text-slate-800">$12,800</div>
                                </div>
                            </div>
                            <div class="mt-6 overflow-hidden rounded-xl border border-slate-200">
                                <table class="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead class="bg-slate-50 text-left text-slate-500">
                                        <tr>
                                            <th class="px-4 py-3 font-medium">Item</th>
                                            <th class="px-4 py-3 font-medium">Qty</th>
                                            <th class="px-4 py-3 font-medium">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 text-slate-700">
                                        <tr>
                                            <td class="px-4 py-3">UI Audit</td>
                                            <td class="px-4 py-3">1</td>
                                            <td class="px-4 py-3">$3,800</td>
                                        </tr>
                                        <tr>
                                            <td class="px-4 py-3">Component Upgrade</td>
                                            <td class="px-4 py-3">2</td>
                                            <td class="px-4 py-3">$9,000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </section>
                    <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">支持能力</div>
                        <div class="mt-3 grid gap-2 text-xs text-slate-600">
                            <div><span class="font-semibold text-slate-800">目标:</span> 只打印局部节点</div>
                            <div><span class="font-semibold text-slate-800">样式:</span> 复制当前样式，可自定义 pageStyle</div>
                            <div><span class="font-semibold text-slate-800">API:</span> mount、print、update、destroy</div>
                            <div><span class="font-semibold text-slate-800">事件:</span> before、after、error</div>
                        </div>
                    </aside>
                    </div>
                    <div id="preview-print-output"></div>
                </div>
            `,
            tree: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-tree-expand-all" jq-button data-variant="primary">expandAll()</button>
                        <button id="preview-tree-collapse-all" jq-button data-size="sm">collapseAll()</button>
                        <button id="preview-tree-append" jq-button data-size="sm">append()</button>
                        <button id="preview-tree-rename" jq-button data-size="sm">update()</button>
                        <button id="preview-tree-remove" jq-button data-size="sm">remove()</button>
                    </div>
                    <div id="preview-tree-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">栏目树预览</div>
                            <div class="mt-1 text-xs text-slate-500">点击节点标题触发 select，点击加减号展开/收起，勾选框会向下级联。</div>
                            <div id="preview-tree" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">结构:</span> 栏目树、菜单树、权限树</div>
                                <div><span class="font-semibold text-slate-800">控制:</span> 展开、收起、选择、勾选级联</div>
                                <div><span class="font-semibold text-slate-800">API:</span> append、update、remove、expandAll</div>
                                <div><span class="font-semibold text-slate-800">事件:</span> select、check、expand、update</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            schemaForm: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-schema-set-values" jq-button data-variant="primary">setValues()</button>
                        <button id="preview-schema-validate" jq-button data-size="sm">validate()</button>
                        <button id="preview-schema-reset" jq-button data-size="sm">reset()</button>
                        <button id="preview-schema-patch" jq-button data-size="sm">patchSchema()</button>
                    </div>
                    <div id="preview-schema-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">文章编辑表单</div>
                            <div class="mt-1 text-xs text-slate-500">左侧是真实 schema 渲染结果，按钮会直接调用 setValues / validate / patchSchema。</div>
                            <div id="preview-schema-form" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">字段:</span> text、textarea、select、switch、number、date、email</div>
                                <div><span class="font-semibold text-slate-800">规则:</span> required、min/max、minLength/maxLength</div>
                                <div><span class="font-semibold text-slate-800">API:</span> setValue、setValues、validate、reset、patchSchema</div>
                                <div><span class="font-semibold text-slate-800">场景:</span> 动态表单、模型配置、内容录入、设置页</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            mediaPicker: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-media-select-cover" jq-button data-variant="primary">select(cover)</button>
                        <button id="preview-media-select-video" jq-button data-size="sm">select(video)</button>
                        <button id="preview-media-clear" jq-button data-size="sm">clear()</button>
                        <button id="preview-media-list" jq-button data-size="sm">view=list</button>
                    </div>
                    <div id="preview-media-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">素材库预览</div>
                            <div class="mt-1 text-xs text-slate-500">可以切换网格/列表、筛选 image/video/file，并实时查看当前选中 payload。</div>
                            <div id="preview-media-picker" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">视图:</span> grid / list</div>
                                <div><span class="font-semibold text-slate-800">筛选:</span> all / image / video / file</div>
                                <div><span class="font-semibold text-slate-800">选择:</span> single / multiple</div>
                                <div><span class="font-semibold text-slate-800">API:</span> setItems、select、deselect、clear、values</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            relationPicker: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-relation-select-post" jq-button data-variant="primary">select(post)</button>
                        <button id="preview-relation-select-author" jq-button data-size="sm">select(author)</button>
                        <button id="preview-relation-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-relation-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">关联记录预览</div>
                            <div class="mt-1 text-xs text-slate-500">支持搜索和单选/多选，可用于相关文章、作者、标签、关联产品选择。</div>
                            <div id="preview-relation-picker" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">模式:</span> single / multiple</div>
                                <div><span class="font-semibold text-slate-800">搜索:</span> title / id / 自定义 searchKeys</div>
                                <div><span class="font-semibold text-slate-800">API:</span> setItems、select、deselect、clear、values</div>
                                <div><span class="font-semibold text-slate-800">场景:</span> 作者、相关文章、标签、产品关联</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            filterBuilder: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-filter-append" jq-button data-variant="primary">appendRule()</button>
                        <button id="preview-filter-preset" jq-button data-size="sm">setRules()</button>
                        <button id="preview-filter-or" jq-button data-size="sm">setLogic(OR)</button>
                        <button id="preview-filter-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-filter-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">内容列表筛选器</div>
                            <div class="mt-1 text-xs text-slate-500">字段、操作符和值都可直接编辑，右侧会实时展示支持能力和下方 payload。</div>
                            <div id="preview-filter-builder" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">逻辑:</span> AND / OR 顶层组合</div>
                                <div><span class="font-semibold text-slate-800">字段:</span> status、author、views、category、createdAt</div>
                                <div><span class="font-semibold text-slate-800">操作符:</span> equals、contains、gt、lt、in</div>
                                <div><span class="font-semibold text-slate-800">输出:</span> rules()、payload()、state()、query preview</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            queryToolbar: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-query-keyword" jq-button data-variant="primary">setKeyword()</button>
                        <button id="preview-query-filters" jq-button data-size="sm">setFilters()</button>
                        <button id="preview-query-sort" jq-button data-size="sm">setSort()</button>
                        <button id="preview-query-apply" jq-button data-size="sm">apply()</button>
                        <button id="preview-query-reset" jq-button data-size="sm">reset()</button>
                    </div>
                    <div id="preview-query-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">内容列表查询工具栏</div>
                            <div class="mt-1 text-xs text-slate-500">搜索、状态、分类、日期和排序都在同一层，适合内容管理和后台数据列表。</div>
                            <div id="preview-query-toolbar" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">搜索:</span> keyword 输入</div>
                                <div><span class="font-semibold text-slate-800">筛选:</span> status、category、createdAt</div>
                                <div><span class="font-semibold text-slate-800">排序:</span> newest、oldest、views</div>
                                <div><span class="font-semibold text-slate-800">输出:</span> query()、state()、apply/reset 事件</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            batchActions: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-batch-select-two" jq-button data-variant="primary">setSelected(2)</button>
                        <button id="preview-batch-select-five" jq-button data-size="sm">setSelected(5)</button>
                        <button id="preview-batch-trigger-publish" jq-button data-size="sm">trigger(publish)</button>
                        <button id="preview-batch-trigger-delete" jq-button data-size="sm">trigger(delete)</button>
                        <button id="preview-batch-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-batch-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">列表批量操作</div>
                            <div class="mt-1 text-xs text-slate-500">按钮可根据选中数量自动禁用，适合文章、订单、素材等列表页批量处理。</div>
                            <div id="preview-batch-actions" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">联动:</span> selectedCount 驱动按钮禁用态</div>
                                <div><span class="font-semibold text-slate-800">动作:</span> publish、move、export、delete</div>
                                <div><span class="font-semibold text-slate-800">危险态:</span> tone=danger</div>
                                <div><span class="font-semibold text-slate-800">输出:</span> execute 事件携带 selected ids 和 action metadata</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            recordMetaPanel: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-meta-publish" jq-button data-variant="primary">setStatus(Published)</button>
                        <button id="preview-meta-seo" jq-button data-size="sm">setSeo()</button>
                        <button id="preview-meta-stats" jq-button data-size="sm">setStats()</button>
                        <button id="preview-meta-action" jq-button data-size="sm">trigger action</button>
                    </div>
                    <div id="preview-meta-panel-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,360px)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">内容详情右侧面板</div>
                            <div class="mt-1 text-xs text-slate-500">状态、作者、发布时间、SEO 和统计数字集中展示，适合编辑页和详情页侧栏。</div>
                            <div id="preview-record-meta-panel" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">状态:</span> draft、review、published</div>
                                <div><span class="font-semibold text-slate-800">信息:</span> 作者、发布时间、Slug、来源、SEO</div>
                                <div><span class="font-semibold text-slate-800">统计:</span> views、likes、shares</div>
                                <div><span class="font-semibold text-slate-800">动作:</span> 预览、发布、复制链接等快捷按钮</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            collectionFieldDesigner: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-field-add" jq-button data-variant="primary">appendField()</button>
                        <button id="preview-field-set" jq-button data-size="sm">setFields()</button>
                        <button id="preview-field-schema" jq-button data-size="sm">schema()</button>
                    </div>
                    <div id="preview-field-designer-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">集合字段设计器</div>
                            <div class="mt-1 text-xs text-slate-500">适合在 CMS 模型配置页里设计文章、产品、用户等 collection 的字段结构。</div>
                            <div id="preview-collection-field-designer" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">字段:</span> name、type、required、defaultValue</div>
                                <div><span class="font-semibold text-slate-800">类型:</span> text、textarea、number、boolean、date、relation</div>
                                <div><span class="font-semibold text-slate-800">排序:</span> up / down</div>
                                <div><span class="font-semibold text-slate-800">输出:</span> schema()、state()、ordered field descriptors</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            permissionMatrix: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-permission-check-all" jq-button data-variant="primary">checkAll()</button>
                        <button id="preview-permission-clear-all" jq-button data-size="sm">clearAll()</button>
                        <button id="preview-permission-set-values" jq-button data-size="sm">setValues()</button>
                    </div>
                    <div id="preview-permission-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">角色权限矩阵</div>
                            <div class="mt-1 text-xs text-slate-500">按模块和动作做勾选，适合菜单、页面、内容和系统设置的授权配置。</div>
                            <div id="preview-permission-matrix" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">结构:</span> rows x columns boolean matrix</div>
                                <div><span class="font-semibold text-slate-800">批量:</span> row、column、all 三层批量勾选</div>
                                <div><span class="font-semibold text-slate-800">输出:</span> payload() / state()</div>
                                <div><span class="font-semibold text-slate-800">场景:</span> role policy、menu permission、action permission</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            navigationBuilder: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-nav-add" jq-button data-variant="primary">appendItem()</button>
                        <button id="preview-nav-set" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-nav-output"></div>
                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">后台导航配置</div>
                            <div class="mt-1 text-xs text-slate-500">适合侧栏菜单、顶部导航和栏目配置，支持编辑、排序和输出导航结构。</div>
                            <div id="preview-navigation-builder" class="mt-4"></div>
                        </section>
                        <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">支持能力</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">字段:</span> label、path、icon</div>
                                <div><span class="font-semibold text-slate-800">控制:</span> add、remove、up、down</div>
                                <div><span class="font-semibold text-slate-800">输出:</span> items()、state()</div>
                            </div>
                        </aside>
                    </div>
                </div>
            `,
            dashboardStats: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-stats-set" jq-button data-variant="primary">setItems()</button>
                    </div>
                    <div id="preview-stats-output"></div>
                    <div class="grid gap-4">
                        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div id="preview-dashboard-stats"></div>
                        </section>
                    </div>
                </div>
            `,
            auditTimeline: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-audit-prepend" jq-button data-variant="primary">prepend()</button>
                        <button id="preview-audit-set" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-audit-output"></div>
                    <div class="grid gap-4">
                        <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div id="preview-audit-timeline"></div>
                        </section>
                    </div>
                </div>
            `,
            kanbanBoard: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-kanban-add" jq-button data-variant="primary">appendCard()</button>
                        <button id="preview-kanban-reset" jq-button data-size="sm">setColumns()</button>
                    </div>
                    <div id="preview-kanban-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-kanban-board"></div>
                    </section>
                </div>
            `,
            approvalFlow: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-approval-approve" jq-button data-variant="primary">approve()</button>
                        <button id="preview-approval-reject" jq-button data-size="sm">reject()</button>
                        <button id="preview-approval-reset" jq-button data-size="sm">setSteps()</button>
                    </div>
                    <div id="preview-approval-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-approval-flow"></div>
                    </section>
                </div>
            `,
            commentThread: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-comment-add" jq-button data-variant="primary">appendComment()</button>
                        <button id="preview-comment-reply" jq-button data-size="sm">reply()</button>
                        <button id="preview-comment-reset" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-comment-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-comment-thread"></div>
                    </section>
                </div>
            `,
            mediaLibraryPanel: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-media-library-select" jq-button data-variant="primary">select()</button>
                        <button id="preview-media-library-set" jq-button data-size="sm">setItems()</button>
                        <button id="preview-media-library-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-media-library-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-media-library-panel"></div>
                    </section>
                </div>
            `,
            revisionCompare: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-revision-set" jq-button data-variant="primary">setValues()</button>
                    </div>
                    <div id="preview-revision-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-revision-compare"></div>
                    </section>
                </div>
            `,
            publishScheduler: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-scheduler-set" jq-button data-variant="primary">setValue()</button>
                        <button id="preview-scheduler-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-scheduler-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-publish-scheduler"></div>
                    </section>
                </div>
            `,
            dataFilterPresetBar: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-preset-activate" jq-button data-variant="primary">activate()</button>
                        <button id="preview-preset-set" jq-button data-size="sm">setPresets()</button>
                    </div>
                    <div id="preview-preset-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-filter-preset-bar"></div>
                    </section>
                </div>
            `,
            roleMemberAssigner: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-role-set" jq-button data-variant="primary">setRole()</button>
                        <button id="preview-role-toggle" jq-button data-size="sm">toggle()</button>
                    </div>
                    <div id="preview-role-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-role-member-assigner"></div>
                    </section>
                </div>
            `,
            contentOutlinePanel: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-outline-activate" jq-button data-variant="primary">activate()</button>
                        <button id="preview-outline-set" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-outline-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-content-outline-panel"></div>
                    </section>
                </div>
            `,
            taskInbox: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-task-done" jq-button data-variant="primary">markDone()</button>
                        <button id="preview-task-snooze" jq-button data-size="sm">snooze()</button>
                        <button id="preview-task-prepend" jq-button data-size="sm">prepend()</button>
                    </div>
                    <div id="preview-task-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-task-inbox"></div>
                    </section>
                </div>
            `,
            notificationCenterPanel: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-notice-read" jq-button data-variant="primary">markRead()</button>
                        <button id="preview-notice-prepend" jq-button data-size="sm">prepend()</button>
                    </div>
                    <div id="preview-notice-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-notification-center-panel"></div>
                    </section>
                </div>
            `,
            workspaceSwitcher: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-workspace-activate" jq-button data-variant="primary">activate()</button>
                        <button id="preview-workspace-set" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-workspace-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-workspace-switcher"></div>
                    </section>
                </div>
            `,
            recentActivityFeed: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-activity-prepend" jq-button data-variant="primary">prepend()</button>
                        <button id="preview-activity-append" jq-button data-size="sm">append()</button>
                        <button id="preview-activity-clear" jq-button data-size="sm">clear()</button>
                    </div>
                    <div id="preview-activity-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-recent-activity-feed"></div>
                    </section>
                </div>
            `,
            quickActionLauncher: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-quick-action-search" jq-button data-variant="primary">search("publish")</button>
                        <button id="preview-quick-action-run" jq-button data-size="sm">execute()</button>
                        <button id="preview-quick-action-set" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-quick-action-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-quick-action-launcher"></div>
                    </section>
                </div>
            `,
            siteLocaleSwitcher: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-locale-activate" jq-button data-variant="primary">activate(en-US)</button>
                        <button id="preview-locale-set" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-locale-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-site-locale-switcher"></div>
                    </section>
                </div>
            `,
            reviewQueuePanel: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-review-approve" jq-button data-variant="primary">approve()</button>
                        <button id="preview-review-reject" jq-button data-size="sm">reject()</button>
                        <button id="preview-review-reset" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-review-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-review-queue-panel"></div>
                    </section>
                </div>
            `,
            assetFolderTree: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-folder-toggle" jq-button data-variant="primary">toggle(images)</button>
                        <button id="preview-folder-activate" jq-button data-size="sm">activate(campaign)</button>
                        <button id="preview-folder-reset" jq-button data-size="sm">setItems()</button>
                    </div>
                    <div id="preview-folder-output"></div>
                    <section class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div id="preview-asset-folder-tree"></div>
                    </section>
                </div>
            `,
            dom: `
                <div class="grid gap-4">
                    <div class="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
                        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="text-sm font-semibold text-slate-800">交互演示</div>
                            <div class="mt-1 text-xs text-slate-500">把查询、节点、内容、属性、类名、事件、表单和观察能力拆成单独动作。</div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <button id="preview-dom-build" jq-button data-variant="primary">build UI</button>
                                <button id="preview-dom-query" jq-button data-size="sm">query()</button>
                                <button id="preview-dom-class" jq-button data-size="sm">class</button>
                                <button id="preview-dom-attr" jq-button data-size="sm">attr/data</button>
                                <button id="preview-dom-content" jq-button data-size="sm">html/text</button>
                                <button id="preview-dom-append" jq-button data-size="sm">append/prepend</button>
                                <button id="preview-dom-toggle" jq-button data-size="sm">show/hide</button>
                                <button id="preview-dom-form" jq-button data-size="sm">serializeForm()</button>
                                <button id="preview-dom-event" jq-button data-size="sm">trigger()</button>
                                <button id="preview-dom-observe" jq-button data-size="sm">observe</button>
                                <button id="preview-dom-reset" jq-button data-size="sm">reset</button>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div class="text-sm font-semibold text-slate-800">已覆盖 API</div>
                            <div class="mt-3 grid gap-2 text-xs text-slate-600">
                                <div><span class="font-semibold text-slate-800">查询:</span> query, queryAll, closest, children, next, prev</div>
                                <div><span class="font-semibold text-slate-800">节点:</span> create, build, append, prepend, before, after, remove, empty</div>
                                <div><span class="font-semibold text-slate-800">内容:</span> html, text, val, attr, data, css</div>
                                <div><span class="font-semibold text-slate-800">状态:</span> addClass, removeClass, toggleClass, hasClass, show, hide, toggle</div>
                                <div><span class="font-semibold text-slate-800">事件:</span> on, off, once, delegate, trigger</div>
                                <div><span class="font-semibold text-slate-800">其他:</span> serializeForm, observeMutation, observeResize, debounce, throttle</div>
                            </div>
                        </div>
                    </div>
                    <div id="preview-dom-target" class="rounded-2xl border border-dashed border-slate-300 bg-white p-4 min-h-[240px]"></div>
                    <div id="preview-dom-output"></div>
                </div>
            `,
            map: `
                <div class="grid gap-4">
                    <div class="flex flex-wrap gap-3">
                        <button id="preview-map-mount" jq-button data-variant="primary">mount()</button>
                        <button id="preview-map-marker" jq-button data-size="sm">addMarker()</button>
                        <button id="preview-map-info" jq-button data-size="sm">openInfoWindow()</button>
                        <button id="preview-map-clear" jq-button data-size="sm">clearOverlays()</button>
                    </div>
                    <div id="preview-map-state"></div>
                    <div id="preview-map-root" class="rounded-xl border border-slate-200 bg-white min-h-[280px] overflow-hidden"></div>
                </div>
            `,
            uiPreset: `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">panel</div>
                        <div class="mt-2 text-xs text-slate-500 font-mono break-all" id="preset-panel"></div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">control</div>
                        <div class="mt-2 text-xs text-slate-500 font-mono break-all" id="preset-control"></div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">action</div>
                        <div class="mt-2 text-xs text-slate-500 font-mono break-all" id="preset-action"></div>
                    </div>
                </div>
            `,
            overlayPreset: `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">backdrop</div>
                        <div class="mt-2 text-xs text-slate-500 font-mono break-all" id="overlay-backdrop"></div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">surface</div>
                        <div class="mt-2 text-xs text-slate-500 font-mono break-all" id="overlay-surface"></div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-sm font-semibold text-slate-800">tones.success</div>
                        <div class="mt-2 text-xs text-slate-500 font-mono break-all" id="overlay-tone"></div>
                    </div>
                </div>
            `
        };

        return map[id] || `
            <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                当前组件更偏向 API / 组合用途，建议参考下方的声明式示例和 API 用法。
            </div>
        `;
    }

    function renderDoc() {
        const item = docs.find(entry => entry.id === state.activeId) || docs[0];
        const mount = document.getElementById('component-app');
        mount.innerHTML = `
            <div class="max-w-6xl pb-20">
                <div class="flex items-center text-sm text-slate-500 gap-2 mb-6">
                    <span>组件文档</span>
                    <span class="text-slate-300">/</span>
                    <span class="text-slate-800 font-medium">${item.chinese}</span>
                </div>

                <section class="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div class="max-w-3xl">
                        <div class="flex flex-wrap items-center gap-2 mb-3">
                            <span class="px-2.5 py-1 rounded-2xl bg-primary/10 text-primary text-xs font-bold tracking-wide">${escapeHtml(item.category)}</span>
                            <span class="px-2.5 py-1 rounded-2xl bg-slate-100 text-slate-600 text-xs font-medium">${item.kind === 'ui' ? 'UI 组件' : '功能组件'}</span>
                            <span class="px-2.5 py-1 rounded-2xl bg-slate-100 text-slate-500 text-xs font-medium">v${item.version}</span>
                            <span class="px-2.5 py-1 rounded-2xl bg-slate-100 text-slate-500 text-xs font-medium">${escapeHtml(item.file)}</span>
                        </div>
                        <h1 class="text-4xl font-bold tracking-tight text-slate-900">${escapeHtml(item.chinese)} <span class="text-slate-400 text-2xl align-middle">${escapeHtml(item.title)}</span></h1>
                        <p class="mt-3 text-slate-600 text-[15px] leading-7">${escapeHtml(item.summary)}</p>
                    </div>
                    <div class="w-full lg:w-[320px] rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Quick Facts</div>
                        <div class="grid gap-3 text-sm">
                            <div>
                                <div class="text-slate-400 mb-1">组件文件</div>
                                <div class="font-mono text-slate-700 break-all">${escapeHtml(item.file)}</div>
                            </div>
                            <div>
                                <div class="text-slate-400 mb-1">全局 API</div>
                                <div class="font-mono text-slate-700 break-all">${escapeHtml(item.api || '声明式组件，无独立 API')}</div>
                            </div>
                            <div>
                                <div class="text-slate-400 mb-1">推荐模式</div>
                                <div class="text-slate-700">${item.api ? '声明式 + 命令式混合' : '声明式优先'}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mb-8 rounded-xl border border-slate-200 bg-white overflow-visible shadow-sm">
                    <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="ph ph-sparkle text-primary text-lg"></i>
                            <span class="font-semibold text-slate-800">效果预览</span>
                        </div>
                        <button id="rerun-demo" class="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                            <i class="ph ph-arrow-clockwise"></i>
                            <span>重新运行</span>
                        </button>
                    </div>
                    <div id="component-demo" class="relative overflow-visible p-6 md:p-8 bg-[linear-gradient(180deg,rgba(248,250,252,0.6),rgba(255,255,255,1))]">
                        ${getDemoMarkup(item.id)}
                    </div>
                </section>

                <section class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">安装方式</div>
                        <div class="p-6">${renderDocCodeBlock(item.install, 'js')}</div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">适用场景</div>
                        <div class="p-6 text-sm text-slate-600 leading-7">
                            ${item.notes.map(note => `<div class="mb-2 last:mb-0">${formatInlineCode(note)}</div>`).join('')}
                        </div>
                    </div>
                </section>

                ${renderComponentExamples(item)}

                ${renderComponentSchema(item)}

                <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">属性 / 结构约定</div>
                        <div class="p-6">${renderKeyValueTable(item.attrs, ['入口 / 属性', '说明'])}</div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">API 方法</div>
                        <div class="p-6">${renderKeyValueTable(item.methods, ['方法', '说明'])}</div>
                    </div>
                </section>

                ${renderComponentExtras(item)}
            </div>
        `;
        enhanceRenderedRoot(mount);

        mountDemo(item.id);
        enhanceDocCodeBlocks(mount);
        const rerun = document.getElementById('rerun-demo');
        if (rerun) {
            rerun.addEventListener('click', () => {
                renderDoc();
            });
        }
    }

    function pretty(value) {
        return JSON.stringify(value, null, 2);
    }

    function runDemoCleanups() {
        if (!Array.isArray(state.demoCleanups)) return;
        state.demoCleanups.forEach(cleanup => {
            try {
                if (typeof cleanup === 'function') cleanup();
            } catch (error) {}
        });
        state.demoCleanups = [];
    }

    function addDemoCleanup(cleanup) {
        if (typeof cleanup === 'function') {
            state.demoCleanups.push(cleanup);
        }
    }

    function destroyDemoInstance(api, target) {
        if (!api || typeof api.destroy !== 'function') return;
        try {
            api.destroy(target);
        } catch (error) {}
    }

    function renderPreviewCode(targetId, value, language = 'json') {
        const mount = document.getElementById(targetId);
        if (!mount) return;
        const source = typeof value === 'string' ? value : pretty(value);
        mount.innerHTML = renderDocCodeBlock(source, language);
        const code = mount.querySelector('code[data-jq-code], code[data-language], code');
        if (code && window.JquanUIComponents?.codeBlockApi) {
            try {
                window.JquanUIComponents.codeBlockApi.mount(code, {
                    lineNumbers: true,
                    copyButton: true,
                    wrapLines: true,
                    maxHeight: 360
                });
                return;
            } catch (error) {
                console.error('[JquanUI Docs] Failed to render preview code block.', error);
            }
        }
        enhanceDocCodeBlocks(mount);
    }

    function createAudioDataUri(durationSeconds = 2, frequency = 440) {
        const sampleRate = 22050;
        const total = Math.max(1, Math.floor(sampleRate * durationSeconds));
        const buffer = new ArrayBuffer(44 + total * 2);
        const view = new DataView(buffer);
        const writeString = (offset, value) => {
            for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
        };
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + total * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, total * 2, true);
        for (let i = 0; i < total; i += 1) {
            const envelope = 1 - (i / total) * 0.35;
            const sample = Math.sin((i / sampleRate) * Math.PI * 2 * frequency) * 0.4 * envelope;
            view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true);
        }
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
        return 'data:audio/wav;base64,' + btoa(binary);
    }

    async function createVideoDemoUrl() {
        if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) return null;
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        const stream = canvas.captureStream(12);
        const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm' });
        const chunks = [];
        let frame = 0;
        return await new Promise(resolve => {
            recorder.ondataavailable = event => {
                if (event.data && event.data.size) chunks.push(event.data);
            };
            recorder.onstop = () => {
                if (!chunks.length) {
                    resolve(null);
                    return;
                }
                resolve(URL.createObjectURL(new Blob(chunks, { type: chunks[0].type || 'video/webm' })));
            };
            recorder.start();
            const draw = () => {
                const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                g.addColorStop(0, '#0f172a');
                g.addColorStop(0.5, '#4f46e5');
                g.addColorStop(1, '#22c55e');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                for (let i = 0; i < 6; i += 1) {
                    ctx.fillRect(36 + i * 92, 42 + Math.sin((frame + i) / 8) * 12, 64, 180);
                }
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 34px Inter, sans-serif';
                ctx.fillText('JquanUI Media Demo', 38, 288);
                ctx.font = '500 18px Inter, sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.84)';
                ctx.fillText('Local generated preview clip', 40, 320);
                frame += 1;
                if (frame < 30) requestAnimationFrame(draw);
                else recorder.stop();
            };
            draw();
        });
    }

    function createPosterDataUri(title, start, end) {
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${start}"/>
      <stop offset="100%" stop-color="${end}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <text x="36" y="190" fill="white" font-size="34" font-family="Inter, Arial, sans-serif" font-weight="700">${title}</text>
  <text x="36" y="226" fill="rgba(255,255,255,.8)" font-size="18" font-family="Inter, Arial, sans-serif">Local media preview</text>
</svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    function mountDemo(id) {
        const demo = document.getElementById('component-demo');
        if (!demo) return;
        runDemoCleanups();
        ensurePlugins();
        if (window.JquanUI && typeof window.JquanUI.enhance === 'function') {
            window.JquanUI.enhance(demo);
        }

        if (id === 'favicon') {
            const api = window.JquanUIComponents.faviconApi;
            const base = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="8" fill="#4f46e5"/><path d="M8 17 14 23 25 10" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
            const preview = document.getElementById('preview-favicon-icon');
            const syncState = action => {
                const state = api.state();
                if (preview && state.currentHref) preview.innerHTML = `<img src="${state.currentHref}" alt="当前 favicon" class="h-12 w-12" />`;
                renderPreviewCode('preview-favicon-state', { action, state });
            };
            addDemoCleanup(() => api.restore());
            api.set(base);
            syncState('set()');
            document.getElementById('preview-favicon-set')?.addEventListener('click', () => { api.set(base); syncState('set()'); });
            document.getElementById('preview-favicon-badge')?.addEventListener('click', () => { api.badge(12, { base, color: '#dc2626' }); syncState('badge(12)'); });
            document.getElementById('preview-favicon-loading')?.addEventListener('click', () => { api.status('loading'); syncState('status(loading)'); });
            document.getElementById('preview-favicon-success')?.addEventListener('click', () => { api.status('success'); syncState('status(success)'); });
            document.getElementById('preview-favicon-clear')?.addEventListener('click', () => { api.clear(); syncState('clear()'); });
            document.getElementById('preview-favicon-restore')?.addEventListener('click', () => { api.restore(); syncState('restore()'); });
            return;
        }

        if (id === 'iframeBridge') {
            const iframe = document.getElementById('preview-iframe-child');
            const statusTarget = document.getElementById('preview-iframe-status');
            const api = window.JquanUIComponents?.iframeBridgeApi;
            if (!iframe || !statusTarget || !api) return;

            const bridgeScriptUrl = new URL('dist/components/iframeBridge.js', document.baseURI).href;
            const childSource = `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><script>
(() => {
  const load = document.createElement('script');
  load.src = ${JSON.stringify(bridgeScriptUrl)};
  load.onload = () => {
    const bridge = window.JquanUIComponents.iframeBridgeApi.createChild({
      targetOrigin: ${JSON.stringify(window.location.origin)},
      namespace: 'docs-demo'
    });
    bridge.on('request:health', payload => ({ ok: true, side: 'child', received: payload }));
    bridge.on('theme', payload => {
      document.body.dataset.theme = payload?.mode || 'light';
      document.querySelector('[data-child-state]').textContent = 'theme: ' + document.body.dataset.theme;
    });
    bridge.on('ready', () => {
      document.querySelector('[data-child-state]').textContent = 'ready';
    });
    window.__jquanBridge = bridge;
  };
  load.onerror = () => { document.querySelector('[data-child-state]').textContent = 'load failed'; };
  document.head.appendChild(load);
})();
</script></head><body class="p-4"><strong>iframe child</strong><div data-child-state>connecting</div></body></html>`;

            let parentBridge = null;
            const renderState = (action, extra = {}) => {
                const bridgeState = parentBridge?.state?.() || { connected: false, ready: false };
                renderPreviewCode('preview-iframe-status', Object.assign({ action, state: bridgeState }, extra));
            };
            iframe.srcdoc = childSource;
            try {
                parentBridge = api.createParent({
                    iframe,
                    targetOrigin: window.location.origin,
                    namespace: 'docs-demo',
                    timeout: 2500
                });
            } catch (error) {
                renderState('createParent()', { error: error.message });
                return;
            }

            const ready = parentBridge.ready().then(() => renderState('ready()', { connected: true })).catch(error => renderState('ready()', { error: error.message }));
            addDemoCleanup(() => parentBridge.destroy());
            document.getElementById('preview-iframe-send')?.addEventListener('click', () => {
                const ok = parentBridge.send('theme', { mode: 'dark' });
                renderState('send(theme)', { sent: ok });
            });
            document.getElementById('preview-iframe-request')?.addEventListener('click', async () => {
                await ready.catch(() => {});
                try {
                    const result = await parentBridge.request('health', { probe: true });
                    renderState('request(health)', { result });
                } catch (error) {
                    renderState('request(health)', { error: error.message, code: error.code });
                }
            });
            document.getElementById('preview-iframe-state')?.addEventListener('click', () => renderState('state()'));
            document.getElementById('preview-iframe-destroy')?.addEventListener('click', () => {
                parentBridge.destroy();
                renderState('destroy()', { state: 'destroyed' });
            });
            renderState('createParent()');
            return;
        }

        if (id === 'data') {
            const dataApi = window.JquanUIData || window.JquanUI?.data;
            const list = document.getElementById('preview-data-list');
            if (!dataApi || !list) return;
            const seedRows = [
                { id: 1, name: 'Ada', status: 'active', score: 96 },
                { id: 2, name: 'Bo', status: 'paused', score: 82 },
                { id: 3, name: 'Chen', status: 'active', score: 91 }
            ];
            const collection = dataApi.createCollection(`docs-preview-${Date.now()}`, {
                primaryKey: 'id',
                indexes: ['status'],
                data: seedRows
            });
            let activeMatcher = {};
            const draw = rows => {
                list.innerHTML = rows.length
                    ? rows.map(row => `<div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><div><div class="font-semibold text-slate-800">${escapeHtml(row.name)}</div><div class="text-xs text-slate-500">${escapeHtml(row.status)}</div></div><span class="text-sm font-semibold text-primary">${row.score}</span></div>`).join('')
                    : '<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">没有匹配记录</div>';
            };
            const syncState = (action, extra = {}) => renderPreviewCode('preview-data-state', Object.assign({
                action,
                count: collection.query(activeMatcher).count(),
                revision: collection.revision,
                methods: ['insert()', 'update()', 'query()', 'liveQuery()', 'exportSnapshot()']
            }, extra));
            const stop = collection.liveQuery(activeMatcher, rows => { draw(rows); syncState('liveQuery()'); });
            addDemoCleanup(stop);
            document.getElementById('preview-data-insert')?.addEventListener('click', () => {
                const nextId = collection.query().all().reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
                collection.insert({ id: nextId, name: `New ${nextId}`, status: 'active', score: 88 });
                syncState('insert()', { insertedId: nextId });
            });
            document.getElementById('preview-data-update')?.addEventListener('click', () => {
                collection.update({ id: 1 }, { status: 'active', score: 99 });
                syncState('update()', { updatedId: 1 });
            });
            document.getElementById('preview-data-filter')?.addEventListener('click', () => {
                activeMatcher = activeMatcher.status ? {} : { status: 'active' };
                draw(collection.query(activeMatcher).all());
                syncState('query(active)', { matcher: activeMatcher });
            });
            document.getElementById('preview-data-snapshot')?.addEventListener('click', () => {
                const snapshot = collection.exportSnapshot();
                syncState('exportSnapshot()', { snapshot: { format: snapshot.format, records: snapshot.records.length, schemaVersion: snapshot.schemaVersion } });
            });
            document.getElementById('preview-data-reset')?.addEventListener('click', () => {
                collection.clear();
                collection.insert(seedRows);
                activeMatcher = {};
                draw(collection.query().all());
                syncState('reset()');
            });
            draw(collection.query().all());
            syncState('ready');
            return;
        }

        if (id === 'accordion') {
            destroyDemoInstance(window.JquanUIComponents.accordionApi, '#preview-accordion');
            const handle = window.JquanUIComponents.accordionApi.mount('#preview-accordion', {
                multiple: true,
                collapsible: true,
                duration: 240,
                defaultOpen: [0]
            });
            const syncState = () => renderPreviewCode('preview-accordion-state', Object.assign({
                methods: ['open()', 'toggle()', 'closeAll()', 'openAll()']
            }, handle?.state ? handle.state() : {}));
            document.getElementById('preview-accordion-open-first')?.addEventListener('click', () => {
                handle?.open?.(0);
                syncState();
            });
            document.getElementById('preview-accordion-open-second')?.addEventListener('click', () => {
                handle?.toggle?.(1);
                syncState();
            });
            document.getElementById('preview-accordion-close-all')?.addEventListener('click', () => {
                handle?.closeAll?.();
                syncState();
            });
            document.getElementById('preview-accordion-open-all')?.addEventListener('click', () => {
                handle?.openAll?.();
                syncState();
            });
            document.getElementById('preview-accordion')?.addEventListener('jquan:accordion:change', syncState);
            syncState();
            return;
        }

        if (id === 'tabs') {
            destroyDemoInstance(window.JquanUIComponents.tabsApi, '#preview-tabs');
            const handle = window.JquanUIComponents.tabsApi.mount('#preview-tabs', {
                mode: 'fade',
                autoplay: false,
                interval: 1800,
                classes: {
                    root: 'jq-tabs block',
                    list: 'jq-tab-list inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5',
                    tab: 'jq-tab inline-flex items-center justify-center min-h-10 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap',
                    tabActive: 'border border-slate-200 bg-white text-slate-900 shadow-sm',
                    tabInactive: 'border border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-700',
                    tabContent: 'jq-tab-content relative pt-5',
                    panel: 'jq-tab-panel text-sm leading-7 text-slate-600',
                    focus: 'focus:outline-none focus:ring-2 focus:ring-slate-200'
                }
            });
            const syncState = () => renderPreviewCode('preview-tabs-state', handle?.state ? handle.state() : {});
            document.getElementById('preview-tabs-go-api')?.addEventListener('click', () => {
                handle?.goTo?.(1);
                syncState();
            });
            document.getElementById('preview-tabs-prev')?.addEventListener('click', () => {
                handle?.prev?.();
                syncState();
            });
            document.getElementById('preview-tabs-next')?.addEventListener('click', () => {
                handle?.next?.();
                syncState();
            });
            document.getElementById('preview-tabs-play')?.addEventListener('click', () => {
                handle?.play?.();
                syncState();
            });
            document.getElementById('preview-tabs-pause')?.addEventListener('click', () => {
                handle?.pause?.();
                syncState();
            });
            syncState();
            return;
        }

        if (id === 'dropdown') {
            const root = document.getElementById('preview-dropdown');
            const contextRoot = document.getElementById('preview-dropdown-context');
            const trigger = root?.querySelector('[jq-dropdown-trigger]');
            if (!root || !trigger) return;
            const bindState = (target, source) => {
                if (!target) return () => {};
                const onOpen = event => {
                    renderPreviewCode('preview-dropdown-state', {
                        source,
                        action: 'jquan:dropdown:open',
                        state: target.getAttribute('data-state') || 'open',
                        detail: event.detail || null
                    });
                };
                const onClose = () => {
                    renderPreviewCode('preview-dropdown-state', {
                        source,
                        action: 'jquan:dropdown:close',
                        state: target.getAttribute('data-state') || 'closed'
                    });
                };
                const onSelect = event => {
                    renderPreviewCode('preview-dropdown-state', {
                        source,
                        action: event.detail?.action || 'select',
                        state: target.getAttribute('data-state') || 'closed',
                        detail: event.detail || null
                    });
                };
                target.addEventListener('jquan:dropdown:open', onOpen);
                target.addEventListener('jquan:dropdown:close', onClose);
                target.addEventListener('jquan:dropdown:select', onSelect);
                return () => {
                    target.removeEventListener('jquan:dropdown:open', onOpen);
                    target.removeEventListener('jquan:dropdown:close', onClose);
                    target.removeEventListener('jquan:dropdown:select', onSelect);
                };
            };
            const cleanupMain = bindState(root, 'button');
            const cleanupContext = bindState(contextRoot, 'contextmenu');
            addDemoCleanup(() => {
                cleanupMain();
                cleanupContext();
            });
            document.getElementById('preview-dropdown-open')?.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                if (root.getAttribute('data-state') !== 'open') trigger.click();
            });
            document.getElementById('preview-dropdown-close')?.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                if (root.getAttribute('data-state') === 'open') trigger.click();
            });
            renderPreviewCode('preview-dropdown-state', { source: 'button', action: 'idle', state: 'closed' });
            return;
        }

        if (id === 'select') {
            destroyDemoInstance(window.JquanUIComponents.selectApi, '#preview-select-single');
            destroyDemoInstance(window.JquanUIComponents.selectApi, '#preview-select-multiple');
            destroyDemoInstance(window.JquanUIComponents.selectApi, '#preview-select-disabled');
            const single = window.JquanUIComponents.selectApi.mount('#preview-select-single', {
                searchable: true,
                clearable: true
            });
            const multiple = window.JquanUIComponents.selectApi.mount('#preview-select-multiple', {
                multiple: true,
                searchable: true,
                maxSelections: 3,
                helperText: '支持搜索与批量选择',
                maxSelectionsText: '最多只能选择 3 项'
            });
            const disabled = window.JquanUIComponents.selectApi.mount('#preview-select-disabled', {
                disabled: true
            });
            const syncState = () => renderPreviewCode('preview-select-state', {
                single: single?.state ? single.state() : null,
                multiple: multiple?.state ? multiple.state() : null,
                disabled: disabled?.state ? disabled.state() : null,
                values: {
                    single: single?.value ? single.value() : null,
                    multiple: multiple?.values ? multiple.values() : [],
                    disabled: disabled?.value ? disabled.value() : null
                },
                methods: ['open()', 'select()', 'setValue()', 'clear()', 'search()', 'state()']
            });
            document.getElementById('preview-select-open')?.addEventListener('click', () => {
                single?.open?.();
                syncState();
            });
            document.getElementById('preview-select-set-single')?.addEventListener('click', () => {
                single?.setValue?.('react');
                syncState();
            });
            document.getElementById('preview-select-set-multi')?.addEventListener('click', () => {
                multiple?.setValue?.(['docs', 'table', 'upload']);
                syncState();
            });
            document.getElementById('preview-select-limit')?.addEventListener('click', () => {
                multiple?.setValue?.(['docs', 'dashboard', 'table']);
                multiple?.select?.('upload');
                syncState();
            });
            document.getElementById('preview-select-clear')?.addEventListener('click', () => {
                single?.clear?.();
                multiple?.clear?.();
                syncState();
            });
            document.getElementById('preview-select-search')?.addEventListener('click', () => {
                multiple?.open?.();
                multiple?.search?.('do');
                syncState();
            });
            syncState();
            return;
        }

        if (id === 'popover') {
            destroyDemoInstance(window.JquanUIComponents.popoverApi, '#preview-popover');
            const root = document.getElementById('preview-popover');
            const handle = window.JquanUIComponents.popoverApi.mount('#preview-popover', {
                classes: {
                    root: 'jq-popover relative inline-block',
                    panel: 'jq-popover-panel min-w-56 max-w-[min(92vw,360px)] rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-lg transition duration-200',
                    panelOpen: 'block',
                    arrow: 'jq-popover-arrow absolute w-2.5 h-2.5 bg-white border-slate-200 rotate-45',
                    close: 'border-0 bg-transparent p-0 w-5 h-5 leading-5 text-sm text-slate-500 cursor-pointer',
                    focus: 'focus:outline-none focus:ring-2 focus:ring-slate-200'
                }
            });
            const syncState = action => {
                renderPreviewCode('preview-popover-state', {
                    action: action || 'sync',
                    open: root?.getAttribute('data-popover-open') === 'true',
                    handleState: handle?.state ? handle.state() : null,
                    placement: root?.querySelector('[jq-popover-panel]')?.dataset?.popoverPlacement || 'bottom'
                });
            };
            const onOpen = event => syncState(`jquan:popover:open:${event.detail?.placement || 'unknown'}`);
            const onClose = event => syncState(`jquan:popover:close:${event.detail?.placement || 'unknown'}`);
            root?.addEventListener('jquan:popover:open', onOpen);
            root?.addEventListener('jquan:popover:close', onClose);
            addDemoCleanup(() => {
                root?.removeEventListener('jquan:popover:open', onOpen);
                root?.removeEventListener('jquan:popover:close', onClose);
            });
            document.getElementById('preview-popover-open')?.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                window.JquanUIComponents.popoverApi.open('#preview-popover');
            });
            document.getElementById('preview-popover-toggle')?.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                window.JquanUIComponents.popoverApi.toggle('#preview-popover');
            });
            document.getElementById('preview-popover-close')?.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                window.JquanUIComponents.popoverApi.close('#preview-popover');
            });
            syncState('idle');
            return;
        }

        if (id === 'tooltip') {
            renderPreviewCode('preview-tooltip-state', {
                trigger: 'hover / focus',
                positions: ['top', 'right', 'bottom'],
                options: ['data-tips', 'data-tips-pos', 'data-tips-length']
            });
            return;
        }

        if (id === 'modal') {
            let currentHandle = null;
            addDemoCleanup(() => window.JquanUIComponents.modalApi.closeAll());
            const syncState = payload => renderPreviewCode('preview-modal-state', Object.assign({
                openCount: window.JquanUIComponents.modalApi.getOpenCount()
            }, payload || {}));
            document.getElementById('demo-modal-open')?.addEventListener('click', () => {
                currentHandle = window.JquanUIComponents.modalApi.open({
                    title: '组件详情',
                    description: '这个 Modal 用来展示 open / patch / close 这些高频能力。',
                    content: '<div class="grid gap-2 text-sm text-slate-600"><div>支持 description、actions、HTML 内容和运行时 patch。</div><div>很适合文档页的扩展详情层。</div></div>',
                    actions: [{ text: '关闭', variant: 'primary' }],
                    onClose(handle, reason) {
                        if (currentHandle?.id === handle?.id) currentHandle = null;
                        syncState({ action: 'onClose', handleId: handle?.id || null, reason });
                    }
                });
                syncState({ action: 'open()', handleId: currentHandle?.id || null });
            });
            document.getElementById('demo-modal-update')?.addEventListener('click', () => {
                if (!currentHandle) {
                    syncState({ action: 'update()', error: '请先打开一个 Modal' });
                    return;
                }
                currentHandle.update({
                    title: '已通过 update() 完整更新',
                    description: 'update() 会重新应用完整 options，适合结构级变化。',
                    placement: 'center',
                    size: 'lg',
                    content: '<div class="grid gap-2 text-sm text-slate-600"><div>这次不只是替换文本，还把尺寸和结构选项一起带过去。</div><div>适合接口返回完整详情后整块更新。</div></div>',
                    actions: [
                        { text: '关闭', variant: 'default' },
                        { text: '保存', variant: 'primary' }
                    ]
                });
                syncState({ action: 'update()', handleId: currentHandle.id, diff: 'full options refresh' });
            });
            document.getElementById('demo-modal-patch')?.addEventListener('click', () => {
                if (!currentHandle) {
                    syncState({ action: 'patch()', error: '请先打开一个 Modal' });
                    return;
                }
                currentHandle.patch({
                    title: '已通过 patch() 局部更新',
                    description: 'patch() 更适合只替换标题、说明、正文、actions 这类局部内容。',
                    content: '<div class="grid gap-2 text-sm text-slate-600"><div>这里保留原本的整体结构，只替换内容区。</div><div>适合异步局部刷新。</div></div>'
                });
                syncState({ action: 'patch()', handleId: currentHandle.id, diff: 'content only' });
            });
            document.getElementById('demo-modal-alert')?.addEventListener('click', () => {
                window.JquanUIComponents.modalApi.alert('这是一条 alert() 示例。', {
                    title: 'Alert 示例'
                });
                syncState({ action: 'alert()' });
            });
            document.getElementById('demo-modal-confirm')?.addEventListener('click', async () => {
                const confirmed = await window.JquanUIComponents.modalApi.confirm('是否继续发布组件文档？', {
                    title: 'Confirm 示例'
                });
                syncState({ action: 'confirm()', confirmed });
            });
            document.getElementById('demo-modal-promise')?.addEventListener('click', () => {
                window.JquanUIComponents.modalApi.promise(
                    new Promise(resolve => window.setTimeout(() => resolve({ ok: true }), 900)),
                    {
                        loading: { title: '正在处理中', description: '演示 promise() 状态流转' },
                        success: { title: '处理完成', description: '已切换到 success 状态', actions: [{ text: '关闭', variant: 'primary' }] },
                        error: { title: '处理失败', description: '这里不会触发，仅用于展示 API' }
                    }
                );
                syncState({ action: 'promise()', status: 'loading' });
            });
            document.getElementById('demo-modal-close-all')?.addEventListener('click', () => {
                window.JquanUIComponents.modalApi.closeAll();
                currentHandle = null;
                syncState({ action: 'closeAll()', status: 'closing' });
                window.setTimeout(() => {
                    syncState({ action: 'closeAll()', status: 'closed' });
                }, 220);
            });
            syncState({ action: 'ready', methods: ['open()', 'alert()', 'confirm()', 'promise()', 'update()', 'patch()', 'closeAll()'] });
            return;
        }

        if (id === 'drawer') {
            let currentHandle = null;
            addDemoCleanup(() => window.JquanUIComponents.drawerApi.closeAll());
            const template = document.getElementById('drawer-content-template');
            const syncState = payload => renderPreviewCode('preview-drawer-state', Object.assign({
                openCount: window.JquanUIComponents.modalApi?.getOpenCount?.() || 0
            }, payload || {}));
            document.getElementById('demo-drawer-open')?.addEventListener('click', () => {
                currentHandle = window.JquanUIComponents.drawerApi.open({
                    title: '高级筛选',
                    placement: 'right',
                    size: 'md',
                    content: template ? template.innerHTML : '<div>Drawer</div>'
                });
                syncState({ action: 'open()', placement: 'right', handleId: currentHandle?.id || null });
            });
            document.getElementById('demo-drawer-open-left')?.addEventListener('click', () => {
                currentHandle = window.JquanUIComponents.drawerApi.open({
                    title: '组件目录',
                    placement: 'left',
                    size: 'sm',
                    content: '<div class="grid gap-2 text-sm text-slate-600"><div>左侧抽屉适合目录、导航和次级菜单。</div><div>这里演示 placement 切换。</div></div>'
                });
                syncState({ action: 'open()', placement: 'left', handleId: currentHandle?.id || null });
            });
            document.getElementById('demo-drawer-update')?.addEventListener('click', () => {
                if (!currentHandle) {
                    syncState({ action: 'patch()', error: '请先打开一个抽屉' });
                    return;
                }
                currentHandle.patch({
                    title: '已更新的抽屉标题',
                    content: '<div class="grid gap-2 text-sm text-slate-600"><div>这是 patch() 后的新内容。</div><div>适合异步加载详情后再更新界面。</div></div>'
                });
                syncState({ action: 'patch()', updated: true, handleId: currentHandle.id });
            });
            document.getElementById('demo-drawer-close-all')?.addEventListener('click', () => {
                window.JquanUIComponents.drawerApi.closeAll();
                syncState({ action: 'closeAll()' });
            });
            syncState({ action: 'ready', methods: ['open()', 'patch()', 'closeAll()'] });
            return;
        }

        if (id === 'dialog') {
            const dialog = document.getElementById('preview-dialog');
            const syncState = payload => renderPreviewCode('preview-dialog-state', Object.assign({
                state: dialog?.getAttribute('data-state') || 'closed',
                hidden: !!dialog?.hidden
            }, payload || {}));
            const observe = () => syncState({ action: 'state-change' });
            dialog?.addEventListener('click', observe);
            addDemoCleanup(() => dialog?.removeEventListener('click', observe));
            document.getElementById('preview-dialog-open-api')?.addEventListener('click', () => {
                dialog?.__jquanOpenDialog?.();
                syncState({ action: '__jquanOpenDialog()' });
            });
            syncState({ action: 'ready', methods: ['jq-dialog-trigger', '__jquanOpenDialog()', 'jq-dialog-close'] });
            return;
        }

        if (id === 'toast') {
            let loadingHandle = null;
            addDemoCleanup(() => window.JquanUIComponents.toastApi.closeAll());
            const syncState = payload => renderPreviewCode('preview-toast-state', payload || {});
            document.getElementById('demo-toast-show')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.toastApi.show({
                    title: '默认 Toast',
                    description: '这是 show() 的基础用法。'
                });
                syncState({ action: 'show()', id: handle?.id || null });
            });
            document.getElementById('demo-toast-info')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.toastApi.info({
                    title: '信息提示',
                    description: '适合轻量操作反馈。'
                });
                syncState({ action: 'info()', id: handle?.id || null });
            });
            document.getElementById('demo-toast-success')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.toastApi.success({
                    title: '发布成功',
                    description: '组件文档已更新'
                });
                syncState({ action: 'success()', id: handle?.id || null });
            });
            document.getElementById('demo-toast-warning')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.toastApi.warning({
                    title: '还有未填写字段',
                    description: '请继续补充配置'
                });
                syncState({ action: 'warning()', id: handle?.id || null });
            });
            document.getElementById('demo-toast-error')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.toastApi.error({
                    title: '保存失败',
                    description: '请检查网络或权限'
                });
                syncState({ action: 'error()', id: handle?.id || null });
            });
            document.getElementById('demo-toast-loading')?.addEventListener('click', () => {
                loadingHandle = window.JquanUIComponents.toastApi.loading({ title: '发布中', description: '等待异步流程完成' });
                window.setTimeout(() => {
                    loadingHandle?.update?.({ type: 'success', title: '发布完成', description: 'loading 已切换为 success' });
                }, 900);
                syncState({ action: 'loading()', id: loadingHandle?.id || null, next: 'update(success)' });
            });
            syncState({ action: 'ready', methods: ['show()', 'info()', 'success()', 'warning()', 'error()', 'loading()'] });
            return;
        }

        if (id === 'msg') {
            let loadingHandle = null;
            addDemoCleanup(() => window.JquanUIComponents.msgApi.closeAll());
            const syncState = payload => renderPreviewCode('preview-msg-state', payload || {});
            document.getElementById('demo-msg-show')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.msgApi.show({
                    title: '默认消息',
                    description: '这是 show() 的基础形式。'
                });
                syncState({ action: 'show()', id: handle?.id || null });
            });
            document.getElementById('demo-msg-info')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.msgApi.info({
                    title: '消息系统',
                    description: '这是一条轻量提示'
                });
                syncState({ action: 'info()', id: handle?.id || null });
            });
            document.getElementById('demo-msg-success')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.msgApi.success({
                    title: '保存完成',
                    description: '数据已经写入本地状态'
                });
                syncState({ action: 'success()', id: handle?.id || null });
            });
            document.getElementById('demo-msg-warning')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.msgApi.warning({
                    title: '配置待确认',
                    description: '请再次检查公开参数'
                });
                syncState({ action: 'warning()', id: handle?.id || null });
            });
            document.getElementById('demo-msg-error')?.addEventListener('click', () => {
                const handle = window.JquanUIComponents.msgApi.error({
                    title: '保存失败',
                    description: '请检查网络或权限'
                });
                syncState({ action: 'error()', id: handle?.id || null });
            });
            document.getElementById('demo-msg-loading')?.addEventListener('click', () => {
                loadingHandle = window.JquanUIComponents.msgApi.loading({
                    title: '同步中',
                    description: '等待状态更新'
                });
                window.setTimeout(() => {
                    loadingHandle?.update?.({ type: 'success', title: '同步完成', description: 'loading 已切换为 success' });
                }, 900);
                syncState({ action: 'loading()', id: loadingHandle?.id || null, next: 'update(success)' });
            });
            syncState({ action: 'ready', methods: ['show()', 'info()', 'success()', 'warning()', 'error()', 'loading()'] });
            return;
        }

        if (id === 'copy') {
            const syncState = payload => renderPreviewCode('preview-copy-state', payload || {});
            syncState({ action: 'ready', methods: ['jq-copy-trigger', 'copyText()', 'copyElement()'] });
            document.getElementById('copy-api-btn')?.addEventListener('click', async () => {
                const result = await window.JquanUIComponents.copyApi.copyText('JquanUI Components Docs');
                syncState({ action: 'copyText()', ok: result.ok, text: result.text });
                window.JquanUIComponents.msgApi.success({
                    title: result.ok ? '已复制 copyText 文本' : '复制失败'
                });
            });
            document.getElementById('copy-element-btn')?.addEventListener('click', async () => {
                const result = await window.JquanUIComponents.copyApi.copyElement('#copy-preview-source');
                syncState({ action: 'copyElement()', ok: result.ok, text: result.text });
            });
            return;
        }

        if (id === 'codeBlock') {
            const samples = {
                js: {
                    language: 'js',
                    source: `const table = JquanUIComponents.tableApi.mount('#table', {\n  columns: [{ key: 'name', title: 'Name' }],\n  data: [{ name: 'Modal' }]\n});`
                },
                html: {
                    language: 'html',
                    source: `<button jq-button data-variant="primary">\n  保存\n</button>`
                },
                json: {
                    language: 'json',
                    source: `{\n  "component": "Modal",\n  "category": "反馈与浮层",\n  "api": true\n}`
                }
            };
            const codeNode = document.querySelector('#preview-code code');
            const syncState = payload => renderPreviewCode('preview-code-state', payload || {});
            const renderSample = sample => {
                if (!codeNode) return;
                codeNode.className = `language-${sample.language}`;
                codeNode.textContent = sample.source;
                window.JquanUIComponents.codeBlockApi.refresh('#preview-code', {
                    showLineNumbers: true,
                    copyable: true
                });
                syncState({
                    language: sample.language,
                    lines: sample.source.split('\n').length,
                    state: window.JquanUIComponents.codeBlockApi.getState('#preview-code')
                });
            };
            window.JquanUIComponents.codeBlockApi.mount('#preview-code', {
                showLineNumbers: true,
                copyable: true
            });
            document.getElementById('preview-code-js')?.addEventListener('click', () => renderSample(samples.js));
            document.getElementById('preview-code-html')?.addEventListener('click', () => renderSample(samples.html));
            document.getElementById('preview-code-json')?.addEventListener('click', () => renderSample(samples.json));
            document.getElementById('preview-code-refresh')?.addEventListener('click', () => {
                window.JquanUIComponents.codeBlockApi.refresh('#preview-code', {
                    showLineNumbers: true,
                    copyable: true
                });
                syncState({
                    action: 'refresh()',
                    state: window.JquanUIComponents.codeBlockApi.getState('#preview-code')
                });
            });
            syncState({
                action: 'ready',
                methods: ['mount()', 'refresh()', 'copyable', 'showLineNumbers'],
                state: window.JquanUIComponents.codeBlockApi.getState('#preview-code')
            });
            return;
        }

        if (id === 'pagination') {
            destroyDemoInstance(window.JquanUIComponents.paginationApi, '#preview-pagination');
            const handle = window.JquanUIComponents.paginationApi.mount('#preview-pagination', {
                page: 2,
                pageSize: 10,
                total: 126,
                showJumper: true,
                showPageSize: true
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = () => renderPreviewCode('preview-pagination-state', handle?.state ? handle.state() : {});
            document.getElementById('preview-pagination-prev')?.addEventListener('click', () => {
                const state = handle.state();
                handle.update({ page: Math.max(1, state.page - 1) }, 'previewPrev');
                syncState();
            });
            document.getElementById('preview-pagination-next')?.addEventListener('click', () => {
                const state = handle.state();
                handle.update({ page: state.page + 1 }, 'previewNext');
                syncState();
            });
            document.getElementById('preview-pagination-size')?.addEventListener('click', () => {
                handle.update({ page: 1, pageSize: 20 }, 'previewPageSize');
                syncState();
            });
            syncState();
            return;
        }

        if (id === 'numberInput') {
            ['#preview-number', '#preview-number-quick', '#preview-number-readonly'].forEach(selector => {
                destroyDemoInstance(window.JquanUIComponents.numberInputApi, selector);
            });
            const primary = window.JquanUIComponents.numberInputApi.mount('#preview-number', { largeStep: 10 });
            const quick = window.JquanUIComponents.numberInputApi.mount('#preview-number-quick', { largeStep: 50 });
            const readonly = window.JquanUIComponents.numberInputApi.mount('#preview-number-readonly');
            addDemoCleanup(() => {
                primary?.destroy?.();
                quick?.destroy?.();
                readonly?.destroy?.();
            });
            const syncState = action => renderPreviewCode('preview-number-state', {
                action,
                primary: primary?.state?.(),
                quick: quick?.state?.(),
                readonly: readonly?.state?.(),
                methods: ['value()', 'number()', 'setValue()', 'step()', 'update()', 'destroy()']
            });
            document.getElementById('preview-number-set')?.addEventListener('click', () => {
                primary?.setValue?.(50);
                syncState('setValue(50)');
            });
            document.getElementById('preview-number-step')?.addEventListener('click', () => {
                primary?.step?.(10);
                syncState('step(10)');
            });
            document.getElementById('preview-number-reset')?.addEventListener('click', () => {
                primary?.setValue?.(20);
                quick?.setValue?.(100);
                syncState('reset()');
            });
            document.getElementById('preview-number')?.addEventListener('jquan:number-input:change', () => syncState('event:change'));
            document.getElementById('preview-number-quick')?.addEventListener('jquan:number-input:change', () => syncState('event:quickStep'));
            syncState('ready');
            return;
        }

        if (id === 'mdViewer') {
            const samples = {
                basic: '# Markdown Preview\n\n## Features\n\n- Headings\n- Lists\n- Quotes\n- `inline code`\n\n> Components docs should show the result directly.',
                table: '## Table Demo\n\n| Component | Mode | Status |\n| --- | --- | --- |\n| Accordion | Declarative | Ready |\n| Crud | API + composite | Ready |\n| MdViewer | Parser + Render | Ready |\n\n> 表格、引用、段落在文档页里都很常见。',
                code: '## Code Block\n\n```js\nconst ui = \"JquanUI\";\nJquanUI.use(JquanUIComponents.mdViewer);\nJquanUIComponents.mdViewerApi.mount(\"#doc-md\", {\n  highlight: true,\n  toc: true\n});\n```\n\n```html\n<div jq-md data-md-toc=\"true\"></div>\n```',
                rich: '# Rich Syntax\n\n---\n\n- [x] 文档结构\n- [ ] 联调接口\n- [ ] 增补案例\n\n1. 安装组件\n2. 挂载预览\n3. 复制示例\n\n[访问仓库](https://example.com)\n\n![Preview](https://dummyimage.com/640x240/f8fafc/64748b&text=MdViewer+Preview)\n\n### Blockquote\n\n> 适合产品说明、更新日志、接入指引。',
                full: '# Full Markdown Showcase\n\n## Heading 2\n\n### Heading 3\n\n这是一个包含 **粗体**、*斜体*、~~删除线~~、`inline code` 的完整示例。\n\n---\n\n## List\n\n- 无序列表\n  - 子级列表\n- 任务列表\n  - [x] 已完成\n  - [ ] 未完成\n\n## Ordered\n\n1. 初始化\n2. 配置选项\n3. 渲染内容\n\n## Table\n\n| API | Purpose | Status |\n| --- | --- | --- |\n| `mount()` | 挂载实例 | stable |\n| `render()` | 主动重渲染 | stable |\n| `destroy()` | 销毁实例 | stable |\n\n## Quote\n\n> Markdown 文档的核心不是把源码贴上去，而是让用户直接看懂效果和用法。\n\n## Code\n\n```json\n{\n  \"toc\": true,\n  \"highlight\": true,\n  \"mermaid\": true\n}\n```\n\n## Link & Image\n\n[API 文档入口](https://example.com/docs)\n\n![Component docs](https://dummyimage.com/800x320/ffffff/94a3b8&text=JquanUI+Markdown+Viewer)\n',
                mermaid: '# Mermaid Demo\n\n```mermaid\ngraph TD\n  A[Docs] --> B[Preview]\n  B --> C[API]\n  C --> D[Copy]\n```'
            };
            const syncState = (handle, name) => {
                renderPreviewCode('preview-md-state', {
                    sample: name,
                    tocCount: handle?.toc ? handle.toc().length : 0,
                    htmlLength: handle?.html ? handle.html().length : 0,
                    methods: ['mount()', 'render()', 'update()', 'destroy()', 'parse()']
                });
            };
            const renderMarkdown = (source, name) => {
                destroyDemoInstance(window.JquanUIComponents.mdViewerApi, '#preview-md');
                return window.JquanUIComponents.mdViewerApi.mount('#preview-md', {
                    source,
                    toc: true,
                    tocSelector: '#preview-md-toc',
                    highlight: true,
                    mermaid: true
                }).then(handle => {
                    syncState(handle, name);
                    return handle;
                });
            };
            document.getElementById('preview-md-basic')?.addEventListener('click', () => renderMarkdown(samples.basic, 'basic').catch(() => {}));
            document.getElementById('preview-md-table')?.addEventListener('click', () => renderMarkdown(samples.table, 'table').catch(() => {}));
            document.getElementById('preview-md-code')?.addEventListener('click', () => renderMarkdown(samples.code, 'code').catch(() => {}));
            document.getElementById('preview-md-rich')?.addEventListener('click', () => renderMarkdown(samples.rich, 'rich').catch(() => {}));
            document.getElementById('preview-md-full')?.addEventListener('click', () => renderMarkdown(samples.full, 'full').catch(() => {}));
            document.getElementById('preview-md-mermaid')?.addEventListener('click', () => renderMarkdown(samples.mermaid, 'mermaid').catch(() => {}));
            renderMarkdown(samples.full, 'full').catch(() => {
                const mount = document.getElementById('preview-md');
                if (!mount) return;
                mount.innerHTML = `
                    <div class="grid gap-4 text-slate-700">
                        <h1 class="text-3xl font-bold text-slate-900">Markdown Preview</h1>
                        <ul class="list-disc pl-5">
                            <li>标题</li>
                            <li>列表</li>
                            <li>表格</li>
                            <li>引用</li>
                            <li>代码块</li>
                        </ul>
                        <blockquote class="rounded-r-xl border-l-4 border-primary bg-slate-50 px-4 py-3 text-slate-600">组件文档需要把效果直接展示清楚。</blockquote>
                        <div class="overflow-auto">
                            <table class="min-w-full border-collapse text-sm">
                                <thead><tr><th class="border border-slate-200 bg-slate-50 px-3 py-2 text-left">Component</th><th class="border border-slate-200 bg-slate-50 px-3 py-2 text-left">Mode</th></tr></thead>
                                <tbody><tr><td class="border border-slate-200 px-3 py-2">MdViewer</td><td class="border border-slate-200 px-3 py-2">Preview fallback</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                `;
                renderPreviewCode('preview-md-state', {
                    sample: 'fallback',
                    methods: ['mount()', 'render()', 'update()', 'destroy()', 'parse()']
                });
            });
            return;
        }

        if (id === 'formValidator') {
            const outputId = 'preview-form-result';
            const formEl = document.getElementById('preview-form');
            const emailEl = formEl?.querySelector('[name="email"]');
            destroyDemoInstance(window.JquanUIComponents.formValidatorApi, '#preview-form');
            const handle = window.JquanUIComponents.formValidatorApi.mount('#preview-form', {
                validateOnBlur: true,
                schema: {
                    email: ['required', 'email']
                }
            });
            const syncOutput = async (mode, result) => {
                renderPreviewCode(outputId, {
                    action: mode,
                    value: emailEl?.value || '',
                    result
                });
            };
            formEl?.addEventListener('submit', async event => {
                event.preventDefault();
                const result = await handle.validate();
                await syncOutput('validate()', result);
            });
            document.getElementById('preview-form-check')?.addEventListener('click', async () => {
                const result = await handle.validateField('email');
                await syncOutput('validateField("email")', result);
            });
            document.getElementById('preview-form-invalid')?.addEventListener('click', () => {
                if (emailEl) emailEl.value = '1';
                renderPreviewCode(outputId, { action: 'fill', value: '1', hint: '点击 validateField 或提交校验' });
            });
            document.getElementById('preview-form-valid')?.addEventListener('click', () => {
                if (emailEl) emailEl.value = 'demo@jquanui.com';
                renderPreviewCode(outputId, { action: 'fill', value: 'demo@jquanui.com', hint: '点击 validateField 或提交校验' });
            });
            renderPreviewCode(outputId, { action: 'ready', schema: { email: ['required', 'email'] } });
            return;
        }

        if (id === 'tagInput') {
            destroyDemoInstance(window.JquanUIComponents.tagInputApi, '#preview-tag-input');
            const handle = window.JquanUIComponents.tagInputApi.mount('#preview-tag-input', {
                maxTags: 5,
                suggestions: ['Vue', 'React', 'Svelte', 'Docs', 'Dashboard', 'Table', 'Router'],
                maxTagsText: '最多保留 5 个标签',
                duplicateText: '该标签已存在',
                invalidText: '仅允许字母、数字与短横线',
                validate(value) {
                    return /^[a-z0-9-]+$/i.test(value) || '仅允许字母、数字与短横线';
                }
            });
            const syncState = () => renderPreviewCode('preview-tag-state', {
                state: handle?.state ? handle.state() : null,
                tags: handle?.tags ? handle.tags() : [],
                methods: ['add()', 'remove()', 'setTags()', 'clear()', 'focus()', 'state()']
            });
            document.getElementById('preview-tag-add')?.addEventListener('click', () => {
                handle?.add?.('Vue');
                syncState();
            });
            document.getElementById('preview-tag-add-many')?.addEventListener('click', () => {
                handle?.setTags?.(['Docs', 'Dashboard', 'React', 'Table']);
                syncState();
            });
            document.getElementById('preview-tag-overflow')?.addEventListener('click', () => {
                handle?.setTags?.(['Docs', 'Dashboard', 'React', 'Table', 'Router']);
                handle?.add?.('Vue');
                syncState();
            });
            document.getElementById('preview-tag-duplicate')?.addEventListener('click', () => {
                handle?.add?.('Docs');
                syncState();
            });
            document.getElementById('preview-tag-remove')?.addEventListener('click', () => {
                handle?.remove?.('Docs');
                syncState();
            });
            document.getElementById('preview-tag-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState();
            });
            document.getElementById('preview-tag-focus')?.addEventListener('click', () => {
                handle?.focus?.();
                syncState();
            });
            syncState();
            return;
        }

        if (id === 'template') {
            destroyDemoInstance(window.JquanUIComponents.templateApi, '#preview-template');
            const api = window.JquanUIComponents.templateApi;
            api.registerFilter('badge', value => value ? 'Stable' : 'Beta');

            const initialData = {
                title: 'JquanUI Enterprise Blocks',
                subtitle: '变量、循环、条件、include、filter、set 一次展示',
                items: [
                    { name: 'modal', desc: '复杂弹窗、表单弹窗、确认流', stable: true, price: 299 },
                    { name: 'table', desc: '排序、筛选、分页、选择态', stable: true, price: 499 },
                    { name: 'template', desc: '用于内容拼装与配置驱动视图', stable: false, price: 199 }
                ]
            };

            const layoutData = {
                title: 'Template Workspace',
                note: 'layout / slot / renderSlot / elseif / object loop',
                stats: {
                    coverage: { value: 96 },
                    performance: { value: 82 },
                    docs: { value: 68 }
                },
                flags: {
                    preview: true,
                    cache: false,
                    analytics: true
                }
            };

            const asyncCardTemplate = () => new Promise(resolve => {
                window.setTimeout(() => {
                    resolve(`
                        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <div class="font-semibold text-slate-900">{{ item.name }}</div>
                                    <div class="mt-1 text-sm text-slate-500">{{ item.desc }}</div>
                                </div>
                                <span class="inline-flex rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Async</span>
                            </div>
                        </article>
                    `);
                }, 240);
            });

            const handle = api.mount('#preview-template', {
                source: '#preview-template-main',
                data: initialData,
                templates: {
                    'preview-template-card': document.getElementById('preview-template-card')?.innerHTML || ''
                }
            });

            const syncState = payload => {
                renderPreviewCode('preview-template-state', Object.assign({
                    state: handle?.state ? handle.state() : null,
                    filters: api.filters(),
                    templates: api.templates(),
                    cacheSize: api.cacheSize ? api.cacheSize() : 0,
                    methods: ['render()', 'renderAsync()', 'patch()', 'setData()', 'registerTemplate()', 'registerFilter()', 'dependencies()', 'ast()', 'clearCache()']
                }, payload || {}));
            };

            const renderDebug = payload => {
                renderPreviewCode('preview-template-debug', payload || {});
            };

            const renderTemplateError = error => ({
                message: error?.message || 'Unknown error',
                position: error?.position || null,
                snippet: error?.snippet || null
            });

            const renderStringExample = () => {
                const html = api.render(`
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div class="text-sm font-semibold text-slate-800">{{ name | upper }}</div>
                        <div class="mt-1 text-sm text-slate-500">{{ features | join(' / ') }}</div>
                    </div>
                `, {
                    name: 'template',
                    features: ['render', 'include', 'filter']
                });
                renderPreviewCode('preview-template-render-output', html, 'html');
            };

            const restoreTemplateMain = (data = initialData) => {
                handle?.update?.({
                    source: '#preview-template-main',
                    template: document.getElementById('preview-template-main')?.textContent || '',
                    templates: {
                        'preview-template-card': document.getElementById('preview-template-card')?.innerHTML || ''
                    }
                });
                handle?.setData?.(data);
            };

            const runIsolatedTemplateDemo = (executor, hooks = {}) => {
                try {
                    const result = executor();
                    if (typeof hooks.onSuccess === 'function') {
                        hooks.onSuccess(result);
                    }
                    return result;
                } catch (error) {
                    if (typeof hooks.onError === 'function') {
                        hooks.onError(error);
                    }
                    return null;
                }
            };

            document.getElementById('preview-template-render')?.addEventListener('click', () => {
                handle?.render?.();
                syncState({ action: 'render()', data: handle?.data ? handle.data() : null });
            });
            document.getElementById('preview-template-patch')?.addEventListener('click', () => {
                handle?.patch?.({
                    subtitle: 'patch() 已更新标题描述与卡片数据',
                    items: [
                        { name: 'popover', desc: '轻量浮层说明与快捷操作', stable: true, price: 159 },
                        { name: 'crud', desc: '列表、弹窗、校验、请求工作流', stable: true, price: 699 },
                        { name: 'mdViewer', desc: '文档内容渲染与目录导航', stable: false, price: 239 },
                        { name: 'router', desc: '前端路由视图与状态切换', stable: true, price: 329 }
                    ]
                });
                syncState({ action: 'patch()', items: handle?.data ? handle.data().items : [] });
            });
            document.getElementById('preview-template-empty')?.addEventListener('click', () => {
                handle?.setData?.({
                    title: 'Empty State Demo',
                    subtitle: '条件渲染已切换到空态视图',
                    items: []
                });
                syncState({ action: 'setData()', items: [] });
            });
            document.getElementById('preview-template-price')?.addEventListener('click', () => {
                const current = handle?.data ? handle.data() : initialData;
                const nextItems = (current.items || []).map((item, index) => Object.assign({}, item, {
                    price: Number(item.price || 0) + ((index + 1) * 88)
                }));
                handle?.patch?.({ items: nextItems });
                syncState({ action: 'patch(price)', items: nextItems });
            });
            document.getElementById('preview-template-layout')?.addEventListener('click', () => {
                handle?.update?.({
                    source: '#preview-template-layout-page',
                    template: document.getElementById('preview-template-layout-page')?.textContent || '',
                    templates: {
                        'preview-template-card': document.getElementById('preview-template-card')?.innerHTML || '',
                        'preview-template-shell': document.getElementById('preview-template-shell')?.innerHTML || ''
                    }
                });
                handle?.setData?.(layoutData);
                syncState({ action: 'update(layout)', data: layoutData });
            });
            document.getElementById('preview-template-object')?.addEventListener('click', () => {
                handle?.update?.({
                    source: '#preview-template-layout-page',
                    template: document.getElementById('preview-template-layout-page')?.textContent || '',
                    templates: {
                        'preview-template-card': document.getElementById('preview-template-card')?.innerHTML || '',
                        'preview-template-shell': document.getElementById('preview-template-shell')?.innerHTML || ''
                    }
                });
                handle?.setData?.({
                    title: 'Object Loop Demo',
                    note: 'for key, item in object',
                    stats: {
                        api: { value: 91 },
                        ui: { value: 77 },
                        a11y: { value: 58 }
                    },
                    flags: {
                        beta: true,
                        darkMode: false,
                        export: false
                    }
                });
                syncState({ action: 'setData(object-loop)' });
            });
            document.getElementById('preview-template-raw')?.addEventListener('click', () => {
                renderStringExample();
                syncState({ action: 'render(template, data)' });
            });
            document.getElementById('preview-template-async')?.addEventListener('click', async () => {
                handle?.update?.({
                    template: `
                        <section class="grid gap-4">
                            <header class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                <div class="text-lg font-semibold text-slate-900">{{ title }}</div>
                                <div class="mt-1 text-sm text-slate-500">{{ subtitle }}</div>
                            </header>
                            <div class="grid gap-3 md:grid-cols-2">
                                {% for item in items %}
                                    {% include "preview-template-async-card" with { item: item } %}
                                {% endfor %}
                            </div>
                        </section>
                    `,
                    templates: {
                        'preview-template-async-card': asyncCardTemplate
                    }
                });
                handle?.setData?.({
                    title: 'Async Template Source',
                    subtitle: 'include 片段由 Promise 异步返回',
                    items: [
                        { name: 'Remote Block A', desc: '模拟远程模板片段' },
                        { name: 'Remote Block B', desc: '渲染链路为异步' }
                    ]
                }, false);
                await handle?.renderAsync?.();
                syncState({ action: 'renderAsync()', cacheSize: api.cacheSize ? api.cacheSize() : 0 });
            });
            document.getElementById('preview-template-cache')?.addEventListener('click', () => {
                const before = api.cacheSize ? api.cacheSize() : 0;
                api.compile(document.getElementById('preview-template-main')?.textContent || '');
                const afterCompile = api.cacheSize ? api.cacheSize() : 0;
                api.clearCache?.();
                const afterClear = api.cacheSize ? api.cacheSize() : 0;
                syncState({
                    action: 'cache',
                    before,
                    afterCompile,
                    afterClear
                });
                renderDebug({
                    cache: {
                        before,
                        afterCompile,
                        afterClear
                    }
                });
            });
            document.getElementById('preview-template-deps')?.addEventListener('click', () => {
                const mainTemplate = document.getElementById('preview-template-layout-page')?.textContent || document.getElementById('preview-template-main')?.textContent || '';
                const deps = api.dependencies ? api.dependencies(mainTemplate) : [];
                syncState({ action: 'dependencies()', count: deps.length });
                renderDebug({
                    template: 'preview-template-layout-page',
                    dependencies: deps
                });
            });
            document.getElementById('preview-template-ast')?.addEventListener('click', () => {
                const mainTemplate = document.getElementById('preview-template-layout-page')?.textContent || document.getElementById('preview-template-main')?.textContent || '';
                const ast = api.ast ? api.ast(mainTemplate) : null;
                syncState({
                    action: 'ast()',
                    rootType: ast?.type || null
                });
                renderDebug({
                    ast
                });
            });
            document.getElementById('preview-template-cycle')?.addEventListener('click', () => {
                runIsolatedTemplateDemo(() => api.render(`{% include "cycle-a" %}`, {
                    title: 'Cycle Test'
                }, {
                    templates: {
                        'cycle-a': `{% include "cycle-b" %}`,
                        'cycle-b': `{% include "cycle-a" %}`
                    }
                }), {
                    onError(error) {
                        restoreTemplateMain(handle?.data ? handle.data() : initialData);
                        syncState({ action: 'cycle-detect', error: error.message });
                        renderDebug({
                            cycle: {
                                root: 'cycle-a',
                                error: error.message,
                                position: error.position || null,
                                snippet: error.snippet || null
                            }
                        });
                    }
                });
            });
            document.getElementById('preview-template-safe')?.addEventListener('click', () => {
                runIsolatedTemplateDemo(() => api.render(`{{ window.location.href }}`, {}, {
                    safeExpressions: true
                }), {
                    onSuccess() {
                        restoreTemplateMain(handle?.data ? handle.data() : initialData);
                        syncState({ action: 'safeExpressions', result: 'unexpected-pass' });
                        renderDebug({
                            safeExpressions: {
                                blocked: false
                            }
                        });
                    },
                    onError(error) {
                        restoreTemplateMain(handle?.data ? handle.data() : initialData);
                        syncState({ action: 'safeExpressions', error: error.message });
                        renderDebug({
                            safeExpressions: {
                                blocked: true,
                                error: error.message,
                                position: error.position || null,
                                snippet: error.snippet || null
                            }
                        });
                    }
                });
            });
            document.getElementById('preview-template-playground')?.addEventListener('click', () => {
                document.getElementById('preview-template-playground-panel')?.classList.remove('hidden');
                syncState({ action: 'playground' });
                renderDebug({
                    playground: '可直接编辑模板并查看实时渲染或错误定位。'
                });
            });
            document.getElementById('preview-template-run')?.addEventListener('click', () => {
                const editor = document.getElementById('preview-template-editor');
                const live = document.getElementById('preview-template-live');
                if (!editor || !live) return;
                runIsolatedTemplateDemo(() => api.render(editor.value, {
                    title: 'Playground',
                    items: [
                        { name: 'Modal' },
                        { name: 'Template' },
                        { name: 'Crud' }
                    ]
                }, {
                    safeExpressions: true
                }), {
                    onSuccess(html) {
                        restoreTemplateMain(handle?.data ? handle.data() : initialData);
                        live.innerHTML = html;
                        syncState({ action: 'playground-run', status: 'ok' });
                        renderDebug({
                            playground: {
                                status: 'ok',
                                ast: api.ast ? api.ast(editor.value) : null
                            }
                        });
                    },
                    onError(error) {
                        restoreTemplateMain(handle?.data ? handle.data() : initialData);
                        live.innerHTML = `<div class="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-4 text-sm text-danger">${escapeHtml(error.message)}</div>`;
                        syncState({ action: 'playground-run', error: error.message });
                        renderDebug({
                            playground: Object.assign({
                                status: 'error'
                            }, renderTemplateError(error))
                        });
                    }
                });
            });
            document.getElementById('preview-template-broken')?.addEventListener('click', () => {
                const editor = document.getElementById('preview-template-editor');
                if (!editor) return;
                editor.value = `{% if title %}\n<div>{{ title }</div>\n{% endif %}`;
                syncState({ action: 'playground-broken' });
            });

            renderStringExample();
            renderDebug({
                info: '可在这里查看缓存、依赖图、循环检测与安全模式调试输出。'
            });
            syncState({ action: 'ready', data: initialData });
            return;
        }

        if (id === 'crud') {
            const rows = [
                { id: 1, name: 'Modal', type: 'overlay', status: 'stable', owner: 'Docs' },
                { id: 2, name: 'Tabs', type: 'navigation', status: 'stable', owner: 'Core' },
                { id: 3, name: 'MdViewer', type: 'content', status: 'beta', owner: 'Content' }
            ];
            let idSeed = 3;
            destroyDemoInstance(window.JquanUIComponents.crudApi, '#preview-crud-root');
            const logs = [];
            const metricsMount = document.getElementById('preview-crud-metrics');
            const logMount = document.getElementById('preview-crud-log');
            let demoActive = true;
            let crudHandle = null;
            addDemoCleanup(() => {
                demoActive = false;
                crudHandle?.destroy?.();
            });
            const renderMetrics = () => {
                if (!metricsMount) return;
                const total = rows.length;
                const stable = rows.filter(item => item.status === 'stable').length;
                const beta = rows.filter(item => item.status === 'beta').length;
                metricsMount.innerHTML = `
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Total</div>
                        <div class="mt-2 text-2xl font-bold text-slate-900">${total}</div>
                        <div class="mt-1 text-sm text-slate-500">当前工作台记录数</div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Stable</div>
                        <div class="mt-2 text-2xl font-bold text-slate-900">${stable}</div>
                        <div class="mt-1 text-sm text-slate-500">已稳定组件</div>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Beta</div>
                        <div class="mt-2 text-2xl font-bold text-slate-900">${beta}</div>
                        <div class="mt-1 text-sm text-slate-500">待继续打磨的组件</div>
                    </div>
                `;
            };
            const pushLog = (title, detail) => {
                logs.unshift({
                    title,
                    detail,
                    time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
                });
                logs.splice(6);
                if (!logMount) return;
                logMount.innerHTML = logs.map(item => `
                    <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div class="flex items-center justify-between gap-3">
                            <div class="text-sm font-semibold text-slate-800">${escapeHtml(item.title)}</div>
                            <div class="text-xs text-slate-400">${escapeHtml(item.time)}</div>
                        </div>
                        <div class="mt-1 text-sm text-slate-500">${escapeHtml(item.detail)}</div>
                    </div>
                `).join('');
            };
            const syncState = (payload, handle) => {
                renderMetrics();
                renderPreviewCode('preview-crud-state', Object.assign({
                    size: rows.length,
                    rows,
                    methods: ['create()', 'edit(row)', 'remove(row)', 'reload()'],
                    tableState: handle?.table?.()?.state ? handle.table().state() : null
                }, payload || {}));
            };
            window.JquanUIComponents.crudApi.mount('#preview-crud-root', {
                title: 'Components',
                columns: [
                    { key: 'name', title: '组件名' },
                    { key: 'type', title: '类型' },
                    { key: 'status', title: '状态' },
                    { key: 'owner', title: 'Owner' }
                ],
                forms: {
                    create: {
                        title: 'Create Component',
                        schema: [
                            { name: 'name', label: 'Name', type: 'text', required: true },
                            { name: 'type', label: 'Type', type: 'text', required: true },
                            { name: 'status', label: 'Status', type: 'text', required: true },
                            { name: 'owner', label: 'Owner', type: 'text', required: true }
                        ],
                        validator: {
                            schema: {
                                name: ['required'],
                                type: ['required'],
                                status: ['required'],
                                owner: ['required']
                            }
                        }
                    },
                    edit: {
                        title: 'Edit Component',
                        schema: [
                            { name: 'name', label: 'Name', type: 'text', required: true },
                            { name: 'type', label: 'Type', type: 'text', required: true },
                            { name: 'status', label: 'Status', type: 'text', required: true },
                            { name: 'owner', label: 'Owner', type: 'text', required: true }
                        ],
                        validator: {
                            schema: {
                                name: ['required'],
                                type: ['required'],
                                status: ['required'],
                                owner: ['required']
                            }
                        }
                    }
                },
                request: {
                    list: async () => rows,
                    create: async payload => {
                        idSeed += 1;
                        const created = Object.assign({ id: idSeed }, payload);
                        rows.push(created);
                        return created;
                    },
                    update: async (currentRow, payload) => {
                        const index = rows.findIndex(item => item.id === currentRow.id);
                        if (index !== -1) {
                            rows[index] = Object.assign({}, rows[index], payload);
                        }
                        return rows[index] || Object.assign({}, currentRow, payload);
                    },
                    remove: async row => {
                        const index = rows.findIndex(item => item.id === row.id);
                        if (index !== -1) rows.splice(index, 1);
                        return row;
                    }
                },
                modal: {
                    size: 'md'
                }
            }).then(handle => {
                if (!demoActive) {
                    handle?.destroy?.();
                    return;
                }
                crudHandle = handle;
                renderMetrics();
                pushLog('工作台已就绪', 'Crud 组合了 Table、Modal、FormValidator 和请求层。');
                syncState({
                    action: 'ready',
                    focus: '点击按钮后，表格、统计卡片和日志会同步变化。'
                }, handle);
                document.getElementById('preview-crud-create')?.addEventListener('click', () => {
                    idSeed += 1;
                    const draft = {
                        id: idSeed,
                        name: `Component ${idSeed}`,
                        type: ['overlay', 'navigation', 'content', 'data'][rows.length % 4],
                        status: rows.length % 2 === 0 ? 'stable' : 'beta',
                        owner: ['Docs', 'Core', 'Data', 'Content'][rows.length % 4]
                    };
                    rows.unshift(draft);
                    handle?.reload?.('preview-create').then(() => {
                        pushLog('create()', `已新增 ${draft.name}，表格与统计已刷新。`);
                        syncState({ action: 'create()', created: draft, mode: 'preview mutation' }, handle);
                    });
                });
                document.getElementById('preview-crud-edit')?.addEventListener('click', async () => {
                    const target = rows[0];
                    if (!target) {
                        pushLog('edit(row)', '当前没有可编辑数据。');
                        syncState({ action: 'edit(row)', error: '当前没有可编辑数据' }, handle);
                        return;
                    }
                    const before = Object.assign({}, target);
                    target.name = `${target.name} Pro`;
                    target.status = target.status === 'stable' ? 'beta' : 'stable';
                    target.owner = 'Docs Lab';
                    await handle?.reload?.('preview-edit');
                    pushLog('edit(row)', `已更新 ${before.name} -> ${target.name}`);
                    syncState({ action: 'edit(row)', before, after: target, mode: 'preview mutation' }, handle);
                });
                document.getElementById('preview-crud-remove')?.addEventListener('click', () => {
                    const target = rows[rows.length - 1];
                    if (!target) {
                        pushLog('remove(row)', '当前没有可删除数据。');
                        syncState({ action: 'remove(row)', error: '当前没有可删除数据' }, handle);
                        return;
                    }
                    pushLog('remove(row)', `打开删除确认：${target.name}`);
                    syncState({ action: 'remove(row)', row: target, hint: '确认后会从表格中移除' }, handle);
                    handle?.remove(target);
                });
                document.getElementById('preview-crud-reload')?.addEventListener('click', async () => {
                    await handle?.reload?.('preview');
                    pushLog('reload()', `重新拉取列表，当前共 ${rows.length} 条。`);
                    syncState({
                        action: 'reload()',
                        reason: 'preview'
                    }, handle);
                });
            });
            return;
        }

        if (id === 'table') {
            const rows = [
                { id: 1, name: 'Modal', category: '反馈与浮层', mode: 'API + Declarative' },
                { id: 2, name: 'Tabs', category: '基础交互', mode: 'Declarative' },
                { id: 3, name: 'Store', category: '状态与存储', mode: 'API' },
                { id: 4, name: 'Upload', category: '数据展示', mode: 'Declarative + API' }
            ];
            destroyDemoInstance(window.JquanUIComponents.tableApi, '#preview-table');
            const syncState = handle => {
                renderPreviewCode('preview-table-state', {
                    state: handle?.state ? handle.state() : {},
                    selectedRows: handle?.selectedRows ? handle.selectedRows() : []
                });
            };
            let demoActive = true;
            let tableHandle = null;
            addDemoCleanup(() => {
                demoActive = false;
                tableHandle?.destroy?.();
            });
            window.JquanUIComponents.tableApi.mount('#preview-table', {
                rowKey: 'id',
                selectable: true,
                columns: [
                    { key: 'name', title: '组件', sortable: true },
                    { key: 'category', title: '分类' },
                    { key: 'mode', title: '模式' }
                ],
                data: rows,
                pagination: { page: 1, pageSize: 5, total: rows.length }
            }).then(handle => {
                if (!demoActive) {
                    handle?.destroy?.();
                    return;
                }
                tableHandle = handle;
                syncState(handle);
                document.getElementById('preview-table-filter-overlay')?.addEventListener('click', () => {
                    handle?.setFilter?.('category', '反馈与浮层');
                    syncState(handle);
                });
                document.getElementById('preview-table-filter-clear')?.addEventListener('click', () => {
                    handle?.setFilter?.('category', '');
                    syncState(handle);
                });
                document.getElementById('preview-table-refresh')?.addEventListener('click', async () => {
                    await handle?.reload?.('preview');
                    syncState(handle);
                });
                document.getElementById('preview-table-clear-selection')?.addEventListener('click', () => {
                    handle?.clearSelection?.();
                    syncState(handle);
                });
                document.getElementById('preview-table-loading')?.addEventListener('click', () => {
                    handle?.setLoading?.(true);
                    syncState(handle);
                    window.setTimeout(() => {
                        handle?.setLoading?.(false);
                        syncState(handle);
                    }, 900);
                });
            });
            return;
        }

        if (id === 'upload') {
            destroyDemoInstance(window.JquanUIComponents.uploadApi, '#preview-upload');
            const mockRequest = file => new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    if (/csv$/i.test(file.name)) {
                        reject(new Error('Mock upload failed for preview'));
                        return;
                    }
                    resolve({ ok: true, url: `/mock/${file.name}` });
                }, 420);
            });
            const syncState = handle => {
                const files = handle?.files ? handle.files() : [];
                renderPreviewCode('preview-upload-state', {
                    total: files.length,
                    files: files.map(file => ({
                        id: file.id,
                        name: file.name,
                        size: file.size,
                        status: file.status
                    }))
                });
            };
            const handle = window.JquanUIComponents.uploadApi.mount('#preview-upload', {
                autoUpload: false,
                preview: true,
                accept: 'image/*,.txt,.md',
                request: mockRequest,
                onChange() {
                    syncState(handle);
                }
            });
            syncState(handle);
            document.getElementById('preview-upload-add')?.addEventListener('click', () => {
                const files = [
                    new File(['# JquanUI Components'], 'components.md', { type: 'text/markdown' }),
                    new File(['button,modal,tabs'], 'components.csv', { type: 'text/csv' })
                ];
                handle?.add?.(files);
                syncState(handle);
            });
            document.getElementById('preview-upload-files')?.addEventListener('click', () => {
                syncState(handle);
            });
            document.getElementById('preview-upload-remove')?.addEventListener('click', () => {
                const first = handle?.files?.()?.[0];
                if (!first) {
                    syncState({ action: 'remove()', error: '请先添加示例文件' });
                    return;
                }
                handle?.remove?.(first.id);
                syncState(handle);
            });
            document.getElementById('preview-upload-retry')?.addEventListener('click', () => {
                const failed = handle?.files?.()?.find(file => file.status === 'error');
                if (!failed) {
                    syncState({ action: 'retry()', error: '当前没有 error 状态文件' });
                    return;
                }
                handle?.retry?.(failed.id);
                syncState(handle);
            });
            document.getElementById('preview-upload-preview')?.addEventListener('click', () => {
                const firstPreviewable = handle?.files?.()?.find(file => file.previewUrl);
                if (!firstPreviewable) {
                    syncState({ action: 'preview()', error: '当前没有可预览文件' });
                    return;
                }
                const previewed = handle?.preview?.(firstPreviewable.id);
                syncState({
                    action: 'preview()',
                    file: previewed ? { id: previewed.id, name: previewed.name, type: previewed.type } : null
                });
            });
            document.getElementById('preview-upload-upload')?.addEventListener('click', async () => {
                await handle?.upload?.();
                syncState({
                    action: 'upload()',
                    files: handle?.files?.()?.map(file => ({
                        id: file.id,
                        name: file.name,
                        status: file.status
                    })) || []
                });
            });
            document.getElementById('preview-upload-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState(handle);
            });
            return;
        }

        if (id === 'carousel') {
            destroyDemoInstance(window.JquanUIComponents.carouselApi, '#preview-carousel');
            destroyDemoInstance(window.JquanUIComponents.carouselApi, '#preview-carousel-gallery-main');
            destroyDemoInstance(window.JquanUIComponents.carouselApi, '#preview-carousel-gallery-nav');
            const handle = window.JquanUIComponents.carouselApi.mount('#preview-carousel', {
                autoplay: true,
                infinite: true,
                interval: 2600,
                speed: 640,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                pauseOnHover: true,
                progress: true,
                visibleCount: 1,
                slidesPerScroll: 1
            });
            const galleryMain = window.JquanUIComponents.carouselApi.mount('#preview-carousel-gallery-main', {
                autoplay: false,
                infinite: false,
                indicators: false,
                thumbnails: false,
                progress: false,
                speed: 520,
                visibleCount: 1,
                slidesPerScroll: 1,
                syncTarget: '#preview-carousel-gallery-nav'
            });
            const galleryNav = window.JquanUIComponents.carouselApi.mount('#preview-carousel-gallery-nav', {
                autoplay: false,
                infinite: false,
                arrows: false,
                indicators: false,
                progress: false,
                drag: false,
                visibleCount: 4,
                slidesPerScroll: 1,
                direction: 'vertical',
                syncTarget: '#preview-carousel-gallery-main'
            });
            const syncState = action => renderPreviewCode('preview-carousel-state', Object.assign({
                action: action || 'sync'
            }, handle?.state ? handle.state() : {}, {
                linked: {
                    main: galleryMain?.state ? galleryMain.state() : null,
                    nav: galleryNav?.state ? galleryNav.state() : null
                }
            }));
            const root = document.getElementById('preview-carousel');
            const onChange = event => {
                syncState(`jquan:carousel:change:${event.detail?.index ?? 0}`);
            };
            const onPlay = () => syncState('jquan:carousel:play');
            const onPause = () => syncState('jquan:carousel:pause');
            const onUpdate = () => syncState('jquan:carousel:update');
            root?.addEventListener('jquan:carousel:change', onChange);
            root?.addEventListener('jquan:carousel:play', onPlay);
            root?.addEventListener('jquan:carousel:pause', onPause);
            root?.addEventListener('jquan:carousel:update', onUpdate);
            addDemoCleanup(() => {
                root?.removeEventListener('jquan:carousel:change', onChange);
                root?.removeEventListener('jquan:carousel:play', onPlay);
                root?.removeEventListener('jquan:carousel:pause', onPause);
                root?.removeEventListener('jquan:carousel:update', onUpdate);
            });
            document.getElementById('preview-carousel-prev')?.addEventListener('click', () => {
                handle?.prev?.();
                syncState('prev()');
            });
            document.getElementById('preview-carousel-next')?.addEventListener('click', () => {
                handle?.next?.();
                syncState('next()');
            });
            document.getElementById('preview-carousel-go-3')?.addEventListener('click', () => {
                handle?.goTo?.(2, true);
                syncState('goTo(3)');
            });
            document.getElementById('preview-carousel-page-2')?.addEventListener('click', () => {
                handle?.goToPage?.(1, true);
                syncState('goToPage(2)');
            });
            document.getElementById('preview-carousel-play')?.addEventListener('click', () => {
                handle?.play?.();
                syncState('play()');
            });
            document.getElementById('preview-carousel-pause')?.addEventListener('click', () => {
                handle?.pause?.();
                syncState('pause()');
            });
            document.getElementById('preview-carousel-speed-fast')?.addEventListener('click', () => {
                handle?.setInterval?.(1800);
                syncState('setInterval(1800)');
            });
            document.getElementById('preview-carousel-speed-slow')?.addEventListener('click', () => {
                handle?.setInterval?.(4200);
                syncState('setInterval(4200)');
            });
            syncState('idle');
            return;
        }

        if (id === 'infiniteScroll') {
            destroyDemoInstance(window.JquanUIComponents.infiniteScrollApi, '#preview-marquee');
            const handle = window.JquanUIComponents.infiniteScrollApi.mount('#preview-marquee', {
                autoScroll: true,
                speed: 0.85,
                visibleItems: 3.4,
                gap: 14,
                pauseOnHover: true
            });
            const syncState = () => renderPreviewCode('preview-marquee-state', handle?.state ? handle.state() : {});
            document.getElementById('preview-marquee-play')?.addEventListener('click', () => {
                handle?.play?.();
                syncState();
            });
            document.getElementById('preview-marquee-pause')?.addEventListener('click', () => {
                handle?.pause?.();
                syncState();
            });
            document.getElementById('preview-marquee-speed-up')?.addEventListener('click', () => {
                handle?.setSpeed?.(2.4);
                syncState();
            });
            document.getElementById('preview-marquee-speed-down')?.addEventListener('click', () => {
                handle?.setSpeed?.(0.6);
                syncState();
            });
            syncState();
            return;
        }

        if (id === 'video') {
            destroyDemoInstance(window.JquanUIComponents.videoApi, '#preview-video');
            const root = document.getElementById('preview-video');
            const media = root?.querySelector('video');
            let demoUrl = null;
            const syncState = payload => renderPreviewCode('preview-video-state', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            const handle = window.JquanUIComponents.videoApi.mount('#preview-video');
            addDemoCleanup(() => {
                handle?.destroy?.();
                if (demoUrl) URL.revokeObjectURL(demoUrl);
            });
            const bindEvents = () => {
                root?.addEventListener('jquan:video:play', () => syncState({ action: 'event:play' }));
                root?.addEventListener('jquan:video:pause', () => syncState({ action: 'event:pause' }));
                root?.addEventListener('jquan:video:ready', () => syncState({ action: 'event:ready' }));
            };
            bindEvents();
            document.getElementById('preview-video-play')?.addEventListener('click', () => {
                handle?.play?.().catch?.(() => {});
                syncState({ action: 'play()' });
            });
            document.getElementById('preview-video-pause')?.addEventListener('click', () => {
                handle?.pause?.();
                syncState({ action: 'pause()' });
            });
            document.getElementById('preview-video-seek')?.addEventListener('click', () => {
                handle?.seek?.(2);
                syncState({ action: 'seek(2)' });
            });
            document.getElementById('preview-video-mute')?.addEventListener('click', () => {
                const current = handle?.state?.();
                handle?.mute?.(!(current?.muted));
                syncState({ action: 'mute(toggle)' });
            });
            syncState({ action: 'init', note: '正在生成本地 demo 视频...' });
            createVideoDemoUrl().then(url => {
                demoUrl = url;
                if (!media) return;
                if (url) media.src = url;
                media.load();
                syncState({ action: 'source-ready', localGenerated: !!url });
            }).catch(() => {
                syncState({ action: 'source-error', localGenerated: false });
            });
            return;
        }

        if (id === 'audio') {
            destroyDemoInstance(window.JquanUIComponents.audioApi, '#preview-audio');
            const root = document.getElementById('preview-audio');
            const media = root?.querySelector('audio');
            const handle = window.JquanUIComponents.audioApi.mount('#preview-audio');
            if (media) {
                media.src = createAudioDataUri(2.4, 523.25);
                media.load();
            }
            const syncState = payload => renderPreviewCode('preview-audio-state', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            root?.addEventListener('jquan:audio:play', () => syncState({ action: 'event:play' }));
            root?.addEventListener('jquan:audio:pause', () => syncState({ action: 'event:pause' }));
            root?.addEventListener('jquan:audio:ready', () => syncState({ action: 'event:ready' }));
            document.getElementById('preview-audio-play')?.addEventListener('click', () => {
                handle?.play?.().catch?.(() => {});
                syncState({ action: 'play()' });
            });
            document.getElementById('preview-audio-pause')?.addEventListener('click', () => {
                handle?.pause?.();
                syncState({ action: 'pause()' });
            });
            document.getElementById('preview-audio-seek')?.addEventListener('click', () => {
                handle?.seek?.(1);
                syncState({ action: 'seek(1)' });
            });
            document.getElementById('preview-audio-volume')?.addEventListener('click', () => {
                handle?.setVolume?.(0.3);
                syncState({ action: 'setVolume(0.3)' });
            });
            addDemoCleanup(() => handle?.destroy?.());
            syncState({ action: 'init', localGenerated: true });
            return;
        }

        if (id === 'router') {
            const syncState = handle => {
                renderPreviewCode('preview-router-state', {
                    current: handle?.current ? handle.current() : null,
                    routes: handle?.routes ? handle.routes().map(route => route.path) : []
                });
            };
            const router = window.JquanUIComponents.routerApi.create({
                root: '#preview-router-view',
                routes: [
                    { path: '/', title: '首页', component: '<div class="grid gap-2 text-sm text-slate-600"><div class="font-semibold text-slate-800">首页视图</div><div>适合组件总览、数据概览。</div></div>' },
                    { path: '/about', title: '关于', component: '<div class="grid gap-2 text-sm text-slate-600"><div class="font-semibold text-slate-800">关于视图</div><div>这里可以放项目说明和版本信息。</div></div>' },
                    { path: '/guides', title: '指南', component: '<div class="grid gap-2 text-sm text-slate-600"><div class="font-semibold text-slate-800">指南视图</div><div>适合承接快速上手和集成步骤。</div></div>' }
                ],
                afterEach() {
                    syncState(router);
                }
            });
            addDemoCleanup(() => router?.destroy?.());
            syncState(router);
            document.getElementById('router-home')?.addEventListener('click', async () => {
                await router?.push?.('/');
                syncState(router);
            });
            document.getElementById('router-about')?.addEventListener('click', async () => {
                await router?.push?.('/about');
                syncState(router);
            });
            document.getElementById('router-guides')?.addEventListener('click', async () => {
                await router?.replace?.('/guides');
                syncState(router);
            });
            document.getElementById('router-clear-cache')?.addEventListener('click', () => {
                router?.clearCache?.();
                syncState(router);
            });
            return;
        }

        if (id === 'appShell') {
            const syncState = handle => {
                renderPreviewCode('preview-shell-state', {
                    current: handle?.router?.()?.current ? handle.router().current() : null,
                    tabs: handle?.tabs ? handle.tabs() : []
                });
            };
            destroyDemoInstance(window.JquanUIComponents.appShellApi, '#preview-shell');
            const shell = window.JquanUIComponents.appShellApi.mount('#preview-shell', {
                title: 'JquanUI Admin',
                brand: 'JquanUI',
                menu: [
                    { label: '概览', path: '/' },
                    { label: '组件', path: '/components' },
                    { label: '设置', path: '/settings' }
                ],
                router: {
                    routes: [
                        { path: '/', title: '概览', component: '<div class="p-4 text-sm text-slate-600">概览页展示系统总览和快捷入口。</div>' },
                        { path: '/components', title: '组件', component: '<div class="p-4 text-sm text-slate-600">组件页展示列表、过滤器和文档入口。</div>' },
                        { path: '/settings', title: '设置', component: '<div class="p-4 text-sm text-slate-600">设置页展示主题、语言、权限开关。</div>' }
                    ]
                }
            });
            addDemoCleanup(() => shell?.destroy?.());
            syncState(shell);
            document.getElementById('preview-shell-open-overview')?.addEventListener('click', () => {
                shell?.open?.('/');
                syncState(shell);
            });
            document.getElementById('preview-shell-open-components')?.addEventListener('click', () => {
                shell?.open?.('/components');
                syncState(shell);
            });
            document.getElementById('preview-shell-open-settings')?.addEventListener('click', () => {
                shell?.open?.('/settings');
                syncState(shell);
            });
            document.getElementById('preview-shell-close-settings')?.addEventListener('click', () => {
                shell?.closeTab?.('/settings');
                syncState(shell);
            });
            return;
        }

        if (id === 'http') {
            renderPreviewCode('preview-http-output', {});
            document.getElementById('preview-http-build')?.addEventListener('click', () => {
                const instance = window.JquanUIComponents.httpApi.create({
                    baseURL: '/api',
                    headers: { 'X-Docs': 'components' }
                });
                renderPreviewCode('preview-http-output', instance.defaults);
            });
            document.getElementById('preview-http-request')?.addEventListener('click', async () => {
                const api = window.JquanUIComponents.httpApi.create({ responseType: 'json' });
                try {
                    const response = await api.get('data:application/json,%7B%22ok%22%3Atrue,%22source%22%3A%22JquanUI%22%7D');
                    renderPreviewCode('preview-http-output', {
                        status: response.status,
                        data: response.data,
                        duration: response.duration,
                        requestId: response.requestId
                    });
                } catch (error) {
                    renderPreviewCode('preview-http-output', {
                        error: error.code || error.message,
                        status: error.response?.status || null
                    });
                }
            });
            return;
        }

        if (id === 'i18n') {
            const out = document.getElementById('preview-i18n-text');
            const meta = document.getElementById('preview-i18n-meta');
            window.JquanUIComponents.i18nApi.registerMessages({
                'zh-CN': { common: { demo: {
                    title: '当前语言：中文',
                    bound: '这个节点通过 data-i18n 自动更新。',
                    placeholder: '请输入关键词'
                } } },
                'en-US': { common: { demo: {
                    title: 'Current locale: English',
                    bound: 'This node updates through data-i18n.',
                    placeholder: 'Search by keyword'
                } } }
            });
            const setLocale = locale => {
                window.JquanUIComponents.i18nApi.setLocale(locale);
                out.textContent = window.JquanUIComponents.i18nApi.t('demo.title');
                if (meta) {
                    const numberText = window.JquanUIComponents.i18nApi.formatValue(12345.67, { locale, type: 'number' });
                    const dateText = window.JquanUIComponents.i18nApi.formatValue(new Date('2026-05-18T00:00:00'), { locale, type: 'date' });
                    meta.textContent = locale === 'zh-CN'
                        ? `数字格式：${numberText}；日期格式：${dateText}`
                        : `Number format: ${numberText}; Date format: ${dateText}`;
                }
                document.getElementById('preview-lang-zh')?.classList.toggle('opacity-60', locale !== 'zh-CN');
                document.getElementById('preview-lang-en')?.classList.toggle('opacity-60', locale !== 'en-US');
            };
            setLocale('zh-CN');
            document.getElementById('preview-lang-zh')?.addEventListener('click', () => setLocale('zh-CN'));
            document.getElementById('preview-lang-en')?.addEventListener('click', () => setLocale('en-US'));
            return;
        }

        if (id === 'permission') {
            const refresh = () => {
                renderPreviewCode('preview-permission-output', {
                    state: window.JquanUIComponents.permissionApi.state(),
                    canWrite: window.JquanUIComponents.permissionApi.has('component.write'),
                    isAdmin: window.JquanUIComponents.permissionApi.hasRole('admin')
                });
            };
            document.getElementById('preview-role-editor')?.addEventListener('click', () => {
                window.JquanUIComponents.permissionApi.setPermissions(['component.read']);
                window.JquanUIComponents.permissionApi.setRoles(['editor']);
                refresh();
            });
            document.getElementById('preview-role-admin')?.addEventListener('click', () => {
                window.JquanUIComponents.permissionApi.setPermissions(['component.read', 'component.write']);
                window.JquanUIComponents.permissionApi.setRoles(['admin']);
                refresh();
            });
            refresh();
            return;
        }

        if (id === 'store') {
            const store = window.JquanUIComponents.storeApi.create({
                state: { count: 0, title: 'Components Docs' }
            });
            const render = () => renderPreviewCode('preview-store-output', store.getState());
            render();
            const unsubscribe = store.subscribe(render);
            addDemoCleanup(() => {
                if (typeof unsubscribe === 'function') unsubscribe();
                if (typeof store.destroy === 'function') store.destroy();
            });
            document.getElementById('preview-store-inc')?.addEventListener('click', () => {
                store.update('count', value => (value || 0) + 1);
            });
            document.getElementById('preview-store-patch')?.addEventListener('click', () => {
                store.patch({ title: 'Updated Title' });
            });
            return;
        }

        if (id === 'storage') {
            const api = window.JquanUIComponents.storageApi;
            api.config({ namespace: 'jquan-docs-demo', defaultDriver: 'local' });
            renderPreviewCode('preview-storage-output', { action: 'init', driver: 'local' });
            document.getElementById('preview-storage-set')?.addEventListener('click', () => {
                api.set('active-page', 'components');
                renderPreviewCode('preview-storage-output', { action: 'set', value: 'components' });
            });
            document.getElementById('preview-storage-read')?.addEventListener('click', () => {
                renderPreviewCode('preview-storage-output', { action: 'get', value: api.get('active-page') });
            });
            document.getElementById('preview-storage-keys')?.addEventListener('click', () => {
                renderPreviewCode('preview-storage-output', { action: 'keys', keys: api.keys() });
            });
            return;
        }

        if (id === 'localStorage') {
            renderPreviewCode('preview-localstorage-output', { action: 'ready' });
            document.getElementById('preview-localstorage-run')?.addEventListener('click', () => {
                const api = window.JquanUIComponents.localStorageApi;
                api.config({ namespace: 'jquan-components' });
                api.set('theme', 'dark');
                renderPreviewCode('preview-localstorage-output', { theme: api.get('theme'), keys: api.keys() });
            });
            document.getElementById('preview-localstorage-many')?.addEventListener('click', () => {
                const api = window.JquanUIComponents.localStorageApi;
                api.config({ namespace: 'jquan-components' });
                api.setMany({ locale: 'zh-CN', pageSize: 20 });
                renderPreviewCode('preview-localstorage-output', { action: 'setMany', entries: api.getMany(['locale', 'pageSize']) });
            });
            return;
        }

        if (id === 'sessionStorage') {
            renderPreviewCode('preview-sessionstorage-output', { action: 'ready' });
            document.getElementById('preview-sessionstorage-run')?.addEventListener('click', () => {
                const api = window.JquanUIComponents.sessionStorageApi;
                api.config({ namespace: 'jquan-components' });
                api.set('page', 'components');
                renderPreviewCode('preview-sessionstorage-output', { page: api.get('page'), keys: api.keys() });
            });
            document.getElementById('preview-sessionstorage-clear')?.addEventListener('click', () => {
                const api = window.JquanUIComponents.sessionStorageApi;
                api.config({ namespace: 'jquan-components' });
                api.clear();
                renderPreviewCode('preview-sessionstorage-output', { action: 'clear', keys: api.keys() });
            });
            return;
        }

        if (id === 'cookie') {
            renderPreviewCode('preview-cookie-output', { action: 'ready' });
            document.getElementById('preview-cookie-run')?.addEventListener('click', () => {
                const api = window.JquanUIComponents.cookieApi;
                api.config({ namespace: 'jquan-components' });
                api.set('locale', 'zh-CN', { maxAge: 600 });
                renderPreviewCode('preview-cookie-output', { locale: api.get('locale'), keys: api.keys() });
            });
            document.getElementById('preview-cookie-remove')?.addEventListener('click', () => {
                const api = window.JquanUIComponents.cookieApi;
                api.config({ namespace: 'jquan-components' });
                api.remove('locale');
                renderPreviewCode('preview-cookie-output', { action: 'remove', locale: api.get('locale'), keys: api.keys() });
            });
            return;
        }

        if (id === 'watermark') {
            destroyDemoInstance(window.JquanUIComponents.watermarkApi, '#preview-watermark');
            const root = document.getElementById('preview-watermark');
            const handle = window.JquanUIComponents.watermarkApi.mount('#preview-watermark', {
                text: 'JquanUI',
                subtext: 'Internal Preview'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-watermark-output', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            document.getElementById('preview-watermark-default')?.addEventListener('click', () => {
                handle?.update?.({
                    text: 'JquanUI',
                    subtext: 'Internal Preview',
                    angle: -22,
                    opacity: 0.14
                });
                syncState({ action: 'update(default)' });
            });
            document.getElementById('preview-watermark-confidential')?.addEventListener('click', () => {
                handle?.update?.({
                    text: 'Confidential',
                    subtext: 'Design Review',
                    angle: -14,
                    opacity: 0.12
                });
                syncState({ action: 'update(confidential)' });
            });
            document.getElementById('preview-watermark-light')?.addEventListener('click', () => {
                handle?.update?.({
                    text: 'Draft',
                    subtext: 'Read Only',
                    angle: -28,
                    opacity: 0.08
                });
                syncState({ action: 'update(light)' });
            });
            document.getElementById('preview-watermark-destroy')?.addEventListener('click', () => {
                handle?.destroy?.();
                syncState({ action: 'destroy()', state: null });
            });
            root?.addEventListener('jquan:watermark:apply', () => syncState({ action: 'event:apply' }));
            root?.addEventListener('jquan:watermark:update', () => syncState({ action: 'event:update' }));
            syncState({ action: 'ready' });
            return;
        }

        if (id === 'export') {
            destroyDemoInstance(window.JquanUIComponents.exportApi, '#preview-export');
            const root = document.getElementById('preview-export');
            const handle = window.JquanUIComponents.exportApi.mount('#preview-export', {
                filename: 'component-ops'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const tableData = () => window.JquanUIComponents.exportApi.table('#preview-export-table');
            const syncState = payload => renderPreviewCode('preview-export-output', Object.assign({
                rows: tableData().length,
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            root?.addEventListener('jquan:export:before', event => {
                syncState({ action: 'event:before', detail: event.detail });
            });
            root?.addEventListener('jquan:export:success', event => {
                syncState({ action: 'event:success', detail: event.detail });
            });
            root?.addEventListener('jquan:export:error', event => {
                syncState({ action: 'event:error', detail: event.detail });
            });
            document.getElementById('preview-export-serialize')?.addEventListener('click', () => {
                const rows = tableData();
                const content = window.JquanUIComponents.exportApi.serialize(rows, { format: 'csv' });
                renderPreviewCode('preview-export-output', {
                    action: 'serialize(csv)',
                    rows: rows.length,
                    preview: content.split('\n').slice(0, 4)
                });
            });
            syncState({ action: 'ready' });
            return;
        }

        if (id === 'print') {
            destroyDemoInstance(window.JquanUIComponents.printApi, '#preview-print');
            const root = document.getElementById('preview-print');
            const handle = window.JquanUIComponents.printApi.mount('#preview-print', {
                target: '#preview-print-panel',
                title: 'Invoice Preview'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-print-output', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            root?.addEventListener('jquan:print:before', event => {
                syncState({ action: 'event:before', detail: event.detail });
            });
            root?.addEventListener('jquan:print:after', event => {
                syncState({ action: 'event:after', detail: event.detail });
            });
            root?.addEventListener('jquan:print:error', event => {
                syncState({ action: 'event:error', detail: event.detail });
            });
            document.getElementById('preview-print-compact')?.addEventListener('click', () => {
                handle?.print?.({
                    title: 'Invoice Preview Compact',
                    pageStyle: '@page { margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
                });
                syncState({ action: 'print(compact)' });
            });
            syncState({ action: 'ready', note: '点击按钮会打开浏览器打印流程' });
            return;
        }

        if (id === 'tree') {
            destroyDemoInstance(window.JquanUIComponents.treeApi, '#preview-tree');
            const data = [
                {
                    key: 'content',
                    label: '内容管理',
                    children: [
                        { key: 'posts', label: '文章' },
                        { key: 'categories', label: '分类' },
                        { key: 'pages', label: '页面' }
                    ]
                },
                {
                    key: 'system',
                    label: '系统设置',
                    children: [
                        { key: 'menus', label: '菜单' },
                        { key: 'roles', label: '角色权限' }
                    ]
                }
            ];
            const root = document.getElementById('preview-tree');
            const handle = window.JquanUIComponents.treeApi.mount('#preview-tree', {
                data,
                expandedKeys: ['content'],
                selectedKey: 'posts',
                checkedKeys: ['posts']
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-tree-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                tree: handle?.tree ? handle.tree() : null
            }, payload || {}));
            root?.addEventListener('jquan:tree:select', event => {
                syncState({ action: 'event:select', detail: event.detail });
            });
            root?.addEventListener('jquan:tree:check', event => {
                syncState({ action: 'event:check', detail: event.detail });
            });
            root?.addEventListener('jquan:tree:expand', event => {
                syncState({ action: 'event:expand', detail: event.detail });
            });
            root?.addEventListener('jquan:tree:update', event => {
                syncState({ action: 'event:update', detail: event.detail });
            });
            document.getElementById('preview-tree-expand-all')?.addEventListener('click', () => {
                handle?.expandAll?.();
                syncState({ action: 'expandAll()' });
            });
            document.getElementById('preview-tree-collapse-all')?.addEventListener('click', () => {
                handle?.collapseAll?.();
                syncState({ action: 'collapseAll()' });
            });
            document.getElementById('preview-tree-append')?.addEventListener('click', () => {
                handle?.append?.('content', { key: 'landing-' + Date.now(), label: '专题页' });
                syncState({ action: 'append(content, node)' });
            });
            document.getElementById('preview-tree-rename')?.addEventListener('click', () => {
                handle?.update?.('categories', { label: '内容分类' });
                syncState({ action: 'update(categories)' });
            });
            document.getElementById('preview-tree-remove')?.addEventListener('click', () => {
                handle?.remove?.('pages');
                syncState({ action: 'remove(pages)' });
            });
            syncState({ action: 'ready', methods: ['expandAll()', 'collapseAll()', 'append()', 'update()', 'remove()'] });
            return;
        }

        if (id === 'schemaForm') {
            destroyDemoInstance(window.JquanUIComponents.schemaFormApi, '#preview-schema-form');
            const baseSchema = [
                { type: 'section', label: '基础信息' },
                { name: 'title', label: '标题', type: 'text', required: true, minLength: 3, help: '至少 3 个字符' },
                { name: 'slug', label: 'Slug', type: 'text', required: true, pattern: '^[a-z0-9-]+$', help: '仅允许小写字母、数字和短横线', value: 'hello-jquanui' },
                { name: 'status', label: '状态', type: 'select', required: true, options: [
                    { label: 'Draft', value: 'draft' },
                    { label: 'Review', value: 'review' },
                    { label: 'Published', value: 'published' }
                ]},
                { name: 'publishAt', label: '发布时间', type: 'date' },
                { type: 'section', label: '展示与通知' },
                { name: 'summary', label: '摘要', type: 'textarea', span: 2, maxLength: 140, help: '列表页摘要，建议 140 字以内' },
                { name: 'featured', label: '设为推荐', type: 'switch' },
                { name: 'notify', label: '通知订阅用户', type: 'checkbox' },
                { name: 'views', label: '初始阅读量', type: 'number', min: 0, value: 12 },
                { name: 'authorEmail', label: '作者邮箱', type: 'email', required: true, value: 'docs@jquanui.com' }
            ];
            const root = document.getElementById('preview-schema-form');
            const handle = window.JquanUIComponents.schemaFormApi.mount('#preview-schema-form', {
                schema: baseSchema,
                values: {
                    title: 'JquanUI Docs',
                    status: 'review',
                    summary: 'Schema 驱动的后台表单演示。',
                    featured: true,
                    notify: false
                },
                submitText: '保存内容'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = async payload => {
                const state = handle?.state ? handle.state() : null;
                let validation = null;
                if (payload?.includeValidation && handle?.validate) validation = await handle.validate();
                renderPreviewCode('preview-schema-output', Object.assign({
                    state,
                    values: handle?.values ? handle.values() : null,
                    validation
                }, payload || {}));
            };
            root?.addEventListener('jquan:schema-form:change', event => {
                renderPreviewCode('preview-schema-output', {
                    action: 'event:change',
                    detail: event.detail,
                    values: handle?.values ? handle.values() : null
                });
            });
            root?.addEventListener('jquan:schema-form:submit', event => {
                renderPreviewCode('preview-schema-output', {
                    action: 'event:submit',
                    detail: event.detail,
                    values: handle?.values ? handle.values() : null
                });
            });
            document.getElementById('preview-schema-set-values')?.addEventListener('click', async () => {
                handle?.setValues?.({
                    title: 'PocketBase Collection',
                    slug: 'pocketbase-collection',
                    status: 'published',
                    summary: '通过 SchemaForm 快速生成 CMS 内容录入界面。',
                    featured: true,
                    notify: true,
                    views: 120,
                    authorEmail: 'admin@jquanui.com'
                });
                await syncState({ action: 'setValues()' });
            });
            document.getElementById('preview-schema-validate')?.addEventListener('click', async () => {
                await syncState({ action: 'validate()', includeValidation: true });
            });
            document.getElementById('preview-schema-reset')?.addEventListener('click', async () => {
                handle?.reset?.();
                await syncState({ action: 'reset()' });
            });
            document.getElementById('preview-schema-patch')?.addEventListener('click', async () => {
                handle?.patchSchema?.(baseSchema.concat([
                    { name: 'seoTitle', label: 'SEO 标题', type: 'text', span: 2, maxLength: 60, help: '附加 SEO 字段' }
                ]));
                await syncState({ action: 'patchSchema()', schemaSize: handle?.state?.()?.schemaSize });
            });
            syncState({ action: 'ready', methods: ['setValues()', 'validate()', 'reset()', 'patchSchema()'] }).catch(() => {});
            return;
        }

        if (id === 'mediaPicker') {
            destroyDemoInstance(window.JquanUIComponents.mediaPickerApi, '#preview-media-picker');
            const items = [
                { id: 'cover-1', type: 'image', title: '首页封面', url: createPosterDataUri('Homepage Cover', '#4f46e5', '#22c55e'), size: 182340, description: 'Landing page hero' },
                { id: 'banner-1', type: 'image', title: '活动 Banner', url: createPosterDataUri('Campaign Banner', '#0f172a', '#7c3aed'), size: 263100, description: 'Marketing banner' },
                { id: 'video-1', type: 'video', title: '产品演示视频', size: 8523400, description: 'Demo clip' },
                { id: 'spec-1', type: 'file', title: '规格文档.pdf', size: 934500, description: 'PDF attachment' },
                { id: 'gallery-1', type: 'image', title: '产品相册', url: createPosterDataUri('Gallery Item', '#dc2626', '#f59e0b'), size: 312450, description: 'Gallery asset' }
            ];
            const root = document.getElementById('preview-media-picker');
            const handle = window.JquanUIComponents.mediaPickerApi.mount('#preview-media-picker', {
                items,
                multiple: true,
                selected: ['cover-1']
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-media-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                values: handle?.values ? handle.values() : []
            }, payload || {}));
            root?.addEventListener('jquan:media-picker:select', event => {
                syncState({ action: 'event:select', detail: event.detail });
            });
            root?.addEventListener('jquan:media-picker:view', event => {
                syncState({ action: 'event:view', detail: event.detail });
            });
            root?.addEventListener('jquan:media-picker:filter', event => {
                syncState({ action: 'event:filter', detail: event.detail });
            });
            document.getElementById('preview-media-select-cover')?.addEventListener('click', () => {
                handle?.select?.('cover-1');
                syncState({ action: 'select(cover-1)' });
            });
            document.getElementById('preview-media-select-video')?.addEventListener('click', () => {
                handle?.select?.('video-1');
                syncState({ action: 'select(video-1)' });
            });
            document.getElementById('preview-media-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            document.getElementById('preview-media-list')?.addEventListener('click', () => {
                handle?.setView?.('list');
                syncState({ action: 'setView(list)' });
            });
            syncState({ action: 'ready', methods: ['select()', 'clear()', 'setView()', 'values()'] });
            return;
        }

        if (id === 'relationPicker') {
            destroyDemoInstance(window.JquanUIComponents.relationPickerApi, '#preview-relation-picker');
            const items = [
                { id: 'post-1', type: 'post', title: 'JquanUI 组件路线图', description: '相关文章推荐' },
                { id: 'post-2', type: 'post', title: 'SchemaForm 设计说明', description: '后台动态表单' },
                { id: 'user-1', type: 'author', title: 'Jquan', description: 'Design System Owner' },
                { id: 'tag-1', type: 'tag', title: 'CMS', description: '内容管理标签' },
                { id: 'tag-2', type: 'tag', title: 'PocketBase', description: 'BaaS relation field' }
            ];
            const root = document.getElementById('preview-relation-picker');
            const handle = window.JquanUIComponents.relationPickerApi.mount('#preview-relation-picker', {
                items,
                multiple: true,
                selected: ['post-1']
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-relation-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                values: handle?.values ? handle.values() : []
            }, payload || {}));
            root?.addEventListener('jquan:relation-picker:select', event => {
                syncState({ action: 'event:select', detail: event.detail });
            });
            root?.addEventListener('jquan:relation-picker:search', event => {
                syncState({ action: 'event:search', detail: event.detail });
            });
            document.getElementById('preview-relation-select-post')?.addEventListener('click', () => {
                handle?.select?.('post-2');
                syncState({ action: 'select(post-2)' });
            });
            document.getElementById('preview-relation-select-author')?.addEventListener('click', () => {
                handle?.select?.('user-1');
                syncState({ action: 'select(user-1)' });
            });
            document.getElementById('preview-relation-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            syncState({ action: 'ready', methods: ['select()', 'clear()', 'values()'] });
            return;
        }

        if (id === 'filterBuilder') {
            destroyDemoInstance(window.JquanUIComponents.filterBuilderApi, '#preview-filter-builder');
            const fields = [
                { key: 'status', label: '状态', type: 'select', operators: ['equals', 'in'], options: [
                    { label: 'Draft', value: 'draft' },
                    { label: 'Review', value: 'review' },
                    { label: 'Published', value: 'published' }
                ]},
                { key: 'author', label: '作者', type: 'text', operators: ['equals', 'contains'], placeholder: '输入作者名' },
                { key: 'views', label: '阅读量', type: 'number', operators: ['gt', 'gte', 'lt', 'lte', 'equals'] },
                { key: 'category', label: '分类', type: 'text', operators: ['equals', 'contains', 'in'], placeholder: '如 cms,docs' },
                { key: 'createdAt', label: '创建日期', type: 'date', operators: ['gt', 'lt', 'equals'] }
            ];
            const root = document.getElementById('preview-filter-builder');
            const handle = window.JquanUIComponents.filterBuilderApi.mount('#preview-filter-builder', {
                logic: 'AND',
                fields,
                rules: [
                    { field: 'status', operator: 'equals', value: 'published' },
                    { field: 'views', operator: 'gt', value: 1000 }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-filter-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                rules: handle?.rules ? handle.rules() : [],
                normalized: handle?.payload ? handle.payload() : null
            }, payload || {}));
            root?.addEventListener('jquan:filter-builder:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            document.getElementById('preview-filter-append')?.addEventListener('click', () => {
                handle?.appendRule?.({ field: 'author', operator: 'contains', value: 'Jquan' });
                syncState({ action: 'appendRule(author contains Jquan)' });
            });
            document.getElementById('preview-filter-preset')?.addEventListener('click', () => {
                handle?.setRules?.([
                    { field: 'status', operator: 'in', value: 'review,published' },
                    { field: 'category', operator: 'contains', value: 'cms' },
                    { field: 'createdAt', operator: 'gt', value: '2026-01-01' }
                ]);
                syncState({ action: 'setRules(preset)' });
            });
            document.getElementById('preview-filter-or')?.addEventListener('click', () => {
                handle?.setLogic?.('OR');
                syncState({ action: 'setLogic(OR)' });
            });
            document.getElementById('preview-filter-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            syncState({ action: 'ready', methods: ['appendRule()', 'setRules()', 'setLogic()', 'clear()', 'payload()'] });
            return;
        }

        if (id === 'queryToolbar') {
            destroyDemoInstance(window.JquanUIComponents.queryToolbarApi, '#preview-query-toolbar');
            const root = document.getElementById('preview-query-toolbar');
            const handle = window.JquanUIComponents.queryToolbarApi.mount('#preview-query-toolbar', {
                keyword: 'docs',
                filters: {
                    status: 'published',
                    category: 'cms',
                    createdAt: '2026-05-01'
                },
                sort: 'newest',
                searchPlaceholder: '搜索标题、作者或 ID',
                filterFields: [
                    { key: 'status', label: '状态', type: 'select', options: [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Review', value: 'review' },
                        { label: 'Published', value: 'published' }
                    ]},
                    { key: 'category', label: '分类', type: 'select', options: [
                        { label: 'CMS', value: 'cms' },
                        { label: 'Docs', value: 'docs' },
                        { label: 'Product', value: 'product' }
                    ]},
                    { key: 'createdAt', label: '创建日期', type: 'date' }
                ],
                sortOptions: [
                    { label: 'Newest', value: 'newest' },
                    { label: 'Oldest', value: 'oldest' },
                    { label: 'Most Views', value: 'views' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-query-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                query: handle?.query ? handle.query() : null
            }, payload || {}));
            root?.addEventListener('jquan:query-toolbar:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            root?.addEventListener('jquan:query-toolbar:apply', event => {
                syncState({ action: 'event:apply', detail: event.detail });
            });
            root?.addEventListener('jquan:query-toolbar:reset', event => {
                syncState({ action: 'event:reset', detail: event.detail });
            });
            document.getElementById('preview-query-keyword')?.addEventListener('click', () => {
                handle?.setKeyword?.('pocketbase');
                syncState({ action: 'setKeyword(pocketbase)' });
            });
            document.getElementById('preview-query-filters')?.addEventListener('click', () => {
                handle?.setFilters?.({
                    status: 'review',
                    category: 'product',
                    createdAt: '2026-04-18'
                });
                syncState({ action: 'setFilters(review, product)' });
            });
            document.getElementById('preview-query-sort')?.addEventListener('click', () => {
                handle?.setSort?.('views');
                syncState({ action: 'setSort(views)' });
            });
            document.getElementById('preview-query-apply')?.addEventListener('click', () => {
                handle?.apply?.();
                syncState({ action: 'apply()' });
            });
            document.getElementById('preview-query-reset')?.addEventListener('click', () => {
                handle?.reset?.();
                syncState({ action: 'reset()' });
            });
            syncState({ action: 'ready', methods: ['setKeyword()', 'setFilters()', 'setSort()', 'apply()', 'reset()', 'query()'] });
            return;
        }

        if (id === 'batchActions') {
            destroyDemoInstance(window.JquanUIComponents.batchActionsApi, '#preview-batch-actions');
            const root = document.getElementById('preview-batch-actions');
            const handle = window.JquanUIComponents.batchActionsApi.mount('#preview-batch-actions', {
                selected: ['post-1', 'post-2'],
                actions: [
                    { key: 'publish', label: '批量发布', minSelected: 1 },
                    { key: 'move', label: '移动分类', minSelected: 1 },
                    { key: 'export', label: '导出', minSelected: 2 },
                    { key: 'delete', label: '批量删除', minSelected: 1, tone: 'danger', confirm: true }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-batch-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                selected: handle?.selected ? handle.selected() : []
            }, payload || {}));
            root?.addEventListener('jquan:batch-actions:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            root?.addEventListener('jquan:batch-actions:execute', event => {
                syncState({ action: 'event:execute', detail: event.detail });
            });
            document.getElementById('preview-batch-select-two')?.addEventListener('click', () => {
                handle?.setSelected?.(['post-1', 'post-2']);
                syncState({ action: 'setSelected(2)' });
            });
            document.getElementById('preview-batch-select-five')?.addEventListener('click', () => {
                handle?.setSelected?.(['post-1', 'post-2', 'post-3', 'post-4', 'post-5']);
                syncState({ action: 'setSelected(5)' });
            });
            document.getElementById('preview-batch-trigger-publish')?.addEventListener('click', () => {
                handle?.trigger?.('publish');
                syncState({ action: 'trigger(publish)' });
            });
            document.getElementById('preview-batch-trigger-delete')?.addEventListener('click', () => {
                handle?.trigger?.('delete');
                syncState({ action: 'trigger(delete)' });
            });
            document.getElementById('preview-batch-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            syncState({ action: 'ready', methods: ['setSelected()', 'trigger()', 'clear()', 'state()'] });
            return;
        }

        if (id === 'recordMetaPanel') {
            destroyDemoInstance(window.JquanUIComponents.recordMetaPanelApi, '#preview-record-meta-panel');
            const root = document.getElementById('preview-record-meta-panel');
            const handle = window.JquanUIComponents.recordMetaPanelApi.mount('#preview-record-meta-panel', {
                title: 'Article Meta',
                status: { label: 'Review', tone: 'warning' },
                meta: [
                    { label: 'Author', value: 'Jquan' },
                    { label: 'Published At', value: '2026-05-21 10:30' },
                    { label: 'Slug', value: '/docs/jquanui-admin-components' }
                ],
                stats: [
                    { label: 'Views', value: '12.4k' },
                    { label: 'Likes', value: '386' },
                    { label: 'Shares', value: '74' }
                ],
                seo: [
                    { label: 'SEO Title', value: 'JquanUI Admin Components' },
                    { label: 'Description', value: '面向后台与 CMS 的组件文档与交互预览。' }
                ],
                actions: [
                    { key: 'preview', label: '预览', tone: 'default' },
                    { key: 'publish', label: '发布', tone: 'primary' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-meta-panel-output', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            root?.addEventListener('jquan:record-meta-panel:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            root?.addEventListener('jquan:record-meta-panel:action', event => {
                syncState({ action: 'event:action', detail: event.detail });
            });
            document.getElementById('preview-meta-publish')?.addEventListener('click', () => {
                handle?.setStatus?.({ label: 'Published', tone: 'success' });
                syncState({ action: 'setStatus(Published)' });
            });
            document.getElementById('preview-meta-seo')?.addEventListener('click', () => {
                handle?.setSeo?.([
                    { label: 'SEO Title', value: 'PocketBase + JquanUI' },
                    { label: 'Description', value: '为内容后台补齐查询、筛选、批量操作和详情面板。' },
                    { label: 'Canonical', value: 'https://jquanui.example/docs/admin' }
                ]);
                syncState({ action: 'setSeo()' });
            });
            document.getElementById('preview-meta-stats')?.addEventListener('click', () => {
                handle?.setStats?.([
                    { label: 'Views', value: '18.9k' },
                    { label: 'Likes', value: '522' },
                    { label: 'Shares', value: '104' }
                ]);
                syncState({ action: 'setStats()' });
            });
            document.getElementById('preview-meta-action')?.addEventListener('click', () => {
                root?.querySelector('[data-key=\"publish\"]')?.click();
            });
            syncState({ action: 'ready', methods: ['setStatus()', 'setSeo()', 'setStats()', 'state()'] });
            return;
        }

        if (id === 'collectionFieldDesigner') {
            destroyDemoInstance(window.JquanUIComponents.collectionFieldDesignerApi, '#preview-collection-field-designer');
            const root = document.getElementById('preview-collection-field-designer');
            const handle = window.JquanUIComponents.collectionFieldDesignerApi.mount('#preview-collection-field-designer', {
                fields: [
                    { name: 'title', type: 'text', required: true, defaultValue: '' },
                    { name: 'status', type: 'text', required: true, defaultValue: 'draft' },
                    { name: 'publishedAt', type: 'date', required: false, defaultValue: '' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-field-designer-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                schema: handle?.schema ? handle.schema() : null
            }, payload || {}));
            root?.addEventListener('jquan:collection-field-designer:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            document.getElementById('preview-field-add')?.addEventListener('click', () => {
                handle?.appendField?.({ name: 'author', type: 'relation', required: false, defaultValue: '' });
                syncState({ action: 'appendField(author)' });
            });
            document.getElementById('preview-field-set')?.addEventListener('click', () => {
                handle?.setFields?.([
                    { name: 'title', type: 'text', required: true, defaultValue: '' },
                    { name: 'summary', type: 'textarea', required: false, defaultValue: '' },
                    { name: 'views', type: 'number', required: false, defaultValue: 0 },
                    { name: 'isFeatured', type: 'boolean', required: false, defaultValue: false }
                ]);
                syncState({ action: 'setFields(preset)' });
            });
            document.getElementById('preview-field-schema')?.addEventListener('click', () => {
                syncState({ action: 'schema()' });
            });
            syncState({ action: 'ready', methods: ['appendField()', 'setFields()', 'schema()', 'state()'] });
            return;
        }

        if (id === 'permissionMatrix') {
            destroyDemoInstance(window.JquanUIComponents.permissionMatrixApi, '#preview-permission-matrix');
            const root = document.getElementById('preview-permission-matrix');
            const handle = window.JquanUIComponents.permissionMatrixApi.mount('#preview-permission-matrix', {
                columns: [
                    { key: 'view', label: 'View' },
                    { key: 'create', label: 'Create' },
                    { key: 'update', label: 'Update' },
                    { key: 'delete', label: 'Delete' }
                ],
                rows: [
                    { key: 'posts', label: 'Posts' },
                    { key: 'media', label: 'Media' },
                    { key: 'users', label: 'Users' },
                    { key: 'settings', label: 'Settings' }
                ],
                values: {
                    posts: { view: true, create: true, update: true, delete: false },
                    media: { view: true, create: true, update: false, delete: false },
                    users: { view: true, create: false, update: false, delete: false },
                    settings: { view: true, create: false, update: false, delete: false }
                }
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-permission-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                payload: handle?.payload ? handle.payload() : null
            }, payload || {}));
            root?.addEventListener('jquan:permission-matrix:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            document.getElementById('preview-permission-check-all')?.addEventListener('click', () => {
                handle?.checkAll?.();
                syncState({ action: 'checkAll()' });
            });
            document.getElementById('preview-permission-clear-all')?.addEventListener('click', () => {
                handle?.clearAll?.();
                syncState({ action: 'clearAll()' });
            });
            document.getElementById('preview-permission-set-values')?.addEventListener('click', () => {
                handle?.setValues?.({
                    posts: { view: true, create: true, update: true, delete: true },
                    media: { view: true, create: true, update: true, delete: false },
                    users: { view: true, create: false, update: true, delete: false },
                    settings: { view: true, create: false, update: false, delete: false }
                });
                syncState({ action: 'setValues(preset)' });
            });
            syncState({ action: 'ready', methods: ['checkAll()', 'clearAll()', 'setValues()', 'payload()'] });
            return;
        }

        if (id === 'navigationBuilder') {
            destroyDemoInstance(window.JquanUIComponents.navigationBuilderApi, '#preview-navigation-builder');
            const root = document.getElementById('preview-navigation-builder');
            const handle = window.JquanUIComponents.navigationBuilderApi.mount('#preview-navigation-builder', {
                items: [
                    { label: 'Dashboard', path: '/dashboard', icon: 'home' },
                    { label: 'Posts', path: '/posts', icon: 'file-text' },
                    { label: 'Media', path: '/media', icon: 'image' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-nav-output', Object.assign({
                state: handle?.state ? handle.state() : null,
                items: handle?.items ? handle.items() : []
            }, payload || {}));
            root?.addEventListener('jquan:navigation-builder:change', event => {
                syncState({ action: 'event:change', detail: event.detail });
            });
            document.getElementById('preview-nav-add')?.addEventListener('click', () => {
                handle?.appendItem?.({ label: 'Reports', path: '/reports', icon: 'bar-chart-3' });
                syncState({ action: 'appendItem(reports)' });
            });
            document.getElementById('preview-nav-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { label: 'Overview', path: '/overview', icon: 'layout-dashboard' },
                    { label: 'Orders', path: '/orders', icon: 'shopping-cart' },
                    { label: 'Customers', path: '/customers', icon: 'users' }
                ]);
                syncState({ action: 'setItems(preset)' });
            });
            syncState({ action: 'ready', methods: ['appendItem()', 'setItems()', 'items()', 'state()'] });
            return;
        }

        if (id === 'dashboardStats') {
            destroyDemoInstance(window.JquanUIComponents.dashboardStatsApi, '#preview-dashboard-stats');
            const handle = window.JquanUIComponents.dashboardStatsApi.mount('#preview-dashboard-stats', {
                items: [
                    { label: 'Active Users', value: '12,480', delta: '+8.4%', trend: 'up', description: 'Compared with last week' },
                    { label: 'Published Posts', value: '1,286', delta: '+42', trend: 'up', description: 'This month' },
                    { label: 'Conversions', value: '3.42%', delta: '-0.2%', trend: 'down', description: 'Checkout completion' },
                    { label: 'Revenue', value: '$84,200', delta: '+12.1%', trend: 'up', description: 'Monthly recurring' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-stats-output', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            document.getElementById('preview-stats-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { label: 'Active Users', value: '13,920', delta: '+11.6%', trend: 'up', description: 'Compared with last week' },
                    { label: 'Published Posts', value: '1,341', delta: '+55', trend: 'up', description: 'This month' },
                    { label: 'Conversions', value: '3.68%', delta: '+0.26%', trend: 'up', description: 'Checkout completion' },
                    { label: 'Revenue', value: '$91,400', delta: '+8.5%', trend: 'up', description: 'Monthly recurring' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['setItems()', 'state()'] });
            return;
        }

        if (id === 'auditTimeline') {
            destroyDemoInstance(window.JquanUIComponents.auditTimelineApi, '#preview-audit-timeline');
            const handle = window.JquanUIComponents.auditTimelineApi.mount('#preview-audit-timeline', {
                items: [
                    { title: 'Published article', actor: 'Jquan', time: '2026-05-21 10:30', target: 'Post #184', description: 'Article moved from review to published.' },
                    { title: 'Updated permission policy', actor: 'Admin', time: '2026-05-21 09:12', target: 'Role: Editor', description: 'Enabled update permission for media library.' },
                    { title: 'Deleted asset', actor: 'Lina', time: '2026-05-20 18:46', target: 'Asset #A-218', description: 'Removed deprecated campaign banner.' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-audit-output', Object.assign({
                state: handle?.state ? handle.state() : null
            }, payload || {}));
            document.getElementById('preview-audit-prepend')?.addEventListener('click', () => {
                handle?.prepend?.({ title: 'Signed in', actor: 'Ops', time: '2026-05-21 11:04', target: 'Console', description: 'Successful admin login from trusted device.' });
                syncState({ action: 'prepend()' });
            });
            document.getElementById('preview-audit-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { title: 'Created collection', actor: 'Jquan', time: '2026-05-21 08:40', target: 'products', description: 'Added new product collection schema.' },
                    { title: 'Exported report', actor: 'Finance', time: '2026-05-20 17:20', target: 'Revenue Q2', description: 'CSV export completed.' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['prepend()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'kanbanBoard') {
            destroyDemoInstance(window.JquanUIComponents.kanbanBoardApi, '#preview-kanban-board');
            const handle = window.JquanUIComponents.kanbanBoardApi.mount('#preview-kanban-board', {
                columns: [
                    { key: 'todo', title: 'Todo', cards: [{ id: 'card-1', title: 'Draft homepage copy', meta: 'PM · today', description: 'Prepare new landing copy.' }] },
                    { key: 'review', title: 'Review', cards: [{ id: 'card-2', title: 'Review publish flow', meta: 'Ops · 14:00', description: 'Check approval states and notifications.' }] },
                    { key: 'done', title: 'Done', cards: [{ id: 'card-3', title: 'Ship query toolbar', meta: 'UI · done', description: 'Integrated with docs and blocks page.' }] }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-kanban-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-kanban-add')?.addEventListener('click', () => {
                handle?.appendCard?.('todo', { title: 'Add approval block', meta: 'Docs · queued', description: 'Document approval flow usage.' });
                syncState({ action: 'appendCard(todo)' });
            });
            document.getElementById('preview-kanban-reset')?.addEventListener('click', () => {
                handle?.setColumns?.([
                    { key: 'backlog', title: 'Backlog', cards: [{ title: 'Collect feedback', meta: 'Team', description: 'Review comments from QA.' }] },
                    { key: 'doing', title: 'Doing', cards: [{ title: 'Refine docs', meta: 'Docs', description: 'Improve block explanations.' }] },
                    { key: 'done', title: 'Done', cards: [{ title: 'Create UI page', meta: 'Done', description: 'Admin blocks page shipped.' }] }
                ]);
                syncState({ action: 'setColumns()' });
            });
            syncState({ action: 'ready', methods: ['appendCard()', 'moveCard()', 'setColumns()', 'state()'] });
            return;
        }

        if (id === 'approvalFlow') {
            destroyDemoInstance(window.JquanUIComponents.approvalFlowApi, '#preview-approval-flow');
            const handle = window.JquanUIComponents.approvalFlowApi.mount('#preview-approval-flow', {
                steps: [
                    { id: 'draft', title: 'Draft', actor: 'Editor', time: '09:00', description: 'Initial submission ready.', status: 'completed' },
                    { id: 'review', title: 'Review', actor: 'Lead', time: '10:20', description: 'Content quality check.', status: 'current' },
                    { id: 'legal', title: 'Legal', actor: 'Legal', time: '', description: 'Compliance review.', status: 'pending' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-approval-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-approval-approve')?.addEventListener('click', () => {
                handle?.approve?.('review');
                syncState({ action: 'approve(review)' });
            });
            document.getElementById('preview-approval-reject')?.addEventListener('click', () => {
                handle?.reject?.('legal');
                syncState({ action: 'reject(legal)' });
            });
            document.getElementById('preview-approval-reset')?.addEventListener('click', () => {
                handle?.setSteps?.([
                    { id: 'submit', title: 'Submit', actor: 'Author', time: '08:40', description: 'Author submitted request.', status: 'completed' },
                    { id: 'manager', title: 'Manager Review', actor: 'Manager', time: '09:10', description: 'Awaiting manager review.', status: 'current' },
                    { id: 'publish', title: 'Publish', actor: 'System', time: '', description: 'Auto publish after approval.', status: 'pending' }
                ]);
                syncState({ action: 'setSteps()' });
            });
            syncState({ action: 'ready', methods: ['approve()', 'reject()', 'setSteps()', 'state()'] });
            return;
        }

        if (id === 'commentThread') {
            destroyDemoInstance(window.JquanUIComponents.commentThreadApi, '#preview-comment-thread');
            const handle = window.JquanUIComponents.commentThreadApi.mount('#preview-comment-thread', {
                items: [
                    { id: 'comment-1', author: 'Reviewer', time: '2026-05-21 09:40', content: 'The summary needs one more sentence.', replies: [{ author: 'Editor', time: '2026-05-21 09:52', content: 'Updated the summary and re-saved.' }] },
                    { id: 'comment-2', author: 'PM', time: '2026-05-21 10:05', content: 'Add a note about permission matrix scenarios.' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-comment-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-comment-add')?.addEventListener('click', () => {
                handle?.appendComment?.({ author: 'Ops', time: '2026-05-21 10:30', content: 'Release note draft is ready.' });
                syncState({ action: 'appendComment()' });
            });
            document.getElementById('preview-comment-reply')?.addEventListener('click', () => {
                handle?.reply?.('comment-2', { author: 'You', time: '2026-05-21 10:42', content: 'Added the requested matrix note.' });
                syncState({ action: 'reply(comment-2)' });
            });
            document.getElementById('preview-comment-reset')?.addEventListener('click', () => {
                handle?.setItems?.([{ author: 'Admin', time: '2026-05-21 08:15', content: 'Initial moderation thread.' }]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['appendComment()', 'reply()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'mediaLibraryPanel') {
            destroyDemoInstance(window.JquanUIComponents.mediaLibraryPanelApi, '#preview-media-library-panel');
            const handle = window.JquanUIComponents.mediaLibraryPanelApi.mount('#preview-media-library-panel', {
                items: [
                    { id: 'asset-1', title: 'Homepage Cover', type: 'image', url: createPosterDataUri('Cover', '#4f46e5', '#22c55e'), size: '182 KB', meta: 'landing' },
                    { id: 'asset-2', title: 'Product Teaser', type: 'video', size: '8.2 MB', meta: 'campaign' },
                    { id: 'asset-3', title: 'Pricing Sheet', type: 'file', size: '420 KB', meta: 'pdf' }
                ],
                selected: ['asset-1']
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-media-library-output', Object.assign({ state: handle?.state ? handle.state() : null, values: handle?.values ? handle.values() : [] }, payload || {}));
            document.getElementById('preview-media-library-select')?.addEventListener('click', () => {
                handle?.select?.('asset-2');
                syncState({ action: 'select(asset-2)' });
            });
            document.getElementById('preview-media-library-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'asset-4', title: 'Case Study Cover', type: 'image', url: createPosterDataUri('Case Study', '#0f172a', '#7c3aed'), size: '204 KB', meta: 'case study' },
                    { id: 'asset-5', title: 'Brand Video', type: 'video', size: '12.1 MB', meta: 'brand' }
                ]);
                syncState({ action: 'setItems()' });
            });
            document.getElementById('preview-media-library-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            syncState({ action: 'ready', methods: ['setItems()', 'select()', 'clear()', 'values()', 'state()'] });
            return;
        }

        if (id === 'revisionCompare') {
            destroyDemoInstance(window.JquanUIComponents.revisionCompareApi, '#preview-revision-compare');
            const handle = window.JquanUIComponents.revisionCompareApi.mount('#preview-revision-compare', {
                left: 'Title: JquanUI Admin Blocks\nStatus: Review\nSummary: Basic block page.',
                right: 'Title: JquanUI Admin Blocks\nStatus: Published\nSummary: Full block gallery with runtime output.'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-revision-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-revision-set')?.addEventListener('click', () => {
                handle?.setValues?.(
                    'SEO Title: JquanUI\nDescription: Admin UI docs.',
                    'SEO Title: JquanUI Admin\nDescription: Admin UI docs and scenario gallery.'
                );
                syncState({ action: 'setValues()' });
            });
            syncState({ action: 'ready', methods: ['setValues()', 'state()'] });
            return;
        }

        if (id === 'publishScheduler') {
            destroyDemoInstance(window.JquanUIComponents.publishSchedulerApi, '#preview-publish-scheduler');
            const handle = window.JquanUIComponents.publishSchedulerApi.mount('#preview-publish-scheduler', {
                value: '2026-05-22T09:00',
                timezone: 'Asia/Shanghai',
                status: 'scheduled'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-scheduler-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-scheduler-set')?.addEventListener('click', () => {
                handle?.setValue?.({ value: '2026-05-23T10:30', timezone: 'UTC+08:00', status: 'scheduled' });
                syncState({ action: 'setValue()' });
            });
            document.getElementById('preview-scheduler-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            syncState({ action: 'ready', methods: ['setValue()', 'clear()', 'state()'] });
            return;
        }

        if (id === 'dataFilterPresetBar') {
            destroyDemoInstance(window.JquanUIComponents.dataFilterPresetBarApi, '#preview-filter-preset-bar');
            const handle = window.JquanUIComponents.dataFilterPresetBarApi.mount('#preview-filter-preset-bar', {
                presets: [
                    { key: 'all', label: 'All', filters: {} },
                    { key: 'review', label: 'Review', filters: { status: 'review' } },
                    { key: 'published', label: 'Published', filters: { status: 'published' } }
                ],
                active: 'all'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-preset-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-preset-activate')?.addEventListener('click', () => {
                handle?.activate?.('published');
                syncState({ action: 'activate(published)' });
            });
            document.getElementById('preview-preset-set')?.addEventListener('click', () => {
                handle?.setPresets?.([
                    { key: 'draft', label: 'Draft', filters: { status: 'draft' } },
                    { key: 'featured', label: 'Featured', filters: { featured: true } }
                ]);
                syncState({ action: 'setPresets()' });
            });
            syncState({ action: 'ready', methods: ['activate()', 'setPresets()', 'state()'] });
            return;
        }

        if (id === 'roleMemberAssigner') {
            destroyDemoInstance(window.JquanUIComponents.roleMemberAssignerApi, '#preview-role-member-assigner');
            const handle = window.JquanUIComponents.roleMemberAssignerApi.mount('#preview-role-member-assigner', {
                roles: [{ key: 'admin', label: 'Admin' }, { key: 'editor', label: 'Editor' }, { key: 'reviewer', label: 'Reviewer' }],
                members: [{ id: 'u-1', name: 'Jquan', meta: 'Owner' }, { id: 'u-2', name: 'Lina', meta: 'Ops' }, { id: 'u-3', name: 'Kai', meta: 'Content' }],
                assignments: { admin: ['u-1'], editor: ['u-3'], reviewer: ['u-2'] }
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-role-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-role-set')?.addEventListener('click', () => {
                handle?.setRole?.('editor');
                syncState({ action: 'setRole(editor)' });
            });
            document.getElementById('preview-role-toggle')?.addEventListener('click', () => {
                handle?.toggle?.('u-2');
                syncState({ action: 'toggle(u-2)' });
            });
            syncState({ action: 'ready', methods: ['setRole()', 'toggle()', 'setAssignments()', 'state()'] });
            return;
        }

        if (id === 'contentOutlinePanel') {
            destroyDemoInstance(window.JquanUIComponents.contentOutlinePanelApi, '#preview-content-outline-panel');
            const handle = window.JquanUIComponents.contentOutlinePanelApi.mount('#preview-content-outline-panel', {
                items: [
                    { id: 'intro', title: 'Introduction', level: 2, meta: 'H2' },
                    { id: 'layout', title: 'Layout Strategy', level: 2, meta: 'H2' },
                    { id: 'layout-grid', title: 'Grid Structure', level: 3, meta: 'H3' },
                    { id: 'api', title: 'API Notes', level: 2, meta: 'H2' }
                ],
                active: 'layout'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-outline-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-outline-activate')?.addEventListener('click', () => {
                handle?.activate?.('api');
                syncState({ action: 'activate(api)' });
            });
            document.getElementById('preview-outline-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'draft', title: 'Draft Notes', level: 2, meta: 'H2' },
                    { id: 'draft-a', title: 'Author Comments', level: 3, meta: 'H3' },
                    { id: 'review', title: 'Review Changes', level: 2, meta: 'H2' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['activate()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'taskInbox') {
            destroyDemoInstance(window.JquanUIComponents.taskInboxApi, '#preview-task-inbox');
            const handle = window.JquanUIComponents.taskInboxApi.mount('#preview-task-inbox', {
                items: [
                    { id: 'task-1', title: 'Review homepage draft', meta: 'Content · today', description: 'Check copy and SEO summary.', status: 'pending' },
                    { id: 'task-2', title: 'Approve media assets', meta: 'Design · 14:00', description: 'Validate campaign banner exports.', status: 'pending' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-task-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-task-done')?.addEventListener('click', () => {
                handle?.markDone?.('task-1');
                syncState({ action: 'markDone(task-1)' });
            });
            document.getElementById('preview-task-snooze')?.addEventListener('click', () => {
                handle?.snooze?.('task-2');
                syncState({ action: 'snooze(task-2)' });
            });
            document.getElementById('preview-task-prepend')?.addEventListener('click', () => {
                handle?.prepend?.({ title: 'Publish release note', meta: 'Ops · queued', description: 'Prepare final release note copy.' });
                syncState({ action: 'prepend()' });
            });
            syncState({ action: 'ready', methods: ['markDone()', 'snooze()', 'prepend()', 'state()'] });
            return;
        }

        if (id === 'notificationCenterPanel') {
            destroyDemoInstance(window.JquanUIComponents.notificationCenterPanelApi, '#preview-notification-center-panel');
            const handle = window.JquanUIComponents.notificationCenterPanelApi.mount('#preview-notification-center-panel', {
                items: [
                    { id: 'notice-1', title: 'Workflow updated', meta: 'now', body: 'Approval flow has been changed for editors.', unread: true },
                    { id: 'notice-2', title: 'New comment', meta: '10 min ago', body: 'PM left feedback on the publish summary.', unread: true }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-notice-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-notice-read')?.addEventListener('click', () => {
                handle?.markRead?.('notice-1');
                syncState({ action: 'markRead(notice-1)' });
            });
            document.getElementById('preview-notice-prepend')?.addEventListener('click', () => {
                handle?.prepend?.({ title: 'Storage almost full', meta: 'just now', body: 'Media storage usage reached 85%.', unread: true });
                syncState({ action: 'prepend()' });
            });
            syncState({ action: 'ready', methods: ['markRead()', 'prepend()', 'state()'] });
            return;
        }

        if (id === 'workspaceSwitcher') {
            destroyDemoInstance(window.JquanUIComponents.workspaceSwitcherApi, '#preview-workspace-switcher');
            const handle = window.JquanUIComponents.workspaceSwitcherApi.mount('#preview-workspace-switcher', {
                items: [
                    { id: 'ws-1', title: 'Marketing Site', meta: 'Production' },
                    { id: 'ws-2', title: 'Docs Workspace', meta: 'Staging' },
                    { id: 'ws-3', title: 'Admin Console', meta: 'Internal' }
                ],
                active: 'ws-1'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-workspace-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-workspace-activate')?.addEventListener('click', () => {
                handle?.activate?.('ws-2');
                syncState({ action: 'activate(ws-2)' });
            });
            document.getElementById('preview-workspace-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'ws-4', title: 'Support Desk', meta: 'Live' },
                    { id: 'ws-5', title: 'CRM Hub', meta: 'Ops' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['activate()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'recentActivityFeed') {
            destroyDemoInstance(window.JquanUIComponents.recentActivityFeedApi, '#preview-recent-activity-feed');
            const handle = window.JquanUIComponents.recentActivityFeedApi.mount('#preview-recent-activity-feed', {
                items: [
                    { id: 'activity-1', title: 'Published landing page', meta: '2 min ago', body: 'Marketing homepage was published to production.', type: 'publish' },
                    { id: 'activity-2', title: 'Updated permission matrix', meta: '15 min ago', body: 'Editor role now has review access.', type: 'permission' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-activity-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-activity-prepend')?.addEventListener('click', () => {
                handle?.prepend?.({ title: 'New media uploaded', meta: 'just now', body: 'Campaign assets were added to the media library.', type: 'upload' });
                syncState({ action: 'prepend()' });
            });
            document.getElementById('preview-activity-append')?.addEventListener('click', () => {
                handle?.append?.({ title: 'Cache cleared', meta: 'queued', body: 'CDN cache clear job has been scheduled.', type: 'ops' });
                syncState({ action: 'append()' });
            });
            document.getElementById('preview-activity-clear')?.addEventListener('click', () => {
                handle?.clear?.();
                syncState({ action: 'clear()' });
            });
            syncState({ action: 'ready', methods: ['prepend()', 'append()', 'clear()', 'state()'] });
            return;
        }

        if (id === 'quickActionLauncher') {
            destroyDemoInstance(window.JquanUIComponents.quickActionLauncherApi, '#preview-quick-action-launcher');
            const handle = window.JquanUIComponents.quickActionLauncherApi.mount('#preview-quick-action-launcher', {
                items: [
                    { id: 'create-post', title: 'Create Post', meta: 'Content', description: 'Open the article editor and create a new draft.' },
                    { id: 'publish-homepage', title: 'Publish Homepage', meta: 'Site', description: 'Push homepage changes to production.' },
                    { id: 'open-assets', title: 'Open Assets', meta: 'Media', description: 'Jump to the media library workspace.' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-quick-action-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-quick-action-search')?.addEventListener('click', () => {
                handle?.search?.('publish');
                syncState({ action: 'search(publish)' });
            });
            document.getElementById('preview-quick-action-run')?.addEventListener('click', () => {
                handle?.execute?.('create-post');
                syncState({ action: 'execute(create-post)' });
            });
            document.getElementById('preview-quick-action-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'invite-user', title: 'Invite User', meta: 'Access', description: 'Create a new collaborator invitation.' },
                    { id: 'open-settings', title: 'Open Settings', meta: 'System', description: 'Jump to workspace settings.' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['search()', 'execute()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'siteLocaleSwitcher') {
            destroyDemoInstance(window.JquanUIComponents.siteLocaleSwitcherApi, '#preview-site-locale-switcher');
            const handle = window.JquanUIComponents.siteLocaleSwitcherApi.mount('#preview-site-locale-switcher', {
                items: [
                    { id: 'zh-CN', title: 'Chinese (Simplified)', meta: 'Mainland', status: 'published' },
                    { id: 'en-US', title: 'English (US)', meta: 'Global', status: 'review' },
                    { id: 'ja-JP', title: 'Japanese', meta: 'Japan', status: 'draft' }
                ],
                active: 'zh-CN'
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-locale-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-locale-activate')?.addEventListener('click', () => {
                handle?.activate?.('en-US');
                syncState({ action: 'activate(en-US)' });
            });
            document.getElementById('preview-locale-set')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'fr-FR', title: 'French', meta: 'France', status: 'draft' },
                    { id: 'de-DE', title: 'German', meta: 'Germany', status: 'published' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['activate()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'reviewQueuePanel') {
            destroyDemoInstance(window.JquanUIComponents.reviewQueuePanelApi, '#preview-review-queue-panel');
            const handle = window.JquanUIComponents.reviewQueuePanelApi.mount('#preview-review-queue-panel', {
                items: [
                    { id: 'review-1', title: 'Homepage release summary', meta: 'Content · P1', body: 'Review the final summary before publish.', status: 'pending' },
                    { id: 'review-2', title: 'Campaign hero assets', meta: 'Design · P2', body: 'Validate the image set and copy pairing.', status: 'pending' }
                ]
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-review-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-review-approve')?.addEventListener('click', () => {
                handle?.approve?.('review-1');
                syncState({ action: 'approve(review-1)' });
            });
            document.getElementById('preview-review-reject')?.addEventListener('click', () => {
                handle?.reject?.('review-2');
                syncState({ action: 'reject(review-2)' });
            });
            document.getElementById('preview-review-reset')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'review-3', title: 'Billing FAQ update', meta: 'Docs · P2', body: 'Check the rewritten answer set.', status: 'pending' },
                    { id: 'review-4', title: 'Partner logo refresh', meta: 'Brand · P3', body: 'Approve the final partner logo list.', status: 'pending' }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['approve()', 'reject()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'assetFolderTree') {
            destroyDemoInstance(window.JquanUIComponents.assetFolderTreeApi, '#preview-asset-folder-tree');
            const handle = window.JquanUIComponents.assetFolderTreeApi.mount('#preview-asset-folder-tree', {
                items: [
                    { id: 'root', title: 'All Assets', meta: '240', children: [
                        { id: 'images', title: 'Images', meta: '120', children: [
                            { id: 'campaign', title: 'Campaign', meta: '32', children: [] },
                            { id: 'homepage', title: 'Homepage', meta: '18', children: [] }
                        ] },
                        { id: 'videos', title: 'Videos', meta: '28', children: [] }
                    ] }
                ],
                active: 'root',
                expanded: ['root', 'images']
            });
            addDemoCleanup(() => handle?.destroy?.());
            const syncState = payload => renderPreviewCode('preview-folder-output', Object.assign({ state: handle?.state ? handle.state() : null }, payload || {}));
            document.getElementById('preview-folder-toggle')?.addEventListener('click', () => {
                handle?.toggle?.('images');
                syncState({ action: 'toggle(images)' });
            });
            document.getElementById('preview-folder-activate')?.addEventListener('click', () => {
                handle?.activate?.('campaign');
                syncState({ action: 'activate(campaign)' });
            });
            document.getElementById('preview-folder-reset')?.addEventListener('click', () => {
                handle?.setItems?.([
                    { id: 'library', title: 'Library', meta: '88', children: [
                        { id: 'brand', title: 'Brand', meta: '12', children: [] },
                        { id: 'docs', title: 'Docs', meta: '9', children: [] }
                    ] }
                ]);
                syncState({ action: 'setItems()' });
            });
            syncState({ action: 'ready', methods: ['toggle()', 'activate()', 'setItems()', 'state()'] });
            return;
        }

        if (id === 'map') {
            const syncState = payload => renderPreviewCode('preview-map-state', payload || {});
            class DocsMockMapProvider {
                constructor(options) {
                    this.options = options;
                    this.container = options.container;
                    this.markers = [];
                    this.overlays = [];
                    this.listeners = new Map();
                }
                async init() {
                    this.container.innerHTML = `
                        <div class="grid h-full min-h-[280px] place-items-center bg-[linear-gradient(180deg,#f8fafc,#ffffff)]">
                            <div class="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div class="text-sm font-semibold text-slate-800">Mock Map Provider</div>
                                <div class="text-sm text-slate-500">用于离线展示 mount、marker、infoWindow、clearOverlays 等 API。</div>
                                <div id="preview-map-canvas" class="relative h-40 w-[min(72vw,420px)] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"></div>
                            </div>
                        </div>
                    `;
                    this.canvas = this.container.querySelector('#preview-map-canvas');
                    this.emit('ready', { provider: 'docs-mock' });
                }
                emit(type, payload) {
                    (this.listeners.get(type) || []).forEach(fn => fn(payload));
                }
                on(type, handler) {
                    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
                    this.listeners.get(type).add(handler);
                    return () => this.off(type, handler);
                }
                off(type, handler) {
                    return this.listeners.get(type)?.delete(handler);
                }
                setCenter() {}
                setZoom() {}
                setMapType() {}
                addMarker(marker) {
                    const node = document.createElement('button');
                    node.type = 'button';
                    node.className = 'absolute inline-flex h-7 items-center rounded-xl border border-primary/20 bg-primary px-2.5 text-xs font-semibold text-white shadow-sm';
                    node.style.left = `${marker.x || 24}px`;
                    node.style.top = `${marker.y || 24}px`;
                    node.textContent = marker.label || 'Marker';
                    this.canvas.appendChild(node);
                    const entry = { marker, node };
                    this.markers.push(entry);
                    return entry;
                }
                removeMarkers() {
                    this.markers.forEach(item => item.node.remove());
                    this.markers = [];
                }
                addPolyline(options) {
                    const line = document.createElement('div');
                    line.className = 'absolute left-6 right-6 top-1/2 h-0.5 bg-slate-300';
                    this.canvas.appendChild(line);
                    this.overlays.push(line);
                    return options;
                }
                addPolygon(options) {
                    return options;
                }
                addCircle(options) {
                    return options;
                }
                clearOverlays() {
                    this.overlays.forEach(node => node.remove());
                    this.overlays = [];
                    this.removeMarkers();
                }
                fitView() {}
                openInfoWindow(content) {
                    const panel = document.createElement('div');
                    panel.className = 'absolute right-3 top-3 max-w-52 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm';
                    panel.innerHTML = typeof content === 'string' ? content : '<div>InfoWindow</div>';
                    this.closeInfoWindow();
                    this.info = panel;
                    this.canvas.appendChild(panel);
                    return panel;
                }
                closeInfoWindow() {
                    this.info?.remove();
                    this.info = null;
                }
                destroy() {
                    this.container.innerHTML = '';
                }
            }
            window.JquanUIComponents.mapApi.registerProvider('docs-mock', DocsMockMapProvider);
            let handle = null;
            addDemoCleanup(() => {
                handle?.destroy?.();
                handle = null;
            });
            const mountMockMap = async () => {
                handle = await window.JquanUIComponents.mapApi.mount({
                    container: '#preview-map-root',
                    provider: 'docs-mock',
                    key: 'docs-mock-key'
                });
                syncState({ action: 'mount()', provider: handle.provider, methods: ['mount()', 'addMarker()', 'openInfoWindow()', 'clearOverlays()'] });
            };
            document.getElementById('preview-map-mount')?.addEventListener('click', async () => {
                await mountMockMap();
            });
            document.getElementById('preview-map-marker')?.addEventListener('click', () => {
                if (!handle) {
                    syncState({ action: 'addMarker()', error: '请先 mount()' });
                    return;
                }
                handle.addMarker({ x: 36, y: 28, label: 'Docs' });
                handle.addMarker({ x: 186, y: 92, label: 'UI' });
                syncState({ action: 'addMarker()', count: 2 });
            });
            document.getElementById('preview-map-info')?.addEventListener('click', () => {
                if (!handle) {
                    syncState({ action: 'openInfoWindow()', error: '请先 mount()' });
                    return;
                }
                handle.openInfoWindow('<div class="font-semibold text-slate-800">组件文档</div><div class="mt-1 text-slate-500">这里演示信息窗和浮层能力。</div>');
                syncState({ action: 'openInfoWindow()' });
            });
            document.getElementById('preview-map-clear')?.addEventListener('click', () => {
                if (!handle) {
                    syncState({ action: 'clearOverlays()', error: '请先 mount()' });
                    return;
                }
                handle.clearOverlays();
                handle.closeInfoWindow();
                syncState({ action: 'clearOverlays()' });
            });
            syncState({
                action: 'ready',
                methods: ['mount()', 'addMarker()', 'openInfoWindow()', 'clearOverlays()'],
                note: '使用 docs-mock provider 离线展示 API 能力'
            });
            mountMockMap().catch(() => {});
            return;
        }

        if (id === 'dom') {
            const target = document.getElementById('preview-dom-target');
            const syncDomState = payload => renderPreviewCode('preview-dom-output', payload);
            const D = window.JquanDOM;
            let mutationObserver = null;
            let resizeObserver = null;
            let eventCount = 0;
            let mutationCount = 0;
            let resizeCount = 0;

            const getCard = () => target?.querySelector('[data-dom-card]');
            const getForm = () => target?.querySelector('[data-dom-form]');
            const getLog = () => target?.querySelector('[data-dom-log]');
            const writeLog = message => {
                const log = getLog();
                if (!log) return;
                D.text(log, message);
            };
            const ensureDemo = () => {
                if (getCard()) return true;
                syncDomState({ action: 'guard', error: '请先点击 build UI' });
                return false;
            };
            const resetObservers = () => {
                mutationObserver?.disconnect?.();
                resizeObserver?.disconnect?.();
                mutationObserver = null;
                resizeObserver = null;
            };
            const buildDemo = () => {
                resetObservers();
                eventCount = 0;
                mutationCount = 0;
                resizeCount = 0;
                D.empty('#preview-dom-target');

                const header = D.build(`
                    <div data-dom-card class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div class="text-sm font-semibold text-slate-800">DOM 工具集实验区</div>
                                <div class="mt-1 text-xs text-slate-500">使用 create/build/append/attr/data/on/trigger/serializeForm 等 API 动态装配。</div>
                            </div>
                            <div data-dom-badges class="flex flex-wrap gap-2"></div>
                        </div>
                        <form data-dom-form class="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
                            <input name="keyword" value="dom toolkit" class="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700" />
                            <select name="view" class="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700">
                                <option value="overview">overview</option>
                                <option value="apis">apis</option>
                            </select>
                        </form>
                        <div data-dom-stack class="grid gap-2"></div>
                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600" data-dom-log>等待动作</div>
                    </div>
                `);
                const badges = D.query('[data-dom-badges]', header);
                ['query', 'events', 'observe', 'form'].forEach(name => {
                    D.append(badges, D.create('span', {
                        className: 'inline-flex h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700',
                        text: name
                    }));
                });
                const stack = D.query('[data-dom-stack]', header);
                D.append(stack, [
                    D.create('div', {
                        className: 'rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700',
                        attrs: { 'data-dom-item': 'summary' },
                        text: 'Summary block'
                    }),
                    D.create('div', {
                        className: 'rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500',
                        attrs: { 'data-dom-item': 'detail' },
                        text: 'Detail block'
                    })
                ]);
                D.append(target, header);

                const form = getForm();
                const card = getCard();
                const summary = D.query('[data-dom-item="summary"]', card);
                D.on(form, 'input change', () => {
                    const values = D.serializeForm(form);
                    D.text(summary, `keyword=${values.keyword}, view=${values.view}`);
                });
                D.trigger(form, 'input', { source: 'build' });
                writeLog('已生成演示结构');
                syncDomState({
                    action: 'build UI',
                    methods: ['create()', 'build()', 'append()', 'query()', 'serializeForm()', 'on()'],
                    targets: D.queryAll('[data-dom-item]', card).length
                });
            };

            document.getElementById('preview-dom-build')?.addEventListener('click', buildDemo);
            document.getElementById('preview-dom-query')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const card = getCard();
                const items = D.queryAll('[data-dom-item]', card);
                const second = items[1];
                syncDomState({
                    action: 'query()/queryAll()/closest()',
                    count: items.length,
                    closest: D.closest(second, '[data-dom-card]')?.getAttribute('data-dom-card') ?? 'card',
                    nextOfFirst: D.next(items[0])?.getAttribute('data-dom-item') || null,
                    prevOfSecond: D.prev(second)?.getAttribute('data-dom-item') || null
                });
            });
            document.getElementById('preview-dom-class')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const card = getCard();
                D.toggleClass(card, 'border-primary bg-primary/5');
                syncDomState({
                    action: 'addClass()/removeClass()/toggleClass()/hasClass()',
                    hasBorderPrimary: D.hasClass(card, 'border-primary'),
                    className: card.className
                });
            });
            document.getElementById('preview-dom-attr')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const card = getCard();
                D.attr(card, 'data-mode', 'interactive');
                D.data(card, 'owner', 'JquanDOM');
                D.css(card, { boxShadow: '0 10px 30px rgba(15,23,42,.08)' });
                syncDomState({
                    action: 'attr()/data()/css()',
                    mode: D.attr(card, 'data-mode'),
                    owner: D.data(card, 'owner'),
                    boxShadow: D.css(card, 'boxShadow')
                });
            });
            document.getElementById('preview-dom-content')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const detail = D.query('[data-dom-item="detail"]', getCard());
                D.html(detail, '<strong class="text-slate-800">html()</strong> 已更新内容');
                const summary = D.query('[data-dom-item="summary"]', getCard());
                D.text(summary, 'text() 已更新标题区域');
                syncDomState({
                    action: 'html()/text()',
                    detailHtml: D.html(detail),
                    summaryText: D.text(summary)
                });
            });
            document.getElementById('preview-dom-append')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const stack = D.query('[data-dom-stack]', getCard());
                D.prepend(stack, D.create('div', {
                    className: 'rounded-xl border border-slate-200 bg-amber-50 p-3 text-sm text-amber-700',
                    attrs: { 'data-dom-item': `prepend-${Date.now()}` },
                    text: 'prepend() inserted'
                }));
                D.append(stack, D.create('div', {
                    className: 'rounded-xl border border-slate-200 bg-emerald-50 p-3 text-sm text-emerald-700',
                    attrs: { 'data-dom-item': `append-${Date.now()}` },
                    text: 'append() inserted'
                }));
                syncDomState({
                    action: 'append()/prepend()/children()',
                    children: D.children(stack).map(node => node.getAttribute('data-dom-item'))
                });
            });
            document.getElementById('preview-dom-toggle')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const form = getForm();
                D.toggle(form);
                syncDomState({
                    action: 'show()/hide()/toggle()',
                    visible: getComputedStyle(form).display !== 'none'
                });
            });
            document.getElementById('preview-dom-form')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const values = D.serializeForm(getForm());
                syncDomState({
                    action: 'serializeForm()/val()',
                    values
                });
            });
            document.getElementById('preview-dom-event')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                const card = getCard();
                if (!card.dataset.eventBound) {
                    D.on(card, 'jquan:dom:ping', () => {
                        eventCount += 1;
                        writeLog(`trigger() -> event count ${eventCount}`);
                    });
                    card.dataset.eventBound = 'true';
                }
                D.trigger(card, 'jquan:dom:ping', { from: 'preview' });
                syncDomState({
                    action: 'on()/trigger()',
                    eventCount
                });
            });
            document.getElementById('preview-dom-observe')?.addEventListener('click', () => {
                if (!ensureDemo()) return;
                resetObservers();
                const card = getCard();
                mutationObserver = D.observeMutation(card, mutations => {
                    mutationCount += mutations.length;
                    writeLog(`observeMutation() -> ${mutationCount}`);
                }, { childList: true, subtree: true });
                resizeObserver = D.observeResize(card, entries => {
                    resizeCount += entries.length;
                });
                const stack = D.query('[data-dom-stack]', card);
                D.append(stack, D.create('div', {
                    className: 'rounded-xl border border-slate-200 bg-sky-50 p-3 text-sm text-sky-700',
                    attrs: { 'data-dom-item': `observe-${Date.now()}` },
                    text: 'observer appended'
                }));
                syncDomState({
                    action: 'observeMutation()/observeResize()',
                    mutationObserver: !!mutationObserver,
                    resizeObserver: !!resizeObserver
                });
            });
            document.getElementById('preview-dom-reset')?.addEventListener('click', () => {
                resetObservers();
                D.empty(target);
                syncDomState({
                    action: 'empty()/remove()',
                    childCount: target.children.length
                });
            });
            syncDomState({
                action: 'ready',
                methods: [
                    'query()',
                    'queryAll()',
                    'create()',
                    'build()',
                    'append()',
                    'prepend()',
                    'html()',
                    'text()',
                    'attr()',
                    'data()',
                    'css()',
                    'toggleClass()',
                    'serializeForm()',
                    'trigger()',
                    'observeMutation()',
                    'observeResize()'
                ]
            });
            return;
        }

        switch (id) {
            case 'uiPreset':
                document.getElementById('preset-panel').textContent = window.JquanUIComponents.uiPreset.classes.panel;
                document.getElementById('preset-control').textContent = window.JquanUIComponents.uiPreset.classes.control;
                document.getElementById('preset-action').textContent = window.JquanUIComponents.uiPreset.classes.action;
                break;
            case 'overlayPreset':
                document.getElementById('overlay-backdrop').textContent = window.JquanUIComponents.overlayPreset.classes.backdrop;
                document.getElementById('overlay-surface').textContent = window.JquanUIComponents.overlayPreset.classes.surface;
                document.getElementById('overlay-tone').textContent = window.JquanUIComponents.overlayPreset.tones.success;
                break;
            default:
                break;
        }
    }

    function bindSearch() {
        const input = document.getElementById('component-search');
        input?.addEventListener('input', event => {
            state.keyword = event.target.value;
            const visible = getFilteredDocs();
            if (!visible.some(item => item.id === state.activeId) && visible[0]) {
                state.activeId = visible[0].id;
            }
            renderSidebar();
            renderDoc();
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await loadComponentDocs();
            ensurePlugins();
            bindSearch();
            renderSidebar();
            renderDoc();
        } catch (error) {
            console.error('[JquanUI Docs] Failed to load component documentation.', error);
            const mount = document.getElementById('component-app');
            if (mount) mount.innerHTML = '<div class="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">组件文档目录加载失败，请通过本地服务重新打开。</div>';
        }
    });
})();
