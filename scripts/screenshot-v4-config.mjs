import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const baseUrl = 'https://i.jueshi.net/ui-lab/jueshi-v4-home-candidate-v4';
  const outputDir = '/Users/chq/xixiong-saas/reports/ui-v4-home-candidate-v4-config-consumption/screenshots';

  // Desktop 1440 firstscreen
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outputDir}/desktop-1440-firstscreen.png`, fullPage: false });
  console.log('✓ desktop-1440-firstscreen.png');

  // Desktop 1440 ad groups
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/desktop-1440-ad-groups.png`, fullPage: false });
  console.log('✓ desktop-1440-ad-groups.png');

  // Desktop 1440 footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/desktop-1440-footer.png`, fullPage: false });
  console.log('✓ desktop-1440-footer.png');

  // Mobile 390 firstscreen
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outputDir}/mobile-390-firstscreen.png`, fullPage: false });
  console.log('✓ mobile-390-firstscreen.png');

  // Mobile 390 bottom tab center logo
  await page.screenshot({ path: `${outputDir}/mobile-390-bottom-tab-center-logo.png`, fullPage: false });
  console.log('✓ mobile-390-bottom-tab-center-logo.png');

  // Mobile 390 footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/mobile-390-footer.png`, fullPage: false });
  console.log('✓ mobile-390-footer.png');

  // Default avatar closeup (scroll to workspace section)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/default-avatar-closeup.png`, fullPage: false });
  console.log('✓ default-avatar-closeup.png');

  // Mobile tab center closeup
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outputDir}/mobile-tab-center-closeup.png`, fullPage: false });
  console.log('✓ mobile-tab-center-closeup.png');

  // Ad enabled hidden test (scroll to ad section)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl);
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/ad-enabled-hidden-test.png`, fullPage: false });
  console.log('✓ ad-enabled-hidden-test.png');

  // Button config test (scroll to hero section)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outputDir}/button-config-test.png`, fullPage: false });
  console.log('✓ button-config-test.png');

  await browser.close();
  console.log('\n✅ All screenshots generated successfully!');
})();
