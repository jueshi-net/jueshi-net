#!/usr/bin/env node
/**
 * Save checklist to staging backend via SSH helper
 * Uses the same staging-helper-client as the Bot
 */

const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

const TASK_ID = 'task_1784651981732_cmselg';
const CHECKLIST_FILE = '/tmp/checklist-task_1784651981732_cmselg.json';

// Read checklist data
const checklistData = JSON.parse(fs.readFileSync(CHECKLIST_FILE, 'utf8'));

console.log('=== Checklist Backend Save ===');
console.log('Task ID:', TASK_ID);
console.log('Title:', checklistData.title);
console.log('Groups:', checklistData.groups.length);
console.log('Items:', checklistData.groups.reduce((sum, g) => sum + g.items.length, 0));

// Prepare Bridge request body
const requestBody = {
  action: 'create_task',
  idempotencyKey: TASK_ID,
  body: {
    contentType: 'checklist',
    executionMode: 'schedule_when_validated',
    targetEnvironment: 'staging',
    title: checklistData.title,
    content: checklistData,
    metadata: {
      taskId: TASK_ID,
      source: 'hermes-contentops',
      generatedAt: new Date().toISOString(),
    }
  }
};

console.log('\n=== Calling SSH Helper ===');

// Call staging-local-helper via SSH
const sshArgs = [
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ConnectTimeout=10',
  'deploy@192.129.155.149',
  'cd /home/deploy/xixiong-saas-staging && node src/lib/contentops/staging-local-helper.js'
];

const ssh = spawn('ssh', sshArgs, {
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

ssh.stdout.on('data', (data) => {
  stdout += data.toString();
});

ssh.stderr.on('data', (data) => {
  stderr += data.toString();
});

ssh.on('close', (code) => {
  console.log('\n=== SSH Helper Response ===');
  console.log('Exit code:', code);
  
  if (stderr) {
    console.log('Stderr:', stderr.substring(0, 500));
  }
  
  if (code !== 0) {
    console.error('❌ SSH helper failed');
    process.exit(1);
  }
  
  try {
    // Extract JSON from stdout (may have multiple lines)
    const lines = stdout.trim().split('\n');
    const jsonLine = lines.find(l => l.trim().startsWith('{'));
    
    if (!jsonLine) {
      console.error('❌ No JSON in stdout');
      console.log('Full stdout:', stdout);
      process.exit(1);
    }
    
    const response = JSON.parse(jsonLine);
    
    if (response.ok) {
      console.log('✅ Checklist saved successfully');
      console.log('Status:', response.status);
      console.log('Task ID:', response.data?.task?.id);
      console.log('Content ID:', response.data?.task?.contentId || response.data?.contentId);
      
      // Save result
      const result = {
        taskId: TASK_ID,
        contentId: response.data?.task?.contentId || response.data?.contentId,
        savedAt: new Date().toISOString(),
        response: response
      };
      
      fs.writeFileSync('/tmp/checklist-saved-result.json', JSON.stringify(result, null, 2));
      console.log('\nResult saved to /tmp/checklist-saved-result.json');
    } else {
      console.error('❌ Bridge returned error');
      console.error('Error:', response.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Failed to parse response:', err.message);
    console.log('Raw stdout:', stdout);
    process.exit(1);
  }
});

// Send request body via stdin
ssh.stdin.write(JSON.stringify(requestBody));
ssh.stdin.end();
