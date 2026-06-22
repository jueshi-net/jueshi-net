"use client";

import { useState } from "react";
import { Shield, Award, TrendingUp, Search, Plus, Minus, ScrollText } from "lucide-react";

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  honorScore: number;
  growthValue: number;
  levelKey: string | null;
  createdAt: string;
}

interface BadgeInfo {
  id: string;
  key: string;
  name: string;
  iconText: string;
  color: string;
  category: string;
}

interface LogInfo {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  sourceType: string;
  createdAt: string;
  user: { name: string | null; email: string };
}

export function UserReputationManager({
  initialUsers,
  badges,
  initialLogs,
}: {
  initialUsers: UserInfo[];
  badges: BadgeInfo[];
  initialLogs: LogInfo[];
}) {
  const [users] = useState(initialUsers);
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdjust() {
    if (!selectedUser) return;
    const delta = parseInt(adjustDelta, 10);
    if (!delta || !adjustReason) {
      setMessage("请填写变动值和原因");
      return;
    }
    setAdjusting(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/community/honor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          delta,
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ 荣誉值已调整，新值: ${data.newHonor}`);
        setAdjustDelta("");
        setAdjustReason("");
        // Refresh logs
        const logRes = await fetch("/api/admin/community/honor?pageSize=30");
        const logData = await logRes.json();
        if (logData.logs) setLogs(logData.logs);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ 网络错误");
    }
    setAdjusting(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          社区荣誉管理
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          管理用户荣誉值（honorScore）。荣誉值不可消费，代表社区可信度背书。
        </p>
      </div>

      {/* Honor rules */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900 mb-2">荣誉值规则</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="text-green-700">+1 帖子被点赞</div>
          <div className="text-green-700">+10 回答被采纳</div>
          <div className="text-green-700">+20 帖子被加精</div>
          <div className="text-green-700">+5 有效举报</div>
          <div className="text-red-700">-10 垃圾帖确认</div>
          <div className="text-red-700">-10 举报成立</div>
          <div className="text-red-700">-30 恶意广告</div>
          <div className="text-gray-600">每日上限 50</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* User list */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">用户</th>
              <th className="text-left px-4 py-3 font-medium">角色</th>
              <th className="text-right px-4 py-3 font-medium">荣誉值</th>
              <th className="text-right px-4 py-3 font-medium">成长值</th>
              <th className="text-left px-4 py-3 font-medium">等级</th>
              <th className="text-left px-4 py-3 font-medium">注册时间</th>
              <th className="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className={selectedUser?.id === u.id ? "bg-indigo-50" : ""}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.image ? (
                      <img src={u.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{u.name || "未设置"}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">admin</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">user</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <Award className="w-3.5 h-3.5" />
                    {u.honorScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-blue-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {u.growthValue}
                  </span>
                </td>
                <td className="px-4 py-3">{u.levelKey || "lv1"}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    调整荣誉
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust panel */}
      {selectedUser && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="font-semibold text-indigo-900 mb-3">
            调整 {selectedUser.name || selectedUser.email} 的荣誉值
          </h3>
          <p className="text-sm text-indigo-700 mb-3">当前荣誉值: {selectedUser.honorScore}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              placeholder="变动值（如 +10 或 -10）"
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-48"
            />
            <input
              type="text"
              placeholder="原因说明（必填，至少3字）"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
            />
            <button
              onClick={handleAdjust}
              disabled={adjusting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {adjusting ? "提交中..." : "确认调整"}
            </button>
          </div>
          {message && <p className="mt-2 text-sm">{message}</p>}
        </div>
      )}

      {/* Honor logs */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-gray-500" />
          最近荣誉变动记录
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2 font-medium">用户</th>
                <th className="text-right px-4 py-2 font-medium">变动</th>
                <th className="text-left px-4 py-2 font-medium">来源</th>
                <th className="text-left px-4 py-2 font-medium">原因</th>
                <th className="text-left px-4 py-2 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">暂无记录</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2">{log.user.name || log.user.email}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${log.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                      {log.delta > 0 ? "+" : ""}{log.delta}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{log.sourceType}</td>
                    <td className="px-4 py-2 text-gray-700">{log.reason}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
