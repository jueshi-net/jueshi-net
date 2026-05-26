// Workbench hardening test — pure fetch-based, creates users via /api/auth/register
const BASE = "http://127.0.0.1:3000";

const TEST_USERS = [
  { email: "test-workbench-a@local.test", password: "TestWB2026!", name: "WBA" },
  { email: "test-workbench-b@local.test", password: "TestWB2026!", name: "WBB" },
];

let cookieA = null;
let cookieB = null;
let linkAId = null;
let results = [];
let passCount = 0;
let failCount = 0;

function pass(test, detail = "") {
  passCount++;
  results.push({ test, status: "PASS", detail });
  console.log(`  ✅ ${test}${detail ? ": " + detail : ""}`);
}

function fail(test, detail = "") {
  failCount++;
  results.push({ test, status: "FAIL", detail });
  console.error(`  ❌ ${test}${detail ? ": " + detail : ""}`);
}

async function login(email, password) {
  const csrfRes = await fetch(BASE + "/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [];

  const body = new URLSearchParams({ csrfToken, email, password, redirect: "false", callbackUrl: "/" });
  const loginRes = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies.join("; ") },
    body,
    redirect: "manual",
  });
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  return setCookies.find(c => c.includes("authjs.session-token"));
}

async function registerUser({ email, password, name }) {
  // Try to clean existing first
  try {
    await fetch(BASE + "/api/auth/register", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {}

  const res = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  console.log(`  Register ${name}: ${res.status} ${JSON.stringify(data).slice(0, 100)}`);
  return res.status === 201 || res.status === 200;
}

function authHeaders(cookie) {
  return { Cookie: cookie, "Content-Type": "application/json" };
}

async function main() {
  console.log("=== v1.16.1 Workbench Hardening Test ===\n");

  // --- Create test users ---
  console.log("--- Create test users ---");
  for (const tu of TEST_USERS) {
    await registerUser(tu);
  }

  // --- Login ---
  console.log("\n--- Login ---");
  cookieA = await login(TEST_USERS[0].email, TEST_USERS[0].password);
  cookieB = await login(TEST_USERS[1].email, TEST_USERS[1].password);
  if (!cookieA || !cookieB) {
    console.error("Login failed! Aborting.");
    process.exit(1);
  }
  console.log("  Both users logged in\n");

  // --- Test 1: User A creates a link ---
  console.log("--- Test 1: User A creates link ---");
  const createResA = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ title: "A's Link", url: "https://example-a.com", description: "Test link from A" }),
  });
  const createDataA = await createResA.json();
  if (createResA.status === 201 && createDataA.link?.id) {
    linkAId = createDataA.link.id;
    pass("User A creates link", `id=${linkAId}`);
  } else {
    fail("User A creates link", `${createResA.status}: ${JSON.stringify(createDataA)}`);
  }

  // --- Test 2: User B tries to PATCH User A's link ---
  console.log("\n--- Test 2: Data Isolation (PATCH) ---");
  const patchB = await fetch(BASE + "/api/workbench/links/" + linkAId, {
    method: "PATCH",
    headers: authHeaders(cookieB),
    body: JSON.stringify({ title: "Hacked" }),
  });
  const patchDataB = await patchB.json();
  if ([403, 404].includes(patchB.status)) {
    pass("User B cannot PATCH User A's link", `status=${patchB.status}`);
  } else {
    fail("User B cannot PATCH User A's link", `status=${patchB.status} (expected 403/404), body: ${JSON.stringify(patchDataB).slice(0,100)}`);
  }

  // --- Test 3: User B tries to DELETE User A's link ---
  console.log("\n--- Test 3: Data Isolation (DELETE) ---");
  const delB = await fetch(BASE + "/api/workbench/links/" + linkAId, {
    method: "DELETE",
    headers: authHeaders(cookieB),
  });
  if ([403, 404].includes(delB.status)) {
    pass("User B cannot DELETE User A's link", `status=${delB.status}`);
  } else {
    fail("User B cannot DELETE User A's link", `status=${delB.status} (expected 403/404)`);
  }

  // --- Test 4: User B's summary should NOT contain User A's link ---
  console.log("\n--- Test 4: Data Isolation (Summary) ---");
  const summaryB = await fetch(BASE + "/api/workbench/summary", { headers: authHeaders(cookieB) });
  const summaryDataB = await summaryB.json();
  const foundA = summaryDataB.links.some(l => l.id === linkAId || l.title === "A's Link");
  if (!foundA) {
    pass("User B summary does NOT contain User A's link", `links count: ${summaryDataB.links.length}`);
  } else {
    fail("User B summary does NOT contain User A's link", `FOUND User A's link in B's data!`);
  }

  // --- Test 5: Link count limits (user: 20) ---
  console.log("\n--- Test 5: Link count limit (user=20) ---");
  // User B already has 0 links, create 20
  for (let i = 1; i <= 20; i++) {
    const r = await fetch(BASE + "/api/workbench/links", {
      method: "POST",
      headers: authHeaders(cookieB),
      body: JSON.stringify({ title: `B Link ${i}`, url: `https://example-b-${i}.com` }),
    });
    if (r.status !== 201) {
      fail(`Create link #${i} for User B`, `status=${r.status} (expected 201)`);
      break;
    }
  }
  // Verify 20 created
  const summaryAfter20 = await fetch(BASE + "/api/workbench/summary", { headers: authHeaders(cookieB) });
  const dataAfter20 = await summaryAfter20.json();
  if (dataAfter20.links.length === 20) {
    pass("User B created 20 links", `count=${dataAfter20.links.length}`);
  } else {
    fail("User B created 20 links", `count=${dataAfter20.links.length} (expected 20)`);
  }

  // Test 21st link
  const link21 = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeaders(cookieB),
    body: JSON.stringify({ title: "B Link 21", url: "https://example-b-21.com" }),
  });
  const link21Data = await link21.json();
  if (link21.status === 409) {
    pass("21st link returns 409", `error: ${link21Data.error}`);
  } else {
    fail("21st link returns 409", `status=${link21.status} (expected 409)`);
  }

  // --- Test 6: URL safety ---
  console.log("\n--- Test 6: URL Safety ---");
  const badUrls = [
    { url: "javascript:alert(1)", label: "javascript:" },
    { url: "data:text/html;base64,xxx", label: "data:" },
    { url: "file:///etc/passwd", label: "file:" },
    { url: "ftp://example.com", label: "ftp:" },
    { url: "", label: "empty url" },
    { url: "not-a-url", label: "no protocol" },
  ];
  for (const { url, label } of badUrls) {
    const r = await fetch(BASE + "/api/workbench/links", {
      method: "POST",
      headers: authHeaders(cookieA),
      body: JSON.stringify({ title: `Bad ${label}`, url }),
    });
    if (r.status === 400) {
      pass(`URL blocked: ${label}`, `status=400`);
    } else {
      fail(`URL blocked: ${label}`, `status=${r.status} (expected 400)`);
    }
  }
  // Good URLs
  for (const goodUrl of ["https://example.com", "http://example.com"]) {
    const r = await fetch(BASE + "/api/workbench/links", {
      method: "POST",
      headers: authHeaders(cookieA),
      body: JSON.stringify({ title: `Good ${goodUrl}`, url: goodUrl }),
    });
    if (r.status === 201) {
      pass(`URL allowed: ${goodUrl}`, `status=201`);
    } else {
      fail(`URL allowed: ${goodUrl}`, `status=${r.status} (expected 201)`);
    }
  }

  // --- Test 7: Field length limits ---
  console.log("\n--- Test 7: Field Length Limits ---");
  // Title > 80 chars
  const longTitle = "A".repeat(81);
  const r1 = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ title: longTitle, url: "https://example.com" }),
  });
  if (r1.status === 400) {
    pass("Title > 80 chars → 400");
  } else {
    fail("Title > 80 chars → 400", `status=${r1.status}`);
  }

  // Description > 200 chars
  const longDesc = "B".repeat(201);
  const r2 = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ title: "OK Title", url: "https://example.com", description: longDesc }),
  });
  if (r2.status === 400) {
    pass("Description > 200 chars → 400");
  } else {
    fail("Description > 200 chars → 400", `status=${r2.status}`);
  }

  // Empty title
  const r3 = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ title: "", url: "https://example.com" }),
  });
  if (r3.status === 400) {
    pass("Empty title → 400");
  } else {
    fail("Empty title → 400", `status=${r3.status}`);
  }

  // --- Test 8: toolKey favorites ---
  console.log("\n--- Test 8: toolKey Favorites ---");
  // Favorite a tool
  const favR = await fetch(BASE + "/api/workbench/favorites", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ toolKey: "documents" }),
  });
  if (favR.status === 201) {
    pass("Favorite tool 'documents' → 201");
  } else {
    const d = await favR.json();
    fail("Favorite tool 'documents' → 201", `status=${favR.status}: ${d.error}`);
  }

  // Duplicate favorite
  const dupR = await fetch(BASE + "/api/workbench/favorites", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ toolKey: "documents" }),
  });
  if (dupR.status === 409) {
    pass("Duplicate favorite → 409");
  } else {
    fail("Duplicate favorite → 409", `status=${dupR.status}`);
  }

  // Unfavorite
  const unfavR = await fetch(BASE + "/api/workbench/favorites/documents", {
    method: "DELETE",
    headers: authHeaders(cookieA),
  });
  if (unfavR.status === 204) {
    pass("Unfavorite → 204");
  } else {
    fail("Unfavorite → 204", `status=${unfavR.status}`);
  }

  // Empty toolKey
  const emptyKeyR = await fetch(BASE + "/api/workbench/favorites", {
    method: "POST",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ toolKey: "" }),
  });
  if (emptyKeyR.status === 400) {
    pass("Empty toolKey → 400");
  } else {
    fail("Empty toolKey → 400", `status=${emptyKeyR.status}`);
  }

  // --- Test 9: Profile type validation ---
  console.log("\n--- Test 9: Profile Type Validation ---");
  const validTypes = ["merchant", "overseas_chinese", "student", "ai_learner", "logistics", "none"];
  for (const pt of validTypes) {
    const r = await fetch(BASE + "/api/workbench/profile", {
      method: "PATCH",
      headers: authHeaders(cookieA),
      body: JSON.stringify({ profileType: pt }),
    });
    if (r.status === 200) {
      pass(`Valid profileType '${pt}' → 200`);
    } else {
      fail(`Valid profileType '${pt}' → 200`, `status=${r.status}`);
    }
  }
  // Invalid
  const badPtR = await fetch(BASE + "/api/workbench/profile", {
    method: "PATCH",
    headers: authHeaders(cookieA),
    body: JSON.stringify({ profileType: "invalid_type" }),
  });
  if (badPtR.status === 400) {
    pass("Invalid profileType → 400");
  } else {
    fail("Invalid profileType → 400", `status=${badPtR.status}`);
  }

  // --- Summary ---
  console.log("\n========================================");
  console.log(`Results: ${passCount} passed, ${failCount} failed`);
  console.log("========================================\n");

  // --- Cleanup ---
  console.log("--- Cleanup test users ---");
  // Delete test users via register API or direct approach
  for (const tu of TEST_USERS) {
    try {
      // Login to get session for deletion
      const c = await login(tu.email, tu.password);
      if (c) {
        // Try to get own user ID and delete
        // For now, use the admin cleanup approach
        console.log(`  Cleaning ${tu.email}...`);
        // We'll need to do this via a script or admin API
      }
    } catch {}
  }
  console.log("  (Cleanup will be done via prisma script after API tests)\n");

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
