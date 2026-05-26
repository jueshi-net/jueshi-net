import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: 'postgresql://bxb_user:Bxb2024!Prod@Secure@127.0.0.1:5432/bxb_prod?schema=public' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.resource.upsert({
    where: { url: 'https://www.sellersprite.com' },
    create: {
      name: 'SellerSprite - Amazon Tool',
      url: 'https://www.sellersprite.com',
      description: 'Amazon selection, keyword analysis and listing optimization tool for cross-border sellers.',
      category: 'tools',
      tags: ['Amazon', 'Selection', 'Keywords'],
      sourceType: 'third-party',
      iconUrl: 'https://www.sellersprite.com/favicon.ico',
      isAd: true,
      isActive: true,
    },
    update: { isAd: true, iconUrl: 'https://www.sellersprite.com/favicon.ico' }
  });
  console.log('Seeded:', result.name, 'isAd:', result.isAd);
  await prisma.$disconnect();
}
main().catch(console.error);
