// Redemption API test - v1.14.2
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
  const cookieHeader = cookies.join('; ');
  const body = new URLSearchParams({ csrfToken, email, password, redirect: 'false', callbackUrl: '/' });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookieHeader },
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
  console.log("=== v1.14.2 Redemption Test ===\n");
  
  const cookie = await login("test-user@local.test", "TestUser2026!");
  if (!cookie) { console.log("❌ Login failed"); return; }
  
  const session = await api("/api/auth/session", { cookie });
  console.log(`Logged in as: ${session.data?.user?.email}`);

  // Test 1: Unauthenticated
  console.log("\n1. Unauthenticated redeem");
  const u1 = await api("/api/rewards/redeem", { method: "POST", body: { rewardItemId: "fake" } });
  console.log(`   Status: ${u1.status} (expect 401) ${u1.status === 401 ? '✅' : '❌'}`);

  // Test 2: List rewards
  console.log("\n2. List rewards");
  const l1 = await api("/api/rewards", { cookie });
  console.log(`   Items: ${(l1.data.items || []).length}, Points: ${l1.data.points}`);
  const w1 = (l1.data.items || []).find(i => i.code === "word_export_1x");
  const w3 = (l1.data.items || []).find(i => i.code === "word_export_3x");
  console.log(`   word_export_1x: ${w1 ? `${w1.name} (${w1.costPoints}pts)` : 'NOT FOUND'} ${w1 ? '✅' : '❌'}`);
  console.log(`   word_export_3x: ${w3 ? `${w3.name} (${w3.costPoints}pts)` : 'NOT FOUND'} ${w3 ? '✅' : '❌'}`);

  // Test 3: Insufficient points
  console.log("\n3. Insufficient points");
  if (w1 && l1.data.points < 50) {
    const r1 = await api("/api/rewards/redeem", { method: "POST", cookie, body: { rewardItemId: w1.id } });
    console.log(`   Status: ${r1.status}, Error: ${r1.data.error}`);
    console.log(`   ${r1.data.error === "积分不足" ? '✅' : '❌'}`);
  }

  // Add points via checkin + tasks
  console.log("\n4. Preparing points (checkin + tasks)");
  await api("/api/checkin", { method: "POST", cookie });
  let pts = (await api("/api/rewards", { cookie })).data.points || 0;
  console.log(`   After checkin: ${pts}pts`);
  
  // Create and complete tasks until we have 50 points
  let taskCount = 0;
  while (pts < 50 && taskCount < 15) {
    const t = await api("/api/tasks", { method: "POST", cookie, body: { title: `prep ${taskCount}` } });
    if (t.status === 200) {
      await api(`/api/tasks/${t.data.task.id}`, { method: "PATCH", cookie, body: { status: "done" } });
    }
    pts = (await api("/api/rewards", { cookie })).data.points || 0;
    taskCount++;
  }
  console.log(`   After tasks: ${pts}pts (needed 50)`);

  // Test 5: Successful redeem
  console.log("\n5. Redeem word_export_1x (50pts)");
  const before = (await api("/api/rewards", { cookie })).data.points;
  const w1fresh = (await api("/api/rewards", { cookie })).data.items?.find(i => i.code === "word_export_1x");
  if (w1fresh && before >= 50) {
    const r = await api("/api/rewards/redeem", { method: "POST", cookie, body: { rewardItemId: w1fresh.id } });
    console.log(`   Status: ${r.status}`);
    console.log(`   Success: ${r.data.success}`);
    console.log(`   Remaining: ${r.data.remainingPoints}`);
    console.log(`   ${r.data.success ? '✅' : '❌'}`);

    // Verify my rewards
    const my = await api("/api/rewards/my", { cookie });
    console.log(`   My rewards count: ${(my.data.rewards || []).length}`);
    if (my.data.rewards?.length > 0) {
      console.log(`   Latest: ${my.data.rewards[0].rewardItem?.name} (${my.data.rewards[0].status})`);
    }
    console.log(`   ${my.data.rewards?.length > 0 ? '✅' : '❌'}`);
  } else {
    console.log(`   Cannot test: points=${before}, item=${w1fresh ? 'found' : 'not found'}`);
  }

  // Test 6: Duplicate redeem (same item, should fail if no points)
  console.log("\n6. Duplicate redeem check");
  const afterPts = (await api("/api/rewards", { cookie })).data.points;
  if (afterPts < 50 && w1fresh) {
    const dup = await api("/api/rewards/redeem", { method: "POST", cookie, body: { rewardItemId: w1fresh.id } });
    console.log(`   Status: ${dup.status}, Error: ${dup.data.error}`);
    console.log(`   ${dup.data.error === "积分不足" ? '✅' : '❌'}`);
  }

  // Test 7: Dashboard
  console.log("\n7. Dashboard page");
  const d = await fetch(`${BASE}/dashboard`);
  console.log(`   Status: ${d.status} ${d.status === 200 ? '✅' : '❌'}`);

  // Test 8: Permissions
  console.log("\n8. /api/me/permissions");
  const p = await api("/api/me/permissions", { cookie });
  console.log(`   Status: ${p.status}, role: ${p.data.role}, points: ${p.data.points}`);
  console.log(`   ${p.status === 200 && p.data.limits?.memoMax !== undefined ? '✅' : '❌'}`);

  console.log("\n=== Done ===");
}

main().catch(console.error);
