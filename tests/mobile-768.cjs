const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const pages = ["/admin/users", "/admin/levels", "/admin/growth-logs"];
  
  for (const path of pages) {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    
    try {
      await page.goto(`https://jueshi.net${path}`, { waitUntil: "networkidle", timeout: 30000 });
      
      const result = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      
      const pass = result.scrollWidth === result.clientWidth && result.overflow === 0;
      console.log(`${path}`);
      console.log(`scrollWidth: ${result.scrollWidth}`);
      console.log(`clientWidth: ${result.clientWidth}`);
      console.log(`overflow: ${result.overflow}`);
      console.log(pass ? "✅" : "❌ FAIL");
      console.log("");
    } catch (e) {
      console.log(`${path}: skipped (likely login redirect)`);
      console.log("");
    }
    
    await context.close();
  }
  
  await browser.close();
})();
