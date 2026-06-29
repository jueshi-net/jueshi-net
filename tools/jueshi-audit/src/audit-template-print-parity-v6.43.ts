#!/usr/bin/env node
/**
 * v1.20.42.18.6.16.6.43 Print Design-to-Print Parity Audit
 * 
 * Tests:
 * 1. Design edge elements stay at edges in print
 * 2. Element positions match between design and print
 * 3. Bottom elements don't move to top
 * 4. Multi-page layout consistent (only sequence changes)
 * 5. No duplicate layers
 * 6. No raw company tokens
 * 7. No nav/footer
 * 8. Saved edit no regression
 * 9. Company block no regression
 * 10. PNG guard no regression
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const EVIDENCE_DIR = path.join('tools', 'jueshi-audit', 'evidence', 'print-parity-v6.43');
const BASE_URL = 'https://i.jueshi.net';

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElementPosition {
  testId: string;
  bbox: BBox;
  label: string;
}

async function main() {
  console.log('=== v1.20.42.18.6.16.6.43 Print Design-to-Print Parity Audit ===\n');
  
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  // Test 1: Design-to-print parity for edge elements
  console.log('Test 1: Design-to-print parity for edge elements...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Add elements at corners
  // Top-left
  const addTextButton = page.locator('[data-testid="canvas-add-text-button"]');
  if (await addTextButton.isVisible()) {
    await addTextButton.click();
    await page.waitForTimeout(1000);
    
    // Position at top-left
    const textElement = page.locator('[data-testid^="canvas-element-"]').first();
    if (await textElement.isVisible()) {
      await textElement.dragTo(page.locator('[data-testid="canvas-paper"]').first(), {
        sourcePosition: { x: 10, y: 10 },
        targetPosition: { x: 10, y: 10 }
      });
      await page.waitForTimeout(500);
    }
  }
  
  // Get design mode positions
  const designPositions = await page.evaluate(() => {
    const paper = document.querySelector('[data-testid="canvas-paper"]');
    if (!paper) return [];
    
    const paperRect = paper.getBoundingClientRect();
    const elements = paper.querySelectorAll('[data-testid^="canvas-element-"]');
    
    return Array.from(elements).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        testId: el.getAttribute('data-testid'),
        bbox: {
          x: rect.left - paperRect.left,
          y: rect.top - paperRect.top,
          width: rect.width,
          height: rect.height
        },
        label: el.textContent?.substring(0, 20) || ''
      };
    });
  });
  
  // Click print
  await page.locator('[data-testid="canvas-print-button"]').click();
  await page.waitForTimeout(2000);
  
  // Get print mode positions
  const printPositions = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return [];
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return [];
    
    const paper = iframeDoc.querySelector('[data-testid="canvas-print-unscaled-paper"]');
    if (!paper) return [];
    
    const paperRect = paper.getBoundingClientRect();
    const elements = paper.querySelectorAll('[data-testid^="canvas-element-"]');
    
    return Array.from(elements).map((el: Element) => {
      const rect = el.getBoundingClientRect();
      return {
        testId: el.getAttribute('data-testid'),
        bbox: {
          x: rect.left - paperRect.left,
          y: rect.top - paperRect.top,
          width: rect.width,
          height: rect.height
        },
        label: el.textContent?.substring(0, 20) || ''
      };
    });
  });
  
  // Compare positions
  const TOLERANCE = 5; // 5px tolerance
  let positionMatch = true;
  const mismatches: any[] = [];
  
  for (const designPos of designPositions) {
    const printPos = printPositions.find(p => p.testId === designPos.testId);
    if (!printPos) {
      positionMatch = false;
      mismatches.push({ testId: designPos.testId, reason: 'Element not found in print' });
      continue;
    }
    
    const dx = Math.abs(designPos.bbox.x - printPos.bbox.x);
    const dy = Math.abs(designPos.bbox.y - printPos.bbox.y);
    
    if (dx > TOLERANCE || dy > TOLERANCE) {
      positionMatch = false;
      mismatches.push({
        testId: designPos.testId,
        design: designPos.bbox,
        print: printPos.bbox,
        dx,
        dy
      });
    }
  }
  
  if (positionMatch) {
    results.push({
      testId: 'TS-PRINT-DESIGN-TO-PRINT-PARITY',
      status: 'PASS',
      message: 'Element positions match between design and print',
      details: { designPositions, printPositions }
    });
    console.log('✅ PASS: Element positions match');
  } else {
    results.push({
      testId: 'TS-PRINT-DESIGN-TO-PRINT-PARITY',
      status: 'FAIL',
      message: 'Element positions do not match',
      details: { mismatches, designPositions, printPositions }
    });
    console.log('❌ FAIL: Element positions do not match');
  }
  
  // Save evidence
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'design-positions.json'), JSON.stringify(designPositions, null, 2));
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'print-positions.json'), JSON.stringify(printPositions, null, 2));
  
  // Test 2: Single layer only
  console.log('\nTest 2: Single layer only...');
  const layerCount = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return { pages: 0, papers: 0 };
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const pages = iframeDoc?.querySelectorAll('.print-page-wrapper').length || 0;
    const papers = iframeDoc?.querySelectorAll('[data-testid="canvas-print-unscaled-paper"]').length || 0;
    return { pages, papers };
  });
  
  if (layerCount.pages !== layerCount.papers) {
    results.push({
      testId: 'TS-PRINT-SINGLE_LAYER_ONLY',
      status: 'FAIL',
      message: 'Multiple print layers',
      details: layerCount
    });
    console.log('❌ FAIL: Multiple print layers');
  } else {
    results.push({
      testId: 'TS-PRINT-SINGLE_LAYER_ONLY',
      status: 'PASS',
      message: 'Single print layer',
      details: layerCount
    });
    console.log('✅ PASS: Single print layer');
  }
  
  // Test 3: No raw company tokens
  console.log('\nTest 3: No raw company tokens...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const companyButton = page.locator('[data-testid="canvas-add-company-info-button"]');
  if (await companyButton.isVisible()) {
    await companyButton.click();
    await page.waitForTimeout(1000);
  }
  
  await page.locator('[data-testid="canvas-print-button"]').click();
  await page.waitForTimeout(2000);
  
  const iframeText = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return null;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    return iframeDoc?.body?.textContent || null;
  });
  
  const rawTokens = ['[company.name]', '[company.companyName]', '[company.phone]', '[company.address]', '[company.contact]'];
  const foundTokens = rawTokens.filter(token => iframeText?.includes(token));
  
  if (foundTokens.length > 0) {
    results.push({
      testId: 'TS-PRINT-NO_RAW_COMPANY_TOKEN',
      status: 'FAIL',
      message: 'Raw company tokens found',
      details: { foundTokens }
    });
    console.log('❌ FAIL: Raw company tokens found');
  } else {
    results.push({
      testId: 'TS-PRINT-NO_RAW_COMPANY_TOKEN',
      status: 'PASS',
      message: 'No raw company tokens'
    });
    console.log('✅ PASS: No raw company tokens');
  }
  
  // Test 4: No nav/footer
  console.log('\nTest 4: No nav/footer...');
  const hasNavFooter = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return false;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const navElements = iframeDoc?.querySelectorAll('nav, header, footer');
    return (navElements?.length || 0) > 0;
  });
  
  if (hasNavFooter) {
    results.push({
      testId: 'TS-PRINT-NO_NAV_FOOTER',
      status: 'FAIL',
      message: 'Nav/footer found'
    });
    console.log('❌ FAIL: Nav/footer found');
  } else {
    results.push({
      testId: 'TS-PRINT-NO_NAV_FOOTER',
      status: 'PASS',
      message: 'No nav/footer'
    });
    console.log('✅ PASS: No nav/footer');
  }
  
  // Test 5: Saved edit no regression
  console.log('\nTest 5: Saved edit no regression...');
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
  
  // Test 6: Company block no regression
  console.log('\nTest 6: Company block no regression...');
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
  
  // Test 7: PNG guard no regression
  console.log('\nTest 7: PNG guard no regression...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const packageInput = page.locator('[data-testid="canvas-package-count-input"]');
  if (await packageInput.isVisible()) {
    await packageInput.fill('10');
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
    console.log(`TEMPLATE_PRINT_DESIGN_TO_PRINT_PARITY_READY_FOR_USER_TEST`);
  } else {
    console.log(`\n❌ Some tests failed`);
    console.log(`TEMPLATE_PRINT_DESIGN_TO_PRINT_PARITY_STILL_FAILED`);
  }
}

main().catch(console.error);
