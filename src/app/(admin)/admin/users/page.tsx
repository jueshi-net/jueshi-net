"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Search, ChevronLeft, ChevronRight, Edit, Ticket } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  points: number;
  memberUntil: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { userRewards: number; pointLedgers: number };
}

interface AdminData {
  users: AdminUser[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const ROLE_LABELS: Record<string, string> = {
  user: "用户",
  member: "会员",
  admin: "管理员",
};

const ROLE_COLORS: Record<string, string> = {
  user: "bg-blue-100 text-blue-700",
  member: "bg-amber-100 text-amber-700",
  admin: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editReason, setEditReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showRewards, setShowRewards] = useState<string | null>(null);
  const [rewards, setRewards] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        setToast("加载失败，请确认管理员权限");
      }
    } catch {
      setToast("加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (userId: string) => {
    try {
      const body: Record<string, unknown> = {};
      if (editRole) body.role = editRole;
      if (editPoints) {
        body.pointsAdjust = parseInt(editPoints, 10);
        body.pointsAdjustReason = editReason || undefined;
      }
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (res.ok) {
        setToast("保存成功");
        setEditingId(null);
        fetchData();
      } else {
        setToast(result.error || "保存失败");
      }
    } catch {
      setToast("保存失败");
    }
  };

  const handleViewRewards = async (userId: string) => {
    if (showRewards === userId) {
      setShowRewards(null);
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/rewards`);
      if (res.ok) {
        const d = await res.json();
        setRewards(d.rewards);
        setShowRewards(userId);
      }
    } catch {
      setToast("加载兑换记录失败");
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">加载中...</div>;

  if (!data) return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-500">加载失败</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          用户管理
        </h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-700">← 返回管理面板</Link>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            placeholder="搜索邮箱..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">邮箱</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">角色</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">积分</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">会员到期</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">注册</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.email}</div>
                  {u.name && <div className="text-xs text-gray-400">{u.name}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || "bg-gray-100"}`}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-amber-600">{u.points}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {u.memberUntil ? new Date(u.memberUntil).toLocaleDateString("zh-CN") : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(u.id); setEditRole(u.role); setEditPoints(""); setEditReason(""); }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewRewards(u.id)}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="兑换记录"
                    >
                      <Ticket className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">编辑用户</h2>
            <div>
              <label className="text-sm text-gray-600">角色</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option value="user">用户</option>
                <option value="member">会员</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">积分调整（正数=加，负数=减）</label>
              <input
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                placeholder="如：+50 或 -20"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            {editPoints && (
              <div>
                <label className="text-sm text-gray-600">调整原因</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="如：补偿、奖励、违规扣除"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button onClick={() => handleSave(editingId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Drawer */}
      {showRewards && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRewards(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">兑换记录</h2>
            {rewards.length === 0 ? (
              <div className="text-center text-gray-400 py-8">暂无兑换记录</div>
            ) : (
              <div className="space-y-2">
                {rewards.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="text-sm font-medium">{r.rewardItem?.name || r.rewardType}</div>
                      <div className="text-xs text-gray-400">×{r.rewardValue} · {new Date(r.createdAt).toLocaleDateString("zh-CN")}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      r.status === "active" ? "bg-green-100 text-green-700" :
                      r.status === "used" ? "bg-gray-100 text-gray-500" :
                      "bg-red-100 text-red-500"
                    }`}>
                      {r.status === "active" ? "可用" : r.status === "used" ? "已使用" : "已过期"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setShowRewards(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            第 {data.pagination.page} / {data.pagination.totalPages} 页，共 {data.pagination.total} 用户
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page >= data.pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-green-600 text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
