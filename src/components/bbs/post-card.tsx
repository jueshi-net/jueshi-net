import Link from "next/link";
import { MessageSquare, Eye, Pin, Lock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import type { ForumPost, ForumCategory, User } from "@prisma/client";

interface PostCardProps {
  post: {
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
    createdAt: Date;
    user: Pick<User, "name" | "email">;
    category: Pick<ForumCategory, "name" | "color" | "iconText" | "key">;
  };
}

/**
 * PostCard — 帖子卡片组件
 */
export function PostCard({ post }: PostCardProps) {
  const displayName = post.user.name || maskEmail(post.user.email);
  const excerpt = post.excerpt || post.content.slice(0, 100);

  return (
    <Link
      href={`/bbs/${post.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:shadow-md hover:border-teal-200 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Left: content */}
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug flex-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {post.isPinned && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                  <Pin className="w-3 h-3" />
                  <span className="hidden sm:inline">置顶</span>
                </span>
              )}
              {post.isLocked && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
                  <Lock className="w-3 h-3" />
                  <span className="hidden sm:inline">锁定</span>
                </span>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {excerpt}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-400">
            {/* Category */}
            <CategoryBadge category={post.category} />

            {/* Author */}
            <span>{displayName}</span>

            {/* Time */}
            <time dateTime={post.createdAt.toISOString()}>
              {formatDateTime(post.createdAt)}
            </time>

            {/* Stats */}
            <span className="inline-flex items-center gap-1 ml-auto">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function maskEmail(email: string): string {
  if (!email) return "匿名用户";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
