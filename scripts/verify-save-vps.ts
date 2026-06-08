import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' AND table_name LIKE '%tool%' 
    ORDER BY table_name
  `;
  console.log('tool tables:', JSON.stringify(tables, null, 2));

  const docs = await prisma.$queryRaw`
    SELECT * FROM tool_document_drafts
    WHERE data_json::text LIKE '%QS-VERIFY-ENV-FIX%'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  console.log('Latest ToolDocumentDraft:', JSON.stringify(docs, null, 2));

  const saveLogs = await prisma.$queryRaw`
    SELECT * FROM event_logs
    WHERE action::text LIKE '%Document_Save%'
    ORDER BY id DESC
    LIMIT 3
  `;
  console.log('Recent Document_Save logs:', JSON.stringify(saveLogs, null, 2));

  const todayMetrics = await prisma.$queryRaw`
    SELECT * FROM tool_metric_dailies
    WHERE tool_slug = 'quote-sheet' AND date = CURRENT_DATE
  `;
  console.log('Today quote-sheet metrics:', JSON.stringify(todayMetrics, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
