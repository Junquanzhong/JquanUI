import { manufacturingSeed } from './manufacturing-seed.js';
const owners = ['林知夏', '陈屿', '许清禾', '周予安'];
const companies = ['云栖科技', '远山智能', '星河数字', '青禾设计', '森屿制造', '知行教育', '瀚海云计算', '万象零售', '北辰咨询', '川流物流', '望舒传媒', '启明生物', '锦程金融', '深蓝能源', '鹿鸣文化', '恒越医疗'];
export function seed() {
  const customers = companies.map((name, i) => ({ id: `CUS-${String(i + 1).padStart(4, '0')}`, name: `${name}有限公司`, industry: ['科技互联网', '智能制造', '零售消费', '专业服务'][i % 4], level: ['A · 战略客户', 'B · 重点客户', 'C · 普通客户'][i % 3], owner: owners[i % 4], status: i > 12 ? '公海客户' : ['重点客户', '合作客户', '潜在客户'][i % 3], city: ['上海', '杭州', '深圳', '北京'][i % 4], phone: `1380010${String(1000 + i)}`, email: `contact${i + 1}@example.com`, note: '持续关注数字化转型需求，已建立初步合作关系。', createdAt: `2026-09-${String(10 + i).padStart(2, '0')}` }));
  const contacts = customers.slice(0, 13).map((c, i) => ({ id: `CON-${i + 1}`, name: ['沈亦辰', '陆星然', '苏念', '顾清远', '程明', '江晚', '方景', '叶知秋', '宋黎', '孟泽', '徐宁', '郑悦', '李思'][i], customerId: c.id, position: ['运营总监', '技术负责人', '采购经理', '总经理'][i % 4], phone: c.phone, email: c.email, status: i % 2 ? '业务联系人' : '关键决策人', owner: c.owner }));
  const products = [
    { id: 'PRO-1', name: '澜序企业版 · 年度订阅', code: 'LS-ENT-01', category: '软件订阅', amount: 128000, unit: '年', status: '在售', owner: '林知夏', note: '含 50 个用户席位、标准 CRM 模块与优先技术支持。' },
    { id: 'PRO-2', name: '数字化实施服务', code: 'LS-SVC-02', category: '实施服务', amount: 86000, unit: '项目', status: '在售', owner: '陈屿' },
    { id: 'PRO-3', name: '澜序专业版 · 年度订阅', code: 'LS-PRO-03', category: '软件订阅', amount: 68000, unit: '年', status: '在售', owner: '许清禾' },
    { id: 'PRO-4', name: '团队赋能培训', code: 'LS-TRN-04', category: '培训服务', amount: 12000, unit: '场', status: '在售', owner: '周予安' }
  ];
  const opportunityNames = ['企业数字化升级项目', '智能销售平台采购', '客户运营一体化建设', 'CRM 专业版年度续约', '销售流程优化项目', '集团客户管理平台', '全渠道客户服务项目', '企业版订阅与实施'];
  const opportunities = opportunityNames.map((name, i) => ({ id: `OPP-${1001 + i}`, name, customerId: customers[i].id, productId: products[i % 4].id, amount: [328000, 246000, 186000, 128000, 96000, 428000, 168000, 268000][i], status: ['商务谈判', '方案演示', '需求确认', '赢单', '合同签署', '需求确认', '流失', '商务谈判'][i], owner: owners[i % 4], date: `2026-10-${[16, 22, 28, 6, 12, 30, 5, 25][i]}`, note: '已与客户确认核心需求，下一步安排方案沟通。' }));
  const contracts = [{ id: 'CTR-2026001', name: '青禾设计专业版年度服务合同', customerId: customers[3].id, amount: 128000, status: '已签订', owner: '周予安', date: '2027-10-06', note: '分两期支付，合同已归档。' }, { id: 'CTR-2026002', name: '森屿制造销售系统服务合同', customerId: customers[4].id, amount: 96000, status: '审批中', owner: '林知夏', date: '2027-10-12' }, { id: 'CTR-2026003', name: '云栖科技数字化服务合同', customerId: customers[0].id, amount: 328000, status: '草稿', owner: '林知夏', date: '2027-10-16' }];
  const marine = manufacturingSeed();
  customers.push(...marine.customers); contracts.push(...marine.contracts);
  const { customers: marineCustomers, contracts: marineContracts, ...manufacturing } = marine;
  return {
    ...manufacturing,
    customers, contacts, products, opportunities, contracts,
    followups: [
      { id: 'FUP-1', name: '云栖科技 · 确认实施范围', customerId: customers[0].id, contactId: 'CON-1', opportunityId: 'OPP-1001', channel: '线上会议', date: '2026-10-08', owner: '林知夏', status: '已达成共识', nextDate: '2026-10-12', content: '已确认销售流程、客户画像与报表需求。客户希望分阶段实施，先覆盖销售一部的 30 个席位。\n下一步：提交实施排期与最终报价，邀请采购负责人参与评审。' },
      { id: 'FUP-2', name: '星河数字 · 需求访谈', customerId: customers[2].id, contactId: 'CON-3', opportunityId: 'OPP-1003', channel: '电话', date: '2026-10-09', owner: '许清禾', status: '待继续跟进', nextDate: '2026-10-14', content: '客户关注跨部门客户信息共享。目前在评估预算，待技术团队确认数据迁移方式。' }
    ],
    appointments: [
      { id: 'APT-1', name: '云栖科技 · 方案评审会', customerId: customers[0].id, type: '线上会议', date: '2026-10-12', time: '14:00', location: '线上会议室 A', owner: '林知夏', status: '已安排', note: '邀请运营和采购负责人，确认实施阶段与验收标准。' },
      { id: 'APT-2', name: '远山智能 · 现场拜访', customerId: customers[1].id, type: '客户拜访', date: '2026-10-15', time: '10:30', location: '杭州 · 远山智能总部', owner: '陈屿', status: '已安排', note: '携带产品演示资料，与技术团队确认接口需求。' }
    ],
    knowledge: [
      { id: 'KB-1', name: '首次客户访谈：需求确认清单', category: '销售话术', owner: '林知夏', status: '已发布', date: '2026-10-08', content: '1. 业务现状：团队规模、现有流程、主要瓶颈。\n2. 目标：希望改善哪些指标？如何判断成功？\n3. 决策链：使用者、预算负责人、最终决策人。\n4. 预算与时间：计划投入和期望上线日期。\n5. 下一步：明确负责人、交付物和下一次沟通时间。\n\n访谈结束后，在客户跟进中心记录沟通结果，并创建下次任务。' },
      { id: 'KB-2', name: '企业版产品与实施服务说明', category: '产品资料', owner: '陈屿', status: '已发布', date: '2026-10-07', content: '企业版包含客户、线索、商机、合同及服务管理能力。\n标准年度订阅含 50 个席位，实施服务单独报价。\n实施步骤：调研 → 配置 → 数据准备 → 团队培训 → 验收。\n具体商业条款以客户报价与已签合同为准。' },
      { id: 'KB-3', name: '客户服务工单响应规范', category: '服务指南', owner: '周予安', status: '草稿', date: '2026-10-09', content: '收到工单后确认问题范围、影响用户和复现步骤。\n高优先级问题优先响应；无法当场解决时给出下一次反馈时间。\n解决后确认客户体验，补充处理记录，再关闭工单。' }
    ],
    messages: [
      { id: 'MSG-1', name: '云栖科技方案评审 · 需要协作', sender: '陈屿', recipient: '林知夏', content: '实施团队已补充排期建议，请在下次客户会议前确认。\n重点关注数据迁移范围与验收标准，有问题可以回复这条站内信。', status: '已发送', customerId: customers[0].id, readBy: [], trashedBy: [], hiddenBy: [], at: '2026-10-09T09:20:00+08:00' },
      { id: 'MSG-2', name: '本周客户成功进度同步', sender: '周予安', recipient: '林知夏', content: '青禾设计交付进度正常，客户希望增加一次管理员培训。已补充回访任务，请协助确认培训时间。', status: '已发送', customerId: customers[3].id, readBy: [], trashedBy: [], hiddenBy: [], at: '2026-10-09T10:10:00+08:00' },
      { id: 'MSG-3', name: '秋季研讨会线索分配', sender: '林知夏', recipient: '许清禾', content: '活动报名线索请按行业归类，优先分配已有明确预算的客户。', status: '已发送', customerId: '', readBy: [], trashedBy: [], hiddenBy: [], at: '2026-10-08T16:00:00+08:00' }
    ],
    leads: ['启航数据', '墨云科技', '新辰材料', '清源环保', '方舟医疗', '朗越咨询', '青峰物流', '锦和商贸', '天际网络', '源点教育', '观澜科技', '合木工业'].map((company, i) => ({ id: `LEA-${2001 + i}`, name: ['王瑾', '赵明', '刘欣', '周宁', '陈越', '黄晴', '孙然', '吴桐', '徐涵', '林悦', '沈旭', '何青'][i], company: `${company}有限公司`, phone: `1390010${String(2000 + i)}`, email: `lead${i}@example.com`, source: ['官网咨询', '行业展会', '客户推荐', '市场活动'][i % 4], owner: owners[i % 4], status: i % 3 ? '跟进中' : '新线索', note: '对企业 CRM 方案有明确兴趣，待进一步确认预算。', createdAt: `2026-10-${String(i % 9 + 1).padStart(2, '0')}` })),
    quotes: [{ id: 'QUO-2026001', name: '云栖科技企业版报价方案', customerId: customers[0].id, opportunityId: opportunities[0].id, productId: 'PRO-1', quantity: 2, amount: 328000, status: '已发送', owner: '林知夏', date: '2026-10-31' }, { id: 'QUO-2026002', name: '远山智能实施服务报价', customerId: customers[1].id, opportunityId: opportunities[1].id, productId: 'PRO-2', quantity: 1, amount: 246000, status: '草稿', owner: '陈屿', date: '2026-10-25' }],
    orders: [{ id: 'ORD-2026001', name: '青禾设计专业版交付订单', customerId: customers[3].id, contractId: contracts[0].id, amount: 128000, status: '交付中', owner: '周予安', date: '2026-10-20' }],
    payments: [{ id: 'PAY-2026001', name: '青禾设计首期回款', contractId: contracts[0].id, amount: 64000, method: '银行转账', status: '已回款', owner: '周予安', date: '2026-10-06' }, { id: 'PAY-2026002', name: '青禾设计尾款', contractId: contracts[0].id, amount: 64000, method: '银行转账', status: '待回款', owner: '周予安', date: '2026-11-06' }],
    invoices: [{ id: 'INV-2026001', name: customers[3].name, customerId: customers[3].id, contractId: contracts[0].id, taxId: '91310000DEMO202600', amount: 64000, type: '增值税专用发票', status: '已开票', owner: '周予安', date: '2026-10-07' }],
    tasks: [{ id: 'TSK-1', name: '云栖科技 · 商务方案沟通', customerId: customers[0].id, priority: '高', owner: '林知夏', status: '待处理', date: '2026-10-09', note: '下午 14:00 与沈亦辰沟通服务范围。' }, { id: 'TSK-2', name: '远山智能 · 产品演示', customerId: customers[1].id, priority: '高', owner: '陈屿', status: '进行中', date: '2026-10-09' }, { id: 'TSK-3', name: '青禾设计 · 交付进度回访', customerId: customers[3].id, priority: '中', owner: '周予安', status: '待处理', date: '2026-10-10' }, { id: 'TSK-4', name: '星河数字 · 需求清单确认', customerId: customers[2].id, priority: '中', owner: '许清禾', status: '待处理', date: '2026-10-11' }, { id: 'TSK-5', name: '森屿制造 · 合同材料准备', customerId: customers[4].id, priority: '低', owner: '林知夏', status: '已完成', date: '2026-10-08' }],
    tickets: [{ id: 'TIC-1001', name: '青禾设计 · 数据导入咨询', customerId: customers[3].id, priority: '中', type: '使用咨询', owner: '周予安', status: '处理中', date: '2026-10-10', note: '客户需要确认历史客户数据导入字段。' }, { id: 'TIC-1002', name: '万象零售 · 自定义报表建议', customerId: customers[7].id, priority: '低', type: '功能建议', owner: '许清禾', status: '待处理', date: '2026-10-12' }],
    campaigns: [{ id: 'CAM-1', name: '秋季企业增长线上研讨会', channel: '线上研讨会', amount: 18000, owner: '许清禾', status: '进行中', date: '2026-10-16' }, { id: 'CAM-2', name: '2026 智能制造行业展', channel: '行业展会', amount: 68000, owner: '陈屿', status: '计划中', date: '2026-10-28' }],
    users: owners.map((name, i) => ({ id: `USR-${i + 1}`, name, email: `member${i + 1}@lanse.crm`, role: ['管理员', '销售经理', '销售专员', '客服专员'][i], department: ['管理部', '销售一部', '销售二部', '客户成功部'][i], status: '已启用' })),
    logs: [{ id: 'LOG-1', entity: 'contracts', recordId: contracts[0].id, name: '青禾设计合同已签订', detail: '周予安完成合同签署，进入交付阶段。', owner: '周予安', at: '2026-10-09T09:15:00+08:00' }, { id: 'LOG-2', entity: 'opportunities', recordId: opportunities[0].id, name: '云栖科技商机进入商务谈判', detail: '已完成产品演示与方案评估。', owner: '林知夏', at: '2026-10-09T10:30:00+08:00' }, { id: 'LOG-3', entity: 'customers', recordId: customers[1].id, name: '跟进远山智能', detail: '客户对实施方案表示认可，安排下一次演示。', owner: '陈屿', at: '2026-10-09T11:00:00+08:00' }]
  };
}
