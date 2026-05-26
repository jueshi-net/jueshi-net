"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, ArrowRight, CheckCircle, CalendarCheck, MessageSquare, Gift } from "lucide-react";
import { cardStyles } from "@/lib/ui-styles";

export default function GrowthTaskSummary() {
  const [tasks, setTasks] = useState<{ key: string; title: string; completed: boolean; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    fetch("/api/growth-tasks/summary")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          setTasks(d.tasks || []);
          setCompletedCount(d.completedCount || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse bg-white rounded-xl border p-5 h-28" />;

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const allDone = pendingTasks.length === 0 && tasks.length > 0;

  return (
    <div className={cardStyles.base}>
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600" />
          <h2 className="text-sm font-bold text-gray-700">今日成长任务</h2>
          <span className="text-xs text-gray-400">
            {completedCount}/{tasks.length} 已完成
          </span>
        </div>
        <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 px-3 py-2 text-sm text-teal-600 hover:text-teal-700 min-h-[44px]">
          查看全部 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-5">
        {allDone ? (
          <div className="text-center py-3">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">今天的成长任务已完成！🎉</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">暂无任务</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingTasks.map(task => (
              <Link
                key={task.key}
                href={task.url}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-teal-50 transition-all min-h-[44px]"
              >
                <TaskIcon taskKey={task.key} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">{task.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskIcon({ taskKey }: { taskKey: string }) {
  if (taskKey === "daily_checkin") return <CalendarCheck className="w-5 h-5 text-blue-500 shrink-0" />;
  if (taskKey === "tool_review_approved") return <Gift className="w-5 h-5 text-amber-500 shrink-0" />;
  if (taskKey === "forum_post_published" || taskKey === "forum_comment_published") return <MessageSquare className="w-5 h-5 text-teal-500 shrink-0" />;
  if (taskKey === "workspace_visit") return <Target className="w-5 h-5 text-emerald-500 shrink-0" />;
  return <Target className="w-5 h-5 text-gray-400 shrink-0" />;
}
