/**
 * Forum-specific empty state component using the design system EmptyState.
 */
import React from "react";
import { EmptyState } from "@/components/design-system/EmptyState";
import { MessageSquare, Search, Plus } from "lucide-react";
import Link from "next/link";

interface ForumEmptyStateProps {
  variant: "no-posts" | "no-search-results" | "no-comments" | "no-categories";
  isLoggedIn?: boolean;
  searchQuery?: string;
  categoryKey?: string;
}

export function ForumEmptyState({
  variant,
  isLoggedIn = false,
  searchQuery,
  categoryKey,
}: ForumEmptyStateProps) {
  switch (variant) {
    case "no-posts":
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <EmptyState
            title="暂无帖子"
            description="成为第一个发帖的人吧！"
            icon={<MessageSquare className="w-8 h-8" />}
            primaryAction={
              isLoggedIn ? (
                <Link
                  href="/bbs/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  发布第一个帖子
                </Link>
              ) : (
                <Link
                  href="/login?callbackUrl=/bbs/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
                >
                  登录后发帖
                </Link>
              )
            }
          />
        </div>
      );

    case "no-search-results":
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <EmptyState
            title="没有找到匹配的帖子"
            description={
              searchQuery
                ? `没有找到与「${searchQuery}」相关的帖子，试试其他关键词`
                : "试试其他关键词或分类"
            }
            icon={<Search className="w-8 h-8" />}
            primaryAction={
              <Link
                href={categoryKey ? `/bbs/category/${categoryKey}` : "/bbs"}
                className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                返回全部
              </Link>
            }
          />
        </div>
      );

    case "no-comments":
      return (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">
            暂无回复，来做第一个回复的人吧！
          </p>
        </div>
      );

    case "no-categories":
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              暂无可用分类
            </h1>
            <p className="text-gray-500 mb-6">请联系管理员启用论坛分类</p>
            <Link
              href="/bbs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors"
            >
              返回论坛
            </Link>
          </div>
        </div>
      );

    default:
      return null;
  }
}
