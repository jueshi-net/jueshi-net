import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing database connection...');
  
  // Test 1: Check DocumentHistory count
  const docCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "DocumentHistory"`;
  console.log('DocumentHistory count:', docCount);
  
  // Test 2: Check latest commercial-invoice records
  const latestCI = await prisma.$queryRaw`
    SELECT id, "documentType", "documentNo", "createdAt", 
           substring("documentData"::text, 1, 200) as data_preview
    FROM "DocumentHistory"
    WHERE "documentType" = 'commercial-invoice'
    ORDER BY "createdAt" DESC
    LIMIT 3
  `;
  console.log('Latest commercial-invoice records:', JSON.stringify(latestCI, null, 2));
  
  // Test 3: Check Document_Save EventLog
  const saveLogs = await prisma.$queryRaw`
    SELECT id, "eventType", "toolName", "path", "createdAt"
    FROM event_logs
    WHERE "eventType" = 'Document_Save'
    ORDER BY "createdAt" DESC
    LIMIT 5
  `;
  console.log('Recent Document_Save logs:', JSON.stringify(saveLogs, null, 2));
  
  await prisma.$disconnect();
  console.log('Database test completed successfully!');
}

main().catch(err => {
  console.error('Database test failed:', err.message);
  process.exit(1);
});
