import Link from "next/link";
import { MessageSquare, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

async function getRelatedPosts(postId: string, categoryId: string, tags: string[] | null) {
  try {
    // Find posts in the same category, excluding the current post
    // Prioritize posts with matching tags
    const related = await prisma.forumPost.findMany({
      where: {
        id: { not: postId },
        status: "published",
        categoryId,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        commentCount: true,
        viewCount: true,
        createdAt: true,
        isFeatured: true,
        tags: true,
        user: { select: { name: true } },
      },
    });

    // Sort by tag overlap (more matching tags = higher relevance)
    if (tags && tags.length > 0 && related.length > 0) {
      const tagSet = new Set(tags);
      related.sort((a, b) => {
        const aTags = Array.isArray(a.tags) ? (a.tags as string[]).filter((t) => tagSet.has(t)).length : 0;
        const bTags = Array.isArray(b.tags) ? (b.tags as string[]).filter((t) => tagSet.has(t)).length : 0;
        if (aTags !== bTags) return bTags - aTags;
        return b.viewCount - a.viewCount;
      });
    }

    return related.slice(0, 4);
  } catch {
    return [];
  }
}

export async function RelatedPosts({
  postId,
  categoryId,
  tags,
}: {
  postId: string;
  categoryId: string;
  tags: string[] | null;
}) {
  const related = await getRelatedPosts(postId, categoryId, tags);

  if (related.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">
        相关帖子
      </h3>
      <div className="space-y-3">
        {related.map((post) => (
          <Link
            key={post.id}
            href={`/bbs/${post.slug}`}
            className="block group"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{post.user?.name || "匿名"}</span>
                  <time>{formatDateTime(post.createdAt)}</time>
                  <span className="inline-flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" />
                    {post.commentCount}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {post.viewCount}
                  </span>
                </div>
              </div>
              {post.isFeatured && (
                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
                  精华
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
