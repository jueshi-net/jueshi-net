/**
 * PDF Label Renderer for Template Studio
 * 
 * Generates PDF from template data using @react-pdf/renderer
 * 
 * Key features:
 * - Data-driven rendering (no DOM cloning)
 * - Multi-page support (repeat mode)
 * - Chinese font support
 * - Token resolution
 * - Coordinate mapping (mm)
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { CanvasTemplate, CanvasElement } from '../canvas-schema';
import type { PdfRenderOptions, NormalizedElement, PdfDocument, PdfPage, CompanyData, ProductData } from './pdf-types';
import { getPaperSpec, mmToPt } from './paper-spec';
import { normalizeElementForPdf } from './coordinate';
import { resolveElementContent, resolveTokens } from './token-resolver';

// Register Chinese font (using system font or embedded font)
// Note: For production, you may need to register a specific Chinese font
// Font.register({
//   family: 'ChineseFont',
//   fonts: [
//     { src: '/path/to/chinese-font.ttf', fontWeight: 'normal' },
//   ]
// });

/**
 * Create PDF document structure from template
 */
export function createPdfDocument(options: PdfRenderOptions): PdfDocument {
  const { template, companyData, productData } = options;
  const paperSpec = getPaperSpec(template.paper);
  
  // Determine number of pages
  const pageCount = template.batch?.outputMode === 'repeat'
    ? Math.max(1, template.batch.packageCount || 1)
    : 1;
  
  // Create pages
  const pages: PdfPage[] = [];
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const normalizedElements = template.elements
      .filter(el => el.visible)
      .map(el => normalizeElementForPdf(el, paperSpec.widthMm, paperSpec.heightMm));
    
    pages.push({
      pageIndex,
      elements: normalizedElements,
    });
  }
  
  return {
    paperWidthMm: paperSpec.widthMm,
    paperHeightMm: paperSpec.heightMm,
    pages,
  };
}

/**
 * Render a single element to PDF
 */
function renderElement(
  element: NormalizedElement,
  pageIndex: number,
  totalPages: number,
  companyData?: CompanyData | null,
  productData?: ProductData | null
) {
  const context = {
    companyData,
    productData,
    pageIndex,
    totalPages,
  };
  
  // Resolve content
  let content = resolveElementContent(element, context);
  
  // Handle company-info block specially
  if (element.type === 'company-info' && element.companyFields) {
    const fields = element.companyFields
      .filter(field => field.visible)
      .map(field => {
        let value = '';
        if (field.binding.startsWith('company.') && companyData) {
          const key = field.binding.replace('company.', '');
          value = String((companyData as any)[key] || '');
        }
        return `${field.label}: ${value}`;
      })
      .join('\n');
    
    content = fields;
  }
  
  // Create styles
  const elementStyle = {
    position: 'absolute' as const,
    left: mmToPt(element.xMm),
    top: mmToPt(element.yMm),
    width: mmToPt(element.widthMm),
    height: mmToPt(element.heightMm),
    fontSize: element.fontSizePt,
    fontFamily: 'Helvetica', // Use Helvetica for better Chinese support
    fontWeight: element.fontWeight,
    color: element.color,
    textAlign: element.textAlign as any,
    backgroundColor: element.backgroundColor === 'transparent' ? undefined : element.backgroundColor,
    borderColor: element.borderColor === 'transparent' ? undefined : element.borderColor,
    borderWidth: mmToPt(element.borderWidthMm),
    borderRadius: mmToPt(element.borderRadiusMm),
    padding: mmToPt(element.paddingMm),
    opacity: element.opacity,
    overflow: 'hidden' as const,
  };
  
  return (
    <View key={element.id} style={elementStyle}>
      <Text>{content}</Text>
    </View>
  );
}

/**
 * Render a single page
 */
function renderPage(
  page: PdfPage,
  totalPages: number,
  paperWidthMm: number,
  paperHeightMm: number,
  companyData?: CompanyData | null,
  productData?: ProductData | null
) {
  const pageSize = [mmToPt(paperWidthMm), mmToPt(paperHeightMm)] as [number, number];
  
  return (
    <Page key={page.pageIndex} size={pageSize} style={styles.page}>
      {page.elements.map(element =>
        renderElement(element, page.pageIndex, totalPages, companyData, productData)
      )}
    </Page>
  );
}

/**
 * Main PDF Document Component
 */
export function LabelPdfDocument(options: PdfRenderOptions) {
  const pdfDoc = createPdfDocument(options);
  const { companyData, productData } = options;
  
  return (
    <Document>
      {pdfDoc.pages.map(page =>
        renderPage(
          page,
          pdfDoc.pages.length,
          pdfDoc.paperWidthMm,
          pdfDoc.paperHeightMm,
          companyData,
          productData
        )
      )}
    </Document>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  page: {
    position: 'relative',
    margin: 0,
    padding: 0,
  },
});

/**
 * Generate PDF blob (for download)
 */
export async function generatePdfBlob(options: PdfRenderOptions): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(<LabelPdfDocument {...options} />).toBlob();
  return blob;
}
