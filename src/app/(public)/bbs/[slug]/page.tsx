import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, MessageSquare, Calendar, Lock, Pin, Home, ArrowLeft, Bookmark, Flag, Share2, ThumbsUp, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import { PostContent } from "@/components/bbs/post-content";
import { CategoryBadge } from "@/components/bbs/category-badge";
import CommentSection from "@/components/bbs/comment-section";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            levelKey: true,
            growthValue: true,
            honorScore: true,
            createdAt: true,
            role: true,
            membershipTier: true,
            _count: {
              select: {
                forumPosts: { where: { status: "published" } },
                forumComments: { where: { status: "published" } },
              },
            },
          },
        },
        category: true,
        _count: { select: { comments: { where: { status: "published" } } } },
      },
    });

    if (!post) return null;
    if (post.status !== "published") return null;

    return post;
  } catch {
    return null;
  }
}

async function getComments(slug: string) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      select: { id: true, isLocked: true },
    });

    if (!post) return { comments: [], isLocked: false };

    const comments = await prisma.forumComment.findMany({
      where: { postId: post.id, status: "published" },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true, email: true, honorScore: true } },
      },
    });

    return { comments, isLocked: post.isLocked };
  } catch {
    return { comments: [], isLocked: false };
  }
}

async function incrementViewCount(slug: string) {
  try {
    await prisma.forumPost.updateMany({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Ignore
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: buildTitle("帖子不存在"),
      robots: { index: false },
    };
  }

  return {
    title: buildTitle(post.title),
    description: post.excerpt || post.content.slice(0, 150),
    alternates: { canonical: buildCanonical(`/bbs/${slug}`) },
    openGraph: {
      title: buildTitle(post.title),
      description: post.excerpt || post.content.slice(0, 150),
      url: buildCanonical(`/bbs/${slug}`),
      type: "article",
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post, { comments, isLocked }] = await Promise.all([
    getPost(slug),
    getComments(slug),
  ]);
  if (!post) {
    notFound();
  }

  await incrementViewCount(slug);

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  const displayName = post.user.name || maskEmail(post.user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 py-2.5">
          <nav className="flex items-center gap-1 text-sm text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-brand inline-flex items-center gap-0.5">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <Link href="/bbs" className="hover:text-brand">社区论坛</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <Link href={`/bbs/category/${post.category.key}`} className="hover:text-brand">
              {post.category.name}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-slate-500 truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Main layout: 2-column on desktop */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Topic content + comments */}
          <main className="min-w-0">
            {/* Topic header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-4">
              {/* Category + badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <CategoryBadge category={post.category} size="md" />
                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                    <Pin className="w-3 h-3" /> 置顶
                  </span>
                )}
                {post.isLocked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-slate-600 border border-slate-200">
                    <Lock className="w-3 h-3" /> 锁定
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-extrabold leading-tight break-words mb-3">
                {post.title}
              </h1>

              {/* Author + time */}
              <div className="flex items-center gap-3 text-sm text-slate-500 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                    {displayName[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">{displayName}</div>
                    <div className="text-xs text-slate-500">
                      {post.user.honorScore ? `🏆 ${post.user.honorScore}` : ""} 成长值 {post.user.growthValue || 0}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 ml-auto text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDateTime(post.createdAt)}
                  </time>
                </span>
              </div>
            </div>

            {/* Topic content — forum style, not white card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-8 mb-4">
              <div className="prose prose-sm max-w-none">
                <PostContent content={post.content} />
              </div>

              {/* Tags */}
              {post.tags && Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {(post.tags as string[]).map((tag: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors border border-slate-200">
                  <ThumbsUp className="w-4 h-4" /> 点赞
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors border border-slate-200">
                  <Bookmark className="w-4 h-4" /> 收藏
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors border border-slate-200">
                  <Share2 className="w-4 h-4" /> 分享
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 ml-auto">
                  <Flag className="w-4 h-4" /> 举报
                </button>
              </div>
            </div>

            {/* Reply floors */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-bold text-slate-900">
                  回复 ({comments.length})
                </h2>
              </div>

              {/* Locked notice */}
              {isLocked && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-4 text-center">
                  <Lock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-slate-700">
                    该帖已锁定，不能继续评论
                  </p>
                </div>
              )}

              {/* Floor-style comments */}
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment, index) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 pb-3 border-b border-gray-50 last:border-0"
                    >
                      {/* Floor number */}
                      <div className="shrink-0 w-8 text-right">
                        <span className="text-xs font-bold text-slate-500">#{index + 2}</span>
                      </div>
                      {/* Avatar */}
                      <div className="shrink-0">
                        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand">
                          {(comment.user.name || comment.user.email)[0].toUpperCase()}
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-700">
                            {comment.user.name || maskEmail(comment.user.email)}
                          </span>
                          {comment.user.honorScore ? (
                            <span className="text-xs text-amber-500">🏆 {comment.user.honorScore}</span>
                          ) : null}
                          <time className="text-xs text-slate-500 ml-auto">
                            {formatDateTime(comment.createdAt)}
                          </time>
                        </div>
                        <div className="whitespace-pre-wrap break-words text-sm text-slate-700 leading-relaxed">
                          {comment.content}
                        </div>
                        <div className="flex gap-3 mt-1.5">
                          <button className="text-xs text-slate-500 hover:text-brand transition-colors inline-flex items-center gap-0.5">
                            <ThumbsUp className="w-3 h-3" /> 赞
                          </button>
                          <button className="text-xs text-slate-500 hover:text-red-500 transition-colors inline-flex items-center gap-0.5">
                            <Flag className="w-3 h-3" /> 举报
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLocked ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">暂无回复，来做第一个回复的人吧！</p>
                </div>
              ) : null}

              {/* Reply form */}
              <CommentSection
                postId={post.id}
                slug={post.slug}
                initialComments={[]}
                isLocked={isLocked}
                isLoggedIn={isLoggedIn}
              />
            </div>

            {/* Bottom navigation */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" /> 返回论坛
              </Link>
              <Link
                href={`/bbs/category/${post.category.key}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                返回「{post.category.name}」
              </Link>
              {isLoggedIn && (
                <Link
                  href={`/bbs/${slug}/edit`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50"
                >
                  编辑帖子
                </Link>
              )}
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark ml-auto"
              >
                发布新帖
              </Link>
            </div>
          </main>

          {/* Right sidebar: Topic info */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              {/* Author trust card — expanded */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">作者信息</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-lg font-bold text-brand shrink-0">
                    {displayName[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                      {displayName}
                      {post.user.role === "admin" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">管理员</span>
                      )}
                      {post.user.membershipTier && post.user.membershipTier !== "free" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">{post.user.membershipTier === "pro" ? "Pro" : "会员"}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      加入于 {formatJoinDate(post.user.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">等级</span>
                    <span className="font-medium text-slate-700">{post.user.levelKey || "新手"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">成长值</span>
                    <span className="font-medium text-slate-700">{post.user.growthValue || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">荣誉值</span>
                    <span className="font-medium text-slate-700">{post.user.honorScore || 0} 🏆</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">发帖数</span>
                    <span className="font-medium text-slate-700">{post.user._count?.forumPosts ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">回复数</span>
                    <span className="font-medium text-slate-700">{post.user._count?.forumComments ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Topic stats */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">话题信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">分类</span>
                    <Link href={`/bbs/category/${post.category.key}`} className="text-brand hover:underline">
                      {post.category.iconText} {post.category.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 浏览</span>
                    <span className="font-medium text-slate-700">{post.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> 回复</span>
                    <span className="font-medium text-slate-700">{comments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 发布</span>
                    <span className="text-xs text-slate-700">{formatDateTime(post.createdAt)}</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {post.isPinned && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">📌 置顶</span>
                  )}
                  {post.isLocked && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-slate-600 border border-slate-200">🔒 锁定</span>
                  )}
                  {!post.isPinned && !post.isLocked && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">✅ 正常</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {post.tags && Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">标签</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(post.tags as string[]).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin actions — only visible to admin */}
              {isAdmin && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                  <h3 className="text-sm font-bold text-amber-800 mb-2">⚙️ 管理员操作</h3>
                  <div className="space-y-1.5">
                    <Link href={`/admin/community/posts`} className="block text-sm text-amber-700 hover:text-amber-900">
                      📋 帖子管理面板
                    </Link>
                    <Link href={`/bbs/${slug}/edit`} className="block text-sm text-amber-700 hover:text-amber-900">
                      ✏️ 编辑此帖
                    </Link>
                  </div>
                </div>
              )}

              {/* Related tools */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">相关工具</h3>
                <div className="space-y-1.5">
                  <Link href="/tools/hs-code" className="block text-sm text-slate-600 hover:text-brand">📦 HS 编码查询</Link>
                  <Link href="/tools/shipping-calculator" className="block text-sm text-slate-600 hover:text-brand">🚢 运费计算器</Link>
                  <Link href="/tools/postal-code" className="block text-sm text-slate-600 hover:text-brand">📮 邮编查询</Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  if (!email) return "匿名用户";
  const [local, domain] = email.split("@");
  if (!domain) return "匿名用户";
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function formatJoinDate(date: Date | null | undefined): string {
  if (!date) return "未知";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "今天";
  if (diffDays < 30) return `${diffDays} 天前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}
