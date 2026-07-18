'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Circle, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
}

interface TodayTasksProps {
  initialTasks?: Task[];
  embedded?: boolean;
}

export default function TodayTasks({ initialTasks = [], embedded = false }: TodayTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTasks.length === 0) {
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks?status=pending&limit=5');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });
      
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('完成任务失败:', error);
    }
  };

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    normal: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const priorityLabels = {
    high: '高',
    normal: '中',
    low: '低',
  };

  if (loading) {
    return (
      <div className={embedded ? "p-4" : "bg-white rounded-xl border border-gray-100 p-4"}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={embedded ? "p-6 text-center" : "bg-white rounded-xl border border-gray-100 p-6 text-center"}>
        <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-1">今天还没有待办</p>
        <p className="text-xs text-gray-400 mb-3">创建一个任务，或从推荐任务开始</p>
        <div className="flex flex-col gap-2">
          <Link 
            href="/workspace/tasks" 
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700"
          >
            <Plus className="w-3 h-3" />
            新建待办
          </Link>
          <Link 
            href="/workspace/member" 
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs hover:bg-gray-100"
          >
            查看成长任务
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "bg-white rounded-xl border border-gray-100 overflow-hidden"}>
      <div className="divide-y divide-gray-50">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-gray-50/50 transition-colors">
            <button
              onClick={() => completeTask(task.id)}
              className="flex-shrink-0 text-gray-300 hover:text-teal-600 transition-colors"
              title="标记为完成"
            >
              <Circle className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 truncate">{task.title}</div>
              {task.dueDate && (
                <div className="text-xs text-gray-400 mt-0.5">
                  截止: {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                </div>
              )}
            </div>
            <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.normal}`}>
              {priorityLabels[task.priority as keyof typeof priorityLabels] || '中'}
            </span>
          </div>
        ))}
      </div>
      {!embedded && (
        <div className="border-t border-gray-100 p-2 bg-gray-50/50">
          <Link 
            href="/workspace/tasks" 
            className="flex items-center justify-center gap-1 text-xs text-teal-600 hover:text-teal-700 py-1"
          >
            查看全部 <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
