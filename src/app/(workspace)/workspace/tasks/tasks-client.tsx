"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CheckCircle, ArrowRight, Target, Gift,
  Sparkles, MessageSquare, CalendarCheck, Globe, Loader2,
  Trophy, Flame, Star, TrendingUp, Zap, Award, Clock,
} from "lucide-react";
import { MetricCard } from "@/components/saas/MetricCard";
import { SectionCard } from "@/components/saas/SectionCard";
import { ActionCard } from "@/components/saas/ActionCard";
import { StatusBadge } from "@/components/saas/StatusBadge";
import { WorkspacePageHeader } from "@/components/saas/WorkspacePageHeader";

interface TaskData {
  id: string;
  key: string;
  title: string;
  description: string;
  rewardGrowth: number;
  actionType: string;
  targetUrl: string;
  badgeKey?: string;
  badgeName?: string;
  category: "daily" | "growth" | "community" | "content";
  sortOrder: number;
  completed: boolean;
  count: number;
}

interface LevelInfo {
  growthValue: number;
  level: { name: string; iconText: string; color: string; minGrowth: number; maxGrowth: number | null } | null;
  nextLevel: { name: string; iconText: string; color: string; minGrowth: number } | null;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof CalendarCheck; variant: "info" | "success" | "warning" | "processing" }> = {
  daily: { label: "每日任务", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CalendarCheck, variant: "info" },
  growth: { label: "成长任务", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Sparkles, variant: "processing" },
  community: { label: "社区任务", color: "bg-teal-50 text-teal-700 border-teal-200", icon: MessageSquare, variant: "success" },
  content: { label: "内容任务", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Gift, variant: "warning" },
};

const TASK_ACTION_ICONS: Record<string, typeof CalendarCheck> = {
  checkin: CalendarCheck,
  tool_review: Gift,
  forum_post: MessageSquare,
  forum_comment: MessageSquare,
  workspace_visit: Target,
  member_visit: Globe,
};

