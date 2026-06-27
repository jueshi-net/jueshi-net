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
  /** Show stamp/seal area */
  showStamp: boolean;
  /** Stamp mode: placeholder (screen only), none (hidden), generated (real stamp) */
  stampMode: "placeholder" | "none" | "generated";
  /** Table header background color */
  tableHeaderBg: string;
  /** Table header text color */
  tableHeaderColor: string;
  /** Border radius for cards/sections, e.g. "8px" */
  borderRadius: string;
  /** Table cell padding, e.g. "8px" */
  cellPadding: string;
  /** Seal top text override (default: company name) */
  sealTopText?: string;
  /** Seal bottom text (default: "专用章") */
  sealBottomText?: string;
  /** Seal center text (default: "★") */
  sealCenterText?: string;
  /** Seal color (default: #dc2626) */
  sealColor?: string;
  /** Company info block visual style */
  companyBlockStyle?: "none" | "subtle" | "card" | "bordered";
  /** Total/amount summary block visual style */
  totalBlockStyle?: "minimal" | "table" | "card";
  /** Product table visual style */
  tableStyle?: "clean" | "bordered" | "striped";
  /** Show dashed guide outlines in editor mode only (hidden in print/PNG) */
  guideOutline?: boolean;
  /** Style preset name */
  stylePreset?: string;
  /** Paper size: A4, 10x10 (label), 10x15 (label) */
  paperSize?: "A4" | "10x10" | "10x15";
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
  /** Selected company ID for data binding (persisted) */
  selectedCompanyId?: string;
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
  /** Company name (from API companyName field) */
  companyName?: string;
  /** Legacy name field (backward compat) */
  name?: string;
  /** Profile name (from API profileName field) */
  profileName?: string;
  /** English company name */
  companyNameEn?: string;
  /** Legacy English name field */
  nameEn?: string;
  /** Contact person name */
  contactName?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Website URL */
  website?: string;
  /** Full address */
  address?: string;
  /** City and postal code */
  cityPostal?: string;
  /** Tax ID */
  taxId?: string;
  /** CNY bank info */
  bankCnyInfo?: string;
  /** USD bank info */
  bankUsdInfo?: string;
  /** Default currency */
  defaultCurrency?: string;
  /** Logo as data URL */
  logoDataUrl?: string;
  /** Legacy logo field */
  logo?: string;
  /** Logo text (abbreviation) */
  logoText?: string;
  /** Is this the default company */
  isDefault?: boolean;
}

/**
 * Get a display name for a company profile, with fallback chain.
 * Never returns blank — always falls back to "未命名公司 #N".
 */
export function getCompanyDisplayName(company: CompanyProfile, index: number = 0): string {
  return (
    company.companyName ||
    company.name ||
    company.profileName ||
    company.contactName ||
    company.email ||
    `未命名公司 #${index + 1}`
  );
}

/**
 * Get company name for display in English if available.
 */
export function getCompanyDisplayNameEn(company: CompanyProfile): string | undefined {
  return company.companyNameEn || company.nameEn || undefined;
}

export interface ProductItem {
  id?: string;
  name: string;
  sku?: string;
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
    { key: "sku", label: "SKU", visible: false, width: "100px" },
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
    stampMode: "placeholder",
    tableHeaderBg: "#1a56db",
    tableHeaderColor: "#ffffff",
    borderRadius: "8px",
    cellPadding: "8px",
    companyBlockStyle: "subtle",
    totalBlockStyle: "minimal",
    tableStyle: "clean",
    guideOutline: true,
    stylePreset: "classic-blue",
    paperSize: "A4",
  };
}

// ============================================================
// Paper Sizes
// ============================================================

export interface PaperSizeConfig {
  name: string;
  label: string;
  width: number; // mm
  height: number; // mm
  aspectRatio: number; // width / height
}

export const PAPER_SIZES: PaperSizeConfig[] = [
  { name: "A4", label: "A4 (210×297mm)", width: 210, height: 297, aspectRatio: 210 / 297 },
  { name: "10x10", label: "10×10cm 标签", width: 100, height: 100, aspectRatio: 1 },
  { name: "10x15", label: "10×15cm 标签", width: 100, height: 150, aspectRatio: 100 / 150 },
];

export function getPaperSizeConfig(name: string): PaperSizeConfig {
  return PAPER_SIZES.find(p => p.name === name) || PAPER_SIZES[0];
}

// ============================================================
// Style Presets
// ============================================================

export interface StylePreset {
  name: string;
  label: string;
  style: Partial<TemplateStyleConfig>;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    name: "classic-blue",
    label: "经典蓝 (Classic Blue)",
    style: {
      primaryColor: "#1a56db",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      titleFontSize: "22px",
      pageMargin: "32px",
      tableHeaderBg: "#1a56db",
      tableHeaderColor: "#ffffff",
      borderRadius: "6px",
      cellPadding: "8px",
      companyBlockStyle: "subtle",
      totalBlockStyle: "minimal",
      tableStyle: "clean",
    },
  },
  {
    name: "minimal-black",
    label: "极简黑 (Minimal Black)",
    style: {
      primaryColor: "#1f2937",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "13px",
      titleFontSize: "20px",
      pageMargin: "40px",
      tableHeaderBg: "#1f2937",
      tableHeaderColor: "#ffffff",
      borderRadius: "2px",
      cellPadding: "6px",
      companyBlockStyle: "none",
      totalBlockStyle: "minimal",
      tableStyle: "clean",
    },
  },
  {
    name: "logistics-orange",
    label: "物流橙 (Logistics Orange)",
    style: {
      primaryColor: "#ea580c",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      titleFontSize: "22px",
      pageMargin: "32px",
      tableHeaderBg: "#ea580c",
      tableHeaderColor: "#ffffff",
      borderRadius: "6px",
      cellPadding: "8px",
      companyBlockStyle: "subtle",
      totalBlockStyle: "table",
      tableStyle: "bordered",
    },
  },
  {
    name: "finance-green",
    label: "财务绿 (Finance Green)",
    style: {
      primaryColor: "#059669",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      titleFontSize: "22px",
      pageMargin: "32px",
      tableHeaderBg: "#059669",
      tableHeaderColor: "#ffffff",
      borderRadius: "6px",
      cellPadding: "8px",
      companyBlockStyle: "subtle",
      totalBlockStyle: "table",
      tableStyle: "striped",
    },
  },
  {
    name: "premium-gray",
    label: "高级灰 (Premium Gray)",
    style: {
      primaryColor: "#475569",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "14px",
      titleFontSize: "22px",
      pageMargin: "36px",
      tableHeaderBg: "#475569",
      tableHeaderColor: "#ffffff",
      borderRadius: "4px",
      cellPadding: "8px",
      companyBlockStyle: "card",
      totalBlockStyle: "card",
      tableStyle: "bordered",
    },
  },
];

export function getPresetByName(name: string): StylePreset | undefined {
  return STYLE_PRESETS.find(p => p.name === name);
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
