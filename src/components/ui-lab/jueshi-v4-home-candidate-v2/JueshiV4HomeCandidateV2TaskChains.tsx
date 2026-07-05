'use client';

import React from 'react';
import Link from 'next/link';
import { Package, DollarSign, GraduationCap, MapPin, ShoppingBag, Landmark, ArrowRight, Clock, Users, Zap } from 'lucide-react';

const taskChains = [
  {
    id: 'ship',
    icon: Package,
    title: '我要寄国际包裹',
    description: '从选择物流到清关提货，完整流程指引',
    steps: ['选择物流商', '填写运单', '打包发货', '跟踪查询', '清关提货'],
    tools: ['运费计算', '邮编查询', '地址解析'],
    color: 'bg-orange-50 text-orange-500',
    gradient: 'from-orange-400 to-red-400',
    time: '30分钟',
    audience: '集运 / 国际快递',
  },
  {
    id: 'quote',
    icon: DollarSign,
    title: '我要做外贸报价',
    description: '快速生成专业报价单，计算利润',
    steps: ['成本核算', '运费估算', '关税查询', '生成报价单'],
    tools: ['HS编码', '汇率换算', '报价单生成'],
    color: 'bg-green-50 text-green-500',
    gradient: 'from-green-400 to-teal-400',
    time: '20分钟',
    audience: '外贸从业者',
  },
  {
    id: 'study',
    icon: GraduationCap,
    title: '我要准备出国留学',
    description: '从选校到签证，一站式准备清单',
    steps: ['选校定位', '材料准备', '语言考试', '签证申请', '行前准备'],
    tools: ['留学指南', '清单任务', '汇率换算'],
    color: 'bg-blue-50 text-blue-500',
    gradient: 'from-blue-400 to-indigo-400',
    time: '2-4周',
    audience: '留学生',
  },
  {
    id: 'address',
    icon: MapPin,
    title: '我要查询海外地址',
    description: '精准定位海外地址，格式化输出',
    steps: ['搜索地址', '格式验证', '邮编匹配', '保存使用'],
    tools: ['地址解析', '邮编查询', '地图导航'],
    color: 'bg-purple-50 text-purple-500',
    gradient: 'from-purple-400 to-pink-400',
    time: '5分钟',
    audience: '海外生活',
  },
  {
    id: 'ecommerce',
    icon: ShoppingBag,
    title: '我要做跨境电商',
    description: '从开店到运营，全流程工具支持',
    steps: ['平台选择', '开店注册', '选品上架', '物流配置', '订单管理'],
    tools: ['HS编码', '运费计算', '商业发票'],
    color: 'bg-pink-50 text-pink-500',
    gradient: 'from-pink-400 to-rose-400',
    time: '1-2天',
    audience: '跨境电商',
  },
  {
    id: 'official',
    icon: Landmark,
    title: '我要找官方资源',
    description: '各国政府、海关、移民局官网汇总',
    steps: ['选择国家', '查找机构', '访问官网', '办理业务'],
    tools: ['资源导航', '翻译工具', '清单任务'],
    color: 'bg-indigo-50 text-indigo-500',
    gradient: 'from-indigo-400 to-purple-400',
    time: '10分钟',
    audience: '所有用户',
  },
];

export default function JueshiV4HomeCandidateV2TaskChains() {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#11142D]">热门任务链</h2>
          <p className="text-xs text-[#808191] mt-0.5">不是单工具，而是办事流程</p>
        </div>
        <Link href="/tasks" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taskChains.map((chain, index) => {
          const Icon = chain.icon;
          const isPrimary = index < 2; // 前 2 个为核心任务链
          return (
            <Link
              key={chain.id}
              href={`/tasks/${chain.id}`}
              className="group bg-white rounded-xl overflow-hidden border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              {/* Top gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${chain.gradient}`}></div>

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 flex items-center justify-center rounded-lg ${chain.color} flex-shrink-0`}>
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors mb-1">
                      {chain.title}
                    </h3>
                    <p className="text-xs text-[#808191] line-clamp-1">
                      {chain.description}
                    </p>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mb-3 text-[10px] text-[#808191]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>预计 {chain.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{chain.audience}</span>
                  </div>
                </div>

                {/* Steps */}
                <div className="mb-3 p-3 bg-[#F8F9FC] rounded-lg">
                  <div className="flex items-center gap-1 flex-wrap">
                    {chain.steps.slice(0, 4).map((step, i) => (
                      <React.Fragment key={i}>
                        <span className="text-[10px] text-[#808191] bg-white px-2 py-1 rounded border border-[#E8ECF3]">
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
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <span className="text-[10px] text-[#808191]">相关工具：</span>
                  {chain.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] px-2 py-0.5 bg-[#6C5DD3]/8 text-[#6C5DD3] rounded font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                {/* CTA - Primary or Light */}
                {isPrimary ? (
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all group-hover:shadow-md">
                    <Zap className="w-3.5 h-3.5" />
                    开始任务
                  </button>
                ) : (
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F3F5FA] text-[#6C5DD3] rounded-lg text-xs font-medium hover:bg-[#6C5DD3]/8 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                    查看详情
                  </button>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
