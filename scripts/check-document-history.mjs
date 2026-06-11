import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '.env.production' });

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== Checking DocumentHistory for NEW Commercial Invoice ===\n');
  
  // Query DocumentHistory for commercial-invoice
  const docs = await prisma.documentHistory.findMany({
    where: {
      documentType: 'commercial-invoice',
    },
    select: {
      id: true,
      userId: true,
      documentType: true,
      documentNo: true,
      documentData: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  console.log(`Found ${docs.length} commercial-invoice documents in DocumentHistory:\n`);
  
  for (const doc of docs) {
    console.log(`ID: ${doc.id}`);
    console.log(`User ID: ${doc.userId}`);
    console.log(`Document Type: ${doc.documentType}`);
    console.log(`Document No: ${doc.documentNo || '(empty)'}`);
    console.log(`Created: ${doc.createdAt}`);
    
    // Parse documentData to check content
    try {
      const data = typeof doc.documentData === 'string' ? JSON.parse(doc.documentData) : doc.documentData;
      console.log(`\nDocument Data:`);
      console.log(`  - formData.documentNo: ${data.formData?.documentNo || '(empty)'}`);
      console.log(`  - formData.shipper: ${data.formData?.shipper || '(empty)'}`);
      console.log(`  - formData.consignee: ${data.formData?.consignee || '(empty)'}`);
      console.log(`  - lineItems count: ${data.lineItems?.length || 0}`);
      
      if (data.lineItems && data.lineItems.length > 0) {
        console.log(`  - lineItems[0].description: ${data.lineItems[0].description || '(empty)'}`);
        console.log(`  - lineItems[0].unitPrice: ${data.lineItems[0].unitPrice || 0}`);
        console.log(`  - lineItems[0].remarks: ${data.lineItems[0].remarks || '(empty)'}`);
      }
      
      // Check for KEEP-ME-CI-FRESH marker
      const dataStr = JSON.stringify(data);
      if (dataStr.includes('KEEP-ME-CI-FRESH')) {
        console.log(`\n  ✅ FOUND KEEP-ME-CI-FRESH marker!`);
      }
      
      // Check if this is the new test record
      if (data.formData?.documentNo && data.formData.documentNo.includes('CI-FRESH-20260611')) {
        console.log(`\n  ✅ THIS IS THE NEW TEST RECORD!`);
        console.log(`  - documentNo: ${data.formData.documentNo}`);
        console.log(`  - shipper: ${data.formData.shipper}`);
        console.log(`  - consignee: ${data.formData.consignee}`);
      }
    } catch (e) {
      console.log(`  [Error parsing documentData: ${e.message}]`);
    }
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Also check ToolDocumentDraft for comparison
  console.log('\n=== Checking ToolDocumentDraft for comparison ===\n');
  const drafts = await prisma.toolDocumentDraft.findMany({
    where: {
      toolKey: 'commercial_invoice',
    },
    select: {
      id: true,
      userId: true,
      toolKey: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
  
  console.log(`Found ${drafts.length} commercial_invoice drafts in ToolDocumentDraft`);
  console.table(drafts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
