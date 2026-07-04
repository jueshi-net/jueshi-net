'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Heart, Sparkles, UserCircle } from 'lucide-react';

export default function JueshiV4MobileProfileCard() {
  return (
    <div className="lg:hidden mb-6">
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-4">
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🦀</span>
          </div>

          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#11142D] truncate">绝世工具玩家</h3>
              <span className="text-xs px-1.5 py-0.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-full">
                Lv.3
              </span>
            </div>
            <p className="text-xs text-[#808191] mt-0.5">跨境探索者 · 连续签到 7 天</p>
          </div>

          {/* 快捷操作 */}
          <Link
            href="/workspace"
            className="p-2 bg-[#F3F5FA] rounded-lg hover:bg-[#6C5DD3]/5 transition-colors"
          >
            <UserCircle className="w-5 h-5 text-[#6C5DD3]" />
          </Link>
        </div>

        {/* 快捷统计 */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#E8ECF3]">
          <Link href="/favorites" className="flex flex-col items-center gap-1">
            <Heart className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D] font-medium">12</span>
            <span className="text-[10px] text-[#808191]">收藏</span>
          </Link>
          <Link href="/tasks" className="flex flex-col items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D] font-medium">3</span>
            <span className="text-[10px] text-[#808191]">清单</span>
          </Link>
          <Link href="/badges" className="flex flex-col items-center gap-1">
            <Award className="w-4 h-4 text-[#6C5DD3]" />
            <span className="text-xs text-[#11142D] font-medium">6</span>
            <span className="text-[10px] text-[#808191]">勋章</span>
          </Link>
          <Link href="/checkin" className="flex flex-col items-center gap-1">
            <span className="text-base">🔥</span>
            <span className="text-xs text-[#11142D] font-medium">7</span>
            <span className="text-[10px] text-[#808191]">连续</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
