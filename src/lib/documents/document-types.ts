// 单据类型元数据
// 定义所有单据的标识、名称、分类、描述等

export interface DocumentTypeMeta {
  type: string;
  titleZh: string;
  titleEn: string;
  category: "core" | "second-tier";
  description: string;
  scenario: string;
  isFree: boolean;
  isOnline: boolean;
  icon: string;
  exportFileNamePrefix: string;
}

export const documentTypes: DocumentTypeMeta[] = [
  // ===== 核心基础单据（12 套） =====
  {
    type: "proforma-invoice",
    titleZh: "形式发票",
    titleEn: "Proforma Invoice",
    category: "core",
    description: "交易前向买方出具的预开发票，用于报价和确认交易条件",
    scenario: "外贸报价、信用证开证参考、进口许可申请",
    isFree: true,
    isOnline: true,
    icon: "📋",
    exportFileNamePrefix: "PI",
  },
  {
    type: "commercial-invoice",
    titleZh: "商业发票",
    titleEn: "Commercial Invoice",
    category: "core",
    description: "实际交易完成后出具的正式发票，是报关、结汇的核心单据",
    scenario: "出口报关、银行结汇、进口清关",
    isFree: true,
    isOnline: true,
    icon: "🧾",
    exportFileNamePrefix: "CI",
  },
  {
    type: "packing-list",
    titleZh: "装箱单",
    titleEn: "Packing List",
    category: "core",
    description: "列明货物包装、数量、重量、体积等详细信息的单据",
    scenario: "报关报检、目的港提货、仓库验收",
    isFree: true,
    isOnline: true,
    icon: "📦",
    exportFileNamePrefix: "PL",
  },
  {
    type: "sales-contract",
    titleZh: "外贸销售合同",
    titleEn: "Sales Contract",
    category: "core",
    description: "买卖双方就商品、价格、交货、付款等条款达成的书面协议",
    scenario: "外贸交易签约、银行开证参考、法律保障",
    isFree: true,
    isOnline: true,
    icon: "📄",
    exportFileNamePrefix: "SC",
  },
  {
    type: "booking-instruction",
    titleZh: "订舱委托书",
    titleEn: "Booking Instruction",
    category: "core",
    description: "委托货代向船公司/航空公司预订舱位的书面文件",
    scenario: "海运/空运订舱、货代托书",
    isFree: true,
    isOnline: true,
    icon: "🚢",
    exportFileNamePrefix: "BI",
  },
  {
    type: "customs-declaration-authorization",
    titleZh: "报关委托书",
    titleEn: "Customs Declaration Authorization",
    category: "core",
    description: "委托报关行代为办理报关手续的授权文件",
    scenario: "出口报关、进口报关、代理报关",
    isFree: true,
    isOnline: true,
    icon: "🏛️",
    exportFileNamePrefix: "CDA",
  },
  {
    type: "delivery-note",
    titleZh: "送货单",
    titleEn: "Delivery Note",
    category: "core",
    description: "记录送货货物明细的单据，用于仓库收货签收",
    scenario: "仓库送货、物流签收、货物交接",
    isFree: true,
    isOnline: true,
    icon: "🚚",
    exportFileNamePrefix: "DN",
  },
  {
    type: "freight-statement",
    titleZh: "运费对账单",
    titleEn: "Freight Statement",
    category: "core",
    description: "与客户对账确认运费及各项杂费的明细清单",
    scenario: "货代对账、客户结算、费用确认",
    isFree: true,
    isOnline: true,
    icon: "💰",
    exportFileNamePrefix: "FS",
  },
  {
    type: "consolidation-inbound-receipt",
    titleZh: "集运入库单",
    titleEn: "Consolidation Inbound Receipt",
    category: "core",
    description: "集运仓库收到客户包裹时的入库记录单据",
    scenario: "集运仓库入库、客户包裹确认、异常记录",
    isFree: true,
    isOnline: true,
    icon: "📥",
    exportFileNamePrefix: "CIR",
  },
  {
    type: "consolidation-packing-list",
    titleZh: "集运合箱打包清单",
    titleEn: "Consolidation Packing List",
    category: "core",
    description: "将多个包裹合并装箱后的详细清单",
    scenario: "集运合箱、国际快递打包、客户确认",
    isFree: true,
    isOnline: true,
    icon: "📫",
    exportFileNamePrefix: "CPL",
  },
  {
    type: "express-declaration",
    titleZh: "国际快递申报单",
    titleEn: "International Express Declaration",
    category: "core",
    description: "国际快递寄件时填写的物品申报单据",
    scenario: "DHL/FedEx/UPS 寄件、海关申报、个人物品邮寄",
    isFree: true,
    isOnline: true,
    icon: "✈️",
    exportFileNamePrefix: "IED",
  },
  {
    type: "quotation",
    titleZh: "通用报价单",
    titleEn: "Quotation",
    category: "core",
    description: "向客户发送的产品/服务/物流项目报价文件",
    scenario: "产品报价、服务报价、物流费用报价",
    isFree: true,
    isOnline: true,
    icon: "📝",
    exportFileNamePrefix: "QT",
  },
  {
    type: "shipping-instruction",
    titleZh: "提单补料",
    titleEn: "Shipping Instruction",
    category: "core",
    description: "向船公司提交提单内容资料，确认提单信息",
    scenario: "海运提单确认、SI 补料、船务操作",
    isFree: true,
    isOnline: true,
    icon: "📋",
    exportFileNamePrefix: "SI",
  },
  {
    type: "trucking-dispatch-order",
    titleZh: "拖车派车单",
    titleEn: "Trucking Dispatch Order",
    category: "core",
    description: "安排拖车运输的派车单据，调度司机提柜送货",
    scenario: "拖车调度、港口提柜、工厂送货",
    isFree: true,
    isOnline: true,
    icon: "🚛",
    exportFileNamePrefix: "TDO",
  },
  {
    type: "shipping-mark",
    titleZh: "唛头通用模板",
    titleEn: "Shipping Mark",
    category: "core",
    description: "货物外包装唛头标识，便于目的港分拣识别",
    scenario: "外箱标识、目的港分拣、仓库收货",
    isFree: true,
    isOnline: true,
    icon: "🏷️",
    exportFileNamePrefix: "SM",
  },

  // ===== 第二梯队（即将上线） =====
  {
    type: "container-loading-list",
    titleZh: "装柜明细单",
    titleEn: "Container Loading List",
    category: "second-tier",
    description: "记录装柜货物详细信息的单据",
    scenario: "装柜安排、仓库装货、客户确认",
    isFree: true,
    isOnline: false,
    icon: "📦",
    exportFileNamePrefix: "CLL",
  },
  {
    type: "certificate-of-origin-template",
    titleZh: "通用原产地证 CO 模板",
    titleEn: "Certificate of Origin Template",
    category: "second-tier",
    description: "原产地证资料整理模板（非官方证书）",
    scenario: "原产地证资料准备、商会申请参考",
    isFree: true,
    isOnline: false,
    icon: "🏅",
    exportFileNamePrefix: "CO",
  },
  {
    type: "fumigation-certificate-template",
    titleZh: "熏蒸证明通用模板",
    titleEn: "Fumigation Certificate Template",
    category: "second-tier",
    description: "熏蒸证明资料整理模板（非检疫证书）",
    scenario: "木质包装熏蒸资料准备",
    isFree: true,
    isOnline: false,
    icon: "🪵",
    exportFileNamePrefix: "FC",
  },
  {
    type: "return-packing-list",
    titleZh: "退货装箱清单",
    titleEn: "Return Packing List",
    category: "second-tier",
    description: "退货时使用的装箱明细单",
    scenario: "跨境电商退货、退运清关",
    isFree: true,
    isOnline: false,
    icon: "↩️",
    exportFileNamePrefix: "RPL",
  },
  {
    type: "letter-of-credit-info-sheet",
    titleZh: "信用证简易资料单",
    titleEn: "Letter of Credit Info Sheet",
    category: "second-tier",
    description: "信用证关键信息整理单",
    scenario: "L/C 审证参考、制单核对",
    isFree: true,
    isOnline: false,
    icon: "💳",
    exportFileNamePrefix: "LC",
  },
];

