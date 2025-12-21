// bookmarks.js

const bookmarksData = [
    {
        id: 'dev-tools',
        name: '开发工具',
        icon: '🛠️', // 为分类添加一个 emoji 图标，增加视觉效果
        bookmarks: [
            {
                id: 'github',
                title: 'GitHub',
                url: 'https://github.com',
                description: 'Where the world builds software.',
                tags: ['git', '代码托管', '开源', 'CI/CD']
            },
            {
                id: 'vercel',
                title: 'Vercel',
                url: 'https://vercel.com',
                description: 'Develop. Preview. Ship.',
                tags: ['部署', '前端', 'Jamstack', 'CI/CD']
            },
            {
                id: 'stackoverflow',
                title: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                description: 'Where developers learn, share, & build careers.',
                tags: ['社区', '问答', '编程']
            },
            {
                id: 'react-docs',
                title: 'React Documentation',
                url: 'https://react.dev',
                description: 'The library for web and native user interfaces.',
                tags: ['框架', '前端', 'JavaScript', '文档']
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
                tags: ['UI设计', '协作', '原型']
            },
            {
                id: 'dribbble',
                title: 'Dribbble',
                url: 'https://dribbble.com',
                description: 'Discover the world\'s top designers & creatives.',
                tags: ['灵感', 'UI设计', '作品集']
            },
            {
                id: 'unslash',
                title: 'Unsplash',
                url: 'https://unsplash.com',
                description: 'The internet’s source of freely-usable images.',
                tags: ['图片', '摄影', '免费素材']
            },
             {
                id: 'tailwindcss',
                title: 'Tailwind CSS',
                url: 'https://tailwindcss.com',
                description: 'A utility-first CSS framework for rapid UI development.',
                tags: ['CSS框架', '原子类', '前端']
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
                tags: ['笔记', '知识管理', '协作']
            },
            {
                id: 'chatgpt',
                title: 'ChatGPT',
                url: 'https://chat.openai.com',
                description: 'A conversational AI system.',
                tags: ['AI', '助手', '生产力']
            },
            {
                id: 'linear',
                title: 'Linear',
                url: 'https://linear.app',
                description: 'The issue tracking tool you\'ll enjoy using.',
                tags: ['项目管理', '任务跟踪', '协作']
            }
        ]
    },
    {
        id: 'daily',
        name: '日常',
        icon: '☕',
        bookmarks: [
            {
                id: 'youtube',
                title: 'YouTube',
                url: 'https://www.youtube.com',
                description: 'Enjoy the videos and music you love.',
                tags: ['视频', '娱乐', '学习']
            },
            {
                id: 'reddit',
                title: 'Reddit',
                url: 'https://www.reddit.com',
                description: 'The front page of the internet.',
                tags: ['社区', '新闻', '论坛']
            }
        ]
    }
];

// 将数据暴露到全局作用域，以便 index.html 可以访问
window.bookmarksData = bookmarksData;
