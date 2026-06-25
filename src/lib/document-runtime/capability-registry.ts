/**
 * Capability Registry
 * 
 * 能力注册表 — 定义所有可用的公共能力及其元数据
 * 工具通过 ToolRegistration.capabilities 声明需要哪些能力
 * Runtime 根据声明注入对应的 Adapter
 * 
 * @module document-runtime/capability-registry
 */

import type { CapabilityName, CapabilityMeta } from "./types";

// ============================================================
// 能力元数据注册表
// ============================================================

export const CAPABILITY_REGISTRY: Record<CapabilityName, CapabilityMeta> = {
  company: {
    name: "Company Profile",
    description: "公司资料选择、多公司切换、自动填充表单字段",
    requiredProps: ["profiles", "selectedProfile", "onSelect"],
  },
  product: {
    name: "Product Catalog",
    description: "商品库选择、HS Code/重量/体积/单价自动填充明细行",
    requiredProps: ["products", "onSelect", "search"],
  },
  draft: {
    name: "Draft Save/Restore",
    description: "草稿保存、恢复、历史记录、复制、删除",
    requiredProps: ["toolKey", "save", "load", "list", "duplicate", "delete"],
  },
  export: {
    name: "Export",
    description: "PDF/Word/Excel/Print 导出，受会员权益控制",
    requiredProps: ["formats", "exportFn", "entitlementCheck"],
  },
  chain: {
    name: "Document Chain",
    description: "单据链路：报价单→形式发票→商业发票→装箱单→装柜明细",
    requiredProps: ["chainType", "generateNext", "navigateTo"],
  },
  entitlement: {
    name: "Membership Entitlement",
    description: "会员等级门禁、权益检查、升级提示",
    requiredProps: ["tier", "checkAccess", "upgradePrompt"],
  },
  audit: {
    name: "Audit Trail",
    description: "操作审计日志：导出、保存、错误等行为记录",
    requiredProps: ["logAction", "logExport", "logError"],
  },
  bbs: {
    name: "BBS Linkage",
    description: "社区讨论联动：相关讨论展示、发起讨论入口",
    requiredProps: ["relatedTool", "postUrl"],
  },
  content: {
    name: "Tool Content",
    description: "使用指南、FAQ、常见错误、示例数据",
    requiredProps: ["guide", "faq", "errors", "examples"],
  },
};

// ============================================================
// 查询函数
// ============================================================

export function getCapability(name: CapabilityName): CapabilityMeta | undefined {
  return CAPABILITY_REGISTRY[name];
}

export function getAllCapabilities(): CapabilityMeta[] {
  return Object.values(CAPABILITY_REGISTRY);
}

export function getCapabilityNames(): CapabilityName[] {
  return Object.keys(CAPABILITY_REGISTRY) as CapabilityName[];
}

// ============================================================
// 能力检查工具函数
// ============================================================

/**
 * 检查工具是否声明了某个能力
 */
export function hasCapability(
  capabilities: { company: boolean; product: boolean; draft: boolean; export: string[]; chain: boolean; entitlement: boolean; audit: string; bbs: boolean; content: boolean },
  name: CapabilityName
): boolean {
  switch (name) {
    case "company":
      return capabilities.company;
    case "product":
      return capabilities.product;
    case "draft":
      return capabilities.draft;
    case "export":
      return capabilities.export.length > 0;
    case "chain":
      return capabilities.chain;
    case "entitlement":
      return capabilities.entitlement;
    case "audit":
      return capabilities.audit !== undefined;
    case "bbs":
      return capabilities.bbs;
    case "content":
      return capabilities.content;
    default:
      return false;
  }
}

/**
 * 获取工具声明的所有能力名称列表
 */
export function getDeclaredCapabilities(
  capabilities: { company: boolean; product: boolean; draft: boolean; export: string[]; chain: boolean; entitlement: boolean; audit: string; bbs: boolean; content: boolean }
): CapabilityName[] {
  return getCapabilityNames().filter(name => hasCapability(capabilities, name));
}

/**
 * 比较两个工具的能力差异
 */
export function compareCapabilities(
  capA: { company: boolean; product: boolean; draft: boolean; export: string[]; chain: boolean; entitlement: boolean; audit: string; bbs: boolean; content: boolean },
  capB: { company: boolean; product: boolean; draft: boolean; export: string[]; chain: boolean; entitlement: boolean; audit: string; bbs: boolean; content: boolean }
): { added: CapabilityName[]; removed: CapabilityName[]; shared: CapabilityName[] } {
  const namesA = new Set(getDeclaredCapabilities(capA));
  const namesB = new Set(getDeclaredCapabilities(capB));
  
  return {
    added: [...namesB].filter(n => !namesA.has(n)),
    removed: [...namesA].filter(n => !namesB.has(n)),
    shared: [...namesA].filter(n => namesB.has(n)),
  };
}
