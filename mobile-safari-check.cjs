const { chromium } = require('playwright');

const CRITICAL_PAGES = [
  '/',
  '/tools/postal-code',
  '/tools/documents',
  '/tools/label-maker',
  '/ai-tools/product-copy',
  '/ai-tools/translate-polish',
  '/ai-tools/document-summary',
  '/starter',
  '/guides',
  '/resources',
  '/pricing',
  '/login',
  '/dashboard',
  '/dashboard/points',
  '/feedback',
  '/help',
  '/terms',
  '/privacy',
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();

  const results = [];
  let overflowCount = 0;

  for (const path of CRITICAL_PAGES) {
    try {
      await page.goto(`https://jueshi.net${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // Wait a moment for JS to render
      await page.waitForTimeout(500);
      
      const status = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          overflow: doc.scrollWidth > doc.clientWidth,
          overflowPx: doc.scrollWidth - doc.clientWidth,
          title: document.title,
        };
      });

      const consoleErrors = await page.evaluate(() => {
        // We can't access console from here, just check page errors
        return 'n/a';
      });

      results.push({
        path,
        scrollWidth: status.scrollWidth,
        clientWidth: status.clientWidth,
        overflow: status.overflow,
        overflowPx: status.overflowPx,
        title: status.title.substring(0, 60),
      });

      if (status.overflow) {
        overflowCount++;
        console.log(`OVERFLOW: ${path} — scrollWidth=${status.scrollWidth} clientWidth=${status.clientWidth} +${status.overflowPx}px`);
      } else {
        console.log(`OK: ${path} (${status.scrollWidth}/${status.clientWidth})`);
      }
    } catch (e) {
      results.push({ path, error: e.message.substring(0, 100) });
      console.log(`ERROR: ${path} — ${e.message.substring(0, 100)}`);
    }
  }

  await browser.close();

  console.log(`\n=== Summary (375px iPhone SE) ===`);
  console.log(`Total checks: ${results.length}`);
  console.log(`Overflows: ${overflowCount}`);
  
  // iPad check (768px) - need to reopen browser
  console.log(`\n=== iPad check (768px) ===`);
  const browser2 = await chromium.launch();
  const context2 = await browser2.newContext({ viewport: { width: 768, height: 1024 } });
  const page2 = await context2.newPage();

  for (const path of ['/tools/label-maker', '/dashboard', '/dashboard/points', '/admin']) {
    try {
      await page2.goto(`https://jueshi.net${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page2.waitForTimeout(500);
      
      const status = await page2.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          overflow: doc.scrollWidth > doc.clientWidth,
          overflowPx: doc.scrollWidth - doc.clientWidth,
        };
      });

      if (status.overflow) {
        console.log(`OVERFLOW: ${path} (768px) +${status.overflowPx}px`);
      } else {
        console.log(`OK: ${path} (768px)`);
      }
    } catch (e) {
      console.log(`ERROR: ${path} (768px) — ${e.message.substring(0, 100)}`);
    }
  }

  await context2.close();
  await browser2.close();
}

main().catch(console.error);
