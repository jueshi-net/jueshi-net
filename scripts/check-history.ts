import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check history for the current document
  const history = await prisma.$queryRaw`
    SELECT id, document_id, action, snapshot_json::text, created_at
    FROM tool_document_history
    WHERE document_id = 'cmq52haub00028b5putlrzdnc'
    ORDER BY created_at DESC
    LIMIT 10
  `;
  console.log('History entries:', JSON.stringify(history, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
