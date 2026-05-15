"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarCheck, Star, CheckCircle, Plus, Trash2, Clock,
  FileText, Tag, MapPin, Truck, StickyNote, ChevronDown,
  ArrowUpCircle, ArrowDownCircle, MinusCircle, Gift, BookOpen,
  Ticket, Shield, Sparkles,
} from "lucide-react";

// Types
interface DashboardData {
  role: string;
  points: number;
  checkinStreak: number;
  checkedInToday: boolean;
  todayEarned: number;
  todayLogCount: number;
  dailyPointCap: number;
  taskStats: { pending: number; done: number; archived: number; total: number };
  recentLogs: { id: string; type: string; points: number; reason: string | null; createdAt: string }[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  dueDate: string | null;
  pointsAwarded: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

const POINT_TYPE_LABELS: Record<string, string> = {
  daily_checkin: "每日签到",
  task_complete: "完成任务",
  export_word: "导出 Word",
  admin_adjust: "管理员调整",
  reward_redeem: "权益兑换",
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  high: { label: "高", color: "text-red-500", icon: <ArrowUpCircle className="w-3 h-3" /> },
  normal: { label: "中", color: "text-yellow-500", icon: <MinusCircle className="w-3 h-3" /> },
  low: { label: "低", color: "text-green-500", icon: <ArrowDownCircle className="w-3 h-3" /> },
};

const SHORTCUTS = [
  { label: "单据生成", href: "/tools/documents", icon: <FileText className="w-5 h-5" /> },
  { label: "唛头面单", href: "/tools/label-maker", icon: <Tag className="w-5 h-5" /> },
  { label: "邮编查询", href: "/tools/postal-code", icon: <MapPin className="w-5 h-5" /> },
  { label: "物流查询", href: "/tracking", icon: <Truck className="w-5 h-5" /> },
  { label: "Memo", href: "/tools/memo", icon: <StickyNote className="w-5 h-5" /> },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskFilter, setTaskFilter] = useState("pending");
  const [checkingIn, setCheckingIn] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [taskCapReached, setTaskCapReached] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);

