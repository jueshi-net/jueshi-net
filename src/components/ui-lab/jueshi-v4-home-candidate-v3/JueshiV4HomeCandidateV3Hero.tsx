'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Package, RefreshCw, Truck, FileText, CheckSquare, ArrowRight, TrendingUp, Compass, Bookmark, Search, Zap, Clock, Award, Sparkles, Heart } from 'lucide-react';

const quickTools = [
  { icon: Mail, label: '邮编查询', color: 'from-blue-400 to-blue-500' },
  { icon: Package, label: 'HS编码', color: 'from-purple-400 to-purple-500' },
  { icon: RefreshCw, label: '汇率换算', color: 'from-green-400 to-green-500' },
  { icon: Truck, label: '运费计算', color: 'from-orange-400 to-orange-500' },
  { icon: FileText, label: '单据生成', color: 'from-cyan-400 to-blue-400' },
  { icon: CheckSquare, label: '清单任务', color: 'from-pink-400 to-rose-400' },
];

const trustStats = [
  { icon: TrendingUp, label: '50+', desc: '实用工具' },
  { icon: Compass, label: '30+', desc: '清单指南' },
  { icon: Bookmark, label: '100+', desc: '资源导航' },
];

const hotSearches = [
  '新加坡邮编',
  'HS 编码',
  '加拿大留学',
  '商业发票',
  '运费计算',
];

const quickTasks = [
  { label: '寄国际包裹', icon: '📦' },
  { label: '做外贸报价', icon: '💰' },
  { label: '准备出国留学', icon: '🎓' },
];

const recentUpdates = [
  { label: '汇率工具更新', time: '2小时前' },
  { label: '新增留学清单', time: '1天前' },
  { label: '资源导航扩展', time: '3天前' },
];

// Mock 用户数据（工作台卡）
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
  ],
  todayTasks: [
    { id: 1, name: '完成每日签到', done: true },
    { id: 2, name: '使用运费计算器', done: false },
    { id: 3, name: '查看新清单', done: false },
  ],
  pendingChecklists: [
    { id: 1, name: '留学准备清单', progress: 68 },
    { id: 2, name: '集运发货清单', progress: 42 },
  ],
};

