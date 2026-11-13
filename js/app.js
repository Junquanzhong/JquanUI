/**
 * JquanUI CSS docs page controller (v4.72.0)
 * - 引入可折叠侧边栏 (Accordion Menu)
 * - 树形路由数据结构重构
 * - [v1.3.1 更新] 全面拥抱 Phosphor Icons，剥离独立 JS/CSS
 */
class DocApp {
    static ASSET_VERSION = '4.72.0-1';

    constructor() {
        // 树形路由表：按分类包裹子组件 (全部采用 Phosphor 图标类名)
        this.navTree = [
            {
                id: 'group-getting-started',
                category: '基础入门',
                isOpen: true,
                items: [
                    { path: 'intro', name: '介绍与安装', icon: 'ph-book-open' },
                    
                ]
            },
            {
                id: 'group-typography',
                category: '排版',
                isOpen: true,
                items: [
                    { path: 'font', name: '嵌入字体 (Font)', icon: 'ph-text-t' },
                    { path: 'font-vf', name: '字体变量 (Font Variable)', icon: 'ph-text-t' },
                    { path: 'fontsize', name: '字体大小 (Font Size)', icon: 'ph-text-h' },
                    { path: 'fontweight', name: '字体粗细 (Font Weight)', icon: 'ph-text-b' },
                    { path: 'fontstyle', name: '字体样式 (Font Style)', icon: 'ph-text-a-underline' },
                    { path: 'word-spacing', name: '文字间距 (Word Spacing)', icon: 'ph-align-center-vertical-simple' },
                    { path: 'indent', name: '缩进 (Indent)', icon: 'ph-text-indent' },
                    { path: 'hyphens', name: '连字符 (Hyphens)', icon: 'ph-arrows-out-line-horizontal' },
                    { path: 'leading', name: '行高 (Leading)', icon: 'ph-arrows-out-line-vertical' },
                    { path: 'lineclamp', name: '行数限制 (Line Clamp)', icon: 'ph-arrow-fat-lines-down' },
                    { path: 'list', name: '列表 (List)', icon: 'ph-list' },
                    { path: 'align', name: '对齐 (Align)', icon: 'ph-text-align-center' },
                    { path: 'hr', name: '水平线 (Horizontal Rule)', icon: 'ph-minus' },
                    { path: 'text-transform', name: '大小写变换 (Text Tf)', icon: 'ph-text-aa' },
                    { path: 'whitespace', name: '空格 (Whitespace)', icon: 'ph-space' },
                    { path: 'break', name: '换行 (Break)', icon: 'ph-arrow-elbow-right-down' },
                    { path: 'writing', name: '书写方向 (Writing)', icon: 'ph-text-aa' },
                ]
            },
            {
                id: 'group-colors',
                category: '色彩系统',
                isOpen: false,
                items: [
                    { path: 'bgcolor', name: '背景颜色 (Bg Color)', icon: 'ph-palette' },
                    { path: 'textcolor', name: '文本颜色 (Text Color)', icon: 'ph-paint-brush' },
                    { path: 'bordercolor', name: '边框颜色 (Border Color)', icon: 'ph-rectangle' },
                    { path: 'ringcolor', name: '环形颜色 (Ring Color)', icon: 'ph-triangle' },
                    { path: 'gradient', name: '渐变颜色 (Gd Color)', icon: 'ph-gradient' },
                    { path: 'opacity', name: '透明度 (Opacity)', icon: 'ph-gradient' }
                ]
            },
            {
                id: 'group-layout',
                category: '布局排版',
                isOpen: false,
                items: [
                    { path: 'size', name: '尺寸系统 (Size)', icon: 'ph-arrows-out' },
                    { path: 'grid', name: '网格布局 (Grid)', icon: 'ph-squares-four' },
                    { path: 'flexbox', name: '弹性布局 (Flexbox)', icon: 'ph-columns' },
                    { path: 'columns', name: '瀑布流 (Columns)', icon: 'ph-columns' },
                    { path: 'spacing', name: '间距 (Spacing)', icon: 'ph-arrows-out-line-horizontal' },
                    { path: 'box-sizing', name: '盒模型 (Box Sizing)', icon: 'ph-rectangle' },
                    { path: 'container', name: '容器 (Container)', icon: 'ph-rectangle' },
                    { path: 'visible', name: '可见性 (Visible)', icon: 'ph-eye' },
                    { path: 'equal', name: '等分布局 (Equal)', icon: 'ph-columns' },
                    { path: 'display', name: '显示模式 (Display)', icon: 'ph-tornado' },
                    { path: 'zindex', name: 'Z-Index (Z-Index)', icon: 'ph-cards-three' },
                    { path: 'position', name: '定位系统 (Position)', icon: 'ph-compass' },
                    { path: 'float', name: '浮动系统 (Float)', icon: 'ph-rows' },
                    { path: 'object', name: '内容适配 (Object)', icon: 'ph-article-medium' },
                    { path: 'overflow', name: '溢出处理 (Overflow)', icon: 'ph-intersect-square' },
                    { path: 'background-image', name: '背景剪裁 (Bg Clip)', icon: 'ph-image' },
                    { path: 'contain', name: '包含 (Contain)', icon: 'ph-rectangle' },
                ]
            },
            {
                id: 'group-borders',
                category: '边框系统',
                isOpen: false,
                items: [
                    { path: 'border-radius', name: '圆角 (Border Radius)', icon: 'ph-rectangle' },
                    { path: 'border-width', name: '边框宽度 (Border Width)', icon: 'ph-rectangle' },
                    { path: 'outline', name: '轮廓 (Outline)', icon: 'ph-rectangle' },
                ]
            },
            {
                id: 'group-effects',
                category: '效果',
                isOpen: false,
                items: [
                    { path: 'shadow', name: '阴影 (Shadow)', icon: 'ph-approximate-equals' },
                    { path: 'filter', name: '滤镜 (Filter)', icon: 'ph-broom' },
                    { path: 'transform', name: '变换 (Transform)', icon: 'ph-text-aa' },
                    { path: 'transition', name: '过渡 (Transition)', icon: 'ph-clock-clockwise' },
                    { path: 'animation', name: '动画 (Animation)', icon: 'ph-lightning' },
                    { path: 'blend-mode', name: '混合模式 (Blend Mode)', icon: 'ph-bandaids' },
                    { path: 'mask', name: '遮罩 (Mask)', icon: 'ph-face-mask' },
                ]
            },
            {
                id: 'group-interactions',
                category: '交互',
                isOpen: false,
                items: [
                    { path: 'interaction', name: '行为控制 (Interaction)', icon: 'ph-cursor' },
                    { path: 'hover', name: '悬停 (Hover)', icon: 'ph-cursor-click' },
                    { path: 'loader', name: '加载器 (Loader)', icon: 'ph-spinner' },
                    { path: 'scroll', name: '滚动 (Scroll)', icon: 'ph-mouse-scroll' },
                ]
            },
            {
                id: 'group-core',
                category: '核心能力',
                isOpen: false,
                items: [
                    { path: 'jit-syntax', name: '语法糖与 JIT', icon: 'ph-cpu' },
                    { path: 'theme-darkmode', name: '主题切换', icon: 'ph-moon' },
                    { path: 'modern-css', name: '现代 CSS 与迁移', icon: 'ph-sparkle' },
                    { path: 'build-toolchain', name: '构建工具链', icon: 'ph-package' },
                    { path: 'plugin-system', name: '插件系统', icon: 'ph-plugin' },
                    { path: 'architecture', name: '架构设计', icon: 'ph-architecture' },
                    { path: 'components-physics', name: '组件物理', icon: 'ph-physics' },
                ]
            },
        ];

        this.container = document.getElementById('app-container');
        this.currentController = null;
        
        this.cmdModal = document.getElementById('cmd-palette');
        this.cmdOverlay = document.getElementById('cmd-overlay');
        this.cmdContent = document.getElementById('cmd-content');
        this.cmdInput = document.getElementById('cmd-input');
        this.cmdResults = document.getElementById('cmd-results');
        this.searchResultItems = [];
        this.currentSearchIndex = -1;

        this.init();
    }

