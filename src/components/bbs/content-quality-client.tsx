"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  Filter,
  CheckCircle2,
  Info,
  TrendingUp,
  Link2Off,
  Copy,
  MessageSquareOff,
  PinOff,
  FileEdit,
  Sparkles,
} from "lucide-react";
import type {
  QualityIssue,
  QualityIssueType,
  Severity,
} from "@/lib/community/content-quality";

// ─── Types ────────────────────────────────────────────

interface ContentQualityClientProps {
  issues: QualityIssue[];
  summary: {
    totalIssues: number;
    byType: Record<QualityIssueType, number>;
    bySeverity: Record<Severity, number>;
    postsInspected: number;
  };
}

// ─── Constants ────────────────────────────────────────

const TYPE_LABELS: Record<QualityIssueType, string> = {
  broken_link: "失效链接",
  expired_content: "过期内容",
  duplicate_topic: "重复主题",
  no_reply: "无回复内容",
  stale_pinned: "置顶过期",
  edit_suggestion: "编辑建议",
  feature_candidate: "精华候选",
};

const TYPE_ICONS: Record<QualityIssueType, typeof AlertTriangle> = {
  broken_link: Link2Off,
  expired_content: AlertTriangle,
  duplicate_topic: Copy,
  no_reply: MessageSquareOff,
  stale_pinned: PinOff,
  edit_suggestion: FileEdit,
  feature_candidate: Sparkles,
};

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", label: "严重" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", label: "警告" },
  info: { bg: "bg-blue-50", text: "text-blue-700", label: "提示" },
  opportunity: { bg: "bg-green-50", text: "text-green-700", label: "机会" },
};

const PRIORITY_ORDER: QualityIssueType[] = [
  "broken_link",
  "expired_content",
  "duplicate_topic",
  "no_reply",
  "stale_pinned",
  "edit_suggestion",
  "feature_candidate",
];

// ─── Component ────────────────────────────────────────

export function ContentQualityClient({
  issues,
  summary,
}: ContentQualityClientProps) {
  const [filterType, setTypeFilter] = useState<QualityIssueType | "all">("all");
  const [filterSeverity, setSeverityFilter] = useState<Severity | "all">("all");

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      if (filterType !== "all" && issue.type !== filterType) return false;
      if (filterSeverity !== "all" && issue.severity !== filterSeverity)
        return false;
      return true;
    });
  }, [issues, filterType, filterSeverity]);

  // Sort by priority order, then by severity
  const sorted = useMemo(() => {
    const severityRank: Record<Severity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
      opportunity: 3,
    };
    return [...filtered].sort((a, b) => {
      const pa = PRIORITY_ORDER.indexOf(a.type);
      const pb = PRIORITY_ORDER.indexOf(b.type);
      if (pa !== pb) return pa - pb;
      return severityRank[a.severity] - severityRank[b.severity];
    });
  }, [filtered]);

  const activeTypes = PRIORITY_ORDER.filter(
    (t) => summary.byType[t] > 0
  );
  const activeSeverities = (["critical", "warning", "info", "opportunity"] as Severity[]).filter(
    (s) => summary.bySeverity[s] > 0
  );

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-0.5">总问题数</div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.totalIssues}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-0.5">严重</div>
          <div className="text-3xl font-bold text-red-600">
            {summary.bySeverity.critical}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-0.5">警告</div>
          <div className="text-3xl font-bold text-amber-600">
            {summary.bySeverity.warning}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-0.5">巡检帖子数</div>
          <div className="text-3xl font-bold text-blue-600">
            {summary.postsInspected}
          </div>
        </div>
      </div>

      {/* Type distribution */}
      {activeTypes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">检查类型分布</h3>
          <div className="flex flex-wrap gap-2">
            {activeTypes.map((type) => {
              const Icon = TYPE_ICONS[type];
              return (
                <div
                  key={type}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{TYPE_LABELS[type]}</span>
                  <span className="font-bold text-gray-900">
                    {summary.byType[type]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-900">筛选</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-brand text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            全部类型
          </button>
          {activeTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? "bg-brand text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {TYPE_LABELS[type]} ({summary.byType[type]})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Severity filter */}
          <button
            onClick={() => setSeverityFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterSeverity === "all"
                ? "bg-brand text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            全部严重度
          </button>
          {activeSeverities.map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === sev
                  ? "bg-brand text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {SEVERITY_STYLES[sev].label} ({summary.bySeverity[sev]})
            </button>
          ))}
        </div>
      </div>

      {/* Issue list */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-base font-medium text-gray-900 mb-1">
            {issues.length === 0
              ? "未发现内容质量问题"
              : "当前筛选条件下无匹配结果"}
          </p>
          <p className="text-sm text-gray-500">
            {issues.length === 0
              ? "所有已发布帖子状态良好"
              : "尝试调整筛选条件查看更多结果"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((issue, idx) => {
            const Icon = TYPE_ICONS[issue.type];
            const sevStyle = SEVERITY_STYLES[issue.severity];
            return (
              <div
                key={`${issue.type}-${issue.postId}-${idx}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-lg ${sevStyle.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${sevStyle.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sevStyle.bg} ${sevStyle.text}`}>
                        {sevStyle.label}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {TYPE_LABELS[issue.type]}
                      </span>
                      {issue.category && (
                        <span className="text-xs text-gray-400">
                          {issue.category}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                      {issue.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {issue.description}
                    </p>
                    {issue.actionUrl && (
                      <Link
                        href={issue.actionUrl}
                        className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-dark font-medium"
                      >
                        {issue.actionLabel}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read-only notice */}
      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">只读巡检模式</p>
            <p>
              本页面仅展示内容质量问题和建议，不会自动删除、编辑、取消置顶或加精任何内容。
              所有操作需管理员手动在对应帖子页面执行。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
