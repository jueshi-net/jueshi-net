import { chromium } from 'playwright';

const documentId = 'cmq9kc45300037i5p5u2vsupl';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  try {
    // 先访问页面确保 session 有效
    await page.goto('https://jueshi.net/workspace', { timeout: 30000 });
    console.log('✓ Session verified');

    // 调用 API 获取文档
    const response = await page.evaluate(async (id) => {
      const res = await fetch(`/api/user/documents?id=${id}`);
      return {
        status: res.status,
        body: await res.json()
      };
    }, documentId);

    console.log('\n--- API Response ---');
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(response.body, null, 2).substring(0, 1000));

    if (response.status === 200 && response.body.success) {
      console.log('\n✓ Document retrieved successfully');
      
      // 检查数据
      const docData = response.body.data;
      const checks = [
        { name: 'companyName', found: docData?.formData?.companyName === 'CI E2E Company 20260611' },
        { name: 'clientName', found: docData?.formData?.clientName === 'CI E2E Client 20260611' },
        { name: 'invoiceNo', found: docData?.formData?.invoiceNo?.startsWith('CI-E2E-') },
        { name: 'phone case', found: docData?.lineItems?.[0]?.description === 'phone case' },
        { name: 'KEEP-ME-CI-E2E', found: docData?.lineItems?.[0]?.remark?.includes('KEEP-ME-CI-E2E') }
      ];

      console.log('\n--- Data Verification ---');
      checks.forEach(check => {
        console.log(`${check.found ? '✓' : '✗'} ${check.name}: ${check.found ? 'Found' : 'Not found'}`);
      });

      const allPassed = checks.every(c => c.found);
      console.log(`\n${allPassed ? '✓ All checks passed' : '✗ Some checks failed'}`);
    } else {
      console.log('\n✗ Document retrieval failed');
    }

  } catch (error) {
    console.error('API call failed:', error);
  } finally {
    await browser.close();
  }
})();
