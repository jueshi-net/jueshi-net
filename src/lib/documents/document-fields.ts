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
    { id: "terms", title: "备注条款", fields: [
      { key: "terms", label: "备注条款", labelEn: "Terms & Conditions", type: "textarea", placeholder: "如：30% deposit, 70% balance before shipment" },
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
};

export function getTemplate(type: string): DocumentTemplate | undefined {
  return documentTemplates[type];
}
