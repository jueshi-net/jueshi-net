import { chromium } from 'playwright';

const STORAGE_STATE = '/Users/chq/xixiong-saas/tools/jueshi-audit/artifacts/storage-state/user-session.json';
const BASE_URL = 'https://i.jueshi.net';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const failedRequests = [];
  const consoleErrors = [];

  page.on('response', async (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && url.includes(BASE_URL)) {
      failedRequests.push({ url, status });
      console.log(`  ❌ ${response.request().method()} ${url} → ${status}`);
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Go to BBS and find a user profile link
  await page.goto(`${BASE_URL}/bbs`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Find a user profile link (/u/...)
  const profileLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/u/"]'));
    return links.map(a => a.getAttribute('href')).filter(Boolean).slice(0, 5);
  });

  console.log(`Found ${profileLinks.length} profile links:`, profileLinks);

  if (profileLinks.length > 0) {
    const profileUrl = profileLinks[0];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`AUDIT: User Profile (${profileUrl})`);
    console.log('='.repeat(60));

    await page.goto(`${BASE_URL}${profileUrl}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/tmp/uid-user-profile.png', fullPage: false });
    console.log('  📸 /tmp/uid-user-profile.png');

    const hasError = await page.evaluate(() => {
      return document.body.innerText.includes('页面加载失败') || 
             document.body.innerText.includes('Application error');
    });

    console.log(`  Failed requests: ${failedRequests.length}`);
    console.log(`  Console errors: ${consoleErrors.length}`);
    console.log(`  Page error text: ${hasError ? 'YES ❌' : 'No ✅'}`);

    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((e, i) => console.log(`    ${i+1}. ${e.substring(0, 120)}`));
    }

    // Check that UserIdentityCard is rendering (look for avatar + name + level)
    const hasIdentity = await page.evaluate(() => {
      // Check for avatar (gradient circle with initial)
      const avatar = document.querySelector('.rounded-full.bg-gradient-to-br');
      // Check for level badge
      const levelBadge = document.querySelector('.rounded-full.border');
      return { hasAvatar: !!avatar, hasLevelBadge: !!levelBadge };
    });
    console.log(`  Identity rendering: avatar=${hasIdentity.hasAvatar}, levelBadge=${hasIdentity.hasLevelBadge}`);
  } else {
    console.log('No profile links found on BBS page');
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
