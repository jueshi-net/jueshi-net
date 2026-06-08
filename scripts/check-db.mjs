import { Client } from 'pg';
import fs from 'fs';

const configContent = fs.readFileSync('/home/deploy/xixiong-saas/ecosystem.config.js', 'utf8');
const match = configContent.match(/DATABASE_URL:\s*"([^"]+)"/);
if (!match) {
  console.error('DATABASE_URL not found in ecosystem.config.js');
  process.exit(1);
}

const dbUrl = match[1];
const client = new Client({ connectionString: dbUrl });

async function run() {
  await client.connect();
  
  console.log('=== Latest 3 quote_sheet drafts ===');
  const drafts = await client.query(
    `SELECT id, left(title, 50) as title, updated_at 
     FROM tool_document_drafts 
     WHERE tool_key = 'quote_sheet' 
     ORDER BY updated_at DESC LIMIT 3`
  );
  console.table(drafts.rows);
  
  console.log('\n=== Latest 5 Document_Save events ===');
  const events = await client.query(
    `SELECT id, "eventType", "toolName", left("action"::text, 150) as action_preview, "createdAt" 
     FROM event_logs 
     WHERE "eventType" = 'Document_Save' 
     ORDER BY "createdAt" DESC LIMIT 5`
  );
  console.table(events.rows);
  
  console.log('\n=== ToolMetricDaily for quote-sheet ===');
  const metrics = await client.query(
    `SELECT "toolSlug", date, views, saves FROM "ToolMetricDaily" 
     WHERE "toolSlug" = 'quote-sheet' ORDER BY date DESC LIMIT 3`
  );
  console.table(metrics.rows);
  
  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
