const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('=== Commercial Invoice Guest Local Save Test ===\n');

    // 1. Navigate to Commercial Invoice
    console.log('1. Navigating to /tools/commercial-invoice...');
    await page.goto('http://localhost:3000/tools/commercial-invoice', { waitUntil: 'networkidle' });
    console.log('   ✓ Page loaded');
    console.log(`   URL: ${page.url()}`);

    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('   ❌ Redirected to login page immediately');
      console.log('\n=== Test Result: FAILED (Guest access blocked) ===');
      await browser.close();
      return;
    }

    // 2. Check all localStorage keys before filling
    console.log('\n2. Checking localStorage before fill...');
    const localStorageBefore = await page.evaluate(() => {
      return Object.keys(localStorage);
    });
    console.log(`   Keys: ${localStorageBefore.join(', ') || '(empty)'}`);

    // 3. Fill in form fields
    console.log('\n3. Filling form fields...');
    
    // Invoice number
    const invoiceNumberInput = page.locator('input[name="invoiceNumber"], input[placeholder*="发票号"], input[id*="invoice"]').first();
    if (await invoiceNumberInput.isVisible()) {
      await invoiceNumberInput.fill('TEST-INV-001');
      console.log('   ✓ Invoice number filled');
    }

    // Item
    const itemInput = page.locator('input[name*="item"], input[placeholder*="商品"], input[name*="description"]').first();
    if (await itemInput.isVisible()) {
      await itemInput.fill('Test Product');
      console.log('   ✓ Item filled');
    }

    // Quantity
    const qtyInput = page.locator('input[name*="quantity"], input[name*="qty"], input[type="number"]').first();
    if (await qtyInput.isVisible()) {
      await qtyInput.fill('10');
      console.log('   ✓ Quantity filled');
    }

    // 4. Check localStorage after filling (auto-save)
    console.log('\n4. Checking localStorage after fill (auto-save)...');
    await page.waitForTimeout(2000); // Wait for auto-save
    const localStorageAfterFill = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const data = {};
      keys.forEach(key => {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      });
      return { keys, data };
    });
    console.log(`   Keys: ${localStorageAfterFill.keys.join(', ') || '(empty)'}`);
    
    if (localStorageAfterFill.keys.includes('invoice-draft')) {
      console.log('   ✓ Found "invoice-draft" key');
      console.log(`   Data: ${JSON.stringify(localStorageAfterFill.data['invoice-draft']).substring(0, 200)}...`);
    }

    // 5. Click save button (if exists)
    console.log('\n5. Looking for save button...');
    const saveButton = page.locator('button:has-text("保存"), button:has-text("Save")').first();
    
    if (await saveButton.isVisible()) {
      console.log('   ✓ Save button found');
      await saveButton.click();
      console.log('   ✓ Save button clicked');
      await page.waitForTimeout(1000);
      
      // Check localStorage after save
      const localStorageAfterSave = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const data = {};
        keys.forEach(key => {
          try {
            data[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            data[key] = localStorage.getItem(key);
          }
        });
        return { keys, data };
      });
      console.log(`   Keys after save: ${localStorageAfterSave.keys.join(', ') || '(empty)'}`);
      
      if (localStorageAfterSave.keys.includes('invoice-draft')) {
        console.log('   ✓ "invoice-draft" exists after save');
      }
    } else {
      console.log('   ⚠ No save button found');
    }

    // 6. Refresh page
    console.log('\n6. Refreshing page...');
    await page.reload({ waitUntil: 'networkidle' });
    console.log('   ✓ Page refreshed');
    console.log(`   URL: ${page.url()}`);

    // Check if redirected to login after refresh
    if (page.url().includes('/login')) {
      console.log('   ❌ Redirected to login page after refresh');
    } else {
      console.log('   ✓ No login redirect after refresh');
    }

    // 7. Verify form restoration
    console.log('\n7. Verifying form restoration...');
    await page.waitForTimeout(1000);
    
    const restoredInvoiceNumber = await page.locator('input[name="invoiceNumber"], input[placeholder*="发票号"], input[id*="invoice"]').first().inputValue().catch(() => '');
    
    if (restoredInvoiceNumber === 'TEST-INV-001') {
      console.log('   ✓ Form data restored after refresh');
      console.log(`   Invoice Number: ${restoredInvoiceNumber}`);
    } else {
      console.log('   ❌ Form data NOT restored after refresh');
      console.log(`   Invoice Number: ${restoredInvoiceNumber || '(empty)'}`);
    }

    // 8. Check console errors
    console.log(`\n8. Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('   Errors:');
      consoleErrors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
    }

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Page loaded without redirect: ${!page.url().includes('/login') ? '✓' : '❌'}`);
    console.log(`localStorage has "invoice-draft": ${localStorageAfterFill.keys.includes('invoice-draft') ? '✓' : '❌'}`);
    console.log(`Form restored after refresh: ${restoredInvoiceNumber === 'TEST-INV-001' ? '✓' : '❌'}`);
    console.log(`Console errors: ${consoleErrors.length}`);

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
