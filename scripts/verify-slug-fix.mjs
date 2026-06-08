// verify-slug-fix.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const envContent = fs.readFileSync('.env.production', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const url = process.env.DATABASE_URL || (match ? match[1] : '');

if (!url) {
  console.error('ERROR: DATABASE_URL not found');
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl: url });

async function run() {
  console.log('=== Drafts with QS-VERIFY-SLUG ===');
  const drafts = await prisma.toolDocumentDraft.findMany({
    where: { title: { contains: 'QS-VERIFY-SLUG' } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, title: true, toolKey: true, createdAt: true }
  });
  console.log(JSON.stringify(drafts, null, 2));

  console.log('\n=== EventLogs with Document_Save (latest 5) ===');
  const events = await prisma.eventLog.findMany({
    where: { eventType: 'Document_Save' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, eventType: true, toolName: true, action: true, createdAt: true }
  });
  console.log(JSON.stringify(events, null, 2));

  console.log('\n=== ToolMetricDaily for quote-sheet ===');
  const metrics = await prisma.toolMetricDaily.findMany({
    where: { toolSlug: 'quote-sheet' },
    orderBy: { date: 'desc' },
    take: 3,
  });
  console.log(JSON.stringify(metrics, null, 2));

  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
