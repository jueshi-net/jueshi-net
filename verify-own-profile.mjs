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

  // Get current user ID from session
  await page.goto(`${BASE_URL}/api/auth/session`, { waitUntil: 'networkidle', timeout: 30000 });
  const sessionText = await page.evaluate(() => document.body.innerText);
  let userId = null;
  try {
    const session = JSON.parse(sessionText);
    userId = session?.user?.id;
    console.log(`Current user ID: ${userId}`);
  } catch (e) {
    console.log('Could not parse session:', sessionText.substring(0, 200));
  }

  if (userId) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`AUDIT: Own User Profile (/u/${userId})`);
    console.log('='.repeat(60));

    await page.goto(`${BASE_URL}/u/${userId}`, { waitUntil: 'networkidle', timeout: 30000 });
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

    // Check that UserIdentityCard is rendering via CommunityProfileCard
    const identityCheck = await page.evaluate(() => {
      // Look for the CommunityProfileCard container
      const card = document.querySelector('.rounded-2xl.border.border-gray-100');
      // Look for avatar (gradient circle)
      const avatar = document.querySelector('.rounded-full.bg-gradient-to-br');
      // Look for level badge with star icon
      const levelBadges = document.querySelectorAll('.rounded-full.border');
      // Look for checkin section
      const checkinSection = document.body.innerText.includes('连续签到');
      // Look for tasks section
      const tasksSection = document.body.innerText.includes('今日任务');
      
      return {
        hasCard: !!card,
        hasAvatar: !!avatar,
        levelBadgeCount: levelBadges.length,
        hasCheckin: checkinSection,
        hasTasks: tasksSection,
      };
    });
    
    console.log(`  CommunityProfileCard check:`);
    console.log(`    Card container: ${identityCheck.hasCard ? '✅' : '❌'}`);
    console.log(`    Avatar (UserIdentityCard): ${identityCheck.hasAvatar ? '✅' : '❌'}`);
    console.log(`    Level badges: ${identityCheck.levelBadgeCount}`);
    console.log(`    Checkin section: ${identityCheck.hasCheckin ? '✅' : '❌'}`);
    console.log(`    Tasks section: ${identityCheck.hasTasks ? '✅' : '❌'}`);
  } else {
    console.log('Could not get user ID');
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
