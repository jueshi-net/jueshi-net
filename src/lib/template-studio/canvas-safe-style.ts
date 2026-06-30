/**
 * Canvas Safe Style Utilities
 * 
 * Provides safe style token validation and conversion.
 * Ensures all styles come from whitelist, preventing XSS.
 * 
 * @module template-studio/canvas-safe-style
 */

import type { CanvasElementStyle } from "./canvas-schema";

// ============================================================
// Safe Style Tokens
// ============================================================

/** Allowed font families */
export const ALLOWED_FONT_FAMILIES = [
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Georgia, serif",
] as const;

/** Allowed font weights */
export const ALLOWED_FONT_WEIGHTS = ["normal", "bold"] as const;

/** Allowed text alignments */
export const ALLOWED_TEXT_ALIGNS = ["left", "center", "right"] as const;

/** Font size range (pt) */
export const FONT_SIZE_MIN = 6;
export const FONT_SIZE_MAX = 72;

/** Border width range (mm) */
export const BORDER_WIDTH_MIN = 0;
export const BORDER_WIDTH_MAX = 5;

/** Border radius range (mm) */
export const BORDER_RADIUS_MIN = 0;
export const BORDER_RADIUS_MAX = 20;

/** Padding range (mm) */
export const PADDING_MIN = 0;
export const PADDING_MAX = 50;

/** Opacity range */
export const OPACITY_MIN = 0;
export const OPACITY_MAX = 1;

// ============================================================
// Color Validation
// ============================================================

/** Validate hex color format */
export function isValidHexColor(color: string): boolean {
  // Allow "transparent"
  if (color === "transparent") return true;
  
  // Match hex color format: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
  const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{8})$/;
  return hexRegex.test(color);
}

/** Sanitize color value */
export function sanitizeColor(color: string, fallback: string = "#000000"): string {
  if (isValidHexColor(color)) {
    return color;
  }
  return fallback;
}

// ============================================================
// Style Validation
// ============================================================

/** Validate and sanitize canvas element style */
export function sanitizeCanvasStyle(style: Partial<CanvasElementStyle>): CanvasElementStyle {
  const fontSize = style.fontSize !== undefined ? style.fontSize : 12;
  const fontFamily = style.fontFamily !== undefined ? style.fontFamily : "Arial, sans-serif";
  const fontWeight = style.fontWeight !== undefined ? style.fontWeight : "normal";
  const color = style.color !== undefined ? style.color : "#000000";
  const textAlign = style.textAlign !== undefined ? style.textAlign : "left";
  const backgroundColor = style.backgroundColor !== undefined ? style.backgroundColor : "transparent";
  const borderColor = style.borderColor !== undefined ? style.borderColor : "transparent";
  const borderWidth = style.borderWidth !== undefined ? style.borderWidth : 0;
  const borderRadius = style.borderRadius !== undefined ? style.borderRadius : 0;
  const padding = style.padding !== undefined ? style.padding : 2;
  const opacity = style.opacity !== undefined ? style.opacity : 1;
  
  return {
    fontSize: clamp(fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX),
    fontFamily: ALLOWED_FONT_FAMILIES.includes(
      fontFamily as typeof ALLOWED_FONT_FAMILIES[number]
    )
      ? fontFamily
      : "Arial, sans-serif",
    fontWeight: ALLOWED_FONT_WEIGHTS.includes(
      fontWeight as typeof ALLOWED_FONT_WEIGHTS[number]
    )
      ? fontWeight
      : "normal",
    color: sanitizeColor(color),
    textAlign: ALLOWED_TEXT_ALIGNS.includes(
      textAlign as typeof ALLOWED_TEXT_ALIGNS[number]
    )
      ? textAlign
      : "left",
    backgroundColor: sanitizeColor(backgroundColor, "transparent"),
    borderColor: sanitizeColor(borderColor, "transparent"),
    borderWidth: clamp(borderWidth, BORDER_WIDTH_MIN, BORDER_WIDTH_MAX),
    borderRadius: clamp(borderRadius, BORDER_RADIUS_MIN, BORDER_RADIUS_MAX),
    padding: clamp(padding, PADDING_MIN, PADDING_MAX),
    opacity: clamp(opacity, OPACITY_MIN, OPACITY_MAX),
  };
}

// ============================================================
// CSS Generation
// ============================================================

/** Convert canvas style to CSS properties (for rendering) */
export function canvasStyleToCSS(style: CanvasElementStyle): React.CSSProperties {
  return {
    fontSize: `${style.fontSize}pt`,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.textAlign,
    backgroundColor: style.backgroundColor,
    border: style.borderWidth > 0 ? `${style.borderWidth}mm solid ${style.borderColor}` : "none",
    borderRadius: `${style.borderRadius}mm`,
    padding: `${style.padding}mm`,
    opacity: style.opacity,
  };
}

/** Convert canvas style to inline style string (for PNG export) */
export function canvasStyleToInline(style: CanvasElementStyle): string {
  const css = canvasStyleToCSS(style);
  return Object.entries(css)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join("; ");
}

// ============================================================
// Utility Functions
// ============================================================

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================
// Security Checks
// ============================================================

/** Check if text contains potential XSS */
export function containsXSS(text: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onload, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(text));
}

/** Sanitize text content (escape HTML entities) */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Validate binding path */
export function isValidBindingPath(path: string): boolean {
  // Only allow specific binding paths
  const allowedPrefixes = [
    "company.",
    "customer.",
    "document.",
    "product.",
    "total.",
    "seal.",
  ];
  
  return allowedPrefixes.some(prefix => path.startsWith(prefix));
}
