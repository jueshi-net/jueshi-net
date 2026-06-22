"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, ThumbsUp, Bookmark, Flag, Pin, Lock,
  Shield, Eye, Send, AlertCircle,
} from "lucide-react";

interface PostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string; name: string | null; image: string | null; role: string;
    membershipTier: string; growthValue: number; levelKey: string | null;
    honorScore: number; createdAt: string;
  };
  category: { id: string; name: string; key: string; iconText: string | null };
}

interface CommentData {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  user: {
    id: string; name: string | null; image: string | null; role: string;
    levelKey: string | null; honorScore: number;
  };
  _count: { likes: number };
}

export function TopicDetailClient({
  post, comments, likeCount, hasLiked, hasBookmarked, isLoggedIn, currentUserId,
}: {
  post: PostData;
  comments: CommentData[];
  likeCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
}) {
  const [liked, setLiked] = useState(hasLiked);
  const [likes, setLikes] = useState(likeCount);
  const [bookmarked, setBookmarked] = useState(hasBookmarked);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [commentList, setCommentList] = useState(comments);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [message, setMessage] = useState("");

  async function handleLike() {
    if (!isLoggedIn) { window.location.href = "/login?callbackUrl=/community/t/" + post.slug; return; }
    if (post.user.id === currentUserId) { setMessage("不能给自己的帖子点赞"); return; }

    if (liked) {
      await fetch(`/api/forum/posts/${post.slug}/like`, { method: "DELETE" });
      setLiked(false); setLikes(l => l - 1);
    } else {
      const res = await fetch(`/api/forum/posts/${post.slug}/like`, { method: "POST" });
      if (res.ok) { setLiked(true); setLikes(l => l + 1); }
      else { const d = await res.json(); setMessage(d.error || "操作失败"); }
    }
  }

  async function handleBookmark() {
    if (!isLoggedIn) { window.location.href = "/login?callbackUrl=/community/t/" + post.slug; return; }
    if (bookmarked) {
      await fetch(`/api/forum/posts/${post.slug}/bookmark`, { method: "DELETE" });
      setBookmarked(false);
    } else {
      await fetch(`/api/forum/posts/${post.slug}/bookmark`, { method: "POST" });
      setBookmarked(true);
    }
  }

  async function handleReport() {
    if (!reportReason) { setMessage("请选择举报原因"); return; }
    const res = await fetch(`/api/forum/posts/${post.slug}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });
    const data = await res.json();
    if (res.ok) { setMessage("✅ 举报已提交"); setShowReport(false); setReportReason(""); }
    else { setMessage(data.error || "举报失败"); }
  }

  async function handleReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/forum/posts/${post.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyText("");
        setMessage("✅ 评论已提交，等待审核");
        // Refresh comments
        const cRes = await fetch(`/api/forum/posts/${post.slug}/comments`);
        const cData = await cRes.json();
        if (cData.comments) setCommentList(cData.comments);
      } else {
        setMessage(data.error || "评论失败");
      }
    } catch { setMessage("网络错误"); }
    setReplying(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回社区
      </Link>

      {message && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Post */}
      <article className="rounded-xl border border-gray-200 bg-white p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          {post.isPinned && <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Pin className="w-3 h-3" />置顶</span>}
          {post.isLocked && <span className="inline-flex items-center gap-1 text-xs text-red-500"><Lock className="w-3 h-3" />已锁定</span>}
          <Link href={`/community/c/${post.category.key}`} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
            {post.category.iconText} {post.category.name}
          </Link>
          {post.status === "hidden" && <span className="text-xs text-red-500">[已隐藏]</span>}
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <Link href={`/u/${post.user.id}`}>
            {post.user.image ? (
              <img src={post.user.image} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {(post.user.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/u/${post.user.id}`} className="font-medium text-gray-900 hover:underline">{post.user.name || "匿名"}</Link>
              {post.user.role === "admin" && <Shield className="w-3.5 h-3.5 text-red-500" />}
              <span className="px-1.5 py-0.5 rounded text-xs bg-teal-50 text-teal-700">{post.user.levelKey || "Lv.1"}</span>
              <span className="text-xs text-emerald-600">荣誉 {post.user.honorScore}</span>
            </div>
            <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString("zh-CN")}</div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{post.content}</div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button onClick={handleLike} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${liked ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <ThumbsUp className="w-4 h-4" /> {likes}
          </button>
          <button onClick={handleBookmark} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${bookmarked ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <Bookmark className="w-4 h-4" /> {bookmarked ? "已收藏" : "收藏"}
          </button>
          <button onClick={() => setShowReport(!showReport)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Flag className="w-4 h-4" /> 举报
          </button>
          <span className="ml-auto text-xs text-gray-400 inline-flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
        </div>

        {showReport && (
          <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50">
            <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-2">
              <option value="">选择举报原因...</option>
              <option value="spam">垃圾广告</option>
              <option value="abuse">辱骂攻击</option>
              <option value="harassment">骚扰</option>
              <option value="illegal">违法内容</option>
              <option value="other">其他</option>
            </select>
            <button onClick={handleReport} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm">提交举报</button>
          </div>
        )}
      </article>

      {/* Reply box */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
        {isLoggedIn ? (
          post.isLocked ? (
            <p className="text-sm text-gray-400 text-center py-4">该帖已锁定，不能评论</p>
          ) : (
            <>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px] resize-y"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{replyText.length}/1000</span>
                <button onClick={handleReply} disabled={replying || !replyText.trim()} className="inline-flex items-center gap-1 px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm disabled:opacity-50">
                  <Send className="w-4 h-4" /> {replying ? "发送中..." : "回复"}
                </button>
              </div>
            </>
          )
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">登录后参与讨论</p>
            <Link href={`/login?callbackUrl=/community/t/${post.slug}`} className="inline-flex mt-2 px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm">登录</Link>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> {commentList.length} 条评论</h3>
        {commentList.map(comment => (
          <div key={comment.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/u/${comment.user.id}`}>
                {comment.user.image ? (
                  <img src={comment.user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {(comment.user.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <Link href={`/u/${comment.user.id}`} className="font-medium text-sm text-gray-900 hover:underline">{comment.user.name || "匿名"}</Link>
              {comment.user.role === "admin" && <Shield className="w-3 h-3 text-red-500" />}
              <span className="px-1 py-0.5 rounded text-xs bg-teal-50 text-teal-700">{comment.user.levelKey || "Lv.1"}</span>
              <span className="text-xs text-emerald-600">荣誉 {comment.user.honorScore}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(comment.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-400"><ThumbsUp className="w-3 h-3" />{comment._count.likes}</span>
            </div>
          </div>
        ))}
        {commentList.length === 0 && <p className="text-center text-sm text-gray-400 py-8">还没有评论，来发第一条吧</p>}
      </div>
    </div>
  );
}
