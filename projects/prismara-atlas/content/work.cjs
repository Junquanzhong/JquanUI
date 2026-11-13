'use strict';
// Service and contact facts read from the owner's public work page on 2026-10-27.
module.exports = {
  source: 'https://www.jquan.win/工作机会',
  checkedOn: '2026-10-27',
  contact: { wechat: 'junquanzhong', email: 'junquanzhong@vip.qq.com' },
  technologies: ['JquanUI', 'Vue.js', 'React', 'Node.js', 'Python', 'Excel VBA'],
  services: [
    { id: 'websites', icon: 'browser', title: '企业门户网站', label: 'WEBSITES', summary: '把品牌、内容与业务入口组织成一个清晰的网站，让桌面与手机都能顺畅浏览。', items: ['响应式网站与交互设计', 'SEO 与页面加载优化', '内容管理系统与后台'] },
    { id: 'systems', icon: 'squares-four', title: 'CRM / ERP 系统定制', label: 'BUSINESS SYSTEMS', summary: '从实际业务流程出发，搭建贴合团队习惯的管理系统，让信息与协作有序衔接。', items: ['客户与业务流程管理', '进销存与库存管理', '数据可视化仪表盘'] },
    { id: 'automation', icon: 'table', title: 'Excel 办公自动化', label: 'AUTOMATION', summary: '把重复的表格操作整理成可复用的流程，让清洗、汇总与核对变得更轻松。', items: ['复杂公式与 VBA 宏开发', '跨文件数据汇总与核对', 'Python 数据处理与报表导出'] },
    { id: 'consulting', icon: 'wrench', title: '技术咨询与运维', label: 'TECHNICAL SUPPORT', summary: '已有系统需要修复、优化或迁移时，一起找到问题所在，再选择合适的处理路径。', items: ['现有系统与代码问题排查', '服务器部署与环境维护', '系统优化与数字化咨询'] }
  ],
  process: [
    { title: '聊清需求', description: '从正在遇到的问题开始，梳理目标、范围与优先级。' },
    { title: '确认方案', description: '对齐页面或流程原型、技术方案和交付边界。' },
    { title: '开发与反馈', description: '分阶段推进，持续沟通，在实际使用中完善细节。' },
    { title: '交付与维护', description: '交付源码和操作说明，再讨论后续维护安排。' }
  ]
};
