/*
 * =================================================================
 * 书签导航 V3 - 数据文件
 * =================================================================
 * 
 * 新特性：
 * 1. 支持无限层级的分类结构。
 * 2. 分类 (categories) 数组是顶层，每个分类可以有直属书签和子分类。
 * 3. 子分类 (subcategories) 是一个数组，内部结构与顶层分类类似，实现嵌套。
 *
 */

window.bookmarksDataV3 = [
    {
        id: 'dev',
        name: '开发工具',
        icon: '💻',
        // 顶层分类的直属书签
        bookmarks: [
            {
                id: 'd1',
                title: 'GitHub',
                url: 'https://github.com',
                logo: 'https://github.com/favicon.ico',
                description: '全球最大的代码托管平台。',
                tags: ['代码', '开源', 'git']
            },
            {
                id: 'd2',
                title: 'VS Code',
                url: 'https://code.visualstudio.com/',
                logo: 'https://code.visualstudio.com/favicon.ico',
                description: '微软开发的免费代码编辑器。',
                tags: ['IDE', '编辑器', '微软']
            }
        ],
        // V3 核心：子分类
        subcategories: [
            {
                id: 'dev-frontend',
                name: '前端',
                icon: '🎨',
                bookmarks: [
                    {
                        id: 'df1',
                        title: 'React',
                        url: 'https://react.dev/',
                        logo: 'https://react.dev/favicon.ico',
                        description: '用于构建用户界面的 JavaScript 库。',
                        tags: ['框架', 'JavaScript', '前端', 'React']
                    },
                    {
                        id: 'df2',
                        title: 'Vue.js',
                        url: 'https://vuejs.org/',
                        logo: 'https://vuejs.org/logo.svg',
                        description: '渐进式 JavaScript 框架。',
                        tags: ['框架', 'JavaScript', '前端', 'Vue']
                    },
                    {
                        id: 'df3',
                        title: 'Tailwind CSS',
                        url: 'https://tailwindcss.com/',
                        logo: 'https://tailwindcss.com/favicon.ico',
                        description: '一个功能类优先的 CSS 框架。',
                        tags: ['CSS', '框架', '样式', '前端']
                    }
                ]
            },
            {
                id: 'dev-backend',
                name: '后端',
                icon: '⚙️',
                bookmarks: [
                    {
                        id: 'db1',
                        title: 'Node.js',
                        url: 'https://nodejs.org/',
                        logo: 'https://nodejs.org/static/images/favicons/favicon.png',
                        description: '基于 Chrome V8 引擎的 JavaScript 运行时。',
                        tags: ['JavaScript', '运行时', '后端', 'Node.js']
                    },
                    {
                        id: 'db2',
                        title: 'Docker Hub',
                        url: 'https://hub.docker.com/',
                        logo: 'https://www.docker.com/favicon.ico',
                        description: '查找和共享容器镜像。',
                        tags: ['容器', 'DevOps', 'Docker']
                    }
                ]
            },
            {
                id: 'dev-database',
                name: '数据库',
                icon: '🗄️',
                bookmarks: [
                    {
                        id: 'dd1',
                        title: 'MongoDB',
                        url: 'https://www.mongodb.com/',
                        logo: 'https://www.mongodb.com/assets/images/global/favicon.ico',
                        description: '一个基于文档的 NoSQL 数据库。',
                        tags: ['数据库', 'NoSQL', 'MongoDB']
                    },
                    {
                        id: 'dd2',
                        title: 'Redis',
                        url: 'https://redis.io/',
                        logo: 'https://redis.io/images/redis-white.ico',
                        description: '一个内存中的数据结构存储系统。',
                        tags: ['数据库', '缓存', 'Redis']
                    }
                ]
            }
        ]
    },
    {
        id: 'design',
        name: '设计资源',
        icon: '🎨',
        bookmarks: [
            {
                id: 'ds1',
                title: 'Figma',
                url: 'https://www.figma.com/',
                logo: 'https://static.figma.com/app/icon/1/favicon.ico',
                description: '协作式界面设计工具。',
                tags: ['UI', '设计', '协作']
            }
        ],
        subcategories: [
            {
                id: 'design-inspiration',
                name: '灵感与素材',
                icon: '✨',
                bookmarks: [
                    {
                        id: 'di1',
                        title: 'Dribbble',
                        url: 'https://dribbble.com/',
                        logo: 'https://cdn.dribbble.com/assets/favicon-63b2904a073c89b52b19aa05c6a21e32.ico',
                        description: '设计师作品分享平台。',
                        tags: ['灵感', 'UI', '作品集']
                    },
                    {
                        id: 'di2',
                        title: 'Unsplash',
                        url: 'https://unsplash.com/',
                        logo: 'https://unsplash.com/favicon.ico',
                        description: '免费的高分辨率摄影图片。',
                        tags: ['图片', '摄影', '免费素材']
                    }
                ]
            }
        ]
    },
    {
        id: 'ai',
        name: 'AI 工具',
        icon: '🤖',
        bookmarks: [
            {
                id: 'ai1',
                title: 'ChatGPT',
                url: 'https://chat.openai.com/',
                logo: 'https://cdn.openai.com/favicon-32x32.png',
                description: '由 OpenAI 开发的强大对话 AI。',
                tags: ['AI', '聊天', 'GPT', 'OpenAI']
            }
        ],
        subcategories: [
            {
                id: 'ai-image',
                name: 'AI 绘画',
                icon: '🖼️',
                bookmarks: [
                    {
                        id: 'aii1',
                        title: 'Midjourney',
                        url: 'https://www.midjourney.com/',
                        logo: 'https://www.midjourney.com/favicon.ico',
                        description: '顶尖的 AI 图像生成服务。',
                        tags: ['AI', '绘画', '图像生成']
                    },
                    {
                        id: 'aii2',
                        title: 'Stable Diffusion',
                        url: 'https://stability.ai/',
                        logo: 'https://stability.ai/favicon.ico',
                        description: '开源的 AI 绘画模型。',
                        tags: ['AI', '绘画', '开源']
                    }
                ]
            }
        ]
    },
    {
        id: 'daily',
        name: '效率办公',
        icon: '👜',
        subcategories: [
            {
                id: 'Format-Conversion',
                name: '格式转换',
                icon: '🖼️',
                bookmarks: [
                    {
                        id: 'aii1',
                        title: 'Midjourney',
                        url: 'https://www.midjourney.com/',
                        logo: 'https://www.midjourney.com/favicon.ico',
                        description: '将图像转换为 PDF 格式。',
                        tags: ['图像', 'PDF', '转换']
                    },
                    {
                        id: 'PDF-Conversion',
                        title: 'PDF 转换',
                        url: 'https://www.pdf2go.com/',
                        logo: 'https://www.pdf2go.com/favicon.ico',
                        description: '将文档转换为 PDF 格式。',
                        tags: ['文档', 'PDF', '转换']
                    }
                ]
            }
        ],
        subcategories: [
            {
                id: 'File-Transfer',
                name: '文件中转',
                icon: '📁',
                bookmarks: [
                    {
                        id: 'File-Transfer',
                        title: '文件中转',
                        url: 'https://www.filetransfer.io/',
                        logo: 'https://www.filetransfer.io/favicon.ico',
                        description: '将文件从一个位置中转到另一个位置。',
                        tags: ['文件收发', '文件中转', '文件传输']
                    },
                    {
                        id: 'AirPortal',
                        title: 'AirPortal',
                        url: 'https://www.airportal.cn/',
                        logo: 'https://www.airportal.cn/favicon.ico',
                        description: '文件收件箱',
                        tags: ['文件收发', '文件中转', '文件传输']
                    },
                    {
                        id: 'wenshushu',
                        title: '文叔叔',
                        url: 'https://www.wenshushu.cn/',
                        logo: 'https://www.wenshushu.cn/favicon.ico',
                        description: '文件传输工具，支持多平台文件传输。',
                        tags: ['文件收发', '文件中转', '文件传输', '云盘', '收集文件']
                    }
                ]
            }
        ]
    },
    {
        id: 'ai-chat',
        name: '副驾驶',
        icon: '🤖',
        subcategories: [
            {
                id: 'ai-im',
                name: 'AI 绘画',
                icon: '🖼️',
                bookmarks: [
                    {
                        id: 'aii1',
                        title: 'Midjourney',
                        url: 'https://www.midjourney.com/',
                        logo: 'https://www.midjourney.com/favicon.ico',
                        description: '顶尖的 AI 图像生成服务。',
                        tags: ['AI', '绘画', '图像生成']
                    },
                    {
                        id: 'aii2',
                        title: 'Stable Diffusion',
                        url: 'https://stability.ai/',
                        logo: 'https://stability.ai/favicon.ico',
                        description: '开源的 AI 绘画模型。',
                        tags: ['AI', '绘画', '开源']
                    }
                ]
            }
        ]
    }
];
