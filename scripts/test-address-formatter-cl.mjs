import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://jueshi.net/tools/address-formatter', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  const clLinks = await page.evaluate(() => {
    const selector = 'a[href*="/checklists/"]';
    const links = Array.from(document.querySelectorAll(selector));
    return links.map(a => ({
      href: a.href,
      text: a.textContent.trim().substring(0, 40)
    }));
  });
  console.log('Final checklist links:', clLinks.length);
  clLinks.forEach(l => console.log(' -', l.text));

  await browser.close();
})().catch(console.error);
