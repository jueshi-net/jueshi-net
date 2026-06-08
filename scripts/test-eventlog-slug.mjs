// test-eventlog-slug.mjs — Test EventLog slug normalization via API
import { Client } from 'pg';
import https from 'https';
import fs from 'fs';

// Get DB URL
const configContent = fs.readFileSync('/home/deploy/xixiong-saas/ecosystem.config.js', 'utf8');
const match = configContent.match(/DATABASE_URL:\s*"([^"]+)"/);
const dbUrl = match[1];

const client = new Client({ connectionString: dbUrl });

async function run() {
  await client.connect();
  
  // Find latest Document_Save events to check toolSlug normalization
  const events = await client.query(
    `SELECT id, "eventType", "toolName", "action", "createdAt" 
     FROM event_logs 
     WHERE "eventType" = 'Document_Save' 
     ORDER BY "createdAt" DESC LIMIT 10`
  );
  
  console.log('=== Latest 10 Document_Save events ===');
  for (const e of events.rows) {
    const action = typeof e.action === 'string' ? JSON.parse(e.action) : e.action;
    console.log(`[${e.createdAt.toISOString()}] toolName=${e.toolName || 'null'}, toolSlug=${action.toolSlug || 'N/A'}, docId=${action.documentId || 'N/A'}, source=${action.source || 'N/A'}`);
  }
  
  // Check ToolMetricDaily
  const metrics = await client.query(
    `SELECT "tool_slug" as "toolSlug", date, views, saves FROM tool_metric_dailies 
     WHERE "tool_slug" = 'quote-sheet' ORDER BY date DESC LIMIT 3`
  );
  console.log('\n=== ToolMetricDaily (quote-sheet) ===');
  console.table(metrics.rows);
  
  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
