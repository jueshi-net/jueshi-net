import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye, MessageSquare, Calendar, Lock, Pin, Home, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical, SITE_URL, discussionForumPostingJsonLd } from "@/lib/seo";
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
        user: { select: { id: true, name: true, email: true, levelKey: true, growthValue: true } },
        category: true,
        _count: { select: { comments: { where: { status: "published" } } } },
      },
    });

    if (!post) return null;
    // Only published posts are publicly viewable
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
        user: { select: { name: true, email: true } },
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
    // Ignore increment errors
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

  // Increment view count (fire-and-forget)
  await incrementViewCount(slug);

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const displayName = post.user.name || maskEmail(post.user.email);
  const plainText = post.content.replace(/<[^>]+>/g, '').slice(0, 200);
  const jsonLd = discussionForumPostingJsonLd({
    headline: post.title,
    description: post.excerpt || plainText,
    url: buildCanonical(`/bbs/${post.slug}`),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    authorName: displayName,
    commentCount: comments.length,
    viewCount: post.viewCount,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-teal-100/80 mb-4 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <span>/</span>
            <Link href="/bbs" className="hover:text-white transition-colors">
              社区论坛
            </Link>
            <span>/</span>
            <Link href={`/bbs/category/${post.category.key}`} className="hover:text-white transition-colors">
              {post.category.name}
            </Link>
          </nav>

          {/* Category + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CategoryBadge category={post.category} size="md" />
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100/80 text-red-200 border border-red-200/50">
                <Pin className="w-3.5 h-3.5" />
                置顶
              </span>
            )}
            {post.isLocked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
                <Lock className="w-3.5 h-3.5" />
                已锁定
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight break-words">
            {post.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-5 pb-16 relative z-10">
        {/* Meta bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-medium text-teal-700">
                {displayName[0].toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{displayName}</span>
            </div>

            {/* Time */}
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.createdAt.toISOString()}>
                {formatDateTime(post.createdAt)}
              </time>
            </span>

            {/* Stats */}
            <span className="inline-flex items-center gap-1 ml-auto">
              <Eye className="w-4 h-4" />
              {post.viewCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {comments.length}
            </span>
          </div>
        </div>

        {/* Post content */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-8 shadow-sm">
          <PostContent content={post.content} />
        </div>

        {/* Author info card */}
        <AuthorInfoCard post={post} />

        {/* Related links */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-5">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bbs"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" /> 返回论坛首页
            </Link>
            <Link
              href={`/bbs/category/${post.category.key}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors min-h-[44px]"
            >
              返回「{post.category.name}」
            </Link>
            <Link
              href="/bbs/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]"
            >
              发布新帖
            </Link>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-8 shadow-sm mt-5">
          <CommentSection
            postId={post.id}
            slug={post.slug}
            initialComments={comments}
            isLocked={isLocked}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  if (!email) return "匿名用户";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

async function AuthorInfoCard({ post }: { post: any }) {
  const displayName = post.user.name || maskEmail(post.user.email);
  let levelInfo: { name: string; color: string; iconText: string } | null = null;
  try {
    const level = await prisma.userLevel.findUnique({
      where: { key: post.user.levelKey },
      select: { name: true, color: true, iconText: true },
    });
    if (level) levelInfo = level;
  } catch {
    // ignore
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700 shrink-0">
          {displayName[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{displayName}</span>
            {levelInfo && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${levelInfo.color}/10 text-${levelInfo.color} border border-${levelInfo.color}/20`}>
                {levelInfo.iconText} {levelInfo.name}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            成长值 {post.user.growthValue || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
