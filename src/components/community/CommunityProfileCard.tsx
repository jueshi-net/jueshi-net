import Link from "next/link";
import {
  Flame,
  CheckCircle2,
  Circle,
  ChevronRight,
} from "lucide-react";
import { CheckinButton } from "./CheckinButton";
import UserIdentityCard, { type UserDisplayData } from "@/components/user/UserIdentityCard";

// ─── Types ──────────────────────────────────────────────

export interface ProfileBadge {
  key: string;
  name: string;
  iconText: string;
  color: string;
}

export interface ProfileTask {
  key: string;
  title: string;
  completed: boolean;
  rewardGrowth: number;
}

export interface CommunityProfileCardProps {
  // Identity
  displayName: string;
  avatarUrl?: string;
  levelKey: string;
  levelLabel: string;
  levelIcon: string;
  levelColor: string;
  publicTitle?: string | null;
  isAdmin: boolean;
  isMember: boolean;
  membershipTier: string;
  points: number;

  // Growth
  growthValue: number;
  growthMin: number;
  growthMax: number;
  growthProgress: number;
  remainingToNext?: number;
  nextLevelName?: string | null;
  isMaxLevel: boolean;

  // Checkin (own profile only)
  isOwnProfile: boolean;
  checkinStreak: number;
  hasCheckedInToday: boolean;

  // Tasks (own profile only)
  todayTasks: ProfileTask[];

  // Badges
  badges: ProfileBadge[];

  // Honor
  honorScore: number;
}

// ─── Component ──────────────────────────────────────────

/**
 * CommunityProfileCard — 社区场景组合容器
 * 
 * 身份展示部分委托给 UserIdentityCard（全站唯一身份组件）。
 * 本组件只负责社区专属内容：签到、今日任务、勋章。
 */
export function CommunityProfileCard({
  displayName,
  avatarUrl,
  levelKey,
  levelLabel,
  levelIcon,
  publicTitle,
  isAdmin,
  isMember,
  membershipTier,
  points,
  growthValue,
  growthProgress,
  remainingToNext,
  nextLevelName,
  isMaxLevel,
  isOwnProfile,
  checkinStreak,
  hasCheckedInToday,
  todayTasks,
  badges,
  honorScore,
}: CommunityProfileCardProps) {
  const completedTaskCount = todayTasks.filter((t) => t.completed).length;

  // Build UserDisplayData for UserIdentityCard
  const userDisplayData: UserDisplayData = {
    displayName,
    avatarUrl,
    publicTitle,
    levelKey,
    levelLabel,
    levelIcon,
    growthValue,
    progressToNext: growthProgress,
    remainingToNext,
    nextLevelKey: isMaxLevel ? null : (nextLevelName || null),
    points,
    checkinStreak,
    badgeCount: badges.length,
    isMember,
    membershipTier,
    isAdmin,
    honorScore,
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── A. Identity (delegated to UserIdentityCard) ── */}
      <div className="p-4">
        <UserIdentityCard
          user={userDisplayData}
          size="md"
          showProgress={true}
          showStats={isOwnProfile}
          showHonor={true}
          showMembership={true}
          showPublicTitle={true}
        />
      </div>

      {/* ── B. Checkin Section (own profile only) ── */}
      {isOwnProfile && (
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${checkinStreak > 0 ? "text-orange-500" : "text-gray-300"}`} />
              <span className="text-xs font-medium text-gray-600">
                连续签到 <span className="font-bold text-gray-900">{checkinStreak}</span> 天
              </span>
            </div>
          </div>
          <CheckinButton hasCheckedInToday={hasCheckedInToday} initialStreak={checkinStreak} />
        </div>
      )}

      {/* ── C. Today's Tasks (own profile only) ── */}
      {isOwnProfile && todayTasks.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">今日任务</span>
            <span className="text-xs text-gray-400">
              <span className="font-bold text-[#6C5DD3]">{completedTaskCount}</span>
              /{todayTasks.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {todayTasks.slice(0, 4).map((task) => (
              <div key={task.key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-xs truncate ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                    {task.title}
                  </span>
                </div>
                {task.rewardGrowth > 0 && (
                  <span className={`text-[10px] flex-shrink-0 ml-2 ${task.completed ? "text-gray-300" : "text-[#6C5DD3]"}`}>
                    +{task.rewardGrowth}
                  </span>
                )}
              </div>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-0.5 mt-2 text-[11px] text-gray-400 hover:text-[#6C5DD3] transition-colors"
          >
            查看全部任务
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── D. Badge Strip ── */}
      {badges.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">勋章</span>
            <span className="text-xs text-gray-400">{badges.length} 枚</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {badges.slice(0, 7).map((badge) => (
              <span
                key={badge.key}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm border bg-gray-50 hover:bg-gray-100 transition-colors"
                title={badge.name}
              >
                {badge.iconText}
              </span>
            ))}
            {badges.length > 7 && (
              <Link
                href="#badges"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium border bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500"
              >
                +{badges.length - 7}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
