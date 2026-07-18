"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, Users, MessageCircle, Flag, FileText, AlertTriangle, TrendingUp } from "lucide-react";

interface HealthMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  note: string;
  period: string;
}

const METRIC_ICONS: Record<string, typeof Activity> = {
  approvalRate: TrendingUp,
  rejectionRate: AlertTriangle,
  reportProcessingRate: Flag,
  avgReviewTime: Clock,
  todayActiveAuthors: Users,
  unrepliedPosts: MessageCircle,
  longPendingReports: AlertTriangle,
  draftSubmitRatio: FileText,
};

const METRIC_COLORS: Record<string, string> = {
  approvalRate: "text-green-600",
  rejectionRate: "text-red-600",
  reportProcessingRate: "text-blue-600",
  avgReviewTime: "text-amber-600",
  todayActiveAuthors: "text-brand",
  unrepliedPosts: "text-orange-600",
  longPendingReports: "text-red-600",
  draftSubmitRatio: "text-purple-600",
};

const METRIC_BG: Record<string, string> = {
  approvalRate: "bg-green-50",
  rejectionRate: "bg-red-50",
  reportProcessingRate: "bg-blue-50",
  avgReviewTime: "bg-amber-50",
  todayActiveAuthors: "bg-brand/5",
  unrepliedPosts: "bg-orange-50",
  longPendingReports: "bg-red-50",
  draftSubmitRatio: "bg-purple-50",
};

export function CommunityHealthMetrics() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHealth() {
      try {
        const res = await fetch("/api/forum/admin/health");
        if (!res.ok) {
          setError("加载失败");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setMetrics(data.metrics || []);
        }
      } catch {
        if (!cancelled) setError("网络错误");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-gray-400 animate-pulse" />
          <span className="text-sm font-bold text-gray-400">加载社区健康度...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-bold text-gray-900">社区健康度</h3>
        <span className="text-xs text-gray-400">指标为近似值，标注了统计口径</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {metrics.map((metric) => {
          const Icon = METRIC_ICONS[metric.key] || Activity;
          const color = METRIC_COLORS[metric.key] || "text-gray-600";
          const bg = METRIC_BG[metric.key] || "bg-gray-50";
          const isExpanded = expandedNote === metric.key;

          return (
            <div
              key={metric.key}
              className={`rounded-lg border border-gray-100 p-2.5 ${bg} cursor-pointer transition-all`}
              onClick={() => setExpandedNote(isExpanded ? null : metric.key)}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-[10px] text-gray-400">{metric.period}</span>
              </div>
              <div className={`text-lg font-bold ${color}`}>
                {metric.value}
                <span className="text-xs font-normal ml-0.5">{metric.unit}</span>
              </div>
              <div className="text-[11px] text-gray-600 leading-tight mt-0.5">{metric.label}</div>
              {isExpanded && (
                <p className="text-[10px] text-gray-400 mt-1.5 pt-1.5 border-t border-gray-200 leading-relaxed">
                  {metric.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] text-gray-400">
        点击指标查看统计口径说明
      </p>
    </div>
  );
}
