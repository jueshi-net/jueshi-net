/**
 * Debug: Check Commercial Invoice page structure
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();
  
  await page.goto(`${BASE_URL}/tools/documents/commercial-invoice`, { waitUntil: 'networkidle' });
  
  // Get all input elements
  const inputs = await page.evaluate(() => {
    const allInputs = Array.from(document.querySelectorAll('input, textarea'));
    return allInputs.map(el => ({
      tag: el.tagName,
      type: el.type || '',
      name: el.name || '',
      placeholder: el.placeholder || '',
      id: el.id || '',
      className: el.className || '',
    }));
  });
  
  console.log('=== Input Elements ===');
  console.log(JSON.stringify(inputs, null, 2));
  
  // Get all buttons
  const buttons = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    return allButtons.map(el => ({
      text: el.textContent?.trim() || '',
      type: el.type || '',
      disabled: el.disabled,
    }));
  });
  
  console.log('\n=== Buttons ===');
  console.log(JSON.stringify(buttons, null, 2));
  
  await browser.close();
}

main().catch(console.error);
