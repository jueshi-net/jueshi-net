const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const failedPages = ['/', '/pricing', '/tools', '/resources', '/guides', '/checklists', '/topics', '/search'];
  
  for (const path of failedPages) {
    const page = await context.newPage();
    const errors = [];
    
    page.on('pageerror', error => errors.push(error.message));
    
    try {
      await page.goto(`http://localhost:3000${path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      const header = await page.locator('header').first();
      const hasHeader = await header.isVisible().catch(() => false);
      
      const footer = await page.locator('footer').first();
      const hasFooter = await footer.isVisible().catch(() => false);
      
      const headerCount = await page.locator('header').count();
      const footerCount = await page.locator('footer').count();
      
      const hasAppError = await page.locator('text=Application error').isVisible().catch(() => false);
      
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      console.log(`\n${path}:`);
      console.log(`  Header: ${hasHeader} (count: ${headerCount})`);
      console.log(`  Footer: ${hasFooter} (count: ${footerCount})`);
      console.log(`  App Error: ${hasAppError}`);
      console.log(`  Overflow: ${hasOverflow}`);
      console.log(`  Page Errors: ${errors.length}`);
      if (errors.length > 0) {
        console.log(`  Error Details: ${errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`${path}: ERROR - ${error.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
})();
