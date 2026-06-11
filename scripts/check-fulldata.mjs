import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '.env.production' });

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const doc = await prisma.documentHistory.findUnique({
    where: { id: 'cmq9c6kx40005fc5pez7x1wz0' },
    select: { documentData: true }
  });
  
  const data = JSON.parse(doc.documentData);
  console.log('Full documentData:');
  console.log(JSON.stringify(data, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
