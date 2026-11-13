(function () {
    const UI_TEXT = {
        all: '全部区块',
        uiComponents: 'UI 组件',
        previewTitle: '效果预览',
        sourceTitle: 'HTML 源码',
        variantsCount: '个排版样式',
        back: '返回列表'
    };

    const BLOCK_META = {
        taskInbox: { chinese: '任务收件箱', category: '数据展示', summary: '用于展示待处理任务、提醒和跟进事项。', icon: 'ph-check-square-offset' },
        notificationCenterPanel: { chinese: '通知中心面板', category: '反馈与浮层', summary: '基于 group-hover 纯 CSS 实现的下拉通知悬浮面板。', icon: 'ph-bell-ringing' },
        workspaceSwitcher: { chinese: '工作区切换器', category: '应用框架', summary: '纯 CSS 实现的下拉选择器，用于多空间快速切换。', icon: 'ph-squares-four' },
        recentActivityFeed: { chinese: '最近动态流', category: '数据展示', summary: '使用 border-l 和绝对定位构建的精美垂直时间线。', icon: 'ph-clock-counter-clockwise' },
        quickActionLauncher: { chinese: '快捷动作面板', category: '应用框架', summary: '卡片化呈现的操作入口面板。', icon: 'ph-rocket-launch' },
        siteLocaleSwitcher: { chinese: '站点语言切换器', category: '内容展示', summary: '支持 hover 悬浮动画的纯 CSS 多语言下拉栏。', icon: 'ph-translate' },
        reviewQueuePanel: { chinese: '审核队列面板', category: '数据展示', summary: '带行动按钮的列表卡片组合。', icon: 'ph-list-checks' },
        assetFolderTree: { chinese: '素材目录树', category: '业务组件', summary: '利用 HTML5 <details> 和 <summary> 标签实现原生树状折叠。', icon: 'ph-tree-structure' },
        dataFilterPresetBar: { chinese: '筛选预设条', category: '业务组件', summary: '横向排列的状态切换胶囊按钮组。', icon: 'ph-funnel-simple' },
        roleMemberAssigner: { chinese: '角色成员分配', category: '业务组件', summary: '左右分栏布局的角色与用户卡片绑定视图。', icon: 'ph-users-three' },
        contentOutlinePanel: { chinese: '内容大纲面板', category: '内容展示', summary: '文章侧边栏带层级缩进的大纲锚点列表。', icon: 'ph-list-numbers' },
        mediaLibraryPanel: { chinese: '媒体库网格', category: '业务组件', summary: '自适应多列图片和文件展示网格。', icon: 'ph-image-square' },
        revisionCompare: { chinese: '版本对比视图', category: '业务组件', summary: '并排对比的代码或文本差异展示布局。', icon: 'ph-git-diff' },
        publishScheduler: { chinese: '发布表单排版', category: '业务组件', summary: '包含原生 datetime-local 控件的清爽表单布局。', icon: 'ph-calendar-plus' },
        recordMetaPanel: { chinese: '元信息侧边栏', category: '业务组件', summary: '用于文章右侧的关键信息和操作按钮收纳区。', icon: 'ph-sidebar-simple' },
        queryToolbar: { chinese: '查询工具栏', category: '业务组件', summary: '响应式的内联表单搜索与下拉框组合。', icon: 'ph-magnifying-glass' },
        batchActions: { chinese: '批量操作栏', category: '业务组件', summary: '悬浮或固定在底部的操作动作条。', icon: 'ph-stack' },
        permissionMatrix: { chinese: '权限矩阵表格', category: '应用框架', summary: '原生 table 构建的二维权限复选矩阵。', icon: 'ph-grid-nine' },
        collectionFieldDesigner: { chinese: '字段设计列表', category: '应用框架', summary: '表单构建器中的字段行结构布局。', icon: 'ph-text-aa' },
        kanbanBoard: { chinese: '静态看板列', category: '数据展示', summary: '多列等宽排版的任务看板结构。', icon: 'ph-kanban' },
        approvalFlow: { chinese: '横向审批流', category: '应用框架', summary: '横向排列的状态节点时间线。', icon: 'ph-git-commit' },
        commentThread: { chinese: '嵌套评论区', category: '业务组件', summary: '用于文章底部的互动评论回复区。', icon: 'ph-chat-circle-dots' },
        navigationBuilder: { chinese: '导航构建排版', category: '应用框架', summary: '树状可拖拽项（静态示意）的行结构。', icon: 'ph-list-dashes' },
        dashboardStats: { chinese: '数据统计卡片', category: '数据展示', summary: '4 列响应式网格核心数据卡片。', icon: 'ph-chart-line-up' },
        auditTimeline: { chinese: '操作日志轴', category: '数据展示', summary: '紧凑型事件记录轴。', icon: 'ph-clock' },
        contentHeroTitle: { chinese: '内容主标题区块', category: '内容展示', summary: '适用于官网首屏的抢眼标题展示区块。', icon: 'ph-text-t' },
        contentLeadText: { chinese: '内容导读区块', category: '内容展示', summary: '双栏错落设计的文章引言或产品描述模块。', icon: 'ph-quotes' },
        contentSingleImage: { chinese: '单图展示区块', category: '内容展示', summary: '图片配底部文字说明的标准展示卡片。', icon: 'ph-image' },
        contentImageGrid: { chinese: '三图画廊区块', category: '内容展示', summary: '响应式三列等分图片网格，带图注。', icon: 'ph-images' },
        contentMediaSplit: { chinese: '图文左右分割区块', category: '内容展示', summary: '左图右文（或右图左文）的经典内容解析模块。', icon: 'ph-columns' },
        contentStatsBand: { chinese: '深色数据横幅区块', category: '内容展示', summary: '吸引眼球的企业数据成就展示条。', icon: 'ph-chart-bar' },
        contentLogoWall: { chinese: '客户 Logo 墙', category: '内容展示', summary: '等宽排列的品牌或赞助商展示矩阵。', icon: 'ph-buildings' },
        contentFaqStack: { chinese: '常见问题折叠组件', category: '内容展示', summary: '纯原生折叠或引入 Tabs 组件实现的问答区块。', icon: 'ph-question' },
        contentHonorCertificate: { chinese: '企业荣誉资质区块', category: '内容展示', summary: '专为展示企业荣誉、资质证书设计的错落排版模块，自带证书轮播与富文本介绍区。', icon: 'ph-certificate' },
    };

    const blocks = [
        {
            id: 'contentMediaSplit',
            variants: [
                {
                    name: 'Style 1：纯静态图文分割 (经典)',
                    template: `
<section class="grid gap-6 md:gap-8 rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center w-full shadow-sm min-w-0">
  <div class="aspect-[4/3] md:aspect-[5/4] rounded-[24px] bg-[linear-gradient(135deg,#e0e7ff,#f8fafc)] relative overflow-hidden group w-full h-full">
    <div class="absolute inset-0 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-700">
      <i class="ph ph-image text-5xl md:text-6xl opacity-30"></i>
    </div>
  </div>
  <div class="lg:pl-6 min-w-0">
    <div class="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 inline-flex px-2.5 py-1 rounded-md mb-3 sm:mb-4 border border-primary/10">Service Intro</div>
    <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">Prebuilt split layout for common enterprise sections.</h3>
    <p class="mt-3 sm:mt-5 text-sm sm:text-base leading-relaxed text-slate-600">
      Suitable for product capability, process explanation, manufacturing strength, and service introduction. Editors replace the image and a small set of text fields.
    </p>
    <div class="mt-5 sm:mt-6 grid gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-700 font-medium">
      <div class="flex items-center gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary shrink-0"><i class="ph ph-layout"></i></div>
        Preset pristine structure
      </div>
      <div class="flex items-center gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary shrink-0"><i class="ph ph-devices"></i></div>
        Native responsive layout
      </div>
    </div>
  </div>
</section>`
                },
                {
                    name: 'Style 2：动态轮播植入 (引入 Carousel 组件)',
                    template: `
<section class="grid gap-6 md:gap-8 rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center w-full shadow-sm min-w-0">
  <!-- 引入 JquanUI Carousel 组件，赋予自动轮播和指示器能力 -->
  <div jq-carousel data-carousel-autoplay="true" data-carousel-interval="3500" data-carousel-indicators="true" class="aspect-[4/3] md:aspect-[5/4] rounded-[24px] overflow-hidden relative w-full bg-slate-50 border border-slate-100 shadow-inner">
    <div jq-carousel-item class="w-full h-full flex items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] text-blue-400">
      <div class="text-center"><i class="ph ph-image text-6xl"></i><p class="mt-2 text-sm font-semibold">Slide 1</p></div>
    </div>
    <div jq-carousel-item class="w-full h-full flex items-center justify-center bg-[linear-gradient(135deg,#d1fae5,#ecfdf5)] text-emerald-400">
      <div class="text-center"><i class="ph ph-video-camera text-6xl"></i><p class="mt-2 text-sm font-semibold">Slide 2</p></div>
    </div>
    <div jq-carousel-item class="w-full h-full flex items-center justify-center bg-[linear-gradient(135deg,#fef3c7,#f8fafc)] text-amber-400">
      <div class="text-center"><i class="ph ph-cube text-6xl"></i><p class="mt-2 text-sm font-semibold">Slide 3</p></div>
    </div>
  </div>
  
  <div class="lg:pl-6 min-w-0">
    <div class="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 inline-flex px-2.5 py-1 rounded-md mb-3 sm:mb-4 border border-primary/10">Interactive Media</div>
    <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">Combine content with JS-driven blocks seamlessly.</h3>
    <p class="mt-3 sm:mt-5 text-sm sm:text-base leading-relaxed text-slate-600">
      This variant elegantly integrates the native <code>jq-carousel</code> component. When inserted into editors like UEditor Plus, as long as the core JS is loaded on the frontend, it will automatically initialize the slider without writing a single line of script.
    </p>
  </div>
</section>`
                }
            ]
        },
        {
            id: 'contentImageGrid',
            variants: [
                {
                    name: 'Style 1：三列等分网格',
                    template: `
<section class="grid gap-6 sm:gap-8 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 w-full shadow-sm min-w-0">
  <div class="text-center max-w-2xl mx-auto w-full px-4">
    <div class="inline-flex items-center justify-center mb-3">
      <div class="w-8 sm:w-12 h-px bg-slate-200"></div>
      <div class="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-primary mx-2 sm:mx-3 whitespace-nowrap">Project Gallery</div>
      <div class="w-8 sm:w-12 h-px bg-slate-200"></div>
    </div>
    <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Three-image layout for space & product.</h3>
  </div>
  
  <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full">
    <article class="grid gap-3 group cursor-pointer min-w-0">
      <div class="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative w-full">
        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
        <div class="flex h-full items-center justify-center text-slate-300"><i class="ph ph-image text-3xl"></i></div>
      </div>
      <div class="text-sm font-bold text-slate-800 px-1 flex items-center justify-between">
        <span class="truncate">Reception Area</span> <i class="ph ph-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-2"></i>
      </div>
    </article>
    
    <article class="grid gap-3 group cursor-pointer min-w-0">
      <div class="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative w-full">
        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
        <div class="flex h-full items-center justify-center text-slate-300"><i class="ph ph-image text-3xl"></i></div>
      </div>
      <div class="text-sm font-bold text-slate-800 px-1 flex items-center justify-between">
        <span class="truncate">Meeting Room</span> <i class="ph ph-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-2"></i>
      </div>
    </article>
    
    <!-- 第三张图完整恢复 -->
    <article class="grid gap-3 group cursor-pointer min-w-0">
      <div class="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative w-full">
        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
        <div class="flex h-full items-center justify-center text-slate-300"><i class="ph ph-image text-3xl"></i></div>
      </div>
      <div class="text-sm font-bold text-slate-800 px-1 flex items-center justify-between">
        <span class="truncate">Delivery Area</span> <i class="ph ph-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-2"></i>
      </div>
    </article>
  </div>
</section>`
                },
                {
                    name: 'Style 2：便当盒 (Bento Box) 错落网格',
                    template: `
<section class="grid gap-6 sm:gap-8 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 w-full shadow-sm min-w-0">
  <div class="text-center max-w-2xl mx-auto w-full px-4">
    <div class="inline-flex items-center justify-center mb-3">
      <div class="w-8 sm:w-12 h-px bg-slate-200"></div>
      <div class="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-primary mx-2 sm:mx-3 whitespace-nowrap">Bento Box Design</div>
      <div class="w-8 sm:w-12 h-px bg-slate-200"></div>
    </div>
    <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Asymmetric grid for visual impact.</h3>
  </div>
  
  <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full">
    <article class="grid gap-3 group cursor-pointer min-w-0">
      <div class="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative w-full">
        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
        <div class="flex h-full items-center justify-center text-slate-300"><i class="ph ph-image text-3xl"></i></div>
      </div>
      <div class="text-sm font-bold text-slate-800 px-1 flex items-center justify-between">
        <span class="truncate">Lobby Area</span> <i class="ph ph-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-2"></i>
      </div>
    </article>
    
    <article class="grid gap-3 group cursor-pointer min-w-0">
      <div class="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative w-full">
        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
        <div class="flex h-full items-center justify-center text-slate-300"><i class="ph ph-image text-3xl"></i></div>
      </div>
      <div class="text-sm font-bold text-slate-800 px-1 flex items-center justify-between">
        <span class="truncate">Workspace</span> <i class="ph ph-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-2"></i>
      </div>
    </article>
    
    <!-- 关键排版：在 md 及以上屏幕横跨 3 列，在 sm 跨 2 列 -->
    <article class="grid gap-3 group cursor-pointer min-w-0 sm:col-span-2 md:col-span-3">
      <div class="aspect-[16/9] md:aspect-[21/7] rounded-2xl bg-slate-100 overflow-hidden relative w-full">
        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
        <div class="flex h-full items-center justify-center text-slate-300"><i class="ph ph-image text-4xl"></i></div>
      </div>
      <div class="text-sm font-bold text-slate-800 px-1 flex items-center justify-between">
        <span class="truncate">Panoramic View of the Facility</span> <i class="ph ph-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 shrink-0 ml-2"></i>
      </div>
    </article>
  </div>
</section>`
                }
            ]
        },
        {
            id: 'contentFaqStack',
            variants: [
                {
                    name: 'Style 1：原生 Details 标签折叠 (零 JS)',
                    template: `
<section class="grid gap-6 sm:gap-8 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 w-full shadow-sm min-w-0">
  <div class="text-center w-full px-4">
    <div class="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-primary mb-2 truncate">Knowledge Base</div>
    <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Frequently Asked Questions</h3>
  </div>
  
  <div class="grid gap-3 sm:gap-4 max-w-3xl mx-auto w-full">
    <details class="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden [&_summary::-webkit-details-marker]:hidden min-w-0" open>
      <summary class="flex justify-between items-center text-sm sm:text-base font-semibold text-slate-800 p-4 sm:p-5 cursor-pointer list-none hover:bg-slate-100 transition-colors gap-4">
        <span class="text-left">Can this module be inserted into an editor?</span>
        <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
          <i class="ph ph-caret-down transition-transform duration-300 group-open:rotate-180 text-primary text-xs sm:text-sm"></i>
        </div>
      </summary>
      <div class="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-slate-600 bg-white border-t border-slate-100 break-words">
        Yes! This block is implemented using pure HTML5 <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code> tags. It requires absolutely ZERO JavaScript to achieve this smooth accordion effect. Perfect for UEditor Plus.
      </div>
    </details>
    
    <details class="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden [&_summary::-webkit-details-marker]:hidden min-w-0">
      <summary class="flex justify-between items-center text-sm sm:text-base font-semibold text-slate-800 p-4 sm:p-5 cursor-pointer list-none hover:bg-slate-100 transition-colors gap-4">
        <span class="text-left">Does the layout already include spacing and typography?</span>
        <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
          <i class="ph ph-caret-down transition-transform duration-300 group-open:rotate-180 text-primary text-xs sm:text-sm"></i>
        </div>
      </summary>
      <div class="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-slate-600 bg-white border-t border-slate-100 break-words">
        Absolutely. Tailwind CSS utility classes are baked right into the DOM structure. When an editor inserts this block, all paddings, margins, colors, and responsive rules are immediately applied natively.
      </div>
    </details>
  </div>
</section>`
                },
                {
                    name: 'Style 2：选项卡解答 (引入 Tabs 组件)',
                    template: `
<section class="grid gap-6 sm:gap-8 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 w-full shadow-sm min-w-0">
  <div class="text-center w-full px-4 mb-2">
    <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Help Center</h3>
    <p class="text-sm text-slate-500 mt-2">Find answers quickly using tabbed navigation.</p>
  </div>
  
  <!-- 引入 JquanUI Tabs 组件，赋予淡入淡出的选项卡切换能力 -->
  <div jq-tabs class="w-full max-w-3xl mx-auto" data-tabs-mode="fade">
    <div jq-tab-list class="flex gap-2 sm:gap-4 border-b border-slate-200 overflow-x-auto custom-scrollbar px-2 sm:px-0">
      <button jq-tab class="px-3 sm:px-4 py-3 text-sm font-medium text-slate-500 hover:text-primary border-b-2 border-transparent is-active:border-primary is-active:text-primary transition-colors whitespace-nowrap">General Info</button>
      <button jq-tab class="px-3 sm:px-4 py-3 text-sm font-medium text-slate-500 hover:text-primary border-b-2 border-transparent is-active:border-primary is-active:text-primary transition-colors whitespace-nowrap">Billing & Pricing</button>
      <button jq-tab class="px-3 sm:px-4 py-3 text-sm font-medium text-slate-500 hover:text-primary border-b-2 border-transparent is-active:border-primary is-active:text-primary transition-colors whitespace-nowrap">Technical Support</button>
    </div>
    
    <div jq-tab-content class="pt-6 min-h-[160px] px-2 sm:px-0">
      <!-- 面板 1 -->
      <div jq-tab-panel class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h4 class="font-bold text-slate-800 mb-2">What is this component?</h4>
        <p>This is a native implementation of the jq-tabs component applied to a FAQ section. It allows users to switch contexts seamlessly without vertical page jumps, keeping the layout compact and focused.</p>
      </div>
      <!-- 面板 2 -->
      <div jq-tab-panel class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 hidden">
        <h4 class="font-bold text-slate-800 mb-2">How much does it cost?</h4>
        <p>The billing panel content goes here. The JavaScript engine handles the fade transition automatically, ensuring a smooth user experience. You can drop this entire block into your UEditor Plus HTML source.</p>
      </div>
      <!-- 面板 3 -->
      <div jq-tab-panel class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 hidden">
        <h4 class="font-bold text-slate-800 mb-2">Need API integration?</h4>
        <p>Our technical support is available 24/7. This tab demonstrates how multiple panels coexist perfectly inside a single isolated UI block component.</p>
      </div>
    </div>
  </div>
</section>`
                }
            ]
        },
        {
            id: 'contentHeroTitle',
            variants: [
                {
                    name: 'Style 1：渐变左对齐 (经典版)',
                    template: `
<section class="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eef2ff_0%,#ffffff_42%,#f8fafc_100%)] p-6 sm:p-8 md:p-12 w-full min-w-0">
  <div class="max-w-3xl mx-auto sm:mx-0">
    <div class="inline-flex items-center rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-sm shadow-sm">
      Enterprise Website
    </div>
    <h2 class="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] sm:leading-[1.1]">
      Build trust with structured, <br class="hidden sm:block">polished content blocks.
    </h2>
    <p class="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-600">
      Use preset heading styles instead of writing custom HTML in the editor. Editors only need to replace text and links to maintain perfect brand consistency.
    </p>
    <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
      <a href="#" class="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 w-full sm:w-auto">Contact Us</a>
      <a href="#" class="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5 w-full sm:w-auto">Download Profile</a>
    </div>
  </div>
</section>`
                },
                {
                    name: 'Style 2：现代居中对齐 (视觉焦点)',
                    template: `
<section class="rounded-[28px] border border-slate-200 bg-slate-50 relative overflow-hidden p-8 md:p-16 w-full min-w-0 flex flex-col items-center text-center">
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
  <div class="relative z-10 max-w-4xl flex flex-col items-center">
    <div class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
      <span class="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span> v2.0 Released
    </div>
    <h2 class="mt-8 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
      Ship your website <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">faster than ever</span>.
    </h2>
    <p class="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-500">
      Stop wrestling with inline styles and messy divs. Just pick a block, modify the text, and let the beautifully crafted CSS handle the rest.
    </p>
    <div class="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <button class="bg-slate-900 text-white rounded-full px-8 py-3.5 font-semibold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1">Get Started</button>
      <button class="bg-white border border-slate-200 text-slate-700 rounded-full px-8 py-3.5 font-semibold shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all hover:-translate-y-1">View Documentation</button>
    </div>
  </div>
</section>`
                }
            ]
        },
        {
            id: 'commentThread',
            variants: [
                {
                    name: 'Style 1：传统边框缩进 (论坛风格)',
                    template: `
<div class="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 w-full max-w-2xl shadow-sm min-w-0">
  <h3 class="font-bold text-lg text-slate-800 mb-6">Discussion (Border Style)</h3>
  <div class="space-y-6">
    <div class="flex gap-3 md:gap-4 w-full">
      <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 text-sm md:text-base">R</div>
      <div class="flex-1 min-w-0">
        <div class="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none min-w-0">
          <div class="flex justify-between items-center mb-2 gap-2">
            <span class="font-semibold text-sm text-slate-800 truncate">Reviewer</span>
            <span class="text-[11px] text-slate-400 shrink-0">09:40</span>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">The summary needs one more sentence to explain the CSS architecture.</p>
        </div>
        <div class="flex gap-3 mt-4 w-full border-l-2 border-slate-100 pl-3 md:pl-4">
          <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs md:text-sm shrink-0">E</div>
          <div class="flex-1 min-w-0">
            <div class="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none min-w-0">
              <div class="flex justify-between items-center mb-1 gap-2">
                <span class="font-semibold text-sm text-slate-800 truncate">Editor</span>
                <span class="text-[11px] text-slate-400 shrink-0">09:52</span>
              </div>
              <p class="text-sm text-slate-600">Updated the summary and re-saved the block.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
                },
                {
                    name: 'Style 2：社交气泡对话 (现代风格)',
                    template: `
<div class="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-6 w-full max-w-2xl shadow-sm min-w-0">
  <h3 class="font-bold text-lg text-slate-800 mb-6 text-center">Chat Layout</h3>
  <div class="space-y-6 flex flex-col">
    <div class="flex gap-3 self-start max-w-[90%] md:max-w-[85%]">
      <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0 text-xs mt-auto">R</div>
      <div>
        <span class="text-[10px] text-slate-400 ml-1 mb-1 block">Reviewer · 09:40</span>
        <div class="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm shadow-sm text-sm text-slate-700 leading-relaxed">
          Can we make this look more like a modern chat app?
        </div>
      </div>
    </div>
    <div class="flex gap-3 self-end max-w-[90%] md:max-w-[85%] flex-row-reverse">
      <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 text-xs mt-auto">E</div>
      <div class="flex flex-col items-end">
        <span class="text-[10px] text-slate-400 mr-1 mb-1 block">09:52 · Editor</span>
        <div class="bg-primary p-3 rounded-2xl rounded-br-sm shadow-sm text-sm text-white leading-relaxed">
          Sure thing! I just applied the Tailwind flex-row-reverse magic and background colors. How does this look?
        </div>
      </div>
    </div>
  </div>
</div>`
                }
            ]
        },
        {
            id: 'taskInbox',
            variants: [
                {
                    name: '默认样式',
                    template: `
<div class="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-sm min-w-0">
  <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
    <h3 class="font-semibold text-slate-800">Task Inbox</h3>
    <span class="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">2 Pending</span>
  </div>
  <div class="divide-y divide-slate-100">
    <label class="p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
      <div class="mt-0.5"><input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"></div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-slate-800 truncate">Review homepage draft</h4>
        <p class="text-xs text-slate-500 mt-1 truncate">Content · Today 14:00</p>
        <p class="text-sm text-slate-600 mt-2 line-clamp-2">Check copy and SEO summary before publishing.</p>
      </div>
    </label>
    <label class="p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
      <div class="mt-0.5"><input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"></div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-slate-800 truncate">Approve media assets</h4>
        <p class="text-xs text-slate-500 mt-1 truncate">Design · Yesterday</p>
        <p class="text-sm text-slate-600 mt-2 line-clamp-2">Validate campaign banner exports.</p>
      </div>
    </label>
  </div>
</div>`
                }
            ]
        },
        {
            id: 'notificationCenterPanel',
            variants: [
                {
                    name: '默认样式',
                    template: `
<div class="relative inline-block text-left group z-50">
  <button type="button" class="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none relative">
    <i class="ph ph-bell text-xl"></i>
    <span class="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
  </button>
  <div class="absolute right-0 mt-2 w-72 sm:w-80 origin-top-right rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
    <div class="p-4 border-b border-slate-100 flex justify-between items-center">
      <span class="font-semibold text-slate-800">Notifications</span>
      <a href="#" class="text-xs text-primary hover:underline">Mark all read</a>
    </div>
    <div class="divide-y divide-slate-100 max-h-96 overflow-y-auto custom-scrollbar">
      <a href="#" class="flex gap-3 p-4 hover:bg-slate-50 transition-colors bg-primary/5">
        <div class="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></div>
        <div class="min-w-0">
          <p class="text-sm text-slate-800 font-medium truncate">Workflow updated</p>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">Approval flow has been changed for editors. Please review the new rules.</p>
          <p class="text-[11px] text-slate-400 mt-2">Just now</p>
        </div>
      </a>
      <a href="#" class="flex gap-3 p-4 hover:bg-slate-50 transition-colors">
        <div class="w-2 h-2 bg-transparent rounded-full mt-1.5 shrink-0"></div>
        <div class="min-w-0">
          <p class="text-sm text-slate-700 truncate">New comment on <span class="font-medium text-slate-900">Homepage v2</span></p>
          <p class="text-[11px] text-slate-400 mt-2">10 mins ago</p>
        </div>
      </a>
    </div>
  </div>
</div>`
                }
            ]
        },
        {
            id: 'workspaceSwitcher',
            variants: [{
                name: '默认样式',
                template: `
<div class="relative inline-block text-left group z-50">
  <button type="button" class="inline-flex w-56 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none">
    <div class="flex items-center gap-2 min-w-0">
      <div class="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">M</div>
      <span class="truncate">Marketing Site</span>
    </div>
    <i class="ph ph-caret-up-down text-slate-400 text-xs shrink-0 ml-2"></i>
  </button>
  <div class="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 p-1.5">
    <div class="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Production</div>
    <a href="#" class="flex items-center justify-between px-2 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">M</div>
        <span class="truncate">Marketing Site</span>
      </div>
      <i class="ph ph-check text-primary shrink-0 ml-2"></i>
    </a>
    <div class="my-1.5 border-t border-slate-100"></div>
    <div class="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Staging</div>
    <a href="#" class="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
      <div class="w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">D</div>
      <span class="truncate">Docs Workspace</span>
    </a>
  </div>
</div>`
            }]
        },
        {
            id: 'recentActivityFeed',
            variants: [{
                name: '默认样式',
                template: `
<div class="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-w-0">
  <h3 class="font-semibold text-slate-800 mb-6 text-lg">Recent Activity</h3>
  <div class="relative pl-3 border-l-2 border-slate-100 space-y-8">
    <div class="relative">
      <div class="absolute -left-[17px] top-1 w-3 h-3 bg-white border-2 border-primary rounded-full"></div>
      <p class="text-sm font-medium text-slate-800 flex items-center justify-between flex-wrap gap-2">
        <span class="truncate">Homepage published</span>
        <span class="text-[11px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shrink-0">Content</span>
      </p>
      <p class="text-xs text-slate-500 mt-1">2 mins ago by <span class="font-medium text-slate-700">Jquan</span></p>
      <div class="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
        The marketing landing page was pushed to production successfully.
      </div>
    </div>
    <div class="relative">
      <div class="absolute -left-[17px] top-1 w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
      <p class="text-sm font-medium text-slate-800 flex items-center justify-between flex-wrap gap-2">
        <span class="truncate">Role updated</span>
        <span class="text-[11px] font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shrink-0">System</span>
      </p>
      <p class="text-xs text-slate-500 mt-1">10 mins ago by <span class="font-medium text-slate-700">System</span></p>
      <p class="text-sm text-slate-600 mt-2 leading-relaxed">Editor role now includes review permission for Media Library.</p>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'quickActionLauncher',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-lg overflow-hidden min-w-0">
  <div class="p-3 border-b border-slate-100 flex items-center gap-3">
    <i class="ph ph-magnifying-glass text-slate-400 text-lg ml-2 shrink-0"></i>
    <input type="text" placeholder="Type a command or search..." class="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-800 text-sm h-10 placeholder-slate-400">
    <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 shrink-0">ESC</span>
  </div>
  <div class="p-2 space-y-1">
    <div class="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggestions</div>
    <a href="#" class="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary transition-colors">
      <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary shrink-0"><i class="ph ph-file-plus"></i></div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">Create Post</div>
        <div class="text-xs opacity-80 mt-0.5 truncate">Open editor and start a new draft.</div>
      </div>
      <i class="ph ph-arrow-right shrink-0 ml-2"></i>
    </a>
    <a href="#" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors group">
      <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors shrink-0"><i class="ph ph-image"></i></div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">Open Assets</div>
        <div class="text-xs text-slate-500 mt-0.5 truncate">Jump to the media workspace.</div>
      </div>
    </a>
  </div>
</div>`
            }]
        },
        {
            id: 'siteLocaleSwitcher',
            variants: [{
                name: '默认样式',
                template: `
<div class="relative inline-block text-left group z-50">
  <button type="button" class="inline-flex items-center gap-2 justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none">
    <i class="ph ph-globe text-slate-400 text-lg shrink-0"></i>
    <span class="truncate">简体中文</span>
    <i class="ph ph-caret-down text-slate-400 text-[10px] ml-1 shrink-0 transition-transform group-hover:rotate-180"></i>
  </button>
  <div class="absolute left-0 mt-2 w-44 origin-top-left rounded-xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
    <div class="p-1.5 grid gap-1">
      <a href="#" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary">
        <span class="text-base leading-none shrink-0">🇨🇳</span> 
        <span class="truncate">简体中文</span>
      </a>
      <a href="#" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
        <span class="text-base leading-none shrink-0">🇺🇸</span> 
        <span class="truncate">English (US)</span>
      </a>
      <a href="#" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
        <span class="text-base leading-none shrink-0">🇯🇵</span> 
        <span class="truncate">日本語</span>
      </a>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'reviewQueuePanel',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-sm overflow-hidden min-w-0">
  <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
    <h3 class="font-semibold text-slate-800">Review Queue</h3>
    <span class="text-xs text-slate-500 shrink-0">2 Items</span>
  </div>
  <div class="p-4 grid gap-4">
    <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm min-w-0">
      <div class="flex justify-between items-start gap-4">
        <div class="min-w-0">
            <h4 class="text-sm font-semibold text-slate-800 truncate">Homepage release summary</h4>
            <span class="inline-flex mt-2 items-center rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning ring-1 ring-inset ring-warning/20">Pending Review</span>
        </div>
        <span class="text-xs text-slate-400 shrink-0">Content · P1</span>
      </div>
      <p class="text-sm text-slate-600 mt-3 border-l-2 border-slate-200 pl-3 leading-relaxed break-words">Check the final summary before publish. Make sure SEO tags are valid.</p>
      <div class="mt-4 flex gap-2 w-full">
        <button class="flex-1 bg-primary text-white text-sm font-medium h-9 rounded-lg hover:bg-primary/90 transition-colors min-w-0 truncate">Approve</button>
        <button class="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-medium h-9 rounded-lg hover:bg-slate-50 transition-colors min-w-0 truncate">Reject</button>
      </div>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'assetFolderTree',
            variants: [{
                name: '默认样式',
                template: `
<aside class="w-72 max-w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm select-none overflow-x-auto custom-scrollbar">
  <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 truncate">Media Library</div>
  <ul class="space-y-0.5 min-w-max">
    <li>
      <details class="group" open>
        <summary class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <i class="ph ph-caret-right transition-transform group-open:rotate-90 text-slate-400 text-xs shrink-0"></i>
          <i class="ph ph-folder-open text-primary group-open:block hidden shrink-0"></i>
          <i class="ph ph-folder text-slate-400 group-open:hidden block shrink-0"></i>
          <span class="text-sm font-medium text-slate-700 flex-1 truncate pr-4">All Assets</span>
          <span class="text-[10px] text-slate-400 shrink-0">240</span>
        </summary>
        <ul class="pl-6 mt-0.5 space-y-0.5 relative before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-px before:bg-slate-100">
          <li>
            <details class="group" open>
              <summary class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <i class="ph ph-caret-right transition-transform group-open:rotate-90 text-slate-400 text-xs shrink-0"></i>
                <i class="ph ph-folder text-slate-400 shrink-0"></i>
                <span class="text-sm font-medium text-slate-700 flex-1 truncate pr-4">Images</span>
                <span class="text-[10px] text-slate-400 shrink-0">120</span>
              </summary>
              <ul class="pl-6 mt-0.5 space-y-0.5 relative before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-px before:bg-slate-100 overflow-hidden">
                <li><a href="#" class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600"><i class="ph ph-folder text-slate-400 shrink-0"></i> <span class="truncate">Campaign</span></a></li>
                <li><a href="#" class="flex items-center gap-2 px-2 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"><i class="ph ph-folder-open shrink-0"></i> <span class="truncate">Homepage</span></a></li>
              </ul>
            </details>
          </li>
          <li><a href="#" class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 pl-6"><i class="ph ph-folder text-slate-400 shrink-0"></i> <span class="truncate">Videos</span></a></li>
        </ul>
      </details>
    </li>
  </ul>
</aside>`
            }]
        },
        {
            id: 'dataFilterPresetBar',
            variants: [{
                name: '默认样式',
                template: `
<div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl w-full max-w-fit overflow-x-auto custom-scrollbar">
  <button type="button" class="px-4 py-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-sm font-medium text-slate-800 shrink-0">All Items</button>
  <button type="button" class="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0">Pending Review</button>
  <button type="button" class="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0">Published</button>
  <div class="w-px h-4 bg-slate-300 mx-1 shrink-0"></div>
  <button type="button" class="px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 shrink-0">
    <i class="ph ph-plus"></i> Custom
  </button>
</div>`
            }]
        },
        {
            id: 'roleMemberAssigner',
            variants: [{
                name: '默认样式',
                template: `
<div class="border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col md:flex-row overflow-hidden max-w-3xl w-full min-w-0">
  <div class="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Roles</h4>
    <div class="space-y-1">
      <button class="w-full text-left px-3 py-2.5 rounded-xl bg-white shadow-sm border border-primary/30 text-primary text-sm font-semibold flex justify-between items-center min-w-0">
        <span class="truncate pr-2">Editor</span>
        <i class="ph ph-check-circle text-lg shrink-0"></i>
      </button>
      <button class="w-full text-left px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors truncate">Administrator</button>
      <button class="w-full text-left px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors truncate">Reviewer</button>
    </div>
  </div>
  <div class="w-full md:w-2/3 p-4 min-w-0">
    <div class="flex justify-between items-center mb-4 gap-4">
      <h4 class="text-sm font-semibold text-slate-800 truncate">Assigned Members</h4>
      <div class="relative shrink-0">
        <i class="ph ph-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input type="text" placeholder="Search..." class="h-8 pl-8 pr-3 w-32 sm:w-40 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary">
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label class="flex items-center gap-3 p-3 border border-primary/30 bg-primary/5 rounded-xl cursor-pointer">
        <input type="checkbox" checked class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary shrink-0">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-slate-800 truncate">Jquan</div>
          <div class="text-[11px] text-slate-500 truncate">Content Lead</div>
        </div>
      </label>
      <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
        <input type="checkbox" class="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary shrink-0">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-slate-800 truncate">Lina</div>
          <div class="text-[11px] text-slate-500 truncate">Ops</div>
        </div>
      </label>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'contentOutlinePanel',
            variants: [{
                name: '默认样式',
                template: `
<aside class="w-64 max-w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
  <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">On this page</h4>
  <div class="border-l-2 border-slate-100 pl-4 space-y-3 relative">
    <a href="#" class="block text-sm text-slate-500 hover:text-slate-800 transition-colors truncate">Introduction</a>
    <div class="relative">
      <div class="absolute -left-[17px] top-0 bottom-0 w-0.5 bg-primary"></div>
      <a href="#" class="block text-sm font-semibold text-primary truncate">Layout Strategy</a>
      <div class="pl-4 mt-2 space-y-2">
        <a href="#" class="block text-sm text-slate-500 hover:text-slate-800 transition-colors truncate">Grid Structure</a>
        <a href="#" class="block text-sm text-slate-500 hover:text-slate-800 transition-colors truncate">Responsive Rules</a>
      </div>
    </div>
    <a href="#" class="block text-sm text-slate-500 hover:text-slate-800 transition-colors truncate">API Notes</a>
  </div>
</aside>`
            }]
        },
        {
            id: 'mediaLibraryPanel',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-4xl shadow-sm min-w-0">
  <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
    <h3 class="font-bold text-lg text-slate-800">Media Library</h3>
    <button class="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
      <i class="ph ph-upload-simple mr-1"></i> Upload
    </button>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
    <div class="group relative rounded-2xl overflow-hidden border-2 border-primary ring-4 ring-primary/20 cursor-pointer min-w-0">
      <div class="aspect-[4/3] bg-slate-100 flex items-center justify-center relative">
        <i class="ph ph-image text-4xl text-slate-300"></i>
        <div class="absolute top-2 left-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
          <i class="ph ph-check text-xs font-bold"></i>
        </div>
      </div>
      <div class="p-3 bg-white border-t border-slate-100">
        <p class="text-xs font-medium text-slate-800 truncate">hero-banner.jpg</p>
        <p class="text-[10px] text-slate-400 mt-1">1.2 MB</p>
      </div>
    </div>
    <div class="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer min-w-0">
      <div class="aspect-[4/3] bg-slate-50 flex items-center justify-center">
        <i class="ph ph-video-camera text-4xl text-slate-300"></i>
      </div>
      <div class="p-3 bg-white border-t border-slate-100">
        <p class="text-xs font-medium text-slate-800 truncate">product-teaser.mp4</p>
        <p class="text-[10px] text-slate-400 mt-1">8.5 MB</p>
      </div>
    </div>
    <div class="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer min-w-0">
      <div class="aspect-[4/3] bg-slate-50 flex items-center justify-center">
        <i class="ph ph-file-pdf text-4xl text-slate-300"></i>
      </div>
      <div class="p-3 bg-white border-t border-slate-100">
        <p class="text-xs font-medium text-slate-800 truncate">pricing-sheet.pdf</p>
        <p class="text-[10px] text-slate-400 mt-1">420 KB</p>
      </div>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'revisionCompare',
            variants: [{
                name: '默认样式',
                template: `
<div class="border border-slate-200 rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full shadow-sm bg-white min-w-0">
  <div class="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-slate-200">
    <div class="p-3 text-sm font-medium text-slate-600 bg-slate-50 border-b border-slate-200 shrink-0">Original (v1.0)</div>
    <div class="p-4 bg-danger/5 text-danger font-mono text-xs md:text-sm whitespace-pre-wrap break-all leading-relaxed overflow-x-auto h-full">
- Title: JquanUI Admin Blocks
- Status: Review
- Summary: Basic block page.
    </div>
  </div>
  <div class="flex-1 flex flex-col min-w-0">
    <div class="p-3 text-sm font-medium text-slate-800 bg-slate-50 border-b border-slate-200 shrink-0">Modified (v1.1)</div>
    <div class="p-4 bg-success/5 text-success font-mono text-xs md:text-sm whitespace-pre-wrap break-all leading-relaxed overflow-x-auto h-full">
+ Title: JquanUI Admin Blocks
+ Status: Published
+ Summary: Full block gallery with pure static HTML outputs.
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'publishScheduler',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-sm min-w-0">
  <h3 class="font-semibold text-slate-800 mb-5">Publish Settings</h3>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
      <select class="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
        <option value="draft">Draft</option>
        <option value="scheduled" selected>Scheduled</option>
        <option value="published">Published</option>
      </select>
    </div>
    <div>
      <label class="block text-xs font-medium text-slate-700 mb-1.5">Publish Date & Time</label>
      <input type="datetime-local" value="2026-05-22T09:00" class="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
    </div>
    <div class="pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
      <button type="button" class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
      <button type="button" class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">Save Schedule</button>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'recordMetaPanel',
            variants: [{
                name: '默认样式',
                template: `
<aside class="w-72 max-w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-sm min-w-0">
  <div class="flex items-center justify-between mb-6 gap-4">
    <h3 class="font-bold text-slate-800 truncate">Article Meta</h3>
    <span class="bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-success/20 shrink-0">Published</span>
  </div>
  <div class="space-y-4 mb-6">
    <div class="flex justify-between items-center text-sm gap-4">
      <span class="text-slate-500 shrink-0">Author</span>
      <span class="font-medium text-slate-800 truncate">Jquan</span>
    </div>
    <div class="flex justify-between items-center text-sm gap-4">
      <span class="text-slate-500 shrink-0">Published</span>
      <span class="font-medium text-slate-800 shrink-0">2026-05-21</span>
    </div>
    <div class="flex justify-between items-center text-sm gap-4">
      <span class="text-slate-500 shrink-0">Slug</span>
      <span class="font-mono text-[11px] sm:text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate min-w-0">/blocks-meta</span>
    </div>
  </div>
  <div class="border-t border-slate-100 pt-4 mb-6 grid grid-cols-3 gap-2 text-center">
    <div class="min-w-0">
      <div class="text-lg font-bold text-slate-800 truncate">18k</div>
      <div class="text-[10px] text-slate-400 mt-1 uppercase truncate">Views</div>
    </div>
    <div class="min-w-0">
      <div class="text-lg font-bold text-slate-800 truncate">522</div>
      <div class="text-[10px] text-slate-400 mt-1 uppercase truncate">Likes</div>
    </div>
    <div class="min-w-0">
      <div class="text-lg font-bold text-slate-800 truncate">104</div>
      <div class="text-[10px] text-slate-400 mt-1 uppercase truncate">Shares</div>
    </div>
  </div>
  <div class="flex flex-col gap-2 w-full">
    <button class="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors truncate">Preview Changes</button>
    <button class="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-colors truncate">Update Post</button>
  </div>
</aside>`
            }]
        },
        {
            id: 'queryToolbar',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full min-w-0 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
  <div class="relative flex-1 min-w-[200px]">
    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
    <input type="text" placeholder="Search by title, author or ID..." class="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
  </div>
  <div class="flex flex-wrap md:flex-nowrap items-center gap-2">
    <select class="flex-1 md:w-32 h-10 px-2 text-sm rounded-xl border border-slate-200 outline-none bg-white text-slate-700">
      <option>All Status</option>
      <option>Published</option>
      <option>Draft</option>
    </select>
    <select class="flex-1 md:w-36 h-10 px-2 text-sm rounded-xl border border-slate-200 outline-none bg-white text-slate-700">
      <option>Newest First</option>
      <option>Oldest First</option>
      <option>Most Views</option>
    </select>
    <div class="hidden md:block w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
    <button class="w-full md:w-auto h-10 px-5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors shrink-0">Filter</button>
  </div>
</div>`
            }]
        },
        {
            id: 'batchActions',
            variants: [{
                name: '默认样式',
                template: `
<div class="flex items-center justify-center w-full min-w-0 pb-4">
  <div class="flex items-center gap-3 sm:gap-4 bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 rounded-full shadow-2xl overflow-x-auto max-w-full custom-scrollbar">
    <div class="flex items-center gap-2 border-r border-white/20 pr-3 sm:pr-4 shrink-0">
      <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">3</div>
      <span class="text-xs sm:text-sm font-medium hidden sm:inline whitespace-nowrap">items selected</span>
    </div>
    <div class="flex items-center gap-1 sm:gap-2 shrink-0">
      <button class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors">Publish</button>
      <button class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors">Move</button>
      <button class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-danger hover:bg-danger/10 transition-colors flex items-center gap-1">
        <i class="ph ph-trash"></i> Delete
      </button>
    </div>
    <button class="ml-1 sm:ml-2 p-1 sm:p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0">
      <i class="ph ph-x"></i>
    </button>
  </div>
</div>`
            }]
        },
        {
            id: 'permissionMatrix',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar w-full max-w-3xl min-w-0">
  <table class="w-full min-w-[500px] text-left border-collapse">
    <thead>
      <tr class="bg-slate-50 border-b border-slate-200">
        <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Resource</th>
        <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">View</th>
        <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Create</th>
        <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Update</th>
        <th class="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Delete</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4 text-sm font-medium text-slate-800 whitespace-nowrap">Posts</td>
        <td class="py-3 px-4 text-center"><input type="checkbox" checked class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" checked class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" checked class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" class="w-4 h-4 rounded text-primary border-slate-300"></td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4 text-sm font-medium text-slate-800 whitespace-nowrap">Media</td>
        <td class="py-3 px-4 text-center"><input type="checkbox" checked class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" checked class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" class="w-4 h-4 rounded text-primary border-slate-300"></td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4 text-sm font-medium text-slate-800 whitespace-nowrap">Settings</td>
        <td class="py-3 px-4 text-center"><input type="checkbox" checked class="w-4 h-4 rounded text-primary border-slate-300"></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" class="w-4 h-4 rounded text-primary border-slate-300" disabled></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" class="w-4 h-4 rounded text-primary border-slate-300" disabled></td>
        <td class="py-3 px-4 text-center"><input type="checkbox" class="w-4 h-4 rounded text-primary border-slate-300" disabled></td>
      </tr>
    </tbody>
  </table>
</div>`
            }]
        },
        {
            id: 'collectionFieldDesigner',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-2xl p-4 min-w-0">
  <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 gap-4">
    <h3 class="font-semibold text-slate-800 truncate">Schema Fields</h3>
    <button class="text-sm text-primary font-medium flex items-center gap-1 hover:underline shrink-0"><i class="ph ph-plus"></i> Add Field</button>
  </div>
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl group cursor-move min-w-0">
      <div class="flex justify-between sm:w-auto w-full shrink-0">
        <i class="ph ph-dots-six-vertical text-slate-400"></i>
        <button class="sm:hidden text-slate-400 hover:text-danger"><i class="ph ph-trash"></i></button>
      </div>
      <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full min-w-0">
        <input type="text" value="title" class="w-full text-sm bg-white border border-slate-200 rounded-lg h-9 px-2 outline-none focus:border-primary min-w-0">
        <select class="w-full text-sm bg-white border border-slate-200 rounded-lg h-9 px-2 outline-none min-w-0">
          <option selected>Short Text</option>
          <option>Long Text</option>
        </select>
        <div class="flex items-center gap-2 min-w-0">
          <label class="flex items-center gap-1.5 text-xs text-slate-600 truncate"><input type="checkbox" checked class="rounded text-primary focus:ring-0 shrink-0"> Required</label>
        </div>
      </div>
      <button class="hidden sm:block text-slate-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-all shrink-0"><i class="ph ph-trash"></i></button>
    </div>
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl group cursor-move min-w-0">
      <div class="flex justify-between sm:w-auto w-full shrink-0">
        <i class="ph ph-dots-six-vertical text-slate-400"></i>
        <button class="sm:hidden text-slate-400 hover:text-danger"><i class="ph ph-trash"></i></button>
      </div>
      <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full min-w-0">
        <input type="text" value="summary" class="w-full text-sm bg-white border border-slate-200 rounded-lg h-9 px-2 outline-none focus:border-primary min-w-0">
        <select class="w-full text-sm bg-white border border-slate-200 rounded-lg h-9 px-2 outline-none min-w-0">
          <option>Short Text</option>
          <option selected>Long Text</option>
        </select>
        <div class="flex items-center gap-2 min-w-0">
          <label class="flex items-center gap-1.5 text-xs text-slate-600 truncate"><input type="checkbox" class="rounded text-primary focus:ring-0 shrink-0"> Required</label>
        </div>
      </div>
      <button class="hidden sm:block text-slate-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-all shrink-0"><i class="ph ph-trash"></i></button>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'kanbanBoard',
            variants: [{
                name: '默认样式',
                template: `
<div class="flex gap-4 sm:gap-6 w-full max-w-full h-[500px] overflow-hidden">
  <!-- Column 1 -->
  <div class="flex-shrink-0 w-72 sm:w-80 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col h-full min-w-0">
    <div class="p-4 flex items-center justify-between font-semibold text-slate-700 shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-slate-400"></div> Todo
      </div>
      <span class="bg-white border border-slate-200 text-xs px-2 py-0.5 rounded-full shadow-sm">1</span>
    </div>
    <div class="p-3 pt-0 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
      <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-sm cursor-grab hover:border-slate-300 transition-colors">
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wide">Design</span>
          <i class="ph ph-dots-three text-slate-400"></i>
        </div>
        <h4 class="text-sm font-semibold text-slate-800 leading-snug">Draft homepage copy and design assets</h4>
        <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-1"><i class="ph ph-clock"></i> Today</div>
          <div class="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">JQ</div>
        </div>
      </div>
    </div>
  </div>
  <!-- Column 2 -->
  <div class="flex-shrink-0 w-72 sm:w-80 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col h-full min-w-0">
    <div class="p-4 flex items-center justify-between font-semibold text-slate-700 shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-warning"></div> In Review
      </div>
      <span class="bg-white border border-slate-200 text-xs px-2 py-0.5 rounded-full shadow-sm">1</span>
    </div>
    <div class="p-3 pt-0 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
      <div class="bg-white border border-primary p-4 rounded-xl shadow-sm cursor-grab ring-1 ring-primary/20">
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded uppercase tracking-wide">Flow</span>
        </div>
        <h4 class="text-sm font-semibold text-slate-800 leading-snug">Review publish workflow notifications</h4>
      </div>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'approvalFlow',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-3xl shadow-sm min-w-0">
  <h3 class="font-semibold text-slate-800 mb-8 sticky left-0">Approval Timeline</h3>
  <div class="w-full overflow-x-auto custom-scrollbar pb-4">
    <div class="flex items-start min-w-[500px]">
      <div class="flex-1 relative">
        <div class="absolute top-3.5 left-0 w-full h-0.5 bg-success"></div>
        <div class="relative z-10 flex flex-col items-start pr-4">
          <div class="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center shadow-[0_0_0_4px_white]">
            <i class="ph ph-check font-bold"></i>
          </div>
          <div class="mt-3">
            <p class="text-sm font-bold text-slate-800 whitespace-nowrap">Draft Submitted</p>
            <p class="text-xs text-slate-500 mt-0.5 whitespace-nowrap">Editor · 09:00</p>
          </div>
        </div>
      </div>
      <div class="flex-1 relative">
        <div class="absolute top-3.5 left-0 w-full h-0.5 bg-slate-100"></div>
        <div class="relative z-10 flex flex-col items-start pr-4">
          <div class="w-8 h-8 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center shadow-[0_0_0_4px_white] ring-4 ring-primary/10">
            <div class="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>
          </div>
          <div class="mt-3">
            <p class="text-sm font-bold text-primary whitespace-nowrap">Content Review</p>
            <p class="text-xs text-slate-500 mt-0.5 whitespace-nowrap">Lead · Pending</p>
          </div>
        </div>
      </div>
      <div class="relative pr-4">
        <div class="relative z-10 flex flex-col items-start">
          <div class="w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center shadow-[0_0_0_4px_white]">
            <i class="ph ph-lock"></i>
          </div>
          <div class="mt-3">
            <p class="text-sm font-bold text-slate-400 whitespace-nowrap">Final Approval</p>
            <p class="text-xs text-slate-400 mt-0.5 whitespace-nowrap">Admin · Locked</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'navigationBuilder',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-xl p-4 min-w-0">
  <div class="flex justify-between items-center mb-4 gap-4">
    <h3 class="font-semibold text-slate-800 truncate">Main Menu</h3>
    <button class="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 shrink-0">Add Item</button>
  </div>
  <div class="space-y-2">
    <div class="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-0">
      <i class="ph ph-dots-six-vertical text-slate-300 cursor-move shrink-0"></i>
      <i class="ph ph-house text-slate-400 shrink-0"></i>
      <div class="flex-1 text-sm font-medium text-slate-700 min-w-0 truncate">Dashboard</div>
      <div class="hidden sm:block text-xs font-mono text-slate-400 px-2 py-1 bg-slate-50 rounded shrink-0 truncate max-w-[120px]">/dashboard</div>
      <button class="text-slate-400 hover:text-slate-700 shrink-0"><i class="ph ph-pencil-simple"></i></button>
    </div>
    <div class="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white border border-slate-200 rounded-xl shadow-sm relative min-w-0">
      <i class="ph ph-dots-six-vertical text-slate-300 cursor-move shrink-0"></i>
      <i class="ph ph-file-text text-slate-400 shrink-0"></i>
      <div class="flex-1 text-sm font-medium text-slate-700 min-w-0 truncate">Posts</div>
      <div class="hidden sm:block text-xs font-mono text-slate-400 px-2 py-1 bg-slate-50 rounded shrink-0 truncate max-w-[120px]">/posts</div>
      <button class="text-slate-400 hover:text-slate-700 shrink-0"><i class="ph ph-pencil-simple"></i></button>
    </div>
    <div class="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-50 border border-slate-200 border-l-4 border-l-slate-300 rounded-r-xl rounded-l shadow-sm ml-4 md:ml-8 min-w-0">
      <i class="ph ph-dots-six-vertical text-slate-300 cursor-move shrink-0"></i>
      <div class="flex-1 text-sm font-medium text-slate-700 min-w-0 truncate">Categories</div>
      <div class="hidden sm:block text-xs font-mono text-slate-400 px-2 py-1 bg-white rounded border border-slate-200 shrink-0 truncate max-w-[120px]">/posts/categories</div>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'dashboardStats',
            variants: [{
                name: '默认样式',
                template: `
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
  <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-w-0">
    <p class="text-sm font-medium text-slate-500 mb-1 truncate">Active Users</p>
    <div class="flex items-end justify-between flex-wrap gap-2">
      <h3 class="text-3xl font-bold text-slate-800">12,480</h3>
      <span class="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full mb-1">
        <i class="ph ph-trend-up mr-1"></i> 8.4%
      </span>
    </div>
  </div>
  <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden min-w-0">
    <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8 blur-xl"></div>
    <p class="text-sm font-medium text-slate-500 mb-1 truncate relative z-10">Published Posts</p>
    <div class="flex items-end justify-between flex-wrap gap-2 relative z-10">
      <h3 class="text-3xl font-bold text-slate-800">1,286</h3>
      <span class="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full mb-1">
        <i class="ph ph-trend-up mr-1"></i> 42
      </span>
    </div>
  </div>
  <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-w-0">
    <p class="text-sm font-medium text-slate-500 mb-1 truncate">Conversions</p>
    <div class="flex items-end justify-between flex-wrap gap-2">
      <h3 class="text-3xl font-bold text-slate-800">3.42%</h3>
      <span class="flex items-center text-xs font-medium text-danger bg-danger/10 px-2 py-0.5 rounded-full mb-1">
        <i class="ph ph-trend-down mr-1"></i> 0.2%
      </span>
    </div>
  </div>
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-white min-w-0 sm:col-span-2 lg:col-span-2">
    <p class="text-sm font-medium text-slate-400 mb-1 truncate">Monthly Revenue</p>
    <div class="flex items-end justify-between flex-wrap gap-2">
      <h3 class="text-3xl font-bold">$84,200</h3>
      <span class="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full mb-1">
        <i class="ph ph-trend-up mr-1"></i> 12%
      </span>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'auditTimeline',
            variants: [{
                name: '默认样式',
                template: `
<div class="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-sm min-w-0">
  <h3 class="font-bold text-slate-800 mb-6">Audit Log</h3>
  <div class="relative border-l-2 border-slate-100 pl-4 space-y-6 ml-2">
    <div class="relative">
      <div class="absolute -left-[21px] top-0 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-white"></div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">2026-05-21 10:30</div>
      <div class="text-sm font-medium text-slate-800">Published Article</div>
      <div class="text-xs text-slate-500 mt-1">Jquan moved <span class="font-mono bg-slate-50 px-1 border border-slate-100 rounded">Post #184</span> to published.</div>
    </div>
    <div class="relative">
      <div class="absolute -left-[21px] top-0 w-2.5 h-2.5 bg-slate-300 rounded-full ring-4 ring-white"></div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">2026-05-21 09:12</div>
      <div class="text-sm font-medium text-slate-800">Updated Policy</div>
      <div class="text-xs text-slate-500 mt-1">Admin enabled update permission for Media Library.</div>
    </div>
    <div class="relative">
      <div class="absolute -left-[21px] top-0 w-2.5 h-2.5 bg-danger rounded-full ring-4 ring-white"></div>
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">2026-05-20 18:46</div>
      <div class="text-sm font-medium text-slate-800">Deleted Asset</div>
      <div class="text-xs text-slate-500 mt-1">Lina removed deprecated campaign banner.</div>
    </div>
  </div>
</div>`
            }]
        },
        {
            id: 'contentHonorCertificate',
            variants: [
                {
                    name: '默认样式：图文轮播错落排版',
                    template: `
<section class="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8 md:p-12 w-full min-w-0">
  <!-- 超大背景水印文字 -->
  <div class="absolute -top-6 -left-4 text-[60px] md:text-[110px] font-black text-slate-900/[0.03] uppercase tracking-widest whitespace-nowrap pointer-events-none select-none z-0 leading-none">
    Certificate of Honor
  </div>

  <!-- 右上角装饰小图 (引入你提供的 URL) -->
  <img src="https://tpl-c4bb69f-pic19.websiteonline.cn/upload/1bfb9f1fcc4a5bef1c2f31155c6.png" class="absolute top-6 right-6 w-32 md:w-48 opacity-20 pointer-events-none mix-blend-multiply" alt="deco">

  <div class="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
    <!-- 左侧：多图荣誉证书轮播 (JquanUI Carousel) -->
    <div jq-carousel data-carousel-autoplay="true" data-carousel-interval="3000" data-carousel-indicators="true" class="aspect-[4/3] md:aspect-auto h-full min-h-[320px] rounded-[24px] overflow-hidden bg-white shadow-sm border border-slate-200 w-full min-w-0">
      <div jq-carousel-item class="w-full h-full bg-white flex items-center justify-center relative">
        <img src="https://tpl-c4bb69f-pic19.websiteonline.cn/upload/94mp.jpg" alt="荣誉证书1" class="w-full h-full object-contain p-4">
      </div>
      <div jq-carousel-item class="w-full h-full bg-white flex items-center justify-center relative">
        <img src="https://tpl-c4bb69f-pic19.websiteonline.cn/upload/q2u9.jpg" alt="荣誉证书2" class="w-full h-full object-contain p-4">
      </div>
    </div>

    <!-- 右侧：企业内容介绍区 -->
    <div class="flex flex-col justify-center min-w-0 lg:pl-4">
      <!-- 装饰线与副标题 -->
      <div class="flex items-center gap-4 mb-3 sm:mb-4">
        <div class="w-12 h-1.5 bg-[#80a835] rounded-full"></div>
        <h4 class="text-2xl font-bold text-slate-900 tracking-tight">资质<span class="text-[#80a835]">证书</span></h4>
      </div>
      
      <!-- 主标题 -->
      <h3 class="text-xl sm:text-2xl font-black text-[#80a835] uppercase tracking-tight mb-5 sm:mb-6">Certificate of Honor</h3>
      
      <!-- 正文段落 -->
      <div class="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed mb-6 sm:mb-8">
        <p>一家致力于研发、生产、销售为一体的技术创新型企业。公司成立于2015年，于2015年获得《食品生产许可证》、2020年获得《保健食品生产许可证》, 并通过美国 FDA 认证，ISO22000 认证，HACCP 认证，清真认证等。</p>
        <p>目前产品出口全球 40 多个国家及地区。根据人体营养需求定向开发各类营养产品，使食品与人体有较好的融为一体，人体营养补充更方便快捷。</p>
      </div>
      
      <!-- 行动按钮 (还原了你原始的品牌色与交互效果) -->
      <a href="https://medical-480.view.websiteonline.cn/quality" target="_blank" class="inline-flex h-10 w-fit items-center justify-center rounded-full bg-transparent border-2 border-[#60bf5b] text-[#60bf5b] px-6 text-sm font-bold transition-all duration-300 hover:bg-[#ffb001] hover:border-[#ffb001] hover:text-white hover:shadow-md hover:-translate-y-0.5 focus:outline-none">
        查看证书
      </a>
    </div>
  </div>
</section>`
                }
            ]
        },
    ];

    let currentCategory = UI_TEXT.all;
    let currentView = 'grid'; // 'grid' | 'detail'
    let currentBlockId = null;
    let uiComponentDocs = [];

    async function loadUiComponentDocs() {
        const script = Array.from(document.scripts || []).find(node => /(?:^|\/)admin-blocks\.js(?:\?|$)/.test(node.src || ''));
        const url = new URL('../content/components/index.js', script?.src || document.baseURI).href;
        const module = await import(url);
        uiComponentDocs = Array.isArray(module?.default) ? module.default.filter(item => item.kind === 'ui') : [];
        if (uiComponentDocs.length === 0) throw new Error('UI component documentation is empty.');
    }

    function ensureUiPlugins() {
        if (!window.JquanUI?.use || !window.JquanUIComponents) return;
        Object.values(window.JquanUIComponents).forEach(plugin => {
            if (!plugin?.name || typeof plugin.install !== 'function') return;
            if (!window.JquanUI.hasPlugin || !window.JquanUI.hasPlugin(plugin.name)) window.JquanUI.use(plugin);
        });
    }

    function normalizeBlocks() {
        blocks.forEach(function (block) {
            const meta = BLOCK_META[block.id];
            if (!meta) return;
            block.title = meta.chinese;
            block.chinese = block.id; 
            block.category = meta.category;
            block.tags = meta.tags ? meta.tags.slice() : [];
            block.summary = meta.summary;
            block.icon = meta.icon || 'ph-placeholder';
        });
    }

    function allCategories() {
        const set = new Set();
        blocks.forEach(function (block) {
            if(block.category) set.add(block.category);
        });
        return [UI_TEXT.all, ...Array.from(set), ...(uiComponentDocs.length ? [UI_TEXT.uiComponents] : [])];
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderCode(targetId, code, language) {
        const node = document.getElementById(targetId);
        if (!node) return;
        const html = '<pre class="!m-0"><code data-jq-code data-language="' + language + '">' + escapeHtml(code) + '</code></pre>';
        node.innerHTML = html;
        const codeNode = node.querySelector('code[data-jq-code]');
        if (!codeNode || !window.JquanUIComponents?.codeBlockApi) return;
        try {
            window.JquanUIComponents.codeBlockApi.mount(codeNode, {
                language: language,
                autoDetect: false,
                lineNumbers: true,
                copyButton: true,
                langLabel: true
            });
        } catch (error) {
            console.error('[AdminBlocks] Failed to mount code block', error);
        }
    }

        function filteredBlocks() {
        const keyword = (document.getElementById('block-search')?.value || '').trim().toLowerCase();
        return blocks.filter(function (block) {
            const byTag = currentCategory === UI_TEXT.all || block.category === currentCategory;
            if (!byTag) return false;
            if (!keyword) return true;
            return [
                block.title,
                block.chinese,
                block.category,
                block.summary
            ].join(' ').toLowerCase().includes(keyword);
        });
    }

    function enhanceRenderedRoot(root) {
        if (root && window.JquanUI && typeof window.JquanUI.enhance === 'function') {
            window.JquanUI.enhance(root);
        }
    }

    function renderSidebar() {
        const root = document.getElementById('block-sidebar');
        if (!root) return;
        
        const categories = allCategories();
        
        root.innerHTML = categories.map(function (cat) {
            const active = cat === currentCategory;
            const iconMap = {
                '全部区块': 'ph-squares-four',
                '数据展示': 'ph-chart-pie-slice',
                '反馈与浮层': 'ph-chat-teardrop-text',
                '应用框架': 'ph-layout',
                '业务组件': 'ph-puzzle-piece',
                '内容展示': 'ph-browser',
                [UI_TEXT.uiComponents]: 'ph-circles-four'
            };
            const icon = iconMap[cat] || 'ph-folder';

            return '<button type="button" data-cat="' + escapeHtml(cat) + '" class="w-full text-left rounded-lg px-3 py-2 transition-all flex items-center gap-2 ' +
                (active ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium') +
                '">' +
                '<i class="ph ' + icon + ' text-lg"></i>' +
                '<span>' + escapeHtml(cat) + '</span>' +
                '</button>';
        }).join('');
        enhanceRenderedRoot(root);

        root.querySelectorAll('[data-cat]').forEach(function (button) {
            button.addEventListener('click', function () {
                currentCategory = button.getAttribute('data-cat') || UI_TEXT.all;
                currentView = 'grid'; // 切换分类时强制返回网格视图
                renderSidebar();
                renderMain();
            });
        });
    }

    function uiPreviewMarkup(doc, index) {
        const id = `ui-preview-${doc.id}-${index}`;
        const previews = {
            button: `<div class="flex flex-wrap items-center gap-2"><button jq-button data-variant="primary">主按钮</button><button jq-button data-variant="ghost">次按钮</button></div>`,
            accordion: `<section id="${id}" jq-accordion class="grid gap-2"><article jq-accordion-item><button jq-accordion-trigger>查看说明</button><div jq-accordion-panel><div class="p-3 text-sm text-slate-600">折叠面板内容。</div></div></article></section>`,
            tabs: `<div id="${id}" jq-tabs><nav jq-tab-list class="flex gap-2"><button jq-tab jq-target="#${id}-a">预览</button><button jq-tab jq-target="#${id}-b">API</button></nav><div jq-tab-content><div id="${id}-a" jq-tab-panel class="pt-3 text-sm text-slate-600">标签页内容。</div><div id="${id}-b" jq-tab-panel class="pt-3 text-sm text-slate-600">组件 API。</div></div></div>`,
            select: `<select id="${id}" jq-select data-placeholder="选择一项"><option value="">请选择</option><option value="one">选项一</option><option value="two">选项二</option></select>`,
            popover: `<div id="${id}" jq-popover><button jq-popover-trigger jq-button data-variant="primary">查看浮层</button><div jq-popover-panel class="p-4 text-sm text-slate-600">浮层内容。</div></div>`,
            tooltip: `<button jq-button data-tips="这是 Tooltip 提示" data-tips-pos="top">悬停查看</button>`,
            modal: `<button jq-modal-trigger jq-button data-variant="primary" data-modal-title="组件预览" data-modal-content="这是 Modal 示例。">打开 Modal</button>`,
            drawer: `<button jq-drawer-trigger jq-button data-drawer-title="组件预览" data-drawer-content="这是 Drawer 示例。">打开 Drawer</button>`,
            toast: `<button jq-button data-ui-action="toast">触发 Toast</button>`,
            msg: `<button jq-button data-ui-action="msg">触发 Msg</button>`,
            pagination: `<div jq-pagination data-pagination-total="48" data-pagination-page-size="10"></div>`,
            carousel: `<div id="${id}" jq-carousel class="h-24 rounded-xl bg-primary/10 p-4 text-center text-sm text-primary"><div jq-carousel-item>Carousel 预览</div><div jq-carousel-item>第二页</div></div>`
        };
        return previews[doc.id] || `<div class="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"><i class="ph ph-puzzle-piece mr-2 text-primary"></i>${escapeHtml(doc.chinese)} UI 预览</div>`;
    }

    function filteredUiComponents() {
        const keyword = (document.getElementById('block-search')?.value || '').trim().toLowerCase();
        if (!keyword) return uiComponentDocs;
        return uiComponentDocs.filter(doc => [doc.title, doc.chinese, doc.summary, doc.api || ''].join(' ').toLowerCase().includes(keyword));
    }

    async function copyUiCode(code, status) {
        try {
            if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code);
            else {
                const textarea = document.createElement('textarea');
                textarea.value = code;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
            }
            status.textContent = '代码已复制';
        } catch (error) {
            status.textContent = '复制失败，请从代码块复制';
        }
    }

    function bindUiShowcaseActions() {
        if (document.__jquanUiShowcaseActionsBound) return;
        document.__jquanUiShowcaseActionsBound = true;
        document.addEventListener('click', function (event) {
            const target = event.target instanceof Element ? event.target : null;
            const card = target?.closest('#block-app [data-ui-component-card]');
            if (!card) return;
            const doc = uiComponentDocs.find(item => item.id === card.getAttribute('data-ui-id'));
            const feedback = card.querySelector('[data-ui-feedback]');
            if (!doc || !feedback) return;

            if (target?.closest('[data-ui-interact]')) {
                feedback.textContent = `${doc.chinese} 已触发交互`;
                const action = card.querySelector('[data-ui-action="toast"]');
                if (action && window.JquanUIComponents?.toastApi) {
                    window.JquanUIComponents.toastApi.success({ title: `${doc.chinese} 反馈`, description: 'UI 组件交互已触发' });
                }
                const message = card.querySelector('[data-ui-action="msg"]');
                if (message && window.JquanUIComponents?.msgApi) {
                    window.JquanUIComponents.msgApi.success('UI 组件交互已触发');
                }
                return;
            }

            if (target?.closest('[data-ui-copy]')) {
                copyUiCode(doc.declarative.trim(), feedback);
            }
        }, true);
    }

    function renderUiComponents() {
        const app = document.getElementById('block-app');
        if (!app) return;
        const list = filteredUiComponents();
        app.innerHTML = `<div class="mx-auto max-w-6xl w-full min-w-0 pb-20">
            <div class="mb-8"><div class="flex items-center gap-3"><i class="ph ph-circles-four text-2xl text-primary"></i><h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">UI 组件</h1></div>
            <p class="mt-2 text-sm text-slate-500">${list.length} 个 UI 组件。每张卡片都包含说明、实时预览、交互反馈和可复制代码。</p></div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">${list.map((doc, index) => `
                <article class="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" data-ui-component-card data-ui-id="${escapeHtml(doc.id)}">
                    <section class="border-b border-slate-100 px-5 py-4" aria-labelledby="ui-description-${doc.id}-${index}">
                        <div class="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">说明</div>
                        <div class="flex items-center justify-between gap-3"><h2 id="ui-description-${doc.id}-${index}" class="truncate font-bold text-slate-800">${escapeHtml(doc.chinese)}</h2><span class="shrink-0 text-xs font-mono text-slate-400">${escapeHtml(doc.title)}</span></div>
                        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">${escapeHtml(doc.summary)}</p>
                    </section>
                    <div class="grid gap-4 p-5">
                        <section class="grid gap-2" aria-label="演示">
                            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">演示</div>
                            <div class="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-4" data-ui-preview>${uiPreviewMarkup(doc, index)}</div>
                        </section>
                        <section class="grid gap-2" aria-label="交互">
                            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">交互</div>
                            <div class="flex flex-wrap items-center gap-2"><button type="button" data-ui-interact class="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:opacity-90"><i class="ph ph-play"></i>执行交互</button><button type="button" data-ui-copy class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><i class="ph ph-copy"></i>复制代码</button></div>
                        </section>
                        <section class="grid gap-2" aria-label="实时反馈">
                            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">实时反馈</div>
                            <div data-ui-feedback class="min-h-9 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-400" aria-live="polite">等待操作</div>
                        </section>
                        <section class="grid gap-2" aria-label="可复制代码">
                            <div class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">可复制代码</div><div id="ui-code-${doc.id}-${index}" class="min-w-0"></div>
                        </section>
                    </div>
                </article>`).join('') || '<div class="col-span-full py-20 text-center text-slate-400">没有找到匹配的 UI 组件。</div>'}</div></div>`;
        ensureUiPlugins();
        enhanceRenderedRoot(app);
        bindUiShowcaseActions();
        list.forEach((doc, index) => renderCode(`ui-code-${doc.id}-${index}`, doc.declarative.trim(), 'html'));
    }

    function renderMain() {
        const app = document.getElementById('block-app');
        if (!app) return;

        if (currentView === 'grid' && currentCategory === UI_TEXT.uiComponents) {
            renderUiComponents();
            return;
        }

        if (currentView === 'grid') {
            const list = filteredBlocks();
            
            let gridHtml = `
                <div class="mx-auto max-w-6xl w-full min-w-0 pb-20">
                    <div class="mb-8">
                        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">${escapeHtml(currentCategory)}</h1>
                        <p class="mt-2 text-sm text-slate-500">共包含 ${list.length} 个组件族，每个组件族内提供多种 HTML 样式变体。</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            `;

            if (list.length === 0) {
                gridHtml += `<div class="col-span-full py-20 text-center text-slate-400">没有找到匹配的组件。</div>`;
            }

            list.forEach(block => {
                const variantsCount = block.variants ? block.variants.length : 1;
                gridHtml += `
                    <div data-id="${block.id}" class="bg-white rounded-3xl border border-slate-200 p-5 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full min-w-0">
                        <div class="h-40 bg-slate-50 rounded-2xl mb-5 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                            <i class="ph ${block.icon} text-5xl text-slate-300 group-hover:text-primary/40 transition-colors"></i>
                        </div>
                        <div class="flex-1 flex flex-col min-w-0">
                            <h3 class="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors truncate">${escapeHtml(block.title)}</h3>
                            <p class="text-xs text-slate-500 font-mono mt-1 mb-3 truncate">${escapeHtml(block.chinese)}</p>
                            <p class="text-sm text-slate-600 line-clamp-2 mt-auto leading-relaxed">${escapeHtml(block.summary)}</p>
                        </div>
                        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${variantsCount} ${UI_TEXT.variantsCount}</span>
                            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                <i class="ph ph-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                `;
            });

            gridHtml += `</div></div>`;
            app.innerHTML = gridHtml;
            enhanceRenderedRoot(app);

            app.querySelectorAll('[data-id]').forEach(function (card) {
                card.addEventListener('click', function () {
                    currentBlockId = card.getAttribute('data-id');
                    currentView = 'detail';
                    renderMain();
                });
            });

        } else if (currentView === 'detail') {
            const block = blocks.find(b => b.id === currentBlockId);
            if (!block) {
                currentView = 'grid';
                renderMain();
                return;
            }

            let detailHtml = `
                <div class="mx-auto max-w-5xl flex flex-col gap-10 pb-20 w-full min-w-0">
                    
                    <!-- 面包屑与头部 -->
                    <div class="w-full min-w-0">
                        <button id="btn-back" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-6 group">
                            <i class="ph ph-arrow-left group-hover:-translate-x-1 transition-transform"></i> ${UI_TEXT.back}
                        </button>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <i class="ph ${block.icon} text-2xl"></i>
                            </div>
                            <div class="min-w-0">
                                <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 truncate">${escapeHtml(block.title)}</h1>
                                <div class="text-sm text-slate-500 font-mono mt-1 truncate">${escapeHtml(block.id)}</div>
                            </div>
                        </div>
                        <p class="max-w-3xl text-base leading-relaxed text-slate-600 break-words">${escapeHtml(block.summary)}</p>
                    </div>
            `;

            // 循环渲染所有 Variants (样式堆叠展示)
            const variants = block.variants || [];
            variants.forEach((variant, index) => {
                detailHtml += `
                    <!-- 样式变体容器 -->
                    <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm flex flex-col w-full min-w-0 overflow-hidden">
                        <!-- Variant 标题 -->
                        <div class="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                            <div class="text-lg font-bold text-slate-800 flex items-center gap-3 min-w-0">
                                <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs border border-slate-200 shrink-0">${index + 1}</span>
                                <span class="truncate">${escapeHtml(variant.name || '默认样式')}</span>
                            </div>
                        </div>
                        
                        <!-- 极具实验室高级感的预览画板 -->
                        <div class="w-full overflow-x-auto bg-slate-50/60 p-6 md:p-10 relative custom-scrollbar shadow-inner" style="background-image: radial-gradient(#cbd5e1 1px, transparent 0); background-size: 20px 20px;">
                            <div class="w-full flex flex-col items-center justify-start min-w-0 max-w-full mx-auto">
                                ${variant.template}
                            </div>
                        </div>

                        <!-- 源码区域 -->
                        <div class="p-6 sm:p-8 border-t border-slate-100 bg-white min-w-0">
                            <div class="mb-4 flex items-center justify-between shrink-0">
                                <div class="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <i class="ph ph-code text-primary"></i> ${UI_TEXT.sourceTitle}
                                </div>
                            </div>
                            <!-- 交给 codeBlockApi 渲染，自带完美的复制功能 -->
                            <div id="source-${block.id}-${index}" class="text-xs sm:text-sm w-full min-w-0"></div>
                        </div>
                    </section>
                `;
            });

            detailHtml += `</div>`;
            app.innerHTML = detailHtml;
            enhanceRenderedRoot(app);

            // 绑定返回事件
            document.getElementById('btn-back')?.addEventListener('click', function() {
                currentView = 'grid';
                renderMain();
            });

            // 挂载所有的高亮代码块
            variants.forEach((variant, index) => {
                renderCode(`source-${block.id}-${index}`, variant.template.trim(), 'html');
            });
            
            // 为了让刚才插入的、自带 data- 属性的动态交互组件（轮播图、选项卡）生效
            // 我们手动通知 JquanUI 的引擎扫描一遍刚刚装载进页面的 DOM
            if (window.JquanUIComponents?.carouselApi) {
                app.querySelectorAll('[jq-carousel]').forEach(node => {
                    window.JquanUIComponents.carouselApi.mount(node);
                });
            }
            if (window.JquanUIComponents?.tabsApi) {
                app.querySelectorAll('[jq-tabs]').forEach(node => {
                    window.JquanUIComponents.tabsApi.mount(node);
                });
            }
        }
    }

    function bindSearch() {
        const input = document.getElementById('block-search');
        if (!input) return;
        input.addEventListener('input', function () {
            // 搜索时，如果当前在详情页则强制跳回网格列表页
            if (currentView !== 'grid') {
                currentView = 'grid';
            }
            renderMain();
        });
    }

    // 隐藏/移除顶部旧有的 block-tags 区域，我们已经改用左侧边栏大分类了
    const tagsContainer = document.getElementById('block-tags');
    if (tagsContainer && tagsContainer.parentElement) {
        tagsContainer.parentElement.style.display = 'none';
    }

    // 初始化运行
    normalizeBlocks();
    bindUiShowcaseActions();

    document.addEventListener('DOMContentLoaded', async function () {
        bindSearch();
        renderSidebar();
        renderMain();
        try {
            await loadUiComponentDocs();
            renderSidebar();
            renderMain();
        } catch (error) {
            console.error('[AdminBlocks] Failed to load UI component docs', error);
        }
    });
})();
