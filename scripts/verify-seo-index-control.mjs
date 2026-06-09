import https from "https";

const BASE_URL = "https://jueshi.net";

async function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${path}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

async function main() {
  console.log("🔍 SEO Index Control Verification");
  console.log("================================");

  // 1. robots.txt
  const robots = await fetchUrl("/robots.txt");
  console.log(`\n1. robots.txt status: ${robots.status === 200 ? "✅ 200" : "❌ " + robots.status}`);
  console.log("   Contains Sitemap: " + (robots.body.includes("Sitemap:") ? "✅" : "❌"));
  console.log("   Blocks /admin: " + (robots.body.includes("Disallow: /admin") ? "✅" : "❌"));
  console.log("   Blocks /workspace: " + (robots.body.includes("Disallow: /workspace") ? "✅" : "❌"));
  console.log("   Blocks /api: " + (robots.body.includes("Disallow: /api") ? "✅" : "❌"));

  // 2. sitemap.xml
  const sitemap = await fetchUrl("/sitemap.xml");
  console.log(`\n2. sitemap.xml status: ${sitemap.status === 200 ? "✅ 200" : "❌ " + sitemap.status}`);
  console.log("   Contains /admin: " + (sitemap.body.includes("/admin") ? "❌ YES (should not)" : "✅ NO"));
  console.log("   Contains /workspace: " + (sitemap.body.includes("/workspace") ? "❌ YES (should not)" : "✅ NO"));
  console.log("   Contains /api: " + (sitemap.body.includes("/api") ? "❌ YES (should not)" : "✅ NO"));
  console.log("   Contains /lp/: " + (sitemap.body.includes("/lp/") ? "✅ YES" : "⚠️  NO"));

  // 3. Canonical on LP
  const lp = await fetchUrl("/lp/test-safe-landing-20");
  const canonicalMatch = lp.body.match(/rel="canonical" href="([^"]+)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  console.log(`\n3. /lp/test-safe-landing-20 canonical: ${canonical ? "✅ " + canonical : "❌ NOT FOUND"}`);
  console.log("   Is localhost? " + (canonical?.includes("localhost") ? "❌ YES" : "✅ NO"));

  // 4. draft/hidden pages
  const draft = await fetchUrl("/lp/test-draft-20");
  const hidden = await fetchUrl("/lp/test-hidden-20");
  console.log(`\n4. /lp/test-draft-20 status: ${draft.status === 404 ? "✅ 404" : "❌ " + draft.status}`);
  console.log(`   /lp/test-hidden-20 status: ${hidden.status === 404 ? "✅ 404" : "❌ " + hidden.status}`);

  console.log("\n================================");
  console.log("✅ SEO Index Control Verification Complete");
}

main().catch(console.error);
