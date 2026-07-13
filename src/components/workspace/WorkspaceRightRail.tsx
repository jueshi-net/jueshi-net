'use client';

import Link from 'next/link';
import { Bell, Award, FileText, TrendingUp, Gift } from 'lucide-react';

interface WorkspaceRightRailProps {
  unreadNotifs: number;
  badgeCount: number;
  recentMemos: any[];
  userId: string;
}

export default function WorkspaceRightRail({
  unreadNotifs,
  badgeCount,
  recentMemos,
  userId,
}: WorkspaceRightRailProps) {
  return (
    <aside className="w-[300px] border-l border-[#E8ECF3] bg-[#F6F8FC]">
      <div className="sticky top-14 h-[calc(100vh-3.5rem-4rem)] overflow-y-auto py-5 px-4 pb-8 space-y-4">
        {/* Notifications */}
        <section className="bg-[#F6F8FC] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-[#11142D]">通知提醒</h3>
            {unreadNotifs > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[11px] rounded-full font-medium">
                {unreadNotifs}
              </span>
            )}
          </div>
          <Link
            href="/workspace/notifications"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-[#6C5DD3]/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-[#6C5DD3]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#11142D]">
                {unreadNotifs > 0 ? `${unreadNotifs} 条未读通知` : '暂无新通知'}
              </p>
              <p className="text-[11px] text-[#808191]">点击查看详情</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#808191] flex-shrink-0" />
          </Link>
        </section>

        {/* Badges */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-[#11142D]">成长路径</h3>
            <Link href="/workspace/member" className="text-[11px] text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
              查看全部
            </Link>
          </div>
          <Link
            href="/workspace/member"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-[#11142D]">{badgeCount}</p>
              <p className="text-[11px] text-[#808191]">已获勋章</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          </Link>
        </section>

        {/* Quick Stats */}
        <section className="bg-[#F6F8FC] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#11142D] mb-3">快速统计</h3>
          <div className="space-y-1.5">
            <Link
              href="/workspace/documents"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6C5DD3]" />
                <span className="text-[13px] text-[#11142D]">我的单据</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#808191]" />
            </Link>
            <Link
              href="/workspace/task-chains"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3F8CFF]" />
                <span className="text-[13px] text-[#11142D]">任务链</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#808191]" />
            </Link>
            <Link
              href="/workspace/invites"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#FF754C]" />
                <span className="text-[13px] text-[#11142D]">邀请奖励</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#808191]" />
            </Link>
          </div>
        </section>

        {/* Recent Memos */}
        {recentMemos.length > 0 && (
          <section className="bg-[#F6F8FC] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-[#11142D]">最近备忘录</h3>
              <Link href="/workspace/memos" className="text-[11px] text-[#6C5DD3] hover:text-[#5b4fc4] font-medium">
                查看全部
              </Link>
            </div>
            <div className="space-y-1.5">
              {recentMemos.slice(0, 3).map((memo) => (
                <Link
                  key={memo.id}
                  href={`/workspace/memos/${memo.id}`}
                  className="block p-2.5 rounded-lg hover:bg-white transition-colors"
                >
                  <p className="text-[13px] font-medium text-[#11142D] truncate">{memo.title}</p>
                  <p className="text-[11px] text-[#808191] mt-0.5">
                    {new Date(memo.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
