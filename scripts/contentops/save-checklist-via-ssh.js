#!/usr/bin/env node
/**
 * Save checklist to staging backend via SSH helper
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const taskId = process.argv[2];
const checklistFile = `/tmp/checklist-${taskId}.json`;

if (!taskId) {
  console.error('Usage: node save-checklist-via-ssh.js <taskId>');
  process.exit(1);
}

if (!fs.existsSync(checklistFile)) {
  console.error(`Checklist file not found: ${checklistFile}`);
  process.exit(1);
}

const checklist = JSON.parse(fs.readFileSync(checklistFile, 'utf-8'));

// Prepare body for staging API
const body = {
  action: 'create_task',
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
  targetEnvironment: 'staging',
  executionMode: 'schedule_when_validated',
  scheduledAt: new Date(Date.now() + 10 * 60000).toISOString() // 10 minutes from now
};

console.log('📤 Saving checklist to staging backend...');
console.log(`  Task ID: ${taskId}`);
console.log(`  Title: ${checklist.title}`);
console.log(`  Groups: ${checklist.groups?.length || 0}`);
console.log(`  Items: ${checklist.groups?.reduce((sum, g) => sum + (g.items?.length || 0), 0) || 0}`);

// Call staging helper via SSH
const args = [
  '-o', 'BatchMode=yes',
  '-o', 'ConnectTimeout=10',
  'deploy@192.129.155.149',
  'cd /home/deploy/xixiong-saas-staging && export $(grep -v \'^#\' .env.local | xargs) && npx tsx scripts/contentops/bridge-local-helper.ts'
];

const child = spawn('ssh', args, {
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
});

// Write request to stdin
child.stdin.write(JSON.stringify(body));
child.stdin.end();

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ SSH helper failed with exit code ${code}`);
    if (stderr) {
      console.error('stderr:', stderr.substring(0, 500));
    }
    process.exit(1);
  }

  try {
    // Extract JSON from stdout
    const jsonMatch = stdout.match(/\{[\s\S]*\}\s*$/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in stdout');
      console.error('stdout:', stdout.substring(0, 500));
      process.exit(1);
    }

    const response = JSON.parse(jsonMatch[0]);
    
    if (response.ok) {
      console.log('\n✅ Checklist saved successfully!');
      console.log(`  Status: ${response.status}`);
      console.log(`  Content ID: ${response.data?.taskId || response.data?.id || taskId}`);
      console.log(`  URL: https://i.jueshi.net/checklists/${checklist.slug}`);
    } else {
      console.error('\n❌ Bridge returned error:');
      console.error(`  Status: ${response.status}`);
      console.error(`  Error: ${response.error?.code} - ${response.error?.message}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Failed to parse response:', err.message);
    console.error('stdout:', stdout.substring(0, 500));
    process.exit(1);
  }
});

child.on('error', (err) => {
  console.error('❌ SSH connection failed:', err.message);
  process.exit(1);
});
