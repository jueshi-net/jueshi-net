const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  
  // Check 375px
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  
  for (const path of ['/tools/postal-code', '/tools/label-maker']) {
    await page.goto(`https://jueshi.net${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    const info = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const bodyStyle = window.getComputedStyle(body);
      const htmlStyle = window.getComputedStyle(html);
      
      return {
        bodyOverflowX: bodyStyle.overflowX,
        htmlOverflowX: htmlStyle.overflowX,
        bodyScrollWidth: body.scrollWidth,
        htmlScrollWidth: html.scrollWidth,
        bodyClientWidth: body.clientWidth,
        htmlClientWidth: html.clientWidth,
        hasHScrollbar: body.offsetWidth > body.clientWidth || html.offsetWidth > html.clientWidth,
      };
    });
    
    console.log(`\n=== ${path} (375px) ===`);
    console.log(`body overflow-x: ${info.bodyOverflowX}`);
    console.log(`html overflow-x: ${info.htmlOverflowX}`);
    console.log(`body: ${info.bodyScrollWidth}/${info.bodyClientWidth}`);
    console.log(`html: ${info.htmlScrollWidth}/${info.htmlClientWidth}`);
    console.log(`hasHScrollbar: ${info.hasHScrollbar}`);
    
    // Take screenshot to visually verify
    await page.screenshot({ path: `/tmp/${path.replace(/\//g, '_')}-375.png`, fullPage: false });
    console.log(`Screenshot: /tmp/${path.replace(/\//g, '_')}-375.png`);
  }
  
  await browser.close();
}

main().catch(console.error);
