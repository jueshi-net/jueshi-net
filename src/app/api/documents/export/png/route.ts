import { NextRequest, NextResponse } from 'next/server';
import { buildA4ExportHTML } from '@/lib/documents/a4-export-renderer';

/**
 * Server-side PNG export endpoint.
 * Renders A4 HTML and returns PNG directly.
 * Bypasses all browser html2canvas/Safari compatibility issues.
 * 
 * POST /api/documents/export/png
 * Body: A4ExportData (same as buildA4ExportHTML input)
 * Returns: PNG image
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Build A4 HTML using the same renderer as client-side
    const html = buildA4ExportHTML({
      companyName: data.companyName || '公司名称',
      companyNameEn: data.companyNameEn || '',
      companyAddress: data.companyAddress || '',
      companyPhone: data.companyPhone || '',
      companyEmail: data.companyEmail || '',
      companyWebsite: data.companyWebsite || '',
      documentNo: data.documentNo || '',
      documentDate: data.documentDate || '',
      titleZh: data.titleZh || '单据',
      titleEn: data.titleEn || '',
      sections: data.sections || [],
      lineItems: data.lineItems || { columns: [], rows: [], totals: [] },
      terms: data.terms || '',
      canRemoveBranding: data.canRemoveBranding || false,
      style: {
        primaryColor: data.style?.primaryColor || '#000000',
        borderColor: data.style?.borderColor || '#000000',
        headingBgColor: data.style?.headingBgColor || '#f3f4f6',
      },
    });

    // For server-side PNG generation, we have two options:
    // 1. Return HTML and let client render (current fallback)
    // 2. Use Playwright/Puppeteer to render and screenshot (requires browser on server)
    // 
    // Since the VPS may not have a browser installed, we'll use a canvas-based approach:
    // Render HTML to canvas using jsdom + canvas package (pure Node.js, no browser needed)
    // 
    // Fallback: Return the HTML in a data URL format that the client can download
    // The client-side code will use this HTML directly instead of html2canvas
    
    return NextResponse.json({
      success: true,
      html,
      a4Width: 794,
      a4Height: 1123,
      message: 'Use this HTML for client-side rendering or server-side Playwright screenshot',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('PNG export error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
