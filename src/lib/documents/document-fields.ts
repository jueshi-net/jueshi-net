// 单据字段配置
// 每套单据的 section、fields、lineItems 配置

export interface DocumentField {
  key: string;
  label: string;
  labelEn?: string;
  type: "text" | "textarea" | "date" | "number" | "select" | "currency" | "checkbox" | "section-divider";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  colspan?: number;
}

export interface DocumentSection {
  id: string;
  title: string;
  fields: DocumentField[];
}

export interface LineItemColumn {
  key: string;
  label: string;
  width?: string;
}

export interface DocumentTemplate {
  type: string;
  sections: DocumentSection[];
  lineItems: LineItemColumn[];
  totals?: string[];
  defaultTerms?: string[];
}

// ========== 通用字段片段 ==========
const companyFields: DocumentField[] = [
  { key: "companyName", label: "公司名称", labelEn: "Company Name", type: "text", required: true, placeholder: "卖方公司全称" },
  { key: "companyNameEn", label: "英文名称", labelEn: "English Name", type: "text", placeholder: "Company English Name" },
  { key: "companyAddress", label: "公司地址", labelEn: "Address", type: "textarea", placeholder: "卖方详细地址" },
  { key: "companyPhone", label: "电话", labelEn: "Phone", type: "text", placeholder: "+86-XXX-XXXX-XXXX" },
  { key: "companyEmail", label: "邮箱", labelEn: "Email", type: "text", placeholder: "email@example.com" },
  { key: "companyWebsite", label: "网站", labelEn: "Website", type: "text", placeholder: "https://example.com" },
];

const buyerFields: DocumentField[] = [
  { key: "buyerName", label: "买方名称", labelEn: "Buyer / To", type: "text", required: true, placeholder: "买方公司全称" },
  { key: "buyerAddress", label: "买方地址", labelEn: "Address", type: "textarea", placeholder: "买方详细地址" },
  { key: "buyerContact", label: "联系人", labelEn: "Contact Person", type: "text" },
  { key: "buyerPhone", label: "电话", labelEn: "Phone", type: "text" },
  { key: "buyerEmail", label: "邮箱", labelEn: "Email", type: "text" },
];

const docHeaderFields = (noPrefix?: string): DocumentField[] => [
  { key: "documentNo", label: `${noPrefix || ""}编号`, labelEn: "No.", type: "text", required: true, placeholder: "如 PI-2024-001" },
  { key: "documentDate", label: "日期", labelEn: "Date", type: "date", required: true },
];

