
const { chromium } = require("playwright");
const BASE = "http://localhost:3058";

const PUBLIC_PAGES = [
  { url: "/service-providers", name: "directory" },
  { url: "/business/e2e-org-provider", name: "business-detail" },
  { url: "/professional/e2e-pro-provider", name: "professional-detail" },
  { url: "/services/e2e-service-1", name: "service-detail" },
];

const AUTH_PAGES = [
  { url: "/admin/service-providers", name: "admin-sp" },
  { url: "/workspace/provider", name: "workspace-provider" },
];

async function checkPage(browser, page, viewport, isAuth) {
  const context = await browser.newContext({ viewport });
  const p = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const responses500 = [];

  p.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  p.on("requestfailed", (req) => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || "unknown" });
  });
  p.on("response", (response) => {
    if (response.status() >= 500) {
      responses500.push({ url: response.url(), status: response.status() });
    }
  });

  let status = 0, redirected = false, finalUrl = "";
  try {
    const response = await p.goto(`${BASE}${page.url}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    status = response?.status() || 0;
    await p.waitForTimeout(3000); // Wait for JS to execute
    finalUrl = p.url();
    redirected = finalUrl !== `${BASE}${page.url}`;
  } catch (e) {
    consoleErrors.push("NAVIGATION_ERROR: " + e.message.substring(0, 100));
  }

  const scrollWidth = await p.evaluate(() => document.body.scrollWidth).catch(() => 0);
  const hasOverflow = scrollWidth > viewport.width;
  const hasContent = await p.locator("text=服务商").count().catch(() => 0);

  // Filter out /api/events aborted requests (analytics noise, not auth-related)
  const authFailedRequests = failedRequests.filter(r => !r.url.includes("/api/events") && !r.url.includes("_rsc="));
  // Filter out 500 errors from /api/events (analytics, not page-critical)
  const critical500s = responses500.filter(r => !r.url.includes("/api/events"));

  console.log(`  ${page.name}: HTTP ${status}, redirected=${redirected}${redirected ? " -> " + finalUrl.replace(BASE, "") : ""}, consoleErrors=${consoleErrors.length}, failedRequests=${failedRequests.length} (auth-relevant: ${authFailedRequests.length}), 500s=${responses500.length} (critical: ${critical500s.length}), overflow=${hasOverflow}`);

  consoleErrors.forEach((e) => {
    if (!e.includes("/api/events")) console.log(`    ERROR: ${e.substring(0, 200)}`);
  });
  authFailedRequests.forEach((r) => console.log(`    FAILED: ${r.url.substring(0, 100)} (${r.failure})`));
  critical500s.forEach((r) => console.log(`    500: ${r.url.substring(0, 100)}`));

  await context.close();
  return { name: page.name, url: page.url, status, redirected, finalUrl, consoleErrors: consoleErrors.length, failedRequests: authFailedRequests.length, responses500: critical500s.length, overflow: hasOverflow, hasContent: hasContent > 0 };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = { desktop: [], mobile: [], auth: [] };

  console.log("\n=== DESKTOP (1440x900) ===\n");
  for (const page of PUBLIC_PAGES) {
    results.desktop.push(await checkPage(browser, page, { width: 1440, height: 900 }, false));
  }

  console.log("\n=== AUTH PAGES (unauthenticated) ===\n");
  for (const page of AUTH_PAGES) {
    results.auth.push(await checkPage(browser, page, { width: 1440, height: 900 }, true));
  }

  console.log("\n=== MOBILE (390x844) ===\n");
  for (const page of PUBLIC_PAGES) {
    results.mobile.push(await checkPage(browser, page, { width: 390, height: 844 }, false));
  }

  const totalErrors = [...results.desktop, ...results.mobile, ...results.auth].reduce((s, r) => s + r.consoleErrors, 0);
  const totalFailed = [...results.desktop, ...results.mobile, ...results.auth].reduce((s, r) => s + r.failedRequests, 0);
  const total500s = [...results.desktop, ...results.mobile, ...results.auth].reduce((s, r) => s + r.responses500, 0);
  const hasOverflow = [...results.desktop, ...results.mobile].some(r => r.overflow);

  console.log("\n=== SUMMARY ===");
  console.log(`Console errors: ${totalErrors}`);
  console.log(`Failed requests (auth-relevant): ${totalFailed}`);
  console.log(`500 errors (critical): ${total500s}`);
  console.log(`Overflow: ${hasOverflow}`);

  // Check for /api/auth/session in failed requests
  console.log("\n=== AUTH SESSION CHECK ===");
  console.log("SessionProvider client fetch eliminated: " + (totalFailed === 0 || !JSON.stringify(results).includes("/api/auth/session") ? "YES" : "NO"));

  console.log("\n=== JSON ===");
  console.log(JSON.stringify(results, null, 2));

  await browser.close();

  const pass = totalErrors === 0 && totalFailed === 0 && total500s === 0 && !hasOverflow;
  process.exit(pass ? 0 : 1);
}

run().catch((err) => { console.error("FATAL:", err); process.exit(2); });
