/**
 * PDF Types for Template Studio
 * 
 * Type definitions for PDF rendering
 */

import type { CanvasTemplate, CanvasElement, CanvasPaperConfig, CanvasBatchConfig } from '../canvas-schema';

export interface PdfRenderOptions {
  template: CanvasTemplate;
  companyData?: CompanyData | null;
  productData?: ProductData | null;
}

export interface CompanyData {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ProductData {
  id: string;
  name: string;
  sku?: string;
  unitPrice?: number;
  currency?: string;
  unit?: string;
}

export interface NormalizedElement {
  id: string;
  type: string;
  // Position in mm (PDF coordinate system)
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  // Style
  fontSizePt: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  borderColor: string;
  borderWidthMm: number;
  borderRadiusMm: number;
  paddingMm: number;
  opacity: number;
  // Content
  text: string;
  binding?: string;
  companyFields?: Array<{
    binding: string;
    label: string;
    visible: boolean;
  }>;
  visible: boolean;
}

export interface PdfPage {
  pageIndex: number;
  elements: NormalizedElement[];
}

export interface PdfDocument {
  paperWidthMm: number;
  paperHeightMm: number;
  pages: PdfPage[];
}
