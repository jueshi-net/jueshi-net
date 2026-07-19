import { chromium } from 'playwright';

const STORAGE_STATE = '/Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/storage-state/user-session.json';
const BASE_URL = 'https://i.jueshi.net';

async function auditPage(page, path, label, screenshotPath) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`AUDIT: ${label} (${path})`);
  console.log('='.repeat(60));

  const failedRequests = [];
  const consoleErrors = [];

  page.on('response', async (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      const request = response.request();
      let body = '';
      try { body = await response.text(); } catch {}
      failedRequests.push({ url, method: request.method(), status, body: body.substring(0, 200) });
      console.log(`  ❌ ${request.method()} ${url} → ${status}`);
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`  ⚠️ Navigation: ${e.message}`);
  }
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`  📸 ${screenshotPath}`);

  // Check for error text
  const hasError = await page.evaluate(() => {
    return document.body.innerText.includes('页面加载失败') || 
           document.body.innerText.includes('Application error');
  });

  console.log(`  Failed requests: ${failedRequests.length}`);
  console.log(`  Console errors: ${consoleErrors.length}`);
  console.log(`  Page error text: ${hasError ? 'YES ❌' : 'No ✅'}`);

  if (consoleErrors.length > 0) {
    consoleErrors.slice(0, 3).forEach((e, i) => console.log(`    ${i+1}. ${e.substring(0, 100)}`));
  }

  return { failedRequests, consoleErrors, hasError };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = [];

  // 1. Workspace (uses UserIdentityCard lg)
  results.push(await auditPage(page, '/workspace', 'Workspace', '/tmp/uid-workspace.png'));

  // 2. Forum user's own profile (uses CommunityProfileCard → UserIdentityCard md)
  results.push(await auditPage(page, '/bbs', 'Forum BBS', '/tmp/uid-forum-bbs.png'));

  // 3. Workspace products (regression check)
  results.push(await auditPage(page, '/workspace/products', 'Workspace Products', '/tmp/uid-products.png'));

  // 4. Workspace member (regression check)
  results.push(await auditPage(page, '/workspace/member', 'Workspace Member', '/tmp/uid-member.png'));

  await browser.close();

  console.log(`\n${'='.repeat(60)}`);
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));
  
  const allPassed = results.every(r => r.failedRequests.length === 0 && !r.hasError);
  results.forEach((r, i) => {
    console.log(`  Page ${i+1}: ${r.failedRequests.length} failed, ${r.consoleErrors.length} console err, error=${r.hasError}`);
  });
  console.log(`\n${allPassed ? '✅ ALL PASSED' : '❌ ISSUES FOUND'}`);
  process.exit(allPassed ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
