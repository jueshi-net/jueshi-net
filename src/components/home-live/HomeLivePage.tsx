'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Mail, Package, RefreshCw, Truck, FileText, CheckSquare, ArrowRight, TrendingUp, Compass, Bookmark, Search, Zap, Clock, Award, Sparkles, Heart, MapPin, Receipt, Container, Star } from 'lucide-react';

// 工具配置
const quickTools = [
  { icon: Mail, label: '邮编查询', color: 'from-blue-400 to-blue-500', href: '/tools/postal-code', testId: 'home-live-tool-postal-code' },
  { icon: Package, label: 'HS编码', color: 'from-purple-400 to-purple-500', href: '/tools/hs-code', testId: 'home-live-tool-hs-code' },
  { icon: RefreshCw, label: '汇率换算', color: 'from-green-400 to-green-500', href: '/tools/exchange-rate', testId: 'home-live-tool-exchange-rate' },
  { icon: Truck, label: '运费计算', color: 'from-orange-400 to-orange-500', href: '/tools/shipping-calculator', testId: 'home-live-tool-shipping-calculator' },
  { icon: FileText, label: '单据生成', color: 'from-cyan-400 to-blue-400', href: '/tools/commercial-invoice', testId: 'home-live-tool-commercial-invoice' },
  { icon: CheckSquare, label: '清单任务', color: 'from-pink-400 to-rose-400', href: '/checklists', testId: 'home-live-tool-checklists' },
];

// 任务配置
const quickTasks = [
  { label: '寄国际包裹', icon: '📦', href: '/tools/shipping-calculator', testId: 'home-live-task-ship-international' },
  { label: '做外贸报价', icon: '💰', href: '/tools/quote', testId: 'home-live-task-quote' },
  { label: '准备出国留学', icon: '🎓', href: '/checklists/student-first-abroad', testId: 'home-live-task-study-abroad' },
];

// 信任统计
const trustStats = [
  { icon: TrendingUp, label: '50+', desc: '实用工具' },
  { icon: Compass, label: '30+', desc: '清单指南' },
  { icon: Bookmark, label: '100+', desc: '资源导航' },
];

// 高频工具数据
const highFreqTools = [
  { id: 'shipping-calculator', icon: Truck, title: '运费计算器', description: '快速计算国际快递运费，支持多家物流商比价', category: '物流', color: 'from-orange-400 to-red-400', status: '热门', related: '物流查询' },
  { id: 'hs-code', icon: Package, title: 'HS编码查询', description: '查询商品海关编码，了解关税税率和监管条件', category: '外贸', color: 'from-blue-400 to-indigo-400', status: '常用', related: '商业发票' },
  { id: 'exchange-rate', icon: RefreshCw, title: '汇率换算', description: '实时汇率查询，支持多种货币换算和历史走势', category: '金融', color: 'from-green-400 to-teal-400', status: '热门', related: '外贸报价' },
  { id: 'postal-code', icon: Mail, title: '邮编查询', description: '全球邮编查询，快速定位地址对应邮编', category: '地址', color: 'from-purple-400 to-pink-400', status: '推荐', related: '地址格式化' },
  { id: 'invoice', icon: FileText, title: '发票生成', description: '快速生成商业发票、形式发票等外贸单据', category: '单据', color: 'from-cyan-400 to-blue-400', status: '新增', related: '报价单' },
  { id: 'address-formatter', icon: MapPin, title: '地址格式化', description: '智能解析地址格式，标准化国际地址', category: '地址', color: 'from-pink-400 to-rose-400', status: '推荐', related: '邮编查询' },
  { id: 'quote', icon: Receipt, title: '报价单', description: '快速生成专业外贸报价单，支持多币种', category: '外贸', color: 'from-indigo-400 to-purple-400', status: '新增', related: '商业发票' },
  { id: 'container', icon: Container, title: '集装箱尺寸', description: '查询标准集装箱尺寸，计算装柜方案', category: '物流', color: 'from-yellow-400 to-orange-400', status: '常用', related: '运费计算' },
];

