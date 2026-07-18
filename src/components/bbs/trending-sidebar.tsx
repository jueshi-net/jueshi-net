"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, TrendingUp, MessageCircle, Award, Eye, Star, Users, AlertCircle } from "lucide-react";

interface TrendingPost {
  id: string;
  slug: string;
  title: string;
  viewCount: number;
  commentCount: number;
  isFeatured: boolean;
  score: number;
  user: { name: string | null; email: string };
  category: { key: string; name: string };
}

interface Contributor {
  userId: string;
  name: string | null;
  email: string;
  postCount: number;
  commentCount: number;
  totalScore: number;
  rank: number;
}

type TabType = "today" | "week" | "replies" | "featured" | "unanswered" | "contributors";

const TABS: { key: TabType; label: string; icon: typeof Flame }[] = [
  { key: "today", label: "今日热门", icon: Flame },
  { key: "week", label: "本周热门", icon: TrendingUp },
  { key: "replies", label: "最多回复", icon: MessageCircle },
  { key: "featured", label: "精华内容", icon: Award },
  { key: "unanswered", label: "待回答", icon: AlertCircle },
  { key: "contributors", label: "贡献榜", icon: Users },
];

export function TrendingSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const controller = new AbortController();

    const apiType = activeTab === "contributors" ? "contributors" : activeTab;
    fetch(`/api/forum/trending?type=${apiType}&limit=10`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (activeTab === "contributors") {
          setContributors(data.contributors || []);
        } else {
          setPosts(data.posts || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [activeTab]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Star className="h-4 w-4 text-orange-500" />
          社区推荐
        </h3>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-gray-100 px-3 py-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                activeTab === tab.key
                  ? "bg-orange-100 text-orange-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              aria-pressed={activeTab === tab.key}
            >
              <Icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 py-3">
        {loading ? (
          <div className="space-y-2" aria-busy="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-gray-400">
            加载失败，请稍后刷新
          </div>
        ) : activeTab === "contributors" ? (
          <ContributorList contributors={contributors} />
        ) : (
          <PostList posts={posts} showScore={activeTab !== "unanswered"} />
        )}
      </div>
    </div>
  );
}

function PostList({ posts, showScore }: { posts: TrendingPost[]; showScore: boolean }) {
  if (posts.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-400">暂无内容</div>;
  }

  return (
    <ul className="space-y-2">
      {posts.map((post, index) => (
        <li key={post.id}>
          <Link
            href={`/bbs/${post.slug}`}
            className="block rounded-md p-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm text-gray-800">{post.title}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {post.viewCount}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="h-3 w-3" />
                    {post.commentCount}
                  </span>
                  {showScore && post.score > 0 && (
                    <span className="text-orange-500">热度 {post.score}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ContributorList({ contributors }: { contributors: Contributor[] }) {
  if (contributors.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-400">暂无数据</div>;
  }

  return (
    <ul className="space-y-2">
      {contributors.map((c) => (
        <li key={c.userId}>
          <Link
            href={`/bbs?author=${c.userId}`}
            className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-50"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                c.rank === 1
                  ? "bg-yellow-100 text-yellow-700"
                  : c.rank === 2
                  ? "bg-gray-200 text-gray-700"
                  : c.rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {c.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-800">
                {c.name || c.email.slice(0, 4) + "***"}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>帖 {c.postCount}</span>
                <span>评 {c.commentCount}</span>
                <span className="text-orange-500">{c.totalScore} 分</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
