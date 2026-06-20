import { prisma } from '../src/lib/prisma';

async function main() {
  const rules = await prisma.rewardRule.findMany({
    where: { trigger: 'INVITE_REGISTER_SUCCESS' },
    orderBy: { createdAt: 'asc' }
  });
  
  console.log('=== 默认奖励规则 ===');
  console.log(`共 ${rules.length} 条规则:\n`);
  
  rules.forEach((r: any) => {
    console.log(`- ${r.name}`);
    console.log(`  类型: ${r.rewardType}, 数值: ${r.rewardValue}`);
    console.log(`  状态: ${r.enabled ? '✅ 启用' : '⏸️ 禁用'}`);
    console.log(`  每邀请人上限: ${r.maxRewardsPerInviter || '无限制'}`);
    console.log(`  ID: ${r.id}\n`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
