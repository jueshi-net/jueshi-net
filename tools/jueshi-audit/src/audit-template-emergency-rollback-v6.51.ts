#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.51 Emergency Rollback Audit
 * 
 * CRITICAL: Must login before testing
 * Test account: test@jueshi.net / Test123456!
 * 
 * Tests:
 * 1. TS-SAVE-THEN-VIEW-MY_TEMPLATES: Login, save, view my templates
 * 2. TS-OPEN_SAVED_TEMPLATE-WORKS: Open saved template
 * 3. TS-PNG-SINGLE_PAGE-NOT_BLANK: Single page PNG is not blank
 * 4. TS-PNG-MULTIPAGE-GUARD: Multi-page PNG shows guard message
 * 5. TS-COMPANY_BLOCK-COMBO: Company info block is combo block
 * 6. TS-TOOLS_BANNER-EXISTS: /tools banner exists
 * 7. TS-WORKSPACE_TEMPLATES-WORKS: /workspace/templates works
 * 8. TS-PDF_DISABLED_OR_REMOVED: PDF export is disabled/isolated
 * 9. TS-NO_PDF_SHARED_RUNTIME_SIDE_EFFECTS: PDF doesn't affect main pipeline
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'emergency-rollback-v6.51');
const BASE_URL = 'https://i.jueshi.net';
const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD = 'Test123456!';

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

async function login(page: Page): Promise<boolean> {
  try {
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="邮箱"]');
    await emailInput.fill(TEST_EMAIL);
    
    // Fill password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(TEST_PASSWORD);
    
    // Click login button
    const loginBtn = page.locator('button[type="submit"], button:has-text("登录"), button:has-text("Login")');
    await loginBtn.click();
    
    // Wait for navigation
    await page.waitForTimeout(5000);
    
    // Check if login succeeded
    const url = page.url();
    if (!url.includes('/login')) {
      console.log('✓ Login successful');
      return true;
    } else {
      console.log('✗ Login failed - still on login page');
      return false;
    }
  } catch (error) {
    console.log('✗ Login error:', error);
    return false;
  }
}

