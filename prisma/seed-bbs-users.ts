/**
 * prisma/seed-bbs-users.ts
 *
 * Seed 8 virtual BBS user accounts for automated forum content generation.
 * Run: npx tsx prisma/seed-bbs-users.ts
 *
 * These accounts are used exclusively by the BBS seed webhook to simulate
 * organic community activity. They cannot log in (no known password).
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR_COLORS = [
  'ef4444', 'f97316', 'eab308', '22c55e',
  '06b6d4', '3b82f6', '8b5cf6', 'ec4899',
];

const VIRTUAL_USERS = [
  { name: '跨境老炮', email: 'seller-veteran@bbs-local.test' },
  { name: 'Shopify小白', email: 'shopify-newbie@bbs-local.test' },
  { name: '多伦多大卖', email: 'toronto-merchant@bbs-local.test' },
  { name: '物流老司机', email: 'logistics-driver@bbs-local.test' },
  { name: '澳洲留学生Lisa', email: 'austudent-lisa@bbs-local.test' },
  { name: '湾区程序员', email: 'bayarea-dev@bbs-local.test' },
  { name: '日本生活家', email: 'japan-lifestyle@bbs-local.test' },
  { name: '欧洲站卖家Anna', email: 'eu-seller-anna@bbs-local.test' },
];

async function main() {
  console.log('🌱 Seeding BBS virtual users...\n');

  const randomPassword = await bcrypt.hash('VirtualUser2026!', 10);

  let created = 0;
  let skipped = 0;

  for (const u of VIRTUAL_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  ⏭️  ${u.name} (${u.email}) — already exists`);
      skipped++;
      continue;
    }

    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=${AVATAR_COLORS[created % AVATAR_COLORS.length]}`;

    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: randomPassword,
        role: 'user',
        image: avatarUrl,
        points: 100,
        growthValue: 50,
        levelKey: 'lv1',
      },
    });

    console.log(`  ✅ ${u.name} (${u.email}) — created`);
    created++;
  }

  console.log(`\n📊 Done: ${created} created, ${skipped} skipped`);
  console.log('🔐 Password for all accounts: VirtualUser2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
