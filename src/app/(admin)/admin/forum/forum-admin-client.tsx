"use client";

import { useState, useRef } from "react";
import {
  Check, X, EyeOff, Eye, Pin, PinOff, Lock, Unlock, Loader2,
  RefreshCw, Plus, Edit2, Trash2, Save, XCircle, MessageSquare,
  FolderOpen, ScrollText, ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";
import {
  updatePostStatus, togglePostPin, togglePostLock,
  updateCommentStatus, createCategory, updateCategory, deleteCategory,
} from "./actions";

// ─── Types ───
interface PostData {
  id: string; title: string; slug: string; status: string;
  isPinned: boolean; isLocked: boolean; viewCount: number; commentCount: number;
  createdAt: string; updatedAt: string;
  user: { name: string | null; email: string | null };
  category: { name: string; key: string; iconText: string | null; color: string | null };
}
interface CommentData {
  id: string; content: string; status: string; createdAt: string;
  user: { name: string | null; email: string | null };
  post: { title: string; slug: string };
}
interface CategoryData {
  id: string; key: string; name: string; description: string | null;
  iconText: string | null; color: string | null; sortOrder: number;
  isActive: boolean; createdAt: string;
}
interface ForumData {
  posts: PostData[]; postStats: Record<string, number>;
  comments: CommentData[]; commentStats: Record<string, number>;
  categories: CategoryData[];
}

const POST_STATUS_TABS = [
  { value: "pending", label: "待审核", color: "amber" },
  { value: "published", label: "已发布", color: "green" },
  { value: "hidden", label: "已隐藏", color: "gray" },
  { value: "deleted", label: "已删除", color: "red" },
  { value: "", label: "全部", color: "blue" },
];

const COMMENT_STATUS_TABS = [
  { value: "published", label: "已发布", color: "green" },
  { value: "pending", label: "待审核", color: "amber" },
  { value: "hidden", label: "已隐藏", color: "gray" },
  { value: "deleted", label: "已删除", color: "red" },
  { value: "", label: "全部", color: "blue" },
];

const POSTS_PER_PAGE = 15;
const COMMENTS_PER_PAGE = 20;

const tabColors: Record<string, string> = {
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  green: "border-green-500 bg-green-50 text-green-700",
  gray: "border-gray-300 bg-gray-50 text-gray-600",
  red: "border-red-500 bg-red-50 text-red-700",
  blue: "border-blue-500 bg-blue-50 text-blue-700",
};

export default function ForumAdminClient({ data }: { data: ForumData | null }) {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "categories" | "rules">("posts");
  const [toast, setToast] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  // Posts state
  const [postStatusFilter, setPostStatusFilter] = useState("pending");
  const [postCategoryFilter, setPostCategoryFilter] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [postPage, setPostPage] = useState(1);

  // Comments state
  const [commentStatusFilter, setCommentStatusFilter] = useState("published");
  const [commentPage, setCommentPage] = useState(1);

  // Categories state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const posts = data?.posts ?? [];
  const comments = data?.comments ?? [];
  const categories = data?.categories ?? [];
  const postStats = data?.postStats ?? {};
  const commentStats = data?.commentStats ?? {};

  // ─── Post Actions ───
  const handlePostAction = async (postId: string, action: string) => {
    setActing(postId);
    let result: { success: boolean; error?: string } = { success: false };
    switch (action) {
      case "approve": result = await updatePostStatus(postId, "published"); break;
      case "reject": result = await updatePostStatus(postId, "hidden"); break;
      case "hide": result = await updatePostStatus(postId, "hidden"); break;
      case "delete": result = await updatePostStatus(postId, "deleted"); break;
      case "restore": result = await updatePostStatus(postId, "published"); break;
      case "pin": result = await togglePostPin(postId, true); break;
      case "unpin": result = await togglePostPin(postId, false); break;
      case "lock": result = await togglePostLock(postId, true); break;
      case "unlock": result = await togglePostLock(postId, false); break;
    }
    if (result.success) showToast(`${action} 成功`);
    else showToast(result.error || "操作失败");
    setActing(null);
  };

  // ─── Comment Actions ───
  const handleCommentAction = async (commentId: string, newStatus: string, label: string) => {
    setActing(commentId);
    const result = await updateCommentStatus(commentId, newStatus);
    if (result.success) showToast(`${label} 成功`);
    else showToast(result.error || "操作失败");
    setActing(null);
  };

  // ─── Category Actions ───
  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await createCategory({
      key: fd.get("key") as string,
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      iconText: (fd.get("iconText") as string) || undefined,
      color: (fd.get("color") as string) || undefined,
      sortOrder: parseInt(fd.get("sortOrder") as string) || 0,
      isActive: fd.get("isActive") === "on",
    });
    if (result.success) { showToast("分类创建成功"); setShowNewCategory(false); form.reset(); }
    else showToast(result.error || "创建失败");
  };

  const handleUpdateCategory = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = await updateCategory(id, {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      iconText: (fd.get("iconText") as string) || undefined,
      color: (fd.get("color") as string) || undefined,
      sortOrder: parseInt(fd.get("sortOrder") as string) || 0,
      isActive: fd.get("isActive") === "on",
    });
    if (result.success) { showToast("分类更新成功"); setEditingCategory(null); }
    else showToast(result.error || "更新失败");
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`确定删除分类「${name}」吗？`)) return;
    const result = await deleteCategory(id);
    if (result.success) showToast("分类已删除");
    else showToast(result.error || "删除失败");
  };

  // ─── Filtered & Paginated Posts ───
  const filteredPosts = posts.filter((p) => {
    if (postStatusFilter && p.status !== postStatusFilter) return false;
    if (postCategoryFilter && p.category.key !== postCategoryFilter) return false;
    if (postSearch && !p.title.toLowerCase().includes(postSearch.toLowerCase())) return false;
    return true;
  });
  const totalPostPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice((postPage - 1) * POSTS_PER_PAGE, postPage * POSTS_PER_PAGE);

  // ─── Filtered & Paginated Comments ───
  const filteredComments = comments.filter((c) => {
    if (commentStatusFilter && c.status !== commentStatusFilter) return false;
    return true;
  });
  const totalCommentPages = Math.max(1, Math.ceil(filteredComments.length / COMMENTS_PER_PAGE));
  const paginatedComments = filteredComments.slice((commentPage - 1) * COMMENTS_PER_PAGE, commentPage * COMMENTS_PER_PAGE);

  // Reset page on filter change
  const onPostStatusChange = (v: string) => { setPostStatusFilter(v); setPostPage(1); };
  const onPostCategoryChange = (v: string) => { setPostCategoryFilter(v); setPostPage(1); };
  const onPostSearchChange = (v: string) => { setPostSearch(v); setPostPage(1); };
  const onCommentStatusChange = (v: string) => { setCommentStatusFilter(v); setCommentPage(1); };

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">论坛数据加载失败</p>
        <p className="text-sm text-red-400 mt-1">请检查数据库连接</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-5 text-white">
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> 论坛管理
        </h1>
        <p className="text-sm text-violet-100 mt-1">管理帖子、评论、分类和社区规范</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "posts" as const, label: "帖子管理", count: posts.length, icon: MessageSquare },
          { id: "comments" as const, label: "评论管理", count: comments.length, icon: ScrollText },
          { id: "categories" as const, label: "分类管理", count: categories.length, icon: FolderOpen },
          { id: "rules" as const, label: "规则说明", icon: ScrollText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPostPage(1); setCommentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border transition-all min-h-[44px] ${
                isActive
                  ? "border-violet-500 bg-violet-50 text-violet-700 font-semibold"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {"count" in tab && tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-violet-200 text-violet-800" : "bg-gray-100 text-gray-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: 帖子管理 */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-amber-700">{postStats.pending || 0}</div>
              <div className="text-xs text-amber-600">待审核</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-green-700">{postStats.published || 0}</div>
              <div className="text-xs text-green-600">已发布</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-gray-500">{(postStats.hidden || 0) + (postStats.deleted || 0)}</div>
              <div className="text-xs text-gray-400">已隐藏/删除</div>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-violet-700">{posts.length}</div>
              <div className="text-xs text-violet-600">总计</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {POST_STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onPostStatusChange(tab.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors min-h-[44px] ${
                  postStatusFilter === tab.value ? tabColors[tab.color] : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <select
              value={postCategoryFilter}
              onChange={(e) => onPostCategoryChange(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white min-h-[44px]"
            >
              <option value="">全部分类</option>
              {categories.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
            </select>
            <input
              type="text"
              placeholder="搜索标题..."
              value={postSearch}
              onChange={(e) => onPostSearchChange(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]"
            />
          </div>

          {/* Post List */}
          {paginatedPosts.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <MessageSquare className="w-14 h-14 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-500 mb-1">暂无帖子</p>
              <p className="text-sm">该筛选条件下暂无帖子</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedPosts.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 ${
                    p.isPinned ? "bg-amber-50 border-amber-300" : p.status === "pending" ? "bg-amber-50/30 border-amber-200" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {p.isPinned && (
                          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <Pin className="w-3 h-3" /> 置顶
                          </span>
                        )}
                        {p.isLocked && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" /> 锁定
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900 truncate">{p.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          p.status === "pending" ? "bg-amber-100 text-amber-700" :
                          p.status === "published" ? "bg-green-100 text-green-700" :
                          p.status === "hidden" ? "bg-gray-100 text-gray-500" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {p.status === "pending" ? "待审核" : p.status === "published" ? "已发布" : p.status === "hidden" ? "已隐藏" : "已删除"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{p.category.name}</span>
                        <span>👤 {p.user.name || p.user.email || "未知"}</span>
                        <span>👁 {p.viewCount}</span>
                        <span>💬 {p.commentCount}</span>
                        <span>{new Date(p.createdAt).toLocaleString("zh-CN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      {acting === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          {p.status === "pending" && (
                            <>
                              <button onClick={() => handlePostAction(p.id, "approve")} className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium min-h-[36px]" title="通过">
                                <Check className="w-3.5 h-3.5" /> 通过
                              </button>
                              <button onClick={() => handlePostAction(p.id, "reject")} className="flex items-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs min-h-[36px]" title="拒绝→隐藏">
                                <X className="w-3.5 h-3.5" /> 拒绝
                              </button>
                            </>
                          )}
                          {p.status === "published" && (
                            <button onClick={() => handlePostAction(p.id, "hide")} className="flex items-center gap-1 px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs min-h-[36px]" title="隐藏">
                              <EyeOff className="w-3.5 h-3.5" /> 隐藏
                            </button>
                          )}
                          {(p.status === "hidden" || p.status === "deleted") && (
                            <button onClick={() => handlePostAction(p.id, "restore")} className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium min-h-[36px]" title="恢复">
                              <RefreshCw className="w-3.5 h-3.5" /> 恢复
                            </button>
                          )}
                          {p.status !== "deleted" && (
                            <button onClick={() => handlePostAction(p.id, "delete")} className="flex items-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs min-h-[36px]" title="删除">
                              <Trash2 className="w-3.5 h-3.5" /> 删除
                            </button>
                          )}
                          <button onClick={() => handlePostAction(p.id, p.isPinned ? "unpin" : "pin")} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs min-h-[36px] ${p.isPinned ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} title={p.isPinned ? "取消置顶" : "置顶"}>
                            {p.isPinned ? <><PinOff className="w-3.5 h-3.5" /> 取消</> : <><Pin className="w-3.5 h-3.5" /> 置顶</>}
                          </button>
                          <button onClick={() => handlePostAction(p.id, p.isLocked ? "unlock" : "lock")} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs min-h-[36px] ${p.isLocked ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} title={p.isLocked ? "解锁" : "锁定"}>
                            {p.isLocked ? <><Unlock className="w-3.5 h-3.5" /> 解锁</> : <><Lock className="w-3.5 h-3.5" /> 锁定</>}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPostPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500">共 {filteredPosts.length} 条，第 {postPage}/{totalPostPages} 页</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={postPage <= 1}
                  onClick={() => setPostPage(postPage - 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 min-h-[36px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPostPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(postPage - 2, totalPostPages - 4)) + i;
                  if (page > totalPostPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setPostPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg border min-h-[36px] ${
                        page === postPage ? "border-violet-500 bg-violet-50 text-violet-700 font-semibold" : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  disabled={postPage >= totalPostPages}
                  onClick={() => setPostPage(postPage + 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 min-h-[36px]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 评论管理 */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-green-700">{commentStats.published || 0}</div>
              <div className="text-xs text-green-600">已发布</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-amber-700">{commentStats.pending || 0}</div>
              <div className="text-xs text-amber-600">待审核</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-gray-500">{commentStats.hidden || 0}</div>
              <div className="text-xs text-gray-400">已隐藏</div>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-violet-700">{comments.length}</div>
              <div className="text-xs text-violet-600">总计</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {COMMENT_STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onCommentStatusChange(tab.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors min-h-[44px] ${
                  commentStatusFilter === tab.value ? tabColors[tab.color] : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Comment List */}
          {paginatedComments.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <ScrollText className="w-14 h-14 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-500 mb-1">暂无评论</p>
              <p className="text-sm">该筛选条件下暂无评论</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedComments.map((c) => (
                <div key={c.id} className={`bg-white rounded-xl border p-4 ${c.status === "pending" ? "border-amber-200 bg-amber-50/30" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.status === "pending" ? "bg-amber-100 text-amber-700" :
                          c.status === "published" ? "bg-green-100 text-green-700" :
                          c.status === "hidden" ? "bg-gray-100 text-gray-500" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {c.status === "pending" ? "待审核" : c.status === "published" ? "已发布" : c.status === "hidden" ? "已隐藏" : "已删除"}
                        </span>
                        <span className="text-xs text-gray-400">📎 {c.post.title}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 break-words line-clamp-2">{c.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">👤 {c.user.name || c.user.email || "未知"}</span>
                        <span>{new Date(c.createdAt).toLocaleString("zh-CN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      {acting === c.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          {c.status === "pending" && (
                            <button onClick={() => handleCommentAction(c.id, "published", "通过")} className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium min-h-[36px]">
                              <Check className="w-3.5 h-3.5" /> 通过
                            </button>
                          )}
                          {c.status !== "deleted" && (
                            <button onClick={() => handleCommentAction(c.id, "hidden", "隐藏")} className="flex items-center gap-1 px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs min-h-[36px]">
                              <EyeOff className="w-3.5 h-3.5" /> 隐藏
                            </button>
                          )}
                          {c.status !== "hidden" && c.status !== "deleted" && (
                            <button onClick={() => handleCommentAction(c.id, "deleted", "删除")} className="flex items-center gap-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs min-h-[36px]">
                              <Trash2 className="w-3.5 h-3.5" /> 删除
                            </button>
                          )}
                          {(c.status === "hidden" || c.status === "deleted") && (
                            <button onClick={() => handleCommentAction(c.id, "published", "恢复")} className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium min-h-[36px]">
                              <RefreshCw className="w-3.5 h-3.5" /> 恢复
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCommentPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500">共 {filteredComments.length} 条，第 {commentPage}/{totalCommentPages} 页</span>
              <div className="flex items-center gap-1">
                <button disabled={commentPage <= 1} onClick={() => setCommentPage(commentPage - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 min-h-[36px]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalCommentPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(commentPage - 2, totalCommentPages - 4)) + i;
                  if (page > totalCommentPages) return null;
                  return (
                    <button key={page} onClick={() => setCommentPage(page)} className={`px-3 py-1.5 text-sm rounded-lg border min-h-[36px] ${page === commentPage ? "border-violet-500 bg-violet-50 text-violet-700 font-semibold" : "border-gray-200 text-gray-500"}`}>
                      {page}
                    </button>
                  );
                })}
                <button disabled={commentPage >= totalCommentPages} onClick={() => setCommentPage(commentPage + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 min-h-[36px]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: 分类管理 */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {/* New Category Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">分类列表 ({categories.length})</h2>
            <button
              onClick={() => { setShowNewCategory(!showNewCategory); setEditingCategory(null); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium min-h-[44px]"
            >
              <Plus className="w-4 h-4" /> 新建分类
            </button>
          </div>

          {/* New Category Form */}
          {showNewCategory && (
            <form onSubmit={handleCreateCategory} className="bg-white rounded-xl border border-violet-200 p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">新建分类</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Key *</label>
                  <input name="key" required placeholder="如: overseas-life" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">名称 *</label>
                  <input name="name" required placeholder="分类名称" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">描述</label>
                  <input name="description" placeholder="分类描述（可选）" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">图标</label>
                  <input name="iconText" placeholder="如: 🌍" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">颜色</label>
                  <input name="color" placeholder="如: blue" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">排序</label>
                  <input name="sortOrder" type="number" defaultValue="0" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="isActive" type="checkbox" defaultChecked className="rounded" /> 启用
              </label>
              <div className="flex items-center gap-2">
                <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium min-h-[44px]">
                  <Save className="w-4 h-4" /> 创建
                </button>
                <button type="button" onClick={() => setShowNewCategory(false)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm min-h-[44px]">
                  <XCircle className="w-4 h-4" /> 取消
                </button>
              </div>
            </form>
          )}

          {/* Category List */}
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border p-4">
                {editingCategory === c.id ? (
                  <form onSubmit={(e) => handleUpdateCategory(c.id, e)} className="space-y-3">
                    <h3 className="font-semibold text-gray-900">编辑分类</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">名称 *</label>
                        <input name="name" required defaultValue={c.name} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">描述</label>
                        <input name="description" defaultValue={c.description || ""} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">图标</label>
                        <input name="iconText" defaultValue={c.iconText || ""} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">颜色</label>
                        <input name="color" defaultValue={c.color || ""} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">排序</label>
                        <input name="sortOrder" type="number" defaultValue={c.sortOrder} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 min-h-[44px]" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded" /> 启用
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium min-h-[44px]">
                        <Save className="w-4 h-4" /> 保存
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm min-h-[44px]">
                        <XCircle className="w-4 h-4" /> 取消
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">{c.iconText || "📁"}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{c.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {c.isActive ? "启用" : "停用"}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{c.key}</span>
                        </div>
                        {c.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => { setEditingCategory(c.id); setShowNewCategory(false); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs min-h-[36px]">
                        <Edit2 className="w-3.5 h-3.5" /> 编辑
                      </button>
                      <button onClick={() => handleDeleteCategory(c.id, c.name)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs min-h-[36px]">
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: 规则说明 */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <ScrollText className="w-5 h-5" /> 社区规则
            </h2>
            <p className="text-sm text-blue-100 mt-1">论坛发帖与评论规则、社区规范</p>
          </div>

          {/* Posting Rules */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📝 发帖规则
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-extrabold text-blue-700">5</div>
                <div className="text-sm text-blue-600 font-medium">每日发帖上限</div>
                <div className="text-xs text-blue-400 mt-1">每 24 小时最多发布 5 篇帖子</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-extrabold text-purple-700">20</div>
                <div className="text-sm text-purple-600 font-medium">每日评论上限</div>
                <div className="text-xs text-purple-400 mt-1">每 24 小时最多发布 20 条评论</div>
              </div>
            </div>
          </div>

          {/* Content Requirements */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ✅ 内容要求
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>帖子标题应清晰表达主题，不少于 4 个字符</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>帖子内容应充实，不少于 10 个字符</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>评论应言之有物，不少于 2 个字符</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>选择正确的分类发布内容</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>鼓励分享有价值的经验、问题和建议</span>
              </li>
            </ul>
          </div>

          {/* Community Guidelines */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 社区规范
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-semibold text-red-600 mb-1">禁止行为</h4>
                <ul className="space-y-1">
                  <li>❌ 发布广告、推广、垃圾信息</li>
                  <li>❌ 发布违法违规、色情、暴力内容</li>
                  <li>❌ 人身攻击、歧视性言论</li>
                  <li>❌ 恶意刷帖、灌水</li>
                  <li>❌ 泄露他人隐私信息</li>
                </ul>
              </div>
              <div className="border-l-4 border-amber-400 pl-4">
                <h4 className="font-semibold text-amber-600 mb-1">违规处理</h4>
                <ul className="space-y-1">
                  <li>⚠️ 首次违规：内容隐藏 + 警告</li>
                  <li>⚠️ 多次违规：账号限制发帖</li>
                  <li>⚠️ 严重违规：封禁账号</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-semibold text-green-600 mb-1">鼓励行为</h4>
                <ul className="space-y-1">
                  <li>🌟 分享实用经验和知识</li>
                  <li>🌟 热心回答他人问题</li>
                  <li>🌟 建设性讨论和交流</li>
                  <li>🌟 举报违规内容</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-green-600 text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
