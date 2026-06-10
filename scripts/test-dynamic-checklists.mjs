import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  for (const tool of ['address-formatter', 'shipping-calculator']) {
    const page = await browser.newPage();
    await page.goto(`https://jueshi.net/tools/${tool}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const clLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/checklists/"]'));
      return links.map(a => ({
        href: a.href,
        text: a.textContent.trim().substring(0, 40)
      }));
    });
    console.log(`${tool} checklist links:`, clLinks.length);
    clLinks.forEach(l => console.log(' -', l.text));
    
    await page.close();
  }

  await browser.close();
})().catch(console.error);
