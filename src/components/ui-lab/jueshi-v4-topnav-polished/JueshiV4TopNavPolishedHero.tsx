'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Package, RefreshCw, Truck, FileText, GraduationCap, ArrowRight, TrendingUp, CheckSquare, Compass } from 'lucide-react';

const quickTools = [
  { icon: Mail, label: '邮编查询', color: 'from-blue-400 to-blue-500', bg: 'bg-blue-50' },
  { icon: Package, label: 'HS编码', color: 'from-purple-400 to-purple-500', bg: 'bg-purple-50' },
  { icon: RefreshCw, label: '汇率换算', color: 'from-green-400 to-green-500', bg: 'bg-green-50' },
  { icon: Truck, label: '运费计算', color: 'from-orange-400 to-orange-500', bg: 'bg-orange-50' },
  { icon: FileText, label: '单据生成', color: 'from-cyan-400 to-blue-400', bg: 'bg-cyan-50' },
  { icon: GraduationCap, label: '留学指南', color: 'from-pink-400 to-rose-400', bg: 'bg-pink-50' },
];

const trustStats = [
  { icon: TrendingUp, label: '50+', desc: '实用工具' },
  { icon: CheckSquare, label: '30+', desc: '清单指南' },
  { icon: Compass, label: '100+', desc: '资源导航' },
];

export default function JueshiV4TopNavPolishedHero() {
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 lg:gap-14 items-center min-h-[380px] lg:min-h-[440px]">
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
                海外华人的
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

            {/* Right visual - Tool cards composition */}
            <div className="relative hidden lg:block">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6C5DD3]/5 to-[#3F8CFF]/5 rounded-3xl"></div>
              
              {/* Tool cards grid */}
              <div className="relative grid grid-cols-2 gap-3 p-4">
                {quickTools.map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={i}
                      className={`
                        flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#E8ECF3] 
                        shadow-sm hover:shadow-md hover:border-[#6C5DD3]/20 transition-all cursor-pointer group
                        ${i === 0 || i === 3 ? 'translate-y-2' : ''}
                      `}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-xl shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">
                          {tool.label}
                        </div>
                        <div className="text-xs text-[#808191]">立即使用</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl border border-[#E8ECF3] shadow-lg p-3 flex items-center gap-2">
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
