import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '.env.production' });

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Checking for NEW Commercial Invoice Drafts ===\n');
  
  // Query all commercial_invoice drafts, ordered by createdAt DESC
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
    take: 10,
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
      console.log(`  - remarks: ${data.remarks || '(empty)'}`);
      
      // Check for KEEP-ME-CI-FRESH marker
      if (data.remarks && data.remarks.includes('KEEP-ME-CI-FRESH')) {
        console.log(`\n  ✅ FOUND KEEP-ME-CI-FRESH marker in remarks!`);
      }
      
      // Check if this is the new test record
      if (data.companyName && data.companyName.includes('CI Fresh Test Company 20260611')) {
        console.log(`\n  ✅ THIS IS THE NEW TEST RECORD!`);
        console.log(`  - companyName matches: CI Fresh Test Company 20260611`);
        console.log(`  - invoiceNo: ${data.invoiceNo}`);
        console.log(`  - clientName: ${data.clientName}`);
        console.log(`  - lineItems: ${JSON.stringify(data.lineItems)}`);
      }
    } catch (e) {
      console.log(`  [Error parsing dataJson: ${e.message}]`);
    }
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Check EventLog for Document_Save events
  console.log('\n=== Checking EventLog for Document_Save events ===\n');
  
  const recentEvents = await prisma.eventLog.findMany({
    where: {
      eventType: 'Document_Save',
    },
    select: {
      id: true,
      eventType: true,
      action: true,
      path: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  console.log(`Found ${recentEvents.length} Document_Save events:\n`);
  console.table(recentEvents.map(e => ({
    id: e.id,
    eventType: e.eventType,
    action: e.action,
    path: e.path,
    createdAt: e.createdAt,
    metadata: e.metadata ? JSON.stringify(e.metadata).substring(0, 100) : '(null)',
  })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
