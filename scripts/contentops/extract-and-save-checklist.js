#!/usr/bin/env node
/**
 * Extract checklist from outbox and save to staging backend
 */

const fs = require('fs');
const path = require('path');

const OUTBOX_DIR = path.join(process.env.HOME, '.jueshi-contentops/jobs/outbox');
const taskId = process.argv[2];

if (!taskId) {
  console.error('Usage: node extract-and-save-checklist.js <taskId>');
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
  // Remove warning prefix if present
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

console.log('✅ Checklist extracted successfully:');
console.log(`  Title: ${checklist.title}`);
console.log(`  Content Type: ${checklist.contentType}`);
console.log(`  Audience: ${checklist.audience}`);
console.log(`  Groups: ${checklist.groups?.length || 0}`);
console.log(`  Total Items: ${checklist.groups?.reduce((sum, g) => sum + (g.items?.length || 0), 0) || 0}`);

// Save extracted checklist to temp file
const tempFile = `/tmp/checklist-${taskId}.json`;
fs.writeFileSync(tempFile, JSON.stringify(checklist, null, 2));
console.log(`\n📄 Saved to: ${tempFile}`);

// Output for next step
console.log(`\n📋 Next step: Save to staging backend`);
console.log(`  Task ID: ${taskId}`);
console.log(`  Content ID: checklist_${taskId}`);
