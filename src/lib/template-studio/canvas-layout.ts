/**
 * Canvas Layout Utilities
 * 
 * Handles coordinate conversions, scaling, and layout calculations
 * for canvas-based template editing.
 * 
 * @module template-studio/canvas-layout
 */

import type { CanvasPaperConfig, CanvasElement } from "./canvas-schema";

// ============================================================
// Coordinate Conversions
// ============================================================

/** Convert mm to pixels at 96 DPI */
export function mmToPx(mm: number, dpi: number = 96): number {
  return (mm / 25.4) * dpi;
}

/** Convert pixels to mm at 96 DPI */
export function pxToMm(px: number, dpi: number = 96): number {
  return (px / dpi) * 25.4;
}

/** Convert mm to points (1pt = 1/72 inch) */
export function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

/** Convert points to mm */
export function ptToMm(pt: number): number {
  return (pt / 72) * 25.4;
}

// ============================================================
// Paper Scaling
// ============================================================

/** Calculate scale factor to fit paper in viewport */
export function calculatePaperScale(
  paper: CanvasPaperConfig,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 40
): number {
  const paperWidthPx = mmToPx(paper.widthMm);
  const paperHeightPx = mmToPx(paper.heightMm);
  
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - padding * 2;
  
  const scaleX = availableWidth / paperWidthPx;
  const scaleY = availableHeight / paperHeightPx;
  
  return Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
}

/** Scale paper dimensions for display */
export function getScaledPaperDimensions(
  paper: CanvasPaperConfig,
  scale: number
): { width: number; height: number } {
  return {
    width: mmToPx(paper.widthMm) * scale,
    height: mmToPx(paper.heightMm) * scale,
  };
}

// ============================================================
// Element Positioning
// ============================================================

/** Get element position in pixels (scaled) */
export function getElementPositionPx(
  element: CanvasElement,
  scale: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: mmToPx(element.x) * scale,
    y: mmToPx(element.y) * scale,
    width: mmToPx(element.width) * scale,
    height: mmToPx(element.height) * scale,
  };
}

/** Convert pixel position to mm (for drag operations) */
export function pxToElementPosition(
  px: number,
  scale: number
): number {
  return pxToMm(px / scale);
}

/** Snap position to grid */
export function snapToGrid(
  value: number,
  gridSizeMm: number,
  snap: boolean
): number {
  if (!snap || gridSizeMm <= 0) return value;
  return Math.round(value / gridSizeMm) * gridSizeMm;
}

/** Clamp element position to paper bounds */
export function clampElementToPaper(
  element: CanvasElement,
  paper: CanvasPaperConfig
): CanvasElement {
  const maxX = paper.widthMm - element.width;
  const maxY = paper.heightMm - element.height;
  
  return {
    ...element,
    x: Math.max(0, Math.min(element.x, maxX)),
    y: Math.max(0, Math.min(element.y, maxY)),
  };
}

// ============================================================
// Element Bounds
// ============================================================

/** Check if point is inside element */
export function isPointInElement(
  px: number,
  py: number,
  element: CanvasElement,
  scale: number
): boolean {
  const pos = getElementPositionPx(element, scale);
  return (
    px >= pos.x &&
    px <= pos.x + pos.width &&
    py >= pos.y &&
    py <= pos.y + pos.height
  );
}

/** Find topmost element at position */
export function findElementAtPosition(
  px: number,
  py: number,
  elements: CanvasElement[],
  scale: number
): CanvasElement | null {
  // Sort by zIndex descending (top elements first)
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
  
  for (const element of sorted) {
    if (!element.visible) continue;
    if (isPointInElement(px, py, element, scale)) {
      return element;
    }
  }
  
  return null;
}

// ============================================================
// Paper Size Conversions
// ============================================================

/** Scale elements when paper size changes */
export function scaleElementsForPaper(
  elements: CanvasElement[],
  fromPaper: CanvasPaperConfig,
  toPaper: CanvasPaperConfig
): CanvasElement[] {
  const scaleX = toPaper.widthMm / fromPaper.widthMm;
  const scaleY = toPaper.heightMm / fromPaper.heightMm;
  
  return elements.map(el => ({
    ...el,
    x: el.x * scaleX,
    y: el.y * scaleY,
    width: el.width * scaleX,
    height: el.height * scaleY,
  }));
}

// ============================================================
// Grid Helpers
// ============================================================

/** Generate grid lines for display */
export function generateGridLines(
  paper: CanvasPaperConfig,
  gridSizeMm: number,
  scale: number
): { horizontal: number[]; vertical: number[] } {
  const horizontal: number[] = [];
  const vertical: number[] = [];
  
  // Horizontal lines
  for (let y = 0; y <= paper.heightMm; y += gridSizeMm) {
    horizontal.push(mmToPx(y) * scale);
  }
  
  // Vertical lines
  for (let x = 0; x <= paper.widthMm; x += gridSizeMm) {
    vertical.push(mmToPx(x) * scale);
  }
  
  return { horizontal, vertical };
}

// ============================================================
// Z-Index Management
// ============================================================

/** Get next available zIndex */
export function getNextZIndex(elements: CanvasElement[]): number {
  if (elements.length === 0) return 1;
  const maxZ = Math.max(...elements.map(el => el.zIndex));
  return maxZ + 1;
}

/** Move element up in layer order */
export function moveElementUp(element: CanvasElement, elements: CanvasElement[]): CanvasElement {
  const above = elements.filter(el => el.zIndex > element.zIndex && el.visible);
  if (above.length === 0) return element;
  
  const target = above.sort((a, b) => a.zIndex - b.zIndex)[0];
  return {
    ...element,
    zIndex: target.zIndex,
  };
}

/** Move element down in layer order */
export function moveElementDown(element: CanvasElement, elements: CanvasElement[]): CanvasElement {
  const below = elements.filter(el => el.zIndex < element.zIndex && el.visible);
  if (below.length === 0) return element;
  
  const target = below.sort((a, b) => b.zIndex - a.zIndex)[0];
  return {
    ...element,
    zIndex: target.zIndex,
  };
}

/** Normalize z-indices to sequential values */
export function normalizeZIndices(elements: CanvasElement[]): CanvasElement[] {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  return sorted.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
}
