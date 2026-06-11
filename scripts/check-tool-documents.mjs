import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.production' });

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in .env.production');
  process.exit(1);
}

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Checking ToolDocument records...\n');
  
  // 1. Count by tool_key
  const byToolKey = await prisma.toolDocumentDraft.groupBy({
    by: ['toolKey'],
    _count: {
      toolKey: true,
    },
  });
  
  console.log('=== ToolDocumentDraft count by toolKey ===');
  console.table(byToolKey.map(r => ({ toolKey: r.toolKey, count: r._count.toolKey })));
  
  // 2. Check if commercial_invoice exists
  const commercialInvoices = await prisma.toolDocumentDraft.findMany({
    where: {
      toolKey: 'commercial_invoice',
    },
    select: {
      id: true,
      toolKey: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  console.log('\n=== Commercial Invoice drafts (latest 10) ===');
  console.log(`Found: ${commercialInvoices.length}`);
  console.table(commercialInvoices);
  
  // 3. Check quotation drafts
  const quotations = await prisma.toolDocumentDraft.findMany({
    where: {
      toolKey: 'quotation',
    },
    select: {
      id: true,
      toolKey: true,
      userId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
  
  console.log('\n=== Quotation drafts (latest 5) ===');
  console.log(`Found: ${quotations.length}`);
  console.table(quotations);
  
  // 4. Total count
  const total = await prisma.toolDocumentDraft.count();
  console.log(`\n=== Total ToolDocumentDraft records: ${total} ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
