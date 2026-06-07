import { prisma } from './prisma/client.js';

async function seed() {
  const existing = await prisma.subscriptionPlan.count();
  if (existing > 0) {
    console.log('Plans already exist');
    process.exit(0);
  }

  await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'free', price: 0, features: JSON.stringify(['基础链接管理', '50个链接上限', '1个用户', '100MB存储']), maxLinks: 50, maxUsers: 1, maxStorage: 100 },
      { name: 'pro', price: 2900, features: JSON.stringify(['无限链接', '5个用户', '1GB存储', '高级统计', '自定义域名']), maxLinks: -1, maxUsers: 5, maxStorage: 1024 },
      { name: 'enterprise', price: 9900, features: JSON.stringify(['无限链接', '无限用户', '10GB存储', 'API访问', 'Webhook', 'SLA保障']), maxLinks: -1, maxUsers: -1, maxStorage: 10240 },
    ]
  });
  console.log('Plans seeded!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
