"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ExternalLink, ArrowLeft, ChevronRight, AlertTriangle, Check, Lock } from "lucide-react";
import ToolReviewPanel from "@/components/tools/tool-review-panel";

interface ScenarioTool {
  name: string;
  url: string;
  category: string;
  scenario: string;
  targetUsers: string[];
  painPoint: string;
  description: string;
  freePlan: string;
  paidPlan: string;
  accessCN: "fast" | "slow" | "blocked" | "unknown";
  accessOverseas: "fast" | "slow" | "unknown";
  beginnerFriendly: boolean;
  recommended: boolean;
  tags: string[];
  sourceNote: string;
  toolKey?: string;
}

interface ToolGroup {
  groupName: string;
  tools: ScenarioTool[];
}

interface ScenarioPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  targetUsers: string;
  problemStatement: string;
  quickStart: { step: number; title: string; description: string }[];
  toolGroups: ToolGroup[];
  disclaimer?: string;
}

const ACCESS_LABELS: Record<string, string> = {
  fast: "✅ 可用",
  slow: "⚠️ 较慢",
  blocked: "🚫 不可用",
  unknown: "❓ 未知",
};

const ACCESS_COLORS: Record<string, string> = {
  fast: "text-green-600",
  slow: "text-amber-600",
  blocked: "text-red-600",
  unknown: "text-gray-400",
};

export default function ScenarioClient({ pkg, slug }: { pkg: ScenarioPackage; slug: string }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    fetch("/api/workbench/summary")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setIsLoggedIn(true);
          setFavorites(new Set(data.favorites.map((f: any) => f.toolKey)));
        } else {
          setIsLoggedIn(false);
        }
        setAuthChecked(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setAuthChecked(true);
      });
  }, []);

  const handleFavorite = async (toolKey: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login?callbackUrl=/starter/" + slug;
      return;
    }

    const isFav = favorites.has(toolKey);
    try {
      if (isFav) {
        await fetch(`/api/workbench/favorites/${encodeURIComponent(toolKey)}`, { method: "DELETE" });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(toolKey);
          return next;
        });
      } else {
        const res = await fetch("/api/workbench/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolKey }),
        });
        if (res.ok || res.status === 409) {
          setFavorites((prev) => new Set([...prev, toolKey]));
        }
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/starter" className="inline-flex items-center gap-1 text-blue-100 hover:text-white mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            返回场景列表
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{pkg.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold">{pkg.title}</h1>
              <p className="text-blue-100 text-lg mt-1">{pkg.subtitle}</p>
            </div>
          </div>
          <p className="text-blue-50 max-w-3xl text-base">{pkg.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
            <span>👥 适合：{pkg.targetUsers}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Problem Statement */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-2">💡 这个工具包能解决什么？</h2>
          <p className="text-gray-600">{pkg.problemStatement}</p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🚀 快速开始（3 步上手）</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pkg.quickStart.map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{s.step}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{s.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Groups */}
        {pkg.toolGroups.map((group, gi) => (
          <div key={gi} className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">📂</span>
              {group.groupName}
              <span className="text-sm text-gray-400 font-normal">({group.tools.length} 个工具)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.tools.map((tool, ti) => (
                <ToolCard
                  key={`${gi}-${ti}`}
                  tool={tool}
                  slug={slug}
                  isLoggedIn={isLoggedIn}
                  authChecked={authChecked}
                  isFavorited={tool.toolKey ? favorites.has(tool.toolKey) : false}
                  onFavorite={tool.toolKey ? () => handleFavorite(tool.toolKey!) : undefined}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        {pkg.disclaimer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800 text-sm">注意事项</div>
              <div className="text-sm text-amber-700 mt-1">{pkg.disclaimer}</div>
            </div>
          </div>
        )}

        {/* Source note */}
        <div className="text-center text-xs text-gray-400 py-4">
          工具信息由人工整理，价格、免费额度、访问速度等可能随时间变化。如有更新建议，欢迎反馈。
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  slug,
  isLoggedIn,
  authChecked,
  isFavorited,
  onFavorite,
}: {
  tool: ScenarioTool;
  slug: string;
  isLoggedIn: boolean;
  authChecked: boolean;
  isFavorited: boolean;
  onFavorite?: () => void;
}) {
  const isInternal = tool.url.startsWith("/");

  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{tool.name}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {tool.recommended && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">推荐</span>
          )}
          {tool.beginnerFriendly && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">新手友好</span>
          )}
        </div>
      </div>

      {/* Pain point */}
      <p className="text-xs text-gray-500 mb-2">💡 {tool.painPoint}</p>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-3">{tool.description}</p>

      {/* Access info */}
      <div className="flex items-center gap-3 mb-2 text-xs">
        <span className="text-gray-500">
          国内：{ACCESS_LABELS[tool.accessCN] ? (
            <span className={ACCESS_COLORS[tool.accessCN]}>{ACCESS_LABELS[tool.accessCN]}</span>
          ) : (
            <span className="text-gray-400">未知</span>
          )}
        </span>
        <span className="text-gray-500">
          海外：{ACCESS_LABELS[tool.accessOverseas] ? (
            <span className={ACCESS_COLORS[tool.accessOverseas]}>{ACCESS_LABELS[tool.accessOverseas]}</span>
          ) : (
            <span className="text-gray-400">未知</span>
          )}
        </span>
      </div>

      {/* Pricing */}
      <div className="mb-3 text-xs">
        <span className="text-gray-500">免费：{tool.freePlan}</span>
        {tool.paidPlan !== "N/A" && (
          <span className="text-gray-400 ml-2">付费：{tool.paidPlan}</span>
        )}
      </div>

      {/* Tags */}
      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Review panel */}
      {tool.toolKey && (
        <div className="mt-3 pt-3 border-t">
          <ToolReviewPanel toolKey={tool.toolKey} isLoggedIn={isLoggedIn} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <a
          href={tool.url}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          打开工具
        </a>
        {onFavorite && authChecked && (
          <button
            onClick={onFavorite}
            className={`p-2 rounded-lg border transition-colors ${
              isFavorited
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-300"
            }`}
            title={isLoggedIn ? (isFavorited ? "已收藏" : "收藏到工作台") : "登录后收藏"}
          >
            {isFavorited ? (
              <Check className="w-4 h-4" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </button>
        )}
        {!isLoggedIn && !authChecked && (
          <div className="p-2 rounded-lg border border-gray-200 text-gray-300">
            <Star className="w-4 h-4" />
          </div>
        )}
        {!isLoggedIn && authChecked && (
          <button
            onClick={() => (window.location.href = "/login?callbackUrl=/starter/" + slug)}
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 transition-colors"
            title="登录后收藏"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
