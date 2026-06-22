"use client";

import { useState } from "react";
import { Award, ToggleLeft, ToggleRight } from "lucide-react";

interface BadgeInfo {
  id: string;
  key: string;
  name: string;
  description: string | null;
  iconText: string;
  color: string;
  category: string;
  conditionText: string | null;
  isActive: boolean;
  sortOrder: number;
  awardCount: number;
}

const COLOR_MAP: Record<string, string> = {
  "green-500": "bg-green-100 text-green-700 border-green-200",
  "teal-500": "bg-teal-100 text-teal-700 border-teal-200",
  "blue-500": "bg-blue-100 text-blue-700 border-blue-200",
  "amber-500": "bg-amber-100 text-amber-700 border-amber-200",
  "purple-500": "bg-purple-100 text-purple-700 border-purple-200",
  "rose-500": "bg-rose-100 text-rose-700 border-rose-200",
  "indigo-500": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "cyan-500": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "orange-500": "bg-orange-100 text-orange-700 border-orange-200",
  "emerald-500": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function BadgeManager({ badges }: { badges: BadgeInfo[] }) {
  const [badgeList, setBadgeList] = useState(badges);

  async function toggleBadge(badgeId: string, currentActive: boolean) {
    // TODO: API call to toggle
    setBadgeList(prev =>
      prev.map(b => b.id === badgeId ? { ...b, isActive: !currentActive } : b)
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-600" />
          社区勋章管理
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          管理勋章列表。勋章可自动授予或管理员手动授予。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badgeList.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-xl border p-4 ${badge.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm border ${COLOR_MAP[badge.color] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                  <span className="text-base">{badge.iconText}</span>
                  {badge.name}
                </span>
              </div>
              <button
                onClick={() => toggleBadge(badge.id, badge.isActive)}
                className="text-gray-400 hover:text-gray-600"
              >
                {badge.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">{badge.description || "无描述"}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span>分类: {badge.category}</span>
              <span>已授予: {badge.awardCount} 人</span>
            </div>
            {badge.conditionText && (
              <p className="text-xs text-gray-400 mt-1">条件: {badge.conditionText}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
