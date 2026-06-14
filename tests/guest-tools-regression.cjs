const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    container: { pass: false, details: {} },
    hscode: { pass: false, details: {} },
    quotesheet: { pass: false, details: {} },
  };

  try {
    // ========== Container Test ==========
    console.log('=== Container Calculation Test ===\n');
    await page.goto('http://localhost:3000/tools/container', { waitUntil: 'networkidle' });
    
    // Fill in the form - use label text to find inputs
    const lengthInput = page.locator('label:has-text("长") + input, label:has-text("长") ~ input').first();
    const widthInput = page.locator('label:has-text("宽") + input, label:has-text("宽") ~ input').first();
    const heightInput = page.locator('label:has-text("高") + input, label:has-text("高") ~ input').first();
    const weightInput = page.locator('label:has-text("重量") + input, label:has-text("重量") ~ input').first();
    const qtyInput = page.locator('label:has-text("数量") + input, label:has-text("数量") ~ input').first();
    
    await lengthInput.fill('60');
    await widthInput.fill('40');
    await heightInput.fill('50');
    await weightInput.fill('15');
    await qtyInput.fill('100');
    
    // Wait for calculation
    await page.waitForTimeout(1000);
    
    // Get results
    const containerText = await page.textContent('body');
    
    results.container.details = {
      hasCBM: containerText.includes('0.12') || containerText.includes('0.1200'),
      hasTotalVolume: containerText.includes('12') || containerText.includes('12.0000'),
      hasUtilization: containerText.includes('36.1%'),
      hasTheoretical: containerText.includes('276'),
      hasBatches: containerText.includes('2 批'),
      noMisleading: !containerText.includes('可装 2 件'),
    };
    
    results.container.pass = Object.values(results.container.details).every(v => v === true);
    
    console.log('Container Results:');
    console.log(`  CBM (0.12): ${results.container.details.hasCBM ? '✓' : '❌'}`);
    console.log(`  Total Volume (12): ${results.container.details.hasTotalVolume ? '✓' : '❌'}`);
    console.log(`  Utilization (36.1%): ${results.container.details.hasUtilization ? '✓' : '❌'}`);
    console.log(`  Theoretical (276): ${results.container.details.hasTheoretical ? '✓' : '❌'}`);
    console.log(`  Batches (2 批): ${results.container.details.hasBatches ? '✓' : '❌'}`);
    console.log(`  No misleading text: ${results.container.details.noMisleading ? '✓' : '❌'}`);
    console.log(`  Overall: ${results.container.pass ? 'PASS ✓' : 'FAIL ❌'}\n`);

    // ========== HS Code Test ==========
    console.log('=== HS Code Quick Switch Test ===\n');
    await page.goto('http://localhost:3000/tools/hs-code', { waitUntil: 'networkidle' });
    
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"], input[type="text"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    
    // Test 1: toy
    await searchInput.fill('toy');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const toyResults = await page.textContent('body');
    results.hscode.details.toyHasResults = toyResults.includes('9503') || toyResults.includes('玩具') || toyResults.includes('toy');
    
    // Test 2: shoes (quick switch)
    await searchInput.fill('shoes');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const shoesResults = await page.textContent('body');
    results.hscode.details.shoesHasResults = shoesResults.includes('640') || shoesResults.includes('鞋') || shoesResults.includes('shoe');
    
    // Test 3: 9503
    await searchInput.fill('9503');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const code9503Results = await page.textContent('body');
    results.hscode.details.code9503HasResults = code9503Results.includes('9503');
    
    // Test 4: Quick switch (phone)
    await searchInput.fill('phone');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(1000);
    await searchInput.fill('玩具');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const finalResults = await page.textContent('body');
    results.hscode.details.noInfiniteLoading = !finalResults.includes('加载中...') || finalResults.includes('玩具');
    
    results.hscode.pass = Object.values(results.hscode.details).every(v => v === true);
    
    console.log('HS Code Results:');
    console.log(`  toy has results: ${results.hscode.details.toyHasResults ? '✓' : '❌'}`);
    console.log(`  shoes has results: ${results.hscode.details.shoesHasResults ? '✓' : '❌'}`);
    console.log(`  9503 has results: ${results.hscode.details.code9503HasResults ? '✓' : '❌'}`);
    console.log(`  No infinite loading: ${results.hscode.details.noInfiniteLoading ? '✓' : '❌'}`);
    console.log(`  Overall: ${results.hscode.pass ? 'PASS ✓' : 'FAIL ❌'}\n`);

    // ========== Quote Sheet Test ==========
    console.log('=== Quote Sheet Guest Local Save Test ===\n');
    await page.goto('http://localhost:3000/tools/documents/quotation', { waitUntil: 'networkidle' });
    
    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('  ❌ Redirected to login page');
      results.quotesheet.pass = false;
    } else {
      console.log('  ✓ Page loaded without redirect');
      
      // Fill in some fields
      const quoteNoInput = page.locator('input[name*="quote"], input[name*="number"], input[placeholder*="报价"]').first();
      if (await quoteNoInput.isVisible()) {
        await quoteNoInput.fill('TEST-QUOTE-001');
        console.log('  ✓ Quote number filled');
      }
      
      // Look for save button
      const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        console.log('  ✓ Save button clicked');
        await page.waitForTimeout(1000);
        
        // Check localStorage
        const localStorageData = await page.evaluate(() => {
          const keys = Object.keys(localStorage);
          return {
            hasQuoteDraft: keys.some(k => k.includes('quote') && k.includes('draft')),
            keys: keys,
          };
        });
        
        results.quotesheet.details = {
          pageLoaded: true,
          hasLocalStorage: localStorageData.hasQuoteDraft,
          localStorageKeys: localStorageData.keys,
        };
        
        // Refresh and check restoration
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const restoredValue = await quoteNoInput.inputValue().catch(() => '');
        results.quotesheet.details.formRestored = restoredValue === 'TEST-QUOTE-001';
        results.quotesheet.details.noLoginRedirect = !page.url().includes('/login');
        
        results.quotesheet.pass = results.quotesheet.details.pageLoaded && 
                                   results.quotesheet.details.hasLocalStorage &&
                                   results.quotesheet.details.formRestored &&
                                   results.quotesheet.details.noLoginRedirect;
        
        console.log(`  localStorage has quote draft: ${results.quotesheet.details.hasLocalStorage ? '✓' : '❌'}`);
        console.log(`  Form restored: ${results.quotesheet.details.formRestored ? '✓' : '❌'}`);
        console.log(`  No login redirect: ${results.quotesheet.details.noLoginRedirect ? '✓' : '❌'}`);
        console.log(`  Overall: ${results.quotesheet.pass ? 'PASS ✓' : 'FAIL ❌'}`);
      } else {
        console.log('  ⚠ Save button not found');
        results.quotesheet.pass = false;
      }
    }

    // ========== Summary ==========
    console.log('\n=== Final Summary ===');
    console.log(`Container: ${results.container.pass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`HS Code: ${results.hscode.pass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Quote Sheet: ${results.quotesheet.pass ? 'PASS ✓' : 'FAIL ❌'}`);
    
    const allPass = results.container.pass && results.hscode.pass && results.quotesheet.pass;
    console.log(`\nOverall: ${allPass ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ❌'}`);

  } catch (error) {
    console.error('Test suite failed:', error.message);
  } finally {
    await browser.close();
  }
})();
