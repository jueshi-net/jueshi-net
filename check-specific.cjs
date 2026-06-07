const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();

  // Check postal-code specifically
  await page.goto('https://jueshi.net/tools/postal-code', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(1000);

  const postalOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const allElements = document.querySelectorAll('*');
    const wideElements = [];
    
    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      // Only check non-fixed/non-absolute elements (real layout overflow)
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'absolute') continue;
      
      if (rect.right > doc.clientWidth + 1) {
        wideElements.push({
          tag: el.tagName,
          classes: (el.className || '').toString().substring(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
        if (wideElements.length >= 5) break;
      }
    }
    
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      elements: wideElements,
    };
  });

  console.log('=== postal-code (non-fixed/absolute overflow) ===');
  console.log(`scrollWidth: ${postalOverflow.scrollWidth}, clientWidth: ${postalOverflow.clientWidth}`);
  for (const el of postalOverflow.elements) {
    console.log(`  <${el.tag}> "${el.classes.substring(0, 60)}"`);
    console.log(`    left=${el.left} right=${el.right} width=${el.width}`);
  }

  // Check if mobile panel exists in DOM
  const panelExists = await page.evaluate(() => {
    return !!document.querySelector('.fixed.top-0.right-0.h-full.w-72');
  });
  console.log(`\nMobile panel in DOM: ${panelExists}`);

  await browser.close();
}

main().catch(console.error);
