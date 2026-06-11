import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '.env.production' });

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Commercial Invoice Draft Details ===\n');
  
  const ciDrafts = await prisma.toolDocumentDraft.findMany({
    where: {
      toolKey: 'commercial_invoice',
    },
    select: {
      id: true,
      toolKey: true,
      userId: true,
      title: true,
      dataJson: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  console.log(`Found ${ciDrafts.length} commercial_invoice drafts:\n`);
  
  for (const draft of ciDrafts) {
    console.log(`ID: ${draft.id}`);
    console.log(`User ID: ${draft.userId}`);
    console.log(`Title: ${draft.title}`);
    console.log(`Created: ${draft.createdAt}`);
    console.log(`Updated: ${draft.updatedAt}`);
    
    // Parse dataJson to check content
    try {
      const data = JSON.parse(draft.dataJson);
      console.log(`\nData fields:`);
      console.log(`  - companyName: ${data.companyName || '(empty)'}`);
      console.log(`  - clientName: ${data.clientName || '(empty)'}`);
      console.log(`  - invoiceNo: ${data.invoiceNo || '(empty)'}`);
      console.log(`  - invoiceDate: ${data.invoiceDate || '(empty)'}`);
      console.log(`  - lineItems count: ${data.lineItems?.length || 0}`);
      console.log(`  - freight: ${data.freight || 0}`);
      console.log(`  - insurance: ${data.insurance || 0}`);
      console.log(`  - paymentTerms: ${data.paymentTerms || '(empty)'}`);
    } catch (e) {
      console.log(`  [Error parsing dataJson: ${e.message}]`);
    }
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Check quotation drafts
  console.log('\n=== Quotation Drafts ===\n');
  const quoteDrafts = await prisma.toolDocumentDraft.findMany({
    where: {
      toolKey: 'quotation',
    },
    select: {
      id: true,
      userId: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
  
  console.log(`Found ${quoteDrafts.length} quotation drafts`);
  console.table(quoteDrafts);
  
  // Check quote_sheet drafts
  console.log('\n=== Quote Sheet Drafts ===\n');
  const qsDrafts = await prisma.toolDocumentDraft.findMany({
    where: {
      toolKey: 'quote_sheet',
    },
    select: {
      id: true,
      userId: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
  
  console.log(`Found ${qsDrafts.length} quote_sheet drafts`);
  console.table(qsDrafts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
