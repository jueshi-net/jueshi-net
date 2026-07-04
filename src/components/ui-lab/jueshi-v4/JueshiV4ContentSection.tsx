'use client';

import React from 'react';
import Link from 'next/link';

const taskChains = [
  { id: 'ship', icon: '📦', title: '我要寄国际包裹', steps: 5 },
  { id: 'quote', icon: '💰', title: '我要做外贸报价', steps: 4 },
  { id: 'study', icon: '🎓', title: '我要准备出国留学', steps: 6 },
  { id: 'address', icon: '📍', title: '我要查海外地址', steps: 3 },
  { id: 'official', icon: '🏛️', title: '我要找官方资源', steps: 4 },
];

const guides = [
  {
    id: 'shipping-guide',
    title: '国际快递完全指南',
    summary: '从选择物流商到清关流程，一文读懂国际快递全流程',
    tags: ['物流', '新手'],
    updated: '2024-01-15',
  },
  {
    id: 'customs-guide',
    title: '海关申报避坑指南',
    summary: '常见申报错误、禁运物品清单、关税计算技巧',
    tags: ['外贸', '清关'],
    updated: '2024-01-12',
  },
  {
    id: 'address-guide',
    title: '国际地址格式大全',
    summary: '各国地址格式详解，避免填写错误导致退件',
    tags: ['地址', '实用'],
    updated: '2024-01-10',
  },
];

export default function JueshiV4ContentSection() {
  return (
    <section className="space-y-8">
      {/* Task chains */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#11142D]">热门任务链</h2>
          <Link href="/tasks" className="text-sm text-[#6C5DD3] hover:underline">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {taskChains.map((chain) => (
            <Link
              key={chain.id}
              href={`/tasks/${chain.id}`}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E8ECF3] hover:shadow-md hover:border-[#6C5DD3]/20 transition-all"
            >
              <span className="text-2xl">{chain.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#11142D] text-sm truncate">
                  {chain.title}
                </h3>
                <p className="text-xs text-[#808191]">{chain.steps} 个步骤</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Guides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#11142D]">推荐指南</h2>
          <Link href="/guides" className="text-sm text-[#6C5DD3] hover:underline">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.id}`}
              className="group bg-white rounded-2xl p-5 border border-[#E8ECF3] hover:shadow-lg hover:border-[#6C5DD3]/20 transition-all"
            >
              <h3 className="font-semibold text-[#11142D] mb-2 group-hover:text-[#6C5DD3] transition-colors">
                {guide.title}
              </h3>
              <p className="text-sm text-[#808191] mb-3 line-clamp-2">
                {guide.summary}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-[#808191]">{guide.updated}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
