'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Heart, Sparkles, TrendingUp, CheckSquare, Clock, ArrowRight } from 'lucide-react';

// Mock 用户数据
const mockUser = {
  isLoggedIn: true,
  nickname: '绝世工具玩家',
  title: '跨境探索者',
  level: 3,
  currentExp: 1280,
  nextLevelExp: 2000,
  checkinStreak: 7,
  badges: [
    { id: 1, name: '邮编达人', icon: '📮' },
    { id: 2, name: '汇率快手', icon: '💱' },
    { id: 3, name: '清单收藏家', icon: '📋' },
    { id: 4, name: '外贸新手', icon: '📦' },
    { id: 5, name: '连续签到7天', icon: '🔥' },
    { id: 6, name: '资源探索者', icon: '🧭' },
  ],
  stats: {
    favorites: 12,
    checklists: 3,
    recentUsed: 8,
    badges: 6,
  },
};

export default function JueshiV4TopNavPolishedWorkspaceCard() {
  const user = mockUser;
  const expProgress = (user.currentExp / user.nextLevelExp) * 100;

  if (!user.isLoggedIn) {
    return (
      <section className="mb-10">
        <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🦀</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-[#11142D] mb-2">
                登录后保存你的工具记录
              </h3>
              <p className="text-sm text-[#808191] mb-4">
                收藏常用工具、保存清单进度、解锁等级勋章
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
                >
                  登录 / 注册
                </Link>
                <button className="px-5 py-2.5 bg-[#F3F5FA] text-[#6C5DD3] rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/8 transition-colors">
                  先逛逛
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-[#6C5DD3] via-[#3F8CFF] to-[#6C5DD3]"></div>

        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#6C5DD3]/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#6C5DD3]" />
              </div>
              <h2 className="text-base font-bold text-[#11142D]">我的工作台</h2>
            </div>
            <Link href="/workspace" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
              查看完整工作台
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
            {/* Left: User info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center flex-shrink-0 border-3 border-white shadow-lg">
                  <span className="text-2xl">🦀</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF754C] rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-[10px] text-white font-bold">{user.level}</span>
                </div>
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-[#11142D] truncate">{user.nickname}</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-full font-medium">
                    {user.title}
                  </span>
                </div>
                <p className="text-xs text-[#808191] mb-2">连续签到 {user.checkinStreak} 天 🔥</p>

                {/* Exp progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#E8ECF3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full transition-all"
                      style={{ width: `${expProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#808191] whitespace-nowrap">
                    {user.currentExp}/{user.nextLevelExp}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Badges */}
            <div className="flex flex-col items-center gap-3 px-4 lg:px-6 lg:border-x lg:border-[#E8ECF3]">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#6C5DD3]" />
                <span className="text-xs font-semibold text-[#11142D]">荣誉勋章</span>
              </div>
              <div className="flex gap-2">
                {user.badges.slice(0, 4).map((badge) => (
                  <div
                    key={badge.id}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#F3F5FA] to-[#E8ECF3] rounded-xl text-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#808191]">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-[#FF754C]" />
                  {user.stats.favorites}
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-[#6C5DD3]" />
                  {user.stats.checklists}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#3F8CFF]" />
                  {user.stats.recentUsed}
                </span>
              </div>
            </div>

            {/* Right: Quick actions */}
            <div className="flex flex-col justify-center gap-2">
              <button className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all hover:-translate-y-0.5">
                <Sparkles className="w-4 h-4" />
                今日签到
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/favorites"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#F3F5FA] rounded-lg text-xs text-[#11142D] hover:bg-[#6C5DD3]/5 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-[#FF754C]" />
                  我的收藏
                </Link>
                <Link
                  href="/badges"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#F3F5FA] rounded-lg text-xs text-[#11142D] hover:bg-[#6C5DD3]/5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-[#6C5DD3]" />
                  勋章详情
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
