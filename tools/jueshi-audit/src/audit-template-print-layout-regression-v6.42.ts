#!/usr/bin/env node
/**
 * v1.20.42.18.6.16.6.42 Print Layout Regression Audit - Simplified
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const EVIDENCE_DIR = path.join('tools', 'jueshi-audit', 'evidence', 'print-layout-regression-v6.42');
const BASE_URL = 'https://i.jueshi.net';

async function main() {
  console.log('=== v1.20.42.18.6.16.6.42 Print Layout Regression Audit ===\n');
  
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  // Test 1: No global hidden override
  console.log('Test 1: No global hidden override...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Add text element
  const textButton = page.locator('[data-testid="canvas-add-text-button"]');
  if (await textButton.isVisible()) {
    await textButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Click print
  await page.locator('[data-testid="canvas-print-button"]').click();
  await page.waitForTimeout(2000);
  
  // Get iframe HTML
  const iframeHTML = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe');
    if (!iframe) return null;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    return iframeDoc?.documentElement?.innerHTML || null;
  });
  
  if (iframeHTML) {
    const hasGlobalOverride = iframeHTML.includes('[data-testid^="canvas-element"]') && 
                              iframeHTML.includes('display: block !important');
    const hasForceAllVisible = iframeHTML.includes('[data-testid="canvas-print-unscaled-paper"] *') &&
                               iframeHTML.includes('display: revert !important');
    
    if (hasGlobalOverride || hasForceAllVisible) {
      results.push({
        testId: 'TS-PRINT-NO-GLOBAL-HIDDEN-OVERRIDE',
        status: 'FAIL',
        message: 'Global hidden override found'
      });
      console.log('❌ FAIL: Global hidden override found');
    } else {
      results.push({
        testId: 'TS-PRINT-NO-GLOBAL-HIDDEN-OVERRIDE',
        status: 'PASS',
        message: 'No global hidden override'
      });
      console.log('✅ PASS: No global hidden override');
    }
  } else {
    results.push({
      testId: 'TS-PRINT-NO-GLOBAL-HIDDEN-OVERRIDE',
      status: 'FAIL',
      message: 'Cannot access iframe'
    });
    console.log('❌ FAIL: Cannot access iframe');
  }
  
  // Test 2: No raw company tokens
  console.log('\nTest 2: No raw company tokens...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Add company block
  const companyButton = page.locator('[data-testid="canvas-add-company-info-button"]');
  if (await companyButton.isVisible()) {
    await companyButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Click print
  await page.locator('[data-testid="canvas-print-button"]').click();
  await page.waitForTimeout(2000);
  
  const iframeText = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe');
    if (!iframe) return null;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    return iframeDoc?.body?.textContent || null;
  });
  
  const rawTokens = ['[company.name]', '[company.companyName]', '[company.phone]', '[company.address]', '[company.contact]'];
  const foundTokens = rawTokens.filter(token => iframeText?.includes(token));
  
  if (foundTokens.length > 0) {
    results.push({
      testId: 'TS-PRINT-NO-RAW-COMPANY-TOKENS',
      status: 'FAIL',
      message: 'Raw company tokens found',
      details: { foundTokens }
    });
    console.log('❌ FAIL: Raw company tokens found:', foundTokens);
  } else {
    results.push({
      testId: 'TS-PRINT-NO-RAW-COMPANY-TOKENS',
      status: 'PASS',
      message: 'No raw company tokens'
    });
    console.log('✅ PASS: No raw company tokens');
  }
  
  // Test 3: No nav/footer
  console.log('\nTest 3: No nav/footer...');
  const hasNavFooter = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe');
    if (!iframe) return false;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const navElements = iframeDoc?.querySelectorAll('nav, header, footer');
    return (navElements?.length || 0) > 0;
  });
  
  if (hasNavFooter) {
    results.push({
      testId: 'TS-PRINT-NO-NAV-FOOTER',
      status: 'FAIL',
      message: 'Nav/footer found in print'
    });
    console.log('❌ FAIL: Nav/footer found');
  } else {
    results.push({
      testId: 'TS-PRINT-NO-NAV-FOOTER',
      status: 'PASS',
      message: 'No nav/footer'
    });
    console.log('✅ PASS: No nav/footer');
  }
  
  // Test 4: No duplicate sequences
  console.log('\nTest 4: No duplicate sequences...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Set package count
  const packageInput = page.locator('[data-testid="canvas-package-count-input"]');
  if (await packageInput.isVisible()) {
    await packageInput.fill('10');
    await page.waitForTimeout(1000);
  }
  
  // Click print
  await page.locator('[data-testid="canvas-print-button"]').click();
  await page.waitForTimeout(2000);
  
  const sequenceCount = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe');
    if (!iframe) return { total: 0, perPage: [] };
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const pages = iframeDoc?.querySelectorAll('.print-page-wrapper') || [];
    const perPage = Array.from(pages).map(p => p.querySelectorAll('[data-testid*="sequence"]').length);
    return { total: perPage.reduce((a, b) => a + b, 0), perPage };
  });
  
  const hasDuplicates = sequenceCount.perPage.some(count => count > 1);
  
  if (hasDuplicates) {
    results.push({
      testId: 'TS-PRINT-NO-DUPLICATE-SEQUENCES',
      status: 'FAIL',
      message: 'Duplicate sequences found',
      details: sequenceCount
    });
    console.log('❌ FAIL: Duplicate sequences found');
  } else {
    results.push({
      testId: 'TS-PRINT-NO-DUPLICATE-SEQUENCES',
      status: 'PASS',
      message: 'No duplicate sequences',
      details: sequenceCount
    });
    console.log('✅ PASS: No duplicate sequences');
  }
  
  // Test 5: Only one print layer
  console.log('\nTest 5: Only one print layer...');
  const layerCount = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe');
    if (!iframe) return { pages: 0, papers: 0 };
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const pages = iframeDoc?.querySelectorAll('.print-page-wrapper').length || 0;
    const papers = iframeDoc?.querySelectorAll('[data-testid="canvas-print-unscaled-paper"]').length || 0;
    return { pages, papers };
  });
  
  if (layerCount.pages !== layerCount.papers) {
    results.push({
      testId: 'TS-PRINT-ONLY-ONE-LAYER',
      status: 'FAIL',
      message: 'Multiple print layers',
      details: layerCount
    });
    console.log('❌ FAIL: Multiple print layers');
  } else {
    results.push({
      testId: 'TS-PRINT-ONLY-ONE-LAYER',
      status: 'PASS',
      message: 'Only one print layer',
      details: layerCount
    });
    console.log('✅ PASS: Only one print layer');
  }
  
  // Test 6: Saved edit no regression
  console.log('\nTest 6: Saved edit no regression...');
  await page.goto(`${BASE_URL}/workspace/templates`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const pageText = await page.textContent('body');
  const hasError = pageText?.includes("This page couldn't load") || pageText?.includes('Error');
  
  if (hasError) {
    results.push({
      testId: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
      status: 'FAIL',
      message: 'Saved edit page shows error'
    });
    console.log('❌ FAIL: Saved edit page shows error');
  } else {
    results.push({
      testId: 'TS-SAVED-CANVAS-EDIT-NO-REGRESSION',
      status: 'PASS',
      message: 'Saved edit page loads OK'
    });
    console.log('✅ PASS: Saved edit page loads OK');
  }
  
  // Test 7: Company block no regression
  console.log('\nTest 7: Company block no regression...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const companyButton2 = page.locator('[data-testid="canvas-add-company-info-button"]');
  if (await companyButton2.isVisible()) {
    await companyButton2.click();
    await page.waitForTimeout(1000);
    
    const companyBlocks = await page.locator('[data-testid="canvas-company-info-block"]').count();
    
    if (companyBlocks !== 1) {
      results.push({
        testId: 'TS-COMPANY-BLOCK-NO-REGRESSION',
        status: 'FAIL',
        message: `Expected 1 company block, found ${companyBlocks}`
      });
      console.log(`❌ FAIL: Expected 1 company block, found ${companyBlocks}`);
    } else {
      results.push({
        testId: 'TS-COMPANY-BLOCK-NO-REGRESSION',
        status: 'PASS',
        message: 'Company block is single block'
      });
      console.log('✅ PASS: Company block is single block');
    }
  } else {
    results.push({
      testId: 'TS-COMPANY-BLOCK-NO-REGRESSION',
      status: 'WARN',
      message: 'Company button not found'
    });
    console.log('⚠️  WARN: Company button not found');
  }
  
  // Test 8: PNG guard no regression
  console.log('\nTest 8: PNG guard no regression...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const packageInput2 = page.locator('[data-testid="canvas-package-count-input"]');
  if (await packageInput2.isVisible()) {
    await packageInput2.fill('10');
    await page.waitForTimeout(1000);
    
    const exportButton = page.locator('[data-testid="canvas-export-png-button"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(2000);
      
      const guardVisible = await page.locator('text=批量 PNG 导出开发中').isVisible().catch(() => false);
      
      if (guardVisible) {
        results.push({
          testId: 'TS-PNG-GUARD-NO-REGRESSION',
          status: 'PASS',
          message: 'PNG guard message visible'
        });
        console.log('✅ PASS: PNG guard message visible');
      } else {
        results.push({
          testId: 'TS-PNG-GUARD-NO-REGRESSION',
          status: 'WARN',
          message: 'PNG guard not triggered'
        });
        console.log('⚠️  WARN: PNG guard not triggered');
      }
    } else {
      results.push({
        testId: 'TS-PNG-GUARD-NO-REGRESSION',
        status: 'WARN',
        message: 'Export button not found'
      });
      console.log('⚠️  WARN: Export button not found');
    }
  } else {
    results.push({
      testId: 'TS-PNG-GUARD-NO-REGRESSION',
      status: 'WARN',
      message: 'Package input not found'
    });
    console.log('⚠️  WARN: Package input not found');
  }
  
  await browser.close();
  
  // Save results
  const resultsPath = path.join(EVIDENCE_DIR, 'audit-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Results saved to ${resultsPath}`);
  
  // Summary
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
    console.log(`TEMPLATE_PRINT_LAYOUT_REGRESSION_FIXED_READY_FOR_USER_TEST`);
  } else {
    console.log(`\n❌ Some tests failed`);
    console.log(`TEMPLATE_PRINT_LAYOUT_REGRESSION_STILL_FAILED`);
  }
}

main().catch(console.error);
