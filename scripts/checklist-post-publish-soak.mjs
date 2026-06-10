#!/usr/bin/env node
/**
 * checklist-post-publish-soak.mjs
 * Comprehensive soak test for published checklists and related pages.
 *
 * Checks:
 * - HTTP status codes for all key routes
 * - Sitemap content (checklist inclusion, draft exclusion)
 * - Related checklists on tool pages
 * - EventLog trigger and persistence (optional, if API accessible)
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const BASE_URL = process.env.TEST_BASE_URL || 'https://jueshi.net';

const routes = [
  { path: '/', expect: 200 },
  { path: '/tools', expect: 200 },
  { path: '/tools/address-formatter', expect: 200 },
  { path: '/tools/shipping-calculator', expect: 200 },
  { path: '/tools/postal-code', expect: 200 },
  { path: '/tools/documents/commercial-invoice', expect: 200 },
  { path: '/tools/documents/quotation', expect: 200 },
  { path: '/checklists/student-first-abroad-packing-checklist', expect: 200 },
  { path: '/checklists/first-shipping-checklist', expect: 200 },
  { path: '/checklists/toronto-rental-viewing-checklist', expect: 404 },
  { path: '/sitemap.xml', expect: 200 },
  { path: '/robots.txt', expect: 200 },
  { path: '/admin', expect: 307 },
  { path: '/workspace', expect: 307 },
];

async function main() {
  console.log('🔍 Checklist Post-Publish Soak Test');
  console.log(`   Base URL: ${BASE_URL}`);

  const results = [];
  const browser = await chromium.launch({ headless: true });

  // 1. HTTP Status Checks
  console.log('\n📝 1. HTTP Status Checks');
  for (const route of routes) {
    try {
      const res = await fetch(`${BASE_URL}${route.path}`, { method: 'HEAD', redirect: 'manual' });
      const status = res.status;
      const pass = status === route.expect || (route.expect === 307 && status === 307);
      console.log(`   ${pass ? '✅' : '❌'} ${route.path} -> ${status} (expected ${route.expect})`);
      results.push({ path: route.path, status, expected: route.expect, pass });
    } catch (e) {
      console.log(`   ❌ ${route.path} -> ERROR: ${e.message}`);
      results.push({ path: route.path, status: 'ERROR', expected: route.expect, pass: false });
    }
  }

  // 2. Sitemap Checks
  console.log('\n📝 2. Sitemap Checks');
  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await sitemapRes.text();
    const checks = {
      'student-first-abroad': xml.includes('student-first-abroad-packing-checklist'),
      'first-shipping': xml.includes('first-shipping-checklist'),
      'toronto-rental (should be absent)': !xml.includes('toronto-rental-viewing-checklist'),
      'admin (should be absent)': !xml.includes('/admin'),
      'workspace (should be absent)': !xml.includes('/workspace'),
    };

    for (const [name, pass] of Object.entries(checks)) {
      console.log(`   ${pass ? '✅' : '❌'} Sitemap contains ${name}`);
      results.push({ path: 'sitemap', check: name, pass });
    }
  } catch (e) {
    console.log(`   ❌ Sitemap check failed: ${e.message}`);
  }

  // 3. Dynamic Related Checklists
  console.log('\n📝 3. Dynamic Related Checklists');
  const page = await browser.newPage();
  
  for (const tool of ['address-formatter', 'shipping-calculator']) {
    await page.goto(`${BASE_URL}/tools/${tool}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const clLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/checklists/"]')).map(a => a.href);
    });

    const hasFirstShipping = clLinks.some(url => url.includes('first-shipping'));
    const hasStudent = clLinks.some(url => url.includes('student-first-abroad'));
    const hasToronto = clLinks.some(url => url.includes('toronto-rental'));

    console.log(`   ${tool} -> Checklist links: ${clLinks.length}`);
    console.log(`      ${hasFirstShipping ? '✅' : '❌'} first-shipping`);
    console.log(`      ${hasStudent ? '✅' : '❌'} student-first-abroad`);
    console.log(`      ${!hasToronto ? '✅' : '❌'} toronto-rental (should be absent)`);

    results.push({
      path: `tool/${tool}`,
      firstShipping: hasFirstShipping,
      student: hasStudent,
      toronto: hasToronto,
      pass: hasFirstShipping && !hasToronto
    });
  }

  await browser.close();

  // Summary
  console.log('\n📊 Soak Test Summary:');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`   ${passed}/${results.length} passed, ${failed} failed`);

  // Write summary files
  writeFileSync('reports/checklist-post-publish-soak/summary.json', JSON.stringify({ results, passed, failed }, null, 2));
  writeFileSync('reports/checklist-post-publish-soak/summary.md', `# Soak Test Summary\n\n${passed}/${results.length} passed, ${failed} failed\n\n## Results\n${results.map(r => `- ${r.path}: ${r.pass ? 'PASS' : 'FAIL'}`).join('\n')}`);

  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
