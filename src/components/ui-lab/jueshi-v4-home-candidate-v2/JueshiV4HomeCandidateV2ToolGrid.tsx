'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Package, RefreshCw, MapPin, Truck, FileText, Receipt, Container, ArrowRight, TrendingUp, Sparkles, Star, Zap } from 'lucide-react';

const tools = [
  {
    id: 'shipping-calculator',
    icon: Truck,
    title: '运费计算器',
    description: '快速计算国际快递运费，支持多家物流商比价',
    category: '物流',
    color: 'from-orange-400 to-red-400',
    status: '热门',
    statusColor: 'bg-red-50 text-red-500',
    related: '物流查询',
  },
  {
    id: 'hs-code',
    icon: Package,
    title: 'HS编码查询',
    description: '查询商品海关编码，了解关税税率和监管条件',
    category: '外贸',
    color: 'from-blue-400 to-indigo-400',
    status: '常用',
    statusColor: 'bg-blue-50 text-blue-500',
    related: '商业发票',
  },
  {
    id: 'exchange-rate',
    icon: RefreshCw,
    title: '汇率换算',
    description: '实时汇率查询，支持多种货币换算和历史走势',
    category: '金融',
    color: 'from-green-400 to-teal-400',
    status: '热门',
    statusColor: 'bg-red-50 text-red-500',
    related: '外贸报价',
  },
  {
    id: 'postal-code',
    icon: Mail,
    title: '邮编查询',
    description: '全球邮编查询，快速定位地址对应邮编',
    category: '地址',
    color: 'from-purple-400 to-pink-400',
    status: '推荐',
    statusColor: 'bg-purple-50 text-purple-500',
    related: '地址格式化',
  },
  {
    id: 'invoice',
    icon: FileText,
    title: '发票生成',
    description: '快速生成商业发票、形式发票等外贸单据',
    category: '单据',
    color: 'from-cyan-400 to-blue-400',
    status: '新增',
    statusColor: 'bg-green-50 text-green-500',
    related: '报价单',
  },
  {
    id: 'address-formatter',
    icon: MapPin,
    title: '地址格式化',
    description: '智能解析地址格式，标准化国际地址',
    category: '地址',
    color: 'from-pink-400 to-rose-400',
    status: '推荐',
    statusColor: 'bg-purple-50 text-purple-500',
    related: '邮编查询',
  },
  {
    id: 'quote',
    icon: Receipt,
    title: '报价单',
    description: '快速生成专业外贸报价单，支持多币种',
    category: '外贸',
    color: 'from-indigo-400 to-purple-400',
    status: '新增',
    statusColor: 'bg-green-50 text-green-500',
    related: '商业发票',
  },
  {
    id: 'container',
    icon: Container,
    title: '集装箱尺寸',
    description: '查询标准集装箱尺寸，计算装柜方案',
    category: '物流',
    color: 'from-yellow-400 to-orange-400',
    status: '常用',
    statusColor: 'bg-blue-50 text-blue-500',
    related: '运费计算',
  },
];

const statusIcons = {
  '热门': TrendingUp,
  '新增': Sparkles,
  '常用': Star,
  '推荐': Zap,
};

export default function JueshiV4HomeCandidateV2ToolGrid() {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#11142D]">高频工具</h2>
          <p className="text-xs text-[#808191] mt-0.5">最常用的实用工具，快速解决您的问题</p>
        </div>
        <Link href="/tools" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const StatusIcon = statusIcons[tool.status as keyof typeof statusIcons];
          const isPrimary = index < 4; // 前 4 个为核心工具
          
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={`group bg-white rounded-xl border border-[#E8ECF3] transition-all ${
                isPrimary 
                  ? 'p-5 hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20' 
                  : 'p-4 hover:shadow-md hover:border-[#6C5DD3]/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-xl shadow-sm ${
                  isPrimary ? 'w-12 h-12' : 'w-10 h-10'
                }`}>
                  <Icon className={`text-white ${isPrimary ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 ${tool.statusColor} rounded-md`}>
                  <StatusIcon className="w-3 h-3" />
                  <span className="text-[11px] font-medium">{tool.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold text-[#11142D] group-hover:text-[#6C5DD3] transition-colors ${
                  isPrimary ? 'text-sm' : 'text-xs'
                }`}>
                  {tool.title}
                </h3>
                <span className="text-[11px] px-1.5 py-0.5 bg-[#F3F5FA] text-[#808191] rounded font-medium">
                  {tool.category}
                </span>
              </div>
              <p className={`text-[#808191] mb-3 leading-relaxed ${
                isPrimary ? 'text-xs line-clamp-2' : 'text-[11px] line-clamp-1'
              }`}>
                {tool.description}
              </p>
              <div className={`flex items-center justify-between ${isPrimary ? 'pt-3 border-t border-[#E8ECF3]' : 'pt-2'}`}>
                <span className="text-[11px] text-[#808191]">
                  相关：<span className="text-[#6C5DD3]">{tool.related}</span>
                </span>
                <span className={`text-[#6C5DD3] font-medium group-hover:underline ${
                  isPrimary ? 'text-xs' : 'text-[11px]'
                }`}>
                  立即使用 →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
