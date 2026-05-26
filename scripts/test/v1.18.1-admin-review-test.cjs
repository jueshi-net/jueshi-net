// v1.18.1 Real Admin Review Test — runs directly on VPS
const BASE = "http://127.0.0.1:3000";
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
require("dotenv").config({ path: ".env", quiet: true });

const TEST_USER_EMAIL = "test-review-user@local.test";
const TEST_USER_PASSWORD = "TestReviewUser2026!";
const TEST_ADMIN_EMAIL = "test-review-admin@local.test";
const TEST_ADMIN_PASSWORD = "TestReviewAdmin2026!";
const TEST_TOOL_KEY_1 = "test-tool-helium10";
const TEST_TOOL_KEY_2 = "test-tool-junglescout";
const TEST_TOOL_KEY_3 = "test-tool-amazoncalc";
const TEST_TOOL_KEY_4 = "test-tool-daily-cap-4";

let passed = 0, failed = 0;
let userAuth = {}, adminAuth = {};

function assert(c, l) { if (c) { console.log(`  ✅ ${l}`); passed++; } else { console.log(`  ❌ ${l}`); failed++; } }

async function sql(query) {
  const dbUrl = process.env.DATABASE_URL;
  const cleanUrl = dbUrl.replace(/&channel_binding=[^&]*/, '').replace(/&pgbouncer=[^&]*/, '');
  const cmd = `psql '${cleanUrl}' -c "${query.replace(/"/g, '\\"')}"`;
  const { stdout } = await execAsync(cmd);
  return stdout;
}

async function login(email, password) {
  const csrfRes = await fetch(BASE + "/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const cookies = csrfRes.headers.getSetCookie?.() ?? [];
  const body = new URLSearchParams({ csrfToken: csrfData.csrfToken, email, password, redirect: "false", callbackUrl: "/" });
  const loginRes = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies.join("; ") }, body, redirect: "manual"
  });
  const setCookies = loginRes.headers.getSetCookie?.() ?? [];
  const sessionCookie = setCookies.find(c => c.includes("authjs.session-token"));
  return { Cookie: sessionCookie, "Content-Type": "application/json" };
}

async function hashPassword(pw) {
  const { stdout } = await execAsync(`node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('${pw}', 10));"`);
  return stdout.trim();
}

