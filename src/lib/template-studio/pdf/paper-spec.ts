/**
 * Paper Specification for PDF Output
 * 
 * Defines paper sizes and conversions for PDF rendering
 */

import type { CanvasPaperConfig } from '../canvas-schema';

export interface PaperSpec {
  widthMm: number;
  heightMm: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Get paper specification from canvas paper config
 */
export function getPaperSpec(paper: CanvasPaperConfig): PaperSpec {
  return {
    widthMm: paper.widthMm,
    heightMm: paper.heightMm,
    orientation: paper.orientation,
  };
}

/**
 * Common paper presets
 */
export const PAPER_PRESETS = {
  '10x10': { widthMm: 100, heightMm: 100 },
  '10x15': { widthMm: 100, heightMm: 150 },
  'A4': { widthMm: 210, heightMm: 297 },
} as const;

/**
 * Convert mm to PDF points (1mm = 2.83465pt)
 */
export function mmToPt(mm: number): number {
  return mm * 2.83465;
}

/**
 * Convert PDF points to mm (1pt = 0.352778mm)
 */
export function ptToMm(pt: number): number {
  return pt * 0.352778;
}