export const documentStyles = [
  { id: "default", name: "黑白商务版", primaryColor: "#000000", borderColor: "#d1d5db", headingBgColor: "#f3f4f6", textColor: "#111827", isDefault: true },
  { id: "blue", name: "蓝色外贸版", primaryColor: "#2563eb", borderColor: "#bfdbfe", headingBgColor: "#eff6ff", textColor: "#1e3a5f", isDefault: false, memberOnly: true },
  { id: "dark-gray", name: "深灰专业版", primaryColor: "#374151", borderColor: "#d1d5db", headingBgColor: "#f9fafb", textColor: "#111827", isDefault: false, memberOnly: true },
  { id: "minimal", name: "简洁无边框版", primaryColor: "#000000", borderColor: "transparent", headingBgColor: "#ffffff", textColor: "#111827", isDefault: false, memberOnly: true },
  { id: "warehouse", name: "物流仓储版", primaryColor: "#059669", borderColor: "#a7f3d0", headingBgColor: "#ecfdf5", textColor: "#064e3b", isDefault: false, memberOnly: true },
];

export function getDocumentType(type: string): DocumentTypeMeta | undefined {
  return documentTypes.find(d => d.type === type);
}

export function getCoreDocuments(): DocumentTypeMeta[] {
  return documentTypes.filter(d => d.category === "core" && d.isOnline);
}

export function getSecondTierDocuments(): DocumentTypeMeta[] {
  return documentTypes.filter(d => d.category === "second-tier");
}
