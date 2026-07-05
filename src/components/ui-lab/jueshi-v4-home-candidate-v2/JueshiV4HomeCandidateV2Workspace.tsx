'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Heart, Sparkles, TrendingUp, CheckSquare, Clock, ArrowRight, Zap, Mail, RefreshCw } from 'lucide-react';

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
  todayTasks: [
    { id: 1, name: '完成每日签到', done: true },
    { id: 2, name: '使用运费计算器', done: false },
    { id: 3, name: '查看新清单', done: false },
  ],
  recentTools: [
    { id: 1, name: '邮编查询', icon: Mail, time: '10分钟前' },
    { id: 2, name: '汇率换算', icon: RefreshCw, time: '1小时前' },
    { id: 3, name: '运费计算', icon: TrendingUp, time: '2小时前' },
  ],
  pendingChecklists: [
    { id: 1, name: '留学准备清单', progress: 68 },
    { id: 2, name: '集运发货清单', progress: 42 },
  ],
};

export default function JueshiV4HomeCandidateV2Workspace() {
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

          {/* Main content - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: User identity */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                    <span className="text-xl">🦀</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF754C] rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-[10px] text-white font-bold">{user.level}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#11142D] truncate">{user.nickname}</h3>
                  <p className="text-xs text-[#808191] mb-1">{user.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#E8ECF3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full"
                        style={{ width: `${expProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#808191] whitespace-nowrap">
                      {user.currentExp}/{user.nextLevelExp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-[#F8F9FC] rounded-lg">
                  <Heart className="w-4 h-4 text-[#FF754C] mb-1" />
                  <span className="text-sm font-bold text-[#11142D]">{user.stats.favorites}</span>
                  <span className="text-[10px] text-[#808191]">收藏</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#F8F9FC] rounded-lg">
                  <CheckSquare className="w-4 h-4 text-[#6C5DD3] mb-1" />
                  <span className="text-sm font-bold text-[#11142D]">{user.stats.checklists}</span>
                  <span className="text-[10px] text-[#808191]">清单</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#F8F9FC] rounded-lg">
                  <Award className="w-4 h-4 text-[#3F8CFF] mb-1" />
                  <span className="text-sm font-bold text-[#11142D]">{user.stats.badges}</span>
                  <span className="text-[10px] text-[#808191]">勋章</span>
                </div>
              </div>
            </div>

            {/* Middle: Today tasks + Recent tools */}
            <div className="lg:col-span-1 space-y-4">
              {/* Today tasks */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-[#FF754C]" />
                  <span className="text-xs font-semibold text-[#11142D]">今日任务</span>
                </div>
                <div className="space-y-1.5">
                  {user.todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-[#F8F9FC] rounded-lg">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        task.done ? 'bg-[#6C5DD3] border-[#6C5DD3]' : 'border-[#E8ECF3]'
                      }`}>
                        {task.done && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <span className={`text-xs ${task.done ? 'text-[#808191] line-through' : 'text-[#11142D]'}`}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent tools */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#3F8CFF]" />
                  <span className="text-xs font-semibold text-[#11142D]">最近使用</span>
                </div>
                <div className="space-y-1.5">
                  {user.recentTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div key={tool.id} className="flex items-center justify-between p-2 bg-[#F8F9FC] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-[#6C5DD3]" />
                          <span className="text-xs text-[#11142D]">{tool.name}</span>
                        </div>
                        <span className="text-[10px] text-[#808191]">{tool.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Badges + Checkin + Pending checklists */}
            <div className="lg:col-span-1 space-y-4">
              {/* Badges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#6C5DD3]" />
                    <span className="text-xs font-semibold text-[#11142D]">荣誉勋章</span>
                  </div>
                  <Link href="/badges" className="text-[10px] text-[#6C5DD3] hover:underline">
                    查看全部
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {user.badges.slice(0, 6).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center p-2 bg-[#F8F9FC] rounded-lg"
                      title={badge.name}
                    >
                      <span className="text-lg mb-0.5">{badge.icon}</span>
                      <span className="text-[9px] text-[#808191] text-center line-clamp-1">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkin */}
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all">
                <Sparkles className="w-4 h-4" />
                今日签到 <span className="text-xs opacity-80">(连续 {user.checkinStreak} 天)</span>
              </button>

              {/* Pending checklists */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#6C5DD3]" />
                    <span className="text-xs font-semibold text-[#11142D]">未完成清单</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {user.pendingChecklists.map((checklist) => (
                    <div key={checklist.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#11142D] truncate flex-1">{checklist.name}</span>
                        <span className="text-[#808191] ml-2">{checklist.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8ECF3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full"
                          style={{ width: `${checklist.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
