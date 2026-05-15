// API Blackbox Test: Task daily cap - v2 with proper CSRF cookie handling
const BASE = "http://127.0.0.1:3000";

// Use a cookie jar approach
async function getCsrfAndCookie() {
  const res = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { 'Accept': 'application/json' },
  });
  const data = await res.json();
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  return { csrfToken: data.csrfToken, cookies };
}

async function login(email, password) {
  // Get CSRF token + cookie
  const { csrfToken, cookies } = await getCsrfAndCookie();
  console.log(`CSRF: ${csrfToken ? 'yes' : 'no'}, Cookies: ${cookies.length}`);

  if (!csrfToken) return null;

  // Build cookie header for login request
  const cookieHeader = cookies.join('; ');

  // POST credentials callback
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: 'false',
    callbackUrl: '/',
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader,
    },
    body,
    redirect: 'manual',
  });

  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  console.log(`Login status: ${loginRes.status}, redirect: ${loginRes.headers.get('location') || 'none'}`);
  console.log(`Response cookies: ${setCookies.length}`);

  // Combine all cookies
  const allCookies = [...cookies, ...setCookies];
  const sessionCookie = allCookies.find(c => c.includes('next-auth.session-token') || c.includes('authjs.session-token'));
  
  if (sessionCookie) {
    console.log(`Session: ${sessionCookie.substring(0, 50)}...`);
    return allCookies.join('; ');
  }

  // If redirect is to error, check for error
  const loc = loginRes.headers.get('location') || '';
  if (loc.includes('error=')) {
    console.log(`Login error: ${loc}`);
  }

  return null;
}

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: opts.cookie || "",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function runTest(cookie) {
  console.log("\n=== Task Daily Cap API Test ===\n");

  // Verify we're authenticated
  const meRes = await api("/api/auth/session", { cookie });
  console.log(`Session check: ${meRes.status}`);
  if (meRes.data?.user) {
    console.log(`Logged in as: ${meRes.data.user.email} (${meRes.data.user.name || 'no name'})`);
  }

  // Clean up
  console.log("\n--- Cleanup ---");
  const tasksRes = await api("/api/tasks?status=all", { cookie });
  const tasks = tasksRes.data.tasks || [];
  console.log(`Deleting ${tasks.length} existing tasks`);
  for (const task of tasks) {
    await api(`/api/tasks/${task.id}`, { method: "DELETE", cookie });
  }

  // Create 11 tasks
  console.log("\n--- Creating 11 tasks ---");
  const taskIds = [];
  for (let i = 1; i <= 11; i++) {
    const res = await api("/api/tasks", {
      method: "POST", cookie,
      body: { title: `API Test ${i}`, priority: "normal" }
    });
    if (res.status === 200) {
      taskIds.push(res.data.task.id);
      console.log(`  Task ${i}: created`);
    } else {
      console.log(`  Task ${i}: FAILED (${res.status})`);
    }
  }

  // Complete all 11
  console.log("\n--- Completing tasks ---");
  for (let i = 0; i < taskIds.length; i++) {
    const res = await api(`/api/tasks/${taskIds[i]}`, {
      method: "PATCH", cookie,
      body: { status: "done" }
    });
    if (res.status === 200) {
      const earned = res.data.pointsEarned || 0;
      const rem = res.data.dailyTaskPointsRemaining;
      console.log(`  Task ${i + 1}/11: ${earned > 0 ? `+${earned} (remaining: ${rem})` : `+0 (CAP REACHED)`}`);
    } else {
      console.log(`  Task ${i + 1}/11: FAILED (${res.status})`);
    }
  }

  // Duplicate prevention
  console.log("\n--- Duplicate prevention ---");
  await api(`/api/tasks/${taskIds[0]}`, { method: "PATCH", cookie, body: { status: "pending" } });
  console.log("  Task 1 re-opened");
  const re = await api(`/api/tasks/${taskIds[0]}`, { method: "PATCH", cookie, body: { status: "done" } });
  console.log(`  Task 1 re-completed: +${re.data.pointsEarned || 0} pts (expected: 0)`);

  // Dashboard
  console.log("\n--- Dashboard ---");
  const dash = await api("/api/dashboard/summary", { cookie });
  console.log(`  points=${dash.data.points}, todayEarned=${dash.data.todayEarned}, cap=${dash.data.dailyPointCap}`);

  // Ledger
  const logs = await api("/api/points/logs?limit=50", { cookie });
  const tl = (logs.data.logs || []).filter(l => l.type === "task_complete");
  const total = tl.reduce((s, l) => s + l.points, 0);

  console.log("\n=== Verdict ===");
  console.log(`  task_complete entries: ${tl.length} (expect 10) ${tl.length === 10 ? '✅' : '❌'}`);
  console.log(`  Total points: ${total} (expect 20) ${total === 20 ? '✅' : '❌'}`);
  console.log(`  Duplicate blocked: ${(re.data.pointsEarned || 0) === 0 ? '✅' : '❌'}`);
  const pass = tl.length === 10 && total === 20 && (re.data.pointsEarned || 0) === 0;
  console.log(`\n  ${pass ? '✅ PASS' : '❌ FAIL'}`);
}

async function main() {
  console.log("Login: test-user@local.test\n");
  let cookie = await login("test-user@local.test", "TestUser2026!");
  if (!cookie) {
    console.log("\nLogin: test-member@local.test\n");
    cookie = await login("test-member@local.test", "TestMember2026!");
  }
  if (!cookie) {
    console.log("Login failed.");
    return;
  }
  await runTest(cookie);
}

main().catch(console.error);
