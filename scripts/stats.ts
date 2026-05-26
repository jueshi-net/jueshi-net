import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: 'postgresql://bxb_user:Bxb2024!Prod@Secure@127.0.0.1:5432/bxb_prod?schema=public' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.resource.count({ where: { isActive: true } });
  const ads = await prisma.resource.count({ where: { isActive: true, isAd: true } });
  const normal = await prisma.resource.count({ where: { isActive: true, isAd: false } });
  const cats = await prisma.resource.groupBy({ by: ['category'], _count: true, where: { isActive: true, isAd: false } });
  console.log('Total active:', total);
  console.log('Ads:', ads);
  console.log('Normal:', normal);
  console.log('Categories:', JSON.stringify(cats));
  await prisma.$disconnect();
}
main().catch(console.error);