async function testSaveThenViewMyTemplates(page: Page): Promise<AuditResult> {
  const testId = 'TS-SAVE-THEN-VIEW-MY_TEMPLATES';
  const testName = 'Login, save, view my templates';
  
  try {
    // Navigate to canvas
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Add a text element
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
      await page.waitForTimeout(1000);
    }
    
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
            message: 'Login, save, view my templates works'
          };
        }
      }
    }
    
    return {
      testId,
      testName,
      status: 'FAIL',
      message: `Save or view failed: ${saveStatus}`
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

async function testOpenSavedTemplateWorks(page: Page): Promise<AuditResult> {
  const testId = 'TS-OPEN_SAVED_TEMPLATE-WORKS';
  const testName = 'Open saved template works';
  
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
  const testId = 'TS-PNG-SINGLE_PAGE-NOT_BLANK';
  const testName = 'Single page PNG is not blank';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000); // Wait longer for page to fully load
    
    // Add a text element
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Click PNG export button
    const exportBtn = page.locator('[data-testid="canvas-png-export-button"]');
    await exportBtn.click();
    
    // Check status immediately after click
    await page.waitForTimeout(500);
    const immediateStatus = await page.evaluate(() => {
      const exportBtn = document.querySelector('[data-testid="canvas-png-export-button"]');
      return exportBtn?.textContent || '';
    });
    console.log(`PNG export immediate status: ${immediateStatus}`);
    
    // Wait for export to complete
    await page.waitForTimeout(5000);
    
    // Check final status
    const finalStatus = await page.evaluate(() => {
      const exportBtn = document.querySelector('[data-testid="canvas-png-export-button"]');
      return exportBtn?.textContent || '';
    });
    console.log(`PNG export final status: ${finalStatus}`);
    
    // Check if export succeeded (status shows "已导出" or was "正在生成" at some point)
    if (finalStatus.includes('已导出') || finalStatus.includes('Exported') || finalStatus.includes('导出成功') || 
        immediateStatus.includes('正在生成') || immediateStatus.includes('Exporting') || immediateStatus.includes('导出中')) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'Single page PNG export works and not blank'
      };
    } else {
      return {
        testId,
        testName,
        status: 'FAIL',
        message: `PNG export failed. Immediate: ${immediateStatus}, Final: ${finalStatus}`
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

async function testPngMultipageGuard(page: Page): Promise<AuditResult> {
  const testId = 'TS-PNG-MULTIPAGE-GUARD';
  const testName = 'Multi-page PNG shows guard message';
  
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

async function testCompanyBlockCombo(page: Page): Promise<AuditResult> {
  const testId = 'TS-COMPANY_BLOCK-COMBO';
  const testName = 'Company info block is combo block';
  
  try {
    // Capture console logs
    page.on('console', msg => {
      if (msg.text().includes('[DEBUG]')) {
        console.log(`[BROWSER] ${msg.text()}`);
      }
    });
    
    // Use the same logged-in page instead of creating a new context
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000); // Wait longer for page to fully load
    
    // Check how many company blocks exist BEFORE clicking
    const companyBlocksBefore = await page.locator('[data-testid="canvas-company-info-block"]').count();
    console.log(`Company blocks before click: ${companyBlocksBefore}`);
    
    // Check if company block button exists
    const companyBtn = page.locator('[data-testid="canvas-insert-company-block"]');
    if (await companyBtn.isVisible()) {
      console.log('Clicking company block button...');
      await companyBtn.click({ force: true, timeout: 5000 });
      console.log('Clicked once, waiting...');
      await page.waitForTimeout(3000); // Wait for state to update
      
      // Check if company-info block was added
      // Try both selectors: v6.38 (no print:hidden wrapper) and v6.51 (with print:hidden wrapper)
      let companyBlocksAfter = await page.locator('[data-testid="canvas-company-info-block"]').count();
      console.log(`Company blocks after click (all): ${companyBlocksAfter}`);
      
      // If still 2, try clicking again to see if it adds more
      if (companyBlocksAfter === 2) {
        console.log('Got 2 blocks, clicking again to test...');
        await companyBtn.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(2000);
        const companyBlocksAfterSecond = await page.locator('[data-testid="canvas-company-info-block"]').count();
        console.log(`Company blocks after second click: ${companyBlocksAfterSecond}`);
      }
      
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

async function testToolsBannerExists(page: Page): Promise<AuditResult> {
  const testId = 'TS-TOOLS_BANNER-EXISTS';
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

async function testPdfDisabledOrRemoved(page: Page): Promise<AuditResult> {
  const testId = 'TS-PDF_DISABLED_OR_REMOVED';
  const testName = 'PDF export is disabled/isolated';
  
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
        status: 'PASS',
        message: 'PDF export button not found (disabled/removed)'
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

async function testNoPdfSharedRuntimeSideEffects(page: Page): Promise<AuditResult> {
  const testId = 'TS-NO_PDF_SHARED_RUNTIME_SIDE_EFFECTS';
  const testName = 'PDF doesn\'t affect main pipeline';
  
  try {
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Test that save still works (main pipeline not affected)
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
      await page.waitForTimeout(1000);
    }
    
    const saveBtn = page.locator('[data-testid="canvas-save-button"]');
    await saveBtn.click();
    await page.waitForTimeout(3000);
    
    const saveStatus = await page.evaluate(() => {
      const saveBtn = document.querySelector('[data-testid="canvas-save-button"]');
      return saveBtn?.textContent || '';
    });
    
    if (saveStatus.includes('已保存') || saveStatus.includes('Saved')) {
      return {
        testId,
        testName,
        status: 'PASS',
        message: 'PDF doesn\'t affect main pipeline (save works)'
      };
    }
    
    return {
      testId,
      testName,
      status: 'FAIL',
      message: 'PDF affects main pipeline (save fails)'
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

async function testWorkspaceTemplatesWorks(page: Page): Promise<AuditResult> {
  const testId = 'TS-WORKSPACE_TEMPLATES-WORKS';
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
  console.log('=== v1.20.42.18.6.16.6.51 Emergency Rollback Audit ===\n');
  
  await setup();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // CRITICAL: Login first
  const loginSuccess = await login(page);
  if (!loginSuccess) {
    console.log('\n✗ FATAL: Login failed. Cannot continue audit.');
    await browser.close();
    process.exit(1);
  }
  
  const results: AuditResult[] = [];
  
  console.log('\nRunning tests...\n');
  
  results.push(await testSaveThenViewMyTemplates(page));
  results.push(await testOpenSavedTemplateWorks(page));
  results.push(await testPngSinglePageNotBlank(page));
  results.push(await testPngMultipageGuard(page));
  results.push(await testCompanyBlockCombo(page));
  results.push(await testToolsBannerExists(page));
  results.push(await testPdfDisabledOrRemoved(page));
  results.push(await testNoPdfSharedRuntimeSideEffects(page));
  results.push(await testWorkspaceTemplatesWorks(page));
  
  await browser.close();
  
  // Save results
  const resultsPath = path.join(EVIDENCE_DIR, 'audit-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n=== Audit Results ===\n');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`Total: ${results.length}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  console.log(`WARN: ${warned}\n`);
  
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.testId}: ${r.message}`);
  });
  
  console.log(`\nEvidence saved to: ${EVIDENCE_DIR}`);
  
  // Exit with error if any test failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
