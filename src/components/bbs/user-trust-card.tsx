import Link from "next/link";
import { Award, TrendingUp, FileText, MessageCircle, ThumbsUp } from "lucide-react";

interface UserTrustCardProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    honorScore: number | null;
    growthValue: number | null;
    levelKey: string | null;
    membershipTier: string | null;
    createdAt: Date;
    _count?: {
      forumPosts: number;
      forumComments: number;
    };
  };
  stats?: {
    postCount: number;
    commentCount: number;
    likeReceived: number;
  };
  variant?: "full" | "compact";
}

function getLevelLabel(levelKey: string | null): string {
  const levels: Record<string, string> = {
    "level_1": "新手",
    "level_2": "初级",
    "level_3": "中级",
    "level_4": "高级",
    "level_5": "专家",
  };
  return levels[levelKey || ""] || "社区成员";
}

function getLevelColor(levelKey: string | null): string {
  const colors: Record<string, string> = {
    "level_1": "bg-gray-50 text-gray-600 border-gray-200",
    "level_2": "bg-blue-50 text-blue-600 border-blue-200",
    "level_3": "bg-green-50 text-green-600 border-green-200",
    "level_4": "bg-purple-50 text-purple-600 border-purple-200",
    "level_5": "bg-amber-50 text-amber-600 border-amber-200",
  };
  return colors[levelKey || ""] || "bg-gray-50 text-gray-600 border-gray-200";
}

export function UserTrustCard({ user, stats, variant = "full" }: UserTrustCardProps) {
  const displayName = user.name || "匿名用户";
  const initial = displayName.charAt(0).toUpperCase();
  const levelLabel = getLevelLabel(user.levelKey);
  const levelColor = getLevelColor(user.levelKey);
  
  const postCount = stats?.postCount ?? user._count?.forumPosts ?? 0;
  const commentCount = stats?.commentCount ?? user._count?.forumComments ?? 0;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{displayName}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${levelColor}`}>
              {levelLabel}
            </span>
          </div>
          {user.honorScore && user.honorScore > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Award className="w-3 h-3" />
              荣誉 {user.honorScore}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center text-xl font-bold text-brand shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/u/${user.id}`}
              className="font-bold text-gray-900 hover:text-brand truncate"
            >
              {displayName}
            </Link>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${levelColor}`}>
              {levelLabel}
            </span>
            {user.membershipTier && user.membershipTier !== "free" && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {user.membershipTier === "pro" ? "Pro" : user.membershipTier}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            {user.honorScore != null && user.honorScore > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Award className="w-3 h-3" />
                荣誉 {user.honorScore}
              </span>
            )}
            {user.growthValue != null && user.growthValue > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                成长 {user.growthValue}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center bg-gray-50 rounded-lg py-2">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <FileText className="w-3 h-3 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{postCount}</span>
          </div>
          <span className="text-xs text-gray-500">帖子</span>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-2">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{commentCount}</span>
          </div>
          <span className="text-xs text-gray-500">评论</span>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-2">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <ThumbsUp className="w-3 h-3 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{stats?.likeReceived ?? 0}</span>
          </div>
          <span className="text-xs text-gray-500">获赞</span>
        </div>
      </div>

      {/* Joined date */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        加入于 {user.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
      </p>
    </div>
  );
}
