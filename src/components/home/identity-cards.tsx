'use client';

import { GraduationCap, ShoppingBag, Briefcase, LifeBuoy, ArrowRight } from 'lucide-react';

// Routes that have actual content
const READY_SLUGS = new Set<string>(['student', 'merchant']);

const IDENTITY_CARDS = [
  { title: '留学生专区', desc: '签证、租房、集运、必备 App', icon: GraduationCap, href: '/scenario/student', count: 12, tags: ['签证', '租房', 'App'], color: 'from-blue-500 to-indigo-500', bgSoft: 'bg-blue-50' },
  { title: '出海商家', desc: '单据、物流、支付、ERP 工具', icon: ShoppingBag, href: '/scenario/merchant', count: 15, tags: ['单据', '物流', '支付'], color: 'from-emerald-500 to-teal-500', bgSoft: 'bg-emerald-50' },
  { title: '务工旅行', desc: '签证、住宿、交通、安全指南', icon: Briefcase, href: '/scenario/traveler', count: 8, tags: ['签证', '住宿', '交通'], color: 'from-amber-500 to-orange-500', bgSoft: 'bg-amber-50' },
  { title: '数字游民', desc: '网络、社区、税务、远程办公', icon: LifeBuoy, href: '/scenario/nomad', count: 10, tags: ['网络', '社区', '税务'], color: 'from-purple-500 to-pink-500', bgSoft: 'bg-purple-50' },
];

export default function IdentityCards() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">选择你的身份</h2>
        <p className="mt-0.5 text-sm text-gray-500">按人群精选工具，新手也能快速上手</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {IDENTITY_CARDS.map(card => {
          const Icon = card.icon;
          const isReady = READY_SLUGS.has(card.href.replace('/starter/', ''));
          const cardClass = "group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm shadow-gray-100/30 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 hover:border-gray-200 transition-all duration-200";

          if (!isReady) {
            return (
              <button
                key={card.title}
                onClick={() => alert('🚧 专区模块正在火热建设中，敬请期待！')}
                className={cardClass}
              >
                {/* Gradient top bar */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`} />

                <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-gray-300 opacity-0 transition-all duration-200 group-hover:right-2.5 group-hover:opacity-100 group-hover:text-teal-600" />

                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${card.bgSoft}`}>
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-700">{card.title}</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.desc}</p>

                {/* Tool count badge */}
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {card.count} 个工具
                </div>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {card.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          }

          return (
            <a
              key={card.title}
              href={card.href}
              className={cardClass}
            >
              {/* Gradient top bar */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`} />

              {/* Arrow on hover */}
              <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-gray-300 opacity-0 transition-all duration-200 group-hover:right-2.5 group-hover:opacity-100 group-hover:text-teal-600" />

              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${card.bgSoft}`}>
                <Icon className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-700">{card.title}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.desc}</p>

              {/* Tool count badge */}
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                {card.count} 个工具
              </div>

              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {card.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
