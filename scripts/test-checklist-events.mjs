#!/usr/bin/env node
/**
 * test-checklist-events.mjs
 * Playwright script to trigger checklist tracking events on production
 *
 * Usage: node scripts/test-checklist-events.mjs
 */

import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_BASE_URL || 'https://jueshi.net';

async function main() {
  console.log('🔍 Checklist Event Verification via Playwright');
  console.log(`   Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Collect API events requests
  const apiEvents = [];
  await page.route('**/api/events', async (route, request) => {
    if (request.method() === 'POST') {
      try {
        const body = JSON.parse(request.postData());
        apiEvents.push(body);
        console.log(`   📨 API event captured: ${body.eventType} / ${body.action}`);
      } catch {}
    }
    // Fulfill with 200
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  // Step 1: Trigger checklist_view
  console.log('\n📝 Step 1: Trigger checklist_view');
  await page.goto(`${BASE_URL}/checklists/student-first-abroad-packing-checklist`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000); // Wait for beacon/fetch to fire
  console.log(`   Page loaded: ${page.url()}`);
  console.log(`   API events captured so far: ${apiEvents.length}`);

  // Step 2: Trigger checklist_tool_click (click a related tool link)
  console.log('\n📝 Step 2: Trigger checklist_tool_click');
  const toolLinks = await page.$$('a[href*="/tools/"]');
  let clicked = false;
  for (const link of toolLinks) {
    const href = await link.getAttribute('href');
    if (href && href.includes('address-formatter')) {
      // Open in new tab so we don't leave the checklist page
      const [newPage] = await Promise.all([
        ctx.waitForEvent('page'),
        page.evaluate((href) => {
          const a = document.querySelector(`a[href="${href}"]`);
          if (a) {
            a.setAttribute('target', '_blank');
            a.click();
          }
        }, href)
      ]);
      await newPage.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      await newPage.close();
      clicked = true;
      console.log(`   Clicked tool link: ${href}`);
      break;
    }
  }
  if (!clicked) console.log('   ⚠️ No tool link found to click');
  await page.waitForTimeout(2000);
  console.log(`   API events captured so far: ${apiEvents.length}`);

  // Step 3: Trigger checklist_internal_link_click
  console.log('\n📝 Step 3: Trigger checklist_internal_link_click');
  await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click the related checklist link
  const checklistLinks = await page.$$('a[href*="/checklists/"]');
  let clClicked = false;
  for (const link of checklistLinks) {
    const href = await link.getAttribute('href');
    if (href && href.includes('student-first-abroad')) {
      await link.click();
      clClicked = true;
      console.log(`   Clicked checklist link: ${href}`);
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      break;
    }
  }
  if (!clClicked) console.log('   ⚠️ No checklist link found to click');
  await page.waitForTimeout(2000);
  console.log(`   API events captured so far: ${apiEvents.length}`);

  await ctx.close();
  await browser.close();

  // Output captured events for DB verification
  console.log('\n📋 All API events captured during test:');
  for (const e of apiEvents) {
    console.log(`  ${JSON.stringify(e)}`);
  }

  // Summary
  const hasView = apiEvents.some(e => e.eventType === 'checklist_view');
  const hasToolClick = apiEvents.some(e => e.eventType === 'checklist_tool_click');
  const hasInternalClick = apiEvents.some(e => e.eventType === 'checklist_internal_link_click');

  console.log('\n✅ API Event Capture Summary:');
  console.log(`  checklist_view: ${hasView ? '✅ CAPTURED' : '❌ NOT CAPTURED'}`);
  console.log(`  checklist_tool_click: ${hasToolClick ? '✅ CAPTURED' : '❌ NOT CAPTURED'}`);
  console.log(`  checklist_internal_link_click: ${hasInternalClick ? '✅ CAPTURED' : '❌ NOT CAPTURED'}`);
  console.log(`  Total events captured: ${apiEvents.length}`);
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
