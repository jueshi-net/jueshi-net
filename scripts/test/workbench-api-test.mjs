const BASE = "http://127.0.0.1:3000";
const EMAIL = "test-user@local.test";
const PASSWORD = "TestUser2026!";

async function test() {
  // Login
  const csrfRes = await fetch(BASE + "/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [];
  
  const body = new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, redirect: "false", callbackUrl: "/" });
  const loginRes = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": cookies.join("; ") },
    body,
    redirect: "manual",
  });
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  const sessionCookie = setCookies.find(c => c.includes("authjs.session-token"));
  const authHeader = { "Cookie": sessionCookie, "Content-Type": "application/json" };
  
  console.log("=== Test 2: Login + Summary ===");
  const summaryRes = await fetch(BASE + "/api/workbench/summary", { headers: authHeader });
  console.log("GET /api/workbench/summary:", summaryRes.status);
  const summaryData = await summaryRes.json();
  console.log("profileType:", summaryData.profileType, "links:", summaryData.links.length, "maxLinks:", summaryData.limits.maxLinks);
  
  console.log("\n=== Test 3: Create Link ===");
  const createRes = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ title: "Google", url: "https://www.google.com", description: "Search engine" }),
  });
  console.log("POST /api/workbench/links:", createRes.status);
  const createData = await createRes.json();
  const linkId = createData.link?.id;
  console.log("linkId:", linkId);
  
  console.log("\n=== Test 4: Invalid URL ===");
  const badUrlRes = await fetch(BASE + "/api/workbench/links", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ title: "Bad", url: "javascript:alert(1)" }),
  });
  console.log("POST javascript: URL:", badUrlRes.status);
  
  console.log("\n=== Test 5: Favorite Tool ===");
  const favRes = await fetch(BASE + "/api/workbench/favorites", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ toolKey: "documents" }),
  });
  console.log("POST favorite:", favRes.status);
  
  console.log("\n=== Test 6: Duplicate Favorite ===");
  const dupRes = await fetch(BASE + "/api/workbench/favorites", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ toolKey: "documents" }),
  });
  console.log("Duplicate favorite:", dupRes.status);
  
  console.log("\n=== Test 7: Update Profile ===");
  const profileRes = await fetch(BASE + "/api/workbench/profile", {
    method: "PATCH",
    headers: authHeader,
    body: JSON.stringify({ profileType: "merchant" }),
  });
  console.log("PATCH profile:", profileRes.status);
  const profileData = await profileRes.json();
  console.log("profileType:", profileData.profileType);
  
  console.log("\n=== Test 8: Delete Link ===");
  if (linkId) {
    const delRes = await fetch(BASE + "/api/workbench/links/" + linkId, { method: "DELETE", headers: authHeader });
    console.log("DELETE link:", delRes.status);
  }
  
  console.log("\n=== Test 9: Unfavorite ===");
  const unfavRes = await fetch(BASE + "/api/workbench/favorites/documents", { method: "DELETE", headers: authHeader });
  console.log("DELETE favorite:", unfavRes.status);
  
  console.log("\n=== Test 10: Invalid Profile Type ===");
  const badProfileRes = await fetch(BASE + "/api/workbench/profile", {
    method: "PATCH",
    headers: authHeader,
    body: JSON.stringify({ profileType: "invalid_type" }),
  });
  console.log("Invalid profileType:", badProfileRes.status);
  
  console.log("\n=== ALL TESTS COMPLETED ===");
}

test().catch(e => console.error(e));
