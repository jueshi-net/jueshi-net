import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const draft = await prisma.$queryRaw`
    SELECT id, data_json::text, updated_at
    FROM tool_document_drafts
    WHERE id = 'cmq52haub00028b5putlrzdnc'
  `;
  console.log('Current draft:', JSON.stringify(draft, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
