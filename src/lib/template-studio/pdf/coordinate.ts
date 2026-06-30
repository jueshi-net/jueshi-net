/**
 * Coordinate Transformation for PDF Output
 * 
 * Converts canvas element coordinates to PDF coordinates (mm)
 * 
 * Key principles:
 * - Canvas elements use mm as unit (from canvas-schema)
 * - PDF uses mm as unit
 * - No conversion needed if elements are already in mm
 * - fontSize is in pt (from canvas-schema)
 * - All conversions centralized here
 */

import type { CanvasElement } from '../canvas-schema';
import type { NormalizedElement } from './pdf-types';

/**
 * Check if element coordinates are in mm (should be true for all canvas elements)
 */
function isElementInMm(element: CanvasElement): boolean {
  // Canvas elements are always in mm according to canvas-schema
  return true;
}

/**
 * Normalize element for PDF rendering
 * 
 * Converts canvas element to PDF-ready format with mm coordinates
 */
export function normalizeElementForPdf(
  element: CanvasElement,
  paperWidthMm: number,
  paperHeightMm: number
): NormalizedElement {
  // Elements are already in mm, no conversion needed
  const xMm = element.x;
  const yMm = element.y;
  const widthMm = element.width;
  const heightMm = element.height;
  
  // fontSize is in pt (from canvas-schema), use directly
  const fontSizePt = element.style.fontSize || 12;
  
  // padding is in mm (from canvas-schema), use directly
  const paddingMm = element.style.padding || 0;
  
  // borderWidth is in mm (from canvas-schema), use directly
  const borderWidthMm = element.style.borderWidth || 0;
  
  // borderRadius is in mm (from canvas-schema), use directly
  const borderRadiusMm = element.style.borderRadius || 0;
  
  return {
    id: element.id,
    type: element.type,
    xMm,
    yMm,
    widthMm,
    heightMm,
    fontSizePt,
    fontFamily: element.style.fontFamily || 'Arial, sans-serif',
    fontWeight: element.style.fontWeight || 'normal',
    color: element.style.color || '#000000',
    textAlign: element.style.textAlign || 'left',
    backgroundColor: element.style.backgroundColor || 'transparent',
    borderColor: element.style.borderColor || 'transparent',
    borderWidthMm,
    borderRadiusMm,
    paddingMm,
    opacity: element.style.opacity ?? 1,
    text: element.text || '',
    binding: element.binding,
    companyFields: element.companyFields,
    visible: element.visible,
  };
}

/**
 * Validate coordinate conversion
 * 
 * Ensures coordinates are within paper bounds
 */
export function validateCoordinates(
  element: NormalizedElement,
  paperWidthMm: number,
  paperHeightMm: number
): boolean {
  const { xMm, yMm, widthMm, heightMm } = element;
  
  // Check if element is within paper bounds
  if (xMm < 0 || yMm < 0) return false;
  if (xMm + widthMm > paperWidthMm) return false;
  if (yMm + heightMm > paperHeightMm) return false;
  
  return true;
}

/**
 * Get coordinate conversion report
 */
export function getCoordinateReport(
  elements: NormalizedElement[],
  paperWidthMm: number,
  paperHeightMm: number
) {
  const validElements = elements.filter(el => 
    validateCoordinates(el, paperWidthMm, paperHeightMm)
  );
  
  const invalidElements = elements.filter(el => 
    !validateCoordinates(el, paperWidthMm, paperHeightMm)
  );
  
  return {
    paperWidthMm,
    paperHeightMm,
    totalElements: elements.length,
    validElements: validElements.length,
    invalidElements: invalidElements.length,
    elements: elements.map(el => ({
      id: el.id,
      type: el.type,
      xMm: el.xMm,
      yMm: el.yMm,
      widthMm: el.widthMm,
      heightMm: el.heightMm,
      valid: validateCoordinates(el, paperWidthMm, paperHeightMm),
    })),
  };
}