export default function TasksClient() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "daily" | "growth" | "community" | "content">("all");

  useEffect(() => {
    fetch("/api/growth-tasks/summary")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          const apiTasks = (d.tasks || []).map((t: any) => ({
            ...t,
            actionType: t.actionType || "workspace_visit",
            targetUrl: t.targetUrl || "/workspace",
          }));
          if (apiTasks.length > 0) {
            setTasks(apiTasks);
            if (d.levelInfo) setLevelInfo(d.levelInfo);
          } else {
            setTasks(getFallbackTasks());
          }
        } else {
          setTasks(getFallbackTasks());
        }
      })
      .catch(() => {
        setTasks(getFallbackTasks());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckin = async () => {
    setSigningIn("daily_checkin");
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: `签到成功！+${data.points} 积分，+2 成长值`, type: "success" });
      } else if (res.status === 409) {
        setToast({ message: "今日已签到", type: "success" });
      } else {
        setToast({ message: data.error || "签到失败", type: "error" });
      }
    } catch {
      setToast({ message: "签到失败，请重试", type: "error" });
    } finally {
      setSigningIn(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full" /></div>;

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const totalReward = tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.rewardGrowth, 0);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = activeTab === "all" ? tasks : tasks.filter(t => t.category === activeTab);

  const grouped = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    key: key as TaskData["category"],
    ...cfg,
    tasks: filteredTasks.filter(t => t.category === key),
  })).filter(g => g.tasks.length > 0);

  const tabs = [
    { label: "全部任务", key: "all" as const, count: tasks.length },
    { label: "每日", key: "daily" as const, count: tasks.filter(t => t.category === "daily").length },
    { label: "成长", key: "growth" as const, count: tasks.filter(t => t.category === "growth").length },
    { label: "社区", key: "community" as const, count: tasks.filter(t => t.category === "community").length },
    { label: "内容", key: "content" as const, count: tasks.filter(t => t.category === "content").length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <WorkspacePageHeader
        title="任务中心"
        subtitle="完成每日任务，积累成长值，解锁勋章"
        icon={<Target className="w-5 h-5" />}
        breadcrumbs={[
          { label: "工作台", href: "/workspace" },
          { label: "任务中心" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={`今日进度 ${progressPercent}%`}
              variant={progressPercent === 100 ? "success" : "info"}
              dot
              pulse={progressPercent < 100}
            />
            <Link
              href="/dashboard/points"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              积分明细
            </Link>
          </div>
        }
        tabs={tabs.map(t => ({
          label: `${t.label} (${t.count})`,
          active: activeTab === t.key,
          onClick: () => setActiveTab(t.key),
        }))}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Hero: Level + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Level Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                  {levelInfo?.level?.iconText || "⭐"}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{levelInfo?.level?.name || "Lv.1 新手"}</div>
                  <div className="text-sm text-white/80">成长值 {levelInfo?.growthValue || 0}</div>
                </div>
                {levelInfo?.nextLevel && (
                  <div className="text-right text-xs text-white/70">
                    <div>→ {levelInfo.nextLevel.iconText} {levelInfo.nextLevel.name}</div>
                    <div className="font-medium text-white">还需 {levelInfo.nextLevel.minGrowth - (levelInfo?.growthValue || 0)}</div>
                  </div>
                )}
              </div>
              {levelInfo?.nextLevel && (
                <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-white/90 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((levelInfo.growthValue - (levelInfo.level?.minGrowth || 0)) /
                        (levelInfo.nextLevel.minGrowth - (levelInfo.level?.minGrowth || 0))) * 100, 100
                      )}%`,
                    }}
                  />
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>今日完成 <span className="font-bold text-white">{completedCount}</span> / {totalCount} 个任务</span>
                {totalReward > 0 && <span className="text-white/70">还可获得 +{totalReward} 成长值</span>}
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <MetricCard
            label="已完成任务"
            value={`${completedCount}/${totalCount}`}
            icon={<CheckCircle className="w-5 h-5" />}
            trend={completedCount > 0 ? { value: `${progressPercent}% 完成率`, positive: true } : undefined}
          />
          <MetricCard
            label="待获成长值"
            value={`+${totalReward}`}
            icon={<Flame className="w-5 h-5" />}
            trend={totalReward > 0 ? { value: `${tasks.filter(t => !t.completed).length} 个任务待完成`, positive: false } : undefined}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ActionCard
            title="每日签到"
            description="签到获取积分和成长值，连续签到奖励更多"
            icon={<CalendarCheck className="w-5 h-5" />}
            badge="+2 成长值"
            onClick={handleCheckin}
          />
          <ActionCard
            title="查看成长记录"
            description="了解你的成长轨迹和等级变化"
            icon={<TrendingUp className="w-5 h-5" />}
            href="/dashboard/points"
          />
          <ActionCard
            title="我的勋章"
            description="查看已获得的勋章和待解锁成就"
            icon={<Award className="w-5 h-5" />}
            href="/dashboard"
          />
        </div>

        {/* All completed celebration */}
        {completedCount === totalCount && totalCount > 0 && (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-200 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-green-800 text-lg mb-1">全部任务已完成！🎉</h3>
            <p className="text-sm text-green-600">太棒了！你今天的任务已全部完成，明天继续加油！</p>
          </div>
        )}

        {/* Task groups by category */}
        {grouped.map((group) => {
          const GroupIcon = group.icon;
          const completedInGroup = group.tasks.filter(t => t.completed).length;
          const groupProgress = Math.round((completedInGroup / group.tasks.length) * 100);

          return (
            <SectionCard
              key={group.key}
              title={group.label}
              subtitle={`${completedInGroup}/${group.tasks.length} 已完成`}
              action={
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={`${groupProgress}%`}
                    variant={groupProgress === 100 ? "success" : "info"}
                    size="sm"
                  />
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${group.color}`}>
                    <GroupIcon className="w-3.5 h-3.5" />
                    {group.label}
                  </span>
                </div>
              }
            >
              <div className="space-y-2">
                {group.tasks.map((task) => {
                  const ActionIcon = TASK_ACTION_ICONS[task.actionType] || Target;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        task.completed
                          ? "border-green-200 bg-green-50/50"
                          : "border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        task.completed ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <ActionIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${task.completed ? "text-green-700 line-through" : "text-gray-900"}`}>
                            {task.title}
                          </span>
                          {task.badgeName && (
                            <StatusBadge
                              label={task.badgeName}
                              variant="processing"
                              size="sm"
                              icon={<span className="text-[10px]">🎖️</span>}
                            />
                          )}
                          {task.completed && (
                            <StatusBadge label="已完成" variant="success" size="sm" dot />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                          <span className="inline-flex items-center gap-0.5 text-amber-500 font-medium">
                            <Zap className="w-3 h-3" />
                            +{task.rewardGrowth} 成长值
                          </span>
                          {task.count > 0 && (
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              已完成 {task.count} 次
                            </span>
                          )}
                        </div>
                      </div>

                      {task.completed ? (
                        <StatusBadge label="✓" variant="success" size="sm" />
                      ) : task.key === "daily_checkin" ? (
                        <button
                          onClick={handleCheckin}
                          disabled={signingIn === "daily_checkin"}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors shrink-0 disabled:opacity-50 shadow-sm"
                        >
                          {signingIn === "daily_checkin" ? <><Loader2 className="w-3 h-3 animate-spin" /> 签到中...</> : <>签到 <ArrowRight className="w-3 h-3" /></>}
                        </button>
                      ) : (
                        <Link href={task.targetUrl} className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors shrink-0 shadow-sm">
                          去完成 <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          );
        })}

        {/* Explanation card */}
        <SectionCard title="积分、成长值、勋章的关系" subtitle="了解社区激励体系">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm">⭐</div>
                <div className="font-semibold text-amber-800 text-sm">积分</div>
              </div>
              <div className="text-xs text-amber-700">通过签到、完成任务获取，用于兑换站内权益。可消费。</div>
            </div>
            <div className="rounded-lg bg-teal-50 border border-teal-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-sm">📈</div>
                <div className="font-semibold text-teal-800 text-sm">成长值</div>
              </div>
              <div className="text-xs text-teal-700">通过社区互动获取，用于提升社区等级。不可消费，仅增不减。</div>
            </div>
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-sm">🎖️</div>
                <div className="font-semibold text-purple-800 text-sm">勋章</div>
              </div>
              <div className="text-xs text-purple-700">完成特定任务后自动获得，用于身份展示。</div>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">👑</div>
                <div className="font-semibold text-blue-800 text-sm">会员</div>
              </div>
              <div className="text-xs text-blue-700">未来权益入口，更多高级功能和专属服务。</div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function getFallbackTasks(): TaskData[] {
  return [
    { id: "t1", key: "workspace_visit", title: "访问工作台", description: "每天访问一次工作台，积累活跃度", rewardGrowth: 2, actionType: "workspace_visit", targetUrl: "/workspace", category: "daily", sortOrder: 1, completed: false, count: 0 },
    { id: "t2", key: "daily_checkin", title: "每日签到", description: "每天签到一次，积累积分和成长值", rewardGrowth: 2, actionType: "checkin", targetUrl: "/workspace/tasks", category: "daily", sortOrder: 0, completed: false, count: 0 },
    { id: "t3", key: "tool_review", title: "提交工具点评", description: "为你用过的工具写一条点评", rewardGrowth: 10, actionType: "tool_review", targetUrl: "/tools", category: "content", sortOrder: 2, completed: false, count: 0 },
    { id: "t4", key: "complete_profile", title: "完善公司资料", description: "创建或更新你的公司资料", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/workspace/company-profiles", category: "growth", sortOrder: 3, completed: false, count: 0 },
    { id: "t5", key: "first_document", title: "保存第一份单据", description: "使用单据工具并保存到工作台", rewardGrowth: 10, actionType: "workspace_visit", targetUrl: "/tools?cat=documents", category: "growth", sortOrder: 4, completed: false, count: 0 },
    { id: "t6", key: "favorite_tool", title: "收藏一个工具", description: "收藏一个你感兴趣的工具", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/tools", category: "growth", sortOrder: 5, completed: false, count: 0 },
  ];
}
