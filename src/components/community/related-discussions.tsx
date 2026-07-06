import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MessageSquare, ArrowRight } from "lucide-react";

export async function RelatedDiscussions({ tool, limit = 3 }: { tool: string; limit?: number }) {
  let posts = [];
  try {
    posts = await prisma.forumPost.findMany({
      where: {
        status: "published",
        relatedTool: tool,
      },
      include: {
        user: { select: { name: true, image: true } },
        category: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    // Database not available during build or runtime error
    console.error('Failed to fetch related discussions:', error);
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">相关讨论</h3>
        <p className="text-xs text-gray-400 mb-3">还没有相关讨论</p>
        <Link
          href={`/community/new?tool=${encodeURIComponent(tool)}`}
          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
        >
          发起讨论 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">相关讨论</h3>
        <Link
          href={`/community/new?tool=${encodeURIComponent(tool)}`}
          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
        >
          发起讨论 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/community/t/${post.slug}`}
            className="block rounded-lg hover:bg-gray-50 p-2 transition"
          >
            <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span>{post.user.name || "匿名"}</span>
              <span className="inline-flex items-center gap-0.5">
                <MessageSquare className="w-3 h-3" />
                {post._count.comments}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gray-100">{post.category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
