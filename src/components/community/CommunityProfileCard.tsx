import Link from "next/link";
import {
  Crown,
  Flame,
  TrendingUp,
  CheckCircle2,
  Circle,
  Award,
  ChevronRight,
} from "lucide-react";
import { CheckinButton } from "./CheckinButton";

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

// ─── Level color mapping ───────────────────────────────

const LEVEL_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  lv1: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  lv2: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  lv3: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  lv4: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  lv5: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
};

// ─── Component ──────────────────────────────────────────

export function CommunityProfileCard({
  displayName,
  avatarUrl,
  levelKey,
  levelLabel,
  levelIcon,
  levelColor,
  publicTitle,
  isAdmin,
  isMember,
  membershipTier,
  points,
  growthValue,
  growthMin,
  growthMax,
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
  const levelStyle = LEVEL_BADGE_STYLES[levelKey] || LEVEL_BADGE_STYLES.lv1;
  const completedTaskCount = todayTasks.filter((t) => t.completed).length;
  const membershipLabel =
    membershipTier === "premium" ? "高级会员" :
    membershipTier === "enterprise" ? "企业会员" :
    membershipTier === "member" ? "会员" : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── A. Identity Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center text-white font-semibold text-lg shadow-sm flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{displayName}</h1>
            {publicTitle && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{publicTitle}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {/* Level badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}>
                <span className="text-xs">{levelIcon}</span>
                {levelLabel}
              </span>
              {/* Member badge */}
              {isMember && membershipLabel && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  <Crown className="w-2.5 h-2.5" />
                  {membershipLabel}
                </span>
              )}
              {/* Admin badge */}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
                  管理员
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Points (own profile only) */}
        {isOwnProfile && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-400">积分余额</span>
            <span className="text-sm font-bold text-[#6C5DD3]">{points}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">荣誉值</span>
            <span className="text-sm font-bold text-amber-500">{honorScore}</span>
          </div>
        )}

        {/* Honor (public, for other users) */}
        {!isOwnProfile && honorScore > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-gray-500">荣誉值</span>
            <span className="text-sm font-bold text-amber-500">{honorScore}</span>
          </div>
        )}
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

      {/* ── C. Growth Progress ── */}
      <div className="px-5 py-3 border-t border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs font-medium text-gray-600">成长值</span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-gray-900">{growthValue}</span>
            {!isMaxLevel && (
              <span className="text-gray-400"> / {growthMax}</span>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(3, growthProgress)}%` }}
          />
        </div>
        {/* Progress text */}
        <p className="text-[11px] text-gray-400 mt-1.5">
          {isMaxLevel ? (
            "已达到最高等级"
          ) : nextLevelName ? (
            <>距 <span className="text-gray-600 font-medium">{nextLevelName}</span> 还需 {remainingToNext} 成长值</>
          ) : (
            `${growthProgress}%`
          )}
        </p>
      </div>

      {/* ── D. Today's Tasks (own profile only) ── */}
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

      {/* ── E. Badge Strip ── */}
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
