'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Package, RefreshCw, Truck, ArrowRight } from 'lucide-react';

const quickTools = [
  { icon: Mail, label: '邮编查询', color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50' },
  { icon: Package, label: 'HS编码', color: 'from-purple-400 to-purple-500', bgColor: 'bg-purple-50' },
  { icon: RefreshCw, label: '汇率换算', color: 'from-green-400 to-green-500', bgColor: 'bg-green-50' },
  { icon: Truck, label: '运费计算', color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-50' },
];

export default function JueshiV4Hero() {
  return (
    <section className="mb-6 md:mb-8">
      <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E8ECF3] shadow-[0_12px_30px_rgba(17,20,45,0.06)]">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#6C5DD3]/5 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gradient-to-tr from-[#3F8CFF]/5 to-transparent rounded-full blur-2xl translate-y-1/3"></div>

        <div className="relative p-5 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6C5DD3]/8 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-[#6C5DD3] rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-[#6C5DD3]">热门工具更新</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-[34px] font-bold text-[#11142D] mb-3 leading-tight">
                海外华人的实用工具箱
              </h1>
              <p className="text-[#808191] text-sm md:text-base mb-5 max-w-md mx-auto lg:mx-0 leading-relaxed">
                集运物流、外贸单据、跨境电商、留学生活，一站式解决海外生活工作中的各种实用需求
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-colors shadow-lg shadow-[#6C5DD3]/20"
                >
                  浏览全部工具
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/guides"
                  className="px-5 py-2.5 bg-[#F3F5FA] text-[#6C5DD3] rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/8 transition-colors"
                >
                  查看清单指南
                </Link>
              </div>
            </div>

            {/* Right quick tools */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-2.5 w-full max-w-xs lg:max-w-none">
              {quickTools.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3.5 py-3 bg-white rounded-xl border border-[#E8ECF3] hover:shadow-md hover:border-[#6C5DD3]/20 transition-all cursor-pointer group"
                  >
                    <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-lg shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">{tool.label}</span>
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
