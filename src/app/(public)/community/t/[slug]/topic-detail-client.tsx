"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Flag,
  Pin,
  Lock,
  Star,
  CheckCircle,
  Shield,
  Eye,
  Send,
  AlertCircle,
  Share2,
  Trash2,
  Sparkles,
  Link2,
  Award,
} from "lucide-react";
import {
  UserTrustCard,
  type TrustCardData,
} from "@/components/community/user-trust-card";

/* ----------------------------- Types ----------------------------- */

interface PostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  isSolved: boolean;
  acceptedCommentId: string | null;
  viewCount: number;
  commentCount: number;
  lastCommentAt: string | null;
  tags: string[];
  createdAt: string;
  relatedTool: string | null;
  relatedGuideId: string | null;
  relatedChecklistId: string | null;
  relatedTaskChainType: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    honorScore: number;
    createdAt: string;
  };
  category: {
    id: string;
    name: string;
    key: string;
    iconText: string | null;
    color: string | null;
  };
  relatedGuide: { slug: string; title: string } | null;
  relatedChecklist: { slug: string; title: string } | null;
}

interface CommentData {
  id: string;
  content: string;
  status: string;
  floorNumber: number;
  isAccepted: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    honorScore: number;
    role: string;
    levelKey: string | null;
  };
  likeCount: number;
  likedByMe: boolean;
}

interface Props {
  post: PostData;
  comments: CommentData[];
  authorTrustCard: TrustCardData | null;
  likeCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
}

/* --------------------------- Helpers ----------------------------- */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