// ========== 1. 形式发票 PI ==========
export const proformaInvoice: DocumentTemplate = {
  type: "proforma-invoice",
  sections: [
    { id: "header", title: "单据信息", fields: [
      ...docHeaderFields("PI"),
      { key: "expiryDate", label: "有效期", labelEn: "Valid Until", type: "date" },
    ]},
    { id: "seller", title: "卖方信息", fields: companyFields },
    { id: "buyer", title: "买方信息", fields: buyerFields },
    { id: "shipping", title: "运输与贸易条款", fields: [
      { key: "transportMode", label: "运输方式", labelEn: "Transport", type: "select", options: ["海运", "空运", "快递", "铁路", "多式联运"] },
      { key: "portOfLoading", label: "起运港", labelEn: "Port of Loading", type: "text" },
      { key: "portOfDestination", label: "目的港", labelEn: "Port of Destination", type: "text" },
      { key: "paymentTerms", label: "付款方式", labelEn: "Payment", type: "select", options: ["T/T", "L/C", "D/P", "D/A", "Western Union", "PayPal"] },
      { key: "tradeTerms", label: "贸易条款", labelEn: "Trade Terms", type: "select", options: ["FOB", "CIF", "CFR", "EXW", "DDP", "DAP", "FCA"] },
      { key: "currency", label: "币种", labelEn: "Currency", type: "select", options: ["USD", "EUR", "CNY", "GBP", "CAD", "AUD", "JPY", "HKD"] },
    ]},
  ],
  lineItems: [
    { key: "description", label: "品名", width: "30%" },
    { key: "specification", label: "规格", width: "15%" },
    { key: "quantity", label: "数量", width: "10%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "unitPrice", label: "单价", width: "12%" },
    { key: "amount", label: "金额", width: "12%" },
    { key: "remark", label: "备注", width: "13%" },
  ],
  totals: ["totalQuantity", "totalAmount"],
  defaultTerms: ["1. Payment: 30% deposit, 70% balance before shipment.", "2. Delivery: Within 15 days after receiving deposit.", "3. This PI is valid for 30 days."],
};

// ========== 2. 商业发票 CI ==========
export const commercialInvoice: DocumentTemplate = {
  type: "commercial-invoice",
  sections: [
    { id: "header", title: "单据信息", fields: [
      ...docHeaderFields("CI"),
    ]},
    { id: "parties", title: "收发方信息", fields: [
      { key: "shipper", label: "发货人", labelEn: "Shipper / Exporter", type: "textarea", required: true, placeholder: "发货人名称及地址", colspan: 2 },
      { key: "consignee", label: "收货人", labelEn: "Consignee", type: "textarea", required: true, placeholder: "收货人名称及地址", colspan: 2 },
      { key: "notifyParty", label: "通知方", labelEn: "Notify Party", type: "textarea", placeholder: "通知方名称及地址", colspan: 2 },
    ]},
    { id: "transport", title: "运输信息", fields: [
      { key: "vesselVoyage", label: "船名航次/航班", labelEn: "Vessel/Voyage/Flight", type: "text" },
      { key: "billOfLadingNo", label: "提单号/运单号", labelEn: "B/L No.", type: "text" },
      { key: "countryOfTrade", label: "贸易国别", labelEn: "Country of Trade", type: "text" },
      { key: "countryOfOrigin", label: "原产国", labelEn: "Country of Origin", type: "text" },
      { key: "marks", label: "唛头", labelEn: "Marks & Nos", type: "textarea" },
    ]},
    { id: "declaration", title: "申报信息", fields: [
      { key: "declaration", label: "申报声明", labelEn: "Declaration", type: "textarea", placeholder: "We declare that this invoice is true and correct." },
    ]},
  ],
  lineItems: [
    { key: "marks", label: "唛头", width: "10%" },
    { key: "description", label: "品名", width: "25%" },
    { key: "hsCode", label: "HS编码", width: "12%" },
    { key: "quantity", label: "数量", width: "10%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "unitPrice", label: "单价", width: "12%" },
    { key: "amount", label: "总价", width: "12%" },
    { key: "remark", label: "备注", width: "11%" },
  ],
  totals: ["totalQuantity", "totalAmount"],
};

// ========== 3. 装箱单 PL ==========
export const packingList: DocumentTemplate = {
  type: "packing-list",
  sections: [
    { id: "header", title: "单据信息", fields: [
      ...docHeaderFields("PL"),
    ]},
    { id: "parties", title: "收发方信息", fields: [
      { key: "shipper", label: "发货人", labelEn: "Shipper", type: "textarea", required: true, colspan: 2 },
      { key: "consignee", label: "收货人", labelEn: "Consignee", type: "textarea", required: true, colspan: 2 },
    ]},
    { id: "shipping", title: "运输信息", fields: [
      { key: "marks", label: "唛头", labelEn: "Marks", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "cartonNo", label: "箱号", width: "10%" },
    { key: "description", label: "品名", width: "25%" },
    { key: "quantity", label: "数量", width: "10%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "grossWeight", label: "毛重(kg)", width: "12%" },
    { key: "netWeight", label: "净重(kg)", width: "12%" },
    { key: "volume", label: "体积(CBM)", width: "12%" },
    { key: "remark", label: "备注", width: "11%" },
  ],
  totals: ["totalCartons", "totalQuantity", "totalGrossWeight", "totalNetWeight", "totalVolume"],
};

// ========== 4. 外贸销售合同 ==========
export const salesContract: DocumentTemplate = {
  type: "sales-contract",
  sections: [
    { id: "header", title: "合同信息", fields: [
      ...docHeaderFields("合同"),
    ]},
    { id: "parties", title: "合同双方", fields: [
      { key: "sellerName", label: "卖方名称", labelEn: "Seller", type: "textarea", required: true, placeholder: "卖方公司全称及地址", colspan: 2 },
      { key: "buyerName", label: "买方名称", labelEn: "Buyer", type: "textarea", required: true, placeholder: "买方公司全称及地址", colspan: 2 },
    ]},
    { id: "product", title: "产品信息", fields: [] },
    { id: "terms", title: "合同条款", fields: [
      { key: "qualityStandard", label: "质量标准", labelEn: "Quality Standard", type: "textarea", placeholder: "产品规格、质量标准、检验方法", colspan: 2 },
      { key: "packingRequirement", label: "包装要求", labelEn: "Packing", type: "textarea", placeholder: "包装方式、材料、标识", colspan: 2 },
      { key: "deliveryTime", label: "交货期", labelEn: "Delivery Time", type: "text" },
      { key: "portOfLoading", label: "起运港", labelEn: "Port of Loading", type: "text" },
      { key: "portOfDestination", label: "目的港", labelEn: "Port of Destination", type: "text" },
      { key: "paymentTerms", label: "付款方式", labelEn: "Payment", type: "select", options: ["T/T", "L/C", "D/P", "D/A"] },
      { key: "tradeTerms", label: "贸易条款", labelEn: "Trade Terms", type: "select", options: ["FOB", "CIF", "CFR", "EXW", "DDP", "DAP"] },
      { key: "currency", label: "币种", labelEn: "Currency", type: "select", options: ["USD", "EUR", "CNY", "GBP"] },
      { key: "breachClause", label: "违约责任", labelEn: "Breach", type: "textarea", colspan: 2 },
      { key: "claimClause", label: "索赔条款", labelEn: "Claim", type: "textarea", colspan: 2 },
      { key: "disputeResolution", label: "争议解决", labelEn: "Dispute Resolution", type: "textarea", placeholder: "仲裁或诉讼地", colspan: 2 },
    ]},
    { id: "signature", title: "签字盖章", fields: [
      { key: "sellerSignature", label: "卖方签字", labelEn: "Seller Signature", type: "textarea", colspan: 2 },
      { key: "buyerSignature", label: "买方签字", labelEn: "Buyer Signature", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "description", label: "产品名称", width: "30%" },
    { key: "specification", label: "规格", width: "20%" },
    { key: "quantity", label: "数量", width: "12%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "unitPrice", label: "单价", width: "15%" },
    { key: "amount", label: "总金额", width: "15%" },
  ],
  totals: ["totalAmount"],
};

// ========== 5. 订舱委托书 ==========
export const bookingInstruction: DocumentTemplate = {
  type: "booking-instruction",
  sections: [
    { id: "header", title: "委托信息", fields: [
      ...docHeaderFields("托书"),
    ]},
    { id: "parties", title: "委托双方", fields: [
      { key: "consignor", label: "委托方", labelEn: "Consignor", type: "textarea", required: true, placeholder: "委托公司名称、联系人、电话", colspan: 2 },
      { key: "forwarder", label: "货代信息", labelEn: "Forwarder", type: "textarea", placeholder: "货代公司名称", colspan: 2 },
    ]},
    { id: "shipping", title: "运输信息", fields: [
      { key: "shipDate", label: "出货日期", labelEn: "Ship Date", type: "date" },
      { key: "vesselSchedule", label: "预计船期", labelEn: "ETD", type: "date" },
      { key: "portOfLoading", label: "起运港", labelEn: "POL", type: "text" },
      { key: "portOfDestination", label: "目的港", labelEn: "POD", type: "text" },
      { key: "containerTypeQty", label: "柜型柜量", labelEn: "Container/Qty", type: "text", placeholder: "如 1x40HQ" },
      { key: "freightTerms", label: "运费条款", labelEn: "Freight Terms", type: "select", options: ["预付", "到付", "第三地付款"] },
      { key: "isDangerous", label: "是否危险品", labelEn: "Dangerous Goods", type: "select", options: ["否", "是"] },
      { key: "isGeneralCargo", label: "是否普货", labelEn: "General Cargo", type: "select", options: ["是", "否"] },
      { key: "contactName", label: "联系人", labelEn: "Contact", type: "text" },
      { key: "contactPhone", label: "电话", labelEn: "Phone", type: "text" },
      { key: "specialRequirements", label: "特殊要求", labelEn: "Special Requirements", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "description", label: "品名", width: "30%" },
    { key: "packages", label: "件数", width: "12%" },
    { key: "unit", label: "单位", width: "10%" },
    { key: "grossWeight", label: "毛重(kg)", width: "15%" },
    { key: "volume", label: "体积(CBM)", width: "15%" },
    { key: "hsCode", label: "HS编码", width: "18%" },
  ],
  totals: ["totalPackages", "totalGrossWeight", "totalVolume"],
};

// ========== 6. 报关委托书 ==========
export const customsDeclarationAuth: DocumentTemplate = {
  type: "customs-declaration-authorization",
  sections: [
    { id: "header", title: "委托信息", fields: [
      ...docHeaderFields("委托书"),
    ]},
    { id: "parties", title: "委托双方", fields: [
      { key: "consignorCompany", label: "委托单位", labelEn: "Consignor", type: "textarea", required: true, placeholder: "委托单位全称", colspan: 2 },
      { key: "consignorCreditCode", label: "统一社会信用代码", labelEn: "Credit Code", type: "text" },
      { key: "customsBroker", label: "被委托报关行", labelEn: "Customs Broker", type: "textarea", required: true, placeholder: "报关行全称", colspan: 2 },
      { key: "contactName", label: "联系人", labelEn: "Contact", type: "text" },
      { key: "contactPhone", label: "电话", labelEn: "Phone", type: "text" },
    ]},
    { id: "cargo", title: "货物信息", fields: [
      { key: "cargoName", label: "货物名称", labelEn: "Cargo Name", type: "text" },
      { key: "tradeMode", label: "贸易方式", labelEn: "Trade Mode", type: "select", options: ["一般贸易", "来料加工", "进料加工", "暂时进出口", "其他"] },
      { key: "countryOfOrigin", label: "起运国", labelEn: "Country of Origin", type: "text" },
      { key: "countryOfDestination", label: "目的国", labelEn: "Country of Destination", type: "text" },
      { key: "customsPort", label: "报关口岸", labelEn: "Customs Port", type: "text" },
    ]},
    { id: "declaration", title: "责任条款", fields: [
      { key: "responsibility", label: "责任条款", labelEn: "Responsibility", type: "textarea", placeholder: "委托方保证所提供的报关资料真实、完整、有效...", colspan: 2 },
    ]},
    { id: "signature", title: "盖章签字", fields: [
      { key: "consignorStamp", label: "委托单位盖章", labelEn: "Consignor Stamp", type: "textarea", colspan: 2 },
      { key: "customsBrokerStamp", label: "报关行盖章", labelEn: "Broker Stamp", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [],
  totals: [],
  defaultTerms: ["1. 本委托书仅为通用参考格式，正式报关请以报关行或主管机关要求为准。", "2. 委托方应对所提供的报关资料真实性负责。"],
};

// ========== 7. 送货单 ==========
export const deliveryNote: DocumentTemplate = {
  type: "delivery-note",
  sections: [
    { id: "header", title: "单据信息", fields: [
      ...docHeaderFields("送货"),
    ]},
    { id: "parties", title: "收发方", fields: [
      { key: "deliveryCompany", label: "送货单位", labelEn: "Delivery Company", type: "textarea", required: true, colspan: 2 },
      { key: "warehouse", label: "收货仓库", labelEn: "Warehouse", type: "textarea", required: true, colspan: 2 },
      { key: "deliveryPerson", label: "送货人", labelEn: "Delivery Person", type: "text" },
      { key: "receiver", label: "收货人", labelEn: "Receiver", type: "text" },
    ]},
  ],
  lineItems: [
    { key: "description", label: "货品名称", width: "30%" },
    { key: "cartons", label: "箱数", width: "12%" },
    { key: "quantity", label: "数量", width: "12%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "weight", label: "重量(kg)", width: "12%" },
    { key: "volume", label: "体积(CBM)", width: "12%" },
    { key: "remark", label: "备注", width: "14%" },
  ],
  totals: ["totalCartons", "totalQuantity", "totalWeight", "totalVolume"],
};

// ========== 8. 运费对账单 ==========
export const freightStatement: DocumentTemplate = {
  type: "freight-statement",
  sections: [
    { id: "header", title: "对账信息", fields: [
      ...docHeaderFields("对账"),
      { key: "customerName", label: "客户名称", labelEn: "Customer", type: "text", required: true },
      { key: "statementPeriod", label: "对账周期", labelEn: "Period", type: "text", placeholder: "如 2024.01.01 - 2024.01.31" },
    ]},
  ],
  lineItems: [
    { key: "refNo", label: "单号/柜号", width: "15%" },
    { key: "vesselSchedule", label: "船期", width: "12%" },
    { key: "description", label: "品名", width: "18%" },
    { key: "oceanFreight", label: "海运费", width: "10%" },
    { key: "truckFee", label: "拖车费", width: "8%" },
    { key: "customsFee", label: "报关费", width: "8%" },
    { key: "storageFee", label: "仓储费", width: "8%" },
    { key: "handlingFee", label: "操作费", width: "8%" },
    { key: "miscFee", label: "杂费", width: "8%" },
    { key: "remark", label: "备注", width: "5%" },
  ],
  totals: ["totalAmount", "paidAmount", "unpaidAmount"],
};

// ========== 9. 集运入库单 ==========
export const consolidationInbound: DocumentTemplate = {
  type: "consolidation-inbound-receipt",
  sections: [
    { id: "header", title: "入库信息", fields: [
      ...docHeaderFields("入库"),
      { key: "customerAccount", label: "集运账号", labelEn: "Account", type: "text" },
      { key: "customerNickname", label: "客户昵称", labelEn: "Nickname", type: "text" },
      { key: "arrivalDate", label: "到货日期", labelEn: "Arrival Date", type: "date" },
      { key: "expressTrackingNo", label: "快递单号", labelEn: "Tracking No.", type: "text" },
    ]},
    { id: "cargo", title: "包裹信息", fields: [
      { key: "packageCount", label: "包裹个数", labelEn: "Packages", type: "number" },
      { key: "weight", label: "重量(kg)", labelEn: "Weight", type: "number" },
      { key: "length", label: "长(cm)", labelEn: "Length", type: "number" },
      { key: "width", label: "宽(cm)", labelEn: "Width", type: "number" },
      { key: "height", label: "高(cm)", labelEn: "Height", type: "number" },
      { key: "itemType", label: "物品类型", labelEn: "Item Type", type: "select", options: ["普货", "敏感货", "食品", "液体", "电池", "粉末", "其他"] },
      { key: "operator", label: "操作员", labelEn: "Operator", type: "text" },
      { key: "remark", label: "备注", labelEn: "Remark", type: "textarea" },
    ]},
  ],
  lineItems: [],
  totals: [],
};

// ========== 10. 集运合箱打包清单 ==========
export const consolidationPackingList: DocumentTemplate = {
  type: "consolidation-packing-list",
  sections: [
    { id: "header", title: "合箱信息", fields: [
      ...docHeaderFields("合箱"),
      { key: "customerId", label: "客户 ID", labelEn: "Customer ID", type: "text" },
      { key: "originalPackageCount", label: "原包裹数量", labelEn: "Original Packages", type: "number" },
      { key: "consolidatedBoxCount", label: "合箱后箱数", labelEn: "Consolidated Boxes", type: "number" },
      { key: "operator", label: "操作员", labelEn: "Operator", type: "text" },
      { key: "documentDate", label: "日期", labelEn: "Date", type: "date" },
    ]},
    { id: "warning", title: "禁运提醒", fields: [
      { key: "warning", label: "禁运提醒", labelEn: "Warning", type: "textarea", placeholder: "请确认不含禁运物品：易燃易爆、液体、粉末、食品等", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "originalTrackingNo", label: "原快递单号", width: "20%" },
    { key: "description", label: "物品名称", width: "25%" },
    { key: "quantity", label: "数量", width: "10%" },
    { key: "weight", label: "重量(kg)", width: "12%" },
    { key: "length", label: "长(cm)", width: "8%" },
    { key: "width", label: "宽(cm)", width: "8%" },
    { key: "height", label: "高(cm)", width: "8%" },
    { key: "remark", label: "备注", width: "9%" },
  ],
  totals: ["totalWeight", "totalVolume"],
};

// ========== 11. 国际快递申报单 ==========
export const expressDeclaration: DocumentTemplate = {
  type: "express-declaration",
  sections: [
    { id: "header", title: "申报信息", fields: [
      ...docHeaderFields("申报"),
    ]},
    { id: "parties", title: "收发方", fields: [
      { key: "senderName", label: "寄件人", labelEn: "Sender", type: "textarea", required: true, placeholder: "寄件人姓名、电话、地址", colspan: 2 },
      { key: "recipientName", label: "收件人", labelEn: "Recipient", type: "textarea", required: true, placeholder: "收件人姓名、电话、地址", colspan: 2 },
      { key: "trackingNo", label: "运单号", labelEn: "Tracking No.", type: "text" },
    ]},
    { id: "goods", title: "物品信息", fields: [
      { key: "isPersonal", label: "个人物品", labelEn: "Personal", type: "checkbox" },
      { key: "isCommercial", label: "贸易物品", labelEn: "Commercial", type: "checkbox" },
      { key: "countryOfOrigin", label: "原产国", labelEn: "Country of Origin", type: "text" },
      { key: "purpose", label: "用途", labelEn: "Purpose", type: "select", options: ["个人自用", "礼品", "样品", "销售", "退货", "其他"] },
      { key: "declaration", label: "申报声明", labelEn: "Declaration", type: "textarea", placeholder: "本人声明以上申报信息真实准确，如有虚假愿承担相应法律责任。", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "descriptionZh", label: "物品名称（中文）", width: "25%" },
    { key: "descriptionEn", label: "英文申报名", width: "25%" },
    { key: "quantity", label: "数量", width: "10%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "unitPrice", label: "申报价值", width: "12%" },
    { key: "totalValue", label: "总价值", width: "12%" },
    { key: "hsCode", label: "HS编码", width: "8%" },
  ],
  totals: ["totalQuantity", "totalValue"],
};

// ========== 12. 通用报价单 ==========
export const quotation: DocumentTemplate = {
  type: "quotation",
  sections: [
    { id: "header", title: "报价信息", fields: [
      ...docHeaderFields("报价"),
      { key: "expiryDate", label: "有效期", labelEn: "Valid Until", type: "date" },
    ]},
    { id: "parties", title: "双方信息", fields: [
      { key: "companyName", label: "报价公司", labelEn: "Company", type: "textarea", required: true, placeholder: "报价方公司全称", colspan: 2 },
      { key: "buyerName", label: "客户信息", labelEn: "Customer", type: "textarea", placeholder: "客户名称", colspan: 2 },
    ]},
    { id: "terms", title: "条款", fields: [
      { key: "paymentTerms", label: "付款方式", labelEn: "Payment", type: "select", options: ["T/T", "L/C", "D/P", "PayPal", "Western Union", "其他"] },
      { key: "deliveryTime", label: "交货周期", labelEn: "Delivery Time", type: "text" },
      { key: "terms", label: "备注条款", labelEn: "Terms", type: "textarea", colspan: 2 },
    ]},
    { id: "contact", title: "联系人", fields: [
      { key: "quotationPerson", label: "报价人", labelEn: "Prepared By", type: "text" },
      { key: "contactInfo", label: "联系方式", labelEn: "Contact Info", type: "text" },
    ]},
  ],
  lineItems: [
    { key: "description", label: "产品/服务/项目", width: "35%" },
    { key: "specification", label: "规格/说明", width: "20%" },
    { key: "quantity", label: "数量", width: "12%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "unitPrice", label: "单价", width: "12%" },
    { key: "amount", label: "总价", width: "13%" },
  ],
  totals: ["totalAmount"],
};

// ========== 13. 提单补料 SI ==========
export const shippingInstruction: DocumentTemplate = {
  type: "shipping-instruction",
  sections: [
    { id: "header", title: "补料信息", fields: [
      ...docHeaderFields("SI"),
      { key: "bookingNo", label: "订舱号", labelEn: "Booking No.", type: "text", required: true },
      { key: "containerNo", label: "柜号", labelEn: "Container No.", type: "text" },
      { key: "sealNo", label: "封号", labelEn: "Seal No.", type: "text" },
    ]},
    { id: "parties", title: "收发方", fields: [
      { key: "shipper", label: "发货人", labelEn: "Shipper", type: "textarea", required: true, colspan: 2 },
      { key: "consignee", label: "收货人", labelEn: "Consignee", type: "select", options: ["凭指示 To Order", "记名 Consignee", "凭托运人指示 To Order of Shipper"], required: true, colspan: 2 },
      { key: "consigneeDetails", label: "收货人详情", labelEn: "Consignee Details", type: "textarea", placeholder: "公司全称、地址、联系方式", colspan: 2 },
      { key: "notifyParty", label: "通知方", labelEn: "Notify Party", type: "textarea", colspan: 2 },
    ]},
    { id: "vessel", title: "船期信息", fields: [
      { key: "vesselName", label: "船名", labelEn: "Vessel", type: "text" },
      { key: "voyageNo", label: "航次", labelEn: "Voyage", type: "text" },
      { key: "portOfLoading", label: "起运港", labelEn: "POL", type: "text" },
      { key: "portOfDischarge", label: "卸货港", labelEn: "POD", type: "text" },
      { key: "placeOfDelivery", label: "交货地", labelEn: "Place of Delivery", type: "text" },
      { key: "etd", label: "预计离港日期", labelEn: "ETD", type: "date" },
      { key: "eta", label: "预计到港日期", labelEn: "ETA", type: "date" },
    ]},
    { id: "freight", title: "运费条款", fields: [
      { key: "freightType", label: "运费条款", labelEn: "Freight", type: "select", options: ["预付 Freight Prepaid", "到付 Freight Collect"] },
      { key: "cargoReadyDate", label: "货好日期", labelEn: "Cargo Ready Date", type: "date" },
      { key: "cutOffDate", label: "截关日期", labelEn: "Cut-off Date", type: "date" },
    ]},
  ],
  lineItems: [
    { key: "containerType", label: "柜型", width: "12%" },
    { key: "quantity", label: "柜量", width: "8%" },
    { key: "description", label: "品名", width: "30%" },
    { key: "packages", label: "件数", width: "10%" },
    { key: "grossWeight", label: "毛重(KGS)", width: "12%" },
    { key: "volume", label: "体积(CBM)", width: "12%" },
    { key: "hsCode", label: "HS编码", width: "16%" },
  ],
  totals: ["totalPackages", "totalGrossWeight", "totalVolume"],
};

// ========== 14. 拖车派车单 ==========
export const truckingDispatchOrder: DocumentTemplate = {
  type: "trucking-dispatch-order",
  sections: [
    { id: "header", title: "派车信息", fields: [
      ...docHeaderFields("派车"),
      { key: "driverName", label: "司机姓名", labelEn: "Driver", type: "text" },
      { key: "driverPhone", label: "司机电话", labelEn: "Driver Phone", type: "text" },
      { key: "vehiclePlate", label: "车牌号", labelEn: "Plate No.", type: "text" },
    ]},
    { id: "pickup", title: "提柜信息", fields: [
      { key: "depotName", label: "提柜堆场", labelEn: "Depot", type: "textarea", required: true, colspan: 2 },
      { key: "depotContact", label: "堆场联系人", labelEn: "Depot Contact", type: "text" },
      { key: "containerType", label: "柜型", labelEn: "Container Type", type: "select", options: ["20GP", "40GP", "40HQ", "45HQ", "20RF", "40RF"] },
      { key: "containerQty", label: "柜量", labelEn: "Quantity", type: "number" },
    ]},
    { id: "delivery", title: "装柜/还柜信息", fields: [
      { key: "factoryName", label: "工厂/装柜地址", labelEn: "Factory", type: "textarea", required: true, colspan: 2 },
      { key: "factoryContact", label: "工厂联系人", labelEn: "Factory Contact", type: "text" },
      { key: "loadingDate", label: "装柜日期", labelEn: "Loading Date", type: "date" },
      { key: "loadingTime", label: "装柜时间", labelEn: "Loading Time", type: "text" },
      { key: "returnPort", label: "还柜码头", labelEn: "Return Port", type: "text" },
      { key: "cutOffDate", label: "截关日期", labelEn: "Cut-off Date", type: "date" },
    ]},
    { id: "notes", title: "备注", fields: [
      { key: "notes", label: "特殊要求", labelEn: "Notes", type: "textarea", placeholder: "如：需尾板车、需穿雨衣、不可叠放等", colspan: 2 },
    ]},
  ],
  lineItems: [],
  totals: [],
};

// ========== 15. 唛头通用模板 ==========
export const shippingMark: DocumentTemplate = {
  type: "shipping-mark",
  sections: [
    { id: "header", title: "唛头信息", fields: [
      ...docHeaderFields("唛头"),
      { key: "orderNo", label: "订单号", labelEn: "Order No.", type: "text" },
      { key: "destinationPort", label: "目的港", labelEn: "Destination Port", type: "text" },
    ]},
    { id: "mark", title: "唛头内容", fields: [
      { key: "companyAbbreviation", label: "公司简称/收货人简称", labelEn: "Consignee Abbrev.", type: "text", required: true, placeholder: "如 ABC" },
      { key: "cartonRange", label: "箱号范围", labelEn: "Carton No.", type: "text", required: true, placeholder: "如 1-100 或 C/No.1-100" },
      { key: "destination", label: "目的港/目的地", labelEn: "Destination", type: "text", required: true },
      { key: "countryOfOrigin", label: "原产地", labelEn: "Country of Origin", type: "text", placeholder: "MADE IN CHINA" },
      { key: "description", label: "货物描述", labelEn: "Description", type: "textarea", placeholder: "品名、规格、型号", colspan: 2 },
    ]},
    { id: "preview", title: "唛头预览", fields: [
      { key: "markPreview", label: "唛头样式", labelEn: "Mark Preview", type: "textarea", placeholder: "系统自动生成的唛头文本：\n\nABC\nC/No.1-100\nNEW YORK\nMADE IN CHINA", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "cartonNo", label: "箱号", width: "15%" },
    { key: "description", label: "品名", width: "30%" },
    { key: "specification", label: "规格", width: "20%" },
    { key: "quantity", label: "数量", width: "12%" },
    { key: "grossWeight", label: "毛重(KGS)", width: "12%" },
    { key: "dimension", label: "尺寸(CM)", width: "11%" },
  ],
  totals: ["totalQuantity", "totalGrossWeight"],
};

// ========== 16. 装柜明细单 ==========
export const containerLoadingList: DocumentTemplate = {
  type: "container-loading-list",
  sections: [
    { id: "header", title: "装柜信息", fields: [
      ...docHeaderFields("装柜"),
      { key: "containerNo", label: "柜号", labelEn: "Container No.", type: "text", required: true, placeholder: "如 MSKU1234567" },
      { key: "sealNo", label: "封条号", labelEn: "Seal No.", type: "text" },
      { key: "containerType", label: "柜型", labelEn: "Container Type", type: "select", options: ["20GP", "40GP", "40HQ", "45HQ", "20RF", "40RF", "20OT", "40OT", "20FR", "40FR"] },
    ]},
    { id: "location", title: "装柜地点", fields: [
      { key: "loadingAddress", label: "装柜地址", labelEn: "Loading Address", type: "textarea", required: true, colspan: 2 },
      { key: "loadingDate", label: "装柜日期", labelEn: "Loading Date", type: "date" },
      { key: "loadingSupervisor", label: "监装人", labelEn: "Supervisor", type: "text" },
    ]},
    { id: "cargo", title: "货物明细", fields: [] },
    { id: "summary", title: "装柜汇总", fields: [
      { key: "totalCartons", label: "总箱数", labelEn: "Total Cartons", type: "text" },
      { key: "totalGrossWeight", label: "总毛重(KGS)", labelEn: "Total GW", type: "text" },
      { key: "totalVolume", label: "总体积(CBM)", labelEn: "Total CBM", type: "text" },
      { key: "loadingNotes", label: "装柜备注", labelEn: "Loading Notes", type: "textarea", placeholder: "如：重不压轻、防潮、不可倒置等", colspan: 2 },
    ]},
    { id: "signature", title: "签字确认", fields: [
      { key: "loaderSignature", label: "装柜人签字", labelEn: "Loader Signature", type: "textarea", colspan: 2 },
      { key: "supervisorSignature", label: "监装人签字", labelEn: "Supervisor Signature", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "cartonNo", label: "箱号", width: "12%" },
    { key: "description", label: "品名", width: "25%" },
    { key: "specification", label: "规格", width: "15%" },
    { key: "quantity", label: "数量", width: "10%" },
    { key: "grossWeight", label: "毛重(KGS)", width: "12%" },
    { key: "netWeight", label: "净重(KGS)", width: "12%" },
    { key: "volume", label: "体积(CBM)", width: "14%" },
  ],
  totals: ["totalQuantity", "totalGrossWeight", "totalNetWeight", "totalVolume"],
};

// ========== 17. 退货装箱清单 ==========
export const returnPackingList: DocumentTemplate = {
  type: "return-packing-list",
  sections: [
    { id: "header", title: "退货信息", fields: [
      ...docHeaderFields("退货"),
      { key: "originalOrderNo", label: "原订单号", labelEn: "Original Order No.", type: "text", required: true },
      { key: "returnReason", label: "退货原因", labelEn: "Return Reason", type: "select", options: ["质量问题", "尺寸不符", "发错货", "客户取消", "破损", "其他"] },
      { key: "rmaNo", label: "RMA编号", labelEn: "RMA No.", type: "text" },
    ]},
    { id: "parties", title: "收发方", fields: [
      { key: "returnFrom", label: "退货方", labelEn: "Return From", type: "textarea", required: true, placeholder: "退货客户名称、地址、联系方式", colspan: 2 },
      { key: "returnTo", label: "收货方", labelEn: "Return To", type: "textarea", required: true, placeholder: "退货仓库/供应商地址", colspan: 2 },
      { key: "carrier", label: "物流承运商", labelEn: "Carrier", type: "text" },
      { key: "trackingNo", label: "运单号", labelEn: "Tracking No.", type: "text" },
    ]},
    { id: "inspection", title: "检验信息", fields: [
      { key: "inspectionResult", label: "检验结果", labelEn: "Inspection", type: "select", options: ["未检验", "完好可再售", "需返修", "报废处理", "退回供应商"] },
      { key: "inspector", label: "检验人", labelEn: "Inspector", type: "text" },
      { key: "inspectionDate", label: "检验日期", labelEn: "Inspection Date", type: "date" },
      { key: "notes", label: "备注", labelEn: "Notes", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "sku", label: "SKU/货号", width: "15%" },
    { key: "description", label: "品名", width: "25%" },
    { key: "quantity", label: "退货数量", width: "12%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "condition", label: "货物状态", width: "15%" },
    { key: "originalPrice", label: "原价", width: "12%" },
    { key: "remark", label: "备注", width: "13%" },
  ],
  totals: ["totalQuantity"],
};

// ========== 18. 通用原产地证 CO 资料模板 ==========
export const certificateOfOrigin: DocumentTemplate = {
  type: "certificate-of-origin-template",
  sections: [
    { id: "header", title: "证书信息", fields: [
      ...docHeaderFields("CO"),
      { key: "invoiceNo", label: "发票号", labelEn: "Invoice No.", type: "text", required: true },
      { key: "lCNo", label: "信用证号", labelEn: "L/C No.", type: "text" },
    ]},
    { id: "exporter", title: "出口方", fields: [
      { key: "exporterName", label: "出口商名称", labelEn: "Exporter", type: "textarea", required: true, placeholder: "出口公司全称及地址", colspan: 2 },
    ]},
    { id: "consignee", title: "收货方", fields: [
      { key: "consigneeName", label: "收货人名称", labelEn: "Consignee", type: "textarea", required: true, placeholder: "收货公司全称及地址", colspan: 2 },
      { key: "notifyParty", label: "通知方", labelEn: "Notify Party", type: "textarea", colspan: 2 },
    ]},
    { id: "transport", title: "运输信息", fields: [
      { key: "portOfLoading", label: "装运港", labelEn: "Port of Loading", type: "text" },
      { key: "portOfDischarge", label: "卸货港", labelEn: "Port of Discharge", type: "text" },
      { key: "transportMode", label: "运输方式", labelEn: "Transport", type: "select", options: ["海运", "空运", "陆运", "多式联运"] },
      { key: "vesselName", label: "船名/航班号", labelEn: "Vessel/Flight", type: "text" },
    ]},
    { id: "goods", title: "货物描述", fields: [] },
    { id: "origin", title: "原产地声明", fields: [
      { key: "countryOfOrigin", label: "原产国", labelEn: "Country of Origin", type: "text", required: true, placeholder: "CHINA" },
      { key: "originDeclaration", label: "原产地声明", labelEn: "Origin Declaration", type: "textarea", placeholder: "We hereby declare that the goods described above are wholly of Chinese origin.", colspan: 2 },
    ]},
    { id: "signature", title: "签字盖章", fields: [
      { key: "applicantSignature", label: "申请人签字", labelEn: "Applicant Signature", type: "textarea", colspan: 2 },
      { key: "chamberStamp", label: "商会/签证机构盖章", labelEn: "Chamber Stamp", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "marks", label: "唛头", width: "12%" },
    { key: "description", label: "品名及包装", width: "30%" },
    { key: "quantity", label: "数量", width: "12%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "grossWeight", label: "毛重(KGS)", width: "12%" },
    { key: "volume", label: "体积(CBM)", width: "12%" },
    { key: "invoiceValue", label: "发票金额", width: "14%" },
  ],
  totals: ["totalQuantity", "totalGrossWeight", "totalAmount"],
  defaultTerms: ["⚠️ 本工具仅提供资料整理模板，不签发官方原产地证。正式原产地证请向贸促会(CCPIT)或海关申请。"],
};

// ========== 19. 熏蒸证明通用模板 ==========
export const fumigationCertificate: DocumentTemplate = {
  type: "fumigation-certificate-template",
  sections: [
    { id: "header", title: "证书信息", fields: [
      ...docHeaderFields("熏蒸"),
      { key: "invoiceNo", label: "发票号", labelEn: "Invoice No.", type: "text" },
      { key: "billOfLadingNo", label: "提单号", labelEn: "B/L No.", type: "text" },
    ]},
    { id: "consignor", title: "发货方", fields: [
      { key: "consignorName", label: "发货人", labelEn: "Consignor", type: "textarea", required: true, colspan: 2 },
      { key: "consigneeName", label: "收货人", labelEn: "Consignee", type: "textarea", required: true, colspan: 2 },
    ]},
    { id: "treatment", title: "熏蒸处理信息", fields: [
      { key: "treatmentType", label: "处理方式", labelEn: "Treatment", type: "select", options: ["甲基溴熏蒸", "硫酰氟熏蒸", "热处理", "其他"] },
      { key: "treatmentDuration", label: "处理时长", labelEn: "Duration", type: "text", placeholder: "如 24 小时" },
      { key: "temperature", label: "处理温度", labelEn: "Temperature", type: "text", placeholder: "如 21°C" },
      { key: "chemicalDosage", label: "药剂用量", labelEn: "Dosage", type: "text" },
      { key: "treatmentDate", label: "处理日期", labelEn: "Treatment Date", type: "date" },
      { key: "treatmentLocation", label: "处理地点", labelEn: "Location", type: "text" },
      { key: "fumigator", label: "熏蒸公司/操作人", labelEn: "Fumigator", type: "text" },
    ]},
    { id: "goods", title: "货物描述", fields: [] },
    { id: "declaration", title: "声明", fields: [
      { key: "declaration", label: "声明", labelEn: "Declaration", type: "textarea", placeholder: "The above consignment has been fumigated and is free from live pests.", colspan: 2 },
    ]},
    { id: "signature", title: "签字盖章", fields: [
      { key: "fumigatorSignature", label: "熏蒸操作人签字", labelEn: "Fumigator Signature", type: "textarea", colspan: 2 },
      { key: "authorityStamp", label: "检疫机构盖章", labelEn: "Authority Stamp", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "description", label: "品名及包装", width: "30%" },
    { key: "quantity", label: "数量", width: "12%" },
    { key: "unit", label: "单位", width: "8%" },
    { key: "grossWeight", label: "毛重(KGS)", width: "15%" },
    { key: "woodPackaging", label: "木质包装说明", width: "35%" },
  ],
  totals: ["totalQuantity", "totalGrossWeight"],
  defaultTerms: ["⚠️ 本工具仅提供资料整理模板，不签发检疫或熏蒸证书。正式熏蒸证明请向有资质的熏蒸公司或检疫机构申请。"],
};

// ========== 20. 信用证简易资料单 ==========
export const letterOfCreditInfo: DocumentTemplate = {
  type: "letter-of-credit-info-sheet",
  sections: [
    { id: "header", title: "信用证信息", fields: [
      ...docHeaderFields("L/C"),
      { key: "lcNo", label: "信用证号", labelEn: "L/C No.", type: "text", required: true },
      { key: "issuingBank", label: "开证行", labelEn: "Issuing Bank", type: "text", required: true },
      { key: "lcType", label: "信用证类型", labelEn: "L/C Type", type: "select", options: ["即期 Sight", "远期 Usance", "可转让 Transferable", "备用 Standby"] },
    ]},
    { id: "parties", title: "相关方", fields: [
      { key: "applicant", label: "开证申请人(买方)", labelEn: "Applicant", type: "textarea", required: true, colspan: 2 },
      { key: "beneficiary", label: "受益人(卖方)", labelEn: "Beneficiary", type: "textarea", required: true, colspan: 2 },
      { key: "advisingBank", label: "通知行", labelEn: "Advising Bank", type: "text", colspan: 2 },
    ]},
    { id: "terms", title: "条款", fields: [
      { key: "amount", label: "信用证金额", labelEn: "Amount", type: "text" },
      { key: "expiryDate", label: "有效期", labelEn: "Expiry Date", type: "date" },
      { key: "expiryPlace", label: "到期地点", labelEn: "Expiry Place", type: "text" },
      { key: "latestShipment", label: "最迟装运日", labelEn: "Latest Shipment", type: "date" },
      { key: "portOfLoading", label: "装运港", labelEn: "Port of Loading", type: "text" },
      { key: "portOfDischarge", label: "卸货港", labelEn: "Port of Discharge", type: "text" },
      { key: "partialShipment", label: "分批装运", labelEn: "Partial Shipment", type: "select", options: ["允许 Allowed", "不允许 Not Allowed"] },
      { key: "transshipment", label: "转运", labelEn: "Transshipment", type: "select", options: ["允许 Allowed", "不允许 Not Allowed"] },
    ]},
    { id: "documents", title: "所需单据清单", fields: [
      { key: "requiredDocs", label: "所需单据", labelEn: "Required Documents", type: "textarea", placeholder: "1. Commercial Invoice\n2. Packing List\n3. Bill of Lading\n4. Certificate of Origin\n5. Insurance Policy\n6. Inspection Certificate", colspan: 2 },
    ]},
  ],
  lineItems: [],
  totals: [],
};

// ========== 21. 集运入库标签 ==========
export const inboundLabel: DocumentTemplate = {
  type: "inbound-label",
  sections: [
    { id: "header", title: "标签信息", fields: [
      { key: "orderNo", label: "订单号", labelEn: "Order No.", type: "text", required: true, placeholder: "如 ORD-20260526-001" },
      { key: "customerCode", label: "客户代码", labelEn: "Customer Code", type: "text", required: true, placeholder: "如 CUST-001" },
      { key: "warehouseLocation", label: "仓位/库位", labelEn: "Location", type: "text", placeholder: "如 A-01-03" },
      { key: "receiveDate", label: "入库日期", labelEn: "Received Date", type: "date" },
    ]},
    { id: "package", title: "包裹信息", fields: [
      { key: "packageDesc", label: "包裹内容", labelEn: "Contents", type: "textarea", placeholder: "如：衣服 2件、鞋子 1双", colspan: 2 },
      { key: "weight", label: "重量(KG)", labelEn: "Weight", type: "number" },
      { key: "dimensions", label: "尺寸(cm)", labelEn: "Dimensions", type: "text", placeholder: "如 40x30x20" },
    ]},
  ],
  lineItems: [
    { key: "itemDesc", label: "物品", width: "40%" },
    { key: "quantity", label: "数量", width: "15%" },
    { key: "unitPrice", label: "单价", width: "15%" },
    { key: "amount", label: "小计", width: "15%" },
    { key: "cartonNo", label: "箱号", width: "15%" },
  ],
  totals: ["totalQuantity", "totalAmount"],
};

// ========== 22. 合箱标签 ==========
export const consolidationLabel: DocumentTemplate = {
  type: "consolidation-label",
  sections: [
    { id: "header", title: "合箱信息", fields: [
      { key: "consolidationNo", label: "合箱编号", labelEn: "Consolidation No.", type: "text", required: true },
      { key: "masterOrderNo", label: "主单号", labelEn: "Master Order", type: "text" },
      { key: "destination", label: "目的地", labelEn: "Destination", type: "text" },
    ]},
    { id: "subpackages", title: "子包裹", fields: [
      { key: "subPackageList", label: "子包裹编号列表", labelEn: "Sub-package IDs", type: "textarea", placeholder: "每行一个子包裹编号", colspan: 2 },
    ]},
  ],
  lineItems: [
    { key: "subOrderNo", label: "子单号", width: "25%" },
    { key: "description", label: "品名", width: "25%" },
    { key: "quantity", label: "件数", width: "15%" },
    { key: "weight", label: "重量", width: "15%" },
    { key: "cartonNo", label: "箱号", width: "20%" },
  ],
  totals: ["totalQuantity"],
};

// ========== 23. 托盘标签 ==========
export const palletLabel: DocumentTemplate = {
  type: "pallet-label",
  sections: [
    { id: "header", title: "托盘信息", fields: [
      { key: "palletNo", label: "托盘号", labelEn: "Pallet No.", type: "text", required: true },
      { key: "orderNo", label: "关联订单", labelEn: "Order No.", type: "text" },
      { key: "destination", label: "目的地", labelEn: "Destination", type: "text" },
      { key: "totalLayers", label: "总层数", labelEn: "Total Layers", type: "number" },
    ]},
    { id: "cargo", title: "货物概要", fields: [
      { key: "totalCartonsOnPallet", label: "托盘上总箱数", labelEn: "Total Cartons", type: "number" },
      { key: "totalWeight", label: "总重量(KG)", labelEn: "Total Weight", type: "number" },
      { key: "palletDimensions", label: "托盘尺寸", labelEn: "Pallet Size", type: "text", placeholder: "如 120x100cm" },
    ]},
  ],
  lineItems: [
    { key: "layerNo", label: "层号", width: "15%" },
    { key: "cartonRange", label: "箱号范围", width: "25%" },
    { key: "description", label: "品名", width: "30%" },
    { key: "quantity", label: "件数", width: "15%" },
    { key: "cartonNo", label: "当前箱", width: "15%" },
  ],
  totals: ["totalQuantity"],
};

// ========== 24. 库位标签 ==========
export const locationLabel: DocumentTemplate = {
  type: "location-label",
  sections: [
    { id: "header", title: "库位编码", fields: [
      { key: "zoneCode", label: "区域编码", labelEn: "Zone", type: "text", required: true, placeholder: "如 A / B / C" },
      { key: "aisleNo", label: "通道/货架号", labelEn: "Aisle", type: "text", required: true, placeholder: "如 01" },
      { key: "shelfLevel", label: "层号", labelEn: "Level", type: "text", placeholder: "如 1F / 2F / 3F" },
      { key: "slotNo", label: "仓位号", labelEn: "Slot", type: "text", placeholder: "如 01" },
    ]},
    { id: "details", title: "备注", fields: [
      { key: "capacity", label: "容量", labelEn: "Capacity", type: "text", placeholder: "如 最大50箱" },
      { key: "notes", label: "备注", labelEn: "Notes", type: "textarea", colspan: 2 },
    ]},
  ],
  lineItems: [],
  totals: [],
};

// ========== 25. 提示标签 ==========
export const reminderLabel: DocumentTemplate = {
  type: "reminder-label",
  sections: [
    { id: "header", title: "提示内容", fields: [
      { key: "reminderType", label: "提示类型", labelEn: "Type", type: "select", options: ["⚠️ 易碎 Fragile", "🌧️ 防潮 Keep Dry", "⬆️ 向上 This Way Up", "❄️ 冷藏 Keep Cool", "📦 堆码限制 Stack Limit", "⛔ 禁止翻滚 Do Not Roll", "🔞 危险品 Hazardous", "📋 其他"] },
      { key: "customMessage", label: "自定义提示", labelEn: "Custom Message", type: "textarea", placeholder: "输入自定义提示文字", colspan: 2 },
      { key: "language", label: "语言", labelEn: "Language", type: "select", options: ["中英双语", "仅中文", "仅英文"] },
    ]},
  ],
  lineItems: [],
  totals: [],
};

// ========== 单据模板注册表 ==========
export const documentTemplates: Record<string, DocumentTemplate> = {
  "proforma-invoice": proformaInvoice,
  "commercial-invoice": commercialInvoice,
  "packing-list": packingList,
  "sales-contract": salesContract,
  "booking-instruction": bookingInstruction,
  "customs-declaration-authorization": customsDeclarationAuth,
  "delivery-note": deliveryNote,
  "freight-statement": freightStatement,
  "consolidation-inbound-receipt": consolidationInbound,
  "consolidation-packing-list": consolidationPackingList,
  "express-declaration": expressDeclaration,
  "quotation": quotation,
  "shipping-instruction": shippingInstruction,
  "trucking-dispatch-order": truckingDispatchOrder,
  "shipping-mark": shippingMark,
  "container-loading-list": containerLoadingList,
  "return-packing-list": returnPackingList,
  "inbound-label": inboundLabel,
  "consolidation-label": consolidationLabel,
  "pallet-label": palletLabel,
  "location-label": locationLabel,
  "reminder-label": reminderLabel,
  "certificate-of-origin-template": certificateOfOrigin,
  "fumigation-certificate-template": fumigationCertificate,
  "letter-of-credit-info-sheet": letterOfCreditInfo,
};

export function getTemplate(type: string): DocumentTemplate | undefined {
  return documentTemplates[type];
}
