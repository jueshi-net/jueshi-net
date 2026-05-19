
const { chromium } = require("playwright");
const { URL } = require("url");
const https = require("https");

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname, port: 443,
      path: parsed.pathname + parsed.search, method: options.method || "GET",
      headers: options.headers || {}
    }, (res) => {
      let body = "";
      res.on("data", (c) => body += c);
      res.on("end", () => {
        let parsed; try { parsed = JSON.parse(body); } catch { parsed = body; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function getAdminCookies() {
  const csrfRes = await httpRequest("https://jueshi.net/api/auth/csrf");
  const csrfToken = csrfRes.body?.csrfToken;
  if (!csrfToken) return null;
  let cookies = [];
  if (csrfRes.headers["set-cookie"]) { const sc = csrfRes.headers["set-cookie"]; cookies = Array.isArray(sc) ? sc : [sc]; }
  const body = new URLSearchParams({ csrfToken, email: "test-admin@local.test", password: "TestAdmin2026!", redirect: "false", callbackUrl: "/" }).toString();
  const loginRes = await httpRequest("https://jueshi.net/api/auth/callback/credentials", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": cookies.join("; ") }, body
  });
  let sc = [];
  if (loginRes.headers["set-cookie"]) { const s = loginRes.headers["set-cookie"]; sc = Array.isArray(s) ? s : [s]; }
  const allCookies = [...cookies, ...sc].join("; ");
  const session = await httpRequest("https://jueshi.net/api/auth/session", { headers: { "Cookie": allCookies } });
  console.log("Admin session:", JSON.stringify(session.body).substring(0, 200));
  return session.body?.user?.role === "admin" ? allCookies : null;
}

async function getUserCookies() {
  const csrfRes = await httpRequest("https://jueshi.net/api/auth/csrf");
  const csrfToken = csrfRes.body?.csrfToken;
  if (!csrfToken) return null;
  let cookies = [];
  if (csrfRes.headers["set-cookie"]) { const sc = csrfRes.headers["set-cookie"]; cookies = Array.isArray(sc) ? sc : [sc]; }
  const body = new URLSearchParams({ csrfToken, email: "test-user@local.test", password: "TestUser2026!", redirect: "false", callbackUrl: "/" }).toString();
  const loginRes = await httpRequest("https://jueshi.net/api/auth/callback/credentials", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": cookies.join("; ") }, body
  });
  let sc = [];
  if (loginRes.headers["set-cookie"]) { const s = loginRes.headers["set-cookie"]; sc = Array.isArray(s) ? s : [s]; }
  const allCookies = [...cookies, ...sc].join("; ");
  const session = await httpRequest("https://jueshi.net/api/auth/session", { headers: { "Cookie": allCookies } });
  console.log("User session:", JSON.stringify(session.body).substring(0, 200));
  return session.body?.user?.email ? allCookies : null;
}

function parseCookieStr(cookieStr) {
  return cookieStr.split("; ").filter(c => c.includes("=")).map(c => {
    const eq = c.indexOf("=");
    const name = c.substring(0, eq);
    const value = c.substring(eq + 1);
    return {
      name, value, domain: "jueshi.net", path: "/",
      secure: name.startsWith("__Secure") || name.startsWith("__Host"),
      httpOnly: name.startsWith("__Secure") || name.startsWith("__Host")
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const results = [];
  let passCount = 0, failCount = 0;

  function check(name, pass, detail = "") {
    if (pass) { passCount++; results.push(`✅ ${name}${detail ? " — " + detail : ""}`); }
    else { failCount++; results.push(`❌ ${name}${detail ? " — " + detail : ""}`); }
  }

  // ==========================================
  // A. Guest view
  // ==========================================
  console.log("\n=== A: Guest View ===\n");

  const gCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const gPage = await gCtx.newPage();
  await gPage.goto("https://jueshi.net/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await gPage.waitForTimeout(2000);

  // Check "论坛" in desktop nav (not "社区")
  const forumLink = await gPage.locator('nav a[href="/bbs"]').first();
  const forumText = await forumLink.textContent().catch(() => "");
  const forumVisible = await forumLink.isVisible().catch(() => false);
  check("Guest 1440px: '论坛' in desktop nav", forumVisible && forumText === "论坛", `text: "${forumText}"`);

  // Click → /bbs
  if (forumVisible) {
    await forumLink.click();
    await gPage.waitForURL("**/bbs", { timeout: 10000 });
    check("Guest: Click '论坛' → /bbs", gPage.url().includes("/bbs"));
  }
  await gPage.close();

  // 375px mobile: "论坛" in hamburger menu
  const g375 = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const g375Page = await g375.newPage();
  await g375Page.goto("https://jueshi.net/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await g375Page.waitForTimeout(1000);
  await g375Page.locator('button[aria-label="菜单"]').first().click();
  await g375Page.waitForTimeout(500);
  const mobileForumLinks = await g375Page.locator('a[href="/bbs"]').all();
  const mobileForumText = mobileForumLinks.length > 0 ? await mobileForumLinks[mobileForumLinks.length - 1].textContent() : "";
  const mobileForumVisible = mobileForumLinks.length > 0;
  check("Guest 375px: '论坛' in hamburger menu", mobileForumVisible, `text: "${mobileForumText}"`);
  const g375ov = await g375Page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("Guest 375px: No overflow", g375ov === 0, `overflow: ${g375ov}`);
  await g375Page.close();

  // 768px
  const g768 = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const g768Page = await g768.newPage();
  await g768Page.goto("https://jueshi.net/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await g768Page.waitForTimeout(1000);
  const g768ov = await g768Page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("Guest 768px: No overflow", g768ov === 0, `overflow: ${g768ov}`);
  await g768Page.close();
  await gCtx.close();

  // ==========================================
  // B. User view
  // ==========================================
  console.log("\n=== B: User View ===\n");

  const userCookie = await getUserCookies();
  if (!userCookie) { check("User: Login", false, "Failed"); }
  else {
    check("User: Login", true);
    const uCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const c of parseCookieStr(userCookie)) await uCtx.addCookies([c]);

    const uPage = await uCtx.newPage();
    await uPage.goto("https://jueshi.net/", { waitUntil: "domcontentloaded", timeout: 15000 });
    await uPage.waitForTimeout(2000);

    // Check "论坛"
    const uForumText = await uPage.locator('nav a[href="/bbs"]').first().textContent().catch(() => "");
    check("User 1440px: '论坛' in desktop nav", uForumText === "论坛", `text: "${uForumText}"`);

    // User dropdown
    await uPage.locator('button:has-text("test-user")').first().click();
    await uPage.waitForTimeout(500);
    for (const [name, href] of [["工作台", "/dashboard"], ["成长任务", "/dashboard/tasks"], ["通知中心", "/dashboard/notifications"]]) {
      const vis = await uPage.locator(`a[href="${href}"]`).first().isVisible().catch(() => false);
      check(`User dropdown: ${name}`, vis);
    }

    // /admin blocked
    await uPage.goto("https://jueshi.net/admin", { waitUntil: "domcontentloaded", timeout: 15000 });
    check("User: /admin blocked", !uPage.url().includes("/admin"), `→ ${uPage.url()}`);

    await uPage.close();
    await uCtx.close();
  }

  // ==========================================
  // C. Admin view — FULL TEST
  // ==========================================
  console.log("\n=== C: Admin View ===\n");

  const adminCookie = await getAdminCookies();
  if (!adminCookie) { check("Admin: Login", false, "Failed"); }
  else {
    check("Admin: Login", true, "test-admin@local.test");
    const aCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const c of parseCookieStr(adminCookie)) await aCtx.addCookies([c]);

    const aPage = await aCtx.newPage();
    await aPage.goto("https://jueshi.net/", { waitUntil: "domcontentloaded", timeout: 15000 });
    await aPage.waitForTimeout(2000);

    // "论坛" in nav
    const aForumText = await aPage.locator('nav a[href="/bbs"]').first().textContent().catch(() => "");
    check("Admin 1440px: '论坛' in desktop nav", aForumText === "论坛", `text: "${aForumText}"`);

    // Admin dropdown: "管理后台"
    await aPage.locator('button:has-text("test-admin")').first().click();
    await aPage.waitForTimeout(500);
    const adminMenuVis = await aPage.locator('a[href="/admin"]').first().isVisible().catch(() => false);
    check("Admin dropdown: '管理后台'", adminMenuVis);

    // Click → /admin
    await aPage.locator('a[href="/admin"]').first().click();
    await aPage.waitForURL("**/admin**", { timeout: 10000 });
    check("Admin: Click → /admin", aPage.url().includes("/admin"));

    // ALL 11 admin sub-pages
    const adminPages = [
      "/admin", "/admin/users", "/admin/levels", "/admin/growth-logs",
      "/admin/tool-reviews", "/admin/forum", "/admin/topics",
      "/admin/notifications", "/admin/cms", "/admin/settings", "/admin/backup"
    ];
    for (const p of adminPages) {
      await aPage.goto(`https://jueshi.net${p}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await aPage.waitForTimeout(1000);
      const actualUrl = aPage.url();
      const ok = actualUrl.includes(p);
      check(`Admin: ${p}`, ok, `→ ${actualUrl.split("/").slice(3).join("/")}`);
    }

    // Admin 768px no overflow
    await aPage.setViewportSize({ width: 768, height: 1024 });
    await aPage.goto("https://jueshi.net/admin", { waitUntil: "domcontentloaded", timeout: 15000 });
    await aPage.waitForTimeout(1500);
    const aov768 = await aPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check("Admin 768px: /admin no overflow", aov768 === 0, `overflow: ${aov768}`);

    await aPage.close();
    await aCtx.close();
  }

  // ==========================================
  // D. /admin/notifications permission tests
  // ==========================================
  console.log("\n=== D: Permission Tests ===\n");

  // Unauthenticated → 307 to /login
  const unauthRes = await httpRequest("https://jueshi.net/admin/notifications");
  check("Unauth /admin/notifications: 307 → login", unauthRes.status === 307 || unauthRes.status === 302, `status: ${unauthRes.status}`);

  // User → blocked
  if (userCookie) {
    const uCtx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const c of parseCookieStr(userCookie)) await uCtx2.addCookies([c]);
    const uP = await uCtx2.newPage();
    await uP.goto("https://jueshi.net/admin/notifications", { waitUntil: "domcontentloaded", timeout: 15000 });
    await uP.waitForTimeout(1000);
    const userBlocked = !uP.url().includes("/admin");
    check("User /admin/notifications: blocked", userBlocked, `→ ${uP.url()}`);
    await uP.close();
    await uCtx2.close();
  }

  // Admin → 200
  if (adminCookie) {
    const aCtx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const c of parseCookieStr(adminCookie)) await aCtx2.addCookies([c]);
    const aP = await aCtx2.newPage();
    await aP.goto("https://jueshi.net/admin/notifications", { waitUntil: "domcontentloaded", timeout: 15000 });
    await aP.waitForTimeout(2000);
    const adminOk = aP.url().includes("/admin/notifications");
    check("Admin /admin/notifications: 200, page renders", adminOk, `url: ${aP.url()}`);
    // Check page content exists
    const hasContent = await aP.locator('text=通知管理').first().isVisible().catch(() => false);
    check("Admin /admin/notifications: Page content visible", hasContent);
    await aP.close();
    await aCtx2.close();
  }

  // ==========================================
  // E. Tools 375px
  // ==========================================
  console.log("\n=== E: Tools 375px ===\n");

  const toolPages = ["/tools/document-tools", "/tools/commercial-invoice", "/tools/shipping-label", "/tools/quote-sheet", "/tools/inbound-receipt", "/tools/handover-note", "/tools/debit-note"];
  const tCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  for (const p of toolPages) {
    const tp = await tCtx.newPage();
    await tp.goto(`https://jueshi.net${p}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await tp.waitForTimeout(1000);
    const ov = await tp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`Tools 375px: ${p}`, ov === 0, `overflow: ${ov}`);
    await tp.close();
  }
  await tCtx.close();

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n========================================");
  console.log(`RESULTS: ${passCount} passed, ${failCount} failed`);
  console.log("========================================\n");
  for (const r of results) { console.log(r); }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
