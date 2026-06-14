const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    toy: { pass: false, count: 0 },
    shoes: { pass: false, count: 0 },
    phone: { pass: false, count: 0 },
    code9503: { pass: false, count: 0 },
    chinese_toy: { pass: false, count: 0 },
    quickSwitch: { pass: false },
    noInfiniteLoading: true,
    noOldResults: true,
    consoleErrors: [],
  };

  try {
    console.log('=== HS Code Real Search & Quick Switch Regression ===\n');

    await page.goto('http://localhost:3000/tools/hs-code', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push(msg.text());
      }
    });

    // Test 1: toy
    console.log('\nTest 1: Search "toy"');
    await page.fill('input[placeholder*="搜索"]', 'toy');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const toyResults = await page.locator('.hs-code-result, [data-testid*="result"]').count();
    results.toy.count = toyResults;
    results.toy.pass = toyResults > 0;
    console.log(`  Results: ${toyResults}, Pass: ${results.toy.pass ? '✓' : '❌'}`);

    // Test 2: shoes
    console.log('\nTest 2: Search "shoes"');
    await page.fill('input[placeholder*="搜索"]', 'shoes');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const shoesResults = await page.locator('.hs-code-result, [data-testid*="result"]').count();
    results.shoes.count = shoesResults;
    results.shoes.pass = shoesResults > 0;
    console.log(`  Results: ${shoesResults}, Pass: ${results.shoes.pass ? '✓' : '❌'}`);

    // Test 3: phone
    console.log('\nTest 3: Search "phone"');
    await page.fill('input[placeholder*="搜索"]', 'phone');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const phoneResults = await page.locator('.hs-code-result, [data-testid*="result"]').count();
    results.phone.count = phoneResults;
    results.phone.pass = phoneResults > 0;
    console.log(`  Results: ${phoneResults}, Pass: ${results.phone.pass ? '✓' : '❌'}`);

    // Test 4: 9503
    console.log('\nTest 4: Search "9503"');
    await page.fill('input[placeholder*="搜索"]', '9503');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const code9503Results = await page.locator('.hs-code-result, [data-testid*="result"]').count();
    results.code9503.count = code9503Results;
    results.code9503.pass = code9503Results > 0;
    console.log(`  Results: ${code9503Results}, Pass: ${results.code9503.pass ? '✓' : '❌'}`);

    // Test 5: 玩具 (Chinese)
    console.log('\nTest 5: Search "玩具"');
    await page.fill('input[placeholder*="搜索"]', '玩具');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const chineseToyResults = await page.locator('.hs-code-result, [data-testid*="result"]').count();
    results.chinese_toy.count = chineseToyResults;
    results.chinese_toy.pass = chineseToyResults > 0;
    console.log(`  Results: ${chineseToyResults}, Pass: ${results.chinese_toy.pass ? '✓' : '❌'}`);

    // Test 6: Quick switch test
    console.log('\nTest 6: Quick switch test (toy → shoes → phone → 9503 → 玩具)');
    const searchTerms = ['toy', 'shoes', 'phone', '9503', '玩具'];
    let quickSwitchPass = true;

    for (const term of searchTerms) {
      await page.fill('input[placeholder*="搜索"]', term);
      await page.click('button:has-text("搜索")');
      await page.waitForTimeout(1500);
      
      // Check for loading state
      const isLoading = await page.locator('.loading, [data-loading="true"]').isVisible().catch(() => false);
      if (isLoading) {
        results.noInfiniteLoading = false;
        quickSwitchPass = false;
        console.log(`  ❌ "${term}" - Infinite loading detected`);
        break;
      }
      
      const resultCount = await page.locator('.hs-code-result, [data-testid*="result"]').count();
      console.log(`  "${term}" - Results: ${resultCount}`);
    }
    
    results.quickSwitch.pass = quickSwitchPass && results.noInfiniteLoading;
    console.log(`  Quick switch pass: ${results.quickSwitch.pass ? '✓' : '❌'}`);

    // Test 7: Empty result keyword
    console.log('\nTest 7: Empty result keyword "xyznonexistent123"');
    await page.fill('input[placeholder*="搜索"]', 'xyznonexistent123');
    await page.click('button:has-text("搜索")');
    await page.waitForTimeout(2000);
    const emptyResults = await page.locator('.hs-code-result, [data-testid*="result"]').count();
    const emptyState = await page.locator('text=/无结果|未找到|没有/i').isVisible().catch(() => false);
    console.log(`  Results: ${emptyResults}, Empty state shown: ${emptyState ? '✓' : '❌'}`);

    // Summary
    console.log('\n=== Summary ===');
    console.log(`Console errors: ${results.consoleErrors.length}`);
    if (results.consoleErrors.length > 0) {
      results.consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    const allPass = results.toy.pass && results.shoes.pass && results.phone.pass && 
                    results.code9503.pass && results.chinese_toy.pass && 
                    results.quickSwitch.pass && results.noInfiniteLoading;
    
    console.log(`\nOverall: ${allPass ? 'PASS ✓' : 'FAIL ❌'}`);
    
    // Output JSON for parsing
    console.log('\n' + JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
