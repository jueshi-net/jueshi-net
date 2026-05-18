"use client";
import { useState, useEffect } from "react";
import { Star, Award, ArrowUpRight, Loader2, Crown, TrendingUp } from "lucide-react";
import { GROWTH_TYPE_LABELS } from "@/lib/growth-type-labels";

interface GrowthLog {
  id: string;
  type: string;
  value: number;
  reason: string | null;
  createdAt: string;
}

interface MembershipData {
  growthValue: number;
  levelKey: string;
  level: { key: string; name: string; minGrowth: number; maxGrowth: number | null; iconText: string; color: string; benefits: any } | null;
  badges: { id: string; key: string; name: string; iconText: string; color: string; category: string; description: string | null; awardedAt: string; reason: string | null }[];
  nextLevel: { key: string; name: string; minGrowth: number; iconText: string; color: string } | null;
}

export default function MembershipCard() {
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me/membership")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) setData(d.data); })
      .finally(() => setLoading(false));

    // Fetch recent growth logs
    setLogsLoading(true);
    fetch("/api/me/growth-logs")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) setGrowthLogs(d.logs || []); })
      .finally(() => setLogsLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse bg-white rounded-xl border p-4 h-32" />;
  if (!data) return null;

  const progress = data.nextLevel
    ? Math.min(((data.growthValue - (data.level?.minGrowth || 0)) / (data.nextLevel.minGrowth - (data.level?.minGrowth || 0))) * 100, 100)
    : 100;
  const remaining = data.nextLevel ? data.nextLevel.minGrowth - data.growthValue : 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-teal-50 rounded-xl border border-amber-200 p-5">
      {/* Level */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{data.level?.iconText || "⭐"}</div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{data.level?.name || "Lv.1 新手"}</div>
          <div className="text-xs text-gray-500">成长值 {data.growthValue}</div>
        </div>
        {data.nextLevel && (
          <div className="text-right text-xs text-gray-500">
            <div>距离 {data.nextLevel.iconText} {data.nextLevel.name}</div>
            <div className="font-medium text-amber-600">还需 {remaining} 成长值</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-teal-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Badges */}
      {data.badges.length > 0 ? (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" /> 已获得勋章 ({data.badges.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {data.badges.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border shadow-sm" title={b.description || b.name}>
                <span className="text-base">{b.iconText}</span>
                <span className="text-xs text-gray-700 font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-xs text-gray-500">
          <Award className="w-4 h-4 mx-auto mb-1 text-gray-300" />
          <p>继续签到、点评、收藏可获得勋章</p>
        </div>
      )}

      {/* 最近成长记录 */}
      <div className="mt-4 pt-4 border-t border-amber-200/50">
        <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> 最近成长记录
        </div>
        {logsLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-white rounded-lg border" />
            ))}
          </div>
        ) : growthLogs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">暂无成长记录，快去签到吧</p>
        ) : (
          <div className="space-y-1.5">
            {growthLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-1.5 px-2 bg-white rounded-lg border text-xs">
                <span className="text-gray-700">{GROWTH_TYPE_LABELS[log.type] || log.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}
                  </span>
                  <span className={`font-semibold ${log.value >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {log.value >= 0 ? "+" : ""}{log.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
