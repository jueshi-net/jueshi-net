#!/usr/bin/env node
/**
 * Process checklist outbox and save to staging backend
 */

const fs = require('fs');
const path = require('path');

const OUTBOX_DIR = path.join(process.env.HOME, '.jueshi-contentops/jobs/outbox');
const taskId = process.argv[2];

if (!taskId) {
  console.error('Usage: node process-checklist-outbox.js <taskId>');
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
  // Remove warning prefix
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
  console.error('Content preview:', contentStr.substring(0, 500));
  process.exit(1);
}

console.log('Checklist parsed successfully:');
console.log(`  Title: ${checklist.title}`);
console.log(`  Content Type: ${checklist.contentType}`);
console.log(`  Audience: ${checklist.audience}`);
console.log(`  Groups: ${checklist.groups?.length || 0}`);
console.log(`  Total Items: ${checklist.groups?.reduce((sum, g) => sum + (g.items?.length || 0), 0) || 0}`);

// Save to staging backend via SSH helper
const helperScript = path.join(__dirname, '../../src/lib/contentops/staging-local-helper.ts');
const helperClient = path.join(__dirname, '../../src/lib/contentops/staging-helper-client.ts');

// For now, just output the parsed checklist
console.log('\nParsed checklist structure:');
console.log(JSON.stringify(checklist, null, 2).substring(0, 2000));
