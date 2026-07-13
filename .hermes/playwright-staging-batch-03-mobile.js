const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  
  const pages = [
    { path: '/analytics', name: 'Analytics' },
    { path: '/business', name: 'Business' }
  ];
  
  const results = {};
  
  for (const page of pages) {
    const testPage = await context.newPage();
    const errors = [];
    
    testPage.on('pageerror', error => errors.push(error.message));
    
    try {
      await testPage.goto(`https://i.jueshi.net${page.path}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // 等待一小段时间让页面渲染
      await testPage.waitForTimeout(2000);
      
      // Check for V4 Header
      const header = await testPage.locator('header').first();
      const hasHeader = await header.isVisible().catch(() => false);
      
      // Check for V4 Footer
      const footer = await testPage.locator('footer').first();
      const hasFooter = await footer.isVisible().catch(() => false);
      
      // Check for duplicate headers/footers
      const headerCount = await testPage.locator('header').count();
      const footerCount = await testPage.locator('footer').count();
      
      // Check for Application error
      const hasAppError = await testPage.locator('text=Application error').isVisible().catch(() => false);
      
      // Check for horizontal overflow
      const hasOverflow = await testPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      results[page.name] = {
        hasHeader,
        hasFooter,
        headerCount,
        footerCount,
        hasAppError,
        hasOverflow,
        pageErrors: errors.length,
        status: 'PASS'
      };
      
      // Validation
      if (!hasHeader || !hasFooter) {
        results[page.name].status = 'FAIL';
        results[page.name].reason = 'Missing Header or Footer';
      } else if (headerCount > 1 || footerCount > 1) {
        results[page.name].status = 'FAIL';
        results[page.name].reason = 'Duplicate Header/Footer';
      } else if (hasAppError) {
        results[page.name].status = 'FAIL';
        results[page.name].reason = 'Application error detected';
      } else if (hasOverflow) {
        results[page.name].status = 'FAIL';
        results[page.name].reason = 'Horizontal overflow';
      } else if (errors.length > 0) {
        results[page.name].status = 'FAIL';
        results[page.name].reason = `Page errors: ${errors.join(', ')}`;
      }
      
      console.log(`✓ ${page.path} (mobile): ${results[page.name].status}`);
      if (results[page.name].status === 'FAIL') {
        console.log(`  Reason: ${results[page.name].reason}`);
      }
      
    } catch (error) {
      console.error(`✗ ${page.path} (mobile): ERROR - ${error.message}`);
      results[page.name] = { status: 'ERROR', reason: error.message };
    }
    
    await testPage.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Analytics (mobile): ${results['Analytics']?.status || 'NOT TESTED'}`);
  console.log(`Business (mobile): ${results['Business']?.status || 'NOT TESTED'}`);
  
  const allPass = 
    results['Analytics']?.status === 'PASS' &&
    results['Business']?.status === 'PASS';
  
  console.log(`\nOverall: ${allPass ? 'BATCH_03_MOBILE_PASS' : 'BATCH_03_MOBILE_FAILED'}`);
  
  process.exit(allPass ? 0 : 1);
})();
