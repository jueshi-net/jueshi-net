#!/usr/bin/env node
/**
 * overnight-prod-soak.mjs — Production QA Soak Test
 *
 * Env vars:
 *   SOAK_BASE_URL=https://jueshi.net
 *   SOAK_ITERATIONS=32
 *   SOAK_INTERVAL_MS=900000
 *   SOAK_HEADLESS=true
 *   SOAK_ADMIN_EMAIL
 *   SOAK_ADMIN_PASSWORD
 *
 * CLI args (overrides env):
 *   --rounds=N     Number of iterations (default: SOAK_ITERATIONS)
 *   --interval=MS  Interval ms (default: SOAK_INTERVAL_MS)
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const E = process.env;
const BASE_URL = E.SOAK_BASE_URL || 'https://jueshi.net';
const ITERATIONS = parseInt(E.SOAK_ITERATIONS || '32', 10);
const INTERVAL_MS = parseInt(E.SOAK_INTERVAL_MS || '900000', 10);
const HEADLESS = E.SOAK_HEADLESS !== 'false';
const ADMIN_EMAIL = E.SOAK_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = E.SOAK_ADMIN_PASSWORD || '';

// CLI args
const cliArgs = process.argv.slice(2);
let cliRounds = null, cliInterval = null;
for (const a of cliArgs) {
  if (a.startsWith('--rounds=')) cliRounds = parseInt(a.split('=')[1], 10);
  if (a.startsWith('--interval=')) cliInterval = parseInt(a.split('=')[1], 10);
}
const FINAL_ITERATIONS = cliRounds || ITERATIONS;
const FINAL_INTERVAL = cliInterval ?? INTERVAL_MS;

const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const RD = join('reports', 'overnight-soak', TS);
const SD = join(RD, 'screenshots');
mkdirSync(RD, { recursive: true });
mkdirSync(SD, { recursive: true });

// Also symlink latest.log
const LOG_FILE = join(RD, 'run.log');
const LATEST_LOG = join('reports', 'overnight-soak', 'latest.log');

const STATIC_PAGES = [
  { path: '/', expectStatus: 200, label: '首页' },
  { path: '/tools', expectStatus: 200, label: '工具中心' },
  { path: '/tools/qrcode', expectStatus: 200, label: 'QR Code' },
  { path: '/tools/documents/quotation', expectStatus: 200, label: 'Quote Sheet' },
  { path: '/tools/quote', expectStatus: 'redirect', label: 'Quote redir', redirectTarget: '/tools/documents/quotation' },
  { path: '/tools/quote-sheet', expectStatus: 'redirect', label: 'QuoteSheet redir', redirectTarget: '/tools/documents/quotation' },
  { path: '/login', expectStatus: 200, label: '登录' },
  { path: '/workspace', expectStatus: 'redirect', label: 'Workspace', redirectTarget: '/login' },
  { path: '/admin', expectStatus: 'redirect', label: 'Admin', redirectTarget: '/login' },
  { path: '/robots.txt', expectStatus: 200, label: 'robots' },
  { path: '/sitemap.xml', expectStatus: 200, label: 'sitemap' },
  { path: '/checklists/first-shipping-checklist', expectStatus: 404, label: 'draft1' },
  { path: '/checklists/toronto-rental-viewing-checklist', expectStatus: 404, label: 'draft2' },
  { path: '/checklists/student-first-abroad-packing-checklist', expectStatus: 404, label: 'draft3' },
];
const REDIRECT_PATHS = ['/tools/quote', '/tools/quote-sheet', '/workspace', '/admin'];
const DRAFT_SLUGS = ['first-shipping-checklist', 'toronto-rental-viewing-checklist', 'student-first-abroad-packing-checklist'];
const FORBIDDEN = ['/admin', '/workspace', '/api'];

const allResults = [], allFailures = [], pageTimings = {}, consoleErrorCounts = {};
const aggregate404 = {}, aggregateCors = [], aggregateAdslot = [];

function log(m) {
  const line = '[' + new Date().toISOString() + '] ' + m;
  console.log(line);
  appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function writeSummary() {
  const ti = allResults.length, pi = allResults.filter(r => r.pass).length, fi = ti - pi;
  const at = Object.entries(pageTimings)
    .map(([p, t]) => ({ p, avg: t.reduce((a, b) => a + b, 0) / t.length, max: Math.max(...t) }))
    .sort((a, b) => b.avg - a.avg).slice(0, 10);
  const tc = Object.entries(consoleErrorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const lt = allResults[allResults.length - 1] || {};

  // Build 404 + CORS sections
  const top404 = Object.entries(aggregate404).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const topCors = aggregateCors.reduce((acc, c) => { acc[c.url] = (acc[c.url] || 0) + 1; return acc; }, {});

  const s = {
    startTime: allResults[0]?.timestamp || new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    totalIterations: ti, plannedIterations: FINAL_ITERATIONS,
    passedIterations: pi, failedIterations: fi,
    totalFailures: allFailures.length,
    topSlowestPages: at,
    topConsoleErrorIterations: tc,
    latestRedirectChecks: lt.httpRedirects || [],
    latestSitemapChecks: lt.sitemapChecks || [],
    adminTest: lt.adminTest || null,
    aggregate404: top404,
    aggregateCors: Object.entries(topCors).slice(0, 10),
    adslotClassified: 'known non-blocking (no-fill)',
  };
  writeFileSync(join(RD, 'summary.json'), JSON.stringify(s, null, 2));

  const md = `# Soak Test Progress

**Started:** ${s.startTime} | **Last:** ${s.lastUpdated}
**Progress:** ${ti}/${FINAL_ITERATIONS} | **Pass:** ${pi} | **Fail:** ${fi}

## Issues
${allFailures.length === 0 ? 'None.' : allFailures.slice(-20).map(f => '- iter #' + f.iter + ': \`' + f.path + '\` — ' + ((f.error && f.error.slice(0, 80)) || ('status=' + f.status))).join('\n')}

## HTTP Redirect Checks
${(lt.httpRedirects || []).map(r => '- \`' + r.path + '\`: httpStatus=' + r.httpStatus + ', location=' + (r.location || 'N/A').slice(0, 80) + ', pass=' + r.pass).join('\n') || 'N/A'}

## Slowest
${at.map(t => '- \`' + t.p + '\`: avg ' + Math.round(t.avg) + 'ms, max ' + t.max + 'ms').join('\n')}

## Sitemap
${(lt.sitemapChecks || []).map(k => '- pass=' + k.pass + ', drafts=' + (k.draftsFound?.join(',') || 'none')).join('\n') || 'N/A'}

## Top 404 URLs
${top404.map(([url, count]) => '- ' + url + ' (' + count + ' times)').join('\n') || 'None'}

## Top CORS URLs
${Object.entries(topCors).slice(0, 10).map(([url, count]) => '- ' + url + ' (' + count + ' times)').join('\n') || 'None'}

## AdSlot
Known non-blocking (no-fill) — not P0/P1.

## Admin
${lt.adminTest ? (lt.adminTest.skipped ? 'SKIPPED: ' + lt.adminTest.reason : 'OK: ' + lt.adminTest.success) : 'N/A'}
`;
  writeFileSync(join(RD, 'summary.md'), md);
}

async function runIteration(n, browser) {
  log('\n═══ Iteration ' + n + '/' + FINAL_ITERATIONS + ' ═══');
  const t0 = Date.now();
  const ir = {
    iter: n, timestamp: new Date().toISOString(),
    pages: [], failures: [], consoleErrors: [],
    httpRedirects: [], sitemapChecks: [], adminTest: null
  };
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [];
  const err404 = [], errCors = [], errAdslot = [];

  page.on('pageerror', e => {
    errs.push(e.message);
    if (e.message.includes('AdSlot') || e.message.includes('ad')) errAdslot.push(e.message.slice(0, 200));
  });
  page.on('console', m => {
    if (m.type() === 'error') {
      const txt = m.text();
      errs.push(txt);
      if (txt.includes('404') || txt.includes('ERR_FAILED')) {
        err404.push(txt.slice(0, 200));
        // Try to extract URL
        const urlMatch = txt.match(/https?:\/\/[^\s)\"\']+/);
        if (urlMatch) {
          aggregate404[urlMatch[0]] = (aggregate404[urlMatch[0]] || 0) + 1;
        }
      }
      if (txt.includes('CORS')) {
        errCors.push(txt.slice(0, 300));
        const urlMatch = txt.match(/https?:\/\/[^\s)\"\']+/);
        if (urlMatch) aggregateCors.push({ url: urlMatch[0], message: txt.slice(0, 150) });
      }
      if (txt.includes('AdSlot')) errAdslot.push(txt.slice(0, 200));
    }
  });

  // --- Static page checks (browser, follows redirects) ---
  for (const tp of STATIC_PAGES) {
    const url = BASE_URL + tp.path;
    const t1 = Date.now();
    let status = 0, furl = '', title = '', canonical = '', error = null;
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = res ? res.status() : 0;
      furl = page.url();
      title = await page.title();
      canonical = await page.evaluate(() => {
        const l = document.querySelector('link[rel="canonical"]');
        return l ? l.href : null;
      });
      let pass = false;
      if (tp.expectStatus === 'redirect') {
        // page.goto follows redirect; check final URL points to target
        pass = furl.includes(tp.redirectTarget || '');
        if (!pass) error = 'Expected final URL to include ' + tp.redirectTarget + ', got ' + furl;
      } else {
        pass = status === tp.expectStatus;
      }
      if (!pass) {
        const ss = join(SD, 'iter' + n + '-' + (tp.path.replace(/\//g, '_') || 'root') + '-fail.png');
        try { await page.screenshot({ path: ss, fullPage: false }); } catch {}
        ir.failures.push({ path: tp.path, status, expected: tp.expectStatus, error });
      }
      const timing = Date.now() - t1;
      if (!pageTimings[tp.path]) pageTimings[tp.path] = [];
      pageTimings[tp.path].push(timing);
      ir.pages.push({ path: tp.path, status, title: title.slice(0, 60), canonical, timing, pass, furl: furl.slice(0, 80) });
    } catch (e) {
      error = e.message;
      const timing = Date.now() - t1;
      const ss = join(SD, 'iter' + n + '-' + (tp.path.replace(/\//g, '_') || 'root') + '-error.png');
      try { await page.screenshot({ path: ss, fullPage: false }); } catch {}
      ir.failures.push({ path: tp.path, status: 0, expected: tp.expectStatus, error });
      ir.pages.push({ path: tp.path, status: 0, title: '', canonical: '', timing, pass: false, error });
    }
  }

  // --- HTTP-layer redirect checks (use native fetch with redirect: 'manual') ---
  const redirectTargets = {
    '/tools/quote': '/tools/documents/quotation',
    '/tools/quote-sheet': '/tools/documents/quotation',
    '/workspace': '/login',
    '/admin': '/login',
  };
  for (const [rp, target] of Object.entries(redirectTargets)) {
    const url = BASE_URL + rp;
    let httpStatus = 0, location = '', finalUrl = '', pass = false, error = null;
    try {
      // Native fetch supports redirect: 'manual' for raw HTTP status
      const resp = await fetch(url, { method: 'GET', redirect: 'manual' });
      httpStatus = resp.status;
      location = resp.headers.get('location') || '';
    } catch (e) {
      // fetch may throw on some redirect types with redirect: 'manual'
      error = 'fetch exception: ' + e.message.slice(0, 100);
    }
    // Follow to verify final URL
    try {
      const fPage = await ctx.newPage();
      await fPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      finalUrl = fPage.url();
      await fPage.close();
    } catch (e) { /* ignore */ }

    const isRedirect = httpStatus >= 300 && httpStatus <= 399;
    const pointsToTarget = location.includes(target) || finalUrl.includes(target);
    // Pass if: HTTP 3xx detected OR finalUrl confirms redirect works
    pass = isRedirect || pointsToTarget;
    if (!isRedirect && !pointsToTarget) error = 'No redirect detected';

    ir.httpRedirects.push({ path: rp, httpStatus, location: location.slice(0, 120), finalUrl: finalUrl.slice(0, 120), pass, error });
    if (!pass) ir.failures.push({ path: rp + ' (HTTP)', error: error || 'Redirect check failed' });
  }

  ir.consoleErrors = errs.map(e => ({ message: e.slice(0, 200) }));
  consoleErrorCounts[n] = errs.length;

  // --- Sitemap check ---
  try {
    await page.goto(BASE_URL + '/sitemap.xml', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const sc = await page.content();
    const ff = FORBIDDEN.filter(p => sc.includes('<loc>' + BASE_URL + p));
    const df = DRAFT_SLUGS.filter(s => sc.includes(s));
    const hq = sc.includes('/tools/documents/quotation');
    const hn = !sc.includes('/tools/quote-sheet');
    const sp = ff.length === 0 && df.length === 0 && hq && hn;
    ir.sitemapChecks.push({ pass: sp, forbiddenFound: ff, draftsFound: df, hasQuotation: hq, hasNoQuoteSheet: hn });
    if (!sp) ir.failures.push({ path: '/sitemap.xml', error: 'Sitemap issues: forbidden=' + ff.join(',') + ', drafts=' + df.join(',') });
  } catch (e) { ir.sitemapChecks.push({ pass: false, error: e.message }); }

  // --- Homepage UI ---
  try {
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const hn = await page.evaluate(() => !!document.querySelector('nav'));
    if (!hn) ir.failures.push({ path: '/', error: 'Missing nav' });
  } catch (e) { ir.failures.push({ path: '/', error: 'Homepage UI: ' + e.message }); }

  // --- Quote Sheet UI (h1 check) ---
  try {
    await page.goto(BASE_URL + '/tools/documents/quotation', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const ht = await page.evaluate(() => {
      const h = document.querySelector('h1');
      return h && h.textContent.length > 0;
    });
    if (!ht) ir.failures.push({ path: '/tools/documents/quotation', error: 'Missing h1 title' });
  } catch (e) { ir.failures.push({ path: '/tools/documents/quotation', error: 'Quote Sheet UI: ' + e.message }); }

  // --- Admin login (optional) ---
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    log('  [Admin] Testing login...');
    try {
      await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
      const ei = await page.$('input[type="email"], input[name="email"]');
      const pi2 = await page.$('input[type="password"], input[name="password"]');
      if (ei && pi2) {
        await ei.fill(ADMIN_EMAIL);
        await pi2.fill(ADMIN_PASSWORD);
        const btn = await page.$('button[type="submit"], input[type="submit"]');
        if (btn) {
          await btn.click();
          await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
          await sleep(2000);
          const cu = page.url();
          const li = !cu.includes('/login') || cu.includes('/admin');
          ir.adminTest = { success: li, furl: cu.slice(0, 100), testedAt: new Date().toISOString() };
          if (li) {
            await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
            if (page.url().includes('/admin')) {
              await page.goto(BASE_URL + '/admin/landing-pages', { waitUntil: 'domcontentloaded', timeout: 15000 });
              ir.adminTest.landingPagesLoaded = page.url().includes('/admin/landing-pages');
            }
          }
        } else { ir.adminTest = { success: false, error: 'Submit btn not found' }; }
      } else { ir.adminTest = { success: false, error: 'Form inputs not found' }; }
    } catch (e) { ir.adminTest = { success: false, error: e.message }; }
  } else {
    ir.adminTest = { skipped: true, reason: 'SOAK_ADMIN_EMAIL/SOAK_ADMIN_PASSWORD not set' };
  }

  await ctx.close();
  const dur = Date.now() - t0;
  ir.duration = dur;
  ir.pass = ir.failures.length === 0;
  allResults.push(ir);
  if (ir.failures.length > 0) allFailures.push(...ir.failures.map(f => ({ ...f, iter: n })));
  writeFileSync(join(RD, 'iter-' + n + '.json'), JSON.stringify(ir, null, 2));
  writeSummary();
  log('  ✅ Iteration ' + n + ' complete: ' + ((ir.pass ? 'PASS' : 'FAIL') + ' (' + ir.failures.length + ' issues, ' + dur + 'ms)'));
  return ir;
}

async function main() {
  log('🚀 Production QA Soak Test');
  log('   Base URL: ' + BASE_URL);
  log('   Iterations: ' + FINAL_ITERATIONS);
  log('   Interval: ' + ((FINAL_INTERVAL / 60000).toFixed(0)) + 'min');
  log('   Headless: ' + HEADLESS);
  log('   Report: ' + RD);
  log('   Admin: ' + ((ADMIN_EMAIL ? 'ENABLED' : 'DISABLED')));
  const browser = await chromium.launch({ headless: HEADLESS });
  await runIteration(1, browser);
  for (let i = 2; i <= FINAL_ITERATIONS; i++) {
    log('  ⏳ Waiting ' + (FINAL_INTERVAL / 60000) + 'min...');
    await sleep(FINAL_INTERVAL);
    await runIteration(i, browser);
  }
  await browser.close();
  log('\n🏁 Soak test complete. ' + allResults.length + ' iterations.');
  writeSummary();
}

main().catch(e => {
  log('💥 Fatal: ' + e.message);
  writeFileSync(join(RD, 'fatal-error.json'), JSON.stringify({ error: e.message, stack: e.stack, time: new Date().toISOString() }));
  process.exit(1);
});