  // Rewards state
  const [rewards, setRewards] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [myRewards, setMyRewards] = useState<any[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/summary");
      if (res.status === 401) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDashboard(data);
    } catch (e) {
      console.error("Failed to fetch dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async (filter = "pending") => {
    setTaskLoading(true);
    try {
      const res = await fetch(`/api/tasks?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setTaskLoading(false);
    }
  }, []);

  // Fetch rewards
  const fetchRewards = useCallback(async () => {
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setRewards(data.items || []);
        setUserPoints(data.points || 0);
      }
    } catch (e) {
      console.error("Failed to fetch rewards:", e);
    }
  }, []);

  // Fetch my rewards
  const fetchMyRewards = useCallback(async () => {
    try {
      const res = await fetch("/api/rewards/my");
      if (res.ok) {
        const data = await res.json();
        setMyRewards(data.rewards || []);
      }
    } catch (e) {
      console.error("Failed to fetch my rewards:", e);
    }
  }, []);

  // Redeem
  const handleRedeem = useCallback(async (rewardItemId: string, name: string, cost: number) => {
    if (userPoints < cost) {
      setToast({ message: "积分不足", type: "error" });
      return;
    }
    setRedeemingId(rewardItemId);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardItemId }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: `兑换成功：${name}`, type: "success" });
        setUserPoints(data.remainingPoints);
        fetchRewards();
        fetchMyRewards();
        fetchDashboard();
      } else {
        setToast({ message: data.error || "兑换失败", type: "error" });
      }
    } catch (e) {
      setToast({ message: "兑换失败，请重试", type: "error" });
    } finally {
      setRedeemingId(null);
    }
  }, [userPoints, fetchRewards, fetchMyRewards, fetchDashboard]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
    fetchTasks(taskFilter);
    if (!loginRequired) {
      fetchRewards();
      fetchMyRewards();
    }
  }, [fetchDashboard, fetchTasks, taskFilter, loginRequired, fetchRewards, fetchMyRewards]);

  // Check-in handler
  const handleCheckIn = useCallback(async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        // Refresh dashboard
        fetchDashboard();
      } else if (res.status === 409) {
        // Already checked in
        fetchDashboard();
      }
    } catch (e) {
      console.error("Check-in failed:", e);
    } finally {
      setCheckingIn(false);
    }
  }, [fetchDashboard]);

  // Create task
  const handleCreateTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        fetchTasks(taskFilter);
      }
    } catch (e) {
      console.error("Create task failed:", e);
    }
  }, [newTaskTitle, taskFilter, fetchTasks]);

  // Complete task
  const handleCompleteTask = useCallback(async (id: string) => {
    setCompletingId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      const data = await res.json();
      if (res.ok) {
        // Check daily cap
        if (data.pointsEarned > 0) {
          if (data.dailyTaskPointsRemaining <= 0) {
            setTaskCapReached(true);
          }
          fetchDashboard();
        }
        fetchTasks(taskFilter);
      }
    } catch (e) {
      console.error("Complete task failed:", e);
    } finally {
      setCompletingId(null);
    }
  }, [taskFilter, fetchTasks, fetchDashboard]);

  // Delete/archive task
  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTasks(taskFilter);
      }
    } catch (e) {
      console.error("Delete task failed:", e);
    }
  }, [taskFilter, fetchTasks]);

  // Format time
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // Login required
  if (loginRequired) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">请先登录</h1>
        <p className="text-gray-600 mb-6">工作台和积分功能需要登录后使用</p>
        <Link href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          前往登录
        </Link>
      </div>
    );
  }

  if (!dashboard) return null;

  const roleLabels: Record<string, string> = { guest: "游客", user: "用户", member: "会员", admin: "管理员" };
  const roleColors: Record<string, string> = { guest: "bg-gray-100 text-gray-600", user: "bg-blue-100 text-blue-700", member: "bg-amber-100 text-amber-700", admin: "bg-purple-100 text-purple-700" };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的工作台</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[dashboard.role] || "bg-gray-100 text-gray-600"}`}>
          {roleLabels[dashboard.role] || dashboard.role}
        </span>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-amber-500">{dashboard.points}</div>
          <div className="text-xs text-gray-500 mt-1">当前积分</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-green-500">+{dashboard.todayEarned}</div>
          <div className="text-xs text-gray-500 mt-1">今日获得</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">{dashboard.dailyPointCap}</div>
          <div className="text-xs text-gray-500 mt-1">每日上限</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-orange-500">{dashboard.checkinStreak}</div>
          <div className="text-xs text-gray-500 mt-1">连续签到</div>
        </div>
      </div>

      {/* Check-in Card */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarCheck className={`w-6 h-6 ${dashboard.checkedInToday ? "text-green-500" : "text-gray-400"}`} />
            <div>
              <div className="font-medium text-gray-900">
                {dashboard.checkedInToday ? "今日已签到" : "每日签到"}
              </div>
              <div className="text-sm text-gray-500">
                {dashboard.checkedInToday
                  ? "明天再来签到吧"
                  : `${dashboard.role === "member" || dashboard.role === "admin" ? "+10" : "+5"} 积分`}
              </div>
            </div>
          </div>
          {!dashboard.checkedInToday && (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {checkingIn ? "签到中..." : "签到"}
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            我的待办
          </h2>
          <div className="flex gap-1">
            {(["pending", "done", "archived"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${taskFilter === f ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {f === "pending" ? `待办 (${dashboard.taskStats.pending})` : f === "done" ? "已完成" : "归档"}
              </button>
            ))}
          </div>
        </div>

        {/* New task input */}
        {taskFilter === "pending" && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
              placeholder="输入新任务，按回车添加..."
              className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Daily cap warning */}
        {taskFilter === "pending" && taskCapReached && (
          <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            今日任务积分已达上限（20/20），仍可继续完成任务但不再加分
          </div>
        )}

        {/* Task list */}
        {taskLoading ? (
          <div className="text-center text-gray-500 py-4">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-sm">
            {taskFilter === "pending" ? "暂无待办任务" : taskFilter === "done" ? "暂无已完成任务" : "暂无归档任务"}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    task.status === "done" ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {task.status === "pending" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingId === task.id}
                      className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
                      title="标记完成"
                    />
                  )}
                  {task.status === "done" && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {task.status === "archived" && (
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${prio.color} flex items-center gap-0.5`}>
                        {prio.icon}{prio.label}
                      </span>
                      {task.pointsAwarded && task.status === "done" && (
                        <span className="text-xs text-green-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3" />+2
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">截止 {new Date(task.dueDate).toLocaleDateString("zh-CN")}</span>
                      )}
                    </div>
                  </div>

                  {task.status !== "archived" && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title={task.status === "done" ? "归档" : "删除"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Point Logs */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-amber-500" />
          积分记录
        </h2>
        {dashboard.recentLogs.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">暂无积分记录</div>
        ) : (
          <div className="space-y-2">
            {dashboard.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{POINT_TYPE_LABELS[log.type] || log.type}</span>
                  {log.reason && log.reason !== POINT_TYPE_LABELS[log.type] && (
                    <span className="text-xs text-gray-400">{log.reason}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${log.points > 0 ? "text-green-600" : "text-red-600"}`}>
                    {log.points > 0 ? "+" : ""}{log.points}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Points Rewards ===== */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-amber-500" />
          积分权益兑换
        </h2>
        {rewards.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">暂无可兑换权益</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewards.map((r) => {
              const canAfford = userPoints >= r.costPoints;
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${canAfford ? 'bg-white' : 'bg-gray-50 opacity-70'}`}
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-amber-50 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-amber-600">{r.costPoints}</span>
                    <span className="text-[10px] text-amber-400">积分</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.description}</div>
                  </div>
                  <button
                    onClick={() => handleRedeem(r.id, r.name, r.costPoints)}
                    disabled={!canAfford || redeemingId === r.id}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      canAfford
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {redeemingId === r.id ? '兑换中...' : canAfford ? '兑换' : '积分不足'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== My Rewards ===== */}
      {myRewards.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Ticket className="w-5 h-5 text-green-500" />
            我的权益
          </h2>
          <div className="space-y-2">
            {myRewards.map((r) => {
              const statusConfig: Record<string, { label: string; color: string }> = {
                active: { label: '可用', color: 'text-green-600 bg-green-50' },
                used: { label: '已使用', color: 'text-gray-400 bg-gray-50' },
                expired: { label: '已过期', color: 'text-red-400 bg-red-50' },
              };
              const sc = statusConfig[r.status] || statusConfig.active;
              return (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {r.rewardType === 'word_export_coupon' && <Ticket className="w-4 h-4 text-blue-500" />}
                    {r.rewardType === 'member_trial' && <Shield className="w-4 h-4 text-amber-500" />}
                    {r.rewardType === 'no_branding_coupon' && <Sparkles className="w-4 h-4 text-purple-500" />}
                    <span className="text-sm text-gray-900">{r.rewardItem?.name || r.rewardType}</span>
                    <span className="text-xs text-gray-400">×{r.rewardValue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${sc.color}`}>{sc.label}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Points Rules ===== */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-500" />
          积分规则
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-medium text-gray-900 mb-2">📋 普通用户</div>
            <ul className="space-y-1 text-gray-600">
              <li>• 每日签到 +5 积分</li>
              <li>• 完成任务 +2 积分/个</li>
              <li>• 任务积分每日最多 +20（10 个任务）</li>
              <li>• 每日总积分上限 30</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-900 mb-2">⭐ 会员</div>
            <ul className="space-y-1 text-gray-600">
              <li>• 每日签到 +10 积分</li>
              <li>• 完成任务 +2 积分/个</li>
              <li>• 任务积分每日最多 +20</li>
              <li>• 每日总积分上限 60</li>
            </ul>
          </div>
          <p className="text-xs text-gray-400 border-t pt-3">
            积分通过签到和完成任务获取，用于兑换站内权益。保持使用工具、养成工作习惯，积分自然增长。
          </p>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">常用工具</h2>
        <div className="grid grid-cols-5 gap-3">
          {SHORTCUTS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <span className="text-blue-600">{s.icon}</span>
              <span className="text-xs text-gray-600">{s.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
