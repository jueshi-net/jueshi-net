#!/usr/bin/env node
/**
 * audit-checklist-internal-links.mjs
 * Audit internal links for published/draft/hidden checklists
 *
 * Env vars:
 *   AUDIT_BASE_URL=https://jueshi.net
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.AUDIT_BASE_URL || 'https://jueshi.net';
const RD = join('reports', 'checklist-internal-links');
mkdirSync(RD, { recursive: true });

const DRAFT_SLUGS = [
  'first-shipping-checklist',
  'toronto-rental-viewing-checklist',
  'student-first-abroad-packing-checklist',
];

const results = {
  timestamp: new Date().toISOString(),
  checklists: [],
  sitemap: { publishedFound: [], draftFound: [], hiddenFound: [] },
  urlChecks: [],
  pageLinkChecks: { brokenLinks: [], draftLinks: [], hiddenLinks: [] },
};

function log(m) { console.log('[' + new Date().toISOString() + '] ' + m); }

async function fetchStatus(path) {
  try {
    const url = BASE_URL + path;
    const res = await fetch(url, { redirect: 'manual' });
    return { status: res.status, location: res.headers.get('location') || '', url };
  } catch (e) {
    return { status: 0, error: e.message, url: BASE_URL + path };
  }
}

async function checkSitemap() {
  const url = BASE_URL + '/sitemap.xml';
  const res = await fetch(url);
  const xml = await res.text();

  // Find all loc entries
  const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  const urls = locs.map(l => l.replace(/<\/?loc>/g, ''));

  for (const slug of DRAFT_SLUGS) {
    const found = urls.some(u => u.includes(slug));
    if (found) {
      results.sitemap.draftFound.push(slug);
    }
  }

  // Check for published checklist URLs
  const checklistUrls = urls.filter(u => u.includes('/checklists/'));
  results.sitemap.publishedFound = checklistUrls;
  results.sitemap.checklistCount = checklistUrls.length;
}

async function checkUrl(slug, expectedStatus) {
  const path = `/checklists/${slug}`;
  const r = await fetchStatus(path);
  const pass = r.status === expectedStatus;
  results.urlChecks.push({ slug, path, status: r.status, expected: expectedStatus, pass });
  return pass;
}

async function scanPageForLinks(path, label) {
  const url = BASE_URL + path;
  const res = await fetch(url);
  const html = await res.text();

  // Find all /checklinks/* links
  const checklistLinks = html.match(/href="\/checklists\/[^"]+"/g) || [];
  const slugs = checklistLinks.map(l => l.match(/\/checklists\/([^"]+)/)?.[1]).filter(Boolean);

  const issues = [];
  for (const slug of slugs) {
    if (DRAFT_SLUGS.includes(slug)) {
      results.pageLinkChecks.draftLinks.push({ source: path, label, slug });
      issues.push(`Links to draft checklist: ${slug}`);
    }
  }
  return { links: checklistLinks, issues };
}

async function main() {
  log('🔍 Checklist Internal Link Audit');
  log('   Base URL: ' + BASE_URL);

  // Check published/draft status
  log('\n═══ URL Checks ═══');
  for (const slug of DRAFT_SLUGS) {
    const pass = await checkUrl(slug, slug === 'student-first-abroad-packing-checklist' ? 200 : 404);
    log(`  ${slug}: ${pass ? '✅' : '❌'}`);
    results.checklists.push({ slug, expectedStatus: slug === 'student-first-abroad-packing-checklist' ? 200 : 404, actualStatus: results.urlChecks.find(c => c.slug === slug)?.status, pass });
  }

  // Check sitemap
  log('\n═══ Sitemap Check ═══');
  await checkSitemap();
  log(`  Published checklist URLs: ${results.sitemap.publishedFound.length}`);
  log(`  Draft slugs in sitemap: ${results.sitemap.draftFound.length === 0 ? '✅ 0' : '❌ ' + results.sitemap.draftFound.join(', ')}`);

  // Scan published checklist page for internal links
  log('\n═══ Page Link Check ═══');
  const pageResult = await scanPageForLinks('/checklists/student-first-abroad-packing-checklist', 'published checklist page');
  log(`  Checklist links found: ${pageResult.links.length}`);
  log(`  Issues: ${pageResult.issues.length === 0 ? '✅ 0' : '❌ ' + pageResult.issues.join(', ')}`);

  // Scan tools center for checklist links
  const toolResult = await scanPageForLinks('/tools', 'tools center');
  log(`  Tools center checklist links: ${toolResult.links.length}`);

  // Scan related tool pages for checklist links
  const toolSlugs = ['address-formatter', 'invoice', 'shipping-calculator'];
  for (const ts of toolSlugs) {
    const r = await scanPageForLinks(`/tools/${ts}`, `tool: ${ts}`);
    log(`  /tools/${ts} checklist links: ${r.links.length}`);
  }

  // Write results
  writeFileSync(join(RD, 'link-graph.json'), JSON.stringify(results, null, 2));

  const md = `# Checklist Internal Link Graph Audit

**Timestamp:** ${results.timestamp}
**Base URL:** ${BASE_URL}

## URL Status

${results.urlChecks.map(c => `- \`${c.path}\`: ${c.status === c.expected ? '✅' : '❌'} (expected ${c.expected}, got ${c.status})`).join('\n')}

## Sitemap

- Published checklist URLs: ${results.sitemap.publishedFound.length}
- Draft slugs in sitemap: ${results.sitemap.draftFound.length === 0 ? '✅ 0' : '❌ ' + results.sitemap.draftFound.join(', ')}
${results.sitemap.publishedFound.length > 0 ? '\n' + results.sitemap.publishedFound.map(u => `- ${u}`).join('\n') : ''}

## Page Link Checks

### Published Checklist Page
- Links found: ${pageResult.links.length}
- Issues: ${pageResult.issues.length === 0 ? '✅ 0' : '❌ ' + pageResult.issues.join(', ')}

### Tools Center
- Links found: ${toolResult.links.length}

## Summary

${results.urlChecks.every(c => c.pass) && results.sitemap.draftFound.length === 0 ? '✅ All checks passed' : '❌ Issues found'}
`;
  writeFileSync(join(RD, 'link-graph.md'), md);

  log('\n🏁 Audit complete. Reports:');
  log(`   ${RD}/link-graph.json`);
  log(`   ${RD}/link-graph.md`);
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
