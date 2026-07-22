#!/usr/bin/env node
/**
 * Save checklist to staging backend via SSH helper
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTBOX_DIR = path.join(process.env.HOME, '.jueshi-contentops/jobs/outbox');
const taskId = process.argv[2];

if (!taskId) {
  console.error('Usage: node save-checklist-to-staging.js <taskId>');
  process.exit(1);
}

const outboxFile = path.join(OUTBOX_DIR, `${taskId}.json`);
if (!fs.existsSync(outboxFile)) {
  console.error(`Outbox file not found: ${outboxFile}`);
  process.exit(1);
}

const outbox = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));

// Parse content string to extract JSON
let contentStr = outbox.content;
if (typeof contentStr === 'string') {
  const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    contentStr = jsonMatch[0];
  }
}

let checklist;
try {
  checklist = JSON.parse(contentStr);
} catch (err) {
  console.error('Failed to parse checklist JSON:', err.message);
  process.exit(1);
}

console.log('Checklist parsed:');
console.log(`  Title: ${checklist.title}`);
console.log(`  Groups: ${checklist.groups?.length || 0}`);
console.log(`  Items: ${checklist.groups?.reduce((sum, g) => sum + (g.items?.length || 0), 0) || 0}`);

// Prepare body for staging API
const body = {
  taskId: taskId,
  contentType: 'checklist',
  title: checklist.title,
  slug: checklist.slug,
  summary: checklist.summary,
  audience: checklist.audience,
  groups: checklist.groups,
  seo: checklist.seo,
  geo: checklist.geo,
  sources: checklist.sources || [],
  faq: checklist.faq || [],
  status: 'DRAFT',
  targetEnvironment: 'staging'
};

// Save to staging via SSH helper
const helperScript = '/home/deploy/xixiong-saas-staging/scripts/contentops/bridge-local-helper.ts';
const bodyJson = JSON.stringify(body);

try {
  const result = execSync(
    `ssh deploy@192.129.155.149 "cd /home/deploy/xixiong-saas-staging && echo '${bodyJson.replace(/'/g, "'\\''")}' | npx tsx ${helperScript} --action create_checklist"`,
    { encoding: 'utf-8', timeout: 30000 }
  );
  
  console.log('\nStaging API response:');
  console.log(result);
  
  const response = JSON.parse(result);
  if (response.success) {
    console.log(`\n✅ Checklist saved successfully!`);
    console.log(`  Content ID: ${response.contentId}`);
    console.log(`  URL: ${response.url}`);
  } else {
    console.error(`\n❌ Failed to save checklist:`, response.error);
    process.exit(1);
  }
} catch (err) {
  console.error('SSH helper failed:', err.message);
  process.exit(1);
}
