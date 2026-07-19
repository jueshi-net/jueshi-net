'use client';

import Link from 'next/link';
import { Bell, FileText, TrendingUp, Gift, ArrowRight, Building2, CheckSquare, Circle, StickyNote } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
}

interface CompanyProfile {
  id: string;
  companyName?: string | null;
  companyNameEn?: string | null;
  contactName?: string | null;
  email?: string | null;
}

interface Memo {
  id: string;
  title: string;
  updatedAt: Date;
}

interface WorkspaceRightRailProps {
  unreadNotifs: number;
  tasks?: Task[];
  profiles?: CompanyProfile[];
  recentMemos?: Memo[];
  badgeCount?: number;
  userId?: string;
  hiddenSections?: string[];
}

export default function WorkspaceRightRail({
  unreadNotifs,
  tasks = [],
  profiles = [],
  recentMemos = [],
  badgeCount,
  userId,
  hiddenSections = [],
}: WorkspaceRightRailProps) {
  const showNotifications = !hiddenSections.includes('notifications');
  const showMemos = !hiddenSections.includes('memos');

  return (
    <aside className="w-full lg:w-[280px] space-y-3">
      {/* Notifications */}
      {showNotifications && (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">通知</h3>
          {unreadNotifs > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-medium">
              {unreadNotifs}
            </span>
          )}
        </div>
        <Link
          href="/workspace/notifications"
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[#6C5DD3]/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-[#6C5DD3]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {unreadNotifs > 0 ? `${unreadNotifs} 条未读通知` : '暂无新通知'}
            </p>
            <p className="text-[11px] text-gray-500">点击查看详情</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
      </div>
      )}

      {/* Today Tasks */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">今日待办</h3>
          <Link href="/workspace/tasks" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
            全部
          </Link>
        </div>
        {tasks.length === 0 ? (
          <div className="p-4 text-center">
            <CheckSquare className="w-7 h-7 text-gray-200 mx-auto mb-1.5" />
            <p className="text-xs text-gray-400">今天没有待办</p>
            <Link href="/workspace/tasks" className="text-[11px] text-[#6C5DD3] font-medium mt-1 inline-block">
              + 新建任务
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-2.5 px-4 py-2.5">
                <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-900 truncate">{task.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Profiles */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">公司资料</h3>
          <Link href="/workspace/company-profiles" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
            管理
          </Link>
        </div>
        {profiles.length === 0 ? (
          <Link
            href="/workspace/company-profiles"
            className="block p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-7 h-7 text-gray-200 mx-auto mb-1.5" />
            <p className="text-xs text-gray-400">还没有公司资料</p>
            <p className="text-[11px] text-[#6C5DD3] font-medium mt-1">+ 创建公司</p>
          </Link>
        ) : (
          <div className="divide-y divide-gray-50">
            {profiles.slice(0, 3).map((profile) => (
              <Link
                key={profile.id}
                href="/workspace/company-profiles"
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate">
                    {profile.companyName || profile.companyNameEn || "未命名"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {profile.contactName || profile.email || ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Memos */}
      {showMemos && recentMemos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">备忘录</h3>
            <Link href="/workspace/memos" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
              全部
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMemos.slice(0, 3).map((memo) => (
              <Link
                key={memo.id}
                href={`/workspace/memos/${memo.id}`}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <StickyNote className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{memo.title}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(memo.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
