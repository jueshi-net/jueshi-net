import { chromium } from 'playwright';

const BASE_URL = 'https://jueshi.net';
const SCREENSHOT_DIR = 'reports/task-chain-ux-polish/screenshots';

async function main() {
  console.log('=== v1.20.42.6.40 UX Polish Verification ===\n');
  const browser = await chromium.launch({ headless: true });

  // Desktop screenshots
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const desktopPages = [
    { url: '/tools/hs-code', name: 'hs-code-ux-polish.png' },
    { url: '/tools/exchange-rate', name: 'exchange-rate-ux-polish.png' },
    { url: '/tools/postal-code', name: 'postal-code-ux-polish.png' },
    { url: '/tools/address-formatter', name: 'address-formatter-ux-polish.png' },
    { url: '/tools/documents/commercial-invoice', name: 'commercial-invoice-ux-polish.png' },
    { url: '/tools/documents/quotation', name: 'quotation-ux-polish.png' },
  ];

  for (const p of desktopPages) {
    try {
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${p.name}`, fullPage: false });
      console.log(`✓ Desktop: ${p.name}`);
    } catch (e) {
      console.log(`✗ Desktop: ${p.name} - ${e.message.slice(0, 80)}`);
    }
  }
  await context.close();

  // Mobile screenshots (375px)
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileContext.newPage();

  const mobilePages = [
    { url: '/tools/hs-code', name: 'hs-code-mobile-375.png' },
    { url: '/tools/exchange-rate', name: 'exchange-rate-mobile-375.png' },
    { url: '/tools/documents/commercial-invoice', name: 'commercial-invoice-mobile-375.png' },
    { url: '/tools/documents/quotation', name: 'quotation-mobile-375.png' },
  ];

  for (const p of mobilePages) {
    try {
      await mobilePage.goto(`${BASE_URL}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await mobilePage.waitForTimeout(2000);
      await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/${p.name}`, fullPage: false });
      console.log(`✓ Mobile: ${p.name}`);
    } catch (e) {
      console.log(`✗ Mobile: ${p.name} - ${e.message.slice(0, 80)}`);
    }
  }
  await mobileContext.close();

  // Trigger EventLog events via API
  console.log('\n=== Triggering EventLog Events ===\n');
  const events = [
    { eventType: 'tool_click', toolName: 'hs-code', action: 'task_chain_save_context', path: '/tools/hs-code' },
    { eventType: 'tool_click', toolName: 'hs-code', action: 'task_chain_next_click', path: '/tools/hs-code' },
    { eventType: 'tool_click', toolName: 'exchange-rate', action: 'task_chain_save_context', path: '/tools/exchange-rate' },
    { eventType: 'tool_click', toolName: 'exchange-rate', action: 'task_chain_next_click', path: '/tools/exchange-rate' },
    { eventType: 'tool_click', toolName: 'postal-code', action: 'task_chain_save_context', path: '/tools/postal-code' },
    { eventType: 'tool_click', toolName: 'postal-code', action: 'task_chain_clear', path: '/tools/postal-code' },
    { eventType: 'tool_click', toolName: 'commercial-invoice', action: 'task_chain_prefill_accept', path: '/tools/documents/commercial-invoice' },
    { eventType: 'tool_click', toolName: 'quotation', action: 'task_chain_prefill_reject', path: '/tools/documents/quotation' },
    { eventType: 'tool_click', toolName: 'hs-code', action: 'task_chain_workspace_login_prompt', path: '/tools/hs-code' },
    { eventType: 'tool_click', toolName: 'hs-code', action: 'task_chain_workspace_click', path: '/tools/hs-code' },
  ];

  for (const event of events) {
    try {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, sessionId: `ux-polish-${Date.now()}` }),
      });
      console.log(`${res.ok ? '✓' : '✗'} ${event.action} (${event.toolName}) → ${res.status}`);
    } catch (e) {
      console.log(`✗ ${event.action} → ${e.message.slice(0, 60)}`);
    }
  }

  await browser.close();
  console.log('\n✅ Verification complete');
}

main().catch(e => { console.error(e); process.exit(1); });
