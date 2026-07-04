'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Search, Bell, Award, TrendingUp } from 'lucide-react';

const recentTools = [
  { id: 'postcode', label: '邮编查询', icon: '📮' },
  { id: 'currency', label: '汇率换算', icon: '💱' },
  { id: 'shipping', label: '运费计算', icon: '🚚' },
];

const hotSearches = [
  '新加坡邮编',
  'HS 编码',
  '加拿大留学',
  '商业发票',
];

const announcements = [
  { id: 1, title: '工具更新：新增集装箱尺寸计算器', date: '2024-01-15' },
  { id: 2, title: '新清单上线：出国留学准备清单', date: '2024-01-12' },
  { id: 3, title: '常用资源推荐：海关官方网站汇总', date: '2024-01-10' },
];

export default function JueshiV4RightRail() {
  return (
    <div className="space-y-5">
      {/* 今日签到卡 */}
      <div className="bg-white rounded-xl border border-[#E8ECF3] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#6C5DD3]" />
          <h3 className="text-sm font-semibold text-[#11142D]">今日签到</h3>
        </div>
        <p className="text-xs text-[#808191] mb-3">连续签到 7 天可获得额外奖励</p>
        <button className="w-full py-2 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow">
          立即签到
        </button>
      </div>

      {/* 最近使用 */}
      <div className="bg-white rounded-xl border border-[#E8ECF3] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#808191]" />
          <h3 className="text-sm font-semibold text-[#11142D]">最近使用</h3>
        </div>
        <div className="space-y-2">
          {recentTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="flex items-center gap-2 py-1.5 text-sm text-[#11142D] hover:text-[#6C5DD3] transition-colors"
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 热门搜索 */}
      <div className="bg-white rounded-xl border border-[#E8ECF3] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-[#808191]" />
          <h3 className="text-sm font-semibold text-[#11142D]">热门搜索</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotSearches.map((search) => (
            <Link
              key={search}
              href={`/search?q=${encodeURIComponent(search)}`}
              className="px-2.5 py-1 bg-[#F3F5FA] text-[#11142D] rounded-md text-xs hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3] transition-colors"
            >
              {search}
            </Link>
          ))}
        </div>
      </div>

      {/* 公告 / 更新 */}
      <div className="bg-white rounded-xl border border-[#E8ECF3] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-[#808191]" />
          <h3 className="text-sm font-semibold text-[#11142D]">公告 / 更新</h3>
        </div>
        <div className="space-y-2.5">
          {announcements.map((item) => (
            <div key={item.id} className="text-xs">
              <p className="text-[#11142D] line-clamp-1">{item.title}</p>
              <p className="text-[#808191] mt-0.5">{item.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 用户等级小卡 */}
      <div className="bg-gradient-to-br from-[#6C5DD3]/5 to-[#3F8CFF]/5 rounded-xl border border-[#6C5DD3]/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-[#6C5DD3]" />
          <h3 className="text-sm font-semibold text-[#11142D]">我的等级</h3>
        </div>
        <p className="text-xs text-[#808191] mb-2">当前等级：Lv.3 探索者</p>
        <div className="w-full bg-[#E8ECF3] rounded-full h-1.5 mb-2">
          <div className="bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] h-1.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <p className="text-[10px] text-[#808191]">距离下一级还需 350 经验</p>
      </div>
    </div>
  );
}
