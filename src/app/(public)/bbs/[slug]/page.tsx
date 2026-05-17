import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye, MessageSquare, Calendar, Lock, Pin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical, SITE_URL } from "@/lib/seo";
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
        user: { select: { id: true, name: true, email: true } },
        category: true,
        _count: { select: { comments: { where: { status: "published" } } } },
      },
    });

    if (!post) return null;
    if (post.status === "hidden" || post.status === "deleted") return null;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/bbs"
            className="inline-flex items-center gap-1.5 text-sm text-teal-100 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回论坛
          </Link>

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

          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
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
