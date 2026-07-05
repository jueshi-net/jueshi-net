'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Package, RefreshCw, Truck, FileText, CheckSquare, ArrowRight, TrendingUp, Compass, Bookmark, Search, Zap, Clock } from 'lucide-react';

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

export default function JueshiV4HomeCandidateV2Hero() {
  return (
    <section className="mb-10 md:mb-12">
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

        <div className="relative p-6 md:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-10 lg:gap-14 items-start">
            {/* Left content */}
            <div className="flex flex-col justify-center">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
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

              <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-[#11142D] mb-4 leading-tight">
                海外华人
                <span className="bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] bg-clip-text text-transparent">实用工具箱</span>
              </h1>
              <p className="text-[#808191] text-base md:text-lg mb-6 max-w-lg leading-relaxed">
                集运物流、外贸单据、跨境电商、留学生活，一站式解决海外生活工作中的各种实用需求
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-all shadow-lg shadow-[#6C5DD3]/20 hover:shadow-xl hover:shadow-[#6C5DD3]/30 hover:-translate-y-0.5"
                >
                  浏览全部工具
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/checklists"
                  className="px-6 py-3 bg-white text-[#6C5DD3] border border-[#6C5DD3]/20 rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/5 transition-all"
                >
                  查看清单指南
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-6 md:gap-8">
                {trustStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-[#6C5DD3]/10 rounded-lg">
                        <Icon className="w-4 h-4 text-[#6C5DD3]" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#11142D]">{stat.label}</div>
                        <div className="text-xs text-[#808191]">{stat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right visual panel - Enhanced toolbox */}
            <div className="relative hidden lg:block">
              {/* Main panel */}
              <div className="relative bg-white/80 backdrop-blur-md rounded-3xl border border-[#E8ECF3]/60 shadow-lg p-6">
                {/* Panel header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🛠️</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#11142D]">今日常用工具</h3>
                  </div>
                  <span className="text-xs text-[#808191]">6 个工具</span>
                </div>

                {/* Tool grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {quickTools.map((tool, i) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-[#F8F9FC] to-[#F3F5FA] rounded-xl border border-[#E8ECF3] hover:shadow-md hover:border-[#6C5DD3]/20 transition-all cursor-pointer group"
                      >
                        <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-lg shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-xs font-medium text-[#11142D] group-hover:text-[#6C5DD3] transition-colors">
                          {tool.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Hot searches */}
                <div className="mb-4 p-3 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Search className="w-3.5 h-3.5 text-[#6C5DD3]" />
                    <span className="text-xs font-semibold text-[#11142D]">今日热门搜索</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hotSearches.map((search, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-white text-[#808191] rounded-md border border-[#E8ECF3]">
                        {search}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick tasks */}
                <div className="mb-4 p-3 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="w-3.5 h-3.5 text-[#FF754C]" />
                    <span className="text-xs font-semibold text-[#11142D]">快捷任务</span>
                  </div>
                  <div className="flex gap-2">
                    {quickTasks.map((task, i) => (
                      <div key={i} className="flex-1 flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#E8ECF3]">
                        <span className="text-sm">{task.icon}</span>
                        <span className="text-[10px] text-[#11142D] font-medium">{task.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent updates */}
                <div className="mb-4 p-3 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-[#3F8CFF]" />
                    <span className="text-xs font-semibold text-[#11142D]">最近更新</span>
                  </div>
                  <div className="space-y-1.5">
                    {recentUpdates.map((update, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[10px] text-[#11142D]">{update.label}</span>
                        <span className="text-[9px] text-[#808191]">{update.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E8ECF3]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#808191]">今日已服务 <span className="font-bold text-[#11142D]">1,280</span> 次查询</span>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-lg text-xs font-medium hover:bg-[#6C5DD3]/20 transition-colors">
                    <Bookmark className="w-3 h-3" />
                    保存到工作台
                  </button>
                </div>
              </div>

              {/* Floating crab mascot */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl border border-[#E8ECF3] shadow-lg p-3 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF754C] to-[#FF9472] rounded-xl flex items-center justify-center">
                  <span className="text-lg">🦀</span>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#11142D]">绝世百宝箱</div>
                  <div className="text-[10px] text-[#808191]">您的海外生活助手</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
