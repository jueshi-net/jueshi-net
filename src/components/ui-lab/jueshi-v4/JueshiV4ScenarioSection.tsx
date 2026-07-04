'use client';

import React from 'react';
import Link from 'next/link';

const scenarios = [
  { id: 'map', icon: '🗺️', label: '地图导航', color: 'bg-blue-50 text-blue-500' },
  { id: 'docs', icon: '📄', label: '单据生成', color: 'bg-purple-50 text-purple-500' },
  { id: 'currency', icon: '💱', label: '汇率换算', color: 'bg-green-50 text-green-500' },
  { id: 'logistics', icon: '📦', label: '物流查询', color: 'bg-orange-50 text-orange-500' },
  { id: 'study', icon: '🎓', label: '留学指南', color: 'bg-pink-50 text-pink-500' },
  { id: 'address', icon: '📍', label: '地址查询', color: 'bg-indigo-50 text-indigo-500' },
  { id: 'translate', icon: '🌐', label: '翻译工具', color: 'bg-teal-50 text-teal-500' },
  { id: 'calc', icon: '🧮', label: '计算器', color: 'bg-yellow-50 text-yellow-600' },
];

export default function JueshiV4ScenarioSection() {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl p-6 border border-[#E8ECF3]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#11142D]">常用场景</h2>
          <Link href="/scenarios" className="text-sm text-[#6C5DD3] hover:underline">
            查看全部
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/scenarios/${scenario.id}`}
              className="flex flex-col items-center gap-2 min-w-[72px] group"
            >
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${scenario.color} group-hover:scale-105 transition-transform`}>
                <span className="text-2xl">{scenario.icon}</span>
              </div>
              <span className="text-xs text-[#808191] group-hover:text-[#11142D] transition-colors whitespace-nowrap">
                {scenario.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
