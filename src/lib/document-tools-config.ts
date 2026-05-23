// 全局单据工具字典 — 公私域共享唯一数据源
// 公共引流页 /tools/documents 和私域后台 /dashboard/documents 都从这里读取
// 新增/删除工具只需修改此文件，两端自动同步

import {
  FileText, Tag, Package, FileBadge, ClipboardList,
  Shield, Truck, DollarSign, Mail, Boxes,
  Ship, ArrowDownUp, FileSpreadsheet, Container,
  MapPin, AlertTriangle, Award, Flame, CreditCard,
  LucideIcon,
} from "lucide-react";

export interface DocumentTool {
  /** 工具路由 key — 用于拼接 /tools/documents/{key} */
  key: string;
  /** 中文名称 */
  titleZh: string;
  /** 英文名称 */
  titleEn: string;
  /** 简短描述 */
  description: string;
  /** 分类 */
  category: "trade" | "logistics" | "customs" | "consolidation" | "finance" | "label";
  /** 是否在线可用 */
  isOnline: boolean;
}

/**
 * Lucide icon 映射 — 按 key 查找
 * 使用 emoji 作为后备
 */
const iconMap: Record<string, LucideIcon> = {
  "proforma-invoice": FileText,
  "commercial-invoice": FileText,
  "packing-list": Package,
  "sales-contract": FileBadge,
  "booking-instruction": Ship,
  "customs-declaration-authorization": Shield,
  "delivery-note": Truck,
  "freight-statement": DollarSign,
  "consolidation-inbound-receipt": ArrowDownUp,
  "consolidation-packing-list": Boxes,
  "express-declaration": Mail,
  "quotation": FileSpreadsheet,
  "shipping-instruction": ClipboardList,
  "trucking-dispatch-order": Truck,
  "shipping-mark": Tag,
  "container-loading-list": Container,
  "return-packing-list": ArrowDownUp,
  "certificate-of-origin-template": Award,
  "fumigation-certificate-template": Flame,
  "letter-of-credit-info-sheet": CreditCard,
  "label-maker": MapPin,
};

/** Emoji 图标映射（公共页展示用） */
const emojiMap: Record<string, string> = {
  "proforma-invoice": "📋",
  "commercial-invoice": "🧾",
  "packing-list": "📦",
  "sales-contract": "📄",
  "booking-instruction": "🚢",
  "customs-declaration-authorization": "🏛️",
  "delivery-note": "🚚",
  "freight-statement": "💰",
  "consolidation-inbound-receipt": "📥",
  "consolidation-packing-list": "📫",
  "express-declaration": "✈️",
  "quotation": "📝",
  "shipping-instruction": "📋",
  "trucking-dispatch-order": "🚛",
  "shipping-mark": "🏷️",
  "container-loading-list": "📦",
  "return-packing-list": "↩️",
  "certificate-of-origin-template": "🏅",
  "fumigation-certificate-template": "🪵",
  "letter-of-credit-info-sheet": "💳",
  "label-maker": "📌",
};

/**
 * 颜色映射 — 按分类
 */
const categoryColorMap: Record<string, { bg: string; icon: string; hover: string }> = {
  trade: { bg: "bg-teal-50", icon: "text-teal-600", hover: "hover:border-teal-300" },
  logistics: { bg: "bg-blue-50", icon: "text-blue-600", hover: "hover:border-blue-300" },
  customs: { bg: "bg-purple-50", icon: "text-purple-600", hover: "hover:border-purple-300" },
  consolidation: { bg: "bg-indigo-50", icon: "text-indigo-600", hover: "hover:border-indigo-300" },
  finance: { bg: "bg-orange-50", icon: "text-orange-600", hover: "hover:border-orange-300" },
  label: { bg: "bg-amber-50", icon: "text-amber-600", hover: "hover:border-amber-300" },
};

/**
 * 完整的单据工具列表（20 个文档工具 + 1 个标签工具 = 21 个）
 * 按分类排序
 */
