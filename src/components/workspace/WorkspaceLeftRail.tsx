'use client';

import Link from 'next/link';
import { Star, TrendingUp, Zap, Calendar, Award, Crown, CheckCircle2 } from 'lucide-react';
import CheckinButton from '@/components/user/CheckinButton';

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

  return (
    <aside className="w-full xl:w-[260px] space-y-3">
      {/* User Identity Card */}
      <div className="bg-gradient-to-br from-[#0A1D6B] via-[#0d2580] to-[#1a3a9f] rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
        
        <div className="relative">
          {/* Avatar placeholder */}
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-white/30">
            <span className="text-xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
          </div>
          
          <h2 className="text-base font-bold truncate mb-0.5">{displayName}</h2>
          <p className="text-white/60 text-[11px] truncate mb-3">{email}</p>
          
          {isMember && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-semibold rounded-full border border-amber-400/30 mb-3">
              <Crown className="w-3 h-3" />
              会员
            </span>
          )}
          
          {/* Level Badge */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold text-xs">{levelLabel}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
              <span>成长进度</span>
              <span>{progressToNext}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            {nextLevelKey && (
              <p className="text-[10px] text-white/50 mt-1">
                距下一级还需 {remainingToNext} 成长值
              </p>
            )}
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg font-bold">{points}</p>
              <p className="text-[10px] text-white/60">积分</p>
            </div>
            <div className="text-center border-l border-r border-white/10">
              <p className="text-lg font-bold">{checkinStreak}</p>
              <p className="text-[10px] text-white/60">连续</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{badgeCount}</p>
              <p className="text-[10px] text-white/60">勋章</p>
            </div>
          </div>
        </div>
      </div>

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
    </aside>
  );
}
