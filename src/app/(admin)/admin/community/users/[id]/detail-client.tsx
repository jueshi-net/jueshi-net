"use client";

import { useState } from "react";
import { Shield, Award, TrendingUp, Calendar, Plus, X, ScrollText } from "lucide-react";

interface DetailUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  membershipTier: string;
  points: number;
  growthValue: number;
  levelKey: string | null;
  honorScore: number;
  createdAt: string;
}

export function AdminUserCommunityDetail({
  user,
  profile,
  stat,
  badgeAwards,
  allBadges,
  honorLogs,
}: {
  user: DetailUser;
  profile: any;
  stat: any;
  badgeAwards: any[];
  allBadges: any[];
  honorLogs: any[];
}) {
  const [grantBadgeId, setGrantBadgeId] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [message, setMessage] = useState("");
  const [awards, setAwards] = useState(badgeAwards);

  async function handleGrant() {
    if (!grantBadgeId) {
      setMessage("请选择勋章");
      return;
    }
    try {
      const res = await fetch("/api/admin/community/badges/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, badgeId: grantBadgeId, reason: grantReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ 勋章已授予");
        const badge = allBadges.find(b => b.id === grantBadgeId);
        if (badge) {
          setAwards([...awards, { ...badge, badge, userId: user.id, badgeId: grantBadgeId, reason: grantReason, awardedAt: new Date().toISOString(), createdAt: new Date().toISOString(), id: "temp" }]);
        }
        setGrantBadgeId("");
        setGrantReason("");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ 网络错误");
    }
  }

  async function handleRemove(badgeId: string) {
    try {
      const res = await fetch("/api/admin/community/badges/grant", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, badgeId }),
      });
      if (res.ok) {
        setAwards(awards.filter(a => a.badgeId !== badgeId));
        setMessage("✅ 勋章已移除");
      }
    } catch {
      setMessage("❌ 网络错误");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">社区身份详情</h1>
        <p className="text-sm text-gray-500">{user.name || "未设置"} ({user.email})</p>
      </div>

      {/* Identity summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-400">角色</div>
          <div className="font-semibold mt-1">{user.role}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-400">等级</div>
          <div className="font-semibold mt-1">{user.levelKey || "lv1"}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-400 flex items-center gap-1"><Award className="w-3 h-3" /> 荣誉值</div>
          <div className="font-semibold mt-1 text-emerald-600">{user.honorScore}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 成长值</div>
          <div className="font-semibold mt-1 text-blue-600">{user.growthValue}</div>
        </div>
      </div>

      {/* Community stats */}
      <div>
        <h3 className="font-semibold mb-2">社区统计</h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2 text-center">
          <StatBox label="发帖" value={stat?.postCount || 0} />
          <StatBox label="回复" value={stat?.commentCount || 0} />
          <StatBox label="被采纳" value={stat?.acceptedAnswerCount || 0} />
          <StatBox label="精华" value={stat?.featuredPostCount || 0} />
          <StatBox label="有用" value={stat?.helpfulVoteCount || 0} />
          <StatBox label="举报采纳" value={stat?.reportAcceptedCount || 0} />
          <StatBox label="违规" value={stat?.violationCount || 0} />
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-semibold mb-2">已获勋章 ({awards.length})</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {awards.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border bg-white text-sm">
              <span>{a.badge.iconText}</span>
              {a.badge.name}
              <button onClick={() => handleRemove(a.badgeId)} className="ml-1 text-gray-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {awards.length === 0 && <span className="text-sm text-gray-400">暂无勋章</span>}
        </div>

        {/* Grant badge */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={grantBadgeId}
            onChange={(e) => setGrantBadgeId(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">选择勋章...</option>
            {allBadges.map(b => (
              <option key={b.id} value={b.id}>{b.iconText} {b.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="授予原因"
            value={grantReason}
            onChange={(e) => setGrantReason(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm flex-1"
          />
          <button onClick={handleGrant} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            <Plus className="w-4 h-4 inline" /> 授予
          </button>
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>

      {/* Honor logs */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-gray-500" />
          荣誉变动记录
        </h3>
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">变动</th>
                <th className="text-left px-4 py-2">来源</th>
                <th className="text-left px-4 py-2">原因</th>
                <th className="text-left px-4 py-2">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {honorLogs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">暂无记录</td></tr>
              ) : honorLogs.map(log => (
                <tr key={log.id}>
                  <td className={`px-4 py-2 font-semibold ${log.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                    {log.delta > 0 ? "+" : ""}{log.delta}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{log.sourceType}</td>
                  <td className="px-4 py-2">{log.reason}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-2">
      <div className="text-lg font-bold text-gray-700">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
