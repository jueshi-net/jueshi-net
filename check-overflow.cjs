const { chromium } = require('playwright');

async function checkOverflow(url) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(500);
  
  // Find elements causing overflow
  const overflowInfo = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowElements = [];
    
    // Check all elements that extend past viewport
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > doc.clientWidth + 1) {
        const classes = el.className || '';
        if (typeof classes === 'string') {
          overflowElements.push({
            tag: el.tagName,
            classes: classes.substring(0, 100),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            id: el.id || '',
          });
          if (overflowElements.length >= 5) break;
        }
      }
    }
    
    return overflowElements;
  });
  
  console.log(`\n=== ${url} ===`);
  console.log(`Overflow elements: ${overflowInfo.length}`);
  for (const el of overflowInfo) {
    console.log(`  <${el.tag}> id="${el.id}" classes="${el.classes.substring(0, 60)}"`);
    console.log(`    left=${el.left} right=${el.right} width=${el.width}`);
  }
  
  await browser.close();
}

checkOverflow('https://jueshi.net/tools/postal-code').then(() => {
  return checkOverflow('https://jueshi.net/tools/label-maker');
}).catch(console.error);
