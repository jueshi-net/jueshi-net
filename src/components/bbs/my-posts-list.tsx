"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface MyPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  isSolved: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; key: string; name: string };
  _count: { comments: number; likes: number; bookmarks: number };
  rejectionReason: string | null;
  rejectedAt: string | null;
}

interface MyPostsListProps {
  initialPosts: MyPost[];
  initialTotal: number;
  statusCounts: Record<string, number>;
  currentStatus: string;
  isLoggedIn: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  published: "已发布",
  pending: "待审核",
  rejected: "已驳回",
  hidden: "已隐藏",
  deleted: "已删除",
  draft: "草稿",
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  hidden: "bg-gray-100 text-gray-700 border-gray-200",
  deleted: "bg-gray-100 text-gray-500 border-gray-200",
  draft: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_NEXT_ACTION: Record<string, { label: string; href?: string; icon: "edit" | "eye" | "clock" } | null> = {
  draft: { label: "继续编辑并提交审核", icon: "edit" },
  pending: { label: "等待管理员审核", icon: "clock" },
  rejected: { label: "修改后重新提交", icon: "edit" },
  published: { label: "查看帖子", icon: "eye" },
  hidden: null,
  deleted: null,
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-CN");
}

export function MyPostsList({
  initialPosts,
  initialTotal,
  statusCounts,
  currentStatus,
  isLoggedIn,
}: MyPostsListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), 5000);
  }

  const refresh = useCallback(() => {
    setLoading(true);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/forum/my-posts?status=${currentStatus}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setTotal(data.total || 0);
        }
      } catch {
        flash("刷新失败");
      } finally {
        setLoading(false);
      }
    });
  }, [currentStatus]);

  async function handleDelete(postId: string) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/my-posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        const data = await res.json();
        if (res.ok) {
          flash("已删除");
          setDeleteId(null);
          refresh();
        } else {
          flash(data.error || "删除失败");
        }
      } catch {
        flash("网络错误");
      }
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-lg font-semibold text-gray-700 mb-2">请先登录</p>
        <p className="text-sm text-gray-500 mb-6">登录后查看您的内容</p>
        <Link
          href="/login?callbackUrl=/bbs/my-posts"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
        >
          登录 / 注册
        </Link>
      </div>
    );
  }

  // Stats summary
  const totalPosts = statusCounts.all || 0;
  const draftCount = statusCounts.draft || 0;
  const pendingCount = statusCounts.pending || 0;
  const rejectedCount = statusCounts.rejected || 0;
  const publishedCount = statusCounts.published || 0;

  return (
    <div className="space-y-4">
      {/* Flash message */}
      {message && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 flex items-center gap-2 shadow-lg"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/bbs/my-posts?status=published"
          className="bg-white rounded-xl border border-gray-200 p-3 hover:border-green-300 hover:bg-green-50/30 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-0.5">已发布</div>
          <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
        </Link>
        <Link
          href="/bbs/my-posts?status=draft"
          className="bg-white rounded-xl border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-0.5">草稿</div>
          <div className="text-2xl font-bold text-blue-600">{draftCount}</div>
        </Link>
        <Link
          href="/bbs/my-posts?status=pending"
          className="bg-white rounded-xl border border-gray-200 p-3 hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-0.5">待审核</div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
        </Link>
        <Link
          href="/bbs/my-posts?status=rejected"
          className="bg-white rounded-xl border border-gray-200 p-3 hover:border-red-300 hover:bg-red-50/30 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-0.5">已驳回</div>
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="帖子状态筛选">
        {[
          { key: "all", label: "全部", count: totalPosts },
          { key: "draft", label: "草稿", count: draftCount },
          { key: "published", label: "已发布", count: publishedCount },
          { key: "pending", label: "待审核", count: pendingCount },
          { key: "rejected", label: "已驳回", count: rejectedCount },
          { key: "hidden", label: "已隐藏", count: statusCounts.hidden || 0 },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/bbs/my-posts?status=${tab.key}`}
            role="tab"
            aria-selected={currentStatus === tab.key}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === tab.key
                ? "bg-brand text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
          </Link>
        ))}
      </div>

      {/* New post button */}
      <div className="flex justify-end">
        <Link
          href="/bbs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" />
          发布新帖
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3" aria-label="加载中">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Posts list */}
      {!loading && posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-1">
            暂无帖子
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {currentStatus === "rejected"
              ? "没有被驳回的帖子"
              : currentStatus === "pending"
              ? "没有待审核的帖子"
              : currentStatus === "draft"
              ? "没有草稿，开始写一篇吧"
              : "开始发帖分享你的经验吧"}
          </p>
          {(currentStatus === "all" || currentStatus === "draft") && (
            <Link
              href="/bbs/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
            >
              <Plus className="w-4 h-4" />
              发布第一个帖子
            </Link>
          )}
        </div>
      ) : (
        !loading && (
          <div className="space-y-3">
            {posts.map((post) => {
              const nextAction = STATUS_NEXT_ACTION[post.status];
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                >
                  {/* Status badge + category */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                        STATUS_COLORS[post.status] ||
                        "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                      {post.category.name}
                    </span>
                    {post.isPinned && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-200">
                        置顶
                      </span>
                    )}
                    {post.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600 border border-amber-200">
                        精华
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 break-words mb-2">
                    {post.status === "published" ? (
                      <Link
                        href={`/bbs/${post.slug}`}
                        className="hover:text-brand"
                      >
                        {post.title}
                      </Link>
                    ) : (
                      <Link
                        href={`/bbs/my-posts/${post.slug}`}
                        className="hover:text-brand"
                      >
                        {post.title || "无标题草稿"}
                      </Link>
                    )}
                  </h3>

                  {/* Next action hint */}
                  {nextAction && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
                      {nextAction.icon === "edit" && <Edit className="w-3 h-3" />}
                      {nextAction.icon === "eye" && <Eye className="w-3 h-3" />}
                      {nextAction.icon === "clock" && <Clock className="w-3 h-3" />}
                      <span>{nextAction.label}</span>
                    </div>
                  )}

                  {/* Rejection reason */}
                  {post.rejectionReason && (
                    <div className="mb-2 rounded-lg bg-red-50 border border-red-200 p-3">
                      <p className="text-xs font-medium text-red-700 mb-1">
                        驳回原因
                        {post.rejectedAt &&
                          ` · ${formatRelativeTime(post.rejectedAt)}`}
                      </p>
                      <p className="text-sm text-red-600">{post.rejectionReason}</p>
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        修改后可重新提交审核
                      </p>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1" title={`更新于 ${new Date(post.updatedAt).toLocaleString("zh-CN")}`}>
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(post.updatedAt)}
                    </span>
                    {post.status === "published" && (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.viewCount} 浏览
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post._count.comments} 回复
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {post._count.likes} 赞
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Bookmark className="w-3 h-3" />
                          {post._count.bookmarks} 收藏
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(post.status === "draft" ||
                      post.status === "pending" ||
                      post.status === "rejected" ||
                      post.status === "published") && (
                      <Link
                        href={`/bbs/${post.slug}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {post.status === "rejected" ? "修改并重新提交" : post.status === "draft" ? "继续编辑" : "编辑"}
                      </Link>
                    )}

                    {(post.status === "draft" || post.status === "pending" || post.status === "rejected") && (
                      <Link
                        href={`/bbs/my-posts/${post.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        预览
                      </Link>
                    )}

                    {post.status === "published" && (
                      <Link
                        href={`/bbs/${post.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看
                      </Link>
                    )}

                    {(post.status === "draft" || post.status === "pending" || post.status === "rejected") && (
                      <button
                        onClick={() => setDeleteId(post.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                        aria-label={`删除帖子 ${post.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        删除
                      </button>
                    )}
                  </div>

                  {/* Delete confirmation */}
                  {deleteId === post.id && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3" role="alertdialog" aria-label="确认删除">
                      <p className="text-sm text-red-700 mb-2">
                        确定要删除这篇帖子吗？此操作不可撤销。
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={busy}
                          className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          确认删除
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Total count */}
      {total > 0 && !loading && (
        <p className="text-center text-sm text-gray-500">共 {total} 条</p>
      )}
    </div>
  );
}
