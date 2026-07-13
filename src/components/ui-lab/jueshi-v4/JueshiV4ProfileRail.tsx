'use client';

import React from 'react';
import Link from 'next/link';
import {
  Award,
  Briefcase,
  Heart,
  Sparkles,
  TrendingUp,
  CheckSquare,
  Clock,
  Star,
} from 'lucide-react';

// Mock 用户数据
const mockUser = {
  isLoggedIn: true,
  avatar: null, // 使用默认头像
  nickname: '绝世工具玩家',
  title: '跨境探索者',
  level: 3,
  currentExp: 1280,
  nextLevelExp: 2000,
  checkinStreak: 7,
  todayReward: '+10 经验',
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
  recentTasks: [
    { id: 1, name: '留学生出国前准备清单', progress: 68 },
    { id: 2, name: '集运发货清单', progress: 42 },
    { id: 3, name: '外贸报价任务链', progress: 25 },
  ],
};

export default function JueshiV4ProfileRail() {
  const user = mockUser;
  const expProgress = (user.currentExp / user.nextLevelExp) * 100;

  if (!user.isLoggedIn) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-6">
        <div className="text-center">
          {/* 默认头像 */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center">
            <span className="text-2xl">🦀</span>
          </div>
          <h3 className="text-base font-bold text-[#11142D] mb-2">
            登录后保存你的工具记录
          </h3>
          <p className="text-sm text-[#808191] mb-4">
            收藏常用工具、保存清单进度、解锁等级勋章
          </p>
          <div className="space-y-2">
            <Link
              href="/login"
              className="block w-full py-2.5 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
            >
              登录 / 注册
            </Link>
            <button className="w-full py-2.5 bg-[#F3F5FA] text-[#6C5DD3] rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/8 transition-colors">
              先逛逛
            </button>
          </div>
          {/* 权益预览 */}
          <div className="mt-4 pt-4 border-t border-[#E8ECF3]">
            <p className="text-xs text-[#808191] mb-2">登录后可享受：</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#11142D]">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#6C5DD3]" />
                保存最近使用
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#6C5DD3]" />
                收藏工具
              </div>
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#6C5DD3]" />
                清单进度
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-[#6C5DD3]" />
                勋章头衔
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 主卡片：用户信息 */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm overflow-hidden">
        {/* 头部渐变背景 */}
        <div className="h-20 bg-gradient-to-br from-[#6C5DD3]/10 to-[#3F8CFF]/10 relative">
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] border-4 border-white flex items-center justify-center shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl">🦀</span>
              )}
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="pt-10 pb-4 px-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#11142D]">{user.nickname}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-full font-medium">
                  {user.title}
                </span>
                <span className="text-xs text-[#808191]">Lv.{user.level}</span>
              </div>
            </div>
          </div>

          {/* 经验进度 */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[#808191] mb-1">
              <span>经验值</span>
              <span>{user.currentExp} / {user.nextLevelExp}</span>
            </div>
            <div className="w-full h-2 bg-[#E8ECF3] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full transition-all"
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 签到卡片 */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-sm font-semibold text-[#11142D]">今日签到</span>
          </div>
          <span className="text-xs text-[#808191]">连续 {user.checkinStreak} 天</span>
        </div>
        <button className="w-full py-2.5 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-shadow">
          立即签到 <span className="ml-1 text-xs opacity-80">{user.todayReward}</span>
        </button>
      </div>

      {/* 荣誉勋章 */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-sm font-semibold text-[#11142D]">荣誉勋章</span>
          </div>
          <Link href="/badges" className="text-xs text-[#6C5DD3] hover:underline">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {user.badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1 p-2 bg-[#F3F5FA] rounded-xl hover:bg-[#6C5DD3]/5 transition-colors cursor-pointer"
              title={badge.name}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-[10px] text-[#808191] text-center line-clamp-1">
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#6C5DD3]" />
          <span className="text-sm font-semibold text-[#11142D]">数据统计</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-[#F3F5FA] rounded-xl text-center">
            <div className="text-lg font-bold text-[#6C5DD3]">{user.stats.favorites}</div>
            <div className="text-xs text-[#808191]">收藏工具</div>
          </div>
          <div className="p-3 bg-[#F3F5FA] rounded-xl text-center">
            <div className="text-lg font-bold text-[#6C5DD3]">{user.stats.checklists}</div>
            <div className="text-xs text-[#808191]">完成清单</div>
          </div>
          <div className="p-3 bg-[#F3F5FA] rounded-xl text-center">
            <div className="text-lg font-bold text-[#6C5DD3]">{user.stats.recentUsed}</div>
            <div className="text-xs text-[#808191]">最近使用</div>
          </div>
          <div className="p-3 bg-[#F3F5FA] rounded-xl text-center">
            <div className="text-lg font-bold text-[#6C5DD3]">{user.stats.badges}</div>
            <div className="text-xs text-[#808191]">已获勋章</div>
          </div>
        </div>
      </div>

      {/* 最近任务 */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-sm font-semibold text-[#11142D]">最近任务</span>
          </div>
          <Link href="/tasks" className="text-xs text-[#6C5DD3] hover:underline">
            查看全部
          </Link>
        </div>
        <div className="space-y-3">
          {user.recentTasks.map((task) => (
            <div key={task.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#11142D] truncate flex-1">{task.name}</span>
                <span className="text-[#808191] ml-2">{task.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8ECF3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-4">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/workspace"
            className="flex items-center gap-2 p-3 bg-[#F3F5FA] rounded-xl hover:bg-[#6C5DD3]/5 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D]">工作台</span>
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-2 p-3 bg-[#F3F5FA] rounded-xl hover:bg-[#6C5DD3]/5 transition-colors"
          >
            <Heart className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D]">收藏</span>
          </Link>
          <Link
            href="/badges"
            className="flex items-center gap-2 p-3 bg-[#F3F5FA] rounded-xl hover:bg-[#6C5DD3]/5 transition-colors"
          >
            <Award className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D]">勋章</span>
          </Link>
          <Link
            href="/checkin"
            className="flex items-center gap-2 p-3 bg-[#F3F5FA] rounded-xl hover:bg-[#6C5DD3]/5 transition-colors"
          >
            <Star className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D]">签到</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
