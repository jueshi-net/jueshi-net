#!/usr/bin/env tsx
/**
 * v1.20.42.18.6.16.6.46 Check Preview Canvas Element
 * 
 * Check element dimensions in preview canvas vs print
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'print-scale-v6.46');
const BASE_URL = 'https://i.jueshi.net';

async function main() {
  console.log('=== Check Preview Canvas Element ===\n');
  
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to canvas editor
  console.log('Navigating to canvas editor...');
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
  
  // Get preview canvas element dimensions
  const previewInfo = await page.evaluate(() => {
    // Get paper dimensions
    const paperDiv = document.querySelector('[data-testid="canvas-paper"]');
    if (!paperDiv) return { error: 'No paper div found' };
    
    const paperRect = paperDiv.getBoundingClientRect();
    const paperStyle = paperDiv.getAttribute('style');
    
    // Get text element dimensions - try multiple selectors
    let textElement = document.querySelector('[data-element-type="text"]');
    if (!textElement) {
      textElement = document.querySelector('[data-testid="canvas-element"]');
    }
    if (!textElement) {
      // Try to find any draggable element
      textElement = document.querySelector('.react-draggable');
    }
    if (!textElement) {
      return { error: 'No text element found', html: document.body.innerHTML.substring(0, 1000) };
    }
    
    const elementRect = textElement.getBoundingClientRect();
    const elementStyle = textElement.getAttribute('style');
    
    // Get computed styles
    const computedStyle = window.getComputedStyle(textElement);
    
    return {
      paper: {
        width: paperRect.width,
        height: paperRect.height,
        style: paperStyle
      },
      element: {
        width: elementRect.width,
        height: elementRect.height,
        left: elementRect.left,
        top: elementRect.top,
        style: elementStyle,
        computedFontSize: computedStyle.fontSize,
        computedWidth: computedStyle.width,
        computedHeight: computedStyle.height
      }
    };
  });
  
  console.log('Preview canvas info:', JSON.stringify(previewInfo, null, 2));
  
  // Save evidence
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'preview-canvas-info.json'),
    JSON.stringify(previewInfo, null, 2)
  );
  
  await browser.close();
}

main().catch(console.error);
