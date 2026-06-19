/**
 * v1.20.42.13.1: 幂等创建默认奖励规则
 * 
 * 用法: cd /home/deploy/xixiong-saas && npx tsx scripts/seed-default-reward-rules.ts
 * 
 * 安全特性:
 * - 幂等：已存在不重复创建
 * - 只创建，不修改已有规则
 * - 不输出 secret
 * - 不修改 9833416@qq.com
 */

import { prisma } from '../src/lib/prisma';

const DEFAULT_RULES = [
  {
    name: '邀请成功送 3 天会员',
    trigger: 'INVITE_REGISTER_SUCCESS',
    rewardType: 'MEMBER_DAYS',
    rewardValue: 3,
    enabled: true,
    maxRewardsPerInviter: 50,
    maxRewardsTotal: null,
  },
  {
    name: '邀请成功送 50 积分',
    trigger: 'INVITE_REGISTER_SUCCESS',
    rewardType: 'POINTS',
    rewardValue: 50,
    enabled: false,
    maxRewardsPerInviter: null,
    maxRewardsTotal: null,
  },
  {
    name: '邀请成功送 10 成长值',
    trigger: 'INVITE_REGISTER_SUCCESS',
    rewardType: 'GROWTH',
    rewardValue: 10,
    enabled: false,
    maxRewardsPerInviter: null,
    maxRewardsTotal: null,
  },
  {
    name: '邀请成功送 3 天广告权益',
    trigger: 'INVITE_REGISTER_SUCCESS',
    rewardType: 'AD_SLOT_DAYS',
    rewardValue: 3,
    enabled: false,
    maxRewardsPerInviter: null,
    maxRewardsTotal: null,
  },
];

async function main() {
  console.log('🌱 开始创建默认奖励规则...\n');

  const existingRules = await prisma.rewardRule.findMany({
    where: { trigger: 'INVITE_REGISTER_SUCCESS' },
  });

  console.log(`📊 当前已有 ${existingRules.length} 条邀请注册成功奖励规则\n`);

  if (existingRules.length > 0) {
    console.log('现有规则:');
    existingRules.forEach((r: { name: string; rewardType: string; rewardValue: number; enabled: boolean; id: string }) => {
      console.log(`  - ${r.name} (${r.rewardType}: ${r.rewardValue}) [${r.enabled ? '启用' : '禁用'}]`);
    });
    console.log('');
  }

  let created = 0;
  let skipped = 0;

  for (const rule of DEFAULT_RULES) {
    const exists = existingRules.find(
      (r: { trigger: string; rewardType: string }) => r.trigger === rule.trigger && r.rewardType === rule.rewardType
    );

    if (exists) {
      console.log(`⏭️  跳过: "${rule.name}" (已存在 ID: ${exists.id})`);
      skipped++;
      continue;
    }

    const newRule = await prisma.rewardRule.create({
      data: {
        name: rule.name,
        trigger: rule.trigger,
        rewardType: rule.rewardType,
        rewardValue: rule.rewardValue,
        enabled: rule.enabled,
        maxRewardsPerInviter: rule.maxRewardsPerInviter,
        maxRewardsTotal: rule.maxRewardsTotal,
      },
    });

    console.log(`✅ 创建: "${rule.name}" (ID: ${newRule.id})`);
    created++;
  }

  console.log(`\n📋 结果: 创建 ${created} 条, 跳过 ${skipped} 条`);
  console.log('🎉 默认奖励规则 seed 完成!');
}

main()
  .catch((e) => {
    console.error('❌ Seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