    init() {
        this.renderSidebar();
        this.bindGlobalEvents();
        this.loadComponent('intro');
    }

    enhanceRenderedRoot(root) {
        if (root && window.JquanUI && typeof window.JquanUI.enhance === 'function') {
            window.JquanUI.enhance(root);
        }
    }

    renderSidebar() {
        const navContainer = document.getElementById('sidebar-nav');
        let html = '';
        
        this.navTree.forEach(group => {
            const parentStateClass = group.isOpen ? 'is-open-parent' : '';
            const contentStateClass = group.isOpen ? 'is-open' : '';

            let itemsHtml = group.items.map(route => `
                <a href="#" data-component="${route.path}" class="nav-item flex items-center px-3 py-2 mt-1 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 hover:text-primary transition-all group">
                    <i class="ph ${route.icon} text-lg w-6 text-center text-slate-400 group-hover:text-slate-600 transition-colors"></i>
                    <span>${route.name}</span>
                </a>
            `).join('');

            html += `
                <div class="nav-group mb-2 ${parentStateClass}" data-group-id="${group.id}">
                    <div class="nav-group-header flex items-center justify-between px-3 py-2 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-100">
                        <span class="text-[12px] font-bold uppercase tracking-wider">${group.category}</span>
                        <!-- 替换为 Phosphor 向下箭头 -->
                        <i class="ph ph-caret-down text-[12px] chevron-icon"></i>
                    </div>
                    <div class="nav-group-content ${contentStateClass}">
                        <div class="nav-group-inner pl-1 pr-1 pb-1">
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
            `;
        });
        
        navContainer.innerHTML = html;
        this.enhanceRenderedRoot(navContainer);
    }

