"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Search, ChevronLeft, ChevronRight, Edit, Ticket, Loader2, AlertTriangle, Award, TrendingUp, X } from "lucide-react";

interface AdminUser {
  id: string; email: string; name: string | null; role: string; points: number;
  memberUntil: string | null; createdAt: string; updatedAt: string;
  growthValue: number; levelKey: string;
  _count: { userRewards: number; pointLedgers: number; badgeAwards: number };
}

interface AdminData {
  users: AdminUser[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

import { GROWTH_TYPE_LABELS } from "@/lib/growth-type-labels";
import { tableStyles, badgeStyles, buttonVariants, cardStyles } from "@/lib/ui-styles";

const ROLE_LABELS: Record<string, string> = { user: "用户", member: "会员", admin: "管理员" };
const ROLE_BADGE: Record<string, string> = { user: badgeStyles.info, member: badgeStyles.warning, admin: badgeStyles.purple };
const LEVEL_LABELS: Record<string, string> = { lv1: "Lv.1 新手", lv2: "Lv.2 进阶", lv3: "Lv.3 精英", lv4: "Lv.4 大师", lv5: "Lv.5 传奇" };

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editMemberUntil, setEditMemberUntil] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editReason, setEditReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showRewards, setShowRewards] = useState<string | null>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Growth/badges modal state
  const [showGrowth, setShowGrowth] = useState<string | null>(null);
  const [growthUser, setGrowthUser] = useState<AdminUser | null>(null);
  const [growthAdjust, setGrowthAdjust] = useState("");
  const [growthReason, setGrowthReason] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [badgeReason, setBadgeReason] = useState("");
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [growthLogs, setGrowthLogs] = useState<any[]>([]);
  const [growthSaving, setGrowthSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) { setData(await res.json()); }
      else { setError("加载失败，请确认管理员权限"); }
    } catch { setError("加载失败"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (userId: string) => {
    try {
      const body: Record<string, unknown> = {};
      if (editRole) body.role = editRole;
      if (editMemberUntil !== undefined) body.memberUntil = editMemberUntil || null;
      if (editPoints) { body.pointsAdjust = parseInt(editPoints, 10); body.pointsAdjustReason = editReason || undefined; }

      // Secondary confirmation for membership changes
      if (editMemberUntil !== undefined || (editRole && editRole === "member")) {
        const confirmMsg = editMemberUntil
          ? `确认调整会员状态？\n${editMemberUntil ? "到期时间：" + editMemberUntil : "取消会员"}\n此操作将影响用户权益。`
          : "确认修改用户角色？此操作将影响用户权限。";
        if (!confirm(confirmMsg)) return;
      }

      const res = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await res.json();
      if (res.ok) {
        const msgs: string[] = [];
        if (editRole) msgs.push("角色已更新");
        if (editMemberUntil !== undefined) msgs.push(editMemberUntil ? `会员至 ${editMemberUntil}` : "会员已取消");
        if (editPoints) msgs.push(`积分调整 ${editPoints}`);
        setToast(msgs.join("，") || "保存成功");
        setEditingId(null);
        fetchData();
      }
      else { setToast(result.error || "保存失败"); }
    } catch { setToast("保存失败"); }
  };

  const handleViewRewards = async (userId: string) => {
    if (showRewards === userId) { setShowRewards(null); return; }
    try {
      const res = await fetch(`/api/admin/users/${userId}/rewards`);
      if (res.ok) { const d = await res.json(); setRewards(d.rewards); setShowRewards(userId); }
    } catch { setToast("加载兑换记录失败"); }
  };

  // Growth & badge management
  const openGrowthModal = async (user: AdminUser) => {
    setShowGrowth(user.id);
    setGrowthUser(user);
    setGrowthAdjust("");
    setGrowthReason("");
    setBadgeId("");
    setBadgeReason("");
    try {
      const [badgesRes, logsRes] = await Promise.all([
        fetch(`/api/admin/users/${user.id}/badges`),
        fetch(`/api/admin/users/${user.id}/growth-logs`),
      ]);
      if (badgesRes.ok) {
        const d = await badgesRes.json();
        setUserBadges(d.awards || []);
        setAllBadges(d.allBadges || []);
      }
      if (logsRes.ok) { const d = await logsRes.json(); setGrowthLogs(d.logs || []); }
    } catch { setToast("加载失败"); }
  };

  const handleGrowthAdjust = async () => {
    if (!growthUser) return;
    const val = parseInt(growthAdjust, 10);
    if (isNaN(val)) { setToast("请输入有效数字"); return; }
    setGrowthSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${growthUser.id}/growth-badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ growthAdjust: val, reason: growthReason || "后台调整成长值" }),
      });
      const result = await res.json();
      if (res.ok) {
        setToast(`调整成功：${val > 0 ? "+" : ""}${val} 成长值 → ${result.data.levelKey}`);
        setGrowthAdjust("");
        setGrowthReason("");
        fetchData();
        openGrowthModal({ ...growthUser, growthValue: result.data.growthValue, levelKey: result.data.levelKey });
      } else { setToast(result.error || "调整失败"); }
    } catch { setToast("调整失败"); }
    finally { setGrowthSaving(false); }
  };

  const handleAwardBadge = async () => {
    if (!growthUser || !badgeId) { setToast("请选择勋章"); return; }
    setGrowthSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${growthUser.id}/growth-badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId, reason: badgeReason || "后台手动授予" }),
      });
      const result = await res.json();
      if (res.ok) {
        setToast("勋章授予成功");
        setBadgeId("");
        setBadgeReason("");
        openGrowthModal(growthUser);
        fetchData();
      } else { setToast(result.error || "授予失败"); }
    } catch { setToast("授予失败"); }
    finally { setGrowthSaving(false); }
  };

  const handleRemoveBadge = async (awardId: string) => {
    if (!growthUser) return;
    if (!confirm("确认移除该勋章？")) return;
    try {
      const res = await fetch(`/api/admin/users/${growthUser.id}/badges/${awardId}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) { setToast("勋章已移除"); openGrowthModal(growthUser); fetchData(); }
      else { setToast(result.error || "移除失败"); }
    } catch { setToast("移除失败"); }
  };

  if (loading) return <div className="text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]"><Loader2 className="w-5 h-5 animate-spin" /> 加载中...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>;
  if (!data) return <div className="text-center text-red-500">加载失败</div>;

  const userCount = data.users.filter(u => u.role === "user").length;
  const memberCount = data.users.filter(u => u.role === "member").length;
  const adminCount = data.users.filter(u => u.role === "admin").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2"><Users className="w-5 h-5" /> 用户管理</h1>
          <p className="text-sm text-blue-100 mt-1">管理平台用户、角色、积分、成长值与会员。共 {data.pagination.total} 个用户。</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${cardStyles.base} p-4 text-center`}>
          <div className="text-2xl font-extrabold text-gray-900">{data.pagination.total}</div>
          <div className="text-xs text-gray-500">总用户</div>
        </div>
        <div className={`${cardStyles.base.replace("p-5", "p-4")} text-center bg-blue-50 border-blue-200`}>
          <div className="text-2xl font-extrabold text-blue-700">{userCount}</div>
          <div className="text-xs text-blue-600">普通用户</div>
        </div>
        <div className={`${cardStyles.base.replace("p-5", "p-4")} text-center bg-amber-50 border-amber-200`}>
          <div className="text-2xl font-extrabold text-amber-700">{memberCount}</div>
          <div className="text-xs text-amber-600">会员</div>
        </div>
        <div className={`${cardStyles.base.replace("p-5", "p-4")} text-center bg-purple-50 border-purple-200`}>
          <div className="text-2xl font-extrabold text-purple-700">{adminCount}</div>
          <div className="text-xs text-purple-600">管理员</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onKeyDown={(e) => e.key === "Enter" && setPage(1)} placeholder="搜索邮箱..." className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 min-h-[44px]" />
      </div>

      {/* Table */}
      <div className={tableStyles.wrapper}>
        <div className={tableStyles.scroll}>
          <table className={tableStyles.base}>
            <thead className={tableStyles.header}>
              <tr>
                <th className={tableStyles.headCell}>邮箱</th>
                <th className={tableStyles.headCell}>角色</th>
                <th className={`${tableStyles.headCell} hidden sm:table-cell`}>等级</th>
                <th className={`${tableStyles.headCell} hidden md:table-cell`}>成长值</th>
                <th className={`${tableStyles.headCell} hidden sm:table-cell`}>积分</th>
                <th className={`${tableStyles.headCell} hidden lg:table-cell`}>勋章</th>
                <th className={`${tableStyles.headCell} hidden sm:table-cell`}>会员到期</th>
                <th className={tableStyles.headCell}>操作</th>
              </tr>
            </thead>
            <tbody className={tableStyles.body}>
              {data.users.map((u) => {
                const isMember = u.memberUntil && new Date(u.memberUntil) > new Date();
                return (
                  <tr key={u.id} className={tableStyles.row}>
                    <td className={tableStyles.cell}>
                      <div className="font-medium max-w-[180px] truncate">{u.email}</div>
                      {u.name && <div className="text-xs text-gray-400">{u.name}</div>}
                    </td>
                    <td className={tableStyles.cell}>
                      <span className={ROLE_BADGE[u.role] || badgeStyles.neutral}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td className={`${tableStyles.cell} hidden sm:table-cell`}>
                      <span className={badgeStyles.success}>
                        {LEVEL_LABELS[u.levelKey] || u.levelKey}
                      </span>
                    </td>
                    <td className={`${tableStyles.cell} hidden md:table-cell`}>
                      <span className="font-medium text-emerald-600">{u.growthValue}</span>
                    </td>
                    <td className={`${tableStyles.cell} hidden sm:table-cell font-medium text-amber-600`}>{u.points}</td>
                    <td className={`${tableStyles.cell} hidden lg:table-cell text-gray-600`}>{u._count.badgeAwards}</td>
                    <td className={`${tableStyles.cell} hidden sm:table-cell`}>
                      <span className="text-xs text-gray-500">
                        {u.memberUntil ? (isMember ? new Date(u.memberUntil).toLocaleDateString("zh-CN") : "已过期") : "—"}
                      </span>
                    </td>
                    <td className={tableStyles.cell}>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingId(u.id); setEditRole(u.role); setEditMemberUntil(u.memberUntil ? new Date(u.memberUntil).toISOString().slice(0, 16) : ""); setEditPoints(""); setEditReason(""); }} className={buttonVariants.ghost.replace("min-h-[44px]", "min-h-[36px]")} title="编辑"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => openGrowthModal(u)} className={buttonVariants.ghost.replace("min-h-[44px]", "min-h-[36px]")} title="成长值/勋章"><TrendingUp className="w-4 h-4" /></button>
                        <button onClick={() => handleViewRewards(u.id)} className={buttonVariants.ghost.replace("min-h-[44px]", "min-h-[36px]")} title="兑换记录"><Ticket className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal (role/points/membership) */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 text-gray-900" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">编辑用户</h2>
            <div><label className="text-sm text-gray-700">角色</label><select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white"><option value="user">用户</option><option value="member">会员</option><option value="admin">管理员</option></select></div>
            <div>
              <label className="text-sm text-gray-700">会员到期时间（留空=非会员）</label>
              <input type="datetime-local" value={editMemberUntil} onChange={(e) => setEditMemberUntil(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white" />
              <p className="text-xs text-gray-400 mt-1">设为未来时间=授予会员，清空=取消会员</p>
            </div>
            <div>
              <label className="text-sm text-gray-700">积分调整（正数=加，负数=减）</label>
              <input type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} placeholder="如：+50 或 -20" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400" />
            </div>
            {editPoints && (
              <div>
                <label className="text-sm text-gray-700">调整原因</label>
                <input type="text" value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="如：补偿、奖励、违规扣除" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400" />
              </div>
            )}
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              修改角色、会员状态或积分将影响用户权限
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]">取消</button>
              <button onClick={() => handleSave(editingId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 min-h-[44px]">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Growth & Badge Modal */}
      {showGrowth && growthUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGrowth(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-5 text-gray-900 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> 成长值与勋章管理</h2>
              <button onClick={() => setShowGrowth(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>

            {/* Current status */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">当前等级</div>
                <div className="text-lg font-bold text-green-600">{LEVEL_LABELS[growthUser.levelKey] || growthUser.levelKey}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">成长值</div>
                <div className="text-lg font-bold text-emerald-600">{growthUser.growthValue}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">勋章数</div>
                <div className="text-lg font-bold text-purple-600">{userBadges.length}</div>
              </div>
            </div>

            {/* Growth adjust */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">📈 调整成长值</h3>
              <div className="flex gap-2">
                <input type="number" value={growthAdjust} onChange={(e) => setGrowthAdjust(e.target.value)} placeholder="如：+120 或 -50" className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 min-h-[44px]" />
                <button onClick={handleGrowthAdjust} disabled={growthSaving || !growthAdjust} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 min-h-[44px]">{growthSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "保存"}</button>
              </div>
              <input type="text" value={growthReason} onChange={(e) => setGrowthReason(e.target.value)} placeholder="调整原因（如：测试成长值调整）" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 min-h-[44px]" />
            </div>

            {/* Current badges */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1"><Award className="w-4 h-4" /> 已获得勋章</h3>
              {userBadges.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">暂无勋章</div>
              ) : (
                <div className="space-y-2">
                  {userBadges.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{a.badge?.iconText} {a.badge?.name}</div>
                        <div className="text-xs text-gray-400">{a.reason || "后台授予"} · {new Date(a.awardedAt).toLocaleDateString("zh-CN")}</div>
                      </div>
                      <button onClick={() => handleRemoveBadge(a.id)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded min-h-[36px]">移除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Award badge */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">🎖️ 授予勋章</h3>
              <div className="flex gap-2">
                <select value={badgeId} onChange={(e) => setBadgeId(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white min-h-[44px]">
                  <option value="">选择勋章...</option>
                  {allBadges.filter((b: any) => b.isActive).map((b: any) => (
                    <option key={b.id} value={b.id}>{b.iconText} {b.name}</option>
                  ))}
                </select>
                <button onClick={handleAwardBadge} disabled={growthSaving || !badgeId} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 min-h-[44px]">{growthSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "授予"}</button>
              </div>
              <input type="text" value={badgeReason} onChange={(e) => setBadgeReason(e.target.value)} placeholder="授予原因" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 min-h-[44px]" />
            </div>

            {/* Growth logs */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">📋 最近成长值流水</h3>
              {growthLogs.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">暂无流水记录</div>
              ) : (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">时间</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">类型</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">数值</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">原因</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {growthLogs.slice(0, 10).map((l: any) => (
                        <tr key={l.id}>
                          <td className="px-3 py-2 text-gray-500">{new Date(l.createdAt).toLocaleDateString("zh-CN")}</td>
                          <td className="px-3 py-2">{GROWTH_TYPE_LABELS[l.type] || l.type}</td>
                          <td className={`px-3 py-2 font-medium ${l.value >= 0 ? "text-green-600" : "text-red-600"}`}>{l.value >= 0 ? "+" : ""}{l.value}</td>
                          <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">{l.reason || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end"><button onClick={() => setShowGrowth(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 min-h-[44px]">关闭</button></div>
          </div>
        </div>
      )}

      {/* Rewards Drawer */}
      {showRewards && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRewards(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 text-gray-900 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">兑换记录</h2>
            {rewards.length === 0 ? <div className="text-center text-gray-400 py-8">暂无兑换记录</div> : (
              <div className="space-y-2">
                {rewards.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div><div className="text-sm font-medium">{r.rewardItem?.name || r.rewardType}</div><div className="text-xs text-gray-400">×{r.rewardValue} · {new Date(r.createdAt).toLocaleDateString("zh-CN")}</div></div>
                    <span className={`text-xs px-2 py-0.5 rounded ${r.status === "active" ? "bg-green-100 text-green-700" : r.status === "used" ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-500"}`}>{r.status === "active" ? "可用" : r.status === "used" ? "已使用" : "已过期"}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end"><button onClick={() => setShowRewards(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 min-h-[44px]">关闭</button></div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">第 {data.pagination.page} / {data.pagination.totalPages} 页，共 {data.pagination.total} 用户</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 min-h-[36px]"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page >= data.pagination.totalPages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 min-h-[36px]"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-green-600 text-white">{toast}</div>
      )}
    </div>
  );
}
