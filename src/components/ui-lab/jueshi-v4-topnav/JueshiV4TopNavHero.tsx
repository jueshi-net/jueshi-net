'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Package, RefreshCw, Truck, FileText, GraduationCap, ArrowRight } from 'lucide-react';

const quickTools = [
  { icon: Mail, label: '邮编查询', color: 'from-blue-400 to-blue-500' },
  { icon: Package, label: 'HS编码', color: 'from-purple-400 to-purple-500' },
  { icon: RefreshCw, label: '汇率换算', color: 'from-green-400 to-green-500' },
  { icon: Truck, label: '运费计算', color: 'from-orange-400 to-orange-500' },
  { icon: FileText, label: '单据生成', color: 'from-cyan-400 to-blue-400' },
  { icon: GraduationCap, label: '留学指南', color: 'from-pink-400 to-rose-400' },
];

export default function JueshiV4TopNavHero() {
  return (
    <section className="mb-8 md:mb-10">
      <div className="relative overflow-hidden bg-white rounded-[28px] border border-[#E8ECF3] shadow-[0_12px_30px_rgba(17,20,45,0.06)]">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#6C5DD3]/5 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-gradient-to-tr from-[#3F8CFF]/5 to-transparent rounded-full blur-2xl translate-y-1/3"></div>

        <div className="relative p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6C5DD3]/8 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#6C5DD3] rounded-full"></span>
                  <span className="text-xs font-medium text-[#6C5DD3]">海外生活</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3F8CFF]/8 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#3F8CFF] rounded-full"></span>
                  <span className="text-xs font-medium text-[#3F8CFF]">跨境工具</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF754C]/8 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#FF754C] rounded-full"></span>
                  <span className="text-xs font-medium text-[#FF754C]">实用清单</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[#11142D] mb-4 leading-tight">
                海外华人的实用工具箱
              </h1>
              <p className="text-[#808191] text-base md:text-lg mb-6 max-w-lg leading-relaxed">
                集运物流、外贸单据、跨境电商、留学生活，一站式解决海外生活工作中的各种实用需求
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-colors shadow-lg shadow-[#6C5DD3]/20"
                >
                  浏览全部工具
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/checklists"
                  className="px-6 py-3 bg-[#F3F5FA] text-[#6C5DD3] rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/8 transition-colors"
                >
                  查看清单指南
                </Link>
              </div>
            </div>

            {/* Right quick tools */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickTools.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-[#E8ECF3] hover:shadow-md hover:border-[#6C5DD3]/20 transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-xl shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">
                      {tool.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
