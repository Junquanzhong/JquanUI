export function manufacturingSeed() {
  const steps = (first, second) => [{ id: 'step-1', title: first[0], reviewer: first[1] }, { id: 'step-2', title: second[0], reviewer: second[1] }];
  return {
    customers: [
      { id: 'MAR-CUS-1', name: 'NorSea Shipping AS', industry: '智能制造', level: 'A · 战略客户', owner: '林知夏', status: '合作客户', city: 'Bergen · Norway', phone: '+47 5555 0101', email: 'orders@norsea.example', note: '挪威船东；项目资料采用中英文，按里程碑结算。' },
      { id: 'MAR-CUS-2', name: 'BlueHarbor Marine BV', industry: '智能制造', level: 'B · 重点客户', owner: '陈屿', status: '合作客户', city: 'Rotterdam · Netherlands', phone: '+31 1010 0202', email: 'projects@blueharbor.example', note: '荷兰客户；关注节能系统与设备交期。' }
    ],
    contracts: [
      { id: 'MAR-CTR-1', name: 'NorSea · 8200DWT 船舶建造合同', customerId: 'MAR-CUS-1', amount: 12600000, currency: 'USD', country: '挪威', deliveryTerms: 'FOB', paymentTerms: '签约 20% / 设计确认 20% / 生产里程碑 40% / 交付 20%', owner: '林知夏', status: '已签订', date: '2028-06-30', note: '合同已签订，待项目立项审核。' },
      { id: 'MAR-CTR-2', name: 'BlueHarbor · 海工服务船建造合同', customerId: 'MAR-CUS-2', amount: 8400000, currency: 'EUR', country: '荷兰', deliveryTerms: 'FOB', paymentTerms: '签约 30% / 设计确认 20% / 生产里程碑 30% / 交付 20%', owner: '陈屿', status: '已签订', date: '2028-03-31', note: '设计已通过，进入分项采购。' }
    ],
    projects: [
      { id: 'MAR-PRJ-1', name: 'NS-082 · 8200DWT 多用途船', customerId: 'MAR-CUS-1', contractId: 'MAR-CTR-1', opportunityId: '', country: '挪威', currency: 'USD', deliveryTerms: 'FOB', paymentTerms: '签约 20% / 设计确认 20% / 生产里程碑 40% / 交付 20%', owner: '林知夏', date: '2028-06-30', status: '草稿', note: '从立项审核开始体验完整订单流程。' },
      { id: 'MAR-PRJ-2', name: 'BH-016 · 海工服务船', customerId: 'MAR-CUS-2', contractId: 'MAR-CTR-2', opportunityId: '', country: '荷兰', currency: 'EUR', deliveryTerms: 'FOB', paymentTerms: '签约 30% / 设计确认 20% / 生产里程碑 30% / 交付 20%', owner: '陈屿', date: '2028-03-31', status: '已立项', note: '已完成设计审核，可直接体验设备比价与钢材询价。' }
    ],
    designs: [{ id: 'MAR-DES-2', name: 'BH-016 · 总体设计与采购清单', projectId: 'MAR-PRJ-2', institute: '海岳船舶设计院', version: 'V1', owner: '许清禾', date: '2026-11-30', status: '已批准', deliverables: '总体布置与技术规格已确认。\n采购拆分：动力设备 2 套；船用钢材 1200 吨；自动化系统 1 套。\n采购按技术规格询价，重点核对交期与质保。' }],
    procurements: [
      { id: 'MAR-PUR-1', name: 'BH-016 · 主推进设备', projectId: 'MAR-PRJ-2', designId: 'MAR-DES-2', category: '设备', quantity: 2, unit: '套', amount: 1000000, currency: 'EUR', owner: '陈屿', date: '2027-05-30', status: '待评估', specification: '船用主推进设备 2 套，须满足设计院技术规格与船级认证要求。' },
      { id: 'MAR-PUR-2', name: 'BH-016 · 船用钢材', projectId: 'MAR-PRJ-2', designId: 'MAR-DES-2', category: '钢材', quantity: 1200, unit: '吨', amount: 960000, currency: 'EUR', owner: '林知夏', date: '2027-03-30', status: '待询价', specification: '船用钢材 1200 吨，分批供货，需提供材质证明与批次追溯。' }
    ],
    suppliers: [
      { id: 'MAR-SUP-1', name: '海擎动力设备有限公司', category: '设备', contact: '唐铭', phone: '13800106666', email: 'sales@haiqing.example', country: '中国', owner: '陈屿', status: '合作中', note: '船用动力设备与配套技术支持。' },
      { id: 'MAR-SUP-2', name: 'Nordic Propulsion AB', category: '设备', contact: 'Erik Lund', phone: '+46 8811 2200', email: 'sales@nordic.example', country: '瑞典', owner: '陈屿', status: '候选', note: '可提供欧元报价及延长质保。' },
      { id: 'MAR-SUP-3', name: '远洋特钢有限公司', category: '钢材', contact: '方舟', phone: '13900107777', email: 'sales@steel.example', country: '中国', owner: '林知夏', status: '合作中', note: '船用钢板与型材，支持分批供货。' },
      { id: 'MAR-SUP-4', name: '澄海自动化有限公司', category: '系统', contact: '叶青', phone: '13700108888', email: 'sales@automation.example', country: '中国', owner: '许清禾', status: '合作中', note: '船舶自动化与监控系统。' }
    ],
    rfqs: [
      { id: 'MAR-RFQ-1', name: 'BH-016 主推进设备 · 海擎动力询价', procurementId: 'MAR-PUR-1', supplierId: 'MAR-SUP-1', owner: '陈屿', date: '2026-11-10', status: '已报价', note: '按设计规格提供总价、交期和质保。' },
      { id: 'MAR-RFQ-2', name: 'BH-016 主推进设备 · Nordic 询价', procurementId: 'MAR-PUR-1', supplierId: 'MAR-SUP-2', owner: '陈屿', date: '2026-11-10', status: '已报价', note: '采购币种为 EUR。' }
    ],
    supplierQuotes: [
      { id: 'MAR-SQ-1', name: '海擎动力 · 主推进设备方案', rfqId: 'MAR-RFQ-1', version: 'V1', amount: 980000, currency: 'EUR', deliveryDays: 60, warranty: '24 个月，含现场调试', owner: '陈屿', status: '待评估', note: '技术匹配，交期较短；可提供本地服务。' },
      { id: 'MAR-SQ-2', name: 'Nordic · 主推进设备方案', rfqId: 'MAR-RFQ-2', version: 'V1', amount: 960000, currency: 'EUR', deliveryDays: 90, warranty: '36 个月，远程支持', owner: '陈屿', status: '待评估', note: '报价较低，需确认运输与现场安装安排。' }
    ],
    production: [],
    workflowTemplates: [
      { id: 'WF-PROJECT', name: '项目立项 · 销售与财务审核', entity: 'projects', status: '已启用', automatic: true, steps: steps(['销售经理审核', '陈屿'], ['财务与立项确认', '林知夏']) },
      { id: 'WF-DESIGN', name: '设计成果 · 技术与项目审核', entity: 'designs', status: '已启用', automatic: false, steps: steps(['技术方案审核', '许清禾'], ['项目负责人确认', '林知夏']) },
      { id: 'WF-PURCHASE', name: '采购方案 · 采购与预算审核', entity: 'procurements', status: '已启用', automatic: false, steps: steps(['采购方案评估', '陈屿'], ['预算与下单确认', '林知夏']) }
    ],
    workflowRuns: []
  };
}
