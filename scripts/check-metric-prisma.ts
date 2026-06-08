import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.toolMetricDaily.count();
  console.log('ToolMetricDaily count:', count);
  
  const todaysMetrics = await prisma.toolMetricDaily.findMany({
    where: {
      date: new Date(),
      toolSlug: 'quote-sheet'
    }
  });
  console.log('Today quote-sheet metrics:', JSON.stringify(todaysMetrics, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
