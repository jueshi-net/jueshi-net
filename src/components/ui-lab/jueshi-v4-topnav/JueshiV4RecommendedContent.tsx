'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Layers } from 'lucide-react';

const checklists = [
  {
    id: 'study-abroad',
    title: '留学生出国前准备清单',
    description: '从签证到行李，一份清单搞定所有准备',
    progress: 68,
    tags: ['留学', '必备'],
    updated: '2024-01-15',
  },
  {
    id: 'shipping',
    title: '集运发货清单',
    description: '国际集运全流程，避免踩坑',
    progress: 42,
    tags: ['物流', '实用'],
    updated: '2024-01-12',
  },
  {
    id: 'new-country',
    title: '初到新国家必做事项',
    description: '银行、手机、租房、注册，一步步来',
    progress: 25,
    tags: ['生活', '新手'],
    updated: '2024-01-10',
  },
];

const guides = [
  {
    id: 'canada-visa',
    title: '加拿大留学签证申请指南',
    description: '从材料准备到面签，全流程详解',
    tags: ['加拿大', '签证'],
    readTime: '15分钟',
  },
  {
    id: 'overseas-apps',
    title: '海外必备 APP 推荐',
    description: '生活、学习、支付，这些 APP 不能少',
    tags: ['工具', '推荐'],
    readTime: '8分钟',
  },
  {
    id: 'singapore-rent',
    title: '新加坡租房注意事项',
    description: '找房、签约、退房，避坑指南',
    tags: ['新加坡', '租房'],
    readTime: '12分钟',
  },
];

const topics = [
  {
    id: 'cross-border',
    title: '跨境电商专题',
    description: '从开店到运营，全流程工具与资源',
    count: 24,
    color: 'bg-purple-50 text-purple-500',
  },
  {
    id: 'logistics',
    title: '国际物流专题',
    description: '快递、集运、清关，一文读懂',
    count: 18,
    color: 'bg-orange-50 text-orange-500',
  },
  {
    id: 'overseas-life',
    title: '海外生活专题',
    description: '衣食住行，海外生活全攻略',
    count: 32,
    color: 'bg-blue-50 text-blue-500',
  },
];

export default function JueshiV4RecommendedContent() {
  return (
    <section className="mb-8 md:mb-10">
      {/* 推荐清单 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6C5DD3]" />
            <h2 className="text-base font-bold text-[#11142D]">推荐清单</h2>
          </div>
          <Link href="/checklists" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
            查看全部
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {checklists.map((item) => (
            <Link
              key={item.id}
              href={`/checklists/${item.id}`}
              className="group bg-white rounded-xl p-4 md:p-5 border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              <h3 className="font-medium text-[#11142D] text-sm mb-1.5 group-hover:text-[#6C5DD3] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#808191] mb-3 line-clamp-2">
                {item.description}
              </p>
              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] text-[#808191] mb-1">
                  <span>进度</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E8ECF3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-1.5 py-0.5 bg-[#6C5DD3]/8 text-[#6C5DD3] rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-[#808191]">{item.updated}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 热门指南 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#6C5DD3]" />
            <h2 className="text-base font-bold text-[#11142D]">热门指南</h2>
          </div>
          <Link href="/guides" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
            查看全部
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {guides.map((item) => (
            <Link
              key={item.id}
              href={`/guides/${item.id}`}
              className="group bg-white rounded-xl p-4 md:p-5 border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              <h3 className="font-medium text-[#11142D] text-sm mb-1.5 group-hover:text-[#6C5DD3] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#808191] mb-3 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-1.5 py-0.5 bg-[#F3F5FA] text-[#808191] rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-[#808191]">{item.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 专题聚合 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6C5DD3]" />
            <h2 className="text-base font-bold text-[#11142D]">专题聚合</h2>
          </div>
          <Link href="/topics" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
            查看全部
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {topics.map((item) => (
            <Link
              key={item.id}
              href={`/topics/${item.id}`}
              className="group bg-white rounded-xl p-4 md:p-5 border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${item.color} flex-shrink-0`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs px-1.5 py-0.5 bg-[#F3F5FA] text-[#808191] rounded font-medium">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-xs text-[#808191] line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
