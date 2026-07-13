'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Package, RefreshCw, Mail, FileText, Globe, MapPin, Ruler, ArrowUpRight } from 'lucide-react';

const tools = [
  {
    id: 'shipping-calc',
    icon: Truck,
    title: '运费计算器',
    description: '快速计算国际快递运费，支持多家物流商比价',
    category: '物流',
    color: 'from-orange-400 to-red-400',
  },
  {
    id: 'hs-code',
    icon: Package,
    title: 'HS编码查询',
    description: '查询商品海关编码，了解关税税率和监管条件',
    category: '外贸',
    color: 'from-blue-400 to-indigo-400',
  },
  {
    id: 'currency',
    icon: RefreshCw,
    title: '汇率换算',
    description: '实时汇率查询，支持多种货币换算和历史走势',
    category: '金融',
    color: 'from-green-400 to-teal-400',
  },
  {
    id: 'postcode',
    icon: Mail,
    title: '邮编查询',
    description: '全球邮编查询，快速定位地址对应邮编',
    category: '地址',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'invoice',
    icon: FileText,
    title: '发票生成',
    description: '快速生成商业发票、形式发票等外贸单据',
    category: '单据',
    color: 'from-cyan-400 to-blue-400',
  },
  {
    id: 'translate',
    icon: Globe,
    title: '多语翻译',
    description: '支持多种语言互译，专业术语准确翻译',
    category: '语言',
    color: 'from-pink-400 to-rose-400',
  },
  {
    id: 'address',
    icon: MapPin,
    title: '地址解析',
    description: '智能解析地址格式，标准化国际地址',
    category: '地址',
    color: 'from-indigo-400 to-purple-400',
  },
  {
    id: 'unit',
    icon: Ruler,
    title: '单位换算',
    description: '长度、重量、体积等单位换算，支持英制公制',
    category: '工具',
    color: 'from-yellow-400 to-orange-400',
  },
];

export default function JueshiV4ToolGrid() {
  return (
    <section className="mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#11142D]">高频工具</h2>
        <Link href="/tools" className="text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group bg-white rounded-xl p-4 md:p-5 border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-lg shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#808191] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">
                  {tool.title}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#F3F5FA] text-[#808191] rounded-md font-medium">
                  {tool.category}
                </span>
              </div>
              <p className="text-xs text-[#808191] line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
