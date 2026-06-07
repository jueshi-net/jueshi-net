"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, CheckCircle, ArrowRight, CalendarCheck, FileText, Heart, Building2, Gift } from "lucide-react";

const DEFAULT_TASKS = [
  { key: "workspace_visit", title: "访问工作台", url: "/workspace", icon: Target },
  { key: "complete_profile", title: "完善公司资料", url: "/workspace/company-profiles", icon: Building2 },
  { key: "first_document", title: "创建第一份单据", url: "/tools?cat=documents", icon: FileText },
  { key: "favorite_tool", title: "收藏一个工具", url: "/tools", icon: Heart },
  { key: "daily_checkin", title: "每日签到", url: "/workspace/tasks", icon: CalendarCheck },
];

export default function TasksClient() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/growth-tasks/summary")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          setTasks(d.tasks || DEFAULT_TASKS);
        } else {
          setTasks(DEFAULT_TASKS.map(t => ({ ...t, completed: false })));
        }
      })
      .catch(() => setTasks(DEFAULT_TASKS.map(t => ({ ...t, completed: false }))))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">待办与任务</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>暂无待办任务</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task, i) => (
              <Link key={i} href={task.url} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors min-h-[56px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? "bg-green-100 text-green-600" : "bg-teal-50 text-teal-600"}`}>
                  {task.completed ? <CheckCircle className="w-5 h-5" /> : (() => { const Icon = task.icon; return Icon ? <Icon className="w-5 h-5" /> : <Target className="w-5 h-5" />; })()}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</p>
                  <p className="text-xs text-gray-400">{task.completed ? "已完成" : "去完成"}</p>
                </div>
                {!task.completed && <ArrowRight className="w-4 h-4 text-gray-300" />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
