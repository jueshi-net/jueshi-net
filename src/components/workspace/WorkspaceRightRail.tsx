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
    <aside className="hidden xl:block w-80 flex-shrink-0 border-l border-[#E8ECF3] bg-white">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-6 space-y-6">
        {/* Notifications */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#11142D]">通知提醒</h3>
            {unreadNotifs > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadNotifs}
              </span>
            )}
          </div>
          <Link
            href="/workspace/notifications"
            className="block p-4 bg-[#F6F8FC] rounded-xl hover:bg-[#F3F5FA] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6C5DD3]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#6C5DD3]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#11142D]">
                  {unreadNotifs > 0 ? `${unreadNotifs} 条未读通知` : '暂无新通知'}
                </p>
                <p className="text-xs text-[#808191]">点击查看详情</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Badges */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#11142D]">成长路径</h3>
            <Link href="/workspace/member" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4]">
              查看全部
            </Link>
          </div>
          <Link
            href="/workspace/member"
            className="block p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#11142D]">{badgeCount}</p>
                <p className="text-xs text-[#808191]">已获勋章</p>
              </div>
            </div>
            {badgeCount === 0 ? (
              <p className="text-xs text-[#808191]">继续签到和使用工具来获取勋章吧！</p>
            ) : (
              <p className="text-xs text-amber-700 font-medium">查看勋章详情 →</p>
            )}
          </Link>
        </section>

        {/* Quick Stats */}
        <section>
          <h3 className="text-sm font-semibold text-[#11142D] mb-3">快速统计</h3>
          <div className="space-y-2">
            <Link
              href="/workspace/documents"
              className="flex items-center justify-between p-3 bg-[#F6F8FC] rounded-lg hover:bg-[#F3F5FA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6C5DD3]" />
                <span className="text-sm text-[#11142D]">我的单据</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#808191]" />
            </Link>
            <Link
              href="/workspace/task-chains"
              className="flex items-center justify-between p-3 bg-[#F6F8FC] rounded-lg hover:bg-[#F3F5FA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3F8CFF]" />
                <span className="text-sm text-[#11142D]">任务链</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#808191]" />
            </Link>
            <Link
              href="/workspace/invites"
              className="flex items-center justify-between p-3 bg-[#F6F8FC] rounded-lg hover:bg-[#F3F5FA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#FF754C]" />
                <span className="text-sm text-[#11142D]">邀请奖励</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#808191]" />
            </Link>
          </div>
        </section>

        {/* Recent Memos */}
        {recentMemos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#11142D]">最近备忘录</h3>
              <Link href="/workspace/memos" className="text-xs text-[#6C5DD3] hover:text-[#5b4fc4]">
                查看全部
              </Link>
            </div>
            <div className="space-y-2">
              {recentMemos.slice(0, 3).map((memo) => (
                <Link
                  key={memo.id}
                  href={`/workspace/memos/${memo.id}`}
                  className="block p-3 bg-[#F6F8FC] rounded-lg hover:bg-[#F3F5FA] transition-colors"
                >
                  <p className="text-sm font-medium text-[#11142D] truncate">{memo.title}</p>
                  <p className="text-xs text-[#808191] mt-1">
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