export default function JueshiV4HomeCandidateV3Hero() {
  const user = mockUser;
  const expProgress = (user.currentExp / user.nextLevelExp) * 100;

  return (
    <section className="mb-6 md:mb-8">
      <div className="relative overflow-hidden rounded-[28px] border border-[#E8ECF3] shadow-[0_20px_50px_rgba(108,93,211,0.08)]">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C5DD3]/5 via-[#3F8CFF]/3 to-[#FF754C]/5"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6C5DD3]/10 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-[#3F8CFF]/8 to-transparent rounded-full blur-3xl translate-y-1/3"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236C5DD3' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-8 lg:gap-10 items-start">
            {/* Left content */}
            <div className="flex flex-col justify-center">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[#6C5DD3]/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#6C5DD3] rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-[#6C5DD3]">海外生活</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[#3F8CFF]/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#3F8CFF] rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-[#3F8CFF]">跨境工具</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[#FF754C]/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#FF754C] rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-[#FF754C]">实用清单</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#11142D] mb-3 leading-tight">
                海外华人
                <span className="bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] bg-clip-text text-transparent">实用工具箱</span>
              </h1>
              <p className="text-[#808191] text-sm md:text-base mb-5 max-w-lg leading-relaxed">
                集运物流、外贸单据、跨境电商、留学生活，一站式解决海外生活工作中的各种实用需求
              </p>

              <div className="flex flex-wrap gap-3 mb-5">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-all shadow-lg shadow-[#6C5DD3]/20 hover:shadow-xl hover:shadow-[#6C5DD3]/30 hover:-translate-y-0.5"
                >
                  浏览全部工具
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/checklists"
                  className="px-5 py-2.5 bg-white text-[#6C5DD3] border border-[#6C5DD3]/20 rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/5 transition-all"
                >
                  查看清单指南
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-5 md:gap-6 mb-5">
                {trustStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center bg-[#6C5DD3]/10 rounded-lg">
                        <Icon className="w-3.5 h-3.5 text-[#6C5DD3]" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-[#11142D]">{stat.label}</div>
                        <div className="text-[11px] text-[#808191]">{stat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Embedded Workbench Card - V3 新增 */}
              {user.isLoggedIn && (
                <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-[#E8ECF3]/60 shadow-lg p-4">
                  {/* User info row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-base">🦀</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF754C] rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-[11px] text-white font-bold">{user.level}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-[#11142D] truncate">{user.nickname}</h4>
                        <span className="text-[11px] px-1.5 py-0.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded font-medium">
                          Lv.{user.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#808191] mb-1">{user.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#E8ECF3] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full"
                            style={{ width: `${expProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#808191] whitespace-nowrap">
                          {user.currentExp}/{user.nextLevelExp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact content */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Today tasks */}
                    <div className="p-2 bg-[#F8F9FC] rounded-lg">
                      <div className="flex items-center gap-1 mb-1.5">
                        <Zap className="w-3 h-3 text-[#FF754C]" />
                        <span className="text-[11px] font-semibold text-[#11142D]">今日任务</span>
                      </div>
                      <div className="space-y-1">
                        {user.todayTasks.slice(0, 2).map((task) => (
                          <div key={task.id} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                              task.done ? 'bg-[#6C5DD3] border-[#6C5DD3]' : 'border-[#E8ECF3]'
                            }`}>
                              {task.done && <span className="text-white text-[11px]">✓</span>}
                            </div>
                            <span className={`text-[11px] ${task.done ? 'text-[#808191] line-through' : 'text-[#11142D]'} truncate`}>
                              {task.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pending checklists */}
                    <div className="p-2 bg-[#F8F9FC] rounded-lg">
                      <div className="flex items-center gap-1 mb-1.5">
                        <CheckSquare className="w-3 h-3 text-[#6C5DD3]" />
                        <span className="text-[11px] font-semibold text-[#11142D]">未完成清单</span>
                      </div>
                      <div className="space-y-1.5">
                        {user.pendingChecklists.map((checklist) => (
                          <div key={checklist.id}>
                            <div className="flex items-center justify-between text-[11px] mb-0.5">
                              <span className="text-[#11142D] truncate flex-1">{checklist.name}</span>
                              <span className="text-[#808191] ml-1">{checklist.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-[#E8ECF3] rounded-full overflow-hidden">
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

                  {/* CTA row */}
                  <div className="flex items-center gap-2">
                    <Link
                      href="/workspace"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-lg text-[11px] font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      签到 ({user.checkinStreak}天)
                    </Link>
                    <Link
                      href="/workspace"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F3F5FA] text-[#6C5DD3] rounded-lg text-[11px] font-medium hover:bg-[#6C5DD3]/8 transition-colors"
                    >
                      查看工作台
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right visual panel - Toolbox */}
            <div className="relative hidden lg:block">
              {/* Main panel */}
              <div className="relative bg-white/80 backdrop-blur-md rounded-3xl border border-[#E8ECF3]/60 shadow-lg p-5">
                {/* Panel header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">🛠️</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#11142D]">今日常用工具</h3>
                  </div>
                  <span className="text-[11px] text-[#808191]">6 个工具</span>
                </div>

                {/* Tool grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {quickTools.map((tool, i) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5 p-2.5 bg-gradient-to-br from-[#F8F9FC] to-[#F3F5FA] rounded-xl border border-[#E8ECF3] hover:shadow-md hover:border-[#6C5DD3]/20 transition-all cursor-pointer group"
                      >
                        <div className={`w-9 h-9 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-lg shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-medium text-[#11142D] group-hover:text-[#6C5DD3] transition-colors">
                          {tool.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Hot searches */}
                <div className="mb-3 p-2.5 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Search className="w-3 h-3 text-[#6C5DD3]" />
                    <span className="text-[11px] font-semibold text-[#11142D]">今日热门搜索</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hotSearches.map((search, i) => (
                      <span key={i} className="text-[11px] px-1.5 py-0.5 bg-white text-[#808191] rounded border border-[#E8ECF3]">
                        {search}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick tasks */}
                <div className="mb-3 p-2.5 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3 text-[#FF754C]" />
                    <span className="text-[11px] font-semibold text-[#11142D]">快捷任务</span>
                  </div>
                  <div className="flex gap-1.5">
                    {quickTasks.map((task, i) => (
                      <div key={i} className="flex-1 flex items-center gap-1 p-1.5 bg-white rounded-lg border border-[#E8ECF3]">
                        <span className="text-xs">{task.icon}</span>
                        <span className="text-[11px] text-[#11142D] font-medium">{task.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent updates */}
                <div className="p-2.5 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3 h-3 text-[#3F8CFF]" />
                    <span className="text-[11px] font-semibold text-[#11142D]">最近更新</span>
                  </div>
                  <div className="space-y-1">
                    {recentUpdates.map((update, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px] text-[#11142D]">{update.label}</span>
                        <span className="text-[11px] text-[#808191]">{update.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating crab mascot */}
              <div className="absolute -top-3 -right-3 bg-white rounded-xl border border-[#E8ECF3] shadow-lg p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF754C] to-[#FF9472] rounded-lg flex items-center justify-center">
                  <span className="text-sm">🦀</span>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#11142D]">绝世百宝箱</div>
                  <div className="text-[11px] text-[#808191]">您的海外生活助手</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
