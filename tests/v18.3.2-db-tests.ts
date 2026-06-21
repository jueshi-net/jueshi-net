/**
 * v1.20.42.18.3.2 - Database tests (run on VPS)
 * Run with: cd /home/deploy/xixiong-saas && export $(grep DATABASE_URL .env.production | xargs) && npx tsx tests/v18.3.2-db-tests.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(2);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n🗄️  v1.20.42.18.3.2 Database Tests (VPS)\n');
  console.log('━'.repeat(60));

  // ─── Reward Safety Tests ─────────────────────────────────
  console.log('\n📦 Reward Safety Tests');
  console.log('─'.repeat(60));

  await test('admin user 9833416@qq.com has role=admin', async () => {
    const admin = await prisma.user.findUnique({ 
      where: { email: '9833416@qq.com' },
      select: { role: true }
    });
    if (!admin) throw new Error('Admin user not found');
    if (admin.role !== 'admin') throw new Error(`Expected admin, got ${admin.role}`);
  });

  await test('no user has role=member (lowercase)', async () => {
    const count = await prisma.user.count({ where: { role: 'member' } });
    if (count > 0) throw new Error(`Found ${count} users with role=member`);
  });

  await test('ad_slot_7day is inactive (safety)', async () => {
    const item = await prisma.rewardItem.findUnique({ 
      where: { code: 'ad_slot_7day' },
      select: { enabled: true }
    });
    if (!item) throw new Error('ad_slot_7day not found');
    if (item.enabled) throw new Error('ad_slot_7day should be inactive');
  });

  await test('growth_50 is active', async () => {
    const item = await prisma.rewardItem.findUnique({ 
      where: { code: 'growth_50' },
      select: { enabled: true }
    });
    if (!item) throw new Error('growth_50 not found');
    if (!item.enabled) throw new Error('growth_50 should be active');
  });

  await test('member_1day is active', async () => {
    const item = await prisma.rewardItem.findUnique({ 
      where: { code: 'member_1day' },
      select: { enabled: true }
    });
    if (!item) throw new Error('member_1day not found');
    if (!item.enabled) throw new Error('member_1day should be active');
  });

  await test('word_export_coupon items are inactive', async () => {
    const items = await prisma.rewardItem.findMany({
      where: { rewardType: 'word_export_coupon' },
      select: { code: true, enabled: true }
    });
    const active = items.filter(i => i.enabled);
    if (active.length > 0) {
      throw new Error(`Found active word_export items: ${active.map(i => i.code).join(', ')}`);
    }
  });

  await test('no_branding_coupon items are inactive', async () => {
    const items = await prisma.rewardItem.findMany({
      where: { rewardType: 'no_branding_coupon' },
      select: { code: true, enabled: true }
    });
    const active = items.filter(i => i.enabled);
    if (active.length > 0) {
      throw new Error(`Found active no_branding items: ${active.map(i => i.code).join(', ')}`);
    }
  });

  await test('no points-type reward items exist (prevent套利)', async () => {
    const count = await prisma.rewardItem.count({
      where: { rewardType: 'points' }
    });
    if (count > 0) throw new Error(`Found ${count} points-type reward items`);
  });

  // ─── Task Chain Tests ─────────────────────────────────────
  console.log('\n📋 Task Chain Tests');
  console.log('─'.repeat(60));

  await test('task_chain_drafts table exists and has correct schema', async () => {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'task_chain_drafts'
      ORDER BY ordinal_position
    `;
    const columns = (result as any[]).map(r => r.column_name);
    const required = ['id', 'user_id', 'title', 'status', 'context'];
    for (const col of required) {
      if (!columns.includes(col)) {
        throw new Error(`Missing column: ${col}`);
      }
    }
  });

  await test('existing task chain data is accessible', async () => {
    const count = await prisma.taskChainDraft.count();
    console.log(`     (found ${count} task chain drafts)`);
  });

  // ─── Summary ──────────────────────────────────────────────
  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 DB Test Summary:`);
  console.log(`   ✅ Passed:  ${passed}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   📈 Total:   ${passed + failed}`);
  console.log(`   🎯 Rate:    ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('❌ DB TESTS FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ ALL DB TESTS PASSED\n');
    process.exit(0);
  }
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(2);
  })
  .finally(() => prisma.$disconnect());
