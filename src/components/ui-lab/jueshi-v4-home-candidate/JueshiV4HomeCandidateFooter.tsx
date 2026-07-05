'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const toolCategories = [
  { label: '邮编查询', href: '/tools/postcode' },
  { label: 'HS 编码', href: '/tools/hs-code' },
  { label: '汇率换算', href: '/tools/currency' },
  { label: '地址格式化', href: '/tools/address' },
  { label: '运费计算', href: '/tools/shipping' },
  { label: '商业发票', href: '/tools/invoice' },
  { label: '报价单', href: '/tools/quote' },
  { label: '集装箱尺寸', href: '/tools/container' },
];

const contentLinks = [
  { label: '清单任务', href: '/checklists' },
  { label: '指南文章', href: '/guides' },
  { label: '专题聚合', href: '/topics' },
  { label: '热门任务链', href: '/tasks' },
  { label: '留学指南', href: '/guides/study-abroad' },
  { label: '集运清单', href: '/checklists/shipping' },
];

const resourceLinks = [
  { label: '官方机构', href: '/resources/official' },
  { label: '支付收款', href: '/resources/payment' },
  { label: '跨境电商', href: '/resources/ecommerce' },
  { label: '物流查询', href: '/resources/logistics' },
  { label: '海外生活', href: '/resources/overseas' },
  { label: '留学教育', href: '/resources/education' },
];

const userLinks = [
  { label: '我的工作台', href: '/workspace' },
  { label: '我的收藏', href: '/favorites' },
  { label: '签到中心', href: '/checkin' },
  { label: '等级勋章', href: '/badges' },
  { label: '通知', href: '/notifications' },
  { label: '社区', href: '/community' },
];

export default function JueshiV4HomeCandidateFooter() {
  return (
    <footer className="bg-[#11142D] text-white">
      {/* CTA section */}
      <div className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">把常用工具保存到你的工作台</h3>
              <p className="text-sm text-white/60">登录后随时访问，不错过任何重要功能</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
              >
                立即登录
              </Link>
              <Link
                href="/tools"
                className="px-6 py-3 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
              >
                浏览工具
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="inline-flex items-center justify-center bg-white rounded-lg px-3 py-2 shadow-sm">
                <Image
                  src="/images/brand/jueshi-logo-crab.jpg"
                  alt="绝世百宝箱"
                  width={120}
                  height={32}
                  className="h-[32px] w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              海外华人与跨境业务的一站式实用工具箱，提供邮编、HS 编码、汇率、单据、清单、指南与资源导航。
            </p>
            <div className="flex gap-4">
              <Link href="/community" className="text-sm text-white/60 hover:text-white transition-colors">
                社区
              </Link>
              <Link href="/feedback" className="text-sm text-white/60 hover:text-white transition-colors">
                反馈
              </Link>
              <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                联系我们
              </Link>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-sm font-semibold mb-4">实用工具</h4>
            <ul className="space-y-2">
              {toolCategories.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div>
            <h4 className="text-sm font-semibold mb-4">内容与清单</h4>
            <ul className="space-y-2">
              {contentLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4">资源导航</h4>
            <ul className="space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User */}
          <div>
            <h4 className="text-sm font-semibold mb-4">用户中心</h4>
            <ul className="space-y-2">
              {userLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              © 2026 绝世百宝箱. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">
                隐私政策
              </Link>
              <Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">
                用户协议
              </Link>
              <Link href="/disclaimer" className="text-sm text-white/60 hover:text-white transition-colors">
                内容声明
              </Link>
              <Link href="/sitemap" className="text-sm text-white/60 hover:text-white transition-colors">
                站点地图
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
