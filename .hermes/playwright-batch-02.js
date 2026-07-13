const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 }
  ];
  
  const pages = [
    { path: '/payment/success', name: 'Payment Success' },
    { path: '/ai-tools', name: 'AI Tools' },
    { path: '/', name: 'Home' },
    { path: '/feedback', name: 'Feedback' },
    { path: '/help', name: 'Help' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/tools', name: 'Tools' },
    { path: '/resources', name: 'Resources' },
    { path: '/guides', name: 'Guides' },
    { path: '/checklists', name: 'Checklists' },
    { path: '/topics', name: 'Topics' },
    { path: '/search', name: 'Search' }
  ];
  
  const results = {
    payment_success: { mobile: null, desktop: null },
    ai_tools: { mobile: null, desktop: null },
    regression: []
  };
  
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    
    for (const page of pages) {
      const testPage = await context.newPage();
      const errors = [];
      
      testPage.on('pageerror', error => errors.push(error.message));
      
      try {
        await testPage.goto(`http://localhost:3000${page.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
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
        
        const result = {
          path: page.path,
          viewport: viewport.name,
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
          result.status = 'FAIL';
          result.reason = 'Missing Header or Footer';
        } else if (headerCount > 1 || footerCount > 1) {
          result.status = 'FAIL';
          result.reason = 'Duplicate Header/Footer';
        } else if (hasAppError) {
          result.status = 'FAIL';
          result.reason = 'Application error detected';
        } else if (hasOverflow) {
          result.status = 'FAIL';
          result.reason = 'Horizontal overflow';
        } else if (errors.length > 0) {
          result.status = 'FAIL';
          result.reason = `Page errors: ${errors.join(', ')}`;
        }
        
        // Store results
        if (page.path === '/payment/success') {
          results.payment_success[viewport.name] = result;
        } else if (page.path === '/ai-tools') {
          results.ai_tools[viewport.name] = result;
        } else {
          results.regression.push(result);
        }
        
        console.log(`✓ ${page.path} (${viewport.name}): ${result.status}`);
        
      } catch (error) {
        console.error(`✗ ${page.path} (${viewport.name}): ERROR - ${error.message}`);
      }
      
      await testPage.close();
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Payment Success (mobile): ${results.payment_success.mobile?.status || 'NOT TESTED'}`);
  console.log(`Payment Success (desktop): ${results.payment_success.desktop?.status || 'NOT TESTED'}`);
  console.log(`AI Tools (mobile): ${results.ai_tools.mobile?.status || 'NOT TESTED'}`);
  console.log(`AI Tools (desktop): ${results.ai_tools.desktop?.status || 'NOT TESTED'}`);
  
  const regressionPass = results.regression.every(r => r.status === 'PASS');
  console.log(`Regression: ${regressionPass ? 'PASS' : 'FAIL'}`);
  
  const allPass = 
    results.payment_success.mobile?.status === 'PASS' &&
    results.payment_success.desktop?.status === 'PASS' &&
    results.ai_tools.mobile?.status === 'PASS' &&
    results.ai_tools.desktop?.status === 'PASS' &&
    regressionPass;
  
  console.log(`\nOverall: ${allPass ? 'BATCH_02_PLAYWRIGHT_PASS' : 'BATCH_02_PLAYWRIGHT_FAILED'}`);
  
  process.exit(allPass ? 0 : 1);
})();
