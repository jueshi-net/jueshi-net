/**
 * Document Runtime Types
 * 
 * 核心类型定义：统一底座 + 自由模板架构的类型基础
 * 
 * @module document-runtime/types
 */

// ============================================================
// 工具分类与渲染器类型
// ============================================================

export type ToolCategory =
  | "trade"
  | "logistics"
  | "customs"
  | "consolidation"
  | "finance"
  | "label"
  | "script"
  | "utility";

export type RendererType =
  | "standard-document" // 统一动态路由单据
  | "custom-form"       // 个性化自定义表单
  | "label-print"       // 标签打印
  | "script-generator"; // 脚本/生成器

export type ExportType = "pdf" | "word" | "excel" | "print" | "image";

export type AuditLevel = "P0" | "P1" | "P2";

export type CustomizationLevel =
  | "locked"           // 不可定制（核心标准单据）
  | "official-only"    // 仅官方可定制
  | "enterprise"       // 企业可定制
  | "user";            // 用户可定制

// ============================================================
// 能力声明
// ============================================================

export interface CapabilitySet {
  /** 公司资料选择/填充 */
  company: boolean;
  /** 商品资料选择/填充 */
  product: boolean;
  /** 草稿保存/恢复 */
  draft: boolean;
  /** 导出能力 */
  export: ExportType[];
  /** 单据链路 */
  chain: boolean;
  /** 会员门禁 */
  entitlement: boolean;
  /** 审计日志 */
  audit: AuditLevel;
  /** BBS 社区联动 */
  bbs: boolean;
  /** 工具内容（指南/FAQ/错误/示例） */
  content: boolean;
}

// ============================================================
// 工具注册信息
// ============================================================

export interface ToolRegistration {
  /** 唯一标识 */
  key: string;
  /** 路由路径 */
  route: string;
  /** 中文名称 */
  titleZh: string;
  /** 英文名称 */
  titleEn: string;
  /** 描述 */
  description: string;
  /** 分类 */
  category: ToolCategory;
  /** 渲染器类型 */
  rendererType: RendererType;
  /** 能力声明 */
  capabilities: CapabilitySet;
  /** 定制级别 */
  customizationLevel: CustomizationLevel;
  /** 审计级别 */
  auditLevel: AuditLevel;
  /** 版本号 */
  version: string;
  /** 是否在线 */
  isOnline: boolean;
  /** 图标 emoji */
  icon?: string;
}

// ============================================================
// 运行时上下文与 Adapter 接口
// ============================================================

/** 公司资料适配器 */
export interface CompanyAdapter {
  profiles: CompanyProfile[];
  selectedProfile: CompanyProfile | null;
  loading: boolean;
  onSelect: (profile: CompanyProfile) => void;
  refresh: () => Promise<void>;
}

/** 商品资料适配器 */
export interface ProductAdapter {
  products: Product[];
  loading: boolean;
  onSelect: (product: Product) => void;
  search: (keyword: string) => Promise<Product[]>;
}

/** 草稿适配器 */
export interface DraftAdapter {
  draftId: string | null;
  saving: boolean;
  saved: boolean;
  saveMsg: string;
  loadingDraft: boolean;
  handleSave: () => Promise<void>;
  handleRestore: (json: string) => void;
  handleDuplicate: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

/** 导出适配器 */
export interface ExportAdapter {
  formats: ExportType[];
  handleExport: (type: ExportType, data: unknown) => Promise<void>;
  isEntitled: (type: ExportType) => boolean;
}

/** 会员权益适配器 */
export interface EntitlementAdapter {
  tier: "free" | "pro" | "enterprise";
  canAccess: boolean;
  reason: string | null;
  upgradeUrl: string;
}

/** 审计适配器 */
export interface AuditAdapter {
  logAction: (action: string, meta?: Record<string, unknown>) => void;
  logExport: (format: string, success: boolean) => void;
  logError: (error: string, context?: Record<string, unknown>) => void;
}

/** 单据链路适配器 */
export interface ChainAdapter {
  chainType: string;
  generateNext: (currentData: unknown) => Promise<void>;
  navigateTo: (targetTool: string, data: unknown) => void;
}

/** 运行时上下文 — 注入到工具中的能力集合 */
export interface RuntimeContext {
  toolKey: string;
  registration: ToolRegistration;
  company?: CompanyAdapter;
  product?: ProductAdapter;
  draft?: DraftAdapter;
  export?: ExportAdapter;
  entitlement?: EntitlementAdapter;
  audit?: AuditAdapter;
  chain?: ChainAdapter;
}

/** Runtime Hook 返回值 */
export interface UseRuntimeResult {
  ctx: RuntimeContext | null;
  ready: boolean;
  error: string | null;
}

// ============================================================
// 数据模型（复用现有类型）
// ============================================================

export interface CompanyProfile {
  id: string;
  name: string;
  nameEn?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logo?: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  hsCode?: string;
  unit?: string;
  weight?: number;
  volume?: number;
  unitPrice?: number;
  currency?: string;
  origin?: string;
}

// ============================================================
// Capability 名称类型
// ============================================================

export type CapabilityName =
  | "company"
  | "product"
  | "draft"
  | "export"
  | "chain"
  | "entitlement"
  | "audit"
  | "bbs"
  | "content";

export interface CapabilityMeta {
  name: string;
  description: string;
  requiredProps: string[];
}

// ============================================================
// 模板版本与审核
// ============================================================

export type TemplateStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "disabled";

export type TemplateOrigin = "official" | "enterprise" | "team" | "user";

export interface TemplateVersion {
  version: number;
  status: TemplateStatus;
  origin: TemplateOrigin;
  createdAt: string;
  reviewedBy?: string;
  reviewNote?: string;
  publishedAt?: string;
}

export interface CustomTemplate {
  id: string;
  toolKey: string;
  name: string;
  origin: TemplateOrigin;
  ownerId: string;
  currentVersion: TemplateVersion;
  versions: TemplateVersion[];
  config: TemplateConfig;
  isPublic: boolean;
  usageCount: number;
}

export interface TemplateConfig {
  /** 允许的 block 组件列表 */
  allowedBlocks: string[];
  /** 允许的 CSS tokens */
  allowedTokens: string[];
  /** 允许的变量绑定 */
  allowedVariables: string[];
  /** 布局 JSON（安全的 block 组合） */
  layout: unknown;
}
