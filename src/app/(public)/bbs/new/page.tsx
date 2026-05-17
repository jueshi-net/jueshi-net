import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildTitle, buildCanonical } from "@/lib/seo";
import PostForm from "@/components/bbs/post-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("发布帖子"),
  description: "在海外百宝箱社区发布新帖子",
  alternates: { canonical: buildCanonical("/bbs/new") },
  robots: {
    index: false,
    follow: false,
  },
};

async function getActiveCategories() {
  try {
    const cats = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        key: true,
        name: true,
        iconText: true,
      },
    });
    return cats;
  } catch {
    return [];
  }
}

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/bbs/new");
  }

  const categories = await getActiveCategories();

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            暂无可用分类
          </h1>
          <p className="text-gray-500 mb-6">请联系管理员启用论坛分类</p>
          <Link
            href="/bbs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700"
          >
            返回论坛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/bbs"
            className="inline-flex items-center gap-1.5 text-sm text-teal-100 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回论坛
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-teal-100 border border-white/10 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>发布新帖</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">发布帖子</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-5 pb-16 relative z-10">
        <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {/* Tips */}
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 mb-6">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">
              📌 发帖须知
            </h3>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• 标题 5-80 字，内容 10-3000 字</li>
              <li>• 不支持 HTML 格式，纯文本即可</li>
              <li>• 普通用户发帖需审核后显示</li>
              <li>• 每日最多发布 5 条帖子</li>
              <li>• 请勿发布违规、广告或侵权内容</li>
            </ul>
          </div>

          <PostForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
