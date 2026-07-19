import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Eye,
  MessageSquare,
  Calendar,
  Lock,
  Pin,
  Star,
  CheckCircle,
  ArrowLeft,
  Award,
  Package,
  Ship,
  Mail,
  Wrench,
  Shield,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical, SITE_URL, SITE_NAME } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import { PostContent } from "@/components/bbs/post-content";
import { CategoryBadge } from "@/components/bbs/category-badge";
import CommentSection from "@/components/bbs/comment-section";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { PostDetailActions } from "@/components/community/post-detail-actions";
import { RelatedPosts } from "@/components/bbs/related-posts";
import { ShareButtons } from "@/components/bbs/share-buttons";
import { PostTimeline } from "@/components/bbs/post-timeline";
import { maskEmail, formatJoinDate } from "@/lib/community/utils";
import { toUserDisplayData } from "@/lib/community/user-display";
import UserIdentityCard from "@/components/user/UserIdentityCard";
import { ForumEmptyState } from "@/components/community/forum-empty-state";
import {
  buildPostJsonLd,
  buildBreadcrumbJsonLd,
  renderJsonLd,
} from "@/lib/community/structured-data";

export const dynamic = "force-dynamic";

async function getPost(slug: string, userId: string | null) {
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
      likes: userId ? { where: { userId }, select: { id: true } } : false,
      bookmarks: userId
        ? { where: { userId }, select: { id: true } }
        : false,
    },
  });

  if (!post) return null;
  // Only published posts are served on the public /bbs/[slug] route.
  // Private preview for pending/rejected/hidden posts is at /bbs/my-posts/[slug] (author)
  // and /bbs/admin/review/[id] (admin).
  if (post.status !== "published") return null;

  return post;
}

