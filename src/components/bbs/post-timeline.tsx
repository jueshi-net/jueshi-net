"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Eye, EyeOff, Pin, Lock, Star, FileEdit, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface TimelineEvent {
  type: string;
  label: string;
  timestamp: string;
  actor?: string;
  reason?: string | null;
  description: string;
}

interface PostTimelineProps {
  slug: string;
  canView?: boolean;
}

const EVENT_ICONS: Record<string, typeof Clock> = {
  created: FileEdit,
  approve: CheckCircle,
  reject: XCircle,
  hide: EyeOff,
  restore: Eye,
  pin: Pin,
  unpin: Pin,
  feature: Star,
  unfeature: Star,
  lock: Lock,
  unlock: Lock,
  edited: FileEdit,
  investigate_report: AlertCircle,
  resolve_report: CheckCircle,
  dismiss_report: XCircle,
};

const EVENT_COLORS: Record<string, string> = {
  created: "text-gray-500 bg-gray-50",
  approve: "text-green-600 bg-green-50",
  reject: "text-red-600 bg-red-50",
  hide: "text-orange-600 bg-orange-50",
  restore: "text-blue-600 bg-blue-50",
  pin: "text-purple-600 bg-purple-50",
  unpin: "text-gray-500 bg-gray-50",
  feature: "text-amber-600 bg-amber-50",
  unfeature: "text-gray-500 bg-gray-50",
  lock: "text-red-600 bg-red-50",
  unlock: "text-green-600 bg-green-50",
  edited: "text-blue-500 bg-blue-50",
  investigate_report: "text-blue-600 bg-blue-50",
  resolve_report: "text-green-600 bg-green-50",
  dismiss_report: "text-gray-500 bg-gray-50",
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PostTimeline({ slug, canView = false }: PostTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [limitation, setLimitation] = useState<string | null>(null);

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchTimeline() {
      try {
        const res = await fetch(`/api/forum/posts/${slug}/timeline`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("时间线不可用");
          } else {
            setError("加载失败");
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setEvents(data.events || []);
          setLimitation(data.limitation || null);
        }
      } catch {
        if (!cancelled) setError("网络错误");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTimeline();
    return () => {
      cancelled = true;
    };
  }, [slug, canView]);

  if (!canView) return null;
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4 animate-pulse" />
          加载时间线...
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

  const visibleEvents = expanded ? events : events.slice(-5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">状态时间线</h3>
        <span className="text-xs text-gray-400">({events.length} 条记录)</span>
      </div>

      <div className="space-y-2">
        {visibleEvents.map((event, idx) => {
          const Icon = EVENT_ICONS[event.type] || AlertCircle;
          const colorClass = EVENT_COLORS[event.type] || "text-gray-500 bg-gray-50";

          return (
            <div key={idx} className="flex items-start gap-2.5">
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${colorClass}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm font-medium text-gray-700">{event.label}</p>
                <p className="text-xs text-gray-400">{formatTime(event.timestamp)}</p>
                {event.actor && (
                  <p className="text-xs text-gray-400">操作人：{event.actor}</p>
                )}
                {event.reason && (
                  <p className="text-xs text-gray-500 mt-0.5 p-1.5 bg-gray-50 rounded">
                    {event.reason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-brand hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              查看全部 {events.length} 条记录
            </>
          )}
        </button>
      )}

      {limitation && (
        <p className="mt-3 text-xs text-gray-400 italic border-t border-gray-100 pt-2">
          {limitation}
        </p>
      )}
    </div>
  );
}
