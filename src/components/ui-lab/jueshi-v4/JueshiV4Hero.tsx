'use client';

import React from 'react';
import Link from 'next/link';

const quickTools = [
  { icon: '📮', label: '邮编查询', color: 'from-blue-400 to-blue-500' },
  { icon: '📦', label: 'HS编码', color: 'from-purple-400 to-purple-500' },
  { icon: '💱', label: '汇率换算', color: 'from-green-400 to-green-500' },
  { icon: '🚚', label: '运费计算', color: 'from-orange-400 to-orange-500' },
];

export default function JueshiV4Hero() {
  return (
    <section className="mb-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6C5DD3]/5 via-[#3F8CFF]/5 to-[#FF754C]/5 rounded-3xl p-8 lg:p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6C5DD3]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#3F8CFF]/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#11142D] mb-4">
              海外华人的实用工具箱
            </h1>
            <p className="text-[#808191] text-lg mb-6 max-w-lg">
              集运物流、外贸单据、跨境电商、留学生活，一站式解决海外生活工作中的各种实用需求
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/tools"
                className="px-6 py-3 bg-[#6C5DD3] text-white rounded-xl font-medium hover:bg-[#5A4FBF] transition-colors shadow-lg shadow-[#6C5DD3]/20"
              >
                浏览全部工具
              </Link>
              <Link
                href="/guides"
                className="px-6 py-3 bg-white text-[#6C5DD3] border border-[#6C5DD3]/20 rounded-xl font-medium hover:bg-[#6C5DD3]/5 transition-colors"
              >
                查看清单指南
              </Link>
            </div>
          </div>

          {/* Right quick tools */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3">
            {quickTools.map((tool, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-[#E8ECF3] hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-xl text-white text-lg`}>
                  {tool.icon}
                </div>
                <span className="font-medium text-[#11142D] text-sm">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
