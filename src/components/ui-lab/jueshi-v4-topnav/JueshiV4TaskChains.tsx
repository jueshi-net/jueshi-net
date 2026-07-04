'use client';

import React from 'react';
import Link from 'next/link';
import { Package, DollarSign, GraduationCap, MapPin, ShoppingBag, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';

const taskChains = [
  {
    id: 'ship',
    icon: Package,
    title: '我要寄国际包裹',
    description: '从选择物流到清关提货，完整流程指引',
    steps: ['选择物流商', '填写运单', '打包发货', '跟踪查询', '清关提货'],
    tools: ['运费计算', '邮编查询', '地址解析'],
    color: 'bg-orange-50 text-orange-500',
  },
  {
    id: 'quote',
    icon: DollarSign,
    title: '我要做外贸报价',
    description: '快速生成专业报价单，计算利润',
    steps: ['成本核算', '运费估算', '关税查询', '生成报价单'],
    tools: ['HS编码', '汇率换算', '报价单生成'],
    color: 'bg-green-50 text-green-500',
  },
  {
    id: 'study',
    icon: GraduationCap,
    title: '我要准备出国留学',
    description: '从选校到签证，一站式准备清单',
    steps: ['选校定位', '材料准备', '语言考试', '签证申请', '行前准备'],
    tools: ['留学指南', '清单任务', '汇率换算'],
    color: 'bg-blue-50 text-blue-500',
  },
  {
    id: 'address',
    icon: MapPin,
    title: '我要查询海外地址',
    description: '精准定位海外地址，格式化输出',
    steps: ['搜索地址', '格式验证', '邮编匹配', '保存使用'],
    tools: ['地址解析', '邮编查询', '地图导航'],
    color: 'bg-purple-50 text-purple-500',
  },
  {
    id: 'ecommerce',
    icon: ShoppingBag,
    title: '我要做跨境电商',
    description: '从开店到运营，全流程工具支持',
    steps: ['平台选择', '开店注册', '选品上架', '物流配置', '订单管理'],
    tools: ['HS编码', '运费计算', '商业发票'],
    color: 'bg-pink-50 text-pink-500',
  },
  {
    id: 'official',
    icon: Landmark,
    title: '我要找官方资源',
    description: '各国政府、海关、移民局官网汇总',
    steps: ['选择国家', '查找机构', '访问官网', '办理业务'],
    tools: ['资源导航', '翻译工具', '清单任务'],
    color: 'bg-indigo-50 text-indigo-500',
  },
];

export default function JueshiV4TaskChains() {
  return (
    <section className="mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#11142D]">热门任务链</h2>
          <p className="text-xs text-[#808191] mt-0.5">不是单工具，而是办事流程</p>
        </div>
        <Link href="/tasks" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {taskChains.map((chain) => {
          const Icon = chain.icon;
          return (
            <Link
              key={chain.id}
              href={`/tasks/${chain.id}`}
              className="group bg-white rounded-xl p-4 md:p-5 border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${chain.color} flex-shrink-0`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">
                    {chain.title}
                  </h3>
                  <p className="text-xs text-[#808191] mt-0.5 line-clamp-1">
                    {chain.description}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="mb-3">
                <div className="flex items-center gap-1 flex-wrap">
                  {chain.steps.slice(0, 4).map((step, i) => (
                    <React.Fragment key={i}>
                      <span className="text-[10px] text-[#808191] bg-[#F3F5FA] px-1.5 py-0.5 rounded">
                        {step}
                      </span>
                      {i < 3 && i < chain.steps.length - 1 && (
                        <ArrowRight className="w-2.5 h-2.5 text-[#E8ECF3]" />
                      )}
                    </React.Fragment>
                  ))}
                  {chain.steps.length > 4 && (
                    <span className="text-[10px] text-[#808191]">+{chain.steps.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Tools */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#808191]">相关工具：</span>
                {chain.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] px-1.5 py-0.5 bg-[#6C5DD3]/8 text-[#6C5DD3] rounded font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
