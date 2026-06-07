// 唛头/标签类型元数据
export interface LabelTypeMeta {
  type: string;
  titleZh: string;
  titleEn: string;
  description: string;
  icon: string;
  category: string;
}

export const labelTypes: LabelTypeMeta[] = [
  { type: "shipping-mark", titleZh: "通用外箱唛头", titleEn: "Shipping Mark", description: "外贸纸箱外箱贴纸，含主唛、侧唛、目的港、箱号", icon: "📦", category: "trade" },
  { type: "consolidation-inbound-label", titleZh: "集运入库标签", titleEn: "Inbound Label", description: "客户发货到仓库时贴包裹，含集运账号、快递单号", icon: "📥", category: "consolidation" },
  { type: "consolidation-combined-label", titleZh: "集运合箱标签", titleEn: "Combined Label", description: "合箱后外箱标签，含合箱编号、原包裹数", icon: "📫", category: "consolidation" },
  { type: "warehouse-location-label", titleZh: "仓库库位标签", titleEn: "Warehouse Location", description: "货架/库位/区域标签，支持二维码", icon: "🏪", category: "warehouse" },
  { type: "parcel-info-label", titleZh: "国际包裹信息面单", titleEn: "Parcel Info Label", description: "寄件/收件信息贴纸（非官方运单）", icon: "📮", category: "parcel" },
  { type: "fba-carton-info-label", titleZh: "FBA 外箱信息贴", titleEn: "FBA Carton Info", description: "FBA/海外仓装箱信息参考贴（非 Amazon 官方标签）", icon: "🏗️", category: "warehouse" },
  { type: "pallet-label", titleZh: "托盘标签", titleEn: "Pallet Label", description: "Pallet/托盘货标签", icon: "🏭", category: "warehouse" },
  { type: "handling-label", titleZh: "提示标签", titleEn: "Handling Label", description: "FRAGILE / THIS SIDE UP / KEEP DRY 等通用警示标签", icon: "⚠️", category: "handling" },
];

// 标签尺寸
export interface LabelSize {
  id: string;
  label: string;
  width: number; // mm
  height: number; // mm;
  perPage?: number; // A4 layout
  memberOnly?: boolean;
}

export const labelSizes: LabelSize[] = [
  { id: "a4-full", label: "A4 整页", width: 210, height: 297, perPage: 1 },
  { id: "a4-quad", label: "A4 四宫格", width: 95, height: 148, perPage: 4 },
  { id: "100x150", label: "100×150mm", width: 100, height: 150, perPage: 1 },
  { id: "100x100", label: "100×100mm", width: 100, height: 100, perPage: 4, memberOnly: true },
  { id: "80x60", label: "80×60mm", width: 80, height: 60, perPage: 6, memberOnly: true },
  { id: "50x30", label: "50×30mm", width: 50, height: 30, perPage: 12, memberOnly: true },
  { id: "custom", label: "自定义尺寸", width: 100, height: 100, memberOnly: true },
];

// 标签风格
export interface LabelStyle {
  id: string;
  name: string;
  primaryColor: string;
  borderColor: string;
  headingBgColor: string;
  textColor: string;
  fontSize: string;
  showBorder: boolean;
  labelDensity: "compact" | "normal" | "large";
  memberOnly?: boolean;
}

export const labelStyles: LabelStyle[] = [
  { id: "black-white", name: "黑白标准版", primaryColor: "#000", borderColor: "#000", headingBgColor: "transparent", textColor: "#000", fontSize: "12pt", showBorder: true, labelDensity: "normal" },
  { id: "blue-trade", name: "蓝色外贸版", primaryColor: "#2563eb", borderColor: "#93c5fd", headingBgColor: "#eff6ff", textColor: "#1e3a5f", fontSize: "12pt", showBorder: true, labelDensity: "normal", memberOnly: true },
  { id: "dark-gray", name: "深灰仓储版", primaryColor: "#374151", borderColor: "#d1d5db", headingBgColor: "#f3f4f6", textColor: "#111", fontSize: "12pt", showBorder: true, labelDensity: "normal", memberOnly: true },
  { id: "yellow-warning", name: "黄色警示版", primaryColor: "#d97706", borderColor: "#fbbf24", headingBgColor: "#fef3c7", textColor: "#78350f", fontSize: "14pt", showBorder: true, labelDensity: "large", memberOnly: true },
  { id: "minimal", name: "极简无边框版", primaryColor: "#000", borderColor: "transparent", headingBgColor: "transparent", textColor: "#000", fontSize: "11pt", showBorder: false, labelDensity: "compact", memberOnly: true },
  { id: "large-bold", name: "大字醒目版", primaryColor: "#dc2626", borderColor: "#dc2626", headingBgColor: "#fee2e2", textColor: "#000", fontSize: "16pt", showBorder: true, labelDensity: "large", memberOnly: true },
];

