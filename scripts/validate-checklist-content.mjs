#!/usr/bin/env node
/**
 * validate-checklist-content.mjs
 * Validate draft checklist content quality
 *
 * Usage: node scripts/validate-checklist-content.mjs
 *
 * Validates all draft checklists in content-drafts/checklists/
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const CHECKLISTS_DIR = join('content-drafts', 'checklists');
const REPORT_DIR = join('reports', 'checklist-content-completion');
mkdirSync(REPORT_DIR, { recursive: true });

const results = { timestamp: new Date().toISOString(), checklists: [], errors: [], warnings: [] };

function log(m) { console.log('[' + new Date().toISOString() + '] ' + m); }

// Known valid tool paths (verify against production)
const VALID_TOOL_PATHS = new Set([
  '/tools/address-formatter',
  '/tools/shipping-calculator',
  '/tools/documents/quotation',
  '/tools/invoice',
  '/tools/postal-code',
  '/tools/qrcode',
  '/tools/tracking',
  '/tools/hs-code',
  '/tools/exchange-rate',
  '/tools/memo',
  '/tools/documents',
  '/tools/shipping-label',
  '/tools/handover-note',
  '/tools/debit-note',
  '/tools/receipt',
  '/tools/container',
  '/tools/shipping-calculator',
  '/tools/sensitive-goods',
  '/tools/customs-generator',
  '/tools/shipping-estimator',
  '/tools/video-script-sop',
  '/tools/zip',
  '/tools/shipping-mark',
  '/tools/inbound',
  '/tools/inbound-receipt',
]);

async function checkToolPath(slug) {
  try {
    const res = await fetch(`https://jueshi.net${slug}`, { redirect: 'manual' });
    return res.status === 200;
  } catch {
    return false;
  }
}

function validateChecklist(draft) {
  const errors = [];
  const warnings = [];
  const hs = draft.heroSection || {};
  const sections = hs.sections || [];
  const items = sections.reduce((sum, s) => sum + (s.items || []).length, 0);
  const faqs = draft.faqItems || [];
  const pitfalls = hs.avoidPitfalls || [];

  // Basic counts
  if (sections.length < 5) errors.push(`sections < 5 (has ${sections.length})`);
  if (items < 25) errors.push(`checklistItems < 25 (has ${items})`);
  if (faqs.length < 6) errors.push(`FAQ < 6 (has ${faqs.length})`);
  if (pitfalls.length < 6) errors.push(`avoidPitfalls < 6 (has ${pitfalls.length})`);

  // Section items
  for (const sec of sections) {
    if ((sec.items || []).length < 3) errors.push(`Section "${sec.title}" has < 3 items (has ${sec.items?.length || 0})`);
  }

  // Empty fields
  if (!draft.title || !draft.title.trim()) errors.push('Empty title');
  if (!draft.seoTitle || !draft.seoTitle.trim()) errors.push('Empty seoTitle');
  if (!draft.seoDescription || !draft.seoDescription.trim()) errors.push('Empty seoDescription');
  if (!hs.summary || !hs.summary.trim()) warnings.push('Empty summary');

  // Item text check
  for (const sec of sections) {
    for (const item of (sec.items || [])) {
      if (!item.title || !item.title.trim()) errors.push(`Empty item title in section "${sec.title}"`);
      if ((item.title || '').toLowerCase().includes('todo') || (item.title || '').toLowerCase().includes('待补充')) errors.push(`Item contains TODO in "${sec.title}": ${item.title}`);
      if ((item.description || '').toLowerCase().includes('lorem ipsum')) errors.push(`Item contains lorem ipsum in "${sec.title}"`);
    }
  }

  // Status check
  if (draft.status !== 'draft') errors.push(`Status is not draft: ${draft.status}`);
  if (hs.requiresHumanReview !== true && draft.requiresHumanReview !== true) errors.push('requiresHumanReview should be true for drafts');

  // relatedTools validation
  const relatedTools = draft.relatedTools || [];
  for (const toolSlug of relatedTools) {
    const toolPath = `/tools/${toolSlug}`;
    if (!VALID_TOOL_PATHS.has(toolPath)) {
      warnings.push(`relatedTool "${toolPath}" not in known valid paths (will check via HTTP)`);
    }
  }

  // officialLinks check
  const officialLinks = draft.officialLinks || [];
  for (const link of officialLinks) {
    if (link.needsReview !== true) warnings.push(`officialLink "${link.label}" is not needsReview=true`);
  }

  return { errors, warnings, counts: { sections: sections.length, items, faqs: faqs.length, pitfalls: pitfalls.length, relatedTools: relatedTools.length, officialLinks: officialLinks.length } };
}

async function main() {
  log('🔍 Checklist Content Validation');

  const files = readdirSync(CHECKLISTS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const path = join(CHECKLISTS_DIR, file);
    let draft;
    try {
      draft = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (e) {
      results.errors.push({ file, error: `JSON parse error: ${e.message}` });
      continue;
    }

    const v = validateChecklist(draft);
    const r = { slug: draft.slug, file, ...v };
    results.checklists.push(r);
    results.errors.push(...v.errors.map(e => ({ slug: draft.slug, error: e })));
    results.warnings.push(...v.warnings.map(w => ({ slug: draft.slug, warning: w })));

    // Check relatedTools via HTTP
    for (const toolSlug of (draft.relatedTools || [])) {
      const ok = await checkToolPath(`/tools/${toolSlug}`);
      if (!ok) {
        results.errors.push({ slug: draft.slug, error: `relatedTool /tools/${toolSlug} is not 200` });
      }
    }

    // Check officialLinks if needsReview=false
    for (const link of (draft.officialLinks || [])) {
      if (!link.needsReview && link.url) {
        try {
          const res = await fetch(link.url, { redirect: 'manual' });
          if (res.status >= 400) {
            results.warnings.push({ slug: draft.slug, warning: `officialLink ${link.url} returned ${res.status}` });
          }
        } catch (e) {
          results.warnings.push({ slug: draft.slug, warning: `officialLink ${link.url} unreachable: ${e.message.slice(0, 80)}` });
        }
      }
    }

    log(`  ${draft.slug}: ${v.errors.length === 0 ? '✅ PASS' : '❌ FAIL'} (${v.counts.items} items, ${v.counts.faqs} FAQ, ${v.counts.pitfalls} pitfalls)`);
  }

  // Write results
  writeFileSync(join(REPORT_DIR, 'validation.json'), JSON.stringify(results, null, 2));

  const md = `# Checklist Content Validation Report

**Timestamp:** ${results.timestamp}

## Summary

| Checklist | Sections | Items | FAQ | Pitfalls | Tools | OfficialLinks | Status |
|---|---|---|---|---|---|---|---|
${results.checklists.map(c => `| ${c.slug} | ${c.counts.sections} | ${c.counts.items} | ${c.counts.faqs} | ${c.counts.pitfalls} | ${c.counts.relatedTools} | ${c.counts.officialLinks} | ${c.errors.length === 0 ? '✅' : '❌'} |`).join('\n')}

## Errors

${results.errors.length === 0 ? 'None ✅' : results.errors.map(e => `- **${e.slug || 'system'}**: ${e.error}`).join('\n')}

## Warnings

${results.warnings.length === 0 ? 'None' : results.warnings.map(w => `- ${w.slug || 'system'}: ${w.warning}`).join('\n')}

## Overall

${results.errors.length === 0 ? '✅ All validations passed' : `❌ ${results.errors.length} error(s) found`}
`;
  writeFileSync(join(REPORT_DIR, 'validation.md'), md);

  log(`\n🏁 Validation complete. ${results.errors.length} error(s), ${results.warnings.length} warning(s).`);
  log(`   Reports: ${REPORT_DIR}/validation.json`);
  log(`   Reports: ${REPORT_DIR}/validation.md`);

  if (results.errors.length > 0) process.exit(1);
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
