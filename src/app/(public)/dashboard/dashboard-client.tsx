"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarCheck, Star, CheckCircle, Plus, Trash2, Clock,
  FileText, Tag, MapPin, Truck, StickyNote, ChevronDown,
  ArrowUpCircle, ArrowDownCircle, MinusCircle, Gift, BookOpen,
  Ticket, Shield, Sparkles, TrendingUp, ExternalLink, ChevronRight, Home, Zap, Target, Crown, Package, Receipt, Globe, ArrowRight, MessageSquare,
} from "lucide-react";
import ProfileSelector from "@/components/dashboard/profile-selector";
import MyTools from "@/components/dashboard/my-tools";
import MyLinks from "@/components/dashboard/my-links";
import RecommendedPackages from "@/components/dashboard/recommended-packages";
import MembershipCard from "@/components/dashboard/membership-card";
import GrowthTaskSummary from "@/components/dashboard/growth-task-summary";

// ===== ALL EXISTING LOGIC PRESERVED =====

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
  { label: "唛头标签", href: "/tools/label-maker", icon: <Tag className="w-5 h-5" /> },
  { label: "邮编查询", href: "/tools/postal-code", icon: <MapPin className="w-5 h-5" /> },
  { label: "物流追踪", href: "/tracking", icon: <Truck className="w-5 h-5" /> },
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

  // Member state
  const [memberInfo, setMemberInfo] = useState<{ isMember: boolean; memberUntil: string | null } | null>(null);

  // Workbench state
  const [workbenchData, setWorkbenchData] = useState<{
    profileType: string | null;
    links: any[];
    favorites: any[];
    recommendedTools: any[];
    recommendedPackages: any[];
    limits: { maxLinks: number };
  } | null>(null);

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

      // Fetch member info
      try {
        const permRes = await fetch("/api/me/permissions");
        if (permRes.ok) {
          const permData = await permRes.json();
          setMemberInfo({ isMember: permData.isMember || false, memberUntil: permData.memberUntil || null });
        }
      } catch {
        // Ignore
      }
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

  // Fetch workbench data
  const fetchWorkbench = useCallback(async () => {
    try {
      const res = await fetch("/api/workbench/summary");
      if (res.ok) {
        const data = await res.json();
        setWorkbenchData(data);
      }
    } catch (e) {
      console.error("Failed to fetch workbench:", e);
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
      fetchWorkbench();
    }
  }, [fetchDashboard, fetchTasks, taskFilter, loginRequired, fetchRewards, fetchMyRewards, fetchWorkbench]);

  // Check-in handler
  const handleCheckIn = useCallback(async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchDashboard();
      } else if (res.status === 409) {
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

  // ===== VISUAL LAYER UPGRADE =====

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h1>
          <p className="text-gray-500 mb-6">工作台、积分、任务和自定义网址功能需要登录后使用</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors w-full">
            前往登录 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const roleLabels: Record<string, string> = { guest: "游客", user: "用户", member: "会员", admin: "管理员" };
  const roleColors: Record<string, string> = { guest: "bg-gray-100 text-gray-600", user: "bg-blue-100 text-blue-700", member: "bg-amber-100 text-amber-700", admin: "bg-purple-100 text-purple-700" };
  const roleIcons: Record<string, React.ReactNode> = { guest: <Globe className="w-4 h-4" />, user: <Zap className="w-4 h-4" />, member: <Crown className="w-4 h-4" />, admin: <Shield className="w-4 h-4" /> };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO / WELCOME ===== */}
      <div className="bg-gradient-to-br from-slate-800 via-teal-800 to-blue-900 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-8 md:pt-12 md:pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm text-teal-100 mb-4 min-h-[44px]">
                <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> 首页
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white font-medium">我的工作台</span>
              </nav>

              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
                我的工作台
              </h1>
              <p className="text-teal-100/90 text-sm md:text-base max-w-xl">
                管理你的工具、任务、积分、会员权益和常用资源
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleColors[dashboard.role] || "bg-gray-100 text-gray-600"}`}>
                  {roleIcons[dashboard.role]}
                  {roleLabels[dashboard.role] || dashboard.role}
                </span>
                {memberInfo?.isMember && memberInfo.memberUntil && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    会员至 {new Date(memberInfo.memberUntil).toLocaleDateString("zh-CN")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="#my-links" className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
                <Plus className="w-4 h-4" /> 前往添加网址
              </Link>
              <Link href="/dashboard/points" className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[48px] bg-white text-teal-700 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors">
                <TrendingUp className="w-4 h-4" /> 积分明细
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10 pb-16">
        {/* ===== TODAY'S STAT CARDS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Star, label: "当前积分", value: dashboard.points, color: "text-amber-600", bg: "bg-amber-50", desc: "可用于兑换权益" },
            { icon: TrendingUp, label: "今日获得", value: `+${dashboard.todayEarned}`, color: "text-green-600", bg: "bg-green-50", desc: `上限 ${dashboard.dailyPointCap}` },
            { icon: CalendarCheck, label: "连续签到", value: `${dashboard.checkinStreak}天`, color: "text-blue-600", bg: "bg-blue-50", desc: dashboard.checkinStreak > 0 ? "继续保持！" : "今天还没签到" },
            { icon: Target, label: "待办任务", value: dashboard.taskStats.pending, color: "text-purple-600", bg: "bg-purple-50", desc: `已完成 ${dashboard.taskStats.done} 个` },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl border shadow-sm p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== CHECK-IN + REWARDS PREVIEW ===== */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Check-in card */}
          <div className={`rounded-xl border shadow-sm p-5 ${dashboard.checkedInToday ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dashboard.checkedInToday ? "bg-green-100" : "bg-gray-100"}`}>
                  <CalendarCheck className={`w-6 h-6 ${dashboard.checkedInToday ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {dashboard.checkedInToday ? "今日已签到 ✓" : "每日签到"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dashboard.checkedInToday
                      ? "明天再来签到吧"
                      : <>+<span className="text-amber-600 font-semibold">{dashboard.role === "member" || dashboard.role === "admin" ? "10" : "5"}</span> 积分</>}
                  </p>
                </div>
              </div>
              {!dashboard.checkedInToday && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="px-5 py-2.5 min-h-[48px] bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 active:bg-teal-800 transition-all disabled:opacity-50 shadow-sm"
                >
                  {checkingIn ? "签到中..." : "签到"}
                </button>
              )}
            </div>
          </div>

          {/* Rewards preview */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                积分权益兑换
              </h2>
              <span className="text-sm text-gray-500">
                可用 <span className="font-bold text-amber-600">{userPoints}</span> 积分
              </span>
            </div>
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无可兑换权益</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rewards.map((r) => {
                  const canAfford = userPoints >= r.costPoints;
                  return (
                    <div key={r.id} className={`rounded-lg border p-3 ${canAfford ? "bg-white" : "bg-gray-50 opacity-60"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-amber-600">{r.costPoints}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                          <p className="text-xs text-gray-400 truncate">{r.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeem(r.id, r.name, r.costPoints)}
                        disabled={!canAfford || redeemingId === r.id}
                        className={`w-full py-2 min-h-[44px] rounded-lg text-xs font-medium transition-colors ${
                          canAfford
                            ? "bg-teal-600 text-white hover:bg-teal-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {redeemingId === r.id ? "兑换中..." : canAfford ? "兑换" : "积分不足"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===== MEMBERSHIP / LEVEL & BADGES ===== */}
        {!loginRequired && <MembershipCard />}

        {/* ===== GROWTH TASK SUMMARY ===== */}
        {!loginRequired && <GrowthTaskSummary />}

        {/* ===== WORKBENCH SECTION ===== */}
        {!loginRequired && workbenchData && (
          <div className="space-y-6 mb-6" id="my-links">
            <ProfileSelector
              currentProfileType={workbenchData.profileType}
              onUpdate={(pt) => setWorkbenchData(prev => prev ? { ...prev, profileType: pt } : null)}
            />
            <MyTools
              favorites={workbenchData.favorites}
              recommendedTools={workbenchData.recommendedTools}
              onRefresh={fetchWorkbench}
            />
            <MyLinks
              links={workbenchData.links}
              maxLinks={workbenchData.limits.maxLinks}
              onRefresh={fetchWorkbench}
            />
            <RecommendedPackages packages={workbenchData.recommendedPackages} />
          </div>
        )}

        {/* ===== TODAY'S TASKS ===== */}
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                今日待办
              </h2>
              <div className="flex gap-1">
                {(["pending", "done", "archived"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-3 py-2 min-h-[44px] text-xs rounded-lg font-medium transition-all ${taskFilter === f ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {f === "pending" ? `待办 (${dashboard.taskStats.pending})` : f === "done" ? `已完成 (${dashboard.taskStats.done})` : `归档 (${dashboard.taskStats.archived})`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-5">
            {/* Daily cap warning */}
            {taskFilter === "pending" && taskCapReached && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                今日任务积分已达上限（20/20），仍可继续完成任务但不再加分
              </div>
            )}

            {/* New task input */}
            {taskFilter === "pending" && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                  placeholder="添加今天要完成的事项，完成后可获得积分..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-5 py-3 min-h-[48px] bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 active:bg-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
            )}

            {/* Task list */}
            {taskLoading ? (
              <div className="text-center text-gray-400 py-8">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10">
                <Target className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  {taskFilter === "pending" ? "暂无待办任务" : taskFilter === "done" ? "暂无已完成任务" : "暂无归档任务"}
                </p>
                {taskFilter === "pending" && (
                  <p className="text-xs text-gray-400 mt-1">添加今天要完成的事项，完成后可获得积分</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        task.status === "done" ? "bg-gray-50 border-gray-100" : "bg-white hover:bg-gray-50"
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
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 min-h-[44px] flex items-center"
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
        </div>

        {/* ===== RECENT POINT LOGS ===== */}
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              最近积分记录
            </h2>
            <Link href="/dashboard/points" className="text-sm text-teal-600 hover:text-teal-700 font-medium min-h-[44px] inline-flex items-center px-2">
              查看全部 <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="p-5">
            {dashboard.recentLogs.length === 0 ? (
              <div className="text-center py-6">
                <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">暂无积分记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboard.recentLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-700 truncate">{POINT_TYPE_LABELS[log.type] || log.type}</span>
                      {log.reason && log.reason !== POINT_TYPE_LABELS[log.type] && (
                        <span className="text-xs text-gray-400 truncate">{log.reason}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>

        {/* ===== MY REWARDS ===== */}
        {myRewards.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm mb-6">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-green-500" />
                我的权益
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myRewards.map((r) => {
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    active: { label: "可用", color: "text-green-600 bg-green-50" },
                    used: { label: "已使用", color: "text-gray-400 bg-gray-50" },
                    expired: { label: "已过期", color: "text-red-400 bg-red-50" },
                  };
                  const sc = statusConfig[r.status] || statusConfig.active;
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-4 rounded-lg border">
                      {r.rewardType === "word_export_coupon" && <Ticket className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                      {r.rewardType === "member_trial" && <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                      {r.rewardType === "no_branding_coupon" && <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.rewardItem?.name || r.rewardType}</p>
                        <p className="text-xs text-gray-400">×{r.rewardValue}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded ${sc.color}`}>{sc.label}</span>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== POINTS RULES ===== */}
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              积分规则
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm">普通用户</span>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>• 每日签到 +5 积分</li>
                  <li>• 完成任务 +2 积分/个</li>
                  <li>• 任务积分每日最多 +20（10 个任务）</li>
                  <li>• 每日总积分上限 30</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-gray-900 text-sm">会员</span>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>• 每日签到 +10 积分</li>
                  <li>• 完成任务 +2 积分/个</li>
                  <li>• 任务积分每日最多 +20</li>
                  <li>• 每日总积分上限 60</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3 mt-4">
              积分通过签到和完成任务获取，用于兑换站内权益。保持使用工具、养成工作习惯，积分自然增长。
            </p>
          </div>
        </div>

        {/* ===== QUICK SHORTCUTS ===== */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">快速入口</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {SHORTCUTS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition-all min-h-[44px]"
                >
                  <span className="text-teal-600">{s.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
