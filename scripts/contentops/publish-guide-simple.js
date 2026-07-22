#!/usr/bin/env node
/**
 * Publish existing guide content to staging backend via Bridge API
 * Direct call with HMAC signature
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const crypto = require('crypto');

const HOME_DIR = os.homedir();
const OUTBOX_DIR = path.join(HOME_DIR, '.jueshi-contentops/jobs/outbox');
// SECURITY: Bridge Secret removed - use staging-helper-client instead
// This script is deprecated and should not be used
const BRIDGE_SECRET = process.env.CONTENTOPS_BRIDGE_SECRET || '';

if (!BRIDGE_SECRET) {
  console.error('ERROR: CONTENTOPS_BRIDGE_SECRET not set');
  console.error('This script is deprecated. Use staging-helper-client instead.');
  process.exit(1);
}

function generateHMAC(payload, path) {
  const body = JSON.stringify(payload);
  const signaturePayload = `POST:${path}:${body}`;
  const signature = crypto
    .createHmac('sha256', BRIDGE_SECRET)
    .update(signaturePayload)
    .digest('hex');
  
  return { signature, body };
}

async function main() {
  const taskId = 'task_1784645450775_1agn2d';
  const outboxFile = path.join(OUTBOX_DIR, `${taskId}.json`);
  
  console.log(`[Publish] Reading existing content...`);
  
  if (!fs.existsSync(outboxFile)) {
    console.error(`[Publish] Outbox file not found`);
    process.exit(1);
  }
  
  const outboxData = JSON.parse(fs.readFileSync(outboxFile, 'utf-8'));
  const content = JSON.parse(outboxData.content);
  
  console.log(`[Publish] Content: ${content.title}`);
  console.log(`[Publish] Body length: ${content.content.body.length} chars`);
  
  // Prepare payload for Bridge API (default action: create new draft)
  const payload = {
    title: content.title,
    body: content.content.body || '',  // Bridge API expects 'body' field
    targetEnvironment: 'staging',
    qualityMetadata: {
      contentType: 'guide',
      summary: content.summary || '',
      seoTitle: content.seo?.metaTitle || '',
      seoDescription: content.seo?.metaDescription || '',
      faq: content.faq || [],
      sources: content.sources || [],
      seo: content.seo,
      geo: content.geo,
      audience: content.content.audience || '',
      steps: content.content.steps || [],
      pitfalls: content.content.pitfalls || [],
      internalLinks: content.internalLinks || [],
      structuredData: content.structuredData,
    },
  };
  
  console.log(`[Publish] Generating HMAC signature...`);
  const apiPath = '/api/internal/contentops/drafts';
  const { signature, body } = generateHMAC(payload, apiPath);
  
  console.log(`[Publish] Calling Bridge API via SSH...`);
  
  // Write payload to temp file to avoid shell escaping issues
  const tempFile = '/tmp/contentops-payload.json';
  fs.writeFileSync(tempFile, body);
  
  // Use scp to copy file to staging, then curl from there
  const scpCmd = `scp ${tempFile} deploy@192.129.155.149:/tmp/contentops-payload.json`;
  const scpResult = spawn('bash', ['-c', scpCmd], { stdio: 'inherit' });
  
  scpResult.on('close', (code) => {
    if (code !== 0) {
      console.error(`[Publish] SCP failed with code ${code}`);
      process.exit(1);
    }
    
    // Now call curl on staging
    const curlCmd = `ssh deploy@192.129.155.149 "curl -s -X POST http://127.0.0.1:3001${apiPath} \\
      -H 'Content-Type: application/json' \\
      -H 'X-ContentOps-Signature: ${signature}' \\
      -d @/tmp/contentops-payload.json"`;
    
    const curlResult = spawn('bash', ['-c', curlCmd], { stdio: ['ignore', 'pipe', 'pipe'] });
    
    let stdout = '';
    let stderr = '';
    
    curlResult.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    curlResult.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    curlResult.on('close', (code) => {
      if (code !== 0) {
        console.error(`[Publish] Curl failed: ${stderr}`);
        process.exit(1);
      }
      
      try {
        const response = JSON.parse(stdout);
        
        // Check for error response
        if (response.error) {
          console.error(`[Publish] Failed: ${response.error}`);
          console.error(`[Publish] Response:`, JSON.stringify(response, null, 2));
          process.exit(1);
        }
        
        // Success response has 'id' field
        if (!response.id) {
          console.error(`[Publish] No draft ID in response`);
          console.error(`[Publish] Response:`, JSON.stringify(response, null, 2));
          process.exit(1);
        }
        
        console.log(`[Publish] Success!`);
        console.log(`[Publish] Draft ID: ${response.id}`);
        console.log(`[Publish] Title: ${response.title}`);
        console.log(`[Publish] State: ${response.state}`);
        console.log(`[Publish] Environment: ${response.targetEnvironment}`);
        
        // Update outbox
        const updatedOutbox = {
          ...outboxData,
          taskId,
          backendContentId: response.id,
          guideStatus: response.state === 'DRAFT' ? 'AWAITING_REVIEW' : response.state,
          publishedAt: response.createdAt,
        };
        
        fs.writeFileSync(outboxFile, JSON.stringify(updatedOutbox, null, 2));
        console.log(`[Publish] Outbox updated`);
        
        // Output notification data
        console.log('\n=== TELEGRAM_NOTIFICATION_DATA ===');
        console.log(JSON.stringify({
          taskId,
          title: content.title,
          backendContentId: response.id,
          contentLength: content.content.body.length,
          status: 'AWAITING_REVIEW',
          adminUrl: `https://i.jueshi.net/admin/contentops`,
        }, null, 2));
        
      } catch (e) {
        console.error(`[Publish] Invalid JSON response: ${stdout.substring(0, 500)}`);
        process.exit(1);
      }
    });
  });
}

main();
