(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});
    const uiPreset = JquanUIComponents.uiPreset || { classes: {} };

    const runtime = {
        seed: 0,
        instances: new Map()
    };

    const defaultClasses = {
        shell: 'jq-app-shell min-h-screen bg-slate-100',
        shellSidebar: 'grid grid-cols-1 lg:flex',
        shellTopbar: 'grid grid-cols-1',
        shellMixed: 'grid grid-cols-1 lg:flex',
        sidebar: 'jq-app-sidebar w-full shrink-0 bg-slate-900 text-white px-4 py-5 border-b border-slate-800 lg:border-b-0 lg:border-r lg:border-slate-800 lg:w-64',
        sidebarMixed: 'lg:w-56',
        sidebarTopbar: 'lg:w-full',
        brand: 'jq-app-brand flex items-center justify-between gap-3 mb-4',
        brandMeta: 'text-xs text-slate-400',
        menu: 'jq-app-menu grid gap-2',
        menuChildren: 'grid gap-2 pl-3',
        menuLink: 'flex items-center gap-2 min-h-10 px-3 rounded-lg text-slate-300 no-underline transition-colors duration-200',
        menuLinkHover: 'hover:bg-slate-800 hover:text-white',
        menuLinkActive: 'bg-blue-500/20 text-white',
        main: 'jq-app-main grid min-w-0 flex-1',
        header: `jq-app-header flex items-center justify-between gap-3 min-h-16 px-5 border-b border-slate-200 ${uiPreset.classes.surface || 'bg-white text-slate-900 shadow-sm'}`,
        title: 'text-slate-900 font-semibold',
        headerActions: 'flex items-center gap-2',
        breadcrumb: `jq-app-breadcrumb flex flex-wrap items-center gap-2 px-5 pt-3 ${uiPreset.classes.description || 'text-[13px] leading-5 text-slate-500 break-words'}`,
        breadcrumbLink: 'text-inherit no-underline hover:text-slate-700',
        tabs: 'jq-app-tabs flex flex-wrap gap-2 px-5 pt-3',
        tab: `jq-app-tab ${uiPreset.classes.navItem || 'inline-flex items-center gap-2 min-h-10 px-3 rounded-lg text-slate-600 transition-colors duration-200'} min-h-9 ${uiPreset.classes.surface || 'border border-slate-200 bg-white text-slate-900 shadow-sm'}`,
        tabActive: uiPreset.classes.navItemActive || 'bg-blue-50 text-blue-800 border border-blue-200',
        tabLink: 'text-inherit no-underline',
        tabClose: 'border-0 bg-transparent text-inherit cursor-pointer p-0 leading-none',
        view: 'jq-app-view min-w-0 p-5',
        routerView: 'jq-app-router-view min-w-0',
        headerButton: uiPreset.classes.action || 'inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors duration-200'
    };

    const defaults = {
        title: 'JquanUI App',
        brand: 'JquanUI',
        sidebarWidth: 248,
        layout: 'sidebar',
        menu: [],
        router: null,
        headerActions: [],
        homePath: '/',
        loadingText: 'Loading...',
        tabs: true,
        cacheableTabsOnly: false,
        classes: {}
    };

    function nextId() {
        runtime.seed += 1;
        return `jq-app-shell-${runtime.seed}`;
    }

    function mergeClasses() {
        return Array.from(arguments)
            .flatMap(value => String(value || '').split(/\s+/).filter(Boolean))
            .join(' ');
    }

    function resolveElement(target) {
        if (typeof target === 'string') return document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
        return target instanceof HTMLElement ? target : null;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeMenu(items) {
        return (Array.isArray(items) ? items : []).map(item => Object.assign({
            label: '',
            path: '',
            permission: null,
            children: []
        }, item || {}));
    }

    function normalizeOptions(input) {
        const merged = Object.assign({}, defaults, input || {});
        merged.classes = Object.assign({}, defaultClasses, input?.classes || {});
        return merged;
    }

    function checkPermission(item) {
        const permissionApi = JquanUIComponents.permissionApi;
        if (!item.permission || !permissionApi || typeof permissionApi.has !== 'function') return true;
        return permissionApi.has(item.permission, item.permissionMode || 'some');
    }

    function findMenuPath(items, path, chain = []) {
        for (let i = 0; i < items.length; i += 1) {
            const item = items[i];
            const nextChain = chain.concat(item);
            if (item.path === path) return nextChain;
            if (item.children?.length) {
                const result = findMenuPath(item.children, path, nextChain);
                if (result) return result;
            }
        }
        return null;
    }

    function findMenuMeta(items, path) {
        const chain = findMenuPath(items, path) || [];
        return chain[chain.length - 1] || null;
    }

    function shouldTrackTab(record, routeState) {
        if (!record.options.tabs) return false;
        if (!routeState?.path) return false;
        if (!record.options.cacheableTabsOnly) return true;
        return routeState.route?.meta?.keepAlive === true;
    }

    function ensureTab(record, routeState) {
        if (!shouldTrackTab(record, routeState)) return;
        if (record.tabs.some(tab => tab.path === routeState.path)) return;
        const menuMeta = findMenuMeta(record.menu, routeState.path);
        record.tabs.push({
            path: routeState.path,
            title: routeState.route?.title || menuMeta?.label || routeState.path,
            closable: routeState.path !== record.options.homePath
        });
    }

    function removeTab(record, path) {
        if (path === record.options.homePath) return false;
        const index = record.tabs.findIndex(tab => tab.path === path);
        if (index === -1) return false;
        record.tabs.splice(index, 1);
        return true;
    }

    function shellLayoutClass(record) {
        if (record.options.layout === 'topbar') return record.options.classes.shellTopbar;
        if (record.options.layout === 'mixed') return record.options.classes.shellMixed;
        return record.options.classes.shellSidebar;
    }

    function sidebarLayoutClass(record) {
        if (record.options.layout === 'topbar') return record.options.classes.sidebarTopbar;
        if (record.options.layout === 'mixed') return record.options.classes.sidebarMixed;
        return '';
    }

    function createScaffold(record) {
        const shell = document.createElement('div');
        shell.setAttribute('jq-app-shell', '');
        shell.setAttribute('data-layout', record.options.layout);
        shell.className = mergeClasses(record.options.classes.shell, shellLayoutClass(record));
        shell.innerHTML = `
<aside jq-app-sidebar class="${mergeClasses(record.options.classes.sidebar, sidebarLayoutClass(record))}">
  <div jq-app-brand class="${record.options.classes.brand}">
    <strong>${escapeHtml(record.options.brand)}</strong>
    <span class="${record.options.classes.brandMeta}">SPA</span>
  </div>
  <nav jq-app-menu class="${record.options.classes.menu}"></nav>
</aside>
<main jq-app-main class="${record.options.classes.main}">
  <header jq-app-header class="${record.options.classes.header}">
    <div class="${record.options.classes.title}" data-role="shell-title">${escapeHtml(record.options.title)}</div>
    <div class="${record.options.classes.headerActions}" data-role="header-actions"></div>
  </header>
  <div data-role="breadcrumb"></div>
  <div data-role="tabs"></div>
  <section jq-app-view class="${record.options.classes.view}">
    <div jq-app-router-view class="${record.options.classes.routerView}" data-role="router-view"></div>
  </section>
</main>`;
        record.element.innerHTML = '';
        record.element.appendChild(shell);
        record.refs = {
            shell,
            menu: shell.querySelector('[jq-app-menu]'),
            title: shell.querySelector('[data-role="shell-title"]'),
            headerActions: shell.querySelector('[data-role="header-actions"]'),
            breadcrumb: shell.querySelector('[data-role="breadcrumb"]'),
            tabs: shell.querySelector('[data-role="tabs"]'),
            routerView: shell.querySelector('[data-role="router-view"]')
        };
    }

    function createLinkButton(text, path, className, attributeName) {
        const link = document.createElement('a');
        syncLinkButton(link, text, path, className, attributeName);
        return link;
    }

    function syncLinkButton(link, text, path, className, attributeName) {
        link.href = `#${path || '/'}`;
        link.className = className;
        link.setAttribute(attributeName, path || '/');
        link.textContent = text || path || '/';
    }

    function syncChildren(container, nextChildren) {
        const current = Array.from(container.children);
        nextChildren.forEach((child, index) => {
            if (current[index] !== child) container.insertBefore(child, current[index] || null);
        });
        while (container.children.length > nextChildren.length) {
            container.removeChild(container.lastElementChild);
        }
    }

    function getNodeMap(container, keyName) {
        const map = new Map();
        Array.from(container.children).forEach(child => {
            const key = child.getAttribute(keyName);
            if (key) map.set(key, child);
        });
        return map;
    }

    function buildMenuNodes(record, items, currentPath, container) {
        const existing = container ? getNodeMap(container, 'data-menu-key') : new Map();
        return items.filter(checkPermission).map((item, index) => {
            const key = item.path || item.label || `menu-${index}`;
            const wrapper = existing.get(key) || document.createElement('div');
            wrapper.setAttribute('data-menu-key', key);
            const active = item.path === currentPath;
            let link = wrapper.querySelector(':scope > a[data-path]');
            if (!link) {
                link = document.createElement('a');
                wrapper.prepend(link);
            }
            syncLinkButton(link, item.label || item.path, item.path, mergeClasses(
                record.options.classes.menuLink,
                record.options.classes.menuLinkHover,
                active && record.options.classes.menuLinkActive
            ), 'data-path');
            link.setAttribute('data-active', active ? 'true' : 'false');
            if (item.children?.length) {
                let children = wrapper.querySelector(':scope > div[data-menu-children]');
                if (!children) {
                    children = document.createElement('div');
                    children.setAttribute('data-menu-children', 'true');
                    wrapper.appendChild(children);
                }
                children.className = record.options.classes.menuChildren;
                syncChildren(children, buildMenuNodes(record, item.children, currentPath, children));
            } else {
                const children = wrapper.querySelector(':scope > div[data-menu-children]');
                if (children) children.remove();
            }
            return wrapper;
        });
    }

    function renderMenu(record, currentPath) {
        syncChildren(record.refs.menu, buildMenuNodes(record, record.menu, currentPath, record.refs.menu));
    }

    function renderBreadcrumb(record, currentPath) {
        const chain = findMenuPath(record.menu, currentPath) || [];
        let wrap = record.refs.breadcrumb.firstElementChild;
        if (!wrap) {
            wrap = document.createElement('div');
            record.refs.breadcrumb.appendChild(wrap);
        }
        wrap.setAttribute('jq-app-breadcrumb', '');
        wrap.className = record.options.classes.breadcrumb;
        const nodes = [];
        if (!chain.length) {
            const label = document.createElement('span');
            label.textContent = record.options.title;
            label.setAttribute('data-breadcrumb-root', 'true');
            nodes.push(label);
            syncChildren(wrap, nodes);
            return;
        }
        chain.forEach((item, index) => {
            const isLast = index === chain.length - 1;
            if (isLast) {
                const label = document.createElement('span');
                label.textContent = item.label;
                label.setAttribute('data-breadcrumb-label', String(index));
                nodes.push(label);
                return;
            }
            const link = createLinkButton(item.label, item.path, record.options.classes.breadcrumbLink, 'data-path');
            link.setAttribute('data-breadcrumb-link', String(index));
            nodes.push(link);
            const separator = document.createElement('span');
            separator.textContent = '/';
            separator.setAttribute('data-breadcrumb-sep', String(index));
            nodes.push(separator);
        });
        syncChildren(wrap, nodes);
    }

    function renderTabs(record, currentPath) {
        if (!record.options.tabs) {
            const wrap = record.refs.tabs.firstElementChild;
            if (wrap) syncChildren(wrap, []);
            record.refs.tabs.hidden = true;
            return;
        }
        let wrap = record.refs.tabs.firstElementChild;
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.setAttribute('jq-app-tabs', '');
            record.refs.tabs.appendChild(wrap);
        }
        wrap.className = record.options.classes.tabs;
        const existing = getNodeMap(wrap, 'data-tab-key');
        const nodes = record.tabs.map(tab => {
            const item = existing.get(tab.path) || document.createElement('div');
            item.setAttribute('jq-app-tab', '');
            item.setAttribute('data-tab-key', tab.path);
            item.className = mergeClasses(record.options.classes.tab, tab.path === currentPath && record.options.classes.tabActive);
            item.setAttribute('data-active', tab.path === currentPath ? 'true' : 'false');
            let link = item.querySelector(':scope > a[data-tab-path]');
            if (!link) {
                link = document.createElement('a');
                item.appendChild(link);
            }
            syncLinkButton(link, tab.title, tab.path, record.options.classes.tabLink, 'data-tab-path');
            if (tab.closable) {
                let close = item.querySelector(':scope > button[data-close-path]');
                if (!close) {
                    close = document.createElement('button');
                    close.type = 'button';
                    item.appendChild(close);
                }
                close.className = record.options.classes.tabClose;
                close.setAttribute('data-close-path', tab.path);
                close.setAttribute('aria-label', 'close');
                close.textContent = 'x';
            } else {
                const close = item.querySelector(':scope > button[data-close-path]');
                if (close) close.remove();
            }
            return item;
        });
        syncChildren(wrap, nodes);
        record.refs.tabs.hidden = false;
    }

    function renderHeaderActions(record) {
        const existing = getNodeMap(record.refs.headerActions, 'data-action-key');
        const nodes = record.options.headerActions.map((action, index) => {
            const key = action.key || `action-${index}`;
            const button = existing.get(key) || document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-action-key', key);
            button.className = mergeClasses(record.options.classes.headerButton, action.className);
            button.setAttribute('data-action', action.key || '');
            button.textContent = action.label || action.key || 'Action';
            return button;
        });
        syncChildren(record.refs.headerActions, nodes);
    }

    function syncView(record) {
        const current = record.router?.current();
        const currentPath = current?.path || record.options.homePath;
        ensureTab(record, current);
        record.refs.shell.setAttribute('data-layout', record.options.layout);
        record.refs.shell.className = mergeClasses(record.options.classes.shell, shellLayoutClass(record));
        record.refs.shell.querySelector('[jq-app-sidebar]').className = mergeClasses(record.options.classes.sidebar, sidebarLayoutClass(record));
        record.refs.title.textContent = record.options.title;
        renderMenu(record, currentPath);
        renderBreadcrumb(record, currentPath);
        renderTabs(record, currentPath);
        renderHeaderActions(record);
    }

    function bind(record) {
        if (record.bound) return;
        const onNavigate = event => {
            const link = event.target.closest('a[data-path], a[data-tab-path]');
            if (!link || !record.refs.shell.contains(link)) return;
            event.preventDefault();
            record.router?.push(link.getAttribute('data-path') || link.getAttribute('data-tab-path'));
        };
        const onShellClick = event => {
            const button = event.target.closest('button[data-close-path], button[data-action]');
            if (!button || !record.refs.shell.contains(button)) return;
            if (button.hasAttribute('data-close-path')) {
                event.preventDefault();
                const path = button.getAttribute('data-close-path');
                const isActive = record.router?.current()?.path === path;
                if (!removeTab(record, path)) return;
                syncView(record);
                if (isActive) {
                    const fallback = record.tabs[record.tabs.length - 1]?.path || record.options.homePath;
                    record.router?.replace(fallback);
                }
                return;
            }
            const key = button.getAttribute('data-action');
            const action = record.options.headerActions.find(item => (item.key || '') === key);
            if (typeof action?.onClick === 'function') {
                action.onClick({
                    event,
                    button,
                    router: record.router,
                    shell: createHandle(record.id)
                });
            }
        };
        record.refs.shell.addEventListener('click', onNavigate);
        record.refs.shell.addEventListener('click', onShellClick);
        record.bound = { onNavigate, onShellClick };
    }

    function mount(target, inputOptions = {}) {
        const element = resolveElement(target);
        if (!element) throw new Error('[JquanUI appShell] Container not found.');
        const id = inputOptions.id || nextId();
        const options = normalizeOptions(inputOptions);
        const record = {
            id,
            element,
            options,
            menu: normalizeMenu(options.menu),
            router: null,
            refs: null,
            tabs: [{ path: options.homePath, title: 'Home', closable: false }]
        };
        createScaffold(record);
        const router = JquanUIComponents.routerApi?.create(Object.assign({}, options.router || {}, {
            root: record.refs.routerView,
            afterEach(to, from, handle) {
                syncView(record);
                if (typeof options.router?.afterEach === 'function') {
                    options.router.afterEach(to, from, handle);
                }
            }
        }));
        record.router = router;
        bind(record);
        syncView(record);
        runtime.instances.set(id, record);
        return createHandle(id);
    }

    function createHandle(id) {
        const record = runtime.instances.get(id);
        if (!record) return null;
        return {
            id,
            router() {
                return record.router;
            },
            tabs() {
                return record.tabs.slice();
            },
            open(path) {
                record.router?.push(path);
                return this;
            },
            closeTab(path) {
                const currentPath = record.router?.current()?.path;
                if (!removeTab(record, path)) return false;
                syncView(record);
                if (currentPath === path) {
                    const fallback = record.tabs[record.tabs.length - 1]?.path || record.options.homePath;
                    record.router?.replace(fallback);
                }
                return true;
            },
            update(patch = {}) {
                record.options = normalizeOptions(Object.assign({}, record.options, patch));
                if (patch.menu) record.menu = normalizeMenu(patch.menu);
                syncView(record);
                return this;
            },
            destroy() {
                record.router?.destroy?.();
                if (record.bound && record.refs?.shell) {
                    record.refs.shell.removeEventListener('click', record.bound.onNavigate);
                    record.refs.shell.removeEventListener('click', record.bound.onShellClick);
                }
                runtime.instances.delete(id);
                if (record.element) record.element.innerHTML = '';
                return true;
            }
        };
    }

    const appShellApi = {
        mount(target, options = {}) {
            return mount(target, options);
        },
        get(id) {
            return runtime.instances.has(id) ? createHandle(id) : null;
        }
    };

    JquanUIComponents.appShellApi = appShellApi;

    JquanUIComponents.appShell = {
        name: 'jquanui-app-shell',
        version: '1.3.0',
        requires: [],
        install() {}
    };
})(window);
