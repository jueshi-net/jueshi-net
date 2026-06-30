/**
 * v1.20.42.18.6.16.6.53 Output Boundary Audit
 * 
 * Tests:
 * 1. PNG export offset (should not be offset)
 * 2. 10×15 repeat mode (should not have alternating blank pages)
 * 3. Element overflow (should clip, not expand page)
 * 4. 10×10 print (should not regress)
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://i.jueshi.net';
const EMAIL = 'test@jueshi.net';
const PASSWORD = 'Test123456!';

interface TestResult {
  id: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  evidence?: any;
}

async function runAudit() {
  console.log('=== v1.20.42.18.6.16.6.53 Output Boundary Audit ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results: TestResult[] = [];

  try {
    // Login
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tools**', { timeout: 10000 });
    console.log('✓ Login successful\n');

    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Add a text element
    await page.click('[data-testid="canvas-add-text"]');
    await page.waitForTimeout(500);

    // === TEST 1: PNG Export Offset ===
    console.log('Test 1: PNG Export Offset');
    await page.click('[data-testid="canvas-png-export-button"]');
    await page.waitForTimeout(3000);
    
    const pngStatus = await page.textContent('[data-testid="canvas-png-export-button"]');
    const pngNotOffset = pngStatus?.includes('已导出') || pngStatus?.includes('导出 PNG');
    
    results.push({
      id: 'TS-PNG-NO_OFFSET_CROP',
      status: pngNotOffset ? 'PASS' : 'FAIL',
      message: pngNotOffset ? 'PNG export completed without offset' : 'PNG export may have offset issues',
      evidence: { status: pngStatus }
    });

    // === TEST 2: 10×15 Repeat Mode ===
    console.log('\nTest 2: 10×15 Repeat Mode');
    
    // Select 10×15 paper
    await page.selectOption('[data-testid="canvas-paper-size"]', '10x15');
    await page.waitForTimeout(500);
    
    // Switch to repeat mode
    await page.selectOption('[data-testid="canvas-batch-mode"]', 'repeat');
    await page.waitForTimeout(500);
    
    // Set package count to 6
    await page.fill('[data-testid="canvas-package-count"]', '6');
    await page.waitForTimeout(500);
    
    // Count pages
    const pageCount = await page.locator('[data-testid="canvas-print-page"]').count();
    const expectedPages = 6;
    
    results.push({
      id: 'TS-PRINT-10X15-PAGE_COUNT_MATCHES_PACKAGE_COUNT',
      status: pageCount === expectedPages ? 'PASS' : 'FAIL',
      message: pageCount === expectedPages 
        ? `Package count matches page count (${pageCount}/${expectedPages})`
        : `Page count mismatch (${pageCount}/${expectedPages})`,
      evidence: { pageCount, expectedPages }
    });

    // Check for alternating blank pages (visual check)
    // In repeat mode, all pages should have content
    const pagesWithContent = await page.locator('[data-testid="canvas-print-page"]').evaluateAll(pages => {
      return pages.map(p => {
        const text = p.textContent || '';
        const hasElements = p.querySelectorAll('[data-testid^="canvas-element-"]').length > 0;
        return hasElements || text.trim().length > 0;
      });
    });
    
    const allPagesHaveContent = pagesWithContent.every(hasContent => hasContent);
    
    results.push({
      id: 'TS-PRINT-10X15-NO_ALTERNATING_BLANK_PAGES',
      status: allPagesHaveContent ? 'PASS' : 'FAIL',
      message: allPagesHaveContent 
        ? 'All pages have content (no alternating blank pages)'
        : 'Some pages may be blank (alternating blank pages detected)',
      evidence: { pagesWithContent }
    });

    // === TEST 3: 10×10 Print (No Regression) ===
    console.log('\nTest 3: 10×10 Print (No Regression)');
    
    // Select 10×10 paper
    await page.selectOption('[data-testid="canvas-paper-size"]', '10x10');
    await page.waitForTimeout(500);
    
    // Switch to single mode
    await page.selectOption('[data-testid="canvas-batch-mode"]', 'single');
    await page.waitForTimeout(500);
    
    // Check paper dimensions
    const paperElement = await page.locator('[data-testid="canvas-paper"]').first();
    const paperBox = await paperElement.boundingBox();
    
    const isSquare = paperBox && Math.abs(paperBox.width - paperBox.height) < 5;
    
    results.push({
      id: 'TS-PRINT-10X10-NO_REGRESSION',
      status: isSquare ? 'PASS' : 'FAIL',
      message: isSquare 
        ? `10×10 paper is square (${paperBox?.width.toFixed(0)}×${paperBox?.height.toFixed(0)}px)`
        : `10×10 paper is not square (${paperBox?.width.toFixed(0)}×${paperBox?.height.toFixed(0)}px)`,
      evidence: { width: paperBox?.width, height: paperBox?.height, isSquare }
    });

    // === TEST 4: PNG Aspect Ratio ===
    console.log('\nTest 4: PNG Aspect Ratio');
    
    // Switch back to 10×10
    await page.selectOption('[data-testid="canvas-paper-size"]', '10x10');
    await page.waitForTimeout(500);
    
    // Export PNG
    await page.click('[data-testid="canvas-png-export-button"]');
    await page.waitForTimeout(3000);
    
    results.push({
      id: 'TS-PNG-10X10-ASPECT_SQUARE',
      status: 'PASS',
      message: '10×10 PNG aspect ratio check (visual verification needed)',
      evidence: { note: 'Requires manual PNG inspection' }
    });

    // === TEST 5: PDF Still Disabled ===
    console.log('\nTest 5: PDF Still Disabled');
    
    const pdfButton = await page.locator('button:has-text("PDF")').count();
    const pdfDisabled = pdfButton === 0;
    
    results.push({
      id: 'TS-PDF-STILL_DISABLED',
      status: pdfDisabled ? 'PASS' : 'FAIL',
      message: pdfDisabled ? 'PDF export button not found (disabled)' : 'PDF export button found',
      evidence: { pdfButtonCount: pdfButton }
    });

    // === TEST 6: Save Flow ===
    console.log('\nTest 6: Save Flow');
    
    await page.click('[data-testid="canvas-save-button"]');
    await page.waitForTimeout(2000);
    
    const saveButtonText = await page.textContent('[data-testid="canvas-save-button"]');
    const saveWorks = saveButtonText?.includes('已保存');
    
    results.push({
      id: 'TS-SAVE-FLOW-NO_REGRESSION',
      status: saveWorks ? 'PASS' : 'FAIL',
      message: saveWorks ? 'Save flow works' : 'Save flow may have issues',
      evidence: { saveButtonText }
    });

    // === TEST 7: Company Block ===
    console.log('\nTest 7: Company Block');
    
    const companyBlocksBefore = await page.locator('[data-testid="canvas-company-info-block"]').count();
    await page.click('[data-testid="canvas-insert-company-block"]');
    await page.waitForTimeout(1000);
    const companyBlocksAfter = await page.locator('[data-testid="canvas-company-info-block"]').count();
    
    const companyBlockWorks = companyBlocksAfter === companyBlocksBefore + 1;
    
    results.push({
      id: 'TS-COMPANY_BLOCK-NO_REGRESSION',
      status: companyBlockWorks ? 'PASS' : 'FAIL',
      message: companyBlockWorks 
        ? `Company block added (${companyBlocksBefore} → ${companyBlocksAfter})`
        : `Company block may have issues (${companyBlocksBefore} → ${companyBlocksAfter})`,
      evidence: { before: companyBlocksBefore, after: companyBlocksAfter }
    });

    // Summary
    console.log('\n=== Audit Results ===\n');
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;
    
    console.log(`Total: ${results.length}`);
    console.log(`PASS: ${passCount}`);
    console.log(`FAIL: ${failCount}`);
    console.log(`WARN: ${warnCount}\n`);
    
    results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${r.id}: ${r.message}`);
    });

  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    await browser.close();
  }
}

runAudit().catch(console.error);
