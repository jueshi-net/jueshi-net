import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== P0 Account & Permission Verification ===\n');

  // 1. Check admin account
  const admin = await prisma.user.findUnique({
    where: { email: '9833416@qq.com' },
    select: { email: true, role: true, memberUntil: true }
  });
  console.log('1. Admin account (9833416@qq.com):');
  console.log('   Email:', admin?.email);
  console.log('   Role:', admin?.role);
  console.log('   Expected: role=admin');
  console.log('   Status:', admin?.role === 'admin' ? '✅ PASS' : '❌ FAIL');

  // 2. Role distribution
  const roleDistribution = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true }
  });
  console.log('\n2. Role distribution:');
  roleDistribution.forEach(r => {
    console.log(`   ${r.role}: ${r._count.role} users`);
  });

  // 3. Check for role=member (should be 0)
  const memberRoleUsers = await prisma.user.findMany({
    where: { role: 'member' },
    select: { email: true, role: true }
  });
  console.log('\n3. Users with role=member:', memberRoleUsers.length);
  console.log('   Expected: 0');
  console.log('   Status:', memberRoleUsers.length === 0 ? '✅ PASS' : '❌ FAIL');
  if (memberRoleUsers.length > 0) {
    console.log('   Details:', memberRoleUsers.map(u => u.email).join(', '));
  }

  // 4. Check reward items status
  const rewardItems = await prisma.rewardItem.findMany({
    select: { code: true, name: true, enabled: true, description: true, rewardType: true }
  });
  console.log('\n4. Reward items status:');
  rewardItems.forEach(item => {
    console.log(`   ${item.code} (${item.name}): enabled=${item.enabled}, type=${item.rewardType}`);
  });

  // 5. Check ad_slot_7day is disabled
  const adSlot7day = await prisma.rewardItem.findFirst({
    where: { code: 'ad_slot_7day' },
    select: { code: true, enabled: true, description: true }
  });
  console.log('\n5. ad_slot_7day:');
  console.log('   Enabled:', adSlot7day?.enabled);
  console.log('   Description:', adSlot7day?.description);
  console.log('   Expected: enabled=false');
  console.log('   Status check:', adSlot7day?.enabled === false ? '✅ PASS' : '❌ FAIL');

  // 6. Check member_trial (all member_trial types should be enabled)
  const memberTrials = await prisma.rewardItem.findMany({
    where: { rewardType: 'member_trial' },
    select: { code: true, enabled: true }
  });
  console.log('\n6. member_trial items:');
  memberTrials.forEach(item => {
    console.log(`   ${item.code}: enabled=${item.enabled}`);
  });
  const allMemberTrialsEnabled = memberTrials.every(item => item.enabled === true);
  console.log('   Expected: all enabled=true');
  console.log('   Status check:', allMemberTrialsEnabled ? '✅ PASS' : '❌ FAIL');

  // 7. Check growth_50
  const growth50 = await prisma.rewardItem.findFirst({
    where: { code: 'growth_50' },
    select: { code: true, enabled: true, description: true }
  });
  console.log('\n7. growth_50:');
  console.log('   Enabled:', growth50?.enabled);
  console.log('   Description:', growth50?.description);
  console.log('   Expected: enabled=true (partial/weak benefit)');
  console.log('   Status check:', growth50?.enabled === true ? '✅ PASS' : '❌ FAIL');

  // 8. Check word_export_coupon (all should be disabled)
  const wordExportCoupons = await prisma.rewardItem.findMany({
    where: { rewardType: 'word_export_coupon' },
    select: { code: true, enabled: true }
  });
  console.log('\n8. word_export_coupon items:');
  wordExportCoupons.forEach(item => {
    console.log(`   ${item.code}: enabled=${item.enabled}`);
  });
  const allWordExportDisabled = wordExportCoupons.every(item => item.enabled === false);
  console.log('   Expected: all enabled=false');
  console.log('   Status check:', allWordExportDisabled ? '✅ PASS' : '❌ FAIL');

  // 9. Check no_branding_coupon (all should be disabled)
  const noBrandingCoupons = await prisma.rewardItem.findMany({
    where: { rewardType: 'no_branding_coupon' },
    select: { code: true, enabled: true }
  });
  console.log('\n9. no_branding_coupon items:');
  noBrandingCoupons.forEach(item => {
    console.log(`   ${item.code}: enabled=${item.enabled}`);
  });
  const allNoBrandingDisabled = noBrandingCoupons.every(item => item.enabled === false);
  console.log('   Expected: all enabled=false');
  console.log('   Status check:', allNoBrandingDisabled ? '✅ PASS' : '❌ FAIL');

  await prisma.$disconnect();
  console.log('\n=== P0 Verification Complete ===');
}

main().catch(console.error);