function Avatar({
  name,
  image,
  size = "md",
}: {
  name: string | null;
  image: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  if (image) {
    return (
      <img
        src={image}
        alt={name || ""}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

/* --------------------------- Component --------------------------- */

export function TopicDetailClient({
  post,
  comments,
  authorTrustCard,
  likeCount,
  hasLiked,
  hasBookmarked,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: Props) {
  // Post-level state
  const [liked, setLiked] = useState(hasLiked);
  const [likes, setLikes] = useState(likeCount);
  const [bookmarked, setBookmarked] = useState(hasBookmarked);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [message, setMessage] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Comment list with local like/accept state
  const [commentList, setCommentList] = useState<CommentData[]>(comments);
  const [commentLikeBusy, setCommentLikeBusy] = useState<Record<string, boolean>>({});
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Admin state (local mirror)
  const [admin, setAdmin] = useState({
    isPinned: post.isPinned,
    isLocked: post.isLocked,
    isFeatured: post.isFeatured,
    status: post.status,
  });
  const [adminBusy, setAdminBusy] = useState(false);

  // Post solved/accepted state (accept action mutates)
  const [solved, setSolved] = useState(post.isSolved);
  const [acceptedCommentId, setAcceptedCommentId] = useState(
    post.acceptedCommentId
  );

  const isAuthor = !!currentUserId && currentUserId === post.user.id;
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(
    `/community/t/${post.slug}`
  )}`;

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), 3500);
  }

  /* ---- Post actions ---- */
  async function handleLike() {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }
    if (isAuthor) {
      flash("不能给自己的帖子点赞");
      return;
    }
    if (liked) {
      setLiked(false);
      setLikes((l) => l - 1);
      await fetch(`/api/forum/posts/${post.slug}/like`, {
        method: "DELETE",
      }).catch(() => {});
    } else {
      const res = await fetch(`/api/forum/posts/${post.slug}/like`, {
        method: "POST",
      });
      if (res.ok) {
        setLiked(true);
        setLikes((l) => l + 1);
      } else {
        const d = await res.json().catch(() => ({}));
        flash(d.error || "操作失败");
      }
    }
  }

  async function handleBookmark() {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }
    const method = bookmarked ? "DELETE" : "POST";
    setBookmarked((b) => !b);
    await fetch(`/api/forum/posts/${post.slug}/bookmark`, { method }).catch(
      () => setBookmarked((b) => !b)
    );
  }

  async function handleReport() {
    if (!reportReason) {
      flash("请选择举报原因");
      return;
    }
    const res = await fetch(`/api/forum/posts/${post.slug}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      flash("✅ 举报已提交");
      setShowReport(false);
      setReportReason("");
    } else {
      flash(data.error || "举报失败");
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        flash("✅ 链接已复制");
      } catch {
        flash(url);
      }
    }
  }

  /* ---- Reply ---- */
  async function handleReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/forum/posts/${post.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setReplyText("");
        if (data.comment?.status === "published") {
          // Admin reply is published immediately — reload to render with full data
          window.location.reload();
        } else {
          flash("✅ 评论已提交，等待审核");
        }
      } else {
        flash(data.error || "评论失败");
      }
    } catch {
      flash("网络错误");
    }
    setReplying(false);
  }

  /* ---- Comment like ---- */
  async function handleCommentLike(comment: CommentData) {
    if (!isLoggedIn) {
      window.location.href = loginUrl;
      return;
    }
    if (comment.user.id === currentUserId) {
      flash("不能给自己的评论点赞");
      return;
    }
    if (commentLikeBusy[comment.id]) return;
    setCommentLikeBusy((s) => ({ ...s, [comment.id]: true }));

    const wasLiked = comment.likedByMe;
    // Optimistic update
    setCommentList((list) =>
      list.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              likedByMe: !wasLiked,
              likeCount: c.likeCount + (wasLiked ? -1 : 1),
            }
          : c
      )
    );

    try {
      const res = await fetch(`/api/forum/comments/${comment.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
      if (!res.ok) {
        // Revert
        setCommentList((list) =>
          list.map((c) =>
            c.id === comment.id
              ? {
                  ...c,
                  likedByMe: wasLiked,
                  likeCount: c.likeCount + (wasLiked ? 1 : -1),
                }
              : c
          )
        );
        const d = await res.json().catch(() => ({}));
        flash(d.error || "操作失败");
      }
    } catch {
      setCommentList((list) =>
        list.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                likedByMe: wasLiked,
                likeCount: c.likeCount + (wasLiked ? 1 : -1),
              }
            : c
        )
      );
    }
    setCommentLikeBusy((s) => ({ ...s, [comment.id]: false }));
  }

  /* ---- Accept answer ---- */
  async function handleAccept(comment: CommentData) {
    if (acceptingId) return;
    setAcceptingId(comment.id);
    try {
      const res = await fetch(`/api/forum/posts/${post.slug}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCommentList((list) =>
          list.map((c) => ({
            ...c,
            isAccepted: c.id === comment.id,
          }))
        );
        setAcceptedCommentId(comment.id);
        setSolved(true);
        flash("✅ 已采纳为最佳回答");
      } else {
        flash(data.error || "采纳失败");
      }
    } catch {
      flash("网络错误");
    }
    setAcceptingId(null);
  }

  /* ---- Admin actions ---- */
  async function handleAdminAction(
    action: "pin" | "feature" | "lock" | "hide" | "publish"
  ) {
    if (adminBusy) return;
    setAdminBusy(true);
    try {
      const res = await fetch(`/api/admin/community/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Mirror the server-side toggles
        if (action === "pin") setAdmin((a) => ({ ...a, isPinned: !a.isPinned }));
        if (action === "lock")
          setAdmin((a) => ({ ...a, isLocked: !a.isLocked }));
        if (action === "feature")
          setAdmin((a) => ({ ...a, isFeatured: !a.isFeatured }));
        if (action === "hide") setAdmin((a) => ({ ...a, status: "hidden" }));
        if (action === "publish")
          setAdmin((a) => ({ ...a, status: "published" }));
        flash("✅ 操作成功");
      } else {
        flash(data.error || "操作失败");
      }
    } catch {
      flash("网络错误");
    }
    setAdminBusy(false);
  }

  /* ---- Derived comment ordering ---- */
  const { floorMap, displayOrder } = useMemo(() => {
    const byFloor = [...commentList].sort(
      (a, b) =>
        a.floorNumber - b.floorNumber ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const fm = new Map<string, number>();
    byFloor.forEach((c, i) => fm.set(c.id, c.floorNumber > 0 ? c.floorNumber : i + 1));

    const accepted = commentList.find(
      (c) => c.isAccepted || c.id === acceptedCommentId
    );
    const rest = commentList.filter((c) => c !== accepted);
    return { floorMap: fm, displayOrder: accepted ? [accepted, ...rest] : rest };
  }, [commentList, acceptedCommentId]);

  const hasRelated =
    !!post.relatedTool ||
    !!post.relatedGuide ||
    !!post.relatedChecklist ||
    !!post.relatedTaskChainType;

  const canAccept = isLoggedIn && (isAuthor || isAdmin);

  /* ------------------------------ UI ------------------------------ */
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Link
        href="/bbs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
        <ArrowLeft className="w-4 h-4 flex-shrink-0" /> 返回社区
      </Link>

      {message && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="min-w-0 break-words">{message}</span>
        </div>
      )}

      {/* ===== 1. Status bar ===== */}
      {(admin.isPinned ||
        admin.isFeatured ||
        admin.isLocked ||
        solved ||
        admin.status !== "published") && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {admin.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
              <Pin className="w-3 h-3" /> 置顶
            </span>
          )}
          {admin.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
              <Star className="w-3 h-3" /> 精华
            </span>
          )}
          {admin.isLocked && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              <Lock className="w-3 h-3" /> 已锁定
            </span>
          )}
          {solved && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <CheckCircle className="w-3 h-3" /> 已解决
            </span>
          )}
          {admin.status === "hidden" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600 border border-gray-300">
              [已隐藏]
            </span>
          )}
          {admin.status === "pending" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
              [待审核]
            </span>
          )}
        </div>
      )}

      {/* ===== Post article ===== */}
      <article className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 mb-4 overflow-hidden">
        {/* 2. Title area: category + tags + title */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link
            href={`/community/c/${post.category.key}`}
            className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
          >
            {post.category.iconText ? `${post.category.iconText} ` : ""}
            {post.category.name}
          </Link>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 break-words">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.viewCount} 浏览
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {post.commentCount} 回复
          </span>
          <span>{new Date(post.createdAt).toLocaleString("zh-CN")}</span>
        </div>

        {/* 3. Author trust card */}
        {authorTrustCard ? (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1.5 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 楼主名片
            </div>
            <UserTrustCard data={authorTrustCard} />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <Avatar name={post.user.name} image={post.user.image} />
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {post.user.name || "匿名"}
              </div>
              <div className="text-xs text-gray-400">
                荣誉 {post.user.honorScore}
              </div>
            </div>
          </div>
        )}

        {/* 4. Post content (safe render) */}
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap break-words">
          {post.content}
        </div>

        {/* 5. Related content */}
        {hasRelated && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">
              相关内容
            </div>
            <div className="flex flex-wrap gap-2">
              {post.relatedTool && (
                <Link
                  href={`/tools/${post.relatedTool}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                >
                  <Link2 className="w-3 h-3" /> 工具 / {post.relatedTool}
                </Link>
              )}
              {post.relatedGuide && (
                <Link
                  href={`/guides/${post.relatedGuide.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                >
                  <Link2 className="w-3 h-3" /> 指南 / {post.relatedGuide.title}
                </Link>
              )}
              {post.relatedChecklist && (
                <Link
                  href={`/checklists/${post.relatedChecklist.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                >
                  <Link2 className="w-3 h-3" /> 清单 /{" "}
                  {post.relatedChecklist.title}
                </Link>
              )}
              {post.relatedTaskChainType && (
                <Link
                  href="/bbs"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                >
                  <Link2 className="w-3 h-3" /> 任务链 /{" "}
                  {post.relatedTaskChainType}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 8. Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
              liked
                ? "bg-teal-100 text-teal-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> {likes}
          </button>
          <button
            onClick={handleBookmark}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
              bookmarked
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bookmark className="w-4 h-4" /> {bookmarked ? "已收藏" : "收藏"}
          </button>
          {isLoggedIn && (
            <button
              onClick={() => setShowReport((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Flag className="w-4 h-4" /> 举报
            </button>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <Share2 className="w-4 h-4" /> 分享
          </button>
        </div>

        {showReport && (
          <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50">
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-2 bg-white"
            >
              <option value="">选择举报原因...</option>
              <option value="spam">垃圾广告</option>
              <option value="abuse">辱骂攻击</option>
              <option value="harassment">骚扰</option>
              <option value="illegal">违法内容</option>
              <option value="other">其他</option>
            </select>
            <button
              onClick={handleReport}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              提交举报
            </button>
          </div>
        )}
      </article>

      {/* ===== 9. Admin action area ===== */}
      {isAdmin && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 mb-4">
          <div className="text-xs font-medium text-amber-800 mb-2 inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> 管理操作
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAdminAction("pin")}
              disabled={adminBusy}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                admin.isPinned
                  ? "bg-amber-200 text-amber-800"
                  : "bg-white text-amber-700 border border-amber-300"
              } disabled:opacity-50`}
            >
              <Pin className="w-3.5 h-3.5" />
              {admin.isPinned ? "取消置顶" : "置顶"}
            </button>
            <button
              onClick={() => handleAdminAction("feature")}
              disabled={adminBusy}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                admin.isFeatured
                  ? "bg-purple-200 text-purple-800"
                  : "bg-white text-purple-700 border border-purple-300"
              } disabled:opacity-50`}
            >
              <Star className="w-3.5 h-3.5" />
              {admin.isFeatured ? "取消加精" : "加精"}
            </button>
            <button
              onClick={() => handleAdminAction("lock")}
              disabled={adminBusy}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${
                admin.isLocked
                  ? "bg-red-200 text-red-800"
                  : "bg-white text-red-700 border border-red-300"
              } disabled:opacity-50`}
            >
              <Lock className="w-3.5 h-3.5" />
              {admin.isLocked ? "解锁" : "锁定"}
            </button>
            {admin.status === "hidden" ? (
              <button
                onClick={() => handleAdminAction("publish")}
                disabled={adminBusy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-white text-green-700 border border-green-300 disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" /> 恢复
              </button>
            ) : (
              <button
                onClick={() => handleAdminAction("hide")}
                disabled={adminBusy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-white text-gray-600 border border-gray-300 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> 隐藏
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== 7. Reply box ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
        {isLoggedIn ? (
          admin.isLocked ? (
            <p className="text-sm text-gray-400 text-center py-4">帖子已锁定</p>
          ) : (
            <>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-teal-400"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  {replyText.length}/1000
                </span>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="inline-flex items-center gap-1 px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-teal-700"
                >
                  <Send className="w-4 h-4" />
                  {replying ? "发送中..." : "回复"}
                </button>
              </div>
            </>
          )
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-2">登录后回复</p>
            <Link
              href={loginUrl}
              className="inline-flex px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
            >
              登录
            </Link>
          </div>
        )}
      </div>

      {/* ===== 6. Comments ===== */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 flex-shrink-0" />
          {commentList.length} 条评论
        </h3>

        {displayOrder.map((comment) => {
          const isAccepted =
            comment.isAccepted || comment.id === acceptedCommentId;
          const floor = floorMap.get(comment.id) ?? 0;
          const commentAdmin = comment.user.role === "admin";
          return (
            <div
              key={comment.id}
              className={`rounded-xl border p-3 sm:p-4 overflow-hidden ${
                isAccepted
                  ? "border-green-300 bg-green-50 ring-1 ring-green-200"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                  #{floor}
                </span>
                <Link href={`/u/${comment.user.id}`} className="flex-shrink-0">
                  <Avatar
                    name={comment.user.name}
                    image={comment.user.image}
                    size="sm"
                  />
                </Link>
                <Link
                  href={`/u/${comment.user.id}`}
                  className="font-medium text-sm text-gray-900 hover:underline min-w-0 truncate"
                >
                  {comment.user.name || "匿名"}
                </Link>
                {commentAdmin && (
                  <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                )}
                {comment.user.levelKey && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-teal-50 text-teal-700 flex-shrink-0">
                    {comment.user.levelKey}
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 flex-shrink-0">
                  <Award className="w-3 h-3" />
                  {comment.user.honorScore}
                </span>
                {isAccepted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800 flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> 已采纳
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button
                  onClick={() => handleCommentLike(comment)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                    comment.likedByMe
                      ? "bg-teal-100 text-teal-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {comment.likeCount}
                </button>

                {/* 10. Accept answer button */}
                {canAccept && !isAccepted && (
                  <button
                    onClick={() => handleAccept(comment)}
                    disabled={acceptingId === comment.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {acceptingId === comment.id ? "采纳中..." : "采纳"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {commentList.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            还没有评论，来发第一条吧
          </p>
        )}
      </div>
    </div>
  );
}
