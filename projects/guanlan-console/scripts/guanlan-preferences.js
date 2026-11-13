(function () {
  var storageKey = 'guanlan:preferences';
  var defaultLocale = 'zh-CN';
  var defaultTheme = 'light';
  var textMap = {
    'Workspace': { 'zh-CN': '工作区', 'en-US': 'Workspace' },
    'Overview': { 'zh-CN': '总览', 'en-US': 'Overview' },
    'Content': { 'zh-CN': '内容', 'en-US': 'Content' },
    'All content': { 'zh-CN': '全部内容', 'en-US': 'All content' },
    'Content studio': { 'zh-CN': '内容工作台', 'en-US': 'Content studio' },
    'New article': { 'zh-CN': '新建文章', 'en-US': 'New article' },
    'Administration': { 'zh-CN': '管理', 'en-US': 'Administration' },
    'Configuration': { 'zh-CN': '配置中心', 'en-US': 'Configuration' },
    'Model schema': { 'zh-CN': '模型结构', 'en-US': 'Model schema' },
    'Media library': { 'zh-CN': '媒体库', 'en-US': 'Media library' },
    'Permissions': { 'zh-CN': '权限配置', 'en-US': 'Permissions' },
    'Review queue': { 'zh-CN': '审核队列', 'en-US': 'Review queue' },
    'Audit log': { 'zh-CN': '审计日志', 'en-US': 'Audit log' },
    'Notifications': { 'zh-CN': '通知中心', 'en-US': 'Notifications' },
    'Recycle bin': { 'zh-CN': '回收站', 'en-US': 'Recycle bin' },
    'Task center': { 'zh-CN': '任务中心', 'en-US': 'Task center' },
    'Personal profile': { 'zh-CN': '个人资料', 'en-US': 'Personal profile' },
    '管理个人资料、安全设置和登录设备。': { 'zh-CN': '管理个人资料、安全设置和登录设备。', 'en-US': 'Manage personal information, security settings, and signed-in devices.' },
    '这些信息会展示在团队活动和审核记录中。': { 'zh-CN': '这些信息会展示在团队活动和审核记录中。', 'en-US': 'This information appears in team activity and review records.' },
    '定期更新密码并开启多因素认证。': { 'zh-CN': '定期更新密码并开启多因素认证。', 'en-US': 'Update passwords regularly and enable multi-factor authentication.' },
    '登录时要求额外的验证步骤。': { 'zh-CN': '登录时要求额外的验证步骤。', 'en-US': 'Require an extra verification step at sign-in.' },
    '查看最近登录设备并撤销异常会话。': { 'zh-CN': '查看最近登录设备并撤销异常会话。', 'en-US': 'Review recent sign-in devices and revoke unusual sessions.' },
    'Configuration center': { 'zh-CN': '配置中心', 'en-US': 'Configuration center' },
    'Import & export': { 'zh-CN': '导入导出', 'en-US': 'Import & export' },
    'Save changes': { 'zh-CN': '保存更改', 'en-US': 'Save changes' },
    'Save schema': { 'zh-CN': '保存模型', 'en-US': 'Save schema' },
    'Save policy': { 'zh-CN': '保存策略', 'en-US': 'Save policy' },
    'Settings': { 'zh-CN': '设置', 'en-US': 'Settings' },
    'Profile': { 'zh-CN': '资料', 'en-US': 'Profile' },
    'Security': { 'zh-CN': '安全', 'en-US': 'Security' },
    'Sessions': { 'zh-CN': '会话', 'en-US': 'Sessions' },
    'Profile information': { 'zh-CN': '资料信息', 'en-US': 'Profile information' },
    'Full name': { 'zh-CN': '姓名', 'en-US': 'Full name' },
    'Email': { 'zh-CN': '邮箱', 'en-US': 'Email' },
    'Role': { 'zh-CN': '角色', 'en-US': 'Role' },
    'Locale': { 'zh-CN': '语言', 'en-US': 'Locale' },
    'Administrator': { 'zh-CN': '管理员', 'en-US': 'Administrator' },
    'Editor': { 'zh-CN': '编辑', 'en-US': 'Editor' },
    'Reviewer': { 'zh-CN': '审核员', 'en-US': 'Reviewer' },
    'Current password': { 'zh-CN': '当前密码', 'en-US': 'Current password' },
    'New password': { 'zh-CN': '新密码', 'en-US': 'New password' },
    'Two-factor authentication': { 'zh-CN': '两步验证', 'en-US': 'Two-factor authentication' },
    'Active sessions': { 'zh-CN': '活跃会话', 'en-US': 'Active sessions' },
    'Current': { 'zh-CN': '当前', 'en-US': 'Current' },
    'Revoke': { 'zh-CN': '撤销', 'en-US': 'Revoke' },
    'Browse content': { 'zh-CN': '浏览内容', 'en-US': 'Browse content' },
    'Back to home': { 'zh-CN': '返回首页', 'en-US': 'Back to home' },
    'Try again': { 'zh-CN': '重试', 'en-US': 'Try again' },
    'Restore': { 'zh-CN': '恢复', 'en-US': 'Restore' },
    'Empty recycle bin': { 'zh-CN': '清空回收站', 'en-US': 'Empty recycle bin' }
  };
  Object.assign(textMap, {
    'Audit Log': { 'zh-CN': '审计日志', 'en-US': 'Audit Log' },
    'Home': { 'zh-CN': '首页', 'en-US': 'Home' },
    'Detail': { 'zh-CN': '详情', 'en-US': 'Detail' },
    'Editor | 观澜台': { 'zh-CN': '编辑器 | 观澜台', 'en-US': 'Editor | 观澜台' },
    'Editor': { 'zh-CN': '编辑器', 'en-US': 'Editor' },
    'Model Designer': { 'zh-CN': '模型设计器', 'en-US': 'Model Designer' },
    'Notifications': { 'zh-CN': '通知中心', 'en-US': 'Notifications' },
    'Task Center': { 'zh-CN': '任务中心', 'en-US': 'Task Center' },
    'Recycle Bin': { 'zh-CN': '回收站', 'en-US': 'Recycle Bin' },
    'Content library': { 'zh-CN': '内容库', 'en-US': 'Content library' },
    'Growth report': { 'zh-CN': '增长报告', 'en-US': 'Growth report' },
    'Members & roles': { 'zh-CN': '成员与角色', 'en-US': 'Members & roles' },
    'Administration / Governance': { 'zh-CN': '管理 / 治理', 'en-US': 'Administration / Governance' },
    'Administration / Assets': { 'zh-CN': '管理 / 资产', 'en-US': 'Administration / Assets' },
    'Administration / Content model': { 'zh-CN': '管理 / 内容模型', 'en-US': 'Administration / Content model' },
    'Administration / Access control': { 'zh-CN': '管理 / 访问控制', 'en-US': 'Administration / Access control' },
    'Administration / Publishing': { 'zh-CN': '管理 / 发布', 'en-US': 'Administration / Publishing' },
    'Workspace / Content library': { 'zh-CN': '工作区 / 内容库', 'en-US': 'Workspace / Content library' },
    'Workspace / Account': { 'zh-CN': '工作区 / 账户', 'en-US': 'Workspace / Account' },
    'Workspace / Administration': { 'zh-CN': '工作区 / 管理', 'en-US': 'Workspace / Administration' },
    'Workspace / Inbox': { 'zh-CN': '工作区 / 收件箱', 'en-US': 'Workspace / Inbox' },
    'Workspace / Operations': { 'zh-CN': '工作区 / 运营', 'en-US': 'Workspace / Operations' },
    'Export log': { 'zh-CN': '导出日志', 'en-US': 'Export log' },
    'All actors': { 'zh-CN': '全部操作者', 'en-US': 'All actors' },
    'All actions': { 'zh-CN': '全部操作', 'en-US': 'All actions' },
    'Recent activity': { 'zh-CN': '最近活动', 'en-US': 'Recent activity' },
    'Events this month': { 'zh-CN': '本月事件', 'en-US': 'Events this month' },
    'Retention policy': { 'zh-CN': '保留策略', 'en-US': 'Retention policy' },
    'General statistics': { 'zh-CN': '常规统计', 'en-US': 'General statistics' },
    'All users': { 'zh-CN': '全部用户', 'en-US': 'All users' },
    'Active users': { 'zh-CN': '活跃用户', 'en-US': 'Active users' },
    'New users': { 'zh-CN': '新增用户', 'en-US': 'New users' },
    'Most engaged': { 'zh-CN': '互动最活跃', 'en-US': 'Most engaged' },
    'See all': { 'zh-CN': '查看全部', 'en-US': 'See all' },
    'Total coverage': { 'zh-CN': '总覆盖率', 'en-US': 'Total coverage' },
    'Style DNA': { 'zh-CN': '风格 DNA', 'en-US': 'Style DNA' },
    'Components': { 'zh-CN': '组件', 'en-US': 'Components' },
    'Parameters': { 'zh-CN': '参数', 'en-US': 'Parameters' },
    'Back to library': { 'zh-CN': '返回内容库', 'en-US': 'Back to library' },
    'Q3 Regional Growth Report': { 'zh-CN': '第三季度区域增长报告', 'en-US': 'Q3 Regional Growth Report' },
    'Current report': { 'zh-CN': '当前报告', 'en-US': 'Current report' },
    'Edit article': { 'zh-CN': '编辑文章', 'en-US': 'Edit article' },
    'Total reach': { 'zh-CN': '总触达', 'en-US': 'Total reach' },
    'Engagement': { 'zh-CN': '互动', 'en-US': 'Engagement' },
    'Read time': { 'zh-CN': '阅读时长', 'en-US': 'Read time' },
    'Average per visitor': { 'zh-CN': '访客平均值', 'en-US': 'Average per visitor' },
    'Coverage map': { 'zh-CN': '覆盖地图', 'en-US': 'Coverage map' },
    'Regional activity': { 'zh-CN': '区域活动', 'en-US': 'Regional activity' },
    'Worldwide': { 'zh-CN': '全球', 'en-US': 'Worldwide' },
    'North America': { 'zh-CN': '北美洲', 'en-US': 'North America' },
    'South America': { 'zh-CN': '南美洲', 'en-US': 'South America' },
    'Editorial flow': { 'zh-CN': '编辑流程', 'en-US': 'Editorial flow' },
    'Activity history': { 'zh-CN': '活动历史', 'en-US': 'Activity history' },
    'View log': { 'zh-CN': '查看日志', 'en-US': 'View log' },
    'Published to workspace': { 'zh-CN': '已发布到工作区', 'en-US': 'Published to workspace' },
    'Approved by operations': { 'zh-CN': '已由运营批准', 'en-US': 'Approved by operations' },
    'Draft updated': { 'zh-CN': '草稿已更新', 'en-US': 'Draft updated' },
    'Content studio / New article': { 'zh-CN': '内容工作台 / 新建文章', 'en-US': 'Content studio / New article' },
    'Create a content record': { 'zh-CN': '创建内容记录', 'en-US': 'Create a content record' },
    'Save draft': { 'zh-CN': '保存草稿', 'en-US': 'Save draft' },
    'Basic information': { 'zh-CN': '基本信息', 'en-US': 'Basic information' },
    'Content type': { 'zh-CN': '内容类型', 'en-US': 'Content type' },
    'Announcement': { 'zh-CN': '公告', 'en-US': 'Announcement' },
    'Language': { 'zh-CN': '语言', 'en-US': 'Language' },
    'English': { 'zh-CN': '英语', 'en-US': 'English' },
    'Content body': { 'zh-CN': '内容正文', 'en-US': 'Content body' },
    'Summary': { 'zh-CN': '摘要', 'en-US': 'Summary' },
    'Body': { 'zh-CN': '正文', 'en-US': 'Body' },
    'Images & attachments': { 'zh-CN': '图片与附件', 'en-US': 'Images & attachments' },
    'Up to 12 files': { 'zh-CN': '最多 12 个文件', 'en-US': 'Up to 12 files' },
    'Use a remote URL': { 'zh-CN': '使用远程 URL', 'en-US': 'Use a remote URL' },
    'Image or attachment URL': { 'zh-CN': '图片或附件 URL', 'en-US': 'Image or attachment URL' },
    'Add URL': { 'zh-CN': '添加 URL', 'en-US': 'Add URL' },
    'Metadata': { 'zh-CN': '元数据', 'en-US': 'Metadata' },
    'Owner': { 'zh-CN': '所有者', 'en-US': 'Owner' },
    'Publish date': { 'zh-CN': '发布日期', 'en-US': 'Publish date' },
    'Publish time': { 'zh-CN': '发布时间', 'en-US': 'Publish time' },
    'Publish window': { 'zh-CN': '发布窗口', 'en-US': 'Publish window' },
    'Tags': { 'zh-CN': '标签', 'en-US': 'Tags' },
    'Live preview': { 'zh-CN': '实时预览', 'en-US': 'Live preview' },
    'Article card': { 'zh-CN': '文章卡片', 'en-US': 'Article card' },
    'Visible': { 'zh-CN': '可见', 'en-US': 'Visible' },
    '6 min read': { 'zh-CN': '预计阅读 6 分钟', 'en-US': '6 min read' },
    'Publishing checklist': { 'zh-CN': '发布检查清单', 'en-US': 'Publishing checklist' },
    'Title and summary are complete': { 'zh-CN': '标题和摘要已完成', 'en-US': 'Title and summary are complete' },
    'Owner and publish date selected': { 'zh-CN': '已选择所有者和发布日期', 'en-US': 'Owner and publish date selected' },
    'Approval still required': { 'zh-CN': '仍需审核', 'en-US': 'Approval still required' },
    'Wednesday, September 17, 2026 / Overview': { 'zh-CN': '2026 年 9 月 17 日，星期三 / 总览', 'en-US': 'Wednesday, September 17, 2026 / Overview' },
    'Good morning,': { 'zh-CN': '早上好，', 'en-US': 'Good morning,' },
    'New report': { 'zh-CN': '新建报告', 'en-US': 'New report' },
    'Total users': { 'zh-CN': '用户总数', 'en-US': 'Total users' },
    'Monthly revenue': { 'zh-CN': '月收入', 'en-US': 'Monthly revenue' },
    'Active projects': { 'zh-CN': '活跃项目', 'en-US': 'Active projects' },
    'Service health': { 'zh-CN': '服务健康度', 'en-US': 'Service health' },
    'All systems': { 'zh-CN': '全部系统', 'en-US': 'All systems' },
    'operational': { 'zh-CN': '运行正常', 'en-US': 'operational' },
    'Performance pulse': { 'zh-CN': '性能脉搏', 'en-US': 'Performance pulse' },
    'Revenue overview': { 'zh-CN': '收入概览', 'en-US': 'Revenue overview' },
    'Last 30 days': { 'zh-CN': '近 30 天', 'en-US': 'Last 30 days' },
    'Workspace activity': { 'zh-CN': '工作区动态', 'en-US': 'Workspace activity' },
    'Recent updates': { 'zh-CN': '最近更新', 'en-US': 'Recent updates' },
    'View all': { 'zh-CN': '查看全部', 'en-US': 'View all' },
    'Q3 regional report published': { 'zh-CN': '第三季度区域报告已发布', 'en-US': 'Q3 regional report published' },
    'Product sync completed': { 'zh-CN': '产品同步已完成', 'en-US': 'Product sync completed' },
    '8 new members joined': { 'zh-CN': '新增 8 位成员', 'en-US': '8 new members joined' },
    'Review 3 pending approvals': { 'zh-CN': '有 3 项审核待处理', 'en-US': 'Review 3 pending approvals' },
    'Import & Export': { 'zh-CN': '导入导出', 'en-US': 'Import & Export' },
    'Content / Data operations': { 'zh-CN': '内容 / 数据操作', 'en-US': 'Content / Data operations' },
    'CSV ready': { 'zh-CN': 'CSV 已就绪', 'en-US': 'CSV ready' },
    'Tasks': { 'zh-CN': '任务', 'en-US': 'Tasks' },
    'Import records': { 'zh-CN': '导入记录', 'en-US': 'Import records' },
    'Target model': { 'zh-CN': '目标模型', 'en-US': 'Target model' },
    'Article collection': { 'zh-CN': '文章集合', 'en-US': 'Article collection' },
    'Product collection': { 'zh-CN': '产品集合', 'en-US': 'Product collection' },
    'Member directory': { 'zh-CN': '成员目录', 'en-US': 'Member directory' },
    'Import mode': { 'zh-CN': '导入模式', 'en-US': 'Import mode' },
    'Upsert by ID': { 'zh-CN': '按 ID 更新或新增', 'en-US': 'Upsert by ID' },
    'Create only': { 'zh-CN': '仅创建', 'en-US': 'Create only' },
    'Update only': { 'zh-CN': '仅更新', 'en-US': 'Update only' },
    'Validate & preview': { 'zh-CN': '校验并预览', 'en-US': 'Validate & preview' },
    'Export records': { 'zh-CN': '导出记录', 'en-US': 'Export records' },
    'Scope': { 'zh-CN': '范围', 'en-US': 'Scope' },
    'Format': { 'zh-CN': '格式', 'en-US': 'Format' },
    'Download export': { 'zh-CN': '下载导出文件', 'en-US': 'Download export' },
    'Last export': { 'zh-CN': '上次导出', 'en-US': 'Last export' },
    'Articles & products': { 'zh-CN': '文章与产品', 'en-US': 'Articles & products' },
    'Export': { 'zh-CN': '导出', 'en-US': 'Export' },
    'Create new': { 'zh-CN': '新建', 'en-US': 'Create new' },
    'All types': { 'zh-CN': '全部类型', 'en-US': 'All types' },
    'Any status': { 'zh-CN': '任意状态', 'en-US': 'Any status' },
    'Any owner': { 'zh-CN': '任意所有者', 'en-US': 'Any owner' },
    'All items': { 'zh-CN': '全部项目', 'en-US': 'All items' },
    '0 selected': { 'zh-CN': '已选择 0 项', 'en-US': '0 selected' },
    'Select items to enable bulk actions.': { 'zh-CN': '选择项目后即可启用批量操作。', 'en-US': 'Select items to enable bulk actions.' },
    'Archive': { 'zh-CN': '归档', 'en-US': 'Archive' },
    'Assign': { 'zh-CN': '分配', 'en-US': 'Assign' },
    'Delete': { 'zh-CN': '删除', 'en-US': 'Delete' },
    'Type': { 'zh-CN': '类型', 'en-US': 'Type' },
    'Updated': { 'zh-CN': '更新时间', 'en-US': 'Updated' },
    'Action': { 'zh-CN': '操作', 'en-US': 'Action' },
    'Content list': { 'zh-CN': '内容列表', 'en-US': 'Content list' },
    'Login': { 'zh-CN': '登录', 'en-US': 'Login' },
    'Welcome back': { 'zh-CN': '欢迎回来', 'en-US': 'Welcome back' },
    'Sign in to your workspace': { 'zh-CN': '登录你的工作区', 'en-US': 'Sign in to your workspace' },
    'Email address': { 'zh-CN': '邮箱地址', 'en-US': 'Email address' },
    'Forgot password?': { 'zh-CN': '忘记密码？', 'en-US': 'Forgot password?' },
    'Remember me for 30 days': { 'zh-CN': '记住我 30 天', 'en-US': 'Remember me for 30 days' },
    'Sign in': { 'zh-CN': '登录', 'en-US': 'Sign in' },
    'or continue with': { 'zh-CN': '或使用以下方式继续', 'en-US': 'or continue with' },
    'Continue with Google': { 'zh-CN': '使用 Google 继续', 'en-US': 'Continue with Google' },
    'New to Guanlan?': { 'zh-CN': '第一次使用观澜？', 'en-US': 'New to Guanlan?' },
    'Create an account': { 'zh-CN': '创建账户', 'en-US': 'Create an account' },
    'Media Library': { 'zh-CN': '媒体库', 'en-US': 'Media Library' },
    'Model schema': { 'zh-CN': '模型结构', 'en-US': 'Model schema' },
    'Upload assets': { 'zh-CN': '上传资产', 'en-US': 'Upload assets' },
    'Workspace assets': { 'zh-CN': '工作区资产', 'en-US': 'Workspace assets' },
    'Quick upload': { 'zh-CN': '快速上传', 'en-US': 'Quick upload' },
    'Add new assets': { 'zh-CN': '添加新资产', 'en-US': 'Add new assets' },
    'Storage usage': { 'zh-CN': '存储用量', 'en-US': 'Storage usage' },
    'Model field designer': { 'zh-CN': '模型字段设计器', 'en-US': 'Model field designer' },
    'CMS model field designer': { 'zh-CN': 'CMS 模型字段设计器', 'en-US': 'CMS model field designer' },
    'Settings': { 'zh-CN': '设置', 'en-US': 'Settings' },
    'Configuration center': { 'zh-CN': '配置中心', 'en-US': 'Configuration center' },
    'Draft schema': { 'zh-CN': '草稿模型', 'en-US': 'Draft schema' },
    'Schema health': { 'zh-CN': '模型健康度', 'en-US': 'Schema health' },
    'Ready to publish': { 'zh-CN': '可以发布', 'en-US': 'Ready to publish' },
    'Required fields': { 'zh-CN': '必填字段', 'en-US': 'Required fields' },
    'Optional fields': { 'zh-CN': '可选字段', 'en-US': 'Optional fields' },
    'Relations': { 'zh-CN': '关联关系', 'en-US': 'Relations' },
    'Field behavior': { 'zh-CN': '字段行为', 'en-US': 'Field behavior' },
    'Preview article form': { 'zh-CN': '预览文章表单', 'en-US': 'Preview article form' },
    'Workspace Inbox': { 'zh-CN': '工作区收件箱', 'en-US': 'Workspace Inbox' },
    'Mark all read': { 'zh-CN': '全部标为已读', 'en-US': 'Mark all read' },
    'All notifications': { 'zh-CN': '全部通知', 'en-US': 'All notifications' },
    'Unread': { 'zh-CN': '未读', 'en-US': 'Unread' },
    'Preferences': { 'zh-CN': '偏好设置', 'en-US': 'Preferences' },
    'Approval requests': { 'zh-CN': '审核请求', 'en-US': 'Approval requests' },
    'Data imports': { 'zh-CN': '数据导入', 'en-US': 'Data imports' },
    'Weekly digest': { 'zh-CN': '每周摘要', 'en-US': 'Weekly digest' },
    'Access control': { 'zh-CN': '访问控制', 'en-US': 'Access control' },
    'Role permission matrix': { 'zh-CN': '角色权限矩阵', 'en-US': 'Role permission matrix' },
    'Assign members to roles': { 'zh-CN': '将成员分配到角色', 'en-US': 'Assign members to roles' },
    'Personal profile': { 'zh-CN': '个人资料', 'en-US': 'Personal profile' },
    'English (US)': { 'zh-CN': '英语（美国）', 'en-US': 'English (US)' },
    'Security': { 'zh-CN': '安全', 'en-US': 'Security' },
    'Current password': { 'zh-CN': '当前密码', 'en-US': 'Current password' },
    'New password': { 'zh-CN': '新密码', 'en-US': 'New password' },
    'Two-factor authentication': { 'zh-CN': '两步验证', 'en-US': 'Two-factor authentication' },
    'Active sessions': { 'zh-CN': '活跃会话', 'en-US': 'Active sessions' },
    'Current': { 'zh-CN': '当前', 'en-US': 'Current' },
    'Auto delete': { 'zh-CN': '自动删除', 'en-US': 'Auto delete' },
    'Deleted': { 'zh-CN': '已删除', 'en-US': 'Deleted' },
    'Deleted by': { 'zh-CN': '删除者', 'en-US': 'Deleted by' },
    'Auto-delete after 30 days': { 'zh-CN': '30 天后自动删除', 'en-US': 'Auto-delete after 30 days' },
    '12 items': { 'zh-CN': '12 项', 'en-US': '12 items' },
    'Publishing': { 'zh-CN': '发布', 'en-US': 'Publishing' },
    'Pending content': { 'zh-CN': '待审核内容', 'en-US': 'Pending content' },
    'Approval rate': { 'zh-CN': '审核通过率', 'en-US': 'Approval rate' },
    'Policy note': { 'zh-CN': '策略说明', 'en-US': 'Policy note' },
    'Review permissions': { 'zh-CN': '审核权限', 'en-US': 'Review permissions' },
    '3 pending': { 'zh-CN': '3 项待处理', 'en-US': '3 pending' },
    'Queue settings': { 'zh-CN': '队列设置', 'en-US': 'Queue settings' },
    'Workspace profile': { 'zh-CN': '工作区资料', 'en-US': 'Workspace profile' },
    'Workspace name': { 'zh-CN': '工作区名称', 'en-US': 'Workspace name' },
    'Timezone': { 'zh-CN': '时区', 'en-US': 'Timezone' },
    'Description': { 'zh-CN': '描述', 'en-US': 'Description' },
    'Publishing policy': { 'zh-CN': '发布策略', 'en-US': 'Publishing policy' },
    'Require approval before publishing': { 'zh-CN': '发布前需要审核', 'en-US': 'Require approval before publishing' },
    'Auto-save drafts': { 'zh-CN': '自动保存草稿', 'en-US': 'Auto-save drafts' },
    'Start with clarity': { 'zh-CN': '从清晰开始', 'en-US': 'Start with clarity' },
    'Create your workspace': { 'zh-CN': '创建你的工作区', 'en-US': 'Create your workspace' },
    'Work email': { 'zh-CN': '工作邮箱', 'en-US': 'Work email' },
    'I agree to the': { 'zh-CN': '我同意', 'en-US': 'I agree to the' },
    'Terms': { 'zh-CN': '服务条款', 'en-US': 'Terms' },
    'Privacy Policy': { 'zh-CN': '隐私政策', 'en-US': 'Privacy Policy' },
    'Create workspace': { 'zh-CN': '创建工作区', 'en-US': 'Create workspace' },
    'Task center': { 'zh-CN': '任务中心', 'en-US': 'Task center' },
    '3 open tasks': { 'zh-CN': '3 项进行中的任务', 'en-US': '3 open tasks' },
    'My tasks': { 'zh-CN': '我的任务', 'en-US': 'My tasks' },
    'Completed this week': { 'zh-CN': '本周已完成', 'en-US': 'Completed this week' },
    'Average response': { 'zh-CN': '平均响应', 'en-US': 'Average response' },
    'Across content operations': { 'zh-CN': '覆盖全部内容运营', 'en-US': 'Across content operations' },
    'Access denied': { 'zh-CN': '拒绝访问', 'en-US': 'Access denied' },
    'Page not found': { 'zh-CN': '页面未找到', 'en-US': 'Page not found' },
    'Something went wrong': { 'zh-CN': '出了点问题', 'en-US': 'Something went wrong' }
    ,'Search': { 'zh-CN': '搜索', 'en-US': 'Search' }
    ,'Clear selection': { 'zh-CN': '清除选择', 'en-US': 'Clear selection' }
    ,'Content team': { 'zh-CN': '内容团队', 'en-US': 'Content team' }
    ,'System': { 'zh-CN': '系统', 'en-US': 'System' }
    ,'Operations': { 'zh-CN': '运营', 'en-US': 'Operations' }
    ,'Switch to English': { 'zh-CN': '切换到英文', 'en-US': 'Switch to English' }
    ,'Toggle theme': { 'zh-CN': '切换主题', 'en-US': 'Toggle theme' }
    ,'Light theme': { 'zh-CN': '浅色主题', 'en-US': 'Light theme' }
    ,'Dark theme': { 'zh-CN': '深色主题', 'en-US': 'Dark theme' }
    ,'White interior desk': { 'zh-CN': '白色室内书桌', 'en-US': 'White interior desk' }
    ,'Blueberry bowl': { 'zh-CN': '蓝莓碗', 'en-US': 'Blueberry bowl' }
    ,'White building and blue sky': { 'zh-CN': '白色建筑与蓝天', 'en-US': 'White building and blue sky' }
    ,'White plaza': { 'zh-CN': '白色广场', 'en-US': 'White plaza' }
    ,'Golden bridge detail': { 'zh-CN': '金色桥梁细节', 'en-US': 'Golden bridge detail' }
    ,'Cherry tomatoes': { 'zh-CN': '樱桃番茄', 'en-US': 'Cherry tomatoes' }
    ,'Coffee bar': { 'zh-CN': '咖啡吧', 'en-US': 'Coffee bar' }
    ,'White architecture ribs': { 'zh-CN': '白色建筑肋骨结构', 'en-US': 'White architecture ribs' }
    ,'Yellow flowers': { 'zh-CN': '黄色花朵', 'en-US': 'Yellow flowers' }
    ,'Hand holding pastry': { 'zh-CN': '手拿糕点', 'en-US': 'Hand holding pastry' }
  });
  Object.assign(textMap, {
    'Article': { 'zh-CN': '文章', 'en-US': 'Article' },
    'Articles': { 'zh-CN': '文章', 'en-US': 'Articles' },
    'Product': { 'zh-CN': '产品', 'en-US': 'Product' },
    'Products': { 'zh-CN': '产品', 'en-US': 'Products' },
    'Announcement': { 'zh-CN': '公告', 'en-US': 'Announcement' },
    'Published': { 'zh-CN': '已发布', 'en-US': 'Published' },
    'Draft': { 'zh-CN': '草稿', 'en-US': 'Draft' },
    'Review': { 'zh-CN': '审核', 'en-US': 'Review' },
    'Share': { 'zh-CN': '分享', 'en-US': 'Share' },
    'Cancel': { 'zh-CN': '取消', 'en-US': 'Cancel' },
    'Month': { 'zh-CN': '月份', 'en-US': 'Month' },
    'Unique': { 'zh-CN': '独立', 'en-US': 'Unique' },
    'Trend': { 'zh-CN': '趋势', 'en-US': 'Trend' },
    'Total': { 'zh-CN': '总计', 'en-US': 'Total' },
    'January': { 'zh-CN': '1 月', 'en-US': 'January' },
    'February': { 'zh-CN': '2 月', 'en-US': 'February' },
    'Asia / Shanghai': { 'zh-CN': '亚洲 / 上海', 'en-US': 'Asia / Shanghai' },
    'America / New York': { 'zh-CN': '美洲 / 纽约', 'en-US': 'America / New York' },
    'Europe / London': { 'zh-CN': '欧洲 / 伦敦', 'en-US': 'Europe / London' },
    'Showing': { 'zh-CN': '显示', 'en-US': 'Showing' },
    'items': { 'zh-CN': '项', 'en-US': 'items' },
    'records': { 'zh-CN': '条记录', 'en-US': 'records' },
    'rows': { 'zh-CN': '行', 'en-US': 'rows' },
    'sections': { 'zh-CN': '个章节', 'en-US': 'sections' },
    'Filters': { 'zh-CN': '筛选', 'en-US': 'Filters' },
    'Search content': { 'zh-CN': '搜索内容', 'en-US': 'Search content' },
    'Status': { 'zh-CN': '状态', 'en-US': 'Status' },
    'STATUS': { 'zh-CN': '状态', 'en-US': 'STATUS' },
    'Title': { 'zh-CN': '标题', 'en-US': 'Title' },
    'Password': { 'zh-CN': '密码', 'en-US': 'Password' },
    'Report': { 'zh-CN': '报告', 'en-US': 'Report' },
    'Choose': { 'zh-CN': '选择文件', 'en-US': 'Choose' },
    'Upload All': { 'zh-CN': '全部上传', 'en-US': 'Upload All' },
    'Clear': { 'zh-CN': '清空', 'en-US': 'Clear' },
    'Click, drag, or paste files here': { 'zh-CN': '点击、拖拽或粘贴文件到这里', 'en-US': 'Click, drag, or paste files here' },
    'Article images and attachments uploader': { 'zh-CN': '文章图片与附件上传器', 'en-US': 'Article images and attachments uploader' },
    'Clear date or time': { 'zh-CN': '清除日期或时间', 'en-US': 'Clear date or time' },
    'tag(s)': { 'zh-CN': '个标签', 'en-US': 'tag(s)' },
    'A calm operating system for regional growth and content work.': { 'zh-CN': '一个服务于区域增长和内容工作的平稳运营系统。', 'en-US': 'A calm operating system for regional growth and content work.' },
    '一份关于区域增长、活跃用户和市场覆盖的运营分析报告。': { 'zh-CN': '一份关于区域增长、活跃用户和市场覆盖的运营分析报告。', 'en-US': 'An operations analysis report about regional growth, active users, and market coverage.' },
    '本季度的区域数据保持稳定增长。北美区域贡献了最大的活跃用户规模，亚太区域的新增用户增速最为明显。': { 'zh-CN': '本季度的区域数据保持稳定增长。北美区域贡献了最大的活跃用户规模，亚太区域的新增用户增速最为明显。', 'en-US': 'Regional data kept growing steadily this quarter. North America contributed the largest active-user base, while APAC showed the clearest new-user growth.' }
  });
  var phrasePairs = [
    ['Home', '首页'], ['Profile', '资料'], ['Settings', '设置'], ['Login', '登录'], ['Sign up', '注册'],
    ['Media Library', '媒体库'], ['Model Designer', '模型设计器'], ['Detail', '详情'], ['Audit Log', '审计日志'],
    ['Import & Export', '导入导出'], ['Content list', '内容列表'], ['Notifications', '通知中心'], ['Recycle Bin', '回收站'],
    ['Review Queue', '审核队列'], ['Task Center', '任务中心'],
    ['vs last month', '较上月'],
    ['this quarter', '本季度'],
    ['this month', '本月'],
    ['minutes ago', '分钟前'],
    ['minute ago', '分钟前'],
    ['min ago', '分钟前'],
    ['hours ago', '小时前'],
    ['hour ago', '小时前'],
    ['days ago', '天前'],
    ['day ago', '天前'],
    ['Yesterday', '昨天'],
    ['Today', '今天'],
    ['Last 30 days', '近 30 天'],
    ['January', '1 月'], ['February', '2 月'], ['March', '3 月'], ['April', '4 月'],
    ['May', '5 月'], ['June', '6 月'], ['July', '7 月'], ['August', '8 月'],
    ['September', '9 月'], ['October', '10 月'], ['November', '11 月'], ['December', '12 月'],
    ['Jan', '1 月'], ['Feb', '2 月'], ['Mar', '3 月'], ['Apr', '4 月'], ['Jun', '6 月'],
    ['Jul', '7 月'], ['Aug', '8 月'], ['Sep', '9 月'], ['Oct', '10 月'], ['Nov', '11 月'], ['Dec', '12 月'],
    ['Content team', '内容团队'], ['System', '系统'], ['Workspace', '工作区'], ['Operations', '运营'],
    ['Editor', '编辑器']
  ];
  var reverseMap = buildReverseMap();
  var nodeKeys = new WeakMap();

  function readPreferences() {
    try {
      return Object.assign({ locale: defaultLocale, theme: defaultTheme }, JSON.parse(localStorage.getItem(storageKey) || '{}'));
    } catch (error) {
      return { locale: defaultLocale, theme: defaultTheme };
    }
  }

  function writePreferences(prefs) {
    try { localStorage.setItem(storageKey, JSON.stringify(prefs)); } catch (error) {}
  }

  function buildReverseMap() {
    var output = {};
    Object.keys(textMap).forEach(function (key) {
      output[key] = key;
      Object.keys(textMap[key]).forEach(function (locale) {
        output[textMap[key][locale]] = key;
      });
    });
    return output;
  }

  function getNodeKey(node) {
    if (nodeKeys.has(node)) return nodeKeys.get(node);
    var raw = node.nodeValue || '';
    var trimmed = raw.trim();
    var key = reverseMap[trimmed];
    if (key) nodeKeys.set(node, key);
    return key || null;
  }

  function localizeValue(value, locale) {
    var trimmed = value.trim();
    var key = reverseMap[trimmed];
    if (key && textMap[key]) return value.replace(trimmed, textMap[key][locale] || textMap[key][defaultLocale] || key);
    var next = value;
    if (locale === 'zh-CN') {
      next = next.replace(/^(\s*)(\d+)\s+selected(\s*)$/i, '$1已选择 $2 项$3');
      next = next.replace(/^(\s*)(\d+)\s+items?\s+ready\s+for\s+a\s+bulk\s+action\.(\s*)$/i, '$1$2 项已准备好执行批量操作。$3');
      next = next.replace(/Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+items?/i, '显示第 $1-$2 条，共 $3 项');
      next = next.replace(/^(\s*)of\s+(\d+)\s+items?(\s*)$/i, '$1共 $2 项$3');
      next = next.replace(/(\d+)\s+sections?/gi, '$1 个章节');
      next = next.replace(/(\d+)\s+tag\(s\)/gi, '$1 个标签');
      next = next.replace(/(All items|Articles|Products)\s*·\s*(\d+)/i, function (_, label, count) {
        var labels = { 'All items': '全部项目', Articles: '文章', Products: '产品' };
        return labels[label] + ' · ' + count;
      });
    } else {
      next = next.replace(/^(\s*)已选择\s*(\d+)\s*项(\s*)$/, '$1$2 selected$3');
      next = next.replace(/^(\s*)(\d+)\s*项已准备好执行批量操作。(\s*)$/, '$1$2 items ready for a bulk action.$3');
      next = next.replace(/显示第\s*(\d+)-(\d+)\s*条，共\s*(\d+)\s*项/, 'Showing $1 to $2 of $3 items');
      next = next.replace(/^(\s*)共\s*(\d+)\s*项(\s*)$/, '$1of $2 items$3');
      next = next.replace(/(\d+)\s*个章节/g, '$1 sections');
      next = next.replace(/(\d+)\s*个标签/g, '$1 tag(s)');
      next = next.replace(/(全部项目|文章|产品)\s*·\s*(\d+)/g, function (_, label, count) {
        var labels = { '全部项目': 'All items', '文章': 'Articles', '产品': 'Products' };
        return labels[label] + ' · ' + count;
      });
    }
    phrasePairs.forEach(function (pair) {
      var from = locale === 'zh-CN' ? pair[0] : pair[1];
      var to = locale === 'zh-CN' ? pair[1] : pair[0];
      var escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var pattern = /^[A-Za-z0-9][A-Za-z0-9 &/-]*$/.test(from)
        ? '(?<![A-Za-z0-9])' + escaped + '(?![A-Za-z0-9])'
        : escaped;
      next = next.replace(new RegExp(pattern, 'g'), to);
    });
    return next;
  }

  function translateAttributes(locale, root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = [];
    var attributeSelector = 'textarea,input,select,[placeholder],[title],[aria-label],[alt]';
    if (scope.nodeType === 1 && scope.matches && scope.matches(attributeSelector)) nodes.push(scope);
    nodes = nodes.concat(Array.from(scope.querySelectorAll(attributeSelector)));
    nodes.forEach(function (node) {
      ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (attribute) {
        if (!node.hasAttribute(attribute)) return;
        node.setAttribute(attribute, localizeValue(node.getAttribute(attribute), locale));
      });
      if ((node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') && node.value) {
        node.value = localizeValue(node.value, locale);
      }
    });
  }

  function translateText(locale, root) {
    var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      node.nodeValue = localizeValue(node.nodeValue, locale);
    });
    translateAttributes(locale, root || document);
    document.title = localizeValue(document.title, locale);
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
    document.querySelectorAll('[data-gl-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      var locale = readPreferences().locale;
      var label = theme === 'dark'
        ? (locale === 'zh-CN' ? '浅色主题' : 'Light theme')
        : (locale === 'zh-CN' ? '深色主题' : 'Dark theme');
      button.setAttribute('title', label);
      var icon = button.querySelector('i');
      if (icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    });
  }

  function applyLocale(locale) {
    var ready = Promise.resolve();
    if (window.JquanUIComponents && JquanUIComponents.i18nApi) {
      ready = JquanUIComponents.i18nApi.setLocale(locale).catch(function () {});
    } else {
      document.documentElement.lang = locale;
    }
    return ready.then(function () {
      translateText(locale, document.body);
      refreshPagination();
      document.querySelectorAll('[data-gl-locale]').forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-gl-locale') === locale ? 'true' : 'false');
      });
    });
  }

  function refreshPagination() {
    if (!window.JquanUIComponents || !JquanUIComponents.paginationApi) return;
    document.querySelectorAll('[jq-pagination], [data-jq-pagination]').forEach(function (node) {
      var handle = JquanUIComponents.paginationApi.get(node);
      if (handle && typeof handle.update === 'function') handle.update({}, 'locale');
    });
  }

  function createButton(label, icon, attrs) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'gl-preference-button';
    Object.keys(attrs || {}).forEach(function (name) { button.setAttribute(name, attrs[name]); });
    button.innerHTML = icon ? '<i class="ph ' + icon + '"></i><span>' + label + '</span>' : '<span>' + label + '</span>';
    return button;
  }

  function mountControls(prefs) {
    if (document.querySelector('[data-gl-preferences]')) return;
    var host = document.querySelector('.gl-toolbar') || document.querySelector('.gl-auth-card') || document.querySelector('.gl-screen');
    if (!host) return;
    var controls = document.createElement('div');
    controls.className = 'gl-preferences';
    controls.setAttribute('data-gl-preferences', '');
    controls.innerHTML = '<span class="gl-preferences-label lang-en:tracking-wide" data-i18n="preferences">偏好</span>';
    controls.appendChild(createButton('中', '', { 'data-gl-locale': 'zh-CN', 'data-i18n-switcher': 'zh-CN', 'aria-label': '切换到中文' }));
    controls.appendChild(createButton('EN', '', { 'data-gl-locale': 'en-US', 'data-i18n-switcher': 'en-US', 'aria-label': 'Switch to English' }));
    controls.appendChild(createButton('', prefs.theme === 'dark' ? 'ph-sun' : 'ph-moon', { 'data-gl-theme-toggle': '', 'aria-label': '切换深浅色' }));
    if (host.classList.contains('gl-toolbar')) host.appendChild(controls);
    else host.insertAdjacentElement('afterbegin', controls);
  }

  function injectStyle() {
    if (document.getElementById('guanlan-preferences-style')) return;
    var style = document.createElement('style');
    style.id = 'guanlan-preferences-style';
    style.textContent = `
.gl-preferences{display:inline-flex;align-items:center;gap:4px;margin-left:auto;border:1px solid rgba(231,234,246,.82);border-radius:999px;background:rgba(255,255,255,.74);padding:4px;box-shadow:0 16px 40px rgba(86,103,214,.10);backdrop-filter:blur(18px)}
.gl-preferences-label{padding:0 8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:#747BA8}
.gl-preference-button{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;gap:5px;border:0;border-radius:999px;background:transparent;color:#747BA8;font-size:12px;font-weight:900;cursor:pointer;transition:background-color .2s ease,color .2s ease}
.gl-preference-button:hover,.gl-preference-button[aria-pressed="true"]{background:rgba(89,107,232,.12);color:#596BE8}
html[data-theme="dark"] body.gl-page{background:#0b1220!important;color:#e8eef7!important;color-scheme:dark}
html[data-theme="dark"] .gl-screen{background:#0f1726!important;color:#e8eef7!important}
html[data-theme="dark"] .gl-screen> .absolute{background:linear-gradient(135deg,#0b1220 0%,#111c2d 56%,#18263a 100%)!important;opacity:1!important}
html[data-theme="dark"] .gl-content{background:#0f1726!important}
html[data-theme="dark"] .gl-sidebar,html[data-theme="dark"] .gl-toolbar{border-color:#26374b!important;background:#0d1625!important}
html[data-theme="dark"] .gl-panel,html[data-theme="dark"] .gl-card,html[data-theme="dark"] .gl-form-section,html[data-theme="dark"] .gl-table-wrap,html[data-theme="dark"] .gl-auth-card{border-color:#2a3d53!important;background:#162235!important;box-shadow:0 24px 60px rgba(0,0,0,.28)!important}
html[data-theme="dark"] .gl-flyout-menu,html[data-theme="dark"] .gl-preferences{border-color:#30465e!important;background:#121e2e!important;box-shadow:0 24px 60px rgba(0,0,0,.36)!important}
html[data-theme="dark"] .gl-map-marker,html[data-theme="dark"] .gl-chip{border-color:#30465e!important;background:#17263a!important;color:#edf3fb!important}
html[data-theme="dark"] .gl-nav-icon{color:#8fa2b9!important}
html[data-theme="dark"] .gl-nav-icon:hover,html[data-theme="dark"] .gl-nav-icon:focus-visible,html[data-theme="dark"] .gl-nav-active{background:rgba(123,145,255,.16)!important;color:#aebaff!important}
html[data-theme="dark"] .gl-action{background:#6d7ff2!important;box-shadow:0 14px 32px rgba(65,86,190,.28)!important}
html[data-theme="dark"] .gl-action:hover{background:#8190ff!important}
html[data-theme="dark"] .text-ink,html[data-theme="dark"] .gl-section-title,html[data-theme="dark"] .gl-number,html[data-theme="dark"] .gl-field-label{color:#edf3fb!important}
html[data-theme="dark"] .text-muted,html[data-theme="dark"] .gl-label,html[data-theme="dark"] .gl-kicker,html[data-theme="dark"] .gl-preferences-label{color:#a4b2c4!important}
html[data-theme="dark"] .gl-input,html[data-theme="dark"] .gl-select,html[data-theme="dark"] .gl-action-soft{border-color:#30465e!important;background:#101b2b!important;color:#edf3fb!important}
html[data-theme="dark"] .gl-action-soft:hover{border-color:#6d7ff2!important;background:#182941!important}
html[data-theme="dark"] .gl-table-head{background:#101b2b!important;color:#aebdce!important}
html[data-theme="dark"] .gl-table-row{border-color:#26384d!important;color:#c2cedc!important}
html[data-theme="dark"] .gl-table-row:hover{background:#1a2b40!important}
html[data-theme="dark"] .bg-white,html[data-theme="dark"] .bg-white\/55,html[data-theme="dark"] .bg-white\/60,html[data-theme="dark"] .bg-white\/80,html[data-theme="dark"] .bg-white\/88,html[data-theme="dark"] .bg-white\/92{background-color:#162235!important}
html[data-theme="dark"] [jq-select-trigger],html[data-theme="dark"] [jq-select-panel]{border-color:#30465e!important;background:#121e2e!important;color:#edf3fb!important}
html[data-theme="dark"] [jq-select-option]:hover,html[data-theme="dark"] [jq-select-option][aria-selected="true"]{background:#1d3550!important;color:#edf3fb!important}
html:lang(en) .gl-section-title{letter-spacing:0}
@media(max-width:720px){.gl-preferences{width:100%;justify-content:flex-end;margin-left:0}.gl-preferences-label{margin-right:auto}}
`;
    document.head.appendChild(style);
  }

  function initI18n(prefs) {
    if (!window.JquanUI || !window.JquanUIComponents || !JquanUIComponents.i18nApi) return Promise.resolve();
    JquanUI.use(JquanUIComponents.i18n);
    JquanUIComponents.i18nApi.registerMessages({
      'zh-CN': { preferences: '偏好', pagination: { total: '共 {{total}} 条', prev: '上一页', next: '下一页', pageSize: '{{size}} 条/页', go: '跳至' }, numberInput: { decrease: '减少数值', increase: '增加数值' } },
      'en-US': { preferences: 'Prefs', pagination: { total: 'Total {{total}}', prev: 'Prev', next: 'Next', pageSize: '{{size}} / page', go: 'Go' }, numberInput: { decrease: 'Decrease value', increase: 'Increase value' } }
    });
    JquanUIComponents.i18nApi.on('change', function (event) {
      var next = readPreferences();
      next.locale = event.locale;
      writePreferences(next);
      translateText(event.locale, document.body);
      refreshPagination();
    });
    return JquanUIComponents.i18nApi.init({ locale: prefs.locale, fallbackLocale: 'en-US', availableLocales: ['zh-CN', 'en-US'], persist: false, autoObserve: true, detectOrder: ['default'] });
  }

  function init() {
    var prefs = readPreferences();
    injectStyle();
    mountControls(prefs);
    initI18n(prefs).then(function () { applyLocale(prefs.locale); });
    applyTheme(prefs.theme);
    document.addEventListener('click', function (event) {
      var localeButton = event.target.closest('[data-gl-locale]');
      if (localeButton) {
        prefs.locale = localeButton.getAttribute('data-gl-locale') || defaultLocale;
        writePreferences(prefs);
        applyLocale(prefs.locale);
      }
      var themeButton = event.target.closest('[data-gl-theme-toggle]');
      if (themeButton) {
        prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
        writePreferences(prefs);
        applyTheme(prefs.theme);
      }
    });
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.from(mutation.addedNodes || []).forEach(function (node) {
          if (node.nodeType === 1) translateText(readPreferences().locale, node);
          if (node.nodeType === 3 && node.nodeValue) node.nodeValue = localizeValue(node.nodeValue, readPreferences().locale);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
