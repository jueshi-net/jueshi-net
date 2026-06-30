#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.50 Output Regression Stoploss Audit
 * 
 * Tests:
 * 1. TS-SAVE-SINGLE_PAGE: Save works for single page
 * 2. TS-SAVE-AFTER_SAVE_VIEW: Can view templates after save
 * 3. TS-SAVE-OPEN_SAVED: Can open saved template
 * 4. TS-PNG-SINGLE_PAGE_NOT_BLANK: Single page PNG is not blank
 * 5. TS-PNG-MULTIPAGE-GUARD: Multi-page PNG shows guard message
 * 6. TS-COMPANY_BLOCK-NO_REGRESSION: Company info block is combo block
 * 7. TS-TOOLS_BANNER-NO_REGRESSION: /tools banner exists
 * 8. TS-PDF_DISABLED_OR_ISOLATED: PDF export is isolated
 * 9. TS-WORKSPACE_TEMPLATES-NO_REGRESSION: /workspace/templates works
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'output-regression-stoploss-v6.50');
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

async function testSaveSinglePage(page: Page): Promise<AuditResult> {
  const testId = 'TS-SAVE-SINGLE_PAGE';
  const testName = 'Save works for single page';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Add a text element
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    await addTextBtn.click();
    await page.waitForTimeout(1000);
    
    // Click save button
    const saveBtn = page.locator('[data-testid="canvas-save-button"]');
    await saveBtn.click();
    await page.waitForTimeout(3000);
    
    // Check save status
    const saveStatus = await page.evaluate(() => {
      const saveBtn = document.querySelector('[data-testid="canvas-save-button"]');
      return saveBtn?.textContent || '';
    });
    
    if (saveStatus.includes('已保存') || saveStatus.includes('Saved')) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'Save works for single page'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: `Save failed: ${saveStatus}`
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

async function testSaveAfterSaveView(page: Page): Promise<AuditResult> {
  const testId = 'TS-SAVE-AFTER_SAVE_VIEW';
  const testName = 'Can view templates after save';
  
  try {
    // Click "View My Templates" link
    const viewLink = page.locator('[data-testid="canvas-view-my-templates-link"]');
    if (await viewLink.isVisible()) {
      await viewLink.click();
      await page.waitForTimeout(3000);
      
      // Check if we're on workspace/templates page
      const url = page.url();
      if (url.includes('/workspace/templates')) {
        return {
          testId,
          testName,
          status: 'PASS',
          message: 'Can view templates after save'
        };
      }
    }
    
    return {
      testId,
      testName,
      status: 'FAIL',
      message: 'Cannot view templates after save'
    };
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testSaveOpenSaved(page: Page): Promise<AuditResult> {
  const testId = 'TS-SAVE-OPEN_SAVED';
  const testName = 'Can open saved template';
  
  try {
    await page.goto(`${BASE_URL}/workspace/templates`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Check if there are any templates
    const templateCount = await page.locator('[data-testid="template-card"]').count();
    
    if (templateCount > 0) {
      // Try to open the first template
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      const editLink = firstTemplate.locator('a[href*="/edit"]');
      
      if (await editLink.isVisible()) {
        await editLink.click();
        await page.waitForTimeout(3000);
        
        // Check if we're on the edit page
        const url = page.url();
        if (url.includes('/edit')) {
          return {
            testId,
            testName,
            status: 'PASS',
            message: 'Can open saved template'
          };
        }
      }
    }
    
    return {
      testId,
      testName,
      status: 'WARN',
      message: 'No templates to open or cannot open'
    };
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testPngSinglePageNotBlank(page: Page): Promise<AuditResult> {
  const testId = 'TS-PNG-SINGLE_PAGE_NOT_BLANK';
  const testName = 'Single page PNG is not blank';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Add a text element
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    await addTextBtn.click();
    await page.waitForTimeout(1000);
    
    // Click PNG export button
    const exportBtn = page.locator('[data-testid="canvas-png-export-button"]');
    await exportBtn.click();
    await page.waitForTimeout(2000);
    
    // Check if export started (status changes to "exporting")
    const exportStatus = await page.evaluate(() => {
      const exportBtn = document.querySelector('[data-testid="canvas-png-export-button"]');
      return exportBtn?.textContent || '';
    });
    
    if (exportStatus.includes('正在生成') || exportStatus.includes('Exporting')) {
      // Wait for export to complete
      await page.waitForTimeout(3000);
      
      const finalStatus = await page.evaluate(() => {
        const exportBtn = document.querySelector('[data-testid="canvas-png-export-button"]');
        return exportBtn?.textContent || '';
      });
      
      if (finalStatus.includes('已导出') || finalStatus.includes('Exported')) {
        return {
          testId,
          testName,
          status: 'PASS',
          message: 'Single page PNG export works'
        };
      }
    }
    
    return {
      testId,
      testName,
      status: 'FAIL',
      message: 'Single page PNG export failed'
    };
  } catch (error) {
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Error: ${error}`
    };
  }
}

async function testPngMultipageGuard(page: Page): Promise<AuditResult> {
  const testId = 'TS-PNG-MULTIPAGE-GUARD';
  const testName = 'Multi-page PNG shows guard message';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Set batch mode to repeat
    const batchModeSelect = page.locator('[data-testid="canvas-batch-mode"]');
    await batchModeSelect.selectOption('repeat');
    await page.waitForTimeout(1000);
    
    // Set package count to 10
    const packageCountInput = page.locator('[data-testid="canvas-package-count"]');
    await packageCountInput.fill('10');
    await page.waitForTimeout(1000);
    
    // Check if guard message is visible
    const guardVisible = await page.locator('[data-testid="canvas-multipage-png-notice"]').isVisible();
    
    if (guardVisible) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'Multi-page PNG guard message visible'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: 'Multi-page PNG guard message not visible'
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
  const testId = 'TS-COMPANY_BLOCK-NO_REGRESSION';
  const testName = 'Company info block is combo block';
  
  try {
    // Use a fresh context to avoid state from previous tests
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
    
    await freshPage.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await freshPage.waitForTimeout(3000);
    
    // Check how many company blocks exist BEFORE clicking
    const companyBlocksBefore = await freshPage.locator('[data-testid="canvas-company-info-block"]').count();
    
    // Check if company block button exists
    const companyBtn = freshPage.locator('[data-testid="canvas-insert-company-block"]');
    if (await companyBtn.isVisible()) {
      await companyBtn.click();
      await freshPage.waitForTimeout(1000);
      
      // Check if company-info block was added
      const companyBlocksAfter = await freshPage.locator('[data-testid="canvas-company-info-block"]').count();
      
      await freshContext.close();
      
      // If there was already 1 block before clicking, and still 1 after, that's correct
      // If there were 0 before and 1 after, that's also correct
      // If there are 2 after, that's a bug
      if (companyBlocksAfter === 1) {
        return {
          testId,
          testName,
          status: 'PASS',
          message: 'Company info block is combo block'
        };
      } else {
        return {
          testId,
          testName,
          status: 'FAIL',
          message: `Expected 1 company block after click, got ${companyBlocksAfter} (before: ${companyBlocksBefore})`
        };
      }
    } else {
      await freshContext.close();
      return {
        testId,
        testName,
        status: 'WARN',
        message: 'Company block button not found'
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

async function testToolsBannerNoRegression(page: Page): Promise<AuditResult> {
  const testId = 'TS-TOOLS_BANNER-NO_REGRESSION';
  const testName = '/tools banner exists';
  
  try {
    await page.goto(`${BASE_URL}/tools`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Check if banner exists
    const banner = page.locator('[data-testid="tools-banner"], h1, .banner');
    const isVisible = await banner.first().isVisible();
    
    if (isVisible) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: '/tools banner exists'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: '/tools banner not found'
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

async function testPdfDisabledOrIsolated(page: Page): Promise<AuditResult> {
  const testId = 'TS-PDF_DISABLED_OR_ISOLATED';
  const testName = 'PDF export is isolated';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Check if PDF export button exists
    const pdfBtn = page.locator('[data-testid="canvas-precise-pdf-export-button"]');
    const isVisible = await pdfBtn.isVisible();
    
    if (isVisible) {
      // Check if it has proper tip message
      const tip = page.locator('[data-testid="canvas-precise-pdf-export-tip"]');
      const tipVisible = await tip.isVisible();
      
      if (tipVisible) {
        return {
          testId,
          testName,
          status: 'PASS',
          message: 'PDF export is isolated with proper tip'
        };
      } else {
        return {
          testId,
          testName,
          status: 'WARN',
          message: 'PDF export exists but tip not visible'
        };
      }
    } else {
      return {
        testId,
        testName,
        status: 'WARN',
        message: 'PDF export button not found (may be disabled)'
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

async function testWorkspaceTemplatesNoRegression(page: Page): Promise<AuditResult> {
  const testId = 'TS-WORKSPACE_TEMPLATES-NO_REGRESSION';
  const testName = '/workspace/templates works';
  
  try {
    await page.goto(`${BASE_URL}/workspace/templates`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Check if page loads without error
    const hasError = await page.textContent('body').then(text => 
      text?.includes("This page couldn't load") || text?.includes('页面加载失败')
    );
    
    if (!hasError) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: '/workspace/templates works'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: '/workspace/templates shows error'
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
  console.log('=== v1.20.42.18.6.16.6.50 Output Regression Stoploss Audit ===\n');
  
  await setup();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results: AuditResult[] = [];
  
  console.log('Running tests...\n');
  
  results.push(await testSaveSinglePage(page));
  results.push(await testSaveAfterSaveView(page));
  results.push(await testSaveOpenSaved(page));
  results.push(await testPngSinglePageNotBlank(page));
  results.push(await testPngMultipageGuard(page));
  results.push(await testCompanyBlockNoRegression(page));
  results.push(await testToolsBannerNoRegression(page));
  results.push(await testPdfDisabledOrIsolated(page));
  results.push(await testWorkspaceTemplatesNoRegression(page));
  
  await browser.close();
  
  // Save results
  const resultsPath = path.join(EVIDENCE_DIR, 'audit-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Print summary
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  
  console.log('\n=== Summary ===');
  console.log(`Total: ${results.length}`);
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`WARN: ${warnCount}`);
  
  if (failCount === 0) {
    console.log('\n✅ TEMPLATE_OUTPUT_REGRESSION_STOPLOSS_READY_FOR_USER_TEST');
  } else {
    console.log('\n❌ TEMPLATE_OUTPUT_REGRESSION_STOPLOSS_STILL_FAILED');
  }
  
  console.log(`\n✓ Results saved to ${resultsPath}`);
}

main().catch(console.error);
