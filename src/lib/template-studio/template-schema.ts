/**
 * Template Studio — Template Schema
 *
 * Defines the configuration schema for custom document templates.
 * A template config controls: field visibility/labels, table columns,
 * visual style (primary color, font, logo position), and data bindings.
 *
 * @module template-studio/template-schema
 */

// ============================================================
// Field Configuration
// ============================================================

/** A single form/document field that can be toggled and relabeled */
export interface TemplateFieldConfig {
  /** Unique key, e.g. "documentNumber", "issueDate" */
  key: string;
  /** Display label (user-editable) */
  label: string;
  /** Whether this field is visible in the rendered document */
  visible: boolean;
  /** Optional width hint, e.g. "200px", "auto" */
  width?: string;
}

/** A table column in the product/items table */
export interface TemplateColumnConfig {
  /** Column key, e.g. "name", "hsCode", "quantity", "unitPrice", "totalPrice" */
  key: string;
  /** Column header label (user-editable) */
  label: string;
  /** Whether this column is visible */
  visible: boolean;
  /** Optional width, e.g. "120px", "auto" */
  width?: string;
}

// ============================================================
// Style Configuration
// ============================================================

export interface TemplateStyleConfig {
  /** Primary brand color, hex format e.g. "#1a56db" */
  primaryColor: string;
  /** Font family CSS string */
  fontFamily: string;
  /** Base font size, e.g. "14px" */
  fontSize: string;
  /** Title font size, e.g. "22px" */
  titleFontSize: string;
  /** Page margin in px, e.g. "32px" */
  pageMargin: string;
  /** Where to place the company logo */
  logoPosition: "left" | "right" | "center" | "none";
  /** Show signature placeholder area */
  showSignature: boolean;
  /** Show stamp/seal placeholder area */
  showStamp: boolean;
  /** Table header background color */
  tableHeaderBg: string;
  /** Table header text color */
  tableHeaderColor: string;
}

// ============================================================
// Layout Configuration
// ============================================================

export interface TemplateLayoutConfig {
  showHeader: boolean;
  showCompanyInfo: boolean;
  showProductTable: boolean;
  showAmountSummary: boolean;
  showRemarks: boolean;
  showTerms: boolean;
  showFooter: boolean;
}

// ============================================================
// Data Binding Configuration
// ============================================================

export interface TemplateDataBinding {
  /** Bind current selected company profile */
  company: boolean;
  /** Bind product/item details into table */
  products: boolean;
  /** Bind document number (auto-generated or manual) */
  documentNumber: boolean;
  /** Bind issue date */
  date: boolean;
  /** Bind amount subtotal/tax/total */
  amountSummary: boolean;
  /** Bind remarks field */
  remarks: boolean;
  /** Bind terms & conditions */
  terms: boolean;
  /** Bind company logo */
  logo: boolean;
  /** Bind signature placeholder */
  signature: boolean;
  /** Bind stamp/seal placeholder */
  stamp: boolean;
  /** Bind customer/consignee info */
  customer: boolean;
}

/** A custom content block that users can add/reorder/remove */
export interface ContentBlock {
  /** Unique block ID */
  id: string;
  /** Block type */
  type: "text" | "spacer" | "divider";
  /** Block title/label for editor display */
  title: string;
  /** Text content (for type="text") */
  content: string;
  /** Sort order (0-based) */
  order: number;
  /** Whether this block is visible */
  visible: boolean;
}

// ============================================================
// Complete Template Config
// ============================================================

export interface TemplateConfig {
  /** Unique template ID */
  id: string;
  /** Which tool this template belongs to, e.g. "supply-chain-quote" */
  toolKey: string;
  /** Template display name */
  name: string;
  /** Origin: official preset or user-created */
  origin: "official" | "user";
  /** Owner user ID (empty for official) */
  ownerId: string;
  /** Field configurations */
  fields: TemplateFieldConfig[];
  /** Table column configurations */
  columns: TemplateColumnConfig[];
  /** Custom content blocks */
  contentBlocks: ContentBlock[];
  /** Visual style */
  style: TemplateStyleConfig;
  /** Layout toggles */
  layout: TemplateLayoutConfig;
  /** Data binding toggles */
  bindings: TemplateDataBinding;
  /** Creation timestamp ISO */
  createdAt: string;
  /** Last modified timestamp ISO */
  updatedAt: string;
}

// ============================================================
// Validation
// ============================================================

/** Validate a hex color string */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

/** Validate a font size string */
export function isValidFontSize(size: string): boolean {
  return /^\d+px$/.test(size);
}