// 标签模板字段配置
export interface LabelField {
  key: string;
  label: string;
  labelEn?: string;
  type: "text" | "textarea" | "number" | "select" | "barcode-source";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  colspan?: number;
}

export interface LabelTemplate {
  type: string;
  titleZh: string;
  titleEn: string;
  disclaimer?: string;
  fields: LabelField[];
  showQrCode: boolean;
  showBarcode: boolean;
}

export const labelTemplates: Record<string, LabelTemplate> = {
  // 1. 通用外箱唛头
  "shipping-mark": {
    type: "shipping-mark",
    titleZh: "通用外箱唛头",
    titleEn: "Shipping Mark",
    fields: [
      { key: "mainMark", label: "主唛 Main Mark", type: "textarea", required: true, placeholder: "公司简称/订单号", colspan: 2 },
      { key: "sideMark", label: "侧唛 Side Mark", type: "textarea", placeholder: "品名/规格/数量", colspan: 2 },
      { key: "destination", label: "目的港 Destination", type: "text", required: true },
      { key: "cartonNo", label: "箱号 Carton No.", type: "text", required: true, placeholder: "如 1/100" },
      { key: "grossWeight", label: "毛重 G.W.", type: "text" },
      { key: "netWeight", label: "净重 N.W.", type: "text" },
      { key: "measurement", label: "尺寸 Measurement", type: "text", placeholder: "如 60×40×50 CM" },
      { key: "origin", label: "原产地 Origin", type: "text", placeholder: "MADE IN CHINA" },
      { key: "remark", label: "备注", type: "textarea", colspan: 2 },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 2. 集运入库标签
  "consolidation-inbound-label": {
    type: "consolidation-inbound-label",
    titleZh: "集运入库标签",
    titleEn: "Inbound Label",
    fields: [
      { key: "customerAccount", label: "集运账号", type: "text", required: true },
      { key: "customerNickname", label: "客户昵称", type: "text" },
      { key: "warehouse", label: "入库仓库", type: "text" },
      { key: "trackingNo", label: "快递单号", type: "text", required: true },
      { key: "packageCount", label: "包裹数量", type: "number" },
      { key: "itemType", label: "物品类型", type: "select", options: ["普货", "敏感货", "食品", "液体", "电池", "其他"] },
      { key: "arrivalDate", label: "到仓日期", type: "text" },
      { key: "remark", label: "备注", type: "textarea", colspan: 2 },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 3. 集运合箱标签
  "consolidation-combined-label": {
    type: "consolidation-combined-label",
    titleZh: "集运合箱标签",
    titleEn: "Combined Label",
    fields: [
      { key: "customerId", label: "客户 ID", type: "text", required: true },
      { key: "combinedNo", label: "合箱编号", type: "text", required: true },
      { key: "originalPackages", label: "原包裹数量", type: "number" },
      { key: "combinedBoxNo", label: "合箱后箱号", type: "text" },
      { key: "totalWeight", label: "总重量", type: "text" },
      { key: "totalVolume", label: "总体积", type: "text" },
      { key: "destCountry", label: "目的国家", type: "text" },
      { key: "destCity", label: "目的城市", type: "text" },
      { key: "handlingNote", label: "禁运提醒", type: "textarea", placeholder: "确认不含禁运物品", colspan: 2 },
      { key: "operator", label: "操作员", type: "text" },
      { key: "date", label: "日期", type: "text" },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 4. 仓库库位标签
  "warehouse-location-label": {
    type: "warehouse-location-label",
    titleZh: "仓库库位标签",
    titleEn: "Warehouse Location",
    fields: [
      { key: "warehouseCode", label: "仓库代码", type: "text", required: true },
      { key: "zone", label: "区域 Zone", type: "text" },
      { key: "rackNo", label: "货架号", type: "text" },
      { key: "level", label: "层号", type: "text" },
      { key: "locationNo", label: "库位编号", type: "text", required: true },
      { key: "labelDesc", label: "标签说明", type: "textarea", colspan: 2 },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 5. 国际包裹信息面单
  "parcel-info-label": {
    type: "parcel-info-label",
    titleZh: "国际包裹信息面单",
    titleEn: "Parcel Info Label",
    disclaimer: "这不是官方快递运单，仅用于信息整理或贴箱参考。正式快递单请以承运商系统为准。",
    fields: [
      { key: "senderName", label: "寄件人 Sender", type: "textarea", required: true, colspan: 2 },
      { key: "senderPhone", label: "寄件电话", type: "text" },
      { key: "receiverName", label: "收件人 Receiver", type: "textarea", required: true, colspan: 2 },
      { key: "receiverPhone", label: "收件电话", type: "text" },
      { key: "receiverAddress", label: "地址 Address", type: "textarea", colspan: 2 },
      { key: "country", label: "国家 Country", type: "text" },
      { key: "postalCode", label: "邮编", type: "text" },
      { key: "refNo", label: "参考单号", type: "text" },
      { key: "itemDesc", label: "物品描述", type: "textarea", colspan: 2 },
      { key: "quantity", label: "数量", type: "number" },
      { key: "declaredValue", label: "申报价值", type: "text" },
      { key: "remark", label: "备注", type: "textarea", colspan: 2 },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 6. FBA 外箱信息贴
  "fba-carton-info-label": {
    type: "fba-carton-info-label",
    titleZh: "FBA 外箱信息贴",
    titleEn: "FBA Carton Info",
    disclaimer: "不生成 Amazon 官方 FBA 标签，仅供装箱信息整理参考。正式 FBA 标签请在 Seller Central 生成。",
    fields: [
      { key: "shipmentId", label: "Shipment ID", type: "text", required: true },
      { key: "boxNo", label: "Box No.", type: "text", required: true, placeholder: "如 1 of 10" },
      { key: "sku", label: "SKU / 产品名", type: "text" },
      { key: "quantity", label: "Quantity", type: "number" },
      { key: "grossWeight", label: "Gross Weight", type: "text" },
      { key: "cartonSize", label: "Carton Size", type: "text", placeholder: "如 60×40×50 CM" },
      { key: "destWarehouse", label: "目的仓库", type: "text" },
      { key: "remark", label: "备注", type: "textarea", colspan: 2 },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 7. 托盘标签
  "pallet-label": {
    type: "pallet-label",
    titleZh: "托盘标签",
    titleEn: "Pallet Label",
    fields: [
      { key: "palletNo", label: "Pallet No.", type: "text", required: true },
      { key: "totalPallets", label: "Total Pallets", type: "number" },
      { key: "cartonsOnPallet", label: "Cartons on Pallet", type: "number" },
      { key: "grossWeight", label: "Gross Weight", type: "text" },
      { key: "destination", label: "Destination", type: "text" },
      { key: "consignee", label: "Consignee", type: "textarea", colspan: 2 },
      { key: "remark", label: "Remark", type: "textarea", colspan: 2 },
      { key: "handlingInstruction", label: "Handling Instruction", type: "select", options: ["None", "FRAGILE", "THIS SIDE UP", "KEEP DRY", "DO NOT STACK"] },
    ],
    showQrCode: true,
    showBarcode: true,
  },
  // 8. 提示标签
  "handling-label": {
    type: "handling-label",
    titleZh: "提示标签",
    titleEn: "Handling Label",
    fields: [
      { key: "labelType", label: "标签类型", type: "select", required: true, options: ["易碎 FRAGILE", "向上 THIS SIDE UP", "防潮 KEEP DRY", "小心轻放 HANDLE WITH CARE", "重货 HEAVY", "勿压 DO NOT CRUSH", "堆叠限制 STACKING LIMIT", "温度敏感 TEMPERATURE SENSITIVE"] },
      { key: "iconStyle", label: "图标样式", type: "select", options: ["⚠️ 三角形警告", "🔴 红色圆圈", "🟡 黄色菱形", "🔵 蓝色方形"] },
      { key: "chineseText", label: "中文提示", type: "textarea", colspan: 2 },
      { key: "englishText", label: "英文提示", type: "textarea", colspan: 2 },
      { key: "remark", label: "备注", type: "textarea", colspan: 2 },
    ],
    showQrCode: false,
    showBarcode: false,
  },
};

export function getLabelType(type: string): LabelTypeMeta | undefined {
  return labelTypes.find(l => l.type === type);
}

export function getLabelTemplate(type: string): LabelTemplate | undefined {
  return labelTemplates[type];
}
