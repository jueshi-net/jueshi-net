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
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  hidden: "bg-gray-100 text-gray-700 border-gray-200",
  deleted: "bg-gray-100 text-gray-500 border-gray-200",
};

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

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), 4000);
  }

  const refresh = useCallback(() => {
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

  return (
    <div className="space-y-4">
      {/* Flash message */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "全部", count: statusCounts.all || 0 },
          { key: "published", label: "已发布", count: statusCounts.published || 0 },
          { key: "pending", label: "待审核", count: statusCounts.pending || 0 },
          { key: "rejected", label: "已驳回", count: statusCounts.rejected || 0 },
          { key: "hidden", label: "已隐藏", count: statusCounts.hidden || 0 },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/bbs/my-posts?status=${tab.key}`}
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

      {/* Posts list */}
      {posts.length === 0 ? (
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
              : "开始发帖分享你的经验吧"}
          </p>
          {currentStatus === "all" && (
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
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
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
                  post.title
                )}
              </h3>

              {/* Rejection reason */}
              {post.rejectionReason && (
                <div className="mb-2 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">
                    驳回原因
                    {post.rejectedAt &&
                      ` · ${new Date(post.rejectedAt).toLocaleString("zh-CN")}`}
                  </p>
                  <p className="text-sm text-red-600">{post.rejectionReason}</p>
                  <p className="text-xs text-red-500 mt-2">
                    修改后可重新提交审核
                  </p>
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
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
                {/* Edit - available for pending, rejected, published(own) */}
                {(post.status === "pending" ||
                  post.status === "rejected" ||
                  post.status === "published") && (
                  <Link
                    href={`/bbs/${post.slug}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {post.status === "rejected" ? "修改并重新提交" : "编辑"}
                  </Link>
                )}

                {/* View - only published */}
                {post.status === "published" && (
                  <Link
                    href={`/bbs/${post.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    查看
                  </Link>
                )}

                {/* Delete - only pending or rejected */}
                {(post.status === "pending" || post.status === "rejected") && (
                  <button
                    onClick={() => setDeleteId(post.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                )}
              </div>

              {/* Delete confirmation */}
              {deleteId === post.id && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
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
          ))}
        </div>
      )}

      {/* Total count */}
      {total > 0 && (
        <p className="text-center text-sm text-gray-500">共 {total} 条</p>
      )}
    </div>
  );
}
