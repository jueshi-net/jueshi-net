// production-audit.js — Lightweight E2E health check for jueshi.net
const BASE = 'https://jueshi.net';

async function fetchWithTiming(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const ms = Date.now() - start;
    const text = await res.text();
    return { url, status: res.status, ms, body: text, ok: true };
  } catch (e) {
    const ms = Date.now() - start;
    return { url, status: 0, ms, body: '', ok: false, error: e.message };
  }
}

async function audit() {
  const results = [];
  let allPass = true;

  console.log('═══════════════════════════════════════════');
  console.log('  Production Audit — jueshi.net');
  console.log('  Date: ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════\n');

  // 1. Homepage
  console.log('[1/6] 首页 /');
  const home = await fetchWithTiming(BASE + '/');
  const hasViewport = home.body.includes('maximum-scale=1') || home.body.includes('maximum-scale:1');
  const homePass = home.ok && home.status === 200 && hasViewport;
  results.push({ page: '首页 /', status: home.status, ms: home.ms, pass: homePass, detail: 'viewport=' + hasViewport });
  console.log('  ' + (homePass ? '✅' : '❌') + ' HTTP ' + home.status + ' | ' + home.ms + 'ms | ' + results[results.length-1].detail);
  if (!homePass) allPass = false;

  // 2. Postal code page
  console.log('\n[2/6] 邮编页 /tools/postal-code');
  const postal = await fetchWithTiming(BASE + '/tools/postal-code');
  const postalPass = postal.ok && postal.status === 200;
  results.push({ page: '邮编页', status: postal.status, ms: postal.ms, pass: postalPass });
  console.log('  ' + (postalPass ? '✅' : '❌') + ' HTTP ' + postal.status + ' | ' + postal.ms + 'ms');

  // 2b. Postal API — JP test
  console.log('\n[2b]   API /api/postal-codes?code=100-0001&country=JP');
  const postalApi = await fetchWithTiming(BASE + '/api/postal-codes?code=100-0001&country=JP');
  const postalApiMs = postalApi.ms;
  let apiData = null;
  try { apiData = JSON.parse(postalApi.body); } catch {}
  const apiPass = postalApi.ok && postalApi.status === 200 && apiData && apiData.length > 0;
  const apiFast = postalApiMs < 50;
  results.push({ page: '邮编API(JP)', status: postalApi.status, ms: postalApiMs, pass: apiPass && apiFast, detail: 'results=' + (apiData?.length || 0) + ', <50ms=' + apiFast });
  console.log('  ' + (apiPass && apiFast ? '✅' : '⚠️') + ' HTTP ' + postalApi.status + ' | ' + postalApiMs + 'ms | 返回' + (apiData?.length || 0) + '条, <50ms=' + apiFast);
  if (!(apiPass && apiFast)) allPass = false;

  // 3. Scenario package
  console.log('\n[3/6] 场景包 /packages/shopify-starter');
  const pkg = await fetchWithTiming(BASE + '/packages/shopify-starter');
  const hasStripe = pkg.body.includes('stripe') || pkg.body.includes('Stripe');
  const has17track = pkg.body.includes('17track') || pkg.body.includes('17TRACK');
  const pkgPass = pkg.ok && pkg.status === 200;
  results.push({ page: '场景包', status: pkg.status, ms: pkg.ms, pass: pkgPass, detail: 'stripe=' + hasStripe + ', 17track=' + has17track });
  console.log('  ' + (pkgPass ? '✅' : '❌') + ' HTTP ' + pkg.status + ' | ' + pkg.ms + 'ms | ' + results[results.length-1].detail);
  if (!pkgPass) allPass = false;

  // 4. robots.txt
  console.log('\n[4/6] SEO /robots.txt');
  const robots = await fetchWithTiming(BASE + '/robots.txt');
  const hasDisallow = robots.body.includes('Disallow') || robots.body.includes('Allow');
  const robotsPass = robots.ok && robots.status === 200 && hasDisallow;
  results.push({ page: 'robots.txt', status: robots.status, ms: robots.ms, pass: robotsPass });
  console.log('  ' + (robotsPass ? '✅' : '❌') + ' HTTP ' + robots.status + ' | ' + robots.ms + 'ms | rules=' + hasDisallow);
  if (!robotsPass) allPass = false;

  // 5. sitemap.xml
  console.log('\n[5/6] SEO /sitemap.xml');
  const sitemap = await fetchWithTiming(BASE + '/sitemap.xml');
  const hasUrl = sitemap.body.includes('<url>') || sitemap.body.includes('<loc>');
  const sitemapPass = sitemap.ok && sitemap.status === 200 && hasUrl;
  const urlCount = (sitemap.body.match(/<loc>/g) || []).length;
  results.push({ page: 'sitemap.xml', status: sitemap.status, ms: sitemap.ms, pass: sitemapPass, detail: 'urls=' + urlCount });
  console.log('  ' + (sitemapPass ? '✅' : '❌') + ' HTTP ' + sitemap.status + ' | ' + sitemap.ms + 'ms | 收录' + urlCount + '个URL');
  if (!sitemapPass) allPass = false;

  // 6. Header nav check
  console.log('\n[6/6] Header 导航 (首页 HTML)');
  const navPass = home.body.includes('场景包') && home.body.includes('工具') && home.body.includes('论坛');
  const hasWhitespaceNowrap = home.body.includes('whitespace-nowrap');
  results.push({ page: 'Header导航', status: '-', ms: '-', pass: navPass, detail: '场景包=' + home.body.includes('场景包') + ', whitespace-nowrap=' + hasWhitespaceNowrap });
  console.log('  ' + (navPass ? '✅' : '❌') + ' 导航项渲染正常 | whitespace-nowrap=' + hasWhitespaceNowrap);
  if (!navPass) allPass = false;

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('  AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════');
  const passCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  console.log('  通过: ' + passCount + '/' + totalCount);
  console.log('  总体: ' + (allPass ? '✅ ALL PASS' : '⚠️ 部分检查未通过'));
  console.log('');
  results.forEach(r => {
    const icon = r.pass ? '✅' : '❌';
    console.log('  ' + icon + ' ' + r.page + ' — ' + (r.detail || ''));
  });

  process.exit(allPass ? 0 : 1);
}

audit();
