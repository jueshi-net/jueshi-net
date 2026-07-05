'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Heart, Sparkles, CheckSquare, Clock, ArrowRight } from 'lucide-react';

export default function JueshiV4HomeCandidateWorkspace() {
  const isLoggedIn = true; // Mock

  if (!isLoggedIn) {
    return (
      <section className="mb-10">
        <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🦀</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-[#11142D] mb-2">
                登录后保存你的工具记录
              </h3>
              <p className="text-sm text-[#808191] mb-4">
                收藏常用工具、保存清单进度、解锁等级勋章
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-[#6C5DD3] text-white rounded-xl text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
                >
                  登录 / 注册
                </Link>
                <button className="px-5 py-2.5 bg-[#F3F5FA] text-[#6C5DD3] rounded-xl text-sm font-medium hover:bg-[#6C5DD3]/8 transition-colors">
                  先逛逛
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-sm overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-[#6C5DD3] via-[#3F8CFF] to-[#6C5DD3]"></div>

        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#6C5DD3]/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#6C5DD3]" />
              </div>
              <h2 className="text-base font-bold text-[#11142D]">我的工作台</h2>
            </div>
            <Link href="/workspace" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
              查看完整工作台
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Compact workspace content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                  <span className="text-lg">🦀</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF754C] rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-[9px] text-white font-bold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#11142D]">绝世工具玩家</h3>
                <p className="text-xs text-[#808191]">跨境探索者 · Lv.3</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5 text-[#FF754C] mb-1" />
                <span className="text-sm font-bold text-[#11142D]">12</span>
                <span className="text-[10px] text-[#808191]">收藏</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckSquare className="w-5 h-5 text-[#6C5DD3] mb-1" />
                <span className="text-sm font-bold text-[#11142D]">3</span>
                <span className="text-[10px] text-[#808191]">清单</span>
              </div>
              <div className="flex flex-col items-center">
                <Award className="w-5 h-5 text-[#3F8CFF] mb-1" />
                <span className="text-sm font-bold text-[#11142D]">6</span>
                <span className="text-[10px] text-[#808191]">勋章</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-all">
                <Sparkles className="w-3.5 h-3.5" />
                今日签到
              </button>
              <Link
                href="/favorites"
                className="flex items-center justify-center p-2.5 bg-[#F3F5FA] rounded-xl hover:bg-[#6C5DD3]/5 transition-colors"
              >
                <Heart className="w-4 h-4 text-[#6C5DD3]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