// 任务链数据
const taskChains = [
  { id: 'ship', title: '我要寄国际包裹', description: '从选择物流到清关提货，完整流程指引', time: '30分钟', audience: '集运 / 国际快递', steps: ['选择物流商', '填写运单', '打包发货', '跟踪查询'], related: ['运费计算', '邮编查询', '地址解析'] },
  { id: 'quote', title: '我要做外贸报价', description: '快速生成专业报价单，计算利润', time: '20分钟', audience: '外贸从业者', steps: ['成本核算', '运费估算', '关税查询', '生成报价单'], related: ['HS编码', '汇率换算', '报价单生成'] },
  { id: 'study', title: '我要准备出国留学', description: '从选校到签证，一站式准备清单', time: '2-4周', audience: '留学生', steps: ['选校定位', '材料准备', '语言考试', '签证申请'], related: ['留学指南', '清单任务', '汇率换算'] },
  { id: 'address', title: '我要查询海外地址', description: '精准定位海外地址，格式化输出', time: '5分钟', audience: '海外生活', steps: ['搜索地址', '格式验证', '邮编匹配', '保存使用'], related: ['地址解析', '邮编查询', '地图导航'] },
  { id: 'ecommerce', title: '我要做跨境电商', description: '从开店到运营，全流程工具支持', time: '1-2天', audience: '跨境电商', steps: ['平台选择', '开店注册', '选品上架', '物流配置'], related: ['HS编码', '运费计算', '商业发票'] },
  { id: 'official', title: '我要找官方资源', description: '各国政府、海关、移民局官网汇总', time: '10分钟', audience: '所有用户', steps: ['选择国家', '查找机构', '访问官网', '办理业务'], related: ['资源导航', '翻译工具', '清单任务'] },
];

