import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'test@jueshi' } },
        { email: { contains: '9833416' } }
      ]
    },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('Users found:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
