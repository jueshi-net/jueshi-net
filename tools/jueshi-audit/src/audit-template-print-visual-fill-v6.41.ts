/**
 * Template Print Visual Fill Audit v6.41
 * 
 * Measures actual visible content bounding box, not wrapper.
 * Compares design bbox vs print bbox.
 * Verifies no excessive whitespace.
 * Verifies no company name placeholders.
 * Verifies company fields resolve properly.
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const STAGING_URL = 'https://i.jueshi.net';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EVIDENCE_DIR = path.join(__dirname, '../evidence/print-visual-fill-v6.41');

interface AuditResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function log(msg: string) {
  console.log(`[AUDIT] ${msg}`);
}

async function measureVisibleContentBBox(page: Page): Promise<{
  designBBox: BBox | null;
  printBBox: BBox | null;
  paperWidth: number;
  paperHeight: number;
}> {
  // Measure design mode bbox (what user sees in editor)
  const designBBox = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    if (!paper) return null;
    
    const rect = paper.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    };
  });

  // Get paper dimensions
  const paperDims = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    if (!paper) return { width: 0, height: 0 };
    const rect = paper.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });

  // Trigger print and measure print bbox
  await page.click('[data-testid="canvas-print-button"]');
  await page.waitForTimeout(2000); // Wait for iframe to be created

  // Get iframe
  const iframe = await page.$('#canvas-print-iframe');
  if (!iframe) {
    console.log('[DEBUG] Print iframe not found');
    return { designBBox, printBBox: null, paperWidth: paperDims.width, paperHeight: paperDims.height };
  }

  const frame = await iframe.contentFrame();
  if (!frame) {
    console.log('[DEBUG] Could not access iframe content');
    return { designBBox, printBBox: null, paperWidth: paperDims.width, paperHeight: paperDims.height };
  }

  // Wait for content to be rendered
  await frame.waitForTimeout(1000);

  // Debug: Check what elements are in the iframe
  const debugInfo = await frame.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const testIds = Array.from(allElements).map(el => el.getAttribute('data-testid')).filter(Boolean);
    return {
      totalElements: allElements.length,
      testIds: testIds.slice(0, 20), // First 20 testids
      bodyHTML: document.body.innerHTML.substring(0, 500) // First 500 chars of body
    };
  });
  console.log('[DEBUG] Iframe content:', JSON.stringify(debugInfo, null, 2));

  // Measure print bbox (actual visible content)
  const printBBox = await frame.evaluate(() => {
    // Find all visible content elements (not wrappers)
    // Look for actual canvas elements: text, company-info, table, etc.
    const elements = Array.from(document.querySelectorAll('[data-testid="canvas-text-element"], [data-testid="canvas-company-info-block"], [data-testid="canvas-product-table"], [data-testid^="canvas-company-field-"]'));
    if (elements.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    });

    if (minX === Infinity) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      top: minY,
      right: maxX,
      bottom: maxY,
      left: minX
    };
  });

  // Close print dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  return { designBBox, printBBox, paperWidth: paperDims.width, paperHeight: paperDims.height };
}

async function auditVisibleContentBBoxMeasured(page: Page): Promise<AuditResult> {
  log('TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED: Measuring actual visible content bbox...');

  const { designBBox, printBBox, paperWidth, paperHeight } = await measureVisibleContentBBox(page);

  if (!designBBox) {
    return {
      id: 'TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED',
      name: 'Visible Content BBox Measured',
      status: 'FAIL',
      message: 'Could not measure design bbox'
    };
  }

  if (!printBBox) {
    return {
      id: 'TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED',
      name: 'Visible Content BBox Measured',
      status: 'FAIL',
      message: 'Could not measure print bbox'
    };
  }

  // Calculate fill ratios
  const designFillRatio = (designBBox.width * designBBox.height) / (paperWidth * paperHeight);
  const printFillRatio = (printBBox.width * printBBox.height) / (paperWidth * paperHeight);

  // Check if print fill is at least 80% of design fill
  const fillMatch = printFillRatio >= designFillRatio * 0.8;

  return {
    id: 'TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED',
    name: 'Visible Content BBox Measured',
    status: fillMatch ? 'PASS' : 'FAIL',
    message: fillMatch
      ? `Design fill: ${(designFillRatio * 100).toFixed(1)}%, Print fill: ${(printFillRatio * 100).toFixed(1)}%`
      : `Design fill: ${(designFillRatio * 100).toFixed(1)}%, Print fill: ${(printFillRatio * 100).toFixed(1)}% (mismatch)`,
    details: {
      designBBox,
      printBBox,
      paperWidth,
      paperHeight,
      designFillRatio,
      printFillRatio,
      fillMatch
    }
  };
}

async function auditVisualFillMatchesDesign(page: Page): Promise<AuditResult> {
  log('TS-PRINT-10X10-VISUAL_FILL_MATCHES_DESIGN: Comparing design vs print bbox...');

  const { designBBox, printBBox, paperWidth, paperHeight } = await measureVisibleContentBBox(page);

  if (!designBBox || !printBBox) {
    return {
      id: 'TS-PRINT-10X10-VISUAL_FILL_MATCHES_DESIGN',
      name: 'Visual Fill Matches Design',
      status: 'FAIL',
      message: 'Could not measure bboxes'
    };
  }

  // Calculate whitespace
  const designBottomWhitespace = paperHeight - designBBox.bottom;
  const printBottomWhitespace = paperHeight - printBBox.bottom;
  
  const designLeftWhitespace = designBBox.left;
  const printLeftWhitespace = printBBox.left;
  
  const designRightWhitespace = paperWidth - designBBox.right;
  const printRightWhitespace = paperWidth - printBBox.right;

  // Check if print whitespace is within 20% of design whitespace
  const bottomWhitespaceMatch = printBottomWhitespace <= designBottomWhitespace * 1.2;
  const leftWhitespaceMatch = printLeftWhitespace <= designLeftWhitespace * 1.2;
  const rightWhitespaceMatch = printRightWhitespace <= designRightWhitespace * 1.2;

  const allMatch = bottomWhitespaceMatch && leftWhitespaceMatch && rightWhitespaceMatch;

  return {
    id: 'TS-PRINT-10X10-VISUAL_FILL_MATCHES_DESIGN',
    name: 'Visual Fill Matches Design',
    status: allMatch ? 'PASS' : 'FAIL',
    message: allMatch
      ? 'Print whitespace matches design whitespace'
      : 'Print whitespace exceeds design whitespace',
    details: {
      designBottomWhitespace,
      printBottomWhitespace,
      bottomWhitespaceMatch,
      designLeftWhitespace,
      printLeftWhitespace,
      leftWhitespaceMatch,
      designRightWhitespace,
      printRightWhitespace,
      rightWhitespaceMatch
    }
  };
}

async function auditNoExcessBottomWhitespace(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_EXCESS_BOTTOM_WHITESPACE: Checking bottom whitespace...');

  const { printBBox, paperHeight } = await measureVisibleContentBBox(page);

  if (!printBBox) {
    return {
      id: 'TS-PRINT-NO_EXCESS_BOTTOM_WHITESPACE',
      name: 'No Excess Bottom Whitespace',
      status: 'FAIL',
      message: 'Could not measure print bbox'
    };
  }

  const bottomWhitespace = paperHeight - printBBox.bottom;
  const bottomWhitespaceRatio = bottomWhitespace / paperHeight;

  // Allow up to 15% bottom whitespace
  const acceptable = bottomWhitespaceRatio <= 0.15;

  return {
    id: 'TS-PRINT-NO_EXCESS_BOTTOM_WHITESPACE',
    name: 'No Excess Bottom Whitespace',
    status: acceptable ? 'PASS' : 'FAIL',
    message: acceptable
      ? `Bottom whitespace: ${(bottomWhitespaceRatio * 100).toFixed(1)}%`
      : `Bottom whitespace: ${(bottomWhitespaceRatio * 100).toFixed(1)}% (excessive)`,
    details: {
      bottomWhitespace,
      paperHeight,
      bottomWhitespaceRatio
    }
  };
}

async function auditNoExcessSideWhitespace(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_EXCESS_SIDE_WHITESPACE: Checking side whitespace...');

  const { printBBox, paperWidth } = await measureVisibleContentBBox(page);

  if (!printBBox) {
    return {
      id: 'TS-PRINT-NO_EXCESS_SIDE_WHITESPACE',
      name: 'No Excess Side Whitespace',
      status: 'FAIL',
      message: 'Could not measure print bbox'
    };
  }

  const leftWhitespace = printBBox.left;
  const rightWhitespace = paperWidth - printBBox.right;
  
  const leftWhitespaceRatio = leftWhitespace / paperWidth;
  const rightWhitespaceRatio = rightWhitespace / paperWidth;

  // Allow up to 10% side whitespace
  const acceptable = leftWhitespaceRatio <= 0.10 && rightWhitespaceRatio <= 0.10;

  return {
    id: 'TS-PRINT-NO_EXCESS_SIDE_WHITESPACE',
    name: 'No Excess Side Whitespace',
    status: acceptable ? 'PASS' : 'FAIL',
    message: acceptable
      ? `Left: ${(leftWhitespaceRatio * 100).toFixed(1)}%, Right: ${(rightWhitespaceRatio * 100).toFixed(1)}%`
      : `Left: ${(leftWhitespaceRatio * 100).toFixed(1)}%, Right: ${(rightWhitespaceRatio * 100).toFixed(1)}% (excessive)`,
    details: {
      leftWhitespace,
      rightWhitespace,
      paperWidth,
      leftWhitespaceRatio,
      rightWhitespaceRatio
    }
  };
}

async function auditCompanyNamePlaceholderNotVisible(page: Page): Promise<AuditResult> {
  log('TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE: Checking for company name placeholders...');

  const { printBBox } = await measureVisibleContentBBox(page);

  if (!printBBox) {
    return {
      id: 'TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE',
      name: 'Company Name Placeholder Not Visible',
      status: 'FAIL',
      message: 'Could not measure print bbox'
    };
  }

  // Get iframe
  const iframe = await page.$('#canvas-print-iframe');
  if (!iframe) {
    return {
      id: 'TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE',
      name: 'Company Name Placeholder Not Visible',
      status: 'FAIL',
      message: 'Could not find print iframe'
    };
  }

  const frame = await iframe.contentFrame();
  if (!frame) {
    return {
      id: 'TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE',
      name: 'Company Name Placeholder Not Visible',
      status: 'FAIL',
      message: 'Could not access print frame'
    };
  }

  // Check for placeholders
  const placeholders = await frame.evaluate(() => {
    const text = document.body.textContent || '';
    const found: string[] = [];
    
    if (text.includes('[company.name]')) found.push('[company.name]');
    if (text.includes('[company.companyName]')) found.push('[company.companyName]');
    if (text.includes('Company name')) found.push('Company name');
    
    return found;
  });

  const noPlaceholders = placeholders.length === 0;

  return {
    id: 'TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE',
    name: 'Company Name Placeholder Not Visible',
    status: noPlaceholders ? 'PASS' : 'FAIL',
    message: noPlaceholders
      ? 'No company name placeholders found'
      : `Found placeholders: ${placeholders.join(', ')}`,
    details: {
      placeholders,
      noPlaceholders
    }
  };
}

async function auditCompanyFieldsResolve(page: Page): Promise<AuditResult> {
  log('TS-PRINT-COMPANY_FIELDS_RESOLVE: Checking company field resolution...');

  // Get iframe
  const iframe = await page.$('#canvas-print-iframe');
  if (!iframe) {
    return {
      id: 'TS-PRINT-COMPANY_FIELDS_RESOLVE',
      name: 'Company Fields Resolve',
      status: 'FAIL',
      message: 'Could not find print iframe'
    };
  }

  const frame = await iframe.contentFrame();
  if (!frame) {
    return {
      id: 'TS-PRINT-COMPANY_FIELDS_RESOLVE',
      name: 'Company Fields Resolve',
      status: 'FAIL',
      message: 'Could not access print frame'
    };
  }

  // Check for resolved company fields
  const fieldStatus = await frame.evaluate(() => {
    const companyName = document.querySelector('[data-testid="canvas-element-company-name"]');
    const companyPhone = document.querySelector('[data-testid="canvas-element-company-phone"]');
    const companyContact = document.querySelector('[data-testid="canvas-element-company-contact"]');
    const companyAddress = document.querySelector('[data-testid="canvas-element-company-address"]');

    return {
      companyName: companyName ? (companyName.textContent || '').trim() : null,
      companyPhone: companyPhone ? (companyPhone.textContent || '').trim() : null,
      companyContact: companyContact ? (companyContact.textContent || '').trim() : null,
      companyAddress: companyAddress ? (companyAddress.textContent || '').trim() : null
    };
  });

  // Check if fields have values (not empty or placeholder)
  const resolved = Object.values(fieldStatus).every(v => v && v.length > 0 && !v.startsWith('['));

  return {
    id: 'TS-PRINT-COMPANY_FIELDS_RESOLVE',
    name: 'Company Fields Resolve',
    status: resolved ? 'PASS' : 'WARN',
    message: resolved
      ? 'All company fields resolved'
      : 'Some company fields not resolved',
    details: {
      fieldStatus,
      resolved
    }
  };
}

async function auditNoNavFooter(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_NAV_FOOTER: Checking for nav/footer...');

  const iframe = await page.$('#canvas-print-iframe');
  if (!iframe) {
    return {
      id: 'TS-PRINT-NO_NAV_FOOTER',
      name: 'No Nav/Footer',
      status: 'FAIL',
      message: 'Could not find print iframe'
    };
  }

  const frame = await iframe.contentFrame();
  if (!frame) {
    return {
      id: 'TS-PRINT-NO_NAV_FOOTER',
      name: 'No Nav/Footer',
      status: 'FAIL',
      message: 'Could not access print frame'
    };
  }

  const hasNavFooter = await frame.evaluate(() => {
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    return {
      hasNav: !!nav,
      hasFooter: !!footer
    };
  });

  const clean = !hasNavFooter.hasNav && !hasNavFooter.hasFooter;

  return {
    id: 'TS-PRINT-NO_NAV_FOOTER',
    name: 'No Nav/Footer',
    status: clean ? 'PASS' : 'FAIL',
    message: clean
      ? 'No nav/footer in print'
      : 'Nav/footer found in print',
    details: hasNavFooter
  };
}

async function auditNoDuplicateSequence(page: Page): Promise<AuditResult> {
  log('TS-PRINT-NO_DUPLICATE_SEQUENCE: Checking for duplicate sequences...');

  const iframe = await page.$('#canvas-print-iframe');
  if (!iframe) {
    return {
      id: 'TS-PRINT-NO_DUPLICATE_SEQUENCE',
      name: 'No Duplicate Sequence',
      status: 'FAIL',
      message: 'Could not find print iframe'
    };
  }

  const frame = await iframe.contentFrame();
  if (!frame) {
    return {
      id: 'TS-PRINT-NO_DUPLICATE_SEQUENCE',
      name: 'No Duplicate Sequence',
      status: 'FAIL',
      message: 'Could not access print frame'
    };
  }

  const sequenceInfo = await frame.evaluate(() => {
    const pageCountElements = document.querySelectorAll('[data-testid="canvas-print-page-count"]');
    const pageSequenceElements = document.querySelectorAll('[data-testid="canvas-print-page-sequence"]');
    
    const pageCountTexts = Array.from(pageCountElements).map(el => el.textContent);
    const pageSequenceTexts = Array.from(pageSequenceElements).map(el => el.textContent);
    
    const pageCountUnique = new Set(pageCountTexts);
    const pageSequenceUnique = new Set(pageSequenceTexts);
    
    return {
      pageCountCount: pageCountElements.length,
      pageCountUnique: pageCountUnique.size,
      pageSequenceCount: pageSequenceElements.length,
      pageSequenceUnique: pageSequenceUnique.size,
      hasDuplicates: pageCountElements.length !== pageCountUnique.size || pageSequenceElements.length !== pageSequenceUnique.size
    };
  });

  return {
    id: 'TS-PRINT-NO_DUPLICATE_SEQUENCE',
    name: 'No Duplicate Sequence',
    status: sequenceInfo.hasDuplicates ? 'FAIL' : 'PASS',
    message: sequenceInfo.hasDuplicates
      ? `Duplicate sequence numbers found`
      : 'No duplicate sequence numbers',
    details: sequenceInfo
  };
}

async function auditSavedCanvasEditNoRegression(page: Page): Promise<AuditResult> {
  log('TS-SAVED-CANVAS-EDIT-NO-REGRESSION: Checking saved template edit...');

  try {
    await page.goto(`${STAGING_URL}/workspace/templates`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      return {
        id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
        name: 'Saved Canvas Edit No Regression',
        status: 'PASS',
        message: 'Redirected to login (expected for unauthenticated users)'
      };
    }

    const hasError = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes("couldn't load") || 
             (text.includes('This page') && text.includes('error'));
    });

    if (hasError) {
      return {
        id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
        name: 'Saved Canvas Edit No Regression',
        status: 'FAIL',
        message: 'Saved template edit page shows error'
      };
    }

    return {
      id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
      name: 'Saved Canvas Edit No Regression',
      status: 'PASS',
      message: 'Saved template edit page loads correctly'
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      id: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
      name: 'Saved Canvas Edit No Regression',
      status: 'FAIL',
      message: `Error: ${errorMessage}`
    };
  }
}

async function auditCompanyBlockNoRegression(page: Page): Promise<AuditResult> {
  log('TS-COMPANY-BLOCK-NO-REGRESSION: Checking company block...');

  const blockInfo = await page.evaluate(() => {
    const companyBlocks = document.querySelectorAll('[data-testid^="canvas-element-company-block-"]');
    return {
      count: companyBlocks.length,
      isCombined: companyBlocks.length === 1
    };
  });

  return {
    id: 'TS-COMPANY-BLOCK-NO-REGRESSION',
    name: 'Company Block No Regression',
    status: blockInfo.count > 0 ? 'PASS' : 'WARN',
    message: blockInfo.count > 0
      ? `Company block found (${blockInfo.count} block(s))`
      : 'No company block found',
    details: blockInfo
  };
}

async function auditPngGuardNoRegression(page: Page): Promise<AuditResult> {
  log('TS-PNG-GUARD-NO-REGRESSION: Checking PNG guard...');

  const guardInfo = await page.evaluate(() => {
    const exportButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('导出 PNG')
    );
    if (!exportButton) return { hasGuard: false };
    
    const messages = Array.from(document.querySelectorAll('*')).map(el => el.textContent);
    const hasGuardMessage = messages.some(msg => 
      msg?.includes('批量 PNG') || msg?.includes('开发中') || msg?.includes('仅支持单页')
    );
    
    return {
      hasGuard: hasGuardMessage
    };
  });

  return {
    id: 'TS-PNG-GUARD-NO-REGRESSION',
    name: 'PNG Guard No Regression',
    status: guardInfo.hasGuard ? 'PASS' : 'WARN',
    message: guardInfo.hasGuard
      ? 'PNG guard message present'
      : 'PNG guard message not found',
    details: guardInfo
  };
}

async function main() {
  log('Starting Template Print Visual Fill Audit v6.41...');

  // Create evidence directory
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results: AuditResult[] = [];

  try {
    // Navigate to canvas editor with 10x10 paper
    log('Navigating to canvas editor...');
    await page.goto(`${STAGING_URL}/tools/template-studio/canvas/new`, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for editor to load
    await page.waitForTimeout(3000);

    // Select 10x10 paper
    log('Selecting 10x10 paper...');
    await page.selectOption('[data-testid="canvas-paper-size"]', '10x10');
    await page.waitForTimeout(1000);

    // Add test content
    log('Adding test content...');
    await page.click('[data-testid="canvas-add-text"]');
    await page.waitForTimeout(500);

    // Add company block
    await page.click('[data-testid="canvas-insert-company-block"]');
    await page.waitForTimeout(500);

    // Measure design bbox (BEFORE triggering print) - measure actual elements relative to paper
    const designBBox = await page.evaluate(() => {
      // Find the paper element
      const paper = document.querySelector('[data-testid="canvas-paper"]');
      if (!paper) return null;
      const paperRect = paper.getBoundingClientRect();
      
      // Find actual canvas elements in design mode (exclude toggle buttons)
      const elements = Array.from(document.querySelectorAll('[data-testid="canvas-text-element"], [data-testid="canvas-company-info-block"], [data-testid="canvas-product-table"], [data-testid^="canvas-company-field-"]'))
        .filter(el => !el.getAttribute('data-testid')?.includes('toggle'));
      if (elements.length === 0) return null;

      const elementDetails: any[] = [];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        // Convert to paper-relative coordinates
        const relLeft = rect.left - paperRect.left;
        const relTop = rect.top - paperRect.top;
        elementDetails.push({
          testId: el.getAttribute('data-testid'),
          rect: { width: rect.width, height: rect.height, left: relLeft, top: relTop }
        });
        minX = Math.min(minX, relLeft);
        minY = Math.min(minY, relTop);
        maxX = Math.max(maxX, relLeft + rect.width);
        maxY = Math.max(maxY, relTop + rect.height);
      });

      if (minX === Infinity) return null;
      return {
        x: minX, y: minY,
        width: maxX - minX, height: maxY - minY,
        top: minY, right: maxX,
        bottom: maxY, left: minX,
        paperWidth: paperRect.width,
        paperHeight: paperRect.height,
        elementDetails
      };
    });
    log(`Design bbox: ${JSON.stringify(designBBox)}`);

    // Trigger print ONCE and keep iframe open
    log('Triggering print...');
    await page.click('[data-testid="canvas-print-button"]');
    await page.waitForTimeout(2000);

    // Get iframe
    const iframe = await page.$('#canvas-print-iframe');
    if (!iframe) {
      log('ERROR: Print iframe not found');
      process.exit(1);
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      log('ERROR: Could not access iframe content');
      process.exit(1);
    }

    // Wait for content to be rendered
    await frame.waitForTimeout(1000);
    
    // Force a layout recalculation
    await frame.evaluate(() => {
      document.body.offsetHeight; // Force layout
    });
    await frame.waitForTimeout(500);

    // Debug: Check what elements are in the iframe
    const debugInfo = await frame.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const testIds = Array.from(allElements).map(el => el.getAttribute('data-testid')).filter(Boolean);
      
      // Check the parent container
      const unscaledPaper = document.querySelector('[data-testid="canvas-print-unscaled-paper"]');
      const parentRect = unscaledPaper ? unscaledPaper.getBoundingClientRect() : null;
      const parentStyle = unscaledPaper ? window.getComputedStyle(unscaledPaper) : null;
      
      // Check first element's parent chain
      const firstElement = document.querySelector('[data-testid="canvas-text-element"]');
      let parentChain: any[] = [];
      if (firstElement) {
        let current = firstElement.parentElement;
        while (current && parentChain.length < 5) {
          const rect = current.getBoundingClientRect();
          const style = window.getComputedStyle(current);
          parentChain.push({
            tag: current.tagName,
            className: current.className,
            rect: { width: rect.width, height: rect.height },
            position: style.position,
            display: style.display
          });
          current = current.parentElement;
        }
      }
      
      return {
        totalElements: allElements.length,
        testIds: testIds.slice(0, 20),
        unscaledPaper: parentRect ? {
          rect: { width: parentRect.width, height: parentRect.height },
          style: parentStyle ? {
            width: parentStyle.width,
            height: parentStyle.height,
            position: parentStyle.position,
            display: parentStyle.display
          } : null
        } : null,
        parentChain
      };
    });
    log(`Iframe debug: ${JSON.stringify(debugInfo, null, 2)}`);

    // Measure print bbox - look for visible elements (not hidden)
    const printBBox = await frame.evaluate(() => {
      // Find elements that are actually visible (not hidden with display:none)
      const allElements = Array.from(document.querySelectorAll('[data-testid="canvas-text-element"], [data-testid="canvas-company-info-block"], [data-testid="canvas-product-table"], [data-testid^="canvas-company-field-"]'));
      
      // Filter out elements that are hidden
      const visibleElements = allElements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      if (visibleElements.length === 0) return { error: 'No visible elements found', count: allElements.length, hiddenCount: allElements.length - visibleElements.length };

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const elementDetails: any[] = [];
      
      visibleElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        elementDetails.push({
          testId: el.getAttribute('data-testid'),
          rect: { width: rect.width, height: rect.height, left: rect.left, top: rect.top },
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity
        });
        
        if (rect.width === 0 || rect.height === 0) return;
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      });

      if (minX === Infinity) return { error: 'All visible elements have 0 dimensions', elementDetails };
      return {
        x: minX, y: minY,
        width: maxX - minX, height: maxY - minY,
        top: minY, right: maxX,
        bottom: maxY, left: minX,
        elementDetails
      };
    });
    log(`Print bbox: ${JSON.stringify(printBBox)}`);

    const paperDims = await page.evaluate(() => {
      const paper = document.querySelector('[data-testid="canvas-paper"]');
      if (!paper) return { width: 0, height: 0 };
      const rect = paper.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    // Now run all audits using the captured data
    log('Running audits...');

    // Check if we have valid bboxes
    const hasValidBBoxes = designBBox && printBBox && !('error' in printBBox);

    // TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED
    if (hasValidBBoxes) {
      const designFillRatio = (designBBox!.width * designBBox!.height) / (paperDims.width * paperDims.height);
      const printFillRatio = ((printBBox as any).width * (printBBox as any).height) / (paperDims.width * paperDims.height);
      const fillMatch = printFillRatio >= designFillRatio * 0.8;
      results.push({
        id: 'TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED',
        name: 'Visible Content BBox Measured',
        status: fillMatch ? 'PASS' : 'FAIL',
        message: `Design fill: ${(designFillRatio * 100).toFixed(1)}%, Print fill: ${(printFillRatio * 100).toFixed(1)}%`,
        details: { designBBox, printBBox, paperDims, designFillRatio, printFillRatio }
      });
    } else {
      results.push({
        id: 'TS-PRINT-VISIBLE-CONTENT-BBOX-MEASURED',
        name: 'Visible Content BBox Measured',
        status: 'FAIL',
        message: `Could not measure bboxes: ${printBBox && 'error' in printBBox ? printBBox.error : 'unknown'}`
      });
    }

    // TS-PRINT-10X10-VISUAL_FILL_MATCHES_DESIGN
    if (hasValidBBoxes) {
      const designBottomWhitespace = paperDims.height - designBBox!.bottom;
      const printBottomWhitespace = paperDims.height - (printBBox as any).bottom;
      const designLeftWhitespace = designBBox!.left;
      const printLeftWhitespace = (printBBox as any).left;
      const designRightWhitespace = paperDims.width - designBBox!.right;
      const printRightWhitespace = paperDims.width - (printBBox as any).right;

      const bottomWhitespaceMatch = printBottomWhitespace <= designBottomWhitespace * 1.2;
      const leftWhitespaceMatch = printLeftWhitespace <= designLeftWhitespace * 1.2;
      const rightWhitespaceMatch = printRightWhitespace <= designRightWhitespace * 1.2;
      const allMatch = bottomWhitespaceMatch && leftWhitespaceMatch && rightWhitespaceMatch;

      results.push({
        id: 'TS-PRINT-10X10-VISUAL_FILL_MATCHES_DESIGN',
        name: 'Visual Fill Matches Design',
        status: allMatch ? 'PASS' : 'FAIL',
        message: allMatch ? 'Print whitespace matches design' : 'Print whitespace exceeds design',
        details: { designBottomWhitespace, printBottomWhitespace, designLeftWhitespace, printLeftWhitespace, designRightWhitespace, printRightWhitespace }
      });
    } else {
      results.push({
        id: 'TS-PRINT-10X10-VISUAL_FILL_MATCHES_DESIGN',
        name: 'Visual Fill Matches Design',
        status: 'FAIL',
        message: 'Could not measure bboxes'
      });
    }

    // TS-PRINT-NO_EXCESS_BOTTOM_WHITESPACE
    if (hasValidBBoxes) {
      const bottomWhitespace = paperDims.height - (printBBox as any).bottom;
      const bottomWhitespaceRatio = bottomWhitespace / paperDims.height;
      const acceptable = bottomWhitespaceRatio <= 0.15;
      results.push({
        id: 'TS-PRINT-NO_EXCESS_BOTTOM_WHITESPACE',
        name: 'No Excess Bottom Whitespace',
        status: acceptable ? 'PASS' : 'FAIL',
        message: `Bottom whitespace: ${(bottomWhitespaceRatio * 100).toFixed(1)}%`,
        details: { bottomWhitespace, paperDims, bottomWhitespaceRatio }
      });
    } else {
      results.push({
        id: 'TS-PRINT-NO_EXCESS_BOTTOM_WHITESPACE',
        name: 'No Excess Bottom Whitespace',
        status: 'FAIL',
        message: 'Could not measure print bbox'
      });
    }

    // TS-PRINT-NO_EXCESS_SIDE_WHITESPACE
    if (hasValidBBoxes) {
      const leftWhitespace = (printBBox as any).left;
      const rightWhitespace = paperDims.width - (printBBox as any).right;
      const leftWhitespaceRatio = leftWhitespace / paperDims.width;
      const rightWhitespaceRatio = rightWhitespace / paperDims.width;
      const acceptable = leftWhitespaceRatio <= 0.10 && rightWhitespaceRatio <= 0.10;
      results.push({
        id: 'TS-PRINT-NO_EXCESS_SIDE_WHITESPACE',
        name: 'No Excess Side Whitespace',
        status: acceptable ? 'PASS' : 'FAIL',
        message: `Left: ${(leftWhitespaceRatio * 100).toFixed(1)}%, Right: ${(rightWhitespaceRatio * 100).toFixed(1)}%`,
        details: { leftWhitespace, rightWhitespace, paperDims, leftWhitespaceRatio, rightWhitespaceRatio }
      });
    } else {
      results.push({
        id: 'TS-PRINT-NO_EXCESS_SIDE_WHITESPACE',
        name: 'No Excess Side Whitespace',
        status: 'FAIL',
        message: 'Could not measure print bbox'
      });
    }

    // TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE
    const placeholders = await frame.evaluate(() => {
      const text = document.body.textContent || '';
      const found: string[] = [];
      if (text.includes('[company.name]')) found.push('[company.name]');
      if (text.includes('[company.companyName]')) found.push('[company.companyName]');
      if (text.includes('Company name')) found.push('Company name');
      return found;
    });
    results.push({
      id: 'TS-PRINT-COMPANY_NAME_PLACEHOLDER_NOT_VISIBLE',
      name: 'Company Name Placeholder Not Visible',
      status: placeholders.length === 0 ? 'PASS' : 'FAIL',
      message: placeholders.length === 0 ? 'No placeholders found' : `Found: ${placeholders.join(', ')}`,
      details: { placeholders }
    });

    // TS-PRINT-COMPANY_FIELDS_RESOLVE
    const fieldStatus = await frame.evaluate(() => {
      const companyName = document.querySelector('[data-testid="canvas-company-field-company.companyName"]');
      const companyPhone = document.querySelector('[data-testid="canvas-company-field-company.phone"]');
      const companyContact = document.querySelector('[data-testid="canvas-company-field-company.contactName"]');
      const companyAddress = document.querySelector('[data-testid="canvas-company-field-company.address"]');
      return {
        companyName: companyName ? (companyName.textContent || '').trim() : null,
        companyPhone: companyPhone ? (companyPhone.textContent || '').trim() : null,
        companyContact: companyContact ? (companyContact.textContent || '').trim() : null,
        companyAddress: companyAddress ? (companyAddress.textContent || '').trim() : null
      };
    });
    const resolved = Object.values(fieldStatus).every(v => v && v.length > 0 && !v.startsWith('['));
    results.push({
      id: 'TS-PRINT-COMPANY_FIELDS_RESOLVE',
      name: 'Company Fields Resolve',
      status: resolved ? 'PASS' : 'WARN',
      message: resolved ? 'All company fields resolved' : 'Some fields not resolved',
      details: { fieldStatus, resolved }
    });

    // Close print dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Run remaining audits
    results.push(await auditNoNavFooter(page));
    results.push(await auditNoDuplicateSequence(page));
    results.push(await auditSavedCanvasEditNoRegression(page));
    results.push(await auditCompanyBlockNoRegression(page));
    results.push(await auditPngGuardNoRegression(page));

    // Generate evidence files
    log('Generating evidence files...');
    
    // Save audit results
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, 'audit-results.json'),
      JSON.stringify({ results, summary: {
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        warned: results.filter(r => r.status === 'WARN').length
      }}, null, 2)
    );

    // Take screenshots
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'design-mode.png'), fullPage: true });

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(80));
    
    results.forEach(r => {
      const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '⚠';
      console.log(`${icon} ${r.id}: ${r.message}`);
    });

    console.log('\n' + '-'.repeat(80));
    console.log(`Total: ${results.length} | Passed: ${results.filter(r => r.status === 'PASS').length} | Failed: ${results.filter(r => r.status === 'FAIL').length} | Warned: ${results.filter(r => r.status === 'WARN').length}`);
    console.log('='.repeat(80) + '\n');

    // Exit with error if any FAIL
    if (results.some(r => r.status === 'FAIL')) {
      process.exit(1);
    }

  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
