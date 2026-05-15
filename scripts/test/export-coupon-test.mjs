// Test word export coupon usage
const BASE = "http://127.0.0.1:3000";

async function getCsrfAndCookie() {
  const res = await fetch(`${BASE}/api/auth/csrf`);
  const data = await res.json();
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  return { csrfToken: data.csrfToken, cookies };
}

async function login(email, password) {
  const { csrfToken, cookies } = await getCsrfAndCookie();
  if (!csrfToken) return null;
  const body = new URLSearchParams({ csrfToken, email, password, redirect: 'false', callbackUrl: '/' });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookies.join('; ') },
    body, redirect: 'manual',
  });
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  return [...cookies, ...setCookies].join('; ');
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || "POST",
    headers: { "Content-Type": "application/json", Cookie: opts.cookie || "" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data; try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function main() {
  console.log("=== Word Export Coupon Test ===\n");
  const cookie = await login("test-user@local.test", "TestUser2026!");
  if (!cookie) { console.log("❌ Login failed"); return; }

  // User has 1 active word_export_coupon from previous test
  console.log("User has 3 free daily exports + 1 coupon\n");

  // Use 3 free exports
  for (let i = 1; i <= 3; i++) {
    const r = await api("/api/export/authorize", { cookie, body: { exportType: "word" } });
    console.log(`Export ${i}: status=${r.status}, remaining=${r.data.remainingToday}, usedCoupon=${r.data.usedCoupon || false}`);
  }

  // 4th export: should use coupon
  console.log("\n4th export (should use coupon):");
  const r4 = await api("/api/export/authorize", { cookie, body: { exportType: "word" } });
  console.log(`  status=${r4.status}, usedCoupon=${r4.data.usedCoupon}, remaining=${r4.data.remainingToday}`);
  console.log(`  ${r4.data.usedCoupon ? '✅ Coupon used!' : '❌ Coupon NOT used'}`);

  // 5th export: should be rejected (no coupon left, daily limit reached)
  console.log("\n5th export (should be rejected):");
  const r5 = await api("/api/export/authorize", { cookie, body: { exportType: "word" } });
  console.log(`  status=${r5.status}, error=${r5.data.error}`);
  console.log(`  ${r5.status === 403 ? '✅ Correctly rejected' : '❌ Should be rejected'}`);

  // Verify coupon is now "used"
  const my = await api("/api/rewards/my", { cookie });
  const coupon = (my.data.rewards || []).find(r => r.rewardType === "word_export_coupon");
  console.log(`\nCoupon status: ${coupon?.status} (expected: used)`);
  console.log(`${coupon?.status === 'used' ? '✅' : '❌'}`);

  console.log("\n=== Done ===");
}

main().catch(console.error);
