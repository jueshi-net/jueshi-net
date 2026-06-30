/**
 * Template Registry
 * 
 * 工具注册表 — 声明每个工具的路由、分类、渲染器类型、能力集
 * 
 * 统一底座的核心：所有工具在此注册，Runtime 据此注入能力
 * 
 * @module document-runtime/template-registry
 */

import type {
  ToolRegistration,
  ToolCategory,
  RendererType,
} from "./types";

// ============================================================
// Registry Storage
// ============================================================

const REGISTRY = new Map<string, ToolRegistration>();

// ============================================================
// Registration API
// ============================================================

export function registerTool(config: ToolRegistration): void {
  if (REGISTRY.has(config.key)) {
    console.warn(`[TemplateRegistry] Tool "${config.key}" already registered, overwriting.`);
  }
  REGISTRY.set(config.key, config);
}

export function getTool(key: string): ToolRegistration | undefined {
  return REGISTRY.get(key);
}

export function getToolOrThrow(key: string): ToolRegistration {
  const tool = REGISTRY.get(key);
  if (!tool) {
    throw new Error(`[TemplateRegistry] Tool "${key}" not found in registry.`);
  }
  return tool;
}

export function getAllTools(): ToolRegistration[] {
  return Array.from(REGISTRY.values());
}

export function getOnlineTools(): ToolRegistration[] {
  return getAllTools().filter((t) => t.isOnline);
}

export function getToolsByCategory(category: ToolCategory): ToolRegistration[] {
  return getAllTools().filter((t) => t.category === category);
}

export function getToolsByRendererType(type: RendererType): ToolRegistration[] {
  return getAllTools().filter((t) => t.rendererType === type);
}

export function getCustomizableTools(): ToolRegistration[] {
  return getAllTools().filter(
    (t) => t.customizationLevel === "enterprise" || t.customizationLevel === "user"
  );
}

export function hasTool(key: string): boolean {
  return REGISTRY.has(key);
}

export function getToolCount(): number {
  return REGISTRY.size;
}

export function hasCapability(key: string, capability: string): boolean {
  const tool = REGISTRY.get(key);
  if (!tool) return false;
  const caps = tool.capabilities;
  switch (capability) {
    case "company": return caps.company;
    case "product": return caps.product;
    case "draft": return caps.draft;
    case "export": return caps.export.length > 0;
    case "chain": return caps.chain;
    case "entitlement": return caps.entitlement;
    case "audit": return Boolean(caps.audit);
    case "bbs": return caps.bbs;
    case "content": return caps.content;
    default: return false;
  }
}

export function isCustomizable(key: string): boolean {
  const tool = REGISTRY.get(key);
  if (!tool) return false;
  return tool.customizationLevel === "enterprise" || tool.customizationLevel === "user";
}

// ============================================================
// 8 个 MVP 工具注册
// ============================================================

// 1. 标准报价单 — 统一动态路由
registerTool({
  key: "standard-quotation",
  route: "/tools/documents/quotation",
  titleZh: "通用报价单",
  titleEn: "Standard Quotation",
  description: "向客户发送的产品/服务/物流项目报价文件",
  category: "trade",
  rendererType: "standard-document",
  capabilities: {
    company: true,
    product: true,
    draft: true,
    export: ["pdf", "word"],
    chain: true,
    entitlement: true,
    audit: "P1",
    bbs: true,
    content: true,
  },
  customizationLevel: "locked",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "📝",
});

// 2. 商业发票 — 统一动态路由
registerTool({
  key: "commercial-invoice",
  route: "/tools/documents/commercial-invoice",
  titleZh: "商业发票",
  titleEn: "Commercial Invoice",
  description: "实际交易完成后出具的正式发票，是报关、结汇的核心单据",
  category: "trade",
  rendererType: "standard-document",
  capabilities: {
    company: true,
    product: true,
    draft: true,
    export: ["pdf", "word"],
    chain: true,
    entitlement: true,
    audit: "P1",
    bbs: true,
    content: true,
  },
  customizationLevel: "locked",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "🧾",
});

