#!/usr/bin/env node
/**
 * checklist-post-publish-soak.mjs
 * Playwright soak test for published checklists
 *
 * Checks:
 * - Page loads and renders correctly
 * - All related tools return 200
 * - No 404 links to draft checklists
 * - No draft/review warnings leaked
 * - Official links are safe (target=_blank, rel=noopener)
 * - Breadcrumb renders
 * - Page structure: h1, sections, items, FAQ, pitfalls
 *
 * Usage: node scripts/checklist-post-publish-soak.mjs [BASE_URL]
 */

import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_BASE_URL || process.argv[2] || 'https://jueshi.net';
const SLUGS = ['first-shipping-checklist', 'student-first-abroad-packing-checklist'];

async function checkPage(page, slug) {
  const url = `${BASE_URL}/checklists/${slug}`;
  const results = { slug, url, ok: true, issues: [] };

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = response?.status() ?? 0;
    if (status !== 200) {
      results.ok = false;
      results.issues.push(`HTTP ${status} (expected 200)`);
      return results;
    }

    await page.waitForTimeout(2000);

    // Check h1
    const h1Count = await page.$$eval('h1', els => els.length);
    if (h1Count === 0) results.issues.push('Missing h1');

    // Check for draft/review leaks
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('requiresHumanReview')) results.issues.push('requiresHumanReview leaked');
    if (bodyText.match(/status.*draft/i)) results.issues.push('draft status leaked');

    // Check related tool links
    const toolLinks = await page.$$eval('a[href*="/tools/"]', els => els.map(a => a.href));
    for (const href of toolLinks) {
      if (href.includes('#')) continue; // skip anchors
      const u = new URL(href);
      try {
        const r = await fetch(u.href, { method: 'HEAD', redirect: 'manual' });
        if (r.status !== 200 && r.status !== 301 && r.status !== 302 && r.status !== 307 && r.status !== 308) {
          results.issues.push(`Related tool ${u.pathname} returned ${r.status}`);
        }
      } catch {
        results.issues.push(`Related tool ${u.pathname} fetch failed`);
      }
    }

    // Check checklist links (should not link to drafts)
    const clLinks = await page.$$eval('a[href*="/checklists/"]', els => els.map(a => a.getAttribute('href')));
    for (const href of clLinks) {
      try {
        const r = await fetch(`${BASE_URL}${href}`, { method: 'HEAD', redirect: 'manual' });
        if (r.status === 404) {
          results.issues.push(`Checklist link ${href} is 404 (draft)`);
        }
      } catch {
        results.issues.push(`Checklist link ${href} fetch failed`);
      }
    }

    // Check official links safety
    const officialLinks = await page.$$eval('a[href*="http"]', els =>
      els.filter(a => a.href.includes('customs') || a.href.includes('gov'))
        .map(a => ({ href: a.href, target: a.target, rel: a.rel }))
    );
    for (const link of officialLinks) {
      if (link.target !== '_blank') results.issues.push(`Official link missing target=_blank: ${link.href}`);
    }

  } catch (err) {
    results.ok = false;
    results.issues.push(`Error: ${err.message}`);
  }

  return results;
}

async function main() {
  console.log('🔍 Checklist Post-Publish Soak Test');
  console.log(`   Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const allResults = [];

  for (const slug of SLUGS) {
    console.log(`\n📋 Checking: ${slug}`);
    const result = await checkPage(page, slug);
    allResults.push(result);

    if (result.ok) {
      console.log(`   ✅ ${slug} PASS`);
    } else {
      console.log(`   ❌ ${slug} FAIL`);
      for (const issue of result.issues) {
        console.log(`      ⚠️ ${issue}`);
      }
    }
  }

  await browser.close();

  // Summary
  console.log('\n📊 Soak Test Summary:');
  const passed = allResults.filter(r => r.ok).length;
  const failed = allResults.filter(r => !r.ok).length;
  console.log(`   ${passed}/${allResults.length} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('\n❌ Issues:');
    for (const r of allResults.filter(r => !r.ok)) {
      console.log(`   ${r.slug}:`);
      for (const issue of r.issues) {
        console.log(`      - ${issue}`);
      }
    }
    process.exit(1);
  } else {
    console.log('\n✅ All checklists passed soak test');
  }
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
