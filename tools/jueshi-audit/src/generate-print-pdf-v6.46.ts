#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.46 Generate Print PDF
 * 
 * Generate actual print PDF to check dimensions
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'print-scale-v6.46');
const BASE_URL = 'https://i.jueshi.net';

async function main() {
  console.log('=== Generate Print PDF ===\n');
  
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
  
  // Wait for page to load
  await page.waitForTimeout(5000);
  
  // Set paper size to 10x10
  const paperSelect = page.locator('[data-testid="canvas-paper-size"]');
  await paperSelect.waitFor({ state: 'visible', timeout: 10000 });
  await paperSelect.selectOption('10x10');
  await page.waitForTimeout(1000);
  
  // Add a text element
  const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
  await addTextBtn.click();
  await page.waitForTimeout(1000);
  
  // Click print button
  console.log('Clicking print button...');
  const printBtn = page.locator('[data-testid="canvas-print-button"]');
  await printBtn.click();
  await page.waitForTimeout(3000);
  
  // Get print iframe and generate PDF from it
  const printIframe = await page.$('#canvas-print-iframe');
  if (!printIframe) {
    console.error('No print iframe found');
    await browser.close();
    return;
  }
  
  // Get iframe content
  const iframeContent = await page.evaluate(() => {
    const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
    if (!iframe) return '';
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return '';
    return iframeDoc.documentElement.outerHTML;
  });
  
  // Create a new page with the iframe content
  const printPage = await context.newPage();
  await printPage.setContent(iframeContent, { waitUntil: 'networkidle' });
  await printPage.waitForTimeout(2000);
  
  // Generate PDF
  console.log('Generating PDF...');
  const pdfPath = path.join(EVIDENCE_DIR, 'print-output.pdf');
  await printPage.pdf({
    path: pdfPath,
    width: '100mm',
    height: '100mm',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });
  
  console.log('PDF generated:', pdfPath);
  
  // Get PDF info
  const pdfStats = fs.statSync(pdfPath);
  console.log('PDF size:', pdfStats.size, 'bytes');
  
  await browser.close();
}

main().catch(console.error);
