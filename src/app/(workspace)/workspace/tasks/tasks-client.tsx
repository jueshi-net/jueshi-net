"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CheckCircle, ArrowRight, Target, Gift,
  Sparkles, MessageSquare, CalendarCheck, Globe, Loader2,
} from "lucide-react";

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

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof CalendarCheck }> = {
  daily: { label: "每日任务", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CalendarCheck },
  growth: { label: "成长任务", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Sparkles },
  community: { label: "社区任务", color: "bg-teal-50 text-teal-700 border-teal-200", icon: MessageSquare },
  content: { label: "内容任务", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Gift },
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
            // Fallback: static placeholder tasks
            setTasks([
              { id: "t1", key: "workspace_visit", title: "访问工作台", description: "每天访问一次工作台，积累活跃度", rewardGrowth: 2, actionType: "workspace_visit", targetUrl: "/workspace", category: "daily", sortOrder: 1, completed: false, count: 0 },
              { id: "t2", key: "daily_checkin", title: "每日签到", description: "每天签到一次，积累积分和成长值", rewardGrowth: 2, actionType: "checkin", targetUrl: "/workspace/tasks", category: "daily", sortOrder: 0, completed: false, count: 0 },
              { id: "t3", key: "tool_review", title: "提交工具点评", description: "为你用过的工具写一条点评", rewardGrowth: 10, actionType: "tool_review", targetUrl: "/tools", category: "content", sortOrder: 2, completed: false, count: 0 },
              { id: "t4", key: "complete_profile", title: "完善公司资料", description: "创建或更新你的公司资料", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/workspace/company-profiles", category: "growth", sortOrder: 3, completed: false, count: 0 },
              { id: "t5", key: "first_document", title: "保存第一份单据", description: "使用单据工具并保存到工作台", rewardGrowth: 10, actionType: "workspace_visit", targetUrl: "/tools?cat=documents", category: "growth", sortOrder: 4, completed: false, count: 0 },
              { id: "t6", key: "favorite_tool", title: "收藏一个工具", description: "收藏一个你感兴趣的工具", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/tools", category: "growth", sortOrder: 5, completed: false, count: 0 },
            ]);
          }
        } else {
          setTasks([
            { id: "t1", key: "workspace_visit", title: "访问工作台", description: "每天访问一次工作台", rewardGrowth: 2, actionType: "workspace_visit", targetUrl: "/workspace", category: "daily", sortOrder: 1, completed: false, count: 0 },
            { id: "t2", key: "daily_checkin", title: "每日签到", description: "每天签到一次", rewardGrowth: 2, actionType: "checkin", targetUrl: "/workspace/tasks", category: "daily", sortOrder: 0, completed: false, count: 0 },
            { id: "t3", key: "complete_profile", title: "完善公司资料", description: "创建或更新你的公司资料", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/workspace/company-profiles", category: "growth", sortOrder: 2, completed: false, count: 0 },
            { id: "t4", key: "first_document", title: "保存第一份单据", description: "使用单据工具并保存到工作台", rewardGrowth: 10, actionType: "workspace_visit", targetUrl: "/tools?cat=documents", category: "growth", sortOrder: 3, completed: false, count: 0 },
            { id: "t5", key: "favorite_tool", title: "收藏一个工具", description: "收藏一个你感兴趣的工具", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/tools", category: "growth", sortOrder: 4, completed: false, count: 0 },
          ]);
        }
      })
      .catch(() => {
        setTasks([
          { id: "t1", key: "workspace_visit", title: "访问工作台", description: "每天访问一次工作台", rewardGrowth: 2, actionType: "workspace_visit", targetUrl: "/workspace", category: "daily", sortOrder: 1, completed: false, count: 0 },
          { id: "t2", key: "daily_checkin", title: "每日签到", description: "每天签到一次", rewardGrowth: 2, actionType: "checkin", targetUrl: "/workspace/tasks", category: "daily", sortOrder: 0, completed: false, count: 0 },
          { id: "t3", key: "complete_profile", title: "完善公司资料", description: "创建或更新你的公司资料", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/workspace/company-profiles", category: "growth", sortOrder: 2, completed: false, count: 0 },
          { id: "t4", key: "first_document", title: "保存第一份单据", description: "使用单据工具并保存到工作台", rewardGrowth: 10, actionType: "workspace_visit", targetUrl: "/tools?cat=documents", category: "growth", sortOrder: 3, completed: false, count: 0 },
          { id: "t5", key: "favorite_tool", title: "收藏一个工具", description: "收藏一个你感兴趣的工具", rewardGrowth: 5, actionType: "workspace_visit", targetUrl: "/tools", category: "growth", sortOrder: 4, completed: false, count: 0 },
        ]);
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

  const grouped = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
    key: key as TaskData["category"],
    ...cfg,
    tasks: tasks.filter(t => t.category === key),
  })).filter(g => g.tasks.length > 0);

  return (
    <div className="space-y-4">
      {/* Level progress */}
      {levelInfo && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{levelInfo.level?.iconText || "⭐"}</div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">{levelInfo.level?.name || "Lv.1 新手"}</div>
              <div className="text-xs text-gray-500">成长值 {levelInfo.growthValue}</div>
            </div>
            {levelInfo.nextLevel && (
              <div className="text-right text-xs text-gray-500">
                <div>距离 {levelInfo.nextLevel.iconText} {levelInfo.nextLevel.name}</div>
                <div className="font-medium text-amber-600">还需 {levelInfo.nextLevel.minGrowth - levelInfo.growthValue} 成长值</div>
              </div>
            )}
          </div>
          {levelInfo.nextLevel && (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((levelInfo.growthValue - (levelInfo.level?.minGrowth || 0)) /
                    (levelInfo.nextLevel.minGrowth - (levelInfo.level?.minGrowth || 0))) * 100, 100
                  )}%`,
                }}
              />
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              已完成 <span className="font-bold text-green-600">{completedCount}</span> / {totalCount} 个任务
            </span>
          </div>
        </div>
      )}

      {/* All completed */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5 mb-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-green-800 text-lg">全部任务已完成！🎉</h3>
        </div>
      )}

      {/* Task groups by category */}
      {grouped.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.key} className="mb-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mb-3 ${group.color}`}>
              <GroupIcon className="w-4 h-4" />
              {group.label}
            </div>
            <div className="space-y-2">
              {group.tasks.map((task) => {
                const ActionIcon = TASK_ACTION_ICONS[task.actionType] || Target;
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                      task.completed ? "border-green-200 bg-green-50/30" : "border-gray-200 hover:border-teal-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                          <span className={`font-semibold text-sm ${task.completed ? "text-green-700 line-through" : "text-gray-900"}`}>
                            {task.title}
                          </span>
                          {task.badgeName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                              🎖️ {task.badgeName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-amber-500 font-medium">+{task.rewardGrowth}</span> 成长值
                          </span>
                          {task.count > 0 && <span>已完成 {task.count} 次</span>}
                        </div>
                      </div>

                      {task.completed ? (
                        <span className="text-xs text-green-600 font-medium shrink-0 flex items-center gap-1 min-h-[44px]">✓ 已完成</span>
                      ) : task.key === "daily_checkin" ? (
                        <button
                          onClick={handleCheckin}
                          disabled={signingIn === "daily_checkin"}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors shrink-0 min-h-[44px] disabled:opacity-50"
                        >
                          {signingIn === "daily_checkin" ? <><Loader2 className="w-3 h-3 animate-spin" /> 签到中...</> : <>去签到 <ArrowRight className="w-3 h-3" /></>}
                        </button>
                      ) : (
                        <Link href={task.targetUrl} className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors shrink-0 min-h-[44px]">
                          去完成 <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Explanation card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-500" />
          积分、成长值、勋章的关系
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
            <div className="font-semibold text-amber-800 text-sm mb-1">⭐ 积分</div>
            <div className="text-xs text-amber-700">通过签到、完成任务获取，用于兑换站内权益。可消费。</div>
          </div>
          <div className="rounded-lg bg-teal-50 border border-teal-100 p-4">
            <div className="font-semibold text-teal-800 text-sm mb-1">📈 成长值</div>
            <div className="text-xs text-teal-700">通过社区互动获取，用于提升社区等级。不可消费，仅增不减。</div>
          </div>
          <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
            <div className="font-semibold text-purple-800 text-sm mb-1">🎖️ 勋章</div>
            <div className="text-xs text-purple-700">完成特定任务后自动获得，用于身份展示。</div>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <div className="font-semibold text-blue-800 text-sm mb-1">👑 会员</div>
            <div className="text-xs text-blue-700">未来权益入口，更多高级功能和专属服务。</div>
          </div>
        </div>
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
