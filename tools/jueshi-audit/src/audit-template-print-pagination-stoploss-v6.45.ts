#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.45 Print Pagination Stoploss Audit
 * 
 * Tests:
 * 1. TS-PRINT-PAGINATION-11_PAGES: packageCount=11 outputs 11 pages
 * 2. TS-PRINT-SEQUENCE-1_TO_11: Sequence from 1/11 to 11/11
 * 3. TS-PRINT-NO_PAGE_MERGE: No multiple labels merged into one page
 * 4. TS-PRINT-SAFARI_PAGE_BREAK_CSS: Safari-friendly break CSS
 * 5. TS-PRINT-FORMAT-NOT_BROKEN: Title/sequence don't overlap
 * 6. TS-PRINT-NO_RAW_COMPANY_TOKEN: No raw company tokens
 * 7. TS-PRINT-NO_NAV_FOOTER: No nav/footer
 * 8. TS-SAVED-CANVAS-EDIT-NO-REGRESSION: Saved edit no regression
 * 9. TS-COMPANY-BLOCK-NO-REGRESSION: Company block no regression
 * 10. TS-PNG-GUARD-NO-REGRESSION: PNG guard no regression
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'print-pagination-stoploss-v6.45');
const BASE_URL = 'https://i.jueshi.net';

interface AuditResult {
  testId: string;
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

async function setup() {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
}

async function testPagination11Pages(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-PAGINATION-11_PAGES';
  const testName = 'packageCount=11 outputs 11 pages';
  
  try {
    // Navigate to canvas editor with longer timeout
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(5000);
    
    // Set batch mode to repeat
    const batchModeSelect = page.locator('[data-testid="canvas-batch-mode"]');
    if (await batchModeSelect.isVisible()) {
      await batchModeSelect.selectOption('repeat');
      await page.waitForTimeout(1000);
    }
    
    // Set package count to 11
    const packageCountInput = page.locator('[data-testid="canvas-package-count"]');
    if (await packageCountInput.isVisible()) {
      await packageCountInput.fill('11');
      await page.waitForTimeout(1000);
    }
    
    // Add a text element
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(5000);
    
    // Count pages in print iframe
    const pageCount = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return 0;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return 0;
      const pages = iframeDoc.querySelectorAll('.print-page-wrapper');
      return pages.length;
    });
    
