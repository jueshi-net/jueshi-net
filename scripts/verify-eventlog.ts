import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the EVENTLOG draft
  const docs = await prisma.$queryRaw`
    SELECT id, title, user_id, tool_key, data_json::text, created_at
    FROM tool_document_drafts
    WHERE data_json::text LIKE '%QS-VERIFY-EVENTLOG%'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  console.log('EVENTLOG draft:', JSON.stringify(docs, null, 2));

  // Check EventLog for this document
  const logs = await prisma.$queryRaw`
    SELECT id, event_type, tool_name, action::text, created_at
    FROM event_logs
    WHERE action::text LIKE '%cmq52haub00028b5putlrzdnc%'
    ORDER BY created_at DESC
    LIMIT 5
  `;
  console.log('EventLogs for this doc:', JSON.stringify(logs, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
