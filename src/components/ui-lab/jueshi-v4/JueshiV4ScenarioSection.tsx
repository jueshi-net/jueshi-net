'use client';

import React from 'react';
import Link from 'next/link';
import { Map, FileText, RefreshCw, Truck, GraduationCap, MapPin, Globe, Calculator } from 'lucide-react';

const scenarios = [
  { id: 'map', icon: Map, label: '地图导航', color: 'bg-blue-50 text-blue-500' },
  { id: 'docs', icon: FileText, label: '单据生成', color: 'bg-purple-50 text-purple-500' },
  { id: 'currency', icon: RefreshCw, label: '汇率换算', color: 'bg-green-50 text-green-500' },
  { id: 'logistics', icon: Truck, label: '物流查询', color: 'bg-orange-50 text-orange-500' },
  { id: 'study', icon: GraduationCap, label: '留学指南', color: 'bg-pink-50 text-pink-500' },
  { id: 'address', icon: MapPin, label: '地址查询', color: 'bg-indigo-50 text-indigo-500' },
  { id: 'translate', icon: Globe, label: '翻译工具', color: 'bg-teal-50 text-teal-500' },
  { id: 'calc', icon: Calculator, label: '计算器', color: 'bg-yellow-50 text-yellow-600' },
];

export default function JueshiV4ScenarioSection() {
  return (
    <section className="mb-6 md:mb-8">
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E8ECF3] shadow-[0_12px_30px_rgba(17,20,45,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#11142D]">常用场景</h2>
          <Link href="/scenarios" className="text-xs text-[#6C5DD3] hover:underline font-medium">
            查看全部
          </Link>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Link
                key={scenario.id}
                href={`/scenarios/${scenario.id}`}
                className="flex flex-col items-center gap-2 min-w-[64px] group"
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${scenario.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="text-xs text-[#808191] group-hover:text-[#11142D] transition-colors whitespace-nowrap">
                  {scenario.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
