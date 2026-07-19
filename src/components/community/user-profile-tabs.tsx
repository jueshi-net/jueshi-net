"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Award,
  Eye,
  Pin,
  Star,
  CheckCircle,
  Lock,
  Calendar,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────

interface PostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  viewCount: number;
  commentCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  isSolved: boolean;
  createdAt: string;
  category: { id: string; key: string; name: string };
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  isAccepted: boolean;
  post: {
    id: string;
    slug: string;
    title: string;
  };
}

interface BadgeItem {
  key: string;
  name: string;
  description: string | null;
  iconText: string;
  color: string;
  category: string;
  conditionText: string | null;
  awardedAt?: string;
}

interface UserProfileTabsProps {
  posts: PostItem[];
  comments: CommentItem[];
  earnedBadges: BadgeItem[];
  allForumBadges: BadgeItem[];
  isOwnProfile: boolean;
}

// ─── Color mapping (shared with UserTrustCard) ────────────

const COLOR_MAP: Record<string, string> = {
  "green-500": "bg-green-100 text-green-700 border-green-200",
  "teal-500": "bg-teal-100 text-teal-700 border-teal-200",
  "blue-500": "bg-blue-100 text-blue-700 border-blue-200",
  "amber-500": "bg-amber-100 text-amber-700 border-amber-200",
  "amber-600": "bg-amber-100 text-amber-800 border-amber-300",
  "purple-500": "bg-purple-100 text-purple-700 border-purple-200",
  "purple-600": "bg-purple-100 text-purple-800 border-purple-300",
  "rose-500": "bg-rose-100 text-rose-700 border-rose-200",
  "indigo-500": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "cyan-500": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "orange-500": "bg-orange-100 text-orange-700 border-orange-200",
  "emerald-500": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "pink-500": "bg-pink-100 text-pink-700 border-pink-200",
};

function getColorClass(color: string): string {
  return COLOR_MAP[color] || "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── Component ────────────────────────────────────────────

export function UserProfileTabs({
  posts,
  comments,
  earnedBadges,
  allForumBadges,
  isOwnProfile,
}: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "answers" | "badges">(
    "posts"
  );

  const tabs = [
    {
      key: "posts" as const,
      label: isOwnProfile ? "我的帖子" : "TA的帖子",
      count: posts.length,
      icon: FileText,
    },
    {
      key: "answers" as const,
      label: isOwnProfile ? "我的回答" : "TA的回答",
      count: comments.length,
      icon: MessageSquare,
    },
    {
      key: "badges" as const,
      label: "勋章",
      count: earnedBadges.length,
      icon: Award,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border-light">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 md:px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "text-brand border-brand"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4 md:p-5">
        {/* Posts tab */}
        {activeTab === "posts" && (
          <div className="space-y-2">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/bbs/${post.slug}`}
                  className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors line-clamp-1 flex items-center gap-1">
                        {post.isPinned && (
                          <Pin className="w-3 h-3 text-red-500 shrink-0" />
                        )}
                        {post.isFeatured && (
                          <Star className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                        {post.isSolved && (
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                        )}
                        {post.title}
                      </h4>
                      {post.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-0.5">
                          <FileText className="w-3 h-3" />
                          {post.category.name}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(post.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {post.commentCount}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {post.viewCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">
                {isOwnProfile ? "你还没有发布过帖子" : "该用户还没有发布过帖子"}
              </div>
            )}
          </div>
        )}

        {/* Answers tab */}
        {activeTab === "answers" && (
          <div className="space-y-2">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/bbs/${comment.post.slug}`}
                  className="block group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {comment.isAccepted && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                            <CheckCircle className="w-3 h-3" />
                            已采纳
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          回复了帖子
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors line-clamp-1">
                        {comment.post.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">
                {isOwnProfile ? "你还没有回复过帖子" : "该用户还没有回复过帖子"}
              </div>
            )}
          </div>
        )}

        {/* Badges tab */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allForumBadges.map((badge) => {
              const earned = earnedBadges.find((b) => b.key === badge.key);
              return (
                <div
                  key={badge.key}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    earned
                      ? `${getColorClass(badge.color)} border-current`
                      : "bg-gray-50 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.iconText}</div>
                  <div className="text-xs font-semibold text-gray-800">
                    {badge.name}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                    {badge.description || badge.conditionText}
                  </div>
                  {earned && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      {formatDateTime(earned.awardedAt!)}
                    </div>
                  )}
                </div>
              );
            })}
            {allForumBadges.length === 0 && (
              <div className="col-span-full text-center py-8 text-sm text-gray-400">
                暂无勋章
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