async function getLikeCount(slug: string) {
  try {
    const count = await prisma.forumLike.count({
      where: { post: { slug } },
    });
    return count;
  } catch {
    return 0;
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
        user: { select: { id: true, name: true, email: true, honorScore: true, levelKey: true, membershipTier: true, role: true } },
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

/**
 * Suspense fallback skeleton for the comments section.
 * Shown while PostCommentsSection fetches comment data.
 */
function CommentsSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 pb-3 border-b border-gray-50">
            <div className="shrink-0 w-8" />
            <div className="shrink-0 w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Async server component for the comments section.
 * Fetches comments independently so the main page can render
 * the post content immediately while comments stream in.
 *
 * This component is rendered inside a <Suspense> boundary so it
 * does NOT block the initial HTTP response. If the post doesn't
 * exist, notFound() is called in the parent page BEFORE this
 * component is rendered.
 */
async function PostCommentsSection({
  slug,
  postId,
  isLocked,
  isLoggedIn,
}: {
  slug: string;
  postId: string;
  isLocked: boolean;
  isLoggedIn: boolean;
}) {
  const { comments } = await getComments(slug);

  return (
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
                <span className="text-xs font-bold text-slate-500">
                  #{index + 2}
                </span>
              </div>
              {/* Author identity */}
              <div className="shrink-0">
                <Link href={`/u/${comment.user.id}`}>
                  <UserIdentityCard
                    user={toUserDisplayData({
                      name: comment.user.name,
                      email: comment.user.email,
                      honorScore: comment.user.honorScore,
                      levelKey: comment.user.levelKey,
                      membershipTier: comment.user.membershipTier,
                      role: comment.user.role,
                    })}
                    size="sm"
                    showHonor
                  />
                </Link>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <time className="text-xs text-slate-500 ml-auto">
                    {formatDateTime(comment.createdAt)}
                  </time>
                </div>
                <div className="whitespace-pre-wrap break-words text-sm text-slate-700 leading-relaxed">
                  {comment.content}
                </div>
                <div className="flex gap-3 mt-1.5">
                  <button className="text-xs text-slate-500 hover:text-brand transition-colors inline-flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" /> 赞
                  </button>
                  <button className="text-xs text-slate-500 hover:text-red-500 transition-colors inline-flex items-center gap-0.5">
                    <Shield className="w-3 h-3" /> 举报
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLocked ? (
        <ForumEmptyState variant="no-comments" />
      ) : null}

      {/* Reply form */}
      <CommentSection
        postId={postId}
        slug={slug}
        initialComments={[]}
        isLocked={isLocked}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, null);

  if (!post) {
    notFound();
  }

  const description = post.excerpt || post.content.slice(0, 150);
  const canonical = buildCanonical(`/bbs/${slug}`);
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
  const authorName = post.user.name || "匿名用户";

  return {
    title: buildTitle(post.title),
    description,
    alternates: {
      canonical,
      types: {
        "application/rss+xml": `${SITE_URL}/bbs/feed.xml`,
        "application/atom+xml": `${SITE_URL}/bbs/feed.atom`,
      },
    },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      type: "article",
      siteName: SITE_NAME,
      locale: "zh_CN",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [authorName],
      section: post.category.name,
      tags: tags.length > 0 ? tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.slice(0, 70),
      description: description.slice(0, 200),
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  // Query post FIRST - before any other operations.
  // If the post doesn't exist, notFound() is called before
  // any secondary queries or rendering begin.
  const post = await getPost(slug, userId);
  if (!post) {
    notFound();
  }

  // Secondary queries only run if post exists.
  // getLikeCount is needed for PostDetailActions in the main render.
  // Comments are fetched inside a Suspense boundary to allow streaming
  // without blocking the initial response (and without route-level loading.tsx).
  const likeCount = await getLikeCount(slug);

  await incrementViewCount(slug);

  const displayName = post.user.name || maskEmail(post.user.email);
  const hasLiked = post.likes?.length > 0;
  const hasBookmarked = post.bookmarks?.length > 0;
  const isAuthor = !!userId && userId === post.user.id;

  // P4: SEO structured data (JSON-LD) — only for published posts
  const breadcrumbItems = [
    { title: "首页", href: "/" },
    { title: "社区论坛", href: "/bbs" },
    { title: post.category.name, href: `/bbs/category/${post.category.key}` },
    { title: post.title, current: true },
  ];
  const postJsonLd = buildPostJsonLd({
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    category: {
      id: post.category.id,
      key: post.category.key,
      name: post.category.name,
    },
    user: {
      id: post.user.id,
      name: post.user.name,
      email: post.user.email,
      role: post.user.role,
      honorScore: post.user.honorScore,
    },
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* P4: SEO Structured Data (JSON-LD) */}
        {postJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: renderJsonLd(postJsonLd) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbJsonLd) }}
        />
        {/* Breadcrumb bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                {
                  title: post.category.name,
                  href: `/bbs/category/${post.category.key}`,
                },
                {
                  title:
                    post.title.length > 30
                      ? post.title.slice(0, 30) + "..."
                      : post.title,
                  current: true,
                },
              ]}
            />
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
                  {post.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">
                      <Star className="w-3 h-3" /> 精华
                    </span>
                  )}
                  {post.isSolved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">
                      <CheckCircle className="w-3 h-3" /> 已解决
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-extrabold leading-tight break-words mb-3">
                  {post.title}
                </h1>

                {/* Author + time */}
                <div className="flex items-center gap-3 text-sm text-slate-500 pb-3 border-b border-gray-100">
                  <Link href={`/u/${post.user.id}`} className="shrink-0">
                    <UserIdentityCard
                      user={toUserDisplayData({
                        name: post.user.name,
                        email: post.user.email,
                        levelKey: post.user.levelKey,
                        growthValue: post.user.growthValue,
                        honorScore: post.user.honorScore,
                        membershipTier: post.user.membershipTier,
                        role: post.user.role,
                      })}
                      size="sm"
                      showHonor
                      showMembership
                    />
                  </Link>
                  <span className="inline-flex items-center gap-1 ml-auto text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatDateTime(post.createdAt)}
                    </time>
                  </span>
                </div>
              </div>

              {/* Topic content */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-8 mb-4">
                <div className="prose prose-sm max-w-none">
                  <PostContent content={post.content} />
                </div>

                {/* Tags */}
                {post.tags &&
                  Array.isArray(post.tags) &&
                  (post.tags as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                      {(post.tags as string[]).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Related tool card */}
                {post.relatedTool && (
                  <div
                    data-testid="bbs-post-related-tool"
                    className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                  >
                    <div
                      data-testid="bbs-related-tool-card"
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs text-blue-600 mb-1">
                          本帖关联工具
                        </p>
                        <Link
                          href={`/tools/documents/${post.relatedTool}`}
                          className="text-sm font-semibold text-blue-700 hover:underline"
                        >
                          {post.relatedTool.replace(/-/g, " ")} →
                        </Link>
                      </div>
                      <Link
                        href={`/tools/documents/${post.relatedTool}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        打开工具
                      </Link>
                    </div>
                  </div>
                )}

                {/* Action bar - V4 working actions */}
                <PostDetailActions
                  slug={post.slug}
                  initialLikeCount={likeCount}
                  initialHasLiked={hasLiked}
                  initialHasBookmarked={hasBookmarked}
                  isLoggedIn={isLoggedIn}
                  isAuthor={isAuthor}
                />

                {/* Share buttons - only for published posts */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 shrink-0">分享：</span>
                    <ShareButtons
                      url={buildCanonical(`/bbs/${post.slug}`)}
                      title={post.title}
                      description={post.excerpt || post.content.slice(0, 150)}
                    />
                  </div>
                </div>
              </div>

              {/* Reply floors - streamed via Suspense to preserve loading UX
                  without route-level loading.tsx that would cause soft 404 */}
              <Suspense fallback={<CommentsSkeleton />}>
                <PostCommentsSection
                  slug={slug}
                  postId={post.id}
                  isLocked={post.isLocked}
                  isLoggedIn={isLoggedIn}
                />
              </Suspense>

              {/* Related posts */}
              <Suspense fallback={null}>
                <RelatedPosts
                  postId={post.id}
                  categoryId={post.categoryId}
                  tags={Array.isArray(post.tags) ? (post.tags as string[]) : null}
                />
              </Suspense>

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
                {/* Author trust card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    作者信息
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-lg font-bold text-brand shrink-0">
                      {displayName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                        {displayName}
                        {post.user.role === "admin" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                            管理员
                          </span>
                        )}
                        {post.user.membershipTier &&
                          post.user.membershipTier !== "free" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              {post.user.membershipTier === "pro"
                                ? "Pro"
                                : "会员"}
                            </span>
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
                      <span className="font-medium text-slate-700">
                        {post.user.levelKey || "新手"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">成长值</span>
                      <span className="font-medium text-slate-700">
                        {post.user.growthValue || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">荣誉值</span>
                      <span className="font-medium text-slate-700 inline-flex items-center gap-0.5">
                        <Award className="w-3 h-3 text-amber-500" />
                        {post.user.honorScore || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">发帖数</span>
                      <span className="font-medium text-slate-700">
                        {post.user._count?.forumPosts ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">回复数</span>
                      <span className="font-medium text-slate-700">
                        {post.user._count?.forumComments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Topic stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    话题信息
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">分类</span>
                      <Link
                        href={`/bbs/category/${post.category.key}`}
                        className="text-brand hover:underline"
                      >
                        {post.category.iconText} {post.category.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> 浏览
                      </span>
                      <span className="font-medium text-slate-700">
                        {post.viewCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> 回复
                      </span>
                      <span className="font-medium text-slate-700">
                        {post._count.comments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> 发布
                      </span>
                      <span className="text-xs text-slate-700">
                        {formatDateTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    {post.isPinned && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 inline-flex items-center gap-0.5">
                        <Pin className="w-3 h-3" /> 置顶
                      </span>
                    )}
                    {post.isLocked && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-slate-600 border border-slate-200 inline-flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> 锁定
                      </span>
                    )}
                    {!post.isPinned && !post.isLocked && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200 inline-flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> 正常
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {post.tags &&
                  Array.isArray(post.tags) &&
                  (post.tags as string[]).length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h3 className="text-sm font-bold text-slate-900 mb-2">
                        标签
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(post.tags as string[]).map(
                          (tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 rounded text-xs text-slate-600"
                            >
                              #{tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Admin actions */}
                {isAdmin && (
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <h3 className="text-sm font-bold text-amber-800 mb-2 inline-flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      管理员操作
                    </h3>
                    <div className="space-y-1.5">
                      <Link
                        href="/admin/community/posts"
                        className="block text-sm text-amber-700 hover:text-amber-900"
                      >
                        帖子管理面板
                      </Link>
                      <Link
                        href={`/bbs/${slug}/edit`}
                        className="block text-sm text-amber-700 hover:text-amber-900"
                      >
                        编辑此帖
                      </Link>
                    </div>
                  </div>
                )}

                {/* Content Status Timeline */}
                <PostTimeline slug={slug} canView={isAdmin || post?.userId === session?.user?.id} />

                {/* Related tools */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 inline-flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-brand" />
                    相关工具
                  </h3>
                  <div className="space-y-1.5">
                    <Link
                      href="/tools/hs-code"
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand"
                    >
                      <Package className="w-4 h-4" /> HS 编码查询
                    </Link>
                    <Link
                      href="/tools/shipping-calculator"
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand"
                    >
                      <Ship className="w-4 h-4" /> 运费计算器
                    </Link>
                    <Link
                      href="/tools/postal-code"
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand"
                    >
                      <Mail className="w-4 h-4" /> 邮编查询
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
