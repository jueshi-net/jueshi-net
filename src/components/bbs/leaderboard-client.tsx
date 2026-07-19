"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trophy, TrendingUp, Award, MessageCircle, Crown } from "lucide-react";
import UserIdentityCard from "@/components/user/UserIdentityCard";
import { toUserDisplayData } from "@/lib/community/user-display";

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar: string | null;
  levelKey: string | null;
  score: number;
  rank: number;
}

type LeaderboardType = "active" | "honor" | "growth" | "answers";
type Period = "week" | "month";

const TYPE_CONFIG: Record<LeaderboardType, { label: string; icon: typeof Trophy; unit: string }> = {
  active: { label: "活跃作者", icon: TrendingUp, unit: "篇" },
  honor: { label: "贡献榜", icon: Award, unit: "荣誉" },
  growth: { label: "成长榜", icon: Trophy, unit: "成长值" },
  answers: { label: "热心解答", icon: MessageCircle, unit: "采纳" },
};

function getRankStyle(rank: number): string {
  if (rank === 1) return "bg-amber-50 border-amber-200";
  if (rank === 2) return "bg-slate-50 border-slate-200";
  if (rank === 3) return "bg-orange-50 border-orange-200";
  return "bg-white border-gray-200";
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
  return null;
}

export function LeaderboardClient() {
  const [type, setType] = useState<LeaderboardType>("active");
  const [period, setPeriod] = useState<Period>("week");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/forum/leaderboard?type=${type}&period=${period}&limit=20`
      );
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (e) {
      setError("加载排行榜失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [type, period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const currentConfig = TYPE_CONFIG[type];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="space-y-6">
      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TYPE_CONFIG) as LeaderboardType[]).map((t) => {
          const config = TYPE_CONFIG[t];
          const Icon = config.icon;
          const isActive = type === t;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand text-white"
                  : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Period tabs (hidden for answers - it's cumulative) */}
      {type !== "answers" && (
        <div className="flex gap-2">
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                period === p
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p === "week" ? "本周" : "本月"}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="text-sm text-brand hover:underline"
            >
              重试
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">暂无排行数据</p>
            <p className="text-xs text-slate-400 mt-1">
              参与发帖、评论、回答问题即可上榜
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-4 py-3 border-l-4 ${
                  getRankStyle(entry.rank).split(" ")[1]
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10 shrink-0">
                  {getRankIcon(entry.rank) || (
                    <span className="text-lg font-bold text-slate-400">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* User identity */}
                <Link href={`/u/${entry.userId}`} className="flex-1 min-w-0">
                  <UserIdentityCard
                    user={toUserDisplayData({
                      name: entry.displayName,
                      image: entry.avatar,
                      levelKey: entry.levelKey,
                    })}
                    size="sm"
                  />
                </Link>

                {/* Score */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <CurrentIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-gray-900">
                    {entry.score}
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentConfig.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer notice */}
      <div className="text-center">
        <p className="text-xs text-slate-400">
          排行榜基于社区活动数据实时聚合，每小时更新。仅展示脱敏昵称，不泄露用户隐私。
        </p>
      </div>
    </div>
  );
}
