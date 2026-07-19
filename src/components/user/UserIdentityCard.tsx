'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Crown, TrendingUp } from 'lucide-react';

/**
 * User Identity System - 统一用户身份展示组件
 * 
 * 用于全站统一的用户信息展示：
 * - Workspace 用户信息卡
 * - Forum 用户信息
 * - 排行榜用户展示
 * - 评论区用户信息
 * 
 * 支持三种尺寸：
 * - lg: 完整信息卡（头像、昵称、邮箱、等级、进度条、统计数据）
 * - md: 简化信息卡（头像、昵称、等级、积分）
 * - sm: 紧凑信息卡（头像、昵称、等级）
 */

export interface UserDisplayData {
  // 基础信息
  displayName: string;
  email?: string;
  avatarUrl?: string;
  
  // 等级信息
  levelKey: string;
  levelLabel: string;
  growthValue: number;
  progressToNext?: number;
  remainingToNext?: number;
  nextLevelKey?: string | null;
  
  // 积分与状态
  points: number;
  checkinStreak?: number;
  badgeCount?: number;
  isMember: boolean;
  
  // 可选扩展
  memberUntil?: string | null;
}

export interface UserIdentityCardProps {
  user: UserDisplayData;
  size?: 'lg' | 'md' | 'sm';
  showCheckin?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  href?: string; // 如果提供，整个卡片可点击
  className?: string;
}

// 等级颜色配置
const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  lv1: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  lv2: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  lv3: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  lv4: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  lv5: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function UserIdentityCard({
  user,
  size = 'md',
  showCheckin = false,
  showProgress = true,
  showStats = true,
  href,
  className = '',
}: UserIdentityCardProps) {
  const {
    displayName,
    email,
    avatarUrl,
    levelLabel,
    levelKey,
    growthValue,
    progressToNext = 0,
    remainingToNext,
    nextLevelKey,
    points,
    checkinStreak = 0,
    badgeCount = 0,
    isMember,
  } = user;

  const levelColor = LEVEL_COLORS[levelKey] || LEVEL_COLORS.lv1;

  // 头像组件
  const Avatar = ({ sizeClass }: { sizeClass: string }) => (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{displayName.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );

  // 会员徽章
  const MemberBadge = () => isMember ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-semibold rounded-full border border-amber-400/30">
      <Crown className="w-3 h-3" />
      会员
    </span>
  ) : null;

  // 等级徽章
  const LevelBadge = ({ compact = false }: { compact?: boolean }) => (
    <div className={`inline-flex items-center gap-1 ${compact ? 'px-2 py-0.5' : 'px-2.5 py-1'} ${levelColor.bg} ${levelColor.text} ${levelColor.border} border rounded-full`}>
      <Star className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      <span className={`font-semibold ${compact ? 'text-[10px]' : 'text-xs'}`}>{levelLabel}</span>
    </div>
  );

  // 内容区域
  const content = (() => {
    switch (size) {
      case 'sm':
        // 紧凑模式：头像 + 昵称 + 等级
        return (
          <div className="flex items-center gap-2">
            <Avatar sizeClass="w-8 h-8 text-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              <div className="mt-0.5">
                <LevelBadge compact />
              </div>
            </div>
            {isMember && <MemberBadge />}
          </div>
        );

      case 'lg':
        // 完整模式：所有信息
        return (
          <div className="bg-gradient-to-br from-[#0A1D6B] via-[#0d2580] to-[#1a3a9f] rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
            {/* 装饰元素 */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
            
            <div className="relative">
              {/* 头像 */}
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-white/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              {/* 昵称和邮箱 */}
              <h2 className="text-base font-bold truncate mb-0.5">{displayName}</h2>
              {email && <p className="text-white/60 text-[11px] truncate mb-3">{email}</p>}
              
              {/* 会员徽章 */}
              {isMember && (
                <div className="mb-3">
                  <MemberBadge />
                </div>
              )}
              
              {/* 等级 */}
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 mb-3">
                <Star className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold text-xs">{levelLabel}</span>
              </div>
              
              {/* 进度条 */}
              {showProgress && progressToNext > 0 && (
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
                  {nextLevelKey && remainingToNext !== undefined && (
                    <p className="text-[10px] text-white/50 mt-1">
                      距下一级还需 {remainingToNext} 成长值
                    </p>
                  )}
                </div>
              )}
              
              {/* 统计数据 */}
              {showStats && (
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
              )}
            </div>
          </div>
        );

      case 'md':
      default:
        // 标准模式：头像 + 昵称 + 等级 + 积分
        return (
          <div className={`bg-white rounded-xl border border-gray-100 p-4 ${className}`}>
            <div className="flex items-start gap-3">
              <Avatar sizeClass="w-12 h-12 text-lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  {isMember && <MemberBadge />}
                </div>
                {email && <p className="text-xs text-gray-500 truncate mb-2">{email}</p>}
                <div className="flex items-center gap-3">
                  <LevelBadge />
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>{growthValue}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 进度条 */}
            {showProgress && progressToNext > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                  <span>成长进度</span>
                  <span>{progressToNext}%</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* 统计数据 */}
            {showStats && (
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{points}</p>
                  <p className="text-[10px] text-gray-500">积分</p>
                </div>
                <div className="text-center border-l border-r border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{checkinStreak}</p>
                  <p className="text-[10px] text-gray-500">连续</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{badgeCount}</p>
                  <p className="text-[10px] text-gray-500">勋章</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  })();

  // 如果提供 href，整个卡片可点击
  if (href) {
    return (
      <Link href={href} className="block hover:shadow-md transition-shadow">
        {content}
      </Link>
    );
  }

  return content;
}