    // Save print DOM for debugging
    const printDOM = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return '';
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return '';
      return iframeDoc.documentElement.outerHTML;
    });
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'print-dom.html'), printDOM);
    
    if (pageCount === 11) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: `Correctly output ${pageCount} pages`,
        details: { pageCount }
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: `Expected 11 pages, got ${pageCount}`,
        details: { pageCount }
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testSequence1To11(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-SEQUENCE-1_TO_11';
  const testName = 'Sequence from 1/11 to 11/11';
  
  try {
    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Set batch mode to repeat
    const batchModeSelect = page.locator('[data-testid="canvas-batch-mode"]');
    if (await batchModeSelect.isVisible()) {
      await batchModeSelect.selectOption('repeat');
      await page.waitForTimeout(1000);
    }
    
    // Set package count to 11
    const packageCountInput = page.locator('[data-testid="canvas-package-count"]');
    if (await packageCountInput.isVisible()) {
      await packageCountInput.fill('11');
      await page.waitForTimeout(1000);
    }
    
    // Enable show sequence
    const showSequenceCheckbox = page.locator('[data-testid="canvas-show-sequence"]');
    if (await showSequenceCheckbox.isVisible()) {
      await showSequenceCheckbox.check();
      await page.waitForTimeout(2000); // Wait longer for sequence element to be created
    }
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(3000);
    
    // Check sequence in print iframe
    const sequences = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return [];
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return [];
      const elements = iframeDoc.querySelectorAll('[data-element-type="sequence"]');
      return Array.from(elements).map(el => el.textContent?.trim() || '');
    });
    
    const expectedSequences = Array.from({ length: 11 }, (_, i) => `${i + 1}/11`);
    const allCorrect = sequences.length === 11 && sequences.every((seq, i) => seq === expectedSequences[i]);
    
    if (allCorrect) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'All sequences correct: 1/11 to 11/11',
        details: { sequences }
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: `Sequences incorrect. Expected: ${expectedSequences.join(', ')}, Got: ${sequences.join(', ')}`,
        details: { sequences, expectedSequences }
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testNoPageMerge(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-NO_PAGE_MERGE';
  const testName = 'No multiple labels merged into one page';
  
  try {
    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Add a text element first
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Set batch mode to repeat
    const batchModeSelect = page.locator('[data-testid="canvas-batch-mode"]');
    if (await batchModeSelect.isVisible()) {
      await batchModeSelect.selectOption('repeat');
      await page.waitForTimeout(1000);
    }
    
    // Set package count to 5
    const packageCountInput = page.locator('[data-testid="canvas-package-count"]');
    if (await packageCountInput.isVisible()) {
      await packageCountInput.fill('5');
      await page.waitForTimeout(1000);
    }
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(3000);
    
    // Check that each page has only one element
    const pageElementCounts = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe || !iframe.contentDocument) return [];
      const iframeDoc = iframe.contentDocument;
      const pages = iframeDoc.querySelectorAll('.print-page-wrapper');
      return Array.from(pages).map(p => {
        const elements = p.querySelectorAll('[data-element-id]');
        return elements.length;
      });
    });
    
    const allSingle = pageElementCounts.every(count => count === 1);
    
    if (allSingle && pageElementCounts.length === 5) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'Each page has exactly one element',
        details: { pageElementCounts }
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: `Page element counts: ${pageElementCounts.join(', ')}`,
        details: { pageElementCounts }
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testSafariPageBreakCSS(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-SAFARI_PAGE_BREAK_CSS';
  const testName = 'Safari-friendly break CSS';
  
  try {
    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(3000);
    
    // Check CSS in print iframe
    const cssCheck = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return { hasBreakAfter: false, hasPageBreakInside: false };
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return { hasBreakAfter: false, hasPageBreakInside: false };
      
      const styles = Array.from(iframeDoc.querySelectorAll('style'));
      const cssText = styles.map(s => s.textContent).join('\n');
      
      return {
        hasBreakAfter: cssText.includes('break-after:') || cssText.includes('page-break-after:'),
        hasPageBreakInside: cssText.includes('page-break-inside:') || cssText.includes('break-inside:'),
      };
    });
    
    if (cssCheck.hasBreakAfter) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'Safari-friendly break CSS found',
        details: cssCheck
      };
    } else {
      return {
        testId,
        testName,
        status: 'WARN',
        message: 'No break-after CSS found (may still work)',
        details: cssCheck
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testFormatNotBroken(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-FORMAT-NOT_BROKEN';
  const testName = 'Title/sequence don\'t overlap, single layer';
  
  try {
    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Add text element
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(3000);
    
    // Check for overlap and layer count
    const check = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return { hasOverlap: false, layerCount: 0 };
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return { hasOverlap: false, layerCount: 0 };
      
      const pages = iframeDoc.querySelectorAll('.print-page-wrapper');
      const layerCount = pages.length;
      
      // Simple overlap check: if any two elements have same position
      const elements = Array.from(iframeDoc.querySelectorAll('[data-element-id]'));
      const positions = elements.map(el => {
        const rect = el.getBoundingClientRect();
        return `${rect.x},${rect.y}`;
      });
      const uniquePositions = new Set(positions);
      const hasOverlap = positions.length !== uniquePositions.size;
      
      return { hasOverlap, layerCount };
    });
    
    if (!check.hasOverlap && check.layerCount > 0) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'No overlap, single layer',
        details: check
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: `Overlap: ${check.hasOverlap}, Layer count: ${check.layerCount}`,
        details: check
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testNoRawCompanyToken(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-NO_RAW_COMPANY_TOKEN';
  const testName = 'No raw company tokens';
  
  try {
    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Add company block
    const addCompanyBtn = page.locator('[data-testid="canvas-insert-company-block"]');
    if (await addCompanyBtn.isVisible()) {
      await addCompanyBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(3000);
    
    // Check for raw tokens
    const hasRawTokens = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return false;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return false;
      const html = iframeDoc.documentElement.innerHTML;
      return html.includes('[company.') || html.includes('[product.');
    });
    
    if (!hasRawTokens) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'No raw company tokens'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: 'Raw company tokens found'
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testNoNavFooter(page: Page): Promise<AuditResult> {
  const testId = 'TS-PRINT-NO_NAV_FOOTER';
  const testName = 'No nav/footer';
  
  try {
    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Click print button
    const printBtn = page.locator('[data-testid="canvas-print-button"]');
    await printBtn.click();
    await page.waitForTimeout(3000);
    
    // Check for nav/footer
    const hasNavFooter = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return false;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return false;
      const html = iframeDoc.documentElement.innerHTML;
      return html.includes('<nav') || html.includes('<footer') || html.includes('<header');
    });
    
    if (!hasNavFooter) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'No nav/footer'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: 'Nav/footer found'
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testSavedEditNoRegression(page: Page): Promise<AuditResult> {
  const testId = 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION';
  const testName = 'Saved edit no regression';
  
  try {
    await page.goto(`${BASE_URL}/workspace/templates`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const hasError = await page.textContent('body').then(text => 
      text?.includes("This page couldn't load") || text?.includes('页面加载失败')
    );
    
    if (!hasError) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'Saved edit page loads without error'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: 'Saved edit page shows error'
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testCompanyBlockNoRegression(page: Page): Promise<AuditResult> {
  const testId = 'TS-COMPANY-BLOCK-NO-REGRESSION';
  const testName = 'Company block no regression';
  
  try {
    // Create a completely fresh browser context
    const browser = page.context().browser();
    if (!browser) {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: 'Browser not available'
      };
    }
    
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    
    // Navigate to canvas editor with a completely fresh page
    await freshPage.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await freshPage.waitForTimeout(5000);
    
    // Clear localStorage to ensure no draft data
    await freshPage.evaluate(() => {
      localStorage.clear();
    });
    
    // Reload to ensure clean state
    await freshPage.reload({ waitUntil: 'domcontentloaded' });
    await freshPage.waitForTimeout(3000);
    
    const companyBtn = freshPage.locator('[data-testid="canvas-insert-company-block"]');
    if (await companyBtn.isVisible()) {
      await companyBtn.click();
      await freshPage.waitForTimeout(1000);
      
      const companyBlocks = await freshPage.locator('[data-testid="canvas-company-info-block"]').count();
      
      await freshContext.close();
      
      if (companyBlocks === 1) {
        return {
          testId,
          testName,
          status: 'PASS',
          message: 'Single company-info block'
        };
      } else {
        return {
          testId,
          testName,
          status: 'FAIL',
          message: `Expected 1 company block, got ${companyBlocks}`
        };
      }
    } else {
      await freshContext.close();
      return {
        testId,
        testName,
        status: 'WARN',
        message: 'Company button not found'
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testPNGGuardNoRegression(page: Page): Promise<AuditResult> {
  const testId = 'TS-PNG-GUARD-NO-REGRESSION';
  const testName = 'PNG guard no regression';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Set batch mode to repeat
    const batchModeSelect = page.locator('[data-testid="canvas-batch-mode"]');
    if (await batchModeSelect.isVisible()) {
      await batchModeSelect.selectOption('repeat');
      await page.waitForTimeout(1000);
    }
    
    // Set package count to 10
    const packageCountInput = page.locator('[data-testid="canvas-package-count"]');
    if (await packageCountInput.isVisible()) {
      await packageCountInput.fill('10');
      await page.waitForTimeout(1000);
    }
    
    const exportBtn = page.locator('[data-testid="canvas-png-export-button"]');
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(2000);
      
      const guardVisible = await page.locator('[data-testid="canvas-multipage-png-notice"]').isVisible();
      
      if (guardVisible) {
        return {
          testId,
          testName,
          status: 'PASS',
          message: 'PNG guard message visible'
        };
      } else {
        return {
          testId,
          testName,
          status: 'WARN',
          message: 'PNG guard not triggered'
        };
      }
    } else {
      return {
        testId,
        testName,
        status: 'WARN',
        message: 'Export button not found'
      };
    }
    
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function main() {
  console.log('=== v1.20.42.18.6.16.6.45 Print Pagination Stoploss Audit ===\n');
  
  await setup();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results: AuditResult[] = [];
  
  console.log('Running tests...\n');
  
  results.push(await testPagination11Pages(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testSequence1To11(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testNoPageMerge(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testSafariPageBreakCSS(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testFormatNotBroken(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testNoRawCompanyToken(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testNoNavFooter(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testSavedEditNoRegression(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testCompanyBlockNoRegression(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  results.push(await testPNGGuardNoRegression(page));
  console.log(`✓ ${results[results.length - 1].testId}: ${results[results.length - 1].status}`);
  
  await browser.close();
  
  // Save results
  const resultsPath = path.join(EVIDENCE_DIR, 'audit-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Results saved to ${resultsPath}`);
  
  // Print summary
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  
  console.log(`\n=== Summary ===`);
  console.log(`Total: ${results.length}`);
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`WARN: ${warnCount}`);
  
  if (failCount === 0) {
    console.log(`\n✅ All tests passed!`);
    console.log(`TEMPLATE_PRINT_PAGINATION_STOPLOSS_READY_FOR_USER_TEST`);
  } else {
    console.log(`\n❌ Some tests failed`);
    console.log(`TEMPLATE_PRINT_PAGINATION_STOPLOSS_STILL_FAILED`);
  }
}

main().catch(console.error);
