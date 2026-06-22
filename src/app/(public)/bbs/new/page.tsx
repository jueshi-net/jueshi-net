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
  title: buildTitle("发布新帖"),
  description: "在绝世百宝箱社区发布新帖子",
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark"
          >
            返回论坛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand via-brand-light to-accent text-white py-6 md:py-8">
        <div className="max-w-[1000px] mx-auto px-4">
          <Link
            href="/bbs"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            返回论坛
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/10 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>发布新帖</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">发布新帖</h1>
          <p className="text-sm text-white/80 mt-1">
            选择分类 · 填写标题和内容 · 提交后等待审核
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 -mt-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main form area */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-7 shadow-sm">
            <PostForm categories={categories} />
          </div>

          {/* Sidebar: posting rules */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-800 mb-2">
                  📌 发帖须知
                </h3>
                <ul className="text-xs text-amber-700 space-y-1.5">
                  <li>• 标题 5-80 字</li>
                  <li>• 内容 10-3000 字（纯文本）</li>
                  <li>• 普通用户发帖需<strong>审核</strong>后展示</li>
                  <li>• 管理员帖子直接发布</li>
                  <li>• 每日最多发布 5 条</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">💬 社区规则</h3>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li>• 禁止广告、灰产、引战</li>
                  <li>• 禁止人身攻击</li>
                  <li>• 转载请注明出处</li>
                  <li>• 违规帖子将被删除</li>
                </ul>
                <Link href="/bbs" className="text-xs text-brand hover:underline mt-2 inline-block">
                  查看完整规则 →
                </Link>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">💡 发帖小贴士</h3>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li>• 选择合适的分类能让更多人看到</li>
                  <li>• 标题简洁明了，概括内容</li>
                  <li>• 内容详细，方便他人回复</li>
                  <li>• 发布后可在帖子页编辑</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Mobile rules (below form) */}
          <div className="lg:hidden">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-800 mb-2">📌 发帖须知</h3>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• 标题 5-80 字，内容 10-3000 字</li>
                <li>• 普通用户发帖需审核后展示</li>
                <li>• 禁止广告、灰产、引战内容</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
