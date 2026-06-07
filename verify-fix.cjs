const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  
  const CRITICAL = [
    '/',
    '/tools/postal-code',
    '/tools/label-maker',
    '/tools/documents',
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

  let overflowCount = 0;
  
  for (const path of CRITICAL) {
    try {
      await page.goto(`https://jueshi.net${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(500);
      
      const status = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          overflow: doc.scrollWidth > doc.clientWidth,
          overflowPx: doc.scrollWidth - doc.clientWidth,
        };
      });

      if (status.overflow) {
        overflowCount++;
        console.log(`OVERFLOW: ${path} +${status.overflowPx}px`);
      } else {
        console.log(`OK: ${path}`);
      }
    } catch (e) {
      console.log(`ERROR: ${path} — ${e.message.substring(0, 80)}`);
    }
  }
  
  await browser.close();
  console.log(`\n=== Summary ===`);
  console.log(`Checked: ${CRITICAL.length} pages at 375px`);
  console.log(`Overflows: ${overflowCount}`);
}

main().catch(console.error);