export const documentTools: DocumentTool[] = [
  // ===== 贸易/报价 =====
  {
    key: "proforma-invoice",
    titleZh: "形式发票",
    titleEn: "Proforma Invoice",
    description: "交易前向买方出具的预开发票，用于报价和确认交易条件",
    category: "trade",
    isOnline: true,
  },
  {
    key: "commercial-invoice",
    titleZh: "商业发票",
    titleEn: "Commercial Invoice",
    description: "实际交易完成后出具的正式发票，是报关、结汇的核心单据",
    category: "trade",
    isOnline: true,
  },
  {
    key: "quotation",
    titleZh: "通用报价单",
    titleEn: "Quotation",
    description: "向客户发送的产品/服务/物流项目报价文件",
    category: "trade",
    isOnline: true,
  },
  {
    key: "sales-contract",
    titleZh: "外贸销售合同",
    titleEn: "Sales Contract",
    description: "买卖双方就商品、价格、交货、付款等条款达成的书面协议",
    category: "trade",
    isOnline: true,
  },

  // ===== 物流/运输 =====
  {
    key: "packing-list",
    titleZh: "装箱单",
    titleEn: "Packing List",
    description: "列明货物包装、数量、重量、体积等详细信息的单据",
    category: "logistics",
    isOnline: true,
  },
  {
    key: "booking-instruction",
    titleZh: "订舱委托书",
    titleEn: "Booking Instruction",
    description: "委托货代向船公司/航空公司预订舱位的书面文件",
    category: "logistics",
    isOnline: true,
  },
  {
    key: "shipping-instruction",
    titleZh: "提单补料",
    titleEn: "Shipping Instruction",
    description: "向船公司提交提单内容资料，确认提单信息",
    category: "logistics",
    isOnline: true,
  },
  {
    key: "delivery-note",
    titleZh: "送货单",
    titleEn: "Delivery Note",
    description: "记录送货货物明细的单据，用于仓库收货签收",
    category: "logistics",
    isOnline: true,
  },
  {
    key: "trucking-dispatch-order",
    titleZh: "拖车派车单",
    titleEn: "Trucking Dispatch Order",
    description: "安排拖车运输的派车单据，调度司机提柜送货",
    category: "logistics",
    isOnline: true,
  },
  {
    key: "shipping-mark",
    titleZh: "唛头通用模板",
    titleEn: "Shipping Mark",
    description: "货物外包装唛头标识，便于目的港分拣识别",
    category: "logistics",
    isOnline: true,
  },
  {
    key: "container-loading-list",
    titleZh: "装柜明细单",
    titleEn: "Container Loading List",
    description: "记录装柜货物详细信息，监装签收",
    category: "logistics",
    isOnline: true,
  },

  // ===== 报关/申报 =====
  {
    key: "customs-declaration-authorization",
    titleZh: "报关委托书",
    titleEn: "Customs Declaration Authorization",
    description: "委托报关行代为办理报关手续的授权文件",
    category: "customs",
    isOnline: true,
  },
  {
    key: "express-declaration",
    titleZh: "国际快递申报单",
    titleEn: "International Express Declaration",
    description: "国际快递寄件时填写的物品申报单据",
    category: "customs",
    isOnline: true,
  },
  {
    key: "certificate-of-origin-template",
    titleZh: "原产地证 CO 模板",
    titleEn: "Certificate of Origin Template",
    description: "原产地证资料整理模板（非官方证书）",
    category: "customs",
    isOnline: true,
  },
  {
    key: "fumigation-certificate-template",
    titleZh: "熏蒸证明模板",
    titleEn: "Fumigation Certificate Template",
    description: "熏蒸证明资料整理模板（非检疫证书）",
    category: "customs",
    isOnline: true,
  },

  // ===== 集运/仓管 =====
  {
    key: "consolidation-inbound-receipt",
    titleZh: "集运入库单",
    titleEn: "Consolidation Inbound Receipt",
    description: "集运仓库收到客户包裹时的入库记录单据",
    category: "consolidation",
    isOnline: true,
  },
  {
    key: "consolidation-packing-list",
    titleZh: "集运合箱打包清单",
    titleEn: "Consolidation Packing List",
    description: "将多个包裹合并装箱后的详细清单",
    category: "consolidation",
    isOnline: true,
  },
  {
    key: "return-packing-list",
    titleZh: "退货装箱清单",
    titleEn: "Return Packing List",
    description: "跨境电商退货、退运清关时的装箱明细",
    category: "consolidation",
    isOnline: true,
  },

  // ===== 财务/对账 =====
  {
    key: "freight-statement",
    titleZh: "运费对账单",
    titleEn: "Freight Statement",
    description: "与客户对账确认运费及各项杂费的明细清单",
    category: "finance",
    isOnline: true,
  },
  {
    key: "letter-of-credit-info-sheet",
    titleZh: "信用证简易资料单",
    titleEn: "Letter of Credit Info Sheet",
    description: "信用证关键信息整理单",
    category: "finance",
    isOnline: true,
  },

  // ===== 唛头/标签生成器 =====
  {
    key: "label-maker",
    titleZh: "唛头/标签生成器",
    titleEn: "Label Maker",
    description: "外箱唛头、仓库标签、集运入库贴、合箱标签等，支持批量打印",
    category: "label",
    isOnline: true,
  },
];

/** 在线工具数量 */
export const onlineToolCount = documentTools.filter(t => t.isOnline).length;

/**
 * 获取工具的路由 href
 * - label-maker → /tools/documents/shipping-label
 * - 其他 → /tools/documents/{key}
 */
export function getToolHref(tool: DocumentTool): string {
  if (tool.key === "label-maker") return "/tools/documents/shipping-label";
  return `/tools/documents/${tool.key}`;
}

/**
 * 获取工具的 Lucide Icon 组件
 */
export function getToolIcon(tool: DocumentTool): LucideIcon {
  return iconMap[tool.key] || FileText;
}

/**
 * 获取工具的 Emoji 图标
 */
export function getToolEmoji(tool: DocumentTool): string {
  return emojiMap[tool.key] || "📄";
}

/**
 * 获取工具的颜色样式
 */
export function getToolColor(tool: DocumentTool) {
  return categoryColorMap[tool.category] || categoryColorMap.trade;
}

/**
 * 按分类分组的工具列表
 */
export const categoryLabels: Record<string, string> = {
  trade: "贸易/报价",
  logistics: "物流/运输",
  customs: "报关/申报",
  consolidation: "集运/仓管",
  finance: "财务/对账",
  label: "唛头/标签",
};

export function getToolsByCategory() {
  const grouped: Record<string, DocumentTool[]> = {};
  for (const tool of documentTools) {
    if (!tool.isOnline) continue;
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }
  return grouped;
}
