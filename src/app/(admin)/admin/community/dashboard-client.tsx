"use client";

import Link from "next/link";
import { FileText, MessageSquare, Flag, Users, Clock, TrendingUp, Shield, Award } from "lucide-react";

export function AdminCommunityDashboard({ stats }: { stats: {
  postCount: number; commentCount: number; pendingPosts: number; pendingComments: number;
  reportCount: number; todayPosts: number; todayComments: number; userCount: number;
} }) {
  const cards = [
    { label: "帖子总数", value: stats.postCount, icon: FileText, href: "/admin/community/posts", color: "blue" },
    { label: "评论总数", value: stats.commentCount, icon: MessageSquare, href: "/admin/community/comments", color: "teal" },
    { label: "待审帖子", value: stats.pendingPosts, icon: Clock, href: "/admin/community/posts?status=pending", color: "amber" },
    { label: "待审评论", value: stats.pendingComments, icon: Clock, href: "/admin/community/comments?status=pending", color: "amber" },
    { label: "待处理举报", value: stats.reportCount, icon: Flag, href: "/admin/community/flagged", color: "red" },
    { label: "今日新帖", value: stats.todayPosts, icon: TrendingUp, href: "/admin/community/posts", color: "green" },
    { label: "今日评论", value: stats.todayComments, icon: TrendingUp, href: "/admin/community/comments", color: "green" },
    { label: "总用户数", value: stats.userCount, icon: Users, href: "/admin/community/reputation", color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          社区概览
        </h1>
        <p className="text-sm text-gray-500 mt-1">社区论坛管理面板</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.label} href={card.href}
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`w-5 h-5 text-${card.color}-500`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/community/posts" className="rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300">
          <h3 className="font-semibold text-gray-900">帖子管理</h3>
          <p className="text-sm text-gray-500 mt-1">审核、隐藏、置顶、加精帖子</p>
        </Link>
        <Link href="/admin/community/comments" className="rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300">
          <h3 className="font-semibold text-gray-900">评论管理</h3>
          <p className="text-sm text-gray-500 mt-1">审核、隐藏评论</p>
        </Link>
        <Link href="/admin/community/flagged" className="rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300">
          <h3 className="font-semibold text-gray-900">举报处理</h3>
          <p className="text-sm text-gray-500 mt-1">处理用户举报，驳回或成立</p>
        </Link>
        <Link href="/admin/community/reputation" className="rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300">
          <h3 className="font-semibold text-gray-900">荣誉管理</h3>
          <p className="text-sm text-gray-500 mt-1">手动调整用户荣誉值</p>
        </Link>
      </div>
    </div>
  );
}
