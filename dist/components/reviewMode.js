(function (global) {
    const registry = global.JquanUIComponents || (global.JquanUIComponents = {});
    const doc = global.document;
    let enabled = false, root = null, active = false, picking = true;
    let selected = null, host = null, panel = null, outline = null, status = null, pickButton = null, toolbar = null;
    let observer = null, frame = null, restoreFocus = null, triggerCleanup = null;
    let activeCleanups = [];
    let records = new Map(), history = [], cursor = 0, generation = 0, startedAt = null;
    let undoButton = null, redoButton = null, copyButton = null;
    let editorView = 'edit', utilityQuery = '', manualPlan = null, copySequence = 0;
    const expandedGroups = new Set(['typography']);
    const groups = { typography: '文字与排版', layout: '布局与排列', sizing: '宽度与高度', spacing: '间距', appearance: '颜色与质感', media: '图片与溢出' };
    const spec = (label, group, values, labels, properties) => ({ label, group, values: values.split(' '), labels: labels ? labels.split('|') : [], properties });
    const fields = {
        'font-size': spec('字号', 'typography', 'text-xs text-sm text-md text-lg text-xl text-2xl text-3xl text-4xl text-5xl text-6xl', '很小|小|标准|稍大|大|较大|标题|大标题|展示|大展示'),
        'font-family': spec('字体', 'typography', 'font-sans font-serif font-mono', '无衬线|衬线|等宽'),
        color: spec('文字颜色', 'typography', 'text-slate-900 text-slate-600 text-slate-400 text-white text-blue-600 text-indigo-600 text-emerald-600 text-amber-600 text-rose-500', '深色|灰色|浅灰|白色|蓝色|靛蓝|翠绿|琥珀|玫瑰'),
        'font-weight': spec('字重', 'typography', 'font-light font-normal font-medium font-semibold font-bold font-extrabold', '细体|常规|中等|半粗|粗体|特粗'),
        'text-align': spec('文字对齐', 'typography', 'text-left text-center text-right text-justify', '靠左|居中|靠右|两端对齐'),
        'line-height': spec('行高', 'typography', 'leading-none leading-tight leading-snug leading-normal leading-relaxed leading-loose', '紧贴|紧凑|稍紧|标准|舒适|宽松'),
        'letter-spacing': spec('字间距', 'typography', 'tracking-tighter tracking-tight tracking-normal tracking-wide tracking-wider tracking-widest', '很紧|紧凑|标准|舒展|宽|很宽'),
        'font-style': spec('字体样式', 'typography', 'not-italic italic', '常规|斜体'),
        'text-transform': spec('字母大小写', 'typography', 'normal-case uppercase lowercase capitalize', '保持原样|大写|小写|首字母大写'),
        'text-decoration-line': spec('文字装饰', 'typography', 'no-underline underline overline line-through', '无装饰|下划线|上划线|删除线'),
        'white-space': spec('空白与换行', 'typography', 'whitespace-normal whitespace-nowrap whitespace-pre whitespace-pre-line whitespace-pre-wrap whitespace-break-spaces', '正常换行|保持单行|保留空白不换行|保留换行|保留空白并换行|保留全部空白'),
        display: spec('布局方式', 'layout', 'block inline-block flex inline-flex grid inline-grid hidden', '块级|行内块|弹性布局|行内弹性|网格|行内网格|隐藏'),
        'flex-direction': spec('排列方向', 'layout', 'flex-row flex-col flex-row-reverse flex-col-reverse', '横向|纵向|横向反转|纵向反转'),
        'flex-wrap': spec('换行', 'layout', 'flex-nowrap flex-wrap flex-wrap-reverse', '不换行|自动换行|反向换行'),
        'align-items': spec('交叉轴对齐', 'layout', 'items-start items-center items-end items-stretch items-baseline', '起点|居中|终点|拉伸|文字基线'),
        'justify-content': spec('主轴对齐', 'layout', 'justify-start justify-center justify-end justify-between justify-around justify-evenly', '起点|居中|终点|两端分布|环绕分布|均匀分布'),
        'grid-template-columns': spec('网格列数', 'layout', 'grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6 grid-cols-none', '一列|两列|三列|四列|五列|六列|不设定'),
        width: spec('宽度', 'sizing', 'w-auto w-full w-1/2 w-1/3 w-2/3 w-1/4 w-3/4 w-fit w-24 w-48 w-64', '自适应|撑满|二分之一|三分之一|三分之二|四分之一|四分之三|适合内容|96 px|192 px|256 px'),
        height: spec('高度', 'sizing', 'h-auto h-full h-fit h-12 h-24 h-32 h-48 h-64', '自适应|撑满|适合内容|48 px|96 px|128 px|192 px|256 px'),
        'min-width': spec('最小宽度', 'sizing', 'min-w-0 min-w-full min-w-min min-w-max min-w-fit', '零|撑满|最小内容|最大内容|适合内容'),
        'max-width': spec('最大宽度', 'sizing', 'max-w-none max-w-xs max-w-sm max-w-md max-w-lg max-w-xl max-w-2xl max-w-full', '不限制|很窄|窄|适中|宽|很宽|更宽|容器宽度'),
        'min-height': spec('最小高度', 'sizing', 'min-h-0 min-h-full min-h-screen min-h-fit', '零|撑满|一屏|适合内容'),
        'max-height': spec('最大高度', 'sizing', 'max-h-none max-h-48 max-h-64 max-h-full max-h-screen', '不限制|192 px|256 px|容器高度|一屏'),
        padding: spec('整体内边距', 'spacing', 'p-0 p-1 p-2 p-3 p-4 p-6 p-8 p-12 p-16', '无|很小|小|稍小|标准|舒适|宽松|很宽|大留白', /^padding(?:-|$)/),
        margin: spec('整体外边距', 'spacing', 'm-0 m-1 m-2 m-3 m-4 m-6 m-8 m-12 m-auto', '无|很小|小|稍小|标准|舒适|宽松|很宽|自动', /^margin(?:-|$)/),
        gap: spec('子项间距', 'spacing', 'gap-0 gap-1 gap-2 gap-3 gap-4 gap-6 gap-8 gap-12', '无|很小|小|稍小|标准|舒适|宽松|很宽', /^(?:gap|row-gap|column-gap)$/),
        'background-color': spec('背景颜色', 'appearance', 'bg-transparent bg-white bg-slate-50 bg-slate-100 bg-slate-900 bg-blue-600 bg-indigo-600 bg-emerald-600 bg-amber-100 bg-rose-100', '透明|白色|雾白|浅灰|深色|蓝色|靛蓝|翠绿|浅琥珀|浅玫瑰'),
        'border-color': spec('边框颜色', 'appearance', 'border-transparent border-slate-200 border-slate-300 border-slate-900 border-white border-blue-500 border-indigo-500', '透明|浅灰|灰色|深色|白色|蓝色|靛蓝', /^border(?:-(?:top|right|bottom|left|inline(?:-start|-end)?|block(?:-start|-end)?))?-color$/),
        'border-width': spec('整体边框宽度', 'appearance', 'border-0 border border-2 border-4 border-8', '无边框|细线|标准|粗线|很粗', /^border(?:-(?:top|right|bottom|left|inline(?:-start|-end)?|block(?:-start|-end)?))?-width$/),
        'border-radius': spec('整体圆角', 'appearance', 'rounded-none rounded-sm rounded-md rounded-lg rounded-xl rounded-2xl rounded-3xl rounded-full', '直角|小|中|大|很大|圆润|很圆润|胶囊', /^border-(?:radius|(?:top|bottom)-(?:left|right)-radius|(?:start|end)-(?:start|end)-radius)$/),
        'box-shadow': spec('阴影', 'appearance', 'shadow-none shadow-sm shadow-md shadow-lg shadow-xl shadow-2xl shadow-inner', '无|轻微|柔和|浮起|明显|强烈|内阴影'),
        opacity: spec('不透明度', 'appearance', 'opacity-0 opacity-25 opacity-50 opacity-75 opacity-90 opacity-100', '透明|25%|50%|75%|90%|不透明'),
        overflow: spec('内容溢出', 'media', 'overflow-visible overflow-hidden overflow-auto overflow-scroll overflow-clip', '显示|隐藏|按需滚动|始终滚动|裁切', /^overflow(?:-[xy])?$/),
        'object-fit': spec('图片适配', 'media', 'object-cover object-contain object-fill object-none object-scale-down', '裁切铺满|完整显示|拉伸|原尺寸|缩小适应'),
        'aspect-ratio': spec('宽高比例', 'media', 'aspect-auto aspect-square aspect-video', '自动|正方形|宽屏 16:9')
    };
    const attributes = { title: '提示文字', 'aria-label': '无障碍名称', 'aria-description': '无障碍说明', alt: '图片说明', href: '链接地址' };
    const carouselOptions = { autoplay: '自动播放', interval: '切换间隔（毫秒）', indicators: '圆点指示器', progress: '播放进度条' };
    const tabsOptions = { autoplay: '自动播放', interval: '切换间隔（毫秒）', loop: '首尾循环' };
    const selectOptions = { disabled: '禁用控件', searchable: '允许搜索', clearable: '允许清空' };
    const popoverOptions = { open: '打开浮层' };
    let writingComponent = false, applyingPlan = false;
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const clone = value => Array.isArray(value) ? value.slice() : value;

    function resolve(target) {
        if (target instanceof HTMLElement && target.ownerDocument === doc) return target;
        if (typeof target === 'string') {
            try { return doc.querySelector(target); } catch (_) { return null; }
        }
        return null;
    }

    function owns(node) { return !!(host && node instanceof Node && host.contains(node)); }
    function eligible(node) {
        return node instanceof HTMLElement && node.isConnected && node.getRootNode() === doc && root && root.isConnected &&
            (node === root || root.contains(node)) && !owns(node) &&
            !node.closest('[data-jq-review-open]') && !['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE'].includes(node.tagName);
    }

    function navigationTarget(direction, current = selected) {
        if (!eligible(current)) return null;
        if (direction === 'parent') return eligible(current.parentElement) ? current.parentElement : null;
        if (direction === 'first-child') return Array.from(current.children).find(eligible) || null;
        if (direction !== 'previous-sibling' && direction !== 'next-sibling') return null;
        const relation = direction === 'previous-sibling' ? 'previousElementSibling' : 'nextElementSibling';
        // Never navigate beyond root.
        if (current === root) return null;
        for (let node = current[relation]; node; node = node[relation]) if (eligible(node)) return node;
        return null;
    }

    function navigation(current) {
        return Object.fromEntries(['parent', 'first-child', 'previous-sibling', 'next-sibling'].map(direction => [direction, !!navigationTarget(direction, current)]));
    }

    function navigate(direction) {
        if (!active) return false;
        const node = navigationTarget(direction);
        if (!node || !selectNode(node)) return false;
        visualTarget(node).scrollIntoView({ block: 'nearest', inline: 'nearest' });
        scheduleGeometry();
        return true;
    }

    function locator(node) {
        const unique = selector => doc.querySelectorAll(selector).length === 1;
        const key = node.getAttribute('data-jq-review-key');
        if (key) {
            const selector = `[data-jq-review-key="${CSS.escape(key)}"]`;
            if (unique(selector)) return { selector, stable: true };
        }
        if (node.id) {
            const selector = `#${CSS.escape(node.id)}`;
            if (unique(selector)) return { selector, stable: true };
        }
        const parts = [];
        for (let current = node; current; current = current.parentElement) {
            const siblings = current.parentElement ? Array.from(current.parentElement.children).filter(sibling => sibling.tagName === current.tagName) : [current];
            parts.unshift(`${current.localName}:nth-of-type(${siblings.indexOf(current) + 1})`);
        }
        return { selector: parts.join(' > '), stable: false };
    }

    function utilityField(token) {
        // Classify base utilities by Core declarations.
        let depth = 0;
        for (const char of token) {
            if (char === '[' || char === '(') depth++;
            if (char === ']' || char === ')') depth--;
            if (char === ':' && depth === 0) return null;
        }
        let result;
        try { result = global.JquanUI?.resolve(token); }
        catch (_) { return null; }
        if (!result || typeof result.css !== 'string') return null;
        const style = doc.createElement('span').style;
        style.cssText = result.css.slice(result.css.indexOf('{') + 1, result.css.indexOf('}'));
        const properties = Array.from(style);
        const matching = Object.keys(fields).filter(name => fields[name].properties ? properties.some(property => fields[name].properties.test(property)) : style.getPropertyValue(name));
        // Size owns its compound line-height.
        if (matching.includes('font-size') && matching.every(name => name === 'font-size' || name === 'line-height')) return 'font-size';
        return matching.length === 1 ? matching[0] : null;
    }

    function utilities(query = '') {
        if (typeof query !== 'string') return [];
        const term = query.trim().toLowerCase().slice(0, 120);
        const runtime = global.JquanUI?.runtimeConfig?.() || {};
        const theme = (global.JquanUI?.config || global.JQUAN_CONFIG || {}).theme || {};
        const keys = (value, prefix = '', depth = 0) => depth > 3 || !value || typeof value !== 'object' ? [] : Object.entries(value).flatMap(([name, item]) => {
            const key = prefix + (name === 'DEFAULT' ? '' : name);
            return typeof item === 'object' ? keys(item, `${key}-`, depth + 1) : [key];
        });
        const colorKeys = Array.from(new Set([...keys(theme.extend?.colors), ...keys(theme.colors), ...Object.keys(theme.semantic || {}), ...Object.keys(runtime.colors || {})])).filter(key => /^[a-z][a-z0-9-]*$/i.test(key)).slice(0, 64);
        const spacingKeys = Array.from(new Set([...Object.keys(theme.extend?.spacing || {}), ...Object.keys(runtime.spacing || {})])).filter(key => /^[a-z0-9][a-z0-9.-]*$/i.test(key)).slice(0, 32);
        // Core resolves token values.
        // Extend first; 64 distinct tokens per field.
        const tokens = (source, prefix, label, defaultToken = false) => Object.keys(source || {})
            .filter(key => /^[a-z0-9][a-z0-9.-]*$/i.test(key))
            .map(key => ({ token: defaultToken && key === 'DEFAULT' ? prefix : `${prefix}-${key}`, label: `${label} · ${key}` }));
        const configured = {
            'font-family': [
                ...tokens(theme.extend?.fontFamily, 'font', '主题字体'),
                ...tokens(theme.fontFamily, 'font', '主题字体')
            ],
            'font-size': [
                ...tokens(theme.extend?.fontSize, 'text', '主题字号'),
                ...tokens(theme.extend?.fluid?.fontSize, 'text-fluid', '流体字号'),
                ...tokens(theme.fluid?.fontSize, 'text-fluid', '流体字号'),
                ...tokens(theme.fontSize, 'text', '主题字号')
            ],
            'border-radius': [
                ...tokens(theme.extend?.borderRadius, 'rounded', '主题圆角', true),
                ...tokens(theme.extend?.radius, 'rounded', '主题圆角', true),
                ...tokens(theme.borderRadius, 'rounded', '主题圆角', true),
                ...tokens(theme.radius, 'rounded', '主题圆角', true)
            ],
            'box-shadow': [
                ...tokens(theme.extend?.boxShadow, 'shadow', '主题阴影', true),
                ...tokens(theme.boxShadow, 'shadow', '主题阴影', true)
            ]
        };
        return Object.entries(fields).map(([field, value]) => {
            const options = value.values.map((token, index) => ({ token, label: value.labels[index] || token }));
            const prefix = { color: 'text', 'background-color': 'bg', 'border-color': 'border', padding: 'p', margin: 'm', gap: 'gap' }[field];
            if (prefix) {
                const keys = ['padding', 'margin', 'gap'].includes(field) ? spacingKeys : colorKeys;
                keys.forEach(key => options.push({ token: `${prefix}-${key}`, label: `${keys === spacingKeys ? '间距' : '主题'} · ${key}` }));
            }
            const configuredSeen = new Set();
            options.push(...(configured[field] || []).filter(option => !configuredSeen.has(option.token) && configuredSeen.add(option.token)).slice(0, 64));
            const seen = new Set();
            return { field, label: value.label, group: value.group, options: options.filter(option => !seen.has(option.token) && utilityField(option.token) === field && seen.add(option.token)) };
        }).map(item => {
            if (!term || `${item.field} ${item.label} ${item.group} ${groups[item.group]}`.toLowerCase().includes(term)) return item;
            return Object.assign(item, { options: item.options.filter(option => `${option.token} ${option.label}`.toLowerCase().includes(term)) });
        }).filter(item => item.options.length);
    }

    function utilityTokens(node, property) {
        return Array.from(node.classList).filter(token => utilityField(token) === property);
    }

    function readField(record) {
        const node = record.node;
        if (record.kind === 'component') return record.handle.element() === node ? record.handle.state()?.[record.option] : undefined;
        if (record.kind === 'utility') return utilityTokens(node, record.name);
        if (record.kind === 'attribute') return node.getAttribute(record.name);
        const child = node.childNodes[record.index];
        if (child && child === record.ref) return child.data;
        if (!child && (!record.ref || !record.ref.parentNode)) return null;
        return undefined;
    }

    function writeField(record, value) {
        const node = record.node;
        if (record.kind === 'component') {
            if (record.handle.element() !== node) return false;
            writingComponent = true;
            try {
                if (record.component === 'select') {
                    const setter = { disabled: 'setDisabled', searchable: 'setSearchable', clearable: 'setClearable' }[record.option];
                    if (!setter || typeof record.handle[setter] !== 'function') return false;
                    record.handle[setter](value);
                } else if (record.component === 'popover') record.handle.setOpen(value);
                else if (record.component === 'tabs' && record.option === 'loop') record.handle.setLoop(value);
                else if (record.component === 'carousel' && record.option === 'indicators') record.handle.setIndicators(value);
                else if (record.component === 'carousel' && record.option === 'progress') record.handle.setProgress(value);
                else if (record.option === 'interval') record.handle.setInterval(value);
                else record.handle.setAutoplay(value);
                return same(readField(record), value);
            } catch (_) { return false; }
            finally { writingComponent = false; }
        } else if (record.kind === 'utility') {
            const tokens = Array.from(node.classList), current = new Set(utilityTokens(node, record.name));
            const first = tokens.findIndex(token => current.has(token));
            const rest = tokens.filter(token => !current.has(token));
            rest.splice(first < 0 ? rest.length : first, 0, ...value);
            if (rest.length || record.hadClass) node.setAttribute('class', rest.join(' '));
            else node.removeAttribute('class');
            if (value.length) global.JquanUI.compile(value);
        } else if (record.kind === 'attribute') {
            if (value === null) node.removeAttribute(record.name);
            else node.setAttribute(record.name, value);
        } else if (value === null) {
            record.ref?.remove();
        } else {
            if (!record.ref) record.ref = doc.createTextNode('');
            record.ref.data = value;
            if (record.ref.parentNode !== node) node.insertBefore(record.ref, node.childNodes[record.index] || null);
        }
        return true;
    }

    function carouselHandle(node) {
        const api = registry.carouselApi;
        const handle = eligible(node) && api?.getHandle?.(node);
        // Do not redirect child edits to ancestors.
        return handle && handle.element() === node ? handle : null;
    }

    function tabsHandle(node) {
        const api = registry.tabsApi;
        const handle = eligible(node) && api?.getHandle?.(node);
        return handle && handle.element() === node ? handle : null;
    }

    function selectHandle(node) {
        const api = registry.selectApi;
        const handle = eligible(node) && api?.get?.(node);
        return handle && handle.element?.() === node ? handle : null;
    }

    function popoverHandle(node) {
        const api = registry.popoverApi;
        const handle = eligible(node) && api?.getHandle?.(node);
        if (!handle || handle.element() !== node) return null;
        return {
            element: () => handle.element(),
            state: () => handle.element() === node ? { open: api.getState(handle) } : null,
            setOpen(value) { return (value ? api.open(handle) : api.close(handle)) || (handle.element() === node && api.getState(handle) === value); }
        };
    }

    function selectionTarget(node) {
        if (!eligible(node)) return null;
        const handle = registry.selectApi?.get?.(node);
        const source = handle?.element?.(), control = handle?.control?.();
        return control?.contains(node) && eligible(control) && eligible(source) ? source : node;
    }

    function visualTarget(node) {
        const control = selectHandle(node)?.control?.();
        return eligible(control) ? control : node;
    }

    function componentOptions() {
        const handle = carouselHandle(selected), snapshot = handle?.state();
        if (!snapshot) {
            const tabs = tabsHandle(selected), state = tabs?.state();
            if (!state) {
                const select = selectHandle(selected), state = select?.state();
                if (!state) {
                    const popover = popoverHandle(selected), popoverState = popover?.state();
                    return popoverState ? [{ component: 'popover', option: 'open', label: popoverOptions.open, type: 'boolean', value: popoverState.open }] : [];
                }
                return Object.keys(selectOptions).map(option => ({ component: 'select', option, label: selectOptions[option], type: 'boolean', value: !!state[option] }));
            }
            return [
                { component: 'tabs', option: 'autoplay', label: tabsOptions.autoplay, type: 'boolean', value: state.autoplay },
                { component: 'tabs', option: 'interval', label: tabsOptions.interval, type: 'number', value: state.interval, min: 1200 },
                ...(typeof tabs.setLoop === 'function' && typeof state.loop === 'boolean' ? [{ component: 'tabs', option: 'loop', label: tabsOptions.loop, type: 'boolean', value: state.loop }] : [])
            ];
        }
        return [
            { component: 'carousel', option: 'autoplay', label: carouselOptions.autoplay, type: 'boolean', value: snapshot.autoplay },
            { component: 'carousel', option: 'interval', label: carouselOptions.interval, type: 'number', value: snapshot.interval, min: 1200 },
            ...(typeof handle.setIndicators === 'function' ? [{ component: 'carousel', option: 'indicators', label: carouselOptions.indicators, type: 'boolean', value: !!snapshot.indicators }] : []),
            ...(typeof handle.setProgress === 'function' ? [{ component: 'carousel', option: 'progress', label: carouselOptions.progress, type: 'boolean', value: !!snapshot.progress }] : [])
        ];
    }

    function setComponentOption(component, option, value) {
        if (applyingPlan || !active || !['carousel', 'tabs', 'select', 'popover'].includes(component) || !Object.hasOwn(component === 'tabs' ? tabsOptions : component === 'select' ? selectOptions : component === 'popover' ? popoverOptions : carouselOptions, option)) return false;
        const booleanOption = option !== 'interval';
        if (booleanOption ? typeof value !== 'boolean' : typeof value !== 'number' || !Number.isFinite(value) || value < 1200) return false;
        const handle = component === 'tabs' ? tabsHandle(selected) : component === 'select' ? selectHandle(selected) : component === 'popover' ? popoverHandle(selected) : carouselHandle(selected);
        if (!handle || (component === 'tabs' && option === 'loop' && (typeof handle.setLoop !== 'function' || typeof handle.state()?.loop !== 'boolean'))) return false;
        return commit(newRecord('component', `${component}.${option}`, { handle, option, component }), value);
    }

    function newRecord(kind, name, extra) {
        const key = `${kind}:${name}`;
        let byField = records.get(selected);
        if (byField?.has(key)) return byField.get(key);
        const record = Object.assign({ node: selected, kind, name, field: key, target: locator(selected), label: describe(selected).label, hadClass: selected.hasAttribute('class') }, extra || {});
        record.before = clone(readField(record));
        record.value = clone(record.before);
        if (!byField) { byField = new Map(); records.set(selected, byField); }
        byField.set(key, record);
        return record;
    }

    function allRecords() { return Array.from(records.values()).flatMap(byField => Array.from(byField.values())); }
    function changedRecords() { return allRecords().filter(record => !same(record.before, record.value)); }

    function changes() {
        return changedRecords().map(record => ({
            target: eligible(record.node) ? locator(record.node) : Object.assign({}, record.target),
            label: record.label, tag: record.node.localName, field: record.field,
            before: clone(record.before), after: clone(record.value),
            status: !eligible(record.node) ? 'detached' : same(readField(record), record.value) ? 'ready' : 'conflict'
        }));
    }

    function refresh(message, preserveDraft = false) {
        if (!active) return;
        renderSelection(preserveDraft); scheduleGeometry();
        undoButton.disabled = cursor === 0;
        redoButton.disabled = cursor === history.length;
        copyButton.disabled = changedRecords().length === 0;
        copyButton.textContent = `复制修改方案（${changedRecords().length}）`;
        if (message) status.textContent = message;
    }

    function commit(record, value) {
        if (writingComponent) return false;
        if (!same(readField(record), record.value)) { refresh('该字段已被页面更新，请核对冲突后再修改'); return false; }
        if (same(record.value, value)) return true;
        const previous = clone(record.value);
        const revision = generation;
        if (!writeField(record, value)) { refresh('组件配置未应用，请核对实例或页面更新'); return false; }
        if (!active || generation !== revision || records.get(record.node)?.get(record.field) !== record) {
            if (records.get(record.node)?.get(record.field) === record && same(readField(record), value)) writeField(record, previous);
            return false;
        }
        record.value = clone(value);
        history.splice(cursor);
        history.push({ record, before: previous, after: clone(value) });
        cursor++;
        generation++;
        refresh('已预览修改，可撤销或复制方案');
        return true;
    }

    function setUtility(property, token) {
        if (applyingPlan || !active || !eligible(selected) || !Object.hasOwn(fields, property)) return false;
        if (token !== null && (typeof token !== 'string' || !/^-?[a-z][a-z0-9.-]*(?:\/[a-z0-9.-]+)?$/i.test(token) || utilityField(token) !== property)) return false;
        return commit(newRecord('utility', property), token === null ? [] : [token]);
    }

    function setText(value, index) {
        if (applyingPlan || !active || !eligible(selected) || typeof value !== 'string' || ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'IFRAME', 'IMG', 'BR', 'HR', 'VIDEO', 'AUDIO'].includes(selected.tagName)) return false;
        const direct = Array.from(selected.childNodes).map((node, childIndex) => ({ node, index: childIndex })).filter(item => item.node.nodeType === Node.TEXT_NODE);
        if (index === undefined) {
            if (direct.length > 1 || (!direct.length && selected.childNodes.length)) return false;
            index = direct.length ? direct[0].index : 0;
        }
        if (!Number.isInteger(index) || index < 0) return false;
        const child = selected.childNodes[index];
        if (child ? child.nodeType !== Node.TEXT_NODE : selected.childNodes.length !== 0 || index !== 0) return false;
        if (!child && value === '') return true;
        const record = newRecord('text', String(index), { index, ref: child || null });
        return commit(record, value === '' && record.before === null ? null : value);
    }

    function canAttribute(node, name) {
        return Object.hasOwn(attributes, name) && (name !== 'href' || ['A', 'AREA'].includes(node.tagName)) && (name !== 'alt' || ['IMG', 'AREA'].includes(node.tagName));
    }

    function editAttribute(name, value) {
        if (applyingPlan || !active || !eligible(selected) || !canAttribute(selected, name) || (value !== null && typeof value !== 'string')) return false;
        if (name === 'href' && value !== null) {
            try { if (!['http:', 'https:', 'mailto:', 'tel:', 'file:'].includes(new URL(value, doc.baseURI).protocol)) return false; } catch (_) { return false; }
        }
        return commit(newRecord('attribute', name), value);
    }

    function travel(redo) {
        if (applyingPlan || !active || writingComponent || (redo ? cursor >= history.length : cursor === 0)) return false;
        const entry = history[redo ? cursor : cursor - 1], record = entry.record;
        if (!eligible(record.node) || !same(readField(record), record.value)) { refresh('页面已变化，该操作存在冲突'); return false; }
        const value = redo ? entry.after : entry.before;
        const revision = generation;
        if (!writeField(record, value)) { refresh('组件已变化，该操作未完成'); return false; }
        if (!active || generation !== revision || records.get(record.node)?.get(record.field) !== record) return false;
        record.value = clone(value);
        cursor += redo ? 1 : -1;
        generation++;
        refresh(redo ? '已重做' : '已撤销');
        return true;
    }

    function reset() {
        if (applyingPlan || !active || writingComponent) return false;
        const list = changedRecords();
        if (list.some(record => !eligible(record.node) || !same(readField(record), record.value))) { refresh('存在页面更新或已移除元素，请先核对修改方案'); return false; }
        const revision = generation;
        for (const record of list.reverse()) {
            if (!writeField(record, record.before) || !active || generation !== revision) { refresh('组件已变化，请核对修改清单'); return false; }
            record.value = clone(record.before);
        }
        records.clear(); history = []; cursor = 0;
        generation++;
        refresh('已恢复本次审查的原始值');
        return true;
    }

    function revert(target, field) {
        const node = resolve(target), record = records.get(node)?.get(field);
        if (applyingPlan || !active || !eligible(node) || !record || same(record.before, record.value)) return false;
        return commit(record, clone(record.before));
    }

    function fieldLabel(field) {
        if (field.startsWith('component:carousel.')) return `轮播 · ${carouselOptions[field.slice(19)]}`;
        if (field.startsWith('component:tabs.')) return `标签页 · ${tabsOptions[field.slice(15)]}`;
        if (field.startsWith('component:select.')) return `下拉框 · ${selectOptions[field.slice(17)]}`;
        if (field.startsWith('component:popover.')) return `浮层 · ${popoverOptions[field.slice(19)]}`;
        return field.startsWith('utility:') ? fields[field.slice(8)].label : field.startsWith('attribute:') ? attributes[field.slice(10)] : `文字片段 ${Number(field.slice(5)) + 1}`;
    }

    function restoreTracked() {
        changedRecords().reverse().forEach(record => {
            if (eligible(record.node) && same(readField(record), record.value)) writeField(record, record.before);
        });
        records.clear(); history = []; cursor = 0;
    }

    const draftKey = key => {
        if (key === undefined) key = 'default';
        if (typeof key !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(key)) return null;
        return `jquanui-review-draft:${key}`;
    };
    function validDraftPlan(plan) {
        const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
        const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string');
        if (!object(plan) || ![1, 2].includes(plan.schemaVersion) || typeof plan.createdAt !== 'string' ||
            !Number.isFinite(Date.parse(plan.createdAt)) || typeof plan.page !== 'string' || !Array.isArray(plan.changes) || !plan.changes.length) return false;
        return plan.changes.every(change => {
            if (!object(change) || !object(change.target) || typeof change.target.selector !== 'string' || !change.target.selector ||
                typeof change.target.stable !== 'boolean' || typeof change.label !== 'string' || typeof change.tag !== 'string' ||
                !['ready', 'conflict', 'detached'].includes(change.status) || typeof change.field !== 'string') return false;
            const [kind, name] = change.field.split(':');
            if (change.field !== `${kind}:${name}`) return false;
            if (kind === 'utility') return Object.hasOwn(fields, name) && strings(change.before) && strings(change.after);
            if (kind === 'attribute') return Object.hasOwn(attributes, name) && [change.before, change.after].every(value => value === null || typeof value === 'string');
            if (kind === 'text') return /^(?:0|[1-9]\d*)$/.test(name) && Number.isSafeInteger(Number(name)) && [change.before, change.after].every(value => value === null || typeof value === 'string');
            if (kind !== 'component' || plan.schemaVersion !== 2) return false;
            const [component, option] = name.split('.');
            const options = { carousel: carouselOptions, tabs: tabsOptions, select: selectOptions, popover: popoverOptions };
            if (name !== `${component}.${option}` || !Object.hasOwn(options, component) || !Object.hasOwn(options[component], option)) return false;
            return [change.before, change.after].every(value => option === 'interval' ? typeof value === 'number' && Number.isFinite(value) : typeof value === 'boolean');
        });
    }
    function saveDraft(key = 'default') {
        const storageKey = draftKey(key), list = changedRecords();
        if (!enabled || !storageKey || !list.length) return false;
        try {
            const plan = JSON.parse(exportPlan('json'));
            if (!validDraftPlan(plan)) return false;
            const serialized = JSON.stringify({ format: 'jquanui-review-draft', version: 1, savedAt: new Date().toISOString(), plan });
            if (serialized.length > 1048576) return false;
            global.localStorage.setItem(storageKey, serialized);
            return true;
        } catch (_) { return false; }
    }
    function loadDraft(key = 'default') {
        const storageKey = draftKey(key);
        if (!storageKey) return null;
        try {
            const serialized = global.localStorage.getItem(storageKey);
            if (!serialized || serialized.length > 1048576) return null;
            const saved = JSON.parse(serialized);
            if (!saved || saved.format !== 'jquanui-review-draft' || saved.version !== 1 || typeof saved.savedAt !== 'string' ||
                !Number.isFinite(Date.parse(saved.savedAt)) || !validDraftPlan(saved.plan)) return null;
            // JSON.parse returns an independent snapshot.
            return saved.plan;
        } catch (_) { return null; }
    }
    function clearDraft(key = 'default') {
        const storageKey = draftKey(key);
        if (!storageKey) return false;
        try {
            const existed = global.localStorage.getItem(storageKey) !== null;
            global.localStorage.removeItem(storageKey);
            return existed;
        } catch (_) { return false; }
    }

    function applyPlan(input, options = {}) {
        const dryRun = options?.dryRun !== false;
        const result = { ok: false, dryRun, applied: 0, issues: [], changes: [] };
        const issue = (index, change, code, actual) => result.issues.push({
            index, code, field: change?.field || null, selector: change?.target?.selector || null,
            expected: change?.before === undefined ? null : clone(change.before),
            actual: actual === undefined ? null : clone(actual)
        });
        if (!enabled || !root || !root.isConnected) { issue(-1, null, 'not-configured'); return result; }
        if (applyingPlan || writingComponent) { issue(-1, null, 'busy'); return result; }
        if (history.length || changedRecords().length) { issue(-1, null, 'session-not-empty'); return result; }
        if (!dryRun && !active) { issue(-1, null, 'not-active'); return result; }
        let plan;
        try {
            const json = typeof input === 'string' ? input : JSON.stringify(input);
            if (!json || json.length > 1048576) throw new Error('Invalid plan size');
            plan = JSON.parse(json);
        } catch (_) { issue(-1, null, 'invalid-plan'); return result; }
        if (!validDraftPlan(plan)) { issue(-1, null, 'invalid-plan'); return result; }
        const page = (() => { const url = new URL(global.location.href); url.searchParams.delete('jqui-review'); return url.pathname + url.search + url.hash; })();
        if (plan.page !== page) issue(-1, null, 'page-mismatch', page);
        const entries = [], seen = new Set();
        plan.changes.forEach((change, index) => {
            if (!change || !change.target?.stable) { issue(index, change, 'unstable-target'); return; }
            if (change.status !== 'ready') { issue(index, change, 'non-ready-status'); return; }
            if (seen.has(change.field + '\u0000' + change.target.selector)) { issue(index, change, 'duplicate-field'); return; }
            seen.add(change.field + '\u0000' + change.target.selector);
            let matches = [];
            try {
                matches = Array.from(doc.querySelectorAll(change.target.selector));
            } catch (_) { issue(index, change, 'invalid-selector'); return; }
            if (!matches.length) { issue(index, change, 'target-not-found'); return; }
            if (matches.length !== 1) { issue(index, change, 'target-ambiguous'); return; }
            const node = matches[0], parts = change.field.split(':');
            if (!eligible(node)) { issue(index, change, 'target-not-found'); return; }
            const currentLocator = locator(node);
            if (!currentLocator.stable || currentLocator.selector !== change.target.selector || node.localName !== change.tag) { issue(index, change, 'unstable-target'); return; }
            if (same(change.before, change.after)) { issue(index, change, 'invalid-value'); return; }
            let record = null, valid = true;
            if (parts[0] === 'utility') {
                if (change.before.some(token => utilityField(token) !== parts[1]) || change.after.length > 1 || change.after.some(token => !/^-?[a-z][a-z0-9.-]*(?:\/[a-z0-9.-]+)?$/i.test(token) || utilityField(token) !== parts[1])) { issue(index, change, 'invalid-value'); valid = false; }
                else record = { node, kind: 'utility', name: parts[1], hadClass: node.hasAttribute('class') };
            } else if (parts[0] === 'attribute') {
                if (!canAttribute(node, parts[1]) || ![change.before, change.after].every(value => value === null || typeof value === 'string')) { issue(index, change, 'invalid-value'); valid = false; }
                else record = { node, kind: 'attribute', name: parts[1] };
                if (record && parts[1] === 'href' && change.after !== null) {
                    try { if (!['http:', 'https:', 'mailto:', 'tel:', 'file:'].includes(new URL(change.after, doc.baseURI).protocol)) throw new Error('Invalid protocol'); }
                    catch (_) { issue(index, change, 'invalid-value'); valid = false; }
                }
            } else if (parts[0] === 'text') {
                const indexValue = Number(parts[1]), child = node.childNodes[indexValue];
                if (['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'IFRAME', 'IMG', 'BR', 'HR', 'VIDEO', 'AUDIO'].includes(node.tagName) || (child && child.nodeType !== Node.TEXT_NODE) || (!child && (change.before !== null || node.childNodes.length !== 0 || indexValue !== 0)) || (change.after === null && change.before !== null)) { issue(index, change, 'invalid-value'); valid = false; }
                else record = { node, kind: 'text', name: parts[1], index: indexValue, ref: child || null };
            } else if (parts[0] === 'component') {
                if (plan.schemaVersion !== 2) { issue(index, change, 'schema-mismatch'); valid = false; }
                const pair = parts[1]?.split('.'), component = pair?.[0], option = pair?.[1];
                const handle = component === 'carousel' ? carouselHandle(node) : component === 'tabs' ? tabsHandle(node) : component === 'select' ? selectHandle(node) : component === 'popover' ? popoverHandle(node) : null;
                const allowed = component === 'select' ? selectOptions : component === 'tabs' ? tabsOptions : component === 'popover' ? popoverOptions : component === 'carousel' ? carouselOptions : null;
                const valueValid = allowed && Object.hasOwn(allowed, option) && [change.before, change.after].every(value => option === 'interval' ? typeof value === 'number' && Number.isFinite(value) && value >= 1200 : typeof value === 'boolean');
                if (!handle || !valueValid || (component === 'tabs' && option === 'loop' && typeof handle.setLoop !== 'function')) { issue(index, change, 'invalid-component'); valid = false; }
                else record = { node, kind: 'component', name: `${component}.${option}`, field: `component:${component}.${option}`, handle, option, component };
            } else { issue(index, change, 'invalid-field'); valid = false; }
            if (valid && record) {
                const actual = readField(record);
                if (!same(actual, change.before)) issue(index, change, 'before-mismatch', actual);
                else entries.push({ index, change, record });
            }
        });
        entries.forEach(entry => {
            if (entry.record.kind === 'text' && entries.some(other => other !== entry && other.record.node === entry.record.node && other.record.kind === 'text' && (entry.change.after === null || other.change.after === null))) issue(entry.index, entry.change, 'invalid-value');
        });
        if (result.issues.length) return result;
        result.changes = plan.changes.map(change => ({ target: { selector: change.target.selector, stable: change.target.stable }, label: change.label, tag: change.tag, field: change.field, before: clone(change.before), after: clone(change.after), status: 'ready' }));
        if (dryRun) { result.ok = true; return result; }
        const owner = records, initialRoot = root, initialSelection = selected, written = [];
        applyingPlan = true;
        try {
            for (const entry of entries) {
                if (!active || records !== owner || root !== initialRoot || !eligible(entry.record.node) || !same(readField(entry.record), entry.change.before)) { issue(entry.index, entry.change, 'write-failed'); break; }
                selected = entry.record.node;
                const record = newRecord(entry.record.kind, entry.record.name, entry.record);
                const applied = commit(record, entry.change.after);
                if (!applied) { issue(entry.index, entry.change, 'write-failed'); break; }
                written.push({ record, entry });
            }
            // Setters may reenter or replace the session.
            for (const { record, entry } of written) {
                if (records !== owner || !eligible(record.node) || !same(readField(record), entry.change.after)) issue(entry.index, entry.change, 'write-failed');
            }
            if (result.issues.length && records === owner) {
                for (const { record, entry } of written.slice().reverse()) {
                    if (eligible(record.node) && same(readField(record), entry.change.after) && writeField(record, entry.change.before)) record.value = clone(entry.change.before);
                    else issue(entry.index, entry.change, 'rollback-conflict', readField(record));
                }
                if (!changedRecords().length) { records.clear(); history = []; cursor = 0; }
            }
            result.ok = result.issues.length === 0;
            result.applied = result.ok ? written.length : records === owner ? written.filter(({ record }) => !same(readField(record), record.before)).length : 0;
        } finally {
            applyingPlan = false;
            if (root === initialRoot && records === owner) {
                selected = eligible(initialSelection) ? initialSelection : null;
                refresh(result.ok ? '修改方案已应用，可撤销或还原' : '方案应用中止，请核对冲突');
            }
        }
        return result;
    }

    function exportPlan(format = 'text') {
        if (!['text', 'json'].includes(format)) return '';
        const url = new URL(global.location.href); url.searchParams.delete('jqui-review');
        const plan = { schemaVersion: changedRecords().some(record => record.kind === 'component') ? 2 : 1, createdAt: startedAt, page: url.pathname + url.search + url.hash, changes: changes() };
        const json = JSON.stringify(plan, null, 2);
        if (format === 'json') return json;
        const lines = plan.changes.map((change, index) => `${index + 1}. ${change.label} — ${fieldLabel(change.field)}: ${JSON.stringify(change.before)} → ${JSON.stringify(change.after)}${change.status === 'ready' && change.target.stable ? '' : '（需核对定位或页面冲突）'}`);
        return `JquanUI 页面修改方案\n页面：${plan.page}\n按元素定位与原值核对后修改源文件，保留其他内容。\n${lines.length ? lines.join('\n') : '暂无修改'}\n\n\`\`\`json\n${json}\n\`\`\``;
    }

    async function copyPlan(format = 'text') {
        if (!enabled || !['text', 'json'].includes(format) || !changedRecords().length || !registry.copyApi) return false;
        const revision = generation;
        const request = ++copySequence;
        if (manualPlan) { manualPlan = null; if (active) renderSelection(); }
        const text = exportPlan(format);
        let result;
        try { result = await registry.copyApi.copyText(text); } catch (_) { result = { ok: false }; }
        const ok = result?.ok === true;
        if (active && revision === generation && request === copySequence && text === exportPlan(format)) {
            status.textContent = ok ? '修改方案已复制，可交给开发者或 AI' : '自动复制未完成，方案已全选，请手动复制';
            if (!ok) {
                manualPlan = { text, format }; renderManualPlan();
                const output = panel.querySelector('[data-review-plan]'); output.focus({ preventScroll: true }); output.select();
            }
        }
        return ok;
    }

    function describe(node) {
        if (!eligible(node)) return null;
        const style = getComputedStyle(node);
        const walker = doc.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
            acceptNode(textNode) {
                return owns(textNode) || textNode.parentElement?.closest('script, style, template') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        let text = '', child;
        while (text.length < 240 && (child = walker.nextNode())) text = (text + child.textContent).replace(/\s+/g, ' ').trimStart();
        text = text.trim().slice(0, 240);
        const attributes = Array.from(node.attributes, attr => ({ name: attr.name, value: node.type === 'password' && attr.name === 'value' ? '••••' : attr.value }));
        return {
            tag: node.localName,
            label: node.getAttribute('aria-label') || node.getAttribute('alt') || text.slice(0, 60) || node.localName,
            text, target: locator(node), classes: Array.from(node.classList), attributes,
            navigation: navigation(node),
            textNodes: Array.from(node.childNodes).flatMap((child, index) => child.nodeType === Node.TEXT_NODE && (child.data.trim() || !node.children.length) ? [{ index, value: child.data }] : []),
            components: attributes.filter(attr => attr.name.startsWith('jq-') || attr.name.startsWith('data-jq-')).map(attr => attr.name),
            computed: { display: style.display, fontSize: style.fontSize, color: style.color, backgroundColor: style.backgroundColor, padding: style.padding, margin: style.margin, width: style.width, height: style.height }
        };
    }

    function state() {
        return { enabled, active, picking: active && picking, selection: selected ? describe(selected) : null, changeCount: changedRecords().length, canUndo: cursor > 0, canRedo: cursor < history.length };
    }

    function element(tag, classes, text) {
        const node = doc.createElement(tag);
        node.className = classes;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function button(text, action, kind = 'neutral') {
        const styles = kind === 'primary' ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : kind === 'quiet' ? 'border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
        const node = element('button', `inline-flex items-center justify-center px-3 py-2 rounded-xl border text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${styles}`, text);
        node.type = 'button';
        node.addEventListener('click', () => { if (owns(node)) action(); });
        return node;
    }

    function section(title, values) {
        const wrap = element('section', 'mt-4');
        wrap.append(element('h3', 'font-semibold text-slate-900 mb-2', title));
        const list = element('dl', 'grid grid-cols-1 gap-2 text-sm');
        values.forEach(([name, value]) => {
            list.append(element('dt', 'text-slate-500', name), element('dd', 'm-0 break-words whitespace-pre-wrap text-slate-900', value || '（空）'));
        });
        wrap.append(list);
        return wrap;
    }

    function renderEditor(info) {
        const wrap = element('div', 'grid grid-cols-1 gap-3');
        const textNodes = info.textNodes.length ? info.textNodes : selected.childNodes.length ? [] : [{ index: 0, value: '' }];
        const content = element('section', 'p-3 rounded-2xl border border-slate-200 bg-white');
        content.hidden = !!utilityQuery.trim();
        content.append(element('h3', 'mb-3 text-xs font-semibold text-slate-500 tracking-wide', '内容'));
        if (!['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'IFRAME', 'IMG', 'BR', 'HR', 'VIDEO', 'AUDIO'].includes(selected.tagName)) {
            textNodes.forEach((text, index) => {
                const label = element('label', 'block mb-2 text-xs font-medium text-slate-600', textNodes.length > 1 ? `文字片段 ${index + 1}` : '文字内容');
                const input = element('textarea', 'block w-full mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 font-normal focus:ring-2 focus:ring-blue-500');
                input.setAttribute('data-review-edit', `text:${text.index}`);
                input.rows = 2; input.value = text.value; input.defaultValue = input.value;
                label.append(input);
                const apply = button('应用文字', () => setText(input.value, text.index));
                apply.setAttribute('data-review-apply', `text:${text.index}`);
                const actions = element('div', 'flex justify-end mb-1'); actions.append(apply);
                content.append(label, actions);
            });
            if (!textNodes.length) content.append(element('p', 'text-xs text-slate-500', '请点选内部文字元素；编辑保留粗体、链接等结构。'));
            wrap.append(content);
        }
        const searchLabel = element('label', 'block text-xs font-medium text-slate-500', '查找样式或原子类');
        const search = element('input', 'block w-full mt-2 p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-blue-500');
        search.type = 'search'; search.placeholder = '例如：间距、圆角、brand、p-6'; search.value = utilityQuery;
        search.setAttribute('data-review-edit', 'search'); search.setAttribute('maxlength', '120');
        searchLabel.append(search); wrap.prepend(searchLabel);
        const component = componentOptions();
        if (component.length) {
            const card = element('section', 'p-3 rounded-2xl border border-blue-100 bg-blue-50');
            const componentTitle = component[0].component === 'tabs' ? '标签页' : component[0].component === 'select' ? '下拉框' : component[0].component === 'popover' ? '浮层' : '轮播';
            card.append(element('h3', 'mb-3 text-sm font-semibold text-slate-800', `${componentTitle}设置`));
            for (const descriptor of component) {
                const label = element('label', 'block mt-2 text-xs font-medium text-slate-600', descriptor.label);
                const input = element(descriptor.type === 'boolean' ? 'select' : 'input', 'block w-full mt-2 p-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-blue-500');
                input.setAttribute('data-review-edit', `component:${descriptor.component}.${descriptor.option}`);
                if (descriptor.type === 'boolean') {
                    for (const [value, text] of [['true', '开启'], ['false', '关闭']]) { const option = element('option', '', text); option.value = value; input.append(option); }
                    input.value = String(descriptor.value);
                    input.addEventListener('change', () => { if (owns(input)) setComponentOption(descriptor.component, descriptor.option, input.value === 'true'); });
                } else {
                    input.type = 'number'; input.min = String(descriptor.min); input.step = 'any'; input.value = String(descriptor.value); input.defaultValue = input.value;
                }
                label.append(input); card.append(label);
                if (descriptor.type === 'number') card.append(button('应用间隔', () => { if (!setComponentOption(descriptor.component, descriptor.option, input.value === '' ? NaN : Number(input.value)) && status) status.textContent = '间隔需为不小于1200的毫秒数，或请核对组件状态'; }));
            }
            card.append(element('p', 'mt-3 text-xs text-slate-500', component[0].component === 'select' ? '保留原生选项和值；只调整控件行为。' : component[0].component === 'popover' ? '只调整已挂载浮层的开关状态；不重新挂载、不修改面板内容。' : '保留内容。间隔至少1200毫秒；恢复配置不回放播放计时。'));
            wrap.prepend(card);
        }
        const groupHost = element('div', 'grid grid-cols-1 gap-3');
        search.addEventListener('input', () => {
            if (!owns(search)) return;
            utilityQuery = search.value.slice(0, 120); content.hidden = !!utilityQuery.trim(); renderUtilityGroups(groupHost); compileUI(); scheduleGeometry();
        });
        renderUtilityGroups(groupHost); wrap.append(groupHost);
        const attrs = element('details', 'p-3 rounded-2xl border border-slate-200 bg-white');
        attrs.append(element('summary', 'text-sm font-semibold text-slate-700 cursor-pointer', '链接与无障碍'));
        for (const [name, title] of Object.entries(attributes)) {
            if (!canAttribute(selected, name)) continue;
            const label = element('label', 'block mt-2 text-sm', title);
            const input = element('input', 'block w-full mt-1 rounded-lg border border-slate-300 bg-white p-2');
            input.type = 'text'; input.value = selected.getAttribute(name) || ''; input.defaultValue = input.value;
            input.setAttribute('data-review-edit', `attribute:${name}`);
            label.append(input);
            const controls = element('div', 'flex gap-2 mt-1');
            controls.append(button('应用属性', () => { if (!editAttribute(name, input.value)) status.textContent = '属性值未应用，请核对链接地址或页面更新'; }), button('移除属性', () => editAttribute(name, null)));
            attrs.append(label, controls);
        }
        wrap.append(attrs);
        return wrap;
    }

    function renderUtilityGroups(wrap) {
        wrap.replaceChildren();
        const catalog = utilities(utilityQuery);
        if (!catalog.length) {
            wrap.append(element('p', 'p-4 rounded-xl bg-white text-sm text-slate-500', '没有匹配的样式，请换个关键词。'));
            return;
        }
        for (const [group, title] of Object.entries(groups)) {
            if (!catalog.some(item => item.group === group)) continue;
            const details = element('details', 'rounded-2xl border border-slate-200 bg-white');
            details.open = !!utilityQuery.trim() || expandedGroups.has(group);
            details.setAttribute('data-review-group', group);
            const summary = element('summary', 'p-3 text-sm font-semibold text-slate-700 cursor-pointer');
            summary.append(doc.createTextNode(title), element('span', 'ml-2 text-xs font-normal text-slate-400', String(catalog.filter(item => item.group === group).length)));
            details.append(summary);
            const grid = element('div', 'grid grid-cols-2 gap-3 px-3 pb-3');
            if (group === 'spacing') grid.append(element('p', 'col-span-2 text-xs text-slate-500', '整体替换此类间距，包括方向类；撤销可恢复。'));
            for (const descriptor of catalog.filter(item => item.group === group)) {
                const property = descriptor.field;
                const label = element('label', 'block min-w-0 text-xs font-medium text-slate-500', descriptor.label);
                const input = element('select', 'block w-full mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm font-normal text-slate-900 focus:ring-2 focus:ring-blue-500');
                input.setAttribute('data-review-edit', `utility:${property}`);
                const current = utilityTokens(selected, property);
                const option = (value, text) => { const node = element('option', '', text); node.value = value; input.append(node); };
                option('', '默认');
                descriptor.options.forEach(item => option(item.token, item.label));
                for (const token of current) if (!descriptor.options.some(item => item.token === token)) option(token, `当前 · ${token}`);
                if (current.length > 1) { option('__mixed__', '多个方向 / 同字段类'); input.lastChild.disabled = true; input.value = '__mixed__'; }
                else input.value = current[0] || '';
                input.title = current.join(' ') || '默认；选项会同步预览';
                input.addEventListener('change', () => { if (owns(input)) setUtility(property, input.value || null); });
                label.append(input); grid.append(label);
                if (['color', 'background-color', 'border-color'].includes(property)) {
                    const palette = element('div', 'col-span-2 flex flex-wrap items-center gap-2');
                    palette.setAttribute('aria-label', `${descriptor.label}预览`);
                    for (const item of descriptor.options.slice(0, 10)) {
                        const background = item.token.replace(/^(text|border)-/, 'bg-');
                        if (utilityField(background) !== 'background-color') continue;
                        const swatch = button('', () => setUtility(property, item.token));
                        swatch.className = `w-7 h-7 p-0 rounded-full border border-slate-300 focus:ring-2 focus:ring-blue-500 ${background}${current.includes(item.token) ? ' ring-2 ring-blue-500 ring-offset-2' : ''}`;
                        swatch.setAttribute('data-review-swatch', item.token);
                        swatch.setAttribute('data-review-field', property);
                        swatch.setAttribute('aria-label', `${descriptor.label}：${item.label} (${item.token})`);
                        swatch.setAttribute('aria-pressed', String(current.includes(item.token)));
                        swatch.title = `${item.label} · ${item.token}`;
                        palette.append(swatch);
                    }
                    grid.append(palette);
                }
            }
            details.append(grid);
            details.addEventListener('toggle', () => { if (owns(details) && !utilityQuery.trim()) details.open ? expandedGroups.add(group) : expandedGroups.delete(group); });
            wrap.append(details);
        }
    }

    function renderManualPlan() {
        const output = element('textarea', 'block w-full p-3 rounded-xl border border-slate-300 bg-white text-xs');
        output.readOnly = true; output.rows = 12; output.value = manualPlan.text;
        output.setAttribute('data-review-plan', manualPlan.format);
        output.setAttribute('aria-label', '手动复制方案');
        const selectButton = button('全选', () => { output.focus(); output.select(); });
        const backButton = button('返回编辑', () => { manualPlan = null; renderSelection(); }, 'quiet');
        panel.replaceChildren(output, selectButton, backButton); compileUI();
    }

    function renderChanges(body) {
        const list = changedRecords(), snapshots = changes();
        if (!list.length) { body.append(element('p', 'p-5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500', '暂无修改。选择元素后调整文字或外观，最终方案会出现在这里。')); return; }
        const display = value => value === null ? '未设置' : typeof value === 'boolean' ? value ? '开启' : '关闭' : typeof value === 'number' ? String(value) : Array.isArray(value) ? value.join(' ') || '默认' : value || '空文字';
        list.forEach((record, index) => {
            const change = snapshots[index], card = element('section', 'mb-3 p-3 rounded-2xl border border-slate-200 bg-white');
            card.setAttribute('data-review-change', record.field);
            const header = element('div', 'flex items-center justify-between gap-2');
            header.append(element('h3', 'text-sm font-semibold text-slate-800 break-words', `${record.label} · ${fieldLabel(record.field)}`), element('span', `text-xs ${change.status === 'ready' ? 'text-emerald-600' : 'text-amber-600'}`, { ready: '待确认', conflict: '页面已更新', detached: '元素已移除' }[change.status]));
            card.append(header, element('p', 'mt-3 text-xs text-slate-400 break-words', `原值：${display(change.before)}`), element('p', 'mt-2 text-sm text-slate-800 break-words', `最终：${display(change.after)}`));
            if (!change.target.stable) card.append(element('p', 'mt-2 text-xs text-amber-600', '结构定位，交付前请核对元素。'));
            const actions = element('div', 'flex gap-2 mt-3');
            const locate = button('定位元素', () => {
                if (!eligible(record.node)) return;
                editorView = 'edit'; utilityQuery = ''; select(record.node);
                record.node.scrollIntoView({ block: 'center', behavior: 'instant' }); scheduleGeometry();
            });
            locate.disabled = change.status === 'detached';
            const restore = button('还原此项', () => revert(record.node, record.field), 'quiet');
            restore.disabled = change.status !== 'ready';
            actions.append(locate, restore); card.append(actions); body.append(card);
        });
    }

    function renderSelection(preserveDraft = false) {
        if (!panel) return;
        if (manualPlan) {
            if (manualPlan.text === exportPlan(manualPlan.format)) {
                return;
            }
            manualPlan = null; status.textContent = '方案已变化，请重新复制';
        }
        const scrollTop = panel.scrollTop;
        const focused = owns(doc.activeElement) && doc.activeElement.getAttribute('data-review-edit');
        const focusedNavigation = owns(doc.activeElement) && doc.activeElement.getAttribute('data-review-navigate');
        // Preserve pending input only on passive refresh.
        const draft = preserveDraft && focused && doc.activeElement.matches('textarea,input[type="text"],input[type="number"]') && doc.activeElement.value !== doc.activeElement.defaultValue ? {
            value: doc.activeElement.value, start: doc.activeElement.selectionStart, end: doc.activeElement.selectionEnd, direction: doc.activeElement.selectionDirection
        } : null;
        const header = element('div', 'flex items-center justify-between gap-3 px-4 pt-4 pb-3');
        const titles = element('div', '');
        titles.append(element('p', 'mb-1 text-xs font-semibold tracking-wider text-blue-600', 'REVIEW MODE'), element('h2', 'text-lg font-bold text-slate-900', '页面审查'));
        const exit = button('×', close, 'quiet'); exit.setAttribute('aria-label', '关闭审查');
        header.append(titles, exit);
        panel.replaceChildren(header);
        const tabs = element('div', 'flex gap-1 mx-4 mb-3 p-1 rounded-xl bg-slate-200');
        for (const [view, label] of [['edit', '编辑外观'], ['changes', `修改清单（${changedRecords().length}）`]]) {
            const tab = button(label, () => { editorView = view; renderSelection(); scheduleGeometry(); }, view === editorView ? 'neutral' : 'quiet');
            tab.classList.add('flex-1'); tab.setAttribute('data-review-view', view); tab.setAttribute('aria-pressed', String(view === editorView)); tabs.append(tab);
        }
        panel.append(tabs);
        const body = element('div', 'px-4 pb-4');
        if (editorView === 'changes') { renderChanges(body); panel.append(body); compileUI(); panel.scrollTop = scrollTop; return; }
        const info = selected ? describe(selected) : null;
        if (!info) {
            const empty = element('div', 'p-6 rounded-2xl border border-dashed border-slate-300 bg-white text-center');
            empty.append(element('p', 'mb-2 text-base font-semibold text-slate-700', '选择一个元素，开始调整'), element('p', 'text-sm text-slate-500', '点击页面元素查看内容、外观与属性。也可聚焦元素后按 Enter 选择。'));
            body.append(empty); panel.append(body); compileUI();
            return;
        }
        const target = element('div', 'flex items-start gap-3 mb-3 p-3 rounded-2xl bg-blue-50 border border-blue-100');
        target.append(element('span', 'px-2 py-1 rounded-lg bg-white text-xs font-semibold text-blue-600', info.tag));
        const description = element('div', 'min-w-0');
        description.append(element('p', 'text-sm font-semibold text-slate-800 break-words', info.label), element('p', 'mt-1 text-xs text-slate-500', info.target.stable ? '已定位 · 修改即时预览' : '结构定位 · 交付前请核对'));
        target.append(description); body.append(target);
        const scope = element('nav', 'mb-3 p-3 rounded-2xl border border-slate-200 bg-white');
        scope.setAttribute('aria-label', '选择元素范围');
        scope.append(element('p', 'mb-2 text-xs font-semibold text-slate-500', '选中范围'));
        const directions = element('div', 'grid grid-cols-2 gap-2');
        for (const [direction, label] of [['parent', '↑ 外层容器'], ['first-child', '↓ 内部元素'], ['previous-sibling', '← 前一个'], ['next-sibling', '后一个 →']]) {
            const control = button(label, () => {
                if (!navigate(direction)) return;
                const next = panel.querySelector(`[data-review-navigate="${direction}"]:not(:disabled)`) || panel.querySelector('[data-review-navigate]:not(:disabled)');
                if (next) next.focus({ preventScroll: true });
                else { panel.tabIndex = -1; panel.focus({ preventScroll: true }); }
            });
            control.setAttribute('data-review-navigate', direction);
            control.disabled = !info.navigation[direction];
            directions.append(control);
        }
        scope.append(directions, element('p', 'mt-2 text-xs text-slate-500', '点到文字却想改整张卡片？先选外层容器。'));
        body.append(scope, renderEditor(info));
        const readonly = element('details', 'mt-3 p-3 rounded-2xl border border-slate-200 bg-white');
        readonly.append(element('summary', 'text-xs font-medium text-slate-500 cursor-pointer', '高级 · 元素信息与定位'));
        readonly.append(section('内容', [['元素', info.tag], ['名称', info.label], ['文本摘要', info.text]]));
        readonly.append(section('外观', Object.entries(info.computed).map(([name, value]) => [{ display: '布局', fontSize: '字号', color: '文字颜色', backgroundColor: '背景颜色', padding: '内间距', margin: '外间距', width: '宽度', height: '高度' }[name], value])));
        readonly.append(section('原子类与其他类', [['当前类', info.classes.join(' ')]]));
        const details = element('details', 'mt-4');
        details.append(element('summary', 'cursor-pointer font-semibold', '全部 HTML 属性'), section('属性', info.attributes.map(attr => [attr.name, attr.value])));
        readonly.append(details, section('定位', [['选择路径', info.target.selector], ['定位状态', info.target.stable ? '使用唯一审查键或 id' : '结构路径；建议添加唯一 data-jq-review-key'], ['组件标记', info.components.join(' ')]]));
        body.append(readonly); panel.append(body);
        compileUI();
        panel.scrollTop = scrollTop;
        if (focused) {
            const input = panel.querySelector(`[data-review-edit="${CSS.escape(focused)}"]`);
            if (input) {
                input.closest('details')?.setAttribute('open', '');
                if (draft) {
                    input.value = draft.value;
                    if (draft.start !== null) input.setSelectionRange(draft.start, draft.end, draft.direction);
                }
                input.focus({ preventScroll: true });
            }
        }
        if (focusedNavigation) panel.querySelector(`[data-review-navigate="${CSS.escape(focusedNavigation)}"]:not(:disabled)`)?.focus({ preventScroll: true });
    }

    function compileUI() {
        if (host) global.JquanUI.enhance(host);
    }

    function updateGeometry() {
        if (!active || !outline) return;
        const bottom = 24 + toolbar.getBoundingClientRect().height;
        panel.style.bottom = `${bottom}px`;
        panel.style.maxHeight = `${Math.max(0, Math.min(global.innerHeight * (global.innerWidth < 640 ? 0.58 : 0.8), global.innerHeight - bottom - 16))}px`;
        if (!eligible(selected)) {
            if (selected) { selected = null; renderSelection(); }
            outline.hidden = true;
            return;
        }
        const rect = visualTarget(selected).getBoundingClientRect();
        outline.hidden = rect.width === 0 || rect.height === 0;
        // Measured geometry stays inline.
        Object.assign(outline.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    }

    function scheduleGeometry() {
        if (active && frame === null) frame = requestAnimationFrame(() => { frame = null; updateGeometry(); });
    }

    function select(target) {
        return selectNode(selectionTarget(resolve(target)));
    }

    function selectNode(node) {
        if (!active || !eligible(node)) return false;
        selected = node; manualPlan = null; generation++;
        renderSelection();
        updateGeometry();
        status.textContent = `已选中：${describe(node).label}`;
        scheduleGeometry();
        return true;
    }

    function setPicking(value) {
        picking = value;
        pickButton.setAttribute('aria-pressed', String(value));
        pickButton.textContent = value ? '选择中' : '继续选择';
        status.textContent = value ? '点击页面选择元素' : '页面交互已恢复';
        scheduleGeometry();
    }

    function listen(target, name, callback, options) {
        target.addEventListener(name, callback, options);
        activeCleanups.push(() => target.removeEventListener(name, callback, options));
    }

    function historyShortcut(event) {
        if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey || !(event.ctrlKey || event.metaKey)) return false;
        const target = event.target;
        if (!owns(target) && !(picking && eligible(target))) return false;
        // Editing controls keep native undo.
        if (event.composedPath().some(node => node instanceof HTMLElement &&
            (node.matches('input, textarea, select, [role="textbox"], [role="searchbox"], [role="combobox"], [role="spinbutton"]') || node.isContentEditable))) return false;
        const key = event.key.toLowerCase();
        if (key !== 'z' && !(key === 'y' && !event.shiftKey)) return false;
        const redo = key === 'y' || event.shiftKey;
        if (redo ? cursor >= history.length : cursor === 0) return false;
        event.preventDefault(); event.stopImmediatePropagation();
        travel(redo);
        return true;
    }

    function open() {
        if (!enabled || !root || !root.isConnected || !global.JquanUI) return false;
        if (active) return true;
        active = true;
        restoreFocus = doc.activeElement;
        host = element('div', 'text-sm text-left font-sans text-slate-900');
        host.setAttribute('data-jq-review-ui', '');
        outline = element('div', 'fixed pointer-events-none border-2 border-blue-500 rounded-sm');
        outline.style.zIndex = '2147483000';
        outline.setAttribute('aria-hidden', 'true');
        outline.hidden = true;
        panel = element('aside', 'fixed right-4 bottom-20 w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-auto bg-slate-50 border border-slate-200 rounded-3xl shadow-2xl');
        panel.style.zIndex = '2147483001';
        panel.setAttribute('aria-label', '审查元素信息');
        const bar = element('div', 'fixed bottom-4 right-4 flex flex-wrap items-center gap-1 max-w-[calc(100vw-2rem)] p-2 bg-white border border-slate-200 rounded-2xl shadow-xl');
        toolbar = bar;
        bar.style.zIndex = '2147483001';
        bar.setAttribute('role', 'toolbar');
        bar.setAttribute('aria-label', '页面审查');
        pickButton = button('选择中', () => setPicking(!picking));
        undoButton = button('撤销', () => travel(false));
        redoButton = button('重做', () => travel(true));
        undoButton.setAttribute('aria-keyshortcuts', 'Control+z Meta+z');
        redoButton.setAttribute('aria-keyshortcuts', 'Control+Shift+z Meta+Shift+z Control+y Meta+y');
        undoButton.title = '撤销已应用修改（Ctrl/Cmd+Z；输入框保留原生撤销）';
        redoButton.title = '重做已应用修改（Ctrl/Cmd+Shift+Z 或 Ctrl/Cmd+Y）';
        copyButton = button('复制修改方案（0）', () => copyPlan(), 'primary');
        undoButton.disabled = cursor === 0; redoButton.disabled = cursor === history.length; copyButton.disabled = changedRecords().length === 0;
        copyButton.textContent = `复制修改方案（${changedRecords().length}）`;
        status = element('span', 'px-2 text-xs text-slate-500', '点击页面选择元素');
        status.setAttribute('role', 'status');
        bar.append(pickButton, undoButton, redoButton, copyButton, button('还原全部', reset, 'quiet'), button('浏览页面', () => setPicking(false), 'quiet'), button('退出审查', close, 'quiet'), status);
        host.append(outline, panel, bar);
        doc.body.append(host);
        setPicking(true);
        renderSelection();

        const intercept = event => {
            if (!picking || !eligible(event.target)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            if (event.type === 'click') select(event.target);
            else {
                const node = selectionTarget(event.target);
                // Disabled controls may suppress click.
                if (selectHandle(node)?.control?.()?.disabled) selectNode(node);
            }
        };
        listen(global, 'pointerdown', intercept, true);
        listen(global, 'click', intercept, true);
        listen(global, 'keydown', event => {
            if (historyShortcut(event)) return;
            if (event.key === 'Escape') {
                event.preventDefault(); event.stopImmediatePropagation(); close();
            } else if (picking && event.key === 'Enter' && eligible(event.target)) {
                event.preventDefault(); event.stopImmediatePropagation(); select(event.target);
            }
        }, true);
        listen(global, 'scroll', scheduleGeometry, true);
        listen(global, 'resize', scheduleGeometry);
        for (const name of ['jquan:carousel:update', 'jquan:tabs:update', 'jquan:select:update', 'jquan:popover:open', 'jquan:popover:close']) listen(doc, name, event => {
            if (!writingComponent && (selected === event.target || changedRecords().some(record => record.kind === 'component' && record.node === event.target))) refresh(undefined, true);
        });
        observer = new MutationObserver(records => {
            if (!root.isConnected) { close(); return; }
            if (records.some(record => !owns(record.target) && (record.type === 'childList' || (selected && (record.target === selected || selected.contains(record.target) || record.target.contains(selected) || record.target.parentElement === selected.parentElement)) || changedRecords().some(tracked => tracked.node === record.target || tracked.node.contains(record.target))))) {
                if (selected && !eligible(selected)) selected = null;
                refresh(undefined, true);
                scheduleGeometry();
            }
        });
        observer.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
        pickButton.focus({ preventScroll: true });
        return true;
    }

    function close() {
        if (!active) return false;
        active = false; manualPlan = null;
        generation++;
        activeCleanups.splice(0).forEach(cleanup => cleanup());
        observer?.disconnect(); observer = null;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        const focusInside = owns(doc.activeElement);
        host?.remove();
        host = panel = outline = status = pickButton = selected = toolbar = null;
        undoButton = redoButton = copyButton = null;
        if (focusInside && restoreFocus instanceof HTMLElement && restoreFocus.isConnected) restoreFocus.focus({ preventScroll: true });
        restoreFocus = null;
        return true;
    }

    function configure(options) {
        const next = options || {};
        const nextRoot = next.root === undefined ? doc.body : resolve(next.root);
        if (!nextRoot || !(nextRoot instanceof HTMLElement) || !nextRoot.isConnected || nextRoot.getRootNode() !== doc) return false;
        restoreTracked(); generation++;
        close();
        triggerCleanup?.(); triggerCleanup = null;
        enabled = next.enabled === true;
        root = nextRoot;
        editorView = 'edit'; utilityQuery = '';
        startedAt = new Date().toISOString();
        if (enabled) {
            const trigger = event => {
                const node = event.target instanceof Element ? event.target.closest('[data-jq-review-open]') : null;
                if (!node || owns(node)) return;
                event.preventDefault(); event.stopImmediatePropagation(); open();
            };
            doc.addEventListener('click', trigger, true);
            triggerCleanup = () => doc.removeEventListener('click', trigger, true);
            if (next.allowURL !== false && new URL(global.location.href).searchParams.get('jqui-review') === '1') open();
        }
        return true;
    }

    function destroy() {
        restoreTracked(); generation++;
        close();
        triggerCleanup?.(); triggerCleanup = null;
        enabled = false; root = null;
        editorView = 'edit'; utilityQuery = '';
    }

    const api = { configure, open, close, toggle() { return active ? close() : open(); }, select, navigate, state, destroy,
        setText, setUtility, utilities, componentOptions, setComponentOption, revert, setAttribute: editAttribute, undo() { return travel(false); }, redo() { return travel(true); }, reset, changes, exportPlan, copyPlan, saveDraft, loadDraft, clearDraft, applyPlan };
    registry.reviewModeApi = api;
    registry.reviewMode = {
        name: 'jquanui-review-mode', version: '0.18.1', requires: ['jquanui-copy'],
        install() {
            const config = global.JQUAN_CONFIG && global.JQUAN_CONFIG.reviewMode;
            if (config) {
                if (doc.readyState === 'loading') {
                    const ready = () => { triggerCleanup = null; configure(config); };
                    doc.addEventListener('DOMContentLoaded', ready, { once: true });
                    triggerCleanup = () => doc.removeEventListener('DOMContentLoaded', ready);
                } else configure(config);
            }
            return destroy;
        },
        teardown: destroy
    };
})(window);

