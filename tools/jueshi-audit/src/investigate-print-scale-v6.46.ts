#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.46 Print Scale Investigation
 * 
 * Investigate why print output is smaller than design canvas
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'print-scale-v6.46');
const BASE_URL = 'https://i.jueshi.net';

async function main() {
  console.log('=== Print Scale Investigation ===\n');
  
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to canvas editor
  console.log('Navigating to canvas editor...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Set paper size to 10x10
  const paperSelect = page.locator('[data-testid="canvas-paper-size"]');
  await paperSelect.selectOption('10x10');
  await page.waitForTimeout(1000);
  
  // Add a text element
  const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
  await addTextBtn.click();
  await page.waitForTimeout(1000);
  
  // Get paper dimensions from UI
  const paperDimensions = await page.evaluate(() => {
    const paperDiv = document.querySelector('[data-testid="canvas-paper"]');
    if (!paperDiv) return null;
    const rect = paperDiv.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      style: paperDiv.getAttribute('style')
    };
  });
  
  console.log('Paper dimensions in preview:', paperDimensions);
  
  // Click print button
  console.log('Clicking print button...');
  const printBtn = page.locator('[data-testid="canvas-print-button"]');
  await printBtn.click();
  await page.waitForTimeout(3000);
  
  // Get print iframe dimensions
  const printInfo = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return { error: 'No print iframe found' };
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return { error: 'Cannot access iframe document' };
    
    // Get page wrapper dimensions
    const pageWrapper = iframeDoc.querySelector('.print-page-wrapper');
    if (!pageWrapper) return { error: 'No page wrapper found' };
    
    const wrapperRect = pageWrapper.getBoundingClientRect();
    const wrapperStyle = pageWrapper.getAttribute('style');
    
    // Get @page CSS
    const pageCSS = Array.from(iframeDoc.querySelectorAll('style'))
      .map(s => s.textContent)
      .join('\n');
    
    // Get first element dimensions
    const firstElement = iframeDoc.querySelector('[data-element-type="text"]');
    const elementRect = firstElement ? firstElement.getBoundingClientRect() : null;
    const elementStyle = firstElement ? firstElement.getAttribute('style') : null;
    
    return {
      iframeDimensions: {
        width: iframe.offsetWidth,
        height: iframe.offsetHeight,
        style: iframe.getAttribute('style')
      },
      pageWrapper: {
        width: wrapperRect.width,
        height: wrapperRect.height,
        style: wrapperStyle
      },
      firstElement: elementRect ? {
        width: elementRect.width,
        height: elementRect.height,
        left: elementRect.left,
        top: elementRect.top,
        style: elementStyle
      } : null,
      pageCSS: pageCSS.substring(0, 2000)
    };
  });
  
  console.log('\nPrint iframe info:', JSON.stringify(printInfo, null, 2));
  
  // Save evidence
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'print-scale-info.json'),
    JSON.stringify(printInfo, null, 2)
  );
  
  // Save print DOM HTML
  const printDOM = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return '';
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return '';
    return iframeDoc.documentElement.outerHTML;
  });
  
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'print-dom.html'), printDOM);
  
  console.log('\nEvidence saved to:', EVIDENCE_DIR);
  
  await browser.close();
}

main().catch(console.error);
