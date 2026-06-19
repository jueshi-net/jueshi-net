// v1.20.42.12.0: 邀请奖励发放逻辑
import { prisma } from '@/lib/prisma';

export interface RewardGrantResult {
  success: boolean;
  granted: number;
  failed: number;
  errors: string[];
}

/**
 * 发放邀请奖励
 * @param inviteRedemptionId 邀请关系 ID
 * @param inviterUserId 邀请人 ID
 * @param trigger 触发条件
 */
export async function grantInviteRewards(
  inviteRedemptionId: string,
  inviterUserId: string,
  trigger: string = 'INVITE_REGISTER_SUCCESS'
): Promise<RewardGrantResult> {
  const result: RewardGrantResult = {
    success: true,
    granted: 0,
    failed: 0,
    errors: [],
  };

  try {
    // 查询启用的奖励规则
    const rules = await prisma.rewardRule.findMany({
      where: {
        trigger,
        enabled: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: new Date() }, endsAt: null },
          { startsAt: null, endsAt: { gte: new Date() } },
          { startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
        ],
      },
    });

    if (rules.length === 0) {
      console.log('No reward rules found for trigger:', trigger);
      return result;
    }

    // 检查邀请人是否已达到奖励上限
    const inviterGrantCount = await prisma.rewardGrant.count({
      where: {
        userId: inviterUserId,
        inviteRedemptionId: { not: null },
        status: 'GRANTED',
      },
    });

    for (const rule of rules) {
      // 检查每个邀请人的奖励上限
      if (rule.maxRewardsPerInviter && inviterGrantCount >= rule.maxRewardsPerInviter) {
        result.errors.push(`Inviter reached max rewards for rule: ${rule.name}`);
        continue;
      }

      // 检查全局奖励上限
      if (rule.maxRewardsTotal) {
        const totalGrantCount = await prisma.rewardGrant.count({
          where: {
            rewardRuleId: rule.id,
            status: 'GRANTED',
          },
        });
        if (totalGrantCount >= rule.maxRewardsTotal) {
          result.errors.push(`Rule ${rule.name} reached total max rewards`);
          continue;
        }
      }

      // 检查幂等性：同一邀请关系只能发放同一规则一次
      const existingGrant = await prisma.rewardGrant.findUnique({
        where: {
          inviteRedemptionId_rewardRuleId: {
            inviteRedemptionId,
            rewardRuleId: rule.id,
          },
        },
      });

      if (existingGrant) {
        console.log(`Reward already granted for rule ${rule.name} on redemption ${inviteRedemptionId}`);
        continue;
      }

      // 创建奖励发放记录
      const grant = await prisma.rewardGrant.create({
        data: {
          userId: inviterUserId,
          inviteRedemptionId,
          rewardRuleId: rule.id,
          rewardType: rule.rewardType,
          rewardValue: rule.rewardValue,
          rewardMetadata: rule.rewardMetadata,
          status: 'PENDING',
        },
      });

      // 执行奖励发放
      try {
        await executeRewardGrant(grant.id, rule.rewardType, rule.rewardValue, inviterUserId);
        result.granted++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to grant ${rule.rewardType}: ${error}`);
        
        // 更新为失败状态
        await prisma.rewardGrant.update({
          where: { id: grant.id },
          data: {
            status: 'FAILED',
            failureReason: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    // 更新邀请关系状态
    if (result.granted > 0) {
      await prisma.inviteRedemption.update({
        where: { id: inviteRedemptionId },
        data: {
          status: 'REWARDED',
          rewardedAt: new Date(),
        },
      });
    }

    result.success = result.failed === 0;
  } catch (error) {
    result.success = false;
    result.errors.push(`Fatal error: ${error}`);
    console.error('grantInviteRewards error:', error);
  }

  return result;
}

/**
 * 执行具体的奖励发放
 */
async function executeRewardGrant(
  grantId: string,
  rewardType: string,
  rewardValue: number,
  userId: string
): Promise<void> {
  switch (rewardType) {
    case 'MEMBER_DAYS':
      await grantMemberDays(userId, rewardValue);
      break;
    case 'POINTS':
      await grantPoints(userId, rewardValue, grantId);
      break;
    case 'GROWTH':
      await grantGrowth(userId, rewardValue, grantId);
      break;
    case 'AD_SLOT_DAYS':
      // 广告位权益：只记录 RewardGrant，不实际投放广告
      console.log(`AD_SLOT_DAYS reward granted: ${rewardValue} days for user ${userId}`);
      break;
    case 'BADGE':
      // 勋章奖励：暂不实现，只记录
      console.log(`BADGE reward granted for user ${userId}`);
      break;
    case 'CUSTOM_ENTITLEMENT':
      // 自定义权益：只记录
      console.log(`CUSTOM_ENTITLEMENT reward granted for user ${userId}`);
      break;
    default:
      throw new Error(`Unknown reward type: ${rewardType}`);
  }

  // 更新为已发放状态
  await prisma.rewardGrant.update({
    where: { id: grantId },
    data: {
      status: 'GRANTED',
      grantedAt: new Date(),
    },
  });
}

/**
 * 发放会员天数
 */
async function grantMemberDays(userId: string, days: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { memberUntil: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  let newMemberUntil: Date;
  const now = new Date();

  if (user.memberUntil && user.memberUntil > now) {
    // 当前是会员且未过期：在现有到期时间上 +N 天
    newMemberUntil = new Date(user.memberUntil);
    newMemberUntil.setDate(newMemberUntil.getDate() + days);
  } else {
    // 当前非会员或已过期：从当前时间开始 +N 天
    newMemberUntil = new Date(now);
    newMemberUntil.setDate(newMemberUntil.getDate() + days);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      memberUntil: newMemberUntil,
      role: 'member', // 确保角色为 member
    },
  });

  console.log(`Granted ${days} member days to user ${userId}, new expiry: ${newMemberUntil}`);
}

/**
 * 发放积分
 */
async function grantPoints(userId: string, points: number, grantId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    }),
    prisma.pointLedger.create({
      data: {
        userId,
        type: 'invite_reward',
        points,
        reason: '邀请奖励',
        relatedId: grantId,
      },
    }),
  ]);

  console.log(`Granted ${points} points to user ${userId}`);
}

/**
 * 发放成长值
 */
async function grantGrowth(userId: string, growth: number, grantId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { growthValue: { increment: growth } },
    }),
    prisma.growthLog.create({
      data: {
        userId,
        type: 'invite_reward',
        value: growth,
        reason: '邀请奖励',
        refType: 'reward_grant',
        refId: grantId,
      },
    }),
  ]);

  console.log(`Granted ${growth} growth to user ${userId}`);
}
