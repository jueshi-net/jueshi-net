"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BbsToolLinkageProps {
  toolSlug: string;
  toolName: string;
}

interface ForumPost {
  id: string;
  title: string;
  authorName?: string;
  createdAt: string;
  replyCount?: number;
}

export default function BbsToolLinkage({ toolSlug, toolName }: BbsToolLinkageProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const resp = await fetch(`/api/forum/related?toolSlug=${encodeURIComponent(toolSlug)}&limit=5`);
        if (resp.ok) {
          const data = await resp.json();
          setPosts(data.posts || []);
        }
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [toolSlug]);

  const startDiscussion = () => {
    const title = encodeURIComponent(`[工具求助] ${toolName}使用问题`);
    const body = encodeURIComponent(`\n我在使用「${toolName}」时遇到了问题：\n\n请描述您的问题...\n\n---\n工具页面：/tools/documents/${toolSlug}`);
    window.location.href = `/bbs/new?title=${title}&body=${body}&category=trade-documents&toolContext=${toolSlug}`;
  };

  return (
    <div className="mt-6" data-testid="tool-related-discussions">
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">💬 相关讨论</h3>
          <button
            onClick={startDiscussion}
            data-testid="tool-start-discussion"
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
          >
            发起讨论 →
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">加载中...</div>
        ) : posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/bbs/post/${post.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
              >
                <p className="text-sm font-medium text-gray-800">{post.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {post.authorName || "匿名用户"} · {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  {post.replyCount ? ` · ${post.replyCount} 回复` : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-3">还没有相关讨论</p>
            <button
              onClick={startDiscussion}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              成为第一个提问的人 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
