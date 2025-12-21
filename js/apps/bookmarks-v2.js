// bookmarks-v2.js

const bookmarksDataV2 = [
    {
        id: 'dev-tools',
        name: '开发工具',
        icon: '🛠️',
        // bookmarks 顺序将作为默认排序依据
        bookmarks: [
            {
                id: 'github',
                title: 'GitHub',
                url: 'https://github.com',
                description: 'Where the world builds software.',
                tags: ['git', '代码托管', '开源', 'CI/CD'],
                // V2 新增字段
                logo: null, // 可以为 null 或一个高质量的图片 URL
                visitCount: 0,
                lastVisited: null // 可以是 null 或一个时间戳
            },
            {
                id: 'vercel',
                title: 'Vercel',
                url: 'https://vercel.com',
                description: 'Develop. Preview. Ship.',
                tags: ['部署', '前端', 'Jamstack', 'CI/CD'],
                logo: 'https://vercel.com/api/www/avatar/f28831b337a2e6f8f0445a3a66d81c0e?s=204', // 自定义高质量 Logo 示例
                visitCount: 0,
                lastVisited: null
            },
            {
                id: 'stackoverflow',
                title: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                description: 'Where developers learn, share, & build careers.',
                tags: ['社区', '问答', '编程'],
                visitCount: 0,
                lastVisited: null
            },
            {
                id: 'tailwindcss',
                title: 'Tailwind CSS',
                url: 'https://tailwindcss.com',
                description: 'A utility-first CSS framework for rapid UI development.',
                tags: ['CSS框架', '原子类', '前端'],
                visitCount: 0,
                lastVisited: null
            }
        ]
    },
    {
        id: 'design',
        name: '设计资源',
        icon: '🎨',
        bookmarks: [
            {
                id: 'figma',
                title: 'Figma',
                url: 'https://www.figma.com',
                description: 'The collaborative interface design tool.',
                tags: ['UI设计', '协作', '原型'],
                visitCount: 0,
                lastVisited: null
            },
            {
                id: 'dribbble',
                title: 'Dribbble',
                url: 'https://dribbble.com',
                description: 'Discover the world\'s top designers & creatives.',
                tags: ['灵感', 'UI设计', '作品集'],
                visitCount: 0,
                lastVisited: null
            },
            {
                id: 'unsplash',
                title: 'Unsplash',
                url: 'https://unsplash.com',
                description: 'The internet’s source of freely-usable images.',
                tags: ['图片', '摄影', '免费素材'],
                visitCount: 0,
                lastVisited: null
            },
            {
                id: 'producthunt',
                title: 'Product Hunt',
                url: 'https://www.producthunt.com',
                description: 'The best new products in tech.',
                tags: ['发现', '新产品', '社区'],
                visitCount: 0,
                lastVisited: null
            }
        ]
    },
    {
        id: 'productivity',
        name: '效率工具',
        icon: '🚀',
        bookmarks: [
            {
                id: 'notion',
                title: 'Notion',
                url: 'https://www.notion.so',
                description: 'The connected workspace for your docs, notes and tasks.',
                tags: ['笔记', '知识管理', '协作'],
                visitCount: 0,
                lastVisited: null
            },
            {
                id: 'chatgpt',
                title: 'ChatGPT',
                url: 'https://chat.openai.com',
                description: 'A conversational AI system.',
                tags: ['AI', '助手', '生产力'],
                visitCount: 0,
                lastVisited: null
            }
        ]
    }
];

// 暴露 V2 数据
window.bookmarksData = bookmarksDataV2;
