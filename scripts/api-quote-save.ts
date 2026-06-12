import { chromium } from 'playwright';

const timestamp = Date.now();
const testData = {
  documentType: 'quote_sheet',
  documentNo: `QS-E2E-${timestamp}`,
  documentData: {
    formData: {
      companyName: 'QS E2E Company 20260611',
      clientName: 'QS E2E Client 20260611',
      quoteNo: `QS-E2E-${timestamp}`,
      quoteDate: new Date().toISOString().split('T')[0]
    },
    lineItems: [
      {
        description: 'test product',
        quantity: 5,
        unitPrice: 20,
        amount: 100,
        remark: `KEEP-ME-QS-E2E-${timestamp}`
      }
    ]
  }
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  try {
    await page.goto('https://jueshi.net/workspace', { timeout: 30000 });
    console.log('✓ Session verified');

    const response = await page.evaluate(async (data) => {
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return {
        status: res.status,
        body: await res.json()
      };
    }, testData);

    console.log('\n--- Quote Sheet API Response ---');
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(response.body, null, 2));

    if (response.status === 200 && response.body.success) {
      console.log('\n✓ Quote Sheet saved successfully');
      console.log('  ID:', response.body.id);
      console.log('  CreatedAt:', response.body.createdAt);
    } else {
      console.log('\n✗ Quote Sheet save failed');
    }

  } catch (error) {
    console.error('API call failed:', error);
  } finally {
    await browser.close();
  }
})();