// Header 组件
function HomeLiveHeader() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const displayName = session?.user?.name || session?.user?.email || '用户';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8ECF3] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px]">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image src="/logo.svg" alt="绝世百宝箱" width={160} height={44} className="h-[44px] w-auto object-contain" priority />
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 rounded-lg text-sm font-medium text-[#6C5DD3] bg-[#6C5DD3]/8">首页</Link>
              <Link href="/tools" className="px-3 py-2 rounded-lg text-sm font-medium text-[#808191] hover:text-[#11142D] hover:bg-[#F3F5FA]">工具</Link>
              <Link href="/checklists" className="px-3 py-2 rounded-lg text-sm font-medium text-[#808191] hover:text-[#11142D] hover:bg-[#F3F5FA]">清单</Link>
              <Link href="/guides" className="px-3 py-2 rounded-lg text-sm font-medium text-[#808191] hover:text-[#11142D] hover:bg-[#F3F5FA]">指南</Link>
              <Link href="/resources" className="px-3 py-2 rounded-lg text-sm font-medium text-[#808191] hover:text-[#11142D] hover:bg-[#F3F5FA]">资源</Link>
            </nav>
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808191]" />
              <input type="text" placeholder="搜索工具、指南、资源..." className="w-full pl-10 pr-4 py-2.5 bg-[#F3F5FA] border border-transparent rounded-xl text-sm text-[#11142D] placeholder-[#808191] focus:outline-none focus:border-[#6C5DD3]/30 focus:bg-white transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/workspace" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[#6C5DD3] hover:bg-[#6C5DD3]/8 rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">签到</span>
            </Link>
            {isLoggedIn ? (
              <Link href="/workspace" className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-[#F3F5FA] rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-[#11142D] max-w-[100px] truncate">{displayName}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5A4FBF] transition-colors">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Hero 组件
function HomeLiveHero() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const displayName = session?.user?.name || session?.user?.email || '用户';

  return (
    <section className="mb-6 md:mb-8">
      <div className="relative overflow-hidden rounded-[28px] border border-[#E8ECF3] shadow-[0_20px_50px_rgba(108,93,211,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C5DD3]/5 via-[#3F8CFF]/3 to-[#FF754C]/5"></div>
        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-8 lg:gap-10 items-start">
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[#6C5DD3]/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#6C5DD3] rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-[#6C5DD3]">海外生活</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[#3F8CFF]/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#3F8CFF] rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-[#3F8CFF]">跨境工具</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-[#FF754C]/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#FF754C] rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-[#FF754C]">实用清单</span>
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#11142D] mb-3 leading-tight">
                海外华人<span className="bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] bg-clip-text text-transparent">实用工具箱</span>
              </h1>
              <p className="text-[#808191] text-sm md:text-base mb-5 max-w-lg leading-relaxed">
                集运物流、外贸单据、跨境电商、留学生活，一站式解决海外生活工作中的各种实用需求
              </p>
              <div className="flex flex-wrap gap-3 mb-5">
                <Link href="/tools" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-all shadow-lg shadow-[#6C5DD3]/20 hover:shadow-xl hover:shadow-[#6C5DD3]/30 hover:-translate-y-0.5">
                  浏览全部工具<ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/checklists" className="px-5 py-2.5 bg-white text-[#6C5DD3] border border-[#6C5DD3]/20 rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/5 transition-all">
                  查看清单指南
                </Link>
              </div>
              <div className="flex items-center gap-5 md:gap-6 mb-5">
                {trustStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 flex items-center justify-center bg-[#6C5DD3]/10 rounded-lg">
                        <Icon className="w-3.5 h-3.5 text-[#6C5DD3]" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-[#11142D]">{stat.label}</div>
                        <div className="text-[11px] text-[#808191]">{stat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {isLoggedIn ? (
                <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-[#E8ECF3]/60 shadow-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-base">🦀</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#11142D] truncate">{displayName}</h4>
                      <p className="text-[11px] text-[#808191]">欢迎回来</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/workspace" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-lg text-[11px] font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all">
                      <Sparkles className="w-3 h-3" />每日签到
                    </Link>
                    <Link href="/workspace" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F3F5FA] text-[#6C5DD3] rounded-lg text-[11px] font-medium hover:bg-[#6C5DD3]/8 transition-colors">
                      查看工作台<ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-[#E8ECF3]/60 shadow-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
                      <span className="text-base">🦀</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#11142D]">登录后保存你的工具记录</h4>
                      <p className="text-[11px] text-[#808191]">收藏常用工具、保存清单进度、解锁等级勋章</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/login" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-lg text-[11px] font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all">
                      立即登录
                    </Link>
                    <Link href="/tools" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F3F5FA] text-[#6C5DD3] rounded-lg text-[11px] font-medium hover:bg-[#6C5DD3]/8 transition-colors">
                      浏览工具<ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="relative hidden lg:block">
              <div className="relative bg-white/80 backdrop-blur-md rounded-3xl border border-[#E8ECF3]/60 shadow-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">🛠️</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#11142D]">今日常用工具</h3>
                  </div>
                  <span className="text-[11px] text-[#808191]">6 个工具</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {quickTools.map((tool, i) => {
                    const Icon = tool.icon;
                    return (
                      <Link key={i} href={tool.href} data-testid={tool.testId} className="flex flex-col items-center gap-1.5 p-2.5 bg-gradient-to-br from-[#F8F9FC] to-[#F3F5FA] rounded-xl border border-[#E8ECF3] hover:shadow-md hover:border-[#6C5DD3]/20 transition-all group">
                        <div className={`w-9 h-9 flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-lg shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-medium text-[#11142D] group-hover:text-[#6C5DD3] transition-colors">{tool.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mb-3 p-2.5 bg-[#F8F9FC] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3 h-3 text-[#FF754C]" />
                    <span className="text-[11px] font-semibold text-[#11142D]">快捷任务</span>
                  </div>
                  <div className="flex gap-1.5">
                    {quickTasks.map((task, i) => (
                      <Link key={i} href={task.href} data-testid={task.testId} className="flex-1 flex items-center gap-1 p-1.5 bg-white rounded-lg border border-[#E8ECF3] hover:border-[#6C5DD3]/20 hover:shadow-sm transition-all">
                        <span className="text-xs">{task.icon}</span>
                        <span className="text-[11px] text-[#11142D] font-medium">{task.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 高频工具组件
function HomeLiveToolGrid() {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#11142D]">高频工具</h2>
          <p className="text-xs text-[#808191] mt-0.5">最常用的实用工具，快速解决您的问题</p>
        </div>
        <Link href="/tools" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部<ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highFreqTools.map((tool, index) => {
          const Icon = tool.icon;
          const isPrimary = index < 4;
          return (
            <Link key={tool.id} href={`/tools/${tool.id}`} className={`group bg-white rounded-xl border border-[#E8ECF3] transition-all ${isPrimary ? 'p-5 hover:shadow-[0_18px_45px_rgba(17,20,45,0.10)] hover:border-[#6C5DD3]/20' : 'p-4 hover:shadow-md hover:border-[#6C5DD3]/10'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`flex items-center justify-center bg-gradient-to-br ${tool.color} rounded-xl shadow-sm ${isPrimary ? 'w-12 h-12' : 'w-10 h-10'}`}>
                  <Icon className={`text-white ${isPrimary ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 ${tool.status === '热门' ? 'bg-red-50 text-red-500' : tool.status === '新增' ? 'bg-green-50 text-green-500' : tool.status === '推荐' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'} rounded-md`}>
                  <Star className="w-3 h-3" />
                  <span className="text-[11px] font-medium">{tool.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold text-[#11142D] group-hover:text-[#6C5DD3] transition-colors ${isPrimary ? 'text-sm' : 'text-xs'}`}>{tool.title}</h3>
                <span className="text-[11px] px-1.5 py-0.5 bg-[#F3F5FA] text-[#808191] rounded font-medium">{tool.category}</span>
              </div>
              <p className={`text-[#808191] mb-3 leading-relaxed ${isPrimary ? 'text-xs line-clamp-2' : 'text-[11px] line-clamp-1'}`}>{tool.description}</p>
              <div className={`flex items-center justify-between ${isPrimary ? 'pt-3 border-t border-[#E8ECF3]' : 'pt-2'}`}>
                <span className="text-[11px] text-[#808191]">相关：<span className="text-[#6C5DD3]">{tool.related}</span></span>
                <span className={`text-[#6C5DD3] font-medium group-hover:underline ${isPrimary ? 'text-xs' : 'text-[11px]'}`}>立即使用 →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// 任务链组件
function HomeLiveTaskChains() {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#11142D]">热门任务链</h2>
          <p className="text-xs text-[#808191] mt-0.5">按步骤完成，轻松搞定复杂任务</p>
        </div>
        <Link href="/tasks" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          查看全部<ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taskChains.map((chain) => (
          <Link key={chain.id} href={`/tasks/${chain.id}`} className="group bg-white rounded-xl border border-[#E8ECF3] p-5 hover:shadow-lg hover:border-[#6C5DD3]/20 transition-all">
            <h3 className="text-sm font-bold text-[#11142D] group-hover:text-[#6C5DD3] transition-colors mb-2">{chain.title}</h3>
            <p className="text-xs text-[#808191] mb-3 line-clamp-2">{chain.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] px-2 py-0.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded font-medium">预计 {chain.time}</span>
              <span className="text-[11px] px-2 py-0.5 bg-[#F3F5FA] text-[#808191] rounded">{chain.audience}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {chain.steps.slice(0, 4).map((step, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 bg-[#F8F9FC] text-[#11142D] rounded border border-[#E8ECF3]">{step}</span>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E8ECF3]">
              <span className="text-[11px] text-[#808191]">相关工具：<span className="text-[#6C5DD3]">{chain.related.slice(0, 3).join('、')}</span></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Footer 组件
function HomeLiveFooter() {
  return (
    <footer className="bg-[#F8F9FC] border-t border-[#E8ECF3] mt-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-bold text-[#11142D] mb-3">工具</h4>
            <ul className="space-y-2">
              <li><Link href="/tools/postal-code" className="text-xs text-[#808191] hover:text-[#6C5DD3]">邮编查询</Link></li>
              <li><Link href="/tools/hs-code" className="text-xs text-[#808191] hover:text-[#6C5DD3]">HS编码</Link></li>
              <li><Link href="/tools/exchange-rate" className="text-xs text-[#808191] hover:text-[#6C5DD3]">汇率换算</Link></li>
              <li><Link href="/tools/shipping-calculator" className="text-xs text-[#808191] hover:text-[#6C5DD3]">运费计算</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#11142D] mb-3">清单</h4>
            <ul className="space-y-2">
              <li><Link href="/checklists" className="text-xs text-[#808191] hover:text-[#6C5DD3]">清单任务</Link></li>
              <li><Link href="/guides" className="text-xs text-[#808191] hover:text-[#6C5DD3]">指南文章</Link></li>
              <li><Link href="/topics" className="text-xs text-[#808191] hover:text-[#6C5DD3]">专题聚合</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#11142D] mb-3">资源</h4>
            <ul className="space-y-2">
              <li><Link href="/resources" className="text-xs text-[#808191] hover:text-[#6C5DD3]">资源导航</Link></li>
              <li><Link href="/community" className="text-xs text-[#808191] hover:text-[#6C5DD3]">社区论坛</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#11142D] mb-3">关于</h4>
            <ul className="space-y-2">
              <li><Link href="/workspace" className="text-xs text-[#808191] hover:text-[#6C5DD3]">我的工作台</Link></li>
              <li><Link href="/privacy" className="text-xs text-[#808191] hover:text-[#6C5DD3]">隐私政策</Link></li>
              <li><Link href="/terms" className="text-xs text-[#808191] hover:text-[#6C5DD3]">用户协议</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[#E8ECF3] text-center">
          <p className="text-xs text-[#808191]">© 2024 绝世百宝箱 - 海外华人的实用工具箱</p>
        </div>
      </div>
    </footer>
  );
}

// Bottom Tab 组件
function HomeLiveBottomTab() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8ECF3] md:hidden z-40">
      <div className="flex items-center justify-around h-16">
        <Link href="/" className="flex flex-col items-center gap-1 px-3 py-2 text-[#6C5DD3]">
          <span className="text-lg">🏠</span>
          <span className="text-[11px] font-medium">首页</span>
        </Link>
        <Link href="/tools" className="flex flex-col items-center gap-1 px-3 py-2 text-[#808191]">
          <span className="text-lg">🛠️</span>
          <span className="text-[11px] font-medium">工具</span>
        </Link>
        <Link href="/checklists" className="flex flex-col items-center gap-1 px-3 py-2 text-[#808191]">
          <span className="text-lg">📋</span>
          <span className="text-[11px] font-medium">清单</span>
        </Link>
        <Link href="/workspace" className="flex flex-col items-center gap-1 px-3 py-2 text-[#808191]">
          <span className="text-lg">👤</span>
          <span className="text-[11px] font-medium">我的</span>
        </Link>
      </div>
    </div>
  );
}

// 主页面组件
export default function HomeLivePage() {
  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="bg-yellow-400 text-black text-center py-1 text-xs font-bold">
        🔧 DEV MODE - HomeLivePage (v1.0.0)
      </div>
      <HomeLiveHeader />
      <main className="pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <HomeLiveHero />
          <HomeLiveToolGrid />
          <HomeLiveTaskChains />
        </div>
      </main>
      <HomeLiveFooter />
      <HomeLiveBottomTab />
    </div>
  );
}
