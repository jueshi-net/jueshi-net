'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, CreditCard, ShoppingBag, Truck, Coffee, GraduationCap, ArrowRight } from 'lucide-react';

const resources = [
  {
    id: 'official',
    icon: Landmark,
    title: '官方机构',
    description: '各国政府、海关、移民局官方网站',
    count: 28,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: '支付收款',
    description: '国际支付、收款、换汇平台',
    count: 15,
    color: 'bg-green-50 text-green-500',
  },
  {
    id: 'ecommerce',
    icon: ShoppingBag,
    title: '跨境电商',
    description: 'Amazon、eBay、Shopee 等平台',
    count: 22,
    color: 'bg-purple-50 text-purple-500',
  },
  {
    id: 'logistics',
    icon: Truck,
    title: '物流查询',
    description: '国际快递、集运、货代公司',
    count: 35,
    color: 'bg-orange-50 text-orange-500',
  },
  {
    id: 'overseas',
    icon: Coffee,
    title: '海外生活',
    description: '租房、银行、手机、生活必备',
    count: 42,
    color: 'bg-pink-50 text-pink-500',
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: '留学教育',
    description: '院校申请、签证、奖学金',
    count: 18,
    color: 'bg-indigo-50 text-indigo-500',
  },
];

export default function JueshiV4ResourceNav() {
  return (
    <section className="mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#11142D]">资源导航</h2>
        <Link href="/resources" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Link
              key={resource.id}
              href={`/resources/${resource.id}`}
              className="group bg-white rounded-xl p-4 md:p-5 border border-[#E8ECF3] hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 flex items-center justify-center rounded-lg ${resource.color} flex-shrink-0`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-[#11142D] text-sm group-hover:text-[#6C5DD3] transition-colors">
                      {resource.title}
                    </h3>
                    <span className="text-xs px-1.5 py-0.5 bg-[#F3F5FA] text-[#808191] rounded-md font-medium">
                      {resource.count}
                    </span>
                  </div>
                  <p className="text-xs text-[#808191] line-clamp-2">
                    {resource.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
