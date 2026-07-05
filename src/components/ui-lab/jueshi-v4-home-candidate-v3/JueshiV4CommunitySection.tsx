'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Users, FileText, ArrowRight, Flame, Clock, Star } from 'lucide-react';

const communityStats = {
  todayDiscussions: 128,
  activeUsers: 3280,
  newPosts: 24,
};

const hotPosts = [
  {
    id: 1,
    title: '新加坡集运敏感货怎么选线路？',
    category: '集运物流',
    replies: 42,
    time: '2小时前',
    tag: '热门讨论',
  },
  {
    id: 2,
    title: '加拿大租房看房有哪些坑？',
    category: '留学生活',
    replies: 38,
    time: '3小时前',
    tag: '最新回复',
  },
  {
    id: 3,
    title: '做外贸报价单怎么避免漏项？',
    category: '外贸单据',
    replies: 31,
    time: '5小时前',
    tag: '精华帖',
  },
  {
    id: 4,
    title: '留学生出国前哪些东西必须提前准备？',
    category: '留学生活',
    replies: 28,
    time: '6小时前',
    tag: '热门讨论',
  },
  {
    id: 5,
    title: 'PayPal / Wise 收款怎么选择？',
    category: '支付收款',
    replies: 25,
    time: '8小时前',
    tag: '最新回复',
  },
];

const categories = [
  { name: '集运物流', count: 1280, color: 'bg-orange-50 text-orange-500' },
  { name: '留学生活', count: 980, color: 'bg-blue-50 text-blue-500' },
  { name: '跨境电商', count: 756, color: 'bg-green-50 text-green-500' },
  { name: '官方资源', count: 642, color: 'bg-purple-50 text-purple-500' },
  { name: '外贸单据', count: 528, color: 'bg-cyan-50 text-cyan-500' },
  { name: '支付收款', count: 415, color: 'bg-pink-50 text-pink-500' },
];

const tagStyles: Record<string, { icon: typeof Flame; color: string }> = {
  '热门讨论': { icon: Flame, color: 'bg-red-50 text-red-500' },
  '最新回复': { icon: Clock, color: 'bg-blue-50 text-blue-500' },
  '精华帖': { icon: Star, color: 'bg-yellow-50 text-yellow-600' },
};

export default function JueshiV4CommunitySection() {
  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#11142D]">社区论坛</h2>
          <p className="text-xs text-[#808191] mt-0.5">
            海外生活、跨境业务、集运物流、留学准备，一起交流真实经验
          </p>
        </div>
        <Link href="/community" className="inline-flex items-center gap-1 text-xs text-[#6C5DD3] hover:underline font-medium">
          进入社区
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Left: Community overview card */}
        <div className="bg-white rounded-xl border border-[#E8ECF3] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#6C5DD3]/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#6C5DD3]" />
            </div>
            <h3 className="text-sm font-bold text-[#11142D]">社区总览</h3>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#6C5DD3]" />
                <span className="text-xs text-[#808191]">今日讨论</span>
              </div>
              <span className="text-sm font-bold text-[#11142D]">{communityStats.todayDiscussions}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#3F8CFF]" />
                <span className="text-xs text-[#808191]">活跃用户</span>
              </div>
              <span className="text-sm font-bold text-[#11142D]">{communityStats.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF754C]" />
                <span className="text-xs text-[#808191]">新增经验帖</span>
              </div>
              <span className="text-sm font-bold text-[#11142D]">{communityStats.newPosts}</span>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-[#11142D] mb-2">热门分类</h4>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat.name}
                  className={`text-[11px] px-2 py-1 rounded-md font-medium ${cat.color}`}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/community"
            className="block w-full text-center py-2.5 bg-[#6C5DD3] text-white rounded-lg text-xs font-medium hover:bg-[#5A4FBF] transition-colors"
          >
            进入社区
          </Link>
        </div>

        {/* Right: Hot posts */}
        <div className="bg-white rounded-xl border border-[#E8ECF3] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#11142D]">热门讨论</h3>
            <Link href="/community" className="text-[11px] text-[#6C5DD3] hover:underline">
              查看更多
            </Link>
          </div>

          <div className="space-y-3">
            {hotPosts.map((post) => {
              const tagStyle = tagStyles[post.tag] || tagStyles['热门讨论'];
              const TagIcon = tagStyle.icon;
              return (
                <Link
                  key={post.id}
                  href={`/community/posts/${post.id}`}
                  className="group block p-3 bg-[#F8F9FC] rounded-lg hover:bg-[#F3F5FA] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-medium text-[#11142D] group-hover:text-[#6C5DD3] transition-colors line-clamp-1">
                      {post.title}
                    </h4>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${tagStyle.color}`}>
                      <TagIcon className="w-2.5 h-2.5" />
                      {post.tag}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#808191]">
                    <span className={`px-1.5 py-0.5 rounded font-medium ${categories.find(c => c.name === post.category)?.color || 'bg-gray-50 text-gray-500'}`}>
                      {post.category}
                    </span>
                    <span>{post.replies} 回复</span>
                    <span>{post.time}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
