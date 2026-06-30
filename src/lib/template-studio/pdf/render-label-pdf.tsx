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
import type { PdfRenderOptions, NormalizedElement, PdfDocument, PdfPage, CompanyData, ProductData, ProductItem } from './pdf-types';
import { getPaperSpec, mmToPt } from './paper-spec';
import { normalizeElementForPdf } from './coordinate';
import { resolveElementContent, resolveTokens } from './token-resolver';

// Register Chinese font - use Noto Sans SC from Google Fonts
// This is an open-source font that supports Chinese characters
Font.register({
  family: 'NotoSansSC',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.ttf',
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
  ],
});

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
  productData?: ProductData | null,
  products?: ProductItem[] | null
) {
  const context = {
    companyData,
    productData,
    pageIndex,
    totalPages,
  };
  
  // Handle different element types
  if (element.type === 'company-info' && element.companyFields) {
    return renderCompanyInfoBlock(element, companyData);
  }
  
  if (element.type === 'product-table' && products) {
    return renderProductTable(element, products);
  }
  
  // Resolve content for text/sequence elements
  let content = resolveElementContent(element, context);
  
  // Create styles with Chinese font support
  const elementStyle = {
    position: 'absolute' as const,
    left: mmToPt(element.xMm),
    top: mmToPt(element.yMm),
    width: mmToPt(element.widthMm),
    height: mmToPt(element.heightMm),
    fontSize: element.fontSizePt,
    fontFamily: 'NotoSansSC', // Use Chinese font
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
 * Render company-info block
 */
function renderCompanyInfoBlock(
  element: NormalizedElement,
  companyData?: CompanyData | null
) {
  if (!element.companyFields || !companyData) {
    return null;
  }
  
  const fields = element.companyFields
    .filter(field => field.visible)
    .map(field => {
      let value = '';
      if (field.binding.startsWith('company.') && companyData) {
        const key = field.binding.replace('company.', '');
        value = String((companyData as any)[key] || '');
      }
      return `${field.label}: ${value}`;
    });
  
  const elementStyle = {
    position: 'absolute' as const,
    left: mmToPt(element.xMm),
    top: mmToPt(element.yMm),
    width: mmToPt(element.widthMm),
    height: mmToPt(element.heightMm),
    fontSize: element.fontSizePt,
    fontFamily: 'NotoSansSC',
    fontWeight: element.fontWeight,
    color: element.color,
    padding: mmToPt(element.paddingMm),
    opacity: element.opacity,
  };
  
  return (
    <View key={element.id} style={elementStyle}>
      {fields.map((field, idx) => (
        <Text key={idx} style={{ marginBottom: 2 }}>
          {field}
        </Text>
      ))}
    </View>
  );
}

/**
 * Render product table
 */
function renderProductTable(
  element: NormalizedElement,
  products: ProductItem[]
) {
  const elementStyle = {
    position: 'absolute' as const,
    left: mmToPt(element.xMm),
    top: mmToPt(element.yMm),
    width: mmToPt(element.widthMm),
    height: mmToPt(element.heightMm),
    fontSize: element.fontSizePt,
    fontFamily: 'NotoSansSC',
    padding: mmToPt(element.paddingMm),
    opacity: element.opacity,
    borderColor: '#000000',
    borderWidth: 0.5,
  };
  
  const headerStyle = {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 2,
    fontWeight: 'bold' as const,
  };
  
  const rowStyle = {
    flexDirection: 'row' as const,
    marginBottom: 2,
  };
  
  return (
    <View key={element.id} style={elementStyle}>
      {/* Table header */}
      <View style={headerStyle}>
        <Text style={{ width: '40%' }}>商品名称</Text>
        <Text style={{ width: '20%' }}>SKU</Text>
        <Text style={{ width: '20%' }}>数量</Text>
        <Text style={{ width: '20%' }}>单价</Text>
      </View>
      
      {/* Table rows */}
      {products.map((product, idx) => (
        <View key={idx} style={rowStyle}>
          <Text style={{ width: '40%' }}>{product.name}</Text>
          <Text style={{ width: '20%' }}>{product.sku || '-'}</Text>
          <Text style={{ width: '20%' }}>{product.quantity || 0}</Text>
          <Text style={{ width: '20%' }}>
            {product.unitPrice ? `¥${product.unitPrice.toFixed(2)}` : '-'}
          </Text>
        </View>
      ))}
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
  productData?: ProductData | null,
  products?: ProductItem[] | null
) {
  const pageSize = [mmToPt(paperWidthMm), mmToPt(paperHeightMm)] as [number, number];
  
  return (
    <Page key={page.pageIndex} size={pageSize} style={styles.page}>
      {page.elements.map(element =>
        renderElement(element, page.pageIndex, totalPages, companyData, productData, products)
      )}
    </Page>
  );
}

/**
 * Main PDF Document Component
 */
export function LabelPdfDocument(options: PdfRenderOptions) {
  const pdfDoc = createPdfDocument(options);
  const { companyData, productData, products } = options;
  
  return (
    <Document>
      {pdfDoc.pages.map(page =>
        renderPage(
          page,
          pdfDoc.pages.length,
          pdfDoc.paperWidthMm,
          pdfDoc.paperHeightMm,
          companyData,
          productData,
          products
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
