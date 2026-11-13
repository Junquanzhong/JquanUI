(function () {
  var storageKey = 'clarity:preferences';
  var defaultLocale = 'en-US';
  var defaultTheme = 'light';
  var textMap = {
    'Content': { 'zh-CN': '内容', 'en-US': 'Content' },
    'Articles': { 'zh-CN': '文章', 'en-US': 'Articles' },
    'Blog articles': { 'zh-CN': '博客文章', 'en-US': 'Blog articles' },
    'Article detail': { 'zh-CN': '文章详情', 'en-US': 'Article detail' },
    'Library': { 'zh-CN': '素材库', 'en-US': 'Library' },
    'Media library': { 'zh-CN': '媒体库', 'en-US': 'Media library' },
    'Authors': { 'zh-CN': '作者', 'en-US': 'Authors' },
    'Account': { 'zh-CN': '账户', 'en-US': 'Account' },
    'Profile': { 'zh-CN': '资料', 'en-US': 'Profile' },
    'Login': { 'zh-CN': '登录', 'en-US': 'Login' },
    'Calendar': { 'zh-CN': '日历', 'en-US': 'Calendar' },
    'Menu': { 'zh-CN': '菜单', 'en-US': 'Menu' },
    'Search': { 'zh-CN': '搜索', 'en-US': 'Search' },
    'Create': { 'zh-CN': '创建', 'en-US': 'Create' },
    'Profile settings': { 'zh-CN': '资料设置', 'en-US': 'Profile settings' },
    'My assets': { 'zh-CN': '我的素材', 'en-US': 'My assets' },
    'Recent drafts': { 'zh-CN': '最近草稿', 'en-US': 'Recent drafts' },
    'Sign out': { 'zh-CN': '退出登录', 'en-US': 'Sign out' },
    'New article': { 'zh-CN': '新建文章', 'en-US': 'New article' },
    'Upload asset': { 'zh-CN': '上传素材', 'en-US': 'Upload asset' },
    'Invite author': { 'zh-CN': '邀请作者', 'en-US': 'Invite author' },
    'Articles gallery': { 'zh-CN': '文章画廊', 'en-US': 'Articles gallery' },
    'Blog layout': { 'zh-CN': '博客布局', 'en-US': 'Blog layout' },
    'Settings': { 'zh-CN': '设置', 'en-US': 'Settings' },
    'Author profile': { 'zh-CN': '作者资料', 'en-US': 'Author profile' },
    'Recent work': { 'zh-CN': '最近作品', 'en-US': 'Recent work' },
    'Published posts': { 'zh-CN': '已发布文章', 'en-US': 'Published posts' },
    'Photo essays': { 'zh-CN': '摄影专题', 'en-US': 'Photo essays' },
    'Approval rate': { 'zh-CN': '通过率', 'en-US': 'Approval rate' },
    'Back to blog': { 'zh-CN': '返回博客', 'en-US': 'Back to blog' },
    'Status': { 'zh-CN': '状态', 'en-US': 'Status' },
    'Tags': { 'zh-CN': '标签', 'en-US': 'Tags' },
    'Save article': { 'zh-CN': '保存文章', 'en-US': 'Save article' },
    'Ready to publish': { 'zh-CN': '可发布', 'en-US': 'Ready to publish' },
    'Join workspace': { 'zh-CN': '加入工作区', 'en-US': 'Join workspace' },
    'Create your account': { 'zh-CN': '创建账号', 'en-US': 'Create your account' },
    'Name': { 'zh-CN': '姓名', 'en-US': 'Name' },
    'Email': { 'zh-CN': '邮箱', 'en-US': 'Email' },
    'Team role': { 'zh-CN': '团队角色', 'en-US': 'Team role' },
    'Signup': { 'zh-CN': '注册', 'en-US': 'Signup' },
    'Already have access?': { 'zh-CN': '已有访问权限？', 'en-US': 'Already have access?' },
    'Full name': { 'zh-CN': '姓名', 'en-US': 'Full name' },
    'Role': { 'zh-CN': '角色', 'en-US': 'Role' },
    'Bio': { 'zh-CN': '简介', 'en-US': 'Bio' },
    'Save profile': { 'zh-CN': '保存资料', 'en-US': 'Save profile' },
    'Security': { 'zh-CN': '安全', 'en-US': 'Security' },
    'Notifications': { 'zh-CN': '通知', 'en-US': 'Notifications' },
    'Two-factor authentication': { 'zh-CN': '两步验证', 'en-US': 'Two-factor authentication' },
    'Update security': { 'zh-CN': '更新安全设置', 'en-US': 'Update security' },
    'Weekly editorial digest': { 'zh-CN': '每周编辑摘要', 'en-US': 'Weekly editorial digest' },
    'Asset approval reminders': { 'zh-CN': '素材审批提醒', 'en-US': 'Asset approval reminders' },
    'Comment mentions': { 'zh-CN': '评论提及', 'en-US': 'Comment mentions' },
    'Upload': { 'zh-CN': '上传', 'en-US': 'Upload' },
    'Storage': { 'zh-CN': '存储', 'en-US': 'Storage' },
    'Select assets for a story': { 'zh-CN': '为故事选择素材', 'en-US': 'Select assets for a story' }
  };
  Object.assign(textMap, {
    'Primary navigation': { 'zh-CN': '主导航', 'en-US': 'Primary navigation' },
    'Clarity Editorial home': { 'zh-CN': 'Clarity Editorial 首页', 'en-US': 'Clarity Editorial home' },
    'Articles gallery': { 'zh-CN': '文章画廊', 'en-US': 'Articles gallery' },
    'Content / Articles': { 'zh-CN': '内容 / 文章', 'en-US': 'Content / Articles' },
    'Blog articles': { 'zh-CN': '博客文章', 'en-US': 'Blog articles' },
    'Article detail': { 'zh-CN': '文章详情', 'en-US': 'Article detail' },
    'Library / Media library': { 'zh-CN': '素材库 / 媒体库', 'en-US': 'Library / Media library' },
    'Settings / Account': { 'zh-CN': '设置 / 账户', 'en-US': 'Settings / Account' },
    'Logout': { 'zh-CN': '退出登录', 'en-US': 'Logout' },
    '3 Months': { 'zh-CN': '3 个月', 'en-US': '3 Months' },
    '6 Months': { 'zh-CN': '6 个月', 'en-US': '6 Months' },
    '12 Months': { 'zh-CN': '12 个月', 'en-US': '12 Months' },
    'Article ranges': { 'zh-CN': '文章时间范围', 'en-US': 'Article ranges' },
    'Showing 1 to 20 of 25 elements': { 'zh-CN': '显示第 1-20 条，共 25 条', 'en-US': 'Showing 1 to 20 of 25 elements' },
    'Showing 1 to 9 of 42 posts': { 'zh-CN': '显示第 1-9 篇，共 42 篇', 'en-US': 'Showing 1 to 9 of 42 posts' },
    'Having problems with the web app?': { 'zh-CN': '使用应用时遇到问题？', 'en-US': 'Having problems with the web app?' },
    'Contact Us': { 'zh-CN': '联系我们', 'en-US': 'Contact Us' },
    'Author profile': { 'zh-CN': '作者资料', 'en-US': 'Author profile' },
    'Senior contributor focused on architecture, light, and product culture. Her work keeps a high signal-to-noise ratio, pairing clean photography with direct editorial framing.': { 'zh-CN': '资深撰稿人，专注于建筑、光线与产品文化。她的作品保持高信噪比，用干净的摄影和直接的编辑框架传达观点。', 'en-US': 'Senior contributor focused on architecture, light, and product culture. Her work keeps a high signal-to-noise ratio, pairing clean photography with direct editorial framing.' },
    'Published posts': { 'zh-CN': '已发布文章', 'en-US': 'Published posts' },
    'Photo essays': { 'zh-CN': '摄影专题', 'en-US': 'Photo essays' },
    'Recent work': { 'zh-CN': '最近作品', 'en-US': 'Recent work' },
    'Blue spaces and product patience': { 'zh-CN': '蓝色空间与产品耐心', 'en-US': 'Blue spaces and product patience' },
    'The office as a quiet signal': { 'zh-CN': '办公室是一种安静的信号', 'en-US': 'The office as a quiet signal' },
    'A process that leaves room': { 'zh-CN': '留有余地的流程', 'en-US': 'A process that leaves room' },
    'Back to blog': { 'zh-CN': '返回博客', 'en-US': 'Back to blog' },
    'June 15 2016 / Funding': { 'zh-CN': '2016 年 6 月 15 日 / 融资', 'en-US': 'June 15 2016 / Funding' },
    'The startup funding': { 'zh-CN': '创业公司融资', 'en-US': 'The startup funding' },
    'Editorial review passed': { 'zh-CN': '编辑审核已通过', 'en-US': 'Editorial review passed' },
    'Hero image prepared for the funding feature package.': { 'zh-CN': '融资专题的主图已经准备就绪。', 'en-US': 'Hero image prepared for the funding feature package.' },
    'A clean editorial detail page keeps the story readable while still exposing the operational state editors need.': { 'zh-CN': '干净的编辑详情页让故事保持易读，同时展示编辑需要掌握的运营状态。', 'en-US': 'A clean editorial detail page keeps the story readable while still exposing the operational state editors need.' },
    'The page uses a broad photograph, quiet metadata, and narrow paragraphs. The related controls stay nearby but do not compete with the article itself.': { 'zh-CN': '页面使用宽幅照片、克制的元数据和窄栏段落。相关控件保持在附近，但不会抢走文章本身的注意力。', 'en-US': 'The page uses a broad photograph, quiet metadata, and narrow paragraphs. The related controls stay nearby but do not compete with the article itself.' },
    'For CMS work this template can host preview, revision, translation status, approval notes, and image rights without changing the visual language from the reference screens.': { 'zh-CN': '在 CMS 工作中，这个模板可以承载预览、修订、翻译状态、审核备注和图片版权信息，同时保持参考界面的视觉语言。', 'en-US': 'For CMS work this template can host preview, revision, translation status, approval notes, and image rights without changing the visual language from the reference screens.' },
    'Ready to publish': { 'zh-CN': '可以发布', 'en-US': 'Ready to publish' },
    'June 15 2016': { 'zh-CN': '2016 年 6 月 15 日', 'en-US': 'June 15 2016' },
    'Read more': { 'zh-CN': '阅读更多', 'en-US': 'Read more' },
    'The very first article': { 'zh-CN': '第一篇文章', 'en-US': 'The very first article' },
    'How to do this process': { 'zh-CN': '如何完成这个流程', 'en-US': 'How to do this process' },
    'Marketing in the world': { 'zh-CN': '世界中的营销', 'en-US': 'Marketing in the world' },
    'Related posts': { 'zh-CN': '相关文章', 'en-US': 'Related posts' },
    'Are you ready to buy a home theater audio system': { 'zh-CN': '准备好购买家庭影院音响系统了吗', 'en-US': 'Are you ready to buy a home theater audio system' },
    'The thing is that I am quite fond of love, I think that it is a pretty all right deal. However, I am going to have to admit that my emotional baggage has built up walls.': { 'zh-CN': '事实上我很喜欢爱。我觉得这是一笔相当不错的交易。不过我也不得不承认，积累的情感负担已经筑起了墙。', 'en-US': 'The thing is that I am quite fond of love, I think that it is a pretty all right deal. However, I am going to have to admit that my emotional baggage has built up walls.' },
    'August 15 2016': { 'zh-CN': '2016 年 8 月 15 日', 'en-US': 'August 15 2016' },
    'Welcome back': { 'zh-CN': '欢迎回来', 'en-US': 'Welcome back' },
    'A quiet room for planning, editing, and publishing stories.': { 'zh-CN': '一个用于策划、编辑和发布故事的安静空间。', 'en-US': 'A quiet room for planning, editing, and publishing stories.' },
    'Sign in': { 'zh-CN': '登录', 'en-US': 'Sign in' },
    'New to the workspace?': { 'zh-CN': '第一次使用这个工作区？', 'en-US': 'New to the workspace?' },
    'Create an account': { 'zh-CN': '创建账户', 'en-US': 'Create an account' },
    'All folders': { 'zh-CN': '全部文件夹', 'en-US': 'All folders' },
    'Editorial covers': { 'zh-CN': '编辑封面', 'en-US': 'Editorial covers' },
    'Author portraits': { 'zh-CN': '作者肖像', 'en-US': 'Author portraits' },
    'Upload': { 'zh-CN': '上传', 'en-US': 'Upload' },
    'JquanUI Media Picker is mounted with Clarity classes, so the same component fits this lighter editorial language.': { 'zh-CN': 'JquanUI Media Picker 已使用 Clarity 样式挂载，因此同一个组件也适合这种轻量的编辑风格。', 'en-US': 'JquanUI Media Picker is mounted with Clarity classes, so the same component fits this lighter editorial language.' },
    'Storage': { 'zh-CN': '存储', 'en-US': 'Storage' },
    '6.2 GB of 10 GB used': { 'zh-CN': '已使用 10 GB 中的 6.2 GB', 'en-US': '6.2 GB of 10 GB used' },
    'Profile settings': { 'zh-CN': '资料设置', 'en-US': 'Profile settings' },
    'Editor in chief': { 'zh-CN': '主编', 'en-US': 'Editor in chief' },
    'Photo editor': { 'zh-CN': '图片编辑', 'en-US': 'Photo editor' },
    'Keeps the editorial calendar calm, readable, and on time.': { 'zh-CN': '让编辑日历保持从容、清晰，并按时推进。', 'en-US': 'Keeps the editorial calendar calm, readable, and on time.' },
    'Save profile': { 'zh-CN': '保存资料', 'en-US': 'Save profile' },
    'Require a second step when signing in.': { 'zh-CN': '登录时要求额外的验证步骤。', 'en-US': 'Require a second step when signing in.' },
    'Update security': { 'zh-CN': '更新安全设置', 'en-US': 'Update security' },
    'Join workspace': { 'zh-CN': '加入工作区', 'en-US': 'Join workspace' },
    'Create your account': { 'zh-CN': '创建账号', 'en-US': 'Create your account' },
    'Team role': { 'zh-CN': '团队角色', 'en-US': 'Team role' },
    'Already have access?': { 'zh-CN': '已有访问权限？', 'en-US': 'Already have access?' },
    'Media': { 'zh-CN': '媒体', 'en-US': 'Media' },
    'Toggle theme': { 'zh-CN': '切换主题', 'en-US': 'Toggle theme' },
    'Switch to English': { 'zh-CN': '切换到英文', 'en-US': 'Switch to English' },
    'Light theme': { 'zh-CN': '浅色主题', 'en-US': 'Light theme' },
    'Dark theme': { 'zh-CN': '深色主题', 'en-US': 'Dark theme' },
    'White interior desk': { 'zh-CN': '白色室内书桌', 'en-US': 'White interior desk' },
    'Bowl of blueberries': { 'zh-CN': '蓝莓碗', 'en-US': 'Bowl of blueberries' },
    'Blueberry bowl': { 'zh-CN': '蓝莓碗', 'en-US': 'Blueberry bowl' },
    'White building and blue sky': { 'zh-CN': '白色建筑与蓝天', 'en-US': 'White building and blue sky' },
    'White plaza': { 'zh-CN': '白色广场', 'en-US': 'White plaza' },
    'Golden bridge detail': { 'zh-CN': '金色桥梁细节', 'en-US': 'Golden bridge detail' },
    'Cherry tomatoes': { 'zh-CN': '樱桃番茄', 'en-US': 'Cherry tomatoes' },
    'Coffee bar': { 'zh-CN': '咖啡吧', 'en-US': 'Coffee bar' },
    'White architecture ribs': { 'zh-CN': '白色建筑肋骨结构', 'en-US': 'White architecture ribs' },
    'Yellow flowers': { 'zh-CN': '黄色花朵', 'en-US': 'Yellow flowers' },
    'Hand holding pastry': { 'zh-CN': '手拿糕点', 'en-US': 'Hand holding pastry' },
    'White studio desk': { 'zh-CN': '白色工作室书桌', 'en-US': 'White studio desk' },
    'White office desk': { 'zh-CN': '白色办公室书桌', 'en-US': 'White office desk' },
    'Green plant': { 'zh-CN': '绿色植物', 'en-US': 'Green plant' },
    'Small colorful plants': { 'zh-CN': '彩色小植物', 'en-US': 'Small colorful plants' },
    'Minimal landscape with person': { 'zh-CN': '人物与极简风景', 'en-US': 'Minimal landscape with person' },
    'Bridge in blue sky': { 'zh-CN': '蓝天下的桥', 'en-US': 'Bridge in blue sky' },
    'Blue architecture': { 'zh-CN': '蓝色建筑', 'en-US': 'Blue architecture' },
    'Minimal courtyard': { 'zh-CN': '极简庭院', 'en-US': 'Minimal courtyard' },
    'Bridge against blue sky': { 'zh-CN': '蓝天下的桥梁', 'en-US': 'Bridge against blue sky' },
    'Light workspace': { 'zh-CN': '明亮工作区', 'en-US': 'Light workspace' },
    'Bright home': { 'zh-CN': '明亮住宅', 'en-US': 'Bright home' },
    'Office desk': { 'zh-CN': '办公室书桌', 'en-US': 'Office desk' },
    'Clear selection': { 'zh-CN': '清除选择', 'en-US': 'Clear selection' },
    'Clear date or time': { 'zh-CN': '清除日期或时间', 'en-US': 'Clear date or time' },
    '8 min read': { 'zh-CN': '阅读 8 分钟', 'en-US': '8 min read' },
    'Bridge detail against bright blue sky': { 'zh-CN': '蓝天下的桥梁细节', 'en-US': 'Bridge detail against bright blue sky' },
    'all': { 'zh-CN': '全部', 'en-US': 'all' },
    'image': { 'zh-CN': '图片', 'en-US': 'image' },
    'video': { 'zh-CN': '视频', 'en-US': 'video' },
    'file': { 'zh-CN': '文件', 'en-US': 'file' },
    'grid': { 'zh-CN': '网格', 'en-US': 'grid' },
    'list': { 'zh-CN': '列表', 'en-US': 'list' },
    'multiple': { 'zh-CN': '多选', 'en-US': 'multiple' },
    'Selected': { 'zh-CN': '已选择', 'en-US': 'Selected' },
    'editorial cover': { 'zh-CN': '编辑封面', 'en-US': 'editorial cover' },
    'food series': { 'zh-CN': '美食专题', 'en-US': 'food series' },
    'places': { 'zh-CN': '地点', 'en-US': 'places' },
    'city notes': { 'zh-CN': '城市笔记', 'en-US': 'city notes' },
    'still life': { 'zh-CN': '静物', 'en-US': 'still life' },
    'process': { 'zh-CN': '过程', 'en-US': 'process' },
    'Quiet workspace': { 'zh-CN': '安静工作区', 'en-US': 'Quiet workspace' },
    'Blueberry study': { 'zh-CN': '蓝莓研究', 'en-US': 'Blueberry study' },
    'Open architecture': { 'zh-CN': '开放建筑', 'en-US': 'Open architecture' },
    'Bridge in blue': { 'zh-CN': '蓝色桥梁', 'en-US': 'Bridge in blue' },
    'Market table': { 'zh-CN': '集市餐桌', 'en-US': 'Market table' },
    'Studio session': { 'zh-CN': '工作室拍摄', 'en-US': 'Studio session' }
  });
  var phrasePairs = [
    ['Articles', '文章'], ['Blog articles', '博客文章'], ['Article detail', '文章详情'], ['Media library', '媒体库'],
    ['Profile', '资料'], ['Author', '作者'], ['Login', '登录'], ['Signup', '注册'],
    ['June', '6 月'], ['July', '7 月'], ['August', '8 月'], ['September', '9 月'], ['October', '10 月'], ['November', '11 月'], ['December', '12 月'],
    ['Jan', '1 月'], ['Feb', '2 月'], ['Mar', '3 月'], ['Apr', '4 月'], ['May', '5 月'], ['Jun', '6 月'], ['Jul', '7 月'], ['Aug', '8 月'], ['Sep', '9 月'], ['Oct', '10 月'], ['Nov', '11 月'], ['Dec', '12 月'],
    ['Showing 1 to 20 of 25 elements', '显示第 1-20 条，共 25 条'],
    ['Showing 1 to 9 of 42 posts', '显示第 1-9 篇，共 42 篇'],
    ['For one thing they usually step all over the hedges and plants on the side of someone house killing them and setting back.', '比如，他们常常踩过别人房子旁的树篱和植物，造成破坏并让它们难以恢复。'],
    ['Selected', '已选择'], ['Quiet workspace', '安静工作区'], ['Blueberry study', '蓝莓研究'],
    ['Open architecture', '开放建筑'], ['Bridge in blue', '蓝色桥梁'], ['Market table', '集市餐桌'],
    ['Studio session', '工作室拍摄'], ['editorial cover', '编辑封面'], ['food series', '美食专题'],
    ['places', '地点'], ['city notes', '城市笔记'], ['still life', '静物'], ['process', '过程'],
    ['startup', '创业'], ['funding', '融资'], ['feature', '专题'], ['image', '图片'], ['video', '视频'], ['file', '文件']
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
      Object.keys(textMap[key]).forEach(function (locale) { output[textMap[key][locale]] = key; });
    });
    return output;
  }

  function getNodeKey(node) {
    if (nodeKeys.has(node)) return nodeKeys.get(node);
    var trimmed = (node.nodeValue || '').trim();
    var key = reverseMap[trimmed];
    if (key) nodeKeys.set(node, key);
    return key || null;
  }

  function localizeValue(value, locale) {
    var trimmed = (value || '').trim();
    var key = reverseMap[trimmed];
    if (key && textMap[key]) return value.replace(trimmed, textMap[key][locale] || textMap[key][defaultLocale] || key);
    var next = value;
    if (locale === 'zh-CN') {
      next = next.replace(/(\d+)\s+min\s+read/gi, '阅读 $1 分钟');
      next = next.replace(/(image|video|file)\s*·/gi, function (_, kind) {
        return ({ image: '图片', video: '视频', file: '文件' }[kind.toLowerCase()] || kind) + ' ·';
      });
    } else {
      next = next.replace(/阅读\s*(\d+)\s*分钟/g, '$1 min read');
      next = next.replace(/(图片|视频|文件)\s*·/g, function (_, kind) {
        return ({ 图片: 'image', 视频: 'video', 文件: 'file' }[kind] || kind) + ' ·';
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
    document.querySelectorAll('[data-ce-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      var locale = readPreferences().locale;
      button.setAttribute('title', theme === 'dark'
        ? (locale === 'zh-CN' ? '浅色主题' : 'Light theme')
        : (locale === 'zh-CN' ? '深色主题' : 'Dark theme'));
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
      document.querySelectorAll('[data-ce-locale]').forEach(function (button) {
        button.setAttribute('aria-pressed', button.getAttribute('data-ce-locale') === locale ? 'true' : 'false');
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
    button.className = 'ce-preference-button';
    Object.keys(attrs || {}).forEach(function (name) { button.setAttribute(name, attrs[name]); });
    button.innerHTML = icon ? '<i class="ph ' + icon + '"></i><span>' + label + '</span>' : '<span>' + label + '</span>';
    return button;
  }

  function mountControls(prefs) {
    if (document.querySelector('[data-ce-preferences]')) return;
    var headerActions = document.querySelector('.ce-header > .flex');
    var authCard = document.querySelector('.ce-auth-card');
    var host = headerActions || authCard || document.querySelector('.ce-workspace') || document.body;
    var controls = document.createElement('div');
    controls.className = 'ce-preferences';
    controls.setAttribute('data-ce-preferences', '');
    controls.innerHTML = '<span class="ce-preferences-label lang-en:tracking-wide" data-i18n="preferences">Prefs</span>';
    controls.appendChild(createButton('中', '', { 'data-ce-locale': 'zh-CN', 'data-i18n-switcher': 'zh-CN', 'aria-label': '切换到中文' }));
    controls.appendChild(createButton('EN', '', { 'data-ce-locale': 'en-US', 'data-i18n-switcher': 'en-US', 'aria-label': 'Switch to English' }));
    controls.appendChild(createButton('', prefs.theme === 'dark' ? 'ph-sun' : 'ph-moon', { 'data-ce-theme-toggle': '', 'aria-label': 'Toggle theme' }));
    if (headerActions) headerActions.insertAdjacentElement('afterbegin', controls);
    else host.insertAdjacentElement('afterbegin', controls);
  }

  function injectStyle() {
    if (document.getElementById('clarity-preferences-style')) return;
    var style = document.createElement('style');
    style.id = 'clarity-preferences-style';
    style.textContent = `
.ce-preferences{display:inline-flex;align-items:center;gap:2px;border:1px solid #E7ECF2;background:#fff;padding:3px;box-shadow:0 8px 24px rgba(71,93,117,.08)}
.ce-preferences-label{padding:0 7px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#98A6B6}
.ce-preference-button{display:inline-flex;min-width:31px;height:31px;align-items:center;justify-content:center;gap:4px;border:0;background:transparent;color:#98A6B6;font-size:11px;font-weight:700;cursor:pointer;transition:background-color .2s ease,color .2s ease}
.ce-preference-button:hover,.ce-preference-button[aria-pressed="true"]{background:rgba(74,155,255,.1);color:#4A9BFF}
html[data-theme="dark"] body.ce-page{background:#101820!important;color:#E8EEF5!important;color-scheme:dark}
html[data-theme="dark"] .ce-screen,html[data-theme="dark"] .ce-content{background:#101820!important}
html[data-theme="dark"] .ce-sidebar,html[data-theme="dark"] .ce-header,html[data-theme="dark"] .ce-panel,html[data-theme="dark"] .ce-panel-padded,html[data-theme="dark"] .ce-auth-card,html[data-theme="dark"] .ce-popover-panel{border-color:#273646!important;background:#172331!important;box-shadow:0 18px 44px rgba(0,0,0,.26)!important}
html[data-theme="dark"] .ce-flyout,html[data-theme="dark"] .ce-preferences{border-color:#273646!important;background:#172331!important;box-shadow:0 18px 44px rgba(0,0,0,.26)!important}
html[data-theme="dark"] .text-ink,html[data-theme="dark"] .ce-title{color:#EEF4FA!important}
html[data-theme="dark"] .text-muted,html[data-theme="dark"] .ce-meta,html[data-theme="dark"] .ce-kicker,html[data-theme="dark"] .ce-preferences-label{color:#9FB0C0!important}
html[data-theme="dark"] .ce-input,html[data-theme="dark"] .ce-button-soft{border-color:#273646!important;background:#111B26!important;color:#EEF4FA!important}
html[data-theme="dark"] .bg-white,html[data-theme="dark"] .bg-surface,html[data-theme="dark"] .bg-surface-soft{background-color:#172331!important}
html[data-theme="dark"] .border-line{border-color:#273646!important}
html[data-theme="dark"] [jq-select-trigger],html[data-theme="dark"] [jq-select-panel]{border-color:#273646!important;background:#172331!important;color:#EEF4FA!important}
html:lang(zh-CN) .ce-title,html:lang(zh-CN) h1,html:lang(zh-CN) h2{letter-spacing:0}
@media(max-width:760px){.ce-preferences{order:8}.ce-preferences-label{display:none}.ce-header{gap:12px}.ce-header>.flex{gap:12px!important}}
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
      var localeButton = event.target.closest('[data-ce-locale]');
      if (localeButton) {
        prefs.locale = localeButton.getAttribute('data-ce-locale') || defaultLocale;
        writePreferences(prefs);
        applyLocale(prefs.locale);
      }
      var themeButton = event.target.closest('[data-ce-theme-toggle]');
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