/** Validate a template config object */
export function validateTemplateConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Config is not an object"] };
  }

  const c = config as Partial<TemplateConfig>;

  if (!c.id || typeof c.id !== "string") errors.push("Missing or invalid id");
  if (!c.toolKey || typeof c.toolKey !== "string") errors.push("Missing or invalid toolKey");
  if (!c.name || typeof c.name !== "string") errors.push("Missing or invalid name");
  if (!Array.isArray(c.fields)) errors.push("fields must be an array");
  if (!Array.isArray(c.columns)) errors.push("columns must be an array");

  if (c.style) {
    if (!isValidHexColor(c.style.primaryColor)) errors.push("Invalid primaryColor");
    if (!isValidHexColor(c.style.tableHeaderBg)) errors.push("Invalid tableHeaderBg");
    if (!isValidHexColor(c.style.tableHeaderColor)) errors.push("Invalid tableHeaderColor");
    if (!["left", "right", "center", "none"].includes(c.style.logoPosition)) {
      errors.push("Invalid logoPosition");
    }
  } else {
    errors.push("Missing style config");
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// Data Types for Rendering
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

export interface ProductItem {
  id?: string;
  name: string;
  nameEn?: string;
  hsCode?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  weight?: number;
  volume?: number;
  currency?: string;
  origin?: string;
}

export interface DocumentData {
  number?: string;
  date?: string;
  dueDate?: string;
  type?: string;
  currency?: string;
}

// ============================================================
// Default Field/Column Sets per Tool Type
// ============================================================

/** Default fields for quotation/invoice-type documents */
export function defaultFields(): TemplateFieldConfig[] {
  return [
    { key: "documentNumber", label: "单据编号", visible: true },
    { key: "issueDate", label: "开单日期", visible: true },
    { key: "validUntil", label: "有效期至", visible: true },
    { key: "customerName", label: "客户名称", visible: true },
    { key: "customerAddress", label: "客户地址", visible: true },
    { key: "customerPhone", label: "客户电话", visible: false },
    { key: "paymentTerms", label: "付款条件", visible: true },
    { key: "deliveryTerms", label: "交货条件", visible: false },
    { key: "currency", label: "币种", visible: true },
    { key: "remarks", label: "备注", visible: true },
    { key: "terms", label: "条款与条件", visible: true },
  ];
}

/** Default product table columns */
export function defaultColumns(): TemplateColumnConfig[] {
  return [
    { key: "seq", label: "#", visible: true, width: "40px" },
    { key: "name", label: "商品名称", visible: true, width: "200px" },
    { key: "nameEn", label: "英文名称", visible: false, width: "150px" },
    { key: "hsCode", label: "HS编码", visible: true, width: "100px" },
    { key: "quantity", label: "数量", visible: true, width: "80px" },
    { key: "unit", label: "单位", visible: true, width: "60px" },
    { key: "unitPrice", label: "单价", visible: true, width: "100px" },
    { key: "totalPrice", label: "总价", visible: true, width: "120px" },
    { key: "weight", label: "重量(kg)", visible: false, width: "90px" },
    { key: "volume", label: "体积(m³)", visible: false, width: "90px" },
    { key: "origin", label: "原产地", visible: false, width: "80px" },
  ];
}

/** Default style */
export function defaultStyle(): TemplateStyleConfig {
  return {
    primaryColor: "#1a56db",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: "14px",
    titleFontSize: "22px",
    pageMargin: "32px",
    logoPosition: "left",
    showSignature: true,
    showStamp: true,
    tableHeaderBg: "#1a56db",
    tableHeaderColor: "#ffffff",
  };
}

/** Default layout */
export function defaultLayout(): TemplateLayoutConfig {
  return {
    showHeader: true,
    showCompanyInfo: true,
    showProductTable: true,
    showAmountSummary: true,
    showRemarks: true,
    showTerms: true,
    showFooter: true,
  };
}

/** Default bindings — all enabled */
export function defaultBindings(): TemplateDataBinding {
  return {
    company: true,
    products: true,
    documentNumber: true,
    date: true,
    amountSummary: true,
    remarks: true,
    terms: true,
    logo: true,
    signature: true,
    stamp: true,
    customer: true,
  };
}

/** Default content blocks — empty array, user adds their own */
export function defaultContentBlocks(): ContentBlock[] {
  return [];
}

/** Create a new template config with defaults */
export function createTemplateConfig(opts: {
  id: string;
  toolKey: string;
  name: string;
  origin?: "official" | "user";
  ownerId?: string;
}): TemplateConfig {
  const now = new Date().toISOString();
  return {
    id: opts.id,
    toolKey: opts.toolKey,
    name: opts.name,
    origin: opts.origin || "user",
    ownerId: opts.ownerId || "",
    fields: defaultFields(),
    columns: defaultColumns(),
    contentBlocks: defaultContentBlocks(),
    style: defaultStyle(),
    layout: defaultLayout(),
    bindings: defaultBindings(),
    createdAt: now,
    updatedAt: now,
  };
}
