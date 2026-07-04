'use client';

import React from 'react';
import Link from 'next/link';

const tools = [
  {
    id: 'shipping-calc',
    icon: '🚚',
    title: '运费计算器',
    description: '快速计算国际快递运费，支持多家物流商比价',
    category: '物流',
    color: 'from-orange-400 to-red-400',
  },
  {
    id: 'hs-code',
    icon: '📦',
    title: 'HS编码查询',
    description: '查询商品海关编码，了解关税税率和监管条件',
    category: '外贸',
    color: 'from-blue-400 to-indigo-400',
  },
  {
    id: 'currency',
    icon: '💱',
    title: '汇率换算',
    description: '实时汇率查询，支持多种货币换算和历史走势',
    category: '金融',
    color: 'from-green-400 to-teal-400',
  },
  {
    id: 'postcode',
    icon: '📮',
    title: '邮编查询',
    description: '全球邮编查询，快速定位地址对应邮编',
    category: '地址',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'invoice',
    icon: '📄',
    title: '发票生成',
    description: '快速生成商业发票、形式发票等外贸单据',
    category: '单据',
    color: 'from-cyan-400 to-blue-400',
  },
  {
    id: 'translate',
    icon: '🌐',
    title: '多语翻译',
    description: '支持多种语言互译，专业术语准确翻译',
    category: '语言',
    color: 'from-pink-400 to-rose-400',
  },
  {
    id: 'address',
    icon: '📍',
    title: '地址解析',
    description: '智能解析地址格式，标准化国际地址',
    category: '地址',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    id: 'unit',
    icon: '📏',
    title: '单位换算',
    description: '长度、重量、体积等单位换算，支持英制公制',
    category: '工具',
    color: 'from-yellow-400 to-orange-400',
  },
];

export default function JueshiV4ToolGrid() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#11142D]">高频工具</h2>
        <Link href="/tools" className="text-sm text-[#6C5DD3] hover:underline">
          查看全部
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="group bg-white rounded-2xl p-5 border border-[#E8ECF3] hover:shadow-lg hover:border-[#6C5DD3]/20 transition-all"
          >
            <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-xl text-white text-xl mb-3`}>
              {tool.icon}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#11142D] group-hover:text-[#6C5DD3] transition-colors">
                {tool.title}
              </h3>
              <span className="text-xs px-2 py-0.5 bg-[#F3F5FA] text-[#808191] rounded-full">
                {tool.category}
              </span>
            </div>
            <p className="text-sm text-[#808191] line-clamp-2">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
