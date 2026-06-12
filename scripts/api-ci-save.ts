import { chromium } from 'playwright';

const timestamp = Date.now();
const testData = {
  documentType: 'commercial-invoice',
  documentNo: `CI-E2E-${timestamp}`,
  documentData: {
    formData: {
      companyName: 'CI E2E Company 20260611',
      clientName: 'CI E2E Client 20260611',
      invoiceNo: `CI-E2E-${timestamp}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      shipper: 'CI E2E Company 20260611',
      consignee: 'CI E2E Client 20260611'
    },
    lineItems: [
      {
        description: 'phone case',
        quantity: 10,
        unitPrice: 10,
        amount: 100,
        remark: `KEEP-ME-CI-E2E-${timestamp}`
      }
    ]
  }
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  try {
    // 先访问页面确保 session 有效
    await page.goto('https://jueshi.net/workspace', { timeout: 30000 });
    console.log('✓ Session verified');

    // 调用 API
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

    console.log('\n--- API Response ---');
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(response.body, null, 2));

    if (response.status === 200 && response.body.success) {
      console.log('\n✓ Document saved successfully');
      console.log('  ID:', response.body.id);
      console.log('  CreatedAt:', response.body.createdAt);
      
      // 保存到文件供后续验证
      const fs = require('fs');
      fs.writeFileSync('scripts/ci-save-result.json', JSON.stringify(response.body, null, 2));
      console.log('✓ Result saved to scripts/ci-save-result.json');
    } else {
      console.log('\n✗ Document save failed');
    }

  } catch (error) {
    console.error('API call failed:', error);
  } finally {
    await browser.close();
  }
})();
