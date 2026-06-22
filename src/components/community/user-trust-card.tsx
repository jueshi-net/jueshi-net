"use client";

import {
  Shield,
  Star,
  Award,
  TrendingUp,
  Calendar,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Flag,
} from "lucide-react";

export interface TrustCardData {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    membershipTier: string;
    growthValue: number;
    levelKey: string | null;
    honorScore: number;
    points: number;
    createdAt: string;
  };
  profile: {
    displayName: string | null;
    bio: string | null;
    locationText: string | null;
    publicTitle: string | null;
    isPublic: boolean;
    joinedAtDisplayMode?: string;
  } | null;
  stat: {
    postCount: number;
    commentCount: number;
    acceptedAnswerCount: number;
    featuredPostCount: number;
    helpfulVoteCount: number;
    reportAcceptedCount: number;
    violationCount: number;
  };
  badges: Array<{
    key: string;
    name: string;
    iconText: string;
    color: string;
    category: string;
    awardedAt: string;
  }>;
  level: {
    name: string;
    iconText: string;
    color: string;
    minGrowth: number;
  };
}

const COLOR_MAP: Record<string, string> = {
  "green-500": "bg-green-100 text-green-700 border-green-200",
  "teal-500": "bg-teal-100 text-teal-700 border-teal-200",
  "blue-500": "bg-blue-100 text-blue-700 border-blue-200",
  "amber-500": "bg-amber-100 text-amber-700 border-amber-200",
  "amber-600": "bg-amber-100 text-amber-800 border-amber-300",
  "purple-500": "bg-purple-100 text-purple-700 border-purple-200",
  "purple-600": "bg-purple-100 text-purple-800 border-purple-300",
  "rose-500": "bg-rose-100 text-rose-700 border-rose-200",
  "indigo-500": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "cyan-500": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "orange-500": "bg-orange-100 text-orange-700 border-orange-200",
  "emerald-500": "bg-emerald-100 text-emerald-700 border-emerald-200",
  gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent",
};

function getColorClass(color: string): string {
  return COLOR_MAP[color] || "bg-gray-100 text-gray-700 border-gray-200";
}

function formatJoinDate(dateStr: string, mode: string = "date"): string {
  const date = new Date(dateStr);
  if (mode === "hidden") return "";
  if (mode === "year") return `${date.getFullYear()}年加入`;
  if (mode === "month") return `${date.getFullYear()}年${date.getMonth() + 1}月加入`;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日加入`;
}

function getDaysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 用户可信名片 — 展示注册时间、等级、荣誉值、勋章、社区统计
 * 不泄露邮箱、手机号、积分余额（除非本人查看）
 */
export function UserTrustCard({
  data,
  isOwnProfile = false,
  compact = false,
}: {
  data: TrustCardData;
  isOwnProfile?: boolean;
  compact?: boolean;
}) {
  const { user, profile, stat, badges, level } = data;
  const joinDateMode = profile?.joinedAtDisplayMode || "date";
  const joinDateText = formatJoinDate(user.createdAt, joinDateMode);
  const daysSince = getDaysSince(user.createdAt);
  const displayName = profile?.displayName || user.name || "匿名用户";
  const isAdmin = user.role === "admin";
  const isMember = user.membershipTier !== "free";
  const topBadges = badges.slice(0, compact ? 4 : 8);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white ${compact ? "p-3" : "p-5"} space-y-3`}>
      {/* Header: avatar + name + title */}
      <div className="flex items-start gap-3">
        {user.image ? (
          <img
            src={user.image}
            alt={displayName}
            className={`${compact ? "w-10 h-10" : "w-14 h-14"} rounded-full object-cover border-2 border-gray-100`}
          />
        ) : (
          <div className={`${compact ? "w-10 h-10" : "w-14 h-14"} rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold ${compact ? "text-sm" : "text-lg"}`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold ${compact ? "text-sm" : "text-base"} text-gray-900 truncate`}>
              {displayName}
            </span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                <Shield className="w-3 h-3" />
                管理员
              </span>
            )}
            {isMember && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                <Star className="w-3 h-3" />
                {user.membershipTier === "premium" ? "高级会员" : "会员"}
              </span>
            )}
          </div>
          {profile?.publicTitle && (
            <p className="text-sm text-gray-500 truncate">{profile.publicTitle}</p>
          )}
          {profile?.locationText && (
            <p className="text-xs text-gray-400">📍 {profile.locationText}</p>
          )}
        </div>
      </div>

      {/* Level + Honor + Growth */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getColorClass(level.color)}`}>
          <span>{level.iconText}</span>
          {level.name}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Award className="w-3 h-3" />
          荣誉 {user.honorScore}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <TrendingUp className="w-3 h-3" />
          成长 {user.growthValue}
        </span>
      </div>

      {/* Join date */}
      {joinDateText && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {joinDateText}
          {daysSince > 0 && <span className="text-gray-300">·</span>}
          {daysSince > 0 && <span>已加入 {daysSince} 天</span>}
        </div>
      )}

      {/* Bio (non-compact only) */}
      {!compact && profile?.bio && (
        <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
      )}

      {/* Community stats */}
      {!compact && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
          <StatItem icon={<MessageSquare className="w-3.5 h-3.5" />} value={stat.postCount} label="发帖" />
          <StatItem icon={<MessageSquare className="w-3.5 h-3.5" />} value={stat.commentCount} label="回复" />
          <StatItem icon={<CheckCircle2 className="w-3.5 h-3.5" />} value={stat.acceptedAnswerCount} label="被采纳" />
          <StatItem icon={<ThumbsUp className="w-3.5 h-3.5" />} value={stat.helpfulVoteCount} label="有用" />
        </div>
      )}

      {/* Badges */}
      {topBadges.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {topBadges.map((badge) => (
            <span
              key={badge.key}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs border ${getColorClass(badge.color)}`}
              title={badge.name}
            >
              <span>{badge.iconText}</span>
              {!compact && <span>{badge.name}</span>}
            </span>
          ))}
          {badges.length > topBadges.length && (
            <span className="text-xs text-gray-400">+{badges.length - topBadges.length}</span>
          )}
        </div>
      )}

      {/* Own profile: show points (not public) */}
      {isOwnProfile && (
        <div className="pt-2 border-t border-gray-100 text-xs text-gray-400">
          积分余额：{user.points}（仅自己可见）
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-1 text-gray-400">{icon}</div>
      <span className="text-sm font-semibold text-gray-700">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

/**
 * 紧凑版作者卡（用于帖子列表、评论旁）
 */
export function UserTrustCardCompact({ data }: { data: TrustCardData }) {
  return <UserTrustCard data={data} compact />;
}
