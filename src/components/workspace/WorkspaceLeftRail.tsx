'use client';

import Link from 'next/link';
import { Award, CheckCircle2 } from 'lucide-react';
import CheckinButton from '@/components/user/CheckinButton';
import UserIdentityCard, { UserDisplayData } from '@/components/user/UserIdentityCard';

interface WorkspaceLeftRailProps {
  displayName: string;
  email: string;
  levelLabel: string;
  growthValue: number;
  points: number;
  checkinStreak: number;
  badgeCount: number;
  isMember: boolean;
  userId: string;
  lastCheckinDate?: string | null;
  progressToNext: number;
  remainingToNext: number;
  nextLevelKey: string | null;
}

export default function WorkspaceLeftRail({
  displayName,
  email,
  levelLabel,
  growthValue,
  points,
  checkinStreak,
  badgeCount,
  isMember,
  userId,
  lastCheckinDate,
  progressToNext,
  remainingToNext,
  nextLevelKey,
}: WorkspaceLeftRailProps) {
  const todayChecked = lastCheckinDate === new Date().toISOString().split('T')[0];

  // 构建用户数据
  const userDisplayData: UserDisplayData = {
    displayName,
    email,
    levelLabel,
    levelKey: levelLabel.split(' ')[0]?.toLowerCase() || 'lv1',
    growthValue,
    points,
    checkinStreak,
    badgeCount,
    isMember,
    progressToNext,
    remainingToNext,
    nextLevelKey,
  };

  return (
    <div className="space-y-3">
      {/* 用户身份卡 - 使用公共组件 */}
      <UserIdentityCard 
        user={userDisplayData} 
        size="lg" 
        showProgress={true}
        showStats={true}
      />

      {/* Checkin Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">每日签到</h3>
          {todayChecked && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              已完成
            </span>
          )}
        </div>
        <CheckinButton
          userId={userId}
          lastCheckinDate={lastCheckinDate}
          checkinStreak={checkinStreak}
        />
        <p className="text-[11px] text-gray-500 mt-2">每日签到可获得 5 积分 + 2 成长值</p>
      </div>

      {/* Badges Card */}
      <Link href="/workspace/member" className="block">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{badgeCount}</p>
              <p className="text-[11px] text-gray-500">已获勋章</p>
            </div>
          </div>
          <p className="text-[11px] text-[#6C5DD3] mt-2 font-medium">查看全部勋章 →</p>
        </div>
      </Link>
    </div>
  );
}
