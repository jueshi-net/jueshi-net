// Final v1.14.2 verification test
const BASE = "http://127.0.0.1:3000";

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/csrf`);
  const data = await res.json();
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  if (!data.csrfToken) return null;
  const body = new URLSearchParams({ csrfToken: data.csrfToken, email, password, redirect: 'false', callbackUrl: '/' });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookies.join('; ') },
    body, redirect: 'manual',
  });
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  return [...cookies, ...setCookies].join('; ');
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json", Cookie: opts.cookie || "" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data; try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function main() {
  console.log("=== v1.14.2 Final Verification ===\n");
  const cookie = await login("test-user@local.test", "TestUser2026!");
  if (!cookie) { console.log("❌ Login failed"); return; }

  // 1. Unauthenticated redeem → 401
  console.log("1. Unauthenticated redeem");
  const u1 = await api("/api/rewards/redeem", { method: "POST", body: { rewardItemId: "fake" } });
  console.log(`   ${u1.status === 401 ? '✅' : '❌'} (${u1.status})`);

  // 2. Insufficient points
  console.log("\n2. Insufficient points redeem");
  const l1 = await api("/api/rewards", { cookie });
  const w1 = l1.data.items?.find(i => i.code === "word_export_3x");
  if (w1 && l1.data.points < 120) {
    const r = await api("/api/rewards/redeem", { method: "POST", cookie, body: { rewardItemId: w1.id } });
    console.log(`   ${r.data.error === "积分不足" ? '✅' : '❌'} (${r.data.error})`);
  }

  // 3. Successful redeem + PointLedger
  console.log("\n3. Successful redeem (50pts)");
  const before = l1.data.points;
  if (before >= 50) {
    const r = await api("/api/rewards/redeem", { method: "POST", cookie, body: { rewardItemId: l1.data.items[0].id } });
    console.log(`   ${r.data.success ? '✅' : '❌'} Success: ${r.data.success}, Remaining: ${r.data.remainingPoints}`);
    const my = await api("/api/rewards/my", { cookie });
    console.log(`   My rewards: ${(my.data.rewards || []).length} ${my.data.rewards?.length > 0 ? '✅' : '❌'}`);
  }

  // 4. Dashboard 200
  console.log("\n4. Dashboard page");
  const d = await fetch(`${BASE}/dashboard`);
  console.log(`   ${d.status === 200 ? '✅' : '❌'} (${d.status})`);

  // 5. /api/me/permissions not broken
  console.log("\n5. /api/me/permissions");
  const p = await api("/api/me/permissions", { cookie });
  console.log(`   ${p.status === 200 && p.data.role && p.data.limits?.memoMax !== undefined ? '✅' : '❌'}`);

  // 6. PM2
  console.log("\n6. Production endpoints");
  const checks = ['/', '/dashboard', '/api/me/permissions', '/tools/documents', '/tools/label-maker'];
  for (const c of checks) {
    const r = await fetch(`https://jueshi.net${c}`);
    console.log(`   ${c}: ${r.status} ${r.status === 200 ? '✅' : '❌'}`);
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
