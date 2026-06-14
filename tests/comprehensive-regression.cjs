const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    hscode: { pass: false, tests: [] },
    quotesheet: { pass: false, tests: [] },
    commercial_invoice: { pass: false, tests: [] },
    container: { pass: false, tests: [] },
  };

  try {
    // ========== HS Code Tests ==========
    console.log('=== HS Code Regression Tests ===\n');
    await page.goto('http://localhost:3000/tools/hs-code', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Test 1: Page loads
    const hscodeTitle = await page.locator('h1:has-text("HS编码")').isVisible();
    results.hscode.tests.push({ name: 'Page loads', pass: hscodeTitle });
    console.log(`✓ Page loads: ${hscodeTitle ? 'PASS' : 'FAIL'}`);

    // Test 2: Search input exists
    const searchInputExists = await page.locator('input[type="text"]').first().isVisible();
    results.hscode.tests.push({ name: 'Search input exists', pass: searchInputExists });
    console.log(`✓ Search input exists: ${searchInputExists ? 'PASS' : 'FAIL'}`);

    if (searchInputExists) {
      // Use Playwright's native fill method for proper React state updates
      const searchInput = page.locator('input[type="text"]').first();
      
      // Test 3: Search "toy"
      await searchInput.fill('toy');
      await page.waitForTimeout(3000);
      const toyResults = await page.locator('text=/9503|玩具|toy/i').count();
      results.hscode.tests.push({ name: 'Search "toy"', pass: toyResults > 0 });
      console.log(`✓ Search "toy": ${toyResults > 0 ? 'PASS' : 'FAIL'} (${toyResults} matches)`);

      // Test 4: Search "shoes"
      await searchInput.fill('shoes');
      await page.waitForTimeout(3000);
      const shoesResults = await page.locator('text=/640|鞋|shoe/i').count();
      results.hscode.tests.push({ name: 'Search "shoes"', pass: shoesResults > 0 });
      console.log(`✓ Search "shoes": ${shoesResults > 0 ? 'PASS' : 'FAIL'} (${shoesResults} matches)`);

      // Test 5: Search "phone"
      await searchInput.fill('phone');
      await page.waitForTimeout(3000);
      const phoneResults = await page.locator('text=/851|电话|phone/i').count();
      results.hscode.tests.push({ name: 'Search "phone"', pass: phoneResults > 0 });
      console.log(`✓ Search "phone": ${phoneResults > 0 ? 'PASS' : 'FAIL'} (${phoneResults} matches)`);

      // Test 6: Search "9503"
      await searchInput.fill('9503');
      await page.waitForTimeout(3000);
      const code9503Results = await page.locator('text=/9503/').count();
      results.hscode.tests.push({ name: 'Search "9503"', pass: code9503Results > 0 });
      console.log(`✓ Search "9503": ${code9503Results > 0 ? 'PASS' : 'FAIL'} (${code9503Results} matches)`);

      // Test 7: Search "玩具"
      await searchInput.fill('玩具');
      await page.waitForTimeout(3000);
      const chineseToyResults = await page.locator('text=/9503|玩具/i').count();
      results.hscode.tests.push({ name: 'Search "玩具"', pass: chineseToyResults > 0 });
      console.log(`✓ Search "玩具": ${chineseToyResults > 0 ? 'PASS' : 'FAIL'} (${chineseToyResults} matches)`);

      // Test 8: Quick switch (no infinite loading)
      await searchInput.fill('toy');
      await page.waitForTimeout(1500);
      await searchInput.fill('shoes');
      await page.waitForTimeout(1500);
      await searchInput.fill('phone');
      await page.waitForTimeout(1500);
      const noInfiniteLoading = await page.locator('text=/加载中|loading/i').count() === 0;
      results.hscode.tests.push({ name: 'Quick switch no infinite loading', pass: noInfiniteLoading });
      console.log(`✓ Quick switch no infinite loading: ${noInfiniteLoading ? 'PASS' : 'FAIL'}`);

      // Test 9: Empty result keyword
      await searchInput.fill('xyznonexistent123');
      await page.waitForTimeout(3000);
      const emptyState = await page.locator('text=/无结果|未找到|没有|no results/i').isVisible();
      results.hscode.tests.push({ name: 'Empty result shows empty state', pass: emptyState });
      console.log(`✓ Empty result shows empty state: ${emptyState ? 'PASS' : 'FAIL'}`);
    }

    results.hscode.pass = results.hscode.tests.every(t => t.pass);
    console.log(`\nHS Code Overall: ${results.hscode.pass ? 'PASS ✓' : 'FAIL ❌'}\n`);

    // ========== Quote Sheet Tests ==========
    console.log('=== Quote Sheet Guest Local Save Tests ===\n');
    await page.goto('http://localhost:3000/tools/documents/quotation', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const quotesheetLoaded = !page.url().includes('/login');
    results.quotesheet.tests.push({ name: 'Page loads without redirect', pass: quotesheetLoaded });
    console.log(`✓ Page loads without redirect: ${quotesheetLoaded ? 'PASS' : 'FAIL'}`);

    if (quotesheetLoaded) {
      // Fill company name field specifically (first input in Quote Sheet)
      const companyNameInput = page.locator('input[placeholder*="公司名称"], input[placeholder*="Company"]').first();
      await companyNameInput.fill('TEST-QUOTE-001');
      results.quotesheet.tests.push({ name: 'Form can be filled', pass: true });
      console.log(`✓ Form can be filled: PASS`);

      const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")').first();
      const saveButtonExists = await saveButton.isVisible();
      results.quotesheet.tests.push({ name: 'Save button exists', pass: saveButtonExists });
      console.log(`✓ Save button exists: ${saveButtonExists ? 'PASS' : 'FAIL'}`);

      if (saveButtonExists) {
        await saveButton.click();
        await page.waitForTimeout(2000);

        const localStorageData = await page.evaluate(() => {
          const keys = Object.keys(localStorage);
          return {
            hasQuoteDraft: keys.some(k => k.includes('quote') && k.includes('draft')),
            keys: keys,
          };
        });
        results.quotesheet.tests.push({ name: 'localStorage has quote draft', pass: localStorageData.hasQuoteDraft });
        console.log(`✓ localStorage has quote draft: ${localStorageData.hasQuoteDraft ? 'PASS' : 'FAIL'}`);

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        const restoredValue = await companyNameInput.inputValue().catch(() => '');
        const formRestored = restoredValue === 'TEST-QUOTE-001';
        results.quotesheet.tests.push({ name: 'Form restored after refresh', pass: formRestored });
        console.log(`✓ Form restored after refresh: ${formRestored ? 'PASS' : 'FAIL'} (value: ${restoredValue})`);

        const noLoginRedirect = !page.url().includes('/login');
        results.quotesheet.tests.push({ name: 'No login redirect after refresh', pass: noLoginRedirect });
        console.log(`✓ No login redirect after refresh: ${noLoginRedirect ? 'PASS' : 'FAIL'}`);
      }
    }

    results.quotesheet.pass = results.quotesheet.tests.every(t => t.pass);
    console.log(`\nQuote Sheet Overall: ${results.quotesheet.pass ? 'PASS ✓' : 'FAIL ❌'}\n`);

    // ========== Commercial Invoice Tests ==========
    console.log('=== Commercial Invoice Guest Local Save Tests ===\n');
    await page.goto('http://localhost:3000/tools/commercial-invoice', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const ciLoaded = !page.url().includes('/login');
    results.commercial_invoice.tests.push({ name: 'Page loads without redirect', pass: ciLoaded });
    console.log(`✓ Page loads without redirect: ${ciLoaded ? 'PASS' : 'FAIL'}`);

    if (ciLoaded) {
      // Fill invoice number field specifically
      const invoiceNoInput = page.locator('input[placeholder*="发票号"], input[placeholder*="Invoice"]').first();
      await invoiceNoInput.fill('TEST-INV-001');
      results.commercial_invoice.tests.push({ name: 'Form can be filled', pass: true });
      console.log(`✓ Form can be filled: PASS`);

      const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")').first();
      const saveButtonExists = await saveButton.isVisible();
      results.commercial_invoice.tests.push({ name: 'Save button exists', pass: saveButtonExists });
      console.log(`✓ Save button exists: ${saveButtonExists ? 'PASS' : 'FAIL'}`);

      if (saveButtonExists) {
        await saveButton.click();
        await page.waitForTimeout(2000);

        const localStorageData = await page.evaluate(() => {
          const keys = Object.keys(localStorage);
          return {
            hasInvoiceDraft: keys.includes('invoice-draft'),
            keys: keys,
          };
        });
        results.commercial_invoice.tests.push({ name: 'localStorage has invoice-draft', pass: localStorageData.hasInvoiceDraft });
        console.log(`✓ localStorage has invoice-draft: ${localStorageData.hasInvoiceDraft ? 'PASS' : 'FAIL'}`);

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        const restoredValue = await invoiceNoInput.inputValue().catch(() => '');
        const formRestored = restoredValue === 'TEST-INV-001';
        results.commercial_invoice.tests.push({ name: 'Form restored after refresh', pass: formRestored });
        console.log(`✓ Form restored after refresh: ${formRestored ? 'PASS' : 'FAIL'} (value: ${restoredValue})`);

        const noLoginRedirect = !page.url().includes('/login');
        results.commercial_invoice.tests.push({ name: 'No login redirect after refresh', pass: noLoginRedirect });
        console.log(`✓ No login redirect after refresh: ${noLoginRedirect ? 'PASS' : 'FAIL'}`);
      }
    }

    results.commercial_invoice.pass = results.commercial_invoice.tests.every(t => t.pass);
    console.log(`\nCommercial Invoice Overall: ${results.commercial_invoice.pass ? 'PASS ✓' : 'FAIL ❌'}\n`);

    // ========== Container Tests ==========
    console.log('=== Container Calculation Tests ===\n');
    await page.goto('http://localhost:3000/tools/container', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const containerLoaded = await page.locator('h1:has-text("集装箱")').isVisible();
    results.container.tests.push({ name: 'Page loads', pass: containerLoaded });
    console.log(`✓ Page loads: ${containerLoaded ? 'PASS' : 'FAIL'}`);

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
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body');
    const hasCBM = bodyText.includes('0.12') || bodyText.includes('0.1200');
    const hasTotalVolume = bodyText.includes('12') || bodyText.includes('12.0000');
    const hasUtilization = bodyText.includes('36.1%');
    const hasTheoretical = bodyText.includes('276');
    const hasBatches = bodyText.includes('2 批');
    const noMisleading = !bodyText.includes('可装 2 件');

    results.container.tests.push({ name: 'CBM = 0.12', pass: hasCBM });
    results.container.tests.push({ name: 'Total volume = 12', pass: hasTotalVolume });
    results.container.tests.push({ name: 'Utilization = 36.1%', pass: hasUtilization });
    results.container.tests.push({ name: 'Theoretical = 276', pass: hasTheoretical });
    results.container.tests.push({ name: 'Batches = 2 批', pass: hasBatches });
    results.container.tests.push({ name: 'No misleading text', pass: noMisleading });

    console.log(`✓ CBM = 0.12: ${hasCBM ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Total volume = 12: ${hasTotalVolume ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Utilization = 36.1%: ${hasUtilization ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Theoretical = 276: ${hasTheoretical ? 'PASS' : 'FAIL'}`);
    console.log(`✓ Batches = 2 批: ${hasBatches ? 'PASS' : 'FAIL'}`);
    console.log(`✓ No misleading text: ${noMisleading ? 'PASS' : 'FAIL'}`);

    results.container.pass = results.container.tests.every(t => t.pass);
    console.log(`\nContainer Overall: ${results.container.pass ? 'PASS ✓' : 'FAIL ❌'}\n`);

    // ========== Final Summary ==========
    console.log('=== Final Summary ===');
    console.log(`HS Code: ${results.hscode.pass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Quote Sheet: ${results.quotesheet.pass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Commercial Invoice: ${results.commercial_invoice.pass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Container: ${results.container.pass ? 'PASS ✓' : 'FAIL ❌'}`);

    const allPass = results.hscode.pass && results.quotesheet.pass && 
                    results.commercial_invoice.pass && results.container.pass;
    console.log(`\nOverall: ${allPass ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ❌'}`);

    console.log('\n' + JSON.stringify(results, null, 2));

    process.exit(allPass ? 0 : 1);

  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