// 3. 供应链报价单 — 个性化自定义表单（独立 UI，接入统一能力）
registerTool({
  key: "supply-chain-quote",
  route: "/tools/documents/quotation",
  titleZh: "供应链报价单",
  titleEn: "Supply Chain Quotation",
  description: "供应链多步骤报价表单，含商品行内编辑、链路导航",
  category: "trade",
  rendererType: "custom-form",
  capabilities: {
    company: true,
    product: true,
    draft: true,
    export: ["pdf", "word"],
    chain: true,
    entitlement: true,
    audit: "P1",
    bbs: true,
    content: true,
  },
  customizationLevel: "enterprise",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "📋",
});

// 4. 入库单 — 个性化自定义表单
registerTool({
  key: "inbound-receipt",
  route: "/tools/inbound-receipt",
  titleZh: "入库单",
  titleEn: "Inbound Receipt",
  description: "集运仓库收到客户包裹时的入库记录单据",
  category: "logistics",
  rendererType: "custom-form",
  capabilities: {
    company: true,
    product: false,
    draft: true,
    export: ["pdf"],
    chain: false,
    entitlement: true,
    audit: "P1",
    bbs: false,
    content: false,
  },
  customizationLevel: "enterprise",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "📥",
});

// 5. 交接单 — 个性化自定义表单
registerTool({
  key: "handover-note",
  route: "/tools/handover-note",
  titleZh: "交接单",
  titleEn: "Handover Note",
  description: "货物交接单据，含交接方/接收方/签收",
  category: "logistics",
  rendererType: "custom-form",
  capabilities: {
    company: true,
    product: false,
    draft: true,
    export: ["pdf"],
    chain: false,
    entitlement: true,
    audit: "P1",
    bbs: false,
    content: false,
  },
  customizationLevel: "enterprise",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "🤝",
});

// 6. 标签打印 — 热敏纸标签打印
registerTool({
  key: "shipping-label",
  route: "/tools/shipping-label",
  titleZh: "标签打印",
  titleEn: "Shipping Label",
  description: "在线生成唛头/物流标签，支持纸张尺寸、打印数量、分页打印",
  category: "label",
  rendererType: "label-print",
  capabilities: {
    company: true,
    product: false,
    draft: true,
    export: ["pdf", "print"],
    chain: false,
    entitlement: true,
    audit: "P1",
    bbs: false,
    content: false,
  },
  customizationLevel: "enterprise",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "🏷️",
});

// 7. Debit Note — 借记通知
registerTool({
  key: "debit-note",
  route: "/tools/debit-note",
  titleZh: "Debit Note",
  titleEn: "Debit Note",
  description: "借记通知单，用于向客户收取额外费用或调整账目",
  category: "finance",
  rendererType: "custom-form",
  capabilities: {
    company: true,
    product: false,
    draft: true,
    export: ["pdf"],
    chain: false,
    entitlement: true,
    audit: "P1",
    bbs: false,
    content: false,
  },
  customizationLevel: "enterprise",
  auditLevel: "P1",
  version: "1.0.0",
  isOnline: true,
  icon: "💳",
});

// 8. 拍单脚本/SOP — 脚本生成器
registerTool({
  key: "shooting-script",
  route: "/tools/video-script-sop",
  titleZh: "短视频 SOP 脚本",
  titleEn: "Shooting Script / SOP",
  description: "AI 驱动的短视频引流 SOP 生成器",
  category: "script",
  rendererType: "script-generator",
  capabilities: {
    company: false,
    product: false,
    draft: true,
    export: [],
    chain: false,
    entitlement: true,
    audit: "P2",
    bbs: false,
    content: false,
  },
  customizationLevel: "user",
  auditLevel: "P2",
  version: "1.0.0",
  isOnline: true,
  icon: "🎬",
});

// ============================================================
// 导出汇总
// ============================================================

export const REGISTERED_TOOL_COUNT = getToolCount();
export const REGISTERED_TOOL_KEYS = Array.from(REGISTRY.keys());
