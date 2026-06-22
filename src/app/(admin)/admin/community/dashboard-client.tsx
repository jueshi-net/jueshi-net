"use client";

import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Flag,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Award,
  EyeOff,
  ArrowRight,
} from "lucide-react";

interface TopHonorUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  honorScore: number;
}

export function AdminCommunityDashboard({
  stats,
  topHonorUsers,
}: {
  stats: {
    postCount: number;
    commentCount: number;
    pendingPosts: number;
    pendingComments: number;
    reportCount: number;
    todayPosts: number;
    todayComments: number;
    userCount: number;
    hiddenPosts: number;
    hiddenComments: number;
    hiddenCount: number;
  };
  topHonorUsers: TopHonorUser[];
}) {
  const cards = [
    {
      label: "帖子总数",
      value: stats.postCount,
      icon: FileText,
      href: "/admin/community/posts",
      color: "blue",
    },
    {
      label: "评论总数",
      value: stats.commentCount,
      icon: MessageSquare,
      href: "/admin/community/comments",
      color: "teal",
    },
    {
      label: "待审帖子",
      value: stats.pendingPosts,
      icon: Clock,
      href: "/admin/community/posts?status=pending",
      color: "amber",
    },
    {
      label: "待审评论",
      value: stats.pendingComments,
      icon: Clock,
      href: "/admin/community/comments?status=pending",
      color: "amber",
    },
    {
      label: "待处理举报",
      value: stats.reportCount,
      icon: Flag,
      href: "/admin/community/flagged",
      color: "red",
    },
    {
      label: "隐藏内容",
      value: stats.hiddenCount,
      icon: EyeOff,
      href: "/admin/community/posts?status=hidden",
      color: "rose",
    },
    {
      label: "今日新帖",
      value: stats.todayPosts,
      icon: TrendingUp,
      href: "/admin/community/posts",
      color: "green",
    },
    {
      label: "今日评论",
      value: stats.todayComments,
      icon: TrendingUp,
      href: "/admin/community/comments",
      color: "green",
    },
    {
      label: "总用户数",
      value: stats.userCount,
      icon: Users,
      href: "/admin/community/reputation",
      color: "indigo",
    },
  ];

  const quickActions = [
    {
      title: "帖子管理",
      desc: "审核、隐藏、置顶、加精帖子",
      href: "/admin/community/posts",
    },
    {
      title: "评论管理",
      desc: "审核、隐藏评论",
      href: "/admin/community/comments",
    },
    {
      title: "举报处理",
      desc: "处理用户举报，驳回或成立",
      href: "/admin/community/flagged",
    },
    {
      title: "荣誉管理",
      desc: "手动调整用户荣誉值",
      href: "/admin/community/reputation",
    },
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`w-5 h-5 text-${card.color}-500`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 快捷操作 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-3">快捷操作</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="group rounded-lg border border-gray-100 p-3 hover:border-teal-300 hover:bg-teal-50/30 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-900">
                    {a.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 高荣誉用户 Top 5 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
            <Award className="w-4 h-4 text-amber-500" />
            高荣誉用户 Top 5
          </h3>
          {topHonorUsers.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">暂无数据</p>
          ) : (
            <ul className="space-y-2">
              {topHonorUsers.map((u, idx) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? "bg-amber-100 text-amber-700"
                        : idx === 1
                        ? "bg-gray-200 text-gray-600"
                        : idx === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {u.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {u.name || u.email}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {u.email}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium shrink-0">
                    <Award className="w-3 h-3" />
                    {u.honorScore}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
