import { chromium } from "playwright";

const BASE = "http://localhost:3058";
const SHOT_DIR = "artifacts/service-provider-round2b";

const pages = [
  { name: "service-detail", url: "/services/e2e-service-1", viewport: { width: 1440, height: 900 } },
  { name: "module-preview", url: "/dev/module-preview/service-provider", viewport: { width: 1440, height: 900 } },
  { name: "workspace-provider", url: "/workspace/provider", viewport: { width: 1440, height: 900 } },
  { name: "admin-provider-list", url: "/admin/service-providers", viewport: { width: 1440, height: 900 } },
  { name: "directory-mobile", url: "/service-providers", viewport: { width: 390, height: 844 } },
  { name: "workspace-provider-mobile", url: "/workspace/provider", viewport: { width: 390, height: 844 } },
  { name: "admin-provider-mobile", url: "/admin/service-providers", viewport: { width: 390, height: 844 } },
];

const browser = await chromium.launch({ headless: true });
let totalErrors = 0;
let totalOverflow = 0;

for (const page of pages) {
  const context = await browser.newContext({ viewport: page.viewport });
  const p = await context.newPage();
  const errors = [];
  const failedReqs = [];

  p.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  p.on("requestfailed", (req) => { failedReqs.push(req.url()); });

  try {
    await p.goto(BASE + page.url, { waitUntil: "networkidle", timeout: 15000 });
    await p.waitForTimeout(1000);

    const scrollWidth = await p.evaluate(() => document.body.scrollWidth);
    const innerWidth = page.viewport.width;
    const hasOverflow = scrollWidth > innerWidth;

    await p.screenshot({ path: `${SHOT_DIR}/${page.name}.png`, fullPage: false });

    console.log(`${page.name}: HTTP OK, errors=${errors.length}, failedReq=${failedReqs.length}, overflow=${hasOverflow}, scrollW=${scrollWidth}, innerW=${innerWidth}`);
    if (errors.length > 0) { console.log("  ERRORS: " + JSON.stringify(errors.slice(0, 3))); totalErrors += errors.length; }
    if (hasOverflow) { console.log("  OVERFLOW!"); totalOverflow++; }
  } catch (e) {
    console.log(`${page.name}: FAILED - ${e.message}`);
    await p.screenshot({ path: `${SHOT_DIR}/${page.name}.png`, fullPage: false }).catch(() => {});
  }

  await context.close();
}

await browser.close();
console.log(`\nTOTAL: errors=${totalErrors}, overflow=${totalOverflow}`);
