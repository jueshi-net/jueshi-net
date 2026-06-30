/**
 * Token Resolver for PDF Output
 * 
 * Resolves template tokens like [company.name], [sequence], etc.
 * 
 * Supported tokens:
 * - [company.name], [company.companyName]
 * - [company.contactName], [company.phone], [company.address], [company.email]
 * - [product.name], [product.sku], [product.price]
 * - [sequence], [batch.sequence]
 * - [packageCount], [batch.packageCount]
 */

import type { CompanyData, ProductData, NormalizedElement } from './pdf-types';

export interface TokenContext {
  companyData?: CompanyData | null;
  productData?: ProductData | null;
  pageIndex: number;
  totalPages: number;
}

/**
 * Resolve a single token
 */
function resolveToken(token: string, context: TokenContext): string {
  const { companyData, productData, pageIndex, totalPages } = context;
  
  // Company tokens
  if (token.startsWith('company.')) {
    const field = token.replace('company.', '');
    if (!companyData) return '';
    
    const value = (companyData as any)[field];
    return value !== undefined ? String(value) : '';
  }
  
  // Product tokens
  if (token.startsWith('product.')) {
    const field = token.replace('product.', '');
    if (!productData) return '';
    
    const value = (productData as any)[field];
    return value !== undefined ? String(value) : '';
  }
  
  // Sequence tokens
  if (token === 'sequence' || token === 'batch.sequence') {
    const currentPage = pageIndex + 1;
    return `${currentPage}/${totalPages}`;
  }
  
  // Package count tokens
  if (token === 'packageCount' || token === 'batch.packageCount') {
    return String(totalPages);
  }
  
  // Current page index
  if (token === 'pageIndex' || token === 'currentPage') {
    return String(pageIndex + 1);
  }
  
  // Unknown token - return empty
  return '';
}

/**
 * Resolve all tokens in text
 * 
 * Supports format: [token.name]
 */
export function resolveTokens(text: string, context: TokenContext): string {
  // Match [token.name] pattern
  const tokenPattern = /\[([a-zA-Z0-9_.]+)\]/g;
  
  return text.replace(tokenPattern, (match, token) => {
    const resolved = resolveToken(token, context);
    return resolved !== '' ? resolved : match; // Keep original if not resolved
  });
}

/**
 * Resolve element content for PDF
 */
export function resolveElementContent(
  element: NormalizedElement,
  context: TokenContext
): string {
  // Handle sequence element type
  if (element.type === 'sequence') {
    const currentPage = context.pageIndex + 1;
    return `${currentPage}/${context.totalPages}`;
  }
  
  // Handle binding
  if (element.binding) {
    // Sequence binding
    if (element.binding === 'batch.sequence' || element.binding === 'sequence') {
      const currentPage = context.pageIndex + 1;
      return `${currentPage}/${context.totalPages}`;
    }
    
    // Company binding
    if (element.binding.startsWith('company.')) {
      const field = element.binding.replace('company.', '');
      if (!context.companyData) return '';
      const value = (context.companyData as any)[field];
      return value !== undefined ? String(value) : '';
    }
    
    // Product binding
    if (element.binding.startsWith('product.')) {
      const field = element.binding.replace('product.', '');
      if (!context.productData) return '';
      const value = (context.productData as any)[field];
      return value !== undefined ? String(value) : '';
    }
  }
  
  // Handle company-info block
  if (element.type === 'company-info' && element.companyFields) {
    // This is handled separately in the PDF renderer
    return '';
  }
  
  // Static text with token resolution
  if (element.text) {
    return resolveTokens(element.text, context);
  }
  
  return '';
}

/**
 * Check if text contains raw tokens
 */
export function hasRawTokens(text: string): boolean {
  const tokenPattern = /\[([a-zA-Z0-9_.]+)\]/;
  return tokenPattern.test(text);
}

/**
 * Get token resolution report
 */
export function getTokenReport(
  elements: NormalizedElement[],
  context: TokenContext
) {
  const resolvedElements = elements.map(el => ({
    id: el.id,
    type: el.type,
    originalText: el.text || '',
    resolvedText: resolveElementContent(el, context),
    hasBinding: !!el.binding,
    binding: el.binding,
  }));
  
  const unresolvedTokens = resolvedElements
    .filter(el => hasRawTokens(el.resolvedText))
    .map(el => ({
      id: el.id,
      text: el.resolvedText,
    }));
  
  return {
    totalPages: context.totalPages,
    currentPage: context.pageIndex + 1,
    elements: resolvedElements,
    unresolvedTokens,
    hasUnresolved: unresolvedTokens.length > 0,
  };
}