    bindGlobalEvents() {
        document.getElementById('sidebar-nav').addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                this.loadComponent(navItem.dataset.component);
                return;
            }

            const groupHeader = e.target.closest('.nav-group-header');
            if (groupHeader) {
                e.preventDefault();
                const groupEl = groupHeader.closest('.nav-group');
                const groupId = groupEl.dataset.groupId;
                this.toggleNavGroup(groupId);
            }
        });

        document.getElementById('cmd-trigger').addEventListener('click', () => this.openSearch());
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            if (e.key === 'Escape' && !this.cmdModal.classList.contains('hidden')) {
                this.closeSearch();
            }
        });

        this.cmdOverlay.addEventListener('click', () => this.closeSearch());

        let searchTimeout;
        this.cmdInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.executeSearch(e.target.value.trim()), 150);
        });

        this.cmdInput.addEventListener('keydown', (e) => this.handleSearchNavigation(e));
    }

        // 侧边栏手风琴逻辑
    toggleNavGroup(groupId, forceOpen = false) {
        const targetGroup = this.navTree.find(g => g.id === groupId);
        if (!targetGroup) return;

        // 如果明确要求强制展开，或者目标本身是关闭的，则标记为准备展开
        const willOpen = forceOpen || !targetGroup.isOpen;

        // 遍历整个路由树，进行排他性状态重置
        this.navTree.forEach(group => {
            const groupEl = document.querySelector(`.nav-group[data-group-id="${group.id}"]`);
            const contentEl = groupEl ? groupEl.querySelector('.nav-group-content') : null;
            if (!groupEl || !contentEl) return;

            if (group.id === groupId) {
                // 1. 处理目标组的状态切换
                group.isOpen = willOpen;
                if (group.isOpen) {
                    groupEl.classList.add('is-open-parent');
                    contentEl.classList.add('is-open');
                } else {
                    groupEl.classList.remove('is-open-parent');
                    contentEl.classList.remove('is-open');
                }
            } else if (willOpen) {
                // 2. 手风琴核心：如果目标组正在展开，强制关闭其他所有已展开的组
                group.isOpen = false;
                groupEl.classList.remove('is-open-parent');
                contentEl.classList.remove('is-open');
            }
        });
    }

    setActiveNav(path) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.className = 'nav-item flex items-center px-3 py-2 mt-1 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 hover:text-primary transition-all group';
            item.querySelector('i').className = item.querySelector('i').className.replace('text-primary', 'text-slate-400');
        });

        const active = document.querySelector(`.nav-item[data-component="${path}"]`);
        if (active) {
            active.className = 'nav-item flex items-center px-3 py-2 mt-1 rounded-lg text-sm font-medium bg-primary/10 text-primary transition-all group';
            active.querySelector('i').className = active.querySelector('i').className.replace('text-slate-400', 'text-primary');

            // 联动处理父级组的展开
            const groupEl = active.closest('.nav-group');
            if (groupEl) {
                const groupId = groupEl.dataset.groupId;
                const groupData = this.navTree.find(g => g.id === groupId);
                // 如果父级组未展开，通过 forceOpen=true 参数强制让其成为唯一展开的板块
                if (groupData && !groupData.isOpen) {
                    this.toggleNavGroup(groupId, true);
                }
            }
        }
    }

    async loadComponent(name) {
        this.setActiveNav(name);

        if (this.currentController && typeof this.currentController.unmount === 'function') {
            try { this.currentController.unmount(); } catch (e) { console.error(e); }
        }

        this.container.innerHTML = `
            <div class="animate-pulse fade-enter-active max-w-4xl">
                <div class="h-10 bg-slate-100 rounded-lg w-1/3 mb-4"></div>
                <div class="h-4 bg-slate-100 rounded w-2/3 mb-12"></div>
                <div class="h-40 bg-slate-50 border border-slate-100 rounded-xl mb-6"></div>
            </div>
        `;

        try {
            const module = await this.loadModule(name);
            
            if (module && module.default) {
                this.currentController = module.default;
                const htmlContent = this.currentController.render();
                
                this.container.innerHTML = `<div class="fade-enter pb-20">${htmlContent}</div>`;
                this.ensureDocumentHeading(name);
                this.enhanceRenderedRoot(this.container);
                
                requestAnimationFrame(() => {
                    const wrapper = this.container.firstElementChild;
                    if(wrapper) {
                        wrapper.classList.remove('fade-enter');
                        wrapper.classList.add('fade-enter-active');
                    }
                });

                if (typeof this.currentController.mount === 'function') {
                    this.currentController.mount(this.container);
                    this.enhanceRenderedRoot(this.container);
                }
            }
        } catch (error) {
            console.error(`[JquanUI Docs] Failed to render "${name}"`, error);
            this.container.innerHTML = `<div class="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                <i class="ph ph-warning-circle text-2xl"></i>
                <span>模块 [${name}] 加载中或尚未编写。</span>
            </div>`;
        }
    }

    ensureDocumentHeading(path) {
        const page = this.container.firstElementChild;
        if (!page || page.querySelector('h1')) return;

        const route = this.navTree.flatMap(group => group.items).find(item => item.path === path);
        if (!route) return;

        const headingWrap = document.createElement('div');
        headingWrap.className = 'mb-6';
        const heading = document.createElement('h1');
        heading.className = 'text-3xl font-bold tracking-tight text-slate-800';
        heading.textContent = route.name;
        headingWrap.appendChild(heading);

        const contentRoot = page.querySelector('.container') || page;
        const breadcrumb = contentRoot.querySelector(':scope > ul');
        if (breadcrumb) breadcrumb.insertAdjacentElement('afterend', headingWrap);
        else contentRoot.prepend(headingWrap);
    }

    openSearch() {
        this.cmdModal.classList.remove('hidden');
        void this.cmdModal.offsetWidth;
        this.cmdModal.classList.add('modal-enter-active');
        this.cmdContent.classList.add('modal-content-active');
        this.cmdInput.value = '';
        this.cmdResults.innerHTML = '<div class="px-4 py-10 text-center text-slate-400 text-sm">随时查找类名、属性和用法...</div>';
        this.cmdInput.focus();
        this.searchResultItems = [];
        this.currentSearchIndex = -1;
    }

    closeSearch() {
        this.cmdModal.classList.remove('modal-enter-active');
        this.cmdContent.classList.remove('modal-content-active');
        setTimeout(() => this.cmdModal.classList.add('hidden'), 200);
    }

    async executeSearch(keyword) {
        if (!keyword) {
            this.cmdResults.innerHTML = '<div class="px-4 py-10 text-center text-slate-400 text-sm">请输入类名或组件名...</div>';
            this.searchResultItems = [];
            return;
        }

        let resultHtml = '';
        this.searchResultItems = [];
        let globalIndex = 0;

        const flatRoutes = this.navTree.flatMap(group => group.items);
        const matchedRoutes = flatRoutes.filter(r => r.name.toLowerCase().includes(keyword.toLowerCase()));
        
        if (matchedRoutes.length > 0) {
            resultHtml += `<div class="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white sticky top-0">匹配的文档</div>`;
            matchedRoutes.forEach(route => {
                resultHtml += `
                    <div class="search-item px-5 py-3 border-l-4 border-transparent flex items-center cursor-pointer hover:bg-slate-50 transition-colors" data-index="${globalIndex}" data-action="route" data-value="${route.path}">
                        <i class="ph ${route.icon} text-slate-300 text-lg w-6 text-center"></i>
                        <span class="ml-3 text-slate-700 font-medium">${route.name}</span>
                        <span class="ml-auto text-[11px] text-slate-400 border border-slate-200 rounded px-2 py-0.5 shadow-sm bg-white">跳转</span>
                    </div>
                `;
                this.searchResultItems.push({ index: globalIndex, action: 'route', value: route.path });
                globalIndex++;
            });
        }

        if (this.currentController && typeof this.currentController.onSearch === 'function') {
            const localResults = await this.currentController.onSearch(keyword);
            if (localResults && localResults.length > 0) {
                resultHtml += `<div class="px-5 py-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 bg-white sticky top-0">当前文档类名</div>`;
                localResults.forEach(item => {
                    resultHtml += `
                        <div class="search-item px-5 py-3 border-l-4 border-transparent flex items-center cursor-pointer hover:bg-slate-50 transition-colors" data-index="${globalIndex}" data-action="local" data-value="${item.actionValue}">
                            <div class="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-mono shrink-0">#</div>
                            <div class="ml-3 overflow-hidden">
                                <div class="text-primary-dark font-mono text-sm truncate">${item.title}</div>
                                <div class="text-slate-500 text-xs mt-0.5 truncate">${item.desc}</div>
                            </div>
                            <span class="ml-auto text-[11px] text-primary bg-primary/10 rounded px-2 py-0.5 font-medium shrink-0">定位</span>
                        </div>
                    `;
                    this.searchResultItems.push({ index: globalIndex, action: 'local', value: item.actionValue });
                    globalIndex++;
                });
            }
        }

        if (resultHtml === '') {
            resultHtml = `<div class="px-4 py-12 text-center text-slate-500 text-sm">未能查找到与 "<span class="text-primary">${keyword}</span>" 相关的类或文档</div>`;
        }

        this.cmdResults.innerHTML = resultHtml;
        this.currentSearchIndex = -1;
        
        this.cmdResults.querySelectorAll('.search-item').forEach(el => {
            el.addEventListener('click', () => this.selectSearchResult(parseInt(el.dataset.index)));
            el.addEventListener('mouseenter', () => this.highlightSearchResult(parseInt(el.dataset.index)));
        });
    }

    handleSearchNavigation(e) {
        if (this.searchResultItems.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResultItems.length;
            this.highlightSearchResult(this.currentSearchIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.currentSearchIndex = this.currentSearchIndex - 1 < 0 ? this.searchResultItems.length - 1 : this.currentSearchIndex - 1;
            this.highlightSearchResult(this.currentSearchIndex);
        } else if (e.key === 'Enter' && this.currentSearchIndex >= 0) {
            e.preventDefault();
            this.selectSearchResult(this.currentSearchIndex);
        }
    }

    highlightSearchResult(index) {
        this.currentSearchIndex = index;
        const items = this.cmdResults.querySelectorAll('.search-item');
        items.forEach(el => el.classList.remove('search-item-active'));
        const target = this.cmdResults.querySelector(`.search-item[data-index="${index}"]`);
        if (target) {
            target.classList.add('search-item-active');
            target.scrollIntoView({ block: 'nearest' });
        }
    }

    selectSearchResult(index) {
        const item = this.searchResultItems[index];
        if (!item) return;
        this.closeSearch();
        if (item.action === 'route') {
            this.loadComponent(item.value);
        } else if (item.action === 'local') {
            if (this.currentController && typeof this.currentController.onSearchResultClick === 'function') {
                this.currentController.onSearchResultClick(item.value);
            }
        }
    }
    async loadModule(name) {
        try {
            // 利用 ES6 的动态 import 去 content 目录下加载对应的 js 文件
            // 注意：这要求你必须在本地服务器下运行(如 VSCode 的 Live Server)，不能直接双击打开 html，否则会有跨域(CORS)限制
            const module = await import(`../content/${name}.js?v=${DocApp.ASSET_VERSION}`);
            return module;
        } catch (error) {
            console.error(`Failed to load module: ${name}`, error);
            throw error;
        }
    }
}

function bootDocApp() {
    if (window.docApp) return;
    window.docApp = new DocApp();
}

window.bootDocApp = bootDocApp;

if (window.location.protocol !== 'file:') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootDocApp);
    } else {
        bootDocApp();
    }
}
