#!/usr/bin/env node
/**
 * Publish existing guide content to staging backend via Bridge API
 * 
 * This script reads the existing outbox content and publishes it via the Bridge API.
 * Uses SSH to call the staging Bridge directly with HMAC signature.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const crypto = require('crypto');

const HOME_DIR = os.homedir();
const OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/outbox');

function generateHMAC(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  
  return { timestamp, signature };
}

async function callBridgeAPI(payload) {
  return new Promise((resolve, reject) => {
    const stagingHost = 'deploy@192.129.155.149';
    const bridgeUrl = 'http://127.0.0.1:3001/api/internal/contentops/drafts';
    
    // Get Bridge Secret from staging environment
    const getSecretCmd = `ssh ${stagingHost} "pm2 env xixiong-staging 2>/dev/null | grep CONTENTOPS_BRIDGE_SECRET | cut -d= -f2-"`;
    
    spawn('bash', ['-c', getSecretCmd], { stdio: ['ignore', 'pipe', 'pipe'] })
      .stdout.on('data', (data) => {
        const secret = data.toString().trim();
        
        if (!secret) {
          reject(new Error('BRIDGE_SECRET_NOT_FOUND'));
          return;
        }
        
        // Generate HMAC signature
        const { timestamp, signature } = generateHMAC(payload, secret);
        
        // Use curl to call the Bridge API with HMAC headers
        const curlCmd = `curl -s -X POST ${bridgeUrl} \\
          -H "Content-Type: application/json" \\
          -H "X-ContentOps-Timestamp: ${timestamp}" \\
          -H "X-ContentOps-Signature: ${signature}" \\
          -d '${JSON.stringify(payload)}'`;
        
        const child = spawn('ssh', [stagingHost, curlCmd], {
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        const timeout = setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error('BRIDGE_API_TIMEOUT'));
        }, 60000);
        
        child.on('close', (code) => {
          clearTimeout(timeout);
          
          if (code !== 0) {
            reject(new Error(`BRIDGE_API_EXIT_${code}: ${stderr.substring(0, 500)}`));
            return;
          }
          
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            reject(new Error('BRIDGE_API_INVALID_JSON: ' + stdout.substring(0, 500)));
          }
        });
        
        child.on('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`BRIDGE_API_SPAWN_FAILED: ${error.message}`));
        });
      });
  });
}

async function main() {
  const taskId = 'task_1784645450775_1agn2d';
  const outboxFile = path.join(OUTBOX_DIR, `${taskId}.json`);
  
  console.log(`[Publish] Reading existing content from ${outboxFile}`);
  
  if (!fs.existsSync(outboxFile)) {
    console.error(`[Publish] Outbox file not found: ${outboxFile}`);
    process.exit(1);
  }
  
  const outboxData = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));
  const content = JSON.parse(outboxData.content);
  
  console.log(`[Publish] Content loaded: ${content.title}`);
  console.log(`[Publish] Content type: ${content.contentType}`);
  console.log(`[Publish] Body length: ${content.content.body.length} chars`);
  
  // Prepare payload for Bridge API
  const payload = {
    idempotencyKey: taskId,
    taskId,
    contentType: 'guide',
    title: content.title,
    slug: content.slug,
    excerpt: content.summary,
    body: content.content.body || '',
    audience: content.content.audience || '',
    steps: content.content.steps || [],
    pitfalls: content.content.pitfalls || [],
    faq: content.faq || [],
    seo: content.seo,
    geo: content.geo,
    sources: content.sources || [],
    internalLinks: content.internalLinks || [],
    structuredData: content.structuredData,
  };
  
  console.log(`[Publish] Calling Bridge API...`);
  
  try {
    const response = await callBridgeAPI(payload);
    
    if (!response.success && !response.draftId) {
      console.error(`[Publish] Failed: ${response.error || 'Unknown error'}`);
      console.error(`[Publish] Response:`, JSON.stringify(response, null, 2));
      process.exit(1);
    }
    
    console.log(`[Publish] Success!`);
    console.log(`[Publish] Draft ID: ${response.draftId}`);
    console.log(`[Publish] Published URL: ${response.publishedUrl || 'N/A'}`);
    
    // Update outbox file with backend metadata
    const updatedOutbox = {
      ...outboxData,
      taskId,
      backendContentId: response.draftId,
      guideStatus: 'AWAITING_REVIEW',
      publishedUrl: response.publishedUrl,
      publishedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(outboxFile, JSON.stringify(updatedOutbox, null, 2));
    console.log(`[Publish] Outbox updated with backend metadata`);
    
    // Output for Telegram notification
    console.log('\n=== TELEGRAM_NOTIFICATION_DATA ===');
    console.log(JSON.stringify({
      taskId,
      title: content.title,
      backendContentId: response.draftId,
      contentLength: content.content.body.length,
      status: 'AWAITING_REVIEW',
      publishedUrl: response.publishedUrl,
    }, null, 2));
    
  } catch (error) {
    console.error(`[Publish] Script failed: ${error.message}`);
    process.exit(1);
  }
}

main();
