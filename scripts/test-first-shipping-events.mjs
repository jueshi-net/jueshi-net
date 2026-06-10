#!/usr/bin/env node
/**
 * test-first-shipping-events.mjs
 * Trigger all 3 checklist events for first-shipping-checklist
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_BASE_URL || 'https://jueshi.net';

async function main() {
  console.log('🔍 First Shipping Event Trigger');
  console.log(`   Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Step 1: Trigger checklist_view
  console.log('\n📝 Step 1: Visit first-shipping-checklist');
  await page.goto(`${BASE_URL}/checklists/first-shipping-checklist`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('   ✅ Page loaded, checklist_view should have fired');

  // Step 2: Trigger checklist_tool_click
  console.log('\n📝 Step 2: Click a related tool');
  const toolLinks = await page.$$('a[href*="/tools/"]');
  for (const link of toolLinks) {
    const href = await link.getAttribute('href');
    if (href && href.includes('shipping-calculator')) {
      const [newPage] = await Promise.all([
        ctx.waitForEvent('page'),
        page.evaluate((h) => {
          const a = document.querySelector(`a[href="${h}"]`);
          if (a) { a.setAttribute('target', '_blank'); a.click(); }
        }, href)
      ]);
      await newPage.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      await newPage.close();
      console.log(`   ✅ Clicked: ${href}`);
      break;
    }
  }
  await page.waitForTimeout(2000);

  // Step 3: Trigger checklist_internal_link_click
  console.log('\n📝 Step 3: Go to shipping-calculator, click related checklist');
  await page.goto(`${BASE_URL}/tools/shipping-calculator`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  const clLinks = await page.$$('a[href*="/checklists/"]');
  for (const link of clLinks) {
    const href = await link.getAttribute('href');
    if (href && href.includes('first-shipping')) {
      await link.click();
      console.log(`   ✅ Clicked checklist link: ${href}`);
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(3000);

  await ctx.close();
  await browser.close();
  console.log('\n✅ All events triggered. Check DB for new records.');
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
