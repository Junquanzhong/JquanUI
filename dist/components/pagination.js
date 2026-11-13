(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const legacyClasses = {
        root: 'jq-pagination flex flex-wrap items-center gap-3 text-sm text-slate-700',
        total: 'jq-pagination-total text-slate-500',
        pages: 'jq-pagination-pages flex items-center gap-1',
        button: 'jq-pagination-button inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-lg border transition-colors duration-200',
        buttonDefault: 'border-slate-200 bg-white text-slate-700',
        buttonHover: 'hover:bg-slate-50',
        buttonActive: 'bg-blue-500 border-blue-500 text-white',
        buttonDisabled: 'opacity-50 cursor-not-allowed',
        ellipsis: 'jq-pagination-ellipsis inline-flex items-center justify-center min-w-9 h-9 px-2 text-slate-400',
        sizer: 'jq-pagination-sizer min-w-32',
        jumper: 'jq-pagination-jumper flex items-center gap-2 text-slate-500',
        jumperInput: 'jq-pagination-jumper-input w-18 h-9 px-2 border-0 bg-transparent text-slate-700'
    };

    const config = global.JquanUI?.config || global.JQUAN_CONFIG || {};
    const semantic = config.componentPresets?.ui === 'semantic';
    const defaultClasses = Object.assign({}, legacyClasses, semantic ? {
        root: 'jq-pagination flex flex-wrap items-center gap-3 text-sm text-text',
        total: 'jq-pagination-total text-text-muted',
        button: `${legacyClasses.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`,
        buttonDefault: 'border-border bg-surface text-text',
        buttonHover: 'hover:bg-surface-muted',
        buttonActive: 'bg-accent/10 border-accent/30 text-accent',
        ellipsis: 'jq-pagination-ellipsis inline-flex items-center justify-center min-w-9 h-9 px-2 text-text-muted',
        sizer: 'jq-pagination-sizer min-w-32 border border-border bg-surface text-text',
        jumper: 'jq-pagination-jumper flex items-center gap-2 text-text-muted',
        jumperInput: 'jq-pagination-jumper-input w-18 h-9 px-2 border-0 bg-transparent text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus'
    } : {});

    const defaults = {
        total: 0,
        page: 1,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100],
        maxButtons: 7,
        showJumper: true,
        showSizer: true,
        showTotal: true,
        showPrevNext: true,
        simple: false,
        disabled: false,
        labels: {},
        classes: {},
        onChange: null
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-pagination-${runtime.seed}`;
    }

    function mergeClasses() {
        return Array.from(arguments)
            .flatMap(value => String(value || '').split(/\s+/).filter(Boolean))
            .join(' ');
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.total = Math.max(0, Number(merged.total) || 0);
        merged.pageSize = Math.max(1, Number(merged.pageSize) || 10);
        merged.page = Math.max(1, Number(merged.page) || 1);
        merged.maxButtons = Math.max(5, Number(merged.maxButtons) || 7);
        merged.pageSizes = Array.isArray(merged.pageSizes) && merged.pageSizes.length ? merged.pageSizes.map(item => Number(item) || 10) : defaults.pageSizes.slice();
        merged.labels = Object.assign({}, input?.labels || {});
        merged.classes = Object.assign({}, defaultClasses, input?.classes || {});
        return merged;
    }

    function formatLabel(value, params = {}) {
        const raw = typeof value === 'function' ? value(params) : value;
        return String(raw == null ? '' : raw).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => params[key] == null ? '' : String(params[key]));
    }

    function getI18nLabel(name, params) {
        const i18n = global.JquanUIComponents?.i18nApi;
        const key = `pagination.${name}`;
        if (!i18n || typeof i18n.has !== 'function' || !i18n.has(key, { namespace: 'common' })) return null;
        return i18n.t(key, params, { namespace: 'common' });
    }

    function getLabel(options, name, fallback, params = {}) {
        if (options.labels && options.labels[name] != null) return formatLabel(options.labels[name], params);
        const localized = getI18nLabel(name, params);
        return localized == null ? formatLabel(fallback, params) : localized;
    }

    function getPageCount(options) {
        return Math.max(1, Math.ceil(options.total / options.pageSize));
    }

    function clampPage(page, options) {
        return Math.min(Math.max(1, Number(page) || 1), getPageCount(options));
    }

    function getPageItems(options) {
        const pageCount = getPageCount(options);
        const current = clampPage(options.page, options);
        if (pageCount <= options.maxButtons) {
            return Array.from({ length: pageCount }, (_, index) => index + 1);
        }
        const items = [1];
        const innerCount = options.maxButtons - 2;
        let start = Math.max(2, current - Math.floor(innerCount / 2));
        let end = start + innerCount - 1;
        if (end >= pageCount) {
            end = pageCount - 1;
            start = end - innerCount + 1;
        }
        if (start > 2) items.push('...');
        for (let i = start; i <= end; i += 1) items.push(i);
        if (end < pageCount - 1) items.push('...');
        items.push(pageCount);
        return items;
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function readOptionsFromElement(element) {
        return {
            total: Number(element.getAttribute('data-total')) || 0,
            page: Number(element.getAttribute('data-page')) || 1,
            pageSize: Number(element.getAttribute('data-page-size')) || 10,
            simple: element.getAttribute('data-simple') === 'true'
        };
    }

    function buttonClass(options, active, disabled) {
        return mergeClasses(
            options.classes.button,
            !active && !disabled && options.classes.buttonHover,
            active ? options.classes.buttonActive : options.classes.buttonDefault,
            disabled && options.classes.buttonDisabled
        );
    }

    function emitChange(record, reason) {
        const payload = {
            page: record.options.page,
            pageSize: record.options.pageSize,
            total: record.options.total,
            pageCount: getPageCount(record.options),
            reason
        };
        if (typeof record.options.onChange === 'function') record.options.onChange(payload);
        return payload;
    }

    function render(target) {
        const record = typeof target === 'object' && target.options ? target : runtime.instances.get(target);
        if (!record) return null;
        const element = record.element;
        const options = record.options;
        const pageCount = getPageCount(options);
        options.page = clampPage(options.page, options);

        const total = options.showTotal ? `<div class="${options.classes.total}">${getLabel(options, 'total', 'Total {{total}}', { total: options.total })}</div>` : '';
        const prevDisabled = options.disabled || options.page <= 1;
        const nextDisabled = options.disabled || options.page >= pageCount;
        const prev = options.showPrevNext ? `<button type="button" class="${buttonClass(options, false, prevDisabled)}" data-action="prev" ${prevDisabled ? 'disabled' : ''}>${getLabel(options, 'prev', 'Prev')}</button>` : '';
        const next = options.showPrevNext ? `<button type="button" class="${buttonClass(options, false, nextDisabled)}" data-action="next" ${nextDisabled ? 'disabled' : ''}>${getLabel(options, 'next', 'Next')}</button>` : '';
        const pages = options.simple
            ? `<div class="${options.classes.pages}">${prev}<span>${options.page} / ${pageCount}</span>${next}</div>`
            : `<div class="${options.classes.pages}">${prev}${getPageItems(options).map(item => item === '...'
                ? `<span class="${options.classes.ellipsis}">...</span>`
                : `<button type="button" class="${buttonClass(options, item === options.page, options.disabled)}" data-page="${item}" ${options.disabled ? 'disabled' : ''} ${item === options.page ? 'aria-current="page"' : ''}>${item}</button>`).join('')}${next}</div>`;
        const sizer = options.showSizer
            ? `<select jq-select class="${options.classes.sizer}" data-role="page-size" data-select-searchable="false" data-select-clearable="false" ${options.disabled ? 'disabled' : ''}>${options.pageSizes.map(size => `<option value="${size}" ${size === options.pageSize ? 'selected' : ''}>${getLabel(options, 'pageSize', '{{size}} / page', { size })}</option>`).join('')}</select>`
            : '';
        const jumper = options.showJumper
            ? `<div class="${options.classes.jumper}"><span>${getLabel(options, 'go', 'Go')}</span><input jq-number-input class="${options.classes.jumperInput}" type="number" min="1" max="${pageCount}" step="1" data-number-large-step="10" value="${options.page}" data-role="jumper" ${options.disabled ? 'disabled' : ''}></div>`
            : '';

        destroyNumberInputs(element);
        destroySelects(element);
        element.setAttribute('jq-pagination', '');
        element.innerHTML = `<div class="${options.classes.root}">${total}${pages}${sizer}${jumper}</div>`;
        mountSelects(element);
        mountNumberInputs(element);
        bind(record);
        return record;
    }

    function destroySelects(element) {
        if (!global.JquanUIComponents?.selectApi) return;
        element.querySelectorAll('select[data-jq-select-source]').forEach(select => {
            global.JquanUIComponents.selectApi.destroy(select);
        });
    }

    function mountSelects(element) {
        if (!global.JquanUIComponents?.selectApi) return;
        element.querySelectorAll('select[jq-select], select[data-jq-select]').forEach(select => {
            global.JquanUIComponents.selectApi.mount(select, {
                searchable: false,
                clearable: false,
                classes: {
                    trigger: 'jq-select-trigger min-h-9'
                }
            });
        });
    }

    function destroyNumberInputs(element) {
        if (!global.JquanUIComponents?.numberInputApi) return;
        element.querySelectorAll('input[data-jq-number-input-source]').forEach(input => {
            global.JquanUIComponents.numberInputApi.destroy(input);
        });
    }

    function mountNumberInputs(element) {
        if (!global.JquanUIComponents?.numberInputApi) return;
        if (global.JquanUI?.hasPlugin?.('jquanui-number-input')) return;
        element.querySelectorAll('input[jq-number-input], input[data-jq-number-input]').forEach(input => {
            global.JquanUIComponents.numberInputApi.mount(input);
        });
    }

    function bind(record) {
        const element = record.element;
        element.onclick = event => {
            const button = event.target.closest('button[data-page],button[data-action]');
            if (!button || record.options.disabled) return;
            if (button.dataset.page) {
                update(record.id, { page: Number(button.dataset.page) }, 'page');
                return;
            }
            if (button.dataset.action === 'prev') update(record.id, { page: record.options.page - 1 }, 'prev');
            if (button.dataset.action === 'next') update(record.id, { page: record.options.page + 1 }, 'next');
        };
        const select = element.querySelector('select[data-role="page-size"]');
        if (select) {
            select.onchange = () => update(record.id, { pageSize: Number(select.value), page: 1 }, 'pageSize');
        }
        const jumper = element.querySelector('input[data-role="jumper"]');
        if (jumper) {
            jumper.onkeydown = event => {
                if (event.key !== 'Enter') return;
                update(record.id, { page: Number(jumper.value) }, 'jump');
            };
            jumper.onchange = () => update(record.id, { page: Number(jumper.value) }, 'jump');
        }
    }

    function mount(target, inputOptions = {}) {
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI pagination] Container not found.');
        const id = element.id || nextId();
        element.id = id;
        const options = normalizeOptions(Object.assign({}, readOptionsFromElement(element), inputOptions));
        const record = { id, element, options };
        runtime.instances.set(id, record);
        render(record);
        return createHandle(id);
    }

    function update(target, patch = {}, reason = 'update') {
        const record = runtime.instances.get(typeof target === 'string' ? target : target.id);
        if (!record) return null;
        record.options = normalizeOptions(Object.assign({}, record.options, patch));
        record.options.page = clampPage(record.options.page, record.options);
        render(record);
        emitChange(record, reason);
        return createHandle(record.id);
    }

    function updatePage(target, pageResult, reason = 'data') {
        if (!pageResult || typeof pageResult !== 'object') return null;
        return update(target, {
            page: pageResult.page,
            pageSize: pageResult.pageSize,
            total: pageResult.total
        }, reason);
    }

    function createHandle(id) {
        const record = runtime.instances.get(id);
        if (!record) return null;
        return {
            id,
            state() {
                return Object.assign({}, record.options, { pageCount: getPageCount(record.options) });
            },
            update(patch = {}, reason = 'update') {
                return update(id, patch, reason);
            },
            destroy() {
                runtime.instances.delete(id);
                if (record.element) {
                    record.element.onclick = null;
                    record.element.innerHTML = '';
                }
                return true;
            }
        };
    }

    const paginationApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(target) {
            const element = resolveElement(target);
            if (element?.id) return createHandle(element.id);
            return runtime.instances.get(target) ? createHandle(target) : null;
        },
        update(target, patch = {}, reason = 'update') {
            return update(typeof target === 'string' ? target : target.id, patch, reason);
        },
        updatePage(target, pageResult, reason = 'data') {
            return updatePage(target, pageResult, reason);
        },
        destroy(target) {
            const handle = this.get(target);
            return handle ? handle.destroy() : false;
        }
    };

    JquanUIComponents.paginationApi = paginationApi;

    JquanUIComponents.pagination = {
        name: 'jquanui-pagination',
        version: '1.1.0',
        requires: [],
        install(api) {
            api.addBehaviors({
                selector: '[jq-pagination], [data-jq-pagination]',
                setup(node) {
                    mount(node);
                    return () => {
                        if (node.id) paginationApi.destroy(node.id);
                    };
                }
            });
        }
    };
})(window);
