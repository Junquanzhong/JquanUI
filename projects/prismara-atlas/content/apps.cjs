'use strict';
// Public application directory and repository identities checked on 2026-10-26.
module.exports = {
  source: 'https://www.jquan.win/应用中心/',
  checkedOn: '2026-10-26',
  applications: [
    {
      id: 'nginx-aegis', title: 'Nginx Aegis', category: 'development', categoryLabel: '开发工具', icon: 'shield-check',
      summary: '面向独立开发者与前端开发者的 Nginx 可视化诊断配置器，把配置检查与调整放在一个界面里。',
      tags: ['Nginx', '配置诊断', 'Web App'], preview: 'nginx-aegis.webp',
      url: 'https://junquanzhong.github.io/Nginx-Aegis/', action: '打开应用',
      repository: 'https://github.com/Junquanzhong/Nginx-Aegis'
    },
    {
      id: 'totp-authenticator', title: 'TOTP Authenticator', category: 'security', categoryLabel: '安全工具', icon: 'key',
      summary: '兼容 Google Authenticator 的 TOTP 二步验证器，为双重验证提供一个简洁的浏览器入口。',
      tags: ['TOTP', '二步验证', 'Web App'], preview: 'totp-authenticator.webp',
      url: 'https://junquanzhong.github.io/TOTP-Authenticator/', action: '打开应用',
      repository: 'https://github.com/Junquanzhong/TOTP-Authenticator'
    },
    {
      id: 'es3-game-assistance', title: 'ES3 游戏存档修改器', category: 'utilities', categoryLabel: '实用工具', icon: 'game-controller',
      summary: '纯静态的 ES3 格式游戏存档在线修改器，让存档处理有一个直接、清晰的操作界面。',
      tags: ['ES3', '游戏存档', 'Web App'], preview: 'es3-game-assistance.webp',
      url: 'https://junquanzhong.github.io/ES3-Game-Assistance/', action: '打开应用',
      repository: 'https://github.com/Junquanzhong/ES3-Game-Assistance'
    },
    {
      id: 'jquanui', title: 'JquanUI', category: 'development', categoryLabel: '开发工具', icon: 'brackets-curly',
      summary: 'CSS 原子引擎样式框架，也是这个知识库的界面底座。进入文档中心，探索样式与组件的组合方式。',
      tags: ['CSS', 'UI 组件', '开发框架'], preview: 'jquanui.webp',
      url: 'https://cssui.jquan.win/', action: '阅读文档',
      repository: 'https://github.com/Junquanzhong/JquanUI'
    }
  ]
};
