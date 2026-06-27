/**
 * Canvas Template Schema — Free Layout MVP
 * 
 * Defines data structures for canvas-based template editing.
 * Coordinates use millimeters (mm) for precision across different paper sizes.
 * 
 * @module template-studio/canvas-schema
 */

// ============================================================
// Canvas Template
// ============================================================

export interface CanvasTemplate {
  /** Template mode: "structured" (existing) or "canvas" (new) */
  mode: "structured" | "canvas";
  /** Template name */
  name: string;
  /** Paper configuration */
  paper: CanvasPaperConfig;
  /** Canvas elements */
  elements: CanvasElement[];
  /** Grid settings */
  grid: CanvasGridConfig;
  /** Batch label configuration */
  batch?: CanvasBatchConfig;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

export interface CanvasPaperConfig {
  /** Paper preset */
  preset: "A4" | "10x10" | "10x15" | "custom";
  /** Width in mm */
  widthMm: number;
  /** Height in mm */
  heightMm: number;
  /** Orientation */
  orientation: "portrait" | "landscape";
}

export interface CanvasGridConfig {
  /** Show grid */
  show: boolean;
  /** Grid size in mm */
  sizeMm: number;
  /** Snap to grid */
  snap: boolean;
}

// ============================================================
// Batch Label Configuration
// ============================================================

export interface CanvasBatchConfig {
  /** Output mode: "single" (one page with qty) or "repeat" (N pages) */
  outputMode: "single" | "repeat";
  /** Total package count (件数) */
  packageCount: number;
  /** Show sequence number (1/N, 2/N, ...) */
  showSequence: boolean;
  /** Sequence format: "1/10" or "1 of 10" */
  sequenceFormat: "fraction" | "of";
}

// ============================================================
// Canvas Element
// ============================================================

export type CanvasElementType = 
  | "text" 
  | "field" 
  | "image" 
  | "logo" 
  | "seal" 
  | "table" 
  | "line" 
  | "rect" 
  | "qrcode" 
  | "barcode"
  | "sequence";

export interface CanvasElement {
  /** Unique element ID */
  id: string;
  /** Element type */
  type: CanvasElementType;
  /** X position in mm (from top-left) */
  x: number;
  /** Y position in mm (from top-left) */
  y: number;
  /** Width in mm */
  width: number;
  /** Height in mm */
  height: number;
  /** Rotation in degrees (0-360) */
  rotation: number;
  /** Z-index for layering */
  zIndex: number;
  /** Lock element position/size */
  locked: boolean;
  /** Show/hide element */
  visible: boolean;
  /** Data binding path (e.g., "company.name") */
  binding?: string;
  /** Static text content (for text elements) */
  text?: string;
  /** Element style */
  style: CanvasElementStyle;
}

export interface CanvasElementStyle {
  /** Font size in pt */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: "normal" | "bold";
  /** Text color (hex) */
  color?: string;
  /** Text alignment */
  textAlign?: "left" | "center" | "right";
  /** Background color (hex) */
  backgroundColor?: string;
  /** Border color (hex) */
  borderColor?: string;
  /** Border width in mm */
  borderWidth?: number;
  /** Border radius in mm */
  borderRadius?: number;
  /** Padding in mm */
  padding?: number;
  /** Opacity (0-1) */
  opacity?: number;
}

// ============================================================
// Data Binding Paths
// ============================================================

/** Allowed binding paths for canvas elements */
export const ALLOWED_BINDING_PATHS = [
  // Company fields
  "company.name",
  "company.nameEn",
  "company.contactName",
  "company.email",
  "company.phone",
  "company.address",
  "company.logo",
  
  // Customer fields
  "customer.name",
  "customer.contactName",
  "customer.email",
  "customer.phone",
  "customer.address",
  
  // Document fields
  "document.number",
  "document.date",
  "document.type",
  "document.currency",
  
  // Product fields (for table elements)
  "product.name",
  "product.nameEn",
  "product.sku",
  "product.quantity",
  "product.price",
  "product.total",
  
  // Total fields
  "total.subtotal",
  "total.tax",
  "total.amount",
  "total.discount",
  
  // Seal
  "seal.generated",
  
  // Batch/Package fields
  "batch.packageCount",
  "batch.sequence",
  "batch.currentIndex",
  "batch.totalCount",
] as const;

export type AllowedBindingPath = typeof ALLOWED_BINDING_PATHS[number];

/** Check if a binding path is allowed */
export function isAllowedBindingPath(path: string): path is AllowedBindingPath {
  return ALLOWED_BINDING_PATHS.includes(path as AllowedBindingPath);
}

// ============================================================
// Default Values
// ============================================================

export function defaultCanvasPaper(preset: CanvasPaperConfig["preset"] = "A4"): CanvasPaperConfig {
  const papers: Record<CanvasPaperConfig["preset"], { widthMm: number; heightMm: number }> = {
    "A4": { widthMm: 210, heightMm: 297 },
    "10x10": { widthMm: 100, heightMm: 100 },
    "10x15": { widthMm: 100, heightMm: 150 },
    "custom": { widthMm: 210, heightMm: 297 },
  };
  const paper = papers[preset];
  return {
    preset,
    widthMm: paper.widthMm,
    heightMm: paper.heightMm,
    orientation: paper.widthMm <= paper.heightMm ? "portrait" : "landscape",
  };
}

export function defaultCanvasGrid(): CanvasGridConfig {
  return {
    show: true,
    sizeMm: 5,
    snap: true,
  };
}

export function defaultCanvasBatch(): CanvasBatchConfig {
  return {
    outputMode: "single",
    packageCount: 1,
    showSequence: false,
    sequenceFormat: "fraction",
  };
}

export function defaultCanvasElementStyle(): CanvasElementStyle {
  return {
    fontSize: 12,
    fontFamily: "Arial, sans-serif",
    fontWeight: "normal",
    color: "#000000",
    textAlign: "left",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    padding: 2,
    opacity: 1,
  };
}

export function defaultCanvasElement(type: CanvasElementType): CanvasElement {
  const baseStyle = defaultCanvasElementStyle();
  
  switch (type) {
    case "text":
      return {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        x: 20,
        y: 20,
        width: 50,
        height: 10,
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        text: "文本内容",
        style: baseStyle,
      };
    
    case "field":
      return {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "field",
        x: 20,
        y: 20,
        width: 50,
        height: 10,
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        binding: "company.name",
        style: baseStyle,
      };
    
    case "table":
      return {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "table",
        x: 20,
        y: 50,
        width: 170,
        height: 100,
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        style: {
          ...baseStyle,
          fontSize: 10,
          borderColor: "#000000",
          borderWidth: 0.5,
        },
      };
    
    case "seal":
      return {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "seal",
        x: 150,
        y: 250,
        width: 30,
        height: 30,
        rotation: 0,
        zIndex: 10,
        locked: false,
        visible: true,
        style: baseStyle,
      };
    
    case "sequence":
      return {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "sequence",
        x: 20,
        y: 20,
        width: 40,
        height: 10,
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        style: { ...baseStyle, fontSize: 14, fontWeight: "bold" },
      };
    
    default:
      return {
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: 20,
        y: 20,
        width: 50,
        height: 20,
        rotation: 0,
        zIndex: 1,
        locked: false,
        visible: true,
        style: baseStyle,
      };
  }
}

export function defaultCanvasTemplate(): CanvasTemplate {
  return {
    mode: "canvas",
    name: "新建画布模板",
    paper: defaultCanvasPaper("A4"),
    elements: [],
    grid: defaultCanvasGrid(),
    batch: defaultCanvasBatch(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