async function setup() {
  console.log("\n--- Setup ---");
  await sql(`DELETE FROM tool_reviews WHERE "toolKey" LIKE 'test-tool-%'`);
  await sql(`DELETE FROM point_ledgers WHERE type = 'tool_review'`);
  await sql(`DELETE FROM users WHERE email IN ('${TEST_USER_EMAIL}', '${TEST_ADMIN_EMAIL}')`);

  const hash = await hashPassword(TEST_USER_PASSWORD);
  const hash2 = await hashPassword(TEST_ADMIN_PASSWORD);

  const h1 = hash.replace(/'/g, "''");
  const h2 = hash2.replace(/'/g, "''");
  await sql(`INSERT INTO users (id, email, password, role, name, points, createdat, updatedat) VALUES ('test-review-user', '${TEST_USER_EMAIL}', '${h1}', 'user', 'Test Review User', 100, NOW(), NOW())`);
  console.log(`  ✅ Created ${TEST_USER_EMAIL}`);
  await sql(`INSERT INTO users (id, email, password, role, name, points, createdat, updatedat) VALUES ('test-review-admin', '${TEST_ADMIN_EMAIL}', '${h2}', 'admin', 'Test Review Admin', 0, NOW(), NOW())`);
  console.log(`  ✅ Created ${TEST_ADMIN_EMAIL}`);
}

async function cleanup() {
  console.log("\n--- Cleanup ---");
  await sql(`DELETE FROM tool_reviews WHERE "toolKey" LIKE 'test-tool-%'`);
  console.log("  ✅ Deleted test reviews");
  await sql(`DELETE FROM point_ledgers WHERE type = 'tool_review'`);
  console.log("  ✅ Deleted test ledgers");
  await sql(`DELETE FROM users WHERE email IN ('${TEST_USER_EMAIL}', '${TEST_ADMIN_EMAIL}')`);
  console.log("  ✅ Deleted test users");
  const { stdout } = await sql(`SELECT COUNT(*) FROM users WHERE email LIKE 'test-review-%@local.test'`);
  const count = parseInt(stdout.trim().split('\n').pop().trim());
  assert(count === 0, `测试用户清理: ${count} remaining`);
}

async function test() {
  console.log("=== v1.18.1 Real Admin Review Test ===\n");
  await setup();

  console.log("\n--- Login ---");
  userAuth = await login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  adminAuth = await login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
  assert(!!userAuth.Cookie, "Test user login");
  assert(!!adminAuth.Cookie, "Test admin login");

  // 1: Submit review
  console.log("\n--- 1: Submit review ---");
  const r1 = await fetch(BASE + "/api/tools/reviews", { method: "POST", headers: userAuth, body: JSON.stringify({ toolKey: TEST_TOOL_KEY_1, rating: 5, content: "这个工具非常好用，强烈推荐给大家试试看效果" }) });
  const r1d = await r1.json();
  assert(r1.status === 201, `提交合法短评 → ${r1.status}`);
  assert(r1d.review?.status === "pending", "初始状态 pending");
  assert(r1d.pointsAwarded === true, "获得 +10 积分");
  const review1Id = r1d.review?.id;

  // 2: Pending not visible
  console.log("\n--- 2: Pending not visible ---");
  const g1 = await fetch(BASE + `/api/tools/reviews?toolKey=${TEST_TOOL_KEY_1}`).then(r => r.json());
  assert(g1.reviews?.length === 0, "pending 短评不在公开列表");

  // 3: Admin approves
  console.log("\n--- 3: Admin approves ---");
  const appr = await fetch(BASE + `/api/admin/tool-reviews/${review1Id}`, { method: "PATCH", headers: adminAuth, body: JSON.stringify({ status: "approved" }) });
  assert(appr.status === 200, `Admin 审核通过 → ${appr.status}`);

  // 4: Approved visible
  console.log("\n--- 4: Approved visible ---");
  const g2 = await fetch(BASE + `/api/tools/reviews?toolKey=${TEST_TOOL_KEY_1}`).then(r => r.json());
  assert(g2.reviews?.length === 1, "approved 短评在公开列表");
  assert(g2.avgRating === 5, `平均分 = ${g2.avgRating}`);

  // 5: Rankings
  console.log("\n--- 5: Rankings ---");
  const rank = await fetch(BASE + "/api/tools/rankings").then(r => r.json());
  const ranked = rank.rankings?.find(r => r.toolKey === TEST_TOOL_KEY_1);
  assert(!!ranked, "排行榜包含该工具");
  if (ranked) { assert(ranked.avgRating === 5, `排行榜 avgRating`); assert(ranked.reviewCount === 1, `排行榜 reviewCount`); }

  // 6: Admin hides
  console.log("\n--- 6: Admin hides ---");
  const hide = await fetch(BASE + `/api/admin/tool-reviews/${review1Id}`, { method: "PATCH", headers: adminAuth, body: JSON.stringify({ status: "hidden" }) });
  assert(hide.status === 200, `Admin 隐藏 → ${hide.status}`);

  // 7: Hidden not visible
  console.log("\n--- 7: Hidden not visible ---");
  const g3 = await fetch(BASE + `/api/tools/reviews?toolKey=${TEST_TOOL_KEY_1}`).then(r => r.json());
  assert(g3.reviews?.length === 0, "hidden 短评不在公开列表");

  // 8: Submit + reject
  console.log("\n--- 8: Submit + reject ---");
  const r2 = await fetch(BASE + "/api/tools/reviews", { method: "POST", headers: userAuth, body: JSON.stringify({ toolKey: TEST_TOOL_KEY_2, rating: 3, content: "这个工具一般般吧，有些地方还需要改进才行" }) }).then(r => r.json());
  const review2Id = r2.review?.id;
  const rej = await fetch(BASE + `/api/admin/tool-reviews/${review2Id}`, { method: "PATCH", headers: adminAuth, body: JSON.stringify({ status: "rejected" }) });
  assert(rej.status === 200, `Admin 拒绝 → ${rej.status}`);
  const g4 = await fetch(BASE + `/api/tools/reviews?toolKey=${TEST_TOOL_KEY_2}`).then(r => r.json());
  assert(g4.reviews?.length === 0, "rejected 短评不在公开列表");

  // 9: Non-admin blocked
  console.log("\n--- 9: Non-admin blocked ---");
  const na = await fetch(BASE + "/api/admin/tool-reviews", { headers: userAuth });
  assert(na.status === 403, `非管理员 → ${na.status}`);

  // 10: Unauthenticated redirect
  console.log("\n--- 10: Unauthenticated redirect ---");
  const unauth = await fetch(BASE + "/admin/tool-reviews", { redirect: "manual" });
  assert(unauth.status === 307 || unauth.status === 302, `未登录 → ${unauth.status}`);

  // 11: Daily cap
  console.log("\n--- 11: Daily cap ---");
  const r3 = await fetch(BASE + "/api/tools/reviews", { method: "POST", headers: userAuth, body: JSON.stringify({ toolKey: TEST_TOOL_KEY_3, rating: 4, content: "第三个工具测试内容比较长，确保字数足够" }) }).then(r => r.json());
  assert(r3.pointsAwarded === true, "第3条 +10 积分");
  const r4 = await fetch(BASE + "/api/tools/reviews", { method: "POST", headers: userAuth, body: JSON.stringify({ toolKey: TEST_TOOL_KEY_4, rating: 4, content: "第四条测试内容，今天已经提交三条了上限到了" }) }).then(r => r.json());
  assert(r4.pointsAwarded === false, "第4条不加分（每日上限 30）");

  // 12: Duplicate → 409
  console.log("\n--- 12: Duplicate → 409 ---");
  const dup = await fetch(BASE + "/api/tools/reviews", { method: "POST", headers: userAuth, body: JSON.stringify({ toolKey: TEST_TOOL_KEY_1, rating: 2, content: "重复提交测试内容很长很长很长" }) });
  assert(dup.status === 409, `同一 toolKey 重复 → ${dup.status}`);

  // 13: Non-owner edit blocked
  console.log("\n--- 13: Non-owner edit blocked ---");
  const edit = await fetch(BASE + `/api/tools/reviews/${review1Id}`, { method: "PATCH", headers: adminAuth, body: JSON.stringify({ content: "被他人修改的内容" }) });
  assert(edit.status === 403, `非 owner 编辑 → ${edit.status}`);

  // PointLedger
  console.log("\n--- PointLedger ---");
  const { stdout: ledgerOut } = await sql(`SELECT COUNT(*) FROM point_ledgers WHERE type = 'tool_review'`);
  const ledgerCount = parseInt(ledgerOut.trim().split('\n').pop().trim());
  console.log(`  → ${ledgerCount} ledger entries (expect 3)`);
  assert(ledgerCount === 3, `PointLedger 记录数 = ${ledgerCount}`);
  const { stdout: pointsOut } = await sql(`SELECT points FROM users WHERE email = 'test-review-user@local.test'`);
  const pts = parseInt(pointsOut.trim().split('\n').pop().trim());
  console.log(`  → User points: ${pts} (expect 130)`);
  assert(pts === 130, `积分 = ${pts}`);

  await cleanup();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => { console.error(e); process.exit(1); });
